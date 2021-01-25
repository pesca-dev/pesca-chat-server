package socket_test

import (
	"testing"

	"git.pesca.dev/pesca-dev/pesca-chat-server/internal/socket"
)

func TestEnhanceSocketNilParam(t *testing.T) {
	ret := socket.EnhanceSocket(nil)
	if ret != nil {
		t.Errorf("socket.EnhanceSocket shall return nil when given nil as param")
	}
}
