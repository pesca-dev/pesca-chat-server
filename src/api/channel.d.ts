import { Socket } from "./socket";

export module Channel {
    type TextChannel = {
        users: Readonly<Socket.EnhancedWebsocket[]>;
        add(socket: Socket.EnhancedWebsocket): void;
        remove(socket: Socket.EnhancedWebsocket | string): void;
        has(socket: Socket.EnhancedWebsocket | string): boolean;
        broadcast(msg: Socket.EventTypes["message:receive"]): void;
    };

    type CreateChannelFunction<T> = () => T;

    type Module = {
        createTextChannel(): Channel.TextChannel;
    };
}
