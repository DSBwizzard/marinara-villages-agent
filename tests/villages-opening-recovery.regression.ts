import assert from "node:assert/strict";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { initialOpening } from "../packages/villages/src/server/domain/rules/opening-project.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import {
  createSceneCommands,
  type SceneCommandPorts,
} from "../packages/villages/src/server/features/scenes/command-service.js";
import {
  createLiveScenes,
  type LiveScenePorts,
} from "../packages/villages/src/server/features/scenes/live-session-service.js";
import { createSceneQueryService } from "../packages/villages/src/server/features/scenes/scene-query-service.js";
import { createExchangeProcessing } from "../packages/villages/src/server/domain/decoding/exchange-codec.js";
import { ACTIVE_ID, SESSION_KIND } from "../packages/villages/src/server/adapters/storage/scene-slots.js";

const state = defaultVillageState();
state.seed = "recovery-village";
state.opening = initialOpening(["resident"], "community", "recovery-opening");
state.opening.gatheringSceneId = "gathering";
state.venues = [
  {
    id: "community",
    classes: ["community"],
    name: "Meeting Hall",
    form: "An established hall",
    description: "An entrance",
    presentation: { x: 0.5, y: 0.5, image: null },
    occupancy: { playerHome: false, residentCharacterId: null },
    spaces: [defaultVenueSpace("community", "A common room")],
    state: { condition: "Open", publicFacts: [], furniture: [], upgrades: [], updatedAt: "" },
  },
] as any;
const old = new Date(Date.now() - 3_600_000).toISOString();
let saved = coerceSession({
  id: "gathering",
  placeId: "community",
  placeName: "Meeting Hall",
  zoneId: "community",
  spaceClass: "community",
  area: "public",
  status: "active",
  startedAt: old,
  lastActivityAt: old,
  processingVersion: 1,
  villageSeed: state.seed,
  openingGatheringId: state.opening.id,
  sceneAttendance: { capturedAt: old, occupants: [] },
  lines: [
    {
      id: "original",
      role: "user",
      speakerId: "player",
      name: "Player",
      content: "I remember this conversation.",
      heardBy: [],
      at: old,
    },
  ],
});
let pointer = { sessionId: saved.id, placeId: saved.placeId };
const mutateVillageState = async (mutate: (value: typeof state) => void) => {
  mutate(state);
  return state;
};
const live = createLiveScenes({
  readActive: async () => pointer,
  readSession: async () => saved,
  changeSession: async (_id, change) => {
    change(saved);
    return saved;
  },
  clearActivePointer: async () => {
    pointer = { sessionId: "", placeId: "" };
  },
  hasVenueOperation: () => false,
  readVillageState: async () => state,
  mutateVillageState,
  villagesDocuments: () => ({
    getById: async () => {
      throw Error("A gathering with completed conversation must not be deleted");
    },
    remove: async () => {
      throw Error("Unexpected deletion");
    },
  }),
} as LiveScenePorts);
assert.equal(await live.activeVenueSession(), null);
assert.equal(saved.status, "closed");
assert.equal(state.opening.stage, "conversations");
assert.equal(saved.lines[0].content, "I remember this conversation.");

// Simulate a crash after closing the Scene and clearing its pointer, before the opening write.
state.opening.stage = "gathering";
let sceneWrites = 0;
const commands = createSceneCommands({
  activationScope: () => undefined,
  sceneWork: () => ({ serializeNavigation: async (work: () => Promise<unknown>) => work() }),
  readActive: async () => pointer,
  activeVenueSession: async () => null,
  hasVenueOperation: () => false,
  rollActiveAgendas: async () => false,
  readVillageState: async () => state,
  mutateVillageState,
  readSession: async () => saved,
  refreshZoneParticipants: async (scene: typeof saved) => scene,
  mutateDocument: async (id: string, _slot: unknown, mutate: (value: typeof pointer) => void) => {
    assert.equal(id, ACTIVE_ID, "recovery cannot replace a saved Scene");
    sceneWrites++;
    mutate(pointer);
  },
} as unknown as SceneCommandPorts);
const resumed = await commands.enterVenue("community", "community");
assert.equal(resumed.id, "gathering");
assert.equal(resumed.lines[0].content, "I remember this conversation.");
assert.equal(state.opening.stage, "conversations");
assert.equal(sceneWrites, 0, "a closed gathering is never restaged or regenerated");

// A saved live Scene with a missing pointer is reattached intact.
state.opening.stage = "gathering";
saved = { ...saved, status: "active", endedAt: "", lastActivityAt: new Date().toISOString() };
await commands.enterVenue("community", "community");
assert.equal(pointer.sessionId, "gathering");
assert.equal(saved.lines.length, 1);
assert.equal(sceneWrites, 1, "only the pointer is restored");

// A failed opening-receipt write stays discoverable even after other exchange domains finished.
const processing = createExchangeProcessing({
  seed: state.seed,
  sceneId: "gathering",
  submissionId: "use",
  order: 0,
  lineIds: [],
  actionReceiptIds: [],
});
for (const domain of Object.values(processing.domains)) domain.status = "applied";
saved.submissions = [
  {
    id: "use",
    mode: "chat",
    message: "We watch together.",
    targetId: "",
    verdict: null,
    wishId: "",
    wishMemory: "",
    processing,
    openingContext: { stage: "first-use", projectId: "project" },
    openingSignal: { kind: "first-use", residentId: "", quote: "The film begins.", playerQuote: "We watch together." },
  },
];
const queries = createSceneQueryService({
  readSession: async () => saved,
  readVillageState: async () => state,
  villagesDocuments: () => ({
    list: async (_packageId: string, kind: string) => {
      assert.equal(kind, SESSION_KIND);
      return [{ data: saved }];
    },
  }),
} as any);
assert.ok((await queries.progressBacklog()).some((entry) => entry.submissionId === "use"));
saved.submissions[0].openingProcessedAt = new Date().toISOString();
assert.ok(!(await queries.progressBacklog()).some((entry) => entry.submissionId === "use"));
console.log(
  "Opening recovery passed: inactivity, missing-pointer recovery, transcript preservation and interrupted opening receipts.",
);
