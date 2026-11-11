import { useVillageLighting } from "../../shared/useVillageLighting.js";
import { useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, type Ref } from "react";
import { useConfirmation } from "../../shared/confirmation.js";
import { connectionProblem } from "../../../shared/helpers/zone-contact.js";
import type { VillageVenue } from "../../../shared/contracts/village.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import { useVillageMutationLifetime } from "../../shared/mutation-lifetime.js";
import { playerDisplayName } from "../../shared/presentation.js";
import { venueAssignedCountFor, venueCapacityFor, venueClassesFor } from "../../shared/venue.js";
import { WorkspaceShell } from "../../shared/WorkspaceShell.js";
import { StorybookHeading } from "../../shared/StorybookHeading.js";
import type { VenueScreenController } from "./screen-contracts.js";
import { venueDisplayZones, type VenueDisplayZone } from "./venue-view.js";
import { VenueLayoutEditor } from "./VenueLayoutEditor.js";
import { ZoneAccessLabels } from "./ZoneAccessLabels.js";
import { LoreActivityButton } from "../../shared/LoreActivity.js";

function VenueName({ place, controller }: { place: VillageVenue; controller: VenueScreenController }) {
  const { venueEditDraft, setVenueEditDraft, venueEditBusy, saveVenueName } = controller;
  const name = venueEditDraft?.id === place.id ? venueEditDraft.name : place.name;
  return (
    <section className={`${ELEMENT_TAG}-venue-section`}>
      <h2>Venue name</h2>
      <label className={`${ELEMENT_TAG}-label`}>
        Venue name
        <input
          autoComplete="off"
          className={`${ELEMENT_TAG}-notice-input`}
          value={name}
          onChange={(event) =>
            setVenueEditDraft((current) => ({
              ...(current?.id === place.id ? current : place),
              name: event.target.value,
            }))
          }
        />
      </label>
      <button
        type="button"
        className={`${ELEMENT_TAG}-button`}
        disabled={venueEditBusy || !name.trim() || name === place.name}
        onClick={() => void saveVenueName(place, name)}
      >
        Save name
      </button>
    </section>
  );
}

