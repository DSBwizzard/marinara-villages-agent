// Test cases: project-cancellation/late-room-change
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { fixture, renovation } from "./fixtures/villages-projects.fixture.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { zoneEventScene } from "../packages/villages/src/server/domain/rules/zone-events.js";
import { captureSceneContinuity } from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import {
  narrationContinuityContext,
  fittedNarrationReadset,
} from "../packages/villages/src/server/domain/rules/narration-context.js";
import { acceptNarration } from "../packages/villages/src/server/domain/rules/narration-native.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import {
  reconcileProjectLifecycles,
  PROJECT_DURATION_MS,
} from "../packages/villages/src/server/domain/rules/project-lifecycle-rules.js";

await runCase("project-cancellation/late-room-change", async () => {
  for (const mode of ["cancel", "complete", "removed-zone"]) {
    const f = fixture(),
      now = new Date("2026-10-24T00:00:00Z"),
      at = now.toISOString();
    const id = mode === "removed-zone" ? await renovation(f, { zones: [] }) : await f.newProject();
    if (mode !== "removed-zone") await f.service.startProjectConstruction(id, f.body(id), now);
    const venue = f.state().venues.find((row) => row.id === f.get(id).venueId)!;
    const zoneId = mode === "removed-zone" ? "common" : "exterior";
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
    const context = narrationContinuityContext(
      f.state(),
      scene,
      venue,
      "pending-mark",
      "I scratch a mark on the wall.",
      at,
    );
    const readset = fittedNarrationReadset(
      f.state(),
      context,
      context.parts.flatMap((part) => (part.block.evidenceId ? [part.block.evidenceId] : [])),
    );
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
    if (mode === "cancel") await f.service.cancelProject(id, f.body(id));
    else {
      if (mode === "removed-zone") {
        await f.agree(id);
        await f.service.startProjectConstruction(id, f.body(id), now);
      }
      await f.mutate((state) => reconcileProjectLifecycles(state, new Date(now.getTime() + PROJECT_DURATION_MS)));
      assert.equal(f.get(id).status, "complete");
    }
    const before = structuredClone(f.state());
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
