import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import { createHash, randomUUID } from "node:crypto";
import type {
  RepairChange,
  RepairCheckpoint,
  RepairHistoryEntry,
  RepairIndex,
  RepairRecord,
  RepairRequest,
  RepairReview,
} from "../../../shared/contracts/repair.js";
import {
  repairDigest,
  repairDocumentDigest,
  type RepairDocument,
  type RepairGate,
  type RepairTransaction,
  type RepairWrite,
} from "../../adapters/storage/repair-gate.js";
import { villageNow } from "../../adapters/time/clock-gate.js";
import { unfinishedExchange } from "../../domain/decoding/exchange-codec.js";
import { coerceVillageState } from "../../domain/decoding/village-codec.js";
import type { MemoryKnower } from "../../domain/models/memories.js";
import type { ExchangeEffectReceipt } from "../../domain/models/wish-check-model.js";
import type { VillageRepository } from "../../domain/models/world-repository.js";
import type { VillageState } from "../../domain/models/world.js";
import { badRequest, conflict, notFound } from "../../domain/rules/errors.js";
import { coerceRelationshipState, relationshipKey } from "../../domain/rules/relationship-rules.js";
import {
  applyWorldRepair,
  changeMemoryProtection,
  repairId,
  repairParts,
  worldRepairRecords,
} from "../../domain/rules/repair-records.js";
import { pendingProgressTurns } from "../../domain/rules/scene-record.js";
import { normalizeVillageMutation } from "../../domain/rules/world-mutation.js";

const PKG = "villages",
  PLAN = "repair-plan",
  HISTORY = "repair-history",
  CHECKPOINT = "repair-checkpoint";
