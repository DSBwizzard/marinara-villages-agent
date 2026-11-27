import type { RoomLine } from "../../../shared/contracts/village.js";
import { splitVillagesParagraphs } from "../../../shared/helpers/scene-paragraphs.js";
import { parseVillagesInlineMarkdown, type VillagesMarkdownNode } from "../../shared/villages-inline-markdown.js";
import { readingText, sliceReadingNodes } from "../../shared/villages-reading-pages.js";

const quotePairs = new Map([
  ['"', '"'],
  ["“", "”"],
  ["«", "»"],
  ["「", "」"],
  ["『", "』"],
]);

export function isAttributedSceneDialogue(line?: Pick<RoomLine, "role" | "kind" | "speakerId">) {
  return (
    line?.role === "assistant" &&
    line.speakerId !== "__venue_scene__" &&
    (line.kind === "dialogue" || line.kind === "side" || line.kind === "whisper")
  );
}

/** Style directions inside the already-visible line without creating another Scene line or audience. */
export function sceneDialogueNodes(source: string): VillagesMarkdownNode[] {
  const paragraphs = splitVillagesParagraphs(source);
  if (paragraphs.length < 2) return dialogueParagraphNodes(source);

  const original = parseVillagesInlineMarkdown(source);
  const normalized = source.replace(/\r\n?/gu, "\n");
  const formatted: VillagesMarkdownNode[] = [];
  let offset = 0;
  for (const paragraph of paragraphs) {
    const start = normalized.indexOf(paragraph, offset);
    if (start < 0) return original;
    formatted.push(
      ...parseVillagesInlineMarkdown(normalized.slice(offset, start)),
      ...dialogueParagraphNodes(paragraph),
    );
    offset = start + paragraph.length;
  }
  formatted.push(...parseVillagesInlineMarkdown(normalized.slice(offset)));
  return formatted.some((node) => node.kind === "styled" && node.style === "scene-direction") &&
    readingText(formatted) === readingText(original).replace(/\r\n?/gu, "\n")
    ? formatted
    : original;
}

function dialogueParagraphNodes(source: string): VillagesMarkdownNode[] {
  const nodes = parseVillagesInlineMarkdown(source);
  const text = readingText(nodes);
  const first = text.length - text.trimStart().length;
  const last = text.trimEnd().length - 1;
  const open = text[first];
  const close = quotePairs.get(open);
  if (!close || text[last] !== close || source.includes("\\" + close)) return nodes;
  if (!source.trimStart().startsWith(open) || !source.trimEnd().endsWith(close)) return nodes;

  const quotesInLiteral = (items: readonly VillagesMarkdownNode[]): boolean =>
    items.some((node) =>
      node.kind === "styled"
        ? quotesInLiteral(node.children)
        : node.kind !== "text" && (node.text.includes(open) || node.text.includes(close)),
    );
  if (quotesInLiteral(nodes)) return nodes;

  const directions: { start: number; end: number }[] = [];
  for (let start = first; start < last;) {
    const end = text.indexOf(close, start + 1);
    if (end <= start + 1 || !text.slice(start + 1, end).trim()) return nodes;
    if (open !== close && text.slice(start + 1, end).includes(open)) return nodes;
    if (end === last) break;

    const next = text.indexOf(open, end + 1);
    if (next < 0 || next === last) return nodes;
    const gap = text.slice(end + 1, next);
    if (gap.includes(close)) return nodes;
    const direction = gap.trim();
    if (direction) {
      if (!/[.!?…。！？]$/u.test(direction)) return nodes;
      if (open === '"' && (!/^\s/u.test(gap) || !/\s$/u.test(gap))) return nodes;
      directions.push({ start: end + 1, end: next });
    }
    start = next;
  }
  if (!directions.length) return nodes;

  const styled: VillagesMarkdownNode[] = [];
  let offset = 0;
  for (const { start, end } of directions) {
    styled.push(...sliceReadingNodes(nodes, offset, start), {
      kind: "styled",
      style: "scene-direction",
      children: sliceReadingNodes(nodes, start, end),
    });
    offset = end;
  }
  return [...styled, ...sliceReadingNodes(nodes, offset, text.length)];
}
