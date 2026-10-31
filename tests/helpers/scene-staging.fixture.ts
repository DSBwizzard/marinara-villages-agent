import {
  initialStaging,
  type StagingEvent,
  type StagingState,
} from "../../packages/villages/src/shared/helpers/scene-staging.js";

/** Full-frame reference for independent parity checks; production only retains current private staging. */
export function replayStaging(ids: readonly string[], events: readonly StagingEvent[]) {
  let state = initialStaging(ids),
    activeIds = ids;
  const attention = (value: StagingState, present: readonly string[]): StagingState =>
    Object.fromEntries(
      Object.entries(value).map(([id, person]) => [
        id,
        person.look.target === "villager" && !present.includes(person.look.characterId)
          ? { ...person, look: { target: "player" } }
          : person,
      ]),
    );
  return events.map((event) => {
    if (event.beforeIds) {
      activeIds = event.beforeIds;
      state = attention(state, activeIds);
    }
    state = { ...state };
    for (const cue of event.cues ?? []) {
      if (!activeIds.includes(cue.characterId) || !state[cue.characterId]) continue;
      const { characterId, ...fields } = cue;
      state[characterId] = { ...state[characterId], ...fields };
    }
    if (event.afterIds) {
      activeIds = event.afterIds;
      state = attention(state, activeIds);
    }
    return { state, activeIds };
  });
}
