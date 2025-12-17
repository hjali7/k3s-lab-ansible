package store

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	_ "github.com/lib/pq" 
)

type Storage struct {
	DB *sql.DB
}

func NewPostgresDB(connStr string) (*Storage, error) {
	var db *sql.DB
	var err error

	for i := 0 ; i < 10 ; i++ {
		db, err = sql.Open("postgres", connStr)
		if err == nil {
			if err = db.Ping(); err == nil {
				log.Println("Successfully connected to Database")
				return &Storage{DB: db}, nil
			}
			log.Printf("Waiting for DB ...(%d/10)",i+1)
			time.Sleep(2 * time.Second)
		}
	}
	return nil, fmt.Errorf("could not connect to database: %v",err)
}

func (s *Storage) InitializeTable() error {
	query := `CREATE TABLE IF NOT EXISTS links (
		id SERIAL PRIMARY KEY,
		short_code VARCHAR(10) UNIQUE NOT NULL,
		original_url TEXT NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);`

	_,err := s.DB.Exec(query)
	return err
}


func (s *Storage) SaveLink(shortCode , originalURL string) error {
	stmt := `INSERT INTO links (short_code, original_url) VALUES ($1, $2)`
	_, err := s.DB.Exec(stmt, shortCode, originalURL)
	return err
}

func (s *Storage) GetOriginalURL(shortCode string) (string, error) {
	var originalURL string
	stmt := `SELECT original_url FROM links WHERE short_code = $1`
	err := s.DB.QueryRow(stmt, shortCode).Scan(&originalURL)
	if err != nil {
		return "", err
	}
	return originalURL, nil
}