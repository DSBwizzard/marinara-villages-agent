import type { VillagePlaceView, VillageState, VillageVisitor, VisitorTrip } from "../models/world.js";
import { calendarDate, ZonedDate } from "../../../shared/helpers/zoned-date.js";
import { calendarReplay } from "./clock-state.js";
import { latestRelationshipScores, relationshipKey } from "./continuity.js";
import { agendaDateKey } from "./agenda-week.js";
import { conflict } from "./errors.js";
import { memoryHash } from "./memory-integrity.js";
import { mayHostLodging } from "./venue-access.js";
import { MAX_ZONE_VILLAGERS } from "./venue-model.js";
import { accessibleVenueRoute } from "./venue-path.js";
import { venueZones, zoneClosed } from "./venue-zones.js";

const DAY = 86_400_000;
const HOUR = 3_600_000;
const ARRIVAL = 9;
const DEPARTURE = 17;
const BEDTIME = 22;
const MORNING = 7;
const VISIT_CHANCE = { ordinary: 0.12, first: 0.55, invited: 0.75 };

export const cardCharacters = (state: Pick<VillageState, "villagers" | "visitors">) => [
  ...state.villagers,
  ...(state.visitors ?? []),
];

export const findCardCharacter = (state: Pick<VillageState, "villagers" | "visitors">, id: string) =>
  state.villagers.find((person) => person.characterId === id) ??
  state.visitors?.find((person) => person.characterId === id);

export const knownCardCharacters = (state: VillageState) => [
  ...state.villagers,
  ...(state.visitors ?? []).filter((person) => person.firstMetAt),
];

const draw = (parts: unknown[]) => parseInt(memoryHash(parts).slice(0, 8), 16) / 0x100000000;
const local = (state: VillageState, now: Date | string) =>
  new ZonedDate(now, state.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone);
const onDay = (at: Date, hour: number, offset = 0) =>
  calendarDate(at, at.getFullYear(), at.getMonth(), at.getDate() + offset, hour);
const sleepTime = (at: Date) => at.getHours() >= BEDTIME || at.getHours() < MORNING;

const trusted = (state: VillageState, now: Date) =>
  Math.max(now.getTime(), Date.parse(state.clock?.trustedAt ?? now.toISOString()));

export function visitingCharacter(state: VillageState, now: Date) {
  if (calendarReplay(state, local(state, now))) return;
  const at = now.toISOString();
  return state.visitors?.find(
    (person): person is VillageVisitor & { trip: VisitorTrip } =>
      !!person.trip &&
      person.visitsEnabled &&
      person.trip.arrivedAt <= at &&
      Date.parse(person.trip.leavesAt) > trusted(state, now),
  );
}

/** The daytime draw is tied to the local date. Saving the trip consumes it. */
function potentialArrival(state: VillageState, at: Date) {
  if (
    !state.foundedAt ||
    calendarReplay(state, at) ||
    at.getTime() + 60_000 < trusted(state, at) ||
    at.getHours() < ARRIVAL ||
    at.getHours() >= DEPARTURE
  )
    return;
  const day = agendaDateKey(at);
  const start = onDay(at, ARRIVAL);
  const candidates = (state.visitors ?? []).flatMap((person) => {
    if (!person.visitsEnabled || Date.parse(person.addedAt) > start.getTime()) return [];
    if (person.trip && Date.parse(person.trip.leavesAt) + DAY > at.getTime()) return [];
    const preference = person.visitPreference;
    const requested = preference && preference.from <= start.toISOString() && preference.until > start.toISOString();
    if (preference?.kind === "space" && preference.from <= at.toISOString() && preference.until > at.toISOString())
      return [];
    const since = preference && local(state, preference.from);
    const firstChance = since && onDay(since, ARRIVAL, since > onDay(since, ARRIVAL) ? 1 : 0);
    const invited =
      requested &&
      preference.kind === "invite" &&
      firstChance &&
      day === agendaDateKey(onDay(firstChance, ARRIVAL, Math.floor(draw([state.seed, preference.sourceId]) * 3)));
    const kind = invited ? "invited" : !person.firstMetAt ? "first" : "ordinary";
    const weight = invited ? 4 : kind === "first" ? 3 : 1;
    return [{ person, kind, rank: draw([state.seed, day, person.characterId]) ** (1 / weight) }];
  });
  const chosen = candidates.sort((a, b) => b.rank - a.rank)[0];
  if (chosen && draw([state.seed, day, "visit"]) < VISIT_CHANCE[chosen.kind]) return chosen.person;
}

