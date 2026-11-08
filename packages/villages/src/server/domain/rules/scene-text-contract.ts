import { asRecord } from "./coerce.js";
import { badGateway } from "./errors.js";
import { MODEL_JSON_MAX_CHARACTERS, modelJsonWithinBounds } from "./json-reply.js";
import { parseSceneObject } from "./scene-json-syntax.js";

/** The maintained response grammar. Prose is text; only actual changes need JSON. */
export const SCENE_TEXT_RESPONSE = `Answer in this format, without fences:

INPUT speech
[narration] The kettle steams.
[supplied-person-id] Please, sit down.

INPUT classifies the ORIGINAL player message: speech, action, thought or context. Unmarked dialogue is speech.
Mixed/private/cross-Zone input uses exact source spans instead:
[{"kind":"speech","text":"exact words","delivery":"whisper","targetId":"supplied-person-id"}]
Cover the whole input in order, separated only by quotes/whitespace. Delivery: ordinary, whisper or call.
Whisper also means an explicitly private one-to-one conversation within the current Zone, such as taking someone aside or speaking at a quiet corner. Use the intended local recipient; ordinary speech addressed to someone remains public.
Moving to another part of the same room creates no new Zone. Respect a person's refusal and never invent a player decision or cross-Zone move.
Thoughts/examples/recalled/hypothetical words are inaudible. Empty/opening: INPUT []. Code inserts the player's exact speech; never write it yourself.

Paragraph headers (supplied IDs only):
[narration] description or action
[person-id] ordinary spoken words
[person-id aside] a short bubble interjection; public unless explicitly whispered
[person-id whisper:recipient-id] private local speech
[person-id call] a call to one directly connected Zone
[person-id call:recipient-id] a call to that adjacent person
[person-id to:recipient-id] ordinary public speech addressed to that person
Actions go in narration, words in dialogue. Prose needs no JSON escaping.
Aside bubbles are presentation, never a private audience. Keep useful asides brief.
Headers begin a line; continued lines belong to that paragraph. Keep ordinary dialogue brief across the whole cast; max2000 characters per paragraph.

For actual effects only, end with CHANGES on its own line and one JSON object using the effect contracts.
Enclose ALL effects in one pair of braces and double-quote their names. Example shape: {"action":{"happened":true,"segment":0,"actorIds":["player"],"consent":[],"append":"The cup rests on the shelf."}}. Include it only when that narration actually establishes the change.
Generated paragraph indexes start at0 BEFORE player insertion. Player speech references: utterance:N with actual witnesses.
Omit unchanged effects; ordinary conversation needs no CHANGES. No input, segments, witnesses or server bookkeeping in CHANGES.
Optional sounds:[{segment,sourceId,text,loud?:true}] gives a narration paragraph's exact acoustic text, never unseen actions.`;

const changeFields = new Set([
  "memoryChanges",
  "relationshipChanges",
  "wishChanges",
  "projectSpeech",
  "action",
  "access",
  "events",
  "immediateResidentMoves",
  "contactAttempt",
  "npcIntroductions",
  "placeDiscoveries",
  "establishmentProgress",
  "halt",
  "presentation",
  "narrativeIntroduction",
  "sounds",
]);
const header =
  /^\[([A-Za-z0-9:_-]+)(?:[ \t]+(main|aside|call(?::[A-Za-z0-9:_-]+)?|(?:whisper|to):[A-Za-z0-9:_-]+))?\](?:[ \t]+(.*))?$/u;
const changesHeader = /^CHANGES:?[ \t]*$/u;
const invalid = (part: string) => badGateway(`The Scene reply has invalid ${part}. Your draft is preserved.`);

/** Only restore an omitted object envelope/key quotes; never repair values or incomplete JSON. */
function parseChanges(metadata: string) {
  let text = metadata.trim();
  if (!text) return null;
  if (!text.startsWith("{")) {
    let depth = 0;
    let field = true;
    let cursor = 0;
    let normalized = "";
    for (const match of text.matchAll(/"(?:[^"\\]|\\.)*"|[{}\[\],:]|[A-Za-z_$][\w$]*/gu)) {
      const token = match[0];
      if (depth === 0 && field) {
        if (/^[A-Za-z_$]/u.test(token)) {
          if (!changeFields.has(token)) return null;
          normalized += text.slice(cursor, match.index) + JSON.stringify(token);
          cursor = match.index + token.length;
        }
        field = false;
      }
      if (token === "{" || token === "[") depth++;
      else if (token === "}" || token === "]") depth--;
      else if (token === "," && depth === 0) field = true;
    }
    text = "{" + normalized + text.slice(cursor) + "}";
  }
  return modelJsonWithinBounds(text) ? parseSceneObject(text) : null;
}

