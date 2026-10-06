// Runtime snapshot guards and a compiler smoke test. npm run typecheck checks
// every maintained client/server module using the repository-owned configuration.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeVillageSnapshot } from "../packages/villages/src/engine/packages/client/src/villages-snapshot-normalization";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/*
  Every source file of the tab's own client tree.

  The entry is the one that shipped the bug, and it is the one that imports the other
  two, so a single program would reach them anyway — they are named as well so that a
  file nothing imports is still covered, since a file nothing imports is precisely the
  kind of file a reader would assume somebody else is checking.
*/
const CLIENT_ROOT = resolve(repoRoot, "packages/villages/src/engine/packages/client/src");
const CLIENT_SOURCES = [
  "villages-package-entry.tsx",
  "villages-dossier.tsx",
  "villages-dossier-styles.ts",
  "villages-exploration.tsx",
  "villages-mobile-map.ts",
  "villages-founding-editor.tsx",
  "villages-player-role.tsx",
  "villages-chat-paragraphs.ts",
  "villages-inline-markdown.ts",
  "villages-room-reading.ts",
  "villages-snapshot-normalization.ts",
].map((name) => join(CLIENT_ROOT, name));

const entrySource = readFileSync(CLIENT_SOURCES[0]!, "utf8");
assert.match(
  entrySource,
  /typeof playerPersonaName === "string" \? playerPersonaName\.trim\(\) \|\| "You" : "You"/u,
  "A snapshot from an older or mismatched server must not blank the tab when the optional Persona-name value is absent.",
);
assert.match(
  entrySource,
  /return normalizeVillageSnapshot\(payload\) as T;/u,
  "Every successful Villages API response must pass through the shared snapshot normalization boundary before state can receive it.",
);
assert.match(
  entrySource,
  /fresh \|\| !village\s*\? \[\]\s*: village\.settings\.venues\.filter/u,
  "Opening setup for a new village must start with an empty unified venue list.",
);
assert.doesNotMatch(
  entrySource,
  /publicCenter\?\.presentation\.x !== null && publicCenter\.presentation\.y/u,
  "An optional first read cannot guard a second direct read: an absent public center must not blank the Villages tab.",
);

const validVenue = {
  id: "library",
  name: "Library",
  category: "destination",
  presentation: { image: null, x: 0.4, y: 0.6 },
  occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
  capabilities: ["reading"],
  state: { condition: "sound", upgrades: [], furniture: [], publicFacts: [], updatedAt: "" },
};
const malformedVenue = { id: "legacy-library", name: "Legacy Library" };
const normalizedSnapshot = normalizeVillageSnapshot({
  settings: { venues: [validVenue, malformedVenue] },
});
assert.deepEqual(
  normalizedSnapshot.settings.venues,
  [validVenue],
  "A truthy legacy venue without presentation and occupancy must be excluded before render helpers can dereference it, while valid venues remain unchanged.",
);

const require_ = createRequire(import.meta.url);

/** The compiler is an explicit locked repository dependency. */
function compilerPath(): string {
  let packageRoot: string;
  try {
    packageRoot = dirname(require_.resolve("typescript/package.json"));
  } catch (cause) {
    assert.fail(`The locked TypeScript compiler must be installed: ${cause}`);
  }
  const tsc = join(packageRoot, "bin/tsc");
  assert.ok(existsSync(tsc), `The TypeScript package must still ship its compiler at ${tsc}`);
  return tsc;
}

/**
 * Every diagnostic the compiler has about these files, as written lines.
 *
 * `--jsx react-jsx` is the mode the bundle is built in, and the flags are the minimum
 * that gets the file parsed and its names resolved: no strictness is asked for beyond
 * that, because a strictness complaint is not what this suite is about and a suite that
 * fails for a reason it does not own is a suite somebody deletes.
 */
function diagnose(files: readonly string[]): string[] {
  const result = spawnSync(
    process.execPath,
    [
      compilerPath(),
      "--noEmit",
      "--target",
      "esnext",
      "--module",
      "esnext",
      "--moduleResolution",
      "bundler",
      "--jsx",
      "react-jsx",
      "--jsxImportSource",
      "react",
      "--lib",
      "esnext,dom",
      "--skipLibCheck",
      "--strict",
      "false",
      "--noImplicitAny",
      "false",
      ...files,
    ],
    { cwd: repoRoot, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 },
  );
  assert.ok(
    !result.error,
    `The compiler has to actually run — a spawned process that failed reports no diagnostics and would look exactly like a clean tree: ${result.error?.message}`,
  );
  return `${result.stdout ?? ""}\n${result.stderr ?? ""}`.split(/\r?\n/u).filter((line) => /error TS\d+/u.test(line));
}

/*
  The instrument is proven armed before the tree is asked anything.

  A scratch file with a name that nothing declares has to come back as one — otherwise
  the compiler was never reached, or the flags stopped it parsing, or the family got
  renamed under us, and every assertion below would pass for the wrong reason. This is
  the same argument the stylesheet's backtick check makes in the layout suite: the guard
  on the guard.
*/
const scratch = mkdtempSync(join(tmpdir(), "villages-client-scope-"));
let armedDefects: string[];
try {
  const scratchFile = join(scratch, "unbound-name.ts");
  writeFileSync(scratchFile, "const unbound = aNameNothingDeclares;\nexport default unbound;\n", "utf8");
  armedDefects = diagnose([scratchFile]);
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
assert.ok(
  armedDefects.some((line) => /TS2304/u.test(line)),
  "A file with a name nothing declares must come back as a defect, or this suite is not checking anything: " +
    `the compiler reported ${armedDefects.length} diagnostic(s) for it`,
);

console.log("villages-client-scope: snapshot guards and compiler smoke test passed");
