import type { SpriteManagerState } from "../../../shared/contracts/sprites.js";
import { PROFESSOR_MARI_ID, MARI_SPRITE_FOLDER, mariSpriteFiles } from "../../../shared/helpers/professor-mari.js";
import { automaticVisitorSprites } from "./visitor-sprites.js";

const mariMoods = ["presenting"];

export const MARI_VILLAGES_CONTEXT =
  "Villages context: Professor Mari remembers being Marinara Engine's built-in agentic assistant. " +
  "Her existing card remains the foundation of her personality, appearance and history. She takes the Village and its people seriously, " +
  "with normal interests and social reactions. Occasionally, when it fits the conversation, she lets slip a wry fourth-wall aside about the Engine, " +
  "character cards or the interface beyond the Village. Do not turn these into repeated stock lines. If the player asks directly about her Engine identity, " +
  "she may acknowledge it naturally. Her workspace capabilities belong to the Engine assistant surface; here she follows ordinary Village knowledge, " +
  "Scene privacy and access rules, without extra tools, unseen knowledge or authority.";

/** Replace only untouched automatic defaults; explicit Portrait and custom artwork remain authoritative. */
export function withMariSpriteDefaults(characterId: string, manager: SpriteManagerState | null) {
  if (characterId !== PROFESSOR_MARI_ID) return manager;
  if (manager) {
    if (
      manager.lastSave ||
      manager.useSprites === false ||
      manager.artwork.length ||
      manager.folders ||
      manager.excluded ||
      manager.defaultView ||
      manager.framing.mode !== "full" ||
      (!manager.assignments.length && manager.expressions.length) ||
      manager.assignments.some((slot) => slot.view !== "front" || !slot.engineFilename)
    )
      return manager;
    const automatic = automaticVisitorSprites(
      manager.assignments.map((slot) => ({
        filename: slot.engineFilename!,
        label: mariSpriteFiles.find((file) => file.filename === slot.engineFilename)?.label,
        url: "",
        ...(slot.version ? { version: slot.version } : {}),
      })),
      [],
      mariMoods,
    );
    const selection = (value: SpriteManagerState | null) =>
      value && [
        value.expressions.map((row) => ({ ...row, name: row.name.toLowerCase() })),
        value.assignments,
        value.defaultExpressionId,
      ];
    if (manager.assignments.length && JSON.stringify(selection(manager)) !== JSON.stringify(selection(automatic)))
      return manager;
  }
  return automaticVisitorSprites(mariSpriteFiles, [MARI_SPRITE_FOLDER], mariMoods)!;
}
