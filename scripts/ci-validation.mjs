import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { readFile, writeFile, mkdir, appendFile } from "node:fs/promises";
import { validationInputs } from "./validation-inputs.mjs";
import { fullPlatformValidation, platformTests, needsBrowserPreparation, pipelineOnlyChanges } from "./ci-policy.mjs";
import { isDocumentation } from "./change-scope.mjs";
import { testInventory } from "./test-inventory.mjs";
import { reusableCi } from "./ci-reuse.mjs";
const root = process.cwd();
const args = process.argv.slice(2);
if (args.some((arg) => !["--platform", "--policy", "--release", "--github-output"].includes(arg)))
  throw new Error("Unknown CI validation option");
const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const base = process.env.VILLAGES_CI_BASE;
const paths =
  base && !/^0+$/.test(base)
    ? git("diff", "--name-only", base, "HEAD", "--").split(/\r?\n/).filter(Boolean)
    : ["scripts/unknown-base"];
const release =
  args.includes("--release") ||
  process.env.GITHUB_REF === "refs/heads/main" ||
  process.env.GITHUB_EVENT_NAME === "workflow_dispatch";
const documentationOnly = !release && paths.every(isDocumentation);
const pipelineOnly = !release && pipelineOnlyChanges(paths);
const full =
  !documentationOnly && !pipelineOnly && (!args.includes("--platform") || fullPlatformValidation(paths, { release }));
const reproducible =
  release ||
  paths.includes("scripts/unknown-base") ||
  paths.some((path) =>
    /^(scripts\/(build-|verify-|deterministic-|package-)|packages\/villages\/package-definition\.mjs|package(?:-lock)?\.json$)/.test(
      path,
    ),
  );
const before = await validationInputs(root);
const inventory = (await testInventory()).filter((test) => test.group !== "engine");
const expected = (full ? inventory : inventory.filter((test) => platformTests.includes(test.path))).map(
  (test) => test.path,
);
const reuse = !release && !documentationOnly ? await reusableCi({ current: before, inventory: expected, full }) : null;
const policy = { full, reproducible, documentationOnly, pipelineOnly, reused: Boolean(reuse), browser: full && !reuse };
if (args.includes("--github-output")) {
  if (!process.env.GITHUB_OUTPUT) throw Error("GitHub output file required");
  await appendFile(process.env.GITHUB_OUTPUT, "browser=" + policy.browser + "\n");
}
if (args.includes("--policy")) console.log(JSON.stringify(policy));
else {
  const run = (...args) => execFileSync(process.execPath, args, { cwd: root, stdio: "inherit" });
  if ((full || pipelineOnly) && !reuse) {
    const npm = process.env.npm_execpath ?? resolve(process.execPath, "../node_modules/npm/bin/npm-cli.js");
    run(npm, "run", "check");
  }
  run("scripts/build-villages.mjs");
  run("scripts/verify-package.mjs");
  if (
    process.env.CI === "true" &&
    needsBrowserPreparation({
      full,
      reused: Boolean(reuse),
      prepared: process.env.VILLAGES_CI_BROWSER_READY,
    })
  )
    run("node_modules/playwright/cli.js", "install", "--with-deps", "chromium");
  if (!reuse && !documentationOnly)
    run(
      "scripts/run-tests.mjs",
      "review",
      ...(full ? [] : platformTests.map((path) => "--test=" + path)),
      "--keep-going",
    );
  if (reproducible && reuse?.reproducible !== true) run("scripts/verify-build.mjs");
  const build = JSON.parse(await readFile(".build-tmp/package-build.json", "utf8"));
  if (reuse && reuse.archiveHash !== build.sha256) throw Error("Current package differs from the validated CI archive");
  const after = await validationInputs(root);
  if (before.digest !== after.digest) throw new Error("Validation changed maintained inputs");
  let report;
  if (reuse) {
    report = { passed: true, completeInventory: reuse.completeInventory, results: reuse.tests };
    console.log("REUSE authenticated CI coverage for identical tree: " + reuse.reusedFrom.url);
  } else if (documentationOnly) report = { passed: true, completeInventory: false, results: [] };
  else {
    const latest = JSON.parse(await readFile(".build-tmp/test-results/review-latest.json", "utf8"));
    report = JSON.parse(await readFile(latest.report, "utf8"));
  }
  if (!report.passed || report.results.some((row) => row.code !== 0) || (full && !report.completeInventory))
    throw new Error("CI cannot record incomplete or failing coverage");
  await mkdir(".build-tmp", { recursive: true });
  await writeFile(
    ".build-tmp/ci-validation.json",
    JSON.stringify({
      schemaVersion: 1,
      passed: true,
      full,
      reproducible,
      sourceRevision: git("rev-parse", "HEAD"),
      inputDigest: before.digest,
      inputs: before.inputs,
      platform: process.platform,
      node: process.version,
      tests: report.results,
      completeInventory: report.completeInventory,
      documentationOnly,
      reusedFrom: reuse?.reusedFrom ?? null,
      inventory: report.results.map((row) => row.path),
      runId: process.env.GITHUB_RUN_ID ?? null,
      createdAt: new Date().toISOString(),
    }) + "\n",
  );
}
