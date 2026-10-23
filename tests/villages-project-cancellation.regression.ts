import assert from "node:assert/strict";
import { fixture } from "./fixtures/villages-projects.fixture.js";
import { createSceneCommands } from "../packages/villages/src/server/features/scenes/command-service.js";
import { captureSceneContinuity } from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import { createExchangeProcessing } from "../packages/villages/src/server/domain/decoding/exchange-codec.js";
import { semanticBlocker } from "../packages/villages/src/server/domain/rules/semantic-continuity.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
const f = fixture(),
  id = await f.newProject();
await f.service.startProjectConstruction(id, f.body(id));
const scene = coerceSession({
  id: "worksite-scene",
  villageSeed: f.state().seed,
  placeId: f.get(id).venueId,
  zoneId: "exterior",
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
    sceneChange: { narration: "A mark is left.", sceneNote: "A fresh mark." },
    physicalOutcomeVersion: 1,
    replyLineIds: ["reply"],
    areaAtTurn: "outside",
    zoneIdAtTurn: "exterior",
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
await f.service.cancelProject(id, f.body(id));
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
  coordinateVenue: async (_id: any, _request: any, _kind: any, _input: any, _revision: any, _attempt: any, work: any) =>
    work(),
} as any);
const replay = commands.sceneReplayEffects();
await replay.applyVenueTurnChange(scene, scene.submissions[0]);
await replay.applyVenueTurnChange(scene, scene.submissions[0]);
assert.equal(f.state().exchangeReceipts["venue-chat:worksite-scene:late"].status, "rejected");
assert.match(f.state().exchangeReceipts["venue-chat:worksite-scene:late"].reason, /Project cancelled/);
assert.equal(f.state().venueEvents.length, 0, "rejected late effects never prove physical Wish outcomes");
assert(!f.state().venues.some((venue) => venue.id === scene.placeId));
scene.submissions[0].processing!.domains.projects.status = "rejected";
await commands.finishSemanticScene(scene.id);
assert.equal(semanticBlocker(scene), null, "terminal cancellation permits Scene conclusion");
await commands.closeVenueSession(scene.id);
assert.equal(scene.status, "closed");
assert.deepEqual(scene.continuity, before);
assert.deepEqual(scene.lines, transcript);
console.log("Cancelled-site late physical effects are rejected exactly once; captured Scenes can conclude.");
