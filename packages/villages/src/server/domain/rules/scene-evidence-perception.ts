import type { VenueLine } from "../models/scene-model.js";

/** Describe the player's persisted projection, without changing resident witnesses. */
export function sceneEvidencePerception(
  line: Pick<
    VenueLine,
    | "speakerId"
    | "kind"
    | "delivery"
    | "targetId"
    | "contactHidden"
    | "contactReport"
    | "attentionEvidence"
    | "soundOnly"
  > & { role?: VenueLine["role"] },
) {
  const ownSpeech =
    line.role === "user" &&
    line.attentionEvidence === true &&
    (!line.speakerId || line.speakerId === "player") &&
    ["dialogue", "side", "whisper"].includes(String(line.kind));
  const whisper = line.kind === "whisper" || line.delivery === "whisper";
  if (
    !line.contactReport &&
    (ownSpeech || (!line.contactHidden && !line.attentionEvidence && (!whisper || line.targetId === "player")))
  )
    return { playerPerception: "full" as const };
  if (!line.contactReport && line.soundOnly?.player)
    return { playerPerception: "sound-only" as const, playerSound: line.soundOnly.text };
  return { playerPerception: "none" as const };
}
