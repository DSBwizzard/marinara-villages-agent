import { messageFrom, request } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import type { VillageWritingView } from "../../../shared/contracts/village.js";
import { useCallback, useEffect, useState } from "react";
/** Per-village writing controls. Each save returns the server's effective settings. */
function useVillageWriting() {
  const [view, setView] = useState<VillageWritingView | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void request<VillageWritingView>("/narration")
      .then((next) => {
        if (!cancelled) setView(next);
      })
      .catch((cause) => {
        if (!cancelled) setError(messageFrom(cause, "Village writing settings could not be read."));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const save = useCallback(
    async (patch: {
      tense?: VillageWritingView["tense"];
      person?: VillageWritingView["person"];
      rating?: VillageWritingView["rating"];
      writingGuidance?: string;
    }): Promise<VillageWritingView | null> => {
      setBusy(true);
      setSaved(false);
      setError("");
      try {
        const next = await request<VillageWritingView>("/narration", { method: "PUT", body: JSON.stringify(patch) });
        setView(next);
        setSaved(true);
        return next;
      } catch (cause) {
        setError(messageFrom(cause, "That writing change could not be saved."));
        return null;
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  return { view, error, busy, saved, save };
}

export function VillageWritingSettings() {
  const { view, error, busy, saved, save } = useVillageWriting();
  const [guidanceDraft, setGuidanceDraft] = useState<string | null>(null);
  const draft = guidanceDraft ?? view?.writingGuidance ?? "";

  return (
    <div className={ELEMENT_TAG + "-field"}>
      <span className={ELEMENT_TAG + "-label"}>Additional writing guidance</span>
      {view ? (
        <>
          <textarea
            autoComplete="off"
            className={ELEMENT_TAG + "-textarea"}
            aria-label="Additional writing guidance"
            value={draft}
            rows={5}
            maxLength={view.writingGuidanceMaxLength}
            disabled={busy}
            onChange={(event) => setGuidanceDraft(event.target.value)}
          />
          <button
            type="button"
            className={ELEMENT_TAG + "-button"}
            disabled={busy || draft === view.writingGuidance}
            onClick={() => {
              void save({ writingGuidance: draft }).then((next) => {
                if (next) setGuidanceDraft(next.writingGuidance);
              });
            }}
          >
            Apply guidance
          </button>
          <button
            type="button"
            className={ELEMENT_TAG + "-button"}
            disabled={busy || !draft}
            onClick={() => {
              void save({ writingGuidance: "" }).then((next) => {
                if (next) setGuidanceDraft(next.writingGuidance);
              });
            }}
          >
            Clear guidance
          </button>
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
        <span className={ELEMENT_TAG + "-hint"}>Reading village writing settings…</span>
      ) : null}
      {busy ? <span className={ELEMENT_TAG + "-hint"}>Saving…</span> : null}
      {saved && !busy ? (
        <span className={ELEMENT_TAG + "-hint"} role="status">
          Saved for the next venue turn.
        </span>
      ) : null}
      {error ? (
        <p className={ELEMENT_TAG + "-error"} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
