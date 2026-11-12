// Test cases: project-cancellation/late-room-change, project-cancellation/remove-room
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { fixture, renovation } from "./fixtures/villages-projects.fixture.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { coerceVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { zoneEventScene } from "../packages/villages/src/server/domain/rules/zone-events.js";
import { captureSceneContinuity } from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import {
  narrationContinuityContext,
  fittedNarrationReadset,
} from "../packages/villages/src/server/domain/rules/narration-context.js";
import { acceptNarration } from "../packages/villages/src/server/domain/rules/narration-native.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import {
  continuityHolderKey,
  continuityViews,
  protectContinuity,
} from "../packages/villages/src/server/domain/rules/continuity.js";
import { currentRoomViews } from "../packages/villages/src/server/domain/rules/continuity-retrieval.js";
import { assertContinuityRetention } from "../packages/villages/src/server/domain/rules/continuity-retention.js";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { sceneHistoryFixture } from "./helpers/scene-history-store.fixture.js";
import {
  initializeRoomContinuity,
  retainNativeFact,
  roomWasRemoved,
} from "../packages/villages/src/server/domain/rules/native-continuity.js";
import {
  reconcileProjectLifecycles,
  PROJECT_DURATION_MS,
} from "../packages/villages/src/server/domain/rules/project-lifecycle-rules.js";

await runCase("project-cancellation/late-room-change", async () => {
  for (const mode of ["cancel", "complete", "closed-zone", "removed-zone"]) {
    const f = fixture(),
      now = new Date("2026-10-24T00:00:00Z"),
      at = now.toISOString();
    const renovating = mode === "closed-zone" || mode === "removed-zone";
    const id = renovating ? await renovation(f, { zones: [] }) : await f.newProject();
    if (!renovating) await f.service.startProjectConstruction(id, f.body(id), now);
    const venue = f.state().venues.find((row) => row.id === f.get(id).venueId)!;
    const zoneId = renovating ? "common" : "exterior";
    const scene = zoneEventScene(
      coerceSession({
        version: 5,
        id: "worksite-scene",
        villageSeed: f.state().seed,
        placeId: venue.id,
        placeName: venue.name,
        zoneId,
        area: zoneId === "exterior" ? "outside" : "inside",
        status: "active",
        startedAt: at,
        lastActivityAt: at,
        sceneRevision: 1,
        participants: [],
        activeIds: [],
        sceneAttendance: { capturedAt: at, layout: captureSceneLayout(venue), occupants: [] },
      }),
      venue,
    );
    scene.continuity = captureSceneContinuity(f.state(), scene, now.getTime());
    const captureMark = (operation: string) => {
      const state = f.state();
      const context = narrationContinuityContext(state, scene, venue, operation, "I scratch a mark on the wall.", at);
      return fittedNarrationReadset(
        state,
        context,
        context.parts.flatMap((part) => (part.block.evidenceId ? [part.block.evidenceId] : [])),
      );
    };
    const readset = captureMark("pending-mark");
    const raw = {
      segments: [{ id: "mark", kind: "narration", text: "A scratch marks the wall.", requires: ["room-mark"] }],
      keep: [
        {
          id: "room-mark",
          for: "room",
          text: "A scratch marks the wall.",
          source: [{ segment: "mark", perceive: { kind: "seen", by: ["player"] } }],
        },
      ],
    };
    const publication = { raw, readset, responseDigest: memoryHash(raw) };
    const committed = structuredClone(f.state());
    assert.equal(
      acceptNarration(committed, publication, "late", at).held,
      false,
      "the original current room can accept this freeform change",
    );
    const captured = structuredClone(scene.continuity);
    if (mode === "complete") {
      const worksiteEdit = { ...publication, readset: captureMark("worksite-mark") };
      await f.mutate((state) => assert.equal(acceptNarration(state, worksiteEdit, "worksite-mark", at).held, false));
    }
    if (mode === "cancel") await f.service.cancelProject(id, f.body(id));
    else {
      if (renovating) {
        await f.agree(id);
        await f.service.startProjectConstruction(id, f.body(id), now);
      }
      if (mode !== "closed-zone") {
        await f.mutate((state) => reconcileProjectLifecycles(state, new Date(now.getTime() + PROJECT_DURATION_MS)));
        assert.equal(f.get(id).status, "complete");
      } else assert.equal(f.get(id).status, "working");
    }
    const before = structuredClone(f.state());
    if (mode === "complete") {
      const current = currentRoomViews(before.continuity, before.episodes, readset.admission.room!, at);
      assert(current.some((view) => view.version.text === "A scratch marks the wall."));
      assert(current.some((view) => view.version.text === "A clear entrance."));
    }
    const rejected = acceptNarration(f.state(), publication, "late", at);
    assert.equal(rejected.held, true, mode);
    assert(rejected.rejected.some((row) => /native structure|construction site/.test(row.reason)));
    assert.deepEqual(
      f.state(),
      before,
      "a rejected stale Room change cannot modify current native authority or continuity",
    );
    assert.deepEqual(scene.continuity, captured, "frozen source and draft remain recoverable");
    const independentRaw = {
      segments: [{ id: "mark", kind: "narration", text: "The player considers the site." }],
      keep: [
        { ...raw.keep[0], independent: true },
        {
          id: "intent",
          for: ["player"],
          owner: "player",
          class: "perspective",
          text: "I meant to leave a scratch on the wall.",
          source: [{ input: readset.source.input, ground: { kind: "private" } }],
        },
      ],
    };
    const independent = acceptNarration(
      f.state(),
      { ...publication, raw: independentRaw, responseDigest: memoryHash(independentRaw) },
      "independent",
      at,
    );
    assert.equal(independent.held, false, JSON.stringify(independent.rejected));
    assert(independent.acceptedIds.includes("intent") && !independent.acceptedIds.includes("room-mark"));
    const replay = { ...before, continuity: committed.continuity, episodes: committed.episodes };
    assert.equal(
      acceptNarration(replay, publication, "late", at).held,
      false,
      "committed replay remains final after later native changes",
    );
    assert.deepEqual(replay.episodes, committed.episodes);
  }
});

