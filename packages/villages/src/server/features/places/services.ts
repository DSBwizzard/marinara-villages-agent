import { randomUUID } from "node:crypto";
import type { CapabilityLanguageModelCompletion } from "@marinara-engine/shared";
import { z } from "zod";
import { readVillageState, mutateVillageState } from "../world/village-store.js";
import { villagesLanguageModels } from "../../adapters/models/language-models.js";
import { readVillageLore } from "../../adapters/engine/lorebooks.js";
import { villageLoreContext } from "../../domain/rules/lore-context.js";
import { villageNow } from "../../adapters/time/clock-gate.js";
import { villagesConnectionIdFor } from "../settings/connections.js";
import { completeWithRoom } from "../generation/model-requests.js";
import { extractModelJsonObject } from "../../domain/rules/json-reply.js";
import { villageCurrentSetting } from "../../domain/rules/prompt-preset.js";
import { badRequest, conflict, notFound, safeFailureMessage } from "../../domain/rules/errors.js";
import {
  establishPlace,
  PLACE_GENERATION_INSTRUCTION,
  placeDraftSchema,
  projectPlace,
} from "../../domain/rules/place-discovery.js";
import { placeSummary } from "../../domain/rules/places.js";
import type { PlaceDirectory } from "../../../shared/contracts/places.js";
import type { PlaceOperation } from "../../domain/models/places.js";
import { assertMapRevision, villageMap } from "../../domain/rules/village-maps.js";
import { villageWorldScope } from "../../domain/rules/village-identity.js";

export async function listPlaces(query: Record<string, unknown>): Promise<PlaceDirectory> {
  const state = await readVillageState({ memories: true });
  const search = String(query.query ?? "")
    .toLocaleLowerCase()
    .slice(0, 200);
  const start = Number(query.cursor ?? 0),
    limit = Math.min(100, Number(query.limit ?? 50));
  if (!Number.isSafeInteger(start) || start < 0 || !Number.isSafeInteger(limit) || limit < 1)
    throw badRequest("Invalid Places page.");
  // shortcut: directory search scans private records; add a storage index if measured library size needs it.
  const rows = Object.values(state.worldPlaces.places).filter(
    (place) =>
      !place.disabled &&
      place.knownBy.includes("player") &&
      (!query.mapId || place.location.presentation.mapId === query.mapId) &&
      (!search || `${place.location.name} ${place.location.description}`.toLocaleLowerCase().includes(search)),
  );
  const bounds = query.bounds === undefined ? undefined : String(query.bounds).split(",").map(Number);
  if (bounds && (bounds.length !== 4 || bounds.some((n) => !Number.isFinite(n) || n < 0 || n > 1)))
    throw badRequest("Invalid map bounds.");
  const selected = bounds
    ? rows.filter(
        ({ location: { presentation: p } }) =>
          p.x !== null && p.y !== null && p.x >= bounds[0] && p.y >= bounds[1] && p.x <= bounds[2] && p.y <= bounds[3],
      )
    : rows;
  return {
    items: selected.slice(start, start + limit).map(placeSummary),
    nextCursor: start + limit < selected.length ? String(start + limit) : null,
  };
}

export async function readPlace(id: string) {
  const state = await readVillageState({ memories: true });
  const venue = state.venues.find((row) => row.id === id);
  if (venue) return { promoted: true, id };
  const place = state.worldPlaces.places[id];
  if (!place || place.disabled || !place.knownBy.includes("player")) throw notFound("That Place is not known.");
  return { ...placeSummary(place), location: projectPlace(state, place) };
}

export async function placePosition(id: string, value: unknown) {
  const input = z
    .object({
      requestId: z.string().min(1).max(100),
      expectedRevision: z.number().int().positive(),
      expectedMapRevision: z.number().int().nonnegative(),
      mapId: z.string().min(1).max(200),
      x: z.number().min(0.03).max(0.97),
      y: z.number().min(0.03).max(0.97),
    })
    .strict()
    .safeParse(value);
  if (!input.success) throw badRequest("Choose a map position.");
  const row = input.data;
  await mutateVillageState(
    (state) => {
      const place = state.worldPlaces.places[id],
        key = `place-position:${row.requestId}`,
        fingerprint = JSON.stringify([id, row]);
      if (state.worldPlaces.receipts[key]) {
        if (state.worldPlaces.receipts[key] !== fingerprint) throw conflict("This request ID was already used.");
        return;
      }
      if (!place || place.disabled || !place.knownBy.includes("player")) throw notFound("That Place is not known.");
      if (place.revision !== row.expectedRevision) throw conflict("The Place changed. Refresh it.");
      const map = villageMap(state, row.mapId);
      assertMapRevision(map, row.expectedMapRevision);
      if (place.location.presentation.mapId !== map.id) throw conflict("Use this Place's known map.");
      if (
        state.venues.some(
          (venue) =>
            venue.presentation.mapId === map.id &&
            venue.presentation.x !== null &&
            venue.presentation.y !== null &&
            Math.abs(venue.presentation.x - row.x) < 0.055 &&
            Math.abs(venue.presentation.y - row.y) < 0.055,
        )
      )
        throw conflict("That spot overlaps a Venue.");
      Object.assign(place.location.presentation, { x: row.x, y: row.y });
      place.revision++;
      map.revision++;
      state.worldPlaces.revision++;
      state.worldPlaces.receipts[key] = fingerprint;
    },
    { memories: true },
  );
  return readPlace(id);
}

