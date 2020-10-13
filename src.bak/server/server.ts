import $ from "logsen";
import Websocket from "ws";
// import { AuthenticationManager } from "../authentication/authenticationManager";
import { ChannelManager } from "../channel/channelManager";
import { DatabaseManager } from "../db/databaseManager";
import { enhance } from "../sockets/socket";
import { SocketManager } from "../sockets/socketManager";
import { UserManager } from "../user/userManager";

/**
 * Class for serving as a Server.
 */
export default class Server {
    private static PORT = 3000;

    private ws: Websocket.Server;
    private databaseManager: DatabaseManager;
    private channelManager: ChannelManager;
    private socketManager: SocketManager;
    private userManager: UserManager;

    /**
     * Create a new Server.
     */
    constructor() {
        this.ws = new Websocket.Server({
            port: Server.PORT
        });

        this.databaseManager = new DatabaseManager();
        this.channelManager = new ChannelManager();
        this.socketManager = new SocketManager();
        this.userManager = new UserManager(this.databaseManager);
    }

    /**
     * Setup all managers and add the default channels.
     */
    private async setup(): Promise<void> {
        this.socketManager.init(this.channelManager, this.userManager);

        // Initialize all managers
        await this.channelManager.init(this.socketManager, this.userManager, this.databaseManager);
        await this.userManager.init(this.socketManager, this.channelManager);

        // Load their basic data
        await this.channelManager.loadChannels();
        await this.userManager.loadUsers();

        // Load their cyclic data
        await this.channelManager.joinUsers();
        await this.userManager.joinChannels();
    }

    /**
     * Start the entire application.
     */
    public async start(): Promise<void> {
        await this.setup();
        await this.bind();
        $.success(`Server listening on port ${Server.PORT}`);
    }

    /**
     * Bind all relevant events.
     */
    private async bind(): Promise<void> {
        this.ws.on("connection", this.onConnect.bind(this));
    }

    /**
     * Add a new connection.
     * @param socket socket for the new connection
     */
    private onConnect(socket: Websocket): void {
        this.socketManager.addBasicEventsToSocket(enhance(socket));
    }
}
