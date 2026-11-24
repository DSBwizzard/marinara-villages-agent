import { newSetupVenue } from "../../packages/villages/src/client/features/founding/FoundingPanels.js";
import { startingZone } from "../../packages/villages/src/client/features/founding/founding-template.js";
import {
  reconcileFoundingHome,
  selectFoundingHomes,
} from "../../packages/villages/src/client/features/founding/founding-homes.js";
import { draftZonePolicy } from "../../packages/villages/src/shared/helpers/founding-zone-policy.js";
import type { SetupVenueDraft } from "../../packages/villages/src/client/shared/types.js";

/** Explicit pre-existing household fixtures, independent of drafting and roster selection. */
export function manualHomesFixture(
  rows: SetupVenueDraft[],
  actors: { id: string; name: string }[],
  _added: string[],
  community: string,
): SetupVenueDraft[] {
  if (rows.length) return selectFoundingHomes(rows, [], actors, community).venues;
  return [
    ...actors.map((actor) => {
      const home = newSetupVenue(`founding-home:${actor.id}`, 0.5, 0.5, actor.id === "player");
      home.name = `${actor.name} home`;
      home.residentIds = actor.id === "player" ? [] : [actor.id];
      const common = {
        ...startingZone(home, false),
        connectedTo: ["exterior", "private:base"],
        access: {
          ...draftZonePolicy(home, {}),
          mode: "permission-required" as const,
          memberRoles: ["residents" as const],
        },
      };
      return reconcileFoundingHome({
        ...home,
        layout: "both",
        spaces: [common],
        privateSpaces: [{ ...startingZone(home, true), connectedTo: ["common:base"] }],
        presentation: { ...home.presentation, x: null, y: null },
      });
    }),
    ...[community, "founding-garden"].map((id, index) => {
      const place = { ...newSetupVenue(id, 0.5, 0.5), category: "public-center" as const };
      place.name = index ? "Shared space" : "Meeting place";
      const zone = { ...startingZone(place, false), connectedTo: ["exterior"] };
      return {
        ...place,
        layout: "common" as const,
        spaces: [zone, { ...zone, id: "common:second", name: "Garden" }],
        privateSpaces: [],
        presentation: { ...place.presentation, x: null, y: null },
      };
    }),
  ];
}
