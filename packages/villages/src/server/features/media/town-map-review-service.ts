import { townMapImageProblem } from "../../../shared/helpers/town-map-upload.js";
import { coerceTownMapView } from "../../domain/decoding/village-codec.js";
import type { VillageMap, VillageState, VillageSnapshot } from "../../domain/models/world.js";
import { asRecord, asTrimmedString } from "../../domain/rules/coerce.js";
import { badRequest, conflict } from "../../domain/rules/errors.js";
import { assertMapRevision, mapName, villageMap } from "../../domain/rules/village-maps.js";
import { MAX_TOWN_MAP_IMAGE_LENGTH } from "../../domain/rules/prompt-preset.js";
import { decodeVillageImageDataUrl } from "../../adapters/engine/image-files.js";
import type { uploadVillageGalleryImage } from "../../adapters/engine/global-gallery.js";

export interface TownMapReviewPorts {
  readVillageState(): Promise<VillageState>;
  mutateVillageState(update: (state: VillageState) => void): Promise<VillageState>;
  buildVillageSnapshot(): Promise<VillageSnapshot>;
  inspectVillageImage(image: string): Promise<{ width: number; height: number }>;
  uploadVillageGalleryImage: typeof uploadVillageGalleryImage;
}
export function createTownMapReview(ports: TownMapReviewPorts) {
  const { readVillageState, mutateVillageState, buildVillageSnapshot, inspectVillageImage, uploadVillageGalleryImage } =
    ports;
  async function prepareVillageMap(value: unknown): Promise<VillageMap> {
    const body = asRecord(value);
    const id = asTrimmedString(body.id);
    if (!/^[a-zA-Z0-9_-]{8,128}$/.test(id)) throw badRequest("A map ID is required.");
    const name = mapName(body.name);
    const decoded = decodeVillageImageDataUrl(body.image, {
      label: "map artwork",
      maxBase64Length: MAX_TOWN_MAP_IMAGE_LENGTH,
    });
    const size = await inspectVillageImage(decoded.dataUrl);
    const problem = townMapImageProblem(size);
    if (problem) throw badRequest(problem);
    const artwork = await uploadVillageGalleryImage({
      bytes: decoded.bytes,
      mime: decoded.mime,
      name,
      prompt: "",
      ...size,
    });
    return { id, name, artwork, ...size, view: coerceTownMapView(body.view), revision: 1 };
  }
  async function createVillageMap(value: unknown): Promise<VillageSnapshot> {
    const body = asRecord(value);
    const current = await readVillageState();
    if (!current.setupAt) throw conflict("Found the Village before adding a map.");
    if (current.maps.some((map) => map.id === body.id)) return buildVillageSnapshot();
    const prepared = await prepareVillageMap(body);
    await mutateVillageState((state) => {
      if (state.seed !== current.seed) throw conflict("The Village changed. Reload before saving.");
      if (!state.maps.some((map) => map.id === prepared.id)) state.maps.push(prepared);
    });
    return buildVillageSnapshot();
  }
  async function updateVillageMap(id: string, value: unknown): Promise<VillageSnapshot> {
    const body = asRecord(value);
    const current = await readVillageState();
    const map = villageMap(current, id);
    assertMapRevision(map, body.expectedRevision);
    const prepared =
      body.image === undefined ? null : await prepareVillageMap({ ...body, id, name: body.name ?? map.name });
    const name = body.name === undefined ? map.name : mapName(body.name);
    const placements = body.placements === undefined ? null : new Map<string, { x: number | null; y: number | null }>();
    if (body.image !== undefined && !placements)
      throw badRequest("Review every Venue and Project placement before replacing artwork.");
    if (placements) {
      if (!Array.isArray(body.placements)) throw badRequest("Review this map's Venue placements.");
      for (const value of body.placements) {
        const row = asRecord(value);
        const venueId = asTrimmedString(row.venueId);
        const valid = (n: unknown) => n === null || (typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 1);
        if (
          !venueId ||
          placements.has(venueId) ||
          !valid(row.x) ||
          !valid(row.y) ||
          (row.x === null) !== (row.y === null)
        )
          throw badRequest("A Venue placement is invalid.");
        placements.set(venueId, { x: row.x as number | null, y: row.y as number | null });
      }
    }
    await mutateVillageState((state) => {
      if (state.seed !== current.seed) throw conflict("The Village changed. Reload before saving.");
      const target = villageMap(state, id);
      assertMapRevision(target, body.expectedRevision);
      const venues = state.venues.filter((venue) => venue.presentation.mapId === id);
      const projects = state.projects.filter(
        (project) =>
          project.kind === "new-venue" &&
          !["complete", "cancelled"].includes(project.status) &&
          !project.venueId &&
          project.venueDraft?.position.mapId === id,
      );
      const keys = [...venues.map((venue) => venue.id), ...projects.map((project) => "project:" + project.id)];
      if (placements && (keys.length !== placements.size || keys.some((key) => !placements.has(key))))
        throw conflict("Map placements changed. Reload before saving.");
      if (prepared)
        Object.assign(target, {
          artwork: prepared.artwork,
          width: prepared.width,
          height: prepared.height,
          view: prepared.view,
        });
      target.name = name;
      if (body.view !== undefined) target.view = coerceTownMapView(body.view);
      if (placements) for (const venue of venues) Object.assign(venue.presentation, placements.get(venue.id));
      if (placements)
        for (const project of projects) {
          const point = placements.get("project:" + project.id)!;
          const position = project.venueDraft!.position;
          if (position.x !== point.x || position.y !== point.y) {
            Object.assign(position, point);
            if (project.lifecycle) project.lifecycle.revision++;
          }
        }
      target.revision++;
    });
    return buildVillageSnapshot();
  }
  return { prepareVillageMap, createVillageMap, updateVillageMap };
}
export type TownMapReview = ReturnType<typeof createTownMapReview>;
