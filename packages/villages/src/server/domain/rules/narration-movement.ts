import type { VillageState } from "../models/world.js";
import type { NarrationReadset } from "../models/narration-model.js";
import type { ContinuityEvidence } from "../models/continuity-model.js";
import type { AcceptedEpisode } from "../models/episode-model.js";
import { narrationPositions, narrationWitnesses, type NarrationSourceContext } from "./narration-sources.js";
import { assertNarrationPlayerIntent } from "./narration-scene.js";
import { continuityActor } from "./continuity-actors.js";
import { findLocation } from "./places.js";
import { captureSceneLayout } from "./scene-layout.js";
import { contactPath, sceneAccessContext } from "./venue-contact.js";
import { claimVisitPermission, evaluateZoneAccess } from "./venue-access.js";
import { zoneArea, zoneClosed } from "./venue-zones.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";
import { residentMovementOptions } from "./resident-movement.js";

export function applyNarrationMoveRequest(
  state: VillageState,
  command: { actors: string[]; to: string },
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
  const options = residentMovementOptions(state, venue, scene, command.actors),
    cohort = command.actors.filter((id) => positions[id] !== command.to);
  memoryRequire(
    options.zones.some((zone) => zone.id === command.to) &&
      (cohort.length === 0 ||
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
  command: { who: string; to: string },
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
  const path = contactPath(state, venue, before[actor.id], command.to, actor.id, scene),
    zone = venue.zones?.find((zone) => zone.id === command.to);
  memoryRequire(path && path.length > 1 && zone, "there is no permitted connected movement route");
  const decision = evaluateZoneAccess(venue, zone, actor.id, {
    ...sceneAccessContext(scene, state),
    accepting: true,
    unavailable: zoneClosed(state, venue, zone),
    environment: state.narrative,
  });
  memoryRequire(decision.allowed, "the native destination does not admit this actor");
  claimVisitPermission(venue, decision.permissionId, scene.id);
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
      spaceClass: zone.venueClass,
      area: zoneArea(zone),
      privateOwnerId: zone.ownerId ?? "",
    },
  };
  return { receipt, sources, move: { characterId: actor.id, zoneId: zone.id, segment, path, quote: line.content } };
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
    path = contactPath(state, venue, positions[who], "exterior", who, scene);
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
