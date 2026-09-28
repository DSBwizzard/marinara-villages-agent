import type { CapabilityLanguageModelMessage } from "@marinara-engine/shared";
import { villagesConnectionIdFor } from "./connections.js";
import { badRequest, conflict, notFound } from "./errors.js";
import { completeWithRoom, villagesLanguageModels, villagesLogger } from "./package-runtime.js";
import {
  boundText,
  MAX_PLACES,
  MAX_VENUES,
  MAX_VENUE_DESCRIPTION_LENGTH,
  MAX_VENUE_NOTE_LENGTH,
  remapVenues,
} from "./prompt-preset.js";
import type {
  VillageState,
  VillageVenue,
  VillageVenueClass,
  VillageVenueImprovement,
  VillageVenueMail,
  VillageResidence,
} from "./types.js";
import { hashString, randomVillageSeed } from "./village-clock.js";
import { mutateVillageState, readVillageState } from "./village-store.js";
import { extractJsonObject } from "./village-bootstrap.js";
import type { VenueRequestCore } from "./venue-requests.js";
import {
  defaultVenueSpace,
  hasVenueClass,
  venueAssignedCount,
  venueCapacity,
  venueResidentIds,
  validVenueClasses,
} from "./venue-model.js";

function readChange(value: unknown): {
  classes?: VillageVenueClass[];
  capacity?: number;
  slot?: number;
  improvement?: VillageVenueImprovement;
  title: string;
  detail: string;
} {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw badRequest("Describe the Venue proposal.");
  const row = value as Record<string, unknown>;
  if (row.classes !== undefined && !validVenueClasses(row.classes))
    throw badRequest("Choose one or two Venue Classes.");
  if (
    row.capacity !== undefined &&
    (!Number.isInteger(row.capacity) || Number(row.capacity) < 1 || Number(row.capacity) > 4)
  )
    throw badRequest("Residence capacity is one to four people.");
  const slot = row.slot;
  if (slot !== undefined && slot !== 0 && slot !== 1) throw badRequest("Choose one of the two improvement slots.");
  const proposal = row.improvement;
  if (
    proposal !== undefined &&
    (slot === undefined || !proposal || typeof proposal !== "object" || Array.isArray(proposal))
  )
    throw badRequest("An improvement needs a slot, title, and description.");
  const improvementRow = proposal as Record<string, unknown> | undefined;
  const improvement = improvementRow
    ? {
        id: randomVillageSeed(),
        title: boundText(improvementRow.title, MAX_VENUE_NOTE_LENGTH).trim(),
        description: boundText(improvementRow.description, MAX_VENUE_DESCRIPTION_LENGTH).trim(),
        spaceId: typeof improvementRow.spaceId === "string" && improvementRow.spaceId ? improvementRow.spaceId : null,
        extraBeds: Number(improvementRow.extraBeds ?? 0),
        approvedAt: "",
      }
    : undefined;
  if (
    improvement &&
    (!improvement.title ||
      !improvement.description ||
      !Number.isInteger(improvement.extraBeds) ||
      improvement.extraBeds < 0 ||
      improvement.extraBeds > 3)
  )
    throw badRequest("An improvement needs a title, description, and up to three extra beds.");
  if (row.classes === undefined && row.capacity === undefined && improvement === undefined)
    throw badRequest("Choose a Class, capacity, or improvement change.");
  return {
    ...(validVenueClasses(row.classes) ? { classes: row.classes } : {}),
    ...(typeof row.capacity === "number" ? { capacity: row.capacity } : {}),
    ...(typeof slot === "number" ? { slot } : {}),
    ...(improvement ? { improvement } : {}),
    title: boundText(row.title, MAX_VENUE_NOTE_LENGTH).trim() || "Venue change",
    detail: boundText(row.detail, MAX_VENUE_DESCRIPTION_LENGTH).trim(),
  };
}

function proposedCapacity(venue: VillageVenue, mail: VillageVenueMail): number {
  const base = mail.proposedCapacity ?? venue.residenceCapacity ?? 1;
  const improvements = [...(venue.improvements ?? [null, null])];
  if (mail.improvementSlot !== undefined) improvements[mail.improvementSlot] = mail.improvement ?? null;
  return base + improvements.reduce((sum, entry) => sum + (entry?.extraBeds ?? 0), 0);
}

