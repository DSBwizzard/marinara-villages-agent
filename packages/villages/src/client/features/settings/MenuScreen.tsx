import type {
  ProgressDebugView,
  VillageSettings,
  VillageSnapshot,
  VillageStoryPace,
} from "../../../shared/contracts/village.js";
import { messageFrom, request } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import {
  pinTone,
  placeSpot,
  playerDisplayName,
  renderVillagesMarkdown,
  stampTime,
  storyPaceSummary,
  VillageEvents,
  villagesSpeechPaintStyle,
} from "../../shared/presentation.js";
import type { MapPin } from "../../shared/types.js";
import { isHouse, venueClassesFor, venueSpaceFor } from "../../shared/venue.js";
import { FORCE_VILLAGE_UPDATE_NOTICE, MENU_PAGE_TITLES } from "../../shell/navigation.js";
import type { VillageController } from "../../shell/useVillageController.js";
import { MapStage, PROJECT_BLUEPRINT_IMAGE, TOWN_MAP_FITS } from "../exploration/MapStage.js";
import { PlayerIdentityEditor, VillageLorebookPicker } from "../founding/FoundingPanels.js";
import { SceneryStyleFields } from "../founding/villages-founding-editor";
import { PlayerRoleSummary } from "../founding/villages-player-role.js";
import { ProjectsPanelV2 } from "../projects/ProjectsPanel.js";
import { VenueDraftFields } from "../venues/VenuePanels.js";
import { AgentConnections, VillagesRuntimeDebug, VillageWritingSettings } from "./SettingsPanels.js";
import { VillagesBurstPreview } from "./villages-burst-preview.js";

