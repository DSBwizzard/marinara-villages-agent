import { asRecord } from "./coerce.js";
import { villagesDocuments, villagesLanguageModels, VILLAGES_PACKAGE_ID } from "./package-runtime.js";
import { villagesConnectionIdFor, villagesImageConnectionChoice } from "./connections.js";
import { coerceVillageState } from "./village-store.js";
import { readNativeScheduleSnapshot } from "./native-schedules.js";
import { remapBlocks, remapBlockKeys, remapDispatchDisposition } from "./native-remap.js";
import { remapSignatureFor, agendaRevision } from "./village.js";
import { previewBackgroundJobs } from "./background-work.js";
import { quoteUsageRate } from "./usage-meter.js";
import {
  translationBatchSize,
  translationRequestCount,
  remainingRequests,
  agendaRequestCount,
} from "./generation-budgets.js";
import { VILLAGE_WEEKDAYS } from "./village-clock.js";
import { remapVenues } from "./prompt-preset.js";
import { badRequest } from "./errors.js";

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
  if (!["agenda", "translation", "change", "images", "retry"].includes(action))
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
  const active = (kind: string, id: string) =>
    jobs.find(
      (j) =>
        j.seed === original.seed &&
        j.kind === kind &&
        j.subjectId === id &&
        !["completed", "obsolete"].includes(j.status),
    );
  const snapshot =
    action === "images" || action === "retry"
      ? null
      : await readNativeScheduleSnapshot(
          new Date(),
          proposed.villagers.map((r) => r.characterId),
        );
  if (snapshot && !snapshot.cardsReadable)
    return {
      requests: null,
      residents: [],
      dollars: null,
      unknownCosts: null,
      note: "The native schedules could not be read; request counts and costs are unknown.",
    };
  const schedules = new Map(snapshot?.schedules.map((schedule) => [schedule.characterId, schedule]) ?? []);
  for (const resident of proposed.villagers) {
    if (action === "images" || action === "retry" || (target && resident.characterId !== target)) continue;
    if (!target && action === "agenda") continue;
    const schedule = schedules.get(resident.characterId);
    let requests = 0;
    if (schedule && resident.ingestSchedule !== false && (action === "agenda" || resident.agenda?.generatedAt)) {
      const blocks = remapBlocks(schedule);
      const wishes = resident.agenda?.wishes ?? [];
      const signature = remapSignatureFor(proposed, resident.characterId, schedule.weekStart, blocks, wishes);
      const previous = remapSignatureFor(original, resident.characterId, schedule.weekStart, blocks, wishes);
      const lens = remapSignatureFor(proposed, resident.characterId, "founding", [], wishes);
      const forced = action === "translation";
      const needs =
        forced || remapDispatchDisposition(resident.remap, signature, remapBlockKeys(blocks), lens) === "generate";
      if ((needs || bootstrap) && (action !== "change" || signature !== previous || bootstrap)) {
        const saved = forced ? undefined : active("translation", resident.characterId);
        const same =
          saved &&
          asRecord(saved.input).signature === signature &&
          asRecord(saved.input).generation === (resident.translationGeneration ?? "");
        const frozen = same && Number(saved.settings.translationBatchSize);
        requests = translationRequestCount(blocks.length, frozen || batchSize);
        if (same) requests = remainingRequests(requests, saved.completedSteps);
      }
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
    if (job && !["completed", "obsolete"].includes(job.status)) {
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
    const rate = quote?.rate;
    if (rate?.perRequest !== undefined) {
      min += languageRequests * rate.perRequest;
      max += languageRequests * rate.perRequest;
    } else if (rate && system?.maxContext && system.maxOutputTokens) {
      min += languageRequests * (rate.perRequest ?? 0);
      max +=
        languageRequests *
        ((rate.perRequest ?? 0) +
          (system.maxContext * Math.max(rate.input, rate.cacheWrite ?? 0)) / 1e6 +
          (system.maxOutputTokens * rate.output) / 1e6);
    } else unknownCosts += languageRequests;
  }
  if (imageRequests) {
    const choice = await villagesImageConnectionChoice();
    const connectionId = typeof args.connectionId === "string" ? args.connectionId : choice.connectionId;
    const quote = connectionId ? await quoteUsageRate(connectionId, "") : null;
    if (quote?.rate?.perRequest !== undefined) {
      min += imageRequests * quote.rate.perRequest;
      max += imageRequests * quote.rate.perRequest;
    } else unknownCosts += imageRequests;
  }
  return {
    requests: languageRequests + imageRequests,
    residents,
    dollars: languageRequests + imageRequests > unknownCosts ? { min, max } : null,
    unknownCosts,
    note:
      (bootstrap ? "Includes one public-Venue suggestion request and translations after new venues arrive. " : "") +
      "Read-only forecast for current state. Includes follow-on translation. Reused saved responses do not require new requests. Token prices use configured full-context/output budgets; actual replies usually use less. Unknown image/provider costs are excluded. No spending limit.",
  };
}
