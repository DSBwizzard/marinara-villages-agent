import type { VillageState } from "../models/world.js";
import type { NarrationReadset } from "../models/narration-model.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";
import { readNarrationEffectHeader, readNarrationReply } from "./narration-contract.js";
import { bindNarrationSource, assertNarrationSourceOrder, type NarrationSourceContext } from "./narration-sources.js";
import { narrationLines } from "./narration-lines.js";
import {
  acceptedNarrationEpisode,
  narrationIsAbandoned,
  acceptNarrationContinuity,
  type NarrationPublication,
} from "./narration-acceptance.js";
import { applyNarrationProject, applyNarrationProjectStart } from "./narration-project.js";
import { applyNarrationScene } from "./narration-scene.js";
import { narrationAppointment } from "./narration-appointment.js";
import { applyNarrationResidence } from "./narration-residence.js";
import { applyNarrationPlace } from "./narration-place.js";
import { applyNarrationMove, applyNarrationMoveRequest, applyNarrationDeparture } from "./narration-movement.js";
import { assertSceneMovementCapacity } from "./resident-movement.js";
import { selectSceneEffects, resolveNarrationEffects } from "./scene-acceptance.js";
import {
  prepareNpcAdmission,
  bindNpcReferences,
  admitNpcParticipants,
  type NpcAdmission,
} from "./npc-participation.js";
import { narrationWitnesses, narrationPositions, narrationCommunication } from "./narration-sources.js";
import { captureSceneLayout } from "./scene-layout.js";
import { findLocation } from "./places.js";
import { applyNarrationCircumstance, applyNarrationRepair } from "./narration-circumstance.js";
import { nativeCommand, readNarrationNativeCommand } from "./narration-command-contract.js";
import { projectSpeechContext } from "./project-interpretation.js";
import { applyNarrationAccess, assertNarrationDecision, narrationAccessScopes } from "./narration-access.js";
import { asRecord } from "./coerce.js";

