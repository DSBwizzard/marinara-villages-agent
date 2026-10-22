import { LIVE_MEMORY_INSTRUCTION } from "./live-exchange.js";
/** Internal writing contract; validators and saved-exchange schemas remain authoritative. */
export type VenueResponseContext = {
  opening: boolean;
  conversational: boolean;
  liveMemory: boolean;
  residentControlled: boolean;
  recapNeeded: boolean;
  staging: boolean;
  contactFacts: string;
  explicitActions?: boolean;
  contactAction?: boolean;
  naturalAttention?: boolean;
  acousticContract?: string;
  zoneEventContract?: string;
  invitationZones: string;
  presentation: string;
  expressions: string[];
  projects: boolean;
  /** Omitted preserves legacy callers; false means no existing Wish can be proposed. */
  wishes?: boolean;
  exampleSpeakerId?: string;
  exampleWitnessIds?: string[];
};

/** Syntax examples teach the boundary without supplying dialogue or mannerisms to imitate. */
export function buildVenueTextContract(speakerId?: string, heardBy: string[] = [], opening = false): string {
  const direction =
    "Each text value is one JSON string. Dialogue, side and whisper text contain only that speaker's audible words; action, description and delivery belong in separate narration segments. Order segments by the actual encounter. A reply may be entirely dialogue or narration; neither kind requires the other beside it. Escape quotation marks inside text; never continue scene prose outside a text value or the JSON object. Segment kinds provide attribution, so do not wrap an entire spoken line in quotation marks or add speaker labels. Evidence indexes count EVERY segment from zero, including narration, side and whisper. A spoken disclosure cites that resident's own speech, not neighboring narration.";
  if (!speakerId) return direction;
  const dialogue = (text: string) => ({ kind: "dialogue", speakerId, text, heardBy });
  const heardPlayerBy = opening ? [] : heardBy;
  const bookkeeping = {
    wishChanges: [],
    memoryChanges: [],
    relationshipChanges: { changes: [], permissions: [], disclosures: [] },
  };
  const examples = [
    { heardPlayerBy, segments: [dialogue('spoken words containing a quoted phrase: "quoted words"')], ...bookkeeping },
    {
      heardPlayerBy,
      segments: [{ kind: "narration", text: "observable event", heardBy }],
      ...bookkeeping,
    },
  ];
  return (
    direction +
    "\nSyntax illustrations only: replace the placeholder text with this encounter's content, use its actual witnesses, and include the required bookkeeping. Neither illustration prescribes a response shape or an action.\n" +
    examples.map((example) => JSON.stringify(example)).join("\n")
  );
}

export const VENUE_RESPONSE_EVIDENCE =
  'Use supplied IDs for each field. Targeting is intent, not isolation: heardPlayerBy and each heardBy identify actual witnesses. Moving aside does not guarantee privacy. Private knowledge stays with its knowers. Evidence and relationship lineIds use numeric zero-based segment indexes, "player" for the latest player line, or exact supplied earlier evidence IDs (0 is valid; "0" is not). Every knower must directly witness EVERY cited line. Recaps and unsupplied history are not evidence. Speech signals require speakerId and an exact quote from that resident\'s actual dialogue; hypothetical or quoted speech, silence, and a different speaker cannot establish consent. Conditional willingness is not an unconditional commitment or standing invitation; contextual entry cautions remain meaningful. Metadata proposes effects; server validation establishes outcomes.';

export const VENUE_LIVE_MEMORY_CONTRACT = LIVE_MEMORY_INSTRUCTION;

export const VENUE_WISH_CONTRACT =
  'Return wishChanges:[] even when there are no Wish updates, or [{actorId,wishId,intent:"reveal|progress|check",evidence:["player",0]}] for listed existing Wishes, citing only this exchange. Reveal requires the wishing resident telling the player what they want. Progress/check needs meaningful new relevant witnessed evidence, not greetings, unrelated company, repetition, physical-work promises, or quoted/conditional claims. Physical results need verified receipts. Never invent wishes, mark fulfillment, or expose hidden wishes.';

