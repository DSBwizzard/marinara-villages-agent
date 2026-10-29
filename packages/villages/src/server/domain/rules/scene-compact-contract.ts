import type { VenueScene } from "../models/scene-model.js";
import { PLACE_UPDATE_INSTRUCTION } from "./zone-continuity.js";
import type { VillageState } from "../models/world.js";
import { accessManagementPrompt } from "./access-speech.js";
import { conflict } from "./errors.js";
import { LIVE_RELATIONSHIP_INSTRUCTION } from "./live-exchange.js";
import { SCENE_MEMORY_INSTRUCTION } from "./scene-memories.js";
import { hasVenueClass, venueResidentIds } from "./venue-model.js";
import type { VenueResponseContext } from "./venue-response-contract.js";
import { venueZones } from "./venue-zones.js";
import { ZONE_SOUND_CONTRACT } from "./zone-events.js";

// System owns the complete social interpretation; writing metadata is only a nomination.
const SOCIAL_WRITING_CONTRACT =
  'relationshipChanges:{changes:[{fromId,toId,expectedRevision,sceneAfter:{connection,stance,expectations:[],concerns:[],records:[]},liveAfter:{connection,stance,expectations:[],concerns:[],records:[]},reason,lineIds:[]}],disclosures:[{fromId,toId,text,kind:"explanation|preference|boundary|routine|history|connection|home|work",lineIds:[]}],permissions:[{controllerId,visitorId,venueId,zoneId,action:"grant|revoke",lineIds:[]}],intentions:[]}. Resident perspectives only; never player feelings. Preserve Scene/live history separately. Disclosures need player-heard speech; standing permissions need exact visitor/Zone authority. System reviews.';
export type SceneWritingCapabilities = {
  management: boolean;
  movement: boolean;
  residences: boolean;
  residenceDecision: boolean;
};

