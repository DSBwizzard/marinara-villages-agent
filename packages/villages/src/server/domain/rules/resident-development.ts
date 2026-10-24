import { recordHousingAvailability, housingAvailableAt } from "./development-housing.js";
import { moveConsentingActors } from "./development-consent.js";
import type { VillageState, VillageVenue } from "../models/world.js";
import type {
  DevelopmentState,
  DevelopmentReview,
  DevelopmentProposal,
  DevelopmentStep,
  Pursuit,
} from "../models/development-model.js";
import { backgroundRevision } from "./background-revision.js";
import { badRequest, conflict } from "./errors.js";
import { assertResidencePrivateDestination } from "./venue-layout.js";
import { hasVenueClass, venueAssignedCount, venueCapacity, venueResidentIds } from "./venue-model.js";
import { venueZones } from "./venue-zones.js";
import { completeResidenceMove } from "./residence-move.js";
import { deriveVillageMoment } from "./village-clock.js";

export const DEVELOPMENT_HOUR_MS = 3_600_000;
export const DEVELOPMENT_MOVE_MS = 24 * DEVELOPMENT_HOUR_MS;
export const DEVELOPMENT_MAX_PURSUITS = 2;
export const activePursuit = (p: Pursuit) => !["ended", "completed"].includes(p.status);
const iso = (ms: number) => new Date(ms).toISOString();
const residentHome = (state: VillageState, id: string) =>
  state.venues.find((v) => venueResidentIds(v).includes(id))?.id ?? "";
export function initializeDevelopment(state: VillageState, enabled: boolean, at: string): void {
  if (!state.foundedAt) throw badRequest("Found a Village before enabling resident development.");
  if (!state.development)
    state.development = {
      version: 1,
      enabled: false,
      activatedAt: at,
      generation: 0,
      residents: {},
      observations: {},
      log: [],
    };
  const d = state.development;
  recordHousingAvailability(state, at);
  if (d.enabled === enabled) return;
  d.enabled = enabled;
  d.generation++;
  // Enabling/re-enabling starts a new eligible interval; disabled time is never invented.
  if (enabled)
    for (const resident of state.villagers) {
      const old = d.residents[resident.characterId];
      d.residents[resident.characterId] = {
        revision: (old?.revision ?? 0) + 1,
        reviewedThrough: at,
        nextReviewAt: iso(Date.parse(at) + DEVELOPMENT_MOVE_MS),
        reason: "First review after one day.",
        pursuits: old?.pursuits ?? [],
      };
    }
}
/** Revision of authoritative housing facts; observation timestamps are intentionally separate. */
export function developmentHousingRevision(state: VillageState): string {
  return backgroundRevision([
    state.setting,
    state.worldFacts,
    state.villagers.map((r) => [r.characterId, r.cardSnapshot.capturedAt]),
    state.venues.map((v) => [
      v.id,
      v.classes,
      v.residenceCapacity,
      v.occupancy,
      v.residentIds,
      v.access,
      v.constructionStatus,
      venueZones(v).map((z) => [z.id, z.kind, z.ownerId, z.access, z.connectedTo]),
    ]),
    state.residences,
  ]);
}
export function developmentReview(state: VillageState, at: string): DevelopmentReview | null {
  const d = state.development;
  if (!d?.enabled) return null;
  const due = state.villagers
    .map((r) => r.characterId)
    .filter(
      (id) =>
        d.residents[id] &&
        !d.residents[id]!.pursuits.some((p) => p.status === "arranged") &&
        Date.parse(d.residents[id]!.nextReviewAt) <= Date.parse(at),
    )
    .sort((a, b) => d.residents[a]!.nextReviewAt.localeCompare(d.residents[b]!.nextReviewAt) || a.localeCompare(b))
    .slice(0, 4);
  if (!due.length) return null;
  return {
    version: 1,
    seed: state.seed,
    activatedAt: d.activatedAt,
    generation: d.generation,
    through: at,
    housingRevision: developmentHousingRevision(state),
    housingAvailableAt: housingAvailableAt(state, at),
    residentIds: due,
    residents: Object.fromEntries(due.map((id) => [id, structuredClone(d.residents[id]!)])),
  };
}
export function developmentReviewValid(state: VillageState, input: DevelopmentReview): boolean {
  const d = state.development;
  return (
    !!d?.enabled &&
    state.seed === input.seed &&
    d.activatedAt === input.activatedAt &&
    d.generation === input.generation &&
    developmentHousingRevision(state) === input.housingRevision &&
    input.residentIds.every((id) => d.residents[id]?.revision === input.residents[id]?.revision)
  );
}
export function observeHousing(state: VillageState, at: string): void {
  const d = state.development;
  if (!d) return;
  for (const resident of state.villagers)
    d.observations[resident.characterId] = { at, signature: residentHome(state, resident.characterId) };
  for (const venue of state.venues)
    d.observations["venue:" + venue.id] = {
      at,
      signature: JSON.stringify([venueResidentIds(venue), venue.occupancy.playerHome]),
    };
}
export { moveConsentingActors } from "./development-consent.js";

