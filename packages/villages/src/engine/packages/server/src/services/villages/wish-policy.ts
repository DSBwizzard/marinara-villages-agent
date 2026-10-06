import { agendaBlocksFor, flexibleAgendaInterval } from "./agenda-week.js";
import { createHash } from "node:crypto";
import { randomVillageSeed } from "./village-clock.js";
import { canOccupyZone, venueZones, zoneClosed } from "./venue-zones.js";
import type { VillageAgenda, VillageState, VillageVillager, VillageWish } from "./types.js";
import type { WishLifecycle, WishNeed, WishPolicy, WishOutcome } from "./wish-types.js";

export const WISH_DAY_MS = 86_400_000;
export const WISH_COOLDOWN_MS = 7 * WISH_DAY_MS;
export const WISH_HISTORY_LIMIT = 12;
export const WISH_PAGE_SIZE = 50;
const searchIndexes = new WeakMap<readonly WishNeed[], { terms: Map<string, Set<WishNeed>>; recent: WishNeed[] }>();
export const normalWish = (text: string): string =>
  text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
export const wishPolicy = (value: unknown): WishPolicy =>
  value === "recurring" || value === "lasting" ? value : "unknown";
export const shortWishText = (value: unknown, length = 320): string =>
  typeof value === "string" ? value.trim().slice(0, length) : "";

export function newWishLifecycle(): WishLifecycle {
  return { version: 1, needs: [], lastPhaseKey: "", outcomeCount: 0, pendingOutcomes: [] };
}

/** Digest only facts used by an in-flight proposal, never the outcome archive. */
export function wishRevision(resident: VillageVillager, state: VillageState): string {
  return createHash("sha256")
    .update(
      JSON.stringify([
        resident.agenda?.wishes,
        resident.agenda?.week,
        resident.agenda?.scheduleWeek,
        resident.agenda?.activeDay,
        resident.agenda?.projectWork,
        resident.ingestSchedule,
        resident.wishLifecycle?.needs,
        [
          resident.cardSnapshot.name,
          resident.cardSnapshot.summary,
          resident.cardSnapshot.personality,
          resident.cardSnapshot.description,
        ],
        state.venues.map((venue) => ({
          id: venue.id,
          name: venue.name,
          constructionStatus: venue.constructionStatus,
          occupancy: venue.occupancy,
          condition: venue.state.condition,
          facts: venue.state.publicFacts.slice(0, 3),
          furniture: venue.state.furniture.slice(0, 3),
          zones: venueZones(venue).map((zone) => ({
            id: zone.id,
            kind: zone.kind,
            ownerId: zone.ownerId,
          })),
        })),
        state.selectedLorebookIds,
        state.setting,
        state.storyPace,
        state.wishSystemVersion,
      ]),
    )
    .digest("hex");
}

export function routineRevision(agenda: VillageAgenda): string {
  return createHash("sha256")
    .update(JSON.stringify([agenda.week, agenda.scheduleWeek]))
    .digest("hex");
}

/** Future overlays lose invalid links locally; today's started activity remains stable. */
export function pruneWishActivities(state: VillageState, now: Date): void {
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const minute = now.getHours() * 60 + now.getMinutes();
  for (const resident of state.villagers) {
    const agenda = resident.agenda;
    if (!agenda?.wishActivities?.length) continue;
    agenda.wishActivities = agenda.wishActivities.filter((activity) => {
      if (activity.dateKey < today || (activity.dateKey === today && activity.startMinute <= minute)) return true;
      if (!agenda.wishes.some((wish) => wish.id === activity.wishId)) return false;
      if (
        !flexibleAgendaInterval(
          agendaBlocksFor({ ...agenda, wishActivities: [] }, false, new Date(activity.dateKey + "T12:00:00")),
          activity.startMinute,
          activity.endMinute,
        )
      )
        return false;
      if (!activity.venueId) return true;
      const venue = state.venues.find((entry) => entry.id === activity.venueId);
      const zone = venue && venueZones(venue).find((entry) => entry.id === activity.zoneId);
      return (
        !!venue &&
        !!zone &&
        venue.constructionStatus !== "worksite" &&
        canOccupyZone(venue, zone, resident.characterId, {
          relationships: state.relationshipContext,
          at: new Date(new Date(activity.dateKey + "T00:00:00").setMinutes(activity.startMinute)),
        }) &&
        !zoneClosed(state, venue, zone)
      );
    });
  }
}

