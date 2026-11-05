import { z } from "zod";
import { readLoreUse } from "../../../shared/helpers/lore.js";
import type { PlaceSummary } from "../../../shared/contracts/places.js";
import type { NpcIdentity, PlaceRegistry, WorldPlace } from "../models/places.js";
import type { VillageState, VillageVenue } from "../models/world.js";
import { connectionProblem } from "../../../shared/helpers/zone-contact.js";
import { badRequest } from "./errors.js";
import { readVenueAccess, readZonePolicy } from "./venue-access.js";

export const NPC_PREFIX = "npc:";
const npcSchema = z
  .object({
    id: z.string().startsWith(NPC_PREFIX).max(200),
    revision: z.number().int().nonnegative(),
    name: z.string().trim().min(1).max(100),
    label: z.string().max(100),
    characterization: z.string().max(1000),
    facts: z.array(z.string().max(500)).max(12),
    associations: z.array(z.object({ placeId: z.string().max(200), role: z.string().max(160) })).max(12),
    availability: z.string().max(500),
    disabled: z.boolean(),
    source: z.string().max(500),
    updatedAt: z.string().max(40),
  })
  .strict();
const operationSchema = z
  .object({
    id: z.string().min(1).max(100),
    attempt: z.number().int().positive(),
    fingerprint: z.string().min(1).max(8000),
    kind: z.enum(["explore", "prepare"]),
    placeId: z.string().max(200),
    status: z.enum(["started", "ready", "failed"]),
    input: z
      .object({
        mapId: z.string().min(1).max(200),
        intent: z.string().max(1000),
        placeRevision: z.number().int().nonnegative().optional(),
      })
      .strict(),
    messages: z
      .array(z.object({ role: z.enum(["system", "user", "assistant"]), content: z.string().max(160000) }).strict())
      .min(1)
      .max(3),
    connectionId: z.string().min(1).max(200),
    lore: z.array(z.unknown()).max(48).transform(readLoreUse).optional(),
    error: z.string().max(4000).optional(),
  })
  .strict();
const savedPlace = z
  .object({
    id: z.string().min(1).max(200),
    revision: z.number().int().positive(),
    source: z.string().max(500),
    knownBy: z.array(z.string().max(200)),
    report: z.boolean(),
    prepared: z.boolean(),
    disabled: z.boolean(),
    location: z
      .object({
        id: z.string().min(1).max(200),
        name: z.string().min(1).max(100),
        description: z.string().max(4000),
        presentation: z
          .object({
            mapId: z.string().min(1).max(200),
            x: z.number().min(0).max(1).nullable(),
            y: z.number().min(0).max(1).nullable(),
            image: z.unknown(),
          })
          .strict(),
        occupancy: z.object({
          playerHome: z.boolean(),
          residentCharacterId: z.string().nullable(),
          homeKind: z.string().nullable(),
        }),
        capabilities: z.array(z.string()),
        category: z.string(),
        zones: z
          .array(
            z
              .object({
                id: z.string().min(1),
                name: z.string(),
                kind: z.enum(["exterior", "public", "shared-residence", "private-residence", "staff", "restricted"]),
                venueClass: z.enum(["other", "workplace", "community", "residence"]),
                description: z.string().max(4000),
                state: z
                  .object({ revision: z.number().int().nonnegative(), updatedAt: z.string(), recent: z.unknown() })
                  .strict(),
                connectedTo: z.array(z.string()).optional(),
              })
              .passthrough(),
          )
          .min(1)
          .max(7),
      })
      .passthrough(),
  })
  .strict();

export const emptyPlaceRegistry = (): PlaceRegistry => ({
  revision: 0,
  places: {},
  npcs: {},
  receipts: {},
  operations: {},
});

export function readNpc(value: unknown): NpcIdentity {
  const parsed = npcSchema.safeParse(value);
  if (!parsed.success) throw badRequest("Invalid supporting character.");
  return parsed.data;
}

