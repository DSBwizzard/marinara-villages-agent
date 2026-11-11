import type { z } from "zod";
import type { VillageState } from "../models/world.js";
import type { NarrationReadset } from "../models/narration-model.js";
import type { NarrativeCondition } from "../models/narrative-model.js";
import type { ContinuityEvidence, ContinuityHolder } from "../models/continuity-model.js";
import type { AcceptedEpisode } from "../models/episode-model.js";
import type { VenueScene } from "../models/scene-model.js";
import { readNarrativeDevelopment, applyNarrativeDevelopment } from "./narrative-development.js";
import type { narrationCircumstanceFields } from "./narration-command-contract.js";
import { reserveSceneNarrative } from "./scene-narrative.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";
import { narrationPositions, narrationWitnesses, type NarrationSourceContext } from "./narration-sources.js";
import { activeNarrativeConditions } from "./narrative-environment.js";
import { sceneContinuityView } from "./scene-continuity.js";
import { currentRoomViews } from "./continuity-retrieval.js";
import { continuityRootId } from "./continuity.js";
import { readContinuityProposal } from "./narration-contract.js";
import { asRecord } from "./coerce.js";
import { findLocation } from "./places.js";
import { venueZones, zoneClosed } from "./venue-zones.js";
import { evaluateZoneAccess } from "./venue-access.js";
import { ZonedDate } from "../../../shared/helpers/zoned-date.js";

type Command = z.infer<z.ZodObject<typeof narrationCircumstanceFields>>;

function retainedRepairEntries(state: VillageState, condition: NarrativeCondition) {
  for (const origin of state.narrative?.receipts ?? []) {
    const saved = origin.after.conditions.find((row) => row.id === condition.id && row.repairEntries?.length);
    if (!saved) continue;
    if (
      origin.rejected ||
      saved.venueId !== condition.venueId ||
      saved.zoneId !== condition.zoneId ||
      memoryHash(saved.repairEntries) !== memoryHash(condition.repairEntries)
    )
      return false;
    const proof = state.episodes.records
      .flatMap((episode) =>
        episode.room?.placeId === condition.venueId && episode.room.zoneId === condition.zoneId
          ? episode.commandReceipts.flatMap((receipt) => receipt.conditionDamage ?? [])
          : [],
      )
      .find((link) => link.conditionId === condition.id);
    return origin.source === "world"
      ? !proof
      : !!proof && memoryHash(proof.entries) === memoryHash(condition.repairEntries);
  }
  return false;
}

export function sceneRepairOffers(
  state: VillageState,
  scene: VenueScene,
  room: Extract<ContinuityHolder, { kind: "room" }>,
  at: string,
): NarrationReadset["repairs"] {
  const local = activeNarrativeConditions(sceneContinuityView(state, scene).narrative, at).filter(
    (row) =>
      row.venueId === room.placeId &&
      row.zoneId === room.zoneId &&
      row.restriction === "ordinary-use" &&
      row.repairEntries?.length,
  );
  if (!local.length) return [];
  const observable = new Set(
    currentRoomViews(state.continuity, state.episodes, room, at)
      .filter((row) => row.version.room?.visibility === "observable" && !row.version.room.expiresAt)
      .map((row) => row.id),
  );
  return local.flatMap((row) =>
    row.repairEntries!.every((id) => observable.has(id)) && retainedRepairEntries(state, row)
      ? [{ id: row.id, revision: row.revision, entries: [...row.repairEntries!] }]
      : [],
  );
}

