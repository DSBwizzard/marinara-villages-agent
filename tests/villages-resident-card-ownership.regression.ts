import assert from "node:assert/strict";
import Fastify from "fastify";
import { readVillagerCard, toCatalogEntry } from "../packages/villages/src/server/adapters/engine/catalog.js";
import {
  createActivationScope,
  installDefaultActivation,
  scopedActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type { VillageSnapshot, VillageState } from "../packages/villages/src/server/domain/models/world.js";
import { snapshotFromCard } from "../packages/villages/src/server/domain/rules/resident-card-snapshot.js";
import { unwrittenVillageAgenda } from "../packages/villages/src/server/domain/rules/agenda-plan.js";
import { venueDraft } from "../packages/villages/src/server/domain/rules/venue-authoring.js";
import { createResidentCards } from "../packages/villages/src/server/features/residents/resident-card-service.js";
import {
  configureResidentCards,
  buildVillageCatalog,
  previewVillagerRefresh,
  applyVillagerRefresh,
} from "../packages/villages/src/server/features/residents/resident-cards.js";
import { registerResidentRoutes } from "../packages/villages/src/server/features/residents/routes.js";
import { registerSnapshotCatalogRoutes } from "../packages/villages/src/server/features/world/routes.js";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
function fixture(name: string) {
  const card = readVillagerCard({
    id: "same",
    data: JSON.stringify({
      name,
      description: `private authored ${name}`,
      system_prompt: `private instruction ${name}`,
    }),
  } as any);
  const state = defaultVillageState();
  const stamp = "2026-10-06T12:00:00.000Z";
  state.setupAt = state.foundedAt = stamp;
  state.villagers = [
    {
      characterId: "same",
      cardSnapshot: snapshotFromCard(card, 4),
      addedAt: stamp,
      completedWishes: [],
      ingestSchedule: false,
      agenda: unwrittenVillageAgenda(state.venues, card.name),
      remap: { signature: "retained-remap" } as any,
      remapFailure: { signature: "retained-failure" } as any,
    },
  ];
  const calls: string[] = [],
    owners: unknown[] = [],
    attempts: VillageState[] = [];
  const gate = deferred(),
    entered = deferred();
  let pause = false,
    sourceMissing = false,
    retry: ((next: VillageState) => void) | undefined;
  const note = (operation: string) => {
    calls.push(operation);
    owners.push(scopedActivation());
  };
  const service = createResidentCards({
    async readVillageState() {
      note("state");
      if (pause) {
        pause = false;
        entered.resolve();
        await gate.promise;
        owners.push(scopedActivation());
      }
      return structuredClone(state);
    },
    async listVillagerCards() {
      note("list");
      return [structuredClone(card), { ...card, id: "outsider", name: "Other card" }];
    },
    async findVillagerCard(id) {
      note(`find:${id}`);
      return !sourceMissing && id === card.id ? structuredClone(card) : null;
    },
    toCatalogEntry,
    async mutateVillageState(update) {
      note("mutate");
      const first = structuredClone(state);
      update(first);
      attempts.push(first);
      if (retry) {
        retry(state);
        retry = undefined;
        const second = structuredClone(state);
        update(second);
        attempts.push(second);
        Object.assign(state, second);
      } else Object.assign(state, first);
      return structuredClone(state);
    },
    async buildVillageSnapshot() {
      note("snapshot");
      return {
        village: { name },
        villagers: state.villagers.map((resident) => ({
          characterId: resident.characterId,
          name: resident.cardSnapshot.name,
        })),
      } as VillageSnapshot;
    },
  });
  assert.deepEqual(calls, [], "Constructing a card service performs no storage, library or provider work.");
  return {
    card,
    state,
    service,
    calls,
    owners,
    attempts,
    gate,
    entered,
    pause() {
      pause = true;
    },
    missingSource() {
      sourceMissing = true;
    },
    retryWith(change: (next: VillageState) => void) {
      retry = change;
    },
  };
}

const a = fixture("A"),
  b = fixture("B");
const catalog = await a.service.buildVillageCatalog();
assert.deepEqual(
  catalog.map((entry) => [entry.id, entry.name, entry.inVillage]),
  [
    ["same", "A", true],
    ["outsider", "Other card", false],
  ],
);
assert.deepEqual(Object.keys(catalog[0]!).sort(), ["comment", "id", "inVillage", "name", "summary", "tags"]);
assert(
  !JSON.stringify(catalog).includes("private instruction"),
  "The catalog excludes authored system instructions; its approved summary remains public.",
);
assert.equal((await b.service.buildVillageCatalog())[0]!.name, "B");
const preview = await a.service.previewVillagerRefresh("same");
assert.equal(preview.current.description, "private authored A");
assert.equal(preview.proposed?.revision, 5);
assert.equal(preview.changed, false);
assert.equal(preview.sourceAvailable, true);
const reads = a.calls.length;
await assert.rejects(a.service.previewVillagerRefresh("absent"), /does not live here/);
assert.deepEqual(a.calls.slice(reads), ["state"], "Residency is checked before library lookup.");
await a.service.applyVillagerRefresh("same");
assert(!a.calls.includes("mutate"), "Unchanged available content is not saved again.");
assert.equal(a.state.villagers[0]!.cardSnapshot.revision, 4);

const parallel = fixture("Parallel");
parallel.pause();
const pendingCatalog = parallel.service.buildVillageCatalog();
await parallel.entered.promise;
assert(parallel.calls.includes("list"), "Catalog library work begins while the Village read is still pending.");
parallel.gate.resolve();
await pendingCatalog;

const recovered = fixture("Recovered");
recovered.state.villagers[0]!.cardSnapshot.sourceStatus = "missing";
const recoveredAgenda = structuredClone(recovered.state.villagers[0]!.agenda);
await recovered.service.applyVillagerRefresh("same");
assert.equal(recovered.state.villagers[0]!.cardSnapshot.sourceStatus, "available");
assert.equal(recovered.state.villagers[0]!.cardSnapshot.revision, 5);
assert.deepEqual(recovered.state.villagers[0]!.agenda, recoveredAgenda);

const color = fixture("Color");
const retainedAgenda = structuredClone(color.state.villagers[0]!.agenda);
const retainedRemap = structuredClone(color.state.villagers[0]!.remap);
const retainedFailure = structuredClone(color.state.villagers[0]!.remapFailure);
color.card.nameColor = "#123456";
color.card.dialogueColor = "#654321";
await color.service.applyVillagerRefresh("same");
assert.equal(color.state.villagers[0]!.cardSnapshot.revision, 5);
assert.equal(color.state.villagers[0]!.cardSnapshot.nameColor, "#123456");
assert.deepEqual(color.state.villagers[0]!.agenda, retainedAgenda);
assert.deepEqual(color.state.villagers[0]!.remap, retainedRemap);
assert.deepEqual(color.state.villagers[0]!.remapFailure, retainedFailure);

const prose = fixture("Prose");
prose.card.description = "Changed authored prose";
const firstVenue = venueDraft({ name: "First Venue", description: "A gathering place", classes: ["gathering"] }, null);
const retryVenue = venueDraft(
  { name: "Retry Venue", description: "A changed gathering place", classes: ["gathering"] },
  null,
);
prose.state.venues = [firstVenue];
prose.retryWith((state) => {
  state.venues = [retryVenue];
});
await prose.service.applyVillagerRefresh("same");
assert.equal(prose.attempts.length, 2);
assert.equal(prose.attempts[0]!.villagers[0]!.cardSnapshot.revision, 5);
assert.equal(
  prose.attempts[1]!.villagers[0]!.cardSnapshot.revision,
  5,
  "A CAS retry reuses the one captured card revision.",
);
assert.equal(
  prose.attempts[0]!.villagers[0]!.cardSnapshot.capturedAt,
  prose.attempts[1]!.villagers[0]!.cardSnapshot.capturedAt,
);
assert(prose.attempts[0]!.villagers[0]!.agenda!.day.some((block) => block.venueId === firstVenue.id));
assert(prose.state.villagers[0]!.agenda!.day.some((block) => block.venueId === retryVenue.id));
assert(!prose.state.villagers[0]!.agenda!.day.some((block) => block.venueId === firstVenue.id));
assert.equal(prose.state.villagers[0]!.remap, null);
assert.equal(prose.state.villagers[0]!.remapFailure, null);
assert.equal(prose.state.villagers[0]!.agenda!.personalizationPending, true);

const removed = fixture("Removed");
removed.card.description = "New prose";
removed.retryWith((state) => {
  state.villagers = [];
});
await removed.service.applyVillagerRefresh("same");
assert.deepEqual(removed.state.villagers, [], "A removed resident is not recreated by refresh's CAS retry.");
const missing = fixture("Missing");
missing.missingSource();
const unavailable = await missing.service.previewVillagerRefresh("same");
assert.equal(unavailable.proposed, null);
assert.equal(unavailable.sourceAvailable, false);
assert.equal(unavailable.changed, false);
await assert.rejects(missing.service.applyVillagerRefresh("same"), /no longer in your library/);
assert(!missing.calls.includes("mutate"));

const one = createActivationScope(),
  two = createActivationScope();
const first = fixture("First owner"),
  second = fixture("Second owner");
const releaseFirst = one.run(() => configureResidentCards(first.service));
const releaseSecond = two.run(() => configureResidentCards(second.service));
const clearFirst = installDefaultActivation(one, () => {});
first.pause();
first.card.description = "First owner's refreshed prose";
const pending = applyVillagerRefresh("same");
await first.entered.promise;
const clearSecond = installDefaultActivation(two, () => {});
assert.equal((await previewVillagerRefresh("same")).current.name, "Second owner");
first.gate.resolve();
assert.equal((await pending).village.name, "First owner");
assert.equal(first.state.villagers[0]!.cardSnapshot.description, "First owner's refreshed prose");
assert.equal(second.state.villagers[0]!.cardSnapshot.revision, 4);
assert(first.owners.every((owner) => owner === one));
assert(second.owners.every((owner) => owner === two));
one.run(releaseFirst);
one.dispose();
clearFirst();
assert.equal(
  (await buildVillageCatalog())[0]!.name,
  "Second owner",
  "Older cleanup cannot release the newer card owner.",
);

const app = Fastify();
try {
  registerSnapshotCatalogRoutes(app);
  registerResidentRoutes(app);
  const list = await app.inject({ method: "GET", url: "/catalog" });
  assert.equal(list.statusCode, 200);
  assert.equal(list.json().characters[0].name, "Second owner");
  const view = await app.inject({ method: "GET", url: "/villagers/same/refresh" });
  assert.equal(view.statusCode, 200);
  assert.equal(view.json().characterId, "same");
  assert.equal(view.json().current.revision, 4);
  const apply = await app.inject({ method: "POST", url: "/villagers/same/refresh" });
  assert.equal(apply.statusCode, 200);
  assert.equal(apply.json().village.name, "Second owner");
  assert.equal((await app.inject({ method: "GET", url: "/villagers/absent/refresh" })).statusCode, 404);
} finally {
  await app.close();
}
const unconfigured = createActivationScope();
await assert.rejects(
  unconfigured.run(() => previewVillagerRefresh("same")),
  /not configured/,
);
two.run(releaseSecond);
two.dispose();
clearSecond();
await assert.rejects(
  two.run(() => applyVillagerRefresh("same")),
  /not configured/,
);
for (const item of [a, b, parallel, recovered, color, prose, removed, missing, first, second]) {
  assert(item.calls.every((operation) => ["state", "list", "find:same", "mutate", "snapshot"].includes(operation)));
}
console.log(
  "Resident card ownership: inert ports, narrow catalogs, independent libraries, refresh/CAS policy, delayed activation, cleanup and unchanged routes passed (mocked storage/library; no model capabilities).",
);
