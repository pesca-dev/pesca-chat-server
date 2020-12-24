import { Auth } from "../api";

const users: Auth.Data[] = [
    {
        username: "lome",
        password: "test"
    },
    {
        username: "fwcd",
        password: "passwd"
    }
];

export function makeAuthenticate(): Auth.AuthenticateFunction {
    return function ({ username = "", password = "" }: Auth.Data): Auth.Return {
        const user = users.find(u => u.username === username && u.password === password);

        const authed = !!user;
        return Object.freeze({
            success: authed,
            user: {
                id: authed ? "123" : "-1",
                username
            }
        });
    };
}
