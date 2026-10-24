import { ELEMENT_TAG } from "../../shared/constants.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import { useEffect, useState } from "react";
import { messageFrom, request } from "../../shared/api.js";
type DevelopmentView = {
  work?: { status: string; error: string; requests: number } | null;
  enabled: boolean;
  activatedAt: string | null;
  residents: {
    characterId: string;
    name: string;
    nextReviewAt?: string;
    reason?: string;
    pursuits?: { id: string; status: string; reason: string }[];
  }[];
  log: { id: string; actorId: string; outcome: string; reason: string; at: string; effectiveAt: string }[];
};
export function DevelopmentControls() {
  const [view, setView] = useState<DevelopmentView | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    void request<DevelopmentView>("/development", { signal: controller.signal })
      .then(setView)
      .catch((cause) => {
        if (!controller.signal.aborted) setError(messageFrom(cause, "Development could not be read."));
      });
    return () => controller.abort();
  }, []);
  async function act(path: string, body?: unknown, method: "GET" | "POST" | "PATCH" = body ? "PATCH" : "POST") {
    setBusy(true);
    setError("");
    try {
      setView(
        await request(path, {
          method,
          body: method === "GET" ? undefined : JSON.stringify(body ?? { actionId: createVillagesClientId() }),
        }),
      );
    } catch (cause) {
      setError(messageFrom(cause, "Development could not be updated."));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section aria-label="Resident development">
      <h2>Resident development</h2>
      <label>
        <input
          autoComplete="off"
          type="checkbox"
          checked={view?.enabled ?? false}
          disabled={!view || busy}
          onChange={(event) => void act("/development", { enabled: event.currentTarget.checked })}
        />{" "}
        Enable prototype
      </label>
      {view?.enabled ? (
        <>
          <p>Reviews begin after one day. Moves need consent and take 24 hours.</p>
          <button
            className={ELEMENT_TAG + "-button"}
            type="button"
            disabled={busy}
            onClick={() => void act("/development/review")}
          >
            Review due intentions
          </button>
        </>
      ) : null}
      <button
        className={ELEMENT_TAG + "-button"}
        type="button"
        disabled={busy}
        onClick={() => void act("/development", undefined, "GET")}
      >
        Refresh
      </button>
      {view?.work ? (
        <p role="status">
          Review: {view.work.status}
          {view.work.error ? ` · ${view.work.error}` : ""}
        </p>
      ) : null}
      {error ? <p role="alert">{error}</p> : null}
      {view?.activatedAt ? (
        <details>
          <summary>Inspect development · private</summary>
          {view.residents.map((r) => (
            <article key={r.characterId}>
              <h3>{r.name}</h3>
              <p>{r.reason ?? "No review scheduled."}</p>
              {r.nextReviewAt ? <p>Next review: {new Date(r.nextReviewAt).toLocaleString()}</p> : null}
              {(r.pursuits ?? []).map((p) => (
                <p key={p.id}>
                  {p.status} · {p.reason}
                </p>
              ))}
            </article>
          ))}
          <h3>Recent decisions</h3>
          <ol>
            {view.log.map((row) => (
              <li key={row.id}>
                <strong>
                  {view.residents.find((r) => r.characterId === row.actorId)?.name ?? row.actorId} · {row.outcome}
                </strong>{" "}
                · {row.reason}
                <br />
                <small>
                  Effective {new Date(row.effectiveAt).toLocaleString()} · Saved {new Date(row.at).toLocaleString()}
                </small>
              </li>
            ))}
          </ol>
        </details>
      ) : null}
    </section>
  );
}
