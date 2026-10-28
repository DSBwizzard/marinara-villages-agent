import { useState } from "react";
import type { VillageSnapshot } from "../../../shared/contracts/village.js";
import { messageFrom, request } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";

type ObjectValue = Record<string, unknown>;
const object = (value: unknown): ObjectValue =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as ObjectValue) : {};
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const text = (value: unknown): string => (typeof value === "string" ? value : "");

/** The inspection is deliberately private; the JSON retains the complete diagnostic record. */
export function ReturnCatchupDebug({ snapshot }: { snapshot: VillageSnapshot | null }) {
  const [account, setAccount] = useState<unknown>();
  const [selectedId, setSelectedId] = useState("");
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const load = async () => {
    setLoading(true);
    try {
      setAccount(await request<unknown>("/debug/return-catchup"));
      setSelectedId("");
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
  const name = (id: unknown) => snapshot?.villagers.find((person) => person.characterId === id)?.name || "A resident";
  const time = (value: unknown) => {
    const date = new Date(text(value));
    if (!text(value) || !Number.isFinite(date.getTime())) return "";
    const timeZone = snapshot?.village.timeZone || undefined;
    try {
      return date.toLocaleString(undefined, {
        timeZone,
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
    }
  };
  const place = (entry: ObjectValue) => {
    const venue = snapshot?.settings.venues.find((row) => row.id === entry.venueId);
    const zone = venue?.zones?.find((row) => row.id === entry.zoneId);
    return [venue?.name, zone?.name].filter(Boolean).join(" · ");
  };
  const events = opportunities.map((entry) => {
    const record = records.find((row) => row.opportunityId === entry.id) ?? {};
    const outcome = object(record.outcome);
    const reflection = object(outcome.wishReflection);
    const encounter = object(object(outcome.social).encounter);
    const names = list(entry.actorIds).map(name);
    const people = names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : names[0] || "A resident";
    const title =
      record.status === "rejected"
        ? "An opportunity was skipped"
        : record.status !== "settled"
          ? "An activity is unfinished"
          : text(reflection.reason)
            ? `${people} reflected`
            : list(encounter.lines).length
              ? `${people} met`
              : "A quiet moment";
    return { entry, record, reflection, encounter, title };
  });
  const selected = events.find(({ entry }) => entry.id === selectedId);
  return (
    <section className={`${ELEMENT_TAG}-panel`}>
      <style>{`
        .villages-catchup-list{display:grid;gap:8px;margin-top:12px}
        button.villages-catchup-entry{width:100%;min-height:58px;display:flex;justify-content:space-between;align-items:center;gap:12px;text-align:left;padding:10px 12px;color:inherit;font:inherit;background:var(--popover,#fff3dd);border:1px solid var(--border);border-radius:8px;box-shadow:none}
        .villages-catchup-entry span{display:grid;gap:4px;min-width:0}
        .villages-catchup-entry small{color:var(--muted-foreground);font-size:0.8em}
        .villages-catchup-arrow{font:20px/1 sans-serif;color:var(--muted-foreground)}
        .villages-catchup-detail{display:grid;gap:12px;margin-top:12px;overflow-wrap:anywhere}
        .villages-catchup-detail h4,.villages-catchup-detail p{margin:0}
        .villages-catchup-detail section{display:grid;gap:6px}
      `}</style>
      <h3>Return catch-up</h3>
      <p>Private resident activity · spoilers</p>
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
      ) : selected ? (
        <div className="villages-catchup-detail" aria-label="Activity details">
          <button type="button" className={`${ELEMENT_TAG}-button`} onClick={() => setSelectedId("")}>
            ← Activities
          </button>
          <h4>{selected.title}</h4>
          {time(selected.entry.startsAt) || place(selected.entry) ? (
            <p>{[time(selected.entry.startsAt), place(selected.entry)].filter(Boolean).join(" · ")}</p>
          ) : null}
          {selected.record.status === "rejected" ? (
            <p>This activity did not happen.</p>
          ) : selected.record.status !== "settled" ? (
            <p>This activity has not finished.</p>
          ) : (
            <>
              {text(selected.reflection.reason) ? (
                <section>
                  <strong>What was on their mind</strong>
                  <p>{text(selected.reflection.reason)}</p>
                </section>
              ) : null}
              {text(object(selected.reflection.attention).reason) ? (
                <section>
                  <strong>Why it mattered</strong>
                  <p>{text(object(selected.reflection.attention).reason)}</p>
                </section>
              ) : null}
              {list(selected.encounter.lines).length ? (
                <section>
                  <strong>What they said</strong>
                  {list(selected.encounter.lines).map((line, index) => (
                    <p key={index}>
                      <strong>{name(object(line).speakerId)}:</strong> {text(object(line).text)}
                    </p>
                  ))}
                </section>
              ) : null}
              {list(selected.encounter.memoryChanges).some((item) => text(object(item).text)) ? (
                <section>
                  <strong>Possible memories</strong>
                  {list(selected.encounter.memoryChanges).map((item, index) =>
                    text(object(item).text) ? <p key={index}>{text(object(item).text)}</p> : null,
                  )}
                </section>
              ) : null}
              {list(object(selected.encounter.relationshipReview).changes).some((item) => text(object(item).reason)) ? (
                <section>
                  <strong>How they felt</strong>
                  {list(object(selected.encounter.relationshipReview).changes).map((item, index) =>
                    text(object(item).reason) ? (
                      <p key={index}>
                        {name(object(item).fromId)}: {text(object(item).reason)}
                      </p>
                    ) : null,
                  )}
                </section>
              ) : null}
              {list(selected.encounter.wishChanges).some((item) => text(object(item).reason)) ? (
                <section>
                  <strong>What mattered to them</strong>
                  {list(selected.encounter.wishChanges).map((item, index) =>
                    text(object(item).reason) ? (
                      <p key={index}>
                        {name(object(item).actorId)}: {text(object(item).reason)}
                      </p>
                    ) : null,
                  )}
                </section>
              ) : null}
              {selected.title === "A quiet moment" ? <p>Nothing noteworthy happened.</p> : null}
            </>
          )}
        </div>
      ) : account !== undefined ? (
        events.length ? (
          <div className="villages-catchup-list" aria-label="Activities while away">
            {events.map(({ entry, title }) => (
              <button
                key={text(entry.id)}
                type="button"
                className="villages-catchup-entry"
                onClick={() => setSelectedId(text(entry.id))}
              >
                <span>
                  <strong>{title}</strong>
                  {time(entry.startsAt) ? <small>{time(entry.startsAt)}</small> : null}
                </span>
                <span className="villages-catchup-arrow" aria-hidden="true">
                  ›
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p>Nothing noteworthy was recorded.</p>
        )
      ) : null}
      {account !== undefined && copyStatus.startsWith("Copy unavailable") ? (
        <details open>
          <summary>Raw JSON</summary>
          <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{JSON.stringify(account, null, 2)}</pre>
        </details>
      ) : null}
    </section>
  );
}
