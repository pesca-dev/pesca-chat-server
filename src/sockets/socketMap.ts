import { EventEmitter } from "events";
import { Client } from "socket-chat-protocol";
import { Socket } from "socket.io";
import { SocketManager } from "./socketManager";

export class SocketMap extends EventEmitter {
    private socketManager: SocketManager;
    private sockets: Map<string, Socket>;

    constructor(socketManager: SocketManager) {
        super();
        this.socketManager = socketManager;
        this.sockets = new Map<string, Socket>();
    }

    public async fire<K extends keyof Client.Event>(event: K, data: Client.Event[K]): Promise<void> {
        this.sockets.forEach(socket => {
            this.socketManager.emit(socket, event, data);
        });
    }

    public has(key: string): boolean {
        return this.sockets.has(key);
    }

    public set(key: string, value: Socket): SocketMap {
        this.sockets.set(key, value);
        return this;
    }

    public delete(key: string): boolean {
        return this.sockets.delete(key);
    }

    public forEach(fn: (value: Socket, key: string) => void, thisArg?: any): void {
        this.sockets.forEach(fn, thisArg);
    }
}
