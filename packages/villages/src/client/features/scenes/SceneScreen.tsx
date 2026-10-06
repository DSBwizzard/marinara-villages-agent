import type { RoomOperation, VillageSnapshot } from "../../../shared/contracts/village.js";
import { contactNeighborIds } from "../../../shared/helpers/zone-contact.js";
import { messageFrom, request } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { playerDisplayName, venuePictureOf } from "../../shared/presentation.js";
import type { SceneScreenController } from "./screen-contracts.js";
import { DecisionsControl } from "../settings/villages-decisions-control.js";
import { SavedChangesDiagnostics } from "../settings/villages-saved-changes.js";
import { MailboxImprovementEditor } from "../venues/VenuePanels.js";
import { RoomPanel, sceneZoneLabel } from "./ScenePanel.js";

export function SceneScreen({ controller }: { controller: SceneScreenController }) {
  const {
    closeRoom,
    composerEditVersionRef,
    continueRoomWithoutGreeting,
    debugDiscardEnabled,
    discardRoomDebug,
    dismissRoomNotice,
    goHome,
    greetRoom,
    leaveRoom,
    loadSnapshot,
    mailboxOpen,
    mobile,
    moveRoom,
    nameOfCharacter,
    openMenu,
    openPerson,
    openRoom,
    personaPortrait,
    portraits,
    retrySavedScene,
    room,
    roomBusy,
    roomChangeStatus,
    roomContactBoundary,
    roomDraft,
    roomEnded,
    roomError,
    roomGreetingError,
    roomGreetingNotice,
    roomLeaveSubmissionIdRef,
    roomMode,
    roomMoveOperationIdRef,
    roomMoveZoneId,
    roomNotices,
    roomOpen,
    roomRuling,
    roomSubmissionIdRef,
    roomTargetId,
    roomUnresolvedChanges,
    saveSpriteCardFlip,
    sendRoom,
    setMailboxOpen,
    setRoom,
    setRoomBusy,
    setRoomContactBoundary,
    setRoomContactKind,
    setRoomDraft,
    setRoomError,
    setRoomMode,
    setRoomMoveZoneId,
    setRoomTargetId,
    setScreen,
    setSnapshot,
    setVenueEditDraft,
    setVenueId,
    snapshot,
    spriteFlipDraft,
    spriteFlipError,
    spriteFlipSaving,
  } = controller;

  return (
    <div className={`${ELEMENT_TAG}-root ${ELEMENT_TAG}-room-screen`} data-mobile={mobile ? "true" : "false"}>
      {room?.operation?.status === "interrupted" ? (
        <div role="alert" className={`${ELEMENT_TAG}-room-error`}>
          <p>
            {room.operation.kind === "turn"
              ? "The previous request may have been billed. Review your draft and press Send to resend when ready."
              : "The previous request may have been billed. Retry the saved request when ready."}
          </p>
          <button className={`${ELEMENT_TAG}-button`} disabled={roomBusy} onClick={() => void retrySavedScene()}>
            {room.operation.kind === "turn" ? "Recover saved request" : "Retry saved request"}
          </button>
        </div>
      ) : null}
      {room ? (
        <RoomPanel
          room={room}
          mobile={mobile}
          nameColors={
            snapshot?.settings.characterSpeechColors
              ? Object.fromEntries(snapshot.villagers.map((villager) => [villager.characterId, villager.nameColor]))
              : {}
          }
          speechColors={
            snapshot?.settings.characterSpeechColors
              ? Object.fromEntries(snapshot.villagers.map((villager) => [villager.characterId, villager.dialogueColor]))
              : {}
          }
          picture={venuePictureOf(snapshot?.settings.venues ?? [], room)}
          draft={roomDraft}
          mode={roomMode}
          targetId={roomTargetId}
          contactDoors={(() => {
            const zones = snapshot?.settings.venues.find((venue) => venue.id === room.placeId)?.zones ?? [];
            return contactNeighborIds(zones, room.zoneId ?? "exterior").map((id) => {
              const zone = zones.find((entry) => entry.id === id);
              return {
                id,
                label: zone ? sceneZoneLabel(zone) : "Interior entrance",
              };
            });
          })()}
          contactBoundary={roomContactBoundary}
          onContactBoundary={(id) => {
            composerEditVersionRef.current++;
            roomSubmissionIdRef.current = null;
            setRoomContactBoundary(id);
          }}
          onAcceptEntry={(zoneId) => {
            setRoomMode("move");
            setRoomMoveZoneId(zoneId);
            roomMoveOperationIdRef.current = null;
          }}
          movementZones={(snapshot?.settings.venues.find((venue) => venue.id === room.placeId)?.zones ?? []).map(
            (zone) => ({ id: zone.id, label: sceneZoneLabel(zone), closed: zone.closed }),
          )}
          movementTarget={roomMoveZoneId}
          onMovementTarget={(zoneId) => {
            composerEditVersionRef.current++;
            setRoomMoveZoneId(zoneId);
            roomMoveOperationIdRef.current = null;
          }}
          currentZoneLabel={sceneZoneLabel(
            snapshot?.settings.venues
              .find((venue) => venue.id === room.placeId)
              ?.zones?.find((zone) => zone.id === room.zoneId),
          )}
          busy={roomBusy || room.operation?.status === "running"}
          error={
            roomError ||
            room.operation?.error ||
            (room.status === "opening" && roomGreetingError?.sessionId === room.id ? roomGreetingError.message : "")
          }
          greetingNotice={roomGreetingNotice}
          ruling={roomRuling}
          open={roomOpen}
          ended={roomEnded}
          playerName={playerDisplayName(snapshot)}
          playerPortrait={personaPortrait ?? undefined}
          portraits={portraits}
          sprites={Object.fromEntries(
            (snapshot?.villagers ?? []).map((villager) => [villager.characterId, villager.sprite]),
          )}
          onDraft={(value) => {
            composerEditVersionRef.current++;
            roomSubmissionIdRef.current = null;
            roomLeaveSubmissionIdRef.current = null;
            setRoomDraft(value);
          }}
          onMode={(value) => {
            composerEditVersionRef.current++;
            roomSubmissionIdRef.current = null;
            setRoomMode(value);
            if (value === "contact") {
              setRoomTargetId("");
              setRoomContactKind("call");
            }
          }}
          onTarget={(value) => {
            composerEditVersionRef.current++;
            roomSubmissionIdRef.current = null;
            setRoomTargetId(value);
          }}
          sendOnEnter={snapshot?.settings.sendOnEnter === true}
          onSend={() => void (roomMode === "move" ? moveRoom() : roomMode === "conclude" ? leaveRoom() : sendRoom())}
          onViewVenue={() => {
            setVenueId(room.placeId);
            setVenueEditDraft(null);
            setScreen("venue");
            void loadSnapshot();
          }}
          onEnterPrivate={
            room.area === "shared" && room.privateAccessOwnerId
              ? () => {
                  const destination = snapshot?.settings.venues
                    .find((venue) => venue.id === room.placeId)
                    ?.zones?.find(
                      (zone) => zone.ownerId === room.privateAccessOwnerId && zone.kind === "private-residence",
                    );
                  if (destination) {
                    setRoomMode("move");
                    setRoomMoveZoneId(destination.id);
                    roomMoveOperationIdRef.current = null;
                  }
                }
              : undefined
          }
          privateSpaceOwnerName={nameOfCharacter(room.privateAccessOwnerId)}
          onEnd={() => void closeRoom()}
          notices={roomNotices}
          onDismissNotice={dismissRoomNotice}
          onOpenWish={(actorId, wishId) => {
            openPerson({ actorId, wishId, section: "wishes", returnTo: "room" });
          }}
          changeStatus={room?.memoryMode === "live" ? roomChangeStatus : undefined}
          unresolvedChanges={roomUnresolvedChanges}
          onRetryChangeInterpretation={(submissionId, domain) => {
            if (!room?.id || roomBusy) return;
            setRoomBusy(true);
            void request(
              `/rooms/${encodeURIComponent(room.id)}/changes/${encodeURIComponent(submissionId)}/interpret`,
              {
                method: "POST",
                body: JSON.stringify({ domain, retryOfAttemptId: room.operation?.attemptId }),
              },
            )
              .catch(async (cause) => {
                setRoomError(messageFrom(cause, "Interpretation needs an explicit retry."));
                const result = await request<{ operation: RoomOperation | null }>(
                  `/rooms/${encodeURIComponent(room.id)}/operation`,
                ).catch(() => null);
                if (result)
                  setRoom((current) =>
                    current?.id === room.id ? { ...current, operation: result.operation } : current,
                  );
              })
              .finally(() => setRoomBusy(false));
          }}
          onReplayChanges={() => {
            if (!room?.id) return;
            void request(`/rooms/${encodeURIComponent(room.id)}/changes/replay`, { method: "POST" }).catch((cause) =>
              setRoomError(messageFrom(cause, "Saved changes could not be replayed.")),
            );
          }}
          debugDiscardEnabled={debugDiscardEnabled}
          onDebugDiscard={() => void discardRoomDebug()}
          onRetryGreeting={() => {
            if (room.id) void greetRoom(room.id);
            else {
              const place = snapshot?.settings.venues.find((candidate) => candidate.id === room.placeId);
              if (place) void openRoom(place);
            }
          }}
          onContinueWithoutGreeting={() => {
            if (room.id) void continueRoomWithoutGreeting(room.id);
          }}
          onUseMailbox={
            snapshot?.settings.venues.some(
              (venue) =>
                venue.id === room.placeId &&
                venue.occupancy.playerHome &&
                (!room.spaceClass || room.spaceClass === "residence"),
            )
              ? () => setMailboxOpen(true)
              : undefined
          }
          onProjects={() => openMenu("projects")}
          onProposals={() => openMenu("venueRequests")}
          spriteCardFlipEnabled={snapshot?.settings.spriteCardFlipEnabled !== false}
          sceneSettings={
            <>
              <label className={ELEMENT_TAG + "-row"}>
                <input
                  type="checkbox"
                  checked={spriteFlipDraft ?? snapshot?.settings.spriteCardFlipEnabled !== false}
                  disabled={spriteFlipSaving}
                  onChange={(event) => void saveSpriteCardFlip(event.target.checked)}
                />
                Card-flip sprite changes
              </label>
              <p className={ELEMENT_TAG + "-hint"}>
                Flip when facing or artwork changes. Saved for this Village on every device.
              </p>
              {spriteFlipError ? <p role="alert">{spriteFlipError}</p> : null}
              <DecisionsControl
                sceneId={room.id}
                busy={roomBusy || room.operation?.status === "running"}
                api={request}
              />
              {room.memoryMode === "live" ? (
                <SavedChangesDiagnostics key={room.id} sceneId={room.id} api={request} />
              ) : null}
            </>
          }
        />
      ) : (
        <button type="button" className={`${ELEMENT_TAG}-button`} onClick={goHome}>
          Back to village
        </button>
      )}
      {/* Future flavor: let a village present this Mailbox as a crystal, terminal, messenger bird, or email. */}
      {mailboxOpen && snapshot ? (
        <div className={`${ELEMENT_TAG}-mailbox-backdrop`} onClick={() => setMailboxOpen(false)}>
          <section
            className={`${ELEMENT_TAG}-mailbox`}
            role="dialog"
            aria-modal="true"
            aria-label="Mailbox"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={`${ELEMENT_TAG}-row`} style={{ justifyContent: "space-between" }}>
              <h2 className={`${ELEMENT_TAG}-panel-title`}>Mailbox</h2>
              <button type="button" className={`${ELEMENT_TAG}-button`} onClick={() => setMailboxOpen(false)}>
                Close
              </button>
            </div>
            <p className={`${ELEMENT_TAG}-hint`}>Venue decisions and replies from the people affected by them.</p>
            <div className={`${ELEMENT_TAG}-mailbox-list`}>
              {[...(snapshot.venueMail ?? [])].reverse().map((entry) => (
                <article className={`${ELEMENT_TAG}-mailbox-item`} key={entry.id}>
                  <strong>{entry.title}</strong>
                  <p>{entry.detail}</p>
                  <p className={`${ELEMENT_TAG}-hint`}>
                    {entry.status === "awaiting-villagers"
                      ? `Awaiting replies · due ${new Date(entry.dueAt).toLocaleString()}`
                      : entry.status === "pending-player"
                        ? "Awaiting your decision"
                        : entry.status === "approved"
                          ? "Approved"
                          : "Declined"}
                  </p>
                  {entry.decisions.map((decision) => (
                    <p key={decision.characterId}>
                      <strong>{nameOfCharacter(decision.characterId)}:</strong> {decision.reply}
                    </p>
                  ))}
                  {entry.status === "pending-player" && entry.kind === "villager-change" ? (
                    <MailboxImprovementEditor
                      entry={entry}
                      onDecide={async (approved, value) => {
                        setSnapshot(
                          await request<VillageSnapshot>(`/venue-mail/${encodeURIComponent(entry.id)}/decision`, {
                            method: "POST",
                            body: JSON.stringify({ approved, ...value }),
                          }),
                        );
                      }}
                    />
                  ) : null}
                  {entry.error ? <p className={`${ELEMENT_TAG}-hint`}>Reply delayed: {entry.error}</p> : null}
                </article>
              ))}
              {(snapshot.venueMail?.length ?? 0) === 0 &&
              snapshot.venueRequests.length === 0 &&
              snapshot.upgradeRequests.length === 0 ? (
                <p className={`${ELEMENT_TAG}-empty`}>No Venue mail yet.</p>
              ) : null}
              {snapshot.venueRequests.map((entry) => (
                <article className={`${ELEMENT_TAG}-mailbox-item`} key={entry.id}>
                  <strong>
                    {entry.requesterName || "A villager"} suggests {entry.venueDraft.name}
                  </strong>
                  <p>
                    {entry.venueDraft.classes
                      .map((venueClass) => venueClass[0].toUpperCase() + venueClass.slice(1))
                      .join(" / ")}
                  </p>
                  <button
                    type="button"
                    className={`${ELEMENT_TAG}-button`}
                    onClick={() => {
                      setMailboxOpen(false);
                      openMenu("venueRequests");
                    }}
                  >
                    Review request
                  </button>
                </article>
              ))}
              {snapshot.upgradeRequests.map((entry) => (
                <article className={`${ELEMENT_TAG}-mailbox-item`} key={entry.id}>
                  <strong>{entry.requesterName} suggests a home change</strong>
                  <p>{entry.detail}</p>
                  <button
                    type="button"
                    className={`${ELEMENT_TAG}-button`}
                    onClick={() => {
                      setMailboxOpen(false);
                      openMenu("venueRequests");
                    }}
                  >
                    Review request
                  </button>
                </article>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
