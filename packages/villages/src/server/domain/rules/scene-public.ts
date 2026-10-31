import type { VenueScene } from "../models/scene-model.js";
import { asRecord, asTrimmedString } from "./coerce.js";
function publishedTurn(value: unknown) {
  const turn = asRecord(value);
  return asRecord(turn.semanticProvenance).version !== 2 || turn.semanticReady === true;
}
function unpublishedLines(submissions: unknown[]) {
  return new Set(
    submissions.flatMap((entry) => {
      const turn = asRecord(entry);
      return !publishedTurn(turn) ? ((asRecord(turn.processing).lineIds as string[]) ?? []) : [];
    }),
  );
}
/** Positions enumerate only content that the ordinary public projection can publish. */
export function publicSceneHistoryProjection(scene: VenueScene) {
  const hidden = unpublishedLines(scene.submissions);
  return {
    positions: scene.lines.flatMap((line, position) =>
      !hidden.has(line.id) && (line.contactHidden !== true || line.soundOnly?.player === true) ? [position] : [],
    ),
    privateHearing: publicSceneHistoryHearing(scene),
  };
}
export function publicSceneHistoryHearing(value: unknown) {
  const scene = asRecord(value);
  return privateSceneHearing({
    ...scene,
    submissions: Array.isArray(scene.submissions) ? scene.submissions.filter(publishedTurn) : [],
  });
}
export function sameSceneHistoryTurnPolicy(before: unknown, after: unknown) {
  const policy = (turn: unknown) => [
    publishedTurn(turn),
    publicSceneHistoryHearing({ submissions: [turn] }),
    [...unpublishedLines([turn])],
  ];
  return JSON.stringify(policy(before)) === JSON.stringify(policy(after));
}
function privateSceneHearing(value: unknown): boolean {
  const row = asRecord(value);
  return (
    (Array.isArray(row.submissions) && row.submissions.some((turn) => asRecord(turn).zoneEventsVersion === 1)) ||
    (asRecord(row.operation).input !== undefined &&
      asRecord(asRecord(row.operation).input).interactionScopeVersion === 6) ||
    asRecord(row.contactGeneration).zoneEvents === true ||
    asRecord(row.contactGeneration).acoustics === true ||
    (Array.isArray(row.submissions) &&
      row.submissions.some((turn) => asRecord(asRecord(asRecord(turn).attention).validation).version === 3))
  );
}
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
    const hidden = unpublishedLines(row.submissions);
    row.lines = row.lines.filter((line) => !hidden.has(asRecord(line).id as string));
    row.submissions = row.submissions.filter(publishedTurn);
  }
  privateHearing ||= privateSceneHearing(row);
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
            processingSummary: sceneProcessingSummary(row as VenueScene),
            ...(row.continuity
              ? {
                  capturedContext: true,
                  playerName:
                    asRecord(asRecord(row.continuity).facts).playerPersonaName ||
                    asRecord(asRecord(row.continuity).facts).playerName ||
                    "You",
                }
              : {}),
            ...(row.spinoff
              ? {
                  spinoffPending: asRecord(row.spinoff).status !== "resolved" || !asRecord(row.spinoff).resolvedAt,
                }
              : {}),
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
          !(privateHearing && ["heardBy", "heardPlayerBy"].includes(key)) &&
          ![
            "developmentChanges",
            "continuity",
            "sceneFacts",
            "semanticReady",
            "semanticConclude",
            "semanticPlayerMoves",
            "physicalContext",
            "narrativeSource",
            "semanticContinuedDomains",
            "semanticIntent",
            "semanticProvenance",
            "proposalFingerprint",
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
            "rejectedSubmissions",
            "navigationReceipts",
            "spinoff",
            "accompanying",
            "departureDestinations",
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
            "wishAuthority",
            "liveProposals",
            "interpretationHistory",
            "requestMetrics",
            "timing",
            "memoryChanges",
            "memories",
            "memoryScenes",
            "recollections",
            "turnMemories",
            "relationshipChanges",
            "earlierLineIds",
            "memoryContexts",
            "sourceFingerprint",
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
            : publicSceneResponse(entry, visible, privateHearing),
      ]),
  ) as T;
}
