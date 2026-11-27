import type { VillageVenue } from "../../../shared/contracts/village.js";

/** Fill missing placement only. Authored positions survive generation and retries. */
export function arrangeQuickStartVenues(venues: VillageVenue[]): VillageVenue[] {
  const occupied = venues
    .filter((venue) => venue.presentation.x !== null && venue.presentation.y !== null)
    .map((venue) => venue.presentation);
  return venues.map((venue) => {
    if (venue.presentation.x !== null && venue.presentation.y !== null) return venue;
    const candidates = [0.5, 0.32, 0.68, 0.14, 0.86].flatMap((y) =>
      [0.5, 0.32, 0.68, 0.14, 0.86].map((x) => ({ x, y })),
    );
    const spot = candidates.find(
      (candidate) =>
        !occupied.some((other) => Math.abs(other.x! - candidate.x) < 0.15 && Math.abs(other.y! - candidate.y) < 0.15),
    );
    if (!spot) return venue;
    occupied.push({ ...venue.presentation, ...spot });
    return { ...venue, presentation: { ...venue.presentation, ...spot } };
  });
}

export function appendFoundingVenue(venues: VillageVenue[], venue: VillageVenue): VillageVenue[] {
  const placed = arrangeQuickStartVenues([
    ...venues.filter((row) => row.presentation.x !== null && row.presentation.y !== null),
    { ...venue, presentation: { ...venue.presentation, x: null, y: null } },
  ]).at(-1)!;
  return [...venues, placed];
}
