import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import { VILLAGES_PACKAGE_ID } from "../../adapters/engine/runtime-host.js";
import {
  createMemoryPayloadStore,
  emptyMemoryPayload,
  readMemoryHead,
} from "../../adapters/storage/memory-payload-store.js";
import { operationEvidenceStore } from "../../adapters/storage/operation-evidence.js";
import { readSceneRetryRecord } from "../../adapters/storage/scene-retry-record.js";
import { readVillageRoot, type createVillageRepository } from "../../adapters/storage/village-repository.js";
import { validateBackgroundJobRecord } from "../../adapters/storage/background-responses.js";
import { withRepairWork, type RepairGate } from "../../adapters/storage/repair-gate.js";
import { villageNow } from "../../adapters/time/clock-gate.js";
import type { Job } from "../../domain/models/background-model.js";
import type { VenueScene } from "../../domain/models/scene-model.js";
import type { VillageState } from "../../domain/models/world.js";
import { continuityActor } from "../../domain/rules/continuity-actors.js";
import { sceneEpisodeId } from "../../domain/rules/episode-sources.js";
import { VillagesRequestError } from "../../domain/rules/errors.js";
import { memoryHash, memoryRequire } from "../../domain/rules/memory-integrity.js";
import { acceptNarration } from "../../domain/rules/narration-native.js";
import { narrationSceneNotices } from "../../domain/rules/narration-notices.js";
import { findLocation } from "../../domain/rules/places.js";
import { accessExits, projectLiveAttendance, sceneZoneOccupants } from "../../domain/rules/scene-attendance.js";
import { retryableEpisode, sceneRetryAuthority } from "../../domain/rules/scene-retry.js";
import { mutableSceneSubmission } from "../../domain/rules/scene-submissions.js";
import { sceneAccessContext } from "../../domain/rules/venue-contact.js";
import type { SceneWritingRequest, SceneReply } from "./writing-service.js";

interface RetryPorts {
  documents(): CapabilityDocumentStore;
  repository: ReturnType<typeof createVillageRepository>;
  gate: RepairGate;
  readActive: typeof import("../../adapters/storage/scene-store.js").readActive;
  readSession: typeof import("../../adapters/storage/scene-store.js").readSession;
  changeSession: typeof import("../../adapters/storage/scene-store.js").changeSession;
  requireLiveVenueSession: typeof import("./live-session.js").requireLiveVenueSession;
  generate: typeof import("./writing.js").generate;
  coordinateVenue: typeof import("../../jobs/venue-coordinator.js").coordinateVenue;
  cancelVenueOperation: typeof import("../../jobs/venue-coordinator.js").cancelVenueOperation;
  assertVenueOwnership: typeof import("../../adapters/operations/operation-context.js").assertVenueOwnership;
  venueOperationSignal: typeof import("../../adapters/operations/operation-context.js").venueOperationSignal;
  venueRequestMetrics: typeof import("../../adapters/operations/operation-context.js").venueRequestMetrics;
}

function unavailable(reason: string): never {
  throw new VillagesRequestError(409, reason, "SCENE_RETRY_UNAVAILABLE");
}

function retryToken(scene: VenueScene, episodeId: string) {
  return memoryHash([episodeId, scene.sceneRevision, scene.operation?.id, scene.operation?.attemptId]);
}

