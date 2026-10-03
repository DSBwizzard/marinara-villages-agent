// Profiles are Engine-owned; Studio saves only the resolved style on each job.
import {
  compileImagePrompt,
  normalizeImageStyleProfileSettings,
  normalizeImageGenerationProfile,
  imageSourceToDefaultsService,
} from "@marinara-engine/shared";
import { asRecord, asString } from "./coerce.js";
import { studioEngineJson, studioDigest } from "./sprite-studio-engine.js";
import { badRequest } from "./errors.js";
import type { StudioSettings, StudioResolvedStyle } from "./sprite-studio-model.js";

export async function studioStyleProfiles() {
  const answer = asRecord(await studioEngineJson("/api/app-settings/ui"));
  let ui: Record<string, unknown> = {};
  try {
    ui = asRecord(JSON.parse(asString(answer.value) || "{}"));
  } catch {
    throw badRequest("Engine style settings could not be read. Existing artwork remains available.");
  }
  return normalizeImageStyleProfileSettings(ui.imageStyleProfiles);
}

export async function resolveStudioStyle(
  settings: StudioSettings,
  connection: { source: string; defaults: Record<string, unknown> },
): Promise<StudioResolvedStyle> {
  const selection = settings.styleSelection ?? { kind: "studio" as const };
  const profiles = selection.kind === "studio" ? normalizeImageStyleProfileSettings(null) : await studioStyleProfiles();
  const service = imageSourceToDefaultsService(connection.source);
  const defaults = normalizeImageGenerationProfile(connection.defaults.imageGeneration, service || "api").profile;
  const id =
    selection.kind === "studio"
      ? "off"
      : selection.kind === "profile"
        ? selection.profileId
        : defaults.styleProfileId || profiles.defaultProfileId;
  const profile = profiles.profiles.find((entry) => entry.id === id);
  if (!profile) throw badRequest("The selected Engine style profile is unavailable. Choose another style.");
  const prompt = selection.kind === "studio" ? settings.prompts[settings.style] : "";
  return {
    id,
    name: selection.kind === "studio" ? settings.style : profile.name,
    profile,
    prompt,
    fingerprint: studioDigest(JSON.stringify({ profile, prompt, defaults })),
  };
}

export function compileStudioPrompt(
  prompt: string,
  negativePrompt: string,
  style: StudioResolvedStyle,
  connection: { source: string; defaults: Record<string, unknown> },
) {
  const service = imageSourceToDefaultsService(connection.source);
  const defaults = normalizeImageGenerationProfile(connection.defaults.imageGeneration, service || "api").profile;
  const compiled = compileImagePrompt({
    kind: "sprite",
    // Compile only Engine-owned style and defaults, not sheet instructions.
    // Inferring compact subject tags from those instructions can turn exclusions
    // such as scenery or wings into unwanted positive cues.
    prompt: "",
    generatedStyle: style.profile.styleText,
    negativePrompt,
    styleProfiles: { defaultProfileId: style.id, profiles: [style.profile] },
    styleProfileId: style.id,
    imageDefaults: defaults,
    omitProfileSubjectTags: true,
  });
  // Preserve explicit geometry, references, facing and matte after grammar transforms.
  return {
    prompt: [compiled.prompt, "VILLAGES SHEET REQUIREMENTS:\n" + prompt].filter(Boolean).join("\n\n"),
    negativePrompt: compiled.negativePrompt,
  };
}