export function MenuScreen({ controller }: { controller: VillageController }) {
  const {
    addNotice,
    addVenue,
    archiveError,
    archiveOffset,
    archiveTotal,
    archiveVenueId,
    archiveVillagerId,
    backgroundPanel,
    busy,
    catchingUp,
    debugDiscardEnabled,
    decideVenueRequest,
    deleteArchivedVisits,
    discardTownMapDraft,
    error,
    focusedProjectId,
    framingMap,
    generateReplacementMap,
    goHome,
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
    menuPage,
    menuSection,
    mobile,
    nameOfCharacter,
    noticeDraft,
    openArchivedVisit,
    openMenu,
    openPlace,
    openSetup,
    openVisit,
    panelMapView,
    personaDraft,
    personalizeHomes,
    personas,
    pickTownMap,
    placeCount,
    placingMapVenueId,
    progressDebug,
    reframingMap,
    removeNotice,
    removeVenue,
    requestEdits,
    resetArmed,
    room,
    saveCharacterSpeechColors,
    saveSendOnEnter,
    saveSettings,
    saveStoryPace,
    saveTownMap,
    saveVenue,
    saveVisitRetention,
    sceneryStyle,
    screen,
    selectedMapVenueId,
    setArchiveOffset,
    setArchiveVenueId,
    setArchiveVillagerId,
    setBusy,
    setFocusedProjectId,
    setKnowledgeDraft,
    setLoreTokenBudgetDraft,
    setLorebookDraft,
    setMapPinDraft,
    setMapRemoveDraft,
    setMenuPage,
    setNoticeDraft,
    setOpenArchivedVisit,
    setPersonaDraft,
    setPersonalizeHomes,
    setPlacingMapVenueId,
    setPlacingProjectId,
    setProgressDebug,
    setReframingMap,
    setRequestEdits,
    setResetArmed,
    setSceneryStyle,
    setScreen,
    setSelectedMapVenueId,
    setSettingDraft,
    setSettingsError,
    setSiteProjectId,
    setSnapshot,
    setTownMapDraft,
    setTownMapPick,
    setVenueEditDraft,
    setVenueSearch,
    setVisualLoreDefault,
    settingDraft,
    settingsError,
    siteProjectId,
    snapshot,
    startMapReplacement,
    startOver,
    suggestPlaces,
    townMapAdvice,
    townMapImage,
    townMapPick,
    townMapShape,
    townMapSrc,
    townMapZoom,
    venueEditDraft,
    venueSearch,
    venueVisits,
    venuesDraft,
    visualLoreDefault,
    writeItUpNow,
    writeUpNote,
  } = controller;

  // ── The dedicated menu screen ──────────────────────────────────────────────
  // The map is the homepage and carries no villager controls at all, so
  // everything you can change lives here behind one button that was already on
  // the map. It is written as two groups rather than one list because the split
  // is real: Village Management is the village, General settings is the tab.
  if (screen === "menu") {
    return (
      <div
        className={`${ELEMENT_TAG}-root ${ELEMENT_TAG}-sectioned-menu`}
        data-section={menuSection}
        data-page={menuPage}
        data-mobile={mobile}
      >
        <header className={`${ELEMENT_TAG}-header`}>
          <div>
            <h1 className={`${ELEMENT_TAG}-title`}>{MENU_PAGE_TITLES[menuPage]}</h1>
            {!mobile ? (
              <p className={`${ELEMENT_TAG}-subtitle`}>
                Everything you can change about the village lives here, away from the village itself.
              </p>
            ) : null}
          </div>
          <div className={`${ELEMENT_TAG}-actions`}>
            <button
              type="button"
              className={`${ELEMENT_TAG}-button`}
              onClick={menuPage !== "index" ? () => setMenuPage("index") : goHome}
            >
              {menuPage !== "index" ? "Back to menu" : "Back to the village"}
            </button>
          </div>
          {error ? (
            <p className={`${ELEMENT_TAG}-error`} role="alert">
              {error}
            </p>
          ) : null}
        </header>

        <nav className={`${ELEMENT_TAG}-menu-nav`} aria-label="Village menu pages">
          <div className={`${ELEMENT_TAG}-menu-group`}>
            <h2 className={`${ELEMENT_TAG}-panel-title`}>Village Management</h2>
            <div className={`${ELEMENT_TAG}-menu-group-buttons`}>
              <button
                type="button"
                className={`${ELEMENT_TAG}-button`}
                aria-pressed={menuPage === "villagers"}
                data-active={menuPage === "villagers" ? "true" : "false"}
                disabled={!snapshot || busy}
                onClick={() => openMenu("villagers")}
              >
                {`Villagers (${snapshot?.villagers.length ?? 0})`}
              </button>
              <button
                type="button"
                className={`${ELEMENT_TAG}-button`}
                aria-pressed={menuPage === "venueRequests"}
                data-active={menuPage === "venueRequests" ? "true" : "false"}
                disabled={!snapshot || busy}
                onClick={() => openMenu("venueRequests")}
              >
                {`Venue Requests (${(snapshot?.venueRequests?.length ?? 0) + (snapshot?.upgradeRequests?.length ?? 0) + (snapshot?.residences?.filter((entry) => entry.status === "pending" && entry.requestedBy === "villager").length ?? 0)})`}
              </button>
              <button
                type="button"
                className={`${ELEMENT_TAG}-button`}
                aria-pressed={menuPage === "projects"}
                data-active={menuPage === "projects" ? "true" : "false"}
                disabled={!snapshot || busy}
                onClick={() => openMenu("projects")}
              >{`Projects (${snapshot?.projects?.filter((entry) => (entry.kind === "new-venue" || entry.kind === "renovation") && entry.lifecycle?.phase !== "complete").length ?? 0})`}</button>
              <button
                type="button"
                className={`${ELEMENT_TAG}-button`}
                aria-pressed={menuPage === "village"}
                data-active={menuPage === "village" ? "true" : "false"}
                onClick={() => openMenu("village")}
              >
                Village Settings
              </button>
            </div>
          </div>
          <div className={`${ELEMENT_TAG}-menu-group`}>
            <h2 className={`${ELEMENT_TAG}-panel-title`}>General Settings</h2>
            <div className={`${ELEMENT_TAG}-menu-group-buttons`}>
              <button
                type="button"
                className={`${ELEMENT_TAG}-button`}
                aria-pressed={menuPage === "general"}
                data-active={menuPage === "general" ? "true" : "false"}
                onClick={() => openMenu("general")}
              >
                General settings
              </button>
            </div>
          </div>
          <div className={`${ELEMENT_TAG}-menu-group`}>
            <h2 className={`${ELEMENT_TAG}-panel-title`}>Debug</h2>
            <div className={`${ELEMENT_TAG}-menu-group-buttons`}>
              {debugDiscardEnabled ? (
                <button
                  type="button"
                  className={`${ELEMENT_TAG}-button`}
                  aria-pressed={menuPage === "progress"}
                  data-active={menuPage === "progress" ? "true" : "false"}
                  disabled={!snapshot || busy}
                  onClick={() => openMenu("progress")}
                >
                  DEBUG: Progress
                </button>
              ) : null}
              <button
                type="button"
                className={`${ELEMENT_TAG}-button`}
                aria-pressed={menuPage === "chatlogs"}
                data-active={menuPage === "chatlogs" ? "true" : "false"}
                disabled={!snapshot || busy}
                onClick={() => openMenu("chatlogs")}
              >
                {`DEBUG: Scenes (${venueVisits?.length ?? 0})`}
              </button>
            </div>
          </div>
        </nav>

        {menuPage === "index" ? (
          <section
            className={`${ELEMENT_TAG}-panel ${ELEMENT_TAG}-menu-content ${ELEMENT_TAG}-menu-welcome`}
            role="main"
          >
            {backgroundPanel}
            <span className={`${ELEMENT_TAG}-venue-kicker`}>Village menu</span>
            <h2>Choose where to go</h2>
            <p>Manage the people and places in your village, adjust settings, or inspect its DEBUG records.</p>
            <div className={`${ELEMENT_TAG}-menu-quick-links`}>
              <button
                type="button"
                className={ELEMENT_TAG + "-button"}
                disabled={!snapshot || busy}
                onClick={() => openMenu("events")}
              >
                Events
              </button>
              <button type="button" className={`${ELEMENT_TAG}-button`} onClick={() => openMenu("villagers")}>
                Village Management
              </button>
              <button type="button" className={`${ELEMENT_TAG}-button`} onClick={() => openMenu("general")}>
                General Settings
              </button>
              <button type="button" className={`${ELEMENT_TAG}-button`} onClick={() => openMenu("chatlogs")}>
                DEBUG Settings
              </button>
            </div>
          </section>
        ) : menuPage === "events" && snapshot ? (
          <section className={ELEMENT_TAG + "-menu-content " + ELEMENT_TAG + "-mobile-events-page"} role="main">
            <VillageEvents happenings={snapshot.happenings} recap={snapshot.recap} mobile={mobile} inline />
          </section>
        ) : !snapshot && menuPage !== "general" ? (
          <section className={`${ELEMENT_TAG}-panel ${ELEMENT_TAG}-menu-content`} role="main">
            {error ? "The village could not be loaded. Return to the village and try again." : "Loading village menu…"}
          </section>
        ) : menuPage === "general" ? (
          <section className={`${ELEMENT_TAG}-panel ${ELEMENT_TAG}-menu-content`} role="main">
            {backgroundPanel}
            <h2 className={`${ELEMENT_TAG}-panel-title`}>General settings</h2>

            {/* Drawn before the village is founded as well as after, because
                these belong to the agent rather than to the village. */}
            <AgentConnections />

            {snapshot ? (
              <div className={`${ELEMENT_TAG}-field`}>
                <label className={`${ELEMENT_TAG}-row`} htmlFor={`${ELEMENT_TAG}-send-on-enter`}>
                  <input
                    id={`${ELEMENT_TAG}-send-on-enter`}
                    type="checkbox"
                    checked={snapshot.settings.sendOnEnter === true}
                    disabled={busy}
                    onChange={(event) => void saveSendOnEnter(event.target.checked)}
                  />
                  <span>Send on Enter</span>
                </label>
                <span className={`${ELEMENT_TAG}-hint`}>
                  Send Scene messages with Enter. Off inserts a new line. Shift+Enter always inserts a new line.
                </span>
              </div>
            ) : null}

            {snapshot ? (
              <div className={`${ELEMENT_TAG}-field`}>
                <label className={`${ELEMENT_TAG}-row`} htmlFor={`${ELEMENT_TAG}-speech-colors`}>
                  <input
                    id={`${ELEMENT_TAG}-speech-colors`}
                    type="checkbox"
                    checked={snapshot.settings.characterSpeechColors}
                    disabled={busy}
                    onChange={(event) => void saveCharacterSpeechColors(event.target.checked)}
                  />
                  <span>Character chat colors</span>
                </label>
                <span className={`${ELEMENT_TAG}-hint`}>
                  Show names and spoken words in the colors captured from each villager’s card. Use Compare card and
                  Apply refresh to adopt later color changes.
                </span>
              </div>
            ) : null}

            {snapshot ? (
              <div className={`${ELEMENT_TAG}-field`}>
                <label className={`${ELEMENT_TAG}-label`} htmlFor={`${ELEMENT_TAG}-story-pace`}>
                  Background events and wishes
                </label>
                <p className={`${ELEMENT_TAG}-empty`}>
                  Controls automatic Events, resident housing proposals from those events, and new wishes. Off pauses
                  these. Time, schedules, approved moves, construction, and existing wish expiry continue. Scenes and
                  other generation features use their own controls. All enabled levels allow at most one new wish per
                  resident per day and two active wishes; quiet days can have none.
                </p>
                <select
                  id={`${ELEMENT_TAG}-story-pace`}
                  value={snapshot.settings.storyPace}
                  disabled={busy}
                  onChange={(event) => void saveStoryPace(event.target.value as VillageStoryPace)}
                >
                  {snapshot.settings.storyPaces.map((pace) => (
                    <option key={pace} value={pace}>
                      {pace.charAt(0).toUpperCase() + pace.slice(1)}
                    </option>
                  ))}
                </select>
                <span className={`${ELEMENT_TAG}-hint`}>{storyPaceSummary(snapshot.settings.storyPace)}</span>
              </div>
            ) : null}

            {snapshot ? (
              <div className={`${ELEMENT_TAG}-field`}>
                <label className={`${ELEMENT_TAG}-label`} htmlFor={`${ELEMENT_TAG}-visit-retention`}>
                  Scene transcripts
                </label>
                <p className={`${ELEMENT_TAG}-empty`}>
                  Exact Scene logs are kept forever by default. Automatic cleanup skips Scenes with memory pending and
                  keeps filed memories and world changes.
                </p>
                <select
                  id={`${ELEMENT_TAG}-visit-retention`}
                  value={snapshot.settings.visitRetention.mode}
                  disabled={busy}
                  onChange={(event) => {
                    const mode = event.target.value as VillageSettings["visitRetention"]["mode"];
                    void saveVisitRetention({ mode, value: mode === "count" ? 100 : mode === "days" ? 365 : 0 });
                  }}
                >
                  <option value="forever">Keep forever</option>
                  <option value="count">Keep latest Scenes</option>
                  <option value="days">Retire after days</option>
                </select>
                {snapshot.settings.visitRetention.mode !== "forever" ? (
                  <input
                    key={`${snapshot.settings.visitRetention.mode}:${snapshot.settings.visitRetention.value}`}
                    type="number"
                    aria-label={
                      snapshot.settings.visitRetention.mode === "count"
                        ? "Number of Scenes to keep"
                        : "Days to keep Scenes"
                    }
                    min={snapshot.settings.visitRetention.mode === "count" ? 1 : 30}
                    max={snapshot.settings.visitRetention.mode === "count" ? 1000 : 3650}
                    defaultValue={snapshot.settings.visitRetention.value}
                    onBlur={(event) => {
                      const value = Number(event.target.value);
                      if (value !== snapshot.settings.visitRetention.value)
                        void saveVisitRetention({ mode: snapshot.settings.visitRetention.mode, value });
                    }}
                  />
                ) : null}
              </div>
            ) : null}

            <div className={`${ELEMENT_TAG}-field`}>
              <span className={`${ELEMENT_TAG}-label`}>Starting over</span>
              <p className={`${ELEMENT_TAG}-empty`}>
                This is not the same thing. It takes the village apart completely — the villagers, their conversations,
                the places, the noticeboard, your own details and the map — and hands you an empty one. There is no way
                back.
              </p>
              <div className={`${ELEMENT_TAG}-row`}>
                {resetArmed ? (
                  <>
                    <button
                      type="button"
                      className={`${ELEMENT_TAG}-button ${ELEMENT_TAG}-danger`}
                      disabled={busy}
                      onClick={() => void startOver()}
                    >
                      Yes, empty the village
                    </button>
                    <button
                      type="button"
                      className={`${ELEMENT_TAG}-button`}
                      disabled={busy}
                      onClick={() => setResetArmed(false)}
                    >
                      Keep it
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className={`${ELEMENT_TAG}-button`}
                    disabled={busy || !snapshot}
                    onClick={() => setResetArmed(true)}
                  >
                    Reset the village and start over
                  </button>
                )}
              </div>
            </div>

            {settingsError ? (
              <p className={`${ELEMENT_TAG}-error`} role="alert">
                {settingsError}
              </p>
            ) : null}
          </section>
        ) : menuPage === "village" ? (
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
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  setSettingsError("");
                  try {
                    setSnapshot(
                      await request<VillageSnapshot>("/settings", {
                        method: "PATCH",
                        body: JSON.stringify({
                          sceneryArtStyle: sceneryStyle,
                          personalizeVenueImagesByDefault: personalizeHomes,
                          useVisualLoreByDefault: visualLoreDefault,
                        }),
                      }),
                    );
                  } catch (cause) {
                    setSettingsError(messageFrom(cause, "Scenery settings could not be saved."));
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Save scenery settings
              </button>
            </section>

            {backgroundPanel}
            {snapshot ? (
              <section className={`${ELEMENT_TAG}-panel`}>
                <h2 className={`${ELEMENT_TAG}-panel-title`}>Village settings</h2>
                <p className={`${ELEMENT_TAG}-empty`}>
                  These choices belong to this village. Resident cards shape their voices, and Villages writes each
                  scene around what is happening now. Village knowledge is refreshed for every reply.
                </p>

                <VillageWritingSettings />

                <section className={ELEMENT_TAG + "-field"} aria-label="Village Map">
                  <h3 className={ELEMENT_TAG + "-panel-title"}>Village Map</h3>
                  <p className={ELEMENT_TAG + "-hint"}>
                    Replace the background image here. Venue photographs remain in their saved places until you
                    reposition them in the preview.
                  </p>
                  {mapReplaceOpen ? (
                    <p className={ELEMENT_TAG + "-error"} role="alert">
                      Venues will not move automatically. Review every Venue photograph on the new map; moving one here
                      is free and does not change its residents, projects, or history.
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
                            Select a venue, then choose Move photograph and its new position on the preview. Unmoved
                            venues keep their saved coordinates.
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
                                    {spot?.x !== null &&
                                    spot?.x !== undefined &&
                                    spot?.y !== null &&
                                    spot?.y !== undefined
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
                        <div
                          className={ELEMENT_TAG + "-steps"}
                          role="group"
                          aria-label="How the picture sits in the frame"
                        >
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
                      <div
                        className={ELEMENT_TAG + "-steps"}
                        role="group"
                        aria-label="How the picture sits in the frame"
                      >
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
                      <button
                        type="button"
                        className={ELEMENT_TAG + "-button"}
                        disabled={busy}
                        onClick={startMapReplacement}
                      >
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
                    Revisit the founding setup to update the village as it stands now. Its original starting
                    circumstances stay in the founding record.
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
                    Maximum approximate lore tokens in future text generation. Image prompts keep a separate short
                    excerpt.
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
                    Each Venue is one unique place. Its physical form describes its structure; one or two Classes
                    describe what people do there.
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
                        <button
                          type="button"
                          className={`${ELEMENT_TAG}-button`}
                          onClick={() => setVenueEditDraft(null)}
                        >
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
                        <button
                          type="button"
                          className={`${ELEMENT_TAG}-button`}
                          onClick={() => setVenueEditDraft(venue)}
                        >
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
                    What a villager here knows, written as tokens the village fills in for itself: the time, the
                    weather, who else lives here, what is on the noticeboard. Because it is written out fresh on every
                    reply, a villager here is always current — and because it is only these tokens, adding a place or
                    pinning a note reaches every villager without anything being edited here. A resident&apos;s card
                    guides their voice; additional writing guidance is in Village Settings.
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
                    Click a token to drop it in at the cursor of the box. A token with nothing behind it turns into
                    nothing at all, so <code>{"{{lore}}"}</code> can sit in the prompt until there is lore to put there.
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
        ) : (
          // The four panels that used to be stacked beside the map. They are
          // unchanged; only what opens them has moved. `Look again` in the nav
          // reads the village afresh, so a panel is never stale by the time it
          // is opened.
          <div className={`${ELEMENT_TAG}-menu-body ${ELEMENT_TAG}-menu-content`} role="main">
            {backgroundPanel}
            {menuSection === "debug" ? <VillagesRuntimeDebug /> : null}
            {menuSection === "debug" ? (
              <section className={`${ELEMENT_TAG}-panel ${ELEMENT_TAG}-menu-debug-action`}>
                <button
                  type="button"
                  className={`${ELEMENT_TAG}-button`}
                  disabled={!snapshot || busy || catchingUp}
                  onClick={() => void writeItUpNow()}
                >
                  Force Village Update
                </button>
                <p className={`${ELEMENT_TAG}-status`}>{FORCE_VILLAGE_UPDATE_NOTICE}</p>
                {writeUpNote ? (
                  <p className={`${ELEMENT_TAG}-status`} role="status">
                    {writeUpNote}
                  </p>
                ) : null}
              </section>
            ) : null}
            {menuPage === "noticeboard" && snapshot ? (
              <div className={`${ELEMENT_TAG}-overlay`}>
                <div className={`${ELEMENT_TAG}-overlay-head`}>
                  <h2 className={`${ELEMENT_TAG}-panel-title`}>Noticeboard</h2>
                </div>
                {snapshot.noticeboard.length === 0 ? (
                  <p className={`${ELEMENT_TAG}-empty`}>
                    Nothing is pinned up. Anything you add here is something the villagers can bring up in conversation
                    — and they will pin notes of their own up as time goes on.
                  </p>
                ) : (
                  <ul className={`${ELEMENT_TAG}-notices`}>
                    {snapshot.noticeboard.map((notice, index) => (
                      <li key={`${index}:${notice.text}`} className={`${ELEMENT_TAG}-notice-row`}>
                        <span>
                          {/* The signature first, the way a note on a board is
                              read: who is asking, then what they want. Your
                              own pins have no name on them — everyone here
                              already knows who you are. */}
                          {notice.author.length > 0 ? (
                            <span className={`${ELEMENT_TAG}-notice-author`}>{`${notice.author}: `}</span>
                          ) : null}
                          {notice.text}
                        </span>
                        <button
                          type="button"
                          className={`${ELEMENT_TAG}-remove`}
                          onClick={() => void removeNotice(index)}
                          disabled={busy}
                          aria-label={`Take down: ${notice.text}`}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className={`${ELEMENT_TAG}-notice-add`}>
                  <input
                    className={`${ELEMENT_TAG}-notice-input`}
                    type="text"
                    value={noticeDraft}
                    maxLength={snapshot.settings.maxNoticeLength}
                    placeholder="Pin up a rumour, an event, a rule…"
                    aria-label="New noticeboard note"
                    onChange={(event) => setNoticeDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter") return;
                      event.preventDefault();
                      void addNotice();
                    }}
                  />
                  <button
                    type="button"
                    className={`${ELEMENT_TAG}-button`}
                    onClick={() => void addNotice()}
                    disabled={
                      busy ||
                      noticeDraft.trim().length === 0 ||
                      snapshot.noticeboard.length >= snapshot.settings.maxNoticeboardNotes
                    }
                  >
                    {`Pin it up (${snapshot.noticeboard.length}/${snapshot.settings.maxNoticeboardNotes})`}
                  </button>
                </div>
              </div>
            ) : null}

            {menuPage === "projects" && snapshot ? (
              <ProjectsPanelV2
                snapshot={snapshot}
                room={room}
                onSnapshot={setSnapshot}
                onReturn={() => setScreen("room")}
                onMap={() => {
                  setSiteProjectId("");
                  goHome();
                }}
                onPlaceOnMap={(projectId) => {
                  setFocusedProjectId(projectId);
                  setPlacingProjectId(projectId);
                  goHome();
                }}
                mobile={mobile}
                debugEnabled={debugDiscardEnabled}
                focusProjectId={focusedProjectId}
                siteProjectId={siteProjectId}
              />
            ) : null}
            {menuPage === "venueRequests" && snapshot ? (
              <div className={`${ELEMENT_TAG}-overlay`}>
                <div className={`${ELEMENT_TAG}-overlay-head`}>
                  <h2 className={`${ELEMENT_TAG}-panel-title`}>Venue Requests</h2>
                </div>
                <p className={`${ELEMENT_TAG}-macro-help`}>
                  Villagers can ask for places in conversation. Accepting a request starts a New Venue Project; place
                  its blueprint on the map, find a willing Builder, and work through the Project phases.
                </p>
                {snapshot.venueRequests.length === 0 ? (
                  <p className={`${ELEMENT_TAG}-empty`}>Nobody has requested a new place.</p>
                ) : (
                  <ul className={`${ELEMENT_TAG}-notices`}>
                    {snapshot.venueRequests.map((entry) => {
                      const draft = requestEdits[entry.id] ?? entry.venueDraft;
                      const edit = (patch: Partial<typeof draft>) =>
                        setRequestEdits((current) => ({ ...current, [entry.id]: { ...draft, ...patch } }));
                      return (
                        <li
                          key={entry.id}
                          className={`${ELEMENT_TAG}-notice-row`}
                          data-villager-request={"request:" + entry.id}
                          tabIndex={-1}
                        >
                          <div className={`${ELEMENT_TAG}-field`}>
                            <strong>{entry.requesterName || "A villager"}</strong>
                            {entry.requestQuote ? <p>“{entry.requestQuote}”</p> : null}
                            <span className={`${ELEMENT_TAG}-hint`}>
                              {` · ${entry.source === "chat" ? "Conversation" : "Village life"}`}
                            </span>
                            <input
                              className={`${ELEMENT_TAG}-notice-input`}
                              value={draft.name}
                              maxLength={snapshot.settings.maxVenueNameLength}
                              aria-label={`Requested place name from ${entry.requesterName || "villager"}`}
                              onChange={(event) => edit({ name: event.target.value })}
                            />
                            <select
                              className={`${ELEMENT_TAG}-notice-input`}
                              value={draft.classes[0] ?? "gathering"}
                              aria-label={`Requested place class from ${entry.requesterName || "villager"}`}
                              onChange={(event) =>
                                edit({ classes: [event.target.value as (typeof draft.classes)[number]] })
                              }
                            >
                              <option value="residence">Residence</option>
                              <option value="gathering">Gathering</option>
                              <option value="workplace">Workplace</option>
                              <option value="other">Other</option>
                            </select>
                            <textarea
                              className={`${ELEMENT_TAG}-textarea`}
                              value={draft.description ?? ""}
                              maxLength={1000}
                              aria-label={`Requested place description from ${entry.requesterName || "villager"}`}
                              onChange={(event) => edit({ description: event.target.value })}
                            />
                            <button
                              type="button"
                              className={`${ELEMENT_TAG}-button`}
                              disabled={busy || !draft.name.trim()}
                              onClick={() => {
                                setBusy(true);
                                setSettingsError("");
                                void request<{ descriptions: Record<string, string> }>(
                                  "/locations/venue/descriptions/draft",
                                  {
                                    method: "POST",
                                    body: JSON.stringify({
                                      venues: [{ id: entry.id, name: draft.name, classes: draft.classes }],
                                    }),
                                  },
                                )
                                  .then((result) => edit({ description: result.descriptions[entry.id] ?? "" }))
                                  .catch((cause) =>
                                    setSettingsError(
                                      messageFrom(cause, "The description draft could not be generated."),
                                    ),
                                  )
                                  .finally(() => setBusy(false));
                              }}
                            >
                              Generate description draft
                            </button>
                            <div className={`${ELEMENT_TAG}-row`}>
                              <button
                                type="button"
                                className={`${ELEMENT_TAG}-button`}
                                disabled={
                                  busy || !draft.name.trim() || draft.classes.length === 0 || !draft.description?.trim()
                                }
                                onClick={() => void decideVenueRequest(entry, true)}
                              >
                                {draft.name !== entry.venueDraft.name ||
                                JSON.stringify(draft.classes) !== JSON.stringify(entry.venueDraft.classes)
                                  ? "Send counteroffer"
                                  : "Start planning project"}
                              </button>
                              <button
                                type="button"
                                className={`${ELEMENT_TAG}-button`}
                                disabled={busy}
                                onClick={() => void decideVenueRequest(entry, false)}
                              >
                                Deny
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
                <h3 className={`${ELEMENT_TAG}-panel-title`}>Home upgrade requests</h3>
                {snapshot.upgradeRequests.length === 0 ? (
                  <p className={`${ELEMENT_TAG}-hint`}>No home upgrades requested.</p>
                ) : (
                  snapshot.upgradeRequests.map((entry) => (
                    <div
                      key={entry.id}
                      className={`${ELEMENT_TAG}-notice-row`}
                      data-villager-request={"upgrade:" + entry.id}
                      tabIndex={-1}
                    >
                      <span>{entry.detail}</span>
                      {([true, false] as const).map((approved) => (
                        <button
                          key={String(approved)}
                          type="button"
                          className={`${ELEMENT_TAG}-button`}
                          disabled={busy}
                          onClick={() => {
                            setBusy(true);
                            setSettingsError("");
                            void request<VillageSnapshot>(
                              `/venue-upgrades/${encodeURIComponent(entry.id)}/${approved ? "approve" : "deny"}`,
                              { method: "POST" },
                            )
                              .then(setSnapshot)
                              .catch((cause) =>
                                setSettingsError(messageFrom(cause, "The upgrade request could not be decided.")),
                              )
                              .finally(() => setBusy(false));
                          }}
                        >
                          {approved ? "Approve upgrade" : "Deny"}
                        </button>
                      ))}
                    </div>
                  ))
                )}
                <h3 className={`${ELEMENT_TAG}-panel-title`}>Resident move requests</h3>
                {snapshot.residences.filter((entry) => entry.status !== "current").length === 0 ? (
                  <p className={`${ELEMENT_TAG}-hint`}>No moves pending.</p>
                ) : (
                  snapshot.residences
                    .filter((entry) => entry.status !== "current")
                    .map((entry) => {
                      const name = nameOfCharacter(entry.characterId);
                      const target =
                        snapshot.settings.venues.find((venue) => venue.id === entry.proposedVenueId)?.name ||
                        "another venue";
                      return (
                        <div
                          key={entry.characterId}
                          className={`${ELEMENT_TAG}-notice-row`}
                          data-villager-request={"residence:" + entry.characterId}
                          tabIndex={-1}
                        >
                          <span>{`${name} → ${target}`}</span>
                          {entry.status === "moving" ? (
                            <>
                              <span className={`${ELEMENT_TAG}-hint`}>
                                Move due {new Date(entry.completesAt ?? "").toLocaleString()}
                              </span>
                              <button
                                type="button"
                                className={`${ELEMENT_TAG}-button`}
                                disabled={busy}
                                onClick={() => {
                                  setBusy(true);
                                  setSettingsError("");
                                  void request<VillageSnapshot>("/residences/debug/complete-now", {
                                    method: "POST",
                                    body: JSON.stringify({ characterId: entry.characterId }),
                                  })
                                    .then(setSnapshot)
                                    .catch((cause) =>
                                      setSettingsError(messageFrom(cause, "The move could not be completed.")),
                                    )
                                    .finally(() => setBusy(false));
                                }}
                              >
                                DEBUG: Complete move now
                              </button>
                            </>
                          ) : entry.requestedBy === "player" ? (
                            <span className={`${ELEMENT_TAG}-hint`}>
                              Awaiting {name}&apos;s answer in conversation.
                            </span>
                          ) : (
                            ([true, false] as const).map((approved) => (
                              <button
                                key={String(approved)}
                                type="button"
                                className={`${ELEMENT_TAG}-button`}
                                disabled={busy}
                                onClick={() => {
                                  setBusy(true);
                                  setSettingsError("");
                                  void request<VillageSnapshot>(`/residences/${approved ? "approvals" : "denials"}`, {
                                    method: "POST",
                                    body: JSON.stringify({ characterId: entry.characterId }),
                                  })
                                    .then(setSnapshot)
                                    .catch((cause) =>
                                      setSettingsError(messageFrom(cause, "The move request could not be decided.")),
                                    )
                                    .finally(() => setBusy(false));
                                }}
                              >
                                {approved ? "Approve move" : "Deny"}
                              </button>
                            ))
                          )}
                        </div>
                      );
                    })
                )}
                {settingsError ? (
                  <p className={`${ELEMENT_TAG}-error`} role="alert">
                    {settingsError}
                  </p>
                ) : null}
              </div>
            ) : null}

            {menuPage === "progress" ? (
              <div className={`${ELEMENT_TAG}-panel`}>
                <h2>DEBUG: Progress</h2>
                <p>Engine version: {progressDebug?.engineVersion ?? "loading"}</p>
                <button
                  type="button"
                  className={`${ELEMENT_TAG}-button`}
                  onClick={() => void request<ProgressDebugView>("/progress/debug").then(setProgressDebug)}
                >
                  Refresh diagnostics
                </button>
                {progressDebug?.backlog.length ? (
                  <section>
                    <h3>Unprocessed saved turns</h3>
                    {progressDebug.backlog.map((turn) => (
                      <p key={`${turn.sessionId}:${turn.submissionId}`}>
                        {turn.at} · {turn.sessionId}/{turn.submissionId}{" "}
                        {turn.error ? `· ${turn.error}` : "· awaiting replay"}
                      </p>
                    ))}
                  </section>
                ) : (
                  <p>No saved turns await replay.</p>
                )}
                {progressDebug?.speechProofs?.length ? (
                  <section>
                    <h3>Captured Project speech</h3>
                    {progressDebug.speechProofs.map((proof) => (
                      <p key={`${proof.projectId}:${proof.lineId}`}>
                        {proof.projectId} · {proof.grade ?? "typed"} · {proof.lineId}: “{proof.quote}”
                        {proof.citations?.map((citation, index) => (
                          <span key={`${citation.lineId}:${index}`}>
                            {" "}
                            · {citation.lineId}: “{citation.quote}”
                          </span>
                        ))}
                      </p>
                    ))}
                  </section>
                ) : null}
                {progressDebug?.tasks.map((task) => (
                  <details key={task.definition.id} open>
                    <summary>
                      {task.definition.owner.kind} {task.definition.owner.id} · revision {task.definition.revision} ·{" "}
                      {task.resolvedAt ? "resolved" : (task.definition.phases[task.phaseIndex]?.title ?? "complete")}
                    </summary>
                    <p>
                      Disclosed: {task.visibleAt || "hidden"}
                      {task.resolvedAt ? ` · Resolved: ${task.resolvedAt} · ${task.resolutionKey}` : ""}
                    </p>
                    {task.definition.phases.map((phase) => (
                      <section key={phase.id}>
                        <h3>{phase.title}</h3>
                        {phase.requirements.map((requirement) => {
                          const receipts = task.receipts.filter(
                            (receipt) => receipt.phaseId === phase.id && receipt.requirementId === requirement.id,
                          );
                          return (
                            <p key={requirement.id}>
                              {requirement.title} · {task.requirementVisibleAt[requirement.id] || "hidden"} ·{" "}
                              {receipts.length
                                ? receipts
                                    .map(
                                      (receipt) =>
                                        `${receipt.routeId} [${receipt.evidence.grade ?? "typed"}]: ${receipt.evidence.sourceId} ${receipt.evidence.excerpt ?? ""} ${(receipt.evidence.citations ?? []).map((citation) => `${citation.lineId}: ${citation.quote}`).join("; ")}`,
                                    )
                                    .join("; ")
                                : "pending"}
                            </p>
                          );
                        })}
                      </section>
                    ))}
                    {task.attempts.length ? (
                      <section>
                        <h3>Rejected or unavailable</h3>
                        {task.attempts.map((attempt, index) => (
                          <p key={`${attempt.evidenceId}:${index}`}>
                            {attempt.phaseId}/{attempt.requirementId} · {attempt.status}: {attempt.reason}
                          </p>
                        ))}
                      </section>
                    ) : null}
                    {task.transitions.length ? (
                      <section>
                        <h3>Transitions</h3>
                        {task.transitions.map((transition, index) => (
                          <p key={`${transition.phaseId}:${index}`}>
                            {transition.phaseId} → {transition.at} · {transition.evidenceId}
                          </p>
                        ))}
                      </section>
                    ) : null}
                    {task.revisionHistory?.map((prior) => (
                      <details key={prior.definition.revision}>
                        <summary>
                          Earlier revision {prior.definition.revision} · {prior.receipts.length} accepted sources
                        </summary>
                        {prior.receipts.map((receipt) => (
                          <p key={`${receipt.requirementId}:${receipt.evidence.sourceId}`}>
                            {receipt.requirementId} · {receipt.evidence.grade ?? "typed"} · {receipt.evidence.sourceId}{" "}
                            · {receipt.evidence.excerpt ?? ""}
                            {receipt.evidence.citations?.map((citation) => (
                              <span key={`${citation.lineId}:${citation.quote}`}>
                                {" "}
                                · {citation.lineId}: “{citation.quote}”
                              </span>
                            ))}
                          </p>
                        ))}
                        {prior.transitions.map((transition, index) => (
                          <p key={`${transition.phaseId}:${index}`}>
                            {transition.phaseId} → {transition.at}
                          </p>
                        ))}
                      </details>
                    ))}
                  </details>
                ))}
                {error ? (
                  <p className={`${ELEMENT_TAG}-error`} role="alert">
                    {error}
                  </p>
                ) : null}
              </div>
            ) : null}

            {menuPage === "chatlogs" ? (
              <div className={`${ELEMENT_TAG}-overlay`}>
                <div className={`${ELEMENT_TAG}-overlay-head`}>
                  <h2 className={`${ELEMENT_TAG}-panel-title`}>Scenes</h2>
                </div>
                <p className={`${ELEMENT_TAG}-empty`}>
                  Completed Scenes are kept here word for word. Filter by place or resident; each Scene has one shared
                  record, including who heard each line. The village uses only the separately distilled memories.
                </p>
                <div className={`${ELEMENT_TAG}-row`}>
                  <select
                    aria-label="Filter Scenes by venue"
                    value={archiveVenueId}
                    onChange={(event) => {
                      setArchiveVenueId(event.target.value);
                      setArchiveOffset(0);
                      setOpenArchivedVisit(null);
                    }}
                  >
                    <option value="">All venues</option>
                    {(snapshot?.settings.venues ?? []).map((venue) => (
                      <option key={venue.id} value={venue.id}>
                        {venue.name}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label="Filter Scenes by resident"
                    value={archiveVillagerId}
                    onChange={(event) => {
                      setArchiveVillagerId(event.target.value);
                      setArchiveOffset(0);
                      setOpenArchivedVisit(null);
                    }}
                  >
                    <option value="">All residents</option>
                    {(snapshot?.villagers ?? []).map((villager) => (
                      <option key={villager.characterId} value={villager.characterId}>
                        {villager.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  className={`${ELEMENT_TAG}-button`}
                  disabled={busy || archiveTotal === 0}
                  onClick={() => void deleteArchivedVisits()}
                >
                  Delete all completed logs
                </button>
                {archiveError ? (
                  <p className={`${ELEMENT_TAG}-error`} role="alert">
                    {archiveError}
                  </p>
                ) : null}
                {venueVisits === null ? (
                  <p className={`${ELEMENT_TAG}-empty`}>Reading Scenes…</p>
                ) : venueVisits.length === 0 ? (
                  <p className={`${ELEMENT_TAG}-empty`}>No completed Scenes match these filters.</p>
                ) : (
                  venueVisits.map((visit) => (
                    <section key={visit.id}>
                      <h3 className={`${ELEMENT_TAG}-story-day`}>
                        {visit.placeName} · {stampTime(visit.startedAt)}
                      </h3>
                      <p className={`${ELEMENT_TAG}-story-meta`}>
                        {visit.participants.map((person) => person.name).join(", ")} · {visit.lineCount} lines
                        {visit.endReason === "inactivity" ? " · Interrupted: Inactivity" : ""}
                      </p>
                      <div className={`${ELEMENT_TAG}-row`}>
                        <button
                          type="button"
                          className={`${ELEMENT_TAG}-button`}
                          onClick={() => void openVisit(visit.id)}
                        >
                          {openArchivedVisit?.id === visit.id ? "Refresh transcript" : "Open transcript"}
                        </button>

                        <button
                          type="button"
                          className={`${ELEMENT_TAG}-button`}
                          disabled={busy}
                          onClick={() => void deleteArchivedVisits(visit.id)}
                        >
                          Delete log
                        </button>
                      </div>
                      {openArchivedVisit?.id === visit.id ? (
                        <>
                          <ul className={`${ELEMENT_TAG}-story`}>
                            {openArchivedVisit.lines.map((line, index) => (
                              <li key={`${visit.id}:${index}`} className={`${ELEMENT_TAG}-story-row`}>
                                <span>
                                  <span className={`${ELEMENT_TAG}-story-meta`}>
                                    <span
                                      style={
                                        snapshot?.settings.characterSpeechColors &&
                                        line.role === "assistant" &&
                                        line.kind !== "narration"
                                          ? villagesSpeechPaintStyle(
                                              snapshot.villagers.find(
                                                (villager) => villager.characterId === line.speakerId,
                                              )?.nameColor,
                                            )
                                          : undefined
                                      }
                                    >
                                      {line.name || playerDisplayName(snapshot)}
                                    </span>
                                    {" · "}
                                    {stampTime(line.at)}
                                  </span>
                                  <span
                                    style={
                                      snapshot?.settings.characterSpeechColors &&
                                      line.role === "assistant" &&
                                      line.kind !== "narration"
                                        ? villagesSpeechPaintStyle(
                                            snapshot.villagers.find(
                                              (villager) => villager.characterId === line.speakerId,
                                            )?.dialogueColor,
                                          )
                                        : undefined
                                    }
                                  >
                                    {renderVillagesMarkdown(line.content, `venue-${visit.id}-${index}-`)}
                                  </span>
                                  <span className={`${ELEMENT_TAG}-story-meta`}>
                                    Heard by:{" "}
                                    {line.heardBy
                                      ?.map(
                                        (id) =>
                                          openArchivedVisit.participants.find((person) => person.characterId === id)
                                            ?.name ?? id,
                                      )
                                      .join(", ") || "no one"}
                                  </span>
                                </span>
                              </li>
                            ))}
                          </ul>
                          {(openArchivedVisit.submissions ?? []).some(
                            (submission) => submission.recollections?.length,
                          ) ? (
                            <details className={`${ELEMENT_TAG}-agenda-notes`}>
                              <summary>Captured recollections and evidence</summary>
                              <ul className={`${ELEMENT_TAG}-story`}>
                                {(openArchivedVisit.submissions ?? []).flatMap((submission) =>
                                  (submission.recollections ?? []).map((recollection) => (
                                    <li key={recollection.id} className={`${ELEMENT_TAG}-wish-card`}>
                                      <p className={`${ELEMENT_TAG}-wish-text`}>{recollection.text}</p>
                                      <p className={`${ELEMENT_TAG}-wish-meta`}>
                                        {`Subjects: ${recollection.subjectCharacterIds.join(", ") || "none"} · Known by: ${recollection.knownByCharacterIds.join(", ")}`}
                                      </p>
                                      <p className={`${ELEMENT_TAG}-wish-meta`}>
                                        {`Evidence: ${recollection.lineIds.join(", ")}`}
                                      </p>
                                    </li>
                                  )),
                                )}
                              </ul>
                            </details>
                          ) : null}
                        </>
                      ) : null}
                    </section>
                  ))
                )}
                {archiveTotal > 20 ? (
                  <div className={`${ELEMENT_TAG}-row`}>
                    <button
                      type="button"
                      className={`${ELEMENT_TAG}-button`}
                      disabled={archiveOffset === 0}
                      onClick={() => {
                        setArchiveOffset(Math.max(0, archiveOffset - 20));
                        setOpenArchivedVisit(null);
                      }}
                    >
                      Previous
                    </button>
                    <span>
                      {archiveOffset + 1}–{Math.min(archiveTotal, archiveOffset + 20)} of {archiveTotal}
                    </span>
                    <button
                      type="button"
                      className={`${ELEMENT_TAG}-button`}
                      disabled={archiveOffset + 20 >= archiveTotal}
                      onClick={() => {
                        setArchiveOffset(archiveOffset + 20);
                        setOpenArchivedVisit(null);
                      }}
                    >
                      Next
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}

            {settingsError ? (
              <p className={`${ELEMENT_TAG}-error`} role="alert">
                {settingsError}
              </p>
            ) : null}
          </div>
        )}
      </div>
    );
  }
  return null;
}
