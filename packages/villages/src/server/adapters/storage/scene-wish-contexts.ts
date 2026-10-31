import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import type { VenueScene } from "../../domain/models/scene-model.js";
import type {
  CapturedWishContexts,
  CapturedWishOwner,
  CapturedWishSnapshot,
} from "../../domain/models/wish-check-model.js";
import { immutableMemoryValue, memoryObject, memoryRequire } from "../../domain/rules/memory-integrity.js";
import {
  wishHistoryStore,
  readWishHistoryHead,
  createWishHistoryTracer,
  wishResidentOwners,
  type WishHistoryHead,
} from "./wish-history.js";
import { MEMORY_PAGE_KIND, type MemoryPageData } from "./memory-pages.js";
import { worldWishOwners } from "./world-wishes.js";
import { withRepairWork } from "./repair-gate.js";

type Scope = Pick<VenueScene, "id" | "villageSeed" | "continuity">;
type World = { sceneId: string; seed: string; setupAt: string };
export const capturedWishSnapshotKey = (value: CapturedWishSnapshot) => JSON.stringify(value);
export function assertCapturedWishOwners(
  snapshot: Pick<CapturedWishSnapshot, "seed" | "setupAt"> & {
    owners: readonly { actorId: string; capturedAt: string }[];
  },
  frames: any[],
) {
  memoryRequire(
    snapshot.owners.every((owner) =>
      frames.some(
        (frame) =>
          frame?.seed === snapshot.seed &&
          frame.setupAt === snapshot.setupAt &&
          frame.facts?.villagers?.some(
            (row: any) => row.characterId === owner.actorId && row.cardSnapshot?.capturedAt === owner.capturedAt,
          ),
      ),
    ),
    "captured Wish resident incarnation changed",
  );
}

function ownerFields(value: unknown) {
  memoryObject(value);
  memoryRequire(
    typeof value.actorId === "string" &&
      !!value.actorId &&
      value.actorId === value.actorId.trim() &&
      typeof value.wishId === "string" &&
      typeof value.fingerprint === "string" &&
      typeof value.capturedAt === "string",
    "invalid captured Wish owner",
  );
  return { actorId: value.actorId, wishId: value.wishId, fingerprint: value.fingerprint, capturedAt: value.capturedAt };
}

export function readCapturedWishSnapshot(raw: unknown, world: World): CapturedWishSnapshot {
  memoryObject(raw, ["format", "sceneId", "seed", "setupAt", "owners"]);
  memoryRequire(
    raw.format === 1 &&
      typeof raw.sceneId === "string" &&
      raw.sceneId.length > 0 &&
      typeof raw.seed === "string" &&
      typeof raw.setupAt === "string" &&
      raw.sceneId === world.sceneId &&
      raw.seed === world.seed &&
      raw.setupAt === world.setupAt &&
      Array.isArray(raw.owners),
    "captured Wishes belong to another Scene or World",
  );
  const actors = new Set<string>();
  const owners = raw.owners.map((row) => {
    memoryObject(row, ["actorId", "wishId", "fingerprint", "capturedAt", "head"]);
    const fields = ownerFields(row);
    memoryRequire(!actors.has(fields.actorId), "duplicate captured Wish owner");
    actors.add(fields.actorId);
    return { ...fields, head: readWishHistoryHead(row.head, { ...world, actorId: fields.actorId }) };
  });
  return immutableMemoryValue({ format: 1, ...world, owners });
}

export function capturedWishReferences(raw: unknown, world: World) {
  if (raw === undefined || (Array.isArray(raw) && raw.length === 0)) return [];
  const saved = readCapturedWishSnapshot(raw, world);
  return saved.owners.map((owner) => ({
    scope: { seed: saved.seed, setupAt: saved.setupAt, actorId: owner.actorId },
    head: owner.head,
  }));
}

function contextWorld(scope: Scope): World {
  memoryRequire(
    scope.continuity && scope.continuity.seed === scope.villageSeed && typeof scope.continuity.setupAt === "string",
    "captured Wish source is unavailable",
  );
  return { sceneId: scope.id, seed: scope.continuity.seed, setupAt: scope.continuity.setupAt };
}

