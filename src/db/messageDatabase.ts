import $ from "logsen";
import Datastore from "nedb";
import { join } from "path";
import { Server } from "socket-chat-protocol";

export interface AllOptions {
    channel?: string;
    user?: string;
    limit?: number;
}

export class MessageDatabase {
    private db: Datastore;

    constructor(filename = join(__dirname, "../../db/channel_datastore.db")) {
        this.db = new Datastore({
            filename,
            autoload: true
        });
    }

    public async add(message: Server.TextMessage): Promise<void> {
        return new Promise(resolve => {
            this.db.insert(message, (err: Error) => {
                if (err) {
                    $.err(err);
                }
                resolve();
            });
        });
    }

    public async get(id: string): Promise<Server.TextMessage | undefined> {
        return new Promise(resolve => {
            this.db.find({ id }, (err: Error, messages: Server.TextMessage[]) => {
                if (err) {
                    $.err(err);
                    resolve();
                    return;
                }
                resolve(messages ? messages[0] : undefined);
            });
        });
    }

    // // TODO: Implement `message.all`
    // public async all(options?: AllOptions): Promise<Server.TextMessage[]> {
    //     const q: AllOptions = {};
    //     let limit;
    //     if (options) {
    //         for (const k in options) {
    //             if (k === "limit") {
    //                 continue;
    //             }
    //             q[k] = options[k];
    //         }
    //     }
    //     return new Promise(resolve => {});
    // }
}
