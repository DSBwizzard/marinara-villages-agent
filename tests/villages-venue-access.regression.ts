import assert from "node:assert/strict";
import { venueDisplayZones } from "../packages/villages/src/client/features/venues/venue-view.js";
import {
  canOccupyZone,
  chooseAgendaZone,
  canInviteToZone,
  canRevokeZonePermission,
  zoneControllerIds,
} from "../packages/villages/src/server/domain/rules/venue-zones.js";
import { readSession } from "../packages/villages/src/server/adapters/storage/scene-store.js";
import { venueFixture } from "./helpers/venues.fixture.js";
import { villageFixtureDocuments, fixtureSceneState } from "./helpers/village-storage.fixture.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { unwrittenVillageAgenda } from "../packages/villages/src/server/domain/rules/agenda-plan.js";
import { agendaDateKey } from "../packages/villages/src/server/domain/rules/agenda-week.js";
import { validateRoutineDay } from "../packages/villages/src/server/domain/rules/owned-routine.js";
import { publicSceneResponse } from "../packages/villages/src/server/domain/rules/scene-public.js";
import { socialPlanValid } from "../packages/villages/src/server/domain/rules/social-rules.js";
import { routineRevision } from "../packages/villages/src/server/domain/rules/wish-policy.js";
import {
  applyAccessCommand,
  claimVisitPermission,
  evaluateZoneAccess,
  initializeVenueAccess,
  mayInvite,
  projectVenueAccess,
  projectZoneAccess,
  readVenueAccess,
  reconcileVenueAccess,
  withinVisitorHours,
} from "../packages/villages/src/server/domain/rules/venue-access.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { readSceneChanges } from "../packages/villages/src/server/features/scenes/changes.js";
import { activeVenueSession } from "../packages/villages/src/server/features/scenes/live-session.js";
import {
  endVenueSession,
  enterVenue,
  moveVenueZone,
} from "../packages/villages/src/server/features/scenes/venue-session.js";
import { mutateVillageState, readVillageState } from "../packages/villages/src/server/features/world/village-store.js";
import { changeVenueAccess } from "../packages/villages/src/server/features/venues/services.js";
import {
  contactCanEnter,
  contactPath,
  sceneAccessContext,
  sceneMoveAccompanying,
} from "../packages/villages/src/server/domain/rules/venue-contact.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import type { VillageVenue, VillageVenueZone } from "../packages/villages/src/server/domain/models/world.js";
import { sceneryImageKey } from "../packages/villages/src/server/domain/rules/scenery-context.js";
import { villageSettings } from "../packages/villages/src/server/domain/rules/world-snapshot.js";
import { capturePrivateInterior } from "../packages/villages/src/server/domain/rules/private-interior.js";
import type { AccessCommand } from "../packages/villages/src/shared/helpers/venue-access.js";

const known = ["player", "jim", "mara", "trina", "employee", "visitor"],
  stamp = new Date().toISOString();
