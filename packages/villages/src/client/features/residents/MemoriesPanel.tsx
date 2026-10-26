import { useEffect, useRef, useState } from "react";
import type {
  MemoryCursor,
  MemoryInspection,
  MemoryLibrary,
  MemoryListEntry,
} from "../../../shared/contracts/village.js";
import { messageFrom, request } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { stampTime, renderVillagesMarkdown } from "../../shared/presentation.js";
import { MemoryCorrectionForm } from "./MemoryCorrectionForm.js";

export type MemoryListQuery = { characterId: string; query?: string; cursor?: MemoryCursor };
const kindLabel = { experience: "Experience", information: "Information", "open-matter": "Open matter" };

export function VillagerMemoriesPanel({
  library,
  busy: parentBusy,
  characterId,
  onQuery,
  onForget,
}: {
  library: MemoryLibrary | null;
  busy: boolean;
  characterId: string;
  onQuery(query: MemoryListQuery, signal?: AbortSignal): Promise<void>;
  onForget(entry: MemoryListEntry, knower: string): void;
}) {
  const [knower, setKnower] = useState(characterId);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState<MemoryCursor | undefined>();
  const [previous, setPrevious] = useState<(MemoryCursor | undefined)[]>([]);
  const [evidence, setEvidence] = useState<MemoryInspection | null>(null);
  const [correction, setCorrection] = useState<MemoryInspection | null>(null);
  const [saving, setSaving] = useState(false);
  const busy = parentBusy || saving;
  const [error, setError] = useState("");
  const evidenceRequest = useRef<AbortController | null>(null);
  const pageRequest = useRef<AbortController | null>(null);
  const queryReader = useRef(onQuery);
  queryReader.current = onQuery;
  const people = useRef(library?.residents);
  if (library?.residents) people.current = library.residents;
  useEffect(() => {
    const controller = new AbortController();
    pageRequest.current = controller;
    void queryReader.current({ characterId }, controller.signal);
    return () => {
      evidenceRequest.current?.abort();
      pageRequest.current?.abort();
    };
  }, [characterId]);
  const load = (next: MemoryCursor | undefined, audience = knower) => {
    evidenceRequest.current?.abort();
    setEvidence(null);
    setCorrection(null);
    setError("");
    setCursor(next);
    pageRequest.current?.abort();
    const controller = new AbortController();
    pageRequest.current = controller;
    return onQuery({ characterId: audience, query, cursor: next }, controller.signal);
  };
  const refresh = () => {
    setPrevious([]);
    void load(undefined);
  };
  const inspect = async (entry: MemoryListEntry, correct = false) => {
    evidenceRequest.current?.abort();
    const controller = new AbortController();
    evidenceRequest.current = controller;
    setEvidence(null);
    setCorrection(null);
    setError("");
    try {
      const result = await request<MemoryInspection>(
        `/memories/inspect/${encodeURIComponent(entry.id)}?characterId=${encodeURIComponent(knower)}`,
        { signal: controller.signal },
      );
      if (!controller.signal.aborted) {
        if (correct && result.entry.forgotten) setError("That memory is forgotten. Refresh the list.");
        else if (correct) setCorrection(result);
        else setEvidence(result);
      }
    } catch (cause) {
      if (!controller.signal.aborted) setError(messageFrom(cause, "Could not read memory evidence."));
    }
  };
  const rows = library?.characterId === knower ? library.entries : [];
  return (
    <div className={`${ELEMENT_TAG}-memory-library`}>
      <div className={`${ELEMENT_TAG}-memory-hero`}>
        <h2>Memories</h2>
        <span>{library?.total ?? 0}</span>
      </div>
      <form
        autoComplete="off"
        className={`${ELEMENT_TAG}-memory-toolbar`}
        onSubmit={(event) => {
          event.preventDefault();
          refresh();
        }}
      >
        <select
          aria-label="Memory knower"
          disabled={busy || !library}
          value={knower}
          onChange={(event) => {
            const value = event.target.value;
            setKnower(value);
            setPrevious([]);
            void load(undefined, value);
          }}
        >
          {(library?.residents ?? people.current ?? [{ id: knower, name: "Resident" }]).map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </select>
        <input
          autoComplete="off"
          type="search"
          aria-label="Search memories"
          placeholder="Search memories"
          value={query}
          disabled={busy}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button type="submit" disabled={busy}>
          Search
        </button>
        <button type="button" disabled={busy} onClick={refresh}>
          Refresh
        </button>
      </form>
      {!library ? <p>Reading memories…</p> : null}
      {library && !rows.length ? <p>No memories match.</p> : null}
      <div className={`${ELEMENT_TAG}-memory-grid`}>
        {rows.map((entry) => (
          <article key={entry.id} className={`${ELEMENT_TAG}-memory-card`}>
            <div className={`${ELEMENT_TAG}-memory-card-top`}>
              <span>
                {entry.forgotten ? "Forgotten" : entry.playerCorrection ? "Player correction" : kindLabel[entry.kind]}
              </span>
              <time dateTime={entry.occurredAt}>
                {new Date(entry.occurredAt).toLocaleDateString()} · {stampTime(entry.occurredAt)}
              </time>
            </div>
            <p className={`${ELEMENT_TAG}-memory-text`}>{renderVillagesMarkdown(entry.text, entry.id)}</p>
            <div className={`${ELEMENT_TAG}-memory-card-actions`}>
              <button type="button" disabled={busy} onClick={() => void inspect(entry)}>
                Inspect
              </button>
              <button type="button" disabled={busy || entry.forgotten} onClick={() => void inspect(entry, true)}>
                Correct
              </button>
              <button type="button" disabled={busy || entry.forgotten} onClick={() => onForget(entry, knower)}>
                Forget
              </button>
            </div>
            {correction && (correction.entry.id === entry.id || correction.entry.rootId === entry.id) ? (
              <MemoryCorrectionForm
                key={`${correction.entry.id}:${correction.revision}`}
                inspection={correction}
                knower={knower}
                busy={busy}
                onSaving={setSaving}
                onSaved={refresh}
                onCancel={() => setCorrection(null)}
              />
            ) : null}
          </article>
        ))}
      </div>
      <nav className={`${ELEMENT_TAG}-memory-card-actions`} aria-label="Memory pages">
        <button
          type="button"
          disabled={busy || !previous.length}
          onClick={() => {
            const stack = [...previous];
            const back = stack.pop();
            setPrevious(stack);
            void load(back);
          }}
        >
          Previous
        </button>
        <button
          type="button"
          disabled={busy || !library?.next}
          onClick={() => {
            if (!library?.next) return;
            setPrevious([...previous, cursor]);
            void load(library.next);
          }}
        >
          Next
        </button>
      </nav>
      {error ? <p role="alert">{error}</p> : null}
      {evidence ? (
        <section className={`${ELEMENT_TAG}-memory-evidence`}>
          <div className={`${ELEMENT_TAG}-memory-section-head`}>
            <h3>Source</h3>
            <button type="button" aria-label="Close memory source" onClick={() => setEvidence(null)}>
              ×
            </button>
          </div>
          {evidence.knowers.map((known) => (
            <div key={known.person.id}>
              <h4>
                {known.person.name}
                {known.forgotten ? " · Forgotten" : known.playerCorrection ? " · Player correction" : ""}
              </h4>
              {known.playerCorrection ? (
                <p>{renderVillagesMarkdown(known.text, `${evidence.entry.id}:${known.person.id}`)}</p>
              ) : null}
              <p>
                {
                  {
                    observation: "Observation",
                    report: "Report",
                    interpretation: "Interpretation",
                    "validated-event": "Event",
                  }[known.basis]
                }
                {known.attributedTo
                  ? ` · ${library?.residents.find((row) => row.id === known.attributedTo)?.name ?? known.attributedTo}`
                  : ""}
              </p>
              {known.support.map((source, index) => (
                <blockquote key={`${source.sourceId}:${source.lineId}:${index}`}>
                  <p>{renderVillagesMarkdown(source.excerpt, `${source.sourceId}:${source.lineId}`)}</p>
                  <small>
                    {source.sourceId} · {source.lineId}
                  </small>
                </blockquote>
              ))}
            </div>
          ))}
        </section>
      ) : null}
    </div>
  );
}
