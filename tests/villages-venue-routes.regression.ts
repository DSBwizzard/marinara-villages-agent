// Wiring proof for the active Scene, Venue editor, and Mailbox. Behavior is
// exercised by the Venue session, model, and location image suites.
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
  "/rooms/leave",
  "/rooms/archive",
  "/rooms/archive/:id",
  "/locations/venue",
  "/locations/venue/:venueId",
  "/locations/venue/image",
  "/locations/venue/:venueId/dependencies",
  "/locations/venue/:venueId/proposals",
  "/locations/venue/:venueId/player-move",
  "/venue-mail/:mailId/decision",
])
  assert.ok(routes.includes(`"${path}"`), `${path} is exposed`);

for (const retired of [
  "/villagers/:characterId/conversation",
  "/villagers/:characterId/greet",
  "/villagers/:characterId/end",
  "/villagers/:characterId/wish",
  "/rooms/debug-presence",
  "/rooms/leave-pending",
  "/rooms/archive/:id/retry-memory",
  "/venues/act",
  "/rooms/say",
  "/rooms/fulfill",
  "/chatlogs",
])
  assert.ok(!routes.includes(`"${retired}"`), `${retired} is retired`);

assert.match(routes, /await resetVenueSessions\(\);\s*return await resetVillage\(\)/u);
assert.match(routes, /mode !== "chat" && mode !== "ask" && mode !== "fulfill" && mode !== "act"/u);
assert.match(
  routes,
  /"\/rooms\/end"[\s\S]*return await closeVenueSessionWithReceipts/u,
  "direct visit endings return durable-memory receipts",
);
assert.ok(ui.includes('"/rooms/turn"'), "one composer sends all visit modes");
assert.match(ui, /const receiveRoomRecordEvents = useCallback/u, "all visit endings share receipt ingestion");
assert.doesNotMatch(
  ui,
  /answer\.session\.status === "closed"\) \{\s*setRoomNotices\(\[\]\)/u,
  "natural endings do not erase their durable-memory receipts",
);
assert.match(ui, /className=\{`\$\{ELEMENT_TAG\}-room-mode-menu`\}/u, "visit modes have a visible menu");
assert.match(ui, /View Mailbox/u, "the player can open Mailbox while visiting home");
assert.match(ui, /<VenueDraftFields/u, "Venues use the shared editor");
assert.match(ui, /Search Venues/u, "the Venue index is searchable");
assert.match(ui, /Retry opening/u);
assert.match(ui, /Continue without opening/u);
assert.match(ui, /That line could not be sent/u, "failed turns keep a visible error");
assert.ok(
  routes.includes("await leaveVenueSession("),
  "leaving delegates receipt and recovery handling to the session service",
);
assert.match(ui, /Open transcript/u);
assert.match(session, /const ACTIVE_ID = "villages-active-venue"/u);
assert.match(session, /heardHistory: \{ characterId: string; lineIds: string\[\] \}\[\]/u);

console.log("villages-venue-routes: ok");
