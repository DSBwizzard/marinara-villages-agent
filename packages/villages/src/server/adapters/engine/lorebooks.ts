import { coerceLoreTokenBudget, DEFAULT_LORE_TOKEN_BUDGET } from "../../domain/rules/lore-policy.js";
import { villageEngineJson } from "./engine-transport.js";
import { villagesLogger } from "./runtime-host.js";

export { MIN_LORE_TOKEN_BUDGET, MAX_LORE_TOKEN_BUDGET } from "../../domain/rules/lore-policy.js";

export {
  readLoreTokenBudget,
  coerceLoreTokenBudget,
  readSelectedLorebookIds,
  coerceSelectedLorebookIds,
  DEFAULT_LORE_TOKEN_BUDGET,
} from "../../domain/rules/lore-policy.js";

// Live, read-only Engine lore for one Village generation. The village stores IDs,
// never copies entry content, so edits in the Engine take effect on the next call.

const MAX_LORE_ENTRIES = 24;

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

function keyMatches(key: string, text: string): boolean {
  return (
    typeof key === "string" && key.length > 0 && key.length <= 160 && text.toLowerCase().includes(key.toLowerCase())
  );
}

function matches(entry: EngineEntry, text: string): boolean {
  return entry.constant || (Array.isArray(entry.keys) && entry.keys.some((key) => keyMatches(key, text)));
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
  preferMatches = false,
): Promise<string[]> {
  if (!ids.length || coerceLoreTokenBudget(tokenBudget) === 0) return [];
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
    candidates.sort(
      (a, b) =>
        (preferMatches
          ? Number(!!b.keys?.some((key) => keyMatches(key, context))) -
            Number(!!a.keys?.some((key) => keyMatches(key, context)))
          : 0) ||
        (preferMatches ? 0 : Number(b.constant) - Number(a.constant)) ||
        a.name.localeCompare(b.name),
    );
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
export async function readVillageVisualLore(
  ids: readonly string[],
  context: string,
  maxLength = 360,
  tokenBudget = DEFAULT_LORE_TOKEN_BUDGET,
): Promise<string> {
  return (await readVillageVisualLoreEntries(ids, context, maxLength, tokenBudget)).join("; ");
}

/** Complete visual entries, allowing each caller to fit them independently. */
export async function readVillageVisualLoreEntries(
  ids: readonly string[],
  context: string,
  maxLength = 360,
  tokenBudget = DEFAULT_LORE_TOKEN_BUDGET,
): Promise<string[]> {
  const entries = await readVillageLore(ids, context, undefined, tokenBudget, false, true);
  const selected: string[] = [];
  let length = 0;
  for (const entry of entries) {
    if (length + entry.length + (selected.length ? 2 : 0) > maxLength) continue;
    selected.push(entry);
    length += entry.length + (selected.length > 1 ? 2 : 0);
  }
  return selected;
}
