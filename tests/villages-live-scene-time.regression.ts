import assert from "node:assert/strict";
import { configureVillageClock } from "../packages/villages/src/server/adapters/time/clock-gate.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { captureSceneAttendance } from "../packages/villages/src/server/domain/rules/scene-attendance.js";
import {
  captureSceneContinuity,
  sceneContinuityView,
} from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import { applySceneMutation } from "../packages/villages/src/server/domain/rules/scene-mutation.js";
import { publicSceneAuthority } from "../packages/villages/src/server/domain/rules/scene-public.js";
import { sceneWritingHistory } from "../packages/villages/src/server/domain/rules/scene-writing-history.js";
import { createLiveScenes } from "../packages/villages/src/server/features/scenes/live-session-service.js";
import { initializeVenueAccess } from "../packages/villages/src/server/domain/rules/venue-access.js";
import { sceneHaltWorldConflict } from "../packages/villages/src/server/domain/rules/scene-halt-world.js";

let now = new Date("2026-11-02T09:50:00Z");
const releaseClock = configureVillageClock({
  now: () => new Date(now),
  observe: async () => ({ paused: false }) as any,
  resolve: async () => {
    throw Error("No clock administration in this test");
  },
});
function fixture(live = true) {
  const world = coerceVillageState({
    ...defaultVillageState(),
    seed: "live-time",
    foundedAt: "2026-11-01T00:00:00Z",
    timeZone: "UTC",
    venues: [
      { id: "garden", name: "Garden", classes: ["community"], description: "Garden benches" },
      { id: "work", name: "Café", classes: ["workplace"], description: "A café" },
    ],
    villagers: ["Maya", "Jimmy"].map((name) => ({
      characterId: name.toLowerCase(),
      addedAt: now.toISOString(),
      cardSnapshot: {
        id: name.toLowerCase(),
        name,
        capturedAt: now.toISOString(),
        revision: 1,
        sourceStatus: "available",
      },
    })),
  });
  world.villagers[0]!.agenda = {
    routineSummary: "Work at ten",
    source: "village",
    generatedAt: "",
    day: [
      { startMinute: 0, endMinute: 600, venueId: "garden", zoneId: "community", activity: "Gardening" },
      { startMinute: 600, endMinute: 1440, venueId: "work", zoneId: "workplace", activity: "Working" },
    ],
  };
  world.villagers[1]!.agenda = {
    routineSummary: "A garden visit",
    source: "village",
    generatedAt: "",
    day: [
      { startMinute: 0, endMinute: 690, venueId: "work", zoneId: "workplace", activity: "Working" },
      { startMinute: 690, endMinute: 750, venueId: "garden", zoneId: "community", activity: "Reading" },
      { startMinute: 750, endMinute: 1440, venueId: "work", zoneId: "workplace", activity: "Working" },
    ],
  };
  let scene = coerceSession({
    version: 3,
    id: "visit",
    villageSeed: world.seed,
    placeId: "garden",
    placeName: "Garden",
    ...(live ? { liveSceneVersion: 1 } : {}),
    status: "active",
    zoneId: "community",
    area: "public",
    startedAt: now.toISOString(),
    lastActivityAt: now.toISOString(),
    sceneAttendance: captureSceneAttendance(world, "garden", now),
    activeIds: ["maya"],
    participants: [{ characterId: "maya", name: "Maya", doing: "Gardening" }],
    lines: [
      {
        id: "invitation",
        role: "assistant",
        speakerId: "maya",
        name: "Maya",
        kind: "dialogue",
        content: "Dinner tomorrow?",
        at: now.toISOString(),
        heardBy: ["maya"],
        zoneId: "community",
      },
    ],
  });
  scene.continuity = captureSceneContinuity(world, scene, now.getTime());
  let busy = false;
  const service = createLiveScenes({
    readActive: async () => ({ sessionId: scene.id, placeId: scene.placeId }),
    readSession: async () => structuredClone(scene),
    changeSession: async (_id, change) => {
      applySceneMutation(scene, scene.id, change);
      return structuredClone(scene);
    },
    clearActivePointer: async () => {
      throw Error("Presence must not end the player's Venue visit");
    },
    hasVenueOperation: () => busy,
    readVillageState: async () => structuredClone(world),
    mutateVillageState: async (change) => {
      await change(world);
      return structuredClone(world);
    },
  });
  return {
    world,
    service,
    get scene() {
      return scene;
    },
    restart() {
      scene = coerceSession(JSON.parse(JSON.stringify(scene)));
    },
    setBusy(value: boolean) {
      busy = value;
    },
  };
}
try {
  const f = fixture();
  assert.deepEqual(
    Object.keys(f.world.memoryScenes),
    [],
    "live Scenes do not reserve an encounter-wide Memory baseline",
  );
  now = new Date("2026-11-02T09:57:00Z");
  await f.service.activeVenueSession();
  const admitted = structuredClone(f.scene);
  const expected = f.scene.sceneRevision;
  f.setBusy(true);
  now = new Date("2026-11-02T10:05:00Z");
  await f.service.activeVenueSession();
  assert.deepEqual(f.scene.activeIds, ["maya"], "admitted exchange keeps original attendance until it settles");
  f.setBusy(false);
  await f.service.activeVenueSession();
  assert.deepEqual(f.scene.activeIds, [], "Maya leaves without requiring another player message");
  assert.equal(f.scene.zoneId, "community", "the player remains in the garden");
  assert(f.scene.sceneRevision > expected, "a stale send cannot use its old audience revision");
  assert.deepEqual(admitted.activeIds, ["maya"]);
  assert.equal(admitted.continuity!.capturedAt, "2026-11-02T09:57:00.000Z");
  now = new Date("2026-11-02T11:57:00Z");
  f.restart();
  await f.service.activeVenueSession();
  assert.deepEqual(f.scene.activeIds, ["jimmy"]);
  assert.deepEqual(f.scene.lines[0]!.heardBy, ["maya"], "Jimmy never becomes an earlier witness");
  assert(
    !sceneWritingHistory(f.scene, f.scene.lines, "dinner", ["jimmy"]).evidence.some((line) => line.id === "invitation"),
  );
  assert.match(String(publicSceneAuthority(f.scene).currentTime), /11:57/);
  assert.equal(f.scene.status, "active");
  assert(!f.scene.lines.some((line) => line.role === "user"), "time advancement invents no player participation");
  const count = f.scene.lines.length;
  await f.service.activeVenueSession();
  assert.equal(f.scene.lines.length, count, "a repeated read cannot duplicate transitions");
  now = new Date("2026-11-02T12:31:00Z");
  await f.service.activeVenueSession();
  assert.deepEqual(f.scene.activeIds, [], "Jimmy also leaves on schedule");
  const original = f.scene.lines[0];
  now = new Date("2026-11-03T09:51:00Z");
  await f.service.activeVenueSession();
  assert.deepEqual(f.scene.activeIds, ["maya"]);
  assert.deepEqual(f.scene.lines[0], original, "next-day continuation preserves accepted earlier history");
  f.world.venues[0]!.zones!.find((zone) => zone.id === "community")!.description = "A newly built pergola";
  await f.service.activeVenueSession();
  assert.equal(
    sceneContinuityView(f.world, f.scene).venues[0]!.zones!.find((zone) => zone.id === "community")!.description,
    "A newly built pergola",
  );

  now = new Date("2026-11-02T09:50:00Z");
  const interrupted = fixture();
  interrupted.scene.operation = {
    id: "pending",
    kind: "turn",
    status: "interrupted",
    error: "Interrupted",
    sceneRevision: interrupted.scene.sceneRevision,
  } as any;
  now = new Date("2026-11-02T11:57:00Z");
  interrupted.restart();
  const saved = JSON.stringify(interrupted.scene);
  await interrupted.service.activeVenueSession();
  assert.equal(JSON.stringify(interrupted.scene), saved, "restart cannot strand admitted work by advancing its Scene");

  now = new Date("2026-11-02T09:50:00Z");
  const legacy = fixture(false);
  now = new Date("2026-11-02T11:57:00Z");
  await legacy.service.activeVenueSession();
  assert.deepEqual(legacy.scene.activeIds, ["maya"], "old Scenes retain their original temporal contract");
  assert.throws(() => coerceSession({ ...legacy.scene, liveSceneVersion: 2 }), /Unsupported live Scene/);

  now = new Date("2026-11-02T09:50:00Z");
  const crowded = fixture();
  crowded.scene.zoneId = "exterior";
  crowded.scene.area = "outside";
  crowded.scene.accompanying = [{ characterId: "maya", zoneId: "exterior" }];
  for (let i = 0; i < 4; i++) {
    const person = structuredClone(crowded.world.villagers[1]!);
    person.characterId = `guest-${i}`;
    person.cardSnapshot.id = person.characterId;
    person.cardSnapshot.name = `Guest ${i}`;
    person.agenda!.day = [
      { startMinute: 0, endMinute: 1440, venueId: "garden", zoneId: "exterior", activity: "Visiting" },
    ];
    crowded.world.villagers.push(person);
  }
  now = new Date("2026-11-02T09:57:00Z");
  await crowded.service.requireLiveVenueSession(crowded.scene.id);
  assert.equal(crowded.scene.activeIds.length, 4, "scheduled arrivals respect occupied Scene positions");
  assert(crowded.scene.activeIds.includes("maya"), "a present companion is not displaced by a scheduled arrival");
  assert.equal(crowded.scene.sceneAttendance!.occupants.filter((person) => person.zoneId === "exterior").length, 4);
  await crowded.service.requireLiveVenueSession(crowded.scene.id);
  assert.equal(crowded.scene.activeIds.length, 4, "capacity resolution keeps refresh and navigation usable");

  now = new Date("2026-11-02T09:50:00Z");
  const physical = fixture();
  const garden = physical.world.venues[0]!;
  initializeVenueAccess(garden);
  garden.zones!.find((zone) => zone.id === "community")!.access = {
    mode: "public",
    managerIds: [],
    memberIds: [],
    memberRoles: [],
    inviterIds: [],
    accompanied: false,
    visitorHours: [{ days: ["Monday"], start: "11:00", end: "12:00" }],
  };
  now = new Date("2026-11-02T11:57:00Z");
  await physical.service.activeVenueSession();
  const action = {
    placeUpdate: { expectedRevision: 0, narration: "You set down a cup.", recent: { text: "A cup rests on a bench." } },
    physicalContext: {
      zoneId: "community",
      actorIds: ["player"],
      witnessIds: [],
      consentIds: [],
      positions: { player: "community" },
      segment: 0,
    },
  };
  assert.equal(
    sceneHaltWorldConflict(physical.scene, physical.world, action),
    false,
    "physical preflight uses current admitted visitor hours rather than the original Scene start",
  );
  assert.equal(
    sceneHaltWorldConflict({ ...physical.scene, liveSceneVersion: undefined }, physical.world, action),
    true,
    "the same preflight preserves the older frozen contract",
  );
} finally {
  releaseClock();
}
console.log("PASS live Scene schedules, absence, historical witnesses, request holds and saved compatibility");
