import { z } from "zod";
import type { AcceptedEpisode, EpisodeCollection } from "../models/episode-model.js";
import { continuityEvidenceSchema, continuityHolderSchema } from "./continuity-codec.js";
import { readSceneLines } from "../rules/scene-transcript.js";
import { continuityHolderKey, continuitySourceUnit, continuityVersionUnit } from "../rules/continuity.js";
import type { ContinuityHolder } from "../models/continuity-model.js";
import {
  nativeReceiptSupportsRoom,
  episodeContextActors,
  episodeContextRooms,
  removedEpisodeRoom,
} from "../rules/episode-sources.js";
import { immutableMemoryValue, isImmutableMemoryValue, memoryHash, memoryRequire } from "../rules/memory-integrity.js";
import { readNpc } from "../rules/places.js";
import type { NpcIdentity } from "../models/places.js";
import { assertMailReceipt, assertMailHistory, mailEvidence, episodeMailEvidence } from "../rules/mail-evidence.js";
import { MAX_SCENE_REJECTIONS } from "../rules/scene-acceptance.js";

const id = z.string().min(1).max(160),
  ids = z.array(id).refine((rows) => new Set(rows).size === rows.length);
const repairRoots = ids
  .min(1)
  .max(4)
  .refine((entries) => entries.every((entry) => /^continuity-[a-f0-9]{32}$/u.test(entry)));
// A Room receipt can encode two maximum-size IDs containing escaped ASCII.
const receiptTarget = z
  .string()
  .min(1)
  .max(2 * 160 * 6 + 7);
