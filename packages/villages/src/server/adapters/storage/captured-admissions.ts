import type { BackgroundKind } from "../../domain/models/background-model.js";
import { readPersonalMailInput } from "../../domain/decoding/mailbox-codec.js";
import { readWorldNarrativeInput } from "../../domain/decoding/narrative-codec.js";
import { readResidentPlanningInput } from "../../domain/rules/resident-planning.js";
import { memoryObject, memoryRequire } from "../../domain/rules/memory-integrity.js";
import { isBackgroundKind } from "../../domain/rules/work-recovery.js";

/** Native captures contain exact fitted data; common history remains owned by the Village head. */
export function readCapturedInput(kind: BackgroundKind, raw: unknown, seed: string): unknown {
  if (kind === "world-development") return readWorldNarrativeInput(raw, seed);
  if (kind === "personal-mail") {
    const value = readPersonalMailInput(raw);
    memoryRequire(value.seed === seed, "personal mail capture belongs to another World");
    return value;
  }
  if (kind === "resident-planning") {
    const value = readResidentPlanningInput(raw);
    memoryRequire(value.context.narration.context.seed === seed, "resident capture belongs to another World");
    return value;
  }
  return structuredClone(raw);
}

/** Releasing a capture cannot release an unfinished paid response or its recovery proof. */
export function assertCapturedJob(raw: unknown): void {
  memoryObject(raw);
  memoryRequire(
    raw.responseStorage === 4 && typeof raw.seed === "string" && isBackgroundKind(raw.kind),
    "unsupported captured background format",
  );
  if (raw.input === null && ["resident-planning", "personal-mail", "world-development"].includes(raw.kind)) {
    memoryRequire(
      ["completed", "obsolete"].includes(raw.status) &&
        Array.isArray(raw.steps) &&
        raw.steps.length === 0 &&
        raw.hasResult === false &&
        raw.result === undefined &&
        !raw.partialResult,
      "unfinished background capture was released",
    );
  } else if (raw.input !== null) readCapturedInput(raw.kind, raw.input, raw.seed);
  if (raw.replacement !== undefined) {
    memoryObject(raw.replacement);
    memoryRequire(
      typeof raw.replacement.seed === "string" && isBackgroundKind(raw.replacement.kind),
      "invalid replacement capture scope",
    );
    readCapturedInput(raw.replacement.kind, raw.replacement.input, raw.replacement.seed);
  }
}
