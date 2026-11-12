import { z } from "zod";
import type { ProjectRoomEdit, ProjectRoomEntry } from "../../../shared/contracts/village.js";
import type { VillageProjectLifecycle, VillageState, VillageVenue } from "../models/world.js";
import { continuityHolderKey, continuityProtectionFingerprint, ROOM_CONTINUITY_TEXT_BYTES } from "./continuity.js";
import { currentRoomViews } from "./continuity-retrieval.js";
import { badRequest, conflict } from "./errors.js";
import { memoryHash } from "./memory-integrity.js";
import { retainNativeFact } from "./native-continuity.js";
import { activeNarrativeConditions } from "./narrative-environment.js";
import { resolveVenueZone, zoneClosed } from "./venue-zones.js";
import { zoneAppearanceContext } from "./zone-picture.js";

const edit = z
  .object({
    zoneId: z
      .string()
      .min(1)
      .refine((id) => Buffer.byteLength(id) <= 160),
    entryId: z
      .string()
      .regex(/^continuity-[a-f0-9]{32}$/u)
      .optional(),
    text: z
      .string()
      .trim()
      .min(1)
      .refine((text) => Buffer.byteLength(text) <= ROOM_CONTINUITY_TEXT_BYTES)
      .nullable(),
  })
  .strict();
export const projectRoomEditsSchema = z
  .array(edit.transform((row): ProjectRoomEdit => ({ ...row, text: row.text ?? null })))
  .max(24);
const submittedEdits = z
  .array(
    edit.extend({
      version: z
        .string()
        .regex(/^continuity-version-[a-f0-9]{32}$/u)
        .optional(),
    }),
  )
  .max(24);

function roomScope(state: VillageState, venue: VillageVenue, zoneId: string, at: string) {
  const zone = resolveVenueZone(venue, zoneId);
  if (!zone) throw conflict("A planned Room is no longer available.");
  const room = { kind: "room" as const, placeId: venue.id, zoneId };
  const observable = currentRoomViews(state.continuity, state.episodes, room, at).filter(
    ({ version }) => version.room?.visibility === "observable",
  );
  const appearance = zoneAppearanceContext(observable.map(({ version }) => version.text).join("\n\n"), venue.form);
  return {
    room,
    visible: !zoneClosed(state, venue, zone) && zone.observed?.context === appearance,
    entries: observable.filter(({ version }) => !version.room?.expiresAt),
  };
}

export function projectRoomEntries(
  state: VillageState,
  venue: VillageVenue,
  zoneId: string,
  at: string,
): ProjectRoomEntry[] | null {
  const scope = roomScope(state, venue, zoneId, at);
  if (!scope.visible) return null;
  return scope.entries.map(({ id, version }) => ({ id, version: version.id, text: version.text }));
}

function roomEdits(state: VillageState, venue: VillageVenue, edits: ProjectRoomEdit[], at: string) {
  const scopes = new Map<string, ReturnType<typeof roomScope>>();
  return edits.map((row) => {
    const scope = scopes.get(row.zoneId) ?? roomScope(state, venue, row.zoneId, at);
    scopes.set(row.zoneId, scope);
    const key = continuityHolderKey(scope.room);
    const entry = row.entryId && scope.entries.find(({ id }) => id === row.entryId);
    const target = entry
      ? { id: entry.id, recordRevision: entry.recordRevision, heads: { [key]: entry.headRevision } }
      : undefined;
    const protection = continuityProtectionFingerprint(state.continuity, [scope.room]);
    return {
      scope,
      entry,
      target,
      protection,
      basis: memoryHash([
        state.seed,
        scope.room,
        row,
        entry ? [entry.version.id, entry.headRevision] : null,
        protection,
      ]),
    };
  });
}

export function captureProjectRoomEdits(
  state: VillageState,
  venue: VillageVenue,
  retainedZones: Set<string>,
  raw: unknown,
  at: string,
  prior?: Pick<VillageProjectLifecycle, "roomBasis">,
) {
  if (raw === undefined) return { roomEdits: undefined, roomBasis: undefined };
  const parsed = submittedEdits.safeParse(raw);
  if (!parsed.success) throw badRequest("Choose valid Room entries and complete text for each edit.");
  const edits = parsed.data.map(({ version: _version, ...row }): ProjectRoomEdit => ({
    ...row,
    text: row.text ?? null,
  }));
  const targets = edits.flatMap(({ entryId }) => (entryId ? [entryId] : []));
  if (
    new Set(targets).size !== targets.length ||
    edits.some((row) => !retainedZones.has(row.zoneId) || (!row.entryId && row.text === null))
  )
    throw badRequest("Edit each retained Room entry once, and provide text for new entries.");
  const captured = roomEdits(state, venue, edits, at);
  for (const [index, row] of captured.entries()) {
    if (prior?.roomBasis?.includes(row.basis)) continue;
    if (!row.scope.visible) throw conflict("Visit this Zone to edit its current appearance.");
    if (edits[index].entryId && (!row.entry || row.entry.version.id !== parsed.data[index].version))
      throw conflict("A selected Room entry changed. Review the design again.");
  }
  return {
    roomEdits: edits.length ? edits : undefined,
    roomBasis: edits.length ? captured.map(({ basis }) => basis) : undefined,
  };
}

export function stageProjectRoomEdits(
  state: VillageState,
  venue: VillageVenue,
  flow: VillageProjectLifecycle,
  projectId: string,
  at: string,
) {
  const edits = flow.change?.roomEdits ?? [];
  const current = roomEdits(state, venue, edits, at);
  if (
    current.length !== (flow.roomBasis?.length ?? 0) ||
    current.some(
      ({ basis, target }, index) => basis !== flow.roomBasis?.[index] || (edits[index].entryId && !target),
    ) ||
    edits.some(
      ({ zoneId }) =>
        !flow.changedZoneIds.includes(zoneId) ||
        (zoneId !== "exterior" && !flow.change?.zones?.some((zone) => zone.id === zoneId)),
    )
  )
    throw conflict("A planned Room changed. Review the design again.");
  const candidate = { ...state };
  const conditions = activeNarrativeConditions(state.narrative, at);
  for (const [index, { scope, target, protection }] of current.entries()) {
    const text = edits[index].text;
    if (
      target &&
      conditions.some(
        (condition) =>
          condition.venueId === venue.id &&
          condition.zoneId === scope.room.zoneId &&
          condition.repairEntries?.includes(target.id),
      )
    )
      throw conflict("Repair the active condition before editing its Room entry.");
    const key = continuityHolderKey(scope.room);
    const roots = state.continuity.records.filter((record) => record.protection[key]).map((record) => record.id);
    retainNativeFact(
      candidate,
      {
        id: "project-room:" + memoryHash([projectId, index]).slice(0, 32),
        kind: "structure",
        targetId: JSON.stringify([scope.room.placeId, scope.room.zoneId]),
        revision: 1,
        text: text ?? "The Project removed a Room detail.",
        witnesses: [],
      },
      at,
      {
        room: scope.room,
        roomChange: { target, ...(text === null ? { retire: true } : {}) },
        ...(roots.length ? { screening: { roots, fingerprint: protection, disposition: "clear" } } : {}),
      },
    );
  }
  return { continuity: candidate.continuity, episodes: candidate.episodes };
}
