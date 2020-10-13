import { EventEmitter } from "events";
import $ from "logsen";
import { Client, Server } from "socket-chat-protocol";
import { DatabaseManager } from "../db/databaseManager";
import { Socket } from "../sockets/socket";
import { SocketManager } from "../sockets/socketManager";
import { User } from "../user/user";
import { UserMap } from "../user/userMap";
import { ChannelOptions } from "./channelManager";
/**
 * Class for representing a Chat-Channel.
 */
export class Channel extends EventEmitter {
    private _name: string;
    private password: string | undefined;
    private owner: string;

    private socketManager: SocketManager;
    private db: DatabaseManager;

    /**
     * Map for managing sockets in this channel.
     */
    private users: UserMap;

    /**
     * Create a new channel.
     */
    constructor(socketManager: SocketManager, db: DatabaseManager, { name, owner, password }: ChannelOptions) {
        super();
        this._name = name;
        this.owner = owner;
        this.password = password;
        this.socketManager = socketManager;
        this.db = db;
        this.users = new UserMap();
        this.bind();
    }

    /**
     * Set this channel up. Enter all provied users into it.
     * @param users users to enter
     */
    public async setup(users: User[]): Promise<void> {
        users.forEach(u => {
            this.users.set(u.username, u);
        });
    }

    /**
     * Bind all events.
     */
    private bind(): void {
        this.register("channel/send-message", this.onSendMessage.bind(this));
    }

    /**
     * Let a socket enter this channel.
     * @param user socket to join this channel
     */
    public enter(user: User, password?: string): boolean {
        // If password is incorrect, send failure-response to the client
        if (this.password && password !== this.password) {
            user.fire("channel/join-response", [
                {
                    action: "join",
                    channel: this.name,
                    success: false,
                    reason: "Invalid password provided"
                }
            ]);
            $.err("Invalid password provided!");
            return false;
        }

        // If socket is already in this channel, send success-response to the client
        if (this.users.has(user.username)) {
            user.fire("channel/join-response", [
                {
                    action: "join",
                    channel: this.name,
                    success: true,
                    reason: "Socket already joined this channel"
                }
            ]);
            $.err("Socket already joined this channel!");
            return true;
        }

        this.users.set(user.username, user);
        this.db.joins.join(user.username, this.name);
        $.info(`User [${user.id}] joined channel "${this.name}"`);

        user.fire("channel/join-response", [
            {
                action: "join",
                channel: this.name,
                success: true
            }
        ]);
        return true;
    }

    /**
     * Check, if a given socket is in this channel.
     * @param user socket to check
     */
    public contains(user: User): boolean {
        return this.users.has(user.username);
    }

    /**
     * Let a user leave this channel.
     * @param user socket to leave this channel
     */
    public leave(user: User): void {
        if (!this.users.has(user.username)) {
            user.fire("channel/leave-response", [
                {
                    action: "leave",
                    channel: this.name,
                    success: true,
                    reason: "You are no member of this channel!"
                }
            ]);
            return;
        }
        this.users.delete(user.username);
        this.db.joins.leave(user.username, this.name);
        $.info(`Socket [${user.username}] left channel "${this.name}"`);

        // If the leaving was issue via request, send a valid response
        user.fire("channel/leave-response", [
            {
                action: "leave",
                channel: this.name,
                success: true
            }
        ]);
    }

    /**
     * Method to get executed on event "channel/send-message".
     * @param msgs array of text-messages to send to this channel
     */
    private onSendMessage(msgs: Server.TextMessage[]): void {
        this.users.fire("channel/send-message", msgs);
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
        this.users.forEach(async user => {
            user.fire("channel/closed", [
                {
                    channel: this.name,
                    message: "The channel got closed and due to that, you got kicked out of it."
                }
            ]);
            user.channels.leave(this);
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
