import { Channel, Socket } from "../api";

/**
 * Factory function for a text-channel-creating function.
 */
export function makeCreateTextChannel(): Channel.CreateChannelFunction<Channel.TextChannel> {
    return function (): Channel.TextChannel {
        const sockets: Map<string, Socket.EnhancedWebsocket> = new Map<string, Socket.EnhancedWebsocket>();

        function add(socket: Socket.EnhancedWebsocket): void {
            sockets.set(socket.id, socket);
        }

        function remove(socket: Socket.EnhancedWebsocket | string): void {
            const id = typeof socket === "string" ? socket : socket.id;
            sockets.delete(id);
        }

        function has(socket: Socket.EnhancedWebsocket | string): boolean {
            const id = typeof socket === "string" ? socket : socket.id;
            return sockets.has(id);
        }

        /**
         * Broadcast a message over the entire channel.
         */
        function broadcast(msg: Socket.EventTypes["message:receive"]): void {
            sockets.forEach(v => {
                v.emit("message:send", msg);
            });
        }

        return {
            get users() {
                return Object.freeze([...sockets.values()]);
            },
            add,
            remove,
            has,
            broadcast
        };
    };
}
