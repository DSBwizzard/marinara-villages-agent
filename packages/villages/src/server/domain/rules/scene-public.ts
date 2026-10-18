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
export function publicSceneResponse<T>(value: T, visibleIds?: Set<string>, privateHearing = false): T {
  if (Array.isArray(value))
    return value
      .flatMap((entry) => {
        if (!(entry && typeof entry === "object" && entry.contactHidden === true)) return [entry];
        const sound = asRecord(entry.soundOnly);
        return sound.player === true
          ? [
              {
                id: entry.id,
                at: entry.at,
                kind: "narration",
                role: "assistant",
                speakerId: "__venue_scene__",
                name: "Narration",
                content: sound.text,
                heardBy: [],
              },
            ]
          : [];
      })
      .map((entry) => publicSceneResponse(entry, visibleIds, privateHearing)) as T;
  if (!value || typeof value !== "object" || Object.getPrototypeOf(value) !== Object.prototype) return value;
  const row = { ...value } as Record<string, unknown>;
  if (Array.isArray(row.lines) && Array.isArray(row.submissions)) {
    const hidden = new Set(
      row.submissions.flatMap((entry) => {
        const turn = asRecord(entry);
        return asRecord(turn.semanticProvenance).version === 2 && turn.semanticReady !== true
          ? ((asRecord(turn.processing).lineIds as string[]) ?? [])
          : [];
      }),
    );
    row.lines = row.lines.filter((line) => !hidden.has(asRecord(line).id as string));
    row.submissions = row.submissions.filter(
      (entry) => asRecord(asRecord(entry).semanticProvenance).version !== 2 || asRecord(entry).semanticReady === true,
    );
  }
  privateHearing ||=
    (Array.isArray(row.submissions) && row.submissions.some((turn) => asRecord(turn).zoneEventsVersion === 1)) ||
    (asRecord(row.operation).input !== undefined &&
      asRecord(asRecord(row.operation).input).interactionScopeVersion === 6) ||
    asRecord(row.contactGeneration).zoneEvents === true ||
    asRecord(row.contactGeneration).acoustics === true ||
    (Array.isArray(row.submissions) &&
      row.submissions.some((turn) => asRecord(asRecord(asRecord(turn).attention).validation).version === 3));
  const pending = asRecord(row.pendingAttention);
  const clarification =
    pending.id && pending.message && pending.originZoneId === row.zoneId && pending.revision === row.sceneRevision
      ? {
          id: pending.id,
          message: pending.message,
          question:
            asRecord(pending.plan).question === "Which door?"
              ? Array.isArray(asRecord(pending.plan).fragments) &&
                (asRecord(pending.plan).fragments as Record<string, unknown>[]).some(
                  (fragment) => fragment.kind === "speech",
                )
                ? "The system wasn’t sure who you were trying to reach."
                : "The system wasn’t sure which space you meant."
              : asRecord(pending.plan).question,
          choices: pending.choices,
        }
      : undefined;
  const visible = Array.isArray(row.participants)
    ? new Set(row.participants.map((entry) => asTrimmedString(asRecord(entry).characterId)))
    : visibleIds;
  return Object.fromEntries(
    Object.entries(
      Array.isArray(row.lines) && Array.isArray(row.submissions)
        ? {
            ...row,
            submissions: (row.submissions as Record<string, unknown>[]).map((turn) => {
              if (!privateHearing && asRecord(asRecord(turn.attention).validation).version !== 3) return turn;
              const publicLines = new Set(
                (row.lines as Record<string, unknown>[]).filter((line) => !line.contactHidden).map((line) => line.id),
              );
              return {
                ...turn,
                recollections: Array.isArray(turn.recollections)
                  ? turn.recollections.filter((value) => {
                      const refs = asRecord(value).lineIds;
                      return Array.isArray(refs) && refs.length > 0 && refs.every((id) => publicLines.has(id));
                    })
                  : turn.recollections,
              };
            }),
            processingSummary: sceneProcessingSummary(row as VenueScene),
            ...(Array.isArray(asRecord(row.sceneAttendance).layout)
              ? {
                  connectionMap: (asRecord(row.sceneAttendance).layout as Record<string, unknown>[]).map((zone) => ({
                    id: zone.id,
                    connectedTo: zone.connectedTo,
                  })),
                }
              : {}),
            ...(clarification ? { attentionClarification: clarification } : {}),
          }
        : row,
    )
      .filter(
        ([key]) =>
          !(privateHearing && ["heardBy", "heardPlayerBy", "heardHistory"].includes(key)) &&
          ![
            "semanticReady",
            "semanticConclude",
            "semanticPlayerMoves",
            "physicalContext",
            "semanticContinuedDomains",
            "semanticIntent",
            "semanticProvenance",
            "semanticAccess",
            "residentActionReceipt",
            "residentActions",
            "responseDiagnostics",
            "effectFailures",
            "speechSource",
            "speechCapture",
            "evidenceFingerprints",
            "playerSpeechCapture",
            "failure",
            "sceneAttendance",
            "navigationReceipts",
            "spinoff",
            "accompanying",
            "access",
            "accessEvents",
            "accessOperationId",
            "accessPreviousZones",
            "pendingAccessClaim",
            "contactGeneration",
            "contactEvidence",
            "attention",
            "attentionEvidence",
            "pendingAttention",
            "contactHidden",
            "soundOnly",
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
            "timing",
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
                  privateHearing,
                )
              : key === "heardHistory" && visible && Array.isArray(entry)
                ? publicSceneResponse(
                    entry.filter((history) => visible.has(asTrimmedString(asRecord(history).characterId))),
                    visible,
                  )
                : publicSceneResponse(entry, visible, privateHearing),
      ]),
  ) as T;
}
