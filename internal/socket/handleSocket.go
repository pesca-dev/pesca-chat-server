package socket

import (
	"log"

	"github.com/gorilla/websocket"
)

// MakeHandleSocket is a factory function for handleSocket, which handles incomming socket connections.
func MakeHandleSocket(enhanceSocket func(c *websocket.Conn) PescaSocket) func(c *websocket.Conn) {
	return func(c *websocket.Conn) {
		sock := enhanceSocket(c)
		for {
			messageType, message, err := c.ReadMessage()

			if err != nil {
				log.Println("Error during reading from websocket: ", err)
				break
			}

			log.Printf("Received: [%d] %s", messageType, message)
			sock.send("[1, 2, 3]")
			// err = c.WriteMessage(messageType, message)

			if err != nil {
				log.Println("Error during writing: ", err)
				break
			}
		}
	}
}
