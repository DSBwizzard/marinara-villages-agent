import { z } from "zod";
import type { VillageState } from "../models/world.js";
import type { NarrationReadset } from "../models/narration-model.js";
import type { ContinuityEvidence } from "../models/continuity-model.js";
import type { AcceptedEpisode } from "../models/episode-model.js";
import { readNarrativeDevelopment, applyNarrativeDevelopment, CONSEQUENCES } from "./narrative-development.js";
import { reserveSceneNarrative } from "./scene-narrative.js";
import { memoryRequire } from "./memory-integrity.js";
import { narrationWitnesses, type NarrationSourceContext } from "./narration-sources.js";

export const narrationCircumstanceFields = {
  severity: z.enum(CONSEQUENCES).optional(),
  occurrence: z.string().min(1).max(1200).optional(),
  situation: z
    .object({
      id: z.string().min(1).max(160).optional(),
      title: z.string().min(1).max(160),
      summary: z.string().min(1).max(1200),
      status: z.enum(["active", "resolved"]).optional(),
    })
    .strict(),
  conditions: z
    .array(
      z
        .object({
          id: z.string().min(1).max(160).optional(),
          observation: z.string().min(1).max(600).optional(),
          restriction: z.enum(["none", "ordinary-use"]).optional(),
          remedy: z.string().max(600).optional(),
          durationMinutes: z.number().int().min(1).max(10080).optional(),
          clear: z.boolean().optional(),
        })
        .strict(),
    )
    .max(4)
    .optional(),
};
type Command = z.infer<z.ZodObject<typeof narrationCircumstanceFields>>;

/** Only finite native circumstance metadata: appearance remains common room continuity. */
export function narrationCircumstancePrompt(grant: NarrationReadset["circumstance"]) {
  return grant
    ? {
        id: grant.id,
        consequence: grant.consequence,
        zoneId: grant.targets[0]!.zoneId,
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
) {
  const grant = readset.circumstance,
    line = context.lines[segment];
  memoryRequire(
    grant &&
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
  memoryRequire(
    reserveSceneNarrative(state, readset.source.scene, grant, new Date(at), readset.source.operationId),
    "the shared world opportunity changed or is unavailable",
  );
  const previous = grant.situations.find((row) => row.id === command.situation.id);
  const development = readNarrativeDevelopment(
    {
      severity: command.severity ?? grant.consequence,
      occurrence: command.occurrence ?? line.content,
      situation: {
        scope: previous?.scope ?? "zone",
        id: command.situation.id ?? null,
        expectedRevision: previous?.revision ?? 0,
        title: command.situation.title,
        summary: command.situation.summary,
        status: command.situation.status ?? "active",
      },
      physical: [],
      weather: null,
      conditions: (command.conditions ?? []).map((row) => {
        const old = grant.conditions.find((condition) => condition.id === row.id);
        return {
          id: row.id ?? null,
          expectedRevision: old?.revision ?? 0,
          venueId: grant.targets[0]!.venueId,
          zoneId: grant.targets[0]!.zoneId,
          observation: row.observation ?? old?.observation,
          restriction: row.restriction ?? old?.restriction ?? "none",
          remedy: row.remedy ?? old?.remedy ?? "",
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
  const result = applyNarrativeDevelopment(state, grant, development),
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
    witnesses: narrationWitnesses(sources),
    observedBy: narrationWitnesses(sources, ["sight"]),
  };
  return receipt;
}
