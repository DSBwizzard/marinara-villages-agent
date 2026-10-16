export type SpeechDelivery = "ordinary" | "whisper" | "shout";
export type SpeechPresentation = "main" | "aside";

type SpeechLine = { kind?: string; delivery?: SpeechDelivery; presentation?: SpeechPresentation };

/** Old saved lines retain their original bubble and whisper behavior. */
export function speechDelivery(line: SpeechLine): SpeechDelivery {
  return line.delivery ?? (line.kind === "whisper" ? "whisper" : "ordinary");
}

export function isSceneAside(line: SpeechLine): boolean {
  return line.presentation ? line.presentation === "aside" : line.kind === "side" || line.kind === "whisper";
}
