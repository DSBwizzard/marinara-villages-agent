import { ELEMENT_TAG } from "../shared/constants.js";
import { FORCE_VILLAGE_UPDATE_NOTICE, MENU_PAGE_TITLES } from "./navigation.js";
import { renderEventsPage } from "../features/background/EventsPage.js";
import { renderProgressDebugPage } from "../features/background/ProgressDebugPage.js";
import { renderProjectsPage } from "../features/projects/ProjectsPage.js";
import { renderSceneArchivePage } from "../features/scenes/SceneArchivePage.js";
import { renderVenueRequestsPage } from "../features/venues/VenueRequestsPage.js";
import { renderNoticeboardPage } from "../features/world/NoticeboardPage.js";
import { renderGeneralSettingsPage } from "../features/settings/GeneralSettingsPage.js";
import { renderMenuIndexPage } from "../features/settings/MenuIndexPage.js";
import type { MenuScreenController } from "./menu-contracts.js";
import { VillagesRuntimeDebug } from "../features/settings/SettingsPanels.js";
import { renderVillageSettingsPage } from "../features/settings/VillageSettingsPage.js";

export function MenuScreen({ controller }: { controller: MenuScreenController }) {
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
    projectsController,
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
    saveScenerySettings,
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
    loadProgressDebug,
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
          renderMenuIndexPage({ backgroundPanel, busy, openMenu, snapshot })
        ) : menuPage === "events" && snapshot ? (
          renderEventsPage({ mobile, snapshot })
        ) : !snapshot && menuPage !== "general" ? (
          <section className={`${ELEMENT_TAG}-panel ${ELEMENT_TAG}-menu-content`} role="main">
            {error ? "The village could not be loaded. Return to the village and try again." : "Loading village menu…"}
          </section>
        ) : menuPage === "general" ? (
          renderGeneralSettingsPage({
            backgroundPanel,
            busy,
            resetArmed,
            saveCharacterSpeechColors,
            saveSendOnEnter,
            saveStoryPace,
            saveVisitRetention,
            setResetArmed,
            settingsError,
            snapshot,
            startOver,
          })
        ) : menuPage === "village" ? (
          renderVillageSettingsPage({
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
          })
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
            {menuPage === "noticeboard" && snapshot
              ? renderNoticeboardPage({ addNotice, busy, noticeDraft, removeNotice, setNoticeDraft, snapshot })
              : null}

            {menuPage === "projects" && snapshot
              ? renderProjectsPage({
                  debugDiscardEnabled,
                  projectsController,
                  goHome,
                  mobile,
                  room,
                  setFocusedProjectId,
                  setPlacingProjectId,
                  setScreen,
                  setSiteProjectId,
                  siteProjectId,
                  snapshot,
                })
              : null}
            {menuPage === "venueRequests" && snapshot
              ? renderVenueRequestsPage({
                  busy,
                  decideVenueRequest,
                  nameOfCharacter,
                  requestEdits,
                  setBusy,
                  setRequestEdits,
                  setSettingsError,
                  setSnapshot,
                  settingsError,
                  snapshot,
                })
              : null}

            {menuPage === "progress" ? renderProgressDebugPage({ error, progressDebug, loadProgressDebug }) : null}

            {menuPage === "chatlogs"
              ? renderSceneArchivePage({
                  archiveError,
                  archiveOffset,
                  archiveTotal,
                  archiveVenueId,
                  archiveVillagerId,
                  busy,
                  deleteArchivedVisits,
                  openArchivedVisit,
                  openVisit,
                  setArchiveOffset,
                  setArchiveVenueId,
                  setArchiveVillagerId,
                  setOpenArchivedVisit,
                  snapshot,
                  venueVisits,
                })
              : null}

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
