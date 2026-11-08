import type { SemanticIntent } from "../models/semantic-model.js";
import { asRecord } from "./coerce.js";
import { badGateway } from "./errors.js";
import { neutralRelationship, relationshipKey } from "./relationship-rules.js";
import { materializePlayerSpeech } from "./player-speech-capture.js";
import { semanticContext } from "./semantic-contract.js";
import type { sceneWritingHistory } from "./scene-writing-history.js";
import { sceneEvidencePerception } from "./scene-evidence-perception.js";
import type { MemoryCandidate } from "../models/memories.js";
import { memoryHash } from "./memory-integrity.js";

/** Narrative read view; write guards and canonical source bindings stay in the captured context. */
export function sceneGmMemory(row: MemoryCandidate) {
  return {
    id: row.id,
    ...(row.rootId !== row.id ? { rootId: row.rootId } : {}),
    kind: row.kind,
    text: row.text,
    subjects: row.subjects,
    occurredAt: row.occurredAt,
    ...(row.domainRef ? { domainRef: row.domainRef } : {}),
    ...(row.corrects ? { corrects: row.corrects } : {}),
    ...(row.resolves ? { resolves: row.resolves } : {}),
    knowers: Object.fromEntries(
      Object.entries(row.knowers).map(([id, state]) => [
        id,
        {
          basis: state.repair ? "player-repaired" : state.basis,
          ...(state.attributedTo ? { attributedTo: state.attributedTo } : {}),
          ...(state.disclosed && !state.repair ? { disclosed: state.disclosed } : {}),
        },
      ]),
    ),
  };
}

/** Only exact, fully witnessed, unmodified own-Scene evidence can replace duplicate recall. */
export function sceneMemoryHistorySources(
  row: MemoryCandidate,
  sceneId: string,
  blocks: readonly import("./venue-writing.js").VenueWritingBlock[],
  targetIds: readonly string[],
  projected: ReturnType<typeof sceneWritingHistory>["rows"],
) {
  if (
    targetIds.includes(row.id) ||
    targetIds.includes(row.rootId) ||
    row.corrects ||
    row.resolves ||
    row.kind === "open-matter"
  )
    return [];
  const sources = new Set<string>();
  for (const [id, state] of Object.entries(row.knowers)) {
    if (state.repair || state.learnedVia || !["report", "observation"].includes(state.basis) || !state.support.length)
      return [];
    for (const support of state.support) {
      if (support.source.sceneId !== sceneId || support.source.kind !== "scene") return [];
      if (
        !projected.some(
          (line) =>
            line.id === support.lineId &&
            line.text.includes(support.excerpt) &&
            (id === "player" ? line.playerPerception === "full" : line.heardBy.includes(id)),
        )
      )
        return [];
      const block = blocks.find((block) => block.evidence?.some((line) => line.id === support.lineId));
      if (!block) return [];
      sources.add(block.text);
    }
  }
  return [...sources];
}

/** Empty collections are implicit in model data, never in saved state or write proposals. */
export function compactSceneRead(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(compactSceneRead);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .map(([key, item]) => [key, compactSceneRead(item)])
      .filter(([, item]) => !item || typeof item !== "object" || Object.keys(item).length > 0),
  );
}

