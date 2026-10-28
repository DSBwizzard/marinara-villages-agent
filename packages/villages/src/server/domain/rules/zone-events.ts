import type { VenueLine, VenueReplyLine, VenueScene } from "../models/scene-model.js";
import type { VillageVenue } from "../models/world.js";
import { asRecord, asTrimmedString } from "./coerce.js";
import { badGateway, VillagesRequestError } from "./errors.js";
import { contactNeighbors, contactPosition, type ContactMove } from "./venue-contact.js";
import { isSceneAside, speechDelivery } from "../../../shared/helpers/scene-speech.js";
import { MAX_ZONE_VILLAGERS } from "./venue-model.js";

/** Fresh v6 admissions opt in; paid unmarked work retains its original reach. */
export function zoneSoundRange(scene: VenueScene, venue: VillageVenue, origin: string): string[] {
  const adjacent = contactNeighbors(venue, origin, scene);
  return [...new Set([origin, ...adjacent, ...adjacent.flatMap((id) => contactNeighbors(venue, id, scene))])];
}
export function zoneEventContract(scene: VenueScene): string {
  return scene.operation?.input.soundHopVersion === 1
    ? ZONE_EVENT_CONTRACT.replace(
        "Ordinary speech/asides and sound reach the source and directly connected Zones. Explicit shouting (delivery:shout) or actually very loud sound (loud:true) alerts the Venue; words are clear only locally/adjacently, farther listeners perceive indistinct noise.",
        "Ordinary words are clear only in the source Zone. Directly connected Zones hear indistinct voices or ordinary sound. Explicit shouting (delivery:shout) or very loud sound (loud:true) reaches at most two connections; shouted words carry to directly connected Zones, while farther listeners hear indistinct noise.",
      ).replace("Venue-wide shouts", "connected-Zone shouts") +
        "\nEvery connection behaves alike. Drawing distance changes neither movement nor sound."
    : ZONE_EVENT_CONTRACT;
}

/** Invalid writer metadata, independent of System's movement interpretation. */
export class InvalidNarratedSound extends VillagesRequestError {
  constructor() {
    super(502, "The reply used an invalid narrated sound. Your draft is preserved.");
  }
}

/** One Scene writer resolves events. Code owns their sources and audiences. */
export function zoneEventScene(
  scene: VenueScene,
  venue: VillageVenue,
  intent: { targetId?: string; message?: string; zoneId?: string } = {},
): VenueScene {
  const occupants = (scene.sceneAttendance?.occupants ?? []).filter(
    (person) => !scene.departedIds?.includes(person.characterId),
  );
  // Delivery is never capped. Only the cast offered a reaction/initiative beat is bounded.
  const neighbors = contactNeighbors(venue, scene.zoneId ?? "exterior", scene);
  const remote = occupants.filter((person) => !scene.activeIds.includes(person.characterId));
  const near = remote.filter((person) => neighbors.includes(contactPosition(scene, person.characterId)));
  const far = remote.filter((person) => !neighbors.includes(contactPosition(scene, person.characterId)));
  const beat = scene.submissions.length;
  const rotate = <T>(rows: T[]) =>
    rows.length ? [...rows.slice(beat % rows.length), ...rows.slice(0, beat % rows.length)] : [];
  const continuing = new Set(
    scene.lines
      .filter((line) => !line.contactHidden && line.kind !== "narration" && line.role !== "user")
      .slice(-2)
      .map((line) => line.speakerId),
  );
  const nearby = [
    ...near.filter((person) => continuing.has(person.characterId)),
    ...rotate(near).filter((person) => !continuing.has(person.characterId)),
  ];
  const words = (text: string) =>
    " " +
    text
      .normalize("NFKC")
      .toLocaleLowerCase("en-US")
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim() +
    " ";
  const input = words(intent.message ?? "");
  const named = remote.filter((person) => {
    const first = person.name.split(/\s+/u)[0];
    const uniqueFirst =
      first.length >= 3 &&
      occupants.filter((other) => words(other.name.split(/\s+/u)[0]) === words(first)).length === 1;
    return (
      person.characterId === intent.targetId ||
      input.includes(words(person.name)) ||
      (uniqueFirst && input.includes(words(first)))
    );
  });
  const candidates = [
    ...named.filter((person) => person.characterId === intent.targetId),
    ...named,
    ...remote.filter((person) => contactPosition(scene, person.characterId) === intent.zoneId),
    ...nearby.slice(0, far.length ? 3 : 4),
    ...rotate(far).slice(0, 1),
    ...nearby,
  ];
  const plannedZones = new Set(scene.semanticIntent?.timeline.map((step) => step.zoneId).filter(Boolean));
  const required = remote.filter((person) => plannedZones.has(contactPosition(scene, person.characterId)));
  const offered = [
    ...new Map([...required, ...candidates].map((person) => [person.characterId, person])).values(),
  ].slice(0, Math.max(4, required.length));
  const bounded = !scene.operation || scene.operation.input.castLimitVersion === 1;
  const priority = [
    ...named.filter((person) => person.characterId === intent.targetId).map((person) => person.characterId),
    ...named.map((person) => person.characterId),
    ...scene.activeIds.filter((id) => continuing.has(id)),
    ...scene.activeIds,
    ...offered.map((person) => person.characterId),
  ];
  const actorIds = bounded ? [...new Set(priority)].slice(0, MAX_ZONE_VILLAGERS) : undefined;
  const selected = actorIds ?? [...scene.activeIds, ...offered.map((person) => person.characterId)];
  const cast = selected.flatMap((id) => {
    const person =
      scene.participants.find((entry) => entry.characterId === id) ??
      occupants.find((entry) => entry.characterId === id);
    return person ? [person] : [];
  });
  return {
    ...scene,
    participants: cast,
    contactGeneration: {
      zoneEvents: true,
      venue,
      instruction: "",
      localIds: scene.activeIds,
      remoteIds: offered.map((person) => person.characterId).filter((id) => selected.includes(id)),
      ...(actorIds ? { actorIds } : {}),
    },
  };
}

