import { captureZoneObservation } from "../packages/villages/src/server/domain/rules/zone-observation.js";
import { applyAccessCommand } from "../packages/villages/src/server/domain/rules/venue-access.js";
import { venueFixture } from "./helpers/venues.fixture.js";
import { villageFixtureDocuments } from "./helpers/village-storage.fixture.js";
import assert from "node:assert/strict";
import { readBaseVenueLayout } from "../packages/villages/src/server/domain/rules/venue-layout.js";
import { prepareRenovatedPrivateInterior } from "../packages/villages/src/server/domain/rules/private-interior.js";
import { createPrivateSpacePreparation } from "../packages/villages/src/server/jobs/private-space-service.js";
import { createLocationImages } from "../packages/villages/src/server/features/media/location-image-service.js";
import {
  defaultVillageState,
  coerceVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { readVillageState, mutateVillageState } from "../packages/villages/src/server/features/world/village-store.js";
import { mutateDocument } from "../packages/villages/src/server/adapters/storage/document-store.js";
import {
  initializeRoomContinuity,
  retainNativeFact,
} from "../packages/villages/src/server/domain/rules/native-continuity.js";
import { observableRoomDescription } from "../packages/villages/src/server/domain/rules/zone-picture.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import {
  canOccupyZone,
  canInviteToZone,
  zoneControllerIds,
  resolveVenueZone,
  zoneClosed,
} from "../packages/villages/src/server/domain/rules/venue-zones.js";

import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import {
  preparePrivateSpaces,
  retryPrivateSpaces,
} from "../packages/villages/src/server/jobs/private-space-preparation.js";
import {
  sceneryPrompt,
  sceneryCharacterContext,
  sceneryImageKey,
  readSceneryStyle,
} from "../packages/villages/src/server/domain/rules/scenery-context.js";
import {
  assertVenueImageAccess,
  setVillageVenueImage,
} from "../packages/villages/src/server/features/venues/services.js";
import { villageSettings } from "../packages/villages/src/server/domain/rules/world-snapshot.js";

import { generateFirstZoneImage } from "../packages/villages/src/server/features/media/location-image.js";
import type { VillageVenue, VillageState } from "../packages/villages/src/server/domain/models/world.js";
const stamp = new Date().toISOString();
function venue(id: string, classes: NonNullable<VillageVenue["classes"]>): VillageVenue {
  return venueFixture({
    id,
    name: id,
    form: "A bank built inside a tent",
    classes,
    description: "Canvas and a bank sign",
    presentation: { image: null, x: 0.2, y: 0.3 },
    category: "",
    occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
    residentIds: [],
    workerIds: [],
    spaces: classes.map((c) => defaultVenueSpace(c, "Public lobby")),
    state: { revision: 0, recent: null, updatedAt: stamp },
  });
}
const state = defaultVillageState();
state.seed = "private-spaces";
state.setupAt = stamp;
state.foundedAt = stamp;
state.villagers = ["a", "b"].map((id) => ({
  letterFontId: "caveat",
  characterId: id,
  incarnation: "resident-" + id,
  addedAt: stamp,
  cardSnapshot: {
    id,
    name: id,
    revision: 1,
    sourceStatus: "available",
    capturedAt: stamp,
    comment: "",
    systemPrompt: "",
    scenario: "",
    appearance: "",
    exampleDialogue: "",
    summary: "Collector of shells",
    personality: "Careful and orderly",
    backstory: "Sailed here",
    description: "",
    tags: [],
  },
})) as VillageState["villagers"];
state.startingHistory.reviewed = Object.fromEntries(
  state.villagers.map(({ characterId, incarnation }) => [characterId, incarnation]),
);
const home = venue("home", ["residence"]);
home.residentIds = ["a"];
home.occupancy.residentCharacterId = "a";
const own = venue("own", ["residence"]);
own.occupancy.playerHome = true;
own.privateSpaces = [
  {
    ...defaultVenueSpace("residence", "My journal and hammock"),
    id: "private:player",
    ownerId: "player",
    image: { ref: "global-gallery:art", id: "art", url: "https://example.test/own.png", prompt: "Uploaded" },
  },
];
const work = venue("bank", ["workplace"]);
work.workerIds = ["a", "b"];
work.access = undefined;
const combined = venue("combined", ["residence", "workplace"]);
combined.residentIds = ["b"];
const park = venue("park", ["community"]);
park.zones!.push({
  ...defaultVenueSpace("community", "A greenhouse"),
  id: "restricted:greenhouse",
  name: "Greenhouse",
  purpose: "Keep seedlings",
  kind: "restricted",
  controllerIds: ["a", "b"],
  connectedTo: ["exterior"],
  preparation: { status: "pending" },
});
const personal = (ownerId: string) => ({
  ...defaultVenueSpace("residence", "An existing bedroom"),
  id: "private:" + ownerId,
  name: "Bedroom",
  purpose: "Rest",
  kind: "private-residence" as const,
  ownerId,
  connectedTo: ["exterior"],
  preparation: { status: "pending" as const },
});
const staffRoom = () => ({
  ...defaultVenueSpace("workplace", "An existing staff room"),
  id: "staff",
  name: "Staff room",
  purpose: "Work",
  kind: "staff" as const,
  connectedTo: ["exterior"],
  preparation: { status: "pending" as const },
});
home.zones!.push(personal("a"));
own.zones = undefined;
work.zones!.push(staffRoom());
combined.workerIds = ["b"];
combined.zones!.push(personal("b"), staffRoom());
state.venues = [home, own, work, combined, park, venue("other", ["other"])].map(venueFixture);
state.venues[2].access!.managerIds = ["a", "b"];
state.venues[3].access!.managerIds = ["b"];
const authored = coerceVillageState(state);
assert.deepEqual(
  coerceVillageState(structuredClone(authored)).venues,
  authored.venues,
  "Fresh layouts round-trip without repair",
);
for (const place of authored.venues)
  for (const room of place.zones!)
    if (!room.preparation && room.description) {
      initializeRoomContinuity(authored, place.id, room.id, room.description, "authored", stamp);
      if (room.seen) room.observed = captureZoneObservation(place, room, room.description);
    }