// shortcut: the authored room name designates guest lodging until Venues expose a dedicated lodging setting.
const guestRoom = /\b(?:guest (?:bed ?room|room|suite)|spare (?:bed ?room|room))\b/iu;
const inn = /\b(?:inn|hotel|hostel|guesthouse|guest house|lodging|lodge)\b/iu;
const innRoom = /^(?:room\s+[\p{L}\p{N}]+|(?:.+ )?suite|(?:.+ )?bed ?room|dormitory)$/iu;

function lodgingRoom(state: VillageState, actor: string, choice: NonNullable<VisitorTrip["lodging"]>, at: Date) {
  const venue = state.venues.find((row) => row.id === choice.venueId);
  const zone = venue && venueZones(venue).find((row) => row.id === choice.zoneId);
  if (
    !venue ||
    !zone ||
    zone.kind === "exterior" ||
    zoneClosed(state, venue, zone) ||
    Object.values(venue.destinations ?? {}).some((row) => row.sleep === zone.id) ||
    !accessibleVenueRoute(state, venue, actor, zone.id, at)
  )
    return;
  if (choice.hostId) {
    if (
      !guestRoom.test(zone.name) ||
      !mayHostLodging(venue, zone, choice.hostId) ||
      !venue.access?.permissions.some(
        (grant) =>
          grant.zoneId === zone.id &&
          grant.visitorId === actor &&
          grant.issuerId === choice.hostId &&
          !grant.revoked &&
          !grant.accompaniedBy &&
          (grant.duration === "standing" ||
            (grant.duration === "lodging" && grant.expiresAt && grant.expiresAt > at.toISOString())),
      )
    )
      return;
  } else if (!inn.test(venue.name) || (!guestRoom.test(zone.name) && !innRoom.test(zone.name)) || zone.ownerId) return;
  return { venue, zone };
}

function chooseLodging(state: VillageState, actor: string, nights: Date[], newHostSince?: string) {
  const options = state.venues.flatMap((venue) =>
    venueZones(venue).flatMap((zone) => {
      const hosts = (venue.residentIds ?? []).filter(
        (id) =>
          state.villagers.some((person) => person.characterId === id) &&
          (!newHostSince ||
            venue.access?.permissions.some(
              (grant) =>
                grant.duration === "standing" &&
                !grant.revoked &&
                grant.issuerId === id &&
                grant.visitorId === actor &&
                grant.zoneId === zone.id &&
                grant.issuedAt >= newHostSince,
            )),
      );
      return [
        ...hosts.map((hostId) => ({ venueId: venue.id, zoneId: zone.id, hostId })),
        ...(!newHostSince ? [{ venueId: venue.id, zoneId: zone.id, hostId: undefined }] : []),
      ];
    }),
  );
  return options
    .sort((a, b) => Number(!!b.hostId) - Number(!!a.hostId))
    .find((choice) => nights.every((night) => lodgingRoom(state, actor, choice, night)));
}

function remainingNights(trip: VisitorTrip, at: Date) {
  const bedtime = onDay(at, BEDTIME);
  const nights = sleepTime(at)
    ? [at, at < bedtime ? bedtime : onDay(at, BEDTIME, 1)]
    : [bedtime, onDay(at, BEDTIME, 1)];
  return nights.filter((night) => night.getTime() < Date.parse(trip.leavesAt));
}

function lodgingUpdate(state: VillageState, person: VillageVisitor & { trip: VisitorTrip }, at: Date) {
  const nights = remainingNights(person.trip, at);
  if (!nights.length) return;
  const current = person.trip.lodging;
  const usable = current && nights.every((night) => lodgingRoom(state, person.characterId, current, night));
  if (usable && current.hostId) return;
  return (
    chooseLodging(state, person.characterId, nights, person.trip.arrivedAt) ??
    (current && !usable ? (chooseLodging(state, person.characterId, nights) ?? null) : undefined)
  );
}

function lodgingExpired(grant: { duration: string; expiresAt?: string }, instant: number) {
  return grant.duration === "lodging" && !(Date.parse(grant.expiresAt ?? "") > instant);
}

