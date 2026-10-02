/** Internal writing contract; validators and saved-exchange schemas remain authoritative. */
export type VenueResponseContext = {
  opening: boolean;
  conversational: boolean;
  liveMemory: boolean;
  residentControlled: boolean;
  recapNeeded: boolean;
  staging: boolean;
  contactFacts: string;
  invitationZones: string;
  presentation: string;
  expressions: string[];
  projects: boolean;
};

export const VENUE_RESPONSE_EVIDENCE =
  'Use supplied IDs for each field. Targeting is intent, not isolation: heardPlayerBy and each heardBy identify actual witnesses. Moving aside does not guarantee privacy. Private knowledge stays with its knowers. Evidence and relationship lineIds use numeric zero-based segment indexes, "player" for the latest player line, or exact supplied earlier evidence IDs (0 is valid; "0" is not). Every knower must directly witness EVERY cited line. Recaps and unsupplied history are not evidence. Speech signals require speakerId and an exact quote from that resident\'s actual dialogue; hypothetical, quoted, conditional speech, silence, and a different speaker cannot establish consent. Metadata proposes effects; server validation establishes outcomes.';

export const VENUE_LIVE_MEMORY_CONTRACT =
  'Return memoryChanges:[] and relationshipChanges:{changes:[],permissions:[],disclosures:[]} even when empty. Memory rows: {kind:"passing|durable|reinforce|supersede",text,category:"commitment|personal-fact|preference|relationship|shared-experience",subjectCharacterIds:[],knownByCharacterIds:[],evidence:["player",0],memoryIds:[]}. Passing gives useful temporary continuity (24 hours); durable records commitments, stable facts/preferences/boundaries, relationship changes, or significant experiences. Omit greetings, filler, weak inference, transient moods, repetitions, and facts already in world state; there is no promotion quota. Record contextual events, not enduring traits inferred from pauses, dry delivery, or narrator interpretation. Reinforce/supersede require supplied memoryIds and new witnessed evidence: reinforce preserves text; supersede replaces obsolete facts. Memories prove neither physical deeds nor authority. Relationship proposals are independent of memories. Changes: {fromId,toId,dimension:"warmth|trust",strength:"minor|meaningful|major|none",direction:"increase|decrease",ordinary:boolean,reason,lineIds:["player",0],disclosed:boolean}. Score substantive company, warmth, reliability, boundaries, conflict or candid disclosure; never the player\'s feelings. Ordinary positive company can increase warmth, not trust; trust requires demonstrated reliability or meaningful confidence/boundary interaction, not promises or claims. Mere co-location/greetings/repeated wording earn nothing; changes are optional. Disclosed means the resident explained that reason aloud. Permissions: {controllerId,visitorId,venueId,zoneId,action:"grant|revoke",lineIds:[]}, requiring explicit unconditional spoken standing permission/revocation for that visitor and listed Zone. Disclosures: {fromId,toId,text,kind:"explanation|preference|boundary",lineIds:[]}, quoting or closely paraphrasing speech heard by the player; personal preferences/boundaries use toId:"player". Keep unshared reasons private.';

export const VENUE_WISH_CONTRACT =
  'wishChanges:[] or [{actorId,wishId,intent:"reveal|progress|check",evidence:["player",0]}] for listed existing Wishes, citing only this exchange. Reveal requires the wishing resident telling the player what they want. Progress/check needs meaningful new relevant witnessed evidence, not greetings, unrelated company, repetition, physical-work promises, or quoted/conditional claims. Physical results need verified receipts. Never invent wishes, mark fulfillment, or expose hidden wishes.';

