// Villages — the tab and the server have to agree about what a village's settings
// are, and nothing was saying whether they did.
//
// This exists because they quietly stopped agreeing. When the Persona took over
// the question "who are you", the server dropped the typed player name and blurb
// from the settings view it sends — deliberately, with a comment saying so, because
// a second answer to a question the Persona already answers is a way for the two to
// disagree. The tab went on being written against the view as it used to be: it
// keeps its own copy of the view's shape, and it read `settings.playerName` in three
// places. Two of those reads fell through to their `?? "You"` fallback, so the
// conversation drawer and the record of a village's conversations called the player
// "You" however carefully they had said who they were. The third handed `undefined`
// to `.trim()` inside founding a village, and founding a village stopped working
// with a TypeError about a property of undefined.
//
// None of that could fail a check it was ever run against. A type is only ever
// compared against the keys it declares — a field missing from the other side of an
// object from another package is not an error the compiler is asked to look for, and
// this package is bundled with no type pass at all. So the seam is read here as
// text on both sides and held together, which is what the package's build genuinely
// does with it.
//
// What is checked is the shape of the seam and not a behaviour: every settings field
// the tab reads has to be declared by the view the server sends, the tab's own copy
// of that view may not declare anything the server does not send, and the fields
// that were removed for the Persona's sake may not come back on either side.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SERVICES = "packages/villages/src/engine/packages/server/src/services/villages";
const CLIENT = "packages/villages/src/engine/packages/client/src/villages-package-entry.tsx";

const read = (relative: string) => readFileSync(resolve(repoRoot, relative), "utf8");

/*
  The fields a declared object type owns.

  Declared fields sit two spaces in and carry a colon; everything deeper than that
  belongs to a field's own type, and a doc comment's lines begin with an asterisk
  rather than a name, so neither is mistaken for a field. A parse that quietly
  found nothing would leave every comparison below vacuously true, which is why
  both sides are also counted.
*/
function declaredFields(source: string, typeName: string): string[] {
  const at = source.indexOf(`type ${typeName} = {`);
  assert.ok(at >= 0, `${typeName} must still be declared`);
  const end = source.indexOf("\n};", at);
  assert.ok(end > at, `${typeName} must still be closed by a brace in the first column`);
  const body = source.slice(at, end);
  return [...body.matchAll(/^\s{2}([A-Za-z][A-Za-z0-9]*)\??:/gmu)].map((match) => match[1]);
}

/*
  The fields the tab reads out of the settings box, and the fields its own copy of
  the view claims to have.

  Comments are stripped first. Both sides of this seam explain the removed fields in
  prose, and prose that names `settings.playerName` is not a read of it — the whole
  point of the check is that the reads are gone while the explanation stays.
*/
const stripComments = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//gu, " ").replace(/(^|\s)\/\/[^\n]*/gmu, "$1");

const clientSource = stripComments(read(CLIENT));

const serverView = declaredFields(read(`${SERVICES}/types.ts`), "VillageSettingsView");
const clientCopy = declaredFields(clientSource, "VillageSettings");
const clientReads = [
  ...new Set(
    [...clientSource.matchAll(/(?:snapshot|village)\??\.settings\??\.([A-Za-z][A-Za-z0-9]*)/gu)].map(
      (match) => match[1],
    ),
  ),
];

// A scan that found nothing, or almost nothing, would let every assertion below
// pass while checking nothing at all — and a scan of the tab's copy of the view is
// the one that goes quiet first, because a copy that stops parsing stops being
// compared to anything rather than starting to disagree.
assert.ok(serverView.length >= 30, `the view should still carry its fields (found ${serverView.length})`);
assert.ok(clientCopy.length >= 30, `the tab's copy of the view should still be readable (found ${clientCopy.length})`);
assert.ok(clientReads.length >= 30, `the tab should still read its settings (found ${clientReads.length})`);

/*
  Every field the tab reads is a field the server sends.

  This is the assertion that would have caught the crash: `playerName` was read here
  and absent there, and the read came back `undefined` at runtime with nothing in
  between to object.
*/
const serverSet = new Set(serverView);
const unreadable = clientReads.filter((field) => !serverSet.has(field));
assert.deepEqual(unreadable, [], `the tab reads fields the server does not send: ${unreadable.join(", ")}`);

/*
  The tab's copy of the view does not claim more than the view has.

  Same failure, one step earlier: the copy declared `playerName` and
  `playerDescription`, which is why the reads above were written at all and why they
  looked reasonable while they were being written.
*/
const overclaiming = [...new Set(clientCopy)].filter((field) => !serverSet.has(field));
assert.deepEqual(
  overclaiming,
  [],
  `the tab's copy of the settings view declares fields the server does not send: ${overclaiming.join(", ")}`,
);

/*
  And the fields that moved to the Persona stay moved.

  The view must not carry them, because carrying them is the two answers disagreeing
  the server's own comment warns about; the tab must not read them, because reading
  one is how founding a village stopped working.
*/
for (const gone of ["playerName", "playerDescription", "playerNameMaxLength", "playerDescriptionMaxLength"]) {
  assert.ok(!serverSet.has(gone), `${gone} belongs to the Persona now and must not be on the settings view`);
  assert.ok(!clientReads.includes(gone), `${gone} is not sent any more, so the tab must not read it`);
}

// The name the tab prints for the player is the one the village cached of the linked
// Persona, read through a single reader so that there is one place for it to be wrong
// in — and so that a scan of the form above can see it.
const name = /settings\??\.playerPersonaName/gu.exec(clientSource);
assert.ok(name, "the player's name must still come from the Persona the village cached");

console.log("Villages settings drift regression: view, copy, reads ok");
