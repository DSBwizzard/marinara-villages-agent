import { useLayoutEffect, useRef, useState } from "react";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { PeopleBook } from "./PeopleBook.js";
import { AvatarFace } from "./ResidentPanels.js";
import type { RosterScreenController } from "./screen-contracts.js";

export function RosterScreen({
  controller,
  readingPosition,
  selectedId,
}: {
  controller: RosterScreenController;
  readingPosition?: { current: number };
  selectedId?: string;
}) {
  const [search, setSearch] = useState("");
  const content = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (content.current) content.current.scrollTop = readingPosition?.current ?? 0;
  }, [readingPosition]);
  const { error, menuPage, openPerson, portraits, screen, snapshot } = controller;
  if (screen !== "menu" || menuPage !== "villagers") return null;
  const villagers = (snapshot?.villagers ?? []).filter((person) =>
    person.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()),
  );
  return (
    <div className={`${ELEMENT_TAG}-root ${ELEMENT_TAG}-directory-root`} data-page="villagers">
      <PeopleBook label="People notebook" toolbar={null}>
        <main className={`${ELEMENT_TAG}-directory-paper`} aria-label="Villagers directory">
          <header className={`${ELEMENT_TAG}-directory-head`}>
            <h1>
              People
              <svg className={`${ELEMENT_TAG}-directory-flourish`} viewBox="0 0 64 36" aria-hidden="true">
                <path d="M4 32C20 30 36 16 60 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M16 27C10 20 18 8 29 4c0 12-4 20-13 23ZM32 20C33 10 46 5 62 2c-5 12-15 18-30 18Z" />
              </svg>
            </h1>
          </header>
          <label className={`${ELEMENT_TAG}-directory-search`}>
            <span className={`${ELEMENT_TAG}-sr-only`}>Find a person</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="10" cy="10" r="7" />
              <path d="m15 15 6 6" />
            </svg>
            <input
              type="search"
              autoComplete="off"
              placeholder="Find a person"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          {error ? (
            <p role="alert" className={`${ELEMENT_TAG}-dossier-warning`}>
              {error}
            </p>
          ) : null}
          <div
            className={`${ELEMENT_TAG}-directory-reading`}
            ref={content}
            onScroll={() => {
              if (readingPosition && content.current) readingPosition.current = content.current.scrollTop;
            }}
          >
            <div className={`${ELEMENT_TAG}-directory-grid`}>
              {[
                villagers.slice(0, Math.ceil(villagers.length / 2)),
                villagers.slice(Math.ceil(villagers.length / 2)),
              ].map((page, index) => (
                <div className={`${ELEMENT_TAG}-directory-page`} key={index}>
                  {page.map((person) => (
                    <button
                      type="button"
                      key={person.characterId}
                      className={`${ELEMENT_TAG}-directory-card`}
                      aria-label={`Open ${person.name} profile`}
                      aria-pressed={selectedId === person.characterId}
                      onClick={() => openPerson({ actorId: person.characterId, returnTo: "menu" })}
                    >
                      <AvatarFace
                        portrait={portraits[person.characterId]}
                        name={person.name}
                        className={`${ELEMENT_TAG}-avatar`}
                      />
                      <span className={`${ELEMENT_TAG}-directory-text`}>
                        <strong>{person.name}</strong>
                        {person.summary ? (
                          <small className={`${ELEMENT_TAG}-directory-summary`}>{person.summary}</small>
                        ) : null}
                        {person.missing ? <small>Card missing</small> : null}
                      </span>
                      <span aria-hidden="true">›</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
            {!snapshot ? <p role="status">Reading villagers…</p> : !villagers.length ? <p>No villagers yet.</p> : null}
          </div>
        </main>
      </PeopleBook>
    </div>
  );
}
