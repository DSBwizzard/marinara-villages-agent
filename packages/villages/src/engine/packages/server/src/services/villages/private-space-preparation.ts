import { asRecord, asTrimmedString } from "./coerce.js";
import { villagesConnectionIdFor } from "./connections.js";
import { safeFailureMessage } from "./errors.js";
import { reportFoundingProgress } from "./founding-progress.js";
import { extractJsonObject } from "./json-reply.js";
import { readVillageLore } from "./lorebooks.js";
import { completeWithRoom, villagesLanguageModels } from "./package-runtime.js";
import { renderResidentFoundingContext, RESIDENT_CONTINUITY_RULE } from "./resident-founding-context.js";
import { villagesLogger } from "./runtime-host.js";
import type { VillageState, VillageVenue, VillageVenueZone } from "./types.js";
import { venueZones, zoneControllerIds } from "./venue-zones.js";
import { mutateVillageState, readVillageState } from "./village-store.js";
import type { CapabilityLanguageModelMessage } from "@marinara-engine/shared";
import { randomUUID } from "node:crypto";

export function privatePreparationKey(venue: VillageVenue, zone: VillageVenueZone): string {
  return JSON.stringify([
    venue.venueType,
    venue.form,
    venue.layoutVersion,
    venueZones(venue).map((area) => [area.id, area.kind, area.venueClass]),
    venue.imageContext,
    zone.name,
    zone.purpose,
    zone.description,
    zone.ownerId,
    zone.state.updatedAt,
  ]);
}

