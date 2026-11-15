import { MAX_SCENE_ASIDES } from "../../../shared/helpers/scene-speech.js";
import { sceneAsideAvailableHeight } from "./villages-aside-layout.js";
import { type ReactNode, useLayoutEffect, useRef } from "react";

const tag = "marinara-capability-villages";

export const SCENE_ASIDE_STYLES = `
.${tag}-chat-vn-card[data-delivery="whisper"] .${tag}-chat-vn-text { font-style: italic; }
.${tag}-chat-vn-aside[data-register="shout"] .${tag}-chat-vn-aside-text { font-weight: 600; }
.${tag}-scene-asides {
  position: absolute; z-index: 4; inset: var(--aside-top, 4rem) .75rem auto;
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-auto-flow: row dense;
  align-items: start; gap: .65rem; padding-bottom: .5rem;
  max-height: var(--aside-height, 40%); overflow: auto; overscroll-behavior: contain;
  box-sizing: border-box; pointer-events: none;
}
.${tag}-scene-asides > .${tag}-aside-slot { min-width: 0; width: min(100%, 22rem); pointer-events: auto; }
.${tag}-scene-asides > [data-side="left"] { grid-column: 1; justify-self: start; }
.${tag}-scene-asides > [data-side="right"] { grid-column: 2; justify-self: end; }
.${tag}-scene-asides .${tag}-chat-vn-aside {
  position: relative; max-width: none; box-sizing: border-box;
  background: var(--marinara-chat-chrome-panel-bg, var(--popover));
}
.${tag}-scene-asides [data-onstage] .${tag}-chat-vn-aside::after {
  content: ""; position: absolute; bottom: -.3rem; left: 16%; width: .55rem; height: .55rem;
  background: inherit; border: inherit; border-width: 0 1px 1px 0; transform: rotate(45deg);
}
.${tag}-scene-asides [data-side="right"] .${tag}-chat-vn-aside::after { left: auto; right: 16%; }
.${tag}-scene-asides .${tag}-chat-vn-aside-head { flex-wrap: wrap; row-gap: .125rem; }
.${tag}-scene-asides :is(.${tag}-chat-vn-aside-name, .${tag}-chat-vn-aside-target) {
  flex: 0 1 auto; white-space: normal; overflow-wrap: anywhere;
}
.${tag}-scene-asides .${tag}-chat-vn-aside-text { overflow-wrap: anywhere; }
.${tag}-scene-asides[data-mobile="true"] { grid-template-columns: minmax(0, 1fr); inset-inline: .5rem; }
.${tag}-scene-asides[data-mobile="true"] > .${tag}-aside-slot { grid-column: 1; width: min(92%, 21rem); }
.${tag}-scene-asides[data-mobile="true"] .${tag}-chat-vn-aside { padding: .4rem .55rem; }
.${tag}-scene-asides[data-mobile="true"] .${tag}-chat-vn-aside-face { width: 1.25rem; height: 1.25rem; }
.${tag}-scene-asides[data-mobile="true"] .${tag}-chat-vn-aside-text { font-size: .75rem; }
${tag}[data-scene-keyboard] .${tag}-scene-asides[data-mobile="true"] { display: none; }
.${tag}-room-screen .${tag}-chat-cast-person { max-height: var(--villages-aside-cast-height, none); }
`;

export function SceneAsides<T extends { speakerId?: string }>({
  asides,
  mobile,
  positions,
  renderAside,
}: {
  asides: readonly T[];
  mobile: boolean;
  positions: Readonly<Record<string, { x: number }>>;
  renderAside: (aside: T, index: number) => ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const element = root.current;
    const scene = element?.closest<HTMLElement>(`.${tag}-chat`);
    const head = scene?.querySelector(`.${tag}-chat-head`);
    const notices = scene?.querySelector(`.${tag}-scene-notice-chips`);
    const dock = scene?.querySelector(`.${tag}-chat-vn`);
    if (!element || !scene || !head || !notices || !dock) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!element.getClientRects().length) return;
        const sceneTop = scene.getBoundingClientRect().top;
        const controlsBottom = Math.max(
          head.getBoundingClientRect().bottom,
          notices.getBoundingClientRect().bottom,
          ...Array.from(
            notices.querySelectorAll(`.${tag}-room-stars, .${tag}-scene-error-panel`),
            (panel) => panel.getBoundingClientRect().bottom,
          ),
        );
        const dockTop = dock.getBoundingClientRect().top;
        const top = Math.max(0, controlsBottom - sceneTop) + 8;
        const available = sceneAsideAvailableHeight(dockTop, sceneTop, window.visualViewport?.offsetTop ?? 0, top);
        element.style.setProperty("--aside-top", `${top}px`);
        element.style.setProperty("--aside-height", `${Math.min(available, Math.max(112, available * 0.6))}px`);
        const clear = Math.max(0, dockTop - element.getBoundingClientRect().bottom - 8);
        scene.style.setProperty("--villages-aside-cast-height", `${clear}px`);
        scene.style.setProperty(
          "--villages-aside-cast-lift",
          `${Math.max(0, scene.getBoundingClientRect().bottom - dockTop)}px`,
        );
      });
    };
    const observer = new ResizeObserver(update);
    for (const node of [element, head, notices, dock, scene]) observer.observe(node);
    const noticeUpdates = new MutationObserver(update);
    noticeUpdates.observe(notices, { childList: true, characterData: true, subtree: true });
    window.visualViewport?.addEventListener("resize", update);
    window.visualViewport?.addEventListener("scroll", update);
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      noticeUpdates.disconnect();
      window.visualViewport?.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("scroll", update);
      scene.style.removeProperty("--villages-aside-cast-height");
      scene.style.removeProperty("--villages-aside-cast-lift");
    };
  }, []);
  return (
    <div
      ref={root}
      className={`${tag}-scene-asides`}
      data-mobile={mobile}
      aria-live="polite"
      tabIndex={0}
      role="region"
      aria-label="Asides"
    >
      {asides.slice(0, MAX_SCENE_ASIDES).map((aside, index) => {
        const x = positions[aside.speakerId ?? ""]?.x;
        return (
          <div
            key={index}
            className={`${tag}-aside-slot`}
            data-side={(x ?? 0.5) < 0.5 ? "left" : "right"}
            data-onstage={x === undefined ? undefined : ""}
          >
            {renderAside(aside, index)}
          </div>
        );
      })}
    </div>
  );
}
