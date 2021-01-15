import WebSocket from "ws";
import { Auth } from "./auth";
import { Channel } from "./channel";

export module Socket {
    type EventTypes = {
        "login:request": {
            username: string;
            password: string;
        };
        "login:response": {
            success: boolean;
            id?: string;
        };
        /**
         * Client -> Server
         */
        "message:send": {
            author?: Auth.UserData;
            message: {
                content: string;
                date?: number;
            };
        };
        /**
         * Event for a user joining a channel.
         */
        "channel:join": {
            channel: string;
            user: string;
        };
        /**
         * Event for a user leaving a channel.
         */
        "channel:leave": {
            channel: string;
            user: string;
        };
    };

    type Event = {
        event: string;
        payload: any;
    };

    type HandleSocketFunction = (socket: WebSocket) => void;

    /**
     * Type for an enhanced socket connection.
     * Or simply: A wrapper around an existing socket.
     * It features several other features like authentication etc.
     */
    type EnhancedWebsocket = {
        send: typeof WebSocket.prototype.send;
        on: typeof WebSocket.prototype.on;
        close: typeof WebSocket.prototype.close;
        /**
         * Id of this socket connection.
         * Not to confuse with the id of the user using this socket.
         */
        id: string;
        /**
         * Wrapper around `socket.send`.
         * It produces the following call:
         *
         * ```
         *  socket.send(JSON.stringfy({
         *      event: ${event},
         *      payload: ${payload}
         *  }))
         * ```
         *
         * @param event event to emit on the websocket
         * @param payload payload to send
         */
        emit<T extends keyof Socket.EventTypes>(event: T, payload: Socket.EventTypes[T]): void;
        /**
         * Try to authenticate as a user of this websocket.
         * @param data login data of the user
         */
        login(data: Auth.Data): void;
        /**
         * Flag, whether a user is authenticated.
         */
        authenticated: boolean;
        /**
         * If present, user information of the authenticated user.
         */
        user: Auth.UserData | null;
        join(channel: Channel.TextChannel): void;
    };

    type EnhanceSocketFunction = (socket: WebSocket) => EnhancedWebsocket;

    type Module = {
        handleSocket: HandleSocketFunction;
    };
}
