import { randomUUID } from "node:crypto";
import type { CapabilityLanguageModelMessage } from "@marinara-engine/shared";
import { agendaAt } from "./agenda-plan.js";
import { readEffectiveVillagerCard } from "./catalog.js";
import { memoryForVillager } from "./chat.js";
import { asRecord, asString, asTrimmedString } from "./coerce.js";
import { villagesConnectionIdFor } from "./connections.js";
import { VillagesRequestError, badGateway, badRequest, conflict, notFound } from "./errors.js";
import { readVillageLore } from "./lorebooks.js";
import { selectPromptMemories } from "./memory-selection.js";
import { effectiveVillagerReplyGuidance, venueWritingDirection } from "./narration-style.js";
import {
  VILLAGES_PACKAGE_ID,
  completeWithRoom,
  villagesDocuments,
  villagesLanguageModels,
  villagesLogger,
  villagesDebugAgentsEnabled,
} from "./package-runtime.js";
import { MAX_CHRONICLE_LENGTH, prependHappenings, villageNarrativeSetting } from "./prompt-preset.js";
import type { VillageChronicleEntry, VillageState } from "./types.js";
import { deriveVillageMoment } from "./village-clock.js";
import { type DocumentSlot, mutateDocument, mutateVillageState, readVillageState } from "./village-store.js";
import {
  decideVillageResidence,
  applyResidenceEditApproval,
  proposeVillageResidence,
  readPlayerIdentity,
  rollActiveAgendas,
  villagerPlaceView,
} from "./village.js";
import { proposeWishVerdict } from "./wishes.js";
import { extractJsonObject } from "./village-bootstrap.js";
import type { VenueActionResult } from "./venue-actions.js";
import { applyVenueSceneChange, readVenueSceneChange, type VenueSceneChange } from "./venue-scene-state.js";
import { venueClasses, venueInArea, venueResidentIds } from "./venue-model.js";
import { recordVillagerVenueImprovement } from "./venue-mailbox.js";
import type { VillageVenueClass } from "./types.js";

export type VenueLine = {
  id: string;
  speakerId: string;
  name: string;
  role: "user" | "assistant";
  content: string;
  at: string;
  heardBy: string[];
  kind?: "narration" | "dialogue" | "side" | "whisper";
  expression?: string;
  targetId?: string;
  asideFor?: string;
};

export type VenueParticipant = { characterId: string; name: string; doing: string };
type VenueSubmission = {
  id: string;
  message: string;
  mode: "chat" | "ask" | "fulfill" | "act" | "leave";
  targetId: string;
  areaAtTurn?: VenueSession["area"];
  privateOwnerIdAtTurn?: string;
  verdict: { fulfilled: boolean; reason: string } | null;
  wishId: string;
  wishMemory: string;
  action?: VenueActionResult;
  actionReplyDone?: boolean;
  sceneChange?: VenueSceneChange;
  residenceSignal?: { kind: "request" | "decision"; characterId: string; venueId: string; approved?: boolean };
  upgradeSignal?: { characterId: string; venueId: string; quote: string };
  invitationSignal?: {
    residentId: string;
    venueId: string;
    scope: "shared" | "private";
    timing: "now" | "later";
    ownerId: string;
    quote: string;
    sourceLineId?: string;
  };
  editApprovalSignal?: {
    proposalId: string;
    residentId: string;
    approved: boolean;
    quote: string;
    sourceLineId?: string;
  };
  turnMemories?: VenueMemory[];
  recordEvents?: VenueRecordEvent[];
  at?: string;
};

type VenueMemory = { characterId: string; text: string; lineIds?: string[] };
export type VenueRecordEvent = { id: string; kind: "memory" | "wish" | "venue" | "request"; text: string };
type MemoryProgress = { nextUnit: number; entries: VenueMemory[] };

/** One document is both the active transcript and the player's durable visit archive. */
export type VenueSession = {
  version: 1;
  id: string;
  placeId: string;
  placeName: string;
  spaceClass?: VillageVenueClass;
  area: "outside" | "shared" | "private" | "public";
  privateOwnerId: string;
  privateAccessOwnerId: string;
  startedAt: string;
  endedAt: string;
  lastActivityAt: string;
  endReason: "player" | "scene" | "inactivity" | "debug" | "";
  memoryMode: "turn" | "end";
  status: "opening" | "active" | "closing" | "closed";
  participants: VenueParticipant[];
  activeIds: string[];
  lines: VenueLine[];
  heardHistory: { characterId: string; lineIds: string[] }[];
  submissions: VenueSubmission[];
  memories: VenueMemory[] | null;
  memoryProgress: MemoryProgress | null;
  memoryPending: boolean;
  recap: string;
};

type ActiveVenue = { sessionId: string; placeId: string };
const ACTIVE_ID = "villages-active-venue";
const SESSION_PREFIX = "villages-venue-visit-";
const SESSION_KIND = "venue-visit";
const VENUE_REPLY_MAX_TOKENS = 4_096;
const VENUE_REPLY_TEMPERATURE = 0.85;
const INACTIVITY_MS = 30 * 60 * 1000;
const ACTIVITY_WRITE_MS = 15 * 1000;

function coerceActive(value: unknown): ActiveVenue {
  const raw = asRecord(value);
  return { sessionId: asTrimmedString(raw.sessionId), placeId: asTrimmedString(raw.placeId) };
}

const activeSlot: DocumentSlot<ActiveVenue> = {
  kind: "venue-active",
  name: "Active venue conversation",
  description: "The one venue conversation the player is in.",
  coerce: coerceActive,
  label: () => "Active venue conversation",
};

function coerceSession(value: unknown): VenueSession {
  const raw = asRecord(value);
  const participants = Array.isArray(raw.participants)
    ? raw.participants
        .map((value) => {
          const row = asRecord(value);
          return {
            characterId: asTrimmedString(row.characterId),
            name: asTrimmedString(row.name),
            doing: asTrimmedString(row.doing),
          };
        })
        .filter((person) => person.characterId && person.name)
    : [];
  const lines: VenueLine[] = Array.isArray(raw.lines)
    ? raw.lines
        .map((value) => {
          const row = asRecord(value);
          return {
            id: asTrimmedString(row.id),
            speakerId: asString(row.speakerId),
            name: asString(row.name),
            role: row.role === "user" ? ("user" as const) : ("assistant" as const),
            content: asString(row.content),
            at: asString(row.at),
            heardBy: Array.isArray(row.heardBy) ? row.heardBy.filter((id): id is string => typeof id === "string") : [],
            ...(row.kind === "narration" || row.kind === "dialogue" || row.kind === "side" || row.kind === "whisper"
              ? { kind: row.kind as VenueLine["kind"] }
              : {}),
            ...(typeof row.expression === "string" ? { expression: row.expression } : {}),
            ...(typeof row.targetId === "string" ? { targetId: row.targetId } : {}),
            ...(typeof row.asideFor === "string" ? { asideFor: row.asideFor } : {}),
          };
        })
        .filter((line) => line.id && line.content)
    : [];
  return {
    version: 1,
    id: asTrimmedString(raw.id),
    placeId: asTrimmedString(raw.placeId),
    placeName: asTrimmedString(raw.placeName),
    spaceClass:
      raw.spaceClass === "residence" ||
      raw.spaceClass === "workplace" ||
      raw.spaceClass === "gathering" ||
      raw.spaceClass === "other"
        ? raw.spaceClass
        : undefined,
    area:
      raw.area === "outside" || raw.area === "shared" || raw.area === "private" || raw.area === "public"
        ? raw.area
        : raw.spaceClass === "residence"
          ? "shared"
          : "public",
    privateOwnerId: asTrimmedString(raw.privateOwnerId),
    privateAccessOwnerId: asTrimmedString(raw.privateAccessOwnerId),
    startedAt: asString(raw.startedAt),
    endedAt: asString(raw.endedAt),
    lastActivityAt: asString(raw.lastActivityAt) || asString(raw.startedAt),
    endReason:
      raw.endReason === "player" ||
      raw.endReason === "scene" ||
      raw.endReason === "inactivity" ||
      raw.endReason === "debug"
        ? raw.endReason
        : "",
    memoryMode: raw.memoryMode === "turn" ? "turn" : "end",
    status: raw.status === "opening" || raw.status === "closing" || raw.status === "closed" ? raw.status : "active",
    participants,
    activeIds: Array.isArray(raw.activeIds) ? raw.activeIds.filter((id): id is string => typeof id === "string") : [],
    lines,
    heardHistory: Array.isArray(raw.heardHistory)
      ? raw.heardHistory
          .map((value) => {
            const row = asRecord(value);
            return {
              characterId: asTrimmedString(row.characterId),
              lineIds: Array.isArray(row.lineIds)
                ? row.lineIds.filter((id): id is string => typeof id === "string")
                : [],
            };
          })
          .filter((entry) => participants.some((person) => person.characterId === entry.characterId))
      : participants.map((person) => ({
          characterId: person.characterId,
          lineIds: lines.filter((line) => line.heardBy.includes(person.characterId)).map((line) => line.id),
        })),
    submissions: Array.isArray(raw.submissions)
      ? raw.submissions
          .map((value) => {
            const row = asRecord(value);
            return {
              id: asTrimmedString(row.id),
              message: asString(row.message),
              mode:
                row.mode === "leave"
                  ? ("leave" as const)
                  : row.mode === "act"
                    ? ("act" as const)
                    : row.mode === "fulfill"
                      ? ("fulfill" as const)
                      : row.mode === "ask"
                        ? ("ask" as const)
                        : ("chat" as const),
              targetId: asString(row.targetId),
              ...(row.areaAtTurn === "outside" ||
              row.areaAtTurn === "shared" ||
              row.areaAtTurn === "private" ||
              row.areaAtTurn === "public"
                ? { areaAtTurn: row.areaAtTurn as VenueSession["area"] }
                : {}),
              ...(typeof row.privateOwnerIdAtTurn === "string"
                ? { privateOwnerIdAtTurn: row.privateOwnerIdAtTurn }
                : {}),
              verdict:
                row.verdict && typeof asRecord(row.verdict).fulfilled === "boolean"
                  ? {
                      fulfilled: asRecord(row.verdict).fulfilled === true,
                      reason: asString(asRecord(row.verdict).reason),
                    }
                  : null,
              wishId: asString(row.wishId),
              wishMemory: asString(row.wishMemory),
              ...(row.action ? { action: row.action as VenueActionResult } : {}),
              ...(row.actionReplyDone === true ? { actionReplyDone: true } : {}),
              ...(row.sceneChange ? { sceneChange: row.sceneChange as VenueSceneChange } : {}),
              ...(row.residenceSignal
                ? { residenceSignal: row.residenceSignal as VenueSubmission["residenceSignal"] }
                : {}),
              ...(row.upgradeSignal ? { upgradeSignal: row.upgradeSignal as VenueSubmission["upgradeSignal"] } : {}),
              ...(row.invitationSignal
                ? { invitationSignal: row.invitationSignal as VenueSubmission["invitationSignal"] }
                : {}),
              ...(row.editApprovalSignal
                ? { editApprovalSignal: row.editApprovalSignal as VenueSubmission["editApprovalSignal"] }
                : {}),
              ...(Array.isArray(row.turnMemories) ? { turnMemories: row.turnMemories as VenueMemory[] } : {}),
              ...(Array.isArray(row.recordEvents) ? { recordEvents: row.recordEvents as VenueRecordEvent[] } : {}),
              ...(typeof row.at === "string" ? { at: row.at } : {}),
            };
          })
          .filter((entry) => entry.id)
      : [],
    memories: Array.isArray(raw.memories)
      ? raw.memories
          .map((value) => ({
            characterId: asTrimmedString(asRecord(value).characterId),
            text: asTrimmedString(asRecord(value).text),
            lineIds: Array.isArray(asRecord(value).lineIds)
              ? (asRecord(value).lineIds as unknown[]).filter((id): id is string => typeof id === "string")
              : [],
          }))
          .filter((entry) => entry.characterId && entry.text)
      : null,
    memoryProgress:
      raw.memoryProgress &&
      typeof asRecord(raw.memoryProgress).nextUnit === "number" &&
      Number.isFinite(asRecord(raw.memoryProgress).nextUnit)
        ? {
            nextUnit: Math.max(0, Math.floor(asRecord(raw.memoryProgress).nextUnit as number)),
            entries: Array.isArray(asRecord(raw.memoryProgress).entries)
              ? (asRecord(raw.memoryProgress).entries as unknown[])
                  .map((value) => ({
                    characterId: asTrimmedString(asRecord(value).characterId),
                    text: asTrimmedString(asRecord(value).text),
                    lineIds: Array.isArray(asRecord(value).lineIds)
                      ? (asRecord(value).lineIds as unknown[]).filter((id): id is string => typeof id === "string")
                      : [],
                  }))
                  .filter((entry) => entry.characterId && entry.text)
              : [],
          }
        : null,
    memoryPending: raw.memoryPending === true,
    recap: asString(raw.recap).slice(0, 600),
  };
}

