import { asRecord } from "./coerce.js";
import { badGateway } from "./errors.js";
import type { semanticEvidence } from "./semantic-contract.js";

export type ResidentAccessAction = {
  id: string;
  actorId: string;
  visitorId: "player";
  source: { speakerId: string; quote: string };
  venueId: string;
  zoneId: string | null;
  outcome:
    | "invite-now"
    | "invite-later"
    | "refuse"
    | "dismiss"
    | "ban-zone"
    | "ban-venue"
    | "invite-outside-hours"
    | "access-management"
    | "unresolved"
    | "revoke-standing";
  duration: "visit" | "standing";
  conditions: string[];
  accompanies: boolean;
  command?: Record<string, unknown>;
};
export type ResidentActionReceipt = {
  version: 1;
  proposalsOmitted?: boolean;
  proposed: ResidentAccessAction[];
  review: unknown;
  systemResponse?: string;
  coverageNormalization?: { segment: number; actionIds: string[] }[];
};
export const RESIDENT_ACTION_SHAPE =
  'residentActions:[{id:"unique action ID",actorId,visitorId:"player",source:{speakerId,quote:"exact full current segment text"},venueId,zoneId,outcome:"invite-now|invite-later|refuse|dismiss|ban-zone|ban-venue|invite-outside-hours|access-management|unresolved|revoke-standing",duration:"visit|standing",conditions:[],accompanies:false,command?:exact supported access command}]';
export const RESIDENT_ACTION_PUBLIC_SOCIAL =
  "Social invitations to sit, share food or join conversation within the player's already occupied public Zone do not change access; do not propose or discover an access action for that alone. Actual entry, restricted scope, visitor hours, accompaniment, standing permission, dismissal and withdrawal still require their supported access actions and issuer authority.";
export const RESIDENT_ACTION_WRITING =
  "Decide resident access actions together with their dialogue. Return " +
  RESIDENT_ACTION_SHAPE +
  '. Always include residentActions, even []. Only player access is in this contract; invitations to other residents are not player permission. Every invitation, refusal, dismissal, withdrawal or standing permission expressed by current resident speech or a player-witnessed gesture needs an attached action. This includes natural paraphrases; no special wording is needed. One visit never implies standing access. Unclear scope or unsupported conditions use unresolved and preserve the condition. Conditional accompaniment uses conditions:["accompanied"]. Never invent consent or a player move. Source must match one exact current segment; speakerId for narrated gestures is __venue_scene__. Hidden speech cannot grant player permission. These are proposals; System and code retain authority. Do not describe the player entering merely because a resident invites them.';
export const RESIDENT_ACTION_REVIEW =
  'Return residentActionReview:{version:1,additionalActions:[],decisions:[{id,status:"accepted|rejected|unresolved",reason}],coverage:[{segment:0,status:"none|actions|unresolved",actionIds:[],reason}]}. additionalActions uses the SAME residentActions action shape. Adjudicate EVERY supplied and additional action exactly once. Check every player-heard non-player segment, including narration, for missing or contradictory access actions; coverage must contain each such segment exactly once. Discover omitted invitations/refusals/withdrawals/standing permissions as additionalActions. Do not endorse empty metadata when the dialogue expresses an action. Check actual issuer intent, visitor, destination, conditions, timing and visit versus standing scope. Reject unsupported proposals; unresolved scope/conditions remain unresolved. Each action must be referenced by coverage of its exact primary source segment. The same action ID may also be cited on corroborating current dialogue by that actor. Optional player coverage may only be none with empty actionIds. No changes to proposed actions: a mismatch must be rejected, not silently broadened or substituted. Return access:[] and relationshipChanges.permissions:[]; code constructs these from accepted actions. Set authority flags for the resulting accepted actions. A visit invitation enables choice, never player movement. Standing grants require explicit unconditional controller speech, never a gesture or one-time welcome. outcome revoke-standing withdraws standing permission; dismiss ends current access. All unresolved/rejected dispositions hold this draft before commitment.';

// Exact pre-upgrade instruction preserves fingerprints of saved v1 raw completions.
export const RESIDENT_ACTION_REVIEW_V1 = RESIDENT_ACTION_REVIEW.replace(
  "Each action must be referenced by coverage of its exact primary source segment. The same action ID may also be cited on corroborating current dialogue by that actor. Optional player coverage may only be none with empty actionIds.",
  "Each action must be referenced by coverage of its exact source segment.",
);

