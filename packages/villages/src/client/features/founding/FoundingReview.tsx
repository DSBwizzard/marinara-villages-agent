import type { ReactNode } from "react";
import { foundingHomeMembers } from "./founding-homes.js";
import type { FoundingScreenController } from "./screen-contracts.js";

export type ReviewEditor = "people" | "setting" | "map";

export function FoundingReview({
  controller,
  disabled,
  phone,
  section,
  onEdit,
  actions,
}: {
  controller: FoundingScreenController;
  disabled: boolean;
  phone: boolean;
  section: "people" | "setting";
  onEdit(section: ReviewEditor): void;
  actions: ReactNode;
}) {
  const {
    setupName,
    setupWorldName,
    setupLocationName,
    setupSetting,
    setupVenues,
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
  const heading = (title: string, editor: ReviewEditor) => (
    <header>
      <h3>{title}</h3>
      <button type="button" aria-label={"Edit " + title} disabled={disabled} onClick={() => onEdit(editor)}>
        Edit
      </button>
    </header>
  );
  return (
    <section className="villages-founding-review" aria-label={"Review " + setupName} data-page={section}>
      <h2>Review {setupName}</h2>
      <div className="villages-review-grid">
        {!phone || section === "people" ? (
          <section className="villages-review-card villages-review-people" aria-label="People summary">
            {heading("People", "people")}
            <ul>
              {people.map((person) => {
                const home = setupVenues.find((venue) => foundingHomeMembers(venue).includes(person.id));
                return (
                  <li key={person.id}>
                    <strong>{person.name}</strong>
                    <span>{home?.name || "Choose a home"}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}
        {!phone || section === "setting" ? (
          <section className="villages-review-card villages-review-setting" aria-label="Setting summary">
            {heading("Setting", "setting")}
            <p className="villages-review-value">World: {setupWorldName || "Open world"}</p>
            <p className="villages-review-value">Map: {setupLocationName}</p>
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
        ) : null}
      </div>
      <footer className="villages-review-actions">{actions}</footer>
    </section>
  );
}
