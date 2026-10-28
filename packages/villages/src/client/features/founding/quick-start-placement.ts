import type { VillageVenue } from "../../../shared/contracts/village.js";

/** Fill missing placement only. Authored positions survive generation and retries. */
export function arrangeQuickStartVenues(venues: VillageVenue[], moveAll = false): VillageVenue[] {
  const occupied = moveAll
    ? []
    : venues
        .filter((venue) => venue.presentation.x !== null && venue.presentation.y !== null)
        .map((venue) => venue.presentation);
  return venues.map((venue) => {
    if (!moveAll && venue.presentation.x !== null && venue.presentation.y !== null) return venue;
    const candidates = [0.5, 0.28, 0.72, 0.15, 0.85].flatMap((y) => [0.5, 0.22, 0.78].map((x) => ({ x, y })));
    const spot = candidates.find(
      (candidate) =>
        !occupied.some((other) => Math.abs(other.x! - candidate.x) < 0.15 && Math.abs(other.y! - candidate.y) < 0.15),
    );
    if (!spot) return venue;
    occupied.push({ ...venue.presentation, ...spot });
    return { ...venue, presentation: { ...venue.presentation, ...spot } };
  });
}
