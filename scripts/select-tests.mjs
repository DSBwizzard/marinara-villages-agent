import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { testInventory } from "./test-inventory.mjs";
import { testConsumers } from "./test-dependencies.mjs";
import { isDocumentation } from "./change-scope.mjs";

export function selectAffectedTests(paths, inventory, consumers = new Map()) {
  const selected = new Set();
  const add = (pattern) =>
    inventory
      .filter((test) => test.group !== "engine" && pattern.test(test.path))
      .forEach((test) => selected.add(test.path));
  for (const path of paths) {
    if (isDocumentation(path)) continue;
    if (inventory.some((test) => test.path === path && test.group !== "engine")) {
      selected.add(path);
      for (const test of consumers.get(path) ?? []) selected.add(test);
      continue;
    }
    if (/^(scripts\/|\.github\/|package(?:-lock)?\.json$)/.test(path)) {
      add(/villages-(pipeline|test-scheduler|checkout-operation|package-verifier)\./);
      continue;
    }
    const owner = path.match(/src\/(?:client|server)\/features\/([^/]+)\//)?.[1];
    if (owner) {
      const aliases = {
        scenes: "scene|contact|venue-session",
        founding: "founding|foundation",
        settings: "settings|connections|usage|persona",
        venues: "venue|zones|access",
        generation: "generation|interpretation|writing",
        projects: "project",
        artwork: "image|artwork|sprite",
        maps: "map",
      };
      const family = new RegExp("villages-(?:" + (aliases[owner] ?? owner.replace(/s$/, "")) + ")");
      const matches = inventory.filter((test) => test.group !== "engine" && family.test(test.path));
      matches.forEach((test) => selected.add(test.path));
      for (const test of consumers.get(path) ?? []) selected.add(test);
      if (!matches.length) {
        const affected = consumers.get(path);
        if (affected?.length) affected.forEach((test) => selected.add(test));
        else inventory.filter((test) => test.group !== "engine").forEach((test) => selected.add(test.path));
      }
    } else if (/^(packages\/|sources\/)/.test(path)) {
      const affected = consumers.get(path);
      if (affected?.length) affected.forEach((test) => selected.add(test));
      else inventory.filter((test) => test.group !== "engine").forEach((test) => selected.add(test.path));
    } else if (path.startsWith("tests/")) {
      const affected = consumers.get(path);
      if (affected?.length) affected.forEach((test) => selected.add(test));
      else inventory.filter((test) => test.group !== "engine").forEach((test) => selected.add(test.path));
    }
  }
  return inventory.filter((test) => selected.has(test.path)).map((test) => test.path);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const explicit = process.argv.filter((arg) => arg.startsWith("--file=")).map((arg) => arg.slice(7));
  const explain = process.argv.includes("--explain");
  const base = process.argv.find((arg) => arg.startsWith("--base="))?.slice(7) ?? "origin/staging";
  const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).split("\0").filter(Boolean);
  const paths = [
    ...new Set([
      ...(explicit.length
        ? explicit
        : [
            ...git("diff", "--name-only", "-z", base, "--"),
            ...git("ls-files", "--others", "--exclude-standard", "-z"),
          ]),
    ]),
  ];
  const inventory = await testInventory();
  const shared = paths.some(
    (path) =>
      !isDocumentation(path) &&
      ((/^(packages\/|sources\/)/.test(path) && !/src\/(?:client|server)\/features\//.test(path)) ||
        (path.startsWith("tests/") && !inventory.some((test) => test.path === path))),
  );
  const source = paths.some((path) => !isDocumentation(path) && /^(packages\/|sources\/)/.test(path));
  const tests = selectAffectedTests(
    paths,
    inventory,
    shared || source || paths.some((path) => path.startsWith("tests/"))
      ? await testConsumers(inventory, process.cwd(), { expandBundles: shared })
      : new Map(),
  );
  let impact;
  if (explain) {
    const { checkBlueprint } = await import("./ci-checks.mjs");
    const blueprint = await checkBlueprint();
    const specs = blueprint.specs.filter((spec) => spec.kind === "test");
    const affected = specs.filter((spec) => paths.some((path) => spec.inputs.includes(path)));
    impact = {
      total: specs.length,
      invalidated: affected.length,
      opaque: specs.filter((spec) => spec.opaque).length,
      suites: affected.map((spec) => ({
        path: spec.path,
        changedInputs: paths.filter((path) => spec.inputs.includes(path)),
        reasons: spec.reasons,
      })),
    };
  }
  console.log(
    JSON.stringify({
      paths,
      tests,
      ...(impact ? { impact } : {}),
      coverage:
        "Focused affected-owner development checks; complete CI and applicable release acceptance remain separate.",
    }),
  );
}
