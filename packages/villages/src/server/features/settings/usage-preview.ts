import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { UsagePreview } from "./usage-preview-service.js";
export type { BurstPreviewResult } from "./usage-preview-service.js";
const binding = createActivationBinding<UsagePreview>("Villages usage preview is not configured.");
export function configureUsagePreview(service: UsagePreview): () => void {
  return binding.configure(bindActivationService(service));
}
export async function previewVillageBurst(
  ...args: Parameters<UsagePreview["previewVillageBurst"]>
): ReturnType<UsagePreview["previewVillageBurst"]> {
  return binding.get().previewVillageBurst(...args);
}
