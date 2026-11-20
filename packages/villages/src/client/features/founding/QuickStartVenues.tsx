import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { FoundingDialog } from "./FoundingDialog.js";
import type { VillageVenue } from "../../../shared/contracts/village.js";
import type { SetupVenueDraft } from "../../shared/types.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import { addFoundingZone } from "./founding-template.js";
import { foundingHomeMembers, foundingSleepZones, reconcileFoundingHome } from "./founding-homes.js";
import { ELEMENT_TAG as P } from "../../shared/constants.js";
import { DESK_STYLES } from "../../shared/desk-styles.js";
import { AssignedVillagers, VenueProfile } from "../../shared/VenueProfile.js";
import { VillageIcon } from "../../shared/VillageIcon.js";
import { VenueZoneRow, type VenueSection } from "../../shared/VenueNavigation.js";
import { QuickStartZoneArtwork } from "./QuickStartZoneArtwork.js";
import { draftZonePolicy, FoundingConnections } from "./villages-founding-zones.js";
import { foundingVenueIssues, type FoundingIssue } from "./villages-founding-workspace-state.js";

export function QuickStartVenues({
  inlineVenue = false,
  mobile = false,
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
  openingVenueId,
  onOpeningVenue,
  actions,
  onRetrySaving,
}: {
  inlineVenue?: boolean;
  mobile?: boolean;
  venues: SetupVenueDraft[];
  locationName: string;
  people: { id: string; name: string }[];
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
  openingVenueId?: string;
  onOpeningVenue?(venueId: string): void;
  actions?: ReactNode;
  onRetrySaving?(): void;
}) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [section, setSection] = useState<VenueSection>("about");
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
    ...venues.filter((venue) => venue.classes?.includes("residence")),
    ...venues.filter((venue) => !venue.classes?.includes("residence")),
  ];
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const open = editorOpen && !!selected;
  const inlineOpen = inlineVenue && open;
  const closeVenue = () => {
    setEditorOpen(false);
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
    setConnectionsOpen(false);
    setZoneDetails(false);
    setChoiceError("");
  };
  const selectZone = (id: string) => {
    setZoneId(id);
    setZoneDetails(true);
    setChoiceError("");
    requestAnimationFrame(() => zoneBack.current?.focus());
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
        ? "manage"
        : field === "assignment"
          ? "about"
          : "zones",
    );
    setZoneDetails(field !== "sleep" && !!focusIssue.zoneId);
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
        (focusIssue && venueWorkspace.current?.querySelector<HTMLElement>('[aria-invalid="true"]')) ||
        (inlineOpen ? venueBack.current : null);
      target?.focus();
      target?.scrollIntoView({ block: "nearest" });
    });
    return () => cancelAnimationFrame(frame);
  }, [open, inlineOpen, selected?.id, focusIssue]);
  const zoneAccess = zone && selected ? (zone.access ?? draftZonePolicy(selected, zone, personal)) : undefined;
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
    const home = venue.classes?.includes("residence");
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
              : venue.classes?.includes("community")
                ? "Community Venue"
                : venue.venueType || venue.classes?.join(" · ") || "Venue"}
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
            name={selected.name || "Venue"}
            type={selected.venueType || selected.classes?.join(" · ") || "Venue"}
            mapName={locationName}
            entranceImage={selected.presentation.image?.url}
            zoneImage={
              section === "zones" && zoneDetails && zone && image ? { url: image.url, name: artworkName } : undefined
            }
            fallback={
              !selected.presentation.image?.url && !(section === "zones" && zoneDetails && zone && image)
                ? "night"
                : undefined
            }
            roomBackdrop={section === "zones" && zoneDetails && !!image}
            navigation={
              <button ref={venueBack} className={P + "-venue-back"} type="button" onClick={closeVenue}>
                {inlineVenue ? "← Map" : "← Venues"}
              </button>
            }
            onKeyDown={
              inlineOpen
                ? (event) => {
                    if (
                      event.key !== "Escape" ||
                      event.defaultPrevented ||
                      (event.target instanceof Element &&
                        event.target.closest("dialog") !== event.currentTarget.closest("dialog"))
                    )
                      return;
                    event.preventDefault();
                    event.stopPropagation();
                    closeVenue();
                  }
                : undefined
            }
            tabs={{ section, onSelect: selectSection }}
          >
            {section === "about" ? (
              <>
                <AssignedVillagers
                  place={selected}
                  locked
                  nameOfCharacter={(id) => actors.find((actor) => actor.id === id)?.name ?? "Resident"}
                />
                {onOpeningVenue &&
                selected.spaces?.some(
                  (zone) =>
                    zone.venueClass !== "residence" &&
                    (!zone.access || (zone.access.mode === "public" && !zone.access.accompanied)),
                ) ? (
                  <button
                    type="button"
                    className={P + "-button"}
                    disabled={busy || imageBusy}
                    aria-pressed={selected.id === openingVenueId}
                    onClick={() => onOpeningVenue(selected.id)}
                  >
                    Opening gathering
                  </button>
                ) : null}
              </>
            ) : null}
            {section === "manage" && !connectionsOpen ? (
              <section className={P + "-venue-manage"} aria-label="Manage this venue">
                <fieldset className="villages-quick-venue-header" disabled={busy || imageBusy}>
                  <label>
                    Venue name
                    <input
                      autoComplete="off"
                      aria-label="Venue Name"
                      {...errorProps("name")}
                      maxLength={60}
                      placeholder="Venue name"
                      value={selected.name}
                      onChange={(event) => patch({ ...selected, name: event.target.value })}
                    />
                    {fieldError("name")}
                  </label>
                  <label>
                    Venue form
                    <textarea
                      autoComplete="off"
                      aria-label="Venue form"
                      {...errorProps("form")}
                      maxLength={2000}
                      rows={2}
                      placeholder="What does this place look like?"
                      value={selected.form ?? ""}
                      onChange={(event) => patch({ ...selected, form: event.target.value })}
                    />
                    {fieldError("form")}
                  </label>
                </fieldset>
                <button type="button" className={P + "-button"} onClick={() => setConnectionsOpen(true)}>
                  Zone connections <span aria-hidden="true">›</span>
                </button>
              </section>
            ) : null}
            {section === "manage" && connectionsOpen ? (
              <>
                <button type="button" className={P + "-venue-back"} onClick={() => setConnectionsOpen(false)}>
                  ← Manage
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
            {section === "zones" && !zoneDetails ? (
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
            ) : null}
            {section === "zones" && zoneDetails ? (
              <fieldset
                className="villages-quick-selected-zone"
                aria-label="Selected Zone"
                data-zone-id={zoneId}
                disabled={busy || imageBusy}
              >
                <div className={`${P}-venue-zone-toolbar`}>
                  <button ref={zoneBack} className={P + "-venue-back"} type="button" onClick={backToZones}>
                    ← Zones
                  </button>
                  <header className="villages-quick-zone-heading">
                    <h3 aria-label={zone ? zone.name || "Zone" : "Entrance"}>
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
                    </h3>
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
                    {zone && zoneAccess ? (
                      <fieldset className="villages-founding-venue-choices">
                        <legend>Visitor access</legend>
                        {(["public", "permission-required"] as const).map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            aria-pressed={zoneAccess.mode === mode}
                            onClick={() => {
                              const key = personal ? "privateSpaces" : "spaces";
                              const candidate = {
                                ...selected,
                                [key]: selected[key]?.map((row) =>
                                  row.id === zone.id ? { ...row, access: { ...zoneAccess, mode } } : row,
                                ),
                              };
                              if (
                                members.some((actor) => {
                                  const sleep = selected.destinations?.[actor]?.sleep;
                                  return (
                                    sleep &&
                                    foundingSleepZones(selected, actor).some((row) => row.id === sleep) &&
                                    !foundingSleepZones(candidate, actor).some((row) => row.id === sleep)
                                  );
                                })
                              ) {
                                setChoiceError("Keep a route to the assigned sleeping Zone.");
                                return;
                              }
                              patch(candidate);
                              setChoiceError("");
                            }}
                          >
                            {mode === "public" ? "Open to all" : "Permission required"}
                          </button>
                        ))}
                      </fieldset>
                    ) : null}
                  </div>
                </div>
                <div className="villages-founding-zone-artwork">
                  <QuickStartZoneArtwork
                    key={selected.id + ":" + zoneId}
                    image={image}
                    reference={artworkZone?.pictureReference ?? (!artworkZone ? selected.pictureReference : undefined)}
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
            {mobile ? (
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
      {!mobile ? (
        <section className="villages-forging-card villages-quick-venue-list" aria-label="Starting Venues">
          <header className="villages-venue-heading">
            <h2>Starting Venues</h2>
            <div className="villages-quick-venue-actions">
              {map ? (
                <button type="button" className="villages-quick-open-map" onClick={() => setMapOpen(true)}>
                  Map
                </button>
              ) : null}
              {actions}
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
