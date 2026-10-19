import assert from "node:assert/strict";
import { mkdtemp, mkdir, copyFile, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

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
  for (const name of ["verify-build", "checkout-operation"])
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
const bytes = process.env.BAD_BUILD ? String(count) : "fixed candidate";
if (process.env.MUTATE_SOURCE) writeFileSync("scripts/tracked.txt", String(count));
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
  assert.notEqual(run(["--prior-sha=obsolete"]).status, 0);
  assert.match(run([], { BAD_BUILD: "1" }).stderr, /identical package bytes/);
  await writeFile(join(root, "scripts/tracked.txt"), "original");
  git("add", "scripts/tracked.txt");
  assert.match(run([], { MUTATE_SOURCE: "1" }).stderr, /must not alter any tracked source/);
} finally {
  await rm(root, { recursive: true, force: true });
}
console.log("Reproducible builds reject differing output and tracked source mutation.");
