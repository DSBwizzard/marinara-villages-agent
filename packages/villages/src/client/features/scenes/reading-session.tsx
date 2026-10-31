import { useLayoutEffect, useRef, useState } from "react";
import type { ScenePlaybackWindow } from "../../../shared/contracts/scene-playback.js";

export type SceneReadingBookmark = {
  scope: string;
  sceneId: string;
  lineId: string;
  paragraph: number;
  momentIndex: number;
  anchorCursor?: string;
  atEnd: boolean;
};
type ReadingCheckpoint = {
  readStep: number;
  cursor: { key: string; offset: number };
  bookmark?: SceneReadingBookmark;
  window?: ScenePlaybackWindow;
};

/** Retain committed positions while the panel is away; React state and layout stay local. */
export function useSceneReadingSession(isFounded?: boolean) {
  const checkpoint = useRef<ReadingCheckpoint>({ readStep: 0, cursor: { key: "", offset: 0 } });
  const [reset, setReset] = useState(0);
  const anchor = useRef({ key: "", offset: 0 });
  const enterAtEnd = useRef(false);
  useLayoutEffect(() => {
    if (isFounded !== false) return;
    checkpoint.current = { readStep: 0, cursor: { key: "", offset: 0 } };
    setReset((current) => current + 1);
    const cleared = { key: "", offset: 0 };
    anchor.current = cleared;
    enterAtEnd.current = false;
  }, [isFounded]);
  return { checkpoint, reset, isFounded, anchor, enterAtEnd };
}
export type SceneReadingSession = ReturnType<typeof useSceneReadingSession>;
