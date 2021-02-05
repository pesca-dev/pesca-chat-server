package socket

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"git.pesca.dev/pesca-dev/pesca-chat-server/internal/events"
	"git.pesca.dev/pesca-dev/pesca-chat-server/internal/typings"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

// PescaSocket is a wrapper around a classic websocket connection.
type PescaSocket struct {
	c  *websocket.Conn
	id string
	// TODO lome: use slice
	handlers map[string]func(m []byte)
	user     userData
	channel  typings.GeneralChannel
}

type userData struct {
	username string
	ID       string
}

// GetID returns the id of this PescaSocket.
func (s PescaSocket) GetID() string {
	return s.id
}

// Send an event + payload message of the websocket.
func (s *PescaSocket) Send(event string, payload interface{}) {
	message := events.BaseEvent{
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
	payload := events.ErrorMessagePayload{
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
	s.channel.Remove(s.id)
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
	var baseEvent events.BaseEvent
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
	var req events.LoginRequest
	if err := json.Unmarshal(m, &req); err != nil {
		s.Send("error", events.ErrorMessagePayload{
			Code:    http.StatusBadRequest,
			Message: "Invalid login request",
		})
		return
	}
	suc := s.login(req.Payload.Username, req.Payload.Password)
	id := "-1"
	if suc {
		id = s.user.ID
	}
	s.Send("login:response", events.LoginResponsePayload{
		Success: suc,
		ID:      id,
	})
}

// Try to login with given username and password.
func (s *PescaSocket) login(username string, password string) bool {
	s.user = userData{
		username: username,
		ID:       uuid.NewString(),
	}
	return true
}

// IsLoggedIn returns true if the current socket is logged in, false otherwise.
func (s *PescaSocket) IsLoggedIn() bool {
	return s.user.ID != ""
}

// Handle message event.
func (s *PescaSocket) onMessageSend(m []byte) {
	if !s.IsLoggedIn() {
		return
	}
	var req events.MessageReceive
	if err := json.Unmarshal(m, &req); err != nil {
		s.Send("error", events.ErrorMessagePayload{
			Code:    http.StatusBadRequest,
			Message: "Invalid message send",
		})
		return
	}
	log.Printf("[%s] %s: \"%s\"", s.id, s.user.username, req.Payload.Message.Content)

	// Create message object.
	resp := events.MessageResponsePayload{
		Author: events.MessageAuthor{
			Username: s.user.username,
			ID:       s.user.ID,
		},
		Message: events.MessageObject{
			Content: req.Payload.Message.Content,
			Date:    time.Now().Unix(),
		},
	}
	s.channel.Broadcast(resp)
}
