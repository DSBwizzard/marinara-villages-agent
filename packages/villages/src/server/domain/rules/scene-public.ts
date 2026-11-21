import { contactPosition } from "./venue-contact.js";
import type { VenueRecordEvent, VenueScene, VenueSubmission } from "../models/scene-model.js";
import { asRecord, asTrimmedString } from "./coerce.js";
import { deriveVillageMoment } from "./village-clock.js";
import { villageLighting } from "../../../shared/helpers/village-lighting.js";
import { readLoreUse } from "../../../shared/helpers/lore.js";
import { conflict } from "./errors.js";
import { sceneFailureDiagnostic } from "../../../shared/contracts/scene-failure-diagnostic.js";
import { findLocation } from "./places.js";
/** The ordinary change feed carries visible notices and recovery controls, never owner diagnostics. */
export function publicSceneChanges(value: unknown) {
  const row = asRecord(value);
  const notices = (value: unknown) =>
    (Array.isArray(value) ? value : []).map((value) => {
      const notice = asRecord(value),
        wish = asRecord(notice.wishUpdate);
      return {
        id: notice.id,
        kind: notice.kind,
        text: notice.text,
        detail: notice.detail,
        ...(notice.wishUpdate ? { wishUpdate: { actorId: wish.actorId, wishId: wish.wishId, state: wish.state } } : {}),
      };
    });
  const summary = asRecord(row.processingSummary);
  return {
    sceneId: row.sceneId,
    changes: (Array.isArray(row.changes) ? row.changes : []).map((value) => {
      const change = asRecord(value);
      return { submissionId: change.submissionId, at: change.at, notices: notices(change.notices) };
    }),
    notices: notices(row.notices),
    dismissedNoticeIds: row.dismissedNoticeIds,
    hiddenWishNoticeIds: row.hiddenWishNoticeIds,
    unresolved: (Array.isArray(row.unresolved) ? row.unresolved : []).map((value) => {
      const issue = asRecord(value);
      return {
        submissionId: issue.submissionId,
        status: issue.status,
        at: issue.at,
        diagnosticId: issue.diagnosticId,
        reason: issue.reason,
        diagnostic: sceneFailureDiagnostic(issue.diagnostic),
      };
    }),
    processingSummary: { pending: summary.pending, failed: summary.failed, rejected: summary.rejected },
    backgroundChecks: (Array.isArray(row.backgroundChecks) ? row.backgroundChecks : []).map((value) => ({
      status: asRecord(value).status,
    })),
    activeRequest: { status: asRecord(row.activeRequest).status },
    nextCursor: row.nextCursor,
    hasMore: row.hasMore,
  };
}

