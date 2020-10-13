const WebSocket = require("ws");

const ws = new WebSocket("ws://localhost:3000");

ws.on("open", () => {
    ws.send(
        JSON.stringify({
            method: "message",
            payload: "Lol, funktioniert das so?"
        })
    );
});

ws.on("message", data => {
    console.log(data);
    const message = JSON.parse(data);
    if (message.method === "server/login-response") {
        ws.send(
            JSON.stringify({
                method: "channel/create-request",
                params: [
                    {
                        method: "create",
                        channel: "default"
                        // content: "This here is a test"
                    }
                ]
            })
        );
    }

    if (message.method === "channel/send-message") {
        console.log(message.params[0].content);
        // ws.send(
        //     JSON.stringify({
        //         method: "channel/leave-request",
        //         params: [
        //             {
        //                 action: "leave",
        //                 channel: "default"
        //             }
        //         ]
        //     })
        // );
    }

    if (message.method === "channel/leave-response") {
        ws.send(
            JSON.stringify({
                method: "channel/create-request",
                params: [
                    {
                        action: "create",
                        channel: "my-channel"
                    }
                ]
            })
        );
    }
});
