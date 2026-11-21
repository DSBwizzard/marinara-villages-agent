import assert from "node:assert/strict";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import {
  sharedPlayspace,
  assertSharedPlayspace,
} from "../packages/villages/src/server/domain/rules/shared-playspace.js";
import { applyAccessCommand } from "../packages/villages/src/server/domain/rules/venue-access.js";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { createVillageStateService } from "../packages/villages/src/server/features/world/village-state-service.js";
import {
  admitNarrative,
  ensureNarrative,
  readNarrativeDevelopment,
} from "../packages/villages/src/server/domain/rules/narrative-development.js";
import { worldNarrativeContext } from "../packages/villages/src/server/domain/rules/narrative-prompts.js";
import { narrationCircumstancePrompt } from "../packages/villages/src/server/domain/rules/narration-circumstance.js";
import { validateRoutineDay } from "../packages/villages/src/server/domain/rules/owned-routine.js";
import { venueFixture } from "./helpers/venues.fixture.js";
import type { VillageState } from "../packages/villages/src/server/domain/models/world.js";

const at = new Date("2026-11-19T12:00:00.000Z");
function world(count = 3) {
  const state = defaultVillageState();
  state.timeZone = "UTC";
  state.seed = "shared-space";
  state.setupAt = state.foundedAt = at.toISOString();
  state.villagers = Array.from({ length: count }, (_, i) => ({
    characterId: `resident-${i}`,
    incarnation: "one",
    letterFontId: "caveat",
    addedAt: at.toISOString(),
    cardSnapshot: { id: `resident-${i}`, name: `Resident ${i}`, capturedAt: at.toISOString() },
    agenda: null,
  })) as VillageState["villagers"];
  state.venues = ["square", "garden", "hall"].map((id) => venueFixture({ id, name: id, classes: ["community"] }));
  return state;
}
const common = (state: VillageState, index = 0) => state.venues[index]!.zones!.find((zone) => zone.kind === "public")!;
assertSharedPlayspace(world(), at);
{
  const state = world();
  state.venues = [state.venues[0]!, structuredClone(state.venues[0]!)];
  assert.equal(
    sharedPlayspace(state, at).sufficient,
    false,
    "Duplicate records cannot manufacture a second destination",
  );
}
for (const residents of [1, 8, 9, 12]) {
  const state = world(residents);
  state.venues.pop();
  assert.equal(sharedPlayspace(state, at).sufficient, residents <= 8);
}
{
  const state = world();
  state.venues = [state.venues[0]!];
  const zone = common(state);
  state.venues[0]!.zones!.push({ ...structuredClone(zone), id: "second-room" });
  assert.equal(sharedPlayspace(state, at).sufficient, false, "Two rooms in one building are not two destinations");
}
for (const restrict of [
  (s: VillageState) => {
    common(s).access!.mode = "permission-required";
  },
  (s: VillageState) => {
    common(s).access!.accompanied = true;
  },
  (s: VillageState) => {
    common(s).access!.visitorHours = [];
  },
  (s: VillageState) => {
    s.venues[0]!.constructionStatus = "worksite";
  },
  (s: VillageState) => {
    common(s).preparation = { status: "pending" } as any;
  },
  (s: VillageState) => {
    common(s).kind = "restricted";
  },
  (s: VillageState) => {
    s.venues[0]!.access!.bans.push({
      id: "ban",
      active: true,
      visitorId: "resident-0",
      zoneId: null,
      issuerId: "player",
      issuedAt: at.toISOString(),
      sourceLineIds: [],
    });
  },
]) {
  const state = world();
  restrict(state);
  assert.equal(sharedPlayspace(state, at).zoneCount, 2);
  state.venues.pop();
  assert.throws(() => assertSharedPlayspace(state, at), /Open replacement shared space first/);
}
{
  const state = world();
  state.venues[0]!.access!.managerIds = ["player", "resident-0"];
  state.venues[0]!.workerIds = ["resident-0"];
  state.venues[0]!.classes = ["community", "workplace"];
  state.venues[0]!.zones!.push({
    ...structuredClone(common(state)),
    id: "office",
    kind: "staff",
    access: { ...common(state).access!, mode: "permission-required" },
  });
  assert.equal(
    sharedPlayspace(state, at).zoneCount,
    3,
    "Management, workers and private areas elsewhere impose no special restriction",
  );
  applyAccessCommand(
    state.venues[0]!,
    {
      action: "venue-policy",
      operationId: "normal-management",
      expectedRevision: 0,
      zoneId: null,
      managerIds: ["resident-0"],
      visitorHours: null,
    },
    "player",
    at.toISOString(),
    ["player", "resident-0"],
  );
  assert.deepEqual(state.venues[0]!.access!.managerIds, ["resident-0"]);
}
{
  const state = world();
  const zone = common(state);
  state.venues[0]!.zones!.push({ ...structuredClone(zone), id: "deep-room", connectedTo: [zone.id] });
  zone.connectedTo = ["exterior", "deep-room"];
  assert.equal(sharedPlayspace(state, at).zoneCount, 4);
  assert.equal(
    sharedPlayspace(state, at, { venueId: "square", zoneId: zone.id }).zoneCount,
    2,
    "Losing a transit Zone also removes everything behind it",
  );
  zone.access!.mode = "permission-required";
  const blocks = validateRoutineDay(
    [{ activity: "Read", venueId: "square", zoneId: "deep-room", startMinute: 720, endMinute: 810, flexible: true }],
    state.villagers[0]!,
    state,
    at,
  );
  assert.equal(blocks[0]!.venueId, "", "Residents cannot route through a private Zone");
}
{
  const state = world();
  const zone = common(state);
  zone.access!.visitorHours = [
    {
      days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      start: "00:00",
      end: "12:00",
    },
    {
      days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      start: "12:00",
      end: "00:00",
    },
  ];
  assert.equal(sharedPlayspace(state, at).zoneCount, 3, "Equivalent full-day schedules count");
  zone.access!.visitorHours[1]!.start = "12:01";
  assert.equal(sharedPlayspace(state, at).zoneCount, 2, "Even a small opening-hours gap does not count as always open");
}

