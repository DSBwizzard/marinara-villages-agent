import type { VenueScene } from "../models/scene-model.js";
import { conflict } from "./errors.js";
import { modelJsonWithinBounds, readModelJsonObject, type ModelJsonReply } from "./json-reply.js";
import { parseSceneObject } from "./scene-json-syntax.js";

/** Refuse an unsupported Scene before generation can replace a retained response. */
export function assertCurrentSceneGeneration(scene: VenueScene) {
  if (scene.version !== 5 || !scene.villageSeed) throw conflict("Unsupported Scene format. Start a fresh Village.");
}

export function completeSceneObject(
  content: string,
  finishReason?: string,
  parsed?: ModelJsonReply,
  ordinaryReplyRecovery?: true,
): Record<string, unknown> | null {
  if (finishReason !== "stop" && finishReason !== "end_turn") return null;
  const text = content
    .trim()
    .replace(/^```(?:json)?\s*\n/iu, "")
    .replace(/\r?\n```$/u, "")
    .trim();
  if (!text.startsWith("{") || !text.endsWith("}")) return null;
  const value = (parsed ?? readModelJsonObject({ content, finishReason })).value;
  if (value) return value;
  if (!modelJsonWithinBounds(content)) return null;
  if (ordinaryReplyRecovery) {
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
  const boundary = /\}\s*(?=\{\s*"keep"\s*:)|\}(?:\s*,\s*|[ \t]*\r?\n\s*)(?:keep|"keep")\s*:\s*(?=\[)/u.exec(text);
  if (!boundary) return null;
  const first = parseSceneObject(text.slice(0, boundary.index + 1));
  const suffix = text.slice(boundary.index + boundary[0].length);
  const tail = parseSceneObject(suffix.startsWith("{") ? suffix : '{"keep":' + suffix);
  if (
    !first ||
    Object.keys(first).length !== 1 ||
    !Array.isArray(first.segments) ||
    !tail ||
    Object.keys(tail).length !== 1 ||
    !Array.isArray(tail.keep)
  )
    return null;
  return { segments: first.segments, keep: tail.keep };
}