function fixture(): VillageVenue {
  const zone = (id: string, ownerId?: string): VillageVenueZone => ({
    ...defaultVenueSpace("residence", id + " visible appearance"),
    id,
    name: id,
    purpose: id === "bedroom" ? "Sleeping" : "Everyday activities",
    kind: ownerId ? "private-residence" : "shared-residence",
    ownerId,
    seen: false,
  });
  const result: VillageVenue = venueFixture({
    id: "home",
    name: "Jim's home",
    venueType: "Home",
    form: "Converted cottage",
    classes: ["residence"],
    baseClasses: ["residence"],
    layoutVersion: 1,
    description: "The approach",
    residentIds: ["jim", "mara"],
    workerIds: ["employee"],
    residenceCapacity: 3,
    improvements: [null, null],
    category: "",
    occupancy: { playerHome: false, residentCharacterId: "jim", homeKind: null },
    capabilities: [],
    presentation: { image: null, x: 0.4, y: 0.4 },
    state: { revision: 0, recent: null, updatedAt: stamp },
    zones: [
      { ...zone("exterior"), kind: "exterior", seen: true },
      zone("living"),
      zone("bedroom", "jim"),
      zone("office", "jim"),
      zone("mara-bedroom", "mara"),
    ],
  });
  initializeVenueAccess(result);
  result.access!.managerIds = ["jim"];
  return result;
}
{
  const current = fixture();
  const command = {
    action: "invite",
    operationId: "current-format-grant",
    expectedRevision: 0,
    zoneId: "bedroom",
    visitorId: "player",
    duration: "visit",
    accompanied: false,
    outsideHours: false,
  } as const;
  const source = ["exact-native-source"];
  applyAccessCommand(current, command, "jim", stamp, known, source);
  claimVisitPermission(current, "current-format-grant", "native-scene");
  const raw = { ...current, usedInvitationIds: ["old"], playerInvitations: [{ residentId: "jim", zoneId: "living" }] };
  const roundtrip = coerceVillageState({ ...defaultVillageState(), venues: [raw] }).venues[0];
  assert(!Object.hasOwn(roundtrip, "playerInvitations"));
  assert(!Object.hasOwn(roundtrip, "usedInvitationIds"));
  assert.deepEqual(roundtrip.access, current.access, "Native receipts and claimed visits survive current reload");
  const restored = fixture();
  restored.access!.receipts[command.operationId] = {
    ...current.access!.receipts[command.operationId],
    revision: 0,
    outcome: "rejected",
  };
  const reloaded = coerceVillageState({ ...defaultVillageState(), venues: [restored] }).venues[0];
  assert.throws(() => applyAccessCommand(reloaded, command, "jim", stamp, known, source), /already rejected/);
  assert.equal(reloaded.access!.permissions.length, 0);
  const scene = coerceSession({
    version: 5,
    id: "native-scene",
    placeId: "home",
    zoneId: "exterior",
    legacyCast: true,
    dismissedZoneIds: ["bedroom"],
    grantedZoneIds: ["living"],
    zoneGrants: [{ zoneId: "living", controllerId: "jim" }],
  });
  for (const field of ["legacyCast", "dismissedZoneIds", "grantedZoneIds", "zoneGrants"])
    assert(!Object.hasOwn(scene, field), field);
  const projected = {
    ...current,
    zones: current.zones!.map((zone) => ({
      ...zone,
      accessView: projectZoneAccess(current, zone, "player", { sceneId: "native-scene" }),
    })),
  };
  const visible = venueDisplayZones(projected as any);
  assert(visible.find((zone) => zone.id === "exterior")!.allowed);
  assert(visible.find((zone) => zone.id === "bedroom")!.allowed);
  assert.equal(visible.find((zone) => zone.id === "living")!.allowed, false);
  assert.equal(
    venueDisplayZones({ ...projected, zones: projected.zones.map((zone) => ({ ...zone, closed: true })) } as any).some(
      (zone) => zone.allowed,
    ),
    false,
  );
  const noProjection = {
    ...projected,
    occupancy: { ...projected.occupancy, playerHome: true },
    playerInvitations: raw.playerInvitations,
    zones: projected.zones.map((zone) => ({ ...zone, accessView: undefined })),
  };
  assert.equal(
    venueDisplayZones(noProjection as any).some((zone) => zone.allowed),
    false,
    "Retired grants, ownership and Zone kind cannot replace a current access projection",
  );
  assert.deepEqual(
    venueDisplayZones({ ...noProjection, zones: undefined } as any),
    [],
    "No retired layout reconstruction",
  );
}
for (const retainZonePolicy of [false, true]) {
  const missing = fixture();
  delete missing.access;
  const world = defaultVillageState();
  world.venues = [missing];
  for (const target of missing.zones!) {
    if (target.kind === "exterior") continue;
    target.ownerId = "jim";
    target.controllerIds = ["jim", "employee"];
    if (!retainZonePolicy) delete target.access;
    for (const actor of ["jim", "employee"]) {
      assert.equal(
        canOccupyZone(missing, target, actor),
        false,
        "Role and owner fields cannot replace native access authority",
      );
      assert.equal(canInviteToZone(missing, target, actor), false);
      assert.equal(canRevokeZonePermission(missing, target, actor), false);
    }
    assert.deepEqual(zoneControllerIds(missing, target), []);
    assert.equal(contactCanEnter(world, missing, target.id, "player"), false);
    assert.equal(chooseAgendaZone(missing, "jim", "Visiting", target.id, world).id, "exterior");
  }
  assert.equal(
    canOccupyZone(
      missing,
      missing.zones!.find((zone) => zone.id === "exterior")!,
      "player",
    ),
    true,
    "Entrance remains available for egress",
  );
  assert.deepEqual(zoneControllerIds(missing, undefined), []);
}
{
  const native = fixture(),
    target = native.zones!.find((zone) => zone.id === "bedroom")!;
  target.closed = true;
  assert.equal(canInviteToZone(native, target, "jim"), false);
  assert.equal(
    canRevokeZonePermission(native, target, "jim"),
    true,
    "Closing a Zone cannot remove native withdrawal authority",
  );
  assert.equal(canRevokeZonePermission(native, target, "visitor"), false);
  assert.deepEqual(zoneControllerIds(native, target), ["jim"]);
  delete target.access;
  assert.equal(canOccupyZone(native, target, "jim"), false, "An interior Zone needs its own native policy");
}

{
  const home = fixture(),
    world = defaultVillageState();
  world.venues = [home];
  const scene = coerceSession({
    version: 5,
    id: "escort",
    status: "active",
    startedAt: stamp,
    zoneId: "exterior",
    sceneAttendance: {
      capturedAt: stamp,
      occupants: [{ characterId: "jim", name: "Jim", doing: "Waiting", zoneId: "living" }],
    },
  });
  const bedroom = home.zones!.find((row) => row.id === "bedroom")!;
  assert.equal(contactCanEnter(world, home, bedroom.id, "player", scene), false);
  applyAccessCommand(
    home,
    {
      action: "invite",
      operationId: "native-visit",
      expectedRevision: home.access!.revision,
      zoneId: bedroom.id,
      visitorId: "player",
      duration: "visit",
      accompanied: true,
      outsideHours: true,
    },
    "jim",
    stamp,
    known,
  );
  assert.equal(
    sceneMoveAccompanying(scene, home, bedroom, world),
    scene.accompanying,
    "an escort must be at the player's captured position",
  );
  scene.sceneAttendance!.occupants[0]!.zoneId = "exterior";
  assert.equal(
    contactCanEnter(world, home, bedroom.id, "player", scene),
    false,
    "an offer alone does not establish accompaniment",
  );
  scene.accompanying = sceneMoveAccompanying(scene, home, bedroom, world);
  assert.deepEqual(scene.accompanying, [{ characterId: "jim", zoneId: "bedroom" }]);
  assert.equal(contactCanEnter(world, home, bedroom.id, "player", scene), true);
  assert.equal(contactPath(world, home, bedroom.id, "exterior", "visitor", scene)?.at(-1), "exterior");
}
const venue = fixture(),
  zone = (id: string) => venue.zones!.find((zone) => zone.id === id)!;
