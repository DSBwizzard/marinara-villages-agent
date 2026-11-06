import { type SetStateAction, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { VillageBackgroundPace, VillageSnapshot } from "../../../shared/contracts/village.js";
import { messageFrom, request } from "../../shared/api.js";
import { useVillageMutationLifetime } from "../../shared/mutation-lifetime.js";
import type { SavedSettingsDraft } from "./draft-session.js";

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
      acceptSavedSettings(saved, {
        knowledgeDraft,
        personaDraft,
        settingDraft,
        lorebookDraft,
        loreTokenBudgetDraft,
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
    setSnapshot,
    acceptSavedSettings,
  ]);
}

export type ScenerySettingsPatch = Partial<
  Pick<VillageSnapshot["settings"], "sceneryArtStyle" | "sceneryStyleProfileId" | "automaticZonePictures">
>;

/** One scenery save at a time; edits made during a request remain queued in the shell. */
export function useSaveScenerySettings(ports: {
  snapshot: VillageSnapshot | null;
  busy: boolean;
  setBusy: React.Dispatch<SetStateAction<boolean>>;
  setSnapshot: React.Dispatch<SetStateAction<VillageSnapshot>>;
}) {
  const { setBusy, setSnapshot } = ports;
  const lifetime = useVillageMutationLifetime(ports.snapshot?.isFounded, setBusy);
  const pending = useRef<ScenerySettingsPatch>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlight = useRef(false);
  const submitted = useRef<ScenerySettingsPatch>({});
  const failed = useRef(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<ScenerySettingsPatch>({});
  const [error, setError] = useState("");
  const cancelTimer = () => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
  };
  useLayoutEffect(() => {
    pending.current = {};
    inFlight.current = false;
    failed.current = false;
    setSaving(false);
    setDraft({});
    setError("");
    return () => {
      cancelTimer();
      pending.current = {};
    };
  }, [lifetime]);
  const flush = useCallback(async () => {
    if (
      inFlight.current ||
      timer.current !== null ||
      failed.current ||
      !Object.keys(pending.current).length ||
      !lifetime.isCurrent()
    )
      return;
    const claim = lifetime.begin();
    if (!claim) return;
    inFlight.current = true;
    setBusy(true);
    try {
      while (Object.keys(pending.current).length && lifetime.owns(claim)) {
        const patch = pending.current;
        submitted.current = patch;
        pending.current = {};
        let saved: VillageSnapshot;
        try {
          saved = await request<VillageSnapshot>("/settings", { method: "PATCH", body: JSON.stringify(patch) });
        } catch (cause) {
          if (!lifetime.owns(claim)) return;
          pending.current = { ...patch, ...pending.current };
          failed.current = true;
          setError(messageFrom(cause, "Scenery settings could not be saved."));
          break;
        }
        if (!lifetime.owns(claim)) return;
        setSnapshot(saved);
        setDraft((current) => {
          const next = { ...current };
          for (const key of Object.keys(patch) as Array<keyof ScenerySettingsPatch>)
            if (next[key] === patch[key]) delete next[key];
          return next;
        });
      }
    } finally {
      if (lifetime.finish(claim)) {
        inFlight.current = false;
        setSaving(false);
        setBusy(false);
      }
    }
  }, [lifetime, setBusy, setSnapshot]);
  useEffect(() => {
    if (!ports.busy) void flush();
  }, [ports.busy, flush]);
  const save = useCallback(
    async (patch: ScenerySettingsPatch, debounce = false) => {
      if (!lifetime.isCurrent()) return;
      cancelTimer();
      const changed = Object.fromEntries(
        Object.entries(patch).filter(
          ([key, value]) =>
            !inFlight.current ||
            Object.hasOwn(pending.current, key) ||
            submitted.current[key as keyof ScenerySettingsPatch] !== value,
        ),
      );
      pending.current = { ...pending.current, ...changed };
      setDraft((current) => ({ ...current, ...patch }));
      failed.current = false;
      setError("");
      setSaving(true);
      if (debounce && !inFlight.current) {
        timer.current = setTimeout(() => {
          timer.current = null;
          void flush();
        }, 400);
        return;
      }
      await flush();
    },
    [flush, lifetime],
  );
  return { save, retry: () => save({}), saving, draft, error };
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
