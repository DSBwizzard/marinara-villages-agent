import type { VillageState } from "../models/world.js";
import { foundingTaskRevision } from "./founding-tasks.js";
import { agendaRevision } from "./agenda-revision.js";
import { foundingIdentity } from "./founding-requests.js";
import { villageFoundingSetting, remapVenues } from "./prompt-preset.js";
export function proposalSourceCompatible(
  job: { input: unknown; revision?: string },
  state: VillageState,
  id: string,
): boolean {
  const context = (job.input as any)?.context;
  if (!context?.card || !Array.isArray(context.venues)) return false;
  if (
    context.circumstances &&
    JSON.stringify(context.circumstances) !==
      JSON.stringify({ worldFacts: state.worldFacts, details: state.foundingDetails, imprint: state.scenarioImprint })
  )
    return false;
  if (context.sourceRevision) return context.sourceRevision === foundingTaskRevision(state, id, "routine");
  const resident = state.villagers.find((row) => row.characterId === id),
    home = state.venues.find((venue) => venue.occupancy.residentCharacterId === id);
  const homeText = home ? [home.name, home.form, home.state.condition].filter(Boolean).join("; ") : "";
  const facts = (venues: typeof state.venues) =>
    venues.map((venue) => [venue.id, venue.state?.condition, venue.state?.publicFacts?.slice(0, 2)]);
  return (
    !!resident &&
    job.revision === agendaRevision(state, id) &&
    context.setting === villageFoundingSetting(state) &&
    context.home === homeText &&
    JSON.stringify(foundingIdentity(context.card)) ===
      JSON.stringify(foundingIdentity({ ...resident.cardSnapshot, admission: resident.admission })) &&
    JSON.stringify(facts(context.venues)) === JSON.stringify(facts(remapVenues(state.venues))) &&
    (!context.circumstances ||
      JSON.stringify(context.circumstances) ===
        JSON.stringify({
          worldFacts: state.worldFacts,
          details: state.foundingDetails,
          imprint: state.scenarioImprint,
        }))
  );
}