const at = z.string().refine((value) => Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value);
const episode = z
  .object({
    format: z.literal(1),
    id,
    seed: id,
    sceneId: id.optional(),
    opportunity: z
      .object({ id, kind: z.enum(["encounter", "routine", "relationship"]), venueId: z.string().max(160), zoneId: id })
      .strict()
      .optional(),
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
    rejectedEffects: z
      .array(z.object({ id, reason: z.string().max(2000) }).strict())
      .min(1)
      .max(MAX_SCENE_REJECTIONS)
      .refine((rows) => new Set(rows.map((row) => row.id)).size === rows.length)
      .optional(),
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
              "room",
              "discovery",
              "npc",
              "establishment",
              "circumstance",
              "condition-repair",
              "initialization",
              "contact",
              "scene",
              "appointment",
              "meeting",
              "venue-request",
              "mail",
            ]),
            targetId: receiptTarget,
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
            conditionDamage: z
              .array(z.object({ conditionId: z.string().min(1).max(600), entries: repairRoots }).strict())
              .min(1)
              .max(4)
              .refine((links) => {
                const entries = links.flatMap((link) => link.entries);
                return (
                  new Set(links.map((link) => link.conditionId)).size === links.length &&
                  entries.length <= 4 &&
                  new Set(entries).size === entries.length
                );
              })
              .optional(),
            repairEntries: repairRoots.optional(),
            mail: z
              .object({
                id: z.string().min(1).max(512),
                at,
                from: z.object({ id, incarnation: id }).strict(),
                to: z.object({ id, incarnation: id }).strict(),
                phase: z.enum(["written", "read"]),
                sourceHash: z.string().regex(/^[a-f0-9]{64}$/),
                readingHash: z
                  .string()
                  .regex(/^[a-f0-9]{64}$/)
                  .optional(),
              })
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
  memoryRequire(!value.rejectedEffects || value.sceneId, "only a Scene episode records rejected effects");
  memoryRequire(value.seed === seed && value.acceptedAt >= value.capturedAt, "invalid accepted episode world or time");
  const cast = new Map(value.actors.map((actor) => [actor.id, actor]));
  if (value.opportunity) {
    const source = value.opportunity;
    memoryRequire(
      !value.sceneId &&
        !value.privateInput &&
        (source.kind === "encounter" || !value.commandReceipts.length) &&
        value.commandReceipts.every((receipt) => ["access", "residence", "appointment"].includes(receipt.kind)) &&
        value.actors.length > 0 &&
        value.actors.length <= 4 &&
        !cast.has("player") &&
        value.submissionId === source.id &&
        value.id === "resident-" + memoryHash([seed, source.id]).slice(0, 32) &&
        value.operationId === value.id &&
        value.actors.every((actor) => actor.zoneId === source.zoneId) &&
        value.segments.every((line) => line.zoneId === source.zoneId) &&
        (source.kind !== "encounter" || (value.actors.length >= 2 && !!source.venueId)) &&
        !!value.room === !!source.venueId &&
        (!value.room || (value.room.placeId === source.venueId && value.room.zoneId === source.zoneId)),
      "invalid native resident opportunity",
    );
  }
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
  for (const receipt of value.commandReceipts) {
    memoryRequire(
      receipt.targetId.length <= 160 ||
        (value.room && nativeReceiptSupportsRoom(receipt, value.room)) ||
        (receipt.id.startsWith("room-removed:") && removedEpisodeRoom(value)),
      "native receipt target exceeds its scope",
    );
    memoryRequire(
      receipt.witnesses.every((id) => cast.has(id)) &&
        (receipt.observedBy ?? []).every((id) => receipt.witnesses.includes(id)),
      "native observer was not an admitted witness",
    );
  }
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
    memoryRequire(
      receipt.kind === "mail" ? receipt.mail : !receipt.mail,
      "mail proof changed its owning native outcome",
    );
    if (receipt.mail) assertMailReceipt(value, receipt);
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
    if (receipt.conditionDamage) {
      const proof = value.dependencies["native:" + receipt.id];
      const observed = value.grounding.find(
        (source) =>
          source.kind === "observation" &&
          continuitySourceUnit(source) === proof?.[0] &&
          source.perceptions.some((row) => row.actorId === "player" && row.channel === "sight"),
      );
      const conditions = receipt.circumstance && JSON.parse(receipt.text)?.conditions;
      memoryRequire(
        value.sceneId &&
          value.room &&
          receipt.kind === "circumstance" &&
          receipt.observedBy?.includes("player") &&
          receipt.witnesses.includes("player") &&
          proof?.length === 1 &&
          observed &&
          value.segments.some(
            (line) => line.id === observed.unitId && line.kind === "narration" && line.zoneId === value.room!.zoneId,
          ) &&
          Array.isArray(conditions) &&
          receipt.conditionDamage.every(({ conditionId }) => {
            const condition = conditions.find((row) => row?.id === conditionId);
            return (
              condition?.revision === 1 &&
              condition.restriction === "ordinary-use" &&
              condition.endsAt === null &&
              condition.clear === false
            );
          }),
        "Scene damage lost its local Player-seen condition proof",
      );
    }
    if (receipt.kind === "condition-repair") {
      const proof = value.dependencies["native:" + receipt.id];
      const observed = value.grounding.find(
        (source) =>
          source.kind === "observation" &&
          continuitySourceUnit(source) === proof?.[0] &&
          source.excerpt === receipt.text &&
          source.perceptions.some((row) => row.actorId === "player" && row.channel === "sight"),
      );
      memoryRequire(
        value.sceneId &&
          value.room &&
          receipt.repairEntries?.length &&
          receipt.revision > 1 &&
          receipt.observedBy?.includes("player") &&
          receipt.witnesses.includes("player") &&
          proof?.length === 1 &&
          observed &&
          value.segments.some(
            (line) => line.id === observed.unitId && line.kind === "narration" && line.zoneId === value.room!.zoneId,
          ),
        "condition repair lost its local Player-seen evidence",
      );
    } else memoryRequire(!receipt.repairEntries, "Room repair targets belong only to the native repair receipt");
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
          receipt.kind !== "mail" &&
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
    if (source.kind === "written") {
      const receipt = value.commandReceipts.find((receipt) => receipt.id === source.committedReceiptId);
      memoryRequire(receipt?.mail, "written source lost its native letter");
      const canonical = mailEvidence(value.id, value.seed, receipt, source.act);
      memoryRequire(
        source.id === canonical.id &&
          source.unitId === canonical.unitId &&
          source.fingerprint === canonical.fingerprint &&
          source.actorId === canonical.actorId &&
          source.excerpt === canonical.excerpt &&
          !source.range &&
          !source.moment &&
          !source.positions &&
          source.perceptions.every((row) =>
            canonical.perceptions.some((prior) => memoryHash(prior) === memoryHash(row)),
          ),
        "written source changed its exact letter or readers",
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
  if (value.opportunity)
    for (const receipt of value.commandReceipts) {
      const units = new Set(value.dependencies["native:" + receipt.id] ?? []),
        proofs = value.grounding.filter((source) => units.has(continuitySourceUnit(source)));
      memoryRequire(
        value.grounding.some((source) => source.kind === "native" && source.committedReceiptId === receipt.id) &&
          proofs.length > 0 &&
          units.size === proofs.length &&
          new Set(proofs.map((source) => source.actorId)).size === 1 &&
          receipt.witnesses.includes(proofs[0].actorId ?? "") &&
          proofs.every(
            (source) =>
              source.episodeId === value.id &&
              source.kind === "speech" &&
              source.actorId &&
              cast.has(source.actorId) &&
              source.moment &&
              !source.range &&
              source.excerpt === value.segments.find((line) => line.id === source.unitId)?.content,
          ) &&
          receipt.witnesses.every((id) =>
            proofs.every(
              (source) =>
                source.actorId === id ||
                source.perceptions.some((row) => row.actorId === id && row.channel === "words"),
            ),
          ),
        "resident native outcome lost its complete current communication proof",
      );
    }
  const directWorld = value.commandReceipts.some(
    (receipt) => receipt.kind === "room" || (!value.sceneId && value.room && receipt.kind === "circumstance"),
  );
  if (directWorld) {
    const receipt = value.commandReceipts[0]!,
      source = value.grounding[0];
    memoryRequire(
      value.room &&
        !value.sceneId &&
        !value.opportunity &&
        !value.privateInput &&
        !value.actors.length &&
        !value.segments.length &&
        !value.offered.length &&
        !value.holderDependencies &&
        value.commandReceipts.length === 1 &&
        !receipt.witnesses.length &&
        (receipt.kind === "room"
          ? nativeReceiptSupportsRoom(receipt, value.room)
          : receipt.kind === "circumstance" && receipt.circumstance && !value.continuityVersionIds.length) &&
        value.grounding.length === 1 &&
        source?.kind === "native" &&
        source.committedReceiptId === receipt.id,
      "invalid standalone World Room receipt",
    );
  }
  const nativeRoomContext =
    !value.sceneId &&
    !value.privateInput &&
    !value.segments.length &&
    (directWorld ||
      (value.room && value.commandReceipts.some((receipt) => nativeReceiptSupportsRoom(receipt, value.room!))) ||
      (value.commandReceipts.length > 0 && value.commandReceipts.every((receipt) => receipt.kind === "mail")));
  memoryRequire(
    !value.room ||
      (value.room.kind === "room" &&
        (cast.get("player")?.zoneId === value.room.zoneId ||
          (!!value.opportunity &&
            value.opportunity.venueId === value.room.placeId &&
            value.opportunity.zoneId === value.room.zoneId) ||
          nativeRoomContext)),
    "invalid episode room scope",
  );
  const contextRooms = episodeContextRooms(value);
  const holderKeys = new Set([
    ...value.actors.map((actor) =>
      continuityHolderKey({ kind: "actor", id: actor.id, incarnation: actor.incarnation }),
    ),
    ...(value.room ? [continuityHolderKey(value.room)] : []),
    ...contextActors.map(continuityHolderKey),
    ...contextRooms.map(continuityHolderKey),
  ]);
  for (const [key, dependencies] of Object.entries(value.holderDependencies ?? {})) {
    memoryRequire(holderKeys.has(key), "unknown episode provenance holder");
    memoryRequire(!Object.hasOwn(dependencies, "input"), "authored input cannot depend on generated context");
    if (contextActors.some((actor) => continuityHolderKey(actor) === key)) {
      const generatedUnits = [
        ...value.segments.map((line) => line.id),
        ...value.commandReceipts
          .filter((receipt) => receipt.mail?.phase === "written" && receipt.mail.from.id !== "player")
          .map((receipt) => "mail:" + receipt.mail!.sourceHash),
      ];
      memoryRequire(
        generatedUnits.length > 0 &&
          Object.keys(dependencies).every((unit) => generatedUnits.includes(unit)) &&
          generatedUnits.every((unit) => dependencies[unit]?.length),
        "private reference provenance must cover generated segments only",
      );
    }
    if (contextRooms.some((room) => continuityHolderKey(room) === key)) {
      const generatedUnits = [
          ...value.segments.map((line) => line.id),
          ...value.commandReceipts
            .filter((receipt) => receipt.mail && receipt.mail.from.id !== "player")
            .map((receipt) => "mail:" + receipt.mail!.sourceHash),
        ],
        contextualUnits = [...generatedUnits, ...value.continuityVersionIds.map((id) => "version:" + id)];
      memoryRequire(
        Object.keys(dependencies).length > 0 &&
          Object.entries(dependencies).every(
            ([unit, sources]) => contextualUnits.includes(unit) && sources.length > 0,
          ) &&
          generatedUnits.every((unit) => dependencies[unit]?.length),
        "private room provenance must cover contextual generated units only",
      );
    }
  }
  for (const key of [
    Object.keys(value.dependencies),
    ...Object.values(value.holderDependencies ?? {}).map(Object.keys),
  ].flat())
    memoryRequire(
      key === "input" ||
        units.has(key) ||
        value.commandReceipts.some((receipt) => receipt.mail && key === "mail:" + receipt.mail.sourceHash) ||
        (key.startsWith("version:") && value.continuityVersionIds.includes(key.slice(8))) ||
        value.grounding.some((source) => source.kind !== "knowledge" && source.unitId === key),
      "unknown episode dependency unit",
    );
  const result = isImmutableMemoryValue(raw) ? (raw as AcceptedEpisode) : immutableMemoryValue(value);
  validated.set(result, seed);
  return result;
}

const validatedCollections = new WeakMap<object, string>();
export function readEpisodes(raw: unknown, seed: string): EpisodeCollection {
  if (raw && typeof raw === "object" && validatedCollections.get(raw) === seed) return raw as EpisodeCollection;
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
  assertMailHistory(records);
  const result = immutableMemoryValue({ format: 1 as const, revision: value.revision, records });
  validatedCollections.set(result, seed);
  return result;
}

export function episodeUnit(episode: AcceptedEpisode, unitId: string) {
  if (unitId.startsWith("version:") && episode.continuityVersionIds.includes(unitId.slice(8)))
    return continuityVersionUnit(unitId.slice(8));
  const original = unitId === "input" ? episode.privateInput : episode.segments.find((line) => line.id === unitId);
  const source = episode.grounding.find((source) => source.unitId === unitId) ?? episodeMailEvidence(episode, unitId);
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
      ...episode.commandReceipts.flatMap((receipt) => (receipt.mail ? ["mail:" + receipt.mail.sourceHash] : [])),
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
  // Administrative versions belong to the common collection and have no producing Episode.
  for (const node of [...nodes.values()])
    for (const dependency of node.dependencies)
      if (!nodes.has(dependency) && /^\["version","continuity-version-[a-f0-9]{32}"\]$/u.test(dependency))
        nodes.set(dependency, { index: -1, dependencies: [] });
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
