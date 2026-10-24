import { villageNow } from "../../adapters/time/clock-gate.js";
import type { Handler } from "../../domain/models/background-model.js";
import type { readVillageLore } from "../../adapters/engine/lorebooks.js";
import type { villagesLanguageModels } from "../../adapters/models/language-models.js";
import type { outsideVenueOperation } from "../../adapters/operations/operation-context.js";
import type { VillageResidence, VillageSnapshot, VillageVenue } from "../../domain/models/world.js";
import { badRequest, conflict, notFound } from "../../domain/rules/errors.js";
import { extractModelJsonObject } from "../../domain/rules/json-reply.js";
import { boundText, MAX_VENUE_DESCRIPTION_LENGTH } from "../../domain/rules/prompt-preset.js";
import { completeResidenceMove } from "../../domain/rules/residence-move.js";
import { finishDevelopmentMove } from "../../domain/rules/resident-development.js";
import { personalDestinationSpace } from "../../domain/rules/venue-authoring.js";
import { assertResidencePrivateDestination } from "../../domain/rules/venue-layout.js";
import { hasVenueClass, venueAssignedCount, venueCapacity, venueResidentIds } from "../../domain/rules/venue-model.js";
import { residenceCharacterId, residenceVenueId } from "../../domain/rules/world-input.js";
import { backgroundRevision } from "../../domain/rules/background-revision.js";
import type { queueBackgroundJob } from "../../jobs/background-work.js";
import type { preparePrivateSpaces } from "../../jobs/private-space-preparation.js";
import type { completeWithRoom } from "../generation/model-requests.js";
import type { villagesConnectionIdFor } from "../settings/connections.js";
import type { queueSharedMoveConsent } from "../venues/venue-mailbox.js";
import type { buildVillageSnapshot } from "../world/snapshot.js";
import type { mutateVillageState, readVillageState } from "../world/village-store.js";
export interface ResidencePorts {
  readVillageState: typeof readVillageState;
  mutateVillageState: typeof mutateVillageState;
  buildVillageSnapshot: typeof buildVillageSnapshot;
  queueSharedMoveConsent: typeof queueSharedMoveConsent;
  outsideVenueOperation: typeof outsideVenueOperation;
  preparePrivateSpaces: typeof preparePrivateSpaces;
  readVillageLore: typeof readVillageLore;
  queueBackgroundJob: typeof queueBackgroundJob;
  villagesLanguageModels: typeof villagesLanguageModels;
  villagesConnectionIdFor: typeof villagesConnectionIdFor;
  completeWithRoom: typeof completeWithRoom;
}
/** Own residence transitions and archived private-space adaptation through specific connections. */
export function createResidences(ports: ResidencePorts) {
  const {
    readVillageState,
    mutateVillageState,
    buildVillageSnapshot,
    queueSharedMoveConsent,
    outsideVenueOperation,
    preparePrivateSpaces,
    readVillageLore,
    queueBackgroundJob,
    villagesLanguageModels,
    villagesConnectionIdFor,
    completeWithRoom,
  } = ports;
  async function proposeVillageResidence(
    characterValue: unknown,
    venueValue: unknown,
    requestedBy: "player" | "villager" = "player",
    sourceKey = "",
    privateZoneId = "",
  ): Promise<VillageSnapshot> {
    const characterId = residenceCharacterId(characterValue);
    const proposedVenueId = residenceVenueId(venueValue);
    await mutateVillageState((state) => {
      if (sourceKey && state.processedOpportunityIds.includes(sourceKey)) return;
      if (!state.villagers.some((villager) => villager.characterId === characterId)) {
        throw notFound("That villager is not in this village.");
      }
      const destination = state.venues.find((venue) => venue.id === proposedVenueId);
      if (!destination) throw notFound("That place is no longer in the village.");
      if (!hasVenueClass(destination, "residence")) throw badRequest("Choose a Residence for this move.");
      const current = state.residences.find((residence) => residence.characterId === characterId);
      const currentVenueId = state.venues.find((venue) => venueResidentIds(venue).includes(characterId))?.id ?? "";
      if (currentVenueId === proposedVenueId) throw badRequest("That villager already lives there.");
      if (current?.status === "moving" || current?.status === "pending")
        throw conflict("That villager already has a move request in progress.");
      const reserved = state.residences.filter(
        (entry) =>
          entry.characterId !== characterId && entry.proposedVenueId === proposedVenueId && entry.status === "moving",
      ).length;
      if (venueAssignedCount(destination) + reserved >= venueCapacity(destination))
        throw conflict("This Residence has no available bed.");
      assertResidencePrivateDestination(state, destination, characterId, privateZoneId);
      const next: VillageResidence = {
        proposedPrivateZoneId: privateZoneId,
        venueId: currentVenueId,
        characterId,
        status: "pending",
        proposedVenueId,
        requestedAt: villageNow().toISOString(),
        requestedBy,
        villagerDecision: "pending",
      };
      const index = state.residences.findIndex((residence) => residence.characterId === characterId);
      if (index < 0) state.residences.push(next);
      else state.residences[index] = next;
      if (sourceKey) state.processedOpportunityIds = [...state.processedOpportunityIds, sourceKey].slice(-256);
    });
    return buildVillageSnapshot();
  }

  async function approveVillageResidence(characterValue: unknown): Promise<VillageSnapshot> {
    return decideVillageResidence(characterValue, true, "player");
  }

  async function decideVillageResidence(
    characterValue: unknown,
    approved: boolean,
    actor: "player" | "villager",
    operationId?: string,
  ): Promise<VillageSnapshot> {
    const characterId = residenceCharacterId(characterValue);
    await mutateVillageState((state) => {
      if (operationId) {
        const fingerprint = JSON.stringify([characterId, approved, actor]);
        const prior = state.semanticRequestReceipts?.[operationId];
        if (prior && prior !== fingerprint) throw conflict("That residence decision ID belongs to another request.");
        if (prior) return;
        state.semanticRequestReceipts ??= {};
        state.semanticRequestReceipts[operationId] = fingerprint;
      }
      const residence = state.residences.find((entry) => entry.characterId === characterId);
      if (!residence || residence.status !== "pending" || residence.proposedVenueId.length === 0) {
        throw badRequest("That villager has no pending residence change.");
      }
      if (residence.requestedBy === actor) throw badRequest("The requester cannot approve their own move request.");
      if (
        residence.villagerDecision === "approved" &&
        state.venueMail.some(
          (entry) =>
            entry.kind === "villager-move" &&
            entry.movingCharacterId === characterId &&
            entry.status === "awaiting-villagers",
        )
      )
        throw conflict("The household is already considering this move.");
      if (!approved) {
        if (actor === "villager") residence.villagerDecision = "denied";
        state.residences = state.residences.filter((entry) => entry.characterId !== characterId);
        return;
      }
      const nextVenue = state.venues.find((venue) => venue.id === residence.proposedVenueId);
      if (!nextVenue) throw notFound("The proposed residence is no longer in the village.");
      if (!hasVenueClass(nextVenue, "residence")) throw conflict("The destination is no longer a Residence.");
      const reserved = state.residences.filter(
        (entry) =>
          entry.characterId !== characterId && entry.proposedVenueId === nextVenue.id && entry.status === "moving",
      ).length;
      if (venueAssignedCount(nextVenue) + reserved >= venueCapacity(nextVenue))
        throw conflict("This Residence has no available bed.");
      assertResidencePrivateDestination(state, nextVenue, characterId, residence.proposedPrivateZoneId);
      const now = villageNow().getTime();
      if (venueResidentIds(nextVenue).some((id) => id !== characterId)) {
        residence.villagerDecision = "approved";
        queueSharedMoveConsent(state, residence, new Date(now));
        return;
      }
      residence.status = "moving";
      residence.villagerDecision = "approved";
      residence.approvedAt = new Date(now).toISOString();
      residence.completesAt = new Date(now + 24 * 60 * 60_000).toISOString();
    });
    return buildVillageSnapshot();
  }

  /** The clock and debug action share the exact same atomic transition. */
  async function completeVillageResidence(
    characterValue: unknown,
    force = false,
    now = villageNow(),
    queueAdaptation = true,
  ): Promise<VillageSnapshot> {
    const characterId = residenceCharacterId(characterValue);
    let moved = false;
    await mutateVillageState((state) => {
      // Only the winning mutation attempt can authorize post-save preparation.
      moved = false;
      moved = completeResidenceMove(state, characterId, force, now);
      if (moved) finishDevelopmentMove(state, characterId, now.toISOString());
    });
    if (moved && queueAdaptation) {
      await retryResidencePrivateSpaceAdaptation(characterId);
      outsideVenueOperation(() => {
        void preparePrivateSpaces().catch(() => {});
      });
    }
    return buildVillageSnapshot(now);
  }

  function adaptationRevision(venue: VillageVenue, characterId: string): string {
    const room = personalDestinationSpace(venue, characterId);
    return backgroundRevision([
      venue.id,
      venue.name,
      venue.form,
      room?.description,
      room?.roomSpecification,
      room?.state.items,
      room?.state.features,
      room?.adaptationSourceArchiveAt,
    ]);
  }

  /** One bounded System call moves only portable personal details from the archived room. */
  async function retryResidencePrivateSpaceAdaptation(characterValue: unknown): Promise<VillageSnapshot> {
    const characterId = residenceCharacterId(characterValue);
    const village = await readVillageState();
    const destination = village.venues.find((venue) => venueResidentIds(venue).includes(characterId));
    const room = destination && personalDestinationSpace(destination, characterId);
    if (!destination || !room || !room.adaptationPending) return buildVillageSnapshot();
    const archive = village.venues
      .flatMap((venue) => venue.archivedPrivateSpaces ?? [])
      .find((entry) => entry.ownerId === characterId && entry.archivedAt === room.adaptationSourceArchiveAt);
    if (!archive) return buildVillageSnapshot();
    const card = village.villagers.find((person) => person.characterId === characterId)?.cardSnapshot;
    const lore = await readVillageLore(
      village.selectedLorebookIds,
      [village.setting, destination.form, card?.name, card?.personality].filter(Boolean).join("\n"),
      undefined,
      village.loreTokenBudget,
    );
    await queueBackgroundJob({
      kind: "adaptation",
      subjectId: characterId,
      seed: village.seed,
      revision: adaptationRevision(destination, characterId),
      finite: true,
      label: "Adapt " + destination.name + "'s Private Space",
      input: {
        characterId,
        destination,
        archive,
        card,
        lore,
        roomRevision: adaptationRevision(destination, characterId),
        capturedAt: village.villagers.find((resident) => resident.characterId === characterId)?.cardSnapshot.capturedAt,
      },
    });
    return buildVillageSnapshot();
  }

  const adaptationBackgroundHandler: Handler = {
    async generate(input) {
      const { characterId, destination, archive, card, lore } = input;
      const model = await villagesLanguageModels().resolveForRequest({
        connectionId: await villagesConnectionIdFor("system"),
      });
      const messages = [
        {
          role: "system" as const,
          content: `Choose portable personal elements from the archived Private Space and adapt its description to the new Residence form, destinationRoomSpecification and saved destinationRoom. Preserve the destination's structure, equipment and physical condition. Never copy shared furnishings or invent possessions. Return JSON only: {"description":"brief room description","items":["exact portable item from input"],"featureIds":["exact portable feature id from input"]}. Keep the result grounded and concise.`,
        },
        {
          role: "user" as const,
          content: JSON.stringify({
            resident: characterId,
            personality: card?.personality,
            lore,
            destination: destination.name,
            destinationForm: destination.form,
            destinationRoomSpecification: personalDestinationSpace(destination, characterId)?.roomSpecification,
            destinationRoom: personalDestinationSpace(destination, characterId)?.description,
            destinationItems: personalDestinationSpace(destination, characterId)?.state.items,
            archivedDescription: archive.space.description.slice(0, 500),
            archivedItems: archive.space.state.items.slice(0, 24),
            archivedFeatures: archive.space.state.features
              .map((feature) => ({ id: feature.id, text: feature.text }))
              .slice(0, 5),
          }),
        },
      ];
      const fitted = model.fitContext(messages, { maxTokens: Math.min(model.maxOutputTokens ?? 1000, 1000) });
      const completion = await completeWithRoom(model, fitted.messages, fitted.maxTokens ?? 1000, {
        responseFormat: { type: "json_object" },
        retryEmpty: false,
        temperature: 0.4,
        debugMode: false,
      });
      const answer = extractModelJsonObject(completion);
      const description = boundText(answer?.description, MAX_VENUE_DESCRIPTION_LENGTH).trim();
      if (!description) throw new Error("Private space adaptation returned no description.");
      const selectedItems: unknown[] = Array.isArray(answer?.items) ? answer.items : [];
      const items = archive.space.state.items.filter((item) => selectedItems.includes(item));
      const featureIds = Array.isArray(answer?.featureIds) ? answer.featureIds : [];
      const features = archive.space.state.features.filter((feature) => featureIds.includes(feature.id));

      return { description, items, features };
    },
    valid: (state, input) =>
      state.villagers.some(
        (resident) =>
          resident.characterId === input.characterId && resident.cardSnapshot.capturedAt === input.capturedAt,
      ) &&
      state.venues
        .find(
          (venue) =>
            venue.id === input.destination.id && adaptationRevision(venue, input.characterId) === input.roomRevision,
        )
        ?.privateSpaces?.some(
          (space) =>
            space.ownerId === input.characterId &&
            space.adaptationPending &&
            space.adaptationSourceArchiveAt === input.archive.archivedAt,
        ) === true,
    apply(state, input, result) {
      const { characterId, destination, archive } = input;
      const { description, items, features } = result;

      const currentVenue = state.venues.find((venue) => venue.id === destination.id);
      const current = currentVenue && personalDestinationSpace(currentVenue, characterId);
      if (!current?.adaptationPending || current.adaptationSourceArchiveAt !== archive.archivedAt) return;
      current.description = description;
      current.state.items =
        currentVenue?.layoutVersion === 1 ? [...new Set([...current.state.items, ...items])] : items;
      current.state.features =
        currentVenue?.layoutVersion === 1
          ? [...new Map([...current.state.features, ...features].map((feature) => [feature.id, feature])).values()]
          : features;
      current.state.updatedAt = villageNow().toISOString();
      current.adaptationPending = false;
    },
  };
  return {
    proposeVillageResidence,
    approveVillageResidence,
    decideVillageResidence,
    completeVillageResidence,
    retryResidencePrivateSpaceAdaptation,
    adaptationBackgroundHandler,
  };
}
export type Residences = ReturnType<typeof createResidences>;