const sessionSlot: DocumentSlot<VenueSession> = {
  kind: SESSION_KIND,
  name: "Venue visit",
  description: "The player's exact record of one visit, indexed by venue and participant.",
  coerce: coerceSession,
  label: (session) => session.placeName || "Venue visit",
};

async function readActive(): Promise<ActiveVenue> {
  const record = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, ACTIVE_ID);
  return coerceActive(record?.data);
}

async function readSession(id: string): Promise<VenueSession> {
  const record = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, `${SESSION_PREFIX}${id}`);
  if (!record) throw notFound("That venue conversation is no longer available.");
  return coerceSession(record.data);
}

async function changeSession(id: string, change: (session: VenueSession) => void): Promise<VenueSession> {
  let result: VenueSession | null = null;
  await mutateDocument(`${SESSION_PREFIX}${id}`, sessionSlot, (session) => {
    if (session.id !== id) throw notFound("That venue conversation is no longer available.");
    change(session);
    result = session;
  });
  return result!;
}

function appendLine(session: VenueSession, line: VenueLine): void {
  session.lines.push(line);
  for (const history of session.heardHistory)
    if (line.heardBy.includes(history.characterId)) history.lineIds.push(line.id);
}

function heardLines(session: VenueSession, characterId: string): VenueLine[] {
  const ids = new Set(session.heardHistory.find((history) => history.characterId === characterId)?.lineIds ?? []);
  return session.lines.filter((line) => ids.has(line.id));
}

function castAtEntry(village: VillageState, placeId: string, now: Date): VenueParticipant[] {
  const moment = deriveVillageMoment({ foundedAt: village.foundedAt, seed: village.seed, now });
  const cast = village.villagers
    .filter((villager) => {
      return villagerPlaceView(village, villager, null, moment.minuteOfDay, now)?.id === placeId;
    })
    .map((villager) => ({
      characterId: villager.characterId,
      name: villager.cardSnapshot.name,
      doing: agendaAt(villager.agenda, moment.minuteOfDay, now, villager.ingestSchedule !== false)?.activity ?? "",
    }));
  if (cast.length > 4) throw conflict("Five villagers are scheduled here at once. Edit their agendas before entering.");
  return cast;
}

type GreetingTrace = (stage: string, elapsedMs: number, detail?: string) => void;