/** Apply only after rechecking inside the world mutation. */
export function visitorTripNeedsSettlement(state: VillageState, now: Date) {
  const instant = trusted(state, now);
  if (state.venues.some((venue) => venue.access?.permissions.some((grant) => lodgingExpired(grant, instant))))
    return true;
  const at = local(state, now);
  const person = visitingCharacter(state, now);
  return person ? lodgingUpdate(state, person, at) !== undefined : !!potentialArrival(state, at);
}

export function settleVisitorTrip(state: VillageState, now: Date) {
  const instant = trusted(state, now);
  for (const venue of state.venues) {
    if (venue.access)
      venue.access.permissions = venue.access.permissions.filter((grant) => !lodgingExpired(grant, instant));
  }
  const at = local(state, now);
  const active = visitingCharacter(state, now);
  if (active) {
    const lodging = lodgingUpdate(state, active, at);
    if (lodging !== undefined) {
      clearVisitorLodging(state, active);
      if (lodging) active.trip.lodging = lodging;
    }
    return;
  }
  const person = potentialArrival(state, at);
  if (!person) return;
  clearVisitorLodging(state, person);
  const lodging = chooseLodging(state, person.characterId, [onDay(at, BEDTIME), onDay(at, BEDTIME, 1)]);
  person.trip = {
    arrivedAt: at.toISOString(),
    leavesAt: onDay(at, DEPARTURE, 2).toISOString(),
    ...(lodging ? { lodging } : {}),
  };
}

export function clearVisitorLodging(state: VillageState, person: VillageVisitor) {
  for (const venue of state.venues) {
    if (!venue.access) continue;
    venue.access.permissions = venue.access.permissions.filter(
      (grant) => grant.duration !== "lodging" || grant.visitorId !== person.characterId,
    );
  }
  if (person.trip) delete person.trip.lodging;
}

export function guestRoomOffer(
  state: VillageState,
  person: VillageVisitor,
  now: Date,
  hostId: string,
  selection?: { venueId: string; zoneId: string },
) {
  if (!person.firstMetAt || !person.trip || person.trip.lodging?.hostId || !person.visitsEnabled) return;
  const at = local(state, now);
  const nights = remainingNights(person.trip, at);
  if (!nights.length) return;
  for (const venue of state.venues) {
    if (!venue.access || (selection && venue.id !== selection.venueId)) continue;
    for (const zone of venueZones(venue)) {
      if (
        (selection && zone.id !== selection.zoneId) ||
        !guestRoom.test(zone.name) ||
        !mayHostLodging(venue, zone, hostId)
      )
        continue;
      const choice = { venueId: venue.id, zoneId: zone.id, hostId };
      const grant = {
        id:
          "lodging-" +
          memoryHash([state.seed, person.incarnation, person.trip.arrivedAt, venue.id, zone.id]).slice(0, 32),
        zoneId: zone.id,
        visitorId: person.characterId,
        issuerId: hostId,
        duration: "lodging" as const,
        expiresAt: person.trip.leavesAt,
        sceneId: null,
        accompaniedBy: null,
        outsideHours: true,
        revoked: false,
        issuedAt: at.toISOString(),
        sourceLineIds: [],
      };
      const candidate = { ...venue, access: { ...venue.access, permissions: [...venue.access.permissions, grant] } };
      const projected = { ...state, venues: state.venues.map((row) => (row === venue ? candidate : row)) };
      if (nights.every((night) => lodgingRoom(projected, person.characterId, choice, night)))
        return { venue, choice, grant };
    }
  }
}

export const playerGuestRoom = (state: VillageState, person: VillageVisitor, now: Date) =>
  guestRoomOffer(state, person, now, "player");

export function offerVisitorLodging(state: VillageState, id: string, trip: string, now: Date) {
  const person = visitingCharacter(state, now);
  if (!person || person.characterId !== id || person.trip.arrivedAt !== trip)
    throw conflict("That visit has ended. Refresh People.");
  if (person.trip.lodging?.hostId === "player") return;
  const subject = { id: "player", incarnation: memoryHash([state.seed, state.setupAt, "player"]) };
  const actor = { id, incarnation: person.incarnation };
  const warmth =
    latestRelationshipScores(state.continuity).get(relationshipKey(actor, subject))?.relationshipScore ?? 0;
  if (warmth < 0 || (person.visitPreference?.kind === "space" && person.visitPreference.until > now.toISOString()))
    throw conflict("They'd prefer to keep their lodging this visit.");
  const room = playerGuestRoom(state, person, now);
  if (!room) throw conflict("There is no available guest room to offer for this stay.");
  clearVisitorLodging(state, person);
  room.venue.access!.permissions.push(room.grant);
  person.trip.lodging = room.choice;
}

