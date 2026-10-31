import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import type { VillageMemoryRead } from "../../domain/models/world-repository.js";
import type { VillageState } from "../../domain/models/world.js";
import { immutableMemoryValue, memoryObject, memoryRequire } from "../../domain/rules/memory-integrity.js";
import { blockWishHistory, copySocialWishes, wishHistoryLoaded } from "../../domain/rules/social-wishes.js";
import {
  wishHistoryStore,
  createWishHistoryTracer,
  readWishHistoryHead,
  readWishArchiveHead,
  wishResidentOwners,
  type WishArchiveEntry,
  type WishHistoryHead,
  type WishHistoryScope,
} from "./wish-history.js";
import { MEMORY_PAGE_KIND, type MemoryPageData } from "./memory-pages.js";

type Owner = { scope: WishHistoryScope; head: WishHistoryHead | null; name: string; departure: boolean };
type EffectOwner = { id: string; scope: WishHistoryScope; head: WishHistoryHead | null; wishId: string };
const effectOwners = new WeakMap<object, EffectOwner>();
export function worldWishOwners(raw: unknown) {
  memoryObject(raw);
  memoryRequire(
    raw.version === 12 && typeof raw.seed === "string" && typeof raw.setupAt === "string",
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
    for (const owner of wishResidentOwners(value.villagers, scope)) owners.push({ ...owner, departure });
  }
  residents(raw, false);
  if (raw.returnCatchup !== undefined) {
    memoryObject(raw.returnCatchup);
    if (raw.returnCatchup.capture !== undefined) {
      memoryObject(raw.returnCatchup.capture);
      residents(raw.returnCatchup.capture.world, true);
    }
  }
  const receipts = raw.exchangeReceipts ?? {};
  memoryObject(receipts);
  const effects = Object.entries(receipts).flatMap(([id, receipt]) => {
    memoryObject(receipt);
    const wish = receipt.sceneFacts?.wish;
    if (wish === undefined) return [];
    memoryObject(wish, ["actorId", "wishId", "head"]);
    memoryRequire(
      receipt.id === id &&
        typeof wish.actorId === "string" &&
        !!wish.actorId &&
        wish.actorId === wish.actorId.trim() &&
        typeof wish.wishId === "string" &&
        !!wish.wishId &&
        wish.wishId === wish.wishId.trim(),
      "invalid Wish effect owner",
    );
    const owner = { ...scope, actorId: wish.actorId },
      head = readWishHistoryHead(wish.head, owner);
    memoryRequire(!head || head.count === 1, "Wish effect must own one exact after-image");
    return [{ id, scope: owner, head, wishId: wish.wishId }];
  });
  return { scope, owners, effects, archive: readWishArchiveHead(raw.wishArchiveHead, scope) };
}
const selected = (id: string, include: VillageMemoryRead["wishes"]) => include === true || !!include?.includes(id);
export function createWorldWishes(documents: CapabilityDocumentStore) {
  const payloads = wishHistoryStore(documents);
  async function decode(raw: Record<string, any>, include: VillageMemoryRead["wishes"]) {
    const { owners, effects } = worldWishOwners(raw);
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
    result.exchangeReceipts = { ...raw.exchangeReceipts };
    for (const owner of effects) {
      const receipt = raw.exchangeReceipts[owner.id];
      const wish = immutableMemoryValue({
        actorId: owner.scope.actorId,
        wishId: owner.wishId,
        ...(owner.head ? {} : { value: null }),
      });
      effectOwners.set(wish, owner);
      result.exchangeReceipts[owner.id] = {
        ...receipt,
        sceneFacts: {
          ...receipt.sceneFacts,
          wish,
        },
      };
    }
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
  async function loadEffects(state: VillageState, raw: unknown, include: VillageMemoryRead["wishEffects"]) {
    const ids = typeof include === "function" ? include(state) : include,
      wanted = ids === true ? true : new Set(ids);
    for (const owner of worldWishOwners(raw).effects) {
      if (wanted !== true && !wanted.has(owner.id)) continue;
      payloads.retainSceneWork(
        { ...owner.scope, sceneId: state.exchangeReceipts[owner.id].sceneId },
        { actorId: owner.scope.actorId, wishId: owner.wishId, head: owner.head },
      );
      if (!owner.head) continue;
      const rows = await payloads.read(owner.head, owner.scope);
      memoryRequire(rows.length === 1 && rows[0].id === owner.wishId, "Wish after-image identity changed");
      const wish = immutableMemoryValue({ actorId: owner.scope.actorId, wishId: owner.wishId, value: rows[0] });
      state.exchangeReceipts[owner.id].sceneFacts!.wish = wish;
      effectOwners.set(wish, owner);
    }
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
    const exchangeReceipts: Record<string, unknown> = { ...state.exchangeReceipts },
      oldEffects = new Map(before?.effects.map((entry) => [entry.id, entry])),
      adopted: EffectOwner[] = [];
    for (const [id, receipt] of Object.entries(state.exchangeReceipts)) {
      const wish = receipt.sceneFacts?.wish;
      if (!wish) continue;
      const owner = { ...scope, actorId: wish.actorId },
        old = sameWorld ? oldEffects.get(id) : undefined;
      memoryRequire(
        !old || (old.scope.actorId === wish.actorId && old.wishId === wish.wishId),
        "Wish effect identity changed",
      );
      const known = effectOwners.get(wish);
      const reusable =
        known &&
        known.id === id &&
        known.scope.seed === scope.seed &&
        known.scope.setupAt === scope.setupAt &&
        known.scope.actorId === wish.actorId &&
        known.wishId === wish.wishId;
      let head: WishHistoryHead | null;
      if (reusable) {
        head = known.head;
        if (!old || JSON.stringify(old.head) !== JSON.stringify(head)) adopted.push(known);
      } else if (wish.value === undefined) {
        memoryRequire(old, "unloaded Wish effect has no committed owner");
        head = old.head;
      } else if (wish.value === null) head = null;
      else {
        memoryRequire(wish.value.id === wish.wishId, "Wish after-image identity changed");
        const resident = state.villagers.find((row) => row.characterId === wish.actorId),
          saved = villagers.find((row) => row.characterId === wish.actorId);
        // The resident head was published above under this same full work admission.
        const source =
          resident && saved && wishHistoryLoaded(resident)
            ? { head: saved.wishHead as WishHistoryHead | null, rows: resident.wishes }
            : undefined;
        const prepared = await payloads.prepare([wish.value], owner, old?.head ?? null, source);
        memoryRequire(prepared.head, "missing Wish after-image");
        head = prepared.head;
        const captured = immutableMemoryValue({ actorId: wish.actorId, wishId: wish.wishId, value: prepared.rows[0] });
        receipt.sceneFacts!.wish = captured;
        effectOwners.set(captured, { id, scope: owner, head, wishId: wish.wishId });
      }
      exchangeReceipts[id] = {
        ...receipt,
        sceneFacts: { ...receipt.sceneFacts, wish: { actorId: wish.actorId, wishId: wish.wishId, head } },
      };
    }
    // A decoded checkpoint/cache association is not publication authority: recheck its whole graph.
    const tracer = wishTracer(documents);
    for (const owner of adopted) await tracer.trace(owner.head, owner.scope, owner.wishId);
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
    return { villagers, wishArchiveHead, returnCatchup, exchangeReceipts };
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
  return { decode, loadEffects, block, encode, retain };
}

function wishTracer(documents: Pick<CapabilityDocumentStore, "getById">) {
  return createWishHistoryTracer(async (id) => {
    const row = await documents.getById("villages", id);
    memoryRequire(
      row?.id === id && row.packageId === "villages" && row.kind === MEMORY_PAGE_KIND && row.revision === 1,
      "owned Wish history is missing or changed",
    );
    return row.data as MemoryPageData;
  });
}
export async function validateWorldWishHistory(documents: Pick<CapabilityDocumentStore, "getById">, worlds: unknown[]) {
  const tracer = wishTracer(documents);
  for (const raw of worlds) {
    const { scope, owners, effects, archive } = worldWishOwners(raw);
    for (const owner of owners) await tracer.trace(owner.head, owner.scope);
    for (const owner of effects) await tracer.trace(owner.head, owner.scope, owner.wishId);
    await tracer.traceArchive(archive, scope);
  }
}
