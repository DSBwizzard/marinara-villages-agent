type SceneHistoryLine = {
  role: "user" | "assistant";
  name: string;
  speakerId: string;
  content: string;
  heardBy: string[];
  kind?: "narration" | "dialogue" | "side" | "whisper";
};

type CandidateLine = { kind: "narration" | "dialogue" | "side" | "whisper"; content: string };

/** Keep the exact archive separate from the compact, role-explicit model history. */
export function venueSceneHistory(lines: readonly SceneHistoryLine[], playerName: string): string {
  const playerIndexes = lines.flatMap((line, index) => (line.role === "user" ? [index] : []));
  const start = playerIndexes.at(-3) ?? 0;
  const recent = lines.slice(start).slice(-18);
  const shown = recent.map((line) => {
    if (line.kind === "narration" || line.speakerId === "__venue_scene__")
      return `SCENE: ${line.content.slice(0, 300)}`;
    const label =
      line.role === "user" ? `PLAYER ${playerName || "the player"}` : `RESIDENT ${line.name} (${line.speakerId})`;
    return `${label}: ${line.content.slice(0, 500)} [heard by: ${line.heardBy.join(", ") || "nobody"}]`;
  });
  const bounded: string[] = [];
  let length = 0;
  for (let index = shown.length - 1; index >= 0; index -= 1) {
    const row = shown[index]!;
    if (length + row.length + 1 > 3_500) break;
    bounded.unshift(row);
    length += row.length + 1;
  }
  return bounded.join("\n");
}

function normalizedWords(text: string): string {
  return text
    .normalize("NFKC")
    .toLocaleLowerCase("en-US")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/gu, " ");
}

function substantial(text: string): boolean {
  return text.length >= 20 && text.split(" ").length >= 4;
}

function playerSpeech(message: string): string[] {
  const quotes = [...message.matchAll(/["“]([^"”]+)["”]/gu)].map((match) => normalizedWords(match[1] ?? ""));
  const whole = normalizedWords(message);
  return [...new Set([whole, ...quotes].filter(substantial))];
}

/** Reject only concrete timing/ownership errors; style remains the model's choice. */
export function venueReplyIntegrity(
  message: string,
  priorLines: readonly SceneHistoryLine[],
  candidate: readonly CandidateLine[],
): "player-echo" | "repeated-question" | null {
  if (!message.trim()) return null;
  const speech = playerSpeech(message);
  if (speech.some((phrase) => candidate.some((line) => normalizedWords(line.content).includes(phrase))))
    return "player-echo";

  const precedingResidentLine = [...priorLines]
    .reverse()
    .find((line) => line.role === "assistant" && line.kind !== "narration");
  const priorQuestion = precedingResidentLine?.content.match(/[^.!?]*\?/gu)?.at(-1);
  const question = normalizedWords(priorQuestion ?? "");
  const answer = normalizedWords(message);
  if (
    question.split(" ").length >= 3 &&
    answer.split(" ").length >= 3 &&
    !answer.includes(question) &&
    candidate.some((line) => line.kind !== "narration" && normalizedWords(line.content).includes(question))
  )
    return "repeated-question";
  return null;
}
