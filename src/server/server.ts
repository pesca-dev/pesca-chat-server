import $ from "logsen";
import Websocket from "ws";
import { Singleton } from "dependory";
import { Socket } from "../sockets/socket";
import { SocketManager } from "../sockets/socketManager";

/**
 * Class for managing incomming socket connections.
 */
@Singleton()
export class Server extends Websocket.Server {
    private static PORT = 3000;

    constructor(private readonly socketManager: SocketManager) {
        super({
            port: Server.PORT
        });

        this.bind();
    }

    /**
     * Bind all relevant events.
     */
    private bind(): void {
        this.on("close", this.onClose.bind(this));
        this.on("connection", this.onConnection.bind(this));
        this.on("error", this.onError.bind(this));
        this.on("listening", this.onListening.bind(this));
    }

    private onListening(): void {
        $.success(`Server listening on port :${Server.PORT}`);
    }

    private onConnection(socket: Websocket): void {
        this.socketManager.addSocket(new Socket(socket));
    }

    private onClose(): void {}

    private onError(): void {}
}
