import { useLayoutEffect } from "react";

/** The Scene canvas survives keyboard-driven resizing of the Engine shell. */
export function useSceneViewport(host: HTMLElement, active: boolean): void {
  useLayoutEffect(() => {
    if (!active) return;
    host.setAttribute("data-scene-play", "");
    const parent = host.parentElement;
    if (!parent) return () => host.removeAttribute("data-scene-play");
    let canvasHeight = parent.getBoundingClientRect().height;
    let canvasTop = host.getBoundingClientRect().top;
    let width = parent.clientWidth;
    let baselineHeight = window.visualViewport?.height ?? window.innerHeight;
    let keyboardOpen = false;
    const supportsKeyboard = navigator.maxTouchPoints > 0 || window.matchMedia("(any-pointer: coarse)").matches;
    let frame = 0;
    const focused = () => {
      const target = document.activeElement;
      return (
        target instanceof HTMLElement &&
        host.contains(target) &&
        target.matches("textarea, input, [contenteditable='true']")
      );
    };
    const update = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        frame = 0;
        const viewport = window.visualViewport;
        const zoomed = viewport && Math.abs(viewport.scale - 1) > 0.05;
        const visibleBottom = viewport ? viewport.offsetTop + viewport.height : window.innerHeight;
        const widthChanged = parent.clientWidth !== width;
        if (widthChanged) {
          width = parent.clientWidth;
          canvasHeight = parent.getBoundingClientRect().height;
          canvasTop = host.getBoundingClientRect().top;
          baselineHeight = viewport?.height ?? window.innerHeight;
          keyboardOpen = false;
        }
        // Panning can keep the viewport's bottom unchanged even with a keyboard.
        const occluded = supportsKeyboard && !zoomed && baselineHeight - (viewport?.height ?? window.innerHeight) > 80;
        keyboardOpen = occluded && (focused() || keyboardOpen);
        if (!keyboardOpen && !zoomed) {
          canvasHeight = parent.getBoundingClientRect().height;
          canvasTop = host.getBoundingClientRect().top;
          baselineHeight = viewport?.height ?? window.innerHeight;
        }
        const top = host.getBoundingClientRect().top;
        host.style.setProperty("--villages-scene-canvas-height", `${canvasHeight}px`);
        host.style.setProperty("--villages-scene-stage-offset", `${canvasTop - top}px`);
        host.style.setProperty("--villages-scene-dock-bottom", `${Math.max(0, top + canvasHeight - visibleBottom)}px`);
        host.style.setProperty(
          "--villages-scene-visible-height",
          `${Math.max(0, visibleBottom - Math.max(top, viewport?.offsetTop ?? 0))}px`,
        );
        host.toggleAttribute("data-scene-keyboard", keyboardOpen);
      });
    };
    const capture = (event: Event) => {
      if (!host.contains(event.target as Node) || keyboardOpen) return;
      const height = window.visualViewport?.height ?? window.innerHeight;
      if (baselineHeight - height <= 80) {
        canvasHeight = parent.getBoundingClientRect().height;
        baselineHeight = height;
      }
      update();
    };
    const orientation = () => {
      // A physical rotation starts a new canvas; it is not a keyboard animation.
      width = -1;
      update();
    };
    const observer = new ResizeObserver(update);
    observer.observe(parent);
    host.addEventListener("pointerdown", capture, true);
    host.addEventListener("focusin", capture);
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", orientation);
    window.visualViewport?.addEventListener("resize", update);
    window.visualViewport?.addEventListener("scroll", update);
    update();
    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      host.removeEventListener("pointerdown", capture, true);
      host.removeEventListener("focusin", capture);
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", orientation);
      window.visualViewport?.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("scroll", update);
      host.removeAttribute("data-scene-play");
      host.removeAttribute("data-scene-keyboard");
      for (const name of ["canvas-height", "dock-bottom", "visible-height", "stage-offset"]) {
        host.style.removeProperty(`--villages-scene-${name}`);
      }
    };
  }, [host, active]);
}
