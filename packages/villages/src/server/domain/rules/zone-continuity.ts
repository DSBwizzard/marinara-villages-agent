import type {
  PlaceAfter,
  PlaceContinuity,
  PlaceEvidence,
  PlaceUpdate,
} from "../../../shared/contracts/place-continuity.js";
import {
  emptyPlaceContinuity,
  MAX_PLACE_DESCRIPTION,
  MAX_RECENT_PLACE_CONTEXT,
  RECENT_PLACE_DURATION,
} from "../../../shared/helpers/place-continuity.js";
import { badGateway, conflict } from "./errors.js";

const invalid = () => badGateway("The physical change could not be recorded. Your draft is preserved.");
const object = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw invalid();
  return value as Record<string, unknown>;
};
const text = (value: unknown, limit: number, empty = false): string => {
  if (typeof value !== "string" || value.length > limit || (!empty && !value.trim())) throw invalid();
  return value;
};

export type PlaceSourceLine = {
  id?: string;
  kind?: string;
  speakerId?: string;
  content: string;
  heardBy: string[];
  zoneId?: string;
  contactHidden?: boolean;
  attentionEvidence?: boolean;
};
/** Bind proposed actors and consent to the supplied mechanically witnessed source. */
export function bindPlaceEvidence(
  value: unknown,
  lines: readonly PlaceSourceLine[],
  context: {
    zoneId: string;
    positions: Record<string, string>;
    priorLines?: readonly PlaceSourceLine[];
    playerPresent: boolean;
    playerInput?: string;
  },
): PlaceEvidence & { zoneId: string; segment: number } {
  const raw = object(value),
    segment = raw.segment;
  const line = Number.isInteger(segment) ? lines[Number(segment)] : undefined;
  if (
    !line ||
    line.kind !== "narration" ||
    (context.playerPresent && (line.contactHidden || line.attentionEvidence)) ||
    (line.zoneId && line.zoneId !== context.zoneId)
  )
    throw badGateway("Physical outcomes need an exact local narration source.");
  if (
    !Array.isArray(raw.actorIds) ||
    !raw.actorIds.length ||
    raw.actorIds.length > 5 ||
    raw.actorIds.some(
      (id) =>
        typeof id !== "string" ||
        context.positions[id] !== context.zoneId ||
        (id !== "player" && !line.heardBy.includes(id)),
    ) ||
    new Set(raw.actorIds).size !== raw.actorIds.length ||
    !Array.isArray(raw.consent)
  )
    throw badGateway("Physical action actors or consent evidence are invalid.");
  const consentIds = raw.consent.map((value) => {
    const consent = object(value);
    if (consent.actorId === "player" && consent.segment === "player") {
      if (
        !context.playerPresent ||
        typeof consent.quote !== "string" ||
        !consent.quote.trim() ||
        !(context.playerInput ?? "").includes(consent.quote)
      )
        throw badGateway("Player consent needs exact current input evidence.");
      return "player";
    }
    const prior =
      typeof consent.lineId === "string" ? context.priorLines?.find((row) => row.id === consent.lineId) : undefined;
    const source = prior ?? (Number.isInteger(consent.segment) ? lines[Number(consent.segment)] : undefined);
    if (
      !source ||
      !["dialogue", "whisper"].includes(source.kind ?? "") ||
      source.speakerId !== consent.actorId ||
      (!prior && Number(consent.segment) > Number(segment)) ||
      (raw.actorIds as string[]).some(
        (actor) =>
          actor !== consent.actorId &&
          (actor === "player"
            ? !context.playerPresent || source.contactHidden || source.attentionEvidence
            : !source.heardBy.includes(actor)),
      )
    )
      throw badGateway("Physical consent needs exact witnessed speaker evidence.");
    return String(consent.actorId);
  });
  return {
    zoneId: context.zoneId,
    segment: Number(segment),
    positions: { ...context.positions },
    actorIds: raw.actorIds as string[],
    witnessIds: line.heardBy.filter((id) => context.positions[id] === context.zoneId),
    consentIds,
  };
}

