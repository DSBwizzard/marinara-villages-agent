import assert from "node:assert/strict";
import { configureVillagesRuntime } from "../packages/villages/src/engine/packages/server/src/services/villages/package-runtime.js";
import { proposeAgenda } from "../packages/villages/src/engine/packages/server/src/services/villages/village-bootstrap.js";
import {
  proposeRemap,
  remapBlockKeys,
} from "../packages/villages/src/engine/packages/server/src/services/villages/native-remap.js";
import { workingAgendaWeek } from "../packages/villages/src/engine/packages/server/src/services/villages/agenda-week.js";
import type { VillageVenue } from "../packages/villages/src/engine/packages/server/src/services/villages/types.js";

const venues = [
  {
    id: "square",
    name: "Village square",
    purpose: "meeting neighbors",
    occupancy: { playerHome: false, residentCharacterId: null },
    state: { condition: "well kept", publicFacts: [] },
  },
] as VillageVenue[];

let mode: "short" | "complete" | "translation" = "short";
let translationBatch = 0;
let maxOutputTokens = 900;
const blocks = Array.from({ length: 111 }, (_unused, index) => ({
  day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][Math.floor(index / 16)]!,
  time: `${String(index % 16).padStart(2, "0")}:00-${String((index % 16) + 1).padStart(2, "0")}:00`,
  activity: `task ${index}`,
  status: "online",
}));
const calls: { maxTokens: number; prompt: string }[] = [];
const release = configureVillagesRuntime({
  logger: { debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} },
  isDebugAgentsEnabled: () => false,
  getAgentConfig: async () => ({ connectionId: null }),
  persistence: { documents: { getById: async () => null } },
  languageModels: {
    async resolveForRequest() {
      return {
        model: "fixture",
        maxOutputTokens,
        fitContext(messages: unknown[], options: { maxTokens: number }) {
          return { messages, maxTokens: options.maxTokens };
        },
        async chatComplete(messages: { content: string }[], options: { maxTokens: number }) {
          const prompt = messages.map((message) => message.content).join("\n");
          calls.push({ maxTokens: options.maxTokens, prompt });
          if (mode === "short") {
            if (prompt.includes("Write one small, private wish"))
              return {
                content: JSON.stringify({
                  agenda: "An ordinary week",
                  wishes: [{ wish: "fresh flowers", intensity: 1, tell: "looks at flowers" }],
                }),
                finishReason: "stop",
              };
            return { content: "", finishReason: "length" };
          }
          if (mode === "complete") {
            if (prompt.includes("privately wishes for"))
              return {
                content: JSON.stringify({
                  agenda: "An ordinary week",
                  wishes: [{ wish: "a quiet walk", intensity: 1, tell: "lingers by the door" }],
                }),
                finishReason: "stop",
              };
            const match = prompt.match(/Write (\w+)'s (Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/);
            assert.ok(match);
            const [, name, weekday] = match;
            return {
              content: JSON.stringify({
                blocks: workingAgendaWeek(venues, name!)[weekday!].map((part) => ({
                  startMinute: part.startMinute,
                  endMinute: part.endMinute,
                  venue: 0,
                  activity: part.activity,
                  reason: part.reason,
                  status: part.status,
                })),
              }),
              finishReason: "stop",
            };
          }
          const slice = blocks.slice(translationBatch * 10, (translationBatch + 1) * 10);
          translationBatch += 1;
          return {
            content: JSON.stringify({
              agenda: "A busy week",
              moves: slice.map((block) => ({
                day: block.day,
                time: block.time,
                here: `doing ${block.activity}`,
                place: 1,
              })),
            }),
            finishReason: "stop",
          };
        },
      };
    },
  },
} as any);

async function main() {
  try {
    const context = {
      village: "Willowbrook",
      setting: "A small coastal village",
      venues,
      name: "Aqua",
      summary: "Enjoys walking",
      tags: [],
      personality: "Curious",
      description: "Keeps a small garden",
      routineSummary: "",
    };
    const recovered = await proposeAgenda(context);
    assert.equal(recovered.wishes.length, 1, "a short wish request rescues an empty profile response");
    assert.equal(recovered.personalizationPending, true);
    assert.match(recovered.personalizationFailure ?? "", /finish reason length; output limit 900 tokens/);
    assert.ok((recovered.week?.Monday?.length ?? 0) >= 15, "every failed day still has a rich fallback");
    assert.equal(
      calls.filter((call) => call.prompt.includes("as a village agenda")).length,
      2,
      "failures stop after two days",
    );

    mode = "complete";
    maxOutputTokens = 8_192;
    const complete = await proposeAgenda(context);
    assert.equal(complete.personalizationPending, false);
    assert.equal(complete.wishes[0]?.wish, "a quiet walk");
    assert.equal(Object.keys(complete.week ?? {}).length, 7);
    assert.ok(Object.values(complete.week ?? {}).every((day) => day.length >= 15));
    const secondResident = await proposeAgenda({ ...context, name: "Gidget", summary: "Keeps the village bar" });
    assert.equal(
      secondResident.personalizationPending,
      false,
      "a second resident receives a complete agenda independently",
    );
    assert.ok(Object.values(secondResident.week ?? {}).every((day) => day.length >= 15));
    assert.notDeepEqual(secondResident.week?.Monday, complete.week?.Monday);

    mode = "translation";
    translationBatch = 0;
    const { remap, failure } = await proposeRemap({
      village: "Willowbrook",
      setting: "A small coastal village",
      lore: [],
      completedWishes: [],
      loreKey: "",
      venues,
      wishes: [],
      name: "Aqua",
      summary: "",
      tags: [],
      description: "",
      weekStart: "2026-09-21",
      blocks,
    });
    assert.equal(failure, null);
    assert.equal(translationBatch, 12, "the complete 111-block week is translated in bounded batches");
    assert.equal(remap.moves.length, blocks.length);
    assert.equal(remapBlockKeys(blocks).length, blocks.length);
    assert.equal(remap.moves.at(-1)?.time, blocks.at(-1)?.time);
  } finally {
    release();
  }

  console.log("villages-generation-recovery: ok");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
