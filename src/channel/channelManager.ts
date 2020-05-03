import { Client } from "socket-chat-protocol";
import { Socket } from "socket.io";
import { SocketManager } from "../sockets/socketManager";
import { Channel } from "./channel";

/**
 * Class for managing all channels.
 */
export class ChannelManager {
    private socketManager!: SocketManager;
    private channel!: Map<string, Channel>;

    /**
     * Start the channel-manager and hand it the current instance of SocketManager.
     * @param socketManager current instance of SocketManager.
     */
    public start(socketManager: SocketManager): void {
        this.socketManager = socketManager;
        this.channel = new Map<string, Channel>();
    }

    /**
     * Create a new channel with a given name.
     * @param name name of the channel to create
     * @throws ChannelAlreadyExistsException if channel already exists
     */
    public addChannel(name: string, _socket?: Socket): void {
        // if (socket) {
        //     if(this.channel.has(name)) {
        //         this.socketManager.emit(socket, "")
        //     } else {
        this.channel.set(name, new Channel(name, this.socketManager));
        // }
    }

    /**
     * Delete the channel with the given name, if it exists.
     * @param name name of the channel to delete
     */
    public deleteChannel(name: string): void {
        const channel = this.channel.get(name);
        if (!channel) {
            return;
        }
        channel.delete();
        this.channel.delete(name);
    }

    /**
     * Shortform for `ChannelManager.getChannel(request.channel).join(socket, request)`.
     *
     * Does not throw any exception if anything goes wrong.
     */
    public joinChannel(socket: Socket, request: Client.ChannelActionRequest<"join">): void {
        this.channel.get(request.channel)?.join(socket, request);
    }

    /**
     * Shortform for `ChannelManager.getChannel(request.channel).leave(socket, request)`.
     *
     * Does not throw any exception if anything goes wrong.
     */
    public leaveChannel(socket: Socket, request: Client.ChannelActionRequest<"leave">): void {
        this.channel.get(request.channel)?.leave(socket, request);
    }

    /**
     * Get a channel with the given name.
     * @param name name of the channel to get
     */
    public getChannel(name: string): Channel | undefined {
        return this.channel.get(name);
    }
}
