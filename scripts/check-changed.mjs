import { execFileSync, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { join, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { isEngineBoundary } from "./change-scope.mjs";

export function maintainedCode(path) {
  return (
    (/^(packages\/.*\/src\/|scripts\/|tests\/|sources\/)/.test(path) && /\.(?:[cm]?js|tsx?)$/.test(path)) ||
    /^(eslint\.config\.mjs|tsconfig\.package\.json|packages\/villages\/[^/]+\.mjs|package\.json)$/.test(path)
  );
}
export function checkPlan(paths) {
  const code = paths.filter(maintainedCode);
  return {
    format: code,
    lint: code.filter((path) => /\.(?:[cm]?js|tsx?)$/.test(path)),
    types: code.some((path) => /^(packages\/.*\/src\/|sources\/|tsconfig\.)/.test(path)),
    architecture: code.some((path) => /^packages\/.*\/src\//.test(path)),
    engineTypes: paths.some(isEngineBoundary),
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = process.cwd();
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== "--list" && !arg.startsWith("--base=") && !arg.startsWith("--file=")))
    throw new Error("Use --base=<ref>, --file=<path>, or --list");
  const base = args.find((arg) => arg.startsWith("--base="))?.slice(7) ?? "origin/staging";
  const explicit = args.filter((arg) => arg.startsWith("--file=")).map((arg) => arg.slice(7));
  const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8" }).split("\0").filter(Boolean);
  const paths = [
    ...new Set(
      explicit.length
        ? explicit
        : [...git("diff", "--name-only", "-z", base, "--"), ...git("ls-files", "--others", "--exclude-standard", "-z")],
    ),
  ];
  if (paths.some((path) => relative(root, resolve(root, path)).startsWith("..")))
    throw new Error("Changed check path escapes checkout");
  const plan = checkPlan(paths);
  plan.format = plan.format.filter((path) => existsSync(join(root, path)));
  plan.lint = plan.lint.filter((path) => existsSync(join(root, path)));
  if (args.includes("--list")) console.log(JSON.stringify({ paths, ...plan }, null, 2));
  else {
    await mkdir(".build-tmp", { recursive: true });
    const jobs = [];
    if (plan.format.length)
      jobs.push(["format", ["node_modules/prettier/bin/prettier.cjs", "--check", ...plan.format]]);
    if (plan.lint.length)
      jobs.push([
        "lint",
        ["node_modules/eslint/bin/eslint.js", "--cache", "--cache-location", ".build-tmp/eslint-cache", ...plan.lint],
      ]);
    if (plan.types)
      jobs.push([
        "types",
        [
          "node_modules/typescript/bin/tsc",
          "-p",
          "tsconfig.package.json",
          "--pretty",
          "false",
          "--incremental",
          "--tsBuildInfoFile",
          ".build-tmp/typecheck.tsbuildinfo",
        ],
      ]);
    if (plan.architecture) jobs.push(["architecture", ["scripts/check-architecture.mjs"]]);
    if (plan.engineTypes) jobs.push(["engine declarations", ["scripts/engine-public-declarations.mjs"]]);
    let failed = false;
    // Independent static checks own separate caches. Builds and tests stay serialized.
    for (let start = 0; start < jobs.length; start += 3)
      await Promise.all(
        jobs.slice(start, start + 3).map(
          ([name, command]) =>
            new Promise((done) => {
              const child = spawn(process.execPath, command, { cwd: root, stdio: "inherit", windowsHide: true });
              child.on("error", (error) => {
                failed = true;
                console.error(name + ": " + error.message);
                done();
              });
              child.on("close", (code) => {
                if (code !== 0) failed = true;
                done();
              });
            }),
        ),
      );
    console.log(
      jobs.length
        ? "Affected static checks " + (failed ? "failed." : "passed.")
        : "No maintained code changed; no code checks required.",
    );
    if (failed) process.exitCode = 1;
  }
}
