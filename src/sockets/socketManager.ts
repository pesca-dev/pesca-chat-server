import { Singleton } from "dependory";
import { Socket } from "./socket";

/**
 * Class for managing all sockets currently connected to server.
 */
@Singleton()
export class SocketManager {
    private sockets: Map<string, Socket>;

    public constructor() {
        this.sockets = new Map<string, Socket>();
    }

    /**
     * Add a new socket to the current collection.
     *
     * @param socket socket to add
     */
    public addSocket(socket: Socket): void {
        this.sockets.set(socket.id, socket);

        // Bind to the close event and remove the socket from the map
        socket.on("close", () => {
            this.sockets.delete(socket.id);
        });
    }
}
