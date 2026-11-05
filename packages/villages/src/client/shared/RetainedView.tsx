import { type ReactNode, useLayoutEffect, useRef } from "react";
import { VillageActivity, useVillageActivity } from "./activity.js";

/** Keep local controls and scroll, while hidden views stop observing server work. */
export function RetainedView({ active, children, label }: { active: boolean; children: ReactNode; label?: string }) {
  const activity = useVillageActivity();
  const focus = useRef<HTMLElement | null>(null);
  const wasActive = useRef(active);
  const viewing = active && activity.viewing !== false;
  useLayoutEffect(() => {
    let frame: number | undefined;
    const restore = () => {
      frame = requestAnimationFrame(() => {
        if (focus.current?.checkVisibility()) focus.current.focus({ preventScroll: true });
      });
    };
    if (viewing && !wasActive.current && focus.current) restore();
    wasActive.current = viewing;
    return () => {
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  }, [viewing]);
  return (
    <VillageActivity value={{ ...activity, visible: activity.visible && viewing, viewing }}>
      <div
        hidden={!active}
        inert={!active}
        style={{ display: active ? "contents" : "none" }}
        role={label ? "region" : undefined}
        aria-label={label}
        onFocusCapture={(event) => {
          focus.current = event.target;
        }}
      >
        {children}
      </div>
    </VillageActivity>
  );
}
