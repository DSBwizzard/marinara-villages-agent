import { badRequest, notFound } from "./errors.js";
import { VILLAGES_PACKAGE_ID, villagesDocuments } from "./runtime-host.js";
import { mutateVillageState, readVillageState } from "./village-store.js";
import { coerceWishOutcome } from "./wish-coercion.js";
import { WISH_SYSTEM_VERSION } from "./wish-definition.js";
import { WISH_PAGE_SIZE } from "./wish-policy.js";
import type { WishOutcome } from "./wish-types.js";
import { createHash } from "node:crypto";

function archivePrefix(seed: string, characterId: string): string {
  return `wish-history:${createHash("sha256").update(`wish-journal-v${WISH_SYSTEM_VERSION}\0${seed}\0${characterId}`).digest("hex")}`;
}
const pointerId = (prefix: string, wishId: string): string =>
  `${prefix}:wish:${createHash("sha256").update(wishId).digest("hex")}`;
const rows = (data: unknown): WishOutcome[] => {
  const value = (data as { entries?: unknown[] })?.entries;
  return Array.isArray(value)
    ? value.flatMap((entry) => {
        const outcome = coerceWishOutcome(entry);
        return outcome ? [outcome] : [];
      })
    : [];
};

/** The village outbox is authoritative until both page and lookup pointer are durable. */
export async function writeWishArchive(prefix: string, outcome: WishOutcome): Promise<void> {
  const documents = villagesDocuments(),
    page = Math.floor(outcome.sequence / WISH_PAGE_SIZE),
    id = `${prefix}:page:${page}`;
  for (let attempt = 0; attempt < 8; attempt++) {
    const record = await documents.getById(VILLAGES_PACKAGE_ID, id);
    const entries = rows(record?.data),
      previous = entries.find((entry) => entry.sequence === outcome.sequence);
    if (previous?.correctedAt || JSON.stringify(previous) === JSON.stringify(outcome)) break;
    const next = [...entries.filter((entry) => entry.sequence !== outcome.sequence), outcome].sort(
      (a, b) => a.sequence - b.sequence,
    );
    if (next.length > WISH_PAGE_SIZE) throw new Error("Wish archive page overflow.");
    const at = new Date().toISOString();
    if (record) {
      if (
        !(await documents.update({
          id,
          packageId: VILLAGES_PACKAGE_ID,
          expectedRevision: record.revision,
          name: record.name,
          description: record.description,
          data: { entries: next },
          updatedAt: at,
        }))
      )
        continue;
    } else {
      try {
        await documents.create({
          id,
          packageId: VILLAGES_PACKAGE_ID,
          kind: "wish-history-page",
          name: "Wish outcomes",
          description: "Fifty indexed outcomes",
          data: { entries: next },
          createdAt: at,
          updatedAt: at,
        });
      } catch (error) {
        if (attempt < 7) continue;
        throw error;
      }
    }
    break;
  }
  const saved = await documents.getById(VILLAGES_PACKAGE_ID, id);
  const durable = rows(saved?.data).find((entry) => entry.sequence === outcome.sequence);
  if (!durable || durable.memoryId !== outcome.memoryId || (outcome.correctedAt && !durable.correctedAt))
    throw new Error("Wish archive write did not settle.");
  const pointer = pointerId(prefix, outcome.wish.id);
  for (let attempt = 0; attempt < 8; attempt++) {
    const record = await documents.getById(VILLAGES_PACKAGE_ID, pointer);
    const previous = (record?.data as { sequence?: number })?.sequence;
    if (Number.isSafeInteger(previous) && previous! >= outcome.sequence) return;
    const at = new Date().toISOString();
    if (record) {
      if (
        await documents.update({
          id: pointer,
          packageId: VILLAGES_PACKAGE_ID,
          expectedRevision: record.revision,
          name: record.name,
          description: record.description,
          data: { sequence: outcome.sequence },
          updatedAt: at,
        })
      )
        return;
      continue;
    }
    try {
      await documents.create({
        id: pointer,
        packageId: VILLAGES_PACKAGE_ID,
        kind: "wish-history-pointer",
        name: "Wish outcome address",
        description: "Direct page lookup",
        data: { sequence: outcome.sequence },
        createdAt: at,
        updatedAt: at,
      });
      return;
    } catch (error) {
      if (attempt >= 7) throw error;
    }
  }
  throw new Error("Wish outcome address did not settle.");
}

