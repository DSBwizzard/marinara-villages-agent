import { completeVillageResidence } from "../packages/villages/src/server/features/venues/residences.js";
import assert from "node:assert/strict";
import {
  applyAccessCommand,
  initializeVenueAccess,
  evaluateZoneAccess,
  readVenueAccess,
  claimVisitPermission,
  reconcileVenueAccess,
  withinVisitorHours,
  projectZoneAccess,
  projectVenueAccess,
} from "../packages/villages/src/server/domain/rules/venue-access.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import {
  defaultVillageState,
  coerceVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { mutateVillageState, readVillageState } from "../packages/villages/src/server/features/world/village-store.js";
import {
  enterVenue,
  activeVenueSession,
  moveVenueZone,
  endVenueSession,
  recordRoomAccessEvents,
  readSceneChanges,
  recordSpokenInvitation,
  processSavedExchange,
} from "../packages/villages/src/server/features/scenes/venue-session.js";
import { savedAccessEvents } from "../packages/villages/src/server/domain/rules/scene-reply.js";
import { publicSceneResponse } from "../packages/villages/src/server/domain/rules/scene-public.js";
import { roomInterpretationChecks } from "../packages/villages/src/server/features/scenes/room-interpretation.js";
import { selectRoomEventChecks } from "../packages/villages/src/server/domain/rules/room-events.js";
import { socialPlanValid } from "../packages/villages/src/server/domain/rules/social-rules.js";
import { processSocialOutbox } from "../packages/villages/src/server/features/residents/relationship-social.js";
import { agendaDateKey } from "../packages/villages/src/server/domain/rules/agenda-week.js";
import { processLiveRelationships } from "../packages/villages/src/server/features/residents/live-memory.js";
import { validateRoutineDay } from "../packages/villages/src/server/domain/rules/owned-routine.js";
import { unwrittenVillageAgenda } from "../packages/villages/src/server/domain/rules/agenda-plan.js";
import { mutateRelationships } from "../packages/villages/src/server/features/residents/relationship-store.js";
import {
  neutralRelationship,
  relationshipKey,
} from "../packages/villages/src/server/domain/rules/relationship-rules.js";
import { accessManagementChecks } from "../packages/villages/src/server/domain/rules/access-speech.js";
import {
  writeInterpretationDiagnostics,
  readInterpretationDiagnostics,
} from "../packages/villages/src/server/features/generation/interpretation-diagnostics.js";
import { mayInvite } from "../packages/villages/src/server/domain/rules/venue-access.js";

import { updateVillageZone } from "../packages/villages/src/server/features/venues/zone-edits.js";
import { changeVenueAccess } from "../packages/villages/src/server/features/venues/services.js";

import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import { contactPath } from "../packages/villages/src/server/domain/rules/venue-contact.js";

import { villageSettings } from "../packages/villages/src/server/domain/rules/world-snapshot.js";
import { sceneryImageKey } from "../packages/villages/src/server/domain/rules/scenery-context.js";
import { privatePreparationKey } from "../packages/villages/src/server/jobs/private-space-preparation.js";
import type { VillageVenue, VillageVenueZone } from "../packages/villages/src/server/domain/models/world.js";
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
  const result: VillageVenue = {
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
    state: { condition: "", upgrades: [], furniture: [], publicFacts: [], updatedAt: stamp },
    zones: [
      { ...zone("exterior"), kind: "exterior", seen: true },
      zone("living"),
      zone("bedroom", "jim"),
      zone("office", "jim"),
      zone("mara-bedroom", "mara"),
    ],
  };
  initializeVenueAccess(result);
  result.access!.managerIds = ["jim"];
  return result;
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
command({
  action: "zone-policy",
  zoneId: "living",
  policy: {
    ...zone("living").access!,
    regularVisitors: [{ inviterId: "jim", relationship: "friend", accompanied: false }],
  },
} as any);
assert.equal(
  decide("living", "player", { relationships: { edges: { [JSON.stringify(["jim", "player"])]: { friend: true } } } })
    .allowed,
  true,
);
assert.equal(
  decide("living", "player", { relationships: { edges: { [JSON.stringify(["player", "jim"])]: { friend: true } } } })
    .allowed,
  false,
  "Social rules are directional.",
);
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
const imageKey = sceneryImageKey(state, venue, "office"),
  prepKey = privatePreparationKey(venue, zone("office"));
