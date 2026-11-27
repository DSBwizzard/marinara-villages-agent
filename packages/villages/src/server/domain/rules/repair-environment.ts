import type { RepairRecord, RepairField, RepairRequest } from "../../../shared/contracts/repair.js";
import type { VillageState } from "../models/world.js";
import { ensureNarrative } from "./narrative-development.js";
import { findLocation } from "./places.js";
import { venueZones } from "./venue-zones.js";
import { repairLocalTime, repairInstant } from "./repair-time.js";
import { badRequest, conflict } from "./errors.js";
import { memoryHash } from "./memory-integrity.js";
import { WORLD_WEATHER } from "./village-clock.js";
import { continuityHolderKey, protectContinuity } from "./continuity.js";

export function environmentRepairRecords(state: VillageState, at: string): RepairRecord[] {
  const zone = state.timeZone || "UTC",
    places = [...state.venues, ...Object.values(state.worldPlaces.places).map((p) => p.location)];
  const time = (key: string, label: string, value?: string | null): RepairField => ({
    key,
    label: label + ", Village time",
    type: "datetime",
    value: repairLocalTime(value, zone),
  });
  const targets = (venueId = "", zoneId = "", scoped = false): RepairField[] => [
    {
      key: "venueId",
      label: "Location",
      type: "choice",
      value: venueId,
      ...(scoped ? { readOnly: true } : {}),
      options: [{ value: "", label: "Choose a Location" }, ...places.map((p) => ({ value: p.id, label: p.name }))],
    },
    {
      key: "zoneId",
      label: "Zone",
      type: "choice",
      value: zoneId,
      dependsOn: "venueId",
      options: [
        { value: "", label: "Choose a Zone" },
        ...places.flatMap((p) => venueZones(p).map((z) => ({ value: z.id, label: z.name, parent: p.id }))),
      ],
    },
  ];
  const row = (
    parts: string[],
    title: string,
    fields: RepairField[],
    actions = [{ id: "correct", label: "Modify" }],
    revision?: number,
  ): RepairRecord => ({
    id: JSON.stringify(parts),
    topic: "world",
    title,
    summary: title,
    fields,
    actions,
    source: [],
    related: [],
    ...(revision === undefined ? {} : { revision }),
  });
  const situationFields = (title = "", summary = "", scope = "village", venueId = "", zoneId = ""): RepairField[] => [
    { key: "title", label: "Title", type: "text", multiline: false, value: title },
    { key: "summary", label: "Circumstances", type: "text", value: summary },
    {
      key: "scope",
      label: "Scope",
      type: "choice",
      value: scope,
      options: [
        { value: "village", label: "Whole Village" },
        { value: "zone", label: "Selected Zone" },
      ],
    },
    ...targets(venueId, zoneId),
  ];
  const conditionFields = (
    venueId = "",
    zoneId = "",
    observation = "",
    remedy = "",
    restriction = "none",
    endsAt: string | null = null,
    scoped = false,
  ): RepairField[] => [
    ...targets(venueId, zoneId, scoped),
    { key: "observation", label: "Condition", type: "text", value: observation },
    {
      key: "restriction",
      label: "Ordinary activities",
      type: "choice",
      value: restriction,
      options: [
        { value: "none", label: "Continue normally" },
        { value: "ordinary-use", label: "Require corrective work first" },
      ],
    },
    { key: "remedy", label: "Corrective work", type: "text", value: remedy },
    time("endsAt", "Ends", endsAt),
  ];
  const rows = [
    row(["new-situation"], "Add Circumstance", situationFields(), [{ id: "add", label: "Add Circumstance" }]),
  ];
  for (const situation of state.narrative?.situations ?? [])
    rows.push(
      row(
        ["narrative-situation", situation.id],
        situation.title,
        [
          ...situationFields(
            situation.title,
            situation.summary,
            situation.scope,
            situation.targets[0]?.venueId,
            situation.targets[0]?.zoneId,
          ),
          ...[...situation.targets.slice(1), { venueId: "", zoneId: "" }].flatMap((target, index) => {
            const prefix = "target:" + index + ":";
            return [
              ...(target.venueId
                ? [
                    {
                      key: prefix + "keep",
                      label: "Keep target",
                      type: "boolean" as const,
                      value: true,
                      group: "Target " + (index + 2),
                    },
                  ]
                : []),
              ...targets(target.venueId, target.zoneId).map((field) => ({
                ...field,
                key: prefix + field.key,
                ...(field.dependsOn ? { dependsOn: prefix + field.dependsOn } : {}),
                group: target.venueId ? "Target " + (index + 2) : "Add target",
              })),
            ];
          }),
          {
            key: "status",
            label: "Status",
            type: "choice",
            value: situation.status,
            options: [
              { value: "active", label: "Active" },
              { value: "resolved", label: "Resolved" },
            ],
          },
        ],
        undefined,
        situation.revision,
      ),
    );
  const creation = (venueId = "", zoneId = "") =>
    row(
      ["new-condition", venueId, zoneId],
      "Add condition",
      [
        {
          key: "situationId",
          label: "Circumstance",
          type: "choice",
          value: "",
          options: [
            { value: "", label: "New Circumstance" },
            ...(state.narrative?.situations ?? []).map((s) => ({ value: s.id, label: s.title })),
          ],
        },
        ...conditionFields(venueId, zoneId, "", "", "none", null, !!venueId),
      ],
      [{ id: "add", label: "Add condition" }],
    );
  rows.push(creation());
  for (const place of places) {
    rows.push(creation(place.id));
    for (const room of venueZones(place)) rows.push(creation(place.id, room.id));
  }
  for (const condition of state.narrative?.conditions ?? [])
    rows.push(
      row(
        ["narrative-condition", condition.id],
        condition.observation,
        [
          ...conditionFields(
            condition.venueId,
            condition.zoneId,
            condition.observation,
            condition.remedy,
            condition.restriction,
            condition.endsAt,
          ),
          ...(condition.repairEntries ?? []).flatMap((id) => {
            const root = state.continuity.records.find((r) => r.id === id),
              holder = { kind: "room" as const, placeId: condition.venueId, zoneId: condition.zoneId },
              head = root?.heads[continuityHolderKey(holder)],
              version = head && state.continuity.versions.find((v) => v.id === head.versionId);
            return version
              ? [
                  {
                    key: "repair:" + id,
                    label: "Linked room detail",
                    type: "text" as const,
                    value: version.text,
                    group: "Physical correction",
                  },
                ]
              : [];
          }),
          {
            key: "cleared",
            label: "Condition",
            type: "choice",
            value: condition.clearedAt ? "yes" : "no",
            options: [
              { value: "no", label: "Active" },
              { value: "yes", label: "Cleared" },
            ],
          },
        ],
        undefined,
        condition.revision,
      ),
    );
  const weather = state.narrative?.weather;
  rows.push(
    row(
      ["narrative-weather", weather?.id ?? "new"],
      "Weather override",
      [
        {
          key: "description",
          label: "Weather",
          type: "choice",
          value: weather?.description ?? WORLD_WEATHER[0]!,
          options: WORLD_WEATHER.map((value) => ({ value, label: value })),
        },
        time("startsAt", "Starts", weather?.startsAt ?? at),
        time("endsAt", "Ends", weather?.endsAt ?? new Date(Date.parse(at) + 24 * 3600000).toISOString()),
      ],
      [
        { id: weather ? "correct" : "add", label: weather ? "Modify" : "Set weather" },
        ...(weather ? [{ id: "clear", label: "Clear override" }] : []),
      ],
      state.narrative?.weatherRevision ?? 0,
    ),
  );
  if (!weather) rows[rows.length - 1]!.template = true;
  return rows;
}

