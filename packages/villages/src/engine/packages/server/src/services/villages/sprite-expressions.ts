import type { VillageResidentSprite } from "./types.js";

export function describeSpriteExpressions(sprite: VillageResidentSprite | null | undefined): string {
  const seen = new Set<string>();
  const defaultEntry = sprite?.expressions[0];
  const defaultId = sprite?.defaultExpressionId ?? defaultEntry?.expressionId;
  return (sprite?.expressions ?? [])
    .flatMap((entry) => {
      const id = entry.expressionId;
      if (seen.has(id)) return [];
      seen.add(id);
      return [
        JSON.stringify({
          id,
          name: entry.name,
          useWhen: entry.useWhen || "",
          isDefault: id === defaultId,
        }),
      ];
    })
    .join("; ");
}

/** Replies may select only this resident's assigned expression IDs. */
export function validateSpriteExpression(sprite: VillageResidentSprite | null | undefined, requested: string): string {
  return sprite?.expressions.find((entry) => entry.expressionId === requested)?.expressionId ?? "";
}
