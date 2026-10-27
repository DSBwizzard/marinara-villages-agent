import { useCallback, useState } from "react";
import { renderProgressDebugPage } from "../features/background/ProgressDebugPage.js";
import { renderProjectsPage } from "../features/projects/ProjectsPage.js";
import { RepairPage } from "../features/repair/RepairPage.js";
import { renderSceneArchivePage } from "../features/scenes/SceneArchivePage.js";
import { renderGeneralSettingsPage } from "../features/settings/GeneralSettingsPage.js";
import type { LocalDraftStatus, ReportLocalDraftStatus } from "../features/settings/local-draft-status.js";
import { VillagesRuntimeDebug } from "../features/settings/RuntimeDebug.js";
import { VillageTimeControl } from "../features/settings/TimeControl.js";
import { renderVillageSettingsPage } from "../features/settings/VillageSettingsPage.js";
import { renderVenueRequestsPage } from "../features/venues/VenueRequestsPage.js";
import { ELEMENT_TAG } from "../shared/constants.js";
import type { MenuPage } from "../shared/types.js";
import { WorkspaceShell, type WorkspaceDestination } from "../shared/WorkspaceShell.js";
import type { MenuScreenController } from "./menu-contracts.js";
import { MENU_PAGE_TITLES } from "./navigation.js";

