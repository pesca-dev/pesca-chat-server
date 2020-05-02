const io = require("socket.io-client");

const socket = io("http://localhost:3000");

socket.on("connect", () => {
    console.log("connected!");

    socket.emit("channel/send-message", [
        {
            channel: "default",
            author: "not Louis",
            content: "This here is another test"
        }
    ]);
});

socket.on("channel/send-message", msgs => {
    msgs.forEach(msg => {
        console.log(`[${msg.author}] ${msg.content}`);
    });
});
