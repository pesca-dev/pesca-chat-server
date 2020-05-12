import { Server, Client, SocketEventManager } from "socket-chat-protocol";
// import { AuthenticationManager } from "../authentication/authenticationManager";
import { ChannelManager } from "../channel/channelManager";
import { UserManager } from "../user/userManager";
import { MethodFactory } from "./methodfactory";
import { Socket } from "./socket";

/**
 * Class for managing sockets and applying eventing on them.
 */
export class SocketManager implements SocketEventManager<Server.Event, Client.Event> {
    private _channelManager!: ChannelManager;
    private _userManager!: UserManager;

    /**
     * Start the SocketManger and hand it the current instance of ChannelManager.
     * @param channelManager current instance of the ChannelManager
     */
    public init(channelManager: ChannelManager, userManager: UserManager): void {
        this._channelManager = channelManager;
        this._userManager = userManager;
    }

    /**
     * Add some basic events to a socket.
     * "server/login-request"
     * "server/register-request"
     */
    public addBasicEventsToSocket(socket: Socket): void {
        this.register(socket, "server/login-request", MethodFactory.createMethod(socket, "server/login-request", this));
        this.register(
            socket,
            "server/register-request",
            MethodFactory.createMethod(socket, "server/register-request", this)
        );
    }

    /**
     * Add a new socket and register all events on it.
     * @param socket socket to add
     */
    public addExtendedEventsToSocket(socket: Socket): void {
        this.register(socket, "channel/send-message", MethodFactory.createMethod(socket, "channel/send-message", this));
        this.register(socket, "channel/join-request", MethodFactory.createMethod(socket, "channel/join-request", this));
        this.register(
            socket,
            "channel/leave-request",
            MethodFactory.createMethod(socket, "channel/leave-request", this)
        );
        this.register(
            socket,
            "channel/create-request",
            MethodFactory.createMethod(socket, "channel/create-request", this)
        );
        this.register(
            socket,
            "channel/delete-request",
            MethodFactory.createMethod(socket, "channel/delete-request", this)
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
        socket.send(event, data);
    }

    /**
     * Get the current ChannelManager.
     */
    public get channelManager(): ChannelManager {
        return this._channelManager;
    }

    public get userManager(): UserManager {
        return this._userManager;
    }
}
