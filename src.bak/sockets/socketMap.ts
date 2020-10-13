import { EventEmitter } from "events";
import { Client } from "socket-chat-protocol";
import { Socket } from "./socket";
import { SocketManager } from "./socketManager";

/**
 * Wrapper-class around a mapt o keep track of sockets.
 */
export class SocketMap extends EventEmitter {
    private socketManager: SocketManager;
    private sockets: Map<string, Socket>;

    constructor(socketManager: SocketManager) {
        super();
        this.socketManager = socketManager;
        this.sockets = new Map<string, Socket>();
    }

    /**
     * Fire an event on all sockets in this map.
     * @param event event to be fired
     * @param data data to be send during this event
     */
    public async fire<K extends keyof Client.Event>(event: K, data: Client.Event[K]): Promise<void> {
        this.sockets.forEach(async socket => {
            this.socketManager.emit(socket, event, data);
        });
    }

    /**
     * Check, whether a socket in this in this map.
     * @param key key of the socket to check
     */
    public has(key: string): boolean {
        return this.sockets.has(key);
    }

    /**
     * Insert a new socket to this map.
     * @param key id of the socket
     * @param value socket to be added
     */
    public set(key: string, value: Socket): SocketMap {
        this.sockets.set(key, value);
        return this;
    }

    /**
     * Add a socket to this map.
     * @param socket socket to add
     */
    public add(socket: Socket): SocketMap {
        return this.set(socket.id, socket);
    }

    /**
     * Delete a specified key from this map.
     * @param key key of the socket to be deleted
     */
    public delete(key: string): boolean {
        return this.sockets.delete(key);
    }

    /**
     * Execute a function for all sockets in this map.
     * @param fn function to execute
     * @param thisArg execution-context of the function
     */
    public forEach(fn: (value: Socket, key: string) => void, thisArg?: any): void {
        this.sockets.forEach(fn, thisArg);
    }

    /**
     * Same as 'forEach', but async.
     * So you do not wait for the functions to finish.
     */
    public async forEachAsync(fn: (value: Socket, key: string) => void, thisArg?: any): Promise<void> {
        this.sockets.forEach(fn, thisArg);
    }
}
