import { useState } from "react";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { StorybookHeading, StorybookSearchIcon } from "../../shared/StorybookHeading.js";
import { PeopleBook } from "./PeopleBook.js";
import { AvatarFace } from "./ResidentPanels.js";
import type { RosterScreenController } from "./screen-contracts.js";
import { AddVisitorDialog } from "./VisitorControls.js";

export function RosterScreen({
  controller,
  selectedId,
  onDirectory,
}: {
  controller: RosterScreenController;
  selectedId?: string;
  onDirectory?: () => Promise<boolean>;
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [visitorTab, setVisitorTab] = useState(false);
  const [addingVisitor, setAddingVisitor] = useState(false);
  const { error, menuPage, openPerson, portraits, screen, snapshot } = controller;
  if (screen !== "menu" || menuPage !== "villagers") return null;
  const showVisitors = selectedId
    ? !!snapshot?.visitors?.some((visitor) => visitor.characterId === selectedId)
    : visitorTab;
  const chooseTab = async (visitors: boolean) => {
    if (visitors === showVisitors || (selectedId && onDirectory && !(await onDirectory()))) return;
    setVisitorTab(visitors);
    setSearch("");
    setPage(0);
  };
  const notice = snapshot?.visitorNotice;
  const visitVenue = notice && snapshot.settings.venues.find((venue) => venue.id === notice.venueId);
  const people = ((showVisitors ? snapshot?.visitors : snapshot?.villagers) ?? []).filter((person) =>
    person.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()),
  );
  const pageCount = Math.max(1, Math.ceil(people.length / 4));
  const currentPage = Math.min(page, pageCount - 1);
  if (page !== currentPage) setPage(currentPage);
  return (
    <div className={`${ELEMENT_TAG}-root ${ELEMENT_TAG}-directory-root`} data-page="villagers">
      <PeopleBook label="People notebook">
        <main
          className={`${ELEMENT_TAG}-directory-paper`}
          aria-label={showVisitors ? "Visitors directory" : "Villagers directory"}
        >
          <header className={`${ELEMENT_TAG}-directory-head`}>
            <StorybookHeading>People</StorybookHeading>
          </header>
          <nav
            className={`${ELEMENT_TAG}-directory-pagination ${ELEMENT_TAG}-people-sections`}
            aria-label="People sections"
          >
            <button type="button" aria-pressed={!showVisitors} onClick={() => void chooseTab(false)}>
              Villagers
            </button>
            <button type="button" aria-pressed={showVisitors} onClick={() => void chooseTab(true)}>
              Visitors
            </button>
            {showVisitors && snapshot ? (
              <button type="button" aria-label="Add Visitor" title="Add Visitor" onClick={() => setAddingVisitor(true)}>
                <span aria-hidden="true">+</span>
              </button>
            ) : null}
          </nav>
          <div className={`${ELEMENT_TAG}-directory-filters`}>
            <label className={`${ELEMENT_TAG}-directory-search`}>
              <span className={`${ELEMENT_TAG}-sr-only`}>Find a person</span>
              <StorybookSearchIcon />
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
            {visitVenue && notice ? (
              <button type="button" title={notice.venueName} onClick={() => controller.openVenue(visitVenue)}>
                Find visitor
              </button>
            ) : null}
          </div>
          {error ? (
            <p role="alert" className={`${ELEMENT_TAG}-dossier-warning`}>
              {error}
            </p>
          ) : null}
          <div className={`${ELEMENT_TAG}-directory-reading`}>
            {people.length ? (
              <div className={`${ELEMENT_TAG}-directory-grid`}>
                {people.slice(currentPage * 4, currentPage * 4 + 4).map((person) => (
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
                {!snapshot
                  ? "Reading people…"
                  : search.trim()
                    ? showVisitors
                      ? "No matching visitors."
                      : "No matching villagers."
                    : showVisitors
                      ? "No visitors yet."
                      : "No villagers yet."}
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
          {addingVisitor && snapshot ? (
            <AddVisitorDialog
              snapshot={snapshot}
              setSnapshot={controller.setSnapshot}
              onClose={() => setAddingVisitor(false)}
            />
          ) : null}
        </main>
      </PeopleBook>
    </div>
  );
}
