import $ from "logsen";
import Websocket from "ws";
// import { AuthenticationManager } from "../authentication/authenticationManager";
import { ChannelManager } from "../channel/channelManager";
import { DatabaseManager } from "../db/databaseManager";
import { enhance } from "../sockets/socket";
import { SocketManager } from "../sockets/socketManager";
import { Usermanager } from "../user/userManager";

/**
 * Class for serving as a Server.
 */
export default class Server {
    private static PORT = 3000;

    private ws: Websocket.Server;
    private databaseManager: DatabaseManager;
    private channelManager: ChannelManager;
    private socketManager: SocketManager;
    private userManager: Usermanager;

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
        this.userManager = new Usermanager(this.databaseManager);
    }

    /**
     * Setup all managers and add the default channels.
     */
    private async setup(): Promise<void> {
        this.channelManager.start(this.socketManager);
        this.socketManager.start(this.channelManager, this.userManager);

        // Setup some default shit
        this.channelManager.createChannel("default", undefined);
        await this.userManager.start(this.socketManager, this.channelManager);
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
