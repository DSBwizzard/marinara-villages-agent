import { activationScope, bindActivationService, createActivationBinding } from "./activation-scope.js";
import { villagesLogger, villagesResources } from "./runtime-host.js";
import { createNativeSchedules, type NativeSchedules } from "./native-schedules-service.js";
import type { NativeWeekSchedule, NativeRoutine } from "../../domain/rules/schedule-rules.js";
import type { NativeScheduleSnapshot } from "./native-schedules-service.js";
export type { NativeScheduleSnapshot } from "./native-schedules-service.js";

export { parseBlockRange, activityAt } from "../../domain/rules/schedule-rules.js";
export type { NativeRoutine, NativeDayBlock, NativeWeekSchedule } from "../../domain/rules/schedule-rules.js";
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
export async function readNativeWeekSchedules(
  now: Date,
  characterIds?: readonly string[],
): Promise<Map<string, NativeWeekSchedule>> {
  return selected().readNativeWeekSchedules(now, characterIds);
}
export async function readNativeSchedules(
  now: Date,
  characterIds?: readonly string[],
): Promise<Map<string, NativeRoutine>> {
  return selected().readNativeSchedules(now, characterIds);
}
export async function readNativeRoutine(characterId: string, now: Date): Promise<NativeRoutine | null> {
  return selected().readNativeRoutine(characterId, now);
}
