import { VILLAGES_PACKAGE_ID, villagesDocuments } from "../../adapters/engine/runtime-host.js";
import { villagesLanguageModels } from "../../adapters/models/language-models.js";
import { quoteUsageRate } from "../../adapters/models/usage-ledger.js";
import { coerceVillageState } from "../../domain/decoding/village-codec.js";
import { asRecord } from "../../domain/rules/coerce.js";
import { badRequest } from "../../domain/rules/errors.js";
import { agendaRequestCount, remainingRequests, translationBatchSize } from "../../domain/rules/generation-budgets.js";
import { remapVenues } from "../../domain/rules/prompt-preset.js";
import { VILLAGE_WEEKDAYS } from "../../domain/rules/village-clock.js";
import { previewBackgroundJobs } from "../../jobs/background-work.js";
import { privatePreparationRooms } from "../../jobs/private-space-preparation.js";
import { agendaRevision } from "../world/village.js";
import { villagesConnectionIdFor, villagesImageConnectionChoice } from "./connections.js";

type Resident = { id: string; name: string; requests: number };
export type BurstPreviewResult = {
  requests: number | null;
  residents: Resident[];
  dollars: { min: number; max: number } | null;
  unknownCosts: number | null;
  note: string;
};
/** Read-only: never uses readVillageState, reconciles jobs, or calls a completion. */
export async function previewVillageBurst(raw: unknown): Promise<BurstPreviewResult> {
  const args = asRecord(raw),
    action = String(args.action);
  if (!["agenda", "translation", "influence", "change", "images", "retry", "founding"].includes(action))
    throw badRequest("Choose a supported generation preview.");
  const record = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, "villages-village");
  const original = coerceVillageState(record?.data);
  const state = coerceVillageState(structuredClone(original));
  if (action === "change") {
    const patch = asRecord(args.settings);
    for (const key of ["setting", "selectedLorebookIds", "loreTokenBudget"] as const)
      if (patch[key] !== undefined) (state as unknown as Record<string, unknown>)[key] = patch[key];
    if (args.venue) {
      const venue = asRecord(args.venue);
      const index = state.venues.findIndex((entry) => entry.id === venue.id);
      if (index >= 0) state.venues[index] = { ...state.venues[index], ...venue } as (typeof state.venues)[number];
    }
  }
  const proposed = coerceVillageState(state);
  const bootstrap =
    action === "change" &&
    typeof asRecord(args.settings).setting === "string" &&
    proposed.setting.trim().length > 0 &&
    remapVenues(original.venues).length === 0;

  let system: Awaited<ReturnType<ReturnType<typeof villagesLanguageModels>["resolveForRequest"]>> | null = null;
  try {
    system = await villagesLanguageModels().resolveForRequest({
      connectionId: await villagesConnectionIdFor("system"),
    });
  } catch {
    /* Show counts with unknown prices. */
  }
  const batchSize = translationBatchSize(system?.maxOutputTokens);
  const jobs = await previewBackgroundJobs(batchSize);
  const residents: Resident[] = [];
  const target = typeof args.characterId === "string" ? args.characterId : "";
  let languageRequests = bootstrap ? 1 : 0,
    imageRequests = 0;
  if (action === "founding" && original.foundingPreparation && original.foundingPreparation.status !== "ready")
    languageRequests =
      (original.foundingPreparation.venueDetailsSeeded ? 0 : 1) +
      privatePreparationRooms(original).filter(({ zone }) => zone.preparation?.status !== "ready").length;
  const active = (kind: string, id: string) =>
    jobs.find(
      (j) =>
        j.seed === original.seed &&
        j.kind === kind &&
        j.subjectId === id &&
        !["completed", "obsolete"].includes(j.status),
    );
  for (const resident of proposed.villagers) {
    if (action === "images" || action === "retry" || (target && resident.characterId !== target)) continue;
    if (!target && action === "agenda") continue;
    let requests = 0;
    if (
      action === "founding" &&
      proposed.foundingPreparation?.status !== "ready" &&
      proposed.foundingPreparation &&
      !proposed.foundingPreparation.completedIds.includes(resident.characterId) &&
      resident.agenda?.personalizationPending
    ) {
      const saved = active("agenda", resident.characterId);
      requests = remainingRequests(1, saved?.completedSteps ?? 0);
    }
    if (
      action === "change" &&
      proposed.foundingPreparation?.status !== "pending" &&
      (!resident.agenda?.generatedAt || resident.agenda.personalizationPending) &&
      (bootstrap || agendaRevision(proposed, resident.characterId) !== agendaRevision(original, resident.characterId))
    )
      requests += agendaRequestCount(VILLAGE_WEEKDAYS);
    if (action === "agenda") {
      const saved = active("agenda", resident.characterId);
      const replay = saved && ["failed", "interrupted", "paused"].includes(saved.status);
      requests += remainingRequests(agendaRequestCount(VILLAGE_WEEKDAYS), replay ? saved.completedSteps : 0);
    }
    if (requests) residents.push({ id: resident.characterId, name: resident.cardSnapshot.name, requests });
    languageRequests += requests;
  }
  if (action === "retry") {
    const job = jobs.find((j) => j.id === args.jobId && j.seed === original.seed);
    if (job?.kind === "agenda" && !["completed", "obsolete"].includes(job.status))
      return previewVillageBurst({ action: "agenda", characterId: job.subjectId });
    if (job?.kind === "translation") languageRequests = 0;
    else if (job && !["completed", "obsolete"].includes(job.status)) {
      if (job.remainingRequests === null)
        return {
          requests: null,
          residents: [],
          dollars: null,
          unknownCosts: null,
          note: "Remaining requests and costs are unknown for this background task. Saved responses will be reused.",
        };
      languageRequests = job.remainingRequests;
    }
  }
  if (action === "images") {
    if (args.jobId !== undefined || args.systemRequests !== undefined)
      throw badRequest("Sprite generation is retired. Image previews are for scenery only.");
    const count = Number(args.count ?? 1);
    if (!Number.isInteger(count) || count < 0 || count > 200) throw badRequest("Choose a bounded image batch size.");
    imageRequests = count;
    languageRequests = 0;
  }
  let min = 0,
    max = 0,
    unknownCosts = 0;
  if (languageRequests) {
    const quote = system ? await quoteUsageRate(system.connectionId, system.model) : null;
    const native = quote?.rate;
    const divisor = native?.currency === "CNY" ? native.yuanPerDollar : 1;
    const rate =
      divisor && native
        ? {
            ...native,
            ...(native.longContext ?? {}),
            input: Math.max(native.input, native.longContext?.input ?? 0) / divisor,
            output: Math.max(native.output, native.longContext?.output ?? 0) / divisor,
            cacheWrite:
              Math.max(
                native.cacheWrite ?? 0,
                native.cacheWriteOneHour ?? 0,
                native.longContext?.cacheWrite ?? 0,
                native.longContext?.cacheWriteOneHour ?? 0,
              ) / divisor,
            perRequest: native.perRequest !== undefined ? native.perRequest / divisor : undefined,
          }
        : null;
    if (rate?.perRequest !== undefined) {
      min += languageRequests * rate.perRequest;
      max += languageRequests * rate.perRequest;
    } else if (rate && system?.maxContext && system.maxOutputTokens) {
      min += languageRequests * (rate.perRequest ?? 0);
      max +=
        languageRequests *
        ((rate.perRequest ?? 0) +
          (system.maxContext * Math.max(rate.input, rate.cacheWrite ?? 0)) / 1e6 +
          (Math.min(system.maxOutputTokens, 4_000) * rate.output) / 1e6);
    } else unknownCosts += languageRequests;
  }
  if (imageRequests) {
    const choice = await villagesImageConnectionChoice();
    const connectionId = typeof args.connectionId === "string" ? args.connectionId : choice.connectionId;
    const quote = connectionId ? await quoteUsageRate(connectionId, "") : null;
    if (quote?.rate?.perRequest !== undefined) {
      const divisor = quote.rate.currency === "CNY" ? quote.rate.yuanPerDollar : 1;
      if (divisor) {
        min += (imageRequests * quote.rate.perRequest) / divisor;
        max += (imageRequests * quote.rate.perRequest) / divisor;
      } else unknownCosts += imageRequests;
    } else unknownCosts += imageRequests;
  }
  return {
    requests: languageRequests + imageRequests,
    residents,
    dollars:
      languageRequests + imageRequests === 0
        ? { min: 0, max: 0 }
        : languageRequests + imageRequests > unknownCosts
          ? { min, max }
          : null,
    unknownCosts,
    note:
      (action === "founding"
        ? "One request per unfinished private space, plus unfinished resident routines and initial venue details. "
        : "") +
      (bootstrap ? "Includes one public-Venue suggestion request. " : "") +
      "Read-only forecast for current state. Routine generation uses one request. Schedule influence and daily variation are local and spend no tokens. Reused saved responses do not require new requests. Token prices use configured full-context/output budgets; actual replies usually use less. Unknown image/provider costs are excluded. No spending limit.",
  };
}
