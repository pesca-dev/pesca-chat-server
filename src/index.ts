import fs from "fs";
import { join } from "path";
import $ from "logsen";

void (async () => {
    $.setTimestamp($.defaultTimestamp);
    await init();
})();

/**
 * Initialize everything.
 */
async function init(): Promise<void> {
    $.setTimestamp($.defaultTimestamp);
    await readDirectory(__dirname);
}

/**
 * Read a directory recursively and import all files in there.
 *
 * @param dir
 */
async function readDirectory(dir: string): Promise<void> {
    if (dir.includes("node_modules")) {
        return;
    }
    const paths = fs.readdirSync(dir, {
        withFileTypes: true
    });
    const promises: Promise<void>[] = [];
    for (const p of paths) {
        if (!p.isDirectory()) {
            promises.push(import(join(dir, p.name)));
        } else {
            promises.push(readDirectory(join(dir, p.name)));
        }
    }
    await Promise.all(promises);
}
