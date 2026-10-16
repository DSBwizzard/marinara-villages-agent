import { useLayoutEffect, useRef, useState } from "react";

/** Retain committed positions while the panel is away; React state and layout stay local. */
export function useSceneReadingSession(isFounded?: boolean) {
  const checkpoint = useRef({ readStep: 0, cursor: { key: "", offset: 0 } });
  const [reset, setReset] = useState(0);
  const previousReading = useRef<{ roomId: string; stepCount: number } | null>(null);
  const anchor = useRef({ key: "", offset: 0 });
  const enterAtEnd = useRef(false);
  useLayoutEffect(() => {
    if (isFounded !== false) return;
    checkpoint.current = { readStep: 0, cursor: { key: "", offset: 0 } };
    setReset((current) => current + 1);
    previousReading.current = null;
    const cleared = { key: "", offset: 0 };
    anchor.current = cleared;
    enterAtEnd.current = false;
  }, [isFounded]);
  return { checkpoint, reset, isFounded, previousReading, anchor, enterAtEnd };
}
export type SceneReadingSession = ReturnType<typeof useSceneReadingSession>;
