import { useEffect, useRef, useState } from "react";
import type { MemoryCorrectRequest, MemoryInspection } from "../../../shared/contracts/village.js";
import { messageFrom, request } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { createVillagesClientId } from "../../shared/request-id.js";

export function MemoryCorrectionForm({
  inspection,
  knower,
  busy,
  onSaving,
  onSaved,
  onCancel,
}: {
  inspection: MemoryInspection;
  knower: string;
  busy: boolean;
  onSaving(saving: boolean): void;
  onSaved(): void;
  onCancel(): void;
}) {
  const [text, setText] = useState(inspection.entry.text);
  const [knowers, setKnowers] = useState([knower]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const pending = useRef<MemoryCorrectRequest | null>(null);
  const saving = useRef(false);
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  const tooLong = new TextEncoder().encode(text).length > 600;
  const change = () => {
    pending.current = null;
    setError("");
  };
  const save = async () => {
    if (saving.current || busy || !text.trim() || tooLong || !knowers.length) return;
    const { entry } = inspection;
    // An uncertain response retries the exact operation; never silently rebase onto new history.
    pending.current ??= {
      operationId: createVillagesClientId(),
      seed: inspection.seed,
      expectedCollectionRevision: inspection.revision,
      target: { id: entry.id, revision: entry.revision, rootRevision: entry.rootRevision },
      knowers: [...knowers],
      text,
    };
    saving.current = true;
    setSubmitting(true);
    onSaving(true);
    setError("");
    try {
      await request(`/memories/${encodeURIComponent(entry.id)}/correct`, {
        method: "POST",
        body: JSON.stringify(pending.current),
      });
      if (active.current) onSaved();
    } catch (cause) {
      if (active.current) setError(messageFrom(cause, "Could not correct that memory."));
    } finally {
      saving.current = false;
      if (active.current) {
        setSubmitting(false);
        onSaving(false);
      }
    }
  };
  return (
    <form
      className={`${ELEMENT_TAG}-memory-correction`}
      aria-label="Correct memory"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <label>
        Corrected memory
        <textarea
          autoFocus
          rows={4}
          value={text}
          disabled={busy}
          onChange={(event) => {
            change();
            setText(event.target.value);
          }}
        />
      </label>
      <fieldset disabled={busy}>
        <legend>Applies to</legend>
        {inspection.knowers.map((known) => (
          <label key={known.person.id}>
            <input
              type="checkbox"
              checked={knowers.includes(known.person.id)}
              disabled={known.forgotten}
              onChange={(event) => {
                change();
                setKnowers(
                  event.target.checked ? [...knowers, known.person.id] : knowers.filter((id) => id !== known.person.id),
                );
              }}
            />
            {known.person.name}
            {known.forgotten ? " · Forgotten" : ""}
          </label>
        ))}
      </fieldset>
      {tooLong ? <p role="alert">The correction is too long. Shorten it to save.</p> : null}
      {error ? <p role="alert">{error}</p> : null}
      <div className={`${ELEMENT_TAG}-memory-card-actions`}>
        <button type="submit" disabled={busy || !text.trim() || tooLong || !knowers.length}>
          {submitting ? "Saving…" : "Save correction"}
        </button>
        <button type="button" disabled={busy} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
