import { createHash } from "node:crypto";
import { bindActivationService, createActivationBinding } from "../../../adapters/engine/activation-scope.js";
import { villageNow } from "../../../adapters/time/clock-gate.js";
import type { Handler } from "../../../domain/models/background-model.js";
import type { VenueScene } from "../../../domain/models/scene-model.js";
import type { VillageWish } from "../../../domain/models/world.js";
import type { CompactFoundingContext } from "../../../domain/rules/compact-founding-rules.js";
import { notFound } from "../../../domain/rules/errors.js";
import { foundingRequestMessages } from "../../../domain/rules/founding-requests.js";
import {
  completeFoundingTask,
  foundingSlot,
  foundingTaskRevision,
  ownsFoundingTask,
} from "../../../domain/rules/founding-tasks.js";
import { extractModelJsonObject } from "../../../domain/rules/json-reply.js";
import { sceneEvidencePerception } from "../../../domain/rules/scene-evidence-perception.js";
import { semanticContinued } from "../../../domain/rules/semantic-continuity.js";
import { applyWishSource, knownSocialWishes, newSocialWish } from "../../../domain/rules/social-wishes.js";
import { completionFailure, metadataFailure, WorkFailureError } from "../../../domain/rules/work-failure.js";
type Ports = {
  readVillageState: typeof import("../../world/village-store.js").readVillageState;
  mutateVillageState: typeof import("../../world/village-store.js").mutateVillageState;
  queueBackgroundJob: typeof import("../../../jobs/background-work.js").queueBackgroundJob;
  villagesLanguageModels: typeof import("../../../adapters/models/language-models.js").villagesLanguageModels;
  villagesConnectionIdFor: typeof import("../../settings/connections.js").villagesConnectionIdFor;
  completeWithRoom: typeof import("../../generation/model-requests.js").completeWithRoom;
};
export function createWishes(ports: Ports) {
  async function queueFoundingWish(characterId: string, context: CompactFoundingContext) {
    const state = await ports.readVillageState(),
      revision = foundingTaskRevision(state, characterId, "wish");
    const resident = state.villagers.find((r) => r.characterId === characterId);
    if (!resident) throw notFound("Resident unavailable.");
    await ports.mutateVillageState((live) => {
      const marker = live.foundingPreparation;
      if (live.seed !== state.seed || marker?.status !== "pending") throw new Error("Preparation changed.");
      marker.tasks ??= {};
      marker.tasks[characterId] ??= {};
      marker.tasks[characterId].wish ??= {
        contract: 1,
        revision,
        jobId: foundingSlot("wish", characterId),
        status: "pending",
        attempt: 0,
        error: "",
      };
    });
    await ports.queueBackgroundJob({
      kind: "wish",
      subjectId: characterId,
      seed: state.seed,
      revision,
      finite: true,
      label: resident.cardSnapshot.name + "'s social Wish",
      retryActionId: state.foundingPreparation?.retryActions?.at(-1),
      input: {
        characterId,
        context,
        revision,
        capturedAt: resident.cardSnapshot.capturedAt,
        now: villageNow().toISOString(),
      },
    });
  }
  const handler: Handler = {
    async generate(input): Promise<VillageWish | null> {
      const model = await ports
        .villagesLanguageModels()
        .resolveForRequest({ connectionId: await ports.villagesConnectionIdFor("system") });
      const messages = foundingRequestMessages(input.context, "wish");
      const fit = model.fitContext(messages, { maxTokens: Math.min(model.maxOutputTokens ?? 1536, 1536) });
      if (JSON.stringify(fit.messages) !== JSON.stringify(messages))
        throw new Error("Initial Wish context does not fit.");
      const response = await ports.completeWithRoom(model, messages, fit.maxTokens ?? 1536, {
        responseFormat: { type: "json_object" },
        retryEmpty: false,
        temperature: 0.7,
        reasoningEffort: "none",
        usagePurpose: "background",
      });
      const failure = completionFailure(response, "initial-social-wish", fit.maxTokens ?? 1536);
      if (failure) throw new WorkFailureError(failure);
      const raw = extractModelJsonObject(response);
      if (!raw || !("wish" in raw)) throw new WorkFailureError(metadataFailure("Initial Wish result is missing."));
      if (raw.wish === null) return null;
      const id = "wish:" + createHash("sha256").update(input.revision).digest("hex").slice(0, 32);
      return newSocialWish(raw.wish as { wish: string; reason: string }, id, input.now, {
        kind: "preparation",
        sourceId: input.revision,
        lineIds: [],
      });
    },
    valid: (state, input) =>
      ownsFoundingTask(state, input.characterId, "wish", input.revision) &&
      state.villagers.some(
        (r) => r.characterId === input.characterId && r.cardSnapshot.capturedAt === input.capturedAt,
      ),
    apply(state, input, result: VillageWish | null) {
      const resident = state.villagers.find((r) => r.characterId === input.characterId)!;
      if (result && !resident.wishes.some((w) => w.id === result.id)) resident.wishes.push(result);
      completeFoundingTask(state, input.characterId, "wish", input.revision);
    },
  };
  async function processWishExchange(scene: VenueScene, submissionId: string) {
    const turn = scene.submissions.find((r) => r.id === submissionId);
    if (!turn) throw new Error("Wish source unavailable.");
    if (turn.wishProposalError) throw new WorkFailureError(metadataFailure(turn.wishProposalError));
    let result: ReturnType<typeof applyWishSource> | undefined;
    await ports.mutateVillageState(
      (state) => {
        if (state.seed !== scene.villageSeed || semanticContinued(state, scene.id, submissionId, "wishes")) return;
        const proposals = turn.wishProposals ?? [];
        result = applyWishSource(state, {
          id: scene.id + ":turn:" + submissionId,
          kind: scene.id.startsWith("offscreen:") ? "encounter" : "scene",
          at: turn.at!,
          recordedAt: villageNow().toISOString(),
          lines: scene.lines.map((l) => ({
            ...l,
            speakerId: l.role === "user" ? "player" : l.speakerId,
            playerHeard: sceneEvidencePerception(l).playerPerception === "full",
          })),
          currentLineIds: [
            ...new Set(
              [
                ...(turn.replyLineIds ?? []),
                ...(turn.liveProposals?.replyLineIds ?? []),
                turn.liveProposals?.playerLineId ?? "",
              ].filter(Boolean),
            ),
          ],
          changes: proposals.map((p) => p.change),
          residents: proposals[0]?.captured ?? [],
          learn: !scene.id.startsWith("offscreen:"),
        });
      },
      { memories: true },
    );
    return {
      status: "applied" as const,
      reason: "Saved social Wish evidence applied",
      receiptIds: result?.receiptIds ?? [],
    };
  }
  async function setWishFollowing(actorId: string, wishId: string, followed: boolean) {
    await ports.mutateVillageState(
      (state) => {
        if (!knownSocialWishes(state, actorId).some((w) => w.wishId === wishId)) throw notFound("Wish unavailable.");
        (state.wishFollowing ??= {})[actorId + ":" + wishId] = followed;
      },
      { memories: true },
    );
  }
  return { queueFoundingWish, handler, processWishExchange, setWishFollowing };
}
const binding = createActivationBinding<ReturnType<typeof createWishes>>("Wishes are unavailable.");
export const configureWishes = (service: ReturnType<typeof createWishes>) =>
  binding.configure(bindActivationService(service));
export const wishes = () => binding.get();
export const queueFoundingWish = (...args: Parameters<ReturnType<typeof createWishes>["queueFoundingWish"]>) =>
  binding.get().queueFoundingWish(...args);
export const processWishExchange = (...args: Parameters<ReturnType<typeof createWishes>["processWishExchange"]>) =>
  binding.get().processWishExchange(...args);