export function buildVenueResponseContract(context: VenueResponseContext): string[] {
  return [
    'Return one JSON object only: heardPlayerBy and segments FIRST, bookkeeping afterward. Required bookkeeping keys are wishChanges, memoryChanges, and relationshipChanges (changes, permissions, disclosures arrays). Include them even when empty; other proposals are optional. At least one main segment, narration or dialogue. Segments: {kind:"narration|dialogue|side|whisper",text,heardBy:[],speakerId?,expression?,gazeAt?,targetId?,staging?}. Speakers are active resident IDs; whisper targetId is an active resident ID or "player". heardBy and heardPlayerBy contain resident IDs only. Expression is a filled expression ID. Narration has no speakerId and is visible to the active cast. Dialogue/side/whisper require speakerId. Side/whisper attach to the preceding main segment, with their own witnesses; whisper requires targetId. Legacy gazeAt names an active resident or player.' +
      (context.opening ? " Opening heardPlayerBy is empty." : ""),
    context.zoneEventContract ||
      context.acousticContract ||
      buildVenueTextContract(context.exampleSpeakerId, context.exampleWitnessIds, context.opening),
    context.zoneEventContract
      ? "Use supplied IDs. Every knower must witness every citation; recaps are not evidence. Speech signals require exact quotes from that speaker, never quoted/hypothetical speech or silence. Conditional willingness is not unconditional commitment. Metadata only proposes effects; code validates outcomes."
      : VENUE_RESPONSE_EVIDENCE,
    'roomEvents:[] or [{actorId,venueId,zoneId,kind:"invite-now|invite-later|refuse|dismiss|revoke|ban-zone|ban-venue|invite-outside-hours|uncertain",evidence:[0]}] identifies ONLY actual permission speech or named doorway gestures in this exchange. Cite exact segment indexes; omit unrelated residents and Zones. Unknown destination uses zoneId:"" and uncertain. A short answer can answer a pending entry question; ordinary conversation, planning and movement alone are not permission events. This proposes interpretation only; server authority and evidence checks grant access.',
    'For an explicit access-management change by a listed authorized manager, roomEvents may instead contain {kind:"manage-access",actorId,venueId,evidence:[exact spoken segment indexes],command:{action,zoneId,...}}. Actions: zone-policy with a complete policy retaining unchanged fields; venue-policy with managerIds and visitorHours; lift-ban with banId; exception with permissionId and banIds; revoke with permissionId; destinations with visitorId and home/sleep/work Zone IDs. Use exact listed IDs. Scope zoneId:null means Venue; other scopes use exact Zone ID. Never include operationId, expectedRevision or sceneId. A manager must explicitly establish each changed field in witnessed speech; metadata, casual suggestions and guest entry imply no approval. Keep management metadata out of narration.',
    context.projects
      ? 'interpretationRouting:[{actorId,domain:"project",relevance:"irrelevant|potential|uncertain",targetIds:[],segments:[]}] classifies Project consent, lead commitment or withdrawal. Include eligible current main dialogue segments using zero-based indexes. Potential targets use supplied Project IDs. Short contextual answers and ambiguity use uncertain or potential. Never grants approval or completed work. Omit private side/whisper segments.'
      : "",
    context.contactFacts
      ? 'contactIntent:{kind:"knock|call",targetId,boundaryZoneId,quote,delivery:"voice|loud|device",deliveryQuote,deviceFeatureId} for a CURRENT deliberate knock/call or doorway follow-up in the player\'s words. Unknown target/boundary may be empty. Loud/device delivery needs current-word evidence; deviceFeatureId must exist visibly in this Zone. Normal voice reaches adjacent Zones; loud calls may reach farther, never guaranteeing hearing. Ordinary speech remains local. Historical/hypothetical/quoted mentions are not contact. Server routes the attempt: do not narrate remote answers, movement, invitations, or silence yet. ' +
        context.contactFacts
      : "",
    "Zones that may be invited into: " + context.invitationZones,
    context.zoneEventContract
      ? "Player movement requires Move. Use Zone events for ordinary speech/actions; do not return contactIntent, contactRelay or movementIntent."
      : context.conversational && context.explicitActions
        ? context.naturalAttention
          ? "Natural attention uses only the supplied audible fragments and their validated adjacent audience. The complete player input remains local. Resolve attempts before granting sound witnesses. Keep ordinary local physical actions subject to validation. Do not return contactIntent, movementIntent or contactRelay; player movement still requires Move."
          : context.contactAction
            ? "This explicit Contact attempt uses only the audience supplied by CONTACT RESPONSE below. Player movement requires Move. Do not return contactIntent, movementIntent or contactRelay, expand the remote audience, or narrate the player entering another Zone."
            : "Say / Do affects only the current Zone and its listed physical occupants, including shouts and device mentions. Contact is a separate explicit action. Player movement requires Move; written movement does not move the player. If requested here, explain the available control briefly instead of narrating an unperformed move. Do not return contactIntent or movementIntent, invent remote witnesses or answers, or perform automatic doorway follow-ups."
        : context.conversational
          ? "Optional movementIntent:{zoneId,quote} nominates only a CURRENT standalone player move to one listed named Zone, quoting their entire input. Invitations, quoted/hypothetical movement and AI-invented choices never move the player. Code validates access and writes the transition. Combined cross-Zone speech or deeds require separate turns; never guess witnesses or generate an arrival exchange. Movement alone earns no memories, relationships or Wish progress."
          : "",
    'Only an authorized controller can invite or dismiss through natural dialogue or an unambiguous named gesture; preserve contextual cautions. One-visit permission and unconditional standing invitations are distinct. Silence, an open door alone, quotations and third-party permission establish nothing. Entry grants no edit/inviting authority or automatic movement. Optional invitation:{speakerId,venueId,zoneId,scope:"shared|private",ownerId,timing:"now|later",accompanies,quote}; accompanies=true requires an explicit offer to accompany. Server separately interprets and validates permission.',
    context.residentControlled && context.conversational
      ? "This resident-controlled Residence requires every required resident's explicit approval of the exact Zone edit proposal before sceneChange or any lasting change. Entry is not edit consent."
      : "",
    context.conversational
      ? 'Resolve player physical actions in this SAME reply, including current first-person past tense ("I fixed the drip"). Speech about deeds, unsupported elsewhere-claims, promises, and impossible attempts have no physical effect. sceneChange:{happened:true,narration:"short past-tense public result",conditionBefore,conditionAfter,featureId,featureText,publicFactBefore,publicFactAfter,resolveTraceId,addItem,removeItem,transferTo,traceKind,traceText,recipientId,sceneNote}. Omit unused fields; replacements/resolutions need exact old values/IDs, conditionAfter is complete. Actual pickups/handoffs remove exact listed inventory and set transferTo to "player" or a resident physically in this Zone; remote speech cannot receive an item. recipientId belongs only to a note, never a transfer. New traces need traceKind and traceText; notes need a known resident recipientId. sceneNote is temporary layout only, never a lasting repair. A locked feature may change; its lock remains. Never narrate a lasting change without a valid sceneChange, invent exceptional supplies/consent, or treat a reaction as physical evidence. Failure gets narration and no sceneChange.'
      : "",
    context.conversational
      ? 'Spontaneous speech signals: residenceRequest:{speakerId,venueId,quote} for an available Residence; residenceDecision:{speakerId,approved,quote} for their pending player move; renovationRequest:{speakerId,quote} for a concrete structural improvement here; venueRequest:{speakerId,name,classes:["workplace|community|other"],quote} for a NEW public Venue (one or two classes); editApproval:{speakerId,proposalId,approved,quote} for a listed exact proposal. Omit unused signals. Approval starts planning, not construction. Existing accepted commitments remain binding until explicitly withdrawn.'
      : "",
    context.projects
      ? 'Optional projectSpeech:[{projectId,revision,kind:"approval|builder|withdrawal",speakerId,citations:[{segment,quote}]}] requires exact witnessed speaker dialogue about a supplied Project and revision. Approval and volunteering are independent and can share one exchange. No speech starts or completes work.'
      : "",
    context.recapNeeded
      ? "recap: meaningful earlier context, at most 600 characters, retaining prior recap and private witnesses; omit routine repairs already in world state."
      : "",
    context.liveMemory
      ? context.zoneEventContract
        ? VENUE_LIVE_MEMORY_CONTRACT.replace(/ In acoustic Scenes,[^.]+\./u, "")
            .replace(
              "Return memoryChanges:[] and relationshipChanges:{changes:[],permissions:[],disclosures:[]} even when empty. ",
              "",
            )
            .replaceAll('["player",0]', "[0]")
        : VENUE_LIVE_MEMORY_CONTRACT
      : !context.opening
        ? 'recollections:[{text,subjectCharacterIds:[],knownByCharacterIds:[],evidence:["player",0]}]: compact contextual events from THIS exchange, consolidating shared events with identical witnesses. Omit greetings, filler and existing world facts. Capture useful continuity without deciding durability or inferring stable traits from temporary behavior.'
        : "",
    context.liveMemory || !context.opening
      ? context.wishes === false
        ? "Return wishChanges:[]; no existing Wishes are available for updates."
        : VENUE_WISH_CONTRACT
      : "",
    context.liveMemory || !context.opening
      ? "departures:[{speakerId,quote}] for an explicit resident departure; sceneEnded:{speakerId,quote} only for dialogue ending the entire encounter, never player silence or ordinary company."
      : "",
    context.presentation,
    ...context.expressions,
    context.staging
      ? 'staging:[{characterId,position?:"left|center|right",expression?,look?:{target:"player"}|{target:"villager",characterId}|{target:"direction",direction:"left|right"}}] on any segment, at most one cue per active character. Filled expression IDs and existing artwork must fit actual actions. Position, expression and attention persist until explicitly changed; omission preserves them. Default expression/player look resets them. Silent listeners may react to witnessed events. Move sides for motivated movement, not speaker changes; turning needs no walking. Main cues appear at first paragraph; side/whisper cues accompany their chatter. Prefer staging to legacy expression/gazeAt. Presentation proves no knowledge, consent, memory or physical outcome.'
      : "Optional gazeAt names an active resident when the speaker looks toward them; omit when facing the player.",
  ]
    .filter(Boolean)
    .map((text, index) =>
      context.zoneEventContract && index === 0
        ? "Return one JSON object: segments FIRST, then required wishChanges:[], memoryChanges:[], relationshipChanges:{changes:[],permissions:[],disclosures:[]}, even when empty. Other proposals are optional. Use the ZONE EVENTS segment contract. Optional expression, gazeAt and staging are visual only."
        : context.zoneEventContract && text === VENUE_WISH_CONTRACT
          ? text.replaceAll('["player",0]', "[0]")
          : text,
    );
}
