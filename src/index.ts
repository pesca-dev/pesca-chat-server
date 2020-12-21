import { makeServer } from "./server";
import { makeSocket } from "./socket";
import { makeAuth } from "./auth";

const { authenticate } = makeAuth();

const { handleSocket } = makeSocket({ authenticate });

makeServer({ handleSocket })();