/** Tentative until Scene acceptance validates every required Room keep and its actual source. */
export function applyNarrationRepair(
  state: VillageState,
  command: Command,
  readset: NarrationReadset,
  context: NarrationSourceContext,
  sources: ContinuityEvidence[],
  receiptId: string,
  segment: number,
): AcceptedEpisode["commandReceipts"][number] {
  const proposed = command.conditions?.[0],
    room = readset.admission.room,
    line = context.lines[segment];
  const offer = proposed && readset.repairs.find((row) => row.id === proposed.id);
  memoryRequire(
    command.severity === undefined &&
      command.occurrence === undefined &&
      command.conditions?.length === 1 &&
      proposed?.clear === true &&
      Object.keys(proposed).length === 2 &&
      offer &&
      room &&
      context.scene.placeId === room.placeId &&
      line.kind === "narration" &&
      line.zoneId === room.zoneId &&
      sources.length === 1 &&
      sources.every(
        (source) =>
          source.unitId === line.id &&
          source.kind === "observation" &&
          source.perceptions.some((row) => row.actorId === "player" && row.channel === "sight"),
      ),
    "repair needs one supplied local condition and actual Player-seen completed work",
  );
  const condition = activeNarrativeConditions(state.narrative, readset.capturedAt).find((row) => row.id === offer.id);
  memoryRequire(
    condition?.revision === offer.revision &&
      !condition.clearedAt &&
      condition.restriction === "ordinary-use" &&
      condition.venueId === room.placeId &&
      condition.zoneId === room.zoneId &&
      memoryHash(condition.repairEntries) === memoryHash(offer.entries) &&
      retainedRepairEntries(state, condition),
    "the admitted repair condition changed",
  );
  const venue = findLocation(state, room.placeId),
    zone = venue && venueZones(venue).find((row) => row.id === room.zoneId);
  const positions = narrationPositions(context, { index: segment, side: "after" });
  memoryRequire(
    venue &&
      zone &&
      positions.player === room.zoneId &&
      evaluateZoneAccess(venue, zone, "player", {
        sceneId: context.scene.id,
        positions,
        at: new ZonedDate(readset.calendar.instant, readset.calendar.timeZone),
        unavailable: zoneClosed(state, venue, zone),
        environment: state.narrative,
      }).allowed,
    "the repair needs live local corrective access",
  );
  condition.clearedAt = readset.capturedAt;
  condition.revision++;
  state.narrative!.revision++;
  return {
    id: receiptId,
    kind: "condition-repair",
    targetId: condition.id,
    revision: condition.revision,
    text: line.content,
    witnesses: narrationWitnesses(sources),
    observedBy: narrationWitnesses(sources, ["sight"]),
    repairEntries: [...offer.entries],
  };
}

/** Only finite native circumstance metadata: appearance remains common room continuity. */
export function narrationCircumstancePrompt(grant: NarrationReadset["circumstance"]) {
  return grant
    ? {
        id: grant.id,
        consequence: grant.consequence,
        zoneId: grant.targets[0]!.zoneId,
        ...(!grant.targets[0]!.exterior && grant.targets[0]!.correctiveActorIds.length
          ? {
              roomDamage:
                "For a new enduring ordinary-use restriction caused by physical damage, add roomKeeps:[same-reply keep labels] to its condition. Link at most four distinct observable enduring Room adds or replacements across the occurrence, each to one condition. Cite the same Player-seen narration on each keep. The narration requires the circumstance, and the restriction and Room changes are one required outcome.",
            }
          : {}),
        situations: grant.situations.map(({ id, status, scope }) => ({ id, status, scope })),
        conditions: grant.conditions.map(({ id, restriction, endsAt, clearedAt }) => ({
          id,
          restriction,
          endsAt,
          clearedAt,
        })),
      }
    : null;
}

