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
    private owner: string;

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
    constructor(name: string, socketManager: SocketManager, owner: string, password?: string) {
        super();
        this._name = name;
        this.owner = owner;
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
        // If names are not the same do nothing
        if (this.name !== request.channel) {
            return;
        }

        // If password is incorrect, send failure-response to the client
        if (this.password && request.password !== this.password) {
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

        // If socket is already in this channel, send failure-response to the client
        if (this.sockets.has(socket.id)) {
            this.socketManager.emit(socket, "channel/join-response", [
                {
                    action: request.action,
                    channel: request.channel,
                    success: true,
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
    public leave(socket: Socket, request?: Client.ChannelActionRequest<"leave">): void {
        // If the name of the requested channel is wrong or the socket is not in this channel anymore, do nothing
        if (request && request.channel !== this.name) {
            return;
        }

        if (!this.sockets.has(socket.id)) {
            if (request) {
                this.socketManager.emit(socket, "channel/leave-response", [
                    {
                        action: "leave",
                        channel: request.channel,
                        success: true,
                        reason: "You are no member of this channel!"
                    }
                ]);
            }
            return;
        }
        this.sockets.delete(socket.id);
        $.log(`Socket [${socket.id}] left channel "${this.name}"`);

        // If the leaving was issue via request, send a valid response
        if (request) {
            this.socketManager.emit(socket, "channel/leave-response", [
                {
                    action: "leave",
                    channel: request.channel,
                    success: true
                }
            ]);
        }
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
    public delete(socket: Socket): boolean {
        if (!socket.user.id || socket.user.id !== this.owner) {
            this.socketManager.emit(socket, "channel/delete-response", [
                {
                    action: "delete",
                    channel: this.name,
                    success: false,
                    reason: "You are not the owner of this channel!"
                }
            ]);
            return false;
        }
        this.sockets.forEach(async socket => {
            // TODO: Add event to client, which handles serverside channel closing
            this.leave(socket);
            // socket.disconnect(true);
        });
        this.socketManager.emit(socket, "channel/delete-response", [
            {
                action: "delete",
                channel: this.name,
                success: true
            }
        ]);
        return true;
    }

    /**
     * Get the name of this channel.
     */
    public get name(): string {
        return this._name;
    }
}
