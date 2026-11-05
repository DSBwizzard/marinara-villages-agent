import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  LoreActivity as Activity,
  LoreActivityList,
  LoreTriggerDetail,
  LoreUse,
} from "../../shared/contracts/lore.js";
import { request, messageFrom } from "./api.js";
import { useVillageActivity, useVisibleInterval, useFocusRevision } from "./activity.js";
import { ModalDialog } from "./ModalDialog.js";

const formatTime = (at: string, compact = false) =>
  new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    ...(compact ? {} : { year: "numeric" as const }),
    hour: "numeric",
    minute: "2-digit",
    ...(compact ? {} : { second: "2-digit" as const, timeZoneName: "short" as const }),
  }).format(new Date(at));
const entryKey = (entry: LoreUse) => JSON.stringify([entry.bookId, entry.id]);
const category = (purpose: string) => purpose.split(" · ")[0]!;
function seenRevision(scope: string) {
  try {
    return Number(localStorage.getItem(`villages:lore-seen:${scope}`)) || 0;
  } catch {
    return 0;
  }
}
const empty: LoreActivityList = { scope: "", revision: 0, records: [] };
const LoreActivityContext = createContext<{ unread: boolean; show(query: string): void } | null>(null);

export function LoreActivityButton({
  query = "",
  role,
  onOpen,
}: {
  query?: string;
  role?: "menuitem";
  onOpen?: () => void;
}) {
  const activity = useContext(LoreActivityContext);
  if (!activity) return null;
  return (
    <button
      type="button"
      role={role}
      className="villages-lore-launch"
      aria-label={`Lore activity${activity.unread ? " · New activity" : ""}`}
      onClick={() => {
        onOpen?.();
        activity.show(query);
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 7v14m0-14C9 4 5 4 2 5v15c3-1 7-1 10 1m0-14c3-3 7-3 10-2v15c-3-1-7-1-10 1" />
      </svg>
      Lore activity{activity.unread ? <span className="villages-lore-dot" aria-hidden="true" /> : null}
    </button>
  );
}

export function LoreActivity({ children }: { children: ReactNode }) {
  const host = useRef<HTMLDivElement>(null);
  const { visible } = useVillageActivity();
  const focus = useFocusRevision(visible);
  const [open, setOpen] = useState(false);
  const [contextQuery, setContextQuery] = useState("");
  const [summary, setSummary] = useState(empty);
  const [seen, setSeen] = useState(0);
  const [activity, setActivity] = useState<LoreActivityList | null>(null);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const sequence = useRef(0);
  const scope = useRef("");
  const scopeEpoch = useRef(0);
  const watermarks = useRef(new Map<string, number>());
  const readSeen = useCallback((id: string) => Math.max(watermarks.current.get(id) ?? 0, seenRevision(id)), []);
  const applySummary = useCallback(
    (next: LoreActivityList) => {
      if (scope.current && scope.current !== next.scope) {
        scopeEpoch.current++;
        setOpen(false);
        setActivity(null);
      }
      scope.current = next.scope;
      setSummary((prior) =>
        prior.scope === next.scope ? { ...next, revision: Math.max(prior.revision, next.revision) } : next,
      );
      setSeen(readSeen(next.scope));
    },
    [readSeen],
  );
  const readSummary = async (signal: AbortSignal) => {
    const id = ++sequence.current;
    const next = await request<LoreActivityList>("/debug/lore?activity=summary", { signal });
    if (typeof next.scope !== "string" || !Number.isSafeInteger(next.revision) || next.revision < 0) return;
    if (!signal.aborted && id === sequence.current) applySummary(next);
  };
  useVisibleInterval(readSummary, 5000);
  const readOnFocus = useEffectEvent(readSummary);
  useEffect(() => {
    if (!visible) return;
    const controller = new AbortController();
    void readOnFocus(controller.signal).catch(() => {});
    return () => controller.abort();
  }, [visible, focus]);
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const expectedEpoch = scopeEpoch.current;
    ++sequence.current;
    setError("");
    void request<LoreActivityList>("/debug/lore", {
      method: "POST",
      signal: controller.signal,
      body: JSON.stringify({ action: "activity" }),
    })
      .then((next) => {
        if (controller.signal.aborted || scopeEpoch.current !== expectedEpoch) return;
        if (scope.current && scope.current !== next.scope) {
          applySummary(next);
          return;
        }
        setActivity(next);
        applySummary(next);
        try {
          localStorage.setItem(
            `villages:lore-seen:${next.scope}`,
            String(Math.max(readSeen(next.scope), next.revision)),
          );
        } catch {
          /* This device can still track unread activity for this visit. */
        }
        const revision = Math.max(readSeen(next.scope), next.revision);
        watermarks.current.set(next.scope, revision);
        setSeen(revision);
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setError(messageFrom(cause, "Could not load Lore activity."));
      });
    return () => controller.abort();
  }, [open, refresh, applySummary, readSeen]);
  const unread = summary.revision > seen;
  return (
    <LoreActivityContext
      value={{
        unread,
        show: (query) => {
          setContextQuery(query);
          setActivity(null);
          setOpen(true);
        },
      }}
    >
      <div className="villages-lore-host" ref={host}>
        <div className="villages-lore-workarea">{children}</div>
        {open && host.current ? (
          <ModalDialog
            title="Lore activity"
            onClose={() => setOpen(false)}
            scope={host.current}
            className="villages-lore-dialog"
            headerContent={
              <>
                <h3>Lore activity</h3>
                {activity && summary.revision > activity.revision ? (
                  <button
                    type="button"
                    className="villages-lore-refresh"
                    onClick={() => setRefresh((value) => value + 1)}
                  >
                    New activity <span className="villages-lore-dot" aria-hidden="true" />
                  </button>
                ) : null}
              </>
            }
          >
            {error ? (
              <div className="villages-lore-empty">
                <p role="alert">{error}</p>
                <button type="button" onClick={() => setRefresh((value) => value + 1)}>
                  Retry
                </button>
              </div>
            ) : activity ? (
              <LoreInspector
                key={JSON.stringify([activity.scope, contextQuery])}
                records={activity.records}
                initialSearch={contextQuery}
              />
            ) : (
              <p className="villages-lore-empty" role="status">
                Loading activity…
              </p>
            )}
          </ModalDialog>
        ) : null}
      </div>
    </LoreActivityContext>
  );
}