zone("office").access!.mode = "public";
assert.equal(sceneryImageKey(state, venue, "office"), imageKey);
assert.equal(privatePreparationKey(venue, zone("office")), prepKey);
const before = projectZoneAccess(venue, zone("mara-bedroom"), "player", context);
assert.equal(before.policy, undefined);
assert.equal(before.permissions, undefined);
assert.equal(projectVenueAccess(venue, "player")?.managerIds, undefined);
const snapshot = villageSettings(state, { name: "Player", missing: false } as any, null);
assert.equal(snapshot.venues[0]!.access, undefined);
assert.ok(snapshot.venues[0]!.zones!.every((zone) => !zone.access));
assert.equal(snapshot.venues[0]!.zones!.find((zone) => zone.id === "mara-bedroom")!.description, "");
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
  const agenda = unwrittenVillageAgenda(planningWorld.venues, characterId, new Date(2026, 9, 5));
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
  return { characterId, agenda, cardSnapshot: { name: characterId }, completedWishes: [] };
}) as any;
const socialPlan = {
  id: "planned-hours",
  kind: "meeting",
  status: "planned",
  actorIds: ["visitor", "trina"],
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
let failAccessWrite = false;
let revokeBeforeSceneCommit = false;
const live = defaultVillageState();
live.foundedAt = stamp;
live.setupAt = stamp;
live.visitMemoryBackfilled = true;
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
records.set("villages-village", { id: "villages-village", kind: "village", data: live, revision: 1 });
const release = configureVillagesRuntime({
  logger: { debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} },
  getAgentConfig: async () => ({}),
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
        if (failAccessWrite && input.id === "villages-village") {
          failAccessWrite = false;
          throw Error("fixture access write failed");
        }
        if (revokeBeforeSceneCommit && input.id.startsWith("villages-venue-visit-") && input.data.zoneId === "living") {
          revokeBeforeSceneCommit = false;
          const world = records.get("villages-village");
          const current = world.data.venues[0];
          const grant = current.access.permissions.find((grant: any) => grant.sourceLineIds.includes("immediate-line"));
          applyAccessCommand(
            current,
            {
              action: "revoke",
              operationId: "interleaved-revoke",
              expectedRevision: current.access.revision,
              zoneId: "living",
              permissionId: grant.id,
            },
            "jim",
            new Date().toISOString(),
            known,
          );
          world.revision++;
        }
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
      throw Error("This regression must not request a model.");
    },
  },
} as any);
async function main() {
  try {
    failSceneCreate = true;
    await assert.rejects(() => enterVenue("home", undefined, "", undefined, "bedroom"), /fixture Scene create failed/);
    assert.equal(
      (await readVillageState()).venues[0].access!.permissions[0].sceneId,
      null,
      "Failed initial Scene save cannot consume a visit.",
    );
    failSceneCreate = false;
    const entered = await enterVenue("home", undefined, "", undefined, "bedroom");
    assert.equal(entered.zoneId, "bedroom");
    assert.equal((await readVillageState()).venues[0].access!.permissions[0].sceneId, entered.id);
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
    assert.equal(exited!.zoneId, "office", "Revocation records return to the previously occupied permitted Zone.");
    assert.match(exited!.lines.at(-1)!.content, /access has ended/);
    const lineCount = exited!.lines.length;
    assert.equal(
      (await activeVenueSession())!.lines.length,
      lineCount,
      "Repeated refresh cannot record a second exit.",
    );
    const route = contactPath(
      await readVillageState(),
      (await readVillageState()).venues[0],
      "office",
      "exterior",
      "player",
      exited!,
    );
    assert.ok(route, "Egress to Entrance remains possible.");
    const world = await readVillageState();
    const revision = world.venues[0].access!.revision;
    await changeVenueAccess("home", {
      action: "refuse-entry",
      operationId: "refuse-live",
      expectedRevision: revision,
      zoneId: "living",
      visitorId: "player",
    });
    assert.equal(
      (await readVillageState()).venues[0].access!.visitDenials.some((row) => row.zoneId === "living"),
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
    const reinvited = (await readVillageState()).venues[0];
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
    await updateVillageZone("home", "exterior", { name: "Entrance", purpose: "Arrival", description: "A stone gate" });
    assert.equal(
      (await readVillageState()).venues[0].zones!.find((zone) => zone.kind === "exterior")!.description,
      "A stone gate",
      "Venue managers can edit the Unrestricted Entrance's physical details.",
    );
    const managementWorld = defaultVillageState();
    managementWorld.foundedAt = stamp;
    managementWorld.setupAt = stamp;
    managementWorld.visitMemoryBackfilled = true;
    managementWorld.venues = [fixture()];
    managementWorld.villagers = known
      .filter((id) => id !== "player")
      .map((characterId) => ({
        characterId,
        cardSnapshot: { id: characterId, revision: 1, sourceStatus: "available", name: characterId, capturedAt: stamp },
        addedAt: stamp,
        agenda: null,
        completedWishes: [],
      })) as any;
    records.set("villages-village", { id: "villages-village", kind: "village", data: managementWorld, revision: 100 });
    await mutateVillageState((current) => {
      const jim = current.villagers.find((resident) => resident.characterId === "jim")!;
      jim.agenda = unwrittenVillageAgenda(current.venues, "jim");
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
    const escortedArrival = await enterVenue("home", undefined, "", undefined, "office");
    assert.equal(escortedArrival.zoneId, "office", "Initial entry uses captured attendance for the named escort.");
    await endVenueSession(escortedArrival.id);
    await mutateVillageState((current) => {
      current.villagers.find((resident) => resident.characterId === "jim")!.agenda!.activeDay!.blocks[0].zoneId =
        "exterior";
    });
    await assert.rejects(
      () => enterVenue("home", undefined, "", undefined, "office"),
      { name: "VillagesRequestError" },
      "An absent escort cannot permit initial entry.",
    );
    await mutateVillageState((current) => {
      current.villagers.find((resident) => resident.characterId === "jim")!.agenda = null;
    });
    const arrival = await enterVenue("home", undefined, "", "outside", "exterior");
    const speechAt = new Date().toISOString();
    const invitationLine = {
      id: "immediate-line",
      speakerId: "jim",
      role: "assistant",
      content: "You are always welcome in the living room; come in now.",
      kind: "main",
      heardBy: ["jim", "player"],
      at: speechAt,
    } as any;
    const invitationScene = structuredClone(arrival);
    invitationScene.lines.push(invitationLine);
    await recordSpokenInvitation(invitationScene, {
      residentId: "jim",
      venueId: "home",
      scope: "shared",
      ownerId: "jim",
      zoneId: "living",
      timing: "now",
      quote: invitationLine.content,
      sourceLineId: invitationLine.id,
      accessRevision: managementWorld.venues[0].access!.revision,
    });
    assert.equal(
      evaluateZoneAccess(
        (await readVillageState()).venues[0],
        (await readVillageState()).venues[0].zones!.find((zone) => zone.id === "living")!,
        "player",
        { sceneId: arrival.id },
      ).allowed,
      true,
      "Immediate spoken invitation creates canonical admission in the current Scene.",
    );
    revokeBeforeSceneCommit = true;
    const refusedMove = await moveVenueZone(arrival.id, "living", arrival.sceneRevision);
    assert.equal(refusedMove.zoneId, "exterior", "Revocation between validation and Scene commit records an exit.");
    assert.equal(
      (await readVillageState()).venues[0].zones!.find((zone) => zone.id === "living")!.seen,
      false,
      "A revoked interleaved move cannot reveal an unseen Zone.",
    );
    await recordSpokenInvitation(
      {
        ...refusedMove,
        lines: [...refusedMove.lines, { ...invitationLine, id: "immediate-retry", at: new Date().toISOString() }],
      } as any,
      {
        residentId: "jim",
        venueId: "home",
        scope: "shared",
        ownerId: "jim",
        zoneId: "living",
        timing: "now",
        quote: invitationLine.content,
        sourceLineId: "immediate-retry",
        accessRevision: (await readVillageState()).venues[0].access!.revision,
      },
    );
    const admittedMove = await moveVenueZone(arrival.id, "living", refusedMove.sceneRevision);
    assert.equal(
      admittedMove.zoneId,
      "living",
      "A fresh immediate NPC invitation permits movement using the canonical ledger.",
    );
    await endVenueSession(arrival.id);

    const standingAt = new Date().toISOString();
    const standingScene = {
      id: "standing-scene",
      villageSeed: (await readVillageState()).seed,
      lines: [{ ...invitationLine, id: "standing-line", at: standingAt }],
      submissions: [
        {
          id: "standing-turn",
          at: standingAt,
          replyLineIds: ["standing-line"],
          liveProposals: {
            earlierLineIds: [],
            playerLineId: "",
            replyLineIds: ["standing-line"],
            memoryVersions: {},
            relationshipChanges: {
              changes: [],
              disclosures: [],
              permissions: [
                {
                  controllerId: "jim",
                  visitorId: "player",
                  venueId: "home",
                  zoneId: "living",
                  action: "grant",
                  lineIds: ["standing-line"],
                },
              ],
            },
          },
        },
      ],
    } as any;
    await recordSpokenInvitation(standingScene, {
      residentId: "jim",
      venueId: "home",
      scope: "shared",
      ownerId: "jim",
      zoneId: "living",
      timing: "now",
      quote: invitationLine.content,
      sourceLineId: "standing-line",
      accessRevision: (await readVillageState()).venues[0].access!.revision,
    });
    const standingResult = await processLiveRelationships(standingScene, "standing-turn");
    assert.ok(
      (await readVillageState()).venues[0].access!.permissions.some(
        (grant) => grant.duration === "standing" && grant.sourceLineIds.includes("standing-line"),
      ),
      "A visit invite in the same reply cannot invalidate its explicit standing invitation. " +
        JSON.stringify(standingResult),
    );
    const staleStanding = structuredClone(standingScene);
    staleStanding.id = "old-standing-scene";
    staleStanding.submissions[0].id = "old-standing-turn";
    await mutateVillageState((current) => {
      const venue = current.venues[0];
      applyAccessCommand(
        venue,
        {
          action: "zone-policy",
          operationId: "standing-authority-away",
          expectedRevision: venue.access!.revision,
          zoneId: "living",
          policy: { ...venue.zones!.find((zone) => zone.id === "living")!.access!, managerIds: ["mara"] },
        },
        "jim",
        new Date(Date.parse(speechAt) + 1000).toISOString(),
        known,
      );
    });
    await mutateVillageState((current) => {
      const venue = current.venues[0];
      applyAccessCommand(
        venue,
        {
          action: "zone-policy",
          operationId: "standing-authority-restored",
          expectedRevision: venue.access!.revision,
          zoneId: "living",
          policy: { ...venue.zones!.find((zone) => zone.id === "living")!.access!, managerIds: ["jim"] },
        },
        "mara",
        new Date(Date.parse(speechAt) + 2000).toISOString(),
        known,
      );
    });
    await processLiveRelationships(staleStanding, "old-standing-turn");
    assert.equal(
      (await readVillageState()).venues[0].access!.permissions.filter((grant) => grant.duration === "standing").length,
      2,
      "Old queued standing speech cannot revive permission after authority was withdrawn and restored.",
    );

    const friendWorld = await readVillageState();
    const visitor = friendWorld.villagers.find((resident) => resident.characterId === "visitor")!;
    visitor.agenda = unwrittenVillageAgenda(friendWorld.venues, "visitor");
    const future = new Date();
    future.setDate(future.getDate() + 1);
    const futureKey = `${future.getFullYear()}-${String(future.getMonth() + 1).padStart(2, "0")}-${String(future.getDate()).padStart(2, "0")}`;
    const flexibleBlocks = [
      {
        startMinute: 0,
        endMinute: 1440,
        activity: "Personal interests",
        venueId: "home",
        zoneId: "living",
        status: "online",
        flexible: true,
      },
    ] as any;
    visitor.agenda.plannedDays = { [futureKey]: flexibleBlocks };
    visitor.agenda.wishes = [{ id: "friend-wish", wish: "Share tea", addedAt: stamp }] as any;
    visitor.agenda.wishActivities = [
      {
        wishId: "friend-wish",
        dateKey: futureKey,
        startMinute: 600,
        endMinute: 660,
        activity: "Share tea",
        venueId: "home",
        zoneId: "living",
        reason: "Friend visit",
        baseRevision: "fixture",
      },
    ];
    friendWorld.venues[0].zones!.find((zone) => zone.id === "living")!.access!.regularVisitors = [
      { inviterId: "jim", relationship: "friend", accompanied: false },
    ];
    friendWorld.venues[0].zones!.find((zone) => zone.id === "living")!.access!.visitorHours = "always";
    records.set("villages-village", { id: "villages-village", kind: "village", data: friendWorld, revision: 140 });
    await mutateRelationships(friendWorld.seed, (ties) => {
      ties.edges[relationshipKey("jim", "visitor")] = {
        ...neutralRelationship("jim", "visitor"),
        warmth: 50,
        trust: 50,
        friend: true,
      };
    });
    assert.equal(
      coerceVillageState(friendWorld).villagers.find((resident) => resident.characterId === "visitor")!.agenda!
        .plannedDays![futureKey][0].zoneId,
      "living",
      "Canonical routine IDs survive coercion without a relationship snapshot.",
    );
    await mutateVillageState((current) => {
      current.name = "An unrelated village rename";
    });
    assert.equal(
      (await readVillageState()).villagers.find((resident) => resident.characterId === "visitor")!.agenda!
        .wishActivities!.length,
      1,
      "An unrelated save preserves a future friend-only activity using fresh relationship authority.",
    );
    assert.equal(
      records.get("villages-village").data.relationshipContext,
      undefined,
      "Hydrated ties never persist in the Village DTO.",
    );
    const draft = [
      {
        speakerId: "jim",
        content:
          "Mara will manage the shared living room from now on; she is its only named manager. All its other rules stay the same.",
        kind: "main",
        heardBy: ["player"],
      },
    ] as any;
    const commandPolicy = {
      ...managementWorld.venues[0].zones!.find((zone) => zone.id === "living")!.access!,
      managerIds: ["mara"],
    };
    const events = [
      {
        kind: "manage-access",
        actorId: "jim",
        venueId: "home",
        evidence: [0],
        command: { action: "zone-policy", zoneId: "living", policy: commandPolicy },
      },
    ];
    const checks = accessManagementChecks(await readVillageState(), draft, events, "speech-fixture");
    assert.equal(checks.length, 1);
    assert.equal(
      accessManagementChecks(await readVillageState(), [{ ...draft[0], speakerId: "visitor" }], events, "wrong-speaker")
        .length,
      0,
    );
    const speechScene = {
      id: "speech-scene",
      placeId: "home",
      lines: [{ ...draft[0], id: "speech-line" }],
      submissions: [{ id: "speech-turn", at: stamp, replyLineIds: ["speech-line"] }],
    } as any;
    const result = {
      outcome: "access-management",
      evidenceIds: ["draft:0"],
      source: "system",
      reason: "secret-policy-data",
    };
    const batch = {
      checks,
      results: [result],
      traces: [
        {
          id: checks[0].id,
          question: checks[0].question,
          domain: "room",
          evidence: checks[0].evidence,
          result,
          system: { status: "complete", reason: "secret-policy-data" },
          decisions: { status: "off" },
          applied: "Not yet applied",
          startedAt: stamp,
        },
      ],
    } as any;
    await recordRoomAccessEvents(speechScene, batch);
    assert.deepEqual(
      (await readVillageState()).venues[0].zones!.find((zone) => zone.id === "living")!.access!.managerIds,
      ["mara"],
      batch.traces[0].applied,
    );
    await writeInterpretationDiagnostics(speechScene.id, batch.traces);
    assert.ok(
      !JSON.stringify(await readInterpretationDiagnostics(speechScene.id)).includes("secret-policy-data"),
      "Access diagnostics redact model reasons on write and read.",
    );
    await mutateVillageState((current) =>
      applyAccessCommand(
        current.venues[0],
        {
          action: "zone-policy",
          operationId: "later-policy",
          expectedRevision: current.venues[0].access!.revision,
          zoneId: "living",
          policy: { ...commandPolicy, managerIds: ["jim"] },
        },
        "mara",
        stamp,
        known,
      ),
    );
    const obsolete = structuredClone(batch);
    obsolete.checks[0].id += ":obsolete";
    obsolete.checks[0].facts.accessCommand.operationId += ":obsolete";
    await recordRoomAccessEvents(speechScene, obsolete);
    assert.match(obsolete.traces[0].applied, /access changed/);
    assert.equal(
      (await readVillageState()).venues[0].access!.receipts[obsolete.checks[0].facts.accessCommand.operationId].outcome,
      "rejected",
    );
    await recordRoomAccessEvents(speechScene, obsolete);
    assert.match(obsolete.traces[0].applied, /Already settled/);
    await mutateVillageState((current) => {
      current.venues[0].zones!.find((zone) => zone.id === "office")!.access!.managerIds = [];
    });
    const recoveryDraft = [
      {
        speakerId: "jim",
        content: "The office has no manager left. Mara is its new manager. All its other rules and bans stay the same.",
        kind: "main",
        heardBy: ["player", "jim"],
      },
    ] as any;
    const recoveryEvents = [
      {
        kind: "manage-access",
        actorId: "jim",
        venueId: "home",
        evidence: [0],
        command: { action: "recover-managers", zoneId: "office", managerIds: ["mara"] },
      },
    ];
    const recoveryChecks = accessManagementChecks(
      await readVillageState(),
      recoveryDraft,
      recoveryEvents,
      "npc-recovery",
    );
    assert.equal(recoveryChecks.length, 1, "A current NPC Venue manager can propose scoped orphan recovery.");
    assert.equal(
      accessManagementChecks(
        await readVillageState(),
        recoveryDraft,
        [{ ...recoveryEvents[0], actorId: "visitor" }],
        "guest-recovery",
      ).length,
      0,
    );
    const recoveryScene = {
      id: "recovery-scene",
      placeId: "home",
      lines: [{ ...recoveryDraft[0], id: "recovery-line" }],
      submissions: [{ id: "recovery-turn", at: stamp, replyLineIds: ["recovery-line"] }],
    } as any;
    const recoveryBatch = {
      checks: recoveryChecks,
      results: [result],
      traces: [{ ...batch.traces[0], id: recoveryChecks[0].id }],
    } as any;
    await recordRoomAccessEvents(recoveryScene, recoveryBatch);
    assert.deepEqual(
      (await readVillageState()).venues[0].zones!.find((zone) => zone.id === "office")!.access!.managerIds,
      ["mara"],
      recoveryBatch.traces[0].applied,
    );
    // Persisted reply effects recover without another model call or the latest turn's evidence.
    const recoveryRevision = (await readVillageState()).venues[0].access!.revision;
    const savedDraft = [
      {
        speakerId: "jim",
        content: "Visitor is banned from this venue. You are banned from this venue.",
        kind: "main",
        heardBy: ["jim", "player"],
      },
    ] as any;
    const combinedManagerChecks = roomInterpretationChecks(
      arrival as any,
      await readVillageState(),
      "",
      savedDraft,
      "combined-manager-ban",
    );
    const selectedVenueBan = selectRoomEventChecks(
      combinedManagerChecks,
      arrival as any,
      [],
      [{ kind: "ban-venue", actorId: "jim", venueId: "home", zoneId: null, evidence: [0] }],
    );
    assert.equal(
      selectedVenueBan.selected.length,
      1,
      "A Venue ban remains unambiguous when its manager also controls multiple Zones.",
    );
    assert.equal(selectedVenueBan.selected[0].facts.zoneId, null);
    assert.equal(selectedVenueBan.uncertain.length, 0);
    await mutateVillageState((current) => {
      for (const zone of current.venues[0].zones!.filter((zone) => zone.kind !== "exterior"))
        zone.access!.managerIds = ["mara"];
    });
    const banWorld = await readVillageState();
    const banScene = {
      ...arrival,
      id: "saved-ban-scene",
      villageSeed: banWorld.seed,
      lines: [{ ...savedDraft[0], id: "saved-ban-line" }],
      submissions: [],
    } as any;
    const banChecks = roomInterpretationChecks(banScene, banWorld, "", savedDraft, "saved-ban");
    assert.equal(
      banChecks.filter((check) => check.outcomes.some((outcome) => outcome.id === "ban-venue")).length,
      1,
      "Venue-only managers can ban even without authority to invite into any Zone.",
    );
    const banCheck = banChecks.find((check) => check.outcomes.some((outcome) => outcome.id === "ban-venue"))!;
    const banBatch = {
      checks: [banCheck],
      results: [{ outcome: "ban-venue", evidenceIds: ["draft:0"] }],
      traces: [{ applied: "Pending" }],
    } as any;
    banScene.submissions = [
      {
        id: "saved-ban-turn",
        at: new Date().toISOString(),
        replyLineIds: ["saved-ban-line"],
        movement: {},
        accessEvents: savedAccessEvents(banBatch),
      },
      { id: "later-unrelated-turn", at: stamp, replyLineIds: [] },
    ];
    records.set("villages-venue-visit-" + banScene.id, {
      id: "villages-venue-visit-" + banScene.id,
      kind: "venue-visit",
      data: banScene,
      revision: 1,
    });
    failAccessWrite = true;
    await assert.rejects(() => processSavedExchange(banScene.id, "saved-ban-turn"), /fixture access write failed/);
    assert.ok(
      !(await readVillageState()).venues[0].access!.bans.some((ban) => ban.visitorId === "player" && ban.active),
    );
    await processSavedExchange(banScene.id, "saved-ban-turn");
    assert.ok(
      (await readVillageState()).venues[0].access!.bans.some(
        (ban) => ban.zoneId === null && ban.visitorId === "player" && ban.active,
      ),
    );
    const recoveredRevision = (await readVillageState()).venues[0].access!.revision;
    assert.ok(recoveredRevision > recoveryRevision);
    await processSavedExchange(banScene.id, "saved-ban-turn");
    assert.equal(
      (await readVillageState()).venues[0].access!.revision,
      recoveredRevision,
      "Saved effect replay cannot duplicate a ban.",
    );
    assert.ok(!JSON.stringify(publicSceneResponse(banScene)).includes("accessEvents"));
    assert.ok(!JSON.stringify(await readSceneChanges(banScene.id)).includes("accessEvents"));
    await mutateVillageState((current) => {
      const venue = current.venues[0];
      const ban = venue.access!.bans.find((ban) => ban.active && ban.visitorId === "player")!;
      applyAccessCommand(
        venue,
        {
          action: "lift-ban",
          zoneId: null,
          banId: ban.id,
          operationId: "lift-fixture-ban",
          expectedRevision: venue.access!.revision,
        },
        "jim",
        stamp,
        known,
      );
      venue.zones!.find((zone) => zone.id === "living")!.access!.managerIds = ["jim"];
    });
    const beforeOldReply = (await readVillageState()).venues[0].access!;
    const oldReply = {
      ...banScene,
      id: "previous-world-reply",
      villageSeed: "previous-village-seed",
      lines: [{ ...invitationLine, id: "previous-world-line", at: stamp }],
      submissions: [
        {
          id: "old-reply-turn",
          at: stamp,
          replyLineIds: ["previous-world-line"],
          movement: {},
          invitationSignal: {
            residentId: "jim",
            venueId: "home",
            scope: "shared",
            ownerId: "jim",
            zoneId: "living",
            timing: "later",
            quote: invitationLine.content,
            sourceLineId: "previous-world-line",
            accessRevision: beforeOldReply.revision,
          },
        },
      ],
    };
    records.set("villages-venue-visit-" + oldReply.id, {
      id: "villages-venue-visit-" + oldReply.id,
      kind: "venue-visit",
      data: oldReply,
      revision: 1,
    });
    await processSavedExchange(oldReply.id, "old-reply-turn");
    assert.deepEqual(
      (await readVillageState()).venues[0].access,
      beforeOldReply,
      "Reused Venue and actor IDs cannot replay prior-village speech into a new world, including a permission receipt.",
    );

    // An offscreen accepted encounter writes canonical standing permission; rejected continuations cannot.
    const socialWorld = await readVillageState(),
      socialAt = new Date(
        Math.max(
          Date.now(),
          ...(await readVillageState()).venues[0].access!.changes.map((change) => Date.parse(change.at)),
        ) + 1,
      ).toISOString();
    for (const actor of ["jim", "mara"]) {
      const resident = socialWorld.villagers.find((resident) => resident.characterId === actor)!;
      resident.agenda = unwrittenVillageAgenda(socialWorld.venues, actor);
      resident.agenda.activeDay!.blocks = [
        {
          startMinute: 0,
          endMinute: 1440,
          activity: "Talking",
          venueId: "home",
          zoneId: "living",
          status: "online",
          flexible: true,
        },
      ];
    }
    socialWorld.storyPace = "balanced" as any;
    socialWorld.socialOutbox = [
      {
        id: "offscreen-grant",
        seed: socialWorld.seed,
        at: socialAt,
        candidates: [],
        opportunity: {
          id: "social-opportunity",
          kind: "encounter",
          actorIds: ["jim", "mara"],
          venueId: "home",
          zoneId: "living",
        } as any,
        proposal: {
          encounter: {
            opportunityId: "social-opportunity",
            lines: [
              { speakerId: "jim", text: "Mara, you are always welcome in living." },
              { speakerId: "mara", text: "Thank you Jim. I'll remember that when visiting." },
            ],
            relationshipReview: {
              changes: [],
              disclosures: [],
              permissions: [
                {
                  controllerId: "jim",
                  visitorId: "mara",
                  venueId: "home",
                  zoneId: "living",
                  action: "grant",
                  evidence: [0],
                },
              ],
            },
          },
        },
      },
    ];
    records.set("villages-village", { id: "villages-village", kind: "village", data: socialWorld, revision: 180 });
    failAccessWrite = true;
    await assert.rejects(() => processSocialOutbox(socialWorld), /fixture access write failed/);
    await processSocialOutbox(await readVillageState());
    assert.ok(
      (await readVillageState()).venues[0].access!.permissions.some(
        (grant) =>
          grant.duration === "standing" &&
          grant.visitorId === "mara" &&
          grant.sourceLineIds.includes("offscreen-grant:line:0"),
      ),
      "Accepted offscreen standing access recovers from the saved encounter.",
    );
    const rejectedWorld = await readVillageState();
    rejectedWorld.socialOutbox = [
      { ...socialWorld.socialOutbox[0], id: "rejected-continuation", requiredPlanId: "missing-plan" },
    ];
    records.set("villages-village", { id: "villages-village", kind: "village", data: rejectedWorld, revision: 190 });
    await processSocialOutbox(rejectedWorld);
    assert.ok(
      !(await readVillageState()).venues[0].access!.permissions.some((grant) =>
        grant.sourceLineIds.includes("rejected-continuation:line:0"),
      ),
      "Rejected offscreen continuation cannot grant access in the second transaction.",
    );
    const moveWorld = await readVillageState(),
      oldHome = moveWorld.venues[0];
    oldHome.destinations!.jim = { home: "living", sleep: "bedroom" };
    for (const zone of oldHome.zones!.filter((zone) => zone.ownerId === "jim"))
      zone.state.items = [zone.id + " keepsake"];
    const destination = fixture();
    destination.id = "new-home";
    destination.name = "New home";
    destination.residentIds = [];
    destination.occupancy.residentCharacterId = null;
    destination.zones = destination.zones!.filter((zone) => ["exterior", "living", "bedroom"].includes(zone.id));
    const vacant = destination.zones.find((zone) => zone.id === "bedroom")!;
    vacant.ownerId = undefined;
    vacant.access!.managerIds = null;
    vacant.access!.memberIds = [];
    vacant.access!.memberRoles = [];
    destination.access!.managerIds = ["player"];
    destination.destinations = {};
    moveWorld.venues.push(destination);
    moveWorld.residences = [
      {
        characterId: "jim",
        venueId: "home",
        proposedVenueId: "new-home",
        proposedPrivateZoneId: "bedroom",
        status: "moving",
        villagerDecision: "approved",
        completesAt: stamp,
      },
    ] as any;
    records.set("villages-village", { id: "villages-village", kind: "village", data: moveWorld, revision: 200 });
    await completeVillageResidence("jim", true, new Date(), false);
    const moved = await readVillageState(),
      priorHome = moved.venues.find((venue) => venue.id === "home")!,
      newHome = moved.venues.find((venue) => venue.id === "new-home")!;
    assert.ok(priorHome.zones!.some((zone) => zone.id === "bedroom" && !zone.ownerId));
    assert.ok(priorHome.zones!.some((zone) => zone.id === "office" && !zone.ownerId));
    assert.deepEqual(
      priorHome
        .archivedPrivateSpaces!.filter((row) => row.ownerId === "jim")
        .map((row) => row.space.state.items[0])
        .sort(),
      ["bedroom keepsake", "office keepsake"],
    );
    const assigned = newHome.zones!.find((zone) => zone.id === "bedroom")!;
    assert.deepEqual(assigned.access!.managerIds, ["jim"]);
    assert.deepEqual(
      assigned.access!.inviterIds,
      [],
      "Assignment gives implicit manager authority, not a persistent delegation.",
    );
    assert.equal(evaluateZoneAccess(newHome, assigned, "jim").allowed, true);
  } finally {
    release();
  }
  console.log(
    "Villages Venue access: evaluator, authority, hours, replay, privacy, multiple Zones and recovery passed (mock document host; no model requests).",
  );
}
void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