/** Fixed native validators prepare a detached candidate inside the existing Village CAS. */
export function prepareNarrationNative(
  state: VillageState,
  readset: NarrationReadset,
  raw: Record<string, unknown>,
  submissionId: string,
  at: string,
  excluded = new Map<string, string>(),
) {
  const scene = structuredClone(readset.source.scene),
    actors = [...readset.source.actors],
    admissions: NpcAdmission[] = [];
  const rawSegments = Array.isArray(raw.segments) ? raw.segments : [];
  for (const value of Array.isArray(raw.commands) ? raw.commands : []) {
    if (!value || typeof value !== "object" || (value as Record<string, unknown>).type !== "npc.admit") continue;
    const command = readNarrationNativeCommand(value);
    memoryRequire(command.type === "npc.admit", "invalid NPC command");
    const segment = rawSegments.findIndex(
        (value, index) =>
          value &&
          typeof value === "object" &&
          ((value as Record<string, unknown>).id ?? "segment-" + index) === command.at,
      ),
      intro = rawSegments[segment] as Record<string, unknown> | undefined;
    memoryRequire(
      intro?.kind === "narration" &&
        typeof intro.text === "string" &&
        admissions.length < 4 &&
        !admissions.some((row) => row.localKey === command.localKey),
      "NPC admission needs one unique current introduction",
    );
    const crossings = (Array.isArray(raw.commands) ? raw.commands : [])
      .flatMap((value, commandIndex) => {
        const parsed = nativeCommand.safeParse(value);
        if (!parsed.success || parsed.data.type !== "move" || parsed.data.who !== "player") return [];
        const command = parsed.data;
        if (
          excluded.has(readNarrationEffectHeader(value, "command-" + commandIndex).id) ||
          !scene.sceneAttendance?.layout?.some((zone) => zone.id === command.to)
        )
          return [];
        const index = rawSegments.findIndex(
          (value, index) =>
            value &&
            typeof value === "object" &&
            ((value as Record<string, unknown>).id ?? "segment-" + index) === command.at,
        );
        return index >= 0 && index <= segment ? [{ segment: index, zoneId: command.to }] : [];
      })
      .sort((a, b) => a.segment - b.segment);
    const arrival = prepareNpcAdmission(
      state,
      scene,
      command,
      readset.source.operationId,
      segment,
      crossings.at(-1)?.zoneId ?? scene.zoneId!,
      intro.text,
      readset.npcCandidates.find((row) => row.npc.id === command.existingId)?.npc,
    );
    memoryRequire(!actors.some((actor) => actor.id === arrival.npc.id), "NPC identity is already in this reply");
    admissions.push(arrival);
    actors.push({
      kind: "actor",
      id: arrival.npc.id,
      incarnation: memoryHash([state.seed, state.setupAt, arrival.npc.id]),
    });
    admitNpcParticipants(scene, [arrival]);
  }
  scene.pendingNpcAdmissions = admissions;
  if (scene.contactGeneration)
    scene.contactGeneration.actorIds = [
      ...new Set([...(scene.contactGeneration.actorIds ?? scene.activeIds), ...admissions.map((row) => row.npc.id)]),
    ];
  const source = { ...readset.source, scene, actors };
  const reply = readNarrationReply(
    bindNpcReferences(raw, admissions),
    scene.contactGeneration?.actorIds ?? scene.activeIds,
  );
  const projectBefore = new Map<string, ReturnType<typeof projectSpeechContext>>();
  const accessBefore = new Map(
    narrationAccessScopes(
      state,
      readset.source.actors.map((actor) => actor.id),
    ).map((scope) => [scope.venueId, scope]),
  );
  const native: NarrationPublication["native"] = {
    effects: [],
    receipts: {},
    sources: {},
    moves: [],
    playerMoves: [],
    admissions: [],
    sceneEffects: [],
    damage: {},
  };
  const commands = reply.commands
    .map((raw, index) => {
      const header = readNarrationEffectHeader(raw, "command-" + index);
      const effect = { ...header, failure: excluded.get(header.id) };
      const proposed = asRecord(raw);
      if (
        proposed.type === "circumstance" &&
        effect.independent &&
        (!proposed.situation ||
          (Array.isArray(proposed.conditions) &&
            proposed.conditions.some((row) => Object.hasOwn(asRecord(row), "roomKeeps"))))
      ) {
        delete effect.independent;
        effect.failure = "The observed Room work and its native condition are one outcome.";
      }
      native.effects.push(effect);
      try {
        const command = readNarrationNativeCommand(raw);
        const segment = reply.segments.findIndex((line) => line.id === command.at);
        memoryRequire(segment >= 0, "native command needs its actual supplied segment");
        if (command.type === "circumstance" && command.situation) {
          const damage = new Set(command.conditions?.flatMap((row) => row.roomKeeps ?? []));
          const required = [...new Set([...effect.requires, ...damage])];
          memoryRequire(damage.size <= 4 && required.length <= 8, "too many Room damage dependencies");
          effect.requires = required;
        }
        return { command, effect, segment, index };
      } catch (error) {
        effect.failure = String(error).slice(0, 2000);
        return undefined;
      }
    })
    .filter((row) => row !== undefined)
    .toSorted((a, b) => a.segment - b.segment || a.index - b.index);
  // Tentative positions grant nothing: every crossing is an essential validated dependency before publication.
  const planned = commands.flatMap(({ command, effect, segment }) => {
    if (
      effect.failure ||
      (command.type !== "move" && command.type !== "depart") ||
      !actors.some((actor) => actor.id === command.who) ||
      reply.segments[segment].kind !== "narration"
    )
      return [];
    const zoneId = command.type === "depart" ? "" : command.to;
    if (command.type === "move" && !readset.source.scene.sceneAttendance?.layout?.some((zone) => zone.id === zoneId))
      return [];
    return [{ characterId: command.who, zoneId, segment, effectId: effect.id }];
  });
  native.movementDependencies = [
    ...planned.map((move) => move.effectId),
    ...commands.filter((row) => row.command.type === "npc.admit").map((row) => row.effect.id),
  ];
  let context: NarrationSourceContext;
  try {
    context = {
      ...source,
      ...narrationLines(
        reply,
        scene,
        readset.source.episodeId,
        readset.capturedAt,
        planned.filter((move) => move.characterId !== "player"),
        planned.filter((move) => move.characterId === "player"),
      ),
      native: {},
      moves: planned,
    };
  } catch (error) {
    const crossing =
      planned.find((move) => native.effects.find((effect) => effect.id === move.effectId)?.independent) ?? planned[0];
    if (!crossing) throw error;
    native.effects.find((effect) => effect.id === crossing.effectId)!.failure =
      "Tentative movement routing failed: " + String(error).slice(0, 1900);
    return { native, candidate: structuredClone(state), routingFailure: true as const };
  }
  function apply(candidate: VillageState, row: (typeof commands)[number]) {
    const { command, effect } = row;
    const sources = command.source.map((ref) => bindNarrationSource(ref, context));
    memoryRequire(
      sources.every(
        (source) =>
          source.moment && source.episodeId === readset.source.episodeId && source.moment.index <= row.segment,
      ) &&
        (command.type === "scene.end" ||
          command.type === "project.start" ||
          command.type === "move.request" ||
          (command.type === "move" && command.who === "player") ||
          (command.type === "contact.end" && command.who === "player") ||
          Math.max(...sources.map((source) => source.moment!.index)) === row.segment),
      "native decision must match its actual current utterance",
    );
    assertNarrationSourceOrder(sources);
    const receiptId = "native-" + memoryHash([readset.source.episodeId, effect.id]).slice(0, 40);
    if (command.type === "circumstance") {
      if (!command.situation) {
        return {
          receipt: applyNarrationRepair(candidate, command, readset, context, sources, receiptId, row.segment),
          sources,
        };
      }
      memoryRequire(
        !Object.values(native.receipts).some((receipt) => receipt.kind === "circumstance"),
        "one Scene reply has at most one finite circumstance",
      );
      const result = applyNarrationCircumstance(
        candidate,
        command,
        readset,
        context,
        sources,
        receiptId,
        row.segment,
        at,
        reply.keep,
      );
      return {
        ...result,
        sources,
      };
    }
    if (command.type === "npc.admit") {
      const arrival = admissions.find(
          (arrival) => arrival.localKey === command.localKey && arrival.segment === row.segment,
        ),
        line = context.lines[row.segment];
      const venue = findLocation(candidate, context.scene.placeId);
      memoryRequire(
        venue &&
          memoryHash(captureSceneLayout(venue)) === memoryHash(context.scene.sceneAttendance?.layout) &&
          arrival?.zoneId === narrationPositions(context, { index: row.segment, side: "after" }).player,
        "NPC admission needs its current local introduction Zone",
      );
      memoryRequire(
        arrival &&
          sources.every(
            (proof) =>
              proof.unitId === line.id &&
              proof.kind === "observation" &&
              proof.perceptions.some((perception) => perception.actorId === "player" && perception.channel === "sight"),
          ),
        "NPC admission needs the actual Player-seen introduction",
      );
      candidate.worldPlaces.npcs[arrival.npc.id] = structuredClone(arrival.npc);
      candidate.worldPlaces.revision++;
      return {
        receipt: {
          id: receiptId,
          kind: "npc" as const,
          targetId: arrival.npc.id,
          revision: readset.sceneRevision,
          text: arrival.source,
          witnesses: narrationWitnesses(sources),
          observedBy: narrationWitnesses(sources, ["sight"]),
          admission: { npc: arrival.npc, zoneId: arrival.zoneId, segment: arrival.segment },
        },
        sources,
        admission: arrival,
      };
    }
    if (command.type === "move.request")
      return {
        receipt: applyNarrationMoveRequest(candidate, command, readset, context, sources, receiptId),
        sources,
      };
    if (command.type === "move" || command.type === "depart") {
      memoryRequire(
        planned.some((move) => move.effectId === effect.id),
        "movement needs its admitted actor, known destination and crossing narration",
      );
      memoryRequire(
        planned.filter((move) => move.characterId === command.who && move.segment === row.segment).length === 1,
        "an actor has conflicting movements at one moment",
      );
      return command.type === "depart"
        ? applyNarrationDeparture(candidate, command.who, readset, context, sources, receiptId, row.segment)
        : applyNarrationMove(candidate, command, readset, context, sources, receiptId, row.segment);
    }
    if (command.type === "scene.end" || command.type === "contact.end")
      return applyNarrationScene(candidate, command, readset, context, sources, receiptId, row.segment);
    if (command.type === "place.discover" || command.type === "place.establish") {
      const kind = command.type === "place.discover" ? "discovery" : "establishment",
        limit = kind === "discovery" ? 2 : 8;
      memoryRequire(
        Object.values(native.receipts).filter((receipt) => receipt.kind === kind).length < limit,
        "too many native Place outcomes in one reply",
      );
      return { receipt: applyNarrationPlace(candidate, command, readset, context, sources, receiptId, at), sources };
    }
    if (command.type === "project.start") {
      const project = state.projects.find((project) => project.id === command.project);
      memoryRequire(project?.lifecycle, "the Project is unavailable");
      const captured = readset.projects.find((row) => row.projectId === project.id);
      memoryRequire(captured, "the Project was not supplied");
      return {
        receipt: applyNarrationProjectStart(
          candidate,
          command.project,
          readset,
          context,
          sources,
          projectSpeechContext(state, project, Object.keys(captured.agreements)),
          receiptId,
          at,
        ),
        sources,
      };
    }
    assertNarrationDecision(candidate, command.by, narrationCommunication(context), sources);
    if (command.type === "residence.request" || command.type === "residence.decide" || command.type === "venue.request")
      return {
        receipt: applyNarrationResidence(
          candidate,
          state,
          command,
          readset,
          sources,
          receiptId,
          at,
          (command.requires ?? []).flatMap((id) => (native.receipts[id] ? [native.receipts[id]] : [])),
        ),
        sources,
      };
    if (command.type === "appointment") {
      memoryRequire(command.when, "appointment needs its stated day");
      return {
        receipt: narrationAppointment(candidate, { ...command, when: command.when }, readset, sources, receiptId),
        sources,
      };
    }
    let receipt;
    if (command.type === "project.decide") {
      let before = projectBefore.get(command.project);
      if (!before) {
        const project = state.projects.find((project) => project.id === command.project);
        memoryRequire(
          project?.lifecycle && readset.projects.some((row) => row.projectId === project.id),
          "native Project was not supplied",
        );
        before = projectSpeechContext(
          state,
          project,
          readset.source.actors.map((actor) => actor.id),
        );
        projectBefore.set(project.id, before);
      }
      receipt = applyNarrationProject(
        candidate,
        { projectId: command.project, decision: command.decision, receiptId, submissionId, at },
        readset,
        context,
        sources,
        before,
      );
    } else {
      const before = accessBefore.get(command.venue);
      memoryRequire(before, "native access scope is missing");
      const decision =
        command.type === "access.decide"
          ? { type: command.type, by: command.by, venue: command.venue, zone: command.zone, ...command.decision }
          : command;
      receipt = applyNarrationAccess(
        candidate,
        decision,
        readset,
        narrationCommunication(context),
        sources,
        before,
        receiptId,
        at,
      );
    }
    return { receipt, sources };
  }
  let candidate = structuredClone(state);
  for (const row of commands) {
    if (row.effect.failure) continue;
    try {
      const next = structuredClone(candidate),
        result = apply(next, row);
      candidate = next;
      native.receipts[row.effect.id] = result.receipt;
      native.sources[row.effect.id] = result.sources;
      if ("damage" in result && result.damage.length) native.damage![row.effect.id] = result.damage;
      if ("admission" in result) {
        native.admissions.push(result.admission);
        native.sceneEffects!.push({ effectId: row.effect.id, contactEndedIds: [] });
      }
      if ("sceneEffect" in result) native.sceneEffects!.push({ effectId: row.effect.id, ...result.sceneEffect });
      if ("move" in result) {
        if (result.move.characterId === "player")
          native.playerMoves.push({
            effectId: row.effect.id,
            zoneId: result.move.zoneId,
            segment: result.move.segment,
          });
        else native.moves.push({ ...result.move, effectId: row.effect.id });
        native.sceneEffects!.push({ effectId: row.effect.id, contactEndedIds: [] });
      }
    } catch (error) {
      row.effect.failure = String(error).slice(0, 2000);
    }
  }
  try {
    assertSceneMovementCapacity(context.scene, native.moves);
  } catch (error) {
    for (const move of planned)
      native.effects.find((effect) => effect.id === move.effectId)!.failure = String(error).slice(0, 2000);
  }
  return {
    native,
    candidate,
    routingFailure:
      planned.some((move) => native.effects.find((effect) => effect.id === move.effectId)?.failure) ||
      admissions.some((arrival) => !native.admissions.includes(arrival)),
  };
}

