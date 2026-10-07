import assert from "node:assert/strict";

import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { readVillageState } from "../packages/villages/src/server/features/world/village-store.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { replaceVillageTownMap } from "../packages/villages/src/server/features/media/town-map-review.js";
import type { VillageVenue } from "../packages/villages/src/server/domain/models/world.js";

const at = "2026-09-29T12:00:00.000Z";
const records = new Map<string, any>();
const documents = {
  async getById(_packageId: string, id: string) {
    return records.get(id) ?? null;
  },
  async list(_packageId: string, kind: string) {
    return [...records.values()].filter((entry) => entry.kind === kind);
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
  async remove(_packageId: string, id: string) {
    return records.delete(id);
  },
};

function venue(id: string, venueClass: "residence" | "workplace", x: number, y: number): VillageVenue {
  return {
    id,
    name: id,
    classes: [venueClass],
    spaces: [defaultVenueSpace(venueClass, id)],
    description: id,
    category: "",
    presentation: { image: null, x, y },
    occupancy: { playerHome: false, residentCharacterId: id === "home" ? "rosa" : null, homeKind: null },
    capabilities: [],
    workerIds: id === "worksite" ? ["rosa"] : [],
    residenceCapacity: 1,
    residentIds: id === "home" ? ["rosa"] : [],
    improvements: [null, null],
    state: {
      condition: "standing",
      upgrades: [],
      furniture: [],
      publicFacts: ["The old bell remains."],
      updatedAt: at,
    },
    ...(id === "worksite" ? { constructionStatus: "worksite", buildProjectId: "project-1" } : {}),
  };
}

function image(width: number): string {
  const bytes = new Uint8Array(24);
  bytes.set([137, 80, 78, 71, 13, 10, 26, 10], 0);
  new DataView(bytes.buffer).setUint32(16, width);
  new DataView(bytes.buffer).setUint32(20, 848);
  return `data:image/png;base64,${Buffer.from(bytes).toString("base64")}`;
}

const village = defaultVillageState();
village.setupAt = at;
village.foundedAt = at;
village.visitMemoryBackfilled = true;
village.townMapImage = image(1264);
village.townMapImageSetAt = at;
village.venues = [venue("home", "residence", 0.2, 0.3), venue("worksite", "workplace", 0.7, 0.8)];
records.set("villages-village", { id: "villages-village", kind: "village", data: village, revision: 1 });
const release = configureVillagesRuntime({
  logger: { debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} },
  persistence: { documents },
} as Parameters<typeof configureVillagesRuntime>[0]);

async function main() {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    assert.ok(String(url).includes("/api/image-metadata/inspect"), "only image inspection is requested");
    // Exercise the supported older-host decoder without a running local Engine.
    return Response.json({ error: "Not Found" }, { status: 404 });
  };
  try {
    const original = await readVillageState();
    const placements = original.venues.map((entry) => ({
      venueId: entry.id,
      fromX: entry.presentation.x,
      fromY: entry.presentation.y,
      x: entry.id === "home" ? 0.4 : entry.presentation.x,
      y: entry.id === "home" ? 0.5 : entry.presentation.y,
    }));
    const replacement = image(1400);
    await assert.rejects(
      replaceVillageTownMap({ image: replacement, expectedMapSetAt: at, placements: placements.slice(0, 1) }),
      /venue list changed/,
    );
    await assert.rejects(
      replaceVillageTownMap({
        image: replacement,
        expectedMapSetAt: at,
        placements: [{ ...placements[0], x: 1.2 }, placements[1]],
      }),
      /coordinates/,
    );
    await assert.rejects(
      replaceVillageTownMap({ image: "data:text/plain;base64,SGVsbG8=", expectedMapSetAt: at, placements }),
      /base64 image file/,
    );
    assert.equal((await readVillageState()).townMapImage, original.townMapImage);
    await replaceVillageTownMap({
      image: replacement,
      expectedMapSetAt: at,
      placements,
      view: { fit: "contain", zoom: 1, x: 0, y: 0 },
    });
    const saved = await readVillageState();
    assert.equal(saved.townMapImage, replacement);
    assert.equal(saved.townMapCanvasWidth, 1400);
    assert.deepEqual(
      saved.venues.map((entry) => [entry.presentation.x, entry.presentation.y]),
      [
        [0.4, 0.5],
        [0.7, 0.8],
      ],
    );
    assert.equal(saved.venues[0].occupancy.residentCharacterId, "rosa");
    assert.equal(saved.venues[1].constructionStatus, "worksite");
    assert.equal(saved.venues[1].buildProjectId, "project-1");
    assert.deepEqual(saved.venues[0].state.publicFacts, ["The old bell remains."]);
    await assert.rejects(replaceVillageTownMap({ image: "", expectedMapSetAt: at, placements }), /map changed/);
    await assert.rejects(
      replaceVillageTownMap({ image: "", expectedMapSetAt: saved.townMapImageSetAt, placements }),
      /photograph moved/,
    );
    const current = saved.venues.map((entry) => ({
      venueId: entry.id,
      fromX: entry.presentation.x,
      fromY: entry.presentation.y,
      x: entry.presentation.x,
      y: entry.presentation.y,
    }));
    await replaceVillageTownMap({ image: "", expectedMapSetAt: saved.townMapImageSetAt, placements: current });
    const cleared = await readVillageState();
    assert.equal(cleared.townMapImage, "");
    assert.equal(cleared.venues[0].presentation.x, 0.4);
    await assert.rejects(
      replaceVillageTownMap({ image: "", expectedMapSetAt: "", placements: [{ ...current[0], x: 0.9 }, current[1]] }),
      /replacement map/,
    );
    assert.equal((await readVillageState()).venues[0].presentation.x, 0.4);
    console.log("Villages map replacement: atomic photographs, occupied home, worksite, stale saves, removal ok");
  } finally {
    globalThis.fetch = originalFetch;
    release();
  }
}

void main();
