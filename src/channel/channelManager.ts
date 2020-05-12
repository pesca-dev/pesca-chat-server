import $ from "logsen";
import { DatabaseManager } from "../db/databaseManager";
import { Socket } from "../sockets/socket";
import { SocketManager } from "../sockets/socketManager";
import { User } from "../user/user";
import { UserManager } from "../user/userManager";
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
    private userManager!: UserManager;
    private db!: DatabaseManager;
    private channels!: Map<string, Channel>;

    /**
     * Initialize the channel-manager and hand it the current instance of SocketManager.
     * @param socketManager current instance of SocketManager.
     */
    public async init(socketManager: SocketManager, userManager: UserManager, db: DatabaseManager): Promise<void> {
        this.socketManager = socketManager;
        this.userManager = userManager;
        this.db = db;
        this.channels = new Map<string, Channel>();
    }

    /**
     * Load all channels from the database.
     */
    public async loadChannels(): Promise<void> {
        const channels = await this.db.channels.all();
        for (const options of channels) {
            this.channels.set(options.name, new Channel(this.socketManager, this.db, options));
        }
    }

    /**
     * Load and setup the users from the database.
     */
    public async joinUsers(): Promise<void> {
        for (const [name, channel] of this.channels) {
            const users = (await this.db.joins.getForChannel(name)).reduce((memo: User[], cur) => {
                const user = this.userManager.getUser(cur.user);
                if (user) {
                    memo.push(user);
                }
                return memo;
            }, []);
            channel.setup(users);
        }
    }

    /**
     * Create a new channel with a given name.
     * @param name name of the channel to create
     * @param pasword password for the channel, may be undefined, so channel has no password
     * @param socket socket, who created this channel. Owner-ID will be taken from it
     */
    public async createChannel(
        name: string,
        password: string | undefined,
        owner?: string,
        socket?: Socket
    ): Promise<void> {
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

        // Create new channel options
        const channelOptions: ChannelOptions = { name, owner: owner ?? "-1", password };
        // Create channel with this options
        this.channels.set(name, new Channel(this.socketManager, this.db, channelOptions));
        // Add the channel to the database
        this.db.channels.add(channelOptions);

        $.info(`Channel '${name}' successfully created. Owner ID = ${owner}.`);
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
            this.db.channels.delete(name);
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
