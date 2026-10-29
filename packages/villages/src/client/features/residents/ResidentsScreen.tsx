import type { VillageSnapshot } from "../../../shared/contracts/village.js";
import { request } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { agendaMinuteLabel, agendaUpdatePending, remapPlaceName } from "../../shared/presentation.js";
import { IdentityDescriptionEditor } from "./IdentityDescriptionEditor.js";
import { VillagerMemoriesPanel } from "./MemoriesPanel.js";
import { AvatarFace } from "./ResidentPanels.js";
import type { ResidentsScreenController } from "./screen-contracts.js";
import { type DossierLink, type DossierVenue, VillagerDossier } from "./villages-dossier.js";
import { SpriteManager } from "./villages-sprite-manager.js";
import { VillagerWishJournal } from "./villages-wish-journal.js";

export function ResidentsScreen({
  controller,
  onDirectory,
  onClose,
}: {
  controller: ResidentsScreenController;
  onDirectory?: () => void;
  onClose?: () => void;
}) {
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
    profileOrigin,
    refreshBusyId,
    refreshPreviews,
    rewriteAgenda,
    screen,
    setAgendaScheduleIngestion,
    setExploreSheet,
    setFocusedProjectId,
    setFocusedRequestId,
    setHousingVenueId,
    setMenuPage,
    setPersonProfile,
    setProfileInspection,
    setScreen,
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
    const person = snapshot?.villagers.find((entry) => entry.characterId === personProfile.actorId);
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
      const agendaDestination = selectedAgendas.some((entry) =>
        Object.values(entry.effectiveDays ?? {}).some((blocks) => blocks.some((block) => block.venueId === venue.id)),
      );
      if (connections.length === publicConnections.length && agendaDestination) connections.push("Agenda destination");
      return {
        id: venue.id,
        name: venue.name,
        image: venue.presentation.image?.url,
        connections,
        publicConnections,
      };
    });
    const relatedLinks: DossierLink[] = [];
    relatedLinks.push({
      id: "personal-mail",
      title: "Message",
      detail: "Mailbox",
      onOpen: () => controller.setMailboxOpen(true),
    });
    relatedLinks.push(
      {
        id: "projects-all",
        title: "Projects",
        detail: "Open Projects",
        playerVisible: true,
        onOpen: () => openMenu("projects"),
      },
      {
        id: "requests-all",
        title: "Venue Requests",
        detail: "Open Venue Requests",
        playerVisible: true,
        onOpen: () => {
          setHousingVenueId("");
          openMenu("venueRequests");
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
        onOpen: () => {
          openMenu("projects");
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
        onOpen: () => {
          openMenu("venueRequests");
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
        onOpen: () => {
          openMenu("venueRequests");
          setFocusedRequestId("residence:" + residence.characterId);
        },
      });
    }
    const wishInspection = (
      <VillagerWishJournal request={request} characterId={personProfile.actorId} prefix={ELEMENT_TAG} inspect />
    );
    const agendaInspection = (
      <div className={`${ELEMENT_TAG}-overlay`}>
        <div className={`${ELEMENT_TAG}-overlay-head`}>
          <h2 className={`${ELEMENT_TAG}-panel-title`}>Villager agendas</h2>
        </div>
        {agendas === null ? (
          <p className={`${ELEMENT_TAG}-empty`}>Loading agendas…</p>
        ) : selectedAgendas.length === 0 ? (
          <p className={`${ELEMENT_TAG}-empty`}>Nobody lives here yet.</p>
        ) : (
          <div className={`${ELEMENT_TAG}-agenda-list`}>
            {selectedAgendas.map((villager) => (
              <details key={villager.characterId} className={`${ELEMENT_TAG}-week`} open>
                <summary className={`${ELEMENT_TAG}-week-toggle`}>
                  <h3 className={`${ELEMENT_TAG}-week-head`}>
                    {villager.name}
                    {villager.agenda?.personalizationPending ? (
                      <span className={`${ELEMENT_TAG}-badge`}>
                        {villager.agenda.personalizationFailure ? "Personalization needs retry" : "Personalizing"}
                      </span>
                    ) : null}
                    {villager.agenda?.personalizationFailure ? (
                      <span className={`${ELEMENT_TAG}-badge`}>Personalization failed</span>
                    ) : null}
                    {villager.missing ? <span className={`${ELEMENT_TAG}-badge`}>Card missing</span> : null}
                    {villager.nativeSchedule ? (
                      <span className={`${ELEMENT_TAG}-badge`}>
                        {villager.ingestSchedule ? "Schedule influence enabled" : "Schedule available"}
                      </span>
                    ) : null}
                    {agendaUpdatePending(villager) ? (
                      <span className={`${ELEMENT_TAG}-badge`}>Earlier hours kept</span>
                    ) : null}
                  </h3>
                </summary>
                <div className={`${ELEMENT_TAG}-week-body`}>
                  {villager.agenda?.routineSummary ? (
                    <p className={`${ELEMENT_TAG}-story-meta`}>{villager.agenda.routineSummary}</p>
                  ) : null}
                  {villager.agenda?.personalizationFailure ? (
                    <p className={`${ELEMENT_TAG}-empty`}>{villager.agenda.personalizationFailure}</p>
                  ) : villager.agenda?.personalizationPending ? (
                    <p className={`${ELEMENT_TAG}-story-scope`}>Personalizing this agenda in the background.</p>
                  ) : null}
                  <div className={`${ELEMENT_TAG}-agenda-actions`}>
                    <label className={`${ELEMENT_TAG}-agenda-switch`}>
                      <input
                        autoComplete="off"
                        type="checkbox"
                        checked={villager.ingestSchedule}
                        disabled={busy}
                        onChange={(event) =>
                          void setAgendaScheduleIngestion(villager.characterId, event.target.checked)
                        }
                      />
                      Schedule influence
                    </label>
                    <button
                      type="button"
                      className={`${ELEMENT_TAG}-button`}
                      disabled={busy}
                      onClick={() => void rewriteAgenda(villager.characterId)}
                    >
                      Regenerate agenda
                    </button>
                    {villager.canInterpretSchedule ? (
                      <button
                        type="button"
                        className={`${ELEMENT_TAG}-button`}
                        disabled={busy || !villager.ingestSchedule}
                        onClick={() => void setAgendaScheduleIngestion(villager.characterId, true)}
                      >
                        Interpret schedule
                      </button>
                    ) : null}
                    {Object.entries({
                      rhythm: "Preferred sleep/wake rhythm",
                      busyFree: "Broad busy/free periods",
                      weekdayWeekend: "Weekday/weekend patterns",
                      interests: "Compatible hobbies and interests",
                      establishedEntities: "Established workplaces, vehicles and institutions",
                    }).map(([key, label]) => (
                      <label key={key} className={ELEMENT_TAG + "-agenda-switch"}>
                        <input
                          autoComplete="off"
                          type="checkbox"
                          checked={villager.scheduleInfluence?.categories[key] !== false}
                          disabled={busy || !villager.ingestSchedule}
                          onChange={(event) =>
                            void setAgendaScheduleIngestion(villager.characterId, villager.ingestSchedule, {
                              [key]: event.target.checked,
                            })
                          }
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                  {villager.ingestSchedule ? (
                    <ul>
                      {(villager.agenda?.scheduleInfluenceSnapshot?.adopted ?? []).map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                      {(villager.agenda?.scheduleInfluenceSnapshot?.unresolved ?? []).map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  ) : null}
                  {villager.weekUnreadable ? (
                    <p className={`${ELEMENT_TAG}-empty`}>
                      Marinara schedules could not be read right now. The Villages agenda remains active.
                    </p>
                  ) : !villager.nativeSchedule ? (
                    <p className={`${ELEMENT_TAG}-empty`}>No Marinara schedule. Villages uses its own agenda.</p>
                  ) : null}
                  <div className={`${ELEMENT_TAG}-agenda-days`}>
                    {villager.days.map((day) => {
                      const blocks = day.isToday
                        ? (villager.effectiveDays?.[day.weekday] ??
                          villager.agenda?.activeDay?.blocks ??
                          villager.agenda?.week?.[day.weekday] ??
                          [])
                        : (villager.effectiveDays?.[day.weekday] ?? villager.agenda?.week?.[day.weekday] ?? []);
                      return (
                        <details
                          key={`${day.weekday}-${day.dateLabel}`}
                          className={`${ELEMENT_TAG}-agenda-day`}
                          open={day.isToday || undefined}
                        >
                          <summary>
                            {day.weekday} · {day.dateLabel}
                            {day.isToday ? " · Today" : ""}
                          </summary>
                          <div className={`${ELEMENT_TAG}-agenda-compare`}>
                            <section aria-label={`${day.weekday} Villages agenda`}>
                              <h4>Villages agenda</h4>
                              <ol className={`${ELEMENT_TAG}-agenda-blocks`}>
                                {blocks.map((part, index) => (
                                  <li key={`${part.startMinute}-${part.endMinute}-${index}`}>
                                    <time>
                                      {agendaMinuteLabel(part.startMinute)}–{agendaMinuteLabel(part.endMinute)}
                                    </time>
                                    <strong>{part.activity}</strong>
                                    <span>
                                      {part.venueId
                                        ? remapPlaceName(snapshot?.settings.venues ?? [], part.venueId)
                                        : "Home"}
                                    </span>
                                  </li>
                                ))}
                              </ol>
                            </section>
                          </div>
                        </details>
                      );
                    })}
                  </div>
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    );
    const back = async () => {
      if (spriteLeaveGuard.current && !(await spriteLeaveGuard.current())) return;
      setSpriteManagerId(null);
      setProfileInspection(null);
      setPersonProfile(null);
      setScreen(personProfile.returnTo);
      if (personProfile.returnTo === "home") setExploreSheet({ tab: "people" });
      if (personProfile.returnTo === "menu") {
        setMenuPage("villagers");
      }
      requestAnimationFrame(() => {
        for (const { selector, top } of profileOrigin.current.scroll) {
          const target = element.querySelector<HTMLElement>(selector);
          if (target) target.scrollTop = top;
        }
        const target = profileOrigin.current.selector
          ? element.querySelector<HTMLElement>(profileOrigin.current.selector)
          : element.querySelector<HTMLElement>(`textarea[aria-label]`);
        target?.focus({ preventScroll: true });
      });
    };
    return (
      <>
        <VillagerDossier
          key={personProfile.actorId}
          navigation={personProfile}
          villager={person}
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
          onBack={onDirectory ?? back}
          onClose={onClose}
          onVenue={(id) => {
            const venue = snapshot?.settings.venues.find((entry) => entry.id === id);
            if (venue) {
              openVenue(venue);
              if (personProfile.returnTo === "home") explorationReturnTab.current = "people";
            }
          }}
          spriteManager={
            spriteManagerId && person ? (
              <SpriteManager
                key={person.characterId}
                villager={person}
                request={request}
                backLabel="← Back to profile"
                onLeaveGuard={(guard) => {
                  spriteLeaveGuard.current = guard;
                }}
                onSaved={(next) => setSnapshot(next as VillageSnapshot)}
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
          inspectors={{
            wishes: wishInspection,
            agenda: agendaInspection,
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
              {person ? (
                <IdentityDescriptionEditor key={person.characterId} villager={person} onSave={setSnapshot} />
              ) : null}
              <button
                type="button"
                disabled={busy}
                data-dossier-sprites="true"
                onClick={(event) => {
                  spriteProfileScroll.current =
                    element.querySelector<HTMLElement>(`.${ELEMENT_TAG}-dossier-root`)?.scrollTop ?? 0;
                  event.currentTarget.blur();
                  setSpriteManagerId(personProfile.actorId);
                }}
              >{`Manage sprites · ${person?.sprite?.images.length ?? 0} assigned`}</button>
              <button
                type="button"
                disabled={busy || !!refreshBusyId}
                onClick={() => void previewVillagerRefresh(personProfile.actorId)}
              >
                Compare card
              </button>
              {refreshPreviews[personProfile.actorId] ? (
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
