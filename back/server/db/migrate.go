package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/punaten/Punaten/back/server/domain"
)

func migrate(pgDB *sql.DB, msDB *sql.DB) {
	//	_, err := db.Exec(`CREATE TABLE [dbo].[video] (
	//		[id] VARCHAR(255) PRIMARY KEY,
	//		[user_id] VARCHAR(255),
	//		[name] VARCHAR(255),
	//		[created_at] DATETIME2 DEFAULT CURRENT_TIMESTAMP
	//	)
	//
	// `)
	// PostgreSQLからデータ読み込み
	rows, err := pgDB.Query("SELECT * FROM video")
	if err != nil {
		log.Fatal("Query failed:", err)
	}
	defer rows.Close()

	// データをSQL Serverに書き込み
	for rows.Next() {
		var video domain.Video
		err = rows.Scan(&video.ID, &video.UserID, &video.Name, &video.CreatedAt)
		if err != nil {
			log.Fatal("Scan failed:", err)
		}

		_, err = msDB.Exec("INSERT INTO video (id, user_id, name, created_at) VALUES (@p1, @p2, @p3, @p4)",
			video.ID, video.UserID, video.Name, video.CreatedAt)
		if err != nil {
			log.Fatal("Insert failed:", err)
		}
	}

	if err = rows.Err(); err != nil {
		log.Fatal("Error reading rows:", err)
	}

	fmt.Println("Migration completed successfully.")
}

func alldrop() {
	db_str := os.Getenv("DB_STRING")
	db, err := sql.Open("postgres", db_str)
	if err != nil {
		log.Fatalf("main sql.Open error err:%v", err)
	}
	defer db.Close()

	_, err = db.Exec("DROP TABLE video")
	if err != nil {
		log.Fatalf("main db.Exec error err:%v", err)
	}
}
