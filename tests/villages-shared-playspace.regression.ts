import assert from "node:assert/strict";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { openingPlayspace } from "../packages/villages/src/server/domain/rules/opening-playspace.js";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { createVillageStateService } from "../packages/villages/src/server/features/world/village-state-service.js";
import { admitNarrative, ensureNarrative } from "../packages/villages/src/server/domain/rules/narrative-development.js";
import { worldNarrativeContext } from "../packages/villages/src/server/domain/rules/narrative-prompts.js";
import { MAX_ZONE_VILLAGERS } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { venueFixture } from "./helpers/venues.fixture.js";
import type { VillageState } from "../packages/villages/src/server/domain/models/world.js";
const at = new Date("2026-11-19T12:00:00Z");
function world() {
  const state = defaultVillageState();
  state.timeZone = "UTC";
  state.seed = "opening-space";
  state.setupAt = state.foundedAt = at.toISOString();
  state.venues = ["square", "garden", "hall"].map((id) =>
    venueFixture({ id, name: id, spaces: [{ id: "community", description: "A room.", image: null }] }),
  );
  return state;
}
const common = (state: VillageState, index = 0) => state.venues[index].zones.find((zone) => zone.kind === "public")!;
const ids = ["a", "b", "c"];
{
  const state = world();
  state.venues = state.venues.slice(0, 1);
  assert.deepEqual(
    openingPlayspace(state, ids, at)[0].zoneIds,
    ["community", "exterior"],
    "One Venue is sufficient and indoor rooms come first",
  );
  const room = common(state);
  room.access.mode = "permission-required";
  assert.deepEqual(
    openingPlayspace(state, ids, at)[0].zoneIds,
    ["exterior"],
    "An inaccessible room never admits the opening group",
  );
  room.access.memberIds = ["player", ...ids];
  assert.ok(
    openingPlayspace(state, ids, at)[0].zoneIds.includes(room.id),
    "A shared private room can host all its admitted founders",
  );
  room.access.memberIds.pop();
  assert.ok(!openingPlayspace(state, ids, at)[0].zoneIds.includes(room.id));
  room.access.mode = "public";
  room.access.visitorHours = [{ days: ["Thursday"], start: "09:00", end: "17:00" }];
  state.timeZone = "America/Los_Angeles";
  assert.ok(!openingPlayspace(state, ids, at)[0].zoneIds.includes(room.id), "Opening hours use Village local time");
  assert.ok(openingPlayspace(state, ids, new Date("2026-11-19T18:00:00Z"))[0].zoneIds.includes(room.id));
  assert.ok(
    !openingPlayspace(state, ids, new Date("2026-11-20T02:00:00Z"))[0].zoneIds.includes(room.id),
    "A delayed gathering cannot enter after closing",
  );
  room.access.visitorHours = "always";
  room.access.mode = "permission-required";
  state.venues[0].zones.push({
    ...structuredClone(room),
    id: "inner",
    access: { ...room.access, mode: "public" },
    connectedTo: [room.id],
  });
  room.connectedTo = ["exterior", "inner"];
  assert.ok(
    !openingPlayspace(state, ids, at)[0].zoneIds.includes("inner"),
    "A public destination cannot bypass a restricted passage",
  );
  assert.equal(MAX_ZONE_VILLAGERS, 4);
  assert.deepEqual(openingPlayspace(state, ["a", "b", "c", "d", "e"], at), []);
  ensureNarrative(state, at.toISOString());
  const grant = admitNarrative(state, at.toISOString(), "damage", "world", { venueId: "square", zoneId: room.id })!;
  assert.equal(
    worldNarrativeContext(grant).target.ordinaryUseRestrictionAllowed,
    true,
    "Narrative restrictions do not reserve two public rooms",
  );
}
{
  // Two independent repository instances race through the real CAS boundary.
  const rows = new Map<string, any>();
  const documents = {
    getById: async (_pkg: string, id: string) => structuredClone(rows.get(id) ?? null),
    list: async (_pkg: string, kind: string) =>
      [...rows.values()].filter((row) => row.kind === kind).map((row) => structuredClone(row)),
    create: async (input: any) => {
      const row = { ...structuredClone(input), revision: 1 };
      rows.set(row.id, row);
      return row;
    },
    update: async (input: any) => {
      const previous = rows.get(input.id);
      if (!previous || previous.revision !== input.expectedRevision) return null;
      const row = { ...previous, ...structuredClone(input), revision: previous.revision + 1 };
      rows.set(row.id, row);
      return row;
    },
    remove: async (_pkg: string, id: string) => rows.delete(id),
  } as any;
  const a = createVillageRepository(() => documents),
    b = createVillageRepository(() => documents);
  const setup = createVillageStateService(a);
  await setup.mutateVillageState((state) => {
    state.name = "Draft";
  });
  assert.equal((await a.readAuthority()).setupAt, "", "Empty-world preferences save before public spaces exist");
  await a.mutateAuthority(
    (state) => {
      Object.assign(state, world());
    },
    { memories: true },
  );
  const restrict = (index: number) => (state: VillageState) => {
    common(state, index).access!.mode = "permission-required";
  };
  const results = await Promise.allSettled([a.mutateAuthority(restrict(0)), b.mutateAuthority(restrict(1))]);
  assert.equal(
    results.filter((row) => row.status === "fulfilled").length,
    2,
    results.map((row) => (row.status === "rejected" ? String(row.reason) : "ok")).join("; "),
  );

  await a.mutateAuthority((state) =>
    state.venues.forEach((venue) =>
      venue.zones.forEach((zone) => {
        if (zone.access) zone.access.mode = "permission-required";
      }),
    ),
  );
  assert.ok(
    (await a.readAuthority()).venues.every((venue) =>
      venue.zones.every((zone) => !zone.access || zone.access.mode === "permission-required"),
    ),
    "Ordinary saves need no public space quota",
  );
}
