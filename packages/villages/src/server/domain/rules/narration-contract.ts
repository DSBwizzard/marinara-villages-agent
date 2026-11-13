import { z } from "zod";
import { readStagingCues } from "../../../shared/helpers/scene-staging.js";
import { memoryRequire } from "./memory-integrity.js";
import {
  CONTINUITY_TEXT_BYTES,
  RELATIONSHIP_ANSWER_WORD_LIMIT,
  RELATIONSHIP_IMPACTS,
  ROOM_CONTINUITY_TEXT_BYTES,
  isRelationshipAnswer,
} from "./continuity.js";

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
export const NARRATION_SEGMENT_CHARACTERS = 2000;
const segmentText = z.string().min(1).max(NARRATION_SEGMENT_CHARACTERS);
export const residentReflectionSchema = z.object({ actorId: id, text: segmentText }).strict();
const segment = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("dialogue"),
      speakerId: id,
      text: segmentText,
      id: label.optional(),
      delivery: z
        .enum(["ordinary", "whisper", "shout"])
        .transform((kind) => (kind === "ordinary" ? undefined : kind))
        .optional(),
      targetId: id.optional(),
      presentation: z
        .enum(["aside", "main"])
        .transform((value) => (value === "main" ? undefined : value))
        .optional(),
      staging: z.unknown().optional(),
      requires: z.array(label).max(48).optional(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("narration"),
      text: segmentText,
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
      .enum([
        "experience",
        "information",
        "perspective",
        "desire",
        "motivation",
        "commitment",
        "open-matter",
        "viewpoint",
      ])
      // Older ordinary Scene instructions used "viewpoint" for the persisted perspective class.
      .transform((value) => (value === "viewpoint" ? "perspective" : value))
      .optional(),
    about: ids.optional(),
    owner: id.optional(),
    relationship: z
      .object({
        impact: z.enum(Object.keys(RELATIONSHIP_IMPACTS) as (keyof typeof RELATIONSHIP_IMPACTS)[]).optional(),
        romance: z.enum(["grows", "fades", "drops"]).optional(),
        answer: z
          .union([
            z
              .string()
              .trim()
              .min(1)
              .refine((value) => Buffer.byteLength(value) <= 320 && !/[\r\n]/.test(value)),
            z.array(z.unknown()).min(1).max(3),
          ])
          .optional(),
      })
      .strict()
      .refine((value) => value.impact !== undefined || value.romance !== undefined || value.answer !== undefined)
      .optional(),
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
  const { relationship, ...value } = proposal.parse(raw);
  const { answer: proposedAnswer, impact, romance } = relationship ?? {};
  const answer = Array.isArray(proposedAnswer) ? proposedAnswer.find(isRelationshipAnswer)?.trim() : proposedAnswer;
  memoryRequire(
    !Array.isArray(proposedAnswer) || answer || impact || romance,
    "no valid relationship answer candidate",
  );
  const text = Array.isArray(proposedAnswer) && !impact && !romance && value.text !== null ? answer : value.text;
  memoryRequire(
    value.for === "room" || !value.text || Buffer.byteLength(value.text) <= CONTINUITY_TEXT_BYTES,
    "actor continuity text exceeds its bound",
  );
  memoryRequire(value.replace || !(value.accept || value.closeOffer), "an offer decision needs the supplied offer ID");
  memoryRequire(value.replace || typeof text === "string", "new continuity needs its complete text");
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
  return {
    ...value,
    ...(text !== undefined ? { text } : {}),
    ...(relationship
      ? {
          relationship: {
            ...(impact ? { impact } : {}),
            ...(romance ? { romance } : {}),
            ...(answer ? { answer } : {}),
          },
        }
      : {}),
  };
}

