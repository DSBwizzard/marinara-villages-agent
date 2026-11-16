import type { ContinuityEvidence } from "../models/continuity-model.js";
import { z } from "zod";
import type { AcceptedEpisode } from "../models/episode-model.js";
import type { NarrationReadset } from "../models/narration-model.js";
import type { VenueScene } from "../models/scene-model.js";
import type { VillageState, VillageVenue } from "../models/world.js";
import { calendarAt, ZonedDate } from "../../../shared/helpers/zoned-date.js";
import { continuityActor } from "./continuity-actors.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";
import { narrationWitnesses, type NarrationCommunication, type NarrationSourceContext } from "./narration-sources.js";
import { findLocation, findNpc, sceneActorIds } from "./places.js";
import { contactNeighbors, contactPath } from "./venue-contact.js";
import { captureSceneLayout, sceneLayoutVenue } from "./scene-layout.js";
import { zoneClosed } from "./venue-zones.js";
import { sceneAppointment } from "./scene-calendar.js";
import { permittedVenuePath } from "./venue-path.js";
import {
  applyAccessCommand,
  defaultZonePolicy,
  evaluateZoneAccess,
  managesAccess,
  mayInvite,
  readAccessCommand,
  hoursSchema,
  zonePolicySchema,
  permissionSchema,
  banSchema,
} from "./venue-access.js";

/** Native authority only; remote descriptions, people and positions never enter this packet. */
export function narrationAccessScopes(state: VillageState, actors: string[]) {
  return [
    ...state.venues,
    ...Object.values(state.worldPlaces.places)
      .filter((place) => !place.disabled)
      .map((place) => place.location),
  ]
    .filter((venue, index, all) => venue.access && all.findIndex((row) => row.id === venue.id) === index)
    .flatMap((venue) => {
      const authorities = actors.flatMap((actorId) => {
        const venueManager = managesAccess(venue, null, actorId);
        const zones = (venue.zones ?? [])
          .filter(
            (zone) =>
              zone.kind !== "exterior" && (managesAccess(venue, zone.id, actorId) || mayInvite(venue, zone, actorId)),
          )
          .map((zone) => ({
            id: zone.id,
            name: zone.name,
            policy: structuredClone(zone.access),
            manages: managesAccess(venue, zone.id, actorId),
            invites: mayInvite(venue, zone, actorId),
          }));
        const permissions = venue.access!.permissions.filter(
          (permission) =>
            !permission.revoked &&
            !permission.pendingStay &&
            (permission.issuerId === actorId ||
              venueManager ||
              zones.some((zone) => zone.manages && zone.id === permission.zoneId)),
        );
        if (!venueManager && !zones.length && !permissions.length) return [];
        return [
          {
            actorId,
            ...(venueManager
              ? {
                  venuePolicy: {
                    managerIds: [...venue.access!.managerIds],
                    visitorHours: structuredClone(venue.access!.visitorHours),
                  },
                }
              : {}),
            zones,
            permissions: structuredClone(permissions),
            bans: structuredClone(
              venue.access!.bans.filter(
                (ban) =>
                  ban.active &&
                  (ban.zoneId === null ? venueManager : zones.some((zone) => zone.manages && zone.id === ban.zoneId)),
              ),
            ),
          },
        ];
      });
      if (!authorities.length) return [];
      return [
        {
          venueId: venue.id,
          name: venue.name,
          revision: venue.access!.revision,
          fingerprint: memoryHash([
            venue.access,
            venue.residentIds,
            venue.workerIds,
            venue.occupancy.playerHome,
            venue.zones?.map((zone) => [zone.id, zone.kind, zone.ownerId, zone.controllerIds, zone.access]),
            state.communityVenueId,
          ]),
          authorities,
        },
      ];
    });
}
export type NarrationAccessScope = ReturnType<typeof narrationAccessScopes>[number];
const id = z.string().min(1).max(200),
  ids = z.array(id).max(100);
