// Villages — proof for the chat reader that draws the Engine's own inline markdown.
//
// The rule set is the Engine's (`packages/client/src/lib/inline-markdown-regex.ts`,
// used by `applyInlineMarkdown` in `packages/client/src/lib/markdown.tsx`), and the
// case list below is that one mirrored: a villager writes *what they do* in one
// asterisk and **what they insist on** in two, and a village has to read like the
// roleplay it is standing next to. It is mirrored rather than trusted because the
// two are separate copies — a capability package cannot import the Engine's own
// `src` — so agreement between them is a fact to be proven, not assumed.
//
// What would go wrong without it is quiet. The order of the rules is the whole
// trick and is not cosmetic: read bold before bold-italic and `***she stops***`
// comes out as an asterisk wrapped in bold. The lookarounds on the two italic
// rules are what keep `snake_case_name` and `**two**` in one piece, and both would
// be "fixed" by somebody tidying the alternation. And the two rules that were
// deliberately NOT carried over — image syntax and the Engine's `card://` and
// `/api/` link targets — are the security-relevant half: this tab draws React
// elements and never HTML strings, and a villager's line must not be able to make
// the player's browser fetch something off the open internet without a click.
//
// The lines at the end are the other half of the proof, and they cannot be a unit
// test: the reading happens in a module, and the DRAWING happens in the entry,
// where a site that was missed looks exactly like a site that was fixed. So the
// entry is read as text and held to it — nothing is interpolated raw any more, and
// every site that shows a villager's words goes through the one function.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseVillagesInlineMarkdown,
  type VillagesMarkdownNode,
  type VillagesMarkdownStyle,
} from "../packages/villages/src/engine/packages/client/src/villages-inline-markdown.ts";

const text = (value: string): VillagesMarkdownNode => ({ kind: "text", text: value });
const code = (value: string): VillagesMarkdownNode => ({ kind: "code", text: value });
const link = (value: string, href: string): VillagesMarkdownNode => ({ kind: "link", text: value, href });
const mark = (style: VillagesMarkdownStyle, ...children: VillagesMarkdownNode[]): VillagesMarkdownNode => ({
  kind: "styled",
  style,
  children,
});

/** Every character of a line with the markup taken off it, for the "nothing is lost" cases. */
function flatten(nodes: readonly VillagesMarkdownNode[]): string {
  return nodes
    .map((node) => {
      if (node.kind === "text" || node.kind === "code") return node.text;
      if (node.kind === "link") return node.text;
      return flatten(node.children);
    })
    .join("");
}

const read = parseVillagesInlineMarkdown;

// Nothing in, nothing out — and a line with no markdown on it is ONE node holding
// it, which is the case this is called in by far the most often.
assert.deepEqual(read(""), []);
assert.deepEqual(read("Nothing here."), [text("Nothing here.")], "a plain line is one piece of text");

// The six marks, one case each. These are the shapes the player sends a villager
// and expects to see come back drawn.
assert.deepEqual(read("*waves*"), [mark("italic", text("waves"))]);
assert.deepEqual(read("_an aside_"), [mark("italic", text("an aside"))], "an underscore is an italic too");
assert.deepEqual(read("**A hard bargain.**"), [mark("bold", text("A hard bargain."))]);
assert.deepEqual(read("__This is underlined__"), [mark("underline", text("This is underlined"))]);
assert.deepEqual(read("~~which was never true~~"), [mark("strikethrough", text("which was never true"))]);
assert.deepEqual(
  read("==this bit=="),
  [mark("highlight", text("this bit"))],
  "the engine's highlight, not a second bold",
);

// The ordering proof. Three asterisks is bold-italic, and it is one node rather
// than the asterisk-inside-bold the reader would produce if the bold rule were
// tried first — which is exactly the kind of silent wrongness this file is for.
assert.deepEqual(read("***She stops.***"), [mark("bold-italic", text("She stops."))]);

// Prose around the marks, which is how these actually arrive: one phrase inside a
// sentence, and the sentence's own punctuation left alone.
assert.deepEqual(read("She nods. *Then smiles.*"), [text("She nods. "), mark("italic", text("Then smiles."))]);
assert.equal(flatten(read("She nods. *Then smiles.*")), "She nods. Then smiles.", "the asterisks go, the words stay");

// Nesting, and the reason the reader recurses: a highlight inside an action is
// still a highlight, and the run around it is not flattened into it.
assert.deepEqual(read("*a ==b== c*"), [mark("italic", text("a "), mark("highlight", text("b")), text(" c"))]);
assert.deepEqual(read("*a ~~b ==c== d~~ e*"), [
  mark("italic", text("a "), mark("strikethrough", text("b "), mark("highlight", text("c")), text(" d")), text(" e")),
]);

// The two lookarounds, which are the rules most likely to be "simplified" away and
// the two that hurt most when they are. A villager naming a column, a variable or
// a wiki page would otherwise have a word in the middle of it turned italic, and
// two asterisks that were meant as four would be read as one nest of two.
assert.deepEqual(read("the snake_case_name column"), [text("the snake_case_name column")]);
assert.deepEqual(read("call build_report_now first"), [text("call build_report_now first")]);
assert.deepEqual(read("**two**"), [mark("bold", text("two"))], "a bold pair is not also an italic pair");

