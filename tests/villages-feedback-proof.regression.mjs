import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { feedbackProof } from "../scripts/feedback-proof.mjs";

const root = await mkdtemp(join(tmpdir(), "villages-feedback-proof-"));
try {
  execFileSync("git", ["init", root], { stdio: "ignore" });
  const files = {
    ".gitignore": ".build-tmp/\n",
    "scripts/ci-toolchain.json": JSON.stringify({
      node: "24.21.0",
      arch: "x64",
      runners: { linux: "ubuntu-24.04", win32: "windows-2025" },
    }),
    "scripts/build-villages.mjs": "// fixed builder",
    "packages/villages/package-definition.mjs": 'export const definition={version:"1.0.0"};',
    "packages/villages/src/a.ts": "export const value=1;",
    "packages/villages/src/b.ts": "export const other=2;",
    "tests/a.regression.mjs": 'import {value} from "../packages/villages/src/a.ts"; export {value};',
    "tests/b.regression.mjs": 'import {other} from "../packages/villages/src/b.ts"; export {other};',
  };
  for (const [path, text] of Object.entries(files)) {
    await mkdir(join(root, path, ".."), { recursive: true });
    await writeFile(join(root, path), text);
  }
  const tests = ["a", "b"].map((name) => ({ path: `tests/${name}.regression.mjs`, group: "regression" }));
  const first = await feedbackProof(root, tests, {});
  for (const test of tests) await first.write(test, [], { ...test, code: 0, durationMs: 100 });
  const same = await feedbackProof(root, tests, {});
  assert.equal((await same.read(tests[0], [])).reused, true);
  assert.equal(await same.read(tests[0], ["different-case"]), null);
  await writeFile(join(root, "packages/villages/src/b.ts"), "export const other=3;");
  const changed = await feedbackProof(root, tests, {});
  assert.equal((await changed.read(tests[0], [])).reused, true, "One consumer change preserves unrelated local proof");
  assert.equal(await changed.read(tests[1], []), null);
  await assert.rejects(first.unchanged(), /Source changed/);
  const viewport = await feedbackProof(root, tests, { VILLAGES_VIEWPORT: "390" });
  assert.equal(await viewport.read(tests[0], []), null, "Different layout inputs cannot reuse feedback");
  await changed.write(tests[1], [], { ...tests[1], code: 1, durationMs: 1 });
  assert.equal(await changed.read(tests[1], []), null, "Failures cannot become passing proof");
  console.log("Local per-suite reuse preserves changed consumers, cases, environment and failure boundaries.");
} finally {
  await rm(root, { recursive: true, force: true });
}
