import { Channel } from "../channel/channel";
import { User } from "./user";

/**
 * Class for managing channels for a user.
 */
export class UserChannelManager {
    private user: User;
    private _channels: Map<string, Channel>;

    constructor(user: User) {
        this.user = user;
        this._channels = new Map<string, Channel>();
    }

    /**
     * Setup this manager with a given list of channels to join.
     */
    public async setup(channels: Channel[]): Promise<void> {
        channels.forEach(async channel => {
            this._channels.set(channel.name, channel);
        });
    }

    /**
     * Join a specific channel.
     * @param channel channel to join
     * @param password password for the channel, if it needs one
     */
    public async join(channel: Channel, password?: string): Promise<boolean> {
        if (channel.enter(this.user, password)) {
            this._channels.set(channel.name, channel);
            return true;
        }
        return false;
    }

    /**
     * Leave a specified channel.
     * @param channel channel to leave
     */
    public async leave(channel: Channel): Promise<void> {
        if (this._channels.has(channel.name)) {
            channel.leave(this.user);
            this._channels.delete(channel.name);
        }
    }

    /**
     * Leave all channels.
     */
    public async leaveAll(): Promise<void> {
        // tslint:disable-next-line: forin
        for (const ch in this._channels) {
            const channel = this._channels.get(ch);
            channel?.leave(this.user);
            this._channels.delete(ch);
        }
    }

    /**
     * Check, if user is in a specific channel.
     * @param channel channel to check
     */
    public has(channel: Channel): boolean {
        return this._channels.has(channel.name);
    }

    /**
     * Get the all channel names.
     */
    public get channels(): string[] {
        return [...this._channels.keys()];
    }
}
