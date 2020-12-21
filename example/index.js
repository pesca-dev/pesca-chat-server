const WebSocket = require("ws");

const ws = new WebSocket("ws://localhost:3000");

ws.on("open", () => {
    ws.send(
        // JSON.stringify({
        //     method: "message",
        //     payload: "Lol, funktioniert das so?"
        // })
            "{la"
        );
});

ws.on("message", (data) => {
    console.log(data);
})