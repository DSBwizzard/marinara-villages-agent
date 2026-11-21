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
    const set = (name: string, value: number) => {
      const property = `--villages-scene-${name}`;
      const pixels = `${value}px`;
      if (host.style.getPropertyValue(property) !== pixels) host.style.setProperty(property, pixels);
    };
    const restingDock = () => {
      const tag = "marinara-capability-villages";
      if (host.querySelector('[data-mobile="true"]') === null) return;
      const dock = host.querySelector<HTMLElement>(`.${tag}-chat-vn`);
      if (!dock?.offsetHeight) return;
      const field = dock.querySelector<HTMLTextAreaElement>("textarea");
      const input = field?.parentElement;
      let growth = 0;
      if (field && input) {
        const style = getComputedStyle(input);
        const pixels = (value: string) => Number.parseFloat(value) || 0;
        const single =
          Math.max(pixels(getComputedStyle(field).lineHeight), input.querySelector("button")?.offsetHeight ?? 0) +
          pixels(style.paddingTop) +
          pixels(style.paddingBottom) +
          pixels(style.borderTopWidth) +
          pixels(style.borderBottomWidth);
        growth = Math.max(0, input.offsetHeight - single);
      }
      let height = dock.getBoundingClientRect().height - growth;
      const reading = dock.querySelector<HTMLElement>(`.${tag}-chat-vn-reading`);
      const row = reading?.parentElement;
      if (reading && row) {
        // Keep the cast clear of a full page and speaker heading even when the visible message is short.
        const style = getComputedStyle(row);
        const page = Number.parseFloat(getComputedStyle(reading).maxHeight) || reading.offsetHeight;
        const heading = 32 + 0.4 * Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
        height +=
          page +
          heading +
          parseFloat(style.paddingTop) +
          parseFloat(style.paddingBottom) -
          row.getBoundingClientRect().height;
      }
      set("resting-dock-height", height);
    };
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
        const parentBox = parent.getBoundingClientRect();
        const widthChanged = parent.clientWidth !== width;
        if (widthChanged) {
          width = parent.clientWidth;
          canvasHeight = Math.max(0, Math.min(parentBox.height, visibleBottom - parentBox.top));
          canvasTop = host.getBoundingClientRect().top;
          baselineHeight = viewport?.height ?? window.innerHeight;
          keyboardOpen = false;
        }
        // Panning can keep the viewport's bottom unchanged even with a keyboard.
        const occluded = supportsKeyboard && !zoomed && baselineHeight - (viewport?.height ?? window.innerHeight) > 80;
        // Some shells restore their layout a frame after the visual viewport.
        // Keep the existing canvas until that layout catches up on dismissal.
        keyboardOpen =
          (occluded && (focused() || keyboardOpen)) ||
          (keyboardOpen && !zoomed && parentBox.height < canvasHeight - 80);
        if (!keyboardOpen && !zoomed) {
          canvasHeight = Math.max(0, Math.min(parentBox.height, visibleBottom - parentBox.top));
          canvasTop = host.getBoundingClientRect().top;
          baselineHeight = viewport?.height ?? window.innerHeight;
        }
        const top = host.getBoundingClientRect().top;
        set("canvas-height", canvasHeight);
        set("stage-offset", canvasTop - top);
        set("dock-bottom", Math.max(0, top + canvasHeight - visibleBottom));
        set(
          "visible-height",
          Math.max(0, Math.min(top + canvasHeight, visibleBottom) - Math.max(top, viewport?.offsetTop ?? 0)),
        );
        host.toggleAttribute("data-scene-keyboard", keyboardOpen);
        if (!keyboardOpen && !zoomed) restingDock();
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
    observer.observe(host);
    const content = new MutationObserver(update);
    content.observe(host, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-mobile", "style"],
    });
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
      content.disconnect();
      host.removeEventListener("pointerdown", capture, true);
      host.removeEventListener("focusin", capture);
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", orientation);
      window.visualViewport?.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("scroll", update);
      host.removeAttribute("data-scene-play");
      host.removeAttribute("data-scene-keyboard");
      for (const name of ["canvas-height", "dock-bottom", "visible-height", "stage-offset", "resting-dock-height"]) {
        host.style.removeProperty(`--villages-scene-${name}`);
      }
      host.style.removeProperty("--villages-reading-page-height");
    };
  }, [host, active]);
}
