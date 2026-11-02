import assert from "node:assert/strict";
import {
  defaultVillageState,
  coerceVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { newSetupVenue } from "../packages/villages/src/client/features/founding/FoundingPanels.js";
import { foundingHouseholds } from "../packages/villages/src/client/features/founding/founding-households.js";
import { parsePlaces } from "../packages/villages/src/server/domain/rules/founding-record.js";
import {
  readFoundingCircumstances,
  seedFoundingCircumstances,
} from "../packages/villages/src/server/domain/rules/founding-circumstances.js";
import { evaluateZoneAccess } from "../packages/villages/src/server/domain/rules/venue-access.js";
import {
  admitNarrative,
  applyNarrativeDevelopment,
  readNarrativeDevelopment,
} from "../packages/villages/src/server/domain/rules/narrative-development.js";
import { backgroundRevision } from "../packages/villages/src/server/domain/rules/background-revision.js";
import { villageCurrentSetting } from "../packages/villages/src/server/domain/rules/prompt-preset.js";
import { createResidences } from "../packages/villages/src/server/features/venues/residence-service.js";
import { residenceProposal } from "../packages/villages/src/server/domain/rules/residence-agreement.js";
import { completeResidenceMove } from "../packages/villages/src/server/domain/rules/residence-move.js";
import { accessibleVenueRoute } from "../packages/villages/src/server/domain/rules/venue-path.js";
import { ZonedDate } from "../packages/villages/src/shared/helpers/zoned-date.js";
import type { VillageState } from "../packages/villages/src/server/domain/models/world.js";
import { readRenovationChange } from "../packages/villages/src/server/domain/rules/project-design.js";
import { completeProject } from "../packages/villages/src/server/domain/rules/project-completion.js";
import { draftRenovationProject } from "../packages/villages/src/server/features/projects/project-drafts.js";

const at = "2026-11-02T12:00:00.000Z";
const actors = [
  { id: "player", name: "Player" },
  { id: "a", name: "Ada" },
  { id: "b", name: "Bryn" },
  { id: "c", name: "Cleo" },
];
function drafts(groups: Record<string, string> = {}) {
  return [...foundingHouseholds([], actors, groups), newSetupVenue("community", "community", 0.7, 0.7)].map(
    (venue, index) => ({ ...venue, presentation: { ...venue.presentation, x: 0.1 + index * 0.15, y: 0.5 } }),
  );
}
function world(groups: Record<string, string> = {}) {
  const state = defaultVillageState();
  state.setupAt = state.foundedAt = state.simulatedThrough = at;
  state.seed = "local-community";
  state.timeZone = "UTC";
  state.venues = parsePlaces(drafts(groups), new Set(["a", "b", "c"]), true, "community", new ZonedDate(at, "UTC"));
  state.communityVenueId = "community";
  state.villagers = actors.slice(1).map((actor) => ({
    characterId: actor.id,
    cardSnapshot: { id: actor.id, name: actor.name, capturedAt: at },
    addedAt: at,
    agenda: null,
    remap: null,
    remapFailure: null,
    wishes: [],
  })) as VillageState["villagers"];
  return state;
}

for (const [groups, count] of [
  [{}, 5],
  [{ player: "player", a: "player", b: "player", c: "player" }, 2],
  [{ player: "player", a: "player", b: "b", c: "b" }, 3],
] as const) {
  const state = world(groups);
  assert.equal(state.venues.length, count);
  assert.equal(coerceVillageState(state).venues.length, count, "shared homes survive native decoding");
  const community = state.venues.find((venue) => venue.id === "community")!;
  assert.deepEqual(community.access!.managerIds, []);
  const common = community.zones!.find((zone) => zone.kind === "public")!;
  for (const actor of actors) assert.equal(evaluateZoneAccess(community, common, actor.id).allowed, true);
  for (const home of state.venues.filter((venue) => venue.classes!.includes("residence")))
    for (const actor of [...home.residentIds!, ...(home.occupancy.playerHome ? ["player"] : [])])
      assert.ok(home.destinations![actor].sleep);
}

for (const change of [
  (venue: any) => {
    venue.classes = ["residence"];
  },
  (venue: any) => {
    venue.spaces[0].access.mode = "permission-required";
  },
  (venue: any) => {
    venue.spaces[0].access.managerIds = ["a"];
  },
  (venue: any) => {
    venue.spaces[0].access.accompanied = true;
  },
  (venue: any) => {
    venue.spaces[0].access.visitorHours = [];
  },
  (venue: any) => {
    venue.spaces[0].description = "";
  },
]) {
  const rows = drafts();
  change(rows.find((row) => row.id === "community"));
  assert.throws(() => parsePlaces(rows, new Set(["a", "b", "c"]), true, "community"));
}
assert.throws(
  () =>
    parsePlaces(
      [...drafts(), ...Array.from({ length: 12 }, (_, i) => newSetupVenue(`extra-${i}`, "other", 0.5, 0.5))],
      new Set(["a", "b", "c"]),
      true,
      "community",
    ),
  /16/,
);

{
  const state = world();
  const mall = newSetupVenue("mall-one", "other", 0.4, 0.4);
  mall.name = "Abandoned mall";
  mall.description = "A derelict mall with a boarded entrance.";
  mall.spaces![0].description = "A damaged public atrium with a sound roof.";
  const second = {
    ...structuredClone(mall),
    id: "mall-two",
    name: "Operating mall",
    description: "A tidy mall with open glass doors.",
  };
  state.venues = parsePlaces([...drafts(), mall, second], new Set(["a", "b", "c"]), true, "community");
  const first = state.venues.find((venue) => venue.id === mall.id)!;
  assert.deepEqual(first.access!.managerIds, ["player"]);
  first.zones!.find((zone) => zone.kind === "public")!.description =
    "The atrium floor is repaired; the shopfronts remain boarded.";
  const restarted = coerceVillageState(state);
  assert.match(
    restarted.venues.find((venue) => venue.id === mall.id)!.zones!.find((zone) => zone.kind === "public")!.description,
    /floor is repaired/,
  );
  assert.equal(restarted.venues.find((venue) => venue.id === second.id)!.description, second.description);
  assert.equal(restarted.venues.length, 7, "mentions and descriptions do not allocate destinations");
}

{
  const state = world();
  state.worldRules = "No magic.";
  const summary = "海辺の共同生活を始める人々が不足した交通手段を工夫している。".repeat(12);
  const situations = readFoundingCircumstances(
    [
      { scope: "village", summary, venueId: "", zoneId: "" },
      {
        scope: "zone",
        summary: "The public noticeboard needs new notices.",
        venueId: "community",
        zoneId: "common:base",
      },
    ],
    state.venues,
    at,
  );
  seedFoundingCircumstances(
    state,
    situations,
    actors.map((actor) => actor.id),
    at,
  );
  const learned = state.memories.records.filter((record) => record.origin.id.startsWith("founding:0:"));
  assert.equal(learned.map((record) => record.text).join(""), summary, "all multibyte starting knowledge is retained");
  for (const record of learned)
    assert.deepEqual(Object.keys(record.knowers).sort(), actors.map((actor) => actor.id).sort());
  const restarted = coerceVillageState(state);
  assert.equal(restarted.narrative!.situations[1].scope, "zone");
  const grant = admitNarrative(restarted, "2026-11-02T13:00:00.000Z", "resolve-start", "world", {
    venueId: "community",
    zoneId: "common:base",
  })!;
  restarted.narrative!.claims = [
    {
      id: grant.id,
      attemptId: "one",
      venueId: "community",
      zoneId: "common:base",
      fingerprint: backgroundRevision(grant),
    },
  ];
  const physical = structuredClone(restarted.venues);
  const development = readNarrativeDevelopment(
    {
      severity: "gentle",
      occurrence: "Transport is running again.",
      situation: {
        scope: "village",
        id: situations[0].id,
        expectedRevision: 1,
        title: "Transport",
        summary: "Transport is running again.",
        status: "resolved",
      },
      physical: [],
      conditions: [],
      weather: null,
    },
    grant,
  );
  applyNarrativeDevelopment(restarted, grant, development);
  assert.deepEqual(restarted.venues, physical, "resolving circumstances never repairs Zones");
  assert.equal(restarted.worldRules, "No magic.");
  assert.equal(restarted.narrative!.situations[0].scope, "zone");
  assert.equal(restarted.narrative!.situations.find((row) => row.id === situations[0].id)!.targets.length, 0);
  assert.equal(villageCurrentSetting(restarted).includes(summary), false);
  assert.equal(coerceVillageState(restarted).narrative!.receipts[0].after.situations[0].scope, "village");
  assert.throws(() => coerceVillageState({ ...state, version: 13 }), /fresh|format|version/i);
}

async function housing() {
  let state = world({ a: "a", b: "a" });
  const target = state.venues.find((venue) => venue.residentIds?.includes("a"))!;
  target.residenceCapacity = 4;
  const service = createResidences({
    mutateVillageState: async (update) => {
      const next = structuredClone(state);
      update(next);
      state = next;
      return state;
    },
    buildVillageSnapshot: async () => state as any,
  });
  await service.proposeVillageResidence("c", target.id);
  let move = state.residences.find((row) => row.characterId === "c")!;
  const oldScope = move.agreement!.scope;
  await service.decideVillageResidence("c", false, "player", undefined, undefined, oldScope);
  await service.proposeVillageResidence("c", target.id);
  move = state.residences.find((row) => row.characterId === "c")!;
  const scope = move.agreement!.scope;
  assert.notEqual(scope, oldScope, "replacement requests have independent consent identities");
  await assert.rejects(
    service.decideVillageResidence("c", true, "villager", "late-old", "c", oldScope),
    /reviewed move/,
  );
  for (const id of ["c", "a", "b"])
    await service.decideVillageResidence("c", true, "villager", `approve:${id}`, id, scope);
  move = state.residences.find((row) => row.characterId === "c")!;
  assert.equal(move.status, "moving");
  assert.equal(Date.parse(move.completesAt!) - Date.parse(move.approvedAt!), 86400_000);
  const completesAt = move.completesAt;
  await service.decideVillageResidence("c", true, "villager", "repeat", "a", scope);
  assert.equal(state.residences[0].completesAt, completesAt, "duplicate consent does not postpone a move");
  state = coerceVillageState(state);
  assert.equal(state.residences[0].agreement!.scope, scope);
  assert.equal(completeResidenceMove(state, "c", false, new Date(Date.parse(completesAt!) - 1)), false);
  assert.equal(completeResidenceMove(state, "c", false, new Date(completesAt!)), true);
  assert.deepEqual(state.venues.find((venue) => venue.id === target.id)!.residentIds, ["a", "b", "c"]);
  await service.movePlayerToResidence(target.id);
  move = state.residences.find((row) => row.characterId === "player")!;
  for (const id of ["a", "b", "c"])
    await service.decideVillageResidence("player", true, "villager", `player:${id}`, id, move.agreement!.scope);
  assert.equal(
    state.venues.find((venue) => venue.id === target.id)!.occupancy.playerHome,
    true,
    "player moves apply as soon as all agreements are saved",
  );
  assert.equal(state.residences.find((row) => row.characterId === "player")!.status, "current");
}
await housing();

{
  const state = world({ a: "a", b: "a" }),
    target = state.venues.find((venue) => venue.residentIds?.includes("a"))!;
  target.residenceCapacity = 4;
  const move = residenceProposal(state, "c", target, "player", at, "", "stale-move");
  for (const id of move.agreement!.requiredIds) move.agreement!.approvals[id] = true;
  move.status = "moving";
  move.completesAt = at;
  state.residences = [move];
  target.residentIds!.push("new-housemate");
  assert.equal(completeResidenceMove(state, "c", true, new Date(at)), false);
  assert.equal(move.status, "pending");
  assert.match(move.holdReason!, /household|destination|capacity|place/i);
  assert.equal(target.residentIds!.includes("c"), false);
  assert.deepEqual(move.agreement!.approvals, {});
}

{
  const state = world(),
    target = state.venues.find((venue) => venue.id === "community")!,
    zone = target.zones!.find((zone) => zone.kind === "public")!;
  seedFoundingCircumstances(
    state,
    [],
    actors.map((actor) => actor.id),
    at,
  );
  state.narrative!.conditions = [
    {
      id: "damage",
      revision: 1,
      situationId: "storm",
      venueId: target.id,
      zoneId: zone.id,
      observation: "Broken benches make ordinary use unsafe.",
      restriction: "ordinary-use",
      remedy: "Repair the benches.",
      startsAt: at,
      endsAt: null,
      clearedAt: null,
      physicalRevision: 0,
    },
  ];
  const access = evaluateZoneAccess(target, zone, "player", { environment: state.narrative, at: new Date(at) });
  assert.equal(access.allowed, true);
  assert.equal(access.canManage, false);
  assert.equal(access.canInvite, false);
  assert.match(access.explanation, /inspection/i);
  assert.equal(
    accessibleVenueRoute(state, target, "player", zone.id, new Date(at)),
    false,
    "ordinary use stays restricted",
  );
  assert.equal(accessibleVenueRoute(state, target, "player", zone.id, new Date(at), false, false), true);
}
{
  for (const corrupt of [
    (state: VillageState) => {
      delete state.venues[0].zones![1].access;
    },
    (state: VillageState) => {
      delete state.venues[0].zones![1].connectedTo;
    },
    (state: VillageState) => {
      state.venues[0].zones![1].connectedTo = ["missing"];
    },
    (state: VillageState) => {
      state.venues[0].zones!.forEach((zone) => {
        zone.connectedTo = [];
      });
    },
    (state: VillageState) => {
      state.venues.push(structuredClone(state.venues[0]));
    },
  ]) {
    const raw = JSON.parse(JSON.stringify(world())) as VillageState;
    corrupt(raw);
    assert.throws(
      () => coerceVillageState(raw),
      /policies|connections|Connections|Unreachable|identities/i,
      "malformed native state is rejected without fixture completion",
    );
  }
}
{
  const { fixture } = await import("./fixtures/villages-projects.fixture.js");
  const projects = fixture(),
    id = await projects.newProject();
  await projects.service.startProjectConstruction(id, projects.body(id));
  await projects.service.debugCompleteProjectConstruction(id, projects.body(id));
  const loaded = coerceVillageState(JSON.parse(JSON.stringify(projects.state())));
  const built = loaded.venues.find((venue) => venue.id === projects.get(id).venueId)!;
  assert.equal(built.constructionStatus, "complete");
  assert.equal(
    built.zones!.every((zone) => Array.isArray(zone.connectedTo) && (zone.kind === "exterior" || !!zone.access)),
    true,
    "Project output supplies canonical links and policies before native decoding",
  );
  const malformed = JSON.parse(JSON.stringify(projects.state())) as VillageState;
  const savedPlan = malformed.projects.find((project) => project.id === id)!.plan!;
  for (const zone of [...(savedPlan.spaces ?? []), ...(savedPlan.privateSpaces ?? [])]) delete zone.connectedTo;
  assert.throws(
    () => coerceVillageState(malformed),
    /explicit connections/,
    "Saved plans cannot invent passages on reload",
  );
  const unidentified = JSON.parse(JSON.stringify(projects.state())) as VillageState;
  const unnamedPlan = unidentified.projects.find((project) => project.id === id)!.plan!;
  const unnamedZones = [...(unnamedPlan.spaces ?? []), ...(unnamedPlan.privateSpaces ?? [])];
  unnamedZones.forEach((zone) => {
    zone.connectedTo = ["exterior"];
  });
  delete (unnamedZones[0] as { id?: string }).id;
  assert.throws(
    () => coerceVillageState(unidentified),
    /explicit Zone identities/,
    "Saved plans cannot invent Zone IDs",
  );
}
{
  const state = world({ a: "a", b: "a" }),
    home = state.venues.find((venue) => venue.residentIds?.includes("a"))!;
  const bedroom = home.zones!.find((zone) => zone.id === home.destinations!.a.sleep)!;
  const lounge = { ...structuredClone(bedroom), id: "lounge", name: "Lounge", connectedTo: ["exterior"] };
  home.zones!.push(lounge);
  home.zones![0].connectedTo!.push(lounge.id);
  const design = { detail: "Rework the home.", classes: home.classes, capacity: home.residenceCapacity };
  const interiors = () => home.zones!.filter((zone) => zone.kind !== "exterior");
  assert.throws(
    () =>
      readRenovationChange(
        state,
        home,
        { ...design, zones: interiors().filter((zone) => zone.id !== bedroom.id) },
        new Date(at),
      ),
    /sleeping destination/,
  );
  assert.throws(
    () =>
      readRenovationChange(
        state,
        home,
        {
          ...design,
          classes: ["residence", "community"],
          zones: interiors().map((zone) =>
            zone.id === bedroom.id ? { ...zone, kind: "public", venueClass: "community" } : zone,
          ),
        },
        new Date(at),
      ),
    /sleeping destination/,
  );
  lounge.access = { ...lounge.access!, managerIds: ["b"], memberIds: ["b"], memberRoles: [] };
  assert.throws(
    () =>
      readRenovationChange(
        state,
        home,
        {
          ...design,
          zones: interiors().map((zone) => ({
            ...zone,
            connectedTo: zone.id === bedroom.id ? [lounge.id] : ["exterior", bedroom.id],
          })),
        },
        new Date(at),
      ),
    /sleeping destination/,
    "a private intermediate room cannot block another housemate's sleep",
  );
  lounge.access = structuredClone(bedroom.access);
  const project = draftRenovationProject(state, home.id, {
    ...design,
    zones: interiors().filter((zone) => zone.id !== lounge.id),
  });
  home.destinations!.a.sleep = lounge.id;
  assert.throws(
    () => completeProject(state, project, at),
    /sleeping destination/,
    "completion revalidates a changed sleeping assignment",
  );
  assert.equal(
    home.zones!.some((zone) => zone.id === lounge.id),
    true,
  );
}
console.log(
  "Local community: housing, public Community, stable places, scoped circumstances, shared knowledge and consent persistence passed.",
);

{
  const initial = foundingHouseholds([], actors, {});
  const home = initial.find((row) => row.residentIds?.includes("a"))!;
  home.name = "Ada's authored home";
  home.privateSpaces![0].description = "A keepsake on a shelf";
  const regrouped = foundingHouseholds(initial, actors, { a: "player" });
  const retained = regrouped.find((row) => row.id === home.id)!;
  assert.equal(retained.name, home.name);
  assert.equal(retained.privateSpaces![0].description, "A keepsake on a shelf");
  retained.presentation = { ...retained.presentation, x: 0.3, y: 0.2 };
  const saved = parsePlaces(
    [...regrouped, newSetupVenue("community", "community", 0.7, 0.7)].map((row, i) => ({
      ...row,
      presentation: { ...row.presentation, x: 0.1 + i * 0.1, y: 0.5 },
    })),
    new Set(["a", "b", "c"]),
    true,
    "community",
    new ZonedDate(at, "UTC"),
  );
  const vacant = saved.find((row) => row.id === home.id)!;
  assert.equal(
    evaluateZoneAccess(
      vacant,
      vacant.zones!.find((zone) => zone.kind === "shared-residence")!,
      "b",
    ).allowed,
    true,
    "A retained vacant home starts open",
  );
}

{
  const { fixture, renovation, venue: makeVenue } = await import("./fixtures/villages-projects.fixture.js");
  const { venueFixture } = await import("./helpers/venues.fixture.js");
  const { buildLocationPrompt } = await import("../packages/villages/src/server/domain/rules/location-image-rules.js");
  const { deriveVillageMoment } = await import("../packages/villages/src/server/domain/rules/village-clock.js");
  const { venueInZone } = await import("../packages/villages/src/server/domain/rules/venue-zones.js");
  const f = fixture();
  await f.mutate((state) => {
    const mall = state.venues[0];
    mall.name = "Seafront mall";
    mall.description = "An abandoned mall with a boarded entrance";
    mall.zones![0].description = mall.description;
    mall.zones![1].description = "The atrium floor is damaged; shopfronts remain boarded.";
    state.venues.push(
      venueFixture({ ...makeVenue("second-mall", "community"), description: "An operating mall with glass doors" }),
    );
    state.venues.find((v) => v.id === "second-mall")!.zones![0].description = "An operating mall with glass doors";
    state.setting = "An oceanfront expanse";
    state.worldRules = "The sun never sets";
  });
  const mall = f.state().venues[0];
  const id = await renovation(f, {
    zones: mall
      .zones!.filter((z) => z.kind !== "exterior")
      .map((z) => ({ ...z, description: "The atrium floor is repaired; shopfronts remain boarded." })),
  });
  await f.agree(id);
  await f.service.startProjectConstruction(id, f.body(id));
  await f.service.debugCompleteProjectConstruction(id, f.body(id));
  const restarted = coerceVillageState(JSON.parse(JSON.stringify(f.state())));
  const restored = restarted.venues.find((v) => v.id === mall.id)!;
  assert.match(
    restored.zones!.find((z) => z.id === "common")!.description,
    /floor is repaired; shopfronts remain boarded/,
  );
  assert.match(restored.description, /boarded entrance/);
  assert.equal(restarted.venues.find((v) => v.id === "second-mall")!.description, "An operating mall with glass doors");
  const picture = buildLocationPrompt(
    restarted,
    venueInZone(restored, "common"),
    deriveVillageMoment({ foundedAt: restarted.foundedAt, seed: restarted.seed, now: new Date(at) }),
    "Old lore describes a damaged atrium",
    "interior",
  );
  assert.match(picture, /floor is repaired/);
  assert.match(picture, /Standing world rules: The sun never sets/);
  assert.match(picture, /lore and starting descriptions cannot undo/);
}

{
  const initial = foundingHouseholds([], actors, {}),
    home = initial.find((row) => row.residentIds?.includes("b"))!;
  home.residenceCapacity = 4;
  assert.equal(
    foundingHouseholds(initial, actors, { b: "player" }).find((row) => row.id === home.id)?.residenceCapacity,
    4,
    "Regrouping retains capacity-only edits",
  );
  const state = world();
  state.setting += " " + Array.from({ length: 75 }, (_, i) => "Farm " + i).join(", ");
  assert.equal(coerceVillageState(state).venues.length, 5, "Seventy-five farm mentions create no destinations");
  const cases = readFoundingCircumstances(
    [{ scope: "zone", summary: "Local-only circumstance", venueId: "community", zoneId: "common:base" }],
    state.venues,
    at,
  );
  seedFoundingCircumstances(
    state,
    cases,
    actors.map((row) => row.id),
    at,
  );
  const { currentVillageCircumstances } = await import("../packages/villages/src/server/domain/rules/prompt-preset.js");
  assert.deepEqual(currentVillageCircumstances(state), []);
  assert.deepEqual(currentVillageCircumstances(state, "community", "common:base"), ["Local-only circumstance"]);
  assert.deepEqual(currentVillageCircumstances(state, "founding-home:a", "common:base"), []);
}

{
  const { fixture } = await import("./fixtures/villages-projects.fixture.js");
  const f = fixture();
  await f.mutate((state) => {
    const maps = state.maps,
      villagers = state.villagers;
    Object.assign(state, world());
    state.maps = maps;
    state.villagers = villagers;
  });
  const target = f.state().venues.find((v) => v.id === "community")!;
  await f.service.createRenovationProject(target.id, {
    requestId: "repurpose-community",
    title: "A new use",
    detail: "Convert this gathering room into an unused residence",
    classes: ["residence"],
    capacity: 2,
    zones: target
      .zones!.filter((z) => z.kind !== "exterior")
      .map((z) => ({ ...z, venueClass: "residence", kind: "shared-residence" })),
  });
  const id = "project:repurpose-community";
  await f.agree(id);
  await f.service.startProjectConstruction(id, f.body(id));
  await f.service.debugCompleteProjectConstruction(id, f.body(id));
  const loaded = coerceVillageState(JSON.parse(JSON.stringify(f.state())));
  assert.equal(loaded.communityVenueId, target.id, "The original designation remains historical");
  assert.deepEqual(
    loaded.venues.find((v) => v.id === target.id)!.classes,
    ["residence"],
    "Starting Community land use is not permanently protected",
  );
}
{
  let state = world({ a: "a", b: "a" });
  const target = state.venues.find((v) => v.residentIds?.includes("a"))!;
  target.residenceCapacity = 4;
  const source = target.zones!.find((z) => z.kind !== "exterior")!;
  target.zones!.push({
    ...structuredClone(source),
    id: "guest-room",
    kind: "private-residence",
    name: "Guest room",
    ownerId: undefined,
    connectedTo: ["exterior"],
    access: {
      mode: "permission-required",
      managerIds: ["c"],
      memberIds: [],
      memberRoles: [],
      inviterIds: [],
      visitorHours: "always",
      accompanied: false,
    },
  });
  const service = createResidences({
    mutateVillageState: async (update) => {
      const next = structuredClone(state);
      update(next);
      state = next;
      return state;
    },
    buildVillageSnapshot: async () => state as any,
  });
  await service.movePlayerToResidence(target.id, "guest-room");
  let move = state.residences.find((row) => row.characterId === "player")!;
  const scope = move.agreement!.scope;
  await assert.rejects(service.proposeVillageResidence("c", target.id, "player", "", "guest-room"), /reserved/);
  for (const id of ["a", "b"])
    await service.decideVillageResidence("player", true, "villager", "housemate:" + id, id, scope);
  assert.equal(
    state.venues.find((v) => v.id === target.id)!.occupancy.playerHome,
    false,
    "Housemates cannot approve on behalf of a private room controller",
  );
  await service.decideVillageResidence("player", false, "villager", "withdraw-room", "b", scope);
  assert.equal(
    state.residences.some((row) => row.characterId === "player"),
    false,
    "Withdrawal cancels the reservation",
  );
  await service.proposeVillageResidence("c", target.id, "player", "", "guest-room");
  assert.equal(
    state.residences.find((row) => row.characterId === "c")!.status,
    "pending",
    "Cancellation releases the exact room for another proposed move",
  );
  assert.equal(
    state.venues.find((v) => v.id === target.id)!.zones!.find((z) => z.id === "guest-room")!.ownerId,
    undefined,
    "A reservation never transfers a private room",
  );
  move = state.residences.find((row) => row.characterId === "c")!;
  for (const id of ["a", "b", "c"])
    await service.decideVillageResidence("c", true, "villager", "reserve-approved:" + id, id, move.agreement!.scope);
  assert.equal(state.residences.find((row) => row.characterId === "c")!.status, "moving");
  await service.decideVillageResidence("c", false, "villager", "scheduled-withdrawal", "a", move.agreement!.scope);
  assert.equal(
    state.residences.some((row) => row.characterId === "c"),
    false,
    "A housemate can withdraw before a scheduled move applies",
  );
  assert.equal(state.venues.find((v) => v.id === target.id)!.residentIds!.includes("c"), false);
}

{
  const { isHouse, venueAssignedCountFor } = await import("../packages/villages/src/client/shared/venue.js");
  const { captureSceneLayout } = await import("../packages/villages/src/server/domain/rules/scene-layout.js");
  const canonical = world().venues[0];
  const broken = structuredClone(canonical);
  broken.zones!.forEach((zone) => {
    delete zone.connectedTo;
  });
  assert.throws(() => captureSceneLayout(broken), /connection map/, "New Scenes cannot invent missing passages");
  assert.equal(
    venueAssignedCountFor({
      ...canonical,
      residentIds: ["a", "b"],
      occupancy: { ...canonical.occupancy, playerHome: true },
    } as any),
    3,
  );
  assert.equal(
    venueAssignedCountFor({
      ...canonical,
      residentIds: undefined,
      occupancy: { ...canonical.occupancy, playerHome: false, residentCharacterId: "stale" },
    } as any),
    0,
    "A singular stale field cannot invent a household member",
  );
  assert.equal(
    isHouse({ classes: ["other"], occupancy: { playerHome: true, residentCharacterId: "stale" } } as any),
    false,
    "Residence class is explicit",
  );
}

{
  const { captureSceneContinuity } = await import("../packages/villages/src/server/domain/rules/scene-continuity.js");
  const { coerceSession } = await import("../packages/villages/src/server/domain/decoding/scene-codec.js");
  const { captureReturnContext } =
    await import("../packages/villages/src/server/domain/rules/return-catchup-capture.js");
  const { returnCaptureRevision } =
    await import("../packages/villages/src/server/domain/rules/return-capture-revision.js");
  const { fixtureRelationshipIdentity, fixtureWishIdentity } = await import("./helpers/village-storage.fixture.js");
  const { foundingTaskRevision, ownsFoundingTask } =
    await import("../packages/villages/src/server/domain/rules/founding-tasks.js");
  const state = coerceVillageState(JSON.parse(JSON.stringify(world())));
  const scene = coerceSession({
    version: 3,
    id: "frozen-history",
    placeId: "community",
    zoneId: "common:base",
    area: "public",
    status: "active",
    liveSceneVersion: 1,
    villageSeed: state.seed,
    startedAt: at,
    participants: [],
    activeIds: [],
    lines: [],
    submissions: [],
  });
  const captured = captureSceneContinuity(state, scene, Date.parse(at));
  assert.equal(Object.hasOwn(captured.facts, "foundingHistory"), false);
  captured.facts = Object.fromEntries(
    Object.entries(captured.facts).flatMap(([key, value]) =>
      key === "worldRules"
        ? [
            [key, value],
            ["foundingHistory", "EXACT RETAINED HISTORY"],
          ]
        : [[key, value]],
    ),
  ) as typeof captured.facts;
  scene.continuity = captured;
  const serialized = JSON.stringify(captured.facts);
  const restarted = coerceSession(JSON.parse(JSON.stringify(scene)));
  assert.equal(
    JSON.stringify(restarted.continuity!.facts),
    serialized,
    "Already admitted Scene facts retain exact text and serialized order",
  );
  const departure = captureReturnContext(state, new Date(at));
  (departure.world as any).foundingHistory = "EXACT DEPARTURE HISTORY";
  state.returnCatchup = { capture: departure };
  const identity = returnCaptureRevision(departure, fixtureRelationshipIdentity, fixtureWishIdentity);
  const loaded = coerceVillageState(JSON.parse(JSON.stringify(state)));
  assert.equal(
    returnCaptureRevision(loaded.returnCatchup!.capture, fixtureRelationshipIdentity, fixtureWishIdentity),
    identity,
  );
  assert.equal(Object.hasOwn(loaded, "foundingHistory"), false);
  const context = { circumstances: { details: "Admitted source history" } };
  const revision = foundingTaskRevision(state, "a", "routine", context);
  state.foundingPreparation = {
    status: "pending",
    tasksVersion: 1,
    tasks: { a: { routine: { contract: 1, revision, jobId: "retained", status: "failed", attempt: 1, error: "" } } },
    completedIds: [],
    currentId: "",
    error: "",
  };
  assert.equal(ownsFoundingTask(state, "a", "routine", revision, context), true);
  const changed = structuredClone(state);
  changed.venues[0].zones![1].description += " A new room layout.";
  assert.equal(
    ownsFoundingTask(changed, "a", "routine", revision, context),
    false,
    "Retained source history does not bypass current physical validation",
  );
}
