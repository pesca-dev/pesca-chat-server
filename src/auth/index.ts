import { AuthenticateFunction, makeAuthenticate } from "./authenticate";

type AuthModule = {
    authenticate: AuthenticateFunction;
};

export function makeAuth(): AuthModule {
    const authenticate = makeAuthenticate();

    return Object.freeze({
        authenticate
    });
}
