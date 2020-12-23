/* eslint-disable @typescript-eslint/restrict-template-expressions */
import $ from "logsen";
import WebSocket from "ws";
import { Auth, Channel, Socket } from "../api";

type MakeHandleSocketOptions = {
    enhanceSocket: Socket.EnhanceSocketFunction;
    textChannel: Channel.TextChannel;
};

/**
 * Factory function for handling incomming sockets.
 */
export function makeHandleSocket({ enhanceSocket, textChannel }: MakeHandleSocketOptions): Socket.HandleSocketFunction {
    return function (s: WebSocket): void {
        const socket: Socket.EnhancedWebsocket = enhanceSocket(s);

        /**
         * Handle closing events.
         */
        function onClose(code: number, reason: string): void {
            textChannel.remove(socket);
            $.info(`[${socket.id}] closed. Code ${code}: "${reason}"`);
        }

        /**
         * Handle login requests.
         */
        function onLoginRequest({ username = "", password = "" }: Socket.EventTypes["login:request"]): void {
            socket.login({
                username,
                password
            });

            // Join default channel upon successful login
            if (socket.authenticated) {
                textChannel.add(socket);
            }

            socket.emit("login:response", {
                success: socket.authenticated,
                id: socket?.user?.id ?? "-1"
            });
        }

        /**
         * Handle incomming `message:send` events.
         */
        function onMessageSend({ message }: Socket.EventTypes["message:send"]): void {
            // Check for authentication
            if (!socket.authenticated || !textChannel.has(socket)) {
                socket.close();
            }

            // Construct return object
            const msg: Socket.EventTypes["message:receive"] = {
                author: socket.user as Auth.UserData,
                message: {
                    content: message.content,
                    date: Date.now()
                }
            };
            textChannel.broadcast(msg);
        }

        /**
         * Handle incomming message events.
         */
        function onMessage(d: WebSocket.Data) {
            try {
                const data = JSON.parse(d.toString()) as Socket.Event;

                // Switch through all "allowed" events
                switch (data.event as keyof Socket.EventTypes) {
                    case "login:request":
                        onLoginRequest(data.payload);
                        break;

                    case "message:send":
                        onMessageSend(data.payload);
                        break;

                    default:
                        $.err(`[${socket.id}] Invalid message object: ${JSON.stringify(data)}`);
                }
            } catch (e) {
                // Close socket upon receiving invalid payload.
                $.err(`[${socket.id}] ${e}`);
                socket.close();
            }
        }

        socket.on("close", onClose);
        socket.on("message", onMessage);
    };
}
