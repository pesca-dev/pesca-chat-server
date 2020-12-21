import { makeServer } from "./server";
import { handleSocket } from "./socket";

makeServer({ handleSocket })();
