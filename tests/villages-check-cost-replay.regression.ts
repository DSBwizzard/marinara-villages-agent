import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { configureVillagesRuntime } from "../packages/villages/src/engine/packages/server/src/services/villages/package-runtime.js";
import { defaultVillageState } from "../packages/villages/src/engine/packages/server/src/services/villages/village-store.js";
import { unwrittenVillageAgenda } from "../packages/villages/src/engine/packages/server/src/services/villages/agenda-plan.js";
import { interpretRoomReply } from "../packages/villages/src/engine/packages/server/src/services/villages/room-interpretation.js";
import { processWishExchange } from "../packages/villages/src/engine/packages/server/src/services/villages/wish-progress.js";
import { wishFingerprint } from "../packages/villages/src/engine/packages/server/src/services/villages/wish-interpretation.js";
import { settleBackgroundWork } from "../packages/villages/src/engine/packages/server/src/services/villages/background-work.js";
import { fixtureInterpretationChecks } from "./fixtures/villages-interpretation-payload.js";
import { createExchangeProcessing } from "../packages/villages/src/engine/packages/server/src/services/villages/exchange-processing.js";

/** Optional read-only replay uses private data in memory; neither Scene text nor identities are saved/output. */
async function inputs() {
  if (process.env.VILLAGES_CHECK_REPLAY_DATA) {
    const documents: any[] = [];
    for (const file of await readdir(process.env.VILLAGES_CHECK_REPLAY_DATA)) {
      if (!file.endsWith(".json")) continue;
      const rows = JSON.parse(await readFile(join(process.env.VILLAGES_CHECK_REPLAY_DATA, file), "utf8"));
      for (const row of rows)
        documents.push({ ...row, data: typeof row.data === "string" ? JSON.parse(row.data) : row.data });
    }
    const sceneId = process.env.VILLAGES_CHECK_REPLAY_SCENE;
    const scene = documents.find((row) => row.id === `villages-venue-visit-${sceneId}`)?.data;
    assert.ok(scene, "requested saved Scene exists");
    const state = structuredClone(
      documents.find((row) => row.id === "villages-village" && row.data.seed === scene.villageSeed)!.data,
    );
    const oldInputs = documents
      .filter((row) => row.kind === "background-work" && row.data.input?.sceneId === sceneId)
      .flatMap((row) => row.data.input.items ?? [row.data.input]);
    assert.ok(oldInputs.length > 0, "saved Wish definitions are available for a faithful replay");
    for (const resident of state.villagers) {
      const saved = oldInputs
        .filter((input) => input.proposal?.actorId === resident.characterId)
        .map((input) => input.wish);
      if (saved.length) resident.agenda.wishes = [...new Map(saved.map((wish) => [wish.id, wish])).values()];
    }
    state.exchangeReceipts = {};
    state.backgroundReceipts = {};
    return { state, scene: structuredClone(scene), saved: true };
  }
  const state = defaultVillageState(),
    at = new Date().toISOString();
  state.seed = "cost-replay";
  state.setupAt = state.foundedAt = at;
  const wishes = [
    "Establish a claim over the food court recognized by everyone",
    "Find a high vantage point inside the mall",
    "Draw a detailed map of the mall",
  ];
  state.villagers = ["a", "b", "c"].map((characterId, index) => ({
    characterId,
    cardSnapshot: { id: characterId, name: characterId, capturedAt: at, revision: 1, sourceStatus: "available" },
    completedWishes: [],
    agenda: {
      ...unwrittenVillageAgenda(state.venues, characterId),
      wishes: [{ id: characterId, wish: wishes[index], tell: "", intensity: 1, addedAt: at, expiresAt: "" }],
    },
  })) as any;
  state.venues = state.villagers.map((r) => ({
    id: `home-${r.characterId}`,
    name: `Home ${r.characterId}`,
    residentIds: [r.characterId],
    occupancy: { playerHome: false },
    zones: [
      { id: "exterior", kind: "exterior", name: "Exterior", venueClass: "residence" },
      { id: "hall", kind: "shared-residence", name: "Hall", venueClass: "residence" },
      {
        id: `private-${r.characterId}`,
        kind: "private-residence",
        ownerId: r.characterId,
        name: "Hidden space",
        venueClass: "residence",
      },
    ],
  })) as any;
  const scene: any = {
    id: "replay",
    villageSeed: state.seed,
    placeId: "mall",
    zoneId: "exterior",
    area: "outside",
    activeIds: ["a", "b", "c"],
    participants: state.villagers.map((r) => ({ characterId: r.characterId, name: r.characterId })),
    lines: [],
    submissions: [],
  };
  for (let i = 0; i < 6; i++) {
    const playerId = `player-${i}`,
      replies: string[] = [];
    scene.lines.push({
      id: playerId,
      role: "user",
      speakerId: "",
      name: "Player",
      content: "Let's plan a utility survey and divide tomorrow's work.",
      at,
      heardBy: scene.activeIds,
    });
    for (const actorId of scene.activeIds) {
      const id = `${actorId}-${i}`;
      replies.push(id);
      scene.lines.push({
        id,
        role: "assistant",
        speakerId: actorId,
        name: actorId,
        content: "We can survey the utilities tomorrow and make plans for the water supply.",
        kind: "dialogue",
        at,
        heardBy: scene.activeIds,
      });
    }
    scene.submissions.push({
      id: `turn-${i}`,
      mode: "chat",
      message: scene.lines.at(-4).content,
      at,
      replyLineIds: replies,
      activeIdsAtTurn: scene.activeIds,
      wishProposalError: "",
      wishProposals: state.villagers.map((r) => ({
        actorId: r.characterId,
        wishId: r.characterId,
        fingerprint: wishFingerprint(r.agenda!.wishes[0]),
        intent: "progress",
        lineIds: [playerId, `${r.characterId}-${i}`],
      })),
    });
  }
  return { state, scene, saved: false };
}
async function main() {
  const { state, scene, saved } = await inputs(),
    records = new Map<string, any>();
  records.set("villages-village", { id: "villages-village", kind: "village", data: state, revision: 1 });
  const totals = {
    room: { requests: 0, inputCharacters: 0, outputCharacters: 0, outputAllowance: 0 },
    wish: { requests: 0, inputCharacters: 0, outputCharacters: 0, outputAllowance: 0 },
  };
  const release = configureVillagesRuntime({
    persistence: {
      documents: {
        async getById(_p: string, id: string) {
          return structuredClone(records.get(id) ?? null);
        },
        async list(_p: string, kind: string) {
          return structuredClone([...records.values()].filter((r) => r.kind === kind));
        },
        async create(value: any) {
          const row = { ...structuredClone(value), revision: 1 };
          records.set(value.id, row);
          return row;
        },
        async update(value: any) {
          const row = { ...structuredClone(value), revision: (records.get(value.id)?.revision ?? 0) + 1 };
          records.set(value.id, row);
          return row;
        },
      },
    },
    async getAgentConfig() {
      return null;
    },
    logger: { debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} },
    languageModels: {
      async resolveForRequest() {
        return {
          model: "mock-replay",
          connectionId: "mock",
          maxOutputTokens: 5000,
          fitContext(messages: any, options: any) {
            return { messages, ...options };
          },
          async chatComplete(messages: any, options: any) {
            const checks = fixtureInterpretationChecks(messages[1].content),
              domain = checks[0].domain as "room" | "wish";
            const content = JSON.stringify({
              results: checks.map((check) => ({
                id: check.id,
                outcome: "none",
                evidenceIds: [],
                reason: "Planning does not establish the goal",
              })),
            });
            totals[domain].requests++;
            totals[domain].inputCharacters += messages.reduce((n: number, m: any) => n + m.content.length, 0);
            totals[domain].outputCharacters += content.length;
            totals[domain].outputAllowance += options.maxTokens;
            return { content };
          },
        };
      },
    },
  } as any);
  const previousFetch = globalThis.fetch;
  const previousNow = Date.now;
  if (saved) Date.now = () => Date.parse(scene.lines.at(-1).at);
  globalThis.fetch = async () => new Response("[]");
  try {
    const turns = scene.submissions.filter((turn: any) => turn.replyLineIds?.length);
    for (const [order, turn] of turns.entries()) {
      const start = scene.lines.findIndex((line: any) => line.id === turn.replyLineIds[0]);
      const end = scene.lines.findIndex((line: any) => line.id === turn.replyLineIds.at(-1));
      const snapshot = {
        ...scene,
        lines: scene.lines.slice(0, end + 1),
        activeIds: turn.activeIdsAtTurn ?? scene.activeIds,
      };
      turn.processing = createExchangeProcessing({
        seed: scene.villageSeed,
        sceneId: scene.id,
        submissionId: turn.id,
        order,
        lineIds: [
          ...(scene.lines[start - 1]?.role === "user" ? [scene.lines[start - 1].id] : []),
          ...turn.replyLineIds,
        ],
        actionReceiptIds: [],
      });
      for (const domain of ["projects", "memories", "relationships"] as const)
        turn.processing.domains[domain].status = "applied";
      snapshot.processingVersion = 1;
      records.set(`villages-venue-visit-${scene.id}`, {
        id: `villages-venue-visit-${scene.id}`,
        kind: "venue-visit",
        data: structuredClone(snapshot),
        revision: 1,
      });
      const draft = snapshot.lines.filter((line: any) => turn.replyLineIds.includes(line.id));
      await interpretRoomReply(
        { ...snapshot, lines: scene.lines.slice(0, Math.max(0, start - 1)) },
        state,
        turn.message ?? "",
        draft,
        turn.id,
        turn.heardPlayerBy ?? snapshot.activeIds,
      );
      await processWishExchange(snapshot, turn.id);
      await settleBackgroundWork();
    }
    assert.equal(totals.room.requests, 0, "this planning Scene contains no permission event");
    const estimates = Object.fromEntries(
      Object.entries(totals).map(([domain, t]) => [
        domain,
        {
          ...t,
          estimatedTokens: Math.ceil((t.inputCharacters + t.outputCharacters) / 4),
          estimatedCeiling: Math.ceil(t.inputCharacters / 4) + t.outputAllowance,
        },
      ]),
    );
    const combinedEstimate = (estimates.wish as any).estimatedTokens;
    assert.ok(combinedEstimate < 99472 * 0.1, "Wish replay exceeds 90% reduction against the reference ledger");
    assert.ok(
      (estimates.wish as any).estimatedCeiling < 99472 * 0.1,
      "full output allowance also stays below the 90% target in this replay",
    );
    console.log(
      JSON.stringify(
        {
          savedSceneReplay: saved,
          turns: turns.length,
          baseline: { roomTokens: 44597, wishTokens: 99472 },
          estimates,
          note: "Mocked replay; tokens are characters/4 estimates, ceilings include full output allowance. No live requests or quality measurement.",
        },
        null,
        2,
      ),
    );
  } finally {
    release();
    globalThis.fetch = previousFetch;
    Date.now = previousNow;
  }
}
void main();
