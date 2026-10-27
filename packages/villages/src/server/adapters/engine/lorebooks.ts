import { coerceLoreTokenBudget, DEFAULT_LORE_TOKEN_BUDGET } from "../../domain/rules/lore-policy.js";
import { villageEngineJson } from "./engine-transport.js";
import { runtimeDebug } from "../observability/runtime-debug.js";
import { badGateway } from "../../domain/rules/errors.js";
import { selectVillageLore, type LoreEntry } from "../../domain/rules/lore-selection.js";
import type { LoreInspection } from "../../../shared/contracts/lore.js";

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
  if (!Array.isArray(books)) throw badGateway("Lorebooks are unavailable. Check Engine and retry.");
  return books.flatMap((value): EngineBook[] => {
    if (!value || typeof value !== "object") throw badGateway("Lorebooks are unavailable. Check Engine and retry.");
    const book = value as Record<string, unknown>;
    if (typeof book.id !== "string" || typeof book.name !== "string" || typeof book.enabled !== "boolean")
      throw badGateway("Lorebooks are unavailable. Check Engine and retry.");
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
  options?: {
    current?: string;
    recent?: readonly string[];
    purpose?: string;
    inspect?: (report: LoreInspection) => void;
  },
): Promise<string[]> {
  if (!ids.length || coerceLoreTokenBudget(tokenBudget) === 0) {
    const inspection: LoreInspection = {
      purpose: options?.purpose ?? "Lore lookup",
      stage: "selection",
      budget: coerceLoreTokenBudget(tokenBudget),
      entries: [],
      omittedDiagnostics: 0,
    };
    options?.inspect?.(inspection);
    runtimeDebug("lore inspection", inspection);
    return [];
  }
  try {
    const books = await listVillageLorebooks(signal);
    const byId = new Map(books.map((book) => [book.id, book]));
    const candidates: LoreEntry[] = [];
    for (const id of ids) {
      if (!byId.has(id)) throw new Error("Missing selected book.");
      if (!byId.get(id)?.enabled) continue;
      const [entries, folders] = await Promise.all([
        villageEngineJson<EngineEntry[]>(`/api/lorebooks/${encodeURIComponent(id)}/entries`, { signal }),
        villageEngineJson<EngineFolder[]>(`/api/lorebooks/${encodeURIComponent(id)}/folders`, { signal }),
      ]);
      if (!Array.isArray(entries) || !Array.isArray(folders))
        throw new Error("The entries or folders response was unreadable.");
      if (folders.some((folder) => !folder || typeof folder.id !== "string" || typeof folder.enabled !== "boolean"))
        throw new Error("Invalid folder.");
      const folderMap = new Map(folders.map((folder) => [folder.id, folder]));
      candidates.push(
        ...entries.map((entry) => {
          if (
            !entry ||
            typeof entry.id !== "string" ||
            typeof entry.name !== "string" ||
            typeof entry.content !== "string" ||
            typeof entry.enabled !== "boolean" ||
            [entry.keys, entry.secondaryKeys].some(
              (keys) => keys !== undefined && (!Array.isArray(keys) || keys.some((key) => typeof key !== "string")),
            )
          )
            throw new Error("Invalid entry.");
          return { ...entry, bookId: id, folderEnabled: folderEnabled(entry.folderId, folderMap) };
        }),
      );
    }
    const result = selectVillageLore(
      candidates,
      { setting: context, current: options?.current, recent: options?.recent },
      tokenBudget,
    );
    result.inspection.purpose = options?.purpose ?? "Lore lookup";
    options?.inspect?.(result.inspection);
    runtimeDebug("lore inspection", result.inspection);
    return result.selected;
  } catch (_error) {
    signal?.throwIfAborted();
    runtimeDebug("lore unavailable", { reason: "Selected books could not be read." });
    throw badGateway(
      "Selected lorebooks are unavailable. Restore them in Engine or change Village Lorebooks, then retry.",
    );
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
  const entries = await readVillageLore(ids, context, undefined, tokenBudget);
  const selected: string[] = [];
  let length = 0;
  for (const entry of entries) {
    if (length + entry.length + (selected.length ? 2 : 0) > maxLength) continue;
    selected.push(entry);
    length += entry.length + (selected.length > 1 ? 2 : 0);
  }
  return selected;
}
