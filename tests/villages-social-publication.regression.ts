import assert from "node:assert/strict";
import { createExchangeProcessing } from "../packages/villages/src/server/domain/decoding/exchange-codec.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { bindLiveProposals } from "../packages/villages/src/server/domain/rules/live-exchange.js";
import { projectRelationshipProfiles } from "../packages/villages/src/server/domain/rules/relationship-knowledge.js";
import { defaultRelationshipState } from "../packages/villages/src/server/domain/rules/relationship-rules.js";
import { completeResidenceMove } from "../packages/villages/src/server/domain/rules/residence-move.js";
import { captureSceneContinuity } from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import { sceneAccessState } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { sceneMemoryContext } from "../packages/villages/src/server/domain/rules/scene-memories.js";
import {
  evaluateZoneAccess,
  initializeVenueAccess,
  settleStandingAccess,
} from "../packages/villages/src/server/domain/rules/venue-access.js";
import { venueZones } from "../packages/villages/src/server/domain/rules/venue-zones.js";
import { createLiveMemory } from "../packages/villages/src/server/features/residents/live-memory-service.js";
import { createSceneChanges } from "../packages/villages/src/server/features/scenes/changes-service.js";
import { createSceneCommands } from "../packages/villages/src/server/features/scenes/command-service.js";
import { elapsed, socialWorldFixture } from "./fixtures/social-world.fixture.js";
const village = socialWorldFixture();
village.seed = "publication";
let scene = coerceSession({
  version: 3,
  id: "scene",
  villageSeed: village.seed,
  status: "active",
  lines: [],
  submissions: [
    {
      id: "source",
      at: new Date().toISOString(),
      semanticProvenance: {
        version: 2,
        sourceHash: "meaning",
        developmentVersion: 1,
        authority: { social: true, physical: false, access: false, projects: false, standing: false },
      },
    },
  ],
});
scene.lines = [
  { id: "disclose", speakerId: "a", kind: "dialogue", content: "I want to move to Bram's home.", heardBy: ["a", "b"] },
  { id: "refuse", speakerId: "b", kind: "dialogue", content: "I no longer agree to this move.", heardBy: ["a", "b"] },
] as any;
village.relationshipContext = defaultRelationshipState(village.seed);
scene.lines = scene.lines.map((line) => ({ ...line, role: "assistant", playerHeard: true }));
const turn = scene.submissions[0]!;
const native = sceneMemoryContext(village, ["player"], "move");
turn.liveProposals = bindLiveProposals(
  {
    memoryContexts: { [native.saved.protection.fingerprint]: native.saved },
    memoryChanges: [
      {
        action: "create",
        kind: "information",
        text: "Bram refused Ada's proposed move.",
        subjects: ["a", "b"],
        learners: {
          player: {
            basis: "report",
            attributedTo: "b",
            support: [{ lineId: 1, excerpt: scene.lines[1]!.content }],
            disclosed: {
              title: "Move to Bram’s home",
              status: "stalled",
              agreementActorId: "b",
              agreementName: "Bram",
              decision: "refuse",
            },
          },
        },
        screening: { disposition: "clear", protectedRoots: [], fingerprint: native.saved.protection.fingerprint },
      },
    ],
    relationshipChanges: {
      changes: [],
      permissions: [],
      disclosures: [
        { fromId: "a", toId: "player", text: "I want to move to Bram’s home.", kind: "preference", lineIds: [0] },
      ],
    },
  },
  "",
  scene.lines.map((l) => l.id),
  scene.lines,
);
turn.processing = createExchangeProcessing({
  seed: village.seed,
  sceneId: scene.id,
  submissionId: turn.id,
  order: 0,
  lineIds: [],
  actionReceiptIds: [],
});
for (const domain of Object.values(turn.processing.domains)) domain.status = "applied";
turn.processing.domains.relationships.status = "failed";
let failScene = true,
  failWorld = false,
  failMemoryAck = false,
  worldWrites = 0;
const read = async () => structuredClone(village),
  readSession = async () => structuredClone(scene);
