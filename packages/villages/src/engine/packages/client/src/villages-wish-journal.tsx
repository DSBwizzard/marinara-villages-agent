import { useEffect, useRef, useState } from "react";

export type KnownWish = {
  wishId: string;
  text: string;
  learnedAt: string;
  status?: "active" | "fulfilled" | "expired" | "retired";
  facts?: {
    id: string;
    kind: string;
    quote: string;
    at: string;
    sceneId: string;
    lineIds: string[];
    supersededBy?: string;
  }[];
};
type View = { profiles: { characterId: string; knownWishes?: KnownWish[] }[] };
type Request = <T>(path: string, options?: RequestInit) => Promise<T>;
/** Player-known information only; opening or refreshing this view never generates prose. */
export function VillagerWishJournal({
  request,
  characterId,
  prefix,
  focusWishId = "",
  wishes: suppliedWishes,
  onWishes,
}: {
  request: Request;
  characterId: string;
  prefix: string;
  focusWishId?: string;
  wishes?: KnownWish[] | null;
  onWishes?: (wishes: KnownWish[]) => void;
}) {
  const [localWishes, setWishes] = useState<KnownWish[] | null>(null);
  const wishes = suppliedWishes === undefined ? localWishes : suppliedWishes;
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    if (suppliedWishes !== undefined) return;
    const controller = new AbortController();
    const refresh = () =>
      void request<View>("/relationships", { signal: controller.signal })
        .then((view) => {
          if (!controller.signal.aborted) {
            setWishes(view.profiles?.find((profile) => profile.characterId === characterId)?.knownWishes ?? []);
            setError("");
          }
        })
        .catch((cause) => {
          if (!controller.signal.aborted)
            setError(cause instanceof Error ? cause.message : "Wishes could not be read.");
        });
    setWishes(null);
    refresh();
    const timer = window.setInterval(refresh, 30_000);
    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, [request, characterId, suppliedWishes]);
  useEffect(() => {
    if (!focusWishId || !wishes) return;
    const target = [...(root.current?.querySelectorAll<HTMLElement>("[data-wish-id]") ?? [])].find(
      (element) => element.dataset.wishId === focusWishId,
    );
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ block: "nearest" });
  }, [focusWishId, wishes]);
  const retire = async (wishId: string) => {
    setBusy(wishId);
    setError("");
    try {
      const view = await request<View>(
        `/villagers/${encodeURIComponent(characterId)}/wishes/${encodeURIComponent(wishId)}/retire`,
        { method: "POST" },
      );
      const next = view.profiles.find((profile) => profile.characterId === characterId)?.knownWishes ?? [];
      setWishes(next);
      onWishes?.(next);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "That wish could not be retired.");
    } finally {
      setBusy("");
    }
  };
  return (
    <section ref={root} className="villages-wish-journal" aria-label="Known wishes">
      <style>{`.villages-wish-journal{min-width:0;display:grid;gap:.75rem}.villages-wish-journal article{border-top:1px solid var(--border);padding:.75rem 0;overflow-wrap:anywhere}.villages-wish-journal h3{margin:.25rem 0}.villages-wish-journal ul{list-style:none;padding:0}.villages-wish-journal li{margin:.6rem 0;line-height:1.5}.villages-wish-journal small{color:var(--muted-foreground)}.villages-wish-journal button{min-height:44px}.villages-wish-journal [tabindex]:focus-visible{outline:2px solid var(--primary);outline-offset:3px}`}</style>
      <h3>Known wishes</h3>
      {error ? <p role="alert">{error}</p> : null}
      {wishes === null ? (
        <p role="status">Reading known wishes…</p>
      ) : !wishes.length ? (
        <p>No wishes shared yet.</p>
      ) : (
        wishes.map((wish) => (
          <article key={wish.wishId} data-wish-id={wish.wishId} tabIndex={-1}>
            <p>
              <strong>{wish.text}</strong>
            </p>
            <small>{wish.status ?? "active"}</small>
            <h4>What you’ve learned</h4>
            <p>
              <small>✓ means learned or observed.</small>
            </p>
            <ul aria-label="Learned facts">
              <li>
                <span aria-hidden="true">✓ </span>
                {wish.text} <small>· shared</small>
              </li>
              {(wish.facts ?? [])
                .filter((fact) => !fact.supersededBy)
                .map((fact) => (
                  <li key={fact.id}>
                    <span aria-hidden="true">✓ </span>
                    <span>{fact.quote}</span>{" "}
                    <small>
                      · {fact.kind === "condition" ? "Explicit condition" : fact.kind} ·{" "}
                      {new Date(fact.at).toLocaleDateString()}
                    </small>
                  </li>
                ))}
            </ul>
            {(wish.facts ?? []).some((fact) => fact.supersededBy) ? (
              <details>
                <summary>Earlier information</summary>
                <ul>
                  {wish
                    .facts!.filter((fact) => fact.supersededBy)
                    .map((fact) => (
                      <li key={fact.id}>
                        <span>{fact.quote}</span> <small>· superseded</small>
                      </li>
                    ))}
                </ul>
              </details>
            ) : null}
            {!wish.status || wish.status === "active" ? (
              <button
                type="button"
                className={`${prefix}-button`}
                disabled={!!busy}
                onClick={() => void retire(wish.wishId)}
              >
                Retire wish
              </button>
            ) : null}
          </article>
        ))
      )}
    </section>
  );
}
