import { Socket } from "../api";
import { Channel } from "../api/channel";

export function makeCreateTextChannel() {
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

        function broadcast(msg: Socket.EventTypes["message:send"]): void {
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
