import { Auth } from "../api";
import { makeAuthenticate } from "./authenticate";

export function makeAuthModule(): Auth.Module {
    const authenticate = makeAuthenticate();

    return Object.freeze({
        authenticate
    });
}
