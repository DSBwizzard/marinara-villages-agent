import { addRepairMemory } from "../packages/villages/src/server/domain/rules/repair-memory.js";
import { readPlayerIdentity } from "../packages/villages/src/server/domain/rules/player-identity.js";
import {
  captureSceneContinuity,
  sceneContinuityView,
} from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import { selectActorContinuity } from "../packages/villages/src/server/domain/rules/continuity-retrieval.js";
import {
  draftNewVenueProject,
  draftRenovationProject,
} from "../packages/villages/src/server/features/projects/project-drafts.js";
import { WORLD_WEATHER } from "../packages/villages/src/server/domain/rules/village-clock.js";
import { agendaBlocksFor } from "../packages/villages/src/server/domain/rules/agenda-week.js";
import { planRoutineDays } from "../packages/villages/src/server/domain/rules/resident-agenda.js";
import { routineRevision, routineRevisionMatches } from "../packages/villages/src/server/domain/rules/wish-policy.js";
import { continuityRelationships } from "../packages/villages/src/server/domain/rules/continuity-library.js";
import { sharedVenuesFixture } from "./helpers/venues.fixture.js";
// Test cases: native-repair/persona-capture, native-repair/private-facets, native-repair/project-controls, native-repair/visitor-controls, native-repair/metadata-identity, native-repair/weekly-correction, native-repair/physical-environment, native-repair/expanded-editors, native-repair/scores, repair-familiar/work-booking, repair-familiar/place-ownership, native-repair/common-books, native-repair/undo, native-repair/repeated-undo, native-repair/offer-undo, native-repair/room, native-repair/circumstance, native-repair/founding-circumstance, native-repair/protected-circumstance, native-repair/stale, native-repair/checkpoint, native-repair/missing-page, native-repair/pending-target, native-repair/unread-targets, native-repair/recovery, native-repair/plan-allowance, repair-familiar/memory-accounts, repair-familiar/targets
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { createRepairGate } from "../packages/villages/src/server/adapters/storage/repair-gate.js";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { createRepairService } from "../packages/villages/src/server/features/repair/repair-service.js";
import { collectRetainedStorage } from "../packages/villages/src/server/features/repair/retained-storage-cleanup.js";
import {
  repairId,
  retainAdministrativeCircumstance,
} from "../packages/villages/src/server/domain/rules/repair-records.js";
import { establishPlace } from "./helpers/places.fixture.js";
import { findLocation } from "../packages/villages/src/server/domain/rules/places.js";
import { applyAccessCommand } from "../packages/villages/src/server/domain/rules/venue-access.js";
import { retainNativeFact } from "../packages/villages/src/server/domain/rules/native-continuity.js";
import { ensureNarrative } from "../packages/villages/src/server/domain/rules/narrative-development.js";
import {
  readFoundingCircumstances,
  seedFoundingCircumstances,
} from "../packages/villages/src/server/domain/rules/founding-circumstances.js";
import { narrationContinuityContext } from "../packages/villages/src/server/domain/rules/narration-context.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import {
  continuityHolderKey,
  continuityViews,
  continuityProtectionUnits,
} from "../packages/villages/src/server/domain/rules/continuity.js";
import { episodeSourceGraph } from "../packages/villages/src/server/domain/decoding/episode-codec.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import {
  continuityMemoryLibrary,
  continuityWishes,
} from "../packages/villages/src/server/domain/rules/continuity-library.js";
import { captureContinuityContext } from "../packages/villages/src/server/domain/rules/continuity-context.js";
import {
  acceptResidentLetter,
  acceptMailExchange,
  readDeliveredLetter,
} from "../packages/villages/src/server/domain/rules/mail-delivery.js";
import { queueMailboxLetter } from "../packages/villages/src/server/domain/rules/social-mail.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import type { RepairRequest } from "../packages/villages/src/shared/contracts/repair.js";
import type { VillageState } from "../packages/villages/src/server/domain/models/world.js";
import { venueFixture } from "./helpers/venues.fixture.js";
import { agendaFixture } from "./helpers/agenda.fixture.js";
import { socialPlanCandidates, acceptSocialPlan } from "../packages/villages/src/server/domain/rules/social-rules.js";

const at = "2026-11-09T12:00:00.000Z",
  later = "2026-11-09T13:00:00.000Z";
function authorLetter(state: VillageState, id: string, meaningful = true) {
  const from = continuityActor(state, "mara")!,
    to = continuityActor(state, "player")!;
  const writtenAt = id === "original" ? at : later;
  acceptResidentLetter(
    state,
    captureContinuityContext(state, ["player", "mara"], "fair", writtenAt),
    { id, at: writtenAt, from, to },
    "I want to visit the fair, only if Delia comes. I trust you to keep that condition.",
    id,
    {
      keep: meaningful
        ? [
            {
              id: "wish",
              for: ["mara", "player"],
              owner: "mara",
              about: ["mara"],
              class: "desire",
              text: "Visit the fair, only if Delia comes.",
              source: ["letter"],
            },
          ]
        : [],
      requires: meaningful ? ["wish"] : [],
    },
    memoryHash(id),
    writtenAt,
  );
}
async function fixture() {
  const rows = new Map<string, any>();
  let hook: ((event: string, id: string) => void) | undefined;
  const store: any = {
    async getById(_p: string, id: string) {
      return structuredClone(rows.get(id) ?? null);
    },
    async list(_p: string, kind: string) {
      return [...rows.values()].filter((row) => row.kind === kind).map((row) => structuredClone(row));
    },
    async create(input: any) {
      hook?.("before-create", input.id);
      assert(!rows.has(input.id));
      const row = { ...structuredClone(input), revision: 1 };
      rows.set(row.id, row);
      hook?.("after-create", row.id);
      return structuredClone(row);
    },
    async update(input: any) {
      hook?.("before-update", input.id);
      const before = rows.get(input.id);
      if (!before || before.revision !== input.expectedRevision) return null;
      const row = { ...before, ...structuredClone(input), revision: before.revision + 1 };
      rows.set(row.id, row);
      hook?.("after-update", row.id);
      return structuredClone(row);
    },
    async remove(_p: string, id: string, revision: number) {
      return rows.get(id)?.revision === revision && rows.delete(id);
    },
  };
  let gate = createRepairGate(store),
    repository = createVillageRepository(() => gate.documents);
  const service = () =>
    createRepairService({
      gate,
      repository,
      replaySaved: async () => {
        throw Error("no Scene work");
      },
    });
  let api = service();
  await repository.mutateAuthority(
    (state) => {
      state.venues = sharedVenuesFixture();
      Object.assign(state, { seed: "repair", setupAt: at, foundedAt: at, name: "Willowmere" });
      state.villagers = ["mara", "leo"].map((id) => ({
        characterId: id,
        incarnation: "one",
        addedAt: at,
        letterFontId: "caveat",
        admission: { homeworld: "", startingSituation: "" },
        cardSnapshot: {
          id,
          name: id === "mara" ? "Mara" : "Leo",
          sourceStatus: "available",
          tags: [],
          capturedAt: at,
          revision: 1,
        },
      })) as VillageState["villagers"];
      authorLetter(state, "original");
      readDeliveredLetter(state, "original", later);
    },
    { memories: true },
  );
  const read = () => repository.readAuthority({ memories: true });
  const prepare = async (
    recordId: string,
    operationId: string,
    text?: string,
    knowers = ["mara"],
    action = "correct",
  ) =>
    api.prepare({
      recordId,
      operationId,
      values: text === undefined ? {} : { text },
      knowers,
      action,
      expectedRecord: (await api.inspect(recordId)).token!,
    } as RepairRequest);
  return {
    rows,
    read,
    prepare,
    get api() {
      return api;
    },
    get repository() {
      return repository;
    },
    get gate() {
      return gate;
    },
    hook(value: typeof hook) {
      hook = value;
    },
    reopen() {
      gate.dispose();
      gate = createRepairGate(store);
      repository = createVillageRepository(() => gate.documents);
      api = service();
    },
  };
}
async function wishRecord(f: Awaited<ReturnType<typeof fixture>>) {
  return (await f.api.list("memories")).records.find((row) => row.summary.startsWith("desire"))!;
}
const remembered = (state: VillageState, id: string) =>
  continuityMemoryLibrary(state, { inspection: true, characterId: id }, later).entries[0];

