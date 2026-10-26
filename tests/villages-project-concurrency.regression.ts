import { villageFixtureDocuments } from "./helpers/village-storage.fixture.js";
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
const root = () => ({
  id: "villages-village",
  packageId: "villages",
  kind: "village",
  data: structuredClone(f.state()),
  revision: 1,
});
let record = root(),
  conflicts = 0;
const rows = new Map<string, any>();
const documents = {
  getById: async (_pkg: string, id: string) => structuredClone(id === record.id ? record : (rows.get(id) ?? null)),
  list: async (_pkg: string, kind: string) =>
    [...rows.values()].filter((row) => row.kind === kind).map((row) => structuredClone(row)),
  create: async (input: any) => {
    const row = { ...structuredClone(input), revision: 1 };
    rows.set(input.id, row);
    return structuredClone(row);
  },
  remove: async (_pkg: string, id: string, revision: number) => {
    if (rows.get(id)?.revision !== revision) return false;
    rows.delete(id);
    return true;
  },
  update: async (input: any) => {
    if (input.id !== record.id) {
      const old = rows.get(input.id);
      if (!old || old.revision !== input.expectedRevision) return null;
      const row = { ...old, ...structuredClone(input), revision: old.revision + 1 };
      rows.set(input.id, row);
      return structuredClone(row);
    }
    // A write outside this process can still win the CAS despite local serialization.
    if (conflicts === 0) record.revision++;
    if (input.expectedRevision !== record.revision) {
      conflicts++;
      return null;
    }
    record = { ...record, data: structuredClone(input.data), revision: record.revision + 1 };
    return structuredClone(record);
  },
};
const repository = createVillageRepository(() => villageFixtureDocuments(documents as any));
const service = createProjectLifecycle({
  draftNewVenueProject,
  draftRenovationProject,
  mutateVillageState: async (update: any, options: any) => {
    await repository.mutateAuthority(update, options);
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
  record = root();
  rows.clear();
  await service.startProjectConstruction(ids[0], commands[0].body, now);
  const complete = () =>
    repository.mutateAuthority(
      (state) => reconcileProjectLifecycles(state, new Date(now.getTime() + PROJECT_DURATION_MS)),
      { memories: true },
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