const context = { sceneId: "scene-a", at: new Date(2026, 9, 5, 12), accepting: true };
const decide = (id: string, actor = "player", extra = {}) =>
  evaluateZoneAccess(venue, zone(id), actor, { ...context, ...extra });
let sequence = 0;
function command(action: Omit<AccessCommand, "operationId" | "expectedRevision">, actor = "jim") {
  const input = {
    ...action,
    operationId: "change-" + ++sequence,
    expectedRevision: venue.access!.revision,
  } as AccessCommand;
  applyAccessCommand(venue, input, actor, stamp, known);
  return input;
}
assert.equal(decide("exterior").mode, "unrestricted");
assert.equal(decide("living").allowed, false, "Home interiors start with permission required.");
assert.equal(
  decide("mara-bedroom", "jim").allowed,
  false,
  "Venue management grants no entry to Mara's independently managed bedroom.",
);
assert.equal(decide("mara-bedroom", "jim").canInvite, false);
assert.throws(
  () => command({ action: "zone-policy", zoneId: "mara-bedroom", policy: zone("mara-bedroom").access! } as any),
  /do not manage/,
);
const invite = command({
  action: "invite",
  zoneId: "bedroom",
  visitorId: "player",
  duration: "visit",
  accompanied: false,
  outsideHours: false,
} as any);
assert.equal(decide("bedroom").allowed, true, "Neutral Trina/Jim can invite without a relationship threshold.");
claimVisitPermission(venue, invite.operationId, "scene-a");
assert.equal(
  decide("bedroom", "player", { sceneId: "scene-b" }).allowed,
  false,
  "A one-visit invitation cannot carry into a new Scene.",
);
applyAccessCommand(venue, { ...invite, expectedRevision: venue.access!.revision }, "jim", stamp, known);
assert.equal(venue.access!.permissions.length, 1, "A semantic replay cannot duplicate a grant.");
assert.throws(
  () => applyAccessCommand(venue, { ...invite, visitorId: "visitor" } as any, "jim", stamp, known),
  /different access change/,
);
assert.throws(
  () => command({ action: "zone-policy", zoneId: "exterior", policy: zone("bedroom").access! } as any),
  /always Unrestricted/,
);
const standing = command({
  action: "invite",
  zoneId: "office",
  visitorId: "player",
  duration: "standing",
  accompanied: true,
  outsideHours: false,
} as any);
assert.equal(decide("office").reason, "accompaniment-required");
assert.equal(decide("office", "player", { positions: { jim: "office" } }).allowed, true);
assert.equal(decide("office", "player", { positions: { jim: "living" } }).allowed, false);
assert.equal(
  decide("living", "player", {
    relationships: { edges: { [JSON.stringify(["jim", "player"])]: { connection: "Friends" } } },
  }).allowed,
  false,
  "Friendship never grants access",
);
command({
  action: "invite",
  zoneId: "living",
  visitorId: "player",
  duration: "standing",
  accompanied: false,
  outsideHours: false,
} as any);
assert.equal(decide("living", "player").allowed, true, "Explicit standing permission permits entry");
const ban = command({ action: "ban", zoneId: null, visitorId: "player" } as any);
assert.equal(decide("exterior").allowed, true);
assert.equal(decide("bedroom").reason, "banned");
command({ action: "exception", zoneId: null, permissionId: invite.operationId, banIds: [ban.operationId] } as any);
assert.equal(decide("bedroom").allowed, true);
assert.equal(
  decide("office", "player", { positions: { jim: "office" } }).reason,
  "banned",
  "An exception is confined to its named invitation.",
);
command({ action: "ban", zoneId: null, visitorId: "player" } as any);
assert.equal(decide("bedroom").reason, "banned", "A later ban is not covered by a previous exception.");
for (const row of venue.access!.bans) row.active = false;
venue.access!.visitorHours = [{ days: ["Monday"], start: "09:00", end: "17:00" }];
assert.equal(decide("bedroom", "player", { at: new Date(2026, 9, 5, 23) }).reason, "outside-hours");
assert.equal(
  decide("bedroom", "jim", { at: new Date(2026, 9, 5, 23) }).allowed,
  true,
  "Designated members can enter outside hours.",
);
assert.equal(withinVisitorHours([{ days: ["Monday"], start: "22:00", end: "02:00" }], new Date(2026, 9, 6, 1)), true);
assert.equal(withinVisitorHours([{ days: ["Monday"], start: "22:00", end: "02:00" }], new Date(2026, 9, 6, 3)), false);
command({
  action: "invite",
  zoneId: "bedroom",
  visitorId: "player",
  duration: "standing",
  accompanied: false,
  outsideHours: true,
} as any);
assert.equal(decide("bedroom", "player", { at: new Date(2026, 9, 5, 23) }).allowed, true);
const state = defaultVillageState();
state.venues = [venue];
const imageKey = sceneryImageKey(state, venue, state.setupAt, "office"),
  prepKey = capturePrivateInterior(state, venue, zone("office"), state.setupAt).basis;
