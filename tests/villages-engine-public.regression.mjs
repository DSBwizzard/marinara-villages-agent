import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

const scratch = resolve(".build-tmp");
await mkdir(scratch, { recursive: true });
const root = await mkdtemp(join(scratch, "engine-public-"));
const upstream = join(root, "upstream");
const output = join(root, "sources/engine-public");
const script = resolve("scripts/engine-public-declarations.mjs");
const run = (...args) => spawnSync(process.execPath, [script, ...args], { cwd: root, encoding: "utf8" });
try {
  await mkdir(join(upstream, "types"), { recursive: true });
  await mkdir(output, { recursive: true });
  await writeFile(join(output, "pin.json"), JSON.stringify({ repository: "fixture", files: [] }));
  await writeFile(
    join(root, "sources/package-shared.ts"),
    'export type { Host } from "./engine-public/types/capability-runtime.js";\n' +
      'export type { SceneOriginProvider } from "./engine-public/types/scene.js";\n',
  );
  await writeFile(join(upstream, "types/capability-runtime.d.ts"), "export interface Host { name: string }\n");
  await writeFile(
    join(upstream, "types/scene.d.ts"),
    'export type SceneOriginEnd = { kind: "concluded" };\n' +
      "export interface SceneOriginProvider { release(end: SceneOriginEnd): void }\n" +
      "export interface Unused { privateField: string }\n",
  );
  const args = ["--from", upstream];
  const refreshed = run(
    "--refresh",
    ...args,
    "--revision",
    "a".repeat(40),
    "--engine-version",
    "2.5.2",
    "--capability-api",
    "1.818",
  );
  assert.equal(refreshed.status, 0, refreshed.stderr);
  const pin = JSON.parse(await readFile(join(output, "pin.json"), "utf8"));
  assert.equal(pin.files.length, 2);
  assert.equal(pin.supplementalFiles, undefined);
  assert.deepEqual(pin.roots, ["Host", "SceneOriginProvider"]);
  const scene = await readFile(join(output, "types/scene.d.ts"), "utf8");
  assert.match(scene, /SceneOriginEnd/u);
  assert.doesNotMatch(scene, /Unused/u);
  assert.equal(run("--check", ...args).status, 0);
  assert.equal(run().status, 0);
  await writeFile(join(upstream, "types/scene.d.ts"), scene + "\n// changed upstream\n");
  assert.notEqual(run("--check", ...args).status, 0, "Changed upstream bytes must not reproduce the pin");
  await writeFile(join(output, "types/scene.d.ts"), scene + "\n// changed output\n");
  assert.notEqual(run().status, 0, "Changed generated declarations must fail verification");
} finally {
  assert.equal(dirname(root), scratch);
  await rm(root, { recursive: true, force: true });
}
console.log(
  "Public Engine declarations: facade roots share one generated closure with source and output integrity checks.",
);
