import { Server } from "ws";

type MakeCreateServerOptions = {
    defaultPort: number;
};

type ServerOptions = {
    port?: number;
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
