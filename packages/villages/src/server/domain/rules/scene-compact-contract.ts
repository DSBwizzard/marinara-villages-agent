import { conflict } from "./errors.js";
import type { VillageState } from "../models/world.js";
import type { VenueScene } from "../models/scene-model.js";
import { accessManagementPrompt } from "./access-speech.js";
import { venueZones } from "./venue-zones.js";
import type { VenueResponseContext } from "./venue-response-contract.js";

export type SceneWritingCapabilities = {
  management: boolean;
  movement: boolean;
  residences: boolean;
  residenceDecision: boolean;
  editApproval: boolean;
};

export function compactSceneContract(c: VenueResponseContext, capabilities: SceneWritingCapabilities): string[] {
  return [
    `Return one complete JSON object with segments first. Omit unused fields and empty arrays. Speech: {kind:"dialogue",speakerId,text}; narration: {kind:"narration",text}. Ordinary delivery and main presentation are defaults: omit them. Optional delivery:"whisper|shout", presentation:"aside"; whisper requires a local targetId (resident or player). Dialogue text is only audible words; narration contains action/description. Escape strings; no prose outside JSON. At most 24 segments, 2000 characters each. Either dialogue or narration may stand alone.`,
    c.zoneEventContract
      ? `ZONE EVENTS. Code owns witnesses. No listener lists. Represent current player speech first as literal dialogue with speakerId:"player", excluding thoughts/actions/quoted hypothetical events; interrupted utterances may use exact fragments:[...]. No player speech on arrival or silent input. Never invent player words. Ordinary speech reaches the source and directly adjacent Zones; whispers reach their local addressee; shouts alert the Venue, with clear words only locally/adjacently and indistinct noise farther away. Permissions do not block sound or grant entry. Use captured positions and completed movement order. Reactions use preceding perceptible events only; offstage people remain offstage. Never expose unseen causes, identity, gestures, activity, interiors or silence explanations. Residents can initiate natural reachable events without forced reactions.
ACTION-BASED SOUND. For a meaningful nonverbal sound, annotate its narration segment with sound:{sourceId,text,loud?:true}. text is audible-only, at most 300 characters; sourceId is player or a supplied resident, privately used for routing. Narration.text contains only player-observable detail. Do not repeat the sound, annotate silence/thoughts/speech, invent impacts, or use sound-effect captions. Physical outcomes need sceneChange; sound alone proves no deed.`
      : c.acousticContract ||
        `Use heardPlayerBy and each segment's heardBy for actual resident witnesses. ${c.opening ? "Opening heardPlayerBy is empty." : ""}`,
    `Effects cite numeric zero-based indexes of ALL segments (player speech included), or supplied earlier evidence IDs. Never cite recaps, imagined speech or unfiltered player input in Zone-event Scenes. Every knower must witness every citation. Speech signals cite that resident's own speech. Conditional willingness, a promise and a completed deed are distinct. Proposals cannot grant authority or prove physical outcomes.`,
    `Optional memoryChanges:[{kind:"passing|durable|reinforce|supersede",text,category:"commitment|personal-fact|preference|relationship|shared-experience",subjectCharacterIds:[],knownByCharacterIds:[],evidence:[],memoryIds?:[]}]. IDs are residents, never player. Record useful contextual events; durable only for stable facts/preferences/boundaries, commitments or significant experiences. Passing lasts 24 hours. Omit filler, transient mood, weak inference and existing facts. Reinforce/supersede cite supplied durable memoryIds plus new evidence; reinforce preserves the text, supersede corrects it. No promotion quota.`,
    `Optional relationshipChanges:{changes:[{fromId,toId,dimension:"warmth|trust",strength:"minor|meaningful|major|none",direction:"increase|decrease",ordinary:boolean,reason:"brief grounded reason",lineIds:[],disclosed:boolean}],disclosures:[{kind:"explanation|preference|boundary",source:0,toId?:"player"}],permissions:[{controllerId,visitorId,venueId,zoneId,action:"grant|revoke",lineIds:[]}]}. Omit empty members. Changes are independent of memory: substantive company can earn minor warmth, not trust. Trust requires demonstrated reliability or meaningful confidence/boundary interaction; no rewards for greetings, repetition or mere co-location. Never score player feelings. disclosed means the reason was explained aloud. A disclosure's source is one complete spoken segment heard by the player, at most 320 characters; code supplies its text, speaker and citation. For longer speech use {fromId,toId,text,kind,lineIds} with a faithful summary of at most 320 characters. Permission requires explicit unconditional standing grant/revocation by a controller for the listed visitor/Zone; one visit is distinct. Unshared reasons stay private.`,
    capabilities.movement
      ? `contactMoves records only crossing into a DIFFERENT listed destination Zone, never walking within the current Zone. A step toward someone, crossing a courtyard or changing seats within one Zone needs no contactMoves. For a real Zone crossing use the exact full narration quote or omit quote to reference its segment.`
      : "",
    c.wishes !== false
      ? `Optional wishChanges:[{actorId,wishId,intent:"reveal|progress|check",evidence:[]}], only listed Wishes. Reveal needs the wishing resident's disclosure. Progress/check needs meaningful new witnessed evidence; no filler, promises or conditional/quoted claims. Never invent or fulfill Wishes. Physical results need verified receipts.`
      : "",
    c.invitationZones && c.invitationZones !== "none"
      ? `Invitation destinations: ${c.invitationZones}. Optional roomEvents:[{actorId,venueId,zoneId,kind:"invite-now|invite-later|refuse|dismiss|revoke|ban-zone|ban-venue|invite-outside-hours|uncertain",evidence:[]}]. Use actual permission speech or unambiguous named gestures; short replies may answer pending questions. Unknown destination uses zoneId:"",kind:"uncertain". Silence/open doors/third-party claims grant nothing; retain contextual cautions. Optional invitation:{source:0,venueId,zoneId,scope:"shared|private",ownerId,timing:"now|later",accompanies}; accompanies needs an explicit offer. Entry grants no editing authority or movement.`
      : "",
    capabilities.management
      ? `Optional roomEvents may include {kind:"manage-access",actorId,venueId,evidence:[],command:{action,zoneId,...}} for actual explicit management speech. Actions: zone-policy with complete policy; venue-policy with managerIds/visitorHours; lift-ban with banId; exception with permissionId/banIds; revoke with permissionId; destinations with visitorId and home/sleep/work Zone IDs. Use listed authority/IDs, retain unchanged fields, zoneId:null means Venue. No operationId/expectedRevision/sceneId. Guest entry or suggestions change no policy.`
      : "",
    c.conversational
      ? `Resolve submitted local physical attempts in this reply. sceneChange:{happened:true,narration,conditionBefore,conditionAfter,featureId,featureText,publicFactBefore,publicFactAfter,resolveTraceId,addItem,removeItem,transferTo,traceKind,traceText,recipientId,sceneNote}. Omit unused fields. Replacements need exact old IDs/values; conditionAfter is complete. Pickups/handoffs remove listed inventory; transferTo is player or physically present resident, not a remote listener. recipientId is for notes only; notes need a known recipient. New traces need kind/text. sceneNote is temporary layout, never a lasting repair. Locks persist. No invented supplies, consent, elsewhere-deeds, promises-as-results or lasting change without valid metadata. Failure gets narration only. ${c.residentControlled ? "Lasting Residence edits require all required residents' explicit approval of the exact proposal; entry is not edit approval." : ""}`
      : "",
    c.conversational
      ? `Spontaneous proposals can be expressed in speech. Capture upgradeRequest:{source:0} for a concrete structural improvement here; venueRequest:{source:0,name,classes:["workplace|community|other"]} for a NEW public Venue, one or two classes. Source means the complete segment; do not repeat speakerId or quote. Approval starts planning, not construction; accepted commitments remain binding until withdrawn.`
      : "",
    capabilities.residences ? `Optional residenceRequest:{source:0,venueId} for a listed available Residence.` : "",
    capabilities.residenceDecision
      ? `Optional residenceDecision:{source:0,approved} for a pending player move request.`
      : "",
    capabilities.editApproval
      ? `Optional editApproval:{source:0,proposalId,approved} for a listed exact edit proposal.`
      : "",
    c.projects
      ? `Optional interpretationRouting:[{actorId,domain:"project",relevance:"irrelevant|potential|uncertain",targetIds:[],segments:[]}]. Cover all eligible current main speech; uncertainty and short contextual answers remain uncertain/potential. Optional projectSpeech:[{projectId,kind:"approval|builder|requirements",speakerId,citations:[{segment:0}],checklist:[{category:"structure|equipment|finish",title,needed,citation}]}]. Code supplies exact cited quotes (at most 1200 characters) and current revision. For longer speech supply a supported quote explicitly; never omit conditions or negation. Checklist citation indexes its citations array. Speech is no completed work.`
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
        venue.constructionStatus !== "worksite" && !venue.occupancy.playerHome && !venue.occupancy.residentCharacterId,
    ),
    residenceDecision: state.residences.some(
      (move) => move.status === "pending" && move.requestedBy === "player" && actors.includes(move.characterId),
    ),
    editApproval: !!venue?.editProposals?.some(
      (proposal) => !proposal.declined && proposal.requiredIds.some((id) => actors.includes(id)),
    ),
  };
}

