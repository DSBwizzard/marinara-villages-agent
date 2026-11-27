import type { SpriteLibraryFolder, SpriteLibraryItem, SpriteManagerState } from "../../../shared/contracts/sprites.js";
import { engineSpriteName, spriteLabelKey, spriteMood } from "../../../shared/helpers/sprite-variants.js";
import { memoryHash } from "./memory-integrity.js";
import { emptySpriteManager } from "./sprite-manager-model.js";

const moods = new Set(
  (
    "neutral idle default happy joy smiling smile sad angry surprised scared afraid fearful disgusted thinking laughing " +
    "smirk embarrassed blush blushing confused worried nervous annoyed bored tired sleepy serious calm excited " +
    "shocked crying proud determined shy amused grin irritated wave sit hurt playful"
  ).split(" "),
);
const animationFrame =
  /(?:^|_)(?:talk(?:ing)?|speak(?:ing)?|blink(?:ing)?|mouth_open|open_mouth|eyes_closed|closed_eyes|eyes_shut)(?:_\d+)*$/u;
const compare = (a: string, b: string) => (a === b ? 0 : a < b ? -1 : 1);

export function automaticVisitorSprites(
  files: SpriteLibraryItem[],
  folders: SpriteLibraryFolder[],
  additionalMoods: readonly string[] = [],
): SpriteManagerState | null {
  const sets = new Map<string, { fullBody: boolean; name: string; sprites: SpriteLibraryItem[] }>();
  for (const file of files) {
    const folder = folders.find((entry) => entry.id === file.folderId);
    const fullBody = folder?.category === "full-body" || /^full_/iu.test(file.filename);
    const key = JSON.stringify([file.folderId ?? null, fullBody]);
    if (!sets.has(key)) sets.set(key, { fullBody, name: folder?.name ?? "", sprites: [] });
    sets.get(key)!.sprites.push(file);
  }
  const candidates = [...sets.entries()].flatMap(([key, set]) => {
    const sprites = set.sprites
      .flatMap((file) => {
        const name = engineSpriteName(file.label ?? "", file.filename);
        const label = spriteLabelKey(name);
        if (animationFrame.test(label)) return [];
        const mood = spriteMood(label);
        const known = moods.has(mood) || additionalMoods.includes(mood);
        const rank =
          label === "neutral"
            ? 0
            : /^neutral_\d+$/u.test(label)
              ? 1
              : label === "idle"
                ? 2
                : label === "default"
                  ? 3
                  : known
                    ? 4
                    : 5;
        return [{ file, name, label, known, rank }];
      })
      .sort((a, b) => a.rank - b.rank || compare(a.label, b.label) || compare(a.file.filename, b.file.filename));
    if (!sprites.length) return [];
    const recognized = sprites.filter((sprite) => sprite.known);
    return [
      {
        ...set,
        key,
        sprites,
        recognized,
        variety: new Set(recognized.map((sprite) => spriteMood(sprite.label))).size,
        rank: sprites[0]!.rank,
      },
    ];
  });
  const selected = candidates.sort(
    (a, b) =>
      a.rank - b.rank ||
      b.variety - a.variety ||
      Number(b.fullBody) - Number(a.fullBody) ||
      compare(spriteLabelKey(a.name), spriteLabelKey(b.name)) ||
      compare(a.key, b.key),
  )[0];
  if (!selected) return null;
  const sprites = (selected.recognized.length ? selected.recognized : selected.sprites.slice(0, 1)).slice(0, 200);
  const manager = emptySpriteManager();
  for (const { file, name } of sprites) {
    const digest = memoryHash(file.filename).slice(0, 32);
    const expressionId = "e-" + digest.replace(/^(........)(....)(....)(....)/u, "$1-$2-$3-$4-");
    manager.expressions.push({ id: expressionId, name });
    manager.assignments.push({
      expressionId,
      view: "front",
      engineFilename: file.filename,
      ...(file.version ? { version: file.version } : {}),
    });
  }
  manager.defaultExpressionId = manager.expressions[0]!.id;
  return manager;
}
