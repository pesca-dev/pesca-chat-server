import { join } from "path";
import { UserDatabase } from "./userDatabase";

/**
 * Class for managing database interactions.
 */
export class DatabaseManager {
    private static readonly USER_DB_PATH = join(__dirname, "../../db/user_datastore.db");

    private _users: UserDatabase;

    constructor() {
        this._users = new UserDatabase(DatabaseManager.USER_DB_PATH);
    }

    public get users(): UserDatabase {
        return this._users;
    }
}
