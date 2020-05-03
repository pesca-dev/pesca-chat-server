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
                    // Leave the channel, when you disconnect
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

            case "channel/join-request":
                return async function(requests: Server.Event[K]): Promise<void> {
                    (requests as Client.ChannelActionRequest<"join">[]).forEach(async r => {
                        const s = ctx as SocketManager;
                        const channel = s.channelManager.getChannel(r.channel);
                        if (channel) {
                            channel.join(socket, r);
                        } else {
                            s.emit(socket, "channel/join-response", [
                                {
                                    action: "join",
                                    channel: r.channel,
                                    success: false,
                                    reason: `Channel '${r.channel}' does not exist`
                                }
                            ]);
                        }
                    });
                };

            case "channel/leave-request":
                return async function(requests: Server.Event[K]): Promise<void> {
                    (requests as Client.ChannelActionRequest<"leave">[]).forEach(async r => {
                        const s = ctx as SocketManager;
                        const channel = s.channelManager.getChannel(r.channel);
                        if (channel) {
                            channel.leave(socket, r);
                        } else {
                            s.emit(socket, "channel/leave-response", [
                                {
                                    channel: "leave",
                                    action: r.action,
                                    success: false,
                                    reason: `Channel '${r.channel}' does not exist`
                                }
                            ]);
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
