import type { CapabilityLanguageModelCompletion, CapabilityLanguageModelMessage } from "@marinara-engine/shared";
import { villagesConnectionIdFor } from "./connections.js";
import {
  completeWithRoom,
  villagesDebugAgentsEnabled,
  villagesLanguageModels,
  villagesLogger,
} from "./package-runtime.js";
import { readVillageState, mutateVillageState } from "./village-store.js";
import { agendaBlocksFor, agendaDateKey } from "./agenda-week.js";
import { deriveVillageMoment, randomVillageSeed, VILLAGE_WEEKDAYS } from "./village-clock.js";
import { coerceWish } from "./prompt-preset.js";
import { extractJsonObject } from "./village-bootstrap.js";
import { canOccupyZone, venueZones, zoneClosed } from "./venue-zones.js";
import { readVillageLore } from "./lorebooks.js";
import { flushWishOutcomes, readWishOutcome, previousFulfilledNeed } from "./wish-archive.js";
import {
  WISH_DAY_MS,
  knownNeedBlocked,
  newWishLifecycle,
  normalWish,
  recordWishOutcome,
  rememberWishNeed,
  removeWishActivities,
  routineRevision,
  selectWishNeeds,
  shortWishText,
  wishRevision,
} from "./wish-policy.js";
import type { VillageState, VillageVillager, VillageWish } from "./types.js";
import type { WishActivity, WishAttempt } from "./wish-types.js";
import { notFound } from "./errors.js";
import { outsideVenueOperation } from "./venue-coordinator.js";

const inFlight = new Set<string>();
const MAX_ACTIVE = 2;

export function registerInitialWish(resident: VillageVillager, now: Date): void {
  const lifecycle = (resident.wishLifecycle ??= newWishLifecycle());
  for (const wish of resident.agenda?.wishes ?? []) rememberWishNeed(resident, wish);
  if (lifecycle.attempt) return;
  lifecycle.attempt = {
    id: randomVillageSeed(),
    dateKey: agendaDateKey(now),
    at: now.toISOString(),
    stage: "done",
    reason: "Daily wish allowance consumed during initial preparation.",
    calls: 0,
    elapsedMs: 0,
    inputTokens: null,
    outputTokens: null,
    revision: "",
  };
}

/** Claim founding's optional wish before its shared preparation request can leave the process. */
export async function reserveInitialWishAllowance(characterId: string, now: Date): Promise<string | undefined> {
  let id: string | undefined;
  await mutateVillageState((state) => {
    id = undefined;
    const resident = state.villagers.find((entry) => entry.characterId === characterId);
    if (!resident || resident.wishLifecycle?.attempt) return;
    registerInitialWish(resident, now);
    id = resident.wishLifecycle!.attempt!.id;
  });
  return id;
}

export function expireResidentWishes(resident: VillageVillager, now: Date): void {
  if (!resident.agenda) return;
  resident.agenda.wishes = resident.agenda.wishes.filter((wish) => {
    const expiry = Date.parse(wish.expiresAt);
    if (!Number.isFinite(expiry) || expiry > now.getTime()) return true;
    recordWishOutcome(resident, wish, now.toISOString(), `expired:${wish.id}`, "expired");
    removeWishActivities(resident, wish.id, now);
    return false;
  });
  const today = agendaDateKey(now);
  resident.agenda.wishActivities = (resident.agenda.wishActivities ?? []).filter((entry) => entry.dateKey >= today);
}

/** Called inside the same village transaction as the existing favour memory. */
export function fulfillResidentWish(
  resident: VillageVillager,
  wishId: string,
  at: string,
  memoryId: string,
): VillageWish | null {
  const wish = resident.agenda?.wishes.find((entry) => entry.id === wishId);
  if (!wish || !resident.agenda) return null;
  recordWishOutcome(resident, wish, at, memoryId, "fulfilled");
  resident.agenda.wishes = resident.agenda.wishes.filter((entry) => entry.id !== wishId);
  removeWishActivities(resident, wishId, new Date(at));
  return wish;
}

