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
  state.foundingHistory = "The founders arrived after a storm.";
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