await runCase("native-repair/common-books", async () => {
  const f = await fixture(),
    record = await wishRecord(f),
    before = await f.read(),
    originalEpisodes = structuredClone(before.episodes);
  assert(record.target);
  assert.equal(record.people?.length, 2);
  assert.equal((await f.api.list("memories")).creation, undefined);
  const review = await f.prepare(record.id, "correct-wish", "Visit on Saturday, only if Delia and Leo both come.");
  assert.deepEqual(await f.read(), before, "preview cannot change authoritative knowledge");
  await f.api.apply(review.id, review.token);
  let state = await f.read();
  assert.equal(remembered(state, "mara").text, "Visit on Saturday, only if Delia and Leo both come.");
  assert.equal(
    continuityWishes(state, "mara", true, later)[0].text,
    remembered(state, "mara").text,
    "Wish book and Memory Inspect share one corrected meaning",
  );
  assert.equal(remembered(state, "player").text, "Visit the fair, only if Delia comes.");
  assert.deepEqual(state.episodes, originalEpisodes, "administrative correction never rewrites actual written words");
  const forget = await f.prepare(record.id, "forget-player", undefined, ["player"], "forget");
  await f.api.apply(forget.id, forget.token);
  state = await f.read();
  assert(remembered(state, "player").forgotten);
  assert(!remembered(state, "mara").forgotten);
  const applied = structuredClone(state);
  await f.api.apply(forget.id, forget.token);
  assert.deepEqual(await f.read(), applied);
});

await runCase("native-repair/undo", async () => {
  const f = await fixture(),
    record = await wishRecord(f),
    original = await f.read();
  const review = await f.prepare(record.id, "forget-mara", undefined, ["mara"], "forget");
  await f.api.apply(review.id, review.token);
  const forgotten = await f.read(),
    undo = await f.api.undo(review.id, "undo-forget");
  assert(remembered(await f.read(), "mara").forgotten);
  await f.api.apply(undo.id, undo.token);
  const restored = await f.read();
  assert(!remembered(restored, "mara").forgotten);
  assert.equal(remembered(restored, "mara").text, remembered(original, "mara").text);
  assert.deepEqual(
    remembered(restored, "mara").subjects,
    remembered(original, "mara").subjects,
    "Undo restores original subject bindings",
  );
  assert(restored.continuity.records[0].revision > forgotten.continuity.records[0].revision);
  assert(restored.continuity.receipts["forget-mara"], "undo keeps exact operation replay protection");
  assert.deepEqual(restored.mailbox, original.mailbox);
  assert.deepEqual(restored.episodes, original.episodes);
  const title = await f.api.inspect(repairId("world")),
    rename = await f.api.prepare({
      operationId: "rename",
      recordId: title.id,
      action: "correct",
      values: { name: "New name" },
      knowers: [],
      expectedRecord: title.token!,
    });
  await f.api.apply(rename.id, rename.token);
  const unrename = await f.api.undo(rename.id, "undo-name");
  await f.api.apply(unrename.id, unrename.token);
  assert.equal((await f.read()).name, "Willowmere");
  assert.deepEqual((await f.read()).mailbox, original.mailbox, "world undo preserves canonical mail with its Episodes");
});

await runCase("native-repair/repeated-undo", async () => {
  const f = await fixture(),
    record = await wishRecord(f);
  const first = await f.prepare(record.id, "first-correction", "Visit only in spring.");
  await f.api.apply(first.id, first.token);
  const second = await f.prepare(record.id, "second-correction", "Visit only in winter.");
  await f.api.apply(second.id, second.token);
  await f.repository.mutateAuthority(
    (state) => {
      const from = continuityActor(state, "mara")!,
        to = continuityActor(state, "player")!;
      acceptResidentLetter(
        state,
        captureContinuityContext(state, ["player", "mara"], "winter", later),
        { id: "winter-letter", at: later, from, to },
        "I now want to visit only in winter.",
        "winter-letter",
        { keep: [], requires: [] },
        memoryHash("winter-letter"),
        later,
      );
    },
    { memories: true },
  );
  const undo = await f.api.undo(second.id, "undo-second");
  await f.api.apply(undo.id, undo.token);
  f.reopen();
  let state = await f.read();
  assert.equal(remembered(state, "mara").text, "Visit only in spring.");
  const recall = captureContinuityContext(state, ["player", "mara"], "winter", later);
  assert(
    !Object.values(recall.historical).some((source) => source.excerpt.includes("only in winter")),
    "Undo blocks sources derived from the superseded correction",
  );
  const forget = await f.prepare(record.id, "forget-corrected", undefined, ["mara"], "forget");
  await f.api.apply(forget.id, forget.token);
  const unforget = await f.api.undo(forget.id, "undo-corrected-forget");
  await f.api.apply(unforget.id, unforget.token);
  f.reopen();
  state = await f.read();
  assert.equal(remembered(state, "mara").text, "Visit only in spring.");
  assert(!remembered(state, "mara").forgotten);
});

await runCase("native-repair/offer-undo", async () => {
  for (const accepted of [true, false]) {
    const f = await fixture();
    await f.repository.mutateAuthority(
      (state) => {
        const from = continuityActor(state, "player")!,
          to = continuityActor(state, "mara")!;
        const incoming = {
          id: "offer-letter",
          requestId: "offer-letter",
          at: later,
          from,
          to,
          text: "Let us visit on Saturday, only if Delia comes.",
        };
        state.mailbox = queueMailboxLetter(state.mailbox, state.seed, incoming, incoming.requestId, incoming.text);
        acceptMailExchange(
          state,
          {
            incoming,
            capture: captureContinuityContext(state, ["player", "mara"], incoming.text, later),
            incomingMeaning: {
              keep: [
                {
                  id: "offer",
                  for: ["player", "mara"],
                  about: ["mara"],
                  class: "commitment",
                  text: incoming.text,
                  source: ["letter"],
                  offer: { proposer: "player", participants: ["player", "mara"] },
                },
              ],
              requires: ["offer"],
            },
            replyText: accepted ? "I accept those exact conditions." : "I will consider your offer.",
            replyMeaning: accepted
              ? {
                  keep: [
                    {
                      id: "accept",
                      replace: "incoming:offer",
                      for: ["mara", "player"],
                      accept: "mara",
                      source: ["letter"],
                    },
                  ],
                  requires: ["accept"],
                }
              : { keep: [], requires: [] },
            responseDigest: memoryHash("offer-exchange"),
          },
          later,
        );
        readDeliveredLetter(state, "offer-letter:reply", later);
      },
      { memories: true },
    );
    const record = (await f.api.list("memories")).records.find((row) => row.summary.startsWith("commitment"))!;
    const forgotten = await f.prepare(record.id, "forget-offer", undefined, ["mara"], "forget");
    await f.api.apply(forgotten.id, forgotten.token);
    const undo = await f.api.undo(forgotten.id, "undo-offer");
    await f.api.apply(undo.id, undo.token);
    f.reopen();
    const state = await f.read(),
      holder = continuityActor(state, "mara")!;
    const restored = continuityViews(
      state.continuity,
      holder,
      later,
      continuityProtectionUnits(state.continuity, holder, episodeSourceGraph(state.episodes.records, holder)),
    ).find((row) => row.id === record.target!.id)!;
    assert.equal(restored.offer?.state, accepted ? "accepted" : "offered");
    assert.equal(restored.offer?.contributions.length, accepted ? 2 : 1);
    assert.deepEqual(restored.version.about, [{ id: "mara", incarnation: "one" }]);
    if (!accepted) {
      await f.repository.mutateAuthority(
        (state) => {
          const capture = captureContinuityContext(state, ["player", "mara"], "Saturday", later),
            from = continuityActor(state, "mara")!,
            to = continuityActor(state, "player")!;
          acceptResidentLetter(
            state,
            capture,
            { id: "later-acceptance", at: later, from, to },
            "I accept your exact Saturday offer, only if Delia comes.",
            "later-acceptance",
            {
              keep: [
                {
                  id: "accept",
                  replace: record.target!.id,
                  for: ["mara", "player"],
                  accept: "mara",
                  source: ["letter"],
                  protection: { roots: capture.protectedRoots, disposition: "clear" },
                },
              ],
              requires: ["accept"],
            },
            memoryHash("later-acceptance"),
            later,
          );
          readDeliveredLetter(state, "later-acceptance", later);
        },
        { memories: true },
      );
      f.reopen();
      const current = await f.read(),
        actor = continuityActor(current, "mara")!;
      assert.equal(
        continuityViews(
          current.continuity,
          actor,
          later,
          continuityProtectionUnits(current.continuity, actor, episodeSourceGraph(current.episodes.records, actor)),
        ).find((row) => row.id === record.target!.id)!.offer?.state,
        "accepted",
      );
    }
    const originalEvidence = structuredClone((await f.read()).episodes);
    assert(
      !(await f.api.inspect(record.id, "mara")).actions.some((action) =>
        ["fulfill", "withdraw", "reopen", "end"].includes(action.id),
      ),
    );
    const modified = await f.prepare(record.id, "offer-text", "Mara remembers the proposed visit differently.");
    await f.api.apply(modified.id, modified.token);
    f.reopen();
    const modifiedState = await f.read(),
      modifiedKey = continuityHolderKey(continuityActor(modifiedState, "mara")!);
    const modifiedRoot = modifiedState.continuity.records.find((root) => root.id === record.target!.id)!;
    const modifiedVersion = modifiedState.continuity.versions.find(
      (version) => version.id === modifiedRoot.heads[modifiedKey]!.versionId,
    )!;
    assert.deepEqual(modifiedVersion.about, [{ id: "mara", incarnation: "one" }]);
    assert.equal(modifiedVersion.offerEvents, undefined);
    assert.deepEqual(modifiedState.episodes, originalEvidence);
  }
});