export function createSceneWishContexts(documents: CapabilityDocumentStore) {
  const payloads = wishHistoryStore(documents);
  function tracer() {
    return createWishHistoryTracer(async (id) => {
      const row = await documents.getById("villages", id);
      memoryRequire(
        row?.id === id && row.packageId === "villages" && row.kind === MEMORY_PAGE_KIND && row.revision === 1,
        "owned captured Wish history is missing or changed",
      );
      return row.data as MemoryPageData;
    });
  }
  async function validate(raw: unknown, world: World, trace = tracer()) {
    for (const owner of capturedWishReferences(raw, world)) await trace.trace(owner.head, owner.scope);
  }
  async function source(scope: Scope) {
    const row = await documents.getById("villages", "villages-venue-visit-" + scope.id);
    memoryRequire(
      !row ||
        (row.id === "villages-venue-visit-" + scope.id && row.packageId === "villages" && row.kind === "venue-visit"),
      "invalid captured Wish Scene owner",
    );
    const data = row?.data as Record<string, any> | undefined;
    memoryRequire(
      !data || (data.id === scope.id && data.villageSeed === scope.villageSeed),
      "captured Wish Scene identity changed",
    );
    const continuity = scope.continuity ?? data?.continuity;
    const world = contextWorld({ ...scope, continuity }),
      frames = data ? [data.continuity, data.operation?.snapshot?.continuity] : [scope.continuity];
    const pointer = await documents.getById("villages", "villages-active-venue");
    memoryRequire(
      !pointer ||
        (pointer.id === "villages-active-venue" && pointer.packageId === "villages" && pointer.kind === "venue-active"),
      "invalid captured Wish active Scene owner",
    );
    const active = (pointer?.data as { sessionId?: string } | undefined)?.sessionId === scope.id;
    if (active && data)
      payloads.retainScene(
        frames.flatMap((frame) => (frame ? wishResidentOwners(frame.facts.villagers, world) : [])),
        world,
      );
    return { world, data, frames, active };
  }
  /** The caller retains full repair admission through the final body/Scene owner acknowledgement. */
  async function prepare(
    input: CapturedWishContexts,
    scope: Scope,
    protectedSnapshots: ReadonlyMap<string, CapturedWishSnapshot> = new Map(),
  ): Promise<CapturedWishContexts> {
    if (Array.isArray(input) && input.length === 0) return [];
    const { world, data, frames, active } = await source(scope);
    if (!Array.isArray(input)) {
      const saved = readCapturedWishSnapshot(input, world);
      assertCapturedWishOwners(saved, frames);
      if (!protectedSnapshots.has(capturedWishSnapshotKey(saved))) await validate(saved, world);
      return saved;
    }
    const owners: CapturedWishSnapshot["owners"] = [],
      actors = new Set<string>();
    let live: ReturnType<typeof worldWishOwners> | undefined;
    for (const owner of input) {
      const fields = ownerFields(owner);
      memoryRequire(!actors.has(fields.actorId) && Array.isArray(owner.wishes), "invalid captured Wish library");
      actors.add(fields.actorId);
      memoryRequire(
        frames.some(
          (frame) =>
            frame?.seed === world.seed &&
            frame.setupAt === world.setupAt &&
            frame.facts?.villagers?.some(
              (row: any) => row.characterId === fields.actorId && row.cardSnapshot?.capturedAt === fields.capturedAt,
            ),
        ),
        "captured Wish resident incarnation changed",
      );
      let prior: WishHistoryHead | null = null;
      let capturedSource = false;
      for (const snapshot of protectedSnapshots.values()) {
        const captured = snapshot.owners.find(
          (row) => row.actorId === fields.actorId && row.capturedAt === fields.capturedAt,
        );
        if (captured) {
          prior = captured.head;
          capturedSource = true;
          break;
        }
      }
      for (const frame of data ? frames : []) {
        if (capturedSource) break;
        if (frame?.seed !== world.seed || frame.setupAt !== world.setupAt) continue;
        const resident = frame.facts?.villagers?.find(
          (row: any) => row.characterId === fields.actorId && row.cardSnapshot?.capturedAt === fields.capturedAt,
        );
        if (resident) {
          prior = readWishHistoryHead(resident.wishHead, { ...world, actorId: fields.actorId });
          break;
        }
      }
      if (!capturedSource && !prior && owner.wishes.length) {
        if (!live) {
          const row = await documents.getById("villages", "villages-village");
          memoryRequire(
            !row || (row.id === "villages-village" && row.packageId === "villages" && row.kind === "village"),
            "invalid captured Wish World owner",
          );
          if (row) live = worldWishOwners(row.data);
        }
        if (live?.scope.seed === world.seed && live.scope.setupAt === world.setupAt)
          prior = live.owners.find((row) => !row.departure && row.scope.actorId === fields.actorId)?.head ?? null;
      }
      const ownerScope = { ...world, actorId: fields.actorId },
        rows = prior ? await payloads.read(prior, ownerScope) : undefined;
      const saved = await payloads.prepare(owner.wishes, ownerScope, prior, rows ? { head: prior, rows } : undefined);
      if (active) payloads.retainSceneWork(world, { actorId: fields.actorId, head: saved.head, rows: saved.rows });
      owners.push({ ...fields, head: saved.head });
    }
    return immutableMemoryValue({ format: 1, ...world, owners });
  }
  async function read(input: CapturedWishContexts, scope: Scope): Promise<CapturedWishOwner[]> {
    return withRepairWork(async () => {
      if (Array.isArray(input)) return input;
      const { world, frames, active } = await source(scope),
        saved = readCapturedWishSnapshot(input, world);
      assertCapturedWishOwners(saved, frames);
      return immutableMemoryValue(
        await Promise.all(
          saved.owners.map(async ({ head, ...owner }) => {
            if (active) payloads.retainSceneWork(world, { actorId: owner.actorId, head });
            return { ...owner, wishes: await payloads.read(head, { ...world, actorId: owner.actorId }) };
          }),
        ),
      );
    });
  }
  async function prepareValue(
    value: unknown,
    scope: Scope,
    protectedSnapshots: ReadonlyMap<string, CapturedWishSnapshot> = new Map(),
  ) {
    if (!value || typeof value !== "object" || Array.isArray(value) || !Object.hasOwn(value, "wishContexts"))
      return value;
    const fields = value as Record<string, unknown>,
      input = fields.wishContexts;
    memoryRequire(input !== undefined, "captured Wish context was lost");
    const saved = await prepare(input as CapturedWishContexts, scope, protectedSnapshots);
    return immutableMemoryValue({ ...fields, wishContexts: saved });
  }
  return { prepare, prepareValue, read, validate };
}
