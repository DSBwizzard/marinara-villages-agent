import { establishPlace as establish } from "../../packages/villages/src/server/domain/rules/place-discovery.js";
import { readNpc } from "../../packages/villages/src/server/domain/rules/places.js";
export { projectPlace } from "../../packages/villages/src/server/domain/rules/place-discovery.js";

/** Fixture people already exist before a Place is established, like the permanent Map cast. */
export function establishPlace(...args: Parameters<typeof establish>) {
  const [state, raw, id, , source, at] = args;
  const draft = structuredClone(raw) as any;
  for (const person of draft.people ?? []) {
    if (person.existingId) continue;
    person.existingId = `npc:${id}:${person.ref}`;
    state.worldPlaces.npcs[person.existingId] ??= readNpc({
      id: person.existingId,
      revision: 1,
      name: person.name,
      label: person.label || person.name,
      characterization: person.characterization,
      appearance: "A familiar local person.",
      facts: person.facts ?? [],
      associations: [{ placeId: id, role: person.role ?? "" }],
      availability: person.availability ?? "",
      source,
      updatedAt: at,
      disabled: false,
    });
  }
  args[1] = draft;
  return establish(...args);
}
