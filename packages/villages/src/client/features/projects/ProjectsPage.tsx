import type { MenuScreenController } from "../settings/screen-contracts.js";
import { ProjectsPanelV2 } from "./ProjectsPanel.js";

export function renderProjectsPage(
  ports: Pick<
    MenuScreenController,
    | "debugDiscardEnabled"
    | "projectsController"
    | "goHome"
    | "mobile"
    | "room"
    | "setFocusedProjectId"
    | "setPlacingProjectId"
    | "setScreen"
    | "setSiteProjectId"
    | "siteProjectId"
    | "snapshot"
  >,
) {
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