zone("office").access!.mode = "public";
assert.equal(sceneryImageKey(state, venue, state.setupAt, "office"), imageKey);
assert.equal(capturePrivateInterior(state, venue, zone("office"), state.setupAt).basis, prepKey);
const before = projectZoneAccess(venue, zone("mara-bedroom"), "player", context);
assert.equal(before.policy, undefined);
assert.equal(before.permissions, undefined);
assert.equal(projectVenueAccess(venue, "player")?.managerIds, undefined);
const snapshot = villageSettings(state, { name: "Player", missing: false } as any, null);
assert.equal(snapshot.venues[0]!.access, undefined);
assert.ok(snapshot.venues[0]!.zones!.every((zone) => !zone.access));
assert.equal(snapshot.venues[0]!.zones!.find((zone) => zone.id === "mara-bedroom")!.description, "");
for (const scenario of [
  "invited",
  "revoked",
  "escort-left",
  "escort-departed",
  "escort-cannot-enter",
  "banned",
  "closed",
  "hours-closed",
  "escort-already-inside",
]) {
  const world = defaultVillageState();
  const home = fixture();
  world.venues = [home];
  const target = home.zones!.find((zone) => zone.id === "office")!;
  const scene = coerceSession({
    version: 5,
    id: "escort-scene",
    villageSeed: world.seed,
    placeId: home.id,
    zoneId: "exterior",
    area: "outside",
    status: "active",
    startedAt: stamp,
    activeIds: ["jim"],
    participants: [{ characterId: "jim", name: "Jim" }],
    sceneAttendance: { capturedAt: stamp, occupants: [{ characterId: "jim", name: "Jim", zoneId: "exterior" }] },
  });
  applyAccessCommand(
    home,
    {
      action: "invite",
      operationId: "escorted-visit",
      expectedRevision: home.access!.revision,
      zoneId: target.id,
      visitorId: "player",
      duration: "visit",
      accompanied: true,
      outsideHours: false,
      sceneId: scene.id,
    },
    "jim",
    stamp,
    known,
  );
  if (scenario === "revoked") home.access!.permissions[0].revoked = true;
  if (scenario === "escort-left") scene.sceneAttendance!.occupants[0].zoneId = "living";
  if (scenario === "escort-departed") {
    scene.accompanying = [{ characterId: "jim", zoneId: target.id }];
    scene.departedIds = ["jim"];
  }
  if (scenario === "escort-cannot-enter") {
    target.access!.managerIds = [];
    target.access!.memberIds = [];
    target.access!.inviterIds = ["jim"];
  }
  if (scenario === "banned")
    applyAccessCommand(
      home,
      {
        action: "ban",
        operationId: "new-ban",
        expectedRevision: home.access!.revision,
        zoneId: target.id,
        visitorId: "player",
      },
      "jim",
      stamp,
      known,
    );
  if (scenario === "closed") home.constructionStatus = "worksite";
  if (scenario === "hours-closed") target.access!.visitorHours = [];
  if (scenario === "escort-already-inside") {
    scene.sceneAttendance!.occupants[0].zoneId = target.id;
  }
  const original = JSON.stringify({ home, scene });
  const context = sceneAccessContext(scene, undefined, world.timeZone);
  const view = villageSettings(
    world,
    { name: "Player", description: "", personaId: "", missing: false },
    scene,
    context,
  );
  const projected = view.venues[0].zones!.find((zone) => zone.id === target.id)!;
  assert.equal(
    projected.accessView!.decision.allowed,
    ["invited", "escort-already-inside"].includes(scenario),
    scenario,
  );
  assert.equal(projected.description, "", "An invitation never reveals the unvisited interior");
  assert.equal(
    JSON.stringify({ home, scene }),
    original,
    "Previewing entry mutates no positions, attendance or permission ledger",
  );
  if (scenario === "invited")
    assert.equal(
      evaluateZoneAccess(home, target, "player", { ...context, accepting: true }).reason,
      "accompaniment-required",
      "Actual presence remains outside until Move",
    );
}
assert.equal(
  publicSceneResponse({
    access: venue.access,
    accompanying: [{ characterId: "mara", zoneId: "mara-bedroom" }],
    sceneAttendance: { secret: true },
  }).access,
  undefined,
);
assert.deepEqual(
  readVenueAccess(JSON.parse(JSON.stringify(venue.access))),
  venue.access,
  "The authoritative ledger reloads without dropping receipts.",
);
const reloaded = coerceVillageState(state).venues[0]!;
const longReceiptVenue = structuredClone(venue);
const longGrant = longReceiptVenue.access!.permissions.find((grant) => grant.duration === "standing")!;
longGrant.id = "g".repeat(180);
longGrant.revoked = false;
const visitGrant = { ...longGrant, id: "visit-stays", duration: "visit" as const };
longReceiptVenue.access!.permissions.push(visitGrant);
const revoke: AccessCommand = {
  operationId: "r".repeat(180),
  expectedRevision: longReceiptVenue.access!.revision,
  permissionId: longGrant.id,
  zoneId: longGrant.zoneId,
  action: "revoke",
};
applyAccessCommand(longReceiptVenue, revoke, longGrant.issuerId, stamp, known, ["withdrawal-speech"]);
assert.equal(longGrant.revoked, true);
assert.equal(visitGrant.revoked, false, "Withdrawing standing permission alone does not end an invited visit");
const settledRevision = longReceiptVenue.access!.revision;
assert.deepEqual(readVenueAccess(JSON.parse(JSON.stringify(longReceiptVenue.access))), longReceiptVenue.access);
applyAccessCommand(longReceiptVenue, revoke, longGrant.issuerId, stamp, known, ["withdrawal-speech"]);
assert.equal(longReceiptVenue.access!.revision, settledRevision, "Withdrawal retries retain bounded stable receipts");
assert.equal(
  reloaded.zones!.filter((zone) => zone.ownerId === "jim").length,
  2,
  "Multiple same-owner Zones survive reload.",
);
assert.ok(reloaded.zones!.find((zone) => zone.id === "bedroom")!.access);
zone("office").access!.managerIds = [];
zone("office").access!.inviterIds = [];
reconcileVenueAccess(venue);
assert.equal(venue.access!.permissions.find((grant) => grant.id === standing.operationId)!.revoked, true);
zone("office").access!.managerIds = ["jim"];
reconcileVenueAccess(venue);
assert.equal(
  venue.access!.permissions.find((grant) => grant.id === standing.operationId)!.revoked,
  true,
  "Restored authority never revives invitations.",
);
const removed = fixture();
const transfer = fixture();
applyAccessCommand(
  transfer,
  {
    action: "invite",
    operationId: "transfer-invite",
    expectedRevision: 0,
    zoneId: "living",
    visitorId: "player",
    duration: "standing",
    accompanied: false,
    outsideHours: false,
  },
  "jim",
  stamp,
  known,
);
applyAccessCommand(
  transfer,
  {
    action: "venue-policy",
    operationId: "transfer-manager",
    expectedRevision: 1,
    zoneId: null,
    managerIds: ["mara"],
    visitorHours: null,
  },
  "jim",
  stamp,
  known,
);
assert.equal(
  mayInvite(
    transfer,
    transfer.zones!.find((zone) => zone.id === "living")!,
    "jim",
  ),
  false,
);
assert.equal(transfer.access!.permissions[0].revoked, true, "Former managers are not silently retained as delegates.");
applyAccessCommand(
  removed,
  {
    action: "invite",
    operationId: "removed-invite",
    expectedRevision: 0,
    zoneId: "bedroom",
    visitorId: "player",
    duration: "standing",
    accompanied: false,
    outsideHours: false,
  },
  "jim",
  stamp,
  known,
);
reconcileVenueAccess(
  removed,
  known.filter((id) => id !== "jim"),
);
assert.equal(removed.access!.permissions[0].revoked, true);