export const ZONE_PLAYER_SPEECH_CONTRACT =
  'Represent CURRENT player speech first with speakerId:"player"; unquoted roleplay speech is valid. Copy spoken words EXACTLY, excluding actions/thoughts. Interrupted speech uses separate segments or fragments:["first exact span","second exact span"] in source order. No recalled, hypothetical, imagined, example or negated events. Attempted impacts make sound only if they occur. No player speech on arrival/silent input; these segments permit no invented words.';

export const ZONE_SOUND_CONTRACT =
  "Player/supplied-resident noise uses narration.sound:{sourceId,text,loud?:true}; audible-only text,max300 chars. Ambience stays observable narration only,no sound or remote witnesses. No invented sources/impacts/unseen activity, silence/thought/speech tags, repeats or sound-effect captions. Sound proves no deed.";

export const ZONE_EVENT_CONTRACT = [
  "ZONE EVENTS. Resolve this turn in one response. Code routes sound. Return no listener lists, hearing/comprehension flags, attentionWitnesses, acousticReplies or acousticEvents.",
  'Ordered segments: speech {kind:"dialogue",speakerId,text,delivery:"ordinary|whisper|shout",presentation:"main|aside",targetId?}; narration {kind:"narration",text,sound?:{sourceId,text,loud?:true}}. Each key occurs ONCE. Whisper is delivery, never kind, and requires targetId. Either presentation supports every delivery; placement never changes hearing. Include a visible main moment for asides. Offstage speech is dialogue.',
  "Write natural prose, including audible events in their relevant action or reaction. Offscreen sounds reveal only perceptible qualities/direction, never unseen identity, objects, activity or rooms. Do not duplicate noises, add filler sound or use detached sound-effect captions; a meaningful sound may stand alone.",
  ZONE_SOUND_CONTRACT,
  ZONE_PLAYER_SPEECH_CONTRACT,
  "Ordinary speech/asides and sound reach the source and directly connected Zones. Explicit shouting (delivery:shout) or actually very loud sound (loud:true) alerts the Venue; words are clear only locally/adjacently, farther listeners perceive indistinct noise. Whispers reach only their local addressee. Permissions never block sound; sound grants no entry. No cross-Venue sound.",
  "Use captured Scene positions and completed segment movements. Visual narration/gestures are witnessed only in the player's Zone; thoughts are private. Remote residents know only reachable audio and their own witnessed history, never surrounding player narration, private thoughts, unseen actions or others' private knowledge.",
  "Residents may occasionally initiate brief offstage speech/sounds from existing activity without hearing the player; do not force everyone to react or repeat noises. Each reaction uses ONLY preceding perceptible events: local visuals, reachable ordinary audio, directed local whispers or indistinct distant shouts. A source-private activity is not shared knowledge. Never react beyond reach, even to events you wrote, infer an unseen identity/location/activity or explain silence. Quiet distant sounds support no local reaction. Do not invent doors blocking Venue-wide shouts. Hearing forces no reply, consent, waking or movement. Remote dialogue reveals no unseen gestures/interiors.",
  'Evidence uses numeric segment indexes (including player speech) or supplied earlier IDs, never unfiltered "player" input. Narration proves full visual text only locally; remote sound listeners cannot cite surrounding actions. Distant shouts prove no words. Omit routine noise memories; receiving sound requires no updates. No recap, contactIntent, contactRelay or player movement. Physical changes still need validated sceneChange: sound proves no repair, transfer, permission or lasting effect.',
].join("\n");

