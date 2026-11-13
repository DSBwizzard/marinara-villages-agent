import { useVillageLighting } from "../../shared/useVillageLighting.js";
import { useId, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, type Ref } from "react";
import { useConfirmation } from "../../shared/confirmation.js";
import { connectionProblem } from "../../../shared/helpers/zone-contact.js";
import type { VillageVenue } from "../../../shared/contracts/village.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { ArtworkImage } from "../../shared/ArtworkImage.js";
import { VENUE_FALLBACK_DAY_URL, VENUE_FALLBACK_URL } from "../../shared/desk-art.js";
import { ModalDialog } from "../../shared/ModalDialog.js";
import { useVillageMutationLifetime } from "../../shared/mutation-lifetime.js";
import { playerDisplayName } from "../../shared/presentation.js";
import { venueClassesFor } from "../../shared/venue.js";
import { WorkspaceShell } from "../../shared/WorkspaceShell.js";
import { StorybookHeading } from "../../shared/StorybookHeading.js";
import { useLetterFont } from "../../shared/letter-font-css.js";
import type { VenueScreenController } from "./screen-contracts.js";
import { venueDisplayZones, type VenueDisplayZone } from "./venue-view.js";
import { VenueLayoutEditor } from "./VenueLayoutEditor.js";
import { VillageIcon } from "../../shared/VillageIcon.js";

function VenueName({ place, controller }: { place: VillageVenue; controller: VenueScreenController }) {
  const id = useId();
  const { venueEditDraft, setVenueEditDraft, venueEditBusy, venueEditError, saveVenueName } = controller;
  const name = venueEditDraft?.id === place.id ? venueEditDraft.name : place.name;
  return (
    <form
      autoComplete="off"
      onSubmit={(event) => {
        event.preventDefault();
        if (!venueEditBusy && name.trim() && name.trim() !== place.name) void saveVenueName(place, name);
      }}
    >
      <label htmlFor={id}>Venue name</label>
      <div className={`${ELEMENT_TAG}-venue-name-field`}>
        <input
          id={id}
          autoComplete="off"
          aria-describedby={venueEditError ? `${id}-error` : undefined}
          value={name}
          maxLength={controller.snapshot.settings.maxVenueNameLength}
          onChange={(event) => {
            if (venueEditError) controller.setVenueEditError("");
            setVenueEditDraft((current) => ({
              ...(current?.id === place.id ? current : place),
              name: event.target.value,
            }));
          }}
        />
        <button
          type="submit"
          aria-label="Save name"
          disabled={venueEditBusy || !name.trim() || name.trim() === place.name}
        >
          <span aria-hidden="true">✓</span>
        </button>
      </div>
      {venueEditError ? (
        <p id={`${id}-error`} role="alert">
          {venueEditError}
        </p>
      ) : null}
    </form>
  );
}

