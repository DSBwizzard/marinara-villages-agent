import { z } from "zod";
import type { MailboxView } from "../../../shared/contracts/mailbox.js";
import { coerceSession } from "../../domain/decoding/scene-codec.js";
import { defaultVillageState } from "../../domain/decoding/village-codec.js";
import type { Handler } from "../../domain/models/background-model.js";
import type { RelationshipEvidenceLine, RelationshipReview } from "../../domain/models/relationship-types.js";
import type { SocialMailInput, SocialMailInterpretation, SocialMailOutbox } from "../../domain/models/social-mail.js";
import type { VillageState } from "../../domain/models/world.js";
import { asRecord } from "../../domain/rules/coerce.js";
import { badRequest, conflict } from "../../domain/rules/errors.js";
import { extractModelJsonObject } from "../../domain/rules/json-reply.js";
import { bindLiveProposals } from "../../domain/rules/live-exchange.js";
import { recallMemories } from "../../domain/rules/memory-recall.js";
import {
  assertPersonalLetter,
  hasPersonalLetterAction,
  PERSONAL_LETTER_INSTRUCTION,
  PersonalLetterActionError,
} from "../../domain/rules/personal-letter.js";
import { publishRelationshipDisclosures } from "../../domain/rules/relationship-memories.js";
import { relationshipWritingPrompt } from "../../domain/rules/relationship-presentation.js";
import {
  emptyRelationshipReview,
  parseRelationshipReview,
  RELATIONSHIP_REVIEW_INSTRUCTION,
} from "../../domain/rules/relationship-review.js";
import {
  applyRelationshipReview,
  defaultRelationshipState,
  SocialRevisionConflict,
} from "../../domain/rules/relationship-rules.js";
import { SCENE_MEMORY_INSTRUCTION, sceneMemoryContext } from "../../domain/rules/scene-memories.js";
import { semanticHash } from "../../domain/rules/semantic-contract.js";
import { socialContextState } from "../../domain/rules/social-context.js";
import {
  beginMailDelivery,
  completeMailDelivery,
  personalThreadId,
  queuePersonalMessage,
  readPersonalThread,
  requireMailSource,
  withoutMailDisclosures,
} from "../../domain/rules/social-mail.js";
import {
  applyWishSource,
  publishWishDisclosure,
  SOCIAL_WISH_INSTRUCTION,
  wishWritingContext,
} from "../../domain/rules/social-wishes.js";