assert.equal(resolveVenueZone(authored.venues[1]!, "private:player")!.description, "My journal and hammock");
assert.equal(resolveVenueZone(authored.venues[1]!, "private:player")!.image!.id, "art");
assert.equal(authored.venues[2]!.zones!.filter((z) => z.kind === "staff").length, 1);
assert.equal(authored.venues[3]!.zones!.filter((z) => z.kind === "private-residence").length, 1);
assert.equal(authored.venues[3]!.zones!.filter((z) => z.kind === "staff").length, 1);
assert.equal(
  authored.venues[5]!.zones!.filter((z) => ["staff", "restricted", "private-residence"].includes(z.kind)).length,
  0,
);
const staff = resolveVenueZone(authored.venues[2]!, "staff")!;
assert.equal(zoneClosed(authored, authored.venues[2]!, staff), true);
assert.deepEqual(zoneControllerIds(authored.venues[2]!, staff), ["a", "b"]);
assert.equal(canOccupyZone(authored.venues[2]!, staff, "a"), true);
assert.equal(canOccupyZone(authored.venues[2]!, staff, "player"), false);
assert.equal(canInviteToZone(authored.venues[2]!, staff, "b"), true);
authored.venues[2]!.workerIds = [];
authored.venues[2]!.access!.managerIds = [];
assert.equal(canInviteToZone(authored.venues[2]!, staff, "b"), false);
assert.deepEqual(zoneControllerIds(authored.venues[2]!, staff), []);
authored.venues[2]!.workerIds = ["a", "b"];
authored.venues[2]!.access!.managerIds = ["a", "b"];
assert.throws(() => readSceneryStyle("x".repeat(601)), /600/);
const prompt = sceneryPrompt(
  ["Area " + "D".repeat(1000)],
  ["Too big " + "L".repeat(8000), "Complete short lore."],
  "Pixel art",
);
assert.ok(prompt.length <= 8000);
assert.match(prompt, /Pixel art/);
assert.match(prompt, /Complete short lore/);
assert.doesNotMatch(prompt, /Too big/);
const longScenery = sceneryPrompt(
  [
    "Wide, empty exterior view of the copper-roofed inn.",
    "Approved description: " + "Copper roof and stone walls. ".repeat(200),
    "Occupant context: " + "Books and quiet corners. ".repeat(200),
    "Show the entrance and approach; no people or lettering.",
  ],
  ["Optional lore " + "L".repeat(4000)],
  "Watercolor " + "S".repeat(589),
);
assert.ok(longScenery.length <= 8000, "long authored context fits without rejecting image generation");
assert.match(longScenery, /Wide, empty exterior view of the copper-roofed inn\./);
assert.match(longScenery, /Approved description: Copper roof and stone walls/);
assert.match(longScenery, /Occupant context: Books and quiet corners/);
assert.match(longScenery, /Show the entrance and approach; no people or lettering\./);
assert.ok(longScenery.includes("Watercolor " + "S".repeat(589)), "the full chosen art style is preserved");
assert.doesNotMatch(longScenery, /Optional lore/);
assert.equal(
  sceneryPrompt(["Entrance"], ["Short lore"], "Pixel art"),
  sceneryPrompt(["Entrance"], [], "Pixel art") + "\nShort lore",
);
authored.venues[0]!.imageContext = { useAssignedVillagerContext: false, useVisualLore: false };
assert.equal(sceneryCharacterContext(authored, authored.venues[0]!), "");
assert.match(sceneryCharacterContext(authored, authored.venues[0]!, "a"), /Careful/);
let fail = true,
  calls = 0,
  lastInput: any;
