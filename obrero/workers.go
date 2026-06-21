package obrero

import (
	"io"
	"log"
	"net/http"
)

// This endpoint proxies CSP and other report URI requests over
// obrero to anonymise the origin.
func ReportURI(w http.ResponseWriter, r *http.Request) {
	uri := "https://pythondiscord.report-uri.com/" + r.URL.Path
	req, err := http.NewRequestWithContext(r.Context(), "POST", uri, r.Body)
	if err != nil {
		log.Printf("can't build new request to %s: %s", uri, err)
		w.WriteHeader(500)
		return
	}
	user_agent := r.Header.Get("User-Agent")
	if user_agent == "" {
		user_agent = "github.com/python-discord/obrero"
	}
	req.Header.Set("User-Agent", user_agent)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Printf("can't send report to the state at %s: %s", uri, err)
		w.WriteHeader(500)
		return
	}
	w.WriteHeader(resp.StatusCode)
	io.Copy(w, resp.Body) // I am so fucking smart
}
