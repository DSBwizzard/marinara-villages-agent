import assert from "node:assert/strict";
import { unwrittenVillageAgenda } from "../packages/villages/src/server/domain/rules/agenda-plan.js";
import {
  acceptProjectRequirements,
  createNewVenueProject,
  createRenovationProject,
  reviseRenovationProject,
  renewRenovationApprovals,
  deliverProjectMaterial,
  lockProjectBuilder,
  openFinishedProject,
  placeNewVenueProject,
  startProjectConstruction,
  draftRenovationProject,
  draftNewVenueProject,
  configureProjectLifecycle,
} from "../packages/villages/src/server/features/projects/project-lifecycle.js";
import { reconcileProjectLifecycles } from "../packages/villages/src/server/domain/rules/project-lifecycle-rules.js";
import {
  createProjectLifecycle,
  type ProjectLifecyclePorts,
} from "../packages/villages/src/server/features/projects/project-lifecycle-service.js";
import {
  createVenueOperationContext,
  type Context,
} from "../packages/villages/src/server/adapters/operations/operation-context-service.js";
import {
  recordExistingProjectSource,
  recordProjectSpokenEvidence,
  reallocateHeldProjectSupply,
  configureProjectEvidence,
  processProjectSpeechTurn,
  listProjectEvidenceCandidates,
} from "../packages/villages/src/server/features/projects/project-evidence.js";
import {
  createProjectEvidence,
  type ProjectEvidencePorts,
} from "../packages/villages/src/server/features/projects/project-evidence-service.js";
import {
  createActivationScope,
  installDefaultActivation,
  scopedActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { createProjectProgress } from "../packages/villages/src/server/domain/rules/project-progress.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import type { VenueScene } from "../packages/villages/src/server/domain/models/scene-model.js";
import {
  createProgressTask,
  revealProgress,
  visibleProgress,
} from "../packages/villages/src/server/domain/rules/progress-engine.js";
import { readSceneChanges } from "../packages/villages/src/server/features/scenes/changes.js";
import {
  processSavedProgressSubmission,
  processSavedExchange,
  startProgressRecovery,
} from "../packages/villages/src/server/features/scenes/progress.js";
import { progressBacklog } from "../packages/villages/src/server/features/scenes/services.js";

import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";

import { createExchangeProcessing } from "../packages/villages/src/server/domain/decoding/exchange-codec.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { mutateVillageState, readVillageState } from "../packages/villages/src/server/features/world/village-store.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { resolveVenueZone } from "../packages/villages/src/server/domain/rules/venue-zones.js";
import type {
  VillageState,
  VillageVenue,
  VillageVillager,
} from "../packages/villages/src/server/domain/models/world.js";

const records = new Map<string, any>();
let faultTask = "",
  faultAfterWrite = false;
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
    const previous = records.get(input.id);
    if (!previous || previous.revision !== input.expectedRevision) return null;
    const addedReceipt =
      faultTask &&
      input.id === "villages-village" &&
      (input.data.progressTasks.find((task: any) => task.definition.id === faultTask)?.receipts.length ?? 0) >
        (previous.data.progressTasks.find((task: any) => task.definition.id === faultTask)?.receipts.length ?? 0);
    if (addedReceipt && !faultAfterWrite) throw new Error("Project owner write failed");
    const row = { ...previous, ...input, revision: previous.revision + 1 };
    records.set(input.id, row);
    if (addedReceipt && faultAfterWrite) throw new Error("Project owner acknowledgement lost");
    return row;
  },
  async remove(_packageId: string, id: string) {
    return records.delete(id);
  },
};
const foundedAt = new Date().toISOString();
const village = defaultVillageState();
village.seed = "project-fixture";
village.setupAt = foundedAt;
village.foundedAt = foundedAt;
village.progressEngineVersion = 1;
const mill: VillageVenue = {
  id: "mill",
  name: "Old Mill",
  playerSeenPublic: true,
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
const release = configureVillagesRuntime({
  logger: { debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} },
  isDebugAgentsEnabled: () => true,
  persistence: { documents },
  languageModels: {
    async resolveForRequest() {
      throw new Error("Progress verification must not call a model");
    },
  },
} as Parameters<typeof configureVillagesRuntime>[0]);

let turnNumber = 0;
let materialEvidenceWorld: VillageState | undefined, heldEvidenceWorld: VillageState | undefined;
let lifecycleOpeningWorld: VillageState | undefined,
  lifecycleOpeningId = "";
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