export const narrationAccessScopeSchema = z
  .object({
    venueId: id,
    name: z.string().max(200),
    revision: z.number().int().nonnegative().safe(),
    fingerprint: z.string().regex(/^[a-f0-9]{64}$/),
    authorities: z
      .array(
        z
          .object({
            actorId: id,
            venuePolicy: z.object({ managerIds: ids, visitorHours: hoursSchema.nullable() }).strict().optional(),
            zones: z
              .array(
                z
                  .object({
                    id,
                    name: z.string().max(200),
                    policy: zonePolicySchema.optional(),
                    manages: z.boolean(),
                    invites: z.boolean(),
                  })
                  .strict(),
              )
              .max(256),
            permissions: z.array(permissionSchema.strict()).max(10000),
            bans: z.array(banSchema.strict()).max(10000),
          })
          .strict(),
      )
      .max(5),
  })
  .strict();
export function discussesAccess(scene: VenueScene, input: string) {
  const accessWords =
    /\b(?:access|permission|invit(?:e|ed|es|ing|ation)|allow(?:ed|ing)?|forbid(?:den)?|ban(?:ned)?|visitor hours|visiting hours|(?:may|can|could) (?:i|we) (?:enter|come|go|use|visit)|come (?:in|through|inside)|let (?:me|us|them|you) (?:in|through)|open (?:the |this )?door|knock|locked|unlock)\b/iu;
  return (
    accessWords.test(input) ||
    scene.lines.slice(-4).some((line) => !line.contactHidden && accessWords.test(line.content))
  );
}

export function sceneAccessDiscussed(scene: VenueScene, venue: VillageVenue, input: string) {
  const origin = scene.zoneId ?? "exterior";
  const neighbors = contactNeighbors(venue, origin, scene);
  const named = input.normalize("NFKC").toLowerCase();
  const restricted = sceneLayoutVenue(venue, scene).zones?.some((zone) => {
    if (
      zone.id !== origin &&
      !(zone.seen && neighbors.includes(zone.id) && named.includes(zone.name.normalize("NFKC").toLowerCase()))
    )
      return false;
    const policy = zone.access ?? defaultZonePolicy(venue, zone);
    return (
      policy.mode !== "public" ||
      policy.accompanied ||
      Array.isArray(policy.visitorHours) ||
      (policy.visitorHours === "inherit" && !!venue.access?.visitorHours)
    );
  });
  return (
    scene.area === "private" ||
    origin === "exterior" ||
    !!restricted ||
    !!scene.pendingAccessClaim ||
    !!scene.doorwayContacts?.length ||
    !!scene.contactGeneration?.instruction ||
    discussesAccess(scene, input)
  );
}

