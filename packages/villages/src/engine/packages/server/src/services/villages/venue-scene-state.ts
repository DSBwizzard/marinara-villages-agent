import { badGateway, conflict } from "./errors.js";
import { boundText, MAX_HAPPENING_LENGTH, MAX_VENUE_NOTE_LENGTH } from "./prompt-preset.js";
import type { VillageState, VillageVenue, VillageVenueClass } from "./types.js";

/** The small, present-tense consequence of a player action resolved by the scene reply. */
export type VenueSceneChange = {
  narration: string;
  conditionBefore?: string;
  conditionAfter?: string;
  featureId?: string;
  featureText?: string;
  publicFactBefore?: string;
  publicFactAfter?: string;
  resolveTraceId?: string;
  addItem?: string;
  removeItem?: string;
  sceneNote?: string;
};

const fail = () => badGateway("The scene described a change the room could not record. Try that turn again.");

/** Refuse an unsupported or stale edit before any transcript line is committed. */
export function readVenueSceneChange(value: unknown, venue: VillageVenue | undefined): VenueSceneChange | null {
  if (value === undefined || value === null) return null;
  if (!venue || typeof value !== "object" || Array.isArray(value)) throw fail();
  const raw = value as Record<string, unknown>;
  if (raw.happened !== true) return null;
  const read = (key: string) => (typeof raw[key] === "string" ? (raw[key] as string) : "");
  const narration = boundText(raw.narration, MAX_HAPPENING_LENGTH);
  const conditionBefore = read("conditionBefore");
  const conditionAfter = read("conditionAfter");
  const featureId = read("featureId");
  const featureText = read("featureText");
  const publicFactBefore = read("publicFactBefore");
  const publicFactAfter = read("publicFactAfter");
  const resolveTraceId = read("resolveTraceId");
  const addItem = read("addItem");
  const removeItem = read("removeItem");
  const sceneNote = read("sceneNote");
  if (
    !narration ||
    [conditionAfter, featureText, publicFactAfter, addItem, sceneNote].some(
      (text) => text.length > MAX_VENUE_NOTE_LENGTH,
    ) ||
    sceneNote.length > 180 ||
    ((conditionBefore || conditionAfter) && conditionBefore !== venue.state.condition) ||
    (featureId && !venue.state.features?.some((feature) => feature.id === featureId)) ||
    (featureText && !featureId) ||
    ((publicFactBefore || publicFactAfter) && !venue.state.publicFacts.includes(publicFactBefore)) ||
    (resolveTraceId && !venue.state.traces?.some((trace) => trace.id === resolveTraceId)) ||
    (removeItem && !venue.state.furniture.includes(removeItem)) ||
    (addItem && !venue.state.furniture.includes(addItem) && venue.state.furniture.length >= 24 && !removeItem) ||
    (sceneNote && (venue.state.traces ?? []).filter((trace) => trace.kind !== "scene-note").length >= 13) ||
    ![
      conditionBefore,
      conditionAfter,
      featureId,
      publicFactBefore,
      resolveTraceId,
      addItem,
      removeItem,
      sceneNote,
    ].some(Boolean)
  )
    throw fail();
  return {
    narration,
    ...(conditionBefore || conditionAfter ? { conditionBefore, conditionAfter } : {}),
    ...(featureId ? { featureId, featureText } : {}),
    ...(publicFactBefore ? { publicFactBefore, publicFactAfter } : {}),
    ...(resolveTraceId ? { resolveTraceId } : {}),
    ...(addItem ? { addItem } : {}),
    ...(removeItem ? { removeItem } : {}),
    ...(sceneNote ? { sceneNote } : {}),
  };
}

/** The caller checks its receipt before invoking this, and writes the receipt with the state. */
export function applyVenueSceneChange(
  state: VillageState,
  placeId: string,
  change: VenueSceneChange,
  submissionId: string,
  at: string,
  spaceClass?: VillageVenueClass,
  area: "outside" | "shared" | "private" | "public" = "public",
  privateOwnerId = "",
): void {
  const venue = state.venues.find((place) => place.id === placeId);
  if (!venue) throw conflict("That place is no longer in the village.");
  const originalState = venue.state;
  const space =
    area === "private"
      ? venue.privateSpaces?.find((entry) => entry.ownerId === privateOwnerId)
      : area === "outside"
        ? undefined
        : venue.spaces?.find((entry) => entry.venueClass === spaceClass);
  if (area === "private" && !space) throw conflict("That private space is no longer here.");
  const areaState = area === "outside" ? venue.exteriorState : space?.state;
  if (areaState)
    venue.state = {
      ...venue.state,
      condition: areaState.condition,
      furniture: [...areaState.items],
      publicFacts: [...areaState.publicFacts],
      features: [...areaState.features],
      traces: [...areaState.traces],
      updatedAt: areaState.updatedAt,
    };
  if (change.conditionBefore !== undefined) {
    if (venue.state.condition !== change.conditionBefore)
      throw conflict("The room changed while you acted. Try again.");
    venue.state.condition = change.conditionAfter ?? "";
  }
  if (change.featureId) {
    const feature = venue.state.features?.find((item) => item.id === change.featureId);
    if (!feature) throw conflict("That feature changed while you acted. Try again.");
    venue.state.features = change.featureText
      ? venue.state.features?.map((item) =>
          item.id === feature.id ? { ...item, text: change.featureText!, sourceCharacterId: "", updatedAt: at } : item,
        )
      : venue.state.features?.filter((item) => item.id !== feature.id);
  }
  if (change.publicFactBefore) {
    if (!venue.state.publicFacts.includes(change.publicFactBefore))
      throw conflict("That room fact changed. Try again.");
    venue.state.publicFacts = venue.state.publicFacts.flatMap((fact) =>
      fact === change.publicFactBefore ? (change.publicFactAfter ? [change.publicFactAfter] : []) : [fact],
    );
  }
  if (change.resolveTraceId) {
    if (!venue.state.traces?.some((trace) => trace.id === change.resolveTraceId))
      throw conflict("That trace is no longer here. Try again.");
    venue.state.traces = venue.state.traces.filter((trace) => trace.id !== change.resolveTraceId);
  }
  if (change.removeItem) {
    if (!venue.state.furniture.includes(change.removeItem)) throw conflict("That item is no longer here. Try again.");
    venue.state.furniture = venue.state.furniture.filter((item) => item !== change.removeItem);
  }
  if (change.addItem && !venue.state.furniture.includes(change.addItem)) {
    if (venue.state.furniture.length >= 24) throw conflict("There is no room for another item here.");
    venue.state.furniture.push(change.addItem);
  }
  if (change.sceneNote) {
    const notes = (venue.state.traces ?? []).filter((trace) => trace.kind === "scene-note");
    venue.state.traces = [
      ...(venue.state.traces ?? []).filter((trace) => trace.kind !== "scene-note"),
      ...notes.slice(-3),
      {
        id: `scene-note:${submissionId}`,
        kind: "scene-note",
        text: change.sceneNote,
        recipientId: "",
        createdAt: at,
        expiresAt: new Date(Date.parse(at) + 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
  }
  venue.state.updatedAt = at;
  const nextState = {
    condition: venue.state.condition,
    items: [...venue.state.furniture],
    publicFacts: [...venue.state.publicFacts],
    features: [...(venue.state.features ?? [])],
    traces: [...(venue.state.traces ?? [])],
    updatedAt: at,
  };
  if (area === "outside") venue.exteriorState = nextState;
  else if (space) space.state = nextState;
  if (area !== "public") venue.state = originalState;
}