export const narrationDirection = (nativeCommands: boolean, positions = false) =>
  `You are the GM of Villages, a persistent character-driven life game. Portray complete authored identities and independent residents. Interpret freeform speech, actions and thoughts naturally. Answer the player's latest contribution and advance the moment. ${positions ? "Keep turn length flexible. Give exploration or events the player is watching room to unfold. In dialogue or at an immediate choice, keep beats focused. End naturally when it's the player's turn to speak or act. A simple reply may be one line. Aim around 500 words for a developed exchange, with room to follow the scene and the player's writing guidance. Use one to four sentences per narration beat." : "Keep turn length flexible. A simple answer or immediate choice may take one line or action. Develop the relevant dialogue and action when the current exchange needs more room. Give exploration, daily routines, or events the player is watching room to unfold. End naturally when it's the player's turn to speak or act, or when a departure is complete."} Let the residents with something new to contribute speak. Adapt to the moment and the player's writing guidance. Leave recaps and repeated reactions in the history. The player supplies their own words, thoughts, actions, consent and travel. Respect the actual witnesses and private context. A report establishes what was said. A promise stays open until fulfilled. ${nativeCommands ? "Code retains witnessed native access and circumstance outcomes. Propose native actions with commands." : "Keep proposed native world changes as discussion or intentions until the game confirms them."}`;
export const RELATIONSHIP_DIRECTION =
  "In relationships, score is how warmly or negatively 'for' currently feels about 'about', from -100 to +100. Small scores color the interaction lightly; strong scores materially affect who the owner seeks out, how much they confide, and whether they offer help, keep distance, or try to repair things. Use the owner's known history, motives, and boundaries to decide which behavior fits. Warmth can be platonic; closeness gives no consent or access. romanticInterest is the owner's separate 0–20 attraction. A little can color banter or curiosity. Strong interest can motivate flirting, private time, a more personal letter or a date invitation when it fits their identity and history. Treat a person's answer and boundaries as binding on advances, even when feelings persist. Let the player express their own interest. When mutual interest is expressed, an ordinary meetup can become romantic. Give each Villager their own response to one-sided attraction. Each knows only what the other person has expressed or shown. A missing score leaves authored and played history to guide you. Treat scores as private GM context for the owner only. Never state the number or give another character knowledge of that feeling without evidence.";
export const RELATIONSHIP_KEEP =
  'For each exchange, compare each involved Villager’s attitude before and after the event. A real shift goes in one current perspective keep per direction with relationship:{impact}, owner, class:"perspective", current:true, and one about ID. Set for to [owner]. Cite the new witnessed action or words and optionally self for their private reaction. Clear reciprocation or a new willingness to seek someone out can count as "small-positive" when it changes warmth; repeating established warmth, gifts, or compliments earns no impact. Use "meaningful-positive" when demonstrated help or follow-through changes what the owner is willing to do or rely on. Use "turning-positive" for a change in what they fundamentally trust the person with, citing both today’s event and a distinct witnessed event from an earlier Village day via a fitted h:N alias. Use "small-negative" for a new step away, "meaningful-negative" for a concrete loss of willingness or trust, and "turning-negative" for a serious breach such as a credible threat, deliberate humiliation, or betrayal. Consider the owner’s actual reaction and the context. Code sets the points and daily limits. Omit impact when the exchange reinforces the existing attitude. In the same private keep, use relationship.romance only when witnessed interaction changes the owner\'s romantic attraction: "grows" for new or deeper attraction, "fades" for a real cooling, or "drops" for a marked loss. Warmth and attraction can change independently. Cite the subject\'s current words or an exact player action the owner actually saw, plus self for the owner\'s private reaction. Ordinary friendliness, repeated flirting, and a boundary by itself do not establish a change in attraction.';
