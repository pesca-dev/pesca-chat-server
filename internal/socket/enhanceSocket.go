package socket

import (
	"encoding/json"
	"log"

	"github.com/gorilla/websocket"
)

type pescaSocketImpl struct {
	c        *websocket.Conn
	id       string
	loggedIn bool
	userData userData
}

type userData struct {
	ID       string
	username string
}

func (s *pescaSocketImpl) send(msg string) {
	s.c.WriteMessage(websocket.TextMessage, []byte(msg))
}

func (s *pescaSocketImpl) login(username string, password string) error {
	s.loggedIn = true
	id := "1"

	pl := LoginResponsePayload{
		Success: s.loggedIn,
		ID:      id,
	}
	s.emit("login:response", pl)

	if s.loggedIn {
		s.userData.username = username
		s.userData.ID = id
	}

	return nil
}

func (s *pescaSocketImpl) isLoggedIn() bool {
	return s.loggedIn
}

func (s *pescaSocketImpl) handle(event string, message []byte) {
	// Switch decoding depending on message events
	switch event {
	case "login:request":
		var r LoginRequest

		// unpack the message
		if err := json.Unmarshal(message, &r); err != nil {
			log.Printf("Cannot decode payload: %v", err)
			s.err("Invalid payload")
		}

		// login
		if err := s.login(r.Payload.Username, r.Payload.Password); err != nil {
			log.Printf("%v", err)
			return
		}

		break

	default:
		// unkown event
	}
}

func (s *pescaSocketImpl) emit(event string, payload interface{}) {
	message := BaseEvent{
		Event:   event,
		Payload: payload,
	}

	b, err := json.Marshal(message)

	if err != nil {
		log.Printf("emit: %v", err)
		return
	}

	s.c.WriteMessage(websocket.TextMessage, b)
}

func (s *pescaSocketImpl) err(msg string) {
	defer s.c.Close()
	pl := ErrorMessagePayload{
		Message: msg,
	}
	s.emit("error", pl)
}

func (s *pescaSocketImpl) getID() string {
	return s.id
}

// MakeEnhanceSocket is a factory function for creating a functio, which enhances an existing websocket with extra functionality.
func MakeEnhanceSocket() func(c *websocket.Conn) PescaSocket {
	return func(c *websocket.Conn) PescaSocket {
		return &pescaSocketImpl{
			id:       "-1",
			c:        c,
			loggedIn: false,
		}
	}
}
