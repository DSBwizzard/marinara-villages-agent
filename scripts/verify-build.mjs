import { acquireCheckoutOperation } from "./checkout-operation.mjs";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validationInputs } from "./validation-inputs.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const operation = await acquireCheckoutOperation(root);
try {
  const args = process.argv.slice(2);
  if (
    args.some((arg) => !/^--prior-(?:sha|input)=[a-f0-9]{64}$/.test(arg)) ||
    new Set(args.map((arg) => arg.split("=")[0])).size !== args.length
  )
    throw Error("Invalid prior build identity");
  const priorSha = args.find((arg) => arg.startsWith("--prior-sha="))?.slice(12);
  const priorInput = args.find((arg) => arg.startsWith("--prior-input="))?.slice(14);
  if (!!priorSha !== !!priorInput) throw Error("Prior build requires both archive and input identity");
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
  if (priorSha) {
    assert.equal((await validationInputs(root)).digest, priorInput, "Source changed since initial build");
    prior = JSON.parse(await readFile(join(root, ".build-tmp/package-build.json"), "utf8"));
    assert.equal(prior.sha256, priorSha);
    assert.equal(hash(await readFile(prior.retainedArchivePath)), priorSha, "Initial archive changed");
  }
  for (let attempt = 0; attempt < (priorSha ? 1 : 2); attempt++) {
    execFileSync(process.execPath, [join(root, "scripts/build-villages.mjs")], { cwd: root, stdio: "inherit" });
    const receipt = JSON.parse(await readFile(join(root, ".build-tmp/package-build.json"), "utf8"));
    assert.equal(hash(await readFile(receipt.retainedArchivePath)), receipt.sha256);
    if (prior) assert.equal(receipt.sha256, prior.sha256, "the same source must produce identical package bytes");
    prior = receipt;
    assert.deepEqual(await snapshot(), before, "building must not alter any tracked source file");
  }
  console.log(`Reproducible package ${prior.version}: ${prior.sha256}; tracked source unchanged.`);
} finally {
  await operation.release();
}
