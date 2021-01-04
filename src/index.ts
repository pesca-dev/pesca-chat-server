import { v4 as makeId } from "uuid";
import { makeServer } from "./server";
import { makeSocketModule } from "./socket";
import { makeAuthModule } from "./auth";
import { makeCreateTextChannel } from "./channel/textChannel";
import $ from "logsen";

$.setTimestamp($.defaultTimestamp);

const { authenticate } = makeAuthModule();
const createTextChannel = makeCreateTextChannel({ makeId });

const { handleSocket } = makeSocketModule({ authenticate, createTextChannel, makeId });

makeServer({ handleSocket })();