function validateMail(state: VillageState, mail: VillageVenueMail): VillageVenue | null {
  if (mail.kind === "counteroffer") {
    const request = state.pendingDecisions.find(
      (entry) => entry.id === mail.counterofferRequestId && entry.kind === "venue" && entry.status === "countered",
    );
    if (!request || !mail.counterofferDraft) throw conflict("The original Venue request is no longer available.");
    if (state.venues.length >= MAX_PLACES || remapVenues(state.venues).length >= MAX_VENUES)
      throw conflict("The village has no room for another Venue.");
    if (state.venues.some((entry) => entry.name.toLowerCase() === mail.counterofferDraft!.name.toLowerCase()))
      throw conflict("A Venue with that name already exists.");
    return null;
  }
  const venue = state.venues.find((entry) => entry.id === mail.venueId);
  if (!venue) throw notFound("That Venue no longer exists.");
  if (mail.kind === "player-move") {
    if (!hasVenueClass(venue, "residence")) throw conflict("The destination is no longer a Residence.");
    if (venue.occupancy.playerHome) throw conflict("You already live here.");
    if (venueAssignedCount(venue) >= venueCapacity(venue)) throw conflict("This Residence has no available bed.");
    return venue;
  }
  if (mail.kind === "villager-move") {
    const residence = state.residences.find(
      (entry) =>
        entry.characterId === mail.movingCharacterId &&
        entry.proposedVenueId === mail.venueId &&
        entry.status === "pending",
    );
    if (!residence) throw conflict("That villager's move is no longer pending.");
    if (!hasVenueClass(venue, "residence") || venueAssignedCount(venue) >= venueCapacity(venue))
      throw conflict("The destination no longer has an available bed.");
    return venue;
  }
  const classes = mail.proposedClasses ?? venue.classes ?? ["other"];
  if (proposedCapacity(venue, mail) > 4) throw badRequest("A Residence cannot exceed four people, including you.");
  if (!classes.includes("residence") && venueAssignedCount(venue) > 0)
    throw conflict("Move every resident before removing Residence.");
  if (!classes.includes("workplace") && (venue.workerIds?.length ?? 0) > 0)
    throw conflict("Unassign every worker before removing Workplace.");
  if (classes.includes("residence") && venueAssignedCount(venue) > proposedCapacity(venue, mail))
    throw conflict("The change would displace a resident.");
  if (mail.improvement && mail.improvement.spaceId && !classes.includes(mail.improvement.spaceId as VillageVenueClass))
    throw badRequest("The improvement must belong to one of this Venue's spaces.");
  return venue;
}

function applyMail(state: VillageState, mail: VillageVenueMail, at: string): void {
  const venue = validateMail(state, mail);
  if (mail.kind === "counteroffer") {
    const draft = mail.counterofferDraft!;
    const request = state.pendingDecisions.find((entry) => entry.id === mail.counterofferRequestId)!;
    state.venues.push({
      id: randomVillageSeed(),
      name: draft.name,
      form: "",
      spaces: draft.classes.map((venueClass) => defaultVenueSpace(venueClass, draft.description)),
      residenceCapacity: 1,
      residentIds: [],
      improvements: [null, null],
      classes: draft.classes,
      description: draft.description,
      category: "",
      presentation: { image: null, x: null, y: null },
      occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
      capabilities: [],
      workerIds: [],
      state: { condition: "", upgrades: [], furniture: [], publicFacts: [], features: [], traces: [], updatedAt: at },
    });
    request.status = "approved";
  } else if (mail.kind === "villager-move") {
    const residence = state.residences.find(
      (entry) => entry.characterId === mail.movingCharacterId && entry.proposedVenueId === mail.venueId,
    )!;
    residence.status = "moving";
    residence.villagerDecision = "approved";
    residence.approvedAt = at;
    residence.completesAt = new Date(Date.parse(at) + 24 * 60 * 60_000).toISOString();
  } else if (mail.kind === "player-move") {
    for (const current of state.venues) current.occupancy.playerHome = false;
    venue!.occupancy.playerHome = true;
  } else {
    if (mail.proposedClasses) {
      venue!.classes = mail.proposedClasses;
      venue!.spaces = mail.proposedClasses.map(
        (item) =>
          venue!.spaces?.find((space) => space.venueClass === item) ?? {
            id: item,
            venueClass: item,
            description: venue!.description,
            image: null,
            state: { condition: "", items: [], publicFacts: [], features: [], traces: [], updatedAt: at },
          },
      );
    }
    if (mail.proposedCapacity !== undefined) venue!.residenceCapacity = mail.proposedCapacity;
    if (mail.improvementSlot !== undefined) {
      venue!.improvements = [...(venue!.improvements ?? [null, null])];
      venue!.improvements[mail.improvementSlot] = mail.improvement ? { ...mail.improvement, approvedAt: at } : null;
    }
  }
  mail.status = "approved";
  mail.resolvedAt = at;
}

