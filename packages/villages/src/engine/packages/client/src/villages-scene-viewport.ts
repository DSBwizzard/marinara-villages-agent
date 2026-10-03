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
      const row = host.querySelector<HTMLElement>(`.${tag}-chat-vn-row`);
      const prose = row?.querySelector<HTMLElement>(`.${tag}-chat-vn-reading p`);
      const dock = host.querySelector<HTMLElement>(`.${tag}-chat-vn`);
      if (!row || !prose || !dock) return;
      const rowStyle = getComputedStyle(row);
      const proseStyle = getComputedStyle(prose);
      const number = (value: string) => Number.parseFloat(value) || 0;
      const line = number(proseStyle.lineHeight) || 21;
      const pageHeight = number(host.style.getPropertyValue("--villages-reading-page-height")) || 3 * line;
      const card = row.parentElement;
      const input = host.querySelector<HTMLElement>(`.${tag}-chat-input`);
      const inputStyle = input ? getComputedStyle(input) : null;
      // Use a three-line page and a one-line draft, never the current text/draft height.
      const composer = inputStyle
        ? 44 +
          number(inputStyle.paddingTop) +
          number(inputStyle.paddingBottom) +
          number(inputStyle.borderTopWidth) +
          number(inputStyle.borderBottomWidth)
        : 46;
      const cardStyle = card ? getComputedStyle(card) : null;
      const dockStyle = getComputedStyle(dock);
      set(
        "resting-dock-height",
        32 +
          number(rowStyle.paddingTop) +
          number(rowStyle.paddingBottom) +
          number(rowStyle.rowGap) +
          pageHeight +
          44 +
          (cardStyle ? number(cardStyle.borderTopWidth) + number(cardStyle.borderBottomWidth) : 2) +
          composer +
          number(dockStyle.rowGap) +
          number(dockStyle.paddingBottom),
      );
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
