/** Presentation-only cues shared by the Villages server and scene renderer. */
export type StagingLook =
  | { target: "player" }
  | { target: "villager"; characterId: string }
  | { target: "direction"; direction: "left" | "right" };
export type StagingPosition = "left" | "center" | "right";
export type StagingCue = { characterId: string; position?: StagingPosition; expression?: string; look?: StagingLook };
export type StagingPerson = { position: StagingPosition; expression: string; look: StagingLook };
export type StagingState = Record<string, StagingPerson>;
export type StagingLine = {
  speakerId: string;
  kind?: string;
  expression?: string;
  gazeAt?: string;
  targetId?: string;
  staging?: StagingCue[];
};
export type StagingTurn = { activeIdsAtTurn?: string[]; activeIdsAfterTurn?: string[]; replyLineIds?: string[] };
export type StagingEvent = { cues?: StagingCue[]; beforeIds?: readonly string[]; afterIds?: readonly string[] };

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

/** Invalid optional fields never invalidate speech or remove other valid fields. */
export function readStagingCues(
  value: unknown,
  activeIds: readonly string[],
  expressionId: (characterId: string, requested: string) => string = (_id, requested) => requested,
): StagingCue[] {
  if (!Array.isArray(value)) return [];
  const allowed = new Set(activeIds);
  const cues = new Map<string, StagingCue>();
  for (const item of value.slice(0, 16)) {
    const raw = record(item);
    if (typeof raw.characterId !== "string" || !allowed.has(raw.characterId)) continue;
    const cue: StagingCue = { characterId: raw.characterId };
    if (raw.position === "left" || raw.position === "center" || raw.position === "right") cue.position = raw.position;
    if (typeof raw.expression === "string" && raw.expression.trim().length <= 40) {
      const expression = expressionId(cue.characterId, raw.expression.trim().toLowerCase());
      if (expression) cue.expression = expression;
    }
    const look = record(raw.look);
    if (look.target === "player") cue.look = { target: "player" };
    else if (look.target === "direction" && (look.direction === "left" || look.direction === "right"))
      cue.look = { target: "direction", direction: look.direction };
    else if (
      look.target === "villager" &&
      typeof look.characterId === "string" &&
      allowed.has(look.characterId) &&
      look.characterId !== cue.characterId
    )
      cue.look = { target: "villager", characterId: look.characterId };
    if (cue.position || cue.expression || cue.look) cues.set(cue.characterId, { ...cues.get(cue.characterId), ...cue });
  }
  return [...cues.values()];
}

export function initialStaging(ids: readonly string[]): StagingState {
  return Object.fromEntries(
    ids.map((id, index) => [
      id,
      {
        position: ids.length === 3 && index === 1 ? "center" : index < Math.ceil(ids.length / 2) ? "left" : "right",
        expression: "",
        look: { target: "player" },
      } satisfies StagingPerson,
    ]),
  );
}

/** Explicit cue fields win; older speaker fields fill only omitted fields. */
export function lineStagingCues(line: StagingLine): StagingCue[] {
  const cues = (line.staging ?? []).map((cue) => ({ ...cue }));
  if (!line.speakerId || line.kind === "narration" || line.speakerId === "__venue_scene__") return cues;
  const speaker = cues.find((cue) => cue.characterId === line.speakerId) ?? { characterId: line.speakerId };
  if (!speaker.expression && line.expression) speaker.expression = line.expression;
  const gazeAt = line.gazeAt || (line.kind === "whisper" ? line.targetId : undefined);
  if (!speaker.look && gazeAt)
    speaker.look = gazeAt === "player" ? { target: "player" } : { target: "villager", characterId: gazeAt };
  if (!cues.includes(speaker) && (speaker.expression || speaker.look)) cues.push(speaker);
  return cues;
}

function retainAttention(state: StagingState, ids: readonly string[]): StagingState {
  return Object.fromEntries(
    Object.entries(state).map(([id, person]) => [
      id,
      person.look.target === "villager" && !ids.includes(person.look.characterId)
        ? { ...person, look: { target: "player" } }
        : person,
    ]),
  );
}

