import { Fragment, useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { VillageVenue } from "../../../shared/contracts/village.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import { addFoundingZone } from "./founding-template.js";
import { QuickStartZoneArtwork } from "./QuickStartZoneArtwork.js";
import { draftZonePolicy, FoundingConnections, foundingLayoutProblem } from "./villages-founding-zones.js";
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
  focusIssue,
  saveError,
  problem,
  map,
  onState,
  onSelect,
  onPatch,
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
  focusIssue: FoundingIssue | null;
  saveError?: string;
  problem?: string;
  map: ReactNode;
  onState(state: FoundingWorkspaceState): void;
  onSelect(venue: VillageVenue): void;
  onPatch(venue: VillageVenue): void;
  onGenerateImage(venue: VillageVenue, area: "exterior" | "interior" | "private", zoneId?: string): void;
  onUploadImage(venue: VillageVenue, area: "exterior" | "interior" | "private", file: File, zoneId?: string): void;
  onArrange(): void;
  onMove(venue: VillageVenue | null): void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const mapDetails = useRef<HTMLElement>(null);
  const tabId = useId();
  const [tab, setTab] = useState<"venue" | "zone">("venue");
  const [artworkOpen, setArtworkOpen] = useState(false);
  const [layoutError, setLayoutError] = useState("");
  const [saveAttempted, setSaveAttempted] = useState(false);
  const [zoneId, setZoneId] = useState("exterior");
  const selected = venues.find((venue) => venue.id === selectedId);
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const open = state.view === "details" && !!selected;
  const issues = foundingVenueIssues(venues, false);
  const moving =
    selected ??
    (!state.paused
      ? venues.find((venue) => venue.presentation.x === null || venue.presentation.y === null)
      : undefined);
  const close = () => onState({ ...state, view: "map", paused: false });
  const finish = () => {
    if (!selected) return;
    setSaveAttempted(true);
    const problem = foundingLayoutProblem(selected);
    setLayoutError(problem);
    if (problem) setTab("venue");
    else {
      const issue = issues.find(
        (issue) =>
          issue.venueId === selected.id &&
          ["name", "form", "description", "zone-name", "zone-purpose", "zone-appearance"].includes(issue.field),
      );
      if (issue) {
        setTab(issue.zoneId ? "zone" : "venue");
        if (issue.zoneId) setZoneId(issue.zoneId);
      } else close();
    }
  };
  useEffect(() => setLayoutError(""), [selected, open]);
  useEffect(() => setSaveAttempted(false), [open, selectedId]);
  const personal = !!selected?.privateSpaces?.some((zone) => zone.id === zoneId);
  const zone = [...(selected?.spaces ?? []), ...(selected?.privateSpaces ?? [])].find((row) => row.id === zoneId);
  const hiddenPrivate = !!zone && personal && zone.venueClass === "residence" && zone.ownerId !== "player";
  const area = zoneId === "exterior" ? "exterior" : personal ? "private" : "interior";
  const image = zoneId === "exterior" ? selected?.presentation.image : zone?.image;
  const zoneIds = [
    "exterior",
    ...(selected?.spaces ?? []).map((row) => row.id),
    ...(selected?.privateSpaces ?? []).map((row) => row.id),
  ];
  const zoneIndex = Math.max(0, zoneIds.indexOf(zoneId));
  const changeZone = (offset: number) => setZoneId(zoneIds[(zoneIndex + offset + zoneIds.length) % zoneIds.length]);
  const fieldIssue = (field: FoundingIssue["field"]) =>
    saveAttempted || focusIssue?.venueId === selected?.id
      ? issues.find(
          (issue) =>
            issue.venueId === selected?.id && issue.field === field && (!issue.zoneId || issue.zoneId === zoneId),
        )
      : undefined;
  const errorProps = (field: FoundingIssue["field"]) => ({
    "aria-invalid": fieldIssue(field) ? true : undefined,
    "aria-describedby": fieldIssue(field) ? `${tabId}-error-${field}` : undefined,
  });
  const fieldError = (field: FoundingIssue["field"]) =>
    fieldIssue(field) ? (
      <span className="villages-quick-field-error" id={`${tabId}-error-${field}`} role="alert">
        {fieldIssue(field)?.message}
      </span>
    ) : null;
  useEffect(() => {
    const node = dialog.current;
    if (!open || !node) return;
    const opener = document.activeElement;
    const keyboard = (navigator as Navigator & { virtualKeyboard?: { overlaysContent: boolean } }).virtualKeyboard;
    const wasOverlay = keyboard?.overlaysContent;
    const phone = window.matchMedia("(max-width:727px)").matches;
    if (phone) {
      // Keep the sheet in layout-viewport coordinates while the keyboard covers it.
      node.style.setProperty("--quick-editor-height", `${window.innerHeight * 0.92}px`);
      node.style.setProperty("--quick-editor-top", `${window.innerHeight * 0.08}px`);
      if (keyboard) keyboard.overlaysContent = true;
    }
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
      node.style.removeProperty("--quick-editor-height");
      node.style.removeProperty("--quick-editor-top");
      if (phone && keyboard) keyboard.overlaysContent = wasOverlay ?? false;
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
  }, [focusIssue]);
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
  };
  return (
    <section className="villages-quick-start" aria-label="Venues">
      <div className="villages-quick-map-toolbar" role="group" aria-label="Venue placement controls">
        <select
          aria-label="Move Venue"
          value={moving?.id ?? ""}
          disabled={busy || imageBusy || !venues.length}
          onChange={(event) => {
            const venue = venues.find((row) => row.id === event.target.value);
            onMove(venue ?? null);
          }}
        >
          <option value="">Choose Venue</option>
          {venues.map((venue) => (
            <option key={venue.id} value={venue.id}>
              {venue.name || "Venue"}
            </option>
          ))}
        </select>
        <button
          type="button"
          aria-label="Edit Venue"
          disabled={busy || imageBusy || !moving}
          onClick={() => moving && onSelect(moving)}
        >
          Edit
        </button>
        <button
          className="villages-quick-arrange"
          type="button"
          aria-label="Arrange automatically"
          disabled={busy || imageBusy}
          onClick={onArrange}
        >
          Arrange
        </button>
      </div>
      <section ref={mapDetails} className="villages-quick-map" aria-label="Venue placement">
        {map}
      </section>
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
              {tab === "venue" ? (
                <>
                  <fieldset className="villages-quick-venue-fields" disabled={busy || imageBusy}>
                    <label>
                      Venue Name
                      <input
                        autoComplete="off"
                        aria-label="Venue Name"
                        {...errorProps("name")}
                        maxLength={100}
                        value={selected.name}
                        onChange={(event) => onPatch({ ...selected, name: event.target.value })}
                      />
                      {fieldError("name")}
                    </label>
                    <label>
                      Physical Form
                      <input
                        autoComplete="off"
                        aria-label="Physical Form"
                        {...errorProps("form")}
                        maxLength={240}
                        value={selected.form ?? ""}
                        onChange={(event) => onPatch({ ...selected, form: event.target.value })}
                      />
                      {fieldError("form")}
                    </label>
                  </fieldset>
                  <FoundingConnections
                    venue={selected}
                    onPatch={onPatch}
                    selectedZoneId={zoneId}
                    onSelect={setZoneId}
                    allowAdd
                    onAdd={addZone}
                    busy={busy || imageBusy}
                  />
                </>
              ) : (
                <>
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
                      <div className="villages-quick-zone-name">
                        <input
                          autoComplete="off"
                          aria-label="Zone name"
                          {...errorProps("zone-name")}
                          value={zone.name ?? ""}
                          disabled={busy || imageBusy}
                          maxLength={100}
                          onChange={(event) => patchZone(personal, zone.id, { name: event.target.value })}
                        />
                        {fieldError("zone-name")}
                      </div>
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
                              onClick={() =>
                                patchZone(personal, zone.id, {
                                  access: {
                                    ...(zone.access ?? draftZonePolicy(selected, zone, personal)),
                                    mode,
                                    ...(mode === "permission-required" &&
                                    selected.category === "public-center" &&
                                    !zone.access?.managerIds?.length
                                      ? { managerIds: ["player"], memberIds: ["player"] }
                                      : {}),
                                  },
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
                            {...errorProps("zone-purpose")}
                            value={zone.purpose ?? ""}
                            maxLength={240}
                            onChange={(event) => patchZone(personal, zone.id, { purpose: event.target.value })}
                          />
                          {fieldError("zone-purpose")}
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
                      <div className="villages-quick-zone-appearance">
                        <label>
                          Appearance
                          <textarea
                            autoComplete="off"
                            aria-label={zoneId === "exterior" ? "Exterior appearance" : "Appearance"}
                            {...errorProps(zoneId === "exterior" ? "description" : "zone-appearance")}
                            value={zoneId === "exterior" ? selected.description : (zone?.description ?? "")}
                            maxLength={1000}
                            rows={3}
                            onChange={(event) =>
                              zoneId === "exterior"
                                ? onPatch({ ...selected, description: event.target.value })
                                : zone && patchZone(personal, zone.id, { description: event.target.value })
                            }
                          />
                          {fieldError(zoneId === "exterior" ? "description" : "zone-appearance")}
                        </label>
                        <button
                          type="button"
                          className="villages-quick-zone-image"
                          aria-label={image ? "Edit Zone artwork" : "Artwork"}
                          onClick={() => setArtworkOpen(true)}
                        >
                          {image ? (
                            <img
                              src={image.url}
                              alt={`Artwork for ${zoneId === "exterior" ? "Entrance" : zone?.name || "Zone"}`}
                            />
                          ) : (
                            "Artwork"
                          )}
                        </button>
                      </div>
                    )}
                  </fieldset>
                  {hiddenPrivate ? <p>The resident’s private interior stays hidden until authorized entry.</p> : null}
                </>
              )}
            </section>
            <footer className="villages-quick-footer">
              {layoutError ? <p role="alert">{layoutError}</p> : null}
              {saveError ? <p role="alert">{saveError}</p> : null}
              {problem ? <p role="alert">{problem}</p> : null}
              <button type="button" className="villages-forging-primary" onClick={finish}>
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
