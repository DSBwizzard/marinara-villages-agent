import { useState } from "react";
import type { VillageVenue } from "../../../shared/contracts/village.js";
import { foundingVenueDraftSource } from "../../../shared/helpers/founding-venue-draft.js";
import { FoundingDialog } from "./FoundingDialog.js";
import { clearFoundingAssignments } from "./quick-start-drafts.js";

export function FoundingVenueReview({
  review,
  current,
  onUse,
  onDismiss,
  sourceKey,
}: {
  review: { baseline: string; venues: VillageVenue[]; sourceKey?: string; replaceAll?: boolean };
  current: VillageVenue[];
  onUse(venues: VillageVenue[]): void;
  onDismiss(): void;
  sourceKey?: string;
}) {
  const [problem, setProblem] = useState("");
  const withoutPins = (rows: VillageVenue[]) => JSON.stringify(rows.map(foundingVenueDraftSource));
  function applyDraft() {
    if (
      (review.sourceKey && sourceKey && review.sourceKey !== sourceKey) ||
      withoutPins(current) !== withoutPins(JSON.parse(review.baseline))
    ) {
      setProblem("Founding choices changed. Discard this draft and request a fresh one.");
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
      setProblem("Discard this older draft and request a new one.");
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
    onDismiss();
  }

  return (
    <FoundingDialog
      title={review.replaceAll ? "Venue drafts" : "Review Venue draft"}
      className="villages-venue-review-dialog"
      scrollBody
      withinChapter
      onClose={onDismiss}
    >
      <div className="villages-venue-review-scroll" tabIndex={0} role="region" aria-label="Venue draft details">
        {review.replaceAll && current.length > 0 && (
          <p className="villages-venue-review-warning">Applying this draft replaces all of your current Venues.</p>
        )}
        <table className="villages-venue-review-table" role="table">
          <thead role="rowgroup">
            <tr role="row">
              <th role="columnheader" scope="col">
                Venue
              </th>
              <th role="columnheader" scope="col">
                Form
              </th>
              <th role="columnheader" scope="col">
                Zones
              </th>
            </tr>
          </thead>
          <tbody role="rowgroup">
            {review.venues.map((venue) => (
              <tr key={venue.id} role="row">
                <th role="rowheader" scope="row">
                  {venue.name}
                </th>
                <td role="cell">{venue.form}</td>
                <td role="cell">
                  <span className="villages-venue-review-zone-label" aria-hidden="true">
                    Zones
                  </span>
                  {[...(venue.spaces ?? []), ...(venue.privateSpaces ?? [])].map((zone, index) => (
                    <span key={zone.id}>
                      {index > 0 ? ", " : ""}
                      {zone.name}
                      {zone.access?.mode === "permission-required" ? <small> (invitation only)</small> : null}
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {problem ? (
        <p className="villages-venue-review-problem" role="alert">
          {problem}
        </p>
      ) : null}
      <footer>
        <button type="button" onClick={onDismiss}>
          Discard draft
        </button>
        <button type="button" className="villages-forging-primary" onClick={applyDraft}>
          {review.replaceAll ? "Replace Venues" : "Use changes"}
        </button>
      </footer>
    </FoundingDialog>
  );
}
