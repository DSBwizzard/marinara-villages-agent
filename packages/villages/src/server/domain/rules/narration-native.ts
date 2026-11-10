import { z } from "zod";
import type { VillageState } from "../models/world.js";
import type { NarrationReadset } from "../models/narration-model.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";
import { narrationSourceSchema, readNarrationEffectHeader, readNarrationReply } from "./narration-contract.js";
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
import { placeDraftSchema } from "./place-discovery.js";
import { applyNarrationMove, applyNarrationMoveRequest, applyNarrationDeparture } from "./narration-movement.js";
import { assertSceneMovementCapacity } from "./resident-movement.js";
import { selectSceneEffects } from "./scene-acceptance.js";
import { MAX_VENUE_NAME_LENGTH } from "./prompt-preset.js";
import { VILLAGE_WEEKDAYS } from "./village-clock.js";
import { projectSpeechContext } from "./project-interpretation.js";
import { applyNarrationAccess, assertNarrationDecision, narrationAccessScopes } from "./narration-access.js";

const id = z.string().min(1).max(160),
  label = z.string().regex(/^[A-Za-z][A-Za-z0-9_-]{0,47}$/);
const base = {
  id: label.optional(),
  at: label,
  source: z.array(narrationSourceSchema).min(1).max(8),
  independent: z.literal(true).optional(),
  requires: z.array(label).max(8).optional(),
};
const nativeCommand = z.discriminatedUnion("type", [
  z.object({ ...base, type: z.literal("contact.end"), who: id }).strict(),
  z.object({ ...base, type: z.literal("scene.end") }).strict(),
  z.object({ ...base, type: z.literal("move"), who: id, to: id }).strict(),
  z.object({ ...base, type: z.literal("depart"), who: id.refine((value) => value !== "player") }).strict(),
  z
    .object({
      ...base,
      type: z.literal("move.request"),
      to: id,
      actors: z
        .array(id)
        .min(1)
        .max(4)
        .refine((ids) => new Set(ids).size === ids.length),
    })
    .strict(),
  z.object({ ...base, type: z.literal("project.start"), project: id }).strict(),
  z
    .object({
      ...base,
      type: z.literal("place.discover"),
      existingId: id.optional(),
      place: placeDraftSchema.optional(),
    })
    .strict(),
  z
    .object({
      ...base,
      type: z.literal("place.establish"),
      project: id,
      objective: id,
      quote: z
        .string()
        .min(1)
        .max(1200)
        .refine((value) => value.trim().length > 0),
      met: z.literal(true),
    })
    .strict(),
  z.object({ ...base, type: z.literal("residence.request"), by: id, venue: id }).strict(),
  z
    .object({ ...base, type: z.literal("residence.decide"), by: id, person: id, venue: id, approved: z.boolean() })
    .strict(),
  z
    .object({
      ...base,
      type: z.literal("venue.request"),
      by: id,
      name: z.string().min(1).max(MAX_VENUE_NAME_LENGTH),
      classes: z.array(z.string()).min(1).max(2),
    })
    .strict(),
  z
    .object({
      ...base,
      type: z.literal("appointment"),
      by: id,
      when: z.union([
        z.object({ dayOffset: z.number().int().min(-3660).max(3660) }).strict(),
        z.object({ weekday: z.enum(VILLAGE_WEEKDAYS), afterToday: z.boolean().optional() }).strict(),
        z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }).strict(),
      ]),
      minute: z.number().int().min(0).max(1439).optional(),
    })
    .strict(),
  z
    .object({
      ...base,
      type: z.literal("project.decide"),
      by: id,
      project: id,
      decision: z.enum(["approval", "builder", "refuse", "withdrawal", "conditional", "uncertain"]),
    })
    .strict(),
  z.object({ ...base, type: z.literal("permission.grant"), by: id, visitor: id, venue: id, zone: id }).strict(),
  z.object({ ...base, type: z.literal("permission.revoke"), by: id, visitor: id, venue: id, zone: id }).strict(),
  z
    .object({
      ...base,
      type: z.literal("access.decide"),
      by: id,
      venue: id,
      zone: id.nullable(),
      decision: z.discriminatedUnion("outcome", [
        z
          .object({
            outcome: z.enum([
              "invite-now",
              "invite-later",
              "invite-outside-hours",
              "refuse",
              "dismiss",
              "ban-zone",
              "ban-venue",
            ]),
            visitor: id,
            accompanies: z.boolean().optional(),
          })
          .strict(),
        z.object({ outcome: z.literal("access-management"), management: z.unknown() }).strict(),
      ]),
    })
    .strict(),
]);
export function readNarrationNativeCommand(raw: unknown) {
  return nativeCommand.parse(raw);
}
export const NARRATION_NATIVE =
  'Native commands share {id?:label,at:segment label,source:[exact consequential sources],requires?:[effect IDs],independent?:true}. Current communication is required; recalled/private consent is never authority. Supported commands: {type:"depart",who} records an actual observed local resident exit through the native route; it ends their Scene presence without inventing an offstage destination or changing their Agenda. Player departure uses scene.end. {type:"move.request",to,actors:[every requested local actor]} grounds only the complete actual Player request and validates the whole native group at that input moment; resident responses stay ordinary ordered Scene prose and need their own evidence for consequences. It grants no movement or consent. For actual following use individually grounded move commands. {type:"move",who,to} validates a current connected Zone crossing at its narration label, with actual Player spoken/visible intent for Player movement or observed resident departure/arrival. Every consequential input source in a moving turn needs its explicit moment. A crossing applies before routing its labelled segment; native success assertions must require it. {type:"place.discover",existingId: supplied Place id} OR {type:"place.discover",place:{name,description,form?,report?,controllers?,zones?:[{id,name,kind:"public|staff|restricted",description,purpose?,controllers?,connectedTo?}],people?:[{ref,name,label?,characterization,existingId?,facts?,role?,availability?}]}} discovers existing infrastructure, never builds, grants ownership or establishes a service (maximum two); {type:"place.establish",project,objective,quote,met:true} records a current Player-witnessed objective, not a promise or Project completion (maximum eight); {type:"residence.request",by,venue}; {type:"residence.decide",by,person,venue,approved:boolean}; {type:"venue.request",by,name,classes:[native Venue classes]} submits a Villager request without establishing any service; {type:"project.start",project} invokes the same native Start/Resume only for explicit actual Player intent and current ready authority; {type:"appointment",by,when:{dayOffset:integer}|{weekday:weekday name,afterToday?:boolean}|{date:"YYYY-MM-DD"},minute?:0-1439} binds an actual current spoken appointment using the supplied calendar, never a past instant or clock mutation; {type:"scene.end"} only from the actual Player spoken/visible departure intent at the final segment; {type:"contact.end",who} ends only an admitted doorway contact, with deciding words (or the actual Player intent); {type:"project.decide",by,project,decision:"approval|builder|refuse|withdrawal|conditional|uncertain"}; {type:"permission.grant|permission.revoke",by,visitor,venue,zone}; {type:"access.decide",by,venue,zone,decision:{outcome:"invite-now|invite-later|invite-outside-hours|refuse|dismiss|ban-zone|ban-venue",visitor,accompanies?}|{outcome:"access-management",management:exact native AccessCommand action fields without operationId,expectedRevision,zoneId,sceneId}}. Use only supplied native scopes. A conditional or uncertain Project answer grants no approval or lead. An access condition beyond accompaniment cannot grant access. Native success assertions must require their command ID.';

