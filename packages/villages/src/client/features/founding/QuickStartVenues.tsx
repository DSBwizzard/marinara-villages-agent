import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import type { VillageVenue } from "../../../shared/contracts/village.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import { addFoundingZone } from "./founding-template.js";
import { draftZonePolicy } from "./villages-founding-zones.js";
import {
  foundingVenueIssues,
  type FoundingIssue,
  type FoundingWorkspaceState,
} from "./villages-founding-workspace-state.js";

export function QuickStartVenues({
  venues,
  people,
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
  onGenerateImage,
  onUploadImage,
  onArrange,
  onMove,
}: {
  venues: VillageVenue[];
  people: { id: string; name: string }[];
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
  onGenerateImage(venue: VillageVenue, area: "exterior" | "interior" | "private", zoneId?: string): void;
  onUploadImage(venue: VillageVenue, area: "exterior" | "interior" | "private", file: File, zoneId?: string): void;
  onArrange(): void;
  onMove(venue: VillageVenue): void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const mapDetails = useRef<HTMLElement>(null);
  const [zoneId, setZoneId] = useState("exterior");
  const [newZoneType, setNewZoneType] = useState<"common" | "private">("common");
  const selected = venues.find((venue) => venue.id === selectedId);
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const open = state.view === "details" && !!selected;
  const issues = foundingVenueIssues(venues, false, true);
  const placed = venues.filter((venue) => venue.presentation.x !== null && venue.presentation.y !== null).length;
  const ready = venues.length > 0 && !issues.length;
  const close = () => onState({ ...state, view: "map", paused: false });
  const personal = !!selected?.privateSpaces?.some((zone) => zone.id === zoneId);
  const zone = [...(selected?.spaces ?? []), ...(selected?.privateSpaces ?? [])].find((row) => row.id === zoneId);
  const hiddenPrivate = !!zone && personal && zone.ownerId !== "player";
  const area = zoneId === "exterior" ? "exterior" : personal ? "private" : "interior";
  const image = zoneId === "exterior" ? selected?.presentation.image : zone?.image;
  useEffect(() => {
    const node = dialog.current;
    if (!open || !node) return;
    const opener = document.activeElement;
    const pickerCancel = (event: Event) => {
      if (event.target instanceof HTMLInputElement && event.target.type === "file") {
        const input = event.target;
        event.stopPropagation();
        requestAnimationFrame(() => {
          if (node.open && input.isConnected) input.focus({ preventScroll: true });
        });
      }
    };
    node.addEventListener("cancel", pickerCancel, true);
    node.showModal();
    node.querySelector<HTMLElement>("[data-close-quick]")?.focus();
    return () => {
      node.removeEventListener("cancel", pickerCancel, true);
      node.close();
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus({ preventScroll: true });
    };
  }, [open, selected?.id]);
  useEffect(() => {
    const selected = selectedRef.current;
    if (!selected || !open) return;
    setNewZoneType("common");
    const target = focusIssue?.venueId === selected.id ? focusIssue.zoneId : undefined;
    setZoneId(
      target === "common"
        ? (selected.spaces?.[0]?.id ?? "exterior")
        : target === "private"
          ? (selected.privateSpaces?.[0]?.id ?? "exterior")
          : (target ?? "exterior"),
    );
  }, [open, selectedId, focusIssue]);
  useEffect(() => {
    if (focusIssue?.field === "placement") {
      mapDetails.current?.scrollIntoView({ block: "nearest" });
      return;
    }
    if (!focusIssue || focusIssue.venueId !== selected?.id || !open) return;
    const node = dialog.current;
    const labels: Partial<Record<FoundingIssue["field"], string>> = {
      name: "Venue Name",
      form: "Physical Form",
      description: "Exterior appearance",
      "zone-name": "Zone name",
      "zone-purpose": "Used for",
      "zone-appearance": "Appearance",
    };
    const target = node?.querySelector<HTMLElement>(`[aria-label="${labels[focusIssue.field] ?? "Name"}"]`);
    target?.focus();
    target?.scrollIntoView({ block: "nearest" });
  }, [focusIssue, selected?.id, open, zoneId]);
  const patchZone = (personal: boolean, id: string, patch: Partial<NonNullable<VillageVenue["spaces"]>[number]>) => {
    if (!selected) return;
    const key = personal ? "privateSpaces" : "spaces";
    onPatch({ ...selected, [key]: selected[key]?.map((zone) => (zone.id === id ? { ...zone, ...patch } : zone)) });
  };
  const addZone = () => {
    if (!selected) return;
    const personal = newZoneType === "private";
    if (personal && selected.category === "public-center") return;
    const id = `zone:${createVillagesClientId()}`;
    const next = addFoundingZone(selected, personal, id);
    if (next === selected) return;
    onPatch(next);
    setZoneId(id);
  };
  const referencesZone =
    !!selected &&
    !!zone &&
    ([...(selected.spaces ?? []), ...(selected.privateSpaces ?? [])].some(
      (row) => row.id !== zone.id && row.connectedTo?.includes(zone.id),
    ) ||
      Object.values(selected.destinations ?? {}).some((row) => Object.values(row).includes(zone.id)));
  const canRemove =
    !!selected &&
    !!zone &&
    (personal ? (selected.privateSpaces?.length ?? 0) > 1 : (selected.spaces?.length ?? 0) > 1) &&
    !referencesZone;
  const removeZone = () => {
    if (!selected || !zone || !canRemove) return;
    const spaces = (selected.spaces ?? []).filter((row) => row.id !== zone.id);
    const privateSpaces = (selected.privateSpaces ?? []).filter((row) => row.id !== zone.id);
    onPatch({
      ...selected,
      spaces,
      privateSpaces,
      layout: spaces.length ? (privateSpaces.length ? "both" : "common") : "private",
    });
    setZoneId("exterior");
  };
  return (
    <section className="villages-quick-start" aria-label="Quick Start Venues">
      <p role="status">{ready ? `${venues.length} Venues ready` : "Complete the remaining details."}</p>
      {suggestionsChanged ? (
        <p className="villages-forging-notice">
          Founding choices changed. Your edits are kept; review these Venues or generate fresh suggestions.
        </p>
      ) : null}
      <div className="villages-quick-overview">
        <section className="villages-forging-card">
          <button
            type="button"
            className="villages-quick-generate"
            disabled={busy || imageBusy || !venues.length}
            onClick={() => onGenerate()}
          >
            {busy
              ? "Preparing Venues…"
              : state.suggestionRequest
                ? "Check suggestions"
                : suggestionsKey
                  ? "Refresh suggestions"
                  : "Suggest details"}
          </button>
          <p className="villages-resident-help">
            Uses your System connection. Your edits and artwork are kept; generation fills unedited fields. No artwork
            is generated.
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
        </section>
        <section ref={mapDetails} className="villages-quick-map villages-forging-card">
          <h3>
            Map placement · {placed} of {venues.length} placed
          </h3>
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
        </section>
      </div>
      <dialog
        ref={dialog}
        className="villages-founding-dialog villages-quick-dialog"
        onCancel={(event) => {
          event.preventDefault();
          if (event.target === event.currentTarget) close();
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
            <div className="villages-quick-zone-picker">
              <label>
                Selected Zone
                <select aria-label="Selected Zone" value={zoneId} onChange={(event) => setZoneId(event.target.value)}>
                  <option value="exterior">Exterior</option>
                  {[...(selected.spaces ?? []), ...(selected.privateSpaces ?? [])].map((row) => (
                    <option key={row.id} value={row.id}>
                      {row.name || "Unnamed Zone"}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                New Zone type
                <select
                  aria-label="New Zone type"
                  value={newZoneType}
                  onChange={(event) => setNewZoneType(event.target.value as "common" | "private")}
                >
                  <option value="common">Common</option>
                  {selected.category !== "public-center" ? <option value="private">Private</option> : null}
                </select>
              </label>
              <button
                type="button"
                disabled={
                  busy || imageBusy || (selected.spaces?.length ?? 0) + (selected.privateSpaces?.length ?? 0) >= 6
                }
                onClick={addZone}
              >
                Add Zone
              </button>
              <button type="button" disabled={busy || imageBusy || !canRemove} onClick={removeZone}>
                Remove Zone
              </button>
            </div>
            {referencesZone ? (
              <p>Update Zone connections and destinations in Advanced before removing this Zone.</p>
            ) : null}
            <div className="villages-quick-zone-body">
              <fieldset disabled={busy || imageBusy}>
                <label>
                  Zone name
                  <input
                    aria-label="Zone name"
                    value={zoneId === "exterior" ? "Exterior" : (zone?.name ?? "")}
                    disabled={zoneId === "exterior" || !zone}
                    maxLength={100}
                    onChange={(event) => zone && patchZone(personal, zone.id, { name: event.target.value })}
                  />
                </label>
                <label>
                  Access
                  <select
                    aria-label="Zone access"
                    disabled={zoneId === "exterior" || !zone}
                    value={zone ? (zone.access ?? draftZonePolicy(selected, zone, personal)).mode : "public"}
                    onChange={(event) => {
                      if (!zone) return;
                      const access = zone.access ?? draftZonePolicy(selected, zone, personal);
                      patchZone(personal, zone.id, {
                        access: { ...access, mode: event.target.value as typeof access.mode },
                      });
                    }}
                  >
                    <option value="public">Public</option>
                    <option value="permission-required" disabled={selected.category === "public-center"}>
                      Permission required
                    </option>
                  </select>
                </label>
                <label>
                  Used for
                  <input
                    aria-label="Used for"
                    value={zoneId === "exterior" ? "Arrival and departure" : (zone?.purpose ?? "")}
                    disabled={zoneId === "exterior" || !zone}
                    maxLength={240}
                    onChange={(event) => zone && patchZone(personal, zone.id, { purpose: event.target.value })}
                  />
                </label>
                {hiddenPrivate ? (
                  <label>
                    Room specification · optional
                    <textarea
                      aria-label="Room Specification"
                      value={zone?.roomSpecification ?? ""}
                      maxLength={1000}
                      rows={3}
                      onChange={(event) => zone && patchZone(true, zone.id, { roomSpecification: event.target.value })}
                    />
                  </label>
                ) : (
                  <label>
                    Appearance
                    <textarea
                      aria-label={zoneId === "exterior" ? "Exterior appearance" : "Appearance"}
                      value={zoneId === "exterior" ? selected.description : (zone?.description ?? "")}
                      maxLength={1000}
                      rows={3}
                      onChange={(event) =>
                        zoneId === "exterior"
                          ? onPatch({ ...selected, description: event.target.value })
                          : zone && patchZone(personal, zone.id, { description: event.target.value })
                      }
                    />
                  </label>
                )}
              </fieldset>
              {hiddenPrivate ? (
                <p>The resident’s private interior stays hidden until authorized entry.</p>
              ) : (
                <section className="villages-quick-art" aria-label="Zone artwork">
                  {image ? (
                    <img
                      src={image.url}
                      alt={`Artwork for ${zoneId === "exterior" ? "Exterior" : zone?.name || "Zone"}`}
                    />
                  ) : (
                    <div>No image yet</div>
                  )}
                  <div className="villages-quick-art-actions">
                    <label>
                      Upload image
                      <input
                        type="file"
                        accept="image/*"
                        aria-label="Upload Zone image"
                        disabled={busy || imageBusy}
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          event.target.value = "";
                          if (file) onUploadImage(selected, area, file, zone?.id);
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      disabled={busy || imageBusy}
                      onClick={() => onGenerateImage(selected, area, zone?.id)}
                    >
                      {image ? "Generate again" : "Generate image"}
                    </button>
                    {image ? (
                      <button
                        type="button"
                        disabled={busy || imageBusy}
                        onClick={() =>
                          zoneId === "exterior"
                            ? onPatch({ ...selected, presentation: { ...selected.presentation, image: null } })
                            : zone && patchZone(personal, zone.id, { image: null })
                        }
                      >
                        Remove image
                      </button>
                    ) : null}
                  </div>
                </section>
              )}
            </div>
            {saveError ? <p role="alert">{saveError}</p> : null}
            {problem ? <p role="alert">{problem}</p> : null}
            <button type="button" disabled={busy || imageBusy} onClick={() => onGenerate(selected.id)}>
              {busy ? "Preparing…" : state.suggestionRequest ? "Check suggestions" : "Regenerate this Venue"}
            </button>
            <button type="button" className="villages-forging-primary" onClick={close}>
              {saveError ? "Return to Venues" : "Done"}
            </button>
          </Fragment>
        ) : null}
      </dialog>
    </section>
  );
}
