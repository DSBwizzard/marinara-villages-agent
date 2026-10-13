import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { testInventory } from "./test-inventory.mjs";
import { testConsumers } from "./test-dependencies.mjs";

export function selectAffectedTests(paths, inventory, consumers = new Map()) {
  const selected = new Set();
  const add = (pattern) =>
    inventory
      .filter((test) => test.group !== "engine" && pattern.test(test.path))
      .forEach((test) => selected.add(test.path));
  for (const path of paths) {
    if (inventory.some((test) => test.path === path && test.group !== "engine")) {
      selected.add(path);
      continue;
    }
    if (/^(scripts\/|\.github\/|package(?:-lock)?\.json$)/.test(path)) {
      add(/villages-(pipeline|test-scheduler|checkout-operation|package-verifier)\./);
      continue;
    }
    const owner = path.match(/src\/(?:client|server)\/features\/([^/]+)\//)?.[1];
    if (owner) {
      const previousSize = selected.size;
      const aliases = {
        scenes: "scene|contact|venue-session",
        founding: "founding|foundation",
        settings: "settings|connections|usage",
        venues: "venue|zones|access",
        generation: "generation|interpretation|writing",
        projects: "project",
        artwork: "image|artwork|sprite",
        maps: "map",
      };
      add(new RegExp("villages-(?:" + (aliases[owner] ?? owner.replace(/s$/, "")) + ")"));
      if (selected.size === previousSize) {
        const affected = consumers.get(path);
        if (affected?.length) affected.forEach((test) => selected.add(test));
        else inventory.filter((test) => test.group !== "engine").forEach((test) => selected.add(test.path));
      }
    } else if (/^(packages\/|sources\/)/.test(path)) {
      const affected = consumers.get(path);
      if (affected?.length) affected.forEach((test) => selected.add(test));
      else inventory.filter((test) => test.group !== "engine").forEach((test) => selected.add(test.path));
    } else if (path.startsWith("tests/fixtures/")) {
      const family = path.match(/villages-([a-z]+)-/)?.[1];
      if (family) add(new RegExp("villages-" + family + "-"));
    }
  }
  return inventory.filter((test) => selected.has(test.path)).map((test) => test.path);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const base = process.argv.find((arg) => arg.startsWith("--base="))?.slice(7) ?? "origin/staging";
  const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).split("\0").filter(Boolean);
  const paths = [
    ...new Set([
      ...git("diff", "--name-only", "-z", base, "--"),
      ...git("ls-files", "--others", "--exclude-standard", "-z"),
    ]),
  ];
  const inventory = await testInventory();
  const shared = paths.some(
    (path) => /^(packages\/|sources\/)/.test(path) && !/src\/(?:client|server)\/features\//.test(path),
  );
  const tests = selectAffectedTests(paths, inventory, shared ? await testConsumers(inventory) : new Map());
  console.log(
    JSON.stringify({
      paths,
      tests,
      coverage:
        "Focused affected-owner development checks; complete CI and applicable release acceptance remain separate.",
    }),
  );
}
