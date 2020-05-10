import $ from "logsen";
import { Server, Client } from "socket-chat-protocol";
import { User } from "../user/user";
import { Socket } from "./socket";
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
    // tslint:disable-next-line: cyclomatic-complexity
    public static createMethod<K extends keyof Server.Event>(
        socket: Socket,
        event: K,
        ctx: any
    ): (data: Server.Event[K]) => void {
        switch (event) {
            case "close":
                /**
                 * Handle disconnects.
                 */
                return function(_reason: Server.Event[K]): void {
                    // Leave the channel, when you disconnect
                    (ctx as User).deleteSocket(socket);
                };

            case "error":
                /**
                 * Handle errors.
                 */
                return function(reason: Server.Event[K]): void {
                    $.err(reason);
                };

            case "channel/send-message":
                /**
                 * Handle a received array of messages
                 */
                return function(msgs: Server.Event[K]): void {
                    const s = ctx as SocketManager;
                    if (!Array.isArray(msgs)) {
                        s.emit(socket, "error/bad-request", [
                            {
                                type: "bad request",
                                code: 400,
                                request: event,
                                message: "Payload needs to be an array!"
                            }
                        ]);
                        return;
                    }
                    const messages: Server.TextMessage[] = (msgs as Client.TextMessage[]).map(m => {
                        // Create the correct message-object
                        return {
                            ...m,
                            author: socket.user.username ?? "Unknown User",
                            id: `${Math.floor(Math.random() * 1000000)}`,
                            timestamp: `${Date.now()}`
                        };
                    });
                    // Process all messages individually
                    messages.forEach(async m => {
                        const channel = s.channelManager.getChannel(m.channel);
                        // Check, if the channel exists and the socket is in this channel
                        if (channel && socket.user.isInChannel(channel)) {
                            channel.fire("channel/send-message", [m]);
                        }
                    });
                };

            case "channel/join-request":
                /**
                 * Handle a join request to a channel by a socket.
                 */
                return async function(requests: Server.Event[K]): Promise<void> {
                    const s = ctx as SocketManager;
                    if (!Array.isArray(requests)) {
                        s.emit(socket, "error/bad-request", [
                            {
                                type: "bad request",
                                code: 400,
                                request: event,
                                message: "Payload needs to be an array!"
                            }
                        ]);
                        return;
                    }
                    // Process all requests individually
                    (requests as Client.ChannelActionRequest<"join">[]).forEach(async r => {
                        // Fetch the channel and check, if it exists
                        const channel = s.channelManager.getChannel(r.channel);
                        if (channel) {
                            socket.user.joinChannel(channel, r.password);
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
                /**
                 * Handle a leave request from a channel by a socket.
                 */
                return async function(requests: Server.Event[K]): Promise<void> {
                    const s = ctx as SocketManager;
                    if (!Array.isArray(requests)) {
                        s.emit(socket, "error/bad-request", [
                            {
                                type: "bad request",
                                code: 400,
                                request: event,
                                message: "Payload needs to be an array!"
                            }
                        ]);
                        return;
                    }
                    // Process all requests individually
                    (requests as Client.ChannelActionRequest<"leave">[]).forEach(async r => {
                        // Fetch the channel and check, if it exists
                        const channel = s.channelManager.getChannel(r.channel);
                        if (channel) {
                            socket.user.leaveChannel(channel);
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

            case "channel/create-request":
                /**
                 * Handle a create request of a channel by a socket.
                 */
                return async function(data: Server.Event[K]): Promise<void> {
                    const s = ctx as SocketManager;
                    const requests = data as Client.ChannelActionRequest<"create">[];
                    if (!Array.isArray(requests)) {
                        s.emit(socket, "error/bad-request", [
                            {
                                type: "bad request",
                                code: 400,
                                request: event,
                                message: "Payload needs to be an array!"
                            }
                        ]);
                        return;
                    }
                    // Process all requests individually
                    requests.forEach(async r => {
                        // Only create channel, if there is a valid channelname
                        if (!r.channel) {
                            s.emit(socket, "channel/create-response", [
                                {
                                    action: "create",
                                    channel: "",
                                    success: false,
                                    reason: "No valid channelname provided!"
                                }
                            ]);
                            return;
                        }
                        // Create a new channel
                        s.channelManager.createChannel(r.channel, r.password, socket);
                    });
                };

            case "channel/delete-request":
                return async function(data: Server.Event[K]): Promise<void> {
                    const s = ctx as SocketManager;
                    const requests = data as Client.ChannelActionRequest<"delete">[];
                    if (!Array.isArray(requests)) {
                        s.emit(socket, "error/bad-request", [
                            {
                                type: "bad request",
                                code: 400,
                                request: event,
                                message: "Payload needs to be an array!"
                            }
                        ]);
                        return;
                    }

                    // Process all requests individually
                    requests.forEach(async r => {
                        if (!r.channel) {
                            s.emit(socket, "channel/delete-response", [
                                {
                                    action: "delete",
                                    channel: "",
                                    success: false,
                                    reason: "No valid channelname provided!"
                                }
                            ]);
                            return;
                        }
                        s.channelManager.deleteChannel(r.channel, socket);
                    });
                };

            case "server/login-request":
                /**
                 * Handle a login request to the server by a socket.
                 */
                return async function(requests: Server.Event[K]): Promise<void> {
                    const s = ctx as SocketManager;
                    if (!Array.isArray(requests)) {
                        s.emit(socket, "error/bad-request", [
                            {
                                type: "bad request",
                                code: 400,
                                request: event,
                                message: "Payload needs to be an array!"
                            }
                        ]);
                        return;
                    }
                    // Fetch the login request and if it is not valid, notify the client
                    const request: Client.LoginRequest = (requests as Client.LoginRequest[])[0];
                    if (!request) {
                        s.emit(socket, "server/login-response", [
                            {
                                username: "",
                                success: false,
                                id: ""
                            }
                        ]);
                    } else {
                        s.userManager.login(socket, request);
                    }
                };

            default:
                /**
                 * Default fallback. Never really needed. Maybe add some useless stuff here.
                 */
                return function(_data: Server.Event[K]): void {
                    //
                };
        }
    }
}
