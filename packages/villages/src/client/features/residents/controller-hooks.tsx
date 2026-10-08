import type { VillageVillagerView } from "../../../shared/contracts/village.js";
import { useCallback, useEffect } from "react";

export function useResidentInspection(ports: {
  loadAgendas: (signal?: AbortSignal) => Promise<void>;
  loadMemoryLibrary: (signal?: AbortSignal) => Promise<void>;
  personProfile: import("./villages-dossier.js").DossierNavigation;
  profileInspection: import("./villages-dossier.js").DossierSection;
  screen: "home" | "menu" | "setup" | "resume" | "preparing" | "venue" | "room" | "person";
  setAgendas: React.Dispatch<React.SetStateAction<import("../../../shared/contracts/village.js").VillagerAgendaView[]>>;
  setMemoryLibrary: React.Dispatch<React.SetStateAction<import("../../../shared/contracts/village.js").MemoryLibrary>>;
}) {
  const { loadAgendas, loadMemoryLibrary, personProfile, profileInspection, screen, setAgendas, setMemoryLibrary } =
    ports;
  useEffect(() => {
    if (screen !== "person" || !personProfile || !profileInspection) return;
    const controller = new AbortController();
    if (profileInspection === "memories") {
      setMemoryLibrary(null);
      void loadMemoryLibrary(controller.signal);
    }
    if (["wishes", "agenda", "venues"].includes(profileInspection)) {
      setAgendas(null);
      void loadAgendas(controller.signal);
    }
    return () => controller.abort();
  }, [screen, personProfile, profileInspection, loadAgendas, loadMemoryLibrary]);
}

export function useResidentAgendaPolling(ports: {
  agendas: import("../../../shared/contracts/village.js").VillagerAgendaView[];
  loadAgendas: (signal?: AbortSignal) => Promise<void>;
  personProfile: import("./villages-dossier.js").DossierNavigation;
  profileInspection: import("./villages-dossier.js").DossierSection;
  screen: "home" | "menu" | "setup" | "resume" | "preparing" | "venue" | "room" | "person";
}) {
  const { agendas, loadAgendas, personProfile, profileInspection, screen } = ports;
  useEffect(() => {
    if (screen !== "person" || !profileInspection || !["wishes", "agenda", "venues"].includes(profileInspection))
      return;
    if (
      !agendas?.some(
        (villager) =>
          villager.characterId === personProfile?.actorId &&
          villager.agenda?.personalizationPending &&
          !villager.agenda.personalizationFailure,
      )
    )
      return;
    const controller = new AbortController();
    const timer = window.setInterval(() => void loadAgendas(controller.signal), 5_000);
    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, [agendas, loadAgendas, profileInspection, personProfile, screen]);
}

export function useResidentsStandingAt(ports: {
  snapshot: import("../../../shared/contracts/village.js").VillageSnapshot;
}) {
  const { snapshot } = ports;
  return useCallback(
    (placeId: string): VillageVillagerView[] =>
      (snapshot?.villagers ?? []).filter((villager) => villager.place?.id === placeId),
    [snapshot],
  );
}

export function useResidentsNameOfCharacter(ports: {
  catalog: import("../../../shared/contracts/village.js").CatalogEntry[];
  snapshot: import("../../../shared/contracts/village.js").VillageSnapshot;
}) {
  const { catalog, snapshot } = ports;
  return useCallback(
    (characterId: string | null): string => {
      if (!characterId) return "";
      return (
        catalog?.find((entry) => entry.id === characterId)?.name ??
        snapshot?.villagers.find((villager) => villager.characterId === characterId)?.name ??
        ""
      );
    },
    [catalog, snapshot],
  );
}
