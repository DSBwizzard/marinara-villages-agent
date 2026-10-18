import { extractModelJsonObject } from "../../domain/rules/json-reply.js";
import { randomUUID } from "node:crypto";
import type {
  SceneOriginProvider,
  SceneOriginEnd,
  CapabilityPersistenceHost,
  CapabilityLanguageModelHost,
} from "@marinara-engine/shared";
import type { SceneRepository } from "../../adapters/storage/scene-repository.js";
import type { VillageState } from "../../domain/models/world.js";
import type { VillageSpinoff } from "../../domain/models/spinoff-model.js";
import { spinoffLocksScene } from "../../domain/models/spinoff-model.js";
import { conflict, badRequest } from "../../domain/rules/errors.js";
import { asRecord } from "../../domain/rules/coerce.js";
import { deriveVillageMoment } from "../../domain/rules/village-clock.js";
import { selectPromptMemories } from "../../domain/rules/memory-selection.js";
import { SPINOFF_REVIEW_INSTRUCTION, readSpinoffReview, publicSpinoff } from "../../domain/rules/spinoff-memory.js";

export type SpinoffPorts = {
  repository: SceneRepository;
  readVillageState(): Promise<VillageState>;
  mutateVillageState(update: (state: VillageState) => void): Promise<VillageState>;
  persistence(): CapabilityPersistenceHost;
  models(): CapabilityLanguageModelHost;
  connectionId(): Promise<string | null>;
  now(): Date;
  busy(id: string): boolean;
  parseJson(text: string): unknown;
};

