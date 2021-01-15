const WebSocket = require("ws");

const ws = new WebSocket("ws://localhost:3000");

ws.on("open", () => {
    ws.send(
        JSON.stringify({
            event: "login:request",
            payload: {
                username: "lome",
                password: "test"
            }
        })
    );
});

ws.on("message", data => {
    const d = JSON.parse(data);
    console.log(d);
    switch (d.event) {
        case "login:response":
            ws.send(
                JSON.stringify({
                    event: "message:send",
                    payload: {
                        message: {
                            content: "This is a text"
                        }
                    }
                })
            );
            break;
        case "message:send":
            console.log(`${d.payload.author.username}: ${d.payload.message.content}`);
            break;
    }
});
