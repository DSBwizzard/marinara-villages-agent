import { clientImplementation } from "./client-source.js";
// Villages — proof for the reader that tells what a villager SAID from the room
// going on around them.
//
// A villager's turn is two things at once, and the card has always drawn both in
// the same place: a dialogue box with a face, a name, and the whole paragraph
// under it. The card is a dialogue box, so it should keep the dialogue, and the
// description between the speeches should not be standing under somebody's name
// as though they had said it. That is what `classifyVillagesParagraph` is for,
// and the rule it uses is the CLOSING quote.
//
// The description is drawn the way Game Mode draws it, and the first version of
// this release was wrong about which half of that mattered. Game Mode separates
// its two registers by ATTRIBUTION: a speaking character gets a face and a name,
// and the room describing itself gets the word NARRATION over a bubble with no
// face on it. The mistake was to keep the room's bubble inside the speaking
// register — a description under the villager's face, under the villager's name —
// which reads as that villager having said it quietly. So the head of the card is
// asserted here as a PAIR: a face and a name for a spoken beat, the word NARRATION
// and no face for a described one, and never one of each.
//
// That pairing is also why the classifier is asked once, in `beatRegister`, instead
// of at the three places the register is used. Two calls are two chances for the
// head and the body to disagree, and a beat drawn with half of each is exactly
// the state this release exists to remove.
//
// The card draws TWO registers, and the other two registers a villager can produce
// do not belong to the card at all. A `[side]` line is a remark said aloud but not
// offered to whoever is in front of them; a `[whisper:Listener]` line is something
// said to one person alone. Neither is distinguishable from ordinary speech by its
// punctuation, which is why the villager tags them and why the client must not
// guess at them.
//
// 0.4.58 is where those two left the card. They are DRAWN as the Engine's second
// surface — a small floating bubble, justified to the end of the window, shown with
// the dialogue it follows — and the first version of this put that bubble inside
// the plate, in the paragraph's own place, which meant an aside did not sit beside
// the message it belonged to: it REPLACED it, so the player had to step the arrows
// to find the line the aside was said after. So the walk here is the assertion that
// matters. `villagesWalk` lifts every tagged line OUT of the steps and attaches it
// to the step it followed, the card draws the step it was given exactly as it would
// have drawn it untagged, and the bubbles are drawn above the card by a sibling of
// it. That is what makes an aside and its message simultaneous, and it is asserted
// in three ways: the walk is exercised directly, the two lists are asserted to be
// one list per step, and the markup is asserted to sit outside the card.
//
// A whisper nobody can see the target of is an ordinary line with a symbol in front
// of it, which is why the target is asserted and not just the word.
//
// The rule is read off real replies rather than off a preference, and the first
// cases below are two real paragraphs from a real transcript, kept verbatim so
// that the thing this file is calibrating against cannot quietly change. A
// villager describes, then speaks, and the speech is what closes the beat — so a
// paragraph that ends on a quote is speech and one that never reaches a quote is
// the room describing itself.
//
// The rule that this one replaced is the reason the middle block of cases exists.
// Classifying on the FIRST character reads the same transcript two different
// ways: one reply in it opens on description and still ends in speech, so half of
// it would land in the plate and the other half in a bubble, for no reason the
// player could ever see. Both orders are asserted below so that "read it from the
// other end" cannot be reintroduced as a tidy-up.
//
// What would go wrong without the closing-quote test on the other side is quieter
// and worse: an apostrophe is the most common punctuation mark in English. A
// possessive plural would become somebody speaking, and the player would watch a
// line about the cats' food bowl turn into dialogue.
//
// The block at the end is the other half of the proof, and it cannot be a unit
// test: the classification happens in a module, and the DRAWING happens in the
// entry, where a beat that was drawn the old way looks exactly like a beat that
// was drawn the new way. So the entry is read as text and held to three rules —
// that the draw goes through the classifier, that the walk is built in one place
// and the beats are spent there, and that the bubbles are drawn BEFORE the card in
// the source, which is what proves they are not inside it. The last one is worth
// stating: a thing nested inside another has to open after it, so an aside whose
// markup precedes the card's cannot be a child of the card, and this file asserts
// the order rather than trusting the nesting.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  classifyVillagesParagraph,
  splitVillagesParagraphs,
  villagesWalk,
  type VillagesWalkBeat,
} from "../packages/villages/src/client/features/scenes/villages-chat-paragraphs.ts";

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
  THE WALK, which is this release, and it is unit-testable where the drawing is
  not.

  A tagged line is not a step. The Engine does not give a side remark a place in
  the reading — it shows it in a small floating box WITH the dialogue it follows —
  so `villagesWalk` takes every tagged line out of the steps and attaches it to the
  step it came after. Everything below is one of the consequences of that, and each
  of them is a way the previous release was wrong.
