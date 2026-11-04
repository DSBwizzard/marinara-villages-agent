import type { VenueLine, VenueScene } from "../models/scene-model.js";
import { immutableMemoryValue, memoryRequire } from "./memory-integrity.js";
import { asRecord } from "./coerce.js";

const canonical = new WeakMap<object, readonly string[]>();
/** The exact cast-dependent fields normalized by the line decoder. Hearing can include nonparticipants. */
export function sceneTranscriptDependencies(value: unknown): string[] {
  const line = asRecord(value);
  const ids = (Array.isArray(line.physicalIdsAfter) ? line.physicalIdsAfter : []).filter(
    (id): id is string => typeof id === "string",
  );
  for (const value of Array.isArray(line.staging) ? line.staging : []) {
    const cue = asRecord(value),
      look = asRecord(cue.look);
    if (typeof cue.characterId === "string") ids.push(cue.characterId);
    if (look.target === "villager" && typeof look.characterId === "string") ids.push(look.characterId);
  }
  if (typeof line.gazeAt === "string" && line.gazeAt !== "player") ids.push(line.gazeAt);
  return [...new Set(ids)];
}

/** Only lines normalized by the Scene decoder can be shared across native reads. */
export function reuseSceneLine(value: unknown, cast: ReadonlySet<string>): VenueLine | undefined {
  const dependencies = value && typeof value === "object" ? canonical.get(value) : undefined;
  return dependencies?.every((id) => cast.has(id)) ? (value as VenueLine) : undefined;
}
export function isImmutableSceneLine(value: VenueLine) {
  return canonical.has(value);
}
export function freezeSceneTranscript(scene: VenueScene): VenueLine[] {
  return scene.lines.map((line) => {
    const value = immutableMemoryValue(line);
    if (!canonical.has(value)) canonical.set(value, sceneTranscriptDependencies(value));
    return value;
  });
}
export function assertSceneTranscriptCast(scene: VenueScene) {
  const cast = new Set(scene.participants.map((person) => person.characterId));
  memoryRequire(
    scene.lines.every((line) => !isImmutableSceneLine(line) || reuseSceneLine(line, cast)),
    "captured Scene transcript participant identity was removed",
  );
}
