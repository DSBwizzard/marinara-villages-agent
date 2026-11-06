import assert from "node:assert/strict";
import { createSocialMail } from "../packages/villages/src/server/features/residents/social-mail-service.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { defaultRelationshipState } from "../packages/villages/src/server/domain/rules/relationship-rules.js";
import { sceneMemoryContext } from "../packages/villages/src/server/domain/rules/scene-memories.js";
import type { SocialMailInput } from "../packages/villages/src/server/domain/models/social-mail.js";

const at = "2026-11-05T20:00:00.000Z";
const state = defaultVillageState();
Object.assign(state, { seed: "gm-mail", setupAt: at, foundedAt: at, timeZone: "UTC" });
state.villagers = [
  {
    characterId: "ada",
    addedAt: at,
    ingestSchedule: false,
    wishes: [],
    cardSnapshot: {
      id: "ada",
      name: "Ada",
      description: "An independent gardener.",
      sourceStatus: "available",
      capturedAt: at,
      revision: 1,
      tags: [],
    },
  },
] as typeof state.villagers;
state.relationshipContext = defaultRelationshipState(state.seed);
const base: SocialMailInput = {
  seed: state.seed,
  threadId: "personal:ada",
  messageId: "letter",
  residentId: "ada",
  mode: "player",
  sourceText: "I appreciated your garden idea.",
  sourceAt: at,
  sourceHash: "saved-source",
  incarnation: at,
  admitted: state,
  sourceDelivered: false,
  systemMemory: sceneMemoryContext(state, ["ada", "player"], "garden"),
};
for (const gm of [false, true]) {
  const roles: string[] = [];
  const replyText = "Thank you. I liked sharing the idea with you.";
  const changes = [
    {
      fromId: "ada",
      toId: "player",
      expectedRevision: 0,
      reason: "Appreciated the letter",
      lineIds: ["letter"],
      sceneAfter: { connection: "Acquaintances", stance: "Feels heard", expectations: [], concerns: [], records: [] },
      liveAfter: { connection: "Acquaintances", stance: "Feels heard", expectations: [], concerns: [], records: [] },
    },
  ];
  const model = (role: string) => ({
    connectionId: role,
    model: "fixture",
    maxContext: 64000,
    maxOutputTokens: 4096,
    fitContext: (messages: unknown, options: object) => ({ messages, ...options }),
  });
  const service = createSocialMail({
    villagesConnectionIdFor: async (role: string) => role,
    villagesLanguageModels: () => ({
      resolveForRequest: async ({ connectionId }: { connectionId: string }) => model(connectionId),
    }),
    backgroundSetting: async (_key: string, work: () => unknown) => work(),
    completeWithRoom: async (
      selected: { connectionId: string },
      messages: { content: string }[],
      _tokens: number,
      options: { beforeBackgroundDispatch?: () => Promise<unknown> },
    ) => {
      await options.beforeBackgroundDispatch?.();
      roles.push(selected.connectionId);
      const combined = messages[0].content.includes("GM of Villages correspondence");
      if (selected.connectionId === "narration" && !combined)
        return { content: JSON.stringify({ text: replyText }), finishReason: "stop" };
      return {
        content: JSON.stringify({
          ...(combined ? { text: replyText } : {}),
          sourceReview: { changes, permissions: [], disclosures: [], intentions: [] },
          replyReview: { changes: [], permissions: [], disclosures: [], intentions: [] },
        }),
        finishReason: "stop",
      };
    },
  } as any);
  const input = { ...base, ...(gm ? { gmVersion: 1 as const } : {}) };
  const result = await service.handler.generate(input);
  assert.equal(result.replyText, replyText);
  assert.equal(result.source.changes[0].liveAfter.stance, "Feels heard");
  assert.deepEqual(result.reply.changes, []);
  assert.deepEqual(
    roles,
    gm ? ["narration"] : ["narration", "system"],
    "Saved legacy mail retains its purchased protocol; new mail uses one GM call",
  );
  assert.equal(
    state.relationshipContext.edges[JSON.stringify(["ada", "player"])],
    undefined,
    "Generation does not apply correspondence before delivery",
  );
}
console.log(
  "GM correspondence returns its reply and witnessed changes once; legacy mail keeps its original two-stage contract.",
);
