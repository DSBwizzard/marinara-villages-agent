import { createHash } from "node:crypto";
import type { VenueLine, VenueScene } from "../models/scene-model.js";
import { sceneEvidencePerception } from "./scene-evidence-perception.js";
import { mapScenePeople, sceneAudienceReference } from "./scene-prompt-references.js";
import type { VenueWritingBlock } from "./venue-writing.js";

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
  " Continue after these events. Metadata describes that event, never current attendance. Narrator-visible actions are not shared resident knowledge. Residents know only heardBy text or their own soundOnly projection. Only citable IDs support effects. Statements establish what a speaker said/believed, not the truth of their claims.";
const tokens = (text: string) =>
  text
    .normalize("NFKC")
    .toLocaleLowerCase("en-US")
    .match(/[\p{L}\p{N}]+/gu) ?? [];

/** Rank the full eligible active Scene before allocating recent/relevant history. */
export function sceneWritingHistory(
  scene: VenueScene,
  eligible: readonly VenueLine[],
  query: string,
  audience: readonly string[],
  people?: Readonly<Record<string, string>>,
) {
  const allowed = new Set(eligible.map((line) => line.id));
  const cast = new Set(audience);
  const unique = new Set<string>();
  const rows = scene.lines.flatMap((line, index) => {
    if (unique.has(line.id) || line.contactReport) return [];
    unique.add(line.id);
    const full = line.heardBy.filter((id) => cast.has(id));
    const sound = line.soundOnly?.characterIds.filter((id) => cast.has(id)) ?? [];
    const visible = !line.contactHidden && line.kind === "narration";
    const citable = allowed.has(line.id) && full.length > 0;
    if (!citable && !visible && !sound.length) return [];
    const acousticOnly = !full.length && !visible && sound.length > 0;
    const text = acousticOnly ? line.soundOnly!.text : line.content;
    const row = {
      id: line.id,
      speakerId: acousticOnly ? "__venue_scene__" : line.role === "user" ? "player" : line.speakerId,
      kind: acousticOnly ? "narration" : line.kind,
      heardBy: acousticOnly ? [] : full,
      ...(sound.length
        ? {
            soundOnly: {
              characterIds: sound,
              text: line.soundOnly!.text,
              ...(line.soundOnly!.player !== undefined ? { player: line.soundOnly!.player } : {}),
            },
          }
        : {}),
      visibleToPlayer: !line.contactHidden,
      citable,
      text,
      at: line.at,
      ...(!acousticOnly
        ? {
            name: line.name,
            zoneId: line.zoneId,
            delivery: line.delivery,
            presentation: line.presentation,
            targetId: line.targetId,
            staging: line.staging,
            physicalIdsAfter: line.physicalIdsAfter,
            ...sceneEvidencePerception(line),
          }
        : { playerPerception: line.soundOnly?.player ? ("sound-only" as const) : ("none" as const) }),
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
  const projected = ordered.map((item) => item.row);
  // Source references are request-local; saved event IDs and exact evidence stay private.
  let prefix = "h";
  while (rows.some((item) => unique.has(prefix + (item.index + 1)))) prefix += "h";
  const references = new Map(rows.map((item) => [item.line.id, prefix + (item.index + 1)]));
  const owners = new Map(
    (scene.submissions ?? []).flatMap((turn, index) => (turn.replyLineIds ?? []).map((id) => [id, index] as const)),
  );
  const recentOwners = new Set([...new Set(owners.values())].toSorted((a, b) => b - a).slice(0, 2));
  const chunks: { owner: number | undefined; rows: typeof rows }[] = [];
  for (const item of rows) {
    const owner = owners.get(item.line.id);
    const last = chunks.at(-1);
    if (last && owner !== undefined && last.owner === owner) last.rows.push(item);
    else chunks.push({ owner, rows: [item] });
  }
  const audiences: Record<string, string[]> = {};
  const encodedPeople = people && Object.fromEntries(Object.entries(people).map(([alias, id]) => [id, alias]));
  const render = (items: typeof rows) => {
    const groups: { facts: Record<string, unknown>; lines: Record<string, unknown>[] }[] = [];
    const names: Record<string, string> = {};
    if (people)
      for (const item of items) {
        const own = items.filter((row) => row.row.speakerId === item.row.speakerId);
        const name = "name" in item.row ? item.row.name : undefined;
        if (typeof name === "string" && own.every((row) => "name" in row.row && row.row.name === name))
          names[item.row.speakerId] = name;
      }
    for (const item of items) {
      const { at, heardBy, visibleToPlayer, playerPerception, zoneId, ...line } = { zoneId: undefined, ...item.row };
      const audience = sceneAudienceReference(heardBy);
      if (people) {
        const previous = audiences[audience];
        if (previous && JSON.stringify(previous) !== JSON.stringify(heardBy))
          throw new Error("The Scene audience references conflict.");
        audiences[audience] = heardBy;
      }
      const facts = { at, heardBy: people ? audience : heardBy, visibleToPlayer, playerPerception, zoneId };
      const entry: Record<string, unknown> = { ...line, id: references.get(item.line.id) };
      if (people) {
        if (entry.citable === true) delete entry.citable;
        if (entry.kind === "dialogue" && entry.delivery === "ordinary") delete entry.delivery;
        if (entry.kind === "dialogue" && entry.presentation === "main") delete entry.presentation;
        if (Object.hasOwn(names, item.row.speakerId)) delete entry.name;
      }
      const previous = groups.at(-1);
      if (previous && JSON.stringify(previous.facts) === JSON.stringify(facts)) previous.lines.push(entry);
      else groups.push({ facts, lines: [entry] });
    }
    return (
      "Scene exchange: " + JSON.stringify(encodedPeople ? mapScenePeople({ names, groups }, encodedPeople) : groups)
    );
  };
  const block = (items: typeof rows): VenueWritingBlock => ({
    text: render(items),
    evidence: items.filter((item) => item.row.citable).map((item) => item.line),
    references: Object.fromEntries(
      items.filter((item) => item.row.citable).map((item) => [references.get(item.line.id)!, item.line.id]),
    ),
  });
  const firstRequired = Math.min(
    ...chunks.flatMap((chunk, index) => (chunk.owner !== undefined && recentOwners.has(chunk.owner) ? [index] : [])),
    Math.max(0, chunks.length - 2),
  );
  const blocks = chunks.map((chunk, index) => ({
    ...block(chunk.rows),
    ...(index < firstRequired ? { optional: "history" as const } : {}),
  }));
  let recallSize = 0;
  const recall = ranked.flatMap((item): VenueWritingBlock[] => {
    const index = chunks.findIndex((chunk) => chunk.rows.includes(item));
    if (index >= firstRequired) return [];
    const recalled = block([item]);
    if (recallSize + recalled.text.length > 4000) return [];
    recallSize += recalled.text.length;
    return [{ ...recalled, optional: "history", withHistory: { source: blocks[index].text, text: "" } }];
  });
  return {
    blocks,
    audiences,
    recall,
    rows: projected,
    evidence: ordered.filter((item) => item.row.citable).map((item) => item.line),
    fingerprints: Object.fromEntries(
      ordered.map(({ line }) => [line.id, createHash("sha256").update(JSON.stringify(line)).digest("hex")]),
    ),
    partial: ordered.length < rows.length,
    context: ordered.length ? HISTORY_PREFIX + JSON.stringify(projected) + HISTORY_SUFFIX : "",
  };
}
