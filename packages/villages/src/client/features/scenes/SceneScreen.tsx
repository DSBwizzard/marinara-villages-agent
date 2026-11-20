import { useCallback, useEffect, useRef, useState } from "react";
import type { RoomOperation, SceneView } from "../../../shared/contracts/village.js";
import { messageFrom, request } from "../../shared/api.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { playerDisplayName, venuePictureOf } from "../../shared/presentation.js";
import { recordTurnTiming } from "../../shared/turn-timing.js";
import { SavedChangesDiagnostics } from "../settings/villages-saved-changes.js";
import type { SceneErrorItem } from "./scene-errors.js";
import { sceneErrorCause } from "./scene-error-message.js";
import { sceneFailure } from "./scene-error-report.js";
import { currentRoom, RoomPanel, sceneZoneLabel } from "./ScenePanel.js";
import type { SceneScreenController } from "./screen-contracts.js";
import { hasPublishedRoomSubmission } from "./villages-room-reading.js";
import { ModalDialog } from "../../shared/ModalDialog.js";
import { zoneAccessLabel } from "../../shared/zone-access.js";
import type { PlaceDetail } from "../../../shared/contracts/places.js";
import { useVillageLighting } from "../../shared/useVillageLighting.js";

const requestErrorIds = new Set(["room", "operation", "greeting"]);

