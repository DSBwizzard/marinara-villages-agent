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

/** Main text and its chatter are one playback moment, including orphaned anchors. */
export function groupSceneMoments<T extends SpeechLine & { id?: string; asideFor?: string }>(lines: readonly T[]) {
  const main = lines.filter((line) => !isSceneAside(line));
  if (!main.length && lines.length) main.push(lines[0]);
  const moments = main.map((line) => ({ line, asides: [] as T[] }));
  const byLine = new Map(moments.map((moment) => [moment.line, moment]));
  const byId = new Map<string, (typeof moments)[number]>();
  for (const moment of moments) if (moment.line.id && !byId.has(moment.line.id)) byId.set(moment.line.id, moment);
  let previous: (typeof moments)[number] | undefined;
  for (const line of lines) {
    const current = byLine.get(line);
    if (current) previous = current;
    else if (isSceneAside(line)) (byId.get(line.asideFor ?? "") ?? previous ?? moments[0])?.asides.push(line);
  }
  return moments;
}
