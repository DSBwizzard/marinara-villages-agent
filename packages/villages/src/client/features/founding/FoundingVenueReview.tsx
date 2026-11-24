import type { VillageVenue } from "../../../shared/contracts/village.js";
import { useEffect, useState } from "react";
import {
  applyFoundingAssignmentReview,
  foundingAssignmentChanges,
  foundingAssignmentValue,
  foundingAssignmentReviewProblem,
} from "./founding-assignment-review.js";

export function FoundingVenueReview({
  review,
  current,
  people,
  onUse,
  onDismiss,
  onProblem,
  sourceKey,
  onAccepted,
}: {
  review: { baseline: string; venues: VillageVenue[]; sourceKey?: string; accepted?: string[] };
  current: VillageVenue[];
  people: { id: string; name: string }[];
  onUse(venues: VillageVenue[]): void;
  onDismiss(): void;
  onProblem(message: string): void;
  sourceKey?: string;
  onAccepted?(ids: string[]): void;
}) {
  const [localAccepted, setAccepted] = useState<string[]>(review.accepted ?? []);
  useEffect(() => setAccepted(review.accepted ?? []), [review.venues, review.accepted]);
  const accepted = review.accepted ?? localAccepted;
  const before = JSON.parse(review.baseline) as VillageVenue[];
  const changes = foundingAssignmentChanges(before, review.venues);
  const withoutPins = (rows: VillageVenue[]) =>
    JSON.stringify(rows.map((row) => ({ ...row, presentation: { ...row.presentation, x: null, y: null } })));
  return (
    <section className="villages-forging-card villages-access-panel" aria-label="Review Venue draft">
      <h2>Review Venue draft</h2>
      {!!changes.length && (
        <fieldset>
          <legend>Assignment changes</legend>
          {changes.map((change) => (
            <details key={change.id}>
              <summary>
                {change.actor === "player"
                  ? "You"
                  : (people.find((person) => person.id === change.actor)?.name ?? "Villager")}
                , {change.kind}
              </summary>
              <dl className="villages-manage-details">
                <dt>Current</dt>
                <dd>{foundingAssignmentValue(before, change)}</dd>
                <dt>Proposed</dt>
                <dd>{foundingAssignmentValue(review.venues, change)}</dd>
              </dl>
              <label className="villages-manage-check">
                <input
                  type="checkbox"
                  autoComplete="off"
                  checked={accepted.includes(change.id)}
                  onChange={(event) => {
                    const ids = event.target.checked
                      ? [...accepted, change.id]
                      : accepted.filter((id) => id !== change.id);
                    setAccepted(ids);
                    onAccepted?.(ids);
                  }}
                />
                Accept {change.kind} change
              </label>
            </details>
          ))}
        </fieldset>
      )}
      {review.venues.map((venue) => (
        <details key={venue.id}>
          <summary>{venue.name}</summary>
          <p>{venue.form}</p>
          {[...(venue.spaces ?? []), ...(venue.privateSpaces ?? [])].map((zone) => (
            <div key={zone.id}>
              <strong>{zone.name}</strong>
              <p>{zone.description}</p>
              <p>
                {zone.access?.mode === "permission-required" ? "Invitation only" : "Open to everyone"}
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
          if (review.sourceKey && sourceKey && review.sourceKey !== sourceKey) {
            onProblem("Founding choices changed. Discard this draft and request a fresh one.");
            return;
          }
          if (withoutPins(current) !== withoutPins(JSON.parse(review.baseline))) {
            onProblem("Your Venues changed. Discard this draft and request fresh suggestions.");
            return;
          }
          const selected = applyFoundingAssignmentReview(before, review.venues, accepted);
          if (
            selected.some((row) =>
              [...(row.residentIds ?? []), ...(row.workerIds ?? [])].some(
                (id) => !people.some((person) => person.id === id),
              ),
            )
          ) {
            onProblem("Choose only the selected founding Villagers for Home and Work.");
            return;
          }
          const problem = foundingAssignmentReviewProblem(selected);
          if (problem) {
            onProblem(problem);
            return;
          }
          onUse(
            selected.map((row) => {
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
