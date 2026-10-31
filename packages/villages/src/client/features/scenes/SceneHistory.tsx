import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import type { SceneHistoryPage } from "../../../shared/contracts/scene-history.js";
import { isSceneAside, speechDelivery } from "../../../shared/helpers/scene-speech.js";
import { messageFrom, request } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { renderVillagesMarkdown } from "../../shared/presentation.js";

export function SceneHistory({
  sceneId,
  scope,
  playerName,
  nameStyle,
  speechStyle,
}: {
  sceneId: string;
  scope: string;
  playerName: string;
  nameStyle: (speakerId: string) => CSSProperties | undefined;
  speechStyle: (speakerId: string) => CSSProperties | undefined;
}) {
  const [page, setPage] = useState<SceneHistoryPage | null>(null),
    [busy, setBusy] = useState(true),
    [error, setError] = useState("");
  const lane = useRef({ generation: 0, pending: null as AbortController | null });
  const load = useCallback(
    async (cursor?: string, expectedVersion?: string) => {
      const currentLane = lane.current;
      const claim = ++currentLane.generation;
      currentLane.pending?.abort();
      const controller = new AbortController();
      currentLane.pending = controller;
      setBusy(true);
      setError("");
      try {
        const result = await request<SceneHistoryPage>(
          `/rooms/${encodeURIComponent(sceneId)}/history?scope=${encodeURIComponent(scope)}${cursor ? "&cursor=" + encodeURIComponent(cursor) : ""}`,
          { signal: controller.signal },
        );
        if (controller.signal.aborted || currentLane.generation !== claim) return;
        if (
          result.scope !== scope ||
          result.sceneId !== sceneId ||
          (expectedVersion && result.version !== expectedVersion)
        )
          throw Error("Scene history changed. Refresh it to continue.");
        setPage(result);
      } catch (cause) {
        if (!controller.signal.aborted && currentLane.generation === claim)
          setError(messageFrom(cause, "Could not load Scene history."));
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
    <div aria-busy={busy}>
      <nav className={ELEMENT_TAG + "-scene-history-pages"} aria-label="Scene history pages">
        <button
          type="button"
          className={ELEMENT_TAG + "-chat-vn-button"}
          disabled={busy || !current?.olderCursor}
          onClick={() => void load(current?.olderCursor, current?.version)}
        >
          Older
        </button>
        <button
          type="button"
          className={ELEMENT_TAG + "-chat-vn-button"}
          disabled={busy || !current?.newerCursor}
          onClick={() => void load(current?.newerCursor, current?.version)}
        >
          Newer
        </button>
        <button type="button" className={ELEMENT_TAG + "-chat-vn-button"} disabled={busy} onClick={() => void load()}>
          Refresh
        </button>
        {busy ? <span role="status">Loading…</span> : null}
      </nav>
      {error ? <p role="alert">{error}</p> : null}
      {current?.lines.map((line, index) => (
        <p key={line.id ?? index} className={ELEMENT_TAG + "-chat-vn-text"}>
          <strong
            style={line.role === "assistant" && line.kind !== "narration" ? nameStyle(line.speakerId) : undefined}
          >
            {line.role === "user"
              ? playerName
              : line.kind === "narration" || line.speakerId === "__venue_scene__"
                ? "Narration"
                : line.name || "Resident"}
            {isSceneAside(line) ? " · aside" : ""}
            {speechDelivery(line) === "whisper"
              ? " · whisper"
              : speechDelivery(line) === "shout"
                ? " · shout"
                : ""}: {line.viaDoorway ? "Through the doorway · " : ""}
          </strong>
          <span
            style={line.role === "assistant" && line.kind !== "narration" ? speechStyle(line.speakerId) : undefined}
          >
            {renderVillagesMarkdown(line.content, `history-${line.id ?? index}-`)}
          </span>
        </p>
      ))}
      {!busy && !error && current?.lines.length === 0 ? <p>No history.</p> : null}
    </div>
  );
}