async function roomFixture(f: Awaited<ReturnType<typeof fixture>>) {
  let placeId = "";
  await f.repository.mutateAuthority(
    (state) => {
      const place = establishPlace(
        state,
        {
          name: "Lantern",
          description: "A quiet inn.",
          controllers: [],
          people: [],
          zones: [{ id: "parlor", name: "Parlor", kind: "public", description: "Wooden tables." }],
        },
        "lantern",
        "map",
        "place-request",
        at,
        true,
      );
      placeId = place.id;
      retainNativeFact(
        state,
        {
          id: "room-source",
          kind: "discovery",
          targetId: placeId,
          revision: 1,
          text: "Wooden tables.",
          witnesses: ["player"],
          observedBy: ["player"],
        },
        at,
        { room: { kind: "room", placeId, zoneId: "parlor" } },
      );
    },
    { memories: true },
  );
  const context = async () => {
    const state = await f.read(),
      venue = findLocation(state, placeId)!;
    const scene = coerceSession({
      version: 5,
      id: "repair-context",
      placeId,
      placeName: "Lantern",
      zoneId: "parlor",
      villageSeed: state.seed,
      sceneRevision: 1,
      startedAt: at,
      lastActivityAt: at,
      status: "active",
      activeIds: [],
      participants: [],
      sceneAttendance: { capturedAt: at, layout: captureSceneLayout(venue), occupants: [] },
    });
    return narrationContinuityContext(state, scene, venue, "fresh-context", "Look around.", later);
  };
  return { placeId, context };
}

await runCase("native-repair/room", async () => {
  const f = await fixture(),
    room = await roomFixture(f),
    record = (await f.api.list("places")).records.find((row) => row.summary === "Room detail")!;
  const before = await room.context();
  assert(JSON.stringify(before.parts).includes("Wooden tables."));
  const review = await f.prepare(record.id, "change-room", "Painted green tables.", []);
  await f.api.apply(review.id, review.token);
  const after = await room.context();
  assert(
    JSON.stringify(after.parts.filter((part) => part.block.evidenceId?.startsWith("room"))).includes(
      "Painted green tables.",
    ),
  );
  const undo = await f.api.undo(review.id, "undo-room");
  await f.api.apply(undo.id, undo.token);
  f.reopen();
  assert(JSON.stringify((await room.context()).parts).includes("Wooden tables."));
});

await runCase("native-repair/circumstance", async () => {
  const f = await fixture(),
    room = await roomFixture(f);
  await f.repository.mutateAuthority(
    (state) => {
      const narrative = ensureNarrative(state, at);
      narrative.situations.push({
        id: "rain",
        revision: 1,
        scope: "village",
        title: "Rain",
        summary: "Steady rain.",
        status: "active",
        targets: [],
        updatedAt: at,
      });
      retainAdministrativeCircumstance(state, "rain", "rain-source", at);
    },
    { memories: true },
  );
  await room.context();
  const checkpoint = await f.api.createCheckpoint("With rain", "rain-checkpoint");
  const record = await f.api.inspect(repairId("narrative-situation", "rain"));
  const review = await f.api.prepare({
    operationId: "repair-rain",
    recordId: record.id,
    action: "correct",
    values: { summary: "A lighter drizzle." },
    knowers: [],
    expectedRecord: record.token!,
  });
  await f.api.apply(review.id, review.token);
  let context = await room.context();
  let state = await f.read(),
    episode = state.episodes.records.findLast((row) =>
      row.commandReceipts.some(
        (receipt) =>
          receipt.kind === "circumstance" &&
          receipt.targetId === "rain" &&
          receipt.revision === state.narrative!.situations[0].revision,
      ),
    )!;
  assert(
    context.parts.some(
      (part) => part.episodeIds.includes(episode.id) && part.block.text.includes("A lighter drizzle."),
    ),
    "required current context uses the new canonical native source without teaching a character",
  );
  const restore = await f.api.restore(checkpoint.id, "restore-rain");
  await f.api.apply(restore.id, restore.token);
  f.reopen();
  context = await room.context();
  state = await f.read();
  episode = state.episodes.records.findLast((row) =>
    row.commandReceipts.some(
      (receipt) =>
        receipt.kind === "circumstance" &&
        receipt.targetId === "rain" &&
        receipt.revision === state.narrative!.situations[0].revision,
    ),
  )!;
  assert(
    context.parts.some((part) => part.episodeIds.includes(episode.id) && part.block.text.includes("Steady rain.")),
  );
});

await runCase("native-repair/founding-circumstance", async () => {
  const f = await fixture(),
    room = await roomFixture(f);
  await f.repository.mutateAuthority(
    (state) =>
      seedFoundingCircumstances(
        state,
        readFoundingCircumstances([{ scope: "village", summary: "Dust from the old quarry." }], state.venues, at),
        ["player", "mara"],
        at,
      ),
    { memories: true },
  );
  await room.context();
  const checkpoint = await f.api.createCheckpoint("Founding circumstance", "founding-circumstance");
  const record = await f.api.inspect(repairId("narrative-situation", "founding:0"));
  const review = await f.api.prepare({
    operationId: "founding-title",
    recordId: record.id,
    action: "correct",
    values: { title: "Quarry dust" },
    knowers: [],
    expectedRecord: record.token!,
  });
  await f.api.apply(review.id, review.token);
  f.reopen();
  assert(JSON.stringify((await room.context()).parts).includes("Dust from the old quarry."));
  const restore = await f.api.restore(checkpoint.id, "restore-founding");
  await f.api.apply(restore.id, restore.token);
  f.reopen();
  assert(JSON.stringify((await room.context()).parts).includes("Dust from the old quarry."));
});

await runCase("native-repair/protected-circumstance", async () => {
  for (const action of ["forget", "correct"]) {
    const f = await fixture(),
      room = await roomFixture(f),
      secret = "Ask the violet fox for the brass pin.";
    await f.repository.mutateAuthority(
      (state) => {
        const native = ensureNarrative(state, at);
        native.situations.push({
          id: "latch",
          revision: 1,
          scope: "village",
          title: "A broken latch",
          summary: "The latch sticks.",
          status: "active",
          targets: [],
          updatedAt: at,
        });
        native.conditions.push({
          id: "latch-condition",
          revision: 1,
          situationId: "latch",
          venueId: room.placeId,
          zoneId: "parlor",
          observation: "The latch sticks.",
          restriction: "ordinary-use",
          remedy: secret,
          startsAt: at,
          endsAt: null,
          clearedAt: null,
        });
        retainNativeFact(
          state,
          {
            id: "private-remedy-source",
            kind: "circumstance",
            targetId: "latch",
            revision: 1,
            text: JSON.stringify({
              situation: { title: "A broken latch", summary: "The latch sticks.", status: "active" },
              conditions: [{ id: "latch-condition", observation: "The latch sticks.", remedy: secret }],
            }),
            circumstance: { summary: "The latch sticks.", status: "active" },
            witnesses: ["player", "mara"],
            observedBy: ["player", "mara"],
          },
          at,
        );
      },
      { memories: true },
    );
    const memory = (await f.api.list("memories")).records.find((row) => row.title.includes(secret))!;
    const protection = await f.prepare(
      memory.id,
      "protect-remedy",
      action === "correct" ? "The latch needs ordinary maintenance." : undefined,
      ["player", "mara"],
      action,
    );
    await f.api.apply(protection.id, protection.token);
    assert(!JSON.stringify((await room.context()).parts).includes(secret));
    const checkpoint = await f.api.createCheckpoint("Protected remedy", "protected-remedy");
    const record = await f.api.inspect(repairId("narrative-situation", "latch")),
      edit = await f.api.prepare({
        operationId: "rename-situation",
        recordId: record.id,
        action: "correct",
        values: { title: "Maintenance" },
        knowers: [],
        expectedRecord: record.token!,
      });
    await f.api.apply(edit.id, edit.token);
    f.reopen();
    assert(
      !JSON.stringify((await room.context()).parts).includes(secret),
      "metadata edits cannot rehydrate inherited protected prose",
    );
    const restore = await f.api.restore(checkpoint.id, "restore-protected");
    await f.api.apply(restore.id, restore.token);
    f.reopen();
    assert(
      !JSON.stringify((await room.context()).parts).includes(secret),
      "restoration preserves the inherited source protection",
    );
  }
});

