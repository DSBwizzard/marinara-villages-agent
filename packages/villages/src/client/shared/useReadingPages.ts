import { parseVillagesInlineMarkdown, type VillagesMarkdownNode } from "./villages-inline-markdown.js";
import { paginateReading, type ReadingPage, readingText, sliceReadingNodes } from "./villages-reading-pages.js";
import { type RefObject, useLayoutEffect, useMemo, useRef, useState } from "react";

type ReadingCursor = { key: string; offset: number };
type ReadingPosition = {
  checkpoint: RefObject<{ cursor: ReadingCursor }>;
  anchor: RefObject<ReadingCursor>;
  enterAtEnd: RefObject<boolean>;
  reset?: number;
  isFounded?: boolean;
};

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
export function useReadingPages(
  text: string,
  readingKey: string,
  readingRef: RefObject<HTMLDivElement | null>,
  position?: ReadingPosition,
  { reveal = false, paginate = true }: { reveal?: boolean; paginate?: boolean } = {},
) {
  const nodes = useMemo(() => parseVillagesInlineMarkdown(text), [text]);
  const length = readingText(nodes).length;
  const [layout, setLayout] = useState<{ key: string; pages: ReadingPage[] }>({ key: "", pages: [] });
  const localCheckpoint = useRef({ cursor: { key: "", offset: 0 } });
  const localAnchor = useRef({ key: "", offset: 0 });
  const localEnd = useRef(false);
  const {
    checkpoint = localCheckpoint,
    reset,
    isFounded,
    anchor = localAnchor,
    enterAtEnd = localEnd,
  } = position ?? {};
  const [cursor, setCursor] = useState(() => checkpoint.current.cursor);
  const pages = layout.key === readingKey && layout.pages.length ? layout.pages : [{ start: 0, end: length }];
  const offset = cursor.key === readingKey ? cursor.offset : 0;
  const index = Math.max(
    0,
    pages.findIndex((page) => page.end > offset || page.end === length),
  );
  const page = pages[index]!;

  useLayoutEffect(() => {
    if (isFounded === false) setCursor({ key: "", offset: 0 });
  }, [reset, isFounded]);

  useLayoutEffect(() => {
    if (isFounded !== false) checkpoint.current.cursor = cursor;
  }, [checkpoint, cursor, isFounded]);

  useLayoutEffect(() => {
    if (isFounded === false) return;
    const reading = readingRef.current;
    const screen = reading?.closest<HTMLElement>("[data-mobile],.villages-forging-v2");
    const host = reading?.closest<HTMLElement>(tag) ?? screen;
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
      const mobile = screen.dataset.mobile === "true" || screen.matches(".villages-forging-v2[data-mobile=true]");
      const scene = screen.classList.contains(tag + "-room-screen");
      const paged = paginate && (mobile || scene);
      const sample = reading.querySelector("p");
      if (!sample) return;
      const style = getComputedStyle(sample);
      const lineHeight = Number.parseFloat(style.lineHeight) || 21;
      const canvasHeight =
        Number.parseFloat(host.style.getPropertyValue("--villages-scene-canvas-height")) || host.clientHeight;
      const lines = Math.max(
        1,
        // Leave room for the fixed controls and visible faces in short Scene canvases.
        Math.min(
          mobile ? 3 : 5,
          Math.floor((canvasHeight * 0.2) / lineHeight),
          Math.floor((canvasHeight - 300) / lineHeight),
        ),
      );
      if (paged) host.style.setProperty("--villages-reading-page-height", `${lines * lineHeight}px`);
      else host.style.removeProperty("--villages-reading-page-height");
      const nextSignature = [paged, reading.clientWidth, style.font, style.letterSpacing, lines].join(":");
      if (nextSignature === signature) return;
      signature = nextSignature;
      const measure = sample.cloneNode(false) as HTMLParagraphElement;
      measure.classList.add("villages-reading-measure");
      measure.setAttribute("aria-hidden", "true");
      measure.style.width = `${reading.clientWidth - parseFloat(getComputedStyle(reading).paddingRight || "0")}px`;
      reading.append(measure);
      let measured: ReadingPage[];
      try {
        measured = paged
          ? paginateReading(
              nodes,
              (start, end) => {
                // Range.cloneContents drops a shared enclosing <strong>/<em>.
                // Measure the same formatted slice that the page will render.
                measure.replaceChildren(measurementNodes(sliceReadingNodes(nodes, start, end)));
                return measure.getBoundingClientRect().height <= lines * lineHeight + 1;
              },
              !scene && /^ {0,3}(?:`{3,}|~{3,})/mu.test(text),
              scene,
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
  }, [nodes, text, readingKey, length, readingRef, anchor, enterAtEnd, reset, isFounded, paginate]);

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
  const passage = useReplyReveal(
    sliceReadingNodes(nodes, page.start, page.end),
    reveal && index === 0 ? readingKey : undefined,
  );
  return { ...passage, index, count: pages.length, move };
}

/** Reveal the opening passage of a retried reply at Game mode's default pace. */
function useReplyReveal(nodes: VillagesMarkdownNode[], key?: string) {
  const text = key ? readingText(nodes) : "";
  const ends = useMemo(
    () => Array.from(new Intl.Segmenter().segment(text), ({ index, segment }) => index + segment.length),
    [text],
  );
  const [progress, setProgress] = useState<{ key: string; count: number }>();
  const instant = !!key && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const count = progress?.key === key ? (progress?.count ?? 0) : 0;
  const active = !!key && !instant && count < ends.length;
  const finish = () => {
    if (key) setProgress({ key, count: ends.length });
  };
  const length = ends.length;
  useLayoutEffect(() => {
    if (!key || !active) return;
    const started = performance.now();
    let shown = 0;
    let frame: number;
    const reveal = (now: number) => {
      const count = Math.min(length, Math.floor((now - started) / 31));
      if (count !== shown) {
        shown = count;
        setProgress({ key, count });
      }
      if (count < length) frame = requestAnimationFrame(reveal);
    };
    frame = requestAnimationFrame(reveal);
    return () => cancelAnimationFrame(frame);
  }, [key, active, length]);
  return {
    nodes: active ? sliceReadingNodes(nodes, 0, ends[count - 1] ?? 0) : nodes,
    revealing: active,
    finishReveal: finish,
  };
}