export async function correctResidentWish(characterId: string, wishId: string, now = new Date()): Promise<void> {
  const outcome = await readWishOutcome(characterId, wishId);
  if (!outcome || outcome.kind !== "fulfilled") throw notFound("That completed wish is not in this villager's record.");
  if (outcome.correctedAt) return;
  const previous = await previousFulfilledNeed(characterId, outcome.needId, outcome.sequence);
  await mutateVillageState((state) => {
    const resident = state.villagers.find((entry) => entry.characterId === characterId),
      lifecycle = resident?.wishLifecycle;
    if (!resident || !lifecycle) throw notFound("That villager does not live here.");
    if (state.correctedWishMemoryIds.includes(outcome.memoryId)) return;
    state.correctedWishMemoryIds = [...state.correctedWishMemoryIds, outcome.memoryId];
    state.chronicle = state.chronicle.filter((entry) => entry.id !== outcome.memoryId);
    const corrected = { ...outcome, correctedAt: now.toISOString() };
    lifecycle.pendingOutcomes = [
      ...lifecycle.pendingOutcomes.filter((entry) => entry.sequence !== outcome.sequence),
      corrected,
    ];
    const need = lifecycle.needs.find((entry) => entry.id === outcome.needId);
    if (need) {
      need.state = "corrected";
      need.latestAt = now.toISOString();
    }
    if (need?.lastOutcomeSequence === outcome.sequence) {
      need.lastFulfilledAt = previous?.fulfilledAt ?? "";
      need.lastOutcomeSequence = previous?.sequence;
    }
    if (
      resident.agenda &&
      resident.agenda.wishes.length < MAX_ACTIVE &&
      !resident.agenda.wishes.some((entry) => entry.id === wishId)
    ) {
      const wish = coerceWish({ ...outcome.wish, need: outcome.wish.need }, wishId, now.toISOString());
      if (wish) {
        rememberWishNeed(resident, wish, outcome.needId);
        resident.agenda.wishes.push(wish);
      }
    }
  });
  await flushWishOutcomes();
}

type Slot = {
  dateKey: string;
  startMinute: number;
  endMinute: number;
  venueId: string;
  zoneId?: string;
  activity: string;
};
export function wishSlots(resident: VillageVillager, state: VillageState, now: Date): Slot[] {
  const agenda = resident.agenda;
  if (!agenda) return [];
  const slots: Slot[] = [];
  for (let offset = 0; offset < 7 && slots.length < 8; offset++) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, 12);
    const key = agendaDateKey(date),
      weekday = VILLAGE_WEEKDAYS[(date.getDay() + 6) % 7]!;
    const minute = offset === 0 ? now.getHours() * 60 + now.getMinutes() : -1;
    const blocks =
      offset === 0
        ? agendaBlocksFor(agenda, resident.ingestSchedule !== false, date)
        : ((resident.ingestSchedule !== false ? agenda.scheduleWeek?.[weekday] : undefined) ??
          agenda.week?.[weekday] ??
          []);
    for (const block of blocks) {
      if (
        !block.flexible ||
        block.status === "dnd" ||
        block.status === "offline" ||
        block.startMinute <= minute ||
        block.endMinute - block.startMinute > 60
      )
        continue;
      const from = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, block.startMinute).getTime();
      const through = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, block.endMinute).getTime();
      const work = agenda.projectWork;
      if (work && Date.parse(work.startsAt) < through && Date.parse(work.endsAt) > from) continue;
      if (
        (agenda.wishActivities ?? []).some(
          (entry) =>
            entry.dateKey === key && entry.startMinute < block.endMinute && entry.endMinute > block.startMinute,
        )
      )
        continue;
      if (
        block.venueId &&
        !state.venues.some((venue) => venue.id === block.venueId && venue.constructionStatus !== "worksite")
      )
        continue;
      slots.push({
        dateKey: key,
        startMinute: block.startMinute,
        endMinute: block.endMinute,
        venueId: block.venueId,
        zoneId: block.zoneId,
        activity: block.activity,
      });
      if (slots.length >= 8) break;
    }
  }
  return slots;
}

