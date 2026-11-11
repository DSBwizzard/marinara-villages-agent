import { z } from "zod";
import { readStagingCues } from "../../../shared/helpers/scene-staging.js";
import { memoryRequire } from "./memory-integrity.js";
import { CONTINUITY_TEXT_BYTES, ROOM_CONTINUITY_TEXT_BYTES } from "./continuity.js";

const id = z.string().min(1).max(160),
  label = z
    .string()
    .regex(/^[A-Za-z][A-Za-z0-9_-]{0,47}$/)
    .refine((value) => value !== "self");
const ids = z
  .array(id)
  .max(32)
  .refine((rows) => new Set(rows).size === rows.length);
const act = z.enum(["offer", "accept", "refuse", "withdraw"]);
const moment = z.union([z.literal("start"), z.object({ before: label }).strict(), z.object({ after: label }).strict()]);
const ground = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("spoken"),
      to: ids,
      delivery: z.enum(["ordinary", "whisper", "shout"]).optional(),
      targetId: id.optional(),
      at: moment.optional(),
    })
    .strict(),
  z.object({ kind: z.literal("visible-action"), to: ids, at: moment.optional() }).strict(),
  z.object({ kind: z.literal("private"), at: moment.optional() }).strict(),
]);
export const narrationSourceSchema = z.union([
  id,
  z
    .object({
      input: z.string().min(1).max(4000),
      occurrence: z.number().int().positive().safe().optional(),
      ground: ground.optional(),
      act: act.optional(),
    })
    .strict(),
  z
    .object({
      segment: label,
      perceive: z
        .object({ kind: z.enum(["seen", "heard", "words", "sound-only", "private"]), by: ids.min(1) })
        .strict()
        .optional(),
      act: act.optional(),
    })
    .strict(),
]);
const sources = z.array(narrationSourceSchema).min(1).max(8);
export type NarrationSource = z.infer<typeof narrationSourceSchema>;
const segment = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("dialogue"),
      speakerId: id,
      text: z.string().min(1).max(2000),
      id: label.optional(),
      delivery: z
        .enum(["ordinary", "whisper", "shout"])
        .transform((kind) => (kind === "ordinary" ? undefined : kind))
        .optional(),
      targetId: id.optional(),
      presentation: z.literal("aside").optional(),
      staging: z.unknown().optional(),
      requires: z.array(label).max(48).optional(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("narration"),
      text: z.string().min(1).max(2000),
      id: label.optional(),
      sound: z
        .object({ sourceId: id, text: z.string().min(1).max(300), loud: z.literal(true).optional() })
        .strict()
        .optional(),
      staging: z.unknown().optional(),
      requires: z.array(label).max(48).optional(),
    })
    .strict(),
]);
const reply = z
  .object({
    segments: z.array(segment).max(24),
    keep: z.array(z.unknown()).max(32).optional(),
    commands: z.array(z.unknown()).max(16).optional(),
    halt: z
      .object({
        reason: z.enum(["time", "activity", "world", "structure", "authority"]),
        message: z.string().min(1).max(600),
        source: sources,
      })
      .strict()
      .optional(),
  })
  .strict();

/** Ordinary roleplay requires no input inventory or semantic bookkeeping. */
export function readNarrationReply(raw: unknown, actors: string[]) {
  const value = reply.parse(raw),
    labels = new Set<string>();
  memoryRequire(value.segments.length > 0 || value.halt, "Scene needs a reply or an explicit halt");
  memoryRequire(
    !value.halt || !(value.keep?.length || value.commands?.length),
    "halt cannot assert consequential effects",
  );
  const segments = value.segments.map((row, index) => {
    const localId = row.id ?? "segment-" + index;
    memoryRequire(!labels.has(localId) && row.text.trim().length > 0, "ambiguous Scene source label or empty prose");
    labels.add(localId);
    if (row.kind === "dialogue") {
      memoryRequire(
        row.speakerId !== "player" && actors.includes(row.speakerId),
        "Scene cannot invent a player or an actor's words",
      );
      memoryRequire(
        row.delivery !== "whisper" ||
          (row.targetId &&
            row.targetId !== row.speakerId &&
            (row.targetId === "player" || actors.includes(row.targetId))),
        "whisper needs its actual target",
      );
    }
    return { ...row, id: localId, staging: readStagingCues(row.staging, actors) };
  });
  return {
    segments,
    keep: value.keep ?? [],
    commands: value.commands ?? [],
    halt: value.halt,
    assertedDependencies: [...new Set(segments.flatMap((row) => row.requires ?? []))],
  };
}

