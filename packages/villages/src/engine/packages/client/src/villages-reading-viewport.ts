import { useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import { parseVillagesInlineMarkdown, type VillagesMarkdownNode } from "./villages-inline-markdown.js";
import { paginateReading, readingText, sliceReadingNodes, type ReadingPage } from "./villages-reading-pages.js";

const tag = "marinara-capability-villages";

/** Match the Scene's inline elements only while measuring; never retain duplicate hidden prose. */
function measurementNodes(nodes: readonly VillagesMarkdownNode[]): DocumentFragment {
  const fragment = document.createDocumentFragment();
  for (const node of nodes) {
    if (node.kind === "text") {
      fragment.append(document.createTextNode(node.text));
      continue;
    }
    const name =
      node.kind === "code"
        ? "code"
        : node.kind === "link"
          ? "a"
          : (
              {
                bold: "strong",
                "bold-italic": "strong",
                italic: "em",
                underline: "u",
                strikethrough: "del",
                highlight: "mark",
              } as const
            )[node.style];
    const element = document.createElement(name);
    if (node.kind === "styled") {
      if (node.style === "bold-italic") {
        const emphasis = document.createElement("em");
        emphasis.append(measurementNodes(node.children));
        element.append(emphasis);
      } else element.append(measurementNodes(node.children));
      if (node.style === "highlight") element.className = tag + "-chat-md-highlight";
    } else {
      element.textContent = node.text;
      element.className = tag + "-chat-md-" + node.kind;
      if (node.kind === "code") element.dir = "ltr";
      if (node.kind === "link") element.setAttribute("href", node.href);
    }
    fragment.append(element);
  }
  return fragment;
}

/** A second reading cursor only: Scene paragraphs and staging events remain authoritative. */
export function useReadingPages(text: string, readingKey: string, readingRef: RefObject<HTMLDivElement | null>) {
  const nodes = useMemo(() => parseVillagesInlineMarkdown(text), [text]);
  const length = readingText(nodes).length;
  const [layout, setLayout] = useState<{ key: string; pages: ReadingPage[] }>({ key: "", pages: [] });
  const [cursor, setCursor] = useState({ key: "", offset: 0 });
  const anchor = useRef({ key: "", offset: 0 });
  const enterAtEnd = useRef(false);
  const pages = layout.key === readingKey && layout.pages.length ? layout.pages : [{ start: 0, end: length }];
  const offset = cursor.key === readingKey ? cursor.offset : 0;
  const index = Math.max(
    0,
    pages.findIndex((page) => page.end > offset || page.end === length),
  );
  const page = pages[index]!;

  useLayoutEffect(() => {
    const reading = readingRef.current;
    const screen = reading?.closest<HTMLElement>("[data-mobile]");
    const host = reading?.closest<HTMLElement>(tag);
    if (!reading || !screen || !host) return;
    let signature = "";
    let hasMeasured = false;
    let frame = 0;
    let active = true;
    const update = () => {
      if (!active || reading.clientWidth === 0) return;
      // Keyboard movement may constrain scrolling, but never changes page boundaries.
      const keyboard = host.hasAttribute("data-scene-keyboard");
      if (keyboard && hasMeasured) return;
      const mobile = screen.dataset.mobile === "true";
      const sample = reading.querySelector("p");
      if (!sample) return;
      const style = getComputedStyle(sample);
      const lineHeight = Number.parseFloat(style.lineHeight) || 21;
      const canvasHeight =
        Number.parseFloat(host.style.getPropertyValue("--villages-scene-canvas-height")) || host.clientHeight;
      const lines = Math.max(
        1,
        // Leave room for the fixed controls and visible faces in short landscape Scenes.
        Math.min(3, Math.floor((canvasHeight * 0.2) / lineHeight), Math.floor((canvasHeight - 300) / lineHeight)),
      );
      if (mobile) host.style.setProperty("--villages-reading-page-height", `${lines * lineHeight}px`);
      else host.style.removeProperty("--villages-reading-page-height");
      const nextSignature = [mobile, reading.clientWidth, style.font, style.letterSpacing, lines].join(":");
      if (nextSignature === signature) return;
      signature = nextSignature;
      const measure = sample.cloneNode(false) as HTMLParagraphElement;
      measure.classList.add(tag + "-reading-measure");
      measure.setAttribute("aria-hidden", "true");
      measure.style.width = `${reading.clientWidth - parseFloat(getComputedStyle(reading).paddingRight || "0")}px`;
      reading.append(measure);
      let measured: ReadingPage[];
      try {
        measured = mobile
          ? paginateReading(
              nodes,
              (start, end) => {
                // Range.cloneContents drops a shared enclosing <strong>/<em>.
                // Measure the same formatted slice that the page will render.
                measure.replaceChildren(measurementNodes(sliceReadingNodes(nodes, start, end)));
                return measure.getBoundingClientRect().height <= lines * lineHeight + 1;
              },
              /^ {0,3}(?:`{3,}|~{3,})/mu.test(text),
            )
          : [{ start: 0, end: length }];
      } finally {
        measure.remove();
      }
      const previous = anchor.current;
      const desired = previous.key === readingKey ? previous.offset : enterAtEnd.current ? length : 0;
      const chosen = measured.find((item) => item.end > desired) ?? measured.at(-1)!;
      enterAtEnd.current = false;
      hasMeasured = true;
      anchor.current = {
        key: readingKey,
        offset: previous.key === readingKey ? Math.min(desired, length) : chosen.start,
      };
      setCursor(anchor.current);
      setLayout({ key: readingKey, pages: measured });
    };
    const schedule = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(reading);
    observer.observe(host);
    const attributes = new MutationObserver(schedule);
    attributes.observe(host, { attributes: true, attributeFilter: ["data-scene-keyboard"] });
    attributes.observe(screen, { attributes: true, attributeFilter: ["data-mobile"] });
    const fontsChanged = () => {
      signature = "";
      schedule();
    };
    attributes.observe(document.documentElement, { attributes: true, attributeFilter: ["style", "class"] });
    attributes.observe(document.body, { attributes: true, attributeFilter: ["style", "class"] });
    document.fonts?.addEventListener("loadingdone", fontsChanged);
    update();
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      attributes.disconnect();
      document.fonts?.removeEventListener("loadingdone", fontsChanged);
    };
  }, [nodes, text, readingKey, length, readingRef]);

  const move = (direction: -1 | 1): boolean => {
    const next = pages[index + direction];
    if (!next) {
      enterAtEnd.current = direction === -1;
      return false;
    }
    anchor.current = { key: readingKey, offset: next.start };
    setCursor(anchor.current);
    return true;
  };
  return { nodes: sliceReadingNodes(nodes, page.start, page.end), index, count: pages.length, move };
}
