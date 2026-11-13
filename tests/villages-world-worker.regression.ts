import assert from "node:assert/strict";
import { createBackgroundContext } from "../packages/villages/src/server/adapters/operations/background-context-service.js";
import { configureVillageClock } from "../packages/villages/src/server/adapters/time/clock-gate.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { ensureNarrative } from "../packages/villages/src/server/domain/rules/narrative-development.js";
import { initialOpening } from "../packages/villages/src/server/domain/rules/opening-project.js";
import { createNarrative } from "../packages/villages/src/server/features/narrative/narrative-service.js";
import { createBackgroundWork } from "../packages/villages/src/server/jobs/background-service.js";
import { venueDraftFixture as venueDraft } from "./helpers/venues.fixture.js";
import { synchronizeVenueZones } from "../packages/villages/src/server/domain/rules/venue-zones.js";
import { worldRepairRecords } from "../packages/villages/src/server/domain/rules/repair-records.js";
import { createRepairGate } from "../packages/villages/src/server/adapters/storage/repair-gate.js";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { createRepairService } from "../packages/villages/src/server/features/repair/repair-service.js";
import { currentRoomViews } from "../packages/villages/src/server/domain/rules/continuity-retrieval.js";

let now = new Date("2026-10-29T10:00:00.000Z"),
  state = defaultVillageState();
Object.assign(state, {
  seed: "world-worker",
  name: "Harbor",
  timeZone: "UTC",
  foundedAt: now.toISOString(),
  setupAt: now.toISOString(),
});
const venue = venueDraft(
  { id: "hall", name: "Hall", description: "A hall with wooden benches.", category: "public" },
  null,
);
synchronizeVenueZones(venue);
state.venues = [venue];
ensureNarrative(state, now.toISOString());
function addCircumstance(id: string) {
  state.narrative!.situations.push({
    id,
    revision: 1,
    scope: "zone",
    title: "Wet paving",
    summary: "A window has let rain onto the paving.",
    status: "active",
    targets: [{ venueId: venue.id, zoneId: "exterior" }],
    updatedAt: now.toISOString(),
  });
}
const releaseClock = configureVillageClock({
  now: () => new Date(now),
  observe: async () => ({}) as any,
  resolve: async () => ({}) as any,
});
const rows = new Map<string, any>(),
  context = createBackgroundContext();
let requests = 0,
  proposal: any,
  prompt: any,
  chosen: { venueId: string; zoneId: string },
  failApply = false;
