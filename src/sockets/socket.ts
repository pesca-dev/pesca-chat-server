import { EventEmitter } from "events";
import { Client } from "socket-chat-protocol";
import { v4 as uuid } from "uuid";
import WebSocket from "ws";

interface UserObject {
    id?: string;
    username?: string;
}

/**
 * Class for representing a socket internally.
 *
 * Wrapper-Object for websockets.
 */
export class Socket extends EventEmitter {
    /**
     * Websocket to wrap around.
     */
    private ws: WebSocket;

    /**
     * UUID if this socket.
     */
    private _id: string;

    /**
     * User-details of this socket.
     */
    public user: UserObject;

    constructor(ws: WebSocket) {
        super();
        this.ws = ws;
        this._id = uuid();
        this.user = {};
        this.bind();
    }

    /**
     * Bind all relevant events.
     */
    private bind(): void {
        // Bind the message event.
        this.ws.on("message", this.onMessage.bind(this));

        // Bind close and error extra and emit them on this object.
        this.ws.on("close", (code, _reason) => {
            this.emit("close", code);
        });
        this.ws.on("error", err => {
            this.emit("error", err);
        });
    }

    /**
     * Send an event over the socket and wrap it in a message.
     * @param event eventname to send
     * @param data data to send
     */
    public send<K extends keyof Client.Event>(event: K, data: Client.Event[K]): void {
        const message = {
            method: event,
            params: data
        };
        this.ws.send(JSON.stringify(message));
    }

    /**
     * Handle incomming messages and emit their `method` as an event on this object.
     * @param data data to parse
     */
    private async onMessage(data: any): Promise<void> {
        try {
            if (typeof data === "string") {
                const parsed = JSON.parse(data);
                if (parsed?.method) {
                    this.emit(parsed.method, parsed.params);
                }
            }
        } catch (_e) {
            //
        }
    }

    /**
     * Get the ID of this socket.
     */
    public get id(): string {
        return this._id;
    }
}

export function enhance(socket: WebSocket): Socket {
    return new Socket(socket);
}
