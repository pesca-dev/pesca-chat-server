package main

import (
	"git.pesca.dev/pesca-dev/pesca-chat-server/internal/server"
	"git.pesca.dev/pesca-dev/pesca-chat-server/internal/socket"
)

func main() {

	handleSocket := socket.MakeHandleSocket()
	server := server.MakeServer(handleSocket)
	server()
}
