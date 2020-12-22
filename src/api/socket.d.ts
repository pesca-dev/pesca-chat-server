import WebSocket from "ws";

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

    type EnhancedWebsocket = WebSocket & {
        id: string;
    };

    type EnhanceSocketFunction = (socket: WebSocket) => EnhancedWebsocket;

    type Module = {
        handleSocket: HandleSocketFunction;
    };
}
