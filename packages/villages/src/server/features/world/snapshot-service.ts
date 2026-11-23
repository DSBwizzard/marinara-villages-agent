import { findLocation, placeRegistry } from "../../domain/rules/places.js";
import { projectAgreementCurrent, renovationHasChanges } from "../../domain/rules/project-terms.js";
import { continuityActor } from "../../domain/rules/continuity-actors.js";
import { hasUnreadMail } from "../../domain/rules/mailbox-view.js";
import { createHash } from "node:crypto";
import { ZonedDate } from "../../../shared/helpers/zoned-date.js";
import { observeVillageClock, villageNow } from "../../adapters/time/clock-gate.js";
import type { VillageSnapshot } from "../../domain/models/world.js";
import { foundingCompletedIds, foundingReadyForPlay } from "../../domain/rules/founding-tasks.js";
import { villageWorldScope } from "../../domain/rules/village-identity.js";
import { startingHistoryReady } from "../../domain/rules/starting-history.js";
import { openingView } from "../../domain/rules/opening-project.js";
import { PROFESSOR_MARI_ID } from "../../domain/rules/visitor-introduction.js";
import { sceneContinuityView } from "../../domain/rules/scene-continuity.js";
import { sceneLayoutVenue } from "../../domain/rules/scene-layout.js";
import { sceneAccessContext } from "../../domain/rules/venue-contact.js";
import { canOccupyZone, resolveVenueZone, zoneClosed } from "../../domain/rules/venue-zones.js";
import { deriveVillageMoment } from "../../domain/rules/village-clock.js";
import { readPlayerIdentity, villagePresence } from "../../domain/rules/village-projections.js";
import { cardCharacters, visitorLodging, visitingCharacter, visitorPosition } from "../../domain/rules/visitors.js";
import { settleTripsForAttendance } from "./visitor-trips.js";
import {
  exactSnapshotTransition,
  isVillageFounded,
  projectVillager,
  villageMomentView,
  villageSettings,
} from "../../domain/rules/world-snapshot.js";

export type VillageSnapshotPorts = {
  readVillageState: typeof import("./village-store.js").readVillageState;
  mutateVillageState: typeof import("./village-store.js").mutateVillageState;
  listVillagerCards: typeof import("../../adapters/engine/catalog.js").listVillagerCards;
  rollActiveAgendas: typeof import("../residents/resident-agendas.js").rollActiveAgendas;
  sceneQueries: () => Pick<ReturnType<typeof import("../scenes/services.js").sceneQueries>, "activeVenueSession">;
  backgroundWorkSummaries: typeof import("../../jobs/background-work.js").backgroundWorkSummaries;
  privatePreparationRooms: typeof import("../../jobs/private-space-preparation.js").privatePreparationRooms;
};

