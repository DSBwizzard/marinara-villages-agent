import type { SavedSettingsDraft } from "./draft-session.js";
import { useVillageMutationLifetime } from "../../shared/mutation-lifetime.js";
import type { VillageSettings, VillageSnapshot, VillageBackgroundPace } from "../../../shared/contracts/village.js";
import { messageFrom, request } from "../../shared/api.js";
import { type SetStateAction, useCallback } from "react";

export function useSaveSettings(ports: {
  knowledgeDraft: string;
  lorebookDraft: string[];
  loreTokenBudgetDraft: number;
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
        }),
      });
      if (!lifetime.owns(claim)) return;
      setSnapshot(saved);
      acceptSavedSettings(saved, { knowledgeDraft, personaDraft, settingDraft, lorebookDraft, loreTokenBudgetDraft });
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
    setSnapshot,
    acceptSavedSettings,
  ]);
}

export function useSaveScenerySettings(ports: {
  sceneryStyle: string;
  sceneryStyleProfileId: string | null;
  personalizeHomes: boolean;
  visualLoreDefault: boolean;
  snapshot: VillageSnapshot | null;
  setBusy: React.Dispatch<SetStateAction<boolean>>;
  setSettingsError: React.Dispatch<SetStateAction<string>>;
  setSnapshot: React.Dispatch<SetStateAction<VillageSnapshot>>;
}) {
  const {
    sceneryStyle,
    sceneryStyleProfileId,
    personalizeHomes,
    visualLoreDefault,
    setBusy,
    setSettingsError,
    setSnapshot,
  } = ports;
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
                  useVisualLoreByDefault: visualLoreDefault,
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
    [
      sceneryStyle,
      sceneryStyleProfileId,
      personalizeHomes,
      visualLoreDefault,
      setBusy,
      setSettingsError,
      setSnapshot,
      lifetime,
    ],
  );
}

export function useSaveSpriteCardFlip(ports: {
  snapshot: VillageSnapshot | null;
  setSnapshot: React.Dispatch<SetStateAction<VillageSnapshot>>;
  setSpriteFlipDraft: React.Dispatch<SetStateAction<boolean>>;
  setSpriteFlipError: React.Dispatch<SetStateAction<string>>;
  setSpriteFlipSaving: React.Dispatch<SetStateAction<boolean>>;
}) {
  const { snapshot } = ports;

  const { setSnapshot, setSpriteFlipDraft, setSpriteFlipError, setSpriteFlipSaving } = ports;
  const lifetime = useVillageMutationLifetime(snapshot?.isFounded, setSpriteFlipSaving);
  return useCallback(
    async (spriteCardFlipEnabled: boolean) => {
      const claim = lifetime.begin();
      if (!claim) return;
      claim.onRetire = () => {
        setSpriteFlipSaving(false);
        setSpriteFlipDraft(null);
      };
      setSpriteFlipDraft(spriteCardFlipEnabled);
      setSpriteFlipSaving(true);
      setSpriteFlipError("");
      try {
        const saved = await request<VillageSnapshot>("/settings", {
          method: "PATCH",
          body: JSON.stringify({ spriteCardFlipEnabled }),
        });
        if (lifetime.owns(claim)) setSnapshot(saved);
      } catch (cause) {
        if (lifetime.owns(claim)) setSpriteFlipError(messageFrom(cause, "That setting could not be saved."));
      } finally {
        if (lifetime.finish(claim)) {
          setSpriteFlipSaving(false);
          setSpriteFlipDraft(null);
        }
      }
    },
    [lifetime, setSnapshot, setSpriteFlipDraft, setSpriteFlipError, setSpriteFlipSaving],
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
    async (backgroundPace: VillageBackgroundPace) => {
      const claim = lifetime.begin();
      if (!claim) return;
      setBusy(true);
      setSettingsError("");
      try {
        const saved = await request<VillageSnapshot>("/settings", {
          method: "PATCH",
          body: JSON.stringify({ backgroundPace }),
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

export function useSaveCharacterSpeechColors(ports: {
  setBusy: React.Dispatch<SetStateAction<boolean>>;
  setSettingsError: React.Dispatch<SetStateAction<string>>;
  setSnapshot: React.Dispatch<SetStateAction<VillageSnapshot>>;
  snapshot: VillageSnapshot;
}) {
  const { setBusy, setSettingsError, setSnapshot, snapshot } = ports;
  const lifetime = useVillageMutationLifetime(snapshot?.isFounded, setBusy);
  return useCallback(
    async (characterSpeechColors: boolean) => {
      const claim = lifetime.begin();
      if (!claim) return;
      const previous = snapshot?.settings.characterSpeechColors ?? true;
      setSnapshot((current) =>
        current ? { ...current, settings: { ...current.settings, characterSpeechColors } } : current,
      );
      setBusy(true);
      setSettingsError("");
      try {
        const saved = await request<VillageSnapshot>("/settings", {
          method: "PATCH",
          body: JSON.stringify({ characterSpeechColors }),
        });
        if (lifetime.owns(claim)) setSnapshot(saved);
      } catch (cause) {
        if (!lifetime.owns(claim)) return;
        setSnapshot((current) =>
          current ? { ...current, settings: { ...current.settings, characterSpeechColors: previous } } : current,
        );
        setSettingsError(messageFrom(cause, "Character speech colors could not be saved."));
      } finally {
        if (lifetime.finish(claim)) setBusy(false);
      }
    },
    [lifetime, snapshot?.settings?.characterSpeechColors, setSnapshot, setBusy, setSettingsError],
  );
}

export function useSaveVisitRetention(ports: {
  snapshot: VillageSnapshot | null;
  setArchiveVersion: React.Dispatch<SetStateAction<number>>;
  setBusy: React.Dispatch<SetStateAction<boolean>>;
  setSettingsError: React.Dispatch<SetStateAction<string>>;
  setSnapshot: React.Dispatch<SetStateAction<VillageSnapshot>>;
}) {
  const { snapshot } = ports;

  const { setArchiveVersion, setBusy, setSettingsError, setSnapshot } = ports;
  const lifetime = useVillageMutationLifetime(snapshot?.isFounded, setBusy);
  return useCallback(
    async (visitRetention: VillageSettings["visitRetention"]) => {
      const claim = lifetime.begin();
      if (!claim) return;
      setBusy(true);
      setSettingsError("");
      try {
        const saved = await request<VillageSnapshot>("/settings", {
          method: "PATCH",
          body: JSON.stringify({ visitRetention }),
        });
        if (!lifetime.owns(claim)) return;
        setSnapshot(saved);
        setArchiveVersion((version) => version + 1);
      } catch (cause) {
        if (lifetime.owns(claim)) setSettingsError(messageFrom(cause, "Scene retention could not be saved."));
      } finally {
        if (lifetime.finish(claim)) setBusy(false);
      }
    },
    [lifetime, setArchiveVersion, setBusy, setSettingsError, setSnapshot],
  );
}
