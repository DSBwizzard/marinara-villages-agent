import { venueFixture } from "./helpers/venues.fixture.js";
import assert from "node:assert/strict";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { backgroundRevision } from "../packages/villages/src/server/domain/rules/background-revision.js";
import { continuityWishes } from "../packages/villages/src/server/domain/rules/continuity-library.js";
import { parseCompactFoundingCompletion } from "../packages/villages/src/server/domain/rules/compact-founding-rules.js";
import {
  foundingReadyForPlay,
  foundingSlot,
  foundingTaskRevision,
} from "../packages/villages/src/server/domain/rules/founding-tasks.js";
import { villageFixtureDocuments } from "./helpers/village-storage.fixture.js";
import { validateBackgroundResponse } from "../packages/villages/src/server/adapters/storage/background-responses.js";

import { coerceVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { unwrittenVillageAgenda } from "../packages/villages/src/server/domain/rules/agenda-plan.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { observableRoomDescription } from "../packages/villages/src/server/domain/rules/zone-picture.js";
import { capturePrivateInterior } from "../packages/villages/src/server/domain/rules/private-interior.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import {
  assertFoundedVillageReady,
  foundingPreparationSnapshot,
  prepareFoundedVillage,
  retryFoundedVillagePreparation,
} from "../packages/villages/src/server/features/founding/preparation.js";
import { previewVillageBurst } from "../packages/villages/src/server/features/settings/usage-preview.js";
import { clearVillagerAgenda } from "../packages/villages/src/server/features/residents/resident-agendas.js";
import { mutateVillageState, readVillageState } from "../packages/villages/src/server/features/world/village-store.js";
import {
  recoverBackgroundWork,
  retryBackgroundJob,
  settleBackgroundWork,
  startBackgroundWork,
} from "../packages/villages/src/server/jobs/background-work.js";
import {
  preparePrivateSpaces,
  privatePreparationRooms,
  retryPrivateSpaces,
  startPrivateSpacePreparation,
} from "../packages/villages/src/server/jobs/private-space-preparation.js";

const rows = new Map<string, any>();
const calls: string[] = [];
const stages: string[] = [];
const stamp = new Date().toISOString();
let mode = "valid";
let failVenue = "aqua";
let limit = 4096;
let hold: (() => void) | undefined;
let started: (() => void) | undefined;
let wishStarted: (() => void) | undefined;
let releaseWish: (() => void) | undefined;
let feddyWishCalls = 0;
let conflicts = 0;
let writes = 0;
let holdRoutinePublication = false;
let retainedWishProof: { revision: string; input: string; fingerprints: string[] } | undefined;
const wishText = "Aqua wants to keep the station's old lantern lit for returning travelers.";

