import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { analyzeArchitecture } from "../scripts/check-architecture.mjs";

const root = await mkdtemp(join(tmpdir(), "villages-boundaries-"));
async function fixture(name, files) {
  const sourceRoot = join(root, name);
  for (const [file, source] of Object.entries(files)) {
    const target = join(sourceRoot, file);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, source);
  }
  return analyzeArchitecture({ sourceRoot });
}
try {
  const privateWorld = await fixture("private-world", {
    "client/screen.ts": 'import type { SavedWorld } from "../server/domain/world.js"; export type Leak = SavedWorld;',
    "server/domain/world.ts": "export type SavedWorld = { unseenResidents: string[] };",
  });
  assert.ok(privateWorld.failures.some((message) => message.includes("client cannot import server-owned")));
  const ruleStorage = await fixture("rule-storage", {
    "server/domain/rule.ts": 'import { save } from "../adapters/storage.js"; export const rule = save;',
    "server/adapters/storage.ts": "export const save = () => {};",
  });
  assert.ok(ruleStorage.failures.some((message) => message.includes("domain depends on")));
  const callback = await fixture("connector-callback", {
    "server/adapters/storage.ts": 'import { generate } from "../features/founding.js"; export const save = generate;',
    "server/features/founding.ts": "export const generate = () => {};",
  });
  assert.ok(callback.failures.some((message) => message.includes("connector calls application")));
  const cycle = await fixture("unreachable-delayed-cycle", {
    "client/entry.ts": "export const entry = true;",
    "client/unused-a.ts": 'export const later = () => import("./unused-b.js");',
    "client/unused-b.ts": 'export { later } from "./unused-a.js";',
  });
  assert.ok(
    cycle.failures.some((message) => message.includes("Circular dependency:")),
    "unbundled delayed cycles are still rejected",
  );
  const contracts = await fixture("types-and-shared-calculations", {
    "shared/contracts/a.ts": 'import type { B } from "./b.js"; export type A = { b?: B };',
    "shared/contracts/b.ts": 'import type { A } from "./a.js"; export type B = { a?: A };',
    "shared/helpers/rule.ts": "export const place = (value: number) => value * 2;",
    "client/screen.ts": 'import { place } from "../shared/helpers/rule.js"; export const position = place(2);',
    "server/domain/rule.ts": 'import { place } from "../../shared/helpers/rule.js"; export const position = place(2);',
  });
  assert.deepEqual(contracts.failures, [], "type-only references and shared pure calculations are valid");
  const network = await fixture("network-rule", {
    "server/domain/rule.ts": 'export const rule = () => fetch("https://example.test");',
  });
  assert.ok(network.failures.some((message) => message.includes("network or timers")));
  const hidden = await fixture("hidden-import", {
    "client/entry.ts": "export const load = (name: string) => import(name);",
  });
  assert.ok(hidden.failures.some((message) => message.includes("computed module imports")));
  const aliasRoot = join(root, "alias");
  await mkdir(join(aliasRoot, "client"), { recursive: true });
  await mkdir(join(aliasRoot, "server/domain"), { recursive: true });
  await writeFile(
    join(aliasRoot, "client/screen.ts"),
    'import type { PrivateWorld } from "@private/world"; export type Leak = PrivateWorld;',
  );
  await writeFile(join(aliasRoot, "server/domain/world.ts"), "export type PrivateWorld = { secrets: string[] };");
  const alias = await analyzeArchitecture({
    sourceRoot: aliasRoot,
    compilerOptions: { baseUrl: aliasRoot, paths: { "@private/*": ["server/domain/*"] } },
  });
  assert.ok(
    alias.failures.some((message) => message.includes("client cannot import server-owned")),
    "aliases obey the same privacy boundary",
  );
  const external = await fixture("effectful-external", {
    "server/domain/rule.ts": 'import { readFile } from "node:fs/promises"; export const rule = readFile;',
  });
  assert.ok(external.failures.some((message) => message.includes("effectful external dependency")));
  const qualified = await fixture("qualified-effect", {
    "shared/helpers/rule.ts":
      'export const request = globalThis.fetch; export const later = () => globalThis["setTimeout"](() => {}, 0);',
  });
  assert.ok(qualified.failures.some((message) => message.includes("through globals")));
} finally {
  await rm(root, { recursive: true, force: true });
}
console.log("villages-architecture: boundaries reject privacy leaks, impure rules and hidden runtime cycles");
