import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { KnownWish, SocialWish } from "../../../shared/contracts/wishes.js";
import { useVillageActivity } from "../../shared/activity.js";
import { WISH_JOURNAL_STYLES } from "./wish-journal-styles.js";
import { WishPages } from "./wish-pages.js";
export type { KnownWish } from "../../../shared/contracts/wishes.js";
type View = { profiles: { characterId: string; knownWishes?: KnownWish[] }[] };
type Request = <T>(path: string, options?: RequestInit) => Promise<T>;
const timestamp = (at: string) => (
  <time dateTime={at}>{new Date(at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</time>
);
const statuses = { open: "Open", fulfilled: "Fulfilled", withdrawn: "Withdrawn" };
const attentionLabels = { background: "In the background", foreground: "On their mind" };
const historyLabels: Record<string, string> = {
  create: "Wish formed",
  reveal: "Shared",
  clarify: "Clarified",
  approach: "Approach changed",
  attention: "Attention changed",
  progress: "Experience recorded",
  fulfilled: "Fulfilled",
  withdrawn: "Withdrawn",
  reflection: "Reconsidered",
  repair: "Corrected",
};
const origins = {
  preparation: "At founding",
  scene: "Conversation",
  encounter: "Resident interaction",
  mail: "Letter",
  reflection: "Private reflection",
};
type Entry = {
  id: string;
  title: string;
  at: string;
  status?: KnownWish["status"];
  known?: KnownWish;
  privateWish?: SocialWish;
};
function PrivateWishDetails({ wish, section }: { wish: SocialWish; section: string }) {
  const history = [...(wish.history ?? [])];
  if (!history.some((event) => event.kind === "create"))
    history.unshift({
      id: wish.id + ":formed",
      at: wish.addedAt,
      kind: "create",
      text: wish.origin ? origins[wish.origin.kind] : "",
      sourceId: "",
      lineIds: [],
    });
  history.sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  return (
    <>
      {section === "wish" ? (
        <section className="villages-wish-section" aria-label="Wish summary">
          <h4>Desired outcome</h4>
          <p>{wish.wish}</p>
          <h4>Why it matters</h4>
          <p>{wish.reason}</p>
        </section>
      ) : section === "attention" ? (
        <section className="villages-wish-section" aria-label="Attention">
          <h4>Attention</h4>
          <strong>{attentionLabels[wish.attention.state]}</strong>
          <p>{wish.attention.reason}</p>
        </section>
      ) : section === "approach" ? (
        <section className="villages-wish-section" aria-label="Approach">
          <h4>Approach</h4>
          <p>{wish.approach || "None chosen."}</p>
        </section>
      ) : section === "conditions" ? (
        <section className="villages-wish-section" aria-label="Conditions">
          <h4>Conditions</h4>
          {wish.conditions?.length ? (
            <ul>
              {wish.conditions.map((condition) => (
                <li key={condition.id}>
                  <blockquote>{condition.quote}</blockquote>
                  {timestamp(condition.at)}
                </li>
              ))}
            </ul>
          ) : (
            <p>None expressed.</p>
          )}
        </section>
      ) : (
        <section className="villages-wish-section" aria-label="Wish history">
          <h4>History</h4>
          <ol className="villages-wish-timeline">
            {history.map((event) => (
              <li key={event.id}>
                <div className="villages-wish-event">
                  <strong>{historyLabels[event.kind] ?? "Recorded"}</strong>
                  {timestamp(event.at)}
                </div>
                <p>{event.text}</p>
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  );
}
function WishDetail({
  entry,
  prefix,
  busy,
  onBack,
  onFollow,
}: {
  entry: Entry;
  prefix: string;
  busy: boolean;
  onBack: () => void;
  onFollow: (wish: KnownWish) => void;
}) {
  const [section, setSection] = useState("wish");
  return (
    <section className="villages-wish-detail" aria-label="Wish details" data-wish-id={entry.id} tabIndex={-1}>
      <div className="villages-wish-actions">
        <button type="button" className="villages-wish-back" onClick={onBack}>
          ← Wishes
        </button>
        {entry.known ? (
          <button
            type="button"
            className={`${prefix}-button villages-wish-follow`}
            aria-pressed={entry.known.followed}
            disabled={busy}
            onClick={() => onFollow(entry.known!)}
          >
            {entry.known.followed ? "Following" : "Follow"}
          </button>
        ) : null}
      </div>
      <header>
        <h3>{entry.title}</h3>
        <div className="villages-wish-meta">
          {entry.status ? <span className="villages-wish-status">{statuses[entry.status]}</span> : null}
          {timestamp(entry.at)}
        </div>
      </header>
      <select aria-label="Wish detail section" value={section} onChange={(event) => setSection(event.target.value)}>
        <option value="wish">Wish</option>
        {entry.privateWish ? (
          <>
            <option value="attention">Attention</option>
            <option value="approach">Approach</option>
            <option value="conditions">Conditions</option>
          </>
        ) : null}
        <option value="history">History</option>
      </select>
      <WishPages key={section}>
        {entry.privateWish ? (
          <PrivateWishDetails wish={entry.privateWish} section={section} />
        ) : section === "wish" ? (
          <section className="villages-wish-section" aria-label="Wish summary">
            <h4>Desired outcome</h4>
            <p>{entry.title}</p>
          </section>
        ) : (
          <section className="villages-wish-section" aria-label="Recorded statements">
            <h4>History</h4>
            {entry.known?.facts.length ? (
              <ol className="villages-wish-timeline">
                {entry.known.facts.map((fact) => (
                  <li key={fact.id}>
                    {timestamp(fact.at)}
                    <blockquote>{fact.text}</blockquote>
                  </li>
                ))}
              </ol>
            ) : (
              <p>No further statements recorded.</p>
            )}
          </section>
        )}
      </WishPages>
    </section>
  );
}
export function VillagerWishJournal({
  request,
  characterId,
  prefix,
  focusWishId = "",
  wishes: suppliedWishes,
  onWishes,
  inspect = false,
}: {
  request: Request;
  characterId: string;
  prefix: string;
  focusWishId?: string;
  wishes?: KnownWish[] | null;
  onWishes?: (wishes: KnownWish[]) => void;
  inspect?: boolean;
}) {
  const { visible, backgroundRevision } = useVillageActivity();
  const [localWishes, setWishes] = useState<KnownWish[] | null>(null);
  const wishes = suppliedWishes === undefined ? localWishes : suppliedWishes;
  const [privateResult, setPrivate] = useState<{ characterId: string; wishes: SocialWish[] } | null>(null);
  const privateWishes = privateResult?.characterId === characterId ? privateResult.wishes : null;
  const [selection, setSelection] = useState({ characterId, inspect, id: focusWishId });
  const selectedId = selection.characterId === characterId && selection.inspect === inspect ? selection.id : "";
  const backFocus = useRef("");
  const focusedSelection = useRef("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const root = useRef<HTMLElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const [listHeight, setListHeight] = useState(0);
  const [listPage, setListPage] = useState(0);
  useLayoutEffect(() => {
    if (!list.current) return;
    const measure = () => setListHeight(list.current?.clientHeight ?? 0);
    const observer = new ResizeObserver(measure);
    observer.observe(list.current);
    measure();
    return () => observer.disconnect();
  });
  useEffect(() => {
    if (!visible || inspect || suppliedWishes !== undefined) return;
    const controller = new AbortController();
    setWishes(null);
    setError("");
    void request<View>("/relationships", { signal: controller.signal })
      .then((view) => {
        if (!controller.signal.aborted)
          setWishes(view.profiles.find((p) => p.characterId === characterId)?.knownWishes ?? []);
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setError(String(cause));
      });
    return () => controller.abort();
  }, [request, characterId, suppliedWishes, visible, backgroundRevision, inspect]);
  useEffect(() => {
    if (!inspect || !visible) {
      setPrivate(null);
      return;
    }
    setPrivate(null);
    setError("");
    const controller = new AbortController();
    void request<{ wishes: SocialWish[] }>(`/villagers/${encodeURIComponent(characterId)}/wishes/inspect`, {
      signal: controller.signal,
    })
      .then((view) => {
        if (!Array.isArray(view.wishes)) throw new Error("Wishes could not be read.");
        if (!controller.signal.aborted) setPrivate({ characterId, wishes: view.wishes });
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setError(String(cause));
      });
    return () => controller.abort();
  }, [inspect, visible, characterId, request, backgroundRevision]);
  useEffect(() => {
    setSelection({ characterId, inspect, id: inspect ? "" : focusWishId });
  }, [characterId, inspect, focusWishId]);
  useEffect(() => {
    if (!selectedId) {
      focusedSelection.current = "";
      return;
    }
    const key = `${characterId}:${inspect}:${selectedId}`;
    const target = [...(root.current?.querySelectorAll<HTMLElement>("[data-wish-id]") ?? [])].find(
      (el) => el.dataset.wishId === selectedId,
    );
    if (!target) {
      focusedSelection.current = "";
      return;
    }
    if (focusedSelection.current === key) return;
    focusedSelection.current = key;
    target?.focus({ preventScroll: true });
  }, [characterId, wishes, privateWishes, selectedId, inspect]);
  useEffect(() => {
    if (selectedId || !backFocus.current) return;
    const target = [...(root.current?.querySelectorAll<HTMLButtonElement>("[data-wish-summary]") ?? [])].find(
      (el) => el.dataset.wishSummary === backFocus.current,
    );
    target?.focus({ preventScroll: true });
    backFocus.current = "";
  }, [selectedId]);
  const follow = async (wish: KnownWish) => {
    setBusy(wish.wishId);
    setError("");
    try {
      const view = await request<View>(
        `/villagers/${encodeURIComponent(characterId)}/wishes/${encodeURIComponent(wish.wishId)}/follow`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ followed: !wish.followed }),
        },
      );
      const next = view.profiles.find((p) => p.characterId === characterId)?.knownWishes ?? [];
      setWishes(next);
      onWishes?.(next);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Wish could not be followed.");
    } finally {
      setBusy("");
    }
  };
  const entries: Entry[] | null = inspect
    ? (privateWishes?.map((wish) => ({
        id: wish.id,
        title: wish.wish,
        at: wish.changedAt || wish.addedAt,
        status: wish.status,
        privateWish: wish,
      })) ?? null)
    : (wishes?.map((wish) => ({ id: wish.wishId, title: wish.text, at: wish.at, status: wish.status, known: wish })) ??
      null);
  const selected = entries?.find((entry) => entry.id === selectedId);
  const pageSize = Math.max(1, Math.floor((listHeight + 8) / 112));
  const listPages = Math.max(1, Math.ceil((entries?.length ?? 0) / pageSize));
  const currentListPage = Math.min(listPage, listPages - 1);
  const focusedIndex = entries?.findIndex((entry) => entry.id === focusWishId) ?? -1;
  useEffect(() => {
    setListPage(0);
  }, [characterId, inspect]);
  useEffect(() => {
    if (focusedIndex >= 0) setListPage(Math.floor(focusedIndex / pageSize));
  }, [focusedIndex, pageSize]);
  return (
    <section
      ref={root}
      className="villages-wish-journal"
      aria-label={inspect ? "Inspect Wishes · private" : "Known wishes"}
    >
      <style>{WISH_JOURNAL_STYLES}</style>
      <div className="villages-wish-browser">
        {error ? <p role="alert">{error}</p> : null}
        <div className="villages-wish-layout" data-open={!!selected}>
          <div className="villages-wish-list">
            <h3>{inspect ? "All Wishes" : "Known Wishes"}</h3>
            {entries === null ? (
              <p role="status">Reading Wishes…</p>
            ) : !entries.length ? (
              <p>{inspect ? "No Wishes recorded." : "No Wishes known yet."}</p>
            ) : (
              <ul ref={list} style={{ gridAutoRows: Math.min(104, listHeight || 104) }}>
                {entries.slice(currentListPage * pageSize, (currentListPage + 1) * pageSize).map((entry) => (
                  <li key={entry.id}>
                    <button
                      type="button"
                      className="villages-wish-entry"
                      data-wish-summary={entry.id}
                      aria-label={`Open Wish: ${entry.title}`}
                      aria-pressed={selectedId === entry.id}
                      onClick={() => setSelection({ characterId, inspect, id: entry.id })}
                    >
                      <span className="villages-wish-entry-title">{entry.title}</span>
                      <span className="villages-wish-entry-arrow" aria-hidden="true">
                        ›
                      </span>
                      <span className="villages-wish-meta">
                        {entry.status ? <span className="villages-wish-status">{statuses[entry.status]}</span> : null}
                        {entry.known?.followed ? <span>Following</span> : null}
                        {timestamp(entry.at)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {entries?.length ? (
              <nav className="villages-wish-pagination" aria-label="Wish list pages">
                <button
                  type="button"
                  aria-label="Previous Wishes page"
                  disabled={currentListPage === 0}
                  onClick={() => setListPage(currentListPage - 1)}
                >
                  ←
                </button>
                <span role="status">
                  {currentListPage + 1} / {listPages}
                </span>
                <button
                  type="button"
                  aria-label="Next Wishes page"
                  disabled={currentListPage + 1 >= listPages}
                  onClick={() => setListPage(currentListPage + 1)}
                >
                  →
                </button>
              </nav>
            ) : null}
          </div>
          {selected ? (
            <WishDetail
              key={selected.id}
              entry={selected}
              prefix={prefix}
              busy={!!busy}
              onFollow={(wish) => void follow(wish)}
              onBack={() => {
                backFocus.current = selected.id;
                setSelection({ characterId, inspect, id: "" });
              }}
            />
          ) : entries?.length ? (
            <p className="villages-wish-placeholder">Select a Wish</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
