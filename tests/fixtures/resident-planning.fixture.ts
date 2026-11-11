import { readEffectiveVillagerCard } from "../../packages/villages/src/server/adapters/engine/catalog.js";
import type { VillageState } from "../../packages/villages/src/server/domain/models/world.js";
import { villageCurrentSetting } from "../../packages/villages/src/server/domain/rules/prompt-preset.js";
import { captureResidentNarration } from "../../packages/villages/src/server/domain/rules/resident-narration.js";
import {
  localDateKey,
  type ResidentPlanningInput,
} from "../../packages/villages/src/server/domain/rules/resident-planning.js";
import { venueCardProfile } from "../../packages/villages/src/server/domain/rules/venue-writing.js";
import { deriveVillageMoment } from "../../packages/villages/src/server/domain/rules/village-clock.js";
import { ZonedDate } from "../../packages/villages/src/shared/helpers/zoned-date.js";

export function residentPlanningInput(
  state: VillageState,
  characterId: string,
  at: string,
  opportunityId: string,
  catchup?: ResidentPlanningInput["catchup"],
): ResidentPlanningInput {
  const now = new ZonedDate(at, state.timeZone || "UTC"),
    moment = deriveVillageMoment({
      foundedAt: state.foundedAt,
      environment: state.narrative,
      seed: state.seed,
      timeZone: state.timeZone || "UTC",
      now,
    }),
    card = readEffectiveVillagerCard(state.villagers.find((resident) => resident.characterId === characterId)!);
  return {
    format: 1,
    dateKey: localDateKey(now),
    ...(catchup ? { catchup } : {}),
    context: {
      format: 1,
      ...(catchup ? { catchup: true as const } : {}),
      village: state.name,
      setting: villageCurrentSetting(state),
      moment,
      residents: [{ characterId, name: card.name, profile: venueCardProfile(card) }],
      housing: [],
      plans: [],
      narration: captureResidentNarration(
        state,
        {
          id: opportunityId,
          kind: "routine",
          actorIds: [characterId],
          venueId: "",
          startsAt: at,
          endsAt: at,
          facts: ["A quiet morning"],
        },
        !!catchup,
      ),
    },
  };
}
