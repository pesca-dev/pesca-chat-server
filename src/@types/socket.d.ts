declare namespace SocketIO {
    interface Socket {
        /**
         * Object for identifying a user.
         */
        user: UserObject;
    }

    interface UserObject {
        id?: string;
        username?: string;
    }

    type NextFunction = (err?: any) => void;
}
