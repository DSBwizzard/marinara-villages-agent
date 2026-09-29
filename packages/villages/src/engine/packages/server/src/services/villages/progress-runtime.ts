import { ingestProgressEvent, type ProgressEvidence, type ProgressRegistry } from "./progress-engine.js";
import type { VillageState } from "./types.js";
import { ingestProjectProgressEvent } from "./project-progress.js";

/** Dispatch only durable, typed events. A transcript's prose is context, never a completion verdict. */
export function ingestSavedProgressEvent(state: VillageState, evidence: ProgressEvidence): void {
  if (state.progressEngineVersion !== 1) return;
  const registry: ProgressRegistry<VillageState> = {
    verifiers: {
      "core.saved-event": (route, event) => {
        if (event.kind !== "saved-resident-line" && event.kind !== "saved-venue-action")
          return { status: "rejected", reason: "This is not a saved gameplay event." };
        if (!event.venueId || !route.params.venueId)
          return { status: "unavailable", reason: "A saved-event route must name a Venue." };
        if (event.kind === "saved-resident-line" && (!event.lineId || !event.speakerId || !route.params.speakerId))
          return { status: "unavailable", reason: "A saved resident line needs its line ID and a named actor." };
        if (route.params.speakerId && route.params.speakerId !== event.speakerId)
          return { status: "rejected", reason: "The saved event has the wrong actor." };
        if (route.params.venueId && route.params.venueId !== event.venueId)
          return { status: "rejected", reason: "The saved event happened elsewhere." };
        if (route.params.after && Date.parse(event.at) < Date.parse(String(route.params.after)))
          return { status: "rejected", reason: "The saved event predates this requirement." };
        return { status: "accepted" };
      },
    },
    resolvers: { "progress.noop": () => undefined },
  };
  ingestProgressEvent(
    state.progressTasks.filter((task) => task.definition.owner.kind !== "project"),
    evidence,
    state,
    registry,
  );
  for (const project of state.projects) ingestProjectProgressEvent(state, project, evidence);
}
