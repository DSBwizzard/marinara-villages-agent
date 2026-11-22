import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { foundingHomeMembers } from "./founding-homes.js";
import { foundingVenueIssues } from "./villages-founding-workspace-state.js";
import type { FoundingScreenController } from "./screen-contracts.js";
import { FoundingReviewMap } from "./FoundingReviewMap.js";

export type ReviewEditor = "people" | "setting" | "map" | "venues";

export function FoundingReview({
  controller,
  disabled,
  phone,
  onEdit,
  onBack,
  foundAction,
}: {
  controller: FoundingScreenController;
  disabled: boolean;
  phone: boolean;
  onEdit(section: ReviewEditor, venueId?: string): void;
  onBack(): void;
  foundAction: ReactNode;
}) {
  const [page, setPage] = useState(0);
  const [placesPage, setPlacesPage] = useState(0);
  const [placesPageSize, setPlacesPageSize] = useState(6);
  const review = useRef<HTMLElement>(null);
  const pageTitle = useRef<HTMLHeadingElement>(null);
  const titles = ["People", "Setting", "Map", "Places"];
  useLayoutEffect(() => {
    const element = review.current;
    if (!element) return;
    const measure = () => {
      const font = Number.parseFloat(getComputedStyle(element).fontSize);
      setPlacesPageSize(Math.max(1, Math.min(6, Math.floor((element.clientHeight - 160) / (font * 4)))));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const movePage = (next: number) => {
    setPage(next);
    requestAnimationFrame(() => pageTitle.current?.focus({ preventScroll: true }));
  };
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
  const issues = foundingVenueIssues(setupVenues, false);
  const placePages = Math.max(1, Math.ceil(setupVenues.length / placesPageSize));
  const placePage = Math.min(placesPage, placePages - 1);
  const reviewVenues = phone
    ? [
        ...setupVenues.filter((venue) => !venue.classes?.includes("residence")),
        ...setupVenues.filter((venue) => venue.classes?.includes("residence")),
      ]
    : setupVenues;
  const heading = (title: string, section: ReviewEditor) => (
    <header>
      <h3 ref={phone ? pageTitle : undefined} tabIndex={phone ? -1 : undefined}>
        {phone ? titles[page] : title}
      </h3>
      {phone ? <span className="villages-review-page-position">{page + 1} of 4</span> : null}
      <button
        type="button"
        aria-label={phone && section === "map" ? "Edit placements" : "Edit " + title}
        disabled={disabled}
        onClick={() => onEdit(section)}
      >
        {phone && section === "map" ? "Edit placements" : "Edit"}
      </button>
    </header>
  );
  return (
    <section
      ref={review}
      className="villages-founding-review"
      aria-label={"Review " + setupName}
      data-page={phone ? titles[page] : undefined}
    >
      <h2>Review {setupName}</h2>
      <div className="villages-review-grid">
        {!phone || page === 0 ? (
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
        ) : null}
        {!phone || page === 1 ? (
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
        ) : null}
        {!phone || page === 2 ? (
          <section className="villages-review-card villages-review-map" aria-label="Map summary">
            {heading(setupLocationName || "First map", "map")}
            {phone ? <p className="villages-review-map-name">{setupLocationName}</p> : null}
            <FoundingReviewMap controller={controller} phone={phone} disabled={disabled} onEdit={() => onEdit("map")} />
          </section>
        ) : null}
        {!phone || page === 3 ? (
          <section className="villages-review-card villages-review-places" aria-label="Places and homes summary">
            {heading("Places & homes", "venues")}
            <ul>
              {(phone
                ? reviewVenues.slice(placePage * placesPageSize, (placePage + 1) * placesPageSize)
                : reviewVenues
              ).map((venue, index) => {
                const ready = !issues.some((issue) => issue.venueId === venue.id);
                const home = venue.classes?.includes("residence");
                const previous = reviewVenues[placePage * placesPageSize + index - 1];
                return (
                  <li key={venue.id}>
                    {phone && (index === 0 || home !== previous?.classes?.includes("residence")) ? (
                      <h4>{home ? "Homes" : "Public places"}</h4>
                    ) : null}
                    <button
                      type="button"
                      disabled={disabled}
                      aria-label={"Edit " + (venue.name || "place")}
                      onClick={() => onEdit("venues", venue.id)}
                    >
                      <span title={venue.name}>{venue.name || "Unnamed place"}</span>
                      {!phone || !ready ? (
                        <span
                          className="villages-review-ready"
                          data-ready={ready || undefined}
                          aria-label={ready ? "Ready" : "Needs attention"}
                        >
                          {ready ? "✓" : "!"}
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
            {phone && issues.length === 0 ? <p className="villages-review-place-status">All places are ready</p> : null}
            {phone && placePages > 1 ? (
              <nav className="villages-review-key-pages" aria-label="Place pages">
                <button
                  type="button"
                  aria-label="Previous places"
                  disabled={disabled || placePage === 0}
                  onClick={() => setPlacesPage(placePage - 1)}
                >
                  ‹
                </button>
                <span>
                  {placePage + 1} / {placePages}
                </span>
                <button
                  type="button"
                  aria-label="Next places"
                  disabled={disabled || placePage === placePages - 1}
                  onClick={() => setPlacesPage(placePage + 1)}
                >
                  ›
                </button>
              </nav>
            ) : null}
          </section>
        ) : null}
      </div>
      <footer className="villages-review-actions">
        <button type="button" disabled={disabled} onClick={() => (phone && page > 0 ? movePage(page - 1) : onBack())}>
          Back
        </button>
        {phone && page < 3 ? (
          <button
            type="button"
            className="villages-forging-primary"
            disabled={disabled}
            onClick={() => movePage(page + 1)}
          >
            Next: {titles[page + 1]}
          </button>
        ) : (
          foundAction
        )}
      </footer>
    </section>
  );
}