export function createSceneRetry(ports: RetryPorts) {
  async function check(scene: VenueScene, operationId?: string) {
    if (scene.status !== "active" || (await ports.readActive()).sessionId !== scene.id)
      unavailable("Retry is available only in the active Scene.");
    if (scene.operation && scene.operation.id !== operationId && scene.operation.status !== "complete")
      unavailable("Finish the pending Scene request before retrying a reply.");
    const turn = scene.submissions.at(-1),
      reply = turn?.replyLineIds;
    if (turn?.mode !== "chat" || turn.id === "greeting" || turn.acceptance.status !== "applied" || !reply?.length)
      unavailable("The latest turn is not an accepted ordinary reply.");
    if (!reply.every((id, index) => scene.lines[scene.lines.length - reply.length + index]?.id === id))
      unavailable("The Scene moved on after that reply.");

    const documents = ports.documents();
    const root = readVillageRoot(await documents.getById(VILLAGES_PACKAGE_ID, "villages-village"));
    if (!root || root.seed !== scene.villageSeed) unavailable("The Village changed after that reply.");
    const world = { seed: root.seed as string, setupAt: root.setupAt as string };
    const retry = readSceneRetryRecord({ ...world, sceneRetry: root.sceneRetry });
    if (retry?.sceneId !== scene.id || retry.submissionId !== turn.id || retry.episodeId !== turn.episodeId)
      unavailable("The original reply has no Retry record or changed the Village outside ordinary dialogue.");
    if (retry.sceneRevision !== scene.sceneRevision) unavailable("The Scene changed after that reply.");
    const current = readMemoryHead(root.memoryHead);
    memoryRequire(current, "Scene Retry lost the current history");
    const payloads = createMemoryPayloadStore(documents);
    if (current.id !== retry.after.id || current.digest !== retry.after.digest) {
      const [head, saved] = await Promise.all([
        payloads.readManifest(current, world),
        payloads.readManifest(retry.after, world),
      ]);
      memoryRequire(head && saved, "Scene Retry history is missing");
      const scope = (manifest: typeof head) =>
        memoryHash([
          manifest.revision,
          manifest.records,
          manifest.versions,
          manifest.receipts,
          manifest.episodeRevision,
          manifest.episodes,
        ]);
      if (scope(head) !== scope(saved)) unavailable("Memories or exchanges changed after that reply.");
    }
    return { turn, retry, world, payloads };
  }

  async function target(scene: VenueScene) {
    try {
      const recovery =
        scene.operation?.kind === "retry" && scene.operation.status === "interrupted" ? scene.operation : undefined;
      const { retry } = await check(scene, recovery?.id);
      return recovery
        ? { token: String(recovery.input.token), requestId: String(recovery.input.requestId) }
        : { token: retryToken(scene, retry.episodeId) };
    } catch (error) {
      if (!(error instanceof VillagesRequestError) || error.code !== "SCENE_RETRY_UNAVAILABLE") throw error;
      return undefined;
    }
  }

  function verifyScope(state: VillageState, scene: VenueScene, request: SceneWritingRequest) {
    const { source, setupAt } = request.readset;
    const venue = findLocation(state, scene.placeId);
    if (
      !venue ||
      state.setupAt !== setupAt ||
      state.seed !== source.seed ||
      scene.zoneId !== source.scene.zoneId ||
      source.actors.some((actor) => continuityActor(state, actor.id)?.incarnation !== actor.incarnation)
    )
      unavailable("The original Scene context is no longer available.");
    const now = villageNow(state.clock?.advanceMs ?? 0);
    const live = projectLiveAttendance(state, scene, venue, now);
    const projected = {
      ...scene,
      accompanying: live.accompanying,
      departedIds: live.departedIds,
      sceneAttendance: live.attendance,
    };
    const before = sceneAccessContext(source.scene).positions!,
      after = sceneAccessContext(projected).positions!;
    const visible = new Set([
      "player",
      ...source.scene.activeIds,
      ...(source.scene.doorwayContacts ?? []).map((contact) => contact.characterId),
    ]);
    const local = (value: VenueScene) =>
      sceneZoneOccupants(value, venue, scene.zoneId!)
        .map((person) => person.characterId)
        .sort();
    if (
      Array.from(visible).some((id) => before[id] !== after[id]) ||
      memoryHash(local(projected)) !== memoryHash(local(source.scene)) ||
      memoryHash(live.attendance.layout) !== memoryHash(source.scene.sceneAttendance?.layout) ||
      accessExits({ ...projected, continuity: undefined }, state, venue).some(({ actor }) => visible.has(actor))
    )
      unavailable("The Scene changed after that reply.");
  }

  async function checkDependencies(state: VillageState, episodeId: string) {
    const episode = state.episodes.records.at(-1);
    if (episode?.id !== episodeId) unavailable("Another exchange followed that reply.");
    const ownedVersions = new Set(episode.continuityVersionIds);
    const introduced = new Set(
      state.continuity.versions.filter((row) => ownedVersions.has(row.id)).map((row) => row.rootId),
    );
    const units = [episodeId, ...episode.continuityVersionIds, ...introduced];
    if (introduced.size) {
      for (const row of state.continuity.versions) if (!ownedVersions.has(row.id)) introduced.delete(row.rootId);
      if (
        Object.keys(state.wishFollowing ?? {}).some((key) => introduced.has(key.slice(key.lastIndexOf(":") + 1))) ||
        state.residentPlans.plans.some((plan) => plan.wishId && introduced.has(plan.wishId))
      )
        unavailable("A Wish from that reply already has a follow-up.");
    }
    const jobs = await ports.documents().list(VILLAGES_PACKAGE_ID, "background-work");
    for (const row of jobs) {
      validateBackgroundJobRecord(row);
      const job = row.data as Job;
      const current = job.seed === state.seed && !["completed", "obsolete"].includes(job.status) ? job.input : null;
      const replacement = job.replacement?.seed === state.seed ? job.replacement.input : null;
      const owned = JSON.stringify([current, replacement]);
      if (units.some((id) => owned.includes(id))) unavailable("Pending Village work already uses that reply.");
    }
  }

  const operationIdFor = (sessionId: string, requestId: string, token: string) =>
    "retry-" + memoryHash([sessionId, token, requestId]);

  async function retryReply(sessionId: string, requestId: string, token: string) {
    const id = operationIdFor(sessionId, requestId, token);
    let original!: SceneWritingRequest;
    let publication!: SceneReply;
    const scene = await ports.readSession(sessionId);
    const prior = scene.operation?.id === id && scene.operation.kind === "retry" ? scene.operation : undefined;
    if (prior && prior.input.token !== token) unavailable("That Retry belongs to a different reply.");
    if (prior?.status === "complete")
      return {
        saved: scene.submissions.at(-1)?.episodeId === sceneEpisodeId(scene.villageSeed, scene.id, id),
        replacedNoticeIds: [],
      };
    const live = prior ? scene : await ports.requireLiveVenueSession(sessionId);
    const admitted = await withRepairWork(() =>
      ports.repository.withAuthorityLock(async () => {
        const admitted = await check(live, prior?.id);
        if (!prior && retryToken(live, admitted.retry.episodeId) !== token)
          unavailable("That Retry belongs to an earlier reply.");
        original = (await operationEvidenceStore(ports.documents()).read(
          admitted.retry.request,
          live,
          true,
        )) as SceneWritingRequest;
        memoryRequire(
          original.readset.source.operationId === admitted.retry.originalOperationId &&
            original.readset.source.scene.id === live.id &&
            original.readset.source.input === admitted.turn.message,
          "Scene Retry request ownership changed",
        );
        const starting = admitted.retry.before
          ? await admitted.payloads.read(admitted.retry.before, admitted.world)
          : emptyMemoryPayload();
        if (
          !starting ||
          starting.continuity.revision !== original.readset.continuityRevision ||
          starting.episodes.revision !== original.readset.retryEpisodeRevision
        )
          unavailable("The original reply's history is unavailable.");
        const state = await ports.repository.readAuthority({ memories: true });
        verifyScope(state, live, original);
        await checkDependencies(state, admitted.retry.episodeId);
        return admitted;
      }),
    );
    return ports.coordinateVenue(
      sessionId,
      id,
      "retry",
      { token, requestId },
      live.sceneRevision,
      undefined,
      async () => {
        publication = await ports.generate(
          live,
          admitted.turn.message,
          "chat",
          ports.venueOperationSignal(),
          undefined,
          {
            request: original,
            beforeDispatch: () =>
              withRepairWork(() =>
                ports.repository.withAuthorityLock(async () => {
                  const current = await ports.readSession(sessionId);
                  ports.assertVenueOwnership({ operation: current.operation });
                  const { retry } = await check(current, id);
                  if (retry.episodeId !== admitted.retry.episodeId)
                    unavailable("That reply has already been replaced.");
                  const state = await ports.repository.readAuthority({ memories: true });
                  verifyScope(state, current, original);
                  await checkDependencies(state, retry.episodeId);
                }),
              ),
          },
        );
        return { saved: true, replacedNoticeIds: (admitted.turn.recordEvents ?? []).map((event) => event.id) };
      },
      {
        recovery: prior?.status === "interrupted",
        expectedOperation: live.operation?.token ?? null,
        publish: async (operation) => {
          await ports.gate.commitSceneRetry(
            id,
            async () => {
              const scene = await ports.readSession(sessionId);
              ports.assertVenueOwnership({ operation: scene.operation });
              const { turn, retry, world, payloads } = await check(scene, id);
              if (retry.episodeId !== admitted.retry.episodeId) unavailable("That reply has already been replaced.");
              const base = retry.before ? await payloads.read(retry.before, world) : emptyMemoryPayload();
              memoryRequire(base, "Scene Retry starting history is missing");
              let accepted: ReturnType<typeof acceptNarration> | undefined;
              let notices: ReturnType<typeof narrationSceneNotices> = [];
              await ports.repository.mutateAuthority(
                async (state) => {
                  verifyScope(state, scene, original);
                  await checkDependencies(state, retry.episodeId);
                  const authority = sceneRetryAuthority(state),
                    old = state.continuity;
                  state.continuity = { ...base.continuity, revision: old.revision + 1 };
                  state.episodes = base.episodes;
                  try {
                    accepted = acceptNarration(state, publication, turn.id, turn.progressProcessedAt!);
                  } catch {
                    unavailable("The alternate reply failed validation. Your reply is kept.");
                  }
                  const episode = accepted.episode;
                  if (!episode || accepted.held || !retryableEpisode(state, episode, authority))
                    unavailable(
                      "The alternate reply needs effects that Retry cannot safely apply. Your reply is kept.",
                    );
                  const current = new Map(old.records.map((row) => [row.id, row]));
                  state.continuity = {
                    ...state.continuity,
                    records: state.continuity.records.map((row) => {
                      const prior = current.get(row.id);
                      if (!prior || memoryHash(prior) === memoryHash(row)) return row;
                      return {
                        ...row,
                        revision: Math.max(row.revision, prior.revision) + 1,
                        heads: Object.fromEntries(
                          Object.entries(row.heads).map(([key, head]) => {
                            const previous = prior.heads[key];
                            return [
                              key,
                              previous && memoryHash(previous) !== memoryHash(head)
                                ? { ...head, revision: Math.max(previous.revision, head.revision) + 1 }
                                : head,
                            ];
                          }),
                        ),
                      };
                    }),
                  };
                  notices = narrationSceneNotices(state, episode);
                },
                {
                  memories: true,
                  captureSceneRetry: () => ({
                    sceneId: scene.id,
                    submissionId: turn.id,
                    episodeId: accepted!.episode!.id,
                    sceneRevision: scene.sceneRevision + 1,
                    originalOperationId: retry.originalOperationId,
                    request: retry.request,
                    replaces: retry.episodeId,
                  }),
                },
              );
              const episode = accepted!.episode!;
              await ports.changeSession(scene.id, (saved) => {
                ports.assertVenueOwnership({ operation: saved.operation });
                const entry = mutableSceneSubmission(saved, turn.id)!;
                saved.lines.splice(-turn.replyLineIds!.length, turn.replyLineIds!.length, ...episode.segments);
                entry.episodeId = episode.id;
                entry.replyLineIds = episode.segments.map((line) => line.id);
                entry.recordEvents = notices;
                entry.acceptance = { status: "applied", rejected: accepted!.rejected };
                entry.responseDiagnostics = publication.responseDiagnostics;
                entry.requestMetrics = ports.venueRequestMetrics();
                entry.timing = operation.timing;
                entry.changeSequence = saved.changeSequence = (saved.changeSequence ?? 0) + 1;
                saved.operation = operation;
              });
            },
            ports.venueOperationSignal(),
          );
        },
      },
    );
  }

  async function cancel(sessionId: string, id: string, token?: string) {
    const operationId = token ? operationIdFor(sessionId, id, token) : id;
    const scene = await ports.readSession(sessionId);
    if (scene.operation?.kind !== "retry" || scene.operation.id !== operationId)
      unavailable("That Retry is no longer pending.");
    await ports.cancelVenueOperation(sessionId, scene.operation);
    return { saved: true };
  }
  return { retryReply, target, cancel };
}
