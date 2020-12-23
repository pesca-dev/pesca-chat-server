import WebSocket from "ws";
import { Auth, Socket } from "../api";

type MakeEnhanceSocketOptions = {
    authenticate: Auth.AuthenticateFunction;
    makeId(): string;
};

/**
 * Add extra parameter to socket.
 */
export function makeEnhanceSocket({ makeId, authenticate }: MakeEnhanceSocketOptions): Socket.EnhanceSocketFunction {
    return function (socket: WebSocket): Socket.EnhancedWebsocket {
        const _id = makeId();

        let userData: Auth.UserData | null = null;

        function authSocket(data: Auth.Data): void {
            const authReturn = authenticate(data);
            if (authReturn.success && authReturn.user) {
                userData = authReturn.user;
            }
        }

        function emit<T extends keyof Socket.EventTypes>(event: T, payload: Socket.EventTypes[T]): void {
            socket.send(
                JSON.stringify({
                    event,
                    payload
                })
            );
        }

        return {
            get id() {
                return _id;
            },
            send: socket.send.bind(socket),
            emit,
            on: socket.on.bind(socket),
            close: socket.close.bind(socket),
            get authenticated() {
                return !!userData;
            },
            get user() {
                return Object.freeze(userData);
            },
            login: authSocket
        };
    };
}
