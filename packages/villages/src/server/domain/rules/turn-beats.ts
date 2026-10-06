// Villages — the lines a villager's answer is made of.
//
// A villager writes the room and the things they say in one breath, and until
// now the tab read that answer back by SHAPE: a paragraph that closes on a quote
// was somebody speaking and the rest was the room. That is still the rule for
// everything a villager writes without help, and it is a good rule — see
// `classifyVillagesParagraph` for why the closing end and not the opening one.
//
// What a shape cannot say is the third and fourth registers. A remark muttered
// under somebody's breath and something said to one person only are the same
// sentence as ordinary speech, and no amount of quoting distinguishes them:
// "Nothing that needs a contract, sweet thing. Probably." is a perfectly
// well-formed thing to say out loud. So these two are TAGGED, by the villager,
// on the line they belong to, and this module is the one place that tag is read.
//
// The grammar is deliberately the Engine's own vocabulary rather than a new one.
// Game Mode's party agent writes `[Name] [side] …` and `[Name] [whisper:T] …`,
// its parser lives in `client/src/lib/party-dialogue-parser.ts`, and the two
// names it uses for these registers are the two names used here. There is no
// name in front of ours because a villager's turn has exactly one voice in it;
// the room that has several will put the name back, and the tag stays the same
// word when it does.
//
// ── Where the tags go, and where they do NOT go ─────────────────────────────
//
// The tag is on the wire and never in the village. `content` is written from
// `renderVillagesTurnBeats`, which joins the beats' own text, so a stored line
// reads exactly as it did before tags existed and the SIX other readers of a
// transcript — the chronicle judge, the distiller, the agenda writer, the SCENE
// lane, storyboard and the spin-off — are reading prose. The register travels
// beside the text in `VillagesTurnBeat[]`, and only the tab that draws it knows
// it is there.
//
// ── The ceilings, named rather than hidden ─────────────────────────────────
//
//   * A beat that mixes a tag with untagged lines takes the tag's register for
//     the whole beat, because a beat is a paragraph and a paragraph has one
//     register in this design. The upgrade path is per-LINE registers, which is
//     what the Engine's own parser produces.
//   * A tag only counts at the START of a line. A `[side]` in the middle of a
//     sentence is left exactly as the villager wrote it, which is the safe
//     direction: a model that quotes the instruction back at us gets a paragraph
//     with the word in it rather than a silently mangled one.
//   * `[thought]` is NOT read. The Engine has one, Game Mode draws it as italic
//     purple prose, and it is deliberately not part of this: an inner monologue
//     the player is shown is a different feature from something said out of the
//     side of somebody's mouth, and it needs a decision about whether the player
//     may see it at all. The name is free when somebody makes that decision.
//
// ── The one marker that is not a register ──────────────────────────────────
//
// `readVillagesFarewell` also lives here, and it is a different kind of thing: a
// villager may end a conversation, and that is a fact about the whole answer
// rather than a way of saying one line of it. It is here because this module is
// the one place a villager's raw answer comes apart, and because it has to run
// BEFORE the beats are parsed — a marker is a line, and a line left in the text
// is a line the tab would draw.

export type VillagesTurnBeatKind = "untagged" | "side" | "whisper";

/** One register-bearing line of a villager's answer. */
export type VillagesTurnBeat = {
  kind: VillagesTurnBeatKind;
  /** The line itself, with the tag taken off. Never empty. */
  text: string;
  /** Who a whisper was aimed at, when the villager named somebody. */
  target?: string;
  /** Optional visual-novel pose for this dialogue beat. Unknown labels fall back to neutral. */
  expression?: string;
};

/**
 * The one line a villager writes to bring a conversation to a close.
 *
 * Deliberately NOT a beat. The three beat registers are all ways of saying
 * something and are drawn differently by the tab; this is a fact about the whole
 * answer that the tab acts on by ending the conversation. It is read here rather
 * than beside the beats because it must be taken off the wire BEFORE the beats
 * are parsed — a marker left in the text would arrive as a paragraph of the
 * villager's last line, and the reader that strips tags would have nothing to
 * strip it with.
 *
 * Exported for one caller: the debug press that proves the ending works end to
 * end by writing what a model would write, so the spelling lives in one place
 * rather than in a second string that can drift from this one.
 */
export const VILLAGES_FAREWELL_MARK = "[farewell]";

/** A villager's answer with the terminal marker taken off, and whether it was there. */
export type VillagesAnswerText = {
  /**
   * The answer with the marker and the whitespace that put it on a line of its
   * own taken off, and everything else byte for byte as written.
   */
  content: string;
  /**
   * Whether the marker counted — see `readVillagesFarewell` for what counting
   * means, which is not the same thing as whether the marker was present.
   */
  farewell: boolean;
};

