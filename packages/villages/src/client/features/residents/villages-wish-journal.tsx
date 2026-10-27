import { useEffect, useRef, useState } from "react";
import type { KnownWish, SocialWish } from "../../../shared/contracts/wishes.js";
import { useVillageActivity } from "../../shared/activity.js";
export type { KnownWish } from "../../../shared/contracts/wishes.js";
type View = { profiles: { characterId: string; knownWishes?: KnownWish[] }[] };
type Request = <T>(path: string, options?: RequestInit) => Promise<T>;
const timestamp = (at: string) => (
  <time dateTime={at}>{new Date(at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</time>
);
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
  const [privateWishes, setPrivate] = useState<SocialWish[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!visible || suppliedWishes !== undefined) return;
    const controller = new AbortController();
    setWishes(null);
    void request<View>("/relationships", { signal: controller.signal })
      .then((view) => {
        if (!controller.signal.aborted)
          setWishes(view.profiles.find((p) => p.characterId === characterId)?.knownWishes ?? []);
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setError(String(cause));
      });
    return () => controller.abort();
  }, [request, characterId, suppliedWishes, visible, backgroundRevision]);
  useEffect(() => {
    if (!inspect || !visible) {
      setPrivate(null);
      return;
    }
    const controller = new AbortController();
    void request<{ wishes: SocialWish[] }>(`/villagers/${encodeURIComponent(characterId)}/wishes/inspect`, {
      signal: controller.signal,
    })
      .then((view) => {
        if (!controller.signal.aborted) setPrivate(view.wishes);
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setError(String(cause));
      });
    return () => controller.abort();
  }, [inspect, visible, characterId, request, backgroundRevision]);
  useEffect(() => {
    const target = [...(root.current?.querySelectorAll<HTMLElement>("[data-wish-id]") ?? [])].find(
      (el) => el.dataset.wishId === focusWishId,
    );
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ block: "nearest" });
  }, [focusWishId, wishes]);
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
  return (
    <section ref={root} className="villages-wish-journal" aria-label="Known wishes">
      <style>{`.villages-wish-journal{min-width:0;display:grid;gap:1rem}.villages-wish-journal article{border-top:1px solid var(--border);padding:.8rem 0;overflow-wrap:anywhere}.villages-wish-journal h3{margin:.25rem 0}.villages-wish-journal ul{list-style:none;padding:0}.villages-wish-journal li{margin:.8rem 0;line-height:1.5}.villages-wish-journal time{display:block;font-size:.8em;color:var(--muted-foreground)}.villages-wish-journal button{min-height:44px}.villages-wish-journal [tabindex]:focus-visible{outline:2px solid var(--primary);outline-offset:3px}`}</style>
      {error ? <p role="alert">{error}</p> : null}
      {wishes === null ? (
        <p role="status">Reading Wishes…</p>
      ) : !wishes.length ? (
        <p>No Wishes shared yet.</p>
      ) : (
        wishes.map((wish) => (
          <article key={wish.wishId} data-wish-id={wish.wishId} tabIndex={-1}>
            <h3>{wish.text}</h3>
            {timestamp(wish.at)}
            {wish.status && wish.status !== "open" ? <p>{wish.status}</p> : null}
            <ul>
              {wish.facts.map((fact) => (
                <li key={fact.id}>
                  <span>{fact.text}</span>
                  {timestamp(fact.at)}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className={`${prefix}-button`}
              aria-pressed={wish.followed}
              disabled={!!busy}
              onClick={() => void follow(wish)}
            >
              {wish.followed ? "Following" : "Follow"}
            </button>
          </article>
        ))
      )}
      {inspect ? (
        <section aria-label="Inspect Wishes · private">
          <h3>Inspect</h3>
          {privateWishes === null ? (
            <p role="status">Reading…</p>
          ) : privateWishes.length ? (
            privateWishes.map((wish) => (
              <article key={wish.id}>
                <h4>{wish.wish}</h4>
                <p>{wish.reason}</p>
                <p>
                  {wish.status} · {wish.attention.state}
                </p>
                <p>{wish.attention.reason}</p>
                {wish.approach ? <p>{wish.approach}</p> : null}
                {timestamp(wish.addedAt)}
                {wish.conditions.map((c) => (
                  <p key={c.id}>
                    {c.quote}
                    {timestamp(c.at)}
                  </p>
                ))}
              </article>
            ))
          ) : (
            <p>No retained Wishes.</p>
          )}
        </section>
      ) : null}
    </section>
  );
}
