import type { VillageState } from "../models/world.js";
import type { NarrationReadset } from "../models/narration-model.js";
import type { ContinuityEvidence } from "../models/continuity-model.js";
import type { AcceptedEpisode } from "../models/episode-model.js";
import { narrationPositions, narrationWitnesses, type NarrationSourceContext } from "./narration-sources.js";
import { assertNarrationPlayerIntent } from "./narration-scene.js";
import { continuityActor } from "./continuity-actors.js";
import { findLocation } from "./places.js";
import { captureSceneLayout } from "./scene-layout.js";
import { actorTrespassReason, contactNeighbors, contactPath, sceneAccessContext } from "./venue-contact.js";
import { assertNarrationDecision } from "./narration-access.js";
import { claimVisitPermission, evaluateZoneAccess } from "./venue-access.js";
import { zoneArea, zoneClosed } from "./venue-zones.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";
import { residentMovementOptions } from "./resident-movement.js";
import { ZonedDate } from "../../../shared/helpers/zoned-date.js";

export function applyNarrationMoveRequest(
  state: VillageState,
  command: { actors: string[]; to: string; trespass?: true },
  readset: NarrationReadset,
  context: NarrationSourceContext,
  sources: ContinuityEvidence[],
  receiptId: string,
): AcceptedEpisode["commandReceipts"][number] {
  const intent = sources.filter((source) => source.unitId === "input");
  memoryRequire(
    intent.length === sources.length,
    "a group request uses only the actual Player request; replies need their own consequential evidence",
  );
  assertNarrationPlayerIntent(context, intent);
  const moment = intent
    .map((source) => source.moment!)
    .toSorted((a, b) => a.index - b.index || Number(a.side === "after") - Number(b.side === "after"))
    .at(-1)!;
  const positions = narrationPositions(context, moment),
    venue = findLocation(state, context.scene.placeId);
  memoryRequire(
    venue &&
      memoryHash(captureSceneLayout(venue)) === memoryHash(context.scene.sceneAttendance?.layout) &&
      command.actors.every(
        (id) =>
          id !== "player" &&
          context.actors.some(
            (actor) => actor.id === id && continuityActor(state, id)?.incarnation === actor.incarnation,
          ) &&
          positions[id] === positions.player,
      ),
    "a group movement request needs the entire current local group",
  );
  memoryRequire(
    intent.every((source) =>
      command.actors.every((id) =>
        source.perceptions.some((row) => row.actorId === id && (row.channel === "words" || row.channel === "sight")),
      ),
    ),
    "every requested person must perceive the complete request",
  );
  const scene = {
    ...context.scene,
    zoneId: positions.player,
    accompanying: Object.entries(positions)
      .filter(([id]) => id !== "player")
      .map(([characterId, zoneId]) => ({ characterId, zoneId })),
  };
  const accessAt = new ZonedDate(readset.calendar.instant, readset.calendar.timeZone),
    options = residentMovementOptions(state, venue, scene, command.actors, accessAt),
    cohort = command.actors.filter((id) => positions[id] !== command.to);
  memoryRequire(
    options.zones.some((zone) => zone.id === command.to) &&
      (command.trespass
        ? cohort.every((id) =>
            options.destinations.some(
              (row) =>
                row.characterId === id &&
                (row.zoneIds.includes(command.to) || row.trespassZoneIds.includes(command.to)),
            ),
          )
        : cohort.length === 0 ||
          (cohort.length === 1
            ? options.destinations.find((row) => row.characterId === cohort[0])?.zoneIds.includes(command.to)
            : options.groups.some(
                (group) =>
                  group.characterIds.length === cohort.length &&
                  cohort.every((id) => group.characterIds.includes(id)) &&
                  group.zoneIds.includes(command.to),
              ))),
    "the complete requested group cannot cross to that native destination",
  );
  return {
    id: receiptId,
    kind: "movement-request",
    targetId: command.to,
    revision: readset.sceneRevision,
    text:
      "The Player asked " +
      command.actors.join(", ") +
      " to go to " +
      options.zones.find((zone) => zone.id === command.to)!.name +
      ". The request grants no movement or consent.",
    witnesses: narrationWitnesses(sources),
  };
}

