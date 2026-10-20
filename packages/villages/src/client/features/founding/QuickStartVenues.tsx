import { Fragment, useEffect, useRef, type ReactNode } from "react";
import type { VillageVenue } from "../../../shared/contracts/village.js";
import {
  foundingVenueIssues,
  type FoundingIssue,
  type FoundingWorkspaceState,
} from "./villages-founding-workspace-state.js";

export function QuickStartVenues({
  venues,
  people,
  setting,
  selectedId,
  state,
  busy,
  imageBusy,
  suggestionsChanged,
  suggestionsKey,
  focusIssue,
  saveError,
  problem,
  map,
  onState,
  onSelect,
  onPatch,
  onGenerate,
  onArrange,
  onMove,
}: {
  venues: VillageVenue[];
  people: { id: string; name: string }[];
  setting: string;
  selectedId: string | null;
  state: FoundingWorkspaceState;
  busy: boolean;
  imageBusy: boolean;
  suggestionsChanged: boolean;
  suggestionsKey: string;
  focusIssue: FoundingIssue | null;
  saveError?: string;
  problem?: string;
  map: ReactNode;
  onState(state: FoundingWorkspaceState): void;
  onSelect(venue: VillageVenue): void;
  onPatch(venue: VillageVenue): void;
  onGenerate(venueId?: string): void;
  onArrange(): void;
  onMove(venue: VillageVenue): void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const mapDetails = useRef<HTMLDetailsElement>(null);
  const selected = venues.find((venue) => venue.id === selectedId);
  const open = state.view === "details" && !!selected;
  const issues = foundingVenueIssues(venues, false, true);
  const placed = venues.filter((venue) => venue.presentation.x !== null && venue.presentation.y !== null).length;
  const ready = venues.length > 0 && !issues.length;
  const close = () => onState({ ...state, view: "map", paused: false });
  const focusArea =
    focusIssue?.zoneId === "exterior"
      ? "exterior"
      : selected?.privateSpaces?.some((zone) => zone.id === focusIssue?.zoneId) || focusIssue?.zoneId === "private"
        ? "private"
        : "common";
  useEffect(() => {
    const node = dialog.current;
    if (!open || !node) return;
    const opener = document.activeElement;
    node.showModal();
    node.querySelector<HTMLElement>("[data-close-quick]")?.focus();
    return () => {
      node.close();
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus({ preventScroll: true });
    };
  }, [open, selected?.id]);
  useEffect(() => {
    if (focusIssue?.field === "placement") {
      if (mapDetails.current) mapDetails.current.open = true;
      mapDetails.current?.scrollIntoView({ block: "nearest" });
      return;
    }
    if (!focusIssue || focusIssue.venueId !== selected?.id || !open) return;
    const node = dialog.current;
    const section = focusIssue.zoneId
      ? node?.querySelector<HTMLDetailsElement>(`[data-quick-area="${focusArea}"]`)
      : undefined;
    if (section) section.open = true;
    const labels: Partial<Record<FoundingIssue["field"], string>> = {
      name: "Venue Name",
      form: "Physical Form",
      description: "Exterior appearance",
      "zone-name": "Name",
      "zone-purpose": "Used for",
      "zone-appearance": "Appearance",
    };
    const target = (section ?? node)?.querySelector<HTMLElement>(
      `[aria-label="${labels[focusIssue.field] ?? "Name"}"]`,
    );
    target?.focus();
    target?.scrollIntoView({ block: "nearest" });
  }, [focusIssue, selected?.id, open, focusArea]);
  const patchZone = (
    personal: boolean,
    id: string,
    patch: { name?: string; purpose?: string; description?: string; roomSpecification?: string },
  ) => {
    if (!selected) return;
    const key = personal ? "privateSpaces" : "spaces";
    onPatch({ ...selected, [key]: selected[key]?.map((zone) => (zone.id === id ? { ...zone, ...patch } : zone)) });
  };
  const zoneSections = (personal: boolean) => {
    if (!selected) return null;
    const zones = selected[personal ? "privateSpaces" : "spaces"] ?? [];
    const label = personal ? "Private Space" : "Common Space";
    return (
      <details className="villages-quick-space" data-quick-area={personal ? "private" : "common"}>
        <summary>
          <strong>{label}</strong>
          <span>{zones.length ? "Included" : "Not included"}</span>
          <small>
            {zones
              .map((zone) => zone.name)
              .filter(Boolean)
              .join(" · ") || "Generate a suggestion to complete this space."}
          </small>
        </summary>
        {zones.map((zone) => {
          const hidden = personal && !selected.occupancy.playerHome;
          return (
            <fieldset key={zone.id} aria-label={`${label} details`} disabled={busy || imageBusy}>
              <label>
                Name
                <input
                  autoComplete="off"
                  aria-label="Name"
                  value={zone.name ?? ""}
                  maxLength={100}
                  onChange={(event) => patchZone(personal, zone.id, { name: event.target.value })}
                />
              </label>
              <label>
                Used for
                <textarea
                  autoComplete="off"
                  aria-label="Used for"
                  value={zone.purpose ?? ""}
                  rows={2}
                  maxLength={240}
                  onChange={(event) => patchZone(personal, zone.id, { purpose: event.target.value })}
                />
              </label>
              {hidden ? (
                <>
                  <label>
                    Room Specification · optional
                    <textarea
                      autoComplete="off"
                      aria-label="Room Specification"
                      value={zone.roomSpecification ?? ""}
                      rows={3}
                      maxLength={1000}
                      onChange={(event) => patchZone(personal, zone.id, { roomSpecification: event.target.value })}
                    />
                  </label>
                  <p>The resident’s interior is prepared after founding and stays hidden until entry.</p>
                </>
              ) : (
                <label>
                  Appearance
                  <textarea
                    autoComplete="off"
                    aria-label="Appearance"
                    value={zone.description}
                    rows={3}
                    maxLength={1000}
                    onChange={(event) => patchZone(personal, zone.id, { description: event.target.value })}
                  />
                </label>
              )}
            </fieldset>
          );
        })}
      </details>
    );
  };
  return (
    <section className="villages-quick-start" aria-label="Quick Start Venues">
      <p>Create complete Venues that fit your village and its people.</p>
      {!suggestionsKey ? (
        <section className="villages-forging-card">
          <h3>Based on your founding choices</h3>
          <p>{setting}</p>
          <p>Setting, starting circumstances, selected lore, your persona and resident backstories.</p>
          <strong>
            {venues.filter((venue) => venue.classes?.includes("residence")).length} Residences + 1 Community venue
          </strong>
          <p>
            Every Residence includes Common + Private Space.
            <br />
            The Community venue includes Common Space.
          </p>
        </section>
      ) : (
        <p role="status">
          {ready
            ? `${venues.length} complete Venues · Review before continuing.`
            : "Your suggestions and edits are kept. Complete the highlighted details before Review."}
        </p>
      )}
      {suggestionsChanged ? (
        <p className="villages-forging-notice">
          Founding choices changed. Your edits are kept; review these Venues or generate fresh suggestions.
        </p>
      ) : null}
      <button
        type="button"
        className="villages-forging-primary villages-quick-generate"
        disabled={busy || imageBusy || !venues.length}
        onClick={() => onGenerate()}
      >
        {busy
          ? "Preparing Venues…"
          : state.suggestionRequest
            ? "Check suggestions"
            : suggestionsKey
              ? "Refresh suggestions"
              : "Generate starting Venues"}
      </button>
      <p className="villages-resident-help">
        Uses your System connection. Your edits and artwork are kept; generation fills unedited fields. No artwork is
        generated.
      </p>
      <div className="villages-quick-list" role="group" aria-label="Required starting Venues">
        {venues.map((venue) => {
          const residence = venue.category !== "public-center";
          const title = venue.occupancy.playerHome
            ? "Your residence"
            : residence
              ? `${people.find((person) => person.id === venue.occupancy.residentCharacterId)?.name ?? "Villager"}’s residence`
              : "Community venue";
          const missing = issues.filter((issue) => issue.venueId === venue.id);
          return (
            <button
              type="button"
              key={venue.id}
              className="villages-quick-venue"
              aria-label={`Edit ${title}`}
              onClick={() => onSelect(venue)}
            >
              <span>
                <strong>{title}</strong>
                <small>
                  {venue.name}
                  {venue.form ? ` · ${venue.form}` : ""}
                </small>
                <small className={missing.length ? "" : "villages-forging-saved"}>
                  {missing.length
                    ? `${missing.length} details needed`
                    : `✓ ${residence ? "Common + Private Space" : "Common Space"}`}
                </small>
              </span>
              <span>Edit ›</span>
            </button>
          );
        })}
      </div>
      <details ref={mapDetails} className="villages-quick-map">
        <summary>
          Map placement · {placed} of {venues.length} placed
        </summary>
        <p>Quick Start arranges missing Venues automatically. Adjust them here.</p>
        <button type="button" disabled={busy || imageBusy} onClick={onArrange}>
          Arrange automatically
        </button>
        {map}
        <div className="villages-quick-moves">
          {venues.map((venue) => (
            <button type="button" key={venue.id} disabled={busy || imageBusy} onClick={() => onMove(venue)}>
              Move {venue.name || "Venue"}
            </button>
          ))}
        </div>
      </details>
      <dialog
        ref={dialog}
        className="villages-founding-dialog villages-quick-dialog"
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        aria-label={selected ? `Edit ${selected.name || "Residence"}` : "Edit Venue"}
      >
        {selected ? (
          <Fragment key={selected.id}>
            <div className="villages-quick-heading">
              <h3>
                {selected.occupancy.playerHome
                  ? "Your residence"
                  : selected.category === "public-center"
                    ? "Community venue"
                    : `${people.find((person) => person.id === selected.occupancy.residentCharacterId)?.name ?? "Villager"}’s residence`}
              </h3>
              <button data-close-quick type="button" aria-label="Close Venue details" onClick={close}>
                ×
              </button>
            </div>
            <p>Quick Start suggestion</p>
            {issues.some((issue) => issue.venueId === selected.id && issue.field !== "placement") ? (
              <ul className="villages-quick-issues" aria-label="Details needed">
                {issues
                  .filter((issue) => issue.venueId === selected.id && issue.field !== "placement")
                  .map((issue) => (
                    <li key={`${issue.field}:${issue.zoneId ?? ""}`}>{issue.message}</li>
                  ))}
              </ul>
            ) : null}
            <fieldset disabled={busy || imageBusy}>
              <label>
                Venue Name
                <input
                  autoComplete="off"
                  aria-label="Venue Name"
                  maxLength={100}
                  value={selected.name}
                  onChange={(event) => onPatch({ ...selected, name: event.target.value })}
                />
              </label>
              <label>
                Physical Form
                <input
                  autoComplete="off"
                  aria-label="Physical Form"
                  maxLength={240}
                  value={selected.form ?? ""}
                  onChange={(event) => onPatch({ ...selected, form: event.target.value })}
                />
              </label>
            </fieldset>
            <details className="villages-quick-space" data-quick-area="exterior">
              <summary>
                <strong>Exterior</strong>
                <small>Appearance and initial impression</small>
              </summary>
              <fieldset disabled={busy || imageBusy}>
                <label>
                  Exterior appearance
                  <textarea
                    autoComplete="off"
                    aria-label="Exterior appearance"
                    rows={3}
                    maxLength={1000}
                    value={selected.description}
                    onChange={(event) => onPatch({ ...selected, description: event.target.value })}
                  />
                </label>
              </fieldset>
            </details>
            {zoneSections(false)}
            {selected.category !== "public-center" ? zoneSections(true) : null}
            <p className="villages-resident-help">
              Suggested from your founding choices. Changes are kept in your founding draft.
            </p>
            {saveError ? <p role="alert">{saveError}</p> : null}
            {problem ? <p role="alert">{problem}</p> : null}
            <button type="button" disabled={busy || imageBusy} onClick={() => onGenerate(selected.id)}>
              {busy ? "Preparing…" : state.suggestionRequest ? "Check suggestions" : "Regenerate this Venue"}
            </button>
            <button type="button" className="villages-forging-primary" onClick={close}>
              {saveError ? "Return to Venues" : "Save changes"}
            </button>
          </Fragment>
        ) : null}
      </dialog>
    </section>
  );
}