/** Decode compact replies before alias resolution; downstream authority contracts stay unchanged. */
export function expandGmSegments(raw: Record<string, unknown>, writingVersion = 7) {
  if (!Array.isArray(raw.segments)) return raw;
  return {
    ...raw,
    segments: raw.segments.map((value) => {
      if (
        writingVersion >= 8 &&
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        Object.hasOwn(value, "s")
      ) {
        if (
          Object.getPrototypeOf(value) !== Object.prototype ||
          Object.keys(value).some(
            (key) => !["s", "text", "delivery", "presentation", "targetId", "sound"].includes(key),
          )
        )
          throw badGateway("The compact Scene segment is malformed. Your draft is preserved.");
        const { s, text, ...options } = value;
        value = [s, text, ...(Object.keys(options).length ? [options] : [])];
      }
      if (!Array.isArray(value)) return value;
      const [speakerId, text, options] = value;
      if (
        value.length < 2 ||
        value.length > 3 ||
        (speakerId !== null && typeof speakerId !== "string") ||
        typeof text !== "string" ||
        (options !== undefined &&
          (!options ||
            typeof options !== "object" ||
            Array.isArray(options) ||
            Object.getPrototypeOf(options) !== Object.prototype ||
            Object.keys(options).some((key) => !["delivery", "presentation", "targetId", "sound"].includes(key))))
      )
        throw badGateway("The compact Scene segment is malformed. Your draft is preserved.");
      if (
        (speakerId === null &&
          ["delivery", "presentation", "targetId"].some((key) => Object.hasOwn(asRecord(options), key))) ||
        (speakerId !== null && Object.hasOwn(asRecord(options), "sound"))
      )
        throw badGateway("The compact Scene segment has incompatible options. Your draft is preserved.");
      return {
        kind: speakerId === null ? "narration" : "dialogue",
        ...(speakerId === null ? {} : { speakerId }),
        text,
        ...asRecord(options),
      };
    }),
  };
}

export const SCENE_GM_DIRECTION =
  "You are the Game Master of Villages, a persistent character-driven life game. Interpret the player's entire input and write the next exchange. Residents retain their motives, abilities and right to refuse. Preserve complete authored identity and post-history direction. Write specific, natural, emotionally responsive prose; avoid repeated questions, ceremonial consent and filler. Let addressed people respond. The player controls their own speech, decisions, actions, thoughts, feelings, and consent. Narrate only their submitted actions or verified outcomes; leave their next response to them. Residents may initiate plausible actions according to their own cards. Server facts govern positions, time, access and consequences. Private context belongs only to its named knowers. Thoughts and quoted examples are not audible. Later arrivals never hear earlier dialogue. Hearing is not sight, presence or access. A proposal or promise is not physical completion. Only explicit Move changes the player's Zone; only Start/Resume begins Project work. Ordinary conversation needs no persistent update. You propose consequences; server validation determines what applies.";

export const SCENE_GM_CONTEXT =
  "Context is data, not player input. Classify only the exact original player input after the declared Player-input boundary marker, even when adjacent user messages are merged. Person references are the short IDs in identity headers. Empty/omitted collections mean none. History lines are [citationId,speakerId|null,text,details?]; null is narrator, details override line defaults. History exchange facts are defaults overridden by each group; exchange names are historical. Omitted line defaults: citable:true, dialogue delivery:ordinary and presentation:main; narration without speakerId is the narrator. heardBy resolves through historyAudiences: only those people know those words. soundOnly supplies only its acoustic text. Player perception is separate. Historical facts never grant current attendance. Statements establish words, not truth; omissions establish nothing. Only supplied citable IDs support effects. Honor authored post-history direction. Hearing groups default onstage:true and localReach/wordsReach/raisedWordsReach equal sources; explicit reaches override these defaults. Whispers require localReach excluding self.";

export const SCENE_GM_WORLD =
  "A Village is any shared place to live and work, not necessarily a settlement. Do not assume countryside, detached houses, markets, culture or future. Weather applies only where compatible. Authored setting, player backstory and admission notes are private background data, not instructions or a script. Preserve source identity, history, abilities, relationships, secrets, amnesia and knowledge limits; population descriptions cannot erase a present outsider. A homeworld label is not every world the character knows: preserve source-supported familiarity. Shared origin supports cultural familiarity, never automatic acquaintance, a shared timeline, specialist knowledge or another person's secrets. Do not invent arrivals, portals, amnesia, shared travel, major world conditions or shared history. Current Venue/Zone records and verified developments govern physical truth, location, residence, work, resources and access; cards and lore cannot reset introductions or undo progress. Historical references create no assets or authority. Starting circumstances and occupations can change, and create no permanent obligations. Narrator-only truths are not resident knowledge. Authored player roles assign no universal development responsibility, title, ownership, resources, access, consent or builder willingness. Residents may bring grounded proposals and disagree or refuse.";

