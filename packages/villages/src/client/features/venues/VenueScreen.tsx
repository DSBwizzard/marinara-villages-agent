import { useVillageLighting } from "../../shared/useVillageLighting.js";
import { useId, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, type Ref } from "react";
import { useConfirmation } from "../../shared/confirmation.js";
import { connectionProblem } from "../../../shared/helpers/zone-contact.js";
import { galleryArtworkVariant } from "../../../shared/helpers/gallery-artwork.js";
import type { VillageVenue } from "../../../shared/contracts/village.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { ArtworkImage } from "../../shared/ArtworkImage.js";
import { useVillageMutationLifetime } from "../../shared/mutation-lifetime.js";
import { playerDisplayName } from "../../shared/presentation.js";
import { venueClassesFor } from "../../shared/venue.js";
import { WorkspaceShell } from "../../shared/WorkspaceShell.js";
import { StorybookHeading } from "../../shared/StorybookHeading.js";
import { useLetterFont } from "../../shared/letter-font-css.js";
import type { VenueScreenController } from "./screen-contracts.js";
import { venueDisplayZones, type VenueDisplayZone } from "./venue-view.js";
import { VenueLayoutEditor } from "./VenueLayoutEditor.js";
import { ZoneAccessLabels } from "./ZoneAccessLabels.js";
import { LoreActivityButton } from "../../shared/LoreActivity.js";

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
  const [name, setName] = useState(zone.name);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef<Promise<boolean> | null>(null);
  useLayoutEffect(() => {
    pending.current = null;
  }, [controller.snapshot.isFounded]);
  const cancelled = useRef(false);
  const titleButton = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);
  useLayoutEffect(() => {
    if (!editing && restoreFocus.current) {
      restoreFocus.current = false;
      titleButton.current?.focus();
    }
  }, [editing]);
  const lifetime = useVillageMutationLifetime(controller.snapshot.isFounded, setBusy);
  const save = (): Promise<boolean> => {
    if (pending.current) return pending.current;
    if (cancelled.current || name.trim() === zone.name) {
      setEditing(false);
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
          setEditing(false);
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
    <div className={`${ELEMENT_TAG}-zone-title`}>
      <h2>
        {editing ? (
          <input
            aria-label="Zone name"
            autoFocus
            autoComplete="off"
            maxLength={100}
            value={name}
            disabled={busy}
            onChange={(event) => {
              setName(event.target.value);
              onDirtyChange(event.target.value.trim() !== zone.name);
              setError("");
            }}
            onBlur={() => void save()}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                restoreFocus.current = true;
                void save();
              }
              if (event.key === "Escape") {
                event.preventDefault();
                restoreFocus.current = true;
                cancelled.current = true;
                setName(zone.name);
                setEditing(false);
                setError("");
                onDirtyChange(false);
              }
            }}
          />
        ) : (
          <button
            ref={titleButton}
            type="button"
            aria-label={`Rename ${zone.name}`}
            onClick={() => {
              cancelled.current = false;
              setName(zone.name);
              setEditing(true);
            }}
          >
            {zone.name}
            <span aria-hidden="true"> ✎</span>
          </button>
        )}
      </h2>
      {busy ? <small role="status">Saving name…</small> : null}
      {error ? <p role="alert">{error}</p> : null}
    </div>
  );
}

function ZoneArtwork({
  place,
  zone,
  controller,
  night,
}: {
  night: boolean;
  place: VillageVenue;
  zone: VenueDisplayZone;
  controller: VenueScreenController;
}) {
  const { busy, placeBusyId, drawPlaceImage, keepPlaceImage, dropPlaceImage } = controller;
  const upload = useRef<HTMLInputElement>(null);
  const artwork = zone.dayNight && zone.nightImage && night ? zone.nightImage : zone.image;
  const disabled = busy || !!placeBusyId;
  return (
    <>
      <div className={`${ELEMENT_TAG}-zone-artwork-frame`}>
        {artwork ? (
          <ArtworkImage
            className={`${ELEMENT_TAG}-venue-profile-image`}
            src={artwork.url}
            alt={`${zone.name} at ${place.name}`}
          />
        ) : (
          <div className={`${ELEMENT_TAG}-venue-image-empty`}>No artwork yet</div>
        )}
      </div>
      <div className={`${ELEMENT_TAG}-zone-artwork-actions`}>
        {zone.pictureRetryAvailable ? (
          <button
            type="button"
            className={`${ELEMENT_TAG}-button ${ELEMENT_TAG}-zone-artwork-retry`}
            disabled={disabled}
            onClick={() => void controller.retryZonePicture(place, zone.id)}
          >
            Retry artwork
          </button>
        ) : null}
        <details
          className={`${ELEMENT_TAG}-picture-menu`}
          onClick={(event) => {
            if (event.target instanceof Element && event.target.closest("button,a")) {
              event.currentTarget.open = false;
              event.currentTarget.querySelector("summary")?.focus();
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              event.currentTarget.open = false;
              event.currentTarget.querySelector("summary")?.focus();
            }
          }}
        >
          <summary role="button" aria-label="Picture">
            Picture <span aria-hidden="true">▾</span>
          </summary>
          <div>
            {artwork && galleryArtworkVariant(artwork.url, 1024) ? (
              <a className={`${ELEMENT_TAG}-button`} href={artwork.url} target="_blank" rel="noreferrer">
                Open full size
              </a>
            ) : null}
            <button
              type="button"
              aria-label="Generate new picture"
              className={`${ELEMENT_TAG}-button`}
              disabled={disabled || zone.pictureGenerateAvailable === false}
              onClick={() => void drawPlaceImage(place.id, zone.id)}
            >
              {zone.image ? "Generate new" : "Generate"}
            </button>
            <button
              type="button"
              aria-label="Upload image reference"
              className={`${ELEMENT_TAG}-button`}
              disabled={disabled}
              onClick={() => upload.current?.click()}
            >
              Upload reference
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
                aria-label="Remove artwork"
                className={`${ELEMENT_TAG}-button`}
                disabled={disabled}
                onClick={() => void dropPlaceImage(place.id, zone.id)}
              >
                Remove
              </button>
            ) : null}
            <LoreActivityButton query={`Zone artwork · ${place.name} · ${zone.name}`} />
          </div>
        </details>
      </div>
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
      ) : null}
    </>
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