/** A malformed captured manifest cannot silently acquire newly available capabilities. */
export function readSceneWritingCapabilities(value: unknown): SceneWritingCapabilities {
  const keys = ["management", "movement", "residences", "residenceDecision", "editApproval"];
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

/** v3 uses reference-only metadata and one concise copy of each mechanical rule. */
export function reliableSceneContract(c: VenueResponseContext, capabilities: SceneWritingCapabilities): string[] {
  return [
    'ONE complete JSON object: playerSpeechCapture first,segments second,effects inside SAME object. Escape strings; omit unused optional fields. No outside prose/Markdown. segments:{speakerId,text} speech and {text} visible narration; code infers kind. Defaults:ordinary/main. Optional delivery:"whisper|shout",presentation:"aside"; whispers require local targetId. Max24 segments,2000 chars each. Metadata:references only.',
    c.zoneEventContract
      ? "ZONE EVENTS. Player speech uses playerSpeechCapture. Code owns witnesses; no listener lists. Ordinary words reach source/adjacent Zones; whispers reach local target; shouts alert Venue but distant listeners hear indistinct noise. Permissions neither block sound nor grant entry. Use captured positions/movement order and each actor’s preceding perceptible evidence. Offstage people stay offstage; never reveal unseen causes, identities, gestures, activity, interiors or explanations of silence. Natural reachable events need no forced reactions. ACTION-BASED SOUND. Nonverbal sound: annotate narration with sound:{sourceId,text,loud?:true}; text is audible-only,max300 chars; sourceId privately routes player/resident sound. Narration is player-observable. Never repeat sound, annotate silence/thoughts/speech, invent impacts or write sound-effect captions. Sound proves no physical deed."
      : c.acousticContract ||
        `Use heardPlayerBy and segment heardBy for actual resident witnesses.${c.opening ? " Opening heardPlayerBy: []." : ""}`,
    'Effects cite returned-segment numbers (0,1,...), "utterance:N" for captured player words; older evidence uses supplied IDs. Never invent "segments:1"/"aqua:1" aliases. Every knower witnesses EVERY citation. No recaps, imagined speech or raw input evidence. Speech signals cite their speaker. Conditions/promises/deeds differ; proposals grant no authority or physical results.',
    'memoryChanges:[{kind:"passing|durable|reinforce|supersede",text,category:"commitment|personal-fact|preference|relationship|shared-experience",subjectCharacterIds:[],knownByCharacterIds:[],evidence:[],memoryIds?:[]}]. Resident IDs only, never player. Passing:24h contextual events; durable:stable facts/preferences/boundaries, commitments or significant experiences. Omit filler, transient mood, weak inference, existing facts; no quota. Reinforce preserves supplied durable text; supersede corrects it; both need supplied memoryIds/new evidence.',
    'relationshipChanges:{changes:[{fromId,toId,dimension:"warmth|trust",strength:"minor|meaningful|major|none",direction:"increase|decrease",ordinary:boolean,reason:"brief grounded reason",lineIds:[],disclosed:boolean}],disclosures:[{kind:"explanation|preference|boundary",source:0,toId?:"player"}],permissions:[{controllerId,visitorId,venueId,zoneId,action:"grant|revoke",lineIds:[]}]}. Substantive company may earn minor warmth; trust needs demonstrated reliability or confidence/boundary interaction. No greeting/repetition/co-location rewards or player-feelings scores. disclosed needs aloud reason; unshared reasons stay private. Disclosure source:complete player-heard speech,max320 chars; longer speech uses faithful {fromId,toId,text,kind,lineIds},text max320. Permission needs controller’s explicit unconditional standing authority for visitor/Zone; one visit differs.',
    capabilities.movement
      ? "contactMoves:[{characterId,zoneId,segment}]. Only completed crossings to a DIFFERENT listed Zone. Current-Zone walking/seating/gates need no row. segment cites narration naming the actor and completed crossing,not intention/conditions. One voluntary move/actor; code supplies quote. Door opening is no crossing. Later speech uses new positions,no retroactive witnesses/unseen journeys/interiors."
      : "",
    c.wishes !== false
      ? 'wishChanges:[{actorId,wishId,intent:"reveal|progress|check",evidence:[]}],listed Wishes only. Reveal needs actor disclosure; progress/check needs meaningful new witnessed evidence. No filler, promises, conditional/quoted claims, invented/fulfilled Wishes; physical results need receipts.'
      : "",
    c.invitationZones && c.invitationZones !== "none"
      ? `Invitation destinations:${c.invitationZones}. roomEvents:[{actorId,venueId,zoneId,kind:"invite-now|invite-later|refuse|dismiss|revoke|ban-zone|ban-venue|invite-outside-hours|uncertain",evidence:[]}]. Actual permission speech or unambiguous named gesture; short answers may resolve pending questions. Unknown destination:zoneId:"",kind:"uncertain". Silence/open doors/third-party claims grant nothing; retain cautions. invitation:{source:0,venueId,zoneId,scope:"shared|private",ownerId,timing:"now|later",accompanies}; accompanies needs explicit offer. Entry grants no editing/movement.`
      : "",
    capabilities.management
      ? 'roomEvents may include {kind:"manage-access",actorId,venueId,evidence:[],command:{action,zoneId,...}} for explicit management speech. Actions:zone-policy(complete policy),venue-policy(managerIds/visitorHours),lift-ban(banId),exception(permissionId/banIds),revoke(permissionId),destinations(visitorId,home/sleep/work Zone IDs). Listed authority/IDs only; retain unchanged fields; zoneId:null means Venue. No operationId/expectedRevision/sceneId. Guest entry/suggestions change no policy.'
      : "",
    c.conversational
      ? "Resolve local physical attempts now. Lasting results need sceneChange:{happened:true,narration,conditionBefore,conditionAfter,featureId,featureText,publicFactBefore,publicFactAfter,resolveTraceId,addItem,removeItem,transferTo,traceKind,traceText,recipientId,sceneNote}. Replacements need exact old IDs/values; conditionAfter is complete. Pickup/handoff removes listed inventory; transferTo:player/physically local resident. recipientId:notes only,known recipient. New traces need kind/text; sceneNote:temporary layout,never repair. Locks persist. No invented supplies/consent,elsewhere deeds,promises-as-results or lasting changes without metadata. Failure:narration only." +
        (c.residentControlled
          ? " Residence edits need every required resident’s explicit approval of exact proposal; entry is not approval."
          : "")
      : "",
    c.conversational
      ? 'Spontaneous proposals:upgradeRequest:{source:0} for structural improvement here; venueRequest:{source:0,name,classes:["workplace|community|other"]} for NEW public Venue,1–2 classes. Approval starts planning,never construction; accepted commitments bind until withdrawn.'
      : "",
    capabilities.residences ? "residenceRequest:{source:0,venueId},listed available Residence only." : "",
    capabilities.residenceDecision ? "residenceDecision:{source:0,approved},pending player move only." : "",
    capabilities.editApproval ? "editApproval:{source:0,proposalId,approved},listed exact proposal only." : "",
    c.projects
      ? 'interpretationRouting:[{actorId,domain:"project",relevance:"irrelevant|potential|uncertain",targetIds:[],segments:[]}]. Cover eligible current main speech; short/contextual/uncertain answers stay potential/uncertain. projectSpeech:[{projectId,kind:"approval|builder|requirements",speakerId,citations:[{segment:0}],checklist:[{category:"structure|equipment|finish",title,needed,citation}]}]. Code supplies full quotes(max1200 chars)/revision; longer speech needs explicit supported quote retaining conditions/negation. Checklist citation indexes citations. Speech is no completed work.'
      : "",
    "departures:[{source:0}],explicit resident departures only; sceneEnded:{source:0},spoken end of WHOLE encounter only. Silence/ordinary company end neither. Player movement requires Move; never return movementIntent/contactIntent/contactRelay. All source fields cite complete returned segments; omit repeated speakerId/quote.",
    c.staging
      ? `${c.presentation}\nPer-segment staging:[{characterId,position?:"left|center|right",expression?,look?:{target:"player"}|{target:"villager",characterId}|{target:"direction",direction:"left|right"}}]. Only changed,motivated cues; one per actor. Omission preserves state; filled expression IDs must match pose. Visual cues establish no knowledge,consent,movement/outcome.`
      : "",
    ...c.expressions,
  ].filter(Boolean);
}