const outcomes = new Set([
  "invite-now",
  "invite-later",
  "refuse",
  "dismiss",
  "ban-zone",
  "ban-venue",
  "invite-outside-hours",
  "access-management",
  "unresolved",
  "revoke-standing",
]);
const fail = (message: string): never => {
  throw badGateway(message + " Saved draft retained.");
};
export function readResidentActions(value: unknown): ResidentAccessAction[] {
  if (!Array.isArray(value) || value.length > 16) return fail("Resident action metadata is incomplete.");
  const ids = new Set<string>();
  return value.map((value) => {
    const row = asRecord(value),
      source = asRecord(row.source);
    if (
      typeof row.id !== "string" ||
      !row.id.trim() ||
      row.id.length > 80 ||
      ids.has(row.id) ||
      typeof row.actorId !== "string" ||
      !row.actorId ||
      row.actorId === "player" ||
      row.visitorId !== "player" ||
      typeof source.speakerId !== "string" ||
      ![row.actorId, "__venue_scene__"].includes(source.speakerId) ||
      typeof source.quote !== "string" ||
      !source.quote.trim() ||
      source.quote.length > 2000 ||
      typeof row.venueId !== "string" ||
      !row.venueId ||
      !(row.zoneId === null || (typeof row.zoneId === "string" && !!row.zoneId)) ||
      !outcomes.has(String(row.outcome)) ||
      !["visit", "standing"].includes(String(row.duration)) ||
      !Array.isArray(row.conditions) ||
      row.conditions.length > 8 ||
      row.conditions.some((c) => typeof c !== "string" || !c.trim() || c.length > 240) ||
      typeof row.accompanies !== "boolean" ||
      (row.command !== undefined && (typeof row.command !== "object" || !row.command || Array.isArray(row.command)))
    )
      return fail("Resident action metadata is invalid or duplicated.");
    ids.add(row.id);
    return {
      id: row.id,
      actorId: row.actorId,
      visitorId: "player",
      source: { speakerId: source.speakerId, quote: source.quote },
      venueId: row.venueId,
      zoneId: row.zoneId as string | null,
      outcome: row.outcome as ResidentAccessAction["outcome"],
      duration: row.duration as "visit" | "standing",
      conditions: [...row.conditions] as string[],
      accompanies: row.accompanies,
      ...(row.command ? { command: structuredClone(row.command) as Record<string, unknown> } : {}),
    };
  });
}

