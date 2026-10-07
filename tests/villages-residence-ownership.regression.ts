import assert from "node:assert/strict";
import {
  bindActivationService,
  createActivationScope,
  installDefaultActivation,
  scopedActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type { VillageState, VillageSnapshot } from "../packages/villages/src/server/domain/models/world.js";
import { MAX_VENUE_DESCRIPTION_LENGTH } from "../packages/villages/src/server/domain/rules/prompt-preset.js";
import { venueDraft } from "../packages/villages/src/server/domain/rules/venue-authoring.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import {
  createResidences,
  type ResidencePorts,
} from "../packages/villages/src/server/features/venues/residence-service.js";
import {
  configureResidences,
  proposeVillageResidence,
} from "../packages/villages/src/server/features/venues/residences.js";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
function fixture(name: string) {
  const state = defaultVillageState();
  state.name = name;
  state.seed = `seed-${name}`;
  state.villagers = [
    {
      characterId: "same",
      cardSnapshot: { id: "same", name, capturedAt: "captured" },
      addedAt: "added",
      agenda: null,
      remap: null,
      remapFailure: null,
      completedWishes: [],
    } as any,
  ];
  const destination = venueDraft(
    { id: "destination", name: `${name} home`, description: "A small home", classes: ["residence"] },
    null,
  );
  state.venues = [destination];
  const calls: string[] = [],
    owners: unknown[] = [],
    jobs: any[] = [],
    options: any[] = [];
  const gate = deferred(),
    entered = deferred();
  let pauseWrite = false,
    pauseCompletion = false,
    retry: ((state: VillageState) => void) | undefined,
    preparations = 0;
  const note = (operation: string) => {
    calls.push(operation);
    owners.push(scopedActivation());
  };
  const ports: ResidencePorts = {
    async readVillageState() {
      note("read");
      return structuredClone(state);
    },
    async mutateVillageState(update) {
      note("mutate");
      if (pauseWrite) {
        pauseWrite = false;
        entered.resolve();
        await gate.promise;
        owners.push(scopedActivation());
      }
      const first = structuredClone(state);
      update(first);
      if (retry) {
        retry(state);
        retry = undefined;
        const second = structuredClone(state);
        update(second);
        Object.assign(state, second);
      } else Object.assign(state, first);
      return structuredClone(state);
    },
    async buildVillageSnapshot(now) {
      note("snapshot");
      options.push(now);
      return { village: { name } } as VillageSnapshot;
    },
    queueSharedMoveConsent() {
      note("consent");
    },
    outsideVenueOperation(work) {
      note("outside");
      return work();
    },
    async preparePrivateSpaces() {
      note("prepare");
      preparations++;
    },
    async readVillageLore() {
      note("lore");
      return [`Lore ${name}`];
    },
    async queueBackgroundJob(work) {
      note("queue");
      jobs.push(structuredClone(work));
    },
    villagesLanguageModels() {
      note("models");
      return {
        async resolveForRequest(request: any) {
          note("resolve");
          options.push(request);
          return {
            maxOutputTokens: 6000,
            fitContext(messages: any, settings: any) {
              note("fit");
              options.push(settings);
              return { messages, ...settings };
            },
          };
        },
      } as any;
    },
    async villagesConnectionIdFor(role) {
      note(`connection:${role}`);
      return `system-${name}`;
    },
    async completeWithRoom(_model, _messages, maxTokens, settings) {
      note("complete");
      options.push({ maxTokens, settings });
      if (pauseCompletion) {
        pauseCompletion = false;
        entered.resolve();
        await gate.promise;
        owners.push(scopedActivation());
      }
      return {
        content: JSON.stringify({
          description: "x".repeat(MAX_VENUE_DESCRIPTION_LENGTH + 20),
          items: ["Scarf", "Invented piano"],
          featureIds: ["portable", "invented"],
        }),
      } as any;
    },
  };
  const service = createResidences(ports);
  assert.deepEqual(calls, [], "Construction starts no storage, preparation or model work.");
  return {
    state,
    destination,
    service,
    calls,
    owners,
    jobs,
    options,
    gate,
    entered,
    pauseWrite() {
      pauseWrite = true;
    },
    pauseCompletion() {
      pauseCompletion = true;
    },
    retryWith(work: (state: VillageState) => void) {
      retry = work;
    },
    get preparations() {
      return preparations;
    },
  };
}
const a = fixture("A"),
  b = fixture("B");
await a.service.proposeVillageResidence("same", "destination");
await b.service.proposeVillageResidence("same", "destination");
assert.equal(a.state.residences[0]!.status, "pending");
assert.equal(b.state.residences[0]!.status, "pending");
await assert.rejects(a.service.decideVillageResidence("same", true, "player"), /requester cannot approve/);
await a.service.decideVillageResidence("same", true, "villager");
assert.equal(a.state.residences[0]!.status, "moving");
assert.equal(b.state.residences[0]!.status, "pending");
const completion = Date.parse(a.state.residences[0]!.completesAt!);
const before = new Date(completion - 1),
  after = new Date(completion + 1);
await a.service.completeVillageResidence("same", false, before, false);
assert.equal(a.state.residences[0]!.status, "moving");
await a.service.completeVillageResidence("same", false, after, false);
assert.equal(a.state.residences[0]!.status, "current");
assert.deepEqual(a.state.venues[0]!.residentIds, ["same"]);
assert.equal(a.options.at(-1), after, "The final snapshot retains the caller's clock.");
assert.equal(a.jobs.length, 0);
assert.equal(a.preparations, 0);
assert(!a.calls.includes("complete"));

