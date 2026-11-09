import assert from "node:assert/strict";
import {
  createSceneEncounters,
  readSceneEncounter,
  sceneEncounterId,
} from "../packages/villages/src/server/adapters/storage/scene-encounters.js";
import { encodeSceneTranscript } from "../packages/villages/src/server/adapters/storage/scene-transcript-pages.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { sceneMemoryContext } from "../packages/villages/src/server/domain/rules/scene-memories.js";
import { estimatedMemoryTokens } from "../packages/villages/src/server/domain/rules/memory-protection.js";
import { addMemory, emptyMemories } from "./helpers/memories-fixture.js";
import {
  fitEncounterQuotations,
  rememberSceneEncounter,
  encounterMemoryId,
} from "../packages/villages/src/server/domain/rules/scene-encounters.js";

const rows = new Map<string, any>();
let pageReads = 0;
const documents: any = {
  getById: async (_pkg: string, id: string) => {
    if (id.startsWith("villages-memory-page-")) pageReads++;
    return structuredClone(rows.get(id) ?? null);
  },
  list: async (_pkg: string, kind: string) =>
    [...rows.values()].filter((row) => row.kind === kind).map((row) => structuredClone(row)),
  create: async (input: any) => {
    assert(!rows.has(input.id));
    const row = { ...structuredClone(input), revision: 1 };
    rows.set(row.id, row);
    return row;
  },
  update: async (input: any) => {
    if (rows.get(input.id)?.revision !== input.expectedRevision) return null;
    const row = { ...structuredClone(input), revision: input.expectedRevision + 1 };
    rows.set(row.id, row);
    return row;
  },
};
const at = "2026-11-01T12:00:00.000Z";
const scene = coerceSession({
  version: 4,
  id: "first-encounter",
  villageSeed: "world",
  status: "closed",
  startedAt: at,
  placeId: "cafe",
  placeName: "Cafe",
  participants: ["mara", "bryn", "late"].map((characterId) => ({ characterId, name: characterId, doing: "" })),
  lines: [
    {
      id: "heard",
      role: "assistant",
      kind: "dialogue",
      speakerId: "mara",
      content: "Would you like some tea?",
      heardBy: ["mara", "bryn"],
      at,
    },
    {
      id: "private",
      role: "assistant",
      kind: "whisper",
      delivery: "whisper",
      targetId: "player",
      speakerId: "mara",
      content: "The cup is a birthday present.",
      heardBy: ["mara"],
      at,
    },
    {
      id: "unseen",
      role: "assistant",
      kind: "dialogue",
      speakerId: "bryn",
      content: "An unseen secret.",
      heardBy: ["bryn"],
      contactHidden: true,
      at,
    },
    {
      id: "thought",
      role: "user",
      content: "I privately think about a key.",
      heardBy: [],
      attentionEvidence: true,
      at,
    },
  ],
});
const encoded = encodeSceneTranscript(scene.lines, scene);
const world = defaultVillageState();
world.seed = "world";
rememberSceneEncounter(world, scene);
assert(
  world.memories.records.some((row) => row.origin.id === encounterMemoryId(scene.id)),
  "A Memory-free encounter gets a native Forget/Correct target",
);
for (const [id, data] of encoded.pages)
  rows.set(id, { id, packageId: "villages", kind: "memory-page", revision: 1, data });
