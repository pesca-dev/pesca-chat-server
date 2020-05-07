const WebSocket = require("ws");

const ws = new WebSocket("ws://localhost:3000");

ws.on("open", () => {
    ws.send(
        JSON.stringify({
            method: "server/login-request",
            params: [
                {
                    username: "test",
                    password: "password"
                }
            ]
        })
    );
});

ws.on("message", data => {
    console.log(data);
    const message = JSON.parse(data);
    if (message.method === "server/login-response") {
        ws.send(
            JSON.stringify({
                method: "channel/send-message",
                params: [
                    {
                        channel: "default",
                        content: "This here is a test"
                    }
                ]
            })
        );
    }

    if (message.method === "channel/send-message") {
        console.log(message.params[0].content);
    }
});