*/
const beat = (kind: VillagesWalkBeat["kind"], text: string, target?: string): VillagesWalkBeat =>
  target === undefined ? { kind, text } : { kind, text, target };

// No beats at all is the ordinary case and the state of everything written before
// the server could read a tag. The paragraphs come back untouched and every step
// has an empty riding list rather than no list, so the drawing never has to ask
// whether the field is there.
const noBeats = villagesWalk(turn, null);
assert.deepEqual(
  noBeats.paragraphs,
  splitVillagesParagraphs(turn),
  "no beats leaves the steps exactly as they were split",
);
assert.deepEqual(noBeats.asides, [[], []]);
assert.deepEqual(
  villagesWalk(turn, []),
  noBeats,
  "and an empty beat list is a length that does not line up, so it falls back too",
);

// All-untagged is the same thing stated the other way: a list that arrives and
// names every line ordinary is not an aside list with gaps in it.
assert.deepEqual(
  villagesWalk(turn, [beat("untagged", DESCRIPTION), beat("untagged", SPEECH)]),
  noBeats,
  "a turn whose every beat is untagged is a turn with no asides on it",
);

/*
  The three cases that fall back to ordinary prose, and none of them loses a word.

  A mismatched pair is two readers disagreeing about where the paragraphs are, and
  the safe direction is to trust neither: no register can be believed when the two
  lists are not about the same thing. And a reply that is nothing but asides would
  lift to zero steps, which is a reading with nothing on it — so the whole reply
  stays on the card instead, which is the drawing that shows the player every word
  the villager wrote.
*/
assert.deepEqual(
  villagesWalk(turn, [beat("side", "just the one")]),
  noBeats,
  "beats that do not line up with the paragraphs are dropped whole, not guessed at",
);
const allAsides = [`[side]: ${DESCRIPTION}`, `[whisper:Someone]: ${SPEECH}`].join("\n\n");
const lifted = villagesWalk(allAsides, [beat("side", DESCRIPTION), beat("whisper", SPEECH, "Someone")]);
assert.equal(splitVillagesParagraphs(allAsides).length, 2, "the two tagged lines really are two paragraphs");
assert.deepEqual(
  lifted.paragraphs,
  splitVillagesParagraphs(allAsides),
  "a reply that is nothing but asides has no step to be beside, so it is walked as prose",
);
assert.deepEqual(lifted.asides, [[], []], "and nothing rides anything, because nothing was lifted");

