package server

import (
	"log"
	"net/http"

	"git.pesca.dev/pesca-dev/pesca-chat-server/internal/channel"
	"git.pesca.dev/pesca-dev/pesca-chat-server/internal/socket"
	"github.com/gorilla/websocket"
)

// makeCreateServer is a factory function for the createServer function.
func makeCreateServer(addr string) func() *Server {
	var upgrader = websocket.Upgrader{}

	channel := channel.CreateChannel()

	handleRoot := func(w http.ResponseWriter, r *http.Request) {
		c, err := upgrader.Upgrade(w, r, nil)

		if err != nil {
			log.Print("An error during upgrading: ", err)
			c.Close()
			return
		}

		socket := socket.EnhanceSocket(c, &channel)
		defer socket.Close(-1, "Socket closed manually")
		socket.Start()
	}

	return func() *Server {

		mux := http.NewServeMux()
		mux.HandleFunc("/", handleRoot)

		srv := &http.Server{
			Addr:    addr,
			Handler: mux,
		}

		return &Server{
			srv,
		}
	}
}
