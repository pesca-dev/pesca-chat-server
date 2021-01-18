package server

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

// server is the general struct for containing the server.
type server struct {
	addr string
}

func (s *server) Start() {
	log.Fatal(http.ListenAndServe(s.addr, nil))
}

// makeCreateServer is a factory function for the createServer function.
func makeCreateServer(addr string) func() server {
	var upgrader = websocket.Upgrader{}

	handleRoot := func(w http.ResponseWriter, r *http.Request) {
		c, err := upgrader.Upgrade(w, r, nil)
		defer c.Close()

		if err != nil {
			log.Print("An error during upgrading: ", err)
			return
		}

		for {
			messageType, message, err := c.ReadMessage()

			if err != nil {
				log.Println("Error during reading from websocket: ", err)
				break
			}

			log.Printf("Received: %s", message)
			err = c.WriteMessage(messageType, message)

			if err != nil {
				log.Println("Error during writing: ", err)
				break
			}
		}
	}

	http.HandleFunc("/", handleRoot)

	return func() server {
		return server{
			addr,
		}
	}
}
