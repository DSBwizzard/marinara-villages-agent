import type { ScenePlaybackWindow } from "../../../shared/contracts/scene-playback.js";
import type { RoomLine } from "../../../shared/contracts/village.js";
import { speechDelivery } from "../../../shared/helpers/scene-speech.js";
import { createStagingCursor, stagingPresentation } from "../../../shared/helpers/scene-staging.js";
import type { RoomStep } from "../../shared/types.js";
import { villagesWalk } from "../../../shared/helpers/scene-paragraphs.js";

/** Build only this window; historical presentation never depends on a preceding browser page. */
export function scenePlaybackSteps(window: ScenePlaybackWindow, playerName: string, activeIds: string[]): RoomStep[] {
  const lines = new Map(window.lines.map((line) => [line.id, line]));
  const names = new Map(window.participants.map((person) => [person.characterId, person.name]));
  const covered = new Set<string>();
  const built: RoomStep[] = [];
  const append = (
    line: RoomLine,
    asideLines: RoomLine[],
    moment: Pick<ScenePlaybackWindow["moments"][number], "start" | "end" | "index" | "paragraphStart"> & {
      anchorCursor?: string;
    },
  ) => {
    if (!line.id) throw Error("The reading position is missing. Reopen the Scene.");
    if (line.presenceChange) return;
    const asides: RoomStep["asides"] = asideLines.map((line) => ({
      register: speechDelivery(line) === "ordinary" ? "side" : (speechDelivery(line) as "whisper" | "shout"),
      text: line.content,
      ...(line.targetId
        ? { target: line.targetId === "player" ? playerName : (names.get(line.targetId) ?? line.targetId) }
        : {}),
      speakerId: line.speakerId,
      name: line.name,
      expression: line.expression,
      gazeAt: line.gazeAt,
    }));
    const player = line.speakerId.length === 0;
    const walk = villagesWalk(line.content, line.beats ?? null);
    walk.paragraphs.forEach((text, paragraph) => {
      const last = paragraph === walk.paragraphs.length - 1;
      built.push({
        key: JSON.stringify([window.scope, window.sceneId, line.id, paragraph]),
        lineId: line.id!,
        paragraph,
        paragraphIndex: moment.paragraphStart + paragraph,
        momentIndex: moment.index,
        anchorCursor: moment.anchorCursor,
        presentation: last ? moment.end : moment.start,
        speakerId: player ? "" : line.speakerId,
        name: player ? playerName : line.name,
        player,
        text,
        delivery: speechDelivery(line),
        asides: [...(walk.asides[paragraph] ?? []), ...(last ? asides : [])],
        ...(line.kind ? { register: line.kind === "narration" ? "narration" : "speech" } : {}),
        ...(line.expression ? { expression: line.expression } : {}),
        ...(line.gazeAt ? { gazeAt: line.gazeAt } : {}),
        ...(line.viaDoorway ? { viaDoorway: true } : {}),
        ...(line.remoteDelivery ? { remoteDelivery: line.remoteDelivery } : {}),
      });
    });
  };
  for (const moment of window.moments) {
    const source = moment.lineIds.map((id) => {
      const line = lines.get(id);
      if (!line || covered.has(id)) throw Error("The reading position changed. Reopen the Scene.");
      covered.add(id);
      return line;
    });
    if (source[0]?.id !== moment.id) throw Error("The reading position changed. Reopen the Scene.");
    append(source[0], source.slice(1), moment);
  }
  for (const line of window.lines) {
    if (line.id && covered.has(line.id)) continue;
    if (!line.id?.startsWith("optimistic:") || line.role !== "user")
      throw Error("The Scene reading is incomplete. Reopen the Scene.");
    const frame = window.moments.at(-1)?.end ?? stagingPresentation(createStagingCursor(activeIds, activeIds));
    append(line, [], { start: frame, end: frame, index: window.total, paragraphStart: window.totalParagraphs });
  }
  return built;
}
