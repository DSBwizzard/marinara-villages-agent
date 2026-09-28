// Live, read-only Engine lore for one Village generation. The village stores IDs,
// never copies entry content, so edits in the Engine take effect on the next call.
import { runInNewContext } from "node:vm";
import { villageEngineJson } from "./engine-loopback.js";
import { villagesLogger } from "./package-runtime.js";
import { badRequest } from "./errors.js";

const MAX_BOOKS = 24;
export const DEFAULT_LORE_TOKEN_BUDGET = 1_600;
export const MIN_LORE_TOKEN_BUDGET = 200;
export const MAX_LORE_TOKEN_BUDGET = 3_200;
const MAX_LORE_ENTRIES = 24;

export function readLoreTokenBudget(value: unknown): number {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < MIN_LORE_TOKEN_BUDGET ||
    value > MAX_LORE_TOKEN_BUDGET
  )
    throw badRequest(`Lorebook token budget must be between ${MIN_LORE_TOKEN_BUDGET} and ${MAX_LORE_TOKEN_BUDGET}.`);
  return value;
}

export function coerceLoreTokenBudget(value: unknown): number {
  return typeof value === "number" &&
    Number.isInteger(value) &&
    value >= MIN_LORE_TOKEN_BUDGET &&
    value <= MAX_LORE_TOKEN_BUDGET
    ? value
    : DEFAULT_LORE_TOKEN_BUDGET;
}

type EngineBook = { id: string; name: string; enabled: boolean; hiddenFromLibrary?: boolean };
type EngineFolder = { id: string; parentFolderId: string | null; enabled: boolean };
type EngineEntry = {
  id: string;
  name: string;
  content: string;
  enabled: boolean;
  folderId: string | null;
  constant: boolean;
  keys: string[];
  secondaryKeys: string[];
  selective: boolean;
  selectiveLogic: string;
  matchWholeWords: boolean;
  caseSensitive: boolean;
  useRegex: boolean;
  order: number;
};

export function readSelectedLorebookIds(value: unknown): string[] {
  if (!Array.isArray(value) || value.length > MAX_BOOKS) throw badRequest(`Choose at most ${MAX_BOOKS} lorebooks.`);
  const ids = value.map((id) => (typeof id === "string" ? id.trim() : ""));
  if (ids.some((id) => !id || id.length > 160)) throw badRequest("Lorebook IDs must be valid text.");
  return [...new Set(ids)];
}

export function coerceSelectedLorebookIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [
    ...new Set(
      value
        .filter((id): id is string => typeof id === "string")
        .map((id) => id.trim())
        .filter((id) => id.length > 0 && id.length <= 160),
    ),
  ].slice(0, MAX_BOOKS);
}

export async function listVillageLorebooks(signal?: AbortSignal): Promise<EngineBook[]> {
  const books = await villageEngineJson<unknown>("/api/lorebooks", { signal });
  if (!Array.isArray(books)) return [];
  return books.flatMap((value): EngineBook[] => {
    if (!value || typeof value !== "object") return [];
    const book = value as Record<string, unknown>;
    if (typeof book.id !== "string" || typeof book.name !== "string") return [];
    return [
      {
        id: book.id,
        name: book.name,
        enabled: book.enabled === true,
        hiddenFromLibrary: book.hiddenFromLibrary === true,
      },
    ];
  });
}

function keyMatches(key: string, text: string, entry: EngineEntry): boolean {
  if (!key || key.length > 160) return false;
  if (entry.useRegex) {
    // Engine-authored regexes are data. Bound their execution so a pathological
    // expression cannot stall a village generation request.
    try {
      return (
        runInNewContext(
          "new RegExp(pattern, flags).test(context)",
          { pattern: key, flags: entry.caseSensitive ? "u" : "iu", context: text },
          { timeout: 25 },
        ) === true
      );
    } catch {
      return false;
    }
  }
  const haystack = entry.caseSensitive ? text : text.toLocaleLowerCase();
  const needle = entry.caseSensitive ? key : key.toLocaleLowerCase();
  if (!entry.matchWholeWords) return haystack.includes(needle);
  let offset = haystack.indexOf(needle);
  while (offset !== -1) {
    const before = haystack[offset - 1] ?? "";
    const after = haystack[offset + needle.length] ?? "";
    if (!/[\p{L}\p{N}_]/u.test(before) && !/[\p{L}\p{N}_]/u.test(after)) return true;
    offset = haystack.indexOf(needle, offset + 1);
  }
  return false;
}

