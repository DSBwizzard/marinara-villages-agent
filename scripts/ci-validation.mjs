import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { validationInputs } from "./validation-inputs.mjs";
import { fullPlatformValidation, platformTests } from "./ci-policy.mjs";
const root = process.cwd();
const args = process.argv.slice(2);
if (args.some((arg) => !["--platform", "--policy", "--release"].includes(arg)))
  throw new Error("Unknown CI validation option");
const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const base = process.env.VILLAGES_CI_BASE;
const paths =
  base && !/^0+$/.test(base) ? git("diff", "--name-only", base, "HEAD", "--").split(/\r?\n/) : ["scripts/unknown-base"];
const release =
  args.includes("--release") ||
  process.env.GITHUB_REF === "refs/heads/main" ||
  process.env.GITHUB_EVENT_NAME === "workflow_dispatch";
const full = !args.includes("--platform") || fullPlatformValidation(paths, { release });
const reproducible =
  release ||
  paths.some((path) =>
    /^(scripts\/(build-|verify-|deterministic-|package-)|packages\/villages\/package-definition\.mjs|package(?:-lock)?\.json$)/.test(
      path,
    ),
  );
if (args.includes("--policy")) console.log(JSON.stringify({ full, reproducible }));
else {
  const before = await validationInputs(root);
  const run = (...args) => execFileSync(process.execPath, args, { cwd: root, stdio: "inherit" });
  if (full) {
    const npm = process.env.npm_execpath ?? resolve(process.execPath, "../node_modules/npm/bin/npm-cli.js");
    run(npm, "run", "check");
  }
  run("scripts/build-villages.mjs");
  run("scripts/verify-package.mjs");
  run(
    "scripts/run-tests.mjs",
    "review",
    ...(full ? [] : platformTests.map((path) => "--test=" + path)),
    "--keep-going",
  );
  if (reproducible) run("scripts/verify-build.mjs");
  const after = await validationInputs(root);
  if (before.digest !== after.digest) throw new Error("Validation changed maintained inputs");
  const latest = JSON.parse(await readFile(".build-tmp/test-results/review-latest.json", "utf8"));
  const report = JSON.parse(await readFile(latest.report, "utf8"));
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
      inventory: report.results.map((row) => row.path),
      runId: process.env.GITHUB_RUN_ID ?? null,
      createdAt: new Date().toISOString(),
    }) + "\n",
  );
}
