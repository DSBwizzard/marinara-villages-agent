import assert from "node:assert/strict";
import { fixture, renovation } from "./fixtures/villages-projects.fixture.js";
import { createProjectChecks } from "../packages/villages/src/server/features/projects/project-check-service.js";
import { projectProposals } from "../packages/villages/src/server/domain/rules/project-check-rules.js";
import {
  bindProjectSpeech,
  validateProjectSpeech,
  coerceProjectSpeech,
  projectSpeechContexts,
} from "../packages/villages/src/server/domain/rules/project-interpretation.js";
import { routeInterpretationChecks } from "../packages/villages/src/server/domain/rules/interpretation-routing.js";
const f = fixture(),
  id = await renovation(f);
let selected: any[] = [];
const service = createProjectChecks({
  readVillageState: async () => f.state(),
  mutateVillageState: f.mutate,
  sceneQueries: () => ({}),
  pipelineSignal: () => {},
  contextualChecks: async (_id: any, checks: any) => checks,
  boundInterpretationEvidence: (check: any) => check,
  routeInterpretationChecks,
  recordInterpretationRouting: async () => {},
  saveInterpretationContext: async () => {},
  writeInterpretationDiagnostics: async () => {},
  interpretChecks: async (checks: any) => {
    selected = checks;
    return null;
  },
} as any);
const draft = [{ speakerId: "a", kind: "dialogue", content: "I approve Renovate and will lead it.", heardBy: ["a"] }];
await service.interpretProjectDraft(
  { id: "scene", activeIds: ["a"], lines: [], submissions: [] } as any,
  f.state(),
  "Will you approve and lead Renovate?",
  draft as any,
  ["a"],
  "request",
  undefined,
  ["a"],
);
assert.deepEqual(selected.map((check) => check.facts.kind).sort(), ["approval", "builder", "withdrawal"]);
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
