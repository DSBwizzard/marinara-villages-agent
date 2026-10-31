import type { VenueScene } from "../models/scene-model.js";
import type { VillageState, VillageVenue, VillageWish } from "../models/world.js";
import { replaySceneRelationships, coerceRelationshipState } from "./relationship-rules.js";
import { mergeNarrativeAfter } from "./narrative-development.js";
import { extendSceneNarrative } from "./scene-narrative-effects.js";
import { sceneLayoutVenue } from "./scene-layout.js";
import { contactNeighbors, contactPosition } from "./venue-contact.js";
import { physicalVenueEvents } from "./venue-scene-state.js";
import { legacyZoneId, resolveVenueZone, venueZones } from "./venue-zones.js";
import { reserveMemoryScene, sceneMemories } from "./village-memories.js";
import { cloneWorldContext } from "./world-context-copy.js";
import { blockWishHistory, immutableSocialWishes, wishHistoryLoaded } from "./social-wishes.js";

/** Current writer context, never evidence or a public attendance/room disclosure. */
export function sceneLocationContext(scene: VenueScene, venue: VillageVenue, actorIds: readonly string[]) {
  const zones = venueZones(sceneLayoutVenue(venue, scene));
  const origin = scene.zoneId ?? legacyZoneId(venue, scene.area, scene.spaceClass, scene.privateOwnerId);
  const adjacent = contactNeighbors(venue, origin, scene);
  const knownZone = (id: string) => {
    const zone = zones.find((row) => row.id === id);
    return zone && (id === origin || zone.seen) ? { id: zone.id, name: zone.name, kind: zone.kind } : undefined;
  };
  return {
    venue: scene.placeName,
    player: { zone: knownZone(origin) ?? { id: origin } },
    residents: [...new Set(actorIds)]
      .filter((id) => !scene.departedIds?.includes(id))
      .map((characterId) => {
        const position = contactPosition(scene, characterId) || (scene.activeIds.includes(characterId) ? origin : "");
        return {
          characterId,
          name: scene.participants.find((row) => row.characterId === characterId)?.name ?? characterId,
          location: !position
            ? "unrecorded"
            : position === origin
              ? "with player"
              : adjacent.includes(position)
                ? "adjacent Zone, apart from player"
                : "offstage, apart from player",
          ...(knownZone(position) ? { zone: knownZone(position) } : {}),
        };
      }),
  };
}

// Source facts consumed by Scene writing/meaning, never a replacement world.
// Settings, operational clocks and world-write receipts stay outside this copy.
// Captured access governs Scene participation; live authority still protects world writes.
export const sceneContinuityFields = [
  "name",
  "setting",
  "worldName",
  "worldFacts",
  "narrative",
  "foundedAt",
  "socialContractVersion",
  "seed",
  "timeZone",
  "playerName",
  "playerDescription",
  "playerPersonaId",
  "playerPersonaName",
  "playerPersonaIdentity",
  "playerBackground",
  "villagers",
  "venues",
  "residences",
  "relationshipContext",
  "venueEvents",
  "projects",
  "opening",
  "promptKnowledge",
] as const satisfies readonly (keyof VillageState)[];

export type SceneContinuity = {
  version: 3;
  seed: string;
  setupAt: string;
  capturedAt: string;
  receiptIds: string[];
  facts: Pick<VillageState, (typeof sceneContinuityFields)[number]>;
};
/** Captured relationship history is immutable; copying other facts must not duplicate it. */
export function cloneSceneFacts(facts: SceneContinuity["facts"]): SceneContinuity["facts"] {
  const copied = cloneWorldContext(facts);
  for (const [index, row] of copied.villagers.entries())
    row.wishes = immutableSocialWishes(facts.villagers[index].wishes);
  return copied;
}

/** Exact after-values retained atomically with an accepted effect. Server-only. */
export type SceneEffectFacts = {
  standingPermissions?: import("../models/relationship-types.js").RelationshipReview["permissions"];
  /** Missing value is unloaded; null is an exact deletion after-image. */
  wish?: { actorId: string; wishId: string; value?: VillageWish | null };
};

