import type { RepairRecord, RepairField, RepairRequest } from "../../../shared/contracts/repair.js";
import type { VillageState } from "../models/world.js";
import { cardCharacters } from "./visitors.js";
import { findLocation } from "./places.js";
import { venueZones, zoneClosed } from "./venue-zones.js";
import {
  initializeVenueAccess,
  hoursSchema,
  readZonePolicy,
  evaluateZoneAccess,
  mayInvite,
  applyAccessCommand,
} from "./venue-access.js";
import { normalizeVillageMutation } from "./world-mutation.js";
import { ZonedDate } from "../../../shared/helpers/zoned-date.js";
import { badRequest, conflict } from "./errors.js";

type Located = RepairRecord & { location: { kind: "place" | "venue"; id: string; zoneId?: string } };
const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export function accessRepairRecords(state: VillageState, at: string): Located[] {
  const people = [
    { id: "player", name: "You" },
    ...cardCharacters(state).map((p) => ({ id: p.characterId, name: p.cardSnapshot.name })),
    ...Object.values(state.worldPlaces.npcs)
      .filter((p) => !p.disabled)
      .map((p) => ({ id: p.id, name: p.label || p.name })),
  ];
  const places = [
    ...state.venues,
    ...Object.values(state.worldPlaces.places)
      .filter((p) => !p.disabled)
      .map((p) => p.location),
  ].filter((p, i, all) => all.findIndex((v) => v.id === p.id) === i);
  const rows: Located[] = [];
  for (const venue of places) {
    const location = { kind: state.venues.includes(venue) ? ("venue" as const) : ("place" as const), id: venue.id };
    const add = (
      parts: string[],
      title: string,
      summary: string,
      fields: RepairField[],
      zoneId?: string,
      actions = [{ id: "correct", label: "Modify" }],
      source: string[] = [],
    ) =>
      rows.push({
        id: JSON.stringify(parts),
        topic: "places",
        title,
        summary,
        fields,
        source,
        actions,
        related: [],
        location: { ...location, ...(zoneId ? { zoneId } : {}) },
      });
    for (const zone of venueZones(venue).filter((z) => z.kind !== "exterior")) {
      const policy = zone.access;
      add(
        ["access-extra", venue.id, zone.id],
        `${zone.name}, Membership & invitations`,
        "Membership & invitations",
        [
          {
            key: "residents",
            label: "All household residents are members",
            type: "boolean",
            value: policy?.memberRoles.includes("residents") ?? false,
          },
          {
            key: "workers",
            label: "All assigned workers are members",
            type: "boolean",
            value: policy?.memberRoles.includes("workers") ?? false,
          },
          {
            key: "accompanied",
            label: "Visitors need someone to accompany them",
            type: "boolean",
            value: policy?.accompanied ?? false,
          },
          ...people.map((p) => ({
            key: "inviter:" + p.id,
            label: `${p.name} may invite visitors`,
            type: "boolean" as const,
            value: policy?.inviterIds.includes(p.id) ?? false,
          })),
          ...people.map((p) => ({
            key: "effective:" + p.id,
            label: p.name,
            type: "text" as const,
            readOnly: true,
            value: evaluateZoneAccess(venue, zone, p.id, {
              at: new ZonedDate(at, state.timeZone || "UTC"),
              environment: state.narrative,
              unavailable: zoneClosed(state, venue, zone),
            }).explanation,
            group: "Current access",
          })),
        ],
        zone.id,
        undefined,
        people.map(
          (p) =>
            `${p.name}: ${evaluateZoneAccess(venue, zone, p.id, { at: new ZonedDate(at, state.timeZone || "UTC"), environment: state.narrative, unavailable: zoneClosed(state, venue, zone) }).explanation}`,
        ),
      );
      add(
        ["new-grant", venue.id, zone.id],
        "Add permission",
        "Permission",
        [
          {
            key: "visitor",
            label: "Person",
            type: "choice",
            value: "",
            options: [{ value: "", label: "Choose a person" }, ...people.map((p) => ({ value: p.id, label: p.name }))],
          },
          {
            key: "issuer",
            label: "Invited by",
            type: "choice",
            value: "",
            options: [
              { value: "", label: "Choose a manager or inviter" },
              ...people.filter((p) => mayInvite(venue, zone, p.id)).map((p) => ({ value: p.id, label: p.name })),
            ],
          },
          {
            key: "duration",
            label: "Permission",
            type: "choice",
            value: "standing",
            options: [
              { value: "standing", label: "Standing permission" },
              { value: "visit", label: "Next visit" },
            ],
          },
          { key: "outsideHours", label: "Allow outside visiting hours", type: "boolean", value: false },
          { key: "accompanied", label: "Inviter must accompany them", type: "boolean", value: false },
        ],
        zone.id,
        [{ id: "add", label: "Add permission" }],
      );
      if (location.kind === "place")
        add(
          ["access-place", venue.id, zone.id],
          `${zone.name}, Entry policy`,
          "Entry policy",
          [
            {
              key: "mode",
              label: "Entry",
              type: "choice",
              value: policy?.mode ?? "permission-required",
              options: [
                { value: "public", label: "Public" },
                { value: "permission-required", label: "Permission required" },
              ],
            },
            ...people.flatMap((p) => [
              {
                key: "manager:" + p.id,
                label: `${p.name}, manager`,
                type: "boolean" as const,
                value: policy?.managerIds?.includes(p.id) ?? false,
              },
              {
                key: "member:" + p.id,
                label: `${p.name}, member`,
                type: "boolean" as const,
                value: policy?.memberIds.includes(p.id) ?? false,
              },
            ]),
          ],
          zone.id,
        );
    }
    for (const zone of [undefined, ...venueZones(venue).filter((z) => z.kind !== "exterior")]) {
      const hours = zone ? (zone.access?.visitorHours ?? "inherit") : (venue.access?.visitorHours ?? "always");
      add(
        ["hours-mode", venue.id, zone?.id ?? ""],
        `${zone?.name ?? venue.name}, Visiting hours`,
        "Visiting hours",
        [
          {
            key: "mode",
            label: "Visiting hours",
            type: "choice",
            value: typeof hours === "string" ? hours : "custom",
            options: [
              ...(zone ? [{ value: "inherit", label: "Use Location hours" }] : []),
              { value: "always", label: "Always open" },
              { value: "custom", label: "Set hours" },
            ],
          },
        ],
        zone?.id,
      );
      const periods = Array.isArray(hours) ? hours : [];
      for (const [index, period] of [...periods, { days: weekdays, start: "09:00", end: "17:00" }].entries())
        add(
          ["hours-period", venue.id, zone?.id ?? "", String(index)],
          `${zone?.name ?? venue.name}, ${index < periods.length ? "Hours " + (index + 1) : "Add opening hours"}`,
          "Opening hours",
          [
            {
              key: "days",
              label: "Days",
              type: "days",
              value: period.days.join(","),
              options: weekdays.map((value) => ({ value, label: value.slice(0, 3) })),
            },
            { key: "start", label: "Opens", type: "clock", value: period.start },
            { key: "end", label: "Closes", type: "clock", value: period.end },
          ],
          zone?.id,
          [
            { id: index < periods.length ? "correct" : "add", label: index < periods.length ? "Modify" : "Add hours" },
            ...(index < periods.length ? [{ id: "remove", label: "Remove hours" }] : []),
          ],
        );
    }
    for (const person of people)
      add(["venue-ban", venue.id, person.id], `${person.name}, Location ban`, "Location ban", [
        {
          key: "banned",
          label: "Banned from this Location",
          type: "boolean",
          value: venue.access?.bans.some((b) => b.visitorId === person.id && b.zoneId === null && b.active) ?? false,
        },
      ]);
    for (const grant of venue.access?.permissions ?? [])
      add(
        ["grant", venue.id, grant.id],
        `${people.find((p) => p.id === grant.visitorId)?.name ?? "Former person"}, Invitation`,
        "Invitation",
        [
          { key: "revoked", label: "Revoked", type: "boolean", value: grant.revoked },
          {
            key: "outsideHours",
            label: "May enter outside visiting hours",
            type: "boolean",
            value: grant.outsideHours,
          },
          {
            key: "accompaniedBy",
            label: "Accompanied by",
            type: "choice",
            value: grant.accompaniedBy ?? "",
            options: [{ value: "", label: "No escort" }, ...people.map((p) => ({ value: p.id, label: p.name }))],
          },
          ...venue
            .access!.bans.filter(
              (b) => b.active && b.visitorId === grant.visitorId && (!b.zoneId || b.zoneId === grant.zoneId),
            )
            .map((b) => ({
              key: "exception:" + b.id,
              label: b.zoneId ? "Exception to this Zone ban" : "Exception to this Location ban",
              type: "boolean" as const,
              value: venue.access!.exceptions.some((e) => e.permissionId === grant.id && e.banIds.includes(b.id)),
            })),
        ],
        grant.zoneId,
        undefined,
        [
          grant.duration === "standing"
            ? "Standing permission"
            : grant.duration === "lodging"
              ? "Saved overnight lodging"
              : "One visit",
        ],
      );
    for (const denial of venue.access?.visitDenials ?? [])
      add(
        ["entry-refusal", venue.id, denial.zoneId, denial.visitorId, denial.sceneId],
        `${people.find((p) => p.id === denial.visitorId)?.name ?? "Former person"}, Refused entry`,
        "Current entry refusal",
        [],
        denial.zoneId,
        [{ id: "remove", label: "Clear refusal" }],
      );
  }
  return rows;
}

