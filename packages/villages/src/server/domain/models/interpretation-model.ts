import type { InterpretationCheck, InterpretationResult } from "./interpretation-check-model.js";
export type InterpretationBatch = {
  results: InterpretationResult[];
  checks: InterpretationCheck[];
};
