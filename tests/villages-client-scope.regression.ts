// Villages — proof that no name in the client tree is read without being bound.
//
// This file exists because 0.4.69 shipped a tab that went black the moment the chat's
// "..." menu was opened, and every gate in this repository passed it.
//
// The bug was one missing word. The drawer's debug menu grew a third press that calls
// `onForceEnding`; the prop was declared in the drawer's props type, the tab handed it
// over at the call site, and it was left out of the destructuring list at the top of the
// component. A prop that is declared and never taken is not a prop — the name is bound
// nowhere — so the render threw the instant the menu that draws it opened. React
// unmounted the tree, the Engine showed a black tab, and every control in the village
// went with it.
//
// None of the three kinds of gate this repository has could see it:
//
//   - the BUNDLE is built with esbuild and no type pass, so an unbound name is a name
//     like any other and the output is perfectly valid JavaScript;
//   - ESLint runs with `no-undef` off for TypeScript, because it cannot tell a JSX
//     global from a typo;
//   - every regression suite here reads SOURCE AS TEXT, where a name that is written
//     but never bound looks exactly like a name that is.
//
// So the one thing that was missing is the one thing a compiler does. This is not a type
// check and must not become one. The client tree has no tsconfig and React is not
// installed in this repository, so the unresolved-module diagnostics that come with that
// are expected and are ignored. What is read is the family of diagnostics that mean the
// file is wrong on its own terms — a name that resolves to nothing, a prop the type
// requires and the caller never hands over, a binding read before it exists, a call with
// the wrong number of arguments. Those are the mistakes the bundle, the linter and the
// text-reading suites cannot catch between them, and they are the ones that blank a tab
// rather than merely misdraw it.
//
// The compiler is borrowed from `typescript-eslint`'s own dependency rather than added as
// a direct one: all that is wanted is the compiler `npm run check` already has on disk. If
// it is ever missing the suite FAILS rather than skipping, because a guard that quietly
// stops guarding is the whole reason this file is here — and so the instrument is proven
// armed first, on a scratch file of our own that has to produce a defect, before the tree
// is asked for one.
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

/*
  The defects worth failing on, in the words of what they are rather than of what the
  compiler calls them.

  The codes left OUT are the reason this list is written down instead of grepping for
  `error TS`: with React uninstalled and the engine's own types out of reach, this tree
  produces five `TS2322` (a value of an unresolvable type assigned to a typed prop), one
  `TS2339` (a property of something that resolved to `unknown`) and one `TS2875` (JSX
  without the jsx-runtime types). All seven are artefacts of what is NOT installed and
  none of them is a statement about this file's own code. They are counted and printed
  rather than asserted on, so the noise floor is visible in the output when it changes.
*/
const DEFECT_FAMILIES: ReadonlyArray<readonly [string, RegExp]> = [
  ["a name that is read and bound nowhere", /\bTS2304\b|\bTS2552\b|\bTS2503\b/u],
  ["a prop the type requires and the caller never hands over", /\bTS2739\b|\bTS2740\b|\bTS2741\b/u],
  ["a binding read before it exists", /\bTS2448\b|\bTS2454\b/u],
  ["a call with the wrong number of arguments", /\bTS2554\b|\bTS2556\b/u],
  ["a property that is not on the thing it is read from", /\bTS2551\b/u],
];

const require_ = createRequire(import.meta.url);

/** The compiler, out of the dependency that already carries it. */
function compilerPath(): string {
  let packageRoot: string;
  try {
    packageRoot = dirname(require_.resolve("typescript/package.json"));
  } catch (cause) {
    assert.fail(
      `The client tree cannot be checked without the TypeScript compiler: ${cause}. It is a dependency of ` +
        "typescript-eslint rather than a direct one, and this suite is the only thing in the repository that runs " +
        "a compiler over the tab — so this is a FAIL rather than a skip.",
    );
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
  armedDefects.some((line) => DEFECT_FAMILIES[0][1].test(line)),
  "A file with a name nothing declares must come back as a defect, or this suite is not checking anything: " +
    `the compiler reported ${armedDefects.length} diagnostic(s) for it`,
);

const diagnostics = diagnose(CLIENT_SOURCES);
const defects = DEFECT_FAMILIES.flatMap(([family, pattern]) =>
  diagnostics.filter((line) => pattern.test(line)).map((line) => `${family} — ${line.trim()}`),
);

assert.deepEqual(
  defects,
  [],
  "The client tree must bind every name it reads: a name that is written but never bound is a render that throws, " +
    "and a render that throws takes the whole tab with it. This is how 0.4.69 blanked the village.",
);

const modules = diagnostics.filter((line) => /\bTS2307\b/u.test(line));
console.info(
  `The client tree binds every name it reads: ${CLIENT_SOURCES.length} files checked, ${defects.length} defect(s), ` +
    `${diagnostics.length} diagnostic(s) in total, ${modules.length} of them the unresolved modules this repository ` +
    "does not install.",
);