const GAME_KINDS = [
  "venue-visit",
  "venue-active",
  "relationships",
  "repair-annotation",
  "scene-terminal",
  "project-scene-evidence",
];
type Doc = NonNullable<Awaited<ReturnType<CapabilityDocumentStore["getById"]>>>;
const copy = (row: Doc): RepairDocument => ({
  id: row.id,
  kind: row.kind,
  name: row.name,
  description: row.description,
  data: structuredClone(row.data),
});
type CheckpointData = {
  version: 1;
  seed: string;
  setupAt: string;
  id: string;
  title: string;
  at: string;
  documents: RepairDocument[];
};
type HistoryData = RepairHistoryEntry & {
  seed: string;
  setupAt: string;
  request: RepairRequest;
  record?: RepairRecord;
  inverse?: RepairRequest;
  guard: string;
  memoryBefore?: { id: string; knowers: Record<string, MemoryKnower> };
  memoryGuard?: string;
  undoWrites?: RepairWrite[];
  undoOf?: string;
};
type PlanData = {
  seed: string;
  setupAt: string;
  request: RepairRequest;
  requestHash: string;
  review: RepairReview;
  transaction: RepairTransaction;
  history: HistoryData;
};
function restoredReceipts(
  saved: Record<string, ExchangeEffectReceipt>,
  current: Record<string, ExchangeEffectReceipt>,
) {
  const result: Record<string, ExchangeEffectReceipt> = {};
  for (const [id, row] of Object.entries(current))
    if (!saved[id])
      result[id] = {
        id: row.id,
        sceneId: row.sceneId,
        submissionId: row.submissionId,
        domain: row.domain,
        at: row.at,
        committedAt: row.committedAt ?? row.at,
        status: "rejected",
        evidenceIds: [],
        reason: "Superseded by checkpoint restoration",
        ...(row.wishOutcome ? { wishOutcome: "corrected" as const } : {}),
      };
  return { ...result, ...saved };
}
function advanceRestoredRevisions(prior: VillageState, current: VillageState) {
  for (const map of prior.maps)
    map.revision = Math.max(map.revision, current.maps.find((m) => m.id === map.id)?.revision ?? 0) + 1;
  for (const project of prior.projects)
    project.lifecycle.revision =
      Math.max(project.lifecycle.revision, current.projects.find((p) => p.id === project.id)?.lifecycle.revision ?? 0) +
      1;
  for (const person of prior.villagers) {
    const live = current.villagers.find((p) => p.characterId === person.characterId);
    person.cardSnapshot.revision = Math.max(person.cardSnapshot.revision, live?.cardSnapshot.revision ?? 0) + 1;
    for (const wish of person.wishes)
      wish.revision = Math.max(wish.revision, live?.wishes.find((w) => w.id === wish.id)?.revision ?? 0) + 1;
  }
  for (const venue of prior.venues) {
    const currentVenue = current.venues.find((v) => v.id === venue.id);
    for (const zone of venue.zones ?? []) {
      const savedRevision = zone.state.revision;
      zone.state.revision =
        Math.max(savedRevision, currentVenue?.zones?.find((z) => z.id === zone.id)?.state.revision ?? 0) + 1;
    }
    if (venue.access)
      venue.access.revision =
        Math.max(venue.access.revision, current.venues.find((v) => v.id === venue.id)?.access?.revision ?? 0) + 1;
  }
}
function assertSettledSocial(state: VillageState) {
  if (state.socialMailOutbox?.length || state.socialOutbox?.some((row) => !row.processed))
    throw conflict("Resolve pending correspondence and social recovery before restoring a checkpoint.");
}
function recordChanges(before: RepairRecord[], after: RepairRecord[], selectedId: string) {
  const changes: RepairChange[] = [],
    affected: string[] = [],
    prior = new Map(before.map((r) => [r.id, r]));
  for (const row of after) {
    const rowStart = changes.length;
    const old = prior.get(row.id);
    prior.delete(row.id);
    if (old?.token === row.token) continue;
    affected.push(row.title);
    for (const field of row.fields) {
      // Per-person wording below is the authoritative memory comparison.
      if (row.topic === "memories" && field.key === "text" && row.people?.some((p) => p.text !== undefined)) continue;
      const previous = old?.fields.find((f) => f.key === field.key);
      if (String(previous?.value ?? "") !== String(field.value))
        changes.push({
          label: row.id === selectedId ? field.label : `${row.title} · ${field.label}`,
          before: String(previous?.value ?? ""),
          after: String(field.value),
        });
    }
    for (const person of row.people ?? []) {
      const previous = old?.people?.find((p) => p.id === person.id);
      if (person.text !== undefined && (previous?.text !== person.text || previous.forgotten !== person.forgotten))
        changes.push({
          label: `${person.name} · memory`,
          before: previous?.forgotten ? "Forgotten" : (previous?.text ?? ""),
          after: person.forgotten ? "Forgotten" : person.text,
        });
    }
    const alreadyShown = (before: string, after: string) =>
      changes.slice(rowStart).some((change) => change.before === before && change.after === after);
    if (old && old.summary !== row.summary && !alreadyShown(old.summary, row.summary))
      changes.push({ label: `${row.title} · status`, before: old.summary, after: row.summary });
    if (
      old &&
      old.source.join("\n") !== row.source.join("\n") &&
      !alreadyShown(old.source.join("\n"), row.source.join("\n"))
    )
      changes.push({ label: `${row.title} · context`, before: old.source.join("\n"), after: row.source.join("\n") });
  }
  for (const removed of prior.values()) {
    affected.push(removed.title);
    if (removed.topic === "memories" && removed.people?.some((person) => person.text !== undefined)) {
      for (const person of removed.people)
        if (person.text !== undefined && !person.forgotten)
          changes.push({ label: `${person.name} · memory`, before: person.text, after: "Forgotten" });
    } else changes.push({ label: removed.title, before: removed.summary, after: "Removed from current records" });
  }
  return { changes, affected };
}
export type RepairPorts = {
  gate: RepairGate;
  repository: VillageRepository;
  resumeProject(id: string, value: unknown, now?: Date): Promise<void>;
  cancelProject(id: string, value: unknown, now?: Date): Promise<void>;
  replaySaved(sceneId: string): Promise<unknown>;
  continueSaved(
    sceneId: string,
    submissionId: string,
    domain: "memories" | "relationships" | "wishes" | "projects",
  ): Promise<unknown>;
};
export function createRepairService(ports: RepairPorts) {
  const { gate, repository } = ports,
    documents = gate.documents;
  const read = () => repository.readAuthority({ memories: true });
  const store = async (id: string, kind: string, data: unknown) => {
    const stamp = new Date().toISOString();
    await documents.create({
      id,
      packageId: PKG,
      kind,
      name: "REPAIR",
      description: "Private world recovery",
      data,
      createdAt: stamp,
      updatedAt: stamp,
    });
  };
  const docId = (kind: string, id: string) => `villages-${kind}-${createHash("sha256").update(id).digest("hex")}`;
  const validateId = (id: string) => {
    if (typeof id !== "string" || !/^[a-zA-Z0-9-]{1,100}$/.test(id))
      throw badRequest("Choose a saved repair or checkpoint.");
  };
  async function allRecords(includeMemories = true, includeArchives = true, personId?: string) {
    const state = await repository.readAuthority({ memories: includeMemories }),
      result = worldRepairRecords(state, includeMemories, personId);
    if (personId && personId !== "player" && !state.villagers.some((p) => p.characterId === personId))
      throw notFound("Choose a villager from People.");
    const relationshipId = `villages-relationships-${createHash("sha256").update(state.seed).digest("hex").slice(0, 24)}`;
    const saved = await documents.getById(PKG, relationshipId),
      social = coerceRelationshipState(state.seed, saved?.data);
    for (const edge of Object.values(social.edges)) {
      const name = (id: string) =>
        id === "player"
          ? "Your Persona"
          : (state.villagers.find((v) => v.characterId === id)?.cardSnapshot.name ?? "Former resident");
      result.push({
        id: repairId("relationship", edge.fromId, edge.toId),
        topic: "people",
        title: `${name(edge.fromId)} → ${name(edge.toId)}`,
        summary: "Directional relationship",
        fields: [
          { key: "connection", label: "Connection", type: "text", value: edge.connection },
          { key: "stance", label: "Current stance", type: "text", value: edge.stance },
          {
            key: "expectations",
            label: "Expectations (one per line)",
            type: "text",
            value: edge.expectations.join("\n"),
          },
          { key: "concerns", label: "Concerns (one per line)", type: "text", value: edge.concerns.join("\n") },
        ],
        source: ["Current relationship record. Permissions and disclosures remain separate."],
        actions: [{ id: "correct", label: "Modify" }],
        related: [],
      });
    }
    if (includeArchives) {
      const sceneIds = new Set<string>();
      for (const row of await documents.list(PKG, "venue-visit")) {
        const scene = row.data as import("../../domain/models/scene-model.js").VenueScene;
        sceneIds.add(scene.id);
        const unfinished =
          scene.submissions?.filter((turn) => turn.processing && unfinishedExchange(turn.processing)) ?? [];
        if (unfinished.length) {
          result.push({
            id: repairId("saved-scene", scene.id),
            topic: "progress",
            title: `${scene.placeName} · saved work`,
            summary: `${unfinished.length} exchanges need saved changes`,
            fields: [],
            source: ["Applies retained output without requesting replacement generation."],
            actions: [{ id: "replay", label: "Replay saved work" }],
            related: [],
            revision: scene.sceneRevision,
          });
          for (const turn of unfinished)
            for (const domain of ["memories", "relationships", "wishes", "projects"] as const)
              if (turn.processing?.domains[domain]?.status === "failed")
                result.push({
                  id: repairId("saved-domain", scene.id, turn.id, domain),
                  topic: "progress",
                  title: `${scene.placeName} · failed ${domain} update`,
                  summary: "Unresolved saved effect",
                  fields: [],
                  source: [
                    "Continue keeps accepted writing and explicitly discards this failed update. Immediate-authority work must be recovered first.",
                  ],
                  actions: [{ id: "continue", label: "Continue without this update" }],
                  related: [],
                  revision: scene.sceneRevision,
                });
        }
        if (scene.status !== "closed") continue;
        const annotation = await documents.getById(PKG, docId("repair-annotation", scene.id));
        result.push({
          id: repairId("scene", scene.id),
          topic: "world",
          title: `${scene.placeName} · ${new Date(scene.startedAt).toLocaleDateString("en-US")}`,
          summary: "Scene correction",
          fields: [
            {
              key: "text",
              label: "Historical correction",
              type: "text",
              value: (annotation?.data as { text?: string })?.text ?? "",
            },
          ],
          source: scene.lines.slice(-6).map((l) => l.content),
          actions: [{ id: "correct", label: "Modify" }],
          related: [],
        });
      }
      for (const row of await documents.list(PKG, "repair-annotation")) {
        const annotation = row.data as {
          seed?: string;
          sceneId?: string;
          text?: string;
          placeName?: string;
          startedAt?: string;
        };
        if (
          annotation.seed !== state.seed ||
          !annotation.sceneId ||
          sceneIds.has(annotation.sceneId) ||
          typeof annotation.text !== "string"
        )
          continue;
        result.push({
          id: repairId("scene", annotation.sceneId),
          topic: "world",
          title: `${annotation.placeName || "Scene"} · ${annotation.startedAt ? new Date(annotation.startedAt).toLocaleDateString("en-US") : "date unavailable"}`,
          summary: "Scene correction",
          fields: [{ key: "text", label: "Historical correction", type: "text", value: annotation.text }],
          source: [],
          actions: [{ id: "correct", label: "Modify" }],
          related: [],
        });
      }
    }
    return {
      state,
      records: result.map((record) => ({
        ...record,
        token: repairDigest([state.seed, state.setupAt, personId ?? "", record]),
      })),
    };
  }
  async function sceneOpen() {
    const pointer = await documents.getById(PKG, "villages-active-venue");
    return !!(pointer?.data as { sessionId?: string })?.sessionId;
  }
  async function index(historyOffset = 0): Promise<RepairIndex> {
    const state = await repository.readAuthority();
    const histories = (await documents.list(PKG, HISTORY))
      .map((r) => r.data as HistoryData)
      .filter((r) => r.seed === state.seed && r.setupAt === state.setupAt)
      .sort((a, b) => b.at.localeCompare(a.at));
    const checkpoints = (await documents.list(PKG, CHECKPOINT))
      .map((r) => r.data as CheckpointData)
      .filter((r) => r.seed === state.seed && r.setupAt === state.setupAt)
      .sort((a, b) => b.at.localeCompare(a.at));
    return {
      seed: state.seed,
      identity: repairDigest([state.seed, state.setupAt]),
      people: [
        { id: "player", name: "Your Persona" },
        ...state.villagers.map((p) => ({ id: p.characterId, name: p.cardSnapshot.name })),
      ],
      records: [],
      historyOffset,
      historyTotal: histories.length,
      sceneOpen: await sceneOpen(),
      history: histories
        .slice(historyOffset, historyOffset + 50)
        .map(({ id, title, at, changes, affected, undone, canUndo }) => ({
          id,
          title,
          at,
          changes,
          affected,
          undone,
          canUndo,
        })),
      checkpoints: checkpoints.map(({ id, title, at, documents: rows }) => ({ id, title, at, records: rows.length })),
    };
  }
  async function list(topic: string, query = "", offset = 0, personId?: string, section = "memories") {
    if (topic === "people" && !personId) return { records: [], total: 0, next: null };
    const memoryList = topic === "memories" || (topic === "people" && section !== "details");
    const { state, records } = await allRecords(memoryList, topic === "world" || topic === "progress", personId),
      words = query.toLocaleLowerCase().split(/\s+/u).filter(Boolean);
    const personName =
      personId === "player"
        ? "Your Persona"
        : state.villagers.find((p) => p.characterId === personId)?.cardSnapshot.name;
    const creation = memoryList
      ? records.find((r) => r.creating && (!personId || r.people?.some((p) => p.id === personId)))
      : undefined;
    const selected = records.filter(
      (r) =>
        !r.creating &&
        (topic === "people"
          ? memoryList
            ? r.topic === "memories"
            : r.topic === "people" && repairParts(r.id).slice(1).includes(personId!)
          : r.topic === topic) &&
        words.every((w) =>
          `${r.title} ${r.summary} ${r.source.join(" ")} ${r.people?.map((p) => p.name).join(" ") ?? ""}`
            .toLocaleLowerCase()
            .includes(w),
        ),
    );
    return {
      records: selected.slice(offset, offset + 50).map((r) =>
        personName && memoryList
          ? {
              ...r,
              summary: `${r.people?.some((p) => p.id === personId) ? "Remembered by" : "About"} ${personName} · ${r.summary}`,
            }
          : r,
      ),
      total: selected.length,
      next: offset + 50 < selected.length ? offset + 50 : null,
      ...(creation ? { creation } : {}),
    };
  }
  async function inspect(id: string, personId?: string) {
    const kind = repairParts(id)[0];
    const { records } = await allRecords(
        ["memory", "new-memory"].includes(kind),
        ["scene", "saved-scene", "saved-domain"].includes(kind),
        personId,
      ),
      record = records.find((r) => r.id === id);
    if (!record) throw notFound("That record is unavailable.");
    return record;
  }
  async function checkpoint(title: string, id: string = randomUUID()): Promise<RepairCheckpoint> {
    const state = await repository.readAuthority();
    const rows: RepairDocument[] = [];
    const root = await documents.getById(PKG, "villages-village");
    if (!root) throw badRequest("Found a Village first.");
    rows.push(copy(root));
    const head = (root.data as { memoryHead?: { id: string } }).memoryHead;
    if (head) {
      const payload = await documents.getById(PKG, head.id);
      if (!payload) throw conflict("The saved Memories payload is unavailable.");
      rows.push(copy(payload));
    }
    for (const kind of GAME_KINDS) for (const row of await documents.list(PKG, kind)) rows.push(copy(row));
    const data: CheckpointData = {
      version: 1,
      seed: state.seed,
      setupAt: state.setupAt,
      id,
      title,
      at: new Date().toISOString(),
      documents: rows,
    };
    await store(docId(CHECKPOINT, id), CHECKPOINT, data);
    return { id, title, at: data.at, records: rows.length };
  }
  async function applyRecord(record: RepairRecord, request: RepairRequest) {
    const [kind, id, sub] = repairParts(record.id),
      now = villageNow((await repository.readAuthority()).clock?.advanceMs),
      at = now.toISOString();
    if (kind === "relationship") {
      const state = await repository.readAuthority(),
        documentId = `villages-relationships-${createHash("sha256").update(state.seed).digest("hex").slice(0, 24)}`;
      const row = await documents.getById(PKG, documentId);
      if (!row) throw conflict("That relationship is unavailable.");
      const social = coerceRelationshipState(state.seed, row.data),
        edge = social.edges[relationshipKey(id, sub)];
      if (!edge) throw conflict("That relationship changed.");
      for (const key of ["connection", "stance", "expectations", "concerns"] as const) {
        const value = request.values[key];
        if (typeof value !== "string" || value.length > 2000) throw badRequest("Enter shorter relationship details.");
        if (key === "connection" || key === "stance") edge[key] = value;
        else
          edge[key] = value
            .split("\n")
            .map((v) => v.trim())
            .filter(Boolean);
      }
      edge.revision++;
      edge.updatedAt = at;
      if (
        !(await documents.update({
          id: row.id,
          packageId: PKG,
          expectedRevision: row.revision,
          name: row.name,
          description: row.description,
          data: social,
          updatedAt: at,
        }))
      )
        throw conflict("The relationship changed.");
    } else if (kind === "scene") {
      if (
        request.action !== "correct" ||
        typeof request.values.text !== "string" ||
        !request.values.text.trim() ||
        request.values.text.length > 2000
      )
        throw badRequest("Enter a short historical correction.");
      const key = docId("repair-annotation", id),
        old = await documents.getById(PKG, key),
        source = await documents.getById(PKG, `villages-venue-visit-${id}`),
        context = (source?.data ?? old?.data ?? {}) as { placeName?: string; startedAt?: string },
        data = {
          seed: (await repository.readAuthority()).seed,
          sceneId: id,
          text: request.values.text.trim(),
          at,
          placeName: context.placeName ?? "",
          startedAt: context.startedAt ?? "",
        };
      if (old)
        await documents.update({
          id: key,
          packageId: PKG,
          expectedRevision: old.revision,
          name: old.name,
          description: old.description,
          data,
          updatedAt: at,
        });
      else await store(key, "repair-annotation", data);
    } else if (kind === "saved-scene") await ports.replaySaved(id);
    else if (kind === "saved-domain")
      await ports.continueSaved(
        id,
        sub,
        repairParts(record.id)[3] as "memories" | "relationships" | "wishes" | "projects",
      );
    else if (kind === "project" && ["resume", "cancel"].includes(request.action)) {
      const project = (await repository.readAuthority()).projects.find((p) => p.id === id)!;
      await (request.action === "resume" ? ports.resumeProject : ports.cancelProject)(
        id,
        {
          requestId: request.operationId,
          expectedRevision: project.lifecycle.revision,
        },
        now,
      );
    } else
      await repository.mutateAuthority((state) => applyWorldRepair(state, record, request, at), {
        memories: ["memory", "new-memory"].includes(kind),
      });
  }
  function validateRequest(input: RepairRequest) {
    if (
      !input ||
      typeof input.operationId !== "string" ||
      !/^[a-zA-Z0-9-]{1,100}$/.test(input.operationId) ||
      typeof input.recordId !== "string" ||
      typeof input.expectedRecord !== "string" ||
      !input.expectedRecord ||
      !input.values ||
      Array.isArray(input.values) ||
      !Array.isArray(input.knowers) ||
      (input.personId !== undefined && typeof input.personId !== "string")
    )
      throw badRequest("Reopen the record before repairing it.");
  }
  async function guardRecord(record: RepairRecord, personId?: string) {
    const current = await inspect(record.id, personId);
    // Source/audience/actions are dependencies too, not only editable text.
    return repairDigest(current);
  }
  async function prepare(request: RepairRequest): Promise<RepairReview> {
    validateRequest(request);
    const hash = repairDigest(request),
      planId = docId(PLAN, request.operationId),
      prior = await documents.getById(PKG, planId);
    if (prior) {
      const saved = prior.data as PlanData;
      if (saved.requestHash !== hash) throw conflict("This repair ID already has another edit.");
      return saved.review;
    }
    const simulation = await gate.simulate(async () => {
      const includeMemories = ["memory", "new-memory", "wish", "saved-scene", "saved-domain"].includes(
        repairParts(request.recordId)[0],
      );
      const includeArchives = ["scene", "saved-scene", "saved-domain"].includes(repairParts(request.recordId)[0]);
      const { state, records } = await allRecords(includeMemories, includeArchives, request.personId),
        record = records.find((r) => r.id === request.recordId);
      if (!record) throw notFound("That record is unavailable.");
      if (!record.actions.some((action) => action.id === request.action))
        throw badRequest("Choose an available repair action.");
      if (record.token !== request.expectedRecord)
        throw conflict(
          "This record changed after you opened it. Reopen it to review the current value; your draft is kept.",
        );
      const [kind, id] = repairParts(record.id),
        consequential = ["zone", "access", "permission", "home", "project", "wish", "venue", "saved-domain"].includes(
          kind,
        );
      let before: HistoryData["memoryBefore"], addedText: string | undefined;
      if (kind === "memory") {
        const target = state.memories.records.find((r) => r.id === id)!,
          root = state.memories.records.find((r) => r.id === target.rootId)!;
        before = {
          id: root.id,
          knowers: Object.fromEntries(request.knowers.map((k) => [k, structuredClone(root.knowers[k])])),
        };
      }
      if (consequential) await checkpoint(`Before ${record.title}`, request.operationId);
      await applyRecord(record, request);
      const after = await allRecords(includeMemories, includeArchives, request.personId);
      if (kind === "new-memory") {
        const added = after.state.memories.records.find((r) => r.id === "player-repair:" + request.operationId)!;
        addedText = added.text;
        before = {
          id: added.id,
          knowers: Object.fromEntries(
            request.knowers.map((k) => [
              k,
              {
                ...structuredClone(added.knowers[k]),
                forgotten: { at: new Date().toISOString(), operationId: "undo:" + request.operationId },
              },
            ]),
          ),
        };
      }
      const memoryGuard = before
        ? repairDigest(after.state.memories.records.find((r) => r.id === before.id))
        : undefined;
      return {
        record,
        addedText,
        before,
        memoryGuard,
        seed: state.seed,
        setupAt: state.setupAt,
        consequential,
        beforeRecords: records,
        afterRecords: after.records,
        after: after.records.find((r) => r.id === record.id) ?? null,
      };
    });
    const { record, before, seed, consequential } = simulation.value,
      [kind] = repairParts(record.id);
    const diff = recordChanges(simulation.value.beforeRecords, simulation.value.afterRecords, record.id),
      changedFields =
        kind === "new-memory" ? [{ label: "Memory", before: "", after: simulation.value.addedText! }] : diff.changes,
      affectedRecords = diff.affected;
    if (request.action !== "correct" && kind !== "memory")
      changedFields.push({
        label: "Action",
        before: record.summary,
        after: record.actions.find((a) => a.id === request.action)?.label ?? request.action,
      });
    if (!changedFields.length) throw badRequest("Change a value before reviewing.");
    const memory = ["memory", "new-memory"].includes(kind)
      ? {
          creating: kind === "new-memory",
          people: request.knowers.map((k) => record.people!.find((p) => p.id === k)!.name),
        }
      : undefined;
    const affected =
      kind === "new-memory"
        ? memory!.people.map((name) => `${name} · Memories`)
        : [...new Set([record.title, ...affectedRecords])];
    if (record.people && kind !== "new-memory")
      affected.push(...request.knowers.map((k) => record.people!.find((p) => p.id === k)?.name ?? k));
    if (kind === "memory")
      affected.push("Remembered knowledge only; physical state and completion records stay separate.");
    if (kind === "zone") affected.push("Future Scene physical context and artwork eligibility.");
    if (kind === "access") affected.push("Future entry and management checks.");
    if (kind === "scene") affected.push("Historical annotation; mechanical outcomes are retained.");
    if (kind === "saved-scene" || kind === "saved-domain")
      affected.push("Retained Scene effects change. A previously requested conclusion may finish after recovery.");
    if (await sceneOpen()) affected.push("The unfinished Scene keeps its captured context and draft.");
    const rootWrite = simulation.transaction.writes.find((w) => (w.after ?? w.before)?.kind === "village");
    const sameMemoryHead =
      !rootWrite ||
      repairDigest((rootWrite.before?.data as { memoryHead?: unknown })?.memoryHead) ===
        repairDigest((rootWrite.after?.data as { memoryHead?: unknown })?.memoryHead);
    const documentUndo = !["memory", "new-memory", "saved-scene", "saved-domain"].includes(kind) && sameMemoryHead;
    const review: RepairReview = {
      kind: "repair",
      id: request.operationId,
      title: record.title,
      changes: changedFields,
      affected,
      related: record.related,
      checkpoint: consequential,
      undoAvailable: !!before || documentUndo,
      ...(memory ? { memory } : {}),
    };
    const inverse = documentUndo
      ? { ...request, operationId: "", values: Object.fromEntries(record.fields.map((f) => [f.key, f.value])) }
      : undefined;
    const history: HistoryData = {
      id: request.operationId,
      title: record.title,
      at: new Date().toISOString(),
      changes: changedFields,
      affected,
      undone: false,
      canUndo: review.undoAvailable,
      seed,
      setupAt: simulation.value.setupAt,
      request,
      record,
      inverse,
      guard: simulation.value.after ? repairDigest(simulation.value.after) : "",
      ...(before ? { memoryBefore: before, memoryGuard: simulation.value.memoryGuard } : {}),
      ...(inverse && !before
        ? {
            undoWrites: simulation.transaction.writes.filter((w) =>
              ["village", ...GAME_KINDS].includes((w.before ?? w.after)!.kind),
            ),
          }
        : {}),
    };
    await store(planId, PLAN, {
      seed,
      setupAt: simulation.value.setupAt,
      request,
      requestHash: hash,
      review,
      transaction: simulation.transaction,
      history,
    } satisfies PlanData);
    return review;
  }
  async function apply(id: string) {
    validateId(id);
    const historyId = docId(HISTORY, id);
    if (await documents.getById(PKG, historyId)) return { applied: true };
    const row = await documents.getById(PKG, docId(PLAN, id));
    if (!row) throw notFound("Review this repair first.");
    const plan = row.data as PlanData;
    const world = await repository.readAuthority();
    if (world.seed !== plan.seed || world.setupAt !== plan.setupAt) throw conflict("The Village changed.");
    await gate.commit(id, plan.transaction, [
      {
        before: null,
        after: {
          id: historyId,
          kind: HISTORY,
          name: "Repair history",
          description: "Private repair record",
          data: plan.history,
        },
      },
    ]);
    return { applied: true };
  }
  async function undo(id: string, operationId: string): Promise<RepairReview> {
    validateId(id);
    validateId(operationId);
    const row = await documents.getById(PKG, docId(HISTORY, id));
    if (!row) throw notFound("That repair is unavailable.");
    const saved = row.data as HistoryData;
    if (saved.undone || !saved.canUndo)
      throw conflict("This repair cannot be undone. Use its checkpoint when available.");
    const state = await read();
    if (state.seed !== saved.seed || state.setupAt !== saved.setupAt) throw conflict("The Village changed.");
    const record =
      saved.memoryBefore || saved.undoWrites
        ? saved.record!
        : await inspect(saved.request.recordId, saved.request.personId);
    if (!saved.memoryBefore && !saved.undoWrites && (await guardRecord(record, saved.request.personId)) !== saved.guard)
      throw conflict("The record changed after this repair. Review a new correction instead.");
    const request = { ...(saved.inverse ?? saved.request), operationId };
    const result = await gate.simulate(async () => {
      const before = await allRecords(
        !!saved.memoryBefore,
        repairParts(record.id)[0] === "scene",
        saved.request.personId,
      );
      if (before.state.seed !== saved.seed || before.state.setupAt !== saved.setupAt)
        throw conflict("The Village changed.");
      const fresh = await documents.getById(PKG, row.id);
      if (!fresh || (fresh.data as HistoryData).undone) throw conflict("This repair was already undone.");
      if (saved.memoryBefore) {
        if (
          repairDigest(before.state.memories.records.find((r) => r.id === saved.memoryBefore!.id)) !== saved.memoryGuard
        )
          throw conflict("This memory changed after the repair. Review a new correction instead.");
      } else if (!saved.undoWrites && (await guardRecord(record, saved.request.personId)) !== saved.guard)
        throw conflict("The record changed after this repair. Review a new correction instead.");
      if (saved.memoryBefore)
        await repository.mutateAuthority(
          (current) =>
            changeMemoryProtection(current, saved.memoryBefore!.id, saved.memoryBefore!.knowers, operationId),
          { memories: true },
        );
      else if (saved.undoWrites) {
        for (const write of saved.undoWrites) {
          const target = write.after ?? write.before!;
          const current = await documents.getById(PKG, target.id);
          if (repairDocumentDigest(current ? copy(current) : null) !== repairDocumentDigest(write.after))
            throw conflict("A record affected by this repair changed later. Use a new correction instead.");
        }
        for (const write of saved.undoWrites) {
          const target = write.after ?? write.before!,
            current = await documents.getById(PKG, target.id);
          if (write.before?.kind === "village") {
            await repository.mutateAuthority(
              (currentState) => {
                const prior = coerceVillageState({
                  ...(write.before!.data as object),
                  memories: currentState.memories,
                  memoryScenes: currentState.memoryScenes,
                  memoryReceipts: currentState.memoryReceipts,
                });
                prior.clock = currentState.clock;
                advanceRestoredRevisions(prior, currentState);
                normalizeVillageMutation(currentState, currentState.seed, () => {
                  Object.assign(currentState, prior);
                });
              },
              { memories: true },
            );
          } else if (!write.before) {
            if (current) await documents.remove(PKG, current.id, current.revision);
          } else {
            const value = structuredClone(write.before),
              stamp = new Date().toISOString();
            if (value.kind === "relationships") {
              const previous = value.data as { edges: Record<string, { revision: number; updatedAt: string }> },
                live = current?.data as typeof previous | undefined;
              for (const [key, edge] of Object.entries(previous.edges)) {
                edge.revision = Math.max(edge.revision, live?.edges[key]?.revision ?? 0) + 1;
                edge.updatedAt = stamp;
              }
            }
            if (current)
              await documents.update({
                ...value,
                packageId: PKG,
                expectedRevision: current.revision,
                updatedAt: stamp,
              });
            else await documents.create({ ...value, packageId: PKG, createdAt: stamp, updatedAt: stamp });
          }
        }
      } else await applyRecord(record, request);
      const current = await documents.getById(PKG, row.id);
      if (!current) throw conflict("Repair history changed.");
      await documents.update({
        id: row.id,
        packageId: PKG,
        expectedRevision: current.revision,
        name: row.name,
        description: row.description,
        data: { ...saved, undone: true, canUndo: false },
        updatedAt: new Date().toISOString(),
      });
      const after = await allRecords(
        !!saved.memoryBefore,
        repairParts(record.id)[0] === "scene",
        saved.request.personId,
      );
      return recordChanges(before.records, after.records, record.id);
    });
    const review: RepairReview = {
      kind: "undo",
      id: operationId,
      title: `Undo ${saved.title}`,
      changes: result.value.changes,
      affected: result.value.affected,
      ...(saved.memoryBefore
        ? {
            memory: {
              creating: false,
              people: saved.request.knowers.map(
                (k) => saved.record?.people?.find((p) => p.id === k)?.name ?? "Former resident",
              ),
            },
          }
        : {}),
      related: [],
      checkpoint: false,
      undoAvailable: false,
    };
    await store(docId(PLAN, operationId), PLAN, {
      seed: state.seed,
      setupAt: state.setupAt,
      request,
      requestHash: repairDigest(request),
      review,
      transaction: result.transaction,
      history: {
        ...saved,
        id: operationId,
        title: review.title,
        at: new Date().toISOString(),
        changes: review.changes,
        undone: false,
        canUndo: false,
        undoOf: id,
      },
    } satisfies PlanData);
    return review;
  }
  async function createCheckpoint(title: string, id: string = randomUUID()) {
    validateId(id);
    if (typeof title !== "string") throw badRequest("Enter a checkpoint name.");
    const prior = await documents.getById(PKG, docId(CHECKPOINT, id));
    if (prior) {
      const saved = prior.data as CheckpointData,
        state = await repository.readAuthority();
      if (
        saved.seed !== state.seed ||
        saved.setupAt !== state.setupAt ||
        saved.title !== (title.trim().slice(0, 120) || "Manual checkpoint")
      )
        throw conflict("This checkpoint ID already has another save.");
      return { id, title: saved.title, at: saved.at, records: saved.documents.length };
    }
    const result = await gate.simulate(() => checkpoint(title.trim().slice(0, 120) || "Manual checkpoint", id));
    await gate.commit(id, result.transaction);
    return result.value;
  }
  async function restore(id: string, operationId: string): Promise<RepairReview> {
    validateId(id);
    validateId(operationId);
    if (await sceneOpen())
      throw conflict("Conclude the unfinished Scene before restoring a whole-world checkpoint. Its draft is kept.");
    const saved = await documents.getById(PKG, docId(CHECKPOINT, id));
    if (!saved) throw notFound("That checkpoint is unavailable.");
    const checkpointData = saved.data as CheckpointData,
      state = await read();
    if (state.returnCatchup?.batch && !["completed", "cancelled"].includes(state.returnCatchup.batch.status))
      throw conflict("Finish or safely close Village catch-up before restoring a checkpoint.");
    if (checkpointData.seed !== state.seed || checkpointData.setupAt !== state.setupAt)
      throw conflict("This checkpoint belongs to another Village.");
    const simulation = await gate.simulate(async () => {
      const state = await read();
      if (state.returnCatchup?.batch && !["completed", "cancelled"].includes(state.returnCatchup.batch.status))
        throw conflict("Finish or safely close Village catch-up before restoring a checkpoint.");
      if (state.seed !== checkpointData.seed || state.setupAt !== checkpointData.setupAt)
        throw conflict("This checkpoint belongs to another Village.");
      if (await sceneOpen())
        throw conflict("Conclude the unfinished Scene before restoring a checkpoint. Its draft is kept.");
      assertSettledSocial(state);
      for (const row of await documents.list(PKG, "background-work")) {
        const job = row.data as {
          status?: string;
          steps?: { status: string }[];
          optionalAttempts?: Record<string, { status: string }>;
        };
        if (
          !["completed", "failed", "obsolete"].includes(job.status ?? "") ||
          job.steps?.some((step) => step.status === "running") ||
          Object.values(job.optionalAttempts ?? {}).some((attempt) =>
            ["dispatching", "unknown"].includes(attempt.status),
          )
        )
          throw conflict("Resolve pending background work before restoring this checkpoint.");
      }
      const checkpointPointer = checkpointData.documents.find((r) => r.kind === "venue-active");
      const checkpointSceneId = (checkpointPointer?.data as { sessionId?: string })?.sessionId;
      const current: Doc[] = [];
      for (const kind of GAME_KINDS) current.push(...(await documents.list(PKG, kind)));
      for (const savedScene of [...current, ...checkpointData.documents].filter((r) => r.kind === "venue-visit")) {
        const scene = savedScene.data as import("../../domain/models/scene-model.js").VenueScene;
        const belongsToCheckpoint = checkpointData.documents.includes(savedScene);
        if (
          (scene.status !== "closed" &&
            !(belongsToCheckpoint && scene.id === checkpointSceneId && scene.status === "active")) ||
          (scene.operation && scene.operation.status !== "complete") ||
          scene.submissions?.some((turn) => turn.processing && unfinishedExchange(turn.processing)) ||
          (scene.submissions && pendingProgressTurns(scene, state.foundedAt).length > 0) ||
          (scene.spinoff && scene.spinoff.status !== "resolved")
        )
          throw conflict(
            "A saved Scene has unresolved work. Recover or explicitly resolve it before restoring this checkpoint.",
          );
      }
      await checkpoint("Before checkpoint restoration", operationId);
      const currentRoot = await documents.getById(PKG, "villages-village");
      const preserved = currentRoot!.data as Record<string, unknown>;
      const wanted = new Map(checkpointData.documents.map((row) => [row.id, structuredClone(row)]));
      // A restored source gets a new storage revision. Rebuild its compact evidence on
      // retirement instead of comparing that new revision with a pre-restore receipt.
      const restoredScenes = new Set(
        [...wanted.values()].filter((row) => row.kind === "venue-visit").map((row) => (row.data as { id: string }).id),
      );
      for (const [key, row] of wanted) {
        if (row.kind === "scene-terminal" && restoredScenes.has((row.data as { sceneId: string }).sceneId))
          wanted.delete(key);
        if (row.kind === "project-scene-evidence") {
          const index = row.data as { scenes?: { scene: { id: string } }[] };
          if (Array.isArray(index.scenes))
            index.scenes = index.scenes.filter((entry) => !restoredScenes.has(entry.scene.id));
        }
      }
      const root = wanted.get("villages-village")!;
      const data = root.data as Record<string, unknown>;
      for (const key of [
        "clock",
        "eventAttempts",
        "returnCatchup",
        "planningUsage",
        "lastPlanningDate",
        "processedActionIds",
        "backgroundReceipts",
        "semanticRequestReceipts",
        "semanticContinuations",
        "backgroundPace",
        "selectedLorebookIds",
        "loreTokenBudget",
      ])
        if (key in preserved) data[key] = structuredClone(preserved[key]);
      if (!("returnCatchup" in preserved)) delete data.returnCatchup;
      // A restored world cannot use an absence capture from the world it replaced.
      if (data.returnCatchup && typeof data.returnCatchup === "object")
        delete (data.returnCatchup as { capture?: unknown }).capture;
      for (const row of current) if (!wanted.has(row.id)) await documents.remove(PKG, row.id, row.revision);
      const savedHead = data.memoryHead as { id: string } | null,
        savedPayload = savedHead ? wanted.get(savedHead.id) : undefined;
      const payload = savedPayload
        ? JSON.parse((savedPayload.data as { payload: string }).payload)
        : { memories: { format: 1, revision: 0, records: [] }, memoryScenes: {}, memoryReceipts: {} };
      if (
        Object.keys(payload.memoryScenes).some((id) => id !== checkpointSceneId) ||
        (checkpointSceneId && !payload.memoryScenes[checkpointSceneId])
      )
        throw conflict("The checkpoint’s Scene and frozen memories do not match.");
      const restored = coerceVillageState({ ...data, ...payload });
      assertSettledSocial(restored);
      advanceRestoredRevisions(restored, state);
      for (const venue of restored.venues) {
        const live = state.venues.find((v) => v.id === venue.id);
        if (venue.access && live?.access)
          for (const [id, receipt] of Object.entries(live.access.receipts))
            if (!venue.access.receipts[id])
              venue.access.receipts[id] = {
                fingerprint: receipt.fingerprint,
                revision: venue.access.revision,
                outcome: "rejected",
              };
      }
      restored.memories.revision = Math.max(restored.memories.revision, state.memories.revision) + 1;
      const currentMemories = new Map(state.memories.records.map((record) => [record.id, record]));
      for (const record of restored.memories.records)
        record.revision = Math.max(record.revision, currentMemories.get(record.id)?.revision ?? 0) + 1;
      restored.exchangeReceipts = restoredReceipts(restored.exchangeReceipts, state.exchangeReceipts);
      restored.memoryReceipts = restoredReceipts(restored.memoryReceipts, state.memoryReceipts);
      restored.noticeSequence = Math.max(restored.noticeSequence, state.noticeSequence);
      restored.dismissedNoticeIds = [...new Set([...restored.dismissedNoticeIds, ...state.dismissedNoticeIds])];
      // Publish a new immutable history payload; never rewind a head or reuse old revisions.
      await repository.mutateAuthority(
        (value) => {
          Object.assign(value, restored);
        },
        { memories: true },
      );
      for (const value of wanted.values()) {
        if (value.id === "villages-village" || value.kind === "memory-payload") continue;
        const old = await documents.getById(PKG, value.id),
          stamp = new Date().toISOString();
        if (value.kind === "relationships") {
          const social = value.data as import("../../domain/models/relationship-types.js").RelationshipState,
            live = old?.data as typeof social | undefined;
          if (
            social.startingActorIds.length ||
            social.initializationConflicts.length ||
            restored.villagers.some((p) => !social.reviewedActorIds.includes(p.characterId))
          )
            throw conflict("Complete the checkpoint’s starting-relationship review before using it for restoration.");
          social.applied = { ...live?.applied, ...social.applied };
          social.noticeSequence = Math.max(social.noticeSequence, live?.noticeSequence ?? 0);
          for (const key of Object.keys(social.intentionRevisions))
            social.intentionRevisions[key] =
              Math.max(social.intentionRevisions[key], live?.intentionRevisions[key] ?? 0) + 1;
          for (const [key, record] of Object.entries(social.sharedRecords))
            record.revision = Math.max(record.revision, live?.sharedRecords[key]?.revision ?? 0) + 1;
          for (const [key, edge] of Object.entries(social.edges))
            edge.revision = Math.max(edge.revision, live?.edges[key]?.revision ?? 0) + 1;
        }
        if (value.kind === "venue-visit") {
          const scene = value.data as {
              id: string;
              sceneRevision: number;
              generationReceipts?: import("../../domain/models/scene-model.js").VenueScene["generationReceipts"];
            },
            live = old?.data as typeof scene | undefined;
          scene.sceneRevision = Math.max(scene.sceneRevision, live?.sceneRevision ?? 0) + 1;
          const terminal = current.find(
            (row) => row.kind === "scene-terminal" && (row.data as { sceneId?: string }).sceneId === scene.id,
          );
          const receipts =
            (terminal?.data as { generationReceipts?: typeof scene.generationReceipts } | undefined)
              ?.generationReceipts ?? [];
          scene.generationReceipts ??= [];
          for (const receipt of receipts)
            if (!scene.generationReceipts.some((saved) => saved.attemptId === receipt.attemptId))
              scene.generationReceipts.push(structuredClone(receipt));
          const terminalData = terminal?.data as
            import("../../domain/models/scene-terminal-model.js").SceneTerminal | undefined;
          const uncertain = Object.entries(terminalData?.optionalAttempts ?? {})
            .filter(([, attempt]) => attempt.status === "unknown")
            .map(([fingerprint]) => fingerprint);
          if (uncertain.length && terminalData?.operation) {
            const attemptId = `optional:${terminalData.operation.attemptId}`;
            if (!scene.generationReceipts.some((saved) => saved.attemptId === attemptId))
              scene.generationReceipts.push({
                operationId: terminalData.operation.id,
                attemptId,
                stages: uncertain,
                outcome: "unknown",
                acknowledgedAt: terminalData.endedAt,
              });
          }
        }
        if (old) await documents.update({ ...value, packageId: PKG, expectedRevision: old.revision, updatedAt: stamp });
        else await documents.create({ ...value, packageId: PKG, createdAt: stamp, updatedAt: stamp });
      }
      return { before: state, after: restored };
    });
    const summarize = (world: VillageState) => [
      { label: "Village", value: world.name },
      { label: "Setting", value: world.setting },
      { label: "World facts", value: world.worldFacts.join("\n") },
      { label: "Starting history", value: world.scenarioImprint?.origin ?? world.foundingDetails },
      { label: "Residents", value: world.villagers.map((p) => p.cardSnapshot.name).join(", ") },
      { label: "Memories", value: String(world.memories.records.length) },
      { label: "Places", value: world.venues.map((v) => v.name).join(", ") },
      { label: "Projects", value: world.projects.map((p) => `${p.title} · ${p.status}`).join("\n") },
    ];
    const before = summarize(simulation.value.before),
      after = summarize(simulation.value.after);
    const review: RepairReview = {
      kind: "restore",
      id: operationId,
      title: `Restore ${checkpointData.title}`,
      changes: [
        { label: "Whole Village", before: "Current progress", after: `Checkpoint from ${checkpointData.at}` },
        ...before.map((field, i) => ({ label: field.label, before: field.value, after: after[i].value })),
      ],
      affected: [
        "Memories, people, places, relationships, progress and saved Scenes return to this checkpoint.",
        "Current time, spending records and purchased responses are retained.",
        "Elapsed Projects can finish when play resumes.",
        "A new checkpoint preserves the current Village.",
      ],
      related: [],
      checkpoint: true,
      undoAvailable: false,
    };
    const request: RepairRequest = {
      operationId,
      recordId: repairId("checkpoint", id),
      action: "restore",
      values: {},
      knowers: [],
      expectedRecord: repairDigest(checkpointData),
    };
    const history: HistoryData = {
      id: operationId,
      title: review.title,
      at: new Date().toISOString(),
      changes: review.changes,
      affected: review.affected,
      undone: false,
      canUndo: false,
      seed: state.seed,
      setupAt: state.setupAt,
      request,
      guard: "",
    };
    await store(docId(PLAN, operationId), PLAN, {
      seed: state.seed,
      setupAt: state.setupAt,
      request,
      requestHash: repairDigest(request),
      review,
      transaction: simulation.transaction,
      history,
    } satisfies PlanData);
    return review;
  }
  return { index, list, inspect, prepare, apply, undo, createCheckpoint, restore };
}
export type RepairService = ReturnType<typeof createRepairService>;
