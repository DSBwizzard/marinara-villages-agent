import { requireSceneExchange } from "./scene-submissions.js";
import type { VenueScene, VenueSubmission } from "../models/scene-model.js";
import { asRecord } from "./coerce.js";
import { conflict } from "./errors.js";
import { extractModelJsonObject, modelJsonWithinBounds } from "./json-reply.js";

/** Refuse an unsupported Scene before generation can replace a retained response. */
export function assertCurrentSceneGeneration(scene: VenueScene) {
  if (scene.version !== 4 || scene.semanticVersion !== 2 || !scene.villageSeed)
    throw conflict("Unsupported Scene format. Start a fresh Village.");
  for (const turn of scene.submissions) if (turn.at) requireSceneExchange(scene, turn);
}

const EFFECT_FIELDS = ["memoryChanges", "relationshipChanges", "wishChanges", "projectSpeech", "interpretationRouting"];

export function completeSceneObject(content: string, finishReason?: string): Record<string, unknown> | null {
  if (!modelJsonWithinBounds(content)) return null;
  if (finishReason !== "stop" && finishReason !== "end_turn") return null;
  const text = content
    .trim()
    .replace(/^```(?:json)?\s*\n/u, "")
    .replace(/\n```$/u, "");
  if (!text.startsWith("{") || !text.endsWith("}")) return null;
  return extractModelJsonObject({ content: text, finishReason });
}

/** Core metadata stays strict. Each noncritical effect retains its own failed payload. */
export function isolateSceneEffects(raw: Record<string, unknown>) {
  const core = structuredClone(raw);
  for (const key of EFFECT_FIELDS) delete core[key];
  const result = structuredClone(core);
  const failures: NonNullable<VenueSubmission["effectFailures"]> = {};
  for (const [domain, keys] of Object.entries({
    memories: ["memoryChanges"],
    relationships: ["relationshipChanges"],
    wishes: ["wishChanges"],
    projects: ["projectSpeech", "interpretationRouting"],
  })) {
    const supplied = Object.fromEntries(keys.filter((key) => Object.hasOwn(raw, key)).map((key) => [key, raw[key]]));
    if (!Object.keys(supplied).length) continue;
    try {
      if (domain === "projects" && Object.values(supplied).some((value) => !Array.isArray(value)))
        throw new Error("Malformed Project metadata");
      if (domain === "projects") {
        const speech = supplied.projectSpeech;
        if (
          Array.isArray(speech) &&
          (speech.length > 6 ||
            speech.some((value) => {
              const row = asRecord(value);
              return (
                typeof row.projectId !== "string" ||
                !row.projectId ||
                typeof row.speakerId !== "string" ||
                !row.speakerId ||
                !["approval", "builder", "withdrawal"].includes(String(row.kind)) ||
                !Array.isArray(row.citations) ||
                !row.citations.length ||
                row.citations.length > 12
              );
            }))
        )
          throw new Error("Malformed Project proposal");
        const routing = supplied.interpretationRouting;
        if (
          Array.isArray(routing) &&
          (routing.length > 24 ||
            routing.some((value) => {
              const row = asRecord(value);
              return (
                typeof row.actorId !== "string" ||
                !row.actorId ||
                row.domain !== "project" ||
                !["irrelevant", "potential", "uncertain"].includes(String(row.relevance)) ||
                !Array.isArray(row.targetIds) ||
                !Array.isArray(row.segments)
              );
            }))
        )
          throw new Error("Malformed Project routing");
      }
      const normalized: Record<string, unknown> = { ...core, ...supplied };
      let malformedDetail = "";
      const malformed = (rows: unknown, required: string[], arrays: string[], path = domain) => {
        if (!Array.isArray(rows) || rows.length > 16) {
          malformedDetail = path + " must be an array with at most 16 rows";
          return true;
        }
        return rows.some((value, index) => {
          const row = asRecord(value);
          const key = required.find((key) => typeof row[key] !== "string" || !row[key]);
          const array = arrays.find((key) => !Array.isArray(row[key]));
          if (key) malformedDetail = `${path}[${index}].${key} must be a nonempty string`;
          else if (array) malformedDetail = `${path}[${index}].${array} must be an array`;
          else if (path === "changes") {
            if (!Number.isInteger(row.expectedRevision) || Number(row.expectedRevision) < 0)
              malformedDetail = `${path}[${index}].expectedRevision must be a nonnegative integer`;
            else {
              const projection = ["sceneAfter", "liveAfter"].find((key) => {
                const value = asRecord(row[key]);
                return (
                  typeof value.connection !== "string" ||
                  typeof value.stance !== "string" ||
                  !["expectations", "concerns", "records"].every((field) => Array.isArray(value[field]))
                );
              });
              if (projection) malformedDetail = `${path}[${index}].${projection} must be a social projection`;
              else return false;
            }
          } else return false;
          return true;
        });
      };
      if (domain === "memories" && (!Array.isArray(normalized.memoryChanges) || normalized.memoryChanges.length > 16))
        throw new Error("Malformed memory proposal array");
      if (
        domain === "memories" &&
        (normalized.memoryChanges as unknown[]).some((row) => Object.hasOwn(asRecord(row), "rejectedEvent"))
      )
        throw new Error("The Memory event needs correction; its exact proposal is retained.");
      if (domain === "wishes" && malformed(normalized.wishChanges, ["actorId", "wishId", "intent"], ["evidence"]))
        throw new Error("Malformed Wish proposal: " + malformedDetail);
      if (domain === "relationships") {
        const relationship = asRecord(normalized.relationshipChanges);
        if (
          Object.keys(relationship).some((key) => !["changes", "permissions", "disclosures"].includes(key)) ||
          malformed(relationship.changes, ["fromId", "toId", "reason"], ["lineIds"], "changes") ||
          malformed(
            relationship.permissions,
            ["controllerId", "visitorId", "venueId", "zoneId", "action"],
            ["lineIds"],
            "permissions",
          ) ||
          malformed(relationship.disclosures, ["fromId", "toId", "text", "kind"], ["lineIds"], "disclosures")
        )
          throw new Error("Malformed relationship proposal: " + malformedDetail);
      }
      for (const key of keys) if (Object.hasOwn(normalized, key)) result[key] = normalized[key];
    } catch (error) {
      failures[domain as keyof typeof failures] = {
        kind: "metadata",
        message: String(error).slice(0, 500),
        proposal: supplied,
      };
      // No empty success: the persisted domain failure owns this payload until explicit retry.
      for (const key of keys) result[key] = undefined;
    }
  }
  return { raw: result, failures };
}
