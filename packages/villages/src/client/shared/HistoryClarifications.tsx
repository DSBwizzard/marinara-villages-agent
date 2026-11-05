import { ELEMENT_TAG } from "./constants.js";
import { useState } from "react";
import type { RelationshipInspectView } from "../../shared/contracts/relationships.js";
type Conflict = RelationshipInspectView["conflicts"][number];
export function HistoryClarifications({
  conflicts,
  onSubmit,
  disabled = false,
}: {
  conflicts: Conflict[];
  disabled?: boolean;
  onSubmit: (conflict: Conflict, text: string) => Promise<void>;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  return (
    <>
      {conflicts.map((conflict) => {
        const key = conflict.sourceHash + JSON.stringify(conflict.actorIds) + conflict.question;
        return (
          <article key={key}>
            <h4>History needs clarification</h4>
            <p>{conflict.question}</p>
            <p>{conflict.residents.join(", ")}</p>
            <form
              className={ELEMENT_TAG + "-memory-correction"}
              autoComplete="off"
              onSubmit={async (event) => {
                event.preventDefault();
                setSaving(true);
                setError("");
                try {
                  await onSubmit(conflict, answers[key] ?? "");
                } catch (cause) {
                  setError(cause instanceof Error ? cause.message : "History clarification could not be saved.");
                } finally {
                  setSaving(false);
                }
              }}
            >
              <label>
                Clarification
                <textarea
                  className={ELEMENT_TAG + "-textarea"}
                  rows={3}
                  autoComplete="off"
                  maxLength={4000}
                  value={answers[key] ?? ""}
                  onChange={(event) => setAnswers((current) => ({ ...current, [key]: event.target.value }))}
                />
              </label>
              <button type="submit" disabled={disabled || saving || !answers[key]?.trim()}>
                Use this history
              </button>
            </form>
            <details>
              <summary>Source details</summary>
              <pre>{conflict.sourceIds.join("\n")}</pre>
            </details>
          </article>
        );
      })}
      {error ? <p role="alert">{error}</p> : null}
    </>
  );
}