export function narrationAccessPrompt(scopes: NarrationAccessScope[]) {
  return scopes.length
    ? "Scoped native access authority (GM only). Omitted Zone hours inherit; null removes hours. " +
        JSON.stringify(
          scopes.map(({ venueId, name, authorities }) => ({
            venueId,
            name,
            authorities: authorities.map((row) => ({
              actorId: row.actorId,
              venuePolicy: row.venuePolicy
                ? {
                    managerIds: row.venuePolicy.managerIds,
                    visitorHours:
                      row.venuePolicy.visitorHours === null
                        ? undefined
                        : hoursSchema.parse(row.venuePolicy.visitorHours),
                  }
                : undefined,
              zones: row.zones.map(({ id, name, policy, manages, invites }) => ({
                id,
                name,
                manages: manages || undefined,
                invites: invites || undefined,
                policy: policy
                  ? {
                      mode: policy.mode,
                      managerIds: policy.managerIds ?? undefined,
                      memberIds: policy.memberIds.length ? policy.memberIds : undefined,
                      memberRoles: policy.memberRoles.length ? policy.memberRoles : undefined,
                      inviterIds: policy.inviterIds.length ? policy.inviterIds : undefined,
                      visitorHours: Array.isArray(policy.visitorHours)
                        ? hoursSchema.parse(policy.visitorHours)
                        : policy.visitorHours === "inherit"
                          ? undefined
                          : policy.visitorHours,
                      accompanied: policy.accompanied || undefined,
                    }
                  : undefined,
              })),
              permissions: row.permissions.length
                ? row.permissions.map(({ id, zoneId, visitorId, issuerId, duration, accompaniedBy, outsideHours }) => ({
                    id,
                    zoneId,
                    visitorId,
                    issuerId,
                    duration,
                    accompaniedBy,
                    outsideHours,
                  }))
                : undefined,
              bans: row.bans.length
                ? row.bans.map(({ id, zoneId, visitorId, issuerId }) => ({ id, zoneId, visitorId, issuerId }))
                : undefined,
            })),
          })),
        )
    : "";
}
export type NarrationAccessDecision = {
  by: string;
  venue: string;
  zone: string | null;
} & (
  | { type: "permission.grant"; visitor: string }
  | { type: "permission.revoke"; visitor: string }
  | { type: "guest.invite"; visitor: string; expiresAt?: string; route?: string[] }
  | {
      type: "access.decide";
      visitor: string;
      outcome: "invite-now" | "invite-later" | "invite-outside-hours" | "refuse" | "dismiss" | "ban-zone" | "ban-venue";
      accompanies?: boolean;
    }
  | { type: "access.decide"; outcome: "access-management"; management: unknown }
);

export function guestInvitation(
  state: VillageState,
  context: NarrationSourceContext,
  readset: NarrationReadset,
  cue: { by?: string; zone?: string; until?: "morning" | { dayOffset: number; minute: number } },
  proof: ContinuityEvidence,
  receiptId: string,
  at: string,
): NarrationAccessDecision {
  const { scene } = context;
  const venue = findLocation(state, scene.placeId);
  const by = proof.kind === "speech" ? proof.actorId : cue.by;
  const positions = proof.positions;
  const origin = positions?.player;
  memoryRequire(
    venue?.access &&
      by &&
      by !== "player" &&
      origin &&
      positions?.[by] &&
      (!cue.by || cue.by === by) &&
      (positions[by] === origin || contactNeighbors(venue, origin, scene).includes(positions[by])) &&
      memoryHash(captureSceneLayout(venue)) === memoryHash(scene.sceneAttendance?.layout),
    "the invitation needs the current host and doorway",
  );
  const captured = sceneLayoutVenue(context.venue, scene);
  const neighbors = contactNeighbors(captured, origin, scene);
  const rooms = captured.zones?.filter(
    (zone) => neighbors.includes(zone.id) && (zone.kind === "shared-residence" || zone.kind === "public"),
  );
  const zoneId = cue.zone ?? (rooms?.length === 1 && rooms[0].seen ? rooms[0].id : undefined);
  const zone = venue.zones?.find((row) => row.id === zoneId);
  memoryRequire(
    zone &&
      captured.zones?.some((row) => row.id === zone.id) &&
      mayInvite(venue, zone, by) &&
      !zoneClosed(state, venue, zone),
    "the invitation needs a supplied room this host can open",
  );
  const decision = { type: "guest.invite" as const, by, venue: venue.id, zone: zone.id, visitor: "player" };
  const now = new ZonedDate(at, readset.calendar.timeZone);
  let expiresAt: string | undefined;
  if (cue.until === "morning") {
    const dayOffset = now.getHours() < 8 && !/\btonight\b/iu.test(proof.excerpt) ? 0 : 1;
    expiresAt = calendarAt(
      now,
      sceneAppointment({ when: { dayOffset }, minute: 480 }, readset.calendar).date,
      480,
    ).toISOString();
  } else if (cue.until) {
    const { dayOffset, minute } = cue.until;
    const { date } = sceneAppointment({ when: { dayOffset }, minute }, readset.calendar);
    expiresAt = calendarAt(now, date, minute).toISOString();
  }
  const projected = structuredClone(venue);
  const potentialRoute = venue.zones
    ?.filter((row) => !row.access?.accompanied && managesAccess(venue, row.id, by))
    .map((row) => row.id);
  applyAccessCommand(
    projected,
    {
      action: "invite",
      operationId: receiptId,
      expectedRevision: venue.access.revision,
      zoneId: zone.id,
      visitorId: "player",
      accompanied: false,
      outsideHours: !!expiresAt,
      sceneId: scene.id,
      ...(expiresAt ? { duration: "timed", expiresAt, route: potentialRoute } : { duration: "visit" }),
    },
    by,
    at,
    ["player"],
  );
  const entry = contactPath(state, projected, origin, zone.id, "player", { ...scene, continuity: undefined }, now);
  memoryRequire(entry, "there is no permitted route to the invited room");
  if (!expiresAt) return decision;
  const checkout = new ZonedDate(Date.parse(expiresAt) - 1, now.zone);
  const arrival = permittedVenuePath(state, projected, "player", zone.id, now);
  const departure = permittedVenuePath(state, projected, "player", zone.id, checkout);
  memoryRequire(arrival && departure, "there is no permitted route during the stay");
  const route = [...new Set([...entry, ...arrival, ...departure])].filter((id) => {
    const room = venue.zones?.find((room) => room.id === id);
    if (!room || id === zone.id || !potentialRoute?.includes(id)) return false;
    const policy = room.access ?? defaultZonePolicy(venue, room);
    const alwaysPublic =
      policy.mode === "public" &&
      (policy.visitorHours === "always" || (policy.visitorHours === "inherit" && !venue.access!.visitorHours));
    return !alwaysPublic && evaluateZoneAccess(venue, room, "player", { at: now }).reason !== "member";
  });
  return { ...decision, expiresAt, route };
}

