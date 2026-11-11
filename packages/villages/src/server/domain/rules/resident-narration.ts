import { z } from "zod";
import type {
  ContinuityAdmission,
  ContinuityEvidence,
  ContinuityHolder,
  ContinuityTarget,
} from "../models/continuity-model.js";
import type { AcceptedEpisode } from "../models/episode-model.js";
import type { ResidentNarration, ResidentNarrationCapture } from "../models/resident-narration.js";
import type { ResidentPlanningOpportunity, VillageState } from "../models/world.js";
import { episodeSourceGraph } from "../decoding/episode-codec.js";
import { continuityActor } from "./continuity-actors.js";
import { captureContinuityContext } from "./continuity-context.js";
import { episodeContextRooms } from "./episode-sources.js";
import { selectRoomContinuity } from "./continuity-retrieval.js";
import {
  applyContinuityWrite,
  assertContinuityKnowledge,
  assertContinuityProvenance,
  continuityConstraints,
  continuityHolderKey,
  continuityProtectionFingerprint,
  continuityProtectionUnits,
  continuitySelfSource,
  continuitySourceUnit,
  continuityVersionUnit,
} from "./continuity.js";
import { assertContinuityRetention } from "./continuity-retention.js";
import { appendEpisode } from "./episodes.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";
import {
  readContinuityProposal,
  readNarrationEffectHeader,
  readNarrationReply,
  narrationSourceSchema,
} from "./narration-contract.js";
import { prepareContinuityKeep } from "./narration-keep.js";
import { bindNarrationSegment, bindNarrationReceipt, type NarrationCommunication } from "./narration-sources.js";
import { findLocation } from "./places.js";
import { structuralShape } from "./project-structure.js";
import { selectSceneEffects, resolveNarrationEffects, type SceneEffectResult } from "./scene-acceptance.js";
import { villagePresence } from "./village-projections.js";
import { ZonedDate } from "../../../shared/helpers/zoned-date.js";
import type { VenueLine } from "../models/scene-model.js";
import { agendaBlocksFor } from "./agenda-week.js";
import { readResidentNarrationCapture } from "../decoding/resident-narration-codec.js";
import { narrationAccessScopes, applyNarrationAccess, assertNarrationDecision } from "./narration-access.js";
import { narrationResidenceContext, applyNarrationResidence } from "./narration-residence.js";
import { narrationAppointment } from "./narration-appointment.js";
import { capturedSceneCalendar } from "./scene-calendar.js";
import { readNarrationNativeCommand } from "./narration-command-contract.js";

const id = z.string().min(1).max(160),
  label = z.string().regex(/^[A-Za-z][A-Za-z0-9_-]{0,47}$/);
const encounter = z
  .object({
    opportunityId: id,
    lines: z
      .array(
        z
          .object({
            id: label.optional(),
            kind: z.enum(["dialogue", "narration"]).optional(),
            speakerId: id.optional(),
            text: z.string().min(1).max(600),
          })
          .strict(),
      )
      .min(2)
      .max(8),
  })
  .strict();
const reflection = z.object({ actorId: id, text: z.string().min(1).max(600) }).strict();
const output = z
  .object({
    encounter: encounter.optional(),
    reflection: reflection.optional(),
    keep: z.array(z.unknown()).max(32),
    requires: z.array(label).max(48),
    commands: z.array(z.unknown()).max(16).default([]),
  })
  .strict();
const localDate = (state: VillageState, at: string) =>
  new ZonedDate(at, state.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone);

function nativeFingerprint(state: VillageState, opportunity: ResidentPlanningOpportunity) {
  const venue = findLocation(state, opportunity.venueId);
  return memoryHash({
    seed: state.seed,
    setupAt: state.setupAt,
    actors: opportunity.actorIds.map((id) => {
      const actor = state.villagers.find((row) => row.characterId === id);
      return (
        actor && {
          id,
          incarnation: actor.incarnation,
          card: actor.cardSnapshot,
          identity: actor.identityDescription,
          routine: actor.agenda && {
            week: actor.agenda.week,
            profile: actor.agenda.routineProfile,
            influence: actor.agenda.scheduleInfluenceSnapshot,
            sourceDay: agendaBlocksFor(actor.agenda, localDate(state, opportunity.endsAt)),
          },
        }
      );
    }),
    venue: venue && {
      id: venue.id,
      classes: venue.classes,
      form: venue.form,
      zones: venue.zones?.map(structuralShape),
      access: venue.access,
      construction: venue.constructionStatus,
    },
    plans: state.residentPlans.plans.filter((plan) =>
      plan.actors.some((actor) => opportunity.actorIds.includes(actor.id)),
    ),
    narrative: state.narrative,
  });
}
const contextHolders = (capture: ResidentNarrationCapture): ContinuityHolder[] => [
  ...[...capture.context.actors, ...capture.context.references].map((actor) => ({ kind: "actor" as const, ...actor })),
  ...episodeContextRooms(
    { actors: capture.context.actors, room: capture.room?.holder },
    Object.keys(capture.context.provenance),
  ),
  ...(capture.room ? [capture.room.holder] : []),
];

