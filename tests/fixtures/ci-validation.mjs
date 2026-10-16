import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export async function ciValidationFixture(root) {
  await mkdir(join(root, "scripts"), { recursive: true });
  await mkdir(join(root, "tests"), { recursive: true });
  await mkdir(join(root, ".build-tmp"), { recursive: true });
  execFileSync("git", ["init", root], { stdio: "ignore" });
  execFileSync(
    "git",
    [
      "-C",
      root,
      "-c",
      "user.name=Fixture",
      "-c",
      "user.email=fixture@example.invalid",
      "commit",
      "--allow-empty",
      "-m",
      "fixture",
    ],
    { stdio: "ignore" },
  );
  for (const name of [
    "ci-validation",
    "ci-reuse",
    "ci-evidence",
    "ci-policy",
    "validation-inputs",
    "test-inventory",
    "test-resources",
    "change-scope",
    "select-tests",
    "test-dependencies",
  ])
    await copyFile(new URL("../../scripts/" + name + ".mjs", import.meta.url), join(root, "scripts", name + ".mjs"));
  await writeFile(join(root, "tests/a.regression.mjs"), "// fixture\n");
  await writeFile(join(root, ".build-tmp/npm.mjs"), "// static fixture passes\n");
  await writeFile(
    join(root, "scripts/build-villages.mjs"),
    [
      'import {writeFileSync,mkdirSync} from "node:fs";',
      'import {execFileSync} from "node:child_process";',
      'mkdirSync("artifacts",{recursive:true});',
      'writeFileSync("artifacts/villages-1.2.3.zip","package");',
      'writeFileSync(".build-tmp/package-build.json",JSON.stringify({version:"1.2.3",sourceRevision:execFileSync("git",["rev-parse","HEAD"],{encoding:"utf8"}).trim(),sha256:"fixture"}));',
    ].join("\n"),
  );
  await writeFile(join(root, "scripts/verify-package.mjs"), "// package fixture passes\n");
  await writeFile(join(root, "scripts/verify-build.mjs"), "// reproducibility fixture passes\n");
  await writeFile(
    join(root, "scripts/run-tests.mjs"),
    [
      'import {writeFileSync,mkdirSync} from "node:fs";',
      'if(process.env.CI_FIXTURE_BLOCKED==="true")throw Error("Blocked before tests");',
      'mkdirSync(".build-tmp/test-results",{recursive:true});',
      'const results=process.argv.slice(2).filter(arg=>arg.startsWith("--test=")).map(arg=>({path:arg.slice(7),code:process.env.CI_FIXTURE_FAIL==="true"?1:0}));',
      'const report=".build-tmp/test-results/"+Date.now()+".json";',
      'writeFileSync(report,JSON.stringify({group:"review",cases:[],results}));',
      'writeFileSync(".build-tmp/test-results/review-latest.json",JSON.stringify({report}));',
      "if(results.some(test=>test.code!==0))process.exitCode=1;",
    ].join("\n"),
  );
  const env = {
    ...process.env,
    CI: "true",
    VILLAGES_CI_BASE: "",
    VILLAGES_CI_FRESH: "true",
    GITHUB_RUN_ID: "123",
    GITHUB_RUN_ATTEMPT: "1",
    GITHUB_JOB: "validate",
    CI_FIXTURE_FAIL: "false",
    CI_FIXTURE_BLOCKED: "false",
    npm_execpath: join(root, ".build-tmp/npm.mjs"),
  };
  const run = (extra) =>
    spawnSync(process.execPath, ["scripts/ci-validation.mjs", "--release"], {
      cwd: root,
      env: { ...env, ...extra },
      encoding: "utf8",
    });
  const receipt = async () => JSON.parse(await readFile(join(root, ".build-tmp/ci-validation.json"), "utf8"));
  const passed = run({});
  assert.equal(passed.status, 0, passed.stderr);
  assert.equal((await receipt()).completeInventory, true);
  assert.equal((await receipt()).reproducible, true);
  const failed = run({ CI_FIXTURE_FAIL: "true" });
  assert.equal(failed.status, 1);
  assert.equal((await receipt()).passed, false);
  assert.equal((await receipt()).tests[0].code, 1, "Failed suites are retained honestly");
  assert.equal((await receipt()).reproducible, false, "A failed test run cannot claim reproducibility");
  assert.equal(run({}).status, 0);
  assert.equal(run({ CI_FIXTURE_BLOCKED: "true" }).status, 1);
  assert.equal((await receipt()).tests.length, 0, "A stale passing report cannot become fresh test evidence");
  assert.equal((await receipt()).completeInventory, false);
}
