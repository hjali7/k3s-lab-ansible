package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/hjali7/go-shorter/internal/store"
)

func main() {
	dbHost := os.Getenv("DB_HOST")
	dbUser := os.Getenv("DB_USER")
	dbPass := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	port := os.Getenv("APP_PORT")
	domain := os.Getenv("APP_DOMAIN")

	if port == "" { port = "8080" }
	if domain == "" { domain = "http://localhost:8080" }

	connStr := fmt.Sprintf("host=%s user=%s password=%s dbname=%s sslmode=disable",
		dbHost, dbUser, dbPass, dbName)

	storage, err := store.NewPostgresDB(connStr)
	if err != nil {
		log.Fatal(err)
	}
	
	if err := storage.InitializeTable(); err != nil {
		log.Fatal("Migration failed:", err)
	}

	app := &App{
		Store:  storage,
		Domain: domain,
	}

	http.HandleFunc("/shorten", enableCORS(app.ShortenHandler))
	http.HandleFunc("/", enableCORS(app.RedirectHandler))

	log.Printf("🚀 Server starting on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func enableCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next(w, r)
	}
}