import { processSavedExchange } from "../packages/villages/src/server/features/scenes/progress.js";
import { createExchangeProcessing } from "../packages/villages/src/server/domain/decoding/exchange-codec.js";
import { availableProjectSupplyTransfers } from "../packages/villages/src/server/domain/rules/project-supply-transfer.js";
import {
  bindProjectSpeech,
  projectSpeechContexts,
  validateProjectSpeech,
  type ProjectSpeechProposal,
} from "../packages/villages/src/server/domain/rules/project-interpretation.js";
import assert from "node:assert/strict";
import { recordProjectProgress } from "../packages/villages/src/server/domain/rules/project-progress.js";
import { unwrittenVillageAgenda } from "../packages/villages/src/server/domain/rules/agenda-plan.js";
import {
  acceptProjectRequirements,
  createNewVenueProject,
  saveProjectPlan,
  createRenovationProject,
  lockProjectBuilder,
  placeNewVenueProject,
} from "../packages/villages/src/server/features/projects/project-lifecycle.js";
import { recordExistingProjectSource } from "../packages/villages/src/server/features/projects/project-evidence.js";
import { sendVenueTurn } from "../packages/villages/src/server/features/scenes/venue-session.js";
import { processSavedProgressSubmission } from "../packages/villages/src/server/features/scenes/progress.js";

import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { mutateVillageState, readVillageState } from "../packages/villages/src/server/features/world/village-store.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import type { VillageVenue, VillageVillager } from "../packages/villages/src/server/domain/models/world.js";

const records = new Map<string, any>();
let failVillageWrites = 0;
let failWritesAfterReply = 0;
let reviseAfterPhysical = false;
const warnings: string[] = [];
const documents = {
  async getById(_packageId: string, id: string) {
    return records.get(id) ?? null;
  },
  async list(_packageId: string, kind: string) {
    return [...records.values()].filter((row) => row.kind === kind);
  },
  async create(input: any) {
    const row = { ...input, revision: 1 };
    records.set(input.id, row);
    return row;
  },
  async update(input: any) {
    if (
      input.id === "villages-village" &&
      failVillageWrites > 0 &&
      input.data.projects?.some((project: any) => project.lifecycle?.candidates?.length)
    ) {
      failVillageWrites--;
      return null;
    }
    const previous = records.get(input.id);
    if (!previous || previous.revision !== input.expectedRevision) return null;
    const row = { ...previous, ...input, revision: previous.revision + 1 };
    records.set(input.id, row);
    if (
      reviseAfterPhysical &&
      input.id === "villages-village" &&
      Object.values(row.data.exchangeReceipts ?? {}).some(
        (receipt: any) => receipt.physicalOutcome?.actionReceipt?.projectSupplyTransfer,
      )
    ) {
      reviseAfterPhysical = false;
      row.data.progressTasks.find((task: any) => task.definition.owner.kind === "project").definition.revision++;
    }
    return row;
  },
  async remove(_packageId: string, id: string) {
    return records.delete(id);
  },
};
const foundedAt = new Date().toISOString();
const village = defaultVillageState();
village.seed = "project-interpretation-test";
village.setupAt = foundedAt;
village.foundedAt = foundedAt;
village.progressEngineVersion = 1;
const mill: VillageVenue = {
  id: "mill",
  name: "Old Mill",
  classes: ["workplace"],
  spaces: [defaultVenueSpace("workplace", "A working mill.")],
  description: "A working mill.",
  category: "",
  presentation: { image: null, x: 0.3, y: 0.3 },
  occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
  capabilities: [],
  workerIds: ["rosa"],
  residenceCapacity: 1,
  residentIds: [],
  improvements: [null, null],
  state: { condition: "standing", upgrades: [], furniture: ["benches"], publicFacts: [], updatedAt: foundedAt },
};
village.venues.push(mill);
for (const [id, name] of [
  ["rosa", "Rosa"],
  ["ivo", "Ivo"],
])
  village.villagers.push({
    characterId: id,
    cardSnapshot: { id, revision: 1, sourceStatus: "available", name, capturedAt: foundedAt },
    agenda: unwrittenVillageAgenda(village.venues, name),
    addedAt: foundedAt,
    completedWishes: [],
  } as VillageVillager);
