import { venueCheckpoint, venueOperationSignal, assertVenueOwnership } from "./venue-coordinator.js";
import { venueInZone, resolveVenueZone, zoneClosed } from "./venue-zones.js";
import type { CapabilityLanguageModelMessage } from "@marinara-engine/shared";
import { villagesConnectionIdFor } from "./connections.js";
import { badRequest, notFound } from "./errors.js";
import { completeWithRoom, villagesLanguageModels } from "./package-runtime.js";
import { boundText, MAX_HAPPENING_LENGTH, MAX_VENUE_NOTE_LENGTH, prependHappenings } from "./prompt-preset.js";
import type { VillageHappening, VillageVenue } from "./types.js";
import { extractJsonObject } from "./village-bootstrap.js";
import { mutateVillageState, readVillageState } from "./village-store.js";
import { deriveVillageMoment } from "./village-clock.js";
import { readPlayerIdentity, rollActiveAgendas } from "./village.js";
import { activeVenueSession, recordVenueAction } from "./venue-session.js";
import { venueInArea, venueResidentIds } from "./venue-model.js";

export const MAX_VENUE_ACTION_LENGTH = 500;

export type VenueActionResult = {
  happened: boolean;
  narration: string;
  addItem?: string;
  removeItem?: string;
  traceKind?: string;
  traceText?: string;
  recipientId?: string;
  transferTo?: string;
  resolveTraceId?: string;
};

/** A malformed or unsupported outcome cannot become evidence for a wish. */
export function readVenueActionResult(
  value: unknown,
  items: readonly string[] = [],
  traceIds: readonly string[] = [],
  recipientIds: readonly string[] = [],
): VenueActionResult {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { happened: false, narration: "Nothing changes here." };
  }
  const raw = value as Record<string, unknown>;
  const narration = boundText(raw.narration, MAX_HAPPENING_LENGTH);
  if (raw.happened !== true || !narration) {
    return { happened: false, narration: narration || "Nothing changes here." };
  }
  const addItem = boundText(raw.addItem, MAX_VENUE_NOTE_LENGTH);
  const removeItem = boundText(raw.removeItem, MAX_VENUE_NOTE_LENGTH);
  const traceKind =
    typeof raw.traceKind === "string" && /^[a-z][a-z0-9-]{0,39}$/u.test(raw.traceKind) ? raw.traceKind : "";
  const traceText = boundText(raw.traceText, MAX_VENUE_NOTE_LENGTH);
  const recipientId =
    typeof raw.recipientId === "string" && recipientIds.includes(raw.recipientId) ? raw.recipientId : "";
  const transferTo = typeof raw.transferTo === "string" && recipientIds.includes(raw.transferTo) ? raw.transferTo : "";
  if (raw.transferTo && (!transferTo || !removeItem))
    return { happened: false, narration: "An item transfer needs recorded inventory and a valid recipient." };
  const resolveTraceId =
    typeof raw.resolveTraceId === "string" && traceIds.includes(raw.resolveTraceId) ? raw.resolveTraceId : "";
  if ((raw.traceKind || raw.traceText) && (!traceKind || !traceText)) {
    return { happened: false, narration: "That ongoing change could not be recorded. Try again." };
  }
  if (traceKind === "note" && !recipientId) {
    return { happened: false, narration: "That note needs a villager who can find it." };
  }
  if (raw.resolveTraceId && !resolveTraceId) {
    return { happened: false, narration: "That ongoing change is no longer here." };
  }
  if (removeItem && !items.includes(removeItem)) {
    return { happened: false, narration: "That item is not here." };
  }
  if (addItem && !items.includes(addItem) && items.length >= 24 && !removeItem) {
    return { happened: false, narration: "There is no room for another item here." };
  }
  return {
    happened: true,
    narration,
    ...(addItem ? { addItem } : {}),
    ...(removeItem ? { removeItem } : {}),
    ...(transferTo ? { transferTo } : {}),
    ...(traceKind && traceText ? { traceKind, traceText, recipientId } : {}),
    ...(resolveTraceId ? { resolveTraceId } : {}),
  };
}

