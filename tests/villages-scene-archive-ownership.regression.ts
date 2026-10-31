import assert from "node:assert/strict";
import { authorSceneFixture } from "./helpers/village-storage.fixture.js";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import { createSceneArchive } from "../packages/villages/src/server/features/scenes/archive-service.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { SESSION_KIND, SESSION_PREFIX } from "../packages/villages/src/server/adapters/storage/scene-slots.js";

type Document = Awaited<ReturnType<CapabilityDocumentStore["list"]>>[number];
const documents = new Map<string, Document>();
const stamp = "2026-10-27T12:00:00.000Z";
function put(id: string, kind: string, data: unknown = {}) {
  documents.set(id, {
    id,
    packageId: "villages",
    kind,
    name: id,
    description: "",
    data: kind === SESSION_KIND ? authorSceneFixture(documents, data) : data,
    revision: 1,
    createdAt: stamp,
    updatedAt: stamp,
  });
}
const closed = coerceSession({ version: 3, id: "closed", status: "closed", startedAt: stamp });
const active = coerceSession({ version: 3, id: "active", status: "active", startedAt: stamp });
put(SESSION_PREFIX + closed.id, SESSION_KIND, closed);
put(SESSION_PREFIX + active.id, SESSION_KIND, active);
put("terminal", "scene-terminal");
put("project-evidence", "project-scene-evidence");
let activeId = "active";
const readIds: string[] = [];
const service = createSceneArchive({
  villagesDocuments: () => ({
    list: async (_packageId, kind) => [...documents.values()].filter((row) => row.kind === kind),
    getById: async (_packageId, id) => {
      readIds.push(id);
      return documents.get(id) ?? null;
    },
    remove: async (_packageId, id, revision) => documents.get(id)?.revision === revision && documents.delete(id),
  }),
  readActive: async () => ({ sessionId: activeId, placeId: "" }),
});
assert.deepEqual(
  (await service.listVenueVisits()).map((scene) => scene.id),
  ["closed"],
);
assert.equal((await service.readVenueVisit("closed")).id, "closed");
await assert.rejects(service.readVenueVisit("active"), /not closed/);
const original = documents.get(SESSION_PREFIX + "closed")!.data;
const otherPages = new Map<string, Document>();
documents.get(SESSION_PREFIX + "closed")!.data = authorSceneFixture(
  otherPages,
  coerceSession({
    version: 3,
    id: "other",
    status: "closed",
    startedAt: stamp,
    lines: [
      {
        id: "other-line",
        role: "assistant",
        kind: "narration",
        content: "Other Scene sentinel",
        at: stamp,
        heardBy: ["player"],
        playerHeard: true,
      },
    ],
  }),
);
for (const [id, row] of otherPages) documents.set(id, row);
readIds.length = 0;
await assert.rejects(service.readVenueVisit("closed"), /no longer available/);
assert.deepEqual(
  readIds,
  [SESSION_PREFIX + "closed"],
  "A mismatched inner Scene ID is rejected before reading transcript or private bodies.",
);
documents.get(SESSION_PREFIX + "closed")!.data = original;
for (const id of otherPages.keys()) documents.delete(id);
await assert.rejects(service.resetVenueSessions(), /active Scene/);
activeId = "";
await service.resetVenueSessions();
assert.equal(documents.size, 0, "reset removes Scene receipts and Project evidence along with Scenes");