export function compactSceneContract(c: VenueResponseContext, capabilities: SceneWritingCapabilities): string[] {
  return [
    `Return one complete JSON object with segments first. Omit unused fields and empty arrays. Speech: {kind:"dialogue",speakerId,text}; narration: {kind:"narration",text}. Ordinary delivery and main presentation are defaults: omit them. Optional delivery:"whisper|shout", presentation:"aside"; whisper requires a local targetId (resident or player). Dialogue text is only audible words; narration contains action/description. Escape strings; no prose outside JSON. At most 24 segments, 2000 characters each. Either dialogue or narration may stand alone.`,
    c.zoneEventContract
      ? `ZONE EVENTS. Code owns witnesses. No listener lists. Represent current player speech first as literal dialogue with speakerId:"player", excluding thoughts/actions/quoted hypothetical events; interrupted utterances may use exact fragments:[...]. No player speech on arrival or silent input. Never invent player words. Ordinary speech reaches the source and directly adjacent Zones; whispers reach their local addressee; shouts alert the Venue, with clear words only locally/adjacently and indistinct noise farther away. Permissions do not block sound or grant entry. Use captured positions and completed movement order. Reactions use preceding perceptible events only; offstage people remain offstage. Never expose unseen causes, identity, gestures, activity, interiors or silence explanations. Residents can initiate natural reachable events without forced reactions.
ACTION-BASED SOUND. ${ZONE_SOUND_CONTRACT}`
      : c.acousticContract ||
        `Use heardPlayerBy and each segment's heardBy for actual resident witnesses. ${c.opening ? "Opening heardPlayerBy is empty." : ""}`,
    `Effects cite numeric zero-based indexes of ALL segments (player speech included), or supplied earlier evidence IDs. Never cite recaps, imagined speech or unfiltered player input in Zone-event Scenes. Every knower must witness every citation. Speech signals cite that resident's own speech. Conditional willingness, a promise and a completed deed are distinct. Proposals cannot grant authority or prove physical outcomes.`,
    SCENE_MEMORY_INSTRUCTION,
    LIVE_RELATIONSHIP_INSTRUCTION,
    capabilities.movement
      ? `contactMoves records only crossing into a DIFFERENT listed destination Zone, never walking within the current Zone. A step toward someone, crossing a courtyard or changing seats within one Zone needs no contactMoves. For a real Zone crossing use the exact full narration quote or omit quote to reference its segment.`
      : "",
    c.wishes !== false
      ? `Omit wishChanges or return []. System independently interprets social desires and outcomes from this exchange.`
      : "",
    c.invitationZones && c.invitationZones !== "none"
      ? `Invitation destinations: ${c.invitationZones}. Optional roomEvents:[{actorId,venueId,zoneId,kind:"invite-now|invite-later|refuse|dismiss|revoke|ban-zone|ban-venue|invite-outside-hours|uncertain",evidence:[]}]. Use actual permission speech or unambiguous named gestures; short replies may answer pending questions. Unknown destination uses zoneId:"",kind:"uncertain". Silence/open doors/third-party claims grant nothing; retain contextual cautions. Optional invitation:{source:0,venueId,zoneId,scope:"shared|private",ownerId,timing:"now|later",accompanies}; accompanies needs an explicit offer. Entry grants no editing authority or movement.`
      : "",
    capabilities.management
      ? `Optional roomEvents may include {kind:"manage-access",actorId,venueId,evidence:[],command:{action,zoneId,...}} for actual explicit management speech. Actions: zone-policy with complete policy; venue-policy with managerIds/visitorHours; lift-ban with banId; exception with permissionId/banIds; revoke with permissionId; destinations with visitorId and home/sleep/work Zone IDs. Use listed authority/IDs, retain unchanged fields, zoneId:null means Venue. No operationId/expectedRevision/sceneId. Guest entry or suggestions change no policy.`
      : "",
    c.conversational ? PLACE_UPDATE_INSTRUCTION : "",
    c.conversational
      ? `Spontaneous proposals can be expressed in speech. Capture venueRequest:{source:0,name,classes:["workplace|community|other"]} for a NEW public Venue, one or two classes. Source means the complete segment; do not repeat speakerId or quote. Approval starts planning, not construction; accepted commitments remain binding until withdrawn.`
      : "",
    capabilities.residences ? `Optional residenceRequest:{source:0,venueId} for a listed available Residence.` : "",
    capabilities.residenceDecision
      ? `Optional residenceDecision:{source:0,approved} for a pending player move request.`
      : "",
    c.projects
      ? `Optional interpretationRouting:[{actorId,domain:"project",relevance:"irrelevant|potential|uncertain",targetIds:[],segments:[]}]. Cover all eligible current main speech; uncertainty and short contextual answers remain uncertain/potential. Optional projectSpeech:[{projectId,kind:"approval|builder|withdrawal",speakerId,citations:[{segment:0}]}]. Code supplies exact cited quotes (at most 1200 characters) and current revision. For longer speech supply a supported quote explicitly; never omit conditions or negation. Speech is no completed work.`
      : "",
    `Optional departures:[{source:0}] for explicit resident departures; sceneEnded:{source:0} only for spoken ending of the whole encounter. Neither silence nor ordinary company ends it. Player movement requires Move; never return movementIntent/contactIntent/contactRelay in Zone-event Scenes.`,
    c.staging
      ? `${c.presentation}\nOptional staging:[{characterId,position?:"left|center|right",expression?,look?:{target:"player"}|{target:"villager",characterId}|{target:"direction",direction:"left|right"}}] per segment. Only changed, motivated cues; one per character. Omission preserves state. Filled expression IDs only, matching actual pose. Visual cues establish no knowledge, consent, movement or outcome.`
      : "",
    ...c.expressions,
  ].filter(Boolean);
}

