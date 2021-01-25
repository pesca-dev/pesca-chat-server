package server

import (
	"log"
	"net/http"

	"git.pesca.dev/pesca-dev/pesca-chat-server/internal/socket"
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
func makeCreateServer(addr string) func() *server {
	var upgrader = websocket.Upgrader{}

	handleRoot := func(w http.ResponseWriter, r *http.Request) {
		c, err := upgrader.Upgrade(w, r, nil)

		if err != nil {
			log.Print("An error during upgrading: ", err)
			c.Close()
			return
		}

		socket := socket.EnhanceSocket(c)
		defer socket.Close(-1, "Socket closed manually")
		socket.Start()
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
