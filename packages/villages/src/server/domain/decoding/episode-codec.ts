import { z } from "zod";
import type { AcceptedEpisode, EpisodeCollection } from "../models/episode-model.js";
import { continuityEvidenceSchema, continuityHolderSchema } from "./continuity-codec.js";
import { coerceSession } from "./scene-codec.js";
import { continuityHolderKey, continuitySourceUnit, continuityVersionUnit } from "../rules/continuity.js";
import type { ContinuityHolder } from "../models/continuity-model.js";
import { nativeReceiptSupportsRoom } from "../rules/episode-sources.js";
import { immutableMemoryValue, isImmutableMemoryValue, memoryHash, memoryRequire } from "../rules/memory-integrity.js";

const id = z.string().min(1).max(160),
  ids = z.array(id).refine((rows) => new Set(rows).size === rows.length);
const at = z.string().refine((value) => Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value);
const episode = z
  .object({
    format: z.literal(1),
    id,
    seed: id,
    sceneId: id.optional(),
    submissionId: id,
    operationId: id,
    capturedAt: at,
    acceptedAt: at,
    responseDigest: z.string().regex(/^[a-f0-9]{64}$/),
    admittedContinuityRevision: z.number().int().nonnegative().safe(),
    privateInput: z.string().max(4000),
    actors: z.array(z.object({ id, incarnation: id, zoneId: id }).strict()).max(32),
    segments: z.array(z.unknown()).max(24),
    grounding: z.array(continuityEvidenceSchema).max(1024),
    continuityVersionIds: ids,
    offered: z.array(z.object({ holder: continuityHolderSchema, ids }).strict()).max(32),
    commandReceipts: z
      .array(
        z
          .object({
            id,
            kind: z.enum([
              "project",
              "access",
              "residence",
              "standing",
              "movement",
              "structure",
              "discovery",
              "npc",
              "establishment",
              "circumstance",
              "initialization",
            ]),
            targetId: id,
            revision: z.number().int().nonnegative().safe(),
            text: z.string().min(1).max(8000),
            witnesses: ids.max(32),
            observedBy: ids.max(32).optional(),
          })
          .strict(),
      )
      .max(16),
    dependencies: z.record(z.string(), z.array(z.string().min(1).max(700))),
    room: continuityHolderSchema.optional(),
    holderDependencies: z.record(z.string(), z.record(z.string(), z.array(z.string().min(1).max(700)))).optional(),
  })
  .strict();
const validated = new WeakMap<object, string>();
const boundary = (text: string, offset: number) =>
  offset >= 0 &&
  offset <= text.length &&
  !(
    offset > 0 &&
    offset < text.length &&
    /[\uD800-\uDBFF]/u.test(text[offset - 1]) &&
    /[\uDC00-\uDFFF]/u.test(text[offset])
  );

