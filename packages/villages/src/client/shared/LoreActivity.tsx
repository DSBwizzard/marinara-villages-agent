import { createContext, useContext, useEffect, useEffectEvent, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { LoreActivityList, LoreEntryDetail, LoreUse } from "../../shared/contracts/lore.js";
import { request, messageFrom } from "./api.js";
import { useVillageActivity, useVisibleInterval, useFocusRevision } from "./activity.js";
import { ModalDialog } from "./ModalDialog.js";

const empty: LoreActivityList = { scope: "", revision: 0, records: [] };
const LoreActivityContext = createContext<{ present: boolean; anchor(node: HTMLDivElement | null): void } | null>(null);
const entryKey = (entry: LoreUse) => JSON.stringify([entry.bookId, entry.id]);
function dismissedRevision(scope: string) {
  try {
    return Number(localStorage.getItem(`villages:lore-dismissed:${scope}`)) || 0;
  } catch {
    return 0;
  }
}

/** Use the Scene notification lane; other screens use the shared corner chip. */
export function LoreActivitySlot() {
  const activity = useContext(LoreActivityContext);
  const { visible } = useVillageActivity();
  return visible && activity?.present ? <div className="villages-lore-chip-slot" ref={activity.anchor} /> : null;
}

export function LoreActivity({
  children,
  enabled = true,
  daylight = false,
}: {
  children: ReactNode;
  enabled?: boolean;
  daylight?: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const { visible } = useVillageActivity();
  const focus = useFocusRevision(visible);
  const [anchor, setAnchor] = useState<HTMLDivElement | null>(null);
  const [summary, setSummary] = useState(empty);
  const [activity, setActivity] = useState(empty);
  const [dismissed, setDismissed] = useState(0);
  const [open, setOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState("");
  const [selectedEntry, setSelectedEntry] = useState("");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const sequence = useRef(0);
  const scope = useRef("");
  async function readSummary(signal: AbortSignal) {
    const id = ++sequence.current;
    const next = await request<LoreActivityList>("/debug/lore?activity=summary", { signal });
    if (
      signal.aborted ||
      id !== sequence.current ||
      typeof next.scope !== "string" ||
      !Number.isSafeInteger(next.revision)
    )
      return;
    if (scope.current !== next.scope) {
      scope.current = next.scope;
      setOpen(false);
      setActivity(empty);
      setDismissed(dismissedRevision(next.scope));
    }
    setSummary((prior) =>
      prior.scope === next.scope ? { ...next, revision: Math.max(prior.revision, next.revision) } : next,
    );
  }
  useVisibleInterval(readSummary, 5000, enabled);
  const readOnFocus = useEffectEvent(readSummary);
  useEffect(() => {
    if (!enabled || !visible) {
      setOpen(false);
      return;
    }
    const controller = new AbortController();
    void readOnFocus(controller.signal).catch(() => {});
    return () => controller.abort();
  }, [enabled, visible, focus]);
  useEffect(() => {
    if (!enabled || !visible || !summary.scope || summary.revision <= dismissed) return;
    const controller = new AbortController();
    const expectedScope = summary.scope;
    void request<LoreActivityList>("/debug/lore", {
      method: "POST",
      signal: controller.signal,
      body: JSON.stringify({ action: "activity" }),
    })
      .then((next) => {
        if (controller.signal.aborted || scope.current !== expectedScope || next.scope !== expectedScope) return;
        setActivity(next);
        setError("");
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setError(messageFrom(cause, "Could not load Lorebook entries."));
      });
    return () => controller.abort();
  }, [enabled, visible, summary.scope, summary.revision, dismissed, attempt]);
  const records =
    activity.scope === summary.scope ? activity.records.filter((record) => record.revision > dismissed) : [];
  const present = enabled && (records.length > 0 || (!!error && summary.revision > dismissed));
  const count = Math.max(1, records.length);
  const record = records.find((row) => row.id === selectedRequest) ?? records[0];
  const chosen = record?.entries.find((entry) => entryKey(entry) === selectedEntry);
  const chip = present ? (
    <button
      type="button"
      className="villages-lore-chip"
      aria-label={`Lorebooks · ${count} ${count === 1 ? "request" : "requests"}`}
      title={`Lorebooks · ${count} ${count === 1 ? "request" : "requests"}`}
      onClick={() => {
        setSelectedRequest(records[0]?.id ?? "");
        setSelectedEntry("");
        setOpen(true);
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 7v14m0-14C9 4 5 4 2 5v15c3-1 7-1 10 1m0-14c3-3 7-3 10-2v15c-3-1-7-1-10 1" />
      </svg>
      {records.length || 1}
    </button>
  ) : null;
  return (
    <LoreActivityContext value={{ present, anchor: setAnchor }}>
      <div className="villages-lore-host" ref={host} data-daylight={daylight || undefined}>
        <div className="villages-lore-workarea">{children}</div>
        {anchor ? createPortal(chip, anchor) : chip ? <div className="villages-lore-global">{chip}</div> : null}
        {enabled && open && host.current ? (
          <ModalDialog
            title="Lorebooks used"
            onClose={() => setOpen(false)}
            scope={host.current}
            className="villages-lore-dialog"
            scrollBody
            focusHeaderOnMobile
          >
            <div className="villages-lore-body">
              {error ? (
                <p role="alert">
                  {error}
                  <button type="button" onClick={() => setAttempt((value) => value + 1)}>
                    Retry
                  </button>
                </p>
              ) : null}
              {record ? (
                <>
                  <label className="villages-lore-request">
                    Request
                    <select
                      aria-label="Lorebook request"
                      value={record.id}
                      onChange={(event) => {
                        setSelectedRequest(event.currentTarget.value);
                        setSelectedEntry("");
                      }}
                    >
                      {records.map((row) => (
                        <option key={row.id} value={row.id}>
                          {row.purpose} ·{" "}
                          {new Date(row.at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                        </option>
                      ))}
                    </select>
                  </label>
                  <nav className="villages-lore-entries" aria-label="Included Lorebook entries">
                    {record.entries.map((entry) => (
                      <button
                        type="button"
                        key={entryKey(entry)}
                        aria-pressed={entry === chosen}
                        onClick={() => setSelectedEntry(entryKey(entry))}
                      >
                        <strong>{entry.name}</strong>
                        <small>{entry.bookName || entry.bookId}</small>
                      </button>
                    ))}
                  </nav>
                  {chosen ? (
                    <LoreEntry
                      key={JSON.stringify([activity.scope, record.id, entryKey(chosen)])}
                      scope={activity.scope}
                      entry={chosen}
                    />
                  ) : null}
                </>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  const revision = Math.max(
                    dismissedRevision(summary.scope),
                    activity.scope === summary.scope ? activity.revision : summary.revision,
                  );
                  try {
                    localStorage.setItem(`villages:lore-dismissed:${summary.scope}`, String(revision));
                  } catch {
                    /* This visit can still dismiss its notices. */
                  }
                  setDismissed(revision);
                  setOpen(false);
                }}
              >
                Dismiss
              </button>
            </div>
          </ModalDialog>
        ) : null}
      </div>
    </LoreActivityContext>
  );
}

function LoreEntry({ scope, entry }: { scope: string; entry: LoreUse }) {
  const [detail, setDetail] = useState<LoreEntryDetail | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const ref = entry.inspections?.[0];
  const inspectionId = ref?.id,
    target = ref?.target;
  useEffect(() => {
    if (!inspectionId || !target) return;
    const controller = new AbortController();
    setError("");
    void request<LoreEntryDetail>("/debug/lore", {
      method: "POST",
      signal: controller.signal,
      body: JSON.stringify({ action: "entry", scope, inspectionId, target, bookId: entry.bookId, entryId: entry.id }),
    })
      .then((next) => {
        if (!controller.signal.aborted) setDetail(next);
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setError(messageFrom(cause, "Could not read this entry."));
      });
    return () => controller.abort();
  }, [scope, inspectionId, target, entry.bookId, entry.id, attempt]);
  return (
    <section className="villages-lore-entry" aria-label={entry.name}>
      <h3>{entry.name}</h3>
      {error ? (
        <p role="alert">
          {error}
          <button type="button" onClick={() => setAttempt((value) => value + 1)}>
            Retry
          </button>
        </p>
      ) : !ref || detail?.text === null ? (
        <p>This older request has no saved entry text.</p>
      ) : detail ? (
        <div className="villages-lore-text">{detail.text}</div>
      ) : (
        <p role="status">Loading entry…</p>
      )}
    </section>
  );
}
