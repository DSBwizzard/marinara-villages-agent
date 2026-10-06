import type { ProgressDebugView } from "../../shared/contracts/village.js";
import { messageFrom, request } from "../shared/api.js";
import { destinationPlaces } from "../shared/presentation.js";
import type { MenuPage } from "../shared/types.js";
import { useCallback } from "react";

export function useScenesOpenMenu(ports: {
  loadCatalog: (signal?: AbortSignal) => Promise<void>;
  loadLorebooks: (signal?: AbortSignal) => Promise<void>;
  loadPersonas: (signal?: AbortSignal) => Promise<void>;
  menuPage: import("../shared/types.js").MenuPage;
  screen: "home" | "menu" | "setup" | "resume" | "preparing" | "venue" | "room" | "person";
  setError: React.Dispatch<React.SetStateAction<string>>;
  setFocusedRequestId: React.Dispatch<React.SetStateAction<string>>;
  setKnowledgeDraft: React.Dispatch<React.SetStateAction<string>>;
  setLorebookDraft: React.Dispatch<React.SetStateAction<string[]>>;
  setLoreTokenBudgetDraft: React.Dispatch<React.SetStateAction<number>>;
  setMenuPage: React.Dispatch<React.SetStateAction<import("../shared/types.js").MenuPage>>;
  setPersonaDraft: React.Dispatch<React.SetStateAction<string>>;
  setPersonalizeHomes: React.Dispatch<React.SetStateAction<boolean>>;
  setProgressDebug: React.Dispatch<React.SetStateAction<import("../../shared/contracts/village.js").ProgressDebugView>>;
  setSceneryStyle: React.Dispatch<React.SetStateAction<string>>;
  setScreen: React.Dispatch<
    React.SetStateAction<"home" | "menu" | "setup" | "resume" | "preparing" | "venue" | "room" | "person">
  >;
  setSettingDraft: React.Dispatch<React.SetStateAction<string>>;
  setSettingsError: React.Dispatch<React.SetStateAction<string>>;
  setSiteProjectId: React.Dispatch<React.SetStateAction<string>>;
  setVenuesDraft: React.Dispatch<React.SetStateAction<import("../../shared/contracts/village.js").VillageVenue[]>>;
  setVisualLoreDefault: React.Dispatch<React.SetStateAction<boolean>>;
  snapshot: import("../../shared/contracts/village.js").VillageSnapshot;
}) {
  const {
    loadCatalog,
    loadLorebooks,
    loadPersonas,
    menuPage,
    screen,
    setError,
    setFocusedRequestId,
    setKnowledgeDraft,
    setLorebookDraft,
    setLoreTokenBudgetDraft,
    setMenuPage,
    setPersonaDraft,
    setPersonalizeHomes,
    setProgressDebug,
    setSceneryStyle,
    setScreen,
    setSettingDraft,
    setSettingsError,
    setSiteProjectId,
    setVenuesDraft,
    setVisualLoreDefault,
    snapshot,
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
      if (tab === "village") void loadPersonas();
      if (tab === "village") void loadLorebooks();
      if (tab === "progress")
        void request<ProgressDebugView>("/progress/debug")
          .then(setProgressDebug)
          .catch((cause) => {
            setProgressDebug(null);
            setError(messageFrom(cause, "Progress diagnostics are unavailable."));
          });
      const enteringVillageSettings = tab === "village" && (screen !== "menu" || menuPage !== "village");
      if (enteringVillageSettings && snapshot) {
        setKnowledgeDraft(snapshot.settings.promptKnowledge);
        setPersonaDraft(snapshot.settings.playerPersonaId);
        setSettingDraft(snapshot.settings.setting);
        setLorebookDraft(snapshot.settings.selectedLorebookIds);
        setLoreTokenBudgetDraft(snapshot.settings.loreTokenBudget);
        setSceneryStyle(snapshot.settings.sceneryArtStyle ?? "");
        setPersonalizeHomes(snapshot.settings.personalizeVenueImagesByDefault !== false);
        setVisualLoreDefault(snapshot.settings.useVisualLoreByDefault !== false);
        // The settings form's legacy draft covers destination venues. Home
        // details live in View Venue, while map positions use Village Map.
        setVenuesDraft(destinationPlaces(snapshot.settings.venues).map((venue) => ({ ...venue })));
      }
      setMenuPage(tab);
      setScreen("menu");
    },
    [loadCatalog, loadLorebooks, loadPersonas, menuPage, screen, snapshot],
  );
}