/** The exact current communication is required; private context and recalled consent have no native authority. */
export function assertNarrationDecision(
  state: VillageState,
  by: string,
  context: NarrationCommunication,
  sources: ContinuityEvidence[],
) {
  const actor = context.actors.find((actor) => actor.id === by);
  memoryRequire(
    actor && continuityActor(state, by)?.incarnation === actor.incarnation,
    "native deciding actor changed",
  );
  memoryRequire(
    sources.length > 0 &&
      sources.length <= 8 &&
      sources.every((source) => {
        if (
          source.seed !== state.seed ||
          source.episodeId !== context.episodeId ||
          source.actorId !== by ||
          source.kind !== "speech" ||
          !source.moment
        )
          return false;
        if (memoryHash(source.positions) !== memoryHash(context.positions(source.moment))) return false;
        if (by === "player")
          return (
            source.unitId === "input" &&
            source.fingerprint === memoryHash(context.input) &&
            source.range &&
            context.input.slice(source.range.start, source.range.end) === source.excerpt
          );
        const index = context.lines.findIndex((line) => line.id === source.unitId),
          line = context.lines[index];
        return (
          line?.role === "assistant" &&
          line.speakerId === by &&
          line.kind !== "narration" &&
          !line.contactReport &&
          source.moment.index === index &&
          source.moment.side === "after" &&
          source.fingerprint === memoryHash(line) &&
          source.excerpt === line.content
        );
      }),
    "native decision needs this actor's complete current communication",
  );
}

