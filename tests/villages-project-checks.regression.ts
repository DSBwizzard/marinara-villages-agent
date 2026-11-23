import assert from "node:assert/strict";
import { fixture, renovation, seedObservedProjectRoom } from "./fixtures/villages-projects.fixture.js";
import { renovationZoneChanges } from "../packages/villages/src/client/shared/zone-renovation.js";

{
  const f = fixture();
  await f.mutate((state) => {
    const venue = state.venues[0];
    const common = venue.zones!.find((zone) => zone.id === "common")!;
    common.purpose = "Canonical purpose";
    venue.zones!.push({
      ...structuredClone(common),
      id: "private",
      name: "Private",
      kind: "restricted",
      purpose: "Unseen purpose",
      connectedTo: ["exterior"],
    });
    venue.zones![0].connectedTo!.push("private");
  });
  const base = structuredClone(f.state().venues[0].zones!.filter((zone) => zone.kind !== "exterior"));
  base.find((zone) => zone.id === "private")!.purpose = "";
  const zones = renovationZoneChanges(
    base.map((zone) => (zone.id === "common" ? { ...zone, purpose: "Serve coffee" } : zone)),
    base,
  );
  assert.deepEqual(zones, [{ id: "common", purpose: "Serve coffee" }, { id: "private" }]);
  const id = await renovation(f, { zones, expectedZoneIds: base.map((zone) => zone.id) });
  assert.doesNotMatch(
    JSON.stringify(f.get(id).lifecycle!.change),
    /Unseen purpose|Canonical purpose/,
    "the Project response never exposes untouched private uses",
  );
  await f.service.reviseRenovationProject(id, f.body(id, f.get(id).lifecycle!.change!));
  await f.service.reviseRenovationProject(
    id,
    f.body(id, { detail: "Keep the proposed use.", zones: [{ id: "common" }, { id: "private" }] }),
  );
  assert.equal(
    f.get(id).lifecycle!.change!.zones!.find((zone) => zone.id === "common")!.purpose,
    "Serve coffee",
    "omission preserves a prior explicit proposal",
  );
  assert.doesNotMatch(JSON.stringify(f.get(id).lifecycle!.change), /Unseen purpose/);
  await f.agree(id);
  await f.service.startProjectConstruction(id, f.body(id));
  await f.service.debugCompleteProjectConstruction(id, f.body(id));
  assert.equal(f.state().venues[0].zones!.find((zone) => zone.id === "private")!.purpose, "Unseen purpose");
  await assert.rejects(renovation(f, { zones, expectedZoneIds: ["common"] }), /layout changed/);
}
{
  const f = fixture();
  await f.mutate((state) => {
    state.venues[0].residentIds = ["b"];
    state.venues[0].destinations = { b: { home: "common", sleep: "common" } };
  });
  const id = await renovation(f, { zones: [{ id: "common", kind: "personal", ownerId: "b" }] });
  assert(f.get(id).lifecycle!.affectedIds.includes("b"), "the new room owner must consent");
  await assert.rejects(f.service.startProjectConstruction(id, f.body(id)), /willing resident|necessary agreements/);
  await f.agree(id);
  await f.service.startProjectConstruction(id, f.body(id));
  await f.service.debugCompleteProjectConstruction(id, f.body(id));
  const room = f.state().venues[0].zones!.find((zone) => zone.id === "common")!;
  assert.equal(room.ownerId, "b");
  assert.equal(room.access!.mode, "permission-required");
  assert.deepEqual(room.access!.managerIds, ["b"]);
  assert.deepEqual(room.access!.memberIds, ["b"]);
  await assert.rejects(renovation(f, { zones: [{ id: "common", ownerId: "a" }] }), /occupied rooms/);
}
{
  const f = fixture();
  await f.mutate((state) => {
    const venue = state.venues[0];
    venue.residentIds = ["b"];
    venue.access!.work = [
      {
        characterId: "a",
        activity: "Serving",
        zoneId: "common",
        accessZoneIds: ["common"],
        days: ["Monday"],
        startMinute: 540,
        endMinute: 1020,
      },
    ];
  });
  await assert.rejects(
    renovation(f, { zones: [{ id: "common", kind: "personal", ownerId: "b" }] }),
    /only the rooms this worker may use/,
  );
}
const persisted = fixture();
await persisted.mutate((state) => seedObservedProjectRoom(state, state.venues[0], "exterior", "A stone arch."));
const persistedId = await renovation(persisted, {
  form: "A restored stone hall",
  roomEdits: [{ zoneId: "exterior", text: "A repaired doorway beneath the original arch." }],
});
await persisted.agree(persistedId);
const savedDesign = structuredClone(persisted.get(persistedId).lifecycle!.change!);
await persisted.service.reviseRenovationProject(persistedId, persisted.body(persistedId, savedDesign));
assert.equal(persisted.get(persistedId).lifecycle!.builderId, "a", "an unchanged save retains the chosen lead");
assert.equal(persisted.get(persistedId).lifecycle!.candidates.length, 1, "spoken willingness survives decoding");
assert.equal(persisted.get(persistedId).lifecycle!.approvals.length, 1, "unchanged approval remains valid");
await persisted.service.reviseRenovationProject(
  persistedId,
  persisted.body(persistedId, { ...savedDesign, roomEdits: [{ zoneId: "exterior", text: "A different Entrance." }] }),
);
assert.equal(persisted.get(persistedId).lifecycle!.builderId, "", "changed physical terms need renewed willingness");
assert.equal(persisted.get(persistedId).lifecycle!.candidates.length, 0);
assert.equal(persisted.get(persistedId).lifecycle!.approvals.length, 0, "changed Entrance needs renewed approval");

for (const role of ["lead", "controller"]) {
  const f = fixture(),
    id = role === "lead" ? await f.newProject() : await renovation(f);
  if (role === "controller") await f.agree(id, "b");
  await f.mutate((state) => {
    state.villagers.find((resident) => resident.characterId === "a")!.incarnation = "replacement";
  });
  if (role === "lead") {
    await assert.rejects(f.service.lockProjectBuilder(id, f.body(id, { residentId: "a" })), /Ask this resident/);
    await assert.rejects(f.service.startProjectConstruction(id, f.body(id)), /willing resident/);
  } else {
    await f.service.lockProjectBuilder(id, f.body(id, { residentId: "b" }));
    await assert.rejects(f.service.startProjectConstruction(id, f.body(id)), /necessary agreements/);
  }
  await f.service.renewRenovationApprovals(id, f.body(id));
  assert.equal(f.get(id).lifecycle!.approvals.length, 0);
  if (role === "lead") assert.equal(f.get(id).lifecycle!.builderId, "");
  await f.agree(id, role === "lead" ? "a" : "b");
  await f.service.startProjectConstruction(id, f.body(id));
  assert.equal(f.get(id).status, "working", "fresh current-person consent works through the public lifecycle service");
}
console.log("Current Project terms, native identity and explicit lifecycle commands passed.");
