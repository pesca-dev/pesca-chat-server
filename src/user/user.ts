import { EventEmitter } from "events";
import { Client } from "socket-chat-protocol";
import { Channel } from "../channel/channel";
import { MethodFactory } from "../sockets/methodfactory";
import { Socket } from "../sockets/socket";
import { SocketManager } from "../sockets/socketManager";
import { SocketMap } from "../sockets/socketMap";

/**
 * Options for creating a new user.
 */
export interface UserOptions {
    id?: string;
    username?: string;
}

/**
 * Object, representing a user.
 */
export class User extends EventEmitter {
    private socketManager: SocketManager;

    private _id: string;
    private _username: string;
    private _channels: Map<string, Channel>;
    private _sockets: SocketMap;

    constructor(socketManager: SocketManager, userOptions: UserOptions) {
        super();
        this.socketManager = socketManager;
        this._channels = new Map<string, Channel>();
        this._id = userOptions.id ?? "";
        this._username = userOptions.username ?? "";
        this._sockets = new SocketMap(this.socketManager);
    }

    /**
     * Fire an event on all connected sockets for this user.
     * @param event event to emit
     * @param data data to send during this event
     */
    public async fire<K extends keyof Client.Event>(event: K, data: Client.Event[K]): Promise<void> {
        this._sockets.forEach(async socket => {
            this.socketManager.emit(socket, event, data);
        });
    }

    /**
     * Add a socket to this user.
     * @param socket socket to add
     */
    public addSocket(socket: Socket): void {
        this._sockets.set(socket.id, socket);
        this.socketManager.register(socket, "close", MethodFactory.createMethod(socket, "close", this));
    }

    /**
     * Delete a socket from this user. Automatically called, when socket closes connection
     * @param socket
     */
    public deleteSocket(socket: Socket): void {
        this._sockets.delete(socket.id);
    }

    /**
     * Add a channel to this user.
     * @param channel channel to add.
     */
    public addChannel(channel: Channel): void {
        this._channels.set(channel.name, channel);
    }

    /**
     * Remove a channel from this user.
     * @param channel channel to remove
     */
    public removeChannel(channel: Channel): void {
        this._channels.delete(channel.name);
    }

    /**
     * Check, if user is in channel.
     * @param channel channel to check
     */
    public isInChannel(channel: Channel): boolean {
        return this._channels.has(channel.name);
    }

    /**
     * The id of this user.
     */
    public get id(): string {
        return this._id;
    }

    /**
     * The username of this user.
     */
    public get username(): string {
        return this._username;
    }

    /**
     * The channels, this user is in.
     */
    public get channels(): string[] {
        return [...this._channels.keys()];
    }
}
