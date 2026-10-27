import { useCallback, useEffect, useRef, useState } from "react";
import type { VillageWritingView } from "../../../shared/contracts/village.js";
import { messageFrom, request } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
/** Per-village writing controls. Each save returns the server's effective settings. */
export function useVillageWriting(enabled: boolean) {
  const [view, setView] = useState<VillageWritingView | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [readAttempt, setReadAttempt] = useState(0);
  const generation = useRef(0);

  useEffect(() => {
    const current = ++generation.current;
    let cancelled = false;
    if (!enabled) {
      setView(null);
      setError("");
      setSaved(false);
      setBusy(false);
      return;
    }
    void request<VillageWritingView>("/narration")
      .then((next) => {
        if (!cancelled && generation.current === current) setView(next);
      })
      .catch((cause) => {
        if (!cancelled && generation.current === current)
          setError(messageFrom(cause, "Village writing settings could not be read."));
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, readAttempt]);

  const save = useCallback(
    async (patch: {
      tense?: VillageWritingView["tense"];
      person?: VillageWritingView["person"];
      rating?: VillageWritingView["rating"];
      writingGuidance?: string;
    }): Promise<VillageWritingView | null> => {
      const current = generation.current;
      setBusy(true);
      setSaved(false);
      setError("");
      try {
        const next = await request<VillageWritingView>("/narration", { method: "PUT", body: JSON.stringify(patch) });
        if (generation.current === current) {
          setView(next);
          setSaved(true);
        }
        return next;
      } catch (cause) {
        if (generation.current === current) setError(messageFrom(cause, "That writing change could not be saved."));
        return null;
      } finally {
        if (generation.current === current) setBusy(false);
      }
    },
    [],
  );

  const retryRead = useCallback(() => {
    setError("");
    setReadAttempt((attempt) => attempt + 1);
  }, []);

  return { view, error, busy, saved, save, retryRead };
}

export function VillageWritingSettings({ writing }: { writing: ReturnType<typeof useVillageWriting> }) {
  const { view, error, busy, saved, save, retryRead } = writing;

  return (
    <div className={ELEMENT_TAG + "-field"}>
      <span className={ELEMENT_TAG + "-label"}>Writing</span>
      {view ? (
        <>
          <div className={ELEMENT_TAG + "-row"}>
            <label className={ELEMENT_TAG + "-field"}>
              <span className={ELEMENT_TAG + "-label"}>Tense</span>
              <select
                value={view.tense}
                disabled={busy}
                onChange={(event) => void save({ tense: event.target.value as VillageWritingView["tense"] })}
              >
                <option value="present">Present</option>
                <option value="past">Past</option>
              </select>
            </label>
            <label className={ELEMENT_TAG + "-field"}>
              <span className={ELEMENT_TAG + "-label"}>Person</span>
              <select
                value={view.person}
                disabled={busy}
                onChange={(event) => void save({ person: event.target.value as VillageWritingView["person"] })}
              >
                <option value="first">First person (I)</option>
                <option value="second">Second person (you)</option>
                <option value="third">Third person (player name)</option>
              </select>
            </label>
            <label className={ELEMENT_TAG + "-field"}>
              <span className={ELEMENT_TAG + "-label"}>Content rating</span>
              <select
                value={view.rating}
                disabled={busy}
                onChange={(event) => void save({ rating: event.target.value as VillageWritingView["rating"] })}
              >
                <option value="sfw">SFW</option>
                <option value="nsfw">NSFW</option>
              </select>
            </label>
          </div>
        </>
      ) : !error ? (
        <span className={ELEMENT_TAG + "-hint"}>Loading…</span>
      ) : null}
      {busy ? <span className={ELEMENT_TAG + "-hint"}>Saving…</span> : null}
      {saved && !busy ? (
        <span className={ELEMENT_TAG + "-hint"} role="status">
          Saved
        </span>
      ) : null}
      {error ? (
        <p className={ELEMENT_TAG + "-error"} role="alert">
          {error}
          {!view ? (
            <button type="button" onClick={retryRead}>
              Retry
            </button>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
