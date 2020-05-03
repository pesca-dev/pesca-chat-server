/**
 * Exception which gets thrown, if a "new" channel already exists.
 * @deprecated
 */
export class ChannelAlreadyExistsException extends Error {
    constructor(channel: string) {
        super(`Channel '${channel}' already exists!`);
    }
}
