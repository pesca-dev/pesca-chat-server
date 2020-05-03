const io = require("socket.io-client");

const socket = io("http://localhost:3000");

socket.on("connect", () => {
    console.log("connected!");

    socket.emit("channel/join-request", [
        {
            action: "join",
            channel: "default"
        }
    ]);

    // socket.emit("channel/send-message", [
    //     {
    //         channel: "default",
    //         author: "not Louis",
    //         content: "This here is another test"
    //     }
    // ]);
});

socket.on("channel/join-response", data => {
    console.log(data);
    socket.emit("channel/send-message", [
        {
            channel: "default",
            author: "not Louis",
            content: "This here is another test"
        }
    ]);

    socket.emit("channel/leave-request", [
        {
            action: "leave",
            channel: "default"
        }
    ]);
});

socket.on("channel/leave-response", data => {
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
        console.log(`[${msg.author}] ${msg.content}`);
    });
});
