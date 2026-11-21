import { useEffect, useRef, useState } from "react";
import type { NpcPage } from "../../../shared/contracts/village.js";
import { request, villageAccessRevision, VILLAGE_ACCESS_DENIED } from "../../shared/api.js";
import { useFocusRevision, useVillageActivity } from "../../shared/activity.js";
import { StorybookSearchIcon } from "../../shared/StorybookHeading.js";
import { ELEMENT_TAG as P } from "../../shared/constants.js";

function useNpcPage(scope: string, search: string) {
  const [cursors, setCursors] = useState<string[]>([]);
  const [pageSearch, setPageSearch] = useState(search);
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<{ key: string; access: number; page?: NpcPage; error?: string }>();
  const { visible } = useVillageActivity();
  const focus = useFocusRevision(visible);
  if (pageSearch !== search) {
    setPageSearch(search);
    setCursors([]);
  }
  const cursor = pageSearch === search ? cursors.at(-1) : undefined;
  const url = `/npcs?scope=${encodeURIComponent(scope)}&query=${encodeURIComponent(search.slice(0, 200))}${cursor ? "&cursor=" + encodeURIComponent(cursor) : ""}`;
  const key = JSON.stringify([url, retry, focus]);
  useEffect(() => {
    if (!visible || !scope) return;
    const controller = new AbortController(),
      access = villageAccessRevision();
    const denied = (event: Event) => {
      const detail = (event as CustomEvent<unknown>).detail;
      setResult({
        key,
        access: villageAccessRevision(),
        error: typeof detail === "string" ? detail : "Access was denied. Refresh to try again.",
      });
      controller.abort();
    };
    window.addEventListener(VILLAGE_ACCESS_DENIED, denied);
    void request<NpcPage>(url, { signal: controller.signal })
      .then((page) => {
        if (!controller.signal.aborted && access === villageAccessRevision())
          setResult(
            page.scope === scope
              ? { key, access, page }
              : { key, access, error: "The Village changed. Open People again." },
          );
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          setResult({
            key,
            access: villageAccessRevision(),
            error: error instanceof Error ? error.message : "Could not read people.",
          });
      });
    return () => {
      controller.abort();
      window.removeEventListener(VILLAGE_ACCESS_DENIED, denied);
    };
  }, [scope, url, key, visible]);
  const current = result?.key === key && result.access === villageAccessRevision() ? result : undefined;
  return {
    page: current?.page,
    error: current?.error,
    refresh: () => {
      setCursors([]);
      setRetry((value) => value + 1);
    },
    pagination:
      cursors.length || current?.page?.nextCursor ? (
        <nav className={`${P}-directory-pagination`} aria-label="People pages">
          <button
            type="button"
            aria-label="Previous people page"
            disabled={!cursors.length}
            onClick={() => setCursors((prior) => prior.slice(0, -1))}
          >
            ←
          </button>
          <span>{cursors.length + 1}</span>
          <button
            type="button"
            aria-label="Next people page"
            disabled={!current?.page?.nextCursor}
            onClick={() => current?.page?.nextCursor && setCursors((prior) => [...prior, current.page!.nextCursor!])}
          >
            →
          </button>
        </nav>
      ) : null,
  };
}

function encounterTime(at: string, timeZone?: string) {
  return new Date(at).toLocaleString(undefined, {
    timeZone,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function NpcEncounters({
  scope,
  search,
  onSearch,
  selectedId,
  timeZone,
}: {
  scope: string;
  search: string;
  onSearch: (value: string) => void;
  selectedId?: string;
  timeZone?: string;
}) {
  const read = useNpcPage(scope, search);
  const [selected, setSelected] = useState(selectedId ?? "");
  if (read.error && selected) setSelected("");
  const list = useRef<HTMLDivElement>(null),
    title = useRef<HTMLHeadingElement>(null);
  const person = read.page?.items.find((row) => row.characterId === selected) ?? read.page?.items[0];
  return (
    <div className={`${P}-npc-encounters`} data-detail={!!selected}>
      <div ref={list} className={`${P}-npc-index`}>
        <label className={`${P}-directory-search`}>
          <span className={`${P}-sr-only`}>Find a person</span>
          <StorybookSearchIcon />
          <input
            type="search"
            autoComplete="off"
            placeholder="Find a person"
            value={search}
            onChange={(event) => {
              onSearch(event.target.value);
              setSelected("");
            }}
          />
        </label>
        <h2 className={`${P}-npc-recent`}>Recently met</h2>
        <div className={`${P}-npc-list`}>
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
            read.page.items.map((row) => (
              <article key={row.characterId} className={`${P}-npc-row`}>
                <button
                  type="button"
                  aria-label={`View ${row.name}`}
                  aria-pressed={person?.characterId === row.characterId}
                  onClick={() => {
                    setSelected(row.characterId);
                    requestAnimationFrame(() => title.current?.focus({ preventScroll: true }));
                  }}
                >
                  <strong>{row.name}</strong>
                  {row.role ? <span>{row.role}</span> : null}
                  <small>
                    {row.placeName ? row.placeName + " · " : ""}
                    {encounterTime(row.at, timeZone)}
                  </small>
                </button>
              </article>
            ))
          )}
        </div>
        {read.pagination}
      </div>
      <div className={`${P}-npc-detail`}>
        <button
          type="button"
          className={`${P}-npc-back`}
          aria-label="Back to NPCs"
          onClick={() => {
            setSelected("");
            requestAnimationFrame(() =>
              list.current
                ?.querySelector<HTMLButtonElement>('button[aria-pressed="true"]')
                ?.focus({ preventScroll: true }),
            );
          }}
        >
          ← NPCs
        </button>
        {!read.page && selected ? (
          <p role="status">Reading person…</p>
        ) : person ? (
          <section aria-label={`${person.name} overview`}>
            <header>
              <h1 ref={title} tabIndex={-1}>
                {person.name}
              </h1>
              {person.role ? <p>{person.role}</p> : null}
            </header>
            <h2 className={`${P}-npc-overview-title`}>Overview</h2>
            {person.appearance ? (
              <section>
                <h3>Appearance</h3>
                <p>{person.appearance}</p>
              </section>
            ) : null}
            {person.personality ? (
              <section>
                <h3>Personality</h3>
                <p>{person.personality}</p>
              </section>
            ) : null}
            <section>
              <h3>Last met</h3>
              {person.placeName ? <p>{person.placeName}</p> : null}
              <time dateTime={person.at}>{encounterTime(person.at, timeZone)}</time>
            </section>
          </section>
        ) : null}
      </div>
    </div>
  );
}
