import { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  isSceneTurnOutcome,
  isSceneTurnOutcomeMessage,
  sceneTurnOutcomeMessage,
} from "../../../shared/contracts/scene-turn-outcome.js";
import type { RoomOperation, SceneView } from "../../../shared/contracts/village.js";
import { messageFrom, request } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { playerDisplayName, venuePictureOf } from "../../shared/presentation.js";
import { recordTurnTiming } from "../../shared/turn-timing.js";
import { DecisionsControl } from "../settings/villages-decisions-control.js";
import { SavedChangesDiagnostics } from "../settings/villages-saved-changes.js";
import type { SceneErrorItem } from "./scene-errors.js";
import { currentRoom, RoomPanel, sceneZoneLabel } from "./ScenePanel.js";
import type { SceneScreenController } from "./screen-contracts.js";
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
  const sceneLifetime = useRef<string | undefined>(sceneId);
  const [legacyReviewBusy, setLegacyReviewBusy] = useState(false);
  const legacyReviewPending = useRef(false);
  const legacyReviewGeneration = useRef(0);
  const heldRecovery = useRef(controller.legacyRecovery);
  heldRecovery.current = controller.legacyRecovery;
  useEffect(() => {
    sceneLifetime.current = sceneId;
    legacyReviewPending.current = false;
    legacyReviewGeneration.current++;
    setLegacyReviewBusy(false);
    return () => {
      sceneLifetime.current = undefined;
    };
  }, [sceneId]);
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
    roomDraft,
    roomEnded,
    roomError,
    roomGreetingError,
    roomGreetingNotice,
    roomLeaveSubmissionIdRef,
    roomMode,
    legacyRecovery,
    setLegacyRecovery,
    roomNotices,
    roomOpen,
    roomRuling,
    roomSubmissionIdRef,
    roomUnresolvedChanges,
    saveSpriteCardFlip,
    sendRoom,
    setMailboxOpen,
    setRoom,
    setRoomBusy,
    setRoomDraft,
    setRoomError,
    setRoomMode,
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
                    <button
                      type="button"
                      disabled={roomBusy || legacyReviewBusy}
                      onClick={() =>
                        void retrySavedScene(
                          room.operation?.kind === "turn" && legacyRecovery?.sceneId === room.id
                            ? legacyRecovery
                            : undefined,
                        )
                      }
                    >
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
          legacyRecovery={legacyRecovery?.sceneId === room.id ? legacyRecovery : null}
          legacyDestination={(() => {
            const input = legacyRecovery?.sceneId === room.id ? legacyRecovery.operation.input : undefined;
            const recipient = input?.targetId
              ? (room.participants.find((person) => person.characterId === input.targetId)?.name ?? "saved recipient")
              : "";
            if (input?.mode !== "contact") return recipient || "saved recipient";
            const zone = sceneVenues
              .find((venue) => venue.id === room.placeId)
              ?.zones?.find((entry) => entry.id === input.contact?.boundaryZoneId);
            return [zone ? sceneZoneLabel(zone) : "saved Zone", recipient].filter(Boolean).join(" · ");
          })()}
          onRetryLegacy={() => {
            if (legacyRecovery?.sceneId === room.id) void retrySavedScene(legacyRecovery);
          }}
          onReplaceLegacy={() => {
            if (legacyRecovery?.sceneId === room.id) void sendRoom(undefined, legacyRecovery);
          }}
          onReviewLegacy={() => {
            if (legacyReviewPending.current || roomBusy || !legacyRecovery) return;
            const id = room.id;
            const held = legacyRecovery;
            legacyReviewPending.current = true;
            const generation = ++legacyReviewGeneration.current;
            setLegacyReviewBusy(true);
            void (async () => {
              try {
                const { session } = await request<{ session: SceneView | null }>("/rooms/active");
                if (
                  sceneLifetime.current !== id ||
                  heldRecovery.current !== held ||
                  legacyReviewGeneration.current !== generation
                )
                  return;
                if (!session || session.id !== id) throw new Error("This Scene changed. Reopen it before continuing.");
                const summary = session.operation;
                if (summary?.status === "running")
                  throw new Error("The saved action is still processing. Check again before continuing.");
                let latest: RoomOperation | null = null;
                if (
                  summary &&
                  (summary.status === "interrupted" || summary.error) &&
                  !session.submissions?.some((entry) => entry.id === summary.id)
                ) {
                  latest = (
                    await request<{ operation: RoomOperation | null }>(
                      `/rooms/${encodeURIComponent(id)}/operations/${encodeURIComponent(summary.id)}`,
                    )
                  ).operation;
                  if (
                    sceneLifetime.current !== id ||
                    heldRecovery.current !== held ||
                    legacyReviewGeneration.current !== generation
                  )
                    return;
                  if (
                    !latest ||
                    latest.id !== summary.id ||
                    latest.attemptId !== summary.attemptId ||
                    latest.status !== summary.status
                  )
                    throw new Error("The saved action changed again. Review it before continuing.");
                }
                if (latest && !["contact", "fulfill"].includes(latest.input?.mode ?? ""))
                  throw new Error(
                    "A different saved action needs attention. Review its Scene error before continuing.",
                  );
                setRoom(currentRoom(session));
                setLegacyRecovery(
                  latest && ["contact", "fulfill"].includes(latest.input?.mode ?? "")
                    ? { sceneId: id, operation: latest }
                    : null,
                );
                setRoomError("");
              } catch (cause) {
                if (
                  sceneLifetime.current === id &&
                  heldRecovery.current === held &&
                  legacyReviewGeneration.current === generation
                )
                  setRoomError(messageFrom(cause, "The saved action could not be checked."));
              } finally {
                if (legacyReviewGeneration.current === generation) {
                  legacyReviewPending.current = false;
                  if (sceneLifetime.current === id) setLegacyReviewBusy(false);
                }
              }
            })();
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
          busy={roomBusy || legacyReviewBusy || controller.replyPending || room.operation?.status === "running"}
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
            if (
              room.id &&
              (room.operation?.status === "interrupted" ||
                (room.operation?.kind === "greet" && room.operation.status === "complete" && room.operation.error))
            )
              void retrySavedScene();
            else if (room.id) void greetRoom(room.id);
            else {
              const place = snapshot?.settings.venues.find((candidate) => candidate.id === room.placeId);
              if (place) void openRoom(place);
            }
          }}
          onContinueWithoutGreeting={() => {
            if (room.id) void continueRoomWithoutGreeting(room.id);
          }}
          onUseMailbox={() => setMailboxOpen(true)}
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
