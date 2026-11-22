import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import type { LoreActivityList, LoreUse } from "../../shared/contracts/lore.js";
import { request, messageFrom } from "./api.js";
import { useVillageActivity, useVisibleInterval, useFocusRevision } from "./activity.js";

const empty: LoreActivityList = { scope: "", revision: 0, records: [] };
const LoreActivityContext = createContext<{
  anchor(node: HTMLDivElement | null, entries?: readonly LoreUse[]): void;
} | null>(null);

/** Scenes supply their reply's provenance; other screens show the latest request. */
export function LoreActivitySlot({ entries }: { entries?: readonly LoreUse[] }) {
  const activity = useContext(LoreActivityContext);
  const { visible } = useVillageActivity();
  const anchor = activity?.anchor;
  const attach = useCallback((node: HTMLDivElement | null) => anchor?.(node, entries), [anchor, entries]);
  return visible && activity ? <div className="villages-lore-chip-slot" ref={attach} /> : null;
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
  const { visible } = useVillageActivity();
  const focus = useFocusRevision(visible);
  const [target, setTarget] = useState<{ node: HTMLDivElement; entries?: readonly LoreUse[] } | null>(null);
  const anchor = useCallback((node: HTMLDivElement | null, entries?: readonly LoreUse[]) => {
    setTarget(node ? { node, entries } : null);
  }, []);
  const [summary, setSummary] = useState(empty);
  const [activity, setActivity] = useState(empty);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const sequence = useRef(0);
  const scope = useRef("");
  const readActivity = enabled && target?.entries === undefined;
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
      setActivity(empty);
      setError("");
    }
    setSummary((prior) =>
      prior.scope === next.scope ? { ...next, revision: Math.max(prior.revision, next.revision) } : next,
    );
  }
  useVisibleInterval(readSummary, 5000, readActivity);
  const readOnFocus = useEffectEvent(readSummary);
  useEffect(() => {
    if (!readActivity || !visible) return;
    const controller = new AbortController();
    void readOnFocus(controller.signal).catch(() => {});
    return () => controller.abort();
  }, [readActivity, visible, focus]);
  useEffect(() => {
    if (!readActivity || !visible || !summary.scope || !summary.revision) return;
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
  }, [readActivity, visible, summary.scope, summary.revision, attempt]);
  const record = activity.scope === summary.scope ? activity.records[0] : undefined;
  const entries = target?.entries ?? record?.entries ?? [];
  const chip =
    enabled && visible && (entries.length > 0 || (readActivity && !!error)) ? (
      <LoreChip
        key={JSON.stringify([summary.scope, entries])}
        entries={entries}
        error={readActivity ? error : ""}
        onRetry={() => setAttempt((value) => value + 1)}
      />
    ) : null;
  return (
    <LoreActivityContext value={{ anchor }}>
      <div className="villages-lore-host" data-daylight={daylight || undefined}>
        <div className="villages-lore-workarea">{children}</div>
        {target ? createPortal(chip, target.node) : chip ? <div className="villages-lore-global">{chip}</div> : null}
      </div>
    </LoreActivityContext>
  );
}

function LoreChip({ entries, error, onRetry }: { entries: readonly LoreUse[]; error: string; onRetry(): void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      trigger.current?.focus({ preventScroll: true });
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  return (
    <div className="villages-lore-notice" ref={root}>
      <button
        type="button"
        className="villages-lore-chip"
        ref={trigger}
        aria-expanded={open}
        aria-controls={id}
        aria-label={`Lorebooks · ${entries.length} ${entries.length === 1 ? "entry" : "entries"}`}
        onClick={() => setOpen((value) => !value)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 7v14m0-14C9 4 5 4 2 5v15c3-1 7-1 10 1m0-14c3-3 7-3 10-2v15c-3-1-7-1-10 1" />
        </svg>
        {entries.length}
      </button>
      {open ? (
        <section id={id} className="villages-lore-popout" aria-label="Lorebooks used">
          <div className="villages-lore-head">
            <h2>Lorebooks used</h2>
            <button
              type="button"
              aria-label="Close Lorebooks used"
              onClick={() => {
                setOpen(false);
                trigger.current?.focus({ preventScroll: true });
              }}
            >
              ×
            </button>
          </div>
          {error ? (
            <p role="alert">
              {error}
              <button type="button" onClick={onRetry}>
                Retry
              </button>
            </p>
          ) : null}
          <ul>
            {entries.map((entry) => (
              <li key={JSON.stringify([entry.bookId, entry.id])}>{entry.name}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