function fixture(seeded = true) {
  const names = ["Aqua", "Feddy Fastbayer", "Sneak McKnickit"];
  const state = coerceVillageState({
    ...defaultVillageState(),

    seed: "station-fields",
    name: "Station Fields",
    setting: "A disused station",
    setupAt: stamp,
    foundedAt: stamp,
    backgroundPace: "off",
    townMapImage: "data:image/png;base64,preserved-map",
    townMapImageSetAt: stamp,
    foundingPreparation: { status: "pending", completedIds: [], currentId: "", error: "", venueDetailsSeeded: seeded },
    villagers: names.map((name, index) => ({
      letterFontId: "caveat",
      characterId: ["aqua", "feddy", "sneak"][index],
      incarnation: ["aqua", "feddy", "sneak"][index] + "-one",
      admission: {
        homeworld: "Othiras",
        startingSituation: "STARTING-CONTEXT-" + name + ": former home is elsewhere; current work undecided.",
      },
      cardSnapshot: {
        id: ["aqua", "feddy", "sneak"][index],
        name,
        revision: 1,
        sourceStatus: "available",
        capturedAt: stamp,
        personality: "Observant",
        summary: "A traveler",
      },
      addedAt: stamp,
    })),
    venues: ["aqua", "feddy", "sneak", "hall"].map((id, index) =>
      venueFixture({
        id,
        name: id === "hall" ? "Community Place" : `${names[index]}'s living space`,
        form: "Converted station space",
        description: "An old station door",
        layoutVersion: 1,
        classes: id === "hall" ? ["community"] : ["residence"],
        occupancy: { playerHome: false, residentCharacterId: id === "hall" ? null : id, homeKind: null },
        residentIds: id === "hall" ? [] : [id],
        presentation: { image: null, x: (index + 1) / 5, y: 0.5 },
        zones: [
          { ...defaultVenueSpace("other", "An old station door"), id: "exterior", name: "Exterior", kind: "exterior" },
          {
            ...defaultVenueSpace(id === "hall" ? "community" : "residence"),
            id: "private:base",
            name: ["Signal Loft", "Storage Bay", "Underplatform Den", "Ticket Office"][index],
            kind: id === "hall" ? "restricted" : "private-residence",
            ownerId: id === "hall" ? undefined : id,
            controllerIds: id === "hall" ? ["player"] : [],
            preparation: { status: "pending" },
          },
        ],
      }),
    ),
  });
  state.venues[0].description = "UNSCOPED-OLD-ROOM-PROSE";
  for (const resident of state.villagers) resident.agenda = unwrittenVillageAgenda();
  state.startingHistory.reviewed = Object.fromEntries(state.villagers.map((row) => [row.characterId, row.incarnation]));
  return state;
}
function install(seeded = true) {
  rows.clear();
  calls.length = 0;
  stages.length = 0;
  writes = 0;
  holdRoutinePublication = false;
  feddyWishCalls = 0;
  wishStarted = undefined;
  releaseWish = undefined;
  const state = fixture(seeded);
  rows.set("villages-village", {
    id: "villages-village",
    packageId: "villages",
    kind: "village",
    data: state,
    revision: 1,
  });
}
const originalFetch = globalThis.fetch;
globalThis.fetch = async () => new Response("[]", { headers: { "content-type": "application/json" } });
const release = configureVillagesRuntime({
  projectId: "founding-preparation-fixture",
  isDebugAgentsEnabled: () => false,
  logger: { debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} },
  getAgentConfig: async () => ({ connectionId: "fixture" }),
  resources: {
    listCharacters: async (ids?: string[]) =>
      (rows.get("villages-village")?.data.villagers ?? [])
        .filter((resident: any) => !ids || ids.includes(resident.characterId))
        .map((resident: any) => ({ id: resident.characterId, data: resident.cardSnapshot })),
    listLorebooks: async () => [],
  },
  persistence: {
    documents: villageFixtureDocuments({
      getById: async (_p: string, id: string) => structuredClone(rows.get(id) ?? null),
      list: async (_p: string, kind: string) => structuredClone([...rows.values()].filter((row) => row.kind === kind)),
      create: async (input: any) => {
        const row = { ...structuredClone(input), revision: 1 };
        if (
          mode === "wish-invalid-clock" &&
          input.kind === "background-work" &&
          row.data.kind === "wish" &&
          row.data.subjectId === "feddy"
        )
          row.data.input.now = "";
        rows.set(row.id, row);
        return row;
      },
      update: async (input: any) => {
        const previous = rows.get(input.id);
        if (!previous || previous.revision !== input.expectedRevision) return null;
        if (input.id === "villages-village" && conflicts-- > 0) return null;
        const row = { ...previous, ...structuredClone(input), revision: previous.revision + 1 };
        if (
          holdRoutinePublication &&
          input.id === "villages-village" &&
          row.data.foundingPreparation?.tasks?.aqua?.routine?.status === "completed"
        ) {
          holdRoutinePublication = false;
          throw new Error("Synthetic failure after retaining the paid routine result");
        }
        if (
          retainedWishProof &&
          row.kind === "background-work" &&
          row.data.kind === "wish" &&
          row.data.revision === retainedWishProof.revision &&
          row.data.status !== "completed"
        ) {
          assert.equal(
            JSON.stringify(row.data.input),
            retainedWishProof.input,
            "Recovery keeps exact admitted input until application",
          );
          assert.deepEqual(
            row.data.steps.map((step: any) => step.fingerprint),
            retainedWishProof.fingerprints,
          );
        }
        if (
          mode === "wish-paid-ack" &&
          input.id === "villages-village" &&
          row.data.foundingPreparation?.tasks?.aqua?.wish?.status === "completed"
        ) {
          mode = "valid";
          throw new Error("Synthetic failure after retaining the paid Wish result");
        }
        rows.set(row.id, row);
        writes++;
        const p = row.data?.foundingPreparation;
        if (p?.stage) stages.push(`${p.phase}:${p.stage}:${p.currentId || p.currentVenueId || ""}`);
        return row;
      },
      remove: async (_p: string, id: string) => rows.delete(id),
    }),
  },
  languageModels: {
    resolveForRequest: async () => ({
      name: "Fixture System",
      model: "fixture",
      connectionId: "fixture",
      maxContext: 32000,
      maxOutputTokens: limit,
      fitContext: (messages: any[], options: any) => ({
        messages: mode === "context-loss" ? [] : messages,
        maxTokens: options.maxTokens,
      }),
      chatComplete: async (messages: any[], options: any) => {
        if (messages[0].content.includes("Define exactly the one saved private space")) {
          const { rooms } = JSON.parse(messages[1].content);
          assert.equal(rooms.length, 1);
          const room = rooms[0];
          for (const person of room.characters) assert.match(person.admissionContext, /STARTING-CONTEXT-/);
          calls.push(room.venueId);
          assert.equal(options.maxTokens, Math.min(limit, 3000));
          assert.equal(options.reasoningEffort, "none");
          const claim = rows
            .get("villages-village")
            .data.venues.find((venue: any) => venue.id === room.venueId)
            .zones.find((zone: any) => zone.id === room.id).preparation;
          assert.ok(claim.claimId && claim.startedAt, "claim is persisted before dispatch");
          if (room.venueId === failVenue && mode === "held") {
            started?.();
            await new Promise<void>((resolve) => {
              hold = resolve;
            });
          }
          if (room.venueId === failVenue && mode === "provider") throw new Error("Offline api_key=private-secret");
          if (room.venueId === failVenue && mode === "empty") return { content: "", finishReason: "stop" };
          if (room.venueId === failVenue && mode === "malformed")
            return { content: '{"rooms":[', finishReason: "stop" };
          const output = {
            venueId: room.venueId,
            id: room.id,
            description: "PRIVATE CONTENT MUST STAY HIDDEN",
            condition: "Dry",
            items: Array(6).fill("Ordinary stool"),
            facts: Array(6).fill("Canvas wall"),
          };
          if (room.venueId === failVenue && mode === "wrong-id") output.id = "wrong";
          if (room.venueId === failVenue && mode === "wrong-venue") output.venueId = "wrong";
          if (room.venueId === failVenue && mode === "no-description") output.description = "";
          return {
            content: JSON.stringify({ rooms: [output] }),
            finishReason: room.venueId === failVenue && mode === "truncated" ? "length" : "stop",
          };
        }
        if (messages[0].content.includes("Seed a few observable")) {
          calls.push("venues");
          const input = JSON.parse(messages[1].content);
          for (const venue of input.venues)
            if (venue.resident) assert.match(venue.resident.admissionContext, /STARTING-CONTEXT-/);
          return {
            content: JSON.stringify({
              venues: input.venues.map((venue: any) => ({
                id: venue.id,
                condition: "Dry",
                items: [],
                publicFacts: [],
                features: [],
              })),
            }),
            finishReason: "stop",
          };
        }
        assert.match(messages[1].content, /STARTING-CONTEXT-/);
        assert.doesNotMatch(messages[1].content, /UNSCOPED-OLD-ROOM-PROSE/);
        assert.equal(options.reasoningEffort, "none");
        assert.equal(options.responseFormat.type, "json_object");
        if (messages[0].content.includes("{wish:null}")) {
          calls.push("wish");
          if (mode === "wish-invalid-clock" && JSON.parse(messages[1].content).identity.id === "feddy")
            return {
              content: JSON.stringify({ wish: "Talk with a neighbor to get acquainted." }),
              finishReason: "stop",
            };
          if (mode === "wish-auto-held" && JSON.parse(messages[1].content).identity.id === "feddy") {
            if (feddyWishCalls++ === 0)
              return { content: JSON.stringify({ wish: { wish: "Incomplete desire" } }), finishReason: "stop" };
            wishStarted?.();
            await new Promise<void>((resolve) => {
              releaseWish = resolve;
            });
          }
          if (mode === "wish-one-fail" && JSON.parse(messages[1].content).identity.id === "feddy")
            return { content: "{}", finishReason: "stop" };
          assert.equal(options.maxTokens, Math.min(limit, 1536));
          const wish =
            mode === "wish-paid-ack" && JSON.parse(messages[1].content).identity.id === "aqua" ? wishText : null;
          return { content: JSON.stringify({ wish }), finishReason: "stop" };
        }
        calls.push("routine");
        const actorId = JSON.parse(messages[1].content).identity.id;
        if (
          ["routine-timeout", "inherited-pause"].includes(mode) &&
          JSON.parse(messages[1].content).identity.id === "aqua"
        )
          throw new Error("Provider request exceeded 30 seconds.");
        if (mode === "json-unsupported") throw new Error("response_format json_object is not supported");
        assert.equal(options.maxTokens, Math.min(limit, 2048));
        if (mode === "routine-recovery-malformed" && actorId === "aqua") return { content: "{}", finishReason: "stop" };
        const invalid =
          mode === "routine-invalid" ||
          (mode === "routine-one-fail" && actorId === "aqua") ||
          (mode.startsWith("routine-recovery-") && actorId !== "aqua");
        return {
          content: JSON.stringify({
            routine: "Quiet days at the station",
            palette: ["resting", "reading", "walking", "writing", "thinking", "tidying"].map((activity) => ({
              activity,
              venue: invalid ? "0" : 0,
              status: "idle",
              flexible: true,
              essential: false,
              duration: 90,
              parts: [0, 1, 2, 3],
            })),
            days: Array.from({ length: 7 }, () => [0, 1, 2, 3, 4, 5, 0, 1]),
            rhythm: [],
          }),
          finishReason: mode === "routine-recovery-truncated" && actorId === "aqua" ? "length" : "stop",
        };
      },
    }),
  },
} as any);

