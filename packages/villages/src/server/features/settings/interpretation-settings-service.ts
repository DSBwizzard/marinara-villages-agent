import type { villagesDocuments } from "../../adapters/engine/runtime-host.js";
import type { DocumentSlot, mutateDocument } from "../../adapters/storage/document-store.js";
import { asRecord } from "../../domain/rules/coerce.js";
import { badRequest } from "../../domain/rules/errors.js";
import { coerceInterpretationSettings, type InterpretationSettings } from "../../domain/rules/interpretation-policy.js";

export { coerceInterpretationSettings, type InterpretationSettings } from "../../domain/rules/interpretation-policy.js";

const slot: DocumentSlot<InterpretationSettings> = {
  kind: "settings",
  name: "Interpretation settings",
  description: "Optional Decisions and independent System comparison",
  coerce: coerceInterpretationSettings,
  label: () => "Interpretation settings",
};

export interface InterpretationSettingsPorts {
  VILLAGES_PACKAGE_ID: string;
  villagesDocuments(): Pick<ReturnType<typeof villagesDocuments>, "getById">;
  mutateDocument: typeof mutateDocument;
}

/** Current settings composition owns explicit ports; construction starts no work. */
export function createInterpretationSettings({
  VILLAGES_PACKAGE_ID,
  villagesDocuments,
  mutateDocument,
}: InterpretationSettingsPorts) {
  async function readInterpretationSettings(): Promise<InterpretationSettings> {
    try {
      return coerceInterpretationSettings(
        (await villagesDocuments().getById(VILLAGES_PACKAGE_ID, "villages-interpretation-settings"))?.data,
      );
    } catch {
      return coerceInterpretationSettings(null);
    }
  }
  async function saveInterpretationSettings(body: unknown): Promise<InterpretationSettings> {
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

  return { readInterpretationSettings, saveInterpretationSettings };
}

export type InterpretationSettingsService = ReturnType<typeof createInterpretationSettings>;
