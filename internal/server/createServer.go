package server

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

// server is the general struct for containing the server.
type server struct {
	srv *http.Server
}

func (s *server) Start() {
	err := s.srv.ListenAndServe()
	if err != nil {
		log.Fatalf("Error during listening: %v", err)
	}
}

// makeCreateServer is a factory function for the createServer function.
func makeCreateServer(addr string, handleSocket func(c *websocket.Conn)) func() *server {
	var upgrader = websocket.Upgrader{}

	handleRoot := func(w http.ResponseWriter, r *http.Request) {
		c, err := upgrader.Upgrade(w, r, nil)
		defer c.Close()

		if err != nil {
			log.Print("An error during upgrading: ", err)
			return
		}
		handleSocket(c)
	}

	return func() *server {

		mux := http.NewServeMux()
		mux.HandleFunc("/", handleRoot)

		srv := &http.Server{
			Addr:    addr,
			Handler: mux,
		}

		return &server{
			srv,
		}
	}
}
