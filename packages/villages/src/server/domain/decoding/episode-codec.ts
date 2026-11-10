import { z } from "zod";
import type { AcceptedEpisode, EpisodeCollection } from "../models/episode-model.js";
import { continuityEvidenceSchema, continuityHolderSchema } from "./continuity-codec.js";
import { readSceneLines } from "../rules/scene-transcript.js";
import { continuityHolderKey, continuitySourceUnit, continuityVersionUnit } from "../rules/continuity.js";
import type { ContinuityHolder } from "../models/continuity-model.js";
import { nativeReceiptSupportsRoom, episodeContextActors } from "../rules/episode-sources.js";
import { immutableMemoryValue, isImmutableMemoryValue, memoryHash, memoryRequire } from "../rules/memory-integrity.js";
import { readNpc } from "../rules/places.js";
import type { NpcIdentity } from "../models/places.js";

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
              "movement-request",
              "departure",
              "structure",
              "discovery",
              "npc",
              "establishment",
              "circumstance",
              "initialization",
              "contact",
              "scene",
              "appointment",
              "venue-request",
            ]),
            targetId: id,
            revision: z.number().int().nonnegative().safe(),
            text: z.string().min(1).max(16000),
            witnesses: ids.max(32),
            observedBy: ids.max(32).optional(),
            endedContacts: ids.min(1).max(32).optional(),
            movement: z
              .object({
                actorId: id,
                from: id,
                zoneId: id,
                segment: z.number().int().min(0).max(23),
                path: ids.min(2).max(64),
                spaceClass: z.enum(["residence", "workplace", "community", "other"]),
                area: z.enum(["outside", "public", "shared", "private"]),
                privateOwnerId: z.string().max(160),
              })
              .strict()
              .optional(),
            departure: z
              .object({ actorId: id, from: id, segment: z.number().int().min(0).max(23), path: ids.min(1).max(64) })
              .strict()
              .optional(),
            admission: z
              .object({
                npc: z.custom<NpcIdentity>((value) => {
                  try {
                    return memoryHash(readNpc(value)) === memoryHash(value);
                  } catch {
                    return false;
                  }
                }),
                zoneId: id,
                segment: z.number().int().min(0).max(23),
              })
              .strict()
              .optional(),
            circumstance: z
              .object({ summary: z.string().min(1).max(1200), status: z.enum(["active", "resolved"]) })
              .strict()
              .optional(),
          })
          .strict(),
      )
      .max(16),
    dependencies: z.record(z.string(), z.array(z.string().min(1).max(700))),
    room: continuityHolderSchema.optional(),
    holderDependencies: z.record(z.string(), z.record(z.string(), z.array(z.string().min(1).max(700)))).optional(),
    sceneDelta: z
      .object({
        expectedRevision: z.number().int().nonnegative().safe(),
        contactEndedIds: ids.max(32),
        closed: z.literal(true).optional(),
        receiptIds: ids.min(1).max(16),
      })
      .strict()
      .optional(),
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
  const contextActors = episodeContextActors(value),
    referenceIds = new Set([...cast.keys(), ...contextActors.map((actor) => actor.id)]);
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
  if (value.sceneDelta) {
    const delta = value.sceneDelta;
    memoryRequire(
      value.sceneId &&
        delta.contactEndedIds.every((id) => cast.has(id)) &&
        delta.receiptIds.every((id) =>
          value.commandReceipts.some(
            (receipt) =>
              receipt.id === id && ["contact", "scene", "movement", "departure", "npc"].includes(receipt.kind),
          ),
        ),
      "Scene transition lost its native receipt or actor",
    );
    memoryRequire(
      !delta.closed ||
        delta.receiptIds.some((id) =>
          value.commandReceipts.some(
            (receipt) =>
              receipt.id === id &&
              receipt.kind === "scene" &&
              receipt.targetId === value.sceneId &&
              receipt.witnesses.includes("player"),
          ),
        ),
      "Scene closure lost Player authority",
    );
    const controls = value.commandReceipts.filter((receipt) =>
      ["contact", "scene", "movement", "departure", "npc"].includes(receipt.kind),
    );
    memoryRequire(
      memoryHash(delta.receiptIds.toSorted()) === memoryHash(controls.map((receipt) => receipt.id).toSorted()) &&
        controls.every((receipt) => receipt.revision === delta.expectedRevision),
      "Scene transition changed its native revision or receipt set",
    );
    const ended = [...new Set(controls.flatMap((receipt) => receipt.endedContacts ?? []))];
    memoryRequire(
      memoryHash(delta.contactEndedIds.toSorted()) === memoryHash(ended.toSorted()) &&
        Boolean(delta.closed) === controls.some((receipt) => receipt.kind === "scene"),
      "Scene transition changed its native result",
    );
  }
  memoryRequire(
    !value.commandReceipts.some((receipt) =>
      ["contact", "scene", "movement", "departure", "npc"].includes(receipt.kind),
    ) || value.sceneDelta,
    "Scene control receipt lost its retained transition",
  );
  for (const receipt of value.commandReceipts)
    memoryRequire(
      receipt.kind === "contact"
        ? receipt.endedContacts?.length &&
            receipt.endedContacts.every((id) => id !== "player" && cast.has(id)) &&
            (receipt.targetId === "player" ||
              (receipt.endedContacts.length === 1 && receipt.endedContacts[0] === receipt.targetId))
        : !receipt.endedContacts,
      "contact result changed its owning native command",
    );
  for (const receipt of value.commandReceipts) {
    if (receipt.circumstance) {
      const meaning = JSON.parse(receipt.text);
      memoryRequire(
        receipt.kind === "circumstance" &&
          meaning?.situation?.summary === receipt.circumstance.summary &&
          meaning?.situation?.status === receipt.circumstance.status,
        "circumstance result changed its native meaning",
      );
    } else
      memoryRequire(!(value.sceneId && receipt.kind === "circumstance"), "Scene circumstance lost its native meaning");
    const arrival = receipt.admission;
    memoryRequire(
      receipt.kind === "npc"
        ? arrival &&
            arrival.npc.id === receipt.targetId &&
            cast.has(arrival.npc.id) &&
            !arrival.npc.disabled &&
            cast.get(arrival.npc.id)?.zoneId === arrival.zoneId &&
            receipt.observedBy?.includes("player") &&
            receipt.witnesses.includes("player") &&
            value.segments[arrival.segment]?.kind === "narration" &&
            value.segments[arrival.segment]?.zoneId === arrival.zoneId &&
            value.segments[arrival.segment]?.content === receipt.text
        : !arrival,
      "NPC admission changed its owning native command",
    );
    const move = receipt.movement;
    memoryRequire(
      receipt.kind === "movement"
        ? move &&
            cast.has(move.actorId) &&
            receipt.witnesses.includes(move.actorId) &&
            receipt.targetId === move.zoneId &&
            move.from !== move.zoneId &&
            move.path[0] === move.from &&
            move.path.at(-1) === move.zoneId &&
            value.segments[move.segment]?.kind === "narration"
        : !move,
      "movement result changed its owning native command",
    );
    const departure = receipt.departure;
    memoryRequire(
      receipt.kind === "departure"
        ? departure &&
            departure.actorId !== "player" &&
            cast.has(departure.actorId) &&
            receipt.targetId === departure.actorId &&
            receipt.witnesses.includes(departure.actorId) &&
            departure.path[0] === departure.from &&
            departure.path.at(-1) === "exterior" &&
            value.segments[departure.segment]?.kind === "narration"
        : !departure,
      "departure result changed its owning native command",
    );
  }
  const moves = value.commandReceipts
    .flatMap((receipt) =>
      receipt.movement
        ? [
            {
              actorId: receipt.movement.actorId,
              from: receipt.movement.from,
              zoneId: receipt.movement.zoneId,
              segment: receipt.movement.segment,
            },
          ]
        : receipt.departure
          ? [
              {
                actorId: receipt.departure.actorId,
                from: receipt.departure.from,
                zoneId: "",
                segment: receipt.departure.segment,
              },
            ]
          : [],
    )
    .toSorted((a, b) => a.segment - b.segment);
  const positions = new Map(value.actors.map((actor) => [actor.id, actor.zoneId]));
  for (const segment of [...new Set(moves.map((move) => move.segment))]) {
    const crossing = moves.filter((move) => move.segment === segment);
    memoryRequire(
      new Set(crossing.map((move) => move.actorId)).size === crossing.length &&
        crossing.every((move) => positions.get(move.actorId) === move.from),
      "movement changed its admitted prior position",
    );
    for (const move of crossing) positions.set(move.actorId, move.zoneId);
  }
  memoryRequire(
    new Set(value.offered.map((row) => row.holder.id)).size === value.offered.length &&
      value.offered.every(
        (row) => row.holder.kind === "actor" && cast.get(row.holder.id)?.incarnation === row.holder.incarnation,
      ),
    "initiative offer lacks its admitted actor",
  );
  const lines = readSceneLines(value.segments, new Set(value.actors.map((actor) => actor.id)));
  memoryRequire(memoryHash(lines) === memoryHash(value.segments), "invalid canonical episode segments");
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
    memoryRequire(
      !source.actorId || (source.kind === "knowledge" ? referenceIds.has(source.actorId) : cast.has(source.actorId)),
      "unknown episode source actor",
    );
    memoryRequire(
      !source.positions || Object.keys(source.positions).every((id) => cast.has(id)),
      "unknown source position actor",
    );
    memoryRequire(
      source.perceptions.every((row) =>
        source.kind === "knowledge" ? referenceIds.has(row.actorId) : cast.has(row.actorId),
      ),
      "unknown episode source witness",
    );
    memoryRequire(source.kind !== "context" || !source.perceptions.length, "context cannot grant character perception");
    if (source.kind === "knowledge") {
      memoryRequire(
        source.actorId &&
          !source.range &&
          !source.act &&
          !source.committedReceiptId &&
          !source.positions &&
          !source.moment &&
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
  for (const admission of value.commandReceipts.flatMap((receipt) => (receipt.admission ? [receipt.admission] : []))) {
    const id = admission.npc.id,
      after = (moment: import("../models/continuity-model.js").ContinuityEvidence["moment"]) =>
        moment && (moment.index > admission.segment || (moment.index === admission.segment && moment.side === "after"));
    memoryRequire(
      value.segments
        .slice(0, admission.segment)
        .every(
          (line) =>
            line.speakerId !== id &&
            !line.heardBy.includes(id) &&
            !line.soundOnly?.characterIds.includes(id) &&
            !line.physicalIdsAfter?.includes(id) &&
            !line.staging?.some(
              (cue) => cue.characterId === id || (cue.look?.target === "villager" && cue.look.characterId === id),
            ),
        ),
      "NPC appeared before its admitted introduction",
    );
    for (const source of value.grounding) {
      if (source.kind === "knowledge" || source.kind === "self" || source.kind === "native") continue;
      memoryRequire(
        (!source.positions?.[id] || after(source.moment)) &&
          ((source.actorId !== id && !source.perceptions.some((row) => row.actorId === id)) || after(source.moment)),
        "NPC source precedes its admitted introduction",
      );
    }
    for (const receipt of value.commandReceipts) {
      if (receipt.admission === admission || !receipt.witnesses.includes(id)) continue;
      const dependencies = value.dependencies["native:" + receipt.id] ?? [],
        proofs = value.grounding.filter((source) => dependencies.includes(continuitySourceUnit(source)));
      memoryRequire(
        proofs.length > 0 && proofs.every((source) => after(source.moment)),
        "NPC witnessed a native outcome before its introduction",
      );
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
    ...contextActors.map(continuityHolderKey),
  ]);
  for (const [key, dependencies] of Object.entries(value.holderDependencies ?? {})) {
    memoryRequire(holderKeys.has(key), "unknown episode provenance holder");
    memoryRequire(!Object.hasOwn(dependencies, "input"), "authored input cannot depend on generated context");
    if (contextActors.some((actor) => continuityHolderKey(actor) === key))
      memoryRequire(
        value.segments.length > 0 &&
          Object.keys(dependencies).every((unit) => units.has(unit)) &&
          value.segments.every((line) => dependencies[line.id]?.length),
        "private reference provenance must cover generated segments only",
      );
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
