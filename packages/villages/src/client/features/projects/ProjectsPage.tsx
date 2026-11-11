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
    siteProjectId,
    snapshot,
  } = ports;
  return (
    <ProjectsPanel
      snapshot={snapshot}
      onPeople={() => ports.openMenu?.("villagers")}
      onVenue={(id) => {
        const venue = snapshot.settings.venues.find((entry) => entry.id === id);
        if (venue) ports.openVenue?.(venue);
      }}
      room={room}
      onReturn={() => setScreen("room")}
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
