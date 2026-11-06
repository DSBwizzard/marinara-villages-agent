import { isSceneAside } from "../../../shared/helpers/scene-speech.js";
import { readStagingCues } from "../../../shared/helpers/scene-staging.js";
import type { InterpretationBatch } from "../models/interpretation-model.js";
import type { SavedAccessEvent, VenueReplyLine } from "../models/scene-model.js";
import { asRecord, asTrimmedString } from "./coerce.js";

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
  if (!raw) throw new Error("Scene reply must be an object.");
  if (!Array.isArray(segments)) throw new Error("segments must be an array.");
  if (!Array.isArray(raw.heardPlayerBy)) throw new Error("heardPlayerBy must be an array.");
  if (!segments.length) throw new Error("segments must contain at least one line.");
  const allowed = new Set(audience);
  // Models sometimes put a name or an obsolete ID in optional audience fields.
  // Ignore those hints; only the cast captured at Visit may hear a line.
  const ids = (value: unknown): string[] =>
    Array.isArray(value)
      ? [...new Set(value.filter((id): id is string => typeof id === "string" && allowed.has(id)))]
      : [];
  if (segments.length > 24) throw new Error("segments must contain at most 24 lines.");
  const lines: VenueReplyLine[] = segments.map((value, index): VenueReplyLine => {
    const row = asRecord(value);
    if (
      structured &&
      row.kind !== "narration" &&
      row.kind !== "dialogue" &&
      row.kind !== "side" &&
      row.kind !== "whisper"
    )
      throw new Error(`segments[${index}].kind must be narration, dialogue, side or whisper.`);
    let kind: VenueReplyLine["kind"] =
      row.kind === "narration" || row.kind === "side" || row.kind === "whisper" ? row.kind : "dialogue";
    const speakerId = asTrimmedString(row.speakerId);
    const content = asTrimmedString(row.text);
    if ((kind !== "narration" && !allowed.has(speakerId)) || !content || content.length > 2000)
      throw new Error(
        kind !== "narration" && !allowed.has(speakerId)
          ? `segments[${index}].speakerId does not identify a resident in this Scene.`
          : !content
            ? `segments[${index}].text must be a nonempty string.`
            : `segments[${index}].text exceeds 2000 characters.`,
      );
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
      ...(row.delivery === "ordinary" || row.delivery === "whisper" || row.delivery === "shout"
        ? { delivery: row.delivery }
        : {}),
      ...(row.presentation === "main" || row.presentation === "aside" ? { presentation: row.presentation } : {}),
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
    lines.some(isSceneAside) &&
    !lines.some((line) => !isSceneAside(line)) &&
    // Zone events repair bubble anchors after private speech evidence is hidden.
    !lines.some((line) => line.presentation !== undefined)
  )
    throw new Error("The venue response had side chatter without a main line.");
  const anchored: VenueReplyLine[] = lines.map((line, index) => {
    if (!isSceneAside(line)) return line;
    let anchorIndex = index - 1;
    while (anchorIndex >= 0 && isSceneAside(lines[anchorIndex]!)) anchorIndex -= 1;
    if (anchorIndex < 0) anchorIndex = lines.findIndex((candidate) => !isSceneAside(candidate));
    return anchorIndex < 0 ? line : { ...line, anchorIndex };
  });
  return {
    lines: anchored,
    heardPlayerBy: ids(raw.heardPlayerBy),
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
            interpretationVersion: 1,
            facts: {
              actorId: String(facts.actorId),
              venueId: String(facts.venueId),
              zoneId: typeof facts.zoneId === "string" ? facts.zoneId : null,
              accessRevision: Number(facts.accessRevision),
              ...(facts.semanticVersion === 2 ? { semanticVersion: 2 as const } : {}),
              ...(facts.semanticVersion === 2 ? { accompanies: facts.accompanies === true } : {}),
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
