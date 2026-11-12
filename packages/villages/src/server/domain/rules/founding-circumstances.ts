import { FOUNDING_CIRCUMSTANCE_MAX_LENGTH } from "../../../shared/helpers/founding-circumstance.js";
import type { NarrativeSituation } from "../models/narrative-model.js";
import type { VillageVenue, VillageState } from "../models/world.js";
import { badRequest } from "./errors.js";
import { asRecord, asTrimmedString } from "./coerce.js";
import { ensureNarrative } from "./narrative-development.js";
import { retainNativeFact } from "./native-continuity.js";

export function readFoundingCircumstances(value: unknown, venues: VillageVenue[], at: string): NarrativeSituation[] {
  if (!Array.isArray(value) || value.length > 4) throw badRequest("Choose at most four starting circumstances.");
  return value.map((raw, index) => {
    const row = asRecord(raw),
      summary = asTrimmedString(row.summary);
    if (
      !summary ||
      summary.length > FOUNDING_CIRCUMSTANCE_MAX_LENGTH ||
      !["village", "zone"].includes(String(row.scope))
    )
      throw badRequest("Each starting circumstance needs a scope and up to 4000 characters.");
    const venueId = asTrimmedString(row.venueId),
      zoneId = asTrimmedString(row.zoneId);
    if (
      row.scope === "zone" &&
      !venues.find((venue) => venue.id === venueId)?.zones?.some((zone) => zone.id === zoneId)
    )
      throw badRequest("Choose an existing Zone for each Zone-local starting circumstance.");
    return {
      id: `founding:${index}`,
      scope: row.scope as "village" | "zone",
      revision: 1,
      title: `Starting circumstance ${index + 1}`,
      summary,
      status: "active",
      targets: row.scope === "zone" ? [{ venueId, zoneId }] : [],
      updatedAt: at,
    };
  });
}

export function seedFoundingCircumstances(
  state: VillageState,
  situations: NarrativeSituation[],
  knowers: string[],
  at: string,
): void {
  ensureNarrative(state, at).situations = situations;
  for (const situation of situations) {
    retainNativeFact(
      state,
      {
        id: "founding-circumstance:" + situation.id,
        kind: "circumstance",
        targetId: situation.id,
        revision: situation.revision,
        text: situation.summary,
        witnesses: knowers,
      },
      at,
    );
  }
}
