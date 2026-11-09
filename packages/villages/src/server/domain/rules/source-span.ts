import { asRecord } from "./coerce.js";
import { badGateway } from "./errors.js";

export type InputSourceSpan = { start: number; end: number; text: string; occurrence: number };

/** Exact source selection; repeated text requires an explicit occurrence. Offsets are code-owned. */
export function exactInputSpan(value: unknown, input: string): InputSourceSpan {
  const row = asRecord(value),
    text = typeof row.text === "string" ? row.text : "";
  const fail = (): never => {
    throw badGateway("The GM used an ambiguous or invalid player source. Your draft is preserved.");
  };
  if (!text.trim()) return fail();
  const first = input.indexOf(text);
  if (first < 0 || (row.occurrence === undefined && input.indexOf(text, first + 1) >= 0)) return fail();
  const occurrence = row.occurrence ?? 1;
  if (!Number.isSafeInteger(occurrence) || Number(occurrence) < 1 || Number(occurrence) > input.length) return fail();
  let start = -1;
  for (let index = 0; index < Number(occurrence); index++) {
    start = input.indexOf(text, start + 1);
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
