type AuthData = {
    username: string;
    password: string;
};

type AuthReturn = {
    success: boolean;
    id?: string;
};

export type AuthenticateFunction = (data: AuthData) => AuthReturn;

export function makeAuthenticate() {
    return function ({ username = "", password = "" }: AuthData): AuthReturn {
        const authed = !!username && !!password;
        return {
            success: authed,
            id: authed ? "123" : "-1"
        };
    };
}
