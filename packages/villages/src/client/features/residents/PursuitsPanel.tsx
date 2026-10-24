import { useEffect, useState } from "react";
import type { KnownPursuit, PursuitDecision, PursuitStatus } from "../../../shared/contracts/pursuits.js";
import { messageFrom } from "../../shared/api.js";
import { createVillagesClientId } from "../../shared/request-id.js";

const P = "marinara-capability-villages";
const statuses: Record<PursuitStatus, string> = {
  considering: "Considering",
  stalled: "On hold",
  arranged: "Moving",
  completed: "Settled",
  ended: "Ended",
};
const decisions: Record<PursuitDecision, string> = { agree: "Agrees", refuse: "Declined", conditional: "Conditional" };
type Request = <T>(path: string, options?: RequestInit) => Promise<T>;
type Inspection = {
  enabled: boolean;
  work: { status: string; error: string; requests: number } | null;
  residents: {
    characterId: string;
    name: string;
    revision?: number;
    reason?: string;
    nextReviewAt?: string;
    pursuits: {
      id: string;
      title: string;
      status: PursuitStatus;
      reason: string;
      sourceVenueId: string;
      targetVenueId: string;
      agreements: { characterId: string; name: string; decision: PursuitDecision }[];
    }[];
  }[];
  log: { id: string; actorId: string; outcome: string; reason: string; at: string; effectiveAt: string }[];
};
const date = (at: string) =>
  new Date(at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

function Progress({ status }: { status: PursuitStatus }) {
  if (status === "ended") return null;
  const current = status === "considering" ? 0 : status === "stalled" ? 1 : status === "arranged" ? 2 : 3;
  return (
    <ol className={`${P}-pursuit-progress`} aria-label="Pursuit progress">
      {["Considering", "Agreement", "Moving", "Settled"].map((label, index) => (
        <li
          key={label}
          data-state={index < current || status === "completed" ? "done" : index === current ? "current" : "future"}
          aria-current={index === current ? "step" : undefined}
        >
          <span aria-hidden="true">
            {index < current || status === "completed" ? "✓" : index === current && status === "stalled" ? "Ⅱ" : ""}
          </span>
          {label}
        </li>
      ))}
    </ol>
  );
}
function Agreements({ rows }: { rows: { characterId: string; name: string; decision: PursuitDecision }[] }) {
  return rows.length ? (
    <dl className={`${P}-pursuit-agreements`}>
      {rows.map((row) => (
        <div key={row.characterId}>
          <dt>{row.name}</dt>
          <dd data-decision={row.decision}>{decisions[row.decision]}</dd>
        </div>
      ))}
    </dl>
  ) : (
    <p>No agreements shared with you.</p>
  );
}

/** The normal view receives only frozen knowledge; private requests exist only while Inspect is mounted. */
export function PursuitsPanel({
  characterId,
  known,
  inspect,
  request,
}: {
  characterId: string;
  known: KnownPursuit[] | null;
  inspect: boolean;
  request: Request;
}) {
  const [selectedId, setSelectedId] = useState("");
  const selected = known?.find((row) => row.id === selectedId) ?? known?.[0];
  return (
    <>
      <section className={`${P}-dossier-sheet ${P}-pursuit-summary`} aria-label="Known pursuits">
        <h2>Pursuits</h2>
        {known === null ? (
          <p>Reading pursuits…</p>
        ) : !selected ? (
          <p>No pursuits shared with you.</p>
        ) : (
          <>
            {known.length > 1 ? (
              <label>
                Choose a Pursuit{" "}
                <select value={selected.id} onChange={(event) => setSelectedId(event.currentTarget.value)}>
                  {known.map((row) => (
                    <option key={row.id} value={row.id}>
                      {row.title ?? "Move"} · {statuses[row.status]}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <header className={`${P}-pursuit-heading`}>
              <h3>{selected.title ?? "Move"}</h3>
              <span className={`${P}-pursuit-status`} data-status={selected.status}>
                {statuses[selected.status]}
              </span>
            </header>
            <p>{selected.facts?.at(-1)?.text ?? selected.text}</p>
            <Progress status={selected.status} />
            <h3>Agreements</h3>
            <Agreements rows={selected.agreements ?? []} />
            <small>Last heard {date(selected.at)}</small>
          </>
        )}
      </section>
      {inspect ? (
        <PursuitInspection key={characterId} characterId={characterId} request={request} />
      ) : selected ? (
        <section className={`${P}-dossier-sheet ${P}-pursuit-history`} aria-label="What you heard">
          <h2>What you heard</h2>
          {selected.facts?.length ? (
            <ol>
              {selected.facts.map((fact, index) => (
                <li key={`${fact.sceneId}:${fact.at}:${index}`}>
                  <time dateTime={fact.at}>{date(fact.at)}</time>
                  <blockquote>{fact.text}</blockquote>
                </li>
              ))}
            </ol>
          ) : (
            <p>{selected.text}</p>
          )}
        </section>
      ) : null}
    </>
  );
}

function PursuitInspection({ characterId, request }: { characterId: string; request: Request }) {
  const [view, setView] = useState<Inspection | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    void request<Inspection>("/development", { signal: controller.signal })
      .then((answer) => {
        if (!controller.signal.aborted) {
          setView(answer);
          setError("");
        }
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setError(messageFrom(cause, "Pursuits could not be inspected."));
      })
      .finally(() => {
        if (!controller.signal.aborted) setBusy(false);
      });
    return () => controller.abort();
  }, [request, characterId, revision]);
  const resident = view?.residents.find((row) => row.characterId === characterId);
  // Mutations are explicit actions. Refresh and entering Inspect never purchase a review.
  async function act(path: string, body: unknown, method: "POST" | "PATCH") {
    setBusy(true);
    setError("");
    try {
      setView(await request<Inspection>(path, { method, body: JSON.stringify(body) }));
    } catch (cause) {
      setError(messageFrom(cause, "Pursuits could not be updated."));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className={`${P}-dossier-sheet ${P}-pursuit-inspection`} aria-label="Inspect pursuits · private">
      <h2>Inspect · private</h2>
      {error ? <p role="alert">{error}</p> : null}
      {!view ? (
        <p>Reading private state…</p>
      ) : (
        <>
          <h3>Current state</h3>
          {resident?.pursuits.length ? (
            resident.pursuits.map((pursuit) => (
              <article key={pursuit.id}>
                <h4>
                  {pursuit.title}{" "}
                  <span className={`${P}-pursuit-status`} data-status={pursuit.status}>
                    {statuses[pursuit.status]}
                  </span>
                </h4>
                <p>{pursuit.reason}</p>
                {pursuit.agreements?.length ? <Agreements rows={pursuit.agreements} /> : null}
                <details>
                  <summary>IDs &amp; locations</summary>
                  <dl>
                    <dt>Pursuit</dt>
                    <dd>{pursuit.id}</dd>
                    <dt>From</dt>
                    <dd>{pursuit.sourceVenueId}</dd>
                    <dt>To</dt>
                    <dd>{pursuit.targetVenueId}</dd>
                  </dl>
                </details>
              </article>
            ))
          ) : (
            <p>No current pursuits.</p>
          )}
          <h3>Review</h3>
          <p>{resident?.reason ?? "No review scheduled."}</p>
          <dl className={`${P}-pursuit-review`}>
            <div>
              <dt>Next eligible</dt>
              <dd>{resident?.nextReviewAt ? date(resident.nextReviewAt) : "Not scheduled"}</dd>
            </div>
            <div>
              <dt>Resident revision</dt>
              <dd>{resident?.revision ?? 0}</dd>
            </div>
            {view.work ? (
              <div>
                <dt>Village review</dt>
                <dd>
                  {view.work.status} · {view.work.requests} requests
                </dd>
              </div>
            ) : null}
          </dl>
          {view.work?.error ? <p role="status">{view.work.error}</p> : null}
          <h3>How it runs</h3>
          <ol className={`${P}-pursuit-machinery`}>
            {["Saved intention", "Review when due", "Rules + consent", "Save decision"].map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <details>
            <summary>Decision history</summary>
            <ol className={`${P}-pursuit-decisions`}>
              {view.log
                .filter((row) => row.actorId === characterId)
                .map((row) => (
                  <li key={row.id}>
                    <strong>{row.outcome}</strong>
                    <p>{row.reason}</p>
                    <small>
                      Effective {date(row.effectiveAt)} · Saved {date(row.at)}
                    </small>
                  </li>
                ))}
            </ol>
          </details>
          <details>
            <summary>Village controls</summary>
            <label>
              <input
                type="checkbox"
                checked={view.enabled}
                disabled={busy}
                onChange={(event) => void act("/development", { enabled: event.currentTarget.checked }, "PATCH")}
              />{" "}
              Enable Pursuits
            </label>
            {view.enabled ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void act("/development/review", { actionId: createVillagesClientId() }, "POST")}
              >
                Review village pursuits
              </button>
            ) : null}
          </details>
        </>
      )}
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          setBusy(true);
          setRevision((value) => value + 1);
        }}
      >
        Refresh
      </button>
    </section>
  );
}
