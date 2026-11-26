import { useState } from "react";
import { createPortal } from "react-dom";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { StorybookHeading, StorybookSearchIcon } from "../../shared/StorybookHeading.js";
import { PeopleBook } from "./PeopleBook.js";
import { AvatarFace } from "./ResidentPanels.js";
import type { RosterScreenController } from "./screen-contracts.js";
import { AddVisitorDialog } from "./VisitorControls.js";
import { visitorVisitLabel } from "./calculations.js";
import { NpcEncounters } from "./NpcEncounters.js";

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
  const [tab, setTab] = useState<"Villagers" | "Visitors" | "NPCs">("Villagers");
  const [addingVisitor, setAddingVisitor] = useState<HTMLElement | null>(null);
  const { error, menuPage, openPerson, portraits, screen, snapshot } = controller;
  if (screen !== "menu" || menuPage !== "villagers") return null;
  const selectedTab = selectedId
    ? selectedId.startsWith("npc:")
      ? "NPCs"
      : snapshot?.visitors?.some((visitor) => visitor.characterId === selectedId)
        ? "Visitors"
        : "Villagers"
    : tab;
  const showVisitors = selectedTab === "Visitors";
  const showNpcs = selectedTab === "NPCs";
  if (selectedId && tab !== selectedTab) {
    setTab(selectedTab);
    setSearch("");
    setPage(0);
  }
  const chooseTab = async (next: typeof tab) => {
    if (next === selectedTab || (selectedId && onDirectory && !(await onDirectory()))) return;
    setTab(next);
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
        <main className={`${ELEMENT_TAG}-directory-paper`} aria-label={`${selectedTab} directory`}>
          <header className={`${ELEMENT_TAG}-directory-head`}>
            <StorybookHeading>People</StorybookHeading>
            {showVisitors && snapshot ? (
              <button
                type="button"
                aria-label="Add Visitor"
                title="Add Visitor"
                onClick={(event) =>
                  setAddingVisitor(event.currentTarget.closest<HTMLElement>(`.${ELEMENT_TAG}-desk-workspace`))
                }
              >
                <span aria-hidden="true">+</span>
              </button>
            ) : null}
          </header>
          <nav className={`${ELEMENT_TAG}-people-sections`} aria-label="People sections">
            {(["Villagers", "Visitors", "NPCs"] as const).map((entry) => (
              <button
                key={entry}
                type="button"
                aria-pressed={selectedTab === entry}
                onClick={() => void chooseTab(entry)}
              >
                {entry}
              </button>
            ))}
          </nav>
          {!showNpcs ? (
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
              {selectedTab === "Villagers" && visitVenue && notice ? (
                <button type="button" title={notice.venueName} onClick={() => controller.openVenue(visitVenue)}>
                  Find visitor
                </button>
              ) : null}
            </div>
          ) : null}
          {error ? (
            <p role="alert" className={`${ELEMENT_TAG}-dossier-warning`}>
              {error}
            </p>
          ) : null}
          <div className={`${ELEMENT_TAG}-directory-reading`}>
            {showNpcs ? (
              <NpcEncounters
                key={snapshot?.worldScope}
                scope={snapshot?.worldScope ?? ""}
                search={search}
                onSearch={setSearch}
                selectedId={selectedId}
                timeZone={snapshot?.clock?.timeZone}
              />
            ) : people.length ? (
              <div className={`${ELEMENT_TAG}-directory-grid`}>
                {people.slice(currentPage * 4, currentPage * 4 + 4).map((person) => {
                  const visitor = showVisitors
                    ? snapshot?.visitors?.find((entry) => entry.characterId === person.characterId)
                    : undefined;
                  return (
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
                        fullResolution
                      />
                      <span className={`${ELEMENT_TAG}-directory-text`}>
                        <strong>{person.name}</strong>
                        {visitor ? <small>{visitorVisitLabel(visitor, snapshot?.clock?.timeZone)}</small> : null}
                        {"missing" in person && person.missing ? <small>Card missing</small> : null}
                      </span>
                    </button>
                  );
                })}
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
          {!showNpcs && pageCount > 1 ? (
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
          {addingVisitor && snapshot
            ? createPortal(
                <AddVisitorDialog
                  snapshot={snapshot}
                  setSnapshot={controller.setSnapshot}
                  scope={addingVisitor}
                  onClose={() => setAddingVisitor(null)}
                />,
                addingVisitor,
              )
            : null}
        </main>
      </PeopleBook>
    </div>
  );
}