async function generate(
  session: VenueSession,
  message: string,
  mode: "greet" | "chat" | "ask" | "fulfill" | "act",
  targetId: string,
  settled: { fulfilled: boolean; wish: string } | null,
  signal?: AbortSignal,
  retrySpeech = false,
  trace?: GreetingTrace,
  actionOutcome?: string,
  consentRetry = false,
) {
  const preparationStarted = performance.now();
  const [village, connectionId] = await Promise.all([readVillageState(), villagesConnectionIdFor("narration")]);
  signal?.throwIfAborted();
  trace?.("preparation", performance.now() - preparationStarted);
  const player = readPlayerIdentity(village);
  const now = new Date();
  const moment = deriveVillageMoment({ foundedAt: village.foundedAt, seed: village.seed, now });
  const active = session.participants.filter((person) => session.activeIds.includes(person.characterId));
  const memoryQuery = `${session.placeName} ${message}`;
  const promptMemories = selectPromptMemories(
    village.chronicle,
    active.map((person) => person.characterId),
    memoryQuery,
    600,
  );
  const sharedMemories = promptMemories.filter((entry) => entry.scope === "village");
  const profiles = active.map((person) => {
    const resident = village.villagers.find((entry) => entry.characterId === person.characterId);
    if (!resident) return `${person.name} (${person.characterId}): no longer resident.`;
    const card = readEffectiveVillagerCard(resident);
    const block = agendaAt(resident.agenda, moment.minuteOfDay, now, resident.ingestSchedule !== false);
    const memories = promptMemories
      .filter((entry) => entry.scope === "private" && entry.actors.some((actor) => actor.id === person.characterId))
      .map((entry) => entry.text);
    return [
      `${card.name} (${person.characterId})`,
      `Card: ${[card.systemPrompt, card.description, card.personality, card.scenario, card.backstory, card.exampleDialogue].filter(Boolean).join("\n").slice(0, 2800)}`,
      `Current agenda: ${block?.activity ?? "unspecified"}; availability: ${block?.status ?? "unspecified"}; due at ${village.venues.find((venue) => venue.id === block?.venueId)?.name ?? "elsewhere"}. A resident may leave naturally after saying so.`,
      `Current Residence: ${
        village.venues
          .filter((venue) => venueResidentIds(venue).includes(person.characterId))
          .map((venue) => `${venue.name} (${venue.id})`)
          .join(", ") || "none"
      }.`,
      `Private wishes and tells: ${resident.agenda?.wishes.map((wish) => `${wish.wish} (${wish.tell})`).join("; ") || "none"}. Treat these as motivations, never public quests.`,
      `Only ${card.name} knows: ${memories.join("; ") || "nothing recorded"}`,
    ].join("\n");
  });
  const older = session.lines.slice(0, -16);
  const queryWords = memoryQuery.toLowerCase().match(/[a-z]{4,}/gu) ?? [];
  const recalled = older
    .map((line, index) => ({
      line,
      index,
      score: queryWords.reduce((score, word) => score + (line.content.toLowerCase().includes(word) ? 1 : 0), 0),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || b.index - a.index)
    .slice(0, 2)
    .sort((a, b) => a.index - b.index)
    .map(({ line }) => line);
  const history = [...recalled, ...session.lines.slice(-16)]
    .map(
      (line) =>
        `${line.name || player.name}: ${line.content.slice(0, 500)} [heard by: ${line.heardBy.join(", ") || "nobody"}]`,
    )
    .join("\n");
  const audience = active.map((person) => person.characterId);
  const storedPlace = village.venues.find((venue) => venue.id === session.placeId);
  const place = storedPlace
    ? venueInArea(storedPlace, session.area, session.spaceClass, session.privateOwnerId)
    : undefined;
  const pendingMoves = village.residences.filter(
    (residence) => residence.status === "pending" && audience.includes(residence.characterId),
  );
  // Prose Events are visual only. Verified player deeds have separate receipts.
  const recentHappenings = village.venueEvents
    .filter((entry) => now.getTime() - Date.parse(entry.at) <= 3 * 24 * 60 * 60 * 1000)
    .slice(0, 4);
  const loreStarted = performance.now();
  const lorePromise = readVillageLore(
    village.selectedLorebookIds,
    [villageNarrativeSetting(village), session.placeName, active.map((person) => person.name).join(", "), message].join(
      "\n",
    ),
    signal,
  ).then((value) => {
    trace?.("lore", performance.now() - loreStarted);
    return value;
  });
  const resolutionStarted = performance.now();
  const modelPromise = villagesLanguageModels()
    .resolveForRequest({ connectionId })
    .then((value) => {
      trace?.("model resolution", performance.now() - resolutionStarted, `${value.model} (${value.connectionId})`);
      return value;
    });
  const [lore, model] = await Promise.all([lorePromise, modelPromise]);
  signal?.throwIfAborted();
  const system = [
    `You write one shared scene in ${session.placeName}, ${village.name}. It is ${moment.localTime}. ${villageNarrativeSetting(village)}`,
    `The player is ${player.name}. ${player.description}`,
    `The venue: ${place?.purpose ?? ""}. Current condition: ${place?.state.condition ?? ""}. Defining features: ${place?.state.features?.map((feature) => `${feature.id}: ${feature.text}${feature.locked ? " [locked]" : ""}`).join("; ") || "none"}. Visible traces: ${
      place?.state.traces
        ?.filter((trace) => trace.kind !== "note" && (!trace.expiresAt || Date.parse(trace.expiresAt) > now.getTime()))
        .map((trace) => `${trace.id}: ${trace.text}`)
        .join("; ") || "none"
    }. Items: ${place?.state.furniture.join("; ") || "none"}. Public facts: ${place?.state.publicFacts.join("; ") ?? ""}. Current state outranks older scene lines and happenings.`,
    `Approved room description: ${place?.description || "none"}.`,
    `Available venues for a requested move: ${
      village.venues
        .filter((venue) => !venue.occupancy.playerHome && !venue.occupancy.residentCharacterId)
        .map((venue) => `${venue.id}: ${venue.name}`)
        .join("; ") || "none"
    }.`,
    `Pending player requests to move: ${
      pendingMoves
        .filter((move) => move.requestedBy === "player")
        .map((move) => `${move.characterId} to ${move.proposedVenueId}`)
        .join("; ") || "none"
    }. A villager may freely approve or deny their own pending request in spoken dialogue. Never infer consent from silence or a different speaker.`,
    `Recent verified venue actions: ${recentHappenings.map((entry) => entry.text).join("; ") || "none"}`,
    `Shared village memories: ${sharedMemories.map((entry) => entry.text).join("; ") || "none"}`,
    `Relevant world lore: ${lore.join("\n") || "none"}`,
    effectiveVillagerReplyGuidance(village.narrationStyle),
    venueWritingDirection(village.narrationStyle, player.name),
    `The residents currently here are: ${audience.join(", ")}. Nobody joins mid-visit. A resident may leave after a clear spoken departure, and the scene ends when the last one leaves. Do not force a departure merely because time passed.`,
    session.area === "outside"
      ? "The player is outside this Residence. A resident inside may answer, remain busy, sleep through the attempt, or ignore it. Narration alone is a valid response. Never describe the player entering the shared area or a private space without validated permission. Do not expose unseen interior details."
      : active.length
        ? "Write as the named residents, preserving their separate voices and knowledge. Do not disclose one resident's private knowledge through another. Every player speech turn needs spoken dialogue from the intended target, or from at least one resident when the player addressed the room. A resident may decline or say they do not know, but must say so aloud. Quoted dialogue is not required because each segment has an explicit kind."
        : "Nobody is present. Write one grounded scene narration, with no resident dialogue or invented witnesses.",
    ...profiles,
    `Earlier visit recap: ${session.recap || "none"}. The recap may name who heard a private exchange.`,
    `Recent scene history:\n${history || "The player has just entered."}`,
    `Turn: ${mode}. Intended target: ${targetId || "anyone here"}. ${settled === null ? "" : settled.fulfilled ? `A checked wish was fulfilled for ${targetId}: ${settled.wish}.` : "The claim was checked and did not fulfill a wish."}`,
    mode === "leave"
      ? "The player has chosen to leave now. Write a brief, grounded closing exchange: let someone present answer or say goodbye aloud, or narrate the player's departure if the room is empty. Do not introduce a new errand or prolong the encounter."
      : "",
    "If a current resident explicitly invites the player into their Residence, return invitation with speakerId, venueId, scope (shared or private), timing (now or later), and an exact quote from that resident's spoken dialogue. Private entry may be granted only by that private space's owner. Later means one future visit; conditional, vague, sarcastic, or third-party permission is not an invitation. Omit invitation unless the resident actually says it. Entry never grants permission to change the space.",
    `Pending exact Residence edit proposals: ${
      (storedPlace?.editProposals ?? [])
        .filter(
          (proposal) =>
            !proposal.declined && (proposal.target === "shared" || proposal.ownerId === session.privateOwnerId),
        )
        .map(
          (proposal) =>
            `${proposal.id}: ${proposal.target} ${proposal.ownerId || "shared"}; description ${proposal.proposed.description}; condition ${proposal.proposed.state.condition}; items ${proposal.proposed.state.items.join(", ")}; public facts ${proposal.proposed.state.publicFacts.join(", ")}; features ${proposal.proposed.state.features.map((feature) => feature.text).join(", ")}; required ${proposal.requiredIds.join(", ")}; approved ${proposal.approvedIds.join(", ")}`,
        )
        .join(" | ") || "none"
    }. If a required resident explicitly approves or declines one exact proposal aloud, return editApproval with its proposalId, speakerId, approved boolean, and exact spoken quote. Never infer approval from silence or a general invitation.`,
    actionOutcome
      ? `The action was checked separately. Its settled outcome is: ${actionOutcome}. React to this outcome; do not redo or contradict the action judgment.`
      : "",
    "Targeting is intent, not isolation. Decide contextually who heard the player's words and each reply; moving aside is narrative and does not guarantee privacy.",
    (mode === "chat" || mode === "ask") && (session.area === "shared" || session.area === "private")
      ? "This is a resident-controlled Residence space. Player actions may be attempted and residents may react, but do not return sceneChange or narrate a lasting change until the exact room edit proposal has every required resident's explicit approval. Entry is not edit consent."
      : "",
    mode === "chat" || mode === "ask"
      ? `If the player physically acts in this scene, including plausible first-person past tense such as "I fixed the drip", resolve it as part of this SAME reply. Mere speech about a deed, a promise, an unsupported claim elsewhere, or an impossible attempt changes nothing. Return sceneChange only for a completed, persistent physical result: {"happened":true,"narration":"short past-tense public result","conditionBefore":"exact current condition","conditionAfter":"complete updated condition","featureId":"existing id","featureText":"updated text","publicFactBefore":"exact old fact","publicFactAfter":"updated fact","resolveTraceId":"existing id","addItem":"item","removeItem":"exact item","sceneNote":"temporary layout detail"}. Omit unused fields. Use an exact old value or ID to replace or resolve stale state; use sceneNote for a small temporary layout change, never for a repaired condition that must stay repaired. The player may change a locked feature; its lock remains. Do not invent exceptional supplies or consent. If the action fails, narrate the failure and omit sceneChange. Never narrate a lasting change without a valid sceneChange. A resident's reaction does not independently change physical state.`
      : "",
    mode === "chat" || mode === "ask"
      ? "If a resident explicitly asks to move to an available Residence, return residenceRequest with speakerId, venueId and an exact quote from that resident's dialogue. If a resident explicitly accepts or refuses a pending player move request, return residenceDecision with speakerId, approved boolean and an exact quote from that resident's dialogue. If a resident or worker suggests one concrete structural improvement to this Venue, return upgradeRequest with speakerId and an exact quote. Omit all three unless the corresponding speech actually occurs. A player request alone is never consent."
      : "",
    session.lines.length >= 12
      ? "Also return recap: an updated summary of meaningful earlier visit context in at most 600 characters, including who heard private details. Preserve the previous recap and add only meaningful new context; omit routine repairs already represented in current venue state."
      : "",
    mode !== "greet"
      ? 'Select up to three consequential conversational memories from THIS turn only. Omit routine dialogue and facts already represented in venue state. Return memories as [{"characterId":"active ID","text":"short grounded memory","evidence":["player",0]}], where numeric evidence refers to zero-based segment indexes in this response. Every cited line must be heard by that resident. Omit memories if nothing merits remembering. For a resident explicitly leaving, return departures as [{"speakerId":"ID","quote":"exact words from their dialogue"}]. Return sceneEnded only when the dialogue explicitly ends the whole encounter, with {"speakerId":"ID","quote":"exact words"}. Do not end a scene for player silence or ordinary conversation.'
      : "",
    retrySpeech
      ? `The previous draft contained no spoken answer from ${targetId || "anyone present"}. Rewrite this turn with a dialogue segment from that resident. A brief refusal or uncertainty is a valid answer; narration alone is not.`
      : "",
    consentRetry
      ? "The previous draft changed a resident-controlled space without an approved exact proposal. Rewrite the outcome as a pending request, a refusal, or a temporary attempt; omit sceneChange and any claim that a lasting edit occurred."
      : "",
    "Return one JSON object with heardPlayerBy (array of active resident IDs) and segments (ordered array). Each segment has kind, text, and heardBy (array of active resident IDs). Choose exactly one kind: narration, dialogue, side, or whisper. Dialogue, side, and whisper also need speakerId (an active resident ID); expression is optional. Narration has no speakerId and is visible to the whole active cast. A side or whisper is brief cross-talk attached to the preceding main segment; each has its OWN speakerId and heardBy. Whisper also needs targetId (an active resident ID). Alternate narration and speakers naturally, including reactions to one another within this single response. Use only active IDs; keep private knowledge with those who know it. For a greeting, heardPlayerBy is empty.",
  ].join("\n\n");
  const messages: CapabilityLanguageModelMessage[] = [
    { role: "system", content: system },
    {
      role: "user",
      content:
        mode === "greet"
          ? session.area === "outside"
            ? "The player has reached the outside of this Residence. Write a brief opening beat from outside; nobody is obliged to answer."
            : "The player is already inside this venue. Write a brief opening beat that begins here with the present cast."
          : mode === "leave" && !message.trim()
            ? "The player leaves without saying anything."
            : message,
    },
  ];
  // Opening a room needs one brief spoken beat, not a full turn's output budget.
  // Keep enough room for reasoning models while avoiding a 4K-token greeting.
  const requestedMaxTokens = mode === "greet" ? 1_600 : VENUE_REPLY_MAX_TOKENS;
  const maxTokens = Math.min(model.maxOutputTokens ?? requestedMaxTokens, requestedMaxTokens);
  const fitStarted = performance.now();
  const fitted = model.fitContext(messages, { maxTokens });
  trace?.("context fit", performance.now() - fitStarted);
  trace?.("model request", 0, `${model.model} (${model.connectionId})`);
  let attempts = 0;
  const completion = await completeWithRoom(model, fitted.messages, fitted.maxTokens ?? maxTokens, {
    temperature: VENUE_REPLY_TEMPERATURE,
    reasoningEffort: null,
    verbosity: null,
    debugMode: false,
    signal,
    onAttempt: trace
      ? (result, elapsedMs, limit) =>
          trace(
            `model attempt ${++attempts}`,
            elapsedMs,
            `finish=${result.finishReason ?? "unknown"} limit=${limit} usage=${JSON.stringify(result.usage ?? {})}`,
          )
      : undefined,
  });
  const raw = extractJsonObject(completion.content ?? "");
  const parsed = parseVenueReply(raw, audience);
  const readSpeechSignal = (value: unknown) => {
    const entry = asRecord(value);
    const speakerId = asTrimmedString(entry.speakerId);
    const quote = asTrimmedString(entry.quote).replace(/\s+/gu, " ").toLowerCase();
    if (
      !audience.includes(speakerId) ||
      quote.length < 8 ||
      !parsed.lines.some(
        (line) => line.speakerId === speakerId && line.content.replace(/\s+/gu, " ").toLowerCase().includes(quote),
      )
    )
      return null;
    return { speakerId, entry };
  };
  const request = readSpeechSignal(raw?.residenceRequest);
  const decision = readSpeechSignal(raw?.residenceDecision);
  const upgrade = readSpeechSignal(raw?.upgradeRequest);
  const invitation = readSpeechSignal(raw?.invitation);
  const editApproval = readSpeechSignal(raw?.editApproval);
  const departures = Array.isArray(raw?.departures)
    ? [
        ...new Set(
          raw.departures
            .map(readSpeechSignal)
            .filter((entry): entry is NonNullable<ReturnType<typeof readSpeechSignal>> => !!entry)
            .map((entry) => entry.speakerId),
        ),
      ]
    : [];
  const sceneEnded = !!readSpeechSignal(raw?.sceneEnded);
  const turnMemories: { characterId: string; text: string; evidence: (number | "player")[] }[] = [];
  if (mode !== "greet" && Array.isArray(raw?.memories))
    for (const value of raw.memories.slice(0, 3)) {
      const row = asRecord(value);
      const characterId = asTrimmedString(row.characterId);
      const text = asTrimmedString(row.text);
      const evidence = Array.isArray(row.evidence) ? row.evidence : [];
      if (
        !audience.includes(characterId) ||
        !text ||
        text.length > MAX_CHRONICLE_LENGTH ||
        !evidence.length ||
        evidence.length > 4
      )
        continue;
      if (
        evidence.some((ref) =>
          ref === "player"
            ? !parsed.heardPlayerBy.includes(characterId)
            : !Number.isInteger(ref) ||
              (ref as number) < 0 ||
              !parsed.lines[ref as number]?.heardBy.includes(characterId),
        )
      )
        continue;
      if (turnMemories.some((entry) => entry.characterId === characterId)) continue;
      turnMemories.push({ characterId, text, evidence: evidence as (number | "player")[] });
    }
  const requestedVenueId = request ? asTrimmedString(request.entry.venueId) : "";
  const invitedVenueId = invitation ? asTrimmedString(invitation.entry.venueId) : "";
  const invitedVenue = village.venues.find((venue) => venue.id === invitedVenueId);
  const invitationScope: "shared" | "private" = invitation?.entry.scope === "private" ? "private" : "shared";
  const invitationOwnerId = invitationScope === "private" ? asTrimmedString(invitation?.entry.ownerId) : "";
  const invitationQuote = asTrimmedString(invitation?.entry.quote).toLowerCase();
  const invitationIsFuture =
    /\b(later|tomorrow|next visit|next time|another day|anytime|when you return|come back)\b/u.test(invitationQuote);
  const invitationIsEntry = /\b(come in|come into|step in|step inside|enter|welcome inside|welcome in|visit)\b/u.test(
    invitationQuote,
  );
  const invitationTiming = invitation?.entry.timing === "now" ? "now" : "later";
  const invitationTimingSupported =
    invitationTiming === "later" ? invitationIsFuture : invitationIsEntry && !invitationIsFuture;
  const privateScopeSupported =
    invitationScope === "shared" ||
    /\b(my|mine|your)\s+(private\s+)?(room|bedroom|space|quarters)|private space\b/u.test(invitationQuote);
  const pendingDecision = decision
    ? pendingMoves.find((move) => move.characterId === decision.speakerId && move.requestedBy === "player")
    : null;
  return {
    ...parsed,
    sceneChange: mode === "chat" || mode === "ask" ? readVenueSceneChange(raw?.sceneChange, place) : null,
    residenceSignal:
      (mode === "chat" || mode === "ask") &&
      requestedVenueId &&
      village.venues.some((venue) => venue.id === requestedVenueId)
        ? { kind: "request" as const, characterId: request!.speakerId, venueId: requestedVenueId }
        : (mode === "chat" || mode === "ask") && pendingDecision && typeof decision!.entry.approved === "boolean"
          ? {
              kind: "decision" as const,
              characterId: decision!.speakerId,
              venueId: pendingDecision.proposedVenueId,
              approved: decision!.entry.approved === true,
            }
          : null,
    upgradeSignal:
      (mode === "chat" || mode === "ask") &&
      upgrade &&
      (place?.residentIds?.includes(upgrade.speakerId) || place?.workerIds?.includes(upgrade.speakerId))
        ? { characterId: upgrade.speakerId, venueId: place.id, quote: asTrimmedString(upgrade.entry.quote) }
        : null,
    invitationSignal:
      invitation &&
      invitedVenue &&
      invitationTimingSupported &&
      privateScopeSupported &&
      venueClasses(invitedVenue).includes("residence") &&
      venueResidentIds(invitedVenue).includes(invitation.speakerId) &&
      (invitationScope === "shared" || invitationOwnerId === invitation.speakerId)
        ? {
            residentId: invitation.speakerId,
            venueId: invitedVenueId,
            scope: invitationScope,
            timing: invitationTiming,
            ownerId: invitationOwnerId,
            quote: asTrimmedString(invitation.entry.quote),
          }
        : null,
    editApprovalSignal:
      editApproval &&
      (place?.editProposals ?? []).some(
        (proposal) =>
          proposal.id === asTrimmedString(editApproval.entry.proposalId) &&
          !proposal.declined &&
          proposal.requiredIds.includes(editApproval.speakerId),
      ) &&
      typeof editApproval.entry.approved === "boolean"
        ? {
            proposalId: asTrimmedString(editApproval.entry.proposalId),
            residentId: editApproval.speakerId,
            approved: editApproval.entry.approved === true,
            quote: asTrimmedString(editApproval.entry.quote),
          }
        : null,
    recap: asString(raw?.recap).slice(0, 600),
    departures,
    sceneEnded,
    turnMemories,
  };
}

type VenueReplyLine = {
  kind: NonNullable<VenueLine["kind"]>;
  speakerId: string;
  content: string;
  heardBy: string[];
  expression?: string;
  targetId?: string;
  anchorIndex?: number;
};

export function parseVenueReply(
  raw: Record<string, unknown> | null,
  audience: readonly string[],
): {
  lines: VenueReplyLine[];
  heardPlayerBy: string[];
} {
  const structured = Array.isArray(raw?.segments);
  const segments = structured ? raw!.segments : raw?.lines;
  if (!raw || !Array.isArray(segments) || !Array.isArray(raw.heardPlayerBy))
    throw new Error("The venue response could not be read. Try again.");
  const allowed = new Set(audience);
  // Models sometimes put a name or an obsolete ID in optional audience fields.
  // Ignore those hints; only the cast captured at Visit may hear a line.
  const ids = (value: unknown): string[] =>
    Array.isArray(value)
      ? [...new Set(value.filter((id): id is string => typeof id === "string" && allowed.has(id)))]
      : [];
  if (segments.length > 24) throw new Error("The venue response contained too many lines.");
  const lines: VenueReplyLine[] = segments.map((value): VenueReplyLine => {
    const row = asRecord(value);
    if (
      structured &&
      row.kind !== "narration" &&
      row.kind !== "dialogue" &&
      row.kind !== "side" &&
      row.kind !== "whisper"
    )
      throw new Error("The venue response had an unknown segment kind.");
    let kind: VenueReplyLine["kind"] =
      row.kind === "narration" || row.kind === "side" || row.kind === "whisper" ? row.kind : "dialogue";
    const speakerId = asTrimmedString(row.speakerId);
    const content = asTrimmedString(row.text);
    if ((kind !== "narration" && !allowed.has(speakerId)) || !content || content.length > 2000)
      throw new Error("The venue response had an unreadable speaker or line.");
    const expression = asTrimmedString(row.expression).toLowerCase().slice(0, 40);
    const targetId = allowed.has(asTrimmedString(row.targetId)) ? asTrimmedString(row.targetId) : "";
    // An invalid whisper target must never make the whole greeting or turn fail.
    // Treat it as an ordinary spoken line, without claiming anyone heard a whisper.
    if (kind === "whisper" && !targetId) kind = "dialogue";
    return {
      kind,
      speakerId: kind === "narration" ? "__venue_scene__" : speakerId,
      content,
      heardBy:
        kind === "narration"
          ? [...audience]
          : [...new Set([speakerId, ...ids(row.heardBy), ...(kind === "whisper" ? [targetId] : [])])],
      ...(expression ? { expression } : {}),
      ...(targetId ? { targetId } : {}),
    };
  });
  if (
    lines.some((line) => line.kind === "side" || line.kind === "whisper") &&
    !lines.some((line) => line.kind === "narration" || line.kind === "dialogue")
  )
    throw new Error("The venue response had side chatter without a main line.");
  const anchored: VenueReplyLine[] = lines.map((line, index) => {
    if (line.kind !== "side" && line.kind !== "whisper") return line;
    let anchorIndex = index - 1;
    while (anchorIndex >= 0 && (lines[anchorIndex]!.kind === "side" || lines[anchorIndex]!.kind === "whisper"))
      anchorIndex -= 1;
    if (anchorIndex < 0)
      anchorIndex = lines.findIndex((candidate) => candidate.kind === "narration" || candidate.kind === "dialogue");
    return { ...line, anchorIndex };
  });
  return {
    lines: anchored,
    heardPlayerBy: ids(raw.heardPlayerBy),
  };
}

function appendVenueReply(session: VenueSession, lines: ReturnType<typeof parseVenueReply>["lines"], at: string): void {
  const lineIds = lines.map(() => randomUUID());
  lines.forEach((line, index) =>
    appendLine(session, {
      id: lineIds[index]!,
      speakerId: line.speakerId,
      name:
        line.kind === "narration"
          ? "Narration"
          : (session.participants.find((person) => person.characterId === line.speakerId)?.name ?? ""),
      role: "assistant",
      content: line.content,
      at,
      heardBy: line.heardBy,
      kind: line.kind,
      ...(line.expression ? { expression: line.expression } : {}),
      ...(line.targetId ? { targetId: line.targetId } : {}),
      ...(line.anchorIndex !== undefined ? { asideFor: lineIds[line.anchorIndex]! } : {}),
    }),
  );
}

export async function activeVenueSession(): Promise<VenueSession | null> {
  const active = await readActive();
  if (!active.sessionId) return null;
  const session = await readSession(active.sessionId);
  if (session.status === "closed") {
    await clearActivePointer(session.id);
    return null;
  }
  if (isInactive(session)) {
    await interruptInactiveVisit(session.id);
    const latest = await readSession(session.id).catch(() => null);
    return latest?.status === "closed" ? null : latest;
  }
  return session;
}

function isInactive(session: VenueSession, now = Date.now()): boolean {
  return now - Date.parse(session.lastActivityAt || session.startedAt) >= INACTIVITY_MS;
}

async function interruptInactiveVisit(id: string): Promise<void> {
  const closed = await changeSession(id, (state) => {
    if (state.status === "closed" || !isInactive(state)) return;
    state.status = "closed";
    state.endedAt = new Date().toISOString();
    state.endReason = "inactivity";
    state.memoryPending = state.memoryMode === "end" && state.lines.some((line) => line.role === "user");
  });
  if (closed.status !== "closed") return;
  await clearActivePointer(id);
  if (!closed.lines.some((line) => line.role === "user")) {
    const document = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, `${SESSION_PREFIX}${id}`);
    if (document) await villagesDocuments().remove(VILLAGES_PACKAGE_ID, document.id, document.revision);
  }
}

async function requireLiveVenueSession(id: string): Promise<VenueSession> {
  let session = await readSession(id);
  if (session.status !== "closed" && isInactive(session)) {
    await interruptInactiveVisit(id);
    session = await readSession(id).catch(() => session);
  }
  if (session.endReason === "inactivity" || (session.status !== "closed" && isInactive(session)))
    throw new VillagesRequestError(
      410,
      "Interrupted: Inactivity. This visit ended while you were away; its completed exchanges were saved.",
    );
  if (session.status === "closed") throw conflict("That venue conversation has already ended.");
  if ((await readActive()).sessionId !== id) throw conflict("That venue conversation is not active.");
  return session;
}

/** Only a deliberate client action updates this server-owned clock. */
export async function touchVenueSession(id: string): Promise<VenueSession> {
  const session = await requireLiveVenueSession(id);
  if (Date.now() - Date.parse(session.lastActivityAt) < ACTIVITY_WRITE_MS) return session;
  return changeSession(id, (state) => {
    if (state.status === "closed") throw conflict("That venue conversation has already ended.");
    if (isInactive(state))
      throw new VillagesRequestError(410, "Interrupted: Inactivity. This visit ended while you were away.");
    if (Date.now() - Date.parse(state.lastActivityAt) >= ACTIVITY_WRITE_MS)
      state.lastActivityAt = new Date().toISOString();
  });
}

async function clearActivePointer(id: string): Promise<void> {
  await mutateDocument(ACTIVE_ID, activeSlot, (state) => {
    if (state.sessionId === id) {
      state.sessionId = "";
      state.placeId = "";
    }
  });
}

export async function enterVenue(
  placeId: string,
  requestedClass?: VillageVenueClass,
  privateOwnerId = "",
): Promise<VenueSession> {
  await rollActiveAgendas(new Date());
  const village = await readVillageState();
  const place = village.venues.find((entry) => entry.id === placeId);
  if (!place) throw notFound("That place is not in this village.");
  const classes = venueClasses(place);
  const spaceClass = requestedClass ?? classes.find((entry) => entry !== "residence") ?? classes[0]!;
  if (!classes.includes(spaceClass)) throw badRequest("That Venue has no such space.");
  const existing = await activeVenueSession();
  if (existing) {
    if (existing.placeId !== placeId) throw conflict(`Finish the conversation in ${existing.placeName} first.`);
    if (existing.spaceClass && existing.spaceClass !== spaceClass)
      throw conflict("Finish the active Venue space visit first.");
    return existing;
  }
  let area: VenueSession["area"] = spaceClass === "residence" ? "shared" : "public";
  let privateAccessOwnerId = "";
  if (spaceClass === "residence" && !place.occupancy.playerHome && venueResidentIds(place).length > 0) {
    area = "outside";
    await mutateVillageState((state) => {
      const current = state.venues.find((entry) => entry.id === placeId);
      if (!current) throw notFound("That Residence is no longer here.");
      const invitation = current.playerInvitations?.findIndex(
        (entry) =>
          venueResidentIds(current).includes(entry.residentId) &&
          (privateOwnerId ? entry.scope === "private" && entry.ownerId === privateOwnerId : entry.scope !== "private"),
      );
      if (invitation !== undefined && invitation >= 0) {
        current.playerInvitations?.splice(invitation, 1);
        area = privateOwnerId ? "private" : "shared";
        current.playerSeenShared = true;
        if (privateOwnerId)
          current.playerSeenPrivateIds = [...new Set([...(current.playerSeenPrivateIds ?? []), privateOwnerId])];
      } else if (!privateOwnerId) {
        const privateInvitation = current.playerInvitations?.findIndex(
          (entry) => entry.scope === "private" && entry.ownerId === entry.residentId,
        );
        if (privateInvitation !== undefined && privateInvitation >= 0) {
          privateAccessOwnerId = current.playerInvitations![privateInvitation]!.ownerId ?? "";
          current.playerInvitations?.splice(privateInvitation, 1);
          area = "shared";
          current.playerSeenShared = true;
        }
      }
    });
  }
  const participants = castAtEntry(village, placeId, new Date());
  const id = randomUUID();
  const session: VenueSession = {
    version: 1,
    id,
    placeId,
    placeName: place.name,
    spaceClass,
    area,
    privateOwnerId: (area as VenueSession["area"]) === "private" ? privateOwnerId : "",
    privateAccessOwnerId,
    startedAt: new Date().toISOString(),
    endedAt: "",
    lastActivityAt: new Date().toISOString(),
    endReason: "",
    memoryMode: "turn",
    status: participants.length === 0 ? "active" : "opening",
    participants,
    activeIds: participants.map((person) => person.characterId),
    lines: [],
    heardHistory: participants.map((person) => ({ characterId: person.characterId, lineIds: [] })),
    submissions: [],
    memories: null,
    memoryProgress: null,
    memoryPending: false,
    recap: "",
  };
  await mutateDocument(`${SESSION_PREFIX}${id}`, sessionSlot, (value) => Object.assign(value, session));
  await mutateDocument(ACTIVE_ID, activeSlot, (active) => {
    if (active.sessionId) throw conflict("Finish the active venue conversation first.");
    active.sessionId = id;
    active.placeId = placeId;
  });
  return session;
}

export async function enterResidencePrivateSpace(sessionId: string, ownerId: string): Promise<VenueSession> {
  const session = await requireLiveVenueSession(sessionId);
  if (session.status !== "active" || session.spaceClass !== "residence")
    throw conflict("Enter the Residence scene first.");
  const village = await readVillageState();
  const venue = village.venues.find((entry) => entry.id === session.placeId);
  if (!venue || !venueResidentIds(venue).includes(ownerId))
    throw notFound("That resident's private space is no longer here.");
  if (session.area === "private" && session.privateOwnerId === ownerId) return session;
  if (session.privateAccessOwnerId !== ownerId) {
    let consumed = false;
    await mutateVillageState((state) => {
      const current = state.venues.find((entry) => entry.id === session.placeId);
      const index = current?.playerInvitations?.findIndex(
        (entry) => entry.scope === "private" && entry.ownerId === ownerId && entry.residentId === ownerId,
      );
      if (current && index !== undefined && index >= 0) {
        current.playerInvitations?.splice(index, 1);
        consumed = true;
      }
    });
    if (!consumed) throw conflict("This private space needs its owner's invitation.");
  }
  const entered = await changeSession(sessionId, (state) => {
    if (state.status !== "active") throw conflict("That scene has ended.");
    state.area = "private";
    state.privateOwnerId = ownerId;
    state.privateAccessOwnerId = "";
  });
  await markResidenceSeen(entered);
  return entered;
}

export async function greetVenue(id: string): Promise<VenueSession> {
  const inFlight = greetingTasks.get(id);
  if (inFlight) return inFlight.task;
  const started = performance.now();
  const controller = new AbortController();
  const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(28_000)]);
  let stage = "session read";
  const trace: GreetingTrace = (next, elapsedMs, detail = "") => {
    stage = next;
    villagesLogger().info("[villages] greeting %s %s took %dms %s", id, next, Math.round(elapsedMs), detail);
  };
  const onAbort = () => rejectAbort(signal);
  let rejectAbort: (signal: AbortSignal) => void = () => {};
  const aborted = new Promise<never>((_resolve, reject) => {
    rejectAbort = (current) => reject(current.reason);
    signal.addEventListener("abort", onAbort, { once: true });
  });
  const task = Promise.race([greetVenueOnce(id, signal, trace), aborted]);
  greetingTasks.set(id, { task, abort: () => controller.abort() });
  try {
    return await task;
  } catch (error) {
    villagesLogger().warn(
      "[villages] greeting %s failed at %s after %dms: %s",
      id,
      stage,
      Math.round(performance.now() - started),
      error instanceof Error ? error.message : String(error),
    );
    if (signal.reason instanceof DOMException && signal.reason.name === "TimeoutError")
      throw new VillagesRequestError(504, "The greeting exceeded 28 seconds. Retry it or continue without a greeting.");
    throw error;
  } finally {
    signal.removeEventListener("abort", onAbort);
    greetingTasks.delete(id);
  }
}