await runCase("project-cancellation/remove-room", async () => {
  const f = fixture(),
    now = new Date("2026-10-24T00:00:00Z"),
    at = now.toISOString(),
    room = { kind: "room" as const, placeId: "cafe", zoneId: "common" },
    key = continuityHolderKey(room);
  await f.mutate((state) => {
    state.venues[0].zones![1].image = { id: "room-art", ref: "global-gallery:room-art", url: "/gallery/room-art" };
    initializeRoomContinuity(state, "cafe", "common", "A shared room.", "founding", at);
    const initial = state.continuity.records[0];
    state.continuity = protectContinuity(
      state.continuity,
      { id: initial.id, recordRevision: initial.revision, heads: { [key]: initial.heads[key].revision } },
      [room],
      "forget-original-room",
      at,
      { forget: true },
    );
    retainNativeFact(
      state,
      {
        id: "painted-cafe",
        kind: "structure",
        targetId: '["cafe","common"]',
        revision: 1,
        text: "A painted bench.",
        witnesses: ["a"],
        observedBy: ["a"],
      },
      at,
      { room },
    );
    state.narrative = {
      version: 1,
      adoptedAt: at,
      revision: 1,
      weatherRevision: 0,
      weather: null,
      situations: [],
      receipts: [],
      conditions: [
        {
          id: "damp",
          revision: 1,
          situationId: "rain",
          venueId: "cafe",
          zoneId: "common",
          observation: "Damp floor.",
          remedy: "Dry the floor.",
          restriction: "ordinary-use",
          startsAt: at,
          endsAt: null,
          clearedAt: null,
        },
      ],
    };
  });
  const resident = continuityActor(f.state(), "a")!;
  const known = continuityViews(f.state().continuity, resident, at, new Set());
  assert.equal(known[0].version.text, "A painted bench.");
  const histories = structuredClone(f.state().episodes.records);
  const originalVenue = structuredClone(f.state().venues[0]);
  const project = await renovation(f, { zones: [] });
  await f.agree(project);
  await f.service.startProjectConstruction(project, f.body(project), now);
  const due = new Date(now.getTime() + PROJECT_DURATION_MS);
  await f.mutate((state) => reconcileProjectLifecycles(state, due));
  const storage = sceneHistoryFixture();
  let completed: ReturnType<typeof f.state>;
  try {
    const repository = createVillageRepository(() => storage.gate.documents);
    await repository.mutateAuthority((saved) => Object.assign(saved, f.state()), { memories: true });
    completed = await createVillageRepository(() => storage.gate.documents).readAuthority({ memories: true });
  } finally {
    storage.release();
    storage.gate.dispose();
  }
  assert.equal(f.get(project).status, "complete");
  assert.equal(roomWasRemoved(completed, "cafe", "common"), true);
  assert.equal(completed.venues[0].archivedZones?.[0]?.zone.image?.id, "room-art");
  assert.equal(currentRoomViews(completed.continuity, completed.episodes, room, due.toISOString()).length, 0);
  assert(
    completed.continuity.records.filter((record) => record.heads[key]).every((record) => !record.heads[key].current),
  );
  assert.deepEqual(completed.episodes.records.slice(0, histories.length), histories);
  const after = continuityViews(completed.continuity, resident, at, new Set());
  assert.deepEqual(after.find((view) => view.id === known[0].id)?.version, known[0].version);
  assert(!continuityViews(completed.continuity, continuityActor(completed, "player")!, at, new Set()).length);
  assert.equal(completed.narrative!.conditions[0].clearedAt, due.toISOString());
  const revived = structuredClone(completed.continuity);
  revived.records.find((record) => record.heads[key])!.heads[key].current = true;
  assert.throws(() => assertContinuityRetention(revived, completed.episodes), /removed Room still has a current head/);
  const forged = structuredClone(completed.episodes);
  forged.records.find((episode) =>
    episode.commandReceipts[0]?.id.startsWith("room-removed:"),
  )!.commandReceipts[0].targetId = '["cafe","exterior"]';
  assert.throws(() => assertContinuityRetention(completed.continuity, forged), /invalid native Room removal receipt/);
  assert.throws(
    () => coerceVillageState({ ...completed, venues: [originalVenue] }),
    /removed Room is still in the live layout/,
  );
  await assert.rejects(
    renovation(f, {
      zones: [{ id: "common", name: "New room", kind: "public", venueClass: "community", description: "A new room." }],
    }),
    /removed Zone ID cannot be reused/,
  );
});
