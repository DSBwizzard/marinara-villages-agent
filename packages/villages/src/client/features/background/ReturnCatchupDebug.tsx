import { useState } from "react";
import type { VillageSnapshot } from "../../../shared/contracts/village.js";
import { messageFrom, request } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";

type ObjectValue = Record<string, unknown>;
const object = (value: unknown): ObjectValue =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as ObjectValue) : {};
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const text = (value: unknown): string => (typeof value === "string" ? value : "");
const when = (value: unknown): string => {
  const valueText = text(value);
  const time = new Date(valueText);
  return valueText && Number.isFinite(time.getTime()) ? time.toLocaleString() : valueText || "Unknown time";
};

/** This deliberately exposes private resident outcomes only in the debug tools. */
export function ReturnCatchupDebug({ snapshot }: { snapshot: VillageSnapshot | null }) {
  const [account, setAccount] = useState<unknown>();
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const load = async () => {
    setLoading(true);
    try {
      setAccount(await request<unknown>("/debug/return-catchup"));
      setError("");
      setCopyStatus("");
    } catch (cause) {
      setError(messageFrom(cause, "Could not inspect catch-up."));
    } finally {
      setLoading(false);
    }
  };
  const copy = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(JSON.stringify(account, null, 2));
      setCopyStatus("Copied JSON.");
    } catch {
      setCopyStatus("Copy unavailable. Select the JSON below to copy it.");
    }
  };
  const batch = object(account);
  const empty = account !== undefined && (batch.batch === null || !text(batch.id));
  const opportunities = list(batch.opportunities).map(object);
  const records = list(batch.records).map(object);
  const jobs = list(batch.jobs).map(object);
  const name = (id: unknown) =>
    snapshot?.villagers.find((person) => person.characterId === id)?.name || text(id) || "Unknown resident";
  const place = (entry: ObjectValue) => {
    const venue = snapshot?.settings.venues.find((row) => row.id === entry.venueId);
    const zone = venue?.zones?.find((row) => row.id === entry.zoneId);
    return [venue?.name || text(entry.venueId), zone?.name || text(entry.zoneId)].filter(Boolean).join(" · ");
  };
  return (
    <section className={`${ELEMENT_TAG}-panel`}>
      <h3>Return catch-up</h3>
      <p>Contains resident secrets and spoilers.</p>
      <div className={`${ELEMENT_TAG}-row`} style={{ flexWrap: "wrap", gap: "0.5rem" }}>
        <button type="button" className={`${ELEMENT_TAG}-button`} disabled={loading} onClick={() => void load()}>
          {loading ? "Loading…" : account === undefined ? "Inspect catch-up" : "Refresh"}
        </button>
        {account !== undefined ? (
          <button type="button" className={`${ELEMENT_TAG}-button`} onClick={() => void copy()}>
            Copy JSON
          </button>
        ) : null}
      </div>
      {error ? <p role="alert">{error}</p> : null}
      {copyStatus ? <p role="status">{copyStatus}</p> : null}
      {empty ? (
        <p>No catch-up has been recorded.</p>
      ) : account !== undefined ? (
        <div style={{ display: "grid", gap: "0.75rem", marginTop: "1rem" }}>
          <div>
            <strong>{text(batch.status) || "Unknown status"}</strong>
            <p>
              {when(batch.from)} → {when(batch.until)}
            </p>
            {text(batch.reason) ? <p>{text(batch.reason)}</p> : null}
          </div>
          {opportunities.length ? (
            opportunities.map((entry) => {
              const record = records.find((row) => row.opportunityId === entry.id) ?? {};
              const outcome = object(record.outcome);
              const reflection = object(outcome.wishReflection);
              const attention = object(reflection.attention);
              const encounter = object(object(outcome.social).encounter);
              const job = jobs.find((row) => row.opportunityId === entry.id) ?? {};
              const activity = object(job.activity),
                interpretation = object(job.interpretation);
              const isEncounter = entry.kind === "encounter";
              return (
                <article key={text(entry.id)} className={`${ELEMENT_TAG}-panel`}>
                  <h4>
                    {isEncounter ? "Encounter" : "Private reflection"} · {list(entry.actorIds).map(name).join(", ")}
                  </h4>
                  <p>
                    {when(entry.startsAt)}
                    {place(entry) ? ` · ${place(entry)}` : ""}
                  </p>
                  <p>
                    <strong>{text(record.status) || "pending"}</strong>
                  </p>
                  {list(entry.facts).map((fact, index) => (
                    <p key={index}>{text(fact)}</p>
                  ))}
                  {text(reflection.reason) ? (
                    <p>
                      <strong>Reflection:</strong> {text(reflection.reason)}
                    </p>
                  ) : null}
                  {text(attention.reason) ? (
                    <p>
                      <strong>Why it surfaced:</strong> {text(attention.reason)}
                    </p>
                  ) : null}
                  {list(encounter.lines).length ? (
                    <div>
                      <strong>Conversation</strong>
                      {list(encounter.lines).map((line, index) => (
                        <p key={index}>
                          <strong>{name(object(line).speakerId)}:</strong> {text(object(line).text)}
                        </p>
                      ))}
                    </div>
                  ) : null}
                  {list(encounter.memoryChanges).length ? (
                    <div>
                      <strong>Proposed memories</strong>
                      {list(encounter.memoryChanges).map((memory, index) => (
                        <p key={index}>{text(object(memory).text) || text(object(memory).action) || "Memory update"}</p>
                      ))}
                    </div>
                  ) : null}
                  {list(object(encounter.relationshipReview).changes).length ? (
                    <div>
                      <strong>Relationship interpretations</strong>
                      {list(object(encounter.relationshipReview).changes).map((change, index) => (
                        <p key={index}>
                          {name(object(change).fromId)} → {name(object(change).toId)}:{" "}
                          {text(object(change).reason) || "Relationship update"}
                        </p>
                      ))}
                    </div>
                  ) : null}
                  {list(encounter.wishChanges).length ? (
                    <div>
                      <strong>Wish interpretations</strong>
                      {list(encounter.wishChanges).map((change, index) => (
                        <p key={index}>
                          {name(object(change).actorId)}:{" "}
                          {text(object(change).reason) || text(object(change).intent) || "Wish update"}
                        </p>
                      ))}
                    </div>
                  ) : null}
                  {!outcome.wishReflection && !outcome.social && record.status === "settled" ? (
                    <p>Nothing noteworthy happened.</p>
                  ) : null}
                  {text(record.error) ? <p role="alert">{text(record.error)}</p> : null}
                  {activity.id || interpretation.id ? (
                    <p>
                      Model requests: {Number(activity.requests || 0) + Number(interpretation.requests || 0)}
                      {activity.attempt ? ` · Activity attempt ${activity.attempt}` : ""}
                      {interpretation.attempt ? ` · Interpretation attempt ${interpretation.attempt}` : ""}
                    </p>
                  ) : null}
                </article>
              );
            })
          ) : (
            <p>No opportunities were selected.</p>
          )}
        </div>
      ) : null}
      {account !== undefined ? (
        <details open={copyStatus.startsWith("Copy unavailable") || undefined}>
          <summary>Raw JSON</summary>
          <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{JSON.stringify(account, null, 2)}</pre>
        </details>
      ) : null}
    </section>
  );
}
