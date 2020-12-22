/* eslint-disable @typescript-eslint/restrict-template-expressions */
import $ from "logsen";
import WebSocket from "ws";
import { AuthenticateFunction } from "../auth/authenticate";

export type EnhancedWebsocket = WebSocket & {
    id: string;
};

type MakeEnhanceSocketOptions = {
    authenticate: AuthenticateFunction;
    makeId(): string;
};

export type HandleSocketFunction = (socket: WebSocket) => void;

/**
 * Factory function for handling incomming sockets.
 */
export function makeHandleSocket({ makeId, authenticate }: MakeEnhanceSocketOptions): HandleSocketFunction {
    /**
     * Add extra parameter to socket.
     */
    function enhanceSocket(socket: WebSocket): EnhancedWebsocket {
        const id = makeId();
        Object.defineProperty(socket, "id", {
            get() {
                return id;
            }
        });
        return socket as EnhancedWebsocket;
    }

    return function (s: WebSocket): void {
        const socket = enhanceSocket(s);

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
            const { success, id } = authenticate({ username, password });

            const response: Socket.Event = {
                event: "login:response",
                payload: {
                    success,
                    id: id ?? "-1"
                }
            };

            socket.send(JSON.stringify(response));
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
