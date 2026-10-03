import { createHash } from "node:crypto";
import { STUDIO_FACING_PROMPTS } from "./sprite-studio-model.js";
import type { StudioCell, StudioIdentity, StudioSettings, StudioSheet } from "./sprite-studio-model.js";

export function studioGenerationMode(_value: { generationMode?: unknown; individual?: unknown }) {
  return "individual" as const;
}

export function studioLookFingerprint(
  identity: Pick<StudioIdentity, "name" | "appearance" | "view" | "facingPrompt" | "referenceUrl">,
  style: string,
) {
  return createHash("sha256")
    .update(
      JSON.stringify([
        identity.name,
        identity.appearance,
        identity.view,
        identity.facingPrompt,
        identity.referenceUrl,
        style,
      ]),
    )
    .digest("hex");
}

export function studioNeedsInspection(sheet: StudioSheet, cell: StudioCell) {
  return (
    !cell.reviewAcknowledged &&
    (sheet.validation?.status === "needs-review" || cell.validation?.status === "needs-review")
  );
}

export function normalizeStudioGenerationSettings(settings: StudioSettings) {
  // Historical jobs retain their recorded mode; all new work is individual.
  settings.generationMode = "individual";
  settings.individual = true;
  for (const guidance of Object.values(settings.facingPrompts ?? {}))
    if (
      guidance.side ===
      "Focus on the conversation partner off-screen to the right. Turn the head and eyes toward them while opening the body toward the camera, like an actor cheating out on stage."
    )
      guidance.side = STUDIO_FACING_PROMPTS.side;
}

export function studioDirectionKey(
  identity: StudioIdentity,
  look: string,
  expression: { label: string; name?: string; useWhen?: string; pose: string },
) {
  return createHash("sha256")
    .update(
      JSON.stringify([
        identity.character,
        identity.view,
        identity.facingPrompt,
        look,
        [expression.label, expression.name, expression.useWhen, expression.pose],
      ]),
    )
    .digest("hex");
}

export function studioReferencePolicy(connection: { source: string; model: string }) {
  const source = connection.source.toLowerCase();
  const model = connection.model.toLowerCase();
  const multiple =
    (/openrouter/.test(source) && /gemini|gpt-image/.test(model)) || /gemini/.test(source) || /gpt-image/.test(model);
  const unsupported = /dall-e/.test(model) || /^(fal|pollinations|horde|togetherai)$/.test(source);
  return {
    multiple,
    unsupported,
    notice: unsupported
      ? "This Engine path ignores reference images. Choose another connection for reference-led expressions."
      : multiple
        ? undefined
        : "This Engine connection may use only the primary reference. The accepted neutral is sent first; reference adherence still needs visual inspection.",
  };
}