export function VenueScreen({ controller, fromMap = false }: { controller: VenueScreenController; fromMap?: boolean }) {
  const confirmVillages = useConfirmation();
  const [connectionsOpen, setConnectionsOpen] = useState(false);
  const [zoneNameDirty, setZoneNameDirty] = useState(false);
  const [zoneEditorKey, setZoneEditorKey] = useState(0);
  const zoneNameEditor = useRef<{ save(): Promise<boolean> }>(null);
  const profile = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const connectionsButton = useRef<HTMLButtonElement>(null);
  const connectionsBack = useRef<HTMLButtonElement>(null);
  useLetterFont(fromMap ? "lora" : undefined);
  const {
    snapshot,
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
    nameOfCharacter,
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
    const scrollArea = profile.current?.parentElement;
    if (scrollArea) scrollArea.scrollTop = 0;
    if (connectionsOpen) connectionsBack.current?.focus({ preventScroll: true });
  }, [venueSection, connectionsOpen]);
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
    if (zoneNameDirty) {
      setZoneNameDirty(false);
      setZoneEditorKey((value) => value + 1);
    }
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
  const residents =
    place.residentIds ?? (place.occupancy.residentCharacterId ? [place.occupancy.residentCharacterId] : []);
  const entrance = place.zones?.find((zone) => zone.kind === "exterior");
  const entranceArt =
    (snapshot.isFounded && lighting === "night" && entrance?.dayNight ? entrance.nightImage : null) ??
    entrance?.image ??
    place.presentation.image;
  const zoneArt =
    selected &&
    ((snapshot.isFounded && lighting === "night" && selected.dayNight ? selected.nightImage : null) ?? selected.image);
  const browsing = venueSection === "zones";
  const backdrop = (browsing ? zoneArt : null) ?? entranceArt;
  const map = snapshot.settings.maps?.find((entry) => entry.id === place.presentation.mapId);
  const visit = () =>
    activeScene && room.placeId === place.id ? setScreen("room") : void openRoom(place, exterior?.id);
  const about = venueSection === "about";
  const returnToMap = async () => {
    if (await canLeave()) leaveVenue(fromMap ? undefined : "map");
  };
  const closeConnections = async () => {
    if (!(await canLeave())) return;
    setConnectionsOpen(false);
    requestAnimationFrame(() => connectionsButton.current?.focus({ preventScroll: true }));
  };
  return (
    <WorkspaceShell beforeLeave={canLeave} disabled={navigationBusy}>
      <section
        ref={profile}
        className={`${ELEMENT_TAG}-venue-profile`}
        aria-label="Venue"
        onKeyDown={(event) => {
          if (
            !fromMap ||
            event.key !== "Escape" ||
            event.defaultPrevented ||
            (event.target instanceof Element && event.target.closest("dialog[open], details[open]"))
          )
            return;
          event.preventDefault();
          event.stopPropagation();
          if (connectionsOpen) void closeConnections();
          else void returnToMap();
        }}
      >
        {backdrop ? (
          <figure className={ELEMENT_TAG + "-venue-photo"}>
            <ArtworkImage src={backdrop.url} alt={browsing && zoneArt ? selected.name : place.name} />
          </figure>
        ) : null}
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
                  if (connectionsOpen) await closeConnections();
                  return;
                }
                if (!(await canLeave())) return;
                setConnectionsOpen(false);
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
                {place.occupancy.playerHome || residents.length ? (
                  <div className={`${ELEMENT_TAG}-venue-occupants`}>
                    <h2>Lives here</h2>
                    <p>
                      {[
                        ...(place.occupancy.playerHome ? [playerDisplayName(snapshot)] : []),
                        ...residents.filter((id) => id !== "player").map(nameOfCharacter),
                      ].join(", ")}
                    </p>
                  </div>
                ) : null}
                {place.workerIds?.length ? (
                  <div className={`${ELEMENT_TAG}-venue-occupants`}>
                    <h2>Works here</h2>
                    <p>{place.workerIds.map(nameOfCharacter).join(", ")}</p>
                  </div>
                ) : null}
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
            <section className={ELEMENT_TAG + "-venue-zone-picker"} aria-label="Zones">
              {zones.map((zone) => (
                <button
                  key={zone.id}
                  type="button"
                  aria-pressed={zone.id === selected?.id}
                  onClick={() => setVenueZoneKey(zone.id)}
                >
                  <span>{zone.name}</span>
                  <ZoneAccessLabels zone={zone} hideOpen />
                </button>
              ))}
              {selected && selected.kind !== "exterior" && !zoneArt ? <p>No artwork yet.</p> : null}
            </section>
          ) : null}
          {venueSection === "manage" && connectionsOpen && selected ? (
            <section className={ELEMENT_TAG + "-venue-connections"} aria-label="Zone connections">
              <div className={ELEMENT_TAG + "-venue-connections-heading"}>
                <h2>Zone connections</h2>
                <button
                  ref={connectionsBack}
                  type="button"
                  className={ELEMENT_TAG + "-venue-back"}
                  disabled={navigationBusy}
                  onClick={closeConnections}
                >
                  ← Manage
                </button>
              </div>
              <div className={ELEMENT_TAG + "-venue-zones-layout"}>
                <VenueLayoutEditor
                  key={place.id}
                  place={place}
                  controller={controller}
                  zones={zones}
                  selectedId={selected.id}
                  onSelect={async (id) => {
                    if (id === selected.id || !(await canLeave(true))) return;
                    setZoneNameDirty(false);
                    setVenueZoneKey(id);
                  }}
                />
              </div>
              <details className={ELEMENT_TAG + "-venue-zone-settings"}>
                <summary>Zone settings</summary>
                <section className={`${ELEMENT_TAG}-venue-zone-details`} aria-label={selected.name}>
                  {selected.kind !== "exterior" ? (
                    <ZoneName
                      key={place.id + selected.id + ":" + zoneEditorKey}
                      place={place}
                      zone={selected}
                      controller={controller}
                      onDirtyChange={setZoneNameDirty}
                      saveRef={zoneNameEditor}
                    />
                  ) : (
                    <h2>{selected.name}</h2>
                  )}
                  <ZoneArtwork
                    key={selected.id}
                    place={place}
                    zone={selected}
                    controller={controller}
                    night={snapshot.isFounded && lighting === "night"}
                  />
                  <label className={`${ELEMENT_TAG}-zone-picture-freeze`}>
                    <input
                      autoComplete="off"
                      type="checkbox"
                      checked={selected.freezePicture === true}
                      disabled={controller.busy}
                      onChange={(event) =>
                        void controller.setZonePictureFrozen(place, selected.id, event.target.checked)
                      }
                    />
                    Prevent dynamic image updates for this Zone
                  </label>
                  {selected.isPrivate || selected.restricted || !selected.allowed ? (
                    <div className={`${ELEMENT_TAG}-zone-access-details`}>
                      <ZoneAccessLabels zone={selected} hideOpen />
                    </div>
                  ) : null}
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
              </details>
            </section>
          ) : null}
          {venueSection === "manage" && !connectionsOpen ? (
            <section className={ELEMENT_TAG + "-venue-manage"} aria-label="Manage this venue">
              <VenueName place={place} controller={controller} />
              <button
                type="button"
                className={`${ELEMENT_TAG}-venue-primary`}
                disabled={navigationBusy}
                onClick={async () => {
                  if (await canLeave()) planVenueRenovation(place);
                }}
              >
                Plan a renovation
              </button>
              {selected ? (
                <button
                  ref={connectionsButton}
                  type="button"
                  className={ELEMENT_TAG + "-button"}
                  disabled={navigationBusy}
                  onClick={async () => {
                    if (await canLeave(true)) setConnectionsOpen(true);
                  }}
                >
                  Zone connections <span aria-hidden="true">›</span>
                </button>
              ) : null}
              <AssignedVillagers place={place} controller={controller} />
            </section>
          ) : null}
          {placeBusyId === place.id ? <p role="status">Drawing or saving artwork…</p> : null}
          {placeProblem?.id === place.id ? <p role="alert">{placeProblem.text}</p> : null}
          {venueEditError && (venueSection !== "manage" || connectionsOpen) ? (
            <p role="alert">{venueEditError}</p>
          ) : null}
          {venueEditNotice ? <p role="status">{venueEditNotice}</p> : null}
        </main>
      </section>
    </WorkspaceShell>
  );
}