/** Fixed native validators prepare a detached candidate inside the existing Village CAS. */
export function prepareNarrationNative(
  state: VillageState,
  readset: NarrationReadset,
  raw: Record<string, unknown>,
  submissionId: string,
  at: string,
  excluded = new Map<string, string>(),
) {
  const reply = readNarrationReply(
    raw,
    readset.source.scene.contactGeneration?.actorIds ?? readset.source.scene.activeIds,
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
  };
  const commands = reply.commands
    .map((raw, index) => {
      const header = readNarrationEffectHeader(raw, "command-" + index);
      const effect = { ...header, failure: excluded.get(header.id) };
      native.effects.push(effect);
      try {
        const command = readNarrationNativeCommand(raw);
        const segment = reply.segments.findIndex((line) => line.id === command.at);
        memoryRequire(segment >= 0, "native command needs its actual supplied segment");
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
      !readset.source.actors.some((actor) => actor.id === command.who) ||
      reply.segments[segment].kind !== "narration"
    )
      return [];
    const zoneId = command.type === "depart" ? "" : command.to;
    if (command.type === "move" && !readset.source.scene.sceneAttendance?.layout?.some((zone) => zone.id === zoneId))
      return [];
    return [{ characterId: command.who, zoneId, segment, effectId: effect.id }];
  });
  native.movementDependencies = planned.map((move) => move.effectId);
  let context: NarrationSourceContext;
  try {
    context = {
      ...readset.source,
      ...narrationLines(
        reply,
        readset.source.scene,
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
    assertNarrationDecision(candidate, command.by, context, sources);
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
      receipt = applyNarrationAccess(candidate, decision, readset, context, sources, before, receiptId, at);
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
    routingFailure: planned.some((move) => native.effects.find((effect) => effect.id === move.effectId)?.failure),
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
  const excluded = new Map<string, string>();
  const visited = new Set<string>();
  const evaluate = (prepared: ReturnType<typeof prepareNarrationNative>) =>
    prepared.routingFailure
      ? {
          ...selectSceneEffects(prepared.native.effects, prepared.native.movementDependencies ?? []),
          held: true as const,
          usableIds: [],
          episode: undefined,
        }
      : acceptNarrationContinuity(prepared.candidate, { ...publication, native: prepared.native }, submissionId, at);
  for (;;) {
    const key = JSON.stringify([...excluded.keys()].toSorted());
    memoryRequire(!visited.has(key), "native proposals have incompatible authority dependencies");
    visited.add(key);
    const prepared = prepareNarrationNative(state, publication.readset, publication.raw, submissionId, at, excluded);
    const result = evaluate(prepared);
    let restored = false;
    for (const id of excluded.keys()) {
      const retryExclusions = new Map(excluded);
      retryExclusions.delete(id);
      const retry = prepareNarrationNative(
        state,
        publication.readset,
        publication.raw,
        submissionId,
        at,
        retryExclusions,
      );
      const retried = evaluate(retry);
      if ("usableIds" in retried && retried.usableIds.includes(id)) {
        excluded.delete(id);
        restored = true;
        break;
      }
    }
    if (restored) continue;
    const dropped = prepared.native.effects
      .filter(
        (effect) =>
          effect.independent &&
          (prepared.native.receipts[effect.id] || prepared.native.movementDependencies?.includes(effect.id)) &&
          result.rejected.some((row) => row.id === effect.id) &&
          !excluded.has(effect.id),
      )
      .toSorted(
        (a, b) =>
          Math.max(-1, ...(prepared.native.sources[a.id] ?? []).map((source) => source.moment!.index)) -
          Math.max(-1, ...(prepared.native.sources[b.id] ?? []).map((source) => source.moment!.index)),
      )
      .slice(0, 1);
    if (dropped.length) {
      for (const effect of dropped)
        excluded.set(
          effect.id,
          result.rejected.find((row) => row.id === effect.id)?.reason ?? "Native effect was not selected.",
        );
      continue;
    }
    if (result.held) return result;
    Object.assign(state, prepared.candidate);
    return result;
  }
}
