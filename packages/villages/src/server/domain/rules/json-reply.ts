/*! jsonrepair 3.15.0 — ISC License


Copyright (c) 2020-2026 by Jos de Jong

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND ISC DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL ISC BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

*/
import { jsonrepair } from "jsonrepair";
import { parseSceneObject } from "./scene-json-syntax.js";

export const MODEL_JSON_MAX_CHARACTERS = 131_072;
export const MODEL_JSON_MAX_EDITS = 8;
export type ModelJsonReply = { value: Record<string, unknown> | null; repaired: boolean; edits: number };

/** Strict extraction for diagnostics and saved data. Never repairs or selects nested rows. */
export function extractJsonObject(content: string): Record<string, unknown> | null {
  const candidate = objectCandidate(content);
  return candidate ? parseSceneObject(candidate) : null;
}
export function modelJsonWithinBounds(content: string): boolean {
  if (content.length > MODEL_JSON_MAX_CHARACTERS) return false;
  let depth = 0,
    count = 0;
  for (const token of content.matchAll(/"(?:[^"\\]|\\.)*"|[{}\[\]:,]|[^\s{}\[\]:,]+/gu)) {
    if (++count > 32768) return false;
    if (token[0] === "{" || token[0] === "[") depth++;
    else if (token[0] === "}" || token[0] === "]") depth = Math.max(0, depth - 1);
    if (depth > 64) return false;
  }
  return true;
}
function objectCandidate(content: string): string | null {
  if (!modelJsonWithinBounds(content)) return null;
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");
  if (
    start < 0 ||
    end <= start ||
    /[\[\]}]/u.test(content.slice(0, start)) ||
    /[{}\[\],:"]/u.test(content.slice(end + 1))
  )
    return null;
  return content.slice(start, end + 1);
}
/** Tokenize the entire candidate; unquoted/incomplete values and excess depth are never repairable. */
function tokens(text: string): string[] | null {
  const result: string[] = [];
  let depth = 0;
  for (let index = 0; index < text.length;) {
    const rest = text.slice(index);
    const match =
      /^(?:\s+|"(?:[^"\\\x00-\x1f]|\\(?:["\\/bfnrt]|u[0-9a-fA-F]{4}))*"|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null|[{}\[\]:,])/u.exec(
        rest,
      );
    if (!match) return null;
    index += match[0].length;
    if (/^\s/u.test(match[0])) continue;
    const token = match[0];
    if (token === "{" || token === "[") depth++;
    else if (token === "}" || token === "]") depth = Math.max(0, depth - 1);
    if (depth > 64 || result.length >= 32768) return null;
    result.push(token);
  }
  return result;
}
/** Only insert punctuation or remove a trailing comma. Never discard or synthesize a data token.
 * No appended EOF closures: an unfinished container remains a failed response, even after `stop`.
 */
function punctuationEdits(before: string[], after: string[]): number | null {
  let left = 0,
    right = 0,
    edits = 0;
  while (left < before.length && right < after.length) {
    if (before[left] === after[right]) {
      left++;
      right++;
      continue;
    }
    if (
      before[left] === "," &&
      left > 0 &&
      !["[", "{", ":", ","].includes(before[left - 1]!) &&
      ["}", "]"].includes(before[left + 1] ?? "") &&
      after[right] === before[left + 1]
    )
      left++;
    else if (
      after[right] === "," ||
      (["}", "]"].includes(after[right]!) && left > 0 && !["[", "{", ":", ","].includes(before[left - 1]!))
    )
      right++;
    else return null;
    if (++edits > MODEL_JSON_MAX_EDITS) return null;
  }
  return left === before.length && right === after.length ? edits : null;
}
/** Model output only. JSON repair is local and bounded; domain validation must still accept the result. */
export function readModelJsonObject(completion: {
  content?: string | null;
  finishReason?: string | null;
}): ModelJsonReply {
  const failed: ModelJsonReply = { value: null, repaired: false, edits: 0 };
  if (["length", "max_tokens", "content_filter", "tool_calls"].includes(completion.finishReason ?? "")) return failed;
  const candidate = objectCandidate(completion.content ?? "");
  if (!candidate) return failed;
  const originalTokens = tokens(candidate);
  if (!originalTokens) return failed;
  const strict = parseSceneObject(candidate);
  if (strict) return { value: strict, repaired: false, edits: 0 };
  if (!["stop", "end_turn"].includes(completion.finishReason ?? "")) return failed;
  const normalized = candidate;
  try {
    const repaired = jsonrepair(normalized);
    if (repaired.length > MODEL_JSON_MAX_CHARACTERS) return failed;
    const repairedTokens = tokens(repaired);
    const edits = repairedTokens && punctuationEdits(originalTokens, repairedTokens);
    if (edits === null) return failed;
    const value = parseSceneObject(repaired);
    return value ? { value, repaired: true, edits } : failed;
  } catch {
    return failed;
  }
}
export function extractModelJsonObject(
  completion: Parameters<typeof readModelJsonObject>[0],
): Record<string, unknown> | null {
  return readModelJsonObject(completion).value;
}
