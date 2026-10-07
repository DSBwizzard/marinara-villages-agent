import assert from "node:assert/strict";
import { readVillagerCard } from "../packages/villages/src/server/adapters/engine/catalog.js";
import {
  createActivationScope,
  installDefaultActivation,
  scopedActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import {
  defaultVillageState,
  coerceVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type { VillageState } from "../packages/villages/src/server/domain/models/world.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { MAX_VILLAGERS } from "../packages/villages/src/server/domain/rules/village-limits.js";
import { parsePlace } from "../packages/villages/src/server/domain/rules/founding-record.js";
import { backgroundRevision, retireBackgroundResident } from "../packages/villages/src/server/jobs/background-work.js";
import { createResidentRoster } from "../packages/villages/src/server/features/residents/resident-roster-service.js";
import {
  addVillager,
  removeVillager,
  configureResidentRoster,
} from "../packages/villages/src/server/features/residents/resident-roster.js";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
function fixture(name: string) {
  const state = defaultVillageState();
  const card = readVillagerCard({
    id: "same",
    comment: "",
    data: { name, description: `private ${name}`, tags: [name] },
  });
  const calls: string[] = [],
    owners: unknown[] = [],
    attempts: VillageState[] = [];
  const entered = deferred(),
    gate = deferred();
  let missing = false,
    pause = false,
    libraryError: Error | undefined,
    queueError: Error | undefined;
  let retry: ((state: VillageState) => void) | undefined;
  const note = (call: string) => {
    calls.push(call);
    owners.push(scopedActivation());
  };
  const service = createResidentRoster({
    async findVillagerCard(id) {
      note(`find:${id}`);
      if (pause) {
        pause = false;
        entered.resolve();
        await gate.promise;
        owners.push(scopedActivation());
      }
      if (libraryError) throw libraryError;
      return !missing && id === card.id ? card : null;
    },
    async readVillageState() {
      note("read");
      return structuredClone(state);
    },
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
    async queueVillagerAgenda(id) {
      note(`agenda:${id}`);
      assert(
        state.villagers.some((resident) => resident.characterId === id),
        "Agenda admission follows the saved roster.",
      );
      if (queueError) throw queueError;
    },
    retireBackgroundResident(candidate, id) {
      note(`retire:${id}`);
      retireBackgroundResident(candidate, id);
    },
  });
  assert.deepEqual(calls, [], "Roster construction performs no work.");
  return {
    state,
    card,
    service,
    calls,
    owners,
    attempts,
    entered,
    gate,
    missing() {
      missing = true;
    },
    pause() {
      pause = true;
    },
    failLibrary(error: Error) {
      libraryError = error;
    },
    failQueue(error: Error) {
      queueError = error;
    },
    retryWith(change: (state: VillageState) => void) {
      retry = change;
    },
  };
}
function fill(state: VillageState, source: VillageState["villagers"][number]) {
  state.villagers = Array.from({ length: MAX_VILLAGERS }, (_, index) => ({
    ...structuredClone(source),
    characterId: `full-${index}`,
  }));
}

const first = fixture("First");
await first.service.addVillager("same");
const resident = first.state.villagers[0]!;
assert.equal(resident.cardSnapshot.name, "First");
assert.equal(resident.cardSnapshot.description, "private First");
assert.equal(resident.cardSnapshot.sourceStatus, "available");
assert.equal(resident.cardSnapshot.capturedAt, resident.addedAt);
assert.equal(resident.agendaGeneration, "arrival-" + resident.addedAt);
assert(resident.agenda!.activeDay!.blocks.length > 0);
assert.equal(resident.agenda!.personalizationPending, true);
assert.equal(resident.ingestSchedule, false);
assert.equal(resident.scheduleInfluence!.enabled, false);
first.card.tags.push("Later library edit");
assert.deepEqual(resident.cardSnapshot.tags, ["First"], "Arrival owns its captured tags.");
const captured = structuredClone(first.state);
await first.service.addVillager("same");
assert.deepEqual(first.state, captured);
assert.equal(first.calls.filter((call) => call === "mutate").length, 1);
assert.equal(first.calls.filter((call) => call === "agenda:same").length, 1);

const missing = fixture("Missing");
missing.missing();
await assert.rejects(missing.service.addVillager("same"), /not in your library/);
assert.deepEqual(missing.calls, ["find:same"]);
const unreadable = fixture("Unreadable"),
  failure = Error("Library unavailable");
unreadable.failLibrary(failure);
await assert.rejects(unreadable.service.addVillager("same"), (error) => error === failure);
assert.deepEqual(unreadable.calls, ["find:same"]);
const full = fixture("Full");
fill(full.state, resident);
await assert.rejects(full.service.addVillager("same"), /at most/);
assert.deepEqual(full.calls, ["find:same", "read"]);
const retryFull = fixture("Retry full");
retryFull.retryWith((state) => {
  fill(state, resident);
  state.name = "Concurrent world metadata";
});
await assert.rejects(retryFull.service.addVillager("same"), /at most/);
assert.equal(retryFull.attempts[0]!.villagers[0]!.characterId, "same");
assert.equal(retryFull.state.villagers.length, MAX_VILLAGERS);
assert.equal(retryFull.state.name, "Concurrent world metadata");
assert(!retryFull.calls.includes("agenda:same"));
const queueFailure = fixture("Queue failure");
queueFailure.failQueue(failure);
await assert.rejects(queueFailure.service.addVillager("same"), (error) => error === failure);
assert.equal(
  queueFailure.state.villagers.length,
  1,
  "Existing queue failure behavior preserves the local resident/day.",
);
assert(queueFailure.state.villagers[0]!.agenda!.activeDay!.blocks.length > 0);

const departed = fixture("Departed");
await departed.service.addVillager("same");
const home = coerceVillageState({
  venues: [
    parsePlace(
      {
        id: "home",
        layoutVersion: 1,
        layout: "private",
        name: "Home",
        form: "Cabin",
        classes: ["residence"],
        description: "A cabin",
        occupancy: { playerHome: false, residentCharacterId: "same", homeKind: null },
        residentIds: ["same"],
        workerIds: ["same", "other"],
        spaces: [],
        privateSpaces: [{ ...defaultVenueSpace("residence", "Secret writing"), id: "personal", ownerId: "same" }],
      },
      true,
    ),
  ],
}).venues[0]!;
home.workerIds = ["same", "other"];
const zone = home.zones!.find((entry) => entry.ownerId === "same")!;
zone.purpose = "Sleeping chamber";
zone.seen = true;
zone.preparation = { status: "ready" };
zone.adaptationPending = true;
zone.adaptationSourceArchiveAt = "previous";
zone.controllerIds = ["same", "other"];
zone.state.publicFacts = ["Private fact"];
zone.state.traces = [];
zone.access = {
  mode: "permission-required",
  managerIds: ["same"],
  memberIds: ["guest"],
  memberRoles: [],
  inviterIds: ["same"],
  regularVisitors: [],
  visitorHours: "always",
  accompanied: false,
};
home.playerInvitations = [
  { residentId: "same", recordedAt: "earlier", ownerId: "same" },
  { residentId: "other", recordedAt: "earlier" },
];
departed.state.venues = [home];
departed.state.wishRefillIntents.same = { id: "refill", settled: "" };
const receiptId = "villages-background-" + backgroundRevision(["agenda", "same"]);
departed.state.backgroundReceipts[receiptId] = "receipt";
await departed.service.removeVillager("same");
const emptied = departed.state.venues[0]!,
  vacant = emptied.zones!.find((entry) => entry.id === zone.id)!;
assert.equal(departed.state.villagers.length, 0);
assert.deepEqual(emptied.residentIds, []);
assert.equal(emptied.occupancy.residentCharacterId, null);
assert.equal(vacant.ownerId, undefined);
assert.equal(vacant.preparation, undefined);
assert.equal(vacant.adaptationPending, false);
assert.equal(vacant.adaptationSourceArchiveAt, "");
assert.equal(vacant.seen, false);
assert.equal(vacant.description, "Sleeping chamber");
assert.equal(vacant.image, null);
assert.deepEqual(vacant.state.publicFacts, []);
assert.deepEqual(vacant.access!.managerIds, null);
assert.deepEqual(vacant.access!.inviterIds, []);
assert.deepEqual(vacant.access!.memberIds, []);
assert.deepEqual(vacant.controllerIds, ["other"]);
assert.deepEqual(emptied.workerIds, ["other"]);
assert.equal(emptied.playerInvitations!.length, 1);
assert(
  emptied.archivedPrivateSpaces!.some(
    (archive) => archive.ownerId === "same" && archive.space.description === "Secret writing",
  ),
);
assert.equal(departed.state.wishRefillIntents.same, undefined);
assert.equal(departed.state.backgroundReceipts[receiptId], undefined);
await assert.rejects(departed.service.removeVillager("same"), /does not live here/);
const retryRemoval = fixture("Retry removal");
await retryRemoval.service.addVillager("same");
retryRemoval.retryWith((state) => {
  state.villagers = [];
  state.name = "Already departed concurrently";
});
await assert.rejects(retryRemoval.service.removeVillager("same"), /does not live here/);
assert.equal(retryRemoval.state.name, "Already departed concurrently");

const a = createActivationScope(),
  b = createActivationScope();
const original = fixture("Original owner"),
  replacement = fixture("Replacement owner");
const releaseA = a.run(() => configureResidentRoster(original.service)),
  releaseB = b.run(() => configureResidentRoster(replacement.service));
const clearA = installDefaultActivation(a, () => {});
original.pause();
const pending = addVillager("same");
await original.entered.promise;
const clearB = installDefaultActivation(b, () => {});
await addVillager("same");
original.gate.resolve();
await pending;
assert.equal(original.state.villagers[0]!.cardSnapshot.name, "Original owner");
assert.equal(replacement.state.villagers[0]!.cardSnapshot.name, "Replacement owner");
assert(original.owners.every((owner) => owner === a));
assert(replacement.owners.every((owner) => owner === b));
a.run(releaseA);
a.dispose();
clearA();
await removeVillager("same");
assert.equal(replacement.state.villagers.length, 0);
assert.equal(original.state.villagers.length, 1);
const absent = createActivationScope();
await assert.rejects(
  absent.run(() => addVillager("same")),
  /not configured/,
);
b.run(releaseB);
b.dispose();
clearB();
await assert.rejects(
  b.run(() => removeVillager("same")),
  /not configured/,
);
console.log(
  "Resident roster ownership: inert connections, local arrival/capacity retry, departure privacy, existing failure ordering, originating activation and cleanup passed (mocked storage/library/Agenda admission).",
);