await runCase("native-repair/stale", async () => {
  const f = await fixture(),
    record = await wishRecord(f);
  await assert.rejects(f.prepare(record.id, "teach-leo", "Invented knowledge", ["leo"]), /existing continuity holders/);
  await assert.rejects(f.api.inspect(repairId("new-memory")), /unavailable/);
  const review = await f.prepare(record.id, "stale", "Only in spring.");
  await f.repository.mutateAuthority((state) => {
    state.name = "Concurrent title";
  });
  await assert.rejects(f.api.apply(review.id, review.token), /changed|review/i);
  assert.equal(remembered(await f.read(), "mara").text, "Visit the fair, only if Delia comes.");
  await f.repository.mutateAuthority((state) => {
    state.villagers[0].incarnation = "replacement";
  });
  await assert.rejects(
    f.api.prepare({
      recordId: record.id,
      operationId: "old-holder",
      values: { text: "Changed" },
      knowers: ["mara"],
      action: "correct",
      expectedRecord: record.token!,
    }),
    /changed/,
  );
});

await runCase("native-repair/checkpoint", async () => {
  const f = await fixture();
  await f.repository.mutateAuthority((state) => {
    state.venues = [...[venueFixture({ id: "hall", name: "Hall" })], ...sharedVenuesFixture()];
  });
  const checkpoint = await f.api.createCheckpoint("Before edit", "before-edit"),
    record = await wishRecord(f),
    original = await f.read();
  const zone = original.venues[0].zones!.find((row) => row.kind !== "exterior")!;
  const access = {
    action: "zone-policy" as const,
    operationId: "hall-hours",
    expectedRevision: original.venues[0].access!.revision,
    zoneId: zone.id,
    policy: { ...zone.access!, visitorHours: [] },
  };
  await f.repository.mutateAuthority((state) => applyAccessCommand(state.venues[0], access, "player", at, ["player"]));
  const edit = await f.prepare(record.id, "edit", "Only in spring.");
  await f.api.apply(edit.id, edit.token);
  const changed = await f.read(),
    restore = await f.api.restore(checkpoint.id, "restore");
  assert.deepEqual(await f.read(), changed);
  await f.api.apply(restore.id, restore.token);
  const restored = await f.read();
  assert.equal(remembered(restored, "mara").text, remembered(original, "mara").text);
  assert.deepEqual(restored.mailbox, original.mailbox);
  assert.deepEqual(restored.episodes, original.episodes);
  assert(restored.continuity.records[0].revision > changed.continuity.records[0].revision);
  f.reopen();
  const reloaded = await f.read();
  assert.equal(remembered(reloaded, "mara").text, remembered(original, "mara").text);
  assert.equal(reloaded.venues[0].access!.visitorHours, null);
  assert.throws(() => applyAccessCommand(reloaded.venues[0], access, "player", at, ["player"]), /already rejected/);
});

await runCase("native-repair/missing-page", async () => {
  const f = await fixture();
  try {
    const head = f.rows.get("villages-village").data.memoryHead,
      manifest = JSON.parse(f.rows.get(head.id).data.payload),
      pageId = manifest.versions.id;
    assert(f.rows.delete(pageId), "The committed common history page exists before the fault");
    const before = structuredClone(f.rows);
    await assert.rejects(collectRetainedStorage(f.gate), /missing/);
    assert.deepEqual(f.rows, before, "Missing common history prevents every cleanup deletion");
    await assert.rejects(f.api.createCheckpoint("Missing common page", "missing-page"), /missing/);
    assert.deepEqual(f.rows, before, "Missing common history prevents checkpoint publication");
  } finally {
    f.gate.dispose();
  }
});

await runCase("native-repair/plan-allowance", async () => {
  const f = await fixture();
  await f.repository.mutateAuthority(
    (state) => {
      state.timeZone = "UTC";
      state.backgroundPace = "lively";
      state.venues = [
        ...[venueFixture({ id: "square", name: "Square", category: "public" })],
        ...sharedVenuesFixture(),
      ];
      for (const resident of state.villagers)
        resident.agenda = agendaFixture({
          day: [
            {
              startMinute: 0,
              endMinute: 1440,
              venueId: "square",
              zoneId: "exterior",
              activity: "Free time",
              flexible: true,
            },
          ],
          generatedAt: at,
        });
    },
    { memories: true },
  );
  const checkpoint = await f.api.createCheckpoint("Before free-time selection", "plan-before");
  await f.repository.mutateAuthority(
    (state) => {
      const candidates = socialPlanCandidates(state, new Date(at)),
        plan = candidates.find((row) => row.kind === "meeting");
      assert(plan);
      acceptSocialPlan(state, candidates, plan.id, new Date(at));
    },
    { memories: true },
  );
  assert.equal((await f.read()).residentPlans.selectedDate, "2026-11-09");
  const review = await f.api.restore(checkpoint.id, "restore-plan");
  await f.api.apply(review.id, review.token);
  f.reopen();
  const restored = await f.read();
  assert.equal(restored.residentPlans.plans.length, 0, "explicit checkpoint restores its native plan rows");
  assert.equal(
    restored.residentPlans.selectedDate,
    "2026-11-09",
    "restoring older progress cannot refund consumed automatic admission",
  );
  assert.equal(socialPlanCandidates(restored, new Date(at)).length, 0);
});

await runCase("native-repair/pending-target", async () => {
  const f = await fixture();
  await f.repository.mutateAuthority(
    (state) => {
      const from = continuityActor(state, "player")!,
        to = continuityActor(state, "mara")!;
      state.mailbox = queueMailboxLetter(
        state.mailbox,
        state.seed,
        { id: "pending", at: later, from, to },
        "pending",
        "Would you write back?",
      );
    },
    { memories: true },
  );
  const checkpoint = await f.api.createCheckpoint("Pending letter", "pending-checkpoint");
  await assert.rejects(f.api.restore(checkpoint.id, "current-pending"), /pending correspondence/);
  await f.repository.mutateAuthority(
    (state) => {
      const incoming = state.mailbox.messages.pending;
      acceptMailExchange(
        state,
        {
          capture: captureContinuityContext(state, ["player", "mara"], incoming.text, later),
          incoming,
          incomingMeaning: { keep: [], requires: [] },
          replyText: "",
          replyMeaning: { keep: [], requires: [] },
          responseDigest: memoryHash("no reply"),
        },
        later,
      );
    },
    { memories: true },
  );
  const before = await f.read();
  await assert.rejects(f.api.restore(checkpoint.id, "target-pending"), /pending correspondence/);
  assert.deepEqual(await f.read(), before);
});

await runCase("native-repair/unread-targets", async () => {
  for (const meaningful of [true, false]) {
    const f = await fixture();
    await f.repository.mutateAuthority((state) => authorLetter(state, "unread", meaningful), { memories: true });
    const checkpoint = await f.api.createCheckpoint("Unread letter", "unread-checkpoint"),
      before = await f.read();
    if (meaningful) {
      await assert.rejects(f.api.restore(checkpoint.id, "unread-restore"), /unread mail needs recovery/);
      assert.deepEqual(await f.read(), before);
    } else {
      const restore = await f.api.restore(checkpoint.id, "unread-restore");
      await f.api.apply(restore.id, restore.token);
      assert.equal((await f.read()).mailbox.messages.unread.readAt, undefined);
      await f.repository.mutateAuthority((state) => readDeliveredLetter(state, "unread", later), { memories: true });
      assert.equal((await f.read()).mailbox.messages.unread.readAt, later);
    }
  }
});

