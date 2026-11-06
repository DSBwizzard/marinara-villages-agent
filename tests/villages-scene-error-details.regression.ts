import assert from "node:assert/strict";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { createExchangeProcessing } from "../packages/villages/src/server/domain/decoding/exchange-codec.js";
import { coerceWorkFailure } from "../packages/villages/src/server/domain/rules/work-failure.js";
import {
  sceneChangeDiagnosticId,
  sceneChangeError,
  sceneErrorDetails,
} from "../packages/villages/src/server/features/scenes/error-details.js";

const stamp = "2026-11-05T12:00:00.000Z";
const processing = createExchangeProcessing({
  seed: "seed",
  sceneId: "scene",
  submissionId: "turn",
  order: 1,
  lineIds: ["current"],
  actionReceiptIds: [],
});
const scene = coerceSession({
  version: 4,
  id: "scene",
  villageSeed: "seed",
  status: "active",
  placeId: "place",
  placeName: "The Mill",
  startedAt: stamp,
  lines: [
    {
      id: "earlier",
      speakerId: "mara",
      name: "Mara",
      role: "assistant",
      content: "Exact relevant earlier words",
      heardBy: ["mara"],
      at: stamp,
    },
    {
      id: "current",
      speakerId: "mara",
      name: "Mara",
      role: "assistant",
      content: "UNRELATED CURRENT DIALOGUE",
      heardBy: ["mara"],
      at: stamp,
    },
    {
      id: "unrelated",
      speakerId: "ivy",
      name: "Ivy",
      role: "assistant",
      content: "UNRELATED PRIVATE EVIDENCE",
      heardBy: ["ivy"],
      at: stamp,
    },
  ],
  submissions: [
    {
      id: "turn",
      mode: "chat",
      message: "The relevant player message",
      processing,
      liveProposals: {
        version: 1,
        sourceFingerprint: "source",
        playerLineId: "player-line",
        replyLineIds: ["current"],
        earlierLineIds: ["earlier"],
        memoryChanges: [
          {
            text: "Relevant proposed memory",
            learners: { mara: { support: [{ lineId: "earlier", excerpt: "Exact relevant earlier words" }] } },
          },
        ],
        relationshipChanges: {
          changes: [{ reason: "UNRELATED RELATIONSHIP CHANGE" }],
          permissions: [{ lineIds: ["earlier"], reason: "Exact rejected permission" }],
          disclosures: [],
        },
      },
      at: stamp,
    },
  ],
});
const turn = scene.submissions[0]!;
turn.processing!.domains.memories = {
  ...turn.processing!.domains.memories,
  status: "rejected",
  reason: "Affected memory proposals rejected",
  rejectedProposals: [{ kind: "memory", index: 0, reason: "unwitnessed source quotation" }],
};
turn.processing!.domains.relationships = {
  ...turn.processing!.domains.relationships,
  status: "rejected",
  reason: "Rejected permission",
  rejectedProposals: [{ kind: "permissions", index: 0, reason: "Exact authority validation failure" }],
};
const before = JSON.stringify(scene);
const report = sceneErrorDetails(scene);
assert.equal(JSON.stringify(scene), before, "diagnostic reads never mutate saved work");
const memory = report.errors.find(
  (row) => row.id === sceneChangeDiagnosticId(turn.id, "memories", turn.processing!.domains.memories),
)!;
assert.match(memory.details, /unwitnessed source quotation/);
assert.match(memory.details, /Relevant proposed memory/);
assert.match(memory.details, /Exact relevant earlier words/);
assert.doesNotMatch(memory.details, /UNRELATED/);
const permission = report.errors.find(
  (row) => row.id === sceneChangeDiagnosticId(turn.id, "relationships", turn.processing!.domains.relationships),
)!;
assert.match(permission.details, /Exact rejected permission/);
assert.match(permission.details, /Exact authority validation failure/);
assert.doesNotMatch(permission.details, /UNRELATED RELATIONSHIP CHANGE/);
assert.equal(
  sceneChangeError(turn.processing!.domains.memories, "memories"),
  "The AI based a memory on something a resident didn’t see or hear.",
);
const originalId = memory.id;
turn.processing!.domains.memories.attempts++;
assert.notEqual(
  sceneChangeDiagnosticId(turn.id, "memories", turn.processing!.domains.memories),
  originalId,
  "a later attempt cannot supply an earlier error’s details",
);

