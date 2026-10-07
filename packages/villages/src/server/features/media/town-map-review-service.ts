import { coerceTownMapView } from "../../domain/decoding/village-codec.js";
import type { VillageState, VillageSnapshot } from "../../domain/models/world.js";
import { asTrimmedString } from "../../domain/rules/coerce.js";
import { badRequest, conflict } from "../../domain/rules/errors.js";
import {
  DEFAULT_TOWN_MAP_VIEW,
  isTownMapImage,
  MAX_TOWN_MAP_IMAGE_LENGTH,
  TOWN_MAP_EXPECTED_WIDTH,
  TOWN_MAP_EXPECTED_HEIGHT,
} from "../../domain/rules/prompt-preset.js";
import { isVillageFounded } from "../../domain/rules/world-snapshot.js";

export interface TownMapReviewPorts {
  readVillageState(): Promise<VillageState>;
  mutateVillageState(update: (state: VillageState) => void): Promise<VillageState>;
  buildVillageSnapshot(): Promise<VillageSnapshot>;
  inspectVillageImage(image: string): Promise<{ width: number; height: number }>;
}

/** One validation and replacement path connects saved maps and Engine inspection. Construction is inert. */
export function createTownMapReview({
  readVillageState,
  mutateVillageState,
  buildVillageSnapshot,
  inspectVillageImage,
}: TownMapReviewPorts) {
  /** Replace the background and its complete pin layout in one village write. */
  async function replaceVillageTownMap(value: unknown): Promise<VillageSnapshot> {
    const body = value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
    const submitted = await readTownMapSubmission(body.image, body.view);
    if (typeof body.expectedMapSetAt !== "string") throw badRequest("Reload the village map before replacing it.");
    if (!Array.isArray(body.placements)) throw badRequest("Review every Venue photograph before saving the map.");
    const positions = new Map<
      string,
      { x: number | null; y: number | null; fromX: number | null; fromY: number | null }
    >();
    const coordinate = (value: unknown): number | null => {
      if (value === null) return null;
      if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 1)
        throw badRequest("Venue photograph coordinates must be between 0 and 1.");
      return value;
    };
    for (const row of body.placements) {
      if (!row || typeof row !== "object" || Array.isArray(row))
        throw badRequest("A Venue photograph placement is invalid.");
      const item = row as Record<string, unknown>;
      const id = asTrimmedString(item.venueId);
      if (!id || positions.has(id)) throw badRequest("Every Venue must have one distinct photograph placement.");
      const x = coordinate(item.x);
      const y = coordinate(item.y);
      const fromX = coordinate(item.fromX);
      const fromY = coordinate(item.fromY);
      if ((x === null) !== (y === null) || (fromX === null) !== (fromY === null))
        throw badRequest("A Venue photograph needs both coordinates or neither.");
      positions.set(id, { x, y, fromX, fromY });
    }
    await mutateVillageState((state) => {
      if (!isVillageFounded(state)) throw conflict("Found the village before replacing its map.");
      if (state.townMapImageSetAt !== body.expectedMapSetAt)
        throw conflict("The village map changed. Reload it before saving.");
      if (state.venues.length !== positions.size || state.venues.some((venue) => !positions.has(venue.id)))
        throw conflict("The venue list changed. Reload the village map before saving.");
      for (const venue of state.venues) {
        const spot = positions.get(venue.id)!;
        if (venue.presentation.x !== spot.fromX || venue.presentation.y !== spot.fromY)
          throw conflict("A Venue photograph moved. Reload the village map before saving.");
        if (submitted.image === state.townMapImage && (spot.x !== spot.fromX || spot.y !== spot.fromY))
          throw conflict("Choose a replacement map before moving venues.");
      }
      for (const venue of state.venues) {
        const spot = positions.get(venue.id)!;
        venue.presentation.x = spot.x;
        venue.presentation.y = spot.y;
      }
      if (!submitted.image || submitted.image !== state.townMapImage) {
        state.townMapCanvasWidth = submitted.size?.width ?? TOWN_MAP_EXPECTED_WIDTH;
        state.townMapCanvasHeight = submitted.size?.height ?? TOWN_MAP_EXPECTED_HEIGHT;
      }
      state.townMapImage = submitted.image;
      state.townMapImageSetAt = submitted.image
        ? new Date(Math.max(Date.now(), (Date.parse(state.townMapImageSetAt) || 0) + 1)).toISOString()
        : "";
      state.townMapView = submitted.view;
    });
    return buildVillageSnapshot();
  }

  async function readTownMapSubmission(
    value: unknown,
    view?: unknown,
  ): Promise<{
    image: string;
    size: { width: number; height: number } | null;
    view: ReturnType<typeof coerceTownMapView>;
  }> {
    if (typeof value !== "string") throw badRequest("The town map must be an image or an explicit empty choice.");
    const image = value.trim();
    if (image.length > 0 && !isTownMapImage(image)) {
      throw badRequest("The town map must be a base64 image file.");
    }
    if (image.length > MAX_TOWN_MAP_IMAGE_LENGTH) {
      throw badRequest(
        `The town map can be at most ${Math.round(MAX_TOWN_MAP_IMAGE_LENGTH / 1_000_000)} MB of image data.`,
      );
    }
    return {
      image,
      size: image.length > 0 ? await inspectVillageImage(image) : null,
      view: image.length > 0 ? coerceTownMapView(view) : { ...DEFAULT_TOWN_MAP_VIEW },
    };
  }

  /**
   * The stored map on its own, away from the snapshot.
   *
   * A snapshot is read on every chat send, so the image is deliberately not part
   * of it: the tab asks for the picture here, once, and asks again only when the
   * stamp it was given changes.
   */
  async function readVillageTownMapImage(): Promise<{ image: string }> {
    const village = await readVillageState();
    return { image: village.townMapImage };
  }
  return { replaceVillageTownMap, readTownMapSubmission, readVillageTownMapImage };
}
export type TownMapReview = ReturnType<typeof createTownMapReview>;
