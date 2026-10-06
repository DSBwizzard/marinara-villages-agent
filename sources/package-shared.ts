// Public Engine utilities, bundled from the pinned source snapshot.
export { compileImagePrompt } from "./engine/packages/shared/dist/utils/image-prompt-compiler.js";
export { normalizeSpriteExpressionLabel } from "./engine/packages/shared/dist/utils/sprite-labels.js";
export { normalizeImageStyleProfileSettings } from "./engine/packages/shared/dist/constants/image-style-profiles.js";
export {
  normalizeImageGenerationProfile,
  imageSourceToDefaultsService,
} from "./engine/packages/shared/dist/constants/image-generation-defaults.js";

// Public Engine declarations pinned separately from bundled utilities.
export type { CapabilityCharacterRecord, CapabilityDocumentStore, CapabilityLanguageModelCompletion, CapabilityLanguageModelHost, CapabilityLanguageModelMessage, CapabilityPersistenceHost, CapabilityPersonaRecord, CapabilityResolvedLanguageModel, CapabilityResourceHost, CapabilityRuntimeHost, CapabilityRuntimeLogger } from "./engine-public/types/capability-runtime.js";
