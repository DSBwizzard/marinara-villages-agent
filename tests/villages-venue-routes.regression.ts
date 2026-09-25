// Wiring proof for the active venue visit. Behavioral coverage lives in
// villages-venue-session.regression.ts; these assertions protect its route and UI entry points.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const routes = readFileSync(
  resolve(root, "packages/villages/src/engine/packages/server/src/routes/villages.routes.ts"),
  "utf8",
);
const ui = readFileSync(
  resolve(root, "packages/villages/src/engine/packages/client/src/villages-package-entry.tsx"),
  "utf8",
);
const session = readFileSync(
  resolve(root, "packages/villages/src/engine/packages/server/src/services/villages/venue-session.ts"),
  "utf8",
);

for (const path of [
  "/rooms/active",
  "/rooms",
  "/rooms/greet",
  "/rooms/continue",
  "/rooms/turn",
  "/rooms/end",
  "/rooms/leave-pending",
  "/rooms/archive",
  "/rooms/archive/:id",
  "/rooms/archive/:id/retry-memory",
])
  assert.ok(routes.includes(`"${path}"`), `${path} is exposed`);
for (const retired of [
  "/villagers/:characterId/conversation",
  "/villagers/:characterId/greet",
  "/villagers/:characterId/end",
  "/villagers/:characterId/wish",
  "/rooms/leave",
  "/rooms/debug-presence",
  "/villagers/:characterId/spinoff",
  "/venues/act",
  "/rooms/say",
  "/rooms/fulfill",
  "/chatlogs",
])
  assert.ok(!routes.includes(`"${retired}"`), `${retired} is retired`);
assert.match(
  routes,
  /await resetVenueSessions\(\);\s*return await resetVillage\(\)/u,
  "reset removes old venue visits",
);
assert.match(
  routes,
  /mode !== "chat" && mode !== "ask" && mode !== "fulfill" && mode !== "act"/u,
  "one turn path accepts all modes",
);
assert.ok(ui.includes('"/rooms/turn"'), "the composer uses the shared turn path");
assert.match(routes, /return await readVillageWriting\(\)/u, "the writing route reads per-village settings");
assert.match(routes, /await saveVillageWriting\(request\.body \?\? \{\}\)/u, "the writing route saves new controls");
assert.match(ui, /<VillageNarrationStyleSettings \/>/u, "narration style is in Village Settings");
assert.match(ui, /DEBUG: Villager reply guidance/u, "reply guidance has a debug editor");
assert.doesNotMatch(ui, /<AgentNarration \/>/u, "the old preset panel is gone");
assert.match(ui, /request<\{ session: RoomView \| null \}>\("\/rooms\/active"/u, "the UI restores the active visit");
assert.match(ui, /Choose one villager/u, "Fulfill asks for one target");
assert.match(ui, /className=\{`\$\{ELEMENT_TAG\}-room-modes`\}/u, "venue modes have a visible button row");
assert.match(ui, /DEBUG: Active traces/u, "venue view exposes trace diagnostics");
assert.match(ui, /Venue features \(/u, "venue view shows defining features");
assert.match(ui, /Promote to feature/u, "a player can promote an existing item into a feature slot");
assert.match(ui, /Retry greeting/u, "failed opening has a visible retry");
assert.match(ui, /Continue without greeting/u, "failed opening can continue without another model call");
assert.match(ui, /Retry message/u, "failed turns have a visible retry");
assert.match(ui, /Leave with memory pending/u, "a failed end offers a pending-memory exit");
assert.match(ui, /Open transcript/u, "archive summaries load exact transcripts on demand");
assert.match(ui, /Load more memories/u, "the story view pages chronicle entries");
assert.doesNotMatch(ui, /Create spinoff — NYI/u, "unfinished spinoff control is absent from venue chat");
assert.ok(!ui.includes("groupReply"), "the old group generation choice is absent from the UI");
assert.match(
  session,
  /const ACTIVE_ID = "villages-active-venue"/u,
  "one server-owned pointer identifies the active visit",
);
assert.match(
  session,
  /heardHistory: \{ characterId: string; lineIds: string\[\] \}\[\]/u,
  "each resident has separately stored heard history",
);

console.log("villages-venue-routes: ok");
