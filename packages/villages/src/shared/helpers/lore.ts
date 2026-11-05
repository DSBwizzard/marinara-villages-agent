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
        ...(Array.isArray(row.inspections)
          ? {
              inspections: row.inspections.slice(0, 8).flatMap((inspection: unknown) => {
                if (!inspection || typeof inspection !== "object") return [];
                const item = inspection as Record<string, unknown>;
                return typeof item.target === "string" &&
                  typeof item.id === "string" &&
                  /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/u.test(item.id)
                  ? [{ target: item.target.slice(0, 80), id: item.id }]
                  : [];
              }),
            }
          : {}),
      },
    ];
  });
}

export function mergeLoreUse(...groups: (readonly LoreUse[] | undefined)[]): LoreUse[] {
  const result = new Map<string, LoreUse>();
  for (const entry of readLoreUse(groups.flatMap((group) => group ?? []))) {
    const key = JSON.stringify([entry.bookId, entry.id]);
    const prior = result.get(key);
    const inspections = [
      ...new Map(
        [...(prior?.inspections ?? []), ...(entry.inspections ?? [])].map((item) => [
          JSON.stringify([item.target, item.id]),
          item,
        ]),
      ).values(),
    ].slice(0, 8);
    result.set(key, {
      ...entry,
      targets: [...new Set([...(prior?.targets ?? []), ...entry.targets])],
      ...(inspections.length ? { inspections } : {}),
    });
  }
  return [...result.values()];
}