/** One existing GM opportunity captures real attendance, complete local truth and bounded common recall. */
export function captureResidentNarration(
  state: VillageState,
  opportunity: ResidentPlanningOpportunity,
  historical = false,
): ResidentNarrationCapture {
  memoryRequire(
    opportunity.kind === "encounter" || opportunity.kind === "routine",
    "resident narration cannot admit a world development opportunity",
  );
  memoryRequire(
    opportunity.actorIds.length > 0 &&
      opportunity.actorIds.length <= 4 &&
      new Set(opportunity.actorIds).size === opportunity.actorIds.length &&
      !opportunity.actorIds.includes("player"),
    "invalid resident opportunity cast",
  );
  const at = opportunity.endsAt,
    date = localDate(state, at),
    actors = opportunity.actorIds.map((id) => {
      const actor = continuityActor(state, id);
      memoryRequire(
        actor && state.villagers.some((row) => row.characterId === id),
        "resident opportunity actor is unavailable",
      );
      return { id: actor.id, incarnation: actor.incarnation, zoneId: opportunity.zoneId || "native" };
    });
  if (opportunity.venueId) {
    const presence = villagePresence(state, date.getHours() * 60 + date.getMinutes(), date);
    memoryRequire(
      actors.every(
        (actor) =>
          presence.get(actor.id)?.id === opportunity.venueId && presence.get(actor.id)?.zoneId === opportunity.zoneId,
      ),
      "resident opportunity changed its native attendance",
    );
  }
  memoryRequire(
    opportunity.kind !== "encounter" || (actors.length >= 2 && !!opportunity.venueId && !!opportunity.zoneId),
    "encounter needs its actual shared Zone",
  );
  const context = captureContinuityContext(
    state,
    ["player", ...opportunity.actorIds],
    opportunity.facts.join(" "),
    at,
    opportunity.venueId ? { placeId: opportunity.venueId, zoneId: opportunity.zoneId! } : undefined,
  );
  let room: ResidentNarrationCapture["room"];
  if (opportunity.venueId) {
    const venue = findLocation(state, opportunity.venueId),
      zone = venue?.zones?.find((row) => row.id === opportunity.zoneId);
    memoryRequire(zone, "resident opportunity Zone is unavailable");
    const holder = { kind: "room" as const, placeId: opportunity.venueId, zoneId: zone.id },
      selection = selectRoomContinuity(state.continuity, state.episodes, holder, at, {
        query: opportunity.facts.join(" "),
        bytes: 16000,
        requiredIds: [],
        wholeRoom: false,
      });
    room = {
      holder,
      supplied: selection.supplied,
      packet: selection.packet,
      protections: continuityConstraints(state.continuity, [holder]),
      fingerprint: continuityProtectionFingerprint(state.continuity, [holder]),
      provenance: selection.supplied.map((target) =>
        continuityVersionUnit(
          state.continuity.records.find((row) => row.id === target.id)!.heads[continuityHolderKey(holder)].versionId,
        ),
      ),
    };
  }
  const capture: ResidentNarrationCapture = {
    format: 1,
    context,
    opportunity: { ...structuredClone(opportunity), kind: opportunity.kind },
    actors,
    nativeFingerprint: nativeFingerprint(state, opportunity),
    protectionFingerprint: "",
    ...(historical ? { historical: true as const } : {}),
    calendar: capturedSceneCalendar({ startedAt: at }, state.timeZone),
    access: narrationAccessScopes(state, opportunity.actorIds),
    residence: narrationResidenceContext(state, opportunity.actorIds),
    ...(room ? { room } : {}),
  };
  capture.protectionFingerprint = continuityProtectionFingerprint(state.continuity, contextHolders(capture));
  memoryRequire(
    Buffer.byteLength(JSON.stringify(capture)) <= 192000,
    "required resident narration context does not fit before generation",
  );
  return readResidentNarrationCapture(capture);
}