export function readPlaceDescription(value: unknown): string {
  return value === undefined ? "" : text(value, MAX_PLACE_DESCRIPTION, true);
}

/** Evidence is already bound to actual source lines by the caller. */
export function assertPlaceAuthority(
  evidence: Pick<PlaceEvidence, "actorIds" | "witnessIds" | "consentIds"> | undefined,
  controllers: readonly string[],
  residentIds: readonly string[],
) {
  if (
    !evidence ||
    !evidence.actorIds.length ||
    evidence.actorIds.some((id) => id !== "player" && (!evidence.witnessIds.includes(id) || !residentIds.includes(id)))
  )
    throw conflict("Physical actions need actual local actors and witnessed evidence.");
  const approved = new Set([...evidence.actorIds, ...evidence.consentIds]);
  if (controllers.some((id) => !approved.has(id)))
    throw conflict("This physical change needs its current controllers' evidenced consent.");
}

export function readPlaceContinuity(value: unknown): PlaceContinuity {
  if (value === undefined) return emptyPlaceContinuity();
  const row = object(value);
  if (Object.keys(row).some((key) => !["revision", "updatedAt", "recent"].includes(key))) throw invalid();
  if (
    !Number.isSafeInteger(row.revision) ||
    Number(row.revision) < 0 ||
    typeof row.updatedAt !== "string" ||
    (row.updatedAt !== "" && !Number.isFinite(Date.parse(row.updatedAt)))
  )
    throw invalid();
  const recent = row.recent == null ? null : object(row.recent);
  if (
    recent &&
    (Object.keys(recent).some((key) => !["text", "occurredAt", "expiresAt"].includes(key)) ||
      !Number.isFinite(Date.parse(String(recent.occurredAt))) ||
      Date.parse(String(recent.expiresAt)) !== Date.parse(String(recent.occurredAt)) + RECENT_PLACE_DURATION)
  )
    throw invalid();
  return {
    revision: Number(row.revision),
    updatedAt: row.updatedAt,
    recent: recent
      ? {
          text: text(recent.text, MAX_RECENT_PLACE_CONTEXT),
          occurredAt: String(recent.occurredAt),
          expiresAt: String(recent.expiresAt),
        }
      : null,
  };
}

