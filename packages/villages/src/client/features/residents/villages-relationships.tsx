import { HistoryClarifications } from "../../shared/HistoryClarifications.js";
import { useVillageActivity } from "../../shared/activity.js";
import { invalidatesRead } from "../../shared/api.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import { useEffect, useRef, useState } from "react";
import type {
  RelationshipEntry,
  RelationshipInspectView,
  RelationshipScore,
  RelationshipView,
} from "../../../shared/contracts/relationships.js";
export type { RelationshipProfile, RelationshipView } from "../../../shared/contracts/relationships.js";
type Request = <T>(path: string, options?: RequestInit) => Promise<T>;
const date = (at: string) => (at ? new Date(at).toLocaleString() : "");

export function RelationshipEntries({
  entries,
  empty = "Nothing shared yet.",
}: {
  entries: (RelationshipEntry & {
    support?: RelationshipInspectView["residents"][number]["entries"][number]["support"];
  })[];
  empty?: string;
}) {
  return entries.length ? (
    <div className="villages-relationship-entries">
      <style>{`
    .villages-relationship-entries {display:grid;gap:1rem;min-width:0}
    .villages-relationship-entries article {padding:1rem;border:1px solid #65708966;border-radius:.7rem;min-width:0;overflow-wrap:anywhere}
    .villages-relationship-entries p,.villages-relationship-entries blockquote {white-space:pre-wrap;line-height:1.5}
    .villages-relationship-entry-label {text-transform:capitalize}
  `}</style>
      {entries.map((entry) => (
        <article key={entry.id}>
          {entry.facet || entry.kind !== "perspective" ? (
            <strong className="villages-relationship-entry-label">
              {(entry.facet ?? entry.kind).replaceAll("-", " ")}
            </strong>
          ) : null}
          {entry.forgotten ? (
            <small> · Forgotten</small>
          ) : entry.playerCorrection ? (
            <small> · Player correction</small>
          ) : null}
          <p>{entry.text}</p>
          {entry.subjects.length ? <p>About {entry.subjects.map((person) => person.name).join(", ")}</p> : null}
          {entry.offer ? (
            <p>
              {entry.offer.state} · {entry.offer.participants.map((person) => person.name).join(", ")}
            </p>
          ) : null}
          <small>
            {[entry.owner?.name, entry.closed ?? (entry.current ? "Current" : ""), date(entry.occurredAt)]
              .filter(Boolean)
              .join(" · ")}
          </small>
          {entry.support?.length ? (
            <details>
              <summary>Sources</summary>
              {entry.support.map((source) => (
                <blockquote key={source.id}>
                  {source.speaker ? <strong>{source.speaker.name}: </strong> : null}
                  {source.text}
                </blockquote>
              ))}
            </details>
          ) : null}
        </article>
      ))}
    </div>
  ) : (
    <p>{empty}</p>
  );
}

function RelationshipBar({ score, label }: { score: number; label: string }) {
  return (
    <div
      className="villages-relationship-bar"
      role="meter"
      aria-label={label}
      aria-valuemin={-100}
      aria-valuemax={100}
      aria-valuenow={score}
    >
      <span
        data-negative={score < 0}
        style={{ left: 50 + Math.min(0, score) / 2 + "%", width: Math.abs(score) / 2 + "%" }}
      />
    </div>
  );
}

function RomanticInterest({ score, target }: { score: number; target: string }) {
  return (
    <div
      className="villages-romantic-interest"
      role="meter"
      aria-label={"Romantic interest toward " + target}
      aria-valuemin={0}
      aria-valuemax={20}
      aria-valuenow={score}
      title={score + " of 20"}
    >
      {Array.from({ length: 10 }, (_, index) => {
        const filled = score - index * 2;
        return (
          <span key={index} aria-hidden="true" data-fill={filled >= 2 ? "full" : filled === 1 ? "half" : "empty"}>
            ♥
          </span>
        );
      })}
    </div>
  );
}

