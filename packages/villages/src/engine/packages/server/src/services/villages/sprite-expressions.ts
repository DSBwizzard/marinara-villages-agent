import type { VillageResidentSprite } from "./types.js";

export function describeSpriteExpressions(sprite: VillageResidentSprite | null | undefined): string {
  const seen = new Set<string>();
  return (sprite?.expressions ?? [])
    .flatMap((entry) => {
      const id = entry.expressionId ?? entry.label;
      if (seen.has(id)) return [];
      seen.add(id);
      return [
        JSON.stringify({
          id,
          name: entry.name || entry.label.replaceAll("_", " "),
          useWhen: entry.useWhen || "",
          pose: entry.pose || "",
        }),
      ];
    })
    .join("; ");
}

/** New replies use only this character's filled IDs. Legacy art still accepts its labels. */
export function validateSpriteExpression(sprite: VillageResidentSprite | null | undefined, requested: string): string {
  return (
    sprite?.expressions.find((entry) => (entry.expressionId ?? entry.label) === requested)?.expressionId ??
    (sprite?.expressions.some((entry) => !entry.expressionId && entry.label === requested) ? requested : "")
  );
}
