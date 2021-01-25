package main

import (
	"git.pesca.dev/pesca-dev/pesca-chat-server/internal/server"
)

func main() {
	server := server.MakeServer()
	server()
}
