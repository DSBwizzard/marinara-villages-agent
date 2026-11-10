import type { ContinuityEvidence } from "../models/continuity-model.js";
import type { AcceptedEpisode } from "../models/episode-model.js";
import type { NarrationReadset } from "../models/narration-model.js";
import type { VillageState } from "../models/world.js";
import { continuityActor } from "./continuity-actors.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";
import { narrationPositions, narrationWitnesses, type NarrationSourceContext } from "./narration-sources.js";
import { findLocation, findNpc, sceneActorIds } from "./places.js";
import { applyAccessCommand, managesAccess, mayInvite, readAccessCommand } from "./venue-access.js";

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
export function narrationAccessPrompt(scopes: NarrationAccessScope[]) {
  return scopes.length
    ? "Scoped native access authority; never private room contents or character knowledge: " +
        JSON.stringify(
          scopes.map(({ venueId, name, authorities }) => ({
            venueId,
            name,
            authorities: authorities.map((row) => ({
              actorId: row.actorId,
              venuePolicy: row.venuePolicy,
              zones: row.zones,
              permissions: row.permissions.map(
                ({ id, zoneId, visitorId, issuerId, duration, accompaniedBy, outsideHours }) => ({
                  id,
                  zoneId,
                  visitorId,
                  issuerId,
                  duration,
                  accompaniedBy,
                  outsideHours,
                }),
              ),
              bans: row.bans.map(({ id, zoneId, visitorId, issuerId }) => ({ id, zoneId, visitorId, issuerId })),
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
      outcome: "invite-now" | "invite-later" | "invite-outside-hours" | "refuse" | "dismiss" | "ban-zone" | "ban-venue";
      accompanies?: boolean;
    }
  | { type: "access.decide"; outcome: "access-management"; management: unknown }
);

/** The exact current communication is required; private context and recalled consent have no native authority. */
export function assertNarrationDecision(
  state: VillageState,
  by: string,
  context: NarrationSourceContext,
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
        if (memoryHash(source.positions) !== memoryHash(narrationPositions(context, source.moment))) return false;
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
  readset: NarrationReadset,
  context: NarrationSourceContext,
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
      captured.authorities.some((authority) => authority.actorId === decision.by),
    "the captured access authority changed or was not supplied",
  );
  assertNarrationDecision(state, decision.by, context, sources);
  memoryRequire(
    sources.every((source) => source.perceptions.some((row) => row.channel === "words" && row.actorId !== decision.by)),
    "an access decision must actually be communicated",
  );
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
      outcome: "applied",
    };
  } else if (decision.type === "permission.grant" || decision.outcome !== "access-management") {
    const outcome = decision.type === "permission.grant" ? "standing" : decision.outcome;
    memoryRequire(decision.zone || outcome === "ban-venue", "access decision needs its exact Zone");
    const meaning =
      outcome === "refuse" || outcome === "dismiss"
        ? {
            action: outcome === "refuse" ? "refuse-entry" : "leave-now",
            visitorId: decision.visitor,
            sceneId: context.scene.id,
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
              (outcome === "invite-outside-hours" && decision.venue === context.scene.placeId)
                ? { sceneId: context.scene.id }
                : {}),
            };
    memoryRequire(
      !["refuse", "dismiss", "invite-now"].includes(outcome) || decision.venue === context.scene.placeId,
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