await runCase("native-repair/recovery", async () => {
  const f = await fixture(),
    record = await wishRecord(f),
    original = await f.read(),
    review = await f.prepare(record.id, "recover", "Only if Delia comes in spring.");
  let failed = false;
  f.hook((event, id) => {
    if (!failed && event === "after-update" && id === "villages-village") {
      failed = true;
      throw Error("injected lost acknowledgement");
    }
  });
  await assert.rejects(f.api.apply(review.id, review.token), /injected/);
  assert(failed);
  f.hook(undefined);
  f.reopen();
  await f.api.index();
  const restored = await f.read();
  assert.equal(remembered(restored, "mara").text, "Only if Delia comes in spring.");
  assert.deepEqual(restored.episodes, original.episodes);
  assert.equal(Object.keys(restored.continuity.receipts).filter((id) => id === "recover").length, 1);
  await f.api.apply(review.id, review.token);
  assert.deepEqual(await f.read(), restored);
});

await runCase("repair-familiar/memory-accounts", async () => {
  const f = await fixture();
  await f.repository.mutateAuthority(
    (state) =>
      retainNativeFact(
        state,
        {
          id: "about-leo",
          kind: "initialization",
          targetId: "leo",
          revision: 1,
          text: "Leo keeps a blue notebook.",
          witnesses: ["mara"],
        },
        at,
        { about: ["leo"] },
      ),
    { memories: true },
  );
  assert.equal(
    (await f.api.list("people", "", 0, "leo", "memories")).records.length,
    0,
    "Being a subject does not expose another person's editable account",
  );
  const before = await f.read();
  const page = await f.api.list("people", "", 0, "leo", "memories");
  assert(page.creation);
  const addition = await f.api.prepare({
    operationId: "add-leo-memory",
    recordId: page.creation.id,
    expectedRecord: page.creation.token!,
    action: "correct",
    knowers: ["leo"],
    personId: "leo",
    values: { text: "I left the brass key at home.\n\nI will collect it on Friday." },
  });
  assert.deepEqual(await f.read(), before);
  await f.api.apply(addition.id, addition.token);
  const after = await f.read();
  assert.deepEqual(after.episodes, before.episodes, "administrative memories retain original evidence");
  assert.equal(
    continuityMemoryLibrary(after, { inspection: true, characterId: "leo" }, later).entries.some((entry) =>
      entry.text.includes("brass key"),
    ),
    true,
  );
  f.reopen();
  const memory = (await f.api.list("people", "", 0, "leo", "memories")).records.find((entry) =>
    entry.title.includes("brass key"),
  )!;
  const prepare = async (record: typeof memory, id: string, action: string, knowers = ["leo"]) =>
    f.api.prepare({
      operationId: id,
      recordId: record.id,
      expectedRecord: record.token!,
      personId: "leo",
      action,
      knowers,
      values: {},
    });
  const teach = await prepare(memory, "teach-key", "teach", ["player"]);
  await f.api.apply(teach.id, teach.token);
  assert(
    continuityMemoryLibrary(await f.read(), { inspection: true, characterId: "player" }, later).entries.some((entry) =>
      entry.text.includes("brass key"),
    ),
  );
  const current = await f.api.inspect(memory.id, "leo");
  const forgotten = await prepare(current, "forget-key", "forget");
  await f.api.apply(forgotten.id, forgotten.token);
  const hidden = await f.api.inspect(memory.id, "leo");
  assert.deepEqual(hidden.actions, [{ id: "remember", label: "Restore memory" }]);
  const restored = await prepare(hidden, "restore-key", "remember");
  await f.api.apply(restored.id, restored.token);
  assert.equal(
    continuityMemoryLibrary(await f.read(), { inspection: true, characterId: "leo" }, later).entries.find(
      (entry) => entry.id === partsId(memory.id),
    )?.forgotten,
    false,
  );
  assert.deepEqual((await f.read()).episodes, before.episodes);
  await f.api.apply(restored.id, restored.token);
  assert.equal((await f.api.index()).history.filter((entry) => entry.id === restored.id).length, 1);
});
function partsId(id: string) {
  return JSON.parse(id)[1];
}

await runCase("repair-familiar/targets", async () => {
  const f = await fixture();
  const before = await f.read();
  for (const id of ["mara", "leo"]) {
    const arrangements = (await f.api.list("people", "", 0, id, "home")).records;
    assert(arrangements.every((record) => JSON.parse(record.id)[1] === id));
    assert.deepEqual(
      arrangements.map((record) => JSON.parse(record.id)[0]),
      ["home", "work"],
      "Home precedes Work in the guided editor",
    );
    assert((await f.api.list("people", "", 0, id, "details")).records.length > 0);
  }
  const places = await f.api.list("places", "", 0, undefined, undefined, true);
  assert(places.directory?.length);
  const pending = [...places.directory!],
    grants = [];
  while (pending.length) {
    const item = pending.pop()!;
    pending.push(...(item.children ?? []));
    if (item.id.startsWith('["new-grant",')) grants.push(item);
  }
  assert(
    grants.length > 0 && grants.every((item) => item.icon === "access"),
    "New permissions belong to Access & hours",
  );
  assert.deepEqual(await f.read(), before, "browsing targets cannot mutate a Village");
  const venue = before.venues[0]!;
  const management = await f.api.inspect(repairId("management", venue.id));
  const review = await f.api.prepare({
    operationId: "change-manager",
    recordId: management.id,
    expectedRecord: management.token!,
    action: "correct",
    values: Object.fromEntries(management.fields.map((field) => [field.key, field.key === "manager:leo"])),
    knowers: [],
  });
  await f.api.apply(review.id, review.token);
  assert.deepEqual((await f.read()).venues[0].access?.managerIds, ["leo"]);
});

await runCase("repair-familiar/work-booking", async () => {
  const f = await fixture();
  await f.repository.mutateAuthority((state) => {
    state.timeZone = "UTC";
    state.venues.push(venueFixture({ id: "workshop", name: "Workshop" }));
    for (const person of state.villagers)
      person.agenda = agendaFixture({
        day: [
          { startMinute: 0, endMinute: 420, activity: "Sleep", venueId: "", essential: true },
          {
            startMinute: 420,
            endMinute: 600,
            activity: "Free time",
            venueId: "workshop",
            zoneId: "public",
            flexible: true,
          },
          {
            startMinute: 600,
            endMinute: 630,
            activity: "Rest",
            venueId: "workshop",
            zoneId: "public",
            essential: true,
          },
          {
            startMinute: 630,
            endMinute: 1320,
            activity: "Free time",
            venueId: "workshop",
            zoneId: "public",
            flexible: true,
          },
          { startMinute: 1320, endMinute: 1440, activity: "Sleep", venueId: "", essential: true },
        ],
      });
  });
  const venue = (await f.read()).venues.find((venue) => venue.id === "workshop")!,
    zone = venue.zones!.find((zone) => zone.kind !== "exterior")!;
  const work = await f.api.inspect(repairId("work", "mara", "new"), "mara");
  const review = await f.api.prepare({
    operationId: "repair-work",
    recordId: work.id,
    expectedRecord: work.token!,
    personId: "mara",
    action: "correct",
    knowers: [],
    values: {
      venueId: venue.id,
      zoneId: zone.id,
      activity: "Bind books",
      days: "Monday,Tuesday,Wednesday,Thursday,Friday",
      start: "09:00",
      end: "12:00",
      inviteGuests: true,
    },
  });
  await f.api.apply(review.id, review.token);
  f.reopen();
  let state = await f.read();
  assert.equal(state.venues.find((venue) => venue.id === "workshop")!.access!.work![0].inviteGuests, true);
  assert.equal(state.venues.find((venue) => venue.id === "workshop")!.access!.work![0].days.length, 5);
  const agendas = await f.api.list("people", "", 0, "mara", "agenda");
  assert(
    agendas.records.some((record) =>
      record.agenda?.blocks.some(
        (block) =>
          block.activity === "Bind books" &&
          block.repairRecordId === repairId("work", "mara", "workshop") &&
          block.repairIndex === undefined,
      ),
    ),
    "composed work opens its authoritative arrangement",
  );
  assert(
    agendas.records
      .filter((record) => record.agenda)
      .every((record) =>
        record.agenda?.blocks
          .filter((block) => block.activity === "Rest")
          .every((block) => block.repairRecordId === undefined && block.repairIndex !== undefined),
      ),
    "rest preserved during a shift remains an ordinary Agenda correction",
  );
  const current = await f.api.inspect(repairId("work", "mara", "workshop"), "mara");
  const shift = await f.api.prepare({
    operationId: "repair-shift",
    recordId: current.id,
    expectedRecord: current.token!,
    personId: "mara",
    action: "correct",
    knowers: [],
    values: { end: "11:30" },
  });
  await f.api.apply(shift.id, shift.token);
  f.reopen();
  state = await f.read();
  assert.equal(state.venues.find((venue) => venue.id === "workshop")!.access!.work![0].inviteGuests, true);
});

