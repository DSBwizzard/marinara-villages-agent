import type { RepairRecord, RepairField, RepairRequest } from "../../../shared/contracts/repair.js";
import type { VillageState, VillageVenueZone } from "../models/world.js";
import { findLocation } from "./places.js";
import { venueZones } from "./venue-zones.js";
import { contactNeighborIds, applyConnectionEdits } from "../../../shared/helpers/zone-contact.js";
import { validateConnections } from "./space-connections.js";
import { validateLayoutZones } from "./venue-layout.js";
import { normalizeVillageMutation } from "./world-mutation.js";
import { initializeRoomContinuity, removeNativeRoom } from "./native-continuity.js";
import { defaultVenueSpace } from "./venue-model.js";
import { memoryHash } from "./memory-integrity.js";
import { badRequest, conflict } from "./errors.js";

export function physicalRepairRecords(
  state: VillageState,
): (RepairRecord & { location: { kind: "venue" | "place"; id: string; zoneId?: string } })[] {
  return [...state.venues, ...Object.values(state.worldPlaces.places).map((p) => p.location)]
    .flatMap((venue) => {
      const kind = state.venues.includes(venue) ? ("venue" as const) : ("place" as const);
      const record = (
        parts: string[],
        title: string,
        fields: RepairField[],
        zoneId?: string,
        actions = [{ id: "correct", label: "Modify" }],
      ) => ({
        id: JSON.stringify(parts),
        topic: "places" as const,
        title,
        summary: title,
        fields,
        source: [],
        related: [],
        actions,
        location: { kind, id: venue.id, ...(zoneId ? { zoneId } : {}) },
      });
      return [
        record(["location-artwork", venue.id], "Artwork references", [
          {
            key: "villagerContext",
            label: "Use assigned Villager context",
            type: "boolean",
            value: venue.imageContext?.useAssignedVillagerContext ?? true,
          },
          {
            key: "visualLore",
            label: "Use visual lore",
            type: "boolean",
            value: venue.imageContext?.useVisualLore ?? true,
          },
        ]),
        record(
          ["new-zone", venue.id],
          "Add Zone",
          [
            { key: "name", label: "Name", type: "text", multiline: false, value: "" },
            {
              key: "kind",
              label: "Zone kind",
              type: "choice",
              value: "public",
              options: [
                { value: "public", label: "Public" },
                { value: "restricted", label: "Restricted" },
                { value: "personal", label: "Private Space" },
              ],
            },
            { key: "purpose", label: "Used for", type: "text", value: "" },
            { key: "description", label: "Room details", type: "text", value: "" },
            {
              key: "connection",
              label: "Connect to",
              type: "choice",
              value: "exterior",
              options: venueZones(venue).map((z) => ({ value: z.id, label: z.name })),
            },
          ],
          undefined,
          [{ id: "add", label: "Add Zone" }],
        ),
        ...venueZones(venue).flatMap((zone) => [
          record(
            ["zone-connections", venue.id, zone.id],
            "Connections",
            venueZones(venue)
              .filter((z) => z.id !== zone.id)
              .map((other) => ({
                key: "connect:" + other.id,
                label: other.name,
                type: "boolean",
                value: contactNeighborIds(venueZones(venue), zone.id).includes(other.id),
              })),
            zone.id,
          ),
          record(
            ["zone-artwork", venue.id, zone.id],
            "Artwork",
            [
              {
                key: "image",
                label: "Image",
                type: "text",
                value: zone.image?.ref ?? "",
                readOnly: true,
                group: "Image",
              },
              {
                key: "automatic",
                label: "Automatic artwork updates",
                type: "boolean",
                value: zone.freezePicture !== true,
              },
              { key: "dayNight", label: "Day & night artwork", type: "boolean", value: zone.dayNight !== false },
            ],
            zone.id,
          ),
          ...(zone.kind === "exterior"
            ? []
            : [
                record(["archive-zone", venue.id, zone.id], "Remove Zone", [], zone.id, [
                  { id: "archive", label: "Remove Zone" },
                ]),
              ]),
        ]),
      ];
    })
    .map((record) => {
      const [kind, id, zoneId] = JSON.parse(record.id) as string[];
      const venue = kind === "zone-artwork" ? findLocation(state, id) : undefined;
      const zone = venue && venueZones(venue).find((z) => z.id === zoneId);
      return zone
        ? {
            ...record,
            artwork: {
              locationId: id!,
              zoneId: zoneId!,
              ...(zone.image?.url ? { imageUrl: zone.image.url } : {}),
              canGenerate: !zone.preparation || zone.preparation.status === "ready",
            },
          }
        : record;
    });
}

