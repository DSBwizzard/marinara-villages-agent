import type { VenueRecordEvent, VenueScene } from "../models/scene-model.js";
import { asRecord, asTrimmedString } from "./coerce.js";
import { deriveVillageMoment } from "./village-clock.js";
import { villageLighting } from "../../../shared/helpers/village-lighting.js";
import { readLoreUse } from "../../../shared/helpers/lore.js";
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
    unresolved: (Array.isArray(row.unresolved) ? row.unresolved : []).map((value) => {
      const issue = asRecord(value);
      return {
        submissionId: issue.submissionId,
        status: issue.status,
        at: issue.at,
        diagnosticId: issue.diagnosticId,
        reason: issue.reason,
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
function unpublishedLines(submissions: unknown[]) {
  return new Set(
    submissions.flatMap((value) => {
      const turn = asRecord(value);
      return !sceneTurnPublished(turn) && Array.isArray(turn.replyLineIds) ? (turn.replyLineIds as string[]) : [];
    }),
  );
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
export function publicSceneHistoryProjection(scene: VenueScene) {
  const hidden = unpublishedLines(scene.submissions);
  return {
    positions: scene.lines.flatMap((line, position) => (!hidden.has(line.id) && publicLine(line) ? [position] : [])),
    privateHearing: true,
  };
}
export function scenePresenceNotices(scene: VenueScene): VenueRecordEvent[] {
  return publicSceneHistoryProjection(scene).positions.flatMap((position) => {
    const line = scene.lines[position];
    return line.presenceChange
      ? [{ id: "presence:" + scene.id + ":" + line.id, kind: "venue" as const, text: line.content }]
      : [];
  });
}
export function publicSceneHistoryHearing(_value: unknown) {
  return true;
}
export function sameSceneHistoryTurnPolicy(before: unknown, after: unknown) {
  const policy = (value: unknown) => {
    const turn = asRecord(value);
    return [sceneTurnPublished(turn), turn.replyLineIds];
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
  "memoryMode",
  "liveSceneVersion",
] as const;
function authority(scene: VenueScene) {
  const facts = scene.continuity?.facts;
  const visible = new Set(scene.activeIds);
  return {
    ...Object.fromEntries(sceneFields.filter((key) => scene[key] !== undefined).map((key) => [key, scene[key]])),
    version: 1 as const,
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

/** Explicit public fields: the private fit, sources, native authority and purchased proposals never cross this boundary. */
export function publicSceneResponse<T>(value: T, visibleIds?: Set<string>, _privateHearing = true): T {
  if (Array.isArray(value))
    return value.flatMap((line) => {
      const view = publicLine(line, visibleIds);
      return view ? [view] : [];
    }) as T;
  const row = asRecord(value);
  if (Array.isArray(row.lines) && Array.isArray(row.submissions)) {
    const scene = row as VenueScene,
      hidden = unpublishedLines(scene.submissions),
      visible = new Set(scene.activeIds ?? []);
    return {
      ...authority(scene),
      lines: scene.lines
        .filter((line) => !hidden.has(line.id))
        .flatMap((line) => {
          const view = publicLine(line, visible);
          return view ? [view] : [];
        }),
      submissions: scene.submissions.map((turn) => ({
        id: turn.id,
        message: turn.message,
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
