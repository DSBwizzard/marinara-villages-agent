import { createHash } from "node:crypto";
import type { VenueLine, VenueScene } from "../models/scene-model.js";

/** One copy of each exact line, with narrator visibility distinct from resident evidence. */
export function legacySceneWritingHistory(scene: VenueScene, eligible: readonly VenueLine[]) {
  const citable = new Set(eligible.map((line) => line.id));
  const continuity = scene.lines
    .filter((line) => line.kind === "narration" && !line.contactHidden && !line.contactReport)
    .slice(-8);
  const wanted = new Set([...eligible, ...continuity].map((line) => line.id));
  const selected: { line: VenueLine; row: Record<string, unknown> }[] = [];
  let size = 0;
  for (const line of scene.lines.filter((line) => wanted.has(line.id)).toReversed()) {
    const row = {
      id: line.id,
      speakerId: line.role === "user" ? "player" : line.speakerId,
      kind: line.kind,
      heardBy: line.heardBy,
      ...(line.soundOnly ? { soundOnly: line.soundOnly } : {}),
      visibleToPlayer: !line.contactHidden,
      citable: citable.has(line.id),
      text: line.content,
    };
    const cost = JSON.stringify(row).length;
    if (size + cost > 12000) break;
    size += cost;
    selected.unshift({ line, row });
  }
  return {
    evidence: selected.filter(({ line }) => citable.has(line.id)).map(({ line }) => line),
    context: selected.length
      ? "Witnessed Scene history (each exact line once): " +
        JSON.stringify(selected.map(({ row }) => row)) +
        " Continue after these events. Visible narration supports narrator continuity, never shared resident knowledge. Residents know only heardBy evidence or their own audible-only soundOnly text. Only citable:true IDs support proposals; no surrounding unseen actions or recap evidence."
      : "",
  };
}

const HISTORY_PREFIX = "Partial active Scene history (omission never proves historical absence): ";
const HISTORY_SUFFIX =
  " Continue after these events. Narrator-visible actions are not shared resident knowledge. Residents know only heardBy text or their own soundOnly projection. Only citable IDs support effects. Statements establish what a speaker said/believed, not the truth of their claims.";
const tokens = (text: string) =>
  text
    .normalize("NFKC")
    .toLocaleLowerCase("en-US")
    .match(/[\p{L}\p{N}]+/gu) ?? [];

/** Rank the full eligible active Scene before allocating recent/relevant history. */
export function sceneWritingHistory(
  scene: VenueScene,
  eligible: readonly VenueLine[],
  query?: string,
  audience?: readonly string[],
) {
  if (query === undefined) return legacySceneWritingHistory(scene, eligible);
  const allowed = new Set(eligible.map((line) => line.id));
  const cast = new Set(audience ?? eligible.flatMap((line) => line.heardBy));
  const unique = new Set<string>();
  const rows = scene.lines.flatMap((line, index) => {
    if (unique.has(line.id) || line.contactReport) return [];
    unique.add(line.id);
    const full = line.heardBy.filter((id) => cast.has(id));
    const sound = line.soundOnly?.characterIds.filter((id) => cast.has(id)) ?? [];
    const visible = !line.contactHidden && line.kind === "narration";
    const citable = allowed.has(line.id) && (full.length > 0 || sound.length > 0);
    if (!citable && !visible) return [];
    const acousticOnly = !full.length && !visible && sound.length > 0;
    const text = acousticOnly ? line.soundOnly!.text : line.content;
    const row = {
      id: line.id,
      speakerId: acousticOnly ? "__venue_scene__" : line.role === "user" ? "player" : line.speakerId,
      kind: acousticOnly ? "narration" : line.kind,
      heardBy: acousticOnly ? [] : full,
      ...(sound.length ? { soundOnly: { characterIds: sound, text: line.soundOnly!.text } } : {}),
      visibleToPlayer: !line.contactHidden,
      citable,
      text,
    };
    return [{ line, index, row, terms: tokens(text), cost: JSON.stringify(row).length + 1 }];
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
  take(recent, Math.min(8000, capacity));
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
    context: ordered.length ? HISTORY_PREFIX + JSON.stringify(ordered.map((item) => item.row)) + HISTORY_SUFFIX : "",
  };
}
