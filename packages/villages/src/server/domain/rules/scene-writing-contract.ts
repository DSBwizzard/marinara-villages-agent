import type { VenueScene } from "../models/scene-model.js";
import { conflict } from "./errors.js";
import { extractModelJsonObject, modelJsonWithinBounds } from "./json-reply.js";

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
  return extractModelJsonObject({ content: text, finishReason });
}
