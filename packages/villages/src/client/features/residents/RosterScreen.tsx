import { ResidentBackgroundReview } from "../../shared/ResidentBackgroundReview.js";
import {
  DEFAULT_RESIDENT_FOUNDING_CONTEXT,
  type ResidentFoundingContext,
} from "../../../shared/helpers/resident-founding-context.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import type { RosterScreenController } from "./screen-contracts.js";
import { AvatarFace } from "./ResidentPanels.js";
import { useLayoutEffect, useRef, useState } from "react";
import { PeopleBook } from "./PeopleBook.js";
import { SpriteSetupDialog } from "./SpriteSetupDialog.js";

export function RosterScreen({
  controller,
  onClose,
  readingPosition,
}: {
  controller: RosterScreenController;
  onClose?: () => void;
  readingPosition?: { current: number };
}) {
  const [spriteCharacter, setSpriteCharacter] = useState<{ id: string; name: string } | null>(null);
  const content = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (content.current) content.current.scrollTop = readingPosition?.current ?? 0;
  }, [readingPosition]);
  const joiningDrafts = useRef<Record<string, ResidentFoundingContext>>({});
  const [joining, setJoining] = useState<{ id: string; name: string; context: ResidentFoundingContext } | null>(null);
  const {
    addVillager,
    busy,
    catalog,
    error,
    menuPage,
    openPerson,
    pickerOpen,
    portraits,
    rosterSearch,
    screen,
    search,
    setMenuPage,
    setPickerOpen,
    setRosterSearch,
    setSearch,
    snapshot,
    visibleCatalog,
  } = controller;

  if (screen === "menu" && menuPage === "villagers") {
    const query = rosterSearch.trim().toLocaleLowerCase();
    const villagers = (snapshot?.villagers ?? []).filter((person) =>
      `${person.name} ${person.summary} ${person.tags.join(" ")}`.toLocaleLowerCase().includes(query),
    );
    return (
      <div className={`${ELEMENT_TAG}-root ${ELEMENT_TAG}-directory-root`} data-page="villagers">
        {spriteCharacter ? (
          <SpriteSetupDialog
            characterId={spriteCharacter.id}
            name={spriteCharacter.name}
            portrait={portraits[spriteCharacter.id]}
            onClose={() => setSpriteCharacter(null)}
            onDone={async (revision) => {
              await addVillager(spriteCharacter.id, revision, joiningDrafts.current[spriteCharacter.id]);
              delete joiningDrafts.current[spriteCharacter.id];
              setSpriteCharacter(null);
            }}
          />
        ) : null}
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
          {joining ? (
            <ResidentBackgroundReview
              key={joining.id}
              name={joining.name}
              characterId={joining.id}
              context={joining.context}
              source={{
                setting: snapshot?.settings.setting ?? "",
                premise: snapshot?.settings.foundingDetails ?? "",
                worldOrigin: snapshot?.settings.worldOrigin,
              }}
              initialRequest
              onChange={(context) => {
                joiningDrafts.current[joining.id] = context;
                setJoining((current) => (current?.id === joining.id ? { ...current, context } : current));
              }}
              onCancel={() => setJoining(null)}
              onAccept={async (context) => {
                joiningDrafts.current[joining.id] = context;
                setSpriteCharacter({ id: joining.id, name: joining.name });
                setJoining(null);
              }}
              disabled={busy}
            />
          ) : null}
          <main className={`${ELEMENT_TAG}-directory-paper`} aria-label="Villagers directory">
            <header className={`${ELEMENT_TAG}-directory-head`}>
              <h1>Villagers</h1>
            </header>
            {error ? (
              <p role="alert" className={`${ELEMENT_TAG}-dossier-warning`}>
                {error}
              </p>
            ) : null}
            <div className={`${ELEMENT_TAG}-directory-tools`}>
              <input
                autoComplete="off"
                type="search"
                value={rosterSearch}
                onChange={(event) => setRosterSearch(event.target.value)}
                placeholder="Search villagers…"
                aria-label="Search villagers"
              />
              <button
                type="button"
                className={`${ELEMENT_TAG}-button`}
                onClick={() => setPickerOpen((open) => !open)}
                disabled={busy}
              >
                {pickerOpen ? "Back to villagers" : "Add a villager"}
              </button>
            </div>
            <div
              className={`${ELEMENT_TAG}-directory-reading`}
              ref={content}
              onScroll={() => {
                if (readingPosition && content.current) readingPosition.current = content.current.scrollTop;
              }}
            >
              <div className={`${ELEMENT_TAG}-directory-picker`}>
                {pickerOpen ? (
                  <div className={`${ELEMENT_TAG}-field`}>
                    <input
                      autoComplete="off"
                      className={`${ELEMENT_TAG}-search`}
                      type="search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search by name, note or tag…"
                      aria-label="Search your character library"
                    />
                    {catalog === null ? (
                      <p className={`${ELEMENT_TAG}-empty`} style={{ marginTop: ".625rem" }}>
                        Reading your library…
                      </p>
                    ) : visibleCatalog.length === 0 ? (
                      <p className={`${ELEMENT_TAG}-empty`} style={{ marginTop: ".625rem" }}>
                        No characters match that search.
                      </p>
                    ) : (
                      <div className={`${ELEMENT_TAG}-picker-list`}>
                        {visibleCatalog.map((entry) => (
                          <div
                            key={entry.id}
                            className={`${ELEMENT_TAG}-picker-item`}
                            data-resident={entry.inVillage ? "true" : "false"}
                          >
                            <AvatarFace
                              portrait={portraits[entry.id]}
                              name={entry.name}
                              className={`${ELEMENT_TAG}-avatar`}
                            />
                            <div className={`${ELEMENT_TAG}-picker-text`}>
                              <div className={`${ELEMENT_TAG}-villager-name`}>{entry.name}</div>
                              <div className={`${ELEMENT_TAG}-villager-role`}>
                                {entry.comment || entry.tags.slice(0, 3).join(" · ")}
                              </div>
                              {entry.summary ? <p className={`${ELEMENT_TAG}-tile-summary`}>{entry.summary}</p> : null}
                            </div>
                            <button
                              type="button"
                              className={`${ELEMENT_TAG}-button`}
                              onClick={() =>
                                setJoining({
                                  id: entry.id,
                                  name: entry.name,
                                  context: joiningDrafts.current[entry.id] ?? {
                                    ...DEFAULT_RESIDENT_FOUNDING_CONTEXT,
                                  },
                                })
                              }
                              disabled={busy || entry.inVillage}
                            >
                              {entry.inVillage ? "Lives here" : "Move in"}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
              <div className={`${ELEMENT_TAG}-directory-grid`} hidden={pickerOpen}>
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
                          <span className={`${ELEMENT_TAG}-dossier-tags`}>
                            {person.tags.slice(0, 4).map((tag, index) => (
                              <span key={`${tag}-${index}`}>{tag}</span>
                            ))}
                          </span>
                          {person.missing ? <small>Card missing</small> : null}
                        </span>
                        <span aria-hidden="true">›</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
              {!snapshot ? (
                <p role="status">Reading villagers…</p>
              ) : !snapshot.villagers.length ? (
                <p>No villagers yet.</p>
              ) : !villagers.length ? (
                <p>No villagers match your search.</p>
              ) : null}
            </div>
          </main>
        </PeopleBook>
      </div>
    );
  }
  return null;
}