export function sceneTurnPublished(value: unknown) {
  return asRecord(asRecord(value).acceptance).status === "applied";
}
export function sceneTurnNotices(turn?: VenueSubmission): VenueRecordEvent[] {
  return turn?.acceptance.status === "applied" ? (turn.recordEvents ?? []) : [];
}
export function sceneTravelOffer(scene: VenueScene) {
  if (scene.status !== "active") return undefined;
  return scene.submissions
    .findLast((turn) => sceneTurnNotices(turn).some((event) => event.travel))
    ?.recordEvents?.findLast((event) => event.travel);
}
function unpublishedLines(submissions: unknown[]) {
  return new Set(
    submissions.flatMap((value) => {
      const turn = asRecord(value);
      return !sceneTurnPublished(turn) && Array.isArray(turn.replyLineIds) ? (turn.replyLineIds as string[]) : [];
    }),
  );
}
function sceneLineVisibility(submissions: VenueSubmission[]) {
  const unpublished = unpublishedLines(submissions),
    published = new Set(submissions.filter(sceneTurnPublished).map((turn) => turn.id));
  return (line: VenueScene["lines"][number]) =>
    !unpublished.has(line.id) && (line.kind !== "input" || published.has(line.inputOf ?? ""));
}
function publicLine(value: unknown, visible?: Set<string>) {
  const line = asRecord(value),
    sound = asRecord(line.soundOnly);
  if (
    line.role === "user" &&
    line.kind === "input" &&
    typeof line.inputOf === "string" &&
    line.speakerId === "player" &&
    Array.isArray(line.heardBy) &&
    line.heardBy.length === 0
  )
    return {
      id: line.id,
      inputOf: line.inputOf,
      at: line.at,
      kind: "input",
      role: "user",
      speakerId: "player",
      name: line.name,
      content: line.content,
    };
  if (line.role !== "assistant") return undefined;
  if (line.contactHidden === true || !Array.isArray(line.heardBy) || !line.heardBy.includes("player")) {
    return sound.player === true && typeof sound.text === "string"
      ? {
          id: line.id,
          at: line.at,
          kind: "narration",
          role: "assistant",
          speakerId: "__venue_scene__",
          name: "Narration",
          content: sound.text,
        }
      : undefined;
  }
  const fields = [
    "id",
    "at",
    "kind",
    "role",
    "speakerId",
    "name",
    "content",
    "delivery",
    "presentation",
    "targetId",
    "asideFor",
    "viaDoorway",
    "presenceChange",
  ];
  return {
    ...Object.fromEntries(fields.filter((key) => line[key] !== undefined).map((key) => [key, line[key]])),
    ...(Array.isArray(line.staging)
      ? { staging: line.staging.filter((cue) => !visible || visible.has(asTrimmedString(asRecord(cue).characterId))) }
      : {}),
  };
}
export function publicSceneHistoryPositions(scene: VenueScene) {
  const visible = sceneLineVisibility(scene.submissions);
  return scene.lines.flatMap((line, position) => (visible(line) && publicLine(line) ? [position] : []));
}
export function scenePresenceNotices(scene: VenueScene): VenueRecordEvent[] {
  const unpublished = unpublishedLines(scene.submissions);
  return scene.lines.flatMap((line) => {
    if (!line.presenceChange || unpublished.has(line.id)) return [];
    const projected = publicLine(line);
    return projected && "presenceChange" in projected && projected.presenceChange === true
      ? [{ id: "presence:" + scene.id + ":" + line.id, kind: "venue" as const, text: line.content }]
      : [];
  });
}
export function sameSceneHistoryTurnPolicy(before: unknown, after: unknown) {
  const policy = (value: unknown) => {
    const turn = asRecord(value);
    return [turn.id, sceneTurnPublished(turn), turn.replyLineIds];
  };
  return JSON.stringify(policy(before)) === JSON.stringify(policy(after));
}
export function sceneProcessingSummary(scene: VenueScene) {
  return {
    pending: scene.submissions.filter((turn) => turn.acceptance.status === "pending").length,
    failed: scene.submissions.filter((turn) => turn.acceptance.status === "held").length,
    rejected: scene.submissions.reduce((count, turn) => count + turn.acceptance.rejected.length, 0),
  };
}
const sceneFields = [
  "id",
  "placeId",
  "placeName",
  "spaceClass",
  "zoneId",
  "area",
  "privateOwnerId",
  "privateAccessOwnerId",
  "startedAt",
  "endedAt",
  "lastActivityAt",
  "endReason",
  "status",
  "sceneRevision",
] as const;
function authority(scene: VenueScene) {
  if (scene.pendingAccessClaim) throw conflict("That Scene is still settling its entry invitation.");
  const arrival =
    scene.status !== "closed" &&
    scene.lines.findLast((line) => line.id.startsWith("arrival-") && line.heardBy.includes("player"));
  const facts = scene.continuity?.facts;
  const visible = new Set(scene.activeIds);
  const travel = sceneTravelOffer(scene);
  const destination = travel?.travel;
  return {
    ...Object.fromEntries(sceneFields.filter((key) => scene[key] !== undefined).map((key) => [key, scene[key]])),
    ...(arrival && arrival.zoneId === scene.zoneId ? { zoneArrivalId: arrival.id } : {}),
    version: 1 as const,
    ...(scene.visitorIntroduction ? { visitorIntroduction: true as const } : {}),
    ...(scene.trespass?.zoneId === scene.zoneId && scene.trespass ? { trespassing: true as const } : {}),
    ...(scene.trespassReaction &&
    scene.status === "active" &&
    (!scene.operation ||
      (scene.operation.status === "complete" &&
        !scene.operation.error &&
        scene.operation.id !== scene.trespassReaction.id)) &&
    !scene.submissions.some((row) => row.acceptance.status === "pending" || row.acceptance.status === "held")
      ? { trespassReactionId: scene.trespassReaction.id }
      : {}),
    movementCompanions: (scene.movementAgreements ?? []).flatMap((row) => {
      const person = scene.sceneAttendance?.occupants.find((actor) => actor.characterId === row.actorId);
      return person && row.from === scene.zoneId && contactPosition(scene, row.actorId) === row.from
        ? [
            {
              id: row.actorId,
              name: person.name,
              zoneId: row.zoneId,
              ...(row.trespass ? { trespass: true as const } : {}),
            },
          ]
        : [];
    }),
    ...(scene.status === "opening" && scene.visitEvent ? { visitEventOpening: true as const } : {}),
    ...(travel && destination
      ? {
          travel: {
            id: travel.id,
            label: /^(Go with |Go to )/.test(destination.label)
              ? (findLocation(facts, destination.venueId)?.name ?? "Destination")
              : destination.label,
          },
        }
      : {}),
    activeIds: [...scene.activeIds],
    participants: scene.participants
      .filter((person) => visible.has(person.characterId))
      .map(({ characterId, name, doing }) => ({ characterId, name, doing })),
    doorwayContacts: (scene.doorwayContacts ?? []).map(({ characterId, playerZoneId, delivery }) => ({
      characterId,
      playerZoneId,
      delivery,
    })),
    ...(facts
      ? {
          capturedContext: true,
          playerName: facts.playerPersonaName || facts.playerName || "You",
          currentTime: (() => {
            const moment = deriveVillageMoment({
              foundedAt: facts.foundedAt,
              seed: facts.seed,
              timeZone: facts.timeZone || undefined,
              now: new Date(scene.continuity!.capturedAt),
            });
            return moment.weekday + ", " + moment.dateLabel + " · " + moment.localTime;
          })(),
          lighting:
            villageLighting(scene.continuity!.capturedAt, facts.timeZone || undefined) === "night" ? "night" : "day",
        }
      : {}),
    connectionMap: (scene.sceneAttendance?.layout ?? []).map(({ id, connectedTo }) => ({ id, connectedTo })),
    processingSummary: sceneProcessingSummary(scene),
    lore: readLoreUse(scene.submissions.filter(sceneTurnPublished).at(-1)?.lore),
    ...(scene.submissions.length
      ? {
          latestTurn: {
            id: scene.submissions.at(-1)!.id,
            at: scene.submissions.at(-1)!.at,
            published: sceneTurnPublished(scene.submissions.at(-1)),
          },
        }
      : {}),
  };
}
export function publicSceneAuthority(scene: VenueScene) {
  return authority(scene);
}