/** The writer needs reach relationships, not the names of hidden occupied rooms. */
export function zoneEventHearingContext(scene: VenueScene, venue: VillageVenue): string {
  const actors = ["player", ...scene.participants.map((person) => person.characterId)];
  const position = (id: string) => (id === "player" ? (scene.zoneId ?? "exterior") : contactPosition(scene, id));
  return (
    "Hearing relationships (not shared character knowledge): " +
    JSON.stringify(
      actors.map((source) => {
        const origin = position(source);
        const near = [origin, ...contactNeighbors(venue, origin, scene)];
        return {
          source,
          onstage: origin === position("player"),
          wordsReach: actors.filter((id) =>
            scene.operation?.input.soundHopVersion === 1 ? position(id) === origin : near.includes(position(id)),
          ),
          ...(scene.operation?.input.soundHopVersion === 1
            ? {
                raisedWordsReach: actors.filter((id) => near.includes(position(id))),
                muffledVoicesReach: actors.filter((id) => near.includes(position(id)) && position(id) !== origin),
              }
            : {}),
          whisperTargets: actors.filter((id) => id !== source && position(id) === origin),
          alertOnly: actors.filter(
            (id) =>
              !near.includes(position(id)) &&
              (scene.operation?.input.soundHopVersion !== 1 ||
                zoneSoundRange(scene, venue, origin).includes(position(id))),
          ),
        };
      }),
    )
  );
}

function literalPlayerSpeech(row: Record<string, unknown>, message: string): string {
  const fail = () => {
    throw badGateway("The reply invented player speech. Your draft is preserved.");
  };
  if (Array.isArray(row.fragments)) {
    if (!row.fragments.length || row.fragments.length > 24) return fail();
    let cursor = 0;
    const fragments = row.fragments.map((value) => {
      const piece = asTrimmedString(value);
      const index = piece ? message.indexOf(piece, cursor) : -1;
      if (index < 0) return fail();
      cursor = index + piece.length;
      return piece;
    });
    const joined = fragments.join(" ");
    if (row.text !== undefined && asTrimmedString(row.text) !== joined) return fail();
    return joined;
  }
  const text = asTrimmedString(row.text);
  if (!text) return fail();
  if (message.includes(text)) return text;
  // Narrow repair for joined quoted utterances and speech interrupted by *actions*.
  // Every retained fragment is literal; no punctuation, names or words are invented.
  const quotes = [...message.matchAll(/"([^"\n]+)"|“([^”\n]+)”|‘([^’\n]+)’|(?<!\p{L})'([^'\n]+)'(?!\p{L})/gu)].map(
    (match) => asTrimmedString(match[1] ?? match[2] ?? match[3] ?? match[4]),
  );
  const outsideActions = message
    .split(/\*[^*]*\*/u)
    .map((part) => part.trim())
    .filter(Boolean);
  for (const spans of [quotes, outsideActions]) {
    for (let start = 0; start < spans.length; start++) {
      let remaining = text;
      let count = 0;
      for (const piece of spans.slice(start)) {
        if (remaining === piece && count > 0) return text;
        if (remaining.startsWith(piece + " ")) {
          remaining = remaining.slice(piece.length + 1);
          count++;
        }
      }
    }
  }
  return fail();
}

