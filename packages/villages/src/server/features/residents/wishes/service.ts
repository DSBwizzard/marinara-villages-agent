import { z } from "zod";
import { recordLoreUse } from "../../../adapters/observability/runtime-debug.js";
import { bindActivationService, createActivationBinding } from "../../../adapters/engine/activation-scope.js";
import { villageNow } from "../../../adapters/time/clock-gate.js";
import type { Handler } from "../../../domain/models/background-model.js";
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
import { continuityActor } from "../../../domain/rules/continuity-actors.js";
import { continuityWishes, continuityContextRevision } from "../../../domain/rules/continuity-library.js";
import { retainNativeFact } from "../../../domain/rules/native-continuity.js";
import { memoryHash, memoryRequire, memoryTimestamp } from "../../../domain/rules/memory-integrity.js";
import { continuityConstraints, continuityProtectionFingerprint } from "../../../domain/rules/continuity.js";
import { completionFailure, WorkFailureError } from "../../../domain/rules/work-failure.js";
type Ports = {
  readVillageState: typeof import("../../world/village-store.js").readVillageState;
  mutateVillageState: typeof import("../../world/village-store.js").mutateVillageState;
  queueBackgroundJob: typeof import("../../../jobs/background-work.js").queueBackgroundJob;
  villagesLanguageModels: typeof import("../../../adapters/models/language-models.js").villagesLanguageModels;
  villagesConnectionIdFor: typeof import("../../settings/connections.js").villagesConnectionIdFor;
  completeWithRoom: typeof import("../../generation/model-requests.js").completeWithRoom;
};
const result = z
  .object({
    wish: z
      .string()
      .min(1)
      .refine((value) => !!value.trim() && Buffer.byteLength(value) <= 2400)
      .nullable(),
    protection: z
      .object({
        roots: z.array(z.string().min(1).max(160)).max(32),
        disposition: z.enum(["clear", "conflict", "uncertain"]),
      })
      .strict()
      .optional(),
  })
  .strict();