export function assertResidentNarrationCurrent(state: VillageState, capture: ResidentNarrationCapture) {
  memoryRequire(
    capture.format === 1 &&
      capture.context.seed === state.seed &&
      capture.context.setupAt === state.setupAt &&
      capture.opportunity.endsAt === capture.context.at,
    "resident narration world or source changed",
  );
  memoryRequire(
    capture.context.actors.every((actor) => continuityActor(state, actor.id)?.incarnation === actor.incarnation),
    "resident narration context actor incarnation changed",
  );
  memoryRequire(
    capture.nativeFingerprint === nativeFingerprint(state, capture.opportunity),
    "resident narration native authority changed",
  );
  if (capture.opportunity.venueId) {
    const at = localDate(state, capture.context.at),
      presence = villagePresence(state, at.getHours() * 60 + at.getMinutes(), at);
    memoryRequire(
      capture.actors.every(
        (actor) =>
          presence.get(actor.id)?.id === capture.opportunity.venueId && presence.get(actor.id)?.zoneId === actor.zoneId,
      ),
      "resident narration native attendance changed",
    );
  }
  memoryRequire(
    capture.protectionFingerprint === continuityProtectionFingerprint(state.continuity, contextHolders(capture)),
    "resident narration protection changed",
  );
  for (const target of capture.room?.supplied ?? []) {
    const current = state.continuity.records.find((row) => row.id === target.id);
    memoryRequire(
      current?.revision === target.recordRevision &&
        Object.entries(target.heads).every(([key, revision]) => current.heads[key]?.revision === revision),
      "resident narration room context changed",
    );
  }
}

/** Actual NPC fiction and its keeps publish once, without a fabricated Scene or another interpretation. */
export function acceptResidentNarration(
  state: VillageState,
  capture: ResidentNarrationCapture,
  raw: ResidentNarration,
  responseDigest: string,
  acceptedAt: string,
) {
  capture = readResidentNarrationCapture(capture);
  const episodeId = "resident-" + memoryHash([capture.context.seed, capture.opportunity.id]).slice(0, 32),
    digest = memoryHash([capture, raw, responseDigest]),
    prior = state.episodes.records.find((row) => row.id === episodeId);
  if (prior) {
    memoryRequire(prior.responseDigest === digest, "accepted resident narration identity reused");
    return {
      held: false as const,
      episode: prior,
      acceptedIds: [] as string[],
      rejected: [] as { id: string; reason: string }[],
      replayed: true,
    };
  }
  assertResidentNarrationCurrent(state, capture);
  const selected = resolveNarrationEffects((excluded) => {
    const candidate = raw.commands?.length ? structuredClone(state) : { ...state };
    return {
      ...prepareResidentNarration(candidate, state, capture, raw, episodeId, digest, acceptedAt, excluded),
      candidate,
    };
  });
  if (!selected.result.held) Object.assign(state, selected.candidate);
  return selected.result;
}