export const SCENE_RELATIONSHIP_KEEP =
  'Use a private keep only for a real change in a resident’s feelings. Shape: {"for":["owner-id"],"owner":"owner-id","about":["subject-id"],"class":"perspective","current":true,"text":"what changed","source":[{"input":"exact player action","ground":{"kind":"visible-action","to":["owner-id"]}},"self"],"relationship":{"impact":"small-positive"},"independent":true}. Cite the subject’s witnessed words or action and the owner’s reaction. Warmth impact is small, meaningful or turning, positive or negative (for example "meaningful-negative"). Turning-positive also cites a distinct witnessed earlier day. Turning-negative needs a severe breach such as a credible threat or betrayal. Set relationship.romance to "grows", "fades", or "drops" only when attraction changes. Routine friendliness and repeated flirting stay in the transcript.';
export const RELATIONSHIP_ANSWER_STYLE = `Each line answers “What do you think of me?” directly in that Villager’s voice. Give each line one thought about the player in one sentence. Aim for 6–12 words, with a hard maximum of ${RELATIONSHIP_ANSWER_WORD_LIMIT}. Check each line on its own. This is for the Relationships view. Leave out unrelated private facts.`;
export const RELATIONSHIP_ANSWER = `For each Villager listed in relationshipAnswersDue whom you portray, put three alternative lines in relationship.answer as an array of strings. The game will show one. ${RELATIONSHIP_ANSWER_STYLE} Use class:"perspective", current:true, owner, for:[owner], about:["player"], source:["self"], independent:true. For an answer alone, the game uses the chosen line as text. If the same exchange changes the owner’s attitude, combine answer and impact in that keep, provide text describing the change, and cite the current witnessed source. Keep the answer outside dialogue. Omit relationship.answer for unlisted Villagers.`;
export const NARRATION_KEEP =
  'keep:[{id?:label,for:[actor IDs]|"room",text:complete meaning|null,source:[sources],replace?:supplied entry ID,current?:boolean,class?:"experience|information|perspective|desire|motivation|commitment|open-matter",about?:[actor IDs],owner?:actor ID,parent?:supplied entry ID,facet?:"reason|attention|approach|connection|stance|expectation|concern|boundary",retire?:"fulfilled|withdrawn|ended"|null,offer?:{proposer,participants:[actor IDs]},accept?:actor ID,closeOffer?:{by:actor ID,reason:"refused|withdrawn"},visibility?:"observable|concealed",knownBy?:[actor IDs],expiresInMinutes?:integer,protection?:{roots:[supplied protected root IDs],disposition:"clear|conflict|uncertain"},requires?:[effect IDs],independent?:true}]. One canonical complete meaning: max2400 UTF-8 bytes for an actor entry, max16000 for a complete room entry. Use at most eight distinct exact sources per effect. Use the string for:"room" for physical Room facts, without actor fields such as class, owner, current, or offers. Discussion and plans belong to the characters who know them. Complete conditions/terms belong in text once. Replace existing meanings only through supplied entry IDs, preserving unrelated content. Class describes meaning for books and recall. Use facet only with a supplied parent, never on a standalone keep. New perspectives, desires, motivations and unilateral commitments require owner, whose own state this is, among initial receiving holders; for lists actual knowers. Learning a wish does not make it your own. A new knower may explicitly use retire:null for a still-open account when fitted holders know different closure states; this cannot reopen an existing holder. Ownership is immutable, inherited on replacement and by facets; later disclosure may teach only new knowers without updating the absent owner. Mutual offers use participants instead of owner. Supplied pastSubjects, pastOwner, formerActors and unavailableParties identify earlier people; their history or consent never belongs to a replacement with the same ID. Current desires, motivations, commitments, concerns and boundaries guide resident initiative naturally. Completed desires retain their final meaning with retire and current:false. A newly expressed already-completed actor meaning may use the same fields on its single add with complete text; this cannot create a Room retirement or a mutual-offer decision. text:null still requires a supplied target; never invent a preceding entry. Source: exact supplied h: reference; {segment:label,perceive?:{kind:"seen|heard|sound-only|private",by:[actor IDs]},act?:"offer|accept|refuse|withdraw"}; {input:exact excerpt,occurrence?:positive integer,ground?:{kind:"spoken",to:[actor IDs],delivery?:"ordinary|whisper|shout",targetId?,at?:"start"|{before:label}|{after:label}}|{kind:"visible-action",to:[actor IDs],at?}|{kind:"private",at?},act?}; or "self" for a portrayed non-player\'s own perspective/desire/motivation/commitment. Use a timing anchor only when needed: start, {before:label}, or {after:label}. Exact input without ground is GM context only. Cite only consequential excerpts; never classify the complete submission. Private knowledge cited by h: reference cannot teach another character or establish room truth. Narration alone grants no observation; explicitly cite eligible observers. Sound-only evidence reveals no words or unseen speaker. An offer retains all exact conditions in text. For a new offer use offer without accept. Accept or close only a supplied unwithdrawn offer, using its ID as replace and citing the actual deciding words. Qualifications create a new offer. Refusal/withdrawal is unilateral; silence is not acceptance. Room keeps replace only affected complete entries; omission from context is not absence. Nonstructural decoration, rearrangement, repair and plausible damage need no owner permission; native structure/layout/purpose/services require Projects. Protected meanings are constraints, never sources: screen each consequential keep against all supplied protections; only clear may proceed. Do not restore forgotten meanings through paraphrase, input or self attribution.';