/**
 * Take the terminal marker off a villager's answer.
 *
 * Two rules, and they are separate on purpose:
 *
 *   * The marker is REMOVED unconditionally. A villager who writes one in the
 *     middle of an answer, or twice, or on a line with other words on it, has
 *     written something the village must not store — the tab would draw it as
 *     prose and the player would read the machinery. Every line whose trimmed
 *     text is exactly the marker comes out, wherever it is.
 *   * It COUNTS only as the last non-empty line. That is the sentence the model
 *     was asked for: finish the reply, then the marker on a line of its own. A
 *     marker anywhere else is stripped and ignored, which is the safe direction —
 *     a villager who says "and that is all I have to say" and then keeps talking
 *     has not ended anything, and ending a conversation the player did not ask
 *     to end is the worse mistake by far.
 *
 * Trailing blank lines after the marker do not stop it counting, because a model
 * that writes the marker and then a newline has still written it last.
 *
 * The whitespace at the END goes with the marker. Putting the marker on its own
 * line is what leaves a blank line in front of it, and that blank line is the
 * marker's rather than the villager's: kept, it would be stored as a paragraph
 * break after the last thing they said, and the tab would draw it.
 */
export function readVillagesFarewell(raw: string): VillagesAnswerText {
  const lines = raw.split("\n");
  const marks = new Set<number>();
  for (let index = 0; index < lines.length; index += 1) {
    if (lines[index]!.trim() === VILLAGES_FAREWELL_MARK) marks.add(index);
  }
  if (marks.size === 0) return { content: raw, farewell: false };
  let last = lines.length - 1;
  while (last >= 0 && lines[last]!.trim().length === 0) last -= 1;
  const content = lines.filter((_, index) => !marks.has(index));
  while (content.length > 0 && content[content.length - 1]!.trim().length === 0) content.pop();
  return { content: content.join("\n"), farewell: marks.has(last) };
}

/**
 * The tag, at the head of a line, with the two spellings the Engine accepts.
 *
 * `[extra]` is the Engine's older spelling of `[side]` and normalises to it for
 * the same reason its own parser does — the two types were always identical, and
 * the alias is kept so a model that learned the old word still lands in the
 * right register. A colon after the tag is optional, because a villager copying
 * the shape out of a prompt that used one will write it and a villager writing
 * it from sense will not.
 */
const BEAT_TAG_RE = /^[ \t]*\[(side|extra|whisper)(?::([^\]]*))?\][ \t]*:?[ \t]*/iu;
const EXPRESSION_TAG_RE = /^[ \t]*\[expression:([a-z0-9_-]{1,40})\][ \t]*/iu;

type BeatDraft = { kind: VillagesTurnBeatKind; target?: string; expression?: string; lines: string[] };

/**
 * Read a villager's answer into the lines it is made of.
 *
 * Returns `null` when the villager used no tag at all, and that is the whole
 * point of returning it here rather than a list of `untagged` beats: an
 * ordinary answer is stored byte for byte as the model wrote it, with no
 * duplicated copy of its own words beside it and nothing new in the transcript
 * for the players who have been reading one for months. `null` means "read this
 * by shape", which is what the tab has always done.
 *
 * Blank lines divide beats. A tagged line starts one. Everything else continues
 * whichever beat is open, which is how a villager who writes a description, then
 * a `[side]`, then another description gets three beats rather than one.
 */
export function parseVillagesTurnBeats(raw: string): VillagesTurnBeat[] | null {
  const lines = raw.replace(/\r\n?/g, "\n").split("\n");
  const beats: VillagesTurnBeat[] = [];
  let draft: BeatDraft | null = null;
  let tagged = false;

  const flush = () => {
    if (!draft) return;
    const text = draft.lines.join("\n").trim();
    if (text.length > 0) {
      beats.push({
        kind: draft.kind,
        text,
        ...(draft.target ? { target: draft.target } : {}),
        ...(draft.expression ? { expression: draft.expression } : {}),
      });
    }
    draft = null;
  };

  for (const line of lines) {
    if (!line.trim()) {
      flush();
      continue;
    }
    const expressionMatch = EXPRESSION_TAG_RE.exec(line);
    const expression = expressionMatch?.[1]?.toLowerCase();
    const body = expressionMatch ? line.slice(expressionMatch[0].length) : line;
    if (expressionMatch) tagged = true;
    const match = BEAT_TAG_RE.exec(body);
    if (match) {
      flush();
      tagged = true;
      const word = match[1]!.toLowerCase();
      const target = match[2]?.trim() ?? "";
      draft = {
        kind: word === "whisper" ? "whisper" : "side",
        ...(target.length > 0 ? { target } : {}),
        ...(expression ? { expression } : {}),
        lines: [body.slice(match[0].length)],
      };
      continue;
    }
    if (expression && draft) flush();
    if (!draft) draft = { kind: "untagged", ...(expression ? { expression } : {}), lines: [] };
    draft.lines.push(body);
  }
  flush();

  return tagged ? beats : null;
}

/**
 * The villager's answer as one piece of prose, for the transcript.
 *
 * Beats are rejoined with a blank line, which is the same thing the paragraph
 * splitter divides on — so what is stored reads as the villager wrote it, minus
 * the tags, and a later shape read of the same text lands on the same
 * paragraphs. The register is not in here and must never be: what the player
 * reads back in the log is what was said, and the village's own record of the
 * conversation is not the place to keep a note about how it was said.
 */
export function renderVillagesTurnBeats(beats: readonly VillagesTurnBeat[]): string {
  return beats.map((beat) => beat.text).join("\n\n");
}
