import $ from "logsen";
import { Socket, NextFunction } from "socket.io";

/**
 * Setup the user-object for any incomming socket.
 * @param socket socket to setup the object for.
 * @param next nextfunction to call
 */
export function setupUserObject(socket: Socket, next: NextFunction): void {
    $.log("Setting up user object");
    socket.user = {
        id: "-1"
    };
    next();
}
