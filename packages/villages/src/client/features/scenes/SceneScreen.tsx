import { recordTurnTiming } from "../../shared/turn-timing.js";
import { useCallback, useState, useRef } from "react";
import {
  isSceneTurnOutcome,
  isSceneTurnOutcomeMessage,
  sceneTurnOutcomeMessage,
} from "../../../shared/contracts/scene-turn-outcome.js";
import type { RoomOperation } from "../../../shared/contracts/village.js";
import { contactNeighborIds } from "../../../shared/helpers/zone-contact.js";
import { messageFrom, request } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { playerDisplayName, venuePictureOf } from "../../shared/presentation.js";
import type { SceneScreenController } from "./screen-contracts.js";
import { DecisionsControl } from "../settings/villages-decisions-control.js";
import { SavedChangesDiagnostics } from "../settings/villages-saved-changes.js";
import { RoomPanel, sceneZoneLabel } from "./ScenePanel.js";
import { useContext, useEffect } from "react";
import type { SceneErrorItem } from "./scene-errors.js";
import { SpinoffActionContext, SpinoffErrorContext } from "./SpinoffPanel.js";

const requestErrorIds = new Set(["room", "operation", "greeting"]);

export function SceneScreen({ controller }: { controller: SceneScreenController }) {
  const displayedSubmissionId = controller.room?.submissions?.at(-1)?.id;
  useEffect(() => {
    if (displayedSubmissionId && controller.room?.id)
      recordTurnTiming(controller.room.id, displayedSubmissionId, "displayed");
  }, [controller.room?.id, displayedSubmissionId]);
  const startSpinoff = useContext(SpinoffActionContext);
  const spinoffError = useContext(SpinoffErrorContext);
  const [reportedErrors, setReportedErrors] = useState<
    { sceneId: string; id: string; title: string; message: string }[]
  >([]);
  const sceneId = controller.room?.id;
  const sceneVenues =
    controller.snapshot?.sceneVenue && controller.snapshot.sceneVenue.sceneId === sceneId
      ? [controller.snapshot.sceneVenue.venue]
      : controller.room?.capturedContext
        ? []
        : (controller.snapshot?.settings.venues ?? []);
  const reportSettingsError = useCallback(
    (id: string, title: string, message: string) => {
      if (!sceneId) return;
      setReportedErrors((current) => [
        ...current.filter((entry) => entry.sceneId !== sceneId || entry.id !== id),
        ...(message ? [{ sceneId, id, title, message }] : []),
      ]);
    },
    [sceneId],
  );
  const reportDecisionsError = useCallback(
    (message: string) => reportSettingsError("decisions", "Scene interpretation setting failed", message),
    [reportSettingsError],
  );
  const reportDiagnosticsError = useCallback(
    (message: string) => reportSettingsError("diagnostics", "Saved change diagnostics unavailable", message),
    [reportSettingsError],
  );
  const clarificationId = controller.room?.attentionClarification?.id;
  const clarificationMessage = controller.room?.attentionClarification?.message;
  const restoreRoomDraft = controller.setRoomDraft;
  const currentOperation = controller.room?.operation;
  const editVersionRef = controller.composerEditVersionRef;
  const showInformation = controller.setRoomRuling;
  const restoredInformation = useRef("");
  useEffect(() => {
    const operation = currentOperation;
    const key = `${sceneId}:${operation?.id}`;
    if (!operation || !isSceneTurnOutcome(operation.turnOutcome) || restoredInformation.current === key) return;
    restoredInformation.current = key;
    if (editVersionRef.current !== 0) return;
    restoreRoomDraft((current) => current || operation.input?.message || "");
    showInformation(sceneTurnOutcomeMessage(operation.turnOutcome));
  }, [sceneId, currentOperation, editVersionRef, showInformation, restoreRoomDraft]);
  useEffect(() => {
    if (clarificationId && clarificationMessage) restoreRoomDraft((current) => current || clarificationMessage);
  }, [controller.room?.id, clarificationId, clarificationMessage, restoreRoomDraft]);
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
    mobile,
    moveRoom,
    openMenu,
    openPerson,
    openRoom,
    personaPortrait,
    portraits,
    retrySavedScene,
    sceneReading,
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
    roomNotices,
    roomOpen,
    roomRuling,
    setRoomRuling,
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
    setRoomTargetId,
    openVenue,
    snapshot,
    spriteFlipDraft,
    spriteFlipError,
    spriteFlipSaving,
  } = controller;

  return (
    <div className={`${ELEMENT_TAG}-root ${ELEMENT_TAG}-room-screen`} data-mobile={mobile ? "true" : "false"}>
      {room ? (
        <RoomPanel
          room={room}
          sceneErrors={[
            ...[
              {
                id: "operation",
                title:
                  room.operation?.status === "interrupted"
                    ? room.operation.kind === "turn"
                      ? "Message failed"
                      : "Saved request interrupted"
                    : "Saved request failed",
                message:
                  room.operation?.error ||
                  (room.operation?.status === "interrupted"
                    ? "The saved request was interrupted. Retry it when you are ready."
                    : ""),
                actions:
                  room.operation?.status === "interrupted" && room.status !== "opening" ? (
                    <button type="button" disabled={roomBusy} onClick={() => void retrySavedScene()}>
                      {room.operation.kind === "turn" ? "Retry original message" : "Retry saved request"}
                    </button>
                  ) : undefined,
              },
              {
                id: "room",
                title: room.status === "opening" ? "Scene opening failed" : "Scene request failed",
                message: roomError,
              },
              {
                id: "greeting",
                title: "Scene opening failed",
                message: roomGreetingError?.sessionId === room.id ? roomGreetingError.message : "",
              },
              { id: "sprite-setting", title: "Scene setting could not be saved", message: spriteFlipError },
              ...reportedErrors
                .filter((entry) => entry.sceneId === room.id)
                .map(({ sceneId: _sceneId, ...entry }) => entry),
              ...(spinoffError ? [{ id: "spinoff", title: "Spinoff request failed", message: spinoffError }] : []),
            ]
              .filter(
                (entry, index, all) =>
                  !!entry.message &&
                  (!requestErrorIds.has(entry.id) ||
                    all.findIndex((other) => requestErrorIds.has(other.id) && other.message === entry.message) ===
                      index),
              )
              .map((entry): SceneErrorItem => ({ ...entry, message: entry.message! })),
          ]}
          turnRecovery={controller.turnRecovery}
          onCheckSavedReply={() => void controller.checkSavedReply?.()}
          sceneReading={sceneReading}
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
          picture={venuePictureOf(sceneVenues, room)}
          draft={roomDraft}
          mode={roomMode}
          targetId={roomTargetId}
          contactDoors={(() => {
            const zones = sceneVenues.find((venue) => venue.id === room.placeId)?.zones ?? [];
            return contactNeighborIds(room.connectionMap ?? zones, room.zoneId ?? "exterior").map((id) => {
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
          movementZones={(() => {
            const venue = sceneVenues.find((entry) => entry.id === room.placeId);
            return (venue?.zones ?? [])
              .filter((zone) => {
                if (zone.id === room.zoneId) return true;
                if (zone.closed) return false;
                if (zone.accessView) return zone.accessView.decision.allowed;
                return (
                  zone.kind === "exterior" ||
                  zone.kind === "public" ||
                  zone.relationshipAccess ||
                  room.entryOffers?.some((offer) => offer.zoneId === zone.id) ||
                  room.grantedZoneIds?.includes(zone.id) ||
                  venue?.playerInvitations?.some((offer) => offer.zoneId === zone.id) ||
                  (venue?.occupancy.playerHome &&
                    (zone.kind === "shared-residence" ||
                      (zone.kind === "private-residence" && zone.ownerId === "player"))) ||
                  (zone.kind === "restricted" && zone.controllerIds?.includes("player"))
                );
              })
              .map((zone) => ({ id: zone.id, label: sceneZoneLabel(zone), closed: zone.closed }));
          })()}
          onMovementTarget={(zoneId) => void moveRoom(zoneId)}
          currentZoneLabel={sceneZoneLabel(
            sceneVenues.find((venue) => venue.id === room.placeId)?.zones?.find((zone) => zone.id === room.zoneId),
          )}
          busy={roomBusy || controller.replyPending || room.operation?.status === "running"}
          error={
            roomError ||
            room.operation?.error ||
            (room.status === "opening" && roomGreetingError?.sessionId === room.id ? roomGreetingError.message : "")
          }
          draftWhilePending={controller.replyPending}
          greetingNotice={roomGreetingNotice}
          ruling={roomRuling}
          open={roomOpen}
          ended={roomEnded}
          playerName={room.playerName ?? playerDisplayName(snapshot)}
          playerPortrait={personaPortrait ?? undefined}
          portraits={portraits}
          sprites={Object.fromEntries(
            (snapshot?.villagers ?? []).map((villager) => [villager.characterId, villager.sprite]),
          )}
          onDraft={(value) => {
            if (isSceneTurnOutcomeMessage(roomRuling)) controller.setRoomRuling("");
            composerEditVersionRef.current++;
            roomSubmissionIdRef.current = null;
            roomLeaveSubmissionIdRef.current = null;
            setRoomDraft(value);
          }}
          onMode={(value) => {
            if (isSceneTurnOutcomeMessage(roomRuling)) controller.setRoomRuling("");
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
            if (isSceneTurnOutcomeMessage(roomRuling)) setRoomRuling("");
            roomSubmissionIdRef.current = null;
            setRoomTargetId(value);
          }}
          sendOnEnter={snapshot?.settings.sendOnEnter === true}
          onSend={() => void (roomMode === "conclude" ? leaveRoom() : sendRoom())}
          onAttentionChoice={(zoneId) => void sendRoom(zoneId)}
          onViewVenue={() => {
            const place = snapshot?.settings.venues.find((place) => place.id === room.placeId);
            if (place) openVenue(place);
            void loadSnapshot();
          }}
          onEnd={() => void closeRoom()}
          onStartSpinoff={startSpinoff}
          notices={roomNotices}
          onDismissNotice={dismissRoomNotice}
          onOpenWish={(actorId, wishId) => {
            openPerson({ actorId, wishId, section: "wishes", returnTo: "room" });
          }}
          changeStatus={room?.memoryMode === "live" ? roomChangeStatus : undefined}
          unresolvedChanges={roomUnresolvedChanges}
          onContinueChange={(submissionId, domain) => {
            if (!room?.id || roomBusy) return;
            setRoomBusy(true);
            void request(`/rooms/${encodeURIComponent(room.id)}/changes/${encodeURIComponent(submissionId)}/continue`, {
              method: "POST",
              body: JSON.stringify({ domain }),
            })
              .catch((cause) => setRoomError(messageFrom(cause, "Could not continue.")))
              .finally(() => setRoomBusy(false));
          }}
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
              setRoomError(messageFrom(cause, "World changes could not be replayed.")),
            );
          }}
          debugDiscardEnabled={debugDiscardEnabled}
          onDebugDiscard={() => void discardRoomDebug()}
          onRetryGreeting={() => {
            if (room.id && room.operation?.status === "interrupted") void retrySavedScene();
            else if (room.id) void greetRoom(room.id);
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
          onMap={goHome}
          onProjects={() => openMenu("projects")}
          onProposals={() => openMenu("venueRequests")}
          spriteCardFlipEnabled={snapshot?.settings.spriteCardFlipEnabled !== false}
          sceneSettings={
            <>
              <label className={ELEMENT_TAG + "-row"}>
                <input
                  autoComplete="off"
                  type="checkbox"
                  checked={spriteFlipDraft ?? snapshot?.settings.spriteCardFlipEnabled !== false}
                  disabled={spriteFlipSaving}
                  onChange={(event) => void saveSpriteCardFlip(event.target.checked)}
                />
                Card-flip sprite changes
              </label>
              {room.semanticVersion !== 2 ? (
                <DecisionsControl
                  sceneId={room.id}
                  onError={reportDecisionsError}
                  busy={roomBusy || room.operation?.status === "running"}
                  api={request}
                />
              ) : null}
              {room.memoryMode === "live" ? (
                <SavedChangesDiagnostics
                  key={room.id}
                  sceneId={room.id}
                  api={request}
                  onError={reportDiagnosticsError}
                />
              ) : null}
            </>
          }
        />
      ) : (
        <button type="button" className={`${ELEMENT_TAG}-button`} onClick={goHome}>
          Back to village
        </button>
      )}
    </div>
  );
}