const greetingTasks = new Map<string, { task: Promise<VenueSession>; abort: () => void }>();

async function greetVenueOnce(id: string, signal: AbortSignal, trace: GreetingTrace): Promise<VenueSession> {
  const readStarted = performance.now();
  const session = await requireLiveVenueSession(id);
  trace("session read", performance.now() - readStarted);
  if (session.status !== "opening") return session;
  signal.throwIfAborted();
  const reply = await generate(session, "", "greet", "", null, signal, false, trace);
  signal.throwIfAborted();
  if (
    !reply.lines.some((line) => line.kind === "dialogue" || (session.area === "outside" && line.kind === "narration"))
  )
    throw badGateway("The villagers did not greet you aloud. Retry the greeting or continue without it.");
  const greeted = await changeSession(id, (state) => {
    signal.throwIfAborted();
    if (state.status !== "opening") return;
    if (isInactive(state))
      throw new VillagesRequestError(410, "Interrupted: Inactivity. This visit ended while you were away.");
    const at = new Date().toISOString();
    appendVenueReply(state, reply.lines, at);
    if (reply.invitationSignal?.venueId === state.placeId && reply.invitationSignal.timing === "now") {
      state.area = reply.invitationSignal.scope === "private" ? "private" : "shared";
      state.privateOwnerId = reply.invitationSignal.scope === "private" ? reply.invitationSignal.ownerId : "";
    }
    state.status = "active";
  });
  if (reply.invitationSignal && reply.invitationSignal.timing === "later")
    await recordSpokenInvitation(greeted, reply.invitationSignal);
  if (reply.editApprovalSignal) {
    const approval = reply.editApprovalSignal;
    const quote = approval.quote.replace(/\s+/gu, " ").toLowerCase();
    if (
      greeted.lines.some(
        (line) =>
          line.speakerId === approval.residentId && line.content.replace(/\s+/gu, " ").toLowerCase().includes(quote),
      )
    )
      await applyResidenceEditApproval(greeted.placeId, approval.proposalId, approval.residentId, approval.approved);
  }
  if (greeted.area === "shared" || greeted.area === "private") await markResidenceSeen(greeted);
  return greeted;
}

