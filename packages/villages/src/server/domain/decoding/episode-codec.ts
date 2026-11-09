import { z } from "zod";
import type { AcceptedEpisode, EpisodeCollection } from "../models/episode-model.js";
import { continuityEvidenceSchema, continuityHolderSchema } from "./continuity-codec.js";
import { coerceSession } from "./scene-codec.js";
import { continuitySourceUnit } from "../rules/continuity.js";
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
    privateInput: z.string().max(4000),
    actors: z
      .array(z.object({ id, incarnation: id, zoneId: id }).strict())
      .min(1)
      .max(32),
    segments: z.array(z.unknown()).max(24),
    grounding: z.array(continuityEvidenceSchema).max(256),
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
            ]),
            targetId: id,
            revision: z.number().int().nonnegative().safe(),
            text: z.string().min(1).max(8000),
            witnesses: ids.max(32),
          })
          .strict(),
      )
      .max(16),
    dependencies: z.record(z.string(), z.array(z.string().min(1).max(700))),
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
  if (raw && typeof raw === "object" && validated.get(raw) === seed) return raw as AcceptedEpisode;
  const value = episode.parse(raw) as AcceptedEpisode;
  memoryRequire(value.seed === seed && value.acceptedAt >= value.capturedAt, "invalid accepted episode world or time");
  const cast = new Map(value.actors.map((actor) => [actor.id, actor]));
  memoryRequire(cast.size === value.actors.length, "duplicate episode actor");
  memoryRequire(
    new Set(value.offered.map((row) => row.holder.id)).size === value.offered.length &&
      value.offered.every(
        (row) => row.holder.kind === "actor" && cast.get(row.holder.id)?.incarnation === row.holder.incarnation,
      ),
    "initiative offer lacks its admitted actor",
  );
  const decoded = coerceSession({
    version: 4,
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
        source.perceptions.every((row) => receipt.witnesses.includes(row.actorId) && row.text === receipt.text),
        "native source widened its committed witnesses",
      );
      memoryRequire(
        !source.actorId || receipt.witnesses.includes(source.actorId),
        "native source has a non-witness author",
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
        const full =
          line.heardBy.includes(perception.actorId) ||
          line.speakerId === perception.actorId ||
          (perception.actorId === "player" && !line.contactHidden);
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
  for (const key of Object.keys(value.dependencies))
    memoryRequire(
      key === "input" || units.has(key) || value.grounding.some((source) => source.unitId === key),
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
  const original = unitId === "input" ? episode.privateInput : episode.segments.find((line) => line.id === unitId);
  const source = episode.grounding.find((source) => source.unitId === unitId);
  if (original === undefined && source) return continuitySourceUnit(source);
  memoryRequire(original !== undefined, "missing episode evidence unit");
  return JSON.stringify([episode.id, unitId, memoryHash(original)]);
}

/** Validate direct edges; reverse traversal avoids quadratic stored ancestry for long histories. */
export function episodeSourceGraph(records: AcceptedEpisode[]) {
  const nodes = new Map<string, { index: number; dependencies: string[] }>();
  records.forEach((episode, index) => {
    const unitIds = new Set([
      "input",
      ...episode.segments.map((line) => line.id),
      ...episode.grounding.map((source) => source.unitId),
    ]);
    for (const unitId of unitIds) {
      const key = episodeUnit(episode, unitId);
      memoryRequire(!nodes.has(key), "duplicate episode evidence unit");
      nodes.set(key, { index, dependencies: episode.dependencies[unitId] ?? [] });
    }
    for (const source of episode.grounding)
      if (source.range) {
        const key = continuitySourceUnit(source),
          container = nodes.get(episodeUnit(episode, source.unitId))!;
        if (!nodes.has(key)) nodes.set(key, { index, dependencies: [...(episode.dependencies[source.unitId] ?? [])] });
        if (!container.dependencies.includes(key)) container.dependencies = [...container.dependencies, key];
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
