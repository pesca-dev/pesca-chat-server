import { Channel } from "../api";
import { makeCreateTextChannel } from "./textChannel";

export function makeChannel(): Channel.Module {
    const createTextChannel = makeCreateTextChannel();

    return {
        createTextChannel
    };
}
