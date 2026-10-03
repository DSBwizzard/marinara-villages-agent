import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { groupSceneAsides, sceneAsideAvailableHeight } from "./villages-aside-layout.js";

const tag = "marinara-capability-villages";

export const SCENE_ASIDE_STYLES = `
/* Override the retired fixed phone offset; asides never size the dialogue dock. */
.${tag}-room-screen .${tag}-chat-vn-asides[data-mobile] {
  bottom: calc(100% + .375rem); z-index: 1; padding: 0; pointer-events: none;
  max-height: min(14rem, var(--villages-aside-available-height, 20cqh));
}
.${tag}-scene-aside-stack { display: flex; flex-direction: column; align-items: flex-end; gap: .375rem; min-height: 0; max-height: inherit; overflow-y: auto; overscroll-behavior: contain; pointer-events: auto; }
.${tag}-room-screen[data-mobile="true"] .${tag}-chat-vn-asides[data-mobile="true"][data-side] {
  position: absolute; bottom: calc(100% + .375rem); left: .375rem; right: .375rem; width: auto; margin: 0;
  display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); grid-template-rows: minmax(0, 1fr);
  gap: 6.5rem; overflow: hidden;
  max-height: min(14rem, var(--villages-aside-available-height, 20cqh));
}
.${tag}-room-screen[data-mobile="true"] .${tag}-scene-aside-stack { max-width: 13rem; width: 100%; }
.${tag}-room-screen[data-mobile="true"] .${tag}-scene-aside-stack[data-side="left"] { grid-column: 1; align-items: flex-start; justify-self: start; }
.${tag}-room-screen[data-mobile="true"] .${tag}-scene-aside-stack[data-side="right"] { grid-column: 2; align-items: flex-end; justify-self: end; }
.${tag}-room-screen[data-mobile="true"] .${tag}-scene-aside-stack .${tag}-chat-vn-aside {
  box-sizing: border-box; width: 100%; max-width: 100%; flex: 0 1 auto; min-height: 2.5rem;
  max-height: max(2.5rem, calc((min(14rem, var(--villages-aside-available-height, 20cqh)) - .375rem * (var(--villages-aside-count, 1) - 1)) / var(--villages-aside-count, 1)));
  padding: .375rem .45rem; gap: .3rem; overflow: hidden;
}
.${tag}-room-screen[data-mobile="true"] .${tag}-chat-vn-aside-face { width: 1.25rem; height: 1.25rem; }
.${tag}-room-screen[data-mobile="true"] .${tag}-chat-vn-aside-column { min-height: 0; align-self: stretch; }
.${tag}-room-screen[data-mobile="true"] .${tag}-chat-vn-aside-head { flex: 0 0 auto; }
.${tag}-room-screen[data-mobile="true"] .${tag}-chat-vn-aside-text {
  font-size: .75rem; line-height: 1.4; min-height: 0; overflow-y: auto; overscroll-behavior: contain;
}
/* Keep the existing hide control and history chevron usable in the central gap. */
.${tag}-room-screen[data-mobile="true"] .${tag}-chat-vn:has(.${tag}-chat-vn-asides) .${tag}-dialogue-hide {
  left: 50%; transform: translateX(-50%); bottom: calc(100% + 1.5rem); width: 6.25rem; padding-inline: .25rem;
}
`;

/** Floating speech stays outside the dock's sizing and follows the visible viewport. */
export function SceneAsides<T extends { speakerId?: string }>({
  asides,
  mobile,
  positions,
  mainSpeakerId,
  desktopSide,
  renderAside,
}: {
  asides: readonly T[];
  mobile: boolean;
  positions: Readonly<Record<string, { x: number }>>;
  mainSpeakerId: string;
  desktopSide: "left" | "right";
  renderAside: (aside: T, index: number) => ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const element = root.current;
    const dock = element?.parentElement;
    const scene = dock?.closest(`.${tag}-chat`);
    if (!element || !dock || !scene) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        const available = sceneAsideAvailableHeight(
          dock.getBoundingClientRect().top,
          scene.getBoundingClientRect().top,
          window.visualViewport?.offsetTop ?? 0,
          fontSize * 3,
        );
        element.style.setProperty("--villages-aside-available-height", `${available}px`);
      });
    };
    const observer = new ResizeObserver(update);
    observer.observe(dock);
    observer.observe(scene);
    window.addEventListener("resize", update);
    window.visualViewport?.addEventListener("resize", update);
    window.visualViewport?.addEventListener("scroll", update);
    // The dock's keyboard transform can change without changing its dimensions.
    const host = scene.closest(tag);
    const mutations = new MutationObserver(update);
    if (host) mutations.observe(host, { attributes: true, attributeFilter: ["style"] });
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      mutations.disconnect();
      window.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("scroll", update);
    };
  }, [mobile]);

  const groups: Record<string, readonly T[]> = mobile
    ? groupSceneAsides(asides, positions, mainSpeakerId)
    : { [desktopSide]: asides };
  return (
    <div ref={root} className={`${tag}-chat-vn-asides`} data-side={desktopSide} data-mobile={mobile} aria-live="polite">
      {Object.entries(groups).map(([side, items]) => (
        <div
          key={side}
          className={`${tag}-scene-aside-stack`}
          data-side={side}
          style={{ "--villages-aside-count": items.length || 1 } as CSSProperties}
        >
          {items.map((aside) => renderAside(aside, asides.indexOf(aside)))}
        </div>
      ))}
    </div>
  );
}