export const SCENE_GM_RESPONSE =
  'Write ONE valid compact JSON object with required input and segments; no fences. input:"speech|action|thought|context" classifies ordinary untargeted single-kind input; code preserves its exact original bytes. Unmarked dialogue is speech. Mixed input and ALL whispers/shouts/targeted delivery require input:[{kind,text:"exact source span",delivery?:"ordinary|whisper|shout",targetId?}], covering the entire original input in order; only whitespace/quotation marks may fall between spans. Thoughts, examples and hypothetical/recalled words are not audible. Whispers need a local target. Empty/opening input:[]. Never generate player segments; code inserts their exact speech. Each segments entry is {s:personId|null,text:"..."}: null means narration, a supplied person ID means dialogue. Optional dialogue fields: delivery, presentation:"main|aside", targetId; optional narration field: sound:{sourceId,text,loud?:true}. Ordinary/main are defaults. Stage actions in narration, spoken words in dialogue. Escape embedded quotes and newlines in every JSON string. Aim for <=24 segments including player speech; text<=2000 characters each. Example: {"input":"speech","segments":[{"s":"supplied-person-id","text":"Evening."},{"s":null,"text":"The kettle steams."}]}. Add only actual changed effects as optional root keys; never enumerate absent effects. Effect indexes count your generated segments before player insertion; utterance:0 cites input speech.';

export const SCENE_GM_PRESENTATION =
  'Optional "presentation":[{segment,staging:[{characterId,expression?,look?:{target:"player"}|{target:"villager",characterId}|{target:"direction",direction:"left|right"}}]}]. Exact root key is presentation. Use supplied expression IDs and changed cues only. Cues grant no actions, hearing, positions or consent.';

export const SCENE_GM_MEMORY =
  'Use memoryChanges as the single path for lasting conversational learning, including personal disclosures. Routine dialogue remains in Scene history; do not duplicate chatter or already represented facts. memoryChanges:[{text,subjects:[ids],support:[{lineId,excerpt:"exact <=320-byte quote"}],learners:{personId:{basis:"observation|report|interpretation",attributedTo?,support?:[],disclosed?:{savedField:value}}},action?:"create|reinforce|correct|resolve",kind?:"information|experience|open-matter",target?:{id},domainRef?:{kind:"wish|project|relationship|physical",id?,characterId?},screening:{disposition:"clear|conflict|uncertain",protectedRoots?:[ids]}}]. Defaults: create, information. text<=600 UTF-8 bytes. Shared support applies only to named learners; use learner-specific support for exceptions, 1-2 quotes each. lineId is a generated segment index, player, or supplied history reference. Learners must perceive their evidence; subjects do not automatically learn. Reports establish claims, not truth; code binds their actual cited speaker. Optional attributedTo must match. Omit excerpt only when the entire cited line is <=320 UTF-8 bytes; code uses that complete line. Longer lines need an exact bounded excerpt. Interpretations may be wrong. For player learning about a person use domainRef:{kind:"relationship",characterId:speakerId} and learners.player.disclosed:{kind:"explanation|preference|boundary|routine|history|connection|home|work",toId:personDescribed}; home/work must describe the speaker. For player Wish learning use its supplied Wish id/characterId and only the title/status actually spoken. Never infer private/forgotten values. Reinforce uses action/target/support/learners/screening only: omit text, kind and subjects. Correct and resolve require explicit kind, text and subjects; correct the canonical root, resolve an open matter. Screen proposals against administrative roots; conflict/uncertain is rejected individually. Code records committed mechanical outcomes, source hashes and revisions; do not predict receipts or write mechanical Memories.';

