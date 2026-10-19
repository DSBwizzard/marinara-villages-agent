import { extractModelJsonObject, modelJsonWithinBounds } from "./json-reply.js";
import type { VenueSubmission } from "../models/scene-model.js";
import { asRecord } from "./coerce.js";
import { badGateway } from "./errors.js";
import { parseSceneObject } from "./scene-json-syntax.js";

/** Model wire format only. Saved evidence and public Scene representations do not change. */
export const SCENE_WRITING_CONTRACT = 3;

const EFFECT_FIELDS = ["memoryChanges", "relationshipChanges", "wishChanges", "projectSpeech", "interpretationRouting"];

/** Canonical decimal strings name current segments only when no supplied saved ID conflicts. */
export function normalizeSceneEffectReferences(raw: Record<string, unknown>, earlierIds: string[] = []) {
  const result = structuredClone(raw);
  const segments = Array.isArray(result.segments) ? result.segments : [];
  const reference = (value: unknown) =>
    typeof value === "string" &&
    /^(0|[1-9]\d*)$/u.test(value) &&
    !earlierIds.includes(value) &&
    Number.isSafeInteger(Number(value)) &&
    Number(value) < segments.length
      ? Number(value)
      : value;
  const rows = (values: unknown, key: string) => {
    if (Array.isArray(values))
      for (const value of values) {
        const row = asRecord(value);
        if (Array.isArray(row[key])) row[key] = row[key].map(reference);
      }
  };
  rows(result.memoryChanges, "evidence");
  rows(result.wishChanges, "evidence");
  const relationships = asRecord(result.relationshipChanges);
  for (const key of ["changes", "permissions", "disclosures"]) rows(relationships[key], "lineIds");
  return result;
}

/** A finished reply sometimes closes its core before appending effect members.
 * Remove exactly that extra brace, never values, missing closers or competing objects.
 */
function parsePrematureEffectBoundary(text: string): Record<string, unknown> | null {
  if (!text.startsWith("{")) return null;
  let depth = 0,
    quoted = false,
    escaped = false;
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') quoted = false;
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === "{") depth++;
    else if (char === "}" && --depth === 0) {
      const core = parseSceneObject(text.slice(0, index + 1));
      if (
        !core ||
        Object.keys(core).length !== 2 ||
        !Object.hasOwn(core, "playerSpeechCapture") ||
        !Object.hasOwn(core, "segments") ||
        !Array.isArray(core.segments) ||
        !/^\s*,\s*"/u.test(text.slice(index + 1))
      )
        return null;
      // Strict whole-object parsing also rejects duplicate keys at every depth.
      const combined = parseSceneObject(text.slice(0, index) + text.slice(index + 1));
      if (!combined) return null;
      const tail = Object.keys(combined).filter((key) => !Object.hasOwn(core, key));
      return tail.length && tail.every((key) => EFFECT_FIELDS.includes(key) || key === "residentActions")
        ? combined
        : null;
    }
  }
  return null;
}

export function completeSceneObject(content: string, finishReason?: string): Record<string, unknown> | null {
  if (!modelJsonWithinBounds(content)) return null;
  if (finishReason !== "stop" && finishReason !== "end_turn") return null;
  const text = content
    .trim()
    .replace(/^```(?:json)?\s*\n/u, "")
    .replace(/\n```$/u, "");
  if (!text.startsWith("{") || !text.endsWith("}")) return null;
  return extractModelJsonObject({ content: text, finishReason }) ?? parsePrematureEffectBoundary(text);
}