/** Exact unique anchors preserve every byte outside the nominated changes. */
export function applyPlaceUpdate(before: PlaceAfter, value: unknown, at: string): PlaceAfter {
  const row = object(value);
  if (
    Object.keys(row).some(
      (key) =>
        ![
          "happened",
          "segment",
          "actorIds",
          "consent",
          "narration",
          "expectedRevision",
          "appearanceChanged",
          "edits",
          "append",
          "recent",
          "conditionClears",
        ].includes(key),
    )
  )
    throw invalid();
  text(row.narration, 1200);
  if (
    row.conditionClears !== undefined &&
    (!Array.isArray(row.conditionClears) ||
      row.conditionClears.length > 4 ||
      row.conditionClears.some((value: unknown) => {
        const condition = object(value);
        return (
          Object.keys(condition).some((key) => !["id", "expectedRevision"].includes(key)) ||
          typeof condition.id !== "string" ||
          !condition.id ||
          !Number.isSafeInteger(condition.expectedRevision) ||
          Number(condition.expectedRevision) < 0
        );
      }))
  )
    throw invalid();
  if (row.appearanceChanged !== undefined && typeof row.appearanceChanged !== "boolean") throw invalid();
  if (row.expectedRevision !== before.state.revision) throw conflict("This Zone changed. Your draft is preserved.");
  if (!Number.isFinite(Date.parse(at))) throw invalid();
  const edits = row.edits === undefined ? [] : row.edits;
  if (!Array.isArray(edits) || edits.length > 8) throw invalid();
  const spans = edits
    .map((entry) => {
      const edit = object(entry),
        anchor = text(edit.before, MAX_PLACE_DESCRIPTION),
        after = text(edit.after, MAX_PLACE_DESCRIPTION, true);
      if (Object.keys(edit).some((key) => !["before", "after"].includes(key))) throw invalid();
      const start = before.description.indexOf(anchor);
      if (start < 0 || before.description.indexOf(anchor, start + 1) >= 0 || anchor === after) throw invalid();
      return { start, end: start + anchor.length, after };
    })
    .sort((a, b) => a.start - b.start);
  if (spans.some((span, index) => index > 0 && span.start < spans[index - 1].end)) throw invalid();
  let description = before.description;
  for (const span of [...spans].reverse())
    description = description.slice(0, span.start) + span.after + description.slice(span.end);
  if (row.append !== undefined)
    description = [description, text(row.append, MAX_PLACE_DESCRIPTION).trim()].filter(Boolean).join("\n");
  text(description, MAX_PLACE_DESCRIPTION, true);
  let recent = structuredClone(before.state.recent);
  if (row.recent !== undefined) {
    const change = object(row.recent);
    if (
      Object.keys(change).some((key) => !["text", "renew"].includes(key)) ||
      (change.renew !== undefined && typeof change.renew !== "boolean")
    )
      throw invalid();
    const summary = text(change.text, MAX_RECENT_PLACE_CONTEXT, true).trim();
    if (!summary) recent = null;
    else {
      // New incidental activity cannot extend an unrelated existing window.
      const fresh = !recent || Date.parse(recent.expiresAt) <= Date.parse(at) || change.renew === true;
      const occurredAt = fresh ? at : recent.occurredAt;
      recent = {
        text: summary,
        occurredAt,
        expiresAt: new Date(Date.parse(occurredAt) + RECENT_PLACE_DURATION).toISOString(),
      };
    }
  }
  if (description === before.description && JSON.stringify(recent) === JSON.stringify(before.state.recent))
    throw invalid();
  return { description, state: { revision: before.state.revision + 1, updatedAt: at, recent } };
}

export const PLACE_UPDATE_INSTRUCTION =
  'Optional placeUpdate:{happened:true,segment,actorIds:[],consent:[{actorId,segment?,lineId?,quote?}],narration,expectedRevision,appearanceChanged:boolean,edits:[{before,after}],append?,recent?:{text,renew?}}. segment cites current local action narration; actors must actually be there. Every nonacting controller needs consent citing current dialogue segment or exact earlier accepted Scene lineId perceived by actors. Judge conditions and withdrawals for this action/Zone; old agreements are no license. Player consent uses segment:"player",quote:"exact current input". Valid access permits ordinary temporary use; enduring edits need controller authority. Description is physical truth, max4000: use unique exact edits (empty after removes) and/or append; preserve unrelated facts. Consolidate only redundant wording. Unfinished physical work stays here; intentions/promises belong in Memories. Recent is one complete paragraph, max600, empty clears. Its shared 24-hour deadline stays for unrelated new activity. renew:true only when the whole retained arrangement was deliberately maintained/reestablished, never viewing/mentioning. Evidence must establish the completed deed and available supplies. No invented supplies, remote deeds or object/quantity accounting. System judges support/consent; code binds witnesses, authority, revisions and receipts. appearanceChanged:true only for a meaningful visible enduring alteration (furniture, colors, damage, structure); false for rewording, tiny incidental details or recent-only activity. This flags artwork only after the physical change is committed. Optional conditionClears:[{id,expectedRevision}] only for supplied local conditions whose complete remedy is actually performed by this supported physical action. Do not clear on a promise, intention, mere situation resolution or partial work; keep every other restriction. Omit unchanged fields; narration cannot assert unsupported results.';

export function readPlaceUpdate(value: unknown, before: PlaceAfter, at: string): PlaceUpdate | null {
  if (value == null) return null;
  const row = object(value);
  if (row.happened !== true) throw invalid();
  applyPlaceUpdate(before, row, at);
  const { happened: _happened, segment: _segment, actorIds: _actors, consent: _consent, ...update } = row;
  return update as PlaceUpdate;
}