/** Package-owned handoff. Callback paths only persist; model calls require an explicit user action. */
export function createSpinoffs(ports: SpinoffPorts) {
  const repo = ports.repository;
  const interpreting = new Set<string>();
  async function stored(id: string): Promise<VillageSpinoff> {
    const value = (await repo.readSession(id)).spinoff;
    if (!value) throw conflict("This Scene has no spinoff.");
    return value;
  }
  function belongs(value: VillageSpinoff, village: VillageState) {
    return (
      value.villageSeed === village.seed &&
      !village.playerPersonaMissing &&
      village.playerPersonaId === value.personaId &&
      village.villagers.some((resident) => resident.characterId === value.residentId)
    );
  }
  async function current(id: string): Promise<VillageSpinoff> {
    const value = await stored(id);
    const village = await ports.readVillageState();
    if (!belongs(value, village))
      throw conflict("This spinoff no longer belongs to the current village, persona, or resident.");
    return value;
  }
  async function change(id: string, spinoffId: string, update: (value: VillageSpinoff) => void) {
    return repo.changeSpinoffSession(id, (scene) => {
      if (scene.spinoff?.id !== spinoffId) throw conflict("The spinoff changed. Reload it.");
      update(scene.spinoff);
      if (scene.spinoff.status === "resolved" && !scene.spinoff.resolvedAt) {
        scene.spinoff.resolvedAt = ports.now().toISOString();
        scene.lastActivityAt = scene.spinoff.resolvedAt;
      }
    });
  }
  async function begin(sessionId: string, residentId: string, revision: number, requestId: string) {
    const village = await ports.readVillageState();
    const scene = await repo.readSession(sessionId);
    if (scene.spinoff?.id === requestId) return publicSpinoff(await current(sessionId));
    if (!village.seed || !village.playerPersonaId || village.playerPersonaMissing)
      throw conflict("Link a valid player persona first.");
    if (
      (await repo.readActive()).sessionId !== sessionId ||
      scene.status !== "active" ||
      scene.villageSeed !== village.seed
    )
      throw conflict("Open the current Village Scene first.");
    if (
      ports.busy(sessionId) ||
      scene.operation?.status === "running" ||
      scene.submissions.some(
        (turn) =>
          turn.processing &&
          Object.values(turn.processing.domains).some((domain) => ["pending", "failed"].includes(domain.status)),
      )
    )
      throw conflict("Finish or resolve the Scene's saved work before starting a spinoff.");
    const resident = village.villagers.find((person) => person.characterId === residentId);
    if (!resident || !scene.activeIds.includes(residentId)) throw conflict("Choose a resident in your current Zone.");
    const model = await ports.models().resolve(await ports.connectionId());
    const at = new Date(scene.sceneAttendance?.capturedAt || scene.startedAt);
    if (!Number.isFinite(at.getTime()))
      throw conflict("The original Scene time is unavailable. Start a new Scene first.");
    const moment = deriveVillageMoment({
      foundedAt: village.foundedAt,
      seed: village.seed,
      now: at,
      timeZone: village.timeZone,
    });
    const transcript = scene.lines
      .filter(
        (line) =>
          !line.contactHidden &&
          !line.contactReport &&
          !line.asideFor &&
          line.kind !== "side" &&
          line.kind !== "whisper" &&
          line.heardBy.includes(residentId) &&
          (line.role === "user" || line.speakerId === residentId),
      )
      .slice(-30)
      .map((line) => ({
        speaker: line.role === "user" ? village.playerPersonaName : resident.cardSnapshot.name,
        content: line.content.slice(0, 2000),
      }));
    const sharedIds = new Set(
      scene.lines
        .filter(
          (line) =>
            !line.contactHidden &&
            !line.contactReport &&
            !line.asideFor &&
            line.kind !== "whisper" &&
            line.kind !== "side" &&
            line.heardBy.includes(residentId),
        )
        .map((line) => line.id),
    );
    const memories = selectPromptMemories(
      village.chronicle.filter(
        (memory) =>
          memory.sourceVisitId === scene.id &&
          memory.sourceLineIds?.length &&
          memory.sourceLineIds.every((id) => sharedIds.has(id)),
      ),
      [residentId],
      scene.placeName,
      1000,
    );
    const context = JSON.stringify({
      setting: village.setting,
      worldFacts: village.worldFacts,
      origin: village.scenarioImprint?.origin,
      date: moment.dateLabel,
      time: moment.localTime,
      timeZone: moment.timeZone,
      place: scene.placeName,
      activity: scene.participants.find((person) => person.characterId === residentId)?.doing,
      player: { name: village.playerPersonaName, identity: village.playerPersonaIdentity },
      resident: { name: resident.cardSnapshot.name, description: resident.cardSnapshot.description },
      // Only timing bounds leave Villages; private wishes, activities and other Zone attendance do not.
      commitmentBoundaries: (resident.agenda?.activeDay?.blocks ?? resident.agenda?.day ?? []).map((block) => ({
        startMinute: block.startMinute,
        endMinute: block.endMinute,
      })),
      memories: memories.map((entry) => entry.text),
    });
    if (context.length > 40000)
      throw conflict("This encounter's context is too large for the spinoff proof of concept.");
    const value: VillageSpinoff = {
      id: requestId,
      sessionId,
      residentId,
      residentName: resident.cardSnapshot.name,
      villageSeed: village.seed,
      personaId: village.playerPersonaId,
      anchoredAt: at.toISOString(),
      timeZone: moment.timeZone,
      connectionId: model.connectionId,
      capturedRevision: revision,
      context,
      transcript,
      lorebookIds: [...village.selectedLorebookIds],
      chatId: null,
      status: "prepared",
      summary: "",
      eligibility: "unreviewed",
      explanation: "",
      memories: [],
      acceptedIds: [],
      evidence: [],
    };
    const saved = await repo.changeSpinoffSession(sessionId, (draft) => {
      if (draft.spinoff?.id === requestId) return;
      if (
        spinoffLocksScene(draft.spinoff) ||
        draft.sceneRevision !== revision ||
        draft.status !== "active" ||
        ports.busy(sessionId) ||
        draft.operation?.status === "running" ||
        draft.submissions.some(
          (turn) =>
            turn.processing &&
            Object.values(turn.processing.domains).some((domain) => ["pending", "failed"].includes(domain.status)),
        )
      )
        throw conflict("The Scene changed. Reload before starting a spinoff.");
      draft.spinoff = value;
      draft.sceneRevision++;
    });
    return publicSpinoff(saved.spinoff!);
  }

  const provider: SceneOriginProvider = {
    async getContext(originId) {
      const value = await current(originId);
      if (value.status !== "prepared" || value.selectionIds !== undefined) return null;
      return {
        characterIds: [value.residentId],
        personaId: value.personaId,
        connectionId: value.connectionId,
        transcript: value.transcript,
        lorebookIds: value.lorebookIds,
        notes: `Village spinoff: one bounded encounter at the captured place and time. Freeform departures remain outside Village continuity. No automatic world or clock changes.\n${value.context}`,
      };
    },
    async claim(originId, scene) {
      const value = await current(originId);
      if (
        scene.data?.spinoffId !== value.id ||
        scene.characterIds.length !== 1 ||
        scene.characterIds[0] !== value.residentId
      )
        return false;
      try {
        await change(originId, value.id, (draft) => {
          if (draft.selectionIds !== undefined) throw conflict("This prepared spinoff was already discarded.");
          if (draft.status !== "prepared" && !(draft.status === "running" && draft.chatId === scene.sceneChatId))
            throw conflict("This spinoff was already claimed.");
          draft.chatId = scene.sceneChatId;
          draft.status = "running";
        });
        return true;
      } catch {
        return false;
      }
    },
    async release(originId, end) {
      await release(originId, end);
    },
  };

  async function release(sessionId: string, end: SceneOriginEnd) {
    const value = await stored(sessionId);
    if (value.chatId !== end.sceneChatId || value.status !== "running") return;
    await change(sessionId, value.id, (draft) => {
      if (draft.status !== "running") return;
      draft.outcome = end.kind;
      draft.summary = end.kind === "concluded" ? end.summary.slice(0, 12000) : "";
      draft.status = end.kind === "concluded" ? "returned" : "resolved";
      draft.explanation = end.kind === "concluded" ? "" : `Spinoff ${end.kind}; no memories imported.`;
    });
    if (end.kind !== "concluded") await resume(sessionId, value.id);
  }

  async function reconcile(sessionId: string) {
    let value = await stored(sessionId);
    if (value.status === "resolved" && !value.resolvedAt) {
      await resume(sessionId, value.id);
      value = await stored(sessionId);
    }
    if (!belongs(value, await ports.readVillageState())) {
      if (value.status !== "resolved") {
        await change(sessionId, value.id, (draft) => {
          draft.status = "resolved";
          draft.explanation =
            "The village, persona, or resident changed. This spinoff stays separate; no memories were imported.";
        });
        await resume(sessionId, value.id);
      }
      return publicSpinoff(await stored(sessionId));
    }
    if (value.status === "running" && value.chatId) {
      const chat = await ports.persistence().getChat(value.chatId);
      const meta =
        typeof chat?.metadata === "string" ? asRecord(ports.parseJson(chat.metadata)) : asRecord(chat?.metadata);
      if (!chat)
        await release(sessionId, { kind: "deleted", sceneChatId: value.chatId, data: { spinoffId: value.id } });
      else if (meta.sceneStatus === "concluded" && typeof meta.sceneSummary === "string")
        await release(sessionId, {
          kind: "concluded",
          sceneChatId: value.chatId,
          data: { spinoffId: value.id },
          summary: meta.sceneSummary,
          description: null,
          scenario: null,
          rating: "sfw",
          characterIds: [value.residentId],
        });
      else if (meta.sceneStatus !== "active")
        await release(sessionId, { kind: "converted", sceneChatId: value.chatId, data: { spinoffId: value.id } });
      value = await current(sessionId);
    }
    return publicSpinoff(value);
  }

  async function prepare(sessionId: string, retry = false) {
    await reconcile(sessionId);
    const value = await current(sessionId);
    if (value.status !== "returned" || !value.chatId) throw conflict("Conclude the Engine spinoff first.");
    if (value.eligibility !== "unreviewed") return publicSpinoff(value);
    if (interpreting.has(value.id)) throw conflict("Spinoff memory preparation is still running.");
    interpreting.add(value.id);
    try {
      const attempt = randomUUID();
      // Persist the attempt BEFORE dispatch. An interrupted/unknown attempt requires an explicit retry.
      await change(sessionId, value.id, (draft) => {
        if (draft.interpretationAttempt && !retry)
          throw conflict("Memory preparation may already have run. Retry explicitly after checking its status.");
        draft.interpretationAttempt = attempt;
        if (draft.status !== "returned" || draft.selectionIds !== undefined)
          throw conflict("This spinoff was already resolved.");
      });
      const rows = await ports.persistence().listMessages(value.chatId);
      const chat = await ports.persistence().getChat(value.chatId);
      if (
        !chat ||
        chat.personaId !== value.personaId ||
        chat.characterIds.length !== 1 ||
        chat.characterIds[0] !== value.residentId
      )
        throw conflict("The spinoff's persona or cast changed. Keep this proof-of-concept spinoff separate.");
      const evidence = rows
        .filter((line) => ["user", "assistant", "narrator"].includes(line.role))
        .map((line) => {
          const extra =
            typeof line.extra === "string" && line.extra.trim()
              ? asRecord(ports.parseJson(line.extra))
              : asRecord(line.extra);
          if (
            extra.hiddenFromUser ||
            extra.hiddenFromAI ||
            extra.commandOnly ||
            extra.roleplayPrivateOnly ||
            (Array.isArray(extra.hiddenFromAICharacterIds) && extra.hiddenFromAICharacterIds.includes(value.residentId))
          )
            throw conflict(
              "This spinoff contains private or excluded messages. Keep it separate; hidden content will not be imported or shown.",
            );
          if (line.role === "assistant" && line.characterId !== value.residentId)
            throw conflict("The cast or narration changed; keep this proof-of-concept spinoff separate.");
          return {
            id: line.id,
            speaker:
              line.role === "user"
                ? ("player" as const)
                : line.role === "narrator"
                  ? ("narrator" as const)
                  : ("resident" as const),
            content: line.content,
          };
        });
      if (
        !evidence.length ||
        evidence.length > 200 ||
        evidence.reduce((sum, line) => sum + line.content.length, 0) > 100000
      )
        throw conflict(
          "The complete spinoff exceeds the proof-of-concept review limit or contains no conversation. Keep it separate.",
        );
      await change(sessionId, value.id, (draft) => {
        draft.evidence = evidence;
      });
      const model = await ports.models().resolve(value.connectionId);
      const messages = [
        { role: "system" as const, content: SPINOFF_REVIEW_INSTRUCTION },
        {
          role: "user" as const,
          content: JSON.stringify({
            capturedContext: value.context,
            originalConversation: value.transcript,
            transcript: evidence,
          }),
        },
      ];
      const fit = model.fitContext(messages, { maxTokens: 2400 });
      if (fit.trimmed || (fit.messages && JSON.stringify(fit.messages) !== JSON.stringify(messages)))
        throw conflict("The complete spinoff does not fit the review connection. Keep it separate.");
      const result = await model.chatComplete(messages, {
        responseFormat: { type: "json_object" },
        maxTokens: 2400,
        temperature: 0.1,
        signal: AbortSignal.timeout(90000),
      });
      if (["length", "max_tokens"].includes(result.finishReason))
        throw conflict("Memory preparation ran out of output space. No memories were accepted.");
      const review = readSpinoffReview(extractModelJsonObject(result), { ...value, evidence });
      await current(sessionId); // Revalidate village/persona/resident after generation.
      const saved = await change(sessionId, value.id, (draft) => {
        if (draft.status !== "returned" || draft.interpretationAttempt !== attempt || draft.selectionIds !== undefined)
          throw conflict("This memory preparation is stale.");
        Object.assign(draft, review);
      });
      return publicSpinoff(saved.spinoff!);
    } finally {
      interpreting.delete(value.id);
    }
  }

  async function resume(sessionId: string, id: string) {
    await change(sessionId, id, (draft) => {
      draft.status = "resolved";
    });
  }

  async function resolve(sessionId: string, acceptedIds: string[]) {
    const value = acceptedIds.length ? await current(sessionId) : await stored(sessionId);
    if (value.status === "resolved") return publicSpinoff(value);
    if (value.status === "running") throw conflict("End or delete the Engine spinoff before resolving it.");
    if (acceptedIds.length && (value.status !== "returned" || value.eligibility !== "compatible"))
      throw conflict("Only reviewed, compatible memories may be saved.");
    if (
      new Set(acceptedIds).size !== acceptedIds.length ||
      acceptedIds.some((id) => !value.memories.some((memory) => memory.id === id))
    )
      throw badRequest("Choose only the offered memories.");
    const stamp = ports.now().toISOString();
    await change(sessionId, value.id, (draft) => {
      if (draft.status !== value.status || draft.status === "running")
        throw conflict("The spinoff's status changed. Reload before resolving it.");
      if (draft.selectionIds && JSON.stringify(draft.selectionIds) !== JSON.stringify(acceptedIds))
        throw conflict("A previous memory selection was saved. Retry that selection.");
      draft.selectionIds = acceptedIds;
    });
    // Keep a durable private evidence record independent of Scene archive retention.
    const evidenceId = `villages-spinoff-${value.id}`;
    const documents = ports.persistence().documents;
    const existing = await documents.getById("villages", evidenceId);
    if (existing && JSON.stringify(asRecord(existing.data).acceptedIds) !== JSON.stringify(acceptedIds))
      throw conflict("A previous memory selection was saved. Retry that selection.");
    if (!existing && acceptedIds.length)
      await documents.create({
        id: evidenceId,
        packageId: "villages",
        kind: "spinoff",
        name: "Spinoff evidence",
        description: "Private reviewed spinoff source and memory receipts",
        data: {
          villageSeed: value.villageSeed,
          sessionId: value.sessionId,
          spinoffId: value.id,
          chatId: value.chatId,
          residentId: value.residentId,
          personaId: value.personaId,
          anchoredAt: value.anchoredAt,
          acceptedIds,
          memories: value.memories.filter((memory) => acceptedIds.includes(memory.id)),
        },
        createdAt: stamp,
        updatedAt: stamp,
      });
    if (acceptedIds.length)
      await ports.mutateVillageState((village) => {
        if (
          village.seed !== value.villageSeed ||
          village.playerPersonaId !== value.personaId ||
          !village.villagers.some((resident) => resident.characterId === value.residentId)
        )
          throw conflict("Village identity changed. No spinoff memories were imported.");
        const moment = deriveVillageMoment({
          foundedAt: village.foundedAt,
          seed: village.seed,
          now: new Date(value.anchoredAt),
          timeZone: village.timeZone,
        });
        for (const memory of value.memories.filter((row) => acceptedIds.includes(row.id))) {
          if (village.chronicle.some((row) => row.id === memory.id)) continue;
          village.chronicle.unshift({
            id: memory.id,
            text: memory.text,
            kind: "chat",
            memoryCategory: "shared-experience",
            scope: "private",
            occurredAt: value.anchoredAt,
            timePrecision: "exact",
            dayIndex: moment.dayIndex,
            clock: moment.dayPhase,
            actors: [{ id: value.residentId, name: value.residentName }],
            knownByCharacterIds: [value.residentId],
            subjectCharacterIds: [value.residentId],
            sourceVisitId: value.sessionId,
            sourceLineIds: memory.evidence.map((line) => line.id),
            evidenceHistory: [
              { visitId: evidenceId, submissionId: value.id, lineIds: memory.evidence.map((line) => line.id) },
            ],
          });
        }
      });
    await change(sessionId, value.id, (draft) => {
      draft.acceptedIds = acceptedIds;
      draft.status = "resolved";
    });
    await resume(sessionId, value.id);
    return publicSpinoff(await stored(sessionId));
  }

  return { provider, begin, reconcile, prepare, resolve };
}
export type Spinoffs = ReturnType<typeof createSpinoffs>;
