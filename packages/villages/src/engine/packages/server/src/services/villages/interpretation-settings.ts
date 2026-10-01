import { asRecord } from "./coerce.js";
import { badRequest } from "./errors.js";
import { villagesDocuments, VILLAGES_PACKAGE_ID } from "./package-runtime.js";
import { mutateDocument, type DocumentSlot } from "./village-store.js";

export type InterpretationSettings = { decisionsEnabled: boolean; compareSystem: boolean };
export function coerceInterpretationSettings(value: unknown): InterpretationSettings {
  const raw = asRecord(value);
  return { decisionsEnabled: raw.decisionsEnabled === true, compareSystem: raw.compareSystem !== false };
}
const slot: DocumentSlot<InterpretationSettings> = {
  kind: "settings",
  name: "Interpretation settings",
  description: "Optional Decisions and independent System comparison",
  coerce: coerceInterpretationSettings,
  label: () => "Interpretation settings",
};
export async function readInterpretationSettings(): Promise<InterpretationSettings> {
  try {
    return coerceInterpretationSettings(
      (await villagesDocuments().getById(VILLAGES_PACKAGE_ID, "villages-interpretation-settings"))?.data,
    );
  } catch {
    return coerceInterpretationSettings(null);
  }
}
export async function saveInterpretationSettings(body: unknown): Promise<InterpretationSettings> {
  const raw = asRecord(body);
  const patch: Partial<InterpretationSettings> = {};
  for (const key of ["decisionsEnabled", "compareSystem"] as const) {
    if (raw[key] === undefined) continue;
    if (typeof raw[key] !== "boolean") throw badRequest("Interpretation switches must be true or false.");
    patch[key] = raw[key];
  }
  await mutateDocument("villages-interpretation-settings", slot, (state) => {
    Object.assign(state, patch);
  });
  return readInterpretationSettings();
}
