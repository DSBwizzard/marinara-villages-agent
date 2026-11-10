import type { VillageState } from "../models/world.js";
import type {
  NarrativeAdmission,
  NarrativeAfter,
  NarrativeCondition,
  NarrativeDevelopment,
  NarrativeReceipt,
  NarrativeState,
  NarrativeTarget,
} from "../models/narrative-model.js";
import { conflict, badGateway } from "./errors.js";
import { currentVillageCircumstances, villageCurrentSetting } from "./prompt-preset.js";
import { hashString, deriveVillageMoment, WORLD_WEATHER } from "./village-clock.js";
import { backgroundRevision } from "./background-revision.js";
import { activeNarrativeConditions } from "./narrative-environment.js";
import { venueZones, zoneClosed, zoneControllerIds } from "./venue-zones.js";
import { accessibleVenueRoute } from "./venue-path.js";
import { ZonedDate } from "../../../shared/helpers/zoned-date.js";
import { currentRoomViews } from "./continuity-retrieval.js";
import {
  continuityConstraints,
  continuityHolderKey,
  continuityProtectionFingerprint,
  ROOM_CONTINUITY_TEXT_BYTES,
} from "./continuity.js";
import { memoryHash } from "./memory-integrity.js";
import { retainNativeFact } from "./native-continuity.js";
import { nativeEpisodeId } from "./episode-sources.js";
import { venueDesignHash } from "./project-structure.js";

