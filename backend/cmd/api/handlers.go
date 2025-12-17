package main

import (
	"encoding/json"
	"math/rand"
	"net/http"
	"time"

	"github.com/hjali7/go-shorter/internal/store"
)

type ShortenRequest struct {
	URL string `json:"url"`
}

type ShortenResponse struct {
	ShortCode string `json:"short_code"`
	ShortURL  string `json:"short_url"`
}

type App struct {
	Store  *store.Storage
	Domain string
}

func (app *App) ShortenHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req ShortenRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.URL == "" {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	code := generateShortCode()
	
	if err := app.Store.SaveLink(code, req.URL); err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	resp := ShortenResponse{
		ShortCode: code,
		ShortURL:  app.Domain + "/" + code,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}

func (app *App) RedirectHandler(w http.ResponseWriter, r *http.Request) {
	// گرفتن کد از URL (مثلاً /aX9z -> aX9z)
	code := r.URL.Path[1:]
	
	originalURL, err := app.Store.GetOriginalURL(code)
	if err != nil {
		http.Error(w, "Link not found", http.StatusNotFound)
		return
	}

	// ریدایرکت نهایی
	http.Redirect(w, r, originalURL, http.StatusFound)
}

// تابع کمکی تولید کد تصادفی
func generateShortCode() string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	rand.Seed(time.Now().UnixNano())
	b := make([]byte, 6)
	for i := range b {
		b[i] = charset[rand.Intn(len(charset))]
	}
	return string(b)
}