async function main() {
  const stop = startBackgroundWork();
  try {
    install();
    const local = fixture();
    assert.equal(foundingReadyForPlay(local), true, "Local routines and usable places allow play during optional work");
    const incomplete = structuredClone(local);
    incomplete.villagers[0]!.agenda = null;
    assert.equal(foundingReadyForPlay(incomplete), false, "A resident still needs a usable local routine");
    incomplete.villagers = [];
    incomplete.venues = [];
    assert.equal(foundingReadyForPlay(incomplete), false, "An unfinished Village needs usable places");
    await assertFoundedVillageReady();
    assert.equal(calls.length, 0, "Entering does not authorize extra generation");
    mode = "context-loss";
    await prepareFoundedVillage();
    assert.equal(calls.length, 0, "required resident context cannot be trimmed before dispatch");
    assert.equal((await readVillageState({ memories: true })).foundingPreparation?.status, "failed");
    await assertFoundedVillageReady();
    assert.equal((await foundingPreparationSnapshot()).foundingPreparation?.canPlay, true);
    install();
    mode = "held";
    failVenue = "aqua";
    const admitted = new Promise<void>((resolve) => {
      started = resolve;
    });
    const preparing = prepareFoundedVillage();
    await admitted;
    const forecast = await previewVillageBurst({ action: "founding" });
    await mutateVillageState((current) => {
      const newcomer = structuredClone(current.villagers[0]!);
      newcomer.characterId = newcomer.cardSnapshot.id = "newcomer";
      newcomer.incarnation = "newcomer-one";
      newcomer.cardSnapshot.name = "Newcomer";
      newcomer.agenda = unwrittenVillageAgenda();
      current.villagers.push(newcomer);
    });
    assert.equal(
      (await previewVillageBurst({ action: "founding" })).requests,
      forecast.requests,
      "The founding estimate excludes residents admitted during play",
    );
    hold!();
    await preparing;
    const withNewcomer = await readVillageState({ memories: true });
    assert.equal(withNewcomer.foundingPreparation?.status, "ready");
    assert.equal(
      withNewcomer.foundingPreparation?.tasks?.newcomer,
      undefined,
      "New arrivals never acquire implicit founding generation tasks",
    );
    mode = "valid";
    install(false);
    await Promise.all([prepareFoundedVillage(), prepareFoundedVillage()]);
    assert.deepEqual(calls, [
      "aqua",
      "feddy",
      "sneak",
      "hall",
      "routine",
      "routine",
      "routine",
      "wish",
      "wish",
      "wish",
    ]);
    let state = await readVillageState({ memories: true });
    assert.equal(state.foundingPreparation?.status, "ready");
    assert.equal(state.foundingPreparation?.completedIds.length, 3);
    assert.ok(stages.includes("private-spaces:model:aqua"));
    assert.ok(stages.includes("residents:model:aqua"));
    assert.ok(stages.includes("residents:saving:aqua"));
    assert.equal(state.townMapImage, fixture().townMapImage);
    for (const { venue, zone } of privatePreparationRooms(state)) {
      const description = observableRoomDescription(state, venue.id, zone.id, new Date().toISOString());
      assert(description.includes("PRIVATE CONTENT MUST STAY HIDDEN") && description.length <= 4000);
      assert.equal(zone.description, "");
      assert.equal(zone.state.recent, null);
    }

    install();
    mode = "wish-auto-held";
    const beganWishRetry = new Promise<void>((resolve) => {
      wishStarted = resolve;
    });
    const preparingWithRetry = prepareFoundedVillage();
    await beganWishRetry;
    assert.equal(
      (await readVillageState()).foundingPreparation?.status,
      "pending",
      "Founding waits for the automatic Wish attempt.",
    );
    releaseWish!();
    await preparingWithRetry;
    state = await readVillageState({ memories: true });
    assert.equal(state.foundingPreparation?.status, "ready");
    assert.equal(state.foundingPreparation?.tasks?.feddy.wish?.attempt, 2);
    assert.equal(calls.filter((call) => call === "wish").length, 4);
    assert.ok(
      state.villagers.every((resident) => continuityWishes(state, resident.characterId, true, stamp).length === 0),
      "A valid quiet result is final.",
    );

    install();
    mode = "wish-invalid-clock";
    await prepareFoundedVillage();
    state = await readVillageState();
    assert.equal(state.foundingPreparation?.status, "failed");
    assert.equal(calls.filter((call) => call === "wish").length, 2, "Damaged saved input cannot purchase a response.");
    const damagedWish = [...rows.values()].find(
      (row) => row.kind === "background-work" && row.data.kind === "wish" && row.data.subjectId === "feddy",
    )!;
    assert.equal(damagedWish.data.automaticRetryUsed, undefined);
    assert.equal(damagedWish.data.requests, 0);

    // Independent tasks survive each other's failure; retries never repeat successes.
    for (const failure of ["routine-one-fail", "wish-one-fail", "routine-timeout", "inherited-pause"]) {
      install();
      mode = failure;
      if (failure === "inherited-pause") {
        const pauseId = "villages-background-connection-" + backgroundRevision("fixture");
        rows.set(pauseId, {
          id: pauseId,
          packageId: "villages",
          kind: "background-connection",
          data: { connectionId: "fixture" },
          revision: 1,
        });
        await recoverBackgroundWork();
        await mutateVillageState((state) => {
          state.foundingPreparation!.tasksVersion = 1;
          state.foundingPreparation!.tasks = Object.fromEntries(
            state.villagers.map((resident) => [
              resident.characterId,
              Object.fromEntries(
                (["routine", "wish"] as const).map((kind) => [
                  kind,
                  {
                    contract: 1,
                    revision: foundingTaskRevision(state, resident.characterId, kind),
                    jobId: foundingSlot(kind, resident.characterId),
                    status: "pending",
                    attempt: 0,
                    error: "",
                  },
                ]),
              ),
            ]),
          );
          state.foundingPreparation!.retryActions = ["admitted-retry"];
        });
      }
      await prepareFoundedVillage();
      state = await readVillageState({ memories: true });
      assert.equal(state.foundingPreparation?.status, "failed");
      await assertFoundedVillageReady();
      assert.equal(
        state.foundingPreparation?.completedIds.length,
        2,
        failure +
          JSON.stringify({
            calls,
            marker: state.foundingPreparation,
            jobs: [...rows.values()]
              .filter((r) => r.kind === "background-work")
              .map((r) => ({ status: r.data.status, error: r.data.error, retrying: r.data.retrying })),
          }),
      );
      assert.equal(
        calls.filter((call) => call === "routine").length,
        failure === "routine-one-fail" ? 4 : 3,
        "a transient failure does not block other residents",
      );
      assert.equal(
        calls.filter((call) => call === "wish").length,
        failure === "wish-one-fail" ? 4 : 3,
        "Wish generation does not require a successful Routine",
      );
      const failedId = failure === "wish-one-fail" ? "feddy" : "aqua",
        kind = failure === "wish-one-fail" ? "wish" : "routine";
      const task = state.foundingPreparation!.tasks![failedId]![kind]!;
      const other = JSON.stringify(state.foundingPreparation!.tasks![failedId]![kind === "wish" ? "routine" : "wish"]);
      const before = calls.length;
      await foundingPreparationSnapshot();
      await recoverBackgroundWork();
      await settleBackgroundWork();
      assert.equal(calls.length, before, "reads and recovery never retry failed tasks");
      mode = "valid";
      const action = {
        characterId: failedId,
        task: kind,
        expectedAttempt: task.attempt,
        actionId: "target-" + failure,
      } as const;
      await assert.rejects(retryFoundedVillagePreparation({ ...action, expectedAttempt: 999 }), /changed/);
      await Promise.all([retryFoundedVillagePreparation(action), retryFoundedVillagePreparation(action)]);
      await prepareFoundedVillage();
      state = await readVillageState({ memories: true });
      assert.equal(state.foundingPreparation?.status, "ready");
      assert.equal(calls.length, before + 1, "targeted retry uses exactly one replacement request");
      assert.equal(
        JSON.stringify(state.foundingPreparation!.tasks![failedId]![kind === "wish" ? "routine" : "wish"]),
        other,
        "the other task receipt survives",
      );
      await retryFoundedVillagePreparation(action);
      assert.equal(calls.length, before + 1, "duplicate action remains idempotent after completion");
    }
    install();
    mode = "json-unsupported";
    await prepareFoundedVillage();
    assert.equal(
      calls.filter((call) => call === "routine").length,
      1,
      "unsupported JSON configuration stops further requests",
    );
    assert.equal(calls.filter((call) => call === "wish").length, 0);
    // An explicit successful retry is required to clear the connection pause.
    mode = "valid";
    await retryFoundedVillagePreparation();
    await prepareFoundedVillage();
    assert.equal(
      (await readVillageState({ memories: true })).foundingPreparation?.status,
      "ready",
      JSON.stringify((await readVillageState({ memories: true })).foundingPreparation),
    );

    // Recover current purchased replies locally before discarding a failed checkpoint.
    for (const recovery of ["current", "malformed", "truncated", "stale"]) {
      install();
      const valid = recovery === "current" || recovery === "stale";
      mode = "routine-recovery-" + recovery;
      holdRoutinePublication = valid;
      await prepareFoundedVillage();
      assert.equal((await readVillageState({ memories: true })).foundingPreparation?.status, "failed");
      const checkpoint = [...rows.values()].find(
        (row) => row.kind === "background-work" && row.data.kind === "agenda" && row.data.subjectId === "aqua",
      )!;
      const current = await readVillageState({ memories: true });
      assert.equal(checkpoint.data.revision, foundingTaskRevision(current, "aqua", "routine"));
      const saved = validateBackgroundResponse(rows.get(checkpoint.data.steps[0].responseRef.id)).response;
      if (valid) {
        assert.equal(holdRoutinePublication, false);
        assert.equal(checkpoint.data.hasResult, true);
        assert.ok(parseCompactFoundingCompletion(saved, checkpoint.data.input.context).agenda);
      } else assert.throws(() => parseCompactFoundingCompletion(saved, checkpoint.data.input.context));
      mode = "valid";
      calls.length = 0;
      if (recovery === "stale") {
        await mutateVillageState((current) => {
          current.villagers[0].incarnation = "replacement-aqua";
        });
        await retryBackgroundJob(
          checkpoint.id,
          checkpoint.data.attempt,
          "stale-routine-retry",
          checkpoint.data.instanceId,
        );
        await settleBackgroundWork();
        assert.equal(rows.get(checkpoint.id).data.status, "obsolete");
        assert.equal(calls.length, 0);
        assert.equal((await readVillageState({ memories: true })).villagers[0].agenda?.generatedAt, "");
        continue;
      }
      const previewWrites = writes;
      assert.equal((await previewVillageBurst({ action: "founding" })).requests, valid ? 2 : 3);
      assert.equal(writes, previewWrites, "recovery forecasts do not write");
      assert.equal(calls.length, 0, "recovery forecasts do not dispatch");
      conflicts = 2;
      await Promise.all([retryFoundedVillagePreparation(), retryFoundedVillagePreparation()]);
      await prepareFoundedVillage();
      state = await readVillageState({ memories: true });
      assert.equal(state.foundingPreparation?.status, "ready");
      assert.equal(state.foundingPreparation?.completedIds.length, 3);
      assert.equal(
        calls.length,
        valid ? 2 : 3,
        "only invalid saved replies need replacement requests: " + recovery + JSON.stringify(calls),
      );
      assert.ok(
        calls.every((call) => call === "routine"),
        "completed private spaces are preserved",
      );
      assert.equal(state.townMapImage, fixture().townMapImage);
      const before = calls.length;
      await retryFoundedVillagePreparation();
      await prepareFoundedVillage();
      assert.equal(calls.length, before, "repeated actions after recovery generate nothing");
    }

    install();
    mode = "wish-paid-ack";
    await prepareFoundedVillage();
    const retainedWish = [...rows.values()].find(
      (row) => row.kind === "background-work" && row.data.kind === "wish" && row.data.subjectId === "aqua",
    )!;
    assert.equal(retainedWish.data.status, "failed");
    assert.equal(retainedWish.data.hasResult, true);
    const actorId = retainedWish.data.subjectId;
    const wishRevision = retainedWish.data.revision;
    const savedWish = validateBackgroundResponse(rows.get(retainedWish.data.steps[0].responseRef.id)).response;
    assert.deepEqual(JSON.parse(savedWish.content!), { wish: wishText });
    retainedWishProof = {
      revision: wishRevision,
      input: JSON.stringify(retainedWish.data.input),
      fingerprints: retainedWish.data.steps.map((step: any) => step.fingerprint),
    };
    assert.equal((await readVillageState({ memories: true })).foundingPreparation?.status, "failed");
    calls.length = 0;
    await retryFoundedVillagePreparation();
    await prepareFoundedVillage();
    assert.equal(calls.length, 0, "A saved current Wish response recovers without another request");
    const recovered = await readVillageState({ memories: true });
    assert.equal(recovered.foundingPreparation!.tasks![actorId].wish!.revision, wishRevision);
    const replayAt = new Date().toISOString();
    assert.equal(continuityWishes(recovered, actorId, true, replayAt)[0]?.text, wishText);
    assert.deepEqual(continuityWishes(recovered, actorId, false, replayAt), []);
    assert.equal(rows.get(retainedWish.id).data.status, "completed");
    retainedWishProof = undefined;

    for (const kind of ["agenda", "wish"])
      for (const interruptedStatus of ["queued", "paused"]) {
        install();
        mode = kind === "agenda" ? "routine-invalid" : "wish-one-fail";
        await prepareFoundedVillage();
        const row = [...rows.values()].find(
          (record) =>
            record.kind === "background-work" &&
            record.data.kind === kind &&
            record.data.subjectId === (kind === "agenda" ? "aqua" : "feddy"),
        )!;
        assert.equal(row.data.status, "failed");
        Object.assign(row.data, {
          owner: "previous-process",
          status: interruptedStatus,
          steps: [],
          hasResult: false,
          requests: 0,
        });
        calls.length = 0;
        await recoverBackgroundWork();
        await settleBackgroundWork();
        assert.equal(calls.length, 0, `Prior ${interruptedStatus} ${kind} cannot dispatch at startup`);
        assert.equal(rows.get(row.id).data.status, "interrupted");
        assert.equal(rows.get(row.id).data.requests, 0);
      }

    for (const failure of [
      "truncated",
      "empty",
      "malformed",
      "wrong-id",
      "wrong-venue",
      "no-description",
      "provider",
    ]) {
      install();
      mode = failure;
      failVenue = "feddy";
      await prepareFoundedVillage();
      state = await readVillageState({ memories: true });
      assert.equal(state.foundingPreparation?.status, "failed", failure);
      assert.deepEqual(
        calls,
        ["aqua", "feddy", "routine", "routine", "routine", "wish", "wish", "wish"],
        "interior failure preserves independent resident preparation",
      );
      assert.equal(state.venues[0].zones![1].preparation?.status, "ready");
      assert.equal(state.venues[2].zones![1].preparation?.status, "pending");
      assert.match(
        state.foundingPreparation!.error,
        failure === "provider" ? /Private room: Offline/ : /Private room: Space response/,
      );
      assert.doesNotMatch(state.foundingPreparation!.error, /Storage Bay|PRIVATE CONTENT|private-secret/);
      await foundingPreparationSnapshot();
      await preparePrivateSpaces();
      assert.deepEqual(
        calls,
        ["aqua", "feddy", "routine", "routine", "routine", "wish", "wish", "wish"],
        "reads and direct discovery never resume a failed sequence",
      );
      mode = "valid";
      await Promise.all([retryFoundedVillagePreparation(), retryFoundedVillagePreparation()]);
      await prepareFoundedVillage();
      state = await readVillageState({ memories: true });
      assert.equal(state.foundingPreparation?.status, "ready");
      assert.deepEqual(calls, [
        "aqua",
        "feddy",
        "routine",
        "routine",
        "routine",
        "wish",
        "wish",
        "wish",
        "feddy",
        "sneak",
        "hall",
      ]);
      assert.equal(state.venues[1].zones![1].preparation?.attempt, 2);
      assert.equal(state.townMapImage, fixture().townMapImage);
    }

    install();
    mode = "valid";
    limit = 700;
    await preparePrivateSpaces();
    assert.equal(calls.length, 4, "a lower configured output allowance is respected");
    limit = 4096;

    install();
    await mutateVillageState(
      (current) => {
        const venue = current.venues[0],
          zone = venue.zones![1];
        zone.preparation = {
          status: "pending",
          claimId: "previous-process",
          startedAt: stamp,
          basis: capturePrivateInterior(current, venue, zone, stamp).basis,
          attempt: 4,
        };
      },
      { memories: true },
    );
    await assert.rejects(preparePrivateSpaces(), /interrupted/);
    assert.equal(calls.length, 0, "orphaned claims cannot dispatch automatically");
    await retryPrivateSpaces();
    assert.equal(calls.length, 4);
    assert.equal((await readVillageState({ memories: true })).venues[0].zones![1].preparation?.attempt, 5);

    for (const change of ["seed", "room", "abort"]) {
      install();
      mode = "held";
      failVenue = "aqua";
      const controller = new AbortController();
      const admitted = new Promise<void>((resolve) => {
        started = resolve;
      });
      const work = preparePrivateSpaces(controller.signal);
      await admitted;
      if (change === "abort") controller.abort();
      else
        await mutateVillageState(
          (current) => {
            if (change === "seed") {
              current.seed = "new-village";
              current.name = "New Village";
            } else current.venues[0].zones![1].name = "Author changed the room";
          },
          { memories: true },
        );
      hold!();
      if (change === "seed") await work;
      else await assert.rejects(work, change === "abort" ? /interrupted/ : /changed/);
      state = await readVillageState({ memories: true });
      assert.equal(observableRoomDescription(state, "aqua", "private:base", new Date().toISOString()), "");
      assert.equal(calls.length, 1, "stale/aborted work does not continue to later spaces");
    }

    install();
    mode = "valid";
    await mutateVillageState((current) => {
      current.venues[0].zones![1].ownerId = undefined;
      current.venues[1].constructionStatus = "worksite";
    });
    await prepareFoundedVillage();
    assert.equal(
      (await readVillageState({ memories: true })).foundingPreparation?.status,
      "ready",
      "vacant rooms are prepared and worksites stay deferred",
    );
    assert.deepEqual(calls.slice(0, 3), ["aqua", "sneak", "hall"]);

    install();
    conflicts = 2;
    await Promise.all([preparePrivateSpaces(), preparePrivateSpaces()]);
    assert.equal(calls.length, 4, "CAS conflicts and concurrent calls reuse one request per space");

    install();
    const beforeWrites = writes;
    const preview = await previewVillageBurst({ action: "founding" });
    assert.equal(preview.requests, 10, "four spaces plus three routines and three initial Wishes");
    assert.equal(writes, beforeWrites);
    assert.equal(calls.length, 0);
    await mutateVillageState((current) => {
      current.venues[0].zones![1].preparation = { status: "ready" };
    });
    assert.equal((await previewVillageBurst({ action: "founding" })).requests, 9);
    const cleanup = startPrivateSpacePreparation();
    await new Promise((resolve) => setTimeout(resolve, 10));
    cleanup();
    assert.equal(calls.length, 0, "activation leaves founding preparation to its owning flow");
    install();
    mode = "routine-timeout";
    await prepareFoundedVillage();
    const targeted = (await readVillageState({ memories: true })).foundingPreparation!.tasks!.aqua.routine!;
    calls.length = 0;
    mode = "valid";
    await clearVillagerAgenda("aqua", "play-regenerate");
    await settleBackgroundWork();
    assert.deepEqual(calls, ["routine"], "A deliberate normal regeneration works while extras remain failed");
    assert.equal((await readVillageState()).foundingPreparation!.tasks!.aqua.routine!.status, "failed");
    calls.length = 0;
    await retryFoundedVillagePreparation({
      characterId: "aqua",
      task: "routine",
      expectedAttempt: targeted.attempt,
      actionId: "targeted-spending-scope",
    });
    await prepareFoundedVillage();
    assert.deepEqual(calls, ["routine"], "Targeted Routine retry cannot spend on unrelated Venue/interior work");
    assert.equal(
      (await readVillageState()).foundingPreparation!.tasks!.aqua.routine!.status,
      "completed",
      "Explicit founding retry retains task ownership after ordinary regeneration",
    );
    console.log(
      "Founding preparation: Station Fields, single-space checkpoints, failures, retries, claims, fencing, progress and forecasts passed.",
    );
  } finally {
    stop();
    release();
    globalThis.fetch = originalFetch;
  }
}
await main();
