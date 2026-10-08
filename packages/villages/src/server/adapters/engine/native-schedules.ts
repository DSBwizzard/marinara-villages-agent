import { activationScope, bindActivationService, createActivationBinding } from "./activation-scope.js";
import { villagesLogger, villagesResources } from "./runtime-host.js";
import { createNativeSchedules, type NativeSchedules } from "./native-schedules-service.js";
import type { NativeScheduleSnapshot } from "./native-schedules-service.js";
const binding = createActivationBinding<NativeSchedules>("Villages native-schedules is not configured.");
const standalone = createNativeSchedules({ villagesResources, villagesLogger });
function selected(): NativeSchedules {
  if (activationScope()) return binding.get();
  return binding.maybe() ?? standalone;
}
export function configureNativeSchedules(service: NativeSchedules): () => void {
  return binding.configure(bindActivationService(service));
}
export function resetNativeScheduleCache(): void {
  return selected().resetNativeScheduleCache();
}
export async function readNativeScheduleSnapshot(
  now: Date,
  characterIds?: readonly string[],
): Promise<NativeScheduleSnapshot> {
  return selected().readNativeScheduleSnapshot(now, characterIds);
}
