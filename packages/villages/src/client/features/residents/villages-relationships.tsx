import { useEffect, useState } from "react";
import type { RelationshipInspectView, RelationshipView } from "../../../shared/contracts/relationships.js";
export type { RelationshipProfile, RelationshipView } from "../../../shared/contracts/relationships.js";
type Request = <T>(path: string, options?: RequestInit) => Promise<T>;
const date = (at: string) => (at ? new Date(at).toLocaleString() : "");
export function VillagesRelationships({
  request,
  prefix,
  onVenue,
  characterId,
  inspect = false,
  view: suppliedView,
}: {
  request: Request;
  prefix: string;
  onVenue: (id: string) => void;
  characterId?: string;
  inspect?: boolean;
  view?: RelationshipView | null;
  onView?: (view: RelationshipView) => void;
}) {
  const [localView, setLocalView] = useState<RelationshipView | null>(null);
  const [debug, setDebug] = useState<RelationshipInspectView | null>(null);
  const [error, setError] = useState("");
  const [clarifications, setClarifications] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    const refresh = () => {
      const pending: Promise<unknown>[] = [];
      if (suppliedView === undefined)
        pending.push(request<RelationshipView>("/relationships", { signal: controller.signal }).then(setLocalView));
      if (inspect)
        pending.push(
          request<RelationshipInspectView>("/relationships/inspect", { signal: controller.signal }).then(setDebug),
        );
      void Promise.all(pending)
        .then(() => {
          if (!controller.signal.aborted) setError("");
        })
        .catch((cause) => {
          if (!controller.signal.aborted)
            setError(cause instanceof Error ? cause.message : "Relationships could not be read.");
        });
    };
    if (!inspect) setDebug(null);
    refresh();
    const timer = window.setInterval(refresh, 30000);
    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, [request, suppliedView, inspect]);
  const view = suppliedView === undefined ? localView : suppliedView;
  return (
    <section className={prefix + "-overlay villages-relationships"} aria-label="Relationships">
      <style>{`
      .villages-relationships {display:grid;gap:1rem;min-width:0}
      .villages-relationships article {padding:1rem;border:1px solid #65708966;border-radius:.7rem;min-width:0;overflow-wrap:anywhere}
      .villages-relationships h3,.villages-relationships h4 {margin:.4rem 0}
      .villages-relationships p {white-space:pre-wrap;line-height:1.5}
      .villages-relationships blockquote {margin:.5rem 0;padding-left:.75rem;border-left:2px solid #8c90b0}
      .villages-relationships details {margin:.75rem 0}
      .villages-relationships summary {cursor:pointer}
      .villages-relationships pre {white-space:pre-wrap;font-size:.8rem}
    `}</style>
      {error ? <p role="alert">{error}</p> : null}
      {view?.starting.pending ? <p role="status">Starting history needs preparation.</p> : null}
      {!view ? (
        <p role="status">Reading relationships…</p>
      ) : (
        view.profiles
          .filter((person) => !characterId || person.characterId === characterId)
          .map((person) => (
            <article key={person.characterId}>
              <h3>{person.name}</h3>
              <p>{person.summary || "No relationship has been expressed yet."}</p>
              {person.learned.map((entry, index) => (
                <p key={index}>
                  <strong>{entry.kind === "history" ? "Known history" : person.name + " shared"}:</strong> {entry.text}
                  <small> · {date(entry.at)}</small>
                </p>
              ))}
              {person.access.map((access) => (
                <button key={access.venueId + access.zoneId} type="button" onClick={() => onVenue(access.venueId)}>
                  {access.name} · {access.active ? "Standing invitation" : "Unavailable"}
                </button>
              ))}
            </article>
          ))
      )}
      {inspect ? (
        <section aria-label="Relationship inspection">
          <h3>Inspect relationships</h3>
          {!debug ? (
            <p role="status">Reading saved social state…</p>
          ) : (
            <>
              {debug.processing?.length ? (
                <section aria-label="Social processing">
                  <h4>Processing</h4>
                  {debug.processing.map((work, index) => (
                    <p key={index}>
                      <strong>{work.label}:</strong> {work.status}
                      {work.message ? <> · {work.message}</> : null}
                      <small>
                        {" "}
                        · {work.requests} requests
                        {work.tokens !== null ? " · " + work.tokens.toLocaleString() + " tokens" : ""}
                      </small>
                    </p>
                  ))}
                </section>
              ) : null}
              {debug.conflicts.map((conflict, index) => (
                <article key={index}>
                  <h4>History needs clarification</h4>
                  <p>{conflict.question}</p>
                  <p>{conflict.residents.join(", ")}</p>
                  <form
                    onSubmit={async (event) => {
                      event.preventDefault();
                      setSaving(true);
                      setError("");
                      try {
                        setDebug(
                          await request<RelationshipInspectView>("/relationships/clarifications", {
                            method: "POST",
                            body: JSON.stringify({
                              sourceHash: conflict.sourceHash,
                              actorIds: conflict.actorIds,
                              text: clarifications[index] ?? "",
                            }),
                          }),
                        );
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
                        maxLength={4000}
                        value={clarifications[index] ?? ""}
                        onChange={(event) =>
                          setClarifications((current) => ({ ...current, [index]: event.target.value }))
                        }
                      />
                    </label>
                    <button type="submit" disabled={saving || !clarifications[index]?.trim()}>
                      Use this history
                    </button>
                  </form>
                  <details>
                    <summary>Source details</summary>
                    <pre>{conflict.sourceIds.join("\n")}</pre>
                  </details>
                </article>
              ))}
              {debug.residents
                .filter((person) => !characterId || person.characterId === characterId)
                .map((person) => (
                  <article key={person.characterId}>
                    <h4>
                      {person.name} · {person.initialized ? "History prepared" : "History pending"}
                    </h4>
                    {person.intentions.length ? (
                      <>
                        <h4>Social intentions</h4>
                        {person.intentions.map((intention, index) => (
                          <div key={index}>
                            <p>
                              {intention.text} · {intention.status}
                            </p>
                            <p>{intention.reason}</p>
                            <small>{intention.targets.join(", ")}</small>
                          </div>
                        ))}
                      </>
                    ) : (
                      <p>No saved social intention.</p>
                    )}
                    {person.perspectives.map((perspective, index) => (
                      <details key={index} open={perspective.technical.toId === "player" || undefined}>
                        <summary>
                          About {perspective.aboutName} · {perspective.connection || "Unestablished"}
                        </summary>
                        <p>{perspective.stance || "No private stance recorded."}</p>
                        {perspective.expectations.length ? (
                          <>
                            <h4>Expectations</h4>
                            <ul>
                              {perspective.expectations.map((text, i) => (
                                <li key={i}>{text}</li>
                              ))}
                            </ul>
                          </>
                        ) : null}
                        {perspective.concerns.length ? (
                          <>
                            <h4>Unresolved concerns</h4>
                            <ul>
                              {perspective.concerns.map((text, i) => (
                                <li key={i}>{text}</li>
                              ))}
                            </ul>
                          </>
                        ) : null}
                        {perspective.records.map((record, i) => (
                          <p key={i}>
                            <strong>
                              {record.kind} · {record.status}:
                            </strong>{" "}
                            {record.text}
                            {record.currentStatus && record.currentStatus !== record.status ? (
                              <small> · Current shared terms: {record.currentStatus}</small>
                            ) : null}
                            {record.dueAt ? <> · Due {date(record.dueAt)}</> : null}
                          </p>
                        ))}
                        <h4>Defining experiences</h4>
                        {perspective.experiences.map((experience, i) => (
                          <details key={i}>
                            <summary>
                              {experience.reason} · {date(experience.at)}
                            </summary>
                            {experience.evidence.map((evidence, j) => (
                              <blockquote key={j}>
                                <strong>{evidence.speaker}:</strong> {evidence.text}
                              </blockquote>
                            ))}
                            <details>
                              <summary>Source ID</summary>
                              <pre>{experience.sourceId}</pre>
                            </details>
                          </details>
                        ))}
                        <small>
                          Updated {date(perspective.updatedAt)} · Revision {perspective.revision}
                        </small>
                        <details>
                          <summary>Technical details</summary>
                          <pre>{JSON.stringify(perspective.technical, null, 2)}</pre>
                        </details>
                      </details>
                    ))}
                  </article>
                ))}
            </>
          )}
        </section>
      ) : null}
    </section>
  );
}