/*
  The drawing itself, on the case the player was looking at when they rejected it.

  A description, then a whisper, then a speech: the whisper is lifted out, the two
  ordinary paragraphs remain as the steps, and the whisper lands on the step it
  followed. That is the whole of the correction — the whisper and the description
  are on the card at the same time, and the walk is two steps rather than three.
*/
const mixed = [
  DESCRIPTION,
  `[whisper:John Debugman]: ${SPEECH}`,
  "The gate swings shut behind him and he looks up, plainly done with being careful.",
].join("\n\n");
const mixedBeats: VillagesWalkBeat[] = [
  beat("untagged", DESCRIPTION),
  beat("whisper", SPEECH, "John Debugman"),
  beat("untagged", "The gate swings shut behind him and he looks up, plainly done with being careful."),
];
const mixedWalk = villagesWalk(mixed, mixedBeats);
assert.equal(
  mixedWalk.paragraphs.length,
  2,
  "the whisper is not a step: two paragraphs were written and two are walked",
);
assert.equal(mixedWalk.paragraphs[0], DESCRIPTION, "and the step that was first is still first");
assert.deepEqual(
  mixedWalk.asides[0],
  [{ register: "whisper", text: SPEECH, target: "John Debugman" }],
  "riding the step it followed",
);
assert.deepEqual(mixedWalk.asides[1], [], "and the step after it has nothing riding it");
assert.equal(
  mixedWalk.paragraphs.includes(SPEECH),
  false,
  "the aside's own words are not also a step, which is what the previous release got wrong",
);

// A whisper that named nobody keeps no target, rather than keeping an empty one:
// the drawing keys on the presence of the field, so an empty string would draw an
// arrow pointing at nothing.
assert.deepEqual(
  villagesWalk(`${DESCRIPTION}\n\n[whisper]: ${SPEECH}`, [beat("untagged", DESCRIPTION), beat("whisper", SPEECH)])
    .asides[0],
  [{ register: "whisper", text: SPEECH }],
  "a whisper with no listener named carries no target field at all",
);

// Run-on asides and edge asides. A run between two paragraphs lands on the step it
// followed, in the order it was written, and a tagged line at either END of a reply
// still has a step to ride: the last step for a trailing one, the first step for a
// leading one, which is the Engine's own answer for a box with nothing above it.
const runOn = [DESCRIPTION, `[side]: One.`, `[side]: Two.`, SPEECH].join("\n\n");
const runWalk = villagesWalk(runOn, [
  beat("untagged", DESCRIPTION),
  beat("side", "One."),
  beat("side", "Two."),
  beat("untagged", SPEECH),
]);
assert.deepEqual(runWalk.paragraphs, [DESCRIPTION, SPEECH], "two runs of aside still leave two steps");
assert.deepEqual(
  runWalk.asides[0],
  [
    { register: "side", text: "One." },
    { register: "side", text: "Two." },
  ],
  "and both land on the step they followed, in the order they were written",
);
assert.deepEqual(runWalk.asides[1], []);

const trailing = villagesWalk(`${DESCRIPTION}\n\n[side]: Last word.`, [
  beat("untagged", DESCRIPTION),
  beat("side", "Last word."),
]);
assert.deepEqual(trailing.paragraphs, [DESCRIPTION]);
assert.deepEqual(
  trailing.asides[0],
  [{ register: "side", text: "Last word." }],
  "a trailing aside rides the last step",
);

const leading = villagesWalk(`[side]: First word.\n\n${SPEECH}`, [
  beat("side", "First word."),
  beat("untagged", SPEECH),
]);
assert.deepEqual(leading.paragraphs, [SPEECH]);
assert.deepEqual(
  leading.asides[0],
  [{ register: "side", text: "First word." }],
  "a leading aside rides the first step, which is the Engine's own answer for a box with nothing above it",
);

// The two lists are one list per step and the same length as the steps, which is
// what the drawing relies on to index one with the other. A walk that came back
// short in either direction would be an aside attached to nothing.
for (const walk of [noBeats, lifted, mixedWalk, runWalk, trailing, leading]) {
  assert.equal(walk.asides.length, walk.paragraphs.length, "every step has a riding list, and there is one per step");
}

/*
  The wiring, read out of the entry as text.

  The classes are one template literal built from the tag name, so the sheet is
  read with the tag substituted — which is the text the browser is finally handed
  — and a name is matched with its closing brace or backtick so that one class
  cannot be read as another it is a prefix of.
*/
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const clientSrc = resolve(repoRoot, "packages/villages/src/engine/packages/client/src");
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