export function MenuScreen({ controller }: { controller: MenuScreenController }) {
  const {
    archiveError,
    archiveOffset,
    archiveTotal,
    archiveVenueId,
    archiveVillagerId,
    backgroundPanel,
    connections,
    busy,
    debugDiscardEnabled,
    decideVenueRequest,
    generateRequestDescription,
    completeResidenceMove,
    decideResidenceMove,
    deleteArchivedVisits,
    error,
    projectsController,
    goHome: rawGoHome,
    loreTokenBudgetDraft,
    lorebookDraft,
    lorebooks,
    lorebooksError,
    menuPage,
    menuSection,
    mobile,
    nameOfCharacter,
    openArchivedVisit,
    openMenu: rawOpenMenu,
    openPlace: rawOpenPlace,
    housingVenueId,
    setHousingVenueId,
    openVisit,
    personalizeHomes,
    progressDebug,
    requestEdits,
    resetArmed,
    room,
    saveCharacterSpeechColors,
    saveScenerySettings,
    saveSendOnEnter,
    saveSettings,
    saveBackgroundPace,
    saveVisitRetention,
    sceneryStyle,
    sceneryStyleProfileId,
    screen,
    setArchiveOffset,
    setArchiveVenueId,
    setArchiveVillagerId,
    setFocusedProjectId,
    setLoreTokenBudgetDraft,
    setLorebookDraft,
    setOpenArchivedVisit,
    setPersonalizeHomes,
    setPlacingProjectId,
    loadProgressDebug,
    setRequestEdits,
    setResetArmed,
    setSceneryStyle,
    setSceneryStyleProfileId,
    setScreen,
    setSiteProjectId,
    setSnapshot,
    setVisualLoreDefault,
    settingsError,
    siteProjectId,
    snapshot,
    startOver,
    venueVisits,
    visualLoreDefault,
  } = controller;
  const [localDrafts, setLocalDrafts] = useState<Partial<Record<"world" | "map", NonNullable<LocalDraftStatus>>>>({});
  const reportLocalDraftStatus = useCallback<ReportLocalDraftStatus>((key, status) => {
    setLocalDrafts((current) => {
      if (!status && !current[key]) return current;
      if (status && current[key]?.dirty === status.dirty && current[key]?.busy === status.busy) return current;
      const next = { ...current };
      if (status) next[key] = status;
      else delete next[key];
      return next;
    });
  }, []);
  const pendingDrafts = Object.values(localDrafts);
  const navigationBusy = pendingDrafts.some((entry) => entry.busy);
  const canLeave = () =>
    !navigationBusy && (!pendingDrafts.some((entry) => entry.dirty) || window.confirm("Leave with unsaved changes?"));
  const goHome: typeof rawGoHome = () => {
    if (canLeave()) rawGoHome();
  };
  const openMenu: typeof rawOpenMenu = (page) => {
    if (canLeave()) rawOpenMenu(page);
  };
  const openPlace: typeof rawOpenPlace = (place) => {
    if (canLeave()) rawOpenPlace(place);
  };

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

  if (screen === "menu" && menuPage === "repair") {
    return (
      <RepairPage
        controller={controller.repairController}
        onBack={() => rawOpenMenu("index")}
        onScene={room && room.status !== "closed" ? () => setScreen("room") : undefined}
      />
    );
  }

  if (screen === "menu") {
    const navigate = (destination: WorkspaceDestination) => {
      if (destination === "map") goHome();
      else if (destination === "places") {
        const first = snapshot?.settings.venues[0];
        if (first) openPlace(first);
        else goHome();
      } else openMenu(destination === "people" ? "villagers" : destination === "projects" ? "projects" : "index");
    };
    const selected = menuPage === "index" ? "general" : menuPage;
    const sections: { page: MenuPage; label: string }[] = [
      { page: "general", label: "General Preferences" },
      { page: "village", label: "World Configuration" },
      { page: "visual", label: "Visual Configuration" },
      { page: "advanced", label: "Advanced" },
      { page: "chatlogs", label: "Scene History" },
      { page: "venueRequests", label: "Venue Requests" },
      { page: "repair", label: "REPAIR" },
      { page: "progress", label: "Debug" },
    ];
    const chooseSection = (page: MenuPage) => {
      if (page === selected) return true;
      if (!canLeave()) return false;
      rawOpenMenu(page);
      return true;
    };
    const sidebar = (
      <>
        <h2>More</h2>
        <nav className={ELEMENT_TAG + "-workspace-sections"} aria-label="More sections">
          {sections.map(({ page, label }) => (
            <button
              key={page}
              type="button"
              disabled={navigationBusy || (!snapshot && !["general", "advanced", "repair"].includes(page))}
              aria-current={selected === page ? "page" : undefined}
              onClick={() => chooseSection(page)}
            >
              {label}
            </button>
          ))}
        </nav>
        <label className={ELEMENT_TAG + "-workspace-section-picker"}>
          Section
          <select
            value={selected}
            disabled={navigationBusy}
            onChange={(event) => {
              if (!chooseSection(event.currentTarget.value as MenuPage)) event.currentTarget.value = selected;
            }}
          >
            {sections.map(({ page, label }) => (
              <option key={page} value={page} disabled={!snapshot && !["general", "advanced", "repair"].includes(page)}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </>
    );
    return (
      <WorkspaceShell active="more" onNavigate={navigate} sidebar={sidebar} disabled={navigationBusy}>
        <div
          className={`${ELEMENT_TAG}-root ${ELEMENT_TAG}-sectioned-menu`}
          data-section={menuSection}
          data-page={selected}
          data-mobile={mobile}
        >
          <header className={`${ELEMENT_TAG}-header`}>
            <div>
              <h1 className={`${ELEMENT_TAG}-title`}>{MENU_PAGE_TITLES[menuPage]}</h1>
            </div>
            {room && room.status !== "closed" ? (
              <button
                type="button"
                className={`${ELEMENT_TAG}-button`}
                disabled={navigationBusy}
                onClick={() => {
                  if (canLeave()) setScreen("room");
                }}
              >
                Back to Scene
              </button>
            ) : null}
            {error ? (
              <p className={`${ELEMENT_TAG}-error`} role="alert">
                {error}
              </p>
            ) : null}
          </header>

          {!snapshot && !["index", "general", "advanced"].includes(menuPage) ? (
            <section className={`${ELEMENT_TAG}-panel ${ELEMENT_TAG}-menu-content`} role="main">
              {error
                ? "The village could not be loaded. Return to the village and try again."
                : "Loading village menu…"}
            </section>
          ) : ["index", "general", "advanced"].includes(menuPage) ? (
            renderGeneralSettingsPage({
              connections,
              category: menuPage === "advanced" ? "advanced" : "general",
              writing: controller.writing,
              busy: busy || navigationBusy,
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
          ) : ["village", "visual"].includes(menuPage) ? (
            renderVillageSettingsPage({
              category: menuPage === "visual" ? "visual" : "world",
              reportLocalDraftStatus,
              setSnapshot,
              busy: busy || navigationBusy,
              loreTokenBudgetDraft,
              lorebookDraft,
              lorebooks,
              lorebooksError,
              mobile,
              personalizeHomes,
              saveScenerySettings,
              saveSettings,
              sceneryStyle,
              sceneryStyleProfileId,
              setLoreTokenBudgetDraft,
              setLorebookDraft,
              setPersonalizeHomes,
              setSceneryStyle,
              setSceneryStyleProfileId,
              setVisualLoreDefault,
              settingsError,
              snapshot,
              visualLoreDefault,
            })
          ) : (
            // The four panels that used to be stacked beside the map. They are
            // unchanged; only what opens them has moved. `Look again` in the nav
            // reads the village afresh, so a panel is never stale by the time it
            // is opened.
            <div className={`${ELEMENT_TAG}-menu-body ${ELEMENT_TAG}-menu-content`} role="main">
              {menuSection === "debug" ? backgroundPanel : null}
              {menuSection === "debug" ? <VillagesRuntimeDebug /> : null}
              {menuSection === "debug" ? <VillageTimeControl snapshot={snapshot} onAdvanced={setSnapshot} /> : null}
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

              {menuPage === "progress" && debugDiscardEnabled
                ? renderProgressDebugPage({ error, progressDebug, loadProgressDebug })
                : null}

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
      </WorkspaceShell>
    );
  }
  return null;
}
