import type { ContinuityClass, ContinuityEvidence, ContinuityHolder } from "../models/continuity-model.js";
import type { AcceptedEpisode } from "../models/episode-model.js";
import type { VenueLine, VenueScene } from "../models/scene-model.js";
import type { VillageVenue } from "../models/world.js";
import { continuityHolderKey, continuityVersionId } from "./continuity.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";
import { narrationSourceSchema, type NarrationSource } from "./narration-contract.js";
import { exactInputSpan } from "./source-span.js";
import { contactNeighbors, contactPosition, type ContactMove } from "./venue-contact.js";
import { nativeReceiptSupportsRoom } from "./episode-sources.js";

/** A complete native outcome is known only to holders who perceived every material proof. */
export function narrationWitnesses(
  sources: ContinuityEvidence[],
  channels: readonly ContinuityEvidence["perceptions"][number]["channel"][] = ["words", "sight"],
): string[] {
  const eligible = (source: ContinuityEvidence) =>
    new Set([
      ...source.perceptions.filter((row) => channels.includes(row.channel)).map((row) => row.actorId),
      ...(source.actorId &&
      ((source.kind === "speech" && channels.includes("words")) ||
        (source.kind === "observation" && channels.includes("sight")))
        ? [source.actorId]
        : []),
    ]);
  const audiences = sources.map(eligible);
  return [...(audiences[0] ?? [])].filter((id) => audiences.every((audience) => audience.has(id)));
}

type Actor = Extract<ContinuityHolder, { kind: "actor" }>;
export type NarrationSourceContext = {
  seed: string;
  episodeId: string;
  operationId: string;
  input: string;
  actors: Actor[];
  scene: VenueScene;
  venue: VillageVenue;
  lines: VenueLine[];
  labels: Record<string, string>;
  historical: Record<string, ContinuityEvidence>;
  native: Record<string, AcceptedEpisode["commandReceipts"][number]>;
  moves: Pick<ContactMove, "characterId" | "zoneId" | "segment">[];
};
export type NarrationSourceOwner = { holder: ContinuityHolder; writeId: string; text: string; class: ContinuityClass };

function position(
  context: NarrationSourceContext,
  actorId: string,
  moment: { index: number; side: "before" | "after" },
) {
  const arrival = context.scene.pendingNpcAdmissions?.find((row) => row.npc.id === actorId);
  if (arrival && (moment.index < arrival.segment || (moment.index === arrival.segment && moment.side === "before")))
    return "";
  return (
    context.moves
      .toSorted((a, b) => a.segment - b.segment)
      .findLast(
        (move) =>
          move.characterId === actorId &&
          (move.segment < moment.index || (move.segment === moment.index && moment.side === "after")),
      )?.zoneId ??
    (actorId === "player" ? context.scene.zoneId : contactPosition(context.scene, actorId)) ??
    ""
  );
}
function inputMoment(value: Extract<NarrationSource, { input: string }>, context: NarrationSourceContext) {
  if (!value.ground) return undefined;
  const at = value.ground?.at;
  memoryRequire(at || !context.moves.length, "consequential input needs its movement moment");
  if (!at || at === "start") return { index: 0, side: "before" as const };
  const label = "before" in at ? at.before : at.after;
  const id = Object.hasOwn(context.labels, label) && context.labels[label];
  const index = context.lines.findIndex((line) => line.id === id);
  memoryRequire(index >= 0, "input moment label was not supplied");
  return { index, side: "before" in at ? ("before" as const) : ("after" as const) };
}

export function narrationPositions(
  context: NarrationSourceContext,
  moment: { index: number; side: "before" | "after" },
) {
  return Object.fromEntries(context.actors.map((actor) => [actor.id, position(context, actor.id, moment)]));
}

