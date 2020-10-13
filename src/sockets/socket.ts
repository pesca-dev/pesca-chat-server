import WebSocket from "ws";
import { EventEmitter } from "events";
import { v4 as uuid } from "uuid";

interface SocketEvent {
    method: string;
    payload: any | any[];
}

export class Socket extends EventEmitter {
    private _id: string;

    public constructor(private readonly ws: WebSocket) {
        super();

        this._id = uuid();
        this.bind();
    }

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

    private onMessage(data: any): void {
        try {
            const parsed: SocketEvent = JSON.parse(data);
            if (Array.isArray(parsed.payload)) {
                this.emit(parsed.method, ...parsed.payload);
            } else {
                this.emit(parsed.method, parsed.payload);
            }
        } catch (e) {
            console.log("Didnt work....", e);
        }
    }

    public get id(): string {
        return this._id;
    }

    private onClose(): void {}
}