export async function continueVenueWithoutGreeting(id: string): Promise<VenueSession> {
  await requireLiveVenueSession(id);
  const session = await changeSession(id, (state) => {
    if (isInactive(state))
      throw new VillagesRequestError(410, "Interrupted: Inactivity. This visit ended while you were away.");
    if (state.status === "opening") state.status = "active";
    else if (state.status !== "active") throw conflict("That venue conversation has already ended.");
  });
  greetingTasks.get(id)?.abort();
  return session;
}

type VenueTurnInput = {
  sessionId: string;
  message: string;
  mode: "chat" | "ask" | "fulfill" | "act" | "leave";
  targetId: string;
  submissionId: string;
};

const turnTasks = new Map<string, { input: VenueTurnInput; task: ReturnType<typeof sendVenueTurnOnce> }>();

export async function sendVenueTurn(input: VenueTurnInput) {
  const key = `${input.sessionId}:${input.submissionId}`;
  const inFlight = turnTasks.get(key);
  if (inFlight) {
    if (
      inFlight.input.message !== input.message ||
      inFlight.input.mode !== input.mode ||
      inFlight.input.targetId !== input.targetId
    )
      throw conflict("That submission ID belongs to a different line.");
    return inFlight.task;
  }
  const task = sendVenueTurnOnce(input);
  turnTasks.set(key, { input, task });
  try {
    return await task;
  } finally {
    turnTasks.delete(key);
  }
}

/** Generate a final beat once, then use the ordinary visit filing path. */
export async function leaveVenueSession(sessionId: string, submissionId: string, message = "") {
  const result = await sendVenueTurn({
    sessionId,
    submissionId,
    message,
    mode: "leave",
    targetId: "",
  });
  return { ...result, session: await endVenueSession(sessionId) };
}

async function finishActReply(
  session: VenueSession,
  submissionId: string,
  message: string,
  action: VenueActionResult,
): Promise<VenueSession> {
  await requireLiveVenueSession(session.id);
  const prior = session.submissions.find((entry) => entry.id === submissionId);
  if (prior?.actionReplyDone) return session;
  if (session.activeIds.length === 0) {
    return changeSession(session.id, (state) => {
      const entry = state.submissions.find((item) => item.id === submissionId);
      if (entry) entry.actionReplyDone = true;
    });
  }
  const reply = await generate(
    session,
    message,
    "act",
    "",
    null,
    AbortSignal.timeout(90_000),
    false,
    undefined,
    action.narration,
  );
  if (!reply.lines.some((line) => line.kind === "dialogue"))
    throw badGateway("The action happened, but nobody answered aloud. Retry to hear the room.");
  return changeSession(session.id, (state) => {
    const entry = state.submissions.find((item) => item.id === submissionId);
    if (!entry || entry.actionReplyDone) return;
    appendVenueReply(state, reply.lines, new Date().toISOString());
    entry.actionReplyDone = true;
  });
}