const recovery = fixture();
const recoveryCommand = {
  action: "recover-managers",
  operationId: "recover-office",
  expectedRevision: 0,
  zoneId: "office",
  managerIds: ["mara"],
} as AccessCommand;
assert.throws(
  () => applyAccessCommand(recovery, recoveryCommand, "jim", stamp, known),
  /do not manage/,
  "Recovery cannot override a valid independent manager.",
);
recovery.zones!.find((zone) => zone.id === "office")!.access!.managerIds = ["departed"];
applyAccessCommand(
  recovery,
  { action: "ban", operationId: "recovery-ban", expectedRevision: 0, zoneId: null, visitorId: "visitor" },
  "jim",
  stamp,
  known,
);
assert.throws(() => applyAccessCommand(recovery, recoveryCommand, "jim", stamp, known), /Access changed/);
applyAccessCommand(recovery, { ...recoveryCommand, expectedRevision: 1 }, "jim", stamp, known);
applyAccessCommand(recovery, { ...recoveryCommand, expectedRevision: 0 }, "jim", stamp, known);
assert.equal(recovery.access!.revision, 2, "Recovery is replay-safe.");
assert.equal(recovery.access!.bans[0].active, true, "Recovery preserves bans.");
assert.deepEqual(recovery.zones!.find((zone) => zone.id === "office")!.access!.managerIds, ["mara"]);
assert.throws(
  () =>
    applyAccessCommand(
      recovery,
      { ...recoveryCommand, operationId: "recover-venue", expectedRevision: 2, zoneId: null },
      "player",
      stamp,
      known,
    ),
  /do not manage/,
);
recovery.access!.managerIds = [];
applyAccessCommand(
  recovery,
  { ...recoveryCommand, operationId: "recover-empty-venue", expectedRevision: 2, zoneId: null, managerIds: ["player"] },
  "player",
  stamp,
  known,
);

