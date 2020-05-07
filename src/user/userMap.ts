import { EventEmitter } from "events";
import { Client } from "socket-chat-protocol";
import { User } from "./user";

/**
 * Wrapper-class around a map to keep track of Users.
 */
export class UserMap extends EventEmitter {
    private users: Map<string, User>;

    constructor() {
        super();
        this.users = new Map<string, User>();
    }

    /**
     * Fire an event on all users in this map.
     * @param event event to be fired
     * @param data data to be send during this event
     */
    public async fire<K extends keyof Client.Event>(event: K, data: Client.Event[K]): Promise<void> {
        this.users.forEach(user => {
            user.fire(event, data);
        });
    }

    /**
     * Check, whether a user in this in this map.
     * @param key key of the user to check
     */
    public has(key: string): boolean {
        return this.users.has(key);
    }

    /**
     * Insert a new user to this map.
     * @param key id of the user
     * @param value user to be added
     */
    public set(key: string, value: User): UserMap {
        this.users.set(key, value);
        return this;
    }

    /**
     * Add a user to this map.
     * @param user user to add
     */
    public add(user: User): UserMap {
        return this.set(user.username, user);
    }

    /**
     * Delete a specified key from this map.
     * @param key key of the user to be deleted
     */
    public delete(key: string): boolean {
        return this.users.delete(key);
    }

    /**
     * Execute a function for all users in this map.
     * @param fn function to execute
     * @param thisArg execution-context of the function
     */
    public forEach(fn: (value: User, key: string) => void, thisArg?: any): void {
        this.users.forEach(fn, thisArg);
    }

    /**
     * Same as 'forEach', but async.
     * So you do not wait for the functions to finish.
     */
    public async forEachAsync(fn: (value: User, key: string) => void, thisArg?: any): Promise<void> {
        this.users.forEach(fn, thisArg);
    }
}
