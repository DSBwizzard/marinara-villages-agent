import assert from "node:assert/strict";
import { mock } from "node:test";
import { fixture, renovation, venue } from "./fixtures/villages-projects.fixture.js";
import { createProjectEvidence } from "../packages/villages/src/server/features/projects/project-evidence-service.js";
import { readRenovationChange } from "../packages/villages/src/server/domain/rules/project-design.js";
import { projectSpeechPrompt } from "../packages/villages/src/server/domain/rules/project-interpretation.js";
import { projectDesignKey } from "../packages/villages/src/server/domain/rules/project-terms.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { projectSceneEvidence } from "../packages/villages/src/server/domain/rules/project-scene-evidence.js";
import { createSceneQueryService } from "../packages/villages/src/server/features/scenes/scene-query-service.js";
import { notFound } from "../packages/villages/src/server/domain/rules/errors.js";
const f = fixture(),
  id = await renovation(f);
const line = {
  id: "spoken",
  speakerId: "a",
  name: "A",
  role: "assistant",
  kind: "dialogue",
  heardBy: ["a"],
  content: "I approve this change and will lead it.",
  at: f.state().setupAt,
};
const turn: any = {
  sessionId: "visit",
  submissionId: "turn",
  villageSeed: f.state().seed,
  venueId: "cafe",
  zoneId: "common",
  at: f.state().setupAt,
  activeIdsAtTurn: ["a"],
  lines: [line],
  projectMetadataRejected: false,
  projectContexts: [{ projectId: id, revision: 1, phase: "planning" }],
  projectSpeech: ["approval", "builder"].map((kind) => ({
    version: 1,
    projectId: id,
    revision: 1,
    phase: "planning",
    kind,
    speakerId: "a",
    citations: [{ lineId: "spoken", quote: line.content }],
  })),
};
let visit: any = {
  version: 3,
  id: "visit",
  villageSeed: f.state().seed,
  placeId: "cafe",
  placeName: "Cafe",
  participants: [{ characterId: "a" }],
  submissions: [
    {
      id: "turn",
      mode: "chat",
      at: turn.at,
      replyLineIds: ["spoken"],
      activeIdsAtTurn: ["a"],
      message: "private player input",
    },
  ],
  lines: [line],
};
const evidence = createProjectEvidence({
  readVillageState: async () => f.state(),
  mutateVillageState: f.mutate,
  sceneQueries: () => ({
    readProjectTurnEvidence: async () => turn,
    activeVenueSession: async () => visit,
    listVenueVisits: async () => [],
  }),
} as any);
await evidence.processProjectSpeechTurn("visit", "turn");
assert.equal(f.get(id).status, "planning");
assert.equal(f.get(id).lifecycle!.approvals.length, 1);
assert.equal(f.get(id).lifecycle!.candidates.length, 1, "one exchange establishes both independent facts");
await evidence.processProjectSpeechTurn("visit", "turn");
assert.equal(f.get(id).lifecycle!.evidenceIds.length, 2, "replay applies neither agreement twice");
assert.equal(f.get(id).lifecycle!.spokenProofs.length, 1);
await f.service.reviseRenovationProject(id, f.body(id, { detail: "Four people can share the room.", capacity: 4 }));
assert.equal(f.get(id).lifecycle!.approvals.length, 0);
assert.equal(f.get(id).lifecycle!.candidates.length, 0);
await evidence.processProjectSpeechTurn("visit", "turn");
assert.equal(f.get(id).lifecycle!.candidates.length, 0, "old revision cannot regain authority");
assert.notEqual(projectDesignKey(f.get(id)), "");
for (const extra of [
  { kind: "whisper" },
  { kind: "side" },
  { contactHidden: true },
  { contactReport: true },
  { soundOnly: { player: true, text: "A muffled voice." } },
  { delivery: "whisper", targetId: "another-resident" },
]) {
  visit = { ...visit, lines: [{ ...line, ...extra }] };
  assert.deepEqual(await evidence.listProjectEvidenceCandidates(id), []);
}
visit = { ...visit, villageSeed: "another-world", lines: [line] };
assert.deepEqual(await evidence.listProjectEvidenceCandidates(id), []);
visit = { ...visit, villageSeed: f.state().seed };
assert.equal(
  (await evidence.listProjectEvidenceCandidates(id))[0].playerMessage,
  "",
  "candidate list does not return unrelated player input",
);
turn.projectContexts[0].revision = turn.projectSpeech[0].revision = 2;
turn.lines = [{ ...line, kind: "whisper" }];
await assert.rejects(
  evidence.recordProjectSpokenEvidence(id, {
    sessionId: "visit",
    submissionId: "turn",
    kind: "approval",
    interpretationIndex: 0,
  }),
  /not witnessed/,
);
const home = venue("home", "residence");
home.zones!.push({
  ...defaultVenueSpace("residence", "Hidden private interior"),
  id: "bedroom",
  name: "Bedroom",
  kind: "private-residence",
  ownerId: "a",
  roomSpecification: "Hidden private specification",
  seen: false,
  connectedTo: ["common"],
});
f.state().venues.push(home);
const change = readRenovationChange(f.state(), home, { detail: "Room for another resident.", capacity: 3 });
assert.equal(change.zones!.find((zone) => zone.id === "bedroom")!.description, "");
assert.equal(change.zones!.find((zone) => zone.id === "bedroom")!.roomSpecification, undefined);
assert.equal(change.zones!.find((zone) => zone.id === "bedroom")!.preserveDescription, true);
assert.doesNotMatch(JSON.stringify(change), /Hidden private/);
const privateProject = { ...f.get(id), lifecycle: { ...f.get(id).lifecycle!, change } };
f.state().projects.push({ ...privateProject, id: "private-project" });
assert.doesNotMatch(
  projectSpeechPrompt(f.state(), [{ projectId: "private-project", revision: 2, phase: "planning" }]),
  /Hidden private/,
);
console.log("Independent agreements, shared citations, stale revisions and Project privacy passed.");

