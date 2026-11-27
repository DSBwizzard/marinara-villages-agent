import { readPlayerIdentity } from "./player-identity.js";
import { venueWorkSchema, workOfferViewSchema } from "../../../shared/helpers/venue-work.js";
import type { ContinuityEvidence } from "../models/continuity-model.js";
import { z } from "zod";
import type { AcceptedEpisode } from "../models/episode-model.js";
import type { NarrationReadset } from "../models/narration-model.js";
import type { VillageState } from "../models/world.js";
import { continuityActor } from "./continuity-actors.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";
import { narrationWitnesses, type NarrationCommunication } from "./narration-sources.js";
import { findLocation, findNpc, sceneActorIds } from "./places.js";
import { findCardCharacter } from "./visitors.js";
import {
  applyAccessCommand,
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
            policy: managesAccess(venue, zone.id, actorId) ? structuredClone(zone.access) : undefined,
            manages: managesAccess(venue, zone.id, actorId),
            invites: mayInvite(venue, zone, actorId),
          }));
        const permissions = venue.access!.permissions.filter(
          (permission) =>
            !permission.revoked &&
            (permission.issuerId === actorId || zones.some((zone) => zone.manages && zone.id === permission.zoneId)),
        );
        const work = (venue.access!.work ?? []).filter((row) => venueManager || row.characterId === actorId);
        const workOffers = (venue.access!.workOffers ?? [])
          .filter((row) => row.requiredIds.includes(actorId))
          .map(({ previous: _previous, ...row }) => row);
        if (!venueManager && !zones.length && !permissions.length && !work.length && !workOffers.length) return [];
        return [
          {
            actorId,
            work: structuredClone(work),
            workOffers: structuredClone(workOffers),
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
            venue.access?.work,
            venue.access?.workOffers,
            venue.occupancy.playerHome,
            venue.zones?.map((zone) => [zone.id, zone.kind, zone.ownerId, zone.controllerIds, zone.access]),
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
            work: z.array(venueWorkSchema).max(100),
            workOffers: z.array(workOfferViewSchema).max(100),
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
export function narrationAccessPrompt(
  scopes: NarrationAccessScope[],
  localVenue?: string,
  localZones: string[] = [],
  compact = false,
) {
  const visible = (venueId: string, zoneId: string | null) =>
    venueId !== localVenue || zoneId === null || localZones.includes(zoneId);
  return scopes.length
    ? (compact
        ? "Scoped native access authority (GM only): "
        : 'Scoped native access authority (GM only). Each Zone has explicit visitorHours: "always" or a schedule array. Set hours through zone-policy for that Zone; venue-policy changes only who runs the Venue. Work offers are exact pending terms, not current work. The player decides in the Work panel. Only the actual required resident may agree or decline through access.decide outcome:"access-management", zone:null, management:{action:"work-decide",offerId:the exact pending id,accept:true|false}. Require that speaker’s complete current communication explicitly accepting those terms; another person reporting agreement is insufficient. Changes to terms require a fresh proposal and fresh approvals. To propose new terms use management:{action:"work-propose",characterId,terms:{characterId,activity,zoneId,accessZoneIds,days,startMinute,endMinute}}; terms:null proposes ending work. Never invent an agreement or infer one from ordinary work attendance. ') +
        JSON.stringify(
          scopes.map(({ venueId, name, authorities }) => ({
            venueId,
            name,
            authorities: authorities.map((row) => ({
              actorId: row.actorId,
              work: row.work.length ? row.work : undefined,
              workOffers: row.workOffers.length ? row.workOffers : undefined,
              venuePolicy: row.venuePolicy
                ? {
                    managerIds: row.venuePolicy.managerIds,
                  }
                : undefined,
              zones: row.zones
                .filter(({ id }) => visible(venueId, id))
                .map(({ id, name, policy, manages, invites }) => ({
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
                ? row.permissions
                    .filter(({ zoneId }) => visible(venueId, zoneId))
                    .map(({ id, zoneId, visitorId, issuerId, duration, accompaniedBy, outsideHours }) => ({
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
                ? row.bans
                    .filter(({ zoneId }) => visible(venueId, zoneId))
                    .map(({ id, zoneId, visitorId, issuerId }) => ({ id, zoneId, visitorId, issuerId }))
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
  | {
      type: "access.decide";
      visitor: string;
      outcome:
        | "invite-now"
        | "invite-later"
        | "invite-outside-hours"
        | "host-visitor"
        | "refuse"
        | "dismiss"
        | "ban-zone"
        | "ban-venue";
      accompanies?: boolean;
    }
  | { type: "access.decide"; outcome: "access-management"; management: unknown }
);

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
  readset: Pick<NarrationReadset, "setupAt" | "access" | "visibleAccessZones" | "explicitSceneEvidence"> & {
    source: Pick<NarrationReadset["source"], "seed" | "episodeId" | "visitorTrips"> & { scene?: { placeId: string } };
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
  memoryRequire(
    !(decision.type === "access.decide" && decision.outcome === "host-visitor"),
    "Visitor hosting is unavailable until sleeping arrangements are defined.",
  );
  const visible = (zoneId: string | null) =>
    !zoneId ||
    decision.venue !== readset.source.scene?.placeId ||
    !readset.visibleAccessZones ||
    readset.visibleAccessZones.includes(zoneId);
  memoryRequire(visible(decision.zone), "the Zone was not supplied for this decision");
  assertNarrationDecision(state, decision.by, context, sources);
  memoryRequire(
    sources.every((source) => source.perceptions.some((row) => row.channel === "words" && row.actorId !== decision.by)),
    "an access decision must actually be communicated",
  );
  const lineIds = [...new Set(sources.map((source) => source.unitId))],
    known = ["player", ...sceneActorIds(state)];
  const apply = (meaning: object, id = receiptId) => {
    const command = readAccessCommand({ ...meaning, operationId: id, expectedRevision: venue.access!.revision });
    if ("zoneId" in command)
      memoryRequire(visible(command.zoneId ?? null), "the Zone was not supplied for this decision");
    if (readset.explicitSceneEvidence && decision.by === "player" && command.action === "work-decide")
      memoryRequire(false, "confirm the player's work decision in the Work panel");
    if (command.action === "work-propose" && command.terms)
      memoryRequire(
        visible(command.terms.zoneId ?? null) && command.terms.accessZoneIds.every(visible),
        "the work Zones were not supplied for this decision",
      );
    applyAccessCommand(
      venue,
      command,
      decision.by,
      at,
      known,
      lineIds,
      state.villagers.map((row) => row.characterId),
    );
  };
  if (decision.type === "permission.revoke") {
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
    if (raw.action === "work-propose" || raw.action === "work-decide")
      memoryRequire(
        state.venues.some((row) => row.id === venue.id),
        "Work arrangements need an admitted Venue.",
      );
    memoryRequire(
      !["operationId", "expectedRevision", "zoneId", "sceneId"].some((key) => Object.hasOwn(raw, key)) &&
        [
          "venue-policy",
          "zone-policy",
          "recover-managers",
          "lift-ban",
          "exception",
          "work-propose",
          "work-decide",
        ].includes(String(raw.action)),
      "unsupported access management fields",
    );
    apply({ ...raw, zoneId: decision.zone });
  }
  const person = (id: string) =>
    id === "player"
      ? readPlayerIdentity(state).name || "Player"
      : findCardCharacter(state, id)?.cardSnapshot.name || findNpc(state, id)?.name || "Former resident";
  const grant = venue.access.permissions.find((grant) => grant.id === receiptId);
  const destination =
    (venue.zones?.find((zone) => zone.id === decision.zone)?.name ?? "the Venue") + " at " + venue.name;
  let text: string;
  if (grant)
    text = `${person(decision.by)} ${grant.duration === "standing" ? "gave standing permission to" : "invited"} ${person(grant.visitorId)} to ${destination}${grant.duration === "visit" ? (grant.sceneId ? " for this visit" : " for one visit") : ""}${grant.accompaniedBy ? ", accompanied by " + person(grant.accompaniedBy) : ""}${grant.outsideHours ? ", including outside visitor hours" : ", during visitor hours"}.`;
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