export function createWishes(ports: Ports) {
  async function queueFoundingWish(characterId: string, context: CompactFoundingContext) {
    const state = await ports.readVillageState({ memories: true }),
      revision = foundingTaskRevision(state, characterId, "wish");
    const resident = state.villagers.find((person) => person.characterId === characterId);
    if (!resident) throw notFound("Resident unavailable.");
    if (state.foundingPreparation?.tasks?.[characterId]?.wish?.status === "completed") return;
    memoryRequire(
      context.continuity?.fingerprint === continuityContextRevision(state, characterId),
      "initial Wish context changed",
    );
    const owner = continuityActor(state, characterId)!;
    memoryRequire(
      context.continuity.protectionFingerprint === continuityProtectionFingerprint(state.continuity, [owner]) &&
        memoryHash(context.continuity.protections) === memoryHash(continuityConstraints(state.continuity, [owner])),
      "initial Wish constraints changed",
    );
    await ports.mutateVillageState((live) => {
      const marker = live.foundingPreparation;
      memoryRequire(live.seed === state.seed && marker?.status === "pending", "preparation changed");
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
      label: resident.cardSnapshot.name + "'s initial Wish",
      retryActionId: state.foundingPreparation?.retryActions?.at(-1),
      input: {
        characterId,
        incarnation: resident.incarnation,
        context: {
          ...context,
          loreUse: context.loreUse?.map((entry) => ({
            ...entry,
            targets: ["Initial Wish"],
            inspections: entry.inspections?.map((ref) => ({ ...ref, target: "Initial Wish" })),
          })),
        },
        revision,
        capturedAt: resident.cardSnapshot.capturedAt,
        now: villageNow().toISOString(),
      },
    });
  }
  function parsed(response: Awaited<ReturnType<Ports["completeWithRoom"]>>, maxTokens?: number) {
    const failure = completionFailure(response, "initial-wish", maxTokens);
    if (failure) throw new WorkFailureError(failure);
    const parsed = result.safeParse(extractModelJsonObject(response));
    if (!parsed.success)
      throw new WorkFailureError({
        cause: "missing_result",
        stage: "initial-wish",
        message: "The initial Wish response is missing or invalid.",
      });
    return parsed.data;
  }
  const handler: Handler = {
    recoverSavedResult: (input, steps) => {
      const saved = steps.find((step) => step.key === "founding-wish:" + input.revision && step.status === "completed");
      return saved?.response ? parsed(saved.response, saved.timing?.requestedOutputTokens) : undefined;
    },
    async generate(input) {
      const model = await ports
        .villagesLanguageModels()
        .resolveForRequest({ connectionId: await ports.villagesConnectionIdFor("system") });
      const messages = foundingRequestMessages(input.context, "wish"),
        maxTokens = Math.min(model.maxOutputTokens ?? 1536, 1536),
        fit = model.fitContext(messages, { maxTokens });
      memoryRequire(
        !fit.trimmed && JSON.stringify(fit.messages) === JSON.stringify(messages) && (fit.maxTokens ?? maxTokens) > 0,
        "initial Wish context does not fit before generation",
      );
      await recordLoreUse(input.context.loreUse, `Initial Wish · ${input.context.card.name}`);
      return parsed(
        await ports.completeWithRoom(model, messages, Math.min(maxTokens, fit.maxTokens ?? maxTokens), {
          responseFormat: { type: "json_object" },
          temperature: 0.7,
          reasoningEffort: "none",
          usagePurpose: "background",
          checkpointId: "founding-wish:" + input.revision,
        }),
        Math.min(maxTokens, fit.maxTokens ?? maxTokens),
      );
    },
    valid: (state, input) => {
      memoryTimestamp(input.now);
      return (
        input.context.continuity?.fingerprint === continuityContextRevision(state, input.characterId) &&
        ownsFoundingTask(state, input.characterId, "wish", input.revision) &&
        state.villagers.some(
          (person) =>
            person.characterId === input.characterId &&
            person.incarnation === input.incarnation &&
            person.cardSnapshot.capturedAt === input.capturedAt,
        )
      );
    },
    apply(state, input, raw) {
      const prepared = result.parse(raw),
        text = prepared.wish,
        owner = continuityActor(state, input.characterId);
      memoryRequire(owner && owner.incarnation === input.incarnation, "initial Wish owner changed");
      const constraints = input.context.continuity.protections as ReturnType<typeof continuityConstraints>;
      memoryRequire(
        !text || !constraints.length || prepared.protection?.disposition === "clear",
        "initial Wish needs clear protection screening",
      );
      memoryRequire(
        !prepared.protection || prepared.protection.roots.every((id) => constraints.some((row) => row.id === id)),
        "initial Wish cited an unknown protection",
      );
      if (text)
        retainNativeFact(
          state,
          {
            id: "founding-wish:" + memoryHash([input.revision, input.incarnation]).slice(0, 32),
            kind: "initialization",
            targetId: owner.id,
            revision: 1,
            text,
            witnesses: [owner.id],
          },
          input.now,
          {
            class: "desire",
            owner,
            current: true,
            about: [],
            provenance: input.context.continuity.sources,
            ...(prepared.protection
              ? { screening: { ...prepared.protection, fingerprint: input.context.continuity.protectionFingerprint } }
              : {}),
          },
        );
      const task = state.foundingPreparation?.tasks?.[input.characterId]?.wish;
      if (task?.revision === input.revision) task.lore = input.context.loreUse;
      completeFoundingTask(state, input.characterId, "wish", input.revision);
    },
  };
  async function setWishFollowing(actorId: string, wishId: string, followed: boolean) {
    await ports.mutateVillageState(
      (state) => {
        if (!continuityWishes(state, actorId, false, villageNow().toISOString()).some((wish) => wish.wishId === wishId))
          throw notFound("Wish unavailable.");
        (state.wishFollowing ??= {})[actorId + ":" + wishId] = followed;
      },
      { memories: true },
    );
  }
  return { queueFoundingWish, handler, setWishFollowing };
}
const binding = createActivationBinding<ReturnType<typeof createWishes>>("Wishes are unavailable.");
export const configureWishes = (service: ReturnType<typeof createWishes>) =>
  binding.configure(bindActivationService(service));
export const wishes = () => binding.get();
export const queueFoundingWish = (...args: Parameters<ReturnType<typeof createWishes>["queueFoundingWish"]>) =>
  binding.get().queueFoundingWish(...args);
