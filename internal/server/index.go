package server

// MakeServer creates the server module
func MakeServer() func() {
	return func() {
		createServer := makeCreateServer(":8080")
		server := createServer()
		server.Start()
	}
}
