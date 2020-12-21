import $ from "logsen";
import WebSocket from "ws";
import { makeCreateServer } from "./createServer";

type MakeServerOptions = {
    handleSocket: (socket: WebSocket) => void;
};

export function makeServer({ handleSocket }: MakeServerOptions): () => void {
    return function (): void {
        const createServer = makeCreateServer({
            defaultPort: 3000
        });

        const server = createServer();

        server.on("listening", () => {
            $.success("Server listening!");
        });

        /**
         * Handle incomming socket connections.
         */
        server.on("connection", handleSocket);
    };
}