function addMail(state: VillageState, mail: VillageVenueMail): void {
  if (
    state.venueMail.some(
      (entry) =>
        entry.venueId === mail.venueId && (entry.status === "pending-player" || entry.status === "awaiting-villagers"),
    )
  )
    throw conflict("Another Venue decision is awaiting replies here.");
  validateMail(state, mail);
  if (mail.affectedIds.length === 0) applyMail(state, mail, mail.createdAt);
  state.venueMail = [...state.venueMail, mail].slice(-256);
}

function dueAt(id: string, at: Date): string {
  return new Date(at.getTime() + (1 + (hashString(id) % 24)) * 60 * 60_000).toISOString();
}

export async function proposeVenueChange(venueId: string, value: unknown): Promise<void> {
  const change = readChange(value);
  const id = randomVillageSeed();
  const at = new Date();
  await mutateVillageState((state) => {
    const venue = state.venues.find((entry) => entry.id === venueId);
    if (!venue) throw notFound("That Venue no longer exists.");
    const affectedIds = [...new Set([...venueResidentIds(venue), ...(venue.workerIds ?? [])])];
    addMail(state, {
      id,
      venueId,
      kind: "change",
      title: change.title,
      detail: change.detail,
      status: "awaiting-villagers",
      createdAt: at.toISOString(),
      dueAt: dueAt(id, at),
      resolvedAt: "",
      requesterCharacterId: "",
      affectedIds,
      decisions: [],
      error: "",
      proposedClasses: change.classes,
      proposedCapacity: change.capacity,
      improvementSlot: change.slot,
      improvement: change.improvement,
    });
  });
}

