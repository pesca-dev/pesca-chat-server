/* eslint-disable @typescript-eslint/restrict-template-expressions */
import $ from "logsen";
import WebSocket from "ws";
import { Channel, Socket } from "../api";

type MakeHandleSocketOptions = {
    enhanceSocket: Socket.EnhanceSocketFunction;
    textChannel: Channel.TextChannel;
};

/**
 * Factory function for handling incomming sockets.
 */
export function makeHandleSocket({ enhanceSocket, textChannel }: MakeHandleSocketOptions): Socket.HandleSocketFunction {
    return function (s: WebSocket): void {
        $.info(textChannel);
        const socket: Socket.EnhancedWebsocket = enhanceSocket(s);

        /**
         * Handle closing events.
         */
        function onClose(code: number, reason: string): void {
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

            socket.emit("login:response", {
                success: socket.authenticated,
                id: socket?.user?.id ?? "-1"
            });
        }

        function onMessageSend({ author, message }: Socket.EventTypes["message:send"]): void {
            $.info(author, message);
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
