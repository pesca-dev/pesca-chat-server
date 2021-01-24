package socket

import "github.com/gorilla/websocket"

type pescaSocketImpl struct {
	c *websocket.Conn
}

func (s *pescaSocketImpl) send(msg string) {
	s.c.WriteMessage(websocket.TextMessage, []byte(msg))
}

// MakeEnhanceSocket is a factory function for creating a functio, which enhances an existing websocket with extra functionality.
func MakeEnhanceSocket() func(c *websocket.Conn) PescaSocket {
	return func(c *websocket.Conn) PescaSocket {
		return &pescaSocketImpl{
			c,
		}
	}
}
