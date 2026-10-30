import type { VillageState } from "../models/world.js";
import type {
  NarrativeAdmission,
  NarrativeAfter,
  NarrativeCondition,
  NarrativeDevelopment,
  NarrativeReceipt,
  NarrativeState,
} from "../models/narrative-model.js";
import { conflict, badGateway } from "./errors.js";
import { villageCurrentSetting } from "./prompt-preset.js";
import { hashString, deriveVillageMoment } from "./village-clock.js";
import { backgroundRevision } from "./background-revision.js";
import { activeNarrativeConditions } from "./narrative-environment.js";
import { venueZones, zoneClosed, zoneControllerIds, canOccupyZone } from "./venue-zones.js";
import { applyPlaceUpdate, readPlaceUpdate } from "./zone-continuity.js";

export const CONSEQUENCES = ["gentle", "moderate", "dramatic"] as const;
function correctiveActors(
  state: VillageState,
  venue: VillageState["venues"][number],
  zone: ReturnType<typeof venueZones>[number],
  at: string,
): string[] {
  return zoneControllerIds(venue, zone)
    .filter(
      (id) =>
        (id === "player" || state.villagers.some((row) => row.characterId === id)) &&
        canOccupyZone(venue, zone, id, {
          at: new Date(at),
          environment: state.narrative,
          relationships: state.relationshipContext,
        }),
    )
    .sort();
}
const object = (value: unknown): Record<string, any> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw badGateway("Invalid narrative result.");
  return value as Record<string, any>;
};
const exact = (row: Record<string, any>, keys: readonly string[]) => {
  if (Object.keys(row).some((key) => !keys.includes(key))) throw badGateway("Unsupported narrative effect.");
};
const text = (value: unknown, limit: number, empty = false): string => {
  if (typeof value !== "string" || value.length > limit || (!empty && !value.trim()))
    throw badGateway("Invalid narrative text.");
  return value;
};
const revision = (value: unknown): number => {
  if (!Number.isSafeInteger(value) || Number(value) < 0) throw badGateway("Invalid narrative revision.");
  return Number(value);
};
const stamp = (value: unknown): string => {
  if (typeof value !== "string" || new Date(value).toISOString() !== value) throw badGateway("Invalid narrative time.");
  return value;
};
export function ensureNarrative(state: VillageState, at: string): NarrativeState {
  return (state.narrative ??= {
    version: 1,
    adoptedAt: at,
    revision: 0,
    weatherRevision: 0,
    weather: null,
    situations: [],
    conditions: [],
    receipts: [],
  });
}
/** One grounded writable Zone; broader weather has separate, explicit timed authority. */
export function admitNarrative(
  state: VillageState,
  at: string,
  sourceId: string,
  source: "world" | "scene" = "world",
  local?: { venueId: string; zoneId: string },
): NarrativeAdmission | null {
  const narrative = state.narrative;
  if (!narrative || at < narrative.adoptedAt || !state.setupAt || state.clock?.recovery) return null;
  const targets = state.venues
    .flatMap((venue) =>
      venueZones(venue)
        .filter(
          (zone) =>
            !zoneClosed(state, venue, zone) &&
            !!zone.description.trim() &&
            !narrative.claims?.some((claim) => claim.venueId === venue.id && claim.zoneId === zone.id) &&
            (!local || (venue.id === local.venueId && zone.id === local.zoneId)),
        )
        .map((zone) => ({
          venueId: venue.id,
          zoneId: zone.id,
          name: venue.name + " / " + zone.name,
          exterior: zone.kind === "exterior",
          description: zone.description,
          state: structuredClone(zone.state),
          controllers: [...zoneControllerIds(venue, zone)].sort(),
          correctiveActorIds: correctiveActors(state, venue, zone, at),
        })),
    )
    .sort((a, b) => (a.venueId + ":" + a.zoneId).localeCompare(b.venueId + ":" + b.zoneId));
  if (!targets.length) return null;
  const count =
    state.eventAttempts?.attempts.filter((row) => row.origin === "world" || row.origin === "scene").length ?? 0;
  const target = targets[(hashString(state.seed) + count) % targets.length]!;
  const relevant = (row: { venueId: string; zoneId: string }) =>
    row.venueId === target.venueId && row.zoneId === target.zoneId;
  return structuredClone({
    version: 1,
    id: sourceId,
    source,
    sourceId,
    seed: state.seed,
    at,
    adoptedAt: narrative.adoptedAt,
    setting: villageCurrentSetting(state),
    facts: state.worldFacts,
    consequence: state.narrativeConsequence ?? "gentle",
    reviewBasis: state.eventAttempts?.lastAttemptAt ?? "",
    targets: [target],
    situations: [
      ...narrative.situations.filter((row) => row.status === "active" && row.targets.some(relevant)).slice(0, 3),
      ...narrative.situations.filter((row) => row.status === "resolved" && row.targets.some(relevant)).slice(-1),
    ],
    conditions: activeNarrativeConditions(narrative, at).filter(relevant).slice(-8),
    weather: narrative.weather,
    weatherRevision: narrative.weatherRevision,
    moment: deriveVillageMoment({
      foundedAt: state.foundedAt,
      seed: state.seed,
      timeZone: state.timeZone || undefined,
      now: new Date(at),
      environment: narrative,
    }),
    baselineWeather: deriveVillageMoment({
      foundedAt: state.foundedAt,
      seed: state.seed,
      timeZone: state.timeZone || undefined,
      now: new Date(at),
    }).weather,
  });
}
export function assertNarrativeAdmission(state: VillageState, grant: NarrativeAdmission): void {
  if (
    grant.version !== 1 ||
    grant.seed !== state.seed ||
    state.narrative?.adoptedAt !== grant.adoptedAt ||
    grant.at < grant.adoptedAt ||
    grant.setting !== villageCurrentSetting(state) ||
    JSON.stringify(grant.facts) !== JSON.stringify(state.worldFacts) ||
    grant.targets.length !== 1
  )
    throw conflict("The admitted world context changed. The saved result is retained.");
  for (const target of grant.targets) {
    const venue = state.venues.find((row) => row.id === target.venueId);
    const zone = venue && venueZones(venue).find((row) => row.id === target.zoneId);
    if (
      !venue ||
      !zone ||
      zoneClosed(state, venue, zone) ||
      zone.description !== target.description ||
      JSON.stringify(correctiveActors(state, venue, zone, grant.at)) !== JSON.stringify(target.correctiveActorIds) ||
      JSON.stringify([...zoneControllerIds(venue, zone)].sort()) !== JSON.stringify(target.controllers) ||
      JSON.stringify(zone.state) !== JSON.stringify(target.state)
    )
      throw conflict("The admitted Zone changed. The saved result is retained.");
  }
}
export function readNarrativeDevelopment(value: unknown, grant: NarrativeAdmission): NarrativeDevelopment {
  const row = object(value);
  exact(row, ["severity", "occurrence", "situation", "physical", "conditions", "weather"]);
  if (!CONSEQUENCES.includes(row.severity)) throw badGateway("Invalid narrative consequence.");
  const situation = object(row.situation);
  exact(situation, ["id", "expectedRevision", "title", "summary", "status"]);
  if (situation.id !== null && !grant.situations.some((item) => item.id === situation.id))
    throw badGateway("Situation was not admitted.");
  if (!["active", "resolved"].includes(situation.status)) throw badGateway("Invalid situation status.");
  const target = (venueId: unknown, zoneId: unknown) => {
    const admitted = grant.targets.find((item) => item.venueId === venueId && item.zoneId === zoneId);
    if (!admitted) throw badGateway("The proposed target was not admitted.");
    return admitted;
  };
  if (
    !Array.isArray(row.physical) ||
    row.physical.length > 1 ||
    !Array.isArray(row.conditions) ||
    row.conditions.length > 4
  )
    throw badGateway("Narrative effect exceeds its finite grant.");
  const physical = row.physical.map((entry: unknown) => {
    const change = object(entry);
    exact(change, ["venueId", "zoneId", "update"]);
    const admitted = target(change.venueId, change.zoneId);
    const update = object(change.update);
    exact(update, ["narration", "expectedRevision", "appearanceChanged", "edits", "append", "recent"]);
    return {
      venueId: admitted.venueId,
      zoneId: admitted.zoneId,
      update: readPlaceUpdate({ ...update, happened: true }, admitted, grant.at)!,
    };
  });
  const conditions = row.conditions.map((entry: unknown) => {
    const change = object(entry);
    exact(change, [
      "id",
      "expectedRevision",
      "venueId",
      "zoneId",
      "observation",
      "restriction",
      "remedy",
      "endsAt",
      "clear",
    ]);
    const admitted = target(change.venueId, change.zoneId);
    if (
      change.id !== null &&
      !grant.conditions.some(
        (item) => item.id === change.id && item.venueId === admitted.venueId && item.zoneId === admitted.zoneId,
      )
    )
      throw badGateway("Condition was not admitted.");
    if (!["none", "ordinary-use"].includes(change.restriction) || typeof change.clear !== "boolean")
      throw badGateway("Invalid condition restriction.");
    const endsAt = change.endsAt === null ? null : stamp(change.endsAt);
    if (endsAt && (endsAt <= grant.at || Date.parse(endsAt) - Date.parse(grant.at) > 7 * 86400_000))
      throw badGateway("Condition deadline is outside the admitted window.");
    const remedy = text(change.remedy, 600, true);
    if (
      change.restriction === "ordinary-use" &&
      (admitted.exterior || (!endsAt && (!remedy.trim() || !admitted.correctiveActorIds.length)))
    )
      throw badGateway(
        "A restriction needs accessible corrective work or an established timed release; Entrances remain open.",
      );
    return {
      id: change.id,
      expectedRevision: revision(change.expectedRevision),
      venueId: admitted.venueId,
      zoneId: admitted.zoneId,
      observation: text(change.observation, 600),
      restriction: change.restriction,
      remedy,
      endsAt,
      clear: change.clear,
    };
  });
  let weather: NarrativeDevelopment["weather"] = null;
  if (row.weather !== null) {
    if (grant.source !== "world") throw badGateway("A Scene cannot introduce Village-wide weather.");
    const change = object(row.weather);
    exact(change, ["description", "endsAt", "supersedes"]);
    const endsAt = stamp(change.endsAt);
    if (
      endsAt <= grant.at ||
      Date.parse(endsAt) - Date.parse(grant.at) > 7 * 86400_000 ||
      (change.supersedes !== null && change.supersedes !== grant.weather?.id)
    )
      throw badGateway("Invalid weather interval or predecessor.");
    weather = { description: text(change.description, 600), endsAt, supersedes: change.supersedes };
  }
  return {
    severity: row.severity,
    occurrence: text(row.occurrence, 1200),
    situation: {
      id: situation.id,
      expectedRevision: revision(situation.expectedRevision),
      title: text(situation.title, 160),
      summary: text(situation.summary, 1200),
      status: situation.status,
    },
    physical,
    conditions,
    weather,
  };
}
/** One root transaction publishes physical after-values, conditions and their receipt together. */
export function applyNarrativeDevelopment(
  state: VillageState,
  grant: NarrativeAdmission,
  development: NarrativeDevelopment,
): NarrativeReceipt {
  const narrative = state.narrative!;
  const previous = narrative?.receipts.find((row) => row.id === grant.id);
  if (previous?.rejected) throw conflict("This saved environmental proposal was explicitly rejected.");
  if (previous) return previous;
  assertNarrativeAdmission(state, grant);
  const source = narrative.claims?.find((row) => row.id === grant.id && row.fingerprint === backgroundRevision(grant));
  if (!source) throw conflict("The environmental source has no matching shared opportunity admission.");
  if (
    CONSEQUENCES.indexOf(development.severity) > CONSEQUENCES.indexOf(grant.consequence) ||
    CONSEQUENCES.indexOf(development.severity) > CONSEQUENCES.indexOf(state.narrativeConsequence ?? "gentle")
  )
    throw conflict("Consequence was lowered. The incompatible saved result is retained.");
  const proposed = development.situation;
  const prior = narrative.situations.find((row) => row.id === proposed.id);
  if (!prior && !development.physical.length && !development.conditions.length && !development.weather)
    throw badGateway("A new world occurrence needs a perceivable consequence.");
  if ((prior?.revision ?? 0) !== proposed.expectedRevision)
    throw conflict("The situation changed. The saved result is retained.");
  const situation = {
    ...proposed,
    id: prior?.id ?? grant.id + ":situation",
    revision: proposed.expectedRevision + 1,
    targets: grant.targets.map(({ venueId, zoneId }) => ({ venueId, zoneId })),
    updatedAt: grant.at,
  };
  const conditions: NarrativeCondition[] = development.conditions.map((change, index) => {
    const old = narrative.conditions.find((row) => row.id === change.id);
    if ((old?.revision ?? 0) !== change.expectedRevision)
      throw conflict("The condition changed. The saved result is retained.");
    if (change.clear && !old) throw badGateway("Only an admitted condition can be cleared.");
    const physical = development.physical.find((row) => row.venueId === change.venueId && row.zoneId === change.zoneId);
    const before = grant.targets.find((row) => row.venueId === change.venueId && row.zoneId === change.zoneId)!;
    const enduring = physical && applyPlaceUpdate(before, physical.update, grant.at).description !== before.description;
    if (
      old?.physicalRevision !== undefined &&
      (change.clear || (old.restriction === "ordinary-use" && change.restriction === "none")) &&
      !enduring
    )
      throw badGateway("Reopening this repair-linked condition needs matching physical work.");
    if (
      change.restriction === "ordinary-use" &&
      (old?.physicalRevision !== undefined || enduring) &&
      (!before.correctiveActorIds.length || change.endsAt !== null)
    )
      throw badGateway(
        "Damage-linked restrictions need an accessible corrective route and cannot expire as a substitute for repair.",
      );
    return {
      id: old?.id ?? grant.id + ":condition:" + index,
      revision: change.expectedRevision + 1,
      situationId: situation.id,
      venueId: change.venueId,
      zoneId: change.zoneId,
      observation: change.observation,
      restriction: change.restriction,
      remedy: change.remedy,
      startsAt: old?.startsAt ?? grant.at,
      endsAt: change.endsAt,
      clearedAt: change.clear ? grant.at : null,
      ...(old?.physicalRevision !== undefined || enduring
        ? { physicalRevision: enduring ? before.state.revision + 1 : old!.physicalRevision }
        : {}),
    };
  });
  if (new Set(conditions.map((row) => row.id)).size !== conditions.length)
    throw badGateway("Duplicate condition effects.");
  if (
    development.weather &&
    (narrative.weatherRevision !== grant.weatherRevision ||
      (narrative.weather &&
        narrative.weather.endsAt > grant.at &&
        development.weather.supersedes !== narrative.weather.id))
  )
    throw conflict("Weather changed or needs explicit supersession. The saved result is retained.");
  const physical = development.physical.map(({ venueId, zoneId, update }) => {
    const zone = venueZones(state.venues.find((row) => row.id === venueId)!).find((row) => row.id === zoneId)!;
    const after = applyPlaceUpdate(zone, update, grant.at);
    if (after.description !== zone.description && update.appearanceChanged === true)
      zone.picture = { ...zone.picture, base: zone.picture?.base ?? zone.image, dirty: true };
    zone.description = after.description;
    zone.state = after.state;
    return { ...after, venueId, zoneId, appearanceChanged: update.appearanceChanged === true };
  });
  const after: NarrativeAfter = { situations: [situation], conditions };
  if (development.weather) {
    narrative.weatherRevision++;
    narrative.weather = {
      id: grant.id + ":weather",
      revision: narrative.weatherRevision,
      sourceId: grant.sourceId,
      description: development.weather.description,
      startsAt: grant.at,
      endsAt: development.weather.endsAt,
    };
    after.weather = structuredClone(narrative.weather);
    after.weatherRevision = narrative.weatherRevision;
  }
  mergeNarrativeAfter(narrative, after);
  narrative.revision++;
  const receipt: NarrativeReceipt = {
    id: grant.id,
    sourceId: grant.sourceId,
    source: grant.source,
    at: grant.at,
    occurrence: development.occurrence,
    after: structuredClone(after),
    physical: structuredClone(physical),
  };
  narrative.receipts.push(receipt);
  return receipt;
}
export function mergeNarrativeAfter(state: NarrativeState, after: NarrativeAfter): void {
  for (const key of ["situations", "conditions"] as const) {
    const ids = new Set(after[key].map((row) => row.id));
    (state[key] as (typeof state)[typeof key]) = [
      ...state[key].filter((row) => !ids.has(row.id)),
      ...structuredClone(after[key]),
    ] as any;
  }
  if (after.weatherRevision !== undefined) {
    state.weatherRevision = after.weatherRevision;
    state.weather = structuredClone(after.weather ?? null);
  }
}
/** Ordinary action authority is established by the existing physical-effect owner first. */
export function clearRepairedConditions(
  state: VillageState,
  venueId: string,
  zoneId: string,
  changes: { id: string; expectedRevision: number }[] | undefined,
  sourceId: string,
  at: string,
): void {
  if (!changes?.length) return;
  if (!state.narrative || changes.length > 4) throw conflict("The repair conditions are unavailable.");
  const id = "repair:" + sourceId + ":" + venueId + ":" + zoneId + ":" + hashString(JSON.stringify(changes));
  if (state.narrative.receipts.some((row) => row.id === id)) return;
  const conditions = changes.map((change) => {
    const row = state.narrative!.conditions.find(
      (item) => item.id === change.id && item.venueId === venueId && item.zoneId === zoneId,
    );
    if (!row || row.revision !== change.expectedRevision || row.clearedAt)
      throw conflict("A repair condition changed. The draft is retained.");
    return { ...row, revision: row.revision + 1, clearedAt: at };
  });
  const after = { situations: [], conditions };
  mergeNarrativeAfter(state.narrative, after);
  state.narrative.revision++;
  const zone = state.venues.find((row) => row.id === venueId)?.zones?.find((row) => row.id === zoneId);
  state.narrative.receipts.push({
    id,
    at,
    sourceId,
    source: "action",
    occurrence: "Completed evidenced corrective work.",
    after,
    physical: zone
      ? [
          {
            venueId,
            zoneId,
            description: zone.description,
            state: structuredClone(zone.state),
            appearanceChanged: false,
          },
        ]
      : [],
  });
}