/** Syntax only. Existing source, speaker, consent and effect validation remains authoritative. */
export function parseSceneTextReply(content: string, finishReason?: string): Record<string, unknown> {
  if (finishReason !== "stop" && finishReason !== "end_turn") throw invalid("completion boundaries");
  if (content.length > MODEL_JSON_MAX_CHARACTERS) throw invalid("reply length");
  let text = content.trim();
  const fenced = text.match(/^```(?:scene|text)?[ \t]*\r?\n([\s\S]*)\r?\n```$/u);
  if (fenced) text = fenced[1]!;
  const lines = text.split(/\r?\n/u);
  const inputLine = lines.shift()?.match(/^INPUT:?(?:[ \t]+(.*))?$/u);
  if (!inputLine) throw invalid("input classification");
  const firstBody = lines.findIndex((line) => header.test(line) || changesHeader.test(line));
  const inputText = [inputLine[1] ?? "", ...lines.slice(0, firstBody < 0 ? lines.length : firstBody)].join("\n").trim();
  let input: unknown;
  if (["speech", "action", "thought", "context"].includes(inputText)) input = inputText;
  else {
    const wrapped = '{"input":' + inputText + "}";
    input = modelJsonWithinBounds(wrapped) ? parseSceneObject(wrapped)?.input : undefined;
    if (!Array.isArray(input)) throw invalid("input classification");
    input = input.map((value) => {
      const span = asRecord(value);
      return span.delivery === "call" ? { ...span, delivery: "shout" } : value;
    });
  }
  const body = firstBody < 0 ? [] : lines.slice(firstBody);
  const changeAt = body.findIndex((line) => changesHeader.test(line));
  let changes: Record<string, unknown> = {};
  if (changeAt >= 0) {
    const metadata = body.slice(changeAt + 1).join("\n");
    const value = parseChanges(metadata);
    if (
      !value ||
      typeof value !== "object" ||
      Array.isArray(value) ||
      Object.getPrototypeOf(value) !== Object.prototype ||
      Object.keys(value).some((key) => !changeFields.has(key))
    )
      throw invalid("change fields");
    changes = value as Record<string, unknown>;
    if (changes.action && typeof changes.action === "object" && !Array.isArray(changes.action)) {
      const action = changes.action as Record<string, unknown>;
      if (!Object.hasOwn(action, "consent")) action.consent = [];
      if (typeof action.recent === "string") action.recent = { text: action.recent };
    }
  }
  const segments: Record<string, unknown>[] = [];
  let current: { fields: Record<string, unknown>; lines: string[] } | undefined;
  const flush = () => {
    if (!current) return;
    const prose = current.lines.join("\n").trim();
    if (!prose) throw invalid("empty paragraphs");
    segments.push({ ...current.fields, text: prose });
  };
  for (const line of body.slice(0, changeAt < 0 ? body.length : changeAt)) {
    const match = line.match(header);
    if (!match) {
      if (line.trimStart().startsWith("[")) throw invalid("paragraph headers");
      if (!current && line.trim()) throw invalid("paragraph headers");
      current?.lines.push(line);
      continue;
    }
    flush();
    const [, speaker, delivery, prose] = match;
    if (speaker === "narration" && delivery) throw invalid("narration delivery");
    current = {
      fields:
        speaker === "narration"
          ? { kind: "narration" }
          : {
              kind: "dialogue",
              speakerId: speaker,
              ...(delivery === "aside" ? { presentation: "aside" } : {}),
              ...(delivery === "call" || delivery?.startsWith("call:") ? { delivery: "shout" } : {}),
              ...(delivery?.startsWith("call:") ? { targetId: delivery.slice(5) } : {}),
              ...(delivery?.startsWith("to:") ? { targetId: delivery.slice(3) } : {}),
              ...(delivery?.startsWith("whisper:") ? { delivery: "whisper", targetId: delivery.slice(8) } : {}),
            },
      lines: [prose ?? ""],
    };
  }
  flush();
  if (Object.hasOwn(changes, "sounds")) {
    if (!Array.isArray(changes.sounds)) throw invalid("sounds");
    const used = new Set<number>();
    for (const value of changes.sounds) {
      const sound = asRecord(value);
      const index = sound.segment;
      if (
        !Number.isSafeInteger(index) ||
        typeof index !== "number" ||
        used.has(index) ||
        segments[index]?.kind !== "narration" ||
        Object.keys(sound).some((key) => !["segment", "sourceId", "text", "loud"].includes(key)) ||
        typeof sound.sourceId !== "string" ||
        typeof sound.text !== "string" ||
        (Object.hasOwn(sound, "loud") && typeof sound.loud !== "boolean")
      )
        throw invalid("sounds");
      used.add(index);
      const { segment: _segment, ...cue } = sound;
      segments[index]!.sound = cue;
    }
  }
  const { sounds: _sounds, ...effects } = changes;
  return { ...effects, input, segments };
}
