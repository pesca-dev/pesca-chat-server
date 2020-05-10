import $ from "logsen";
import Server from "./server/server";

(() => {
    fakeConsoleLog();
    $.setTimestamp($.defaultTimestamp);
    new Server().start();
})();

function fakeConsoleLog(): void {
    // tslint:disable-next-line: no-console
    const l = console.log;
    // tslint:disable-next-line: no-console
    console.log = function(): void {
        // process.stdout.clearLine();
        // process.stdout.cursorTo(0);
        l(...arguments);
    };
}
