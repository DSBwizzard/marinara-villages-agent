import type { SemanticIntent } from "../models/semantic-model.js";
import { asRecord } from "./coerce.js";
import { badGateway } from "./errors.js";
import { neutralRelationship, relationshipKey } from "./relationship-rules.js";
import { materializePlayerSpeech } from "./player-speech-capture.js";
import { semanticContext } from "./semantic-contract.js";
import type { sceneWritingHistory } from "./scene-writing-history.js";

export const SCENE_GM_DIRECTION =
  "You are the Game Master of Villages, a persistent character-driven life game. Interpret the player's entire input and write the next exchange, with small updates only when something changes. Residents have their own motives, opinions, abilities and right to refuse. Preserve complete authored identity and post-history direction. Write specific, natural, emotionally responsive prose; avoid repeated questions, ceremonial consent and filler. Let addressed people respond. Server facts govern positions, time, access and consequences. Private context belongs to its named knowers, never the whole cast. No invented player words, thoughts, agreement or travel. Thoughts and quoted examples are not audible. Later arrivals never hear earlier dialogue. Hearing is not sight, presence or access. A proposal or promise is not physical completion. Only explicit Move changes the player's Zone, and only Start/Resume begins Project work. Ordinary conversation needs no persistent update. You propose meaning and consequences; server validation determines what applies.";

export const SCENE_GM_RESPONSE =
  'Return ONE compact JSON object. Required input:[{kind:"speech|thought|action|context",text:"exact source span",delivery?:"ordinary|whisper|shout",targetId?}] classifies the ENTIRE original input in source order, including roleplay/action wrappers; only whitespace and surrounding quotation marks may fall between spans. Ordinary unmarked dialogue is speech; private thoughts, actions, recalled/hypothetical/example speech are not. A whisper needs a local target. Opening: input:[]. Code inserts the exact spoken spans; never put player in generated segments. Required segments:[{kind:"dialogue",speakerId,text,delivery?,presentation?:"main|aside",targetId?}|{kind:"narration",text,sound?:{sourceId,text,loud?:true}}]. Max24 total segments including player speech; text max2000 characters. Staging is narration, never a speakerless aside. Example shape: {"input":[{"kind":"speech","text":"Hello."}],"segments":[{"kind":"dialogue","speakerId":"resident-id","text":"Evening."}]}. Use actual IDs and words, not the example. Escape every quote inside text. All optional fields belong INSIDE that same object. No self-review, consistent/authority flags, explanations, unchanged projections or empty optional sections. All numeric sources refer to generated segments before code inserts player speech; use "utterance:0" for an input speech source.';

export const SCENE_GM_EVENTS =
  'Optional events:{moves:[{characterId,zoneId,segment}],departures:[{source}],contactEnd:[{source}],residenceRequest?:{source,venueId},residenceDecision?:{source,characterId,approved},venueRequest?:{source,name,classes:["workplace|community|other"]},sceneEnded?:{source}}. moves cite a narration segment establishing a completed permitted resident crossing, never a door opening or a player crossing. Distinct people and destinations stay distinct. A source is the full spoken segment that establishes the event. No silent consent, hidden arrivals or earlier witnesses. Supporting people have native Memories, never Villager Wishes, relationship graphs or builder roles. Optional placeDiscoveries and establishmentProgress cite actual witnessed disclosures/outcomes, never invented resources or promises. Also return immediateResidentMoves:[{characterIds:[ids],zoneId,source:zero-based INPUT span index}] for immediate resident movement REQUESTS in the original input, including the entire requested local group, even if your reply moves fewer or none. Exclude future, hypothetical, negated and player-only travel. These source indexes refer to input, never generated segments; code checks group availability.';

export const SCENE_GM_ACCESS =
  'Optional access:[{actorId,venueId,zoneId,outcome:"invite-now|invite-later|refuse|dismiss|ban-zone|ban-venue|invite-outside-hours|access-management|unresolved",evidence:[segment],accompanies?:boolean,conditions?:["accompanied"],command?}]. Only actual current consent/refusal by an authorized controller qualifies. Invitation defaults to a visit, never standing permission, entry or residency. accompanies means the resident goes with the player. Conditional consent cannot silently become unconditional; unsupported conditions use unresolved. A management event needs its exact command and current authority. Standing grants/revocations use relationshipChanges.permissions with controllerId,visitorId,venueId,zoneId,action:"grant|revoke",expectedRevision and lineIds. Do not infer permission from friendship, employment, silence or discussion.';

export const SCENE_GM_PROJECTS =
  'Optional projectSpeech:[{projectId,revision,kind:"approval|builder|withdrawal",speakerId,citations:[{segment}]}]. revision is the supplied CURRENT design revision. Approval and willingness to build are separate, and both may occur together. Preserve every condition/negation in the full cited speech; no silence, hypothetical consent or another speaker. Only Villagers volunteer to build. Actual withdrawal is immediate. Speech never starts, resumes or completes work.';