export async function flushWishOutcomes(): Promise<void> {
  const state = await readVillageState();
  let processed = 0;
  for (const resident of state.villagers)
    for (const outcome of resident.wishLifecycle?.pendingOutcomes ?? []) {
      if (processed++ >= 50) return;
      await writeWishArchive(archivePrefix(state.seed, resident.characterId), outcome);
      await mutateVillageState((live) => {
        const lifecycle = live.villagers.find((entry) => entry.characterId === resident.characterId)?.wishLifecycle;
        if (lifecycle)
          lifecycle.pendingOutcomes = lifecycle.pendingOutcomes.filter(
            (entry) => entry.sequence !== outcome.sequence || entry.correctedAt !== outcome.correctedAt,
          );
      });
    }
}

export async function readWishOutcome(characterId: string, wishId: string): Promise<WishOutcome | null> {
  const state = await readVillageState(),
    resident = state.villagers.find((entry) => entry.characterId === characterId);
  if (!resident) throw notFound("That villager does not live here.");
  const pending = resident.wishLifecycle?.pendingOutcomes
    .filter((entry) => entry.wish.id === wishId)
    .sort((a, b) => b.sequence - a.sequence)[0];
  if (pending) return pending;
  const prefix = archivePrefix(state.seed, characterId),
    pointer = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, pointerId(prefix, wishId));
  const sequence = (pointer?.data as { sequence?: number })?.sequence;
  if (!Number.isSafeInteger(sequence) || sequence! < 0) return null;
  const page = await villagesDocuments().getById(
    VILLAGES_PACKAGE_ID,
    `${prefix}:page:${Math.floor(sequence! / WISH_PAGE_SIZE)}`,
  );
  return rows(page?.data).find((entry) => entry.sequence === sequence && entry.wish.id === wishId) ?? null;
}

export async function readWishHistoryPage(
  characterId: string,
  cursor?: string,
): Promise<{ entries: WishOutcome[]; nextCursor: string | null; total: number }> {
  const state = await readVillageState(),
    resident = state.villagers.find((entry) => entry.characterId === characterId);
  if (!resident) throw notFound("That villager does not live here.");
  const total = resident.wishLifecycle?.outcomeCount ?? 0;
  const page = cursor === undefined ? Math.floor(Math.max(0, total - 1) / WISH_PAGE_SIZE) : Number(cursor);
  if (
    !Number.isSafeInteger(page) ||
    page < 0 ||
    (cursor !== undefined && !/^\d+$/.test(cursor)) ||
    page > Math.floor(Math.max(0, total - 1) / WISH_PAGE_SIZE)
  )
    throw badRequest("Invalid wish history cursor.");
  const record = await villagesDocuments().getById(
    VILLAGES_PACKAGE_ID,
    `${archivePrefix(state.seed, characterId)}:page:${page}`,
  );
  const merged = new Map(rows(record?.data).map((entry) => [entry.sequence, entry]));
  for (const pending of resident.wishLifecycle?.pendingOutcomes ?? [])
    if (Math.floor(pending.sequence / WISH_PAGE_SIZE) === page) merged.set(pending.sequence, pending);
  return {
    entries: [...merged.values()].sort((a, b) => b.sequence - a.sequence),
    nextCursor: page > 0 ? String(page - 1) : null,
    total,
  };
}

/** Corrections are rare; walk direct pages only until the previous family outcome is found. */
export async function previousFulfilledNeed(
  characterId: string,
  needId: string,
  before: number,
): Promise<WishOutcome | undefined> {
  const state = await readVillageState(),
    resident = state.villagers.find((entry) => entry.characterId === characterId);
  if (!resident) return undefined;
  const pending = resident.wishLifecycle?.pendingOutcomes ?? [],
    prefix = archivePrefix(state.seed, characterId);
  for (let page = Math.floor(Math.max(0, before - 1) / WISH_PAGE_SIZE); page >= 0; page--) {
    const record = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, `${prefix}:page:${page}`);
    const merged = new Map(rows(record?.data).map((entry) => [entry.sequence, entry]));
    for (const entry of pending)
      if (Math.floor(entry.sequence / WISH_PAGE_SIZE) === page) merged.set(entry.sequence, entry);
    const previous = [...merged.values()]
      .filter(
        (entry) =>
          entry.sequence < before && entry.needId === needId && entry.kind === "fulfilled" && !entry.correctedAt,
      )
      .sort((a, b) => b.sequence - a.sequence)[0];
    if (previous) return previous;
  }
  return undefined;
}