const inputs: any[] = [];
const records = new Map<string, any>();
const restore = configureVillagesRuntime({
  projectId: "private-fixture",
  logger: { debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} },
  getAgentConfig: async () => ({ connectionId: "fixture" }),
  resources: {
    async listCharacters() {
      return [];
    },
  },
  persistence: {
    documents: villageFixtureDocuments({
      async getById(_p: string, id: string) {
        return records.get(id) ?? null;
      },
      async list(_p: string, kind: string) {
        return [...records.values()].filter((v) => v.kind === kind);
      },
      async create(input: any) {
        const row = { ...input, revision: 1 };
        records.set(input.id, row);
        return row;
      },
      async update(input: any) {
        const prior = records.get(input.id);
        if (!prior || prior.revision !== input.expectedRevision) return null;
        const row = { ...prior, ...input, revision: prior.revision + 1 };
        records.set(input.id, row);
        return row;
      },
      async remove(_p: string, id: string) {
        return records.delete(id);
      },
    }),
  },
  languageModels: {
    async resolveForRequest() {
      return {
        model: "fixture",
        maxOutputTokens: 4096,
        fitContext(messages: any[], options: any) {
          return { messages, ...options };
        },
        async chatComplete(messages: any[]) {
          calls++;
          lastInput = JSON.parse(messages[1].content);
          inputs.push(lastInput);
          if (fail && lastInput.rooms[0].id === "restricted:greenhouse") throw Error("Offline");
          return {
            content: JSON.stringify({
              rooms: lastInput.rooms.map((r: any) => ({
                venueId: r.venueId,
                id: r.id,
                name: r.id === "staff" ? "Bank vault" : r.name,
                description: "Secret shell collection in a canvas corner",
              })),
            }),
          };
        },
      };
    },
  },
} as any);
async function main() {
  try {
    await mutateVillageState((current) => Object.assign(current, authored));
    const before = await readVillageState({ memories: true });
    const key = sceneryImageKey(before, before.venues[1]!, before.setupAt);
    await mutateVillageState((current) => {
      current.sceneryArtStyle = "Pixel art";
    });
    await assert.rejects(() => setVillageVenueImage("own", "exterior", null, false, key), /scenery changed/);
    assert.equal(
      resolveVenueZone((await readVillageState({ memories: true })).venues[1]!, "private:player").image.id,
      "art",
    );
    await Promise.all([
      assert.rejects(preparePrivateSpaces(), /Offline/),
      assert.rejects(preparePrivateSpaces(), /Offline/),
    ]);
    assert.equal(calls, 5, "concurrent preparation coalesces; one request per private space");
    assert.equal(
      resolveVenueZone((await readVillageState({ memories: true })).venues[4]!, "restricted:greenhouse").preparation
        ?.status,
      "failed",
    );
    await preparePrivateSpaces();
    assert.equal(calls, 5, "failed text never automatically retries");
    fail = false;
    await retryPrivateSpaces();
    assert.equal(calls, 6, "deliberate retry prepares only the failed Room");
    assert.ok(inputs.every((input) => input.rooms.length === 1));
    let saved = await readVillageState({ memories: true });
    assert.ok(saved.venues.every((v) => v.zones!.every((z) => !z.preparation || z.preparation.status === "ready")));
    assert.equal(
      resolveVenueZone(saved.venues[2]!, "staff")!.name,
      "Staff room",
      "Preparation preserves the authored Zone name",
    );
    assert.equal(
      observableRoomDescription(saved, "home", "private:a", new Date().toISOString()),
      "Secret shell collection in a canvas corner",
    );
    assert.ok(
      inputs
        .flatMap((input) => input.rooms)
        .find((r: any) => r.id === "private:a")
        .characters.some((c: any) => c.personality.includes("Careful")),
    );
    const view = villageSettings(saved, { name: "Player", description: "", personaId: "" } as any);
    const hidden = view.venues.find((v) => v.id === "bank")!.zones!.find((z) => z.id === "staff")!;
    assert.equal(hidden.description, "");
    assert.equal(hidden.observed, undefined);
    assert.equal(hidden.image, null);
    assert.deepEqual(hidden.preparation, { status: "ready", error: undefined });
    await mutateVillageState((current) => {
      const place = current.venues[4]!;
      applyAccessCommand(
        place,
        {
          action: "invite",
          operationId: "garden-invite",
          expectedRevision: place.access!.revision,
          zoneId: "restricted:greenhouse",
          visitorId: "player",
          duration: "visit",
          accompanied: false,
          outsideHours: false,
        },
        "a",
        stamp,
        ["player", "a", "b"],
      );
    });
    assert.equal(
      (await readVillageState({ memories: true })).venues[4]!.access!.permissions.length,
      1,
      "community controllers can issue saved room invitations",
    );
    const owner = view.venues.find((v) => v.id === "own")!.zones!.find((z) => z.id === "private:player")!;
    assert.equal(owner.description, "My journal and hammock");
    const originalFetch = globalThis.fetch;
    let draws = 0;
    globalThis.fetch = async () => {
      draws++;
      throw Error("Image offline");
    };
    try {
      await mutateVillageState((current) => {
        resolveVenueZone(current.venues[1], "private:player")!.image = null;
      });
      await generateFirstZoneImage("own", "player");
      assert.equal(draws, 0, "the player's known personal space keeps image generation optional");
      const { saveVillageConnections } =
        await import("../packages/villages/src/server/features/settings/connections.js");
      await saveVillageConnections({ imageConnectionId: "fixture-image" });
      await mutateVillageState((current) => {
        const place = current.venues[2]!;
        applyAccessCommand(
          place,
          {
            action: "invite",
            operationId: "visit-vault",
            expectedRevision: place.access!.revision,
            zoneId: "staff",
            visitorId: "player",
            duration: "visit",
            accompanied: false,
            outsideHours: false,
          },
          "b",
          stamp,
          ["player", "a", "b"],
        );
      });
      const { enterVenue } = await import("../packages/villages/src/server/features/scenes/venue-session.js");
      const { activeVenueSession } = await import("../packages/villages/src/server/features/scenes/live-session.js");
      const visit = await enterVenue("bank", "staff");
      assert.equal(visit.zoneId, "staff");
      assert.equal(visit.pendingAccessClaim, undefined);
      assert.equal(
        visit.continuity!.facts.venues.find((place) => place.id === "bank")!.access!.permissions[0].sceneId,
        visit.id,
      );
      await Promise.all([generateFirstZoneImage("bank", "staff"), generateFirstZoneImage("bank", "staff")]);
      saved = await readVillageState({ memories: true });
      assert.equal(saved.venues[2].access!.permissions[0].sceneId, visit.id);
      assert.ok(resolveVenueZone(saved.venues[2]!, "staff")!.initialImageAttemptedAt);
      for (let retry = 0; draws === 0 && retry < 100; retry++) await new Promise((resolve) => setTimeout(resolve, 10));
      assert.ok(draws > 0, "first invited entry reaches the image service");
      const attempted = draws;
      await generateFirstZoneImage("bank", "staff");
      assert.equal(draws, attempted, "failed first image is never retried");
      await mutateVillageState((current) => {
        current.venues[2].workerIds = [];
        current.venues[2].access!.managerIds = [];
      });
      assert.equal(
        (await activeVenueSession()).zoneId,
        "exterior",
        "live access follows current worker authority while preserving safe egress",
      );
      await assertVenueImageAccess("bank", "staff");
      assert.equal(
        resolveVenueZone((await readVillageState({ memories: true })).venues[2], "staff").seen,
        true,
        "previous discovery remains known",
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
    console.log("Private Rooms, access disclosure, scenery and image deduplication passed.");
  } finally {
    restore();
  }
}
async function privateInteriorLifecycle() {
  const village = defaultVillageState();
  village.seed = "vacant-private-room";
  village.setupAt = stamp;
  village.foundedAt = stamp;
  const home = venue("bungalow", ["residence"]);
  home.layoutVersion = 1;
  home.zones = readBaseVenueLayout(
    {
      layout: "private",
      description: "A cream bungalow with a wooden porch",
      spaces: [],
      privateSpaces: [
        {
          id: "bedroom",
          name: "Bedroom",
          purpose: "Sleeping",
          venueClass: "residence",
          roomSpecification: "A small room with a garden-facing window",
        },
      ],
    },
    ["residence"],
    "",
    () => null,
  );
  Object.assign(home, venueFixture(home));
  village.venues = [home];
  const room = { kind: "room" as const, placeId: home.id, zoneId: "bedroom" };
  const appearance = (state = village) =>
    observableRoomDescription(state, home.id, room.zoneId, new Date().toISOString());
  const addDetail = (id: string, text: string) =>
    retainNativeFact(
      village,
      {
        id,
        kind: "structure",
        targetId: JSON.stringify([room.placeId, room.zoneId]),
        revision: 1,
        text,
        witnesses: [],
      },
      new Date().toISOString(),
      { room },
    );
  let calls = 0;
  const preparation = createPrivateSpacePreparation({
    mutateDocument,
    readVillageState: async () => structuredClone(village),
    mutateVillageState: async (update: any) => {
      update(village);
      return structuredClone(village);
    },
    readVillageLore: async () => [],
    reportFoundingProgress: async () => {},
    villagesLogger: () => ({ warn() {} }),
    villagesConnectionIdFor: async () => "synthetic",
    villagesLanguageModels: () => ({
      resolveForRequest: async () => ({
        name: "Synthetic",
        maxOutputTokens: 3000,
        fitContext: (messages: any[], options: any) => ({ messages, ...options }),
      }),
    }),
    completeWithRoom: async (_model: any, messages: any[]) => {
      calls++;
      const input = JSON.parse(messages[1].content).rooms[0];
      assert.match(input.roomSpecification, /garden-facing window/);
      assert.deepEqual(input.characters, [], "vacant rooms use no resident personality");
      return {
        content: JSON.stringify({
          rooms: [
            {
              venueId: "bungalow",
              id: "bedroom",
              name: "Bedroom",
              dayNight: true,
              ...(input.existingInterior
                ? { edits: [{ text: "The garden-facing window is renewed." }] }
                : { description: "A neutral bedroom with a garden-facing window and plain bed." }),
            },
          ],
        }),
      };
    },
  } as any);
  await Promise.all([preparation.preparePrivateSpaces(), preparation.preparePrivateSpaces()]);
  assert.equal(calls, 1, "vacant room preparation is durable and coalesced");
  await preparation.preparePrivateSpaces();
  assert.equal(calls, 1, "reading ready interiors never regenerates them");
  const bedroom = resolveVenueZone(home, "bedroom")!;
  assert.equal(bedroom.preparation?.status, "ready");
  assert.equal(bedroom.dayNight, true, "normal room preparation includes its daylight decision");
  assert.equal(bedroom.roomSpecification, "A small room with a garden-facing window");
  const player = { name: "Player", description: "", personaId: "" } as any;
  let view = villageSettings(village, player);
  assert.equal(view.venues[0].zones!.find((zone) => zone.id === "bedroom")!.description, "");
  assert.equal(bedroom.seen, false, "viewing details does not record a gameplay visit");
  bedroom.image = { ref: "global-gallery:before", id: "before", url: "https://example.test/before.png" };
  addDetail("keepsake", "A personalized interior with a keepsake.");
  view = villageSettings(village, player);
  const shown = view.venues[0].zones!.find((zone) => zone.id === "bedroom")!;
  assert.equal(shown.description, "", "unvisited private details remain undisclosed");
  assert.equal(shown.image, null, "unvisited artwork is not exposed through settings");
  assert.equal(bedroom.seen, false);
  const reloaded = coerceVillageState(structuredClone(village));
  assert.equal(appearance(reloaded), appearance());
  assert.equal(
    sceneryImageKey(village, home, village.setupAt, "bedroom"),
    sceneryImageKey(village, structuredClone(home), village.setupAt, "bedroom"),
  );
  bedroom.image = null;
  let draws = 0;
  const images = createLocationImages({
    canGenerateZonePicture: async (_placeId: string, _zoneId: string, guard?: (state: VillageState) => boolean) =>
      bedroom.seen && (!guard || guard(village)),
    resolveVillageImageConnectionId: async () => "synthetic",
    readVillageState: async () => structuredClone(village),
    mutateVillageState: async (update: any) => {
      update(village);
      return structuredClone(village);
    },
    assertVenueImageAccess: async () => {},
    readVillageImageLore: async () => "",
    generateVillageImage: async (input: any) => {
      draws++;
      assert.ok(input.prompt.length <= 8000);
      assert.match(input.prompt, /personalized interior/);
      if (draws === 1) {
        assert.match(input.prompt, /keepsake/);
        assert.match(input.prompt, /garden-facing window/);
      } else assert.match(input.prompt, /Large established physical detail/);
      assert.match(input.prompt, /Shared architecture/);
      assert.match(input.negativePrompt, /people.*animals.*text/);
      throw new Error("Synthetic image failure");
    },
    villagesLogger: () => ({ warn() {} }),
  } as any);
  bedroom.seen = true;
  bedroom.observed = captureZoneObservation(home, bedroom, appearance());
  await Promise.all([
    images.generateFirstZoneImage("bungalow", "bedroom"),
    images.generateFirstZoneImage("bungalow", "bedroom"),
  ]);
  assert.equal(draws, 1, "first vacant-room entry gets one image attempt");
  await images.generateFirstZoneImage("bungalow", "bedroom");
  assert.equal(draws, 1, "failed initial images require explicit retry");
  assert.ok(bedroom.initialImageAttemptedAt);
  const persisted = coerceVillageState(structuredClone(village));
  assert.equal(
    resolveVenueZone(persisted.venues[0], "bedroom")!.initialImageAttemptedAt,
    bedroom.initialImageAttemptedAt,
  );
  addDetail("physical-detail", "Large established physical detail. ".repeat(70).trim());
  bedroom.observed = captureZoneObservation(home, bedroom, appearance());
  await assert.rejects(
    () => images.generateVillageLocationImage("bungalow", "bedroom", undefined),
    /Synthetic image failure/,
    "a long bounded physical account fits completely before requesting an image",
  );
  assert.equal(draws, 2);
  addDetail("room-damage", "Existing damage.");
  const priorAppearance = appearance();
  const priorRoom = structuredClone(bedroom);
  bedroom.roomSpecification = "A new garden-facing window";
  prepareRenovatedPrivateInterior(bedroom, priorRoom);
  assert.equal(bedroom.preparation?.mode, "renovation");
  assert.equal(appearance(), priorAppearance, "approved specification waits for reconciled preparation");
  assert.equal(bedroom.initialImageAttemptedAt, priorRoom.initialImageAttemptedAt);
  await preparation.preparePrivateSpaces();
  assert.equal(calls, 2, "an approved Renovation prepares exactly once");
  assert.match(appearance(), /Large established physical detail/);
  assert.match(appearance(), /Existing damage/);
  assert.match(appearance(), /window is renewed/);
  await preparation.preparePrivateSpaces();
  assert.equal(calls, 2);
  const ownRoom = { ...structuredClone(bedroom), ownerId: "player", description: "My authored interior" };
  prepareRenovatedPrivateInterior(ownRoom);
  assert.equal(ownRoom.description, "My authored interior", "player-owned Renovation keeps its authored appearance");
}
await (async () => {
  await privateInteriorLifecycle();
  await main();
})();
