import type { VillagesWalkBeat } from "../../../shared/contracts/scene-beat.js";
import type { VillagesWalkAside } from "../../shared/types.js";

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

/**
 * One line of a villager's answer, as the SERVER read the register of it.
 *
 * This mirrors `VillagesTurnBeat` in the package's own turn reader, field for
 * field, and it is mirrored rather than imported for the reason every other
 * shared shape in this tab is: the two ends are two bundles and the server half
 * is not on the client's side of the boundary at all. It is a type and not a
 * value, so a drift between the two is a compile error on one side rather than a
 * runtime surprise on both.
 *
 * `untagged` is an ordinary paragraph and it is the overwhelming majority of
 * them. `side` is a remark said aloud but not offered to whoever is in front of
 * them and `whisper` is something said to one listener, and neither of those is
 * distinguishable from speech by any punctuation — which is why the villager
 * marks them and why nothing here may guess at them.
 */

/** What the card walks: its steps, and the lines riding each of them. */
export type VillagesWalk = {
  /** The steps, in the order they are read, one paragraph each. Never empty unless the reply was. */
  paragraphs: string[];
  /** Riding lines, one list per step and the same length as `paragraphs`. */
  asides: VillagesWalkAside[][];
  expressions: Array<string | null>;
};

/**
 * Build the walk from a stored message: which of its paragraphs are steps, and
 * which of its lines ride them.
 *
 * The split happens in here rather than at the call site, and that is the whole
 * of why the two lists can be compared at all. `beats` is one entry per
 * paragraph or the entire list is dropped, so the only place the comparison can
 * be made honestly is where the paragraphs were just made — and the paragraphs
 * the card walks are this module's, not the server's, because the server's
 * reader and this one are two implementations of a blank line.
 *
 * A tagged line is not a step. It is a remark said to the side of the
 * conversation, and the Engine's own stage draws exactly that — not as a place
 * the reader stops, but as a small floating box shown WITH the line it follows.
 * So a tagged paragraph is lifted out of the steps and attached to the step it
 * came after, which is what makes an aside and the words it belongs to arrive on
 * a card at the same time instead of taking turns on it.
 *
 * A reply that OPENS with a side line has nothing before it to ride, so its
 * riding lines go on the first step that follows. That is the same thing the
 * Engine does with a box that has nothing above it yet, and it is the safe
 * direction rather than the tidy one: the alternative is an aside drawn with
 * nothing on the card, which reads as a message of its own.
 *
 * Two answers fall back to ordinary prose and neither loses a word, which is the
 * safe direction in both cases. A message whose beats and whose paragraphs do not
 * line up is one whose two readers disagreed, so no register can be trusted and
 * the answer is walked the way it was walked before any of this existed. And a
 * reply that is nothing but asides would lift to zero steps, leaving them nothing
 * to be beside — so the whole reply stays on the card, which is the drawing that
 * shows the player every word they wrote.
 *
 * ponytail: a tagged line is attached to the step it followed, so a run of them
 * between two paragraphs lands on ONE card rather than being spread over the
 * sentences each was written after. The ceiling is an answer that puts three
 * asides in three different places and expects the reader to stop three times;
 * the upgrade path is the server saying which paragraph a line belongs to
 * instead of this inferring it from order.
 */
export function villagesWalk(content: string, beats: readonly VillagesWalkBeat[] | null): VillagesWalk {
  const paragraphs = splitVillagesParagraphs(content);
  const plain = (): VillagesWalk => ({
    paragraphs,
    asides: paragraphs.map(() => []),
    expressions: paragraphs.map(() => null),
  });
  if (!beats || beats.length !== paragraphs.length) return plain();

  const steps: string[] = [];
  const asides: VillagesWalkAside[][] = [];
  const expressions: Array<string | null> = [];
  /**
   * Riding lines with no step in front of them yet.
   *
   * This can only fill before the FIRST step, because a step is where it is
   * emptied and every step after the first has a step in front of it. So a reply
   * that opens with a side line has its riding lines waiting in here when the
   * first step arrives, and a reply that is nothing but asides has them in here
   * when the loop ends — which is the case the guard after the loop is for.
   */
  let waiting: VillagesWalkAside[] = [];

  for (let index = 0; index < paragraphs.length; index += 1) {
    const beat = beats[index]!;
    if (beat.kind === "untagged") {
      steps.push(paragraphs[index]!);
      asides.push(waiting);
      expressions.push(beat.expression ?? null);
      waiting = [];
      continue;
    }
    const aside: VillagesWalkAside = {
      register: beat.kind === "whisper" ? "whisper" : "side",
      text: beat.text,
      ...(beat.target ? { target: beat.target } : {}),
    };
    // Attached BACKWARDS, to the step it followed, and that is the Engine's own
    // arrangement rather than a preference: its side remarks are drawn with the
    // dialogue they follow, so the box floats while the line it was said after is
    // still on the card. `steps.length` is the question being asked — is there
    // anything in front of this line yet — and a line with nothing in front of it
    // waits for the step that comes next instead.
    if (steps.length) asides[asides.length - 1]!.push(aside);
    else waiting.push(aside);
  }

  if (steps.length === 0) return plain();
  return { paragraphs: steps, asides, expressions };
}
