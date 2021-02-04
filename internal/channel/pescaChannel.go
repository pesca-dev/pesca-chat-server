package channel

import (
	"errors"

	"git.pesca.dev/pesca-dev/pesca-chat-server/internal/events"
	"git.pesca.dev/pesca-dev/pesca-chat-server/internal/typings"
)

// PescaChannel is a basic channel for sending messages.
type PescaChannel struct {
	sockets map[string]typings.GeneralSocket
}

// Add a new socket to this channel.
func (c *PescaChannel) Add(socket typings.GeneralSocket) error {
	if socket.GetID() == "" {
		return errors.New("id of socket has to be not empty")
	}
	c.sockets[socket.GetID()] = socket
	return nil
}

// Remove the socket with the given id from this channel.
func (c *PescaChannel) Remove(id string) {
	delete(c.sockets, id)
}

// Broadcast a message to all sockets in this channel.
func (c *PescaChannel) Broadcast(message events.MessageResponsePayload) {
	for _, v := range c.sockets {
		v.Send("message:send", message)
	}
}
