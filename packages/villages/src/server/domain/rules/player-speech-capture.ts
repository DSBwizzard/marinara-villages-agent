import { asRecord } from "./coerce.js";
import { badGateway } from "./errors.js";
import { MAX_SCENE_REPLY_LINES } from "./scene-reply.js";
import type { VenueLine } from "../models/scene-model.js";
export type SpeechSource = { start: number; end: number; text: string; occurrence: number };
/** A raw player draft is not an utterance; only server-bound speech can issue a spoken action. */
export function isCapturedPlayerSpeech(line: Pick<Partial<VenueLine>, "role" | "speakerId" | "kind" | "speechSource">) {
  return (
    line.role !== "assistant" &&
    (line.speakerId === "player" || (line.role === "user" && !line.speakerId)) &&
    ["dialogue", "side", "whisper"].includes(String(line.kind)) &&
    line.speechSource?.version === 3 &&
    line.speechSource.spans.length > 0
  );
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
    raw.segments.length + capture.utterances.length > MAX_SCENE_REPLY_LINES ||
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
