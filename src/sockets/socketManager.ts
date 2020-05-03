import { Server, Client, SocketEventManager } from "socket-chat-protocol";
import { Socket } from "socket.io";
import { ChannelManager } from "../channel/channelManager";
import { MethodFactory } from "./methodfactory";

/**
 * Class for managing sockets and applying eventing on them.
 */
export class SocketManager implements SocketEventManager<Server.Event, Client.Event> {
    private _channelManager!: ChannelManager;

    /**
     * Start the SocketManger and hand it the current instance of ChannelManager.
     * @param channelManager current instance of the ChannelManager
     */
    public start(channelManager: ChannelManager): void {
        this._channelManager = channelManager;
    }

    /**
     * Add a new socket and register all events on it.
     * @param socket socket to add
     */
    public addSocket(socket: Socket): void {
        /* this.channelManager.getChannel("default")?.join(socket, {
            action: "join",
            channel: "default"
        }); */
        this.register(socket, "channel/send-message", MethodFactory.createMethod(socket, "channel/send-message", this));
        this.register(socket, "channel/join-request", MethodFactory.createMethod(socket, "channel/join-request", this));
        this.register(
            socket,
            "channel/leave-request",
            MethodFactory.createMethod(socket, "channel/leave-request", this)
        );
    }

    /**
     * Register an event on a socket.
     * @param socket socket to register the event on
     * @param event event to register
     * @param fn function to execute upon receiving the event
     */
    public register<K extends keyof Server.Event>(socket: Socket, event: K, fn: (data: Server.Event[K]) => void): void {
        socket.on(event, fn);
    }

    /**
     * Emit an event on a socket.
     * @param socket socket to emit the event on
     * @param event event to emit
     * @param data data to send during this event
     */
    public async emit<K extends keyof Client.Event>(socket: Socket, event: K, data: Client.Event[K]): Promise<void> {
        socket.emit(event, data);
    }

    /**
     * Get the current ChannelManager.
     */
    public get channelManager(): ChannelManager {
        return this._channelManager;
    }
}