export const SCENE_GM_PHYSICAL =
  'Optional action:{happened:true,segment,actorIds:[],consent:[{actorId,segment?,lineId?,quote?}],appearanceChanged:boolean,edits:[{before,after}],append?,recent?:{text,renew?},dayNight?,conditionClears?:[{id,expectedRevision}]}. Cite completed local action narration; only present actors and available supplies. Each nonacting controller needs actual consent: current speech segment or exact supplied earlier line perceived by actors; player uses segment:"player",quote:"exact input". Preserve conditions/withdrawals; access permits ordinary temporary use, not enduring edits. No promises, remote deeds, invented supplies or object/quantity accounting. Code binds current Zone/revision and narration. Description max4000: unique exact edits (empty after removes) and/or append, preserving unrelated physical facts; unfinished work stays in description. recent is a complete <=600-character paragraph, empty clears; renew:true only for deliberate maintenance/reestablishment of the whole retained arrangement, never mere mention. appearanceChanged means a meaningful visible enduring change, not tiny details/rewording/recent-only activity. With enduring description edits include dayNight:true when daylight/outdoor views visibly distinguish day/night; false only for established constant lighting or permanent light/darkness; default true if uncertain, invent no windows and respect the setting. Clear only supplied conditions whose complete remedy actually occurs; keep all other restrictions. Omit action when nothing changes.';

export const SCENE_GM_EVENTS =
  'Optional events:{moves:[{characterId,zoneId,segment}],departures:[{source}],contactEnd:[{source}],residenceRequest?:{source,venueId},residenceDecision?:{source,characterId,approved},venueRequest?:{source,name,classes:["workplace|community|other"]},sceneEnded?:{source}}. moves cite a narration segment establishing a completed permitted resident crossing, never a door opening or a player crossing. Distinct people and destinations stay distinct. A source is the full spoken segment that establishes the event. No silent consent, hidden arrivals or earlier witnesses. Supporting people have native Memories, never Villager Wishes, relationship graphs or builder roles. Optional placeDiscoveries and establishmentProgress cite actual witnessed disclosures/outcomes, never invented resources or promises. Also return immediateResidentMoves:[{characterIds:[ids],zoneId,source:zero-based INPUT span index}] for immediate resident movement REQUESTS in the original input, including the entire requested local group, even if your reply moves fewer or none. Exclude future, hypothetical, negated and player-only travel. These source indexes refer to input, never generated segments; code checks group availability.';

export const SCENE_GM_ACCESS =
  'Optional access:[{actorId,venueId,zoneId,outcome:"invite-now|invite-later|refuse|dismiss|ban-zone|ban-venue|invite-outside-hours|access-management|unresolved",evidence:[segment],accompanies?,conditions?:["accompanied"],command?}]. Cite actual current controller consent/refusal. Visits grant no residency or standing access. Preserve conditions; unsupported conditions use unresolved. accompanies means the controller goes too. access-management needs command:{action,...fields}: venue-policy:{managerIds,visitorHours}; zone-policy:{policy}; recover-managers:{managerIds}; ban:{visitorId}; lift-ban:{banId}; revoke:{permissionId}; exception:{permissionId,banIds}; destinations:{visitorId,home?,sleep?,work?}. Use supplied scope/IDs; code binds revisions/operation IDs. Entrance is Unrestricted. No policy changes inferred from friendship, employment or guest admission. Standing grants/revocations: relationshipChanges.permissions[{controllerId,visitorId,venueId,zoneId,action:"grant|revoke",expectedRevision,lineIds}].';

export const SCENE_GM_PROJECTS =
  'Optional projectSpeech:[{projectId,kind:"approval|builder|withdrawal",speakerId,citations:[{segment}]}]. Approve only supplied current design terms. Preserve conditions/negation in full cited speech. Design approval and willingness to build are independent; both can occur together. Only Villagers lead physical work; supporting controllers may approve their scope. Withdrawal is immediate. Speech never starts/resumes/completes work. Social establishment needs actual witnessed outcomes, not promises.';

export const SCENE_GM_SOCIAL =
  'Optional relationshipChanges:{changes:[{fromId,toId,patch:{connection?,stance?,expectations?:[],concerns?:[],records?:[]},lineIds:[segment],reason}],intentions:[],permissions:[]}. Only residents own perspectives/intentions; never player feelings. Patch meaningful changes only. Records:{id:"existing or empty",expectedRevision,kind:"history|declaration|boundary|agreement|commitment",text,participants:[],status:"stated|proposed|accepted|fulfilled|cancelled|overdue",dueAt?:"explicit ISO deadline"}. Preserve immutable terms; mutual agreement requires each participant\'s assent. History is stated without deadline. Intentions:{actorId,expectedRevision,lineIds:[],items:[{id,targetIds:[],text,reason,status:"active|retired|attempted"}]}; max3 active, retain meaningful unattempted intentions. Conversational disclosures belong only in memoryChanges, never a second disclosure list.';