export const SCENE_NARRATION_KEEP =
  'A lasting change uses keep:[{id?,for:[actual knower IDs] or "room",text,source:[exact evidence],class?,about?:[actor IDs],owner?,replace?,current?,parent?,facet?,retire?,offer?,accept?,closeOffer?,visibility?,knownBy?,expiresInMinutes?,protection?,requires?,independent?}]. Record one complete meaning, including all terms. Use class experience, information, perspective, desire, motivation, commitment or open-matter. Perspectives, desires, motivations and unilateral commitments need their actual owner among the knowers. Use "room" only for physical Room facts, with no actor fields. Use supplied IDs to replace entries or attach facets to a parent. Preserve ownership, existing terms, and unrelated Room facts. A fulfilled, withdrawn or ended meaning can retire with current:false. A mutual offer uses {proposer,participants}; For a decision, use the exact open entry ID as replace and cite the current deciding words in source. Use accept:actorId or closeOffer:{by,reason:"refused|withdrawn"}. Qualified consent is a new offer. Private knowledge cannot teach a new knower. Forget/Correct constraints screen each affected keep with protection:{roots,disposition:"clear|conflict|uncertain"}. Only clear can publish. Never resurrect protected meanings or assign past identities to a replacement.\n' +
  'Cite a supplied h: reference, a dialogue segment ID, or {segment:label,perceive:{kind:"seen|words|sound-only|private",by:[actual witnesses]},act?:"offer|accept|refuse|withdraw"}. For the player\'s exact words or action use {input:exact excerpt,ground:{kind:"spoken",to:[actual listeners],delivery?:"whisper|shout",targetId?,at?:"start"|{before:label}|{after:label}},act?:"offer|accept|refuse|withdraw"}. Use kind:"visible-action" with to for visible actions and kind:"private" for private thoughts. Add occurrence only for repeated exact text. On a moving turn use ground.at for every consequential excerpt. An exact excerpt without ground stays GM context. For a private whisper cite the actual whispered input with delivery and target, rather than treating a narration or public reply as its evidence. "self" is for a portrayed non-player\'s own private state. Include the keep ID in a segment that asserts it succeeded.';
