import assert from "node:assert/strict";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import {
  sceneChangeDiagnosticId,
  sceneErrorDetails,
} from "../packages/villages/src/server/features/scenes/error-details.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import { publicSceneResponse } from "../packages/villages/src/server/domain/rules/scene-public.js";
const at = "2026-11-09T12:00:00.000Z";
function scene(count = 1, reason = "A required cited source was not supplied.") {
  return coerceSession({
    version: 5,
    id: "scene",
    villageSeed: "world",
    sceneRevision: 1,
    status: "active",
    startedAt: at,
    operation: {
      id: "turn",
      kind: "turn",
      input: { message: "PRIVATE ORIGINAL", privatePrompt: "PRIVATE PROMPT" },
      token: "PRIVATE OWNER TOKEN",
      attemptId: "attempt",
      status: "interrupted",
      stage: "saved narration",
      startedAt: at,
      sceneRevision: 1,
      snapshot: null,
      checkpoints: { private: "PRIVATE CHECKPOINT" },
      attempts: {},
      error: "Bearer abc.def api_key=private-secret",
    },
    submissions: Array.from({ length: count }, (_, index) => ({
      id: "turn-" + index,
      message: "PRIVATE ORIGINAL",
      mode: "chat",
      targetId: "",
      at,
      requestFingerprint: memoryHash([index]),
      acceptance: { status: "applied", rejected: [{ id: "optional", reason }] },
      episodeId: "episode-" + index,
      progressProcessedAt: at,
    })),
  });
}
const current = scene(),
  before = structuredClone(current),
  report = sceneErrorDetails(current);
assert(
  report.errors.some(
    (row) =>
      row.id === sceneChangeDiagnosticId(current.submissions[0]) && row.details.includes("required cited source"),
  ),
);
assert.deepEqual(current, before, "reading saved diagnostics never changes gameplay or purchased evidence");
const serialized = JSON.stringify(report);
assert(
  !serialized.includes("PRIVATE") && !serialized.includes("abc.def") && !serialized.includes("private-secret"),
  "owner diagnostics omit private input, prompts, tokens and checkpoints and redact credentials in failures",
);
assert(
  !JSON.stringify(publicSceneResponse(current)).includes("required cited source"),
  "ordinary playback omits rejected proposal details",
);
const large = scene(55, "x".repeat(2000)),
  bounded = sceneErrorDetails(large);
assert(bounded.errors.length <= 51 && bounded.omittedErrors >= 5);
assert(bounded.errors.reduce((total, row) => total + row.details.length, 0) <= 24_000);
assert(
  bounded.errors.some((row) => row.id === sceneChangeDiagnosticId(large.submissions[54])),
  "the latest failure survives diagnostic bounds",
);
console.log(
  "Saved narration diagnostics preserve exact failure identity, bounded recent errors and private data boundaries.",
);
