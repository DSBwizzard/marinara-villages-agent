import { ZONE_DAY_NIGHT_INSTRUCTION } from "../../shared/helpers/zone-day-night.js";
import { applyZoneDayNightDefault } from "../domain/rules/zone-picture.js";
import { recordLoreUse } from "../adapters/observability/runtime-debug.js";
import type { mutateDocument } from "../adapters/storage/document-store.js";
import { rejectedSyntaxError } from "../domain/rules/rejected-response.js";
import { retainPrivateDiagnostic } from "../adapters/observability/private-diagnostics.js";
import { responseDiagnostics } from "../domain/rules/response-diagnostics.js";
import { villageNow, withVillageClockWork } from "../adapters/time/clock-gate.js";
import type { readVillageLore } from "../adapters/engine/lorebooks.js";
import { inspectedLoreUse, loreText, villageLoreContext } from "../domain/rules/lore-context.js";
import type { LoreInspection } from "../../shared/contracts/lore.js";
import { readLoreUse } from "../../shared/helpers/lore.js";
import type { villagesLogger } from "../adapters/engine/runtime-host.js";
import type { villagesLanguageModels } from "../adapters/models/language-models.js";
import type { VillageState } from "../domain/models/world.js";
import { asRecord, asTrimmedString } from "../domain/rules/coerce.js";
import { safeFailureMessage } from "../domain/rules/errors.js";
import { extractModelJsonObject } from "../domain/rules/json-reply.js";
import { RESIDENT_CONTINUITY_RULE } from "../domain/rules/resident-admission.js";
import { venueZones } from "../domain/rules/venue-zones.js";
import { observedZone } from "../domain/rules/zone-observation.js";
import {
  capturePrivateInterior,
  isPrivateInterior,
  publishPrivateInterior,
  retryPrivateInterior,
  type PrivateRoomEdit,
} from "../domain/rules/private-interior.js";
import { ROOM_CONTINUITY_TEXT_BYTES } from "../domain/rules/continuity.js";
import { roomParagraphs } from "../domain/rules/continuity-retrieval.js";
import type { reportFoundingProgress } from "../features/founding/founding-progress.js";
import { reopenSavedResponse, type completeWithRoom } from "../features/generation/model-requests.js";
import type { villagesConnectionIdFor } from "../features/settings/connections.js";
import type { mutateVillageState, readVillageState } from "../features/world/village-store.js";
import type { CapabilityLanguageModelMessage } from "@marinara-engine/shared";
import { randomUUID } from "node:crypto";
export function privatePreparationRooms(village: Pick<VillageState, "venues">) {
  return village.venues.flatMap((venue) =>
    venueZones(venue)
      .filter((zone) => !!zone.preparation && isPrivateInterior(zone) && venue.constructionStatus !== "worksite")
      .map((zone) => ({ venue, zone })),
  );
}
function readPrivateReply(
  completion: { content?: string | null; finishReason?: string | null },
  scope: ReturnType<typeof capturePrivateInterior>,
) {
  const raw = extractModelJsonObject(completion);
  const entries = Array.isArray(raw?.rooms) ? raw.rooms.map(asRecord) : [];
  const generated = entries[0];
  const description = asTrimmedString(generated?.description);
  const paragraphs = scope.renovating ? [] : roomParagraphs(description);
  const edits: PrivateRoomEdit[] = [];
  const targets = new Set<string>();
  const rows = generated?.edits;
  let invalidEdits = scope.renovating
    ? generated?.description !== undefined || !Array.isArray(rows) || rows.length > 16
    : rows !== undefined;
  if (scope.renovating && Array.isArray(rows) && !invalidEdits)
    for (const value of rows) {
      const row = asRecord(value);
      const replace = typeof row.replace === "string" ? row.replace : undefined;
      const text = row.text === null ? null : asTrimmedString(row.text);
      if (
        Object.keys(row).some((key) => key !== "replace" && key !== "text") ||
        (row.replace !== undefined &&
          (!replace ||
            !scope.entries.some(({ id }) => id === replace) ||
            scope.locked.has(replace) ||
            targets.has(replace))) ||
        (text === null ? !replace : !text || Buffer.byteLength(text) > ROOM_CONTINUITY_TEXT_BYTES)
      ) {
        invalidEdits = true;
        break;
      }
      if (replace) targets.add(replace);
      edits.push({ ...(replace ? { replace } : {}), text });
    }
  const issues = !raw
    ? ["invalid_json"]
    : !Array.isArray(raw.rooms)
      ? ["missing_rooms"]
      : entries.length !== 1
        ? ["room_count"]
        : [
            ...(generated.dayNight !== undefined && typeof generated.dayNight !== "boolean"
              ? ["invalid_day_night"]
              : []),
            ...(generated.venueId !== scope.room.placeId ? ["venue_id_mismatch"] : []),
            ...(generated.id !== scope.room.zoneId ? ["space_id_mismatch"] : []),
            ...(!scope.renovating && !description ? ["missing_description"] : []),
            ...(!scope.renovating && description.length > 4000 ? ["description_too_long"] : []),
            ...(new Set(paragraphs).size !== paragraphs.length ? ["duplicate_paragraphs"] : []),
            ...(invalidEdits ? ["invalid_room_edits"] : []),
          ];
  if (["length", "max_tokens"].includes(completion.finishReason ?? "")) issues.unshift("truncated");

  return { raw, generated, issues, description, edits };
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
      const error = "Room preparation was interrupted. Retry deliberately; the previous request may have been charged.";
      await mutateVillageState((state) => {
        if (state.seed !== seed) return;
        const current = privatePreparationRooms(state).find(
          ({ venue, zone }) => venue.id === interrupted.venue.id && zone.id === interrupted.zone.id,
        );
        if (
          current?.zone.preparation?.status === "pending" &&
          current.zone.preparation.claimId === interrupted.zone.preparation?.claimId
        )
          current.zone.preparation = { ...current.zone.preparation, status: "failed", error };
      });
      throw new Error(error);
    }
    const statuses = privatePreparationRooms(initial).map(({ zone }) => zone.preparation?.status);
    if (statuses.includes("failed") || !statuses.includes("pending")) return;
    while (!signal?.aborted) {
      const village = await readVillageState({ memories: true });
      if (village.seed !== seed) return;
      const next = privatePreparationRooms(village).find(({ zone }) => zone.preparation?.status === "pending");
      if (!next) return;
      const { venue, zone } = next;
      const capturedAt = villageNow().toISOString();
      const scope = capturePrivateInterior(village, venue, zone, capturedAt);
      const claimId = randomUUID();
      const attempt = (zone.preparation?.attempt ?? 0) + 1;
      const requestKey = JSON.stringify([seed, venue.id, zone.id, scope.basis]);
      const claim = {
        ...zone.preparation,
        status: "pending" as const,
        claimId,
        basis: scope.basis,
        startedAt: new Date().toISOString(),
        attempt,
      };
      let claimed = false;
      let modelName = "System model";
      let retainedLore: ReturnType<typeof inspectedLoreUse> = [];
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
        if (zone.preparation?.basis && zone.preparation.basis !== scope.basis)
          throw new Error(
            "The Room changed since preparation was saved. Revise its specification before preparing it again.",
          );
        if (!scope.renovating && !scope.canInitialize) throw new Error("This Room already has a prepared appearance.");
        const saved = zone.preparation?.basis ? await reopenSavedResponse(mutateDocument, requestKey) : undefined;
        if (saved) retainedLore = readLoreUse(extractModelJsonObject(saved)?.loreUse);
        const prepareRequest = async () => {
          await progress("lore", { loreEntryCount: undefined });
          const room = scope.packet;
          let inspection: LoreInspection | undefined;
          const lore = await readVillageLore(
            village.selectedLorebookIds,
            loreText(
              villageLoreContext(village),
              room.name,
              room.purpose,
              room.form,
              room.roomSpecification,
              room.existingInterior?.map(({ text }) => text),
              scope.loreAnchors,
              room.characters.flatMap((person) => [person.name, person.personality, person.summary, person.backstory]),
            ),
            signal,
            Math.min(village.loreTokenBudget, 256),
            {
              inspect: (report) => {
                inspection = report;
              },
            },
          );
          await progress("resolving", { loreEntryCount: lore.length });
          const connection = await villagesLanguageModels().resolveForRequest({
            connectionId: await villagesConnectionIdFor("system"),
          });
          modelName = connection.model || connection.name || "System model";
          const requested = Math.min(connection.maxOutputTokens ?? 3000, 3000);
          const messagesFor = (loreEntries: string[]): CapabilityLanguageModelMessage[] => [
            {
              role: "system",
              content:
                (room.characters.some((person) => person.admissionContext) ? RESIDENT_CONTINUITY_RULE + "\n" : "") +
                'Define exactly the one saved private space in the input. Respect the building form, layout, world rules, roomSpecification, selected lore and occupant personalities. A tent corner is valid. Invent no adjoining rooms, named people or exceptional possessions. Without occupants prepare a functional neutral interior. For a Private work area give a fitting short name. Return JSON only with exactly one object inside {"rooms":[...]}, with venueId and id copied from the input and name as a short room name. ' +
                (scope.renovating
                  ? "Return edits:[{replace?:existingInterior id,text:complete entry or null}], at most 16. Apply only the approved specification. Omit unrelated furnishings, damage and history from edits so they remain. Omit replace for a new detail; null retires a supplied entry. Never change locked entries. Use edits:[] for no physical change. Supply no description field. "
                  : "Return description as the complete enduring appearance, with distinct details in separate paragraphs, at most 4000 characters. ") +
                ZONE_DAY_NIGHT_INSTRUCTION,
            },
            {
              role: "user",
              content: JSON.stringify({
                setting: village.setting,
                worldName: village.worldName,
                worldRules: village.worldRules,
                rooms: [{ ...room, lore: loreEntries }],
              }),
            },
          ];
          const fit = (loreEntries: string[]) => {
            const messages = messagesFor(loreEntries);
            const complete = JSON.stringify(messages);
            const fitted = connection.fitContext(messages, { maxTokens: requested });
            return { fitted, intact: JSON.stringify(fitted.messages) === complete };
          };
          let { fitted, intact } = fit(lore);
          retainedLore = inspectedLoreUse(inspection, "Private space");
          if (!intact && lore.length) {
            ({ fitted, intact } = fit([]));
            retainedLore = [];
          }
          const maxTokens = Math.min(fitted.maxTokens ?? requested, requested);
          if (!intact || !Number.isFinite(maxTokens) || maxTokens < 1)
            throw new Error(
              "The complete Room and resident context does not fit the System connection. No request was sent.",
            );
          return { connection, messages: fitted.messages, maxTokens };
        };
        const request = saved ? undefined : await prepareRequest();
        signal?.throwIfAborted();
        await mutateVillageState(
          (state) => {
            claimed = false;
            if (state.seed !== seed) return;
            const current = privatePreparationRooms(state).find(
              (entry) => entry.venue.id === venue.id && entry.zone.id === zone.id,
            );
            if (
              !current ||
              current.zone.preparation?.status !== "pending" ||
              current.zone.preparation.claimId ||
              current.zone.preparation.basis !== zone.preparation?.basis ||
              (current.zone.preparation.attempt ?? 0) !== attempt - 1 ||
              capturePrivateInterior(state, current.venue, current.zone, villageNow().toISOString()).basis !==
                scope.basis
            )
              return;
            current.zone.preparation = claim;
            claimed = true;
          },
          { memories: true },
        );
        if (!claimed) return;
        const assess = (completion: Parameters<typeof readPrivateReply>[0]) => {
          const reply = readPrivateReply(completion, scope);
          if (reply.issues.length) return reply;
          const candidate = {
            ...village,
            venues: village.venues.map((row) =>
              row.id !== venue.id
                ? row
                : {
                    ...row,
                    zones: row.zones?.map((target) =>
                      target.id !== zone.id ? target : { ...target, preparation: claim },
                    ),
                  },
            ),
          };
          try {
            publishPrivateInterior(candidate, scope, claimId, reply, capturedAt);
          } catch {
            reply.issues.push("invalid_room_outcome");
          }
          return reply;
        };
        if (request) {
          await progress("model");
          await recordLoreUse(retainedLore, `Private space · ${venue.name} · ${zone.name}`);
        }
        const result = request
          ? await completeWithRoom(request.connection, request.messages, request.maxTokens, {
              savedRequest: {
                key: requestKey,
                retry: attempt > 1,
                valid: (result) => assess(result).issues.length === 0,
                replayContent: (result) => {
                  const { generated, issues, description, edits } = readPrivateReply(result, scope);
                  if (issues.length) throw new Error("The space response could not be replayed.");
                  return JSON.stringify({
                    loreUse: retainedLore,
                    rooms: [
                      {
                        venueId: venue.id,
                        id: zone.id,
                        name: asTrimmedString(generated.name).slice(0, 100),
                        ...(scope.renovating ? { edits } : { description }),
                        ...(typeof generated.dayNight === "boolean" ? { dayNight: generated.dayNight } : {}),
                      },
                    ],
                  });
                },
              },
              responseFormat: { type: "json_object" },
              temperature: 0.7,
              reasoningEffort: "none",
              usagePurpose: "background",
              debugMode: false,
              signal,
            })
          : saved!;
        await progress("validating");
        const { raw, generated, issues, description, edits } = assess(result);
        if (issues.length) {
          const content = result.content ?? "";
          const entry = {
            ...(request ? responseDiagnostics(request.connection, result, request.maxTokens, raw) : {}),
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
                    : issues.some((issue) => issue === "invalid_room_edits" || issue === "invalid_room_outcome")
                      ? "Space response did not provide valid Room changes."
                      : "Space response did not provide a valid description.";
          throw new Error(problem + " Retry preparation.");
        }
        signal?.throwIfAborted();
        await progress("saving");
        let stale = false;
        await mutateVillageState(
          (state) => {
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
            const at = villageNow().toISOString();
            const currentScope = capturePrivateInterior(state, current.venue, current.zone, at);
            if (currentScope.basis !== scope.basis || current.zone.preparation.basis !== scope.basis) {
              current.zone.preparation = {
                ...current.zone.preparation,
                status: "failed",
                attempt,
                error: "The Room changed during preparation. Revise its specification before preparing it again.",
              };
              stale = true;
              return;
            }
            const target = current.zone;
            publishPrivateInterior(state, currentScope, claimId, { description, edits }, at);
            if (target.name === "Private work area")
              target.name = asTrimmedString(generated.name).slice(0, 100) || target.name;
            if (!scope.renovating || edits.length) {
              const revision = target.pictureRevision ?? 0;
              applyZoneDayNightDefault(target, generated.dayNight as boolean | undefined);
              target.pictureRevision = revision + 1;
              if (target.picture) target.picture = { ...target.picture, dirty: false, claim: undefined };
            }
            target.preparation = {
              status: "ready",
              attempt,
              lore: retainedLore,
            };
          },
          { memories: true },
        );
        if (stale)
          throw new Error("The Room changed during preparation. Revise its specification before preparing it again.");
      } catch (cause) {
        const detail = signal?.aborted
          ? "Preparation was interrupted. Retry deliberately; the previous request may have been charged."
          : safeFailureMessage(cause);
        const error = `${observedZone(zone, !village.foundedAt).name.slice(0, 80)}: ${detail}`.slice(0, 300);
        await mutateVillageState(
          (state) => {
            if (state.seed !== seed) return;
            const currentVenue = state.venues.find((entry) => entry.id === venue.id);
            const target = currentVenue?.zones?.find((entry) => entry.id === zone.id);
            if (
              currentVenue &&
              target?.preparation?.status === "pending" &&
              (claimed
                ? target.preparation.claimId === claimId
                : !target.preparation.claimId &&
                  target.preparation.basis === zone.preparation?.basis &&
                  (target.preparation.attempt ?? 0) === attempt - 1 &&
                  capturePrivateInterior(state, currentVenue, target, villageNow().toISOString()).basis === scope.basis)
            )
              target.preparation = { ...target.preparation, status: "failed", attempt, error };
          },
          { memories: true },
        );
        villagesLogger().warn("[villages] private-space preparation stopped: %s", error);
        throw new Error(error);
      }
    }
  }
  async function retryPrivateSpaces(): Promise<void> {
    await mutateVillageState((state) => {
      for (const { zone } of privatePreparationRooms(state)) retryPrivateInterior(zone);
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
