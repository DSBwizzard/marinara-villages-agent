import { VILLAGES_PACKAGE_ID, villagesDocuments } from "../engine/runtime-host.js";
import { coerceVillageScene } from "../../domain/decoding/village-codec.js";
import type { VillageScene } from "../../domain/models/world.js";

// Existing old-save route lock remains read-only. No link writer or deletion is retained.
const SCENE_DOC_KIND = "villager-scene";
export async function listVillageScenes(): Promise<Map<string, VillageScene>> {
  const records = await villagesDocuments().list(VILLAGES_PACKAGE_ID, SCENE_DOC_KIND);
  const scenes = new Map<string, VillageScene>();
  for (const record of records) {
    if (!record.id.startsWith("villages-scene-")) continue;
    const characterId = record.id.slice("villages-scene-".length);
    if (characterId.length === 0) continue;
    const scene = coerceVillageScene(characterId, record.data);
    if (scene.chatId.length > 0) scenes.set(characterId, scene);
  }
  return scenes;
}
