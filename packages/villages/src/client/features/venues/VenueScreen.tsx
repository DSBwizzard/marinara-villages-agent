import type { VenueClass, VillageVenue, VillageVenueImage } from "../../../shared/contracts/village.js";
import { editableVenueFields } from "./edit-fields.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { buildingOf, playerDisplayName, venueTitle } from "../../shared/presentation.js";
import type { VenueViewZone } from "../../shared/types.js";
import { venueAssignedCountFor, venueCapacityFor, venueClassesFor, venueSpaceFor } from "../../shared/venue.js";
import type { VenueScreenController } from "./screen-contracts.js";
import { BackgroundWorkPanel } from "../background/BackgroundPanel.js";
import { VENUE_CLASS_CHOICES, VenueDraftFields, VenueZoneEditor } from "./VenuePanels.js";
import { VenueAccessPanel } from "./villages-venue-access";

export function VenueScreen({ controller }: { controller: VenueScreenController }) {
  const {
    busy,
    saveVenueImageContext,
    saveVenueDetails,
    proposeRoomEdit,
    requestPlayerMove,
    changeVenueAccess,
    retryPrivateSpacePreparation,
    saveVenueZone,
    proposeResidenceMove,
    submitVenueProposal,
    drawPlaceImage,
    dropPlaceImage,
    homeBuildings,
    keepPlaceImage,
    leaveVenue,
    movePrivateZoneId,
    moveTargetId,
    nameOfCharacter,
    openRoom,
    placeBusyId,
    placeProblem,
    playerMovePrivateZoneId,
    retryWork,
    room,
    roomBusy,
    screen,
    setMovePrivateZoneId,
    setMoveTargetId,
    setPlayerMovePrivateZoneId,
    setScreen,
    setVenueEditDraft,
    setVenueEditError,
    setVenueEditNotice,
    setVenuePage,
    setVenueProposalDraft,
    setVenueZoneKey,
    snapshot,
    standingAt,
    venueEditBusy,
    venueEditDraft,
    venueEditError,
    venueEditNotice,
    venueId,
    venuePage,
    venueProposalDraft,
    venueZoneKey,
  } = controller;

  if (screen === "venue") {
    const place = (snapshot?.settings.venues ?? []).find((entry) => entry.id === venueId) ?? null;
    if (!snapshot || !place) {
      return (
        <div className={`${ELEMENT_TAG}-root`}>
          <header className={`${ELEMENT_TAG}-header`}>
            <div>
              <h1 className={`${ELEMENT_TAG}-title`}>A place that is gone</h1>
              <p className={`${ELEMENT_TAG}-subtitle`}>This venue is no longer in the village.</p>
            </div>
            <button type="button" className={`${ELEMENT_TAG}-button`} onClick={leaveVenue}>
              Back to map
            </button>
          </header>
        </div>
      );
    }
    const here = standingAt(place.id);
    const classes = venueClassesFor(place);
    const building = place.occupancy.homeKind ? buildingOf(homeBuildings, place.occupancy.homeKind).name : "";
    const occupant = place.occupancy.playerHome
      ? playerDisplayName(snapshot)
      : nameOfCharacter(place.occupancy.residentCharacterId);
    const residentIds =
      place.residentIds ?? (place.occupancy.residentCharacterId ? [place.occupancy.residentCharacterId] : []);
    const occupiedResidence = classes.includes("residence") && residentIds.length > 0;
    const liveShared = room?.placeId === place.id && (room.area === "shared" || room.area === "private");
    const livePrivateOwner = room?.placeId === place.id && room.area === "private" ? room.privateOwnerId : "";
    const canViewShared = place.occupancy.playerHome || place.playerSeenShared || liveShared;
    const _privateSpaces = (place.privateSpaces ?? []).filter(
      (space) => place.playerSeenPrivateIds?.includes(space.ownerId) || space.ownerId === livePrivateOwner,
    );
    const activeRoom = room?.status !== "closed" && room?.id ? room : null;
    const sharedInvitation = (place.playerInvitations ?? []).some((entry) => residentIds.includes(entry.residentId));
    const legacyZones: VenueViewZone[] = [
      {
        key: "exterior",
        label: "Exterior",
        subtitle: "Exterior / grounds",
        area: "outside",
        spaceClass: classes[0]!,
        ownerId: "",
        image: place.presentation.image,
        description: place.form || building || `The outside of ${place.name}.`,
        state: place.exteriorState,
        locked: false,
        canEnter: true,
        accessLabel: "Open (no restrictions)",
      },
      ...classes.map((item): VenueViewZone => {
        const space = venueSpaceFor(place, item);
        const residence = item === "residence";
        const locked = residence
          ? !canViewShared
          : !place.playerSeenPublic && !(activeRoom?.placeId === place.id && activeRoom.area === "public");
        const canEnter = !residence || !occupiedResidence || place.occupancy.playerHome || sharedInvitation;
        return {
          key: `class:${item}`,
          label: "Common Space",
          subtitle: residence ? "Common Space" : `${item[0]!.toUpperCase()}${item.slice(1)} space`,
          area: residence ? "shared" : "public",
          spaceClass: item,
          ownerId: "",
          image: locked ? null : space.image,
          description: locked ? "" : space.description,
          state: locked ? undefined : space.state,
          locked,
          canEnter,
          accessLabel: canEnter ? "Open to visit" : "Resident invitation required",
        };
      }),
      ...(place.privateSpaces ?? [])
        .filter((space) => residentIds.includes(space.ownerId))
        .map((space): VenueViewZone => {
          const ownerName = nameOfCharacter(space.ownerId);
          const locked = !place.playerSeenPrivateIds?.includes(space.ownerId) && space.ownerId !== livePrivateOwner;
          const canEnter = (place.playerInvitations ?? []).some(
            (entry) =>
              entry.scope === "private" && entry.ownerId === space.ownerId && entry.residentId === space.ownerId,
          );
          return {
            key: `private:${space.ownerId}`,
            label: `${ownerName}'s Private Space`,
            subtitle: "Restricted Zone",
            area: "private",
            spaceClass: "residence",
            ownerId: space.ownerId,
            image: locked ? null : space.image,
            description: locked ? "" : space.description,
            state: locked ? undefined : space.state,
            locked,
            canEnter,
            accessLabel: canEnter ? "Owner's invitation available" : "Owner's invitation required",
            adaptationPending: !locked && space.adaptationPending,
          };
        }),
    ];
    const zones: VenueViewZone[] = place.zones
      ? place.zones.map((zone) => {
          const area =
            zone.kind === "exterior"
              ? "outside"
              : zone.kind === "private-residence"
                ? "private"
                : zone.kind === "shared-residence"
                  ? "shared"
                  : "public";
          const locked =
            zone.kind !== "exterior" &&
            !zone.seen &&
            !(place.occupancy.playerHome && zone.kind === "shared-residence") &&
            !(activeRoom?.placeId === place.id && activeRoom.zoneId === zone.id);
          const invited =
            zone.relationshipAccess ||
            place.playerInvitations?.some((invitation) => invitation.zoneId === zone.id) ||
            (activeRoom?.placeId === place.id && activeRoom.grantedZoneIds?.includes(zone.id));
          const canEnter = zone.accessView
            ? zone.accessView.decision.allowed
            : !zone.closed &&
              (zone.kind === "exterior" ||
                zone.kind === "public" ||
                ((zone.kind === "shared-residence" ||
                  (zone.kind === "private-residence" && zone.ownerId === "player")) &&
                  place.occupancy.playerHome) ||
                !!invited ||
                (zone.kind === "restricted" && !!zone.controllerIds?.includes("player")));
          return {
            key: zone.id,
            purpose: zone.purpose,
            zoneId: zone.id,
            label: zone.accessView
              ? zone.name
              : zone.kind === "private-residence"
                ? zone.ownerId === "player"
                  ? "Your Private Space"
                  : zone.ownerId
                    ? nameOfCharacter(zone.ownerId) + "'s Private Space"
                    : zone.name + " (vacant)"
                : zone.name,
            subtitle: zone.accessView
              ? zone.purpose || "Zone"
              : zone.kind === "staff"
                ? "Staff Zone"
                : zone.kind === "shared-residence"
                  ? "Common Space"
                  : zone.kind === "private-residence"
                    ? "Residential Private Space"
                    : zone.kind === "exterior"
                      ? "Exterior / grounds"
                      : "Public Zone",
            area,
            spaceClass: zone.venueClass,
            ownerId: zone.ownerId ?? "",
            image: locked ? null : zone.image,
            description: locked ? "" : zone.description,
            state: locked ? undefined : zone.state,
            locked,
            canEnter,
            accessLabel: zone.accessView
              ? zone.accessView.decision.explanation
              : zone.closed
                ? "Closed for Renovation"
                : zone.kind === "exterior" || zone.kind === "public"
                  ? "Open to everyone"
                  : zone.relationshipAccess
                    ? "Ongoing relationship access"
                    : invited
                      ? "Permission for this Scene"
                      : zone.kind === "private-residence"
                        ? "Owner's invitation required"
                        : zone.kind === "staff"
                          ? "Workers and invited guests"
                          : zone.kind === "restricted"
                            ? "Assigned controllers and invited guests"
                            : "Residents and invited guests",
          };
        })
      : legacyZones;
    const selectedZone = zones.find((zone) => zone.key === venueZoneKey) ?? zones[0]!;
    const privateSpace = place.zones?.find((zone) => zone.id === selectedZone.zoneId);
    const privatePreparation = privateSpace?.preparation;
    const privateControllers =
      privateSpace?.kind === "staff"
        ? (place.workerIds ?? [])
        : privateSpace?.kind === "private-residence"
          ? [privateSpace.ownerId ?? ""]
          : (privateSpace?.controllerIds ?? []);
    const zoneProposals = (place.editProposals ?? []).filter((proposal) =>
      proposal.zoneId
        ? proposal.zoneId === selectedZone.zoneId
        : selectedZone.area === "shared"
          ? proposal.target === "shared"
          : selectedZone.area === "private" &&
            proposal.target === "private" &&
            proposal.ownerId === selectedZone.ownerId,
    );
    const zoneDescription =
      selectedZone.description && selectedZone.description !== place.form && selectedZone.description !== building
        ? selectedZone.description
        : "";
    const hasZoneDetails =
      !selectedZone.locked &&
      Boolean(
        zoneDescription ||
        selectedZone.adaptationPending ||
        selectedZone.state?.condition ||
        selectedZone.state?.items.length ||
        selectedZone.state?.publicFacts.length ||
        selectedZone.state?.features.length ||
        (selectedZone.area === "outside" && snapshot.village.setting) ||
        zoneProposals.length,
      );
    const activeZoneIsSelected = Boolean(
      activeRoom?.placeId === place.id &&
      (selectedZone.zoneId ? activeRoom.zoneId === selectedZone.zoneId : activeRoom.area === selectedZone.area) &&
      (selectedZone.zoneId
        ? activeRoom.zoneId === selectedZone.zoneId
        : selectedZone.area === "outside" || activeRoom.spaceClass === selectedZone.spaceClass) &&
      (selectedZone.area !== "private" || activeRoom.privateOwnerId === selectedZone.ownerId),
    );
    const imagePanel = (
      label: string,
      image: VillageVenueImage | null,
      spaceClass?: VenueClass,
      ownerId = "",
      zoneId?: string,
    ) => (
      <section className={`${ELEMENT_TAG}-venue-card`} key={zoneId || ownerId || spaceClass || "exterior"}>
        <h3 className={`${ELEMENT_TAG}-panel-title`}>{label}</h3>
        <details>
          <summary>What informs this Zone’s artwork?</summary>
          <p>
            Venue Type: {place.venueType || "Not set"}. Physical form: {place.form || "Not set"}.
          </p>
          <p>
            Used for: {place.zones?.find((zone) => zone.id === zoneId)?.purpose || "Arrival and approach"}. Appearance:{" "}
            {place.zones?.find((zone) => zone.id === zoneId)?.description || place.description}.
          </p>
          <p>
            Visible physical state, shared scenery style and enabled context also apply. Access rules do not change the
            image.
          </p>
        </details>
        {ownerId ? <p>Personal-space images always reflect their owner.</p> : null}
        <fieldset>
          <legend>Venue image context</legend>
          {(ownerId ? ["useVisualLore"] : ["useAssignedVillagerContext", "useVisualLore"]).map((key) => (
            <label key={key}>
              <input
                type="checkbox"
                disabled={busy}
                checked={
                  place.imageContext?.[key as keyof NonNullable<VillageVenue["imageContext"]>] ??
                  (key === "useVisualLore"
                    ? snapshot.settings.useVisualLoreByDefault !== false
                    : snapshot.settings.personalizeVenueImagesByDefault !== false)
                }
                onChange={async (event) => {
                  const imageContext = {
                    useAssignedVillagerContext:
                      place.imageContext?.useAssignedVillagerContext ??
                      snapshot.settings.personalizeVenueImagesByDefault !== false,
                    useVisualLore:
                      place.imageContext?.useVisualLore ?? snapshot.settings.useVisualLoreByDefault !== false,
                    [key]: event.target.checked,
                  };
                  await saveVenueImageContext(place, imageContext);
                }}
              />
              {key === "useVisualLore" ? "Use selected visual lore" : "Use assigned villagers’ personality"}
            </label>
          ))}
        </fieldset>
        {image ? (
          <img className={`${ELEMENT_TAG}-venue-space-picture`} src={image.url} alt={`${label} at ${place.name}`} />
        ) : (
          <div className={`${ELEMENT_TAG}-venue-image-empty`}>No image yet</div>
        )}
        <div className={`${ELEMENT_TAG}-row`}>
          <button
            type="button"
            className={`${ELEMENT_TAG}-button`}
            disabled={Boolean(placeBusyId) || busy}
            onClick={() => void drawPlaceImage(place.id, spaceClass, ownerId, zoneId)}
          >
            {image ? "Redraw image" : "Draw image"}
          </button>
          <input
            className={`${ELEMENT_TAG}-file`}
            type="file"
            accept="image/*"
            aria-label={`Upload ${label.toLowerCase()} image`}
            disabled={Boolean(placeBusyId) || busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              void keepPlaceImage(place.id, file, spaceClass, ownerId, zoneId);
            }}
          />
          {image ? (
            <button
              type="button"
              className={`${ELEMENT_TAG}-button`}
              disabled={Boolean(placeBusyId) || busy}
              onClick={() => void dropPlaceImage(place.id, spaceClass, ownerId, zoneId)}
            >
              Remove image
            </button>
          ) : null}
        </div>
      </section>
    );

    const editorDirty = Boolean(
      venueEditDraft &&
      JSON.stringify(editableVenueFields(venueEditDraft, classes)) !==
        JSON.stringify(editableVenueFields(place, classes)),
    );
    const proposalDirty = Boolean(
      venueProposalDraft &&
      (JSON.stringify(venueProposalDraft.classes) !== JSON.stringify(classes) ||
        venueProposalDraft.capacity !== (place.residenceCapacity ?? 1) ||
        venueProposalDraft.slot !== 0 ||
        venueProposalDraft.title ||
        venueProposalDraft.description ||
        venueProposalDraft.extraBeds),
    );
    const exitPage = () => {
      if ((venuePage === "edit" && editorDirty) || (venuePage === "proposal" && proposalDirty)) {
        if (!window.confirm("Discard your unsaved changes?")) return;
      }
      setVenuePage("view");
      setVenueEditDraft(null);
      setVenueProposalDraft(null);
      setVenueEditError("");
      setVenueEditNotice("");
    };

    const title = venueTitle(place, occupant);
    return (
      <div className={`${ELEMENT_TAG}-root`} data-venue-view={venuePage === "view" ? "true" : undefined}>
        <header className={`${ELEMENT_TAG}-header`}>
          <div>
            <h1 className={`${ELEMENT_TAG}-title`}>
              {venuePage === "view" ? title : `${venuePage === "edit" ? "Edit Venue" : "Propose Change"} · ${title}`}
            </h1>
            <p className={`${ELEMENT_TAG}-subtitle`}>
              {venuePage === "view"
                ? place.form ||
                  building ||
                  (here.length === 0
                    ? "Nobody is here right now"
                    : `Villagers here: ${here.map((villager) => villager.name).join(", ")}`)
                : venuePage === "edit"
                  ? "Pictures and venue details"
                  : "Review a structural change"}
            </p>
          </div>
          <div className={`${ELEMENT_TAG}-venue-header-controls`}>
            <div className={`${ELEMENT_TAG}-actions`}>
              {venuePage === "view" ? (
                <>
                  <button
                    type="button"
                    className={`${ELEMENT_TAG}-button`}
                    onClick={() => {
                      setVenueEditDraft(structuredClone(place));
                      setVenueEditError("");
                      setVenueEditNotice("");
                      setVenuePage("edit");
                    }}
                  >
                    Edit Venue
                  </button>
                  {classes.includes("residence") && !place.occupancy.playerHome ? (
                    <>
                      <label>
                        Your destination Private Space
                        <select
                          aria-label="Your destination Private Space"
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
                        onClick={() => void requestPlayerMove(place.id, playerMovePrivateZoneId)}
                      >
                        Request to live here
                      </button>
                    </>
                  ) : null}
                  <button
                    type="button"
                    className={`${ELEMENT_TAG}-button`}
                    onClick={() => {
                      setVenueProposalDraft({
                        classes,
                        capacity: place.residenceCapacity ?? 1,
                        slot: 0,
                        title: "",
                        description: "",
                        extraBeds: 0,
                      });
                      setVenueEditError("");
                      setVenueEditNotice("");
                      setVenuePage("proposal");
                    }}
                  >
                    Propose Change
                  </button>
                  {activeRoom?.placeId === place.id ? (
                    <button type="button" className={`${ELEMENT_TAG}-button`} onClick={() => setScreen("room")}>
                      Return to Scene
                    </button>
                  ) : null}
                </>
              ) : (
                <button type="button" className={`${ELEMENT_TAG}-button`} onClick={exitPage}>
                  {venuePage === "edit" ? "Close Editor" : "Exit Change Proposal"}
                </button>
              )}
            </div>
            {venuePage === "view" && venueEditError ? (
              <p className={`${ELEMENT_TAG}-venue-move-error`} role="alert">
                {venueEditError}
              </p>
            ) : null}
          </div>
        </header>
        {venuePage === "view" ? (
          <main className={ELEMENT_TAG + "-venue-page"} aria-label="View Venue">
            <nav className={ELEMENT_TAG + "-venue-zones"} aria-label="Venue zones">
              <button type="button" className={ELEMENT_TAG + "-venue-back"} onClick={leaveVenue}>
                ← Back to map
              </button>
              {zones.map((zone) => (
                <button
                  key={zone.key}
                  type="button"
                  className={ELEMENT_TAG + "-venue-zone-tab"}
                  data-active={selectedZone.key === zone.key ? "true" : "false"}
                  aria-current={selectedZone.key === zone.key ? "page" : undefined}
                  onClick={() => setVenueZoneKey(zone.key)}
                >
                  <span className={ELEMENT_TAG + "-venue-zone-thumb"}>
                    {zone.image && !zone.locked ? (
                      <img src={zone.image.url} alt="" />
                    ) : (
                      <span aria-hidden="true">{zone.locked ? "◈" : "⌂"}</span>
                    )}
                  </span>
                  <span className={ELEMENT_TAG + "-venue-zone-copy"}>
                    <strong>{zone.label}</strong>
                    <small>{zone.subtitle}</small>
                  </span>
                </button>
              ))}
            </nav>
            <div className={ELEMENT_TAG + "-venue-zone-content"}>
              <section className={ELEMENT_TAG + "-venue-zone-main"} aria-label={selectedZone.label}>
                <div className={ELEMENT_TAG + "-venue-artwork"}>
                  {selectedZone.image && !selectedZone.locked ? (
                    <img src={selectedZone.image.url} alt={selectedZone.label + " at " + place.name} />
                  ) : (
                    <div className={ELEMENT_TAG + "-venue-artwork-empty"}>
                      {selectedZone.locked ? "Zone not discovered yet" : "No image for this Zone yet"}
                    </div>
                  )}
                </div>
              </section>
              <aside className={ELEMENT_TAG + "-venue-zone-context"}>
                <span className={ELEMENT_TAG + "-venue-kicker"}>Zone</span>
                <h2>{selectedZone.label}</h2>
                <p>{selectedZone.subtitle}</p>
                {place.accessView && selectedZone.zoneId ? (
                  <VenueAccessPanel
                    key={place.accessView.revision + ":" + selectedZone.zoneId}
                    venue={place}
                    zoneId={selectedZone.zoneId}
                    people={[
                      { id: "player", name: "You" },
                      ...snapshot.villagers.map((person) => ({ id: person.characterId, name: person.name })),
                    ]}
                    onCommand={(command) => changeVenueAccess(place.id, command)}
                  />
                ) : null}
                <div className={ELEMENT_TAG + "-venue-zone-stat"}>
                  <span>Occupancy</span>
                  <strong>
                    {classes.includes("residence")
                      ? venueAssignedCountFor(place) + " / " + venueCapacityFor(place) + " residents"
                      : here.length + " here now"}
                  </strong>
                </div>
                <div className={ELEMENT_TAG + "-venue-zone-stat"}>
                  <span>Accessibility</span>
                  <strong>{selectedZone.accessLabel}</strong>
                </div>
                {!place.accessView &&
                privateSpace &&
                ["private-residence", "staff", "restricted"].includes(privateSpace.kind) ? (
                  <div className={ELEMENT_TAG + "-venue-zone-stat"}>
                    <span>Controllers</span>
                    <strong>
                      {privateControllers
                        .map((id) =>
                          id === "player"
                            ? "You"
                            : (snapshot.villagers.find((person) => person.characterId === id)?.name ?? id),
                        )
                        .join(", ") || "No current controllers"}
                    </strong>
                  </div>
                ) : null}
                {privatePreparation?.status === "ready" ? <p role="status">Private space ready.</p> : null}
                {privatePreparation && privatePreparation.status !== "ready" ? (
                  <p role="status">
                    Private space {privatePreparation.status === "failed" ? "preparation failed" : "is being prepared"}.
                    {privatePreparation.status === "failed" ? (
                      <button type="button" disabled={busy} onClick={() => retryPrivateSpacePreparation()}>
                        Retry private-space preparation
                      </button>
                    ) : null}
                  </p>
                ) : null}

                {hasZoneDetails ? (
                  <details className={ELEMENT_TAG + "-venue-more"}>
                    <summary>Area details</summary>
                    {zoneDescription ? <p>{zoneDescription}</p> : null}
                    {selectedZone.adaptationPending ? (
                      <>
                        <p>This Zone is still being adapted after a move.</p>
                        <BackgroundWorkPanel
                          jobs={(snapshot?.backgroundWork ?? []).filter((job) => job.kind === "adaptation")}
                          onRetry={retryWork}
                        />
                      </>
                    ) : null}
                    {selectedZone.state?.condition ? <p>Condition: {selectedZone.state.condition}</p> : null}
                    {selectedZone.state?.items.length ? (
                      <p>Present items: {selectedZone.state.items.join(", ")}</p>
                    ) : null}
                    {selectedZone.state?.publicFacts.length ? (
                      <p>Established facts: {selectedZone.state.publicFacts.join(" · ")}</p>
                    ) : null}
                    {selectedZone.state?.features.length ? (
                      <p>Defining features: {selectedZone.state.features.map((feature) => feature.text).join(" · ")}</p>
                    ) : null}
                    {selectedZone.area === "outside" && snapshot.village.setting ? (
                      <p>Village: {snapshot.village.setting}</p>
                    ) : null}
                    {zoneProposals.map((proposal) => (
                      <p key={proposal.id}>
                        Proposed Zone edit:{" "}
                        {proposal.declined
                          ? "declined or stale"
                          : `approved by ${proposal.approvedIds.length} of ${proposal.requiredIds.length} residents`}
                      </p>
                    ))}
                  </details>
                ) : null}
                {selectedZone.locked && !selectedZone.canEnter ? (
                  <p className={ELEMENT_TAG + "-venue-zone-guidance"}>
                    Visit the exterior and ask the resident for an invitation.
                  </p>
                ) : null}
                {activeRoom && !activeZoneIsSelected ? (
                  <p className={ELEMENT_TAG + "-venue-zone-guidance"}>Move between Zones to continue this Scene.</p>
                ) : null}
                <button
                  type="button"
                  className={ELEMENT_TAG + "-venue-visit"}
                  disabled={
                    roomBusy ||
                    (!activeZoneIsSelected &&
                      ((Boolean(activeRoom) && activeRoom?.placeId !== place.id) || !selectedZone.canEnter))
                  }
                  onClick={() =>
                    activeZoneIsSelected
                      ? setScreen("room")
                      : void openRoom(
                          place,
                          selectedZone.spaceClass,
                          selectedZone.ownerId,
                          selectedZone.area,
                          selectedZone.zoneId,
                        )
                  }
                >
                  {roomBusy ? "Opening Scene…" : activeZoneIsSelected ? "Return to Scene →" : "Enter this Zone →"}
                </button>
              </aside>
            </div>
          </main>
        ) : venuePage === "edit" ? (
          <main className={`${ELEMENT_TAG}-venue-editor-page`}>
            <div className={`${ELEMENT_TAG}-venue-space-grid`}>
              {zones
                .filter((zone) => !zone.locked)
                .map((zone) =>
                  imagePanel(
                    zone.label + " image",
                    zone.image,
                    zone.area === "outside" ? undefined : zone.spaceClass,
                    zone.ownerId,
                    zone.zoneId,
                  ),
                )}
            </div>
            {placeBusyId === place.id ? <p className={`${ELEMENT_TAG}-hint`}>Drawing or saving the image…</p> : null}
            {placeProblem?.id === place.id ? (
              <p className={`${ELEMENT_TAG}-error`} role="alert">
                {placeProblem.text}
              </p>
            ) : null}
            {selectedZone.zoneId && !selectedZone.locked ? (
              <VenueZoneEditor
                key={selectedZone.zoneId}
                zone={selectedZone}
                onSave={(body) => saveVenueZone(place.id, selectedZone.zoneId!, body)}
              />
            ) : null}
            {venueEditDraft ? (
              <section className={`${ELEMENT_TAG}-venue-card`}>
                <h2 className={`${ELEMENT_TAG}-panel-title`}>Venue details</h2>
                <VenueDraftFields
                  draft={venueEditDraft}
                  existing
                  villagers={snapshot.villagers}
                  editableClasses={classes.filter((item) => item !== "residence" || !occupiedResidence || liveShared)}
                  onChange={setVenueEditDraft}
                />
                {occupiedResidence ? (
                  <p className={`${ELEMENT_TAG}-hint`}>
                    Save Venue details updates the public fields. Changes to the residential Common Space require a
                    separate proposal during an invited visit.
                  </p>
                ) : null}
                <div className={`${ELEMENT_TAG}-row`}>
                  <button
                    type="button"
                    className={`${ELEMENT_TAG}-button`}
                    disabled={venueEditBusy || !venueEditDraft.name.trim()}
                    onClick={() => void saveVenueDetails(place, venueEditDraft, occupiedResidence, classes)}
                  >
                    Save Venue details
                  </button>
                  {occupiedResidence && liveShared ? (
                    <button
                      type="button"
                      className={`${ELEMENT_TAG}-button`}
                      disabled={venueEditBusy || !venueSpaceFor(venueEditDraft, "residence").description.trim()}
                      onClick={() => void proposeRoomEdit(place, venueEditDraft, classes, "shared")}
                    >
                      Propose Common Space edit
                    </button>
                  ) : null}
                </div>
                {occupiedResidence && !liveShared ? (
                  <p className={`${ELEMENT_TAG}-hint`}>
                    Enter with a resident's invitation to propose changes to the Common Space's contents.
                  </p>
                ) : null}
              </section>
            ) : null}
            {livePrivateOwner &&
              venueEditDraft?.privateSpaces
                ?.filter((space) => space.ownerId === livePrivateOwner)
                .map((space) => (
                  <section className={`${ELEMENT_TAG}-venue-card`} key={space.ownerId}>
                    <h2 className={`${ELEMENT_TAG}-panel-title`}>
                      Propose changes to {nameOfCharacter(space.ownerId)}'s private space
                    </h2>
                    <label className={`${ELEMENT_TAG}-label`}>
                      Scene description
                      <textarea
                        className={`${ELEMENT_TAG}-textarea`}
                        value={space.description}
                        onChange={(event) =>
                          setVenueEditDraft((current) =>
                            current
                              ? {
                                  ...current,
                                  privateSpaces: current.privateSpaces?.map((entry) =>
                                    entry.ownerId === space.ownerId
                                      ? { ...entry, description: event.target.value }
                                      : entry,
                                  ),
                                }
                              : current,
                          )
                        }
                      />
                    </label>
                    <details className={`${ELEMENT_TAG}-venue-scene-details`}>
                      <summary>Zone details</summary>
                      <p className={`${ELEMENT_TAG}-hint`}>
                        Physical state used during Scenes and for this Zone's image. These facts stay private until the
                        player enters this Zone.
                      </p>
                      <label className={`${ELEMENT_TAG}-label`}>
                        Condition now{" "}
                        <span className={`${ELEMENT_TAG}-hint`}>
                          For example, a broken shutter or a repaired floor.
                        </span>
                        <textarea
                          className={`${ELEMENT_TAG}-textarea`}
                          value={space.state.condition}
                          onChange={(event) =>
                            setVenueEditDraft((current) =>
                              current
                                ? {
                                    ...current,
                                    privateSpaces: current.privateSpaces?.map((entry) =>
                                      entry.ownerId === space.ownerId
                                        ? { ...entry, state: { ...entry.state, condition: event.target.value } }
                                        : entry,
                                    ),
                                  }
                                : current,
                            )
                          }
                        />
                      </label>
                      <label className={`${ELEMENT_TAG}-label`}>
                        Present items · one per line{" "}
                        <span className={`${ELEMENT_TAG}-hint`}>Objects physically in this Zone.</span>
                        <textarea
                          className={`${ELEMENT_TAG}-textarea`}
                          value={space.state.items.join("\n")}
                          onChange={(event) =>
                            setVenueEditDraft((current) =>
                              current
                                ? {
                                    ...current,
                                    privateSpaces: current.privateSpaces?.map((entry) =>
                                      entry.ownerId === space.ownerId
                                        ? { ...entry, state: { ...entry.state, items: event.target.value.split("\n") } }
                                        : entry,
                                    ),
                                  }
                                : current,
                            )
                          }
                        />
                      </label>
                      <label className={`${ELEMENT_TAG}-label`}>
                        Established facts · one per line{" "}
                        <span className={`${ELEMENT_TAG}-hint`}>Durable truths about this Zone.</span>
                        <textarea
                          className={`${ELEMENT_TAG}-textarea`}
                          value={space.state.publicFacts.join("\n")}
                          onChange={(event) =>
                            setVenueEditDraft((current) =>
                              current
                                ? {
                                    ...current,
                                    privateSpaces: current.privateSpaces?.map((entry) =>
                                      entry.ownerId === space.ownerId
                                        ? {
                                            ...entry,
                                            state: { ...entry.state, publicFacts: event.target.value.split("\n") },
                                          }
                                        : entry,
                                    ),
                                  }
                                : current,
                            )
                          }
                        />
                      </label>
                    </details>
                    <button
                      type="button"
                      className={`${ELEMENT_TAG}-button`}
                      disabled={venueEditBusy || !space.description.trim()}
                      onClick={() => void proposeRoomEdit(place, venueEditDraft, classes, "private", space.ownerId)}
                    >
                      Propose Private Space edit
                    </button>
                  </section>
                ))}
            {occupiedResidence && (place.residentIds?.length ?? 0) > 0 ? (
              <section className={`${ELEMENT_TAG}-venue-card`}>
                <h2 className={`${ELEMENT_TAG}-panel-title`}>Resident moves</h2>
                <select
                  value={moveTargetId}
                  onChange={(event) => {
                    setMoveTargetId(event.target.value);
                    setMovePrivateZoneId("");
                  }}
                  aria-label="Destination for resident move"
                >
                  <option value="">Choose a Residence with an available bed</option>
                  {snapshot.settings.venues
                    .filter(
                      (entry) =>
                        entry.id !== place.id &&
                        venueClassesFor(entry).includes("residence") &&
                        venueAssignedCountFor(entry) < venueCapacityFor(entry),
                    )
                    .map((entry) => (
                      <option key={entry.id} value={entry.id}>
                        {entry.name}
                      </option>
                    ))}
                </select>
                <label>
                  Destination Private Space
                  <select
                    aria-label="Destination Private Space"
                    value={movePrivateZoneId}
                    onChange={(event) => setMovePrivateZoneId(event.target.value)}
                  >
                    <option value="">No Private Space</option>
                    {snapshot.settings.venues
                      .find((venue) => venue.id === moveTargetId)
                      ?.zones?.filter(
                        (zone) =>
                          zone.kind === "private-residence" &&
                          !zone.ownerId &&
                          !zone.closed &&
                          !snapshot.residences.some(
                            (move) =>
                              move.status === "moving" &&
                              move.proposedVenueId === moveTargetId &&
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
                {(place.residentIds ?? []).map((residentId) => {
                  const move = snapshot.residences.find(
                    (entry) => entry.characterId === residentId && entry.status !== "current",
                  );
                  return (
                    <div className={`${ELEMENT_TAG}-row`} key={residentId}>
                      <strong>{nameOfCharacter(residentId)}</strong>
                      {move ? (
                        <span className={`${ELEMENT_TAG}-hint`}>
                          {move.status === "moving" ? "Moving" : "Awaiting consent"}
                        </span>
                      ) : (
                        <button
                          type="button"
                          className={`${ELEMENT_TAG}-button`}
                          disabled={!moveTargetId || venueEditBusy}
                          onClick={() => void proposeResidenceMove(residentId, moveTargetId, movePrivateZoneId)}
                        >
                          Ask to move
                        </button>
                      )}
                    </div>
                  );
                })}
              </section>
            ) : null}
            {venueEditNotice ? (
              <p className={`${ELEMENT_TAG}-hint`} role="status">
                {venueEditNotice}
              </p>
            ) : null}
            {venueEditError ? (
              <p className={`${ELEMENT_TAG}-error`} role="alert">
                {venueEditError}
              </p>
            ) : null}
          </main>
        ) : (
          <main className={`${ELEMENT_TAG}-venue-proposal-page`}>
            <section className={`${ELEMENT_TAG}-venue-card`}>
              <h2 className={`${ELEMENT_TAG}-panel-title`}>Propose a Venue change</h2>
              <p className={`${ELEMENT_TAG}-hint`}>
                Residents and workers affected by a structural change will reply in your Mailbox. A vacant Venue changes
                after you submit the reviewed terms.
              </p>
              {venueProposalDraft ? (
                <>
                  <fieldset className={`${ELEMENT_TAG}-field`}>
                    <legend className={`${ELEMENT_TAG}-label`}>Classes · choose up to two</legend>
                    <div className={`${ELEMENT_TAG}-row`}>
                      {VENUE_CLASS_CHOICES.map((item) => (
                        <label key={item} className={`${ELEMENT_TAG}-label`}>
                          <input
                            type="checkbox"
                            checked={venueProposalDraft.classes.includes(item)}
                            disabled={
                              !venueProposalDraft.classes.includes(item) && venueProposalDraft.classes.length >= 2
                            }
                            onChange={(event) =>
                              setVenueProposalDraft((current) =>
                                current
                                  ? {
                                      ...current,
                                      classes: event.target.checked
                                        ? [...current.classes, item]
                                        : current.classes.filter((entry) => entry !== item),
                                    }
                                  : current,
                              )
                            }
                          />{" "}
                          {item}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  {venueProposalDraft.classes.includes("residence") ? (
                    <label className={`${ELEMENT_TAG}-label`}>
                      Base capacity · includes you
                      <input
                        className={`${ELEMENT_TAG}-notice-input`}
                        type="number"
                        min={1}
                        max={4}
                        value={venueProposalDraft.capacity}
                        onChange={(event) =>
                          setVenueProposalDraft({ ...venueProposalDraft, capacity: Number(event.target.value) })
                        }
                      />
                    </label>
                  ) : null}
                  <label className={`${ELEMENT_TAG}-label`}>
                    Improvement slot
                    <select
                      value={venueProposalDraft.slot}
                      onChange={(event) =>
                        setVenueProposalDraft({ ...venueProposalDraft, slot: Number(event.target.value) })
                      }
                    >
                      <option value={0}>Slot 1 · {place.improvements?.[0]?.title ?? "empty"}</option>
                      <option value={1}>Slot 2 · {place.improvements?.[1]?.title ?? "empty"}</option>
                    </select>
                  </label>
                  <label className={`${ELEMENT_TAG}-label`}>
                    Improvement title · leave empty for a Class or capacity proposal
                    <input
                      className={`${ELEMENT_TAG}-notice-input`}
                      value={venueProposalDraft.title}
                      onChange={(event) => setVenueProposalDraft({ ...venueProposalDraft, title: event.target.value })}
                      placeholder="A second sleeping alcove"
                    />
                  </label>
                  {venueProposalDraft.title ? (
                    <>
                      <label className={`${ELEMENT_TAG}-label`}>
                        What changes in the story?
                        <textarea
                          className={`${ELEMENT_TAG}-textarea`}
                          value={venueProposalDraft.description}
                          onChange={(event) =>
                            setVenueProposalDraft({ ...venueProposalDraft, description: event.target.value })
                          }
                        />
                      </label>
                      <label className={`${ELEMENT_TAG}-label`}>
                        Extra beds · optional mechanical effect
                        <input
                          className={`${ELEMENT_TAG}-notice-input`}
                          type="number"
                          min={0}
                          max={3}
                          value={venueProposalDraft.extraBeds}
                          onChange={(event) =>
                            setVenueProposalDraft({ ...venueProposalDraft, extraBeds: Number(event.target.value) })
                          }
                        />
                      </label>
                    </>
                  ) : null}
                  <button
                    type="button"
                    className={`${ELEMENT_TAG}-button`}
                    disabled={
                      venueEditBusy ||
                      venueProposalDraft.classes.length < 1 ||
                      (venueProposalDraft.title.trim().length > 0 && !venueProposalDraft.description.trim())
                    }
                    onClick={() => void submitVenueProposal(place, venueProposalDraft)}
                  >
                    Submit proposal
                  </button>
                </>
              ) : (
                <p className={`${ELEMENT_TAG}-hint`} role="status">
                  {venueEditNotice || "Proposal submitted."}
                </p>
              )}
              {venueEditError ? (
                <p className={`${ELEMENT_TAG}-error`} role="alert">
                  {venueEditError}
                </p>
              ) : null}
            </section>
          </main>
        )}
      </div>
    );
  }
  return null;
}
