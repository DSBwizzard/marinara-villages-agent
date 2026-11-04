import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import type { DocumentSlot, createDocumentMutator } from "../../adapters/storage/document-store.js";
import type { VillageVenueImage } from "../../domain/models/world.js";
import { readLoreUse } from "../../../shared/helpers/lore.js";
import { asRecord } from "../../domain/rules/coerce.js";

const id = "villages-founding-artwork-lore";
const slot: DocumentSlot<{ images: VillageVenueImage[] }> = {
  kind: "founding-artwork",
  name: "Founding artwork sources",
  description: "Recent server-generated founding artwork references.",
  label: () => "Founding artwork sources",
  coerce: (value) => ({
    images: (Array.isArray(asRecord(value).images) ? (asRecord(value).images as VillageVenueImage[]) : [])
      .filter(
        (image) =>
          image && typeof image.id === "string" && typeof image.ref === "string" && typeof image.url === "string",
      )
      .map((image) => ({ id: image.id, ref: image.ref, url: image.url, lore: readLoreUse(image.lore) }))
      .slice(-128),
  }),
};

export function createFoundingArtworkSources(
  documents: () => CapabilityDocumentStore,
  mutate: ReturnType<typeof createDocumentMutator>,
) {
  async function remember(image: VillageVenueImage) {
    if (!image.lore?.length) return;
    await mutate(id, slot, (state) => {
      // shortcut: retain 128 pending references; expand only if a founding draft needs more. Saved images retain their own sources.
      state.images = [
        ...state.images.filter((row) => row.id !== image.id),
        { ...image, lore: readLoreUse(image.lore) },
      ].slice(-128);
    });
  }
  async function read(images: readonly VillageVenueImage[]) {
    const saved = slot.coerce((await documents().getById("villages", id))?.data);
    return new Map<VillageVenueImage, import("../../../shared/contracts/lore.js").LoreUse[]>(
      images.flatMap((image) => {
        const match = saved.images.find((row) => row.id === image.id && row.ref === image.ref && row.url === image.url);
        return match ? [[image, readLoreUse(match.lore)]] : [];
      }),
    );
  }
  return { remember, read };
}
