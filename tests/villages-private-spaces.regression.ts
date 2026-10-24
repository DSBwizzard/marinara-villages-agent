import assert from "node:assert/strict";
import { readBaseVenueLayout } from "../packages/villages/src/server/domain/rules/venue-layout.js";
import {
  observePrivateInterior,
  privateInteriorKey,
  prepareRenovatedPrivateInterior,
} from "../packages/villages/src/server/domain/rules/private-interior.js";
import { createPrivateSpacePreparation } from "../packages/villages/src/server/jobs/private-space-service.js";
import { createLocationImages } from "../packages/villages/src/server/features/media/location-image-service.js";
import {
  defaultVillageState,
  coerceVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { readVillageState, mutateVillageState } from "../packages/villages/src/server/features/world/village-store.js";
import { defaultRelationshipState } from "../packages/villages/src/server/domain/rules/relationship-rules.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import {
  canOccupyZone,
  canInviteToZone,
  zoneControllerIds,
  resolveVenueZone,
  privateTarget,
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
import { applyResidenceEditApproval } from "../packages/villages/src/server/features/venues/zone-edits.js";
import {
  assertVenueImageAccess,
  setVillageVenueImage,
} from "../packages/villages/src/server/features/venues/services.js";
import { villageSettings } from "../packages/villages/src/server/domain/rules/world-snapshot.js";
import { readCreationPrivateZones } from "../packages/villages/src/server/domain/rules/founding-record.js";
import { generateFirstPrivateSpaceImage } from "../packages/villages/src/server/features/media/location-image.js";
import type { VillageVenue, VillageState } from "../packages/villages/src/server/domain/models/world.js";
const stamp = new Date().toISOString();
function venue(id: string, classes: NonNullable<VillageVenue["classes"]>): VillageVenue {
  return {
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
    state: { condition: "", furniture: [], publicFacts: [], features: [], traces: [], updatedAt: stamp },
  };
}
const state = defaultVillageState();
state.villagers = ["a", "b"].map((id) => ({
  characterId: id,
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
const combined = venue("combined", ["residence", "workplace"]);
combined.residentIds = ["b"];
const park = venue("park", ["community"]);
park.zones = readCreationPrivateZones(
  [{ id: "restricted:greenhouse", name: "Greenhouse", purpose: "Keep seedlings", controllerIds: ["a", "b"] }],
  ["community"],
);
state.venues = [home, own, work, combined, park, venue("other", ["other"])];
const migrated = coerceVillageState(state);
assert.deepEqual(coerceVillageState(structuredClone(migrated)).venues, migrated.venues, "migration is idempotent");
const collision = structuredClone(migrated);
collision.venues[2].zones = collision.venues[2].zones.filter((zone) => zone.kind !== "staff");
collision.venues[2].zones.push({ ...collision.venues[2].zones.find((zone) => zone.kind === "public"), id: "staff" });
const repaired = coerceVillageState(collision).venues[2].zones;
assert.equal(repaired.filter((zone) => zone.kind === "staff").length, 1);
assert.equal(
  new Set(repaired.map((zone) => zone.id)).size,
  repaired.length,
  "migration preserves existing IDs without collisions",
);
assert.equal(resolveVenueZone(migrated.venues[1]!, "private:player")!.description, "My journal and hammock");
assert.equal(resolveVenueZone(migrated.venues[1]!, "private:player")!.image!.id, "art");
assert.equal(migrated.venues[2]!.zones!.filter((z) => z.kind === "staff").length, 1);
assert.equal(migrated.venues[3]!.zones!.filter((z) => z.kind === "private-residence").length, 1);
assert.equal(migrated.venues[3]!.zones!.filter((z) => z.kind === "staff").length, 1);
assert.equal(
  migrated.venues[5]!.zones!.filter((z) => ["staff", "restricted", "private-residence"].includes(z.kind)).length,
  0,
);
const staff = resolveVenueZone(migrated.venues[2]!, "staff")!;
assert.equal(zoneClosed(migrated, migrated.venues[2]!, staff), true);
assert.deepEqual(zoneControllerIds(migrated.venues[2]!, staff), ["a", "b"]);
assert.equal(canOccupyZone(migrated.venues[2]!, staff, "a"), true);
assert.equal(canOccupyZone(migrated.venues[2]!, staff, "player"), false);
assert.equal(canInviteToZone(migrated.venues[2]!, staff, "b"), true);
migrated.venues[2]!.workerIds = [];
assert.equal(canInviteToZone(migrated.venues[2]!, staff, "b"), false);
assert.deepEqual(zoneControllerIds(migrated.venues[2]!, staff), []);
migrated.venues[2]!.workerIds = ["a", "b"];
assert.equal(privateTarget(migrated.venues[0]!, undefined, "private:a", "a"), "private:a");
assert.throws(() => privateTarget(migrated.venues[2]!, "staff", "private:a"), /Conflicting/);
assert.throws(() => readSceneryStyle("x".repeat(601)), /600/);
const prompt = sceneryPrompt(
  ["Area " + "D".repeat(1000)],
  ["Too big " + "L".repeat(3500), "Complete short lore."],
  "Pixel art",
);
assert.ok(prompt.length <= 4000);
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
assert.ok(longScenery.length <= 4000, "long authored context fits without rejecting image generation");
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
migrated.venues[0]!.imageContext = { useAssignedVillagerContext: false, useVisualLore: false };
assert.equal(sceneryCharacterContext(migrated, migrated.venues[0]!), "");
assert.match(sceneryCharacterContext(migrated, migrated.venues[0]!, "a"), /Careful/);
let fail = false,
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
    documents: {
      async getById(_p: string, id: string) {
        if (id.startsWith("villages-relationships-") && !records.has(id)) {
          const world = records.get("villages-village").data;
          const social = defaultRelationshipState(world.seed);
          social.reviewedActorIds = world.villagers.map((person: any) => person.characterId);
          records.set(id, { id, kind: "relationships", data: social, revision: 1 });
        }
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
    },
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
          if (fail) throw Error("Offline");
          lastInput = JSON.parse(messages[1].content);
          inputs.push(lastInput);
          return {
            content: JSON.stringify({
              rooms: lastInput.rooms.map((r: any) => ({
                venueId: r.venueId,
                id: r.id,
                name: r.id === "staff" ? "Bank vault" : r.name,
                description: "Secret shell collection in a canvas corner",
                condition: "Dry",
                items: ["Shells"],
                facts: ["Canvas wall"],
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
    await mutateVillageState((current) => Object.assign(current, migrated));
    const before = await readVillageState();
    const key = sceneryImageKey(before, before.venues[1]!);
    await mutateVillageState((current) => {
      current.sceneryArtStyle = "Pixel art";
    });
    await assert.rejects(
      () => setVillageVenueImage("own", null, undefined, "", false, undefined, key),
      /scenery changed/,
    );
    assert.equal((await readVillageState()).venues[1]!.privateSpaces![0]!.image!.id, "art");
    await Promise.all([preparePrivateSpaces(), preparePrivateSpaces()]);
    assert.equal(calls, 5, "concurrent preparation coalesces; one request per private space");
    assert.ok(inputs.every((input) => input.rooms.length === 1));
    let saved = await readVillageState();
    assert.ok(saved.venues.every((v) => v.zones!.every((z) => !z.preparation || z.preparation.status === "ready")));
    assert.equal(resolveVenueZone(saved.venues[2]!, "staff")!.name, "Bank vault");
    assert.equal(
      resolveVenueZone(saved.venues[0], "private:a").description,
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
    assert.deepEqual(hidden.state.items, []);
    assert.equal(hidden.image, null);
    assert.equal(hidden.preparation!.status, "ready");
    await mutateVillageState((current) => {
      current.venues[4]!.playerInvitations = [
        { residentId: "a", zoneId: "restricted:greenhouse", recordedAt: stamp, sourceLineId: "garden-invite" },
      ];
    });
    assert.equal(
      (await readVillageState()).venues[4]!.playerInvitations!.length,
      1,
      "community controllers can issue saved room invitations",
    );
    const owner = view.venues.find((v) => v.id === "own")!.zones!.find((z) => z.id === "private:player")!;
    assert.equal(owner.description, "My journal and hammock");
    await mutateVillageState((current) => {
      const bank = current.venues.find((v) => v.id === "bank")!;
      const room = resolveVenueZone(bank, "staff")!;
      room.seen = true;
      bank.editProposals = [
        {
          id: "proposal",
          zoneId: "staff",
          privateSpaceId: "staff",
          target: "private",
          ownerId: "",
          baseUpdatedAt: room.state.updatedAt,
          proposed: { ...room, description: "Approved edit" },
          requiredIds: ["a", "b"],
          approvedIds: [],
          declined: false,
          createdAt: stamp,
        },
      ];
    });
    assert.equal(
      (await readVillageState()).venues[2]!.editProposals!.length,
      1,
      "worker proposals survive persistence",
    );
    await applyResidenceEditApproval("bank", "proposal", "a", true);
    assert.notEqual(resolveVenueZone((await readVillageState()).venues[2]!, "staff")!.description, "Approved edit");
    await applyResidenceEditApproval("bank", "proposal", "b", true);
    assert.equal(resolveVenueZone((await readVillageState()).venues[2]!, "staff")!.description, "Approved edit");
    await mutateVillageState((current) => {
      const bank = current.venues[2]!;
      const room = resolveVenueZone(bank, "staff")!;
      bank.playerInvitations = [{ residentId: "a", zoneId: "staff", recordedAt: stamp, sourceLineId: "spoken" }];
      bank.editProposals = [
        {
          id: "revoked",
          zoneId: "staff",
          target: "private",
          ownerId: "",
          baseUpdatedAt: room.state.updatedAt,
          proposed: { ...room, description: "Bad edit" },
          requiredIds: ["a", "b"],
          approvedIds: [],
          declined: false,
          createdAt: stamp,
        },
      ];
      bank.workerIds = ["b"];
    });
    assert.deepEqual((await readVillageState()).venues[2]!.playerInvitations, []);
    await applyResidenceEditApproval("bank", "revoked", "a", true);
    assert.equal((await readVillageState()).venues[2]!.editProposals![0]!.declined, true);
    fail = true;
    await mutateVillageState((current) => {
      resolveVenueZone(current.venues[4]!, "restricted:greenhouse")!.preparation = { status: "pending" };
    });
    await assert.rejects(() => preparePrivateSpaces(), /Offline/);
    assert.equal(
      resolveVenueZone((await readVillageState()).venues[4]!, "restricted:greenhouse")!.preparation!.status,
      "failed",
    );
    const oldCalls = calls;
    await preparePrivateSpaces();
    assert.equal(calls, oldCalls, "failed text never automatically retries");
    fail = false;
    await retryPrivateSpaces();
    assert.equal(
      resolveVenueZone((await readVillageState()).venues[4]!, "restricted:greenhouse")!.preparation!.status,
      "ready",
    );
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
      await generateFirstPrivateSpaceImage("own", "player");
      assert.equal(draws, 0, "the player's known personal space keeps image generation optional");
      const { saveVillageConnections } =
        await import("../packages/villages/src/server/features/settings/connections.js");
      await saveVillageConnections({ imageConnectionId: "fixture-image" });
      await mutateVillageState((current) => {
        current.venues[2].playerInvitations = [
          { residentId: "b", zoneId: "staff", recordedAt: stamp, sourceLineId: "visit-vault" },
        ];
      });
      const { enterVenue } = await import("../packages/villages/src/server/features/scenes/venue-session.js");
      const { activeVenueSession } = await import("../packages/villages/src/server/features/scenes/live-session.js");
      const visit = await enterVenue("bank", undefined, "", undefined, "staff");
      assert.equal(visit.privateSpaceId, "staff");
      await Promise.all([
        generateFirstPrivateSpaceImage("bank", "staff"),
        generateFirstPrivateSpaceImage("bank", "staff"),
      ]);
      saved = await readVillageState();
      assert.ok(resolveVenueZone(saved.venues[2]!, "staff")!.initialImageAttemptedAt);
      for (let retry = 0; draws === 0 && retry < 100; retry++) await new Promise((resolve) => setTimeout(resolve, 10));
      assert.ok(draws > 0, "first invited entry reaches the image service");
      const attempted = draws;
      await generateFirstPrivateSpaceImage("bank", "staff");
      assert.equal(draws, attempted, "failed first image is never retried");
      await mutateVillageState((current) => {
        current.venues[2].workerIds = [];
      });
      assert.equal(
        (await activeVenueSession()).zoneId,
        "staff",
        "background worker removal preserves the captured invitation",
      );
      await assert.rejects(() => assertVenueImageAccess("bank", undefined, "", "staff"), /current invitation/);
      assert.equal(
        resolveVenueZone((await readVillageState()).venues[2], "staff").seen,
        true,
        "previous discovery remains known",
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
    console.log(
      "Villages private spaces and scenery: defaults, migration, disclosure, dynamic workers, approval, preparation and image deduplication passed.",
    );
  } finally {
    restore();
  }
}
async function privateInteriorLifecycle() {
  const village = defaultVillageState();
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
  village.venues = [home];
  let calls = 0;
  const preparation = createPrivateSpacePreparation({
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
              description: "A neutral bedroom with a garden-facing window and plain bed.",
              condition: input.existingInterior?.condition ?? "New",
              items: input.existingInterior?.items ?? ["Plain bed"],
              facts: input.existingInterior?.facts ?? ["Garden-facing window"],
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
  assert.equal(bedroom.roomSpecification, "A small room with a garden-facing window");
  const player = { name: "Player", description: "", personaId: "" } as any;
  let view = villageSettings(village, player);
  assert.equal(view.venues[0].zones!.find((zone) => zone.id === "bedroom")!.description, "");
  assert.equal(
    view.venues[0].zones!.find((zone) => zone.id === "bedroom")!.roomSpecification,
    bedroom.roomSpecification,
  );
  observePrivateInterior(bedroom, stamp);
  bedroom.image = { ref: "global-gallery:before", id: "before", url: "https://example.test/before.png" };
  bedroom.imageInteriorKey = privateInteriorKey(bedroom);
  const prior = structuredClone(bedroom.lastObserved);
  bedroom.description = "A newly personalized interior that has not been visited";
  bedroom.state.items = ["Unseen keepsake"];
  view = villageSettings(village, player);
  const remembered = view.venues[0].zones!.find((zone) => zone.id === "bedroom")!;
  assert.equal(remembered.description, prior!.description);
  assert.deepEqual(remembered.state.items, prior!.state.items);
  assert.equal(remembered.imageOutdated, false, "unseen changes do not disclose image staleness");
  assert.equal((remembered as any).lastObserved, undefined, "private observation storage stays server-only");
  const reloaded = coerceVillageState(structuredClone(village));
  assert.deepEqual(resolveVenueZone(reloaded.venues[0], "bedroom")!.lastObserved, prior);
  const key = privateInteriorKey(bedroom);
  bedroom.state.features = [
    { id: "feature", text: "FEATURE_SENTINEL", locked: false, sourceCharacterId: "", updatedAt: stamp },
  ];
  assert.equal(privateInteriorKey(bedroom), key, "Features do not invalidate visual room state");
  assert.equal(sceneryImageKey(village, home, "bedroom"), sceneryImageKey(village, structuredClone(home), "bedroom"));
  const noFeatures = structuredClone(home);
  resolveVenueZone(noFeatures, "bedroom")!.state.features = [];
  assert.equal(
    sceneryImageKey(village, home, "bedroom"),
    sceneryImageKey(village, noFeatures, "bedroom"),
    "Features do not fence image generation",
  );
  observePrivateInterior(bedroom, stamp);
  assert.equal(
    villageSettings(village, player).venues[0].zones!.find((zone) => zone.id === "bedroom")!.imageOutdated,
    true,
    "observed physical changes expose explicit redraw status",
  );
  bedroom.image = null;
  let draws = 0;
  const images = createLocationImages({
    readVillageState: async () => structuredClone(village),
    mutateVillageState: async (update: any) => {
      update(village);
      return structuredClone(village);
    },
    assertVenueImageAccess: async () => {},
    readVillageVisualLore: async () => "",
    generateVillageImage: async (input: any) => {
      draws++;
      assert.ok(input.prompt.length <= 4000);
      assert.match(input.prompt, /newly personalized interior/);
      if (draws === 1) {
        assert.match(input.prompt, /Unseen keepsake/);
        assert.match(input.prompt, /garden-facing window/);
      } else assert.match(input.prompt, /Large established physical item/);
      assert.match(input.prompt, /Shared architecture/);
      assert.match(input.prompt, /no people, no animals, no text/);
      assert.doesNotMatch(input.prompt, /FEATURE_SENTINEL/);
      throw new Error("Synthetic image failure");
    },
    villagesLogger: () => ({ warn() {} }),
  } as any);
  await Promise.all([
    images.generateFirstPrivateSpaceImage("bungalow", "bedroom"),
    images.generateFirstPrivateSpaceImage("bungalow", "bedroom"),
  ]);
  assert.equal(draws, 1, "first vacant-room entry gets one image attempt");
  await images.generateFirstPrivateSpaceImage("bungalow", "bedroom");
  assert.equal(draws, 1, "failed initial images require explicit retry");
  assert.ok(bedroom.initialImageAttemptedAt);
  const persisted = coerceVillageState(structuredClone(village));
  assert.equal(
    resolveVenueZone(persisted.venues[0], "bedroom")!.initialImageAttemptedAt,
    bedroom.initialImageAttemptedAt,
  );
  bedroom.state.items = Array.from({ length: 24 }, () => "Large established physical item ".repeat(8).slice(0, 240));
  await assert.rejects(
    () => images.generateVillageLocationImage("bungalow", undefined, undefined, "", false, "bedroom"),
    /Synthetic image failure/,
    "oversized saved interiors fit the prompt and reach the image provider",
  );
  assert.equal(draws, 2);
  const priorRoom = structuredClone(bedroom);
  bedroom.state.condition = "Existing damage";
  bedroom.roomSpecification = "A new garden-facing window";
  prepareRenovatedPrivateInterior(bedroom, priorRoom);
  assert.equal(bedroom.preparation?.mode, "renovation");
  assert.equal(bedroom.description, priorRoom.description, "approved specification waits for reconciled preparation");
  assert.deepEqual(bedroom.lastObserved, priorRoom.lastObserved);
  assert.equal(bedroom.initialImageAttemptedAt, priorRoom.initialImageAttemptedAt);
  await preparation.preparePrivateSpaces();
  assert.equal(calls, 2, "an approved Renovation prepares exactly once");
  assert.equal(bedroom.state.items.length, 24, "reconciliation preserves existing contents beyond initial room limits");
  assert.equal(bedroom.state.condition, "Existing damage");
  await preparation.preparePrivateSpaces();
  assert.equal(calls, 2);
  const ownRoom = { ...structuredClone(bedroom), ownerId: "player", description: "My authored interior" };
  prepareRenovatedPrivateInterior(ownRoom);
  assert.equal(ownRoom.description, "My authored interior", "player-owned Renovation keeps its authored appearance");
}
void (async () => {
  await privateInteriorLifecycle();
  await main();
})();
