import { createHash } from "node:crypto";
import { villagesDocuments, VILLAGES_PACKAGE_ID } from "./package-runtime.js";
import { asRecord } from "./coerce.js";
import { parseStudioPreparation } from "./sprite-studio-preparation.js";
import { remainingRequests } from "./generation-budgets.js";
import type { StudioJob } from "./sprite-studio-model.js";
import type { VillageVillager } from "./types.js";
import { badRequest } from "./errors.js";
export function studioRetryRequests(job: StudioJob) {
  if (job.status === "ready") return { imageRequests: 0, systemRequests: 0, connectionId: job.connectionId };
  let savedPreparation = job.preparation?.status === "ready";
  const answered = job.preparation?.attempts?.at(-1);
  if (!savedPreparation && answered?.status === "answered") {
    try {
      parseStudioPreparation(answered.content ?? "", job.requestedExpressions ?? []);
      savedPreparation = true;
    } catch {
      /* Invalid saved directions require explicit regeneration. */
    }
  }
  return {
    imageRequests: remainingRequests(job.planned, job.sheets.length + (job.pendingSource ? 1 : 0)),
    systemRequests: savedPreparation ? 0 : 1,
    connectionId: job.connectionId,
  };
}
export async function previewStudioRetry(resident: VillageVillager, jobId: string) {
  const id =
    "sprite-studio-" +
    createHash("sha256")
      .update(resident.characterId + ":" + resident.addedAt)
      .digest("hex");
  const record = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, id);
  const jobs = asRecord(record?.data).jobs;
  const job = Array.isArray(jobs) ? (jobs.find((j: StudioJob) => j.id === jobId) as StudioJob | undefined) : undefined;
  if (!job) throw badRequest("The saved sprite batch could not be previewed.");
  return studioRetryRequests(job);
}
