import { v4 as uuid } from "uuid";
import { Auth, Channel, Socket } from "../api";
import { makeEnhanceSocket } from "./enhanceSocket";
import { makeHandleSocket } from "./handleSocket";

type MakeSocketOptions = {
    authenticate: Auth.AuthenticateFunction;
    createTextChannel: Channel.CreateChannelFunction<Channel.TextChannel>;
};

export function makeSocket({ authenticate, createTextChannel }: MakeSocketOptions): Socket.Module {
    const textChannel = createTextChannel();

    const enhanceSocket = makeEnhanceSocket({
        authenticate,
        makeId: uuid
    });

    const handleSocket = makeHandleSocket({
        textChannel,
        enhanceSocket
    });

    return Object.freeze({
        handleSocket
    });
}
