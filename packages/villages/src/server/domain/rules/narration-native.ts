import { z } from "zod";
import type { VillageState } from "../models/world.js";
import type { NarrationReadset } from "../models/narration-model.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";
import { narrationSourceSchema, readNarrationEffectHeader, readNarrationReply } from "./narration-contract.js";
import { bindNarrationSource, assertNarrationSourceOrder } from "./narration-sources.js";
import { narrationLines } from "./narration-lines.js";
import {
  acceptedNarrationEpisode,
  narrationIsAbandoned,
  acceptNarrationContinuity,
  type NarrationPublication,
} from "./narration-acceptance.js";
import { applyNarrationProject } from "./narration-project.js";
import { applyNarrationScene } from "./narration-scene.js";
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
  'Native commands share {id?:label,at:segment label,source:[exact consequential sources],requires?:[effect IDs],independent?:true}. Current communication is required; recalled/private consent is never authority. Supported commands: {type:"scene.end"} only from the actual Player spoken/visible departure intent at the final segment; {type:"contact.end",who} ends only an admitted doorway contact, with deciding words (or the actual Player intent); {type:"project.decide",by,project,decision:"approval|builder|refuse|withdrawal|conditional|uncertain"}; {type:"permission.grant|permission.revoke",by,visitor,venue,zone}; {type:"access.decide",by,venue,zone,decision:{outcome:"invite-now|invite-later|invite-outside-hours|refuse|dismiss|ban-zone|ban-venue",visitor,accompanies?}|{outcome:"access-management",management:exact native AccessCommand action fields without operationId,expectedRevision,zoneId,sceneId}}. Use only supplied native scopes. A conditional or uncertain Project answer grants no approval or lead. An access condition beyond accompaniment cannot grant access. Native success assertions must require their command ID.';

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
  const context = {
    ...readset.source,
    ...narrationLines(reply, readset.source.scene, readset.source.episodeId, readset.capturedAt, []),
    native: {},
    moves: [],
  };
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
        const command = readNarrationNativeCommand(raw),
          lineId = context.labels[command.at];
        const segment = context.lines.findIndex((line) => line.id === lineId);
        memoryRequire(segment >= 0, "native command needs its actual supplied segment");
        return { command, effect, segment, index };
      } catch (error) {
        effect.failure = String(error).slice(0, 2000);
        return undefined;
      }
    })
    .filter((row) => row !== undefined)
    .toSorted((a, b) => a.segment - b.segment || a.index - b.index);
  function apply(candidate: VillageState, row: (typeof commands)[number]) {
    const { command, effect } = row;
    const sources = command.source.map((ref) => bindNarrationSource(ref, context));
    memoryRequire(
      sources.every(
        (source) =>
          source.moment && source.episodeId === readset.source.episodeId && source.moment.index <= row.segment,
      ) &&
        (command.type === "scene.end" ||
          (command.type === "contact.end" && command.who === "player") ||
          Math.max(...sources.map((source) => source.moment!.index)) === row.segment),
      "native decision must match its actual current utterance",
    );
    assertNarrationSourceOrder(sources);
    const receiptId = "native-" + memoryHash([readset.source.episodeId, effect.id]).slice(0, 40);
    if (command.type === "scene.end" || command.type === "contact.end")
      return applyNarrationScene(candidate, command, readset, context, sources, receiptId, row.segment);
    assertNarrationDecision(candidate, command.by, context, sources);
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
    } catch (error) {
      row.effect.failure = String(error).slice(0, 2000);
    }
  }
  return { native, candidate };
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
  for (;;) {
    const key = JSON.stringify([...excluded.keys()].toSorted());
    memoryRequire(!visited.has(key), "native proposals have incompatible authority dependencies");
    visited.add(key);
    const prepared = prepareNarrationNative(state, publication.readset, publication.raw, submissionId, at, excluded);
    const result = acceptNarrationContinuity(
      prepared.candidate,
      { ...publication, native: prepared.native },
      submissionId,
      at,
    );
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
      const retried = acceptNarrationContinuity(
        retry.candidate,
        { ...publication, native: retry.native },
        submissionId,
        at,
      );
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
          prepared.native.receipts[effect.id] &&
          result.rejected.some((row) => row.id === effect.id) &&
          !excluded.has(effect.id),
      )
      .toSorted(
        (a, b) =>
          Math.max(...prepared.native.sources[a.id].map((source) => source.moment!.index)) -
          Math.max(...prepared.native.sources[b.id].map((source) => source.moment!.index)),
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
