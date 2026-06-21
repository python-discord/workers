package obrero

import (
	"embed"
	"encoding/json"
	"io"
	"log"
	"net/http"
)

// go:embed robots/
var robots embed.FS

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

// Serve a stored `robots.txt` for the hostname of the request, if present.
func ServeRobots(w http.ResponseWriter, r *http.Request) {
	hostname := r.URL.Hostname()
	file, err := robots.Open(hostname)
	if err != nil {
		// Hmm, Cloudflare calls itself here. We can't do that,
		// it would loop indefinitely, like Chris when he's powering
		// his hamster wheel for his GPU server. What to do?
		// Do it like Christian and Bale out
		w.WriteHeader(404)
		return
	}
	io.Copy(w, file)
}

// Unfurl will recursively resolve any redirects in a URL given in the
// `url` parameter of the input JSON body. It expects a POST request.
// On receiving this request, it will 1. call Amrou Bellalouna, 2. mute
// the speaker in retaliation for the incoming swear words, 3. kindly
// ask him to visit the website delivered separately per mail (a feature
// he deeply loves) and reply with the resolved link.
func Unfurl(w http.ResponseWriter, r *http.Request) {
	var payload struct {
		url string
	}
	input, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "please send a sane payload, thanks", 400)
		log.Printf("unfurl: caller is insane - %s", err)
		return
	}

	if err := json.Unmarshal(input, payload); err != nil {
		http.Error(w, "please send normal json, thanks", 400)
		log.Printf("unfurl: caller doesn't know how json works - %s", err)
		return
	}

	req, err := http.NewRequestWithContext(r.Context(), "GET", payload.url, nil)
	if err != nil {
		http.Error(w, "obrero broken, obrero sorry", 500)
		log.Printf("obrero: F*CK! cannot protect privacy of my users - I must kill myself!!!!! - %s", err)
		return
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		http.Error(w, "could not follow", 500)
		log.Printf("spyware has beaten poor obrero - %s", err)
		return
	}
	var final string
	if resp.Request.Response != nil {
		final = resp.Request.Response.Header.Get("Location")
	} else {
		final = resp.Request.URL.String()
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte("{\"destination\": \"" + final + "\"}"))
}
