import { completeVillageResidence } from "../packages/villages/src/server/features/venues/residences.js";
import { setVillageSendOnEnter } from "../packages/villages/src/server/features/settings/village-settings.js";
import { settleBackgroundWork } from "../packages/villages/src/server/jobs/background-work.js";
import { fixtureInterpretationChecks } from "./fixtures/villages-interpretation-payload.js";
import assert from "node:assert/strict";
import { wishReceiptRecords } from "../packages/villages/src/server/features/residents/wishes/wish-interpretation.js";
import { physicalVenueEvents } from "../packages/villages/src/server/domain/rules/venue-scene-state.js";
import { measurePipeline } from "../packages/villages/src/server/adapters/observability/pipeline-metrics.js";
// Older narration fixtures declare no Wish proposal; missing/invalid metadata has dedicated live-domain coverage.
function fixtureJson(value: any) {
  return JSON.stringify(
    value?.segments || value?.lines
      ? {
          wishChanges: [],
          memoryChanges: [],
          relationshipChanges: { changes: [], permissions: [], disclosures: [] },
          ...value,
        }
      : value,
  );
}
import {
  DEFAULT_PLAYER_ROLE,
  renderPlayerRoleContext,
  renderPlayerRoleWritingContext,
} from "../packages/villages/src/server/domain/rules/player-role.js";
import { requestProjectMailbox } from "../packages/villages/src/server/features/projects/project-lifecycle.js";
import { agendaDateKey } from "../packages/villages/src/server/domain/rules/agenda-week.js";
import { proposeHappenings } from "../packages/villages/src/server/features/founding/village-bootstrap.js";
import { deriveVillageMoment } from "../packages/villages/src/server/domain/rules/village-clock.js";
import {
  venueReplyIntegrity,
  venueSceneHistory,
} from "../packages/villages/src/server/domain/rules/venue-turn-integrity.js";
import { generateFirstPrivateSpaceImage } from "../packages/villages/src/server/features/media/location-image.js";
import {
  decideVillagerVenueImprovement,
  proposeVenueChange,
  queueVenueCounteroffer,
  recordVillagerVenueImprovement,
  respondDueVenueMail,
} from "../packages/villages/src/server/features/venues/venue-mailbox.js";

import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import {
  readVillageWriting,
  saveVillageWriting,
} from "../packages/villages/src/server/features/settings/narration-settings.js";
import {
  VENUE_SCENE_WRITING_FOUNDATION,
  WRITING_GUIDANCE_MAX_LENGTH,
} from "../packages/villages/src/server/domain/rules/narration-style.js";
import {
  continueVenueWithoutGreeting,
  endVenueSession as endVenueSessionRaw,
  closeVenueSessionWithReceipts,
  enterVenue,
  enterResidencePrivateSpace,
  moveVenueZone,
  leaveVenueSession,
  greetVenue as greetVenueRaw,
  sendVenueTurn as sendVenueTurnRaw,
  discardVenueVisitDebug,
} from "../packages/villages/src/server/features/scenes/venue-session.js";
import { readSceneChanges } from "../packages/villages/src/server/features/scenes/changes.js";
import { activeVenueSession, touchVenueSession } from "../packages/villages/src/server/features/scenes/live-session.js";
import { readProjectTurnEvidence } from "../packages/villages/src/server/features/scenes/services.js";
import {
  resetVenueSessions,
  listVenueVisits,
  listVenueVisitSummaries,
  readVenueVisit,
} from "../packages/villages/src/server/features/scenes/archive.js";
import { parseVenueReply } from "../packages/villages/src/server/domain/rules/scene-reply.js";
import { venueCardProfile } from "../packages/villages/src/server/domain/rules/venue-writing.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { mutateVillageState, readVillageState } from "../packages/villages/src/server/features/world/village-store.js";
import { reconcileVillage, resetVillage } from "../packages/villages/src/server/features/world/village.js";
import { proposeResidenceSpaceEdit } from "../packages/villages/src/server/features/venues/zone-edits.js";
import { updateVillageVenue, setVillageVenueImage } from "../packages/villages/src/server/features/venues/services.js";
import { buildVillageSnapshot } from "../packages/villages/src/server/features/world/snapshot.js";

// These tests deliberately retry failed calls. Supply explicit authorization under the new contract.
async function sendVenueTurn(input: Parameters<typeof sendVenueTurnRaw>[0]) {
  const session = records.get(key("villages", `villages-venue-visit-${input.sessionId}`))?.data ?? {};
  return sendVenueTurnRaw({
    ...input,
    expectedSceneRevision: session.sceneRevision,
    retryOfAttemptId: session.operation?.status === "interrupted" ? session.operation.attemptId : undefined,
  });
}
async function greetVenue(id: string) {
  const session = records.get(key("villages", `villages-venue-visit-${id}`))?.data ?? {};
  return greetVenueRaw(id, session.operation?.status === "interrupted" ? session.operation.attemptId : undefined);
}
async function endVenueSession(id: string) {
  const session = records.get(key("villages", `villages-venue-visit-${id}`))?.data ?? {};
  return endVenueSessionRaw(id, session.operation?.status === "interrupted" ? session.operation.attemptId : undefined);
}

const records = new Map<string, any>();
const key = (packageId: string, id: string) => `${packageId}:${id}`;
const relationshipDecisions = false;
const failRelationshipStorage = false;
const failMemoryStorageForVisit = "";
let documentWriteCalls = 0,
  providerCalls = 0,
  providerResolves = 0;
const documents = {
  async getById(packageId: string, id: string) {
    return records.get(key(packageId, id)) ?? null;
  },
  async list(packageId: string, kind: string) {
    return [...records.values()].filter((row) => row.packageId === packageId && row.kind === kind);
  },
  async create(input: any) {
    documentWriteCalls++;
    if (failRelationshipStorage && input.id.startsWith("villages-relationships-"))
      throw new Error("relationship storage unavailable");
    const id = key(input.packageId, input.id);
    if (records.has(id)) throw new Error("already created");
    const row = {
      ...input,
      data: input.data,
      revision: 1,
    };
    records.set(id, row);
    return row;
  },
  async update(input: any) {
    documentWriteCalls++;
    if (
      input.id === "villages-village" &&
      failEffectWriteFor &&
      input.data.venueEvents.some((event: any) => event.actionReceipt?.submissionId === failEffectWriteFor)
    )
      throw new Error("physical effect write interrupted");
    if (
      input.id.startsWith("villages-venue-visit-") &&
      failReceiptBookkeepingFor &&
      input.data.submissions?.some(
        (turn: any) => turn.id === failReceiptBookkeepingFor && turn.processing?.domains.projects.status === "applied",
      )
    )
      throw new Error("receipt bookkeeping interrupted");
    if (failRelationshipStorage && input.id.startsWith("villages-relationships-"))
      throw new Error("relationship storage unavailable");
    if (
      failMemoryStorageForVisit &&
      input.id === "villages-village" &&
      input.data.chronicle.some((entry: any) => entry.sourceVisitId === failMemoryStorageForVisit)
    )
      throw new Error("memory storage unavailable");
    const id = key(input.packageId, input.id);
    const old = records.get(id);
    if (!old || old.revision !== input.expectedRevision) return null;
    const row = { ...old, ...input, revision: old.revision + 1 };
    records.set(id, row);
    return row;
  },
  async remove(packageId: string, id: string, expectedRevision: number) {
    documentWriteCalls++;
    const stored = key(packageId, id);
    if (records.get(stored)?.revision !== expectedRevision) return false;
    return records.delete(stored);
  },
};

let calls = 0;
let debugEnabled = false;
let memoryCalls = 0;
let reviewCalls = 0;
let failReviewOnce = false;
const failReviewAtCall = -1;
const reviewFailureMessage = "review unavailable";
const reviewResponseModes: ("length" | "malformed")[] = [];
const reviewBatches: { firstText: string; count: number; outputLimit: number }[] = [];
let failMemoryOnce = false;
const failMemoryAtCall = -1;
let saturateMemoryOnce = false;
let misattributeMemoryOnce = false;
let holdMemoryOnce = false;
const signalMemoryStarted: (() => void) | null = null;
const fitAnswerBudgetChars = Number.POSITIVE_INFINITY;
let _reviewContextRejects = 0;
let _memoryInputChars = 0;
let _memoryOutputChars = 0;
let _wishScanCalls = 0;
let failWishScanOnce = false;
let failGreetingOnce = false;
let holdGreetingOnce = false;
let greetingStarted: (() => void) | null = null;
let releaseHeldGreeting: (() => void) | null = null;
let malformedGreetingOnce = false;
let openingSegmentsOnce: Record<string, unknown>[] | null = null;
let emptyOpeningFailures = 0;
let failReplyOnce = false;
let sceneActionFixture: Record<string, unknown> | null = null;
let failEffectWriteFor = "";
let failReceiptBookkeepingFor = "";
let failActReplyOnce = false;
let quietActReplyOnce = false;
let narrationOnlyOnce = false;
let featureProposal: Record<string, string> | null = null;
let creativeActorIds = ["bob", "tina"];
let lastVenueSystem = "";
let lastEventsSystem = "";
let lastMailboxSystem = "";
let _lastJudgeSystem = "";
let venueReplyCalls = 0;
let concurrencyStarted: (() => void) | null = null;
let releaseConcurrent: (() => void) | null = null;
let malformedTurnOnce = false;
let blankTurnOnce = false;
let acceptEcho = false,
  acceptRepeatedQuestion = false;
