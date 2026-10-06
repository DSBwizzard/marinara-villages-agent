import { readStagingCues } from "../../../shared/helpers/scene-staging.js";
import type { InterpretationBatch } from "../models/interpretation-model.js";
import type { SavedAccessEvent, VenueReplyLine } from "../models/scene-model.js";
import { asRecord, asTrimmedString } from "./coerce.js";
import type { MovementIntent } from "./venue-movement.js";

export function parseVenueReply(
  raw: Record<string, unknown> | null,
  audience: readonly string[],
  expressionId?: (characterId: string, requested: string) => string,
): {
  lines: VenueReplyLine[];
  heardPlayerBy: string[];
} {
  const structured = Array.isArray(raw?.segments);
  const segments = structured ? raw!.segments : raw?.lines;
  if (!raw || !Array.isArray(segments) || !Array.isArray(raw.heardPlayerBy))
    throw new Error("The venue response could not be read. Try again.");
  if (!segments.length) throw new Error("The venue response contained no scene moment. Try again.");
  const allowed = new Set(audience);
  // Models sometimes put a name or an obsolete ID in optional audience fields.
  // Ignore those hints; only the cast captured at Visit may hear a line.
  const ids = (value: unknown): string[] =>
    Array.isArray(value)
      ? [...new Set(value.filter((id): id is string => typeof id === "string" && allowed.has(id)))]
      : [];
  if (segments.length > 24) throw new Error("The venue response contained too many lines.");
  const lines: VenueReplyLine[] = segments.map((value): VenueReplyLine => {
    const row = asRecord(value);
    if (
      structured &&
      row.kind !== "narration" &&
      row.kind !== "dialogue" &&
      row.kind !== "side" &&
      row.kind !== "whisper"
    )
      throw new Error("The venue response had an unknown segment kind.");
    let kind: VenueReplyLine["kind"] =
      row.kind === "narration" || row.kind === "side" || row.kind === "whisper" ? row.kind : "dialogue";
    const speakerId = asTrimmedString(row.speakerId);
    const content = asTrimmedString(row.text);
    if ((kind !== "narration" && !allowed.has(speakerId)) || !content || content.length > 2000)
      throw new Error("The venue response had an unreadable speaker or line.");
    const expression = asTrimmedString(row.expression).toLowerCase().slice(0, 40);
    const requestedTarget = asTrimmedString(row.targetId);
    const targetId = allowed.has(requestedTarget) || requestedTarget === "player" ? requestedTarget : "";
    // An invalid whisper target must never make the whole greeting or turn fail.
    // Treat it as an ordinary spoken line, without claiming anyone heard a whisper.
    if (kind === "whisper" && !targetId) kind = "dialogue";
    const requestedGaze = asTrimmedString(row.gazeAt);
    const gazeAt =
      kind === "narration"
        ? ""
        : requestedGaze === "player" || (allowed.has(requestedGaze) && requestedGaze !== speakerId)
          ? requestedGaze
          : kind === "whisper"
            ? targetId
            : "";
    return {
      kind,
      speakerId: kind === "narration" ? "__venue_scene__" : speakerId,
      content,
      heardBy:
        kind === "narration"
          ? [...audience]
          : [
              ...new Set([
                speakerId,
                ...ids(row.heardBy),
                ...(kind === "whisper" && allowed.has(targetId) ? [targetId] : []),
              ]),
            ],
      ...(expression ? { expression } : {}),
      ...(gazeAt ? { gazeAt } : {}),
      ...(Array.isArray(row.staging) ? { staging: readStagingCues(row.staging, audience, expressionId) } : {}),
      ...(targetId ? { targetId } : {}),
    };
  });
  if (
    lines.some((line) => line.kind === "side" || line.kind === "whisper") &&
    !lines.some((line) => line.kind === "narration" || line.kind === "dialogue")
  )
    throw new Error("The venue response had side chatter without a main line.");
  const anchored: VenueReplyLine[] = lines.map((line, index) => {
    if (line.kind !== "side" && line.kind !== "whisper") return line;
    let anchorIndex = index - 1;
    while (anchorIndex >= 0 && (lines[anchorIndex]!.kind === "side" || lines[anchorIndex]!.kind === "whisper"))
      anchorIndex -= 1;
    if (anchorIndex < 0)
      anchorIndex = lines.findIndex((candidate) => candidate.kind === "narration" || candidate.kind === "dialogue");
    return { ...line, anchorIndex };
  });
  return {
    lines: anchored,
    heardPlayerBy: ids(raw.heardPlayerBy),
  };
}
export function quietContactReply(text: string, localIds: string[]) {
  return {
    lines: [{ kind: "narration", speakerId: "__venue_scene__", content: text, heardBy: localIds }] as ReturnType<
      typeof parseVenueReply
    >["lines"],
    heardPlayerBy: localIds,
    interpretationRouting: undefined,
    roomEvents: undefined,
    projectContexts: [],
    projectSpeech: [],
    sceneChange: null,
    movementIntent: null as MovementIntent | null,
    residenceSignal: null,
    upgradeSignal: null,
    venueRequestSignal: null,
    invitationSignal: null,
    editApprovalSignal: null,
    recap: "",
    departures: [],
    sceneEnded: false,
    recollections: [],
    wishChanges: [],
    wishContexts: [],
    responseDiagnostics: undefined,
    memoryChanges: [],
    relationshipChanges: { changes: [], permissions: [], disclosures: [] },
    earlierLineIds: [],
    memoryVersions: {},
    contactIntent: null,
    contactMoves: [],
    contactRelay: null,
    contactEndIds: [],
  };
}
export function savedAccessEvents(batch?: InterpretationBatch | null): SavedAccessEvent[] {
  return batch
    ? batch.checks.flatMap((check, index) => {
        const facts = asRecord(check.facts),
          result = batch.results[index];
        if (
          !result ||
          (!facts.accessCommand &&
            !["refuse", "dismiss", "ban-zone", "ban-venue", "invite-outside-hours"].includes(result.outcome))
        )
          return [];
        return [
          {
            id: check.id,
            facts: {
              actorId: String(facts.actorId),
              venueId: String(facts.venueId),
              zoneId: typeof facts.zoneId === "string" ? facts.zoneId : null,
              accessRevision: Number(facts.accessRevision),
              ...(facts.accessCommand
                ? { accessCommand: structuredClone(facts.accessCommand) as SavedAccessEvent["facts"]["accessCommand"] }
                : {}),
            },
            outcome: result.outcome,
            evidenceIds: [...result.evidenceIds],
          },
        ];
      })
    : [];
}
