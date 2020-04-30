import { Server, Client } from "socket-chat-protocol";
import { Socket } from "socket.io";

export class SocketServer implements Server.SocketEventManager {
    public register<K extends keyof Server.Event>(socket: Socket, event: K, fn: (data: Server.Event[K]) => void): void {
        socket.on(event, fn);
    }

    public emit<K extends keyof Client.Event>(socket: Socket, event: K, data: Client.Event[K]): void {
        socket.emit(event, data);
    }
}
