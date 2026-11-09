import { createHash } from "node:crypto";
import type { VenueLine, VenueScene } from "../models/scene-model.js";

/** Retrieval cannot widen witnessed knowledge through a keyword in private or offstage text. */
export function sharedLoreHistory(scene: VenueScene, retained: readonly VenueLine[], actors: readonly string[]) {
  if (!scene.zoneId) return [];
  const result: string[] = [];
  let size = 0;
  for (const line of retained.toReversed()) {
    if (
      line.contactHidden ||
      line.contactReport ||
      !["dialogue", "side", "whisper"].includes(line.kind ?? "") ||
      (line.role === "user" && line.speechSource?.version !== 3) ||
      line.zoneId !== scene.zoneId ||
      !actors.every((id) => line.heardBy.includes(id) || line.speakerId === id)
    )
      continue;
    if (size + line.content.length > 4000) continue;
    result.unshift(line.content);
    size += line.content.length;
    if (result.length === 6) break;
  }
  return result;
}

const HISTORY_PREFIX = "Partial active Scene history (omission never proves historical absence): ";
const HISTORY_SUFFIX =
  " Continue after these events. Narrator-visible actions are not shared resident knowledge. Residents know only heardBy text or their own soundOnly projection. Only citable IDs support effects. Statements establish what a speaker said/believed, not the truth of their claims.";
const tokens = (text: string) =>
  text
    .normalize("NFKC")
    .toLocaleLowerCase("en-US")
    .match(/[\p{L}\p{N}]+/gu) ?? [];

/** Source expansion uses the same projection the model read, including acoustic-only evidence. */
export function sceneHistoryRow(line: VenueLine, audience: readonly string[], eligible: boolean) {
  if (line.contactReport) return null;
  const cast = new Set(audience);
  const full = line.heardBy.filter((id) => cast.has(id));
  const sound = line.soundOnly?.characterIds.filter((id) => cast.has(id)) ?? [];
  const visible = !line.contactHidden && line.kind === "narration";
  const citable = eligible && (full.length > 0 || sound.length > 0);
  if (!citable && !visible) return null;
  const acousticOnly = !full.length && !visible && sound.length > 0;
  return {
    id: line.id,
    speakerId: acousticOnly ? "__venue_scene__" : line.role === "user" ? "player" : line.speakerId,
    kind: acousticOnly ? "narration" : line.kind,
    heardBy: acousticOnly ? [] : full,
    ...(sound.length ? { soundOnly: { characterIds: sound, text: line.soundOnly!.text } } : {}),
    visibleToPlayer: !line.contactHidden,
    citable,
    text: acousticOnly ? line.soundOnly!.text : line.content,
  };
}

/** Rank the full eligible active Scene before allocating recent/relevant history. */
export function sceneWritingHistory(
  scene: VenueScene,
  eligible: readonly VenueLine[],
  query: string,
  audience: readonly string[],
) {
  const allowed = new Set(eligible.map((line) => line.id));
  const unique = new Set<string>();
  const rows = scene.lines.flatMap((line, index) => {
    if (unique.has(line.id) || line.contactReport) return [];
    unique.add(line.id);
    const row = sceneHistoryRow(line, audience, allowed.has(line.id));
    return row ? [{ line, index, row, terms: tokens(row.text), cost: JSON.stringify(row).length + 2 }] : [];
  });
  const currentExchanges = (scene.submissions ?? []).slice(-2);
  const latestIds = new Set(currentExchanges.flatMap((turn) => turn.replyLineIds ?? []));
  const latestVisible = scene.lines.filter(
    (line) => !line.contactHidden && !line.contactReport && latestIds.has(line.id),
  );
  const queryTerms = new Set(tokens(query));
  const contextTerms = new Set(
    tokens(
      currentExchanges.map((turn) => turn.message).join(" ") +
        " " +
        latestVisible.map((line) => line.content).join(" "),
    ),
  );
  const frequencies = new Map<string, number>();
  for (const row of rows)
    for (const term of new Set(row.terms)) frequencies.set(term, (frequencies.get(term) ?? 0) + 1);
  const average = rows.reduce((sum, row) => sum + row.terms.length, 0) / Math.max(1, rows.length);
  const score = (row: (typeof rows)[number], terms: ReadonlySet<string>) => {
    const counts = new Map<string, number>();
    for (const term of row.terms) counts.set(term, (counts.get(term) ?? 0) + 1);
    let result = 0;
    for (const term of terms) {
      const frequency = counts.get(term) ?? 0;
      if (!frequency) continue;
      const documents = frequencies.get(term) ?? 0;
      result +=
        (Math.log(1 + (rows.length - documents + 0.5) / (documents + 0.5)) * frequency * 2.2) /
        (frequency + 1.2 * (0.25 + (0.75 * row.terms.length) / Math.max(1, average)));
    }
    return result;
  };
  // Recent context is selected first, while ranking still considers the full eligible corpus.
  const recent = rows.toReversed();
  const ranked = rows
    // The short current question controls relevance; long recent exchanges
    // disambiguate equal matches and supply context when the question has none.
    .map((row) => ({ row, queryScore: score(row, queryTerms), contextScore: score(row, contextTerms) }))
    .filter((item) => item.queryScore > 0 || item.contextScore > 0)
    .sort(
      (a, b) =>
        b.queryScore - a.queryScore ||
        b.contextScore - a.contextScore ||
        b.row.index - a.row.index ||
        a.row.line.id.localeCompare(b.row.line.id),
    )
    .map((item) => item.row);
  const selected = new Map<string, (typeof rows)[number]>();
  const overhead = HISTORY_PREFIX.length + HISTORY_SUFFIX.length + 2;
  const capacity = 12000 - overhead;
  let used = 0;
  const exchangeRows = rows.filter((row) => latestIds.has(row.line.id));
  const required = new Set((exchangeRows.length ? exchangeRows : rows.slice(-6)).map((row) => row.line.id));
  for (const row of rows) {
    if (!required.has(row.line.id)) continue;
    selected.set(row.line.id, row);
    used += row.cost;
  }
  const take = (candidates: typeof rows, allowance: number) => {
    let spent = 0;
    for (const row of candidates) {
      if (selected.has(row.line.id) || spent + row.cost > allowance || used + row.cost > capacity) continue;
      selected.set(row.line.id, row);
      spent += row.cost;
      used += row.cost;
    }
    return spent;
  };
  take(recent, Math.max(0, Math.min(8000, capacity) - used));
  take(ranked, Math.min(4000, capacity - used));
  take(ranked, capacity - used);
  take(recent, capacity - used);
  const ordered = [...selected.values()].sort((a, b) => a.index - b.index);
  return {
    evidence: ordered.filter((item) => item.row.citable).map((item) => item.line),
    fingerprints: Object.fromEntries(
      ordered.map(({ line }) => [line.id, createHash("sha256").update(JSON.stringify(line)).digest("hex")]),
    ),
    partial: ordered.length < rows.length,
    blocks: ordered.length
      ? [
          { text: HISTORY_PREFIX + HISTORY_SUFFIX },
          ...ordered.map((item) => ({
            text: JSON.stringify(item.row),
            ...(item.row.citable ? { evidenceId: item.line.id } : {}),
            ...(required.has(item.line.id) ? {} : { optional: "history" as const }),
          })),
        ]
      : [],
  };
}
