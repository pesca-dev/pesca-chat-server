import { v4 as makeId } from "uuid";
import { makeServer } from "./server";
import { makeSocket } from "./socket";
import { makeAuth } from "./auth";
import { makeCreateTextChannel } from "./channel/textChannel";

const { authenticate } = makeAuth();
const createTextChannel = makeCreateTextChannel({ makeId });

const { handleSocket } = makeSocket({ authenticate, createTextChannel, makeId });

makeServer({ handleSocket })();