function proposalActivity(
  raw: Record<string, unknown>,
  wish: VillageWish,
  slots: Slot[],
  resident: VillageVillager,
  state: VillageState,
): WishActivity | undefined {
  const slot = Number.isInteger(raw.slot) ? slots[(raw.slot as number) - 1] : undefined;
  if (!slot || !shortWishText(raw.activity, 240) || !resident.agenda) return undefined;
  const venueId = typeof raw.venueId === "string" ? raw.venueId : slot.venueId;
  let zoneId = typeof raw.zoneId === "string" ? raw.zoneId : slot.zoneId;
  if (venueId) {
    const venue = state.venues.find((entry) => entry.id === venueId);
    if (!venue || venue.constructionStatus === "worksite") return undefined;
    const zone =
      venueZones(venue).find((entry) => entry.id === zoneId) ??
      (zoneId ? undefined : venueZones(venue).find((entry) => entry.kind === "exterior"));
    if (!zone || !canOccupyZone(venue, zone, resident.characterId) || zoneClosed(state, venue, zone)) return undefined;
    zoneId = zone.id;
  } else zoneId = undefined;
  return {
    ...slot,
    venueId,
    zoneId,
    wishId: wish.id,
    activity: shortWishText(raw.activity, 240),
    reason: shortWishText(raw.reason, 240) || "A small personal interest",
    baseRevision: routineRevision(resident.agenda),
  };
}

export function canApplyWishActivity(
  activity: WishActivity,
  resident: VillageVillager,
  state: VillageState,
  now: Date,
): boolean {
  if (!resident.agenda || activity.baseRevision !== routineRevision(resident.agenda)) return false;
  const today = agendaDateKey(now),
    minute = now.getHours() * 60 + now.getMinutes();
  if (activity.dateKey < today || (activity.dateKey === today && activity.startMinute <= minute)) return false;
  const date = new Date(`${activity.dateKey}T12:00:00`);
  const block = agendaBlocksFor(resident.agenda, resident.ingestSchedule !== false, date).find(
    (entry) =>
      entry.startMinute === activity.startMinute &&
      entry.endMinute === activity.endMinute &&
      entry.flexible &&
      entry.status !== "dnd" &&
      entry.status !== "offline",
  );
  if (!block) return false;
  if (activity.venueId) {
    const venue = state.venues.find((entry) => entry.id === activity.venueId),
      zone = venue && venueZones(venue).find((entry) => entry.id === activity.zoneId);
    if (
      !venue ||
      !zone ||
      venue.constructionStatus === "worksite" ||
      !canOccupyZone(venue, zone, resident.characterId) ||
      zoneClosed(state, venue, zone)
    )
      return false;
  }
  const destination =
    activity.venueId || state.venues.find((venue) => venue.occupancy.residentCharacterId === resident.characterId)?.id;
  const boundaries = new Set([activity.startMinute]);
  const others = state.villagers
    .filter((entry) => entry.characterId !== resident.characterId)
    .map((entry) => ({
      resident: entry,
      blocks: entry.agenda ? agendaBlocksFor(entry.agenda, entry.ingestSchedule !== false, date) : [],
    }));
  for (const other of others)
    for (const entry of other.blocks)
      if (entry.startMinute > activity.startMinute && entry.startMinute < activity.endMinute)
        boundaries.add(entry.startMinute);
  for (const at of boundaries) {
    const occupants = others.filter((other) => {
      const entry = other.blocks.find((part) => part.startMinute <= at && part.endMinute > at);
      return (
        (entry?.venueId ||
          state.venues.find((venue) => venue.occupancy.residentCharacterId === other.resident.characterId)?.id) ===
        destination
      );
    });
    if (destination && occupants.length >= 4) return false;
  }
  return true;
}

