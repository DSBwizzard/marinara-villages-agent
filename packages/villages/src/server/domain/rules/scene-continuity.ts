import type { VenueScene } from "../models/scene-model.js";
import type {
  VillageState,
  VillageWish,
  VillageChronicleEntry,
  VillageRecollection,
  VillageVenueSpace,
} from "../models/world.js";
import type { KnownWish } from "./wish-journal.js";
import { physicalVenueEvents } from "./venue-scene-state.js";
import { venueZones, resolveVenueZone, legacyZoneId } from "./venue-zones.js";
import { sceneWishProtected } from "./scene-wish-protection.js";
import { neutralRelationship, relationshipKey } from "./relationship-rules.js";
import { relationshipScore, relationshipThreshold } from "./relationship-policy.js";
import { wishExpired } from "./wish-definition.js";

// Source facts consumed by Scene writing/meaning, never a replacement world.
// Settings, operational clocks, receipts and live authority stay outside this copy.
export const sceneContinuityFields = [
  "name",
  "setting",
  "worldName",
  "worldFacts",
  "foundedAt",
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
  "chronicle",
  "recollections",
  "relationshipContext",
  "wishKnowledge",
  "venueEvents",
  "projects",
  "promptKnowledge",
] as const satisfies readonly (keyof VillageState)[];

export type SceneContinuity = {
  version: 1;
  seed: string;
  capturedAt: string;
  receiptIds: string[];
  facts: Pick<VillageState, (typeof sceneContinuityFields)[number]>;
};

/** Exact after-values retained atomically with an accepted effect. Server-only. */
export type SceneEffectFacts = {
  memories?: VillageChronicleEntry[];
  recollections?: VillageRecollection[];
  wish?: { actorId: string; wishId: string; value: VillageWish | null; knowledge: KnownWish | null };
};

export function captureSceneWishEffect(state: VillageState, actorId: string, wishId: string): SceneEffectFacts {
  return structuredClone({
    wish: {
      actorId,
      wishId,
      value:
        state.villagers.find((row) => row.characterId === actorId)?.agenda?.wishes.find((row) => row.id === wishId) ??
        null,
      knowledge: state.wishKnowledge[actorId]?.find((row) => row.wishId === wishId) ?? null,
    },
  });
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
  const facts = structuredClone(
    Object.fromEntries(sceneContinuityFields.map((key) => [key, state[key]])),
  ) as SceneContinuity["facts"];
  facts.recollections = facts.recollections.filter((row) => Date.parse(row.expiresAt) > now);
  for (const resident of facts.villagers)
    if (resident.agenda)
      resident.agenda.wishes = resident.agenda.wishes.filter(
        (wish) => !wishExpired(wish, now) || sceneWishProtected(state, resident.characterId, wish, scene.id),
      );
  return {
    version: 1,
    seed: state.seed,
    capturedAt: scene.sceneAttendance?.capturedAt || scene.startedAt,
    receiptIds: physicalVenueEvents(state)
      .map((row) => row.id)
      .concat(Object.keys(state.exchangeReceipts)),
    facts,
  };
}

function mergeRows<T extends { id: string }>(base: T[], updates: T[]): T[] {
  const changed = new Map(updates.map((row) => [row.id, structuredClone(row)]));
  return [
    ...updates.filter((row) => !base.some((old) => old.id === row.id)),
    ...base.map((row) => changed.get(row.id) ?? row),
  ];
}

