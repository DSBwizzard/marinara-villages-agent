import type { VenueScene } from "../models/scene-model.js";
import { conflict } from "./errors.js";
import { modelJsonWithinBounds, readModelJsonObject, type ModelJsonReply } from "./json-reply.js";
import { parseSceneObject } from "./scene-json-syntax.js";
import { asRecord } from "./coerce.js";

/** Refuse an unsupported Scene before generation can replace a retained response. */
export function assertCurrentSceneGeneration(scene: VenueScene) {
  if (scene.version !== 5 || !scene.villageSeed) throw conflict("Unsupported Scene format. Start a fresh Village.");
}

function readCommaSeparatedKeep(text: string) {
  const separator = /"(?:[^"\\]|\\.)*"|(?<end>\}\s*\]\s*\}\s*),\s*(?=\{\s*"keep"\s*:)/gu;
  const splits = [...text.matchAll(separator)].filter((match) => match.groups?.end);
  if (splits.length !== 1) return null;
  const [{ index, 0: boundary, groups }] = splits;
  const head = parseSceneObject(text.slice(0, index + groups!.end.length));
  const tail = parseSceneObject(text.slice(index + boundary.length));
  return head &&
    Object.keys(head).length === 1 &&
    Array.isArray(head.segments) &&
    tail &&
    Object.keys(tail).length === 1 &&
    Array.isArray(tail.keep)
    ? { segments: head.segments, keep: tail.keep }
    : null;
}

function ordinarySceneEnvelope(value: Record<string, unknown> | null): value is Record<string, unknown> {
  return (
    !!value &&
    Array.isArray(value.segments) &&
    value.segments.length > 0 &&
    (!Object.hasOwn(value, "keep") || Array.isArray(value.keep)) &&
    Object.keys(value).every((key) => key === "segments" || key === "keep")
  );
}

