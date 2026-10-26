import { asRecord } from "./coerce.js";
import { badGateway } from "./errors.js";
export type SpeechSource = { start: number; end: number; text: string; occurrence: number };
/** Resolve exact source occurrences; never derive hearing from punctuation or reactions. */
export function playerSpeechCapture(raw: Record<string, unknown>, input: string, opening = false) {
  const capture = asRecord(raw.playerSpeechCapture);
  const segments = Array.isArray(raw.segments) ? raw.segments.map(asRecord) : [];
  const spoken = segments.flatMap((row, index) => (row.speakerId === "player" ? [index] : []));
  const fail = (): never => {
    throw badGateway("Player speech capture needs recovery. Retry the saved turn.");
  };
  if (!["captured", "silent", "uncertain"].includes(String(capture.status))) return fail();
  if (capture.status === "uncertain" || !Array.isArray(capture.segments)) return fail();
  if (capture.status === "silent") {
    if (spoken.length || capture.segments.length) return fail();
    return new Map<number, SpeechSource[]>();
  }
  if (opening || !spoken.length || capture.segments.length !== spoken.length) return fail();
  const sources = new Map<number, SpeechSource[]>();
  let cursor = 0;
  let previousSegment = -1;
  for (const value of capture.segments) {
    const item = asRecord(value);
    const index = item.segment;
    if (
      !Number.isSafeInteger(index) ||
      !spoken.includes(Number(index)) ||
      sources.has(Number(index)) ||
      !Array.isArray(item.sources) ||
      !item.sources.length
    )
      return fail();
    if (Number(index) <= previousSegment) return fail();
    previousSegment = Number(index);
    const spans: SpeechSource[] = [];
    for (const value of item.sources) {
      const source = asRecord(value);
      if (
        typeof source.text !== "string" ||
        !source.text.trim() ||
        !Number.isSafeInteger(source.occurrence) ||
        Number(source.occurrence) < 1 ||
        Number(source.occurrence) > input.length
      )
        return fail();
      let start = -1;
      for (let occurrence = 0; occurrence < Number(source.occurrence); occurrence++) {
        start = input.indexOf(source.text, start < 0 ? 0 : start + source.text.length);
        if (start < 0) return fail();
      }
      if (start < cursor) return fail();
      cursor = start + source.text.length;
      spans.push({ start, end: cursor, text: source.text, occurrence: Number(source.occurrence) });
    }
    const row = segments[Number(index)];
    if (row.text !== spans.map((span) => span.text).join(" ")) return fail();
    sources.set(Number(index), spans);
  }
  return sources;
}
/** Quote IDs identify source spans, not proof that the quotation was spoken. */
export function playerQuoteSources(input: string) {
  return [...input.matchAll(/"([^"\n]+)"|“([^”\n]+)”|‘([^’\n]+)’|(?<!\p{L})'([^'\n]+)'(?!\p{L})/gu)].map(
    (match, index) => {
      const text = match[1] ?? match[2] ?? match[3] ?? match[4];
      const start = match.index! + 1;
      let occurrence = 0,
        cursor = 0;
      for (;;) {
        const found = input.indexOf(text, cursor);
        if (found < 0 || found > start) break;
        occurrence++;
        cursor = found + text.length;
      }
      return { id: index, text, occurrence, start };
    },
  );
}

