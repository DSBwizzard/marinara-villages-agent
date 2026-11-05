import { type ReactNode, useLayoutEffect, useRef } from "react";
import { VillageActivity, useVillageActivity } from "./activity.js";

let activationHeld = false;
let afterActivation: (() => void) | undefined;
function releaseActivation() {
  activationHeld = false;
  window.removeEventListener("keyup", releaseActivation);
  window.removeEventListener("blur", releaseActivation);
  const restore = afterActivation;
  afterActivation = undefined;
  restore?.();
}

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
    if (viewing && !wasActive.current && focus.current) {
      // Finish Enter/Space on the opener before restoring a different control.
      if (activationHeld) afterActivation = restore;
      else restore();
    }
    wasActive.current = viewing;
    return () => {
      if (afterActivation === restore) afterActivation = undefined;
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
        onKeyDownCapture={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          activationHeld = true;
          window.addEventListener("keyup", releaseActivation);
          window.addEventListener("blur", releaseActivation);
        }}
        onFocusCapture={(event) => {
          focus.current = event.target;
        }}
      >
        {children}
      </div>
    </VillageActivity>
  );
}