export const SCENE_GM_WISHES =
  'Optional wishChanges:[{actorId,wishId,intent:"create|reveal|clarify|approach|attention|progress|fulfilled|withdrawn",evidence:[segment],reason:"short reason",desire?:{wish,reason},condition?,quote?,approach?,attention?:{state:"background|foreground",reason},supersedes?,disclosedStatus?,statusQuote?}]. Use supplied Wishes only; create uses a source-local "new:label" ID and desire. Interpret actual outcomes against ALL exact conditions; intent/promise is not fulfillment. Meaningful witnessed progress may fall short of fulfillment. Preserve owner agency, refusals and changed conditions; no automatic completion from time or attention. Only actual disclosed words teach player the title/status, with exact quote/statusQuote. Private context is never disclosure. Omit unchanged Wishes.';

export const SCENE_GM_BOUNDARY =
  'Optional halt:{reason:"none|time|activity|condition|world",source:"player|draft",quote:"exact source substring",appointments:[{source:"player|draft",quote,date:"YYYY-MM-DD",minute:0-1439|null}]}. Appointments live INSIDE halt, never at root; use reason:"none",quote:"" for scheduling alone. Null minute means no exact time. Resolve relative dates from supplied calendar; code checks whether past. Player quotes bind to original input, draft quotes to generated text. Preserve attempts/hypotheticals; never disguise unsupported asserted outcomes as failed actions, dreams or dialogue. No unsupported death/resurrection, permanent incapacity, time travel, calendar rewrite or large time skip. Ordinary local actions and compatible powers are allowed. A halt may have segments:[].';

