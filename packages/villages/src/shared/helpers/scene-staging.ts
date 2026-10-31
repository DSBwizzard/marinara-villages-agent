import { groupSceneMoments } from "./scene-speech.js";

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

type StagingIndex = { order: Map<string, number>; groups: Record<StagingPosition, number[]> };
function stagingIndex(state: StagingState): StagingIndex {
  const result: StagingIndex = { order: new Map(), groups: { left: [], center: [], right: [] } };
  for (const [index, id] of Object.keys(state).entries()) {
    result.order.set(id, index);
    result.groups[state[id].position].push(index);
  }
  return result;
}
function stageRank(group: readonly number[], ordinal: number) {
  let low = 0,
    high = group.length;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (group[middle] < ordinal) low = middle + 1;
    else high = middle;
  }
  return low;
}

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

export type StagingCursor = {
  state: StagingState;
  activeIds: readonly string[];
  active: Set<string>;
  allowed: Set<string>;
  index: StagingIndex;
  watchers: Map<string, Set<string>>;
  explicit: Set<string>;
  initialSlots: string[];
  firstBefore?: string[];
  seenAttendance: string[];
};
export type StagingPresentation = {
  state: StagingState;
  activeIds: string[];
  desktop: ReturnType<typeof stagingLayout>;
  mobile: ReturnType<typeof mobileSceneLayout>;
};
export type StagingCheckpoint = {
  actors: Array<{ id: string; person?: StagingPerson; explicit: boolean }>;
  activeIds: string[];
  initialSlots: string[];
  firstBefore?: string[];
  seenAttendance: string[];
};

export function stagingCheckpoint(cursor: StagingCursor): StagingCheckpoint {
  return {
    actors: [...cursor.index.order.keys(), ...[...cursor.explicit].filter((id) => !cursor.index.order.has(id))].map(
      (id) => ({
        id,
        ...(Object.hasOwn(cursor.state, id)
          ? { person: { ...cursor.state[id], look: { ...cursor.state[id].look } } }
          : {}),
        explicit: cursor.explicit.has(id),
      }),
    ),
    activeIds: [...cursor.activeIds],
    initialSlots: [...cursor.initialSlots],
    ...(cursor.firstBefore ? { firstBefore: [...cursor.firstBefore] } : {}),
    seenAttendance: [...cursor.seenAttendance],
  };
}

/** Restored actor order keeps departed desktop slots without replaying old prose. */
export function restoreStagingCursor(saved: StagingCheckpoint, cast: readonly string[]): StagingCursor {
  const cursor = createStagingCursor([], cast);
  if (saved.actors.some(({ id }) => !cursor.allowed.has(id))) throw new Error("Uncaptured staging actor");
  const actors = new Set(saved.actors.filter(({ person }) => person).map(({ id }) => id));
  if (
    [...saved.activeIds, ...saved.initialSlots, ...(saved.firstBefore ?? []), ...saved.seenAttendance].some(
      (id) => !actors.has(id),
    )
  )
    throw new Error("Missing staging actor");
  for (const { id, person, explicit } of saved.actors) {
    if (person) {
      cursor.state[id] = { ...person, look: { ...person.look } };
      const ordinal = cursor.index.order.size;
      cursor.index.order.set(id, ordinal);
      cursor.index.groups[person.position].push(ordinal);
    }
    if (explicit) cursor.explicit.add(id);
    if (person?.look.target === "villager") {
      const watchers = cursor.watchers.get(person.look.characterId) ?? new Set<string>();
      watchers.add(id);
      cursor.watchers.set(person.look.characterId, watchers);
    }
  }
  cursor.activeIds = [...saved.activeIds];
  cursor.active = new Set(saved.activeIds);
  cursor.initialSlots = [...saved.initialSlots];
  cursor.firstBefore = saved.firstBefore ? [...saved.firstBefore] : undefined;
  cursor.seenAttendance = [...saved.seenAttendance];
  return cursor;
}

