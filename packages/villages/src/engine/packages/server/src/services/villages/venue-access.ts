import { z } from "zod";
import type {
  AccessCommand,
  VenueAccessState,
  ZoneAccessPolicy,
  ZoneAccessDecision,
} from "../../../../shared/src/villages/venue-access.js";
import type { VillageVenue, VillageVenueZone, VillageState } from "./types.js";
import { badRequest, conflict, VillagesRequestError } from "./errors.js";

const id = z.string().trim().min(1).max(200);
const ids = z
  .array(id)
  .max(100)
  .transform((rows) => [...new Set(rows)]);
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
const clock = z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/u);
export const hoursSchema = z
  .array(z.object({ days: z.array(z.enum(days)).min(1).max(7), start: clock, end: clock }).strict())
  .max(28);
export const zonePolicySchema = z
  .object({
    mode: z.enum(["public", "permission-required"]),
    managerIds: ids.nullable(),
    memberIds: ids,
    memberRoles: z.array(z.enum(["residents", "workers"])).max(2),
    inviterIds: ids,
    regularVisitors: z
      .array(z.object({ inviterId: id, relationship: z.enum(["friend", "close"]), accompanied: z.boolean() }).strict())
      .max(20),
    visitorHours: z.union([z.literal("inherit"), z.literal("always"), hoursSchema]),
    accompanied: z.boolean(),
  })
  .strict();
