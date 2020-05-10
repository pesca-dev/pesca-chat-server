import $ from "logsen";
import { Socket } from "../sockets/socket";
import { SocketManager } from "../sockets/socketManager";
import { Channel } from "./channel";

export interface ChannelOptions {
    name: string;
    owner: string;
    password?: string;
}

/**
 * Class for managing all channels.
 */
export class ChannelManager {
    private socketManager!: SocketManager;
    private channels!: Map<string, Channel>;

    /**
     * Start the channel-manager and hand it the current instance of SocketManager.
     * @param socketManager current instance of SocketManager.
     */
    public start(socketManager: SocketManager): void {
        this.socketManager = socketManager;
        this.channels = new Map<string, Channel>();
    }

    /**
     * Create a new channel with a given name.
     * @param name name of the channel to create
     * @param pasword password for the channel, may be undefined, so channel has no password
     * @param socket socket, who created this channel. Owner-ID will be taken from it
     */
    public createChannel(name: string, password: string | undefined, socket?: Socket): void {
        if (this.channels.has(name)) {
            if (socket) {
                this.socketManager.emit(socket, "channel/create-response", [
                    {
                        action: "create",
                        channel: name,
                        success: false,
                        reason: "Channel already exists!"
                    }
                ]);
            }
            $.err(`Channel '${name}' already exists.`);
            return;
        }

        const ownerID = socket?.user.id ?? "-1";

        this.channels.set(name, new Channel(this.socketManager, { name, owner: ownerID, password }));
        $.info(`Channel '${name}' successfully created. Owner ID = ${ownerID}.`);
        if (socket) {
            this.socketManager.emit(socket, "channel/create-response", [
                {
                    action: "create",
                    channel: name,
                    success: true
                }
            ]);
        }
    }

    /**
     * Delete the channel with the given name, if it exists.
     * @param name name of the channel to delete
     */
    public deleteChannel(name: string, socket: Socket): void {
        const channel = this.channels.get(name);
        if (!channel) {
            this.socketManager.emit(socket, "channel/delete-response", [
                {
                    action: "delete",
                    channel: name,
                    success: false,
                    reason: `Channel '${name}' does not exist`
                }
            ]);
            return;
        }
        if (channel.delete(socket)) {
            this.channels.delete(name);
        }
    }

    /**
     * Get a channel with the given name.
     * @param name name of the channel to get
     */
    public getChannel(name: string): Channel | undefined {
        return this.channels.get(name);
    }
}
