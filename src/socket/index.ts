import { v4 as uuid } from "uuid";
import { Auth, Socket } from "../api";
import { makeEnhanceSocket } from "./enhanceSocket";
import { makeHandleSocket } from "./handleSocket";

type MakeSocketOptions = {
    authenticate: Auth.AuthenticateFunction;
};

export function makeSocket({ authenticate }: MakeSocketOptions): Socket.Module {
    const enhanceSocket = makeEnhanceSocket({
        makeId: uuid
    });

    const handleSocket = makeHandleSocket({
        authenticate,
        enhanceSocket
    });

    return Object.freeze({
        handleSocket
    });
}