/** Captured at admission; eligibility stays fixed across retries of that operation. */
export function sceneWritingCapabilities(state: VillageState, scene: VenueScene): SceneWritingCapabilities {
  const actors = [
    ...new Set([
      ...scene.participants.map((person) => person.characterId),
      ...(scene.sceneAttendance?.occupants.map((person) => person.characterId) ?? []),
    ]),
  ];
  const venue = state.venues.find((venue) => venue.id === scene.placeId);
  return {
    management: !!accessManagementPrompt(state, actors, scene.placeId),
    movement: !!venue && venueZones(venue).length > 1,
    residences: state.venues.some(
      (venue) =>
        hasVenueClass(venue, "residence") &&
        venue.constructionStatus !== "worksite" &&
        !venue.occupancy.playerHome &&
        venueResidentIds(venue).length === 0,
    ),
    residenceDecision: state.residences.some(
      (move) => move.status === "pending" && move.requestedBy === "player" && actors.includes(move.characterId),
    ),
  };
}

/** A malformed captured manifest cannot silently acquire newly available capabilities. */
export function readSceneWritingCapabilities(value: unknown): SceneWritingCapabilities {
  const keys = ["management", "movement", "residences", "residenceDecision"];
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.keys(value).length !== keys.length ||
    keys.some((key) => typeof (value as Record<string, unknown>)[key] !== "boolean")
  )
    throw conflict("This saved request has an invalid writing capability manifest. Its history is preserved.");
  return value as SceneWritingCapabilities;
}

const reliableMemories =
  'memoryChanges:[{action:"create|reinforce|correct|resolve",kind?:"experience|information|open-matter",text?,subjects?:[],target?:{id,revision,rootRevision},learners:{id:{basis:"observation|report|interpretation|validated-event",attributedTo?,support:[{lineId,excerpt}],disclosed?}},domainRef?:{kind,id,characterId?},effectId?,screening:{disposition:"clear|conflict|uncertain",protectedRoots:[],fingerprint}}]. Text<=600 UTF-8 bytes;1-2 exact supports/learner,<=320 bytes each. player learns only seen/heard material; subjects never learn automatically. Reports name speaker. Event fact:validated-event+committed receipt/domainRef; no drafts/promises. Reinforce preserves content; correct:root; resolve:open matter. Targets:supplied/guarded/unambiguous. Screen each row against System protection. Changed/conflict/uncertain/incomplete:reject affected row,keep dialogue/independent effects. No forgotten restoration,private defaults,filler or expansion calls.';
const reliableRelationships = SOCIAL_WRITING_CONTRACT;

