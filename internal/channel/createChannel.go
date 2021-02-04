package channel

import "git.pesca.dev/pesca-dev/pesca-chat-server/internal/typings"

// CreateChannel creates a new channel.
func CreateChannel() PescaChannel {
	return PescaChannel{
		sockets: make(map[string]typings.GeneralSocket),
	}
}
