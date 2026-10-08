import assert from "node:assert/strict";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import {
  captureSceneAttendance,
  sceneZoneOccupants,
} from "../packages/villages/src/server/domain/rules/scene-attendance.js";
import { villagerPlaceView } from "../packages/villages/src/server/domain/rules/village-projections.js";
import { publicSceneResponse } from "../packages/villages/src/server/domain/rules/scene-public.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { initializeVenueAccess } from "../packages/villages/src/server/domain/rules/venue-access.js";
import { readEffectiveVillagerCard } from "../packages/villages/src/server/adapters/engine/catalog.js";
import { currentScenePrompt } from "./fixtures/villages-scene-writing.fixture.js";

async function main() {
  const at = new Date("2026-10-07T12:00:00.000Z");
  const stamp = at.toISOString();
  const dateKey = `${at.getFullYear()}-${String(at.getMonth() + 1).padStart(2, "0")}-${String(at.getDate()).padStart(2, "0")}`;
  const venue = (id: string) => ({
    layoutVersion: 1,
    id,
    name: id,
    classes: ["residence", "gathering"],
    baseClasses: ["residence", "gathering"],
    residentIds: id === "hub" ? ["hidden"] : [],
    description: "A shared building.",
    presentation: { image: null, x: 0.5, y: 0.5 },
    occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
    state: { condition: "standing", furniture: [], upgrades: [], publicFacts: [], updatedAt: stamp },
    zones: [
      { ...defaultVenueSpace("gathering"), id: "exterior", name: "Entrance", kind: "exterior", seen: true },
      { ...defaultVenueSpace("gathering"), id: "common", name: "Common Space", kind: "public", seen: true },
      {
        ...defaultVenueSpace("residence"),
        id: "private:hidden",
        name: "Private Space",
        kind: "private-residence",
        ownerId: "hidden",
        seen: false,
      },
    ],
  });
  const resident = (characterId: string, venueId: string, zoneId: string, activity: string) => ({
    characterId,
    cardSnapshot: {
      id: characterId,
      name: characterId === "hidden" ? "HIDDEN_PERSON_POISON" : characterId,
      revision: 1,
      sourceStatus: "available",
      capturedAt: stamp,
    },
    addedAt: stamp,
    ingestSchedule: false,
    agenda: {
      wishes: [],
      routineSummary: "Owned day",
      source: "village",
      generatedAt: stamp,
      activeDay: {
        dateKey,
        weekday: "Wednesday",
        scheduleInformed: false,
        blocks: [
          { startMinute: 0, endMinute: 1440, venueId, zoneId, activity, status: "online", reason: "Owned routine" },
        ],
      },
    },
  });
  const world = coerceVillageState({
    ...defaultVillageState(),
    seed: "attendance-fixture",
    foundedAt: stamp,
    setupAt: stamp,
    name: "Shared world",
    venues: [venue("hub"), venue("elsewhere")],
    villagers: [
      resident("visible", "hub", "common", "sorting herbs"),
      resident("hidden", "hub", "private:hidden", "HIDDEN_ACTIVITY_POISON"),
      resident("distant", "elsewhere", "common", "repairing tools"),
      {
        characterId: "unplaced",
        cardSnapshot: { id: "unplaced", name: "Unplaced", revision: 1, sourceStatus: "missing", capturedAt: stamp },
        addedAt: stamp,
      },
    ],
  });
  assert.equal(world.villagers.length, 4, "canonical current adopted snapshots retain every resident");
  const hub = world.venues.find((entry) => entry.id === "hub")!;
  for (const venue of world.venues) initializeVenueAccess(venue);
  assert.ok(hub.access, "fresh Venue policies exercise the current access-aware Scene position rules");
  const attendance = captureSceneAttendance(world, "hub", at);
  assert.deepEqual(
    attendance.occupants.map((entry) => [entry.characterId, entry.zoneId, entry.doing]),
    [
      ["visible", "common", "sorting herbs"],
      ["hidden", "private:hidden", "HIDDEN_ACTIVITY_POISON"],
    ],
    "capture spans all Zones in the selected Venue and excludes other Venues/unplaced residents",
  );
  const scene = coerceSession({
    id: "attendance-scene",
    placeId: "hub",
    placeName: "Shared building",
    status: "active",
    area: "public",
    zoneId: "common",
    startedAt: stamp,
    villageSeed: world.seed,
    sceneAttendance: attendance,
    participants: [{ characterId: "visible", name: "visible", doing: "sorting herbs" }],
    activeIds: ["visible"],
  });
  assert.deepEqual(
    sceneZoneOccupants(scene, world, hub, "common").map((entry) => entry.characterId),
    ["visible"],
  );
  assert.deepEqual(
    sceneZoneOccupants(scene, world, hub, "private:hidden").map((entry) => entry.characterId),
    ["hidden"],
  );
  const card = readEffectiveVillagerCard(world.villagers.find((entry) => entry.characterId === "visible")!);
  const prompt = await currentScenePrompt(world, card, "chat", "What are you doing?", scene);
  assert.match(prompt, /sorting herbs/u);
  assert.doesNotMatch(
    prompt,
    /HIDDEN_PERSON_POISON|HIDDEN_ACTIVITY_POISON/u,
    "captured private Zone attendance stays out of the current writer",
  );
  assert.doesNotMatch(
    JSON.stringify(publicSceneResponse(scene)),
    /HIDDEN_PERSON_POISON|HIDDEN_ACTIVITY_POISON/u,
    "the public Scene projection also hides server-only attendance",
  );
  const before = structuredClone(scene.sceneAttendance);
  world.villagers[0]!.agenda!.activeDay!.blocks[0]!.venueId = "elsewhere";
  world.villagers[0]!.agenda!.activeDay!.blocks[0]!.activity = "BACKGROUND_ACTIVITY_POISON";
  assert.equal(
    captureSceneAttendance(world, "hub", at).occupants.some((entry) => entry.characterId === "visible"),
    false,
    "a new Scene uses the current agenda",
  );
  assert.deepEqual(
    sceneZoneOccupants(scene, world, hub, "common").map((entry) => entry.doing),
    ["sorting herbs"],
    "the active Scene keeps its captured position and activity",
  );
  assert.deepEqual(scene.sceneAttendance, before);
  const laterPrompt = await currentScenePrompt(world, card, "chat", "And now?", scene);
  assert.match(laterPrompt, /sorting herbs/u);
  assert.doesNotMatch(laterPrompt, /BACKGROUND_ACTIVITY_POISON/u);
  const reloaded = coerceSession(JSON.parse(JSON.stringify(scene)));
  assert.deepEqual(reloaded.sceneAttendance, before, "new Scene attendance survives save/reload");
  reloaded.accompanying = [{ characterId: "visible", zoneId: "exterior" }];
  assert.deepEqual(sceneZoneOccupants(reloaded, world, hub, "common"), []);
  assert.deepEqual(
    sceneZoneOccupants(reloaded, world, hub, "exterior").map((entry) => entry.characterId),
    ["visible"],
    "only recorded movement changes positions",
  );
  reloaded.departedIds = ["visible"];
  assert.deepEqual(
    sceneZoneOccupants(reloaded, world, hub, "exterior"),
    [],
    "an evidenced departure removes the occupant",
  );
  const hidden = world.villagers.find((entry) => entry.characterId === "hidden")!;
  hidden.agenda = null;
  assert.equal(
    villagerPlaceView(world, hidden, null, 0, at)?.id,
    "hub",
    "a resident without a destination falls back to their home",
  );
  assert.equal(
    villagerPlaceView(
      world,
      world.villagers.find((entry) => entry.characterId === "unplaced")!,
      null,
      0,
      at,
    ),
    null,
    "a resident with no destination or home remains unplaced",
  );
  console.log(
    "Villages room occupancy: current Venue capture, Zone privacy, frozen attendance, reload, movement and departure passed",
  );
}
void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
