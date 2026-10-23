import assert from "node:assert/strict";
import { fixture, renovation, venue } from "./fixtures/villages-projects.fixture.js";
import { createProjectEvidence } from "../packages/villages/src/server/features/projects/project-evidence-service.js";
import { readRenovationChange } from "../packages/villages/src/server/domain/rules/project-design.js";
import { projectSpeechPrompt } from "../packages/villages/src/server/domain/rules/project-interpretation.js";
import { projectDesignKey } from "../packages/villages/src/server/domain/rules/project-terms.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
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
