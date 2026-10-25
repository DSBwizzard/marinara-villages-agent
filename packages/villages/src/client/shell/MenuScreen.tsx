import { ELEMENT_TAG } from "../shared/constants.js";
import { MENU_PAGE_TITLES } from "./navigation.js";
import { renderProgressDebugPage } from "../features/background/ProgressDebugPage.js";
import { renderProjectsPage } from "../features/projects/ProjectsPage.js";
import { renderSceneArchivePage } from "../features/scenes/SceneArchivePage.js";
import { renderVenueRequestsPage } from "../features/venues/VenueRequestsPage.js";
import { renderNoticeboardPage } from "../features/world/NoticeboardPage.js";
import { renderGeneralSettingsPage } from "../features/settings/GeneralSettingsPage.js";
import { renderMenuIndexPage } from "../features/settings/MenuIndexPage.js";
import type { MenuScreenController } from "./menu-contracts.js";
import { VillagesRuntimeDebug } from "../features/settings/RuntimeDebug.js";
import { VillageTimeControl } from "../features/settings/TimeControl.js";
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
    debugDiscardEnabled,
    decideVenueRequest,
    generateRequestDescription,
    completeResidenceMove,
    decideResidenceMove,
    deleteArchivedVisits,
    error,
    projectsController,
    goHome,
    insertMacro,
    knowledgeDraft,
    knowledgeRef,
    loreTokenBudgetDraft,
    lorebookDraft,
    lorebooks,
    lorebooksError,
    menuPage,
    menuSection,
    mobile,
    nameOfCharacter,
    noticeDraft,
    openArchivedVisit,
    openMenu,
    openPlace,
    housingVenueId,
    setHousingVenueId,
    openSetup,
    openVisit,
    personaDraft,
    personalizeHomes,
    personas,
    placeCount,
    progressDebug,
    removeNotice,
    removeVenue,
    requestEdits,
    resetArmed,
    room,
    saveCharacterSpeechColors,
    saveScenerySettings,
    saveSendOnEnter,
    saveSettings,
    saveBackgroundPace,
    saveVenue,
    saveVisitRetention,
    sceneryStyle,
    sceneryStyleProfileId,
    screen,
    setArchiveOffset,
    setArchiveVenueId,
    setArchiveVillagerId,
    setFocusedProjectId,
    setKnowledgeDraft,
    setLoreTokenBudgetDraft,
    setLorebookDraft,
    setMenuPage,
    setNoticeDraft,
    setOpenArchivedVisit,
    setPersonaDraft,
    setPersonalizeHomes,
    setPlacingProjectId,
    loadProgressDebug,
    setRequestEdits,
    setResetArmed,
    setSceneryStyle,
    setSceneryStyleProfileId,
    setScreen,
    setSettingDraft,
    setSiteProjectId,
    setSnapshot,
    setVenueEditDraft,
    setVenueSearch,
    setVisualLoreDefault,
    settingDraft,
    settingsError,
    siteProjectId,
    snapshot,
    startOver,
    suggestPlaces,
    venueEditDraft,
    venueSearch,
    venueVisits,
    venuesDraft,
    visualLoreDefault,
  } = controller;

  if (screen === "menu" && menuPage === "projects" && snapshot) {
    return (
      <div className={ELEMENT_TAG + "-root " + ELEMENT_TAG + "-project-root"} data-page="projects" data-mobile={mobile}>
        {renderProjectsPage({
          debugDiscardEnabled,
          projectsController,
          openMenu,
          openVenue: openPlace,
          goHome,
          mobile,
          room,
          setFocusedProjectId,
          setPlacingProjectId,
          setScreen,
          setSiteProjectId,
          siteProjectId,
          snapshot,
        })}
      </div>
    );
  }

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
          </div>
          <div className={`${ELEMENT_TAG}-actions`}>
            <button
              type="button"
              className={`${ELEMENT_TAG}-button`}
              onClick={
                menuPage !== "index"
                  ? () => setMenuPage("index")
                  : room?.id && room.status !== "closed"
                    ? () => setScreen("room")
                    : goHome
              }
            >
              {menuPage !== "index"
                ? "Back to menu"
                : room && room.status !== "closed"
                  ? "Back to Scene"
                  : "Back to the village"}
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
                {`Venue Requests (${(snapshot?.venueRequests?.length ?? 0) + (snapshot?.residences?.filter((entry) => entry.status === "pending" && entry.requestedBy === "villager").length ?? 0)})`}
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
        ) : !snapshot && menuPage !== "general" ? (
          <section className={`${ELEMENT_TAG}-panel ${ELEMENT_TAG}-menu-content`} role="main">
            {error ? "The village could not be loaded. Return to the village and try again." : "Loading village menu…"}
          </section>
        ) : menuPage === "general" ? (
          renderGeneralSettingsPage({
            backgroundPanel,
            busy: busy,
            resetArmed,
            saveCharacterSpeechColors,
            saveSendOnEnter,
            saveBackgroundPace,
            saveVisitRetention,
            setResetArmed,
            settingsError,
            snapshot,
            startOver,
          })
        ) : menuPage === "village" ? (
          renderVillageSettingsPage({
            setSnapshot,
            addVenue,
            backgroundPanel,
            busy: busy,
            insertMacro,
            knowledgeDraft,
            knowledgeRef,
            loreTokenBudgetDraft,
            lorebookDraft,
            lorebooks,
            lorebooksError,
            mobile,
            nameOfCharacter,
            openPlace,
            openSetup,
            personaDraft,
            personalizeHomes,
            personas,
            placeCount,
            removeVenue,
            saveScenerySettings,
            saveSettings,
            saveVenue,
            sceneryStyle,
            sceneryStyleProfileId,
            setKnowledgeDraft,
            setLoreTokenBudgetDraft,
            setLorebookDraft,
            setPersonaDraft,
            setPersonalizeHomes,
            setSceneryStyle,
            setSceneryStyleProfileId,
            setSettingDraft,
            setVenueEditDraft,
            setVenueSearch,
            setVisualLoreDefault,
            settingDraft,
            settingsError,
            snapshot,
            suggestPlaces,
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
            {menuSection === "debug" ? <VillageTimeControl snapshot={snapshot} onAdvanced={setSnapshot} /> : null}
            {menuPage === "noticeboard" && snapshot
              ? renderNoticeboardPage({
                  addNotice,
                  busy: busy,
                  noticeDraft,
                  removeNotice,
                  setNoticeDraft,
                  snapshot,
                })
              : null}

            {menuPage === "venueRequests" && snapshot
              ? renderVenueRequestsPage({
                  housingVenueId,
                  setHousingVenueId,
                  openPlace,
                  busy: busy,
                  decideVenueRequest,
                  generateRequestDescription,
                  completeResidenceMove,
                  decideResidenceMove,
                  nameOfCharacter,
                  requestEdits,
                  setRequestEdits,
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
                  busy: busy,
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