async function main() {
  try {
    assert.equal(
      coerceVillageState({ wishSystemVersion: 3, ...village, progressEngineVersion: undefined }).progressEngineVersion,
      1,
    );
    assert.throws(
      () => coerceVillageState({ wishSystemVersion: 3, ...village, progressEngineVersion: 0 }),
      /retired Project engine/,
    );
    await mutateVillageState((current) =>
      current.progressTasks.push(
        createProgressTask({
          id: "hidden:test",
          revision: 1,
          owner: { kind: "test", id: "hidden" },
          resolver: "progress.noop",
          phases: [
            {
              id: "noticed",
              title: "A resident notices",
              requirements: [
                {
                  id: "line",
                  title: "Hear a resident",
                  routes: [
                    {
                      id: "saved",
                      verifier: "core.saved-event",
                      params: { speakerId: "rosa", venueId: "mill" },
                      automatic: true,
                      evidenceKinds: ["saved-resident-line"],
                    },
                  ],
                },
              ],
            },
            {
              id: "again",
              title: "Hear another turn",
              requirements: [
                {
                  id: "second-line",
                  title: "Another saved turn",
                  routes: [
                    {
                      id: "saved",
                      verifier: "core.saved-event",
                      params: { speakerId: "rosa", venueId: "mill" },
                      automatic: true,
                      evidenceKinds: ["saved-resident-line"],
                    },
                  ],
                },
              ],
            },
          ],
        }),
      ),
    );
    const hiddenFirst = saveTurn("A visit before disclosure", "I was here.");
    assert.equal(
      (await progressBacklog()).some((turn) => turn.submissionId === hiddenFirst.submissionId),
      true,
    );
    await processSavedProgressSubmission(hiddenFirst.sessionId, hiddenFirst.submissionId);
    let hiddenTask = (await readVillageState()).progressTasks.find((task) => task.definition.id === "hidden:test")!;
    assert.equal(hiddenTask.phaseIndex, 1);
    assert.equal(visibleProgress(hiddenTask), null);
    const hiddenDocument = records.get(`villages-venue-visit-${hiddenFirst.sessionId}`);
    hiddenDocument.data.submissions[0].progressProcessedAt = ""; // interruption after the Village write
    await processSavedProgressSubmission(hiddenFirst.sessionId, hiddenFirst.submissionId);
    hiddenTask = (await readVillageState()).progressTasks.find((task) => task.definition.id === "hidden:test")!;
    assert.equal(hiddenTask.phaseIndex, 1); // replay cannot use the same line in a later phase
    saveTurn("Another day", "I returned.");
    const stopRecovery = startProgressRecovery();
    for (let attempt = 0; attempt < 30; attempt++) {
      if ((await readVillageState()).progressTasks.find((task) => task.definition.id === "hidden:test")?.resolvedAt)
        break;
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    stopRecovery();
    await mutateVillageState((current) =>
      revealProgress(
        current.progressTasks.find((task) => task.definition.id === "hidden:test")!,
        new Date().toISOString(),
      ),
    );
    hiddenTask = (await readVillageState()).progressTasks.find((task) => task.definition.id === "hidden:test")!;
    assert.equal(hiddenTask.resolutionKey, "hidden:test:1:resolved");
    assert.equal(hiddenTask.receipts.length, 2);
    assert.ok(visibleProgress(hiddenTask));
    const recorded = saveTurn("A recorded exchange", "We can discuss the mill.");
    const recordedScene = records.get(`villages-venue-visit-${recorded.sessionId}`).data;
    recordedScene.processingVersion = 1;
    recordedScene.villageSeed = village.seed;
    recordedScene.submissions[0].processing = createExchangeProcessing({
      seed: village.seed,
      sceneId: recorded.sessionId,
      submissionId: recorded.submissionId,
      order: 0,
      lineIds: recordedScene.lines.map((line: any) => line.id),
      actionReceiptIds: [],
    });
    const beforeReads = JSON.stringify([...records.values()]);
    const changes = await readSceneChanges(recorded.sessionId);
    assert.equal(changes.changes[0].processing?.domains.projects.status, "pending");
    assert.equal(JSON.stringify([...records.values()]), beforeReads, "diagnostic reads do not write or generate");
    await processSavedExchange(recorded.sessionId, recorded.submissionId);
    assert.equal(
      (await readSceneChanges(recorded.sessionId)).changes[0].processing?.domains.projects.status,
      "applied",
    );
    recordedScene.submissions[0].processing.seed = "replaced-village";
    recordedScene.submissions[0].processing.domains.projects.status = "pending";
    // Replace the stored document, rather than the pre-commit fixture object.
    records.get(`villages-venue-visit-${recorded.sessionId}`).data = recordedScene;
    await processSavedExchange(recorded.sessionId, recorded.submissionId);
    assert.equal(
      (await readSceneChanges(recorded.sessionId)).changes[0].processing?.domains.projects.status,
      "rejected",
    );
    await assert.rejects(readSceneChanges(recorded.sessionId, "-1"), /cursor/);
    const lastChanges = await readSceneChanges(recorded.sessionId);
    assert.equal((await readSceneChanges(recorded.sessionId, lastChanges.nextCursor)).changes.length, 0);
    for (const after of [false, true]) {
      const taskId = "fault-project-" + after;
      await mutateVillageState((current) =>
        current.progressTasks.push(
          createProgressTask({
            id: taskId,
            revision: 1,
            owner: { kind: "test", id: taskId },
            resolver: "progress.noop",
            phases: [
              {
                id: "evidence",
                title: "Witnessed evidence",
                requirements: [
                  {
                    id: "line",
                    title: "Hear Rosa",
                    routes: [
                      {
                        id: "saved",
                        verifier: "core.saved-event",
                        params: { speakerId: "rosa", venueId: "mill" },
                        automatic: true,
                        evidenceKinds: ["saved-resident-line"],
                      },
                    ],
                  },
                ],
              },
            ],
          }),
        ),
      );
      const turn = saveTurn("A new Project exchange", "I checked this condition.");
      const saved = records.get("villages-venue-visit-" + turn.sessionId).data;
      saved.processingVersion = 1;
      saved.villageSeed = village.seed;
      const submission = saved.submissions[0];
      submission.wishProposals = [];
      submission.wishProposalError = "";
      submission.processing = createExchangeProcessing({
        seed: village.seed,
        sceneId: turn.sessionId,
        submissionId: turn.submissionId,
        order: 0,
        lineIds: saved.lines.map((line: any) => line.id),
        actionReceiptIds: [],
      });
      for (const domain of ["memories", "relationships"]) submission.processing.domains[domain].status = "applied";
      faultTask = taskId;
      faultAfterWrite = after;
      await processSavedExchange(turn.sessionId, turn.submissionId);
      faultTask = "";
      await processSavedExchange(turn.sessionId, turn.submissionId);
      await processSavedExchange(turn.sessionId, turn.submissionId);
      assert.equal(
        (await readVillageState()).progressTasks.find((task) => task.definition.id === taskId)!.receipts.length,
        1,
        "the Project effect and its receipt survive replay once",
      );
    }
    await createNewVenueProject({
      name: "Lantern House",
      venueClass: "gathering",
      description: "A hall for evenings.",
    });
    const projectId = (await readVillageState()).projects.find((entry) => entry.kind === "new-venue")!.id;
    let state = await readVillageState();
    assert.equal(
      state.progressTasks.find((task) => task.definition.owner.id === projectId)?.definition.phases[0]?.id,
      "concept",
    );
    await placeNewVenueProject(projectId, { x: 0.7, y: 0.7 });
    state = await readVillageState();
    assert.equal(state.progressTasks.find((task) => task.definition.owner.id === projectId)?.phaseIndex, 1);
    const absent = saveTurn("Will you build Lantern House?", "I will build Lantern House.");
    records.get(`villages-venue-visit-${absent.sessionId}`).data.submissions[0].activeIdsAtTurn = [];
    await assert.rejects(recordProjectSpokenEvidence(projectId, { kind: "builder", ...absent }), /while present/u);
    const elsewhere = saveTurn("Will you build Lantern House?", "I will build Lantern House.", "rosa", "unknown");
    await assert.rejects(recordProjectSpokenEvidence(projectId, { kind: "builder", ...elsewhere }), /Village Venue/u);
    const stale = saveTurn("Will you build Lantern House?", "I will build Lantern House.");
    records.get(`villages-venue-visit-${stale.sessionId}`).data.submissions[0].at = "2020-01-01T00:00:00.000Z";
    await assert.rejects(recordProjectSpokenEvidence(projectId, { kind: "builder", ...stale }), /fresh visit/u);
    const builder = saveTurn("Will you build Lantern House?", "I will build Lantern House.");
    await recordProjectSpokenEvidence(projectId, { kind: "builder", ...builder });
    await lockProjectBuilder(projectId, { residentId: "rosa" });
    state = await readVillageState();
    assert.equal(state.projects.find((entry) => entry.id === projectId)?.lifecycle?.phase, "requirements");
    const plan = saveTurn(
      "What does Lantern House need?",
      "Structure: timber; Equipment: benches; Finish: not needed.",
    );
    await recordProjectSpokenEvidence(projectId, { kind: "requirements", ...plan });
    await acceptProjectRequirements(projectId);
    state = await readVillageState();
    const flow = state.projects.find((entry) => entry.id === projectId)!.lifecycle!;
    assert.equal(flow.phase, "materials");
    const timberId = flow.requirements.find((entry) => entry.title === "timber")!.id;
    const benchesId = flow.requirements.find((entry) => entry.title === "benches")!.id;
    materialEvidenceWorld = structuredClone(state);
    const unrelated = saveTurn("Is there anything else?", "I can supply timber.", "ivo", "mill");
    await recordProjectSpokenEvidence(projectId, { kind: "offer", requirementId: timberId, ...unrelated });
    const timber = saveTurn(
      "May I take the timber for Lantern House?",
      "Here is timber for Lantern House.",
      "ivo",
      "mill",
    );
    await recordProjectSpokenEvidence(projectId, { kind: "handoff", requirementId: timberId, ...timber });
    await recordProjectSpokenEvidence(projectId, { kind: "handoff", requirementId: timberId, ...timber });
    await recordExistingProjectSource(projectId, { requirementId: benchesId, venueId: "mill" });
    const benches = saveTurn("May I take the benches for Lantern House?", "Here are benches for Lantern House.");
    await mutateVillageState((current) => {
      current.venues.find((venue) => venue.id === "mill")!.state.furniture = [];
    });
    await assert.rejects(
      recordProjectSpokenEvidence(projectId, { kind: "handoff", requirementId: benchesId, ...benches }),
      /no longer available/u,
    );
    await mutateVillageState((current) => {
      current.venues.find((venue) => venue.id === "mill")!.state.furniture = ["benches"];
    });
    await recordProjectSpokenEvidence(projectId, { kind: "handoff", requirementId: benchesId, ...benches });
    state = await readVillageState();
    assert.equal(state.venues.find((entry) => entry.id === "mill")?.state.furniture.includes("benches"), false);
    assert.equal(state.projectSourceClaims.length, 1);
    const task = state.progressTasks.find((entry) => entry.definition.owner.id === projectId)!;
    assert.equal(task.receipts.filter((receipt) => receipt.requirementId.startsWith("acquired:")).length, 2);
    const storedMaterials = JSON.parse(JSON.stringify(state));
    const reloadedMaterials = coerceVillageState(storedMaterials);
    assert.deepEqual(
      JSON.parse(JSON.stringify(reloadedMaterials.projects)),
      storedMaterials.projects,
      "current accepted requirements and acquired sources survive save/reload",
    );
    assert.deepEqual(reloadedMaterials.progressTasks, state.progressTasks);
    assert.deepEqual(reloadedMaterials.projectSourceClaims, state.projectSourceClaims);
    const replacement = saveTurn("Will you build Lantern House instead?", "I will build Lantern House.", "ivo");
    await recordProjectSpokenEvidence(projectId, { kind: "builder", ...replacement });
    await lockProjectBuilder(projectId, { residentId: "ivo" });
    state = await readVillageState();
    assert.equal(state.projects.find((entry) => entry.id === projectId)?.lifecycle?.heldSupplies.length, 2);
    assert.equal(
      state.progressTasks.find((entry) => entry.definition.owner.id === projectId)?.revisionHistory.length,
      2,
    );
    const revisedPlan = saveTurn(
      "What does Lantern House need now?",
      "Structure: timber; Equipment: benches; Finish: not needed.",
      "ivo",
    );
    await recordProjectSpokenEvidence(projectId, { kind: "requirements", ...revisedPlan });
    await acceptProjectRequirements(projectId);
    state = await readVillageState();
    const revised = state.projects.find((entry) => entry.id === projectId)!.lifecycle!;
    heldEvidenceWorld = structuredClone(state);
    for (const requirement of revised.requirements.filter((entry) => entry.needed)) {
      const held = revised.heldSupplies.find((entry) => entry.itemName === requirement.title)!;
      await reallocateHeldProjectSupply(projectId, { requirementId: requirement.id, heldId: held.id });
    }
    state = await readVillageState();
    assert.equal(
      state.progressTasks.find((entry) => entry.definition.owner.id === projectId)?.revisionHistory.length,
      3,
    );
    await deliverProjectMaterial(projectId, { requirementId: timberId });
    await deliverProjectMaterial(projectId, { requirementId: benchesId });
    await startProjectConstruction(projectId);
    state = await readVillageState();
    assert.equal(
      state.progressTasks.find((entry) => entry.definition.owner.id === projectId)?.definition.phases[
        state.progressTasks.find((entry) => entry.definition.owner.id === projectId)!.phaseIndex
      ]?.id,
      "construction",
    );
    await mutateVillageState((current) => {
      current.villagers = current.villagers.filter((resident) => resident.characterId !== "ivo");
      reconcileProjectLifecycles(current, new Date());
    });
    state = await readVillageState();
    assert.equal(state.projects.find((entry) => entry.id === projectId)?.status, "blocked");
    assert.equal(state.progressTasks.find((entry) => entry.definition.owner.id === projectId)?.phaseIndex, 4);
    const continuing = saveTurn("Can you finish Lantern House?", "I will build Lantern House.", "rosa");
    await recordProjectSpokenEvidence(projectId, { kind: "builder", ...continuing });
    await lockProjectBuilder(projectId, { residentId: "rosa" });
    state = await readVillageState();
    const workEnd = state.projects.find((entry) => entry.id === projectId)!.lifecycle!.workOrder!.completesAt;
    await mutateVillageState((current) => reconcileProjectLifecycles(current, new Date(workEnd)));
    await openFinishedProject(projectId, {
      layoutVersion: 1,
      layout: "both",
      spaces: [{ venueClass: "gathering", description: "Tables and a hearth." }],
      form: "A timber hall",
      exteriorDescription: "Warm windows.",
      interiorDescription: "Tables and a hearth.",
      privateSpaces: [
        {
          id: "restricted:archive",
          venueClass: "gathering",
          name: "Archive",
          purpose: "Store records",
          controllerIds: ["player"],
          description: "An authored archive",
        },
      ],
      imageContext: { useAssignedVillagerContext: false, useVisualLore: false },
    });
    state = await readVillageState();
    assert.equal(state.projects.find((entry) => entry.id === projectId)?.status, "complete");
    const openedVenue = state.venues.find((entry) => entry.buildProjectId === projectId);
    const privateRoom = openedVenue.zones.find((zone) => zone.id === "restricted:archive");
    assert.equal(privateRoom.description, "An authored archive");
    assert.deepEqual(privateRoom.controllerIds, ["player"]);
    assert.ok(privateRoom.preparation, "private preparation belongs to the opening flow");
    assert.deepEqual(openedVenue.imageContext, { useAssignedVillagerContext: false, useVisualLore: false });
    assert.equal(
      state.progressTasks.find((entry) => entry.definition.owner.id === projectId)?.resolutionKey,
      `project:${projectId}:4:resolved`,
    );
    assert.equal(
      state.venues.filter((entry) => entry.buildProjectId === projectId && entry.constructionStatus === "complete")
        .length,
      1,
    );
    await assert.rejects(
      openFinishedProject(projectId, {
        form: "A timber hall",
        exteriorDescription: "Warm windows.",
        interiorDescription: "Tables and a hearth.",
      }),
      /Construction must finish|phase and verified progress/u,
    );
    assert.equal(
      (await readVillageState()).progressTasks
        .find((entry) => entry.definition.owner.id === projectId)
        ?.receipts.filter((receipt) => receipt.requirementId === "opened").length,
      1,
    );
    assert.deepEqual(coerceVillageState(state).progressTasks, state.progressTasks);
    assert.ok(state.progressTasks.find((entry) => entry.definition.owner.id === projectId)!.attempts.length >= 4);
    await createRenovationProject("mill", {
      title: "Mill roof",
      detail: "Weatherproof the working mill.",
      slot: 0,
      improvement: { title: "New roof", description: "A sound timber roof.", extraBeds: 0 },
    });
    state = await readVillageState();
    const renovationId = state.projects.find((entry) => entry.kind === "renovation")!.id;
    assert.equal(state.projects.find((entry) => entry.id === renovationId)?.lifecycle?.phase, "approval");
    const approval = saveTurn("Do you approve Mill roof?", "Yes, I approve Mill roof.");
    await recordProjectSpokenEvidence(renovationId, { kind: "approval", ...approval });
    await reviseRenovationProject(renovationId, {
      title: "Mill roof",
      detail: "Weatherproof with improved beams.",
      slot: 0,
      improvement: { title: "New roof", description: "A sound timber roof with stronger beams.", extraBeds: 0 },
    });
    state = await readVillageState();
    assert.deepEqual(
      state.projects.find((entry) => entry.id === renovationId)!.lifecycle!.approvals,
      [],
      "revised terms clear old approvals",
    );
    assert.equal(state.projects.find((entry) => entry.id === renovationId)!.lifecycle!.phase, "approval");
    await assert.rejects(
      recordProjectSpokenEvidence(renovationId, { kind: "approval", ...approval }),
      /revision|used|phase|definition|already/i,
    );
    const revisedApproval = saveTurn(
      "Do you approve Mill roof with stronger beams?",
      "Yes, I approve Mill roof with stronger beams.",
    );
    await recordProjectSpokenEvidence(renovationId, { kind: "approval", ...revisedApproval });
    const renovationBuilder = saveTurn("Will you build Mill roof?", "I will build Mill roof.");
    await recordProjectSpokenEvidence(renovationId, { kind: "builder", ...renovationBuilder });
    await lockProjectBuilder(renovationId, { residentId: "rosa" });
    const renovationPlan = saveTurn(
      "What does Mill roof need?",
      "Structure: not needed; Equipment: not needed; Finish: not needed.",
    );
    await recordProjectSpokenEvidence(renovationId, { kind: "requirements", ...renovationPlan });
    await acceptProjectRequirements(renovationId);
    await startProjectConstruction(renovationId);
    state = await readVillageState();
    await mutateVillageState((current) =>
      reconcileProjectLifecycles(
        current,
        new Date(current.projects.find((entry) => entry.id === renovationId)!.lifecycle!.workOrder!.completesAt),
      ),
    );
    await assert.rejects(openFinishedProject(renovationId, { improvement: null }), /Reviewed structural terms/);
    await mutateVillageState((current) => {
      current.villagers.push({
        ...structuredClone(current.villagers.find((entry) => entry.characterId === "rosa")!),
        characterId: "new-worker",
        cardSnapshot: {
          ...current.villagers.find((entry) => entry.characterId === "rosa")!.cardSnapshot,
          id: "new-worker",
        },
      });
      current.venues.find((entry) => entry.id === "mill")!.workerIds!.push("new-worker");
    });
    await assert.rejects(openFinishedProject(renovationId, {}), /Renew.*approvals/);
    const completedReceipts = (await readVillageState()).progressTasks
      .find((task) => task.definition.owner.id === renovationId)!
      .receipts.filter((receipt) => receipt.phaseId !== "approval")
      .map((receipt) => receipt.id);
    await renewRenovationApprovals(renovationId);
    state = await readVillageState();
    assert.equal(state.projects.find((entry) => entry.id === renovationId)!.lifecycle!.phase, "approval");
    const renewedApproval = saveTurn("Do you approve Mill roof?", "Yes, I approve Mill roof.", "new-worker");
    await recordProjectSpokenEvidence(renovationId, { kind: "approval", ...renewedApproval });
    state = await readVillageState();
    assert.equal(
      state.projects.find((entry) => entry.id === renovationId)!.lifecycle!.phase,
      "finishing",
      "renewed roster preserves completed construction",
    );
    assert.deepEqual(
      state.progressTasks
        .find((task) => task.definition.owner.id === renovationId)!
        .receipts.filter((receipt) => receipt.phaseId !== "approval")
        .map((receipt) => receipt.id),
      completedReceipts,
    );
    lifecycleOpeningWorld = structuredClone(state);
    lifecycleOpeningId = renovationId;
    await openFinishedProject(renovationId, {});
    state = await readVillageState();
    assert.equal(state.projects.find((entry) => entry.id === renovationId)?.status, "complete");
    assert.equal(state.venues.find((entry) => entry.id === "mill")?.improvements?.[0]?.title, "New roof");
    assert.ok(state.progressTasks.find((entry) => entry.definition.owner.id === renovationId)?.resolutionKey);
    console.log(
      "Villages Progress Project regression: cited offer, finite handoff, item debit, phases, clock, resolution ok",
    );
  } finally {
    release();
  }
}
function evidenceDeferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => (resolve = done));
  return { promise, resolve };
}

