package server

import (
	"github.com/gorilla/websocket"
)

// MakeServer creates the server module
func MakeServer(handleSocket func(c *websocket.Conn)) func() {
	return func() {
		createServer := makeCreateServer(":8080", handleSocket)
		server := createServer()
		server.Start()
	}
}