export function buildVenueResponseContract(context: VenueResponseContext): string[] {
  return [
    'Return one JSON object only: heardPlayerBy and segments FIRST, bookkeeping afterward. At least one main segment, narration or dialogue. Segments: {kind:"narration|dialogue|side|whisper",text,heardBy:[],speakerId?,expression?,gazeAt?,targetId?,staging?}. Speakers/targets are active IDs; expression is a filled expression ID. Narration has no speakerId and is visible to the active cast. Dialogue/side/whisper require speakerId. Side/whisper attach to the preceding main segment, with their own witnesses; whisper requires targetId. Legacy gazeAt names an active resident or player.' +
      (context.opening ? " Opening heardPlayerBy is empty." : ""),
    VENUE_RESPONSE_EVIDENCE,
    context.contactFacts
      ? 'contactIntent:{kind:"knock|call",targetId,boundaryZoneId,quote,delivery:"voice|loud|device",deliveryQuote,deviceFeatureId} for a CURRENT deliberate knock/call or doorway follow-up in the player\'s words. Unknown target/boundary may be empty. Loud/device delivery needs current-word evidence; deviceFeatureId must exist visibly in this Zone. Normal voice reaches adjacent Zones; loud calls may reach farther, never guaranteeing hearing. Ordinary speech remains local. Historical/hypothetical/quoted mentions are not contact. Server routes the attempt: do not narrate remote answers, movement, invitations, or silence yet. ' +
        context.contactFacts
      : "",
    "Zones that may be invited into: " + context.invitationZones,
    'Only an authorized controller can invite or dismiss through natural dialogue or an unambiguous named gesture; preserve contextual cautions. One-visit permission and unconditional standing invitations are distinct. Silence, an open door alone, quotations and third-party permission establish nothing. Entry grants no edit/inviting authority or automatic movement. Optional invitation:{speakerId,venueId,zoneId,scope:"shared|private",ownerId,timing:"now|later",accompanies,quote}; accompanies=true requires an explicit offer to accompany. Server separately interprets and validates permission.',
    context.residentControlled && context.conversational
      ? "This resident-controlled Residence requires every required resident's explicit approval of the exact Zone edit proposal before sceneChange or any lasting change. Entry is not edit consent."
      : "",
    context.conversational
      ? 'Resolve player physical actions in this SAME reply, including current first-person past tense ("I fixed the drip"). Speech about deeds, unsupported elsewhere-claims, promises, and impossible attempts have no physical effect. sceneChange:{happened:true,narration:"short past-tense public result",conditionBefore,conditionAfter,featureId,featureText,publicFactBefore,publicFactAfter,resolveTraceId,addItem,removeItem,sceneNote}. Omit unused fields; replacements/resolutions need exact old values/IDs, conditionAfter is complete. sceneNote is temporary layout only, never a lasting repair. A locked feature may change; its lock remains. Never narrate a lasting change without a valid sceneChange, invent exceptional supplies/consent, or treat a reaction as physical evidence. Failure gets narration and no sceneChange.'
      : "",
    context.conversational
      ? 'Spontaneous speech signals: residenceRequest:{speakerId,venueId,quote} for an available Residence; residenceDecision:{speakerId,approved,quote} for their pending player move; upgradeRequest:{speakerId,quote} for a concrete structural improvement here; venueRequest:{speakerId,name,classes:["workplace|gathering|other"],quote} for a NEW public Venue (one or two classes); editApproval:{speakerId,proposalId,approved,quote} for a listed exact proposal. Omit unused signals. Approval starts planning, not construction. Existing accepted commitments remain binding until explicitly withdrawn.'
      : "",
    context.projects
      ? 'Optional projectSpeech:[{projectId,revision,kind:"approval|builder|requirements",speakerId,citations:[{segment,quote}],checklist:[{category:"structure|equipment|finish",title,needed,citation}]}] refers only to listed relevant Projects and actual witnessed speech. Each citation uses a segment index and exact quote; checklist citation indexes that citations array. Willingness is not completed work.'
      : "",
    context.recapNeeded
      ? "recap: meaningful earlier context, at most 600 characters, retaining prior recap and private witnesses; omit routine repairs already in world state."
      : "",
    context.liveMemory
      ? VENUE_LIVE_MEMORY_CONTRACT
      : !context.opening
        ? 'recollections:[{text,subjectCharacterIds:[],knownByCharacterIds:[],evidence:["player",0]}]: compact contextual events from THIS exchange, consolidating shared events with identical witnesses. Omit greetings, filler and existing world facts. Capture useful continuity without deciding durability or inferring stable traits from temporary behavior.'
        : "",
    context.liveMemory || !context.opening ? VENUE_WISH_CONTRACT : "",
    context.liveMemory || !context.opening
      ? "departures:[{speakerId,quote}] for an explicit resident departure; sceneEnded:{speakerId,quote} only for dialogue ending the entire encounter, never player silence or ordinary company."
      : "",
    context.presentation,
    ...context.expressions,
    context.staging
      ? 'staging:[{characterId,position?:"left|center|right",expression?,look?:{target:"player"}|{target:"villager",characterId}|{target:"direction",direction:"left|right"}}] on any segment, at most one cue per active character. Filled expression IDs and existing artwork must fit actual actions. Position, expression and attention persist until explicitly changed; omission preserves them. Default expression/player look resets them. Silent listeners may react to witnessed events. Move sides for motivated movement, not speaker changes; turning needs no walking. Main cues appear at first paragraph; side/whisper cues accompany their chatter. Prefer staging to legacy expression/gazeAt. Presentation proves no knowledge, consent, memory or physical outcome.'
      : "Optional gazeAt names an active resident when the speaker looks toward them; omit when facing the player.",
  ].filter(Boolean);
}
