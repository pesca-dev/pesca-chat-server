package server

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

// server is the general struct for containing the server.
type server struct {
	Start func()
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

	return func() server {
		http.HandleFunc("/", handleRoot)

		Start := func() {
			log.Fatal(http.ListenAndServe(addr, nil))
		}

		return server{
			Start,
		}
	}
}
