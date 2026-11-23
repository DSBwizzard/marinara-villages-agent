import { VenueWorkPanel } from "./VenueWorkPanel.js";
import { useVillageLighting } from "../../shared/useVillageLighting.js";
import { useEffect, useId, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, type Ref } from "react";
import type { PlaceDetail } from "../../../shared/contracts/places.js";
import { messageFrom, request } from "../../shared/api.js";
import { useVillageActivity } from "../../shared/activity.js";
import { VenueAccessPanel } from "./VenueAccessPanel.js";
import { invitationLabel } from "../../shared/zone-access.js";
import { useConfirmation } from "../../shared/confirmation.js";
import { connectionProblem } from "../../../shared/helpers/zone-contact.js";
import type { VillageVenue } from "../../../shared/contracts/village.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { ModalDialog } from "../../shared/ModalDialog.js";
import { useVillageMutationLifetime } from "../../shared/mutation-lifetime.js";
import { playerDisplayName } from "../../shared/presentation.js";
import { WorkspaceShell } from "../../shared/WorkspaceShell.js";
import { useLetterFont } from "../../shared/letter-font-css.js";
import type { VenueScreenController } from "./screen-contracts.js";
import { venueDisplayZones, type VenueDisplayZone } from "./venue-view.js";
import { VenueLayoutEditor } from "./VenueLayoutEditor.js";
import { VenueZoneRow } from "../../shared/VenueNavigation.js";
import { AssignedVillagers, VenueProfile } from "../../shared/VenueProfile.js";

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
  editable = true,
}: {
  artworkUrl?: string;
  editable?: boolean;
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
        {editable && zone.pictureRetryAvailable ? (
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
        {editable ? (
          <>
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
          </>
        ) : null}
      </div>
      {editable ? (
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
      ) : null}
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
  const { viewing = true, visible } = useVillageActivity();
  const [editingConnections, setEditingConnections] = useState(false);
  const [editingAccess, setEditingAccess] = useState(false);
  const [venueHoursScope, setVenueHoursScope] = useState(false);
  const [zoneDetails, setZoneDetails] = useState<"open" | "closed" | null>(null);
  const zoneDetailsOpen = zoneDetails === "open";
  const [zoneNameDirty, setZoneNameDirty] = useState(false);
  const zoneNameEditor = useRef<{ save(): Promise<boolean> }>(null);
  const profile = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const connectionsButton = useRef<HTMLButtonElement>(null);
  const subpageBack = useRef<HTMLButtonElement>(null);
  const zoneReturn = useRef<{ row: HTMLButtonElement; scrollArea: HTMLElement | null; scrollTop: number }>(null);
  const [narrative, setNarrative] = useState<{ worldScope: string; detail: PlaceDetail } | null>(null);
  const [locationError, setLocationError] = useState("");
  useLetterFont(fromMap ? "lora" : undefined);
  const {
    snapshot,
    mobile,
    venueId,
    leaveVenue,
    venueSection: savedSection,
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
    loadSnapshot,
  } = controller;
  const lighting = useVillageLighting(snapshot?.village);
  const venue = snapshot?.settings.venues.find((entry) => entry.id === venueId);
  const detail =
    narrative?.worldScope === snapshot?.worldScope && narrative?.detail.id === venueId ? narrative.detail : null;
  const place = venue ?? detail?.location;
  const venueSection = !venue && savedSection === "manage" ? "about" : savedSection;
  useEffect(() => {
    if (venue || !venueId || !snapshot || !viewing || !visible) return;
    let current = true;
    setLocationError("");
    void request<PlaceDetail | { promoted: true; id: string }>("/places/" + encodeURIComponent(venueId))
      .then(async (value) => {
        if (!current) return;
        if ("promoted" in value) {
          setNarrative(null);
          setLocationError("This location is now a Venue. Refresh the Village.");
          await loadSnapshot();
        } else setNarrative({ worldScope: snapshot.worldScope, detail: value });
      })
      .catch((cause) => {
        if (current) {
          setNarrative(null);
          setLocationError(messageFrom(cause, "Could not read this location."));
        }
      });
    return () => {
      current = false;
    };
  }, [venue, venueId, snapshot, viewing, visible, loadSnapshot]);
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
        <h1>{locationError || "Loading location…"}</h1>
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
      <VenueProfile
        profileRef={profile}
        headingRef={fromMap ? heading : undefined}
        name={place.name}
        location={!venue}
        type={!fromMap && (venue || detail?.prepared) ? place.venueType || "Venue" : undefined}
        mapName={map?.name}
        status={place.constructionStatus === "worksite" ? "Worksite" : !venue ? "Location" : undefined}
        entranceImage={entranceArt?.url}
        zoneImage={zoneBackdrop ? { url: zoneBackdrop.url, name: selected.name } : undefined}
        fallback={storybookBackdrop ? (daylightBackdrop ? "day" : "night") : undefined}
        roomBackdrop={zoneDetailsOpen && !!zoneArt}
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
        navigation={
          <>
            <button
              type="button"
              className={`${ELEMENT_TAG}-venue-back`}
              aria-label={fromMap ? "Back to map" : undefined}
              disabled={navigationBusy}
              onClick={returnToMap}
            >
              {fromMap ? "← Map" : "← Locations"}
            </button>
            {activeScene ? (
              <button type="button" className={`${ELEMENT_TAG}-venue-back`} disabled={navigationBusy} onClick={back}>
                Back to Scene
              </button>
            ) : null}
          </>
        }
        tabs={{
          section: venueSection,
          manage: !!venue,
          disabled: navigationBusy,
          onSelect: async (section) => {
            if (section === venueSection) {
              if (zoneDetailsOpen) await closeZoneDetails();
              else if (editingConnections) await closeConnections();
              return;
            }
            if (!(await canLeave())) return;
            setEditingConnections(false);
            setEditingAccess(false);
            setZoneDetails(null);
            zoneReturn.current = null;
            setZoneNameDirty(false);
            setVenueSection(section);
          },
        }}
      >
        {navigationBusy ? <p role="status">Saving…</p> : null}
        {about ? (
          <section
            className={`${ELEMENT_TAG}-workspace-about`}
            aria-label={venue ? "About this venue" : "About this location"}
          >
            <div className={`${ELEMENT_TAG}-venue-summary`}>
              {detail?.description || place.description ? <p>{detail?.description || place.description}</p> : null}
              {venue ? (
                <AssignedVillagers
                  place={place}
                  nameOfCharacter={(id) =>
                    id === "player" ? playerDisplayName(snapshot) : controller.nameOfCharacter(id)
                  }
                />
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
                  aria-label={
                    !roomBusy && (!activeScene || room.placeId !== place.id)
                      ? venue
                        ? "Visit venue"
                        : "Visit location"
                      : undefined
                  }
                  disabled={
                    roomBusy || (!!activeScene && room.placeId !== place.id) || place.constructionStatus === "worksite"
                  }
                  onClick={visit}
                >
                  {roomBusy ? "Opening Scene…" : activeScene && room.placeId === place.id ? "Return to Scene" : "Visit"}
                </button>
              )}
              {!venue && detail?.visited && detail.prepared ? (
                <button
                  type="button"
                  className={`${ELEMENT_TAG}-button`}
                  disabled={roomBusy || activeScene || detail.report}
                  onClick={() => controller.beginPlaceAdmission(detail)}
                >
                  Add as Venue
                </button>
              ) : null}
            </div>
          </section>
        ) : null}
        {browsing ? (
          <div className={`${ELEMENT_TAG}-venue-zone-navigation`}>
            <section className={`${ELEMENT_TAG}-venue-zone-picker`} aria-label="Zones" inert={zoneDetailsOpen}>
              {zones.map((zone) => {
                const image = roomArtwork(zone);
                return (
                  <VenueZoneRow
                    key={zone.id}
                    name={zone.name}
                    image={image?.url}
                    accessLabel={zone.accessLabel}
                    current={zone.id === selected?.id}
                    disabled={navigationBusy}
                    onOpen={(event) => openZoneDetails(zone.id, event.currentTarget)}
                  />
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
                    {venue && selected.kind !== "exterior" ? (
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
                  {selected.seen &&
                  selected.description &&
                  selected.description.trim() !== (detail?.description || place.description)?.trim() ? (
                    <p>{selected.description}</p>
                  ) : null}
                  {selected.accessView?.invitation && (
                    <small>
                      {[
                        invitationLabel(selected.accessView.invitation),
                        controller.nameOfCharacter(selected.accessView.invitation.issuerId),
                        selected.accessView.invitation.accompanied && "Escort required",
                        selected.accessView.invitation.outsideHours && "After hours allowed",
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </small>
                  )}
                  <ZoneArtwork
                    key={selected.id}
                    place={place}
                    zone={selected}
                    controller={controller}
                    artworkUrl={zoneArt?.url}
                    editable={!!venue}
                  />
                  {venue && selected.preparation?.status === "failed" ? (
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
        {venueSection === "manage" && editingAccess ? (
          <VenueAccessPanel
            key={venueHoursScope ? "venue" : selected?.id}
            place={place}
            zone={venueHoursScope ? undefined : selected}
            controller={controller}
            onClose={() => setEditingAccess(false)}
            onSelect={(id) => {
              setVenueHoursScope(!id);
              if (id) void selectRoom(id);
            }}
          />
        ) : null}
        {venueSection === "manage" && !editingConnections && !editingAccess ? (
          <section className={ELEMENT_TAG + "-venue-manage"} aria-label="Manage this venue">
            <VenueName place={place} controller={controller} />
            <VenueWorkPanel key={place.id} place={place} controller={controller} />
            {(place.accessView?.canManage || zones.some((zone) => zone.accessView?.decision.canInvite)) && (
              <button
                type="button"
                className={ELEMENT_TAG + "-button"}
                disabled={navigationBusy}
                onClick={async () => {
                  if (!(await canLeave())) return;
                  const accessZone =
                    zones.find((zone) => zone.id === selected?.id && zone.accessView?.decision.canInvite) ??
                    zones.find((zone) => zone.accessView?.decision.canInvite);
                  setVenueHoursScope(!accessZone);
                  if (accessZone) await selectRoom(accessZone.id);
                  setEditingAccess(true);
                }}
              >
                Access <span aria-hidden="true">›</span>
              </button>
            )}
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
      </VenueProfile>
    </WorkspaceShell>
  );
}