/** Replay from the initial cast, never from the currently displayed frame. */
export function replayStaging(
  ids: readonly string[],
  events: readonly StagingEvent[],
): Array<{ state: StagingState; activeIds: readonly string[] }> {
  let state = initialStaging(ids);
  let activeIds: readonly string[] = ids;
  return events.map((event) => {
    if (event.beforeIds) {
      activeIds = event.beforeIds;
      state = retainAttention(state, activeIds);
    }
    state = { ...state };
    for (const cue of event.cues ?? []) {
      if (!activeIds.includes(cue.characterId) || !state[cue.characterId]) continue;
      const { characterId, ...fields } = cue;
      state[characterId] = { ...state[characterId], ...fields };
    }
    if (event.afterIds) {
      activeIds = event.afterIds;
      state = retainAttention(state, activeIds);
    }
    return { state, activeIds };
  });
}

/** Turn boundaries also reconstruct the cast for player lines and departures. */
export function stagingBoundaries(
  lines: readonly { id?: string; role: string }[],
  turns: readonly StagingTurn[],
): Map<string, { beforeIds?: string[]; afterIds?: string[] }> {
  const boundaries = new Map<string, { beforeIds?: string[]; afterIds?: string[] }>();
  const indexes = new Map(lines.flatMap((line, index) => (line.id ? [[line.id, index] as const] : [])));
  for (const turn of turns) {
    const replyIds = (turn.replyLineIds ?? []).filter((id) => indexes.has(id));
    if (!replyIds.length) continue;
    const first = replyIds[0];
    const last = replyIds.at(-1)!;
    let start = indexes.get(first)!;
    if (start > 0 && lines[start - 1].role === "user") start -= 1;
    const startId = lines[start].id;
    if (startId && turn.activeIdsAtTurn)
      boundaries.set(startId, { ...boundaries.get(startId), beforeIds: turn.activeIdsAtTurn });
    if (turn.activeIdsAfterTurn) boundaries.set(last, { ...boundaries.get(last), afterIds: turn.activeIdsAfterTurn });
  }
  return boundaries;
}

export function stagingLayout(
  ids: readonly string[],
  state: StagingState,
): Record<string, { x: number; width: number; facing: "front" | "left" | "right" }> {
  const zones: StagingPosition[] = ["left", "center", "right"];
  const layout: Record<string, { x: number; width: number; facing: "front" | "left" | "right" }> = {};
  zones.forEach((zone, zoneIndex) => {
    // Keep departed residents’ slots reserved so survivors do not jump sideways.
    const group = Object.keys(state).filter((id) => state[id]?.position === zone);
    group.forEach((id, index) => {
      layout[id] = {
        x: (zoneIndex + (index + 0.5) / group.length) / 3,
        width: Math.min(0.25, 0.9 / (3 * group.length)),
        facing: "front",
      };
    });
  });
  for (const id of Object.keys(layout)) if (!ids.includes(id)) delete layout[id];
  for (const id of ids) {
    const slot = layout[id];
    if (!slot) continue;
    const look = state[id].look;
    if (look.target === "direction") slot.facing = look.direction;
    else if (look.target === "villager" && layout[look.characterId]) {
      const targetX = layout[look.characterId].x;
      slot.facing = targetX === slot.x ? "front" : targetX < slot.x ? "left" : "right";
    }
  }
  return layout;
}

/** A segment and its attached chatter form the same moment in prompts and playback. */
export function stagingTranscriptEvents(
  lines: readonly (StagingLine & { id: string; role: string; asideFor?: string })[],
  turns: readonly StagingTurn[],
): StagingEvent[] {
  const boundaries = stagingBoundaries(lines, turns);
  const attached = new Map<string, (typeof lines)[number][]>();
  for (const line of lines)
    if (line.asideFor && (line.kind === "side" || line.kind === "whisper"))
      attached.set(line.asideFor, [...(attached.get(line.asideFor) ?? []), line]);
  return lines
    .filter((line) => line.kind !== "side" && line.kind !== "whisper")
    .map((line) => {
      const moment = [line, ...(attached.get(line.id) ?? [])];
      const edges = moment.map((item) => boundaries.get(item.id));
      return {
        cues: moment.flatMap(lineStagingCues),
        beforeIds: edges.find((edge) => edge?.beforeIds)?.beforeIds,
        afterIds: edges.find((edge) => edge?.afterIds)?.afterIds,
      };
    });
}
