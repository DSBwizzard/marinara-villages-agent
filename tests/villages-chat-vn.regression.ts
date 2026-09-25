// Villages — proof for the Visual Novel reader's paragraph splitter.
//
// The rule is the Engine's own (`packages/client/src/lib/roleplay-vn-paragraphs.ts`,
// proven by `scripts/regressions/roleplay-vn-paragraphs.regression.ts`), and this
// file is that case list mirrored and extended. It is mirrored rather than trusted
// because the two are separate copies — a capability package cannot import the
// Engine's own `src` — so agreement is a fact to be proven, not assumed.
//
// What would go wrong without it is quiet: a splitter that split inside a fence
// would draw half a JSON answer on one card and the other half on the next; one
// that returned a trailing empty would let the reader walk onto a blank card; and
// one that counted a whitespace-only paragraph would put a card between the
// villager's two sentences where they only took a breath.
import assert from "node:assert/strict";
import { splitVillagesParagraphs } from "../packages/villages/src/engine/packages/client/src/villages-chat-paragraphs.ts";

// Nothing in, nothing out. A card with no paragraph on it is the empty state and
// not a card holding an empty string.
assert.deepEqual(splitVillagesParagraphs(""), []);
assert.deepEqual(splitVillagesParagraphs("   \n\t\n  "), [], "whitespace alone is not a paragraph");

// One paragraph per blank line, and a wrapped line is STILL one paragraph: the
// villager's own line breaks inside a paragraph are the shape of their answer and
// the card must keep them.
assert.deepEqual(splitVillagesParagraphs("First paragraph\nwrapped.\n\nSecond paragraph.\n\nThird paragraph."), [
  "First paragraph\nwrapped.",
  "Second paragraph.",
  "Third paragraph.",
]);
assert.deepEqual(splitVillagesParagraphs("Only one paragraph."), ["Only one paragraph."]);
assert.deepEqual(
  splitVillagesParagraphs("First\r\n\r\nSecond"),
  ["First", "Second"],
  "a CRLF reply is one reply, not two paragraphs with a stray carriage return on the end",
);

// The edges. Leading and trailing blank lines are air, not paragraphs, and a run
// of blank lines is one break rather than several empty cards.
assert.deepEqual(splitVillagesParagraphs("\n\nFirst\n\n\n\nSecond\n\n"), ["First", "Second"]);
assert.deepEqual(splitVillagesParagraphs("First\n\n\n\n"), ["First"], "the list never ends with nothing on it");

// A fence is one paragraph whatever is inside it. This is the case that matters
// most and would look right if it were wrong: a two-line answer whose middle is a
// code block would read as three answers.
assert.deepEqual(splitVillagesParagraphs("```ts\nconst x = 1;\n\nconst y = 2;\n```\n\nAfter code"), [
  "```ts\nconst x = 1;\n\nconst y = 2;\n```",
  "After code",
]);
assert.deepEqual(
  splitVillagesParagraphs("Before\n\n~~~text\ncode\n\nmore\n~~~"),
  ["Before", "~~~text\ncode\n\nmore\n~~~"],
  "a tilde fence is a fence too, and only a fence of the same character and at least its length closes it",
);
assert.deepEqual(
  splitVillagesParagraphs("```\na\n```\n\nAfter"),
  ["```\na\n```", "After"],
  "a closed fence lets the blank line after it divide again",
);

// The streaming seam is the Engine's, carried so the two splitters stay
// comparable. The village has no partial answer — see `busy` in `ChatPanel` — so
// nothing in the tab passes it, and it is proven here rather than left as a seam
// nobody has run.
assert.deepEqual(splitVillagesParagraphs("First\n\nUnfinished", true), ["First"]);
assert.deepEqual(splitVillagesParagraphs("First\n\nSecond\n\n", true), ["First", "Second"]);
assert.deepEqual(splitVillagesParagraphs("First paragraph", true), []);

console.log("Villages chat Visual Novel paragraph regression passed");
