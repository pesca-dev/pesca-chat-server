import { join } from "path";
import { ChannelDatabase } from "./channelDatabase";
import { JoinDatabase } from "./joinDatabase";
import { UserDatabase } from "./userDatabase";

/**
 * Class for managing database interactions.
 */
export class DatabaseManager {
    private static readonly USER_DB_PATH = join(__dirname, "../../db/user_datastore.db");
    private static readonly CHANNEL_DB_PATH = join(__dirname, "../../db/channel_datastore.db");
    private static readonly JOIN_DB_PATH = join(__dirname, "../../db/join_datastore.db");

    private _users: UserDatabase;
    private _channels: ChannelDatabase;
    private _joins: JoinDatabase;

    constructor() {
        this._users = new UserDatabase(DatabaseManager.USER_DB_PATH);
        this._channels = new ChannelDatabase(DatabaseManager.CHANNEL_DB_PATH);
        this._joins = new JoinDatabase(DatabaseManager.JOIN_DB_PATH);
    }

    /**
     * Database for managing users.
     */
    public get users(): UserDatabase {
        return this._users;
    }

    /**
     * Database for managing channels.
     */
    public get channels(): ChannelDatabase {
        return this._channels;
    }

    /**
     * Database for managing channel joins.
     */
    public get joins(): JoinDatabase {
        return this._joins;
    }
}
