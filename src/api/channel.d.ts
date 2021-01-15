import { Socket } from "./socket";

export module Channel {
    type BaseChannel = {
        id: string;
    };

    type TextChannel = BaseChannel & {
        users: Readonly<Socket.EnhancedWebsocket[]>;
        add(socket: Socket.EnhancedWebsocket): void;
        remove(socket: Socket.EnhancedWebsocket | string): void;
        has(socket: Socket.EnhancedWebsocket | string): boolean;
        broadcast(msg: Socket.EventTypes["message:send"]): void;
        saveDelete(): void;
    };

    type CreateChannelFunction<T> = () => T;

    type Module = {
        createTextChannel(): Channel.TextChannel;
        deleteChannel(channel: Channel.BaseChannel | string): void;
    };
}