/** One eligibility rule for generation, founding readiness, retries and previews. */
export function privatePreparationRooms(village: Pick<VillageState, "venues">) {
  return village.venues.flatMap((venue) =>
    venueZones(venue)
      .filter(
        (zone) =>
          !!zone.preparation &&
          ["private-residence", "staff", "restricted"].includes(zone.kind) &&
          (zone.kind !== "private-residence" || !!zone.ownerId) &&
          venue.constructionStatus !== "worksite",
      )
      .map((zone) => ({ venue, zone })),
  );
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
  const initial = await readVillageState();
  const seed = initial.seed;
  const interrupted = privatePreparationRooms(initial).find(
    ({ zone }) => zone.preparation?.status === "pending" && zone.preparation.claimId,
  );
  if (interrupted) {
    const error = `${interrupted.zone.name}: preparation was interrupted. Retry deliberately; the previous request may have been charged.`;
    await mutateVillageState((state) => {
      if (state.seed !== seed) return;
      for (const { zone } of privatePreparationRooms(state))
        if (zone.preparation?.status === "pending" && zone.preparation.claimId)
          zone.preparation = { ...zone.preparation, status: "failed", error };
    });
    throw new Error(error);
  }
  if (privatePreparationRooms(initial).some(({ zone }) => zone.preparation?.status === "failed")) return;
  while (!signal?.aborted) {
    const village = await readVillageState();
    if (village.seed !== seed) return;
    const next = privatePreparationRooms(village).find(({ zone }) => zone.preparation?.status === "pending");
    if (!next) return;
    const { venue, zone } = next;
    const key = privatePreparationKey(venue, zone);
    const claimId = randomUUID();
    const attempt = (zone.preparation?.attempt ?? 0) + 1;
    let claimed = false;
    let modelName = "System model";
    let outputLimit: number | undefined;
    let finishReason = "unavailable";
    const progress = (stage: "lore" | "resolving" | "model" | "validating" | "saving", extra = {}) =>
      reportFoundingProgress(seed, {
        phase: "private-spaces",
        currentId: "",
        currentVenueId: venue.id,
        currentZoneId: zone.id,
        stage,
        attempt,
        modelName,
        ...extra,
      });
    try {
      await progress("lore", { loreEntryCount: undefined });
      const owners = zoneControllerIds(venue, zone);
      const room = {
        venueId: venue.id,
        id: zone.id,
        name: zone.name,
        purpose: zone.purpose,
        form: venue.form,
        exterior: venue.description,
        commonArea: venue.spaces?.[0]?.description,
        layout: venueZones(venue).map((area) => ({ id: area.id, kind: area.kind, name: area.name })),
        authoredDescription: zone.description,
        characters: village.villagers
          .filter((person) => owners.includes(person.characterId))
          .map(({ cardSnapshot: card, foundingContext }) => ({
            foundingBackground: renderResidentFoundingContext(card.name, foundingContext),
            name: card.name,
            personality: card.personality.slice(0, 400),
            summary: card.summary.slice(0, 200),
            backstory: card.backstory.slice(0, 300),
          })),
      };
      const lore = await readVillageLore(
        village.selectedLorebookIds,
        [village.setting, ...village.worldFacts, JSON.stringify(room)].join("\n"),
        signal,
        Math.min(village.loreTokenBudget, 256),
        true,
        true,
      );
      await progress("resolving", { loreEntryCount: lore.length });
      const model = await villagesLanguageModels().resolveForRequest({
        connectionId: await villagesConnectionIdFor("system"),
      });
      modelName = model.name || model.model || "System model";
      const requested = Math.min(model.maxOutputTokens ?? 3000, 3000);
      const messages: CapabilityLanguageModelMessage[] = [
        {
          role: "system",
          content:
            (room.characters.some((person) => person.foundingBackground) ? RESIDENT_CONTINUITY_RULE + "\n" : "") +
            'Define exactly the one saved private space in the input. Respect venue form, world facts, authored description, selected lore and occupant personalities. A tent corner is valid; never assume a bedroom. Respect the saved layout, including a private-only interior or no Common Space. Never invent adjoining rooms, named people or exceptional possessions. For a Private work area derive a fitting short name (vault, office, staff room, storage, etc.). Return JSON only: {"rooms":[{"venueId":"exact input","id":"exact input","name":"short room name","description":"at most 1000 characters","condition":"at most 240 characters","items":["ordinary item"],"facts":["grounded physical detail"]}]}. Return at most four items and four facts, each at most 240 characters. Keep the complete reply concise.',
        },
        {
          role: "user",
          content: JSON.stringify({
            setting: village.setting,
            worldFacts: village.worldFacts,
            rooms: [{ ...room, lore }],
          }),
        },
      ];
      const fitted = model.fitContext(messages, { maxTokens: requested });
      if (
        room.characters.some((person) => person.foundingBackground) &&
        JSON.stringify(fitted.messages) !== JSON.stringify(messages)
      )
        throw new Error("The required resident background does not fit the System connection. No request was sent.");
      outputLimit = Math.min(fitted.maxTokens ?? requested, requested);
      signal?.throwIfAborted();
      await mutateVillageState((state) => {
        claimed = false;
        if (state.seed !== seed) return;
        const current = privatePreparationRooms(state).find(
          (entry) => entry.venue.id === venue.id && entry.zone.id === zone.id,
        );
        if (
          !current ||
          current.zone.preparation?.status !== "pending" ||
          current.zone.preparation.claimId ||
          privatePreparationKey(current.venue, current.zone) !== key
        )
          return;
        current.zone.preparation = { status: "pending", claimId, startedAt: new Date().toISOString(), attempt };
        claimed = true;
      });
      if (!claimed) return;
      await progress("model");
      const result = await completeWithRoom(model, fitted.messages, outputLimit, {
        temperature: 0.7,
        reasoningEffort: "none",
        retryEmpty: false,
        usagePurpose: "background",
        debugMode: false,
        signal,
      });
      finishReason = result.finishReason ?? "unknown";
      await progress("validating");
      if (finishReason === "length")
        throw new Error("Output was truncated. Check the System output limit and retry deliberately.");
      const raw = extractJsonObject(result.content ?? "");
      const entries = Array.isArray(raw?.rooms) ? raw.rooms.map(asRecord) : [];
      const generated = entries[0];
      if (
        entries.length !== 1 ||
        generated.venueId !== venue.id ||
        generated.id !== zone.id ||
        !asTrimmedString(generated.description)
      )
        throw new Error(
          "No complete JSON for the requested space. Check the System connection and retry deliberately.",
        );
      signal?.throwIfAborted();
      await progress("saving");
      let stale = false;
      await mutateVillageState((state) => {
        stale = false;
        if (state.seed !== seed) return;
        const current = privatePreparationRooms(state).find(
          (entry) => entry.venue.id === venue.id && entry.zone.id === zone.id,
        );
        if (!current || current.zone.preparation?.claimId !== claimId || current.zone.preparation.status !== "pending")
          return;
        if (privatePreparationKey(current.venue, current.zone) !== key) {
          current.zone.preparation = {
            status: "failed",
            attempt,
            error: "The space changed during preparation. Retry deliberately.",
          };
          stale = true;
          return;
        }
        const list = (field: string) =>
          Array.isArray(generated[field])
            ? (generated[field] as unknown[])
                .filter((item): item is string => typeof item === "string")
                .map((item) => item.trim().slice(0, 240))
                .filter(Boolean)
                .slice(0, 4)
            : [];
        const target = current.zone;
        if (target.name === "Private work area")
          target.name = asTrimmedString(generated.name).slice(0, 100) || target.name;
        target.description ||= asTrimmedString(generated.description).slice(0, 1000);
        target.state = {
          ...target.state,
          condition: asTrimmedString(generated.condition).slice(0, 240),
          items: venue.layoutVersion === 1 ? [...new Set([...target.state.items, ...list("items")])] : list("items"),
          publicFacts: list("facts"),
          updatedAt: new Date().toISOString(),
        };
        target.preparation = { status: "ready", attempt };
      });
      if (stale) throw new Error("The space changed during preparation. Retry deliberately.");
    } catch (cause) {
      const detail = signal?.aborted
        ? "Preparation was interrupted. Retry deliberately; the previous request may have been charged."
        : safeFailureMessage(cause);
      const error =
        `${zone.name.slice(0, 80)} · ${modelName.slice(0, 60)} · limit ${outputLimit ?? "unavailable"} · finish ${finishReason}: ${detail}`.slice(
          0,
          300,
        );
      await mutateVillageState((state) => {
        if (state.seed !== seed) return;
        const currentVenue = state.venues.find((entry) => entry.id === venue.id);
        const target = currentVenue?.zones?.find((entry) => entry.id === zone.id);
        if (
          currentVenue &&
          target?.preparation?.status === "pending" &&
          (claimed ? target.preparation.claimId === claimId : privatePreparationKey(currentVenue, target) === key)
        )
          target.preparation = { ...target.preparation, status: "failed", attempt, error };
      });
      villagesLogger().warn("[villages] private-space preparation stopped: %s", error);
      throw new Error(error);
    }
  }
}

export async function retryPrivateSpaces(): Promise<void> {
  await mutateVillageState((state) => {
    for (const { zone } of privatePreparationRooms(state))
      if (zone.preparation?.status === "failed")
        zone.preparation = { status: "pending", attempt: zone.preparation.attempt };
  });
  await preparePrivateSpaces();
}
export function startPrivateSpacePreparation(): () => void {
  const controller = new AbortController();
  void readVillageState()
    .then((state) => {
      // Founding owns its sequence; activation must not race the venue phase.
      if (state.foundingPreparation && state.foundingPreparation.status !== "ready") return;
      return preparePrivateSpaces(controller.signal);
    })
    .catch(() => {});
  return () => controller.abort();
}