export function captureSceneWishEffect(state: VillageState, actorId: string, wishId: string): SceneEffectFacts {
  const wish = state.villagers.find((row) => row.characterId === actorId)?.wishes.find((row) => row.id === wishId);
  return {
    wish: {
      actorId,
      wishId,
      value: wish ? immutableSocialWishes([wish])[0] : null,
    },
  };
}

/** Transcript order, including delayed completion, chooses one final after-image per Wish. */
export function sceneWishEffectIds(current: VillageState, scene: VenueScene): string[] {
  const baseline = new Set(scene.continuity?.receiptIds),
    receipts = new Map<string, string[]>(),
    latest = new Map<string, string>();
  for (const receipt of Object.values(current.exchangeReceipts)) {
    if (
      receipt.sceneId !== scene.id ||
      receipt.status !== "applied" ||
      baseline.has(receipt.id) ||
      !receipt.sceneFacts?.wish
    )
      continue;
    const ids = receipts.get(receipt.submissionId) ?? [];
    ids.push(receipt.id);
    receipts.set(receipt.submissionId, ids);
  }
  for (const turn of scene.submissions)
    for (const id of receipts.get(turn.id) ?? []) {
      const wish = current.exchangeReceipts[id].sceneFacts!.wish!;
      const key = JSON.stringify([wish.actorId, wish.wishId]);
      latest.set(key, id);
    }
  return [...latest.values()];
}

/** Narrator continuity never grants resident knowledge or supplies save evidence. */
export function visibleSceneContinuity(scene: VenueScene): string {
  const lines = scene.lines.filter((line) => line.kind === "narration" && !line.contactHidden && !line.contactReport);
  const recent: string[] = [];
  let size = 0;
  for (const line of lines.slice(-8).reverse()) {
    if (size + line.content.length > 6000) break;
    recent.unshift(line.content);
    size += line.content.length;
  }
  return recent.length
    ? "Player-visible narration continuity (narrator only; not resident knowledge or citable evidence): " +
        JSON.stringify(recent) +
        " Continue after these events. Keep established appearance and completed actions consistent; do not reopen an already opened door or introduce the same outfit again. Only an explicit new event changes them. Residents still know only their individually witnessed history."
    : "";
}

export function captureSceneContinuity(state: VillageState, scene: VenueScene, now: number): SceneContinuity {
  const capturedAt = new Date(scene.sceneAttendance?.capturedAt || scene.startedAt || now).toISOString();
  reserveMemoryScene(state, scene.id, capturedAt);
  const facts = cloneSceneFacts(
    Object.fromEntries(sceneContinuityFields.map((key) => [key, state[key]])) as SceneContinuity["facts"],
  );
  return {
    version: 3,
    seed: state.seed,
    setupAt: state.setupAt,
    capturedAt,
    receiptIds: physicalVenueEvents(state)
      .map((row) => row.id)
      .concat(Object.keys(state.exchangeReceipts)),
    facts,
  };
}