records.set("villages-village", { id: "villages-village", kind: "village", data: village, revision: 1 });
let modelCalls = 0;
let interpretationCalls = 0;
let modelReply: Record<string, unknown> = {};
let lastPrompt = "";
const release = configureVillagesRuntime({
  getAgentConfig: async () => ({ connectionId: "fixture" }),
  logger: {
    debug() {},
    info() {},
    warn(...args: unknown[]) {
      warnings.push(args.join(" "));
    },
    error() {},
    debugOverride() {},
  },
  isDebugAgentsEnabled: () => true,
  persistence: { documents },
  languageModels: {
    async resolveForRequest() {
      return {
        model: "fixture",
        maxOutputTokens: 4096,
        fitContext(messages: any[], options: any) {
          return { messages, ...options };
        },
        async chatComplete(messages: any[]) {
          if (messages[0]?.content.startsWith("Interpret nearby attention")) {
            const wire = JSON.parse(messages[1].content);
            return {
              content: JSON.stringify({
                results: wire.checks.map((check: any) => ({
                  id: check.id,
                  outcome: "local",
                  evidenceIds: ["player-input"],
                  reason: "Local Project speech fixture",
                })),
              }),
              finishReason: "stop",
            };
          }
          if (messages[0]?.content.startsWith("Interpret the meaning of witnessed Scene evidence")) {
            interpretationCalls++;
            const { checks } = JSON.parse(messages[1].content);
            return {
              content: JSON.stringify({
                results: checks.map((check: any) => {
                  const proposal = Array.isArray(modelReply.projectSpeech)
                    ? modelReply.projectSpeech.find(
                        (item: any) =>
                          item.projectId === check.facts.projectId &&
                          item.speakerId === check.facts.actorId &&
                          item.kind === check.facts.kind,
                      )
                    : null;
                  return {
                    id: check.id,
                    outcome: proposal ? check.outcomes[0].id : "none",
                    evidenceIds: proposal ? ["draft:1"] : [],
                    reason: "Independent labeled fixture",
                    ...(proposal?.kind === "requirements"
                      ? {
                          details: {
                            citations: proposal.citations.map((citation: any) => ({
                              evidenceId: `draft:${citation.segment + 1}`,
                              quote: citation.quote,
                            })),
                            checklist: proposal.checklist,
                          },
                        }
                      : {}),
                  };
                }),
              }),
              finishReason: "stop",
            };
          }
          modelCalls++;
          lastPrompt = messages.map((message) => message.content).join("\n");
          const current = messages.at(-1).content;
          const reply = structuredClone(modelReply) as any;
          reply.segments = [{ kind: "dialogue", speakerId: "player", text: current }, ...reply.segments];
          reply.playerSpeechCapture = {
            status: "captured",
            segments: [{ segment: 0, sources: [{ text: current, occurrence: 1 }] }],
          };
          for (const proposal of reply.projectSpeech ?? [])
            for (const citation of proposal.citations) citation.segment++;
          failVillageWrites += failWritesAfterReply;
          failWritesAfterReply = 0;
          return { content: JSON.stringify(reply), finishReason: "stop" };
        },
      };
    },
  },
} as Parameters<typeof configureVillagesRuntime>[0]);

let turnNumber = 0;
function saveTurn(message: string, content: string, speakerId = "rosa", venueId = "mill") {
  const number = ++turnNumber;
  const sessionId = `visit-${number}`;
  const submissionId = `turn-${number}`;
  const lineId = `line-${number}`;
  const at = new Date(Date.now() + 60_000 + number * 1_000).toISOString();
  records.set(`villages-venue-visit-${sessionId}`, {
    id: `villages-venue-visit-${sessionId}`,
    kind: "venue-visit",
    revision: 1,
    data: {
      id: sessionId,
      placeId: venueId,
      placeName: venueId,
      status: "closed",
      startedAt: at,
      participants: [{ characterId: speakerId, name: speakerId }],
      activeIds: [speakerId],
      submissions: [
        {
          id: submissionId,
          message,
          mode: "chat",
          targetId: speakerId,
          activeIdsAtTurn: [speakerId],
          replyLineIds: [lineId],
          at,
        },
      ],
      lines: [
        { id: `user-${number}`, speakerId: "", role: "user", content: message, at, heardBy: [speakerId] },
        { id: lineId, speakerId, role: "assistant", kind: "dialogue", content, at, heardBy: [speakerId] },
      ],
    },
  });
  return { sessionId, submissionId, lineId, at };
}

