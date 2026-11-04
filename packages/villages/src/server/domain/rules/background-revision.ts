import { createHash } from "node:crypto";
export const backgroundRevision = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
export const backgroundSlotId = (work: { kind: string; subjectId: string }) =>
  "villages-background-" + backgroundRevision([work.kind, work.subjectId]);
export const isBackgroundInstance = (value: unknown): value is string =>
  typeof value === "string" && /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value);