export function readAcceptedEpisode(raw: unknown, seed: string): AcceptedEpisode {
  memoryRequire(typeof seed === "string" && seed.length > 0, "accepted episode needs its world identity");
  if (raw && typeof raw === "object" && validated.has(raw) && validated.get(raw) === seed)
    return raw as AcceptedEpisode;
  const value = episode.parse(raw) as AcceptedEpisode;
  memoryRequire(value.seed === seed && value.acceptedAt >= value.capturedAt, "invalid accepted episode world or time");
  const cast = new Map(value.actors.map((actor) => [actor.id, actor]));
  memoryRequire(
    value.actors.length > 0 ||
      (!value.sceneId &&
        !value.privateInput &&
        !value.segments.length &&
        !value.offered.length &&
        value.commandReceipts.length > 0),
    "an unobserved native episode cannot invent Scene participation",
  );
  for (const receipt of value.commandReceipts)
    memoryRequire(
      receipt.witnesses.every((id) => cast.has(id)) &&
        (receipt.observedBy ?? []).every((id) => receipt.witnesses.includes(id)),
      "native observer was not an admitted witness",
    );
  memoryRequire(cast.size === value.actors.length, "duplicate episode actor");
  memoryRequire(
    new Set(value.offered.map((row) => row.holder.id)).size === value.offered.length &&
      value.offered.every(
        (row) => row.holder.kind === "actor" && cast.get(row.holder.id)?.incarnation === row.holder.incarnation,
      ),
    "initiative offer lacks its admitted actor",
  );
  const decoded = coerceSession({
    version: 5,
    lines: value.segments,
    participants: value.actors.map((actor) => ({ characterId: actor.id, name: actor.id, doing: "" })),
  });
  memoryRequire(memoryHash(decoded.lines) === memoryHash(value.segments), "invalid canonical episode segments");
  const units = new Map(value.segments.map((line) => [line.id, line]));
  memoryRequire(units.size === value.segments.length && !units.has("input"), "duplicate episode segment identity");
  for (const line of value.segments) {
    memoryRequire(
      ["narration", "dialogue", "side", "whisper"].includes(line.kind ?? "") &&
        line.content.length <= 2000 &&
        Number.isFinite(Date.parse(line.at)) &&
        new Set(line.heardBy).size === line.heardBy.length,
      "invalid accepted episode segment",
    );
    memoryRequire(
      line.role === "assistant" &&
        !Object.hasOwn(line, "speechSource") &&
        line.speakerId !== "player" &&
        (!line.speakerId || line.speakerId === "__venue_scene__" || cast.has(line.speakerId)),
      "episode cannot invent player speech or an actor",
    );
    memoryRequire(
      line.heardBy.every((id) => cast.has(id)) && (line.soundOnly?.characterIds ?? []).every((id) => cast.has(id)),
      "unknown episode witness",
    );
  }
  for (const source of value.grounding) {
    memoryRequire(source.seed === seed && source.episodeId === value.id, "episode source identity changed");
    memoryRequire(!source.actorId || cast.has(source.actorId), "unknown episode source actor");
    memoryRequire(
      !source.positions || Object.keys(source.positions).every((id) => cast.has(id)),
      "unknown source position actor",
    );
    memoryRequire(
      source.perceptions.every((row) => cast.has(row.actorId)),
      "unknown episode source witness",
    );
    memoryRequire(source.kind !== "context" || !source.perceptions.length, "context cannot grant character perception");
    if (source.kind === "knowledge") {
      memoryRequire(
        source.actorId &&
          !source.range &&
          !source.act &&
          !source.committedReceiptId &&
          source.perceptions.every(
            (row) => row.actorId === source.actorId && row.channel === "private" && row.text === source.excerpt,
          ),
        "knowledge anchor cannot grant speech or another holder's knowledge",
      );
      continue;
    }
    if (source.kind === "private" || source.kind === "self")
      memoryRequire(
        source.actorId &&
          source.perceptions.every((row) => row.actorId === source.actorId && row.channel === "private"),
        "private episode source has a foreign audience",
      );
    if (source.kind === "self") {
      memoryRequire(
        source.actorId !== "player" && value.continuityVersionIds.includes(source.unitId),
        "self source lacks its retained version",
      );
      continue;
    }
    if (source.kind === "native") {
      const receipt = value.commandReceipts.find((row) => row.id === source.committedReceiptId);
      memoryRequire(
        receipt &&
          source.unitId === "native:" + receipt.id &&
          source.fingerprint === memoryHash(receipt) &&
          source.excerpt === receipt.text,
        "native source lacks its committed receipt",
      );
      memoryRequire(
        source.perceptions.every(
          (row) =>
            receipt.witnesses.includes(row.actorId) &&
            row.text === receipt.text &&
            row.channel !== "sound-only" &&
            (row.channel !== "sight" || receipt.observedBy?.includes(row.actorId)),
        ),
        "native source widened its committed witnesses",
      );
      memoryRequire(
        !source.actorId || receipt.witnesses.includes(source.actorId),
        "native source has a non-witness author",
      );
      continue;
    }
    if (!value.sceneId && source.kind === "context" && source.unitId.startsWith("authored:")) {
      memoryRequire(
        value.commandReceipts.length === 1 &&
          value.commandReceipts[0].kind === "initialization" &&
          source.unitId.endsWith(":" + source.fingerprint.slice(0, 16)) &&
          !source.actorId &&
          !source.perceptions.length &&
          !source.act &&
          !source.committedReceiptId &&
          source.range &&
          source.range.end - source.range.start === source.excerpt.length,
        "invalid authored preparation source",
      );
      continue;
    }
    const line = units.get(source.unitId),
      original = source.unitId === "input" ? value.privateInput : line;
    memoryRequire(
      source.seed === seed &&
        source.episodeId === value.id &&
        original !== undefined &&
        source.fingerprint === memoryHash(original),
      "episode source identity changed",
    );
    const prose = typeof original === "string" ? original : original.content;
    memoryRequire(
      source.range
        ? boundary(prose, source.range.start) &&
            boundary(prose, source.range.end) &&
            prose.slice(source.range.start, source.range.end) === source.excerpt
        : prose === source.excerpt,
      "episode source excerpt changed",
    );
    if (source.unitId === "input") {
      memoryRequire(
        source.actorId === "player" && source.range,
        "input source lacks its exact original range or author",
      );
      const channel = source.kind === "speech" ? "words" : source.kind === "observation" ? "sight" : "private";
      memoryRequire(
        source.perceptions.every((row) => row.text === source.excerpt && row.channel === channel),
        "input source projection changed its exact content or channel",
      );
    }
    if (line) {
      memoryRequire(
        source.kind !== "speech" || (line.kind !== "narration" && source.actorId === line.speakerId),
        "segment source speaker changed",
      );
      for (const perception of source.perceptions) {
        const sound = line.soundOnly;
        const full = line.heardBy.includes(perception.actorId) || line.speakerId === perception.actorId;
        memoryRequire(
          perception.channel === "sound-only"
            ? Boolean(
                sound &&
                (full ||
                  sound.characterIds.includes(perception.actorId) ||
                  (perception.actorId === "player" && sound.player)) &&
                perception.text === sound.text,
              )
            : full &&
                (perception.channel !== "words" || line.kind !== "narration") &&
                line.content.includes(perception.text),
          "episode grounding widened the routed perception",
        );
      }
    }
  }
  memoryRequire(
    new Set(value.commandReceipts.map((row) => row.id)).size === value.commandReceipts.length,
    "duplicate native receipt",
  );
  memoryRequire(
    !value.room ||
      (value.room.kind === "room" &&
        (cast.get("player")?.zoneId === value.room.zoneId ||
          (!value.sceneId &&
            !value.privateInput &&
            !value.segments.length &&
            value.commandReceipts.some((receipt) => nativeReceiptSupportsRoom(receipt, value.room!))))),
    "invalid episode room scope",
  );
  const holderKeys = new Set([
    ...value.actors.map((actor) =>
      continuityHolderKey({ kind: "actor", id: actor.id, incarnation: actor.incarnation }),
    ),
    ...(value.room ? [continuityHolderKey(value.room)] : []),
  ]);
  for (const [key, dependencies] of Object.entries(value.holderDependencies ?? {})) {
    memoryRequire(holderKeys.has(key), "unknown episode provenance holder");
    memoryRequire(!Object.hasOwn(dependencies, "input"), "authored input cannot depend on generated context");
  }
  for (const key of [
    Object.keys(value.dependencies),
    ...Object.values(value.holderDependencies ?? {}).map(Object.keys),
  ].flat())
    memoryRequire(
      key === "input" ||
        units.has(key) ||
        (key.startsWith("version:") && value.continuityVersionIds.includes(key.slice(8))) ||
        value.grounding.some((source) => source.kind !== "knowledge" && source.unitId === key),
      "unknown episode dependency unit",
    );
  const result = isImmutableMemoryValue(raw) ? (raw as AcceptedEpisode) : immutableMemoryValue(value);
  validated.set(result, seed);
  return result;
}

