import { useEffect, useState } from "react";
import type { NpcEncounter, NpcPage, VillageNpcView } from "../../../shared/contracts/village.js";
import { request, villageAccessRevision, VILLAGE_ACCESS_DENIED } from "../../shared/api.js";
import { useFocusRevision, useVillageActivity } from "../../shared/activity.js";
import { ELEMENT_TAG as P } from "../../shared/constants.js";

function useNpcPage<T>(scope: string, path: string) {
  const [cursors, setCursors] = useState<string[]>([]);
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<{ key: string; page?: NpcPage<T>; error?: string }>();
  const { visible } = useVillageActivity();
  const focus = useFocusRevision(visible);
  const cursor = cursors.at(-1);
  const url = `${path}${path.includes("?") ? "&" : "?"}scope=${encodeURIComponent(scope)}${cursor ? "&cursor=" + encodeURIComponent(cursor) : ""}`;
  const key = JSON.stringify([url, retry, focus]);
  useEffect(() => {
    if (!visible || !scope) return;
    const controller = new AbortController(),
      access = villageAccessRevision();
    const denied = () => {
      controller.abort();
      setResult(undefined);
    };
    window.addEventListener(VILLAGE_ACCESS_DENIED, denied);
    void request<NpcPage<T>>(url, { signal: controller.signal })
      .then((page) => {
        if (!controller.signal.aborted && access === villageAccessRevision() && page.scope === scope)
          setResult({ key, page });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          setResult({ key, error: error instanceof Error ? error.message : "Could not read encounters." });
      });
    return () => {
      controller.abort();
      window.removeEventListener(VILLAGE_ACCESS_DENIED, denied);
    };
  }, [scope, url, key, visible]);
  return {
    page: result?.key === key ? result.page : undefined,
    error: result?.key === key ? result.error : undefined,
    refresh: () => {
      setCursors([]);
      setRetry((value) => value + 1);
    },
    pagination: (label: string) =>
      cursors.length || (result?.key === key && result.page?.nextCursor) ? (
        <nav className={`${P}-directory-pagination`} aria-label={`${label} pages`}>
          <button
            type="button"
            aria-label={`Previous ${label.toLowerCase()} page`}
            disabled={!cursors.length}
            onClick={() => setCursors((prior) => prior.slice(0, -1))}
          >
            ←
          </button>
          <span>{cursors.length + 1}</span>
          <button
            type="button"
            aria-label={`Next ${label.toLowerCase()} page`}
            disabled={!result?.page?.nextCursor || result.key !== key}
            onClick={() => result?.page?.nextCursor && setCursors((prior) => [...prior, result.page!.nextCursor!])}
          >
            →
          </button>
        </nav>
      ) : null,
  };
}

function EncounterHistory({ scope, person, timeZone }: { scope: string; person: VillageNpcView; timeZone?: string }) {
  const read = useNpcPage<NpcEncounter>(scope, `/npcs/${encodeURIComponent(person.characterId)}/encounters`);
  return (
    <section className={`${P}-npc-history`} aria-label={`Encounters with ${person.name}`}>
      {read.error ? (
        <p role="alert">
          {read.error}{" "}
          <button type="button" onClick={read.refresh}>
            Refresh
          </button>
        </p>
      ) : !read.page ? (
        <p role="status">Reading encounters…</p>
      ) : (
        read.page.items.map((encounter) => (
          <article key={encounter.id}>
            <h3>
              {encounter.placeName || "Earlier encounter"} · {encounterTime(encounter.at, timeZone)}
            </h3>
            {encounter.lines.map((line, index) => (
              <p key={index}>
                {line.speaker ? <strong>{line.speaker}: </strong> : null}
                {line.text}
              </p>
            ))}
          </article>
        ))
      )}
      {read.pagination("Encounter")}
    </section>
  );
}

function encounterTime(at: string, timeZone?: string) {
  return new Date(at).toLocaleString(undefined, {
    timeZone,
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function NpcEncounters({
  scope,
  search,
  selectedId,
  timeZone,
}: {
  scope: string;
  search: string;
  selectedId?: string;
  timeZone?: string;
}) {
  const read = useNpcPage<VillageNpcView>(scope, `/npcs?query=${encodeURIComponent(search.slice(0, 200))}`);
  const [expanded, setExpanded] = useState(selectedId ?? "");
  return (
    <div className={`${P}-npc-encounters`}>
      {read.error ? (
        <p role="alert">
          {read.error}{" "}
          <button type="button" onClick={read.refresh}>
            Refresh
          </button>
        </p>
      ) : !read.page ? (
        <p role="status">Reading people…</p>
      ) : !read.page.items.length ? (
        <p>{search.trim() ? "No matching people." : "You haven’t met any NPCs yet."}</p>
      ) : (
        read.page.items.map((person) => (
          <article key={person.characterId} className={`${P}-npc-row`}>
            <button
              type="button"
              aria-label={`Encounters with ${person.name}`}
              aria-expanded={expanded === person.characterId}
              onClick={() => setExpanded(expanded === person.characterId ? "" : person.characterId)}
            >
              <strong>{person.name}</strong>
              <small>
                {person.placeName ? person.placeName + " · " : ""}
                {encounterTime(person.at, timeZone)}
              </small>
              {person.excerpt ? <span>{person.excerpt}</span> : null}
            </button>
            {expanded === person.characterId ? (
              <EncounterHistory key={person.characterId} scope={scope} person={person} timeZone={timeZone} />
            ) : null}
          </article>
        ))
      )}
      {read.pagination("People")}
    </div>
  );
}