export function applyNarrationMove(
  state: VillageState,
  command: { who: string; to: string; trespass?: true },
  readset: NarrationReadset,
  context: NarrationSourceContext,
  sources: ContinuityEvidence[],
  receiptId: string,
  segment: number,
) {
  const actor = context.actors.find((actor) => actor.id === command.who),
    line = context.lines[segment],
    venue = findLocation(state, context.scene.placeId);
  memoryRequire(
    actor && continuityActor(state, actor.id)?.incarnation === actor.incarnation && venue && line?.kind === "narration",
    "movement needs its current admitted actor, Place and actual crossing narration",
  );
  memoryRequire(
    memoryHash(captureSceneLayout(venue)) === memoryHash(context.scene.sceneAttendance?.layout),
    "the admitted movement layout changed",
  );
  const before = narrationPositions(context, { index: segment, side: "before" }),
    after = narrationPositions(context, { index: segment, side: "after" });
  memoryRequire(
    before[actor.id] && before[actor.id] !== command.to,
    "movement needs the actual prior position and a different destination",
  );
  if (readset.entranceObservations && before[actor.id] !== before.player)
    memoryRequire(
      readset.source.scene.contactGeneration?.actorIds?.includes(actor.id) &&
        contactNeighbors(venue, before.player, context.scene).includes(before[actor.id]),
      "an entrance arrival needs a resident offered from an adjacent Zone",
    );
  if (actor.id === "player") {
    assertNarrationPlayerIntent(
      context,
      sources.filter((source) => source.unitId === "input"),
    );
    memoryRequire(
      sources.some(
        (source) =>
          source.unitId === line.id &&
          source.kind === "observation" &&
          source.perceptions.some((row) => row.actorId === "player" && row.channel === "sight"),
      ) && sources.every((source) => source.unitId === "input" || source.unitId === line.id),
      "Player movement needs its actual observed crossing as well as intent",
    );
  } else
    memoryRequire(
      sources.some(
        (source) =>
          source.unitId === line.id &&
          source.kind === "observation" &&
          source.perceptions.some((row) => row.actorId === "player" && row.channel === "sight"),
      ) &&
        (before[actor.id] === before.player || after[actor.id] === after.player),
      "resident movement needs an actual observed departure or arrival, not a promise or offstage claim",
    );
  const scene = {
    ...context.scene,
    zoneId: before.player,
    accompanying: Object.entries(after)
      .filter(([id]) => id !== "player")
      .map(([characterId, zoneId]) => ({ characterId, zoneId })),
  };
  const accessAt = new ZonedDate(readset.calendar.instant, readset.calendar.timeZone),
    zone = venue.zones?.find((zone) => zone.id === command.to),
    captured = context.venue,
    capturedZone = captured.zones?.find((row) => row.id === command.to),
    trespass =
      command.trespass && zone && actor.id !== "player"
        ? actorTrespassReason(state, venue, zone, scene, actor.id, before[actor.id], accessAt)
        : undefined;
  if (command.trespass)
    memoryRequire(
      trespass &&
        capturedZone &&
        actorTrespassReason(state, captured, capturedZone, scene, actor.id, before[actor.id], accessAt) === trespass,
      "unauthorized crossing needs one physically usable edge and the same current denial; bans and closures remain protected",
    );
  const path = trespass
    ? [before[actor.id], command.to]
    : contactPath(state, venue, before[actor.id], command.to, actor.id, scene, accessAt, true);
  memoryRequire(path && path.length > 1 && zone, "there is no permitted connected movement route");
  const decision = evaluateZoneAccess(venue, zone, actor.id, {
    ...sceneAccessContext(scene, accessAt),
    accepting: true,
    unavailable: zoneClosed(state, venue, zone),
    environment: state.narrative,
  });
  memoryRequire(decision.allowed || trespass, "the native destination does not admit this actor");
  if (!trespass) claimVisitPermission(venue, decision.permissionId, scene.id);
  if (actor.id === "player") zone.seen = true;
  const receipt: AcceptedEpisode["commandReceipts"][number] = {
    id: receiptId,
    kind: "movement",
    targetId: zone.id,
    revision: readset.sceneRevision,
    text: actor.id + " moved to " + zone.name + ".",
    witnesses: [...new Set([actor.id, ...narrationWitnesses(sources).filter((id) => after[id] === zone.id)])],
    movement: {
      actorId: actor.id,
      from: before[actor.id],
      zoneId: zone.id,
      segment,
      path,
      area: zoneArea(zone),
      privateOwnerId: zone.ownerId ?? "",
      ...(trespass ? { trespass } : {}),
    },
  };
  return { receipt, sources, move: { characterId: actor.id, zoneId: zone.id, segment, path, quote: line.content } };
}

