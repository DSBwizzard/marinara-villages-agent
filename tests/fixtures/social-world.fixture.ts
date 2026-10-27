import { defaultVillageState } from "../../packages/villages/src/server/domain/decoding/village-codec.js";
import type { VillageVillager } from "../../packages/villages/src/server/domain/models/world.js";
import { initializeVenueAccess } from "../../packages/villages/src/server/domain/rules/venue-access.js";
import { venueDraft } from "../../packages/villages/src/server/domain/rules/venue-authoring.js";
export const START = "2026-09-01T12:00:00.000Z";
export const elapsed = (days: number) => new Date(Date.parse(START) + days * 86400000).toISOString();
export function socialWorldFixture() {
  const state = defaultVillageState();
  Object.assign(state, {
    name: "Willowbank",
    seed: "social-world-fixture",
    setupAt: START,
    foundedAt: START,
    simulatedThrough: START,
    timeZone: "UTC",
    setting: "A small riverside village. Homes belong to their listed controllers.",
  });
  const profiles = [
    [
      "a",
      "Ada",
      "A sociable carpenter who wants company and a shorter walk to the workshop. She asks rather than assuming she is welcome.",
    ],
    [
      "b",
      "Bram",
      "A quiet gardener who values privacy. He can offer a spare room but is wary of noise. He considers his own needs independently.",
    ],
    ["c", "Cleo", "A contented teacher with no desire to move. She does not manufacture a crisis to fill time."],
  ];
  state.villagers = profiles.map(
    ([id, name, personality]) =>
      ({
        characterId: id,
        addedAt: START,
        agenda: null,
        remap: null,
        remapFailure: null,
        wishes: [],
        cardSnapshot: {
          id,
          name,
          revision: 1,
          sourceStatus: "available",
          capturedAt: START,
          comment: "",
          summary: personality,
          tags: [],
          systemPrompt: "",
          postHistoryInstructions: "",
          description: personality,
          personality,
          backstory: "A longtime local resident.",
          scenario: "",
          appearance: "Everyday village clothing.",
          exampleDialogue: "",
          nameColor: "",
          dialogueColor: "",
        },
      }) as VillageVillager,
  );
  state.venues = profiles.map(([id, name]) => {
    const v = venueDraft(
      {
        id: `home-${id}`,
        name: `${name}'s home`,
        description: "A simple home.",
        classes: ["residence"],
        residenceCapacity: 2,
      },
      null,
    );
    v.residentIds = [id!];
    v.occupancy.residentCharacterId = id!;
    v.residenceCapacity = 2;
    initializeVenueAccess(v);
    return v;
  });
  return state;
}