let exhaustEcho = false;
let _wishJudgeCalls = 0;
let mailboxAccept = true;
const memoryEvidence: any[] = [];
const costMeasurements: any[] = [];
const modelPayloadBytes: number[] = [];
const measuringCosts = process.env.VILLAGES_SCENE_ACTION_COST === "1";
async function measured<T>(label: string, run: () => Promise<T>): Promise<T> {
  if (!measuringCosts) return run();
  const start = modelPayloadBytes.length;
  const metricStart = costMeasurements.length;
  debugEnabled = true;
  try {
    const result = await measurePipeline(label, {}, run);
    const detail = costMeasurements.findLast((row) => row.name === label);
    const totals = Object.fromEntries(
      [
        "reads",
        "writes",
        "requests",
        "reportedInputTokens",
        "reportedOutputTokens",
        "unknownUsageRequests",
        "failedRequests",
        "modelLatencyMs",
      ].map((field) => [field, costMeasurements.slice(metricStart).reduce((sum, row) => sum + row[field], 0)]),
    );
    console.log(
      JSON.stringify({
        fixture: label,
        ...detail,
        ...totals,
        providerUsage: totals.unknownUsageRequests ? "unknown" : totals.requests ? "reported" : "no requests",
        payloadBytes: modelPayloadBytes.slice(start),
      }),
    );
    return result;
  } finally {
    debugEnabled = false;
  }
}
const release = configureVillagesRuntime({
  logger: {
    debug() {},
    info() {},
    warn() {},
    error() {},
    debugOverride(_enabled, _format, text) {
      const row = JSON.parse(String(text));
      if (row.event === "pipeline measurement") costMeasurements.push(row.detail);
    },
  },
  isDebugAgentsEnabled: () => debugEnabled,
  getAgentConfig: async () => ({ connectionId: "fixture" }),
  persistence: { documents },
  resources: {
    async listCharacters() {
      return [];
    },
  },
  languageModels: {
    async resolveForRequest() {
      providerResolves++;
      return {
        model: "fixture",
        maxOutputTokens: 4096,
        fitContext(messages: any[], options: any) {
          const inputChars = messages.reduce((size, message) => size + String(message.content ?? "").length, 0);
          if (inputChars > fitAnswerBudgetChars) _reviewContextRejects += 1;
          return {
            messages,
            maxTokens: inputChars > fitAnswerBudgetChars ? options.maxTokens - 1 : options.maxTokens,
          };
        },
        async chatComplete(messages: any[], options: any) {
          providerCalls++;
          if (
            String(messages[0]?.content).includes("Response format and evidence metadata") ||
            String(messages[0]?.content).startsWith("Interpret the meaning of witnessed Scene evidence")
          )
            assert.deepEqual(options.responseFormat, { type: "json_object" });
          modelPayloadBytes.push(Buffer.byteLength(JSON.stringify(messages), "utf8"));
          const system = String(messages[0]?.content ?? "");
          const user = String(messages[1]?.content ?? "");
          if (
            system.startsWith("Interpret the meaning of witnessed Scene evidence") ||
            system.startsWith("Interpret only the cited witnessed evidence")
          ) {
            const checks = fixtureInterpretationChecks(user);
            return {
              content: fixtureJson({
                results: checks.map((check: any) => {
                  if (check.domain === "wish") {
                    _wishJudgeCalls++;
                    _lastJudgeSystem = system;
                    return {
                      id: check.id,
                      outcome: check.facts.matchingReceiptIds.length ? "fulfilled" : "none",
                      evidenceIds: check.facts.matchingReceiptIds.map((id: string) => `receipt:${id}`),
                      reason: "The parcel was transferred in the labeled fixture",
                      details: { proofKind: "physical" },
                    };
                  }
                  if (check.domain !== "room")
                    return {
                      id: check.id,
                      outcome: "none",
                      evidenceIds: [],
                      reason: "No Project event in this fixture",
                    };
                  const speech = check.evidence.filter(
                    (line: any) => line.current && line.speakerId === check.facts.actorId,
                  );
                  const text = speech.map((line: any) => line.content).join(" ");
                  const shared = !check.facts.zoneId.startsWith("private");
                  if (check.facts.venueId !== "home")
                    return { id: check.id, outcome: "none", evidenceIds: [], reason: "Another Venue" };
                  const outcome =
                    text === "You may come into our shared space on your next visit." && shared
                      ? "invite-later"
                      : text === "Come into our Common Space with me now." && shared
                        ? "invite-now"
                        : ["You may enter my private space with me now.", "Oh yeah."].includes(text) && !shared
                          ? "invite-now"
                          : "none";
                  return {
                    id: check.id,
                    outcome,
                    evidenceIds: speech.map((line: any) => line.id),
                    reason: "Labeled fixture interpretation",
                  };
                }),
              }),
              finishReason: "stop",
            };
          }
          if (system.startsWith("Prepare faithful fulfillment conditions"))
            return {
              content: fixtureJson({
                complete: true,
                kind: "transfer",
                requiresPhysical: true,
                goal: "The parcel is handed to Tina.",
                itemName: "parcel",
              }),
              finishReason: "stop",
            };
          calls += 1; // Existing cadence assertions concern narration and legacy calls; interpretation has its own suite.
          if (system.startsWith("Identify explicit Project events"))
            return { content: fixtureJson({ events: [] }), finishReason: "stop" };
          // This suite exercises foreground visits, not agenda prose. Block the agenda without a provider failure.
          if (system.startsWith("Describe a stable ordinary routine")) return { content: "{}", finishReason: "stop" };
          if (user.startsWith("The player arrives in this Residence's Exterior Zone"))
            return {
              content: fixtureJson({
                heardPlayerBy: [],
                segments: [{ kind: "narration", text: "The door stays closed for now.", heardBy: [] }],
              }),
              finishReason: "stop",
            };
          if (user === "Please let me in") {
            const quote = "Come into our Common Space with me now.";
            return {
              content: fixtureJson({
                heardPlayerBy: ["bob"],
                segments: [{ kind: "dialogue", speakerId: "bob", text: quote, heardBy: ["bob", "tina"] }],
                invitation: {
                  speakerId: "bob",
                  venueId: "home",
                  scope: "shared",
                  timing: "now",
                  accompanies: true,
                  quote,
                },
              }),
              finishReason: "stop",
            };
          }
          if (user === "Can I use Bob's room") {
            const quote = "Oh yeah.";
            return {
              content: fixtureJson({
                heardPlayerBy: ["bob"],
                segments: [{ kind: "dialogue", speakerId: "bob", text: quote, heardBy: ["bob"] }],
                invitation: {
                  speakerId: "bob",
                  venueId: "home",
                  scope: "private",
                  ownerId: "bob",
                  timing: "now",
                  quote,
                },
              }),
              finishReason: "stop",
            };
          }
          if (user === "I wait quietly")
            return {
              content: fixtureJson({
                heardPlayerBy: [],
                segments: [{ kind: "narration", text: "No one comes to the door.", heardBy: [] }],
              }),
              finishReason: "stop",
            };
          if (user === "I place a sign outside")
            return {
              content: fixtureJson({
                heardPlayerBy: [],
                segments: [{ kind: "narration", text: "A sign stands beside the gate.", heardBy: [] }],
                sceneChange: { happened: true, narration: "A sign stands beside the gate.", addItem: "sign" },
              }),
              finishReason: "stop",
            };
          if (user === "What new venue do we need?") {
            const quote = "Could we build a Power Plant for reliable light?";
            return {
              content: fixtureJson({
                heardPlayerBy: ["bob"],
                segments: [{ kind: "dialogue", speakerId: "bob", text: quote, heardBy: ["bob", "tina"] }],
                venueRequest: { speakerId: "bob", name: "Power Plant", classes: ["workplace"], quote },
              }),
              finishReason: "stop",
            };
          }
          if (user === "Come visit tomorrow") {
            const quote = "You may come into our shared space on your next visit.";
            return {
              content: fixtureJson({
                heardPlayerBy: ["bob"],
                segments: [{ kind: "dialogue", speakerId: "bob", text: quote, heardBy: ["bob"] }],
                invitation: { speakerId: "bob", venueId: "home", scope: "shared", timing: "later", quote },
              }),
              finishReason: "stop",
            };
          }
          if (user === "Please enter Bob's private space") {
            const quote = "You may enter my private space with me now.";
            return {
              content: fixtureJson({
                heardPlayerBy: ["bob"],
                segments: [{ kind: "dialogue", speakerId: "bob", text: quote, heardBy: ["bob"] }],
                invitation: {
                  speakerId: "bob",
                  venueId: "home",
                  scope: "private",
                  ownerId: "bob",
                  timing: "now",
                  accompanies: true,
                  quote,
                },
              }),
              finishReason: "stop",
            };
          }
          if (user === "Bob approves the edit" || user === "Tina approves the edit") {
            const speakerId = user.startsWith("Bob") ? "bob" : "tina";
            const quote = "I approve that exact room proposal.";
            const proposalId = system.match(/Pending exact Residence edit proposals: ([a-z0-9]+):/u)?.[1] ?? "";
            return {
              content: fixtureJson({
                heardPlayerBy: [speakerId],
                segments: [{ kind: "dialogue", speakerId, text: quote, heardBy: [speakerId] }],
                editApproval: { speakerId, proposalId, approved: true, quote },
              }),
              finishReason: "stop",
            };
          }
          if (system.includes("Answer as each affected villager")) {
            lastMailboxSystem = system;
            const people = JSON.parse(user).people as Array<{ id: string }>;
            return {
              content: fixtureJson({
                decisions: people.map((person) => ({
                  characterId: person.id,
                  accepted: mailboxAccept,
                  reply: mailboxAccept ? "That works for me." : "I would rather keep it as it is.",
                })),
              }),
              finishReason: "stop",
            };
          }
          if (user.startsWith("The player enters this space"))
            assert.ok(options.maxTokens <= 1_600, "a brief greeting cannot spend a full-turn output budget");
          if (system.includes("Distill one Scene")) {
            memoryCalls += 1;
            if (holdMemoryOnce) {
              holdMemoryOnce = false;
              signalMemoryStarted?.();
              await new Promise<void>((_resolve, reject) => {
                options.signal.addEventListener("abort", () => reject(new Error("memory aborted")), { once: true });
              });
            }
            _memoryInputChars += system.length + user.length;
            const evidence = JSON.parse(user);
            evidence.evidence = evidence.evidence.map(([lineId, part, role, speaker, text, heardBy]: any[]) => ({
              lineId,
              part,
              role,
              speaker,
              text,
              heardBy,
            }));
            memoryEvidence.push(evidence);
            if (saturateMemoryOnce) {
              saturateMemoryOnce = false;
              const content = JSON.stringify({ memories: [], more: true, complete: false });
              _memoryOutputChars += content.length;
              return { content, finishReason: "length" };
            }
            if (memoryCalls === failMemoryAtCall) throw new Error("memory chunk unavailable");
            if (failMemoryOnce) {
              failMemoryOnce = false;
              throw new Error("memory unavailable");
            }
            if (misattributeMemoryOnce) {
              misattributeMemoryOnce = false;
              const privateLine = evidence.evidence.find(
                (line: any) => line.heardBy.includes("bob") && !line.heardBy.includes("tina"),
              );
              return {
                content: fixtureJson({
                  memories: [
                    { characterId: "tina", text: "A secret Tina did not hear.", lineIds: [privateLine.lineId] },
                  ],
                  complete: true,
                }),
                finishReason: "stop",
              };
            }
            const content = JSON.stringify({
              memories: evidence.evidence.some((line: any) => line.heardBy.includes("tina"))
                ? [
                    {
                      characterId: "tina",
                      text: "Tina remembers the visit.",
                      lineIds: [evidence.evidence.find((line: any) => line.heardBy.includes("tina")).lineId],
                    },
                  ]
                : [],
              complete: true,
            });
            _memoryOutputChars += content.length;
            return { content, finishReason: "stop" };
          }
          if (system.includes("You adjudicate short-term conversational recollections")) {
            reviewCalls += 1;
            const input = JSON.parse(user);
            reviewBatches.push({
              firstText: input.recollections[0]?.text ?? "",
              count: input.recollections.length,
              outputLimit: options.maxTokens,
            });
            if (reviewCalls === failReviewAtCall) throw new Error(reviewFailureMessage);
            if (failReviewOnce) {
              failReviewOnce = false;
              throw new Error("review unavailable");
            }
            const responseMode = reviewResponseModes.shift();
            if (responseMode === "length") return { content: "{", finishReason: "length" };
            if (responseMode === "malformed") return { content: "{bad", finishReason: "stop" };
            return {
              content: fixtureJson({
                relationshipReview: {
                  changes: relationshipDecisions
                    ? ["warmth", "trust"].map((dimension) => ({
                        fromId: "bob",
                        toId: "player",
                        dimension,
                        strength: "minor",
                        direction: dimension === "warmth" ? "increase" : "decrease",
                        ordinary: dimension === "warmth",
                        reason: "A shared exchange affected company and confidence independently.",
                        lineIds: input.recollections[0].evidence.map((line: any) => line.id),
                        disclosed: false,
                      }))
                    : [],
                  permissions: [],
                  disclosures: [],
                },
                decisions: input.recollections.map((recollection: any) => ({
                  action:
                    recollection.text.includes("promised") || recollection.text.includes("kissed")
                      ? "promote"
                      : "reject",
                  indices: [recollection.index],
                  reason:
                    recollection.text.includes("promised") || recollection.text.includes("kissed")
                      ? "A distinct lasting event."
                      : "routine",
                  ...(recollection.text.includes("promised") || recollection.text.includes("kissed")
                    ? {
                        category: recollection.text.includes("promised") ? "commitment" : "shared-experience",
                        text: recollection.text,
                      }
                    : {}),
                })),
                complete: true,
              }),
              finishReason: "stop",
            };
          }
          if (system.includes("Find exact, short quotations")) {
            _wishScanCalls += 1;
            if (failWishScanOnce) {
              failWishScanOnce = false;
              throw new Error("wish scan unavailable");
            }
            const input = JSON.parse(user);
            return {
              content: fixtureJson({
                evidence: input.lines
                  .filter((line: any) => line.content.includes("important detail"))
                  .map((line: any) => ({ lineId: line.lineId, quote: "important detail" })),
                complete: true,
              }),
              finishReason: "stop",
            };
          }
          if (system.includes("Write a brief visual Events update")) {
            assert.match(system, /In Villages, a Village is a shared place/u);
            lastEventsSystem = system;
            assert.match(system, /Do not give them a new turn in an Event/u);
            return {
              content: fixtureJson({
                happenings: [
                  {
                    opportunityId: "opportunity-feature",
                    kind: "routine",
                    actorIds: creativeActorIds,
                    venueId: "park",
                    narration: "Bob tends the place.",
                  },
                ],
                memory: [],
                notices: [],
                featureEdits: featureProposal ? [featureProposal] : [],
              }),
              finishReason: "stop",
            };
          }
          if (system.includes("You narrate one action")) {
            assert.match(system, /The submitted action is the full extent of the player's choice/u);
            assert.match(system, /Do not invent their dialogue, a follow-up action or decision/u);
            const failed = user.includes("tries to: Fail to lift the wall");
            const lantern = user.includes("tries to: Set down a lantern");
            const note = user.includes("tries to: Leave a note for Tina");
            const spill = user.includes("tries to: Spill tea");
            const window = user.includes("tries to: Open the window");
            const cleanup = user.includes("tries to: Clean the spill");
            return {
              content: fixtureJson({
                happened: !failed,
                narration: failed
                  ? "The wall is too heavy to lift."
                  : lantern
                    ? "The player sets down a lantern."
                    : note
                      ? "The player leaves a note for Tina."
                      : spill
                        ? "The player spills tea on the floor."
                        : window
                          ? "The player opens the window."
                          : cleanup
                            ? "The player cleans the spill."
                            : "The player sets down a cup.",
                addItem: failed || note || spill || window || cleanup ? "" : lantern ? "lantern" : "cup",
                removeItem: "",
                traceKind: note ? "note" : spill ? "stain" : window ? "open-window" : "",
                traceText: note ? "Meet me by the bridge." : spill ? "a tea stain" : window ? "an open window" : "",
                recipientId: note ? "tina" : "",
                resolveTraceId: cleanup ? "trace:spill-action" : "",
              }),
              finishReason: "stop",
            };
          }
          if (!system.includes("You write one shared scene")) {
            _lastJudgeSystem = system;
            assert.match(user, /Has .* really done that/u);
            _wishJudgeCalls += 1;
            return {
              content: fixtureJson({
                fulfilled: true,
                wishId: "wish-tina",
                reason: "The deed happened.",
                memory: "Tina remembers the help.",
              }),
              finishReason: "stop",
            };
          }
          lastVenueSystem = system;
          venueReplyCalls += 1;
          if (sceneActionFixture)
            return {
              content: fixtureJson({
                heardPlayerBy: ["bob", "tina"],
                segments: [{ kind: "narration", text: "The physical outcome is confirmed.", heardBy: ["bob", "tina"] }],
                sceneChange: sceneActionFixture,
              }),
              finishReason: "stop",
            };
          if (user === "Hold concurrent scene") {
            concurrencyStarted?.();
            await new Promise<void>((resolve) => {
              releaseConcurrent = resolve;
            });
            return {
              content: fixtureJson({
                heardPlayerBy: ["bob", "tina"],
                segments: [
                  {
                    kind: "dialogue",
                    speakerId: "bob",
                    text: "We can take a moment together.",
                    heardBy: ["bob", "tina"],
                  },
                ],
              }),
              finishReason: "stop",
            };
          }
          if (
            [
              "Set down a cup",
              "Set down a lantern",
              "Fail to lift the wall",
              "Leave a note for Tina",
              "Spill tea",
              "Open the window",
              "Clean the spill",
            ].includes(user)
          ) {
            if (user === "Set down a lantern" && failActReplyOnce) {
              failActReplyOnce = false;
              throw new Error("action reply unavailable");
            }
            const alone = system.includes("Nobody is present.");
            const failed = user === "Fail to lift the wall";
            const lantern = user === "Set down a lantern";
            const note = user === "Leave a note for Tina";
            const spill = user === "Spill tea";
            const window = user === "Open the window";
            const cleanup = user === "Clean the spill";
            const narration = failed
              ? "The wall is too heavy to lift."
              : lantern
                ? "The player sets down a lantern."
                : note
                  ? "The player leaves a note for Tina."
                  : spill
                    ? "The player spills tea on the floor."
                    : window
                      ? "The player opens the window."
                      : cleanup
                        ? "The player cleans the spill."
                        : "The player sets down a cup.";
            const text = quietActReplyOnce && lantern ? "Bob makes room for the lantern on the table." : narration;
            quietActReplyOnce = false;
            return {
              content: fixtureJson({
                heardPlayerBy: alone ? [] : ["bob", "tina"],
                segments: [{ kind: "narration", text, heardBy: alone ? [] : ["bob", "tina"] }],
                ...(!failed
                  ? {
                      sceneChange: {
                        happened: true,
                        narration,
                        addItem: note || spill || window || cleanup ? "" : lantern ? "lantern" : "cup",
                        traceKind: note ? "note" : spill ? "stain" : window ? "open-window" : "",
                        traceText: note
                          ? "Meet me by the bridge."
                          : spill
                            ? "a tea stain"
                            : window
                              ? "an open window"
                              : "",
                        recipientId: note ? "tina" : "",
                        resolveTraceId: cleanup ? "trace:spill-action" : "",
                      },
                    }
                  : {}),
              }),
              finishReason: "stop",
            };
          }
          if (system.includes("Nobody is present."))
            return {
              content: fixtureJson({
                heardPlayerBy: [],
                segments: [{ kind: "narration", text: "The empty room stays quiet.", heardBy: [] }],
              }),
              finishReason: "stop",
            };
          if (user.startsWith("The player enters this space") && failGreetingOnce) {
            failGreetingOnce = false;
            throw new Error("greeting unavailable");
          }
          if (user.startsWith("The player enters this space") && holdGreetingOnce) {
            holdGreetingOnce = false;
            return new Promise((resolve) => {
              releaseHeldGreeting = () =>
                resolve({
                  content: fixtureJson({
                    heardPlayerBy: [],
                    segments: [{ kind: "dialogue", speakerId: "bob", text: "A late hello.", heardBy: ["bob"] }],
                  }),
                  finishReason: "stop",
                });
              greetingStarted?.();
            });
          }
          if (user.startsWith("The player enters this space") && malformedGreetingOnce) {
            malformedGreetingOnce = false;
            return {
              content: fixtureJson({
                heardPlayerBy: ["outsider"],
                segments: [
                  {
                    kind: "whisper",
                    speakerId: "tina",
                    targetId: "unavailable target",
                    text: "Welcome.",
                    heardBy: ["outsider"],
                    expression: "a very long expression that should be bounded rather than fail the visit",
                  },
                ],
              }),
              finishReason: "stop",
            };
          }
          if (user.startsWith("The player enters this space") && emptyOpeningFailures > 0) {
            emptyOpeningFailures -= 1;
            return { content: fixtureJson({ heardPlayerBy: [], segments: [] }), finishReason: "stop" };
          }
          if (user.startsWith("The player enters this space") && openingSegmentsOnce) {
            const segments = openingSegmentsOnce;
            openingSegmentsOnce = null;
            return { content: fixtureJson({ heardPlayerBy: [], segments }), finishReason: "stop" };
          }
          if (user === "Fail once" && failReplyOnce) {
            failReplyOnce = false;
            throw new Error("reply unavailable");
          }
          if (user === "Set down a lantern" && failActReplyOnce) {
            failActReplyOnce = false;
            throw new Error("action reply unavailable");
          }
          if (user === "Set down a lantern" && quietActReplyOnce) {
            quietActReplyOnce = false;
            return {
              content: fixtureJson({
                heardPlayerBy: ["bob", "tina"],
                segments: [{ kind: "narration", text: "Bob makes room for the lantern on the table." }],
              }),
              finishReason: "stop",
            };
          }
          if (user === "How are you doing?" && narrationOnlyOnce) {
            narrationOnlyOnce = false;
            return {
              content: fixtureJson({
                heardPlayerBy: ["bob", "tina"],
                segments: [{ kind: "narration", text: "Tina glanced over.", heardBy: ["bob", "tina"] }],
              }),
              finishReason: "stop",
            };
          }
          if (user === "Still no answer")
            return {
              content: fixtureJson({
                heardPlayerBy: ["bob", "tina"],
                segments: [{ kind: "narration", text: "No one spoke.", heardBy: ["bob", "tina"] }],
              }),
              finishReason: "stop",
            };
          if (user === "No scene moment")
            return { content: fixtureJson({ heardPlayerBy: ["tina"], segments: [] }), finishReason: "stop" };
          if (user === "Ask me about myself")
            return {
              content: fixtureJson({
                heardPlayerBy: ["bob", "tina"],
                segments: [{ kind: "dialogue", speakerId: "bob", text: "What about you?", heardBy: ["bob", "tina"] }],
              }),
              finishReason: "stop",
            };
          if (user === "I actually don't remember anything. Funny, huh?")
            return {
              content: fixtureJson({
                heardPlayerBy: ["bob", "tina"],
                segments: acceptEcho
                  ? [
                      {
                        kind: "dialogue",
                        speakerId: "bob",
                        text: "That sounds disorienting. I can listen.",
                        heardBy: ["bob", "tina"],
                      },
                    ]
                  : [
                      {
                        kind: "dialogue",
                        speakerId: "tina",
                        text: "Yeah — what about you? We've both done our bit.",
                        heardBy: ["bob", "tina"],
                      },
                      {
                        kind: "dialogue",
                        speakerId: "bob",
                        text: "I actually don't remember anything. Funny, huh?",
                        heardBy: ["bob", "tina"],
                      },
                    ],
              }),
              finishReason: "stop",
            };
          if (user === "I don't remember where I came from.")
            return {
              content: fixtureJson({
                heardPlayerBy: ["bob", "tina"],
                segments: [
                  {
                    kind: "dialogue",
                    speakerId: "tina",
                    text: acceptRepeatedQuestion
                      ? "That sounds unsettling. Do you want to tell us more?"
                      : "Yeah — what about you? We've both done our bit.",
                    heardBy: ["bob", "tina"],
                  },
                ],
              }),
              finishReason: "stop",
            };
          if (user === "Blank once" && blankTurnOnce) {
            blankTurnOnce = false;
            return { content: "", finishReason: "stop" };
          }
          if (user === "Malformed once" && malformedTurnOnce) {
            malformedTurnOnce = false;
            return { content: "{not json", finishReason: "stop" };
          }
          if (user === "Always echo this long player statement" && exhaustEcho)
            return {
              content: fixtureJson({
                heardPlayerBy: ["bob", "tina"],
                segments: [{ kind: "dialogue", speakerId: "bob", text: user, heardBy: ["bob", "tina"] }],
                sceneChange: { happened: true, narration: "A chair moves.", sceneNote: "A chair moves." },
              }),
              finishReason: "stop",
            };
          if (user === "Place an intricately carved silver bowl on the table")
            return {
              content: fixtureJson({
                heardPlayerBy: ["bob", "tina"],
                segments: [{ kind: "dialogue", speakerId: "bob", text: user, heardBy: ["bob", "tina"] }],
              }),
              finishReason: "stop",
            };
          if (user === "Wait outside quietly" || user === "Look around the Private Space")
            return {
              content: fixtureJson({
                heardPlayerBy: user === "Wait outside quietly" ? [] : ["bob"],
                segments: [{ kind: "narration", text: "Bob continues mending the torn cloth." }],
              }),
              finishReason: "stop",
            };
          if (user === "A lively scene")
            return {
              content: fixtureJson({
                heardPlayerBy: ["bob", "tina"],
                segments: [
                  {
                    kind: "narration",
                    text: "The room quiets.",
                    heardBy: ["bob", "tina"],
                    staging: [
                      {
                        characterId: "bob",
                        position: "right",
                        expression: "e-123e4567-e89b-42d3-a456-426614174000",
                        look: { target: "direction", direction: "left" },
                      },
                      { characterId: "tina", position: "center", expression: "e-123e4567-e89b-42d3-a456-426614174000" },
                    ],
                  },
                  {
                    kind: "dialogue",
                    speakerId: "tina",
                    text: "Did you hear that?",
                    heardBy: ["bob", "tina"],
                    expression: "surprised",
                  },
                  { kind: "side", speakerId: "bob", text: "I did.", heardBy: ["bob"], expression: "thinking" },
                  { kind: "whisper", speakerId: "tina", targetId: "bob", text: "Stay close.", heardBy: ["tina"] },
                ],
                departures: [],
                sceneEnded: false,
              }),
              finishReason: "stop",
            };
          if (
            [
              "I fixed the ceiling drip",
              "I moved the tables",
              "I tell Bob I moved the tables",
              "I lift the wall",
            ].includes(user)
          ) {
            const sceneChange =
              user === "I fixed the ceiling drip"
                ? {
                    happened: true,
                    narration: "The player repaired the ceiling drip.",
                    conditionBefore: "a ceiling drip",
                    conditionAfter: "a dry ceiling",
                    resolveTraceId: "trace:drip",
                  }
                : user === "I moved the tables"
                  ? {
                      happened: true,
                      narration: "The player moved the tables aside.",
                      sceneNote: "The tables stand beside the wall.",
                    }
                  : undefined;
            return {
              content: fixtureJson({
                heardPlayerBy: ["bob", "tina"],
                segments: [
                  {
                    kind: "dialogue",
                    speakerId: "bob",
                    text: sceneChange ? "That helps." : "I hear you.",
                    heardBy: ["bob", "tina"],
                  },
                ],
                ...(sceneChange ? { sceneChange } : {}),
                ...(system.includes("Also return recap") ? { recap: "Bob and Tina discussed the visit." } : {}),
              }),
              finishReason: "stop",
            };
          }
          if (user === "Live commitment") {
            const result = {
              heardPlayerBy: ["bob"],
              segments: [
                {
                  kind: "dialogue",
                  speakerId: "bob",
                  text: "I will bring seedlings when we plant together.",
                  heardBy: ["bob"],
                },
              ],
              memoryChanges: [
                {
                  kind: "durable",
                  category: "commitment",
                  text: "Bob will bring seedlings for planting together.",
                  subjectCharacterIds: ["bob"],
                  knownByCharacterIds: ["bob"],
                  evidence: [0],
                  memoryIds: [],
                },
              ],
              relationshipChanges: { changes: [], permissions: [], disclosures: [] },
              wishChanges: [],
            };
            return { content: fixtureJson(result), finishReason: "stop" };
          }
          if (user === "Live truncated metadata")
            return {
              content:
                '{"heardPlayerBy":["bob"],"segments":[{"kind":"dialogue","speakerId":"bob","text":"Let us keep talking about those seedlings.","heardBy":["bob"]}],"wishChanges":[],"memoryChanges":[{"text":"cut',
              finishReason: "length",
            };
          if (user === "Remember the bridge")
            return {
              content: fixtureJson({
                heardPlayerBy: ["bob"],
                segments: [
                  {
                    kind: "dialogue",
                    speakerId: "bob",
                    text: "I will remember your promise about the bridge.",
                    heardBy: ["bob"],
                  },
                ],
                recollections: [
                  {
                    text: "The player promised Bob to help with the bridge.",
                    subjectCharacterIds: ["bob"],
                    knownByCharacterIds: ["bob"],
                    evidence: ["player", 0],
                  },
                  {
                    text: "Tina heard a private promise.",
                    subjectCharacterIds: ["tina"],
                    knownByCharacterIds: ["tina"],
                    evidence: ["player"],
                  },
                ],
              }),
              finishReason: "stop",
            };
          if (user === "A promise and four kisses") {
            const everyone = ["bob", "tina", "cora", "dan"];
            return {
              content: fixtureJson({
                heardPlayerBy: everyone,
                segments: [
                  {
                    kind: "dialogue",
                    speakerId: "bob",
                    text: "That is an unforgettable morning.",
                    heardBy: everyone,
                  },
                ],
                recollections: [
                  {
                    text: "The player promised Bob, Tina, Cora, and Dan twenty million dollars.",
                    subjectCharacterIds: everyone,
                    knownByCharacterIds: everyone,
                    evidence: ["player", 0],
                  },
                  ...everyone.map((characterId) => ({
                    text: `The player kissed ${characterId} on the lips.`,
                    subjectCharacterIds: [characterId],
                    knownByCharacterIds: everyone,
                    evidence: ["player", 0],
                  })),
                ],
              }),
              finishReason: "stop",
            };
          }
          if (user === "Review failure promise")
            return {
              content: fixtureJson({
                heardPlayerBy: ["bob"],
                segments: [
                  {
                    kind: "dialogue",
                    speakerId: "bob",
                    text: "I will hold you to the red umbrella.",
                    heardBy: ["bob"],
                  },
                ],
                recollections: [
                  {
                    text: "The player promised Bob a red umbrella.",
                    subjectCharacterIds: ["bob"],
                    knownByCharacterIds: ["bob"],
                    evidence: ["player", 0],
                  },
                ],
              }),
              finishReason: "stop",
            };
          if (user === "Bob asks to move") {
            const quote = "May I move to the empty room?";
            return {
              content: fixtureJson({
                heardPlayerBy: ["bob"],
                segments: [{ kind: "dialogue", speakerId: "bob", text: quote, heardBy: ["bob"] }],
                residenceRequest: { speakerId: "bob", venueId: "empty", quote },
              }),
              finishReason: "stop",
            };
          }
          if (user === "Bob says goodbye" || user === "Tina says goodbye") {
            const speakerId = user.startsWith("Bob") ? "bob" : "tina";
            const quote = "I am heading out now.";
            return {
              content: fixtureJson({
                heardPlayerBy: [speakerId],
                segments: [{ kind: "dialogue", speakerId, text: quote, heardBy: [speakerId] }],
                departures: [{ speakerId, quote }],
              }),
              finishReason: "stop",
            };
          }
          if (user === "Everyone says goodbye") {
            const quote = "We are all closing up and heading home.";
            return {
              content: fixtureJson({
                heardPlayerBy: ["bob", "tina"],
                segments: [{ kind: "dialogue", speakerId: "bob", text: quote, heardBy: ["bob", "tina"] }],
                sceneEnded: { speakerId: "bob", quote },
              }),
              finishReason: "stop",
            };
          }
          const cast = system.match(/The residents currently here are: ([^.]+)\./u)?.[1] ?? "";
          const hasBob = cast.includes("bob");
          const speakerId = system.includes("Intended target: tina") ? "tina" : hasBob ? "bob" : "tina";
          let departures: string[] = [];
          let sceneEnded = false;
          let heardBy = hasBob ? ["bob"] : ["tina"];
          if (user === "Bob heads away") {
            departures = ["bob"];
            heardBy = ["bob", "tina"];
          }
          if (user === "Tina heads away") departures = ["tina"];
          if (user === "A natural goodbye") sceneEnded = true;
          return {
            content: fixtureJson({
              heardPlayerBy: user.startsWith("The player is already inside") ? [] : heardBy,
              lines: [
                {
                  speakerId: user === "Tina heads away" ? "tina" : speakerId,
                  text: user.startsWith("The player is already inside")
                    ? "Welcome."
                    : user === "The player leaves without saying anything."
                      ? "Take care on your way out."
                      : "I hear you.",
                  heardBy,
                },
              ],
              departures,
              sceneEnded,
            }),
            finishReason: "stop",
          };
        },
      };
    },
  },
} as any);

const now = new Date();
const dateKey = agendaDateKey(now);
const weekday = now.toLocaleDateString("en-US", { weekday: "long" });
const venue = (id: string) => ({
  id,
  name: id,
  form: "a shared meeting place",
  description: `A quiet meeting place in ${id}.`,
  category: "public",
  presentation: { image: null, x: 0.5, y: 0.5 },
  occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
  capabilities: [],
  state: { condition: "quiet", upgrades: [], furniture: [], publicFacts: [], updatedAt: "" },
});
const card = (id: string) => ({
  id,
  revision: 1,
  sourceStatus: "available",
  name: id,
  capturedAt: now.toISOString(),
  comment: "",
  summary: "",
  tags: [],
  systemPrompt: "",
  description: "",
  personality: "",
  scenario: "",
  backstory: "",
  appearance: "",
  exampleDialogue: "",
});
const agenda = (placeId: string, wishes: any[] = []) => ({
  wishes,
  routineSummary: "",
  source: "village",
  generatedAt: now.toISOString(),
  day: [{ startMinute: 0, endMinute: 1440, venueId: placeId, activity: "passing the time" }],
  activeDay: {
    dateKey,
    weekday,
    scheduleInformed: false,
    blocks: [{ startMinute: 0, endMinute: 1440, venueId: placeId, activity: "passing the time", status: "online" }],
  },
});

async function main() {
  try {
    const sampleHistory = [
      { role: "user" as const, name: "", speakerId: "", content: "Discarded prior player turn", heardBy: ["bob"] },
      {
        role: "assistant" as const,
        name: "Bob",
        speakerId: "bob",
        kind: "dialogue" as const,
        content: "Discarded reply.",
        heardBy: ["bob"],
      },
      { role: "user" as const, name: "", speakerId: "", content: "Older player turn", heardBy: ["bob"] },
      {
        role: "assistant" as const,
        name: "Narration",
        speakerId: "__venue_scene__",
        kind: "narration" as const,
        content: "Old scene.",
        heardBy: ["bob"],
      },
      { role: "user" as const, name: "", speakerId: "", content: "Where are you from?", heardBy: ["bob"] },
      {
        role: "assistant" as const,
        name: "Bob",
        speakerId: "bob",
        kind: "dialogue" as const,
        content: "Mecca. What about you?",
        heardBy: ["bob"],
      },
      {
        role: "assistant" as const,
        name: "Narration",
        speakerId: "__venue_scene__",
        kind: "narration" as const,
        content: "Bob looks at the fire.",
        heardBy: ["bob"],
      },
      {
        role: "user" as const,
        name: "",
        speakerId: "",
        content: "I actually don't remember anything. Funny, huh?",
        heardBy: ["bob"],
      },
    ];
    const history = venueSceneHistory(sampleHistory, "Legitimate Businessperson");
    assert.match(history, /PLAYER Legitimate Businessperson: I actually don't remember anything/u);
    assert.match(history, /RESIDENT Bob \(bob\): Mecca\. What about you\?/u);
    assert.match(history, /SCENE: Bob looks at the fire\./u);
    assert.match(history, /SCENE: Old scene\./u);
    assert.ok(
      history.indexOf("SCENE: Old scene.") < history.indexOf("PLAYER Legitimate Businessperson: Where are you from?") &&
        history.indexOf("Mecca. What about you?") < history.indexOf("SCENE: Bob looks at the fire."),
      "narration and dialogue keep their chronological positions",
    );
    assert.doesNotMatch(history, /Discarded prior player turn|Discarded reply/u);
    const longHistory = Array.from({ length: 30 }, (_, index) => ({
      ...sampleHistory[5]!,
      content: `Reply ${index}: ${"x".repeat(500)}`,
    }));
    assert.ok(venueSceneHistory(longHistory, "Visitor").length <= 3_500);
    assert.deepEqual(
      parseVenueReply(
        {
          heardPlayerBy: ["bob"],
          segments: [
            { kind: "dialogue", speakerId: "bob", text: "Yes.", heardBy: ["bob"] },
            { kind: "narration", text: "Bob returns to the workbench.", heardBy: ["bob"] },
            {
              kind: "dialogue",
              speakerId: "bob",
              text: "I had more to say about that, once I found the right words.",
              heardBy: ["bob"],
            },
          ],
        },
        ["bob"],
      ).lines.map((line) => line.kind),
      ["dialogue", "narration", "dialogue"],
      "short speech, longer speech, and mixed scene prose remain valid without a style quota",
    );
    assert.equal(
      venueReplyIntegrity(sampleHistory.at(-1)!.content, sampleHistory.slice(0, -1), [
        { kind: "dialogue", content: "I actually don't remember anything. Funny, huh?" },
      ]),
      "player-echo",
    );
    assert.equal(
      venueReplyIntegrity(sampleHistory.at(-1)!.content, sampleHistory.slice(0, -1), [
        { kind: "dialogue", content: "Yeah — what about you? We've both done our bit." },
      ]),
      "repeated-question",
    );
    assert.equal(
      venueReplyIntegrity(sampleHistory.at(-1)!.content, sampleHistory.slice(0, -1), [
        { kind: "dialogue", content: "That sounds disorienting. I can listen." },
      ]),
      null,
    );
    assert.equal(
      venueReplyIntegrity("Are you all right?", [], [{ kind: "dialogue", content: "Yes, I'm here." }]),
      null,
    );
    assert.equal(venueReplyIntegrity("I wait.", [], [{ kind: "narration", content: "Bob closes the door." }]), null);
    assert.equal(
      venueReplyIntegrity(
        "I wait.",
        [],
        [
          { kind: "dialogue", content: "Give me a moment." },
          { kind: "dialogue", content: "I'll be here too." },
        ],
      ),
      null,
    );
    await mutateVillageState((state) => {
      state.name = "Fixture village";
      state.playerRole = { ...DEFAULT_PLAYER_ROLE };
      state.setupAt = now.toISOString();
      state.foundedAt = now.toISOString();
      state.setting = "A quiet village";
      state.venues = [venue("park"), venue("empty")];
      state.venues[0]!.classes = ["workplace"];
      state.venues[0]!.state.publicFacts = ["The old gate opens at sunrise."];
      state.venues[0]!.state.features = [
        { id: "old-gate", text: "A weathered iron gate", sourceCharacterId: "", locked: false, updatedAt: "" },
      ];
      state.venues[1]!.classes = ["residence"];
      state.villagers = [
        {
          characterId: "bob",
          cardSnapshot: card("bob"),
          agenda: agenda("park"),
          addedAt: now.toISOString(),
          ingestSchedule: false,
        },
        {
          characterId: "tina",
          cardSnapshot: card("tina"),
          agenda: agenda("park", [
            {
              id: "wish-tina",
              wish: "help with a parcel",
              intensity: 1,
              tell: "",
              addedAt: now.toISOString(),
              expiresAt: "",
            },
          ]),
          addedAt: now.toISOString(),
          ingestSchedule: false,
        },
      ] as any;
      state.venues[0]!.state.furniture = ["old armchair"];
    });
    const features = Array.from({ length: 5 }, (_, index) => ({
      id: `draft-${index}`,
      text: `Feature ${index + 1}`,
      locked: index === 0 || index === 1,
    }));
    await mutateVillageState((state) => {
      const park = state.venues.find((place) => place.id === "park")!;
      park.workerIds = ["bob"];
      park.state.features = features;
    });
    let park = (await readVillageState()).venues.find((place) => place.id === "park")!;
    assert.equal(park.state.features?.length, 5);
    assert.deepEqual(park.state.furniture, ["old armchair"], "ordinary furniture is never squeezed into feature slots");
    assert.deepEqual(park.workerIds, ["bob"]);
    await assert.rejects(
      () => updateVillageVenue("park", { state: { features: [...features, { text: "Sixth" }] } }),
      /only name and description/u,
    );
    await assert.rejects(() => updateVillageVenue("park", { workerIds: ["outsider"] }), /only name and description/u);
    const lockedId = park.state.features![0]!.id;
    await assert.rejects(
      () =>
        updateVillageVenue("park", {
          state: {
            features: park.state.features?.map((feature) =>
              feature.id === lockedId
                ? { ...feature, text: "Player replaced the first feature", locked: false }
                : feature,
            ),
          },
        }),
      /only name and description/u,
    );
    park = (await readVillageState()).venues.find((place) => place.id === "park")!;
    assert.equal(park.state.features?.[0]?.id, lockedId, "blocked edits keep a feature's stable identity");
    assert.equal(park.state.features?.[0]?.locked, true, "the editor cannot unlock a physical feature");
    await mutateVillageState((state) => {
      state.venues.find((venue) => venue.id === "empty")!.occupancy.playerHome = true;
    });
    const empty = await enterVenue("empty");
    assert.equal(empty.status, "active", "an empty visit has a durable session");
    assert.deepEqual(empty.participants, []);
    assert.equal(calls, 0);
    const emptyChat = await measured("ordinary-chat", () =>
      sendVenueTurn({
        sessionId: empty.id,
        message: "Hello",
        mode: "chat",
        targetId: "",
        submissionId: "empty-chat",
      }),
    );
    assert.equal(emptyChat.session.lines.at(-1)?.content, "The empty room stays quiet.");
    assert.equal(calls, 1, "empty Chat uses one scene narration call");
    const emptyAction = await sendVenueTurn({
      sessionId: empty.id,
      message: "Set down a cup",
      mode: "act",
      targetId: "",
      submissionId: "empty-action",
    });
    assert.equal(emptyAction.action?.happened, true);
    assert.equal(emptyAction.session.lines.at(-1)?.content, "The player sets down a cup.");
    await endVenueSession(empty.id);
    await mutateVillageState((state) => {
      state.venues.find((venue) => venue.id === "empty")!.occupancy.playerHome = false;
    });
    assert.equal((await listVenueVisits({ placeId: "empty" })).length, 1);
    await mutateVillageState((state) => {
      const moment = deriveVillageMoment({ foundedAt: state.foundedAt, seed: state.seed, now });
      state.happenings.unshift({
        id: "legacy-visual-only",
        kind: "weather",
        actorIds: [],
        venueId: "park",
        dayIndex: moment.dayIndex,
        clock: moment.dayPhase,
        occurredAt: moment.instant,
        timePrecision: "exact",
        sourceOpportunityId: "old",
        narration: "LEGACY_EVENT_POISON drip",
        text: "LEGACY_EVENT_POISON drip",
      });
      state.chronicle.unshift({
        id: "legacy-tick-memory",
        kind: "tick",
        scope: "village",
        actors: [],
        dayIndex: moment.dayIndex,
        clock: moment.dayPhase,
        occurredAt: moment.instant,
        timePrecision: "exact",
        text: "LEGACY_EVENT_POISON memory",
      });
      state.noticeboard.push({ author: "Buster", text: "LEGACY_EVENT_POISON notice" });
    });
    const undiscoveredPark = (await buildVillageSnapshot()).settings.venues.find((place) => place.id === "park")!;
    assert.equal(undiscoveredPark.state.condition, "", "initial condition stays hidden before a public visit");
    assert.deepEqual(undiscoveredPark.state.publicFacts, []);
    assert.deepEqual(undiscoveredPark.state.features, []);
    const callsAfterEmpty = calls;
    let group = (await enterVenue("park"))!;
    const discoveredPark = (await buildVillageSnapshot()).settings.venues.find((place) => place.id === "park")!;
    assert.equal(discoveredPark.state.condition, "quiet", "the first public visit reveals initial condition");
    assert.deepEqual(discoveredPark.state.publicFacts, ["The old gate opens at sunrise."]);
    assert.ok(discoveredPark.state.features?.[0]?.text, "the first public visit reveals features");
    assert.equal(group.status, "opening", "Go inside returns the venue before greeting generation");
    assert.equal(calls, callsAfterEmpty, "entry itself spends no model call");
    assert.equal((await activeVenueSession())?.status, "opening", "reload restores the opening room without blocking");
    group = await greetVenue(group.id);
    assert.ok(
      lastVenueSystem.includes(renderPlayerRoleWritingContext(await readVillageState())),
      "venue greetings know the recognized role",
    );
    assert.doesNotMatch(
      lastVenueSystem,
      /LEGACY_EVENT_POISON/u,
      "legacy visual Events, tick memories, and resident notices cannot ground a scene",
    );
    assert.ok(
      (await readVillageState()).happenings.some((entry) => entry.id === "legacy-visual-only"),
      "the old visual entry remains readable without affecting the scene",
    );
    assert.equal((await readVillageWriting()).writingGuidance, "");
    assert.equal((await readVillageWriting()).writingGuidanceMaxLength, WRITING_GUIDANCE_MAX_LENGTH);
    assert.match(lastVenueSystem, /Write narration segments.*present tense/u);
    assert.match(lastVenueSystem, /Address the player as "you"/u);
    assert.match(lastVenueSystem, /Content rating: SFW/u);
    assert.ok(
      lastVenueSystem.startsWith("## Writing direction\n\n" + VENUE_SCENE_WRITING_FOUNDATION),
      "fixed scene rules survive context fitting in the writing section",
    );
    assert.match(lastVenueSystem, /dialogue alone may be the complete reply/u);
    assert.doesNotMatch(lastVenueSystem, /Grounded, concise slice-of-life prose/u);
    assert.match(lastVenueSystem, /moment already underway/u);
    assert.doesNotMatch(
      lastVenueSystem,
      /Alternate narration and speakers|Every player speech turn needs spoken dialogue/u,
    );
    assert.equal(defaultVillageState().sendOnEnter, false);
    assert.equal(coerceVillageState({ wishSystemVersion: 3 }).sendOnEnter, false);
    assert.equal(coerceVillageState({ wishSystemVersion: 3, sendOnEnter: "true" }).sendOnEnter, false);
    assert.equal((await setVillageSendOnEnter(true)).settings.sendOnEnter, true);
    assert.equal((await readVillageState()).sendOnEnter, true);
    assert.equal((await setVillageSendOnEnter(false)).settings.sendOnEnter, false);
    await assert.rejects(() => setVillageSendOnEnter("true"), /must be on or off/u);
    assert.deepEqual(coerceVillageState({ wishSystemVersion: 3 }).narrationStyle, defaultVillageState().narrationStyle);
    assert.deepEqual(
      coerceVillageState({
        wishSystemVersion: 3,
        narrationStyle: {
          tense: "past",
          person: "first",
          rating: "nsfw",
          styleInstructions: "OLD STYLE",
          replyGuidanceOverride: "OLD REPLY GUIDANCE",
        },
      }).narrationStyle,
      { tense: "past", person: "first", rating: "nsfw", writingGuidance: "" },
      "older custom text is ignored while the independent writing choices remain",
    );
    records.set(key("villages", "villages-narration"), {
      packageId: "villages",
      id: "villages-narration",
      kind: "settings",
      revision: 1,
      data: { presetId: "obsolete-preset", voiceGuidance: "LEGACY GUIDANCE", replyLength: "preset" },
    });
    await saveVillageWriting({
      tense: "past",
      person: "third",
      rating: "nsfw",
      writingGuidance: "Plain and dry scene prose. Let residents speak in their own rhythm.",
    });
    assert.equal(
      (await readVillageWriting()).writingGuidance,
      "Plain and dry scene prose. Let residents speak in their own rhythm.",
    );
    await assert.rejects(() => saveVillageWriting({ tense: "future" }), /Choose present or past/u);
    await assert.rejects(
      () => saveVillageWriting({ writingGuidance: "x".repeat(WRITING_GUIDANCE_MAX_LENGTH + 1) }),
      /Additional writing guidance is too long/u,
    );
    await assert.rejects(() => saveVillageWriting({ writingGuidance: null }), /must be text/u);
    await assert.rejects(() => resetVenueSessions(), /Finish the active Scene/u);
    assert.deepEqual(group.activeIds, ["bob", "tina"]);
    assert.equal(calls, callsAfterEmpty + 1, "one opening call writes one shared scene");
    const sceneBeforeRace = (await activeVenueSession())!;
    const providerStarted = new Promise<void>((resolve) => {
      concurrencyStarted = resolve;
    });
    const raceInput = {
      sessionId: group.id,
      submissionId: "coordinated-once",
      message: "Hold concurrent scene",
      mode: "chat" as const,
      targetId: "",
      expectedSceneRevision: sceneBeforeRace.sceneRevision,
    };
    const raceCalls = calls;
    const ownedTurn = sendVenueTurnRaw(raceInput);
    await providerStarted;
    const identicalTurn = sendVenueTurnRaw(raceInput);
    for (const mode of ["chat", "fulfill", "act", "leave"] as const) {
      await assert.rejects(
        () =>
          sendVenueTurnRaw({
            ...raceInput,
            submissionId: `competing-${mode}`,
            mode,
            targetId: mode === "fulfill" ? "bob" : "",
          }),
        (error: any) => error.code === "SCENE_BUSY",
      );
    }
    await assert.rejects(
      () => closeVenueSessionWithReceipts(group.id, sceneBeforeRace.sceneRevision),
      (error: any) => error.code === "SCENE_BUSY",
    );
    await touchVenueSession(group.id);
    assert.equal(
      (await activeVenueSession())!.lines.length,
      sceneBeforeRace.lines.length,
      "snapshot and activity do not mutate the admitted transcript",
    );
    assert.equal(calls, raceCalls + 1, "competing submissions do not spend judgement, action, or reply calls");
    releaseConcurrent!();
    const [firstRace, secondRace] = await Promise.all([ownedTurn, identicalTurn]);
    assert.equal(firstRace.session.lines.length, secondRace.session.lines.length);
    assert.equal(firstRace.session.submissions.filter((entry) => entry.id === raceInput.submissionId).length, 1);
    const afterRaceCalls = calls;
    await assert.rejects(
      () => sendVenueTurnRaw({ ...raceInput, submissionId: "stale-scene", message: "Old-tab draft" }),
      (error: any) => error.code === "SCENE_STALE",
    );
    assert.equal(calls, afterRaceCalls, "a stale tab is refused before provider dispatch");
    await sendVenueTurnRaw(raceInput);
    assert.equal(calls, afterRaceCalls, "completed identical retries ignore their old scene revision");
    concurrencyStarted = null;
    releaseConcurrent = null;

    await sendVenueTurn({
      sessionId: group.id,
      message: "What new venue do we need?",
      mode: "chat",
      targetId: "",
      submissionId: "spoken-power-plant-request",
    });
    const requestedPlant = (await readVillageState()).pendingDecisions.find(
      (entry) => entry.kind === "venue" && entry.venueDraft?.name === "Power Plant",
    );
    assert.equal(requestedPlant?.requesterCharacterId, "bob", "a quoted live request is durable");
    assert.equal(
      (await readVillageState()).venues.some((venue) => venue.name === "Power Plant"),
      false,
    );
    assert.equal((await activeVenueSession())?.id, group.id, "reload restores the same active Scene");
    await assert.rejects(() => enterVenue("empty"), /Finish the Scene/u);

    const beforeAskedCalls = venueReplyCalls;
    const asked = await sendVenueTurn({
      sessionId: group.id,
      message: "A quiet question",
      mode: "ask",
      targetId: "bob",
      submissionId: "ask-1",
    });
    assert.equal(venueReplyCalls - beforeAskedCalls, 1, "additional guidance adds no model call");
    assert.match(lastVenueSystem, /Plain and dry scene prose/u);
    assert.match(lastVenueSystem, /Write narration segments.*past tense/u);
    assert.match(lastVenueSystem, /Refer to the player in scene prose/u);
    assert.match(lastVenueSystem, /Content rating: NSFW/u);
    assert.equal(
      lastVenueSystem.match(/Plain and dry scene prose\. Let residents speak in their own rhythm\./gu)?.length,
      1,
      "the optional guidance is sent once",
    );
    assert.match(lastVenueSystem, /Character dialogue retains its authored voice/u);
    assert.doesNotMatch(lastVenueSystem, /LEGACY GUIDANCE|obsolete-preset/u);
    await saveVillageWriting({
      tense: "present",
      person: "second",
      rating: "sfw",
      writingGuidance: "",
    });
    assert.equal((await readVillageWriting()).writingGuidance, "");
    assert.equal(asked.session.lines.at(-2)?.heardBy.join(), "bob", "targeting can keep a line from a bystander");
    assert.equal(asked.session.lines.at(-1)?.speakerId, "bob");
    assert.ok(
      asked.session.heardHistory
        .find((person) => person.characterId === "bob")
        ?.lineIds.includes(asked.session.lines.at(-2)!.id),
    );
    assert.ok(
      !asked.session.heardHistory
        .find((person) => person.characterId === "tina")
        ?.lineIds.includes(asked.session.lines.at(-2)!.id),
    );
    await saveVillageWriting({ person: "first" });
    await mutateVillageState((state) => {
      state.villagers.find((person) => person.characterId === "bob")!.spriteManager = {
        version: 1,
        artwork: [
          {
            id: "a-123e4567-e89b-42d3-a456-426614174000",
            assetId: "villages-123e4567-e89b-42d3-a456-426614174000",
            name: "Quiet.png",
            origin: "upload",
            source: {
              filename: "original.png",
              url: "/api/sprites/villages-123e4567-e89b-42d3-a456-426614174000/file/original.png",
              width: 1024,
              height: 1536,
              sha256: "a".repeat(64),
            },
            rendered: {
              filename: "quiet.png",
              url: "/api/sprites/villages-123e4567-e89b-42d3-a456-426614174000/file/quiet.png",
            },
            frame: { x: 0, y: 0, width: 1024, height: 1536, scale: 1, offsetX: 0, offsetY: 0 },
            warnings: [],
          },
        ],
        expressions: [{ id: "e-123e4567-e89b-42d3-a456-426614174000", name: "Quiet", useWhen: "Quietly reacting." }],
        assignments: [
          {
            expressionId: "e-123e4567-e89b-42d3-a456-426614174000",
            view: "front",
            artworkId: "a-123e4567-e89b-42d3-a456-426614174000",
          },
        ],
        defaultExpressionId: "e-123e4567-e89b-42d3-a456-426614174000",
        framing: { mode: "full" },
      };
    });
    const lively = await sendVenueTurn({
      sessionId: group.id,
      message: "A lively scene",
      mode: "chat",
      targetId: "",
      submissionId: "lively-1",
    });
    assert.match(lastVenueSystem, /Use "I" for the player in scene prose/u);
    assert.match(
      lastVenueSystem,
      /The player controls their own speech, decisions, actions, thoughts, feelings, and consent/u,
    );
    assert.match(lastVenueSystem, /When describing the player's actions, narrate only what they explicitly submitted/u);
    await saveVillageWriting({ person: "second" });
    const aside = lively.session.lines.find((line) => line.kind === "side")!;
    const main = lively.session.lines.find((line) => line.id === aside.asideFor)!;
    assert.equal(main.speakerId, "tina", "side chatter stays attached to the preceding dialogue");
    assert.equal(aside.speakerId, "bob", "the aside keeps its own speaker");
    assert.equal(lively.session.stagingVersion, 1);
    const stagedLine = lively.session.lines.find((line) => line.content === "The room quiets.")!;
    assert.equal(
      stagedLine.staging?.[0].expression,
      "e-123e4567-e89b-42d3-a456-426614174000",
      "a filled silent listener expression is accepted",
    );
    assert.deepEqual(
      stagedLine.staging?.[1],
      { characterId: "tina", position: "center" },
      "another character's expression is dropped without losing movement",
    );
    assert.match(lastVenueSystem, /Current presentation state/u);
    assert.match(lastVenueSystem, /direction:"left\|right"/u);
    assert.deepEqual(
      (await activeVenueSession())?.lines.find((line) => line.id === stagedLine.id)?.staging,
      stagedLine.staging,
      "cues survive session reload",
    );
    const beforeStageRetry = venueReplyCalls;
    const duplicateStage = await sendVenueTurn({
      sessionId: group.id,
      message: "A lively scene",
      mode: "chat",
      targetId: "",
      submissionId: "lively-1",
    });
    assert.equal(venueReplyCalls, beforeStageRetry, "duplicate submissions do not regenerate staging");
    assert.equal(duplicateStage.session.lines.length, lively.session.lines.length);
    assert.equal(aside.expression, undefined, "an unfilled sprite expression is dropped without losing the aside");
    assert.deepEqual(aside.heardBy, ["bob"], "a side remark keeps its own audience");
    assert.deepEqual(lively.session.lines.find((line) => line.kind === "whisper")?.heardBy, ["tina", "bob"]);
    narrationOnlyOnce = true;
    const beforeQuietReply = calls;
    const answered = await sendVenueTurn({
      sessionId: group.id,
      message: "How are you doing?",
      mode: "chat",
      targetId: "tina",
      submissionId: "quiet-reply",
    });
    assert.equal(calls - beforeQuietReply, 1, "a nonverbal reply does not trigger a second model call");
    assert.equal(answered.session.lines.at(-1)?.content, "Tina glanced over.");
    assert.match(
      lastVenueSystem,
      /"characterId":"bob","position":"right","expression":"e-123e4567-e89b-42d3-a456-426614174000"/u,
      "the next reply receives saved visual continuity",
    );
    const beforeQuietAsk = calls;
    const quietAsk = await sendVenueTurn({
      sessionId: group.id,
      message: "Still no answer",
      mode: "ask",
      targetId: "tina",
      submissionId: "quiet-ask",
    });
    assert.equal(calls - beforeQuietAsk, 1);
    assert.equal(quietAsk.session.lines.at(-1)?.content, "No one spoke.");
    const beforeEmptyReply = quietAsk.session.lines.length;
    const beforeEmptyCalls = venueReplyCalls;
    await assert.rejects(
      () =>
        sendVenueTurn({
          sessionId: group.id,
          message: "No scene moment",
          mode: "chat",
          targetId: "tina",
          submissionId: "empty-reply",
        }),
      /failed validation/u,
    );
    assert.equal(venueReplyCalls - beforeEmptyCalls, 1, "empty scenes make no automatic repair call");
    assert.equal((await activeVenueSession())?.lines.length, beforeEmptyReply, "an empty reply is not archived");
    const failedOrdinary = (await activeVenueSession())!;
    const beforeEditedReply = venueReplyCalls;
    const editedOrdinary = await sendVenueTurnRaw({
      sessionId: group.id,
      message: "An edited ordinary message",
      mode: "chat",
      targetId: "",
      submissionId: "edited-empty-reply",
      replaceOfOperationId: "empty-reply",
      retryOfAttemptId: failedOrdinary.operation!.attemptId,
      expectedSceneRevision: failedOrdinary.sceneRevision,
    });
    assert.equal(venueReplyCalls, beforeEditedReply + 1, "edited ordinary chat is dispatched once");
    assert.equal(
      editedOrdinary.session.lines.filter((line) => line.role === "user" && line.content === "No scene moment").length,
      0,
    );
    assert.equal(
      editedOrdinary.session.lines.filter(
        (line) => line.role === "user" && line.content === "An edited ordinary message",
      ).length,
      1,
    );
    await sendVenueTurn({
      sessionId: group.id,
      message: "Ask me about myself",
      mode: "chat",
      targetId: "",
      submissionId: "ask-about-player-1",
    });
    const beforeEchoCalls = venueReplyCalls;
    await assert.rejects(
      () =>
        sendVenueTurn({
          sessionId: group.id,
          message: "I actually don't remember anything. Funny, huh?",
          mode: "chat",
          targetId: "",
          submissionId: "player-answer-1",
        }),
      /player-echo/u,
    );
    assert.equal(venueReplyCalls - beforeEchoCalls, 1, "failed output makes one call");
    acceptEcho = true;
    const correctedEcho = await sendVenueTurn({
      sessionId: group.id,
      message: "I actually don't remember anything. Funny, huh?",
      mode: "chat",
      targetId: "",
      submissionId: "player-answer-1",
    });
    assert.equal(venueReplyCalls - beforeEchoCalls, 2, "the explicit resend makes one additional call");
    assert.equal(
      correctedEcho.session.lines.filter(
        (line) => line.role === "user" && line.content === "I actually don't remember anything. Funny, huh?",
      ).length,
      1,
    );
    assert.equal(correctedEcho.session.lines.at(-1)?.content, "That sounds disorienting. I can listen.");
    assert.doesNotMatch(lastVenueSystem, /previous draft failed validation/u);
    const beforeEchoReplayCalls = venueReplyCalls;
    const echoedReplay = await sendVenueTurn({
      sessionId: group.id,
      message: "I actually don't remember anything. Funny, huh?",
      mode: "chat",
      targetId: "",
      submissionId: "player-answer-1",
    });
    assert.equal(venueReplyCalls, beforeEchoReplayCalls, "replaying the accepted submission makes no model call");
    assert.equal(echoedReplay.session.lines.length, correctedEcho.session.lines.length);
    await sendVenueTurn({
      sessionId: group.id,
      message: "Ask me about myself",
      mode: "chat",
      targetId: "",
      submissionId: "ask-about-player-2",
    });
    const beforeQuestionCalls = venueReplyCalls;
    await assert.rejects(
      () =>
        sendVenueTurn({
          sessionId: group.id,
          message: "I don't remember where I came from.",
          mode: "chat",
          targetId: "",
          submissionId: "player-answer-2",
        }),
      /repeated-question/u,
    );
    assert.equal(venueReplyCalls - beforeQuestionCalls, 1, "failed output makes one call");
    acceptRepeatedQuestion = true;
    const correctedQuestion = await sendVenueTurn({
      sessionId: group.id,
      message: "I don't remember where I came from.",
      mode: "chat",
      targetId: "",
      submissionId: "player-answer-2",
    });
    assert.equal(venueReplyCalls - beforeQuestionCalls, 2, "the explicit resend makes one additional call");
    assert.equal(
      correctedQuestion.session.lines.at(-1)?.content,
      "That sounds unsettling. Do you want to tell us more?",
    );
    assert.doesNotMatch(lastVenueSystem, /previous draft failed validation/u);
    blankTurnOnce = true;
    const beforeBlankCalls = venueReplyCalls;
    await assert.rejects(
      () =>
        sendVenueTurn({
          sessionId: group.id,
          message: "Blank once",
          mode: "chat",
          targetId: "",
          submissionId: "blank-turn-1",
        }),
      /failed validation/u,
    );
    assert.equal(venueReplyCalls - beforeBlankCalls, 1, "a blank provider response spends exactly one reply call");
    await sendVenueTurn({
      sessionId: group.id,
      message: "Blank once",
      mode: "chat",
      targetId: "",
      submissionId: "blank-turn-1",
    });
    assert.equal(venueReplyCalls - beforeBlankCalls, 2, "only an explicit resend authorizes a second call");
    malformedTurnOnce = true;
    const beforeMalformedCalls = venueReplyCalls;
    await assert.rejects(
      () =>
        sendVenueTurn({
          sessionId: group.id,
          message: "Malformed once",
          mode: "chat",
          targetId: "",
          submissionId: "malformed-turn-1",
        }),
      /invalid-json/u,
    );
    assert.equal(venueReplyCalls - beforeMalformedCalls, 1, "failed output makes one call");
    const correctedMalformed = await sendVenueTurn({
      sessionId: group.id,
      message: "Malformed once",
      mode: "chat",
      targetId: "",
      submissionId: "malformed-turn-1",
    });
    assert.equal(venueReplyCalls - beforeMalformedCalls, 2);
    assert.equal(
      correctedMalformed.session.lines.filter((line) => line.role === "user" && line.content === "Malformed once")
        .length,
      1,
    );
    exhaustEcho = true;
    const beforeExhausted = await activeVenueSession();
    const beforeExhaustedState = JSON.stringify(
      (await readVillageState()).venues.find((place) => place.id === "park")?.state,
    );
    const beforeExhaustedCalls = venueReplyCalls;
    await assert.rejects(
      () =>
        sendVenueTurn({
          sessionId: group.id,
          message: "Always echo this long player statement",
          mode: "chat",
          targetId: "",
          submissionId: "echo-exhausted",
        }),
      /draft is preserved/u,
    );
    assert.equal(venueReplyCalls - beforeExhaustedCalls, 1);
    assert.equal((await activeVenueSession())?.lines.length, beforeExhausted?.lines.length);
    assert.equal(
      JSON.stringify((await readVillageState()).venues.find((place) => place.id === "park")?.state),
      beforeExhaustedState,
    );
    exhaustEcho = false;
    const acceptedAfterFailure = await sendVenueTurn({
      sessionId: group.id,
      message: "Always echo this long player statement",
      mode: "chat",
      targetId: "",
      submissionId: "echo-exhausted",
    });
    assert.equal(
      acceptedAfterFailure.session.lines.filter(
        (line) => line.role === "user" && line.content === "Always echo this long player statement",
      ).length,
      1,
    );
    failReplyOnce = true;
    const beforeFailedSend = (await activeVenueSession())!.lines.length;
    await assert.rejects(
      () =>
        sendVenueTurn({
          sessionId: group.id,
          message: "Fail once",
          mode: "chat",
          targetId: "",
          submissionId: "retry-once",
        }),
      /reply unavailable/u,
    );
    assert.equal((await activeVenueSession())?.lines.length, beforeFailedSend, "failed send commits no partial turn");
    await sendVenueTurn({
      sessionId: group.id,
      message: "Fail once",
      mode: "chat",
      targetId: "",
      submissionId: "retry-once",
    });
    assert.equal((await activeVenueSession())?.lines.filter((line) => line.content === "Fail once").length, 1);
    const beforeAction = calls;
    const action = await measured("legacy-act-with-witnesses", () =>
      sendVenueTurn({
        sessionId: group.id,
        message: "Set down a cup",
        mode: "act",
        targetId: "",
        submissionId: "group-action",
      }),
    );
    if (measuringCosts) return;
    assert.equal(action.action?.happened, true);
    const projectActionEvidence = await readProjectTurnEvidence(group.id, "group-action");
    assert.ok(Number.isFinite(Date.parse(projectActionEvidence.at)), "live Act evidence keeps its timestamp");
    assert.equal(projectActionEvidence.action?.happened, true);
    assert.equal(calls - beforeAction, 1, "new legacy Act uses the shared Chat reply without a System action request");
    assert.ok(
      (await activeVenueSession())?.lines.some((line) => line.content === "The player sets down a cup."),
      "the checked action outcome appears in the visit",
    );
    const beforeFailedAction = calls;
    const failedAction = await sendVenueTurn({
      sessionId: group.id,
      message: "Fail to lift the wall",
      mode: "act",
      targetId: "",
      submissionId: "failed-action",
    });
    assert.equal(failedAction.action, null);
    assert.equal(calls - beforeFailedAction, 1, "a failed action uses one shared reply with no physical receipt");
    assert.ok(
      !(await readVillageState()).venues.find((place) => place.id === "park")?.state.furniture.includes("wall"),
    );
    const beforeRejectedAct = await activeVenueSession();
    const beforeRejectedActEvents = (await readVillageState()).venueEvents.length;
    const beforeRejectedActCalls = venueReplyCalls;
    await assert.rejects(
      () =>
        sendVenueTurn({
          sessionId: group.id,
          message: "Place an intricately carved silver bowl on the table",
          mode: "act",
          targetId: "",
          submissionId: "act-echo-exhausted",
        }),
      /draft is preserved/u,
    );
    assert.equal(venueReplyCalls - beforeRejectedActCalls, 1);
    assert.equal((await activeVenueSession())?.lines.length, beforeRejectedAct?.lines.length);
    assert.equal((await readVillageState()).venueEvents.length, beforeRejectedActEvents);
    failActReplyOnce = true;
    const beforeUncertainAction = calls;
    const beforeUncertainLines = (await activeVenueSession())!.lines.length;
    await assert.rejects(
      () =>
        sendVenueTurn({
          sessionId: group.id,
          message: "Set down a lantern",
          mode: "act",
          targetId: "",
          submissionId: "uncertain-action",
        }),
      /action reply unavailable/u,
    );
    assert.equal(
      (await readVillageState()).venues
        .find((place) => place.id === "park")
        ?.state.furniture.filter((item) => item === "lantern").length,
      0,
      "a failed reaction leaves the physical action uncommitted",
    );
    assert.equal((await activeVenueSession())?.lines.length, beforeUncertainLines);
    quietActReplyOnce = true;
    const completedQuietAction = await sendVenueTurn({
      sessionId: group.id,
      message: "Set down a lantern",
      mode: "act",
      targetId: "",
      submissionId: "uncertain-action",
    });
    assert.equal(calls - beforeUncertainAction, 2, "explicit retry repeats only the uncommitted Narration request");
    assert.ok(
      completedQuietAction.session.lines.some(
        (line) => line.content === "Bob makes room for the lantern on the table.",
      ),
    );
    assert.equal(
      (await readVillageState()).venues
        .find((place) => place.id === "park")
        ?.state.furniture.filter((item) => item === "lantern").length,
      1,
      "an uncertain reply never applies the item twice",
    );
    for (const [message, submissionId] of [
      ["Leave a note for Tina", "note-action"],
      ["Spill tea", "spill-action"],
      ["Open the window", "window-action"],
    ]) {
      await sendVenueTurn({ sessionId: group.id, message, mode: "act", targetId: "", submissionId });
    }
    let traces = (await readVillageState()).venues.find((place) => place.id === "park")?.state.traces ?? [];
    assert.deepEqual(
      traces.map((trace) => trace.kind),
      ["note", "stain", "open-window"],
    );
    await mutateVillageState((state) => {
      for (const trace of state.venues.find((place) => place.id === "park")?.state.traces ?? []) {
        trace.createdAt = new Date(Date.now() - 120_000).toISOString();
      }
      state.storyPace = "off";
    });
    await reconcileVillage({ now: new Date() });
    const discovered = await readVillageState();
    traces = discovered.venues.find((place) => place.id === "park")?.state.traces ?? [];
    assert.ok(
      !traces.some((trace) => trace.kind === "note"),
      "an addressed note resolves after its recipient finds it",
    );
    assert.ok(
      traces.some((trace) => trace.kind === "stain"),
      "a stain persists after discovery",
    );
    assert.ok(
      traces.some((trace) => trace.kind === "open-window"),
      "other trace kinds persist after discovery",
    );
    assert.ok(
      discovered.chronicle.some(
        (entry) => entry.text.includes("Meet me by the bridge.") && entry.actors.some((actor) => actor.id === "tina"),
      ),
      "the recipient remembers the found note",
    );
    await sendVenueTurn({
      sessionId: group.id,
      message: "Clean the spill",
      mode: "act",
      targetId: "",
      submissionId: "cleanup-action",
    });
    traces = (await readVillageState()).venues.find((place) => place.id === "park")?.state.traces ?? [];
    assert.ok(!traces.some((trace) => trace.kind === "stain"), "cleaning resolves the active stain");
    assert.ok(
      traces.some((trace) => trace.kind === "open-window"),
      "unrelated traces remain",
    );
    await mutateVillageState((state) => {
      const room = state.venues.find((place) => place.id === "park")!;
      room.state.condition = "a ceiling drip";
      room.state.traces!.push({
        id: "trace:drip",
        kind: "leak",
        text: "water drips from the ceiling",
        recipientId: "",
        createdAt: new Date().toISOString(),
      });
      const space = room.spaces?.find((entry) => entry.venueClass === "workplace");
      if (space) {
        space.state.condition = room.state.condition;
        space.state.traces = [...room.state.traces!];
      }
    });
    const beforeChatRepair = calls;
    const chatRepair = await sendVenueTurn({
      sessionId: group.id,
      message: "I fixed the ceiling drip",
      mode: "chat",
      targetId: "",
      submissionId: "chat-repair",
    });
    assert.equal(calls - beforeChatRepair, 1, "a Chat repair uses its existing one reply call");
    assert.equal(chatRepair.recordEvents.filter((event) => event.kind === "venue").length, 1);
    park = (await readVillageState()).venues.find((place) => place.id === "park")!;
    assert.equal(park.state.condition, "a dry ceiling");
    assert.ok(!park.state.traces?.some((trace) => trace.id === "trace:drip"));
    const beforeRepairReplay = calls;
    await sendVenueTurn({
      sessionId: group.id,
      message: "I fixed the ceiling drip",
      mode: "chat",
      targetId: "",
      submissionId: "chat-repair",
    });
    assert.equal(calls, beforeRepairReplay, "a repair retry neither regenerates nor reapplies the deed");
    const repairProof = (await readVillageState()).venueEvents.find(
      (event) => event.actionReceipt?.submissionId === "chat-repair",
    )!;
    assert.equal(repairProof.actionReceipt?.conditionAfter, "a dry ceiling");
    assert.deepEqual(repairProof.actionReceipt?.witnessIds, ["bob", "tina"]);
    assert.equal(repairProof.zoneId, chatRepair.session.zoneId);
    assert.ok(
      wishReceiptRecords(await readVillageState(), "bob", chatRepair.session).some(
        (event) => event.id === repairProof.id,
      ),
      "Chat repair is usable witnessed physical evidence",
    );

    async function stock(item: string) {
      await mutateVillageState((state) => {
        const venue = state.venues.find((place) => place.id === "park")!;
        if (!venue.state.furniture.includes(item)) venue.state.furniture.push(item);
        const space = venue.spaces?.find((entry) => entry.venueClass === "workplace");
        if (space && !space.state.items.includes(item)) space.state.items.push(item);
        const zone = venue.zones?.find((zone) => zone.id === chatRepair.session.zoneId);
        if (zone && !zone.state.items.includes(item)) zone.state.items.push(item);
      });
    }
    const transferProofs = [];
    for (const mode of ["chat", "act", "fulfill"] as const) {
      await stock("teapot");
      sceneActionFixture = {
        happened: true,
        narration: "The player hands the teapot to Tina.",
        removeItem: "teapot",
        transferTo: "tina",
      };
      const id = `shared-handoff-${mode}`;
      const beforeNarration = venueReplyCalls;
      const sent = await sendVenueTurn({
        sessionId: group.id,
        message: "I hand the teapot to Tina",
        mode,
        targetId: mode === "fulfill" ? "tina" : "",
        submissionId: id,
      });
      assert.equal(venueReplyCalls - beforeNarration, 1, "all current modes use one Scene response generation");
      const savedTurn = sent.session.submissions.find((turn) => turn.id === id)!;
      assert.equal(savedTurn.mode, "chat");
      assert.equal(savedTurn.requestMode, mode === "chat" ? undefined : mode);
      assert.equal(savedTurn.verdict, null, "Fulfill uses cited finite checks, not an inline legacy verdict");
      assert.equal(savedTurn.wishId, "");
      assert.equal(savedTurn.wishMemory, "");
      assert.equal(savedTurn.wishInterpretationProof, undefined);
      assert.ok(!savedTurn.requestMetrics?.some((request) => request.stage.includes("wish-verdict")));
      const event = (await readVillageState()).venueEvents.find((event) => event.actionReceipt?.submissionId === id)!;
      const { submissionId: _id, ...proof } = event.actionReceipt!;
      transferProofs.push(proof);
      assert.deepEqual(proof.itemTransfer, { itemName: "teapot", recipientId: "tina" });
      const before = calls;
      const replayed = await sendVenueTurn({
        sessionId: group.id,
        message: "I hand the teapot to Tina",
        mode,
        targetId: mode === "fulfill" ? "tina" : "",
        submissionId: id,
      });
      assert.equal(calls, before);
      assert.deepEqual(replayed.recordEvents, sent.recordEvents, "replay preserves notice identities");
    }
    assert.deepEqual(transferProofs[0], transferProofs[1], "Chat and fresh Act write equivalent outcomes");
    assert.deepEqual(transferProofs[0], transferProofs[2], "fresh Fulfill preserves the shared physical path");
    await stock("timber");
    sceneActionFixture = {
      happened: true,
      narration: "The player picks up the timber.",
      removeItem: "timber",
      transferTo: "player",
    };
    await sendVenueTurn({
      sessionId: group.id,
      message: "I pick up the timber",
      mode: "chat",
      targetId: "",
      submissionId: "shared-pickup",
    });
    assert.deepEqual(
      (await readVillageState()).venueEvents.find((event) => event.actionReceipt?.submissionId === "shared-pickup")!
        .actionReceipt?.itemTransfer,
      { itemName: "timber", recipientId: "player" },
    );
    for (const [label, message, change] of [
      ["promise", "I will repair the pipe", { conditionBefore: "a dry ceiling", conditionAfter: "repaired" }],
      ["elsewhere", "I repaired the pipe elsewhere", { conditionBefore: "a dry ceiling", conditionAfter: "repaired" }],
      ["absent-recipient", "I hand the cup to Buster", { removeItem: "cup", transferTo: "buster" }],
      ["missing-stock", "I pick up the diamond", { removeItem: "diamond", transferTo: "player" }],
    ] as const) {
      sceneActionFixture = { happened: true, narration: "An unsupported effect.", ...change };
      const before = (await activeVenueSession())!.lines.length;
      await assert.rejects(() =>
        sendVenueTurn({
          sessionId: group.id,
          message,
          mode: "chat",
          targetId: "",
          submissionId: `unsupported-${label}`,
        }),
      );
      assert.equal((await activeVenueSession())!.lines.length, before);
      assert.ok(
        !(await readVillageState()).venueEvents.some(
          (event) => event.actionReceipt?.submissionId === `unsupported-${label}`,
        ),
      );
      // Explicitly cancel the rejected operation before the next independent fixture.
      await continueVenueWithoutGreeting(group.id);
    }
    for (const stage of ["effect", "bookkeeping"]) {
      if (stage === "effect") {
        await stock("reserved plank");
        await mutateVillageState((state) =>
          state.projects.push({
            id: "reserved-stock-fixture",
            kind: "build-venue",
            title: "Reserved stock",
            venueId: "park",
            participantIds: [],
            progress: 0,
            status: "active",
            updatedAt: new Date().toISOString(),
            plan: {
              revision: 1,
              sources: [
                {
                  id: "plank-source",
                  requirementId: "plank",
                  kind: "existing-item",
                  venueId: "park",
                  zoneId: chatRepair.session.zoneId,
                  itemName: "reserved plank",
                  remaining: 1,
                },
              ],
            },
          } as any),
        );
        sceneActionFixture = {
          happened: true,
          narration: "The reserved plank is taken.",
          removeItem: "reserved plank",
          transferTo: "player",
        };
        await assert.rejects(
          () =>
            sendVenueTurn({
              sessionId: group.id,
              message: "I pick up the reserved plank",
              mode: "chat",
              targetId: "",
              submissionId: "reserved-stock",
            }),
          /reserved-project-item/,
        );
        assert.ok(
          (await readVillageState()).venues
            .find((venue) => venue.id === "park")!
            .state.furniture.includes("reserved plank"),
        );
        await continueVenueWithoutGreeting(group.id);
        await mutateVillageState((state) => {
          state.projects = state.projects.filter((project) => project.id !== "reserved-stock-fixture");
        });
      }
      const id = `physical-interruption-${stage}`;
      await stock("spare cup");
      sceneActionFixture = {
        happened: true,
        narration: "The player picks up the spare cup.",
        removeItem: "spare cup",
        transferTo: "player",
      };
      if (stage === "effect") failEffectWriteFor = id;
      else failReceiptBookkeepingFor = id;
      await sendVenueTurn({
        sessionId: group.id,
        message: "I pick up the spare cup",
        mode: "chat",
        targetId: "",
        submissionId: id,
      });
      if (stage === "effect")
        assert.equal(
          (await activeVenueSession())!.submissions.find((turn) => turn.id === id)!.processing?.domains.wishes.status,
          "pending",
          "Wish checks wait for committed physical evidence",
        );
      if (stage === "bookkeeping")
        await mutateVillageState((state) => {
          state.venueEvents = state.venueEvents.filter((event) => event.actionReceipt?.submissionId !== id);
        });
      failEffectWriteFor = failReceiptBookkeepingFor = "";
      const before = calls;
      await sendVenueTurn({
        sessionId: group.id,
        message: "I pick up the spare cup",
        mode: "chat",
        targetId: "",
        submissionId: id,
      });
      assert.equal(calls, before, "storage recovery reuses the saved reply");
      assert.equal(
        physicalVenueEvents(await readVillageState()).filter((event) => event.actionReceipt?.submissionId === id)
          .length,
        1,
        "effect and receipt apply once",
      );
    }
    sceneActionFixture = null;
    await settleBackgroundWork();
    const fixtureKey = key("villages", `villages-venue-visit-${group.id}`);
    const originalRecords = structuredClone([...records]);
    const currentRecord = structuredClone(records.get(fixtureKey)!);
    try {
      const bareChat = structuredClone(currentRecord);
      bareChat.data.submissions.push({
        ...structuredClone(bareChat.data.submissions.at(-1)),
        id: "bare-chat",
        message: "Saved bare Chat",
        mode: "chat",
        requestMode: undefined,
        targetId: "",
      });
      records.set(fixtureKey, bareChat);
      const beforeChat = structuredClone([...records]);
      const beforeChatCalls = [documentWriteCalls, providerCalls, providerResolves];
      await assert.rejects(
        sendVenueTurnRaw({
          sessionId: group.id,
          message: "Saved bare Chat",
          mode: "fulfill",
          targetId: "",
          submissionId: "bare-chat",
        }),
        (error: any) => error.code === "SUBMISSION_MISMATCH",
      );
      assert.deepEqual([...records], beforeChat);
      assert.deepEqual(
        [documentWriteCalls, providerCalls, providerResolves],
        beforeChatCalls,
        "bare Chat cannot become Fulfill through recovery",
      );

      const unversioned = structuredClone(currentRecord);
      const oldAction = { happened: true, narration: "The player set down an old jug.", addItem: "old jug" };
      unversioned.data.submissions.push({
        ...structuredClone(unversioned.data.submissions.at(-1)),
        id: "old-admission",
        message: "Saved old action",
        mode: "act",
        requestMode: undefined,
        targetId: "",
        action: oldAction,
        actionReplyDone: false,
      });
      unversioned.data.operation = {
        ...unversioned.data.operation,
        id: "old-admission",
        kind: "turn",
        status: "interrupted",
        attemptId: "old-admission-attempt",
        checkpoints: {},
        attempts: {},
        input: { message: "Saved old action", mode: "act", targetId: "" },
        snapshot: structuredClone({ ...unversioned.data, operation: undefined }),
      };
      records.set(fixtureKey, unversioned);
      const beforeOld = structuredClone([...records]);
      const beforeOldCalls = [documentWriteCalls, providerCalls, providerResolves];
      for (const retryOfAttemptId of [undefined, "old-admission-attempt"]) {
        await assert.rejects(
          sendVenueTurnRaw({
            sessionId: group.id,
            message: "Saved old action",
            mode: "act",
            targetId: "",
            submissionId: "old-admission",
            retryOfAttemptId,
          }),
          (error: any) => error.code === "SUBMISSION_MISMATCH",
        );
        assert.deepEqual(
          [...records],
          beforeOld,
          "unversioned admission rejection must retain all document bytes and revisions",
        );
        assert.deepEqual(
          [documentWriteCalls, providerCalls, providerResolves],
          beforeOldCalls,
          "old admission cannot write or request any provider, including interpretation",
        );
      }
    } finally {
      records.clear();
      for (const [id, record] of originalRecords) records.set(id, record);
    }
    await sendVenueTurn({
      sessionId: group.id,
      message: "I moved the tables",
      mode: "chat",
      targetId: "",
      submissionId: "chat-tables",
    });
    park = (await readVillageState()).venues.find((place) => place.id === "park")!;
    assert.equal(
      park.state.traces?.find((trace) => trace.kind === "scene-note")?.text,
      "The tables stand beside the wall.",
    );
    const beforeClaims = (await readVillageState()).happenings.length;
    await sendVenueTurn({
      sessionId: group.id,
      message: "I tell Bob I moved the tables",
      mode: "chat",
      targetId: "",
      submissionId: "chat-claim",
    });
    await sendVenueTurn({
      sessionId: group.id,
      message: "I lift the wall",
      mode: "chat",
      targetId: "",
      submissionId: "chat-impossible",
    });
    assert.equal(
      (await readVillageState()).happenings.length,
      beforeClaims,
      "speech about a deed and an impossible attempt create no physical events",
    );
    assert.match(lastVenueSystem, /Current condition: a dry ceiling/u);
    assert.doesNotMatch(lastVenueSystem, /a ceiling drip|water drips from the ceiling/u);
    assert.ok((await activeVenueSession())!.recap.length <= 600, "long visits keep a bounded recap");
    assert.ok(
      JSON.parse(lastVenueSystem.split("Earlier evidence: ")[1]!.split("\n\n##")[0]!).length <= 18,
      "long visits send only a bounded recent transcript",
    );
    const beforeReplay = calls;
    const replay = await sendVenueTurn({
      sessionId: group.id,
      message: "A quiet question",
      mode: "ask",
      targetId: "bob",
      submissionId: "ask-1",
    });
    assert.equal(calls, beforeReplay, "retry does not generate a duplicate turn");
    assert.equal(replay.session.lines.filter((line) => line.content === "A quiet question").length, 1);
    await assert.rejects(
      () =>
        sendVenueTurn({
          sessionId: group.id,
          message: "different",
          mode: "ask",
          targetId: "bob",
          submissionId: "ask-1",
        }),
      /different line/u,
    );

    await mutateVillageState((state) => {
      state.villagers[0]!.agenda!.activeDay!.blocks[0]!.venueId = "empty";
      state.villagers[0]!.agenda!.activeDay!.blocks[0]!.zoneId = undefined;
      state.villagers[1]!.agenda!.activeDay!.blocks[0]!.venueId = "empty";
      state.villagers[1]!.agenda!.activeDay!.blocks[0]!.zoneId = undefined;
    });
    assert.deepEqual(
      (await activeVenueSession())?.activeIds,
      ["bob", "tina"],
      "agenda changes cannot replace the Scene cast",
    );
    await sendVenueTurn({
      sessionId: group.id,
      message: "Bob heads away",
      mode: "chat",
      targetId: "",
      submissionId: "leave-bob",
    });
    assert.deepEqual(
      (await activeVenueSession())?.activeIds,
      ["bob", "tina"],
      "uncited narration does not change Scene attendance",
    );
    await sendVenueTurn({
      sessionId: group.id,
      message: "Tina heads away",
      mode: "chat",
      targetId: "",
      submissionId: "leave-tina",
    });
    assert.deepEqual(
      (await activeVenueSession())?.activeIds,
      ["bob", "tina"],
      "only evidenced Scene departures remove residents",
    );
    await endVenueSession(group.id);
    assert.equal(await activeVenueSession(), null, "Visit ends only when the player leaves");
    assert.equal(memoryCalls, 0, "Scene close makes no memory generation request");
    assert.equal((await listVenueVisits({ characterId: "bob" })).length, 1);
    assert.equal((await listVenueVisits({ placeId: "park" })).length, 1);
    assert.equal((await listVenueVisits({ placeId: "empty" })).length, 1);

    await mutateVillageState((state) => {
      state.villagers[1]!.agenda!.activeDay!.blocks[0]!.venueId = "park";
      state.villagers[1]!.agenda!.activeDay!.blocks[0]!.zoneId = undefined;
    });
    const single = await greetVenue((await enterVenue("park"))!.id);
    assert.deepEqual(single.activeIds, ["tina"]);
    await mutateVillageState((state) => {
      state.villagers[0]!.agenda!.activeDay!.blocks[0]!.venueId = "park";
      state.villagers[0]!.agenda!.activeDay!.blocks[0]!.zoneId = undefined;
    });
    assert.deepEqual((await activeVenueSession())?.activeIds, ["tina"], "agenda arrivals cannot join an active Scene");
    await assert.rejects(
      () =>
        sendVenueTurn({
          sessionId: single.id,
          message: "Hello",
          mode: "chat",
          targetId: "outsider",
          submissionId: "wrong-target",
        }),
      /no longer in this conversation/u,
    );

    await sendVenueTurn({
      sessionId: single.id,
      message: "A natural goodbye",
      mode: "chat",
      targetId: "",
      submissionId: "goodbye",
    });
    assert.equal((await activeVenueSession())?.id, single.id, "narrated endings do not close the visit");
    await endVenueSession(single.id);
    const manualGroup = await greetVenue((await enterVenue("park")).id);
    const beforeManualEnd = memoryCalls;
    await endVenueSession(manualGroup.id);
    assert.equal(memoryCalls - beforeManualEnd, 0, "the player can end a group chat without a review call");
    assert.equal(await activeVenueSession(), null);
    openingSegmentsOnce = [{ kind: "narration", text: "Tina keeps sorting seeds while Bob repairs the latch." }];
    const quietOpening = await enterVenue("park");
    const beforeQuietOpening = calls;
    const quietScene = await greetVenue(quietOpening.id);
    assert.equal(calls - beforeQuietOpening, 1, "a quiet indoor opening uses one model call");
    assert.deepEqual(
      quietScene.lines.map((line) => line.kind),
      ["narration"],
    );
    await endVenueSession(quietScene.id);
    openingSegmentsOnce = [
      { kind: "dialogue", speakerId: "bob", text: "The hinge still catches.", heardBy: ["bob", "tina"] },
      { kind: "dialogue", speakerId: "tina", text: "Try the smaller pin.", heardBy: ["bob", "tina"] },
    ];
    const conversationOpening = await enterVenue("park");
    const beforeConversationOpening = calls;
    const ongoingScene = await greetVenue(conversationOpening.id);
    assert.equal(calls - beforeConversationOpening, 1);
    assert.deepEqual(
      ongoingScene.lines.map((line) => line.kind),
      ["dialogue", "dialogue"],
    );
    assert.deepEqual(ongoingScene.lines[0]?.heardBy, ["bob", "tina"]);
    await endVenueSession(ongoingScene.id);
    openingSegmentsOnce = [{ kind: "dialogue", speakerId: "tina", text: "There you are.", heardBy: ["tina"] }];
    const speechOpening = await enterVenue("park");
    const speechScene = await greetVenue(speechOpening.id);
    assert.equal(speechScene.lines[0]?.speakerId, "tina", "a direct greeting can lead without narration");
    await endVenueSession(speechScene.id);
    emptyOpeningFailures = 1;
    const emptyOpening = await enterVenue("park");
    await assert.rejects(() => greetVenue(emptyOpening.id), /failed validation/u);
    assert.equal((await activeVenueSession())?.status, "opening", "an empty opening remains retryable");
    await endVenueSession((await greetVenue(emptyOpening.id)).id);
    assert.deepEqual(
      parseVenueReply({ heardPlayerBy: ["bob"], lines: [{ kind: "narration", text: "The latch clicks." }] }, ["tina"])
        .heardPlayerBy,
      [],
      "unavailable audience hints are ignored",
    );
    failGreetingOnce = true;
    const delayed = (await enterVenue("park"))!;
    await assert.rejects(() => greetVenue(delayed.id), /greeting unavailable/u);
    assert.equal(
      (await activeVenueSession())?.status,
      "opening",
      "failed greeting keeps the player in a retryable venue",
    );
    const greeted = await greetVenue(delayed.id);
    assert.equal(greeted.status, "active");
    assert.equal(greeted.lines.length, 1, "greeting retry stores one opening line");
    await endVenueSession(delayed.id);
    holdGreetingOnce = true;
    const bypassed = await enterVenue("park");
    const started = new Promise<void>((resolve) => {
      greetingStarted = resolve;
    });
    const pendingGreeting = greetVenue(bypassed.id);
    await started;
    const continued = await continueVenueWithoutGreeting(bypassed.id);
    assert.equal(continued.status, "active", "the player may speak after a failed or stalled greeting");
    assert.deepEqual(continued.lines, [], "continuing does not invent a villager line");
    await assert.rejects(pendingGreeting, (error: any) => error.code === "OPERATION_INTERRUPTED");
    releaseHeldGreeting?.();
    await new Promise<void>((resolve) => setImmediate(resolve));
    assert.equal((await activeVenueSession())?.lines.length, 0, "a late greeting cannot enter the transcript");
    const firstLine = await sendVenueTurn({
      sessionId: bypassed.id,
      message: "Hello first",
      mode: "chat",
      targetId: "",
      submissionId: "after-bypass",
    });
    assert.equal(firstLine.session.submissions.length, 1, "conversation works after continuing without a greeting");
    await endVenueSession(bypassed.id);
    greetingStarted = null;
    releaseHeldGreeting = null;
    malformedGreetingOnce = true;
    const malformed = await greetVenue((await enterVenue("park")).id);
    assert.equal(malformed.status, "active", "optional malformed target and expression do not break first greeting");
    assert.equal(malformed.lines[0]?.kind, "dialogue", "unavailable whisper target becomes ordinary speech");
    assert.ok((malformed.lines[0]?.expression?.length ?? 0) <= 40, "expression is bounded");
    assert.deepEqual(malformed.lines[0]?.heardBy, ["tina"], "unavailable audience is not admitted to the cast");
    await endVenueSession(malformed.id);
    const longCard = venueCardProfile({
      id: "bob",
      name: "Bob",
      comment: "",
      summary: "",
      tags: [],
      systemPrompt: "S".repeat(3_000),
      description: "A village resident.",
      personality: "Speaks in clipped, dry phrases.",
      scenario: "",
      backstory: "",
      appearance: "",
      exampleDialogue: "That hinge has opinions.",
    });
    assert.ok(longCard.includes("S".repeat(3_000)), "the whole authored card survives");
    assert.match(longCard, /Personality:\nSpeaks in clipped, dry phrases/u);
    assert.match(longCard, /Example dialogue:\nThat hinge has opinions/u);
    const scene = parseVenueReply(
      {
        heardPlayerBy: ["bob"],
        segments: [
          { kind: "narration", text: "A bell rings." },
          { kind: "dialogue", speakerId: "bob", text: "Listen.", heardBy: ["bob", "tina"] },
          { kind: "side", speakerId: "tina", text: "I heard it.", heardBy: ["tina"] },
        ],
        departures: [],
        sceneEnded: false,
      },
      ["bob", "tina"],
    );
    assert.equal(scene.lines[2]?.anchorIndex, 1);
    assert.throws(
      () =>
        parseVenueReply(
          {
            heardPlayerBy: [],
            segments: [{ kind: "dialogue", speakerId: "outsider", text: "No.", heardBy: [] }],
            departures: [],
            sceneEnded: false,
          },
          ["bob"],
        ),
      /unreadable speaker/u,
    );
    assert.throws(
      () =>
        parseVenueReply(
          {
            heardPlayerBy: [],
            segments: [{ kind: "side", speakerId: "bob", text: "No.", heardBy: ["bob"] }],
            departures: [],
            sceneEnded: false,
          },
          ["bob"],
        ),
      /without a main line/u,
    );
    const featureVenue = (await readVillageState()).venues.find((place) => place.id === "park")!;
    const featureMoment = deriveVillageMoment({
      foundedAt: new Date(Date.now() - 86_400_000).toISOString(),
      seed: "feature-fixture",
      now: new Date(),
    });
    const featureContext = () => ({
      village: "Fixture village",
      setting: "A quiet village",
      moment: featureMoment,
      foundedAt: new Date(Date.now() - 86_400_000).toISOString(),
      residents: ["bob", "tina"].map((id) => ({
        characterId: id,
        name: id,
        summary: "",
        tags: [],
        doing: "at the park",
        status: "online",
        routine: "",
        week: [],
        today: [],
        agenda: null,
        remembered: [],
      })),
      recent: [],
      memory: [],
      noticeboard: [],
      venues: [featureVenue],
      pendingVenueNames: [],
      opportunities: [
        {
          id: "opportunity-feature",
          kind: "routine",
          startsAt: featureMoment.instant,
          endsAt: featureMoment.instant,
          actorIds: creativeActorIds,
          venueId: "park",
          facts: [],
        },
      ],
      lastSimulatedAt: featureMoment.instant,
      forced: false,
    });
    const unlockedFeatureId = featureVenue.state.features![0]!.id;
    featureProposal = { who: "bob", venueId: "park", featureId: unlockedFeatureId, text: "Bob repainted the wall" };
    for (const playerRole of [DEFAULT_PLAYER_ROLE, { ...DEFAULT_PLAYER_ROLE, enabled: false }, null]) {
      const roleContext = { ...featureContext(), playerRole, playerPersonaName: "Robin" };
      await proposeHappenings(roleContext as any);
      if (playerRole)
        assert.ok(
          lastEventsSystem.includes(renderPlayerRoleContext(roleContext)),
          "Events receive role context separately from scenery",
        );
      else assert.equal(lastEventsSystem.includes("Player's place in the village:"), false);
    }
    const visualProposal = await proposeHappenings(featureContext() as any);
    assert.equal(visualProposal.happenings.length, 1);
    assert.deepEqual(visualProposal.featureEdits, [], "visual Events cannot edit venue features");
    assert.deepEqual(visualProposal.memory, [], "visual Events cannot create memory");
    creativeActorIds = ["tina"];
    featureProposal = null;
    const natural = await greetVenue((await enterVenue("park")).id);
    const naturalEnding = await sendVenueTurn({
      sessionId: natural.id,
      message: "Everyone says goodbye",
      mode: "chat",
      targetId: "",
      submissionId: "scene-goodbye",
    });
    assert.equal(naturalEnding.session.status, "closed", "an evidenced whole-scene goodbye closes the visit");
    assert.equal(naturalEnding.session.endReason, "scene");

    const leaving = await greetVenue((await enterVenue("park")).id);
    const farewell = await leaveVenueSession(leaving.id, "leave-once");
    assert.equal(farewell.session.status, "closed");
    assert.equal(farewell.session.endReason, "player");
    assert.ok(farewell.session.lines.some((line) => line.content.includes("Take care on your way out.")));
    assert.ok(
      !farewell.session.lines.some((line) => line.role === "user" && line.content.includes("goodbye")),
      "a silent Leave Scene does not invent the player's goodbye",
    );
    const farewellReplay = await leaveVenueSession(leaving.id, "leave-once");
    assert.equal(
      farewellReplay.session.lines.length,
      farewell.session.lines.length,
      "leave retry adds no second goodbye",
    );
    assert.equal(await activeVenueSession(), null);

    const spokenLeaving = await greetVenue((await enterVenue("park")).id);
    const spokenFarewell = await leaveVenueSession(spokenLeaving.id, "leave-spoken", "Goodbye, everyone.");
    assert.ok(
      spokenFarewell.session.lines.some((line) => line.role === "user" && line.content === "Goodbye, everyone."),
      "a composed final line is preserved exactly",
    );
    assert.ok(
      spokenFarewell.session.lines.some((line) => line.role === "assistant" && line.content.includes("I hear you.")),
    );

    const timed = await greetVenue((await enterVenue("park")).id);
    await sendVenueTurn({
      sessionId: timed.id,
      message: "An ordinary chat",
      mode: "chat",
      targetId: "",
      submissionId: "timed-line",
    });
    const timedRecord = records.get(key("villages", `villages-venue-visit-${timed.id}`));
    timedRecord.data.lastActivityAt = new Date(Date.now() - 15 * 60_000).toISOString();
    assert.equal((await activeVenueSession())?.id, timed.id, "15 minutes restores the live scene");
    await touchVenueSession(timed.id);
    const refreshedTimedRecord = records.get(key("villages", `villages-venue-visit-${timed.id}`));
    assert.ok(
      Date.now() - Date.parse(refreshedTimedRecord.data.lastActivityAt) < 10_000,
      "deliberate activity extends the scene",
    );
    refreshedTimedRecord.data.lastActivityAt = new Date(Date.now() - 45 * 60_000).toISOString();
    assert.equal(await activeVenueSession(), null, "a 45-minute return opens at the map on any device");
    const interruptedVisit = await readVenueVisit(timed.id);
    assert.equal(interruptedVisit.endReason, "inactivity");
    assert.equal(
      (await listVenueVisitSummaries({ placeId: "park" })).visits.find((visit) => visit.id === timed.id)?.endReason,
      "inactivity",
      "the archive summary exposes the exact ending reason",
    );
    assert.equal(
      interruptedVisit.lines.filter((line) => line.role === "user").length,
      1,
      "played lines survive interruption",
    );
    await assert.rejects(
      () =>
        sendVenueTurn({
          sessionId: timed.id,
          message: "Stale Send",
          mode: "chat",
          targetId: "",
          submissionId: "stale-send",
        }),
      /Interrupted: Inactivity/u,
    );
    assert.equal((await readVenueVisit(timed.id)).lines.filter((line) => line.role === "user").length, 1);
    const staleDesktop = await greetVenue((await enterVenue("park")).id);
    await sendVenueTurn({
      sessionId: staleDesktop.id,
      message: "An ordinary chat",
      mode: "chat",
      targetId: "",
      submissionId: "desktop-line",
    });
    records.get(key("villages", `villages-venue-visit-${staleDesktop.id}`)).data.lastActivityAt = new Date(
      Date.now() - 50 * 60_000,
    ).toISOString();
    await assert.rejects(
      () => touchVenueSession(staleDesktop.id),
      /Interrupted: Inactivity/u,
      "the first desktop interaction after 50 minutes cannot revive the scene",
    );
    assert.equal((await readVenueVisit(staleDesktop.id)).endReason, "inactivity");
    const unplayed = await enterVenue("empty");
    records.get(key("villages", `villages-venue-visit-${unplayed.id}`)).data.lastActivityAt = new Date(
      Date.now() - 50 * 60_000,
    ).toISOString();
    assert.equal(await activeVenueSession(), null, "a 50-minute return clears an unplayed scene");
    await assert.rejects(() => readVenueVisit(unplayed.id), /no longer available/u, "greeting-only visits are dropped");
    const debugVisit = await greetVenue((await enterVenue("park")).id);
    await sendVenueTurn({
      sessionId: debugVisit.id,
      message: "Remember the bridge",
      mode: "chat",
      targetId: "bob",
      submissionId: "debug-memory",
    });
    const committedContinuity = (await readVillageState()).recollections;
    const reviewsBeforeDebugDiscard = reviewCalls;
    debugEnabled = true;
    await discardVenueVisitDebug(debugVisit.id);
    debugEnabled = false;
    assert.equal(await activeVenueSession(), null);
    await assert.rejects(
      () => readVenueVisit(debugVisit.id),
      /no longer available/u,
      "DEBUG discard removes its transcript",
    );
    assert.deepEqual(
      (await readVillageState()).recollections,
      committedContinuity,
      "DEBUG discard preserves committed continuity",
    );
    assert.equal(reviewCalls, reviewsBeforeDebugDiscard, "DEBUG discard intentionally performs no durable review");
    await proposeVenueChange("park", {
      classes: ["workplace", "gathering"],
      title: "Open the workshop for gatherings",
      detail: "Add a shared table.",
    });
    const firstRenovation = (await readVillageState()).projects.find((entry) => entry.kind === "renovation")!;
    assert.equal(firstRenovation.lifecycle?.phase, "approval");
    await requestProjectMailbox(firstRenovation.id);
    let mail = (await readVillageState()).venueMail.at(-1)!;
    assert.equal(mail.status, "awaiting-villagers");
    assert.ok(Date.parse(mail.dueAt) > Date.parse(mail.createdAt));
    assert.deepEqual((await readVillageState()).venues[0]!.classes, ["workplace"], "a proposal waits for consent");
    await mutateVillageState((state) => {
      state.venueMail.at(-1)!.dueAt = new Date(Date.now() - 1000).toISOString();
    });
    await respondDueVenueMail();
    await settleBackgroundWork();
    mail = (await readVillageState()).venueMail.at(-1)!;
    assert.equal(mail.status, "approved");
    assert.ok(
      lastMailboxSystem.includes(renderPlayerRoleContext(await readVillageState())),
      "Mailbox replies receive the same narrative framing",
    );
    assert.equal(
      (await readVillageState()).projects.find((entry) => entry.id === firstRenovation.id)?.lifecycle?.phase,
      "builder",
    );
    assert.deepEqual(
      (await readVillageState()).venues[0]!.classes,
      ["workplace"],
      "approval does not perform construction",
    );
    await mutateVillageState((state) => {
      state.projects = state.projects.filter((entry) => entry.id !== firstRenovation.id);
    });
    await mutateVillageState((state) => {
      const request = state.pendingDecisions.find((entry) => entry.venueDraft?.name === "Power Plant")!;
      queueVenueCounteroffer(
        state,
        request.id,
        { name: "Hydro Station", classes: ["workplace"] },
        "A river station that brings light to the village.",
        new Date(),
      );
      state.venueMail.at(-1)!.dueAt = new Date(Date.now() - 1_000).toISOString();
    });
    await respondDueVenueMail();
    await settleBackgroundWork();
    const acceptedCounteroffer = await readVillageState();
    assert.equal(acceptedCounteroffer.venueMail.at(-1)?.status, "approved");
    assert.equal(
      acceptedCounteroffer.projects.find((entry) => entry.venueDraft?.name === "Hydro Station")?.status,
      "draft",
    );
    assert.equal(
      acceptedCounteroffer.venues.some((venue) => venue.name === "Hydro Station"),
      false,
    );
    mailboxAccept = false;
    await proposeVenueChange("park", { capacity: 2, title: "Make more room", detail: "Add another cot." });
    const secondRenovation = (await readVillageState()).projects.find((entry) => entry.kind === "renovation")!;
    await requestProjectMailbox(secondRenovation.id);
    await mutateVillageState((state) => {
      state.venueMail.at(-1)!.dueAt = new Date(Date.now() - 1000).toISOString();
    });
    await respondDueVenueMail();
    await settleBackgroundWork();
    assert.equal((await readVillageState()).venueMail.at(-1)!.status, "declined");
    assert.equal((await readVillageState()).venues[0]!.residenceCapacity, 1);
    await mutateVillageState((state) => {
      state.projects = state.projects.filter((entry) => entry.id !== secondRenovation.id);
    });
    await recordVillagerVenueImprovement("bob", "park", "I could add a sturdy workbench.", "fixture-improvement");
    mail = (await readVillageState()).venueMail.at(-1)!;
    assert.equal(mail.status, "pending-player");
    await decideVillagerVenueImprovement(mail.id, true, {});
    assert.equal((await readVillageState()).venueMail.at(-1)!.status, "approved");
    assert.equal((await readVillageState()).venues[0]!.improvements?.[0], null);
    assert.match(
      (await readVillageState()).projects.find((entry) => entry.kind === "renovation")?.lifecycle?.change?.detail ?? "",
      /sturdy workbench/u,
    );
    await mutateVillageState((state) => {
      state.venues.push({
        ...venue("home"),
        classes: ["residence"],
        residentIds: ["bob", "tina"],
        residenceCapacity: 2,
        occupancy: { playerHome: false, residentCharacterId: "bob", homeKind: "small-home" },
      } as any);
      for (const resident of state.villagers)
        if (resident.characterId === "bob" || resident.characterId === "tina") {
          resident.agenda = agenda("home");
          if (resident.characterId === "tina")
            resident.agenda.activeDay!.blocks.forEach((block) => (block.zoneId = "residence"));
        }
    });
    await mutateVillageState((state) => {
      for (const room of state.venues.find((venue) => venue.id === "home")!.zones ?? [])
        if (room.preparation) room.preparation = { status: "ready" };
    });
    const redacted = await buildVillageSnapshot();
    const hiddenHome = redacted.settings.venues.find((place) => place.id === "home")!;
    assert.equal(
      hiddenHome.spaces?.find((space) => space.venueClass === "residence")?.description,
      "",
      "View Venue does not reveal an uninvited Residence interior",
    );
    await assert.rejects(
      () => enterVenue("home", "residence", "", "shared"),
      /invitation/u,
      "an explicit interior visit cannot silently become an exterior visit",
    );
    await assert.rejects(
      () => enterVenue("home", "residence", "bob", "private"),
      /invitation/u,
      "an explicit private visit requires its owner's invitation",
    );
    const selectedExterior = await enterVenue("home", "residence", "", "outside");
    assert.equal(selectedExterior.area, "outside");
    await assert.rejects(
      () => enterVenue("home", "residence", "", "shared", undefined, selectedExterior.sceneRevision),
      /finish opening/u,
      "navigation waits for the exterior scene to finish opening",
    );
    await endVenueSession(selectedExterior.id);
    let outside = await enterVenue("home", "residence");
    assert.equal(outside.area, "outside");
    outside = await greetVenue(outside.id);
    assert.equal(outside.area, "outside", "an unresponsive resident leaves the player outside");
    const beforeOutsideQuiet = calls;
    const outsideQuiet = await sendVenueTurn({
      sessionId: outside.id,
      message: "Wait outside quietly",
      mode: "chat",
      targetId: "bob",
      submissionId: "outside-quiet",
    });
    assert.equal(calls - beforeOutsideQuiet, 1);
    assert.equal(outsideQuiet.session.lines.at(-1)?.kind, "narration");
    await assert.rejects(() => enterResidencePrivateSpace(outside.id, "bob"), /invitation/u);
    const vaguePrivate = await sendVenueTurn({
      sessionId: outside.id,
      message: "Can I use Bob's room",
      mode: "chat",
      targetId: "",
      submissionId: "vague-private-invite",
    });
    assert.equal(vaguePrivate.session.area, "outside", "a contextual short invitation waits for acceptance");
    assert.ok(
      vaguePrivate.session.entryOffers?.some((offer) => offer.zoneId === "private:bob"),
      "Oh yeah answers the preceding request for Bob's room without repeating its name",
    );
    const invited = await sendVenueTurn({
      sessionId: outside.id,
      message: "Please let me in",
      mode: "chat",
      targetId: "",
      submissionId: "home-invite-now",
    });
    assert.equal(invited.session.area, "outside", "spoken invitation waits for player acceptance");
    await moveVenueZone(outside.id, "residence");
    await mutateVillageState((state) => {
      for (const resident of state.villagers.filter((person) => ["bob", "tina"].includes(person.characterId))) {
        resident.agenda!.day.forEach((block) => (block.zoneId = "residence"));
        resident.agenda!.activeDay!.blocks.forEach((block) => (block.zoneId = "residence"));
      }
    });
    const roomBefore = (await readVillageState()).venues
      .find((place) => place.id === "home")!
      .spaces!.find((space) => space.venueClass === "residence")!;
    await updateVillageVenue("home", { description: "A quiet exterior." });
    assert.equal(
      (await readVillageState()).venues.find((place) => place.id === "home")?.description,
      "A quiet exterior.",
    );
    const proposed = await proposeResidenceSpaceEdit("home", {
      target: "shared",
      description: "A warm Common Space.",
      state: { condition: "warm", items: ["cup"] },
    });
    assert.equal(proposed.settings.venues.find((place) => place.id === "home")?.editProposals?.length, 1);
    await assert.rejects(() => updateVillageVenue("home", { form: "A quiet home." }), /only name and description/u);
    await sendVenueTurn({
      sessionId: outside.id,
      message: "Bob approves the edit",
      mode: "chat",
      targetId: "",
      submissionId: "bob-edit-approval",
    });
    let home = (await readVillageState()).venues.find((place) => place.id === "home")!;
    assert.equal(
      home.spaces?.find((space) => space.venueClass === "residence")?.description,
      roomBefore.description,
      "one of two residents cannot change the Common Space",
    );
    await sendVenueTurn({
      sessionId: outside.id,
      message: "Tina approves the edit",
      mode: "chat",
      targetId: "",
      submissionId: "tina-edit-approval",
    });
    home = (await readVillageState()).venues.find((place) => place.id === "home")!;
    assert.equal(home.spaces?.find((space) => space.venueClass === "residence")?.description, "A warm Common Space.");
    await setVillageVenueImage(
      "home",
      { id: "shared-image", ref: "global-gallery:shared-image", url: "/shared.webp" },
      "residence",
    );
    home = (await readVillageState()).venues.find((place) => place.id === "home")!;
    assert.equal(
      home.spaces?.find((space) => space.venueClass === "residence")?.image?.id,
      "shared-image",
      "a visited Residence image belongs to the player and changes immediately",
    );
    assert.equal(home.editProposals?.length, 0, "the image does not create a resident approval proposal");
    assert.equal(
      (await readVillageState()).venues
        .find((place) => place.id === "home")
        ?.spaces?.find((space) => space.venueClass === "residence")?.image?.id,
      "shared-image",
    );
    const privateInvite = await sendVenueTurn({
      sessionId: outside.id,
      message: "Please enter Bob's private space",
      mode: "chat",
      targetId: "",
      submissionId: "home-private-now",
    });
    assert.equal(privateInvite.session.area, "shared", "private permission also waits for acceptance");
    const acceptedPrivate = await moveVenueZone(outside.id, "private:bob");
    assert.equal(acceptedPrivate.area, "private");
    assert.equal(acceptedPrivate.privateOwnerId, "bob");
    const beforePrivateQuiet = calls;
    const privateQuiet = await sendVenueTurn({
      sessionId: outside.id,
      message: "Look around the Private Space",
      mode: "chat",
      targetId: "bob",
      submissionId: "private-quiet",
    });
    assert.equal(calls - beforePrivateQuiet, 1);
    assert.equal(privateQuiet.session.lines.at(-1)?.kind, "narration");
    await generateFirstPrivateSpaceImage("home", "bob");
    const firstImageAttempt = (await readVillageState()).venues
      .find((place) => place.id === "home")
      ?.privateSpaces?.find((space) => space.ownerId === "bob")?.initialImageAttemptedAt;
    assert.ok(firstImageAttempt, "the first private entry records one automatic image attempt");
    await generateFirstPrivateSpaceImage("home", "bob");
    assert.equal(
      (await readVillageState()).venues
        .find((place) => place.id === "home")
        ?.privateSpaces?.find((space) => space.ownerId === "bob")?.initialImageAttemptedAt,
      firstImageAttempt,
      "later visits cannot claim another automatic draw, even after a failed first draw",
    );
    const privateBefore = home.privateSpaces?.find((space) => space.ownerId === "bob")?.description;
    await proposeResidenceSpaceEdit("home", { target: "private", ownerId: "bob", description: "Bob's snug nook." });
    assert.equal(
      (await readVillageState()).venues
        .find((place) => place.id === "home")
        ?.privateSpaces?.find((space) => space.ownerId === "bob")?.description,
      privateBefore,
    );
    await setVillageVenueImage(
      "home",
      { id: "private-image", ref: "global-gallery:private-image", url: "/private.webp" },
      "residence",
      "bob",
    );
    assert.equal(
      (await readVillageState()).venues.find((place) => place.id === "home")?.editProposals?.length,
      1,
      "changing an image does not add a second room proposal",
    );
    await sendVenueTurn({
      sessionId: outside.id,
      message: "Bob approves the edit",
      mode: "chat",
      targetId: "",
      submissionId: "bob-private-approval",
    });
    assert.equal(
      (await readVillageState()).venues
        .find((place) => place.id === "home")
        ?.privateSpaces?.find((space) => space.ownerId === "bob")?.description,
      "Bob's snug nook.",
    );
    assert.equal(
      (await readVillageState()).venues
        .find((place) => place.id === "home")
        ?.privateSpaces?.find((space) => space.ownerId === "bob")?.image?.id,
      "private-image",
      "resident approval of room text does not overwrite a player-chosen image",
    );
    await leaveVenueSession(outside.id, "home-leave");
    await assert.rejects(
      () =>
        setVillageVenueImage(
          "home",
          { id: "private-redraw", ref: "global-gallery:private-redraw", url: "/redraw.webp" },
          "residence",
          "bob",
        ),
      /current invitation/,
    );
    assert.equal(
      (await readVillageState()).venues
        .find((place) => place.id === "home")
        .privateSpaces.find((space) => space.ownerId === "bob").image.id,
      "private-image",
      "discovery preserves artwork without granting future room actions",
    );
    const persistedForMigration = await readVillageState();
    const homeForMigration = persistedForMigration.venues.find((place) => place.id === "home")!;
    const roomForMigration = homeForMigration.privateSpaces!.find((space) => space.ownerId === "bob")!;
    const migrated = coerceVillageState({
      wishSystemVersion: 3,
      ...persistedForMigration,
      venues: persistedForMigration.venues.map((place) =>
        place.id === "home"
          ? {
              ...place,
              editProposals: [
                {
                  id: "legacy-image-proposal",
                  target: "private",
                  ownerId: "bob",
                  baseUpdatedAt: roomForMigration.state.updatedAt,
                  proposed: {
                    ...roomForMigration,
                    image: { id: "older-image", ref: "global-gallery:older-image", url: "/older.webp" },
                  },
                  requiredIds: ["bob"],
                  approvedIds: [],
                  declined: false,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : place,
      ),
    });
    assert.equal(
      migrated.venues.find((place) => place.id === "home")?.editProposals?.length,
      0,
      "legacy image-only proposals are retired when persisted state is read",
    );
    await mutateVillageState((state) => {
      for (const resident of state.villagers.filter((person) => ["bob", "tina"].includes(person.characterId))) {
        resident.agenda!.day.forEach((block) => (block.zoneId = "exterior"));
        resident.agenda!.activeDay!.blocks.forEach((block) => (block.zoneId = "exterior"));
      }
    });
    outside = await greetVenue((await enterVenue("home", "residence")).id);
    assert.equal(outside.area, "outside");
    await sendVenueTurn({
      sessionId: outside.id,
      message: "Come visit tomorrow",
      mode: "chat",
      targetId: "",
      submissionId: "home-invite-later",
    });
    await leaveVenueSession(outside.id, "home-leave-later");
    const returnVisit = await enterVenue("home", "residence");
    assert.equal(returnVisit.area, "shared", "a later invitation is spent on one visit");
    await endVenueSession(returnVisit.id);
    const followingVisit = await enterVenue("home", "residence");
    assert.equal(followingVisit.area, "outside", "the same invitation cannot be spent twice");
    await endVenueSession(followingVisit.id);
    await mutateVillageState((state) => {
      for (const resident of state.villagers)
        if (resident.characterId === "bob" || resident.characterId === "tina") resident.agenda = agenda("park");
    });
    const emptyOutside = await enterVenue("home", "residence");
    assert.equal(emptyOutside.area, "outside");
    assert.deepEqual(emptyOutside.activeIds, []);
    const waitingOutside = await sendVenueTurn({
      sessionId: emptyOutside.id,
      message: "I wait quietly",
      mode: "chat",
      targetId: "",
      submissionId: "home-empty-outside",
    });
    assert.equal(waitingOutside.session.lines.at(-1)?.content, "No one comes to the door.");
    await sendVenueTurn({
      sessionId: emptyOutside.id,
      message: "I place a sign outside",
      mode: "chat",
      targetId: "",
      submissionId: "home-outside-sign",
    });
    const exteriorChanged = (await readVillageState()).venues.find((place) => place.id === "home")!;
    assert.deepEqual(exteriorChanged.exteriorState?.items, ["sign"]);
    assert.deepEqual(exteriorChanged.spaces?.find((space) => space.venueClass === "residence")?.state.items, ["cup"]);
    await endVenueSession(emptyOutside.id);
    await mutateVillageState((state) => {
      const oldHome = state.venues.find((place) => place.id === "home")!;
      const oldRoom = oldHome.privateSpaces!.find((space) => space.ownerId === "bob")!;
      oldRoom.description = `A private space for this resident at ${oldHome.name}.`;
      oldRoom.state.items = [];
      oldRoom.state.features = [];
      state.venues.push({
        ...venue("new-home"),
        classes: ["residence"],
        residentIds: [],
        residenceCapacity: 1,
      } as any);
      state.residences = state.residences.filter((entry) => entry.characterId !== "bob");
      state.residences.push({
        characterId: "bob",
        venueId: "home",
        status: "moving",
        proposedVenueId: "new-home",
        requestedAt: new Date().toISOString(),
        requestedBy: "player",
        villagerDecision: "approved",
        approvedAt: new Date().toISOString(),
        completesAt: new Date().toISOString(),
      });
    });
    await completeVillageResidence("bob", true);
    const afterMove = await readVillageState();
    const destination = afterMove.venues.find((place) => place.id === "new-home")!;
    assert.equal(afterMove.venues.find((place) => place.id === "home")?.playerSeenPrivateIds?.includes("bob"), false);
    assert.equal(
      afterMove.venues.find((place) => place.id === "home")?.privateSpaces?.some((space) => space.ownerId === "bob"),
      false,
    );
    assert.equal(destination.playerSeenPrivateIds?.includes("bob"), false);
    assert.equal(
      destination.privateSpaces?.find((space) => space.ownerId === "bob"),
      undefined,
      "no physical Private Space is created by a move",
    );
    assert.ok(!destination.privateSpaces?.find((space) => space.ownerId === "bob")?.initialImageAttemptedAt);
    await assert.rejects(
      () => setVillageVenueImage("new-home", null, "residence", "bob"),
      /Visit this Residence space|current invitation|no longer exists/u,
      "images cannot target a Private Space that was never assigned",
    );
    const parkExterior = await enterVenue("park", "workplace", "", "outside");
    assert.equal(parkExterior.area, "outside", "a public Venue also supports an explicit exterior visit");
    await endVenueSession(parkExterior.id);
    await mutateVillageState((state) => {
      for (const person of state.villagers)
        for (const block of person.agenda?.activeDay?.blocks ?? []) block.venueId = "park";
    });
    const live = await greetVenue((await enterVenue("park")).id);
    assert.equal(live.memoryMode, "live");
    const beforeLive = { calls, memoryCalls, reviewCalls };
    const liveTurn = await sendVenueTurn({
      sessionId: live.id,
      submissionId: "live-commitment",
      mode: "chat",
      targetId: "bob",
      message: "Live commitment",
    });
    assert.equal(liveTurn.recordEvents.filter((event) => event.kind === "memory").length, 1);
    assert.ok((await readVillageState()).chronicle.some((entry) => entry.id === live.id + ":live-commitment:memory:0"));
    const beforeTruncated = calls;
    const truncated = await sendVenueTurn({
      sessionId: live.id,
      submissionId: "live-truncated",
      mode: "chat",
      targetId: "bob",
      message: "Live truncated metadata",
    });
    assert.equal(calls, beforeTruncated + 1, "trailing metadata truncation does not trigger a paid narration repair");
    assert.ok(truncated.session.lines.some((line) => line.content === "Let us keep talking about those seedlings."));
    const diagnostics = await readSceneChanges(live.id);
    assert.equal(diagnostics.changes.at(-1)?.processing?.domains.memories.status, "failed");
    await endVenueSession(live.id);
    assert.equal(memoryCalls, beforeLive.memoryCalls, "fresh Scene closing makes no memory review calls");
    assert.equal(reviewCalls, beforeLive.reviewCalls, "fresh Scene closing makes no relationship review calls");
    await saveVillageWriting({ writingGuidance: "An old village's style" });
    await resetVillage();
    assert.deepEqual((await readVillageState()).narrationStyle, defaultVillageState().narrationStyle);
    console.log("villages-venue-session: ok");
  } finally {
    release();
  }
}

void main();
