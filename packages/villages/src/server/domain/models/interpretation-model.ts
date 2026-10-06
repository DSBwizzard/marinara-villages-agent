import type { InterpretationSettings } from "../rules/interpretation-policy.js";
import type {
  InterpretationCheck,
  InterpretationEvidence,
  InterpretationResult,
} from "./interpretation-check-model.js";

export type InterpretationTrace = {
  id: string;
  question: string;
  domain: InterpretationCheck["domain"];
  evidence: InterpretationEvidence[];
  decisions: {
    status: "off" | "unavailable" | "answered";
    outcome?: string;
    model?: string;
    scores?: Record<string, number>;
    threshold?: number;
    reason?: string;
  };
  system: {
    status: "not-requested" | "pending" | "complete" | "unavailable" | "unknown";
    outcome?: string;
    reason?: string;
  };
  result: InterpretationResult;
  applied: string;
  startedAt: string;
};
export type InterpretationBatch = {
  results: InterpretationResult[];
  traces: InterpretationTrace[];
  settings: InterpretationSettings;
  checks: InterpretationCheck[];
};
