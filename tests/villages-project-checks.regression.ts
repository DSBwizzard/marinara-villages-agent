import assert from "node:assert/strict";
import { fixture, renovation } from "./fixtures/villages-projects.fixture.js";
const persisted = fixture();
const persistedId = await renovation(persisted, {
  form: "A restored stone hall",
  exteriorDescription: "A repaired doorway beneath the original arch.",
});
await persisted.agree(persistedId);
const savedDesign = structuredClone(persisted.get(persistedId).lifecycle!.change!);
await persisted.service.reviseRenovationProject(persistedId, persisted.body(persistedId, savedDesign));
assert.equal(persisted.get(persistedId).lifecycle!.builderId, "a", "an unchanged save retains the chosen lead");
assert.equal(persisted.get(persistedId).lifecycle!.candidates.length, 1, "spoken willingness survives decoding");
assert.equal(persisted.get(persistedId).lifecycle!.approvals.length, 1, "unchanged approval remains valid");
await persisted.service.reviseRenovationProject(
  persistedId,
  persisted.body(persistedId, { ...savedDesign, exteriorDescription: "A different Entrance." }),
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
