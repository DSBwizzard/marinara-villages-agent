import { SCENE_TEXT_RESPONSE } from "../../packages/villages/src/server/domain/rules/scene-text-contract.js";

/** Older semantic fixtures remain readable; new requests receive the current provider wire syntax. */
export function sceneTextCompletion(messages: any[], completion: any) {
  if (!messages.some((message) => message.content.includes(SCENE_TEXT_RESPONSE))) return completion;
  let raw: any;
  try {
    raw = JSON.parse(completion.content);
  } catch {
    return completion;
  }
  if (!raw || typeof raw !== "object" || !Object.hasOwn(raw, "input") || !Array.isArray(raw.segments))
    return completion;
  const { input, segments, ...effects } = raw;
  const paragraphs: string[] = [];
  const sounds: any[] = [];
  for (const [index, value] of segments.entries()) {
    if (!value || typeof value !== "object") return completion;
    if (
      Object.keys(value).some(
        (key) => !["kind", "s", "speakerId", "text", "delivery", "targetId", "presentation", "sound"].includes(key),
      ) &&
      !Array.isArray(value)
    )
      return completion;
    const row = Array.isArray(value)
      ? { kind: value[0] === null ? "narration" : "dialogue", speakerId: value[0], text: value[1], ...(value[2] ?? {}) }
      : Object.hasOwn(value, "s")
        ? { ...value, kind: value.s === null ? "narration" : "dialogue", speakerId: value.s }
        : value;
    if (!["narration", "dialogue", "side", "whisper"].includes(row.kind) || typeof row.text !== "string")
      return completion;
    if (row.kind === "narration") {
      paragraphs.push("[narration] " + row.text);
      if (row.sound) sounds.push({ segment: index, ...row.sound });
    } else {
      if (typeof row.speakerId !== "string") return completion;
      const delivery = row.delivery ?? (row.kind === "whisper" ? "whisper" : "ordinary");
      const cue =
        delivery === "whisper"
          ? " whisper:" + row.targetId
          : delivery === "shout"
            ? " call" + (row.targetId ? ":" + row.targetId : "")
            : row.targetId
              ? " to:" + row.targetId
              : row.presentation === "aside" || row.kind === "side"
                ? " aside"
                : "";
      paragraphs.push("[" + row.speakerId + cue + "] " + row.text);
    }
  }
  if (sounds.length) effects.sounds = sounds;
  return {
    ...completion,
    content:
      "INPUT " +
      (typeof input === "string" ? input : JSON.stringify(input)) +
      "\n" +
      paragraphs.join("\n\n") +
      (Object.keys(effects).length ? "\nCHANGES\n" + JSON.stringify(effects) : ""),
  };
}
