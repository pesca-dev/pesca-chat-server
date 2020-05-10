import { Client } from "socket-chat-protocol";
import { ChannelManager } from "../channel/channelManager";
import { Socket } from "../sockets/socket";
import { SocketManager } from "../sockets/socketManager";
import { UserOptions, User } from "./user";

const STANDARD_USERS: UserOptions[] = [
    {
        id: "1",
        username: "admin"
    },
    {
        id: "2",
        username: "test"
    }
];

/**
 * Interface representing the return value of the Credentials Check.
 */
export interface LoginObject {
    success: boolean;
    id?: string;
}

/**
 * Class for managing users.
 */
export class Usermanager {
    private socketManager!: SocketManager;
    private channelManager!: ChannelManager;

    private users!: Map<string, User>;

    constructor() {
        this.init();
    }

    public start(socketManager: SocketManager, channelManager: ChannelManager): void {
        this.socketManager = socketManager;
        this.channelManager = channelManager;
        this.setup();
    }

    private init(): void {
        this.users = new Map<string, User>();
    }

    /**
     * Setup some default data.
     */
    private setup(): void {
        for (const o of STANDARD_USERS) {
            const user = new User(this.socketManager, o);
            const defaultChannel = this.channelManager.getChannel("default");
            if (defaultChannel) {
                user.channels.join(defaultChannel);
            }
            this.users.set(user.username, user);
        }
    }

    /**
     * Get a user by name.
     * @param name name of the user to get
     */
    public getUser(name: string): User | undefined {
        return this.users.get(name);
    }

    /**
     * Add a user.
     * @param user user to add
     * @returns true, if the user was successfully added
     * @returns false, if the user could not be added
     */
    public addUser(user: User): boolean {
        if (this.users.has(user.username)) {
            return false;
        }
        this.users.set(user.username, user);
        return true;
    }

    /**
     * Process the login request of a socket.
     * @param socket socket to login
     * @param request request to process
     */
    public async login(socket: Socket, request: Client.LoginRequest): Promise<void> {
        if (socket.user) {
            this.socketManager.emit(socket, "server/login-response", [
                {
                    username: request.username,
                    success: true,
                    id: socket.user.id
                }
            ]);
            return;
        }

        // Check, if the given requests includes valid credentials
        const credentialCheck = await this.checkCredentials(request);
        if (credentialCheck.success && credentialCheck.id) {
            const user = this.getUser(request.username.toLocaleLowerCase());
            if (!user) {
                this.socketManager.emit(socket, "error/internal-error", [
                    {
                        request: "server/login-request" as any,
                        type: "internal error" as any,
                        code: 500 as any,
                        message: "An internal error happend during login process."
                    }
                ]);
                return;
            }

            socket.user = user;
            user.addSocket(socket);
            this.socketManager.addExtendedEventsToSocket(socket);
            this.socketManager.emit(socket, "server/login-response", [
                {
                    username: request.username,
                    id: credentialCheck.id,
                    success: true
                }
            ]);
        } else {
            this.socketManager.emit(socket, "server/login-response", [
                {
                    username: request.username,
                    id: "-1",
                    success: false
                }
            ]);
        }
    }

    /**
     * Check the credentials provided.
     */
    private async checkCredentials({ username, password }: Client.LoginRequest): Promise<LoginObject> {
        // TODO: Add real authentication
        if (!username || !password) {
            return {
                success: false
            };
        }

        return {
            success: true,
            id: "1"
        };
    }
}