export const ordinarySceneKeep = (positions: boolean) =>
  'The transcript preserves suggestions, observations, and agreement about what is true or how something should be done. Use keep only for a request to remember or a lasting change. A commitment requires a specific future action someone explicitly promises to do. Give each promise one owner and cite that person’s words. An enduring boundary or changed physical fact can also merit a keep. Every keep includes for as an array of actual knower IDs (even one), or "room" for physical facts. Include text (complete terms), source (exact evidence), and class: experience, information, perspective, desire, motivation, commitment or open-matter. Perspectives, desires and motivations also need their owner and that owner’s evidence. For an update, copy its supplied entry ID into replace. Use independent:true only when the prose stays true if the keep is declined.\n' +
  'For a new mutual offer include {"for":["resident-id","player"],"text":"complete terms","class":"commitment","offer":{"proposer":"resident-id","participants":["resident-id","player"]}} with source from the proposer’s actual offer. Omit owner. ' +
  (positions
    ? 'For current dialogue prefer source:[{"speakerId":"resident-id","quote":"exact distinctive words from one line"}]. Code locates that speaker’s line. Include act:"offer" for the proposer’s offer. For narration use {segment:2}, counting all segments from 1. Use a supplied h: alias for history or "self" for the resident’s own private state.'
    : 'Use source:[{segment:"the-id",act:"offer"}] for an offer. For other keeps cite an exact current segment ID, an exact supplied h: alias, or "self" for a resident’s own private state.') +
  ' For player input give the exact excerpt with ground: spoken to actual listeners, visible-action to actual observers, or private. A whisper needs delivery and targetId. For a repeated excerpt add occurrence. When positions change set ground.at to "start", ' +
  (positions ? "{before:2}, or {after:2}." : '{before:"the-id"}, or {after:"the-id"}.');
export const SCENE_OFFER_DECISION =
  'Record an explicit decision on an open offer once. Several privateContinuity rows can show the same offer to its different knowers. Choose one fitted entry ID for replace. Keep the terms by omitting text. Example for a player accepting aloud: {"replace":"h:1","for":["player","resident-id"],"accept":"player","source":[{"input":"Yes, I accept.","ground":{"kind":"spoken","to":["player","resident-id"]},"act":"accept"}]}. Copy the actual deciding words and use actual hearers. For a resident deciding, cite their dialogue with act. Refusal or withdrawal uses closeOffer:{by,reason:"refused"|"withdrawn"} with the matching act. Qualified consent is a new offer. Silence leaves it open.';
export const narrationResponse = (nativeCommands: boolean, positions = false) =>
  'Return one complete JSON object beginning with {"segments":[. Put prose in text strings, escaping quotes and line breaks. Example: {"segments":[{"kind":"narration","text":"Rain taps the window."},{"kind":"dialogue","speakerId":"resident-id","text":"Come sit by the fire."}]}\n' +
  `Copy speakerId from the current Scene's dialogueSpeakers${nativeCommands ? " or the local key of a supporting character introduced by a command in this reply" : ""}. The player supplies their own words. Omit delivery and targetId for ordinary speech. For a whisper use "delivery":"whisper" and the actual recipient’s ID as targetId, or "player" if they receive it. For a shout use "delivery":"shout". Use "presentation":"aside" for an aside. Either segment kind may include staging. Code routes witnesses.\n` +
  `Omit unused fields. Add a keep array${nativeCommands ? " or commands array" : ""} only for a consequential effect. ${nativeCommands ? "When the action must pause, add halt with reason (time, activity, world, structure, or authority), message, and a source array. A halt may carry clarification prose and has no effects." : "Use halt with reason (time, activity, world, structure, or authority), message, and source only when an established constraint blocks the submitted action. A resident can decline or end their part in the conversation through prose. A halt has no effects."}\n` +
  (positions
    ? "Give cited effects fresh IDs starting with a letter, using letters, digits, underscores, or hyphens, up to 48 characters. Code assigns line IDs."
    : "Give cited segments and effects fresh IDs, starting with a letter and using letters, digits, underscores, or hyphens, up to 48 characters. In a source array, cite a current segment by its exact id or a historical h: alias as a string.") +
  " Dialogue and narration have no source field. Use requires only when the prose asserts an effect succeeded, listing exact effect IDs declared in this reply. Mark an optional effect independent:true only when the prose remains true if it is declined.";