/** One working accumulator; historical moments keep only their visible presentation. */
export function createStagingCursor(initialIds: readonly string[], cast: readonly string[]): StagingCursor {
  const allowed = new Set(cast);
  if (initialIds.some((id) => !allowed.has(id))) throw new Error("Uncaptured initial staging actor");
  const state = Object.assign(Object.create(null) as StagingState, initialStaging(initialIds));
  return {
    state,
    activeIds: [...initialIds],
    active: new Set(initialIds),
    allowed,
    index: stagingIndex(state),
    watchers: new Map(),
    explicit: new Set(),
    initialSlots: Object.keys(state).slice(0, 4),
    seenAttendance: [],
  };
}
function admitStageActors(cursor: StagingCursor, ids: readonly string[]) {
  const added = [...new Set(ids)].filter((id) => cursor.allowed.has(id) && !cursor.index.order.has(id));
  const count = cursor.index.order.size + added.length;
  for (const id of added) {
    const ordinal = cursor.index.order.size;
    const position = count === 3 && ordinal === 1 ? "center" : ordinal < Math.ceil(count / 2) ? "left" : "right";
    cursor.state[id] = { position, expression: "", look: { target: "player" } };
    cursor.index.order.set(id, ordinal);
    cursor.index.groups[position].push(ordinal);
    if (cursor.initialSlots.length < 4) cursor.initialSlots.push(id);
  }
}
function stageAttendance(cursor: StagingCursor, ids: readonly string[], before: boolean) {
  admitStageActors(cursor, ids);
  const known = [...new Set(ids)].filter((id) => Object.hasOwn(cursor.state, id));
  if (before && cursor.firstBefore === undefined) cursor.firstBefore = known.slice(0, 4);
  for (const id of known)
    if (cursor.seenAttendance.length < 4 && !cursor.seenAttendance.includes(id)) cursor.seenAttendance.push(id);
  cursor.activeIds = known;
  cursor.active = new Set(known);
  for (const [target, watchers] of cursor.watchers) {
    if (cursor.active.has(target)) continue;
    for (const id of watchers) cursor.state[id] = { ...cursor.state[id], look: { target: "player" } };
    cursor.watchers.delete(target);
  }
}
/** Cues replace person values, so previously captured visible frames stay immutable. */
export function advanceStaging(cursor: StagingCursor, event: StagingEvent) {
  if (event.beforeIds) stageAttendance(cursor, event.beforeIds, true);
  for (const cue of event.cues ?? []) {
    if (cue.position && cursor.allowed.has(cue.characterId)) cursor.explicit.add(cue.characterId);
    if (!cursor.active.has(cue.characterId) || !Object.hasOwn(cursor.state, cue.characterId)) continue;
    const prior = cursor.state[cue.characterId],
      { characterId, ...fields } = cue;
    const person = { ...prior, ...fields, look: fields.look ? { ...fields.look } : prior.look };
    if (prior.position !== person.position) {
      const ordinal = cursor.index.order.get(characterId)!;
      const before = cursor.index.groups[prior.position],
        after = cursor.index.groups[person.position];
      before.splice(stageRank(before, ordinal), 1);
      after.splice(stageRank(after, ordinal), 0, ordinal);
    }
    if (prior.look.target === "villager") {
      const watchers = cursor.watchers.get(prior.look.characterId);
      watchers?.delete(characterId);
      if (!watchers?.size) cursor.watchers.delete(prior.look.characterId);
    }
    if (person.look.target === "villager") {
      const watchers = cursor.watchers.get(person.look.characterId) ?? new Set<string>();
      watchers.add(characterId);
      cursor.watchers.set(person.look.characterId, watchers);
    }
    cursor.state[characterId] = person;
  }
  if (event.afterIds) stageAttendance(cursor, event.afterIds, false);
}
export function stagingPresentation(cursor: StagingCursor): StagingPresentation {
  const activeIds = cursor.activeIds.filter((id) => Object.hasOwn(cursor.state, id));
  const visible = new Set(activeIds);
  const state = Object.fromEntries(
    activeIds.map((id) => {
      const person = cursor.state[id];
      return [
        id,
        {
          ...person,
          look:
            person.look.target === "villager" && !visible.has(person.look.characterId)
              ? { target: "player" as const }
              : { ...person.look },
        },
      ];
    }),
  );
  const slots =
    cursor.firstBefore === undefined
      ? cursor.initialSlots
      : [...new Set([...cursor.firstBefore, ...cursor.seenAttendance])].slice(0, 4);
  const cues = [...new Set([...slots, ...activeIds])]
    .filter((id) => cursor.explicit.has(id) && Object.hasOwn(cursor.state, id))
    .map((characterId) => ({ characterId, position: cursor.state[characterId].position }));
  return {
    state,
    activeIds: [...activeIds],
    desktop: stagingLayout(activeIds, cursor.state, cursor.index),
    mobile: mobileSceneLayout(activeIds, cursor.state, [{ beforeIds: slots, cues }]),
  };
}

