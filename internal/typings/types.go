package typings

import "git.pesca.dev/pesca-dev/pesca-chat-server/internal/events"

// GeneralSocket .
type GeneralSocket interface {
	Send(event string, payload interface{})
	GetID() string
}

// GeneralChannel .
type GeneralChannel interface {
	Add(socket GeneralSocket) error
	Remove(id string)
	Broadcast(message events.MessageResponsePayload)
}
