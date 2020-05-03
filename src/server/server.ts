import $ from "logsen";
import socketio from "socket.io";
import { AuthenticationManager } from "../authentication/authenticationManager";
import { ChannelManager } from "../channel/channelManager";
import { setupUserObject } from "../middleware/userSetupMiddleware";
import { SocketManager } from "../sockets/socketManager";

/**
 * Class for serving as a Server.
 */
export default class Server {
    private static PORT = 3000;

    private io: socketio.Server;
    private channelManager: ChannelManager;
    private socketManager: SocketManager;
    private authenticationManager: AuthenticationManager;

    /**
     * Create a new Server.
     */
    constructor() {
        this.io = socketio();
        this.io.use(setupUserObject);
        this.channelManager = new ChannelManager();
        this.socketManager = new SocketManager();
        this.authenticationManager = new AuthenticationManager();

        this.setup();

        this.bind();
    }

    /**
     * Setup all managers and add the default channels.
     */
    private setup(): void {
        this.channelManager.start(this.socketManager);
        this.socketManager.start(this.channelManager, this.authenticationManager);
        this.authenticationManager.start(this.socketManager);

        // Setup some default shit
        this.channelManager.createChannel("default", undefined);
    }

    /**
     * Start the entire application.
     */
    public start(): void {
        this.io.listen(Server.PORT, {
            path: "/",
            pingInterval: 10000,
            serveClient: false
        });
        $.success(`Server listening on port ${Server.PORT}`);
    }

    /**
     * Bind all relevant events.
     */
    private bind(): void {
        this.io.on("connect", this.onConnect.bind(this));
    }

    /**
     * Add a new connection.
     * @param socket socket for the new connection
     */
    private onConnect(socket: socketio.Socket): void {
        this.socketManager.addBasicEventsToSocket(socket);
    }
}
