import { type SetStateAction, useCallback } from "react";
import type { VillageBackgroundPace, VillageSnapshot } from "../../../shared/contracts/village.js";
import { messageFrom, request } from "../../shared/api.js";
import { useVillageMutationLifetime } from "../../shared/mutation-lifetime.js";
import type { SavedSettingsDraft } from "./draft-session.js";

export function useSaveSettings(ports: {
  knowledgeDraft: string;
  lorebookDraft: string[];
  loreTokenBudgetDraft: number;
  visualLoreDefault: boolean;
  personaDraft: string;
  setBusy: React.Dispatch<SetStateAction<boolean>>;
  setSettingsError: React.Dispatch<SetStateAction<string>>;
  setSnapshot: React.Dispatch<SetStateAction<VillageSnapshot>>;
  settingDraft: string;
  acceptSavedSettings: (next: VillageSnapshot, submitted: SavedSettingsDraft) => void;
  snapshot: VillageSnapshot | null;
}) {
  const { snapshot } = ports;

  const {
    knowledgeDraft,
    lorebookDraft,
    loreTokenBudgetDraft,
    visualLoreDefault,
    personaDraft,
    setBusy,
    setSettingsError,
    setSnapshot,
    settingDraft,
    acceptSavedSettings,
  } = ports;
  const lifetime = useVillageMutationLifetime(snapshot?.isFounded, setBusy);
  return useCallback(async () => {
    const claim = lifetime.begin();
    if (!claim) return;
    setBusy(true);
    setSettingsError("");
    try {
      const saved = await request<VillageSnapshot>("/settings", {
        method: "PATCH",
        body: JSON.stringify({
          selectedLorebookIds: lorebookDraft,
          loreTokenBudget: loreTokenBudgetDraft,
          useVisualLoreByDefault: visualLoreDefault,
        }),
      });
      if (!lifetime.owns(claim)) return;
      setSnapshot(saved);
      acceptSavedSettings(saved, {
        knowledgeDraft,
        personaDraft,
        settingDraft,
        lorebookDraft,
        loreTokenBudgetDraft,
        visualLoreDefault,
      });
    } catch (cause) {
      if (lifetime.owns(claim)) setSettingsError(messageFrom(cause, "Those settings could not be saved."));
    } finally {
      if (lifetime.finish(claim)) setBusy(false);
    }
  }, [
    lifetime,
    setBusy,
    setSettingsError,
    knowledgeDraft,
    personaDraft,
    settingDraft,
    lorebookDraft,
    loreTokenBudgetDraft,
    visualLoreDefault,
    setSnapshot,
    acceptSavedSettings,
  ]);
}

export function useSaveScenerySettings(ports: {
  sceneryStyle: string;
  sceneryStyleProfileId: string | null;
  personalizeHomes: boolean;
  snapshot: VillageSnapshot | null;
  setBusy: React.Dispatch<SetStateAction<boolean>>;
  setSettingsError: React.Dispatch<SetStateAction<string>>;
  setSnapshot: React.Dispatch<SetStateAction<VillageSnapshot>>;
}) {
  const { sceneryStyle, sceneryStyleProfileId, personalizeHomes, setBusy, setSettingsError, setSnapshot } = ports;
  const lifetime = useVillageMutationLifetime(ports.snapshot?.isFounded, setBusy);
  return useCallback(
    async (automaticZonePictures?: boolean) => {
      const claim = lifetime.begin();
      if (!claim) return;
      setBusy(true);
      setSettingsError("");
      try {
        const saved = await request<VillageSnapshot>("/settings", {
          method: "PATCH",
          body: JSON.stringify({
            ...(automaticZonePictures === undefined
              ? {
                  sceneryArtStyle: sceneryStyle,
                  sceneryStyleProfileId,
                  personalizeVenueImagesByDefault: personalizeHomes,
                }
              : { automaticZonePictures }),
          }),
        });
        if (lifetime.owns(claim)) setSnapshot(saved);
      } catch (cause) {
        if (lifetime.owns(claim)) setSettingsError(messageFrom(cause, "Scenery settings could not be saved."));
      } finally {
        if (lifetime.finish(claim)) setBusy(false);
      }
    },
    [sceneryStyle, sceneryStyleProfileId, personalizeHomes, setBusy, setSettingsError, setSnapshot, lifetime],
  );
}

export function useSaveBackgroundPace(ports: {
  snapshot: VillageSnapshot | null;
  setBusy: React.Dispatch<SetStateAction<boolean>>;
  setSettingsError: React.Dispatch<SetStateAction<string>>;
  setSnapshot: React.Dispatch<SetStateAction<VillageSnapshot>>;
}) {
  const { snapshot } = ports;

  const { setBusy, setSettingsError, setSnapshot } = ports;
  const lifetime = useVillageMutationLifetime(snapshot?.isFounded, setBusy);
  return useCallback(
    async (
      backgroundPace: VillageBackgroundPace,
      narrativeConsequence?: import("../../../shared/contracts/village.js").VillageNarrativeConsequence,
    ) => {
      const claim = lifetime.begin();
      if (!claim) return;
      setBusy(true);
      setSettingsError("");
      try {
        const saved = await request<VillageSnapshot>("/settings", {
          method: "PATCH",
          body: JSON.stringify(narrativeConsequence === undefined ? { backgroundPace } : { narrativeConsequence }),
        });
        if (lifetime.owns(claim)) setSnapshot(saved);
      } catch (cause) {
        if (lifetime.owns(claim)) setSettingsError(messageFrom(cause, "That could not be saved."));
      } finally {
        if (lifetime.finish(claim)) setBusy(false);
      }
    },
    [lifetime, setBusy, setSettingsError, setSnapshot],
  );
}

export function useSaveSendOnEnter(ports: {
  setBusy: React.Dispatch<SetStateAction<boolean>>;
  setSettingsError: React.Dispatch<SetStateAction<string>>;
  setSnapshot: React.Dispatch<SetStateAction<VillageSnapshot>>;
  snapshot: VillageSnapshot;
}) {
  const { setBusy, setSettingsError, setSnapshot, snapshot } = ports;
  const lifetime = useVillageMutationLifetime(snapshot?.isFounded, setBusy);
  return useCallback(
    async (sendOnEnter: boolean) => {
      const claim = lifetime.begin();
      if (!claim) return;
      const previous = snapshot?.settings.sendOnEnter === true;
      setSnapshot((current) => (current ? { ...current, settings: { ...current.settings, sendOnEnter } } : current));
      setBusy(true);
      setSettingsError("");
      try {
        const saved = await request<VillageSnapshot>("/settings", {
          method: "PATCH",
          body: JSON.stringify({ sendOnEnter }),
        });
        if (lifetime.owns(claim)) setSnapshot(saved);
      } catch (cause) {
        if (!lifetime.owns(claim)) return;
        setSnapshot((current) =>
          current ? { ...current, settings: { ...current.settings, sendOnEnter: previous } } : current,
        );
        setSettingsError(messageFrom(cause, "Send on Enter could not be saved."));
      } finally {
        if (lifetime.finish(claim)) setBusy(false);
      }
    },
    [lifetime, snapshot?.settings?.sendOnEnter, setSnapshot, setBusy, setSettingsError],
  );
}