function evidenceOwner(label: string, supplied?: VillageState) {
  const world = structuredClone(supplied ?? village);
  if (!supplied) {
    world.projects = [];
    world.progressTasks = [];
  }
  const project = supplied
    ? world.projects.find((entry) => entry.kind === "new-venue")!
    : draftRenovationProject(world, "mill", {
        title: "Mill roof",
        detail: "Repair the roof.",
        slot: 0,
        improvement: { title: "New roof", description: "A sound roof.", extraBeds: 0 },
      });
  if (!supplied) {
    project.id = "same-project";
    world.progressTasks = [];
    createProjectProgress(world, project, project.updatedAt);
  }
  const at = new Date(Date.now() + 60_000).toISOString();
  const line = {
    id: "same-line",
    speakerId: "rosa",
    name: label,
    role: "assistant" as const,
    kind: "dialogue" as const,
    content: `Yes, I approve Mill roof. ${label} approval.`,
    at,
    heardBy: ["rosa"],
  };
  const turn: Awaited<ReturnType<ReturnType<ProjectEvidencePorts["sceneQueries"]>["readProjectTurnEvidence"]>> = {
    sessionId: "same-scene",
    submissionId: "same-turn",
    venueId: "mill",
    zoneId: undefined,
    mode: "chat",
    message: "Do you approve Mill roof?",
    at,
    areaAtTurn: "shared",
    activeIdsAtTurn: ["rosa"],
    action: null,
    projectContexts: [],
    projectSpeech: [],
    contextualInterpretation: false,
    contextLines: [],
    lines: [line],
  };
  function visit(id: string, stamp = at): VenueScene {
    return coerceSession({
      id,
      placeId: "mill",
      placeName: label + " Mill",
      status: "closed",
      startedAt: stamp,
      participants: [{ characterId: "rosa", name: label, doing: "listening" }],
      lines: [{ ...line, at: stamp }],
      submissions: [
        {
          id: "same-turn",
          message: label + " message",
          mode: "chat",
          at: stamp,
          activeIdsAtTurn: ["rosa"],
          replyLineIds: [line.id],
        },
      ],
    });
  }
  let active: VenueScene | null = visit("active"),
    archives = [visit("archive")],
    paused = "",
    fail = "",
    failMutation = false,
    losing: VillageState | undefined;
  const calls: string[] = [],
    owners: unknown[] = [];
  const entered = evidenceDeferred(),
    gate = evidenceDeferred();
  const exact = new Error(label + " saved read failure"),
    mutationError = new Error(label + " mutation failure");
  async function touch(stage: string) {
    calls.push(stage);
    const owner = scopedActivation();
    owners.push(owner);
    if (paused === stage) {
      paused = "";
      entered.resolve();
      await gate.promise;
    }
    if (owner && !owner.active) throw new Error("Original Project evidence connection unavailable.");
    assert.equal(scopedActivation(), owner);
    if (stage === fail) throw exact;
    if (stage === "mutation" && failMutation) throw mutationError;
  }
  const ports: ProjectEvidencePorts = {
    async readVillageState() {
      await touch("world");
      return world;
    },
    async mutateVillageState(update) {
      await touch("mutation");
      if (losing) update(losing);
      update(world);
      return world;
    },
    sceneQueries() {
      calls.push("queries");
      return {
        async readProjectTurnEvidence(sessionId, submissionId) {
          await touch("turn");
          assert.equal(sessionId, turn.sessionId);
          assert.equal(submissionId, turn.submissionId);
          return turn;
        },
        async activeVenueSession() {
          await touch("active");
          return active;
        },
        async listVenueVisits() {
          await touch("archive");
          return archives;
        },
      };
    },
  };
  return {
    world,
    project,
    turn,
    calls,
    owners,
    entered,
    gate,
    exact,
    mutationError,
    service: createProjectEvidence(ports),
    input: { kind: "approval", sessionId: turn.sessionId, submissionId: turn.submissionId, lineId: line.id },
    visit,
    pause(stage: string) {
      paused = stage;
    },
    failRead() {
      fail = "turn";
    },
    failWrite() {
      failMutation = true;
    },
    retry(discarded: VillageState) {
      losing = discarded;
    },
    candidates(current: VenueScene | null, saved: VenueScene[]) {
      active = current;
      archives = saved;
    },
  };
}