const requestSchema = z
  .object({
    worldScope: z.string().min(1).max(100),
    requestId: z.string().min(1).max(100),
    mapId: z.string().min(1).max(200),
    intent: z.string().trim().max(1000).default(""),
    expectedRevision: z.number().int().nonnegative().optional(),
  })
  .strict();
const publicOperation = (operation: PlaceOperation) => ({
  id: operation.id,
  attempt: operation.attempt,
  kind: operation.kind,
  status: operation.status,
  placeId: operation.placeId,
});

export async function generatePlace(value: unknown, placeId?: string) {
  const parsed = requestSchema.safeParse(value);
  if (!parsed.success) throw badRequest("Invalid Place request.");
  const input = parsed.data;
  const world = await readVillageState({ memories: true });
  if (input.worldScope !== villageWorldScope(world)) throw conflict("The Village changed. Open a fresh Place request.");
  if (!world.setupAt || !world.maps.some((map) => map.id === input.mapId))
    throw conflict("Choose a founded Village map.");
  const kind = placeId ? "prepare" : "explore";
  const priorPlace = placeId ? world.worldPlaces.places[placeId] : undefined;
  if (placeId && (!priorPlace || priorPlace.disabled || !priorPlace.knownBy.includes("player")))
    throw notFound("That Place is not known.");
  if (priorPlace?.prepared) return { placeId: priorPlace.id, status: "ready" };
  if (priorPlace && input.expectedRevision !== priorPlace.revision)
    throw conflict("The Place changed. Refresh it first.");
  const fingerprint = JSON.stringify([kind, placeId ?? "", input.mapId, input.intent, input.expectedRevision]);
  let operation = world.worldPlaces.operations[input.requestId];
  if (operation && operation.fingerprint !== fingerprint) throw conflict("This request ID was already used.");
  if (operation && operation.status !== "started") return publicOperation(operation);
  if (!operation) {
    const lore = await readVillageLore(
      world.selectedLorebookIds,
      `${villageLoreContext(world)}\n${input.intent}\n${priorPlace?.location.name ?? ""}`,
      undefined,
      world.loreTokenBudget,
    );
    const messages = [
      { role: "system" as const, content: PLACE_GENERATION_INSTRUCTION },
      {
        role: "user" as const,
        content: JSON.stringify({
          task: kind,
          intent: input.intent,
          setting: villageCurrentSetting(world),
          rules: world.worldRules,
          lore,
          existingPlace: priorPlace?.location,
          nativeVenues: world.venues
            .filter((venue) => venue.presentation.mapId === input.mapId)
            .map((venue) => ({ id: venue.id, name: venue.name, description: venue.description })),
          relatedPlaces: Object.values(world.worldPlaces.places)
            .filter((row) => !row.disabled && row.location.presentation.mapId === input.mapId)
            .slice(-8)
            .map(placeSummary),
          knownPeople: Object.values(world.worldPlaces.npcs)
            .filter((row) => !row.disabled && row.associations.some((association) => association.placeId === placeId))
            .slice(0, 4),
        }),
      },
    ];
    operation = {
      id: input.requestId,
      attempt: 1,
      fingerprint,
      kind,
      placeId: placeId ?? `place:${randomUUID()}`,
      status: "started",
      input: { mapId: input.mapId, intent: input.intent, placeRevision: priorPlace?.revision },
      messages,
      connectionId: (
        await villagesLanguageModels().resolveForRequest({ connectionId: await villagesConnectionIdFor("system") })
      ).connectionId,
    };
    const admitted = operation;
    await mutateVillageState(
      (state) => {
        if (state.seed !== world.seed) throw conflict("The Village changed.");
        const existing = state.worldPlaces.operations[input.requestId];
        if (existing && existing.fingerprint !== fingerprint) throw conflict("This request ID was already used.");
        state.worldPlaces.operations[input.requestId] ??= admitted;
        operation = state.worldPlaces.operations[input.requestId];
        state.worldPlaces.revision++;
      },
      { memories: true },
    );
  }
  let admitted = operation!;
  const packet = JSON.parse(admitted.messages[1].content) as {
    relatedPlaces: { id: string }[];
    knownPeople: { id: string }[];
    nativeVenues: { id: string }[];
    existingPlace?: { access?: { managerIds: string[] } };
  };
  const candidateIds = new Set([...packet.relatedPlaces, ...packet.nativeVenues].map((row) => row.id));
  const npcIds = new Set(packet.knownPeople.map((row) => row.id));
  const validateDraft = (value: unknown) => {
    const draft = placeDraftSchema.parse(value),
      refs = new Set(draft.people.map((person) => person.ref));
    if (
      draft.people.some((person) => person.existingId && !npcIds.has(person.existingId)) ||
      [...draft.controllers, ...draft.zones.flatMap((zone) => zone.controllers)].some(
        (id) => !refs.has(id) && !npcIds.has(id) && !packet.existingPlace?.access?.managerIds.includes(id),
      )
    )
      throw badRequest("The Place introduced authority outside its supplied identities.");
    return draft;
  };
  const valid = (answer: CapabilityLanguageModelCompletion) => {
    const raw = extractModelJsonObject(answer);
    if (answer.finishReason === "length" || !raw) return false;
    if (raw.existingId !== undefined)
      return kind === "explore" && typeof raw.existingId === "string" && candidateIds.has(raw.existingId);
    if (raw.place === null) return kind === "explore";
    establishPlace(
      { ...world, worldPlaces: structuredClone(world.worldPlaces) },
      validateDraft(raw.place),
      admitted.placeId,
      admitted.input.mapId,
      `request:${admitted.id}`,
      villageNow().toISOString(),
      true,
      priorPlace,
    );
    return true;
  };
  try {
    if (admitted.attempt > 2) throw conflict("This exploration attempt has ended.");
    const model = await villagesLanguageModels().resolveForRequest({ connectionId: admitted.connectionId });
    const fitted = model.fitContext(admitted.messages, { maxTokens: 4096 });
    if (fitted.trimmed || JSON.stringify(fitted.messages) !== JSON.stringify(admitted.messages))
      throw badRequest("The Place request does not fit the System context. No request was made.");
    let completion;
    for (;;) {
      try {
        completion = await completeWithRoom(model, admitted.messages, Math.min(4096, fitted.maxTokens ?? 4096), {
          temperature: 0.3,
          responseFormat: { type: "json_object" },
          retryEmpty: false,
          savedRequest: {
            key: `place:${world.seed}:${admitted.id}:${admitted.attempt}`,
            retry: false,
            valid,
          },
        });
        if (!valid(completion)) throw badRequest("Incomplete Place response.");
        break;
      } catch (error) {
        if (admitted.attempt >= 2) throw error;
        const attempt = admitted.attempt;
        await mutateVillageState(
          (state) => {
            const saved = state.worldPlaces.operations[admitted.id];
            if (state.seed !== world.seed || !saved) throw conflict("This request already changed.");
            if (saved.attempt === attempt && saved.status === "started") {
              saved.attempt++;
              state.worldPlaces.revision++;
            }
            admitted = saved;
          },
          { memories: true },
        );
        if (admitted.status !== "started") return publicOperation(admitted);
      }
    }
    const raw = extractModelJsonObject(completion)!;
    await mutateVillageState(
      (state) => {
        if (state.seed !== world.seed) throw conflict("The Village changed.");
        const saved = state.worldPlaces.operations[admitted.id];
        operation = saved;
        if (saved.status === "ready") return;
        if (saved.attempt !== admitted.attempt) throw conflict("A newer Place request replaced this response.");
        const prior = placeId ? state.worldPlaces.places[placeId] : undefined;
        if (placeId && (!prior || prior.revision !== admitted.input.placeRevision))
          throw conflict("The Place changed during preparation.");
        if (typeof raw.existingId === "string") {
          const existing = state.worldPlaces.places[raw.existingId];
          if (
            kind !== "explore" ||
            !candidateIds.has(raw.existingId) ||
            (!existing && !state.venues.some((venue) => venue.id === raw.existingId)) ||
            existing?.disabled
          )
            throw conflict("The selected Place is unavailable.");
          if (existing) {
            existing.knownBy = [...new Set([...existing.knownBy, "player"])];
            existing.revision++;
          }
          saved.placeId = raw.existingId;
        } else if (raw.place === null) {
          if (placeId) throw badRequest("The known Place could not be prepared. Its discovery is retained.");
          saved.placeId = "";
        } else
          establishPlace(
            state,
            validateDraft(raw.place),
            admitted.placeId,
            input.mapId,
            `request:${admitted.id}`,
            villageNow().toISOString(),
            true,
            prior,
          );
        saved.status = "ready";
        delete saved.error;
        state.worldPlaces.revision++;
        operation = saved;
      },
      { memories: true },
    );
    return publicOperation(operation!);
  } catch (error) {
    await mutateVillageState(
      (state) => {
        if (state.seed !== world.seed) return;
        const saved = state.worldPlaces.operations[admitted.id];
        if (saved?.attempt === admitted.attempt && saved.status !== "ready") {
          saved.status = "failed";
          saved.error = safeFailureMessage(error);
          state.worldPlaces.revision++;
        }
      },
      { memories: true },
    );
    return { ...publicOperation(admitted), status: "failed" as const };
  }
}
