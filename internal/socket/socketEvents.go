package socket

// BaseEvent .
type BaseEvent struct {
	Event   string      `json:"event"`
	Payload interface{} `json:"payload"`
}

// LoginRequest .
type LoginRequest struct {
	Event   string `json:"event"`
	Payload struct {
		Username string `json:"username"`
		Password string `json:"password"`
	} `json:"payload"`
}

// LoginResponse .
type LoginResponse struct {
	Event   string               `json:"event"`
	Payload LoginResponsePayload `json:"payload"`
}

// LoginResponsePayload .
type LoginResponsePayload struct {
	Success bool `json:"success"`
	ID      int  `json:"id"`
}

// ErrorMessagePayload .
type ErrorMessagePayload struct {
	Message string `json:"message"`
}
