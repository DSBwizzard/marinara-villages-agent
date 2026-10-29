import {
  reconcileProjectLifecycles,
  PROJECT_DURATION_MS,
} from "../packages/villages/src/server/domain/rules/project-lifecycle-rules.js";
import assert from "node:assert/strict";
import { fixture, renovation } from "./fixtures/villages-projects.fixture.js";
import { createSceneCommands } from "../packages/villages/src/server/features/scenes/command-service.js";
import { captureSceneContinuity } from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import { createExchangeProcessing } from "../packages/villages/src/server/domain/decoding/exchange-codec.js";
import { semanticBlocker } from "../packages/villages/src/server/domain/rules/semantic-continuity.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
for (const mode of ["cancel", "complete", "removed-zone"]) {
  const f = fixture(),
    now = new Date("2026-10-24T00:00:00Z");
  const id = mode === "removed-zone" ? await renovation(f, { zones: [] }) : await f.newProject();
  if (mode !== "removed-zone") await f.service.startProjectConstruction(id, f.body(id), now);
  const scene = coerceSession({
    version: 3,
    id: "worksite-scene",
    villageSeed: f.state().seed,
    placeId: f.get(id).venueId,
    zoneId: mode === "removed-zone" ? "common" : "exterior",
    area: "outside",
    status: "active",
    startedAt: new Date().toISOString(),
    participants: [],
    activeIds: [],
    lines: [
      {
        id: "reply",
        role: "assistant",
        kind: "narration",
        content: "The player leaves a mark on the site.",
        at: new Date().toISOString(),
      },
    ],
  });
  scene.continuity = captureSceneContinuity(f.state(), scene, Date.now());
  const processing = createExchangeProcessing({
    seed: f.state().seed,
    sceneId: scene.id,
    submissionId: "late",
    order: 0,
    lineIds: ["reply"],
    actionReceiptIds: [],
  });
  for (const domain of Object.values(processing.domains)) domain.status = "applied";
  scene.submissions = [
    {
      id: "late",
      mode: "act",
      message: "Leave a mark",
      at: new Date().toISOString(),
      processing,
      action: { happened: true, narration: "The player leaves a mark on the site." },
      placeUpdate: { narration: "A mark is left.", expectedRevision: 0, recent: { text: "A fresh mark." } },
      physicalOutcomeVersion: 1,
      replyLineIds: ["reply"],
      areaAtTurn: "outside",
      zoneIdAtTurn: mode === "removed-zone" ? "common" : "exterior",
      semanticReady: false,
      semanticProvenance: {
        version: 2,
        sourceHash: "late-source",
        authority: { physical: true, projects: false, access: false, standing: false },
      },
    },
  ];
  const before = structuredClone(scene.continuity),
    transcript = structuredClone(scene.lines);
  if (mode === "cancel") await f.service.cancelProject(id, f.body(id));
  else {
    if (mode === "removed-zone") {
      await f.agree(id);
      await f.service.startProjectConstruction(id, f.body(id), now);
    }
    await f.mutate((state) => reconcileProjectLifecycles(state, new Date(now.getTime() + PROJECT_DURATION_MS)));
    assert.equal(f.get(id).status, "complete");
  }
  const liveBefore = structuredClone(f.state().venues);
  const commands = createSceneCommands({
    bindReplayEffects: (value: any) => value,
    readVillageState: async () => f.state(),
    readSession: async () => scene,
    mutateVillageState: f.mutate,
    changeSession: async (_id: string, change: any) => {
      change(scene);
      return scene;
    },
    processSavedExchange: async () => {},
    clearActivePointer: async () => {},
    pruneVenueVisits: async () => {},
    coordinateVenue: async (
      _id: any,
      _request: any,
      _kind: any,
      _input: any,
      _revision: any,
      _attempt: any,
      work: any,
    ) => work(),
  } as any);
  const replay = commands.sceneReplayEffects();
  await replay.applyVenueTurnChange(scene, scene.submissions[0]);
  await replay.applyVenueTurnChange(scene, scene.submissions[0]);
  assert.equal(f.state().exchangeReceipts["venue-chat:worksite-scene:late"].status, "rejected");
  assert.match(f.state().exchangeReceipts["venue-chat:worksite-scene:late"].reason, /cancelled|structure changed/);
  assert.equal(f.state().venueEvents.length, 0, "rejected late effects never prove physical Wish outcomes");
  assert.deepEqual(f.state().venues, liveBefore, "late effects cannot modify the completed/current structure");
  scene.submissions[0].processing!.domains.projects.status = "rejected";
  await commands.finishSemanticScene(scene.id);
  assert.equal(semanticBlocker(scene), null, "terminal cancellation permits Scene conclusion");
  await commands.closeVenueSession(scene.id);
  assert.equal(scene.status, "closed");
  assert.deepEqual(scene.continuity, before);
  assert.deepEqual(scene.lines, transcript);
}
console.log(
  "Cancelled sites, completed worksites and removed Zones reject late physical effects exactly once; captured Scenes can conclude.",
);
