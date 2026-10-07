import type { ProgressDebugView } from "../../shared/contracts/village.js";
import { messageFrom, request } from "../shared/api.js";
import type { MenuPage } from "../shared/types.js";
import { useCallback } from "react";

export function useScenesOpenMenu(ports: {
  loadCatalog: (signal?: AbortSignal) => Promise<void>;
  loadLorebooks: (signal?: AbortSignal) => Promise<void>;
  loadPersonas: (signal?: AbortSignal, selectActive?: boolean) => Promise<void>;
  menuPage: import("../shared/types.js").MenuPage;
  screen: "home" | "menu" | "setup" | "resume" | "preparing" | "venue" | "room" | "person";
  setError: React.Dispatch<React.SetStateAction<string>>;
  setFocusedRequestId: React.Dispatch<React.SetStateAction<string>>;
  setMenuPage: React.Dispatch<React.SetStateAction<import("../shared/types.js").MenuPage>>;
  setProgressDebug: React.Dispatch<React.SetStateAction<import("../../shared/contracts/village.js").ProgressDebugView>>;
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
    loadPersonas,
    menuPage,
    screen,
    setError,
    setFocusedRequestId,
    setMenuPage,
    setProgressDebug,
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
      // Same rule for the Personas the identity picker offers.
      if (tab === "village") void loadPersonas(undefined, false);
      if (tab === "village") void loadLorebooks();
      if (tab === "progress")
        void request<ProgressDebugView>("/progress/debug")
          .then(setProgressDebug)
          .catch((cause) => {
            setProgressDebug(null);
            setError(messageFrom(cause, "Progress diagnostics are unavailable."));
          });
      const enteringVillageSettings = tab === "village" && (screen !== "menu" || menuPage !== "village");
      if (enteringVillageSettings) openSettings();
      setMenuPage(tab);
      setScreen("menu");
    },
    [loadCatalog, loadLorebooks, loadPersonas, menuPage, screen, openSettings],
  );
}