async function sendVenueTurnOnce(input: VenueTurnInput) {
  const session = await readSession(input.sessionId);
  const prior = session.submissions.find((entry) => entry.id === input.submissionId);
  if (prior) {
    if (prior.message !== input.message || prior.mode !== input.mode || prior.targetId !== input.targetId)
      throw conflict("That submission ID belongs to a different line.");
    if (prior.mode === "act" && prior.action && !prior.actionReplyDone)
      return {
        session: await finishActReply(session, input.submissionId, input.message, prior.action),
        verdict: null,
        action: prior.action,
        recordEvents: prior.action.happened
          ? [{ id: `venue-action:${input.submissionId}`, kind: "venue" as const, text: prior.action.narration }]
          : [],
      };
    await applyVenueTurnChange(session, prior);
    await applyFulfilledWish(session, prior);
    await applyVenueRequests(session, prior);
    if (prior.invitationSignal && prior.invitationSignal.timing === "later")
      await recordSpokenInvitation(session, prior.invitationSignal);
    await applyTurnMemories(session, prior);
    const recordEvents = await receiptForTurn(session, prior);
    return {
      session: await readSession(session.id),
      verdict: prior.verdict,
      action: prior.action ?? null,
      recordEvents: prior.action?.happened
        ? [{ id: `venue-action:${input.submissionId}`, kind: "venue" as const, text: prior.action.narration }]
        : recordEvents,
    };
  }
  await requireLiveVenueSession(session.id);
  if (session.status !== "active") throw conflict("That venue conversation is not active.");
  if (input.mode !== "leave" && !input.message.trim()) throw badRequest("Write something before sending it.");
  if (input.message.length > 4000) throw badRequest("A line can be at most 4000 characters.");
  if (input.mode === "fulfill" && session.activeIds.length === 0)
    throw badRequest("Nobody is here to fulfill a wish for.");
  if (input.targetId && !session.activeIds.includes(input.targetId))
    throw badRequest("That villager is no longer in this conversation.");
  if (input.mode === "fulfill" && !input.targetId) throw badRequest("Choose one villager for Fulfill.");
  if (input.mode === "act") {
    if (input.targetId) throw badRequest("Actions are about the place, not a villager.");
    const { actAtVenue } = await import("./venue-actions.js");
    const action = await actAtVenue(session.placeId, input.message, input.submissionId);
    const completed = await finishActReply(await readSession(session.id), input.submissionId, input.message, action);
    return {
      session: completed,
      verdict: null,
      action,
      recordEvents: action.happened
        ? [{ id: `venue-action:${input.submissionId}`, kind: "venue" as const, text: action.narration }]
        : [],
    };
  }
  await rollActiveAgendas(new Date());
  const village = await readVillageState();
  let verdict: { fulfilled: boolean; reason: string } | null = null;
  let wishId = "";
  let wishMemory = "";
  let wishText = "";
  if (input.mode === "fulfill") {
    const resident = village.villagers.find((person) => person.characterId === input.targetId);
    if (!resident) throw notFound("That villager no longer lives here.");
    const wishes = resident.agenda?.wishes ?? [];
    if (!wishes.length) throw badRequest(`${resident.cardSnapshot.name} is not waiting on anything at the moment.`);
    const player = readPlayerIdentity(village);
    const moment = deriveVillageMoment({ foundedAt: village.foundedAt, seed: village.seed, now: new Date() });
    const judged = await proposeWishVerdict({
      village: village.name,
      setting: villageNarrativeSetting(village),
      moment,
      card: readEffectiveVillagerCard(resident),
      playerName: player.name,
      playerDescription: player.description,
      wishes,
      claim: input.message,
      transcript: heardLines(session, input.targetId).map((line) => ({
        role: line.role,
        content: line.content,
        at: line.at,
      })),
      happenings: village.venueEvents.slice(0, 20),
      worldState: (() => {
        const storedPlace = village.venues.find((venue) => venue.id === session.placeId);
        const place = storedPlace
          ? venueInArea(storedPlace, session.area, session.spaceClass, session.privateOwnerId)
          : undefined;
        if (!place) return [];
        return [
          `Current condition of ${place.name}: ${place.state.condition}`,
          ...place.state.publicFacts.slice(0, 12),
          ...(place.state.features ?? []).slice(0, 8).map((feature) => feature.text),
          ...place.state.furniture.slice(0, 12).map((item) => `Present item: ${item}`),
        ];
      })(),
      memory: memoryForVillager(
        village.chronicle,
        input.targetId,
        `${input.message} ${wishes.map((wish) => wish.wish).join(" ")}`,
      ),
    });
    verdict = judged.verdict;
    wishId = judged.wish?.id ?? "";
    wishMemory = judged.memory;
    wishText = judged.wish?.wish ?? "";
  }
  const responseTargetId = input.targetId || (session.activeIds.length === 1 ? session.activeIds[0]! : "");
  let reply = await generate(
    session,
    input.message,
    input.mode,
    responseTargetId,
    verdict ? { fulfilled: verdict.fulfilled, wish: wishText } : null,
    AbortSignal.timeout(90_000),
  );
  if ((session.area === "shared" || session.area === "private") && reply.sceneChange) {
    reply = await generate(
      session,
      input.message,
      input.mode,
      responseTargetId,
      verdict ? { fulfilled: verdict.fulfilled, wish: wishText } : null,
      AbortSignal.timeout(90_000),
      false,
      undefined,
      undefined,
      true,
    );
    if (reply.sceneChange) throw conflict("A lasting Residence change needs the residents' approval first.");
  }
  const hasSpokenReply = (lines: typeof reply.lines) =>
    lines.some((line) =>
      session.activeIds.length === 0
        ? line.kind === "narration"
        : input.mode === "leave" || session.area === "outside"
          ? line.kind === "narration" || line.kind === "dialogue"
          : line.kind === "dialogue" && (!responseTargetId || line.speakerId === responseTargetId),
    ) ||
    (input.mode === "leave" && reply.lines.some((line) => line.kind === "dialogue"));
  if (!hasSpokenReply(reply.lines)) {
    reply = await generate(
      session,
      input.message,
      input.mode,
      responseTargetId,
      verdict ? { fulfilled: verdict.fulfilled, wish: wishText } : null,
      AbortSignal.timeout(90_000),
      true,
    );
    if (!hasSpokenReply(reply.lines)) throw badGateway("The scene did not answer. Try again.");
  }
  const updated = await changeSession(session.id, (state) => {
    if (state.submissions.some((entry) => entry.id === input.submissionId)) return;
    if (state.status !== "active") throw conflict("That conversation has already ended.");
    if (isInactive(state))
      throw new VillagesRequestError(410, "Interrupted: Inactivity. This visit ended while you were away.");
    if (state.lines.length !== session.lines.length)
      throw conflict("The conversation moved on. Try sending that line again.");
    const at = new Date().toISOString();
    state.lastActivityAt = at;
    const playerLineId = input.message.trim() ? randomUUID() : "";
    if (playerLineId)
      appendLine(state, {
        id: playerLineId,
        speakerId: "",
        name: "",
        role: "user",
        content: input.message,
        at,
        heardBy: reply.heardPlayerBy,
      });
    appendVenueReply(state, reply.lines, at);
    const replyLineIds = state.lines.slice(-reply.lines.length).map((line) => line.id);
    const turnMemories: VenueMemory[] = reply.turnMemories.map((memory) => ({
      characterId: memory.characterId,
      text: memory.text,
      lineIds: [
        ...new Set(
          memory.evidence
            .map((ref) => (ref === "player" ? playerLineId : replyLineIds[ref]))
            .filter((id): id is string => !!id),
        ),
      ],
    }));
    if (reply.recap) state.recap = reply.recap;
    state.submissions.push({
      id: input.submissionId,
      message: input.message,
      mode: input.mode,
      targetId: input.targetId,
      areaAtTurn: session.area,
      privateOwnerIdAtTurn: session.privateOwnerId,
      verdict,
      wishId,
      wishMemory,
      turnMemories,
      ...(reply.sceneChange ? { sceneChange: reply.sceneChange } : {}),
      ...(reply.residenceSignal ? { residenceSignal: reply.residenceSignal } : {}),
      ...(reply.upgradeSignal ? { upgradeSignal: reply.upgradeSignal } : {}),
      ...(reply.invitationSignal
        ? {
            invitationSignal: {
              ...reply.invitationSignal,
              sourceLineId: reply.lines
                .map((line, index) => ({ line, id: replyLineIds[index] }))
                .find(
                  ({ line }) =>
                    line.speakerId === reply.invitationSignal?.residentId &&
                    line.content.toLowerCase().includes(reply.invitationSignal.quote.toLowerCase()),
                )?.id,
            },
          }
        : {}),
      ...(reply.editApprovalSignal
        ? {
            editApprovalSignal: {
              ...reply.editApprovalSignal,
              sourceLineId: reply.lines
                .map((line, index) => ({ line, id: replyLineIds[index] }))
                .find(
                  ({ line }) =>
                    line.speakerId === reply.editApprovalSignal?.residentId &&
                    line.content.toLowerCase().includes(reply.editApprovalSignal.quote.toLowerCase()),
                )?.id,
            },
          }
        : {}),
      at,
    });
    if (reply.invitationSignal?.venueId === state.placeId && reply.invitationSignal.timing === "now") {
      state.area = reply.invitationSignal.scope === "private" ? "private" : "shared";
      state.privateOwnerId = reply.invitationSignal.scope === "private" ? reply.invitationSignal.ownerId : "";
    }
    state.activeIds = state.activeIds.filter((id) => !reply.departures.includes(id));
    if (reply.sceneEnded || (session.activeIds.length > 0 && state.activeIds.length === 0)) {
      state.status = "closed";
      state.endedAt = at;
      state.endReason = "scene";
    }
  });
  const submission = updated.submissions.find((entry) => entry.id === input.submissionId)!;
  await applyVenueTurnChange(updated, submission);
  await applyFulfilledWish(updated, submission);
  await applyVenueRequests(updated, submission);
  if (submission.invitationSignal && submission.invitationSignal.timing === "later")
    await recordSpokenInvitation(updated, submission.invitationSignal);
  if (updated.area === "shared" || updated.area === "private") await markResidenceSeen(updated);
  await applyTurnMemories(updated, submission);
  const recordEvents = await receiptForTurn(updated, submission);
  if (updated.status === "closed") await clearActivePointer(updated.id);
  return { session: await readSession(updated.id), verdict, action: null, recordEvents };
}

async function recordSpokenInvitation(
  session: VenueSession,
  signal: NonNullable<VenueSubmission["invitationSignal"]>,
): Promise<void> {
  const quote = signal.quote.replace(/\s+/gu, " ").toLowerCase();
  const spoken = session.lines.find(
    (line) =>
      line.speakerId === signal.residentId &&
      line.content.replace(/\s+/gu, " ").toLowerCase().includes(quote) &&
      (!signal.sourceLineId || line.id === signal.sourceLineId),
  );
  if (!spoken || quote.length < 8) return;
  await mutateVillageState((state) => {
    const venue = state.venues.find((entry) => entry.id === signal.venueId);
    if (!venue || !venueClasses(venue).includes("residence") || !venueResidentIds(venue).includes(signal.residentId))
      return;
    if (signal.scope === "private" && signal.ownerId !== signal.residentId) return;
    if (venue.playerInvitations?.some((entry) => entry.sourceLineId === spoken.id)) return;
    venue.playerInvitations = [
      ...(venue.playerInvitations ?? []),
      {
        residentId: signal.residentId,
        recordedAt: new Date().toISOString(),
        scope: signal.scope,
        ownerId: signal.ownerId,
        sourceLineId: spoken.id,
        quote: signal.quote,
      },
    ].slice(-16);
  });
}

async function markResidenceSeen(session: VenueSession): Promise<void> {
  await mutateVillageState((state) => {
    const venue = state.venues.find((entry) => entry.id === session.placeId);
    if (!venue || !venueClasses(venue).includes("residence")) return;
    venue.playerSeenShared = true;
    if (session.area === "private" && venueResidentIds(venue).includes(session.privateOwnerId))
      venue.playerSeenPrivateIds = [...new Set([...(venue.playerSeenPrivateIds ?? []), session.privateOwnerId])];
  });
}

async function applyVenueRequests(session: VenueSession, submission: VenueSubmission): Promise<void> {
  if (submission.editApprovalSignal) {
    const signal = submission.editApprovalSignal;
    const quote = signal.quote.replace(/\s+/gu, " ").toLowerCase();
    if (
      session.lines.some(
        (line) =>
          line.id === signal.sourceLineId &&
          line.speakerId === signal.residentId &&
          line.content.replace(/\s+/gu, " ").toLowerCase().includes(quote),
      )
    )
      await applyResidenceEditApproval(session.placeId, signal.proposalId, signal.residentId, signal.approved);
  }
  if (submission.residenceSignal) {
    const signal = submission.residenceSignal;
    if (signal.kind === "request") {
      try {
        await proposeVillageResidence(signal.characterId, signal.venueId, "villager", `venue-move:${submission.id}`);
      } catch (error) {
        villagesLogger().warn("[villages] residence request was no longer valid: %s", String(error));
      }
    } else {
      try {
        await decideVillageResidence(signal.characterId, signal.approved === true, "villager");
      } catch (error) {
        villagesLogger().warn("[villages] residence decision was no longer valid: %s", String(error));
      }
    }
  }
  if (submission.upgradeSignal) {
    try {
      await recordVillagerVenueImprovement(
        submission.upgradeSignal.characterId,
        submission.upgradeSignal.venueId,
        submission.upgradeSignal.quote,
        `venue-upgrade:${submission.id}`,
      );
    } catch (error) {
      villagesLogger().warn("[villages] upgrade request was no longer valid: %s", String(error));
    }
  }
}

async function applyVenueTurnChange(session: VenueSession, submission: VenueSubmission): Promise<void> {
  if (!submission.sceneChange) return;
  const area = submission.areaAtTurn ?? session.area;
  if (area === "private") return;
  const privateOwnerId = submission.privateOwnerIdAtTurn ?? session.privateOwnerId;
  const id = `venue-chat:${session.id}:${submission.id}`;
  await mutateVillageState((state) => {
    if (
      area === "shared" &&
      state.venues.some((venue) => venue.id === session.placeId && venueResidentIds(venue).length > 0)
    )
      return;
    if (state.venueEvents.some((event) => event.id === id)) return;
    const change = readVenueSceneChange(
      { happened: true, ...submission.sceneChange },
      (() => {
        const place = state.venues.find((entry) => entry.id === session.placeId);
        return place ? venueInArea(place, area, session.spaceClass, privateOwnerId) : undefined;
      })(),
    );
    if (!change) return;
    const at = submission.at || new Date().toISOString();
    applyVenueSceneChange(state, session.placeId, change, submission.id, at, session.spaceClass, area, privateOwnerId);
    const venue = state.venues.find((place) => place.id === session.placeId)!;
    const moment = deriveVillageMoment({ foundedAt: state.foundedAt, seed: state.seed, now: new Date(at) });
    state.happenings = prependHappenings(state.happenings, [
      {
        id,
        kind: "player-action",
        actorIds: [],
        venueId: session.placeId,
        dayIndex: moment.dayIndex,
        clock: moment.dayPhase,
        occurredAt: at,
        timePrecision: "exact",
        sourceOpportunityId: "",
        narration: change.narration,
        text: change.narration,
      },
    ]);
    state.venueEvents = [
      { id, venueId: session.placeId, venueName: venue.name, text: change.narration, at },
      ...state.venueEvents,
    ].slice(0, 200);
  });
}