function LoreInspector({ records, initialSearch }: { records: Activity[]; initialSearch: string }) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState(initialSearch);
  const [selected, setSelected] = useState("");
  const [useId, setUseId] = useState("");
  const [reading, setReading] = useState(false);
  const panes = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const target = panes.current?.querySelector<HTMLElement>(
      reading ? ".villages-lore-back" : '.villages-lore-rows>button[aria-pressed="true"]',
    );
    if (target?.checkVisibility()) target.focus({ preventScroll: true });
  }, [reading]);
  const groups = [...new Set(records.map((record) => category(record.purpose)))];
  const rows = new Map<string, { entry: LoreUse; uses: Activity[] }>();
  for (const record of records) {
    if (filter !== "All" && category(record.purpose) !== filter) continue;
    for (const entry of record.entries) {
      const key = entryKey(entry);
      if (!rows.has(key)) rows.set(key, { entry, uses: [] });
      rows.get(key)!.uses.push(record);
    }
  }
  const query = search.trim().toLocaleLowerCase();
  const matches = [...rows.values()].filter((row) =>
    [row.entry.name, row.entry.bookName, ...row.uses.map((use) => use.purpose)]
      .join(" ")
      .toLocaleLowerCase()
      .includes(query),
  );
  const chosen = matches.find((row) => entryKey(row.entry) === selected) ?? matches[0];
  const activeUse = chosen?.uses.find((use) => use.id === useId) ?? chosen?.uses[0];
  const activeEntry = activeUse?.entries.find((entry) => chosen && entryKey(entry) === entryKey(chosen.entry));
  return (
    <>
      <nav className="villages-lore-filters" aria-label="Lore generations">
        {["All", ...groups].map((group) => (
          <button
            key={group}
            type="button"
            aria-pressed={filter === group}
            onClick={() => {
              setFilter(group);
              setReading(false);
            }}
          >
            {group}
          </button>
        ))}
      </nav>
      {!records.length ? (
        <div className="villages-lore-empty">
          <h4>No Lore activity yet</h4>
          <p>New requests will record their included Lorebook entries here.</p>
        </div>
      ) : (
        <div className="villages-lore-panes" data-reading={reading} ref={panes}>
          <section className="villages-lore-list" aria-label="Lore entries">
            <div className="villages-lore-search">
              <input
                type="search"
                aria-label="Search Lore entries"
                placeholder="Search entries or books"
                value={search}
                onChange={(event) => {
                  setSearch(event.currentTarget.value);
                  setReading(false);
                }}
                autoComplete="off"
              />
              <span>
                {matches.length} {matches.length === 1 ? "entry" : "entries"}
              </span>
            </div>
            <div className="villages-lore-rows">
              {matches.map((row) => (
                <button
                  type="button"
                  key={entryKey(row.entry)}
                  aria-pressed={chosen === row}
                  onClick={() => {
                    setSelected(entryKey(row.entry));
                    setUseId("");
                    setReading(true);
                  }}
                >
                  <strong>{row.entry.name}</strong>
                  <span>{row.entry.bookName || row.entry.bookId}</span>
                  <span className="villages-lore-tags">
                    {[...new Set(row.uses.map((use) => category(use.purpose)))].slice(0, 2).map((label) => (
                      <span key={label}>{label}</span>
                    ))}
                  </span>
                  <time dateTime={row.uses[0]!.at}>{formatTime(row.uses[0]!.at, true)}</time>
                </button>
              ))}
              {!matches.length ? <p className="villages-lore-empty">No matching entries.</p> : null}
            </div>
          </section>
          <section className="villages-lore-detail" aria-label="Lore explanation">
            <button type="button" className="villages-lore-back" onClick={() => setReading(false)}>
              ← Entries
            </button>
            {chosen && activeUse && activeEntry ? (
              <>
                <h4>{activeEntry.name}</h4>
                <p className="villages-lore-muted">{activeEntry.bookName || activeEntry.bookId}</p>
                <div className="villages-lore-uses" aria-label="Receiving requests">
                  {chosen.uses.map((use) => (
                    <button
                      key={use.id}
                      type="button"
                      aria-pressed={use === activeUse}
                      onClick={() => setUseId(use.id)}
                    >
                      <strong>{use.purpose}</strong>
                      <span>
                        {use.entries.find((entry) => entryKey(entry) === entryKey(chosen.entry))!.targets.join(" · ")} ·{" "}
                        {formatTime(use.at, true)}
                      </span>
                    </button>
                  ))}
                </div>
                <LoreExplanation
                  key={JSON.stringify([activeUse.id, chosen.entry.bookId, chosen.entry.id])}
                  entry={activeEntry}
                />
              </>
            ) : (
              <p className="villages-lore-empty">Choose an entry.</p>
            )}
          </section>
        </div>
      )}
    </>
  );
}

