import type { MenuScreenController } from "../settings/screen-contracts.js";
import { ProjectsPanelV2 } from "./ProjectsPanel.js";

export function renderProjectsPage(
  ports: Pick<
    MenuScreenController,
    | "debugDiscardEnabled"
    | "focusedProjectId"
    | "goHome"
    | "mobile"
    | "room"
    | "setFocusedProjectId"
    | "setPlacingProjectId"
    | "setScreen"
    | "setSiteProjectId"
    | "setSnapshot"
    | "siteProjectId"
    | "snapshot"
  >,
) {
  const {
    debugDiscardEnabled,
    focusedProjectId,
    goHome,
    mobile,
    room,
    setFocusedProjectId,
    setPlacingProjectId,
    setScreen,
    setSiteProjectId,
    setSnapshot,
    siteProjectId,
    snapshot,
  } = ports;
  return (
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
  );
}
