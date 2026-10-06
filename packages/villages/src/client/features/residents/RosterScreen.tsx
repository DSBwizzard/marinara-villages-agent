import { ELEMENT_TAG } from "../../shared/constants.js";
import type { RosterScreenController } from "./screen-contracts.js";
import { AvatarFace } from "./ResidentPanels.js";

export function RosterScreen({ controller }: { controller: RosterScreenController }) {
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
        <main className={`${ELEMENT_TAG}-directory-paper`} aria-label="Villagers directory">
          <header className={`${ELEMENT_TAG}-directory-head`}>
            <h1>Villagers</h1>
            <button type="button" onClick={() => setMenuPage("index")}>
              Back to menu
            </button>
          </header>
          {error ? (
            <p role="alert" className={`${ELEMENT_TAG}-dossier-warning`}>
              {error}
            </p>
          ) : null}
          <div className={`${ELEMENT_TAG}-directory-tools`}>
            <input
              type="search"
              value={rosterSearch}
              onChange={(event) => setRosterSearch(event.target.value)}
              placeholder="Search villagers by name, summary or tag…"
              aria-label="Search villagers"
            />
          </div>
          <div className={`${ELEMENT_TAG}-directory-picker`}>
            {" "}
            <p className={`${ELEMENT_TAG}-empty`}>
              Characters from your library live here. Moving someone out forgets nothing about the character card
              itself.
            </p>
            <div className={`${ELEMENT_TAG}-row`}>
              <button
                type="button"
                className={`${ELEMENT_TAG}-button`}
                onClick={() => setPickerOpen((open) => !open)}
                disabled={busy}
              >
                {pickerOpen ? "Close the list" : "Add a villager"}
              </button>
            </div>
            {pickerOpen ? (
              <div className={`${ELEMENT_TAG}-field`}>
                <input
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
                          onClick={() => void addVillager(entry.id)}
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
          <div className={`${ELEMENT_TAG}-directory-grid`}>
            {villagers.map((person) => (
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
                <strong>{person.name}</strong>
                <small>{person.summary || "No character summary recorded."}</small>
                <span className={`${ELEMENT_TAG}-dossier-tags`}>
                  {person.tags.slice(0, 4).map((tag, index) => (
                    <span key={`${tag}-${index}`}>{tag}</span>
                  ))}
                </span>
                {person.missing ? <small>Card missing</small> : null}
              </button>
            ))}
          </div>
          {!snapshot ? (
            <p role="status">Reading villagers…</p>
          ) : !snapshot.villagers.length ? (
            <p>Nobody lives here yet. Add a villager from your character library.</p>
          ) : !villagers.length ? (
            <p>No villagers match your search.</p>
          ) : null}
        </main>
      </div>
    );
  }
  return null;
}