function ZoneName({
  place,
  zone,
  controller,
  onDirtyChange,
  saveRef,
}: {
  place: VillageVenue;
  zone: VenueDisplayZone;
  controller: VenueScreenController;
  onDirtyChange(dirty: boolean): void;
  saveRef: Ref<{ save(): Promise<boolean> }>;
}) {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const name = draft ?? zone.name;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef<Promise<boolean> | null>(null);
  useLayoutEffect(() => {
    pending.current = null;
  }, [controller.snapshot.isFounded]);
  const lifetime = useVillageMutationLifetime(controller.snapshot.isFounded, setBusy);
  const save = (): Promise<boolean> => {
    if (pending.current) return pending.current;
    if (name.trim() === zone.name) {
      setDraft(null);
      onDirtyChange(false);
      return Promise.resolve(true);
    }
    if (!name.trim()) {
      setError("Give the Zone a name.");
      return Promise.resolve(false);
    }
    const claim = lifetime.begin();
    if (!claim) return Promise.resolve(false);
    claim.onRetire = () => {
      setBusy(false);
    };
    setBusy(true);
    setError("");
    const operation: Promise<boolean> = (async () => {
      try {
        const saved = await controller.saveVenueZone(place.id, zone.id, { name: name.trim() });
        if (!lifetime.owns(claim)) return false;
        if (saved) {
          setDraft(null);
          onDirtyChange(false);
        } else setError("The Zone name could not be saved.");
        return saved;
      } catch {
        if (lifetime.owns(claim)) setError("The Zone name could not be saved.");
        return false;
      } finally {
        if (pending.current === operation) pending.current = null;
        if (lifetime.finish(claim)) {
          setBusy(false);
        }
      }
    })();
    pending.current = operation;
    return operation;
  };
  useImperativeHandle(saveRef, () => ({ save }));
  return (
    <form
      autoComplete="off"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
      onBlur={(event) => {
        if (draft !== null && !event.currentTarget.contains(event.relatedTarget)) void save();
      }}
    >
      <div className={`${ELEMENT_TAG}-venue-name-field`}>
        <input
          aria-label="Room name"
          autoComplete="off"
          aria-describedby={error ? `${id}-error` : undefined}
          maxLength={controller.snapshot.settings.maxVenueNameLength}
          value={name}
          disabled={busy}
          onChange={(event) => {
            setDraft(event.target.value);
            onDirtyChange(event.target.value.trim() !== zone.name);
            setError("");
          }}
          onKeyDown={(event) => {
            if (event.key !== "Escape" || draft === null) return;
            event.preventDefault();
            setDraft(null);
            setError("");
            onDirtyChange(false);
          }}
        />
        <button type="submit" aria-label="Save room name" disabled={busy || name.trim() === zone.name}>
          <span aria-hidden="true">✓</span>
        </button>
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}

function ZoneArtwork({
  place,
  zone,
  controller,
  artworkUrl,
}: {
  artworkUrl?: string;
  place: VillageVenue;
  zone: VenueDisplayZone;
  controller: VenueScreenController;
}) {
  const { busy, placeBusyId, drawPlaceImage, keepPlaceImage, dropPlaceImage } = controller;
  const upload = useRef<HTMLInputElement>(null);
  const [fullImage, setFullImage] = useState<string | null>(null);
  const disabled = busy || !!placeBusyId;
  return (
    <section className={`${ELEMENT_TAG}-zone-artwork`} aria-label="Artwork">
      <div className={`${ELEMENT_TAG}-zone-artwork-actions`}>
        {artworkUrl ? (
          <button
            type="button"
            className={`${ELEMENT_TAG}-button ${ELEMENT_TAG}-zone-view-image`}
            onClick={(event) => {
              event.currentTarget.focus();
              setFullImage(artworkUrl);
            }}
          >
            <span aria-hidden="true">⤢</span> View full image
          </button>
        ) : null}
        {zone.pictureRetryAvailable ? (
          <button
            type="button"
            className={`${ELEMENT_TAG}-button ${ELEMENT_TAG}-zone-artwork-retry`}
            aria-label="Retry artwork"
            disabled={disabled}
            onClick={() => void controller.retryZonePicture(place, zone.id)}
          >
            Retry
          </button>
        ) : null}
        <button
          type="button"
          className={`${ELEMENT_TAG}-button`}
          aria-label="Generate artwork"
          disabled={disabled || zone.pictureGenerateAvailable === false}
          onClick={() => void drawPlaceImage(place.id, zone.id)}
        >
          Generate
        </button>
        <button
          type="button"
          className={`${ELEMENT_TAG}-button`}
          aria-label="Upload reference"
          disabled={disabled}
          onClick={() => upload.current?.click()}
        >
          Upload
        </button>
        <input
          autoComplete="off"
          ref={upload}
          hidden
          type="file"
          accept="image/*"
          aria-label={`Upload ${zone.name} reference`}
          disabled={disabled}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            void keepPlaceImage(place.id, zone.id, file);
          }}
        />
        {zone.image || zone.pictureReference ? (
          <button
            type="button"
            className={`${ELEMENT_TAG}-button`}
            aria-label="Remove artwork"
            disabled={disabled}
            onClick={() => void dropPlaceImage(place.id, zone.id)}
          >
            Remove
          </button>
        ) : null}
      </div>
      <div className={`${ELEMENT_TAG}-zone-artwork-footer`}>
        <label className={`${ELEMENT_TAG}-zone-picture-freeze`}>
          <input
            autoComplete="off"
            type="checkbox"
            role="switch"
            checked={zone.freezePicture !== true}
            disabled={busy}
            onChange={(event) => void controller.setZonePictureFrozen(place, zone.id, !event.target.checked)}
          />
          Automatic artwork updates
        </label>
        {zone.pictureProblem ||
        zone.pictureUpdating ||
        zone.nightPending ||
        zone.referencePending ||
        zone.pictureOutdated ? (
          <p role="status">
            {zone.pictureProblem ||
              (zone.pictureUpdating
                ? "Artwork pending"
                : zone.referencePending
                  ? "Reference saved for your next visit."
                  : zone.pictureOutdated
                    ? "Artwork is out of date."
                    : "Artwork pending")}
          </p>
        ) : !artworkUrl ? (
          <p>No artwork yet</p>
        ) : null}
      </div>
      {fullImage ? (
        <ModalDialog
          title={zone.name}
          className={`${ELEMENT_TAG}-zone-image-viewer`}
          onClose={() => setFullImage(null)}
        >
          <div className={`${ELEMENT_TAG}-zone-image-viewer-art`}>
            <img src={fullImage} alt={`${zone.name} at ${place.name}`} />
          </div>
        </ModalDialog>
      ) : null}
    </section>
  );
}

