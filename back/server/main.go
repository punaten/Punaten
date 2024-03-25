package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"cloud.google.com/go/storage"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/google/uuid"
	"github.com/punaten/Punaten/back/server/db"
	"github.com/punaten/Punaten/back/server/domain"
	"google.golang.org/api/option"

	_ "github.com/lib/pq"
)

const (
	bucketName = "punaten"
)

func main() {
	// migrate(pg_db, azure_db)
	r := chi.NewRouter()

	corsMiddleware := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"}, // すべてのオリジンを許可
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300, // プリフライトリクエストの結果をキャッシュする最大時間(秒)
	})

	// ミドルウェアを使用
	r.Use(corsMiddleware.Handler)

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

func getVideo(w http.ResponseWriter, r *http.Request) {
	db := db.Azure_db()
	defer db.Close()

	var video []domain.Video

	qRow, err := db.Query("SELECT * FROM video ORDER BY created_at")
	if err != nil {
		log.Fatalf("main db.QueryRow error err:%v", err)
	}

	for qRow.Next() {
		var v domain.Video
		err = qRow.Scan(&v.ID, &v.UserID, &v.Name, &v.CreatedAt)
		if err != nil {
			log.Fatalf("main db.QueryRow error err:%v", err)
		}
		video = append(video, v)
	}

	w.WriteHeader(http.StatusOK)

	// video to json
	JSON, _ := json.Marshal(video)

	w.Write([]byte(JSON))

}

func uploadFileForGCS(w http.ResponseWriter, r *http.Request) {
	db := db.Azure_db()
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

	err = db.QueryRow("INSERT INTO video (id, user_id, name) VALUES (@p1, @p2, @p3)", uuid_str, "1", uuid_str+handler.Filename).Err()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(uuid_str + handler.Filename))
}
