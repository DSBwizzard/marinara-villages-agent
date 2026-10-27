import { ELEMENT_TAG } from "../../shared/constants.js";
import type { RosterScreenController } from "./screen-contracts.js";
import { AvatarFace } from "./ResidentPanels.js";
import { useLayoutEffect, useRef } from "react";
import { PeopleBook } from "./PeopleBook.js";

export function RosterScreen({
  controller,
  onClose,
  readingPosition,
}: {
  controller: RosterScreenController;
  onClose?: () => void;
  readingPosition?: { current: number };
}) {
  const content = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (content.current) content.current.scrollTop = readingPosition?.current ?? 0;
  }, [readingPosition]);
  const { error, menuPage, openPerson, portraits, screen, setMenuPage, snapshot } = controller;
  if (screen !== "menu" || menuPage !== "villagers") return null;
  const villagers = snapshot?.villagers ?? [];
  return (
    <div className={`${ELEMENT_TAG}-root ${ELEMENT_TAG}-directory-root`} data-page="villagers">
      <PeopleBook
        label="People notebook"
        toolbar={
          <button
            type="button"
            className={`${ELEMENT_TAG}-notebook-close`}
            onClick={onClose ?? (() => setMenuPage("index"))}
          >
            Close ×
          </button>
        }
      >
        <main className={`${ELEMENT_TAG}-directory-paper`} aria-label="Villagers directory">
          <header className={`${ELEMENT_TAG}-directory-head`}>
            <h1>Villagers</h1>
          </header>
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