const mutate = async (update: any) => {
  if (failWorld) {
    failWorld = false;
    throw Error("World publication write failed");
  }
  const next = structuredClone(village);
  update(next);
  Object.assign(village, next);
  worldWrites++;
  return read();
};
const localMemory = createLiveMemory({
  mutateVillageState: async (fn: any) => {
    fn(village);
    return read();
  },
} as any);
Object.assign(turn.processing!.domains.memories, await localMemory.processLiveMemories(scene, turn.id));
assert(
  !village.memories.records.some((row) => row.knowers.player),
  "Held sources cannot teach native player Memories before publication",
);
const commands = createSceneCommands({
  readSession,
  readVillageState: read,
  mutateVillageState: mutate,
  changeSession: async (_id: string, update: any) => {
    if (failScene) {
      failScene = false;
      throw Error("Scene acknowledgement failed");
    }
    const next = structuredClone(scene);
    update(next);
    if (failMemoryAck && next.submissions[0]!.processing!.domains.memories.status !== "pending") {
      failMemoryAck = false;
      throw Error("Memory acknowledgement failed");
    }
    scene = next;
    return readSession();
  },
} as any);
await commands.finishSemanticScene(scene.id);
assert(!scene.submissions[0]!.semanticReady, "A social hold keeps the mixed source unpublished");
assert.equal(village.socialPublications?.["scene:source"], undefined);
scene.submissions[0]!.processing!.domains.relationships.status = "applied";
await assert.rejects(() => commands.finishSemanticScene(scene.id), /Scene acknowledgement failed/);
assert.equal(village.socialPublications?.["scene:source"], undefined);
assert.equal(worldWrites, 0);
assert(!scene.submissions[0]!.semanticReady, "Failed transcript publication cannot reveal notebook knowledge");
failWorld = true;
await assert.rejects(() => commands.finishSemanticScene(scene.id), /World publication write failed/);
assert.equal(scene.submissions[0]!.semanticReady, true);
assert.equal(village.socialPublications?.["scene:source"], undefined);
assert.throws(() => completeResidenceMove(village, "a", false, new Date(elapsed(4))), /not moving/);
const changes = createSceneChanges({
  readSession,
  readVillageSnapshot: read,
  readVillageState: read,
  mutateVillageState: mutate,
  finishSemanticScene: commands.finishSemanticScene,
  processSavedExchange: async (_id: string, submissionId: string) => {
    const target = scene.submissions.find((row) => row.id === submissionId)!;
    Object.assign(target.processing!.domains.memories, await localMemory.processLiveMemories(scene, submissionId));
  },
  villagesDocuments: () => ({ list: async () => [] }),
  venueRequestMetrics: () => [],
} as any);
failMemoryAck = true;
await assert.rejects(() => changes.replaySceneChanges(scene.id), /Memory acknowledgement failed/);
assert.equal(village.socialPublications?.["scene:source"], true);
assert.equal(scene.submissions[0]!.processing!.domains.memories.status, "pending");
await changes.replaySceneChanges(scene.id);
assert.equal(
  scene.submissions[0]!.processing!.domains.memories.status,
  "applied",
  "Replay repairs lost native Memory metadata acknowledgment without re-inference",
);
assert.equal(
  village.socialPublications?.["scene:source"],
  true,
  "Explicit replay repairs a lost knowledge acknowledgement after the source is ready",
);
assert.equal(
  projectRelationshipProfiles(village.relationshipContext!, village).find((p) => p.characterId === "a")!.learned.length,
  1,
  "Acknowledgment publishes the source into native Memories",
);
const after = worldWrites;
await changes.replaySceneChanges(scene.id);
assert.equal(worldWrites, after, "Published source replay is a read-only no-op");
{
  let world = socialWorldFixture(),
    social = defaultRelationshipState(world.seed);
  const home = world.venues[1]!;
  home.zones = venueZones(home);
  initializeVenueAccess(home);
  const zone = home.zones.find((z) => z.kind === "shared-residence")!;
  let current = coerceSession({
    version: 3,
    id: "standing-scene",
    villageSeed: world.seed,
    placeId: home.id,
    zoneId: "exterior",
    status: "active",
    startedAt: elapsed(1),
    lines: [],
    submissions: [],
  });
  current.continuity = captureSceneContinuity(
    { ...world, relationshipContext: social },
    current,
    Date.parse(elapsed(1)),
  );
  let failCaptured = true;
  const readWorld = async () => ({ ...structuredClone(world), relationshipContext: structuredClone(social) });
  const mutateWorld = async (fn: any) => {
    const next = structuredClone(world);
    fn(next);
    world = next;
    return readWorld();
  };
  const savedScene = async () => structuredClone(current);
  const live = createLiveMemory({
    readVillageState: readWorld,
    readVillageAuthority: readWorld,
    mutateVillageState: mutateWorld,
    mutateRelationships: async (_seed: string, fn: any) => {
      const next = structuredClone(social);
      await fn(next);
      social = next;
      return structuredClone(social);
    },
  } as any);
  const sourceCommands = createSceneCommands({
    readSession: savedScene,
    readVillageState: readWorld,
    mutateVillageState: mutateWorld,
    changeSession: async (_id: string, fn: any) => {
      const next = structuredClone(current);
      fn(next);
      if (failCaptured && next.continuity?.facts.venues[1]!.access!.permissions.length) {
        failCaptured = false;
        throw Error("Captured permission acknowledgement failed");
      }
      current = next;
      return savedScene();
    },
  } as any);
  const capturedAllowed = () => {
    const captured = sceneAccessState({ ...world, relationshipContext: social }, current).venues[1]!;
    return evaluateZoneAccess(
      captured,
      captured.zones!.find((z) => z.id === zone.id)!,
      "player",
      { sceneId: current.id, at: new Date(elapsed(1)) },
    ).allowed;
  };
  assert.equal(capturedAllowed(), false);
  for (const action of ["grant", "revoke"] as const) {
    const id = action,
      lineId = action + "-words";
    current.lines.push({
      id: lineId,
      role: "assistant",
      speakerId: "b",
      kind: "dialogue",
      content:
        action === "grant" ? "You may enter my shared room whenever you like." : "I withdraw that standing permission.",
      heardBy: ["b"],
      at: elapsed(1),
    } as any);
    const source: any = {
      id,
      at: elapsed(1),
      semanticProvenance: {
        version: 2,
        sourceHash: id,
        authority: { social: true, standing: true, physical: false, projects: false, access: false },
      },
      liveProposals: {
        version: 1,
        memoryChanges: [],
        earlierLineIds: [],
        memoryVersions: {},
        playerLineId: "",
        replyLineIds: [lineId],
        relationshipChanges: {
          changes: [],
          disclosures: [],
          permissions: [
            { controllerId: "b", visitorId: "player", venueId: home.id, zoneId: zone.id, action, lineIds: [lineId] },
          ],
        },
      },
    };
    source.liveProposals = bindLiveProposals(source.liveProposals, "", [lineId], current.lines);
    source.processing = createExchangeProcessing({
      seed: world.seed,
      sceneId: current.id,
      submissionId: id,
      order: current.submissions.length,
      lineIds: [lineId],
      actionReceiptIds: [],
    });
    current.submissions.push(source);
    const outcome = await live.processLiveRelationships(current, id);
    Object.assign(source.processing.domains.relationships, outcome);
    if (action === "grant") {
      await assert.rejects(
        () => sourceCommands.finishSemanticScene(current.id),
        /Captured permission acknowledgement failed/,
      );
      assert.equal(capturedAllowed(), false);
    }
    await sourceCommands.finishSemanticScene(current.id);
    assert.equal(capturedAllowed(), action === "grant", JSON.stringify(current.continuity!.facts.venues[1]!.access));
    const saved = JSON.stringify(current.continuity!.facts.venues[1]!.access);
    await sourceCommands.finishSemanticScene(current.id);
    assert.equal(
      JSON.stringify(current.continuity!.facts.venues[1]!.access),
      saved,
      "Captured grant/revoke recovery is idempotent",
    );
    if (action === "grant") {
      settleStandingAccess(
        world.venues[1]!,
        {
          id: "offscreen-revoke",
          controllerId: "b",
          visitorId: "player",
          zoneId: zone.id,
          action: "revoke",
          lineIds: ["other-scene"],
        },
        elapsed(2),
        ["player", "a", "b", "c"],
      );
      assert.equal(evaluateZoneAccess(world.venues[1]!, zone, "player").allowed, false);
      assert.equal(capturedAllowed(), true, "Unrelated later access changes cannot rewrite the active Scene");
    }
  }
}
console.log("Social publication: failed transcript ack, lost knowledge ack and explicit local replay passed.");