/** Explicit model view: new storage fields never become prompt data by default. */
export function sceneGmContext(
  context: ReturnType<typeof semanticContext>,
  includedHistory: ReturnType<typeof sceneWritingHistory>["rows"] = [],
) {
  const { history, actors } = context;
  const live = asRecord(context.social.live);
  const calendar = context.preservation.calendar;
  const access = asRecord(context.access);
  const permissions = (Array.isArray(access.permissions) ? access.permissions : [])
    .map(asRecord)
    .filter((row) => !row.revoked && (row.duration === "standing" || !row.sceneId || row.sceneId === context.sceneId))
    .map(({ id, zoneId, visitorId, issuerId, duration, sceneId, accompaniedBy, outsideHours }) => ({
      id,
      zoneId,
      visitorId,
      issuerId,
      duration,
      sceneId,
      accompaniedBy,
      outsideHours,
    }));
  const bans = (Array.isArray(access.bans) ? access.bans : [])
    .map(asRecord)
    .filter((row) => row.active)
    .map(({ id, zoneId, visitorId, issuerId }) => ({ id, zoneId, visitorId, issuerId }));
  return {
    time: {
      calendar,
      ...(context.time?.capturedAt && context.time.capturedAt !== calendar.instant
        ? { capturedAt: context.time.capturedAt }
        : {}),
      ...(context.preservation.sceneAt !== calendar.instant ? { sceneAt: context.preservation.sceneAt } : {}),
      ...(context.preservation.chosenAt !== calendar.instant ? { chosenAt: context.preservation.chosenAt } : {}),
    },
    worldFacts: context.worldFacts.filter(
      (summary) =>
        !context.zones.some((zone) =>
          zone.circumstances?.some((row) => row.scope === "village" && row.summary === summary),
        ),
    ),
    zoneId: context.zoneId,
    possibleMemoryEffects: context.possibleMemoryEffects,
    history: history.length
      ? history.flatMap((line) => {
          const covered = includedHistory.some(
            (row) =>
              row.id === line.id &&
              row.text === line.content &&
              row.speakerId === (line.role === "user" ? "player" : line.speakerId) &&
              row.kind === line.kind &&
              JSON.stringify(row.heardBy) === JSON.stringify(line.heardBy) &&
              [
                "name",
                "at",
                "zoneId",
                "delivery",
                "presentation",
                "targetId",
                "staging",
                "physicalIdsAfter",
                "soundOnly",
              ].every(
                (key) =>
                  JSON.stringify(row[key as keyof typeof row]) === JSON.stringify(line[key as keyof typeof line]),
              ),
          );
          if (covered) return [];
          return [
            {
              id: line.id,
              name: line.name,
              at: line.at,
              zoneId: line.zoneId,
              delivery: line.delivery,
              presentation: line.presentation,
              targetId: line.targetId,
              staging: line.staging,
              physicalIdsAfter: line.physicalIdsAfter,
              soundOnly: line.soundOnly,
              ...sceneEvidencePerception(line),
              speakerId: line.role === "user" ? "player" : line.speakerId,
              kind: line.kind,
              content: line.content,
              heardBy: line.heardBy,
              visibleToPlayer: !line.contactHidden,
            },
          ];
        })
      : undefined,
    actors: actors
      .map(({ id, name, wishes }) => ({
        id,
        name,
        wishes: wishes.map((wish) => ({
          id: wish.id,
          wish: wish.wish,
          reason: wish.reason,
          status: wish.status,
          origin: { kind: wish.origin.kind },
          attention: wish.attention,
          approach: wish.approach,
          conditions: wish.conditions.map(({ id, quote, at }) => ({ id, quote, at })),
          history: wish.history
            .filter(
              (row, index, all) =>
                row.lineIds.length > 0 ||
                (all.findLastIndex(
                  (other) => !other.lineIds.length && other.kind === row.kind && other.text === row.text,
                ) === index &&
                  (!["reflection", "attention"].includes(row.kind) ||
                    all.findLastIndex((other) => !other.lineIds.length && other.kind === row.kind) === index)),
            )
            .map(({ at, kind, text }) => ({ at, kind, text })),
        })),
      }))
      .toSorted((a, b) => a.id.localeCompare(b.id)),
    access: context.access
      ? {
          revision: access.revision,
          managerIds: access.managerIds,
          visitorHours: access.visitorHours,
          permissions,
          bans,
          exceptions: (Array.isArray(access.exceptions) ? access.exceptions : [])
            .map(asRecord)
            .filter(
              (row) =>
                permissions.some((grant) => grant.id === row.permissionId) &&
                Array.isArray(row.banIds) &&
                row.banIds.some((id) => bans.some((ban) => ban.id === id)),
            )
            .map(({ id, banIds, permissionId, issuerId }) => ({ id, banIds, permissionId, issuerId })),
          visitDenials: (Array.isArray(access.visitDenials) ? access.visitDenials : [])
            .map(asRecord)
            .filter((row) => row.sceneId === context.sceneId)
            .map(({ zoneId, visitorId, issuerId }) => ({ zoneId, visitorId, issuerId })),
        }
      : undefined,
    accessManagement: context.accessManagement,
    referenceActors: context.referenceActors.filter(
      (row) => !actors.some((actor) => actor.id === row.id && actor.name === row.name),
    ),
    memory: {
      administrative: {
        roots: asRecord(context.memory.administrative).roots,
        incomplete: asRecord(context.memory.administrative).incomplete,
      },
      memories: context.memory.memories.map(sceneGmMemory),
    },
    projects: context.projects,
    projectIndex: context.projectIndex,
    requests: context.requests,
    social: {
      edges: live.edges,
      intentions: live.intentions,
      intentionRevisions: live.intentionRevisions,
      sharedRecords: live.sharedRecords,
    },
  };
}

