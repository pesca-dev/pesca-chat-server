import $ from "logsen";
import { HandleSocketFunction } from "../socket/handleSocket";
import { makeCreateServer } from "./createServer";

type MakeServerOptions = {
    handleSocket: HandleSocketFunction;
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
