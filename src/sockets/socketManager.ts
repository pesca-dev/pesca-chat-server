import { Singleton } from "dependory";
import { Socket } from "./socket";

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
    public addSocket(socket: Socket) {
        this.sockets.set(socket.id, socket);
        socket.on("close", () => {
            this.sockets.delete(socket.id);
        });
    }
}
