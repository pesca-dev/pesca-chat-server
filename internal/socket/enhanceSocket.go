package socket

import (
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

// EnhanceSocket returns a wrapper around a classic websocket connection.
func EnhanceSocket(c *websocket.Conn) *PescaSocket {
	if c == nil {
		return nil
	}

	id := uuid.NewString()

	socket := &PescaSocket{
		c:        c,
		id:       id,
		handlers: make(map[string]func(m []byte)),
	}
	socket.Bind()
	return socket
}
