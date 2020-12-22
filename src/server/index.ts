import $ from "logsen";
import { Socket } from "../api";
import { makeCreateServer } from "./createServer";

type MakeServerOptions = {
    handleSocket: Socket.HandleSocketFunction;
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