/** Derive exact audible sources once; no second model classifies the same input. */
export function materializeGmReply(raw: Record<string, unknown>, message: string, opening = false) {
  if (typeof raw.input === "string" && ["speech", "thought", "action", "context"].includes(raw.input))
    raw = { ...raw, input: message ? [{ kind: raw.input, text: message }] : [] };
  if (!Array.isArray(raw.input) || raw.input.length > 24 || (opening && raw.input.length))
    throw badGateway("The GM input capture is incomplete. Your draft is preserved.");
  let cursor = 0;
  const timeline: SemanticIntent["timeline"] = raw.input.map((value) => {
    const row = asRecord(value);
    const text = typeof row.text === "string" ? row.text : "";
    const start = text ? message.indexOf(text, cursor) : -1;
    if (!text || start < 0 || !["speech", "thought", "action", "context"].includes(String(row.kind)))
      throw badGateway("The GM input capture has invalid source spans. Your draft is preserved.");
    cursor = start + text.length;
    return {
      kind: row.kind as SemanticIntent["timeline"][number]["kind"],
      text,
      start,
      end: cursor,
      ...(row.delivery ? { delivery: row.delivery as "ordinary" | "whisper" | "shout" } : {}),
      ...(typeof row.targetId === "string" ? { targetId: row.targetId } : {}),
    };
  });
  const speech = timeline.filter((row) => row.kind === "speech");
  const { immediateResidentMoves, ...generated } = raw;
  const result = materializePlayerSpeech(
    {
      ...generated,
      playerSpeechCapture: {
        status: speech.length ? "captured" : "silent",
        utterances: speech.map(({ text, start, delivery, targetId }) => {
          let occurrence = 0,
            at = -1;
          do {
            at = message.indexOf(text, at < 0 ? 0 : at + text.length);
            occurrence++;
          } while (at < start && at >= 0);
          return { text, occurrence, ...(delivery ? { delivery } : {}), ...(targetId ? { targetId } : {}) };
        }),
      },
    },
    message,
  );
  result.immediateResidentMoves = immediateResidentMoves ?? [];
  result.intent = {
    status: "resolved",
    timeline,
    instructions: "",
    reason: "",
    action: null,
    movement: null,
  } satisfies Omit<SemanticIntent, "version" | "sourceHash">;
  return result;
}

