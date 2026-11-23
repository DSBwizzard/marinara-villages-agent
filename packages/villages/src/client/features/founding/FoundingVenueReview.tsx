import type { VillageVenue } from "../../../shared/contracts/village.js";
import { FoundingArrangements } from "./FoundingArrangements.js";

export function FoundingVenueReview({
  review,
  current,
  people,
  onUse,
  onDismiss,
  onProblem,
}: {
  review: { baseline: string; venues: VillageVenue[] };
  current: VillageVenue[];
  people: { id: string; name: string }[];
  onUse(venues: VillageVenue[]): void;
  onDismiss(): void;
  onProblem(message: string): void;
}) {
  const withoutPins = (rows: VillageVenue[]) =>
    JSON.stringify(rows.map((row) => ({ ...row, presentation: { ...row.presentation, x: null, y: null } })));
  return (
    <section className="villages-forging-card villages-access-panel" aria-label="Review Venue suggestions">
      <h2>Review Venue suggestions</h2>
      <FoundingArrangements venues={review.venues} people={people} />
      {review.venues.map((venue) => (
        <details key={venue.id}>
          <summary>{venue.name} , Zones</summary>
          <p>{venue.form}</p>
          {[...(venue.spaces ?? []), ...(venue.privateSpaces ?? [])].map((zone) => (
            <div key={zone.id}>
              <strong>{zone.name}</strong>
              <p>{zone.description}</p>
              <p>
                {zone.ownerId ? "Personal room" : "Shared Zone"} ,{" "}
                {zone.access?.mode === "permission-required" ? "Permission required" : "Public"}
                {Array.isArray(zone.access?.visitorHours)
                  ? " , " +
                    zone.access.visitorHours
                      .map((row) => row.days.map((day) => day.slice(0, 3)).join(", ") + " " + row.start + "–" + row.end)
                      .join("; ")
                  : ""}
              </p>
            </div>
          ))}
        </details>
      ))}
      <button
        type="button"
        onClick={() => {
          if (withoutPins(current) !== withoutPins(JSON.parse(review.baseline))) {
            onProblem("Your Venues changed. Discard this draft and request fresh suggestions.");
            return;
          }
          onUse(
            review.venues.map((row) => {
              const prior = current.find((venue) => venue.id === row.id);
              return prior
                ? { ...row, presentation: { ...row.presentation, x: prior.presentation.x, y: prior.presentation.y } }
                : row;
            }),
          );
          onDismiss();
        }}
      >
        Use changes
      </button>
      <button type="button" onClick={onDismiss}>
        Discard
      </button>
    </section>
  );
}
