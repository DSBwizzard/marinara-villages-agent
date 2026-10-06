import { ELEMENT_TAG } from "../../shared/constants.js";
import {
  playerDisplayName,
  renderVillagesMarkdown,
  stampTime,
  villagesSpeechPaintStyle,
} from "../../shared/presentation.js";
import type { MenuScreenController } from "../settings/screen-contracts.js";

export function renderSceneArchivePage(
  ports: Pick<
    MenuScreenController,
    | "archiveError"
    | "archiveOffset"
    | "archiveTotal"
    | "archiveVenueId"
    | "archiveVillagerId"
    | "busy"
    | "deleteArchivedVisits"
    | "openArchivedVisit"
    | "openVisit"
    | "setArchiveOffset"
    | "setArchiveVenueId"
    | "setArchiveVillagerId"
    | "setOpenArchivedVisit"
    | "snapshot"
    | "venueVisits"
  >,
) {
  const {
    archiveError,
    archiveOffset,
    archiveTotal,
    archiveVenueId,
    archiveVillagerId,
    busy,
    deleteArchivedVisits,
    openArchivedVisit,
    openVisit,
    setArchiveOffset,
    setArchiveVenueId,
    setArchiveVillagerId,
    setOpenArchivedVisit,
    snapshot,
    venueVisits,
  } = ports;
  return (
    <div className={`${ELEMENT_TAG}-overlay`}>
      <div className={`${ELEMENT_TAG}-overlay-head`}>
        <h2 className={`${ELEMENT_TAG}-panel-title`}>Scenes</h2>
      </div>
      <p className={`${ELEMENT_TAG}-empty`}>
        Completed Scenes are kept here word for word. Filter by place or resident; each Scene has one shared record,
        including who heard each line. The village uses only the separately distilled memories.
      </p>
      <div className={`${ELEMENT_TAG}-row`}>
        <select
          aria-label="Filter Scenes by venue"
          value={archiveVenueId}
          onChange={(event) => {
            setArchiveVenueId(event.target.value);
            setArchiveOffset(0);
            setOpenArchivedVisit(null);
          }}
        >
          <option value="">All venues</option>
          {(snapshot?.settings.venues ?? []).map((venue) => (
            <option key={venue.id} value={venue.id}>
              {venue.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter Scenes by resident"
          value={archiveVillagerId}
          onChange={(event) => {
            setArchiveVillagerId(event.target.value);
            setArchiveOffset(0);
            setOpenArchivedVisit(null);
          }}
        >
          <option value="">All residents</option>
          {(snapshot?.villagers ?? []).map((villager) => (
            <option key={villager.characterId} value={villager.characterId}>
              {villager.name}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        className={`${ELEMENT_TAG}-button`}
        disabled={busy || archiveTotal === 0}
        onClick={() => void deleteArchivedVisits()}
      >
        Delete all completed logs
      </button>
      {archiveError ? (
        <p className={`${ELEMENT_TAG}-error`} role="alert">
          {archiveError}
        </p>
      ) : null}
      {venueVisits === null ? (
        <p className={`${ELEMENT_TAG}-empty`}>Reading Scenes…</p>
      ) : venueVisits.length === 0 ? (
        <p className={`${ELEMENT_TAG}-empty`}>No completed Scenes match these filters.</p>
      ) : (
        venueVisits.map((visit) => (
          <section key={visit.id}>
            <h3 className={`${ELEMENT_TAG}-story-day`}>
              {visit.placeName} · {stampTime(visit.startedAt)}
            </h3>
            <p className={`${ELEMENT_TAG}-story-meta`}>
              {visit.participants.map((person) => person.name).join(", ")} · {visit.lineCount} lines
              {visit.endReason === "inactivity" ? " · Interrupted: Inactivity" : ""}
            </p>
            <div className={`${ELEMENT_TAG}-row`}>
              <button type="button" className={`${ELEMENT_TAG}-button`} onClick={() => void openVisit(visit.id)}>
                {openArchivedVisit?.id === visit.id ? "Refresh transcript" : "Open transcript"}
              </button>

              <button
                type="button"
                className={`${ELEMENT_TAG}-button`}
                disabled={busy}
                onClick={() => void deleteArchivedVisits(visit.id)}
              >
                Delete log
              </button>
            </div>
            {openArchivedVisit?.id === visit.id ? (
              <>
                <ul className={`${ELEMENT_TAG}-story`}>
                  {openArchivedVisit.lines.map((line, index) => (
                    <li key={`${visit.id}:${index}`} className={`${ELEMENT_TAG}-story-row`}>
                      <span>
                        <span className={`${ELEMENT_TAG}-story-meta`}>
                          <span
                            style={
                              snapshot?.settings.characterSpeechColors &&
                              line.role === "assistant" &&
                              line.kind !== "narration"
                                ? villagesSpeechPaintStyle(
                                    snapshot.villagers.find((villager) => villager.characterId === line.speakerId)
                                      ?.nameColor,
                                  )
                                : undefined
                            }
                          >
                            {line.name || playerDisplayName(snapshot)}
                          </span>
                          {" · "}
                          {stampTime(line.at)}
                        </span>
                        <span
                          style={
                            snapshot?.settings.characterSpeechColors &&
                            line.role === "assistant" &&
                            line.kind !== "narration"
                              ? villagesSpeechPaintStyle(
                                  snapshot.villagers.find((villager) => villager.characterId === line.speakerId)
                                    ?.dialogueColor,
                                )
                              : undefined
                          }
                        >
                          {renderVillagesMarkdown(line.content, `venue-${visit.id}-${index}-`)}
                        </span>
                        <span className={`${ELEMENT_TAG}-story-meta`}>
                          Heard by:{" "}
                          {line.heardBy
                            ?.map(
                              (id) =>
                                openArchivedVisit.participants.find((person) => person.characterId === id)?.name ?? id,
                            )
                            .join(", ") || "no one"}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
                {(openArchivedVisit.submissions ?? []).some((submission) => submission.recollections?.length) ? (
                  <details className={`${ELEMENT_TAG}-agenda-notes`}>
                    <summary>Captured recollections and evidence</summary>
                    <ul className={`${ELEMENT_TAG}-story`}>
                      {(openArchivedVisit.submissions ?? []).flatMap((submission) =>
                        (submission.recollections ?? []).map((recollection) => (
                          <li key={recollection.id} className={`${ELEMENT_TAG}-wish-card`}>
                            <p className={`${ELEMENT_TAG}-wish-text`}>{recollection.text}</p>
                            <p className={`${ELEMENT_TAG}-wish-meta`}>
                              {`Subjects: ${recollection.subjectCharacterIds.join(", ") || "none"} · Known by: ${recollection.knownByCharacterIds.join(", ")}`}
                            </p>
                            <p className={`${ELEMENT_TAG}-wish-meta`}>
                              {`Evidence: ${recollection.lineIds.join(", ")}`}
                            </p>
                          </li>
                        )),
                      )}
                    </ul>
                  </details>
                ) : null}
              </>
            ) : null}
          </section>
        ))
      )}
      {archiveTotal > 20 ? (
        <div className={`${ELEMENT_TAG}-row`}>
          <button
            type="button"
            className={`${ELEMENT_TAG}-button`}
            disabled={archiveOffset === 0}
            onClick={() => {
              setArchiveOffset(Math.max(0, archiveOffset - 20));
              setOpenArchivedVisit(null);
            }}
          >
            Previous
          </button>
          <span>
            {archiveOffset + 1}–{Math.min(archiveTotal, archiveOffset + 20)} of {archiveTotal}
          </span>
          <button
            type="button"
            className={`${ELEMENT_TAG}-button`}
            disabled={archiveOffset + 20 >= archiveTotal}
            onClick={() => {
              setArchiveOffset(archiveOffset + 20);
              setOpenArchivedVisit(null);
            }}
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