export function rememberWishNeed(resident: VillageVillager, wish: VillageWish, matchedId?: string): WishNeed {
  const lifecycle = (resident.wishLifecycle ??= newWishLifecycle());
  searchIndexes.delete(lifecycle.needs);
  let need = lifecycle.needs.find((entry) => entry.id === (matchedId || wish.need?.id));
  if (!need) {
    need = {
      id: randomVillageSeed(),
      subject: wish.need?.subject ?? "",
      action: wish.need?.action ?? "",
      policy: wish.need?.policy ?? "unknown",
      aliases: [],
      lastFulfilledAt: "",
    };
    lifecycle.needs.push(need);
  }
  if (!need.aliases.some((alias) => normalWish(alias) === normalWish(wish.wish)))
    need.aliases = [...need.aliases, wish.wish].slice(-8);
  need.state = "active";
  need.latestAt = wish.addedAt;
  wish.need = { id: need.id, subject: need.subject, action: need.action, policy: need.policy };
  return need;
}

export function knownNeedBlocked(need: WishNeed, now: Date): boolean {
  if (!need.lastFulfilledAt) return false;
  if (need.policy !== "recurring") return true;
  const fulfilled = Date.parse(need.lastFulfilledAt);
  return !Number.isFinite(fulfilled) || now.getTime() - fulfilled < WISH_COOLDOWN_MS;
}

/** Active wishes always win a shortlist slot; history selection never evicts one. */
export function selectWishNeeds(
  candidate: string,
  active: readonly VillageWish[],
  needs: readonly WishNeed[],
): WishNeed[] {
  const activeNeeds = active.map(
    (wish) =>
      needs.find((need) => need.id === wish.need?.id) ?? {
        id: wish.need?.id || `active:${wish.id}`,
        subject: wish.need?.subject ?? "",
        action: wish.need?.action ?? "",
        policy: wish.need?.policy ?? "unknown",
        aliases: [wish.wish],
        lastFulfilledAt: "",
      },
  );
  const seen = new Set(activeNeeds.map((need) => need.id));
  const tokens = new Set(normalWish(candidate).split(" ").filter(Boolean));
  let index = searchIndexes.get(needs);
  if (!index) {
    const terms = new Map<string, Set<WishNeed>>();
    for (const need of needs)
      for (const term of new Set(
        normalWish([need.subject, need.action, ...need.aliases].join(" "))
          .split(" ")
          .filter(Boolean),
      )) {
        const posting = terms.get(term) ?? new Set<WishNeed>();
        posting.add(need);
        terms.set(term, posting);
      }
    index = {
      terms,
      recent: [...needs].sort(
        (a, b) =>
          (b.latestAt || b.lastFulfilledAt).localeCompare(a.latestAt || a.lastFulfilledAt) || a.id.localeCompare(b.id),
      ),
    };
    searchIndexes.set(needs, index);
  }
  const scores = new Map<WishNeed, number>();
  for (const term of tokens)
    for (const need of index.terms.get(term) ?? [])
      if (!seen.has(need.id)) scores.set(need, (scores.get(need) ?? 0) + 1);
  const relevant = [...scores]
    .map(([need, score]) => ({ need, score }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.need.lastFulfilledAt.localeCompare(a.need.lastFulfilledAt) ||
        a.need.id.localeCompare(b.need.id),
    );
  const recent = index.recent
    .filter((need) => !seen.has(need.id))
    .slice(0, 3)
    .map((need) => ({ need }));
  const result = [...activeNeeds];
  for (const { need } of [...recent, ...relevant, ...index.recent.map((need) => ({ need }))]) {
    if (seen.has(need.id)) continue;
    seen.add(need.id);
    result.push(need);
    if (result.length >= WISH_HISTORY_LIMIT) break;
  }
  return result.slice(0, WISH_HISTORY_LIMIT);
}

export function recordWishOutcome(
  resident: VillageVillager,
  wish: VillageWish,
  at: string,
  memoryId: string,
  kind: WishOutcome["kind"],
): WishOutcome {
  const lifecycle = (resident.wishLifecycle ??= newWishLifecycle());
  const need = rememberWishNeed(resident, wish);
  const outcome: WishOutcome = {
    wish: structuredClone(wish),
    fulfilledAt: at,
    memoryId,
    needId: need.id,
    sequence: lifecycle.outcomeCount++,
    kind,
  };
  lifecycle.pendingOutcomes.push(outcome);
  need.state = kind;
  need.latestAt = at;
  if (kind === "fulfilled") {
    need.lastFulfilledAt = at;
    need.lastOutcomeSequence = outcome.sequence;
  }
  return outcome;
}

/** Removing a wish costs no model work. Keep elapsed overlays until the date rolls. */
export function removeWishActivities(resident: VillageVillager, wishId: string, now: Date): void {
  if (!resident.agenda) return;
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const minute = now.getHours() * 60 + now.getMinutes();
  resident.agenda.wishActivities = (resident.agenda.wishActivities ?? []).flatMap((activity) => {
    if (
      activity.wishId !== wishId ||
      activity.dateKey < date ||
      (activity.dateKey === date && activity.endMinute <= minute)
    )
      return [activity];
    if (activity.dateKey === date && activity.startMinute <= minute) return [activity];
    return [];
  });
}