export function SceneScreen({ controller }: { controller: SceneScreenController }) {
  const lighting = useVillageLighting(controller.snapshot?.village, "storybook");
  const [showPlace, setShowPlace] = useState(false);
  const displayedSubmissionId = controller.room?.latestTurn?.published ? controller.room.latestTurn.id : undefined;
  useEffect(() => {
    if (displayedSubmissionId && controller.room?.id)
      recordTurnTiming(controller.room.id, displayedSubmissionId, "displayed");
  }, [controller.room?.id, displayedSubmissionId]);
  const [reportedErrors, setReportedErrors] = useState<
    { sceneId: string; id: string; title: string; message: string }[]
  >([]);
  const sceneId = controller.room?.id;
  const sceneLifetime = useRef<string | undefined>(sceneId);
  const replyRetry = useRef<{ sceneId: string; pending: boolean } | null>(null);
  const [retryPending, setRetryPending] = useState(false);
  const [contactReviewBusy, setContactReviewBusy] = useState(false);
  const contactReviewPending = useRef(false);
  const contactReviewGeneration = useRef(0);
  const heldRecovery = useRef(controller.contactRecovery);
  heldRecovery.current = controller.contactRecovery;
  useEffect(() => {
    sceneLifetime.current = sceneId;
    contactReviewPending.current = false;
    contactReviewGeneration.current++;
    setContactReviewBusy(false);
    setRetryPending(false);
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
  const reportDiagnosticsError = useCallback(
    (message: string) => reportSettingsError("diagnostics", "Saved change diagnostics unavailable", message),
    [reportSettingsError],
  );
  const {
    closeRoom,
    composerEditVersionRef,
    continueRoomWithoutGreeting,
    debugDiscardEnabled,
    discardRoomDebug,
    dismissRoomNotice,
    goHome,
    greetRoom,
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
    roomDraft,
    roomEnded,
    roomError,
    roomErrorTrace,
    roomGreetingError,
    roomGreetingNotice,
    contactRecovery,
    setContactRecovery,
    roomNotices,
    roomOpen,
    roomSubmissionIdRef,
    roomUnresolvedChanges,
    sendRoom,
    setMailboxOpen,
    setRoom,
    setRoomBusy,
    setRoomDraft,
    setRoomError,
    openVenue,
    snapshot,
  } = controller;
  const sameFailedTurn =
    room?.operation?.kind === "turn" &&
    roomErrorTrace?.submissionId === room.operation.id &&
    (room.operation.status === "interrupted" || (room.operation.status === "complete" && !!room.operation.error));
  const liveVenue = snapshot?.settings.venues.find((venue) => venue.id === room?.placeId);
  async function changeReply() {
    const target = room.retryReply;
    const remembered = replyRetry.current;
    const pending = remembered?.pending && remembered.sceneId === room.id ? remembered : undefined;
    if (!room.id || !target || roomBusy || pending) return;
    const requestId = createVillagesClientId();
    const action = { sceneId: room.id, pending: true };
    replyRetry.current = action;
    setRoomBusy(true);
    setRetryPending(true);
    setRoomError("");
    const current = () => sceneLifetime.current === action.sceneId && replyRetry.current === action;
    let replaced = false;
    try {
      const result = await request<{ saved: boolean; replacedNoticeIds?: string[] }>("/rooms/retry", {
        method: "POST",
        body: JSON.stringify({ sessionId: room.id, token: target.token, requestId }),
      });
      replaced = result.saved;
      if (current() && result.replacedNoticeIds?.length)
        controller.setRoomNotices((events) => events.filter((event) => !result.replacedNoticeIds!.includes(event.id)));
    } catch (cause) {
      if (current()) setRoomError(messageFrom(cause, "Could not retry the reply."));
    }
    try {
      const active = await request<{ session: SceneView | null }>("/rooms/active");
      const scene = active.session;
      if (current() && scene?.id === room.id) {
        if (
          replaced &&
          scene.latestTurn?.id === room.latestTurn?.id &&
          scene.playback.version !== room.playback.version
        ) {
          const start = scene.retryStart;
          sceneReading.checkpoint.current.bookmark = start
            ? {
                scope: scene.playback.scope,
                sceneId: scene.id,
                lineId: start.id,
                paragraph: 0,
                momentIndex: start.index,
                anchorCursor: start.anchorCursor,
                atEnd: false,
                reveal: true,
              }
            : undefined;
          sceneReading.checkpoint.current.window = {
            ...scene.playback,
            lines: scene.lines,
            participants: scene.participants,
          };
        }
        setRoom(scene);
      }
    } catch (cause) {
      if (current()) setRoomError(messageFrom(cause, "Could not refresh the reply."));
    } finally {
      action.pending = false;
      if (current()) {
        setRoomBusy(false);
        setRetryPending(false);
      }
    }
  }

  return (
    <div className={`${ELEMENT_TAG}-root ${ELEMENT_TAG}-room-screen`} data-mobile={mobile ? "true" : "false"}>
      {room ? (
        <RoomPanel
          room={room}
          worldScope={snapshot?.worldScope ?? ""}
          sceneErrors={[
            ...[
              {
                id: "operation",
                trace:
                  sameFailedTurn ||
                  (roomErrorTrace &&
                    room.operation?.error &&
                    sceneErrorCause(roomError) === sceneErrorCause(room.operation.error))
                    ? roomErrorTrace
                    : undefined,
                title:
                  room.operation?.status === "interrupted"
                    ? room.operation.kind === "turn"
                      ? "Message failed"
                      : "Saved request interrupted"
                    : "Saved request failed",
                message:
                  room.operation?.error ||
                  (room.operation?.status === "interrupted"
                    ? room.operation.kind === "turn"
                      ? "Your message was interrupted."
                      : "The saved request was interrupted. Retry it when you are ready."
                    : ""),
                actions:
                  room.operation?.status === "interrupted" &&
                  room.operation.kind !== "turn" &&
                  room.status !== "opening" &&
                  room.operation.kind !== "retry" ? (
                    <button
                      type="button"
                      disabled={roomBusy || contactReviewBusy}
                      onClick={() => void retrySavedScene()}
                    >
                      Retry saved request
                    </button>
                  ) : undefined,
              },
              {
                id: "room",
                trace: roomErrorTrace,
                title: room.status === "opening" ? "Scene opening failed" : "Scene request failed",
                message: sameFailedTurn ? "" : roomError,
              },
              {
                id: "greeting",
                title: "Scene opening failed",
                message: roomGreetingError?.sessionId === room.id ? roomGreetingError.message : "",
              },
              ...reportedErrors
                .filter((entry) => entry.sceneId === room.id)
                .map(({ sceneId: _sceneId, ...entry }) => entry),
            ]
              .filter(
                (entry, index, all) =>
                  !!entry.message &&
                  (!requestErrorIds.has(entry.id) ||
                    all.findIndex(
                      (other) =>
                        requestErrorIds.has(other.id) &&
                        other.message &&
                        sceneErrorCause(other.message) === sceneErrorCause(entry.message!),
                    ) === index),
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
          picture={venuePictureOf(room.status === "closed" ? sceneVenues : (snapshot?.settings.venues ?? []), room)}
          draft={roomDraft}
          contactRecovery={contactRecovery?.sceneId === room.id ? contactRecovery : null}
          recoveryDestination={(() => {
            const input = contactRecovery?.sceneId === room.id ? contactRecovery.operation.input : undefined;
            const recipient = input?.targetId
              ? (room.participants.find((person) => person.characterId === input.targetId)?.name ?? "saved recipient")
              : "";
            if (!input) return recipient || "saved recipient";
            const zone = sceneVenues
              .find((venue) => venue.id === room.placeId)
              ?.zones?.find((entry) => entry.id === input.contact?.boundaryZoneId);
            return [zone ? sceneZoneLabel(zone) : "saved Zone", recipient].filter(Boolean).join(" · ");
          })()}
          onRetryContact={() => {
            if (contactRecovery?.sceneId === room.id) void retrySavedScene(contactRecovery);
          }}
          onReplaceContact={() => {
            if (contactRecovery?.sceneId === room.id) void sendRoom(contactRecovery);
          }}
          onReviewContact={() => {
            if (contactReviewPending.current || roomBusy || !contactRecovery) return;
            const id = room.id;
            const held = contactRecovery;
            contactReviewPending.current = true;
            const generation = ++contactReviewGeneration.current;
            setContactReviewBusy(true);
            void (async () => {
              try {
                const { session } = await request<{ session: SceneView | null }>("/rooms/active");
                if (
                  sceneLifetime.current !== id ||
                  heldRecovery.current !== held ||
                  contactReviewGeneration.current !== generation
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
                  !hasPublishedRoomSubmission(session, summary.id)
                ) {
                  latest = (
                    await request<{ operation: RoomOperation | null }>(
                      `/rooms/${encodeURIComponent(id)}/operations/${encodeURIComponent(summary.id)}`,
                    )
                  ).operation;
                  if (
                    sceneLifetime.current !== id ||
                    heldRecovery.current !== held ||
                    contactReviewGeneration.current !== generation
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
                if (latest && latest.input?.mode !== "contact")
                  throw new Error(
                    "A different saved action needs attention. Review its Scene error before continuing.",
                  );
                setRoom(currentRoom(session));
                setContactRecovery(
                  latest && latest.input?.mode === "contact" ? { sceneId: id, operation: latest } : null,
                );
                setRoomError("");
              } catch (cause) {
                if (
                  sceneLifetime.current === id &&
                  heldRecovery.current === held &&
                  contactReviewGeneration.current === generation
                )
                  setRoomError(sceneFailure(cause, "The saved action could not be checked.", "review"));
              } finally {
                if (contactReviewGeneration.current === generation) {
                  contactReviewPending.current = false;
                  if (sceneLifetime.current === id) setContactReviewBusy(false);
                }
              }
            })();
          }}
          movementZones={(() => {
            const venue = sceneVenues.find((entry) => entry.id === room.placeId);
            if (!venue) return [];
            return (venue.zones ?? []).map((zone) => ({
              id: zone.id,
              label: sceneZoneLabel(zone),
              connectedTo: zone.connectedTo ?? [],
              image: ((lighting === "night" && zone.dayNight ? zone.nightImage : null) ?? zone.image)?.url,
              allowed:
                !zone.closed && zone.accessView?.decision.allowed === true && zone.accessView.reachable !== false,
              status: zoneAccessLabel(zone, venue, true),
              canTrespass: !!zone.accessView?.canTrespass,
              companions: zone.accessView?.companions,
              automaticReactions: snapshot.settings.spontaneousEvents,
            }));
          })()}
          movementPositions={liveVenue?.zoneLayout}
          movementLighting={lighting === "night" ? "night" : "day"}
          onMovementTarget={(zoneId, trespass) => void moveRoom(zoneId, trespass)}
          onTravel={() => {
            if (!room.travel || roomBusy || contactReviewPending.current || sceneLifetime.current !== room.id) return;
            const source = room.id;
            contactReviewPending.current = true;
            setRoomBusy(true);
            setRoomError("");
            void request<{ session: SceneView }>("/rooms", {
              method: "POST",
              body: JSON.stringify({
                travel: { sourceId: source, offerId: room.travel.id },
                expectedSceneRevision: room.sceneRevision ?? 0,
              }),
              signal: AbortSignal.timeout(20000),
            })
              .then(({ session }) => {
                if (sceneLifetime.current !== source) return;
                roomSubmissionIdRef.current = null;
                contactReviewPending.current = false;
                setRoomBusy(false);
                setRoom(currentRoom(session));
                void loadSnapshot();
              })
              .catch((cause) => {
                if (sceneLifetime.current === source)
                  setRoomError(messageFrom(cause, "Could not use this invitation."));
              })
              .finally(() => {
                if (sceneLifetime.current !== source) return;
                contactReviewPending.current = false;
                setRoomBusy(false);
              });
          }}
          currentZoneLabel={sceneZoneLabel(
            sceneVenues.find((venue) => venue.id === room.placeId)?.zones?.find((zone) => zone.id === room.zoneId),
          )}
          busy={roomBusy || contactReviewBusy || room.operation?.status === "running"}
          error={
            roomError ||
            room.operation?.error ||
            (room.status === "opening" && roomGreetingError?.sessionId === room.id ? roomGreetingError.message : "")
          }
          greetingNotice={roomGreetingNotice}
          open={roomOpen}
          ended={roomEnded}
          playerName={room.playerName ?? playerDisplayName(snapshot)}
          playerPortrait={personaPortrait ?? undefined}
          portraits={portraits}
          sprites={Object.fromEntries(
            (snapshot?.villagers ?? []).map((villager) => [villager.characterId, villager.sprite]),
          )}
          onDraft={(value) => {
            composerEditVersionRef.current++;
            roomSubmissionIdRef.current = null;
            setRoomDraft(value);
          }}
          sendOnEnter={snapshot?.settings.sendOnEnter === true}
          onSend={() => void sendRoom()}
          onRetryReply={() => void changeReply()}
          retryPending={retryPending}
          onViewVenue={() => {
            const place = snapshot?.settings.venues.find((place) => place.id === room.placeId);
            if (place) openVenue(place);
            else setShowPlace(true);
            void loadSnapshot();
          }}
          onEnd={() => void closeRoom()}
          notices={roomNotices}
          onDismissNotice={dismissRoomNotice}
          onOpenWish={(actorId, wishId) => {
            openPerson({ actorId, wishId, section: "wishes", returnTo: "room" });
          }}
          unresolvedChanges={roomUnresolvedChanges}
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
              else
                void request<PlaceDetail>("/places/" + encodeURIComponent(room.placeId))
                  .then((detail) => {
                    if (sceneLifetime.current === room.id) void openRoom(detail.location);
                  })
                  .catch((cause) => setRoomError(sceneFailure(cause, "Could not reopen this Place.", "open")));
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
            room.id ? (
              <SavedChangesDiagnostics key={room.id} sceneId={room.id} api={request} onError={reportDiagnosticsError} />
            ) : undefined
          }
        />
      ) : (
        <button type="button" className={`${ELEMENT_TAG}-button`} onClick={goHome}>
          Back to village
        </button>
      )}
      {showPlace && room ? (
        <ModalDialog title={room.placeName} onClose={() => setShowPlace(false)} scrollBody>
          <div className="villages-founding-editor-body villages-places-directory">
            <p>{sceneVenues.find((place) => place.id === room.placeId)?.description}</p>
            <ul>
              {sceneVenues
                .find((place) => place.id === room.placeId)
                ?.zones?.map((zone) => (
                  <li key={zone.id}>
                    {zone.name}
                    {zone.seen ? <p>{zone.description}</p> : null}
                  </li>
                ))}
            </ul>
            <button
              type="button"
              onClick={() => {
                setShowPlace(false);
                goHome();
              }}
            >
              Map
            </button>
          </div>
        </ModalDialog>
      ) : null}
    </div>
  );
}
