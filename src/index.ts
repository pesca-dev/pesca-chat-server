import { makeServer } from "./server";
import { makeSocket } from "./socket";
import { makeAuth } from "./auth";
import { makeCreateTextChannel } from "./channel/textChannel";

const { authenticate } = makeAuth();
const createTextChannel = makeCreateTextChannel();

const { handleSocket } = makeSocket({ authenticate, createTextChannel });

makeServer({ handleSocket })();
