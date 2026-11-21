import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import type { SceneHistoryPage } from "../../../shared/contracts/scene-history.js";
import type { RoomLine } from "../../../shared/contracts/village.js";
import { isSceneAside, speechDelivery } from "../../../shared/helpers/scene-speech.js";
import { request } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { renderVillagesMarkdown } from "../../shared/presentation.js";
import { SceneErrorChip } from "./scene-errors.js";
import { sceneFailure, type SceneFailure } from "./scene-error-report.js";
import type { PortraitMap } from "../../shared/types.js";
import { AvatarFace } from "../residents/ResidentPanels.js";

type MessageStyle = {
  playerName: string;
  portraits?: PortraitMap;
  nameStyle: (speakerId: string) => CSSProperties | undefined;
  speechStyle: (speakerId: string) => CSSProperties | undefined;
};

export function SceneMessage({
  line,
  playerName,
  portraits = {},
  nameStyle,
  speechStyle,
}: MessageStyle & { line: RoomLine }) {
  const narration = line.kind === "narration" || line.speakerId === "__venue_scene__";
  const name = line.role === "user" ? playerName : narration ? "Narration" : line.name || "Resident";
  return (
    <article
      className={`${ELEMENT_TAG}-scene-message`}
      data-register={narration ? "narration" : "speech"}
      data-line-id={line.id}
      data-delivery={speechDelivery(line)}
    >
      <div className={`${ELEMENT_TAG}-scene-message-face`} aria-hidden="true">
        {narration ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="4" y="8" width="16" height="13" rx="3" />
            <path d="M12 8V3h3 M8 13h.01 M16 13h.01 M2 12v5 M22 12v5" />
          </svg>
        ) : line.speakerId.startsWith("npc:") ? (
          <img src="/api/capability-packages/villages/assets/npc-silhouette.webp" alt="" data-npc-sprite="" />
        ) : (
          <AvatarFace
            className={`${ELEMENT_TAG}-avatar`}
            portrait={portraits[line.speakerId]}
            name={name}
            glyph={line.role === "user" ? "person" : "initial"}
          />
        )}
      </div>
      <div className={`${ELEMENT_TAG}-scene-message-body`}>
        <p
          className={`${ELEMENT_TAG}-scene-message-name`}
          style={narration || line.role === "user" ? undefined : nameStyle(line.speakerId)}
        >
          {name}
          {isSceneAside(line) ? " · aside" : ""}
          {line.targetId === "player" ? " · to you" : ""}
          {line.viaDoorway ? (
            <span className={`${ELEMENT_TAG}-speech-location`} title="Speaking from another Zone">
              Nearby
            </span>
          ) : speechDelivery(line) === "whisper" ? (
            " · whisper"
          ) : speechDelivery(line) === "shout" ? (
            " · shout"
          ) : (
            ""
          )}
        </p>
        <div
          className={`${ELEMENT_TAG}-chat-vn-text`}
          style={narration || line.role === "user" ? undefined : speechStyle(line.speakerId)}
        >
          {renderVillagesMarkdown(line.content, `message-${line.id ?? "line"}-`)}
        </div>
      </div>
    </article>
  );
}

