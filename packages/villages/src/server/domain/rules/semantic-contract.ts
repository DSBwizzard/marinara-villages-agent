import { createHash } from "node:crypto";
import { asRecord } from "./coerce.js";
import type { VenueScene, VenueReplyLine } from "../models/scene-model.js";
import type { VillageState } from "../models/world.js";
import { venueZones, zoneControllerIds } from "./venue-zones.js";
import { zoneEventHearingContext } from "./zone-events.js";
import { sceneLayoutVenue } from "./scene-layout.js";
import { memoryVersion } from "./live-exchange.js";
import { projectSpeechContexts, projectSpeechPrompt } from "./project-interpretation.js";
import { badGateway } from "./errors.js";
import { selectPromptMemories } from "./memory-selection.js";
import { wishCheckKnowledge } from "./wish-journal.js";
import { accessManagementPrompt } from "./access-speech.js";

export { readSemanticWishCriteria } from "./wish-criteria.js";

export const SEMANTIC_VERSION = 2;
export const SEMANTIC_OPERATION_BUDGET = {
  version: 1,
  requests: 12,
  inputTokens: 144000,
  outputTokens: 32768,
} as const;
export const semanticNarrationCore = (raw: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(raw).filter(([key]) => ["segments", "lines", "heardPlayerBy", "playerSpeechCapture"].includes(key)),
  );
export const semanticHash = (value: unknown): string =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");

/** Shared context is server-only. Actor-scoped audiences remain explicit on every fact. */
export function semanticContext(scene: VenueScene, state: VillageState, query: string, compact = false) {
  const actors = [...new Set([...scene.activeIds, ...(scene.contactGeneration?.remoteIds ?? [])])];
  const venue = state.venues.find((row) => row.id === scene.placeId);
  const layout = venue && sceneLayoutVenue(venue, scene);
  const memories = selectPromptMemories(state.chronicle, actors, query, 1800);
  const audience = (row: VillageState["chronicle"][number]) =>
    row.scope === "village" ? actors : (row.knownByCharacterIds ?? row.actors.map((actor) => actor.id));
  const available = state.chronicle.filter(
    (row) => row.kind !== "tick" && !row.supersededBy && audience(row).some((id) => actors.includes(id)),
  );
  const catalog = available.slice(-64);
  return {
    worldSeed: state.seed,
    setting: state.setting,
    loreSelection: {
      bookIds: state.selectedLorebookIds,
      tokenBudget: compact ? Math.min(state.loreTokenBudget ?? 1200, 1200) : state.loreTokenBudget,
    },
    worldFacts: state.worldFacts,
    sceneId: scene.id,
    revision: scene.sceneRevision,
    zoneId: scene.zoneId,
    actors: state.villagers
      .filter((row) => actors.includes(row.characterId))
      .map((row) => ({
        id: row.characterId,
        name: row.cardSnapshot.name,
        character: compact
          ? {
              description: row.cardSnapshot.description,
              personality: row.cardSnapshot.personality,
              backstory: row.cardSnapshot.backstory,
            }
          : row.cardSnapshot,
        founding: row.foundingContext,
        wishes: (row.agenda?.wishes ?? []).map((wish) => ({
          ...wish,
          knowledge: wishCheckKnowledge(state, row.characterId, wish.id),
        })),
      })),
    zones: layout
      ? venueZones(layout)
          .filter(
            (zone) =>
              zone.id === scene.zoneId ||
              zone.seen ||
              scene.semanticIntent?.timeline.some((step) => step.zoneId === zone.id),
          )
          .map((zone) => ({
            id: zone.id,
            name: zone.name,
            kind: zone.kind,
            connectedTo: zone.connectedTo,
            ownerId: zone.ownerId,
            access: zone.access,
            ...(zone.id === scene.zoneId || scene.semanticIntent?.timeline.some((step) => step.zoneId === zone.id)
              ? { state: zone.state }
              : {}),
          }))
      : [],
    access: venue?.access,
    accessManagement: accessManagementPrompt(state, actors),
    referenceActors: state.villagers.map(({ characterId, cardSnapshot }) => ({
      id: characterId,
      name: cardSnapshot.name,
    })),
    memories: memories.map((row) => ({
      id: row.id,
      text: row.text,
      audience: audience(row),
      version: memoryVersion(row),
    })),
    retrieval: {
      complete: catalog.length === available.length,
      totalAvailable: available.length,
      // Hints locate sources only; incomplete snippets cannot support a verdict.
      catalog: catalog.map((row) => ({
        id: row.id,
        version: memoryVersion(row),
        audience: audience(row),
        hint: row.text.slice(0, 160),
      })),
    },
    history: scene.lines
      .filter((row) => !row.contactReport && actors.some((id) => row.heardBy.includes(id)))
      .slice(-18),
    reach: layout ? zoneEventHearingContext(scene, layout) : "",
    accessScopes: venue
      ? venueZones(venue).map((zone) => ({
          id: zone.id,
          ownerId: zone.ownerId,
          controllerIds: zoneControllerIds(venue, zone),
        }))
      : [],
    projects: projectSpeechPrompt(state, projectSpeechContexts(state, actors, "", query, scene.placeId)),
    requests: {
      venues: state.venues.map((row) => ({
        id: row.id,
        name: row.name,
        classes: row.classes,
        occupancy: row.occupancy,
        constructionStatus: row.constructionStatus,
      })),
      residences: state.residences.filter((row) => row.status === "pending"),
      edits: venue?.editProposals?.filter((row) => !row.declined),
    },
  };
}