async function applyFulfilledWish(session: VenueSession, submission: VenueSubmission): Promise<void> {
  if (!submission.wishId) return;
  await mutateVillageState((state) => {
    const memoryId = `${session.id}:wish:${submission.wishId}`;
    if (state.chronicle.some((entry) => entry.id === memoryId)) return;
    const resident = state.villagers.find((person) => person.characterId === submission.targetId);
    const wish = resident?.agenda?.wishes.find((entry) => entry.id === submission.wishId);
    if (!resident?.agenda || !wish) return;
    resident.agenda.wishes = resident.agenda.wishes.filter((entry) => entry.id !== submission.wishId);
    const moment = deriveVillageMoment({ foundedAt: state.foundedAt, seed: state.seed, now: new Date() });
    state.chronicle = [
      {
        id: memoryId,
        dayIndex: moment.dayIndex,
        clock: moment.dayPhase,
        occurredAt: moment.instant,
        timePrecision: "exact",
        scope: "private",
        actors: [{ id: submission.targetId, name: resident.cardSnapshot.name }],
        kind: "favour",
        weight: wish.intensity,
        text: submission.wishMemory || `${resident.cardSnapshot.name} saw their wish fulfilled.`,
      },
      ...state.chronicle,
    ];
  });
}

async function applyTurnMemories(session: VenueSession, submission: VenueSubmission): Promise<void> {
  if (session.memoryMode !== "turn" || !submission.turnMemories?.length) return;
  await mutateVillageState((state) => {
    const moment = deriveVillageMoment({
      foundedAt: state.foundedAt,
      seed: state.seed,
      now: new Date(submission.at || Date.now()),
    });
    for (const memory of submission.turnMemories ?? []) {
      const person = session.participants.find((entry) => entry.characterId === memory.characterId);
      const ids = [...new Set(memory.lineIds ?? [])];
      if (
        !person ||
        !memory.text ||
        !ids.length ||
        ids.some((id) => !session.lines.some((line) => line.id === id && line.heardBy.includes(person.characterId)))
      )
        continue;
      const id = `${session.id}:turn:${submission.id}:memory:${person.characterId}`;
      if (state.chronicle.some((entry) => entry.id === id)) continue;
      state.chronicle.unshift({
        id,
        dayIndex: moment.dayIndex,
        clock: moment.dayPhase,
        occurredAt: moment.instant,
        timePrecision: "exact",
        scope: "private",
        actors: [{ id: person.characterId, name: person.name }],
        kind: "chat",
        text: memory.text,
        sourceLineIds: ids,
      });
    }
  });
}

async function receiptForTurn(session: VenueSession, submission: VenueSubmission): Promise<VenueRecordEvent[]> {
  if (submission.recordEvents) return submission.recordEvents;
  const village = await readVillageState();
  const events: VenueRecordEvent[] = [];
  for (const memory of submission.turnMemories ?? []) {
    const id = `${session.id}:turn:${submission.id}:memory:${memory.characterId}`;
    if (village.chronicle.some((entry) => entry.id === id))
      events.push({
        id,
        kind: "memory",
        text: `${session.participants.find((person) => person.characterId === memory.characterId)?.name ?? "A villager"} remembered this exchange.`,
      });
  }
  const wishId = `${session.id}:wish:${submission.wishId}`;
  if (submission.wishId && village.chronicle.some((entry) => entry.id === wishId))
    events.push({ id: wishId, kind: "wish", text: "A villager's wish was fulfilled." });
  const venueId = `venue-chat:${session.id}:${submission.id}`;
  const change = village.venueEvents.find((entry) => entry.id === venueId);
  if (change) events.push({ id: venueId, kind: "venue", text: change.text });
  const request = submission.residenceSignal;
  if (request?.kind === "request" && village.processedOpportunityIds.includes(`venue-move:${submission.id}`)) {
    const name =
      session.participants.find((person) => person.characterId === request.characterId)?.name ?? "A villager";
    events.push({ id: `venue-move:${submission.id}`, kind: "request", text: `${name} asked to move.` });
  }
  if (submission.upgradeSignal && village.processedOpportunityIds.includes(`venue-upgrade:${submission.id}`)) {
    const name =
      session.participants.find((person) => person.characterId === submission.upgradeSignal!.characterId)?.name ??
      "A villager";
    events.push({
      id: `venue-upgrade:${submission.id}`,
      kind: "request",
      text: `${name} suggested a Venue improvement.`,
    });
  }
  await changeSession(session.id, (state) => {
    const saved = state.submissions.find((entry) => entry.id === submission.id);
    if (saved && !saved.recordEvents) saved.recordEvents = events;
  });
  return events;
}

type MemoryUnit = {
  lineId: string;
  part: number;
  role: VenueLine["role"];
  speaker: string;
  text: string;
  heardBy: string[];
};
const MEMORY_INPUT_CEILING = 12_000;
const MEMORY_LINE_PART = 2_400;
const MEMORY_ERROR = "The conversation could not be remembered. Try ending it again.";

function memoryUnits(session: VenueSession): MemoryUnit[] {
  const heard = new Map(session.heardHistory.map((history) => [history.characterId, new Set(history.lineIds)]));
  return session.lines.flatMap((line) => {
    const heardBy = session.participants
      .map((person) => person.characterId)
      .filter((id) => heard.get(id)?.has(line.id));
    if (!heardBy.length) return [];
    const units: MemoryUnit[] = [];
    for (let offset = 0; offset < line.content.length; offset += MEMORY_LINE_PART)
      units.push({
        lineId: line.id,
        part: Math.floor(offset / MEMORY_LINE_PART) + 1,
        role: line.role,
        speaker: line.name || (line.role === "user" ? "Player" : "Scene"),
        text: line.content.slice(offset, offset + MEMORY_LINE_PART),
        heardBy,
      });
    return units;
  });
}

function memoryMessages(session: VenueSession, evidence: MemoryUnit[]): CapabilityLanguageModelMessage[] {
  return [
    {
      role: "system",
      content:
        'Distill one venue visit into a SELECTIVE set of short, attributed memories, at most 8 for this evidence chunk. Evidence rows are [lineId, part, role, speaker, text, heardBy]. Keep consequential player actions, promises, relationships, and distinctive details; omit routine dialogue, repeated details, and changes already held in world state. Each memory must cite one or more lineIds heard by that character. Do not share private information with anyone who did not hear it. Return JSON only: {"memories":[{"characterId":"...","text":"...","lineIds":["..."]}],"complete":true}. Complete means you considered ALL supplied evidence, not that every line became a memory. Each text is at most 320 characters. Return "more":true only if the answer cannot hold the selected memories.',
    },
    {
      role: "user",
      content: JSON.stringify({
        venue: session.placeName,
        participants: session.participants.map(({ characterId, name }) => ({ characterId, name })),
        evidence: evidence.map((unit) => [unit.lineId, unit.part, unit.role, unit.speaker, unit.text, unit.heardBy]),
      }),
    },
  ];
}

async function distill(session: VenueSession, signal: AbortSignal): Promise<VenueMemory[]> {
  const units = memoryUnits(session);
  const model = await villagesLanguageModels().resolveForRequest({
    connectionId: await villagesConnectionIdFor("narration"),
  });
  const maxTokens = Math.min(model.maxOutputTokens ?? 2_400, 2_400);
  const saved = session.memoryProgress ?? { nextUnit: 0, entries: [] };
  let cursor = Math.max(0, Math.min(saved.nextUnit, units.length));
  const entries = [...saved.entries];
  const heardByLine = new Map<string, Set<string>>();
  for (const unit of units) heardByLine.set(unit.lineId, new Set(unit.heardBy));

  const fits = (start: number, end: number) => {
    const messages = memoryMessages(session, units.slice(start, end));
    if (messages.reduce((size, item) => size + item.content.length, 0) > MEMORY_INPUT_CEILING) return false;
    const fitted = model.fitContext(messages, { maxTokens });
    // Some providers fit by discarding earlier messages. Evidence must survive verbatim.
    return fitted.maxTokens === maxTokens && JSON.stringify(fitted.messages) === JSON.stringify(messages);
  };

  const process = async (start: number, end: number): Promise<void> => {
    signal.throwIfAborted();
    const messages = memoryMessages(session, units.slice(start, end));
    const completion = await completeWithRoom(model, messages, maxTokens, {
      temperature: 0.2,
      debugMode: false,
      signal: AbortSignal.any([signal, AbortSignal.timeout(90_000)]),
    });
    signal.throwIfAborted();
    const raw = extractJsonObject(completion.content ?? "");
    const saturated = completion.finishReason === "length" || raw?.more === true || raw?.complete !== true;
    if (saturated) {
      if (end - start < 2) throw new Error(MEMORY_ERROR);
      const middle = start + Math.floor((end - start) / 2);
      await process(start, middle);
      await process(middle, end);
      return;
    }
    if (!Array.isArray(raw?.memories)) throw new Error(MEMORY_ERROR);
    const chunkIds = new Set(units.slice(start, end).map((unit) => unit.lineId));
    const fresh: VenueMemory[] = [];
    for (const value of raw.memories) {
      const record = asRecord(value);
      const characterId = asTrimmedString(record.characterId);
      const text = asTrimmedString(record.text).slice(0, MAX_CHRONICLE_LENGTH);
      const lineIds = Array.isArray(record.lineIds)
        ? [...new Set(record.lineIds.filter((id): id is string => typeof id === "string"))]
        : [];
      if (
        !characterId ||
        !text ||
        !lineIds.length ||
        lineIds.some((id) => !chunkIds.has(id) || !heardByLine.get(id)?.has(characterId))
      )
        throw new Error(MEMORY_ERROR);
      if (
        !entries.some(
          (entry) => entry.characterId === characterId && entry.text.toLowerCase() === text.toLowerCase(),
        ) &&
        !fresh.some((entry) => entry.characterId === characterId && entry.text.toLowerCase() === text.toLowerCase())
      )
        fresh.push({ characterId, text, lineIds });
    }
    entries.push(...fresh);
    cursor = end;
    await changeSession(session.id, (state) => {
      if (state.memoryPending) throw conflict("This visit was left with memory pending.");
      state.memoryProgress = { nextUnit: cursor, entries: [...entries] };
    });
  };

  while (cursor < units.length) {
    signal.throwIfAborted();
    let end = cursor + 1;
    if (!fits(cursor, end)) throw new Error(MEMORY_ERROR);
    while (end < units.length && fits(cursor, end + 1)) end += 1;
    await process(cursor, end);
  }
  return entries;
}

export async function endVenueSession(id: string): Promise<VenueSession> {
  const inFlight = closingTasks.get(id);
  if (inFlight) return inFlight;
  const controller = new AbortController();
  closingControllers.set(id, controller);
  const task = endVenueSessionOnce(id, controller.signal);
  closingTasks.set(id, task);
  try {
    return await task;
  } finally {
    closingTasks.delete(id);
    closingControllers.delete(id);
  }
}

const closingTasks = new Map<string, Promise<VenueSession>>();
const closingControllers = new Map<string, AbortController>();

