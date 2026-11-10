import { useLayoutEffect, useRef, useState } from "react";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { PeopleBook } from "./PeopleBook.js";
import { AvatarFace } from "./ResidentPanels.js";
import type { RosterScreenController } from "./screen-contracts.js";

export function RosterScreen({
  controller,
  onClose,
  readingPosition,
  selectedId,
}: {
  controller: RosterScreenController;
  onClose?: () => void;
  readingPosition?: { current: number };
  selectedId?: string;
}) {
  const [search, setSearch] = useState("");
  const content = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (content.current) content.current.scrollTop = readingPosition?.current ?? 0;
  }, [readingPosition]);
  const { error, menuPage, openPerson, portraits, screen, setMenuPage, snapshot } = controller;
  if (screen !== "menu" || menuPage !== "villagers") return null;
  const villagers = (snapshot?.villagers ?? []).filter((person) =>
    person.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()),
  );
  return (
    <div className={`${ELEMENT_TAG}-root ${ELEMENT_TAG}-directory-root`} data-page="villagers">
      <PeopleBook label="People notebook" toolbar={null}>
        <main className={`${ELEMENT_TAG}-directory-paper`} aria-label="Villagers directory">
          <header className={`${ELEMENT_TAG}-directory-head`}>
            <h1>People</h1>
            <span className={`${ELEMENT_TAG}-directory-meta`}>
              <span>{villagers.length} villagers</span>
              {!selectedId ? (
                <button
                  type="button"
                  className={`${ELEMENT_TAG}-notebook-close`}
                  onClick={onClose ?? (() => setMenuPage("index"))}
                >
                  Close ×
                </button>
              ) : null}
            </span>
          </header>
          <label className={`${ELEMENT_TAG}-directory-search`}>
            <span className={`${ELEMENT_TAG}-sr-only`}>Find a person</span>
            <input
              type="search"
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
                        {person.summary ? <small>{person.summary}</small> : null}
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
