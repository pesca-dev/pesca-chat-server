/* eslint-disable @typescript-eslint/unbound-method */
import $ from "logsen";
import WebSocket from "ws";

type MakeEnhanceSocketOptions = {
    makeId: () => string;
};

type EnhancedWebsocket = WebSocket & {
    id: string;
};

/**
 * Factory function for handling incomming sockets.
 */
export function makeHandleSocket({ makeId }: MakeEnhanceSocketOptions): (socket: WebSocket) => void {
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
            $.info(`Socket [${socket.id}] closed. Code ${code}: "${reason}"`);
        }

        /**
         * Handle incomming message events.
         */
        function onMessage(data: WebSocket.Data) {
            try {
                $.info(JSON.parse(data.toString()));
            } catch (e) {
                // Close socket upon receiving invalid payload.
                $.err(e);
                socket.close();
            }
        }

        socket.on("close", onClose);
        socket.on("message", onMessage);
    };
}