/** System chooses meaning; code binds exact immutable source bytes and known event shapes. */
export function semanticImmediate(value: unknown, lines: readonly VenueReplyLine[]): Record<string, unknown> {
  const raw = asRecord(value);
  if (!Array.isArray(raw.moves) || !Array.isArray(raw.departures) || !Array.isArray(raw.contactEnd))
    throw badGateway("System event interpretation is incomplete.");
  const source = (value: unknown, narration = false) => {
    const row = asRecord(value);
    const index = narration ? row.segment : row.source;
    const line = Number.isSafeInteger(index) && Number(index) >= 0 ? lines[Number(index)] : undefined;
    if (!line || (narration ? line.kind !== "narration" : line.kind === "narration" || line.speakerId === "player"))
      throw badGateway("System event has an invalid source.");
    return { ...row, speakerId: line.speakerId, quote: line.content };
  };
  const result: Record<string, unknown> = {
    contactMoves: raw.moves.map((row) => source(row, true)),
    departures: raw.departures.map((row) => source(row)),
    contactEnd: raw.contactEnd.map((row) => source(row)),
    semanticPlayerMoves: raw.playerMoves ?? [],
  };
  for (const key of [
    "residenceRequest",
    "residenceDecision",
    "upgradeRequest",
    "venueRequest",
    "editApproval",
    "sceneEnded",
  ])
    if (raw[key] !== undefined && raw[key] !== null) result[key] = source(raw[key]);
  if (raw.moves.length > 16 || raw.departures.length > 16 || raw.contactEnd.length > 16)
    throw badGateway("System event limit exceeded.");
  return result;
}

export function semanticEvidence(lines: readonly VenueReplyLine[]) {
  return lines.map((line, index) => ({
    id: `draft:${index}`,
    name: line.speakerId,
    speakerId: line.role === "user" ? "player" : line.speakerId,
    kind: line.kind,
    content: line.content,
    delivery: line.delivery,
    targetId: line.targetId,
    speechSource: line.speechSource,
    soundOnly: line.soundOnly,
    heardBy: line.heardBy,
    playerHeard: !line.contactHidden && (line.kind !== "whisper" || line.targetId === "player"),
    current: true,
  }));
}

/** Missing sections are failures, not silently successful empty updates. */
export function readSemanticEffects(raw: unknown, hash: string): Record<string, unknown> {
  const row = asRecord(raw);
  if (row.sourceHash !== hash) throw new Error("System interpretation cited a different exchange.");
  const result: Record<string, unknown> = {};
  for (const key of ["memoryChanges", "wishChanges", "projectSpeech"])
    if (Array.isArray(row[key]) && row[key].length <= 16) result[key] = row[key];
  const social = asRecord(row.relationshipChanges);
  if (["changes", "permissions", "disclosures"].every((key) => Array.isArray(social[key]) && social[key].length <= 16))
    result.relationshipChanges = social;
  const clean = (value: unknown): unknown =>
    Array.isArray(value)
      ? value.map(clean)
      : value && typeof value === "object"
        ? Object.fromEntries(
            Object.entries(value)
              .filter(
                ([key]) =>
                  ![
                    "systemVerification",
                    "systemVerificationFailure",
                    "semanticVersion",
                    "semanticProvenance",
                    "contextual",
                  ].includes(key),
              )
              .map(([key, item]) => [key, clean(item)]),
          )
        : value;
  return clean(result) as Record<string, unknown>;
}

/** Stable effect identity excludes model text/order; a reworded retry cannot re-award evidence. */
export function semanticUnit(domain: string, value: unknown): string {
  const row = asRecord(value);
  return semanticHash([
    domain,
    row.kind,
    row.category,
    row.fromId,
    row.toId,
    row.dimension,
    Array.isArray(row.memoryIds) ? [...row.memoryIds].sort() : row.memoryIds,
    Array.isArray(row.subjectCharacterIds) ? [...row.subjectCharacterIds].sort() : row.subjectCharacterIds,
    Array.isArray(row.knownByCharacterIds) ? [...row.knownByCharacterIds].sort() : row.knownByCharacterIds,
    [
      ...new Set(
        (Array.isArray(row.evidence) ? row.evidence : Array.isArray(row.lineIds) ? row.lineIds : []) as unknown[],
      ),
    ].sort(),
  ]);
}
