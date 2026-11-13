import type {
  ContinuityClass,
  ContinuityCollection,
  ContinuityEvidence,
  ContinuityHolder,
} from "../models/continuity-model.js";
import type { AcceptedEpisode } from "../models/episode-model.js";
import type { NarrationReadset } from "../models/narration-model.js";
import type { VenueLine, VenueScene } from "../models/scene-model.js";
import type { VillageVenue } from "../models/world.js";
import { assertContinuityKnowledge, continuityHolderKey, continuitySelfSource } from "./continuity.js";
import { asRecord } from "./coerce.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";
import {
  narrationSourceSchema,
  readContinuityProposal,
  readNarrationReply,
  type NarrationSource,
} from "./narration-contract.js";
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
  input: string;
  actors: Actor[];
  subjects?: { id: string; incarnation: string }[];
  scene: VenueScene;
  venue: VillageVenue;
  lines: VenueLine[];
  labels: Record<string, string>;
  historical: Record<string, ContinuityEvidence>;
  native: Record<string, AcceptedEpisode["commandReceipts"][number]>;
  moves: Pick<ContactMove, "characterId" | "zoneId" | "segment">[];
};
export type NarrationSourceOwner = { holder: ContinuityHolder; writeId: string; text: string; class: ContinuityClass };

function ordinaryReplyLayout(raw: Record<string, unknown>, positions: boolean, quotes: boolean) {
  if (
    !Array.isArray(raw.segments) ||
    Object.keys(raw).some((key) => !["segments", "keep", "keeps", "effects"].includes(key))
  )
    return raw;
  const fields = ["keep", "keeps", "effects"].filter((key) => Object.hasOwn(raw, key));
  if (fields.length > 1 || (fields.length && !Array.isArray(raw[fields[0]]))) return raw;
  const segments = [...raw.segments];
  const misplaced = [];
  while (asRecord(segments.at(-1)).kind === "keep") {
    const { kind: _kind, ...proposal } = asRecord(segments.pop());
    misplaced.unshift(proposal);
  }
  const field = fields[0];
  if (field && misplaced.length) return raw;
  const keep = field ? (raw[field] as unknown[]) : misplaced;
  if (
    (field === "effects" || field === "keeps" || misplaced.length > 0) &&
    keep.some((value) => {
      const row = asRecord(value);
      return (
        (row.kind !== undefined && row.kind !== "keep") || !Object.hasOwn(row, "for") || !Object.hasOwn(row, "source")
      );
    })
  )
    return raw;
  const normalized = keep.map((value) => {
    const { kind, ...fields } = asRecord(value);
    if (kind !== "keep" || field !== "effects") return value;
    const candidate = positions ? bindSceneSourcePositions({ segments, keep: [fields] }, quotes).keep : [fields];
    try {
      readContinuityProposal((candidate as unknown[])[0]);
      return fields;
    } catch {
      return value;
    }
  });
  return {
    segments: segments.map((value) => {
      const line = asRecord(value);
      if (line.kind !== "dialogue" || line.color !== "") return value;
      const { color: _color, ...dialogue } = line;
      return dialogue;
    }),
    ...(field || misplaced.length ? { keep: normalized } : {}),
  };
}