/** Historical presentation plus this Scene's committed evidence; never use for a world write. */
export function sceneContinuityView(current: VillageState, scene: VenueScene): VillageState {
  const context = scene.continuity;
  if (!context || context.seed !== current.seed || scene.villageSeed !== current.seed) return current;
  const view = { ...current, ...structuredClone(context.facts) };
  // Artwork is a presentation setting, not a later fictional event.
  for (const resident of view.villagers) {
    const live = current.villagers.find((row) => row.characterId === resident.characterId);
    if (live) {
      resident.sprite = structuredClone(live.sprite);
      resident.spriteManager = structuredClone(live.spriteManager);
    }
  }
  const baselineReceipts = new Set(context.receiptIds);
  // Transcript order is stable across retries and delayed effect completion.
  for (const turn of scene.submissions) {
    for (const receipt of Object.values(current.exchangeReceipts)) {
      if (
        receipt.sceneId !== scene.id ||
        receipt.submissionId !== turn.id ||
        receipt.status !== "applied" ||
        baselineReceipts.has(receipt.id)
      )
        continue;
      const facts = receipt.sceneFacts;
      if (!facts) continue;
      if (facts.memories) view.chronicle = mergeRows(view.chronicle, facts.memories);
      if (facts.recollections) view.recollections = mergeRows(view.recollections, facts.recollections);
      if (facts.wish) {
        const { actorId, wishId, value, knowledge } = structuredClone(facts.wish);
        const resident = view.villagers.find((row) => row.characterId === actorId);
        if (resident?.agenda)
          resident.agenda.wishes = resident.agenda.wishes.flatMap((wish) =>
            wish.id === wishId ? (value ? [value] : []) : [wish],
          );
        const rows = view.wishKnowledge[actorId] ?? [];
        view.wishKnowledge[actorId] = [
          ...rows.filter((row) => row.wishId !== wishId),
          ...(knowledge ? [knowledge] : []),
        ];
      }
    }
  }

  if (view.relationshipContext && current.relationshipContext) {
    const baseReceipts = new Set(Object.keys(view.relationshipContext.receipts));
    for (const receipt of Object.values(current.relationshipContext.receipts)) {
      if (receipt.sceneId !== scene.id || baseReceipts.has(receipt.id)) continue;
      const key = relationshipKey(receipt.fromId, receipt.toId);
      const edge = (view.relationshipContext.edges[key] ??= neutralRelationship(receipt.fromId, receipt.toId));
      edge[receipt.dimension] = relationshipScore(edge[receipt.dimension] + receipt.after - receipt.before);
      edge.familiarity = Math.max(1, edge.familiarity);
      edge.friend = relationshipThreshold(edge.warmth, edge.trust, edge.friend, "friend");
      edge.close = relationshipThreshold(edge.warmth, edge.trust, edge.close, "close");
      view.relationshipContext.receipts[receipt.id] = { ...receipt, at: context.capturedAt };
    }
  }

  // Replay only already-committed physical receipts, in transcript order.
  // This edits a disposable presentation copy, never consumes live stock.
  const physical = new Map(
    physicalVenueEvents(current)
      .filter((row) => row.actionReceipt?.happened && !baselineReceipts.has(row.id))
      .map((row) => [row.id, row]),
  );
  for (const turn of scene.submissions) {
    const event = physical.get(`venue-chat:${scene.id}:${turn.id}`);
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
    const state = zone.state;
    // Presentation of an already committed receipt: no preconditions, stock,
    // capacity checks or authority writes. Unrelated captured facts stay intact.
    if (change.conditionBefore !== undefined) state.condition = change.conditionAfter ?? "";
    if (change.featureId)
      state.features = change.featureText
        ? [
            ...state.features.filter((row) => row.id !== change.featureId),
            {
              id: change.featureId,
              text: change.featureText,
              locked: state.features.find((row) => row.id === change.featureId)?.locked ?? false,
              sourceCharacterId: "",
              updatedAt: context.capturedAt,
            },
          ]
        : state.features.filter((row) => row.id !== change.featureId);
    if (change.publicFactBefore)
      state.publicFacts = [
        ...state.publicFacts.filter((row) => row !== change.publicFactBefore),
        ...(change.publicFactAfter ? [change.publicFactAfter] : []),
      ];
    if (change.resolveTraceId) state.traces = state.traces.filter((row) => row.id !== change.resolveTraceId);
    if (change.removeItem) state.items = state.items.filter((row) => row !== change.removeItem);
    if (change.addItem && !state.items.includes(change.addItem)) state.items.push(change.addItem);
    const trace = (
      id: string,
      kind: string,
      text: string,
      recipientId = "",
    ): VillageVenueSpace["state"]["traces"][number] => ({
      id,
      kind,
      text,
      recipientId,
      createdAt: context.capturedAt,
      expiresAt: new Date(Date.parse(context.capturedAt) + 3 * 86400000).toISOString(),
    });
    if (change.sceneNote)
      state.traces = [
        ...state.traces.filter((row) => row.kind !== "scene-note"),
        ...state.traces.filter((row) => row.kind === "scene-note").slice(-3),
        trace(`scene-note:${turn.id}`, "scene-note", change.sceneNote),
      ];
    if (change.traceKind && change.traceText)
      state.traces.push(trace(`trace:${turn.id}`, change.traceKind, change.traceText, change.recipientId));
    view.venueEvents = [event, ...view.venueEvents.filter((row) => row.id !== event.id)];
  }
  return view;
}