/** Arrival supersedes earlier replies; held and private lines never enter the live card. */
export function publicSceneLiveReply(scene: VenueScene) {
  const visible = sceneLineVisibility(scene.submissions);
  const lines = scene.lines.filter(visible);
  if (scene.visitorIntroduction) {
    const projected = publicSceneResponse(lines, new Set(scene.participants.map((person) => person.characterId)));
    return { id: projected.length ? scene.id + ":visitor-introduction" : "", lines: projected };
  }
  const arrival = lines.findLastIndex((line) => line.id.startsWith("arrival-") && !!publicLine(line));
  const tail = lines.findLast(
    (line, index) => index >= arrival && line.role === "assistant" && !line.presenceChange && !!publicLine(line),
  );
  if (!tail) return { id: "", lines: [] };
  const publicIds = new Set(
    lines
      .slice(Math.max(0, arrival))
      .filter((line) => !!publicLine(line))
      .map((line) => line.id),
  );
  const turn = scene.submissions.findLast(
    (turn) => sceneTurnPublished(turn) && turn.replyLineIds?.some((id) => publicIds.has(id)),
  );
  if (
    arrival < 0 &&
    turn &&
    ((turn.zoneIdAtTurn && scene.zoneId && turn.zoneIdAtTurn !== scene.zoneId) ||
      scene.navigationReceipts?.some(
        (receipt) =>
          receipt.originZoneId !== receipt.destinationZoneId && Date.parse(receipt.at) >= Date.parse(turn.at),
      ))
  )
    return { id: "", lines: [] };
  const ids = new Set(turn?.replyLineIds ?? [arrival >= 0 ? lines[arrival].id : tail.id]);
  const projected = publicSceneResponse(
    lines.filter((line, index) => index >= arrival && ids.has(line.id)),
    new Set(scene.participants.map((person) => person.characterId)),
  );
  return {
    id: turn?.episodeId ?? projected[0]?.id ?? "",
    lines: projected,
  };
}

/** Explicit public fields: the private fit, sources, native authority and purchased proposals never cross this boundary. */
export function publicSceneResponse<T>(value: T, visibleIds?: Set<string>): T {
  if (Array.isArray(value))
    return value.flatMap((line) => {
      const view = publicLine(line, visibleIds);
      return view ? [view] : [];
    }) as T;
  const row = asRecord(value);
  if (Array.isArray(row.lines) && Array.isArray(row.submissions)) {
    const scene = row as VenueScene,
      visibleLine = sceneLineVisibility(scene.submissions),
      visible = new Set(scene.activeIds ?? []);
    return {
      ...authority(scene),
      lines: scene.lines.filter(visibleLine).flatMap((line) => {
        const view = publicLine(line, visible);
        return view ? [view] : [];
      }),
      submissions: scene.submissions.map((turn) => ({
        id: turn.id,
        ...(sceneTurnPublished(turn) ? { message: turn.message } : {}),
        mode: turn.mode,
        targetId: turn.targetId,
        at: turn.at,
        status: turn.acceptance.status,
        ...(sceneTurnPublished(turn) ? { replyLineIds: turn.replyLineIds } : {}),
      })),
    } as T;
  }
  return { ...(Object.hasOwn(row, "lore") ? { lore: readLoreUse(row.lore) } : {}) } as T;
}
