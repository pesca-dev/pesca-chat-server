import { Auth, Channel, Socket } from "../api";
import { makeEnhanceSocket } from "./enhanceSocket";
import { makeHandleSocket } from "./handleSocket";

type MakeSocketOptions = {
    authenticate: Auth.AuthenticateFunction;
    createTextChannel: Channel.CreateChannelFunction<Channel.TextChannel>;
    makeId(): string;
};

/**
 * Create the socket module.
 */
export function makeSocket({ authenticate, createTextChannel, makeId }: MakeSocketOptions): Socket.Module {
    const textChannel = createTextChannel();

    const enhanceSocket = makeEnhanceSocket({
        authenticate,
        makeId
    });

    const handleSocket = makeHandleSocket({
        textChannel,
        enhanceSocket
    });

    return Object.freeze({
        handleSocket
    });
}