export function readEpisodes(raw: unknown, seed: string): EpisodeCollection {
  const value = z
    .object({ format: z.literal(1), revision: z.number().int().nonnegative().safe(), records: z.array(z.unknown()) })
    .strict()
    .parse(raw);
  const records = value.records.map((row) => readAcceptedEpisode(row, seed));
  memoryRequire(
    new Set(records.map((row) => row.id)).size === records.length &&
      new Set(records.map((row) => row.operationId)).size === records.length,
    "duplicate accepted episode identity",
  );
  memoryRequire(value.revision === records.length, "episode append revision changed");
  episodeSourceGraph(records);
  return immutableMemoryValue({ format: 1, revision: value.revision, records });
}

export function episodeUnit(episode: AcceptedEpisode, unitId: string) {
  if (unitId.startsWith("version:") && episode.continuityVersionIds.includes(unitId.slice(8)))
    return continuityVersionUnit(unitId.slice(8));
  const original = unitId === "input" ? episode.privateInput : episode.segments.find((line) => line.id === unitId);
  const source = episode.grounding.find((source) => source.unitId === unitId);
  if (original === undefined && source) return continuitySourceUnit(source);
  memoryRequire(original !== undefined, "missing episode evidence unit");
  return JSON.stringify([episode.id, unitId, memoryHash(original)]);
}

