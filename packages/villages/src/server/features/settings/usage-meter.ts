import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { UsageMeter } from "./usage-meter-service.js";

const binding = createActivationBinding<UsageMeter>("Villages usage meter is not configured.");
export function configureUsageMeter(service: UsageMeter): () => void {
  return binding.configure(bindActivationService(service));
}
export async function readUsageMeter(
  ...args: Parameters<UsageMeter["readUsageMeter"]>
): ReturnType<UsageMeter["readUsageMeter"]> {
  return binding.get().readUsageMeter(...args);
}
export async function resetUsagePeriod(
  ...args: Parameters<UsageMeter["resetUsagePeriod"]>
): ReturnType<UsageMeter["resetUsagePeriod"]> {
  return binding.get().resetUsagePeriod(...args);
}
export async function saveUsageRate(
  ...args: Parameters<UsageMeter["saveUsageRate"]>
): ReturnType<UsageMeter["saveUsageRate"]> {
  return binding.get().saveUsageRate(...args);
}
export async function saveLinkApiGroup(
  ...args: Parameters<UsageMeter["saveLinkApiGroup"]>
): ReturnType<UsageMeter["saveLinkApiGroup"]> {
  return binding.get().saveLinkApiGroup(...args);
}
