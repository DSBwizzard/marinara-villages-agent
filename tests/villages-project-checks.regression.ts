import assert from "node:assert/strict";
import { fixture, renovation } from "./fixtures/villages-projects.fixture.js";
import { projectProposals } from "../packages/villages/src/server/domain/rules/project-check-rules.js";
import {
  bindProjectSpeech,
  validateProjectSpeech,
  coerceProjectSpeech,
  projectSpeechContexts,
} from "../packages/villages/src/server/domain/rules/project-interpretation.js";
const f = fixture(),
  id = await renovation(f);
const draft = [{ speakerId: "a", kind: "dialogue", content: "I approve Renovate and will lead it.", heardBy: ["a"] }];
const selected = ["approval", "builder", "withdrawal"].map((kind) => ({
  id: kind,
  facts: {
    kind,
    actorId: "a",
    projectId: id,
    revision: f.get(id).lifecycle!.revision,
    phase: f.get(id).lifecycle!.phase,
  },
  evidence: [{ ...draft[0], id: "draft:0", current: true }],
}));
const batch: any = {
  checks: selected,
  results: selected.map((check) => ({
    outcome: check.facts.kind === "approval" ? "approve" : check.facts.kind === "builder" ? "commit" : "none",
    source: "system",
    evidenceIds: ["draft:0"],
    reason: "Witnessed speech",
  })),
  traces: selected.map((check, index) => ({ id: "trace:" + index, applied: "Not yet applied", ...check })),
};
const proposals = projectProposals(batch);
assert.equal(proposals.length, 2);
for (const proposal of proposals) assert.equal(validateProjectSpeech(proposal, [{ ...draft[0], id: "0" }]), "");
assert.equal(coerceProjectSpeech(proposals).length, 2);
batch.results[0].source = "decisions";
assert.equal(projectProposals(batch).length, 1, "unbound Decision scores establish no agreement");
const context = projectSpeechContexts(f.state(), ["a"], "");
assert.equal(context[0].revision, f.get(id).lifecycle!.revision);
const bound = bindProjectSpeech(
  [{ projectId: id, kind: "builder", speakerId: "a", citations: [{ segment: 0, quote: draft[0].content }] }],
  context,
  [{ ...draft[0], id: "saved-line" }] as any,
);
assert.equal(bound[0].citations[0].lineId, "saved-line");
assert.equal(
  validateProjectSpeech({ ...bound[0], speakerId: "b" }, [{ ...draft[0], id: "saved-line" }]),
  "Interpretation citation does not match this speaker's saved words.",
);
console.log("Current Project interpretation contracts, independent checks and grounded citations passed.");
