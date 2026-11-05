import { HistoryClarifications } from "../../shared/HistoryClarifications.js";
import { useVillageActivity } from "../../shared/activity.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { RelationshipBond } from "./RelationshipBond.js";
import type { RelationshipInspectView, RelationshipView } from "../../../shared/contracts/relationships.js";
export type { RelationshipProfile, RelationshipView } from "../../../shared/contracts/relationships.js";
type Request = <T>(path: string, options?: RequestInit) => Promise<T>;
const date = (at: string) => (at ? new Date(at).toLocaleString() : "");
export function VillagesRelationships({
  request,
  prefix,
  onVenue,
  characterId,
  portrait,
  inspect = false,
  view: suppliedView,
}: {
  request: Request;
  prefix: string;
  onVenue: (id: string) => void;
  characterId?: string;
  portrait?: ReactNode;
  inspect?: boolean;
  view?: RelationshipView | null;
  onView?: (view: RelationshipView) => void;
}) {
  const { visible, backgroundRevision } = useVillageActivity();
  const [localView, setLocalView] = useState<RelationshipView | null>(null);
  const [debug, setDebug] = useState<RelationshipInspectView | null>(null);
  const [error, setError] = useState("");
  const recoveryIdentity = useRef<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!visible) return;
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
    return () => controller.abort();
  }, [request, suppliedView, inspect, visible, backgroundRevision]);
  async function recoverEncounter(row: NonNullable<RelationshipInspectView["recovery"]>[number], skip = false) {
    const key = row.id + ":" + row.reinterpretRequired + ":" + skip;
    recoveryIdentity.current[key] ??= createVillagesClientId();
    setSaving(true);
    setError("");
    try {
      setDebug(
        await request<RelationshipInspectView>("/relationships/outbox/" + encodeURIComponent(row.id) + "/recovery", {
          method: "POST",
          body: JSON.stringify({
            requestId: recoveryIdentity.current[key],
            reinterpret: row.reinterpretRequired,
            skip,
          }),
        }),
      );
      delete recoveryIdentity.current[key];
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Recovery failed.");
    } finally {
      setSaving(false);
    }
  }
  const view = suppliedView === undefined ? localView : suppliedView;
  return (
    <section className={prefix + "-overlay villages-relationships"} aria-label="Relationships">
      <style>{`
      .villages-relationships {display:grid;gap:1rem;min-width:0}
      .villages-relationships article {padding:1rem;border:1px solid #65708966;border-radius:.7rem;min-width:0;overflow-wrap:anywhere}
      .villages-relationships h3,.villages-relationships h4 {margin:.4rem 0}
      .villages-relationships p {white-space:pre-wrap;line-height:1.5}
      .villages-relationships blockquote {margin:.5rem 0;padding-left:.75rem;border-left:2px solid #8c90b0}
      .villages-relationships pre {white-space:pre-wrap;font-size:.8rem}
      .villages-relationship-bond header {display:flex;align-items:center;justify-content:space-between;gap:1rem}
      .villages-relationship-bond .villages-relationship-caption {text-align:center;font-size:.85em;opacity:.8;margin:1.5rem 0 .6rem}
      .villages-relationship-visual {display:flex;align-items:center;gap:1rem;min-width:0;padding:1rem 0;color:#967536}
      .villages-relationship-person {display:grid;justify-items:center;gap:.6rem;width:5rem;flex-shrink:0;color:var(--foreground);text-align:center;overflow-wrap:anywhere}
      .villages-relationship-person > span[aria-hidden] {display:grid;place-items:center;position:relative;width:4rem;height:4.8rem;overflow:hidden;flex-shrink:0;border:1px solid #b39a6b66;border-radius:.2rem;background:#fff7e8;font-size:2rem;box-shadow:1px 2px 4px #49301822;transform:rotate(-4deg)}
      .villages-relationship-person:last-child > span[aria-hidden] {transform:rotate(4deg)}
      .villages-relationship-person img {width:100%;height:100%;object-fit:cover}
      .villages-relationship-person svg {width:2rem;height:2rem}
      .villages-relationship-connection {flex:1;min-width:0;text-align:center;align-self:stretch;display:flex;flex-direction:column;justify-content:center;padding-bottom:1.5rem}
      .villages-relationship-connection .villages-relationship-label {font-size:1.3em;color:var(--foreground);margin:0 0 1rem;overflow-wrap:anywhere}
      .villages-relationship-thread {position:relative;display:flex;align-items:center;justify-content:center;min-height:2rem}
      .villages-relationship-thread > span {position:absolute;inset:auto 0;height:6px;border-top:2px solid currentColor;border-bottom:2px solid currentColor;transform:rotate(-1deg)}
      .villages-relationship-thread::after {content:"";position:absolute;right:-1px;border-top:5px solid transparent;border-bottom:5px solid transparent;border-left:8px solid currentColor}
      .villages-relationship-thread b {display:grid;place-items:center;position:relative;width:2rem;height:2rem;border:1px solid #a65d2d;border-radius:50%;background:var(--dossier-paper,var(--background));color:#a65d2d;font:500 1rem/1 sans-serif}
      .villages-relationship-connection .villages-relationship-condition {color:var(--foreground);margin:.8rem 0 0}
      .villages-relationship-visual[data-tone=tentative] .villages-relationship-thread > span {height:2px;border-bottom:0;border-top-style:dashed}
      .villages-relationship-visual[data-tone=unknown] {color:var(--muted-foreground)}
      .villages-relationship-visual[data-tone=unknown] .villages-relationship-thread > span {height:2px;border-bottom:0;border-top-style:dotted}
      .villages-relationship-visual[data-tone=unknown] .villages-relationship-thread::after {display:none}
      .villages-relationship-unknown {font-size:.9em;text-align:center}
      .villages-relationship-history ol {list-style:none;padding:0}
      .villages-relationship-history li {padding:.8rem 0;border-bottom:1px solid var(--dossier-line,var(--border))}
      .villages-relationship-history small,.villages-relationship-history time,.villages-relationship-access small {display:block}
      .villages-relationship-access {display:flex;flex-wrap:wrap;gap:.6rem;margin-top:1rem}
      @media(max-width:500px){.villages-relationship-visual{gap:.5rem}.villages-relationship-person{width:3rem;font-size:.85em}.villages-relationship-person>span[aria-hidden]{width:2.8rem;height:3.5rem}.villages-relationship-connection .villages-relationship-label{font-size:1.1em}.villages-relationships article{padding:.6rem}}
    `}</style>
      {error ? <p role="alert">{error}</p> : null}
      {view?.starting.pending ? (
        <p role="status">Starting history is not ready. Check preparation in Inspect → Relationships.</p>
      ) : null}
      {!view ? (
        <p role="status">Reading relationships…</p>
      ) : (
        view.profiles
          .filter((person) => !characterId || person.characterId === characterId)
          .map((person) => (
            <RelationshipBond key={person.characterId} person={person} portrait={portrait} onVenue={onVenue} />
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
                      {work.message ? <span>{work.message}</span> : null}
                      <small>
                        {" "}
                        {work.requests} requests
                        {work.tokens !== null ? " / " + work.tokens.toLocaleString() + " tokens" : ""}
                      </small>
                      {["failed", "interrupted", "paused"].includes(work.status) ? (
                        <button
                          type="button"
                          disabled={saving}
                          onClick={async () => {
                            const key = work.instanceId + ":" + work.attempt;
                            recoveryIdentity.current[key] ??= createVillagesClientId();
                            setSaving(true);
                            setError("");
                            try {
                              await request("/background/retry", {
                                method: "POST",
                                body: JSON.stringify({
                                  id: work.id,
                                  expectedAttempt: work.attempt,
                                  expectedInstanceId: work.instanceId,
                                  actionId: recoveryIdentity.current[key],
                                }),
                              });
                              delete recoveryIdentity.current[key];
                              setDebug(await request<RelationshipInspectView>("/relationships/inspect"));
                            } catch (cause) {
                              setError(cause instanceof Error ? cause.message : "Preparation retry failed.");
                            } finally {
                              setSaving(false);
                            }
                          }}
                        >
                          Retry unfinished work
                        </button>
                      ) : null}
                    </p>
                  ))}
                </section>
              ) : null}
              {debug.recovery?.map((row) => (
                <article key={row.id}>
                  <h4>Encounter needs recovery</h4>
                  <p>{row.message}</p>
                  <button type="button" disabled={saving} onClick={() => void recoverEncounter(row)}>
                    {row.reinterpretRequired ? "Reinterpret saved encounter" : "Replay delivery"}
                  </button>
                  {row.canSkip ? (
                    <button type="button" disabled={saving} onClick={() => void recoverEncounter(row, true)}>
                      Skip encounter
                    </button>
                  ) : null}
                  <section>
                    <h4>Source</h4>
                    <code>{row.id}</code>
                  </section>
                </article>
              ))}
              <HistoryClarifications
                conflicts={debug.conflicts}
                disabled={
                  saving ||
                  debug.processing?.some(
                    (work) => work.kind === "starting-ties" && ["queued", "running"].includes(work.status),
                  )
                }
                onSubmit={async (conflict, text) => {
                  setDebug(
                    await request<RelationshipInspectView>("/relationships/clarifications", {
                      method: "POST",
                      body: JSON.stringify({ sourceHash: conflict.sourceHash, actorIds: conflict.actorIds, text }),
                    }),
                  );
                }}
              />
              {debug.residents
                .filter((person) => !characterId || person.characterId === characterId)
                .map((person) => (
                  <article key={person.characterId}>
                    <h4>
                      {person.name}
                      <small>{person.initialized ? "History prepared" : "History pending"}</small>
                    </h4>
                    {person.intentions.length ? (
                      <>
                        <h4>Social intentions</h4>
                        {person.intentions.map((intention, index) => (
                          <div key={index}>
                            <p>
                              {intention.text}
                              <small>{intention.status}</small>
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
                      <section key={index}>
                        <h4>
                          About {perspective.aboutName}
                          <small>{perspective.connection || "Unestablished"}</small>
                        </h4>
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
                              {record.kind}: {record.status}
                            </strong>{" "}
                            {record.text}
                            {record.currentStatus && record.currentStatus !== record.status ? (
                              <small>Current shared terms: {record.currentStatus}</small>
                            ) : null}
                            {record.dueAt ? <small>Due {date(record.dueAt)}</small> : null}
                          </p>
                        ))}
                        <h4>Defining experiences</h4>
                        {perspective.experiences.map((experience, i) => (
                          <section key={i}>
                            <h4>
                              {experience.reason}
                              <small>{date(experience.at)}</small>
                            </h4>
                            {experience.evidence.map((evidence, j) => (
                              <blockquote key={j}>
                                <strong>{evidence.speaker}:</strong> {evidence.text}
                              </blockquote>
                            ))}
                            <section>
                              <h4>Source ID</h4>
                              <pre>{experience.sourceId}</pre>
                            </section>
                          </section>
                        ))}
                        <small>
                          Updated {date(perspective.updatedAt)}
                          <span>Revision {perspective.revision}</span>
                        </small>
                        <section>
                          <h4>Technical details</h4>
                          <pre>{JSON.stringify(perspective.technical, null, 2)}</pre>
                        </section>
                      </section>
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