/** Inert snapshot assembly; connections belong to its activation. */
export function createVillageSnapshot({
  readVillageState,
  mutateVillageState,
  listVillagerCards,
  rollActiveAgendas,
  sceneQueries,
  backgroundWorkSummaries,
  privatePreparationRooms,
}: VillageSnapshotPorts) {
  /** The village as the tab draws it: live library labels and adopted card colors. */
  async function buildVillageSnapshot(at?: Date): Promise<VillageSnapshot> {
    let village = await readVillageState({ memories: true });
    const clock = await observeVillageClock();
    let now = at ?? (clock?.instant ? new ZonedDate(clock.instant, clock.timeZone) : villageNow());
    if (clock) now = new ZonedDate(now, clock.timeZone);
    if (await rollActiveAgendas(now, village, clock?.revision)) village = await readVillageState({ memories: true });
    const residentIds = cardCharacters(village).map((villager) => villager.characterId);
    const cards = await listVillagerCards(residentIds);
    const cardsById = new Map(cards.map((card) => [card.id, card]));
    if (
      village.projects.some(
        (project) =>
          project.lifecycle?.affectedIds.some((id) => id.startsWith("npc:")) &&
          !["complete", "cancelled"].includes(project.status),
      )
    )
      village = await readVillageState({ memories: true });
    const minuteOfDay = deriveVillageMoment({
      foundedAt: village.foundedAt,
      environment: village.narrative,
      seed: village.seed,
      timeZone: village.timeZone || undefined,
      now,
    }).minuteOfDay;
    const player = readPlayerIdentity(village);
    const { activeVenueSession } = sceneQueries();
    const residenceAccess = await activeVenueSession();
    if (residenceAccess) village = await readVillageState({ memories: true });
    village = await settleTripsForAttendance(village, now, mutateVillageState);
    const sceneWorld = residenceAccess ? sceneContinuityView(village, residenceAccess) : village;
    const capturedVenue = residenceAccess && findLocation(sceneWorld, residenceAccess.placeId);
    const liveVenue = residenceAccess && findLocation(village, residenceAccess.placeId);
    const sceneLayout = capturedVenue && residenceAccess && sceneLayoutVenue(capturedVenue, residenceAccess);
    const scenePresentation = sceneLayout && {
      ...sceneLayout,
      zones: sceneLayout.zones?.map((zone) => {
        const liveZone = liveVenue && resolveVenueZone(liveVenue, zone.id);
        return liveZone ? { ...zone, name: liveZone.name, observed: liveZone.observed ?? zone.observed } : zone;
      }),
    };
    const presence = villagePresence(village, minuteOfDay, now);
    const villagers = village.villagers.map((villager) => {
      const card = cardsById.get(villager.characterId) ?? null;
      let destination = presence.get(villager.characterId) ?? null;
      const companion = residenceAccess?.accompanying?.find((entry) => entry.characterId === villager.characterId);
      const companionVenue = companion && capturedVenue;
      const companionZone = companionVenue && resolveVenueZone(companionVenue, companion!.zoneId);
      if (residenceAccess?.sceneAttendance) {
        const position = sceneAccessContext(residenceAccess).positions?.[villager.characterId];
        if (position && position !== residenceAccess.zoneId) destination = null;
        else if (position) {
          const sceneVenue = capturedVenue;
          const sceneZone = sceneVenue && resolveVenueZone(sceneVenue, position);
          destination =
            sceneVenue && sceneZone
              ? {
                  id: sceneVenue.id,
                  name: sceneVenue.name,
                  image: sceneZone.image,
                  kind: "venue",
                  zoneId: position,
                  zoneName: sceneZone.name,
                }
              : null;
        }
      }
      if (
        !companionVenue?.access &&
        companionVenue &&
        companionZone &&
        canOccupyZone(companionVenue, companionZone, villager.characterId) &&
        !zoneClosed(sceneWorld, companionVenue, companionZone)
      )
        destination = {
          id: companionVenue.id,
          name: companionVenue.name,
          image: companionVenue.presentation.image,
          kind: "venue",
          zoneId: companionZone.id,
          zoneName: companionZone.name,
        };
      const destinationVenue = destination && village.venues.find((venue) => venue.id === destination.id);
      if (
        destinationVenue?.access &&
        destination &&
        destination.zoneId !== "exterior" &&
        !(
          residenceAccess?.placeId === destinationVenue.id &&
          sceneAccessContext(residenceAccess).positions?.[villager.characterId] === residenceAccess.zoneId
        )
      )
        destination = {
          ...destination,
          zoneId: undefined,
          zoneName: undefined,
          image: destinationVenue.presentation.image,
        };
      return projectVillager(
        villager,
        card?.name ?? null,
        card?.summary ?? "",
        card?.tags ?? [],
        villager.cardSnapshot.nameColor ?? "",
        villager.cardSnapshot.dialogueColor ?? "",
        destination,
      );
    });
    const introductionVisitor =
      residenceAccess?.visitorIntroduction && capturedVenue
        ? village.visitors?.find(
            (person) =>
              person.characterId === residenceAccess.activeIds[0] &&
              person.incarnation ===
                residenceAccess.continuity?.facts.visitors?.find((saved) => saved.characterId === person.characterId)
                  ?.incarnation,
          )
        : undefined;
    const position = introductionVisitor
      ? {
          person: introductionVisitor,
          venueId: residenceAccess!.placeId,
          zoneId: residenceAccess!.zoneId!,
          name: capturedVenue!.name,
          sleeping: false,
        }
      : visitorPosition(village, now, presence);
    const visit = position?.sleeping ? undefined : position;
    const ordinaryVisitor = visitingCharacter(village, now);
    const visiting = introductionVisitor ?? ordinaryVisitor;
    const trip = visiting?.trip;
    const visitors = village.visitors?.map((visitor) => {
      const card = cardsById.get(visitor.characterId);
      const stayingWithPlayer =
        visiting === visitor && trip?.lodging?.hostId === "player" && !!visitorLodging(village, visitor, now);
      const canSeeTrip =
        trip && visiting === visitor && visitor.firstMetAt && (visit?.person === visitor || stayingWithPlayer);
      return {
        ...projectVillager(
          visitor,
          card || visitor.characterId === PROFESSOR_MARI_ID ? visitor.cardSnapshot.name : null,
          "",
          visitor.cardSnapshot.tags,
          visitor.cardSnapshot.nameColor ?? "",
          visitor.cardSnapshot.dialogueColor ?? "",
          null,
        ),
        met: Boolean(visitor.firstMetAt),
        ...(visitor.firstMetAt ? { firstMetAt: visitor.firstMetAt } : {}),
        visitsEnabled: visitor.visitsEnabled,
        ...(canSeeTrip
          ? {
              visit: {
                arrivedAt: trip.arrivedAt,
                leavesAt: trip.leavesAt,
                stayingWithPlayer,
                offerHome: false,
                ...(introductionVisitor === visitor ? { introductory: true as const } : {}),
              },
            }
          : {}),
      };
    });
    const snapshot: VillageSnapshot = {
      worldScope: villageWorldScope(village),
      mailboxUnread: hasUnreadMail(village.mailbox),
      status: "ready",
      clock,
      foundingPreparation: village.foundingPreparation
        ? {
            ...village.foundingPreparation,
            canPlay: foundingReadyForPlay(village) && (!!residenceAccess || startingHistoryReady(village)),
            startingHistoryReady: startingHistoryReady(village),
            completedIds: foundingCompletedIds(village),
            privateSpacesTotal: privatePreparationRooms(village).length,
            privateSpacesReady: privatePreparationRooms(village).filter(
              ({ zone }) => zone.preparation?.status === "ready",
            ).length,
          }
        : null,
      village: villageMomentView(village, now, exactSnapshotTransition(village, now)),
      venueRequests: village.pendingDecisions
        .filter(
          (decision) =>
            decision.kind === "venue" &&
            decision.status !== "approved" &&
            decision.status !== "denied" &&
            decision.status !== "countered" &&
            decision.venueDraft,
        )
        .map(({ requesterIncarnation, ...decision }) => ({
          ...decision,
          requesterCharacterId:
            decision.requesterCharacterId &&
            continuityActor(village, decision.requesterCharacterId)?.incarnation === requesterIncarnation
              ? decision.requesterCharacterId
              : undefined,
        })),
      opening: openingView(village),
      projects: village.projects.map((project) => ({
        ...(project.firstUse
          ? {
              firstUse: {
                goal: project.firstUse.goal,
                ...(project.firstUse.completed ? { completedAt: project.firstUse.completed.at } : {}),
              },
            }
          : {}),
        id: project.id,
        kind: project.kind,
        ...(project.undertaking
          ? {
              undertaking: {
                plan: project.undertaking.plan,
                completed: project.undertaking.completed.map(({ milestoneId, at }) => ({ milestoneId, at })),
              },
            }
          : {}),
        actorNames: Object.fromEntries(
          (project.lifecycle?.affectedIds ?? []).flatMap((id) => {
            const npc = placeRegistry(village)?.npcs[id];
            return npc ? [[id, npc.label || npc.name]] : [];
          }),
        ),
        title: project.title,
        venueId: project.venueId,
        status: project.status,
        progress: project.progress,
        updatedAt: project.updatedAt,
        participantIds: project.participantIds,
        requesterCharacterId:
          project.requesterCharacterId &&
          continuityActor(village, project.requesterCharacterId)?.incarnation === project.requesterIncarnation
            ? project.requesterCharacterId
            : undefined,
        venueDraft: project.venueDraft,
        plan: project.plan,
        opening: project.opening ? { ...project.opening, provenance: "" } : undefined,
        lifecycle: project.lifecycle
          ? {
              designReady:
                project.kind === "new-venue"
                  ? !!project.plan
                  : project.kind === "undertaking"
                    ? true
                    : renovationHasChanges(
                        findLocation(village, project.venueId),
                        project.lifecycle.change,
                        project.lifecycle.changedZoneIds,
                      ),
              phase: project.lifecycle.phase,
              revision: project.lifecycle.revision,
              targetVenueId: project.lifecycle.targetVenueId,
              change: project.lifecycle.change,
              affectedIds: project.lifecycle.affectedIds,
              approvals: project.lifecycle.approvals
                .filter((row) => projectAgreementCurrent(village, row))
                .map(({ residentId, source }) => ({ residentId, source })),
              candidates: project.lifecycle.candidates
                .filter((row) => projectAgreementCurrent(village, row))
                .map(({ residentId }) => ({ residentId })),
              builderId: project.lifecycle.candidates.some(
                (row) => row.residentId === project.lifecycle!.builderId && projectAgreementCurrent(village, row),
              )
                ? project.lifecycle.builderId
                : "",
              workOrder: project.lifecycle.workOrder
                ? {
                    startsAt: project.lifecycle.workOrder.startsAt,
                    completesAt: project.lifecycle.workOrder.completesAt,
                    pausedAt: project.lifecycle.workOrder.pausedAt,
                    remainingMs: project.lifecycle.workOrder.remainingMs,
                    ...(project.lifecycle.workOrder.focus
                      ? {
                          focus: {
                            minutes: 360,
                            nextPeriod:
                              project.lifecycle.workOrder.focus.periods
                                .filter((period) => Date.parse(period.endsAt) > now.getTime())
                                .map(({ startsAt, endsAt }) => ({ startsAt, endsAt }))[0] ?? null,
                          },
                        }
                      : {}),
                  }
                : null,
              blockedReason: project.lifecycle.blockedReason,
              completedAt: project.lifecycle.completedAt,
            }
          : undefined,
      })),
      residences: village.residences,
      villagers,
      ...(visitors?.length ? { visitors } : {}),
      ...(visit
        ? {
            visitorNotice: {
              venueId: visit.venueId,
              venueName: visit.name,
              ...(visit.person.firstMetAt ? { name: visit.person.cardSnapshot.name } : {}),
            },
          }
        : {}),
      isFounded: isVillageFounded(village),
      settings: villageSettings(
        village,
        player,
        residenceAccess,
        residenceAccess ? sceneAccessContext(residenceAccess, undefined, village.timeZone) : undefined,
        now,
      ),
      ...(residenceAccess && scenePresentation
        ? {
            sceneVenue: {
              sceneId: residenceAccess.id,
              venue: villageSettings(
                { ...sceneWorld, venues: [scenePresentation] },
                player,
                residenceAccess,
                sceneAccessContext(residenceAccess, undefined, sceneWorld.timeZone),
                new ZonedDate(
                  residenceAccess.continuity?.capturedAt ?? residenceAccess.startedAt,
                  sceneWorld.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
                ),
                village,
              ).venues.find((venue) => venue.id === scenePresentation.id)!,
            },
          }
        : {}),
      ...(residenceAccess
        ? {
            sceneChanges: {
              sceneId: residenceAccess.id,
              revision: createHash("sha256")
                .update(
                  JSON.stringify([
                    residenceAccess.status,
                    residenceAccess.changeSequence,
                    residenceAccess.submissions.map((turn) => [
                      turn.id,
                      turn.changeSequence,
                      turn.acceptance,
                      turn.episodeId,
                      turn.progressError,
                      turn.recordEvents,
                    ]),
                  ]),
                )
                .digest("hex"),
            },
          }
        : {}),
      backgroundWork: await backgroundWorkSummaries(),
    };
    if (clock && (await observeVillageClock())?.revision !== clock.revision) return buildVillageSnapshot();
    return snapshot;
  }

  return { buildVillageSnapshot };
}
export type VillageSnapshotService = ReturnType<typeof createVillageSnapshot>;
