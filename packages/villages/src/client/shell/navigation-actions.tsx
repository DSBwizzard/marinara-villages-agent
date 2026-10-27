import { useCallback } from "react";
import type { MenuPage } from "../shared/types.js";

export function useScenesOpenMenu(ports: {
  loadLorebooks: (signal?: AbortSignal) => Promise<void>;
  loadProgressDebug: () => Promise<void>;
  debugDiscardEnabled: boolean;
  menuPage: import("../shared/types.js").MenuPage;
  screen: "home" | "menu" | "setup" | "resume" | "preparing" | "venue" | "room" | "person";
  setFocusedRequestId: React.Dispatch<React.SetStateAction<string>>;
  setMenuPage: React.Dispatch<React.SetStateAction<import("../shared/types.js").MenuPage>>;
  setScreen: React.Dispatch<
    React.SetStateAction<"home" | "menu" | "setup" | "resume" | "preparing" | "venue" | "room" | "person">
  >;
  setSettingsError: React.Dispatch<React.SetStateAction<string>>;
  setSiteProjectId: React.Dispatch<React.SetStateAction<string>>;
  openSettings: () => void;
}) {
  const {
    loadLorebooks,
    loadProgressDebug,
    debugDiscardEnabled,
    menuPage,
    screen,
    setFocusedRequestId,
    setMenuPage,
    setScreen,
    setSettingsError,
    setSiteProjectId,
    openSettings,
  } = ports;
  return useCallback(
    (tab: MenuPage) => {
      setFocusedRequestId("");
      if (tab === "projects") setSiteProjectId("");
      setSettingsError("");
      if (tab === "village") void loadLorebooks();
      if (tab === "progress" && debugDiscardEnabled) void loadProgressDebug();
      const enteringVillageSettings =
        (tab === "village" || tab === "visual") && (screen !== "menu" || menuPage !== tab);
      if (enteringVillageSettings) openSettings();
      setMenuPage(tab);
      setScreen("menu");
    },
    [
      setFocusedRequestId,
      setSiteProjectId,
      setSettingsError,
      loadLorebooks,
      loadProgressDebug,
      debugDiscardEnabled,
      screen,
      menuPage,
      openSettings,
      setMenuPage,
      setScreen,
    ],
  );
}
