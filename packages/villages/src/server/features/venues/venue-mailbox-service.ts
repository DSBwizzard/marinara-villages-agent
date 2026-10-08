import { applyProjectMailboxDecisions } from "../../domain/rules/project-lifecycle-rules.js";
import type { Handler } from "../../domain/models/background-model.js";
import type { villagesLanguageModels } from "../../adapters/models/language-models.js";
import type { VillageVenueMail } from "../../domain/models/world.js";
import { badRequest, conflict, notFound } from "../../domain/rules/errors.js";
import { extractJsonObject } from "../../domain/rules/json-reply.js";
import { renderPlayerRoleContext } from "../../domain/rules/player-role.js";
import { boundText, MAX_VENUE_DESCRIPTION_LENGTH, MAX_VENUE_NOTE_LENGTH } from "../../domain/rules/prompt-preset.js";
import { venueResidentIds } from "../../domain/rules/venue-model.js";
import { randomVillageSeed } from "../../domain/rules/village-clock.js";
import type { queueBackgroundJob } from "../../jobs/background-work.js";
import type { completeWithRoom } from "../generation/model-requests.js";
import type {
  createRenovationProject,
  draftNewVenueProject,
  draftRenovationProject,
} from "../projects/project-lifecycle.js";
import { relationshipWritingPrompt } from "../../domain/rules/relationship-presentation.js";
import type { villagesConnectionIdFor } from "../settings/connections.js";
import type { mutateVillageState, readVillageState } from "../world/village-store.js";
import type { CapabilityLanguageModelMessage } from "@marinara-engine/shared";
import { createVenueMailRules } from "./venue-mail-rules-service.js";

