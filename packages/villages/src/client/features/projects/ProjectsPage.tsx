import type { ProjectsPagePorts } from "./page-contracts.js";
import { ProjectsPanel } from "./ProjectsPanel.js";

export function renderProjectsPage(ports: ProjectsPagePorts) {
  const {
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
  } = ports;
  return (
    <ProjectsPanel
      snapshot={snapshot}
      onClose={() => ports.openMenu?.("index")}
      onPeople={() => ports.openMenu?.("villagers")}
      onVenue={(id) => {
        const venue = snapshot.settings.venues.find((entry) => entry.id === id);
        if (venue) ports.openVenue?.(venue);
      }}
      room={room}
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
      controller={projectsController}
      siteProjectId={siteProjectId}
    />
  );
}
