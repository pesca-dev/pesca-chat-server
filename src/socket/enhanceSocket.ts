import WebSocket from "ws";
import { Socket } from "../api";

type MakeEnhanceSocketOptions = {
    makeId(): string;
};

/**
 * Add extra parameter to socket.
 */
export function makeEnhanceSocket({ makeId }: MakeEnhanceSocketOptions): Socket.EnhanceSocketFunction {
    return function (socket: WebSocket): Socket.EnhancedWebsocket {
        const id = makeId();
        Object.defineProperty(socket, "id", {
            get() {
                return id;
            }
        });
        return socket as Socket.EnhancedWebsocket;
    };
}
