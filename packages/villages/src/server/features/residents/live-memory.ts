import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { LiveMemoryService } from "./live-memory-service.js";
const binding = createActivationBinding<LiveMemoryService>("Villages live-memory service is not configured.");
export function configureLiveMemory(service: LiveMemoryService): () => void {
  return binding.configure(bindActivationService(service));
}

export async function processLiveMemories(
  ...args: Parameters<LiveMemoryService["processLiveMemories"]>
): ReturnType<LiveMemoryService["processLiveMemories"]> {
  return binding.get().processLiveMemories(...args);
}

export async function processLiveRelationships(
  ...args: Parameters<LiveMemoryService["processLiveRelationships"]>
): ReturnType<LiveMemoryService["processLiveRelationships"]> {
  return binding.get().processLiveRelationships(...args);
}