/** Adapt only syntax before the existing parser; segment indexes never change. */
export function zoneEventReply(raw: Record<string, unknown> | null, message: string): Record<string, unknown> | null {
  if (!raw) return raw;
  const segments = Array.isArray(raw.segments) ? raw.segments : raw.lines;
  if (!Array.isArray(segments)) return raw;
  return {
    ...raw,
    heardPlayerBy: [],
    segments: segments.map((value) => {
      const original = asRecord(value);
      const row: Record<string, unknown> = {
        ...original,
        kind:
          original.kind ?? (original.speakerId && original.speakerId !== "__venue_scene__" ? "dialogue" : "narration"),
      };
      const spoken = ["dialogue", "side", "whisper"].includes(String(row.kind));
      if (row.delivery !== undefined && !["ordinary", "whisper", "shout"].includes(String(row.delivery)))
        throw badGateway("The reply used an unknown speech delivery. Your draft is preserved.");
      if (row.presentation !== undefined && !["main", "aside"].includes(String(row.presentation)))
        throw badGateway("The reply used an unknown speech presentation. Your draft is preserved.");
      if (spoken) {
        row.delivery ??= row.kind === "whisper" ? "whisper" : row.loud === true ? "shout" : "ordinary";
        row.presentation ??= row.kind === "side" || row.kind === "whisper" ? "aside" : "main";
        // Retain historical semantic tags for existing evidence consumers, independently
        // of presentation. New model output always uses kind:dialogue for speech.
        row.kind = row.delivery === "whisper" ? "whisper" : row.presentation === "aside" ? "side" : "dialogue";
      } else {
        // A sound's loud flag owns its range; speech styling cannot make it private.
        delete row.delivery;
        delete row.presentation;
      }
      if (row.speakerId === "player" && row.kind !== "sound") {
        if (!spoken) throw badGateway("The reply invented player speech. Your draft is preserved.");
        row.text = literalPlayerSpeech(row, message);
      }
      return { ...row, kind: row.kind === "sound" ? "narration" : row.kind, soundEvent: row.kind === "sound" };
    }),
  };
}

