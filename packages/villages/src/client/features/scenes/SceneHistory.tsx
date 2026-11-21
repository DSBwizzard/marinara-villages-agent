import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import type { SceneHistoryPage } from "../../../shared/contracts/scene-history.js";
import { isSceneAside, speechDelivery } from "../../../shared/helpers/scene-speech.js";
import { request } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { renderVillagesMarkdown } from "../../shared/presentation.js";
import { SceneErrorChip } from "./scene-errors.js";
import { sceneFailure, type SceneFailure } from "./scene-error-report.js";
import { SceneActionIcon } from "./SceneActionIcon.js";
import { SceneFace } from "./SceneFace.js";
import { ReaderBook } from "../../shared/DialogueReader.js";
import type { Portrait, PortraitMap } from "../../shared/types.js";

export function SceneHistory({
  sceneId,
  scope,
  playerName,
  playerPortrait,
  portraits,
  nameStyle,
  speechStyle,
  onClose,
}: {
  sceneId: string;
  scope: string;
  playerName: string;
  playerPortrait: Portrait | undefined;
  portraits: PortraitMap;
  nameStyle: (speakerId: string) => CSSProperties | undefined;
  speechStyle: (speakerId: string) => CSSProperties | undefined;
  onClose: () => void;
}) {
  const [page, setPage] = useState<SceneHistoryPage | null>(null),
    [busy, setBusy] = useState(true),
    [error, setError] = useState<SceneFailure | null>(null);
  const [errorsOpen, setErrorsOpen] = useState(true);
  const lane = useRef({ generation: 0, pending: null as AbortController | null, path: "" });
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
          throw Error("Scene history changed. Close and reopen Transcript to continue.");
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
  return (
    <div className={ELEMENT_TAG + "-scene-history"} aria-busy={busy}>
      <nav className={ELEMENT_TAG + "-scene-history-pages"} aria-label="Scene history pages">
        <button
          type="button"
          className={ELEMENT_TAG + "-chat-vn-button"}
          aria-label="Older"
          title="Older"
          disabled={busy || !current?.olderCursor}
          onClick={() => void load(current?.olderCursor, current?.version)}
        >
          <SceneActionIcon name="older" />
        </button>
        <button
          type="button"
          className={ELEMENT_TAG + "-chat-vn-button"}
          aria-label="Newer"
          title="Newer"
          disabled={busy || !current?.newerCursor}
          onClick={() => void load(current?.newerCursor, current?.version)}
        >
          <SceneActionIcon name="newer" />
        </button>
        <button
          type="button"
          className={ELEMENT_TAG + "-chat-vn-button " + ELEMENT_TAG + "-scene-history-close"}
          aria-label="Close Transcript"
          title="Close Transcript"
          onClick={onClose}
        >
          <SceneActionIcon name="close" />
        </button>
      </nav>
      <div className={ELEMENT_TAG + "-scene-history-body"} role="region" aria-label="Transcript messages" tabIndex={0}>
        {busy ? <p role="status">Loading…</p> : null}
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
        {current?.lines.map((line, index) =>
          line.presenceChange ? (
            <p key={line.id ?? index} className={ELEMENT_TAG + "-room-star"}>
              {line.content}
            </p>
          ) : (
            <article key={line.id ?? index} className={ELEMENT_TAG + "-scene-history-entry"}>
              <header className="villages-reader-heading">
                {line.role !== "user" && (line.kind === "narration" || line.speakerId === "__venue_scene__") ? (
                  <span className="villages-reader-icon">
                    <ReaderBook />
                  </span>
                ) : (
                  <SceneFace
                    actorId={line.role === "user" ? undefined : line.speakerId}
                    portrait={line.role === "user" ? playerPortrait : portraits[line.speakerId]}
                    name={line.role === "user" ? playerName : line.name || "Resident"}
                    glyph={line.role === "user" ? "person" : "initial"}
                    className={ELEMENT_TAG + "-chat-vn-portrait"}
                  />
                )}
                <strong
                  className="villages-reader-speaker"
                  style={line.role === "assistant" && line.kind !== "narration" ? nameStyle(line.speakerId) : undefined}
                >
                  {line.role === "user"
                    ? playerName
                    : line.kind === "narration" || line.speakerId === "__venue_scene__"
                      ? "Narration"
                      : line.name || "Resident"}
                  {isSceneAside(line) ? " · aside" : ""}
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
                </strong>
              </header>
              <p
                className={ELEMENT_TAG + "-chat-vn-text"}
                style={line.role === "assistant" && line.kind !== "narration" ? speechStyle(line.speakerId) : undefined}
              >
                {renderVillagesMarkdown(line.content, `history-${line.id ?? index}-`)}
              </p>
            </article>
          ),
        )}
        {!busy && !error && current?.lines.length === 0 ? <p>No history.</p> : null}
      </div>
    </div>
  );
}