async function recordUsage(
  characterId: string,
  id: string,
  completion: CapabilityLanguageModelCompletion | null,
  elapsedMs: number,
): Promise<void> {
  const usage = (
    completion as unknown as {
      usage?: { promptTokens?: number; completionTokens?: number; inputTokens?: number; outputTokens?: number };
    }
  )?.usage;
  await mutateVillageState((state) => {
    const job = state.villagers.find((entry) => entry.characterId === characterId)?.wishLifecycle?.attempt;
    if (job?.id !== id) return;
    job.elapsedMs += elapsedMs;
    const input = usage?.inputTokens ?? usage?.promptTokens,
      output = usage?.outputTokens ?? usage?.completionTokens;
    // A missing first response cannot become a deceptively complete total later.
    job.inputTokens =
      typeof input === "number" && (job.calls === 1 || job.inputTokens !== null)
        ? (job.inputTokens ?? 0) + input
        : null;
    job.outputTokens =
      typeof output === "number" && (job.calls === 1 || job.outputTokens !== null)
        ? (job.outputTokens ?? 0) + output
        : null;
  });
}

async function ask(
  characterId: string,
  job: WishAttempt,
  messages: CapabilityLanguageModelMessage[],
  limit: number,
): Promise<Record<string, unknown> | null> {
  const model = await villagesLanguageModels().resolveForRequest({
    connectionId: await villagesConnectionIdFor("system"),
  });
  const requested = Math.min(model.maxOutputTokens ?? limit, limit),
    fitted = model.fitContext(messages, { maxTokens: requested });
  // Losing any required comparison entry is an uncertain verdict, never permission.
  if (JSON.stringify(fitted.messages) !== JSON.stringify(messages))
    throw new Error("The System context cannot fit the bounded wish request.");
  const started = performance.now();
  let completion: CapabilityLanguageModelCompletion | null = null;
  try {
    completion = await completeWithRoom(model, fitted.messages, fitted.maxTokens ?? requested, {
      temperature: limit === 800 ? 0 : 0.7,
      reasoningEffort: "low",
      debugMode: villagesDebugAgentsEnabled(),
      retryEmpty: false,
      signal: AbortSignal.timeout(90_000),
    });
    return extractJsonObject(completion.content ?? "");
  } finally {
    await recordUsage(characterId, job.id, completion, performance.now() - started);
  }
}

async function finishAttempt(characterId: string, id: string, reason: string): Promise<void> {
  await mutateVillageState((state) => {
    const job = state.villagers.find((entry) => entry.characterId === characterId)?.wishLifecycle?.attempt;
    if (job?.id === id) {
      job.stage = "done";
      job.reason = shortWishText(reason);
    }
  });
}