const permissionSchema = z.object({
  id,
  zoneId: id,
  visitorId: id,
  issuerId: id,
  duration: z.enum(["visit", "standing"]),
  sceneId: id.nullable(),
  accompaniedBy: id.nullable(),
  outsideHours: z.boolean(),
  revoked: z.boolean(),
  issuedAt: id,
  sourceLineIds: ids,
});
const banSchema = z.object({
  id,
  zoneId: id.nullable(),
  visitorId: id,
  issuerId: id,
  active: z.boolean(),
  issuedAt: id,
  sourceLineIds: ids,
});
const stateSchema = z.object({
  version: z.literal(1),
  revision: z.number().int().nonnegative(),
  managerIds: ids,
  visitorHours: hoursSchema.nullable(),
  permissions: z.array(permissionSchema),
  bans: z.array(banSchema),
  exceptions: z.array(z.object({ id, banIds: ids, permissionId: id, issuerId: id, issuedAt: id })),
  changes: z.array(
    z.object({
      id,
      revision: z.number().int(),
      actorId: id,
      zoneId: id.nullable(),
      action: id,
      at: id,
      sourceLineIds: ids,
    }),
  ),
  visitDenials: z.array(z.object({ zoneId: id, visitorId: id, sceneId: id, issuerId: id })).default([]),
  receipts: z.record(
    z.object({
      fingerprint: z.string(),
      revision: z.number().int(),
      outcome: z.enum(["applied", "rejected"]).optional(),
    }),
  ),
});
const base = { operationId: id, expectedRevision: z.number().int().nonnegative(), zoneId: id.nullable() };
const commandSchema = z.discriminatedUnion("action", [
  z.object({ ...base, action: z.literal("recover-managers"), managerIds: ids }).strict(),
  z
    .object({
      ...base,
      action: z.literal("destinations"),
      visitorId: id,
      home: id.optional(),
      sleep: id.optional(),
      work: id.optional(),
    })
    .strict(),
  z.object({ ...base, action: z.literal("refuse-entry"), visitorId: id, sceneId: id.optional() }).strict(),
  z.object({ ...base, action: z.literal("leave-now"), visitorId: id, sceneId: id.optional() }).strict(),
  z
    .object({ ...base, action: z.literal("venue-policy"), managerIds: ids, visitorHours: hoursSchema.nullable() })
    .strict(),
  z.object({ ...base, action: z.literal("zone-policy"), policy: zonePolicySchema }).strict(),
  z
    .object({
      ...base,
      action: z.literal("invite"),
      visitorId: id,
      duration: z.enum(["visit", "standing"]),
      accompanied: z.boolean(),
      outsideHours: z.boolean(),
      sceneId: id.optional(),
    })
    .strict(),
  z.object({ ...base, action: z.literal("revoke"), permissionId: id }).strict(),
  z.object({ ...base, action: z.literal("ban"), visitorId: id }).strict(),
  z.object({ ...base, action: z.literal("lift-ban"), banId: id }).strict(),
  z.object({ ...base, action: z.literal("exception"), permissionId: id, banIds: ids }).strict(),
]);
export function readAccessCommand(value: unknown): AccessCommand {
  const result = commandSchema.safeParse(value);
  if (!result.success) throw badRequest("Invalid access command. Reload the access panel and check its fields.");
  return result.data as AccessCommand;
}
export function readZonePolicy(value: unknown): ZoneAccessPolicy {
  const result = zonePolicySchema.safeParse(value);
  if (!result.success) throw badRequest("Invalid Zone access policy.");
  return result.data as ZoneAccessPolicy;
}
export function readVenueAccess(value: unknown): VenueAccessState | undefined {
  if (value === undefined) return undefined; // Explicit legacy boundary.
  const result = stateSchema.safeParse(value);
  if (!result.success)
    throw conflict("This Venue's access record is invalid. Restore a valid saved copy before continuing.");
  return result.data as VenueAccessState;
}
export function defaultZonePolicy(venue: VillageVenue, zone: VillageVenueZone): ZoneAccessPolicy {
  const personal = zone.ownerId ? [zone.ownerId] : null;
  const managerIds = personal ?? (zone.controllerIds?.length ? zone.controllerIds : null);
  return {
    mode:
      zone.venueClass === "residence" || ["staff", "restricted"].includes(zone.kind) ? "permission-required" : "public",
    managerIds,
    memberIds: personal ?? [],
    memberRoles:
      zone.ownerId || zone.kind === "private-residence"
        ? []
        : zone.venueClass === "residence"
          ? ["residents"]
          : zone.kind === "staff"
            ? ["workers"]
            : [],
    inviterIds: [],
    regularVisitors: [],
    visitorHours: "inherit",
    accompanied: false,
  };
}
/** New Venues only. Legacy saves keep their established compatibility adapter. */
export function initializeVenueAccess(venue: VillageVenue): void {
  const created = !venue.access;
  venue.access ??= {
    version: 1,
    revision: 0,
    managerIds: venue.occupancy.playerHome ? ["player"] : [...(venue.residentIds ?? [])],
    visitorHours: null,
    permissions: [],
    bans: [],
    exceptions: [],
    changes: [],
    visitDenials: [],
    receipts: {},
  };
  if (created && !venue.access.managerIds.length) venue.access.managerIds = ["player"];
  for (const zone of venue.zones ?? []) {
    if (zone.kind === "exterior") {
      zone.name = "Entrance";
      zone.access = undefined;
      continue;
    }
    zone.access ??= defaultZonePolicy(venue, zone);
  }
  venue.destinations ??= {};
  for (const actor of [
    ...(venue.residentIds ?? []),
    ...(venue.occupancy.playerHome ? ["player"] : []),
    ...(venue.workerIds ?? []),
  ]) {
    const suitable = (venue.zones ?? []).filter(
      (zone) => zone.kind !== "exterior" && (!zone.ownerId || zone.ownerId === actor),
    );
    const home = suitable.filter((zone) => zone.venueClass === "residence");
    const owned = home.filter((zone) => zone.ownerId === actor),
      shared = home.filter((zone) => !zone.ownerId);
    const homeChoices = shared.length ? shared : home,
      sleepChoices = owned.length ? owned : home;
    const work = suitable.filter((zone) => zone.venueClass === "workplace");
    venue.destinations[actor] ??= {};
    if (homeChoices.length === 1) venue.destinations[actor].home ??= homeChoices[0].id;
    if (sleepChoices.length === 1) venue.destinations[actor].sleep ??= sleepChoices[0].id;
    if (work.length === 1) venue.destinations[actor].work ??= work[0].id;
  }
}
export function zoneManagers(venue: VillageVenue, zone: VillageVenueZone): string[] {
  return zone.access?.managerIds ?? venue.access?.managerIds ?? [];
}
export function managesAccess(venue: VillageVenue, zoneId: string | null, actor: string): boolean {
  if (zoneId === null) return !!venue.access?.managerIds.includes(actor);
  const zone = venue.zones?.find((row) => row.id === zoneId);
  return !!zone && zone.kind !== "exterior" && zoneManagers(venue, zone).includes(actor);
}
export function mayInvite(venue: VillageVenue, zone: VillageVenueZone, actor: string): boolean {
  return (
    zone.kind !== "exterior" && (zoneManagers(venue, zone).includes(actor) || !!zone.access?.inviterIds.includes(actor))
  );
}
function members(venue: VillageVenue, zone: VillageVenueZone): string[] {
  const policy = zone.access;
  return [
    ...zoneManagers(venue, zone),
    ...(policy?.memberIds ?? []),
    ...(policy?.memberRoles.includes("residents")
      ? [...(venue.residentIds ?? []), ...(venue.occupancy.playerHome ? ["player"] : [])]
      : []),
    ...(policy?.memberRoles.includes("workers") ? (venue.workerIds ?? []) : []),
  ];
}
const minutes = (value: string) => Number(value.slice(0, 2)) * 60 + Number(value.slice(3));
export function withinVisitorHours(hours: VenueAccessState["visitorHours"], at: Date): boolean {
  if (hours === null) return true;
  if (!Number.isFinite(at.getTime())) return false;
  const today = days[at.getDay()],
    yesterday = days[(at.getDay() + 6) % 7],
    now = at.getHours() * 60 + at.getMinutes();
  return hours.some((row) => {
    const start = minutes(row.start),
      end = minutes(row.end);
    if (start === end) return row.days.includes(today); // Explicit all-day interval.
    return start < end
      ? row.days.includes(today) && now >= start && now < end
      : (row.days.includes(today) && now >= start) || (row.days.includes(yesterday) && now < end);
  });
}
export type AccessContext = {
  at?: Date;
  sceneId?: string;
  positions?: Record<string, string>;
  /** Only deliberate entry may claim an invitation not yet bound to a Scene. */
  accepting?: boolean;
  unavailable?: boolean;
  relationships?: VillageState["relationshipContext"];
};
/** Pure decision. Neither relationships nor invitations mutate while evaluating. */
export function evaluateZoneAccess(
  venue: VillageVenue,
  zone: VillageVenueZone,
  actor: string,
  context: AccessContext = {},
): ZoneAccessDecision {
  const canManage = managesAccess(venue, zone.id, actor),
    canInvite = mayInvite(venue, zone, actor);
  const mode = zone.kind === "exterior" ? "unrestricted" : (zone.access?.mode ?? "permission-required");
  const result = (
    allowed: boolean,
    reason: ZoneAccessDecision["reason"],
    explanation: string,
    extra = {},
  ): ZoneAccessDecision => ({
    allowed,
    available: !context.unavailable,
    mode,
    reason,
    explanation,
    canManage,
    canInvite,
    ...extra,
  });
  if (zone.kind === "exterior")
    return { ...result(true, "entrance", "Entrance · Unrestricted, 24/7."), available: true };
  if (context.unavailable) return result(false, "unavailable", "This Zone is not physically available yet.");
  const ledger = venue.access,
    policy = zone.access;
  if (!ledger || !policy) return result(false, "permission-required", "This Zone needs a valid access policy.");
  if (
    ledger.visitDenials.some(
      (denial) => denial.sceneId === context.sceneId && denial.zoneId === zone.id && denial.visitorId === actor,
    )
  )
    return result(false, "refused", "Permission for this Zone was refused for the current visit.");
  const grants = ledger.permissions.filter(
    (grant) =>
      !grant.revoked &&
      grant.zoneId === zone.id &&
      grant.visitorId === actor &&
      mayInvite(venue, zone, grant.issuerId) &&
      (grant.duration === "standing" ||
        (context.sceneId && (grant.sceneId === context.sceneId || (context.accepting && grant.sceneId === null)))),
  );
  const bans = ledger.bans.filter(
    (ban) => ban.active && ban.visitorId === actor && (ban.zoneId === null || ban.zoneId === zone.id),
  );
  const permitted = grants.filter((grant) =>
    bans.every((ban) =>
      ledger.exceptions.some((exception) => exception.permissionId === grant.id && exception.banIds.includes(ban.id)),
    ),
  );
  if (bans.length && !permitted.length)
    return result(false, "banned", "Entry is prohibited. A manager of the ban's scope must approve an exception.");
  const member = members(venue, zone).includes(actor);
  const hours =
    policy.visitorHours === "always"
      ? null
      : policy.visitorHours === "inherit"
        ? ledger.visitorHours
        : policy.visitorHours;
  const open = withinVisitorHours(hours, context.at ?? new Date());
  // A ban exception supplies only its exact invitation; it does not restore general membership.
  if (member && !bans.length) return result(true, "member", "You have access as a designated member or Zone manager.");
  const eligible = permitted.filter((grant) => open || grant.outsideHours);
  if (!open && !eligible.length)
    return result(
      false,
      "outside-hours",
      "Visitor hours are closed. An invitation needs explicit outside-hours approval.",
    );
  const escortPresent = (escort: string | null) => !!escort && context.positions?.[escort] === zone.id;
  for (const grant of eligible) {
    const escort = grant.accompaniedBy ?? (policy.accompanied ? grant.issuerId : null);
    if (escort && !escortPresent(escort)) continue;
    return result(
      true,
      "invitation",
      grant.duration === "standing" ? "You have standing permission." : "You are invited for this visit.",
      { permissionId: grant.id, ...(escort ? { accompaniedBy: escort } : {}) },
    );
  }
  if (!bans.length && policy.mode === "public" && !policy.accompanied)
    return result(true, "public", "Public during visitor hours.");
  if (!bans.length)
    for (const rule of policy.regularVisitors) {
      const edge = context.relationships?.edges[JSON.stringify([rule.inviterId, actor])];
      if (!mayInvite(venue, zone, rule.inviterId) || !edge?.[rule.relationship]) continue;
      if ((rule.accompanied || policy.accompanied) && !escortPresent(rule.inviterId)) continue;
      return result(true, "regular-visitor", "This Zone allows you under its regular-visitor rule.");
    }
  if (eligible.some((grant) => grant.accompaniedBy || policy.accompanied))
    return result(false, "accompaniment-required", "Your named escort must be here with you.");
  return result(false, "permission-required", "Permission is required for this Zone.");
}
/** Settlement is monotonic: losing invitation authority never resurrects an old grant. */
export function reconcileVenueAccess(venue: VillageVenue, knownActors?: string[]): void {
  if (!venue.access) return;
  if (knownActors) {
    venue.access.managerIds = venue.access.managerIds.filter((actor) => knownActors.includes(actor));
    for (const zone of venue.zones ?? [])
      if (zone.access) {
        if (zone.access.managerIds)
          zone.access.managerIds = zone.access.managerIds.filter((actor) => knownActors.includes(actor));
        zone.access.memberIds = zone.access.memberIds.filter((actor) => knownActors.includes(actor));
        zone.access.inviterIds = zone.access.inviterIds.filter((actor) => knownActors.includes(actor));
      }
  }
  for (const grant of venue.access.permissions) {
    const zone = venue.zones?.find((row) => row.id === grant.zoneId);
    if (!zone || !mayInvite(venue, zone, grant.issuerId)) grant.revoked = true;
  }
}
export function applyAccessCommand(
  venue: VillageVenue,
  command: AccessCommand,
  actor: string,
  at: string,
  knownActors: string[],
  sourceLineIds: string[] = [],
): void {
  const ledger = venue.access;
  if (!ledger) throw conflict("This legacy Venue uses its existing access rules.");
  const { expectedRevision: _revision, ...meaning } = command;
  const fingerprint = JSON.stringify({ actor, command: meaning });
  const previous = ledger.receipts[command.operationId];
  if (previous) {
    if (previous.fingerprint !== fingerprint)
      throw conflict("This operation ID was already used for a different access change.");
    if (previous.outcome === "rejected")
      throw conflict("This access change was already rejected; use a fresh proposal.");
    return;
  }
  if (command.expectedRevision !== ledger.revision)
    throw conflict("Access changed since you opened this panel. Reload before trying again.");
  const zone = venue.zones?.find((row) => row.id === command.zoneId);
  if (command.zoneId !== null && (!zone || zone.kind === "exterior"))
    throw badRequest("Entrance is always Unrestricted; choose another Zone.");
  const manager = managesAccess(venue, command.zoneId, actor);
  const forbidden = () => {
    throw new VillagesRequestError(403, "You do not manage access for this scope.");
  };
  const assertIds = (values: string[]) => {
    if (values.some((value) => !knownActors.includes(value)))
      throw badRequest("Choose people who belong to this Village.");
  };
  switch (command.action) {
    case "recover-managers": {
      const currentManagers = zone ? zoneManagers(venue, zone) : ledger.managerIds;
      if (
        currentManagers.some((id) => knownActors.includes(id)) ||
        (zone ? !managesAccess(venue, null, actor) : actor !== "player")
      )
        forbidden();
      if (!command.managerIds.length) throw badRequest("Choose at least one manager.");
      assertIds(command.managerIds);
      if (zone) zone.access!.managerIds = command.managerIds;
      else ledger.managerIds = command.managerIds;
      break;
    }
    case "destinations": {
      if (command.zoneId !== null || (!manager && command.visitorId !== actor)) forbidden();
      assertIds([command.visitorId]);
      const resident = [...(venue.residentIds ?? []), ...(venue.occupancy.playerHome ? ["player"] : [])].includes(
        command.visitorId,
      );
      for (const [role, destination] of Object.entries({
        home: command.home,
        sleep: command.sleep,
        work: command.work,
      })) {
        if (!destination) continue;
        const target = venue.zones?.find((row) => row.id === destination);
        if (
          !target ||
          target.kind === "exterior" ||
          target.venueClass !== (role === "work" ? "workplace" : "residence") ||
          (target.ownerId && target.ownerId !== command.visitorId) ||
          (role === "work" ? !venue.workerIds?.includes(command.visitorId) : !resident)
        )
          throw badRequest("Choose a suitable Zone in this person's assigned home or workplace.");
      }
      venue.destinations ??= {};
      venue.destinations[command.visitorId] = { home: command.home, sleep: command.sleep, work: command.work };
      break;
    }
    case "refuse-entry":
    case "leave-now":
      if (!zone || !manager || !command.sceneId) forbidden();
      assertIds([command.visitorId]);
      ledger.visitDenials = [
        ...ledger.visitDenials.filter(
          (row) => row.zoneId !== zone!.id || row.visitorId !== command.visitorId || row.sceneId !== command.sceneId,
        ),
        { zoneId: zone!.id, visitorId: command.visitorId, issuerId: actor, sceneId: command.sceneId! },
      ];
      break;
    case "venue-policy":
      if (command.zoneId !== null || !manager) forbidden();
      if (!command.managerIds.length) throw badRequest("Choose at least one Venue manager.");
      assertIds(command.managerIds);
      ledger.managerIds = command.managerIds;
      ledger.visitorHours = command.visitorHours;
      break;
    case "zone-policy":
      if (!zone || !manager) forbidden();
      assertIds([
        ...(command.policy.managerIds ?? []),
        ...command.policy.memberIds,
        ...command.policy.inviterIds,
        ...command.policy.regularVisitors.map((rule) => rule.inviterId),
      ]);
      if (command.policy.managerIds?.length === 0)
        throw badRequest("Choose at least one manager or inherit Venue managers.");
      if (
        command.policy.regularVisitors.some(
          (rule) =>
            !(command.policy.managerIds ?? ledger.managerIds).includes(rule.inviterId) &&
            !command.policy.inviterIds.includes(rule.inviterId),
        )
      )
        throw badRequest("Regular-visitor rules must belong to someone who may invite guests.");
      zone!.access = command.policy;
      break;
    case "invite":
      if (!zone || !mayInvite(venue, zone, actor)) forbidden();
      assertIds([command.visitorId]);
      if (command.sceneId)
        ledger.visitDenials = ledger.visitDenials.filter(
          (denial) =>
            denial.zoneId !== zone!.id || denial.visitorId !== command.visitorId || denial.sceneId !== command.sceneId,
        );
      ledger.permissions.push({
        id: command.operationId,
        zoneId: zone!.id,
        visitorId: command.visitorId,
        issuerId: actor,
        duration: command.duration,
        sceneId: command.sceneId ?? null,
        accompaniedBy: command.accompanied ? actor : null,
        outsideHours: command.outsideHours,
        revoked: false,
        issuedAt: at,
        sourceLineIds,
      });
      break;
    case "revoke": {
      const grant = ledger.permissions.find((row) => row.id === command.permissionId && row.zoneId === command.zoneId);
      if (!grant || (!manager && grant.issuerId !== actor)) forbidden();
      grant!.revoked = true;
      break;
    }
    case "ban":
      if (!manager) forbidden();
      assertIds([command.visitorId]);
      if (command.visitorId === actor) throw badRequest("You cannot ban yourself from the scope you manage.");
      ledger.bans.push({
        id: command.operationId,
        zoneId: command.zoneId,
        visitorId: command.visitorId,
        issuerId: actor,
        active: true,
        issuedAt: at,
        sourceLineIds,
      });
      break;
    case "lift-ban": {
      const ban = ledger.bans.find((row) => row.id === command.banId && row.zoneId === command.zoneId);
      if (!manager || !ban) forbidden();
      ban!.active = false;
      break;
    }
    case "exception": {
      const grant = ledger.permissions.find((row) => row.id === command.permissionId && !row.revoked);
      if (!manager || !grant) forbidden();
      const bans = ledger.bans.filter((row) => command.banIds.includes(row.id));
      if (
        !command.banIds.length ||
        bans.length !== command.banIds.length ||
        bans.some(
          (row) =>
            !row.active ||
            row.zoneId !== command.zoneId ||
            row.visitorId !== grant!.visitorId ||
            (row.zoneId && row.zoneId !== grant!.zoneId),
        )
      )
        throw badRequest(
          "An exception must name current bans in this manager's scope and an invitation for the same visitor.",
        );
      ledger.exceptions.push({
        id: command.operationId,
        banIds: command.banIds,
        permissionId: grant!.id,
        issuerId: actor,
        issuedAt: at,
      });
      break;
    }
  }
  reconcileVenueAccess(venue);
  ledger.revision++;
  ledger.changes.push({
    id: command.operationId,
    revision: ledger.revision,
    actorId: actor,
    zoneId: command.zoneId,
    action: command.action,
    at,
    sourceLineIds,
  });
  ledger.receipts[command.operationId] = { fingerprint, revision: ledger.revision };
}
/** Atomic world claim is safe to repeat after a Scene commit fails. */
export function claimVisitPermission(venue: VillageVenue, permissionId: string | undefined, sceneId: string): void {
  const grant = venue.access?.permissions.find((row) => row.id === permissionId);
  if (!grant || grant.duration !== "visit") return;
  if (grant.revoked || (grant.sceneId && grant.sceneId !== sceneId))
    throw conflict("This invitation belongs to another visit.");
  grant.sceneId = sceneId;
}
/** Both live and offscreen witnessed standing permissions use this replay/authority fence. */
export function settleStandingAccess(
  venue: VillageVenue,
  permission: {
    id: string;
    controllerId: string;
    visitorId: string;
    zoneId: string;
    action: "grant" | "revoke";
    lineIds: string[];
  },
  at: string,
  knownActors: string[],
): void {
  const ledger = venue.access;
  if (!ledger || ledger.receipts[permission.id]) return;
  if (
    permission.action === "grant" &&
    ledger.changes.some(
      (change) =>
        change.action !== "invite" &&
        change.action !== "destinations" &&
        (change.zoneId === null || change.zoneId === permission.zoneId) &&
        Date.parse(change.at) > Date.parse(at),
    )
  ) {
    ledger.receipts[permission.id] = {
      fingerprint: "obsolete-standing-speech",
      revision: ledger.revision,
      outcome: "rejected",
    };
    return;
  }
  if (permission.action === "grant")
    applyAccessCommand(
      venue,
      {
        action: "invite",
        operationId: permission.id,
        expectedRevision: ledger.revision,
        zoneId: permission.zoneId,
        visitorId: permission.visitorId,
        duration: "standing",
        accompanied: false,
        outsideHours: false,
      },
      permission.controllerId,
      at,
      knownActors,
      permission.lineIds,
    );
  else {
    for (const grant of ledger.permissions.filter(
      (grant) =>
        grant.zoneId === permission.zoneId &&
        grant.visitorId === permission.visitorId &&
        !grant.revoked &&
        Date.parse(grant.issuedAt) <= Date.parse(at) &&
        grant.issuerId === permission.controllerId,
    )) {
      const operationId = permission.id + ":" + grant.id;
      if (!ledger.receipts[operationId])
        applyAccessCommand(
          venue,
          {
            action: "revoke",
            operationId,
            expectedRevision: ledger.revision,
            zoneId: permission.zoneId,
            permissionId: grant.id,
          },
          permission.controllerId,
          at,
          knownActors,
          permission.lineIds,
        );
    }
    ledger.receipts[permission.id] = {
      fingerprint: "witnessed-standing-revocation",
      revision: ledger.revision,
      outcome: "applied",
    };
  }
}
export function projectVenueAccess(venue: VillageVenue, actor: string) {
  if (!venue.access) return undefined;
  const canManage = managesAccess(venue, null, actor);
  return {
    revision: venue.access.revision,
    canManage,
    canRecover: actor === "player" && !venue.access.managerIds.length,
    ...(canManage
      ? {
          managerIds: venue.access.managerIds,
          visitorHours: venue.access.visitorHours,
          bans: venue.access.bans.filter((row) => row.zoneId === null),
          changes: venue.access.changes.filter((row) => row.zoneId === null),
          exceptionInvitations: venue.access.permissions
            .filter(
              (grant) =>
                !grant.revoked &&
                venue.access!.bans.some(
                  (ban) => ban.active && ban.zoneId === null && ban.visitorId === grant.visitorId,
                ),
            )
            .map(({ id, zoneId, visitorId, duration }) => ({ id, zoneId, visitorId, duration })),
        }
      : {}),
  };
}
export function projectZoneAccess(venue: VillageVenue, zone: VillageVenueZone, actor: string, context: AccessContext) {
  const decision = evaluateZoneAccess(venue, zone, actor, context);
  const { permissionId: _permission, accompaniedBy: _escort, ...safeDecision } = decision;
  safeDecision.canRecover =
    !zoneManagers(venue, zone).length && managesAccess(venue, null, actor) && zone.kind !== "exterior";
  return {
    decision: safeDecision,
    ...(decision.canManage
      ? {
          policy: zone.access,
          permissions: venue.access?.permissions.filter((row) => row.zoneId === zone.id),
          bans: venue.access?.bans.filter((row) => row.zoneId === zone.id),
          changes: venue.access?.changes.filter((row) => row.zoneId === zone.id),
        }
      : decision.canInvite
        ? { permissions: venue.access?.permissions.filter((row) => row.zoneId === zone.id && row.issuerId === actor) }
        : {}),
  };
}
