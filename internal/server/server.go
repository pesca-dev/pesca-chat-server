package server

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var addr = "localhost:8080"

var upgrader = websocket.Upgrader{}

func handleRoot(w http.ResponseWriter, r *http.Request) {
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

// Server does magic
func Server() {
	http.HandleFunc("/", handleRoot)
	log.Fatal(http.ListenAndServe(addr, nil))
}