export async function processWishAttempt(
  characterId: string,
  id: string,
  now: Date,
  clock: () => Date = () => new Date(),
): Promise<void> {
  if (inFlight.has(id)) return;
  inFlight.add(id);
  try {
    let state = await readVillageState(),
      resident = state.villagers.find((entry) => entry.characterId === characterId),
      job = resident?.wishLifecycle?.attempt;
    if (!resident?.agenda || !job || job.id !== id || job.stage === "done") return;
    if (state.storyPace === "off") return;
    if (job.dateKey !== agendaDateKey(now) || wishRevision(resident, state) !== job.revision) {
      await finishAttempt(characterId, id, "The proposal's day or village context changed.");
      return;
    }
    if (job.stage === "comparing" || (job.stage === "reserved" && job.calls > 0)) {
      await finishAttempt(characterId, id, "Interrupted request: outcome unknown; allowance consumed.");
      return;
    }
    if (job.stage === "reserved") {
      const slots = wishSlots(resident, state, now),
        card = resident.cardSnapshot;
      const lore = await readVillageLore(
        state.selectedLorebookIds,
        [state.setting, card.name, card.summary, card.personality].join("\n"),
        undefined,
        Math.min(state.loreTokenBudget, 400),
      );
      const known = selectWishNeeds(
        [card.summary, card.personality, ...lore].join(" "),
        resident.agenda.wishes,
        resident.wishLifecycle?.needs ?? [],
      );
      const messages: CapabilityLanguageModelMessage[] = [
        {
          role: "system",
          content:
            'Propose at most ONE small private wish for a village resident, or none. JSON only: {"wish":null} or {"wish":{"wish":"...","tell":"a visible ordinary sign","intensity":1,"need":{"subject":"specific object or experience","action":"acquire, repair, use, improve, or specific experience","policy":"lasting or recurring"}},"adjustment":{"slot":1,"activity":"ordinary activity","reason":"...","venueId":"existing id","zoneId":"existing id"}}. Adjustment is optional. Never invent people, places, physical changes, injuries, debts, emergencies, or an object already owned. Wishes are personal interests, not player errands. Lasting achievements stay settled; recurring ordinary needs may return only after seven fulfilled days. Active wishes must not repeat. Use the supplied future free-time slots only. No suitable wish is a valid quiet day.',
        },
        {
          role: "user",
          content: JSON.stringify({
            village: state.name.slice(0, 100),
            setting: state.setting.slice(0, 2400),
            person: {
              name: card.name,
              summary: card.summary.slice(0, 400),
              personality: card.personality.slice(0, 800),
              description: card.description.slice(0, 1000),
            },
            lore: lore.join("\n").slice(0, 1800),
            active: resident.agenda.wishes,
            known: known.map((need) => ({
              id: need.id,
              subject: need.subject,
              action: need.action,
              policy: need.policy,
              aliases: need.aliases.slice(-2),
              fulfilledAt: need.lastFulfilledAt,
              state: need.state,
              latestAt: need.latestAt,
            })),
            slots: slots.map((slot, index) => ({ slot: index + 1, ...slot })),
            places: state.venues.slice(0, 24).map((venue) => ({
              id: venue.id,
              name: venue.name,
              condition: venue.state.condition.slice(0, 160),
              facts: venue.state.publicFacts.slice(0, 3).map((fact) => fact.slice(0, 120)),
              furniture: venue.state.furniture.slice(0, 3).map((item) => item.slice(0, 120)),
              zones: venueZones(venue)
                .filter((zone) => canOccupyZone(venue, zone, characterId) && !zoneClosed(state, venue, zone))
                .map((zone) => ({ id: zone.id, kind: zone.kind })),
            })),
          }),
        },
      ];
      let claimed = false;
      await mutateVillageState((live) => {
        claimed = false;
        const owner = live.villagers.find((entry) => entry.characterId === characterId),
          attempt = owner?.wishLifecycle?.attempt;
        if (
          owner &&
          attempt?.id === id &&
          attempt.stage === "reserved" &&
          attempt.calls === 0 &&
          live.storyPace !== "off" &&
          wishRevision(owner, live) === attempt.revision
        ) {
          attempt.calls = 1;
          claimed = true;
        }
      });
      if (!claimed) return;
      const payload = await ask(characterId, job, messages, 1500),
        raw = payload?.wish;
      const candidate =
        raw && typeof raw === "object" && !Array.isArray(raw)
          ? coerceWish(raw, randomVillageSeed(), now.toISOString())
          : null;
      if (!candidate) {
        await finishAttempt(characterId, id, "No new wish today.");
        return;
      }
      if (candidate.need) candidate.need.id = "";
      const adjustment =
        payload?.adjustment && typeof payload.adjustment === "object" && !Array.isArray(payload.adjustment)
          ? proposalActivity(payload.adjustment as Record<string, unknown>, candidate, slots, resident, state)
          : undefined;
      await mutateVillageState((live) => {
        const attempt = live.villagers.find((entry) => entry.characterId === characterId)?.wishLifecycle?.attempt;
        if (attempt?.id === id && attempt.stage === "reserved") {
          attempt.candidate = candidate;
          attempt.activity = adjustment;
          attempt.stage = "generated";
        }
      });
    }
    state = await readVillageState();
    resident = state.villagers.find((entry) => entry.characterId === characterId);
    job = resident?.wishLifecycle?.attempt;
    if (!resident?.agenda || !job || job.id !== id || !job.candidate) return;
    if (job.stage === "generated") {
      const candidate = job.candidate,
        active = resident.agenda.wishes,
        needs = resident.wishLifecycle?.needs ?? [];
      const exact = needs.find((need) =>
        need.aliases.some((alias) => normalWish(alias) === normalWish(candidate.wish)),
      );
      let accepted =
          !active.some(
            (wish) => normalWish(wish.wish) === normalWish(candidate.wish) || (!!exact && wish.need?.id === exact.id),
          ) && !(exact && knownNeedBlocked(exact, now)),
        matchedNeedId = exact?.id,
        reason = "Local identity check";
      if (accepted && !exact) {
        const known = selectWishNeeds(
          [candidate.wish, candidate.need?.subject, candidate.need?.action].filter(Boolean).join(" "),
          active,
          needs,
        );
        if (known.length) {
          let claimed = false;
          await mutateVillageState((live) => {
            claimed = false;
            const owner = live.villagers.find((entry) => entry.characterId === characterId),
              attempt = owner?.wishLifecycle?.attempt;
            if (
              owner &&
              attempt?.id === id &&
              attempt.stage === "generated" &&
              attempt.calls === 1 &&
              live.storyPace !== "off" &&
              wishRevision(owner, live) === attempt.revision
            ) {
              attempt.stage = "comparing";
              attempt.calls = 2;
              claimed = true;
            }
          });
          if (!claimed) return;
          const result = await ask(
            characterId,
            job,
            [
              {
                role: "system",
                content:
                  'Compare one wish with the listed needs. Return JSON only: {"matchedNeedId":"exact listed id or empty string","certain":true}. Match the same unmet need, not just the same object. Acquiring a boat, repairing it, sailing it, and improving it are different needs. Do not change recurrence policy. If uncertain use certain:false.',
              },
              {
                role: "user",
                content: JSON.stringify({
                  candidate: { wish: candidate.wish, subject: candidate.need?.subject, action: candidate.need?.action },
                  known: known.map((need) => ({
                    id: need.id,
                    subject: need.subject,
                    action: need.action,
                    aliases: need.aliases.slice(-2),
                  })),
                }),
              },
            ],
            800,
          );
          matchedNeedId = typeof result?.matchedNeedId === "string" ? result.matchedNeedId : undefined;
          const matched = known.find((need) => need.id === matchedNeedId);
          accepted =
            result?.certain === true &&
            typeof matchedNeedId === "string" &&
            (!matchedNeedId || !!matched) &&
            !active.some((wish) => wish.need?.id === matchedNeedId || `active:${wish.id}` === matchedNeedId) &&
            !(matched && knownNeedBlocked(matched, now));
          reason = accepted ? "Bounded semantic comparison accepted" : "Repeated need or uncertain comparison";
        }
      } else if (!accepted) reason = "Active duplicate or settled need";
      await mutateVillageState((live) => {
        const attempt = live.villagers.find((entry) => entry.characterId === characterId)?.wishLifecycle?.attempt;
        if (attempt?.id === id) {
          attempt.accepted = accepted;
          attempt.matchedNeedId = matchedNeedId || undefined;
          attempt.reason = reason;
          attempt.stage = "validated";
        }
      });
    }
    const committedAt = clock();
    await mutateVillageState((live) => {
      const owner = live.villagers.find((entry) => entry.characterId === characterId),
        attempt = owner?.wishLifecycle?.attempt;
      if (!owner?.agenda || attempt?.id !== id || attempt.stage !== "validated") return;
      if (live.storyPace === "off") return;
      if (
        attempt.accepted &&
        attempt.candidate &&
        owner.agenda.wishes.length < MAX_ACTIVE &&
        wishRevision(owner, live) === attempt.revision &&
        attempt.dateKey === agendaDateKey(committedAt)
      ) {
        rememberWishNeed(owner, attempt.candidate, attempt.matchedNeedId);
        owner.agenda.wishes.push(attempt.candidate);
        if (attempt.activity && canApplyWishActivity(attempt.activity, owner, live, committedAt))
          owner.agenda.wishActivities = [...(owner.agenda.wishActivities ?? []), attempt.activity];
      } else if (attempt.accepted) attempt.reason = "State changed before commit; no wish granted.";
      attempt.stage = "done";
    });
    const saved = (await readVillageState()).villagers.find((entry) => entry.characterId === characterId)?.wishLifecycle
      ?.attempt;
    if (saved?.id === id)
      villagesLogger().info(
        "[villages] wish attempt %s: %s; requests=%s inputTokens=%s outputTokens=%s elapsedMs=%s",
        id,
        saved.reason,
        saved.calls,
        saved.inputTokens ?? "unavailable",
        saved.outputTokens ?? "unavailable",
        saved.elapsedMs,
      );
  } catch (error) {
    await finishAttempt(characterId, id, error instanceof Error ? error.message : String(error));
    villagesLogger().warn("[villages] wish attempt %s deferred until a later eligible day: %s", id, String(error));
  } finally {
    inFlight.delete(id);
  }
}

