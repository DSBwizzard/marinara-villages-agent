import assert from "node:assert/strict";
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
    data,
    revision: 1,
    createdAt: stamp,
    updatedAt: stamp,
  });
}
const closed = coerceSession({ version: 2, id: "closed", status: "closed", startedAt: stamp });
const active = coerceSession({ version: 2, id: "active", status: "active", startedAt: stamp });
put(SESSION_PREFIX + closed.id, SESSION_KIND, closed);
put(SESSION_PREFIX + active.id, SESSION_KIND, active);
put("terminal", "scene-terminal");
put("project-evidence", "project-scene-evidence");
put("spinoff", "spinoff");
let activeId = "active";
const service = createSceneArchive({
  villagesDocuments: () => ({
    list: async (_packageId, kind) => [...documents.values()].filter((row) => row.kind === kind),
    getById: async (_packageId, id) => documents.get(id) ?? null,
    remove: async (_packageId, id, revision) => documents.get(id)?.revision === revision && documents.delete(id),
  }),
  readActive: async () => ({ sessionId: activeId, placeId: "" }),
  readSession: async (id) => coerceSession(documents.get(SESSION_PREFIX + id)?.data),
});
assert.deepEqual(
  (await service.listVenueVisits()).map((scene) => scene.id),
  ["closed"],
);
assert.equal((await service.readVenueVisit("closed")).id, "closed");
await assert.rejects(service.readVenueVisit("active"), /not closed/);
await assert.rejects(service.resetVenueSessions(), /active Scene/);
activeId = "";
await service.resetVenueSessions();
assert.equal(documents.size, 0, "reset removes Scene receipts and Project evidence along with Scenes");
