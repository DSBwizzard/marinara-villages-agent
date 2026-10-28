import { Fragment, useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { VillageVenue } from "../../../shared/contracts/village.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import { addFoundingZone } from "./founding-template.js";
import { QuickStartZoneArtwork } from "./QuickStartZoneArtwork.js";
import { draftZonePolicy, FoundingConnections, removeFoundingZone } from "./villages-founding-zones.js";
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
  const tabId = useId();
  const [tab, setTab] = useState<"venue" | "zone">("venue");
  const [artworkOpen, setArtworkOpen] = useState(false);
  const [zoneId, setZoneId] = useState("exterior");
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
  const zoneIds = [
    "exterior",
    ...(selected?.spaces ?? []).map((row) => row.id),
    ...(selected?.privateSpaces ?? []).map((row) => row.id),
  ];
  const zoneIndex = Math.max(0, zoneIds.indexOf(zoneId));
  const changeZone = (offset: number) => setZoneId(zoneIds[(zoneIndex + offset + zoneIds.length) % zoneIds.length]);
  const tabIssues = issues.filter((issue) => {
    if (issue.venueId !== selected?.id || issue.field === "placement") return false;
    if (tab === "venue") return ["name", "form", "assignment", "layout"].includes(issue.field);
    return issue.zoneId === zoneId || issue.zoneId === (personal ? "private" : "common");
  });
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
    setTab(
      focusIssue?.venueId !== selected.id || ["name", "form", "layout", "assignment"].includes(focusIssue.field)
        ? "venue"
        : "zone",
    );
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
  }, [focusIssue, selected?.id, open, zoneId, tab]);
  useEffect(() => {
    dialog.current?.querySelector<HTMLElement>(".villages-quick-panel")?.scrollTo({ top: 0 });
    setArtworkOpen(false);
  }, [tab, zoneId, open, selectedId]);
  const patchZone = (personal: boolean, id: string, patch: Partial<NonNullable<VillageVenue["spaces"]>[number]>) => {
    if (!selected) return;
    const key = personal ? "privateSpaces" : "spaces";
    onPatch({ ...selected, [key]: selected[key]?.map((zone) => (zone.id === id ? { ...zone, ...patch } : zone)) });
  };
  const addZone = (personal: boolean) => {
    if (!selected) return;
    if (personal && selected.category === "public-center") return;
    const id = `zone:${createVillagesClientId()}`;
    const next = addFoundingZone(selected, personal, id);
    if (next === selected) return;
    onPatch(next);
    setZoneId(id);
    setTab("zone");
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
    onPatch(removeFoundingZone(selected, zone.id));
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
            <div role="tablist" aria-label="Venue editor" className="villages-quick-tabs">
              {(["venue", "zone"] as const).map((item, index, tabs) => (
                <button
                  type="button"
                  role="tab"
                  key={item}
                  id={tabId + item}
                  aria-controls={tabId + "panel"}
                  aria-selected={tab === item}
                  tabIndex={tab === item ? 0 : -1}
                  onClick={() => setTab(item)}
                  onKeyDown={(event) => {
                    const next =
                      event.key === "ArrowRight"
                        ? tabs[(index + 1) % tabs.length]
                        : event.key === "ArrowLeft"
                          ? tabs[(index + tabs.length - 1) % tabs.length]
                          : event.key === "Home"
                            ? tabs[0]
                            : event.key === "End"
                              ? tabs.at(-1)
                              : undefined;
                    if (!next) return;
                    event.preventDefault();
                    setTab(next);
                    dialog.current?.querySelector<HTMLElement>("#" + CSS.escape(tabId + next))?.focus();
                  }}
                >
                  {item === "venue" ? "Venue" : "Zone"}
                </button>
              ))}
            </div>
            <section
              className="villages-quick-panel"
              role="tabpanel"
              id={tabId + "panel"}
              aria-labelledby={tabId + tab}
            >
              {tabIssues.length ? (
                <ul className="villages-quick-issues" aria-label="Details needed">
                  {tabIssues.map((issue) => (
                    <li key={`${issue.field}:${issue.zoneId ?? ""}`}>{issue.message}</li>
                  ))}
                </ul>
              ) : null}
              {tab === "venue" ? (
                <>
                  <fieldset className="villages-quick-venue-fields" disabled={busy || imageBusy}>
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
                  <FoundingConnections
                    venue={selected}
                    onPatch={onPatch}
                    selectedZoneId={zoneId}
                    onSelect={setZoneId}
                    busy={busy || imageBusy}
                  />
                  <div className="villages-quick-layout-selection">
                    <strong>{zoneId === "exterior" ? "Entrance" : zone?.name || "Unnamed Zone"}</strong>
                    <button type="button" onClick={() => setTab("zone")}>
                      Edit Zone
                    </button>
                    {zone ? (
                      <button type="button" disabled={busy || imageBusy || !canRemove} onClick={removeZone}>
                        Remove Zone
                      </button>
                    ) : null}
                  </div>
                  {referencesZone ? <p>Update Zone connections and destinations before removing this Zone.</p> : null}
                  <div className="villages-zone-map-actions">
                    <span>{(selected.spaces?.length ?? 0) + (selected.privateSpaces?.length ?? 0)} / 6 Zones</span>
                    <button
                      type="button"
                      disabled={
                        busy || imageBusy || (selected.spaces?.length ?? 0) + (selected.privateSpaces?.length ?? 0) >= 6
                      }
                      onClick={() => addZone(false)}
                    >
                      Add Zone
                    </button>
                    {selected.category !== "public-center" ? (
                      <button
                        type="button"
                        disabled={
                          busy ||
                          imageBusy ||
                          (selected.spaces?.length ?? 0) + (selected.privateSpaces?.length ?? 0) >= 6
                        }
                        onClick={() => addZone(true)}
                      >
                        Add private Zone
                      </button>
                    ) : null}
                  </div>
                  <button type="button" disabled={busy || imageBusy} onClick={() => onGenerate(selected.id)}>
                    {busy ? "Preparing…" : state.suggestionRequest ? "Check suggestions" : "Regenerate this Venue"}
                  </button>
                </>
              ) : (
                <>
                  <div className="villages-quick-zone-tools">
                    <small>
                      Zone {zoneIndex + 1} of {zoneIds.length}
                    </small>
                    {!hiddenPrivate ? (
                      <button type="button" onClick={() => setArtworkOpen(true)}>
                        {image ? <img src={image.url} alt="" /> : null}Artwork
                      </button>
                    ) : null}
                  </div>
                  <div
                    className="villages-quick-zone-navigation"
                    role="group"
                    aria-label="Zone navigation"
                    data-zone-id={zoneId}
                  >
                    <button type="button" aria-label="Previous Zone" onClick={() => changeZone(-1)}>
                      ‹
                    </button>
                    {zone ? (
                      <input
                        autoComplete="off"
                        aria-label="Zone name"
                        value={zone.name ?? ""}
                        disabled={busy || imageBusy}
                        maxLength={100}
                        onChange={(event) => patchZone(personal, zone.id, { name: event.target.value })}
                      />
                    ) : (
                      <strong>Entrance</strong>
                    )}
                    <button type="button" aria-label="Next Zone" onClick={() => changeZone(1)}>
                      ›
                    </button>
                  </div>
                  <fieldset className="villages-quick-zone-fields" disabled={busy || imageBusy}>
                    {zone ? (
                      <>
                        <div className="villages-quick-access" role="group" aria-label="Zone access">
                          <span>Access</span>
                          {(["public", "permission-required"] as const).map((mode) => (
                            <button
                              type="button"
                              key={mode}
                              aria-label={mode === "public" ? "Public access" : "Permission required"}
                              aria-pressed={(zone.access ?? draftZonePolicy(selected, zone, personal)).mode === mode}
                              disabled={mode === "permission-required" && selected.category === "public-center"}
                              onClick={() =>
                                patchZone(personal, zone.id, {
                                  access: { ...(zone.access ?? draftZonePolicy(selected, zone, personal)), mode },
                                })
                              }
                            >
                              {mode === "public" ? "Public" : "Restricted"}
                            </button>
                          ))}
                        </div>
                        <label>
                          Used for
                          <input
                            autoComplete="off"
                            aria-label="Used for"
                            value={zone.purpose ?? ""}
                            maxLength={240}
                            onChange={(event) => patchZone(personal, zone.id, { purpose: event.target.value })}
                          />
                        </label>
                      </>
                    ) : null}
                    {hiddenPrivate ? (
                      <label>
                        Room specification · optional
                        <textarea
                          autoComplete="off"
                          aria-label="Room Specification"
                          value={zone?.roomSpecification ?? ""}
                          maxLength={1000}
                          rows={3}
                          onChange={(event) =>
                            zone && patchZone(true, zone.id, { roomSpecification: event.target.value })
                          }
                        />
                      </label>
                    ) : (
                      <label>
                        Appearance
                        <textarea
                          autoComplete="off"
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
                  {hiddenPrivate ? <p>The resident’s private interior stays hidden until authorized entry.</p> : null}
                </>
              )}
            </section>
            <footer className="villages-quick-footer">
              {saveError ? <p role="alert">{saveError}</p> : null}
              {problem ? <p role="alert">{problem}</p> : null}
              <button type="button" className="villages-forging-primary" onClick={close}>
                {saveError ? "Return to Venues" : "Done"}
              </button>
            </footer>
            {artworkOpen && !hiddenPrivate ? (
              <QuickStartZoneArtwork
                image={image}
                name={zoneId === "exterior" ? "Entrance" : zone?.name || "Zone"}
                busy={busy || imageBusy}
                onClose={() => setArtworkOpen(false)}
                onUpload={(file) => onUploadImage(selected, area, file, zone?.id)}
                onGenerate={() => onGenerateImage(selected, area, zone?.id)}
                onRemove={() =>
                  zoneId === "exterior"
                    ? onPatch({ ...selected, presentation: { ...selected.presentation, image: null } })
                    : zone && patchZone(personal, zone.id, { image: null })
                }
              />
            ) : null}
          </Fragment>
        ) : null}
      </dialog>
    </section>
  );
}