export function applyPhysicalRepair(
  state: VillageState,
  record: RepairRecord,
  request: RepairRequest,
  at: string,
): boolean {
  const [kind, id, zoneId] = JSON.parse(record.id) as string[];
  if (!["location-artwork", "new-zone", "zone-connections", "zone-artwork", "archive-zone"].includes(kind!))
    return false;
  const venue = findLocation(state, id);
  if (!venue || venue.constructionStatus === "worksite")
    throw conflict("Finish the worksite Project before changing its layout.");
  const values = Object.fromEntries(
    record.fields.map((field) => [field.key, request.values[field.key] ?? field.value]),
  );
  normalizeVillageMutation(
    state,
    () => {
      const zones = venueZones(venue),
        zone = zones.find((z) => z.id === zoneId);
      if (!["new-zone", "location-artwork"].includes(kind!) && !zone) throw conflict("This Zone changed.");
      if (kind === "location-artwork")
        venue.imageContext = {
          useAssignedVillagerContext: values.villagerContext === true,
          useVisualLore: values.visualLore === true,
        };
      else if (kind === "zone-artwork") {
        zone!.freezePicture = values.automatic !== true;
        if ((zone!.dayNight !== false) !== (values.dayNight === true)) {
          zone!.dayNight = values.dayNight === true;
          zone!.pictureRevision = (zone!.pictureRevision ?? 0) + 1;
        }
      } else {
        if (state.projects.some((p) => p.venueId === id && !["complete", "cancelled"].includes(p.status)))
          throw conflict("Finish or cancel the Location's current Project before changing its Zones.");
        if (kind === "new-zone") {
          if (zones.length >= 7) throw badRequest("A Location can have six Zones plus Entrance.");
          const name = String(values.name).trim(),
            description = String(values.description).trim();
          if (
            !name ||
            name.length > 100 ||
            !description ||
            description.length > 4000 ||
            String(values.purpose).length > 240
          )
            throw badRequest("Name and describe the new Zone.");
          const link = String(values.connection);
          if (!zones.some((z) => z.id === link)) throw conflict("Choose a current connecting Zone.");
          const added: VillageVenueZone = {
            ...defaultVenueSpace("repair-zone-" + memoryHash(request.operationId).slice(0, 24), description),
            name,
            kind: values.kind as VillageVenueZone["kind"],
            purpose: String(values.purpose),
            connectedTo: [link],
          };
          const next = [
            ...zones.map((z) =>
              z.id === link
                ? { ...z, connectedTo: [...new Set([...contactNeighborIds(zones, z.id), added.id])] }
                : { ...z, connectedTo: contactNeighborIds(zones, z.id) },
            ),
            added,
          ];
          validateLayoutZones(
            venue,
            next.filter((z) => z.kind !== "exterior"),
            state,
          );
          validateConnections(next);
          venue.zones = next;
          venue.layoutVersion = 1;
          initializeRoomContinuity(state, venue.id, added.id, description, request.operationId, at);
        } else if (kind === "zone-connections") {
          const next = applyConnectionEdits(zones, [
            {
              id: zone!.id,
              connectedTo: record.fields
                .filter((field) => values[field.key] === true)
                .map((field) => field.key.slice(8)),
            },
          ]);
          validateConnections(next);
          venue.zones = next;
        } else {
          if (zone!.kind === "exterior") throw badRequest("Keep the Entrance.");
          if (
            Object.values(venue.destinations ?? {}).some((d) => [d.home, d.sleep, d.work].includes(zoneId)) ||
            venue.access?.work?.some((work) => work.accessZoneIds.includes(zoneId!)) ||
            state.residences.some((move) => move.proposedVenueId === id && move.proposedPrivateZoneId === zoneId)
          )
            throw conflict(
              "Reassign household members, sleeping areas, work and pending moves before removing this Zone.",
            );
          const next = zones
            .filter((z) => z !== zone)
            .map((z) => ({ ...z, connectedTo: contactNeighborIds(zones, z.id).filter((other) => other !== zoneId) }));
          validateConnections(next);
          removeNativeRoom(state, venue.id, zone!.id, at);
          venue.archivedZones = [
            ...(venue.archivedZones ?? []),
            { zone: structuredClone(zone!), archivedAt: at },
          ].slice(-64);
          venue.zones = next;
        }
      }
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
