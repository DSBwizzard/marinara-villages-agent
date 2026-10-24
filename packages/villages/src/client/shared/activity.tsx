import { createContext, useContext, useEffect, useEffectEvent, useState } from "react";

export const VillageActivity = createContext({ visible: true, backgroundRevision: "" });
export const useVillageActivity = () => useContext(VillageActivity);

/** Returning focus retries a missed read without keeping an idle timer alive. */
export function useFocusRevision(enabled: boolean): number {
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const update = () => setRevision((value) => value + 1);
    window.addEventListener("focus", update);
    return () => window.removeEventListener("focus", update);
  }, [enabled]);
  return revision;
}

function capabilityVisible(element: HTMLElement) {
  return !document.hidden && element.checkVisibility({ checkVisibilityCSS: true });
}

/** Engine can hide the capability without hiding the browser document. */
export function useCapabilityVisibility(element: HTMLElement): boolean {
  const [visible, setVisible] = useState(() => capabilityVisible(element));
  useEffect(() => {
    const update = () => setVisible(capabilityVisible(element));
    update();
    document.addEventListener("visibilitychange", update);
    window.addEventListener("focus", update);
    const observer = new IntersectionObserver(update);
    observer.observe(element);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
      window.removeEventListener("focus", update);
    };
  }, [element]);
  return visible;
}

/** A pending task gets one read at a time; leaving its view aborts the local read. */
export function useVisibleInterval(
  work: (signal: AbortSignal) => unknown | Promise<unknown>,
  delay: number | null,
  enabled = true,
) {
  const { visible } = useVillageActivity();
  const run = useEffectEvent(work);
  useEffect(() => {
    if (!visible || !enabled || delay === null) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    const next = () => {
      timer = setTimeout(async () => {
        try {
          await run(controller.signal);
        } catch {
          // The owning view reports its read failure; retrying a read never repeats its action.
        } finally {
          if (!controller.signal.aborted) next();
        }
      }, delay);
    };
    next();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [visible, enabled, delay]);
}

/** Cancels local observation on navigation; the server retains the admitted attempt. */
export function useActivitySignal(enabled: boolean): AbortSignal {
  const [signal, setSignal] = useState(() => AbortSignal.abort());
  useEffect(() => {
    const controller = new AbortController();
    if (!enabled) controller.abort();
    setSignal(controller.signal);
    return () => controller.abort();
  }, [enabled]);
  return signal;
}
