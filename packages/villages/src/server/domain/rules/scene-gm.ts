import type { SemanticIntent } from "../models/semantic-model.js";
import { asRecord } from "./coerce.js";
import { badGateway } from "./errors.js";
import { materializePlayerSpeech, playerSourceSpan } from "./player-speech-capture.js";
import { semanticContext } from "./semantic-contract.js";

export const SCENE_GM_DIRECTION =
  "You are the GM of Villages, a persistent character-driven life game. Preserve complete authored identities and directions. Write natural, specific dialogue and useful narration; meaningful roleplay has no prose quota. Residents retain motives, agency, initiative and refusal. Let relevant people respond and converse. Private facts belong only to named knowers; later arrivals never hear earlier dialogue. Hearing is not sight, presence or access. Never invent player words, thoughts, decisions, consent or travel. A promise is not completion. Only Move changes the player's Zone; only Start/Resume starts Project work. Code owns time, witnesses, legality, state and persistence. You supply fictional meaning and sparse supported consequences. Omitted context never proves an event did not happen.";

export const SCENE_GM_RESPONSE =
  'Return one JSON object {input:[{text,occurrence?,kind?:"speech|action",delivery?:"whisper|shout",targetId?}],segments:[{kind:"dialogue",speakerId,text,delivery?,presentation?:"aside",targetId?}|{kind:"narration",text,sound?:{sourceId,text,loud?:true}}],events?:[]}. Select ONLY actual audible speech (default kind), plus actions needed for movement requests or physical consent. Omit thoughts, recalled/hypothetical/example speech and context: code preserves every omitted byte as non-audible context. Include 1-based occurrence whenever exact text repeats in the original; keep source order, negation and qualifications. Whispers name a local target. Empty/opening input uses input:[]. Never generate player segments; code inserts selected speech. Max24 segments including player speech, each max2000 characters. Staging is narration. Events share {type,actorId?,targetId?,at:[source],value?,reason?}. Sources are zero-based GENERATED segment indexes or "input:N" for audible input selections; Memory, Wish and relationship events may also cite supplied history IDs. No revisions, fingerprints, receipts, unchanged fields or negative reports. Ordinary chatter needs no events.';

export const SCENE_GM_EVENTS =
  'Events: move(actorId resident,targetId Zone,at narration); move-request(targetId Zone,at:["input:N"],value:{actors:[entire requested local group]}) even when the reply moves fewer; depart/contact-end/scene-end(at deciding speech); residence-request(targetId Venue); residence-decision(targetId person,value:boolean); venue-request(value:{name,classes:["workplace|community|other"]}); npc(actorId:"new:local-key",targetId?:known NPC,value:{name,label?,characterization},at observed introduction narration); discover/establish(value:actual witnessed Place/outcome details); presentation(actorId,at segment,value:{expression?,look?:{target:"player"}|{target:"villager",characterId}|{target:"direction",direction:"left|right"}}). Quoted decisions cite one complete current speech source; Project/access/permission may cite several current sources from one speaker. Supporting people can act, refuse and remember, but have no Villager Wishes, Agenda or builder role. New arrivals cannot hear earlier speech, including player input. Moves are completed permitted resident crossings, never player travel or a door opening. Exclude hypothetical, negated and future movement requests. Code owns sprite defaults, placement and facing; omit unnecessary cues.';

export const SCENE_GM_SOCIAL =
  'relationship(actorId owner,targetId person,at,value:{connection?,stance?,expectations?,concerns?,records?:[{id?:existing,kind:"history|declaration|boundary|agreement|commitment",text,participants,status:"stated|proposed|accepted|fulfilled|cancelled|overdue",dueAt?:explicit ISO}]}). Change only meaningful directional perspectives; never player feelings. Omitted fields stay unchanged. Existing terms are immutable; an existing record id can update status without repeating terms. History is stated, without deadlines. Mutual agreement requires each actual assent. Personal goals belong to Wishes; learning and open matters to Memories. No separate disclosure or intention ledger.';

