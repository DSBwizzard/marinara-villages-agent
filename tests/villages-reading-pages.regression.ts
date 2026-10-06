import assert from "node:assert/strict";
import { parseVillagesInlineMarkdown } from "../packages/villages/src/client/shared/villages-inline-markdown.js";
import {
  paginateReading,
  readingText,
  sliceReadingNodes,
} from "../packages/villages/src/client/features/scenes/villages-reading-pages.js";

const source =
  "First sentence. **A longer bold sentence with *nested emphasis* inside it continues for several words.** Last sentence.";
const nodes = parseVillagesInlineMarkdown(source);
const text = readingText(nodes);
const pages = paginateReading(nodes, (start, end) => end - start <= 45);
assert.ok(pages.length > 2);
assert.equal(readingText(sliceReadingNodes(nodes, pages[0].start, pages[0].end)), "First sentence. ");
assert.equal(pages.map((page) => readingText(sliceReadingNodes(nodes, page.start, page.end))).join(""), text);
assert.ok(
  pages
    .slice(1, -1)
    .every((page) => sliceReadingNodes(nodes, page.start, page.end).some((node) => node.kind === "styled")),
);
assert.ok(pages.every((page) => page.end > page.start));
assert.equal(pages[0].start, 0);
assert.equal(pages.at(-1)!.end, text.length);
for (let index = 1; index < pages.length; index++) assert.equal(pages[index].start, pages[index - 1].end);

for (const source of [
  "",
  "OneWordWithoutBreaks".repeat(20),
  "你好世界。مرحبا بالعالم 👨‍👩‍👧‍👦 café! ".repeat(5),
  "Line one\nLine two\nLine three",
]) {
  const nodes = parseVillagesInlineMarkdown(source);
  const pages = paginateReading(nodes, (start, end) => end - start <= 20);
  assert.equal(
    pages.map((page) => readingText(sliceReadingNodes(nodes, page.start, page.end))).join(""),
    readingText(nodes),
  );
}
const code = parseVillagesInlineMarkdown("Before `a very long indivisible code expression` after.");
const codePages = paginateReading(code, (start, end) => end - start <= 12);
assert.equal(
  codePages.flatMap((page) => sliceReadingNodes(code, page.start, page.end)).filter((node) => node.kind === "code")
    .length,
  1,
);
const link = parseVillagesInlineMarkdown("Read [a long descriptive label](https://example.com) now.");
const linkPages = paginateReading(link, (start, end) => end - start <= 12);
assert.equal(
  linkPages.flatMap((page) => sliceReadingNodes(link, page.start, page.end)).filter((node) => node.kind === "link")
    .length,
  1,
);
assert.deepEqual(
  paginateReading(nodes, () => false, true),
  [{ start: 0, end: text.length }],
);
console.log("villages-reading-pages: exact text, formatting, sentence/word boundaries and atomic content passed");
