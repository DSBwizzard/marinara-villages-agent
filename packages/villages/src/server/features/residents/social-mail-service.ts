import { coerceSession } from "../../domain/decoding/scene-codec.js";
import { bindLiveProposals } from "../../domain/rules/live-exchange.js";
import { SCENE_MEMORY_INSTRUCTION } from "../../domain/rules/scene-memories.js";
import { recallMemories } from "../../domain/rules/memory-recall.js";
import { sceneMemoryContext } from "../../domain/rules/scene-memories.js";
import { socialContextState } from "../../domain/rules/social-context.js";
import { z } from "zod";
import type { Handler } from "../../domain/models/background-model.js";
import type { VillageState } from "../../domain/models/world.js";
import type { SocialMailInterpretation, SocialMailInput, SocialMailOutbox } from "../../domain/models/social-mail.js";
import type { RelationshipEvidenceLine, RelationshipReview } from "../../domain/models/relationship-types.js";
import type { MailboxView } from "../../../shared/contracts/mailbox.js";
import { defaultVillageState } from "../../domain/decoding/village-codec.js";
import { asRecord } from "../../domain/rules/coerce.js";
import { badRequest, conflict } from "../../domain/rules/errors.js";
import { semanticHash } from "../../domain/rules/semantic-contract.js";
import { extractModelJsonObject } from "../../domain/rules/json-reply.js";
import { relationshipWritingPrompt } from "../../domain/rules/relationship-presentation.js";
import {
  defaultRelationshipState,
  applyRelationshipReview,
  SocialRevisionConflict,
} from "../../domain/rules/relationship-rules.js";
import {
  emptyRelationshipReview,
  parseRelationshipReview,
  RELATIONSHIP_REVIEW_INSTRUCTION,
} from "../../domain/rules/relationship-review.js";
import { publishRelationshipDisclosures } from "../../domain/rules/relationship-memories.js";
import {
  queuePersonalMessage,
  personalThreadId,
  requireMailSource,
  cancelPersonalMessage,
  beginMailDelivery,
  completeMailDelivery,
  readPersonalThread,
  withoutMailDisclosures,
} from "../../domain/rules/social-mail.js";

