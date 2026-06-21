package main

import (
	"log"
	"net/http"
	"os"

	"github.com/python-discord/obrero/obrero"
)

func main() {
	if os.Getenv("INVOCATION_ID") != "" {
		// Running under systemd. My condolences.
		log.SetFlags(0)
	}
	mux := http.NewServeMux()
	mux.HandleFunc("csp.pythondiscord.com/", obrero.ReportURI)
	mux.HandleFunc("GET /robots.txt", obrero.ServeRobots)
	server := obrero.LoggingHttpHandler(mux)
	http.ListenAndServe("localhost:8500", server)
}
