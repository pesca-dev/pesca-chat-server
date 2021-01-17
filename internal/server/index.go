package server

// MakeServer creates the server module
func MakeServer() func() {
	return func() {
		createServer := makeCreateServer(MakeCreateServerOptions{
			addr: "localhost:8080",
		})
		server := createServer()
		server.Start()
	}
}