function RelationshipScores({ scores }: { scores: RelationshipScore[] }) {
  const player = scores.find(({ person }) => person.id === "player");
  const others = scores.filter(({ person }) => person.id !== "player");
  return (
    <div className="villages-relationship-scores">
      {player ? (
        <article>
          <h4>Toward you</h4>
          <RelationshipBar score={player.score} label="Toward you" />
          <div className="villages-romantic-interest-label">
            <span>Romantic interest</span>
            <RomanticInterest score={player.romanticInterest ?? 0} target="you" />
          </div>
          {player.answer ? <p>{player.answer}</p> : null}
        </article>
      ) : null}
      {others.length ? (
        <article>
          <h4>Toward other villagers</h4>
          <ul>
            {others.map(({ person, score, romanticInterest, answer }) => (
              <li key={person.id}>
                <div>
                  <span>{person.name}</span>
                  <div className="villages-relationship-meters">
                    <RelationshipBar score={score} label={"Toward " + person.name} />
                    <RomanticInterest score={romanticInterest ?? 0} target={person.name} />
                  </div>
                </div>
                {answer ? <p>{answer}</p> : null}
              </li>
            ))}
          </ul>
        </article>
      ) : null}
    </div>
  );
}

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
}) {
  const { visible, backgroundRevision } = useVillageActivity();
  const [localView, setLocalView] = useState<RelationshipView | null>(null);
  const [debug, setDebug] = useState<RelationshipInspectView | null>(null);
  const [error, setError] = useState("");
  const retryIdentity = useRef<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const supplied = suppliedView !== undefined;
  useEffect(() => {
    if (!inspect) setDebug(null);
  }, [inspect]);
  useEffect(() => {
    if (!visible) return;
    const controller = new AbortController();
    const pending: Promise<unknown>[] = [];
    if (!supplied)
      pending.push(
        request<RelationshipView>("/relationships", { signal: controller.signal }).then((next) => {
          if (!controller.signal.aborted) setLocalView(next);
        }),
      );
    if (inspect)
      pending.push(
        request<RelationshipInspectView>("/relationships/inspect", { signal: controller.signal }).then((next) => {
          if (!controller.signal.aborted) setDebug(next);
        }),
      );
    void Promise.all(pending)
      .then(() => {
        if (!controller.signal.aborted) setError("");
      })
      .catch((cause) => {
        if (!controller.signal.aborted) {
          if (invalidatesRead(cause)) {
            setLocalView(null);
            setDebug(null);
          }
          setError(cause instanceof Error ? cause.message : "Relationships could not be read.");
        }
      });
    return () => controller.abort();
  }, [request, supplied, inspect, visible, backgroundRevision]);
  const view = suppliedView === undefined ? localView : suppliedView;
  return (
    <section className={prefix + "-overlay villages-relationships"} aria-label="Relationships">
      <style>{`
      .villages-relationships,.villages-relationship-entries {display:grid;gap:1rem;min-width:0}
      .villages-relationships article,.villages-relationship-entries article {padding:1rem;border:1px solid #65708966;border-radius:.7rem;min-width:0;overflow-wrap:anywhere}
      .villages-relationships h3,.villages-relationships h4 {margin:.4rem 0}
      .villages-relationships p,.villages-relationship-entries p {white-space:pre-wrap;line-height:1.5}
      .villages-relationships blockquote {margin:.5rem 0;padding-left:.75rem;border-left:2px solid #8c90b0;white-space:pre-wrap}
      .villages-relationships details {margin:.75rem 0}
      .villages-relationships summary {cursor:pointer}
      .villages-relationship-scores {display:grid;gap:.75rem;margin-bottom:1rem}
      .villages-relationship-scores h4 {margin:0 0 .5rem}
      .villages-relationship-scores p {margin:.5rem 0 0;font-style:italic}
      .villages-relationship-scores ul {margin:0;padding:0;list-style:none}
      .villages-relationship-scores li {padding:.4rem 0;border-top:1px solid #a39b8460}
      .villages-relationship-scores li > div {display:grid;grid-template-columns:minmax(4rem,1fr) 2fr;gap:.65rem;align-items:center}
      .villages-relationship-meters {display:grid;gap:.28rem;min-width:0}
      .villages-romantic-interest-label {display:flex;flex-wrap:wrap;gap:.2rem .65rem;align-items:center;margin-top:.55rem;font-size:.875em}
      .villages-romantic-interest {display:flex;gap:.1em;align-items:center;width:max-content;max-width:100%;line-height:1;font:1rem/1 "Segoe UI Symbol","DejaVu Sans",sans-serif}
      .villages-romantic-interest > span {--heart-empty:#2a2238;--heart-full:#ed9db4;color:var(--heart-empty);-webkit-text-stroke:.65px #d1a0b3}
      .villages-romantic-interest > [data-fill=full] {color:var(--heart-full)}
      .villages-romantic-interest > [data-fill=half] {background:linear-gradient(90deg,var(--heart-full) 50%,var(--heart-empty) 50%);background-clip:text;color:transparent}
      .villages-relationship-bar {position:relative;height:.5rem;background:#1c192b;border-radius:3px}
      .villages-relationship-bar > span {position:absolute;inset-block:0;background:#9ea680;border-radius:2px}
      .villages-relationship-bar > span[data-negative=true] {background:#c38887}
      .villages-relationship-bar::after {content:"";position:absolute;left:50%;inset-block:-2px;width:1px;background:#f0dfbc}
    `}</style>
      {error ? <p role="alert">{error}</p> : null}
      {view?.starting.pending ? <p role="status">Starting history is not ready.</p> : null}
      {!view ? (
        <p role="status">Reading relationships…</p>
      ) : (
        view.profiles
          .filter((person) => !characterId || person.characterId === characterId)
          .map((person) => (
            <section key={person.characterId}>
              {!characterId ? <h3>{person.name}</h3> : null}
              {person.scores?.length ? <RelationshipScores scores={person.scores} /> : null}
              {person.entries.length ? <RelationshipEntries entries={person.entries} /> : null}
              {person.access.map((access) => (
                <button
                  key={access.venueId + ":" + access.zoneId}
                  type="button"
                  onClick={() => onVenue(access.venueId)}
                >
                  {access.name} · {access.active ? "Standing invitation" : "Unavailable"}
                </button>
              ))}
            </section>
          ))
      )}
      {inspect ? (
        <section aria-label="Relationship inspection">
          <h3>Inspect relationships</h3>
          {!debug ? (
            <p role="status">Reading relationships…</p>
          ) : (
            <>
              {debug.processing.length ? (
                <section aria-label="Social processing">
                  <h4>Processing</h4>
                  {debug.processing.map((work) => (
                    <p key={work.id}>
                      <strong>{work.label}:</strong> {work.status}
                      {work.message ? <> · {work.message}</> : null}
                      <small>
                        {" "}
                        · {work.requests} requests
                        {work.tokens !== null ? " · " + work.tokens.toLocaleString() + " tokens" : ""}
                      </small>
                      {["failed", "interrupted", "paused"].includes(work.status) ? (
                        <button
                          type="button"
                          disabled={saving}
                          onClick={async () => {
                            const key = work.instanceId + ":" + work.attempt;
                            retryIdentity.current[key] ??= createVillagesClientId();
                            setSaving(true);
                            setError("");
                            try {
                              await request("/background/retry", {
                                method: "POST",
                                body: JSON.stringify({
                                  id: work.id,
                                  expectedAttempt: work.attempt,
                                  expectedInstanceId: work.instanceId,
                                  actionId: retryIdentity.current[key],
                                }),
                              });
                              delete retryIdentity.current[key];
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
              <HistoryClarifications
                conflicts={debug.conflicts}
                disabled={
                  saving ||
                  debug.processing.some(
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
                  <section key={person.characterId}>
                    <h4>
                      {person.name} · {person.initialized ? "History prepared" : "History pending"}
                    </h4>
                    <RelationshipEntries entries={person.entries} empty="Nothing recorded." />
                  </section>
                ))}
            </>
          )}
        </section>
      ) : null}
    </section>
  );
}
