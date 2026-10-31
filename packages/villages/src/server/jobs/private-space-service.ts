import { backgroundRevision } from "../domain/rules/background-revision.js";
import type { mutateDocument } from "../adapters/storage/document-store.js";
import { rejectedSyntaxError } from "../domain/rules/rejected-response.js";
import { retainPrivateDiagnostic } from "../adapters/observability/private-diagnostics.js";
import { responseDiagnostics } from "../domain/rules/response-diagnostics.js";
import { withVillageClockWork } from "../adapters/time/clock-gate.js";
import type { readVillageLore } from "../adapters/engine/lorebooks.js";
import type { villagesLogger } from "../adapters/engine/runtime-host.js";
import type { villagesLanguageModels } from "../adapters/models/language-models.js";
import type { VillageState, VillageVenue, VillageVenueZone } from "../domain/models/world.js";
import { asRecord, asTrimmedString } from "../domain/rules/coerce.js";
import { safeFailureMessage } from "../domain/rules/errors.js";
import { extractModelJsonObject } from "../domain/rules/json-reply.js";
import { renderResidentAdmission, RESIDENT_CONTINUITY_RULE } from "../domain/rules/resident-admission.js";
import { venueZones, zoneControllerIds } from "../domain/rules/venue-zones.js";
import type { reportFoundingProgress } from "../features/founding/founding-progress.js";
import type { completeWithRoom } from "../features/generation/model-requests.js";
import type { villagesConnectionIdFor } from "../features/settings/connections.js";
import type { mutateVillageState, readVillageState } from "../features/world/village-store.js";
import type { CapabilityLanguageModelMessage } from "@marinara-engine/shared";
import { randomUUID } from "node:crypto";
export function privatePreparationKey(venue: VillageVenue, zone: VillageVenueZone, village?: VillageState): string {
  return backgroundRevision([
    village && [
      village.worldName,
      village.setting,
      village.worldFacts,
      village.selectedLorebookIds,
      village.loreTokenBudget,
      village.villagers
        .filter((person) =>
          (zone.kind === "private-residence" ? [zone.ownerId] : zoneControllerIds(venue, zone)).includes(
            person.characterId,
          ),
        )
        .map((person) => [person.cardSnapshot, person.admission]),
    ],
    venue.venueType,
    venue.form,
    venue.layoutVersion,
    venueZones(venue).map((area) => [area.id, area.kind, area.venueClass]),
    venue.imageContext,
    zone.name,
    zone.purpose,
    zone.description,
    zone.roomSpecification,
    zone.ownerId,
    zone.state.updatedAt,
    zone.preparation?.mode,
  ]);
}
export function privatePreparationRooms(village: Pick<VillageState, "venues">) {
  return village.venues.flatMap((venue) =>
    venueZones(venue)
      .filter(
        (zone) =>
          !!zone.preparation &&
          ["private-residence", "staff", "restricted"].includes(zone.kind) &&
          venue.constructionStatus !== "worksite",
      )
      .map((zone) => ({ venue, zone })),
  );
}
function readPrivateReply(
  completion: { content?: string | null; finishReason?: string | null },
  venueId: string,
  zoneId: string,
) {
  const raw = extractModelJsonObject(completion);
  const entries = Array.isArray(raw?.rooms) ? raw.rooms.map(asRecord) : [];
  const generated = entries[0];
  const issues = !raw
    ? ["invalid_json"]
    : !Array.isArray(raw.rooms)
      ? ["missing_rooms"]
      : entries.length !== 1
        ? ["room_count"]
        : [
            ...(generated.venueId !== venueId ? ["venue_id_mismatch"] : []),
            ...(generated.id !== zoneId ? ["space_id_mismatch"] : []),
            ...(!asTrimmedString(generated.description) ? ["missing_description"] : []),
            ...(asTrimmedString(generated.description).length > 4000 ? ["description_too_long"] : []),
          ];
  if (["length", "max_tokens"].includes(completion.finishReason ?? "")) issues.unshift("truncated");

  return { raw, generated, issues };
}

