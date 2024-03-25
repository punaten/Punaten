package db

import (
	"context"
	"database/sql"
	"log"
	"os"

	_ "github.com/microsoft/go-mssqldb"
)

func Azure_db() *sql.DB {
	db_str := os.Getenv("DB_STRING")

	var err error
	// Create connection pool
	db, err := sql.Open("sqlserver", db_str)
	if err != nil {
		log.Fatal("Error creating connection pool: ", err.Error())
	}
	ctx := context.Background()
	err = db.PingContext(ctx)
	if err != nil {
		log.Fatal(err.Error())
	}
	return db
}
