import { narrationWitnesses } from "./narration-sources.js";
import type { VillageState } from "../models/world.js";
import type { NarrationReadset } from "../models/narration-model.js";
import type { ContinuityEvidence } from "../models/continuity-model.js";
import type { AcceptedEpisode } from "../models/episode-model.js";
import { ZonedDate } from "../../../shared/helpers/zoned-date.js";
import { hasVenueClass } from "./venue-model.js";
import { venueZones, zoneClosed } from "./venue-zones.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";
import { requestResidenceMove, decideResidenceMove } from "./residence-move.js";
import { queueVillageVenueRequest } from "./venue-request-state.js";
import { readVenueRequestCore } from "./venue-requests.js";
import { householdIds } from "./residence-agreement.js";

/** Native requests and availability only; remote room contents never enter the prompt. */
export function narrationResidenceContext(state: VillageState, actors: string[]) {
  return {
    homes: state.venues
      .filter((venue) => hasVenueClass(venue, "residence") && venue.constructionStatus !== "worksite")
      .map((venue) => ({
        id: venue.id,
        name: venue.name,
        householdIds: householdIds(venue),
        managerIds: [...(venue.access?.managerIds ?? [])],
        sleepZones: venueZones(venue)
          .filter((zone) => zone.kind === "shared-residence" && !zoneClosed(state, venue, zone))
          .map((zone) => ({ id: zone.id, name: zone.name, kind: zone.kind, managerIds: zone.access?.managerIds })),
        fingerprint: memoryHash([venue, state.residences.filter((move) => move.proposedVenueId === venue.id)]),
      })),
    requests: state.residences
      .filter(
        (move) =>
          move.agreement &&
          ["pending", "moving"].includes(move.status) &&
          (actors.includes(move.characterId) || move.agreement.requiredIds.some((id) => actors.includes(id))),
      )
      .map((move) => ({
        person: move.characterId,
        venue: move.proposedVenueId,
        status: move.status,
        requestId: move.agreement!.requestId,
        scope: move.agreement!.scope,
        requiredIds: [...move.agreement!.requiredIds],
        approvals: { ...move.agreement!.approvals },
        householdIds: [...move.agreement!.householdIds],
        sleepZone: (() => {
          const zone = state.venues
            .find((venue) => venue.id === move.proposedVenueId)
            ?.zones?.find((zone) => zone.id === move.agreement!.sleepZoneId);
          return zone ? { id: zone.id, name: zone.name, kind: zone.kind } : null;
        })(),
        fingerprint: memoryHash(move),
      })),
  };
}
export function narrationResidencePrompt(context: ReturnType<typeof narrationResidenceContext>) {
  return (
    "Native housing requests (not room descriptions or character knowledge): " +
    JSON.stringify({
      homes: context.homes.map(({ id, name, sleepZones, householdIds, managerIds }) => ({
        id,
        name,
        sleepZones,
        householdIds,
        managerIds,
      })),
      requests: context.requests.map(({ person, venue, requiredIds, approvals, status, sleepZone, householdIds }) => ({
        person,
        venue,
        requiredIds,
        approvals,
        status,
        sleepZone,
        householdIds,
      })),
    }) +
    ". A request does not move anyone or approve another person's participation. Each required person decides the exact current request. New conversational requests need one unambiguous shared sleeping Zone; private-room selection stays in the Residence controls."
  );
}
type Request =
  | { type: "residence.request"; by: string; venue: string }
  | { type: "residence.decide"; by: string; person: string; venue: string; approved: boolean }
  | { type: "venue.request"; by: string; name: string; classes: string[] };
export function applyNarrationResidence(
  state: VillageState,
  before: VillageState,
  command: Request,
  readset: NarrationReadset,
  sources: ContinuityEvidence[],
  receiptId: string,
  at: string,
  dependencies: AcceptedEpisode["commandReceipts"],
): AcceptedEpisode["commandReceipts"][number] {
  memoryRequire(
    sources.every((source) => source.perceptions.some((row) => row.channel === "words" && row.actorId !== command.by)),
    "the native request or decision must actually be communicated",
  );
  const now = new ZonedDate(at, readset.calendar.timeZone),
    witnesses = narrationWitnesses(sources);
  if (command.type === "venue.request") {
    memoryRequire(
      sources.every((source) => source.perceptions.some((row) => row.actorId === "player" && row.channel === "words")),
      "a public Venue request needs the Player to hear its complete communication",
    );
    memoryRequire(
      state.villagers.some((actor) => actor.characterId === command.by),
      "only a Villager can submit a native Venue request",
    );
    const core = readVenueRequestCore(command);
    memoryRequire(core, "the Venue request is invalid");
    const decision = queueVillageVenueRequest(
      state,
      core,
      command.by,
      "chat",
      receiptId,
      at,
      sources.map((source) => source.excerpt).join("\n"),
    );
    memoryRequire(decision, "the Venue request cannot be retained or duplicates another native proposal");
    return {
      id: receiptId,
      kind: "venue-request",
      targetId: decision.id,
      revision: 0,
      text:
        command.by +
        " requested " +
        core.name +
        " (" +
        core.classes.join(", ") +
        "). This is not an established Venue or service.",
      witnesses,
    };
  }
  const snapshot = readset.residence,
    current = narrationResidenceContext(
      before,
      readset.source.actors.map((actor) => actor.id),
    );
  if (command.type === "residence.request") {
    const home = snapshot.homes.find((home) => home.id === command.venue);
    memoryRequire(
      home && home.fingerprint === current.homes.find((row) => row.id === home.id)?.fingerprint,
      "the supplied Residence availability changed",
    );
    requestResidenceMove(
      state,
      command.by,
      command.venue,
      command.by === "player" ? "player" : "villager",
      "",
      receiptId,
      now,
    );
  } else {
    let move = snapshot.requests.find((move) => move.person === command.person && move.venue === command.venue);
    if (move)
      memoryRequire(
        move.sleepZone && move.fingerprint === current.requests.find((row) => row.person === move!.person)?.fingerprint,
        "the exact current move request was not supplied",
      );
    else {
      const pending = state.residences.find(
        (row) => row.characterId === command.person && row.proposedVenueId === command.venue,
      );
      const request = dependencies.find(
        (receipt) =>
          receipt.kind === "residence" &&
          receipt.targetId === command.person &&
          receipt.id === pending?.agreement?.requestId &&
          receipt.witnesses.includes(command.by),
      );
      const home = snapshot.homes.find((home) => home.id === command.venue);
      memoryRequire(
        request &&
          pending?.agreement &&
          home &&
          home.fingerprint === current.homes.find((row) => row.id === home.id)?.fingerprint &&
          home.sleepZones.length === 1 &&
          home.sleepZones[0].id === pending.agreement.sleepZoneId,
        "a same-response agreement needs the earlier witnessed request and its supplied exact shared-home terms",
      );
      move = narrationResidenceContext(
        state,
        readset.source.actors.map((actor) => actor.id),
      ).requests.find((move) => move.person === command.person);
    }
    memoryRequire(move, "the exact current move request is unavailable");
    decideResidenceMove(
      state,
      command.person,
      command.approved,
      command.by === "player" ? "player" : "villager",
      command.by,
      move.scope,
      now,
    );
  }
  return {
    id: receiptId,
    kind: "residence",
    targetId: command.type === "residence.request" ? command.by : command.person,
    revision: 0,
    text:
      command.type === "residence.request"
        ? command.by + " requested residence at " + command.venue + "."
        : command.by +
          (command.approved ? " approved " : " refused ") +
          command.person +
          "'s exact move request to " +
          command.venue +
          ".",
    witnesses,
  };
}