function LoreExplanation({ entry }: { entry: LoreUse }) {
  const [detail, setDetail] = useState<LoreTriggerDetail | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const ref = entry.inspections?.[0];
  const inspectionId = ref?.id,
    target = ref?.target;
  useEffect(() => {
    if (!inspectionId) return;
    const controller = new AbortController();
    setError("");
    void request<LoreTriggerDetail>("/debug/lore", {
      method: "POST",
      signal: controller.signal,
      body: JSON.stringify({ inspectionId, bookId: entry.bookId, entryId: entry.id, target }),
    })
      .then((result) => {
        if (!controller.signal.aborted) setDetail(result);
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setError(messageFrom(cause, "Could not load this explanation."));
      });
    return () => controller.abort();
  }, [inspectionId, target, entry.bookId, entry.id, attempt]);
  if (error)
    return (
      <>
        <p role="alert">{error}</p>
        <button type="button" onClick={() => setAttempt((value) => value + 1)}>
          Retry explanation
        </button>
      </>
    );
  if (!inspectionId || detail?.trigger === null) return <p>Trigger details are no longer available.</p>;
  if (!detail) return <p role="status">Loading explanation…</p>;
  const trigger = detail.trigger!;
  const context = trigger.context;
  return (
    <>
      <div className="villages-lore-why">
        <span>Why included</span>
        <p>
          {trigger.constant
            ? "Always eligible — no keyword required."
            : `“${trigger.key}” matched ${trigger.match === "recent" ? "recent dialogue" : trigger.match === "current" ? "the current request" : "the generation context"}.`}
        </p>
      </div>
      {detail.at ? (
        <p className="villages-lore-stamp">
          Prompt prepared <time dateTime={detail.at}>{formatTime(detail.at)}</time>
        </p>
      ) : null}
      <dl className="villages-lore-facts">
        <div>
          <dt>Receiving request</dt>
          <dd>{target}</dd>
        </div>
        {trigger.key ? (
          <div>
            <dt>Matching</dt>
            <dd>
              {trigger.caseSensitive ? "Case-sensitive" : "Case-insensitive"} ·{" "}
              {trigger.matchWholeWords ? "Whole words" : "Substring"}
            </dd>
          </div>
        ) : null}
        {trigger.secondary ? (
          <div>
            <dt>Secondary keys</dt>
            <dd>
              {
                {
                  and_any: "Any required",
                  and_all: "All required",
                  not_any: "None allowed",
                  not_all: "At least one absent",
                }[trigger.secondary.logic]
              }{" "}
              · {trigger.secondary.matched} of {trigger.secondary.total} matched
            </dd>
          </div>
        ) : null}
      </dl>
      {detail.capturedAt && detail.at && Math.abs(Date.parse(detail.capturedAt) - Date.parse(detail.at)) >= 1000 ? (
        <p className="villages-lore-stamp">
          Context captured <time dateTime={detail.capturedAt}>{formatTime(detail.capturedAt)}</time>
        </p>
      ) : null}
      {context ? (
        <section className="villages-lore-context">
          <h5>{trigger.constant ? "Also matched" : "Matched context"}</h5>
          <p>{context.source}</p>
          <blockquote>
            {context.text.slice(0, context.start)}
            <mark>{context.text.slice(context.start, context.end)}</mark>
            {context.text.slice(context.end)}
          </blockquote>
        </section>
      ) : detail.requestContext ? (
        <section className="villages-lore-context">
          <h5>Request context excerpt</h5>
          <blockquote>{detail.requestContext}</blockquote>
        </section>
      ) : (
        <p className="villages-lore-muted">Context was not recorded for this lookup.</p>
      )}
      {trigger.secondaryMatches?.map((match, index) => (
        <section className="villages-lore-context villages-lore-secondary" key={index}>
          <h5>Secondary match · “{match.key}”</h5>
          <p>{match.source}</p>
          <blockquote>{match.text}</blockquote>
        </section>
      ))}
    </>
  );
}
