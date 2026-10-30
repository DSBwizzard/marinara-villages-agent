import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import type { VillageMemoryRead } from "../../domain/models/world-repository.js";
import type { VillageState } from "../../domain/models/world.js";
import { memoryObject, memoryRequire } from "../../domain/rules/memory-integrity.js";
import { blockWishHistory, copySocialWishes, wishHistoryLoaded } from "../../domain/rules/social-wishes.js";
import {
  createWishHistoryStore,
  createWishHistoryTracer,
  readWishHistoryHead,
  readWishArchiveHead,
  type WishArchiveEntry,
  type WishHistoryHead,
  type WishHistoryScope,
} from "./wish-history.js";
import { MEMORY_PAGE_KIND, type MemoryPageData } from "./memory-pages.js";

type Owner = { scope: WishHistoryScope; head: WishHistoryHead | null; name: string; departure: boolean };
export function worldWishOwners(raw: unknown) {
  memoryObject(raw);
  memoryRequire(
    raw.version === 11 && typeof raw.seed === "string" && typeof raw.setupAt === "string",
    "unsupported Village Wish ownership; start a fresh Village",
  );
  const scope = { seed: raw.seed, setupAt: raw.setupAt },
    owners: Owner[] = [];
  function residents(value: unknown, departure: boolean) {
    memoryObject(value);
    memoryRequire(
      value.seed === scope.seed && value.setupAt === scope.setupAt && Array.isArray(value.villagers),
      "invalid Village Wish ownership",
    );
    const ids = new Set<string>();
    for (const row of value.villagers) {
      memoryObject(row);
      memoryObject(row.cardSnapshot);
      memoryRequire(
        typeof row.characterId === "string" &&
          row.characterId.length > 0 &&
          !ids.has(row.characterId) &&
          typeof row.cardSnapshot.name === "string" &&
          !Object.hasOwn(row, "wishes"),
        "invalid native Wish owner",
      );
      ids.add(row.characterId);
      const owner = { ...scope, actorId: row.characterId };
      owners.push({
        scope: owner,
        head: readWishHistoryHead(row.wishHead, owner),
        name: row.cardSnapshot.name,
        departure,
      });
    }
  }
  residents(raw, false);
  if (raw.returnCatchup !== undefined) {
    memoryObject(raw.returnCatchup);
    if (raw.returnCatchup.capture !== undefined) {
      memoryObject(raw.returnCatchup.capture);
      residents(raw.returnCatchup.capture.world, true);
    }
  }
  return { scope, owners, archive: readWishArchiveHead(raw.wishArchiveHead, scope) };
}
const selected = (id: string, include: VillageMemoryRead["wishes"]) => include === true || !!include?.includes(id);
const stores = new WeakMap<CapabilityDocumentStore, ReturnType<typeof createWishHistoryStore>>();
export function createWorldWishes(documents: CapabilityDocumentStore) {
  let stored = stores.get(documents);
  if (!stored) stores.set(documents, (stored = createWishHistoryStore(documents)));
  const payloads = stored;
  async function decode(raw: Record<string, any>, include: VillageMemoryRead["wishes"]) {
    const { owners } = worldWishOwners(raw);
    async function residents(rows: Record<string, any>[], departure: boolean) {
      return Promise.all(
        rows.map(async (row) => {
          const owner = owners.find(
            (owner) => owner.departure === departure && owner.scope.actorId === row.characterId,
          )!;
          const wishes =
            !owner.head || selected(row.characterId, include)
              ? copySocialWishes(await payloads.read(owner.head, owner.scope))
              : [];
          // Frozen authority hashes include field order.
          return Object.fromEntries(
            Object.entries(row).map(([key, value]) => (key === "wishHead" ? ["wishes", wishes] : [key, value])),
          );
        }),
      );
    }
    const { wishArchiveHead: _archive, ...facts } = raw;
    const result = { ...facts, villagers: await residents(raw.villagers, false) } as Record<string, any>;
    if (raw.returnCatchup?.capture)
      result.returnCatchup = {
        ...raw.returnCatchup,
        capture: {
          ...raw.returnCatchup.capture,
          world: {
            ...raw.returnCatchup.capture.world,
            villagers: await residents(raw.returnCatchup.capture.world.villagers, true),
          },
        },
      };
    return result;
  }
  function block(state: VillageState, raw: unknown, include: VillageMemoryRead["wishes"]) {
    for (const owner of worldWishOwners(raw).owners) {
      if (!owner.head || selected(owner.scope.actorId, include)) continue;
      const world = owner.departure ? state.returnCatchup?.capture?.world : state;
      const person = world?.villagers.find((row) => row.characterId === owner.scope.actorId);
      memoryRequire(person, "Wish owner disappeared during decoding");
      blockWishHistory(person);
    }
  }
  async function encode(state: VillageState, previous: unknown, returnCatchup: any) {
    const before = previous ? worldWishOwners(previous) : undefined;
    const sameWorld = before?.scope.seed === state.seed && before.scope.setupAt === state.setupAt;
    memoryRequire(sameWorld || state.villagers.every(wishHistoryLoaded), "world reset requires Wishes");
    const scope = { seed: state.seed, setupAt: state.setupAt };
    async function residents(rows: VillageState["villagers"], departure: boolean) {
      const ids = new Set<string>();
      const saved = [];
      for (const row of rows) {
        memoryRequire(!ids.has(row.characterId), "duplicate Wish owner");
        ids.add(row.characterId);
        const owner = { ...scope, actorId: row.characterId };
        const old = sameWorld
          ? before.owners.find((entry) => entry.departure === departure && entry.scope.actorId === row.characterId)
          : undefined;
        let head = old?.head ?? null;
        if (wishHistoryLoaded(row)) {
          memoryRequire(
            Object.hasOwn(row, "wishes") && Array.isArray(row.wishes),
            "Wish history was lost during mutation",
          );
          const prepared = await payloads.prepare(row.wishes, owner, head);
          head = prepared.head;
          row.wishes = copySocialWishes(prepared.rows);
        } else memoryRequire(old, "unloaded Wishes have no committed owner");
        saved.push(
          Object.fromEntries(
            Object.getOwnPropertyNames(row)
              .filter((key) => key === "wishes" || Object.getOwnPropertyDescriptor(row, key)?.enumerable)
              .map((key) => (key === "wishes" ? ["wishHead", head] : [key, row[key as keyof typeof row]])),
          ),
        );
      }
      return saved;
    }
    const villagers = await residents(state.villagers, false);
    if (returnCatchup?.capture) {
      memoryRequire(
        returnCatchup.capture.world.seed === state.seed && returnCatchup.capture.world.setupAt === state.setupAt,
        "departure Wishes belong to another world",
      );
      returnCatchup = {
        ...returnCatchup,
        capture: {
          ...returnCatchup.capture,
          world: {
            ...returnCatchup.capture.world,
            villagers: await residents(state.returnCatchup!.capture!.world.villagers, true),
          },
        },
      };
    }
    const additions: WishArchiveEntry[] = sameWorld
      ? before.owners.flatMap((owner) =>
          !owner.departure && owner.head && !state.villagers.some((row) => row.characterId === owner.scope.actorId)
            ? [{ actorId: owner.scope.actorId, name: owner.name, head: owner.head }]
            : [],
        )
      : [];
    const wishArchiveHead = await payloads.appendArchive(
      sameWorld ? before.archive : { count: 0, root: null },
      scope,
      additions,
    );
    return { villagers, wishArchiveHead, returnCatchup };
  }
  function retain(raw: unknown, state?: VillageState) {
    payloads.retain(
      worldWishOwners(raw).owners.map((owner) => {
        const world = owner.departure ? state?.returnCatchup?.capture?.world : state;
        const person = world?.villagers.find((row) => row.characterId === owner.scope.actorId);
        return { head: owner.head, rows: person && wishHistoryLoaded(person) ? person.wishes : undefined };
      }),
    );
  }
  return { decode, block, encode, retain };
}

export async function validateWorldWishHistory(documents: Pick<CapabilityDocumentStore, "getById">, worlds: unknown[]) {
  const tracer = createWishHistoryTracer(async (id) => {
    const row = await documents.getById("villages", id);
    memoryRequire(
      row?.id === id && row.packageId === "villages" && row.kind === MEMORY_PAGE_KIND && row.revision === 1,
      "owned Wish history is missing or changed",
    );
    return row.data as MemoryPageData;
  });
  for (const raw of worlds) {
    const { scope, owners, archive } = worldWishOwners(raw);
    for (const owner of owners) await tracer.trace(owner.head, owner.scope);
    await tracer.traceArchive(archive, scope);
  }
}
