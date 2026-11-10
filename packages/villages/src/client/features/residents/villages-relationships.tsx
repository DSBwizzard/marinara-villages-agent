import { HistoryClarifications } from "../../shared/HistoryClarifications.js";
import { useVillageActivity } from "../../shared/activity.js";
import { invalidatesRead } from "../../shared/api.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import { useEffect, useRef, useState } from "react";
import type {
  RelationshipEntry,
  RelationshipInspectView,
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
          <strong className="villages-relationship-entry-label">
            {(entry.facet ?? entry.kind).replaceAll("-", " ")}
          </strong>
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
              <h3>{person.name}</h3>
              <RelationshipEntries entries={person.entries} />
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