function log(d: DevelopmentState, row: DevelopmentState["log"][number]): void {
  if (!d.log.some((r) => r.id === row.id)) d.log = [...d.log, row].slice(-100);
}
function remember(
  state: VillageState,
  p: Pursuit,
  characterId: string,
  id: string,
  at: string,
  text: string,
  knowers: string[],
): void {
  if (state.chronicle.some((r) => r.id === id)) return;
  const moment = deriveVillageMoment({
    foundedAt: state.foundedAt,
    seed: state.seed,
    timeZone: state.timeZone || undefined,
    now: new Date(at),
  });
  state.chronicle.push({
    id,
    dayIndex: moment.dayIndex,
    clock: moment.dayPhase,
    occurredAt: at,
    timePrecision: "exact",
    scope: "private",
    kind: "chat",
    text,
    actors: [
      {
        id: characterId,
        name: state.villagers.find((r) => r.characterId === characterId)?.cardSnapshot.name ?? characterId,
      },
    ],
    subjectCharacterIds: [characterId],
    knownByCharacterIds: [...new Set(knowers.filter((id) => id !== "player"))],
  });
}
export function finishDevelopmentMove(state: VillageState, characterId: string, appliedAt: string): void {
  const d = state.development,
    r = d?.residents[characterId];
  if (!d || !r) return;
  for (const p of r.pursuits.filter(
    (p) => p.status === "arranged" && residentHome(state, characterId) === p.targetVenueId,
  )) {
    const residence = state.residences.find((row) => row.characterId === characterId);
    const effectiveAt = residence?.approvedAt ? iso(Date.parse(residence.approvedAt) + DEVELOPMENT_MOVE_MS) : appliedAt;
    p.status = "completed";
    p.updatedAt = effectiveAt;
    r.revision++;
    r.nextReviewAt = iso(Math.max(Date.parse(appliedAt), Date.parse(effectiveAt)) + DEVELOPMENT_MOVE_MS);
    const name = state.villagers.find((row) => row.characterId === characterId)?.cardSnapshot.name ?? characterId;
    const home = state.venues.find((v) => v.id === p.targetVenueId)?.name ?? p.targetVenueId;
    const text = `${name} moved to ${home}.`;
    remember(state, p, characterId, `development:${p.id}:completed`, effectiveAt, text, [
      characterId,
      ...Object.keys(p.consents),
    ]);
    log(d, {
      id: "completed:" + backgroundRevision([characterId, p.id]),
      at: appliedAt,
      effectiveAt,
      actorId: characterId,
      outcome: "Moved",
      reason: text,
    });
  }
}
function assertMove(state: VillageState, characterId: string, p: Pursuit): VillageVenue {
  const destination = state.venues.find((v) => v.id === p.targetVenueId);
  if (!destination || !hasVenueClass(destination, "residence") || destination.constructionStatus === "worksite")
    throw conflict("The destination is not an available Residence.");
  if (residentHome(state, characterId) !== p.sourceVenueId) throw conflict("Their current home changed.");
  if (p.sourceVenueId === p.targetVenueId) throw conflict("They already live there.");
  if (state.residences.some((r) => r.characterId === characterId && r.status !== "current"))
    throw conflict("Another move request is in progress.");
  const reserved = state.residences.filter(
    (r) => r.status === "moving" && r.proposedVenueId === p.targetVenueId && r.characterId !== characterId,
  ).length;
  if (venueAssignedCount(destination) + reserved >= venueCapacity(destination))
    throw conflict("The Residence has no available bed.");
  assertResidencePrivateDestination(state, destination, characterId, p.privateZoneId);
  return destination;
}
function applyStep(state: VillageState, input: DevelopmentReview, step: DevelopmentStep, appliedAt: string): void {
  const d = state.development!,
    resident = d.residents[step.characterId]!;
  let p = resident.pursuits.find((p) => p.id === step.pursuitId);
  if (step.kind === "intend") {
    if (p || !step.targetVenueId || state.venues.every((v) => v.id !== step.targetVenueId))
      throw conflict("Unknown or repeated move intention.");
    if (
      resident.pursuits.filter(activePursuit).length >= DEVELOPMENT_MAX_PURSUITS ||
      resident.pursuits.some((p) => activePursuit(p) && p.kind === "move")
    )
      throw conflict("This resident already has an active move intention.");
    p = {
      id: step.pursuitId,
      kind: "move",
      status: "considering",
      sourceVenueId: residentHome(state, step.characterId),
      targetVenueId: step.targetVenueId,
      privateZoneId: step.privateZoneId ?? "",
      reason: step.reason,
      startedAt: step.at,
      updatedAt: step.at,
      consents: {},
    };
    if (Date.parse(step.at) < Date.parse(input.housingAvailableAt[p.targetVenueId] ?? input.through))
      throw conflict("The home was not established as available at that time.");
    assertMove(state, step.characterId, p);
    resident.pursuits = [
      ...resident.pursuits.filter(activePursuit),
      ...resident.pursuits.filter((p) => !activePursuit(p)).slice(-20),
      p,
    ];
  } else {
    if (!p || !activePursuit(p) || p.status === "arranged")
      throw conflict("The intention is no longer open to this decision.");
    if (Date.parse(step.at) < Date.parse(p.updatedAt)) throw conflict("A decision precedes its supporting intention.");
    if (step.kind === "consent") {
      const target = state.venues.find((v) => v.id === p!.targetVenueId);
      if (
        !target ||
        !step.actorId ||
        step.actorId === "player" ||
        !step.decision ||
        !moveConsentingActors(target, p.privateZoneId, step.characterId).includes(step.actorId)
      )
        throw conflict("This review cannot supply that person's consent.");
      if (!state.villagers.some((v) => v.characterId === step.actorId))
        throw conflict("The consenting resident is absent.");
      p.consents[step.actorId] = { decision: step.decision, at: step.at, source: step.id };
      p.status = step.decision === "agree" ? "considering" : "stalled";
      const name = state.villagers.find((v) => v.characterId === step.actorId)!.cardSnapshot.name;
      const text = `${name} ${step.decision === "agree" ? "agreed to" : step.decision === "refuse" ? "refused" : "set an unresolved condition for"} the proposed move to ${target.name}.`;
      remember(state, p, step.characterId, `development:${p.id}:${step.id}`, step.at, text, [
        step.characterId,
        step.actorId,
      ]);
    } else if (step.kind === "wait") p.status = "stalled";
    else if (step.kind === "end") p.status = "ended";
    else if (step.kind === "move") {
      if (Date.parse(step.at) < Date.parse(input.housingAvailableAt[p.targetVenueId] ?? input.through))
        throw conflict("The home was not established as available at that time.");
      const target = assertMove(state, step.characterId, p);
      if (
        !moveConsentingActors(target, p.privateZoneId, step.characterId).every(
          (id) => p!.consents[id]?.decision === "agree",
        )
      )
        throw conflict("A mover, household member or property controller has not agreed.");
      let approvedAt = step.at;
      const completion = Date.parse(approvedAt) + DEVELOPMENT_MOVE_MS;
      const observed = [step.characterId, "venue:" + p.sourceVenueId, "venue:" + p.targetVenueId].some(
        (id) => Date.parse(d.observations[id]?.at ?? "") >= completion,
      );
      if (completion <= Date.parse(appliedAt) && observed)
        approvedAt = iso(Date.parse(appliedAt) - DEVELOPMENT_MOVE_MS);
      const move = {
        characterId: step.characterId,
        venueId: p.sourceVenueId,
        status: "moving" as const,
        proposedVenueId: p.targetVenueId,
        proposedPrivateZoneId: p.privateZoneId,
        requestedAt: step.at,
        requestedBy: "villager" as const,
        villagerDecision: "approved" as const,
        approvedAt,
        completesAt: iso(Date.parse(approvedAt) + DEVELOPMENT_MOVE_MS),
      };
      state.residences = state.residences.filter((r) => r.characterId !== step.characterId).concat(move);
      p.status = "arranged";
      if (Date.parse(move.completesAt) <= Date.parse(appliedAt)) {
        completeResidenceMove(state, step.characterId, false, new Date(appliedAt));
        finishDevelopmentMove(state, step.characterId, appliedAt);
      }
    }
    if (step.kind === "wait" || step.kind === "end") p.reason = step.reason;
    if (p.status !== "completed") p.updatedAt = step.at;
  }
  log(d, {
    id: step.id,
    at: appliedAt,
    effectiveAt: step.at,
    actorId: step.characterId,
    outcome: step.kind,
    reason: step.reason,
  });
}
/** One atomic batch, with explicit rejected steps and no paid repair or invented side effects. */
export function applyDevelopmentReview(
  state: VillageState,
  input: DevelopmentReview,
  proposal: DevelopmentProposal,
  appliedAt: string,
): void {
  if (!developmentReviewValid(state, input))
    throw conflict("Resident development inputs changed; the saved review cannot apply.");
  const ids = new Set(proposal.reviews.map((r) => r.characterId));
  if (
    ids.size !== proposal.reviews.length ||
    ids.size !== input.residentIds.length ||
    input.residentIds.some((id) => !ids.has(id))
  )
    throw badRequest("The review must account for every offered resident exactly once.");
  const accepted = new Set<string>(),
    seen = new Set<string>(),
    terminal = new Map<string, string>();
  let last = 0;
  for (const step of proposal.steps) {
    const resident = input.residents[step.characterId];
    const at = Date.parse(step.at);
    let reason = "";
    if (seen.has(step.id)) reason = "Repeated decision ID.";
    else if (
      !resident ||
      at < Math.max(Date.parse(resident.reviewedThrough), Date.parse(resident.nextReviewAt)) ||
      at > Date.parse(input.through) ||
      at < last
    )
      reason = "Decision outside its eligible chronological interval.";
    else if (terminal.has(step.characterId)) reason = "Moving is the terminal milestone of this prototype batch.";
    else if (step.dependsOn.some((id) => !accepted.has(id))) reason = "A supporting decision was not accepted.";
    seen.add(step.id);
    last = Math.max(last, at);
    if (!reason) {
      // Validate on a copy so an individual rejection cannot retain partial occupancy or consent.
      const candidate = structuredClone(state);
      try {
        applyStep(
          candidate,
          input,
          {
            ...step,
            id:
              "decision:" +
              backgroundRevision([
                input.generation,
                step.characterId,
                input.residents[step.characterId]!.revision,
                step.id,
              ]),
          },
          appliedAt,
        );
        Object.assign(state, candidate);
        accepted.add(step.id);
        if (step.kind === "move") terminal.set(step.characterId, step.pursuitId);
      } catch (error) {
        reason = error instanceof Error ? error.message : "Invalid development decision.";
      }
    }
    if (reason)
      log(state.development!, {
        id: "rejected:" + backgroundRevision([input.generation, step.characterId, resident?.revision, step.id]),
        at: appliedAt,
        effectiveAt: step.at,
        actorId: step.characterId,
        outcome: "Rejected",
        reason,
      });
  }
  for (const review of proposal.reviews) {
    const r = state.development!.residents[review.characterId]!;
    const completed = r.pursuits.find((p) => p.id === terminal.get(review.characterId) && p.status === "completed");
    const boundedThrough =
      proposal.steps.length === 6 && last > 0 ? iso(Math.min(last, Date.parse(input.through))) : input.through;
    const through = completed ? completed.updatedAt : boundedThrough;
    r.revision++;
    r.reviewedThrough = through;
    r.nextReviewAt = iso(Date.parse(through) + review.nextReviewHours * DEVELOPMENT_HOUR_MS);
    r.reason = review.reason;
    log(state.development!, {
      id:
        "review:" +
        backgroundRevision([input.generation, review.characterId, input.residents[review.characterId]!.revision]),
      at: appliedAt,
      effectiveAt: input.through,
      actorId: review.characterId,
      outcome: "Reviewed",
      reason: review.reason,
    });
  }
}
export { knownDevelopment } from "./development-knowledge.js";