function actionMessages(
  place: VillageVenue,
  action: string,
  player: string,
  setting: string,
  people: string,
  residents: string,
): CapabilityLanguageModelMessage[] {
  return [
    {
      role: "system",
      content: [
        'You narrate one action by the player in a village place. Answer with JSON only: {"happened":true,"narration":"...","addItem":"","removeItem":"","transferTo":"","traceKind":"","traceText":"","recipientId":"","resolveTraceId":""}.',
        "Decide whether the described action can actually happen now. A plan, promise, unsupported claim of past work, or action requiring an absent person is not a completed deed: set happened to false.",
        "Ground the outcome in the place and its listed items. The player may use ordinary personal belongings, but do not invent rare items, new people, or hidden powers.",
        "The submitted action is the full extent of the player's choice. Do not invent their dialogue, a follow-up action or decision, consent, private thoughts, or feelings. Report only this attempted action and its grounded result.",
        `For happened=true, narrate only what actually happened, in one or two past-tense sentences. Name ${player} so the village knows who did it. For happened=false, explain plainly why it could not happen. Do not claim an item was consumed, moved, or created unless the action actually does so.`,
        "When the action physically adds an item, put its short name in addItem. When it removes an item, copy that item exactly from the listed furniture and items into removeItem. Otherwise use empty strings. Do not change a venue item for inspection or conversation.",
        'For an actual handoff of a listed item to a present resident, put that exact item in removeItem and the actual recipient ID in transferTo. For an actual pickup by the player, use transferTo:"player". Leave transferTo empty for consumption, destruction or other removal. recipientId belongs to notes and is not a transfer. A statement that delivery already happened is not a handoff. Never invent inventory or a recipient.',
        "An active trace is a small ongoing change that can be resolved later, such as a note, stain, open window, wet footprints, or dropped object. For a new trace use a short lowercase traceKind and descriptive traceText. A note needs the intended resident's ID in recipientId. To resolve an existing trace, copy its ID into resolveTraceId. Never alter a locked defining feature.",
        `Village setting: ${setting || "A small village."}`,
        `Place: ${place.name}. Classes: ${place.classes?.join(", ") || "other"}. Form: ${place.form || "unspecified"}.`,
        `People present: ${people || "none"}. Do not invent words or consent from them.`,
        `Village residents: ${residents || "none"}.`,
        `Condition: ${place.state.condition || "unspecified"}. Furniture and items: ${place.state.furniture.join(", ") || "none listed"}. Defining features: ${place.state.features?.map((item) => item.text).join("; ") || "none"}. Active traces: ${place.state.traces?.map((trace) => `${trace.id}: ${trace.text}`).join("; ") || "none"}. Public facts: ${place.state.publicFacts.join("; ") || "none"}.`,
      ].join("\n"),
    },
    { role: "user", content: `${player} tries to: ${action}` },
  ];
}

