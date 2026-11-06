import type { InterpretationCheck } from "../models/interpretation-check-model.js";
import { createHash } from "node:crypto";

export const fingerprint = (checks: InterpretationCheck[]) =>
  createHash("sha256").update(JSON.stringify(checks)).digest("hex");