const proposal = z
  .object({
    id: label.optional(),
    for: z.union([z.literal("room"), ids.min(1)]),
    text: z
      .string()
      .refine((value) => value.trim().length > 0 && Buffer.byteLength(value) <= ROOM_CONTINUITY_TEXT_BYTES)
      .nullable()
      .optional(),
    source: sources,
    replace: id.optional(),
    current: z.boolean().optional(),
    class: z
      .enum(["experience", "information", "perspective", "desire", "motivation", "commitment", "open-matter"])
      .optional(),
    about: ids.optional(),
    owner: id.optional(),
    parent: id.optional(),
    facet: z
      .enum(["reason", "attention", "approach", "connection", "stance", "expectation", "concern", "boundary"])
      .optional(),
    retire: z.enum(["fulfilled", "withdrawn", "ended"]).nullable().optional(),
    offer: z
      .object({ proposer: id, participants: ids.min(2) })
      .strict()
      .optional(),
    accept: id.optional(),
    closeOffer: z
      .object({ by: id, reason: z.enum(["refused", "withdrawn"]) })
      .strict()
      .optional(),
    visibility: z.enum(["observable", "concealed"]).optional(),
    knownBy: ids.optional(),
    expiresInMinutes: z.number().int().min(1).max(10080).optional(),
    protection: z
      .object({ roots: ids, disposition: z.enum(["clear", "conflict", "uncertain"]) })
      .strict()
      .optional(),
    independent: z.literal(true).optional(),
    requires: z.array(label).max(8).optional(),
  })
  .strict();
const effectHeader = z.object({
  id: label.optional(),
  independent: z.literal(true).optional(),
  requires: z.array(label).max(8).optional(),
});

export function readNarrationEffectHeader(raw: unknown, fallbackId: string) {
  const value = effectHeader.parse(raw);
  return { id: value.id ?? fallbackId, independent: value.independent, requires: value.requires ?? [] };
}

/** Parse each effect separately so an independent malformed proposal can retain precise diagnostics. */
export function readContinuityProposal(raw: unknown) {
  const value = proposal.parse(raw);
  memoryRequire(
    value.for === "room" || !value.text || Buffer.byteLength(value.text) <= CONTINUITY_TEXT_BYTES,
    "actor continuity text exceeds its bound",
  );
  memoryRequire(value.replace || !(value.accept || value.closeOffer), "an offer decision needs the supplied offer ID");
  memoryRequire(value.replace || typeof value.text === "string", "new continuity needs its complete text");
  memoryRequire(
    value.for === "room"
      ? value.current === undefined &&
          value.class === undefined &&
          value.about === undefined &&
          !value.parent &&
          !value.facet &&
          !value.offer &&
          !value.accept &&
          !value.closeOffer
      : value.visibility === undefined && value.knownBy === undefined && value.expiresInMinutes === undefined,
    "room and actor continuity cannot mix",
  );
  memoryRequire(value.text !== null || value.replace, "retirement without meaning needs a supplied target");
  memoryRequire(
    !value.retire || (value.current !== true && (value.replace || (value.for !== "room" && !value.offer))),
    "initial closure needs complete actor meaning and cannot remain current",
  );
  memoryRequire(!value.offer || !value.replace, "changed offer terms need a new offer");
  return value;
}

export const NARRATION_DIRECTION =
  "You are the GM of Villages, a persistent character-driven life game. Portray complete authored identities faithfully. Interpret freeform dialogue, actions, thoughts and narration naturally. Give the player room to answer; a short beat can be enough. Preserve resident initiative, agency, refusal and uncertainty. Never invent the player's words, thoughts, feelings, decisions, consent or travel. Private input is GM context, not a transcript that every character heard. Narration and presence alone are not evidence of character knowledge. New arrivals cannot hear earlier dialogue. A report establishes what was said, not objective truth. A promise is not completion. Meaningful lasting developments use keep; native mechanics use supplied commands and code-owned authority. Code retains witnessed access and circumstance outcomes; keep only further personal meaning. Ordinary conversation needs only segments. Never promise durable retention without its required keep or automatically retained native outcome. Do not announce a native success without the required command. Mark each consequential assertion's required keep/command IDs in that segment's requires. Only explicitly independent effects unrelated to successful fiction may use independent:true. Missing recalled context never proves historical absence.";
