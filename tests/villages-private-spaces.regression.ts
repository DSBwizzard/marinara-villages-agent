import assert from "node:assert/strict";
import {
  defaultVillageState,
  coerceVillageState,
  readVillageState,
  mutateVillageState,
} from "../packages/villages/src/engine/packages/server/src/services/villages/village-store.js";
import { defaultVenueSpace } from "../packages/villages/src/engine/packages/server/src/services/villages/venue-model.js";
import {
  canOccupyZone,
  canInviteToZone,
  zoneControllerIds,
  resolveVenueZone,
  privateTarget,
  zoneClosed,
} from "../packages/villages/src/engine/packages/server/src/services/villages/venue-zones.js";
import { configureVillagesRuntime } from "../packages/villages/src/engine/packages/server/src/services/villages/package-runtime.js";
import {
  preparePrivateSpaces,
  retryPrivateSpaces,
} from "../packages/villages/src/engine/packages/server/src/services/villages/private-space-preparation.js";
import {
  sceneryPrompt,
  sceneryCharacterContext,
  sceneryImageKey,
  readSceneryStyle,
} from "../packages/villages/src/engine/packages/server/src/services/villages/scenery-context.js";
import {
  villageSettings,
  assertVenueImageAccess,
  applyResidenceEditApproval,
  setVillageVenueImage,
  readCreationPrivateZones,
} from "../packages/villages/src/engine/packages/server/src/services/villages/village.js";
import { generateFirstPrivateSpaceImage } from "../packages/villages/src/engine/packages/server/src/services/villages/location-image.js";
import type {
  VillageVenue,
  VillageState,
} from "../packages/villages/src/engine/packages/server/src/services/villages/types.js";
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
    state: { condition: "", furniture: [], publicFacts: [], features: [], traces: [], upgrades: [], updatedAt: stamp },
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
const park = venue("park", ["gathering"]);
park.zones = readCreationPrivateZones(
  [{ id: "restricted:greenhouse", name: "Greenhouse", purpose: "Keep seedlings", controllerIds: ["a", "b"] }],
  ["gathering"],
);
state.venues = [home, own, work, combined, park, venue("other", ["other"])];
const migrated = coerceVillageState(state);
assert.deepEqual(coerceVillageState(structuredClone(migrated)).venues, migrated.venues, "migration is idempotent");
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
    assert.equal(calls, 2, "concurrent preparation coalesces");
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
      "gathering controllers can issue saved room invitations",
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
      const { saveVillageConnections } =
        await import("../packages/villages/src/engine/packages/server/src/services/villages/connections.js");
      await saveVillageConnections({ imageConnectionId: "fixture-image" });
      await mutateVillageState((current) => {
        current.venues[2].playerInvitations = [
          { residentId: "b", zoneId: "staff", recordedAt: stamp, sourceLineId: "visit-vault" },
        ];
      });
      const { enterVenue, activeVenueSession } =
        await import("../packages/villages/src/engine/packages/server/src/services/villages/venue-session.js");
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
      assert.equal((await activeVenueSession()).zoneId, "exterior", "removed workers revoke the active invitation");
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
void main();