/** Expand source references before core validation; metadata never adds resident-authored prose. */
export function materializePlayerSpeech(raw: Record<string, unknown>, input: string) {
  const capture = asRecord(raw.playerSpeechCapture);
  if (capture.utterances === undefined) return raw;
  if (
    !Array.isArray(raw.segments) ||
    !raw.segments.length ||
    !raw.segments.some((row) => asRecord(row).speakerId !== "player")
  )
    throw badGateway("The Scene reply has no authored moment.");
  const fail = (): never => {
    throw badGateway("Player speech capture needs recovery. Retry the saved turn.");
  };
  if (
    !Array.isArray(capture.utterances) ||
    capture.utterances.length > 24 ||
    (Array.isArray(raw.segments) && raw.segments.some((value) => asRecord(value).speakerId === "player"))
  )
    return fail();
  const quotes = playerQuoteSources(input);
  const entries = capture.utterances.map((value, index) => {
    const row = asRecord(value);
    const resolve = (value: unknown) => {
      const source = asRecord(value);
      // A supplied quote ID is an exact source reference, not newly authored speech.
      if (source.quote === undefined && source.id !== undefined && source.text === undefined) {
        if (source.occurrence !== undefined || !Number.isSafeInteger(source.id) || !quotes[Number(source.id)])
          return fail();
        const quote = quotes[Number(source.id)];
        return { text: quote.text, occurrence: quote.occurrence };
      }
      if (source.quote !== undefined) {
        if (!Number.isSafeInteger(source.quote) || !quotes[Number(source.quote)]) return fail();
        const quote = quotes[Number(source.quote)];
        return { text: quote.text, occurrence: quote.occurrence };
      }
      if (typeof source.text !== "string" || !source.text.trim()) return fail();
      let text = source.text;
      let occurrence = source.occurrence;
      if (!input.includes(text)) {
        // Quote typography is formatting. Restore the unique original span;
        // never accept changed words, ambiguous matches or a guessed occurrence.
        const typography = (value: string) => value.replace(/[‘’]/gu, "'").replace(/[“”]/gu, '"');
        const normalizedInput = typography(input),
          normalizedText = typography(text);
        const start = normalizedInput.indexOf(normalizedText);
        if (
          start < 0 ||
          normalizedInput.indexOf(normalizedText, start + 1) >= 0 ||
          (occurrence !== undefined && occurrence !== 1)
        )
          return fail();
        text = input.slice(start, start + text.length);
      }
      // Unique literal spans have exactly one possible provenance. Search every
      // input character, including overlapping matches and private/recalled text.
      if (occurrence === undefined) {
        const first = input.indexOf(text);
        if (first < 0 || input.indexOf(text, first + 1) >= 0) return fail();
        occurrence = 1;
      }
      if (!Number.isSafeInteger(occurrence)) return fail();
      return { text, occurrence: Number(occurrence) };
    };
    const sources = Array.isArray(row.sources) ? row.sources.map(resolve) : [resolve(row)];
    return {
      sources,
      segment: index,
      line: {
        kind: "dialogue",
        speakerId: "player",
        text: sources.map((source) => source.text).join(" "),
        ...(row.delivery !== undefined ? { delivery: row.delivery } : {}),
        ...(row.targetId !== undefined ? { targetId: row.targetId } : {}),
      },
    };
  });
  return recoverPlayerSpeech(raw, {
    additionalSpeech: entries.map((entry) => entry.line),
    playerSpeechCapture: {
      status: capture.status,
      segments: entries.map(({ sources, segment }) => ({ sources, segment })),
    },
  });
}

export const PLAYER_CAPTURE_CONTRACT =
  'playerSpeechCapture(required):{status:"captured|silent|uncertain",utterances:[...]}. ALL current speech,in source order; exclude thoughts/actions,recalled/hypothetical/example/negated speech. Quoted:{quote:0},supplied ID only. Unquoted:{text:"exact span",occurrence:1}; No IDs:use text. "I tell Aqua that I dislike mint tea" captures "I dislike mint tea",not quote:0; naming Aqua is not whispering. Interrupted:sources:[...]. Default ordinary; whisper:delivery:"whisper",local targetId. Silent:utterances:[]; uncertain:recovery. No player speech in segments:code inserts/remaps it. Capture never limits character honesty/wording.';

