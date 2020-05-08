const WebSocket = require("ws");

const ws = new WebSocket("wss://socket.bre4k3r.de:10080");

ws.on("open", () => {
    ws.send(
        JSON.stringify({
            method: "server/login-request",
            params: [
                {
                    username: "admin",
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
