import { Channel } from "../api";
import { makeCreateTextChannel } from "./textChannel";

type MakeChannelOptions = {
    makeId(): string;
};

/**
 * Factory function for the channel module.
 */
export function makeChannel({ makeId }: MakeChannelOptions): Channel.Module {
    const channels: Map<string, Channel.TextChannel> = new Map<string, Channel.TextChannel>();
    const _createTextChannel = makeCreateTextChannel({ makeId });

    function createTextChannel(): Channel.TextChannel {
        const channel = _createTextChannel();
        channels.set(channel.id, channel);
        return channel;
    }

    function deleteChannel(channel: Channel.BaseChannel | string): void {
        const id = typeof channel === "string" ? channel : channel.id;
        if (channels.has(id)) {
            const ch = channels.get(id);
            channels.delete(id);
            ch?.saveDelete();
        }
    }

    return Object.freeze({
        createTextChannel,
        deleteChannel
    });
}
