import $ from "logsen";
import Server from "./server/server";

(() => {
    $.setTimestamp($.defaultTimestamp);
    new Server().start();
})();