/** Reserves a bounded batch atomically. The caller decides whether to await its model work. */
export async function reserveWishAttempts(now: Date): Promise<{ characterId: string; id: string }[]> {
  let work: { characterId: string; id: string }[] = [];
  await mutateVillageState((state) => {
    work = [];
    if (state.storyPace === "off" || (state.foundingPreparation && state.foundingPreparation.status !== "ready"))
      return;
    // A clock rollback must not reopen an earlier phase's batch for other residents.
    // Existing durable timestamps act as a compact high-water mark without a date backlog.
    if (state.villagers.some((resident) => Date.parse(resident.wishLifecycle?.attempt?.at ?? "") > now.getTime()))
      return;
    const dateKey = agendaDateKey(now),
      moment = deriveVillageMoment({ foundedAt: state.foundedAt, seed: state.seed, now }),
      phaseKey = `${dateKey}:${moment.dayPhase}`;
    let occupied = state.villagers.filter((resident) => resident.wishLifecycle?.lastPhaseKey === phaseKey).length;
    const pending = state.villagers
      .filter((resident) => resident.wishLifecycle?.attempt && resident.wishLifecycle.attempt.stage !== "done")
      .sort((a, b) => a.wishLifecycle!.attempt!.at.localeCompare(b.wishLifecycle!.attempt!.at));
    for (const resident of pending) {
      const lifecycle = resident.wishLifecycle!;
      if (inFlight.has(lifecycle.attempt!.id)) continue;
      if (lifecycle.lastPhaseKey !== phaseKey) {
        if (occupied >= 2) continue;
        lifecycle.lastPhaseKey = phaseKey;
        occupied++;
      }
      if (work.length < 2) work.push({ characterId: resident.characterId, id: lifecycle.attempt!.id });
    }
    const eligible = state.villagers
      .filter((resident) => {
        const job = resident.wishLifecycle?.attempt;
        return (
          resident.agenda &&
          resident.agenda.generatedAt &&
          resident.agenda.wishes.length < MAX_ACTIVE &&
          (!job || job.stage === "done") &&
          job?.dateKey !== dateKey &&
          (!job || now.getTime() - Date.parse(job.at) >= WISH_DAY_MS)
        );
      })
      .sort(
        (a, b) =>
          (a.wishLifecycle?.attempt?.at ?? "").localeCompare(b.wishLifecycle?.attempt?.at ?? "") ||
          a.characterId.localeCompare(b.characterId),
      );
    for (const resident of eligible.slice(0, Math.max(0, 2 - occupied))) {
      const lifecycle = (resident.wishLifecycle ??= newWishLifecycle()),
        id = randomVillageSeed();
      lifecycle.attempt = {
        id,
        dateKey,
        at: now.toISOString(),
        stage: "reserved",
        reason: "Queued",
        calls: 0,
        elapsedMs: 0,
        inputTokens: null,
        outputTokens: null,
        revision: wishRevision(resident, state),
      };
      lifecycle.lastPhaseKey = phaseKey;
      work.push({ characterId: resident.characterId, id });
    }
  });
  return work;
}

export async function reconcileWishLifecycle(
  now: Date,
  background = true,
  clock: () => Date = () => new Date(),
): Promise<void> {
  try {
    await flushWishOutcomes();
  } catch (error) {
    villagesLogger().warn("[villages] wish archive remains pending: %s", String(error));
  }
  const work = await reserveWishAttempts(now);
  const run = async () => {
    for (const item of work) await processWishAttempt(item.characterId, item.id, now, clock);
  };
  if (background)
    outsideVenueOperation(() => {
      queueMicrotask(() => {
        void run().catch((error) => villagesLogger().warn("[villages] wish worker: %s", String(error)));
      });
    });
  else await outsideVenueOperation(run);
}
