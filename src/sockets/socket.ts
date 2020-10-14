/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { EventEmitter } from "events";
import WebSocket from "ws";
import { v4 as uuid } from "uuid";

/**
 * Structure of events
 */
interface SocketEvent {
    method: string;
    payload: any | any[];
}

/**
 * Class for wrapping around a single socket connection.
 */
export class Socket extends EventEmitter {
    private _id: string;

    private ws: WebSocket;

    public constructor(ws: WebSocket) {
        super();
        this._id = uuid();
        this.ws = ws;
        this.bind();
    }

    /**
     * Bind all relevant events.
     */
    private bind(): void {
        this.ws.on("message", this.onMessage.bind(this));

        // Bind close and error extra and emit them on this object.
        this.ws.on("close", (code, _reason) => {
            this.onClose();
            this.emit("close", code);
        });

        this.ws.on("error", err => {
            this.emit("error", err);
        });
    }

    /**
     * Handle the reception of data over the websocket.
     *
     * @param data data received of the websocket
     */
    private onMessage(data: any): void {
        try {
            const parsed: SocketEvent = JSON.parse(data);
            if (Array.isArray(parsed.payload)) {
                this.emit(parsed.method, ...parsed.payload);
            } else {
                this.emit(parsed.method, parsed.payload);
            }
        } catch (e) {
            // Close socket upon receiving an incorrect message
            this.ws.close();
        }
    }

    public get id(): string {
        return this._id;
    }

    private onClose(): void {
        // perform actions when closing the connection
    }
}
