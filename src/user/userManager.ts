import bcrypt from "bcrypt";
import { Client } from "socket-chat-protocol";
import { v4 as uuid } from "uuid";
import { ChannelManager } from "../channel/channelManager";
import { DatabaseManager } from "../db/databaseManager";
import { Socket } from "../sockets/socket";
import { SocketManager } from "../sockets/socketManager";
import { UserOptions, User } from "./user";

// const STANDARD_USERS: UserOptions[] = [
//     {
//         id: "1",
//         username: "admin",
//         password: "password"
//     },
//     {
//         id: "2",
//         username: "test",
//         password: "test"
//     }
// ];

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
    private db: DatabaseManager;

    private users!: Map<string, User>;

    constructor(db: DatabaseManager) {
        this.db = db;
        this.init();
    }

    public async start(socketManager: SocketManager, channelManager: ChannelManager): Promise<void> {
        this.socketManager = socketManager;
        this.channelManager = channelManager;
        await this.setup();
    }

    private init(): void {
        this.users = new Map<string, User>();
    }

    /**
     * Setup some default data.
     */
    private async setup(): Promise<void> {
        const options: UserOptions[] = await this.db.users.all();
        for (const o of options) {
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
     * @deprecated use `register` instead
     */
    public addUser(user: User): boolean {
        if (this.users.has(user.username)) {
            return false;
        }
        this.users.set(user.username, user);
        return true;
    }

    /**
     * Register a new user.
     */
    public async register(socket: Socket, { username, password }: Client.UserDataObject): Promise<void> {
        if (!this.users.has(username)) {
            const options: UserOptions = {
                username,
                password: await bcrypt.hash(password, 10),
                id: uuid()
            };

            if (await this.db.users.add(options)) {
                const defaultChannel = this.channelManager.getChannel("default");
                const user = new User(this.socketManager, options);
                this.users.set(username, new User(this.socketManager, options));
                if (defaultChannel) {
                    user.channels.join(defaultChannel);
                }
                this.socketManager.emit(socket, "server/register-response", [
                    {
                        id: options.id ?? "",
                        username,
                        success: true
                    }
                ]);
                return;
            }
        }
        this.socketManager.emit(socket, "server/register-response", [
            {
                id: "-1",
                success: false,
                username: ""
            }
        ]);
    }

    /**
     * Process the login request of a socket.
     * @param socket socket to login
     * @param request request to process
     */
    public async login(socket: Socket, request: Client.UserDataObject): Promise<void> {
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
    private async checkCredentials({ username, password }: Client.UserDataObject): Promise<LoginObject> {
        const user: UserOptions | undefined = await this.db.users.get(username);
        if (!user) {
            return {
                success: false
            };
        }

        const success = await bcrypt.compare(password, user.password);
        return {
            success,
            id: user.id
        };
    }
}
