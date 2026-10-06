import type { VillageSettings, VillageSnapshot, VillageStoryPace } from "../../../shared/contracts/village.js";
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
}) {
  const {
    knowledgeDraft,
    lorebookDraft,
    loreTokenBudgetDraft,
    personaDraft,
    setBusy,
    setSettingsError,
    setSnapshot,
    settingDraft,
  } = ports;
  return useCallback(async () => {
    setBusy(true);
    setSettingsError("");
    try {
      setSnapshot(
        await request<VillageSnapshot>("/settings", {
          method: "PATCH",
          body: JSON.stringify({
            promptKnowledge: knowledgeDraft,
            playerPersonaId: personaDraft,
            setting: settingDraft,
            selectedLorebookIds: lorebookDraft,
            loreTokenBudget: loreTokenBudgetDraft,
          }),
        }),
      );
    } catch (cause) {
      setSettingsError(messageFrom(cause, "Those settings could not be saved."));
    } finally {
      setBusy(false);
    }
  }, [knowledgeDraft, lorebookDraft, loreTokenBudgetDraft, personaDraft, settingDraft]);
}

export function useSaveSpriteCardFlip(ports: {
  setSnapshot: React.Dispatch<SetStateAction<VillageSnapshot>>;
  setSpriteFlipDraft: React.Dispatch<SetStateAction<boolean>>;
  setSpriteFlipError: React.Dispatch<SetStateAction<string>>;
  setSpriteFlipSaving: React.Dispatch<SetStateAction<boolean>>;
}) {
  const { setSnapshot, setSpriteFlipDraft, setSpriteFlipError, setSpriteFlipSaving } = ports;
  return useCallback(async (spriteCardFlipEnabled: boolean) => {
    setSpriteFlipDraft(spriteCardFlipEnabled);
    setSpriteFlipSaving(true);
    setSpriteFlipError("");
    try {
      setSnapshot(
        await request<VillageSnapshot>("/settings", {
          method: "PATCH",
          body: JSON.stringify({ spriteCardFlipEnabled }),
        }),
      );
    } catch (cause) {
      setSpriteFlipError(messageFrom(cause, "That setting could not be saved."));
    } finally {
      setSpriteFlipSaving(false);
      setSpriteFlipDraft(null);
    }
  }, []);
}

export function useSaveStoryPace(ports: {
  setBusy: React.Dispatch<SetStateAction<boolean>>;
  setSettingsError: React.Dispatch<SetStateAction<string>>;
  setSnapshot: React.Dispatch<SetStateAction<VillageSnapshot>>;
}) {
  const { setBusy, setSettingsError, setSnapshot } = ports;
  return useCallback(async (storyPace: VillageStoryPace) => {
    setBusy(true);
    setSettingsError("");
    try {
      setSnapshot(
        await request<VillageSnapshot>("/settings", { method: "PATCH", body: JSON.stringify({ storyPace }) }),
      );
    } catch (cause) {
      setSettingsError(messageFrom(cause, "That could not be saved."));
    } finally {
      setBusy(false);
    }
  }, []);
}

export function useSaveSendOnEnter(ports: {
  setBusy: React.Dispatch<SetStateAction<boolean>>;
  setSettingsError: React.Dispatch<SetStateAction<string>>;
  setSnapshot: React.Dispatch<SetStateAction<VillageSnapshot>>;
  snapshot: VillageSnapshot;
}) {
  const { setBusy, setSettingsError, setSnapshot, snapshot } = ports;
  return useCallback(
    async (sendOnEnter: boolean) => {
      const previous = snapshot?.settings.sendOnEnter === true;
      setSnapshot((current) => (current ? { ...current, settings: { ...current.settings, sendOnEnter } } : current));
      setBusy(true);
      setSettingsError("");
      try {
        setSnapshot(
          await request<VillageSnapshot>("/settings", {
            method: "PATCH",
            body: JSON.stringify({ sendOnEnter }),
          }),
        );
      } catch (cause) {
        setSnapshot((current) =>
          current ? { ...current, settings: { ...current.settings, sendOnEnter: previous } } : current,
        );
        setSettingsError(messageFrom(cause, "Send on Enter could not be saved."));
      } finally {
        setBusy(false);
      }
    },
    [snapshot?.settings.sendOnEnter],
  );
}

