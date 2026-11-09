import { asRecord } from "./coerce.js";
import { badGateway } from "./errors.js";
import { MODEL_JSON_MAX_CHARACTERS, modelJsonWithinBounds } from "./json-reply.js";
import { parseSceneObject } from "./scene-json-syntax.js";

/** The maintained response grammar. Prose is text; only actual changes need JSON. */
export const SCENE_TEXT_RESPONSE = `The FIRST line of every reply must be INPUT and its classification, before any narration or dialogue. Never omit it. No fences.

INPUT speech
[narration] The kettle steams.
[supplied-person-id] Please, sit down.

INPUT classifies the ORIGINAL player message: speech, action, thought or context. Unmarked dialogue is speech.
Mixed/private/cross-Zone input uses exact source spans instead:
[{"kind":"action","text":"*I lean close and whisper:*"},{"kind":"speech","text":"exact words","delivery":"whisper","targetId":"supplied-person-id"}]
Cover the whole input in order, including stage directions as action spans, separated only by quotes/whitespace. Classifying only the quoted speech is incomplete. Delivery: ordinary, whisper or call.
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
Unlabeled opening prose is narration. Every supplied public header starts a new paragraph, even inline. Private headers must begin a new line. Never write closing tags. Continued text belongs to that paragraph; use [narration] to switch back from speech. Max2000 characters per paragraph.

Every persistent outcome needs effect data, including spoken administration; prose alone changes no saved facts. Local Memory uses the MEMORY control below. End with CHANGES and one JSON object for all other effects, only when needed.
Example: CHANGES {"action":{"happened":true,"segment":0,"actorIds":["player"],"consent":[],"append":"The cup rests on the shelf."}}
JSON examples in dialogue must be quoted inline, never a standalone final object (reserved for effects).
Generated paragraph indexes count EVERY recognized header, plus any implicit opening narration, starting at0 BEFORE player insertion. Player speech references: utterance:N with actual witnesses.
Omit unchanged effects. No input, segments, witnesses or server bookkeeping in CHANGES.
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
  /^[ \t]*\[[ \t]*([A-Za-z0-9:_-]+)(?:[ \t]+(main|aside|call(?::[A-Za-z0-9:_-]+)?|(?:whisper|to):[A-Za-z0-9:_-]+))?[ \t]*\][ \t]*(.*)$/u;
const inlineHeader =
  /(?<!\\)\[[ \t]*([A-Za-z0-9:_-]+)(?:[ \t]+(main|aside|call(?::[A-Za-z0-9:_-]+)?|(?:whisper|to):[A-Za-z0-9:_-]+))?[ \t]*\]/gu;
const changesHeader = /^CHANGES(?::[ \t]*|[ \t]+|$)(.*)$/u;
const memoryHeader = /^[ \t]*MEMORY(?::[ \t]*|[ \t]+|$)(.*)$/u;
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
export function parseSceneTextReply(
  content: string,
  finishReason?: string,
  speakerIds: readonly string[] = [],
): Record<string, unknown> {
  if (finishReason !== "stop" && finishReason !== "end_turn") throw invalid("completion boundaries");
  if (content.length > MODEL_JSON_MAX_CHARACTERS) throw invalid("reply length");
  let text = content.trim();
  const fenced = text.match(/^```(?:scene|text)?[ \t]*\r?\n([\s\S]*)\r?\n```$/u);
  if (fenced) text = fenced[1]!;
  const lines = text.split(/\r?\n/u);
  const inputLine = lines.shift()?.match(/^INPUT:?(?:[ \t]+(.*))?$/u);
  if (!inputLine) throw invalid("input classification");
  const inputText = (inputLine[1] ?? "").trim();
  let input: unknown;
  let body = lines;
  if (["speech", "action", "thought", "context"].includes(inputText)) input = inputText;
  else {
    const section = [inputLine[1] ?? "", ...lines].join("\n").trimStart();
    if (!section.startsWith("[")) throw invalid("input classification");
    let depth = 0;
    let end = -1;
    for (const match of section.matchAll(/"(?:[^"\\]|\\.)*"|[{}\[\]]/gu)) {
      if (match[0] === "{" || match[0] === "[") depth++;
      else if (match[0] === "}" || match[0] === "]") {
        depth--;
        if (depth === 0) {
          end = match.index + 1;
          break;
        }
      }
    }
    if (end < 0 || (section.slice(end) && !/^[ \t]*\n/u.test(section.slice(end))))
      throw invalid("input classification");
    const wrapped = '{"input":' + section.slice(0, end) + "}";
    input = modelJsonWithinBounds(wrapped) ? parseSceneObject(wrapped)?.input : undefined;
    if (!Array.isArray(input)) throw invalid("input classification");
    body = section.slice(end).trimStart().split(/\r?\n/u);
    input = input.map((value) => {
      const span = asRecord(value);
      return span.delivery === "call" ? { ...span, delivery: "shout" } : value;
    });
  }
  const labeledAt = body.findIndex((line) => changesHeader.test(line));
  const changeAt = labeledAt >= 0 ? labeledAt : body.findIndex((line) => line.trimStart().startsWith("{"));
  let changes: Record<string, unknown> = {};
  if (changeAt >= 0) {
    const label = body[changeAt]!.match(changesHeader);
    if (!label) {
      const prefix = body.slice(0, changeAt).join("\n").trimEnd();
      if (
        changeAt === 0 ||
        body[changeAt - 1]!.trim() ||
        /(?:\bCHANGES:?|:["'”’]*)$/u.test(prefix) ||
        /^ {0,3}(?:`{3,}|~{3,})/mu.test(prefix)
      )
        throw invalid("change fields");
    }
    const metadata = label ? [label[1]!, ...body.slice(changeAt + 1)].join("\n") : body.slice(changeAt).join("\n");
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
  const speakers = new Set(["narration", "player", ...speakerIds]);
  if (Array.isArray(changes.npcIntroductions))
    for (const value of changes.npcIntroductions) {
      const ref = asRecord(value).ref;
      if (typeof ref === "string" && /^new:[a-z0-9-]{1,60}$/u.test(ref)) speakers.add(ref);
    }
  const proseLines = body.slice(0, changeAt < 0 ? body.length : changeAt).flatMap((line) => {
    if (memoryHeader.test(line)) return [line];
    const parts: string[] = [];
    let start = 0;
    for (const match of line.matchAll(inlineHeader)) {
      if (!match.index || match[2]?.startsWith("whisper")) continue;
      if (!speakers.has(match[1]!)) {
        if (match[1]!.startsWith("new:") || match[2]) throw invalid("paragraph headers");
        continue;
      }
      parts.push(line.slice(start, match.index));
      start = match.index;
    }
    return [...parts, line.slice(start)];
  });
  const segments: Record<string, unknown>[] = [];
  let opening = true;
  let current: { fields: Record<string, unknown>; lines: string[] } | undefined;
  const localMemories: Record<string, unknown>[] = [];
  const flush = (memory?: Record<string, unknown>) => {
    if (!current) return;
    const excerpts: string[] = [];
    const prose = current.lines
      .join("\n")
      .trim()
      .replace(/\[remember\]([\s\S]*?)\[\/remember\]/gu, (_match, excerpt: string) => {
        excerpts.push(excerpt);
        return excerpt;
      })
      .trim();
    if (
      /\[\s*\/?\s*remember\b/iu.test(prose) ||
      excerpts.length > 2 ||
      excerpts.some(
        (excerpt) => !excerpt.trim() || Buffer.byteLength(excerpt, "utf8") > 320 || !prose.includes(excerpt),
      )
    )
      throw invalid("Memory source markers");
    if (!prose) throw invalid("empty paragraphs");
    if (/\bMEMORY:?\s*\{/iu.test(prose)) throw invalid("Memory controls");
    if (/\bCHANGES:?\s*(?:[\[{]|(?:"(?:[^"\\]|\\.)*"|[A-Za-z_$][\w$]*)\s*:)/u.test(prose))
      throw invalid("change fields");
    if (
      /\[\s*[A-Za-z0-9:_-]+\s+whisper\b/iu.test(prose) ||
      (opening &&
        /(?<!\\)\[\s*(?:narration\b|\/[A-Za-z0-9:_-]+|[A-Za-z0-9:_-]+\s+(?:main|aside|call|to)\b)/iu.test(prose))
    )
      throw invalid("paragraph headers");
    if (memory) {
      if (
        Object.keys(memory).some(
          (key) =>
            ![
              "text",
              "subjects",
              "learners",
              "basis",
              "disclosure",
              "action",
              "kind",
              "target",
              "screening",
              "domainRef",
              "effectId",
            ].includes(key),
        )
      )
        throw invalid("local Memory fields");
      localMemories.push({
        ...memory,
        support: (excerpts.length ? excerpts : [prose]).map((excerpt) => ({ lineId: segments.length, excerpt })),
      });
    }
    segments.push({ ...current.fields, text: prose });
    current = undefined;
  };
  for (const line of proseLines) {
    const local = line.match(memoryHeader);
    if (local) {
      const metadata = local[1]!.trim();
      const memory = modelJsonWithinBounds(metadata) ? parseSceneObject(metadata) : null;
      if (!current || !memory) throw invalid("local Memory");
      flush(memory);
      continue;
    }
    const match = line.match(header);
    if (!match) {
      if (changeFields.has(line.match(/^\s*"?([A-Za-z_$][\w$]*)"?\s*:/u)?.[1] ?? "")) throw invalid("change fields");
      if (line.trimStart().startsWith("[")) throw invalid("paragraph headers");
      if (!current && line.trim()) current = { fields: { kind: "narration" }, lines: [] };
      current?.lines.push(line);
      continue;
    }
    flush();
    opening = false;
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
  if (localMemories.length) {
    if (changes.memoryChanges !== undefined && !Array.isArray(changes.memoryChanges)) throw invalid("Memory changes");
    changes.memoryChanges = [...localMemories, ...((changes.memoryChanges as unknown[] | undefined) ?? [])];
  }
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
