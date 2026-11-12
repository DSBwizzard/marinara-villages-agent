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
