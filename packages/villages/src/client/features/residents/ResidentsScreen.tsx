import { PersonArrangements } from "../venues/PersonArrangements.js";
import type { VillageSnapshot } from "../../../shared/contracts/village.js";
import { request } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { IdentityDescriptionEditor } from "./IdentityDescriptionEditor.js";
import { VillagerMemoriesPanel } from "./MemoriesPanel.js";
import { AvatarFace } from "./ResidentPanels.js";
import type { ResidentsScreenController } from "./screen-contracts.js";
import { type DossierLink, type DossierVenue, VillagerDossier } from "./villages-dossier.js";
import { Appearance } from "./Appearance.js";
import { useVillageMutationLifetime } from "../../shared/mutation-lifetime.js";
import { useContext } from "react";
import { DeskLeaveGuard } from "../../shared/DeskWorkspace.js";
import { VillagerWishJournal } from "./villages-wish-journal.js";
import { VisitorProfileControls } from "./VisitorControls.js";
import { visitorFirstMetLabel, visitorVisitLabel } from "./calculations.js";
import { VillageIcon } from "../../shared/VillageIcon.js";

export function ResidentsScreen({
  controller,
  onDirectory,
}: {
  controller: ResidentsScreenController;
  onDirectory?: () => Promise<boolean>;
}) {
  const navigationLifetime = useVillageMutationLifetime(controller.snapshot?.isFounded);
  const documentGuard = useContext(DeskLeaveGuard);
  const canLeaveDocument = async () => !documentGuard?.guard.current || (await documentGuard.guard.current());
  const {
    element,
    agendas,
    applyVillagerRefresh,
    busy,
    error,
    explorationReturnTab,
    forgetMemory,
    loadMemoryLibrary,
    memoryLibrary,
    openMenu,
    openVenue,
    personProfile,
    portraits,
    previewVillagerRefresh,
    refreshBusyId,
    refreshPreviews,
    rewriteAgenda,
    screen,
    setFocusedProjectId,
    setFocusedRequestId,
    setHousingVenueId,
    setProfileInspection,
    setSiteProjectId,
    setSnapshot,
    setSpriteManagerId,
    snapshot,
    spriteLeaveGuard,
    spriteManagerId,
    spriteProfileScroll,
  } = controller;

  // ── Viewing a place ────────────────────────────────────────────────────────
  // The screen the map leads to, and the only screen in this tab that asks the
  // model for nothing at all.
  //
  // Everything on it is read off what the village already holds: the place's own
  // record, what kind of building stands there, who the hour has put in it, and
  // the village's own clock and weather. A room described by a call the player
  // pays for would be a room whose description can fail, can arrive in a voice the
  // player never chose, and can disagree with the map they just walked off — and
  // there is nothing here that is not already known. So the look-around is
  // RENDERED. It is the same promise the places list already makes about pictures:
  // nothing in this village happens because the player looked at it.
  if (screen === "person" && personProfile) {
    if (personProfile.actorId.startsWith("npc:")) return null;
    const visitor = snapshot?.visitors?.find((entry) => entry.characterId === personProfile.actorId);
    const person = visitor ?? snapshot?.villagers.find((entry) => entry.characterId === personProfile.actorId);
    const selectedAgendas = (agendas ?? []).filter((entry) => entry.characterId === personProfile.actorId);
    const relevantVenues: DossierVenue[] = (snapshot?.settings.venues ?? []).map((venue) => {
      const connections: string[] = [];
      const home = (venue.residentIds ?? [venue.occupancy.residentCharacterId]).includes(personProfile.actorId);
      const work = venue.workerIds?.includes(personProfile.actorId) ?? false;
      const publicConnections = [...(home ? ["Home"] : []), ...(work ? ["Work"] : [])];
      connections.push(...publicConnections);
      const controlled = venue.zones?.some(
        (zone) => zone.ownerId === personProfile.actorId || zone.controllerIds?.includes(personProfile.actorId),
      );
      if (controlled) connections.push("Owns or controls a space");
      if (venue.id === person?.place?.id) connections.push("Current location");
      return {
        id: venue.id,
        name: venue.name,
        image: venue.presentation.image?.url,
        connections,
        publicConnections,
      };
    });
    const relatedLinks: DossierLink[] = [];
    relatedLinks.push(
      {
        id: "projects-all",
        title: "Projects",
        detail: "Open Projects",
        playerVisible: true,
        onOpen: async () => {
          if (await canLeaveDocument()) await openMenu("projects");
        },
      },
      {
        id: "requests-all",
        title: "Venue Requests",
        detail: "Open Venue Requests",
        playerVisible: true,
        onOpen: async () => {
          if (!(await canLeaveDocument())) return;
          setHousingVenueId("");
          await openMenu("venueRequests");
        },
      },
    );
    for (const project of snapshot?.projects ?? []) {
      const flow = project.lifecycle;
      if (
        project.requesterCharacterId !== personProfile.actorId &&
        !project.participantIds?.includes(personProfile.actorId) &&
        flow?.builderId !== personProfile.actorId &&
        !flow?.affectedIds?.includes(personProfile.actorId) &&
        !flow?.approvals?.some((entry) => entry.residentId === personProfile.actorId)
      )
        continue;
      relatedLinks.push({
        id: "project:" + project.id,
        title: project.title,
        detail: "Project · " + project.status,
        onOpen: async () => {
          if (!(await canLeaveDocument())) return;
          await openMenu("projects");
          if (!navigationLifetime.isCurrent()) return;
          setFocusedProjectId(project.id);
          setSiteProjectId(project.id);
        },
      });
    }
    for (const proposal of snapshot?.venueRequests ?? []) {
      if (proposal.requesterCharacterId !== personProfile.actorId) continue;
      relatedLinks.push({
        id: "request:" + proposal.id,
        title: proposal.venueDraft.name,
        detail: "Venue Request",
        onOpen: async () => {
          if (!(await canLeaveDocument())) return;
          await openMenu("venueRequests");
          if (!navigationLifetime.isCurrent()) return;
          setFocusedRequestId("request:" + proposal.id);
        },
      });
    }
    for (const residence of snapshot?.residences ?? []) {
      if (
        residence.characterId !== personProfile.actorId ||
        residence.status !== "pending" ||
        residence.requestedBy !== "villager"
      )
        continue;
      relatedLinks.push({
        id: "residence:" + residence.characterId,
        title: "Residence request",
        detail: "Pending Venue Request",
        onOpen: async () => {
          if (!(await canLeaveDocument())) return;
          await openMenu("venueRequests");
          if (!navigationLifetime.isCurrent()) return;
          setFocusedRequestId("residence:" + residence.characterId);
        },
      });
    }
    const wishInspection = (
      <VillagerWishJournal request={request} characterId={personProfile.actorId} prefix={ELEMENT_TAG} inspect />
    );
    const agendaStatus = selectedAgendas[0]?.agenda;
    const agendaJob = snapshot?.backgroundWork?.find(
      ({ kind, subjectId }) => kind === "agenda" && subjectId === personProfile.actorId,
    );
    const agendaFailure =
      agendaJob && ["failed", "paused", "interrupted"].includes(agendaJob.status)
        ? agendaJob.error
        : agendaStatus?.personalizationFailure;
    const preparingAgenda =
      (agendaJob && ["queued", "running"].includes(agendaJob.status)) || agendaStatus?.personalizationPending;
    const agendaInspection = (
      <div className={`${ELEMENT_TAG}-agenda-actions`}>
        {agendaFailure ? (
          <p role="status">{agendaFailure}</p>
        ) : preparingAgenda ? (
          <p role="status">Preparing Agenda…</p>
        ) : null}
        <button
          type="button"
          className={`${ELEMENT_TAG}-button`}
          disabled={busy || (preparingAgenda && !agendaFailure)}
          onClick={() => void rewriteAgenda(personProfile.actorId)}
        >
          {agendaFailure ? "Retry Agenda" : "Regenerate Agenda"}
        </button>
      </div>
    );
    return (
      <>
        <VillagerDossier
          onDirectory={onDirectory}
          key={`${snapshot?.worldScope}:${personProfile.actorId}`}
          navigation={personProfile}
          villageDate={snapshot?.village.dateLabel}
          villager={person}
          visitor={visitor}
          visitorStatus={visitor ? visitorVisitLabel(visitor, snapshot?.clock?.timeZone) : undefined}
          firstMetLabel={
            visitor
              ? visitorFirstMetLabel(visitor.firstMetAt, snapshot?.clock?.instant, snapshot?.clock?.timeZone)
              : undefined
          }
          visitorActions={
            visitor?.met ? (
              <>
                {visitor.visit && snapshot?.visitorNotice ? (
                  <button
                    type="button"
                    onClick={async () => {
                      if (!(await canLeaveDocument())) return;
                      const venue = snapshot.settings.venues.find(
                        (entry) => entry.id === snapshot.visitorNotice?.venueId,
                      );
                      if (venue) openVenue(venue);
                    }}
                  >
                    <VillageIcon name="places" />
                    Find {person?.name}
                  </button>
                ) : null}
                <button type="button" onClick={() => controller.setMailboxOpen(true)}>
                  <VillageIcon name="mailbox" />
                  Write a letter
                </button>
              </>
            ) : undefined
          }
          portrait={
            <AvatarFace
              portrait={portraits[personProfile.actorId]}
              name={person?.name ?? "Villager"}
              className={`${ELEMENT_TAG}-avatar`}
            />
          }
          request={request}
          venues={relevantVenues}
          links={relatedLinks}
          error={error}
          onInspectSection={setProfileInspection}
          onVenue={async (id) => {
            if (!(await canLeaveDocument())) return;
            const venue = snapshot?.settings.venues.find((entry) => entry.id === id);
            if (venue) {
              openVenue(venue);
              if (personProfile.returnTo === "home") explorationReturnTab.current = "people";
            }
          }}
          spriteManager={
            spriteManagerId && person ? (
              <Appearance
                key={snapshot?.worldScope + ":" + person.characterId}
                characterId={person.characterId}
                name={person.name}
                portrait={portraits[person.characterId]}
                resident
                host={element}
                onLeaveGuard={(guard) => {
                  spriteLeaveGuard.current = guard;
                }}
                onSave={async () => {
                  const next = await request<VillageSnapshot>("");
                  if (navigationLifetime.isCurrent())
                    setSnapshot((current) => (current?.worldScope === next.worldScope ? next : current));
                }}
                onBack={() => {
                  setSpriteManagerId(null);
                  requestAnimationFrame(() => {
                    const profile = element.querySelector<HTMLElement>(`.${ELEMENT_TAG}-dossier-root`);
                    if (profile) profile.scrollTop = spriteProfileScroll.current;
                    element.querySelector<HTMLElement>("[data-dossier-sprites]")?.focus({ preventScroll: true });
                  });
                }}
              />
            ) : undefined
          }
          arrangements={
            !visitor ? (
              <PersonArrangements
                key={snapshot.worldScope + personProfile.actorId}
                person={personProfile.actorId}
                controller={controller}
              />
            ) : undefined
          }
          inspectors={{
            wishes: wishInspection,
            overview: agendaInspection,
            memories: (
              <div className={`${ELEMENT_TAG}-dossier-sheet`}>
                <VillagerMemoriesPanel
                  key={personProfile.actorId}
                  characterId={personProfile.actorId}
                  library={memoryLibrary}
                  busy={busy}
                  onQuery={(query, signal) => loadMemoryLibrary(signal, query)}
                  onForget={(entry, knower) => memoryLibrary && void forgetMemory(entry, [knower], memoryLibrary)}
                />
              </div>
            ),
          }}
          controls={
            <>
              {person && !visitor ? (
                <IdentityDescriptionEditor key={person.characterId} villager={person} onSave={setSnapshot} />
              ) : null}
              <button
                type="button"
                disabled={busy}
                data-dossier-sprites="true"
                onClick={async (event) => {
                  event.currentTarget.blur();
                  if (!(await canLeaveDocument())) return;
                  spriteProfileScroll.current =
                    element.querySelector<HTMLElement>(`.${ELEMENT_TAG}-dossier-root`)?.scrollTop ?? 0;
                  setSpriteManagerId(personProfile.actorId);
                }}
              >
                Appearance
              </button>
              {visitor ? (
                <VisitorProfileControls person={visitor} snapshot={snapshot} setSnapshot={setSnapshot} />
              ) : (
                <button
                  type="button"
                  disabled={busy || !!refreshBusyId}
                  onClick={() => void previewVillagerRefresh(personProfile.actorId)}
                >
                  Compare card
                </button>
              )}
              {!visitor && refreshPreviews[personProfile.actorId] ? (
                <div className={`${ELEMENT_TAG}-dossier-refresh`}>
                  <p>
                    {refreshPreviews[personProfile.actorId].changed
                      ? `New card: ${refreshPreviews[personProfile.actorId].proposed?.name ?? "unavailable"}`
                      : refreshPreviews[personProfile.actorId].sourceAvailable
                        ? `Snapshot revision ${refreshPreviews[personProfile.actorId].current.revision} is current.`
                        : "The saved snapshot remains playable; the source card is unavailable."}
                  </p>
                  {refreshPreviews[personProfile.actorId].changed &&
                  refreshPreviews[personProfile.actorId].sourceAvailable ? (
                    <button
                      type="button"
                      disabled={busy || !!refreshBusyId}
                      onClick={() => void applyVillagerRefresh(personProfile.actorId)}
                    >
                      Apply refresh
                    </button>
                  ) : null}
                </div>
              ) : null}
            </>
          }
        />
      </>
    );
  }
  return null;
}
