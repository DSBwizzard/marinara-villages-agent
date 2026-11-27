import type { RepairField, RepairRecord, RepairRequest } from "../../../shared/contracts/repair.js";
import type { VillageState } from "../models/world.js";
import type { ContinuityVersion } from "../models/continuity-model.js";
import { repairInstant, repairLocalTime } from "./repair-time.js";
import { findLocation } from "./places.js";
import { venueZones } from "./venue-zones.js";
import { retainNativeFact } from "./native-continuity.js";
import { continuityHolderKey, protectContinuity } from "./continuity.js";
import { badRequest, conflict } from "./errors.js";

export const roomRepairFields = (state: VillageState, room?: ContinuityVersion["room"]): RepairField[] => [
  {
    key: "visibility",
    label: "Visibility",
    type: "choice",
    value: room?.visibility ?? "observable",
    options: [
      { value: "observable", label: "Observable" },
      { value: "concealed", label: "Concealed" },
    ],
  },
  {
    key: "expiresAt",
    label: "Expires, Village time",
    type: "datetime",
    value: repairLocalTime(room?.expiresAt, state.timeZone || "UTC"),
  },
  { key: "order", label: "Display order", type: "number", value: room?.order ?? 1, min: 1, max: 100000 },
];

export function addRoomRepairRecords(
  state: VillageState,
): (RepairRecord & { location: { kind: "venue" | "place"; id: string; zoneId: string } })[] {
  return [
    ...state.venues,
    ...Object.values(state.worldPlaces.places)
      .filter((p) => !p.disabled)
      .map((p) => p.location),
  ].flatMap((venue) =>
    venueZones(venue).map((zone) => ({
      id: JSON.stringify(["new-room", venue.id, zone.id]),
      topic: "places" as const,
      title: "Add room detail",
      summary: "Add room detail",
      fields: [{ key: "text", label: "Room detail", type: "text" as const, value: "" }, ...roomRepairFields(state)],
      source: [],
      actions: [{ id: "correct", label: "Add detail" }],
      related: [],
      location: {
        kind: state.venues.includes(venue) ? ("venue" as const) : ("place" as const),
        id: venue.id,
        zoneId: zone.id,
      },
    })),
  );
}

export function applyRoomRepair(
  state: VillageState,
  record: RepairRecord,
  request: RepairRequest,
  at: string,
): boolean {
  const [kind, id, zoneId] = JSON.parse(record.id) as string[];
  if (kind !== "new-room" && kind !== "room") return false;
  const values = Object.fromEntries(
    record.fields.map((field) => [field.key, request.values[field.key] ?? field.value]),
  );
  const priorRoot = kind === "room" ? state.continuity.records.find((row) => row.id === id) : undefined;
  const priorHead = Object.values(priorRoot?.heads ?? {}).find(
    (head) => head.holder.kind === "room" && record.target?.heads[continuityHolderKey(head.holder)] !== undefined,
  );
  const priorExpiry = state.continuity.versions.find((version) => version.id === priorHead?.versionId)?.room?.expiresAt;
  const expiresAt =
      priorExpiry && values.expiresAt === record.fields.find((field) => field.key === "expiresAt")?.value
        ? priorExpiry
        : repairInstant(values.expiresAt ?? "", state.timeZone || "UTC"),
    order = Number(values.order);
  if (!Number.isInteger(order) || order < 1 || order > 100000) throw badRequest("Choose a whole-number display order.");
  const metadata = {
    order,
    visibility: values.visibility as "observable" | "concealed",
    ...(expiresAt ? { expiresAt } : {}),
  };
  if (kind === "new-room") {
    const venue = findLocation(state, id),
      zone = venue && venueZones(venue).find((z) => z.id === zoneId);
    if (!venue || !zone || !String(values.text).trim())
      throw badRequest("Choose a current Zone and enter a room detail.");
    const holder = { kind: "room" as const, placeId: id!, zoneId: zoneId! },
      start = state.continuity.versions.length;
    retainNativeFact(
      state,
      {
        id: "repair-room:" + request.operationId,
        kind: "room",
        targetId: JSON.stringify([id, zoneId]),
        revision: 1,
        text: String(values.text),
        witnesses: [],
        observedBy: [],
      },
      at,
      { room: holder },
    );
    const version = state.continuity.versions[start];
    if (!version) throw conflict("This room detail changed.");
    const root = state.continuity.records.find((row) => row.id === version.rootId)!,
      key = continuityHolderKey(holder);
    state.continuity = protectContinuity(
      state.continuity,
      { id: root.id, recordRevision: root.revision, heads: { [key]: root.heads[key]!.revision } },
      [holder],
      request.operationId + "-details",
      at,
      { text: version.text, room: metadata },
    );
    return true;
  }
  const root = state.continuity.records.find((row) => row.id === id),
    heads = Object.values(root?.heads ?? {}).filter(
      (head) => head.holder.kind === "room" && record.target?.heads[continuityHolderKey(head.holder)] !== undefined,
    );
  if (!root || !record.target || heads.length !== 1) throw conflict("This room detail changed.");
  state.continuity = protectContinuity(
    state.continuity,
    record.target,
    [heads[0]!.holder],
    request.operationId,
    at,
    request.action === "remove" ? { forget: true } : { text: String(values.text), room: metadata },
  );
  return true;
}
