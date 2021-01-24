package main

import (
	"git.pesca.dev/pesca-dev/pesca-chat-server/internal/server"
	"git.pesca.dev/pesca-dev/pesca-chat-server/internal/socket"
)

func main() {

	enhanceSocket := socket.MakeEnhanceSocket()
	handleSocket := socket.MakeHandleSocket(enhanceSocket)
	server := server.MakeServer(handleSocket)
	server()
}
