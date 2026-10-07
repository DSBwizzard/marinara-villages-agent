import { request } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { pinTone, placeSpot, playerDisplayName } from "../../shared/presentation.js";
import type { MapPin } from "../../shared/types.js";
import { isHouse, venueClassesFor, venueSpaceFor } from "../../shared/venue.js";
import { MapStage, PROJECT_BLUEPRINT_IMAGE, TOWN_MAP_FITS } from "../exploration/MapStage.js";
import { PlayerIdentityEditor, VillageLorebookPicker } from "../founding/FoundingPanels.js";
import { SceneryStyleFields } from "../founding/villages-founding-editor";
import { PlayerRoleSummary } from "../founding/villages-player-role.js";
import { VenueDraftFields } from "../venues/VenuePanels.js";
import type { MenuScreenController } from "./screen-contracts.js";
import { VillageWritingSettings } from "./SettingsPanels.js";
import { VillagesBurstPreview } from "./villages-burst-preview.js";

export function renderVillageSettingsPage(
  ports: Pick<
    MenuScreenController,
    | "addVenue"
    | "backgroundPanel"
    | "busy"
    | "discardTownMapDraft"
    | "framingMap"
    | "generateReplacementMap"
    | "insertMacro"
    | "knowledgeDraft"
    | "knowledgeRef"
    | "loreTokenBudgetDraft"
    | "lorebookDraft"
    | "lorebooks"
    | "lorebooksError"
    | "mapGenerating"
    | "mapPinDraft"
    | "mapRemoveDraft"
    | "mapReplaceOpen"
    | "mobile"
    | "nameOfCharacter"
    | "openPlace"
    | "openSetup"
    | "panelMapView"
    | "personaDraft"
    | "personalizeHomes"
    | "personas"
    | "pickTownMap"
    | "placeCount"
    | "placingMapVenueId"
    | "reframingMap"
    | "removeVenue"
    | "saveScenerySettings"
    | "saveSettings"
    | "saveTownMap"
    | "saveVenue"
    | "sceneryStyle"
    | "selectedMapVenueId"
    | "setKnowledgeDraft"
    | "setLoreTokenBudgetDraft"
    | "setLorebookDraft"
    | "setMapPinDraft"
    | "setMapRemoveDraft"
    | "setPersonaDraft"
    | "setPersonalizeHomes"
    | "setPlacingMapVenueId"
    | "setReframingMap"
    | "setSceneryStyle"
    | "setSelectedMapVenueId"
    | "setSettingDraft"
    | "setTownMapDraft"
    | "setTownMapPick"
    | "setVenueEditDraft"
    | "setVenueSearch"
    | "setVisualLoreDefault"
    | "settingDraft"
    | "settingsError"
    | "snapshot"
    | "startMapReplacement"
    | "suggestPlaces"
    | "townMapAdvice"
    | "townMapImage"
    | "townMapPick"
    | "townMapShape"
    | "townMapSrc"
    | "townMapZoom"
    | "venueEditDraft"
    | "venueSearch"
    | "venuesDraft"
    | "visualLoreDefault"
  >,
) {
  const {
    addVenue,
    backgroundPanel,
    busy,
    discardTownMapDraft,
    framingMap,
    generateReplacementMap,
    insertMacro,
    knowledgeDraft,
    knowledgeRef,
    loreTokenBudgetDraft,
    lorebookDraft,
    lorebooks,
    lorebooksError,
    mapGenerating,
    mapPinDraft,
    mapRemoveDraft,
    mapReplaceOpen,
    mobile,
    nameOfCharacter,
    openPlace,
    openSetup,
    panelMapView,
    personaDraft,
    personalizeHomes,
    personas,
    pickTownMap,
    placeCount,
    placingMapVenueId,
    reframingMap,
    removeVenue,
    saveScenerySettings,
    saveSettings,
    saveTownMap,
    saveVenue,
    sceneryStyle,
    selectedMapVenueId,
    setKnowledgeDraft,
    setLoreTokenBudgetDraft,
    setLorebookDraft,
    setMapPinDraft,
    setMapRemoveDraft,
    setPersonaDraft,
    setPersonalizeHomes,
    setPlacingMapVenueId,
    setReframingMap,
    setSceneryStyle,
    setSelectedMapVenueId,
    setSettingDraft,
    setTownMapDraft,
    setTownMapPick,
    setVenueEditDraft,
    setVenueSearch,
    setVisualLoreDefault,
    settingDraft,
    settingsError,
    snapshot,
    startMapReplacement,
    suggestPlaces,
    townMapAdvice,
    townMapImage,
    townMapPick,
    townMapShape,
    townMapSrc,
    townMapZoom,
    venueEditDraft,
    venueSearch,
    venuesDraft,
    visualLoreDefault,
  } = ports;
  return (
    <div className={`${ELEMENT_TAG}-menu-body ${ELEMENT_TAG}-menu-content`} role="main">
      <section className={ELEMENT_TAG + "-venue-card"}>
        <SceneryStyleFields value={sceneryStyle} onChange={setSceneryStyle} />
        <label>
          <input
            type="checkbox"
            checked={personalizeHomes}
            onChange={(event) => setPersonalizeHomes(event.target.checked)}
          />
          Personalize new venue images by default
        </label>
        <label>
          <input
            type="checkbox"
            checked={visualLoreDefault}
            onChange={(event) => setVisualLoreDefault(event.target.checked)}
          />
          Use visual lore by default
        </label>
        <button type="button" disabled={busy} onClick={() => void saveScenerySettings()}>
          Save scenery settings
        </button>
      </section>

      {backgroundPanel}
      {snapshot ? (
        <section className={`${ELEMENT_TAG}-panel`}>
          <h2 className={`${ELEMENT_TAG}-panel-title`}>Village settings</h2>
          <p className={`${ELEMENT_TAG}-empty`}>
            These choices belong to this village. Resident cards shape their voices, and Villages writes each scene
            around what is happening now. Village knowledge is refreshed for every reply.
          </p>

          <VillageWritingSettings />

          <section className={ELEMENT_TAG + "-field"} aria-label="Village Map">
            <h3 className={ELEMENT_TAG + "-panel-title"}>Village Map</h3>
            <p className={ELEMENT_TAG + "-hint"}>
              Replace the background image here. Venue photographs remain in their saved places until you reposition
              them in the preview.
            </p>
            {mapReplaceOpen ? (
              <p className={ELEMENT_TAG + "-error"} role="alert">
                Venues will not move automatically. Review every Venue photograph on the new map; moving one here is
                free and does not change its residents, projects, or history.
              </p>
            ) : null}
            <MapStage
              src={townMapSrc}
              alt="Village map preview with Venue photographs"
              pins={snapshot.settings.venues.flatMap((venue): MapPin[] => {
                const spot = mapReplaceOpen ? mapPinDraft[venue.id] : placeSpot(venue);
                if (!spot || spot.x === null || spot.y === null) return [];
                return [
                  {
                    id: venue.id,
                    x: spot.x,
                    y: spot.y,
                    text: venue.name,
                    image:
                      venue.constructionStatus === "worksite"
                        ? PROJECT_BLUEPRINT_IMAGE
                        : (venue.presentation.image?.url ?? null),
                    tone: isHouse(venue)
                      ? pinTone({
                          isPlayerHome: venue.occupancy.playerHome,
                          occupant: venue.occupancy.residentCharacterId,
                        })
                      : "venue",
                    onSelect: () => setSelectedMapVenueId(venue.id),
                  },
                ];
              })}
              placing={mapReplaceOpen && placingMapVenueId !== null}
              view={panelMapView}
              shape={townMapShape}
              zoom={townMapZoom}
              mobile={mobile}
              onView={framingMap && !placingMapVenueId ? setTownMapDraft : undefined}
              onPlace={
                mapReplaceOpen && placingMapVenueId
                  ? (x, y) => {
                      setMapPinDraft((current) => ({ ...current, [placingMapVenueId]: { x, y } }));
                      setSelectedMapVenueId(placingMapVenueId);
                      setPlacingMapVenueId(null);
                    }
                  : undefined
              }
            />
            {mapReplaceOpen ? (
              <>
                <div className={ELEMENT_TAG + "-row"}>
                  <button
                    type="button"
                    className={ELEMENT_TAG + "-button"}
                    disabled={busy || mapGenerating}
                    onClick={() => void generateReplacementMap()}
                  >
                    {mapGenerating ? "Generating map…" : "Generate replacement"}
                  </button>
                  <VillagesBurstPreview request={request} action="images" args={{ count: 1 }} />
                  <input
                    className={ELEMENT_TAG + "-file"}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/avif"
                    aria-label="Upload replacement village map"
                    disabled={busy || mapGenerating}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      event.target.value = "";
                      void pickTownMap(file);
                    }}
                  />
                  <button
                    type="button"
                    className={ELEMENT_TAG + "-button"}
                    disabled={busy || mapGenerating}
                    onClick={() => {
                      setMapRemoveDraft(true);
                      setTownMapPick(null);
                      setTownMapDraft(null);
                      setPlacingMapVenueId(null);
                    }}
                  >
                    No background image
                  </button>
                </div>
                {townMapPick || mapRemoveDraft ? (
                  <>
                    <p className={ELEMENT_TAG + "-hint"}>
                      Select a venue, then choose Move photograph and its new position on the preview. Unmoved venues
                      keep their saved coordinates.
                    </p>
                    <div className={ELEMENT_TAG + "-field"} aria-label="Venue placement">
                      {snapshot.settings.venues.map((venue) => {
                        const spot = mapPinDraft[venue.id];
                        const resident = venue.occupancy.residentCharacterId
                          ? nameOfCharacter(venue.occupancy.residentCharacterId)
                          : venue.occupancy.playerHome
                            ? playerDisplayName(snapshot)
                            : "";
                        return (
                          <div key={venue.id} className={ELEMENT_TAG + "-row"}>
                            <button
                              type="button"
                              className={ELEMENT_TAG + "-button"}
                              aria-pressed={selectedMapVenueId === venue.id}
                              onClick={() => setSelectedMapVenueId(venue.id)}
                            >
                              {venue.name}
                            </button>
                            <span className={ELEMENT_TAG + "-hint"}>{resident || "No resident"}</span>
                            <span className={ELEMENT_TAG + "-hint"}>
                              {spot?.x !== null && spot?.x !== undefined && spot?.y !== null && spot?.y !== undefined
                                ? "On map"
                                : "Not placed"}
                            </span>
                            <button
                              type="button"
                              className={ELEMENT_TAG + "-button"}
                              aria-pressed={placingMapVenueId === venue.id}
                              onClick={() => setPlacingMapVenueId(venue.id)}
                            >
                              Move photograph
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : null}
                {townMapAdvice ? (
                  <p className={ELEMENT_TAG + "-hint"} data-tone={townMapAdvice.tone}>
                    {townMapAdvice.text}
                  </p>
                ) : null}
                {framingMap ? (
                  <div className={ELEMENT_TAG + "-steps"} role="group" aria-label="How the picture sits in the frame">
                    {TOWN_MAP_FITS.map((option) => (
                      <button
                        key={option.fit}
                        type="button"
                        className={ELEMENT_TAG + "-step"}
                        data-clickable="true"
                        data-active={panelMapView.fit === option.fit ? "true" : "false"}
                        aria-pressed={panelMapView.fit === option.fit}
                        onClick={() => setTownMapDraft({ ...panelMapView, fit: option.fit })}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                ) : null}
                <div className={ELEMENT_TAG + "-row"}>
                  <button
                    type="button"
                    className={ELEMENT_TAG + "-button"}
                    disabled={busy || mapGenerating || (!townMapPick && !mapRemoveDraft)}
                    onClick={() => void saveTownMap()}
                  >
                    Save map and placements
                  </button>
                  <button
                    type="button"
                    className={ELEMENT_TAG + "-button"}
                    disabled={busy || mapGenerating}
                    onClick={discardTownMapDraft}
                  >
                    Cancel replacement
                  </button>
                </div>
              </>
            ) : framingMap ? (
              <>
                <div className={ELEMENT_TAG + "-steps"} role="group" aria-label="How the picture sits in the frame">
                  {TOWN_MAP_FITS.map((option) => (
                    <button
                      key={option.fit}
                      type="button"
                      className={ELEMENT_TAG + "-step"}
                      data-clickable="true"
                      data-active={panelMapView.fit === option.fit ? "true" : "false"}
                      aria-pressed={panelMapView.fit === option.fit}
                      onClick={() => setTownMapDraft({ ...panelMapView, fit: option.fit })}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <div className={ELEMENT_TAG + "-row"}>
                  <button
                    type="button"
                    className={ELEMENT_TAG + "-button"}
                    disabled={busy}
                    onClick={() => void saveTownMap()}
                  >
                    Save framing
                  </button>
                  <button
                    type="button"
                    className={ELEMENT_TAG + "-button"}
                    disabled={busy}
                    onClick={discardTownMapDraft}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <div className={ELEMENT_TAG + "-row"}>
                <button type="button" className={ELEMENT_TAG + "-button"} disabled={busy} onClick={startMapReplacement}>
                  Replace map
                </button>
                {snapshot.settings.townMapImageSetAt ? (
                  <button
                    type="button"
                    className={ELEMENT_TAG + "-button"}
                    disabled={busy || !townMapImage}
                    onClick={() => setReframingMap(true)}
                  >
                    Crop or fit current map
                  </button>
                ) : null}
              </div>
            )}
            {settingsError ? (
              <p className={ELEMENT_TAG + "-error"} role="alert">
                {settingsError}
              </p>
            ) : null}
          </section>

          <div className={`${ELEMENT_TAG}-field`}>
            <p className={`${ELEMENT_TAG}-empty`}>
              Revisit the founding setup to update the village as it stands now. Its original starting circumstances
              stay in the founding record.
            </p>
            <div className={`${ELEMENT_TAG}-row`}>
              <button
                type="button"
                className={`${ELEMENT_TAG}-button`}
                disabled={busy || !snapshot}
                onClick={() => openSetup(false, snapshot)}
              >
                Run setup again
              </button>
              <span className={`${ELEMENT_TAG}-hint`}>
                Keeps your villagers, their conversations and anything you have written.
              </span>
            </div>
          </div>

          {/*
                  The setting below is the wizard's. It is left on screen with
                  its value in it and made read-only, rather than taken away.

                  Setting a village up is one question with two halves — the
                  world it sits in and the houses standing in it — and the
                  founding wizard asks both, in one sitting, which is what it is
                  for. Two screens writing the same village is the thing to
                  avoid, and the half-edited state between them is worse than
                  one of the two being read-only.

                  It stays on screen because what it holds is still real: the
                  setting reaches every villager through the town description,
                  and a village that has lost the place you write about it in
                  reads as a bug rather than as a division of labour.

                  The places below it are the other way round. Where the houses
                  stand is the wizard's second question; what there is to DO in
                  a place is not one of its three, so this is the only editor a
                  destination has — and a destination is the way into a
                  conversation now, which makes the list furniture rather than
                  leftover.
                */}
          <div className={`${ELEMENT_TAG}-field`}>
            <label className={`${ELEMENT_TAG}-label`} htmlFor={`${ELEMENT_TAG}-setting`}>
              Where are we?
            </label>
            <textarea
              id={`${ELEMENT_TAG}-setting`}
              className={`${ELEMENT_TAG}-textarea ${ELEMENT_TAG}-off`}
              value={settingDraft}
              maxLength={snapshot.settings.settingMaxLength}
              placeholder="A cliffside fishing town where the boats go out before dawn…"
              disabled
              onChange={(event) => setSettingDraft(event.target.value)}
            />
            <p className={`${ELEMENT_TAG}-macro-help`}>
              Read-only here. Change the place and world context on Village Beginning in the founding wizard. This
              description still guides what villagers know about their home.
            </p>
          </div>

          <VillageLorebookPicker
            books={lorebooks}
            error={lorebooksError}
            selected={lorebookDraft}
            onChange={setLorebookDraft}
            disabled={busy}
          />
          <div className={`${ELEMENT_TAG}-field`}>
            <label className={`${ELEMENT_TAG}-label`} htmlFor={`${ELEMENT_TAG}-lore-budget`}>
              Lorebook token budget
            </label>
            <input
              id={`${ELEMENT_TAG}-lore-budget`}
              className={`${ELEMENT_TAG}-notice-input`}
              type="number"
              min={snapshot.settings.loreTokenBudgetMin}
              max={snapshot.settings.loreTokenBudgetMax}
              step={100}
              value={loreTokenBudgetDraft}
              disabled={busy}
              onChange={(event) => setLoreTokenBudgetDraft(Number(event.target.value))}
            />
            <p className={`${ELEMENT_TAG}-hint`}>
              Maximum approximate lore tokens in future text generation. Image prompts keep a separate short excerpt.
            </p>
          </div>

          <section className={`${ELEMENT_TAG}-field`}>
            <div className={`${ELEMENT_TAG}-row`} style={{ justifyContent: "space-between" }}>
              <h2 className={`${ELEMENT_TAG}-panel-title`}>Venues</h2>
              <button
                type="button"
                className={`${ELEMENT_TAG}-button`}
                onClick={addVenue}
                disabled={busy || placeCount >= snapshot.settings.maxPlaces}
              >
                Propose Venue Project
              </button>
            </div>
            <p className={`${ELEMENT_TAG}-hint`}>
              Each Venue is one unique place. Its physical form describes its structure; one or two Classes describe
              what people do there.
            </p>
            <input
              className={`${ELEMENT_TAG}-notice-input`}
              type="search"
              value={venueSearch}
              onChange={(event) => setVenueSearch(event.target.value)}
              placeholder="Find a Venue by name, physical form, or Class"
              aria-label="Search Venues"
            />
            <div className={`${ELEMENT_TAG}-notice-add`}>
              {snapshot.settings.venues
                .filter((venue) =>
                  `${venue.name} ${venue.form ?? ""} ${venueClassesFor(venue).join(" ")}`
                    .toLowerCase()
                    .includes(venueSearch.toLowerCase()),
                )
                .map((venue) => (
                  <div className={`${ELEMENT_TAG}-notice-row`} key={venue.id}>
                    <strong>{venue.name || "Unnamed Residence"}</strong>
                    <span className={`${ELEMENT_TAG}-hint`}>
                      {[venue.form, venueClassesFor(venue).join(" + ")].filter(Boolean).join(" · ")}
                    </span>
                    {venueClassesFor(venue).includes("residence") ? (
                      <span className={`${ELEMENT_TAG}-hint`}>
                        {(venue.residentIds?.length ?? Number(Boolean(venue.occupancy.residentCharacterId))) +
                          Number(venue.occupancy.playerHome)}{" "}
                        / {venue.residenceCapacity ?? 1} residents
                      </span>
                    ) : null}
                    <div className={`${ELEMENT_TAG}-row`}>
                      <button type="button" className={`${ELEMENT_TAG}-button`} onClick={() => openPlace(venue)}>
                        View Venue
                      </button>
                      <button
                        type="button"
                        className={`${ELEMENT_TAG}-button`}
                        onClick={() => setVenueEditDraft(structuredClone(venue))}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className={`${ELEMENT_TAG}-remove`}
                        onClick={() => void removeVenue(venue.id)}
                        aria-label={`Delete ${venue.name}`}
                        disabled={busy}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
            </div>
            {venueEditDraft ? (
              <div className={`${ELEMENT_TAG}-field`}>
                <h3 className={`${ELEMENT_TAG}-panel-title`}>
                  {snapshot.settings.venues.some((venue) => venue.id === venueEditDraft.id)
                    ? "Edit Venue"
                    : "Create Venue"}
                </h3>
                <VenueDraftFields
                  draft={venueEditDraft}
                  existing={snapshot.settings.venues.some((venue) => venue.id === venueEditDraft.id)}
                  villagers={snapshot.villagers}
                  onChange={setVenueEditDraft}
                />
                <div className={`${ELEMENT_TAG}-row`}>
                  <button
                    type="button"
                    className={`${ELEMENT_TAG}-button`}
                    disabled={
                      busy ||
                      !venueEditDraft.name.trim() ||
                      !venueClassesFor(venueEditDraft).every((item) =>
                        venueSpaceFor(venueEditDraft, item).description.trim(),
                      )
                    }
                    onClick={() => void saveVenue(venueEditDraft)}
                  >
                    Save Venue
                  </button>
                  <VillagesBurstPreview request={request} action="change" args={{ venue: venueEditDraft }} />
                  <button type="button" className={`${ELEMENT_TAG}-button`} onClick={() => setVenueEditDraft(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}
            <div className={`${ELEMENT_TAG}-row`}>
              <button
                type="button"
                className={`${ELEMENT_TAG}-button`}
                onClick={() => void suggestPlaces()}
                disabled={busy}
              >
                Suggest Venues
              </button>
            </div>
            {venuesDraft
              .filter((venue) => !snapshot.settings.venues.some((saved) => saved.id === venue.id))
              .map((venue) => (
                <div className={`${ELEMENT_TAG}-notice-row`} key={venue.id}>
                  <strong>{venue.name}</strong>
                  <span className={`${ELEMENT_TAG}-hint`}>{venue.form}</span>
                  <button type="button" className={`${ELEMENT_TAG}-button`} onClick={() => setVenueEditDraft(venue)}>
                    Review suggestion
                  </button>
                </div>
              ))}
          </section>
          {/*
                  The knowledge box is world context. Writing guidance is above;
                  each resident's own card governs their speech.
                */}
          <div className={`${ELEMENT_TAG}-field`}>
            <label className={`${ELEMENT_TAG}-label`} htmlFor={`${ELEMENT_TAG}-knowledge`}>
              The information villagers know
            </label>
            <textarea
              id={`${ELEMENT_TAG}-knowledge`}
              ref={knowledgeRef}
              className={`${ELEMENT_TAG}-preset`}
              value={knowledgeDraft}
              maxLength={snapshot.settings.promptBoxMaxLength}
              spellCheck={false}
              onChange={(event) => setKnowledgeDraft(event.target.value)}
            />
            <p className={`${ELEMENT_TAG}-macro-help`}>
              What a villager here knows, written as tokens the village fills in for itself: the time, the weather, who
              else lives here, what is on the noticeboard. Because it is written out fresh on every reply, a villager
              here is always current — and because it is only these tokens, adding a place or pinning a note reaches
              every villager without anything being edited here. A resident&apos;s card guides their voice; additional
              writing guidance is in Village Settings.
            </p>
            <div className={`${ELEMENT_TAG}-macros`}>
              {snapshot.settings.macros.map((macro) => (
                <button
                  key={macro.token}
                  type="button"
                  className={`${ELEMENT_TAG}-macro`}
                  title={`${macro.label} — ${macro.help}`}
                  onClick={() => insertMacro(macro.token)}
                >
                  {macro.token}
                </button>
              ))}
            </div>
            <p className={`${ELEMENT_TAG}-macro-help`}>
              Click a token to drop it in at the cursor of the box. A token with nothing behind it turns into nothing at
              all, so <code>{"{{lore}}"}</code> can sit in the prompt until there is lore to put there.
            </p>
          </div>

          <PlayerIdentityEditor
            idPrefix="settings"
            personas={personas}
            draft={personaDraft}
            onDraft={setPersonaDraft}
            storedId={snapshot.settings.playerPersonaId}
            storedName={snapshot.settings.playerPersonaName}
            storedMissing={snapshot.settings.playerPersonaMissing}
            disabled={busy}
          />
          <PlayerRoleSummary role={snapshot.settings.playerRole} />

          <div className={`${ELEMENT_TAG}-row`}>
            <button
              type="button"
              className={`${ELEMENT_TAG}-button`}
              onClick={() => void saveSettings()}
              disabled={busy}
            >
              Save settings
            </button>
            <VillagesBurstPreview
              request={request}
              action="change"
              args={{
                settings: {
                  setting: settingDraft,
                  selectedLorebookIds: lorebookDraft,
                  loreTokenBudget: loreTokenBudgetDraft,
                },
              }}
            />
            <button
              type="button"
              className={`${ELEMENT_TAG}-button`}
              onClick={() => {
                setKnowledgeDraft(snapshot.settings.defaultPromptKnowledge);
              }}
              disabled={busy}
            >
              Restore the default box
            </button>
            <span className={`${ELEMENT_TAG}-hint`}>
              {knowledgeDraft === snapshot.settings.promptKnowledge &&
              personaDraft === snapshot.settings.playerPersonaId &&
              settingDraft === snapshot.settings.setting &&
              JSON.stringify(lorebookDraft) === JSON.stringify(snapshot.settings.selectedLorebookIds)
                ? "No unsaved settings changes. Save places individually."
                : "Unsaved settings changes. Save places individually."}
            </span>
          </div>
        </section>
      ) : null}

      {settingsError && !mapReplaceOpen && !reframingMap ? (
        <p className={`${ELEMENT_TAG}-error`} role="alert">
          {settingsError}
        </p>
      ) : null}
    </div>
  );
}
