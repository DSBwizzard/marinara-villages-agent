import { createHash } from "node:crypto";
import type { VenueScene } from "../models/scene-model.js";
import { conflict } from "./errors.js";

/** Identity uses the submitted input, not fresh model settings or current Scene state. */
export function rejectedInputHash(input: {
  message?: unknown;
  mode?: unknown;
  targetId?: unknown;
  contact?: unknown;
  attentionChoice?: unknown;
}): string {
  return createHash("sha256")
    .update(
      JSON.stringify([
        input.message,
        input.mode,
        input.targetId || "",
        input.contact ?? null,
        input.attentionChoice ?? null,
      ]),
    )
    .digest("hex");
}

export function rejectedSubmission(scene: VenueScene, id: string, input: Parameters<typeof rejectedInputHash>[0]) {
  const receipt = scene.rejectedSubmissions?.find((row) => row.id === id);
  if (receipt && receipt.inputHash !== rejectedInputHash(input))
    throw conflict("That submission ID belongs to a different line.");
  return receipt;
}
