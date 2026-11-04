import type { LoreUse } from "../contracts/lore.js";

export function readLoreUse(value: unknown): LoreUse[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 48).flatMap((row) => {
    if (!row || typeof row !== "object" || [row.id, row.bookId, row.name].some((text) => typeof text !== "string"))
      return [];
    return [
      {
        id: row.id.slice(0, 160),
        bookId: row.bookId.slice(0, 160),
        name: row.name.slice(0, 160),
        ...(typeof row.bookName === "string" ? { bookName: row.bookName.slice(0, 160) } : {}),
        targets: Array.isArray(row.targets)
          ? [...new Set<string>(row.targets.filter((target: unknown): target is string => typeof target === "string"))]
              .slice(0, 8)
              .map((target) => target.slice(0, 80))
          : [],
      },
    ];
  });
}

export function mergeLoreUse(...groups: (readonly LoreUse[] | undefined)[]): LoreUse[] {
  const result = new Map<string, LoreUse>();
  for (const entry of readLoreUse(groups.flatMap((group) => group ?? []))) {
    const key = JSON.stringify([entry.bookId, entry.id]);
    const prior = result.get(key);
    result.set(key, { ...entry, targets: [...new Set([...(prior?.targets ?? []), ...entry.targets])] });
  }
  return [...result.values()];
}
