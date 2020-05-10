import $ from "logsen";
import Datastore from "nedb";
import { join } from "path";
import { UserOptions } from "../user/user";

/**
 * Class for managing database interactions.
 */
export class DatabaseManager {
    private static readonly USER_DB_PATH = join(__dirname, "../../db/user_datastore.db");

    private users: Datastore;

    constructor() {
        this.users = new Datastore({
            filename: DatabaseManager.USER_DB_PATH,
            autoload: true
        });
    }

    /**
     * Add a new user to the database.
     * @param user user to add
     */
    public async addUser(user: UserOptions): Promise<boolean> {
        return new Promise(resolve => {
            // TODO: use `getUser` instead of nested callbacks
            this.users.find({ username: user.username }, (err: any, users: UserOptions[]) => {
                if (err || users.length > 0) {
                    resolve(false);
                    return;
                }

                const data: UserOptions = {
                    id: user.id,
                    username: user.username,
                    password: user.password
                };
                this.users.insert(data, err => {
                    if (err) {
                        $.err(err);
                        resolve(false);
                    }
                    resolve(true);
                });
            });
        });
    }

    /**
     * Get a user with the specified username.
     * @param username username of the user to get
     */
    public async getUser(username: string): Promise<UserOptions | undefined> {
        return new Promise(resolve => {
            this.users.find({ username }, (err: any, users: UserOptions[]) => {
                if (err) {
                    $.err(err);
                    resolve();
                }
                resolve(users ? users[0] : undefined);
            });
        });
    }

    /**
     * Get all users in the database.
     */
    public async getAllUsers(): Promise<UserOptions[]> {
        return new Promise(resolve => {
            this.users.find({}, (err: any, data: UserOptions[]) => {
                if (err) {
                    $.err(err);
                }
                resolve(data ?? []);
            });
        });
    }
}
