import { asRecord } from "./coerce.js";
import { badGateway } from "./errors.js";
export type SpeechSource = { start: number; end: number; text: string; occurrence: number };
/** Exact source selection; repeated text requires an explicit occurrence. Offsets are always server-derived. */
export function playerSourceSpan(value: unknown, input: string): SpeechSource {
  const row = asRecord(value);
  const text = typeof row.text === "string" ? row.text : "";
  const fail = (): never => {
    throw badGateway("The GM used an ambiguous or invalid player source. Your draft is preserved.");
  };
  if (!text.trim()) return fail();
  const first = input.indexOf(text);
  if (first < 0 || (row.occurrence === undefined && input.indexOf(text, first + text.length) >= 0)) return fail();
  const occurrence = row.occurrence ?? 1;
  if (!Number.isSafeInteger(occurrence) || Number(occurrence) < 1 || Number(occurrence) > input.length) return fail();
  let start = -1;
  for (let index = 0; index < Number(occurrence); index++) {
    start = input.indexOf(text, start < 0 ? 0 : start + text.length);
    if (start < 0) return fail();
  }
  const end = start + text.length;
  const boundaries = new Set(
    [...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(input)].map((part) => part.index),
  );
  boundaries.add(input.length);
  if (!boundaries.has(start) || !boundaries.has(end)) return fail();
  return { text, start, end, occurrence: Number(occurrence) };
}
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
      const { start } = playerSourceSpan(source, input);
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
/** Insert exact GM-classified speech before the generated reply and remap its citations. */
export function materializePlayerSpeech(raw: Record<string, unknown>, input: string) {
  const capture = asRecord(raw.playerSpeechCapture);
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
    !["captured", "silent"].includes(String(capture.status)) ||
    !Array.isArray(capture.utterances) ||
    capture.utterances.length > 24 ||
    raw.segments.length + capture.utterances.length > 24 ||
    (capture.status === "silent") !== (capture.utterances.length === 0) ||
    raw.segments.some((value) => asRecord(value).speakerId === "player")
  )
    return fail();
  const entries = capture.utterances.map((value, segment) => {
    const row = asRecord(value);
    if (
      typeof row.text !== "string" ||
      !row.text.trim() ||
      !input.includes(row.text) ||
      !Number.isSafeInteger(row.occurrence) ||
      Number(row.occurrence) < 1 ||
      Number(row.occurrence) > input.length
    )
      return fail();
    return {
      sources: [{ text: row.text, occurrence: Number(row.occurrence) }],
      segment,
      line: {
        kind: "dialogue",
        speakerId: "player",
        text: row.text,
        ...(row.delivery !== undefined ? { delivery: row.delivery } : {}),
        ...(row.targetId !== undefined ? { targetId: row.targetId } : {}),
      },
    };
  });
  const indexes = new Map(raw.segments.map((_row, index) => [index, index + entries.length]));
  const reference = (value: unknown) => {
    if (typeof value === "string" && /^utterance:\d+$/u.test(value))
      return entries[Number(value.slice(10))]?.segment ?? value;
    return typeof value === "number" ? (indexes.get(value) ?? -1) : value;
  };
  const remap = (value: unknown, key = ""): unknown => {
    if (Array.isArray(value))
      return ["evidence", "lineIds", "segments"].includes(key) ? value.map(reference) : value.map((row) => remap(row));
    if (!value || typeof value !== "object") return value;
    return Object.fromEntries(
      Object.entries(value).map(([key, value]) => [
        key,
        ["source", "segment", "lineId"].includes(key) ? reference(value) : remap(value, key),
      ]),
    );
  };
  const result = structuredClone(raw);
  for (const key of Object.keys(result)) if (key !== "segments") result[key] = remap(result[key]);
  result.segments = [...entries.map((entry) => entry.line), ...(result.segments as unknown[])];
  result.playerSpeechCapture = {
    status: capture.status,
    segments: entries.map(({ sources, segment }) => ({ sources, segment })),
  };
  return result;
}
