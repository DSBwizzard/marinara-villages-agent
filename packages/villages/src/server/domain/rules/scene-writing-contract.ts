import type { VenueScene } from "../models/scene-model.js";
import { conflict } from "./errors.js";
import { extractModelJsonObject, modelJsonWithinBounds } from "./json-reply.js";
import { parseSceneObject } from "./scene-json-syntax.js";

/** Refuse an unsupported Scene before generation can replace a retained response. */
export function assertCurrentSceneGeneration(scene: VenueScene) {
  if (scene.version !== 5 || !scene.villageSeed) throw conflict("Unsupported Scene format. Start a fresh Village.");
}

export function completeSceneObject(content: string, finishReason?: string): Record<string, unknown> | null {
  if (!modelJsonWithinBounds(content)) return null;
  if (finishReason !== "stop" && finishReason !== "end_turn") return null;
  const text = content
    .trim()
    .replace(/^```(?:json)?\s*\n/u, "")
    .replace(/\n```$/u, "");
  if (!text.startsWith("{") || !text.endsWith("}")) return null;
  const parsed = extractModelJsonObject({ content: text, finishReason });
  if (parsed) return parsed;
  // Some replies close the root after segments, then emit the keep field.
  const boundary = /\}\s*,\s*(?:keep|"keep")\s*:\s*(?=\[)/u.exec(text);
  if (!boundary) return null;
  const first = parseSceneObject(text.slice(0, boundary.index + 1));
  const tail = parseSceneObject('{"keep":' + text.slice(boundary.index + boundary[0].length));
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
