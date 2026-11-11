import {
  foundingCircumstanceText,
  foundingCircumstanceFromText,
} from "../packages/villages/src/shared/helpers/founding-circumstance.js";
import {
  communityVenueEligible,
  designateCommunityVenue,
} from "../packages/villages/src/server/domain/rules/community-venue.js";
import { applyAccessCommand, projectVenueAccess } from "../packages/villages/src/server/domain/rules/venue-access.js";
import { createVenueCommands } from "../packages/villages/src/server/features/venues/venue-service.js";
import { validateRoutineDay } from "../packages/villages/src/server/domain/rules/owned-routine.js";
import assert from "node:assert/strict";
import {
  defaultVillageState,
  coerceVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { newSetupVenue } from "../packages/villages/src/client/features/founding/FoundingPanels.js";
import { startingZone } from "../packages/villages/src/client/features/founding/founding-template.js";
import {
  assignFoundingHome,
  reconcileFoundingRoster,
} from "../packages/villages/src/client/features/founding/founding-homes.js";
import { parsePlace, parsePlaces } from "../packages/villages/src/server/domain/rules/founding-record.js";
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
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import { continuityViews } from "../packages/villages/src/server/domain/rules/continuity.js";
import { createResidences } from "../packages/villages/src/server/features/venues/residence-service.js";
import { residenceProposal } from "../packages/villages/src/server/domain/rules/residence-agreement.js";
import {
  completeResidenceMove,
  decideResidenceMove,
} from "../packages/villages/src/server/domain/rules/residence-move.js";
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
function drafts(assignments: Record<string, string> = {}) {
  let rows = reconcileFoundingRoster(
    [],
    actors,
    actors.map((actor) => actor.id),
    "community",
  );
  for (const [actor, home] of Object.entries(assignments))
    rows = assignFoundingHome(rows, `founding-home:${home}`, actor, true);
  return rows
    .filter((venue) => !venue.classes?.includes("residence") || venue.occupancy.playerHome || venue.residentIds?.length)
    .map((venue, index) => ({
      ...venue,
      ...(venue.classes?.includes("residence") ? { layout: "both", privateSpaces: [startingZone(venue, true)] } : {}),
      presentation: { ...venue.presentation, x: 0.1 + index * 0.15, y: 0.5 },
    }));
}
// Saved-world fixtures include post-founding Venues and shared homes.
function restorePlaces(rows: ReturnType<typeof drafts>) {
  return rows.map((row) => {
    const venue = parsePlace(row);
    if (venue.category === "public-center") venue.access!.managerIds = [];
    return venue;
  });
}
function world(groups: Record<string, string> = {}) {
  const state = defaultVillageState();
  state.setupAt = state.foundedAt = state.simulatedThrough = at;
  state.seed = "local-community";
  state.timeZone = "UTC";
  state.venues = restorePlaces(drafts(groups));
  state.communityVenueId = "community";
  state.villagers = actors.slice(1).map((actor) => ({
    letterFontId: "caveat",
    characterId: actor.id,
    incarnation: "one",
    cardSnapshot: { id: actor.id, name: actor.name, capturedAt: at },
    addedAt: at,
    agenda: null,
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

{
  let rows = reconcileFoundingRoster(
    [],
    actors,
    actors.map((actor) => actor.id),
    "community",
  );
  const original = structuredClone(rows.find((row) => row.id === "founding-home:player")!);
  const privateHome = rows.find((row) => row.id === "founding-home:a")!;
  privateHome.privateSpaces = [startingZone(privateHome, true)];
  privateHome.layout = "both";
  const privateOwner = rows.find((row) => row.id === "founding-home:a")!.privateSpaces![0].ownerId;
  rows = assignFoundingHome(rows, "founding-home:a", "player", true);
  rows = assignFoundingHome(rows, original.id, "player", true);
  const restored = rows.find((row) => row.id === original.id)!;
  assert.equal(restored.description, original.description);
  assert.deepEqual(restored.presentation, original.presentation);
  assert.equal(
    rows.find((row) => row.id === "founding-home:a")!.privateSpaces![0].ownerId,
    privateOwner,
    "Reassigning a housemate never transfers another person's private room",
  );
  const saved = restorePlaces(
    rows.map((row, i) => ({ ...row, presentation: { ...row.presentation, x: 0.1 + i * 0.15, y: 0.5 } })),
  );
  assert.equal(
    saved.find((row) => row.id === original.id)!.destinations!.player.sleep,
    "common:base",
    "Reoccupying a vacated home establishes an explicit accessible sleeping destination",
  );
  const fresh = newSetupVenue("empty-home", "residence", 0.2, 0.7);
  fresh.name = "Empty cottage";
  rows = assignFoundingHome([...rows, fresh], fresh.id, "a", true);
  const founded = restorePlaces(
    rows.map((row, i) => ({ ...row, presentation: { ...row.presentation, x: 0.1 + i * 0.1, y: 0.5 } })),
  );
  assert.equal(founded.find((row) => row.id === fresh.id)!.destinations!.a.sleep, "common:base");
  const withoutHome = assignFoundingHome(rows, fresh.id, "a", false);
  const retained = reconcileFoundingRoster(withoutHome, actors, [], "community");
  assert.ok(
    retained.every((row) => !row.residentIds?.includes("a")),
    "Reconciliation never recreates an intentionally cleared assignment",
  );
  assert.equal(retained.find((row) => row.id === fresh.id)!.name, "Empty cottage");
  assert.deepEqual(
    assignFoundingHome(retained, "community", "a", true),
    retained,
    "The Community Venue cannot become a home through assignment",
  );
}

{
  let live = world();
  const replacement = newSetupVenue("courtyard", "other", 0.3, 0.7);
  replacement.name = "Public courtyard";
  live.venues = restorePlaces([...drafts(), replacement]);
  const current = live.venues.find((row) => row.id === "community")!;
  const candidate = live.venues.find((row) => row.id === "courtyard")!;
  const commands = createVenueCommands({
    readVillageState: async () => structuredClone(live),
    mutateVillageState: async (update) => {
      const next = structuredClone(live);
      update(next);
      live = next;
      return structuredClone(live);
    },
    buildVillageSnapshot: async () => ({}) as any,
    sceneQueries: () => ({ activeVenueSession: async () => null }),
    withSceneNavigation: async (work) => work(),
  });
  const before = JSON.stringify(live);
  for (const action of [
    "recover-managers",
    "venue-policy",
    "zone-policy",
    "ban",
    "refuse-entry",
    "leave-now",
  ] as const) {
    assert.throws(
      () =>
        applyAccessCommand(
          current,
          {
            action,
            operationId: "blocked:" + action,
            expectedRevision: current.access!.revision,
            zoneId: null,
            managerIds: ["player"],
            visitorId: "a",
          } as any,
          "player",
          at,
          actors.map((row) => row.id),
          [],
          live.communityVenueId,
        ),
      /another Community Venue/,
    );
  }
  assert.equal(JSON.stringify(live), before, "Rejected restrictions do not mutate saved access or receipts");
  await assert.rejects(
    commands.changeVenueAccess(current.id, {
      action: "recover-managers",
      operationId: "api-recover",
      expectedRevision: current.access!.revision,
      zoneId: null,
      managerIds: ["player"],
    }),
    /another Community Venue/,
  );
  assert.equal(projectVenueAccess(current, "player", live.communityVenueId)!.canRecover, false);
  const command = {
    action: "community-venue" as const,
    operationId: "replace-neutral",
    zoneId: null,
    expectedRevision: candidate.access!.revision,
    previousVenueId: current.id,
    previousRevision: current.access!.revision,
  };
  for (const mutate of [
    (v: any) => {
      v.access.managerIds = ["a"];
    },
    (v: any) => {
      v.workerIds = ["a"];
    },
    (v: any) => {
      const archive = structuredClone(v.zones.find((z: any) => z.kind === "public"));
      archive.id = "archive";
      archive.access.mode = "permission-required";
      archive.access.managerIds = ["player"];
      v.zones.push(archive);
    },
    (v: any) => {
      v.access.visitorHours = [];
    },
    (v: any) => {
      v.access.bans.push({ active: true });
    },
    (v: any) => {
      v.zones.find((z: any) => z.kind === "public").access.accompanied = true;
    },
    (v: any) => {
      v.zones.find((z: any) => z.kind === "public").controllerIds = ["a"];
    },
  ]) {
    const copy = structuredClone(live),
      target = copy.venues.find((row) => row.id === candidate.id)!;
    mutate(target);
    assert.equal(communityVenueEligible(target, true), false);
    const unchanged = JSON.stringify(copy);
    assert.throws(() => designateCommunityVenue(copy, target, command, at), /public, always-open/);
    assert.equal(JSON.stringify(copy), unchanged);
  }
  await commands.changeVenueAccess(candidate.id, command);
  const committed = JSON.stringify(live);
  await commands.changeVenueAccess(candidate.id, command);
  assert.equal(JSON.stringify(live), committed, "A lost acknowledgement retries the exact designation without replay");
  assert.equal(live.communityVenueId, candidate.id);
  const loaded = coerceVillageState(JSON.parse(committed));
  assert.equal(loaded.communityVenueId, candidate.id, "The ongoing designation survives restart");
  assert.equal(communityVenueEligible(loaded.venues.find((row) => row.id === candidate.id)!), true);
  assert.equal(
    projectVenueAccess(
      live.venues.find((row) => row.id === current.id)!,
      "player",
      live.communityVenueId,
    )!.canRecover,
    true,
    "The former Community Venue uses ordinary management rules",
  );
  await commands.changeVenueAccess(current.id, {
    action: "recover-managers",
    operationId: "ordinary-recover",
    expectedRevision: live.venues.find((row) => row.id === current.id)!.access!.revision,
    zoneId: null,
    managerIds: ["player"],
  });
  await commands.changeVenueAccess(current.id, {
    action: "venue-policy",
    operationId: "ordinary-close",
    expectedRevision: live.venues.find((row) => row.id === current.id)!.access!.revision,
    zoneId: null,
    managerIds: ["player"],
    visitorHours: [],
  });
  const stale = structuredClone(live),
    target = stale.venues.find((row) => row.id === current.id)!;
  assert.throws(
    () => designateCommunityVenue(stale, target, { ...command, operationId: "stale", previousVenueId: current.id }, at),
    /Community access changed/,
  );
  assert.equal(stale.communityVenueId, candidate.id);
  const publicPlace = live.venues.find((row) => row.id === candidate.id)!;
  for (const actor of actors)
    assert.equal(
      evaluateZoneAccess(
        publicPlace,
        publicPlace.zones!.find((zone) => zone.kind === "public")!,
        actor.id,
        { at: new Date(at) },
      ).allowed,
      true,
    );
  const routine = validateRoutineDay(
    [
      {
        activity: "Meet neighbors",
        venueId: candidate.id,
        zoneId: "common:base",
        startMinute: 0,
        endMinute: 90,
        flexible: true,
      },
    ],
    live.villagers[0],
    live,
    new ZonedDate(at, "UTC"),
  );
  assert.equal(routine[0].venueId, candidate.id, "The neutral place remains an ordinary available routine destination");
  const owned = structuredClone(candidate);
  owned.zones!.find((zone) => zone.kind === "public")!.controllerIds = ["player"];
  owned.access!.visitDenials = [{ sceneId: "old-scene", zoneId: "common:base", visitorId: "a", issuerId: "player" }];
  assert.equal(
    communityVenueEligible(owned, true),
    true,
    "The player can release their own control and old visit-specific refusals",
  );
  const released = world();
  released.venues.push(owned);
  designateCommunityVenue(
    released,
    owned,
    {
      ...command,
      operationId: "release-own-control",
      expectedRevision: owned.access!.revision,
      previousVenueId: "community",
      previousRevision: released.venues.find((v) => v.id === "community")!.access!.revision,
    },
    at,
  );
  assert.deepEqual(owned.access!.managerIds, []);
  assert.deepEqual(owned.access!.visitDenials, []);
  assert.deepEqual(owned.zones!.find((z) => z.kind === "public")!.controllerIds, []);
  assert.equal(communityVenueEligible(owned), true);
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
  /four Residences/,
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
  state.venues = restorePlaces([...drafts(), mall, second]);
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
  const summary = "海辺の共同生活を始める人々が不足した交通手段を工夫している。".repeat(65);
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
  const episode = state.episodes.records.find((episode) =>
    episode.commandReceipts.some((receipt) => receipt.targetId === situations[0].id),
  )!;
  const learned = state.continuity.versions.filter((version) => episode.continuityVersionIds.includes(version.id));
  assert.equal(learned.length, actors.length);
  for (const actor of actors) {
    const view = continuityViews(state.continuity, continuityActor(state, actor.id)!, at, new Set()).find(
      (view) => view.id === learned[0].rootId,
    )!;
    assert.equal(view.version.text, summary, "each admitted holder retains the complete multibyte meaning");
    assert.equal(view.version.sources[0].excerpt, summary);
  }
  const restarted = coerceVillageState(state);
  assert.equal(restarted.narrative!.situations[1].scope, "zone");
  assert.ok(summary.length > 1200);
  assert.equal(restarted.narrative!.situations[0].summary, summary);
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
      room: [],
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
  await service.decideVillageResidence("c", false, oldScope);
  await service.proposeVillageResidence("c", target.id);
  move = state.residences.find((row) => row.characterId === "c")!;
  const scope = move.agreement!.scope;
  assert.notEqual(scope, oldScope, "replacement requests have independent consent identities");
  assert.throws(() => decideResidenceMove(state, "c", true, "villager", "c", oldScope, new Date()), /reviewed move/);
  for (const id of ["c", "a", "b"]) decideResidenceMove(state, "c", true, "villager", id, scope, new Date());
  move = state.residences.find((row) => row.characterId === "c")!;
  assert.equal(move.status, "moving");
  assert.equal(Date.parse(move.completesAt!) - Date.parse(move.approvedAt!), 86400_000);
  const completesAt = move.completesAt;
  decideResidenceMove(state, "c", true, "villager", "a", scope, new Date());
  assert.equal(state.residences[0].completesAt, completesAt, "duplicate consent does not postpone a move");
  state = coerceVillageState(state);
  assert.equal(state.residences[0].agreement!.scope, scope);
  assert.equal(completeResidenceMove(state, "c", false, new Date(Date.parse(completesAt!) - 1)), false);
  assert.equal(completeResidenceMove(state, "c", false, new Date(completesAt!)), true);
  assert.deepEqual(state.venues.find((venue) => venue.id === target.id)!.residentIds, ["a", "b", "c"]);
  await service.movePlayerToResidence(target.id);
  move = state.residences.find((row) => row.characterId === "player")!;
  for (const id of ["a", "b", "c"])
    decideResidenceMove(state, "player", true, "villager", id, move.agreement!.scope, new Date());
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
  const bedroom = home.zones!.find((zone) => zone.id === home.destinations!.b.sleep)!;
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
        {
          ...design,
          zones: interiors()
            .filter((zone) => zone.id !== bedroom.id)
            .map((zone) => ({ ...zone, connectedTo: ["exterior"] })),
        },
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
  lounge.access = { ...lounge.access!, managerIds: ["a"], memberIds: ["a"], memberRoles: [] };
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
  const initial = reconcileFoundingRoster(
    [],
    actors,
    actors.map((actor) => actor.id),
    "community",
  );
  const home = initial.find((row) => row.residentIds?.includes("a"))!;
  home.name = "Ada's authored home";
  home.privateSpaces = [startingZone(home, true)];
  home.layout = "both";
  home.privateSpaces![0].description = "A keepsake on a shelf";
  const regrouped = assignFoundingHome(initial, "founding-home:player", "a", true);
  const retained = regrouped.find((row) => row.id === home.id)!;
  assert.equal(retained.name, home.name);
  assert.equal(retained.privateSpaces![0].description, "A keepsake on a shelf");
  retained.presentation = { ...retained.presentation, x: 0.3, y: 0.2 };
  const saved = restorePlaces(
    regrouped.map((row, i) => ({
      ...row,
      presentation: { ...row.presentation, x: 0.1 + i * 0.1, y: 0.5 },
    })),
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
  const {
    fixture,
    renovation,
    venue: makeVenue,
    seedObservedProjectRoom,
  } = await import("./fixtures/villages-projects.fixture.js");
  const { venueFixture } = await import("./helpers/venues.fixture.js");
  const { buildLocationPrompt } = await import("../packages/villages/src/server/domain/rules/location-image-rules.js");
  const { venueInZone } = await import("../packages/villages/src/server/domain/rules/venue-zones.js");
  const { observableRoomDescription } = await import("../packages/villages/src/server/domain/rules/zone-picture.js");
  const { projectRoomEntries } = await import("../packages/villages/src/server/domain/rules/project-room-edits.js");
  const f = fixture();
  await f.mutate((state) => {
    const mall = state.venues[0];
    mall.name = "Seafront mall";
    mall.description = "An abandoned mall with a boarded entrance";
    mall.zones![0].description = mall.description;
    seedObservedProjectRoom(state, mall, "common", "The atrium floor is damaged; shopfronts remain boarded.");
    state.venues.push(
      venueFixture({ ...makeVenue("second-mall", "community"), description: "An operating mall with glass doors" }),
    );
    state.venues.find((v) => v.id === "second-mall")!.zones![0].description = "An operating mall with glass doors";
    state.setting = "An oceanfront expanse";
    state.worldRules = "The sun never sets";
  });
  const mall = f.state().venues[0];
  const [entry] = projectRoomEntries(f.state(), mall, "common", f.state().setupAt)!;
  const id = await renovation(f, {
    roomEdits: [
      {
        zoneId: "common",
        entryId: entry.id,
        version: entry.version,
        text: "The atrium floor is repaired; shopfronts remain boarded.",
      },
    ],
  });
  await f.agree(id);
  await f.service.startProjectConstruction(id, f.body(id));
  await f.service.debugCompleteProjectConstruction(id, f.body(id));
  const restarted = coerceVillageState(JSON.parse(JSON.stringify(f.state())));
  const restored = restarted.venues.find((v) => v.id === mall.id)!;
  const appearance = observableRoomDescription(restarted, restored.id, "common", restored.state.updatedAt);
  assert.match(appearance, /floor is repaired; shopfronts remain boarded/);
  assert.match(restored.description, /boarded entrance/);
  assert.equal(restarted.venues.find((v) => v.id === "second-mall")!.description, "An operating mall with glass doors");
  const picture = buildLocationPrompt(
    restarted,
    { ...venueInZone(restored, "common"), description: appearance },
    "Old lore describes a damaged atrium",
    "interior",
  );
  assert.match(picture, /floor is repaired/);
  assert.match(picture, /Standing world rules: The sun never sets/);
  assert.match(picture, /lore and starting descriptions cannot undo/);
}

{
  const initial = reconcileFoundingRoster(
      [],
      actors,
      actors.map((actor) => actor.id),
      "community",
    ),
    home = initial.find((row) => row.residentIds?.includes("b"))!;
  home.residenceCapacity = 4;
  home.foundingCapacity = 4;
  assert.equal(
    assignFoundingHome(initial, "founding-home:player", "b", true).find((row) => row.id === home.id)?.residenceCapacity,
    4,
    "Moving a starting resident retains capacity-only edits",
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
  const replacement = newSetupVenue("replacement-common", "other", 0.3, 0.6);
  replacement.name = "Replacement square";
  const parsed = restorePlaces([...drafts(), replacement]).find((row) => row.id === replacement.id)!;
  await f.mutate((state) => {
    state.venues.push(parsed);
    const old = state.venues.find((row) => row.id === "community")!;
    assert.throws(
      () =>
        readRenovationChange(
          state,
          old,
          {
            detail: "Make a home",
            classes: ["residence"],
            capacity: 2,
            zones: old
              .zones!.filter((z) => z.kind !== "exterior")
              .map((z) => ({ ...z, kind: "shared-residence", venueClass: "residence" })),
          },
          new Date(at),
        ),
      /another Community Venue/,
    );
    designateCommunityVenue(
      state,
      parsed,
      {
        action: "community-venue",
        operationId: "before-repurpose",
        zoneId: null,
        expectedRevision: parsed.access!.revision,
        previousVenueId: old.id,
        previousRevision: old.access!.revision,
      },
      at,
    );
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
  const id = f
    .state()
    .projects.find((project) => Object.hasOwn(project.lifecycle!.commandReceipts, "repurpose-community"))!.id;
  await f.agree(id);
  await f.service.startProjectConstruction(id, f.body(id));
  await f.service.debugCompleteProjectConstruction(id, f.body(id));
  const loaded = coerceVillageState(JSON.parse(JSON.stringify(f.state())));
  assert.equal(loaded.communityVenueId, replacement.id, "A replacement preserves the neutral place during repurposing");
  assert.deepEqual(
    loaded.venues.find((v) => v.id === target.id)!.classes,
    ["residence"],
    "A former Community Venue can be repurposed after designating a replacement",
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
  for (const id of ["a", "b"]) decideResidenceMove(state, "player", true, "villager", id, scope, new Date());
  assert.equal(
    state.venues.find((v) => v.id === target.id)!.occupancy.playerHome,
    false,
    "Housemates cannot approve on behalf of a private room controller",
  );
  decideResidenceMove(state, "player", false, "villager", "b", scope, new Date());
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
    decideResidenceMove(state, "c", true, "villager", id, move.agreement!.scope, new Date());
  assert.equal(state.residences.find((row) => row.characterId === "c")!.status, "moving");
  decideResidenceMove(state, "c", false, "villager", "a", move.agreement!.scope, new Date());
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
  const { foundingTaskRevision, ownsFoundingTask } =
    await import("../packages/villages/src/server/domain/rules/founding-tasks.js");
  const state = coerceVillageState(JSON.parse(JSON.stringify(world())));
  const scene = coerceSession({
    version: 5,
    id: "frozen-history",
    placeId: "community",
    zoneId: "common:base",
    area: "public",
    status: "active",
    villageSeed: state.seed,
    startedAt: at,
    participants: [],
    activeIds: [],
    lines: [],
    submissions: [],
  });
  const captured = captureSceneContinuity(state, scene, Date.parse(at));
  assert.equal(Object.hasOwn(captured.facts, "foundingHistory"), false);
  scene.continuity = captured;
  const serialized = JSON.stringify(captured.facts);
  const restarted = coerceSession(JSON.parse(JSON.stringify(scene)));
  assert.equal(
    JSON.stringify(restarted.continuity!.facts),
    serialized,
    "Already admitted Scene facts retain exact text and serialized order",
  );
  const retired = structuredClone(scene);
  (retired.continuity!.facts as any).foundingHistory = "RETIRED HISTORY";
  assert.equal(Object.hasOwn(coerceSession(retired).continuity!.facts, "foundingHistory"), false);
  const departure = captureReturnContext(state, new Date(at));
  departure.world.worldRules = "EXACT DEPARTURE WORLD RULES";
  state.returnCatchup = { capture: departure };
  const identity = returnCaptureRevision(departure);
  const loaded = coerceVillageState(JSON.parse(JSON.stringify(state)));
  assert.equal(returnCaptureRevision(loaded.returnCatchup!.capture), identity);
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

{
  const legacy = [
    { scope: "zone" as const, summary: "A closed road.", venueId: "community", zoneId: "common:base" },
    { scope: "village" as const, summary: "A festival.", venueId: "", zoneId: "" },
  ];
  const original = structuredClone(legacy);
  assert.equal(foundingCircumstanceText(legacy), "A closed road.\n\nA festival.");
  assert.deepEqual(legacy, original, "Displaying an old draft retains its exact scope and source");
  assert.deepEqual(foundingCircumstanceFromText("Edited. Another sentence."), [
    { scope: "village", summary: "Edited. Another sentence.", venueId: "", zoneId: "" },
  ]);
  assert.deepEqual(foundingCircumstanceFromText("  "), []);
}