export interface SocialMailPorts {
  processLiveMemories?: typeof import("./live-memory.js").processLiveMemories;
  readVillageSnapshot: typeof import("../world/village-store.js").readVillageSnapshot;
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
                      "Write one setting-appropriate personal reply as this resident. Treat the pending player's exact message as the proposed incoming source. System will independently settle its meaning before either message is delivered. Keep the resident's voice, initiative and boundaries; they may refuse or end a bond. Never invent player words, feelings, consent, travel or physical deeds. Communication alone does not perform physical tasks or grant access. Return JSON {text:string}, at most 2000 characters. Empty text is a valid choice not to reply.",
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
            actors: state.villagers.map((row) => ({ id: row.characterId, name: row.cardSnapshot.name })),
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
  async function applyEntry(entry: SocialMailOutbox) {
    const { input, result } = entry;
    let village = await ports.readVillageSnapshot();
    if (village.seed !== input.seed) throw conflict("Village identity changed.");
    let current = await ports.readRelationshipState(input.seed);
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
    if (original.status === "cancelled" && !current.mailDeliveries[input.messageId]) {
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
      original.status === "cancelled"
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
      village = await ports.readVillageSnapshot();
      await ports.mutateRelationships(input.seed, (state) => {
        applyRelationshipReview(
          state,
          withoutMailDisclosures(mailReview(result.source)),
          village,
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
    }
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
      village = await ports.readVillageSnapshot();
      await ports.mutateRelationships(input.seed, (state) => {
        const { thread, message } = requireMailSource(state, input.threadId, input.messageId);
        if (state.mailDeliveries[replyId]) return;
        applyRelationshipReview(
          state,
          withoutMailDisclosures(mailReview(result.reply)),
          village,
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
    } else
      await ports.mutateRelationships(input.seed, (state) => {
        const { message } = requireMailSource(state, input.threadId, input.messageId);
        message.replyStatus = "complete";
        message.error = undefined;
      });
    await rememberResidentMail(input, result, "reply");
    await ports.mutateVillageState((state) => {
      if (state.seed === input.seed) {
        state.socialMailOutbox = state.socialMailOutbox?.filter((row) => row.id !== entry.id);
      }
    });
  }
  async function processOutbox(village: VillageState): Promise<boolean> {
    const entries = (village.socialMailOutbox ?? []).filter((row) => !row.error);
    if (!entries.length) return false;
    for (const entry of entries) {
      const existing = running.get(entry.id);
      if (existing) {
        await existing;
        continue;
      }
      const task = applyEntry(entry)
        .catch(async (error) => {
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
              saved.reinterpretRequired = error instanceof SocialRevisionConflict;
            }
          });
        })
        .finally(() => running.delete(entry.id));
      running.set(entry.id, task);
      await task;
    }
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
    const name = (id: string) =>
      village.villagers.find((row) => row.characterId === id)?.cardSnapshot.name ?? "Former resident";
    return {
      recovery: (village.socialMailOutbox ?? [])
        .filter((row) => !!row.error)
        .map((row) => ({
          threadId: row.input.threadId,
          messageId: row.id,
          label: "Saved mail processing needs recovery.",
          reinterpretRequired: !!row.reinterpretRequired,
          cancellable:
            !state.mailDeliveries[row.id] &&
            ["pending", "cancelled"].includes(
              state.mailThreads[row.input.threadId]?.messages.find((message) => message.id === row.id)?.status ?? "",
            ),
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
                error: row.error,
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
    if (source.status === "pending")
      await queue(await makeInput(village, personalThreadId(input.residentId), source.id));
    return readMailbox();
  }
  async function readThread(threadId: string) {
    const village = await ports.readVillageSnapshot();
    const thread = village.relationshipContext?.mailThreads[threadId];
    if (!thread || !thread.participantIds.includes("player")) throw badRequest("That thread is unavailable.");
    const readIds = thread.messages
      .filter(
        (message) =>
          message.toId === "player" && village.relationshipContext!.mailDeliveries[message.id] && !message.readAt,
      )
      .map((message) => message.id);
    const lines: RelationshipEvidenceLine[] = thread.messages
      .filter((message) => !!village.relationshipContext!.mailDeliveries[message.id])
      .map((message) => ({
        id: message.id,
        speakerId: message.fromId,
        role: message.fromId === "player" ? "user" : "assistant",
        content: message.text,
        heardBy: ["player"],
        playerHeard: true,
      }));
    // Publish first. A failed Memory write leaves the message unread and locally retryable.
    for (const message of thread.messages) {
      const delivery = village.relationshipContext!.mailDeliveries[message.id];
      if (message.toId !== "player" || !delivery || message.readAt) continue;
      await ports.mutateVillageState(
        (state) => {
          if (state.seed !== village.seed) throw conflict("Village identity changed.");
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
      readPersonalThread(state, threadId, new Date().toISOString(), readIds),
    );
    return readMailbox();
  }
  async function cancel(threadId: string, messageId: string) {
    const village = await ports.readVillageSnapshot();
    await ports.mutateRelationships(village.seed, (state) => cancelPersonalMessage(state, threadId, messageId));
    await ports.mutateVillageState((state) => {
      if (state.seed === village.seed)
        state.socialMailOutbox = state.socialMailOutbox?.filter((row) => row.id !== messageId);
    });
    return readMailbox();
  }
  async function retry(threadId: string, messageId: string, requestId: string) {
    z.string()
      .regex(/^[a-zA-Z0-9_-]{1,200}$/)
      .parse(requestId);
    const village = await ports.readVillageSnapshot(),
      social = await ports.readRelationshipState(village.seed);
    const entry = village.socialMailOutbox?.find((row) => row.id === messageId && row.input.threadId === threadId);
    if (entry && !entry.reinterpretRequired) {
      await ports.mutateVillageState((state) => {
        const saved = state.socialMailOutbox?.find((row) => row.id === messageId);
        if (saved) saved.error = undefined;
      });
      await processOutbox(await ports.readVillageSnapshot());
      return readMailbox();
    }
    const { message } = requireMailSource(social, threadId, messageId);
    if (message.status === "cancelled") throw conflict("This message was cancelled.");
    if (entry) {
      // A deliberate reinterpretation retains exact outgoing and reply text, and admits only fresh settlement context.
      const input = await makeInput(village, threadId, messageId, entry.result.replyText);
      await queue(input, requestId);
    } else {
      const job = (await ports.backgroundWorkSummaries()).find(
        (row) => row.kind === "personal-mail" && row.subjectId === messageId,
      );
      if (job && ["failed", "interrupted", "paused"].includes(job.status))
        await ports.retryBackgroundJob(job.id, job.attempt, requestId);
      else if (message.status === "pending")
        await queue(await makeInput(village, threadId, messageId), job?.status === "obsolete" ? requestId : undefined);
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
        (row) => row.id === input.messageId && row.text === input.sourceText && row.status !== "cancelled",
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
      } else state.socialMailOutbox.push({ id: input.messageId, input, result });
    },
    afterApply: async () => {
      await processOutbox(await ports.readVillageSnapshot());
    },
    afterFailure: async (input: SocialMailInput) => {
      await ports.mutateRelationships(input.seed, (state) => {
        const message = state.mailThreads[input.threadId]?.messages.find((row) => row.id === input.messageId);
        if (message)
          message.error = state.mailDeliveries[message.id]
            ? "Delivered; reply needs retry."
            : "Message is pending; retry or cancel it.";
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
        sourceMemoryChanges: Array.isArray(asRecord(value).memoryChanges)
          ? (asRecord(value).memoryChanges as unknown[])
          : [],
      },
    };
  }
  return { handler, processOutbox, readMailbox, send, readThread, cancel, retry, automaticOutbox };
}
export type SocialMailService = ReturnType<typeof createSocialMail>;