/** No model-authored audiences and no extra evidence lines or index remapping. */
export function routeZoneEvents(
  raw: Record<string, unknown>,
  scene: VenueScene,
  parsed: { lines: VenueReplyLine[]; heardPlayerBy: string[] },
  moves: ContactMove[],
  playerMoves: readonly { zoneId: string; segment: number }[] = [],
) {
  const venue = scene.contactGeneration?.venue;
  if (!venue || !Array.isArray(raw.segments)) return;
  const ids = [
    ...new Set([...(scene.sceneAttendance?.occupants ?? []).map((person) => person.characterId), ...scene.activeIds]),
  ].filter((id) => !scene.departedIds?.includes(id));
  const playerZoneAt = (index: number) =>
    playerMoves.findLast((move) => move.segment <= index)?.zoneId ?? scene.zoneId ?? "exterior";
  const position = (id: string, index: number) =>
    id === "player"
      ? playerZoneAt(index)
      : (moves.find((move) => move.characterId === id && move.segment !== undefined && move.segment <= index)?.zoneId ??
        contactPosition(scene, id));
  const inZones = (zones: string[], index: number) => ids.filter((id) => zones.includes(position(id, index)));
  parsed.heardPlayerBy = [];
  parsed.lines.forEach((line, index) => {
    const playerZone = playerZoneAt(index);
    const row = asRecord((raw.segments as unknown[])[index]);
    const sound = row.kind === "sound" || row.soundEvent === true;
    if (sound && moves.some((move) => move.segment === index))
      throw badGateway("A sound cannot also establish a movement. Your draft is preserved.");
    if (row.kind === "whisper" && line.kind !== "whisper")
      throw badGateway("A whisper needs a recipient. Your draft is preserved.");
    const actor = sound ? asTrimmedString(row.speakerId) : line.speakerId;
    const origin = sound || line.kind !== "narration" ? position(actor, index) : playerZone;
    const sources = scene.contactGeneration?.actorIds ?? [
      ...(scene.contactGeneration?.localIds ?? scene.activeIds),
      ...(scene.contactGeneration?.remoteIds ?? []),
    ];
    if (
      !origin ||
      ((sound || line.kind !== "narration") && actor !== "player" && (!ids.includes(actor) || !sources.includes(actor)))
    )
      throw badGateway("The reply used an unknown sound source. Your draft is preserved.");
    line.zoneId = origin;
    const local = inZones([origin], index);
    const near = [origin, ...contactNeighbors(venue, origin, scene)];
    const spoken = line.kind === "dialogue" || line.kind === "side";
    const loud = sound ? row.loud === true : speechDelivery(line) === "shout" && spoken;
    const bounded = scene.operation?.input.soundHopVersion === 1;
    const loudZones = zoneSoundRange(scene, venue, origin);
    const loudIds = bounded ? inZones(loudZones, index) : ids;
    const playerLoud = !bounded || loudZones.includes(playerZone);
    const playerNear = near.includes(playerZone);
    line.heardBy = sound
      ? loud
        ? loudIds
        : inZones(near, index)
      : spoken
        ? bounded && !loud
          ? local
          : inZones(near, index)
        : local;
    if (speechDelivery(line) === "whisper") {
      if (
        !line.targetId ||
        (line.targetId !== "player" && !local.includes(line.targetId)) ||
        (line.targetId === "player" && origin !== playerZone)
      )
        throw badGateway("A whisper needs a recipient in the same Zone. Your draft is preserved.");
      line.heardBy = local.filter((id) => id === actor || id === line.targetId);
    }
    if (actor === "player" && !sound) {
      line.role = "user";
      line.speakerId = "";
      line.contactHidden = true;
      line.attentionEvidence = true;
    } else if (sound) {
      line.speakerId = "__venue_scene__";
      line.contactHidden = loud ? !playerLoud : !playerNear;
    } else if (line.kind !== "narration") {
      line.viaDoorway = origin !== playerZone;
      line.contactHidden =
        (bounded && !loud && spoken ? origin !== playerZone : !playerNear) ||
        (speechDelivery(line) === "whisper" && line.targetId !== "player");
    }
    if (row.sound !== undefined) {
      const cue = asRecord(row.sound);
      const sourceId = asTrimmedString(cue.sourceId);
      const text = asTrimmedString(cue.text);
      if (
        sound ||
        line.kind !== "narration" ||
        !text ||
        text.length > 300 ||
        (cue.loud !== undefined && typeof cue.loud !== "boolean") ||
        (sourceId !== "__venue_scene__" &&
          sourceId !== "player" &&
          (!ids.includes(sourceId) || !sources.includes(sourceId)))
      )
        throw new InvalidNarratedSound();
      // Narrator-tagged ambience stays ordinary local prose, even with loud:true.
      // It has no actor position and cannot grant remote hearing or evidence.
      if (sourceId !== "__venue_scene__") {
        const sourceZone = position(sourceId, index);
        if (!sourceZone) throw badGateway("The reply used an unknown sound source. Your draft is preserved.");
        const soundZones = [sourceZone, ...contactNeighbors(venue, sourceZone, scene)];
        const loudRange = zoneSoundRange(scene, venue, sourceZone);
        if (cue.loud === true ? bounded && !loudRange.includes(playerZone) : !soundZones.includes(playerZone))
          throw badGateway("The reply narrated a sound outside hearing range. Your draft is preserved.");
        // Full prose remains local. Other listeners receive only the acoustic cue,
        // under this same line ID; neither visuals nor evidence audiences expand.
        line.soundOnly = {
          characterIds: (cue.loud === true
            ? bounded
              ? inZones(loudRange, index)
              : ids
            : inZones(soundZones, index)
          ).filter((id) => !local.includes(id)),
          player: false,
          text,
        };
      }
    }
    if (spoken && (loud || bounded)) {
      const wordZones = loud || !bounded ? near : [origin];
      const audibleIds = loud ? loudIds : inZones(near, index);
      const distant = audibleIds.filter((id) => !wordZones.includes(position(id, index)));
      const playerNoise = !wordZones.includes(playerZone) && (loud ? playerLoud : playerNear);
      if (distant.length || playerNoise)
        line.soundOnly = {
          characterIds: distant,
          player: playerNoise,
          text: loud
            ? "A loud voice calls out elsewhere in the Venue; the words are indistinct."
            : "Indistinct voices carry from a connected Zone; the words are unclear.",
        };
    }
    // Visual staging cannot disclose offstage residents, even on an audible line.
    line.staging = line.staging?.filter((cue) => position(cue.characterId, index) === playerZone);
  });
  // Hidden player speech and inaudible events must never own visible bubbles.
  const visible = parsed.lines
    .map((line, index) => ({ line, index }))
    .filter(({ line }) => !line.contactHidden || line.soundOnly?.player);
  let main = visible.filter(({ line }) => !isSceneAside(line));
  if (!main.length && visible.length) {
    visible[0]!.line.presentation = "main";
    main = [visible[0]!];
  }
  for (const { line, index } of visible) {
    delete line.anchorIndex;
    if (isSceneAside(line)) line.anchorIndex = (main.findLast((entry) => entry.index < index) ?? main[0])?.index;
  }
}

/** A distant listener's history contains the cue, never the original words. */
export function perceivedZoneLine(line: VenueLine, characterId: string): VenueLine {
  return !line.heardBy.includes(characterId) && line.soundOnly?.characterIds.includes(characterId)
    ? {
        ...line,
        speakerId: "__venue_scene__",
        name: "Narration",
        kind: "narration",
        content: line.soundOnly.text,
        heardBy: [...line.soundOnly.characterIds],
        soundOnly: undefined,
      }
    : line;
}
