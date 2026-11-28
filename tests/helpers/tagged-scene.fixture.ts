import { parseSceneObject } from "../../packages/villages/src/server/domain/rules/scene-json-syntax.js";

/** Retain the same proposals in packaged fixtures when the active prompt asks for tagged text. */
export function sceneFixtureText(messages: { content: string }[], content: string) {
  const direction = messages.at(-1)?.content ?? "";
  if (
    !direction.includes("Put each lasting change on its own tag line.") &&
    !direction.includes("At this entrance, use Narration:")
  )
    return content;
  const raw = parseSceneObject(content) as Record<string, any> | null;
  if (
    !raw ||
    !Array.isArray(raw.segments) ||
    raw.segments.some((row: any) => !row || typeof row.text !== "string") ||
    Object.keys(raw).some((key) => !["segments", "keep", "commands", "visit", "halt"].includes(key))
  )
    return content;
  const index = (id: unknown) =>
    typeof id === "number"
      ? id - 1
      : raw.segments.findIndex((row: any, i: number) => (row.id ?? "segment-" + i) === id);
  const rename = (id: unknown) => {
    const i = index(id);
    return i < 0 ? id : "beat-" + (i + 1);
  };
  const source = (proposal: any) => ({
    ...proposal,
    ...(Array.isArray(proposal.source)
      ? {
          source: proposal.source.map((ref: any) => {
            if (typeof ref === "string") return rename(ref);
            if (!ref || typeof ref !== "object") return ref;
            if (Object.hasOwn(ref, "segment")) return { ...ref, segment: rename(ref.segment) };
            if (ref.ground?.at?.before !== undefined)
              return { ...ref, ground: { ...ref.ground, at: { before: rename(ref.ground.at.before) } } };
            if (ref.ground?.at?.after !== undefined)
              return { ...ref, ground: { ...ref.ground, at: { after: rename(ref.ground.at.after) } } };
            return ref;
          }),
        }
      : {}),
  });
  const notes = Array.isArray(raw.keep) ? raw.keep : [];
  const spokenNotes = new Set();
  const lines = raw.segments.flatMap((line: any, i: number) => {
    const required: string[] = Array.isArray(line.requires) ? line.requires : [];
    const bound = notes.filter((row: any) => required.includes(row.id));
    bound.forEach((row: any) => spokenNotes.add(row));
    const bang = required.some((id) => id !== "remember-fact") ? "!" : "";
    const marking =
      line.kind === "dialogue"
        ? `[${bang}${line.speakerId}]` +
          (line.delivery === "whisper"
            ? ` [whisper ${line.targetId}]`
            : (line.delivery === "shout" ? " [shout]" : "") + (line.targetId ? ` [to ${line.targetId}]` : "")) +
          (line.presentation === "aside" ? " [aside]" : "") +
          (line.offerAppointment ? " [appointment]" : "") +
          (line.speakerLabel ? ` [name ${line.speakerLabel}]` : "") +
          (required.includes("remember-fact") ? " [remember]" : "")
        : "Narration" + bang + (line.actors?.length ? ` [actors ${line.actors.join(" ")}]` : "");
    const commands = (raw.commands ?? []).filter((row: any) => index(row.at) === i);
    if (line.kind === "crossing" || line.kind === "departure")
      commands.push({
        type: line.kind === "crossing" ? "move" : "depart",
        who: line.who,
        to: line.to,
        trespass: line.trespass,
      });
    if (line.follow) commands.push({ type: "move.decide", who: line.speakerId, ...line.follow });
    const cue = Object.fromEntries(
      ["sound", "staging", "expression", "look"].flatMap((key) => (line[key] === undefined ? [] : [[key, line[key]]])),
    );
    return [
      `${marking}: ${line.offerAppointment ? "" : line.text.replace(/\r?\n/gu, " ")}`,
      ...(Object.keys(cue).length ? ["[cue]: " + JSON.stringify(cue)] : []),
      ...commands.map(({ at: _at, ...row }: any) => "[command]: " + JSON.stringify(source(row))),
      ...bound.map((row: any) => "[keep]: " + JSON.stringify(source(row))),
      ...(raw.visit?.segment === i + 1 ? [`[visit]: ${raw.visit.option}${raw.visit.escort ? " escort" : ""}`] : []),
    ];
  });
  if (notes.some((row: any) => !spokenNotes.has(row))) {
    lines.push(
      "--",
      ...notes.filter((row: any) => !spokenNotes.has(row)).map((row: any) => "[keep]: " + JSON.stringify(source(row))),
    );
  }
  if (raw.halt) lines.push("[halt]: " + JSON.stringify(source(raw.halt)));
  return lines.join("\n");
}
