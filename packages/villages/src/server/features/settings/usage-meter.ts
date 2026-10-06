import {
  readUsageLedger,
  resetUsagePeriod as resetLedger,
  saveLinkApiGroup as saveGroup,
  saveUsageRate as saveRate,
} from "../../adapters/models/usage-ledger.js";
import { previewBackgroundJobs } from "../../jobs/background-work.js";

export * from "../../adapters/models/usage-ledger.js";
async function withBursts(ledger: Awaited<ReturnType<typeof readUsageLedger>>, details = true) {
  return {
    ...ledger,
    bursts: details
      ? (await previewBackgroundJobs())
          .filter((job) => !["completed", "obsolete"].includes(job.status))
          .map(({ id, kind, label, status, cause, remainingRequests, remainingBlocks }) => ({
            id,
            kind,
            label,
            status,
            cause,
            remainingRequests,
            remainingBlocks,
          }))
      : [],
  };
}
export async function readUsageMeter(details = true) {
  return withBursts(await readUsageLedger(details), details);
}
export async function resetUsagePeriod() {
  return withBursts(await resetLedger());
}
export async function saveUsageRate(...args: Parameters<typeof saveRate>) {
  return withBursts(await saveRate(...args));
}
export async function saveLinkApiGroup(...args: Parameters<typeof saveGroup>) {
  return withBursts(await saveGroup(...args));
}