turn.effectFailures = {
  memories: { kind: "metadata", message: "Exact missing field", proposal: { text: "large context ".repeat(3000) } },
};
turn.processing!.domains.memories.status = "failed";
turn.processing!.domains.memories.rejectedProposals = [];
turn.processing!.domains.memories.failure = {
  cause: "missing_result",
  stage: "metadata",
  message: "Exact missing field",
};
const bounded = sceneErrorDetails(scene);
assert.match(bounded.errors[0]!.details, /omittedCharacters/);
assert.ok(JSON.stringify(bounded).length < 16_000, "bound context without hiding validation reasons");
turn.processing!.domains.memories.failure.message =
  "Error: Malformed memory proposal: memories[15].text must be a nonempty string";
turn.effectFailures.memories!.proposal = {
  memoryChanges: [
    ...Array.from({ length: 15 }, () => ({ text: "UNRELATED VALID MEMORY ".repeat(100) })),
    { text: null, evidence: [], marker: "EXACT LATE FAILURE" },
  ],
};
const lateFailure = sceneErrorDetails(scene).errors[0]!.details;
assert.match(lateFailure, /EXACT LATE FAILURE/);
assert.match(lateFailure, /"text": null/);
assert.doesNotMatch(lateFailure, /UNRELATED/);
turn.effectFailures.projects = {
  kind: "metadata",
  message: "Malformed Project metadata",
  proposal: { projectSpeech: [], interpretationRouting: { reason: "EXACT INVALID ROUTING" } },
};
turn.processing!.domains.projects.status = "failed";
turn.processing!.domains.projects.failure = {
  cause: "missing_result",
  stage: "metadata",
  message: "Malformed Project metadata",
};
const routingFailure = sceneErrorDetails(scene).errors.find(
  (row) => row.id === sceneChangeDiagnosticId(turn.id, "projects", turn.processing!.domains.projects),
)!;
assert.match(routingFailure.details, /EXACT INVALID ROUTING/);
assert.match(routingFailure.details, /interpretationRouting/);

scene.operation = {
  id: "request",
  attemptId: "attempt",
  kind: "turn",
  input: { message: "Relevant original input" },
  stage: "scene-response",
  sceneRevision: 1,
  startedAt: stamp,
  status: "interrupted",
  token: "DO NOT EXPORT OWNERSHIP TOKEN",
  snapshot: { privatePrompt: "DO NOT EXPORT PROMPT" },
  checkpoints: { response: "DO NOT EXPORT ENTIRE RESPONSE" },
  attempts: {},
  error: "Exact parser failure",
  failure: {
    cause: "missing_result",
    stage: "scene-response",
    message: "Exact parser failure",
    detail: "segments[2].text must be a nonempty string. Bearer credential-value",
  },
};
const operation = sceneErrorDetails(scene).errors[0]!;
assert.equal(operation.id, "operation:request:attempt");
assert.match(operation.details, /segments\[2\]\.text/);
assert.match(operation.details, /Relevant original input/);
assert.doesNotMatch(operation.details, /DO NOT EXPORT|credential-value/);
assert.match(operation.details, /Bearer \[redacted\]/);
assert.equal(
  coerceWorkFailure(scene.operation.failure)!.detail,
  scene.operation.failure.detail,
  "saved parser causes survive reload",
);
scene.operation.input.prompt = "DO NOT EXPORT AN INPUT PROMPT";
scene.operation.input.connectionConfig = { secret: "DO NOT EXPORT CONNECTION CONFIGURATION" };
assert.doesNotMatch(sceneErrorDetails(scene).errors[0]!.details, /DO NOT EXPORT/);
console.log(
  "Scene error details: exact causes, relevant rejected proposals and historical sources, bounded context, read-only identity and credential boundaries passed.",
);
