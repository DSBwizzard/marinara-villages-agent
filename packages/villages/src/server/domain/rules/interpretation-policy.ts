import { asRecord } from "./coerce.js";

export type InterpretationSettings = { decisionsEnabled: boolean; compareSystem: boolean };
export function coerceInterpretationSettings(value: unknown): InterpretationSettings {
  const raw = asRecord(value);
  return { decisionsEnabled: raw.decisionsEnabled === true, compareSystem: raw.compareSystem !== false };
}
