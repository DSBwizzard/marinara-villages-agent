import { asRecord } from "./coerce.js";
import type { InterpretationCheck } from "./interpretation.js";
import type { VenueScene } from "./venue-session.js";

const access =
  /\b(?:come (?:in|inside|into|over|upstairs)|(?:allow|grant|deny|refuse|no) entry|ban|banned|barred|outside hours|after closing|invite you|visit me|welcome (?:in|inside|to)|you (?:can|may) (?:use|go|enter|visit)|my (?:room|bedroom|place)|get out|go away|leave (?:here|now|this|my|the)|please leave)\b|^(?:leave|enter)[.!]?$/iu;
const entryRequest =
  /\b(?:may|can|could|shall) (?:I|we)\b[^?\n]{0,100}\b(?:enter|come|go|visit|use|inside|room|door)\b|\blet (?:me|us) (?:in|inside)\b/iu;
const gesture = /\b(?:nods?|beckons?|gestures?|motions?|steps? aside|points?)\b/iu;

/** Routing proposes events; only the subsequent cited judge and authority checks can change access. */
export function selectRoomEventChecks(
  checks: InterpretationCheck[],
  scene: VenueScene,
  routing: unknown,
  events: unknown,
  invitation?: unknown,
) {
  const selected = new Map<string, InterpretationCheck>();
  const uncertain = new Map<string, InterpretationCheck>();
  const select = (candidates: InterpretationCheck[], ids: string[]) => {
    // An unidentified destination is a clarification, never a paid survey of possible rooms.
    const target = candidates.length === 1 ? selected : uncertain;
    for (const check of candidates) {
      const prior = check.evidence.filter((line) => !line.current && line.id !== "player-input");
      const player = check.evidence.filter((line) => line.id === "player-input");
      const pinned = new Set(check.essentialEvidenceIds ?? []);
      const context = [...prior.filter((line) => pinned.has(line.id)), ...prior.slice(-2)];
      target.set(check.id, {
        ...check,
        evidence: [
          ...new Map(
            [
              ...(target.get(check.id)?.evidence ?? []),
              ...context,
              ...player,
              ...check.evidence.filter((line) => line.current && ids.includes(line.id)),
            ].map((line) => [line.id, line]),
          ).values(),
        ],
      });
    }
  };
  const rows = Array.isArray(events) ? events.slice(0, 4) : [];
  for (const value of rows) {
    const row = asRecord(value);
    if (!Array.isArray(row.evidence) || !row.evidence.length || row.evidence.length > 4) continue;
    if (
      ![
        "invite-now",
        "invite-later",
        "refuse",
        "dismiss",
        "revoke",
        "ban-zone",
        "ban-venue",
        "invite-outside-hours",
        "uncertain",
      ].includes(String(row.kind))
    )
      continue;
    const candidates = checks.filter((check) => {
      const facts = asRecord(check.facts);
      return (
        facts.actorId === row.actorId &&
        facts.venueId === row.venueId &&
        (row.kind === "ban-venue"
          ? facts.zoneId === null
          : typeof facts.zoneId === "string" && (!row.zoneId || facts.zoneId === row.zoneId)) &&
        row.evidence.every(
          (index) =>
            Number.isInteger(index) &&
            check.evidence.some(
              (line) =>
                line.id === `draft:${index}` &&
                line.current &&
                (line.speakerId === row.actorId ||
                  (line.kind === "narration" &&
                    gesture.test(line.content) &&
                    line.content.includes(String(facts.actorName)))),
            ),
        )
      );
    });
    select(
      candidates,
      row.evidence.map((index: number) => `draft:${index}`),
    );
  }
  const offer = asRecord(invitation);
  if (offer.residentId && offer.venueId && offer.quote) {
    const candidates = checks.filter((check) => {
      const f = asRecord(check.facts);
      return (
        typeof f.zoneId === "string" &&
        f.actorId === offer.residentId &&
        f.venueId === offer.venueId &&
        (!offer.zoneId || f.zoneId === offer.zoneId)
      );
    });
    const ids =
      candidates[0]?.evidence
        .filter(
          (line) =>
            line.current &&
            line.content.includes(String(offer.quote)) &&
            (line.speakerId === offer.residentId ||
              (line.kind === "narration" &&
                gesture.test(line.content) &&
                line.content.includes(String(asRecord(candidates[0].facts).actorName)))),
        )
        .map((line) => line.id) ?? [];
    if (ids.length) select(candidates, ids);
  }
  // Older saved responses can still nominate a SPECIFIC room, without exhaustive segment coverage.
  for (const value of Array.isArray(routing) ? routing : []) {
    const row = asRecord(value);
    if (
      row.domain !== "room" ||
      row.relevance !== "potential" ||
      !Array.isArray(row.targetIds) ||
      row.targetIds.length !== 1
    )
      continue;
    const candidates = checks.filter(
      (check) =>
        typeof asRecord(check.facts).zoneId === "string" &&
        asRecord(check.facts).actorId === row.actorId &&
        asRecord(check.facts).zoneId === row.targetIds[0],
    );
    const ids =
      candidates[0]?.evidence
        .filter(
          (line) =>
            line.current &&
            (line.speakerId === row.actorId ||
              (line.kind === "narration" && line.content.includes(String(asRecord(candidates[0].facts).actorName)))) &&
            (access.test(line.content) || gesture.test(line.content)),
        )
        .map((line) => line.id) ?? [];
    if (ids.length) select(candidates, ids);
  }
  const actors = new Set(checks.map((check) => String(asRecord(check.facts).actorId)));
  for (const actor of actors) {
    const controlled = checks.filter(
      (check) => asRecord(check.facts).actorId === actor && typeof asRecord(check.facts).zoneId === "string",
    );
    if (!controlled.length) continue;
    if (checks.some((check) => asRecord(check.facts).actorId === actor && selected.has(check.id))) continue;
    const sample = controlled[0];
    const request = sample.evidence.find((line) => line.id === "player-input")?.content ?? "";
    const own = sample.evidence.filter((line) => line.current && line.speakerId === actor && line.kind !== "narration");
    for (const line of own) {
      const pending = controlled.filter((check) => scene.pendingRoomQuestions?.includes(check.question));
      const answer = line.content.length <= 160 && (pending.length > 0 || entryRequest.test(request));
      if (!access.test(line.content) && !answer) continue;
      const text = `${request} ${line.content}`.toLocaleLowerCase();
      const named = controlled.filter((check) => {
        const f = asRecord(check.facts);
        return [f.venueName, f.zoneName].some(
          (name) => typeof name === "string" && name.length > 3 && text.includes(name.toLocaleLowerCase()),
        );
      });
      const actorName = String(asRecord(sample.facts).actorName).toLocaleLowerCase();
      const privateRoom =
        /\b(?:my|your) (?:room|bedroom|private space)\b/iu.test(text) ||
        ["room", "bedroom", "private space"].some((name) => text.includes(`${actorName}'s ${name}`))
          ? controlled.filter((check) => asRecord(check.facts).zoneKind === "private-residence")
          : [];
      const local = controlled.filter((check) => asRecord(check.facts).venueId === scene.placeId);
      const common = local.filter((check) => asRecord(check.facts).zoneKind === "shared-residence");
      const dismissal = /\b(?:get out|go away|leave (?:here|now|this|my|the)|please leave)\b|^leave[.!]?$/iu.test(
        line.content,
      );
      const candidates =
        pending.length && answer
          ? pending
          : named.length
            ? named
            : privateRoom.length
              ? privateRoom
              : dismissal
                ? local.filter((check) => asRecord(check.facts).zoneId === scene.zoneId)
                : common.length === 1 && scene.area === "outside"
                  ? common
                  : local.length
                    ? local
                    : controlled;
      // Negations, jokes and conditional invitations still reach the judge; they cannot grant access here.
      select(candidates, [line.id]);
    }
    for (const line of sample.evidence.filter((line) => line.current && line.kind === "narration")) {
      if (
        !gesture.test(line.content) ||
        !line.content.includes(String(asRecord(sample.facts).actorName)) ||
        !entryRequest.test(request)
      )
        continue;
      select(
        controlled.filter((check) => asRecord(check.facts).venueId === scene.placeId),
        [line.id],
      );
    }
  }
  for (const id of selected.keys()) uncertain.delete(id);
  return {
    selected: [...selected.values()],
    uncertain: [...uncertain.values()].map((check) => ({
      ...check,
      decisionEligible: false,
      decisionReason: "Unknown destination needs clarification, not a model request",
    })),
  };
}