export function applyNarrationAccess(
  state: VillageState,
  decision: NarrationAccessDecision,
  readset: Pick<NarrationReadset, "setupAt" | "access"> & {
    source: Pick<NarrationReadset["source"], "seed" | "episodeId">;
  },
  context: NarrationCommunication,
  sources: ContinuityEvidence[],
  before: NarrationAccessScope,
  receiptId: string,
  at: string,
): AcceptedEpisode["commandReceipts"][number] {
  const captured = readset.access.find((scope) => scope.venueId === decision.venue),
    venue = findLocation(state, decision.venue);
  memoryRequire(
    state.seed === readset.source.seed &&
      state.setupAt === readset.setupAt &&
      context.episodeId === readset.source.episodeId &&
      venue?.access &&
      captured &&
      before.venueId === decision.venue &&
      before.revision === captured.revision &&
      before.fingerprint === captured.fingerprint &&
      memoryHash(before) === memoryHash(captured) &&
      captured.authorities.some((authority) => authority.actorId === decision.by),
    "the captured access authority changed or was not supplied",
  );
  if (decision.type === "guest.invite" && sources[0]?.kind === "observation") {
    const proof = sources[0];
    const line = context.lines[proof.moment?.index ?? -1];
    memoryRequire(
      sources.length === 1 &&
        proof.seed === state.seed &&
        proof.episodeId === context.episodeId &&
        line?.kind === "narration" &&
        line.id === proof.unitId &&
        proof.fingerprint === memoryHash(line) &&
        proof.moment &&
        memoryHash(proof.positions) === memoryHash(context.positions(proof.moment)) &&
        proof.positions?.[decision.by] === proof.positions?.player &&
        context.actors.some(
          (actor) => actor.id === decision.by && continuityActor(state, actor.id)?.incarnation === actor.incarnation,
        ) &&
        proof.perceptions.some((row) => row.channel === "sight" && row.actorId === "player"),
      "the player's invitation needs a witnessed action by the present host",
    );
  } else {
    assertNarrationDecision(state, decision.by, context, sources);
    memoryRequire(
      sources.every((source) =>
        source.perceptions.some(
          (row) =>
            row.channel === "words" &&
            (decision.type === "guest.invite" ? row.actorId === "player" : row.actorId !== decision.by),
        ),
      ) &&
        (decision.type !== "guest.invite" ||
          sources.every((source) => {
            const line = context.lines[source.moment!.index];
            return !line.targetId || line.targetId === "player";
          })),
      "an access decision must actually be communicated",
    );
  }
  const lineIds = [...new Set(sources.map((source) => source.unitId))],
    known = ["player", ...sceneActorIds(state)];
  const apply = (meaning: object, id = receiptId) => {
    applyAccessCommand(
      venue,
      readAccessCommand({ ...meaning, operationId: id, expectedRevision: venue.access!.revision }),
      decision.by,
      at,
      known,
      lineIds,
      state.communityVenueId,
    );
  };
  if (decision.type === "guest.invite") {
    memoryRequire(
      decision.zone && context.visit?.placeId === decision.venue,
      "the invitation belongs to the current Place",
    );
    apply({
      action: "invite",
      zoneId: decision.zone,
      visitorId: decision.visitor,
      accompanied: false,
      outsideHours: !!decision.expiresAt,
      sceneId: context.visit.id,
      ...(decision.expiresAt
        ? { duration: "timed", expiresAt: decision.expiresAt, route: decision.route }
        : { duration: "visit" }),
    });
  } else if (decision.type === "permission.revoke") {
    memoryRequire(decision.zone, "standing permission needs its exact Zone");
    memoryRequire(known.includes(decision.visitor), "standing permission needs an established visitor");
    const grants = venue.access.permissions.filter(
      (grant) =>
        !grant.revoked &&
        grant.duration === "standing" &&
        grant.zoneId === decision.zone &&
        grant.visitorId === decision.visitor &&
        grant.issuerId === decision.by,
    );
    for (const grant of grants)
      apply(
        { action: "revoke", zoneId: decision.zone, permissionId: grant.id },
        receiptId + ":" + memoryHash(grant.id).slice(0, 16),
      );
    if (!grants.length) {
      venue.access.revision++;
      venue.access.changes.push({
        id: receiptId,
        revision: venue.access.revision,
        actorId: decision.by,
        zoneId: decision.zone,
        action: "revoke",
        at,
        sourceLineIds: lineIds,
      });
    }
    venue.access.receipts[receiptId] = {
      fingerprint: memoryHash([decision, lineIds]),
      revision: venue.access.revision,
    };
  } else if (decision.type === "permission.grant" || decision.outcome !== "access-management") {
    const outcome = decision.type === "permission.grant" ? "standing" : decision.outcome;
    memoryRequire(decision.zone || outcome === "ban-venue", "access decision needs its exact Zone");
    const meaning =
      outcome === "refuse" || outcome === "dismiss"
        ? {
            action: outcome === "refuse" ? "refuse-entry" : "leave-now",
            visitorId: decision.visitor,
            sceneId: context.visit?.id,
          }
        : outcome === "ban-zone" || outcome === "ban-venue"
          ? { action: "ban", visitorId: decision.visitor }
          : {
              action: "invite",
              visitorId: decision.visitor,
              duration: outcome === "standing" ? "standing" : "visit",
              accompanied: decision.type === "access.decide" && decision.accompanies === true,
              outsideHours: outcome === "invite-outside-hours",
              ...(outcome === "invite-now" ||
              (outcome === "invite-outside-hours" && decision.venue === context.visit?.placeId)
                ? { sceneId: context.visit?.id }
                : {}),
            };
    memoryRequire(
      !["refuse", "dismiss", "invite-now"].includes(outcome) || decision.venue === context.visit?.placeId,
      "a current-visit decision cannot target a different Place",
    );
    apply({ ...meaning, zoneId: outcome === "ban-venue" ? null : decision.zone });
  } else {
    memoryRequire(
      decision.management && typeof decision.management === "object" && !Array.isArray(decision.management),
      "invalid access management",
    );
    const raw = decision.management as Record<string, unknown>;
    memoryRequire(
      !["operationId", "expectedRevision", "zoneId", "sceneId"].some((key) => Object.hasOwn(raw, key)) &&
        ["venue-policy", "zone-policy", "recover-managers", "lift-ban", "exception"].includes(String(raw.action)),
      "unsupported access management fields",
    );
    apply({ ...raw, zoneId: decision.zone });
  }
  const person = (id: string) =>
    id === "player"
      ? state.playerPersonaName || state.playerName || "Player"
      : state.villagers.find((actor) => actor.characterId === id)?.cardSnapshot.name ||
        findNpc(state, id)?.name ||
        "Former resident";
  const grant = venue.access.permissions.find((grant) => grant.id === receiptId);
  const destination =
    (venue.zones?.find((zone) => zone.id === decision.zone)?.name ?? "the Venue") + " at " + venue.name;
  let text: string;
  if (grant)
    text = `${person(decision.by)} ${grant.duration === "standing" ? "gave standing permission to" : "invited"} ${person(grant.visitorId)} to ${destination}${grant.duration === "visit" ? (grant.sceneId ? " for this visit" : " for one visit") : grant.duration === "timed" ? " until " + grant.expiresAt : ""}${grant.accompaniedBy ? ", accompanied by " + person(grant.accompaniedBy) : ""}${grant.outsideHours ? ", including outside visitor hours" : ", during visitor hours"}.`;
  else if (decision.type === "permission.revoke")
    text = `${person(decision.by)} withdrew their standing permission for ${person(decision.visitor)} to ${destination}.`;
  else {
    memoryRequire(decision.type === "access.decide", "native invitation lost its permission");
    text =
      decision.outcome === "access-management"
        ? `${person(decision.by)} updated the access rules for ${destination}.`
        : `${person(decision.by)} ${decision.outcome === "refuse" ? "refused entry for" : decision.outcome === "dismiss" ? "required the departure of" : "prohibited entry for"} ${person(decision.visitor)} ${decision.outcome === "ban-venue" ? "at " + venue.name : "at " + destination}${["refuse", "dismiss"].includes(decision.outcome) ? " for this visit" : " until the ban is lifted"}.`;
  }
  return {
    id: receiptId,
    kind: "access",
    targetId: venue.id,
    revision: venue.access.revision,
    text,
    witnesses: narrationWitnesses(sources),
  };
}