function prepareResidentNarration(
  state: VillageState,
  before: VillageState,
  capture: ResidentNarrationCapture,
  raw: ResidentNarration,
  episodeId: string,
  digest: string,
  acceptedAt: string,
  excluded: Map<string, string>,
) {
  const value = output.parse(raw);
  memoryRequire(!(value.encounter && value.reflection), "choose an encounter or private reflection");
  const actorIds = capture.actors.map((actor) => actor.id),
    reflector = value.reflection?.actorId;
  if (value.encounter)
    memoryRequire(
      capture.opportunity.kind === "encounter" && value.encounter.opportunityId === capture.opportunity.id,
      "encounter changed its captured opportunity",
    );
  if (reflector) memoryRequire(actorIds.includes(reflector), "private reflection actor was not offered");
  memoryRequire(
    value.encounter || value.reflection || (!value.keep.length && !value.requires.length && !value.commands.length),
    "lasting resident meaning needs its actual encounter or reflection",
  );
  const segments =
      value.encounter?.lines.map((line) => ({ ...line, kind: line.kind ?? "dialogue" })) ??
      (value.reflection ? [{ id: "reflection", kind: "narration", text: value.reflection.text }] : []),
    parsed = segments.length ? readNarrationReply({ segments, keep: value.keep }, actorIds) : undefined;
  memoryRequire(
    !value.encounter ||
      new Set(parsed!.segments.filter((line) => line.kind === "dialogue").map((line) => line.speakerId)).size >= 2,
    "encounter needs two actual speakers",
  );
  const lines: VenueLine[] = (parsed?.segments ?? []).map((line, index) => ({
      id: episodeId + ":line:" + index,
      role: "assistant",
      speakerId: line.kind === "dialogue" ? line.speakerId : "__venue_scene__",
      name: line.kind === "dialogue" ? line.speakerId : "Narration",
      content: line.text,
      kind: line.kind,
      at: capture.context.at,
      heardBy: reflector ? [reflector] : [...actorIds],
      zoneId: capture.opportunity.zoneId || "native",
      contactHidden: true,
    })),
    labels = Object.fromEntries((parsed?.segments ?? []).map((line, index) => [line.id, lines[index].id])),
    actors = capture.actors.map((actor) => ({ kind: "actor" as const, id: actor.id, incarnation: actor.incarnation })),
    holders = contextHolders(capture),
    provenance = {
      ...capture.context.provenance,
      ...(capture.room
        ? {
            [continuityHolderKey(capture.room.holder)]: [
              ...new Set([
                ...(capture.context.provenance[continuityHolderKey(capture.room.holder)] ?? []),
                ...capture.room.provenance,
              ]),
            ],
          }
        : {}),
    },
    blocked = Object.fromEntries(
      holders.map((holder) => [
        continuityHolderKey(holder),
        [...continuityProtectionUnits(state.continuity, holder, episodeSourceGraph(state.episodes.records, holder))],
      ]),
    );
  for (const holder of holders)
    assertContinuityProvenance(
      provenance[continuityHolderKey(holder)] ?? [],
      new Set(blocked[continuityHolderKey(holder)]),
    );
  const historical = Object.fromEntries(
      Object.entries(capture.context.historical).map(([ref, source]) => [
        ref,
        source.kind === "knowledge"
          ? { ...source, episodeId, id: "source-" + memoryHash([episodeId, source.fingerprint]).slice(0, 32) }
          : source,
      ]),
    ),
    targets = new Map<string, ContinuityTarget>();
  for (const target of [...capture.context.supplied, ...(capture.room?.supplied ?? [])]) {
    const before = targets.get(target.id);
    memoryRequire(!before || before.recordRevision === target.recordRevision, "conflicting resident fitted target");
    targets.set(target.id, { ...target, heads: { ...before?.heads, ...target.heads } });
  }
  const admission: ContinuityAdmission = {
    seed: state.seed,
    episodeId,
    operationId: episodeId,
    at: capture.context.at,
    actors,
    subjects: capture.context.subjects,
    continuityRevision: capture.context.continuityRevision,
    sources: [],
    sourceActors: capture.context.sourceActors,
    supplied: [...targets.values()],
    protectedRoots: [
      ...new Set([...capture.context.protectedRoots, ...(capture.room?.protections.map((row) => row.id) ?? [])]),
    ],
    protectionFingerprint: capture.protectionFingerprint,
    blockedSources: blocked,
    provenance,
    ...(capture.room ? { room: capture.room.holder } : {}),
  };
  const fitted = lines.length ? Object.values(historical).filter((source) => source.kind === "knowledge") : [];
  for (const source of fitted)
    assertContinuityKnowledge(
      state.continuity,
      source,
      holders.filter((holder) => holder.kind === "actor"),
      admission.continuityRevision!,
      admission.sourceActors,
    );
  const effects: SceneEffectResult[] = [],
    prepared = new Map<string, ReturnType<typeof prepareContinuityKeep>>(),
    receipts: Record<string, AcceptedEpisode["commandReceipts"][number]> = {},
    proofs: Record<string, ContinuityEvidence[]> = {},
    positions = () => Object.fromEntries(capture.actors.map((actor) => [actor.id, actor.zoneId])),
    communication: NarrationCommunication = { seed: state.seed, episodeId, input: "", actors, lines, positions },
    commandRows: {
      ordinal: number;
      segment: number;
      effect: SceneEffectResult;
      command: ReturnType<typeof readNarrationNativeCommand>;
    }[] = [];
  for (const [ordinal, raw] of value.commands.entries()) {
    let effect: SceneEffectResult;
    try {
      effect = readNarrationEffectHeader(raw, "command-" + ordinal);
    } catch (error) {
      effects.push({ id: "command-" + ordinal, requires: [], failure: String(error).slice(0, 2000) });
      continue;
    }
    effects.push(effect);
    try {
      memoryRequire(value.encounter, "native commands require an actual resident encounter");
      const command = readNarrationNativeCommand(raw),
        segment = lines.findIndex((line) => line.id === labels[command.at]);
      memoryRequire(segment >= 0, "resident native command needs its actual utterance label");
      memoryRequire(
        !capture.historical || command.type === "appointment",
        "past resident encounters cannot change current native mechanics",
      );
      if (excluded.has(effect.id)) {
        effect.failure = excluded.get(effect.id);
        continue;
      }
      commandRows.push({ ordinal, segment, effect, command });
    } catch (error) {
      effect.failure = String(error).slice(0, 2000);
    }
  }
  const accessBefore = narrationAccessScopes(before, actorIds);
  for (const { command, segment, effect } of commandRows.toSorted(
    (a, b) => a.segment - b.segment || a.ordinal - b.ordinal,
  )) {
    try {
      if (
        command.type !== "permission.grant" &&
        command.type !== "permission.revoke" &&
        command.type !== "access.decide" &&
        command.type !== "appointment" &&
        command.type !== "residence.request" &&
        command.type !== "residence.decide"
      )
        throw Error("That native operation requires a real Player Scene or its admitted authority.");
      const sources = command.source.map((raw) => {
        let ref = narrationSourceSchema.parse(raw);
        if (typeof ref === "string") {
          memoryRequire(
            ref !== "self" && !ref.startsWith("h:") && !ref.startsWith("native:"),
            "native resident decisions need complete current spoken segments",
          );
          ref = { segment: ref };
        }
        memoryRequire("segment" in ref, "native resident decisions need complete current spoken segments");
        return bindNarrationSegment(ref, {
          seed: state.seed,
          episodeId,
          actors,
          lines,
          labels,
          privateActorIds: actorIds,
          positions,
        });
      });
      memoryRequire(
        sources.every((source) => source.moment && source.moment.index <= segment) &&
          Math.max(...sources.map((source) => source.moment!.index)) === segment,
        "native decision must match its actual current utterance",
      );
      assertNarrationDecision(state, command.by, communication, sources);
      const receiptId = "native-" + memoryHash([episodeId, effect.id]).slice(0, 40),
        readset = {
          source: { seed: state.seed, episodeId, actors },
          setupAt: capture.context.setupAt,
          capturedAt: capture.context.at,
          calendar: capture.calendar,
          access: capture.access,
          residence: capture.residence,
        },
        candidate = structuredClone(state);
      let receipt: AcceptedEpisode["commandReceipts"][number];
      if (command.type === "appointment") {
        memoryRequire(command.when, "appointment needs its stated day");
        receipt = narrationAppointment(candidate, { ...command, when: command.when }, readset, sources, receiptId);
      } else if (command.type === "residence.request" || command.type === "residence.decide")
        receipt = applyNarrationResidence(
          candidate,
          before,
          command,
          readset,
          sources,
          receiptId,
          acceptedAt,
          effect.requires.flatMap((id) => (receipts[id] ? [receipts[id]] : [])),
        );
      else {
        const baseline = accessBefore.find((scope) => scope.venueId === command.venue);
        memoryRequire(baseline, "native access scope is missing");
        const decision =
          command.type === "access.decide"
            ? { type: command.type, by: command.by, venue: command.venue, zone: command.zone, ...command.decision }
            : command;
        receipt = applyNarrationAccess(
          candidate,
          decision,
          readset,
          communication,
          sources,
          baseline,
          receiptId,
          acceptedAt,
        );
      }
      Object.assign(state, candidate);
      receipts[effect.id] = receipt;
      proofs[effect.id] = sources;
    } catch (error) {
      effect.failure = String(error).slice(0, 2000);
    }
  }
  const provisional = effects
    .filter((effect) => receipts[effect.id])
    .map((effect) => ({ effect, sources: proofs[effect.id] }));
  for (const [ordinal, row] of value.keep.entries()) {
    let header: ReturnType<typeof readNarrationEffectHeader>;
    try {
      header = readNarrationEffectHeader(row, "keep-" + ordinal);
    } catch (error) {
      effects.push({ id: "keep-" + ordinal, requires: [], failure: String(error).slice(0, 2000) });
      continue;
    }
    const effect: SceneEffectResult = { ...header };
    try {
      const proposal = readContinuityProposal(row);
      memoryRequire(
        !reflector || (Array.isArray(proposal.for) && proposal.for.every((id) => id === reflector)),
        "private reflection may retain only its actual owner",
      );
      const keep = prepareContinuityKeep(row, ordinal, state.continuity, admission, {
        seed: state.seed,
        episodeId,
        operationId: episodeId,
        actors,
        subjects: admission.subjects,
        bindSource(raw, owner) {
          const ref = narrationSourceSchema.parse(raw);
          if (typeof ref === "string" && ref.startsWith("native:")) {
            const receipt = receipts[ref.slice(7)];
            memoryRequire(receipt, "native resident source was not validated");
            return bindNarrationReceipt(receipt, communication, owner);
          }
          if (ref === "self") {
            memoryRequire(
              owner.holder.kind === "actor" &&
                actorIds.includes(owner.holder.id) &&
                (!reflector || owner.holder.id === reflector),
              "resident self belongs only to its portrayed actor",
            );
            return continuitySelfSource({ seed: state.seed, episodeId, operationId: episodeId }, owner);
          }
          if (typeof ref === "string" && ref.startsWith("h:")) {
            memoryRequire(Object.hasOwn(historical, ref), "resident historical source was not fitted");
            return structuredClone(historical[ref]);
          }
          memoryRequire(
            typeof ref === "string" || "segment" in ref,
            "resident narration cannot invent player input evidence",
          );
          let segmentRef = typeof ref === "string" ? { segment: ref } : ref;
          if (reflector) {
            memoryRequire(
              !segmentRef.act &&
                (!segmentRef.perceive ||
                  (segmentRef.perceive.kind === "private" &&
                    segmentRef.perceive.by.length === 1 &&
                    segmentRef.perceive.by[0] === reflector)),
              "reflection cannot establish an external observation or decision",
            );
            segmentRef = { ...segmentRef, perceive: { kind: "private", by: [reflector] } };
          }
          return bindNarrationSegment(
            segmentRef,
            {
              seed: state.seed,
              episodeId,
              actors,
              room: capture.room?.holder,
              privateActorIds: reflector ? [reflector] : actorIds,
              lines,
              labels,
              positions: () => Object.fromEntries(capture.actors.map((actor) => [actor.id, actor.zoneId])),
            },
            owner,
          );
        },
      });
      effect.requires = [
        ...new Set([
          ...effect.requires,
          ...keep.sources
            .filter((source) => source.kind === "native" && source.episodeId === episodeId)
            .map((source) => {
              const id = Object.keys(receipts).find((id) => receipts[id].id === source.committedReceiptId);
              memoryRequire(id, "continuity cited an unvalidated resident native effect");
              return id;
            }),
        ]),
      ];
      prepared.set(header.id, keep);
    } catch (error) {
      effect.failure = error instanceof Error ? error.message.slice(0, 2000) : String(error).slice(0, 2000);
    }
    effects.push(effect);
  }
  let continuity = state.continuity,
    selection: ReturnType<typeof selectSceneEffects>;
  for (;;) {
    selection = selectSceneEffects(effects, value.requires);
    if (selection.held) return { result: { ...selection, episode: undefined, replayed: false }, provisional };
    continuity = state.continuity;
    let failed = false;
    for (const id of selection.acceptedIds) {
      const keep = prepared.get(id);
      try {
        if (keep) continuity = applyContinuityWrite(continuity, keep.write, keep.admission);
        const receipt = receipts[id];
        if (receipt?.kind === "access" && receipt.witnesses.length) {
          const evidence = bindNarrationReceipt(receipt, communication);
          continuity = applyContinuityWrite(
            continuity,
            {
              id: "native-" + memoryHash(id).slice(0, 32),
              holders: actors.filter((actor) => receipt.witnesses.includes(actor.id)),
              class: "experience",
              current: false,
              text: receipt.text,
              sourceIds: [evidence.id],
            },
            { ...admission, protectedRoots: [], sources: [evidence], supplied: [] },
          );
        }
      } catch (error) {
        effects.find((row) => row.id === id)!.failure = String(error).slice(0, 2000);
        failed = true;
      }
    }
    if (!failed) break;
  }
  const versions = continuity.versions.slice(state.continuity.versions.length),
    grounding = new Map<string, ContinuityEvidence>(),
    holderDependencies: NonNullable<AcceptedEpisode["holderDependencies"]> = {};
  if (reflector) {
    const source = bindNarrationSegment(
      { segment: "reflection", perceive: { kind: "private", by: [reflector] } },
      {
        seed: state.seed,
        episodeId,
        actors,
        privateActorIds: [reflector],
        lines,
        labels,
        room: capture.room?.holder,
        positions: () => Object.fromEntries(capture.actors.map((actor) => [actor.id, actor.zoneId])),
      },
    );
    grounding.set(source.id, source);
  }
  for (const source of [
    ...fitted,
    ...selection.acceptedIds.flatMap((id) => [
      ...(prepared.get(id)?.sources ?? []),
      ...(proofs[id] ?? []),
      ...(receipts[id] ? [bindNarrationReceipt(receipts[id], communication)] : []),
    ]),
  ].filter((source) => source.episodeId === episodeId)) {
    const before = grounding.get(source.id);
    memoryRequire(!before || memoryHash(before) === memoryHash(source), "conflicting resident source identity");
    grounding.set(source.id, source);
  }
  for (const holder of holders) {
    const key = continuityHolderKey(holder),
      units = provenance[key] ?? [];
    if (
      lines.length &&
      (units.length || actors.some((actor) => continuityHolderKey(actor) === key) || holder.kind === "room")
    )
      holderDependencies[key] = Object.fromEntries(lines.map((line) => [line.id, [...units]]));
  }
  for (const version of versions) {
    for (const holder of holders.filter(
      (holder) => holder.kind === "room" && provenance[continuityHolderKey(holder)]?.length,
    ))
      (holderDependencies[continuityHolderKey(holder)] ??= {})["version:" + version.id] =
        provenance[continuityHolderKey(holder)];
    const record = continuity.records.find((record) => record.id === version.rootId)!;
    for (const head of Object.values(record.heads).filter((head) => head.versionId === version.id)) {
      const key = continuityHolderKey(head.holder);
      (holderDependencies[key] ??= {})["version:" + version.id] = [
        ...new Set([
          ...(provenance[key] ?? []),
          ...version.sources.filter((source) => source.kind !== "self").map(continuitySourceUnit),
        ]),
      ];
    }
  }
  const episode: AcceptedEpisode = {
    format: 1,
    id: episodeId,
    seed: state.seed,
    submissionId: capture.opportunity.id,
    operationId: episodeId,
    capturedAt: capture.context.at,
    acceptedAt,
    responseDigest: digest,
    admittedContinuityRevision: capture.context.continuityRevision,
    privateInput: "",
    actors: capture.actors,
    segments: lines,
    grounding: [...grounding.values()],
    continuityVersionIds: versions.map((version) => version.id),
    offered: capture.context.offered.filter((row) => actorIds.includes(row.holder.id)),
    commandReceipts: selection.acceptedIds.flatMap((id) => (receipts[id] ? [receipts[id]] : [])),
    dependencies: Object.fromEntries(
      selection.acceptedIds
        .filter((id) => receipts[id])
        .map((id) => ["native:" + receipts[id].id, [...new Set(proofs[id].map(continuitySourceUnit))]]),
    ),
    holderDependencies,
    ...(capture.room ? { room: capture.room.holder } : {}),
    opportunity: {
      id: capture.opportunity.id,
      kind: capture.opportunity.kind,
      venueId: capture.opportunity.venueId,
      zoneId: capture.opportunity.zoneId || "native",
    },
  };
  const episodes = appendEpisode(state.episodes, episode, state.seed);
  assertContinuityRetention(continuity, episodes);
  state.continuity = continuity;
  state.episodes = episodes;
  return { result: { ...selection, episode: episodes.records.at(-1)!, replayed: false }, provisional };
}
