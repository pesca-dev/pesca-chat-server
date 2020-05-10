import $ from "logsen";
import Datastore from "nedb";
import { join } from "path";
import { UserOptions } from "../user/user";

export class UserDatabase {
    private db: Datastore;

    constructor(filename = join(__dirname, "../../db/user_datastore.db")) {
        this.db = new Datastore({
            filename,
            autoload: true
        });
    }

    /**
     * Add a new user to the database.
     * @param user user to add
     */
    public async add(user: UserOptions): Promise<boolean> {
        return new Promise(resolve => {
            // TODO: use `getUser` instead of nested callbacks
            this.db.find({ username: user.username }, (err: any, users: UserOptions[]) => {
                if (err || users.length > 0) {
                    resolve(false);
                    return;
                }

                const data: UserOptions = {
                    id: user.id,
                    username: user.username,
                    password: user.password
                };
                this.db.insert(data, err => {
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
    public async get(username: string): Promise<UserOptions | undefined> {
        return new Promise(resolve => {
            this.db.find({ username }, (err: any, users: UserOptions[]) => {
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
    public async all(): Promise<UserOptions[]> {
        return new Promise(resolve => {
            this.db.find({}, (err: any, data: UserOptions[]) => {
                if (err) {
                    $.err(err);
                }
                resolve(data ?? []);
            });
        });
    }
}
