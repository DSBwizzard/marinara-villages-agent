import { coerceWish } from "./prompt-preset.js";
import { shortWishText, wishPolicy } from "./wish-policy.js";
import type { WishActivity, WishAttempt, WishLifecycle, WishNeed, WishOutcome } from "./wish-types.js";
import type { VillageWish } from "./types.js";

const object = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
const instant = (value: unknown): string =>
  typeof value === "string" && Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : "";
const count = (value: unknown): number =>
  Number.isSafeInteger(value) && (value as number) >= 0 ? (value as number) : 0;
export function storedWish(value: unknown): VillageWish | undefined {
  const raw = object(value);
  if (!shortWishText(raw.id) || !shortWishText(raw.wish)) return undefined;
  const wish = coerceWish(raw, raw.id as string, instant(raw.addedAt));
  if (!wish) return undefined;
  wish.expiresAt = instant(raw.expiresAt);
  if (instant(raw.learnedAt)) {
    wish.learnedAt = instant(raw.learnedAt);
    wish.learnedLineIds = Array.isArray(raw.learnedLineIds)
      ? raw.learnedLineIds.filter((id): id is string => typeof id === "string")
      : [];
  }
  return wish;
}
export function coerceWishActivities(value: unknown): WishActivity[] {
  if (!Array.isArray(value)) return [];
  return value
    .flatMap((entry) => {
      const raw = object(entry);
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(shortWishText(raw.dateKey)) ||
        !shortWishText(raw.wishId) ||
        !Number.isInteger(raw.startMinute) ||
        !Number.isInteger(raw.endMinute) ||
        (raw.startMinute as number) < 0 ||
        (raw.endMinute as number) > 1440 ||
        (raw.startMinute as number) >= (raw.endMinute as number) ||
        !shortWishText(raw.activity) ||
        !shortWishText(raw.baseRevision)
      )
        return [];
      return [
        {
          wishId: shortWishText(raw.wishId),
          dateKey: raw.dateKey as string,
          startMinute: raw.startMinute as number,
          endMinute: raw.endMinute as number,
          venueId: shortWishText(raw.venueId),
          zoneId: shortWishText(raw.zoneId) || undefined,
          activity: shortWishText(raw.activity, 240),
          reason: shortWishText(raw.reason, 240),
          baseRevision: shortWishText(raw.baseRevision),
        },
      ];
    })
    .slice(-8);
}
export function coerceWishOutcome(value: unknown): WishOutcome | undefined {
  const raw = object(value);
  const wish = storedWish(raw.wish);
  if (
    !wish ||
    !instant(raw.fulfilledAt) ||
    !shortWishText(raw.memoryId) ||
    !shortWishText(raw.needId) ||
    !Number.isSafeInteger(raw.sequence) ||
    (raw.sequence as number) < 0 ||
    (raw.kind !== "fulfilled" && raw.kind !== "expired")
  )
    return undefined;
  return {
    wish,
    fulfilledAt: instant(raw.fulfilledAt),
    memoryId: shortWishText(raw.memoryId),
    needId: shortWishText(raw.needId),
    sequence: raw.sequence as number,
    kind: raw.kind,
    ...(instant(raw.correctedAt) ? { correctedAt: instant(raw.correctedAt) } : {}),
  };
}
export function coerceWishLifecycle(value: unknown): WishLifecycle | undefined {
  const raw = object(value);
  if (raw.version !== 1) return undefined;
  const seen = new Set<string>();
  const needs: WishNeed[] = Array.isArray(raw.needs)
    ? raw.needs.flatMap((entry) => {
        const need = object(entry),
          id = shortWishText(need.id);
        if (!id || seen.has(id)) return [];
        seen.add(id);
        return [
          {
            id,
            subject: shortWishText(need.subject, 80),
            action: shortWishText(need.action, 80),
            policy: wishPolicy(need.policy),
            aliases: Array.isArray(need.aliases)
              ? need.aliases
                  .map((alias) => shortWishText(alias))
                  .filter(Boolean)
                  .slice(-8)
              : [],
            lastFulfilledAt: instant(need.lastFulfilledAt),
            ...(need.state === "active" ||
            need.state === "fulfilled" ||
            need.state === "expired" ||
            need.state === "corrected"
              ? { state: need.state as WishNeed["state"] }
              : {}),
            ...(instant(need.latestAt) ? { latestAt: instant(need.latestAt) } : {}),
            ...(Number.isSafeInteger(need.lastOutcomeSequence) && (need.lastOutcomeSequence as number) >= 0
              ? { lastOutcomeSequence: need.lastOutcomeSequence as number }
              : {}),
          },
        ];
      })
    : [];
  const job = object(raw.attempt);
  let attempt: WishAttempt | undefined;
  if (shortWishText(job.id) && instant(job.at)) {
    const stage =
      job.stage === "reserved" || job.stage === "generated" || job.stage === "comparing" || job.stage === "validated"
        ? job.stage
        : "done";
    attempt = {
      id: shortWishText(job.id),
      ...(job.resetRefill === true ? { resetRefill: true as const } : {}),
      dateKey: shortWishText(job.dateKey, 10),
      at: instant(job.at),
      stage,
      candidate: storedWish(job.candidate),
      activity: coerceWishActivities(job.activity ? [job.activity] : [])[0],
      ...(typeof job.accepted === "boolean" ? { accepted: job.accepted } : {}),
      matchedNeedId: shortWishText(job.matchedNeedId) || undefined,
      routineIdea:
        object(job.routineIdea).flexible === true
          ? {
              activity: shortWishText(object(job.routineIdea).activity, 160),
              venueId: shortWishText(object(job.routineIdea).venueId, 160),
              zoneId: shortWishText(object(job.routineIdea).zoneId, 160),
              flexible: true,
            }
          : undefined,
      ...(object(job.needComparison).certain !== undefined
        ? {
            needComparison: {
              matchedNeedId: shortWishText(object(job.needComparison).matchedNeedId),
              certain: object(job.needComparison).certain === true,
              knownIds: Array.isArray(object(job.needComparison).knownIds)
                ? (object(job.needComparison).knownIds as unknown[]).map((id) => shortWishText(id)).slice(0, 12)
                : [],
            },
          }
        : {}),
      reason: shortWishText(job.reason),
      calls: count(job.calls),
      elapsedMs: typeof job.elapsedMs === "number" ? Math.max(0, job.elapsedMs) : 0,
      inputTokens: typeof job.inputTokens === "number" ? Math.max(0, job.inputTokens) : null,
      outputTokens: typeof job.outputTokens === "number" ? Math.max(0, job.outputTokens) : null,
      revision: shortWishText(job.revision),
    };
  }
  const pendingOutcomes = Array.isArray(raw.pendingOutcomes)
    ? raw.pendingOutcomes.flatMap((entry) => {
        const outcome = coerceWishOutcome(entry);
        return outcome ? [outcome] : [];
      })
    : [];
  return {
    version: 1,
    needs,
    attempt,
    lastPhaseKey: shortWishText(raw.lastPhaseKey),
    outcomeCount: Math.max(count(raw.outcomeCount), ...pendingOutcomes.map((entry) => entry.sequence + 1)),
    pendingOutcomes,
  };
}
