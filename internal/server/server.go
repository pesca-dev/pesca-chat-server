package server

import (
	"log"
	"net/http"
)

// Server is the general struct for containing the Server.
type Server struct {
	srv *http.Server
}

// Start the server and listen to provided address.
func (s *Server) Start() {
	err := s.srv.ListenAndServe()
	if err != nil {
		log.Fatalf("Error during listening: %v", err)
	}
}
