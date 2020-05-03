import { EventEmitter } from "events";
import $ from "logsen";
import { Client, Server } from "socket-chat-protocol";
import { Socket } from "socket.io";
import { MethodFactory } from "../sockets/methodfactory";
import { SocketManager } from "../sockets/socketManager";
import { SocketMap } from "../sockets/socketMap";

/**
 * Class for representing a Chat-Channel.
 */
export class Channel extends EventEmitter {
    private _name: string;
    private password: string | undefined;

    private socketManager: SocketManager;

    /**
     * Map for managing sockets in this channel.
     */
    private sockets: SocketMap;

    /**
     * Create a new channel.
     * @param name name of the channel
     * @param socketManager current instance of a SocketManager for firing events on sockets.
     */
    constructor(name: string, socketManager: SocketManager, password?: string) {
        super();
        this._name = name;
        this.password = password;
        this.socketManager = socketManager;
        this.sockets = new SocketMap(this.socketManager);
        this.bind();
    }

    /**
     * Bind all events.
     */
    private bind(): void {
        this.register("channel/send-message", this.onSendMessage.bind(this));
    }

    /**
     * Let a socket join this channel.
     * @param socket socket to join this channel
     */
    public join(socket: Socket, request: Client.ChannelActionRequest<"join">): void {
        if (this.password && request.passwort !== this.password) {
            this.socketManager.emit(socket, "channel/join-response", [
                {
                    action: request.action,
                    channel: request.channel,
                    success: false,
                    reason: "Invalid password provided"
                }
            ]);
            return $.err("Invalid password provided!");
        }
        if (this.sockets.has(socket.id)) {
            this.socketManager.emit(socket, "channel/join-response", [
                {
                    action: request.action,
                    channel: request.channel,
                    success: false,
                    reason: "Socket already joined this channel"
                }
            ]);
            return $.err("Socket already joined this channel!");
        }

        $.log(`Socket [${socket.id}] {User-ID: ${socket.user.id}} joined channel "${this.name}"`);
        // Upon disconnecting, leave this channel
        this.socketManager.register(socket, "disconnect", MethodFactory.createMethod(socket, "disconnect", this));
        this.sockets.set(socket.id, socket);
        this.socketManager.emit(socket, "channel/join-response", [
            {
                action: request.action,
                channel: request.channel,
                success: true
            }
        ]);
    }

    /**
     * Check, if a given socket is in this channel.
     * @param socket socket to check
     */
    public contains(socket: Socket): boolean {
        return this.sockets.has(socket.id);
    }

    /**
     * Let a socket leave this channel.
     * @param socket socket to leave this channel
     */
    public leave(socket: Socket): void {
        $.log(`Socket [${socket.id}] left channel "${this.name}"`);
        this.sockets.delete(socket.id);
    }

    /**
     * Method to get executed on event "channel/send-message".
     * @param msgs array of text-messages to send to this channel
     */
    private onSendMessage(msgs: Server.TextMessage[]): void {
        this.sockets.fire("channel/send-message", msgs);
    }

    /**
     * Register a new event for this channel.
     * @param event name of the event to register
     * @param fn function to execute upon receiving this event
     */
    private register<K extends keyof Client.Event>(event: K, fn: (data: Client.Event[K]) => void): void {
        this.on(event, fn);
    }

    /**
     * Emit a new event on channel.
     * @param event name of the event to emit
     * @param data data to send with this event
     */
    public fire<K extends keyof Client.Event>(event: K, data: Client.Event[K]): void {
        this.emit(event, data);
    }

    /**
     * Delete this channel and disconnect all connected sockets in it.
     */
    public delete(): void {
        this.sockets.forEach(async socket => {
            socket.disconnect(true);
        });
    }

    /**
     * Get the name of this channel.
     */
    public get name(): string {
        return this._name;
    }
}