await runCase("repair-familiar/place-ownership", async () => {
  const f = await fixture();
  await f.repository.mutateAuthority(
    (state) => {
      state.worldPlaces.npcs["npc:keeper"] = {
        id: "npc:keeper",
        revision: 1,
        name: "Keeper",
        label: "Keeper",
        characterization: "A caretaker.",
        facts: [],
        associations: [],
        availability: "",
        disabled: false,
        source: "fixture",
        updatedAt: at,
      };
    },
    { memories: true },
  );
  await roomFixture(f);
  const before = await f.read(),
    venue = before.venues[0];
  const management = await f.api.inspect(repairId("management", venue.id));
  const review = await f.api.prepare({
    operationId: "npc-manager",
    recordId: management.id,
    expectedRecord: management.token!,
    action: "correct",
    knowers: [],
    values: Object.fromEntries(management.fields.map((field) => [field.key, field.key === "manager:npc:keeper"])),
  });
  await f.api.apply(review.id, review.token);
  f.reopen();
  assert.deepEqual((await f.read()).venues[0].access?.managerIds, ["npc:keeper"]);
  const place = (await f.read()).worldPlaces.places["lantern"],
    zone = place.location.zones![0];
  const detail = await f.api.inspect(repairId("zone-details", place.id, zone.id));
  await assert.rejects(
    f.api.prepare({
      operationId: "too-long-purpose",
      recordId: detail.id,
      expectedRecord: detail.token!,
      action: "correct",
      knowers: [],
      values: { purpose: "a".repeat(241) },
    }),
    /Shorten/,
  );
  const change = await f.api.prepare({
    operationId: "place-zone",
    recordId: detail.id,
    expectedRecord: detail.token!,
    action: "correct",
    knowers: [],
    values: { purpose: "a".repeat(240) },
  });
  await f.api.apply(change.id, change.token);
  f.reopen();
  const after = (await f.read()).worldPlaces.places[place.id];
  assert.equal(after.location.zones![0].purpose, "a".repeat(240));
  assert(after.revision > place.revision);
});

await runCase("native-repair/scores", async () => {
  const f = await fixture(),
    id = repairId("relationship", "mara", "leo");
  assert((await f.api.list("people", "", 0, "mara", "relationships")).records.some((row) => row.id === id));
  const request = {
    operationId: "exact-scores",
    recordId: id,
    action: "correct",
    values: { warmth: 42, romance: 3 },
    knowers: [],
    expectedRecord: (await f.api.inspect(id)).token!,
  };
  const before = await f.read(),
    review = await f.api.prepare(request);
  assert.deepEqual(await f.read(), before);
  await f.api.apply(review.id, review.token);
  const saved = await f.read();
  await f.api.apply(review.id, review.token);
  assert.deepEqual(await f.read(), saved);
  f.reopen();
  const rows = continuityRelationships(await f.read(), later);
  assert.equal(rows[0].scores.find((row) => row.person.id === "leo")!.score, 42);
  assert.equal(rows[0].scores.find((row) => row.person.id === "leo")!.romanticInterest, 3);
  assert.equal(rows[1].scores.find((row) => row.person.id === "mara")!.score, 0);
});

await runCase("native-repair/expanded-editors", async () => {
  const f = await fixture();
  const apply = async (
    recordId: string,
    operationId: string,
    values: Record<string, string | boolean | number>,
    personId?: string,
    action = "correct",
  ) => {
    const record = await f.api.inspect(recordId, personId);
    const review = await f.api.prepare({
      operationId,
      recordId,
      action,
      values,
      personId,
      knowers: personId ? [personId] : [],
      expectedRecord: record.token!,
    });
    await f.api.apply(review.id, review.token);
    return review;
  };
  const state = await f.read(),
    venue = state.venues.find((v) => v.zones?.some((z) => z.kind !== "exterior"))!,
    zone = venue.zones!.find((z) => z.kind !== "exterior")!;
  await apply(repairId("home", "player"), "player-shared-home", {
    homeId: venue.id,
    homeZoneId: zone.id,
    sleepZoneId: zone.id,
  });
  await apply(repairId("home", "mara"), "mara-shared-home", {
    homeId: venue.id,
    homeZoneId: zone.id,
    sleepZoneId: zone.id,
  });
  f.reopen();
  let saved = await f.read();
  assert(saved.venues.find((v) => v.id === venue.id)!.occupancy.playerHome);
  assert.equal(saved.venues.find((v) => v.id === venue.id)!.destinations!.mara!.sleep, zone.id);
  await apply(repairId("hours-mode", venue.id, zone.id), "custom-hours", { mode: "custom" });
  await apply(
    repairId("hours-period", venue.id, zone.id, "0"),
    "opening-hours",
    {
      days: "Monday,Tuesday",
      start: "09:00",
      end: "17:00",
    },
    undefined,
    "add",
  );
  assert.deepEqual(
    (await f.read()).venues.find((v) => v.id === venue.id)!.zones!.find((z) => z.id === zone.id)!.access!.visitorHours,
    [{ days: ["Monday", "Tuesday"], start: "09:00", end: "17:00" }],
  );
  await apply(
    repairId("new-wish", "mara"),
    "new-wish",
    { text: "Mara wants to mend her old coat.", class: "desire", current: true, "subject:mara": true },
    "mara",
  );
  let wish = continuityWishes(await f.read(), "mara", true, later).find((w) => w.text.includes("old coat"))!;
  assert(wish);
  await apply(repairId("memory", wish.wishId), "fulfill-wish", {}, "mara", "fulfill");
  f.reopen();
  wish = continuityWishes(await f.read(), "mara", true, later).find((w) => w.wishId === wish.wishId)!;
  assert.equal(wish.status, "fulfilled");
  await apply(repairId("memory", wish.wishId), "reopen-wish", {}, "mara", "reopen");
  assert.equal(
    continuityWishes(await f.read(), "mara", true, later).find((w) => w.wishId === wish.wishId)!.status,
    "open",
  );
  await apply(repairId("new-room", venue.id, zone.id), "new-room", {
    text: "A repaired blue chair stands by the door.",
    visibility: "concealed",
    expiresAt: "",
    order: 2,
  });
  f.reopen();
  saved = await f.read();
  const detail = saved.continuity.versions.findLast((v) => v.text.includes("repaired blue chair"))!;
  assert.equal(detail.room!.visibility, "concealed");
  assert.equal(detail.room!.order, 2);
  await apply(repairId("room", detail.rootId), "remove-room", {}, undefined, "remove");
  await collectRetainedStorage(f.gate);
  assert(
    (await f.read()).episodes.records.some((episode) =>
      episode.commandReceipts.some((receipt) => receipt.id === "repair-room:new-room"),
    ),
    "room removal retains historical evidence",
  );
});