export function SceneHistory({
  sceneId,
  scope,
  playerName,
  nameStyle,
  speechStyle,
  portraits,
  currentVisitId,
}: {
  sceneId: string;
  scope: string;
  playerName: string;
  nameStyle: (speakerId: string) => CSSProperties | undefined;
  speechStyle: (speakerId: string) => CSSProperties | undefined;
  portraits?: PortraitMap;
  currentVisitId?: string;
}) {
  const [page, setPage] = useState<SceneHistoryPage | null>(null),
    [busy, setBusy] = useState(true),
    [error, setError] = useState<SceneFailure | null>(null);
  const [errorsOpen, setErrorsOpen] = useState(true);
  const lane = useRef({ generation: 0, pending: null as AbortController | null, path: "" });
  const scrollRef = useRef<HTMLDivElement>(null);
  const load = useCallback(
    async (cursor?: string, expectedVersion?: string) => {
      const currentLane = lane.current;
      const claim = ++currentLane.generation;
      currentLane.pending?.abort();
      const controller = new AbortController();
      currentLane.pending = controller;
      setBusy(true);
      setError(null);
      try {
        currentLane.path = `/rooms/${encodeURIComponent(sceneId)}/history?scope=${encodeURIComponent(scope)}${cursor ? "&cursor=" + encodeURIComponent(cursor) : ""}`;
        const result = await request<SceneHistoryPage>(currentLane.path, { signal: controller.signal });
        if (controller.signal.aborted || currentLane.generation !== claim) return;
        if (
          result.scope !== scope ||
          result.sceneId !== sceneId ||
          (expectedVersion && result.version !== expectedVersion)
        )
          throw Error("Scene history changed. Refresh it to continue.");
        setPage(result);
      } catch (cause) {
        if (!controller.signal.aborted && currentLane.generation === claim) {
          setError(sceneFailure(cause, "Could not load Scene history.", "history"));
          setErrorsOpen(true);
        }
      } finally {
        if (currentLane.generation === claim) {
          currentLane.pending = null;
          setBusy(false);
        }
      }
    },
    [scope, sceneId],
  );
  useEffect(() => {
    const currentLane = lane.current;
    setPage(null);
    void load();
    return () => {
      currentLane.generation++;
      currentLane.pending?.abort();
    };
  }, [load]);
  const current = page?.scope === scope && page.sceneId === sceneId ? page : null;
  useLayoutEffect(() => {
    if (!current || !scrollRef.current) return;
    scrollRef.current.scrollTop = current.newerCursor ? 0 : scrollRef.current.scrollHeight;
  }, [current]);
  const visits = current?.visits?.length
    ? current.visits
    : [{ id: sceneId, name: "Scene", at: "", lineIds: current?.lines.map((line) => line.id ?? "") ?? [] }];
  const lines = new Map(current?.lines.map((line) => [line.id, line]));
  return (
    <div className={`${ELEMENT_TAG}-scene-transcript-content`} aria-busy={busy}>
      <nav className={ELEMENT_TAG + "-scene-history-pages"} aria-label="Scene history pages">
        <button
          type="button"
          className={ELEMENT_TAG + "-chat-vn-button"}
          disabled={busy || !current?.olderCursor}
          hidden={!current?.olderCursor}
          onClick={() => void load(current?.olderCursor, current?.version)}
        >
          Older
        </button>
        <button
          type="button"
          className={ELEMENT_TAG + "-chat-vn-button"}
          disabled={busy || !current?.newerCursor}
          hidden={!current?.newerCursor}
          onClick={() => void load(current?.newerCursor, current?.version)}
        >
          Newer
        </button>
        <button
          type="button"
          aria-label="Refresh"
          title="Refresh"
          className={ELEMENT_TAG + "-chat-vn-button"}
          disabled={busy}
          onClick={() => void load()}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M20 4v6h-6 M20 10a8 8 0 1 0 0 5" />
          </svg>
        </button>
        {busy ? <span role="status">Loading…</span> : null}
      </nav>
      {error ? (
        <SceneErrorChip
          items={[
            {
              id: "history",
              title: "Scene history",
              ...error,
            },
          ]}
          open={errorsOpen}
          onOpen={setErrorsOpen}
        />
      ) : null}
      <div
        ref={scrollRef}
        className={`${ELEMENT_TAG}-scene-transcript-body`}
        role="log"
        aria-label="Scene history"
        tabIndex={0}
      >
        {visits.map((visit) => (
          <section
            key={visit.id}
            className={`${ELEMENT_TAG}-scene-history-visit`}
            data-visit-id={visit.id}
            aria-label={visit.name}
          >
            <header>
              <h3>{visit.name}</h3>
              {Number.isFinite(Date.parse(visit.at)) ? (
                <time dateTime={visit.at} title={new Date(visit.at).toLocaleString()}>
                  {new Date(visit.at).toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              ) : null}
              {visit.id === currentVisitId ? (
                <span className={`${ELEMENT_TAG}-scene-visit-current`}>Current</span>
              ) : null}
            </header>
            {visit.lineIds.map((id) => {
              const line = lines.get(id);
              return line ? (
                line.presenceChange || line.id?.startsWith("arrival-") ? (
                  <p key={id} className={`${ELEMENT_TAG}-scene-history-event`}>
                    {renderVillagesMarkdown(line.content, `event-${id}-`)}
                  </p>
                ) : (
                  <SceneMessage
                    key={id}
                    line={line}
                    playerName={playerName}
                    portraits={portraits}
                    nameStyle={nameStyle}
                    speechStyle={speechStyle}
                  />
                )
              ) : null;
            })}
          </section>
        ))}
      </div>
      {!busy && !error && current?.lines.length === 0 ? <p>No history.</p> : null}
    </div>
  );
}
