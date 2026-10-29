import { useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, type Ref } from "react";
import { useConfirmation } from "../../shared/confirmation.js";
import { connectionProblem } from "../../../shared/helpers/zone-contact.js";
import type { VillageVenue } from "../../../shared/contracts/village.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { useVillageMutationLifetime } from "../../shared/mutation-lifetime.js";
import { playerDisplayName } from "../../shared/presentation.js";
import { venueAssignedCountFor, venueCapacityFor, venueClassesFor } from "../../shared/venue.js";
import { WorkspaceShell, type WorkspaceDestination } from "../../shared/WorkspaceShell.js";
import type { VenueScreenController } from "./screen-contracts.js";
import { venueDisplayZones, type VenueDisplayZone } from "./venue-view.js";
import { ZoneAccessLabels } from "./VenueLayout.js";
import { VenueLayoutEditor } from "./VenueLayoutEditor.js";

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
}: {
  place: VillageVenue;
  zone: VenueDisplayZone;
  controller: VenueScreenController;
}) {
  const { busy, placeBusyId, drawPlaceImage, keepPlaceImage, dropPlaceImage } = controller;
  const upload = useRef<HTMLInputElement>(null);
  const disabled = busy || !!placeBusyId;
  const spaceClass = zone.kind === "exterior" ? undefined : zone.venueClass;
  return (
    <>
      <div className={`${ELEMENT_TAG}-zone-artwork-frame`}>
        {zone.image ? (
          <img
            className={`${ELEMENT_TAG}-venue-profile-image`}
            src={zone.image.url}
            alt={`${zone.name} at ${place.name}`}
          />
        ) : (
          <div className={`${ELEMENT_TAG}-venue-image-empty`}>
            {zone.known ? "No artwork yet" : "Artwork has not been shared with you"}
          </div>
        )}
      </div>
      {zone.known ? (
        <div className={`${ELEMENT_TAG}-row`}>
          {zone.pictureRetryAvailable &&
          !zone.freezePicture &&
          controller.snapshot.settings.automaticZonePictures !== false ? (
            <button
              type="button"
              className={`${ELEMENT_TAG}-button`}
              disabled={disabled}
              onClick={() => void controller.retryZonePicture(place, zone.id)}
            >
              Retry artwork
            </button>
          ) : null}
          <button
            type="button"
            className={`${ELEMENT_TAG}-button`}
            disabled={disabled}
            onClick={() => void drawPlaceImage(place.id, spaceClass, zone.ownerId ?? "", zone.id)}
          >
            Regenerate artwork
          </button>
          <button
            type="button"
            className={`${ELEMENT_TAG}-button`}
            disabled={disabled}
            onClick={() => upload.current?.click()}
          >
            Upload artwork
          </button>
          <input
            autoComplete="off"
            ref={upload}
            hidden
            type="file"
            accept="image/*"
            aria-label={`Upload ${zone.name} artwork`}
            disabled={disabled}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              void keepPlaceImage(place.id, file, spaceClass, zone.ownerId ?? "", zone.id);
            }}
          />
          {zone.image ? (
            <button
              type="button"
              className={`${ELEMENT_TAG}-button`}
              disabled={disabled}
              onClick={() => void dropPlaceImage(place.id, spaceClass, zone.ownerId ?? "", zone.id)}
            >
              Remove artwork
            </button>
          ) : null}
        </div>
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
                disabled={venueAssignedCountFor(place) > 0}
                onClick={() => setHousing((open) => !open)}
                aria-expanded={housing}
              >
                Move here
              </button>
              {venueAssignedCountFor(place) > 0 ? <p>Moving into a shared Residence is not available yet.</p> : null}
              {housing && venueAssignedCountFor(place) === 0 ? (
                <div className={`${ELEMENT_TAG}-venue-section`}>
                  <label className={`${ELEMENT_TAG}-label`}>
                    Your destination Private Space
                    <select
                      value={playerMovePrivateZoneId}
                      onChange={(event) => setPlayerMovePrivateZoneId(event.target.value)}
                    >
                      <option value="">No Private Space</option>
                      {place.zones
                        ?.filter(
                          (zone) =>
                            zone.kind === "private-residence" &&
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
  const place = snapshot?.settings.venues.find((venue) => venue.id === venueId);
  const navigationSelection = useMemo(
    () => ({ venueId, venueZoneKey, venueSection }),
    [venueId, venueZoneKey, venueSection],
  );
  const navigation = useVillageMutationLifetime(snapshot?.isFounded, undefined, navigationSelection);
  const navigationBusy = controller.venueEditBusy || !!controller.venueLayouts[venueId ?? ""]?.saving;
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
        const discard = await confirmVillages(
          "Some Zones aren’t connected to Entrance. Discard layout changes and leave?",
          { cancel: "Keep editing", confirm: "Discard and leave" },
        );
        if (!navigation.owns(claim) || !discard) {
          navigation.finish(claim);
          return false;
        }
        if (!(await controller.discardVenueZoneLayout(place.id))) {
          navigation.finish(claim);
          return false;
        }
      } else if ((!room || room.status === "closed") && !(await controller.commitVenueZoneLayout(place.id))) {
        navigation.finish(claim);
        return false;
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
  const zones = venueDisplayZones(place, room);
  const selected =
    zones.find((zone) => zone.id === venueZoneKey) ?? zones.find((zone) => zone.kind === "exterior") ?? zones[0];
  const exterior = zones.find((zone) => zone.kind === "exterior");
  const activeProject = snapshot.projects.find(
    (project) => project.venueId === place.id && project.lifecycle?.phase !== "complete",
  );
  const activeScene = !!room && room.status !== "closed";
  const residents =
    place.residentIds ?? (place.occupancy.residentCharacterId ? [place.occupancy.residentCharacterId] : []);
  const map = snapshot.settings.maps?.find((entry) => entry.id === place.presentation.mapId);
  const visit = () =>
    activeScene && room.placeId === place.id
      ? setScreen("room")
      : void openRoom(place, undefined, "", "outside", exterior?.id);
  const selectPlace = async (id: string) => {
    if (id === place.id) return true;
    if (!(await canLeave())) return false;
    const next = snapshot.settings.venues.find((venue) => venue.id === id);
    if (!next) return false;
    setZoneNameDirty(false);
    controller.openPlace(next);
    return true;
  };
  const navigate = async (destination: WorkspaceDestination) => {
    if (destination === "places" || !(await canLeave())) return;
    if (destination === "people") {
      controller.openMenu("villagers");
      return;
    }
    leaveVenue();
    setZoneNameDirty(false);
    if (destination === "map") controller.goHome();
    else controller.openMenu(destination === "projects" ? "projects" : "index");
  };
  const sidebar = (
    <>
      <h2>Venues</h2>
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
            {entry.presentation.image ? <img src={entry.presentation.image.url} alt="" /> : null}
            <span>
              <strong>{entry.name}</strong>
              <small>{entry.venueType || venueClassesFor(entry).join(" · ")}</small>
            </span>
          </button>
        ))}
      </div>
    </>
  );
  return (
    <WorkspaceShell active="places" onNavigate={navigate} sidebar={sidebar} disabled={navigationBusy}>
      <div className={`${ELEMENT_TAG}-venue-profile`}>
        <header className={`${ELEMENT_TAG}-header ${ELEMENT_TAG}-workspace-venue-header`}>
          {place.presentation.image ? <img src={place.presentation.image.url} alt="" /> : null}
          <div>
            <h1 className={`${ELEMENT_TAG}-title`}>{place.name}</h1>
            {place.form ? <p className={`${ELEMENT_TAG}-subtitle`}>{place.form}</p> : null}
          </div>
          {room && room.status !== "closed" ? (
            <button type="button" className={`${ELEMENT_TAG}-button`} disabled={navigationBusy} onClick={back}>
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
            <section className={`${ELEMENT_TAG}-workspace-about`} aria-label="About this venue">
              <div>
                <p>{place.description || "No description yet."}</p>
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
                {place.occupancy.playerHome || residents.length ? (
                  <p>
                    Lives here ·{" "}
                    {[
                      ...(place.occupancy.playerHome ? [playerDisplayName(snapshot)] : []),
                      ...residents.filter((id) => id !== "player").map(nameOfCharacter),
                    ].join(", ")}
                  </p>
                ) : null}
                {place.workerIds?.length ? <p>Works here · {place.workerIds.map(nameOfCharacter).join(", ")}</p> : null}
              </div>
              <section className={`${ELEMENT_TAG}-workspace-facts`} aria-label="Basic information">
                <h2>Basic information</h2>
                <dl>
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
                  {place.constructionStatus === "worksite" ? (
                    <div>
                      <dt>Status</dt>
                      <dd>Worksite</dd>
                    </div>
                  ) : null}
                  {venueClassesFor(place).includes("residence") ? (
                    <div>
                      <dt>Residents</dt>
                      <dd>
                        {venueAssignedCountFor(place)} / {venueCapacityFor(place)}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </section>
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
                <ZoneArtwork key={selected.id} place={place} zone={selected} controller={controller} />
                <label className={`${ELEMENT_TAG}-zone-picture-freeze`}>
                  <input
                    autoComplete="off"
                    type="checkbox"
                    checked={selected.freezePicture === true}
                    disabled={controller.busy}
                    onChange={(event) => void controller.setZonePictureFrozen(place, selected.id, event.target.checked)}
                  />
                  Freeze picture
                </label>
                <div className={`${ELEMENT_TAG}-venue-zone-heading`}>
                  <div>
                    <ZoneAccessLabels zone={selected} />
                  </div>
                </div>
                {selected.description ? <p>{selected.description}</p> : null}
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
