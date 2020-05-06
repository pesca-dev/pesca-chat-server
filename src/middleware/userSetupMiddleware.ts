import { Socket } from "../sockets/socket";

/**
 * Setup the user-object for any incomming socket.
 * @param socket socket to setup the object for.
 * @param next nextfunction to call
 */
export function setupUserObject(socket: Socket, next: any): void {
    socket.user = {};
    next();
}