function bindSceneSourcePositions(
  raw: Record<string, unknown>,
  quotes: boolean,
  directOffers?: NarrationReadset["recognizeDirectOfferSpeech"],
) {
  if (!Array.isArray(raw.segments) || Object.hasOwn(raw, "commands")) return raw;
  const labels = raw.segments.map((value, index) => asRecord(value).id ?? "segment-" + index);
  const label = (position: unknown) =>
    typeof position === "number" && Number.isSafeInteger(position) && position >= 1
      ? (labels[position - 1] ?? position)
      : position;
  const resolveSources = (value: unknown) => {
    const row = asRecord(value);
    const { source: citations, for: holders } = row;
    if (!Array.isArray(citations)) return value;
    let defaultHolders: unknown[] | undefined;
    const sources = citations.map((ref: unknown) => {
      const source = asRecord(ref);
      if (quotes && typeof source.quote === "string" && source.quote.trim()) {
        const { quote, speakerId, ...proof } = source;
        if (!Object.keys(proof).every((key) => key === "act" || key === "perceive")) return ref;
        const matches = (raw.segments as unknown[]).flatMap((value, index) => {
          const line = asRecord(value);
          return line.kind === "dialogue" &&
            line.speakerId === speakerId &&
            typeof line.text === "string" &&
            line.text.includes(quote)
            ? [{ label: labels[index], text: line.text }]
            : [];
        });
        if (matches.length !== 1) return ref;
        const [match] = matches;
        const offer = asRecord(row.offer);
        const omitHolders = directOffers === 4 && !Object.hasOwn(row, "for") && !Object.hasOwn(row, "owner");
        const soleProposer =
          (directOffers === 3 || directOffers === 4) &&
          Array.isArray(holders) &&
          holders.length === 1 &&
          holders[0] === speakerId &&
          row.owner === speakerId;
        const declaredOffer =
          (directOffers === 2 || directOffers === 3 || directOffers === 4) &&
          citations.length === 1 &&
          (Object.keys(proof).length === 0 ||
            (omitHolders && Object.keys(proof).length === 1 && proof.act === "offer")) &&
          offer.proposer === speakerId &&
          Array.isArray(offer.participants) &&
          (omitHolders ||
            soleProposer ||
            (Array.isArray(holders) && offer.participants.every((party) => holders.includes(party)))) &&
          !["replace", "parent", "accept", "closeOffer", "retire"].some((key) => Object.hasOwn(row, key)) &&
          !/["“”«»‘]|(?:^|[^\p{L}\p{N}])'/u.test(match.text);
        if (declaredOffer && omitHolders) defaultHolders = offer.participants as unknown[];
        return { ...proof, segment: match.label, ...(declaredOffer ? { act: "offer" } : {}) };
      }
      if (Object.hasOwn(source, "segment")) return { ...source, segment: label(source.segment) };
      const ground = asRecord(source.ground);
      const at = asRecord(ground.at);
      const anchor = Object.keys(at)[0];
      if (Object.hasOwn(source, "input") && (anchor === "before" || anchor === "after") && Object.keys(at).length === 1)
        return { ...source, ground: { ...ground, at: { [anchor]: label(at[anchor]) } } };
      return ref;
    });
    return { ...row, ...(defaultHolders ? { for: defaultHolders } : {}), source: sources };
  };
  return {
    ...raw,
    ...(Array.isArray(raw.keep) ? { keep: raw.keep.map(resolveSources) } : {}),
    ...(Object.hasOwn(raw, "halt") ? { halt: resolveSources(raw.halt) } : {}),
  };
}

/** Discard effect-free dialogue annotations that assert no provenance or have the speaker's own fitted proof. */
export function readSceneNarrationReply(
  raw: Record<string, unknown>,
  speakers: string[],
  readset: NarrationReadset,
  continuity: ContinuityCollection,
) {
  const positions = readset.positionedSceneSources === true;
  const quotes = readset.quotedSceneSources === true;
  const recovery = readset.ordinaryFormatRecovery;
  if (readset.ordinaryReplyRecovery) raw = ordinaryReplyLayout(raw, positions, quotes);
  if (positions) raw = bindSceneSourcePositions(raw, quotes, readset.recognizeDirectOfferSpeech);
  if (
    (recovery === 3 || recovery === 4) &&
    Array.isArray(raw.segments) &&
    Object.keys(raw).every((key) => key === "segments" || key === "keep")
  ) {
    raw = {
      ...raw,
      segments: raw.segments.map((value: unknown) => {
        const line = asRecord(value);
        if (recovery === 4 && line.kind === "narration" && line.text_extra === "") {
          const { text_extra: _extra, ...prose } = line;
          return prose;
        }
        if (line.kind !== "dialogue") return value;
        const normal =
          recovery === 4 &&
          (line.delivery === "normal" || (readset.stripSceneReplyDecorations === true && line.delivery === null)) &&
          !Object.hasOwn(line, "targetId");
        if (!normal && line.truncated !== false) return value;
        const normalized = { ...line };
        if (line.truncated === false) delete normalized.truncated;
        if (normal) delete normalized.delivery;
        return normalized;
      }),
    };
  }
  if (readset.stripOfferContributionEcho === true && !Object.hasOwn(raw, "commands") && Array.isArray(raw.keep)) {
    raw = {
      ...raw,
      keep: raw.keep.map((value: unknown) => {
        const keep = asRecord(value);
        const { contributions, ...offer } = asRecord(keep.offer);
        const echo = Array.isArray(contributions) && contributions.length === 1 && asRecord(contributions[0]);
        if (
          !echo ||
          echo.act !== "offer" ||
          typeof offer.proposer !== "string" ||
          echo.by !== offer.proposer ||
          Object.keys(echo).length !== 2 ||
          Object.hasOwn(keep, "replace") ||
          Object.hasOwn(keep, "accept") ||
          Object.hasOwn(keep, "closeOffer")
        )
          return value;
        return { ...keep, offer };
      }),
    };
  }
  if (Object.keys(raw).length !== 1 || !Array.isArray(raw.segments)) return readNarrationReply(raw, speakers);
  const {
    source: { historical, seed },
    admission,
  } = readset;
  const segments = raw.segments.map((value: unknown) => {
    const line = asRecord(value),
      source = line.source;
    if (
      readset.stripSceneReplyDecorations === true &&
      line.kind === "narration" &&
      Object.keys(line).every((key) => ["kind", "text", "place"].includes(key)) &&
      typeof line.place === "string" &&
      /^by the \p{L}[\p{L} -]{0,39}$/iu.test(line.place)
    ) {
      const { place: _place, ...prose } = line;
      return prose;
    }
    if (
      (recovery === true || recovery === 2 || recovery === 3 || recovery === 4) &&
      line.kind === "dialogue" &&
      line.delivery === "aside" &&
      !Object.hasOwn(line, "targetId") &&
      !Object.hasOwn(line, "presentation") &&
      !Object.hasOwn(line, "requires") &&
      source === undefined
    ) {
      const { delivery: _delivery, ...prose } = line;
      return { ...prose, presentation: "aside" };
    }
    if (
      readset.stripSceneHistoryDecoration &&
      line.kind === "dialogue" &&
      line.requires === undefined &&
      source === undefined &&
      !line.delivery &&
      !line.targetId &&
      Object.hasOwn(line, "witnessedWords")
    ) {
      const { witnessedWords, ...prose } = line;
      const annotation = asRecord(witnessedWords);
      if (
        typeof annotation.ref === "string" &&
        (/^h:\d+\.\d+$/u.test(annotation.ref) ||
          ((recovery === 2 || recovery === 3 || recovery === 4) && annotation.ref === "self")) &&
        Object.keys(annotation).length === 1
      )
        return prose;
    }
    if (line.kind !== "dialogue" || line.requires !== undefined || !Array.isArray(source) || source.length !== 1)
      return value;
    const [alias] = source;
    if (alias === "self") {
      const { source: _annotation, ...prose } = line;
      return prose;
    }
    if (typeof alias !== "string" || !alias.startsWith("h:") || !Object.hasOwn(historical, alias)) return value;
    const cited = historical[alias];
    if (cited.kind !== "knowledge" || cited.seed !== seed) return value;
    const version = continuity.versions.find(({ id }) => id === cited.unitId);
    if (
      !version ||
      (version.class !== "experience" && version.class !== "information") ||
      version.parentId ||
      version.closed
    )
      return value;
    const owned = Object.values(historical).find((proof) => {
      if (
        proof.kind !== "knowledge" ||
        proof.seed !== seed ||
        proof.actorId !== line.speakerId ||
        proof.excerpt !== cited.excerpt
      )
        return false;
      const ownVersion = continuity.versions.find(({ id }) => id === proof.unitId);
      return (
        ownVersion?.rootId === version.rootId &&
        ownVersion.class === version.class &&
        memoryHash(ownVersion.about) === memoryHash(version.about)
      );
    });
    if (!owned) return value;
    assertContinuityKnowledge(
      continuity,
      owned,
      admission.actors,
      admission.continuityRevision,
      admission.sourceActors,
    );
    const { source: _citation, ...prose } = line;
    return prose;
  });
  return readNarrationReply({ segments }, speakers);
}
export type NarrationCommunication = Pick<
  NarrationSourceContext,
  "seed" | "episodeId" | "input" | "actors" | "lines"
> & {
  positions(moment: { index: number; side: "before" | "after" }): Record<string, string>;
  visit?: Pick<VenueScene, "id" | "placeId">;
};
export function narrationCommunication(context: NarrationSourceContext): NarrationCommunication {
  return { ...context, positions: (moment) => narrationPositions(context, moment), visit: context.scene };
}

export function bindNarrationReceipt(
  receipt: AcceptedEpisode["commandReceipts"][number],
  context: Pick<NarrationSourceContext, "seed" | "episodeId" | "actors">,
  owner?: NarrationSourceOwner,
): ContinuityEvidence {
  if (owner?.holder.kind === "room")
    memoryRequire(
      nativeReceiptSupportsRoom(receipt, owner.holder),
      "native receipt does not establish this room outcome",
    );
  memoryRequire(
    receipt.witnesses.every((id) => context.actors.some((actor) => actor.id === id)),
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
      const { seed, episodeId } = context;
      return continuitySelfSource({ seed, episodeId, operationId: episodeId }, owner);
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
      memoryRequire(ref.startsWith("native:"), "native source alias changed");
      return bindNarrationReceipt(receipt, context, owner);
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
    return bindNarrationSegment(
      ref,
      {
        seed: context.seed,
        episodeId: context.episodeId,
        actors: context.actors,
        room: { kind: "room", placeId: context.scene.placeId, zoneId: context.scene.zoneId ?? "" },
        privateActorIds: context.scene.contactGeneration?.actorIds ?? context.scene.activeIds,
        lines: context.lines,
        labels: context.labels,
        positions: (moment) => narrationPositions(context, moment),
      },
      owner,
    );
  }
  memoryRequire(!ref.act || source.kind === "speech", "only actual communication supports an offer decision");
  if (ref.act) source.act = ref.act;
  if (source.moment) source.positions = narrationPositions(context, source.moment);
  source.id = "source-" + memoryHash([context.episodeId, ref, source]).slice(0, 32);
  return source;
}

export type NarrationSegmentContext = {
  seed: string;
  episodeId: string;
  actors: Actor[];
  room?: Extract<ContinuityHolder, { kind: "room" }>;
  privateActorIds: string[];
  lines: VenueLine[];
  labels: Record<string, string>;
  positions(moment: { index: number; side: "before" | "after" }): Record<string, string>;
};

/** Scene and native resident Episodes bind the same exact routed segment evidence. */
export function bindNarrationSegment(
  ref: Extract<NarrationSource, { segment: string }>,
  context: NarrationSegmentContext,
  owner?: NarrationSourceOwner,
): ContinuityEvidence {
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
  const id = Object.hasOwn(context.labels, ref.segment) && context.labels[ref.segment];
  const index = context.lines.findIndex((line) => line.id === id),
    line = context.lines[index];
  memoryRequire(line && line.role === "assistant" && line.speakerId !== "player", "segment source was not supplied");
  if (owner?.holder.kind === "room")
    memoryRequire(
      owner.holder.placeId === context.room?.placeId && owner.holder.zoneId === line.zoneId,
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
    const ownWords = perceive?.kind === "private";
    memoryRequire(
      !perceive ||
        ["heard", "words", "sound-only"].includes(perceive.kind) ||
        (ownWords && perceive.by.length === 1 && perceive.by[0] === line.speakerId),
      "dialogue sources retain their actual communication channel",
    );
    source.kind = ownWords ? "private" : "speech";
    source.actorId = line.speakerId;
    for (const actorId of perceive?.by ?? [...new Set([...full, ...sound])]) {
      memoryRequire(
        context.actors.some((actor) => actor.id === actorId) && context.positions({ index, side: "after" })[actorId],
        "unknown segment recipient",
      );
      const words = full.includes(actorId) && perceive?.kind !== "sound-only";
      memoryRequire(
        words || (perceive?.kind !== "words" && line.soundOnly && (full.includes(actorId) || sound.includes(actorId))),
        "segment recipient was not routed that source",
      );
      source.perceptions.push({
        actorId,
        channel: ownWords ? "private" : words ? "words" : "sound-only",
        text: words ? line.content : line.soundOnly!.text,
      });
    }
  } else if (!perceive && owner?.holder.kind === "room") {
    source.kind = "observation";
  } else if (perceive) {
    memoryRequire(perceive.kind !== "words", "narration cannot grant heard words");
    source.kind = perceive.kind === "private" ? "private" : "observation";
    memoryRequire(
      perceive.kind !== "private" ||
        (perceive.by.length === 1 && perceive.by[0] !== "player" && context.privateActorIds.includes(perceive.by[0])),
      "private narration is only its actor's own perspective",
    );
    if (perceive.kind === "private") source.actorId = perceive.by[0];
    for (const actorId of perceive.by) {
      memoryRequire(
        context.actors.some((actor) => actor.id === actorId) &&
          context.positions({ index, side: "after" })[actorId] &&
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
  memoryRequire(!ref.act || source.kind === "speech", "only actual communication supports an offer decision");
  if (ref.act) source.act = ref.act;
  if (source.moment) source.positions = context.positions(source.moment);
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
