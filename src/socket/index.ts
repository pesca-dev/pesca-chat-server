import { v4 as uuid } from "uuid";
import { makeHandleSocket } from "./handleSocket";

const handleSocket = makeHandleSocket({
    makeId: uuid
});

export { handleSocket };
