import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const parserRequire = createRequire(require.resolve("@typescript-eslint/typescript-estree"));
const { globSync, isDynamicPattern } = parserRequire("tinyglobby");
const root = fileURLToPath(new URL("../", import.meta.url));

assert.equal(isDynamicPattern(join(root, "tsconfig.package.json")), false);
assert.equal(isDynamicPattern(join(root, "tsconfig*.json")), true);
assert.deepEqual(
  globSync(join(root, "tsconfig*.json"), { cwd: root, ignore: ["**/tsconfig.engine-tests.json"] })
    .map((file) => basename(file))
    .sort(),
  ["tsconfig.json", "tsconfig.package.json"],
);
assert.deepEqual(globSync("scr*pts", { cwd: root, ignore: [] }), []);
console.log("Lint project glob resolves configuration files and excludes ignored paths and directories.");