export interface PrivateSpacePreparationPorts {
  mutateDocument: typeof mutateDocument;
  readVillageLore: typeof readVillageLore;
  villagesLogger: typeof villagesLogger;
  villagesLanguageModels: typeof villagesLanguageModels;
  reportFoundingProgress: typeof reportFoundingProgress;
  completeWithRoom: typeof completeWithRoom;
  villagesConnectionIdFor: typeof villagesConnectionIdFor;
  mutateVillageState: typeof mutateVillageState;
  readVillageState: typeof readVillageState;
}
/** One application owns the durable private-space preparation sequence. */
export function createPrivateSpacePreparation(ports: PrivateSpacePreparationPorts) {
  const {
    mutateDocument,
    readVillageLore,
    villagesLogger,
    villagesLanguageModels,
    reportFoundingProgress,
    completeWithRoom,
    villagesConnectionIdFor,
    mutateVillageState,
    readVillageState,
  } = ports;
  let preparation: Promise<void> | null = null;
  function preparePrivateSpaces(signal?: AbortSignal): Promise<void> {
    if (preparation) return preparation;
    preparation = withVillageClockWork(() => prepare(signal)).finally(() => {
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
      const key = privatePreparationKey(venue, zone, village);
      const claimId = randomUUID();
      const attempt = (zone.preparation?.attempt ?? 0) + 1;
      let claimed = false;
      let modelName = "System model";
      let outputLimit: number | undefined;
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
        const owners =
          zone.kind === "private-residence" ? (zone.ownerId ? [zone.ownerId] : []) : zoneControllerIds(venue, zone);
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
          roomSpecification: zone.roomSpecification,
          ...(zone.preparation?.mode === "renovation"
            ? {
                existingInterior: {
                  description: zone.description,
                },
              }
            : {}),
          characters: village.villagers
            .filter((person) => owners.includes(person.characterId))
            .map(({ cardSnapshot: card, admission }) => ({
              admissionContext: renderResidentAdmission(card.name, admission),
              name: card.name,
              personality: card.personality.slice(0, 400),
              summary: card.summary.slice(0, 200),
              backstory: card.backstory.slice(0, 300),
            })),
        };
        const lore = await readVillageLore(
          village.selectedLorebookIds,
          [village.setting, village.worldName, ...village.worldFacts, JSON.stringify(room)].join("\n"),
          signal,
          Math.min(village.loreTokenBudget, 256),
        );
        await progress("resolving", { loreEntryCount: lore.length });
        const model = await villagesLanguageModels().resolveForRequest({
          connectionId: await villagesConnectionIdFor("system"),
        });
        modelName = model.model || model.name || "System model";
        const requested = Math.min(model.maxOutputTokens ?? 3000, 3000);
        const messages: CapabilityLanguageModelMessage[] = [
          {
            role: "system",
            content:
              (room.characters.some((person) => person.admissionContext) ? RESIDENT_CONTINUITY_RULE + "\n" : "") +
              'Define exactly the one saved private space in the input. Respect venue form, world facts, roomSpecification, selected lore and occupant personalities. A tent corner is valid; never assume a bedroom. Respect the saved layout, including a private-only interior or no Common Space. Never invent adjoining rooms, named people or exceptional possessions. Without occupants prepare a functional neutral interior. If existingInterior is supplied, apply the approved roomSpecification to that interior, preserving unrelated furnishings, damage and history. Return the complete reconciled description, removing only details contradicted by the approved work; preserve unrelated established details. For a Private work area derive a fitting short name (vault, office, staff room, storage, etc.). Return JSON only: {"rooms":[{"venueId":"exact input","id":"exact input","name":"short room name","description":"complete current physical account, at most 4000 characters"}]}. Keep the complete reply concise.',
          },
          {
            role: "user",
            content: JSON.stringify({
              setting: village.setting,
              worldName: village.worldName,
              worldFacts: village.worldFacts,
              rooms: [{ ...room, lore }],
            }),
          },
        ];
        const fitted = model.fitContext(messages, { maxTokens: requested });
        if (
          room.characters.some((person) => person.admissionContext) &&
          JSON.stringify(fitted.messages) !== JSON.stringify(messages)
        )
          throw new Error("The required resident backstory does not fit the System connection. No request was sent.");
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
            privatePreparationKey(current.venue, current.zone, state) !== key
          )
            return;
          current.zone.preparation = {
            ...current.zone.preparation,
            status: "pending",
            claimId,
            startedAt: new Date().toISOString(),
            attempt,
          };
          claimed = true;
        });
        if (!claimed) return;
        await progress("model");
        const result = await completeWithRoom(model, fitted.messages, outputLimit, {
          savedRequest: {
            key: JSON.stringify([seed, venue.id, zone.id, key]),
            retry: attempt > 1,
            valid: (result) => readPrivateReply(result, venue.id, zone.id).issues.length === 0,
            replayContent: (result) => {
              const { generated, issues } = readPrivateReply(result, venue.id, zone.id);
              if (issues.length) throw new Error("The space response could not be replayed.");
              return JSON.stringify({
                rooms: [
                  {
                    venueId: venue.id,
                    id: zone.id,
                    name: asTrimmedString(generated.name).slice(0, 100),
                    description: asTrimmedString(generated.description),
                  },
                ],
              });
            },
          },
          responseFormat: { type: "json_object" },
          temperature: 0.7,
          reasoningEffort: "none",
          retryEmpty: false,
          usagePurpose: "background",
          debugMode: false,
          signal,
        });
        await progress("validating");
        const { raw, generated, issues } = readPrivateReply(result, venue.id, zone.id);
        if (issues.length) {
          const content = result.content ?? "";
          const entry = {
            ...responseDiagnostics(model, result, outputLimit, raw),
            villageSeed: seed,
            venueId: venue.id,
            zoneId: zone.id,
            claimId,
            attempt,
            capturedAt: new Date().toISOString(),
            issues,
            usage: result.usage
              ? {
                  promptTokens: result.usage.promptTokens,
                  completionTokens: result.usage.completionTokens,
                  completionReasoningTokens: result.usage.completionReasoningTokens,
                }
              : undefined,
            content,
            truncated: content.length > 24_000,
            syntaxError: raw ? "" : rejectedSyntaxError(content),
          };
          try {
            await retainPrivateDiagnostic(mutateDocument, "space", entry);
          } catch {
            try {
              villagesLogger().warn("[villages] Could not retain private space-response diagnostics");
            } catch {
              /* Diagnostics cannot replace rejection. */
            }
          }
          const problem = issues.includes("truncated")
            ? "Space response was truncated."
            : issues.includes("invalid_json")
              ? "Space response was not valid JSON."
              : issues.includes("missing_rooms")
                ? "Space response omitted rooms."
                : issues.includes("room_count")
                  ? "Space response must contain exactly one room."
                  : issues.includes("venue_id_mismatch") || issues.includes("space_id_mismatch")
                    ? "Space response used the wrong IDs."
                    : "Space response omitted its description.";
          throw new Error(problem + " Retry preparation.");
        }
        signal?.throwIfAborted();
        await progress("saving");
        let stale = false;
        await mutateVillageState((state) => {
          stale = false;
          if (state.seed !== seed) return;
          const current = privatePreparationRooms(state).find(
            (entry) => entry.venue.id === venue.id && entry.zone.id === zone.id,
          );
          if (
            !current ||
            current.zone.preparation?.claimId !== claimId ||
            current.zone.preparation.status !== "pending"
          )
            return;
          if (privatePreparationKey(current.venue, current.zone, state) !== key) {
            current.zone.preparation = {
              ...current.zone.preparation,
              status: "failed",
              attempt,
              error: "The space changed during preparation. Retry deliberately.",
            };
            stale = true;
            return;
          }
          const target = current.zone;
          if (target.name === "Private work area")
            target.name = asTrimmedString(generated.name).slice(0, 100) || target.name;
          if (target.description !== asTrimmedString(generated.description) && target.image)
            target.picture = { ...target.picture, base: target.picture?.base ?? target.image, dirty: true };
          target.description = asTrimmedString(generated.description);
          target.state = { ...target.state, revision: target.state.revision + 1, updatedAt: new Date().toISOString() };
          target.preparation = { status: "ready", attempt };
        });
        if (stale) throw new Error("The space changed during preparation. Retry deliberately.");
      } catch (cause) {
        const detail = signal?.aborted
          ? "Preparation was interrupted. Retry deliberately; the previous request may have been charged."
          : safeFailureMessage(cause);
        const error = `${zone.name.slice(0, 80)}: ${detail}`.slice(0, 300);
        await mutateVillageState((state) => {
          if (state.seed !== seed) return;
          const currentVenue = state.venues.find((entry) => entry.id === venue.id);
          const target = currentVenue?.zones?.find((entry) => entry.id === zone.id);
          if (
            currentVenue &&
            target?.preparation?.status === "pending" &&
            (claimed
              ? target.preparation.claimId === claimId
              : privatePreparationKey(currentVenue, target, state) === key)
          )
            target.preparation = { ...target.preparation, status: "failed", attempt, error };
        });
        villagesLogger().warn("[villages] private-space preparation stopped: %s", error);
        throw new Error(error);
      }
    }
  }
  async function retryPrivateSpaces(): Promise<void> {
    await mutateVillageState((state) => {
      for (const { zone } of privatePreparationRooms(state))
        if (zone.preparation?.status === "failed")
          zone.preparation = { status: "pending", attempt: zone.preparation.attempt, mode: zone.preparation.mode };
    });
    await preparePrivateSpaces();
  }
  function startPrivateSpacePreparation(): () => void {
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
  return { preparePrivateSpaces, retryPrivateSpaces, startPrivateSpacePreparation };
}
export type PrivateSpacePreparationService = ReturnType<typeof createPrivateSpacePreparation>;