function doorway(turn: ReturnType<typeof saveTurn>) {
  const data = records.get(`villages-venue-visit-${turn.sessionId}`).data;
  data.submissions[0].mode = "contact";
  data.submissions[0].speechIdsAtTurn = [...data.submissions[0].activeIdsAtTurn];
  data.submissions[0].activeIdsAtTurn = [];
  data.activeIds = [];
  data.lines[1].viaDoorway = true;
}

async function main() {
  // A saved live offer omitted the supply ID: it could pass speech validation,
  // then fail only after committing the Scene and reaching the supply handler.
  const supplySpeech = "Happy to contribute the medium and fine paper, oil and sound cloth.";
  const supplyLines = [{ id: "0", speakerId: "rosa", kind: "dialogue", content: supplySpeech }];
  for (const kind of ["offer", "handoff"] as const) {
    const proposal = bindProjectSpeech(
      [
        {
          projectId: "shelf",
          kind,
          speakerId: "rosa",
          citations: [{ segment: 0, quote: supplySpeech }],
          checklist: [],
        },
      ],
      [{ projectId: "shelf", revision: 2, phase: "materials" }],
      supplyLines,
    )[0];
    proposal.contextual = { version: 1, source: "system", checkId: "frozen-source" };
    assert.match(validateProjectSpeech(proposal, supplyLines), /requirement ID/u);
    proposal.requirementId = "shelf:2:finish";
    assert.equal(validateProjectSpeech(proposal, supplyLines), "");
    proposal.requirementId = " ";
    assert.match(validateProjectSpeech(proposal, supplyLines), /requirement ID/u);
  }

  try {
    await createNewVenueProject({ name: "Repair Kiosk", venueClass: "workplace", description: "Small repairs." });
    const projectId = (await readVillageState()).projects[0]!.id;
    await placeNewVenueProject(projectId, { x: 0.7, y: 0.7 });
    await saveProjectPlan(projectId, {
      layoutVersion: 1,
      layout: "common",
      form: "A repair kiosk",
      exteriorDescription: "A kiosk entrance.",
      spaces: [
        {
          id: "common:base",
          venueClass: "workplace",
          name: "Workshop",
          purpose: "Repairs",
          description: "A workbench.",
        },
      ],
      privateSpaces: [],
    });
    const scopedState = await readVillageState();
    assert.equal(
      projectSpeechContexts(
        scopedState,
        ["rosa"],
        "Can you build this?",
        "Can you build this?",
        scopedState.projects[0]!.venueId,
      ).length,
      1,
    );
    assert.equal(
      projectSpeechContexts(scopedState, ["rosa"], "Can you build this?", "Can you build this?", "mill").length,
      1,
    );
    const project = async () => (await readVillageState()).projects.find((entry) => entry.id === projectId)!;
    const task = async () =>
      (await readVillageState()).progressTasks.find((entry) => entry.definition.owner.id === projectId)!;
    function attach(
      turn: ReturnType<typeof saveTurn>,
      kind: ProjectSpeechProposal["kind"],
      checklist: ProjectSpeechProposal["checklist"] = [],
    ) {
      const doc = records.get(`villages-venue-visit-${turn.sessionId}`);
      const saved = doc.data.submissions[0];
      const current = records.get("villages-village").data;
      const contexts = projectSpeechContexts(current, saved.activeIdsAtTurn, saved.message);
      saved.projectContexts = contexts;
      saved.projectSpeech = bindProjectSpeech(
        [
          {
            projectId,
            kind,
            speakerId: doc.data.lines[1].speakerId,
            citations: [{ segment: 0, quote: doc.data.lines[1].content }],
            checklist,
          },
        ],
        contexts,
        [doc.data.lines[1]],
      );
      return saved;
    }
    const conditional = saveTurn("Will you build Repair Kiosk?", "I might build it if Ella agrees.");
    attach(conditional, "builder");
    await processSavedProgressSubmission(conditional.sessionId, conditional.submissionId);
    assert.equal((await project()).lifecycle!.candidates.length, 0);
    assert.match((await task()).attempts.at(-1)!.reason, /conditional/u);
    const capability = saveTurn("Can you build Repair Kiosk?", "I can build small kiosks. I have the skills.");
    await processSavedProgressSubmission(capability.sessionId, capability.submissionId);
    assert.equal((await project()).lifecycle!.candidates.length, 0, "capability alone is not a commitment");
    const wrongQuote = saveTurn("Will you build Repair Kiosk?", "I only want to look at the plan.");
    attach(wrongQuote, "builder").projectSpeech[0].citations[0].quote = "I'll build it.";
    await processSavedProgressSubmission(wrongQuote.sessionId, wrongQuote.submissionId);
    assert.equal((await project()).lifecycle!.candidates.length, 0);
    assert.match((await task()).attempts.at(-1)!.reason, /citation/u);
    const absent = saveTurn("Will you build Repair Kiosk?", "I'll build it.");
    attach(absent, "builder");
    records.get(`villages-venue-visit-${absent.sessionId}`).data.submissions[0].activeIdsAtTurn = [];
    await processSavedProgressSubmission(absent.sessionId, absent.submissionId);
    assert.equal((await project()).lifecycle!.candidates.length, 0);
    // A draft is interpreted independently before publication; saved proposals replay without another request.
    const at = new Date().toISOString();
    const sessionId = "actual-model-visit";
    records.set("villages-active-venue", {
      id: "villages-active-venue",
      kind: "active-venue",
      revision: 1,
      data: { sessionId },
    });
    records.set(`villages-venue-visit-${sessionId}`, {
      id: `villages-venue-visit-${sessionId}`,
      kind: "venue-visit",
      revision: 1,
      data: {
        id: sessionId,
        placeId: "mill",
        placeName: "Old Mill",
        area: "public",
        status: "active",
        memoryMode: "live",
        startedAt: at,
        lastActivityAt: at,
        activeIds: ["rosa"],
        participants: [{ characterId: "rosa", name: "Rosa", doing: "working" }],
        lines: [],
        submissions: [],
      },
    });
    modelReply = {
      heardPlayerBy: ["rosa"],
      segments: [
        { kind: "dialogue", speakerId: "rosa", text: "I'll build it, but I don't have the lumber.", heardBy: ["rosa"] },
      ],
      projectSpeech: [
        { projectId, kind: "builder", speakerId: "rosa", citations: [{ segment: 0, quote: "I'll build it" }] },
      ],
    };
    const builderInput = {
      sessionId,
      mode: "chat" as const,
      targetId: "rosa",
      message: "Will you build Repair Kiosk?",
      submissionId: "real-builder",
    };
    failVillageWrites = 3; // saved dialogue survives interruption before the progress write
    let builderReply = await sendVenueTurn(builderInput);
    assert.equal(modelCalls, 1, "interpretation does not regenerate dialogue");
    assert.ok(interpretationCalls > 0, "System-only interpretation remains available independently");
    assert.match(lastPrompt, /Relevant public Projects/u);
    assert.doesNotMatch(lastPrompt, /exact labels/u);
    assert.equal((await project()).lifecycle!.candidates.length, 0);
    assert.match(builderReply.session.submissions[0].progressError!, /kept changing/u);
    assert.equal(builderReply.recordEvents.filter((event) => event.kind === "project").length, 0);
    builderReply = await sendVenueTurn(builderInput);
    assert.equal((await project()).lifecycle!.candidates.length, 1);
    assert.equal((await project()).lifecycle!.builderId, "", "Assign remains a decision");
    const builderLine = builderReply.session.submissions[0].replyLineIds![1];
    assert.equal(builderReply.session.submissions[0].projectSpeech![0].citations[0].lineId, builderLine);
    assert.ok(builderReply.session.submissions[0].progressProcessedAt);
    assert.equal(builderReply.recordEvents.filter((event) => event.kind === "project").length, 1);
    await sendVenueTurn(builderInput);
    assert.equal(modelCalls, 1, "duplicate request generates nothing");
    await lockProjectBuilder(projectId, { residentId: "rosa" });
    assert.equal(
      (await task()).receipts.find((receipt) => receipt.requirementId === "builder-selected")!.evidence.grade,
      "cited-interpretation",
    );
    const checklist = [
      { category: "structure" as const, title: "pressure-treated lumber", needed: true, citation: 0 },
      { category: "equipment" as const, title: "clamp-style bike stand", needed: true, citation: 1 },
      { category: "finish" as const, title: "weatherproof sealant", needed: true, citation: 2 },
    ];
    const quotes = [
      "Structure: pressure-treated lumber, like a proper frame with a countertop surface",
      "Equipment: a basic bike stand, the clamp-style kind you can bolt down",
      "Finish: weatherproof sealant for the wood",
    ];
    // Gidget's natural list; preserves specifications in concise titles rather than losing them.
    checklist[0]!.title = "pressure-treated lumber frame and countertop";
    checklist[1]!.title = "bolt-down clamp-style bike stand";
    checklist[2]!.title = "weatherproof wood sealant";
    modelReply = {
      heardPlayerBy: ["rosa"],
      segments: [
        {
          kind: "dialogue",
          speakerId: "rosa",
          heardBy: ["rosa"],
          text: `Okay so — ${quotes.join("; ")}. That's it. That's the whole list.`,
        },
      ],
      projectSpeech: [
        {
          projectId,
          kind: "requirements",
          speakerId: "rosa",
          citations: quotes.map((quote) => ({ segment: 0, quote })),
          checklist,
        },
      ],
    };
    const planReply = await sendVenueTurn({
      sessionId,
      message: "What do we need?",
      mode: "chat",
      targetId: "rosa",
      submissionId: "real-plan",
    });
    assert.equal(modelCalls, 2, "a natural checklist does not regenerate dialogue");
    assert.equal((await project()).lifecycle!.requirements.length, 3);
    assert.equal((await project()).lifecycle!.phase, "requirements", "Accept plan remains a decision");
    assert.equal((await project()).lifecycle!.requirements[0]!.title, checklist[0]!.title);
    const savedPlan = records
      .get(`villages-venue-visit-${sessionId}`)
      .data.submissions.find((entry: any) => entry.id === "real-plan");
    savedPlan.progressProcessedAt = ""; // interruption after applying state, before marking processed
    await processSavedProgressSubmission(sessionId, "real-plan");
    assert.equal((await project()).lifecycle!.spokenProofs.length, 2);
    assert.equal(modelCalls, 2);
    const badCategory = structuredClone(savedPlan.projectSpeech[0]);
    delete badCategory.contextual; // Preserved old proposals keep their original phrase validation.
    badCategory.checklist[2].needed = false;
    assert.match(validateProjectSpeech(badCategory, planReply.session.lines), /unnecessary/u);
    badCategory.checklist.pop();
    assert.match(validateProjectSpeech(badCategory, planReply.session.lines), /three/u);
    const stalePlan = saveTurn("Repair Kiosk checklist", "Structure: timber; Equipment: benches; Finish: not needed.");
    const staleSaved = attach(stalePlan, "requirements", [
      { category: "structure", title: "timber", needed: true, citation: 0 },
      { category: "equipment", title: "benches", needed: true, citation: 0 },
      { category: "finish", title: "not needed", needed: false, citation: 0 },
    ]);
    staleSaved.projectSpeech[0].revision = 999;
    staleSaved.projectContexts[0].revision = 999;
    await processSavedProgressSubmission(stalePlan.sessionId, stalePlan.submissionId);
    assert.equal((await project()).lifecycle!.requirements[0]!.title, checklist[0]!.title);
    assert.match((await task()).attempts.at(-1)!.reason, /revision/u);
    // A parser-compatible revision works automatically even if the model omits extraction.
    const simplePlan = saveTurn(
      "Repair Kiosk checklist",
      "Okay so — Structure: timber; Equipment: benches; Finish: not needed.",
    );
    await processSavedProgressSubmission(simplePlan.sessionId, simplePlan.submissionId);
    assert.equal((await project()).lifecycle!.requirements[0]!.title, "timber");
    await acceptProjectRequirements(projectId);
    assert.equal((await project()).lifecycle!.phase, "materials");
    const flow = (await project()).lifecycle!;
    const timberId = flow.requirements.find((item) => item.title === "timber")!.id;
    const benchesId = flow.requirements.find((item) => item.title === "benches")!.id;
    const unsupported = saveTurn("I obtained timber for Repair Kiosk in another room", "That sounds useful.");
    await processSavedProgressSubmission(unsupported.sessionId, unsupported.submissionId);
    assert.equal((await project()).lifecycle!.sources.length, 0);
    const offer = saveTurn("Can you supply Repair Kiosk?", "I can supply timber.", "ivo");
    const savedOffer = attach(offer, "offer");
    savedOffer.projectSpeech[0].requirementId = timberId;
    savedOffer.projectSpeech[0].contextual = { version: 1, source: "system", checkId: "saved-system-offer" };
    savedOffer.projectInterpretationVersion = 1;
    savedOffer.semanticProvenance = { version: 2 };
    const beforeOffer = await readVillageState();
    const beforeOfferCalls = { modelCalls, interpretationCalls };
    await processSavedProgressSubmission(offer.sessionId, offer.submissionId);
    assert.equal((await project()).lifecycle!.sources.length, 1);
    assert.equal((await project()).lifecycle!.sources[0]!.acquiredAt, "");
    const offeredRequirement = (await project()).lifecycle!.requirements.find((item) => item.id === timberId)!;
    assert.equal(offeredRequirement.carriedAt, "");
    assert.equal(offeredRequirement.deliveredAt, "");
    assert.equal(
      (await task()).receipts.find((receipt) => receipt.requirementId === `source:${timberId}`)!.evidence.grade,
      "cited-interpretation",
    );
    await processSavedProgressSubmission(offer.sessionId, offer.submissionId);
    assert.equal((await project()).lifecycle!.sources.length, 1, "Saved offer replay records one finite source");
    assert.equal((await task()).receipts.filter((receipt) => receipt.requirementId === `source:${timberId}`).length, 1);
    const afterOffer = await readVillageState();
    assert.deepEqual(afterOffer.projectSourceClaims, beforeOffer.projectSourceClaims);
    assert.deepEqual(afterOffer.narrativeItems, beforeOffer.narrativeItems);
    assert.deepEqual(afterOffer.venues, beforeOffer.venues, "An interpreted offer does not debit physical inventory");
    assert.deepEqual(
      { modelCalls, interpretationCalls },
      beforeOfferCalls,
      "Saved source replay never calls a provider",
    );
    await assert.rejects(
      mutateVillageState((current) => {
        const target = current.projects.find((entry) => entry.id === projectId)!;
        target.lifecycle!.sources[0]!.acquiredAt = offer.at;
        target.lifecycle!.requirements.find((item) => item.id === timberId)!.carriedAt = offer.at;
        recordProjectProgress(current, target, `acquired:${timberId}`, {
          id: "forged-physical",
          kind: "project-handoff",
          at: offer.at,
          sourceId: "forged",
          lineId: offer.lineId,
          excerpt: "Here is timber",
          grade: "cited-interpretation",
        });
      }),
      /cannot authorize physical/u,
    );
    assert.equal((await project()).lifecycle!.requirements.find((item) => item.id === timberId)!.carriedAt, "");
    // Exercise the real saved-exchange physical writer, source claim and Project owner together.
    const beforePhysical = structuredClone(await readVillageState());
    const actual = saveTurn("Please hand me timber", "Ivo hands the timber to you.", "ivo");
    const actualScene = records.get("villages-venue-visit-" + actual.sessionId).data;
    const actualTurn = actualScene.submissions[0];
    const sourceZone = beforePhysical.projects.find((row) => row.id === projectId)!.lifecycle!.sources[0].zoneId;
    const transfer = availableProjectSupplyTransfers(beforePhysical, "mill", sourceZone, ["ivo"])[0];
    assert.ok(transfer);
    actualScene.processingVersion = 1;
    actualScene.villageSeed = beforePhysical.seed;
    actualScene.zoneId = sourceZone;
    actualTurn.zoneIdAtTurn = sourceZone;
    actualTurn.areaAtTurn = "public";
    actualTurn.physicalContext = { zoneId: sourceZone, witnessIds: ["ivo"] };
    actualTurn.physicalOutcomeVersion = 1;
    actualTurn.sceneChange = { narration: "Ivo hands the timber to you.", projectSupplyTransfer: transfer };
    actualTurn.action = { happened: true, ...actualTurn.sceneChange };
    actualTurn.semanticProvenance = { version: 2, authority: { physical: true, projects: false } };
    actualTurn.processing = createExchangeProcessing({
      seed: beforePhysical.seed,
      sceneId: actual.sessionId,
      submissionId: actual.submissionId,
      order: 0,
      lineIds: [actual.lineId],
      actionReceiptIds: [],
    });
    for (const [domain, row] of Object.entries(actualTurn.processing.domains))
      if (domain !== "projects") (row as any).status = "applied";
    const callsBeforePhysical = { modelCalls, interpretationCalls };
    reviseAfterPhysical = true;
    await processSavedExchange(actual.sessionId, actual.submissionId);
    const held = await readVillageState();
    assert.equal(
      held.projects.find((row) => row.id === projectId)!.lifecycle!.requirements.find((row) => row.id === timberId)!
        .carriedAt,
      "",
    );
    const heldTurn = records.get("villages-venue-visit-" + actual.sessionId).data.submissions[0];
    assert.equal(heldTurn.processing.domains.projects.status, "failed", "A changed allocation cannot silently settle");
    assert.notEqual(heldTurn.semanticReady, true);
    assert.equal(held.projectSourceClaims.length, beforePhysical.projectSourceClaims.length + 1);
    await processSavedExchange(actual.sessionId, actual.submissionId);
    assert.equal(
      (await readVillageState()).projectSourceClaims.length,
      held.projectSourceClaims.length,
      "Recovery never consumes the source twice",
    );
    await mutateVillageState((current) => {
      current.progressTasks.find((task) => task.definition.owner.id === projectId)!.definition.revision =
        transfer.revision;
    });
    await processSavedExchange(actual.sessionId, actual.submissionId);
    const physicallyAcquired = await readVillageState();
    const eventId = "venue-chat:" + actual.sessionId + ":" + actual.submissionId;
    assert.deepEqual(
      physicallyAcquired.exchangeReceipts[eventId].physicalOutcome!.actionReceipt!.projectSupplyTransfer,
      transfer,
    );
    assert.equal(
      physicallyAcquired.projects
        .find((row) => row.id === projectId)!
        .lifecycle!.requirements.find((row) => row.id === timberId)!.carriedAt,
      actual.at,
    );
    assert.equal(physicallyAcquired.projectSourceClaims.length, beforePhysical.projectSourceClaims.length + 1);
    assert.deepEqual(
      physicallyAcquired.venues.map((row) => row.state.furniture),
      beforePhysical.venues.map((row) => row.state.furniture),
      "Resident transfer never mints or removes unrelated room stock",
    );
    await processSavedExchange(actual.sessionId, actual.submissionId);
    assert.deepEqual(
      { modelCalls, interpretationCalls },
      callsBeforePhysical,
      "Physical receipt recovery makes no paid request or second judge",
    );
    assert.equal((await task()).receipts.filter((row) => row.requirementId === "acquired:" + timberId).length, 1);
    // Restore only this provider-free test fixture so legacy saved-history compatibility remains covered below.
    records.get("villages-village").data = beforePhysical;
    const wrongVenue = saveTurn(
      "Please hand over timber for Repair Kiosk",
      "Here is timber.",
      "ivo",
      (await project()).venueId,
    );
    await processSavedProgressSubmission(wrongVenue.sessionId, wrongVenue.submissionId);
    assert.equal((await project()).lifecycle!.requirements.find((item) => item.id === timberId)!.carriedAt, "");
    const remoteHandoff = saveTurn("Please hand over timber for Repair Kiosk", "Here is timber.", "ivo");
    doorway(remoteHandoff);
    await processSavedProgressSubmission(remoteHandoff.sessionId, remoteHandoff.submissionId);
    assert.equal(
      (await project()).lifecycle!.requirements.find((item) => item.id === timberId)!.carriedAt,
      "",
      "doorway speech cannot hand over a physical item",
    );
    const handoff = saveTurn("Please hand over timber for Repair Kiosk", "Here is timber.", "ivo");
    const quotedHandoff = saveTurn("Please hand over timber for Repair Kiosk", "Rosa says: “Here is timber.”", "ivo");
    records.get(`villages-venue-visit-${quotedHandoff.sessionId}`).data.lines[1].contactReport = true;
    await processSavedProgressSubmission(quotedHandoff.sessionId, quotedHandoff.submissionId);
    assert.equal(
      (await project()).lifecycle!.requirements.find((item) => item.id === timberId)!.carriedAt,
      "",
      "a physically present messenger's quoted report cannot hand over an item",
    );
    await processSavedProgressSubmission(handoff.sessionId, handoff.submissionId);
    assert.ok((await project()).lifecycle!.requirements.find((item) => item.id === timberId)!.carriedAt);
    await recordExistingProjectSource(projectId, { requirementId: benchesId, venueId: "mill" });
    const missingItem = saveTurn("May I take the benches?", "Here are benches.");
    await mutateVillageState((current) => {
      current.venues.find((venue) => venue.id === "mill")!.state.furniture = [];
    });
    await processSavedProgressSubmission(missingItem.sessionId, missingItem.submissionId);
    assert.equal((await project()).lifecycle!.requirements.find((item) => item.id === benchesId)!.carriedAt, "");
    // Restore stock, but require fresh speech; a rejected turn cannot silently become valid later.
    await mutateVillageState((current) => {
      current.venues.find((venue) => venue.id === "mill")!.state.furniture = ["benches"];
    });
    const benches = saveTurn("May I take the benches?", "Here are benches.");
    await processSavedProgressSubmission(benches.sessionId, benches.submissionId);
    records.get(`villages-venue-visit-${benches.sessionId}`).data.submissions[0].progressProcessedAt = "";
    await processSavedProgressSubmission(benches.sessionId, benches.submissionId);
    assert.equal((await task()).receipts.filter((receipt) => receipt.requirementId.startsWith("acquired:")).length, 2);
    assert.equal((await readVillageState()).venues.find((venue) => venue.id === "mill")!.state.furniture.length, 0);
    assert.equal((await project()).lifecycle!.phase, "materials", "Commit and Start remain decisions");
    assert.equal(modelCalls, 2, "saved-turn detection and replay make no model calls");
    assert.deepEqual(
      coerceVillageState(await readVillageState()).progressTasks,
      (await readVillageState()).progressTasks,
    );
    assert.deepEqual(coerceVillageState(await readVillageState()).projects, (await readVillageState()).projects);
    const interpretedBuilder = (await task()).receipts.find((receipt) => receipt.requirementId === "builder-selected")!;
    assert.ok(interpretedBuilder.evidence.citations?.length);
    await createRenovationProject("mill", {
      title: "Mill roof",
      detail: "Weatherproof roof",
      slot: 0,
      improvement: { title: "Roof", description: "Weatherproof", extraBeds: 0 },
    });
    const roofId = (await readVillageState()).projects.find((entry) => entry.kind === "renovation")!.id;
    const relayedApproval = saveTurn("Do you approve Mill roof?", "Yes, I approve Mill roof.");
    records.get(`villages-venue-visit-${relayedApproval.sessionId}`).data.lines[1].contactHidden = true;
    await processSavedProgressSubmission(relayedApproval.sessionId, relayedApproval.submissionId);
    assert.equal(
      (await readVillageState()).projects.find((entry) => entry.id === roofId)!.lifecycle!.phase,
      "approval",
      "hidden relay speech cannot become a witnessed Project approval",
    );
    const approval = saveTurn("Do you approve Mill roof?", "Yes, I approve Mill roof.");
    const quotedApproval = saveTurn("Do you approve Mill roof?", "Ivo says: “Yes, I approve Mill roof.”");
    records.get(`villages-venue-visit-${quotedApproval.sessionId}`).data.lines[1].contactReport = true;
    await processSavedProgressSubmission(quotedApproval.sessionId, quotedApproval.submissionId);
    assert.equal(
      (await readVillageState()).projects.find((entry) => entry.id === roofId)!.lifecycle!.phase,
      "approval",
      "conveying another resident's words is not the messenger's own approval",
    );
    doorway(approval);
    await processSavedProgressSubmission(approval.sessionId, approval.submissionId);
    assert.equal((await readVillageState()).projects.find((entry) => entry.id === roofId)!.lifecycle!.phase, "builder");
    modelReply = {
      segments: [{ kind: "dialogue", speakerId: "rosa", text: "Good afternoon.", heardBy: ["rosa"] }],
      projectSpeech: [],
    };
    const beforeObservationFailure = modelCalls;
    failWritesAfterReply = 6;
    const observationInput = { ...builderInput, submissionId: "observation-conflict", message: "Good afternoon." };
    await sendVenueTurn(observationInput);
    assert(
      warnings.some((message) => message.includes("saved turn observation deferred")),
      "ancillary observation failure is exercised",
    );
    await sendVenueTurn(observationInput);
    assert.equal(modelCalls, beforeObservationFailure + 1, "observation recovery reuses the paid reply");
    console.log(
      "Villages automatic Project interpretation: natural speech, citations, decisions, physical gates, replay and cost ok",
    );
  } finally {
    release();
  }
}
void main();
