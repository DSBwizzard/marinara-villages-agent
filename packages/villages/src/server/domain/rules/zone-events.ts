import type { VenueReplyLine, VenueScene } from "../models/scene-model.js";
import type { VillageVenue } from "../models/world.js";
import { asRecord, asTrimmedString } from "./coerce.js";
import { badGateway, VillagesRequestError } from "./errors.js";
import { contactNeighbors, contactPosition, type ContactIntent, type ContactMove } from "./venue-contact.js";
import { isSceneAside, MAX_SCENE_ASIDES, speechDelivery } from "../../../shared/helpers/scene-speech.js";
import { MAX_ZONE_VILLAGERS } from "./venue-model.js";
import { readStagingCues } from "../../../shared/helpers/scene-staging.js";
import { sceneLayoutVenue } from "./scene-layout.js";
import { venueZones } from "./venue-zones.js";

/** Loud sound reaches at most two captured Zone connections. */
export function zoneSoundRange(scene: VenueScene, venue: VillageVenue, origin: string): string[] {
  const adjacent = contactNeighbors(venue, origin, scene);
  return [...new Set([origin, ...adjacent, ...adjacent.flatMap((id) => contactNeighbors(venue, id, scene))])];
}

/** Invalid writer metadata, independent of System's movement interpretation. */
export class InvalidNarratedSound extends VillagesRequestError {
  constructor() {
    super(502, "The reply used an invalid narrated sound. Your draft is preserved.");
  }
}

const words = (text: string) =>
  " " +
  text
    .normalize("NFKC")
    .toLocaleLowerCase("en-US")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim() +
  " ";

export function addressedSceneResidents<T extends { name: string; characterId: string }>(
  message: string,
  candidates: readonly T[],
  occupants: readonly { name: string }[],
  targetId?: string,
) {
  const speech = message.normalize("NFKC").toLocaleLowerCase("en-US");
  const literalName = (name: string) =>
    name
      .normalize("NFKC")
      .toLocaleLowerCase("en-US")
      .replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const addresses = (name: string, surname = "") => {
    const literal = literalName(name);
    const fullNameFollows = surname ? `(?!\\s+${literalName(surname)}(?=[\\s’'.,!?]|$))` : "";
    return new RegExp(
      `(?:^|[.!?\\n“"‘'])\\s*(?:(?:(?:hey|hello|hi),?\\s+)?${literal}(?=\\s*[,.:!?]|\\s*$)|(?:i\\s+)?(?:ask|tell|say to|speak to|call(?: out)?(?: to| for)?|shout(?: to| at)?|yell(?: to| at)?)\\s+${literal}(?![\\p{L}\\p{N}’'])${fullNameFollows})`,
      "u",
    ).test(speech);
  };
  return candidates.filter((person) => {
    const first = person.name.split(/\s+/u)[0];
    const uniqueFirst =
      first.length >= 3 &&
      occupants.filter((other) => words(other.name.split(/\s+/u)[0]) === words(first)).length === 1;
    return (
      person.characterId === targetId ||
      addresses(person.name) ||
      (uniqueFirst && addresses(first, person.name.slice(first.length).trim()))
    );
  });
}