/** Turn boundaries also reconstruct the cast for player lines and departures. */
export function stagingBoundaries(
  lines: readonly { id?: string; role: string; physicalIdsAfter?: string[] }[],
  turns: readonly StagingTurn[],
): Map<string, { beforeIds?: string[]; afterIds?: string[] }> {
  const boundaries = new Map<string, { beforeIds?: string[]; afterIds?: string[] }>();
  for (const line of lines)
    if (line.id && line.physicalIdsAfter) boundaries.set(line.id, { afterIds: line.physicalIdsAfter });
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
  index = stagingIndex(state),
): Record<string, { x: number; width: number; facing: "front" | "left" | "right" }> {
  const zones: StagingPosition[] = ["left", "center", "right"];
  const layout: Record<string, { x: number; width: number; facing: "front" | "left" | "right" }> = Object.create(null);
  for (const id of ids) {
    if (!Object.hasOwn(state, id)) continue;
    const group = index.groups[state[id].position],
      rank = stageRank(group, index.order.get(id)!);
    layout[id] = {
      x: (zones.indexOf(state[id].position) + (rank + 0.5) / group.length) / 3,
      width: Math.min(0.25, 0.9 / (3 * group.length)),
      facing: "front",
    };
  }
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
  return groupSceneMoments(lines).map(({ line, asides }) => {
    const moment = [line, ...asides];
    const edges = moment.map((item) => boundaries.get(item.id));
    return {
      cues: moment.flatMap(lineStagingCues),
      beforeIds: edges.find((edge) => edge?.beforeIds)?.beforeIds,
      afterIds: edges.find((edge) => edge?.afterIds)?.afterIds,
    };
  });
}

/** Mobile projection only. Never write these default groups back to Scene state. */
export function mobileSceneLayout(ids: readonly string[], state: StagingState, events: readonly StagingEvent[]) {
  const explicit = new Set(
    events.flatMap((event) => (event.cues ?? []).filter((cue) => cue.position).map((cue) => cue.characterId)),
  );
  // State includes the whole saved cast, potentially even later arrivals. Start
  // with the first attendance boundary and reserve departed stage slots. Extra
  // residents use the overflow indicator until a stage slot becomes available.
  const initial = events.find((event) => event.beforeIds)?.beforeIds ?? Object.keys(state);
  const order = [
    ...new Set([
      ...initial,
      ...events.flatMap((event) => [...(event.beforeIds ?? []), ...(event.afterIds ?? [])]),
      ...ids,
    ]),
  ].filter((id) => state[id]);
  const all = order.slice(0, 4);
  for (const id of ids) {
    if (all.includes(id) || !state[id]) continue;
    const vacancy = all.findIndex((reserved) => !ids.includes(reserved));
    if (vacancy >= 0) all[vacancy] = id;
  }
  const positions = Object.fromEntries(
    all.map((id, index) => [
      id,
      explicit.has(id)
        ? state[id].position
        : all.length === 1
          ? "center"
          : index < Math.ceil(all.length / 2)
            ? "left"
            : "right",
    ]),
  );
  const result: Record<string, { x: number; depth: number; facing: "front" | "left" | "right" }> = Object.create(null);
  for (const zone of ["left", "center", "right"] as StagingPosition[]) {
    const group = all.filter((id) => positions[id] === zone);
    group.forEach((id, index) => {
      const [from, to] = zone === "left" ? [0.11, 0.26] : zone === "right" ? [0.74, 0.89] : [0.44, 0.56];
      const x =
        group.length === 1
          ? zone === "left"
            ? 0.26
            : zone === "right"
              ? 0.74
              : 0.5
          : from + ((to - from) * index) / (group.length - 1);
      result[id] = { x, depth: group.length > 1 && index % 2 === 1 ? 16 : 0, facing: "front" };
    });
  }
  for (const id of ids) {
    const slot = result[id];
    if (!slot) continue;
    const look = state[id].look;
    if (look.target === "direction") slot.facing = look.direction;
    else if (look.target === "villager" && ids.includes(look.characterId) && result[look.characterId]) {
      const target = result[look.characterId].x;
      slot.facing = target === slot.x ? "front" : target < slot.x ? "left" : "right";
    }
  }
  for (const id of all) if (!ids.includes(id)) delete result[id];
  return result;
}