export const SCENE_GM_WISHES =
  'wish(actorId owner,targetId Wish,at,value:{intent:"create|reveal|clarify|approach|attention|progress|fulfilled|withdrawn",desire?:{wish,reason},condition?,quote?,approach?,attention?:{state:"background|foreground",reason},supersedes?,disclosedStatus?,statusQuote?}). Create uses new:local-label and desire. Preserve all conditions, owner agency and refusals. Witnessed progress is not necessarily fulfillment; promises never fulfill. Judge fulfillment only with complete supplied evidence. Exact disclosed words alone teach player title/status; private context is not disclosure. No automatic completion from time or attention. Wishes are separate from Project work.';

export const SCENE_GM_PROJECTS =
  'project(targetId Project,at full deciding speech,value:"approval|builder|withdrawal|refuse|conditional|uncertain"). Approval and willingness to build are separate events and may coexist. Keep qualifications in cited speech; conditional/uncertain assent cannot become commitment. Only Villagers volunteer. Speech never starts, resumes or completes work. Commitment requires supplied complete current terms.';

export const SCENE_GM_ACCESS =
  'access(targetId Zone,at deciding speech,value:{outcome:"invite-now|invite-later|refuse|dismiss|ban-zone|ban-venue|invite-outside-hours|access-management|unresolved",venueId?,visitorId?,accompanies?,conditions?:["accompanied"],command?}). Code verifies the controller; visitor defaults to player, duration to visit. Standing permission uses permission(targetId Zone,at controller speech,value:{action:"grant|revoke",venueId?,visitorId?}). Preserve conditions; unsupported conditions use unresolved. Never infer consent from friendship, employment, silence or general agreement. Consent does not establish entry, residency or player movement.';

export const SCENE_GM_MEMORY =
  'memory(at 1-2 sources,value:{kind:"experience|information|open-matter",text,knowers:[IDs],basis:"observation|report|interpretation|validated-event",action?:"create|reinforce|correct|resolve",targetId?,subjects?,quotes?:[exact short support per source],domain?:{kind:"wish|project|relationship|physical",id,characterId?},disclosed?,protected?:[related administrative root IDs],uncertain?:true}). Save only meaningful learning, corrections or resolutions. Text max600 UTF-8 bytes; sources over320 bytes need short exact quotes. Code supplies targets/revisions, attribution, witnesses, fingerprints and persistence. Reports establish what was said, not truth; interpretations can be mistaken. Each knower must witness their source; subjects never automatically learn. Mechanical facts require a committed domain effect; promises are reports. Code records committed Wish/Project facts. Use validated-event here only for a physical effect, domain:{kind:"physical",id:current placeId}. Only actually heard/seen disclosure teaches player. Administrative constraints are never character knowledge. Mark related protected roots and uncertainty; never resurrect forgotten or contradict corrected knowledge. Omit routine chatter and already represented facts.';

export const SCENE_GM_PHYSICAL =
  "physical(actorId initiator,at one completed local narration,value:{actors?:[IDs],consent?:[{actorId?,at:source}],appearanceChanged?,edits?:[{before,after}],append?,recent?:{text,renew?},dayNight?,clear?:[condition IDs]}). Code supplies revisions, source text, positions, witnesses and receipts. Enduring edits need controller authority and every nonacting controller’s actual cited consent. Player consent cites input:N. Preserve unrelated facts with unique exact edits; appearanceChanged means meaningful enduring visible alteration. Recent is one paragraph max600; renew only deliberately maintained arrangements. Clear a restriction only after its complete remedy occurs. Intentions, promises, unavailable supplies and remote actions cannot become physical outcomes. Unsupported asserted accomplishments require a boundary, never silent rewriting as attempts.";

export const SCENE_GM_BOUNDARY =
  'boundary(value:{reason:"time|activity|condition|world",source:"player|draft",quote:exact source}). Preserve attempts/hypotheticals; never quietly rewrite unsupported asserted completion. No unsupported death/resurrection, permanent incapacity, time travel, calendar rewriting or large time skip; ordinary local actions and compatible abilities remain allowed. appointment(value:{source:"player|draft",quote,when:{dayOffset:integer}|{weekday:weekdayName,afterToday?:true}|{date:"YYYY-MM-DD"},minute?:0-1439}) records actual appointments; code judges past instants. Use dayOffset:0 for today, 1 for tomorrow, an explicitly stated number of days, or a weekday; code derives the date from the captured calendar. No empty boundary or negative decisions.';

