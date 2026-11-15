import type { VillagePlaceView, VillageState, VillageVisitor } from "../models/world.js";
import { memoryHash } from "./memory-integrity.js";
import { evaluateZoneAccess } from "./venue-access.js";
import { MAX_ZONE_VILLAGERS } from "./venue-model.js";
import { venueZones, zoneClosed } from "./venue-zones.js";

const HOUR = 3_600_000;
const WINDOW = 8 * HOUR;
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

/** Draw once per window from the saved world seed. Refreshes and retries cannot reroll arrival. */
export function visitingCharacter(state: VillageState, now: Date): VillageVisitor | undefined {
  const window = Math.floor(now.getTime() / WINDOW);
  if (window % 2 !== 0) return;
  const start = window * WINDOW;
  const candidates = (state.visitors ?? []).flatMap((person) => {
    if (!person.visitsEnabled || Date.parse(person.addedAt) > start) return [];
    const preference = person.visitPreference;
    const requested = preference && Date.parse(preference.from) <= start && Date.parse(preference.until) > start;
    if (requested && preference.kind === "space") return [];
    const firstEligible = preference ? Math.ceil(Date.parse(preference.from) / (WINDOW * 2)) * 2 : 0;
    const invited =
      requested &&
      preference.kind === "invite" &&
      window === firstEligible + 2 * Math.floor(draw([state.seed, preference.sourceId]) * 3);
    const firstVisit = !person.firstMetAt || Date.parse(person.firstMetAt) > start;
    const kind = invited ? "invited" : firstVisit ? "first" : "ordinary";
    const weight = invited ? 4 : firstVisit ? 3 : 1;
    return [{ person, kind, rank: draw([state.seed, window, person.characterId]) ** (1 / weight) }];
  });
  const chosen = candidates.sort((a, b) => b.rank - a.rank)[0];
  if (chosen && draw([state.seed, window, "visit"]) < VISIT_CHANCE[chosen.kind]) return chosen.person;
}

export function visitorPosition(
  state: VillageState,
  now: Date,
  presence: ReadonlyMap<string, VillagePlaceView>,
  positions?: ReadonlyMap<string, VillagePlaceView>,
) {
  const person = visitingCharacter(state, now);
  if (!person) return;
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
      if (
        (!alreadyHere &&
          (zoneClosed(state, venue, zone) ||
            !evaluateZoneAccess(venue, zone, person.characterId, { at: now, environment: state.narrative }).allowed)) ||
        [...presence.values()].filter((row) => row.id === venue.id && row.zoneId === zone.id).length >=
          MAX_ZONE_VILLAGERS
      )
        continue;
      return { person, venueId: venue.id, zoneId: zone.id, name: venue.name };
    }
  }
}

export function sameVisitorWindow(state: VillageState, id: string, before: Date, now: Date) {
  return (
    Math.floor(before.getTime() / WINDOW) === Math.floor(now.getTime() / WINDOW) &&
    visitingCharacter(state, now)?.characterId === id
  );
}

export function nextVisitorTransition(state: VillageState, now: Date): number {
  return state.visitors?.some((person) => person.visitsEnabled)
    ? (Math.floor(now.getTime() / WINDOW) + 1) * WINDOW
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