/** Validate direct edges; reverse traversal avoids quadratic stored ancestry for long histories. */
const graphCache = new WeakMap<AcceptedEpisode[], Map<string, Map<string, Set<string>>>>();
export function episodeSourceGraph(records: AcceptedEpisode[], holder?: ContinuityHolder) {
  const scope = holder ? continuityHolderKey(holder) : "";
  let graphs = graphCache.get(records);
  if (graphs) return graphs.get(scope) ?? graphs.get("")!;
  const scopes = [...new Set(["", ...records.flatMap((row) => Object.keys(row.holderDependencies ?? {}))])];
  graphs = new Map();
  for (const scoped of scopes) graphs.set(scoped, buildEpisodeGraph(records, scoped));
  if (Object.isFrozen(records) && records.every(Object.isFrozen)) graphCache.set(records, graphs);
  return graphs.get(scope) ?? graphs.get("")!;
}
function buildEpisodeGraph(records: AcceptedEpisode[], scope: string) {
  const nodes = new Map<string, { index: number; dependencies: string[] }>();
  records.forEach((episode, index) => {
    const unitIds = new Set([
      "input",
      ...episode.segments.map((line) => line.id),
      ...episode.continuityVersionIds.map((id) => "version:" + id),
      ...episode.grounding.filter((source) => source.kind !== "knowledge").map((source) => source.unitId),
    ]);
    for (const unitId of unitIds) {
      const key = episodeUnit(episode, unitId);
      memoryRequire(!nodes.has(key), "duplicate episode evidence unit");
      nodes.set(key, {
        index,
        dependencies: [
          ...(episode.dependencies[unitId] ?? []),
          ...(episode.holderDependencies?.[scope]?.[unitId] ?? []),
        ],
      });
    }
    for (const source of episode.grounding)
      if (source.kind === "knowledge") {
        const version = continuityVersionUnit(source.unitId),
          key = continuitySourceUnit(source);
        if (!nodes.has(version)) nodes.set(version, { index: -1, dependencies: [] });
        if (!nodes.has(key)) nodes.set(key, { index, dependencies: [version] });
      } else if (source.kind === "self") {
        const node = nodes.get(continuitySourceUnit(source))!;
        node.dependencies = [...node.dependencies, continuityVersionUnit(source.unitId)];
      } else if (source.range) {
        const key = continuitySourceUnit(source),
          container = nodes.get(episodeUnit(episode, source.unitId))!;
        if (!nodes.has(key))
          nodes.set(key, {
            index,
            dependencies: [
              ...(episode.dependencies[source.unitId] ?? []),
              ...(episode.holderDependencies?.[scope]?.[source.unitId] ?? []),
            ],
          });
        if (container !== nodes.get(key) && !container.dependencies.includes(key))
          container.dependencies = [...container.dependencies, key];
      }
  });
  const resolved = new Set<string>(),
    visiting = new Set<string>(),
    reverse = new Map<string, Set<string>>();
  function visit(key: string) {
    if (resolved.has(key)) return;
    const node = nodes.get(key);
    memoryRequire(node, "missing episode ancestry source");
    memoryRequire(!visiting.has(key), "cyclic episode source ancestry");
    visiting.add(key);
    for (const dependency of node.dependencies) {
      memoryRequire(
        nodes.has(dependency) && nodes.get(dependency)!.index <= node.index,
        "missing or future episode ancestry source",
      );
      const children = reverse.get(dependency) ?? new Set<string>();
      children.add(key);
      reverse.set(dependency, children);
      visit(dependency);
    }
    visiting.delete(key);
    resolved.add(key);
  }
  for (const key of nodes.keys()) visit(key);
  return reverse;
}
