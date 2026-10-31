import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ScenePlaybackWindow } from "../../../shared/contracts/scene-playback.js";
import type { SceneView } from "../../../shared/contracts/village.js";
import { messageFrom, request } from "../../shared/api.js";
import type { SceneReadingSession } from "./reading-session.js";

type Entry = "first" | "last" | "bookmark";
/** Historical reads own their lane and can never replace current Scene authority. */
export function useScenePlayback(room: SceneView, scope: string, reading: SceneReadingSession) {
  const authority = useMemo<ScenePlaybackWindow>(
    () => ({ ...room.playback, lines: room.lines, participants: room.participants }),
    [room.playback, room.lines, room.participants],
  );
  const [selected, setSelected] = useState<{ window: ScenePlaybackWindow; entry: Entry; cursor?: string } | null>(
    () => {
      const window = reading.checkpoint.current.window;
      return window?.scope === scope && window.sceneId === room.id ? { window, entry: "bookmark" } : null;
    },
  );
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const lane = useRef({
    generation: 0,
    pending: null as AbortController | null,
    cursor: undefined as string | undefined,
    entry: "bookmark" as Entry,
  });
  const latest = useRef({
    scope,
    sceneId: room.id,
    version: authority.version,
    window: authority,
    founded: reading.isFounded,
  });
  latest.current = {
    scope,
    sceneId: room.id,
    version: authority.version,
    window: authority,
    founded: reading.isFounded,
  };
  const previousAuthority = useRef<ScenePlaybackWindow | null>(null);
  const load = useCallback(
    async (cursor?: string, entry: Entry = "bookmark") => {
      const owner = { scope, sceneId: room.id, version: room.playback.version };
      if (!owner.sceneId || reading.isFounded === false) return;
      const current = lane.current,
        claim = ++current.generation;
      current.pending?.abort();
      const controller = new AbortController();
      Object.assign(current, { pending: controller, cursor, entry });
      setBusy(true);
      setError("");
      try {
        const query = cursor ? "&cursor=" + encodeURIComponent(cursor) : entry === "first" ? "&first=1" : "";
        const result = await request<ScenePlaybackWindow>(
          `/rooms/${encodeURIComponent(owner.sceneId)}/playback?scope=${encodeURIComponent(scope)}${query}`,
          { signal: controller.signal },
        );
        if (
          controller.signal.aborted ||
          current.generation !== claim ||
          latest.current.scope !== scope ||
          latest.current.sceneId !== owner.sceneId ||
          latest.current.version !== owner.version
        )
          return;
        if (result.scope !== scope || result.sceneId !== owner.sceneId || result.version !== owner.version)
          throw Error("The Scene changed. Reopen it to continue reading.");
        setSelected({ window: result, entry, cursor });
      } catch (cause) {
        if (!controller.signal.aborted && current.generation === claim)
          setError(messageFrom(cause, "Could not load this passage."));
      } finally {
        if (current.generation === claim) {
          current.pending = null;
          setBusy(false);
        }
      }
    },
    [scope, room.id, room.playback.version, reading.isFounded],
  );
  const bookmark = reading.checkpoint.current.bookmark;
  const scopedBookmark = bookmark?.scope === scope && bookmark.sceneId === room.id ? bookmark : undefined;
  const synthetic = scopedBookmark?.lineId.startsWith("optimistic:") === true;
  const advanceOwned =
    synthetic && scopedBookmark!.lineId === "optimistic:" + room.latestTurn?.id && room.latestTurn?.published === true;
  const optimistic = room.lines.some((line) => line.id?.startsWith("optimistic:"));
  const chosen =
    selected?.window.scope === scope &&
    selected.window.sceneId === room.id &&
    selected.window.version === authority.version &&
    !selected.window.lines.some(
      (line) => line.id?.startsWith("optimistic:") && !room.lines.some((current) => current.id === line.id),
    ) &&
    !(optimistic && scopedBookmark?.atEnd)
      ? selected
      : null;
  const window = chosen?.window ?? authority;
  const retained = reading.checkpoint.current.window;
  const previous = retained?.scope === scope && retained.sceneId === room.id ? retained : previousAuthority.current;
  const same = previous?.scope === scope && previous.sceneId === room.id;
  const advanced = same && authority.total > previous!.total;
  const readingEnd = !scopedBookmark || scopedBookmark.atEnd || synthetic;
  const target = scopedBookmark?.anchorCursor
    ? window.moments.find((moment) => moment.id === scopedBookmark.lineId)
    : undefined;
  const verifiedBookmark = !!target && target.anchorCursor === scopedBookmark?.anchorCursor;
  const priorAnchor = previous?.moments.at(-1);
  const verifiedAppend =
    previous?.total === 0
      ? (window.moments[0]?.index ?? 0) === 0
      : !!priorAnchor &&
        window.moments.some(
          (moment) => moment.id === priorAnchor.id && moment.anchorCursor === priorAnchor.anchorCursor,
        );
  const acceptedFirst = chosen?.entry === "first" && chosen.cursor === previous?.newerCursor;
  const needFirst = advanced && readingEnd && !verifiedAppend && !acceptedFirst;
  const needBookmark =
    (!chosen || chosen.entry === "bookmark") &&
    !!scopedBookmark?.anchorCursor &&
    !verifiedBookmark &&
    !(advanced && readingEnd && (verifiedAppend || acceptedFirst));
  const intent = useRef<{ cursor?: string; entry: "first" | "bookmark" } | null>(null);
  intent.current = needFirst
    ? { cursor: previous?.newerCursor, entry: "first" }
    : needBookmark
      ? { cursor: scopedBookmark!.anchorCursor, entry: "bookmark" }
      : null;
  // A publication revalidates the saved anchor; ordinary paragraph movement stays local.
  useEffect(() => {
    const current = lane.current;
    current.generation++;
    current.pending?.abort();
    setBusy(false);
    setError("");
    if (latest.current.founded === false) {
      previousAuthority.current = null;
      setSelected(null);
    } else {
      previousAuthority.current = latest.current.window;
      const next = intent.current;
      if (next) void load(next.cursor, next.entry);
    }
    return () => {
      current.generation++;
      current.pending?.abort();
    };
  }, [load]);
  const restoring = needFirst || needBookmark || ((busy || !!error) && lane.current.entry === "first");
  const latestMoment = window.moments.at(-1);
  const atLatest = !latestMoment || latestMoment.index === authority.total - 1;
  const initialEntry = advanced && previous?.total === 0 ? "first" : "authority";
  const advanceFrom =
    scopedBookmark && ((advanced && readingEnd) || advanceOwned)
      ? scopedBookmark.momentIndex - (synthetic && !advanceOwned ? 1 : 0)
      : undefined;
  return {
    window,
    entry: chosen?.entry ?? initialEntry,
    busy,
    error,
    restoring,
    atLatest,
    load,
    advanceOwned,
    advanceFrom,
    retry: () => load(lane.current.cursor, lane.current.entry),
    newest: () => {
      reading.checkpoint.current.bookmark = undefined;
      reading.checkpoint.current.window = authority;
      previousAuthority.current = authority;
      setSelected({ window: { ...authority }, entry: "last" });
      setError("");
    },
  };
}