const planningWorld = defaultVillageState();
const cafe = fixture();
cafe.destinations = {};
cafe.access!.visitorHours = [{ days: ["Monday"], start: "09:00", end: "17:00" }];
const cafeZone = cafe.zones!.find((zone) => zone.id === "living")!;
cafeZone.kind = "public";
cafeZone.access!.mode = "public";
cafeZone.access!.memberRoles = [];
planningWorld.venues = [cafe];
const planned = {
  venueId: "home",
  activity: "Coffee",
  startMinute: 600,
  endMinute: 660,
  flexible: true,
  status: "online",
} as any;
assert.equal(
  validateRoutineDay([planned], { characterId: "visitor" } as any, planningWorld, new Date(2026, 9, 5))[0].zoneId,
  "living",
  "Future open-hour arrival selects the interior even without a Zone ID.",
);
assert.equal(
  validateRoutineDay(
    [{ ...planned, zoneId: "living", startMinute: 1200 }],
    { characterId: "visitor" } as any,
    planningWorld,
    new Date(2026, 9, 5),
  )[0].venueId,
  "",
  "Planned closed-hour access is rejected.",
);
cafeZone.controllerIds = ["private-controller-sentinel"];
planningWorld.villagers = ["visitor", "trina"].map((characterId) => {
  const agenda = unwrittenVillageAgenda(new Date(2026, 9, 5));
  agenda.activeDay!.blocks = [
    {
      startMinute: 0,
      endMinute: 1440,
      activity: "Free time",
      venueId: "home",
      zoneId: "exterior",
      status: "online",
      flexible: true,
    },
  ];
  return {
    letterFontId: "caveat",
    characterId,
    incarnation: "resident-" + characterId,
    agenda,
    cardSnapshot: { name: characterId },
  };
}) as any;
const socialPlan = {
  id: "planned-hours",
  kind: "meeting",
  status: "planned",
  actors: planningWorld.villagers.map((resident) => ({ id: resident.characterId, incarnation: resident.incarnation })),
  revisions: Object.fromEntries(
    planningWorld.villagers.map((resident) => [resident.characterId, routineRevision(resident.agenda!)]),
  ),
  venueId: "home",
  zoneId: "living",
  dateKey: agendaDateKey(new Date(2026, 9, 5)),
  startMinute: 600,
  endMinute: 660,
} as any;
assert.equal(
  socialPlanValid(planningWorld, socialPlan, new Date(2026, 9, 5, 8)),
  true,
  "A future plan uses opening hours at the planned time, even while currently closed.",
);
assert.equal(
  socialPlanValid(planningWorld, { ...socialPlan, startMinute: 1200, endMinute: 1260 }, new Date(2026, 9, 5, 12)),
  false,
  "A future plan cannot use today's open status for a closed-hour meeting.",
);
const privateProjection = JSON.stringify(
  villageSettings(planningWorld, { name: "Player", missing: false } as any, null),
);
assert.ok(!privateProjection.includes("private-controller-sentinel"));

// Integration below uses an in-memory document host and forbids model calls.
const records = new Map<string, any>();
let failSceneCreate = false;
let failNavigationReceiptId = "";
let modelResolutions = 0;
const live = defaultVillageState();
live.seed = "venue-access";
live.foundedAt = stamp;
live.setupAt = stamp;
const residents = known
  .filter((id) => id !== "player")
  .map((characterId) => ({
    letterFontId: "caveat" as const,
    characterId,
    incarnation: "resident-" + characterId,
    cardSnapshot: { id: characterId, revision: 1, sourceStatus: "available", name: characterId, capturedAt: stamp },
    addedAt: stamp,
    agenda: null,
  }));
live.villagers = residents as typeof live.villagers;
live.startingHistory.reviewed = Object.fromEntries(
  residents.map(({ characterId, incarnation }) => [characterId, incarnation]),
);
const liveVenue = fixture();
liveVenue.access!.managerIds = ["player"];
for (const row of liveVenue.zones!)
  if (row.kind !== "exterior")
    row.access = {
      ...row.access!,
      managerIds: null,
      memberIds: [],
      memberRoles: [],
      inviterIds: ["player"],
      mode: "permission-required",
      visitorHours: "always",
    };
