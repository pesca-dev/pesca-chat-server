const WebSocket = require("ws");

const ws = new WebSocket("ws://localhost:3000");

ws.on("open", () => {
    ws.send(
        JSON.stringify({
            event: "message:send",
            payload: {
                username: "Louis",
                password: ""
            }
        })
        );
});

ws.on("message", (data) => {
    console.log(data);
})