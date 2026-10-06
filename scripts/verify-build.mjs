import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
async function snapshot() {
  const names = execFileSync("git", ["ls-files", "-z"], { cwd: root, encoding: "utf8" })
    .split("\0")
    .filter(Boolean)
    .sort();
  return Promise.all(
    names.map(async (path) => {
      try {
        return [path, hash(await readFile(join(root, path)))];
      } catch (error) {
        if (error.code === "ENOENT") return [path, "deleted"];
        throw error;
      }
    }),
  );
}
const before = await snapshot();
let prior;
for (let attempt = 0; attempt < 2; attempt++) {
  execFileSync(process.execPath, [join(root, "scripts/build-villages.mjs")], { cwd: root, stdio: "inherit" });
  const receipt = JSON.parse(await readFile(join(root, ".build-tmp/package-build.json"), "utf8"));
  assert.equal(hash(await readFile(receipt.retainedArchivePath)), receipt.sha256);
  if (prior) assert.equal(receipt.sha256, prior.sha256, "the same source must produce identical package bytes");
  prior = receipt;
  assert.deepEqual(await snapshot(), before, "building must not alter any tracked source file");
}
console.log(`Reproducible package ${prior.version}: ${prior.sha256}; tracked source unchanged.`);