/** Compact model view; private Memory authority is retained by the saved writing request. */
export function sceneGmContext(context: ReturnType<typeof semanticContext>) {
  const {
    _memoryWrite: _private,
    _wishEvidence: wishEvidence,
    _projectContexts: _projects,
    _conditions: _conditions,
    loreSelection: _lore,
    history: _history,
    worldSeed: _seed,
    sceneId: _scene,
    revision: _revision,
    possibleMemoryEffects: _effects,
    setting: _setting,
    worldName: _worldName,
    worldFacts: _worldFacts,
    time: _time,
    preservation,
    zones,
    actors,
    memory,
    social,
    ...rest
  } = context;
  const live = asRecord(social.live);
  return {
    ...rest,
    calendar: preservation.calendar,
    zones: zones.map(({ revision: _revision, ...zone }) => zone),
    actors: actors.map(({ character: _card, admission: _admission, wishes, ...actor }) => ({
      ...actor,
      wishes: wishes.map((wish) => ({
        id: wish.id,
        wish: wish.wish,
        reason: wish.reason,
        status: wish.status,
        approach: wish.approach,
        attention: wish.attention,
        ...(wishEvidence.some((row) => row.actorId === actor.id && row.wishId === wish.id)
          ? {
              evidence: {
                conditions: wish.conditions.map(({ quote }) => quote),
                history: wish.history.map(({ kind, text, at }) => ({ kind, text, at })),
              },
            }
          : { evidence: "not supplied; no fulfillment judgment" }),
      })),
    })),
    memory: {
      administrative: {
        ...(asRecord(memory.administrative).incomplete ? { incomplete: true } : {}),
        roots: (Array.isArray(asRecord(memory.administrative).roots)
          ? (asRecord(memory.administrative).roots as Record<string, unknown>[])
          : []
        ).map(({ rootId, text, knowers }) => ({ rootId, text, knowers })),
      },
      memories: memory.memories.map(
        ({ id, rootId, kind, text, subjects, occurredAt, domainRef, corrects, resolves, knowers }) => ({
          id,
          ...(rootId !== id ? { rootId } : {}),
          kind,
          text,
          subjects,
          occurredAt,
          ...(domainRef ? { domainRef } : {}),
          ...(corrects ? { corrects } : {}),
          ...(resolves ? { resolves } : {}),
          knowers: Object.fromEntries(
            Object.entries(knowers).map(([id, state]) => [
              id,
              state.repair
                ? { basis: "player-repaired" }
                : {
                    basis: state.basis,
                    ...(state.attributedTo ? { attributedTo: state.attributedTo } : {}),
                    ...(state.disclosed ? { disclosed: state.disclosed } : {}),
                  },
            ]),
          ),
        }),
      ),
    },
    social: {
      edges: Object.values(asRecord(live.edges)).map((value) => {
        const { revision: _revision, updatedAt: _at, experiences: _experiences, records, ...edge } = asRecord(value);
        return {
          ...edge,
          records: Object.values(asRecord(records)).map((value) => {
            const { revision: _revision, evidenceIds: _evidence, ...record } = asRecord(value);
            return Object.hasOwn(asRecord(live.sharedRecords), String(record.id)) ? record.id : record;
          }),
        };
      }),
      sharedRecords: Object.values(asRecord(live.sharedRecords)).map((value) => {
        const { revision: _revision, evidenceIds: _evidence, ...record } = asRecord(value);
        return record;
      }),
    },
  };
}