/** Record only a grounded, completed action. Happenings are evidence for the Wish judge. */
export async function actAtVenue(
  placeId: string,
  rawAction: string,
  submissionId: string,
  beforeRecord?: (result: VenueActionResult) => Promise<void>,
): Promise<VenueActionResult> {
  const action = rawAction.trim();
  if (!action || action.length > MAX_VENUE_ACTION_LENGTH) {
    throw badRequest(`Describe one action in 1 to ${MAX_VENUE_ACTION_LENGTH} characters.`);
  }
  await rollActiveAgendas(new Date());
  const village = await readVillageState();
  const prior = village.venueEvents.find((event) => event.actionReceipt?.submissionId === submissionId)?.actionReceipt;
  if (prior) {
    await recordVenueAction(placeId, action, prior, submissionId);
    return prior;
  }
  const storedPlace = village.venues.find((entry) => entry.id === placeId);
  if (!storedPlace) throw notFound("That place is not in this village.");
  if (storedPlace.constructionStatus === "worksite")
    throw badRequest("The builder's work order governs this site; roleplay here cannot finish construction.");
  const active = await activeVenueSession();
  if (!active || active.placeId !== placeId || active.status !== "active")
    throw badRequest("Visit this venue before acting here.");
  if (active.area === "private" || (active.area === "shared" && venueResidentIds(storedPlace).length > 0))
    throw badRequest("Private and shared Residence changes require the residents' specific approval.");
  const zone = active.zoneId ? resolveVenueZone(storedPlace, active.zoneId) : undefined;
  if (zone?.kind === "staff" || zone?.kind === "restricted")
    throw badRequest("Private work areas require their controllers’ specific approval.");
  if (zone && zoneClosed(village, storedPlace, zone)) throw badRequest("This zone is closed for Renovation.");
  const place = active.zoneId
    ? venueInZone(storedPlace, active.zoneId)
    : venueInArea(storedPlace, active.area, active.spaceClass, active.privateOwnerId);
  const people =
    active?.participants
      .filter((person) => active.activeIds.includes(person.characterId))
      .map((person) => person.name)
      .join(", ") ?? "";

  const player = readPlayerIdentity(village).name || "The player";
  const model = await villagesLanguageModels().resolveForRequest({
    connectionId: await villagesConnectionIdFor("system"),
  });
  const maxTokens = Math.min(model.maxOutputTokens ?? 700, 700);
  const fitted = model.fitContext(
    actionMessages(
      place,
      action,
      player,
      village.setting,
      people,
      village.villagers.map((resident) => `${resident.cardSnapshot.name} (${resident.characterId})`).join(", "),
    ),
    { maxTokens },
  );
  const result = await venueCheckpoint("action-outcome", async () => {
    const completion = await completeWithRoom(model, fitted.messages, fitted.maxTokens ?? maxTokens, {
      temperature: 0.3,
      signal: venueOperationSignal(),
    });
    return readVenueActionResult(
      extractJsonObject(completion.content ?? ""),
      place.state.furniture,
      place.state.traces?.map((trace) => trace.id) ?? [],
      ["player", ...village.villagers.map((resident) => resident.characterId)],
    );
  });
  assertVenueOwnership();
  if (result.transferTo && result.transferTo !== "player" && !active.activeIds.includes(result.transferTo))
    throw badRequest("The recipient must be present in this Zone for an item transfer.");
  // A resident reaction must pass scene validation before this action changes the venue or transcript.
  await beforeRecord?.(result);
  const now = new Date();
  const moment = deriveVillageMoment({ foundedAt: village.foundedAt, seed: village.seed, now });
  const publicNarration = result.traceKind === "note" ? `A note was left at ${place.name}.` : result.narration;
  const happening: VillageHappening = {
    id: `venue-action:${submissionId}`,
    kind: "player-action",
    actorIds: [],
    venueId: placeId,
    dayIndex: moment.dayIndex,
    clock: moment.dayPhase,
    occurredAt: moment.instant,
    timePrecision: "exact",
    sourceOpportunityId: "",
    narration: publicNarration,
    text: publicNarration,
  };
  if (result.happened)
    await mutateVillageState((state) => {
      if (state.venueEvents.some((event) => event.actionReceipt?.submissionId === submissionId)) return;
      const current = state.venues.find((entry) => entry.id === placeId);
      if (!current) throw notFound("That place is not in this village.");
      const originalState = current.state;
      const space = active.zoneId
        ? resolveVenueZone(current, active.zoneId)
        : active.area === "outside"
          ? undefined
          : current.spaces?.find((entry) => entry.venueClass === active.spaceClass);
      if (active.zoneId && (!space || zoneClosed(state, current, space)))
        throw badRequest("That zone is unavailable during this action.");
      const areaState = space?.state ?? (active.area === "outside" ? current.exteriorState : undefined);
      if (areaState)
        current.state = {
          ...current.state,
          condition: areaState.condition,
          furniture: [...areaState.items],
          publicFacts: [...areaState.publicFacts],
          features: [...areaState.features],
          traces: [...areaState.traces],
          updatedAt: areaState.updatedAt,
        };
      if (result.removeItem && !current.state.furniture.includes(result.removeItem)) {
        throw badRequest("That item is no longer here.");
      }
      if (result.removeItem) {
        current.state.furniture = current.state.furniture.filter((item) => item !== result.removeItem);
      }
      if (result.addItem && !current.state.furniture.includes(result.addItem)) {
        if (current.state.furniture.length >= 24) throw badRequest("There is no room for another item here.");
        current.state.furniture.push(result.addItem);
        state.narrativeItems.push({ venueId: placeId, zoneId: active.zoneId, itemName: result.addItem });
      }
      if (result.resolveTraceId) {
        current.state.traces = (current.state.traces ?? []).filter((trace) => trace.id !== result.resolveTraceId);
      }
      if (result.traceKind && result.traceText) {
        if ((current.state.traces?.length ?? 0) >= 16) throw badRequest("This place has too many unresolved traces.");
        current.state.traces = [
          ...(current.state.traces ?? []),
          {
            id: `trace:${submissionId}`,
            kind: result.traceKind,
            text: result.traceText,
            recipientId: result.recipientId ?? "",
            createdAt: moment.instant,
          },
        ];
      }
      if (result.addItem || result.removeItem) current.state.updatedAt = moment.instant;
      const nextState = {
        condition: current.state.condition,
        items: [...current.state.furniture],
        publicFacts: [...current.state.publicFacts],
        features: [...(current.state.features ?? [])],
        traces: [...(current.state.traces ?? [])],
        updatedAt: current.state.updatedAt,
      };
      if (active.zoneId && space) {
        space.state = nextState;
        current.state = originalState;
      } else if (active.area === "outside") {
        current.exteriorState = nextState;
        current.state = originalState;
      } else if (space) space.state = nextState;
      state.happenings = prependHappenings(state.happenings, [happening]);
      state.venueEvents = [
        {
          id: happening.id,
          venueId: placeId,
          zoneId: active.zoneId,
          venueName: current.name,
          text: result.traceKind === "note" ? "A note was left here." : result.narration,
          at: moment.instant,
          actionReceipt: {
            ...result,
            submissionId,
            witnessIds: [...active.activeIds],
            ...(result.removeItem && result.transferTo
              ? { itemTransfer: { itemName: result.removeItem, recipientId: result.transferTo } }
              : {}),
          },
        },
        ...state.venueEvents,
      ].slice(0, 200);
    });
  await recordVenueAction(placeId, action, result, submissionId);
  return result;
}
