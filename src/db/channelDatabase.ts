import $ from "logsen";
import Datastore from "nedb";
import { join } from "path";
import { ChannelOptions } from "../channel/channelManager";

/**
 * Class for managing interactions with the Channel-Datastore.
 */
export class ChannelDatabase {
    private db: Datastore;

    constructor(filename = join(__dirname, "../../db/channel_datastore.db")) {
        this.db = new Datastore({
            filename,
            autoload: true
        });
    }

    /**
     * Insert a new Channel into the database.
     * @param channel optionss for the channel to add
     */
    public async add(channel: ChannelOptions): Promise<boolean> {
        return new Promise(resolve => {
            this.db.find({ name: channel.name }, (err: Error, channels: ChannelOptions[]) => {
                if (err || channels.length > 0) {
                    resolve(false);
                    return;
                }
                this.db.insert(channel, err => {
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
     * Get a channel from the database.
     * @param name name of the channel to get
     */
    public async get(name: string): Promise<ChannelOptions | undefined> {
        return new Promise(resolve => {
            this.db.find({ name }, (err: Error, channels: ChannelOptions[]) => {
                if (err) {
                    $.err(err);
                    resolve();
                    return;
                }
                resolve(channels ? channels[0] : undefined);
            });
        });
    }

    /**
     * Delete a channel from the database.
     * @param name name of the channel to delete
     */
    public async delete(name: string): Promise<boolean> {
        return new Promise(resolve => {
            this.db.remove({ name }, (err: Error, _numRemoved: number) => {
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
     * Get all channels from the database.
     */
    public async all(): Promise<ChannelOptions[]> {
        return new Promise(resolve => {
            this.db.find({}, (err: Error, data: ChannelOptions[]) => {
                if (err) {
                    $.err(err);
                }
                resolve(data ?? []);
            });
        });
    }
}