/** Structural coverage and scope are deterministic. Meaning still comes from the existing System call. */
export function reconcileResidentActions(
  proposed: ResidentAccessAction[],
  value: unknown,
  evidence: ReturnType<typeof semanticEvidence>,
) {
  const review = asRecord(value);
  if (review.version !== 1 || !Array.isArray(review.decisions) || !Array.isArray(review.coverage))
    return fail("Resident action review is incomplete.");
  const additional = readResidentActions(review.additionalActions),
    actions = [...proposed, ...additional];
  if (actions.length > 16 || new Set(actions.map((a) => a.id)).size !== actions.length)
    return fail("Resident action review duplicates an action.");
  const decisions = review.decisions.map(asRecord);
  if (
    decisions.length !== actions.length ||
    new Set(decisions.map((d) => d.id)).size !== decisions.length ||
    decisions.some(
      (d) =>
        !actions.some((a) => a.id === d.id) ||
        !["accepted", "rejected", "unresolved"].includes(String(d.status)) ||
        typeof d.reason !== "string" ||
        !d.reason.trim() ||
        d.reason.length > 600,
    )
  )
    return fail("Resident action dispositions are incomplete.");
  const sources = residentActionSources(actions, evidence);
  const required = evidence.flatMap((line, i) => (line.playerHeard && line.speakerId !== "player" ? [i] : []));
  const playerNone = (c: Record<string, unknown>) =>
    Number.isInteger(c.segment) &&
    evidence[Number(c.segment)]?.speakerId === "player" &&
    c.status === "none" &&
    Array.isArray(c.actionIds) &&
    c.actionIds.length === 0;
  const coverage = review.coverage.map(asRecord).filter((c) => !playerNone(c));
  // Redundant witnessed narration adds no authority: retain only the exact primary source.
  const redundantNarration = (c: Record<string, unknown>, id: unknown) => {
    const action = actions.find((a) => a.id === id),
      source = action && sources.get(action.id),
      line = evidence[Number(c.segment)];
    return !!(
      action &&
      source !== undefined &&
      source !== c.segment &&
      evidence[source]?.kind === "dialogue" &&
      evidence[source]?.speakerId === action.actorId &&
      line?.kind === "narration" &&
      line.playerHeard &&
      line.heardBy.includes(action.actorId) &&
      c.status === "actions" &&
      decisions.some((d) => d.id === id && d.status === "accepted") &&
      coverage.some(
        (primary) =>
          primary.segment === source &&
          primary.status === "actions" &&
          Array.isArray(primary.actionIds) &&
          primary.actionIds.includes(id),
      )
    );
  };
  if (
    coverage.length !== required.length ||
    new Set(coverage.map((c) => c.segment)).size !== required.length ||
    coverage.some(
      (c) =>
        !required.includes(Number(c.segment)) ||
        !Number.isInteger(c.segment) ||
        !["none", "actions", "unresolved"].includes(String(c.status)) ||
        typeof c.reason !== "string" ||
        !c.reason.trim() ||
        c.reason.length > 600 ||
        !Array.isArray(c.actionIds) ||
        new Set(c.actionIds).size !== c.actionIds.length ||
        c.actionIds.some((id) => {
          const action = actions.find((a) => a.id === id),
            line = evidence[Number(c.segment)];
          return (
            !action ||
            (sources.get(String(id)) !== c.segment &&
              !redundantNarration(c, id) &&
              (!line?.playerHeard ||
                line.kind === "narration" ||
                line.speakerId !== action.actorId ||
                !line.heardBy.includes(action.actorId)))
          );
        }) ||
        (c.status === "none" && c.actionIds.length > 0) ||
        (c.status === "actions" && !c.actionIds.length),
    )
  )
    return fail("Resident action coverage is incomplete or inconsistent.");
  if (
    actions.some(
      (a) => !coverage.some((c) => c.segment === sources.get(a.id) && (c.actionIds as unknown[]).includes(a.id)),
    )
  )
    return fail("Resident action was omitted from its source review.");
  if (
    coverage.some((c) => c.status === "unresolved") ||
    decisions.some((d) => d.status !== "accepted") ||
    actions.some((a) => a.outcome === "unresolved" || a.conditions.some((c) => c !== "accompanied"))
  )
    return fail("Resident action needs clarification.");
  const coverageNormalization = coverage.flatMap((c) => {
    const actionIds = (c.actionIds as string[]).filter((id) => redundantNarration(c, id));
    return actionIds.length ? [{ segment: Number(c.segment), actionIds }] : [];
  });
  const scopes = new Map<string, string>();
  for (const action of actions) {
    const scope = JSON.stringify([action.venueId, action.zoneId]);
    const meaning = JSON.stringify([
      action.outcome,
      action.duration,
      [...action.conditions].sort(),
      action.accompanies,
      action.command ?? null,
    ]);
    if (scopes.has(scope) && scopes.get(scope) !== meaning)
      return fail("Conflicting resident actions need clarification.");
    scopes.set(scope, meaning);
  }
  const access: Record<string, unknown>[] = [],
    permissions: Record<string, unknown>[] = [];
  for (const action of actions) {
    const segment = sources.get(action.id)!;
    if (action.duration === "standing") {
      if (
        !["invite-now", "revoke-standing"].includes(action.outcome) ||
        action.conditions.length ||
        action.accompanies ||
        action.command ||
        action.source.speakerId !== action.actorId ||
        !action.zoneId
      )
        return fail("Standing permission scope is unsupported.");
      permissions.push({
        controllerId: action.actorId,
        visitorId: "player",
        venueId: action.venueId,
        zoneId: action.zoneId,
        action: action.outcome === "invite-now" ? "grant" : "revoke",
        lineIds: [segment],
      });
    } else {
      if (action.outcome === "revoke-standing") return fail("Standing withdrawal cannot use visit scope.");
      access.push({
        actorId: action.actorId,
        visitorId: "player",
        venueId: action.venueId,
        zoneId: action.zoneId,
        outcome: action.outcome,
        duration: action.duration,
        conditions: action.conditions,
        accompanies: action.accompanies,
        evidence: [segment],
        ...(action.command ? { command: action.command } : {}),
      });
    }
  }
  const fold = (rows: Record<string, unknown>[], evidenceKey: string) => {
    const grouped = new Map<string, Record<string, unknown>>();
    for (const row of rows) {
      const { [evidenceKey]: refs, ...identity } = row;
      const key = JSON.stringify(identity),
        prior = grouped.get(key);
      if (prior) prior[evidenceKey] = [...new Set([...(prior[evidenceKey] as number[]), ...(refs as number[])])];
      else grouped.set(key, row);
    }
    return [...grouped.values()];
  };
  return {
    access: fold(access, "evidence"),
    permissions: fold(permissions, "lineIds"),
    receipt: {
      version: 1 as const,
      proposed,
      review: structuredClone(review),
      ...(coverageNormalization.length ? { coverageNormalization } : {}),
    },
  };
}

function residentActionSources(actions: ResidentAccessAction[], evidence: ReturnType<typeof semanticEvidence>) {
  const sources = new Map<string, number>();
  for (const action of actions) {
    const matches = evidence.flatMap((line, i) =>
      line.speakerId === action.source.speakerId && line.content === action.source.quote ? [i] : [],
    );
    if (matches.length !== 1) return fail("Resident action source is missing or ambiguous.");
    const source = evidence[matches[0]!]!;
    if (!source.playerHeard || !source.heardBy.includes(action.actorId))
      return fail("Resident action lacks witnessed evidence.");
    sources.set(action.id, matches[0]!);
  }
  return sources;
}
export function assertResidentActionWitnesses(
  receipt: ResidentActionReceipt,
  evidence: ReturnType<typeof semanticEvidence>,
) {
  residentActionSources(
    [...receipt.proposed, ...readResidentActions(asRecord(receipt.review).additionalActions)],
    evidence,
  );
}
