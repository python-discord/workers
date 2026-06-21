package obrero

import (
	"log"
	"net/http"
	"time"
)

// Source - https://stackoverflow.com/a/53272925
// Posted by huangapple, modified by community. See post 'Timeline' for change history
// Retrieved 2026-06-17, License - CC BY-SA 4.0

// This allows us to store the status code that was returned for logging purposes.
type loggingResponseWriter struct {
	http.ResponseWriter
	statusCode int
}

func NewLoggingResponseWriter(w http.ResponseWriter) *loggingResponseWriter {
	return &loggingResponseWriter{w, http.StatusOK}
}

func (lrw *loggingResponseWriter) WriteHeader(code int) {
	lrw.statusCode = code
	lrw.ResponseWriter.WriteHeader(code)
}

func (lrw *loggingResponseWriter) Unwrap() http.ResponseWriter {
	return lrw.ResponseWriter
}

// Wraps a `http.Handler` to cause any responses on said handler
// to be logged.
func LoggingHttpHandler(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		lrw := NewLoggingResponseWriter(w)
		start := time.Now()
		h.ServeHTTP(lrw, req)
		end := time.Now()
		elapsed := end.Sub(start)

		log.Println(req.Method, req.URL.Path, req.Proto, lrw.statusCode, elapsed.String())
	})
}