async function ownedEvidenceChecks() {
  const plain = evidenceOwner("plain");
  assert.deepEqual(plain.calls, [], "factory construction must not access any connection");
  await assert.rejects(
    plain.service.recordProjectSpokenEvidence("same-project", { kind: "invented" }),
    /evidence kind/,
  );
  assert.deepEqual(plain.calls, [], "invalid kind must reject before accessing saved evidence or storage");
  await plain.service.recordProjectSpokenEvidence("same-project", plain.input);
  await plain.service.recordProjectSpokenEvidence("same-project", plain.input);
  assert.equal(plain.project.lifecycle!.approvals.length, 1);
  assert.equal(plain.world.progressTasks[0]!.receipts.length, 1, "saved proof replay has one receipt");

  for (const stage of ["turn", "mutation", "world", "active", "archive"]) {
    const a = createActivationScope(),
      b = createActivationScope();
    const fa = evidenceOwner("A"),
      fb = evidenceOwner("B");
    const releaseA = a.run(() => configureProjectEvidence(fa.service));
    const releaseB = b.run(() => configureProjectEvidence(fb.service));
    const clearA = installDefaultActivation(a, () => {});
    fa.pause(stage);
    const spoken = stage === "turn" || stage === "mutation";
    const pending = spoken
      ? recordProjectSpokenEvidence("same-project", fa.input)
      : listProjectEvidenceCandidates("same-project");
    await fa.entered.promise;
    const clearB = installDefaultActivation(b, () => {});
    releaseA();
    clearA();
    if (spoken) await recordProjectSpokenEvidence("same-project", fb.input);
    else {
      const current = await listProjectEvidenceCandidates("same-project");
      assert.equal(current.length, 2);
      assert(current.every((row) => row.quote.includes("B approval")));
    }
    fa.gate.resolve();
    const result = await pending;
    if (spoken) {
      assert.equal(fa.project.lifecycle!.spokenProofs[0]!.quote.includes("A approval"), true);
      assert.equal(fb.project.lifecycle!.spokenProofs[0]!.quote.includes("B approval"), true);
    } else {
      assert(Array.isArray(result));
      assert.equal(result.length, 2);
      assert(result.every((row) => row.quote.includes("A approval")));
      assert.equal(fa.calls.filter((call) => call === "queries").length, 1, "candidate pair is captured together");
    }
    assert(fa.owners.every((owner) => owner === a));
    assert(fb.owners.every((owner) => owner === b));
    const current = await listProjectEvidenceCandidates("same-project");
    assert.equal(current.length, 2);
    assert(
      current.every((row) => row.quote.includes("B approval")),
      "old cleanup must not remove the replacement service",
    );
    releaseB();
    clearB();
    a.dispose();
    b.dispose();
  }

  // Automatic processing calls its own recorder after a delayed saved read.
  const a = createActivationScope(),
    b = createActivationScope();
  const fa = evidenceOwner("automatic-A"),
    fb = evidenceOwner("automatic-B");
  const releaseA = a.run(() => configureProjectEvidence(fa.service));
  const releaseB = b.run(() => configureProjectEvidence(fb.service));
  const clearA = installDefaultActivation(a, () => {});
  fa.pause("turn");
  const automatic = processProjectSpeechTurn("same-scene", "same-turn");
  await fa.entered.promise;
  const clearB = installDefaultActivation(b, () => {});
  releaseA();
  clearA();
  fa.gate.resolve();
  await automatic;
  assert.equal(fa.project.lifecycle!.approvals.length, 1);
  assert.deepEqual(fb.calls, []);
  assert(fa.owners.every((owner) => owner === a));
  await processProjectSpeechTurn("same-scene", "same-turn");
  assert.equal(fb.project.lifecycle!.approvals.length, 1);
  releaseB();
  clearB();
  a.dispose();
  b.dispose();

  assert(materialEvidenceWorld && heldEvidenceWorld);
  for (const stage of ["existing-active", "existing-mutation", "held-mutation"]) {
    const reallocation = stage.startsWith("held");
    const template = reallocation ? heldEvidenceWorld : materialEvidenceWorld;
    const a = createActivationScope(),
      b = createActivationScope();
    const fa = evidenceOwner("finite-A", template),
      fb = evidenceOwner("finite-B", template);
    const requirement = fa.project.lifecycle!.requirements.find((entry) => entry.title === "benches")!;
    const held = fa.project.lifecycle!.heldSupplies.find((entry) => entry.itemName === "benches");
    const input = reallocation
      ? { requirementId: requirement.id, heldId: held!.id }
      : { requirementId: requirement.id, venueId: "mill" };
    const command = reallocation ? reallocateHeldProjectSupply : recordExistingProjectSource;
    const releaseA = a.run(() => configureProjectEvidence(fa.service));
    const releaseB = b.run(() => configureProjectEvidence(fb.service));
    const clearA = installDefaultActivation(a, () => {});
    fa.pause(stage.endsWith("active") ? "active" : "mutation");
    const pending = command(fa.project.id, input);
    await fa.entered.promise;
    const clearB = installDefaultActivation(b, () => {});
    releaseA();
    clearA();
    await command(fb.project.id, input);
    fa.gate.resolve();
    await pending;
    assert.equal(fa.project.lifecycle!.sources.length, 1);
    assert.equal(fb.project.lifecycle!.sources.length, 1);
    assert(fa.owners.every((owner) => owner === a));
    assert(fb.owners.every((owner) => owner === b));
    const task = fb.world.progressTasks.find((entry) => entry.definition.owner.id === fb.project.id)!;
    const receiptCount = task.receipts.length;
    await assert.rejects(command(fb.project.id, input), /already has|uncommitted supply/);
    assert.equal(task.receipts.length, receiptCount, "repeated source/reallocation cannot create another receipt");
    assert.equal(fb.project.lifecycle!.sources.length, 1);
    releaseB();
    clearB();
    a.dispose();
    b.dispose();
  }

  const changedStock = evidenceOwner("stock", materialEvidenceWorld);
  const bench = changedStock.project.lifecycle!.requirements.find((entry) => entry.title === "benches")!;
  changedStock.pause("mutation");
  const choosing = changedStock.service.recordExistingProjectSource(changedStock.project.id, {
    requirementId: bench.id,
    venueId: "mill",
  });
  await changedStock.entered.promise;
  const stockVenue = changedStock.world.venues.find((entry) => entry.id === "mill")!;
  const recordedStock = changedStock.project.lifecycle!.recordedItems.find((item) => item.itemName === "benches")!;
  const stockZone = resolveVenueZone(stockVenue, recordedStock.zoneId ?? "");
  if (stockZone) stockZone.state.items = [];
  else stockVenue.state.furniture = [];
  changedStock.gate.resolve();
  await assert.rejects(choosing, /matching physical item/);
  assert.equal(
    changedStock.project.lifecycle!.sources.length,
    0,
    "physical stock is revalidated in the authoritative mutation after active-Scene capture",
  );

  const retry = evidenceOwner("retry");
  const rejectedAttempt = structuredClone(retry.world);
  rejectedAttempt.villagers = [];
  retry.retry(rejectedAttempt);
  await retry.service.recordProjectSpokenEvidence("same-project", retry.input);
  assert.equal(retry.project.lifecycle!.approvals.length, 1);
  assert.equal(
    retry.world.progressTasks[0]!.attempts.some((attempt) => attempt.status === "rejected"),
    false,
    "discarded rejection must not leak into the winning attempt",
  );
  const denied = evidenceOwner("denied");
  denied.retry(structuredClone(denied.world));
  denied.world.villagers = [];
  await assert.rejects(denied.service.recordProjectSpokenEvidence("same-project", denied.input), /current resident/);
  assert.equal(denied.project.lifecycle!.approvals.length, 0);
  assert.equal(
    denied.world.progressTasks[0]!.receipts.length,
    0,
    "losing acceptance must not authorize a winning refusal",
  );

  const unavailable = evidenceOwner("unavailable");
  unavailable.failRead();
  await assert.rejects(
    unavailable.service.recordProjectSpokenEvidence("same-project", unavailable.input),
    (error) => error === unavailable.exact,
  );
  assert.equal(unavailable.world.progressTasks[0]!.attempts.at(-1)?.status, "unavailable");
  assert.equal(
    unavailable.world.progressTasks[0]!.attempts.at(-1)?.evidenceId,
    "unavailable:same-scene:same-turn:same-line",
  );
  const diagnosticFailure = evidenceOwner("diagnostic");
  diagnosticFailure.failRead();
  diagnosticFailure.failWrite();
  await assert.rejects(
    diagnosticFailure.service.recordProjectSpokenEvidence("same-project", diagnosticFailure.input),
    (error) => error === diagnosticFailure.mutationError,
    "diagnostic write keeps existing error precedence",
  );

  const candidates = evidenceOwner("ordering");
  const active = candidates.visit("active");
  const archived = Array.from({ length: 25 }, (_, index) => {
    const saved = candidates.visit("archive-" + index, new Date(Date.parse(candidates.turn.at) - 1_000).toISOString());
    const base = saved.lines[0]!;
    saved.lines = Array.from({ length: 5 }, (_, n) => ({ ...base, id: `line-${index}-${n}` }));
    saved.submissions[0]!.replyLineIds = saved.lines.map((line) => line.id);
    return saved;
  });
  const oneRowPerArchive = archived.map((saved) => ({ ...saved, lines: saved.lines.slice(0, 1) }));
  candidates.candidates(active, oneRowPerArchive);
  const archiveLimited = await candidates.service.listProjectEvidenceCandidates("same-project");
  assert.equal(archiveLimited.length, 21, "active Scene plus exactly twenty archives before the result cap");
  assert.equal(archiveLimited[0]!.sessionId, "active");
  assert.equal(archiveLimited.at(-1)!.sessionId, "archive-19");
  assert.equal(
    archiveLimited.some((row) => row.sessionId === "archive-20"),
    false,
  );
  candidates.candidates(active, archived);
  const listed = await candidates.service.listProjectEvidenceCandidates("same-project");
  assert.equal(listed.length, 80);
  assert.equal(listed[0]!.sessionId, "active");
  assert.equal(listed[1]!.sessionId, "archive-0");
  assert(listed.every((row) => row.sessionId === "active" || Number(row.sessionId.slice(8)) < 20));
  candidates.candidates(null, archived.slice(20));
  assert.equal(
    (await candidates.service.listProjectEvidenceCandidates("same-project"))[0]!.sessionId,
    "archive-20",
    "late archives are excluded by the first listing's twenty-archive limit, not their validity",
  );

  const retired = createActivationScope(),
    disposed = evidenceOwner("disposed");
  const releaseRetired = retired.run(() => configureProjectEvidence(disposed.service));
  const clearRetired = installDefaultActivation(retired, () => {});
  disposed.pause("turn");
  const pending = recordProjectSpokenEvidence("same-project", disposed.input);
  await disposed.entered.promise;
  retired.dispose();
  disposed.gate.resolve();
  await assert.rejects(pending, /Original Project evidence connection unavailable/);
  assert.equal(disposed.project.lifecycle!.approvals.length, 0);
  releaseRetired();
  clearRetired();
  await assert.rejects(listProjectEvidenceCandidates("same-project"), /not configured/);
  console.log(
    "PASS owned Project evidence connections, same-ID activation replacement, CAS retries, failures and candidate limits",
  );
}
function lifecycleOwner(label: string, opening = true) {
  assert(lifecycleOpeningWorld);
  const world = opening ? structuredClone(lifecycleOpeningWorld) : coerceVillageState(structuredClone(village));
  if (!opening) {
    world.projects = [];
    world.progressTasks = [];
  }
  const calls: string[] = [],
    owners: unknown[] = [],
    sceneContexts: { stage: string; context: Context | undefined }[] = [];
  const operations = createVenueOperationContext(() => ({
    debug() {},
    info() {},
    warn() {},
    error() {},
    debugOverride() {},
  }));
  const entered = evidenceDeferred(),
    gate = evidenceDeferred();
  let paused = "",
    failed = "",
    losing: VillageState | undefined,
    beforeMutation: (() => void) | undefined;
  const exact = new Error(label + " lifecycle failure");
  function capture(stage: string) {
    calls.push(stage);
    owners.push(scopedActivation());
    sceneContexts.push({ stage, context: operations.context.getStore() });
  }
  async function touch(stage: string) {
    capture(stage);
    const owner = scopedActivation();
    if (paused === stage) {
      paused = "";
      entered.resolve();
      await gate.promise;
    }
    if (owner && !owner.active) throw new Error("Original Project lifecycle connection unavailable.");
    assert.equal(scopedActivation(), owner);
    if (failed === stage) throw exact;
  }
  const ports: ProjectLifecyclePorts = {
    async mutateVillageState(update) {
      await touch("mutation");
      if (losing) update(losing);
      beforeMutation?.();
      update(world);
      return world;
    },
    villagesDebugAgentsEnabled() {
      capture("debug");
      return false;
    },
    outsideVenueOperation(work) {
      capture("outside");
      return operations.outsideVenueOperation(work);
    },
    async preparePrivateSpaces() {
      await touch("prepare");
      calls.push("prepared");
    },
    async loadProjectWishProgress() {
      await touch("load");
      return {
        async processProjectWishOutbox() {
          await touch("outbox");
          calls.push("processed");
        },
      };
    },
    draftNewVenueProject(...args) {
      capture("new-draft");
      return draftNewVenueProject(...args);
    },
    draftRenovationProject(...args) {
      capture("renovation-draft");
      return draftRenovationProject(...args);
    },
  };
  return {
    world,
    calls,
    owners,
    sceneContexts,
    operations,
    entered,
    gate,
    exact,
    service: createProjectLifecycle(ports),
    pause(stage: string) {
      paused = stage;
    },
    fail(stage: string) {
      failed = stage;
    },
    retry(copy: VillageState) {
      losing = copy;
    },
    beforeMutation(work: () => void) {
      beforeMutation = work;
    },
  };
}
function lifecycleSceneContext(): Context {
  return {
    sessionId: "same-scene",
    controller: new AbortController(),
    allowPaid: false,
    scope: "test",
    counts: new Map(),
    usedAttemptKeys: new Map(),
    blocked: new Set(),
    operation: {
      id: "same-operation",
      kind: "chat",
      input: {},
      token: "test",
      attemptId: "same-attempt",
      status: "running",
      stage: "test",
      startedAt: foundedAt,
      sceneRevision: 1,
      snapshot: null,
      checkpoints: {},
      attempts: {},
      error: "",
    },
  };
}
const settleLifecycleCallbacks = () => new Promise<void>((resolve) => setImmediate(resolve));
async function ownedLifecycleChecks() {
  for (const stage of ["mutation", "prepare", "load", "outbox"]) {
    const a = createActivationScope(),
      b = createActivationScope();
    const left = lifecycleOwner("A"),
      right = lifecycleOwner("B");
    assert.deepEqual(left.calls, [], "factory construction performs no runtime work");
    const releaseA = a.run(() => configureProjectLifecycle(left.service));
    const clearA = installDefaultActivation(a, () => {});
    left.pause(stage);
    const pending = left.operations.context.run(lifecycleSceneContext(), () =>
      openFinishedProject(lifecycleOpeningId, {}),
    );
    await left.entered.promise;
    if (stage !== "mutation") {
      let returned = false;
      void pending.then(() => {
        returned = true;
      });
      await settleLifecycleCallbacks();
      assert(returned, "opening returns while either detached job remains paused");
    }
    const releaseB = b.run(() => configureProjectLifecycle(right.service));
    const clearB = installDefaultActivation(b, () => {});
    releaseA();
    clearA();
    assert.equal(right.world.projects.find((project) => project.id === lifecycleOpeningId)!.status, "finishing");
    left.gate.resolve();
    await pending;
    await settleLifecycleCallbacks();
    assert.equal(left.world.projects.find((project) => project.id === lifecycleOpeningId)!.status, "complete");
    assert.deepEqual(
      left.calls.filter((call) => call !== "prepared" && call !== "processed"),
      ["mutation", "outside", "prepare", "load", "outbox"],
    );
    assert.deepEqual(left.calls.slice(0, 4), ["mutation", "outside", "prepare", "load"]);
    assert.equal(left.calls.filter((call) => call === "prepared").length, 1);
    assert.equal(left.calls.filter((call) => call === "processed").length, 1);
    assert(
      left.owners.every((owner) => owner === a),
      "detached loader and completion retain the originating activation",
    );
    assert(
      left.sceneContexts
        .filter((entry) => ["prepare", "load", "outbox"].includes(entry.stage))
        .every((entry) => entry.context === undefined),
    );
    await openFinishedProject(lifecycleOpeningId, {});
    await settleLifecycleCallbacks();
    assert.equal(right.world.projects.find((project) => project.id === lifecycleOpeningId)!.status, "complete");
    assert(right.owners.every((owner) => owner === b));
    releaseB();
    clearB();
    a.dispose();
    b.dispose();
  }

  const failedSave = lifecycleOwner("failed save"),
    before = structuredClone(failedSave.world);
  failedSave.fail("mutation");
  await assert.rejects(
    failedSave.service.openFinishedProject(lifecycleOpeningId, {}),
    (error) => error === failedSave.exact,
  );
  assert.deepEqual(failedSave.calls, ["mutation"]);
  assert.deepEqual(failedSave.world, before);
  for (const stage of ["prepare", "load", "outbox"]) {
    const failed = lifecycleOwner(stage);
    failed.fail(stage);
    await failed.service.openFinishedProject(lifecycleOpeningId, {});
    await settleLifecycleCallbacks();
    assert.equal(failed.world.projects.find((project) => project.id === lifecycleOpeningId)!.status, "complete");
    assert.equal(failed.calls.filter((call) => call === "processed").length, stage === "prepare" ? 1 : 0);
  }

  const retired = createActivationScope(),
    disposed = lifecycleOwner("disposed");
  const releaseRetired = retired.run(() => configureProjectLifecycle(disposed.service));
  const clearRetired = installDefaultActivation(retired, () => {});
  disposed.pause("mutation");
  const pending = openFinishedProject(lifecycleOpeningId, {});
  await disposed.entered.promise;
  retired.dispose();
  disposed.gate.resolve();
  await assert.rejects(pending, /Original Project lifecycle connection unavailable/);
  assert.deepEqual(disposed.calls, ["mutation"]);
  releaseRetired();
  clearRetired();
  await assert.rejects(createNewVenueProject({}), /not configured/);

  const old = createActivationScope(),
    replacement = createActivationScope();
  const delayed = lifecycleOwner("disposed loader"),
    current = lifecycleOwner("current loader");
  const releaseOld = old.run(() => configureProjectLifecycle(delayed.service));
  const clearOld = installDefaultActivation(old, () => {});
  delayed.pause("load");
  await openFinishedProject(lifecycleOpeningId, {});
  await delayed.entered.promise;
  const releaseCurrent = replacement.run(() => configureProjectLifecycle(current.service));
  const clearCurrent = installDefaultActivation(replacement, () => {});
  old.dispose();
  releaseOld();
  clearOld();
  delayed.gate.resolve();
  await settleLifecycleCallbacks();
  assert.equal(
    delayed.calls.includes("outbox"),
    false,
    "disposed originating loader fails without borrowing B's Wish connection",
  );
  assert.deepEqual(current.calls, []);
  await openFinishedProject(lifecycleOpeningId, {});
  await settleLifecycleCallbacks();
  assert(current.owners.every((owner) => owner === replacement));
  releaseCurrent();
  clearCurrent();
  replacement.dispose();

  const draftA = createActivationScope(),
    draftB = createActivationScope();
  const firstDraft = lifecycleOwner("draft A", false),
    secondDraft = lifecycleOwner("draft B", false);
  const releaseDraftA = draftA.run(() => configureProjectLifecycle(firstDraft.service));
  const clearDraftA = installDefaultActivation(draftA, () => {});
  firstDraft.pause("mutation");
  const pendingDraft = createNewVenueProject({ name: "Workshop", classes: ["workplace"], description: "A workshop." });
  await firstDraft.entered.promise;
  const releaseDraftB = draftB.run(() => configureProjectLifecycle(secondDraft.service));
  const clearDraftB = installDefaultActivation(draftB, () => {});
  releaseDraftA();
  clearDraftA();
  firstDraft.gate.resolve();
  await pendingDraft;
  assert.deepEqual(firstDraft.calls, ["mutation", "new-draft"]);
  assert(firstDraft.owners.every((owner) => owner === draftA));
  assert.equal(firstDraft.world.projects.length, 1);
  assert.equal(secondDraft.world.projects.length, 0);
  releaseDraftB();
  clearDraftB();
  draftA.dispose();
  draftB.dispose();

  const cas = lifecycleOwner("retry", false),
    losing = structuredClone(cas.world);
  cas.retry(losing);
  await cas.service.createNewVenueProject({ name: "Workshop", classes: ["workplace"], description: "A workshop." });
  assert.deepEqual(cas.calls, ["mutation", "new-draft", "new-draft"]);
  assert.equal(cas.world.projects.length, 1);
  assert.equal(losing.projects.length, 1);
  assert.notEqual(
    cas.world.projects[0]!.id,
    losing.projects[0]!.id,
    "UUID allocation remains inside each save attempt",
  );
  assert.equal(cas.world.progressTasks.length, 1);
  assert.equal(losing.progressTasks.length, 1);
  const synchronous = lifecycleOwner("standalone", false);
  const draft = draftNewVenueProject(
    synchronous.world,
    { name: "Studio", classes: ["workplace"], description: "A studio." },
    "rosa",
    "same-project",
  );
  assert.equal(draft.id, "same-project");
  assert.deepEqual(
    synchronous.calls,
    [],
    "supplied-state draft remains usable without an activation or runtime connection",
  );

  const changed = lifecycleOwner("changed roster"),
    firstAttempt = structuredClone(changed.world);
  changed.retry(firstAttempt);
  changed.beforeMutation(() =>
    changed.world.venues.find((venue) => venue.id === "mill")!.workerIds!.push("late-worker"),
  );
  await assert.rejects(changed.service.openFinishedProject(lifecycleOpeningId, {}), /Renew.*approvals/);
  assert.equal(firstAttempt.projects.find((project) => project.id === lifecycleOpeningId)!.status, "complete");
  assert.equal(changed.world.projects.find((project) => project.id === lifecycleOpeningId)!.status, "finishing");
  assert.deepEqual(changed.calls, ["mutation"], "failed authoritative attempt schedules no detached job");
  const debug = lifecycleOwner("debug");
  await assert.rejects(debug.service.debugCompleteProjectConstruction(lifecycleOpeningId), /not enabled/);
  assert.deepEqual(debug.calls, ["debug"]);
  console.log("PASS owned Project lifecycle connections, detached originating jobs, CAS retries and standalone drafts");
}
void main()
  .then(ownedEvidenceChecks)
  .then(ownedLifecycleChecks)
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