/** Exact committed replay precedes every fresh native authority check. */
export function acceptNarration(
  state: VillageState,
  publication: Omit<NarrationPublication, "native">,
  submissionId: string,
  at: string,
) {
  if (acceptedNarrationEpisode(state, publication, submissionId))
    return acceptNarrationContinuity(
      state,
      {
        ...publication,
        native: { effects: [], receipts: {}, sources: {}, moves: [], playerMoves: [], admissions: [] },
      },
      submissionId,
      at,
    );
  memoryRequire(!narrationIsAbandoned(state, publication, submissionId), "this narration was explicitly abandoned");
  const evaluate = (prepared: ReturnType<typeof prepareNarrationNative>) =>
    prepared.routingFailure
      ? {
          ...selectSceneEffects(prepared.native.effects, prepared.native.movementDependencies ?? []),
          held: true as const,
          usableIds: [],
          episode: undefined,
        }
      : acceptNarrationContinuity(prepared.candidate, { ...publication, native: prepared.native }, submissionId, at);
  const selected = resolveNarrationEffects((excluded) => {
    const prepared = prepareNarrationNative(state, publication.readset, publication.raw, submissionId, at, excluded);
    const result = evaluate(prepared);
    return {
      ...prepared,
      result,
      provisional: prepared.native.effects
        .filter(
          (effect) => prepared.native.receipts[effect.id] || prepared.native.movementDependencies?.includes(effect.id),
        )
        .map((effect) => ({ effect, sources: prepared.native.sources[effect.id] ?? [] })),
    };
  });
  if (!selected.result.held) Object.assign(state, selected.candidate);
  return selected.result;
}
