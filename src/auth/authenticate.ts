import { Auth } from "../api";

export function makeAuthenticate(): Auth.AuthenticateFunction {
    return function ({ username = "", password = "" }: Auth.Data): Auth.Return {
        const authed = !!username && !!password;
        return {
            success: authed,
            user: {
                id: authed ? "123" : "-1",
                username
            }
        };
    };
}