function AssignedVillagers({ place, controller }: { place: VillageVenue; controller: VenueScreenController }) {
  const { snapshot, nameOfCharacter } = controller;
  const residents = new Set(
    place.residentIds ?? (place.occupancy.residentCharacterId ? [place.occupancy.residentCharacterId] : []),
  );
  if (place.occupancy.playerHome) residents.add("player");
  const assignments = [
    ...[...residents].map((id) => ({ id, role: "Resident" })),
    ...(place.workerIds ?? []).map((id) => ({ id, role: "Worker" })),
  ];
  return (
    <section className={ELEMENT_TAG + "-venue-people"}>
      <h2>Assigned villagers</h2>
      {assignments.length ? (
        <ul className={ELEMENT_TAG + "-venue-assignments"}>
          {assignments.map(({ id, role }) => (
            <li key={role + id}>
              <span>{id === "player" ? playerDisplayName(snapshot) : nameOfCharacter(id)}</span>
              <small>{role}</small>
            </li>
          ))}
        </ul>
      ) : (
        <p>No assigned villagers.</p>
      )}
    </section>
  );
}

export function VenueScreen({
  controller,
  fromMap = false,
  storybookDaylight,
}: {
  controller: VenueScreenController;
  fromMap?: boolean;
  storybookDaylight?: boolean;
}) {
  const confirmVillages = useConfirmation();
  const [editingConnections, setEditingConnections] = useState(false);
  const [zoneDetails, setZoneDetails] = useState<"open" | "closed" | null>(null);
  const zoneDetailsOpen = zoneDetails === "open";
  const [zoneNameDirty, setZoneNameDirty] = useState(false);
  const zoneNameEditor = useRef<{ save(): Promise<boolean> }>(null);
  const profile = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const connectionsButton = useRef<HTMLButtonElement>(null);
  const subpageBack = useRef<HTMLButtonElement>(null);
  const zoneReturn = useRef<{ row: HTMLButtonElement; scrollArea: HTMLElement | null; scrollTop: number }>(null);
  useLetterFont(fromMap ? "lora" : undefined);
  const {
    snapshot,
    mobile,
    venueId,
    leaveVenue,
    venueSection,
    setVenueSection,
    venueZoneKey,
    setVenueZoneKey,
    room,
    roomBusy,
    openRoom,
    setScreen,
    placeBusyId,
    placeProblem,
    venueEditError,
    venueEditNotice,
    planVenueRenovation,
  } = controller;
  const lighting = useVillageLighting(snapshot?.village);
  const place = snapshot?.settings.venues.find((venue) => venue.id === venueId);
  useLayoutEffect(() => {
    if (fromMap) heading.current?.focus({ preventScroll: true });
  }, [fromMap, place?.id]);
  useLayoutEffect(() => {
    const returnToZone = venueSection === "zones" && zoneDetails === "closed";
    const scrollArea = zoneReturn.current?.scrollArea ?? profile.current?.parentElement;
    if (scrollArea) scrollArea.scrollTop = returnToZone ? (zoneReturn.current?.scrollTop ?? 0) : 0;
    if (editingConnections || zoneDetails === "open") subpageBack.current?.focus({ preventScroll: true });
    if (returnToZone) zoneReturn.current?.row.focus({ preventScroll: true });
  }, [venueSection, editingConnections, zoneDetails]);
  const navigationSelection = useMemo(
    () => ({ venueId, venueZoneKey, venueSection }),
    [venueId, venueZoneKey, venueSection],
  );
  const navigation = useVillageMutationLifetime(snapshot?.isFounded, undefined, navigationSelection);
  const navigationBusy = controller.venueEditBusy;
  const canLeave = async (keepLayout = false) => {
    if (navigationBusy) return false;
    const draft = controller.venueEditDraft;
    const venueNameDirty = !!draft && draft.id === place?.id && draft.name !== place.name;
    const layout = !keepLayout && place ? controller.venueLayouts[place.id] : undefined;
    if (!venueNameDirty && !zoneNameDirty && !layout) return true;
    const claim = navigation.begin();
    if (!claim) return false;
    if (zoneNameDirty && !(await zoneNameEditor.current?.save())) {
      navigation.finish(claim);
      return false;
    }
    if (!navigation.owns(claim)) return false;
    const accepted = !venueNameDirty || (await confirmVillages("Discard unsaved changes?"));
    if (!navigation.owns(claim)) return false;
    if (!accepted) {
      navigation.finish(claim);
      return false;
    }
    if (layout && place) {
      const invalid = connectionProblem(layout.change.connections);
      if (invalid) {
        const discard = await confirmVillages("Some Zones cannot be reached.", {
          cancel: "Keep editing",
          confirm: "Discard and leave",
        });
        if (!navigation.owns(claim) || !discard) {
          navigation.finish(claim);
          return false;
        }
        if (!(await controller.discardVenueZoneLayout(place.id))) {
          navigation.finish(claim);
          return false;
        }
      } else if (!room || room.status === "closed") {
        void controller.commitVenueZoneLayout(place.id);
      }
      if (!navigation.owns(claim)) return false;
    }
    navigation.finish(claim);
    if (venueNameDirty) controller.setVenueEditDraft(null);
    return true;
  };
  const back = async () => {
    if (!(await canLeave())) return;
    leaveVenue();
    if (room && room.status !== "closed") setScreen("room");
  };
  if (!place || !snapshot)
    return (
      <div className={`${ELEMENT_TAG}-root`}>
        <h1>Venue unavailable</h1>
        <button type="button" onClick={back}>
          {room && room.status !== "closed" ? "Back to Scene" : "Back"}
        </button>
      </div>
    );
  const zones = venueDisplayZones(place);
  const selected =
    zones.find((zone) => zone.id === venueZoneKey) ?? zones.find((zone) => zone.kind === "exterior") ?? zones[0];
  const exterior = zones.find((zone) => zone.kind === "exterior");
  const activeProject = snapshot.projects.find(
    (project) => project.venueId === place.id && project.lifecycle?.phase !== "complete",
  );
  const activeScene = !!room && room.status !== "closed";
  const entrance = place.zones?.find((zone) => zone.kind === "exterior");
  const entranceArt =
    (snapshot.isFounded && lighting === "night" && entrance?.dayNight ? entrance.nightImage : null) ??
    entrance?.image ??
    place.presentation.image;
  const roomArtwork = (zone: VenueDisplayZone) =>
    zone.kind === "exterior"
      ? entranceArt
      : ((snapshot.isFounded && lighting === "night" && zone.dayNight ? zone.nightImage : null) ?? zone.image);
  const zoneArt = selected ? roomArtwork(selected) : null;
  const browsing = venueSection === "zones";
  const zoneBackdrop = browsing && (!mobile || zoneDetailsOpen) && zoneArt?.url !== entranceArt?.url ? zoneArt : null;
  const storybookBackdrop = (zoneDetailsOpen && !zoneArt) || (!entranceArt && !zoneBackdrop);
  const daylightBackdrop = !fromMap && storybookBackdrop && (storybookDaylight ?? lighting !== "night");
  const map = snapshot.settings.maps?.find((entry) => entry.id === place.presentation.mapId);
  const visit = () =>
    activeScene && room.placeId === place.id ? setScreen("room") : void openRoom(place, exterior?.id);
  const about = venueSection === "about";
  const returnToMap = async () => {
    if (await canLeave()) leaveVenue(fromMap ? undefined : "map");
  };
  const closeConnections = async () => {
    if (!(await canLeave())) return;
    setEditingConnections(false);
    requestAnimationFrame(() => connectionsButton.current?.focus({ preventScroll: true }));
  };
  const openZoneDetails = (id: string, row: HTMLButtonElement) => {
    const scrollArea =
      mobile && !fromMap ? row.closest<HTMLElement>(`.${ELEMENT_TAG}-desk-stage`) : profile.current?.parentElement;
    zoneReturn.current = { row, scrollArea: scrollArea ?? null, scrollTop: scrollArea?.scrollTop ?? 0 };
    setVenueZoneKey(id);
    setZoneDetails("open");
  };
  const closeZoneDetails = async () => {
    if (await canLeave(true)) setZoneDetails("closed");
  };
  const selectRoom = async (id: string) => {
    if (id !== selected?.id && (await canLeave(true))) setVenueZoneKey(id);
  };
  return (
    <WorkspaceShell beforeLeave={canLeave} disabled={navigationBusy}>
      <section
        ref={profile}
        className={`${ELEMENT_TAG}-venue-profile`}
        data-room-backdrop={zoneDetailsOpen && !!zoneArt ? "true" : undefined}
        data-storybook-backdrop={storybookBackdrop || undefined}
        data-storybook-daylight={daylightBackdrop || undefined}
        aria-label="Venue"
        onKeyDown={(event) => {
          if (
            (!fromMap && !zoneDetailsOpen) ||
            event.key !== "Escape" ||
            event.defaultPrevented ||
            (event.target instanceof Element && event.target.closest("dialog[open], details[open]"))
          )
            return;
          event.preventDefault();
          event.stopPropagation();
          if (zoneDetailsOpen) void closeZoneDetails();
          else if (editingConnections) void closeConnections();
          else void returnToMap();
        }}
      >
        <figure className={ELEMENT_TAG + "-venue-photo"}>
          {storybookBackdrop ? (
            <img
              className={`${ELEMENT_TAG}-venue-storybook-photo`}
              src={daylightBackdrop ? VENUE_FALLBACK_DAY_URL : VENUE_FALLBACK_URL}
              alt=""
            />
          ) : entranceArt ? (
            <ArtworkImage src={entranceArt.url} alt={zoneBackdrop ? "" : place.name} />
          ) : null}
          {zoneBackdrop ? (
            <ArtworkImage className={`${ELEMENT_TAG}-venue-zone-photo`} src={zoneBackdrop.url} alt={selected.name} />
          ) : null}
        </figure>
        <div className={`${ELEMENT_TAG}-venue-navigation`}>
          <button
            type="button"
            className={`${ELEMENT_TAG}-venue-back`}
            aria-label={fromMap ? "Back to map" : undefined}
            disabled={navigationBusy}
            onClick={returnToMap}
          >
            {fromMap ? "← Map" : "← Back to map"}
          </button>
          {activeScene ? (
            <button type="button" className={`${ELEMENT_TAG}-venue-back`} disabled={navigationBusy} onClick={back}>
              Back to Scene
            </button>
          ) : null}
        </div>
        <header className={`${ELEMENT_TAG}-workspace-venue-header`}>
          <StorybookHeading ref={heading} tabIndex={fromMap ? -1 : undefined}>
            {place.name}
          </StorybookHeading>
          <dl className={`${ELEMENT_TAG}-venue-metadata`} aria-label="Venue details">
            {!fromMap ? (
              <div>
                <dt>Type</dt>
                <dd>{place.venueType || venueClassesFor(place).join(" · ") || "Venue"}</dd>
              </div>
            ) : null}
            {map ? (
              <div>
                <dt>Map</dt>
                <dd>{map.name}</dd>
              </div>
            ) : null}
            {place.constructionStatus === "worksite" ? (
              <div>
                <dt>Status</dt>
                <dd>Worksite</dd>
              </div>
            ) : null}
          </dl>
        </header>
        <nav className={`${ELEMENT_TAG}-venue-sections`} aria-label="Venue sections">
          {(["about", "zones", "manage"] as const).map((section) => (
            <button
              type="button"
              key={section}
              disabled={navigationBusy}
              aria-pressed={venueSection === section}
              onClick={async () => {
                if (section === venueSection) {
                  if (zoneDetailsOpen) await closeZoneDetails();
                  else if (editingConnections) await closeConnections();
                  return;
                }
                if (!(await canLeave())) return;
                setEditingConnections(false);
                setZoneDetails(null);
                zoneReturn.current = null;
                setZoneNameDirty(false);
                setVenueSection(section);
              }}
            >
              {section === "about" ? "About" : section === "zones" ? "Zones" : "Manage"}
            </button>
          ))}
        </nav>
        <main className={`${ELEMENT_TAG}-venue-profile-body`}>
          {navigationBusy ? <p role="status">Saving…</p> : null}
          {about ? (
            <section className={`${ELEMENT_TAG}-workspace-about`} aria-label="About this venue">
              <div className={`${ELEMENT_TAG}-venue-summary`}>
                <AssignedVillagers place={place} controller={controller} />
                {(place.constructionStatus === "worksite" || activeProject?.kind === "new-venue") && activeProject ? (
                  <button
                    type="button"
                    className={`${ELEMENT_TAG}-venue-primary`}
                    onClick={() => controller.openVenueProject(activeProject.id)}
                  >
                    View Project
                  </button>
                ) : (
                  <button
                    type="button"
                    className={`${ELEMENT_TAG}-venue-primary`}
                    aria-label={!roomBusy && (!activeScene || room.placeId !== place.id) ? "Visit venue" : undefined}
                    disabled={
                      roomBusy ||
                      (!!activeScene && room.placeId !== place.id) ||
                      place.constructionStatus === "worksite"
                    }
                    onClick={visit}
                  >
                    {roomBusy
                      ? "Opening Scene…"
                      : activeScene && room.placeId === place.id
                        ? "Return to Scene"
                        : "Visit"}
                  </button>
                )}
              </div>
            </section>
          ) : null}
          {browsing ? (
            <div className={`${ELEMENT_TAG}-venue-zone-navigation`}>
              <section className={`${ELEMENT_TAG}-venue-zone-picker`} aria-label="Zones" inert={zoneDetailsOpen}>
                {zones.map((zone) => {
                  const image = roomArtwork(zone);
                  return (
                    <button
                      key={zone.id}
                      type="button"
                      aria-current={zone.id === selected?.id || undefined}
                      disabled={navigationBusy}
                      onClick={(event) => openZoneDetails(zone.id, event.currentTarget)}
                    >
                      <span className={`${ELEMENT_TAG}-venue-zone-thumb`} aria-hidden="true">
                        {image ? <ArtworkImage src={image.url} alt="" tile /> : <VillageIcon name="places" />}
                      </span>
                      <span className={`${ELEMENT_TAG}-venue-zone-caption`}>
                        <span>{zone.name}</span>
                        {zone.accessLabel !== "Open to you" ? <small>{zone.accessLabel}</small> : null}
                      </span>
                      <span className={`${ELEMENT_TAG}-venue-zone-chevron`} aria-hidden="true">
                        ›
                      </span>
                    </button>
                  );
                })}
              </section>
              <section
                className={`${ELEMENT_TAG}-venue-zone-editor`}
                aria-label="Edit room details"
                inert={!zoneDetailsOpen}
              >
                {zoneDetails && selected ? (
                  <section className={`${ELEMENT_TAG}-venue-zone-details`} aria-label={selected.name}>
                    <div className={`${ELEMENT_TAG}-venue-zone-toolbar`}>
                      <button
                        ref={zoneDetailsOpen ? subpageBack : undefined}
                        type="button"
                        className={`${ELEMENT_TAG}-venue-back`}
                        disabled={navigationBusy}
                        onClick={closeZoneDetails}
                      >
                        ← Zones
                      </button>
                      {selected.kind !== "exterior" ? (
                        <ZoneName
                          key={place.id + selected.id}
                          place={place}
                          zone={selected}
                          controller={controller}
                          onDirtyChange={setZoneNameDirty}
                          saveRef={zoneNameEditor}
                        />
                      ) : (
                        <h2>{selected.name}</h2>
                      )}
                    </div>
                    <ZoneArtwork
                      key={selected.id}
                      place={place}
                      zone={selected}
                      controller={controller}
                      artworkUrl={zoneArt?.url}
                    />
                    {selected.preparation?.status === "failed" ? (
                      <button
                        type="button"
                        className={`${ELEMENT_TAG}-button`}
                        disabled={controller.busy}
                        onClick={() => void controller.retryPrivateSpacePreparation()}
                      >
                        Retry private-space preparation
                      </button>
                    ) : null}
                  </section>
                ) : null}
              </section>
            </div>
          ) : null}
          {venueSection === "manage" && editingConnections && selected ? (
            <section className={`${ELEMENT_TAG}-venue-connections`} aria-label="Zone connections">
              <div className={`${ELEMENT_TAG}-venue-manage-heading`}>
                <h2>Zone connections</h2>
                <button
                  ref={subpageBack}
                  type="button"
                  className={`${ELEMENT_TAG}-venue-back`}
                  disabled={navigationBusy}
                  onClick={closeConnections}
                >
                  ← Manage
                </button>
              </div>
              <div className={`${ELEMENT_TAG}-venue-zones-layout`}>
                <VenueLayoutEditor
                  key={place.id}
                  place={place}
                  controller={controller}
                  zones={zones}
                  selectedId={selected.id}
                  onSelect={selectRoom}
                />
              </div>
            </section>
          ) : null}
          {venueSection === "manage" && !editingConnections ? (
            <section className={ELEMENT_TAG + "-venue-manage"} aria-label="Manage this venue">
              <VenueName place={place} controller={controller} />
              <button
                type="button"
                className={ELEMENT_TAG + "-button"}
                disabled={navigationBusy}
                onClick={async () => {
                  if (await canLeave()) planVenueRenovation(place);
                }}
              >
                Plan a renovation <span aria-hidden="true">›</span>
              </button>
              {selected ? (
                <button
                  ref={connectionsButton}
                  type="button"
                  className={`${ELEMENT_TAG}-button`}
                  disabled={navigationBusy}
                  onClick={async () => {
                    if (await canLeave(true)) setEditingConnections(true);
                  }}
                >
                  Zone connections <span aria-hidden="true">›</span>
                </button>
              ) : null}
            </section>
          ) : null}
          {placeBusyId === place.id ? <p role="status">Drawing or saving artwork…</p> : null}
          {placeProblem?.id === place.id ? <p role="alert">{placeProblem.text}</p> : null}
          {venueEditError && (venueSection !== "manage" || editingConnections) ? (
            <p role="alert">{venueEditError}</p>
          ) : null}
          {venueEditNotice ? <p role="status">{venueEditNotice}</p> : null}
        </main>
      </section>
    </WorkspaceShell>
  );
}