export function applyAccessRepair(
  state: VillageState,
  record: RepairRecord,
  request: RepairRequest,
  at: string,
): boolean {
  const [kind, id, zoneOrActor, sub, scene] = JSON.parse(record.id) as string[];
  if (
    ![
      "new-grant",
      "access-extra",
      "access-place",
      "hours-mode",
      "hours-period",
      "venue-ban",
      "grant",
      "entry-refusal",
    ].includes(kind!)
  )
    return false;
  const venue = findLocation(state, id);
  if (!venue) throw conflict("This Location changed.");
  normalizeVillageMutation(
    state,
    () => {
      initializeVenueAccess(venue);
      const ledger = venue.access!,
        zones = venueZones(venue),
        zone = zones.find((z) => z.id === zoneOrActor);
      const values = Object.fromEntries(record.fields.map((f) => [f.key, request.values[f.key] ?? f.value]));
      if (kind === "new-grant") {
        if (!zone) throw conflict("Choose a current Zone.");
        applyAccessCommand(
          venue,
          {
            action: "invite",
            operationId: "repair:" + request.operationId,
            expectedRevision: ledger.revision,
            zoneId: zone.id,
            visitorId: String(values.visitor),
            duration: values.duration as "visit" | "standing",
            visitTiming: "next",
            accompanied: values.accompanied === true,
            outsideHours: values.outsideHours === true,
          },
          String(values.issuer),
          at,
          [
            "player",
            ...cardCharacters(state).map((p) => p.characterId),
            ...Object.values(state.worldPlaces.npcs)
              .filter((p) => !p.disabled)
              .map((p) => p.id),
          ],
        );
      } else if (kind === "access-extra" || kind === "access-place") {
        if (!zone?.access) throw conflict("This Zone changed.");
        const selected = (prefix: string) =>
          record.fields
            .filter((f) => f.key.startsWith(prefix) && values[f.key] === true)
            .map((f) => f.key.slice(prefix.length));
        zone.access = readZonePolicy({
          ...zone.access,
          ...(kind === "access-place"
            ? { mode: values.mode, managerIds: selected("manager:"), memberIds: selected("member:") }
            : {
                memberRoles: ["residents", "workers"].filter((role) => values[role] === true),
                inviterIds: selected("inviter:"),
                accompanied: values.accompanied,
              }),
        });
      } else if (kind.startsWith("hours-")) {
        if (zoneOrActor && !zone?.access) throw conflict("This Zone changed.");
        const current = zone ? zone.access!.visitorHours : ledger.visitorHours;
        let next;
        if (kind === "hours-mode") {
          next =
            values.mode === "inherit"
              ? ("inherit" as const)
              : values.mode === "always"
                ? ("always" as const)
                : Array.isArray(current)
                  ? current
                  : [];
        } else {
          const rows = Array.isArray(current) ? structuredClone(current) : [],
            index = Number(sub);
          if (!Number.isInteger(index) || index < 0 || index > rows.length) throw conflict("These hours changed.");
          if (request.action === "remove") rows.splice(index, 1);
          else
            rows[index] = {
              days: String(values.days).split(","),
              start: String(values.start),
              end: String(values.end),
            };
          next = hoursSchema.parse(rows);
        }
        if (zone) zone.access!.visitorHours = next;
        else ledger.visitorHours = next === "always" ? null : next === "inherit" ? null : next;
      } else if (kind === "venue-ban") {
        const bans = ledger.bans.filter((b) => b.zoneId === null && b.visitorId === zoneOrActor && b.active);
        if (values.banned === false)
          bans.forEach((b) => {
            b.active = false;
          });
        else if (!bans.length)
          ledger.bans.push({
            id: "repair:" + request.operationId,
            zoneId: null,
            visitorId: zoneOrActor!,
            issuerId: "system",
            active: true,
            issuedAt: at,
            sourceLineIds: [],
          });
      } else if (kind === "grant") {
        const grant = ledger.permissions.find((g) => g.id === zoneOrActor);
        if (!grant) throw conflict("This invitation changed.");
        grant.revoked = values.revoked === true;
        grant.outsideHours = values.outsideHours === true;
        grant.accompaniedBy = String(values.accompaniedBy) || null;
        ledger.exceptions = ledger.exceptions.filter((e) => e.permissionId !== grant.id);
        const banIds = record.fields
          .filter((f) => f.key.startsWith("exception:") && values[f.key] === true)
          .map((f) => f.key.slice(10));
        if (banIds.length)
          ledger.exceptions.push({
            id: "repair:" + request.operationId,
            permissionId: grant.id,
            banIds,
            issuerId: "system",
            issuedAt: at,
          });
      } else if (kind === "entry-refusal")
        ledger.visitDenials = ledger.visitDenials.filter(
          (d) => !(d.zoneId === zoneOrActor && d.visitorId === sub && d.sceneId === scene),
        );
      else throw badRequest("Choose a supported access correction.");
      ledger.revision++;
      const place = state.worldPlaces.places[id!];
      if (place) {
        place.revision++;
        state.worldPlaces.revision++;
      }
    },
    { now: () => new Date(at), seed: () => request.operationId },
  );
  return true;
}
