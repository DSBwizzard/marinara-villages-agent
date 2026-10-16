import { contactPosition } from "../../domain/rules/venue-contact.js";
import { venueZones } from "../../domain/rules/venue-zones.js";
import type { VenueScene } from "../../domain/models/scene-model.js";
import type { ContactIntent } from "../../domain/rules/venue-contact.js";
import { buildVenueTextContract } from "../../domain/rules/venue-response-contract.js";
export function acousticInstructions(
  scene: VenueScene,
  intent: ContactIntent,
  venue: import("../../domain/models/world.js").VillageVenue,
) {
  const fragments = intent.attention!.fragments;
  const localIds = scene.activeIds;
  const speakerId = localIds[0];
  const segments: Array<{ kind: string; text: string; heardBy: string[]; speakerId?: string }> = [];
  const attentionWitnesses = fragments.map((fragment) => {
    const segment = segments.length;
    if (fragment.kind === "sound")
      segments.push({ kind: "narration", text: "observable sound event in the player's Zone", heardBy: localIds });
    return {
      id: fragment.id,
      emitted: true,
      heardBy: speakerId ? [speakerId] : [],
      understoodBy: fragment.kind === "speech" && speakerId ? [speakerId] : [],
      ...(fragment.kind === "sound" ? { segment } : {}),
    };
  });
  const replySegment = segments.length;
  if (speakerId) segments.push({ kind: "dialogue", speakerId, text: "spoken words", heardBy: [speakerId] });
  if (!segments.length) segments.push({ kind: "narration", text: "observable event", heardBy: [] });
  const example = {
    heardPlayerBy: [],
    segments,
    attentionWitnesses,
    acousticReplies: speakerId
      ? [
          {
            segment: replySegment,
            delivery: "ordinary",
            outward: false,
            heardBy: [speakerId],
            understoodBy: [speakerId],
            playerHeard: true,
            playerUnderstood: true,
          },
        ]
      : [],
    acousticEvents: [],
    wishChanges: [],
    memoryChanges: [],
    relationshipChanges: { changes: [], permissions: [], disclosures: [] },
  };
  return [
    "ACTION-BASED SOUND v5. One response resolves emission, hearing, word comprehension and voluntary reactions.",
    "The player stays in " +
      (scene.zoneId ?? "exterior") +
      ". All candidate residents are private context, NOT witnesses. Never reveal unseen attendance, interiors, private activities or causes of silence.",
    "Intended physical target: " +
      (intent.physicalTargetId ?? "unspecified") +
      ". Direction is intent, never an exclusive audience.",
    "Local resident IDs: " +
      JSON.stringify(localIds) +
      ". Listener arrays contain resident IDs only; never player, names, Zone IDs or fragment IDs.",
    buildVenueTextContract(),
    "Connections: " + JSON.stringify(venueZones(venue).map((zone) => ({ id: zone.id, connectedTo: zone.connectedTo }))),
    "Fragments: " +
      JSON.stringify(
        intent.attention!.fragments.map((fragment) => ({
          id: fragment.id,
          kind: fragment.kind,
          delivery: fragment.delivery,
          ...(fragment.targetZoneId ? { targetZoneId: fragment.targetZoneId } : {}),
          source: intent.quote.slice(fragment.start, fragment.end),
          possibleListeners: (scene.sceneAttendance?.occupants ?? [])
            .filter((person) => fragment.zoneIds.includes(contactPosition(scene, person.characterId)))
            .map((person) => person.characterId),
          possibleWordListeners: (scene.sceneAttendance?.occupants ?? [])
            .filter((person) => fragment.wordZoneIds?.includes(contactPosition(scene, person.characterId)))
            .map((person) => person.characterId),
        })),
      ),
    "A fragment's possibleListeners permit SOUND; possibleWordListeners permit WORDS. Local residents may hear/understand speech if actually delivered. Failed attempts and hypothetical/private thoughts emit nothing. No invented doors, walls, distance or soundproofing. Access restrictions alone do not block sound.",
    "Required top-level attentionWitnesses: exactly one object per supplied fragment, with its EXACT id and REQUIRED boolean emitted, heardBy array and understoodBy array. Never substitute a resident ID for the fragment id. emitted is true or false, never a string or omitted. Return [] when there are no fragments. understoodBy is a subset of heardBy, empty for sound fragments. An emitted sound also requires a numeric segment citing visible narration establishing the actual event; speech needs no segment. Notice depends on established activity, never force everyone to react.",
    "Player sound attempts (throws, knocks, impacts) belong ONLY in attentionWitnesses. If the sound occurs, put its narration index in THAT SAME row's segment field. If it fails silently, use emitted:false with empty witnesses. Never put the player's event in acousticEvents or attribute it to a resident. The player acts in their current Zone; do not relocate their action into an unseen resident's space. Remote listeners hear noise, not the accompanying narration or private activity.",
    'Noise-only listeners know only a sound occurred; they cannot quote, answer or remember words they did not understand. "attention:0" cites WORDS for speech and SOUND for a sound event. "sound:attention:0" cites generic sound only. "player" cites the complete local-only input.',
    'Memory evidence must match EVERY knower: use attention fragment IDs for remote-heard player words, numeric dialogue indexes for a speaker’s own statements, and reply-sound aliases for noise only. Never cite "player" for remote knowers or narration they could not witness. For mixed input such as a private thought plus "Can I come in?", cite only the spoken fragment for remote memories. Omit unsupported claims rather than citing the whole input. Hearing a noise does not establish its cause or unseen actions.',
    "Ordinary clanks, rattles and mechanical movement are ordinary sound. Reserve exceptional for explicitly extreme physical events comparable to a gunshot or explosion, never merely to attract attention. Do not invent a new noise on each turn to keep a conversation going. Use one narration segment per physical sound event, not both a separate audible description and another segment describing the same event. Describe only audible qualities of remote sounds; omit unseen causes and interiors.",
    'For EVERY dialogue segment return acousticReplies:[{segment:0,delivery:"ordinary|call|shout",outward:true|false,heardBy:[],understoodBy:[],playerHeard:true|false,playerUnderstood:true|false}].',
    'For an additional NPC physical sound event, return acousticEvents:[{segment:0,speakerId:"resident ID",delivery:"ordinary|call|shout|exceptional",emitted:true|false,heardBy:[],playerHeard:true|false}]. This array is ONLY for a separate resident-generated sound, never the player fragment. Cite its actual completed narration segment. Use separate segments for completed movement and physical sound; one segment cannot carry both. A failed/imagined event emits nothing. Events carry sound only, never accompanying narration as words. Apply the same reach limits and sequential noticing. No unseen gestures/interiors: an offscreen sound is projected as anonymous noise only. Return [] when there is no additional resident sound event.',
    "For replies, ordinary voice reaches local+directly connected spaces as sound; words cross connected spaces only when outward or continuing an established exchange. Calling permits words in connected spaces. Shouting permits sound throughout the Venue, words only locally and in directly connected spaces. The player follows the same rules. A listener may react after hearing an earlier reply in this response; never generate a separate exchange or fetch/relay stage.",
    "No full speech can be public if playerUnderstood is false. Player-heard indistinct voices appear only as anonymous noise. A remote reply needs a previously heard event. Preserve each resident's witnessed history and exact movement timing; no unseen journeys, handoffs or fabricated player movement. Dialogue need not involve every listener; keep the response within normal output limits.",
    '"reply-sound:0" cites generic noise from dialogue segment zero, never its words. Normal segment indices cite its words only for understoodBy. Do not create a memory/wish per listener merely for hearing a noise; use existing bounded proposals only when meaningful. heardPlayerBy is ONLY local witnesses of the complete input. No contactRelay, player movement or offscreen physical changes.',
    "Keep bookkeeping compact: use empty arrays when no meaningful update is supported. Omit unused optional fields and recap. Do not restate narration in bookkeeping unless needed for a supported memory.",
    "Complete JSON syntax illustration for these exact fragment IDs; replace placeholder text, choose actual emission/witnesses and delivery, and add rows for every actual dialogue/event segment. This illustrates structure only, not whether an action succeeds or who must respond. " +
      JSON.stringify(example),
  ].join("\n");
}
