export module Auth {
    type Data = {
        username: string;
        password: string;
    };

    type Return = {
        success: boolean;
        user?: UserData;
    };

    type AuthenticateFunction = (data: Auth.Data) => Auth.Return;

    type UserData = {
        id: string;
        username: string;
    };

    type Module = {
        authenticate: Auth.AuthenticateFunction;
    };
}
