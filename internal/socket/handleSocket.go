package socket

import (
	"encoding/json"
	"log"

	"github.com/gorilla/websocket"
)

// MakeHandleSocket is a factory function for handleSocket, which handles incomming socket connections.
func MakeHandleSocket(enhanceSocket func(c *websocket.Conn) PescaSocket) func(c *websocket.Conn) {
	return func(c *websocket.Conn) {
		socket := enhanceSocket(c)

		for {
			_, m, err := c.ReadMessage()
			if err != nil {
				log.Println("Error during reading from websocket: ", err)
				return
			}

			// Decode initial baseEvent
			var baseEvent BaseEvent
			err = json.Unmarshal(m, &baseEvent)

			if err != nil {
				log.Printf("error: %v", err)
				return
			}

			socket.handle(baseEvent.Event, m)
		}
	}
}
