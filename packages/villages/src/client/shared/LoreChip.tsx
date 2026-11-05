import { useEffect, useState } from "react";
import type { LoreTrigger, LoreUse } from "../../shared/contracts/lore.js";
import { mergeLoreUse } from "../../shared/helpers/lore.js";
import { messageFrom, request } from "./api.js";
import { ModalDialog } from "./ModalDialog.js";
import { ELEMENT_TAG } from "./constants.js";

function LoreReason({
  bookId,
  entryId,
  inspectionId,
  target,
}: {
  bookId: string;
  entryId: string;
  inspectionId: string;
  target: string;
}) {
  const [trigger, setTrigger] = useState<LoreTrigger | null>();
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setError("");
    void request<{ trigger: LoreTrigger | null }>("/debug/lore", {
      method: "POST",
      signal: controller.signal,
      body: JSON.stringify({ inspectionId, bookId, entryId }),
    })
      .then((result) => {
        if (!controller.signal.aborted) setTrigger(result.trigger);
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setError(messageFrom(cause, "Could not inspect this trigger."));
      });
    return () => controller.abort();
  }, [bookId, entryId, inspectionId, attempt]);
  if (error)
    return (
      <div>
        <p role="alert">{error}</p>
        <button type="button" onClick={() => setAttempt(attempt + 1)}>
          Retry
        </button>
      </div>
    );
  if (trigger === undefined) return <p role="status">Loading trigger…</p>;
  return (
    <section aria-label={`${target} trigger`} className={`${ELEMENT_TAG}-lore-reason`}>
      <strong>{target}</strong>
      {!trigger ? (
        <p>Trigger details expired or the runtime restarted.</p>
      ) : (
        <>
          {trigger.constant ? <p>Constant entry · no key required.</p> : null}
          {trigger.key ? (
            <>
              <p>
                Key “{trigger.key}” {trigger.constant ? "also matched" : "matched"}{" "}
                {
                  {
                    current: "the current request",
                    recent: "recent shared dialogue",
                    setting: "the setting / generation context",
                    constant: "the context",
                  }[trigger.match]
                }
                .
              </p>
              <p>
                {trigger.caseSensitive ? "Case-sensitive" : "Case-insensitive"} ·{" "}
                {trigger.matchWholeWords ? "Whole words" : "Substring matching"}
              </p>
            </>
          ) : null}
          {trigger.secondary ? (
            <p>
              {
                {
                  and_any: "Any secondary key required",
                  and_all: "All secondary keys required",
                  not_any: "No secondary keys allowed",
                  not_all: "At least one secondary key must be absent",
                }[trigger.secondary.logic]
              }{" "}
              · {trigger.secondary.matched} of {trigger.secondary.total} matched.
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}

function LoreNotice({ entry }: { entry: LoreUse }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <details onToggle={(event) => setExpanded(event.currentTarget.open)}>
      <summary aria-label={`Why ${entry.name}?`}>
        <strong>{entry.name}</strong>
        <span className={`${ELEMENT_TAG}-lore-book`}>{entry.bookName || entry.bookId}</span>
        <span className={`${ELEMENT_TAG}-lore-targets`}>
          {entry.targets.map((target) => (
            <span key={target}>{target}</span>
          ))}
        </span>
      </summary>
      {expanded ? (
        entry.inspections?.length ? (
          entry.inspections.map(({ id, target }) => (
            <LoreReason
              key={JSON.stringify([entry.bookId, entry.id, id, target])}
              bookId={entry.bookId}
              entryId={entry.id}
              inspectionId={id}
              target={target}
            />
          ))
        ) : (
          <p>Trigger details were not recorded.</p>
        )
      ) : null}
    </details>
  );
}

export function LoreChip({ entries, label }: { entries?: readonly LoreUse[]; label?: string }) {
  const [open, setOpen] = useState(false);
  const lore = mergeLoreUse(entries);
  if (!lore.length) return null;
  return (
    <>
      <button
        type="button"
        className={`${ELEMENT_TAG}-lore-use-chip`}
        aria-label={`${lore.length} Lorebook entries${label ? ` · ${label}` : ""}`}
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 7v14m0-14C9 4 5 4 2 5v15c3-1 7-1 10 1m0-14c3-3 7-3 10-2v15c-3-1-7-1-10 1" />
        </svg>
        Lore · {lore.length}
      </button>
      {open ? (
        <ModalDialog
          title="Lorebooks"
          onClose={() => setOpen(false)}
          compact
          scrollBody
          className={`${ELEMENT_TAG}-lore-dialog`}
        >
          {label ? <p className={`${ELEMENT_TAG}-lore-label`}>{label}</p> : null}
          <ul>
            {lore.map((entry) => (
              <li key={JSON.stringify([entry.bookId, entry.id])}>
                <LoreNotice entry={entry} />
              </li>
            ))}
          </ul>
        </ModalDialog>
      ) : null}
    </>
  );
}

export function FoundingLore({ records }: { records?: { label: string; entries: LoreUse[] }[] }) {
  const rows = records?.filter((row) => row.entries.length) ?? [];
  if (!rows.length) return null;
  return (
    <details className={`${ELEMENT_TAG}-founding-lore`}>
      <summary>Founding Lorebooks</summary>
      {rows.map((row, index) => (
        <div key={index} className={`${ELEMENT_TAG}-lore-task`}>
          <span>{row.label}</span>
          <LoreChip entries={row.entries} label={row.label} />
        </div>
      ))}
    </details>
  );
}