const changed = fixture("CAS");
changed.retryWith((state) => {
  state.venues[0]!.residentIds = ["other"];
  state.venues[0]!.occupancy.residentCharacterId = "other";
});
await assert.rejects(changed.service.proposeVillageResidence("same", "destination"), /available bed/);
assert.equal(
  changed.state.residences.length,
  0,
  "A destination occupied during retry cannot commit an earlier proposal.",
);
assert(!changed.calls.includes("snapshot"));
const invalid = fixture("Invalid");
await assert.rejects(invalid.service.proposeVillageResidence("absent", "destination"), /not in this village/);
assert(!invalid.calls.includes("models"));
await invalid.service.retryResidencePrivateSpaceAdaptation("same");
assert.deepEqual(
  invalid.calls,
  ["mutate", "read", "snapshot"],
  "An unneeded adaptation creates no job or model request.",
);

function adaptationFixture(name: string) {
  const item = fixture(name);
  const room = {
    ...defaultVenueSpace("residence", "Current room"),
    id: "private",
    kind: "private-residence",
    name: "Room",
    ownerId: "same",
    adaptationPending: true,
    adaptationSourceArchiveAt: "archived",
  };
  item.destination.layoutVersion = 1;
  item.destination.zones = [room] as any;
  item.destination.privateSpaces = [room];
  item.destination.residentIds = ["same"];
  item.destination.occupancy.residentCharacterId = "same";
  const archive = {
    ownerId: "same",
    archivedAt: "archived",
    space: { ...defaultVenueSpace("residence", "Old room"), id: "old-private", ownerId: "same" },
  };
  archive.space.state.items = ["Scarf", "Book"];
  archive.space.state.features = [{ id: "portable", text: "Personal shelf" } as any];
  item.destination.archivedPrivateSpaces = [archive];
  return { ...item, room, archive };
}
const adapted = adaptationFixture("Adapted");
await adapted.service.retryResidencePrivateSpaceAdaptation("same");
assert.equal(adapted.jobs.length, 1);
const job = adapted.jobs[0],
  handler = adapted.service.adaptationBackgroundHandler;
assert.equal(job.kind, "adaptation");
assert.equal(job.finite, true);
assert.equal(job.input.capturedAt, "captured");
assert(handler.valid(adapted.state, job.input));
const stale = structuredClone(adapted.state);
stale.villagers[0]!.cardSnapshot.capturedAt = "new card";
assert(!handler.valid(stale, job.input));
const generated = (await handler.generate(job.input)) as any;
assert.equal(generated.description.length, MAX_VENUE_DESCRIPTION_LENGTH);
assert.deepEqual(generated.items, ["Scarf"]);
assert.deepEqual(
  generated.features.map((feature: any) => feature.id),
  ["portable"],
);
assert(adapted.calls.includes("connection:system"));
assert.deepEqual(
  adapted.options.find((option) => option?.connectionId),
  { connectionId: "system-Adapted" },
);
assert.deepEqual(
  adapted.options.find((option) => option?.settings),
  { maxTokens: 1000, settings: { temperature: 0.4, debugMode: false } },
);
// Today's furniture remains while deliberately selected portable details are merged into its canonical Zone.
adapted.room.state.items = ["Current lamp"];
handler.apply(adapted.state, job.input, generated, { retrying: false });
assert.deepEqual(adapted.room.state.items, ["Current lamp", "Scarf"]);
assert.equal(adapted.room.adaptationPending, false);
const savedRoom = structuredClone(adapted.room);
handler.apply(
  adapted.state,
  job.input,
  { description: "Late overwrite", items: [], features: [] },
  { retrying: false },
);
assert.deepEqual(adapted.room, savedRoom);

const one = createActivationScope(),
  two = createActivationScope();
const first = fixture("First"),
  second = fixture("Second");
const releaseFirst = one.run(() => configureResidences(first.service));
const releaseSecond = two.run(() => configureResidences(second.service));
const clearFirst = installDefaultActivation(one, () => {});
first.pauseWrite();
const pending = proposeVillageResidence("same", "destination");
await first.entered.promise;
const clearSecond = installDefaultActivation(two, () => {});
assert.equal((await proposeVillageResidence("same", "destination")).village.name, "Second");
first.gate.resolve();
assert.equal((await pending).village.name, "First");
assert(first.owners.every((owner) => owner === one));
assert(second.owners.every((owner) => owner === two));
one.run(releaseFirst);
one.dispose();
clearFirst();
const missing = createActivationScope();
await assert.rejects(
  missing.run(() => proposeVillageResidence("same", "destination")),
  /not configured/,
);
two.run(releaseSecond);
two.dispose();
clearSecond();
missing.dispose();
await assert.rejects(
  two.run(() => proposeVillageResidence("same", "destination")),
  /not configured/,
);

const callbackOwner = createActivationScope(),
  replacement = createActivationScope();
const callbackFixture = adaptationFixture("Callback");
const captured = callbackOwner.run(() => bindActivationService(callbackFixture.service.adaptationBackgroundHandler));
callbackFixture.pauseCompletion();
const response = captured.generate({
  characterId: "same",
  destination: callbackFixture.destination,
  archive: callbackFixture.archive,
  card: callbackFixture.state.villagers[0]!.cardSnapshot,
  lore: [],
});
await callbackFixture.entered.promise;
const clearReplacement = installDefaultActivation(replacement, () => {});
callbackFixture.gate.resolve();
await response;
assert(callbackFixture.owners.every((owner) => owner === callbackOwner));
assert.equal(callbackFixture.calls.filter((operation) => operation === "complete").length, 1);
clearReplacement();
callbackOwner.dispose();
replacement.dispose();
console.log(
  "Residence ownership: independent transitions, approval/capacity/CAS checks, caller clock, finite private adaptation, portable-result filtering, scoped completion and cleanup passed (mocked storage/models).",
);
