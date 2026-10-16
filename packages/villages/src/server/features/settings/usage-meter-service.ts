import type {
  readUsageLedger,
  quoteUsageRate,
  resetUsagePeriod as resetLedger,
  saveLinkApiGroup as saveGroup,
  saveUsageRate as saveRate,
} from "../../adapters/models/usage-ledger.js";
import type { villagesConnectionIdFor } from "./connections.js";
import type { previewBackgroundJobs } from "../../jobs/background-work.js";

export interface UsageMeterPorts {
  readUsageLedger: typeof readUsageLedger;
  quoteUsageRate: typeof quoteUsageRate;
  villagesConnectionIdFor: typeof villagesConnectionIdFor;
  resetLedger: typeof resetLedger;
  saveRate: typeof saveRate;
  saveGroup: typeof saveGroup;
  previewBackgroundJobs: typeof previewBackgroundJobs;
}

/** Current settings composition owns explicit ports; construction starts no work. */
export function createUsageMeter({
  readUsageLedger,
  quoteUsageRate,
  villagesConnectionIdFor,
  resetLedger,
  saveRate,
  saveGroup,
  previewBackgroundJobs,
}: UsageMeterPorts) {
  async function withBursts(ledger: Awaited<ReturnType<typeof readUsageLedger>>, details = true) {
    return {
      ...ledger,
      selectedConnections: details
        ? await Promise.all(
            (["system", "narration", "image"] as const).map(async (role) => {
              const connectionId = await villagesConnectionIdFor(role);
              const quote = connectionId ? await quoteUsageRate(connectionId, "") : null;
              return { role, connectionId, ...quote };
            }),
          )
        : [],
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
  async function readUsageMeter(details = true) {
    return withBursts(await readUsageLedger(details), details);
  }
  async function resetUsagePeriod() {
    return withBursts(await resetLedger());
  }
  async function saveUsageRate(...args: Parameters<typeof saveRate>) {
    return withBursts(await saveRate(...args));
  }
  async function saveLinkApiGroup(...args: Parameters<typeof saveGroup>) {
    return withBursts(await saveGroup(...args));
  }

  return { readUsageMeter, resetUsagePeriod, saveUsageRate, saveLinkApiGroup };
}

export type UsageMeter = ReturnType<typeof createUsageMeter>;