await runCase("native-repair/weekly-correction", async () => {
  for (const modern of [false, true]) {
    const f = await fixture();
    await f.repository.mutateAuthority((state) => {
      const venue = state.venues.find((v) => v.zones?.some((z) => z.kind !== "exterior"))!,
        zone = venue.zones!.find((z) => z.kind !== "exterior")!;
      state.timeZone = "UTC";
      state.villagers[0].agenda = agendaFixture({
        ...(modern ? { calendarVersion: 1 as const } : {}),
        day: [
          { startMinute: 0, endMinute: 420, venueId: "", activity: "Sleep", essential: true },
          { startMinute: 420, endMinute: 480, venueId: venue.id, zoneId: zone.id, activity: "Reading maps" },
          { startMinute: 480, endMinute: 600, venueId: venue.id, zoneId: zone.id, activity: "Walking" },
        ],
      });
    });
    const day = (await f.api.list("people", "", 0, "mara", "agenda")).records[0]!;
    const edit = async (activity: string, replacement: string, action: string, repeat = "date") => {
      const record = await f.api.inspect(day.id, "mara"),
        field = record.fields.find((field) => field.key.startsWith("activity:") && field.value === activity)!;
      assert(field, activity);
      const index = field.key.split(":")[1];
      const review = await f.api.prepare({
        operationId: "agenda-" + action + "-" + replacement.replaceAll(" ", "-"),
        recordId: record.id,
        action,
        values: { [field.key]: replacement || activity, ["repeat:" + index]: repeat },
        knowers: [],
        personId: "mara",
        expectedRecord: record.token!,
      });
      await f.api.apply(review.id, review.token);
    };
    await edit("Reading maps", "", "remove-activity");
    let state = await f.read();
    const date = new Date(JSON.parse(day.id)[2] + "T12:00:00Z");
    assert(agendaBlocksFor(state.villagers[0].agenda!, date).some((b) => b.activity === "Sleep" && b.essential));
    assert(agendaBlocksFor(state.villagers[0].agenda!, date).some((b) => b.activity === "Walking"));
    assert(!agendaBlocksFor(state.villagers[0].agenda!, date).some((b) => b.activity === "Reading maps"));
    const prior = routineRevision(state.villagers[0].agenda!);
    await edit("Walking", "Tending herbs", "correct", "weekly");
    f.reopen();
    state = await f.read();
    assert(!routineRevisionMatches(state.villagers[0].agenda!, prior));
    const future = new Date(date);
    future.setUTCDate(future.getUTCDate() + 7);
    const materialized = structuredClone(state);
    planRoutineDays(materialized, future);
    assert(agendaBlocksFor(materialized.villagers[0].agenda!, future).some((b) => b.activity === "Tending herbs"));
    await edit("Tending herbs", "Watering herbs", "correct", "weekly");
    assert(agendaBlocksFor((await f.read()).villagers[0].agenda!, future).some((b) => b.activity === "Watering herbs"));
  }
});

await runCase("native-repair/physical-environment", async () => {
  const f = await fixture();
  const apply = async (
    id: string,
    operationId: string,
    values: Record<string, string | number | boolean>,
    action = "correct",
  ) => {
    const record = await f.api.inspect(id);
    const review = await f.api.prepare({
      recordId: id,
      operationId,
      action,
      values,
      knowers: [],
      expectedRecord: record.token!,
    });
    await f.api.apply(review.id, review.token);
  };
  const venue = (await f.read()).venues[0]!;
  await apply(
    repairId("new-zone", venue.id),
    "add-zone",
    {
      name: "Reading nook",
      kind: "public",
      purpose: "Reading",
      description: "A blue bench stands under the window.",
      connection: "exterior",
    },
    "add",
  );
  f.reopen();
  let state = await f.read();
  const zone = state.venues[0]!.zones!.find((z) => z.name === "Reading nook")!;
  assert(zone.connectedTo!.includes("exterior"));
  assert(state.venues[0]!.zones!.find((z) => z.id === "exterior")!.connectedTo!.includes(zone.id));
  await apply(
    repairId("new-condition", venue.id, zone.id),
    "add-condition",
    { observation: "The bench needs repair.", remedy: "Mend the bench.", restriction: "ordinary-use", endsAt: "" },
    "add",
  );
  state = await f.read();
  const condition = state.narrative!.conditions.at(-1)!;
  assert.equal(condition.zoneId, zone.id);
  await apply(repairId("narrative-condition", condition.id), "clear-condition", { cleared: "yes" });
  await apply(
    repairId("narrative-weather", "new"),
    "first-weather",
    {
      description: WORLD_WEATHER[1]!,
      startsAt: "2027-01-01T08:00",
      endsAt: "2027-01-01T16:00",
    },
    "add",
  );
  state = await f.read();
  assert.equal(state.narrative!.weather!.description, WORLD_WEATHER[1]);
  await apply(repairId("narrative-weather", state.narrative!.weather!.id), "clear-weather", {}, "clear");
  assert.equal((await f.read()).narrative!.weather, null);
  await apply(repairId("archive-zone", venue.id, zone.id), "archive-zone", {}, "archive");
  f.reopen();
  state = await f.read();
  assert(!state.venues[0]!.zones!.some((z) => z.id === zone.id));
  assert(state.venues[0]!.archivedZones!.some((z) => z.zone.id === zone.id));
  await collectRetainedStorage(f.gate);
});

await runCase("native-repair/metadata-identity", async () => {
  const f = await fixture();
  const record = await wishRecord(f);
  let state = await f.read();
  const holder = continuityActor(state, "mara")!,
    key = continuityHolderKey(holder),
    root = state.continuity.records.find((row) => row.id === record.target!.id)!;
  const subjects = state.continuity.versions.find((version) => version.id === root.heads[key]!.versionId)!.about;
  const corrected = await f.prepare(record.id, "subject-text", "Visit the fair only after the repairs finish.");
  await f.api.apply(corrected.id, corrected.token);
  f.reopen();
  state = await f.read();
  assert.deepEqual(
    state.continuity.versions.find(
      (version) => version.id === state.continuity.records.find((row) => row.id === root.id)!.heads[key]!.versionId,
    )!.about,
    subjects,
  );
  await f.repository.mutateAuthority((state) => {
    (state.wishFollowing ??= {})["mara:" + root.id] = false;
  });
  const fulfilled = await f.prepare(record.id, "subject-fulfilled", undefined, ["mara"], "fulfill");
  await f.api.apply(fulfilled.id, fulfilled.token);
  const fix = async (id: string, op: string, values: Record<string, string | boolean>) => {
    const current = await f.api.inspect(id, "mara");
    const review = await f.api.prepare({
      operationId: op,
      recordId: id,
      action: "correct",
      values,
      knowers: ["mara"],
      personId: "mara",
      expectedRecord: current.token!,
    });
    await f.api.apply(review.id, review.token);
    f.reopen();
  };
  await fix(record.id, "closed-subjects", { "subject:leo": true });
  state = await f.read();
  const wish = continuityWishes(state, "mara", true, later).find((wish) =>
    wish.text.startsWith("Visit the fair only"),
  )!;
  assert.equal(wish.status, "fulfilled");
  assert.equal(wish.followed, false);
  await fix(repairId("memory", wish.wishId), "closed-to-information", { class: "information" });
  state = await f.read();
  let version = state.continuity.versions.findLast((version) => version.text.startsWith("Visit the fair only"))!;
  assert.equal(version.class, "information");
  assert.equal(version.closed, undefined);
  const priorId = version.rootId;
  await f.repository.mutateAuthority((state) => {
    state.villagers.find((person) => person.characterId === "leo")!.incarnation = "two";
  });
  const form = await f.api.inspect(repairId("memory", priorId), "mara");
  assert(form.fields.some((field) => field.key.startsWith("subject-ref:")));
  await fix(form.id, "keep-old-subject", { current: true });
  state = await f.read();
  version = state.continuity.versions.findLast((version) => version.text.startsWith("Visit the fair only"))!;
  assert.equal(version.about.find((person) => person.id === "leo")!.incarnation, "one");
  assert.equal(
    (await f.api.inspect(repairId("memory", version.rootId), "mara")).fields.find((field) => field.key === "current")!
      .readOnly,
    undefined,
  );
});

