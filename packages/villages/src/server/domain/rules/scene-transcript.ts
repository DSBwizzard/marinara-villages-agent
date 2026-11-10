import type { VenueLine, VenueScene } from "../models/scene-model.js";
import { immutableMemoryValue, memoryRequire } from "./memory-integrity.js";
import { asRecord, asString, asTrimmedString } from "./coerce.js";
import { readStagingCues } from "../../../shared/helpers/scene-staging.js";

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

/** Scene and retained Episode lines use the same cast-dependent decoder. */
export function readSceneLines(value: unknown, participantIds: ReadonlySet<string>): VenueLine[] {
  return Array.isArray(value)
    ? value
        .map((value) => {
          const canonical = reuseSceneLine(value, participantIds);
          if (canonical) return canonical;
          const row = asRecord(value);
          if (row.kind === "input") {
            memoryRequire(
              row.role === "user" &&
                row.speakerId === "player" &&
                typeof row.inputOf === "string" &&
                row.inputOf.length > 0 &&
                Array.isArray(row.heardBy) &&
                !row.heardBy.length &&
                !row.speechSource &&
                !row.soundOnly &&
                !row.staging &&
                !row.physicalIdsAfter,
              "original input playback cannot grant speech or perception",
            );
            return {
              id: asTrimmedString(row.id),
              inputOf: row.inputOf,
              speakerId: "player",
              name: asString(row.name),
              role: "user" as const,
              kind: "input" as const,
              content: asString(row.content),
              at: asString(row.at),
              heardBy: [],
            };
          }
          return {
            id: asTrimmedString(row.id),
            speakerId: asString(row.speakerId),
            name: asString(row.name),
            role: row.role === "user" ? ("user" as const) : ("assistant" as const),
            content: asString(row.content),
            at: asString(row.at),
            zoneId: asTrimmedString(row.zoneId) || undefined,
            ...(row.viaDoorway === true ? { viaDoorway: true } : {}),
            ...(Array.isArray(row.physicalIdsAfter)
              ? {
                  physicalIdsAfter: [
                    ...new Set(
                      row.physicalIdsAfter.filter(
                        (id): id is string => typeof id === "string" && participantIds.has(id),
                      ),
                    ),
                  ],
                }
              : {}),
            ...(row.contactHidden === true ? { contactHidden: true } : {}),
            ...(row.presenceChange === true ? { presenceChange: true as const } : {}),
            ...(row.attentionEvidence === true ? { attentionEvidence: true } : {}),
            ...(asRecord(row.speechSource).version === 3 && Array.isArray(asRecord(row.speechSource).spans)
              ? { speechSource: structuredClone(row.speechSource) as VenueLine["speechSource"] }
              : {}),
            ...(typeof asRecord(row.soundOnly).text === "string" && Array.isArray(asRecord(row.soundOnly).characterIds)
              ? {
                  soundOnly: {
                    text: asTrimmedString(asRecord(row.soundOnly).text).slice(0, 300),
                    characterIds: (asRecord(row.soundOnly).characterIds as unknown[]).filter(
                      (id): id is string => typeof id === "string",
                    ),
                    player: asRecord(row.soundOnly).player === true,
                  },
                }
              : {}),
            ...(row.contactReport === true ? { contactReport: true } : {}),
            heardBy: Array.isArray(row.heardBy) ? row.heardBy.filter((id): id is string => typeof id === "string") : [],
            ...(row.kind === "narration" || row.kind === "dialogue" || row.kind === "side" || row.kind === "whisper"
              ? { kind: row.kind as VenueLine["kind"] }
              : {}),
            ...(Array.isArray(row.staging) ? { staging: readStagingCues(row.staging, [...participantIds]) } : {}),
            ...(typeof row.targetId === "string" ? { targetId: row.targetId } : {}),
            ...(row.delivery === "ordinary" || row.delivery === "whisper" || row.delivery === "shout"
              ? { delivery: row.delivery as VenueLine["delivery"] }
              : {}),
            ...(row.presentation === "main" || row.presentation === "aside"
              ? { presentation: row.presentation as VenueLine["presentation"] }
              : {}),
            ...(typeof row.asideFor === "string" ? { asideFor: row.asideFor } : {}),
          };
        })
        .filter((line) => line.id && line.content)
    : [];
}
