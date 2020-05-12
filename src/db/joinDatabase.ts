import $ from "logsen";
import Datastore from "nedb";
import { join } from "path";

export interface UserInChannel {
    user: string;
    channel: string;
}

export class JoinDatabase {
    private db: Datastore;

    constructor(filename = join(__dirname, "../../db/join_datastore.db")) {
        this.db = new Datastore({
            filename,
            autoload: true
        });
    }

    /**
     * Add the user channel combination to this database.
     * @param user user to add
     * @param channel channel to add
     */
    public async join(user: string, channel: string): Promise<boolean> {
        return new Promise(resolve => {
            this.db.find({ user, channel }, (err: Error, data: UserInChannel[]) => {
                if (err) {
                    $.err(err);
                    resolve(false);
                    return;
                }
                if (data.length > 0) {
                    resolve(true);
                    return;
                }

                this.db.insert({ user, channel }, err => {
                    if (err) {
                        $.err(err);
                        resolve(false);
                        return;
                    }
                    resolve(true);
                });
            });
        });
    }

    /**
     * Delete this user channel combination from this database.
     * @param user user to delete
     * @param channel channel to delete
     */
    public async leave(user: string, channel: string): Promise<boolean> {
        return new Promise(resolve => {
            this.db.remove({ user, channel }, err => {
                if (err) {
                    $.err(err);
                    resolve(false);
                    return;
                }
                resolve(true);
            });
        });
    }

    /**
     * Get all channels for a user.
     * @param user user to get the channels for
     */
    public async getForUser(user: string): Promise<UserInChannel[]> {
        return new Promise(resolve => {
            this.db.find({ user }, (err: Error, data: UserInChannel[]) => {
                if (err) {
                    $.err(err);
                    resolve([]);
                    return;
                }
                resolve(data);
            });
        });
    }

    /**
     * Get all users for a channel.
     * @param channel channel to get the users for
     */
    public async getForChannel(channel: string): Promise<UserInChannel[]> {
        return new Promise(resolve => {
            this.db.find({ channel }, (err: Error, data: UserInChannel[]) => {
                if (err) {
                    $.err(err);
                    resolve([]);
                    return;
                }
                resolve(data);
            });
        });
    }
}