/** Derive exact audible sources once; no second model classifies the same input. */
export function materializeGmReply(raw: Record<string, unknown>, message: string, opening = false) {
  if (!Array.isArray(raw.input) || raw.input.length > 24 || (opening && raw.input.length))
    throw badGateway("The GM input capture is incomplete. Your draft is preserved.");
  let cursor = 0;
  const timeline: SemanticIntent["timeline"] = [];
  const inputIndexes = new Map<number, number>();
  const spokenIndexes = new Map<number, number>();
  const speech: (ReturnType<typeof playerSourceSpan> & { delivery?: unknown; targetId?: unknown })[] = [];
  raw.input.forEach((value, index) => {
    const row = asRecord(value);
    const source = playerSourceSpan(row, message);
    const kind = row.kind ?? "speech";
    if (
      source.start < cursor ||
      !["speech", "action"].includes(String(kind)) ||
      Object.keys(row).some((key) => !["kind", "text", "occurrence", "delivery", "targetId"].includes(key)) ||
      (row.delivery !== undefined && !["ordinary", "whisper", "shout"].includes(String(row.delivery))) ||
      (row.targetId !== undefined && (typeof row.targetId !== "string" || !row.targetId)) ||
      (kind !== "speech" && (row.delivery !== undefined || row.targetId !== undefined))
    )
      throw badGateway("The GM input capture has invalid source spans. Your draft is preserved.");
    if (source.start > cursor)
      timeline.push({ kind: "context", text: message.slice(cursor, source.start), start: cursor, end: source.start });
    inputIndexes.set(index, timeline.length);
    timeline.push({
      kind: kind as "speech" | "action",
      text: source.text,
      start: source.start,
      end: source.end,
      ...(row.delivery ? { delivery: row.delivery as "ordinary" | "whisper" | "shout" } : {}),
      ...(typeof row.targetId === "string" ? { targetId: row.targetId } : {}),
    });
    if (kind === "speech") {
      spokenIndexes.set(index, speech.length);
      speech.push({ ...source, delivery: row.delivery, targetId: row.targetId });
    }
    cursor = source.end;
  });
  if (cursor < message.length)
    timeline.push({ kind: "context", text: message.slice(cursor), start: cursor, end: message.length });
  const { immediateResidentMoves, ...generated } = raw;
  const reference = (value: unknown): unknown => {
    if (typeof value === "string" && /^input:\d+$/u.test(value)) {
      const index = spokenIndexes.get(Number(value.slice(6)));
      if (index === undefined)
        throw badGateway("A non-audible player span cannot be cited as speech. Your draft is preserved.");
      return "utterance:" + index;
    }
    return value;
  };
  const bindInput = (value: unknown, key = ""): unknown => {
    if (Array.isArray(value))
      return ["evidence", "lineIds", "segments"].includes(key)
        ? value.map(reference)
        : value.map((row) => bindInput(row));
    if (value && typeof value === "object")
      return Object.fromEntries(
        Object.entries(value).map(([key, child]) => [
          key,
          ["source", "segment", "lineId"].includes(key) ? reference(child) : bindInput(child, key),
        ]),
      );
    return value;
  };
  const result = materializePlayerSpeech(
    {
      ...asRecord(bindInput(generated)),
      playerSpeechCapture: {
        status: speech.length ? "captured" : "silent",
        utterances: speech.map(({ text, occurrence, delivery, targetId }) => {
          return { text, occurrence, ...(delivery ? { delivery } : {}), ...(targetId ? { targetId } : {}) };
        }),
      },
    },
    message,
  );
  const requests = immediateResidentMoves === undefined ? [] : immediateResidentMoves;
  if (!Array.isArray(requests)) throw badGateway("The GM movement request is invalid. Your draft is preserved.");
  result.immediateResidentMoves = requests.map((value: unknown) => {
    const row = asRecord(value);
    const source =
      typeof row.source === "string" && /^input:\d+$/u.test(row.source) ? Number(row.source.slice(6)) : row.source;
    const mapped = Number.isSafeInteger(source) ? inputIndexes.get(Number(source)) : undefined;
    if (mapped === undefined)
      throw badGateway("The GM movement request lacks its exact input source. Your draft is preserved.");
    return { ...row, source: mapped };
  });
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