export const SCENE_GM_SOCIAL =
  'Optional relationshipChanges:{changes:[{fromId,toId,expectedRevision,patch:{connection?,stance?,expectations?:[],concerns?:[],records?:[]},lineIds:[segment],reason:"short reason"}],disclosures:[],intentions:[],permissions:[]}. Only residents own perspectives/intentions; never author player feelings. Patch only meaningful changes and preserve other fields. expectedRevision is CURRENT, not incremented. Records are upserts {id:"existing or empty",expectedRevision,kind:"history|declaration|boundary|agreement|commitment",text,participants:[],status:"stated|proposed|accepted|fulfilled|cancelled|overdue",dueAt?:"explicit ISO deadline"}; immutable terms stay unchanged. History is stated and has no deadline. Mutual acceptance needs each participant\'s actual assent; silence is not consent. Disclosures:{fromId,toId,kind:"explanation|preference|boundary|routine|history|connection|home|work",text:"max240 characters",lineIds:[],excerpts?:["exact <=320-byte quote"]}; record only what the player actually learned, never private stance, intentions or forgotten facts. fromId is the speaker and toId the described person. Do not duplicate a disclosure in Memories. Intentions:{actorId,expectedRevision,lineIds:[],items:[{id,targetIds:[],text,reason,status:"active|retired|attempted"}]}; at most three active, preserving meaningful unattempted intentions. Omit unchanged relationships.';

export const SCENE_GM_WISHES =
  'Optional wishChanges:[{actorId,wishId,intent:"create|reveal|clarify|approach|attention|progress|fulfilled|withdrawn",evidence:[segment],reason:"short reason",desire?:{wish,reason},condition?,quote?,approach?,attention?:{state:"background|foreground",reason},supersedes?,disclosedStatus?,statusQuote?}]. Use supplied Wishes only; create uses a source-local "new:label" ID and desire. Interpret actual outcomes against ALL exact conditions; intent/promise is not fulfillment. Meaningful witnessed progress may fall short of fulfillment. Preserve owner agency, refusals and changed conditions; no automatic completion from time or attention. Only actual disclosed words teach player the title/status, with exact quote/statusQuote. Private context is never disclosure. Omit unchanged Wishes.';

export const SCENE_GM_BOUNDARY =
  'Optional halt:{reason:"time|activity|condition|world",source:"player|draft",quote:"exact source substring",appointments:[]}. Preserve attempts/hypotheticals as such; do not silently turn an unsupported asserted outcome into a failed action, dream or dialogue. No unsupported death/resurrection, permanent incapacity, time travel, calendar rewrite or large time skip; ordinary local actions and compatible character powers are allowed. Appointments need rows {source:"player|draft",quote,date:"YYYY-MM-DD",minute:0-1439|null}; null means no exact time. Player quotes bind to original input, draft quotes to generated text. Resolve today/tomorrow/next weekday from the supplied calendar. Report appointment rows even with no other halt, using reason:"none",quote:""; code decides whether an appointment is past. Ordinary scheduling alone is not a time halt. A halt may use segments:[].';

/** Compact model view; private Memory authority is retained by the saved writing request. */
export function sceneGmContext(
  context: ReturnType<typeof semanticContext>,
  includedHistory: ReturnType<typeof sceneWritingHistory>["rows"] = [],
) {
  const { _memoryWrite: _private, loreSelection: _lore, setting: _setting, history, actors, social, ...rest } = context;
  const live = asRecord(social.live);
  return {
    ...rest,
    history: history.map((line) => {
      const covered = includedHistory.some(
        (row) =>
          row.id === line.id &&
          row.text === line.content &&
          row.speakerId === (line.role === "user" ? "player" : line.speakerId) &&
          row.kind === line.kind &&
          JSON.stringify(row.heardBy) === JSON.stringify(line.heardBy),
      );
      if (!covered) return line;
      // Keep unique saved metadata; the retained witnessed row supplies these exact fields by ID.
      const { content: _content, speakerId: _speaker, kind: _kind, heardBy: _heard, ...metadata } = line;
      return metadata;
    }),
    actors: actors.map(({ character: _card, ...actor }) => actor),
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
export function normalizeGmEffects(raw: Record<string, unknown>, context: ReturnType<typeof semanticContext>) {
  const result = structuredClone(raw);
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
    result.access = result.access.map((value) => ({
      visitorId: "player",
      duration: "visit",
      conditions: [],
      accompanies: false,
      ...asRecord(value),
    }));
  if (Array.isArray(result.memoryChanges))
    result.memoryChanges = result.memoryChanges.map((value) => {
      const row = asRecord(value);
      return {
        ...row,
        screening: {
          protectedRoots: [],
          ...asRecord(row.screening),
          fingerprint: context._memoryWrite.protection.fingerprint,
        },
      };
    });
  return result;
}