/** Only fitted aliases, code-routed segments and exact consequential excerpts can become evidence. */
export function bindNarrationSource(
  raw: unknown,
  context: NarrationSourceContext,
  owner?: NarrationSourceOwner,
): ContinuityEvidence {
  const ref = narrationSourceSchema.parse(raw) as NarrationSource;
  if (typeof ref === "string") {
    if (ref === "self") {
      memoryRequire(
        owner?.holder.kind === "actor" &&
          owner.holder.id !== "player" &&
          context.actors.some((actor) => continuityHolderKey(actor) === continuityHolderKey(owner.holder)) &&
          (context.scene.contactGeneration?.actorIds ?? context.scene.activeIds).includes(owner.holder.id) &&
          ["perspective", "desire", "motivation", "commitment"].includes(owner.class),
        "self belongs only to an admitted non-player's private perspective",
      );
      const versionId = continuityVersionId(context.seed, context.operationId + ":" + owner.writeId, owner.holder);
      return {
        id: "source-" + memoryHash([context.episodeId, versionId]).slice(0, 32),
        seed: context.seed,
        episodeId: context.episodeId,
        unitId: versionId,
        fingerprint: memoryHash([versionId, owner.class, owner.text, continuityHolderKey(owner.holder)]),
        excerpt: owner.text,
        kind: "self",
        actorId: owner.holder.id,
        perceptions: [],
      };
    }
    if (Object.hasOwn(context.historical, ref)) {
      memoryRequire(
        ref.startsWith("h:") && context.historical[ref].seed === context.seed,
        "historical source alias changed",
      );
      return structuredClone(context.historical[ref]);
    }
    if (Object.hasOwn(context.native, ref)) {
      const receipt = context.native[ref];
      if (owner?.holder.kind === "room")
        memoryRequire(
          nativeReceiptSupportsRoom(receipt, owner.holder),
          "native receipt does not establish this room outcome",
        );
      memoryRequire(
        ref.startsWith("native:") && receipt.witnesses.every((id) => context.actors.some((actor) => actor.id === id)),
        "native source witnesses were not admitted",
      );
      return {
        id: "source-" + memoryHash([context.episodeId, receipt.id]).slice(0, 32),
        seed: context.seed,
        episodeId: context.episodeId,
        unitId: "native:" + receipt.id,
        fingerprint: memoryHash(receipt),
        excerpt: receipt.text,
        kind: "native",
        committedReceiptId: receipt.id,
        perceptions: receipt.witnesses.map((actorId) => ({
          actorId,
          channel: receipt.observedBy?.includes(actorId) ? "sight" : "private",
          text: receipt.text,
        })),
      };
    }
    memoryRequire(!ref.startsWith("h:") && !ref.startsWith("native:"), "source alias was not supplied");
    return bindNarrationSource({ segment: ref }, context, owner);
  }
  const source: ContinuityEvidence = {
    id: "",
    seed: context.seed,
    episodeId: context.episodeId,
    unitId: "",
    fingerprint: "",
    excerpt: "",
    kind: "context",
    perceptions: [],
  };
  if ("input" in ref) {
    const span = exactInputSpan({ text: ref.input, occurrence: ref.occurrence }, context.input),
      moment = inputMoment(ref, context);
    source.unitId = "input";
    source.fingerprint = memoryHash(context.input);
    source.excerpt = span.text;
    source.range = { start: span.start, end: span.end };
    source.moment = moment;
    source.actorId = "player";
    const ground = ref.ground;
    if (ground?.kind === "spoken" || ground?.kind === "visible-action") {
      memoryRequire(moment, "perception needs its captured moment");
      const origin = position(context, "player", moment);
      memoryRequire(origin, "input has no captured player position");
      const words =
        ground.kind === "spoken" && ground.delivery === "shout"
          ? [origin, ...contactNeighbors(context.venue, origin, context.scene)]
          : [origin];
      if (ground.kind === "spoken" && ground.delivery === "whisper")
        memoryRequire(
          ground.targetId &&
            ground.targetId !== "player" &&
            context.actors.some((actor) => actor.id === ground.targetId) &&
            position(context, ground.targetId, moment) === origin,
          "whisper target is not local",
        );
      for (const actorId of ground.to) {
        memoryRequire(
          context.actors.some((actor) => actor.id === actorId) &&
            position(context, actorId, moment) &&
            words.includes(position(context, actorId, moment)) &&
            !(
              ground.kind === "spoken" &&
              ground.delivery === "whisper" &&
              actorId !== ground.targetId &&
              actorId !== "player"
            ),
          "input recipient cannot perceive that source",
        );
        source.perceptions.push({ actorId, channel: ground.kind === "spoken" ? "words" : "sight", text: span.text });
      }
      source.kind = ground.kind === "spoken" ? "speech" : "observation";
    } else if (ground?.kind === "private") {
      source.kind = "private";
      source.perceptions = [{ actorId: "player", channel: "private", text: span.text }];
    } else source.kind = "context";
  } else {
    const id = Object.hasOwn(context.labels, ref.segment) && context.labels[ref.segment];
    const index = context.lines.findIndex((line) => line.id === id),
      line = context.lines[index];
    memoryRequire(line && line.role === "assistant" && line.speakerId !== "player", "segment source was not supplied");
    if (owner?.holder.kind === "room")
      memoryRequire(
        owner.holder.placeId === context.scene.placeId && owner.holder.zoneId === line.zoneId,
        "room outcome is outside its captured scope",
      );
    source.unitId = line.id;
    source.fingerprint = memoryHash(line);
    source.excerpt = line.content;
    source.moment = { index, side: "after" };
    const full = [...new Set([...line.heardBy, ...(line.kind !== "narration" ? [line.speakerId] : [])])];
    const sound = [...(line.soundOnly?.characterIds ?? []), ...(line.soundOnly?.player ? ["player"] : [])];
    const perceive = ref.perceive;
    if (line.kind !== "narration") {
      memoryRequire(
        !perceive || ["heard", "sound-only"].includes(perceive.kind),
        "dialogue sources retain their actual communication channel",
      );
      source.kind = "speech";
      source.actorId = line.speakerId;
      for (const actorId of perceive?.by ?? [...new Set([...full, ...sound])]) {
        memoryRequire(
          context.actors.some((actor) => actor.id === actorId) && position(context, actorId, { index, side: "after" }),
          "unknown segment recipient",
        );
        const words = full.includes(actorId) && perceive?.kind !== "sound-only";
        memoryRequire(
          words || (line.soundOnly && (full.includes(actorId) || sound.includes(actorId))),
          "segment recipient was not routed that source",
        );
        source.perceptions.push({
          actorId,
          channel: words ? "words" : "sound-only",
          text: words ? line.content : line.soundOnly!.text,
        });
      }
    } else if (!perceive && owner?.holder.kind === "room") {
      source.kind = "observation";
    } else if (perceive) {
      source.kind = perceive.kind === "private" ? "private" : "observation";
      memoryRequire(
        perceive.kind !== "private" ||
          (perceive.by.length === 1 &&
            perceive.by[0] !== "player" &&
            (context.scene.contactGeneration?.actorIds ?? context.scene.activeIds).includes(perceive.by[0])),
        "private narration is only its actor's own perspective",
      );
      if (perceive.kind === "private") source.actorId = perceive.by[0];
      for (const actorId of perceive.by) {
        memoryRequire(
          context.actors.some((actor) => actor.id === actorId) &&
            position(context, actorId, { index, side: "after" }) &&
            (full.includes(actorId) || sound.includes(actorId)),
          "narrated perception was not eligible",
        );
        const acoustic = perceive.kind === "heard" || perceive.kind === "sound-only";
        memoryRequire(
          acoustic ? line.soundOnly && (full.includes(actorId) || sound.includes(actorId)) : full.includes(actorId),
          "narration cannot grant an unseen or unheard observation",
        );
        source.perceptions.push({
          actorId,
          channel: acoustic ? "sound-only" : perceive.kind === "private" ? "private" : "sight",
          text: acoustic ? line.soundOnly!.text : line.content,
        });
      }
    }
  }
  memoryRequire(!ref.act || source.kind === "speech", "only actual communication supports an offer decision");
  if (ref.act) source.act = ref.act;
  if (source.moment) source.positions = narrationPositions(context, source.moment);
  source.id = "source-" + memoryHash([context.episodeId, ref, source]).slice(0, 32);
  return source;
}

export function assertNarrationSourceOrder(sources: ContinuityEvidence[]) {
  const groups = new Map<string, ContinuityEvidence[]>();
  for (const source of sources)
    if (source.unitId === "input") {
      const key = JSON.stringify([source.episodeId, source.fingerprint]);
      const group = groups.get(key) ?? [];
      group.push(source);
      groups.set(key, group);
    }
  for (const sources of groups.values()) {
    const input = sources
      .filter((source) => source.unitId === "input" && source.range && source.moment)
      .toSorted((a, b) => a.range!.start - b.range!.start || a.range!.end - b.range!.end);
    for (let i = 1; i < input.length; i++) {
      const before = input[i - 1],
        after = input[i],
        rank = (source: ContinuityEvidence) => source.moment!.index * 2 + (source.moment!.side === "after" ? 1 : 0);
      memoryRequire(
        rank(before) <= rank(after) && (before.range!.end <= after.range!.start || rank(before) === rank(after)),
        "consequential input order contradicts its moments",
      );
    }
  }
}