/** v3 uses reference-only metadata and one concise copy of each mechanical rule. */
export function reliableSceneContract(c: VenueResponseContext, capabilities: SceneWritingCapabilities): string[] {
  return [
    'ONE complete JSON object: playerSpeechCapture first,segments second,effects inside SAME object. Escape strings; omit unused fields. No outside prose/Markdown. segments:{speakerId,text} speech and {text} visible narration; code infers kind. Defaults:ordinary/main. Optional delivery:"whisper|shout",presentation:"aside"; whispers require local targetId. Max24 segments,2000 chars each. Metadata:references only.',
    c.zoneEventContract
      ? `ZONE EVENTS. Player speech uses playerSpeechCapture. Code owns witnesses; no listener lists. Ordinary words reach source/adjacent Zones; whispers reach local target; shouts alert Venue but distant listeners hear indistinct noise. Permissions neither block sound nor grant entry. Use captured positions/movement order and each actor’s preceding perceptible evidence. Offstage people stay offstage; never reveal unseen causes, identities, gestures, activity, interiors or explanations of silence. Natural reachable events need no forced reactions. ACTION-BASED SOUND. ${ZONE_SOUND_CONTRACT}`
      : c.acousticContract ||
        `Use heardPlayerBy and segment heardBy for actual resident witnesses.${c.opening ? " Opening heardPlayerBy: []." : ""}`,
    'Effects cite returned-segment numbers (0,1,...), "utterance:N" for captured player words; older evidence uses supplied IDs. Never invent "segments:1"/"aqua:1" aliases. Every knower witnesses EVERY citation. No recap/imagined/raw-input evidence. Speech signals cite speaker. Conditions/promises/deeds differ; proposals grant no authority or physical results.',
    reliableMemories,
    reliableRelationships,
    capabilities.movement
      ? "contactMoves:[{characterId,zoneId,segment}]:completed crossing to DIFFERENT listed Zone only; local walking/seating/doors need no row. segment:narration naming actor/completed crossing,never intent/condition. One voluntary move/actor; code owns quote. Later speech uses new positions,never retroactive witnesses/unseen journeys/interiors."
      : "",
    c.wishes !== false
      ? "wishChanges:[]; System independently interprets social desires and outcomes from this exchange."
      : "",
    c.invitationZones && c.invitationZones !== "none"
      ? `Invitation destinations:${c.invitationZones}. roomEvents:[{actorId,venueId,zoneId,kind:"invite-now|invite-later|refuse|dismiss|revoke|ban-zone|ban-venue|invite-outside-hours|uncertain",evidence:[]}]. Actual permission speech or unambiguous named gesture; short answers may resolve pending questions. Unknown destination:zoneId:"",kind:"uncertain". Silence/open doors/third-party claims grant nothing; retain cautions. invitation:{source:0,venueId,zoneId,scope:"shared|private",ownerId,timing:"now|later",accompanies}; accompanies needs explicit offer. Entry grants no editing/movement.`
      : "",
    capabilities.management
      ? 'roomEvents may include {kind:"manage-access",actorId,venueId,evidence:[],command:{action,zoneId,...}} for explicit management speech. Actions:zone-policy(complete policy),venue-policy(managerIds/visitorHours),lift-ban(banId),exception(permissionId/banIds),revoke(permissionId),destinations(visitorId,home/sleep/work Zone IDs). Listed authority/IDs only; retain unchanged fields; zoneId:null means Venue. No operationId/expectedRevision/sceneId. Guest entry/suggestions change no policy.'
      : "",
    c.conversational
      ? 'placeUpdate:{happened:true,segment,actorIds:[],consent:[{actorId,segment?,lineId?,quote?}],narration,expectedRevision,edits:[{before,after}],append?,recent?:{text,renew?}} nominates a completed local deed with real actors/supplies. Cite current action narration; consent cites controller dialogue or accepted earlier Scene lineId perceived by actors. Player consent:segment:"player",quote:exact current input. Access permits temporary use; enduring changes need controller authority. Preserve unrelated description with unique exact edits/additions(max4000); promises belong in Memories. Recent:one complete paragraph(max600),empty clears. Unrelated activity keeps its 24h deadline; renew only deliberate maintenance/reestablishment of the WHOLE arrangement,never viewing/mentioning. System independently reviews; never narrate unsupported results.'
      : "",
    c.conversational
      ? 'Spontaneous proposals:venueRequest:{source:0,name,classes:["workplace|community|other"]} for NEW public Venue,1–2 classes. Approval starts planning,never construction; accepted commitments bind until withdrawn.'
      : "",
    capabilities.residences ? "residenceRequest:{source:0,venueId},listed available Residence only." : "",
    capabilities.residenceDecision ? "residenceDecision:{source:0,approved},pending player move only." : "",
    c.projects
      ? 'interpretationRouting:[{actorId,domain:"project",relevance:"irrelevant|potential|uncertain",targetIds:[],segments:[]}]. Cover eligible current main speech; short/contextual/uncertain answers stay potential/uncertain. projectSpeech:[{projectId,kind:"approval|builder|withdrawal",speakerId,citations:[{segment:0}]}]. Code supplies full quotes(max1200 chars)/revision; longer speech needs explicit supported quote retaining conditions/negation. Speech is no completed work.'
      : "",
    "departures:[{source:0}],explicit resident departures only; sceneEnded:{source:0},spoken end of WHOLE encounter only. Silence/ordinary company end neither. Player movement requires Move; never return movementIntent/contactIntent/contactRelay. All source fields cite complete returned segments; omit repeated speakerId/quote.",
    c.staging
      ? `${c.presentation}\nPer-segment staging:[{characterId,position?:"left|center|right",expression?,look?:{target:"player"}|{target:"villager",characterId}|{target:"direction",direction:"left|right"}}]. Only changed,motivated cues; one per actor. Omission preserves state; filled expression IDs must match pose. Visual cues establish no knowledge,consent,movement/outcome.`
      : "",
    ...c.expressions,
  ].filter(Boolean);
}
