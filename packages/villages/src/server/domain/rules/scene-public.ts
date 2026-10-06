import type { VenueScene } from "../models/scene-model.js";
import { asRecord, asTrimmedString } from "./coerce.js";
export function sceneProcessingSummary(scene: VenueScene) {
  const domains = scene.submissions.flatMap((turn) => (turn.processing ? Object.values(turn.processing.domains) : []));
  return {
    pending: domains.filter((domain) => domain.status === "pending").length,
    failed: domains.filter((domain) => domain.status === "failed").length,
    rejected: domains.filter((domain) => domain.status === "rejected").length,
  };
}
export function publicSceneResponse<T>(value: T, visibleIds?: Set<string>): T {
  if (Array.isArray(value))
    return value
      .filter((entry) => !(entry && typeof entry === "object" && entry.contactHidden === true))
      .map((entry) => publicSceneResponse(entry, visibleIds)) as T;
  if (!value || typeof value !== "object" || Object.getPrototypeOf(value) !== Object.prototype) return value;
  const row = value as Record<string, unknown>;
  const visible = Array.isArray(row.participants)
    ? new Set(row.participants.map((entry) => asTrimmedString(asRecord(entry).characterId)))
    : visibleIds;
  return Object.fromEntries(
    Object.entries(
      Array.isArray(row.lines) && Array.isArray(row.submissions)
        ? { ...row, processingSummary: sceneProcessingSummary(row as VenueScene) }
        : row,
    )
      .filter(
        ([key]) =>
          ![
            "responseDiagnostics",
            "failure",
            "sceneAttendance",
            "accompanying",
            "access",
            "accessEvents",
            "accessPreviousZones",
            "pendingAccessClaim",
            "contactGeneration",
            "contactEvidence",
            "contactHidden",
            "contactReport",
            "contactMoves",
            "contactRelay",
            "characterZoneId",
            "checkpoints",
            "attempts",
            "optionalAttempts",
            "wishInterpretationProof",
            "wishProposals",
            "wishContexts",
            "liveProposals",
            "interpretationHistory",
            "requestMetrics",
            "memoryChanges",
            "relationshipChanges",
            "earlierLineIds",
            "memoryVersions",
            "wishProposalError",
            "wishChanges",
            "snapshot",
          ].includes(key),
      )
      .map(([key, entry]) => [
        key,
        key === "processing" && entry
          ? {
              version: 1,
              domains: Object.fromEntries(
                Object.entries(asRecord(asRecord(entry).domains)).map(([domain, result]) => [
                  domain,
                  { status: asRecord(result).status },
                ]),
              ),
            }
          : visible && ["heardBy", "heardPlayerBy"].includes(key) && Array.isArray(entry)
            ? entry.filter((id) => visible.has(id))
            : key === "recollections" && visible && Array.isArray(entry)
              ? publicSceneResponse(
                  entry.filter((memory) => {
                    const row = asRecord(memory);
                    return ["subjectCharacterIds", "knownByCharacterIds"].every(
                      (field) =>
                        !Array.isArray(row[field]) ||
                        row[field].every((id: unknown) => typeof id === "string" && visible.has(id)),
                    );
                  }),
                  visible,
                )
              : key === "heardHistory" && visible && Array.isArray(entry)
                ? publicSceneResponse(
                    entry.filter((history) => visible.has(asTrimmedString(asRecord(history).characterId))),
                    visible,
                  )
                : publicSceneResponse(entry, visible),
      ]),
  ) as T;
}
