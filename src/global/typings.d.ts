declare namespace Socket {
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
}