const mutate = async (update: (world: typeof state) => void) => {
  const next = structuredClone(state);
  update(next);
  state = next;
};
const model: any = {
  connectionId: "fixture",
  model: "fixture",
  maxOutputTokens: 3000,
  fitContext: (messages: any, options: any) => ({ messages, maxTokens: options.maxTokens }),
  chatComplete: async (messages: any[]) => {
    requests++;
    prompt = JSON.parse(messages.at(-1).content);
    if (failApply) state.narrativeConsequence = "gentle";
    return { content: JSON.stringify({ quiet: false, development: proposal }), finishReason: "stop" };
  },
};
let documents: any;
const narrative = createNarrative({
  read: async () => structuredClone(state),
  mutate,
  socialSnapshot: async () => {
    throw new Error("unrelated social read failed");
  },
  resident: async () => {
    throw new Error("unrelated resident job failed");
  },
  queue: async (work) => {
    const target = (work.input as any).grant.targets[0];
    chosen = { venueId: target.venueId, zoneId: target.zoneId };
    proposal = {
      severity: failApply ? "moderate" : "gentle",
      occurrence: "Drizzle collects beneath a window.",
      situation: {
        scope: "zone",
        id: null,
        expectedRevision: 0,
        title: "Drizzle",
        summary: "Wet paving beneath a window.",
        status: "active",
      },
      room: [{ text: "Drizzle beads on the sill.", expiresInMinutes: 15 }],
      conditions: [
        {
          id: null,
          expectedRevision: 0,
          venueId: target.venueId,
          zoneId: target.zoneId,
          observation: "Rain dots the paving.",
          restriction: "none",
          remedy: "",
          endsAt: new Date(now.getTime() + 60_000).toISOString(),
          clear: false,
        },
      ],
      weather: null,
    };
    await background.queueBackgroundJob(work);
  },
  job: (...args) => background.backgroundJobSnapshot(...args),
  models: () => ({ resolveForRequest: async () => model }) as any,
  connection: async () => "fixture",
  complete: (m, messages, tokens, options) => context.backgroundCalls.getStore()!(m, messages, tokens, options),
  now: () => new Date(now),
  afterCatchup: async () => {},
});
const background = createBackgroundWork({
  withCurrentJobWrite: (work) => work(),
  villagesDocuments: () =>
    (documents ??= {
      getById: async (_pkg: string, id: string) => structuredClone(rows.get(id) ?? null),
      list: async (_pkg: string, kind: string) =>
        structuredClone([...rows.values()].filter((row) => row.kind === kind)),
      create: async (input: any) => {
        const row = { ...structuredClone(input), revision: 1 };
        rows.set(row.id, row);
        return row;
      },
      update: async (input: any) => {
        const old = rows.get(input.id);
        if (old.revision !== input.expectedRevision) return null;
        const row = { ...old, ...structuredClone(input), revision: old.revision + 1 };
        rows.set(row.id, row);
        return row;
      },
      remove: async (_pkg: string, id: string) => rows.delete(id),
    } as any),
  villagesLogger: () => ({ debug() {}, debugOverride() {}, info() {}, warn() {}, error() {} }),
  readVillageState: async () => {
    throw new Error("unrelated social outbox failure");
  },
  mutateVillageState: async () => {
    throw new Error("unrelated relationship mutation unavailable");
  },
  readVillageAuthority: async () => structuredClone(state),
  mutateVillageAuthority: mutate,
  withUsagePurpose: (_purpose, work) => work(),
  measurePipeline: (_name, _tags, work) => work(),
  runtimeDebug() {},
  backgroundCalls: context.backgroundCalls,
  handlers: [["world-development", narrative.handler]],
});
const stop = background.startBackgroundWork({ now: () => 0 });
try {
  await background.villageBackgroundPresence("world", true);
  await narrative.reconcile(now);
  assert.equal(requests, 0, "A quiet world needs no purchase");
  addCircumstance("first-circumstance");
  state.opening = initialOpening([], venue.id, "opening");
  await narrative.reconcile(now);
  assert.equal(requests, 0, "Optional world writing waits for the opening gathering to finish");
  state.opening.stage = "complete";
  await narrative.reconcile(now);
  await background.settleBackgroundWork();
  assert.equal((await background.backgroundWorkSummaries())[0]!.status, "completed");
  assert.equal(requests, 1);
  assert.equal(prompt.target.zoneId, chosen!.zoneId);
  assert.equal(
    prompt.target.roomBasis,
    undefined,
    "The provider receives the scoped Room view without its authority digest.",
  );
  assert.equal(prompt.target.controllers, undefined);
  assert.deepEqual(
    currentRoomViews(
      state.continuity,
      state.episodes,
      { kind: "room", placeId: chosen!.venueId, zoneId: chosen!.zoneId },
      now.toISOString(),
    ).map((row) => row.version.text),
    ["Drizzle beads on the sill."],
  );
  assert.equal(state.episodes.records.filter((episode) => episode.room?.zoneId === chosen!.zoneId).length, 2);
  assert.equal(state.eventAttempts!.attempts.length, 1);
  assert.equal(state.eventAttempts!.attempts[0]!.origin, "world");
  assert.equal(state.narrative!.conditions.length, 1);
  assert.equal(state.narrative!.claims!.length, 0);
  failApply = true;
  state.narrativeConsequence = "moderate";
  now = new Date(now.getTime() + 31 * 60_000);
  addCircumstance("second-circumstance");
  await narrative.reconcile(now);
  await background.settleBackgroundWork();
  const held = (await background.backgroundWorkSummaries())[0]!;
  assert.equal(held.status, "failed", held.error);
  assert.equal(
    state.narrative!.conditions.length,
    1,
    "A lowered Consequence cannot publish a stronger purchased result.",
  );
  assert.equal(state.narrative!.claims!.length, 1);
  assert.equal(state.eventAttempts!.attempts.length, 2);
  const record = worldRepairRecords(state, false).find((row) => row.id.includes("narrative-claim"))!;
  const gate = createRepairGate(documents),
    repository = createVillageRepository(() => gate.documents);
  await repository.mutateAuthority(
    (world) => {
      Object.assign(world, structuredClone(state));
    },
    { memories: true },
  );
  const repair = createRepairService({
    gate,
    repository,
    resumeProject: async () => {
      throw new Error("No projects in fixture");
    },
    cancelProject: async () => {
      throw new Error("No projects in fixture");
    },
    replaySaved: async () => {},
    continueSaved: async () => {},
  });
  const selected = await repair.inspect(record.id);
  const review = await repair.prepare({
    operationId: "reject",
    recordId: record.id,
    action: "reject",
    values: {},
    knowers: [],
    expectedRecord: selected.token,
  } as any);
  await repair.apply(review.id, review.token);
  state = await repository.readAuthority({ memories: true });
  assert.equal(state.narrative!.claims!.length, 0);
  const undo = await repair.undo("reject", "undo-reject");
  await repair.apply(undo.id, undo.token);
  state = await repository.readAuthority({ memories: true });
  assert.equal(state.narrative!.claims!.length, 1, "Undo restores the held claim with its saved job.");
  assert.equal((await background.backgroundWorkSummaries())[0]!.status, "failed");
  const again = await repair.inspect(record.id);
  const againReview = await repair.prepare({
    operationId: "reject-again",
    recordId: record.id,
    action: "reject",
    values: {},
    knowers: [],
    expectedRecord: again.token,
  } as any);
  await repair.apply(againReview.id, againReview.token);
  state = await repository.readAuthority({ memories: true });
  failApply = false;
  now = new Date(now.getTime() + 31 * 60_000);
  addCircumstance("third-circumstance");
  await narrative.reconcile(now);
  await background.settleBackgroundWork();
  assert.equal((await background.backgroundWorkSummaries())[0]!.status, "completed");
  assert.equal(
    state.eventAttempts!.attempts.length,
    3,
    "Replacement after explicit rejection reserves a new normal opportunity.",
  );
  assert.equal(requests, 3);
  assert.ok(
    [...rows.values()].some((row) => row.kind === "background-history" && row.data.hasResult),
    "The rejected paid result and source survive in existing background history.",
  );
  assert.equal(state.narrative!.conditions.length, 2);
} finally {
  stop();
  releaseClock();
}