/** One Scene writer resolves events. Code owns their sources and audiences. */
export function zoneEventScene(
  scene: VenueScene,
  venue: VillageVenue,
  intent: {
    targetId?: string;
    message?: string;
    zoneId?: string;
    contactKind?: ContactIntent["kind"];
    priorityIds?: string[];
  } = {},
): VenueScene {
  const occupants = (scene.sceneAttendance?.occupants ?? []).filter(
    (person) => !scene.departedIds?.includes(person.characterId),
  );
  // Delivery is never capped. Only the cast offered a reaction/initiative beat is bounded.
  const neighbors = contactNeighbors(venue, scene.zoneId ?? "exterior", scene);
  const near = occupants.filter((person) => neighbors.includes(contactPosition(scene, person.characterId)));
  const move = scene.navigationReceipts?.at(-1);
  const previous = move && scene.submissions.findLast((turn) => turn.acceptance.status === "applied");
  const previousSpeakers = new Set<string>();
  if (
    move &&
    move.originZoneId !== move.destinationZoneId &&
    move.destinationZoneId === scene.zoneId &&
    previous?.zoneIdAtTurn === move.originZoneId &&
    Date.parse(previous.at) <= Date.parse(move.at)
  ) {
    const replyIds = new Set(previous.replyLineIds);
    for (const line of scene.lines) {
      if (
        replyIds.has(line.id) &&
        line.kind === "dialogue" &&
        line.zoneId === move.originZoneId &&
        !line.contactHidden &&
        !line.viaDoorway &&
        line.heardBy?.includes("player")
      )
        previousSpeakers.add(line.speakerId);
    }
  }
  const continuing = new Set(
    scene.lines
      .filter((line) => !line.contactHidden && line.kind !== "narration" && line.role !== "user")
      .slice(-2)
      .map((line) => line.speakerId),
  );
  const layout = venueZones(sceneLayoutVenue(venue, scene));
  const seenZones = new Set(layout.filter((zone) => zone.seen && !zone.closed).map((zone) => zone.id));
  const established = near.filter((person) =>
    scene.doorwayContacts?.some(
      (contact) =>
        contact.characterId === person.characterId &&
        contact.playerZoneId === scene.zoneId &&
        contact.characterZoneId === contactPosition(scene, person.characterId),
    ),
  );
  // Only native Contact actions and established contacts open a doorway voice path.
  const publicDoorway = new Set(
    scene.zoneId === "exterior" || scene.area === "outside" || intent.zoneId
      ? layout
          .filter((zone) => zone.kind === "public" && !zone.closed && (!intent.zoneId || zone.id === intent.zoneId))
          .map((zone) => zone.id)
      : [],
  );
  const atPublicDoorway = ({ characterId }: { characterId: string }) =>
    publicDoorway.has(contactPosition(scene, characterId));
  const doorway = near.filter(atPublicDoorway);
  const contactTargets = intent.contactKind
    ? doorway.filter(({ characterId }) => !intent.targetId || intent.targetId === characterId)
    : [];
  const hosts = contactTargets.filter(({ characterId }) => venue.access?.managerIds.includes(characterId));
  const opening = hosts.length === 1 ? hosts : contactTargets.length === 1 ? contactTargets : [];
  const eligible = near.filter(
    (person) =>
      (seenZones.has(contactPosition(scene, person.characterId)) &&
        (!scene.activeIds.length || intent.targetId === person.characterId)) ||
      established.includes(person) ||
      opening.includes(person) ||
      (previousSpeakers.has(person.characterId) && contactPosition(scene, person.characterId) === move?.originZoneId),
  );
  const named = addressedSceneResidents(intent.message ?? "", eligible, occupants, intent.targetId);
  const doorwayVoice = [...new Set([...established, ...opening].map(({ characterId }) => characterId))];
  const candidates = [
    ...named.filter((person) => person.characterId === intent.targetId),
    ...named,
    ...opening,
    ...established,
    ...eligible,
  ];
  const offered = [...new Map(candidates.map((person) => [person.characterId, person])).values()].slice(0, 4);
  const priority = [
    ...[...(intent.priorityIds ?? []), ...(intent.targetId ? [intent.targetId] : [])].filter(
      (id) => scene.activeIds.includes(id) && contactPosition(scene, id) === scene.zoneId,
    ),
    ...named.filter((person) => person.characterId === intent.targetId).map((person) => person.characterId),
    ...named.map((person) => person.characterId),
    ...scene.activeIds.filter((id) => continuing.has(id)),
    ...opening.map((person) => person.characterId),
    ...scene.activeIds,
    ...offered.map((person) => person.characterId),
  ];
  const actorIds = [...new Set(priority)].slice(0, MAX_ZONE_VILLAGERS);
  const selected = actorIds;
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
      hearing: "direct",
      venue,
      instruction: "",
      ...(intent.contactKind ? { contactKind: intent.contactKind } : {}),
      localIds: scene.activeIds,
      remoteIds: offered.map((person) => person.characterId).filter((id) => selected.includes(id)),
      ...(doorwayVoice.length ? { doorwayVoiceIds: doorwayVoice.filter((id) => selected.includes(id)) } : {}),
      ...(actorIds ? { actorIds } : {}),
    },
  };
}

/** The writer needs reach relationships, not the names of hidden occupied rooms. */
export function zoneEventHearingContext(scene: VenueScene, venue: VillageVenue): string {
  const actors = ["player", ...scene.participants.map((person) => person.characterId)];
  const position = (id: string) => (id === "player" ? (scene.zoneId ?? "exterior") : contactPosition(scene, id));
  const groups = Map.groupBy(actors, position);
  return (
    "Hearing groups (GM only): " +
    JSON.stringify(
      [...groups].flatMap(([zone, local]) => {
        if (!zone) return [];
        const adjacent = contactNeighbors(venue, zone, scene);
        const across = actors.filter((actor) => adjacent.includes(position(actor)));
        return [{ local, ...(across.length ? { across } : {}) }];
      }),
    )
  );
}

