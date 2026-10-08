import assert from "node:assert/strict";
import {
  findVillagerCard,
  findPlayerPersona,
  readVillagerCard,
} from "../packages/villages/src/server/adapters/engine/catalog.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import { snapshotFromCard } from "../packages/villages/src/server/domain/rules/resident-card-snapshot.js";
import { readLinkedPersona } from "../packages/villages/src/server/features/settings/personas.js";
import { refreshPlayerPersona } from "../packages/villages/src/server/features/settings/persona-cache.js";
import {
  previewVillagerRefresh,
  applyVillagerRefresh,
} from "../packages/villages/src/server/features/residents/resident-cards.js";
import { mutateVillageState, readVillageState } from "../packages/villages/src/server/features/world/village-store.js";

const unrelatedCharacter = {
  id: "other",
  data: JSON.stringify({ name: "Other resident", description: "Other private writing" }),
};
const selectedCharacter = {
  id: "requested",
  data: JSON.stringify({ name: "Selected resident", description: "Selected writing" }),
};
const unrelatedPersona = {
  id: "other",
  data: JSON.stringify({ name: "Other player", description: "Other private identity" }),
};
const selectedPersona = {
  id: "requested",
  data: JSON.stringify({ name: "Selected player", description: "Selected private identity" }),
};
const rows = new Map<string, any>(),
  reads: { kind: string; ids: string[] | undefined }[] = [];
let writes = 0,
  mode: "wrong" | "matching" | "empty" | "error" = "wrong";
const failure = new Error("Exact library failure");
const documents = {
  async getById(_package: string, id: string) {
    return structuredClone(rows.get(id) ?? null);
  },
  async list() {
    return [];
  },
  async create(input: any) {
    writes++;
    const row = { ...structuredClone(input), revision: 1 };
    rows.set(input.id, row);
    return structuredClone(row);
  },
  async update(input: any) {
    const row = rows.get(input.id);
    if (row?.revision !== input.expectedRevision) return null;
    writes++;
    const next = { ...row, ...structuredClone(input), revision: row.revision + 1 };
    rows.set(input.id, next);
    return structuredClone(next);
  },
};
const release = configureVillagesRuntime({
  persistence: { documents },
  resources: {
    async listCharacters(ids?: string[]) {
      reads.push({ kind: "characters", ids });
      if (mode === "error") throw failure;
      return mode === "empty"
        ? []
        : mode === "matching"
          ? [unrelatedCharacter, selectedCharacter]
          : [unrelatedCharacter];
    },
    async listPersonas(ids?: string[]) {
      reads.push({ kind: "personas", ids });
      if (mode === "error") throw failure;
      return mode === "empty" ? [] : mode === "matching" ? [unrelatedPersona, selectedPersona] : [unrelatedPersona];
    },
  },
  logger: { debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} },
  isDebugAgentsEnabled: () => false,
} as any);
try {
  assert.equal(
    await findVillagerCard("requested"),
    null,
    "A missing character cannot resolve to a different library identity.",
  );
  assert.equal(
    await findPlayerPersona("requested"),
    null,
    "A missing Persona cannot resolve to a different private identity.",
  );
  assert.deepEqual(reads, [
    { kind: "characters", ids: ["requested"] },
    { kind: "personas", ids: ["requested"] },
  ]);
  await assert.rejects(readLinkedPersona("requested"), /no longer in your library/);
  const cachedCard = readVillagerCard({
    id: "requested",
    data: JSON.stringify({ name: "Adopted resident", description: "Adopted writing" }),
  } as any);
  await mutateVillageState((state) => {
    state.playerPersonaId = "requested";
    state.playerPersonaName = "Cached player";
    state.playerPersonaIdentity = "Cached private identity";
    state.villagers = [
      {
        characterId: "requested",
        cardSnapshot: snapshotFromCard(cachedCard, 2),
        addedAt: "2026-10-06T12:00:00Z",
        agenda: null,
        remap: null,
        remapFailure: null,
        completedWishes: [],
      },
    ];
  });
  const preview = await previewVillagerRefresh("requested");
  assert.equal(preview.sourceAvailable, false);
  assert.equal(preview.proposed, null);
  assert.equal(preview.current.name, "Adopted resident");
  await assert.rejects(applyVillagerRefresh("requested"), /no longer in your library/);
  assert.equal((await readVillageState()).villagers[0]!.cardSnapshot.name, "Adopted resident");
  assert.equal(await refreshPlayerPersona(), true);
  let state = await readVillageState();
  assert.equal(state.playerPersonaMissing, true);
  assert.equal(state.playerPersonaName, "Cached player");
  assert.equal(state.playerPersonaIdentity, "Cached private identity");
  const afterMissing = writes;
  assert.equal(await refreshPlayerPersona(), false);
  assert.equal(writes, afterMissing, "A different library record cannot trigger repeat cache saves.");
  mode = "matching";
  assert.equal((await findVillagerCard("requested"))!.name, "Selected resident");
  assert.equal((await findPlayerPersona("requested"))!.name, "Selected player");
  assert.deepEqual(await readLinkedPersona("requested"), {
    id: "requested",
    name: "Selected player",
    identity: "Selected private identity",
  });
  assert.equal(await refreshPlayerPersona(), true);
  state = await readVillageState();
  assert.equal(state.playerPersonaMissing, false);
  assert.equal(state.playerPersonaIdentity, "Selected private identity");
  mode = "empty";
  assert.equal(await findVillagerCard("requested"), null);
  assert.equal(await findPlayerPersona("requested"), null);
  mode = "error";
  const beforeFailure = writes;
  const readsBeforeFailure = reads.length;
  await assert.rejects(findVillagerCard("requested"), (error) => error === failure);
  await assert.rejects(findPlayerPersona("requested"), (error) => error === failure);
  assert.equal(writes, beforeFailure);
  assert.equal(reads.length, readsBeforeFailure + 2, "Each failing lookup reads once without retrying.");
  assert(reads.every((read) => JSON.stringify(read.ids) === JSON.stringify(["requested"])));
} finally {
  release();
}
console.log(
  "Exact catalog identity: mismatched/empty libraries stay unavailable, selected records resolve regardless of order, linked caches/adopted cards remain owned, and errors propagate without retries (assembled runtime; mocked documents/library; no models).",
);
