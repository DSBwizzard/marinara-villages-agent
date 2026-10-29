import { defaultVillageState } from "../../packages/villages/src/server/domain/decoding/village-codec.js";
import type { VillageMap, VillageSnapshot } from "../../packages/villages/src/server/domain/models/world.js";
import { defaultVenueSpace } from "../../packages/villages/src/server/domain/rules/venue-model.js";
import { createTownMapReview } from "../../packages/villages/src/server/features/media/town-map-review-service.js";
export const image = (name: string) => "data:image/png;base64," + Buffer.from(name).toString("base64");
export const artwork = (id: string) => ({ id, ref: "global-gallery:" + id, url: "/api/gallery/" + id });
export const map = (id: string, name = id): VillageMap => ({
  id,
  name,
  artwork: artwork(id),
  width: 1440,
  height: 900,
  view: { fit: "cover", focusX: 50, focusY: 50, zoom: 1 },
  revision: 1,
});
export function mapsFixture() {
  const state = defaultVillageState();
  state.name = "Maple House";
  state.seed = "map-world";
  state.setupAt = state.foundedAt = "2026-10-24T12:00:00.000Z";
  state.maps = [map("map-house"), map("map-street")];
  state.venues = ["home", "cafe"].map((id, index) => ({
    id,
    name: id,
    classes: ["community" as const],
    description: id,
    category: "",
    presentation: { mapId: state.maps[index].id, image: null, x: 0.3, y: 0.3 },
    occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
    capabilities: [],
    spaces: [defaultVenueSpace("community", id)],
    state: { revision: 0, recent: null, updatedAt: state.setupAt },
  }));
  let beforeWrite: (() => void) | undefined;
  let inspect: (() => Promise<{ width: number; height: number }>) | undefined;
  const uploads: string[] = [];
  const service = createTownMapReview({
    async readVillageState() {
      return structuredClone(state);
    },
    async mutateVillageState(change) {
      beforeWrite?.();
      beforeWrite = undefined;
      const next = structuredClone(state);
      change(next);
      Object.assign(state, next);
      return structuredClone(state);
    },
    async buildVillageSnapshot() {
      return { settings: structuredClone(state) } as unknown as VillageSnapshot;
    },
    async inspectVillageImage() {
      return inspect ? inspect() : { width: 1440, height: 900 };
    },
    async uploadVillageGalleryImage(input) {
      uploads.push(input.name);
      return artwork("uploaded-" + uploads.length);
    },
  });
  return {
    state,
    uploads,
    service,
    beforeWrite(work: () => void) {
      beforeWrite = work;
    },
    inspect(work: () => Promise<{ width: number; height: number }>) {
      inspect = work;
    },
  };
}