export function readPlaceRegistry(value: unknown): PlaceRegistry {
  if (value === undefined) return emptyPlaceRegistry();
  const raw = z
    .object({
      revision: z.number().int().nonnegative(),
      places: z.record(z.string(), z.unknown()),
      npcs: z.record(z.string(), z.unknown()),
      receipts: z.record(z.string(), z.string()),
      operations: z.record(z.string(), operationSchema),
    })
    .strict()
    .parse(value);
  const npcs = Object.fromEntries(
    Object.entries(raw.npcs).map(([id, row]) => {
      const npc = readNpc(row);
      if (id !== npc.id) throw badRequest("Supporting character identity changed.");
      return [id, npc];
    }),
  );
  const places = Object.fromEntries(
    Object.entries(raw.places).map(([id, row]) => {
      const parsed = savedPlace.safeParse(row);
      if (!parsed.success) throw badRequest("Invalid saved Place.");
      const place = parsed.data as WorldPlace;
      place.location.access = readVenueAccess(place.location.access);
      for (const zone of place.location.zones ?? []) {
        if (zone.kind === "exterior") {
          if (zone.access !== undefined) throw badRequest("Entrance has no access policy.");
        } else zone.access = readZonePolicy(zone.access);
      }
      if (
        !place ||
        place.id !== id ||
        place.location?.id !== id ||
        !Number.isInteger(place.revision) ||
        !Array.isArray(place.knownBy) ||
        !place.location.zones?.length ||
        place.location.zones.length > 7 ||
        connectionProblem(place.location.zones)
      )
        throw badRequest("Invalid saved Place.");
      return [id, structuredClone(place)];
    }),
  );
  if (Object.entries(raw.operations).some(([id, operation]) => id !== operation.id))
    throw badRequest("Place request identity changed.");
  return { ...raw, places, npcs, operations: structuredClone(raw.operations) };
}

export function placeRegistry(state: Partial<Pick<VillageState, "worldPlaces">>): PlaceRegistry | undefined {
  return Object.getOwnPropertyDescriptor(state, "worldPlaces")?.get ? undefined : state.worldPlaces;
}

export function findLocation(
  state: (Pick<VillageState, "venues"> & Partial<Pick<VillageState, "worldPlaces">>) | undefined,
  id: unknown,
): VillageVenue | undefined {
  if (!state || typeof id !== "string") return undefined;
  return (
    state.venues.find((venue) => venue.id === id) ??
    (placeRegistry(state)?.places[id]?.disabled ? undefined : placeRegistry(state)?.places[id]?.location)
  );
}

export function findNpc(state: VillageState, id: string): NpcIdentity | undefined {
  const npc = placeRegistry(state)?.npcs[id];
  return npc && !npc.disabled ? npc : undefined;
}

export function sceneActorIds(state: VillageState): string[] {
  return [
    ...state.villagers.map((person) => person.characterId),
    ...Object.values(placeRegistry(state)?.npcs ?? {})
      .filter((npc) => !npc.disabled)
      .map((npc) => npc.id),
  ];
}

export function placeSummary(place: WorldPlace): PlaceSummary {
  return {
    id: place.id,
    revision: place.revision,
    name: place.location.name,
    description: place.location.description,
    mapId: place.location.presentation.mapId,
    x: place.location.presentation.x,
    y: place.location.presentation.y,
    report: place.report,
    prepared: place.prepared,
  };
}

export function npcProfile(npc: NpcIdentity): string {
  return `${npc.name} (${npc.id}): ${npc.characterization}\nEstablished facts: ${npc.facts.join("; ")}.\nCurrent associations: ${npc.associations.map((row) => `${row.placeId}: ${row.role}`).join("; ")}.\nAvailability: ${npc.availability || "No established restriction"}. This is a supporting character, not a simulated Villager. Association is not attendance or mechanical authority.`;
}

export function capturePlaceContext(state: VillageState, placeId: string, actors: readonly string[]): PlaceRegistry {
  const registry = emptyPlaceRegistry(),
    source = placeRegistry(state);
  if (!source) return registry;
  registry.revision = source.revision;
  const place = source.places[placeId];
  const related = Object.values(source.places)
    .filter(
      (row) =>
        !row.disabled &&
        row.knownBy.includes("player") &&
        row.location.presentation.mapId ===
          (place?.location.presentation.mapId ??
            state.venues.find((venue) => venue.id === placeId)?.presentation.mapId),
    )
    .slice(-7);
  registry.places = Object.fromEntries(
    [...(place ? [place] : []), ...related].map((row) => [row.id, structuredClone(row)]),
  );
  const active = actors.flatMap((id) => (source.npcs[id] && !source.npcs[id].disabled ? [source.npcs[id]] : []));
  const location = findLocation(state, placeId);
  const authorityIds = new Set([
    ...(location?.access?.managerIds ?? []),
    ...(location?.zones ?? []).flatMap((zone) => [
      ...(zone.access?.managerIds ?? []),
      ...(zone.access?.memberIds ?? []),
      ...(zone.access?.inviterIds ?? []),
    ]),
  ]);
  const candidates = [
    ...active,
    ...Object.values(source.npcs)
      .filter(
        (npc) =>
          !npc.disabled &&
          !actors.includes(npc.id) &&
          (authorityIds.has(npc.id) || npc.associations.some((association) => association.placeId === placeId)),
      )
      .sort((a, b) => Number(authorityIds.has(b.id)) - Number(authorityIds.has(a.id)))
      .slice(0, Math.max(0, 8 - active.length)),
  ];
  registry.npcs = Object.fromEntries(candidates.map((npc) => [npc.id, structuredClone(npc)]));
  return registry;
}
