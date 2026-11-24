import { VenueRunnersRow } from "../venues/VenueRunners.js";
import { foundingAccess } from "./founding-access.js";
import {
  ArrangementSummary,
  arrangementBackLabel,
  arrangementTitle,
  arrangementBack,
  arrangementAddLabel,
  type ArrangementPage,
} from "../venues/ArrangementNavigation.js";
import { FoundingPeople } from "./FoundingPeople.js";
import { FoundingAccess } from "./FoundingAccess.js";
import { useEffect, useLayoutEffect, useId, useRef, useState, type ReactNode } from "react";
import { FoundingDialog } from "./FoundingDialog.js";
import type { VillageVenue } from "../../../shared/contracts/village.js";
import type { SetupVenueDraft, Portrait } from "../../shared/types.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import { addFoundingZone } from "./founding-template.js";
import { foundingHomeMembers, reconcileFoundingHome } from "./founding-homes.js";
import { draftZonePolicy } from "./villages-founding-zones.js";
import { ELEMENT_TAG as P } from "../../shared/constants.js";
import { DESK_STYLES } from "../../shared/desk-styles.js";
import { VenueProfile } from "../../shared/VenueProfile.js";
import { VillageIcon } from "../../shared/VillageIcon.js";
import { VenueZoneRow, type VenueSection } from "../../shared/VenueNavigation.js";
import { ZoneImageControls } from "../../shared/ZoneImageControls.js";
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
  onRedraft,
  onRemove,
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
  onRedraft?(venue: SetupVenueDraft): void;
  onRemove?(venue: SetupVenueDraft): Promise<boolean> | boolean;
}) {
  const [arrangementPage, setArrangementPage] = useState<ArrangementPage | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [section, setSection] = useState<VenueSection>("about");
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
  const returnFocus = useRef<{ id: string; pin: boolean } | null>(null);
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
    if (inlineOpen && selected) returnFocus.current = { id: selected.id, pin: mobile || openedFromPin.current };
    setEditorOpen(false);
    onCloseVenue?.();
  };
  useLayoutEffect(() => {
    if (editorOpen || !returnFocus.current) return;
    const { id, pin } = returnFocus.current,
      root = venuesRoot.current;
    returnFocus.current = null;
    (pin
      ? root?.querySelector<HTMLButtonElement>(`[data-pin-id="${CSS.escape(id)}"]`)
      : root?.querySelector<HTMLButtonElement>(`[data-venue-id="${CSS.escape(id)}"]`)
    )?.focus({ preventScroll: true });
  }, [editorOpen]);
  const issues = foundingVenueIssues(venues, false);
  const actors = [{ id: "player", name: "You" }, ...people];
  const patch = (venue: SetupVenueDraft) => onPatch(reconcileFoundingHome(venue));
  const selectSection = (next: VenueSection) => {
    setArrangementPage(null);
    setSection(next);
    setEditingAbout(false);
    setConnectionsOpen(false);
    setZoneDetails(false);
    setChoiceError("");
  };
  const selectZone = (id: string) => {
    const opener = document.activeElement;
    setArrangementPage(null);
    setZoneId(id);
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
          ? "about"
          : "zones",
    );
    setArrangementPage(field === "assignment" ? { kind: "home" } : null);
    setZoneDetails(field !== "sleep" && !!focusIssue.zoneId);
    setEditingAbout(true);
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
  const entranceName = selected?.zones?.find((row) => row.id === "exterior")?.name;
  const artworkName =
    artworkZone?.name ||
    (artworkZone ? "Zone" : entranceName && entranceName !== "Exterior" ? entranceName : "Entrance");
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
      <div className="villages-founding-venue-row" key={venue.id}>
        <button
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
        {(onRedraft || onRemove) && (
          <details
            className="villages-founding-venue-options"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                event.currentTarget.open = false;
                event.currentTarget.querySelector("summary")?.focus();
              }
            }}
          >
            <summary role="button" aria-label={`Options for ${venue.name || "Venue"}`}>
              ⋯
            </summary>
            <div>
              {onRedraft && (
                <button
                  type="button"
                  disabled={busy || imageBusy}
                  onClick={(event) => {
                    event.currentTarget.closest("details")?.removeAttribute("open");
                    onRedraft(venue);
                  }}
                >
                  Redraft Venue
                </button>
              )}
              {onRemove && (
                <button
                  type="button"
                  disabled={busy || imageBusy}
                  onClick={(event) => {
                    event.currentTarget.closest("details")?.removeAttribute("open");
                    onRemove(venue);
                  }}
                >
                  Remove Venue
                </button>
              )}
            </div>
          </details>
        )}
      </div>
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
            name={
              arrangementPage
                ? (actors.find((row) => row.id === arrangementPage.personId)?.name ??
                  (arrangementPage.adding
                    ? arrangementPage.kind === "home"
                      ? "Add resident"
                      : arrangementPage.kind === "work"
                        ? "Add worker"
                        : "Add person"
                    : arrangementTitle(arrangementPage, selected)))
                : zoneDetails
                  ? artworkName
                  : selected.name || "Venue"
            }
            headingAction={
              arrangementPage &&
              !arrangementPage.personId &&
              !arrangementPage.adding &&
              (arrangementPage.kind === "home" || arrangementPage.kind === "work") ? (
                <button
                  type="button"
                  disabled={busy || imageBusy}
                  onClick={() => setArrangementPage({ ...arrangementPage, adding: true })}
                >
                  {arrangementAddLabel(arrangementPage.kind)}
                </button>
              ) : undefined
            }
            heading={
              zoneDetails && !arrangementPage ? (
                <h1 className={P + "-storybook-heading"} aria-label={artworkName}>
                  <input
                    autoComplete="off"
                    aria-label="Zone name"
                    {...errorProps("zone-name")}
                    value={
                      zone
                        ? (zone.name ?? "")
                        : entranceName === undefined || entranceName === "Exterior"
                          ? "Entrance"
                          : entranceName
                    }
                    maxLength={60}
                    disabled={busy || imageBusy}
                    onChange={(e) => {
                      if (zone) patchZone({ name: e.target.value });
                      else
                        patch({
                          ...selected,
                          zones: [
                            {
                              id: "exterior",
                              kind: "exterior",
                              name: e.target.value,
                              description: selected.description,
                              image: selected.presentation.image,
                              seen: true,
                              purpose: "Arrival and approach",
                            },
                            ...(selected.zones ?? []).filter((row) => row.id !== "exterior"),
                          ],
                        });
                    }}
                  />
                </h1>
              ) : undefined
            }
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
                onClick={
                  arrangementPage
                    ? () => setArrangementPage(arrangementBack(arrangementPage))
                    : zoneDetails
                      ? backToZones
                      : closeVenue
                }
              >
                {arrangementPage
                  ? `← ${arrangementBackLabel(arrangementPage, selected)}`
                  : zoneDetails
                    ? `← ${selected.name || "Venue"}`
                    : onCloseVenue
                      ? backLabel || "← Review"
                      : inlineVenue
                        ? "← Map"
                        : "← Venues"}
              </button>
            }
            tabs={{
              hidden: !!arrangementPage,
              section,
              zone: zoneDetails,
              onSelect: selectSection,
            }}
          >
            {!arrangementPage && !zoneDetails && section === "about" ? (
              <section className="villages-manage" aria-label="About this venue">
                <div className="villages-people-actions">
                  {onRedraft && (
                    <button type="button" disabled={busy || imageBusy} onClick={() => onRedraft(selected)}>
                      Redraft Venue
                    </button>
                  )}
                  {onRemove && (
                    <button
                      type="button"
                      disabled={busy || imageBusy}
                      onClick={async () => {
                        if (await onRemove(selected)) closeVenue();
                      }}
                    >
                      Remove Venue
                    </button>
                  )}
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
                        autoComplete="off"
                        aria-label="Description"
                        {...errorProps("form")}
                        maxLength={2000}
                        rows={2}
                        value={selected.form ?? ""}
                        onChange={(e) => patch({ ...selected, form: e.target.value })}
                      />
                      {fieldError("form")}
                    </label>
                  </fieldset>
                ) : (
                  <>
                    <p>{selected.form}</p>
                  </>
                )}
                <VenueRunnersRow
                  ids={foundingAccess(selected).managerIds}
                  nameOf={(id) => actors.find((row) => row.id === id)?.name || id}
                  disabled={busy || imageBusy}
                  onOpen={() => setArrangementPage({ kind: "runners" })}
                />
              </section>
            ) : null}
            {arrangementPage ? (
              <FoundingPeople
                key={selected.id + zoneId + arrangementPage.kind + (arrangementPage.personId ?? "")}
                venue={selected}
                venues={venues}
                people={actors}
                onPatch={patch}
                disabled={busy || imageBusy}
                page={arrangementPage}
                onPage={setArrangementPage}
              />
            ) : null}
            {!arrangementPage && !zoneDetails && section === "arrangements" ? (
              <ArrangementSummary
                place={selected}
                disabled={busy || imageBusy}
                onOpen={(kind) =>
                  setArrangementPage({
                    kind,
                  })
                }
              />
            ) : null}
            {!arrangementPage && section === "zones" && connectionsOpen && !zoneDetails ? (
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
                    name={entranceName && entranceName !== "Exterior" ? entranceName : "Entrance"}
                    image={selected.presentation.image?.url}
                    disabled={busy || imageBusy}
                    current={zoneId === "exterior"}
                    accessLabel="Open to everyone"
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
                      accessLabel={
                        (
                          row.access ??
                          draftZonePolicy(
                            selected,
                            row,
                            selected.privateSpaces?.some((zone) => zone.id === row.id),
                          )
                        ).mode === "permission-required"
                          ? "Invitation only"
                          : "Open to everyone"
                      }
                      onOpen={() => selectZone(row.id)}
                    />
                  ))}
                </section>
              </>
            ) : null}
            {!arrangementPage && zoneDetails ? (
              <fieldset
                className="villages-quick-selected-zone villages-manage"
                aria-label="Selected Zone"
                data-zone-id={zoneId}
                disabled={busy || imageBusy}
              >
                {fieldError("zone-name")}
                <div className="villages-manage-form villages-zone-fields">
                  <label>
                    Description
                    <textarea
                      autoComplete="off"
                      aria-label="Description"
                      {...errorProps(zoneId === "exterior" ? "description" : "zone-appearance")}
                      value={zone ? zone.description : selected.description}
                      maxLength={1000}
                      rows={3}
                      onChange={(e) =>
                        zone
                          ? patchZone({ description: e.target.value })
                          : patch({ ...selected, description: e.target.value })
                      }
                    />
                    {fieldError(zoneId === "exterior" ? "description" : "zone-appearance")}
                  </label>
                  {zone ? (
                    <label>
                      Used for
                      <textarea
                        autoComplete="off"
                        aria-label="Used for"
                        {...errorProps("zone-purpose")}
                        value={zone.purpose ?? ""}
                        maxLength={240}
                        rows={2}
                        onChange={(e) => patchZone({ purpose: e.target.value })}
                      />
                      {fieldError("zone-purpose")}
                    </label>
                  ) : null}
                </div>
                {zone && (
                  <FoundingAccess venue={selected} zoneId={zoneId} onPatch={patch} disabled={busy || imageBusy} />
                )}
                <ZoneImageControls
                  key={selected.id + ":" + zoneId}
                  name={artworkName}
                  imageUrl={image?.url}
                  disabled={busy || imageBusy}
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
      data-venue-open={inlineOpen || undefined}
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
        <section className="villages-forging-card villages-quick-venue-list" aria-label="Starting Venues" hidden={open}>
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