export function visitorPosition(
  state: VillageState,
  now: Date,
  presence: ReadonlyMap<string, VillagePlaceView>,
  positions?: ReadonlyMap<string, VillagePlaceView>,
) {
  const person = visitingCharacter(state, now);
  if (!person) return;
  const at = local(state, now);
  const hasRoom = (id: string, zoneId: string) =>
    [...presence.values()].filter((row) => row.id === id && row.zoneId === zoneId).length < MAX_ZONE_VILLAGERS;
  if (sleepTime(at)) {
    const room = person.trip.lodging && lodgingRoom(state, person.characterId, person.trip.lodging, at);
    if (room && hasRoom(room.venue.id, room.zone.id))
      return { person, venueId: room.venue.id, zoneId: room.zone.id, name: room.venue.name, sleeping: true };
    return;
  }
  const placed = positions?.get(person.characterId);
  const venues = [...state.venues].sort(
    (a, b) => Number(b.id === state.communityVenueId) - Number(a.id === state.communityVenueId),
  );
  for (const venue of venues) {
    const zones = venueZones(venue);
    for (const zone of [
      ...zones.filter((row) => row.kind !== "exterior"),
      ...zones.filter((row) => row.kind === "exterior"),
    ]) {
      const alreadyHere = placed?.id === venue.id && placed.zoneId === zone.id;
      if (placed && !alreadyHere) continue;
      if (!alreadyHere && zone.kind !== "exterior" && (zone.access?.mode !== "public" || zone.access.accompanied))
        continue;
      if (!alreadyHere && (guestRoom.test(zone.name) || (inn.test(venue.name) && innRoom.test(zone.name)))) continue;
      if (
        !hasRoom(venue.id, zone.id) ||
        zoneClosed(state, venue, zone) ||
        (!alreadyHere && !accessibleVenueRoute(state, venue, person.characterId, zone.id, at))
      )
        continue;
      return { person, venueId: venue.id, zoneId: zone.id, name: venue.name, sleeping: false };
    }
  }
}

export function sameVisitorPhase(state: VillageState, id: string, before: Date, now: Date) {
  const current = visitingCharacter(state, now);
  if (current?.characterId !== id || Date.parse(current.trip.arrivedAt) > before.getTime()) return false;
  const a = local(state, before),
    b = local(state, now);
  const phase = (at: Date) =>
    at.getHours() < MORNING
      ? onDay(at, BEDTIME, -1)
      : at.getHours() >= BEDTIME
        ? onDay(at, BEDTIME)
        : onDay(at, MORNING);
  return phase(a).getTime() === phase(b).getTime();
}

export function nextVisitorTransition(state: VillageState, now: Date): number {
  const active = visitingCharacter(state, now);
  const at = local(state, now);
  if (active) {
    const hour = at.getHours();
    const phaseEnd = hour < MORNING ? onDay(at, MORNING) : hour < BEDTIME ? onDay(at, BEDTIME) : onDay(at, MORNING, 1);
    return Math.min(phaseEnd.getTime(), Date.parse(active.trip.leavesAt));
  }
  return state.visitors?.some((person) => person.visitsEnabled)
    ? onDay(at, ARRIVAL, at.getHours() < ARRIVAL ? 0 : 1).getTime()
    : Infinity;
}

export function applyVisitPreference(
  visitor: VillageVisitor,
  kind: "invite" | "space",
  source: { id: string; at: string },
  acceptedAt: string,
) {
  const prior = visitor.visitPreference;
  if (prior && (prior.sentAt > source.at || (prior.sentAt === source.at && prior.latestSourceId >= source.id))) return;
  // A second letter of the same kind during the window cannot extend or reroll it.
  if (prior?.kind === kind && prior.until > acceptedAt) {
    visitor.visitPreference = { ...prior, sentAt: source.at, latestSourceId: source.id };
    return;
  }
  visitor.visitPreference = {
    kind,
    sourceId: source.id,
    latestSourceId: source.id,
    sentAt: source.at,
    from: acceptedAt,
    until: new Date(Date.parse(acceptedAt) + (kind === "invite" ? 72 : 168) * HOUR).toISOString(),
  };
}
