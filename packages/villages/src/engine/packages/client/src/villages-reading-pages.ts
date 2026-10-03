import type { VillagesMarkdownNode } from "./villages-inline-markdown.js";

export type ReadingPage = { start: number; end: number };

export function readingText(nodes: readonly VillagesMarkdownNode[]): string {
  return nodes.map((node) => (node.kind === "styled" ? readingText(node.children) : node.text)).join("");
}

/** Slice rendered text offsets, retaining formatting and safe link targets across pages. */
export function sliceReadingNodes(
  nodes: readonly VillagesMarkdownNode[],
  start: number,
  end: number,
): VillagesMarkdownNode[] {
  let offset = 0;
  return nodes.flatMap((node) => {
    const length = node.kind === "styled" ? readingText(node.children).length : node.text.length;
    const from = Math.max(0, start - offset),
      to = Math.min(length, end - offset);
    offset += length;
    if (from >= to) return [];
    return [
      node.kind === "styled"
        ? { ...node, children: sliceReadingNodes(node.children, from, to) }
        : { ...node, text: node.text.slice(from, to) },
    ];
  });
}

/** Code and links are atomic. Fenced blocks stay on one scrollable paragraph page. */
export function readingBoundaries(nodes: readonly VillagesMarkdownNode[]): number[] {
  const boundaries: number[] = [];
  let offset = 0;
  const visit = (items: readonly VillagesMarkdownNode[]) => {
    for (const node of items) {
      if (node.kind === "styled") {
        visit(node.children);
        continue;
      }
      if (node.kind === "text") {
        for (const match of node.text.matchAll(/\s+/gu)) boundaries.push(offset + match.index! + match[0].length);
      } else if (offset) boundaries.push(offset);
      offset += node.text.length;
      if (node.kind !== "text") boundaries.push(offset);
    }
  };
  visit(nodes);
  boundaries.push(offset);
  return [...new Set(boundaries)].filter((end) => end > 0).sort((a, b) => a - b);
}

/** Browser supplies actual rendered-height measurements; this policy never rewrites text. */
export function paginateReading(
  nodes: readonly VillagesMarkdownNode[],
  fits: (start: number, end: number) => boolean,
  atomic = false,
): ReadingPage[] {
  const text = readingText(nodes);
  if (!text.length || atomic) return [{ start: 0, end: text.length }];
  const boundaries = readingBoundaries(nodes);
  const pages: ReadingPage[] = [];
  let start = 0,
    first = 0;
  while (start < text.length) {
    let low = first,
      high = boundaries.length - 1,
      best = first - 1;
    while (low <= high) {
      const middle = Math.floor((low + high) / 2);
      if (fits(start, boundaries[middle]!)) {
        best = middle;
        low = middle + 1;
      } else high = middle - 1;
    }
    // One oversized word or atomic node remains accessible by scrolling.
    best = Math.max(first, best);
    let chosen = best;
    if (boundaries[best] !== text.length) {
      for (let index = best; index >= first; index--) {
        if (/[.!?…]["'”’)]*\s*$/u.test(text.slice(start, boundaries[index]))) {
          chosen = index;
          break;
        }
      }
    }
    const end = boundaries[chosen]!;
    pages.push({ start, end });
    start = end;
    first = chosen + 1;
  }
  return pages;
}
