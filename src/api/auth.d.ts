export module Auth {
    type Data = {
        username: string;
        password: string;
    };

    type Return = {
        success: boolean;
        id?: string;
    };

    type AuthenticateFunction = (data: Auth.Data) => Auth.Return;

    type Module = {
        authenticate: Auth.AuthenticateFunction;
    };
}
