import { ZonedDate } from "../../../shared/helpers/zoned-date.js";
import { defaultVillageState } from "../decoding/village-codec.js";
import { RETURN_CATCHUP_HISTORY_LIMIT, type ReturnCatchupBatch, type VillageState } from "../models/world.js";
import { calendarReplay } from "./clock-recovery.js";
import { captureReturnContext, departureMemoriesAvailable } from "./return-catchup-capture.js";
import { returnCatchupOpportunities } from "./return-catchup-opportunities.js";
import { localDateKey, planningAllowance } from "./resident-planning.js";

/** Retain recent finished accounts without copying departure snapshots or active work. */
const HISTORY_BYTES = 512 * 1024;
function rememberFinishedBatch(history: ReturnCatchupBatch[], batch: ReturnCatchupBatch): ReturnCatchupBatch[] {
  const next = [...history.filter((row) => row.id !== batch.id), structuredClone(batch)];
  while (
    next.length > RETURN_CATCHUP_HISTORY_LIMIT ||
    (next.length > 1 && new TextEncoder().encode(JSON.stringify(next)).length > HISTORY_BYTES)
  )
    next.shift();
  return next;
}
/** A first visible boundary initializes tracking without inventing an earlier absence. */
export function recordReturnVisibility(state: VillageState, now: Date): void {
  if (!state.seed || !state.setupAt) return;
  const batch = state.returnCatchup?.batch;
  if (batch && !["completed", "cancelled"].includes(batch.status)) return;
  if (state.returnCatchup?.capture && Date.parse(state.returnCatchup.capture.at) > now.getTime()) return;
  state.returnCatchup ??= {};
  state.returnCatchup.capture = captureReturnContext(state, now);
}

/** Discover a fixed return interval locally, before background work is admitted. */
export function discoverReturnBatch(state: VillageState, now: Date, id: string): void {
  const tracking = state.returnCatchup;
  const capture = tracking?.capture;
  const prior = tracking?.batch;
  if (!tracking || !capture || (prior && !["completed", "cancelled"].includes(prior.status))) return;
  if (prior?.from === capture.at) return;
  if (!/^[a-zA-Z0-9-]{1,100}$/.test(id)) throw new Error("Invalid Village catch-up identity.");
  const elapsed = now.getTime() - Date.parse(capture.at);
  if (!Number.isFinite(elapsed) || elapsed < 60 * 60_000) return;
  const localNow = new ZonedDate(now, state.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone);
  const date = localDateKey(localNow);
  const used = state.eventAttempts?.attempts.filter((row) => row.date === date).length ?? 0;
  const remaining = Math.max(0, planningAllowance(state.backgroundPace, state.seed, date) - used);
  let opportunities: NonNullable<NonNullable<VillageState["returnCatchup"]>["batch"]>["opportunities"] = [];
  let reason = "";
  if (calendarReplay(state, localNow)) reason = "The calendar is replaying a previously visited date.";
  else {
    const historical = { ...defaultVillageState(), ...capture.world };
    const residentEligible =
      departureMemoriesAvailable(capture, state) &&
      JSON.stringify(state.relationshipContext) === JSON.stringify(capture.world.relationshipContext);
    const selected = returnCatchupOpportunities(historical, new Date(capture.at), now, remaining, residentEligible);
    opportunities = selected.opportunities;
    reason = selected.reason;
    if (!residentEligible)
      reason += !departureMemoriesAvailable(capture, state)
        ? " Resident memories changed after departure."
        : " Resident relationships changed after departure.";
  }
  if (prior?.id === id || tracking.history?.some((row) => row.id === id)) return;
  if (prior) tracking.history = rememberFinishedBatch(tracking.history ?? [], prior);
  const actorIds = new Set(opportunities.flatMap((row) => row.actorIds));
  const venueIds = new Set(opportunities.map((row) => row.venueId).filter(Boolean));
  const zoneIds = new Set(
    opportunities.filter((row) => row.venueId && row.zoneId).map((row) => JSON.stringify([row.venueId, row.zoneId])),
  );
  const residents = Object.fromEntries(
    capture.world.villagers
      .filter((resident) => actorIds.has(resident.characterId))
      .map((resident) => [resident.characterId, resident.cardSnapshot.name]),
  );
  const venues = Object.fromEntries(
    capture.world.venues.filter((venue) => venueIds.has(venue.id)).map((venue) => [venue.id, venue.name]),
  );
  const zones = Object.fromEntries(
    capture.world.venues
      .filter((venue) => venueIds.has(venue.id))
      .flatMap((venue) =>
        (venue.zones ?? [])
          .filter((zone) => zoneIds.has(JSON.stringify([venue.id, zone.id])))
          .map((zone) => [JSON.stringify([venue.id, zone.id]), zone.name]),
      ),
  );
  tracking.batch = {
    id,
    budgetDate: date,
    opportunityLimit: Math.min(6, remaining),
    status: opportunities.length ? "queued" : "completed",
    from: capture.at,
    until: now.toISOString(),
    reason,
    labels: { residents, venues, zones },
    opportunities,
    records: opportunities.map((opportunity) => ({ opportunityId: opportunity.id, status: "pending" })),
  };
}
