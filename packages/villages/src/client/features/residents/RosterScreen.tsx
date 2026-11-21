import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { StorybookHeading, StorybookSearchIcon } from "../../shared/StorybookHeading.js";
import { PeopleBook } from "./PeopleBook.js";
import { AvatarFace } from "./ResidentPanels.js";
import type { RosterScreenController } from "./screen-contracts.js";
import { AddVisitorDialog } from "./VisitorControls.js";
import { visitorVisitLabel } from "./calculations.js";
import { messageFrom, request } from "../../shared/api.js";
import { useVillageMutationLifetime } from "../../shared/mutation-lifetime.js";
import type { VillageSnapshot } from "../../../shared/contracts/village.js";

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
  const [preparing, setPreparing] = useState(false);
  const [preparationError, setPreparationError] = useState("");
  const [addingVisitor, setAddingVisitor] = useState<HTMLElement | null>(null);
  const { error, menuPage, openPerson, portraits, screen, snapshot } = controller;
  const selection = useMemo(() => ({ worldScope: snapshot?.worldScope }), [snapshot?.worldScope]);
  const lifetime = useVillageMutationLifetime(snapshot?.isFounded, undefined, selection);
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
  const people = ((showNpcs ? snapshot?.npcs : showVisitors ? snapshot?.visitors : snapshot?.villagers) ?? []).filter(
    (person) => person.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()),
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
          {error ? (
            <p role="alert" className={`${ELEMENT_TAG}-dossier-warning`}>
              {error}
            </p>
          ) : null}
          {showNpcs
            ? (snapshot?.npcPreparation ?? [])
                .filter((row) => row.status !== "ready")
                .map((row) => (
                  <div key={row.mapId} className={`${ELEMENT_TAG}-dossier-sheet`}>
                    <p>
                      {row.mapName} ·{" "}
                      {row.status === "started"
                        ? "Preparation interrupted or running"
                        : row.status === "failed"
                          ? "Preparation failed"
                          : "No NPC cast yet"}
                    </p>
                    {row.error ? <p role="alert">{row.error}</p> : null}
                    <button
                      type="button"
                      disabled={preparing}
                      onClick={async () => {
                        const claim = lifetime.begin();
                        if (!claim) return;
                        setPreparing(true);
                        setPreparationError("");
                        try {
                          const next = await request<VillageSnapshot>("/npcs/prepare", {
                            method: "POST",
                            body: JSON.stringify({
                              worldScope: snapshot.worldScope,
                              mapId: row.mapId,
                              requestId: crypto.randomUUID(),
                            }),
                          });
                          if (lifetime.owns(claim)) controller.setSnapshot(next);
                        } catch (cause) {
                          if (lifetime.owns(claim)) setPreparationError(messageFrom(cause, "NPC preparation failed."));
                        } finally {
                          if (lifetime.finish(claim)) setPreparing(false);
                        }
                      }}
                    >
                      {preparing ? "Preparing…" : row.status === "unprepared" ? "Prepare NPCs" : "Retry NPCs"}
                    </button>
                  </div>
                ))
            : null}
          {preparationError && showNpcs ? <p role="alert">{preparationError}</p> : null}
          <div className={`${ELEMENT_TAG}-directory-reading`}>
            {people.length ? (
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
                      />
                      <span className={`${ELEMENT_TAG}-directory-text`}>
                        <strong>{person.name}</strong>
                        {visitor ? <small>{visitorVisitLabel(visitor, snapshot?.clock?.timeZone)}</small> : null}
                        {"mapName" in person ? (
                          <small>
                            {person.mapName}
                            {person.met ? "" : " · Not met"}
                          </small>
                        ) : null}
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
                    ? showNpcs
                      ? "No matching NPCs."
                      : showVisitors
                        ? "No matching visitors."
                        : "No matching villagers."
                    : showNpcs
                      ? "No NPCs yet."
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
