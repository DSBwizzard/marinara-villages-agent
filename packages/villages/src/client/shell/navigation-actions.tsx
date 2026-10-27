import type { MenuPage } from "../shared/types.js";
import { useCallback } from "react";

export function useScenesOpenMenu(ports: {
  loadCatalog: (signal?: AbortSignal) => Promise<void>;
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
    loadCatalog,
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
      // The villager list is read when it is asked for rather than kept current
      // on every snapshot.
      if (tab === "villagers") void loadCatalog();

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
      loadCatalog,
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
