import assert from "node:assert/strict";
import { mkdtemp, mkdir, copyFile, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { validationInputs } from "../scripts/validation-inputs.mjs";

const root = await mkdtemp(join(tmpdir(), "villages-reproducibility-"));
const env = { ...process.env };
delete env.VILLAGES_CHECKOUT_OPERATION;
const run = (args = [], extra = {}) =>
  spawnSync(process.execPath, ["scripts/verify-build.mjs", ...args], {
    cwd: root,
    env: { ...env, ...extra },
    encoding: "utf8",
    windowsHide: true,
  });
try {
  await mkdir(join(root, "scripts"));
  await writeFile(join(root, ".gitignore"), ".build-tmp/\n");
  for (const name of ["verify-build", "checkout-operation", "validation-inputs"])
    await copyFile(new URL(`../scripts/${name}.mjs`, import.meta.url), join(root, `scripts/${name}.mjs`));
  await writeFile(
    join(root, "scripts/build-villages.mjs"),
    `
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
let count = 0;
try { count = Number(readFileSync(".build-tmp/count", "utf8")); } catch {}
writeFileSync(".build-tmp/count", String(count + 1));
const bytes = process.env.BAD_BUILD ? "different bytes" : "fixed candidate";
const retainedArchivePath = resolve(".build-tmp/archive.zip");
writeFileSync(retainedArchivePath, bytes);
writeFileSync(".build-tmp/package-build.json", JSON.stringify({version:"fixture", retainedArchivePath, sha256:createHash("sha256").update(bytes).digest("hex")}));
`,
  );
  const git = (...args) => execFileSync("git", args, { cwd: root, stdio: "pipe", windowsHide: true });
  git("init");
  git("add", ".");
  const cold = run();
  assert.equal(cold.status, 0, cold.stderr);
  assert.equal(await readFile(join(root, ".build-tmp/count"), "utf8"), "2", "Standalone verification builds twice");
  const receipt = JSON.parse(await readFile(join(root, ".build-tmp/package-build.json")));
  const input = (await validationInputs(root)).digest;
  const args = ["--prior-sha=" + receipt.sha256, "--prior-input=" + input];
  const warm = run(args);
  assert.equal(warm.status, 0, warm.stderr);
  assert.equal(
    await readFile(join(root, ".build-tmp/count"), "utf8"),
    "3",
    "CI verifies one additional independent build",
  );
  for (const invalid of [
    [args[0]],
    [...args, args[0]],
    ["--prior-sha=invalid"],
    [args[0], "--prior-input=" + "0".repeat(64)],
  ])
    assert.notEqual(run(invalid).status, 0, "Malformed or stale identity must fail before building");
  assert.equal(await readFile(join(root, ".build-tmp/count"), "utf8"), "3");
  await writeFile(receipt.retainedArchivePath, "tampered");
  assert.match(run(args).stderr, /Initial archive changed/);
  await writeFile(receipt.retainedArchivePath, "fixed candidate");
  assert.match(run(args, { BAD_BUILD: "1" }).stderr, /identical package bytes/);
  await writeFile(join(root, "scripts/new-input.mjs"), "changed source");
  assert.match(run(args).stderr, /Source changed since initial build/);
} finally {
  await rm(root, { recursive: true, force: true });
}
console.log(
  "Reproducibility retains two builds, rejects stale/tampered identity and different output, and avoids a third build.",
);
