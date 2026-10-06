import type { VillageVenue, VillageVenueImage } from "../../../shared/contracts/village.js";
import { VenueLayoutFields } from "./villages-founding-editor";
import type { FoundingIssue, FoundingWorkspaceState } from "./villages-founding-workspace-state";
import { FoundingZoneFields } from "./villages-founding-zones";
import { type ReactNode, useEffect, useRef } from "react";

type Area = "exterior" | "interior" | "private";
export function FoundingWorkspace({
  venues,
  people,
  selectedId,
  placementId,
  state,
  map,
  existing,
  mapReady,
  issues,
  showIssues,
  focusIssue,
  imageTarget,
  imageBusy,
  suggestionsBusy,
  suggestionsChanged,
  usagePreview,
  onState,
  onSelect,
  onMove,
  onContinue,
  onArrange,
  onPatch,
  onDraft,
  onIssue,
  onGenerate,
  onUpload,
}: {
  venues: VillageVenue[];
  people: { id: string; name: string }[];
  selectedId: string | null;
  placementId: string | null;
  state: FoundingWorkspaceState;
  map: ReactNode;
  existing: boolean;
  mapReady: boolean;
  issues: FoundingIssue[];
  showIssues: boolean;
  focusIssue: FoundingIssue | null;
  imageTarget: { venueId: string; zoneId: string } | null;
  imageBusy: boolean;
  suggestionsBusy: boolean;
  suggestionsChanged: boolean;
  usagePreview: ReactNode;
  onState(state: FoundingWorkspaceState): void;
  onSelect(venue: VillageVenue): void;
  onMove(venue: VillageVenue): void;
  onContinue(): void;
  onArrange?: () => void;
  onPatch(venue: VillageVenue): void;
  onDraft(): void;
  onIssue(issue: FoundingIssue): void;
  onGenerate(venue: VillageVenue, area: Area, zoneId?: string): void;
  onUpload(venue: VillageVenue, area: Area, file: File, zoneId?: string): void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const selected = venues.find((venue) => venue.id === selectedId);
  const placement = venues.find((venue) => venue.id === placementId);
  const placed = venues.filter((venue) => venue.presentation.x !== null && venue.presentation.y !== null).length;
  const attention = new Set(issues.filter((issue) => issue.field !== "placement").map((issue) => issue.venueId)).size;
  const section = selected ? (state.sections[selected.id] ?? "venue") : "venue";
  const zones = selected ? [...(selected.spaces ?? []), ...(selected.privateSpaces ?? [])] : [];
  const selectedZone = selected ? (state.zones[selected.id] ?? "exterior") : "exterior";
  const zoneId =
    selectedZone === "exterior" || zones.some((zone) => zone.id === selectedZone) ? selectedZone : "exterior";
  const locked = !!selected && imageTarget?.venueId === selected.id;
  useEffect(() => {
    if (!focusIssue || focusIssue.venueId !== selectedId) return;
    const labels: Record<FoundingIssue["field"], string> = {
      placement: "",
      name: "Venue name",
      form: "Physical form",
      description: "Exterior description",
      layout: "Zone layout",
      assignment: "Assigned villager",
      "zone-name": "Zone name",
      "zone-purpose": "Zone used for",
      "zone-appearance": "Zone appearance",
      controller: "Zone controllers",
    };
    const label = labels[focusIssue.field];
    const field = root.current?.querySelector<HTMLElement>(`[aria-label="${label}"]`);
    let ancestor = field?.parentElement;
    while (ancestor && ancestor !== root.current) {
      if (ancestor instanceof HTMLDetailsElement) ancestor.open = true;
      ancestor = ancestor.parentElement;
    }
    field?.focus();
    field?.scrollIntoView({ block: "nearest" });
  }, [focusIssue, selectedId, section, zoneId]);
  const changeSection = (next: "venue" | "zones") =>
    selected && onState({ ...state, sections: { ...state.sections, [selected.id]: next } });
  const changeZone = (id: string) => selected && onState({ ...state, zones: { ...state.zones, [selected.id]: id } });
  const imageFields = (area: Area, image: VillageVenueImage | null | undefined, id?: string) =>
    selected && (
      <details className="villages-workspace-artwork">
        <summary>Artwork · optional{image ? " · image added" : ""}</summary>
        {image ? <img src={image.url} alt={`${area} of ${selected.name}`} /> : <p>No image added.</p>}
        <button type="button" disabled={imageBusy} onClick={() => onGenerate(selected, area, id)}>
          {image ? "Generate again" : "Generate image"}
        </button>
        {usagePreview}
        <label>
          Upload image
          <input
            aria-label={`Upload ${area} image`}
            type="file"
            accept="image/*"
            disabled={imageBusy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) onUpload(selected, area, file, id);
            }}
          />
        </label>
        {image ? (
          <button
            type="button"
            disabled={imageBusy}
            onClick={() =>
              onPatch(
                area === "exterior"
                  ? { ...selected, presentation: { ...selected.presentation, image: null } }
                  : area === "private"
                    ? {
                        ...selected,
                        privateSpaces: selected.privateSpaces?.map((zone) =>
                          zone.id === id ? { ...zone, image: null } : zone,
                        ),
                      }
                    : {
                        ...selected,
                        spaces: selected.spaces?.map((zone) => (zone.id === id ? { ...zone, image: null } : zone)),
                      },
              )
            }
          >
            Remove image
          </button>
        ) : null}
        <details>
          <summary>Artwork context</summary>
          <p>
            Venue Type and Physical form, the selected Zone’s use and appearance, and the shared scenery style inform
            this artwork. Access rules do not change it.
          </p>
          {(
            [
              ["useAssignedVillagerContext", "Use assigned resident’s personality"],
              ["useVisualLore", "Use selected Village lorebooks"],
            ] as const
          ).map(([key, label]) => (
            <label key={key}>
              <input
                type="checkbox"
                disabled={locked}
                checked={selected.imageContext?.[key] ?? true}
                onChange={(event) =>
                  onPatch({
                    ...selected,
                    imageContext: {
                      useAssignedVillagerContext: selected.imageContext?.useAssignedVillagerContext ?? true,
                      useVisualLore: selected.imageContext?.useVisualLore ?? true,
                      [key]: event.target.checked,
                    },
                  })
                }
              />
              {label}
            </label>
          ))}
        </details>
      </details>
    );
  return (
    <div ref={root} className="villages-workspace" data-view={state.view}>
      <div className="villages-workspace-toolbar">
        <strong role="status">
          <span>
            {placed} / {venues.length} placed
          </span>
          {placement ? (
            <small title={`Click the map to place ${placement.name || "this Venue"}`}>
              {placement.presentation.x === null ? "Next" : "Move"}: {placement.name || "this Venue"}
            </small>
          ) : null}
        </strong>
        <span>{attention ? `${attention} need details` : "Details ready"}</span>
        {!existing ? (
          <button type="button" className="villages-workspace-draft" disabled={suggestionsBusy} onClick={onDraft}>
            {suggestionsBusy ? "Drafting…" : "Draft starting Venues"}
          </button>
        ) : null}
        {onArrange ? (
          <button
            type="button"
            aria-label="Arrange automatically"
            title="Arrange automatically"
            className="villages-workspace-arrange"
            onClick={onArrange}
          >
            Arrange
          </button>
        ) : null}
        {!existing && placed < venues.length && !placementId ? (
          <button type="button" disabled={!mapReady} onClick={onContinue}>
            Continue placing
          </button>
        ) : null}
        <div className="villages-workspace-switch" role="group" aria-label="Workspace view">
          <button type="button" aria-pressed={state.view === "map"} onClick={() => onState({ ...state, view: "map" })}>
            Map
          </button>
          <button
            type="button"
            aria-pressed={state.view === "details"}
            onClick={() => onState({ ...state, view: "details" })}
          >
            Details
          </button>
        </div>
      </div>
      {suggestionsChanged ? (
        <p className="villages-workspace-notice">
          People or setting changed. Your edits are kept; review these drafts or request fresh suggestions.
        </p>
      ) : null}
      <div className="villages-workspace-grid">
        <section className="villages-workspace-map" aria-label="Place Venues">
          {map}
        </section>
        <aside className="villages-workspace-inspector" aria-label="Venue inspector">
          <div className="villages-workspace-back">
            <button type="button" onClick={() => onState({ ...state, view: "map" })}>
              Back to map
            </button>
          </div>
          <div className="villages-workspace-list" role="group" aria-label="Starting Venues">
            {venues.map((venue, index) => {
              const missing = issues.filter(
                (issue) => issue.venueId === venue.id && issue.field !== "placement",
              ).length;
              const isPlaced = venue.presentation.x !== null && venue.presentation.y !== null;
              return (
                <button
                  key={venue.id}
                  type="button"
                  aria-pressed={selectedId === venue.id}
                  data-next={placementId === venue.id}
                  onClick={() => onSelect(venue)}
                >
                  <strong>
                    {index + 1}. {venue.name || "Unnamed Venue"}
                  </strong>
                  <small>
                    {isPlaced ? "Placed" : "Not placed"} · {missing ? `${missing} details missing` : "Details ready"}
                    {imageTarget?.venueId === venue.id
                      ? ` · Preparing ${imageTarget.zoneId === "exterior" ? "Entrance" : [...(venue.spaces ?? []), ...(venue.privateSpaces ?? [])].find((zone) => zone.id === imageTarget.zoneId)?.name || "Zone"} image…`
                      : ""}
                  </small>
                </button>
              );
            })}
          </div>
          {showIssues && issues.length ? (
            <section className="villages-workspace-checklist" aria-label="Details needed before Review">
              <h3>Before Review</h3>
              {issues.map((issue) => (
                <button
                  key={`${issue.venueId}:${issue.zoneId ?? ""}:${issue.field}`}
                  type="button"
                  onClick={() => onIssue(issue)}
                >
                  {venues.find((venue) => venue.id === issue.venueId)?.name || "Venue"}: {issue.message}
                </button>
              ))}
            </section>
          ) : null}
          {selected ? (
            <section className="villages-workspace-details" aria-label={`Edit ${selected.name}`}>
              <div className="villages-workspace-detail-heading">
                <h3>{selected.name || "Venue"}</h3>
                {!existing ? (
                  <button type="button" disabled={!mapReady} onClick={() => onMove(selected)}>
                    Move
                  </button>
                ) : null}
              </div>
              <div role="group" aria-label="Venue detail section" className="villages-workspace-tabs">
                <button type="button" aria-pressed={section === "venue"} onClick={() => changeSection("venue")}>
                  Venue
                </button>
                <button type="button" aria-pressed={section === "zones"} onClick={() => changeSection("zones")}>
                  Zones
                </button>
              </div>
              {locked ? (
                <p role="status">
                  Preparing image. These physical details are temporarily locked; other Venues and placement remain
                  available.
                </p>
              ) : null}
              {section === "venue" ? (
                <fieldset disabled={locked}>
                  <label>
                    Venue name
                    <input
                      aria-label="Venue name"
                      maxLength={100}
                      value={selected.name}
                      onChange={(event) => onPatch({ ...selected, name: event.target.value })}
                    />
                  </label>
                  <label>
                    Venue Type
                    <input
                      aria-label="Venue Type"
                      maxLength={100}
                      value={selected.venueType ?? ""}
                      placeholder="Home, bakery, church…"
                      onChange={(event) => onPatch({ ...selected, venueType: event.target.value })}
                    />
                  </label>
                  <label>
                    Physical form
                    <input
                      aria-label="Physical form"
                      maxLength={240}
                      value={selected.form ?? ""}
                      placeholder="A room, cottage, tent, shared hall…"
                      onChange={(event) => onPatch({ ...selected, form: event.target.value })}
                    />
                  </label>
                  {selected.classes?.includes("residence") && !selected.occupancy.playerHome ? (
                    <label>
                      Assigned villager
                      <select
                        aria-label="Assigned villager"
                        value={selected.occupancy.residentCharacterId ?? ""}
                        onChange={(event) =>
                          onPatch({
                            ...selected,
                            residentIds: [event.target.value],
                            occupancy: { ...selected.occupancy, residentCharacterId: event.target.value },
                            privateSpaces: selected.privateSpaces?.map((zone) => ({
                              ...zone,
                              ownerId: event.target.value,
                            })),
                          })
                        }
                      >
                        <option value="">Choose a villager</option>
                        {people.map((person) => (
                          <option
                            key={person.id}
                            value={person.id}
                            disabled={venues.some(
                              (row) => row.id !== selected.id && row.occupancy.residentCharacterId === person.id,
                            )}
                          >
                            {person.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : (
                    <p>{selected.occupancy.playerHome ? "Assigned to you" : "Community Gathering Place"}</p>
                  )}
                </fieldset>
              ) : (
                <>
                  <label>
                    Selected Zone
                    <select
                      aria-label="Selected Zone"
                      value={zoneId}
                      onChange={(event) => changeZone(event.target.value)}
                    >
                      <option value="exterior">Entrance</option>
                      {zones.map((zone) => (
                        <option key={zone.id} value={zone.id}>
                          {zone.name || "Unnamed Zone"}
                        </option>
                      ))}
                    </select>
                  </label>
                  {zoneId === "exterior" ? (
                    <section>
                      <h4>Entrance · Unrestricted, 24/7</h4>
                      <label>
                        Entrance appearance
                        <textarea
                          aria-label="Exterior description"
                          maxLength={1000}
                          rows={3}
                          disabled={locked}
                          value={selected.description}
                          onChange={(event) => onPatch({ ...selected, description: event.target.value })}
                        />
                      </label>
                      {imageFields("exterior", selected.presentation.image)}
                    </section>
                  ) : (
                    <FoundingZoneFields
                      venue={selected}
                      people={people}
                      busy={locked}
                      onPatch={onPatch}
                      imageFields={imageFields}
                      selectedZoneId={zoneId}
                    />
                  )}
                  {!existing ? (
                    <details>
                      <summary>Add or change Zones</summary>
                      <fieldset aria-label="Zone layout" tabIndex={-1} disabled={locked}>
                        <VenueLayoutFields venue={selected} onChange={onPatch} />
                      </fieldset>
                    </details>
                  ) : null}
                </>
              )}
            </section>
          ) : (
            <p>Place your Venues, then select one to refine its details. Photograph artwork is optional.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
