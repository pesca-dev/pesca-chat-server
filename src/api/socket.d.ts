import WebSocket from "ws";
import { Auth } from "./auth";

export module Socket {
    type EventTypes = {
        "login:request": {
            username: string;
            password: string;
        };
        "login:response": {
            success: boolean;
        };
    };

    type Event = {
        event: string;
        payload: any;
    };

    type HandleSocketFunction = (socket: WebSocket) => void;

    type EnhancedWebsocket = {
        id: string;
        send: typeof WebSocket.prototype.send;
        on: typeof WebSocket.prototype.on;
        close: typeof WebSocket.prototype.close;
        authenticated: boolean;
        user: Auth.UserData | null;
        login(data: Auth.Data): void;
    };

    type EnhanceSocketFunction = (socket: WebSocket) => EnhancedWebsocket;

    type Module = {
        handleSocket: HandleSocketFunction;
    };
}