export function applyNarrationMovementDecision(
  state: VillageState,
  command: { who: string; to?: string; agrees: boolean; trespass?: true },
  readset: NarrationReadset,
  context: NarrationSourceContext,
  sources: ContinuityEvidence[],
  receiptId: string,
  segment: number,
) {
  memoryRequire(command.who !== "player", "following needs a non-player actor");
  memoryRequire(
    command.to !== undefined || !!readset.sceneFollowing,
    "the saved request did not offer ongoing following",
  );
  const positions = narrationPositions(context, { index: segment, side: "after" }),
    venue = findLocation(state, context.scene.placeId),
    actor = context.actors.find((row) => row.id === command.who),
    line = context.lines[segment];
  memoryRequire(
    venue &&
      actor &&
      continuityActor(state, actor.id)?.incarnation === actor.incarnation &&
      positions.player &&
      positions[command.who] === positions.player,
    "following needs this current local actor",
  );
  const enacted =
    command.to === undefined &&
    !command.trespass &&
    line?.kind === "narration" &&
    sources.length > 0 &&
    sources.every(
      (source) =>
        source.kind === "observation" &&
        source.seed === context.seed &&
        source.episodeId === context.episodeId &&
        memoryHash(source.positions) === memoryHash(positions) &&
        source.unitId === line.id &&
        source.fingerprint === memoryHash(line) &&
        source.excerpt === line.content &&
        source.moment?.index === segment &&
        source.moment.side === "after" &&
        source.perceptions.some((row) => row.actorId === "player" && row.channel === "sight"),
    );
  if (!enacted) {
    assertNarrationDecision(
      state,
      command.who,
      { ...context, positions: (moment) => narrationPositions(context, moment) },
      sources,
    );
    memoryRequire(
      sources.every((source) => source.perceptions.some((row) => row.actorId === "player" && row.channel === "words")),
      "the Player must hear that actor's decision",
    );
  }
  const localScene = {
    ...context.scene,
    zoneId: positions.player,
    accompanying: Object.entries(positions)
      .filter(([id]) => id !== "player")
      .map(([characterId, zoneId]) => ({ characterId, zoneId })),
  };
  memoryRequire(
    !command.to || !command.agrees || contactNeighbors(venue, positions.player, localScene).includes(command.to),
    "agreement covers one adjacent crossing",
  );
  const options = residentMovementOptions(
    state,
    venue,
    localScene,
    [command.who],
    new ZonedDate(readset.calendar.instant, readset.calendar.timeZone),
  );
  memoryRequire(
    !command.to || options.zones.some((row) => row.id === command.to),
    "movement decision needs a supplied Zone",
  );
  memoryRequire(
    !command.to ||
      !command.agrees ||
      (command.trespass ? options.destinations[0]?.trespassZoneIds : options.destinations[0]?.zoneIds)?.includes(
        command.to,
      ),
    "movement agreement needs a current usable destination and explicit consent to unauthorized entry",
  );
  const receipt: AcceptedEpisode["commandReceipts"][number] = {
    id: receiptId,
    kind: "movement-agreement",
    targetId: command.to ?? positions.player,
    revision: readset.sceneRevision,
    text:
      command.who +
      (command.to
        ? command.agrees
          ? " agreed to cross with the Player."
          : " declined to cross with the Player."
        : command.agrees
          ? " is following the Player."
          : " stopped following the Player."),
    witnesses: [...new Set([...narrationWitnesses(sources), ...(enacted ? [actor.id] : [])])],
    movementAgreement: {
      actorId: command.who,
      incarnation: actor.incarnation,
      from: positions.player,
      zoneId: command.to ?? positions.player,
      agrees: command.agrees,
      segment,
      ...(command.trespass ? { trespass: true as const } : {}),
      ...(command.to === undefined ? { following: true as const } : {}),
    },
  };
  return receipt;
}

export function applyNarrationDeparture(
  state: VillageState,
  who: string,
  readset: NarrationReadset,
  context: NarrationSourceContext,
  sources: ContinuityEvidence[],
  receiptId: string,
  segment: number,
) {
  const actor = context.actors.find((actor) => actor.id === who),
    line = context.lines[segment],
    venue = findLocation(state, context.scene.placeId);
  const positions = narrationPositions(context, { index: segment, side: "before" });
  memoryRequire(
    who !== "player" &&
      actor &&
      continuityActor(state, who)?.incarnation === actor.incarnation &&
      venue &&
      positions[who] &&
      positions[who] === positions.player &&
      line?.kind === "narration",
    "departure needs this current locally present resident and crossing narration",
  );
  memoryRequire(
    memoryHash(captureSceneLayout(venue)) === memoryHash(context.scene.sceneAttendance?.layout),
    "the admitted departure route changed",
  );
  memoryRequire(
    sources.some(
      (source) =>
        source.unitId === line.id &&
        source.kind === "observation" &&
        source.perceptions.some((row) => row.actorId === "player" && row.channel === "sight"),
    ),
    "departure needs an actual observed exit, not a promise or remote voice",
  );
  const scene = {
      ...context.scene,
      zoneId: positions.player,
      accompanying: Object.entries(positions)
        .filter(([id]) => id !== "player")
        .map(([characterId, zoneId]) => ({ characterId, zoneId })),
    },
    path = contactPath(
      state,
      venue,
      positions[who],
      "exterior",
      who,
      scene,
      new ZonedDate(readset.calendar.instant, readset.calendar.timeZone),
    );
  memoryRequire(path, "departure has no valid native exit route");
  const receipt: AcceptedEpisode["commandReceipts"][number] = {
    id: receiptId,
    kind: "departure",
    targetId: who,
    revision: readset.sceneRevision,
    text: who + " left the current conversation.",
    witnesses: [...new Set([who, ...narrationWitnesses(sources)])],
    departure: { actorId: who, from: positions[who], segment, path },
  };
  return { receipt, sources, move: { characterId: who, zoneId: "", segment, path, quote: line.content } };
}