liveVenue.residentIds = [];
liveVenue.occupancy.residentCharacterId = null;
liveVenue.zones!.forEach((row) => {
  row.ownerId = undefined;
});
applyAccessCommand(
  liveVenue,
  {
    action: "invite",
    operationId: "visit-live",
    expectedRevision: 0,
    zoneId: "bedroom",
    visitorId: "player",
    duration: "visit",
    accompanied: false,
    outsideHours: false,
  },
  "player",
  stamp,
  known,
);
// Make the player a guest, through an independently managed named Zone.
liveVenue.zones!.find((row) => row.id === "bedroom")!.access!.managerIds = ["trina"];
liveVenue.zones!.find((row) => row.id === "bedroom")!.access!.inviterIds = ["player"];
liveVenue.zones!.find((row) => row.id === "office")!.access!.mode = "public";
live.venues = [liveVenue];
records.set("villages-village", {
  id: "villages-village",
  packageId: "villages",
  kind: "village",
  data: live,
  revision: 1,
});
const release = configureVillagesRuntime({
  logger: { debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} },
  getAgentConfig: async () => ({}),
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
        return [...records.values()].filter((row) => row.kind === kind);
      },
      async create(input: any) {
        if (failSceneCreate && input.id.startsWith("villages-venue-visit-")) throw Error("fixture Scene create failed");
        const row = { ...input, revision: 1 };
        records.set(input.id, row);
        return row;
      },
      async update(input: any) {
        const prior = records.get(input.id);
        if (!prior || prior.revision !== input.expectedRevision) return null;
        if (
          failNavigationReceiptId &&
          input.id.startsWith("villages-venue-visit-") &&
          fixtureSceneState(input.data, records).navigationReceipts?.some(
            (row: any) => row.id === failNavigationReceiptId,
          )
        ) {
          failNavigationReceiptId = "";
          throw Error("fixture movement receipt save failed");
        }
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
      modelResolutions++;
      throw Error("This regression must not request a model.");
    },
  },
} as any);
async function main() {
  try {
    failSceneCreate = true;
    await assert.rejects(() => enterVenue("home", "bedroom"), /fixture Scene create failed/);
    assert.equal(
      (await readVillageState({ memories: true })).venues[0].access!.permissions[0].sceneId,
      null,
      "Failed initial Scene save cannot consume a visit.",
    );
    failSceneCreate = false;
    let entered = await enterVenue("home", "bedroom");
    assert.equal(entered.zoneId, "bedroom");
    assert.equal((await readVillageState({ memories: true })).venues[0].access!.permissions[0].sceneId, entered.id);
    const gapManager = "trina";
    const beforeGapPolicy = structuredClone(
      (await readVillageState({ memories: true })).venues[0].zones!.find((zone) => zone.id === "living")!.access!,
    );
    await mutateVillageState(
      (world) => {
        const home = world.venues[0];
        applyAccessCommand(
          home,
          {
            action: "zone-policy",
            operationId: "claim-gap-policy",
            expectedRevision: home.access!.revision,
            zoneId: "living",
            policy: { ...beforeGapPolicy, managerIds: [gapManager], inviterIds: [gapManager] },
          },
          "player",
          stamp,
          known,
        );
        applyAccessCommand(
          home,
          {
            action: "invite",
            operationId: "claim-gap-permission",
            expectedRevision: home.access!.revision,
            zoneId: "living",
            visitorId: "player",
            duration: "visit",
            accompanied: false,
            outsideHours: true,
          },
          gapManager,
          stamp,
          known,
        );
      },
      { memories: true },
    );
    const beforeGap = (await activeVenueSession())!;
    const callsBeforeGap = modelResolutions;
    failNavigationReceiptId = "claim-gap-move";
    await assert.rejects(
      moveVenueZone(entered.id, "living", beforeGap.sceneRevision, undefined, "claim-gap-move"),
      /fixture movement receipt save failed/,
    );
    const heldMove = await readSession(entered.id);
    assert.equal(heldMove.zoneId, "bedroom");
    assert(!heldMove.navigationReceipts?.some((row) => row.id === "claim-gap-move"));
    assert.equal(heldMove.operation!.id, "claim-gap-move");
    assert.match(heldMove.operation!.error ?? "", /fixture movement receipt save failed/);
    assert.equal(heldMove.operation!.status, "complete", "caught free navigation can retry without a paid hold");
    const claimedWorld = await readVillageState({ memories: true });
    assert.equal(
      claimedWorld.venues[0].access!.permissions.find((row) => row.id === "claim-gap-permission")!.sceneId,
      entered.id,
    );
    assert.equal(
      heldMove.continuity!.facts.venues[0].access!.permissions.find((row) => row.id === "claim-gap-permission")!
        .sceneId,
      entered.id,
    );
    const recoveredMove = await moveVenueZone(
      entered.id,
      "living",
      heldMove.sceneRevision,
      undefined,
      "claim-gap-move",
    );
    assert.equal(recoveredMove.zoneId, "living");
    assert.equal(recoveredMove.navigationReceipts!.filter((row) => row.id === "claim-gap-move").length, 1);
    assert.equal(
      (await readVillageState({ memories: true })).venues[0].access!.permissions.filter(
        (row) => row.id === "claim-gap-permission",
      ).length,
      1,
    );
    assert.equal(recoveredMove.lines.length, beforeGap.lines.length);
    assert.equal(recoveredMove.submissions.length, beforeGap.submissions.length);
    await moveVenueZone(entered.id, "living", undefined, undefined, "claim-gap-move");
    assert.equal(
      (await readSession(entered.id)).navigationReceipts!.filter((row) => row.id === "claim-gap-move").length,
      1,
    );
    assert.equal(modelResolutions, callsBeforeGap, "claim recovery and receipt replay make no model request");
    entered = await moveVenueZone(entered.id, "bedroom", recoveredMove.sceneRevision, undefined, "claim-gap-return");
    await mutateVillageState(
      (world) => {
        const home = world.venues[0];
        applyAccessCommand(
          home,
          {
            action: "zone-policy",
            operationId: "claim-gap-restore",
            expectedRevision: home.access!.revision,
            zoneId: "living",
            policy: beforeGapPolicy,
          },
          gapManager,
          stamp,
          known,
        );
      },
      { memories: true },
    );
    const office = await moveVenueZone(entered.id, "office", entered.sceneRevision);
    const returned = await moveVenueZone(entered.id, "bedroom", office.sceneRevision);
    assert.equal(returned.id, entered.id, "Zone movements keep the same Scene and its visit permission.");
    await mutateVillageState((world) => {
      const current = world.venues[0];
      applyAccessCommand(
        current,
        {
          action: "revoke",
          zoneId: "bedroom",
          permissionId: "visit-live",
          expectedRevision: current.access!.revision,
          operationId: "world-revoke",
        },
        "player",
        stamp,
        known,
      );
    });
    const exited = await activeVenueSession();
    assert.equal(exited!.zoneId, "office", "A live Scene applies current permission and preserves a permitted exit.");
    assert(exited!.lines.some((line) => /access has ended/.test(line.content)));
    const lineCount = exited!.lines.length;
    assert.equal(
      (await activeVenueSession())!.lines.length,
      lineCount,
      "Repeated refresh cannot record a second exit.",
    );
    const route = contactPath(
      await readVillageState({ memories: true }),
      (await readVillageState({ memories: true })).venues[0],
      "office",
      "exterior",
      "player",
      exited!,
    );
    assert.ok(route, "Egress to Entrance remains possible.");
    const world = await readVillageState({ memories: true });
    const revision = world.venues[0].access!.revision;
    await changeVenueAccess("home", {
      action: "refuse-entry",
      operationId: "refuse-live",
      expectedRevision: revision,
      zoneId: "living",
      visitorId: "player",
    });
    assert.equal(
      (await readVillageState({ memories: true })).venues[0].access!.visitDenials.some(
        (row) => row.zoneId === "living",
      ),
      true,
    );
    await changeVenueAccess("home", {
      action: "invite",
      operationId: "reinvite-live",
      expectedRevision: revision + 1,
      zoneId: "living",
      visitorId: "player",
      duration: "visit",
      accompanied: false,
      outsideHours: false,
    });
    const reinvited = (await readVillageState({ memories: true })).venues[0];
    assert.equal(
      reinvited.access!.visitDenials.some((row) => row.zoneId === "living"),
      false,
      "Server-resolved reinvitation clears the same Scene's refusal.",
    );
    assert.equal(reinvited.access!.permissions.find((row) => row.id === "reinvite-live")!.sceneId, entered.id);
    assert.ok(
      !JSON.stringify(await readSceneChanges(entered.id)).includes('"accessCommand"'),
      "Scene-change projection has no access commands.",
    );
    await endVenueSession(entered.id);
    const managementWorld = defaultVillageState();
    managementWorld.seed = "management-world";
    managementWorld.foundedAt = stamp;
    managementWorld.setupAt = stamp;
    managementWorld.venues = [fixture()];
    managementWorld.villagers = structuredClone(live.villagers);
    managementWorld.startingHistory.reviewed = { ...live.startingHistory.reviewed };
    records.delete("villages-active-venue");
    records.set("villages-village", {
      id: "villages-village",
      packageId: "villages",
      kind: "village",
      data: managementWorld,
      revision: 100,
    });
    await mutateVillageState((current) => {
      const jim = current.villagers.find((resident) => resident.characterId === "jim")!;
      jim.agenda = unwrittenVillageAgenda();
      jim.agenda.activeDay!.blocks = [
        {
          startMinute: 0,
          endMinute: 1440,
          activity: "Writing",
          venueId: "home",
          zoneId: "office",
          status: "online",
          flexible: true,
        },
      ];
      applyAccessCommand(
        current.venues[0],
        {
          action: "invite",
          operationId: "escorted-arrival",
          expectedRevision: current.venues[0].access!.revision,
          zoneId: "office",
          visitorId: "player",
          duration: "standing",
          accompanied: true,
          outsideHours: false,
        },
        "jim",
        stamp,
        known,
      );
    });
    const escortedArrival = await enterVenue("home", "office");
    assert.equal(escortedArrival.zoneId, "office", "Initial entry uses captured attendance for the named escort.");
    await endVenueSession(escortedArrival.id);
    await mutateVillageState((current) => {
      current.villagers.find((resident) => resident.characterId === "jim")!.agenda!.activeDay!.blocks[0].zoneId =
        "exterior";
    });
    await assert.rejects(
      () => enterVenue("home", "office"),
      { name: "VillagesRequestError" },
      "An absent escort cannot permit initial entry.",
    );
    assert.equal(modelResolutions, 0);
  } finally {
    release();
  }
  console.log(
    "Villages Venue access: evaluator, authority, hours, replay, privacy, multiple Zones and recovery passed (mock document host; no model requests).",
  );
}
await main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