/** Only a complete current-contract response may omit optional metadata. Never repair a supplied value. */
export function normalizeSparseSceneReply(raw: Record<string, unknown>): Record<string, unknown> {
  const result = structuredClone(raw);
  for (const key of ["wishChanges", "memoryChanges"])
    if (Object.hasOwn(result, key) && !Array.isArray(result[key]))
      throw badGateway("The Scene reply supplied malformed effects. Your draft is preserved.");
  if (Object.hasOwn(result, "relationshipChanges")) {
    const value = result.relationshipChanges;
    if (
      !value ||
      typeof value !== "object" ||
      Array.isArray(value) ||
      Object.entries(value).some(
        ([key, rows]) => !["changes", "permissions", "disclosures"].includes(key) || !Array.isArray(rows),
      )
    )
      throw badGateway("The Scene reply supplied malformed relationships. Your draft is preserved.");
  }
  for (const key of ["wishChanges", "memoryChanges"]) if (!Object.hasOwn(result, key)) result[key] = [];
  if (!Object.hasOwn(result, "relationshipChanges"))
    result.relationshipChanges = { changes: [], permissions: [], disclosures: [] };
  else if (
    result.relationshipChanges &&
    typeof result.relationshipChanges === "object" &&
    !Array.isArray(result.relationshipChanges)
  ) {
    const relationships = asRecord(result.relationshipChanges);
    for (const key of ["changes", "permissions", "disclosures"])
      if (!Object.hasOwn(relationships, key)) relationships[key] = [];
  }
  const segments = Array.isArray(result.segments) ? result.segments.map(asRecord) : [];
  for (const line of segments) if (!Object.hasOwn(line, "kind")) line.kind = line.speakerId ? "dialogue" : "narration";
  // Legacy kind:side is an ordinary aside, never a whisper. Accept its misplaced
  // delivery alias only with explicit aside presentation and no conflicting channel.
  for (const line of segments) {
    const ordinaryAside =
      line.delivery === "aside" || (line.delivery === "side" && line.presentation === "aside" && line.loud !== true);
    if (
      ordinaryAside &&
      ["dialogue", "side"].includes(String(line.kind)) &&
      (line.presentation === undefined || line.presentation === "aside") &&
      line.targetId === undefined
    ) {
      line.delivery = "ordinary";
      line.presentation = "aside";
    }
  }
  const source = (value: unknown, speech = true): Record<string, unknown> => {
    if (!Number.isSafeInteger(value) || Number(value) < 0 || !segments[Number(value)])
      throw badGateway("The Scene reply used an invalid source reference. Your draft is preserved.");
    const line = segments[Number(value)]!;
    const dialogue = line.kind === "dialogue" || line.kind === "side" || line.kind === "whisper";
    if (
      (speech && !dialogue) ||
      (!speech && line.kind !== "narration") ||
      typeof line.text !== "string" ||
      !line.text.trim()
    )
      throw badGateway("The Scene reply cited an incompatible source. Your draft is preserved.");
    return line;
  };
  // Full source lines preserve conditions, negation and qualifications. Existing validators still own authority.
  const speechSignal = (value: unknown) => {
    const row = asRecord(value);
    if (!Object.hasOwn(row, "source")) return value;
    const line = source(row.source);
    if (Object.hasOwn(row, "quote") || (row.speakerId !== undefined && row.speakerId !== line.speakerId))
      throw badGateway("The Scene reply used conflicting source fields. Your draft is preserved.");
    const { source: _source, ...rest } = row;
    return { ...rest, speakerId: line.speakerId, quote: line.text };
  };
  for (const key of [
    "invitation",
    "residenceRequest",
    "residenceDecision",
    "upgradeRequest",
    "venueRequest",
    "editApproval",
    "sceneEnded",
  ])
    if (result[key] !== undefined) result[key] = speechSignal(result[key]);
  if (Array.isArray(result.departures)) result.departures = result.departures.map(speechSignal);
  if (Array.isArray(result.contactMoves))
    result.contactMoves = result.contactMoves.map((value) => {
      const row = asRecord(value);
      if (row.quote !== undefined || row.segment === undefined) return value;
      return { ...row, quote: source(row.segment, false).text };
    });
  if (Array.isArray(result.projectSpeech))
    result.projectSpeech = result.projectSpeech.map((value) => {
      const row = asRecord(value);
      if (!Array.isArray(row.citations)) return value;
      return {
        ...row,
        citations: row.citations.map((value) => {
          const citation = asRecord(value);
          if (citation.quote !== undefined) return value;
          const line = source(citation.segment);
          if (line.speakerId !== row.speakerId)
            throw badGateway("The Scene reply cited another speaker's project statement. Your draft is preserved.");
          if ((line.text as string).length > 1200)
            throw badGateway(
              "A Project source exceeds its citation limit. Use an explicit supported citation. Your draft is preserved.",
            );
          return { ...citation, quote: line.text };
        }),
      };
    });
  const disclosures = asRecord(result.relationshipChanges).disclosures;
  if (Array.isArray(disclosures))
    asRecord(result.relationshipChanges).disclosures = disclosures.map((value) => {
      const row = asRecord(value);
      if (!Object.hasOwn(row, "source")) return value;
      const line = source(row.source);
      if (
        Object.hasOwn(row, "text") ||
        Object.hasOwn(row, "lineIds") ||
        (row.fromId !== undefined && row.fromId !== line.speakerId)
      )
        throw badGateway("The Scene reply used conflicting disclosure sources. Your draft is preserved.");
      if ((line.text as string).length > 320)
        throw badGateway(
          "A disclosure source exceeds its saved text limit. Use a supported summary with lineIds. Your draft is preserved.",
        );
      const { source: index, ...rest } = row;
      return { ...rest, fromId: line.speakerId, toId: row.toId ?? "player", text: line.text, lineIds: [index] };
    });
  return result;
}

/** Core metadata stays strict. Each noncritical effect retains its own failed payload. */
export function normalizeRecoverableSceneReply(raw: Record<string, unknown>) {
  const core = structuredClone(raw);
  for (const key of EFFECT_FIELDS) delete core[key];
  const result = normalizeSparseSceneReply(core);
  const failures: NonNullable<VenueSubmission["effectFailures"]> = {};
  for (const [domain, keys] of Object.entries({
    memories: ["memoryChanges"],
    relationships: ["relationshipChanges"],
    wishes: ["wishChanges"],
    projects: ["projectSpeech", "interpretationRouting"],
  })) {
    const supplied = Object.fromEntries(keys.filter((key) => Object.hasOwn(raw, key)).map((key) => [key, raw[key]]));
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
                !["approval", "builder", "requirements"].includes(String(row.kind)) ||
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
      const normalized = normalizeSparseSceneReply({ ...core, ...supplied });
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
            const flag = ["ordinary", "disclosed"].find(
              (key) => Object.hasOwn(row, key) && typeof row[key] !== "boolean",
            );
            if (flag) malformedDetail = `${path}[${index}].${flag} must be a boolean`;
            else return false;
          } else return false;
          return true;
        });
      };
      if (
        domain === "memories" &&
        malformed(
          normalized.memoryChanges,
          ["kind", "text", "category"],
          ["subjectCharacterIds", "knownByCharacterIds", "evidence"],
        )
      )
        throw new Error("Malformed memory proposal: " + malformedDetail);
      if (domain === "wishes" && malformed(normalized.wishChanges, ["actorId", "wishId", "intent"], ["evidence"]))
        throw new Error("Malformed Wish proposal: " + malformedDetail);
      if (domain === "relationships") {
        const relationship = asRecord(normalized.relationshipChanges);
        if (
          malformed(
            relationship.changes,
            ["fromId", "toId", "dimension", "strength", "direction", "reason"],
            ["lineIds"],
            "changes",
          ) ||
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
