package socket

// PescaSocket is a wrapper around a normal websocket connection with some extra functionality.
type PescaSocket interface {
	// A function for sending a normal text message to the client.
	send(msg string)
	// Try to login.
	login(username string, password string) error
	// Return, if current socket is logged in.
	isLoggedIn() bool
	// Emit an event on the socket.
	emit(event string, payload interface{})
	// Handle an event on the socket.
	handle(event string, message []byte)
	// Send an error over the socket and close it.
	err(msg string)
	// Get the of the socket.
	getID() string
}
