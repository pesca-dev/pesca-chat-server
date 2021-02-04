package socket

import (
	"git.pesca.dev/pesca-dev/pesca-chat-server/internal/typings"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

// EnhanceSocket returns a wrapper around a classic websocket connection.
func EnhanceSocket(c *websocket.Conn, channel typings.GeneralChannel) *PescaSocket {
	if c == nil {
		return nil
	}

	id := uuid.NewString()

	socket := &PescaSocket{
		c:        c,
		id:       id,
		handlers: make(map[string]func(m []byte)),
		channel:  channel,
	}
	channel.Add(socket)
	socket.Bind()
	return socket
}
