import { createHash } from "node:crypto";
export const backgroundRevision = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