const retiredWorld = fixture(),
  retiredId = await renovation(retiredWorld);
const retiredScene = coerceSession({
  ...visit,
  status: "closed",
  villageSeed: retiredWorld.state().seed,
  lines: [line],
  submissions: [
    {
      ...visit.submissions[0],
      projectContexts: [{ projectId: retiredId, revision: 1, phase: "planning" }],
      projectSpeech: [
        {
          version: 1,
          projectId: retiredId,
          revision: 1,
          phase: "planning",
          kind: "builder",
          speakerId: "a",
          citations: [{ lineId: "spoken", quote: line.content }],
        },
      ],
    },
  ],
});
const compact = projectSceneEvidence(retiredScene);
const queries = createSceneQueryService({
  readSession: async () => {
    throw notFound("Scene retired");
  },
  readVillageState: async () => retiredWorld.state(),
  villagesDocuments: () => ({ list: async () => [] }),
  readRetiredProjectScenes: async () => [compact],
});
const retiredEvidence = createProjectEvidence({
  readVillageState: async () => retiredWorld.state(),
  mutateVillageState: retiredWorld.mutate,
  sceneQueries: () => ({
    ...queries,
    activeVenueSession: async () => null,
    listVenueVisits: async () => [],
    listRetiredProjectScenes: async () => [compact],
  }),
});
assert.equal((await retiredEvidence.listProjectEvidenceCandidates(retiredId))[0].quote, line.content);
await retiredEvidence.recordProjectSpokenEvidence(retiredId, {
  sessionId: "visit",
  submissionId: "turn",
  kind: "builder",
  interpretationIndex: 0,
});
assert.equal(retiredWorld.get(retiredId).lifecycle!.candidates[0].residentId, "a");
assert.equal(retiredWorld.get(retiredId).lifecycle!.spokenProofs[0].quote, line.content);

// Recovering a withdrawal spoken before Start cannot manufacture extra work time.
const delayed = fixture(),
  delayedId = await delayed.newProject();
const startedAt = new Date("2026-10-24T11:00:00.000Z");
await delayed.service.startProjectConstruction(delayedId, delayed.body(delayedId), startedAt);
const withdrawal = {
  ...turn,
  at: "2026-10-24T10:00:00.000Z",
  villageSeed: delayed.state().seed,
  lines: [{ ...line, content: "I withdraw my commitment to lead." }],
  projectContexts: [{ projectId: delayedId, revision: delayed.get(delayedId).lifecycle!.revision, phase: "planning" }],
  projectSpeech: [
    {
      version: 1,
      projectId: delayedId,
      revision: delayed.get(delayedId).lifecycle!.revision,
      kind: "withdrawal",
      speakerId: "a",
      citations: [{ lineId: line.id, quote: "I withdraw my commitment to lead." }],
    },
  ],
};
await createProjectEvidence({
  readVillageState: async () => delayed.state(),
  mutateVillageState: delayed.mutate,
  sceneQueries: () => ({ readProjectTurnEvidence: async () => withdrawal }),
} as any).processProjectSpeechTurn("old-scene", "old-turn");
assert.equal(delayed.get(delayedId).status, "paused");
assert.equal(delayed.get(delayedId).lifecycle!.workOrder!.remainingMs, 24 * 3600000);
assert.equal(delayed.get(delayedId).lifecycle!.spokenProofs[0].at, withdrawal.at, "evidence retains the speech time");
await delayed.agree(delayedId);
const resumedAt = new Date("2026-10-24T11:01:00.000Z");
await delayed.service.resumeProject(delayedId, delayed.body(delayedId), resumedAt);
assert.equal(Date.parse(delayed.get(delayedId).lifecycle!.workOrder!.completesAt) - resumedAt.getTime(), 24 * 3600000);

// Accepting an old encounter today affects the remaining real work today.
const preserved = fixture(),
  preservedId = await preserved.newProject();
await preserved.service.startProjectConstruction(preservedId, preserved.body(preservedId), startedAt);
const appliedAt = "2026-10-24T18:00:00.000Z";
const oldSpeech = {
  ...withdrawal,
  preservationVersion: 1,
  at: "2026-10-24T07:00:00.000Z",
  villageSeed: preserved.state().seed,
  projectContexts: [
    { projectId: preservedId, revision: preserved.get(preservedId).lifecycle!.revision, phase: "working" },
  ],
  projectSpeech: [
    {
      ...withdrawal.projectSpeech[0],
      projectId: preservedId,
      revision: preserved.get(preservedId).lifecycle!.revision,
    },
  ],
};
mock.timers.enable({ apis: ["Date"], now: Date.parse(appliedAt) });
try {
  await createProjectEvidence({
    readVillageState: async () => preserved.state(),
    mutateVillageState: preserved.mutate,
    sceneQueries: () => ({ readProjectTurnEvidence: async () => oldSpeech }),
  } as any).processProjectSpeechTurn("old-scene", "newly-accepted");
  assert.equal(preserved.get(preservedId).lifecycle!.workOrder!.remainingMs, 17 * 3600000);
  assert.equal(preserved.get(preservedId).updatedAt, appliedAt);
  assert.equal(preserved.get(preservedId).lifecycle!.spokenProofs[0].at, oldSpeech.at);
} finally {
  mock.timers.reset();
}
