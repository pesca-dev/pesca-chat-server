import { join } from "path";
import { ChannelDatabase } from "./channelDatabase";
import { UserDatabase } from "./userDatabase";

/**
 * Class for managing database interactions.
 */
export class DatabaseManager {
    private static readonly USER_DB_PATH = join(__dirname, "../../db/user_datastore.db");
    private static readonly CHANNEL_DB_PATH = join(__dirname, "../../db/channel_datastore.db");

    private _users: UserDatabase;
    private _channels: ChannelDatabase;

    constructor() {
        this._users = new UserDatabase(DatabaseManager.USER_DB_PATH);
        this._channels = new ChannelDatabase(DatabaseManager.CHANNEL_DB_PATH);
    }

    public get users(): UserDatabase {
        return this._users;
    }

    public get channels(): ChannelDatabase {
        return this._channels;
    }
}