async function endVenueSessionOnce(id: string, signal: AbortSignal): Promise<VenueSession> {
  const session = await readSession(id);
  if (session.status === "closed" && !session.memoryPending) {
    await clearActivePointer(id);
    return session;
  }
  if (session.status !== "closed") {
    if (isInactive(session)) {
      await interruptInactiveVisit(id);
      throw new VillagesRequestError(410, "Interrupted: Inactivity. This visit ended while you were away.");
    }
    const active = await readActive();
    if (active.sessionId !== id) throw conflict("That venue conversation is not active.");
  }
  const closing = await changeSession(id, (state) => {
    state.status = "closing";
    state.memoryPending = false;
  });
  const hasPlayerTurn = closing.lines.some((line) => line.role === "user");
  const memories =
    closing.memoryMode === "turn"
      ? []
      : (closing.memories ?? (hasPlayerTurn && closing.participants.length > 0 ? await distill(closing, signal) : []));
  signal.throwIfAborted();
  await changeSession(id, (state) => {
    if (state.memoryPending) throw conflict("This visit was left with memory pending.");
    state.memories = memories;
  });
  signal.throwIfAborted();
  if (memories.length)
    await mutateVillageState((state) => {
      const moment = deriveVillageMoment({ foundedAt: state.foundedAt, seed: state.seed, now: new Date() });
      const fresh: VillageChronicleEntry[] = memories
        .map((entry, index): VillageChronicleEntry => ({
          id: `${id}:memory:${index}`,
          dayIndex: moment.dayIndex,
          clock: moment.dayPhase,
          occurredAt: moment.instant,
          timePrecision: "exact",
          scope: "private",
          actors: [
            {
              id: entry.characterId,
              name: session.participants.find((person) => person.characterId === entry.characterId)?.name ?? "",
            },
          ],
          kind: "chat",
          text: entry.text,
          sourceLineIds: entry.lineIds,
        }))
        .filter((entry) => !state.chronicle.some((saved) => saved.id === entry.id));
      state.chronicle = [...fresh, ...state.chronicle];
    });
  const closed = await changeSession(id, (state) => {
    signal.throwIfAborted();
    if (state.memoryPending) throw conflict("This visit was left with memory pending.");
    state.status = "closed";
    state.memoryPending = false;
    state.endedAt ||= new Date().toISOString();
    state.endReason ||= "player";
  });
  await clearActivePointer(id);
  const hasLeaveSubmission = closing.submissions.some((submission) => submission.mode === "leave");
  if (!hasPlayerTurn && !hasLeaveSubmission) {
    const document = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, `${SESSION_PREFIX}${id}`);
    if (document) await villagesDocuments().remove(VILLAGES_PACKAGE_ID, document.id, document.revision);
  }
  await pruneVenueVisits();
  return closed;
}

/** Release the player when extraction is unavailable; the exact transcript stays retriable. */
export async function leaveVenueMemoryPending(id: string): Promise<VenueSession> {
  const session = await readSession(id);
  if (session.memoryMode === "turn") return endVenueSession(id);
  if (session.status !== "closed" && isInactive(session)) {
    await interruptInactiveVisit(id);
    throw new VillagesRequestError(410, "Interrupted: Inactivity. This visit ended while you were away.");
  }
  if (session.status !== "closed" && (await readActive()).sessionId !== id)
    throw conflict("That venue conversation is not active.");
  closingControllers.get(id)?.abort();
  const closed = await changeSession(id, (state) => {
    if (state.status === "closed" && !state.memoryPending) return;
    state.status = "closed";
    state.memoryPending = true;
    state.endedAt ||= new Date().toISOString();
    state.endReason ||= "player";
  });
  await clearActivePointer(id);
  return closed;
}

export async function recordVenueAction(
  placeId: string,
  action: string,
  result: VenueActionResult,
  submissionId: string,
): Promise<void> {
  const session = await activeVenueSession();
  if (!session || session.placeId !== placeId || session.status !== "active")
    throw conflict("That venue visit is not active.");
  await changeSession(session.id, (state) => {
    if (isInactive(state))
      throw new VillagesRequestError(410, "Interrupted: Inactivity. This visit ended while you were away.");
    if (state.submissions.some((entry) => entry.id === submissionId)) return;
    const at = new Date().toISOString();
    state.lastActivityAt = at;
    appendLine(state, {
      id: randomUUID(),
      speakerId: "",
      name: "",
      role: "user",
      content: action,
      at,
      heardBy: [...state.activeIds],
    });
    appendLine(state, {
      id: randomUUID(),
      speakerId: "__venue_scene__",
      name: "Scene",
      role: "assistant",
      content: result.narration,
      at,
      heardBy: [...state.activeIds],
    });
    state.submissions.push({
      id: submissionId,
      message: action,
      mode: "act",
      targetId: "",
      verdict: null,
      wishId: "",
      wishMemory: "",
      action: result,
    });
  });
}

export async function discardVenueVisitDebug(id: string): Promise<void> {
  if (!villagesDebugAgentsEnabled()) throw notFound("That debug action is unavailable.");
  const session = await requireLiveVenueSession(id);
  greetingTasks.get(id)?.abort();
  closingControllers.get(id)?.abort();
  await changeSession(id, (state) => {
    if (state.status === "closed") return;
    state.status = "closed";
    state.endedAt = new Date().toISOString();
    state.endReason = "debug";
  });
  await clearActivePointer(id);
  const document = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, `${SESSION_PREFIX}${session.id}`);
  if (document) await villagesDocuments().remove(VILLAGES_PACKAGE_ID, document.id, document.revision);
}

export async function listVenueVisits(
  filter: { placeId?: string; characterId?: string } = {},
): Promise<VenueSession[]> {
  const records = await villagesDocuments().list(VILLAGES_PACKAGE_ID, SESSION_KIND);
  return records
    .map((record) => coerceSession(record.data))
    .filter(
      (session) =>
        session.status === "closed" &&
        (!filter.placeId || session.placeId === filter.placeId) &&
        (!filter.characterId || session.participants.some((person) => person.characterId === filter.characterId)),
    )
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export async function readVenueVisit(id: string): Promise<VenueSession> {
  const session = await readSession(id);
  if (session.status !== "closed") throw notFound("That visit is not in the archive.");
  return session;
}

export async function listVenueVisitSummaries(
  filter: { placeId?: string; characterId?: string; offset?: number; limit?: number } = {},
): Promise<{
  visits: {
    id: string;
    placeId: string;
    placeName: string;
    startedAt: string;
    endedAt: string;
    endReason: VenueSession["endReason"];
    participants: VenueParticipant[];
    lineCount: number;
    memoryUnits: number;
    memoryPending: boolean;
    memoryProgress: { nextUnit: number } | null;
  }[];
  total: number;
}> {
  await pruneVenueVisits();
  const visits = await listVenueVisits(filter);
  const offset = Number.isFinite(filter.offset) ? Math.max(0, Math.floor(filter.offset!)) : 0;
  const limit = Number.isFinite(filter.limit) ? Math.min(100, Math.max(1, Math.floor(filter.limit!))) : 20;
  return {
    total: visits.length,
    visits: visits.slice(offset, offset + limit).map((visit) => ({
      id: visit.id,
      placeId: visit.placeId,
      placeName: visit.placeName,
      startedAt: visit.startedAt,
      endedAt: visit.endedAt,
      endReason: visit.endReason,
      participants: visit.participants,
      lineCount: visit.lines.length,
      memoryUnits: memoryUnits(visit).length,
      memoryPending: visit.memoryPending,
      memoryProgress: visit.memoryProgress ? { nextUnit: visit.memoryProgress.nextUnit } : null,
    })),
  };
}

export async function deleteVenueVisit(id: string): Promise<void> {
  const document = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, `${SESSION_PREFIX}${id}`);
  if (!document || coerceSession(document.data).status !== "closed")
    throw notFound("That visit is not in the archive.");
  if (!(await villagesDocuments().remove(VILLAGES_PACKAGE_ID, document.id, document.revision)))
    throw conflict("The visit changed while it was being deleted. Try again.");
}

export async function deleteAllVenueVisits(): Promise<void> {
  const documents = await villagesDocuments().list(VILLAGES_PACKAGE_ID, SESSION_KIND);
  for (const document of documents)
    if (coerceSession(document.data).status === "closed") await deleteVenueVisit(coerceSession(document.data).id);
}

export async function setVenueVisitRetention(value: unknown): Promise<void> {
  const input = asRecord(value);
  const mode = input.mode;
  const count = Number(input.value);
  if (mode !== "forever" && mode !== "count" && mode !== "days") throw badRequest("Choose a visit retention mode.");
  if (mode === "count" && (!Number.isInteger(count) || count < 1 || count > 1_000))
    throw badRequest("Keep between 1 and 1,000 visits.");
  if (mode === "days" && (!Number.isInteger(count) || count < 30 || count > 3_650))
    throw badRequest("Retire visits after 30 to 3,650 days.");
  await mutateVillageState((state) => {
    state.visitRetention = mode === "forever" ? { mode, value: 0 } : { mode, value: count };
  });
  await pruneVenueVisits();
}

export async function pruneVenueVisits(): Promise<void> {
  const retention = (await readVillageState()).visitRetention;
  if (retention.mode === "forever") return;
  const documents = await villagesDocuments().list(VILLAGES_PACKAGE_ID, SESSION_KIND);
  const eligible = documents
    .map((document) => ({ document, session: coerceSession(document.data) }))
    .filter(({ session }) => session.status === "closed" && !session.memoryPending)
    .sort((a, b) => b.session.startedAt.localeCompare(a.session.startedAt));
  const cutoff = Date.now() - retention.value * 86_400_000;
  const expired =
    retention.mode === "count"
      ? eligible.slice(retention.value)
      : eligible.filter(({ session }) => Date.parse(session.endedAt || session.startedAt) < cutoff);
  for (const { document } of expired)
    await villagesDocuments().remove(VILLAGES_PACKAGE_ID, document.id, document.revision);
}

/** Recover completed visit notes written before the chronicle migration, idempotently. */
export async function backfillVenueMemories(): Promise<void> {
  const village = await readVillageState();
  if (village.visitMemoryBackfilled) return;
  const visits = await listVenueVisits();
  const old = visits.filter((visit) => visit.memories?.length);
  if (!old.length) {
    if (village.setupAt || village.foundedAt)
      await mutateVillageState((state) => {
        state.visitMemoryBackfilled = true;
      });
    return;
  }
  await mutateVillageState((state) => {
    if (state.visitMemoryBackfilled) return;
    const known = new Set(state.chronicle.map((entry) => entry.id));
    const fresh: VillageChronicleEntry[] = [];
    for (const visit of old) {
      const moment = deriveVillageMoment({
        foundedAt: state.foundedAt,
        seed: state.seed,
        now: new Date(visit.endedAt || visit.startedAt),
      });
      visit.memories?.forEach((memory, index) => {
        const id = `${visit.id}:memory:${index}`;
        if (known.has(id)) return;
        known.add(id);
        fresh.push({
          id,
          dayIndex: moment.dayIndex,
          clock: moment.dayPhase,
          occurredAt: visit.endedAt || visit.startedAt,
          timePrecision: "exact",
          scope: "private",
          actors: [
            {
              id: memory.characterId,
              name: visit.participants.find((person) => person.characterId === memory.characterId)?.name ?? "",
            },
          ],
          kind: "chat",
          text: memory.text,
          sourceLineIds: memory.lineIds,
        });
      });
    }
    state.chronicle = [...fresh, ...state.chronicle];
    state.visitMemoryBackfilled = true;
  });
}

/** A village reset also removes the previous village's private visit archive. */
export async function resetVenueSessions(): Promise<void> {
  if ((await readActive()).sessionId)
    throw conflict("Finish the active venue conversation before starting the village over.");
  const documents = villagesDocuments();
  const visits = await documents.list(VILLAGES_PACKAGE_ID, SESSION_KIND);
  for (const visit of visits)
    if (!(await documents.remove(VILLAGES_PACKAGE_ID, visit.id, visit.revision)))
      throw conflict("A venue archive changed while the village was being reset. Try again.");
  const pointer = await documents.getById(VILLAGES_PACKAGE_ID, ACTIVE_ID);
  if (pointer && !(await documents.remove(VILLAGES_PACKAGE_ID, ACTIVE_ID, pointer.revision)))
    throw conflict("The active venue changed while the village was being reset. Try again.");
}