/** No model-authored audiences and no extra evidence lines or index remapping. */
export function routeZoneEvents(
  segments: readonly unknown[],
  scene: VenueScene,
  lines: VenueReplyLine[],
  moves: Pick<ContactMove, "characterId" | "zoneId" | "segment">[],
  playerMoves: readonly { zoneId: string; segment: number }[] = [],
  fixDoorwayPositions = false,
) {
  const venue = scene.contactGeneration?.venue;
  if (!venue) return;
  const legacySound = scene.contactGeneration?.hearing !== "direct";
  const ids = [
    ...new Set([...(scene.sceneAttendance?.occupants ?? []).map((person) => person.characterId), ...scene.activeIds]),
  ].filter((id) => !scene.departedIds?.includes(id));
  const playerZoneAt = (index: number) =>
    playerMoves.findLast((move) => move.segment <= index)?.zoneId ?? scene.zoneId ?? "exterior";
  const orderedMoves = moves.toSorted((a, b) => a.segment - b.segment);
  const position = (id: string, index: number) =>
    id === "player"
      ? playerZoneAt(index)
      : scene.pendingNpcAdmissions?.some((arrival) => arrival.npc.id === id && arrival.segment > index)
        ? ""
        : (orderedMoves.findLast((move) => move.characterId === id && move.segment <= index)?.zoneId ??
          contactPosition(scene, id));
  const inZones = (zones: string[], index: number) => ids.filter((id) => zones.includes(position(id, index)));
  lines.forEach((line, index) => {
    const playerZone = playerZoneAt(index);
    if (
      moves.some((move) => move.segment === index) ||
      playerMoves.some((move) => move.segment === index) ||
      scene.pendingNpcAdmissions?.some((arrival) => arrival.segment === index)
    )
      line.physicalIdsAfter = inZones([playerZone], index);
    const row = asRecord(segments[index]);
    const actor = line.speakerId;
    const origin = line.kind !== "narration" ? position(actor, index) : playerZone;
    const sources = scene.contactGeneration?.actorIds ?? [
      ...(scene.contactGeneration?.localIds ?? scene.activeIds),
      ...(scene.contactGeneration?.remoteIds ?? []),
    ];
    if (!origin || (line.kind !== "narration" && (!ids.includes(actor) || !sources.includes(actor))))
      throw badGateway("The reply used an unknown sound source. Your draft is preserved.");
    line.zoneId = origin;
    const local = inZones([origin], index);
    const near = [origin, ...contactNeighbors(venue, origin, scene)];
    const spoken = line.kind === "dialogue" || line.kind === "side";
    const loud = speechDelivery(line) === "shout" && spoken;
    const playerNear = near.includes(playerZone);
    line.heardBy = spoken && loud ? inZones(near, index) : local;
    if (speechDelivery(line) === "whisper") {
      if (
        !line.targetId ||
        (line.targetId !== "player" && !local.includes(line.targetId)) ||
        (line.targetId === "player" && origin !== playerZone)
      )
        throw badGateway("A whisper needs a recipient in the same Zone. Your draft is preserved.");
      line.heardBy = local.filter((id) => id === actor || id === line.targetId);
    }
    const doorwayVoice =
      spoken &&
      playerNear &&
      origin !== playerZone &&
      line.targetId === "player" &&
      !!scene.contactGeneration?.doorwayVoiceIds?.includes(actor) &&
      (!fixDoorwayPositions || (playerZone === scene.zoneId && origin === contactPosition(scene, actor)));
    const playerWords =
      speechDelivery(line) === "whisper"
        ? line.targetId === "player"
        : doorwayVoice || (loud ? near : [origin]).includes(playerZone);
    if (line.kind === "narration" || playerWords) line.heardBy.push("player");
    if (line.kind !== "narration") {
      line.viaDoorway = origin !== playerZone;
      line.contactHidden =
        (!loud && spoken ? origin !== playerZone && !doorwayVoice : !playerNear) ||
        (speechDelivery(line) === "whisper" && line.targetId !== "player");
    }
    if (row.sound !== undefined) {
      if (!legacySound) throw new InvalidNarratedSound();
      const cue = asRecord(row.sound);
      const sourceId = asTrimmedString(cue.sourceId);
      const text = asTrimmedString(cue.text);
      if (
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
        if (cue.loud === true ? !loudRange.includes(playerZone) : !soundZones.includes(playerZone))
          throw badGateway("The reply narrated a sound outside hearing range. Your draft is preserved.");
        // Full prose remains local. Other listeners receive only the acoustic cue,
        // under this same line ID; neither visuals nor evidence audiences expand.
        line.soundOnly = {
          characterIds: (cue.loud === true ? inZones(loudRange, index) : inZones(soundZones, index)).filter(
            (id) => !local.includes(id),
          ),
          player: false,
          text,
        };
      }
    }
    if (legacySound && spoken) {
      const wordZones = loud ? near : [origin];
      const loudZones = loud ? zoneSoundRange(scene, venue, origin) : near;
      const audibleIds = inZones(loudZones, index);
      const distant = audibleIds.filter((id) => !wordZones.includes(position(id, index)));
      const playerNoise = !wordZones.includes(playerZone) && loudZones.includes(playerZone);
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
    line.staging = readStagingCues(
      line.staging,
      ids.filter((id) => position(id, index) === playerZone),
    );
  });
  // Inaudible events cannot anchor visible asides.
  const visible = lines
    .map((line, index) => ({ line, index }))
    .filter(({ line }) => !line.contactHidden || line.soundOnly?.player);
  const first = visible.find(({ line }) => !isSceneAside(line)) ?? visible[0];
  if (!first) return;
  if (isSceneAside(first.line)) first.line.presentation = "main";
  let anchor = first.index;
  const asideCounts = new Map<number, number>();
  for (const { line, index } of visible) {
    delete line.anchorIndex;
    const asideCount = asideCounts.get(anchor) ?? 0;
    if (isSceneAside(line) && asideCount < MAX_SCENE_ASIDES) {
      line.anchorIndex = anchor;
      asideCounts.set(anchor, asideCount + 1);
    } else {
      if (isSceneAside(line)) line.presentation = "main";
      anchor = index;
    }
  }
}
