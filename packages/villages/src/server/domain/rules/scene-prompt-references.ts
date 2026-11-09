import { createHash } from "node:crypto";
import { badGateway } from "./errors.js";

const actorFields = new Set([
  "about",
  "speakerId",
  "actorId",
  "characterId",
  "controllerId",
  "visitorId",
  "ownerId",
  "fromId",
  "toId",
  "attributedTo",
  "sourceId",
  "targetId",
  "leadId",
  "issuerId",
  "accompaniedBy",
]);
const actorLists = new Set([
  "learners",
  "actorIds",
  "characterIds",
  "controllerIds",
  "managerIds",
  "visitorIds",
  "residentIds",
  "workerIds",
  "requiredIds",
  "householdIds",
  "affectedIds",
  "targetIds",
  "participants",
  "subjects",
  "heardBy",
  "sources",
  "localReach",
  "wordsReach",
  "raisedWordsReach",
  "muffledVoicesReach",
  "alertOnly",
  "residentRequestLocalIds",
]);
const actorRecords = new Set(["learners", "knowers", "intentions", "intentionRevisions", "names", "approvals"]);

/** Prose and non-person identities are never rewritten. */
export function mapScenePeople(value: unknown, references: Readonly<Record<string, string>>, parent = ""): unknown {
  const reference = (id: string) => (Object.hasOwn(references, id) ? references[id]! : id);
  if (Array.isArray(value)) return value.map((row) => mapScenePeople(row, references, parent));
  if (!value || typeof value !== "object") return value;
  const result = new Map<string, unknown>();
  for (const [key, item] of Object.entries(value)) {
    const mappedKey = actorRecords.has(parent) ? reference(key) : key;
    if (result.has(mappedKey)) throw badGateway("The Scene person references conflict. Your draft is preserved.");
    result.set(
      mappedKey,
      typeof item === "string" &&
        (actorFields.has(key) ||
          (key === "existingId" && parent === "npcIntroductions") ||
          (key === "id" && ["actors", "referenceActors", "supportingCandidates"].includes(parent)))
        ? reference(item)
        : actorLists.has(key) && Array.isArray(item)
          ? item.map((id) => (typeof id === "string" ? reference(id) : id))
          : mapScenePeople(item, references, key),
    );
  }
  return Object.fromEntries(result);
}

/** Content-derived references do not renumber earlier history when someone arrives. */
export function scenePersonReferences(ids: readonly string[]) {
  const references: Record<string, string> = {};
  for (const id of [...new Set(ids)].filter((id) => id && !["player", "__venue_scene__"].includes(id)).sort()) {
    const alias = "p" + createHash("sha256").update(id).digest("hex").slice(0, 8);
    if (ids.includes(alias) || (Object.hasOwn(references, alias) && references[alias] !== id))
      throw badGateway("The Scene person references conflict. No reply was requested.");
    references[alias] = id;
  }
  return references;
}

export function sceneAudienceReference(ids: readonly string[]) {
  return "w" + createHash("sha256").update(JSON.stringify(ids)).digest("hex").slice(0, 8);
}
