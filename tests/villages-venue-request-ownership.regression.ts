import assert from "node:assert/strict";
import {
  createActivationScope,
  installDefaultActivation,
  scopedActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type { VillageSnapshot, VillageState } from "../packages/villages/src/server/domain/models/world.js";
import { venueDraft } from "../packages/villages/src/server/domain/rules/venue-authoring.js";
import { draftNewVenueProject } from "../packages/villages/src/server/features/projects/project-lifecycle.js";
import { createVenueRequests } from "../packages/villages/src/server/features/venues/venue-request-service.js";
import {
  configureVenueRequests,
  decideVillageVenueRequest,
  queueVillageVenueRequest,
} from "../packages/villages/src/server/features/venues/venue-requests.js";

const stamp = "2026-10-06T12:00:00.000Z";
const core = { name: "Glasshouse", classes: ["community"] as ["community"] };
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
function fixture(name: string) {
  const state = coerceVillageState({
    ...defaultVillageState(),

    name,
    setupAt: stamp,
    foundedAt: stamp,
    villagers: [
      {
        characterId: "same",
        addedAt: stamp,
        cardSnapshot: { id: "same", name, revision: 1, sourceStatus: "available", capturedAt: stamp },
      },
    ],
  });
  const home = venueDraft(
    {
      id: "home",
      name: `${name}'s home`,
      form: "Cabin",
      description: "A small cabin",
      classes: ["residence"],
    },
    null,
  );
  home.occupancy = { playerHome: false, residentCharacterId: "same", homeKind: "small-home" };
  home.residentIds = ["same"];
  state.venues = [home];
  const calls: string[] = [],
    owners: unknown[] = [],
    attempts: VillageState[] = [];
  const entered = deferred(),
    gate = deferred();
  let pause = false,
    retry: ((state: VillageState) => void) | undefined,
    failure: Error | undefined;
  const note = (call: string) => {
    calls.push(call);
    owners.push(scopedActivation());
  };
  const service = createVenueRequests({
    async mutateVillageState(update) {
      note("mutate");
      if (pause) {
        pause = false;
        entered.resolve();
        await gate.promise;
        owners.push(scopedActivation());
      }
      if (failure) throw failure;
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
      return { village: { name } } as VillageSnapshot;
    },
    draftNewVenueProject(...args) {
      note("new-project");
      return draftNewVenueProject(...args);
    },
  });
  assert.deepEqual(calls, [], "Constructing request review does not admit storage, Projects or models.");
  return {
    state,
    home,
    service,
    calls,
    owners,
    attempts,
    entered,
    gate,
    pause() {
      pause = true;
    },
    retryWith(change: (state: VillageState) => void) {
      retry = change;
    },
    failWith(error: Error) {
      failure = error;
    },
  };
}
function request(item: ReturnType<typeof fixture>, id = "same-request") {
  queueVillageVenueRequest(item.state, core, "same", "chat", id, stamp, "Could we grow herbs?");
  const decision = item.state.pendingDecisions.at(-1)!;
  decision.id = id;
  return decision;
}

const recorded = fixture("Recorded");
await recorded.service.recordVillageVenueRequest(core, "same", "line-1");
await recorded.service.recordVillageVenueRequest(core, "same", "line-1");
assert.equal(recorded.state.pendingDecisions.length, 1);
assert(recorded.calls.every((call) => call === "mutate"));
assert.equal(recorded.state.projects.length, 0);
await assert.rejects(
  recorded.service.decideVillageVenueRequest("missing", true, { ...core, description: "" }),
  /Approve a description/,
);
assert.equal(recorded.calls.length, 2, "Invalid approval is rejected before persistence.");
const decision = recorded.state.pendingDecisions[0]!;
const accepted = await recorded.service.decideVillageVenueRequest(decision.id, true, {
  ...core,
  description: "Grow herbs here.",
});
assert.equal(accepted.village.name, "Recorded");
assert.equal(recorded.state.projects[0]!.kind, "new-venue");
assert.equal(recorded.state.projects[0]!.lifecycle!.phase, "planning");
assert.equal(recorded.state.pendingDecisions[0]!.status, "approved");
assert.equal(recorded.state.venues.length, 1, "Planning does not create a constructed Venue.");
assert.deepEqual(recorded.calls.slice(-3), ["mutate", "new-project", "snapshot"]);
await assert.rejects(
  recorded.service.decideVillageVenueRequest(decision.id, true, { ...core, description: "Grow herbs here." }),
  /no longer pending/,
);
assert.equal(recorded.state.projects.length, 1);

const countered = fixture("Countered");
const counter = request(countered);
await assert.rejects(
  countered.service.decideVillageVenueRequest(counter.id, true, {
    ...core,
    name: "Greenhouse",
    description: "A different plan.",
  }),
  /not available yet/,
);
assert.equal(countered.state.pendingDecisions[0]!.status, "pending");
assert.equal(countered.state.projects.length, 0);
const denied = fixture("Denied");
const deniedRequest = request(denied);
await denied.service.decideVillageVenueRequest(deniedRequest.id, false, null);
assert.equal(denied.state.pendingDecisions[0]!.status, "denied");
assert.deepEqual(denied.calls, ["mutate", "snapshot"]);

const a = createActivationScope(),
  b = createActivationScope();
const original = fixture("Original"),
  replacement = fixture("Replacement");
request(original);
request(replacement);
const releaseA = a.run(() => configureVenueRequests(original.service)),
  releaseB = b.run(() => configureVenueRequests(replacement.service));
const clearA = installDefaultActivation(a, () => {});
original.pause();
const pending = decideVillageVenueRequest("same-request", true, { ...core, description: "Original decision." });
await original.entered.promise;
const clearB = installDefaultActivation(b, () => {});
await decideVillageVenueRequest("same-request", false, null);
original.gate.resolve();
assert.equal((await pending).village.name, "Original");
assert.equal(original.state.pendingDecisions[0]!.status, "approved");
assert.equal(replacement.state.pendingDecisions[0]!.status, "denied");
assert(original.owners.every((owner) => owner === a));
assert(replacement.owners.every((owner) => owner === b));
a.run(releaseA);
a.dispose();
clearA();
const missing = createActivationScope();
await assert.rejects(
  missing.run(() => decideVillageVenueRequest("missing", false, null)),
  /not configured/,
);
b.run(releaseB);
b.dispose();
clearB();
await assert.rejects(
  b.run(() => decideVillageVenueRequest("same-request", false, null)),
  /not configured/,
);
console.log(
  "Venue request ownership: inert ports, grounded deduplication, decision/counteroffer and Project planning, originating activation and cleanup passed (mocked storage/projection; no model connections).",
);