await runCase("native-repair/project-controls", async () => {
  const f = await fixture();
  await f.repository.mutateAuthority(
    (state) => {
      state.maps = [
        {
          id: "repair-map",
          name: "Village",
          width: 1440,
          height: 900,
          revision: 1,
          view: { fit: "cover", focusX: 50, focusY: 50, zoom: 1 },
          artwork: { id: "map-art", ref: "global-gallery:map-art", url: "/map.png" },
        },
      ];
      draftNewVenueProject(state, { name: "Workshop", description: "A small workshop" }, "", "repair-project");
    },
    { memories: true },
  );
  const id = repairId("project", "repair-project");
  const apply = async (values: Record<string, string | number | boolean>, operationId: string, action = "correct") => {
    const record = await f.api.inspect(id);
    const review = await f.api.prepare({
      recordId: id,
      operationId,
      expectedRecord: record.token!,
      action,
      values,
      knowers: [],
    });
    await f.api.apply(review.id, review.token);
    return review;
  };
  await apply({ title: "Repaired workshop" }, "project-title");
  f.reopen();
  let state = await f.read(),
    project = state.projects.find((p) => p.id === "repair-project")!;
  assert.equal(project.plan, undefined);
  assert.equal(project.venueDraft!.position.x, null);
  assert.equal(project.lifecycle!.builderId, "");
  const review = await apply(
    {
      lead: "mara",
      form: "A timber workshop",
      detail: "A sheltered entrance",
      mapId: state.maps[0]!.id,
      x: 0.8,
      y: 0.8,
    },
    "project-finish",
    "finish",
  );
  await f.api.apply(review.id, review.token);
  f.reopen();
  state = await f.read();
  project = state.projects.find((p) => p.id === "repair-project")!;
  assert.equal(project.status, "complete");
  assert.equal(project.progress, 100);
  assert.equal(state.venues.find((v) => v.id === project.venueId)!.constructionStatus, "complete");
  assert.deepEqual(project.lifecycle!.approvals, []);
  assert.deepEqual(project.lifecycle!.candidates, []);
  assert.equal(
    project.lifecycle!.repair!.builder.incarnation,
    state.villagers.find((p) => p.characterId === "mara")!.incarnation,
  );
  assert.equal(
    state.villagers.some((p) => p.agenda?.reservations?.some((r) => r.id === project.id)),
    false,
  );
  const receipt = state.episodes.records
    .flatMap((e) => e.commandReceipts)
    .find((r) => r.id === "project-complete:" + project.id)!;
  assert.deepEqual(receipt.witnesses, []);
  await f.repository.mutateAuthority(
    (state) => {
      const venue = state.venues.find((v) => v.id === project.venueId)!;
      draftRenovationProject(
        state,
        venue.id,
        { title: "Update workshop", form: "A stone workshop", detail: "Replace the timber shell" },
        "repair-renovation",
      );
      venue.form = "A different live form";
    },
    { memories: true },
  );
  const record = await f.api.inspect(repairId("project", "repair-renovation"));
  await assert.rejects(
    () =>
      f.api.prepare({
        recordId: record.id,
        expectedRecord: record.token!,
        operationId: "outdated-project",
        action: "finish",
        values: { lead: "mara" },
        knowers: [],
      }),
    /design changed/,
  );
  const cancel = await f.api.prepare({
    recordId: record.id,
    expectedRecord: record.token!,
    operationId: "cancel-outdated",
    action: "cancel",
    values: {},
    knowers: [],
  });
  await f.api.apply(cancel.id, cancel.token);
  assert.equal((await f.read()).projects.find((p) => p.id === "repair-renovation")!.status, "cancelled");
});
await runCase("native-repair/visitor-controls", async () => {
  const f = await fixture();
  await f.repository.mutateAuthority(
    (state) => {
      const copy = state.villagers[0]!;
      state.visitors = [
        {
          ...structuredClone(copy),
          characterId: "guest-one",
          cardSnapshot: { ...copy.cardSnapshot, id: "guest-one" },
          incarnation: "guest-one",
          visitsEnabled: true,
          visitsRevision: "one",
          trip: { arrivedAt: "2026-11-20T10:00:00.000Z", leavesAt: "2026-11-21T10:00:00.000Z" },
        },
        {
          ...structuredClone(copy),
          characterId: "guest-two",
          cardSnapshot: { ...copy.cardSnapshot, id: "guest-two" },
          incarnation: "guest-two",
          visitsEnabled: true,
          visitsRevision: "two",
          trip: { arrivedAt: "2026-11-22T10:00:00.000Z", leavesAt: "2026-11-23T10:00:00.000Z" },
        },
      ];
    },
    { memories: true },
  );
  const id = repairId("visitor", "guest-one"),
    record = await f.api.inspect(id);
  const local = (await import("../packages/villages/src/server/domain/rules/repair-time.js")).repairLocalTime;
  const zone = (await f.read()).timeZone;
  await assert.rejects(
    () =>
      f.api.prepare({
        recordId: id,
        expectedRecord: record.token!,
        operationId: "guest-overlap",
        action: "correct",
        values: { leavesAt: local("2026-11-22T11:00:00.000Z", zone) },
        knowers: [],
      }),
    /Another Visitor/,
  );
  const review = await f.api.prepare({
    recordId: id,
    expectedRecord: record.token!,
    operationId: "guest-disable",
    action: "correct",
    values: { visitsEnabled: false },
    knowers: [],
  });
  await f.api.apply(review.id, review.token);
  f.reopen();
  assert.equal((await f.read()).visitors![0]!.visitsEnabled, false);
});

await runCase("native-repair/persona-capture", async () => {
  const f = await fixture();
  await f.repository.mutateAuthority((state) => {
    state.playerPersonaId = "persona";
    state.playerPersonaName = "Original name";
    state.playerPersonaIdentity = "Original identity";
  });
  const before = await f.read();
  const scene: any = { villageSeed: before.seed, placeId: before.venues[0]!.id, participants: [], activeIds: [] };
  scene.continuity = captureSceneContinuity(before, scene, Date.parse(at));
  const id = repairId("person", "player"),
    record = await f.api.inspect(id, "player");
  const review = await f.api.prepare({
    recordId: id,
    personId: "player",
    expectedRecord: record.token!,
    operationId: "persona-correction",
    action: "correct",
    values: { name: "Corrected name", description: "Corrected identity", background: "A corrected backstory" },
    knowers: [],
  });
  await f.api.apply(review.id, review.token);
  f.reopen();
  const after = await f.read();
  assert.equal(after.playerPersonaName, "Original name");
  assert.equal(readPlayerIdentity(after).name, "Corrected name");
  assert.equal(after.playerBackground, "A corrected backstory");
  assert.equal(readPlayerIdentity(sceneContinuityView(after, scene)).name, "Original name");
  const next = { ...scene, continuity: captureSceneContinuity(after, scene, Date.parse(later)) };
  assert.equal(readPlayerIdentity(sceneContinuityView(after, next)).name, "Corrected name");
  assert.equal(readPlayerIdentity({ ...after, playerPersonaId: "different" }).name, "Original name");
});
await runCase("native-repair/private-facets", async () => {
  const f = await fixture();
  let rootId = "";
  await f.repository.mutateAuthority(
    (state) => {
      rootId = addRepairMemory(state, "facet-parent", "mara", "Visit the fair", at, undefined, {
        class: "desire",
        subjects: [],
        current: true,
      })!;
      addRepairMemory(state, "facet-child", "mara", "The fair reminds me of home", at, undefined, {
        class: "information",
        subjects: [],
        current: true,
        parentId: rootId,
        facet: "reason",
      });
    },
    { memories: true },
  );
  const record = await f.api.inspect(repairId("memory", rootId), "mara");
  const review = await f.api.prepare({
    recordId: record.id,
    personId: "mara",
    expectedRecord: record.token!,
    operationId: "facet-metadata",
    action: "correct",
    values: { "subject:leo": true },
    knowers: ["mara"],
  });
  await f.api.apply(review.id, review.token);
  f.reopen();
  const state = await f.read(),
    wish = continuityWishes(state, "mara", later).find((w) => w.text === "Visit the fair")!;
  assert.notEqual(wish.wishId, rootId);
  assert.deepEqual(
    wish.details.map((d) => d.text),
    ["The fair reminds me of home"],
  );
  const holder = continuityActor(state, "mara")!;
  const recalled = selectActorContinuity(state.continuity, state.episodes, [holder], later, {
    query: "fair home",
    bytes: 12000,
    requiredIds: [wish.wishId],
    identity: (id) => continuityActor(state, id),
  });
  assert.ok(JSON.stringify(recalled).includes("The fair reminds me of home"));
  const player = continuityActor(state, "player")!;
  assert.equal(
    JSON.stringify(
      selectActorContinuity(state.continuity, state.episodes, [player], later, {
        query: "fair home",
        bytes: 12000,
        requiredIds: [],
        identity: (id) => continuityActor(state, id),
      }),
    ).includes("The fair reminds me of home"),
    false,
  );
  const transferRecord = await f.api.inspect(repairId("memory", wish.wishId), "mara");
  const transfer = await f.api.prepare({
    recordId: transferRecord.id,
    personId: "mara",
    expectedRecord: transferRecord.token!,
    operationId: "facet-owner",
    action: "correct",
    values: { ownerId: "leo" },
    knowers: ["mara"],
  });
  assert.ok(transfer.memory!.people.includes("Leo"));
  assert.ok(
    transfer.changes.some((change) => change.after.includes("The fair reminds me of home")),
    JSON.stringify(transfer.changes),
  );
  await f.api.apply(transfer.id, transfer.token);
  f.reopen();
  const moved = continuityWishes(await f.read(), "leo", later).find((w) => w.text === "Visit the fair")!;
  assert.deepEqual(
    moved.details.map((d) => d.text),
    ["The fair reminds me of home"],
  );
  assert.equal(
    continuityWishes(await f.read(), "mara", later).some((w) => w.text === "Visit the fair"),
    false,
  );
});
