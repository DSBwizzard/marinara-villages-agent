import { z } from "zod";
import { readMemoryHead, assertMemoryWorld } from "./memory-payload-store.js";
import { readOperationEvidenceReference } from "./operation-evidence.js";
import { memoryRequire } from "../../domain/rules/memory-integrity.js";

const identity = z.string().min(1).max(200);
const metadata = z
  .object({
    sceneId: identity,
    submissionId: identity,
    episodeId: identity,
    sceneRevision: z.number().int().nonnegative().safe(),
    originalOperationId: identity,
    request: z.unknown(),
    before: z.unknown(),
    after: z.unknown(),
  })
  .strict();

export function readSceneRetryRecord(root: { sceneRetry?: unknown; seed: string; setupAt: string }) {
  if (root.sceneRetry === undefined) return undefined;
  const row = metadata.parse(root.sceneRetry);
  const before = readMemoryHead(row.before),
    after = readMemoryHead(row.after);
  memoryRequire(after, "Scene Retry has no accepted history");
  if (before) assertMemoryWorld(before, root);
  assertMemoryWorld(after, root);
  return { ...row, before, after, request: readOperationEvidenceReference(row.request) };
}
