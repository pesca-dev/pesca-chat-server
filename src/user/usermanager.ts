import { Client } from "socket-chat-protocol";
import { Channel } from "../channel/channel";
import { Socket } from "../sockets/socket";
import { SocketManager } from "../sockets/socketManager";

const STANDARD_USERS: UserOptions[] = [
    {
        id: "1",
        username: "admin"
    }
];

export class Usermanager {
    private socketManager!: SocketManager;

    private users!: Map<string, User>;

    constructor() {
        this.init();
    }

    public start(socketManager: SocketManager): void {
        this.socketManager = socketManager;
    }

    private init(): void {
        this.users = new Map<string, User>();
        this.setup();
    }

    private setup(): void {
        for (const o of STANDARD_USERS) {
            const user = new User(o);
            this.users.set(user.username, user);
        }
    }

    public getUser(name: string): User | undefined {
        return this.users.get(name);
    }

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

export interface UserOptions {
    id?: string;
    username?: string;
}

export class User {
    public id: string;
    public username: string;
    public channels: Map<string, Channel>;

    constructor(userOptions: UserOptions) {
        this.channels = new Map<string, Channel>();
        this.id = userOptions.id ?? "";
        this.username = userOptions.username ?? "";
    }
}

/**
 * Interface representing the return value of the Credentials Check.
 */
export interface LoginObject {
    success: boolean;
    id?: string;
}
