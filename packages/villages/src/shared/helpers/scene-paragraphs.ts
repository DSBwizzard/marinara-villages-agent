// Villages — reading a villager's answer a paragraph at a time.
//
// The Engine's own roleplay chats draw a Visual Novel answer as a card with one
// paragraph on it and a pair of arrows to walk the rest, and the rule for where
// one paragraph ends is the Engine's (`packages/client/src/lib/roleplay-vn-paragraphs.ts`):
// a blank line. That is the whole of it, and it is deliberately the whole of it —
// a villager writes prose, the blank line is where they decided to breathe, and
// a card that reflowed their answer to its own idea of a paragraph would be the
// tab editing somebody's speech.
//
// The one thing that is not a blank line is a fenced code block. A fence can
// contain blank lines of its own — a JSON answer, a recipe, a list with air
// around it — and splitting inside one would put half a fence on each of two
// cards, which reads as two broken answers rather than one whole one. So the
// fence is tracked and a blank line inside it is just a line.
//
// This is a copy rather than an import because a capability package cannot reach
// into the Engine's own `src` — see `engine-boundary.json`, whose
// `privateEngineImports` is empty and stays empty. The Engine's own regression
// for its version of this (`scripts/regressions/roleplay-vn-paragraphs.regression.ts`)
// is mirrored case for case in `tests/villages-chat-vn.regression.ts`, so the two
// can be compared rather than trusted.
//
// The last thing in this file is not a copy of anything, and it is here for the
// same reason the splitter is: it is a fact about the shape of a reply rather
// than about a piece of furniture. The card walks a conversation one paragraph at
// a time, and the answer to "which of those paragraphs are steps, and which of
// them ride a step" is the Engine's own answer to how its stage draws a remark
// said out of the side of somebody's mouth — it does not give such a line a place
// in the walk at all, it shows it in a small floating box WITH the line it
// follows. So the walk is built once, here, beside the splitter, and the drawing
// reads it: a list of steps and, for each step, the lines riding it.

/**
 * Split an answer into the paragraphs the Visual Novel card shows one at a time.
 *
 * Blank lines divide; fenced code stays whole; a paragraph that is only
 * whitespace is not a paragraph; and the result never ends with an empty string,
 * so a reader walking the list with an index can never land on nothing.
 *
 * `streaming` is the Engine's own seam and is not used by the village — a
 * villager's answer arrives whole, there is no partial answer to read — but the
 * case is kept so the two splitters stay comparable rule for rule.
 */
export function splitVillagesParagraphs(content: string, streaming = false): string[] {
  const lines = content.replace(/\r\n?/g, "\n").split("\n");
  let fence = "";
  let paragraph: string[] = [];
  const paragraphs: string[] = [];

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]!;
    const marker = /^ {0,3}(`{3,}|~{3,})/.exec(line)?.[1];
    if (marker) {
      if (!fence) fence = marker;
      else if (marker[0] === fence[0] && marker.length >= fence.length) fence = "";
    }
    // The last split item has no terminating newline while a stream is open.
    if (!fence && !line.trim() && (!streaming || index < lines.length - 1)) {
      const completed = paragraph.join("\n").trim();
      if (completed) paragraphs.push(completed);
      paragraph = [];
    } else {
      paragraph.push(line);
    }
  }

  if (!streaming) {
    const tail = paragraph.join("\n").trim();
    if (tail) paragraphs.push(tail);
  }

  return paragraphs;
}

/**
 * What one paragraph of a villager's answer IS: something they said, or the room
 * going on around them.
 *
 * The rule is the CLOSING quote, and it is read off what villagers actually
 * write rather than off what a rule would prefer. A villager's turn is
 * description and speech in one breath — a sentence about the room, then the
 * thing they say, then a sentence about what their hands were doing — and the
 * shape real replies keep to is that the speech is what CLOSES the beat:
 *
 *     The little house past the well sits under a flat grey sky, and its owner is
 *     out front on his haunches beside the open gate, working oil into the latch.
 *
 *     "Afternoon." *He wipes his hands on the rag, unhurried.* "Fair warning on
 *     the gate — this latch only just learned its manners this morning."
 *
 * The first paragraph never reaches a quote, so it is the room describing
 * itself. The second ends on one, so its last words were said out loud.
 *
 * Reading it from the other end is wrong on that same data. A paragraph that
 * OPENS with a quote is only half of them, because the shape above also appears
 * as description-first: "Sneak tips his head back at the flat grey ceiling of
 * cloud, unimpressed. *Sky, mostly. Low sky.*" opens with description and still
 * ends in speech. Testing the first character would draw two identically-shaped
 * paragraphs two different ways inside one reply, which is worse than either
 * rule on its own — and it would make which half of an answer lands in the plate
 * depend on whether the model happened to describe first.
 *
 * The opening-quote test is not decoration either: it is what keeps a possessive
 * plural ("the cats'") or a stray apostrophe from being read as somebody
 * speaking. A paragraph has to both END on a quote and CONTAIN one to be speech.
 * The pair of lists is deliberately not one list — a right single quotation mark
 * closes where a left one opens, and the two are different characters.
 *
 * The ceiling, said out loud rather than hidden: this is a shape question, not a
 * parse. A paragraph that ends on a quote and also carries description inside it
 * is classified whole, so that description rides into the plate with the speech.
 * It is the same thing the card does today, and it is the safe direction to be
 * wrong in — nothing is hidden, the beat is only drawn as the beat its own last
 * word closed.
 *
 * ponytail: the ceiling is one mixed paragraph drawn as speech. The upgrade path
 * is the room's own line types landing as a stored field on each message of a
 * room turn, at which point a shape stops being re-read from the words at all.
 */
export type VillagesParagraphShape = "speech" | "prose";

/** The characters somebody's words can close on. */
const VILLAGES_CLOSING_QUOTES = ['"', "'", "\u201D", "\u2019", "\u00BB", "\u300D"];

/** The characters somebody's words can open on. Not the same list, and that is the point. */
const VILLAGES_OPENING_QUOTES = ['"', "'", "\u201C", "\u2018", "\u00AB", "\u300C"];

/**
 * Whether this paragraph is somebody speaking.
 *
 * Straight, curly, guillemet and corner-bracket quotes are all understood, and
 * an empty or one-character paragraph is prose, which is what makes the reader
 * safe to call on a paragraph it has not looked at yet.
 */
export function classifyVillagesParagraph(paragraph: string): VillagesParagraphShape {
  const words = paragraph.trim();
  if (!VILLAGES_CLOSING_QUOTES.includes(words.slice(-1))) return "prose";
  const opened = VILLAGES_OPENING_QUOTES.some((quote) => words.slice(0, -1).includes(quote));
  return opened ? "speech" : "prose";
}
