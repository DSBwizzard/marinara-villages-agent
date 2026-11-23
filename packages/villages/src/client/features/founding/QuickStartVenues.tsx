import { FoundingAccess } from "./FoundingAccess.js";
import { FoundingPeople } from "./FoundingPeople.js";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { FoundingDialog } from "./FoundingDialog.js";
import type { VillageVenue } from "../../../shared/contracts/village.js";
import type { SetupVenueDraft, Portrait } from "../../shared/types.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import { addFoundingZone } from "./founding-template.js";
import { foundingHomeMembers, reconcileFoundingHome } from "./founding-homes.js";
import { ELEMENT_TAG as P } from "../../shared/constants.js";
import { DESK_STYLES } from "../../shared/desk-styles.js";
import { VenueProfile } from "../../shared/VenueProfile.js";
import { VillageIcon } from "../../shared/VillageIcon.js";
import { VenueZoneRow, type VenueSection } from "../../shared/VenueNavigation.js";
import { QuickStartZoneArtwork } from "./QuickStartZoneArtwork.js";
import { FoundingConnections } from "./villages-founding-zones.js";
import { foundingVenueIssues, type FoundingIssue } from "./villages-founding-workspace-state.js";

export function QuickStartVenues({
  inlineVenue = false,
  mobile = false,
  daylight = false,
  venues,
  locationName,
  people,
  selectedId,
  busy,
  imageBusy,
  focusIssue,
  saveError,
  problem,
  problemAction,
  map,
  onSelect,
  onPatch,
  openFromMap,
  onMapOpened,
  onGenerateImage,
  onUploadImage,
  actions,
  actionsOnMap = false,
  onRetrySaving,
  onCloseVenue,
  backLabel,
}: {
  inlineVenue?: boolean;
  mobile?: boolean;
  daylight?: boolean;
  venues: SetupVenueDraft[];
  locationName: string;
  people: { id: string; name: string; portrait?: Portrait }[];
  selectedId: string | null;
  busy: boolean;
  imageBusy: boolean;
  focusIssue: FoundingIssue | null;
  saveError?: string;
  problem?: string;
  problemAction?: ReactNode;
  map?: ReactNode;
  onSelect(venue: SetupVenueDraft): void;
  onPatch(venue: SetupVenueDraft): void;
  openFromMap?: { id: string };
  onMapOpened?(): void;
  onGenerateImage(venue: VillageVenue, area: "exterior" | "interior" | "private", zoneId?: string): void;
  onUploadImage(venue: VillageVenue, area: "exterior" | "interior" | "private", file: File, zoneId?: string): void;
  actions?: ReactNode;
  actionsOnMap?: boolean;
  onRetrySaving?(): void;
  onCloseVenue?(): void;
  backLabel?: string;
}) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [section, setSection] = useState<VenueSection>("about");
  const [zoneSection, setZoneSection] = useState<VenueSection>("about");
  const [editingAbout, setEditingAbout] = useState(false);
  const [zoneDetails, setZoneDetails] = useState(false);
  const [connectionsOpen, setConnectionsOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [choiceError, setChoiceError] = useState("");
  const zoneBack = useRef<HTMLButtonElement>(null);
  const zoneList = useRef<HTMLElement>(null);
  const venueWorkspace = useRef<HTMLDivElement>(null);
  const venuesRoot = useRef<HTMLElement>(null);
  const venueBack = useRef<HTMLButtonElement>(null);
  const openedFromPin = useRef(false);
  const zoneName = useRef<HTMLInputElement>(null);
  const fieldId = useId();
  const [zoneId, setZoneId] = useState("exterior");
  const selected = venues.find((venue) => venue.id === selectedId) ?? venues[0];
  const ordered = [
    ...venues.filter((venue) => venue.occupancy.playerHome || !!venue.residentIds?.length),
    ...venues.filter((venue) => !(venue.occupancy.playerHome || !!venue.residentIds?.length)),
  ];
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const open = editorOpen && !!selected;
  const inlineOpen = inlineVenue && open;
  const closeVenue = () => {
    setEditorOpen(false);
    onCloseVenue?.();
    if (!inlineOpen || !selected) return;
    const id = CSS.escape(selected.id);
    requestAnimationFrame(() => {
      const root = venuesRoot.current;
      const pin =
        mobile || openedFromPin.current ? root?.querySelector<HTMLButtonElement>(`[data-pin-id="${id}"]`) : null;
      (pin ?? root?.querySelector<HTMLButtonElement>(`[data-venue-id="${id}"]`))?.focus({ preventScroll: true });
    });
  };
  const issues = foundingVenueIssues(venues, false);
  const members = selected ? foundingHomeMembers(selected) : [];
  const actors = [{ id: "player", name: "You" }, ...people];
  const patch = (venue: SetupVenueDraft) => onPatch(reconcileFoundingHome(venue));
  const selectSection = (next: VenueSection) => {
    setSection(next);
    setEditingAbout(false);
    setConnectionsOpen(false);
    setZoneDetails(false);
    setChoiceError("");
  };
  const selectZone = (id: string) => {
    const opener = document.activeElement;
    setZoneId(id);
    setZoneSection("about");
    setEditingAbout(false);
    setZoneDetails(true);
    setChoiceError("");
    requestAnimationFrame(() => {
      if (document.activeElement === opener || document.activeElement === document.body) zoneBack.current?.focus();
    });
  };
  const backToZones = () => {
    selectSection("zones");
    requestAnimationFrame(() =>
      Array.from(zoneList.current?.querySelectorAll<HTMLButtonElement>("[data-layout-zone]") ?? [])
        .find((row) => row.dataset.layoutZone === zoneId)
        ?.focus(),
    );
  };
  const personal = !!selected?.privateSpaces?.some((zone) => zone.id === zoneId);
  const zone = [...(selected?.spaces ?? []), ...(selected?.privateSpaces ?? [])].find((row) => row.id === zoneId);
  useEffect(() => {
    if (zoneId !== "exterior" && !zone) setZoneId("exterior");
  }, [zoneId, zone]);
  useEffect(() => {
    if (!focusIssue) return;
    if (focusIssue.field === "placement") {
      setMapOpen(true);
      if (inlineVenue) setEditorOpen(false);
      return;
    }
    openedFromPin.current = false;
    const field = focusIssue.field;
    setConnectionsOpen(field === "layout" || field === "sleep");
    setSection(
      field === "name" || field === "form" || field === "layout" || field === "sleep"
        ? field === "layout" || field === "sleep"
          ? "zones"
          : "about"
        : field === "assignment"
          ? "people"
          : "zones",
    );
    setZoneDetails(field !== "sleep" && !!focusIssue.zoneId);
    setEditingAbout(true);
    setZoneSection("about");
    setEditorOpen(true);
  }, [focusIssue, inlineVenue]);
  useEffect(() => {
    if (!openFromMap || selected?.id !== openFromMap.id) return;
    openedFromPin.current = true;
    setMapOpen(true);
    selectSection("about");
    setEditorOpen(true);
    onMapOpened?.();
  }, [onMapOpened, openFromMap, selected?.id]);
  useEffect(() => {
    if (!open || (!inlineOpen && !focusIssue)) return;
    const frame = requestAnimationFrame(() => {
      const target =
        (!mobile && focusIssue && venueWorkspace.current?.querySelector<HTMLElement>('[aria-invalid="true"]')) ||
        (inlineOpen ? venueBack.current : null);
      target?.focus();
      target?.scrollIntoView({ block: "nearest" });
    });
    return () => cancelAnimationFrame(frame);
  }, [open, inlineOpen, selected?.id, focusIssue, mobile]);
  const area = zoneId === "exterior" ? "exterior" : personal ? "private" : "interior";
  const artworkZone = zone;
  const artworkArea = artworkZone ? area : "exterior";
  const image = artworkZone ? artworkZone.image : selected?.presentation.image;
  const artworkName = artworkZone?.name || (artworkZone ? "Zone" : "Entrance");
  const fieldIssue = (field: FoundingIssue["field"]) =>
    focusIssue?.venueId === selected?.id
      ? issues.find(
          (issue) =>
            issue.venueId === selected?.id && issue.field === field && (!issue.zoneId || issue.zoneId === zoneId),
        )
      : undefined;
  const errorProps = (field: FoundingIssue["field"]) => ({
    "aria-invalid": fieldIssue(field) ? true : undefined,
    "aria-describedby": fieldIssue(field) ? `${fieldId}-error-${field}` : undefined,
  });
  const fieldError = (field: FoundingIssue["field"]) =>
    fieldIssue(field) ? (
      <span className="villages-quick-field-error" id={`${fieldId}-error-${field}`} role="alert">
        {fieldIssue(field)?.message}
      </span>
    ) : null;
  useEffect(() => {
    const venue = selectedRef.current;
    if (!venue || !open) return;
    const target = focusIssue?.venueId === venue.id ? focusIssue.zoneId : undefined;
    setZoneId(
      target === "common"
        ? (venue.spaces?.[0]?.id ?? "exterior")
        : target === "private"
          ? (venue.privateSpaces?.[0]?.id ?? "exterior")
          : (target ?? "exterior"),
    );
  }, [open, selectedId, focusIssue]);
  const patchZone = (change: Partial<NonNullable<VillageVenue["spaces"]>[number]>) => {
    if (!selected) return;
    const key = personal ? "privateSpaces" : "spaces";
    patch({ ...selected, [key]: selected[key]?.map((row) => (row.id === zoneId ? { ...row, ...change } : row)) });
  };
  const addZone = () => {
    if (!selected) return;
    const id = `zone:${createVillagesClientId()}`;
    const next = addFoundingZone(selected, false, id);
    if (next !== selected) {
      patch(next);
      setZoneId(id);
    }
  };
  const cards = ordered.map((venue) => {
    const home = venue.occupancy.playerHome || !!venue.residentIds?.length;
    return (
      <button
        key={venue.id}
        type="button"
        className="villages-quick-venue-card"
        aria-label={venue.name || "Venue"}
        aria-expanded={inlineVenue ? inlineOpen && selected?.id === venue.id : undefined}
        data-venue-id={venue.id}
        data-selected={selected?.id === venue.id}
        disabled={busy || imageBusy}
        onClick={() => {
          openedFromPin.current = false;
          onSelect(venue);
          selectSection("about");
          setEditorOpen(true);
        }}
      >
        <span className="villages-quick-venue-icon">
          <VillageIcon name={home ? "places" : "people"} />
        </span>
        <span className="villages-quick-venue-copy">
          <strong>{venue.name || "Venue"}</strong>
          <small className="villages-quick-zone-summary">
            {home
              ? foundingHomeMembers(venue)
                  .map((id) => actors.find((actor) => actor.id === id)?.name ?? "Resident")
                  .join(", ")
              : venue.category === "public-center"
                ? "Community Venue"
                : venue.venueType || "Venue"}
          </small>
        </span>
        <span aria-hidden="true">›</span>
      </button>
    );
  });
  const venuePage =
    open && selected ? (
      <>
        <style>{DESK_STYLES}</style>
        <div
          ref={venueWorkspace}
          className={P + "-workspace-content villages-founding-venue-workspace"}
          key={selected.id}
        >
          <VenueProfile
            daylight={daylight}
            name={zoneDetails ? artworkName : selected.name || "Venue"}
            entranceImage={selected.presentation.image?.url}
            zoneImage={
              section === "zones" && zoneDetails && zone && image ? { url: image.url, name: artworkName } : undefined
            }
            fallback={
              !selected.presentation.image?.url && !(section === "zones" && zoneDetails && zone && image)
                ? daylight
                  ? "day"
                  : "night"
                : undefined
            }
            roomBackdrop={section === "zones" && zoneDetails && !!image}
            navigation={
              <button
                ref={zoneDetails ? zoneBack : venueBack}
                className={P + "-venue-back"}
                type="button"
                onClick={zoneDetails ? backToZones : closeVenue}
              >
                {zoneDetails
                  ? `← ${selected.name || "Venue"}`
                  : onCloseVenue
                    ? backLabel || "← Review"
                    : inlineVenue
                      ? "← Map"
                      : "← Venues"}
              </button>
            }
            tabs={{
              section: zoneDetails ? zoneSection : section,
              zone: zoneDetails,
              onSelect: zoneDetails
                ? (next) => {
                    setZoneSection(next);
                    setEditingAbout(false);
                  }
                : selectSection,
            }}
          >
            {!zoneDetails && section === "about" ? (
              <section className="villages-manage" aria-label="About this venue">
                <div className="villages-people-actions">
                  <button type="button" disabled={busy || imageBusy} onClick={() => setEditingAbout(!editingAbout)}>
                    {editingAbout ? "Done" : "Edit"}
                  </button>
                </div>
                {editingAbout ? (
                  <fieldset className="villages-manage-form" disabled={busy || imageBusy}>
                    <label>
                      Venue name
                      <input
                        autoComplete="off"
                        aria-label="Venue Name"
                        {...errorProps("name")}
                        maxLength={60}
                        value={selected.name}
                        onChange={(e) => patch({ ...selected, name: e.target.value })}
                      />
                      {fieldError("name")}
                    </label>
                    <label>
                      Description
                      <textarea
                        aria-label="Description"
                        {...errorProps("description")}
                        maxLength={1000}
                        rows={3}
                        value={selected.description}
                        onChange={(e) => patch({ ...selected, description: e.target.value })}
                      />
                      {fieldError("description")}
                    </label>
                    <label>
                      Venue form
                      <textarea
                        autoComplete="off"
                        aria-label="Venue form"
                        {...errorProps("form")}
                        maxLength={2000}
                        rows={2}
                        value={selected.form ?? ""}
                        onChange={(e) => patch({ ...selected, form: e.target.value })}
                      />
                      {fieldError("form")}
                    </label>
                    <label className="villages-manage-capacity">
                      Resident capacity
                      <select
                        aria-label="Resident capacity"
                        value={selected.residenceCapacity ?? 0}
                        onChange={(e) => {
                          const capacity = Number(e.target.value);
                          if (capacity >= members.length)
                            patch({ ...selected, residenceCapacity: capacity, foundingCapacity: capacity });
                        }}
                      >
                        {[0, 1, 2, 3, 4].map((n) => (
                          <option key={n} disabled={n < members.length}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </label>
                  </fieldset>
                ) : (
                  <>
                    <p>{selected.description}</p>
                    <dl className="villages-manage-details">
                      <dt>Form</dt>
                      <dd>{selected.form}</dd>
                      <dt>Resident capacity</dt>
                      <dd>{selected.residenceCapacity ?? 0}</dd>
                    </dl>
                  </>
                )}
              </section>
            ) : null}
            {(zoneDetails ? zoneSection : section) === "people" ? (
              <FoundingPeople
                key={selected.id + (zoneDetails ? zoneId : "venue")}
                venue={selected}
                people={actors}
                onPatch={patch}
                disabled={busy || imageBusy}
                zoneId={zoneDetails ? zoneId : undefined}
              />
            ) : null}
            {(zoneDetails ? zoneSection : section) === "access" ? (
              <FoundingAccess
                key={selected.id + (zoneDetails ? zoneId : "venue")}
                venue={selected}
                zoneId={zoneDetails ? zoneId : undefined}
                onPatch={patch}
                disabled={busy || imageBusy}
              />
            ) : null}
            {section === "zones" && connectionsOpen && !zoneDetails ? (
              <>
                <button type="button" className={P + "-venue-back"} onClick={() => setConnectionsOpen(false)}>
                  ← Zones
                </button>
                <FoundingConnections
                  venue={selected}
                  onPatch={patch}
                  selectedZoneId={zoneId}
                  onSelect={setZoneId}
                  busy={busy || imageBusy}
                  allowAdd
                  layoutOnly
                  onAdd={addZone}
                />
              </>
            ) : null}
            {section === "zones" && !zoneDetails && !connectionsOpen ? (
              <>
                <div className="villages-people-actions">
                  <button type="button" className={P + "-button"} onClick={() => setConnectionsOpen(true)}>
                    Zone connections <span aria-hidden="true">›</span>
                  </button>
                </div>
                <section className={`${P}-venue-zone-picker`} aria-label="Zones" ref={zoneList}>
                  <VenueZoneRow
                    id="exterior"
                    name="Entrance"
                    image={selected.presentation.image?.url}
                    disabled={busy || imageBusy}
                    current={zoneId === "exterior"}
                    onOpen={() => selectZone("exterior")}
                  />
                  {[...(selected.spaces ?? []), ...(selected.privateSpaces ?? [])].map((row) => (
                    <VenueZoneRow
                      key={row.id}
                      id={row.id}
                      name={row.name || "Zone"}
                      image={row.image?.url}
                      disabled={busy || imageBusy}
                      current={zoneId === row.id}
                      accessLabel={row.access?.mode === "permission-required" ? "Permission required" : undefined}
                      onOpen={() => selectZone(row.id)}
                    />
                  ))}
                </section>
              </>
            ) : null}
            {zoneDetails && zoneSection === "about" ? (
              <fieldset
                className="villages-quick-selected-zone"
                aria-label="Selected Zone"
                data-zone-id={zoneId}
                disabled={busy || imageBusy}
              >
                <div className="villages-people-actions">
                  <button type="button" onClick={() => setEditingAbout(!editingAbout)}>
                    {editingAbout ? "Done" : "Edit"}
                  </button>
                </div>
                {editingAbout ? (
                  <>
                    <div className={P + "-venue-zone-toolbar"}>
                      <header className="villages-quick-zone-heading">
                        <div className="villages-zone-name-field">
                          {zone ? (
                            <input
                              ref={zoneName}
                              autoComplete="off"
                              aria-label="Zone name"
                              {...errorProps("zone-name")}
                              value={zone.name ?? ""}
                              size={Math.max(8, zone.name?.length ?? 0)}
                              placeholder="Zone name"
                              maxLength={100}
                              onChange={(event) => patchZone({ name: event.target.value })}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  event.currentTarget.blur();
                                }
                              }}
                            />
                          ) : (
                            "Entrance"
                          )}
                        </div>
                        {zone ? (
                          <button
                            type="button"
                            aria-label="Rename Zone"
                            title="Rename Zone"
                            onClick={() => {
                              zoneName.current?.focus();
                              zoneName.current?.select();
                            }}
                          >
                            <svg
                              className="mari-rgb-static-icon"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="m16 3 5 5M3 21l5-1L21 7a2.1 2.1 0 0 0-4-4L4 16l-1 5Z" />
                            </svg>
                          </button>
                        ) : null}
                      </header>
                    </div>
                    {fieldError("zone-name")}
                    <div className="villages-quick-zone-content">
                      <div className="villages-quick-zone-fields">
                        <label className="villages-quick-zone-description">
                          <span>{zoneId === "exterior" ? "Exterior description" : "Zone description"}</span>
                          <textarea
                            autoComplete="off"
                            aria-label="Zone description"
                            {...errorProps(zoneId === "exterior" ? "description" : "zone-appearance")}
                            value={zoneId === "exterior" ? selected.description : (zone?.description ?? "")}
                            maxLength={1000}
                            rows={5}
                            onChange={(event) =>
                              zoneId === "exterior"
                                ? patch({ ...selected, description: event.target.value })
                                : patchZone({ description: event.target.value })
                            }
                          />
                          {fieldError(zoneId === "exterior" ? "description" : "zone-appearance")}
                        </label>
                        {zone ? (
                          <label>
                            Used for
                            <input
                              autoComplete="off"
                              aria-label="Used for"
                              {...errorProps("zone-purpose")}
                              value={zone.purpose ?? ""}
                              maxLength={240}
                              onChange={(event) => patchZone({ purpose: event.target.value })}
                            />
                            {fieldError("zone-purpose")}
                          </label>
                        ) : null}
                      </div>
                      <div className="villages-founding-zone-use">
                        {zone && (
                          <label>
                            Personal room
                            <select
                              aria-label="Personal room"
                              value={personal ? zone.ownerId || "vacant" : ""}
                              onChange={(e) => {
                                const ownerId = e.target.value;
                                const room = {
                                  ...zone,
                                  ownerId: ownerId === "vacant" ? "" : ownerId,
                                  access: undefined,
                                };
                                patch({
                                  ...selected,
                                  spaces: [
                                    ...(selected.spaces ?? []).filter((row) => row.id !== zone.id),
                                    ...(!ownerId ? [room] : []),
                                  ],
                                  privateSpaces: [
                                    ...(selected.privateSpaces ?? []).filter((row) => row.id !== zone.id),
                                    ...(ownerId ? [room] : []),
                                  ],
                                });
                              }}
                            >
                              <option value="">Shared Zone</option>
                              <option value="vacant">Unassigned personal room</option>
                              {members.map((id) => (
                                <option key={id} value={id}>
                                  {actors.find((actor) => actor.id === id)?.name}
                                </option>
                              ))}
                            </select>
                          </label>
                        )}
                      </div>
                    </div>
                    <div className="villages-founding-zone-artwork">
                      <QuickStartZoneArtwork
                        key={selected.id + ":" + zoneId}
                        image={image}
                        reference={
                          artworkZone?.pictureReference ?? (!artworkZone ? selected.pictureReference : undefined)
                        }
                        name={artworkName}
                        busy={busy || imageBusy}
                        onUpload={(file) => onUploadImage(selected, artworkArea, file, artworkZone?.id)}
                        onGenerate={() => onGenerateImage(selected, artworkArea, artworkZone?.id)}
                        onRemove={() =>
                          !artworkZone
                            ? patch({
                                ...selected,
                                pictureReference: undefined,
                                referenceAppliedId: undefined,
                                presentation: { ...selected.presentation, image: null },
                              })
                            : patchZone({ image: null, pictureReference: undefined, referenceAppliedId: undefined })
                        }
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <p>{zone ? zone.description : selected.description}</p>
                    {zone?.purpose ? (
                      <dl className="villages-manage-details">
                        <dt>Used for</dt>
                        <dd>{zone.purpose}</dd>
                      </dl>
                    ) : null}
                  </>
                )}
              </fieldset>
            ) : null}
            {choiceError ? <p role="alert">{choiceError}</p> : null}
            {focusIssue?.field === "sleep" &&
            issues.some((issue) => issue.venueId === selected.id && issue.field === "sleep") ? (
              <p role="alert">{focusIssue.message}</p>
            ) : null}
            {saveError || problem ? <p role="alert">{saveError || problem}</p> : null}
            {!saveError ? problemAction : null}
            {saveError && onRetrySaving ? (
              <button type="button" onClick={onRetrySaving}>
                Retry saving draft
              </button>
            ) : null}
          </VenueProfile>
        </div>
      </>
    ) : null;
  return (
    <section
      className="villages-quick-start"
      ref={venuesRoot}
      aria-label="Venues"
      data-map-open={(!mobile && mapOpen) || undefined}
    >
      {map ? (
        <section className="villages-forging-card villages-quick-map-panel" aria-label="Starting location map">
          <div className="villages-quick-map-toolbar" hidden={mobile && inlineOpen}>
            <h2 title={locationName || "Starting location"}>{locationName || "Starting location"}</h2>
            {mobile || actionsOnMap ? (
              actions
            ) : (
              <button type="button" className="villages-quick-open-map" onClick={() => setMapOpen(false)}>
                ← Venues
              </button>
            )}
          </div>
          <section className="villages-quick-map" aria-label="Venue placement" inert={inlineOpen || undefined}>
            {map}
          </section>
          {inlineOpen ? (
            <div className="villages-quick-dialog villages-founding-venue-page villages-founding-venue-pane">
              {venuePage}
            </div>
          ) : null}
        </section>
      ) : null}
      {!mobile && !onCloseVenue ? (
        <section className="villages-forging-card villages-quick-venue-list" aria-label="Starting Venues">
          <header className="villages-venue-heading">
            <h2>Starting Venues</h2>
            <div className="villages-quick-venue-actions">
              {map ? (
                <button type="button" className="villages-quick-open-map" onClick={() => setMapOpen(true)}>
                  Map
                </button>
              ) : null}
              {actionsOnMap ? null : actions}
            </div>
          </header>
          <div className="villages-quick-zone-list">{cards}</div>
          {!open && (saveError || problem) ? <p role="alert">{saveError || problem}</p> : null}
          {!open && !saveError ? problemAction : null}
        </section>
      ) : !open && (saveError || problem || problemAction) ? (
        <div className="villages-founding-map-notice">
          {saveError || problem ? <p role="alert">{saveError || problem}</p> : null}
          {!saveError ? problemAction : null}
        </div>
      ) : null}
      {!inlineVenue && venuePage && selected ? (
        <FoundingDialog
          title={selected.name || "Venue"}
          headerless
          className="villages-quick-dialog villages-founding-venue-page"
          onClose={closeVenue}
        >
          {venuePage}
        </FoundingDialog>
      ) : null}
    </section>
  );
}