export function completeSceneObject(
  content: string,
  finishReason?: string,
  parsed?: ModelJsonReply,
  ordinaryReplyRecovery?: true,
  ordinaryFormatRecovery?: true | 2 | 3 | 4,
  splitKeepRecovery?: true | 2,
  explicitSceneReplacement?: true,
): Record<string, unknown> | null {
  if (finishReason !== "stop" && finishReason !== "end_turn") return null;
  const text = content
    .trim()
    .replace(/^```(?:json)?\s*\n/iu, "")
    .replace(/\r?\n```$/u, "")
    .trim();
  if (!text.startsWith("{") || !(text.endsWith("}") || (ordinaryReplyRecovery && text.endsWith("]")))) return null;
  if (text.endsWith("}")) {
    const value = (parsed ?? readModelJsonObject({ content, finishReason })).value;
    if (value) return value;
  }
  if (!modelJsonWithinBounds(content)) return null;
  if (ordinaryReplyRecovery === true && explicitSceneReplacement === true) {
    // shortcut: recognize the observed correction and an explicit replacement line, extend when another clear form fails.
    const replacement =
      /"(?:[^"\\]|\\.)*"|(?<correction>\r?\n[ \t]*(?:(?:Correction|Replacement): (?:Replace|Discard) (?:the|my) (?:previous|earlier|first) (?:draft|reply|answer)(?: with (?:this|the following) final (?:reply|answer))?[.:]|Wait [—-] I formatted badly; I placed the keep inside segments array closing\. Fix: produce one JSON object with "segments" array then "keep" array top-level\. Also I accidentally wrote two objects\. Let me output correctly\.)\s*)(?=\{)/giu;
    const corrections = [...text.matchAll(replacement)].filter((match) => match.groups?.correction);
    if (corrections.length === 1) {
      const [{ index, 0: correction }] = corrections;
      const prefix = text.slice(0, index).trimEnd();
      const earlier =
        parseSceneObject(prefix) ??
        (/\]\s*\}$/u.test(prefix) ? readCommaSeparatedKeep(prefix.replace(/\s*\]\s*\}$/u, "")) : null);
      const final = parseSceneObject(text.slice(index + correction.length));
      if (ordinarySceneEnvelope(earlier) && ordinarySceneEnvelope(final)) return final;
    }
  }
  if (
    ordinaryFormatRecovery === true ||
    ordinaryFormatRecovery === 2 ||
    ordinaryFormatRecovery === 3 ||
    ordinaryFormatRecovery === 4
  ) {
    // Match complete strings first so punctuation inside the prose cannot be repaired.
    const separator = /"(?:[^"\\]|\\.)*"|(?<extra>\}(?:\s*,\s*\}|\s*\]\s*\})\s*,\s*)(?=\{)/gu;
    const extra = [...text.matchAll(separator)].filter(
      (match) => match.groups?.extra && (ordinaryFormatRecovery !== true || !match[0].includes("]")),
    );
    if (extra.length === 1) {
      const [{ index, 0: duplicate }] = extra;
      const corrected = parseSceneObject(text.slice(0, index) + "}," + text.slice(index + duplicate.length));
      if (
        corrected &&
        Object.keys(corrected).length === 1 &&
        Array.isArray(corrected.segments) &&
        corrected.segments.every((value: unknown) => {
          const line = asRecord(value);
          return (line.kind === "narration" || line.kind === "dialogue") && !Object.hasOwn(line, "requires");
        })
      )
        return corrected;
    }
  }
  if (ordinaryReplyRecovery) {
    if (splitKeepRecovery === 2) {
      const split = readCommaSeparatedKeep(text);
      if (split) return split;
    }
    const bare = /\}\s*\r?\n\s*keep\s*:\s*(?=\[)/u.exec(text);
    if (bare && text.endsWith("]")) {
      const head = parseSceneObject(text.slice(0, bare.index + 1));
      const tail = parseSceneObject('{"keep":' + text.slice(bare.index + bare[0].length) + "}");
      if (
        head &&
        Object.keys(head).length === 1 &&
        Array.isArray(head.segments) &&
        tail &&
        Object.keys(tail).length === 1 &&
        Array.isArray(tail.keep)
      )
        return { segments: head.segments, keep: tail.keep };
    }
    if (!text.endsWith("}")) return null;
    const missingIdQuote = /\{"id":"([A-Za-z][A-Za-z0-9_-]{0,47}),"kind":"(dialogue|narration)",/gu;
    const matches = [...text.matchAll(missingIdQuote)];
    if (matches.length === 1) {
      const corrected = parseSceneObject(text.replace(missingIdQuote, '{"id":"$1","kind":"$2",'));
      if (
        corrected &&
        Object.keys(corrected).length === 1 &&
        Array.isArray(corrected.segments) &&
        corrected.segments.some((line) => line?.id === matches[0][1] && line.kind === matches[0][2])
      )
        return corrected;
    }
    const split = /\}\s+(?=\{\s*"(?:keep|keeps|effects)"\s*:)/u.exec(text);
    if (split) {
      const head = parseSceneObject(text.slice(0, split.index + 1));
      const tail = parseSceneObject(text.slice(split.index + split[0].length));
      if (
        head &&
        Object.keys(head).length === 1 &&
        Array.isArray(head.segments) &&
        tail &&
        Object.keys(tail).length === 1
      ) {
        const key = Object.keys(tail)[0];
        if (["keep", "keeps", "effects"].includes(key) && Array.isArray(tail[key]))
          return { segments: head.segments, [key]: tail[key] };
      }
    }
  }
  // Some replies close the root after segments, then emit the keep field or a keep-only object.
  const extraKeep =
    splitKeepRecovery === true || splitKeepRecovery === 2
      ? [...text.matchAll(/"(?:[^"\\]|\\.)*"|(?<boundary>\}\s*\]\s*,\s*"keep"\s*:\s*(?=\[))/gu)].filter(
          (match) => match.groups?.boundary,
        )
      : [];
  const splitKeep = extraKeep.length === 1 ? extraKeep[0] : undefined;
  const boundary =
    splitKeep ?? /\}\s*(?=\{\s*"keep"\s*:)|\}(?:\s*,\s*|[ \t]*\r?\n\s*)(?:keep|"keep")\s*:\s*(?=\[)/u.exec(text);
  if (!boundary) return null;
  const first = parseSceneObject(text.slice(0, boundary.index + 1));
  const suffix = text.slice(boundary.index + boundary[0].length);
  const tail = parseSceneObject(suffix.startsWith("{") ? suffix : '{"keep":' + suffix);
  if (
    !first ||
    Object.keys(first).length !== 1 ||
    !Array.isArray(first.segments) ||
    (splitKeep &&
      first.segments.some((value: unknown) => {
        const { kind } = asRecord(value);
        return kind !== "narration" && kind !== "dialogue";
      })) ||
    !tail ||
    Object.keys(tail).length !== 1 ||
    !Array.isArray(tail.keep)
  )
    return null;
  return { segments: first.segments, keep: tail.keep };
}
