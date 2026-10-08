import type { VillageVenueClass } from "../../domain/models/world.js";
import { badRequest, statusCodeOf } from "../../domain/rules/errors.js";
import { MAX_LOCATION_IMAGE_BASE64_LENGTH } from "../../domain/rules/image-limits.js";
import { MAX_SUBMISSION_ID_LENGTH, MAX_TOWN_MAP_IMAGE_LENGTH } from "../../domain/rules/prompt-preset.js";
import { VENUE_CLASSES } from "../../domain/rules/venue-model.js";
import { villagesLogger } from "../engine/runtime-host.js";
import { runtimeDebug } from "../observability/runtime-debug.js";
import { venueRefusal } from "../operations/operation-context.js";
import type { FastifyReply, FastifyRequest } from "fastify";

export function readCharacterId(value: unknown): string {
  const characterId = typeof value === "string" ? value.trim() : "";
  if (characterId.length === 0) throw badRequest("A character id is required.");
  return characterId;
}
export function readVenueId(value: unknown): string {
  const venueId = typeof value === "string" ? value.trim() : "";
  if (venueId.length === 0) throw badRequest("A place id is required.");
  return venueId;
}
export function readVenueSpaceClass(value: unknown): VillageVenueClass | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !VENUE_CLASSES.includes(value as VillageVenueClass))
    throw badRequest("Choose a valid Venue Class space.");
  return value as VillageVenueClass;
}
export function readChatId(value: unknown): string {
  const chatId = typeof value === "string" ? value.trim() : "";
  if (chatId.length === 0) throw badRequest("A chat id is required.");
  return chatId;
}
export function readMessage(value: unknown): string {
  const message = typeof value === "string" ? value.trim() : "";
  if (message.length === 0) throw badRequest("Write something before sending it.");
  if (message.length > 4000) {
    throw badRequest("A line can be at most 4000 characters.");
  }
  return message;
}
export function readSceneRevision(value: unknown): number {
  if (!Number.isSafeInteger(value) || Number(value) < 0)
    throw venueRefusal("SCENE_STALE", "Refresh the scene before sending. Your draft is preserved.");
  return Number(value);
}
export function readSubmissionId(value: unknown): string {
  const submissionId = typeof value === "string" ? value.trim() : "";
  if (submissionId.length === 0 || submissionId.length > MAX_SUBMISSION_ID_LENGTH) {
    throw badRequest(`A submission id must be between 1 and ${MAX_SUBMISSION_ID_LENGTH} characters.`);
  }
  return submissionId;
}
export function readPlaceId(value: unknown): string {
  const placeId = typeof value === "string" ? value.trim() : "";
  if (placeId.length === 0) throw badRequest("A place is required.");
  return placeId;
}
export function fail(reply: FastifyReply, error: unknown, context: string) {
  runtimeDebug("route exception", {
    context,
    message: String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
  const statusCode = statusCodeOf(error);
  const message = error instanceof Error ? error.message : "The village could not do that.";
  if (statusCode >= 500) villagesLogger().error(error, "[villages] %s failed", context);
  return reply.code(statusCode).send({ error: message, code: (error as { code?: string })?.code });
}
export type CharacterParams = { characterId: string };
export type VenueTurnBody = {
  sessionId?: unknown;
  message?: unknown;
  mode?: unknown;
  targetId?: unknown;
  contact?: { kind?: unknown; boundaryZoneId?: unknown; delivery?: unknown; deviceFeatureId?: unknown };
  submissionId?: unknown;
  expectedSceneRevision?: unknown;
  retryOfAttemptId?: string;
  replaceOfOperationId?: string;
};
export const SETTINGS_BODY_LIMIT = MAX_TOWN_MAP_IMAGE_LENGTH + 64 * 1024;
export const VENUE_IMAGE_BODY_LIMIT = MAX_LOCATION_IMAGE_BASE64_LENGTH + 64 * 1024;
export type VillageRouteHandler = (request: FastifyRequest, reply: FastifyReply) => unknown;