export interface VenueMailboxPorts {
  readVillageState: typeof readVillageState;
  mutateVillageState: typeof mutateVillageState;
  queueBackgroundJob: typeof queueBackgroundJob;
  villagesConnectionIdFor: typeof villagesConnectionIdFor;
  villagesLanguageModels(): Pick<ReturnType<typeof villagesLanguageModels>, "resolveForRequest">;
  completeWithRoom: typeof completeWithRoom;
  createRenovationProject: typeof createRenovationProject;
  draftNewVenueProject: typeof draftNewVenueProject;
  draftRenovationProject: typeof draftRenovationProject;
}
/** Mail commands and reply generation own explicit ports; construction starts no work. */
export function createVenueMailbox({
  readVillageState,
  mutateVillageState,
  queueBackgroundJob,
  villagesConnectionIdFor,
  villagesLanguageModels,
  completeWithRoom,
  createRenovationProject,
  draftNewVenueProject,
  draftRenovationProject,
}: VenueMailboxPorts) {
  const { addMail, applyMail, dueAt, mailRevision } = createVenueMailRules({
    draftNewVenueProject,
    draftRenovationProject,
  });
  async function proposeVenueChange(venueId: string, value: unknown): Promise<void> {
    await createRenovationProject(venueId, value);
  }

  async function proposePlayerMove(venueId: string, privateZoneId = ""): Promise<void> {
    const id = randomVillageSeed();
    const at = new Date();
    await mutateVillageState((state) => {
      const venue = state.venues.find((entry) => entry.id === venueId);
      if (!venue) throw notFound("That Residence no longer exists.");
      addMail(state, {
        id,
        venueId,
        kind: "player-move",
        proposedPrivateZoneId: privateZoneId,
        title: `Move to ${venue.name}`,
        detail: "The player requests a bed in this Residence.",
        status: "awaiting-villagers",
        createdAt: at.toISOString(),
        dueAt: dueAt(id, at),
        resolvedAt: "",
        requesterCharacterId: "",
        affectedIds: venueResidentIds(venue),
        decisions: [],
        error: "",
      });
    });
  }

  async function recordVillagerVenueImprovement(
    characterId: string,
    venueId: string,
    quote: string,
    sourceKey = "",
  ): Promise<void> {
    const text = boundText(quote, MAX_VENUE_NOTE_LENGTH).trim();
    if (text.length < 8) throw badRequest("The villager must actually suggest an improvement.");
    await mutateVillageState((state) => {
      if (sourceKey && state.processedOpportunityIds.includes(sourceKey)) return;
      const venue = state.venues.find((entry) => entry.id === venueId);
      if (!venue || ![...venueResidentIds(venue), ...(venue.workerIds ?? [])].includes(characterId))
        throw badRequest("A current resident or worker must suggest the change.");
      if (
        state.venueMail.some(
          (entry) =>
            entry.venueId === venueId && (entry.status === "pending-player" || entry.status === "awaiting-villagers"),
        )
      )
        throw conflict("A Venue decision is already in progress here.");
      const slot = (venue.improvements ?? [null, null]).findIndex((entry) => entry === null);
      const chosenSlot = slot >= 0 ? slot : 0;
      const id = randomVillageSeed();
      const at = new Date();
      state.venueMail = [
        ...state.venueMail,
        {
          id,
          venueId,
          kind: "villager-change",
          title: `${state.villagers.find((entry) => entry.characterId === characterId)?.cardSnapshot.name ?? "A villager"} suggests an improvement`,
          detail: text,
          status: "pending-player",
          createdAt: at.toISOString(),
          dueAt: "",
          resolvedAt: "",
          requesterCharacterId: characterId,
          affectedIds: [],
          decisions: [],
          error: "",
          improvementSlot: chosenSlot,
          improvement: {
            id: randomVillageSeed(),
            title: text.slice(0, 80),
            description: text,
            spaceId: null,
            extraBeds: 0,
            approvedAt: "",
          },
        } satisfies VillageVenueMail,
      ].slice(-256);
      if (sourceKey) state.processedOpportunityIds = [...state.processedOpportunityIds, sourceKey].slice(-256);
    });
  }

  async function decideVillagerVenueImprovement(mailId: string, approved: boolean, value: unknown): Promise<void> {
    const row = value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
    await mutateVillageState((state) => {
      const mail = state.venueMail.find(
        (entry) => entry.id === mailId && entry.kind === "villager-change" && entry.status === "pending-player",
      );
      if (!mail || !mail.improvement) throw notFound("That improvement request is no longer pending.");
      if (!approved) {
        mail.status = "declined";
        mail.resolvedAt = new Date().toISOString();
        return;
      }
      const title =
        row.title === undefined ? mail.improvement.title : boundText(row.title, MAX_VENUE_NOTE_LENGTH).trim();
      const description =
        row.description === undefined
          ? mail.improvement.description
          : boundText(row.description, MAX_VENUE_DESCRIPTION_LENGTH).trim();
      const extraBeds = row.extraBeds === undefined ? mail.improvement.extraBeds : Number(row.extraBeds);
      const slot = row.slot === undefined ? mail.improvementSlot : Number(row.slot);
      if (
        !title ||
        !description ||
        !Number.isInteger(extraBeds) ||
        extraBeds < 0 ||
        extraBeds > 3 ||
        (slot !== 0 && slot !== 1)
      )
        throw badRequest("Review the improvement title, description, slot, and bed effect.");
      draftRenovationProject(state, mail.venueId, {
        title,
        detail: description,
        slot,
        improvement: { title, description, extraBeds, spaceId: mail.improvement.spaceId },
      });
      mail.status = "approved";
      mail.resolvedAt = new Date().toISOString();
    });
  }

  async function respondDueVenueMail(now = new Date()): Promise<void> {
    const village = await readVillageState();
    const dueMail = village.venueMail.filter(
      (entry) => entry.status === "awaiting-villagers" && Date.parse(entry.dueAt) <= now.getTime(),
    );
    for (const due of dueMail)
      await queueBackgroundJob({
        kind: "mail",
        subjectId: due.id,
        seed: village.seed,
        revision: mailRevision(due),
        finite: true,
        label: due.title,
        legacyError: due.error,
        input: {
          due,
          now: now.toISOString(),
          villageName: village.name,
          playerRole: village.playerRole,
          playerPersonaName: village.playerPersonaName,
          venueName: village.venues.find((entry) => entry.id === due.venueId)?.name,
          villagers: village.villagers
            .filter((entry) => due.affectedIds.includes(entry.characterId))
            .map((entry) => ({
              characterId: entry.characterId,
              capturedAt: entry.cardSnapshot.capturedAt,
              relationship: relationshipWritingPrompt(village, entry.characterId),
              cardSnapshot: { name: entry.cardSnapshot.name, summary: entry.cardSnapshot.summary },
            })),
        },
      });
  }

  const mailBackgroundHandler: Handler = {
    async generate(input) {
      const due: VillageVenueMail = input.due;
      const model = await villagesLanguageModels().resolveForRequest({
        connectionId: await villagesConnectionIdFor("system"),
      });
      const people = due.affectedIds.map((id) => {
        const villager = input.villagers.find((entry: any) => entry.characterId === id);
        return {
          id,
          name: villager?.cardSnapshot.name ?? id,
          summary: villager?.cardSnapshot.summary ?? "",
          relationship: villager?.relationship ?? "",
        };
      });
      const messages: CapabilityLanguageModelMessage[] = [
        {
          role: "system",
          content: [
            'Answer as each affected villager to a grounded Venue proposal. Each can accept or decline. Keep each reply short and in character. Return JSON only: {"decisions":[{"characterId":"exact ID","accepted":true,"reply":"short message"}]}. Include every listed person exactly once.',
            renderPlayerRoleContext(input),
            "Consider your own feelings toward the player alongside personal benefit and availability. Neutral villagers may accept and volunteer. A score is not a veto, and changed feelings never cancel an already accepted commitment.",
          ]
            .filter(Boolean)
            .join("\n\n"),
        },
        {
          role: "user",
          content: JSON.stringify({
            village: input.villageName,
            venue: input.venueName,
            title: due.title,
            detail: due.detail,
            kind: due.kind,
            people,
          }),
        },
      ];
      const fitted = model.fitContext(messages, { maxTokens: Math.min(model.maxOutputTokens ?? 1200, 1200) });
      const completion = await completeWithRoom(model, fitted.messages, fitted.maxTokens ?? 1200, {
        temperature: 0.5,
        debugMode: false,
      });
      const payload = extractJsonObject(completion.content ?? "");
      const rows = Array.isArray(payload?.decisions) ? payload.decisions : [];
      const decisions = due.affectedIds.map((id) => {
        const row = rows.find((entry) => entry && typeof entry === "object" && entry.characterId === id);
        if (!row || typeof row.accepted !== "boolean" || typeof row.reply !== "string")
          throw new Error("The Venue reply was incomplete.");
        return { characterId: id, accepted: row.accepted, reply: boundText(row.reply, MAX_VENUE_NOTE_LENGTH) };
      });

      return decisions;
    },
    valid: (state, input) =>
      input.due.affectedIds.every((id: string) =>
        state.villagers.some(
          (resident) =>
            resident.characterId === id &&
            resident.cardSnapshot.capturedAt ===
              input.villagers.find((person: any) => person.characterId === id)?.capturedAt,
        ),
      ) &&
      (input.due.kind === "counteroffer"
        ? state.pendingDecisions.some(
            (entry) => entry.id === input.due.counterofferRequestId && entry.status === "countered",
          )
        : input.due.kind === "project-approval"
          ? state.projects.some((entry) => entry.id === input.due.projectId && entry.lifecycle?.phase === "approval")
          : state.venues.some((venue) => venue.id === input.due.venueId)) &&
      state.venueMail.some(
        (entry) =>
          entry.id === input.due.id &&
          entry.status === "awaiting-villagers" &&
          mailRevision(entry) === mailRevision(input.due),
      ),
    apply(state, input, decisions) {
      const due: VillageVenueMail = input.due;
      const now = new Date(input.now);

      const current = state.venueMail.find((entry) => entry.id === due.id);
      if (!current || current.status !== "awaiting-villagers") return;
      current.decisions = decisions;
      current.error = "";
      if (current.kind === "project-approval" && current.projectId) {
        applyProjectMailboxDecisions(state, current.projectId, current.id, decisions, now.toISOString());
        current.status = decisions.every((entry) => entry.accepted) ? "approved" : "declined";
        current.resolvedAt = now.toISOString();
        return;
      }
      if (decisions.every((entry) => entry.accepted)) {
        try {
          applyMail(state, current, now.toISOString());
        } catch (error) {
          current.status = "declined";
          current.resolvedAt = now.toISOString();
          current.error = boundText(error instanceof Error ? error.message : String(error), MAX_VENUE_NOTE_LENGTH);
        }
      } else {
        current.status = "declined";
        current.resolvedAt = now.toISOString();
      }
      if (current.status === "declined" && current.kind === "villager-move")
        state.residences = state.residences.filter(
          (entry) =>
            !(
              entry.characterId === current.movingCharacterId &&
              entry.proposedVenueId === current.venueId &&
              entry.status === "pending"
            ),
        );
      if (current.status === "declined" && current.kind === "counteroffer") {
        const request = state.pendingDecisions.find((entry) => entry.id === current.counterofferRequestId);
        if (request?.status === "countered") request.status = "denied";
      }
    },
  };
  return {
    proposeVenueChange,
    proposePlayerMove,
    recordVillagerVenueImprovement,
    decideVillagerVenueImprovement,
    respondDueVenueMail,
    mailBackgroundHandler,
  };
}
export type VenueMailbox = ReturnType<typeof createVenueMailbox>;