export interface SocialMailPorts {
  processLiveMemories?: typeof import("./live-memory.js").processLiveMemories;
  readVillageSnapshot: typeof import("../world/village-store.js").readVillageSnapshot;
  withVillageSceneAcceptance: typeof import("../world/village-store.js").withVillageSceneAcceptance;
  mutateVillageState: typeof import("../world/village-store.js").mutateVillageState;
  mutateRelationships: typeof import("./relationship-store.js").mutateRelationships;
  readRelationshipState: typeof import("./relationship-store.js").readRelationshipState;
  queueBackgroundJob: typeof import("../../jobs/background-work.js").queueBackgroundJob;
  retryBackgroundJob: typeof import("../../jobs/background-work.js").retryBackgroundJob;
  backgroundWorkSummaries: typeof import("../../jobs/background-work.js").backgroundWorkSummaries;
  villagesLanguageModels: typeof import("../../adapters/models/language-models.js").villagesLanguageModels;
  villagesConnectionIdFor: typeof import("../settings/connections.js").villagesConnectionIdFor;
  completeWithRoom: typeof import("../generation/model-requests.js").completeWithRoom;
}
/** Letters can change perspectives, but cannot grant access or register actionable terms. */
function mailReviewInput(value: unknown): Record<string, unknown> {
  const raw = asRecord(value);
  const projection = (value: unknown) => {
    const row = asRecord(value);
    return {
      ...row,
      records: Array.isArray(row.records)
        ? row.records.filter((record) => !["agreement", "commitment"].includes(String(asRecord(record).kind)))
        : row.records,
    };
  };
  return {
    ...raw,
    permissions: [],
    changes: Array.isArray(raw.changes)
      ? raw.changes.map((value) => {
          const change = asRecord(value);
          return { ...change, sceneAfter: projection(change.sceneAfter), liveAfter: projection(change.liveAfter) };
        })
      : raw.changes,
  };
}
function mailReview(review: RelationshipReview): RelationshipReview {
  return {
    ...review,
    permissions: [],
    changes: review.changes.map((change) => ({
      ...change,
      sceneAfter: {
        ...change.sceneAfter,
        records: change.sceneAfter.records.filter((row) => row.kind !== "agreement" && row.kind !== "commitment"),
      },
      liveAfter: {
        ...change.liveAfter,
        records: change.liveAfter.records.filter((row) => row.kind !== "agreement" && row.kind !== "commitment"),
      },
    })),
  };
}
/** Retain only the authority needed to interpret this correspondence. Never a second transcript database. */
function admission(village: VillageState, residentId: string): VillageState {
  const state = defaultVillageState(),
    social =
      socialContextState(village.relationshipContext, [residentId], "") ?? defaultRelationshipState(village.seed);
  Object.assign(state, {
    seed: village.seed,
    foundedAt: village.foundedAt,
    timeZone: village.timeZone,
    setting: village.setting,
    worldName: village.worldName,
    worldFacts: village.worldFacts,
    playerName: village.playerName,
    playerPersonaName: village.playerPersonaName,
    playerBackground: village.playerBackground,
  });
  state.villagers = village.villagers.map((row) => ({ ...row, agenda: undefined }));
  state.venues = structuredClone(village.venues);
  state.relationshipContext = structuredClone(social);
  return state;
}
export function createSocialMail(ports: SocialMailPorts) {
  const running = new Map<string, Promise<void>>();
  async function modelRequest(
    role: "narration" | "system",
    messages: { role: "system" | "user"; content: string }[],
    key: string,
    maxTokens: number,
  ) {
    const model = await ports
      .villagesLanguageModels()
      .resolveForRequest({ connectionId: await ports.villagesConnectionIdFor(role) });
    const output = Math.min(maxTokens, model.maxOutputTokens ?? maxTokens),
      fit = model.fitContext(messages, { maxTokens: output });
    if (fit.trimmed || JSON.stringify(fit.messages) !== JSON.stringify(messages))
      throw new Error("Personal mail context does not fit the configured " + role + " connection.");
    const requestTokens = Math.min(output, fit.maxTokens ?? output);
    const result = await ports.completeWithRoom(model, messages, requestTokens, {
      responseFormat: { type: "json_object" },
      retryEmpty: false,
      debugMode: false,
      checkpointId: key,
      temperature: role === "narration" ? 0.7 : 0.1,
      ...(role === "system" ? { reasoningEffort: "low" as const } : {}),
      usagePurpose: role === "system" ? "checks" : "background",
    });
    if (result.finishReason === "length")
      throw new Error(
        `${role === "system" ? "System mail" : "Personal reply"} reached its ${requestTokens.toLocaleString("en-US")} output-token limit${typeof result.usage?.completionReasoningTokens === "number" ? ` (${result.usage.completionReasoningTokens.toLocaleString("en-US")} reasoning tokens)` : ""}. Explicitly retry.`,
      );
    const parsed = extractModelJsonObject(result);
    if (!parsed) throw new Error("Personal mail returned invalid JSON.");
    return parsed;
  }
  async function generate(input: SocialMailInput): Promise<SocialMailInterpretation> {
    const state = structuredClone(input.admitted),
      resident = state.villagers.find((row) => row.characterId === input.residentId);
    if (!resident) throw new Error("The recipient is unavailable.");
    const ownContext = relationshipWritingPrompt(state, input.residentId);
    const text =
      input.mode === "resident"
        ? ""
        : (input.retainedReply ??
          String(
            (
              await modelRequest(
                "narration",
                [
                  {
                    role: "system",
                    content:
                      "Write one setting-appropriate personal reply as this resident. " +
                      PERSONAL_LETTER_INSTRUCTION +
                      " Treat the pending player's exact message as the proposed incoming source. System will independently settle its meaning before either message is delivered. Keep the resident's voice, initiative and boundaries; they may refuse or end a bond. Never invent player words, feelings, consent, travel or physical deeds. Communication alone does not perform physical tasks or grant access. Return JSON {text:string}, at most 2000 characters. Empty text is a valid choice not to reply. Retained Wishes are available context, not a required topic or gesture.",
                  },
                  {
                    role: "user",
                    content: JSON.stringify({
                      setting: state.setting,
                      worldFacts: state.worldFacts,
                      playerName: state.playerPersonaName || state.playerName,
                      character: resident.cardSnapshot,
                      admission: resident.admission,
                      ownContext,
                      wishes: wishWritingContext(resident.wishes, input.sourceText),
                      memories: JSON.parse(input.narrationMemories ?? '{"memories":[]}'),
                      incoming: { text: input.sourceText, at: input.sourceAt },
                      now: input.admittedAt ?? input.sourceAt,
                    }),
                  },
                ],
                "personal-mail:writing:" + input.sourceHash,
                2048,
              )
            ).text ?? "",
          ));
    if (text.length > 2000) throw new Error("The personal reply exceeded its size limit.");
    if (input.mode !== "resident") assertPersonalLetter(text, resident.cardSnapshot.name);
    const sourceLine: RelationshipEvidenceLine = {
      id: input.messageId,
      speakerId: input.mode === "resident" ? input.residentId : "player",
      role: input.mode === "resident" ? "assistant" : "user",
      content: input.sourceText,
      heardBy: ["player", input.residentId],
      kind: "mail",
      playerHeard: true,
    };
    const replyId = input.messageId + ":reply";
    const replyLine: RelationshipEvidenceLine = {
      id: replyId,
      speakerId: input.residentId,
      role: "assistant",
      content: text,
      heardBy: ["player", input.residentId],
      kind: "mail",
      playerHeard: true,
    };
    const raw = await modelRequest(
      "system",
      [
        {
          role: "system",
          content:
            RELATIONSHIP_REVIEW_INSTRUCTION +
            " " +
            SOCIAL_WISH_INSTRUCTION +
            " Return sourceWishChanges:[] and replyWishChanges:[] for incoming and reply respectively, using supplied exact message IDs as evidence. Source effects cite only incoming.id; reply effects require reply.id as new evidence. Source effects are empty when sourceDelivered is true. Letters prove written interactions, never actual meetings or physical deeds. " +
            SCENE_MEMORY_INSTRUCTION +
            " Additionally return sourceMemoryChanges:[] and replyMemoryChanges:[] under that native Memory schema, grounded in incoming and reply respectively. These arrays teach ONLY the corresponding resident, never player or another resident. All player learning uses disclosures when read. sourceMemoryChanges cites incoming.id only; replyMemoryChanges must include reply.id as new evidence. Reports name the actual speaker; claims establish no physical outcome. Use the supplied memory.administrative screening fingerprint. Empty arrays are valid for filler, repeated or unimportant correspondence. When sourceDelivered is true, sourceMemoryChanges must be empty. " +
            " Interpret this correspondence as separate source and reply reviews. Return JSON {sourceReview:relationshipReview,replyReview:relationshipReview}. sourceReview cites only incoming.id; replyReview cites the resident reply as new evidence. In resident mode interpret only sourceReview. When sourceDelivered is true, sourceReview must be empty. Set permissions to an empty array and omit agreement and commitment records: letters never grant access, create obligations, or perform actions. Private stances remain private. Disclosures are saved for the player only when the delivered letter is read. Written claims are not verified physical deeds. Only supplied source IDs are evidence.",
        },
        {
          role: "user",
          content: JSON.stringify({
            memory: input.systemMemory?.envelope,
            sourceDelivered: input.sourceDelivered,
            mode: input.mode ?? "player",
            incoming: sourceLine,
            reply: replyLine,
            social: state.relationshipContext,
            actors: state.villagers.map((row) => ({
              id: row.characterId,
              name: row.cardSnapshot.name,
              wishes: row.wishes,
            })),
            now: input.admittedAt ?? input.sourceAt,
          }),
        },
      ],
      "personal-mail:meaning:" + input.sourceHash + ":" + semanticHash(state.relationshipContext),
      16384,
    );
    const source = input.sourceDelivered
      ? emptyRelationshipReview()
      : parseRelationshipReview(mailReviewInput(raw.sourceReview), input.messageId, [sourceLine], state, true);
    if (
      input.sourceDelivered &&
      JSON.stringify(raw.sourceReview) !== JSON.stringify(emptyRelationshipReview()) &&
      ["changes", "permissions", "disclosures", "intentions"].some(
        (key) =>
          Array.isArray(asRecord(raw.sourceReview)[key]) && (asRecord(raw.sourceReview)[key] as unknown[]).length,
      )
    )
      throw new Error("Delivered mail cannot be reinterpreted as a new source.");
    applyRelationshipReview(state.relationshipContext!, source, state, input.messageId, input.sourceAt);
    if (text)
      for (const key of ["changes", "disclosures", "intentions"]) {
        for (const effect of (Array.isArray(asRecord(raw.replyReview)[key])
          ? asRecord(raw.replyReview)[key]
          : []) as unknown[])
          if (!Array.isArray(asRecord(effect).lineIds) || !(asRecord(effect).lineIds as unknown[]).includes(replyId))
            throw new Error("Every reply effect must cite the resident reply as new evidence.");
      }
    const reply = text
      ? parseRelationshipReview(mailReviewInput(raw.replyReview), replyId, [sourceLine, replyLine], state, true)
      : emptyRelationshipReview();
    const memories = (value: unknown): unknown[] => {
      if (value === undefined) return [];
      if (!Array.isArray(value) || value.length > 16) throw new Error("Invalid correspondence Memory proposals.");
      return value;
    };
    return {
      source,
      reply,
      replyText: text,
      sourceMemoryChanges: input.sourceDelivered ? [] : memories(raw.sourceMemoryChanges),
      sourceWishChanges: input.sourceDelivered ? [] : memories(raw.sourceWishChanges),
      replyWishChanges: text ? memories(raw.replyWishChanges) : [],
      replyMemoryChanges: text ? memories(raw.replyMemoryChanges) : [],
    };
  }
  /** Reuse the native witnessed-memory adapter locally; this never dispatches a model. */
  async function rememberResidentMail(
    input: SocialMailInput,
    result: SocialMailInterpretation,
    bundle: "source" | "reply",
  ) {
    const changes = bundle === "source" ? result.sourceMemoryChanges : result.replyMemoryChanges;
    if (!changes?.length) return;
    if (!ports.processLiveMemories || !input.systemMemory)
      throw new Error("Correspondence Memory settlement is unavailable.");
    const originalIds = [input.messageId, input.messageId + ":reply"];
    const ids = originalIds.map((id) => "mail-line:" + semanticHash(id));
    const lines: (RelationshipEvidenceLine & { name: string; at: string; contactHidden: boolean })[] = [
      {
        id: ids[0]!,
        speakerId: input.mode === "resident" ? input.residentId : "player",
        role: input.mode === "resident" ? "assistant" : "user",
        name: input.residentId,
        at: input.sourceAt,
        contactHidden: true,
        content: input.sourceText,
        kind: "dialogue",
        heardBy: [input.residentId],
        playerHeard: false,
      },
      ...(bundle === "reply"
        ? [
            {
              id: ids[1]!,
              speakerId: input.residentId,
              role: "assistant" as const,
              name: input.residentId,
              at: input.sourceAt,
              contactHidden: true,
              content: result.replyText,
              kind: "dialogue",
              heardBy: [input.residentId],
              playerHeard: false,
            },
          ]
        : []),
    ];
    const scoped = changes.map((raw) => {
      const row = asRecord(raw),
        learners = asRecord(row.learners),
        own = asRecord(learners[input.residentId]);
      return {
        ...row,
        learners: learners[input.residentId]
          ? {
              [input.residentId]: {
                ...own,
                support: Array.isArray(own.support)
                  ? own.support.map((raw) => {
                      const ref = asRecord(raw),
                        index = originalIds.indexOf(String(ref.lineId));
                      return {
                        ...ref,
                        lineId:
                          index >= 0
                            ? ids[index]
                            : typeof ref.lineId === "number"
                              ? ids[ref.lineId]
                              : ref.lineId === "player"
                                ? ids[0]
                                : ref.lineId,
                      };
                    })
                  : own.support,
              },
            }
          : {},
      };
    });
    const at = input.sourceAt,
      submissionId = semanticHash([input.messageId, bundle]).slice(0, 24);
    const scene = coerceSession({
      id: "offscreen:mail:" + input.sourceHash.slice(0, 24),
      villageSeed: input.seed,
      status: "closed",
      startedAt: at,
      activeIds: [input.residentId],
      participants: [{ characterId: input.residentId, name: input.residentId, doing: "correspondence" }],
      lines,
      submissions: [
        {
          id: submissionId,
          at,
          mode: "chat",
          message: "",
          targetId: "",
          liveProposals: bindLiveProposals(
            {
              memoryChanges: scoped,
              earlierLineIds: bundle === "reply" ? [ids[0]!] : [],
              memoryContexts: { [input.systemMemory.saved.protection.fingerprint]: input.systemMemory.saved },
            },
            "",
            [bundle === "reply" ? ids[1]! : ids[0]!],
            lines,
          ),
        },
      ],
    });
    const outcome = await ports.processLiveMemories(scene, submissionId, undefined, {
      [input.residentId]: input.incarnation,
    });
    if (outcome.status === "failed" || outcome.status === "pending")
      throw new Error(outcome.reason || "Correspondence Memory settlement needs recovery.");
  }
  async function publishReadWishMail(seed: string, threadId: string) {
    const social = await ports.readRelationshipState(seed);
    const messages =
      social.mailThreads[threadId]?.messages.filter(
        (m) => m.toId === "player" && m.readAt && social.mailDeliveries[m.id] && m.wishDisclosures?.length,
      ) ?? [];
    if (!messages.length) return;
    await ports.mutateVillageState(
      (state) => {
        if (state.seed !== seed) throw conflict("Village identity changed.");
        for (const message of messages)
          for (const fact of message.wishDisclosures ?? []) publishWishDisclosure(state, fact, message.readAt!);
      },
      { memories: true },
    );
  }
  async function settleWishMail(input: SocialMailInput, result: SocialMailInterpretation, bundle: "source" | "reply") {
    const sourceId = input.messageId,
      replyId = input.messageId + ":reply";
    const rows = (bundle === "source" ? result.sourceWishChanges : result.replyWishChanges) ?? [];
    let facts: import("../../../shared/contracts/wishes.js").WishDisclosure[] = [];
    await ports.mutateVillageState((state) => {
      if (state.seed !== input.seed) throw conflict("Village identity changed.");
      const captured = structuredClone(input.admitted.villagers);
      if (bundle === "reply")
        for (const original of captured) {
          for (const receipt of Object.values(state.exchangeReceipts)) {
            if (
              receipt.sceneId !== "mail:" + sourceId + ":source" ||
              receipt.actorId !== original.characterId ||
              !receipt.sceneFacts?.wish?.value
            )
              continue;
            const value = receipt.sceneFacts.wish.value;
            original.wishes = [...original.wishes.filter((w) => w.id !== value.id), structuredClone(value)];
          }
        }
      const lines = [
        {
          id: sourceId,
          speakerId: input.mode === "resident" ? input.residentId : "player",
          content: input.sourceText,
          heardBy: [input.residentId, "player"],
          playerHeard: true,
          kind: "mail",
        },
        ...(bundle === "reply"
          ? [
              {
                id: replyId,
                speakerId: input.residentId,
                content: result.replyText,
                heardBy: [input.residentId, "player"],
                playerHeard: true,
                kind: "mail",
              },
            ]
          : []),
      ];
      facts = applyWishSource(state, {
        id: "mail:" + sourceId + ":" + bundle,
        kind: "mail",
        at: input.sourceAt,
        recordedAt: new Date().toISOString(),
        lines,
        currentLineIds: bundle === "reply" ? [replyId] : [sourceId],
        changes: rows,
        residents: captured,
        learn: false,
      }).disclosures;
    });
    await ports.mutateRelationships(input.seed, (state) => {
      const message = state.mailThreads[input.threadId]?.messages.find(
        (m) => m.id === (bundle === "reply" ? replyId : sourceId),
      );
      if (message && message.toId === "player") message.wishDisclosures = facts;
    });
    await publishReadWishMail(input.seed, input.threadId);
  }
  async function applyEntry(entry: SocialMailOutbox) {
    const { input, result } = entry;
    const village = await ports.readVillageSnapshot();
    if (village.seed !== input.seed) throw conflict("Village identity changed.");
    let current = await ports.readRelationshipState(input.seed);
    if (input.mode !== "resident" && result.replyText && !current.mailDeliveries[input.messageId + ":reply"])
      assertPersonalLetter(
        result.replyText,
        input.admitted.villagers.find((row) => row.characterId === input.residentId)?.cardSnapshot.name,
      );
    if (
      input.mode === "resident" &&
      !current.mailThreads[input.threadId]?.messages.some((row) => row.id === input.messageId)
    ) {
      current = await ports.mutateRelationships(input.seed, (state) => {
        const thread = (state.mailThreads[input.threadId] ??= {
          id: input.threadId,
          participantIds: ["player", input.residentId],
          revision: 0,
          messages: [],
        });
        if (!thread.messages.some((row) => row.id === input.messageId))
          thread.messages.push({
            id: input.messageId,
            requestId: input.messageId,
            fromId: input.residentId,
            toId: "player",
            text: input.sourceText,
            at: input.sourceAt,
            status: "pending",
            sourceHash: input.sourceHash,
            incarnation: input.incarnation,
          });
      });
    }
    const original = requireMailSource(current, input.threadId, input.messageId).message;
    if (
      (["cancelled", "undeliverable"].includes(original.status) && !current.mailDeliveries[input.messageId]) ||
      (original.replyUnavailable && !current.mailDeliveries[input.messageId + ":reply"])
    ) {
      await ports.mutateVillageState((state) => {
        if (state.seed === input.seed)
          state.socialMailOutbox = state.socialMailOutbox?.filter((row) => row.id !== entry.id);
      });
      return;
    }
    if (
      original.text !== input.sourceText ||
      original.sourceHash !== input.sourceHash ||
      original.incarnation !== input.incarnation ||
      ["cancelled", "undeliverable"].includes(original.status)
    )
      throw conflict("This mail source changed or was cancelled.");
    const complete =
      !!current.mailDeliveries[input.messageId] &&
      (!result.replyText || !!current.mailDeliveries[input.messageId + ":reply"]);
    if (
      !complete &&
      !village.villagers.some(
        (row) => row.characterId === input.residentId && row.cardSnapshot.capturedAt === input.incarnation,
      )
    )
      throw conflict("The correspondent changed. This retained message cannot settle under a different resident card.");
    if (!current.mailDeliveries[input.messageId]) {
      await ports.mutateRelationships(input.seed, (state) => beginMailDelivery(state, input.threadId, input.messageId));
      // Validate current revisions before any world effect; retries remain entirely local.
      applyRelationshipReview(
        structuredClone(current),
        withoutMailDisclosures(mailReview(result.source)),
        village,
        input.messageId,
        input.sourceAt,
      );
      await ports.withVillageSceneAcceptance(async (authority) => {
        if (
          authority.seed !== input.seed ||
          !authority.villagers.some(
            (row) => row.characterId === input.residentId && row.cardSnapshot.capturedAt === input.incarnation,
          )
        )
          throw conflict("The correspondent changed before the letter was delivered.");
        await ports.mutateRelationships(input.seed, (state) => {
          applyRelationshipReview(
            state,
            withoutMailDisclosures(mailReview(result.source)),
            authority,
            input.messageId,
            input.sourceAt,
          );
          completeMailDelivery(state, input.threadId, input.messageId, input.sourceHash, new Date().toISOString());
          if (input.mode === "resident") {
            const message = requireMailSource(state, input.threadId, input.messageId).message;
            message.replyStatus = "complete";
            message.disclosures = result.source.disclosures;
          }
        });
      });
    }
    await settleWishMail(input, result, "source");
    await rememberResidentMail(input, result, "source");
    current = await ports.readRelationshipState(input.seed);
    const replyId = input.messageId + ":reply";
    if (!current.mailDeliveries[replyId] && result.replyText) {
      applyRelationshipReview(
        structuredClone(current),
        withoutMailDisclosures(mailReview(result.reply)),
        village,
        replyId,
        input.sourceAt,
      );
      await ports.withVillageSceneAcceptance(async (authority) => {
        if (
          authority.seed !== input.seed ||
          !authority.villagers.some(
            (row) => row.characterId === input.residentId && row.cardSnapshot.capturedAt === input.incarnation,
          )
        )
          throw conflict("The correspondent changed before the reply was delivered.");
        await ports.mutateRelationships(input.seed, (state) => {
          const { thread, message } = requireMailSource(state, input.threadId, input.messageId);
          if (state.mailDeliveries[replyId]) return;
          if (message.replyUnavailable) throw conflict("The correspondent changed before the reply was delivered.");
          applyRelationshipReview(
            state,
            withoutMailDisclosures(mailReview(result.reply)),
            authority,
            replyId,
            input.sourceAt,
          );
          thread.messages.push({
            id: replyId,
            requestId: replyId,
            fromId: input.residentId,
            toId: "player",
            text: result.replyText,
            at: new Date().toISOString(),
            status: "delivered",
            replyTo: input.messageId,
            disclosures: result.reply.disclosures,
          });
          state.mailDeliveries[replyId] = {
            messageId: replyId,
            sourceHash: semanticHash([input.sourceHash, result.replyText]),
            at: new Date().toISOString(),
          };
          message.replyStatus = "complete";
          message.error = undefined;
          thread.revision++;
        });
      });
    } else
      await ports.mutateRelationships(input.seed, (state) => {
        const { message } = requireMailSource(state, input.threadId, input.messageId);
        message.replyStatus = "complete";
        message.error = undefined;
      });
    await settleWishMail(input, result, "reply");
    await rememberResidentMail(input, result, "reply");
    await ports.mutateVillageState((state) => {
      if (state.seed === input.seed) {
        state.socialMailOutbox = state.socialMailOutbox?.filter((row) => row.id !== entry.id);
      }
    });
  }
  async function processOutbox(village: VillageState): Promise<boolean> {
    let retired = false;
    for (const entry of village.socialMailOutbox ?? []) {
      const sender = entry.input.admitted.villagers.find((row) => row.characterId === entry.input.residentId)
        ?.cardSnapshot.name;
      if (entry.input.mode === "resident" && hasPersonalLetterAction(entry.input.sourceText, sender)) {
        const discarded = await retireChangedCorrespondent(entry, true);
        if (discarded) {
          retired = true;
          continue;
        }
      }
      if (
        entry.error &&
        village.seed === entry.input.seed &&
        !village.villagers.some(
          (row) =>
            row.characterId === entry.input.residentId && row.cardSnapshot.capturedAt === entry.input.incarnation,
        )
      )
        retired = (await retireChangedCorrespondent(entry)) || retired;
    }
    if (retired) village = await ports.readVillageSnapshot();
    const current = await ports.readRelationshipState(village.seed);
    const entries = (village.socialMailOutbox ?? []).filter((row) => {
      if (!row.error) return true;
      const source = current.mailThreads[row.input.threadId]?.messages.find((message) => message.id === row.id);
      const completedDelivery =
        !!current.mailDeliveries[row.id] && (!row.result.replyText || !!current.mailDeliveries[row.id + ":reply"]);
      const changed = !village.villagers.some(
        (resident) =>
          resident.characterId === row.input.residentId && resident.cardSnapshot.capturedAt === row.input.incarnation,
      );
      if (completedDelivery && changed) return true;
      return (
        !!source &&
        source.sourceHash === row.input.sourceHash &&
        source.incarnation === row.input.incarnation &&
        ((["cancelled", "undeliverable"].includes(source.status) && !current.mailDeliveries[row.id]) ||
          (source.replyUnavailable && !current.mailDeliveries[row.id + ":reply"]))
      );
    });
    if (!entries.length) return retired;
    for (const entry of entries) {
      const existing = running.get(entry.id);
      if (existing) {
        await existing;
        continue;
      }
      const task = applyEntry(entry)
        .catch(async (error) => {
          const latest = await ports.readVillageSnapshot();
          if (
            latest.seed === entry.input.seed &&
            !latest.villagers.some(
              (row) =>
                row.characterId === entry.input.residentId && row.cardSnapshot.capturedAt === entry.input.incarnation,
            ) &&
            (await retireChangedCorrespondent(entry))
          )
            return;
          const message = error instanceof Error ? error.message : "Mail delivery needs recovery.";
          await ports.mutateRelationships(entry.input.seed, (state) => {
            const source = state.mailThreads[entry.input.threadId]?.messages.find(
              (row) => row.id === entry.input.messageId,
            );
            if (source) source.error = message;
          });
          await ports.mutateVillageState((state) => {
            const saved = state.socialMailOutbox?.find((row) => row.id === entry.id);
            if (saved) {
              saved.error = message;
              saved.reinterpretRequired =
                error instanceof SocialRevisionConflict || error instanceof PersonalLetterActionError;
            }
          });
        })
        .finally(() => running.delete(entry.id));
      running.set(entry.id, task);
      await task;
    }
    return true;
  }
  async function retireChangedCorrespondent(entry: SocialMailOutbox, invalidLetter = false): Promise<boolean> {
    const input = entry.input;
    let retired = false;
    await ports.withVillageSceneAcceptance(async (current) => {
      if (
        current.seed !== input.seed ||
        (!invalidLetter &&
          current.villagers.some(
            (row) => row.characterId === input.residentId && row.cardSnapshot.capturedAt === input.incarnation,
          ))
      )
        return;
      await ports.mutateRelationships(input.seed, (state) => {
        retired = false;
        if (invalidLetter && input.mode !== "resident") return;
        if (
          state.mailDeliveries[input.messageId] &&
          (input.mode === "resident" || state.mailDeliveries[input.messageId + ":reply"])
        )
          return;
        let thread = state.mailThreads[input.threadId];
        if (!thread && input.mode === "resident") {
          thread = state.mailThreads[input.threadId] = {
            id: input.threadId,
            participantIds: ["player", input.residentId],
            revision: 0,
            messages: [],
          };
        }
        if (!thread || !thread.participantIds.includes("player") || !thread.participantIds.includes(input.residentId))
          return;
        let source = thread.messages.find((row) => row.id === input.messageId);
        if (!source && input.mode === "resident") {
          source = {
            id: input.messageId,
            requestId: input.messageId,
            fromId: input.residentId,
            toId: "player",
            text: input.sourceText,
            at: input.sourceAt,
            status: "cancelled",
            sourceHash: input.sourceHash,
            incarnation: input.incarnation,
          };
          thread.messages.push(source);
        }
        if (
          !source ||
          source.sourceHash !== input.sourceHash ||
          source.incarnation !== input.incarnation ||
          source.fromId !== (input.mode === "resident" ? input.residentId : "player") ||
          source.toId !== (input.mode === "resident" ? "player" : input.residentId)
        )
          return;
        if (state.mailDeliveries[input.messageId]) {
          source.replyUnavailable = true;
          source.replyStatus = "complete";
          source.error = "A reply could not be delivered because the correspondent changed.";
        } else {
          source.status = input.mode === "resident" ? "cancelled" : "undeliverable";
          source.error =
            input.mode === "resident" ? undefined : "This letter could not be delivered because its recipient changed.";
        }
        thread.revision++;
        retired = true;
      });
    });
    if (!retired) return false;
    await ports.mutateVillageState((state) => {
      if (state.seed === input.seed)
        state.socialMailOutbox = state.socialMailOutbox?.filter(
          (row) =>
            !(
              row.id === entry.id &&
              row.input.sourceHash === input.sourceHash &&
              row.input.incarnation === input.incarnation
            ),
        );
    });
    return true;
  }
  async function queue(input: SocialMailInput, actionId?: string) {
    await ports.queueBackgroundJob({
      kind: "personal-mail",
      subjectId: input.messageId,
      seed: input.seed,
      finite: true,
      label: "Personal reply",
      revision: actionId ? input.sourceHash + ":" + actionId : input.sourceHash,
      input,
    });
  }
  async function admit(
    village: VillageState,
    threadId: string,
    messageId: string,
    actionId?: string,
    retainedReply?: string,
  ) {
    try {
      await queue(await makeInput(village, threadId, messageId, retainedReply), actionId);
    } catch (error) {
      const latest = await ports.readVillageSnapshot();
      const retained = latest.socialMailOutbox?.find((row) => row.id === messageId && row.input.threadId === threadId);
      if (retained && (await retireChangedCorrespondent(retained))) throw error;
      await ports.withVillageSceneAcceptance(async (authority) => {
        if (authority.seed !== village.seed) return;
        await ports.mutateRelationships(village.seed, (state) => {
          const message = state.mailThreads[threadId]?.messages.find((row) => row.id === messageId);
          if (message && !state.mailDeliveries[message.id]) {
            const unavailable =
              message.fromId === "player" &&
              !authority.villagers.some(
                (resident) =>
                  resident.characterId === message.toId && resident.cardSnapshot.capturedAt === message.incarnation,
              );
            message.status = unavailable ? "undeliverable" : message.status;
            message.admissionFailed = !unavailable;
            message.error = unavailable
              ? "This letter could not be delivered because its recipient changed."
              : "Letter processing could not start.";
          }
        });
      });
      throw error;
    }
    await ports.mutateRelationships(village.seed, (state) => {
      const message = state.mailThreads[threadId]?.messages.find((row) => row.id === messageId);
      if (message?.admissionFailed) {
        message.admissionFailed = undefined;
        message.error = undefined;
      }
    });
  }
  async function makeInput(
    village: VillageState,
    threadId: string,
    messageId: string,
    retainedReply?: string,
  ): Promise<SocialMailInput> {
    const state = await ports.readRelationshipState(village.seed),
      { message } = requireMailSource(state, threadId, messageId);
    const resident = village.villagers.find(
      (row) => row.characterId === (message.toId === "player" ? message.fromId : message.toId),
    );
    if (!resident) throw badRequest("The recipient is no longer a resident.");
    const incarnation = message.incarnation;
    if (!incarnation || !message.sourceHash) throw conflict("The pending message has no saved source identity.");
    if (resident.cardSnapshot.capturedAt !== incarnation)
      throw conflict("The correspondent changed. The original message is retained for recovery.");
    return {
      mode: message.fromId === "player" ? "player" : "resident",
      seed: village.seed,
      threadId,
      messageId,
      residentId: resident.characterId,
      sourceText: message.text,
      sourceAt: message.at,
      admittedAt: new Date().toISOString(),
      sourceHash: message.sourceHash,
      incarnation,
      admitted: admission({ ...village, relationshipContext: state }, resident.characterId),
      retainedReply,
      narrationMemories: recallMemories(village.memories, {
        purpose: "narration",
        audience: [resident.characterId],
        query: message.text + " " + resident.characterId,
      }).serialized,
      systemMemory: sceneMemoryContext(village, [resident.characterId, "player"], message.text),
      sourceDelivered: !!state.mailDeliveries[message.id],
    };
  }
  async function readMailbox(): Promise<MailboxView> {
    let village = await ports.readVillageSnapshot();
    if (!village.clock?.recovery && (await processOutbox(village))) village = await ports.readVillageSnapshot();
    const state = await ports.readRelationshipState(village.seed);
    const jobs = (await ports.backgroundWorkSummaries()).filter((job) => job.kind === "personal-mail");
    const jobFor = (id: string) => {
      const matches = jobs.filter((job) => job.subjectId === id);
      return (
        matches.find((job) => ["queued", "running", "paused"].includes(job.status)) ??
        matches.sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""))[0]
      );
    };
    const canRecover = (id: string) => {
      const job = jobFor(id);
      const source = Object.values(state.mailThreads)
        .flatMap((thread) => thread.messages)
        .find((row) => row.id === id);
      return (
        !village.clock?.recovery &&
        !source?.replyUnavailable &&
        !["cancelled", "undeliverable"].includes(source?.status ?? "") &&
        !["queued", "running", "paused"].includes(job?.status ?? "")
      );
    };
    const name = (id: string) =>
      village.villagers.find((row) => row.characterId === id)?.cardSnapshot.name ?? "Former resident";
    return {
      recovery: (village.socialMailOutbox ?? [])
        .filter((row) => !!row.error && canRecover(row.id))
        .map((row) => ({
          threadId: row.input.threadId,
          messageId: row.id,
          label: "Saved mail processing needs recovery.",
          reinterpretRequired: !!row.reinterpretRequired,
        })),
      threads: Object.values(state.mailThreads)
        .filter(
          (row) =>
            row.participantIds.includes("player") &&
            row.messages.some((message) => message.fromId === "player" || !!state.mailDeliveries[message.id]),
        )
        .map((thread) => {
          const residentId = thread.participantIds.find((id) => id !== "player")!;
          return {
            id: thread.id,
            residentId,
            residentName: name(residentId),
            revision: thread.revision,
            messages: thread.messages
              .filter((row) => row.fromId === "player" || !!state.mailDeliveries[row.id])
              .map((row) => ({
                id: row.id,
                fromId: row.fromId,
                text: row.text,
                at: row.at,
                status: state.mailDeliveries[row.id] ? "delivered" : row.status,
                read: !!row.readAt,
                replyPending: row.replyStatus === "pending",
                retryAvailable:
                  canRecover(row.id) &&
                  ((village.socialMailOutbox ?? []).some((entry) => entry.id === row.id && !!entry.error) ||
                    (row.admissionFailed === true && row.status === "pending" && !jobFor(row.id)) ||
                    ["failed", "interrupted"].includes(jobFor(row.id)?.status ?? "")),
                error:
                  row.status === "undeliverable" || row.replyUnavailable
                    ? row.error
                    : canRecover(row.id) &&
                        ((village.socialMailOutbox ?? []).some((entry) => entry.id === row.id && !!entry.error) ||
                          (row.admissionFailed === true && row.status === "pending" && !jobFor(row.id)) ||
                          ["failed", "interrupted"].includes(jobFor(row.id)?.status ?? ""))
                      ? "Letter processing needs attention."
                      : undefined,
              })),
          };
        }),
    };
  }
  async function send(value: unknown, threadId?: string) {
    const input = z
      .object({
        residentId: z.string().min(1),
        requestId: z.string().min(1).max(200),
        text: z.string().min(1).max(4000),
      })
      .parse(value);
    const village = await ports.readVillageSnapshot();
    if (!village.villagers.some((row) => row.characterId === input.residentId))
      throw badRequest("Choose a current resident.");
    if (!village.relationshipContext?.reviewedActorIds.includes(input.residentId))
      throw conflict("Starting history needs preparation before correspondence.");
    if (threadId && threadId !== personalThreadId(input.residentId))
      throw badRequest("The recipient does not match this thread.");
    const state = await ports.mutateRelationships(village.seed, (state) => {
      const source = queuePersonalMessage(
        state,
        input.residentId,
        input.requestId,
        input.text,
        new Date().toISOString(),
      );
      source.incarnation ??= village.villagers.find(
        (row) => row.characterId === input.residentId,
      )!.cardSnapshot.capturedAt;
      source.sourceHash ??= semanticHash([
        village.seed,
        source.id,
        source.fromId,
        source.toId,
        source.text,
        source.at,
        source.incarnation,
      ]);
    });
    const source = state.mailThreads[personalThreadId(input.residentId)]!.messages.find(
      (row) => row.requestId === input.requestId,
    )!;
    if (source.status === "pending") await admit(village, personalThreadId(input.residentId), source.id);
    return readMailbox();
  }
  async function readLetter(threadId: string, messageId: string) {
    const village = await ports.readVillageSnapshot();
    const thread = village.relationshipContext?.mailThreads[threadId];
    if (!thread || !thread.participantIds.includes("player")) throw badRequest("That thread is unavailable.");
    const letter = thread.messages.find((message) => message.id === messageId && message.toId === "player");
    if (!letter || !village.relationshipContext!.mailDeliveries[messageId])
      throw badRequest("That letter is unavailable.");
    const lines: RelationshipEvidenceLine[] = thread.messages
      .filter(
        (message) =>
          !!village.relationshipContext!.mailDeliveries[message.id] &&
          (message.fromId === "player" || !!message.readAt || message.id === messageId),
      )
      .map((message) => ({
        id: message.id,
        speakerId: message.fromId,
        role: message.fromId === "player" ? "user" : "assistant",
        content: message.text,
        heardBy: ["player"],
        playerHeard: true,
      }));
    // Publish first. A failed Memory write leaves the message unread and locally retryable.
    for (const message of [letter]) {
      const delivery = village.relationshipContext!.mailDeliveries[message.id];
      if (message.toId !== "player" || !delivery || message.readAt) continue;
      await ports.mutateVillageState(
        (state) => {
          if (state.seed !== village.seed) throw conflict("Village identity changed.");
          for (const fact of message.wishDisclosures ?? [])
            publishWishDisclosure(state, fact, new Date().toISOString());
          publishRelationshipDisclosures(
            state,
            message.disclosures ?? [],
            { kind: "domain", id: "mail:" + semanticHash(message.id), revision: 1, fingerprint: delivery.sourceHash },
            lines,
            message.at,
            new Date().toISOString(),
          );
        },
        { memories: true },
      );
    }
    await ports.mutateRelationships(village.seed, (state) =>
      readPersonalThread(state, threadId, new Date().toISOString(), [messageId]),
    );
    await publishReadWishMail(village.seed, threadId);
    return readMailbox();
  }
  async function retry(threadId: string, messageId: string, requestId: string) {
    z.string()
      .regex(/^[a-zA-Z0-9_-]{1,200}$/)
      .parse(requestId);
    const village = await ports.readVillageSnapshot(),
      social = await ports.readRelationshipState(village.seed);
    if (village.clock?.recovery) throw conflict("Resolve the village clock notice before retrying this letter.");
    const source = social.mailThreads[threadId]?.messages.find((row) => row.id === messageId);
    if (source?.replyUnavailable || (source && ["cancelled", "undeliverable"].includes(source.status)))
      throw conflict("This letter can no longer be delivered.");
    const jobs = (await ports.backgroundWorkSummaries()).filter(
      (row) => row.kind === "personal-mail" && row.subjectId === messageId,
    );
    const job =
      jobs.find((row) => ["queued", "running", "paused"].includes(row.status)) ??
      jobs.sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""))[0];
    if (job && ["queued", "running", "paused"].includes(job.status))
      throw conflict("This letter is already being processed.");
    const entry = village.socialMailOutbox?.find((row) => row.id === messageId && row.input.threadId === threadId);
    const name = village.villagers.find((row) => row.characterId === entry?.input.residentId)?.cardSnapshot.name;
    const replaceInvalidReply =
      !!entry?.error &&
      entry.input.mode !== "resident" &&
      !social.mailDeliveries[messageId + ":reply"] &&
      hasPersonalLetterAction(entry.result.replyText, name);
    const fingerprint = (row: SocialMailOutbox) =>
      semanticHash([row.id, row.input.sourceHash, row.input.admittedAt, row.result, row.error]);
    const rewriteAction = replaceInvalidReply && entry ? "mail-rewrite-" + fingerprint(entry).slice(0, 32) : "";
    // An older saved reply may have failed after source delivery but before its Memory settled.
    // Preserve that local work before a replacement generation can overwrite the saved result.
    if (replaceInvalidReply && entry && social.mailDeliveries[messageId]) {
      await settleWishMail(entry.input, entry.result, "source");
      await rememberResidentMail(entry.input, entry.result, "source");
    }
    if (entry?.error && !entry.reinterpretRequired && !replaceInvalidReply) {
      await ports.mutateVillageState((state) => {
        const saved = state.socialMailOutbox?.find((row) => row.id === messageId);
        if (saved) saved.error = undefined;
      });
      await processOutbox(await ports.readVillageSnapshot());
      return readMailbox();
    }
    const { message } = requireMailSource(social, threadId, messageId);
    if (["cancelled", "undeliverable"].includes(message.status))
      throw conflict("This letter can no longer be delivered.");
    if (
      job &&
      ["failed", "interrupted"].includes(job.status) &&
      (!replaceInvalidReply || entry?.retryAdmitted === rewriteAction)
    ) {
      await ports.retryBackgroundJob(job.id, job.attempt, requestId);
    } else if (entry?.error) {
      // An explicit retry replaces an invalid unseen reply; otherwise it retains the saved text.
      const action = (replaceInvalidReply ? "mail-rewrite-" : "mail-reinterpret-") + fingerprint(entry).slice(0, 32);
      let claimed = false;
      await ports.mutateVillageState((state) => {
        claimed = false;
        const saved = state.socialMailOutbox?.find((row) => row.id === messageId && row.input.threadId === threadId);
        if (!saved || fingerprint(saved) !== fingerprint(entry) || (saved.retryClaim && saved.retryClaim !== action))
          return;
        saved.retryClaim = action;
        claimed = true;
      });
      if (!claimed) return readMailbox();
      await admit(village, threadId, messageId, action, replaceInvalidReply ? undefined : entry.result.replyText);
      await ports.mutateVillageState((state) => {
        const saved = state.socialMailOutbox?.find((row) => row.id === messageId && row.input.threadId === threadId);
        if (saved?.retryClaim === action) saved.retryAdmitted = action;
      });
    } else {
      if (message.status === "pending" && !job && message.admissionFailed) await admit(village, threadId, messageId);
      else throw conflict("This letter has no failed processing to retry.");
    }
    return readMailbox();
  }
  const handler: Handler = {
    generate,
    valid: (state, input: SocialMailInput) =>
      state.seed === input.seed &&
      state.villagers.some(
        (row) => row.characterId === input.residentId && row.cardSnapshot.capturedAt === input.incarnation,
      ) &&
      !!state.relationshipContext?.mailThreads[input.threadId]?.messages.some(
        (row) =>
          row.id === input.messageId &&
          row.text === input.sourceText &&
          !row.replyUnavailable &&
          !["cancelled", "undeliverable"].includes(row.status),
      ),
    apply: (state, input, result) => {
      state.socialMailOutbox ??= [];
      const prior = state.socialMailOutbox.find((row) => row.id === input.messageId);
      if (prior) {
        if (prior.input.sourceHash !== input.sourceHash) throw conflict("Mail source identity changed.");
        prior.input = input;
        prior.result = result;
        prior.error = undefined;
        prior.reinterpretRequired = undefined;
        prior.retryClaim = undefined;
        prior.retryAdmitted = undefined;
      } else state.socialMailOutbox.push({ id: input.messageId, input, result });
    },
    afterApply: async () => {
      await processOutbox(await ports.readVillageSnapshot());
    },
    afterFailure: async (input: SocialMailInput) => {
      await ports.withVillageSceneAcceptance(async (latest) => {
        if (latest.seed !== input.seed) return;
        await ports.mutateRelationships(input.seed, (state) => {
          const message = state.mailThreads[input.threadId]?.messages.find((row) => row.id === input.messageId);
          if (!message || message.sourceHash !== input.sourceHash || message.incarnation !== input.incarnation) return;
          if (
            input.mode !== "resident" &&
            !state.mailDeliveries[message.id + ":reply"] &&
            !latest.villagers.some(
              (row) => row.characterId === input.residentId && row.cardSnapshot.capturedAt === input.incarnation,
            )
          ) {
            if (state.mailDeliveries[message.id]) {
              message.replyUnavailable = true;
              message.replyStatus = "complete";
              message.error = "A reply could not be delivered because the correspondent changed.";
            } else {
              message.status = "undeliverable";
              message.error = "This letter could not be delivered because its recipient changed.";
            }
          } else
            message.error = state.mailDeliveries[message.id]
              ? "Delivered; reply needs retry."
              : "Letter processing needs attention.";
        });
      });
    },
  };
  function automaticOutbox(
    village: VillageState,
    social: VillageState["relationshipContext"],
    value: unknown,
    opportunityId: string,
    at: string,
    memory?: ReturnType<typeof sceneMemoryContext>,
  ): SocialMailOutbox {
    const row = z
      .object({
        senderId: z.string(),
        text: z.string().min(1).max(2000),
        relationshipReview: z.unknown(),
      })
      .parse(value);
    const resident = village.villagers.find((person) => person.characterId === row.senderId);
    if (!resident) throw new Error("Automatic correspondent is unavailable.");
    assertPersonalLetter(row.text, resident.cardSnapshot.name);
    const messageId = opportunityId + ":mail",
      threadId = personalThreadId(row.senderId);
    const captured = admission({ ...village, relationshipContext: social }, row.senderId);
    const input: SocialMailInput = {
      mode: "resident",
      seed: village.seed,
      threadId,
      messageId,
      residentId: row.senderId,
      sourceText: row.text,
      sourceAt: at,
      incarnation: resident.cardSnapshot.capturedAt,
      sourceHash: semanticHash([
        village.seed,
        messageId,
        row.senderId,
        "player",
        row.text,
        at,
        resident.cardSnapshot.capturedAt,
      ]),
      admitted: captured,
      systemMemory: memory,
      sourceDelivered: false,
    };
    const sourceLine: RelationshipEvidenceLine = {
      id: messageId,
      speakerId: row.senderId,
      role: "assistant",
      content: row.text,
      heardBy: [row.senderId, "player"],
      playerHeard: true,
      kind: "mail",
    };
    const raw = asRecord(row.relationshipReview);
    const bound = Object.fromEntries(
      ["changes", "disclosures", "intentions"].map((kind) => [
        kind,
        (Array.isArray(raw[kind]) ? raw[kind] : []).map((value) => ({
          ...asRecord(value),
          lineIds: Array.isArray(asRecord(value).lineIds)
            ? (asRecord(value).lineIds as unknown[]).map((id: unknown) => (id === 0 ? messageId : id))
            : [],
        })),
      ]),
    );
    const source = parseRelationshipReview(mailReviewInput(bound), messageId, [sourceLine], captured, true);
    return {
      id: messageId,
      input,
      result: {
        source,
        reply: emptyRelationshipReview(),
        replyText: "",
        sourceWishChanges: Array.isArray(asRecord(value).wishChanges)
          ? (asRecord(value).wishChanges as unknown[]).map((raw) => ({
              ...asRecord(raw),
              evidence: (asRecord(raw).evidence as unknown[]).map((ref) => (ref === 0 ? messageId : ref)),
            }))
          : [],
        sourceMemoryChanges: Array.isArray(asRecord(value).memoryChanges)
          ? (asRecord(value).memoryChanges as unknown[])
          : [],
      },
    };
  }
  return { handler, processOutbox, readMailbox, send, readLetter, retry, automaticOutbox };
}
export type SocialMailService = ReturnType<typeof createSocialMail>;
