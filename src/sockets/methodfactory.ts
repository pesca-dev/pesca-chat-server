import $ from "logsen";
import { Server, Client } from "socket-chat-protocol";
import { Socket } from "socket.io";
import { Channel } from "../channel/channel";
import { SocketManager } from "./socketManager";

/**
 * Factory for creating callback functions for events.
 */
// tslint:disable-next-line: no-unnecessary-class
export class MethodFactory {
    /**
     * Create a callbackfunction for a given event with given socket-instance and execution-context.
     * @param socket socket instance
     * @param event event name
     * @param ctx execution context
     */
    public static createMethod<K extends keyof Server.Event>(
        socket: Socket,
        event: K,
        ctx: any
    ): (data: Server.Event[K]) => void {
        switch (event) {
            case "disconnect":
                return function(_reason: Server.Event[K]): void {
                    (ctx as Channel).leave(socket);
                };

            case "error":
                return function(reason: Server.Event[K]): void {
                    $.log(reason);
                };

            case "channel/send-message":
                return function(msgs: Server.Event[K]): void {
                    const messages: Server.TextMessage[] = (msgs as Client.TextMessage[]).map(m => {
                        return {
                            ...m,
                            id: `${Math.floor(Math.random() * 1000000)}`,
                            timestamp: `${Date.now()}`
                        };
                    });
                    messages.forEach(async m => {
                        const channel = (ctx as SocketManager).channelManager.getChannel(m.channel);
                        // Check, if the channel exists and the socket is in this channel
                        if (channel && channel.contains(socket)) {
                            channel.fire("channel/send-message", [m]);
                        }
                    });
                };

            default:
                return function(_data: Server.Event[K]): void {
                    //
                };
        }
    }
}
