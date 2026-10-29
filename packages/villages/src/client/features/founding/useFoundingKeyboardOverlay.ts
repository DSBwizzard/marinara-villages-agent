import { useEffect, type RefObject } from "react";

/** Keep mobile forms in their original room while the keyboard covers it. */
export function useFoundingKeyboardOverlay(root: RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    const node = root.current;
    if (!enabled || !node) return;
    const keyboard = (
      navigator as Navigator & {
        virtualKeyboard?: EventTarget & { overlaysContent: boolean; boundingRect: DOMRect };
      }
    ).virtualKeyboard;
    const previousOverlay = keyboard?.overlaysContent;
    const viewport = window.visualViewport;
    const saved = new Map<HTMLElement, string | null>();
    let height = 0;
    let width = 0;
    let covered = false;
    let frame = 0;
    let blurTimer = 0;
    const phone = () => window.matchMedia("(max-width:727px)").matches;
    const editable = (target: EventTarget | null) =>
      target instanceof HTMLElement && target.matches("input:not([type=checkbox]):not([type=file]),textarea");
    const restore = () => {
      for (const [element, style] of saved) {
        if (style === null) element.removeAttribute("style");
        else element.setAttribute("style", style);
        delete element.dataset.foundingKeyboard;
      }
      saved.clear();
      height = 0;
      covered = false;
    };
    const remember = (element: HTMLElement) => {
      if (!saved.has(element)) saved.set(element, element.getAttribute("style"));
    };
    const freeze = () => {
      if (!phone()) return;
      if (!height) {
        height = window.innerHeight;
        width = window.innerWidth;
        remember(node);
        node.style.setProperty("--founding-viewport-height", `${height}px`);
        const room = `${node.getBoundingClientRect().height}px`;
        node.style.height = room;
        node.style.maxHeight = room;
      }
      for (const dialog of node.querySelectorAll<HTMLDialogElement>("dialog[open]")) {
        if (saved.has(dialog)) continue;
        const bounds = dialog.getBoundingClientRect();
        remember(dialog);
        Object.assign(dialog.style, {
          top: `${bounds.top}px`,
          left: `${bounds.left}px`,
          bottom: "auto",
          right: "auto",
          margin: "0",
          height: `${bounds.height}px`,
          maxHeight: `${bounds.height}px`,
          width: `${bounds.width}px`,
        });
      }
    };
    const update = () => {
      if (keyboard) keyboard.overlaysContent = phone() ? true : (previousOverlay ?? false);
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!height) return;
        if (!phone() || width !== window.innerWidth) {
          restore();
          return;
        }
        const bottom = Math.min(
          viewport ? viewport.offsetTop + viewport.height : window.innerHeight,
          keyboard?.boundingRect.height ? keyboard.boundingRect.top : height,
        );
        const inset = Math.max(0, height - bottom);
        if (inset < 1) {
          if (covered || !node.contains(document.activeElement)) restore();
          return;
        }
        covered = true;
        for (const element of saved.keys()) {
          const top = element.getBoundingClientRect().top;
          const end = Math.max(
            element.clientHeight,
            ...[...element.children]
              .filter((child) => child.getClientRects().length && getComputedStyle(child).position !== "fixed")
              .map((child) => child.getBoundingClientRect().bottom - top + element.scrollTop),
          );
          element.dataset.foundingKeyboard = "true";
          element.style.setProperty("--founding-keyboard-inset", `${inset}px`);
          element.style.setProperty("--founding-scroll-end", `${end}px`);
        }
        const target = document.activeElement;
        if (!(target instanceof HTMLElement) || !node.contains(target)) return;
        const scroller = target.closest<HTMLDialogElement>("dialog[open]") ?? node;
        const bounds = target.getBoundingClientRect();
        const top = Math.max(viewport?.offsetTop ?? 0, scroller.getBoundingClientRect().top);
        if (bounds.bottom > bottom - 12) scroller.scrollTop += bounds.bottom - bottom + 12;
        else if (bounds.top < top + 12) scroller.scrollTop -= top + 12 - bounds.top;
      });
    };
    const focus = (event: Event) => {
      if (editable(event.target)) freeze();
      update();
    };
    const blur = () => {
      clearTimeout(blurTimer);
      blurTimer = window.setTimeout(() => {
        if (!covered && !editable(document.activeElement)) restore();
        else update();
      }, 350);
    };
    if (phone() && keyboard) keyboard.overlaysContent = true;
    node.addEventListener("focusin", focus);
    node.addEventListener("pointerdown", focus);
    node.addEventListener("focusout", blur);
    window.addEventListener("resize", update);
    viewport?.addEventListener("resize", update);
    viewport?.addEventListener("scroll", update);
    keyboard?.addEventListener("geometrychange", update);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(blurTimer);
      node.removeEventListener("focusin", focus);
      node.removeEventListener("pointerdown", focus);
      node.removeEventListener("focusout", blur);
      window.removeEventListener("resize", update);
      viewport?.removeEventListener("resize", update);
      viewport?.removeEventListener("scroll", update);
      keyboard?.removeEventListener("geometrychange", update);
      if (keyboard && previousOverlay !== undefined) keyboard.overlaysContent = previousOverlay;
      restore();
    };
  }, [root, enabled]);
}
