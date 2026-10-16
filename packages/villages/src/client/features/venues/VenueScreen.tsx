import { useState, useRef } from "react";
import type { VillageVenue } from "../../../shared/contracts/village.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { playerDisplayName } from "../../shared/presentation.js";
import { venueAssignedCountFor, venueCapacityFor, venueClassesFor } from "../../shared/venue.js";
import type { VenueScreenController } from "./screen-contracts.js";
import { useVillageMutationLifetime } from "../../shared/mutation-lifetime.js";
import { venueDisplayZones, type VenueDisplayZone } from "./venue-view.js";
import { VenueLayout, ZoneAccessLabels } from "./VenueLayout.js";

function VenueName({ place, controller }: { place: VillageVenue; controller: VenueScreenController }) {
  const { venueEditDraft, setVenueEditDraft, venueEditBusy, saveVenueName } = controller;
  const name = venueEditDraft?.id === place.id ? venueEditDraft.name : place.name;
  return (
    <section className={`${ELEMENT_TAG}-venue-section`}>
      <h2>Venue name</h2>
      <label className={`${ELEMENT_TAG}-label`}>
        Venue name
        <input
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
}: {
  place: VillageVenue;
  zone: VenueDisplayZone;
  controller: VenueScreenController;
}) {
  const [name, setName] = useState(zone.name);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const lifetime = useVillageMutationLifetime(controller.snapshot.isFounded, setBusy);
  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        const claim = lifetime.begin();
        if (!claim) return;
        claim.onRetire = () => setBusy(false);
        setBusy(true);
        setNotice("");
        try {
          const saved = await controller.saveVenueZone(place.id, zone.id, { name: name.trim() });
          if (lifetime.owns(claim) && saved) setNotice("Zone name saved.");
        } catch {
          if (lifetime.owns(claim)) setNotice("The zone name could not be saved. Try again.");
        } finally {
          if (lifetime.finish(claim)) setBusy(false);
        }
      }}
    >
      <label className={`${ELEMENT_TAG}-label`}>
        Zone name
        <input
          className={`${ELEMENT_TAG}-notice-input`}
          maxLength={100}
          value={name}
          disabled={busy}
          onChange={(event) => {
            setName(event.target.value);
            setNotice("");
          }}
        />
      </label>
      <button
        type="submit"
        className={`${ELEMENT_TAG}-button`}
        disabled={busy || !name.trim() || name.trim() === zone.name}
      >
        {busy ? "Saving�" : "Save zone name"}
      </button>
      {notice ? <p role="status">{notice}</p> : null}
    </form>
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

function AssignedVillagers({ place, controller }: { place: VillageVenue; controller: VenueScreenController }) {
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
          <button type="button" className={`${ELEMENT_TAG}-button`} onClick={() => openVenueRequests(place.id)}>
            View housing requests
          </button>
          {!place.occupancy.playerHome ? (
            <>
              <button
                type="button"
                className={`${ELEMENT_TAG}-button`}
                onClick={() => setHousing((open) => !open)}
                aria-expanded={housing}
              >
                Request to live here
              </button>
              {housing ? (
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
                    Send housing request
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
  const back = () => {
    const draft = controller.venueEditDraft;
    if (
      draft &&
      draft.id === place?.id &&
      draft.name !== place.name &&
      !window.confirm("Discard the unsaved Venue name?")
    )
      return;
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
  const visit = () =>
    activeScene && room.placeId === place.id
      ? setScreen("room")
      : void openRoom(place, undefined, "", "outside", exterior?.id);
  return (
    <div className={`${ELEMENT_TAG}-root ${ELEMENT_TAG}-venue-profile`}>
      <header className={`${ELEMENT_TAG}-header`}>
        <div>
          <span className={`${ELEMENT_TAG}-venue-kicker`}>{place.venueType || venueClassesFor(place).join(" · ")}</span>
          <h1 className={`${ELEMENT_TAG}-title`}>{place.name}</h1>
          {place.form ? <p className={`${ELEMENT_TAG}-subtitle`}>{place.form}</p> : null}
        </div>
        <button type="button" className={`${ELEMENT_TAG}-button`} onClick={back}>
          {room && room.status !== "closed" ? "Back to Scene" : "Back"}
        </button>
      </header>
      <nav className={`${ELEMENT_TAG}-venue-sections`} aria-label="Venue sections">
        {(["about", "zones", "manage"] as const).map((section) => (
          <button
            type="button"
            key={section}
            aria-pressed={venueSection === section}
            onClick={() => setVenueSection(section)}
          >
            {section === "about" ? "About" : section === "zones" ? "Zones" : "Manage"}
          </button>
        ))}
      </nav>
      <main className={`${ELEMENT_TAG}-venue-profile-body`}>
        {venueSection === "about" ? (
          <section aria-label="About this venue">
            {place.presentation.image ? (
              <img
                className={`${ELEMENT_TAG}-venue-profile-image`}
                src={place.presentation.image.url}
                alt={place.name}
              />
            ) : null}
            <h2>About this venue</h2>
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
                  roomBusy || (!!activeScene && room.placeId !== place.id) || place.constructionStatus === "worksite"
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
          </section>
        ) : null}
        {venueSection === "zones" && selected ? (
          <section aria-label="Zones">
            <VenueLayout zones={zones} selectedId={selected.id} onSelect={setVenueZoneKey} />
            <section className={`${ELEMENT_TAG}-venue-zone-details`} aria-label={selected.name}>
              <label className={`${ELEMENT_TAG}-zone-picture-freeze`}>
                <input
                  type="checkbox"
                  checked={selected.freezePicture === true}
                  disabled={controller.busy}
                  onChange={(event) => void controller.setZonePictureFrozen(place, selected.id, event.target.checked)}
                />
                Freeze picture
              </label>
              <div className={`${ELEMENT_TAG}-venue-zone-heading`}>
                <h2>{selected.name}</h2>
                <div>
                  <ZoneAccessLabels zone={selected} />
                </div>
              </div>
              <ZoneArtwork key={selected.id} place={place} zone={selected} controller={controller} />
              {selected.description ? <p>{selected.description}</p> : null}
              {selected.kind !== "exterior" ? (
                <ZoneName key={place.id + selected.id} place={place} zone={selected} controller={controller} />
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
            <section className={`${ELEMENT_TAG}-venue-section`}>
              <h2>Layout & renovations</h2>
              <p>Changes to physical form, Zones, connections, capacity or use require a Project.</p>
              <button
                type="button"
                className={`${ELEMENT_TAG}-venue-primary`}
                onClick={() => planVenueRenovation(place)}
              >
                Plan a renovation →
              </button>
            </section>
            <AssignedVillagers key={place.id} place={place} controller={controller} />
          </section>
        ) : null}
        {placeBusyId === place.id ? <p role="status">Drawing or saving artwork…</p> : null}
        {placeProblem?.id === place.id ? <p role="alert">{placeProblem.text}</p> : null}
        {venueEditError ? <p role="alert">{venueEditError}</p> : null}
        {venueEditNotice ? <p role="status">{venueEditNotice}</p> : null}
      </main>
    </div>
  );
}