export const NARRATION_KEEP =
  'keep:[{id?:label,for:[actor IDs]|"room",text:complete meaning|null,source:[sources],replace?:supplied entry ID,current?:boolean,class?:"experience|information|perspective|desire|motivation|commitment|open-matter",about?:[actor IDs],owner?:actor ID,parent?:supplied entry ID,facet?:"reason|attention|approach|connection|stance|expectation|concern|boundary",retire?:"fulfilled|withdrawn|ended"|null,offer?:{proposer,participants:[actor IDs]},accept?:actor ID,closeOffer?:{by:actor ID,reason:"refused|withdrawn"},visibility?:"observable|concealed",knownBy?:[actor IDs],expiresInMinutes?:integer,protection?:{roots:[supplied protected root IDs],disposition:"clear|conflict|uncertain"},requires?:[effect IDs],independent?:true}]. One canonical complete meaning: max2400 UTF-8 bytes for an actor entry, max16000 for a complete room entry. Use at most eight distinct exact sources per effect. Use the string for:"room" for physical Room facts, without actor fields such as class, owner, current, or offers. Discussion and plans belong to the characters who know them. Complete conditions/terms belong in text once. Replace existing meanings only through supplied entry IDs, preserving unrelated content. Class describes meaning for books and recall. Use facet only with a supplied parent, never on a standalone keep. New perspectives, desires, motivations and unilateral commitments require owner, whose own state this is, among initial receiving holders; for lists actual knowers. Learning a wish does not make it your own. A new knower may explicitly use retire:null for a still-open account when fitted holders know different closure states; this cannot reopen an existing holder. Ownership is immutable, inherited on replacement and by facets; later disclosure may teach only new knowers without updating the absent owner. Mutual offers use participants instead of owner. Supplied pastSubjects, pastOwner, formerActors and unavailableParties identify earlier people; their history or consent never belongs to a replacement with the same ID. Current desires, motivations, commitments, concerns and boundaries guide resident initiative naturally. Completed desires retain their final meaning with retire and current:false. A newly expressed already-completed actor meaning may use the same fields on its single add with complete text; this cannot create a Room retirement or a mutual-offer decision. text:null still requires a supplied target; never invent a preceding entry. Source: exact supplied h: reference; {segment:label,perceive?:{kind:"seen|heard|sound-only|private",by:[actor IDs]},act?:"offer|accept|refuse|withdraw"}; {input:exact excerpt,occurrence?:positive integer,ground?:{kind:"spoken",to:[actor IDs],delivery?:"ordinary|whisper|shout",targetId?,at?:"start"|{before:label}|{after:label}}|{kind:"visible-action",to:[actor IDs],at?}|{kind:"private",at?},act?}; or "self" for a portrayed non-player\'s own perspective/desire/motivation/commitment. Use a timing anchor only when needed: start, {before:label}, or {after:label}. Exact input without ground is GM context only. Cite only consequential excerpts; never classify the complete submission. Private knowledge cited by h: reference cannot teach another character or establish room truth. Narration alone grants no observation; explicitly cite eligible observers. Sound-only evidence reveals no words or unseen speaker. An offer retains all exact conditions in text. For a new offer use offer without accept. Accept or close only a supplied unwithdrawn offer, using its ID as replace and citing the actual deciding words. Qualifications create a new offer. Refusal/withdrawal is unilateral; silence is not acceptance. Room keeps replace only affected complete entries; omission from context is not absence. Nonstructural decoration, rearrangement, repair and plausible damage need no owner permission; native structure/layout/purpose/services require Projects. Protected meanings are constraints, never sources: screen each consequential keep against all supplied protections; only clear may proceed. Do not restore forgotten meanings through paraphrase, input or self attribution.';
export const NARRATION_RESPONSE =
  'Return one JSON object {segments:[{kind:"dialogue",speakerId,text,id?,delivery?:"whisper|shout",targetId?,presentation?:"aside",staging?,requires?:[effect IDs]}|{kind:"narration",text,id?,sound?:{sourceId,text,loud?:true},staging?,requires?:[effect IDs]}],keep?:[],commands?:[],halt?:{reason:"time|activity|world|structure|authority",message,source:[exact sources]}}. No player segments or input inventory. Labels are unique ASCII identifiers up to48 characters; self and server historical aliases are reserved. Use exact admitted actor IDs, never names or shortened IDs. Give each cited segment its exact id in segments, and cite only those ids. Whisper requires the actual targetId; omit delivery for ordinary speech. Use plain narration for ambient sounds. The sound field needs an actual actor as sourceId. Max24 segments, each max2000 characters. Ordinary example: {"segments":[{"kind":"narration","text":"Rain taps the window."}]}. Grounded keep example: {"segments":[{"id":"tea","kind":"dialogue","speakerId":"resident-id","text":"I take my tea plain."}],"keep":[{"for":["resident-id","player"],"text":"The resident takes their tea plain.","class":"information","source":["tea"]}]}. Put any keep and commands inside the same JSON object before its final brace. Omit them when unused. A halt preserves an unsupported asserted outcome without rewriting it into an attempt; it cannot accompany consequential keep/commands. Return a small clarification or no segments with halt. Code owns time, routing, permissions, Projects and persistence.';
