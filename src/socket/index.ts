/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { v4 as uuid } from "uuid";
import { AuthenticateFunction } from "../auth/authenticate";
import { HandleSocketFunction, makeHandleSocket } from "./handleSocket";

type MakeSocketOptions = {
    authenticate: AuthenticateFunction;
};

export type SocketModule = {
    handleSocket: HandleSocketFunction;
};

export function makeSocket({ authenticate }: MakeSocketOptions): SocketModule {
    const handleSocket = makeHandleSocket({
        makeId: uuid,
        authenticate
    });
    return Object.freeze({
        handleSocket
    });
}
