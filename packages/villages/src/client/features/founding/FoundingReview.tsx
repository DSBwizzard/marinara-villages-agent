import type { ReactNode } from "react";
import { foundingHomeMembers } from "./founding-homes.js";
import { foundingVenueIssues } from "./villages-founding-workspace-state.js";
import type { FoundingScreenController } from "./screen-contracts.js";

export type ReviewEditor = "people" | "setting" | "map" | "venues";

export function FoundingReview({
  controller,
  disabled,
  onEdit,
  actions,
}: {
  controller: FoundingScreenController;
  disabled: boolean;
  onEdit(section: ReviewEditor, venueId?: string): void;
  actions: ReactNode;
}) {
  const {
    setupName,
    setupWorldName,
    setupLocationName,
    setupSetting,
    setupVenues,
    setupMapSrc,
    personas,
    personaDraft,
    catalog,
    setupFoundingVillagerIds,
  } = controller;
  const people = [
    { id: "player", name: (personas?.find((person) => person.id === personaDraft)?.name || "Your Persona") + " (you)" },
    ...setupFoundingVillagerIds.map((id) => ({
      id,
      name: catalog?.find((person) => person.id === id)?.name || "Unavailable character",
    })),
  ];
  const issues = foundingVenueIssues(setupVenues, false);
  const heading = (title: string, section: ReviewEditor) => (
    <header>
      <h3>{title}</h3>
      <button type="button" aria-label={"Edit " + title} disabled={disabled} onClick={() => onEdit(section)}>
        Edit
      </button>
    </header>
  );
  return (
    <section className="villages-founding-review" aria-label={"Review " + setupName}>
      <h2>Review {setupName}</h2>
      <div className="villages-review-grid">
        <section className="villages-review-card villages-review-people" aria-label="People summary">
          {heading("People", "people")}
          <ul>
            {people.map((person) => {
              const home = setupVenues.find((venue) => foundingHomeMembers(venue).includes(person.id));
              return (
                <li key={person.id}>
                  <strong title={person.name}>{person.name}</strong>
                  <span title={home?.name}>{home?.name || "Choose a home"}</span>
                </li>
              );
            })}
          </ul>
        </section>
        <section className="villages-review-card villages-review-setting" aria-label="Setting summary">
          {heading("Setting", "setting")}
          <p className="villages-review-value" title={setupWorldName}>
            World: {setupWorldName || "Open world"}
          </p>
          <p className="villages-review-value" title={setupLocationName}>
            Map: {setupLocationName}
          </p>
          <p className="villages-review-description">{setupSetting}</p>
          <button
            className="villages-review-details"
            type="button"
            disabled={disabled}
            onClick={() => onEdit("setting")}
          >
            Details
          </button>
        </section>
        <section className="villages-review-card villages-review-map" aria-label="Map summary">
          {heading(setupLocationName || "First map", "map")}
          <button
            type="button"
            className="villages-review-map-preview"
            aria-label="Review map"
            disabled={disabled}
            onClick={() => onEdit("map")}
          >
            {setupMapSrc ? (
              <img src={setupMapSrc} alt={"Map of " + setupLocationName} />
            ) : (
              <span>Choose map artwork</span>
            )}
          </button>
        </section>
        <section className="villages-review-card villages-review-places" aria-label="Places and homes summary">
          {heading("Places & homes", "venues")}
          <ul>
            {setupVenues.map((venue) => {
              const ready = !issues.some((issue) => issue.venueId === venue.id);
              return (
                <li key={venue.id}>
                  <button
                    type="button"
                    disabled={disabled}
                    aria-label={"Edit " + (venue.name || "place")}
                    onClick={() => onEdit("venues", venue.id)}
                  >
                    <span title={venue.name}>{venue.name || "Unnamed place"}</span>
                    <span
                      className="villages-review-ready"
                      data-ready={ready || undefined}
                      aria-label={ready ? "Ready" : "Needs attention"}
                    >
                      {ready ? "✓" : "!"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
      <footer className="villages-review-actions">{actions}</footer>
    </section>
  );
}