{
  const state = world();
  state.venues.pop();
  ensureNarrative(state, at.toISOString());
  const zone = common(state);
  state.venues[0]!.zones!.push({ ...structuredClone(zone), id: "deep-room", connectedTo: [zone.id] });
  zone.connectedTo = ["exterior", "deep-room"];
  const local = { venueId: "square", zoneId: zone.id };
  const grant = admitNarrative(state, at.toISOString(), "damage", "world", local)!;
  assert.equal(worldNarrativeContext(grant).target.ordinaryUseRestrictionAllowed, false);
  assert.equal(narrationCircumstancePrompt(grant)!.ordinaryUseRestrictionAllowed, false);
  const reply = {
    severity: "gentle",
    occurrence: "A beam falls across the passage.",
    situation: {
      scope: "zone",
      id: null,
      expectedRevision: 0,
      title: "Fallen beam",
      summary: "The passage is blocked.",
      status: "active",
    },
    room: [],
    conditions: [
      {
        id: null,
        expectedRevision: 0,
        ...local,
        observation: "A fallen beam blocks the passage.",
        restriction: "ordinary-use",
        remedy: "Clear the beam.",
        endsAt: new Date(at.getTime() + 3600000).toISOString(),
        clear: false,
      },
    ],
    weather: null,
  };
  assert.throws(() => readNarrativeDevelopment(reply, grant), /A restriction needs/);
  state.venues.push(world().venues[2]!);
  const allowed = admitNarrative(state, at.toISOString(), "spare-space", "world", local)!;
  assert.equal(worldNarrativeContext(allowed).target.ordinaryUseRestrictionAllowed, true);
  assert.equal(readNarrativeDevelopment(reply, allowed).conditions[0]!.restriction, "ordinary-use");
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
    1,
    results.map((row) => (row.status === "rejected" ? String(row.reason) : "ok")).join("; "),
  );
  assert.equal(sharedPlayspace(await a.readAuthority(), at).zoneCount, 2);
  const before = structuredClone(rows);
  await assert.rejects(
    () =>
      a.mutateAuthority((state) => {
        state.venues.forEach((venue) => {
          venue
            .zones!.filter((zone) => zone.kind === "public")
            .forEach((zone) => {
              zone.access!.mode = "permission-required";
            });
        });
      }),
    /Open replacement shared space first/,
  );
  assert.deepEqual(rows, before, "Rejected compound changes publish neither world nor history");
}
console.log("Shared playspace, ordinary management, autonomous routes and concurrent publication passed.");