// Unterminated and ambiguous input is text. A model that opens a mark and forgets
// to close it must not have the rest of the line eaten.
assert.deepEqual(read("**unclosed"), [text("**unclosed")]);
assert.deepEqual(read("*also unclosed"), [text("*also unclosed")]);
assert.deepEqual(read("a lone * in a sentence"), [text("a lone * in a sentence")]);

// A wall of asterisks, which really is markup: seven stars at a time are
// bold-italic holding one star, so sixty-four of them are nine of those and one
// star left over. Pinning that shape is how this proves the reading terminates
// rather than recursing — it is a statement about the answer, not a preference
// about it, and the count is what the Engine's own reader produces for the same
// line.
const starWall = "*".repeat(64);
const tenStars = "*".repeat(10);
assert.equal(read(starWall).length, 10, "a wall of asterisks terminates");
assert.equal(flatten(read(starWall)), tenStars, "and every star survives it as content or as a delimiter");
assert.equal(flatten(read(`${starWall} text ${starWall}`)), `${tenStars} text ${tenStars}`);

// A backtick span is literal all the way through: the Engine refuses to read
// markdown inside one, and a villager explaining a syntax has to be able to show
// the syntax. Nothing inside is a mark and nothing inside can be a link.
assert.deepEqual(read("Run `npm run build` first"), [text("Run "), code("npm run build"), text(" first")]);
assert.deepEqual(read("`**not bold**`"), [code("**not bold**")]);
assert.deepEqual(read("`*not* _italic_`"), [code("*not* _italic_")]);
assert.equal(flatten(read("`**not bold**`")), "**not bold**", "a code span keeps the characters it is showing");

// The escape, which is how a villager writes about a mark without making one.
assert.deepEqual(read("\\*not italic\\*"), [text("*not italic*")]);
assert.deepEqual(read("a literal \\_underscore\\_"), [text("a literal _underscore_")]);
assert.deepEqual(read("\\`not code\\`"), [text("`not code`")]);
assert.deepEqual(
  read("\\*eight\\* sides of \\*six\\*"),
  [text("*eight* sides of *six*")],
  "an escape and the words around it are one run of text, not one node each",
);

// Links: the text is a label rather than prose, so a mark inside one is not read —
// and the target has to be the web. These three are the reason the Engine's own
// `card://` and `/api/` targets were dropped: this tab has no card assets, and a
// line a model wrote must not be able to point the player's browser at the Engine
// its own self with a link that reads like something else.
assert.deepEqual(read("[the map](https://example.test/map)"), [link("the map", "https://example.test/map")]);
assert.deepEqual(read("See [the map](https://example.test/map)."), [
  text("See "),
  link("the map", "https://example.test/map"),
  text("."),
]);
assert.deepEqual(read("[x](javascript:alert(1))"), [text("[x](javascript:alert(1))")]);
assert.deepEqual(read("[x](card://asset-1)"), [text("[x](card://asset-1)")]);
assert.deepEqual(read("[x](/api/capability-packages)"), [text("[x](/api/capability-packages)")]);

// Image syntax is deliberately not carried. The Engine draws an `<img>` here; a
// village has no card assets, and an image is a fetch the player did not ask for,
// so what is left of it is the label as a link the player has to click — never a
// node kind that loads anything by itself.
assert.deepEqual(read("![alt](https://example.test/a.png)"), [text("!"), link("alt", "https://example.test/a.png")]);

/*
  The wiring, read out of the entry as text.

  The classes are one template literal built from the tag name, so the sheet is
  read with the tag substituted — which is the text the browser is finally handed
  — and a name is matched with its closing backtick so that one class cannot be
  read as another it is a prefix of.
*/
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const entrySource = readFileSync(
  resolve(repoRoot, "packages/villages/src/engine/packages/client/src/villages-package-entry.tsx"),
  "utf8",
);
const tagName = /const ELEMENT_TAG = "([^"]+)";/u.exec(entrySource)?.[1];
assert.ok(tagName, "The client must still name the custom element it registers itself as");
const css = entrySource.split("${ELEMENT_TAG}").join(tagName);

// The two that have no other spelling anywhere in the file, asserted as absent —
// a line drawn raw again is the whole failure this block exists to catch.
for (const raw of ["{currentParagraph}", "{ruling.reason}"]) {
  assert.equal(entrySource.includes(raw), false, `${raw} is drawn raw again — it has to go through the reader`);
}

const countIn = (needle: string) => entrySource.split(needle).length - 1;

assert.equal(countIn("renderVillagesMarkdown(message.content"), 0, "private transcripts are gone");
assert.equal(
  countIn("renderVillagesMarkdown(line.content"),
  3,
  "venue history, archive, and memory evidence render Markdown",
);
assert.equal(countIn("renderVillagesMarkdown(step.text"), 2, "venue narration and speech render Markdown");
assert.equal(countIn("renderVillagesMarkdown(aside.text"), 1, "venue asides render Markdown");
assert.equal(countIn("{line.content}"), 0, "venue lines are not drawn raw");
for (const name of ["chat-md-code", "chat-md-link", "chat-md-highlight"]) {
  assert.ok(css.includes(`${tagName}-${name}`), `.${tagName}-${name} is not in the sheet`);
}
