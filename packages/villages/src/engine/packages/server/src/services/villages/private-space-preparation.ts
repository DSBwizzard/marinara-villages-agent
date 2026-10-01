import type { CapabilityLanguageModelMessage } from "@marinara-engine/shared";
import { readVillageState, mutateVillageState } from "./village-store.js";
import { readVillageLore } from "./lorebooks.js";
import { completeWithRoom, villagesLanguageModels } from "./package-runtime.js";
import { villagesConnectionIdFor } from "./connections.js";
import { extractJsonObject } from "./village-bootstrap.js";
import { asRecord, asTrimmedString } from "./coerce.js";
import { venueZones, zoneControllerIds } from "./venue-zones.js";
import type { VillageVenue, VillageVenueZone } from "./types.js";

export function privatePreparationKey(venue: VillageVenue, zone: VillageVenueZone): string {
  return JSON.stringify([
    venue.form,
    venue.layoutVersion,
    venueZones(venue).map((area) => [area.id, area.kind, area.venueClass]),
    venue.imageContext,
    zone.name,
    zone.purpose,
    zone.description,
    zoneControllerIds(venue, zone),
  ]);
}
let preparation: Promise<void> | null = null;
/** Durable text preparation only. Images are deferred until an invited entry. */
export function preparePrivateSpaces(signal?: AbortSignal): Promise<void> {
  if (preparation) return preparation;
  preparation = prepare(signal).finally(() => {
    preparation = null;
  });
  return preparation;
}
async function prepare(signal?: AbortSignal): Promise<void> {
  const village = await readVillageState();
  const allRooms = village.venues.flatMap((venue) =>
    venueZones(venue)
      .filter(
        (zone) =>
          zone.preparation?.status === "pending" &&
          (zone.kind !== "private-residence" || !!zone.ownerId) &&
          venue.constructionStatus !== "worksite",
      )
      .map((zone) => {
        const owners = zoneControllerIds(venue, zone);
        return {
          venueId: venue.id,
          id: zone.id,
          key: privatePreparationKey(venue, zone),
          name: zone.name,
          purpose: zone.purpose,
          form: venue.form,
          exterior: venue.description,
          commonArea: venue.spaces?.[0]?.description,
          layout: venueZones(venue).map((area) => ({ id: area.id, kind: area.kind, name: area.name })),
          authoredDescription: zone.description,
          characters: village.villagers
            .filter((person) => owners.includes(person.characterId))
            .map(({ cardSnapshot: card }) => ({
              name: card.name,
              personality: card.personality.slice(0, 400),
              summary: card.summary.slice(0, 200),
              backstory: card.backstory.slice(0, 300),
            })),
        };
      }),
  );
  const rooms = allRooms.slice(0, 4);
  if (!rooms.length) return;
  try {
    const contextualRooms = await Promise.all(
      rooms.map(async (room) => ({
        ...room,
        lore: await readVillageLore(
          village.selectedLorebookIds,
          [village.setting, ...village.worldFacts, JSON.stringify(room)].join("\n"),
          signal,
          Math.min(village.loreTokenBudget, 256),
          true,
          true,
        ),
      })),
    );
    const model = await villagesLanguageModels().resolveForRequest({
      connectionId: await villagesConnectionIdFor("system"),
    });
    const messages: CapabilityLanguageModelMessage[] = [
      {
        role: "system",
        content:
          'Define private spaces that already belong to these venues. Respect each venue form, world facts, authored description, selected lore and the occupants\' personalities. A tent corner is valid; never assume a bedroom. Derive an appropriate short name for a Private work area (vault, office, staff room, storage, etc.). Respect the actual saved zones. A Private Space can occupy the entire interior with no Common Space. Exterior-only venues have no interior. Do not invent adjoining rooms. Do not invent named people or exceptional possessions. Return JSON only: {"rooms":[{"venueId":"exact input","id":"exact input","name":"short room name","description":"at most 1000 characters","condition":"brief condition","items":["ordinary item"],"facts":["grounded physical detail"]}]}.',
      },
      {
        role: "user",
        content: JSON.stringify({ setting: village.setting, worldFacts: village.worldFacts, rooms: contextualRooms }),
      },
    ];
    const fitted = model.fitContext(messages, { maxTokens: Math.min(model.maxOutputTokens ?? 3000, 3000) });
    const result = await completeWithRoom(model, fitted.messages, fitted.maxTokens ?? 3000, {
      temperature: 0.7,
      debugMode: false,
      signal,
    });
    const raw = extractJsonObject(result.content ?? "");
    const entries = Array.isArray(raw?.rooms) ? raw.rooms.map(asRecord) : [];
    if (
      rooms.some(
        (room) =>
          !entries.some(
            (entry) => entry.id === room.id && entry.venueId === room.venueId && asTrimmedString(entry.description),
          ),
      )
    )
      throw new Error("Private space preparation did not return every room. Retry preparation.");
    signal?.throwIfAborted();
    await mutateVillageState((state) => {
      for (const room of rooms) {
        const venue = state.venues.find((entry) => entry.id === room.venueId);
        const zone = venue?.zones?.find((entry) => entry.id === room.id);
        if (!venue || !zone || zone.preparation?.status !== "pending") continue;
        if (privatePreparationKey(venue, zone) !== room.key) {
          zone.preparation = { status: "failed", error: "The room changed during preparation. Retry preparation." };
          continue;
        }
        const generated = entries.find((entry) => entry.id === room.id && entry.venueId === room.venueId)!;
        const list = (key: string) =>
          Array.isArray(generated[key])
            ? (generated[key] as unknown[])
                .filter((item): item is string => typeof item === "string")
                .map((item) => item.trim().slice(0, 240))
                .filter(Boolean)
                .slice(0, 12)
            : [];
        if (zone.name === "Private work area") zone.name = asTrimmedString(generated.name).slice(0, 100) || zone.name;
        zone.description ||= asTrimmedString(generated.description).slice(0, 1000);
        zone.state = {
          ...zone.state,
          condition: asTrimmedString(generated.condition).slice(0, 240),
          items: venue.layoutVersion === 1 ? [...new Set([...zone.state.items, ...list("items")])] : list("items"),
          publicFacts: list("facts"),
          updatedAt: new Date().toISOString(),
        };
        zone.preparation = { status: "ready" };
      }
    });
  } catch (error) {
    if (signal?.aborted) return;
    await mutateVillageState((state) => {
      for (const room of rooms) {
        const zone = state.venues
          .find((entry) => entry.id === room.venueId)
          ?.zones?.find((entry) => entry.id === room.id);
        if (zone?.preparation?.status === "pending")
          zone.preparation = { status: "failed", error: "Private space preparation failed. Retry preparation." };
      }
    });
    throw error;
  }
  if (!signal?.aborted) await prepare(signal);
}
export async function retryPrivateSpaces(): Promise<void> {
  await mutateVillageState((state) => {
    for (const venue of state.venues)
      for (const zone of venue.zones ?? [])
        if (zone.preparation?.status === "failed") zone.preparation = { status: "pending" };
  });
  await preparePrivateSpaces();
}
export function startPrivateSpacePreparation(): () => void {
  const controller = new AbortController();
  void preparePrivateSpaces(controller.signal).catch(() => {});
  return () => controller.abort();
}