function CommunityVenueControl({ place, controller }: { place: VillageVenue; controller: VenueScreenController }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const current = controller.snapshot.settings.venues.find(
    (venue) => venue.id === controller.snapshot.settings.communityVenueId,
  );
  if (place.id === current?.id)
    return (
      <section className={`${ELEMENT_TAG}-venue-section`}>
        <h2>Community Venue</h2>
        <p>
          Public and unowned, with no bans or opening hours. Designate another Venue before changing its use or control.
        </p>
      </section>
    );
  if (!place.accessView?.canDesignateCommunity || !current?.accessView || !controller.snapshot.isFounded) return null;
  return (
    <section className={`${ELEMENT_TAG}-venue-section`}>
      <h2>Community Venue</h2>
      <p>Make this the unowned public meeting place, replacing {current.name}.</p>
      <button
        type="button"
        className={`${ELEMENT_TAG}-button`}
        disabled={busy || controller.venueEditBusy}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            await controller.changeVenueAccess(place.id, {
              action: "community-venue",
              operationId: createVillagesClientId(),
              zoneId: null,
              expectedRevision: place.accessView!.revision,
              previousVenueId: current.id,
              previousRevision: current.accessView!.revision,
            });
          } catch (cause) {
            setError(cause instanceof Error ? cause.message : "The Community Venue could not be changed.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Saving…" : "Use as Community Venue"}
      </button>
      {error ? <p role="alert">{error}</p> : null}
    </section>
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
          <img
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
            if (event.target instanceof Element && event.target.closest("button")) {
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

function AssignedVillagers({
  place,
  controller,
  canLeave,
  navigationBusy,
}: {
  place: VillageVenue;
  controller: VenueScreenController;
  canLeave(): Promise<boolean>;
  navigationBusy: boolean;
}) {
  const [housing, setHousing] = useState(false);
  const {
    snapshot,
    nameOfCharacter,
    playerMovePrivateZoneId,
    setPlayerMovePrivateZoneId,
    requestPlayerMove,
    busy,
    openVenueRequests,
  } = controller;
  const residents = [
    ...new Set(place.residentIds ?? (place.occupancy.residentCharacterId ? [place.occupancy.residentCharacterId] : [])),
  ];
  const workers = place.workerIds ?? [];
  const name = (id: string) => (id === "player" ? playerDisplayName(snapshot) : nameOfCharacter(id));
  const assignment = (id: string, role: string) => {
    const destinations = place.destinations?.[id];
    const ids = role === "Worker" ? [destinations?.work] : [destinations?.home, destinations?.sleep];
    const zones = [...new Set(ids.filter(Boolean))]
      .map((zoneId) => place.zones?.find((zone) => zone.id === zoneId)?.name)
      .filter(Boolean);
    if (!zones.length)
      zones.push(...(place.zones?.filter((zone) => zone.ownerId === id).map((zone) => zone.name) ?? []));
    return (
      <li key={role + id}>
        <strong>{name(id)}</strong>
        <span>
          {role}
          {zones.length ? ` · ${zones.join(", ")}` : ""}
        </span>
      </li>
    );
  };
  return (
    <section className={`${ELEMENT_TAG}-venue-section`}>
      <h2>Assigned Villagers</h2>
      <ul className={`${ELEMENT_TAG}-venue-assignments`}>
        {place.occupancy.playerHome ? assignment("player", "Resident") : null}
        {residents.filter((id) => id !== "player").map((id) => assignment(id, "Resident"))}
        {workers.map((id) => assignment(id, "Worker"))}
      </ul>
      {!residents.length && !workers.length && !place.occupancy.playerHome ? <p>No assigned villagers.</p> : null}
      {venueClassesFor(place).includes("residence") ? (
        <>
          <p>
            {venueAssignedCountFor(place)} of {venueCapacityFor(place)} resident places filled.
          </p>
          <button
            type="button"
            className={`${ELEMENT_TAG}-button`}
            disabled={navigationBusy}
            onClick={async () => {
              if (await canLeave()) openVenueRequests(place.id);
            }}
          >
            View housing requests
          </button>
          {!place.occupancy.playerHome ? (
            <>
              <button
                type="button"
                className={`${ELEMENT_TAG}-button`}
                disabled={venueAssignedCountFor(place) >= venueCapacityFor(place)}
                onClick={() => setHousing((open) => !open)}
                aria-expanded={housing}
              >
                Move here
              </button>
              {housing && venueAssignedCountFor(place) < venueCapacityFor(place) ? (
                <div className={`${ELEMENT_TAG}-venue-section`}>
                  <label className={`${ELEMENT_TAG}-label`}>
                    Your sleeping Zone
                    <select
                      value={playerMovePrivateZoneId}
                      onChange={(event) => setPlayerMovePrivateZoneId(event.target.value)}
                    >
                      <option value="">Choose shared sleeping space automatically</option>
                      {place.zones
                        ?.filter(
                          (zone) =>
                            zone.venueClass === "residence" &&
                            zone.kind !== "exterior" &&
                            !zone.ownerId &&
                            !zone.closed &&
                            !snapshot.residences.some(
                              (move) =>
                                move.status === "moving" &&
                                move.proposedVenueId === place.id &&
                                move.proposedPrivateZoneId === zone.id,
                            ),
                        )
                        .map((zone) => (
                          <option key={zone.id} value={zone.id}>
                            {zone.name}
                          </option>
                        ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    className={`${ELEMENT_TAG}-button`}
                    disabled={busy}
                    onClick={() => void requestPlayerMove(place.id, playerMovePrivateZoneId)}
                  >
                    Move in
                  </button>
                </div>
              ) : null}
            </>
          ) : null}
        </>
      ) : null}
    </section>
  );
}

export function VenueScreen({ controller }: { controller: VenueScreenController }) {
  const confirmVillages = useConfirmation();
  const [zoneNameDirty, setZoneNameDirty] = useState(false);
  const [zoneEditorKey, setZoneEditorKey] = useState(0);
  const zoneNameEditor = useRef<{ save(): Promise<boolean> }>(null);
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
  const backdrop =
    snapshot.isFounded && lighting === "night" && entrance?.dayNight && entrance.nightImage
      ? entrance.nightImage
      : place.presentation.image;
  const map = snapshot.settings.maps?.find((entry) => entry.id === place.presentation.mapId);
  const visit = () =>
    activeScene && room.placeId === place.id ? setScreen("room") : void openRoom(place, exterior?.id);
  const selectPlace = async (id: string) => {
    if (id === place.id) return true;
    if (!(await canLeave())) return false;
    const next = snapshot.settings.venues.find((venue) => venue.id === id);
    if (!next) return false;
    setZoneNameDirty(false);
    controller.openPlace(next);
    return true;
  };
  const sidebar = (
    <>
      <StorybookHeading as="h2">Places</StorybookHeading>
      <label className={`${ELEMENT_TAG}-workspace-venue-picker`}>
        Venue
        <select
          disabled={navigationBusy}
          value={place.id}
          onChange={async (event) => {
            const select = event.currentTarget;
            if (!(await selectPlace(select.value))) select.value = place.id;
          }}
        >
          {snapshot.settings.venues.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.name}
            </option>
          ))}
        </select>
      </label>
      <div className={`${ELEMENT_TAG}-workspace-venues`} role="group" aria-label="Venues">
        {snapshot.settings.venues.map((entry) => (
          <button
            key={entry.id}
            type="button"
            disabled={navigationBusy}
            aria-pressed={entry.id === place.id}
            onClick={() => selectPlace(entry.id)}
          >
            <span>
              <strong>{entry.name}</strong>
            </span>
            <span aria-hidden="true">›</span>
          </button>
        ))}
      </div>
    </>
  );
  return (
    <WorkspaceShell sidebar={sidebar} beforeLeave={canLeave} disabled={navigationBusy}>
      <div className={`${ELEMENT_TAG}-venue-profile`}>
        <header className={`${ELEMENT_TAG}-header ${ELEMENT_TAG}-workspace-venue-header`}>
          <button
            type="button"
            className={`${ELEMENT_TAG}-venue-back`}
            disabled={navigationBusy}
            onClick={async () => {
              if (await canLeave()) leaveVenue("map");
            }}
          >
            ← Back to map
          </button>
          <div>
            <h1 className={`${ELEMENT_TAG}-title`}>{place.name}</h1>
            <dl className={`${ELEMENT_TAG}-venue-metadata`} aria-label="Venue details">
              <div>
                <dt>Type</dt>
                <dd>{place.venueType || venueClassesFor(place).join(" · ") || "Venue"}</dd>
              </div>
              {map ? (
                <div>
                  <dt>Map</dt>
                  <dd>{map.name}</dd>
                </div>
              ) : null}
              {snapshot.settings.communityVenueId === place.id ? (
                <div>
                  <dt>Use</dt>
                  <dd>Community Venue</dd>
                </div>
              ) : null}
              {place.constructionStatus === "worksite" ? (
                <div>
                  <dt>Status</dt>
                  <dd>Worksite</dd>
                </div>
              ) : null}
            </dl>
          </div>
          {activeScene ? (
            <button type="button" className={`${ELEMENT_TAG}-venue-back`} disabled={navigationBusy} onClick={back}>
              Back to Scene
            </button>
          ) : null}
        </header>
        <nav className={`${ELEMENT_TAG}-venue-sections`} aria-label="Venue sections">
          {(["about", "zones", "manage"] as const).map((section) => (
            <button
              type="button"
              key={section}
              disabled={navigationBusy}
              aria-pressed={venueSection === section}
              onClick={async () => {
                if (section === venueSection || !(await canLeave())) return;
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
          {venueSection === "about" ? (
            <section className={`${ELEMENT_TAG}-workspace-about`} data-photo={!!backdrop} aria-label="About this venue">
              {backdrop ? (
                <figure className={`${ELEMENT_TAG}-venue-photo`}>
                  <img src={backdrop.url} alt={place.name} />
                </figure>
              ) : null}
              <div className={`${ELEMENT_TAG}-venue-summary`}>
                <p className={`${ELEMENT_TAG}-venue-description`}>{place.description || "No description yet."}</p>
                {place.form ? <p className={`${ELEMENT_TAG}-venue-form`}>{place.form}</p> : null}
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
                {venueClassesFor(place).includes("residence") ? (
                  <p className={`${ELEMENT_TAG}-venue-capacity`}>
                    Residents · {venueAssignedCountFor(place)} / {venueCapacityFor(place)}
                  </p>
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
                        : "Visit venue"}
                  </button>
                )}
              </div>
            </section>
          ) : null}
          {venueSection === "zones" && selected ? (
            <section className={`${ELEMENT_TAG}-venue-zones-workspace`} aria-label="Zones">
              <div className={`${ELEMENT_TAG}-venue-zones-layout`}>
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
                    onChange={(event) => void controller.setZonePictureFrozen(place, selected.id, event.target.checked)}
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
            </section>
          ) : null}
          {venueSection === "manage" ? (
            <section aria-label="Manage this venue">
              <VenueName place={place} controller={controller} />
              <CommunityVenueControl key={`community:${place.id}`} place={place} controller={controller} />
              <section className={`${ELEMENT_TAG}-venue-section`}>
                <h2>Layout & renovations</h2>
                <p>Changes to physical form, Zones, capacity or use require a Project.</p>
                <button
                  type="button"
                  className={`${ELEMENT_TAG}-venue-primary`}
                  disabled={navigationBusy}
                  onClick={async () => {
                    if (await canLeave()) planVenueRenovation(place);
                  }}
                >
                  Plan a renovation →
                </button>
              </section>
              <AssignedVillagers
                key={place.id}
                place={place}
                controller={controller}
                canLeave={canLeave}
                navigationBusy={navigationBusy}
              />
            </section>
          ) : null}
          {placeBusyId === place.id ? <p role="status">Drawing or saving artwork…</p> : null}
          {placeProblem?.id === place.id ? <p role="alert">{placeProblem.text}</p> : null}
          {venueEditError ? <p role="alert">{venueEditError}</p> : null}
          {venueEditNotice ? <p role="status">{venueEditNotice}</p> : null}
        </main>
      </div>
    </WorkspaceShell>
  );
}
