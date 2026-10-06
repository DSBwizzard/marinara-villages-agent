import type { StagingEvent, StagingPosition, StagingState } from "../../../shared/helpers/scene-staging.js";

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
  const result: Record<string, { x: number; depth: number; facing: "front" | "left" | "right" }> = {};
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

export function mobileReadingCounter(paragraph: number, paragraphs: number, page: number, pages: number): string {
  return pages > 1
    ? `Page ${page + 1}/${pages} · paragraph ${paragraph + 1}/${Math.max(1, paragraphs)}`
    : `Paragraph ${paragraph + 1}/${Math.max(1, paragraphs)}`;
}
