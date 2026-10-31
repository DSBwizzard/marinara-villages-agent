import { createHash } from "node:crypto";
export const backgroundRevision = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
export const backgroundSlotId = (work: { kind: string; subjectId: string }) =>
  "villages-background-" + backgroundRevision([work.kind, work.subjectId]);
