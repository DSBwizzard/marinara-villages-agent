import type { VillageVenue } from "../../../shared/contracts/village.js";
import { foundingVenueDraftSource } from "../../../shared/helpers/founding-venue-draft.js";
import { DisclosureSummary } from "../../shared/DisclosureSummary.js";
import { clearFoundingAssignments } from "./quick-start-drafts.js";

export function FoundingVenueReview({
  review,
  current,
  onUse,
  onDismiss,
  onProblem,
  sourceKey,
}: {
  review: { baseline: string; venues: VillageVenue[]; sourceKey?: string; replaceAll?: boolean };
  current: VillageVenue[];
  onUse(venues: VillageVenue[]): void;
  onDismiss(): void;
  onProblem(message: string): void;
  sourceKey?: string;
}) {
  const withoutPins = (rows: VillageVenue[]) => JSON.stringify(rows.map(foundingVenueDraftSource));
  return (
    <section className="villages-forging-card villages-access-panel" aria-label="Review Venue draft">
      <h2>{review.replaceAll ? "New Venue plan" : "Review Venue draft"}</h2>
      {review.venues.map((venue) => (
        <details key={venue.id}>
          <DisclosureSummary show={`Show details for ${venue.name}`} hide={`Hide details for ${venue.name}`} />
          <p>{venue.form}</p>
          {[...(venue.spaces ?? []), ...(venue.privateSpaces ?? [])].map((zone) => (
            <div key={zone.id}>
              <strong>{zone.name}</strong>
              <p>{zone.description}</p>
              <p>{zone.access?.mode === "permission-required" ? "Invitation only" : "Open to everyone"}</p>
            </div>
          ))}
        </details>
      ))}
      <button
        type="button"
        onClick={() => {
          if (
            (review.sourceKey && sourceKey && review.sourceKey !== sourceKey) ||
            withoutPins(current) !== withoutPins(JSON.parse(review.baseline))
          ) {
            onProblem("Founding choices changed. Discard this draft and request a fresh one.");
            return;
          }
          if (
            !review.replaceAll &&
            current.some((venue) => {
              const next = review.venues.find((row) => row.id === venue.id);
              return (
                !next ||
                (["spaces", "privateSpaces"] as const).some((key) =>
                  (venue[key] ?? []).some((zone) => !(next[key] ?? []).some((room) => room.id === zone.id)),
                )
              );
            })
          ) {
            onProblem("Discard this older draft and request a new one.");
            return;
          }
          const selected = review.replaceAll
            ? review.venues.map(clearFoundingAssignments)
            : review.venues.map((proposal) => {
                const previous = current.find((old) => old.id === proposal.id);
                if (!previous) return clearFoundingAssignments(proposal);
                if (withoutPins([previous]) === withoutPins([proposal])) return previous;
                const row = clearFoundingAssignments(proposal);
                const room = <T extends NonNullable<VillageVenue["spaces"]>[number]>(zone: T): T => {
                  const old = [...(previous.spaces ?? []), ...(previous.privateSpaces ?? [])].find(
                    (old) => old.id === zone.id,
                  );
                  return old
                    ? {
                        ...zone,
                        ...old,
                        name: zone.name,
                        purpose: zone.purpose,
                        description: zone.description,
                        ...(zone.dayNight === undefined ? {} : { dayNight: zone.dayNight }),
                        connectedTo: [...new Set([...(old.connectedTo ?? []), ...(zone.connectedTo ?? [])])],
                      }
                    : zone;
                };
                return {
                  ...row,
                  residentIds: previous.residentIds,
                  occupancy: previous.occupancy,
                  workerIds: previous.workerIds,
                  access: previous.access,
                  destinations: previous.destinations,
                  spaces: row.spaces?.map(room),
                  privateSpaces: row.privateSpaces?.map(room),
                  presentation: {
                    ...row.presentation,
                    image: row.presentation.image ?? previous.presentation.image,
                    x: previous.presentation.x,
                    y: previous.presentation.y,
                  },
                };
              });
          onUse(selected);
          onProblem("");
          onDismiss();
        }}
      >
        {review.replaceAll ? "Replace Venues" : "Use changes"}
      </button>
      <button
        type="button"
        onClick={() => {
          onProblem("");
          onDismiss();
        }}
      >
        Discard
      </button>
    </section>
  );
}
