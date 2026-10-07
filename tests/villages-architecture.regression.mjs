import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { analyzeArchitecture } from "../scripts/check-architecture.mjs";

const root = await mkdtemp(join(tmpdir(), "villages-boundaries-"));
async function fixture(name, files, compilerOptions = {}, featureInterfaces) {
  const sourceRoot = join(root, name);
  for (const [file, source] of Object.entries(files)) {
    const target = join(sourceRoot, file);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, source);
  }
  return analyzeArchitecture({ sourceRoot, compilerOptions, featureInterfaces });
}
try {
  const privateServices = await fixture("private-services", {
    "server/features/media/sprite-manager-service.ts":
      "export const createSprites = () => ({}); export type Sprites = {};",
    "server/features/world/value.ts":
      'import { createSprites } from "../media/sprite-manager-service.js"; export const sprites = createSprites;',
    "server/features/world/types.ts":
      'import type { Sprites } from "../media/sprite-manager-service.js"; export type Leak = Sprites;',
    "server/features/world/reexport.ts": 'export * from "../media/sprite-manager-service.js";',
    "server/features/world/delayed.ts": 'export const later = () => import("../media/sprite-manager-service.js");',
  });
  for (const source of ["value", "types", "reexport", "delayed"])
    assert(
      privateServices.failures.some((message) =>
        message.includes(`world/${source}.ts: private feature implementation`),
      ),
    );
  const publicServices = await fixture(
    "public-services",
    {
      "server/features/media/sprite-manager-service.ts":
        "export const createSprites = () => ({}); export type Sprites = {};",
      "server/features/media/sprite-manager.ts":
        'import type { Sprites } from "./sprite-manager-service.js"; export type SpriteCommands = Sprites; export const sprites = () => ({});',
      "server/features/world/commands.ts":
        'import { sprites, type SpriteCommands } from "../media/sprite-manager.js"; export const query = sprites; export type Commands = SpriteCommands;',
      "server/entry/runtime.ts":
        'import { createSprites } from "../features/media/sprite-manager-service.js"; export const assembly = createSprites;',
    },
    {},
    { "media/sprite-manager.ts": ["sprites", "SpriteCommands"] },
  );
  assert.deepEqual(publicServices.failures, [], "public contracts, owning feature and entry assembly remain valid");
  const serviceAlias = await fixture(
    "private-service-alias",
    {
      "server/features/media/sprite-manager-service.ts": "export type Sprites = {};",
      "server/features/world/consumer.ts": 'export type Leak = import("@private/sprite-manager-service").Sprites;',
    },
    { baseUrl: join(root, "private-service-alias"), paths: { "@private/*": ["server/features/media/*"] } },
  );
  assert(
    serviceAlias.failures.some((message) => message.includes("private feature implementation")),
    "aliases and import types cannot bypass private factories",
  );
  const privateForms = {
    value: 'import { secret } from "../media/private-helper.js"; export const leak = secret;',
    types: 'import type { Secret } from "../media/private-helper.js"; export type Leak = Secret;',
    forward: 'export { secret as leak } from "../media/private-helper.js";',
    delayed:
      'export const leak = async () => { const { secret } = await import("../media/private-helper.js"); return secret; };',
    qualified: 'export type Leak = import("../media/private-helper.js").Secret;',
    namespace: 'import * as privateModule from "../media/private-helper.js"; export const leak = privateModule.secret;',
    alias: 'import { secret } from "@private/private-helper"; export const leak = secret;',
  };
  const privateHelpers = await fixture(
    "private-helper-forms",
    {
      "server/features/media/private-helper.ts": "export const secret = 1; export type Secret = {};",
      ...Object.fromEntries(
        Object.entries(privateForms).map(([name, source]) => [`server/features/world/${name}.ts`, source]),
      ),
      "server/features/media/owned.ts": 'export * from "./private-helper.js";',
      "server/entry/runtime.ts":
        'import * as internal from "../features/media/private-helper.js"; export const assembly = internal;',
    },
    { baseUrl: join(root, "private-helper-forms"), paths: { "@private/*": ["server/features/media/*"] } },
  );
  for (const name of Object.keys(privateForms))
    assert(
      privateHelpers.failures.some((message) => message.includes(`world/${name}.ts: private feature implementation`)),
      name,
    );
  assert(
    !privateHelpers.failures.some((message) => /media\/owned|entry\/runtime/.test(message)),
    "same-owner and entry assembly retain private access",
  );

  const approved = { "media/sprite-manager.ts": ["sprites", "listSprites", "SpriteCommands"] };
  const publicModule =
    "export const sprites = () => ({}); export const listSprites = () => []; export type SpriteCommands = {}; export const configureSprites = () => {}; export const createSprites = () => ({}); export const then = () => ({}); export default configureSprites;";
  const allowedForms = {
    named:
      'import { sprites as command, type SpriteCommands as Contract } from "../media/sprite-manager.js"; export const run = command; export type Port = Contract;',
    forward: 'export { sprites as command, type SpriteCommands as Contract } from "../media/sprite-manager.js";',
    qualified:
      'export type Contract = import("../media/sprite-manager.js").SpriteCommands; export type Command = typeof import("../media/sprite-manager.js").sprites;',
    picked: 'export type LazyPort = Pick<typeof import("../media/sprite-manager.js"), "sprites" | "listSprites">;',
    delayed:
      'export const run = async () => { const { sprites: command } = await import("../media/sprite-manager.js"); return command(); };',
    property: 'export const run = async () => (await import("../media/sprite-manager.js")).sprites();',
    then: 'export const run = () => import("../media/sprite-manager.js").then(({ sprites: command }) => command());',
  };
  const deniedForms = {
    setup: 'import { configureSprites as command } from "../media/sprite-manager.js"; export const leak = command;',
    factory: 'import { createSprites } from "../media/sprite-manager.js"; export const leak = createSprites;',
    forwardedSetup: 'export { configureSprites as sprites } from "../media/sprite-manager.js";',
    typeSetup: 'export type Leak = typeof import("../media/sprite-manager.js").configureSprites;',
    pickedSetup:
      'export type Leak = Pick<typeof import("../media/sprite-manager.js"), "sprites" | "configureSprites">;',
    unboundedPick: 'export type Leak = Pick<typeof import("../media/sprite-manager.js"), string>;',
    shadowedPick:
      'type Pick<T, K> = T; export type Leak = Pick<typeof import("../media/sprite-manager.js"), "sprites">;',
    typeParameterPick: 'export type Leak<Pick> = Pick<typeof import("../media/sprite-manager.js"), "sprites">;',
    wholeType: 'export type Leak = typeof import("../media/sprite-manager.js");',
    namespace: 'import * as api from "../media/sprite-manager.js"; export const leak = api;',
    default: 'import api from "../media/sprite-manager.js"; export const leak = api;',
    star: 'export * from "../media/sprite-manager.js";',
    namespaceForward: 'export * as api from "../media/sprite-manager.js";',
    sideEffect: 'import "../media/sprite-manager.js";',
    empty: 'import {} from "../media/sprite-manager.js";',
    escaped: 'export const leak = () => import("../media/sprite-manager.js");',
    assigned:
      'export const leak = async () => { const api = await import("../media/sprite-manager.js"); return api; };',
    spread:
      'export const leak = async () => { const { sprites, ...api } = await import("../media/sprite-manager.js"); return api; };',
    computed: 'export const leak = async (name: string) => (await import("../media/sprite-manager.js"))[name];',
    literalElement: 'export const leak = async () => (await import("../media/sprite-manager.js"))["sprites"];',
    cast: 'export const leak = async () => { const api = await import("../media/sprite-manager.js") as any; return api; };',
    thenNamespace: 'export const leak = () => import("../media/sprite-manager.js").then(api => api);',
    thenRest: 'export const leak = () => import("../media/sprite-manager.js").then(({ sprites, ...api }) => api);',
    thenArguments:
      'export const leak = () => import("../media/sprite-manager.js").then(function({ sprites }) { return arguments[0].configureSprites; });',
    moduleThen:
      'export const leak = async () => (await import("../media/sprite-manager.js")).then(({ sprites }) => sprites);',
    require: 'export const leak = require("../media/sprite-manager.js");',
    importEquals: 'import api = require("../media/sprite-manager.js"); export const leak = api;',
  };
  const namedContracts = await fixture(
    "named-contracts",
    {
      "server/features/media/sprite-manager.ts": publicModule,
      ...Object.fromEntries(
        Object.entries(allowedForms).map(([name, source]) => [`server/features/world/allowed-${name}.ts`, source]),
      ),
      ...Object.fromEntries(
        Object.entries(deniedForms).map(([name, source]) => [`server/features/world/denied-${name}.ts`, source]),
      ),
    },
    {},
    approved,
  );
  for (const name of Object.keys(allowedForms))
    assert(
      !namedContracts.failures.some((message) => message.startsWith(`server/features/world/allowed-${name}.ts:`)),
      `approved ${name}`,
    );
  for (const name of Object.keys(deniedForms))
    assert(
      namedContracts.failures.some((message) => message.startsWith(`server/features/world/denied-${name}.ts:`)),
      `denied ${name}`,
    );
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
