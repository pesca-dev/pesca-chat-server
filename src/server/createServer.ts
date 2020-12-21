/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Server } from "ws";

type ServerOptions = {
    port?: number;
};

type MakeCreateServerOptions = {
    defaultPort: number;
};

/**
 * Factory for a createServer function.
 */
export function makeCreateServer({ defaultPort }: MakeCreateServerOptions): () => Server {
    return function ({ port }: ServerOptions = {}): Server {
        return new Server({
            port: port ?? defaultPort
        });
    };
}