const source = { revision: 3, data: { transcript: encoded.head } };
const archive = createSceneEncounters(documents);
await archive.save(scene, source);
await archive.save(scene, source);
assert.equal(rows.get(sceneEncounterId(scene.id)).revision, 1, "Retry is idempotent");
assert.throws(
  () => readSceneEncounter({ ...rows.get(sceneEncounterId(scene.id)).data, recent: { late: [999] } }),
  /positions/,
);
await assert.rejects(archive.save({ ...scene, placeName: "Changed bytes" }, source), /bytes changed/);
await archive.save({ ...scene, placeName: "Revised cafe" }, { ...source, revision: 4 });
assert.equal(rows.get(sceneEncounterId(scene.id)).revision, 2);
rows.set("villages-venue-visit-" + scene.id, { data: scene });
assert.deepEqual(
  await archive.recall("world", "return", ["mara"], world.memories),
  [],
  "A partial retirement cannot masquerade as an independent encounter",
);
rows.delete("villages-venue-visit-" + scene.id);
const restarted = createSceneEncounters(documents);
const recalled = await restarted.recall("world", "return", ["player", "mara", "bryn", "late"], world.memories);
assert(
  recalled.some((row) => row.text.includes("tea")),
  "A cue-free return still has witnessed continuity",
);
assert(!JSON.stringify(recalled).includes("unseen secret"));
assert(!JSON.stringify(recalled).includes("privately think"));
assert(!recalled.some((row) => row.heardBy.includes("late")), "A later arrival cannot inherit earlier words");
assert(!recalled.find((row) => row.lineId === "private")!.heardBy.includes("bryn"));
assert.deepEqual(await restarted.recall("other-world", "return", ["mara"], emptyMemories()), []);

for (const action of ["forgotten", "repair"] as const) {
  const memories = addMemory(world.memories, { audience: ["mara"], text: "A protected disclosure." });
  const root = memories.records.at(-1)!;
  root.knowers.mara[action] =
    action === "forgotten"
      ? { at: "2026-11-02T00:00:00.000Z", operationId: "admin" }
      : ({
          at: "2026-11-02T00:00:00.000Z",
          operationId: "admin",
          text: "The corrected disclosure.",
          repairs: { id: root.id, revision: root.revision },
        } as any);
  const projected = await restarted.recall("world", "return", ["mara", "bryn"], memories);
  assert(
    !projected.some((row) => row.heardBy.includes("mara")),
    "No lexical overlap or source-link guess may restore protected raw history",
  );
  assert(
    projected.some((row) => row.heardBy.includes("bryn")),
    "One knower's edit does not erase another's experience",
  );
}

// Two weeks of long Scenes keep quotation reads and the shared prompt allocation bounded.
const header = rows.get(sceneEncounterId(scene.id)).data;
for (let day = 1; day < 141; day++) {
  const id = "old-" + day;
  const older = { ...header, id, startedAt: new Date(Date.parse(at) - day * 86400000).toISOString() };
  older.transcript = { ...header.transcript, world: "wrong-owner" };
  // Old real headers still use their original page owner; create one native empty-source layout per Scene.
  const owner = { ...scene, id, lines: scene.lines };
  const pages = encodeSceneTranscript(owner.lines, owner);
  older.transcript = pages.head;
  for (const [pageId, data] of pages.pages)
    rows.set(pageId, { id: pageId, packageId: "villages", kind: "memory-page", revision: 1, data });
  rows.set(sceneEncounterId(id), {
    id: sceneEncounterId(id),
    packageId: "villages",
    kind: "scene-encounter",
    revision: 1,
    data: older,
  });
}
pageReads = 0;
const bounded = await restarted.recall("world", "return", ["mara", "bryn", "late"], world.memories);
assert(pageReads < 20, "Only selected quotation pages are loaded, not the entire archive");
assert(estimatedMemoryTokens(JSON.stringify({ encounters: bounded })) <= 600);
assert.deepEqual(
  fitEncounterQuotations([
    { ...bounded[0]!, text: "I will agree ".repeat(500) + "only if the owner permits it; otherwise I refuse." },
  ]),
  [],
  "A budget trim cannot remove a condition or denial from quoted speech",
);
const memory = sceneMemoryContext(world, ["mara", "bryn", "player"], "Hello.", "", "", bounded);
assert(memory.envelope.encounters?.length);
assert(estimatedMemoryTokens(JSON.stringify(memory.envelope)) <= 1796, "Continuity uses the existing budget");
console.log(
  "Encounter continuity preserves witnessed quotes, private asides, restart ownership and bounded recall without provider calls.",
);