/** Insert omitted utterances without changing existing prose; remap every current-line reference. */
export function recoverPlayerSpeech(saved: Record<string, unknown>, metadata: Record<string, unknown>) {
  if (Object.keys(metadata).some((key) => !["playerSpeechCapture", "additionalSpeech"].includes(key)))
    throw badGateway("Speech recovery supplied unrelated changes.");
  const original = Array.isArray(saved.segments) ? saved.segments : [];
  const additional = metadata.additionalSpeech ?? [];
  if (
    !Array.isArray(additional) ||
    additional.length > 24 ||
    original.length + additional.length > 24 ||
    additional.some((value) => {
      const row = asRecord(value);
      return (
        row.speakerId !== "player" ||
        row.kind !== "dialogue" ||
        (row.beforeSegment !== undefined &&
          (!Number.isSafeInteger(row.beforeSegment) ||
            Number(row.beforeSegment) < 0 ||
            Number(row.beforeSegment) > original.length)) ||
        Object.keys(row).some(
          (key) => !["beforeSegment", "speakerId", "kind", "text", "delivery", "targetId"].includes(key),
        )
      );
    })
  )
    throw badGateway("Speech recovery supplied invalid segments.");
  const result = structuredClone(saved);
  const segments: unknown[] = [];
  const indexes = new Map<number, number>();
  const addedIndexes = new Map<unknown, number>();
  for (let index = 0; index <= original.length; index++) {
    for (const value of additional.filter((value) => Number(asRecord(value).beforeSegment ?? 0) === index)) {
      const { beforeSegment: _before, ...row } = asRecord(value);
      addedIndexes.set(value, segments.length);
      segments.push(row);
    }
    if (index < original.length) {
      indexes.set(index, segments.length);
      segments.push(original[index]);
    }
  }
  const reference = (value: unknown) => {
    if (typeof value === "string" && /^utterance:\d+$/u.test(value))
      return addedIndexes.get(additional[Number(value.slice(10))]) ?? value;
    return typeof value === "number" ? (indexes.get(value) ?? -1) : value;
  };
  const remap = (value: unknown, key = ""): unknown => {
    if (Array.isArray(value))
      return ["evidence", "lineIds", "segments"].includes(key) ? value.map(reference) : value.map((row) => remap(row));
    if (!value || typeof value !== "object") return value;
    return Object.fromEntries(
      Object.entries(value).map(([key, value]) => [
        key,
        ["source", "segment"].includes(key) ? reference(value) : remap(value, key),
      ]),
    );
  };
  for (const key of Object.keys(result)) if (key !== "segments") result[key] = remap(result[key]);
  result.segments = segments;
  result.playerSpeechCapture = metadata.playerSpeechCapture;
  return result;
}

/** Capture recovery cannot widen the delivery of source words already marked private. */
export function assertRecoveredSpeechPrivacy(
  original: Record<string, unknown>,
  recovered: Record<string, unknown>,
  input: string,
) {
  const protectedSpans: { start: number; end: number; targetId: unknown }[] = [];
  const capture = asRecord(original.playerSpeechCapture);
  if (Array.isArray(capture.utterances))
    for (const value of capture.utterances) {
      const utterance = asRecord(value);
      if (utterance.delivery !== "whisper") continue;
      try {
        const one = materializePlayerSpeech(
          {
            segments: [{ kind: "narration", text: "Recovery source." }],
            playerSpeechCapture: { status: "captured", utterances: [value] },
          },
          input,
        );
        for (const spans of playerSpeechCapture(one, input).values())
          for (const span of spans) protectedSpans.push({ ...span, targetId: utterance.targetId });
      } catch {
        /* Unresolvable source words establish no new speech or witnesses. */
      }
    }
  if (Array.isArray(original.segments))
    for (const value of original.segments) {
      const row = asRecord(value);
      if (row.speakerId !== "player" || (row.delivery !== "whisper" && row.kind !== "whisper")) continue;
      for (const text of Array.isArray(row.fragments) ? row.fragments : [row.text]) {
        if (typeof text !== "string" || !text) continue;
        let cursor = 0;
        for (;;) {
          const start = input.indexOf(text, cursor);
          if (start < 0) break;
          protectedSpans.push({ start, end: start + text.length, targetId: row.targetId });
          cursor = start + text.length;
        }
      }
    }
  const rows = Array.isArray(recovered.segments) ? recovered.segments.map(asRecord) : [];
  for (const [index, spans] of playerSpeechCapture(recovered, input))
    for (const span of spans) {
      if (
        protectedSpans.some(
          (old) =>
            span.start < old.end &&
            span.end > old.start &&
            (rows[index].delivery !== "whisper" || rows[index].targetId !== old.targetId),
        )
      )
        throw badGateway("Speech recovery changed private delivery. Retry the saved turn.");
    }
}
