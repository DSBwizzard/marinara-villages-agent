import { bindActivationService, createActivationBinding } from "./activation-scope.js";
import { type NativeSchedules } from "./native-schedules-service.js";
import type { NativeScheduleSnapshot } from "./native-schedules-service.js";
const binding = createActivationBinding<NativeSchedules>("Villages native-schedules is not configured.");

function selected(): NativeSchedules {
  return binding.get();
}
export function configureNativeSchedules(service: NativeSchedules): () => void {
  return binding.configure(bindActivationService(service));
}
export async function readNativeScheduleSnapshot(
  now: Date,
  characterIds?: readonly string[],
): Promise<NativeScheduleSnapshot> {
  return selected().readNativeScheduleSnapshot(now, characterIds);
}
