package db

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/lib/pq"
)

func GetPSQLDB() *sql.DB {
	db_str := os.Getenv("DB_STRING")
	db, err := sql.Open("postgres", db_str)
	if err != nil {
		log.Fatalf("main sql.Open error err:%v", err)
	}
	return db
}