export function useSaveCharacterSpeechColors(ports: {
  setBusy: React.Dispatch<SetStateAction<boolean>>;
  setSettingsError: React.Dispatch<SetStateAction<string>>;
  setSnapshot: React.Dispatch<SetStateAction<VillageSnapshot>>;
  snapshot: VillageSnapshot;
}) {
  const { setBusy, setSettingsError, setSnapshot, snapshot } = ports;
  return useCallback(
    async (characterSpeechColors: boolean) => {
      const previous = snapshot?.settings.characterSpeechColors ?? true;
      setSnapshot((current) =>
        current ? { ...current, settings: { ...current.settings, characterSpeechColors } } : current,
      );
      setBusy(true);
      setSettingsError("");
      try {
        setSnapshot(
          await request<VillageSnapshot>("/settings", {
            method: "PATCH",
            body: JSON.stringify({ characterSpeechColors }),
          }),
        );
      } catch (cause) {
        setSnapshot((current) =>
          current ? { ...current, settings: { ...current.settings, characterSpeechColors: previous } } : current,
        );
        setSettingsError(messageFrom(cause, "Character speech colors could not be saved."));
      } finally {
        setBusy(false);
      }
    },
    [snapshot?.settings.characterSpeechColors],
  );
}

export function useSaveVisitRetention(ports: {
  setArchiveVersion: React.Dispatch<SetStateAction<number>>;
  setBusy: React.Dispatch<SetStateAction<boolean>>;
  setSettingsError: React.Dispatch<SetStateAction<string>>;
  setSnapshot: React.Dispatch<SetStateAction<VillageSnapshot>>;
}) {
  const { setArchiveVersion, setBusy, setSettingsError, setSnapshot } = ports;
  return useCallback(async (visitRetention: VillageSettings["visitRetention"]) => {
    setBusy(true);
    setSettingsError("");
    try {
      setSnapshot(
        await request<VillageSnapshot>("/settings", { method: "PATCH", body: JSON.stringify({ visitRetention }) }),
      );
      setArchiveVersion((version) => version + 1);
    } catch (cause) {
      setSettingsError(messageFrom(cause, "Scene retention could not be saved."));
    } finally {
      setBusy(false);
    }
  }, []);
}

export function useInsertMacro(ports: {
  knowledgeDraft: string;
  knowledgeRef: React.RefObject<HTMLTextAreaElement>;
  pendingCaretRef: React.RefObject<number>;
  setKnowledgeDraft: React.Dispatch<SetStateAction<string>>;
}) {
  const { knowledgeDraft, knowledgeRef, pendingCaretRef, setKnowledgeDraft } = ports;
  return useCallback(
    (token: string) => {
      const node = knowledgeRef.current;
      const start = node?.selectionStart ?? knowledgeDraft.length;
      const end = node?.selectionEnd ?? start;
      pendingCaretRef.current = start + token.length;
      setKnowledgeDraft(`${knowledgeDraft.slice(0, start)}${token}${knowledgeDraft.slice(end)}`);
    },
    [knowledgeDraft],
  );
}

export function useAddNotice(ports: {
  noticeDraft: string;
  setBusy: React.Dispatch<SetStateAction<boolean>>;
  setNoticeDraft: React.Dispatch<SetStateAction<string>>;
  setSettingsError: React.Dispatch<SetStateAction<string>>;
  setSnapshot: React.Dispatch<SetStateAction<VillageSnapshot>>;
}) {
  const { noticeDraft, setBusy, setNoticeDraft, setSettingsError, setSnapshot } = ports;
  return useCallback(async () => {
    const notice = noticeDraft.trim();
    if (notice.length === 0) return;
    setBusy(true);
    setSettingsError("");
    try {
      setSnapshot(await request<VillageSnapshot>("/noticeboard", { method: "POST", body: JSON.stringify({ notice }) }));
      setNoticeDraft("");
    } catch (cause) {
      setSettingsError(messageFrom(cause, "That notice could not be pinned up."));
    } finally {
      setBusy(false);
    }
  }, [noticeDraft]);
}

export function useRemoveNotice(ports: {
  setBusy: React.Dispatch<SetStateAction<boolean>>;
  setSettingsError: React.Dispatch<SetStateAction<string>>;
  setSnapshot: React.Dispatch<SetStateAction<VillageSnapshot>>;
}) {
  const { setBusy, setSettingsError, setSnapshot } = ports;
  return useCallback(async (index: number) => {
    setBusy(true);
    setSettingsError("");
    try {
      setSnapshot(await request<VillageSnapshot>(`/noticeboard/${index}`, { method: "DELETE" }));
    } catch (cause) {
      setSettingsError(messageFrom(cause, "That notice could not be taken down."));
    } finally {
      setBusy(false);
    }
  }, []);
}