export function applyEnvironmentRepair(
  state: VillageState,
  record: RepairRecord,
  request: RepairRequest,
  at: string,
): { situationId?: string } | undefined {
  const [kind, id, selectedZone] = JSON.parse(record.id) as string[];
  if (
    !["new-situation", "new-condition", "narrative-situation", "narrative-condition", "narrative-weather"].includes(
      kind!,
    )
  )
    return;
  const narrative = ensureNarrative(state, at),
    values = Object.fromEntries(record.fields.map((field) => [field.key, request.values[field.key] ?? field.value])),
    text = (key: string) => String(values[key] ?? ""),
    zone = state.timeZone || "UTC";
  if (kind === "narrative-weather") {
    if (request.action === "clear") {
      narrative.weather = null;
      narrative.weatherRevision++;
      narrative.revision++;
      return {};
    }
    const startsAt =
        narrative.weather && values.startsAt === record.fields.find((field) => field.key === "startsAt")?.value
          ? narrative.weather.startsAt
          : repairInstant(values.startsAt, zone),
      endsAt =
        narrative.weather && values.endsAt === record.fields.find((field) => field.key === "endsAt")?.value
          ? narrative.weather.endsAt
          : repairInstant(values.endsAt, zone);
    if (!startsAt || !endsAt || endsAt <= startsAt || !text("description").trim() || text("description").length > 600)
      throw badRequest("Describe the weather and choose a later end time.");
    narrative.weather = {
      id: narrative.weather?.id ?? "repair-weather-" + memoryHash(request.operationId).slice(0, 24),
      sourceId: "repair:" + request.operationId,
      description: text("description"),
      startsAt,
      endsAt,
      revision: ++narrative.weatherRevision,
    };
    narrative.revision++;
    return {};
  }
  const location = findLocation(state, text("venueId")),
    room = location && venueZones(location).find((z) => z.id === text("zoneId"));
  const needsTarget = text("scope") === "zone" || kind === "new-condition" || kind === "narrative-condition";
  if (needsTarget && (!location || !room)) throw conflict("Choose a current Location and Zone.");
  if (kind === "new-condition" && id && (text("venueId") !== id || (selectedZone && text("zoneId") !== selectedZone)))
    throw badRequest("Keep this condition in the selected Location and Zone.");
  let situationId: string;
  if (kind === "new-situation" || kind === "narrative-situation") {
    if (!text("title").trim() || text("title").length > 160 || !text("summary").trim() || text("summary").length > 1200)
      throw badRequest("Name and describe the Circumstance.");
    const existing = kind === "narrative-situation" ? narrative.situations.find((s) => s.id === id) : undefined;
    if (kind === "narrative-situation" && !existing) throw conflict("This Circumstance changed.");
    const targets =
      text("scope") === "village"
        ? []
        : [
            { venueId: location!.id, zoneId: room!.id },
            ...record.fields
              .filter((f) => /^target:\d+:venueId$/.test(f.key))
              .flatMap((field) => {
                const prefix = field.key.slice(0, -7),
                  venueId = text(field.key),
                  zoneId = text(prefix + "zoneId");
                if (values[prefix + "keep"] === false || (!venueId && !zoneId)) return [];
                const place = findLocation(state, venueId);
                if (!place || !venueZones(place).some((z) => z.id === zoneId))
                  throw conflict("Choose a current Location and Zone for each target.");
                return [{ venueId, zoneId }];
              }),
          ];
    if (new Set(targets.map((t) => JSON.stringify(t))).size !== targets.length)
      throw badRequest("Choose each target once.");
    const row = {
      id: existing?.id ?? "repair-circumstance-" + memoryHash(request.operationId).slice(0, 24),
      revision: (existing?.revision ?? 0) + 1,
      title: text("title"),
      summary: text("summary"),
      status: (values.status ?? "active") as "active" | "resolved",
      scope: text("scope") as "village" | "zone",
      targets,
      updatedAt: at,
    };
    if (existing) Object.assign(existing, row);
    else narrative.situations.push(row);
    situationId = row.id;
  } else {
    if (!text("observation").trim() || text("observation").length > 600 || text("remedy").length > 600)
      throw badRequest("Describe the condition and corrective work.");
    if (text("restriction") === "ordinary-use" && (room!.kind === "exterior" || !text("remedy").trim()))
      throw badRequest("Keep Entrance usable and name the corrective work for a restriction.");
    const existing = kind === "narrative-condition" ? narrative.conditions.find((c) => c.id === id) : undefined;
    const endsAt =
      existing && values.endsAt === record.fields.find((field) => field.key === "endsAt")?.value
        ? existing.endsAt
        : repairInstant(values.endsAt, zone);
    if (kind === "narrative-condition" && !existing) throw conflict("This condition changed.");
    if (existing?.repairEntries?.length && (existing.venueId !== location!.id || existing.zoneId !== room!.id))
      throw conflict("Keep linked physical repairs in their original Zone.");
    if (existing?.repairEntries?.length) {
      if (endsAt) throw badRequest("Clear a linked physical condition with its room correction.");
      const holder = { kind: "room" as const, placeId: existing.venueId, zoneId: existing.zoneId },
        key = continuityHolderKey(holder);
      for (const rootId of existing.repairEntries) {
        const root = state.continuity.records.find((r) => r.id === rootId),
          head = root?.heads[key],
          version = head && state.continuity.versions.find((v) => v.id === head.versionId);
        if (!root || !head?.current || root.protection[key]?.forgotten || !version) continue;
        const updated = text("repair:" + rootId);
        if (
          (values.cleared === "yes" || values.restriction === "none") &&
          existing.restriction === "ordinary-use" &&
          !existing.clearedAt &&
          updated === version.text
        )
          throw badRequest("Correct each linked room detail before clearing its physical restriction.");
        if (updated !== version.text) {
          if (!updated.trim()) throw badRequest("Enter the corrected room detail.");
          state.continuity = protectContinuity(
            state.continuity,
            { id: root.id, recordRevision: root.revision, heads: { [key]: head.revision } },
            [holder],
            request.operationId + "-" + rootId,
            at,
            { text: updated, ...(version.room ? { room: version.room } : {}) },
          );
        }
      }
    }
    situationId = existing?.situationId ?? text("situationId");
    if (!situationId) {
      situationId = "repair-circumstance-" + memoryHash(request.operationId).slice(0, 24);
      narrative.situations.push({
        id: situationId,
        revision: 1,
        title: text("observation").slice(0, 160),
        summary: text("observation"),
        scope: "zone",
        targets: [{ venueId: location!.id, zoneId: room!.id }],
        status: "active",
        updatedAt: at,
      });
    }
    if (!narrative.situations.some((s) => s.id === situationId)) throw conflict("Choose a current Circumstance.");
    const row = {
      ...existing,
      id: existing?.id ?? "repair-condition-" + memoryHash(request.operationId).slice(0, 24),
      revision: (existing?.revision ?? 0) + 1,
      situationId,
      venueId: location!.id,
      zoneId: room!.id,
      observation: text("observation"),
      remedy: text("remedy"),
      restriction: text("restriction") as "none" | "ordinary-use",
      startsAt: existing?.startsAt ?? at,
      endsAt,
      clearedAt: values.cleared === "yes" ? at : null,
    };
    if (endsAt && endsAt <= row.startsAt) throw badRequest("Choose an end time after the condition begins.");
    if (existing) Object.assign(existing, row);
    else narrative.conditions.push(row);
  }
  narrative.revision++;
  return { situationId };
}