function matches(entry: EngineEntry, text: string): boolean {
  if (entry.constant) return true;
  if (!Array.isArray(entry.keys) || !entry.keys.some((key) => keyMatches(key, text, entry))) return false;
  if (!entry.selective || !Array.isArray(entry.secondaryKeys) || !entry.secondaryKeys.length) return true;
  const secondary = entry.secondaryKeys.map((key) => keyMatches(key, text, entry));
  if (entry.selectiveLogic === "and_all") return secondary.every(Boolean);
  if (entry.selectiveLogic === "not") return !secondary.some(Boolean);
  if (entry.selectiveLogic === "not_all") return !secondary.every(Boolean);
  return secondary.some(Boolean);
}

function folderEnabled(folderId: string | null, folders: Map<string, EngineFolder>): boolean {
  const seen = new Set<string>();
  let id = folderId;
  while (id) {
    if (seen.has(id)) return false;
    seen.add(id);
    const folder = folders.get(id);
    if (!folder || !folder.enabled) return false;
    id = folder.parentFolderId;
  }
  return true;
}

export async function readVillageLore(
  ids: readonly string[],
  context: string,
  signal?: AbortSignal,
  tokenBudget = DEFAULT_LORE_TOKEN_BUDGET,
  strict = false,
): Promise<string[]> {
  if (!ids.length) return [];
  try {
    const books = await listVillageLorebooks(signal);
    const byId = new Map(books.map((book) => [book.id, book]));
    const candidates: EngineEntry[] = [];
    for (const id of ids) {
      if (strict && !byId.has(id)) throw new Error(`Selected lorebook ${id} could not be found.`);
      if (!byId.get(id)?.enabled) continue;
      try {
        const [entries, folders] = await Promise.all([
          villageEngineJson<EngineEntry[]>(`/api/lorebooks/${encodeURIComponent(id)}/entries`, { signal }),
          villageEngineJson<EngineFolder[]>(`/api/lorebooks/${encodeURIComponent(id)}/folders`, { signal }),
        ]);
        if (strict && (!Array.isArray(entries) || !Array.isArray(folders)))
          throw new Error("The entries or folders response was unreadable.");
        const folderMap = new Map((Array.isArray(folders) ? folders : []).map((folder) => [folder.id, folder]));
        candidates.push(
          ...(Array.isArray(entries) ? entries : []).filter(
            (entry) =>
              entry.enabled &&
              typeof entry.content === "string" &&
              entry.content.trim() &&
              folderEnabled(entry.folderId, folderMap) &&
              matches(entry, context),
          ),
        );
      } catch (error) {
        signal?.throwIfAborted();
        if (strict)
          throw new Error(`Selected lorebook ${byId.get(id)?.name ?? id} could not be read: ${String(error)}`);
        villagesLogger().warn("[villages] could not read lorebook %s: %s", id, String(error));
      }
    }
    candidates.sort((a, b) => (a.order ?? 100) - (b.order ?? 100) || a.name.localeCompare(b.name));
    const selected: string[] = [];
    let tokens = 0;
    for (const entry of candidates) {
      const content = entry.content.trim();
      const cost = Math.ceil((entry.name.length + content.length) / 4) + 4;
      if (tokens + cost > coerceLoreTokenBudget(tokenBudget)) continue;
      selected.push(`${entry.name}: ${content}`);
      tokens += cost;
      if (selected.length >= MAX_LORE_ENTRIES) break;
    }
    return selected;
  } catch (error) {
    signal?.throwIfAborted();
    if (strict) throw error;
    villagesLogger().warn("[villages] Engine lorebooks unavailable: %s", String(error));
    return [];
  }
}

/** Image prompts need visual cues, not a complete world-info entry. */
export async function readVillageVisualLore(ids: readonly string[], context: string, maxLength = 360): Promise<string> {
  const entries = await readVillageLore(ids, context);
  return entries.join("; ").slice(0, maxLength).trim();
}
