import type { ProjectsPagePorts } from "./page-contracts.js";
import { ProjectsPanelV2 } from "./ProjectsPanel.js";

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
    <ProjectsPanelV2
      snapshot={snapshot}
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
        if (room && room.status !== "closed") return;
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
