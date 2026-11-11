// Test cases: native-repair/common-books, native-repair/undo, native-repair/repeated-undo, native-repair/offer-undo, native-repair/room, native-repair/circumstance, native-repair/founding-circumstance, native-repair/protected-circumstance, native-repair/stale, native-repair/checkpoint, native-repair/missing-page, native-repair/pending-target, native-repair/unread-targets, native-repair/recovery, native-repair/plan-allowance
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
import { establishPlace } from "../packages/villages/src/server/domain/rules/place-discovery.js";
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
import { continuityViews, continuityProtectionUnits } from "../packages/villages/src/server/domain/rules/continuity.js";
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
      resumeProject: async () => {
        throw Error("no Project work");
      },
      cancelProject: async () => {
        throw Error("no Project work");
      },
      replaySaved: async () => {
        throw Error("no Scene work");
      },
    });
  let api = service();
  await repository.mutateAuthority(
    (state) => {
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
    record = (await f.api.list("places")).records.find((row) => row.summary === "Room description")!;
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
    state.venues = [venueFixture({ id: "hall", name: "Hall" })];
  });
  const checkpoint = await f.api.createCheckpoint("Before edit", "before-edit"),
    record = await wishRecord(f),
    original = await f.read();
  const access = {
    action: "venue-policy" as const,
    operationId: "hall-hours",
    expectedRevision: original.venues[0].access!.revision,
    zoneId: null,
    managerIds: ["player"],
    visitorHours: [],
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
      state.venues = [venueFixture({ id: "square", name: "Square", category: "public" })];
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
