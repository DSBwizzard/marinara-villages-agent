import type { WorkFailure } from "../rules/work-failure.js";

export type InterpretationEvidence = {
  id: string;
  speakerId: string;
  name: string;
  content: string;
  kind?: string;
  current?: boolean;
  at?: string;
};
export type InterpretationCheck = {
  id: string;
  domain: "room" | "project" | "wish";
  question: string;
  outcomes: { id: string; statement: string }[];
  evidence: InterpretationEvidence[];
  facts: unknown;
  /** Open-ended extraction stays on System; this is routing, not a gameplay requirement. */
  decisionEligible?: boolean;
  decisionReason?: string;
  systemInstruction?: string;
  essentialEvidenceIds?: string[];
};
export type InterpretationResult = {
  outcome: string;
  source: "decisions" | "system";
  evidenceIds: string[];
  reason: string;
  details?: unknown;
  failure?: WorkFailure;
};
