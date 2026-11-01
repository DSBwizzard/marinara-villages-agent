import assert from "node:assert/strict";
import { fixture, renovation } from "./fixtures/villages-projects.fixture.js";
import {
  bindProjectSpeech,
  validateProjectSpeech,
  coerceProjectSpeech,
  projectSpeechContexts,
} from "../packages/villages/src/server/domain/rules/project-interpretation.js";
const f = fixture(),
  id = await renovation(f);
const draft = [{ speakerId: "a", kind: "dialogue", content: "I approve Renovate and will lead it.", heardBy: ["a"] }];
const context = projectSpeechContexts(f.state(), ["a"], "");
const proposals = bindProjectSpeech(
  ["approval", "builder"].map((kind) => ({
    projectId: id,
    kind,
    speakerId: "a",
    citations: [{ segment: 0, quote: draft[0].content }],
  })),
  context,
  [{ ...draft[0], id: "0" }] as any,
);
assert.equal(proposals.length, 2);
for (const proposal of proposals) assert.equal(validateProjectSpeech(proposal, [{ ...draft[0], id: "0" }]), "");
assert.equal(coerceProjectSpeech(proposals).length, 2);
assert.deepEqual(
  bindProjectSpeech([{ projectId: "unknown", kind: "approval", speakerId: "a", citations: [] }], context, []),
  [],
);
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