export function applyNarrationCircumstance(
  state: VillageState,
  command: Command,
  readset: NarrationReadset,
  context: NarrationSourceContext,
  sources: ContinuityEvidence[],
  receiptId: string,
  segment: number,
  at: string,
  keeps: unknown[],
) {
  const grant = readset.circumstance,
    situationRequest = command.situation,
    line = context.lines[segment];
  memoryRequire(
    grant &&
      situationRequest &&
      grant.at === readset.capturedAt &&
      line.kind === "narration" &&
      line.zoneId === grant.targets[0]!.zoneId &&
      sources.every(
        (source) =>
          source.unitId === line.id &&
          source.kind === "observation" &&
          source.perceptions.some((row) => row.actorId === "player" && row.channel === "sight"),
      ),
    "circumstance needs its finite local grant and actual Player-seen introduction",
  );
  const links = (command.conditions ?? []).map((condition) =>
    (condition.roomKeeps ?? []).map((id) => {
      const proposed = keeps.filter((keep) => asRecord(keep).id === id);
      memoryRequire(proposed.length === 1, "Room damage needs its exact same-reply keep label");
      const keep = readContinuityProposal(proposed[0]);
      memoryRequire(keep.for === "room", "Room damage cannot link an actor keep");
      return { id, root: keep.replace ?? continuityRootId(state.seed, readset.source.operationId + ":" + id) };
    }),
  );
  const damage = links.flat();
  if (damage.length) {
    const room = readset.admission.room;
    memoryRequire(
      sources.length === 1 &&
        room?.placeId === grant.targets[0]!.venueId &&
        room.zoneId === line.zoneId &&
        new Set(damage.map(({ root }) => root)).size === damage.length,
      "Room damage needs one actual observation in the admitted local Room",
    );
  }
  memoryRequire(
    reserveSceneNarrative(state, readset.source.scene, grant, new Date(at), readset.source.operationId),
    "the shared world opportunity changed or is unavailable",
  );
  const previous = grant.situations.find((row) => row.id === situationRequest.id);
  const development = readNarrativeDevelopment(
    {
      severity: command.severity ?? grant.consequence,
      occurrence: command.occurrence ?? line.content,
      situation: {
        scope: previous?.scope ?? "zone",
        id: situationRequest.id ?? null,
        expectedRevision: previous?.revision ?? 0,
        title: situationRequest.title,
        summary: situationRequest.summary,
        status: situationRequest.status ?? "active",
      },
      room: [],
      weather: null,
      conditions: (command.conditions ?? []).map((row) => {
        const old = grant.conditions.find((condition) => condition.id === row.id);
        return {
          id: row.id ?? null,
          expectedRevision: old?.revision ?? 0,
          venueId: grant.targets[0]!.venueId,
          zoneId: grant.targets[0]!.zoneId,
          ...(row.observation !== undefined ? { observation: row.observation } : {}),
          restriction: row.restriction ?? old?.restriction ?? "none",
          ...(row.remedy !== undefined || !old ? { remedy: row.remedy ?? "" } : {}),
          endsAt:
            row.durationMinutes === undefined
              ? (old?.endsAt ?? null)
              : new Date(Date.parse(grant.at) + row.durationMinutes * 60000).toISOString(),
          clear: row.clear ?? false,
        };
      }),
    },
    grant,
  );
  const result = applyNarrativeDevelopment(
      state,
      grant,
      development,
      damage.length ? links.map((rows) => rows.map(({ root }) => root)) : [],
    ),
    situation = result.after.situations[0]!;
  state.narrative!.claims = state.narrative!.claims?.filter((row) => row.id !== grant.id);
  const receipt: AcceptedEpisode["commandReceipts"][number] = {
    id: receiptId,
    kind: "circumstance",
    targetId: situation.id,
    revision: situation.revision,
    text: JSON.stringify({
      at: grant.at,
      situation: { title: situation.title, summary: situation.summary, status: situation.status },
      conditions: result.after.conditions.map((condition, index) => {
        const requested = command.conditions![index],
          fresh = !requested.id;
        return {
          id: condition.id,
          revision: condition.revision,
          ...(fresh || requested.observation !== undefined ? { observation: condition.observation } : {}),
          ...(fresh || requested.remedy !== undefined ? { remedy: condition.remedy } : {}),
          ...(fresh || requested.restriction !== undefined ? { restriction: condition.restriction } : {}),
          ...(fresh || requested.durationMinutes !== undefined ? { endsAt: condition.endsAt } : {}),
          ...(fresh || requested.clear !== undefined ? { clear: condition.clearedAt !== null } : {}),
        };
      }),
    }),
    circumstance: { summary: situation.summary, status: situation.status },
    ...(damage.length
      ? {
          conditionDamage: links.flatMap((rows, index) =>
            rows.length
              ? [
                  {
                    conditionId: result.after.conditions[index].id,
                    entries: rows.map(({ root }) => root),
                  },
                ]
              : [],
          ),
        }
      : {}),
    witnesses: narrationWitnesses(sources),
    observedBy: narrationWitnesses(sources, ["sight"]),
  };
  return { receipt, damage };
}