export const CONSEQUENCES = ["gentle", "moderate", "dramatic"] as const;
const WORLD_ROOM_BYTES = 32000;
function narrativeStructure(venue: VillageState["venues"][number], zone: ReturnType<typeof venueZones>[number]) {
  return memoryHash([
    venueDesignHash(venue, [zone.id]),
    venue.form,
    venue.constructionStatus,
    zone.preparation?.status,
  ]);
}
function narrativeRoom(state: VillageState, venueId: string, zoneId: string, at: string) {
  const holder = { kind: "room" as const, placeId: venueId, zoneId };
  const views = currentRoomViews(state.continuity, state.episodes, holder, at).filter(
    (row) => row.version.room?.visibility === "observable",
  );
  const protections = continuityConstraints(state.continuity, [holder]);
  const protectedIds = new Set(protections.map((row) => row.id));
  const concealedProtection = state.continuity.versions.some(
    (row) => protectedIds.has(row.rootId) && row.room?.visibility === "concealed",
  );
  const room = views.map(({ id, version }) => ({
    id,
    text: version.text,
    ...(version.room?.expiresAt ? { expiresAt: version.room.expiresAt } : {}),
  }));
  const fits =
    Buffer.byteLength(JSON.stringify([room, concealedProtection ? [] : protections]), "utf8") <= WORLD_ROOM_BYTES;
  const roomWritable = fits && !concealedProtection;
  const protectionFingerprint = continuityProtectionFingerprint(state.continuity, [holder]);
  return {
    holder,
    views,
    room: fits ? room : [],
    protections: roomWritable ? protections : [],
    roomWritable,
    protectionFingerprint,
    roomBasis: memoryHash([
      views.map(({ id, recordRevision, headRevision, version }) => [id, recordRevision, headRevision, version.id]),
      protectionFingerprint,
    ]),
  };
}
function correctiveActors(
  state: VillageState,
  venue: VillageState["venues"][number],
  zone: ReturnType<typeof venueZones>[number],
  at: string,
): string[] {
  const controllers = zoneControllerIds(venue, zone);
  const candidates =
    controllers.length || zone.access?.mode !== "public"
      ? controllers
      : ["player", ...state.villagers.map((row) => row.characterId)];
  return candidates
    .filter(
      (id) =>
        (id === "player" || state.villagers.some((row) => row.characterId === id)) &&
        accessibleVenueRoute(state, venue, id, zone.id, new ZonedDate(at, state.timeZone || "UTC"), false, false),
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
  if (!narrative || at < narrative.adoptedAt || !state.setupAt) return null;
  const targets = state.venues
    .flatMap((venue) =>
      venueZones(venue)
        .filter(
          (zone) =>
            !zoneClosed(state, venue, zone) &&
            venue.constructionStatus !== "worksite" &&
            (!zone.preparation || zone.preparation.status === "ready") &&
            !narrative.claims?.some((claim) => claim.venueId === venue.id && claim.zoneId === zone.id) &&
            (!local || (venue.id === local.venueId && zone.id === local.zoneId)),
        )
        .map((zone) => ({
          venueId: venue.id,
          zoneId: zone.id,
          name: venue.name + " / " + zone.name,
          exterior: zone.kind === "exterior",
          structure: narrativeStructure(venue, zone),
          controllers: [...zoneControllerIds(venue, zone)].sort(),
          correctiveActorIds: correctiveActors(state, venue, zone, at),
        })),
    )
    .sort((a, b) => (a.venueId + ":" + a.zoneId).localeCompare(b.venueId + ":" + b.zoneId));
  if (!targets.length) return null;
  const count =
    state.eventAttempts?.attempts.filter((row) => row.origin === "world" || row.origin === "scene").length ?? 0;
  const location = targets[(hashString(state.seed) + count) % targets.length]!;
  const { room, roomBasis, protections, roomWritable } = narrativeRoom(state, location.venueId, location.zoneId, at);
  const target: NarrativeTarget = {
    ...location,
    room: source === "world" ? room : [],
    protections: source === "world" ? protections : [],
    roomWritable: source === "world" && roomWritable,
    roomBasis,
  };
  const relevant = (row: { venueId: string; zoneId: string }) =>
    row.venueId === target.venueId && row.zoneId === target.zoneId;
  return structuredClone({
    version: 2,
    id: sourceId,
    source,
    sourceId,
    seed: state.seed,
    setupAt: state.setupAt,
    at,
    adoptedAt: narrative.adoptedAt,
    setting: villageCurrentSetting(state),
    facts: currentVillageCircumstances(state),
    consequence: state.narrativeConsequence ?? "gentle",
    reviewBasis: state.eventAttempts?.lastAttemptAt ?? "",
    targets: [target],
    situations: [
      ...narrative.situations
        .filter((row) => row.status === "active" && (row.scope === "village" || row.targets.some(relevant)))
        .slice(0, 7),
      ...narrative.situations
        .filter((row) => row.status === "resolved" && (row.scope === "village" || row.targets.some(relevant)))
        .slice(-1),
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
    grant.version !== 2 ||
    grant.seed !== state.seed ||
    grant.setupAt !== state.setupAt ||
    state.narrative?.adoptedAt !== grant.adoptedAt ||
    grant.at < grant.adoptedAt ||
    grant.setting !== villageCurrentSetting(state) ||
    JSON.stringify(grant.facts) !== JSON.stringify(currentVillageCircumstances(state)) ||
    grant.targets.length !== 1
  )
    throw conflict("The admitted world context changed. The saved result is retained.");
  for (const target of grant.targets) {
    const venue = state.venues.find((row) => row.id === target.venueId);
    const zone = venue && venueZones(venue).find((row) => row.id === target.zoneId);
    const room = narrativeRoom(state, target.venueId, target.zoneId, grant.at);
    if (
      !venue ||
      !zone ||
      zoneClosed(state, venue, zone) ||
      venue.constructionStatus === "worksite" ||
      (zone.preparation && zone.preparation.status !== "ready") ||
      narrativeStructure(venue, zone) !== target.structure ||
      room.roomBasis !== target.roomBasis ||
      JSON.stringify(grant.source === "world" ? room.room : []) !== JSON.stringify(target.room) ||
      JSON.stringify(grant.source === "world" ? room.protections : []) !== JSON.stringify(target.protections) ||
      target.roomWritable !== (grant.source === "world" && room.roomWritable) ||
      JSON.stringify(correctiveActors(state, venue, zone, grant.at)) !== JSON.stringify(target.correctiveActorIds) ||
      JSON.stringify([...zoneControllerIds(venue, zone)].sort()) !== JSON.stringify(target.controllers)
    )
      throw conflict("The admitted Zone changed. The saved result is retained.");
  }
}
export function readNarrativeDevelopment(value: unknown, grant: NarrativeAdmission): NarrativeDevelopment {
  const row = object(value);
  exact(row, ["severity", "occurrence", "situation", "room", "conditions", "weather", "protection"]);
  if (!CONSEQUENCES.includes(row.severity)) throw badGateway("Invalid narrative consequence.");
  const situation = object(row.situation);
  exact(situation, ["scope", "id", "expectedRevision", "title", "summary", "status"]);
  const previousSituation = grant.situations.find((item) => item.id === situation.id);
  if (
    !["village", "zone"].includes(situation.scope) ||
    (previousSituation && previousSituation.scope !== situation.scope) ||
    (!previousSituation && situation.scope === "village" && grant.source !== "world")
  )
    throw badGateway("Situation scope exceeds its admission.");
  if (situation.id !== null && !grant.situations.some((item) => item.id === situation.id))
    throw badGateway("Situation was not admitted.");
  if (!["active", "resolved"].includes(situation.status)) throw badGateway("Invalid situation status.");
  const target = (venueId: unknown, zoneId: unknown) => {
    const admitted = grant.targets.find((item) => item.venueId === venueId && item.zoneId === zoneId);
    if (!admitted) throw badGateway("The proposed target was not admitted.");
    return admitted;
  };
  if (
    !Array.isArray(row.room) ||
    row.room.length > 4 ||
    (!grant.targets[0]?.roomWritable && row.room.length > 0) ||
    !Array.isArray(row.conditions) ||
    row.conditions.length > 4
  )
    throw badGateway("Narrative effect exceeds its finite grant.");
  const protections = grant.targets[0]!.protections;
  let protection: NarrativeDevelopment["protection"];
  if (row.protection !== undefined || protections.length) {
    const screening = object(row.protection);
    exact(screening, ["roots", "disposition"]);
    if (
      screening.disposition !== "clear" ||
      !Array.isArray(screening.roots) ||
      screening.roots.some((id: unknown) => !protections.some((row) => row.id === id)) ||
      new Set(screening.roots).size !== screening.roots.length
    )
      throw badGateway("The environmental proposal needs clear screening against the supplied Room protections.");
    protection = { roots: [...screening.roots], disposition: "clear" };
  }
  const updated = new Set<string>();
  const room: NarrativeDevelopment["room"] = row.room.map((entry: unknown) => {
    const change = object(entry);
    exact(change, ["replace", "text", "expiresInMinutes"]);
    const prior = grant.targets[0]?.room.find((row) => row.id === change.replace);
    if ((change.replace !== undefined && (!prior || updated.has(prior.id))) || (change.text === null && !prior))
      throw badGateway("The Room entry was not admitted or was changed twice.");
    const description = change.text === null ? null : text(change.text, ROOM_CONTINUITY_TEXT_BYTES);
    if (
      description !== null &&
      (Buffer.byteLength(description, "utf8") > ROOM_CONTINUITY_TEXT_BYTES || description === prior?.text)
    )
      throw badGateway("Supply a complete changed Room entry within its text limit.");
    const duration = change.expiresInMinutes;
    if (duration !== undefined && (prior || !Number.isSafeInteger(duration) || duration < 1 || duration > 10080))
      throw badGateway("Only an independent new Room entry may expire.");
    if (prior) updated.add(prior.id);
    return {
      text: description,
      ...(prior ? { replace: prior.id } : {}),
      ...(duration !== undefined ? { expiresInMinutes: duration } : {}),
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
    const prior = grant.conditions.find(
      (item) => item.id === change.id && item.venueId === admitted.venueId && item.zoneId === admitted.zoneId,
    );
    if (change.id !== null && !prior) throw badGateway("Condition was not admitted.");
    if (!["none", "ordinary-use"].includes(change.restriction) || typeof change.clear !== "boolean")
      throw badGateway("Invalid condition restriction.");
    const endsAt = change.endsAt === null ? null : stamp(change.endsAt);
    if (endsAt && (endsAt <= grant.at || Date.parse(endsAt) - Date.parse(grant.at) > 7 * 86400_000))
      throw badGateway("Condition deadline is outside the admitted window.");
    const observation = prior && change.observation === undefined ? undefined : text(change.observation, 600);
    const remedy = prior && change.remedy === undefined ? undefined : text(change.remedy, 600, true);
    if (
      change.restriction === "ordinary-use" &&
      (admitted.exterior || (!endsAt && (!(remedy ?? prior?.remedy)?.trim() || !admitted.correctiveActorIds.length)))
    )
      throw badGateway(
        "A restriction needs accessible corrective work or an established timed release; Entrances remain open.",
      );
    return {
      id: change.id,
      expectedRevision: revision(change.expectedRevision),
      venueId: admitted.venueId,
      zoneId: admitted.zoneId,
      ...(observation !== undefined ? { observation } : {}),
      restriction: change.restriction,
      ...(remedy !== undefined ? { remedy } : {}),
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
    if (!WORLD_WEATHER.includes(change.description)) throw badGateway("Choose a supplied weather value.");
    weather = { description: change.description, endsAt, supersedes: change.supersedes };
  }
  return {
    severity: row.severity,
    occurrence: text(row.occurrence, 1200),
    situation: {
      scope: situation.scope,
      id: situation.id,
      expectedRevision: revision(situation.expectedRevision),
      title: text(situation.title, 160),
      summary: text(situation.summary, 1200),
      status: situation.status,
    },
    room,
    ...(protection ? { protection } : {}),
    conditions,
    weather,
  };
}
/** One root transaction publishes the accepted Room entries, conditions and their evidence. */
export function applyNarrativeDevelopment(
  state: VillageState,
  grant: NarrativeAdmission,
  saved: unknown,
): NarrativeReceipt {
  const narrative = state.narrative!;
  const previous = narrative?.receipts.find((row) => row.id === grant.id);
  if (previous?.rejected) throw conflict("This saved environmental proposal was explicitly rejected.");
  const development = readNarrativeDevelopment(saved, grant);
  const resultFingerprint = memoryHash([grant, development]);
  if (previous) {
    if (previous.resultFingerprint !== resultFingerprint)
      throw conflict("The environmental receipt belongs to another result.");
    return previous;
  }
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
  if (!prior && !development.room.length && !development.conditions.length && !development.weather)
    throw badGateway("A new world occurrence needs a perceivable consequence.");
  if ((proposed.id !== null && !prior) || (prior?.revision ?? 0) !== proposed.expectedRevision)
    throw conflict("The situation changed. The saved result is retained.");
  const situation = {
    ...proposed,
    scope: proposed.scope,
    id: prior?.id ?? grant.id + ":situation",
    revision: proposed.expectedRevision + 1,
    targets: proposed.scope === "village" ? [] : grant.targets.map(({ venueId, zoneId }) => ({ venueId, zoneId })),
    updatedAt: grant.at,
  };
  if (
    development.weather &&
    (narrative.weatherRevision !== grant.weatherRevision ||
      (narrative.weather &&
        narrative.weather.endsAt > grant.at &&
        development.weather.supersedes !== narrative.weather.id))
  )
    throw conflict("Weather changed or needs explicit supersession. The saved result is retained.");
  const target = grant.targets[0]!;
  const { holder, views, protectionFingerprint } = narrativeRoom(state, target.venueId, target.zoneId, grant.at);
  const provenance = grant.source === "world" && target.room.length ? views.map((row) => row.version.id) : [];
  const blocked = new Set(target.protections.flatMap((row) => row.forbidden));
  const suppliedText = [
    proposed.title,
    proposed.summary,
    development.occurrence,
    development.weather?.description,
    ...development.conditions.flatMap((row) => [row.observation, row.remedy]),
    ...development.room.map((row) => row.text),
  ];
  if (suppliedText.some((row) => row && blocked.has(row)))
    throw conflict("The environmental proposal would restore protected Room text.");
  const holderKey = continuityHolderKey(holder);
  const candidate = { ...state };
  const affected = new Set<string>();
  const retired = new Set<string>();
  const currentEffects: string[] = [];
  let enduring = false;
  for (const [index, change] of development.room.entries()) {
    const before = views.find((row) => row.id === change.replace);
    const receiptId = "world-room:" + memoryHash([state.seed, grant.id, index]).slice(0, 40);
    retainNativeFact(
      candidate,
      {
        id: receiptId,
        kind: "room",
        targetId: JSON.stringify([target.venueId, target.zoneId]),
        revision: narrative.revision + 1,
        text: change.text ?? development.occurrence,
        witnesses: [],
      },
      grant.at,
      {
        room: holder,
        provenance,
        ...(development.protection
          ? { screening: { ...development.protection, fingerprint: protectionFingerprint } }
          : {}),
        roomChange: {
          ...(before
            ? {
                target: {
                  id: before.id,
                  recordRevision: before.recordRevision,
                  heads: { [holderKey]: before.headRevision },
                },
              }
            : {}),
          ...(change.text === null ? { retire: true } : {}),
          ...(change.expiresInMinutes !== undefined ? { expiresInMinutes: change.expiresInMinutes } : {}),
        },
      },
    );
    if (change.expiresInMinutes === undefined && !before?.version.room?.expiresAt) {
      enduring = true;
      const root = candidate.continuity.receipts[nativeEpisodeId(state.seed, receiptId) + ":fact"].roots[0]!;
      if (before) affected.add(root);
      if (before && change.text === null) retired.add(root);
      if (change.text !== null) currentEffects.push(root);
    }
  }
  const conditions: NarrativeCondition[] = development.conditions.map((change, index) => {
    const old = narrative.conditions.find((row) => row.id === change.id);
    if ((change.id !== null && !old) || (old?.revision ?? 0) !== change.expectedRevision)
      throw conflict("The condition changed. The saved result is retained.");
    if (change.clear && !old) throw badGateway("Only an admitted condition can be cleared.");
    if (
      old?.repairEntries?.length &&
      (change.clear || (old.restriction === "ordinary-use" && change.restriction === "none")) &&
      !old.repairEntries.every((id) => affected.has(id))
    )
      throw badGateway("Reopening this repair-linked condition needs matching physical work.");
    const repairEntries =
      old?.repairEntries ?? (enduring && change.restriction === "ordinary-use" ? currentEffects : undefined);
    if (
      change.restriction === "ordinary-use" &&
      repairEntries &&
      (!repairEntries.length || !target.correctiveActorIds.length || change.endsAt !== null)
    )
      throw badGateway(
        "Damage-linked restrictions need current Room entries and an accessible corrective route. They cannot expire as a substitute for repair.",
      );
    return {
      id: old?.id ?? grant.id + ":condition:" + index,
      revision: change.expectedRevision + 1,
      situationId: situation.id,
      venueId: change.venueId,
      zoneId: change.zoneId,
      observation: change.observation ?? old!.observation,
      restriction: change.restriction,
      remedy: change.remedy ?? old!.remedy,
      startsAt: old?.startsAt ?? grant.at,
      endsAt: change.endsAt,
      clearedAt: change.clear ? grant.at : null,
      ...(repairEntries ? { repairEntries } : {}),
    };
  });
  if (new Set(conditions.map((row) => row.id)).size !== conditions.length)
    throw badGateway("Duplicate condition effects.");
  if (
    retired.size &&
    [...activeNarrativeConditions(narrative, grant.at), ...conditions].some((previous) => {
      const row = conditions.find((condition) => condition.id === previous.id) ?? previous;
      return (
        (!row.clearedAt || row.clearedAt > grant.at) &&
        (!row.endsAt || row.endsAt > grant.at) &&
        row.restriction === "ordinary-use" &&
        row.repairEntries?.some((id) => retired.has(id))
      );
    })
  )
    throw badGateway("A Room edit cannot remove an active restriction's repair target.");
  if (grant.source === "world") {
    retainNativeFact(
      candidate,
      {
        id: "world-circumstance:" + memoryHash([state.seed, grant.id]).slice(0, 40),
        kind: "circumstance",
        targetId: situation.id,
        revision: situation.revision,
        text: JSON.stringify({
          at: grant.at,
          situation: { title: situation.title, summary: situation.summary, status: situation.status },
          conditions: conditions.map((condition, index) => ({
            id: condition.id,
            revision: condition.revision,
            ...Object.fromEntries(
              Object.entries(development.conditions[index]).filter(([key]) =>
                ["observation", "remedy", "restriction", "endsAt", "clear"].includes(key),
              ),
            ),
          })),
        }),
        circumstance: { summary: situation.summary, status: situation.status },
        witnesses: [],
      },
      grant.at,
      { room: holder, provenance },
    );
    state.continuity = candidate.continuity;
    state.episodes = candidate.episodes;
  }
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
    resultFingerprint,
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
