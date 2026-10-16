import { asRecord } from "./coerce.js";

export type InterpretationSettings = { decisionsEnabled: boolean };
export function coerceInterpretationSettings(value: unknown): InterpretationSettings {
  const raw = asRecord(value);
  return { decisionsEnabled: raw.decisionsEnabled === true };
}
