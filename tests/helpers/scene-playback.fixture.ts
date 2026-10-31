import type { ScenePlaybackWindow } from "../../packages/villages/src/shared/contracts/scene-playback.js";
import { groupSceneMoments } from "../../packages/villages/src/shared/helpers/scene-speech.js";
import { villagesWalk } from "../../packages/villages/src/shared/helpers/scene-paragraphs.js";
import {
  advanceStaging,
  createStagingCursor,
  lineStagingCues,
  stagingBoundaries,
  stagingPresentation,
} from "../../packages/villages/src/shared/helpers/scene-staging.js";

// shortcut: This hash identifies synthetic publications; native tests verify cryptographic storage integrity.
const digest = (value: unknown) => {
  let hash = 2166136261;
  for (const char of JSON.stringify(value)) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0;
  return hash.toString(16).padStart(8, "0").repeat(8);
};
const encode = (value: unknown) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(value))))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "");
const decode = (value: string) =>
  JSON.parse(
    new TextDecoder().decode(
      Uint8Array.from(atob(value.replaceAll("-", "+").replaceAll("_", "/")), (char) => char.charCodeAt(0)),
    ),
  );

/** Author the current public protocol from the small full histories owned by browser fixtures. */
export function fixturePlaybackPage(
  scene: any,
  scope: string,
  encodedCursor?: string,
  first = false,
): ScenePlaybackWindow {
  const lines = (scene.lines ?? []).map((line: any, index: number) => ({
    ...line,
    id: line.id || `${scene.id}:fixture:${index}`,
  }));
  const participants = scene.participants ?? [];
  const boundaries = stagingBoundaries(lines, scene.submissions ?? []);
  const firstBoundary = [...boundaries.values()].find((edge) => edge.beforeIds)?.beforeIds;
  const initial = scene.initialActiveIds ?? firstBoundary ?? scene.activeIds ?? [];
  const cursor = createStagingCursor(
    initial,
    participants.map((person: any) => person.characterId),
  );
  let paragraphStart = 0;
  const all = groupSceneMoments<any>(lines).map(({ line, asides }, index) => {
    const source = [line, ...asides],
      edges = source.map((line) => boundaries.get(line.id));
    advanceStaging(cursor, {
      beforeIds: edges.find((edge) => edge?.beforeIds)?.beforeIds,
      cues: lineStagingCues(line),
    });
    const start = stagingPresentation(cursor);
    advanceStaging(cursor, {
      afterIds: edges.find((edge) => edge?.afterIds)?.afterIds,
      cues: asides.flatMap(lineStagingCues),
    });
    const end = stagingPresentation(cursor),
      paragraphs = villagesWalk(line.content, line.beats ?? null).paragraphs.length;
    const moment = {
      id: line.id,
      index,
      paragraphStart,
      paragraphs,
      lineIds: source.map((line) => line.id),
      start,
      end,
    };
    paragraphStart += paragraphs;
    return { ...moment, digest: digest([source, start, end, paragraphs]) };
  });
  const version = digest(all);
  let from = first ? 0 : Math.max(0, all.length - 40),
    to = first ? Math.min(40, all.length) : all.length;
  if (encodedCursor) {
    const anchor = decode(encodedCursor),
      selected = all[anchor.index];
    if (
      anchor.scope !== scope ||
      anchor.sceneId !== scene.id ||
      !selected ||
      anchor.id !== selected.id ||
      anchor.digest !== selected.digest
    )
      throw Error("That reading position changed. Reopen the Scene.");
    const position = anchor.index + (anchor.direction === "newer" ? 1 : 0);
    from = anchor.direction === "older" ? Math.max(0, position - 40) : position;
    to = anchor.direction === "older" ? position : Math.min(all.length, position + 40);
  }
  const at = (direction: string, index: number) =>
    encode({ v: 1, scope, sceneId: scene.id, direction, index, id: all[index].id, digest: all[index].digest });
  const moments = all
    .slice(from, to)
    .map(({ digest: _digest, ...moment }) => ({ ...moment, anchorCursor: at("around", moment.index) }));
  const selectedIds = new Set(moments.flatMap((moment) => moment.lineIds));
  const selectedLines = lines.filter((line: any) => selectedIds.has(line.id));
  const cast = new Set([
    ...moments.flatMap((moment) => [...moment.start.activeIds, ...moment.end.activeIds]),
    ...selectedLines.flatMap((line: any) => [line.speakerId, line.targetId]),
  ]);
  return {
    sceneId: scene.id,
    scope,
    version,
    total: all.length,
    totalParagraphs: paragraphStart,
    moments,
    lines: selectedLines,
    participants: participants.filter((person: any) => cast.has(person.characterId)),
    ...(from > 0 ? { olderCursor: at("older", from) } : {}),
    ...(to > from ? { newerCursor: at("newer", to - 1) } : {}),
  };
}
export function authorSceneView(scene: any, scope: string) {
  const { lines, participants, ...playback } = fixturePlaybackPage(scene, scope);
  const current = new Set([...(scene.activeIds ?? []), ...participants.map((person) => person.characterId)]);
  const { submissions, initialActiveIds: _initial, stagingVersion: _staging, ...authority } = scene;
  const last = submissions?.at(-1);
  return {
    ...authority,
    lines,
    playback,
    participants: (scene.participants ?? []).filter((person: any) => current.has(person.characterId)),
    ...(last ? { latestTurn: { id: last.id, at: last.at ?? "", published: true } } : {}),
  };
}
export function authorSceneResponse(value: any, scope: string) {
  if (!value || typeof value !== "object" || Array.isArray(value) || (!value.session && !value.visit)) return value;
  const response = { ...value };
  for (const key of ["session", "visit"]) if (value[key]) response[key] = authorSceneView(value[key], scope);
  return response;
}
