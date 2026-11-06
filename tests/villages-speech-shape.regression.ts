import { clientImplementation } from "./client-source.js";
// Paragraph splitting and speech classification used by Scene playback.
import assert from "node:assert/strict";
import {
  classifyVillagesParagraph,
  splitVillagesParagraphs,
} from "../packages/villages/src/shared/helpers/scene-paragraphs.ts";

const shape = classifyVillagesParagraph;

// Two real paragraphs, verbatim from a stored transcript. The first is the room
// describing itself and the second is the villager speaking; they arrive in the
// same reply and they are the reason the rule is the closing quote.
const DESCRIPTION =
  "The little house past the well sits under a flat grey sky, and its owner is out front on his haunches beside the open gate, working oil into the latch with a rag. His ears tip your way first, then the narrow amber eyes — the look of somebody who's already counted your buttons.";
const SPEECH =
  '"Afternoon." *He wipes his hands on the rag, unhurried.* "Fair warning on the gate — this latch only just learned its manners this morning, and I\'d hate for it to forget them on your account."';

assert.equal(shape(DESCRIPTION), "prose", "description is the room, and it reaches no quote");
assert.equal(shape(SPEECH), "speech", "the speech closes the beat, so the beat is speech");

// The order the rule is NOT allowed to be read in. Description first, speech last
// — this is the same reply's next turn, and it must come out the same way the
// speech above does, or one answer is drawn two ways.
const DESCRIPTION_THEN_SPEECH =
  '"Sneak tips his head back at the flat grey ceiling of cloud, unimpressed." "Sky, mostly. Low sky."';
assert.equal(shape(DESCRIPTION_THEN_SPEECH), "speech", "description first, speech last, is still speech");
assert.equal(
  shape(`"${DESCRIPTION}"`),
  "speech",
  "the same words with quotes on the ends are speech, because the rule is the ends and not the content",
);

// Nothing, and almost nothing. A beat the reader has not looked at yet is prose,
// so an index off the end of a list can never be drawn as somebody speaking.
assert.equal(shape(""), "prose");
assert.equal(shape("   \n\t "), "prose");
assert.equal(shape('"'), "prose", "one quote character is not a line of anybody's speech");

// A quote that merely turns up inside a sentence is not a way of talking, and
// this is the case the rule was chosen to get right in both directions: the
// sentence ends on its own full stop, so the paragraph is the room talking ABOUT
// something somebody said.
assert.equal(shape('She said "hello" to me.'), "prose");
assert.equal(shape('"Hello," she said, and left.'), "prose", "a line that ends in narration ends in narration");

// Every quote a villager might actually type. Straight, curly, guillemet and
// corner bracket, doubled and single — a village whose reply is `“Evening.”`
// must not read as description just because the model used the pretty quotes.
assert.equal(shape('"Evening."'), "speech");
assert.equal(shape("\u201CEvening.\u201D"), "speech");
assert.equal(shape("\u2018Evening.\u2019"), "speech");
assert.equal(shape("\u00ABBonsoir.\u00BB"), "speech");
assert.equal(shape("\u300C\u3053\u3093\u3070\u3093\u306F\u300D"), "speech");

// The other half of the pair of lists. A right single quotation mark closes and a
// left one opens, so a curly quote in the middle of a sentence only counts as
// speech if it was opened. The second case is a mark with nothing to pair with —
// it closes a quote that was never opened, which is a typo and not somebody
// talking, and without the opening test it would be drawn as dialogue.
assert.equal(shape("He said it was \u201Cfine\u201D"), "speech");
assert.equal(shape("It was fine\u201D"), "prose", "a closing mark with no opening mark is not a speaker");

// English's most common punctuation mark, and the reason the opening test exists
// at all. Neither of these is dialogue and neither of them has an opening quote,
// so neither can be read as somebody speaking.
assert.equal(shape("the cats' food bowl was already empty"), "prose");
assert.equal(shape("the cats'"), "prose", "a possessive plural is one mark and no opener");

// An unterminated mark is text, exactly as the inline reader treats it: a model
// that opens a quote and forgets to close it must not have the beat read as
// speech on the strength of the opening character alone.
assert.equal(shape('"unclosed and still going'), "prose");
assert.equal(shape('unclosed and still going"'), "prose", "a stray closing mark opens nothing");

// Fences, wraps and edge whitespace. A code block is a paragraph the splitter
// keeps whole and the classifier has no opinion about, so it is description; and
// a paragraph the splitter has already trimmed is classified the same way either
// side of the trim, because a trailing newline is not a way of speaking.
assert.equal(shape("```ts\nconst x = 1;\n```"), "prose");
assert.equal(shape('  "Evening."  '), "speech", "the splitter trims, so the classifier trims");
assert.equal(shape('"Evening."\n'), "speech");
assert.equal(shape('He looks up.\n"And there you are."'), "speech", "a wrapped paragraph is classified once, whole");

/*
  The walk, held to its length.

  One described beat and one spoken beat are one beat each, so classifying a
  turn's paragraphs cannot change how many of them there are. This is what the
  counter and the arrows count, so this is the assertion that the release did not
  move the player's place in a conversation.
*/
const turn = `${DESCRIPTION}\n\n${SPEECH}`;
const beats = splitVillagesParagraphs(turn);
assert.equal(beats.length, 2, "two paragraphs, before and after classifying them");
assert.deepEqual(beats.map(shape), ["prose", "speech"], "one description, one speech, in the order written");

// An all-description reply is the state the card has never had to draw before:
// every beat is the room's, and the plate has no line of anybody's speech in it
// at all. It must be a list of beats rather than an empty reading, because the
// card with nothing on it is the mid-draw state and reads as a broken answer.
const described = splitVillagesParagraphs(`${DESCRIPTION}\n\n${DESCRIPTION}`);
assert.equal(described.length, 2);
assert.deepEqual(described.map(shape), ["prose", "prose"], "a reply with no speech in it is all description");

// Whitespace-only paragraphs are not beats and cannot become beats: the splitter
// drops them before the classifier is ever asked, so padding a reply with blank
// lines cannot lengthen the walk.
assert.equal(splitVillagesParagraphs(`${DESCRIPTION}\n\n \n\n${SPEECH}`).length, 2);

/*
  The wiring, read out of the entry as text.

  The classes are one template literal built from the tag name, so the sheet is
  read with the tag substituted — which is the text the browser is finally handed
  — and a name is matched with its closing brace or backtick so that one class
  cannot be read as another it is a prefix of.
*/
const entrySource = clientImplementation();
const tagName = /const ELEMENT_TAG = "([^"]+)";/u.exec(entrySource)?.[1];
assert.ok(tagName);
const css = entrySource.split("${ELEMENT_TAG}").join(tagName);
const countIn = (needle: string) => entrySource.split(needle).length - 1;

assert.equal(countIn('type VillageBeatRegister = "speech" | "narration";'), 1);
assert.equal(countIn("classifyVillagesParagraph(step.text)"), 1, "venue fallback classification is singular");
assert.equal(countIn("data-register={register}"), 1, "venue card uses one register");
assert.equal(countIn('data-register="narration"'), 1, "venue narration has its own register");
assert.equal(countIn("<SceneAsides"), 1, "one aside presentation belongs to Visit");
assert.ok(css.includes(`.${tagName}-chat-vn-aside[data-register="whisper"]`));
assert.ok(entrySource.includes("renderVillagesMarkdown(aside.text"));
assert.ok(entrySource.includes("drawVillagesNodes(readingPages.nodes"));
assert.equal(countIn("ChatPanel"), 0, "the private stage is gone");
