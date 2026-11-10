import { useState } from "react";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { PeopleBook } from "./PeopleBook.js";
import { AvatarFace } from "./ResidentPanels.js";
import type { RosterScreenController } from "./screen-contracts.js";

export function RosterScreen({ controller, selectedId }: { controller: RosterScreenController; selectedId?: string }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const { error, menuPage, openPerson, portraits, screen, snapshot } = controller;
  if (screen !== "menu" || menuPage !== "villagers") return null;
  const villagers = (snapshot?.villagers ?? []).filter((person) =>
    person.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()),
  );
  const pageCount = Math.max(1, Math.ceil(villagers.length / 4));
  const currentPage = Math.min(page, pageCount - 1);
  if (page !== currentPage) setPage(currentPage);
  return (
    <div className={`${ELEMENT_TAG}-root ${ELEMENT_TAG}-directory-root`} data-page="villagers">
      <PeopleBook label="People notebook">
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
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
            />
          </label>
          {error ? (
            <p role="alert" className={`${ELEMENT_TAG}-dossier-warning`}>
              {error}
            </p>
          ) : null}
          <div className={`${ELEMENT_TAG}-directory-reading`}>
            {villagers.length ? (
              <div className={`${ELEMENT_TAG}-directory-grid`}>
                {villagers.slice(currentPage * 4, currentPage * 4 + 4).map((person) => (
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
                      {person.missing ? <small>Card missing</small> : null}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p role={!snapshot ? "status" : undefined}>
                {!snapshot ? "Reading villagers…" : search.trim() ? "No matching villagers." : "No villagers yet."}
              </p>
            )}
          </div>
          {pageCount > 1 ? (
            <nav className={`${ELEMENT_TAG}-directory-pagination`} aria-label="People pages">
              <button
                type="button"
                aria-label="Previous people page"
                disabled={currentPage === 0}
                onClick={() => setPage(currentPage - 1)}
              >
                ←
              </button>
              <span role="status">
                {currentPage + 1} / {pageCount}
              </span>
              <button
                type="button"
                aria-label="Next people page"
                disabled={currentPage + 1 === pageCount}
                onClick={() => setPage(currentPage + 1)}
              >
                →
              </button>
            </nav>
          ) : null}
        </main>
      </PeopleBook>
    </div>
  );
}