export async function proposePlayerMove(venueId: string): Promise<void> {
  const id = randomVillageSeed();
  const at = new Date();
  await mutateVillageState((state) => {
    const venue = state.venues.find((entry) => entry.id === venueId);
    if (!venue) throw notFound("That Residence no longer exists.");
    addMail(state, {
      id,
      venueId,
      kind: "player-move",
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

export function queueSharedMoveConsent(state: VillageState, residence: VillageResidence, now: Date): void {
  const venue = state.venues.find((entry) => entry.id === residence.proposedVenueId);
  if (!venue) throw notFound("That Residence no longer exists.");
  const affectedIds = venueResidentIds(venue).filter((id) => id !== residence.characterId);
  if (!affectedIds.length) throw badRequest("No other resident's consent is needed.");
  const id = randomVillageSeed();
  addMail(state, {
    id,
    venueId: venue.id,
    kind: "villager-move",
    title: `Share ${venue.name}`,
    detail: `${state.villagers.find((entry) => entry.characterId === residence.characterId)?.cardSnapshot.name ?? "A villager"} asks to live here.`,
    status: "awaiting-villagers",
    createdAt: now.toISOString(),
    dueAt: dueAt(id, now),
    resolvedAt: "",
    requesterCharacterId: residence.characterId,
    movingCharacterId: residence.characterId,
    affectedIds,
    decisions: [],
    error: "",
  });
}

export function queueVenueCounteroffer(
  state: VillageState,
  requestId: string,
  core: VenueRequestCore,
  description: string,
  at: Date,
): void {
  const request = state.pendingDecisions.find(
    (entry) => entry.id === requestId && entry.kind === "venue" && entry.status === "pending",
  );
  if (!request || !request.requesterCharacterId) throw notFound("That Venue request is no longer pending.");
  const id = randomVillageSeed();
  const mail: VillageVenueMail = {
    id,
    venueId: requestId,
    kind: "counteroffer",
    title: `Counteroffer: ${core.name}`,
    detail: `Original: ${request.venueDraft?.name} — ${request.venueDraft?.classes.join(" / ")}. Counteroffer: ${core.name} — ${core.classes.join(" / ")}.`,
    status: "awaiting-villagers",
    createdAt: at.toISOString(),
    dueAt: dueAt(id, at),
    resolvedAt: "",
    requesterCharacterId: request.requesterCharacterId,
    affectedIds: [request.requesterCharacterId],
    decisions: [],
    error: "",
    counterofferRequestId: requestId,
    counterofferDraft: { ...core, description },
  };
  request.status = "countered";
  validateMail(state, mail);
  state.venueMail = [...state.venueMail, mail].slice(-256);
}

export async function recordVillagerVenueImprovement(
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

export async function decideVillagerVenueImprovement(mailId: string, approved: boolean, value: unknown): Promise<void> {
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
    const title = row.title === undefined ? mail.improvement.title : boundText(row.title, MAX_VENUE_NOTE_LENGTH).trim();
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
    const edited =
      title !== mail.improvement.title ||
      description !== mail.improvement.description ||
      extraBeds !== mail.improvement.extraBeds ||
      slot !== mail.improvementSlot;
    mail.improvement = { ...mail.improvement, title, description, extraBeds };
    mail.improvementSlot = slot;
    const venue = state.venues.find((entry) => entry.id === mail.venueId);
    if (!venue) throw notFound("That Venue no longer exists.");
    mail.affectedIds = [...new Set([...venueResidentIds(venue), ...(venue.workerIds ?? [])])].filter(
      (id) => edited || id !== mail.requesterCharacterId,
    );
    validateMail(state, mail);
    if (mail.affectedIds.length === 0) applyMail(state, mail, new Date().toISOString());
    else {
      mail.status = "awaiting-villagers";
      mail.dueAt = dueAt(mail.id, new Date());
    }
  });
}

export async function respondDueVenueMail(now = new Date()): Promise<void> {
  const village = await readVillageState();
  const due = village.venueMail.find(
    (entry) => entry.status === "awaiting-villagers" && Date.parse(entry.dueAt) <= now.getTime(),
  );
  if (!due) return;
  try {
    const model = await villagesLanguageModels().resolveForRequest({
      connectionId: await villagesConnectionIdFor("system"),
    });
    const people = due.affectedIds.map((id) => {
      const villager = village.villagers.find((entry) => entry.characterId === id);
      return { id, name: villager?.cardSnapshot.name ?? id, summary: villager?.cardSnapshot.summary ?? "" };
    });
    const messages: CapabilityLanguageModelMessage[] = [
      {
        role: "system",
        content:
          'Answer as each affected villager to a grounded Venue proposal. Each can accept or decline. Keep each reply short and in character. Return JSON only: {"decisions":[{"characterId":"exact ID","accepted":true,"reply":"short message"}]}. Include every listed person exactly once.',
      },
      {
        role: "user",
        content: JSON.stringify({
          village: village.name,
          venue: village.venues.find((entry) => entry.id === due.venueId)?.name,
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
    await mutateVillageState((state) => {
      const current = state.venueMail.find((entry) => entry.id === due.id);
      if (!current || current.status !== "awaiting-villagers") return;
      current.decisions = decisions;
      current.error = "";
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
    });
  } catch (error) {
    villagesLogger().warn("[villages] Venue Mailbox reply will retry: %s", String(error));
    await mutateVillageState((state) => {
      const current = state.venueMail.find((entry) => entry.id === due.id);
      if (!current || current.status !== "awaiting-villagers") return;
      current.error = boundText(error instanceof Error ? error.message : String(error), MAX_VENUE_NOTE_LENGTH);
      current.dueAt = new Date(now.getTime() + 30 * 60_000).toISOString();
    });
  }
}
