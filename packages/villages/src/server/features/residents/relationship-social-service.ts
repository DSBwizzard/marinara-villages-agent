import { sceneMemoryContext } from "../../domain/rules/scene-memories.js";
import { ZonedDate } from "../../../shared/helpers/zoned-date.js";
import { asRecord } from "../../domain/rules/coerce.js";
import { WorkFailureError } from "../../domain/rules/work-failure.js";
class EncounterInterpretationError extends Error {}
import { villageNow } from "../../adapters/time/clock-gate.js";
import { z } from "zod";
import type { Handler } from "../../domain/models/background-model.js";
import type { SocialOutboxEntry } from "../../domain/models/social-outbox-model.js";
import { socialContextState } from "../../domain/rules/social-context.js";
import { SocialRevisionConflict } from "../../domain/rules/relationship-rules.js";
import type { SocialEncounter } from "../../domain/models/relationship-types.js";
import type { VillageState } from "../../domain/models/world.js";
import { parseRelationshipProposals } from "../../domain/rules/relationship-review.js";
import { applyRelationshipReview, reconcileRelationships } from "../../domain/rules/relationship-rules.js";
import { projectSocialActivities, reconcileSocialPlans, socialPlanValid } from "../../domain/rules/social-rules.js";
import { readEncounter } from "../../domain/rules/social-encounter.js";
import { settleStandingAccess } from "../../domain/rules/venue-access.js";
import type { mutateVillageState } from "../world/village-store.js";
import type { mutateRelationships } from "./relationship-store.js";
import { coerceSession } from "../../domain/decoding/scene-codec.js";
import { bindLiveProposals } from "../../domain/rules/live-exchange.js";
export type RelationshipSocialPorts = {
  readVillageSnapshot?: typeof import("../world/village-store.js").readVillageSnapshot;
  queueBackgroundJob?: typeof import("../../jobs/background-work.js").queueBackgroundJob;
  interpretSocialSource?: typeof import("../founding/village-bootstrap.js").interpretSocialSource;
  processLiveMemories?: typeof import("./live-memory.js").processLiveMemories;
  mutateVillageState: typeof mutateVillageState;
  mutateRelationships: typeof mutateRelationships;
};
/** A saved social outbox settles relationships before its Village acknowledgement. */
export function createRelationshipSocial(ports: RelationshipSocialPorts) {
  const { mutateVillageState, mutateRelationships, processLiveMemories } = ports;

  async function processSocialOutbox(village: VillageState): Promise<boolean> {
    const pending = (village.socialOutbox ?? []).filter((entry) => !entry.processed && !entry.error).slice(0, 8);
    if (!pending.length) return false;
    for (const entry of pending) {
      if (entry.seed !== village.seed) continue;
      try {
        const settled = await mutateRelationships(village.seed, (state) => {
          const current = { ...village, relationshipContext: state };
          reconcileRelationships(state, current);
          reconcileSocialPlans(current);
          projectSocialActivities(current);
          if (state.applied[entry.id]) {
            if (entry.reinterpreted) {
              const accepted = state.socialEncounters.find((row) => row.id === entry.id),
                raw = asRecord(entry.proposal.encounter);
              if (accepted) {
                accepted.memoryChanges = structuredClone(raw.memoryChanges);
                accepted.memoryContexts = structuredClone(raw.memoryContexts) as SocialEncounter["memoryContexts"];
                accepted.semanticProvenance = {
                  version: 2,
                  sourceHash: String(raw.semanticSourceHash),
                  interpretedAt: entry.at,
                };
              }
            }
            return;
          }
          if (entry.requiredPlanId && entry.requiredPlan?.id !== entry.requiredPlanId)
            throw new Error("The encounter has no admitted meeting plan.");
          if (
            entry.admitted &&
            entry.opportunity.actorIds.some((id) => {
              const original = entry.admitted!.villagers.find((row) => row.characterId === id),
                live = village.villagers.find((row) => row.characterId === id);
              return !live || !original || live.cardSnapshot.capturedAt !== original.cardSnapshot.capturedAt;
            })
          )
            throw new Error("An encounter participant changed. The original source is retained.");
          const plan = entry.candidates.find((candidate) => candidate.id === entry.proposal.planId);
          if (
            plan &&
            !state.applied[`social-plan-date:${plan.dateKey}`] &&
            current.backgroundPace !== "off" &&
            socialPlanValid(current, plan)
          ) {
            state.socialPlans.push(plan);
            state.applied[`social-plan-date:${plan.dateKey}`] = true;
          }
          let encounter: SocialEncounter | null = null;
          if (entry.proposal.encounter) {
            try {
              encounter = readEncounter(entry.proposal.encounter, entry, current);
            } catch (error) {
              throw new EncounterInterpretationError(
                error instanceof Error ? error.message : "Invalid encounter interpretation.",
              );
            }
            if (!encounter)
              throw new Error("The saved encounter could not be admitted. Its original source is retained.");
          }
          if (encounter) {
            applyRelationshipReview(
              state,
              encounter.review,
              current,
              encounter.id,
              encounter.at,
              villageNow().getTime(),
            );
            state.socialEncounters = [...state.socialEncounters, encounter].slice(-64);
            const minute =
              new ZonedDate(
                encounter.at,
                entry.admitted?.timeZone || village.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
              ).getHours() *
                60 +
              new ZonedDate(
                encounter.at,
                entry.admitted?.timeZone || village.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
              ).getMinutes();
            for (const plan of state.socialPlans)
              if (
                plan.status === "planned" &&
                plan.kind === "meeting" &&
                plan.venueId === encounter.venueId &&
                plan.zoneId === encounter.zoneId &&
                plan.startMinute <= minute &&
                plan.endMinute > minute &&
                plan.actorIds.every((id) => encounter!.actorIds.includes(id))
              )
                plan.status = "completed";
          }
          state.socialPlans = state.socialPlans.slice(-64);
          state.applied[entry.id] = true;
        });
        const accepted = settled.socialEncounters.find((row) => row.id === entry.id);
        if (accepted?.semanticProvenance?.version === 2) {
          if (!processLiveMemories) throw new Error("Offscreen memory application is unavailable.");
          const lines = accepted.lines.map((line) => ({
            ...line,
            name: line.speakerId,
            at: accepted.at,
            contactHidden: true,
          }));
          const privateScene = coerceSession({
            id: "offscreen:" + entry.id,
            processingVersion: 1,
            villageSeed: entry.seed,
            placeId: accepted.venueId,
            zoneId: accepted.zoneId,
            startedAt: accepted.at,
            status: "closed",
            activeIds: accepted.actorIds,
            participants: accepted.actorIds.map((id) => ({ characterId: id, name: id, doing: "" })),
            lines,
            submissions: [
              {
                id: entry.id,
                mode: "chat",
                message: "",
                targetId: "",
                at: accepted.at,
                semanticProvenance: accepted.semanticProvenance,
                liveProposals: bindLiveProposals(
                  { memoryChanges: accepted.memoryChanges, memoryContexts: accepted.memoryContexts },
                  "",
                  lines.map((line) => line.id),
                  lines,
                ),
              },
            ],
          });
          const memory = await processLiveMemories(privateScene, entry.id);
          if (memory.status === "failed" || memory.status === "pending")
            throw new EncounterInterpretationError(memory.reason || "Offscreen memory application needs recovery.");
        }
        await mutateVillageState((state) => {
          if (state.seed !== entry.seed) return;
          // Only an encounter accepted by the relationship transaction can settle access.
          // Its captured evidence survives retries after the original encounter window ends.
          const encounter = state.relationshipContext?.socialEncounters.find((row) => row.id === entry.id);
          if (encounter) {
            const fresh = parseRelationshipProposals(
              { changes: [], disclosures: [], permissions: encounter.review.permissions },
              encounter.id,
              encounter.lines,
              state,
              undefined,
              encounter.semanticProvenance?.version === 2,
            );
            if (fresh.rejections.length)
              throw new Error("Encounter permission authority changed; source retained for recovery.");
            for (const permission of fresh.review.permissions) {
              const venue = state.venues.find((venue) => venue.id === permission.venueId);
              if (venue?.access) {
                settleStandingAccess(venue, permission, encounter.at, [
                  "player",
                  ...state.villagers.map((resident) => resident.characterId),
                ]);
                if (
                  !venue.access.receipts[permission.id] ||
                  venue.access.receipts[permission.id]?.outcome === "rejected"
                )
                  throw new Error("Encounter standing permission needs recovery.");
              }
            }
          }
          const saved = state.socialOutbox?.find((row) => row.id === entry.id);
          if (saved) {
            saved.processed = true;
          }
          state.socialOutbox = state.socialOutbox?.filter((row) => !row.processed);
        });
      } catch (error) {
        await mutateVillageState((state) => {
          const saved = state.socialOutbox?.find((row) => row.id === entry.id);
          if (saved) {
            saved.error = error instanceof Error ? error.message : "Encounter settlement needs recovery.";
            saved.reinterpretRequired =
              error instanceof SocialRevisionConflict ||
              error instanceof EncounterInterpretationError ||
              (error instanceof WorkFailureError && error.failure.stage === "metadata");
          }
        });
      }
    }
    return true;
  }

  async function recover(id: string, value: unknown) {
    const input = z
      .object({ requestId: z.string().regex(/^[a-zA-Z0-9_-]{1,200}$/), reinterpret: z.boolean() })
      .parse(value);
    if (!ports.readVillageSnapshot) throw new Error("Encounter recovery unavailable.");
    const village = await ports.readVillageSnapshot({ memories: true }),
      entry = village.socialOutbox?.find((row) => row.id === id);
    if (!entry) return;
    if (input.reinterpret) {
      if (!ports.queueBackgroundJob) throw new Error("Encounter interpretation unavailable.");
      await ports.queueBackgroundJob({
        kind: "social-recovery",
        subjectId: id,
        seed: village.seed,
        revision: input.requestId,
        finite: true,
        label: "Encounter meaning",
        input: {
          entry: structuredClone(entry),
          social: socialContextState(village.relationshipContext, entry.opportunity.actorIds, ""),
          seed: village.seed,
          admittedAt: villageNow().toISOString(),
          memory: sceneMemoryContext(village, entry.opportunity.actorIds, (entry.opportunity.facts ?? []).join(" ")),
        },
      });
    } else {
      await mutateVillageState((state) => {
        const saved = state.socialOutbox?.find((row) => row.id === id);
        if (saved) saved.error = undefined;
      });
      await processSocialOutbox(await ports.readVillageSnapshot());
    }
  }
  const handler: Handler = {
    async generate(input: {
      entry: SocialOutboxEntry;
      social: VillageState["relationshipContext"];
      seed: string;
      admittedAt: string;
      memory: ReturnType<typeof sceneMemoryContext>;
    }) {
      if (!ports.interpretSocialSource) throw new Error("Encounter interpretation unavailable.");
      const raw = input.entry.proposal.encounter as Record<string, unknown>;
      return ports.interpretSocialSource(
        raw.lines,
        { state: input.social, candidates: [], relationships: [], at: input.admittedAt, memory: input.memory },
        false,
      );
    },
    valid: (state, input) =>
      state.seed === input.seed &&
      !!state.socialOutbox?.some((row) => row.id === input.entry.id) &&
      input.entry.opportunity.actorIds.every((id: string) =>
        state.villagers.some(
          (person) =>
            person.characterId === id &&
            person.cardSnapshot.capturedAt ===
              input.entry.admitted?.villagers.find((row: { characterId: string }) => row.characterId === id)
                ?.cardSnapshot.capturedAt,
        ),
      ),
    apply: (state, input, result) => {
      const entry = state.socialOutbox!.find((row) => row.id === input.entry.id)!;
      entry.proposal.encounter = { ...(entry.proposal.encounter as object), ...result };
      entry.relationshipSnapshot = input.social;
      entry.reinterpreted = true;
      entry.error = undefined;
      entry.reinterpretRequired = undefined;
    },
    afterApply: async () => {
      if (ports.readVillageSnapshot) await processSocialOutbox(await ports.readVillageSnapshot());
    },
  };
  return { processSocialOutbox, recover, handler };
}
export type RelationshipSocialService = ReturnType<typeof createRelationshipSocial>;
