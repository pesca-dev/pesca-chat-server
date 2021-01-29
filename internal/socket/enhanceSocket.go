package socket

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

// PescaSocket is a wrapper around a classic websocket connection.
type PescaSocket struct {
	c  *websocket.Conn
	id string
	// TODO lome: use slice
	handlers map[string]func(m []byte)
}

// Send an event + payload message of the websocket.
func (s *PescaSocket) Send(event string, payload interface{}) {
	message := BaseEvent{
		Event:   event,
		Payload: payload,
	}
	buff, err := json.Marshal(message)
	if err != nil {
		log.Printf("json.Marshal: %v", err)
	}
	if err = s.c.WriteMessage(websocket.TextMessage, buff); err != nil {
		log.Printf("socket.WriteMessage: %v", err)
	}
}

// Close the socket and send error message to user.
func (s *PescaSocket) Close(code int, text string) {
	payload := ErrorMessagePayload{
		Code:    code,
		Message: text,
	}
	s.Send("error", payload)
	s.c.Close()
	s.onClose(code, text)
}

// Bind all relevant things for PescaSocket.
func (s *PescaSocket) Bind() {
	s.c.SetCloseHandler(s.onClose)
	s.on("login:request", s.onLoginRequest)
	s.on("message:send", s.onMessageSend)
}

// Handle the on close event.
func (s *PescaSocket) onClose(code int, text string) error {
	// TODO lome: Add logic that needs to be executed upon closing of channel.
	return nil
}

// GetConn returns the current connection.
func (s *PescaSocket) GetConn() *websocket.Conn {
	return s.c
}

// Start starts . :))
func (s *PescaSocket) Start() {
	for {
		t, m, err := s.c.ReadMessage()
		if err != nil {
			log.Println("Error during reading from websocket: ", err)
			return
		}
		s.decode(t, m)
	}
}

// Decode the payload that arrived over the websocket.
func (s *PescaSocket) decode(t int, m []byte) {
	switch t {
	case websocket.TextMessage:
		s.handleTextMessage(t, m)
	}
}

// Handle an incomming text message.
func (s *PescaSocket) handleTextMessage(t int, m []byte) {
	var baseEvent BaseEvent
	if err := json.Unmarshal(m, &baseEvent); err != nil {
		log.Printf("json.Unmarshal: %v", err)
		s.Close(http.StatusBadRequest, err.Error())
		return
	}
	s.emit(baseEvent.Event, m)
}

// Register a handler for a specific event.
func (s *PescaSocket) on(event string, fn func(m []byte)) {
	// TODO lome: channels?
	s.handlers[event] = fn
}

// Emit a message on the socket.
func (s *PescaSocket) emit(event string, m []byte) {
	if s.handlers[event] != nil {
		// TODO lome: goroutines?
		s.handlers[event](m)
	}
}

// Handle login event.
func (s *PescaSocket) onLoginRequest(m []byte) {
	var req LoginRequest
	if err := json.Unmarshal(m, &req); err != nil {
		s.Send("error", ErrorMessagePayload{
			Code:    http.StatusBadRequest,
			Message: "Invalid login request",
		})
		return
	}
	// TODO lome: Handle login (maybe via s.login)
}

// Handle message event.
func (s *PescaSocket) onMessageSend(m []byte) {
	var req MessageReceive
	if err := json.Unmarshal(m, &req); err != nil {
		s.Send("error", ErrorMessagePayload{
			Code:    http.StatusBadRequest,
			Message: "Invalid message send",
		})
		return
	}
}

// EnhanceSocket returns a wrapper around a classic websocket connection.
func EnhanceSocket(c *websocket.Conn) *PescaSocket {
	if c == nil {
		return nil
	}

	id := uuid.NewString()

	socket := &PescaSocket{
		c:  c,
		id: id,
	}
	socket.Bind()
	return socket
}