/** Historical presentation plus this Scene's committed evidence; never use for a world write. */
export function sceneContinuityView(current: VillageState, scene: VenueScene, includeMemories = true): VillageState {
  const context = scene.continuity;
  if (!context || context.seed !== current.seed || scene.villageSeed !== current.seed) return current;
  const view = {
    ...current,
    ...cloneSceneFacts(context.facts),
    relationshipContext: context.facts.relationshipContext
      ? coerceRelationshipState(context.seed, context.facts.relationshipContext)
      : undefined,
    narrative: structuredClone(context.facts.narrative),
    ...(includeMemories
      ? {
          memories: current.memoryScenes[scene.id]
            ? sceneMemories(current, scene.id)
            : scene.status === "closed"
              ? { format: 1 as const, revision: 0, records: [] }
              : sceneMemories(current, scene.id),
        }
      : {}),
  };
  // Artwork is a presentation setting, not a later fictional event.
  for (const resident of view.villagers) {
    const live = current.villagers.find((row) => row.characterId === resident.characterId);
    if (live) {
      resident.sprite = structuredClone(live.sprite);
      resident.spriteManager = structuredClone(live.spriteManager);
    }
  }
  // Opening progression is fiction too; only this Scene's saved proofs can advance it.
  if (view.opening && current.opening?.id === view.opening.id) {
    for (const proof of current.opening.reveals)
      if (proof.sceneId === scene.id && !view.opening.reveals.some((row) => row.residentId === proof.residentId))
        view.opening.reveals.push(structuredClone(proof));
    if (current.opening.firstUseEvidence?.sceneId === scene.id) {
      view.opening.firstUseEvidence = structuredClone(current.opening.firstUseEvidence);
      view.opening.stage = "complete";
      view.opening.outcome = "First use";
    }
  }
  const baselineReceipts = new Set(context.receiptIds);
  for (const id of sceneWishEffectIds(current, scene)) {
    const { actorId, wishId, value } = current.exchangeReceipts[id].sceneFacts!.wish!;
    const resident = view.villagers.find((row) => row.characterId === actorId);
    if (!resident) continue;
    if (value === undefined) blockWishHistory(resident);
    else if (wishHistoryLoaded(resident)) {
      const wishes = [...resident.wishes],
        index = wishes.findIndex((wish) => wish.id === wishId);
      if (!value) {
        if (index >= 0) wishes.splice(index, 1);
      } else if (index >= 0) wishes[index] = value;
      else wishes.push(value);
      resident.wishes = immutableSocialWishes(wishes);
    }
  }

  if (view.relationshipContext && current.relationshipContext) {
    const ledger = current.relationshipContext.intentionReceipts;
    const byTurn = new Map<string, Array<[string, (typeof ledger)[string]]>>();
    for (const [id, receipt] of Object.entries(ledger)) {
      if (receipt.sceneId !== scene.id || !receipt.submissionId) continue;
      const entries = byTurn.get(receipt.submissionId) ?? [];
      entries.push([id, receipt]);
      byTurn.set(receipt.submissionId, entries);
    }
    for (const turn of scene.submissions)
      for (const [id, receipt] of byTurn.get(turn.id) ?? []) {
        if (view.relationshipContext.intentionReceipts[id]) continue;
        view.relationshipContext.intentions[receipt.actorId] = structuredClone(receipt.sceneAfter);
        view.relationshipContext.intentionRevisions[receipt.actorId] = receipt.sceneRevision;
        view.relationshipContext.intentionReceipts[id] = structuredClone(receipt);
      }
    replaySceneRelationships(view.relationshipContext, current.relationshipContext, scene);
  }

  // Replay only already-committed physical receipts, in transcript order.
  // This edits a disposable presentation copy, never writes live state.
  const physical = new Map(
    physicalVenueEvents(current)
      .filter((row) => row.actionReceipt?.happened && !baselineReceipts.has(row.id))
      .map((row) => [row.id, row]),
  );
  for (const turn of scene.submissions) {
    const event = physical.get(`venue-chat:${scene.id}:${turn.id}`);
    extendSceneNarrative(view, current, scene, turn);
    const change = event?.actionReceipt;
    const venue = view.venues.find((row) => row.id === scene.placeId);
    if (!change || !venue) continue;
    venue.zones ??= structuredClone(venueZones(venue));
    const zoneId =
      event.zoneId ??
      turn.zoneIdAtTurn ??
      scene.zoneId ??
      legacyZoneId(
        venue,
        turn.areaAtTurn ?? scene.area,
        scene.spaceClass,
        turn.privateOwnerIdAtTurn ?? scene.privateOwnerId,
      );
    const zone = resolveVenueZone(venue, zoneId);
    if (!zone) continue;
    // Exact committed after-values extend this captured Scene only; live time and preconditions do not apply.
    zone.description = change.after.description;
    zone.state = structuredClone(change.after.state);
    if (view.narrative)
      for (const receipt of current.narrative?.receipts ?? []) {
        if (
          receipt.sourceId === scene.id &&
          receipt.source === "action" &&
          receipt.physical.some(
            (after) =>
              after.venueId === venue.id &&
              after.zoneId === zone.id &&
              after.state.revision === change.after.state.revision,
          )
        )
          mergeNarrativeAfter(view.narrative, receipt.after);
      }
    view.venueEvents = [event, ...view.venueEvents.filter((row) => row.id !== event.id)];
  }
  return view;
}