/** Expand sparse proposals into existing domain contracts, never a fabricated System verdict. */
export function normalizeGmEffects(
  raw: Record<string, unknown>,
  context: ReturnType<typeof semanticContext>,
  references: Record<string, string> = {},
  compact = false,
) {
  const expand = (value: unknown): unknown => {
    const reference = (item: string) => (Object.hasOwn(references, item) ? references[item] : item);
    if (Array.isArray(value)) return value.map(expand);
    if (!value || typeof value !== "object") return value;
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        key === "lineId" && typeof item === "string"
          ? reference(item)
          : key === "lineIds" && Array.isArray(item)
            ? item.map((ref) => (typeof ref === "string" ? reference(ref) : ref))
            : expand(item),
      ]),
    );
  };
  const result = expand(raw) as Record<string, unknown>;
  // The observed alias still passes the same optional, nonauthoritative cue validator.
  if (result.presentation === undefined && Array.isArray(result.presencePresentation))
    result.presentation = result.presencePresentation;
  delete result.presencePresentation;
  for (const key of ["memoryChanges", "wishChanges", "projectSpeech", "access"])
    if (result[key] === undefined) result[key] = [];
  result.action ??= null;
  if (result.halt === undefined) result.halt = { reason: "none", quote: "", appointments: [] };
  if (
    result.events === undefined ||
    (result.events && typeof result.events === "object" && !Array.isArray(result.events))
  )
    result.events = { moves: [], departures: [], contactEnd: [], ...asRecord(result.events) };
  if (result.narrativeIntroduction === undefined) result.narrativeIntroduction = { status: "quiet", development: null };
  if (
    result.relationshipChanges === undefined ||
    (result.relationshipChanges &&
      typeof result.relationshipChanges === "object" &&
      !Array.isArray(result.relationshipChanges))
  )
    result.relationshipChanges = {
      changes: [],
      permissions: [],
      disclosures: [],
      ...asRecord(result.relationshipChanges),
    };
  const social = asRecord(result.relationshipChanges);
  if (Array.isArray(social.changes))
    social.changes = social.changes.map((value) => {
      const row = asRecord(value);
      if (row.patch === undefined) return row;
      const key = relationshipKey(String(row.fromId), String(row.toId));
      const before = asRecord(asRecord(asRecord(context.social.live).edges)[key]);
      const baseline = Object.keys(before).length ? before : neutralRelationship(String(row.fromId), String(row.toId));
      const patch = asRecord(row.patch);
      if (
        Object.keys(patch).some((key) => !["connection", "stance", "expectations", "concerns", "records"].includes(key))
      )
        throw badGateway("The GM relationship patch has unknown fields. Your draft is preserved.");
      const { patch: _patch, ...rest } = row;
      const after = {
        connection: baseline.connection,
        stance: baseline.stance,
        expectations: baseline.expectations,
        concerns: baseline.concerns,
        records: [],
        ...patch,
      };
      return { ...rest, reason: row.reason ?? "Current witnessed development", liveAfter: after, sceneAfter: after };
    });
  if (Array.isArray(social.intentions))
    social.intentions = social.intentions.map((value) => {
      const row = asRecord(value);
      return { ...row, sceneItems: row.items };
    });
  if (Array.isArray(result.access))
    result.access = result.access.map((value) => {
      const row = asRecord(value);
      return {
        visitorId: "player",
        duration: "visit",
        conditions: [],
        accompanies: false,
        ...row,
        ...(compact && row.command ? { command: { ...asRecord(row.command), zoneId: row.zoneId ?? null } } : {}),
      };
    });
  if (Array.isArray(result.memoryChanges))
    result.memoryChanges = result.memoryChanges.map((value) => {
      const row = asRecord(value);
      const target = asRecord(row.target);
      const candidate =
        compact &&
        context._memoryWrite.recall.candidates.find(
          (record) =>
            context._memoryWrite.recall.targetIds.includes(record.id) &&
            (record.id === target.id || (row.action !== "reinforce" && record.rootId === target.id)),
        );
      const learners = asRecord(row.learners);
      return {
        ...row,
        ...(compact
          ? {
              action: row.action ?? "create",
              ...((row.action ?? "create") === "create" ? { kind: row.kind ?? "information" } : {}),
            }
          : {}),
        ...(compact && asRecord(row.domainRef).kind === "relationship" && asRecord(row.domainRef).id === undefined
          ? {
              domainRef: {
                ...asRecord(row.domainRef),
                id: memoryHash({ text: row.text, characterId: asRecord(row.domainRef).characterId }),
              },
            }
          : {}),
        ...(candidate
          ? {
              target: {
                id: target.id,
                revision: candidate.id === target.id ? candidate.revision : candidate.rootRevision,
                rootRevision: candidate.rootRevision,
              },
            }
          : {}),
        ...(compact && Array.isArray(row.support)
          ? {
              learners: Object.fromEntries(
                Object.entries(learners).map(([id, value]) => [
                  id,
                  { ...asRecord(value), support: asRecord(value).support ?? row.support },
                ]),
              ),
            }
          : {}),
        screening: {
          protectedRoots: [],
          ...asRecord(row.screening),
          fingerprint: context._memoryWrite.protection.fingerprint,
        },
      };
    });
  if (compact) {
    const action = asRecord(result.action);
    if (result.action)
      result.action = {
        ...action,
        expectedRevision: context.zones.find((zone) => zone.id === context.zoneId)?.revision,
        narration:
          action.narration ??
          asRecord(Array.isArray(result.segments) ? result.segments[Number(action.segment)] : undefined).text,
      };
    if (Array.isArray(result.projectSpeech))
      result.projectSpeech = result.projectSpeech.map((value) => {
        const row = asRecord(value);
        return { ...row, revision: context.projects.find((project) => project.projectId === row.projectId)?.revision };
      });
    if (Array.isArray(social.changes))
      social.changes = social.changes.map((value) => {
        const row = asRecord(value);
        return {
          ...row,
          expectedRevision:
            asRecord(
              asRecord(asRecord(context.social.live).edges)[relationshipKey(String(row.fromId), String(row.toId))],
            ).revision ?? 0,
        };
      });
    if (Array.isArray(result.memoryChanges))
      result.memoryChanges = result.memoryChanges.map((value) => {
        const { support: _shared, ...row } = asRecord(value);
        return row;
      });
  }
  return result;
}
