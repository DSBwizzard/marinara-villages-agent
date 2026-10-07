import type { VillageVillager } from "../../../domain/models/world.js";
import { agendaDateKey } from "../../../domain/rules/agenda-week.js";
import { randomVillageSeed } from "../../../domain/rules/village-clock.js";
import { newWishLifecycle, rememberWishNeed } from "../../../domain/rules/wish-policy.js";

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
