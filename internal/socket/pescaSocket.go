package socket

// PescaSocket is a wrapper around a normal websocket connection with some extra functionality.
type PescaSocket interface {
	// A function for sending a normal text message to the client.
	send(msg string)
}
