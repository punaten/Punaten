package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"cloud.google.com/go/storage"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/google/uuid"
	"google.golang.org/api/option"

	_ "github.com/lib/pq"
)

const (
	bucketName      = "punaten"
)

type Video struct {
	ID         string `json:"id" db:"id"`
	User_ID    string `json:"user_id" db:"user_id"`
	Name       string `json:"name" db:"name"`
	Created_at string `json:"created_at" db:"created_at"`
}

func main() {
	migrate()
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("welcome"))
	})
	r.Post("/upload", uploadFileForGCS)

	r.Get("/video", getVideo)

	log.Printf("Starting server on :3000")
	err := http.ListenAndServe(":3000", r)
	if err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func migrate() {
	db_str := os.Getenv("DB_STRING")
	db, err := sql.Open("postgres", db_str)
	if err != nil {
		log.Fatalf("main sql.Open error err:%v", err)
	}
	defer db.Close()

	_, err = db.Exec("CREATE TABLE IF NOT EXISTS video (id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), name VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")
	if err != nil {
		log.Fatalf("main db.Exec error err:%v", err)
	}
}

func getVideo(w http.ResponseWriter, r *http.Request) {
	db_str := os.Getenv("DB_STRING")
	db, err := sql.Open("postgres", db_str)
	if err != nil {
		log.Fatalf("main sql.Open error err:%v", err)
	}
	defer db.Close()

	var video Video

	err = db.QueryRow("SELECT * FROM video ORDER BY created_at DESC LIMIT 1").Scan(&video.ID, &video.User_ID, &video.Name, &video.Created_at)
	if err != nil {
		log.Fatalf("main db.QueryRow error err:%v", err)
	}

	w.WriteHeader(http.StatusOK)

	// video to json
	JSON, _ := json.Marshal(video)

	w.Write([]byte(JSON))

}

func uploadFileForGCS(w http.ResponseWriter, r *http.Request) {
	db_str := os.Getenv("DB_STRING")
	db, err := sql.Open("postgres", db_str)
	if err != nil {
		log.Fatalf("main sql.Open error err:%v", err)
	}
	defer db.Close()

	gcs_key := os.Getenv("GCS_KEY")
	fmt.Println(gcs_key)

	ctx := context.Background()
	client, err := storage.NewClient(ctx, option.WithCredentialsJSON([]byte(gcs_key)))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer client.Close()

	err = r.ParseMultipartForm(10 << 20) // 10MB
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	file, handler, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Error Retrieving the File", http.StatusBadRequest)
		return
	}
	defer file.Close()

	bucket := client.Bucket(bucketName)
	uuid_str := uuid.New().String()
	obj := bucket.Object(uuid_str + handler.Filename)
	wc := obj.NewWriter(ctx)
	if _, err := io.Copy(wc, file); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := wc.Close(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	err = db.QueryRow("INSERT INTO video(id, user_id, name) VALUES($1,$2,$3)", uuid_str, "1", uuid_str+handler.Filename).Err()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(uuid_str + handler.Filename))
}
