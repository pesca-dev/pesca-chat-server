const io = require("socket.io-client");

const socket = io("http://localhost:3000");

socket.on("connect", () => {
    console.log("connected!");

    socket.emit("server/login-request", [
        {
            username: "Louis",
            password: "password"
        }
    ]);
});

socket.on("server/login-response", data => {
    console.log(data);
    // socket.emit("channel/send-message", [
    //     {
    //         channel: "default",
    //         author: "not Louis",
    //         content: "This here is another test"
    //     }
    // ]);

    // socket.emit("channel/leave-request", [
    //     {
    //         action: "leave",
    //         channel: "default"
    //     }
    // ]);
    // socket.emit("channel/join-request", [
    //     {
    //         action: "join",
    //         channel: "my-channel"
    //     }
    // ]);
    // socket.emit("channel/join-request", [
    //     {
    //         action: "join",
    //         channel: "my-channel2",
    //         password: "password"
    //     }
    // ]);
    socket.emit("channel/delete-request", [
        {
            action: "delete",
            channel: "default"
        }
    ]);
    socket.emit("channel/delete-request", [
        {
            action: "delete",
            channel: "my-channel"
        }
    ]);
    socket.emit("channel/delete-request", [
        {
            action: "delete",
            channel: "my-channel4"
        }
    ]);
});

socket.on("channel/delete-response", data => {
    console.log(data);
});

socket.on("channel/join-response", data => {
    console.log(data);
    // socket.emit("channel/join-request", [
    //     {
    //         action: "join",
    //         channel: "default"
    //     }
    // ]);
});

socket.on("channel/send-message", msgs => {
    msgs.forEach(msg => {
        console.log(`[${msg.author}@${msg.channel}] ${msg.content}`);
    });
});
