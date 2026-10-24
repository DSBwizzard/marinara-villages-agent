import assert from "node:assert/strict";
import { fixture } from "./fixtures/villages-projects.fixture.js";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { createProjectLifecycle } from "../packages/villages/src/server/features/projects/project-lifecycle-service.js";
import {
  draftNewVenueProject,
  draftRenovationProject,
} from "../packages/villages/src/server/features/projects/project-drafts.js";
import {
  reconcileProjectLifecycles,
  PROJECT_DURATION_MS,
} from "../packages/villages/src/server/domain/rules/project-lifecycle-rules.js";
const f = fixture(),
  now = new Date("2026-10-24T00:00:00Z");
const ids = [
  await f.newProject("One", "a", { x: 0.5, y: 0.5 }),
  await f.newProject("Two", "b", { x: 0.8, y: 0.8 }),
  await f.newProject("Three", "c", { x: 0.5, y: 0.8 }),
];
let record = { data: structuredClone(f.state()), revision: 1 },
  conflicts = 0;
const documents = {
  getById: async () => structuredClone(record),
  update: async (input: any) => {
    if (input.expectedRevision !== record.revision) {
      conflicts++;
      return null;
    }
    record = { data: structuredClone(input.data), revision: record.revision + 1 };
    return structuredClone(record);
  },
};
const repository = createVillageRepository(() => documents as any);
const service = createProjectLifecycle({
  draftNewVenueProject,
  draftRenovationProject,
  mutateVillageState: async (update: any) => {
    await repository.mutateAuthority(update);
    return repository.readAuthority();
  },
} as any);
const commands = ids.map((id, index) => ({
  id,
  body: { requestId: "start-" + index, expectedRevision: f.get(id).lifecycle!.revision },
}));
const results = await Promise.allSettled(
  commands.map((command) => service.startProjectConstruction(command.id, command.body, now)),
);
assert.equal(results.filter((result) => result.status === "fulfilled").length, 2);
assert(conflicts > 0, "actual document CAS retried conflicting starts");
assert.equal(record.data.projects.filter((project) => project.status === "working").length, 2);
assert.equal(record.data.venues.length, 3, "two sites plus the original Venue");
const committed = record.data.projects.find((project) => project.status === "working")!;
const retry = commands.find((command) => command.id === committed.id)!;
await service.startProjectConstruction(retry.id, retry.body, now);
assert.equal(record.data.venues.length, 3, "lost acknowledgement retry creates no second site");
const create = { requestId: "create", name: "Current", description: "A future room.", classes: ["community"] };
await service.createNewVenueProject(create);
await service.createNewVenueProject(create);
await assert.rejects(service.createNewVenueProject({ ...create, name: "Other" }), /already used/);
for (const completeFirst of [false, true]) {
  record = { data: structuredClone(f.state()), revision: 1 };
  await service.startProjectConstruction(ids[0], commands[0].body, now);
  const complete = () =>
    repository.mutateAuthority((state) =>
      reconcileProjectLifecycles(state, new Date(now.getTime() + PROJECT_DURATION_MS)),
    );
  const cancel = () =>
    service.cancelProject(ids[0], { requestId: "cancel", expectedRevision: f.get(ids[0]).lifecycle!.revision });
  const race = await Promise.allSettled(completeFirst ? [complete(), cancel()] : [cancel(), complete()]);
  const project = record.data.projects.find((project) => project.id === ids[0])!;
  assert.equal(project.status, completeFirst ? "complete" : "cancelled");
  assert.equal(
    record.data.venues.some((venue) => venue.buildProjectId === project.id),
    completeFirst,
  );
  if (completeFirst)
    assert(
      race.some((result) => result.status === "rejected"),
      "late cancellation cannot undo completed work",
    );
  else assert.equal(record.data.projectWishOutbox.length, 0, "cancelled work emits no completion benefit");
}
console.log("Concurrent starts, CAS retries, request payload binding and cancellation/completion races passed.");
