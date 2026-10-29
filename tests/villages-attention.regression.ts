import assert from "node:assert/strict";
import { mock } from "node:test";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { agendaDateKey } from "../packages/villages/src/server/domain/rules/agenda-week.js";
import {
  boundDecisionResult,
  decisionCandidates,
} from "../packages/villages/src/server/domain/rules/decision-candidates.js";
import { coerceInterpretationSettings } from "../packages/villages/src/server/domain/rules/interpretation-policy.js";
import { fingerprint } from "../packages/villages/src/server/domain/rules/interpretation-rules.js";
import { defaultRelationshipState } from "../packages/villages/src/server/domain/rules/relationship-rules.js";
import {
  attentionCheck,
  attentionClarificationChoices,
  attentionConversation,
  bindAttentionPlan,
  coercePendingAttention,
  directAttention,
  movedAttentionContacts,
  readAttentionPlan,
  validAttentionPlan,
} from "../packages/villages/src/server/domain/rules/scene-attention.js";
import { publicSceneResponse } from "../packages/villages/src/server/domain/rules/scene-public.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import { createInterpretation } from "../packages/villages/src/server/features/generation/interpretation-service.js";
import { activeVenueSession } from "../packages/villages/src/server/features/scenes/live-session.js";
import { readProjectTurnEvidence } from "../packages/villages/src/server/features/scenes/services.js";
import {
  continueVenueWithoutGreeting,
  discardVenueVisitDebug,
  enterVenue,
  moveVenueZone,
  sendVenueTurn as sendCurrentVenueTurn,
} from "../packages/villages/src/server/features/scenes/venue-session.js";
import { mutateVillageState } from "../packages/villages/src/server/features/world/village-store.js";
import { contactNeighborIds } from "../packages/villages/src/shared/helpers/zone-contact.js";
import { fixtureInterpretationChecks } from "./fixtures/villages-interpretation-payload.js";
import { fixtureVillageState, villageFixtureDocuments } from "./helpers/village-storage.fixture.js";
// Keep the scheduled cast on the seeded day; async timers remain real.
mock.timers.enable({ apis: ["Date"], now: Date.parse("2026-10-18T12:00:00.000Z") });

const stamp = new Date().toISOString();
const weekday = new Date().toLocaleDateString("en-US", { weekday: "long" });
const dateKey = agendaDateKey(new Date());
const state = defaultVillageState();
state.seed = "social-fixture";
state.seed = "attention-fixture";
state.foundedAt = state.setupAt = stamp;
state.visitMemoryBackfilled = true;
const house: any = {
  id: "house",
  name: "House",
  classes: ["community", "workplace"],
  description: "The outside.",
  category: "",
  spaces: [defaultVenueSpace("community"), defaultVenueSpace("workplace")],
  layoutVersion: 1,
  presentation: { image: null, x: 0.2, y: 0.3 },
  occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
  residentIds: [],
  workerIds: ["faraway"],
  improvements: [null, null],
  residenceCapacity: 1,
  capabilities: [],
  state: {
    revision: 0,
    recent: null,
    updatedAt: stamp,
  },
  zones: [
    { ...defaultVenueSpace("other"), id: "exterior", name: "Exterior", kind: "exterior", seen: true },
    { ...defaultVenueSpace("community"), id: "common", name: "Common Space", kind: "public", seen: true },
    { ...defaultVenueSpace("workplace"), id: "workshop", name: "Workshop", kind: "public", seen: true },
    { ...defaultVenueSpace("workplace", "SECRET OFFICE DETAILS"), id: "office", name: "Secret Office", kind: "staff" },
  ],
};
house.zones[0].description = "A pebble beside the house.";
state.venues = [house];
state.villagers = [
  ["local", "exterior"],
  ["listener", "common"],
  ["sibling", "workshop"],
  ["faraway", "office"],
].map(([id, zoneId]) => {
  const block = {
    startMinute: 0,
    endMinute: 1440,
    venueId: "house",
    zoneId,
    activity: "Reading",
    reason: "Routine",
    status: "online",
  };
  return {
    characterId: id,
    cardSnapshot: {
      id,
      name: id,
      revision: 1,
      sourceStatus: "available",
      capturedAt: stamp,
      comment: "",
      summary: "",
      tags: [],
      description: "",
      personality: "",
      systemPrompt: "",
      scenario: "",
      backstory: "",
      appearance: "",
      exampleDialogue: "",
    },
    addedAt: stamp,
    wishes: [],
    remap: null,
    ingestSchedule: false,
    agenda: {
      routineSummary: "",
      day: [block],
      week: { [weekday]: [block] },
      activeDay: { dateKey, weekday, blocks: [block], scheduleInformed: false },
      source: "village",
      generatedAt: stamp,
    },
  } as any;
});
const records = new Map<string, any>([
  ["villages-village", { id: "villages-village", kind: "village", data: coerceVillageState(state), revision: 1 }],
]);
const counts = { attention: 0, scene: 0, other: 0 };
const prompts: { system: string; input: string; options: any }[] = [];
let behavior = "answer";
let refuseSceneContext = false;
let failNextTurnSave = false;
let failCheckpointStage: string | undefined;
let failCompletedSceneResult = false;
const release = configureVillagesRuntime({
  logger: { debug() {}, info() {}, warn() {}, error() {} },
  isDebugAgentsEnabled: () => true,
  getAgentConfig: async () => ({ connectionId: "fixture" }),
  resources: {
    async listCharacters() {
      return [];
    },
  },
  persistence: {
    documents: villageFixtureDocuments({
      async getById(_package: string, id: string) {
        if (id.startsWith("villages-relationships-") && !records.has(id)) {
          const world = records.get("villages-village").data,
            social = defaultRelationshipState(world.seed);
          social.reviewedActorIds = world.villagers.map((person: any) => person.characterId);
          records.set(id, { id, kind: "relationships", data: social, revision: 1 });
        }
        if (id.startsWith("villages-relationships-") && records.has(id))
          records.get(id).data.reviewedActorIds = records
            .get("villages-village")
            .data.villagers.map((row: any) => row.characterId);
        return records.get(id) ?? null;
      },
      async list(_package: string, kind: string) {
        return [...records.values()].filter((row) => row.kind === kind);
      },
      async create(input: any) {
        // This fixture preserves pre-System Scene admissions; v2 is covered by semantic/packaged suites.
        if (input.id.startsWith("villages-venue-visit-")) delete input.data.semanticVersion;
        const row = { ...input, revision: 1 };
        records.set(input.id, row);
        return row;
      },
      async update(input: any) {
        if (
          failCheckpointStage &&
          input.id.startsWith("villages-venue-visit-") &&
          Object.hasOwn(input.data.operation?.checkpoints ?? {}, failCheckpointStage)
        ) {
          failCheckpointStage = undefined;
          throw new Error("Synthetic intermediate checkpoint interruption");
        }
        if (
          failCompletedSceneResult &&
          Object.entries(input.data.operation?.attempts ?? {}).some(
            ([stage, attempt]: any) => stage.startsWith("turn-reply:") && attempt.status === "complete",
          )
        ) {
          failCompletedSceneResult = false;
          throw new Error("Synthetic completed Scene result interruption");
        }
        if (failNextTurnSave && input.data.submissions?.some((turn: any) => turn.id === "save-failure")) {
          failNextTurnSave = false;
          throw new Error("Synthetic interrupted save");
        }
        const prior = records.get(input.id);
        if (!prior || prior.revision !== input.expectedRevision) return null;
        const row = { ...prior, ...input, revision: prior.revision + 1 };
        records.set(input.id, row);
        return row;
      },
      async remove(_package: string, id: string) {
        return records.delete(id);
      },
    }),
  },
  languageModels: {
    async resolveForRequest() {
      return {
        model: "fixture",
        maxOutputTokens: 4096,
        fitContext(messages: any[], options: any) {
          return {
            messages:
              refuseSceneContext && messages[0]?.content.includes("ACTION-BASED SOUND") ? messages.slice(1) : messages,
            ...options,
          };
        },
        async chatComplete(messages: any[], options: any) {
          const system = String(messages[0]?.content),
            input = String(messages.at(-1)?.content);
          prompts.push({ system, input, options });
          if (system.startsWith("Interpret nearby attention")) {
            counts.attention++;
            const check = fixtureInterpretationChecks(input)[0];
            const message = check.evidence.find((line: any) => line.id === "player-input").content;
            const start = message.indexOf("I throw");
            let result: any = message.startsWith('"City is looking')
              ? {
                  outcome: "attention",
                  details: {
                    fragments: [...message.matchAll(/"([^"]+)"/gu)].map((match) => ({
                      start: match.index! + 1,
                      end: match.index! + 1 + match[1].length,
                      kind: "speech",
                      reach: "directed",
                      zoneIds: ["common"],
                    })),
                  },
                }
              : message.includes("explosion")
                ? { outcome: "broadcast" }
                : start >= 0
                  ? check.outcomes.some((option: any) => option.id === "attention")
                    ? {
                        outcome: "attention",
                        details: {
                          fragments: [
                            { start, end: message.length, kind: "sound", reach: "directed", zoneIds: ["common"] },
                          ],
                        },
                      }
                    : { outcome: "sound:common" }
                  : { outcome: "local" };
            if (message === "What's up fedster") {
              assert.equal(check.facts.conversationTarget?.speakerId, "listener");
              assert.equal(check.facts.conversationTarget?.zoneId, "common");
              assert(
                check.outcomes.some(
                  (outcome: any) => outcome.id === "continue-exchange" || outcome.id === "ordinary-outward",
                ),
              );
              result = { outcome: "continue-exchange" };
            }
            if (check.facts.sourceReferences && message.startsWith("I call through the Common Space doorway:")) {
              result = {
                outcome: "attention",
                details: {
                  fragments: [
                    {
                      source: { text: "Buster, can you hear me?", occurrence: 0 },
                      kind: "speech",
                      reach: "directed",
                      zoneIds: ["common"],
                    },
                  ],
                },
              };
            }
            if (check.facts.sourceReferences && message === "Yes, I wanted to ask about tourism. I adjust my sleeve.") {
              result = {
                outcome: "attention",
                details: {
                  fragments: [
                    {
                      source: { text: "Yes, I wanted to ask about tourism.", occurrence: 0 },
                      kind: "speech",
                      reach: "directed",
                      zoneIds: ["common"],
                    },
                  ],
                },
              };
            }
            if (check.facts.sourceReferences && message.startsWith("I shout toward the Common Space doorway:")) {
              result = {
                outcome: "attention",
                details: {
                  fragments: [
                    {
                      source: { text: "Can everyone nearby hear me?", occurrence: 0 },
                      kind: "speech",
                      reach: "broadcast",
                      deliverySource: { text: "I shout toward the Common Space doorway", occurrence: 0 },
                      zoneIds: ["common", "workshop"],
                    },
                  ],
                },
              };
            }
            if (check.facts.sourceReferences && message.startsWith("I call through the doorway: broken extraction"))
              result = {
                outcome: "attention",
                details: {
                  fragments: [{ kind: "speech", reach: "directed", zoneIds: ["common"], source: { quoteId: "q99" } }],
                },
              };
            if (check.facts.schema === 5) {
              if (check.facts.contact && message.includes("Hello!"))
                result = {
                  outcome: "attention",
                  details: {
                    fragments: [{ source: { quoteId: "q0" }, kind: "speech", delivery: "call", outward: true }],
                  },
                };
              if (result.outcome === "continue-exchange") result = { outcome: "ordinary-outward" };
              if (result.outcome === "broadcast") result = { outcome: "exceptional" };
              if (result.outcome.startsWith("sound:"))
                result = {
                  outcome: "attention",
                  details: {
                    fragments: [
                      { source: { text: message, occurrence: 0 }, kind: "sound", delivery: "call", outward: true },
                    ],
                  },
                };
              if (result.details?.fragments)
                for (const fragment of result.details.fragments) {
                  fragment.delivery =
                    check.facts.contact?.kind === "call"
                      ? "call"
                      : message.includes("shout")
                        ? "shout"
                        : fragment.kind === "sound"
                          ? "call"
                          : "ordinary";
                  fragment.outward = true;
                }
            }
            if (check.facts.sourceReferences && result.details?.fragments) {
              result.details.fragments = result.details.fragments.map(({ start, end, ...fragment }: any) =>
                fragment.source
                  ? fragment
                  : {
                      ...fragment,
                      source: { text: message.slice(start, end), occurrence: 0 },
                    },
              );
            }
            return {
              content: JSON.stringify({
                results: [
                  { id: check.id, evidenceIds: ["player-input"], reason: "Synthetic labeled input", ...result },
                ],
              }),
              finishReason: "stop",
            };
          }
          if (system.startsWith("Interpret the meaning")) {
            counts.other++;
            const checks = fixtureInterpretationChecks(input);
            return {
              content: JSON.stringify({
                results: checks.map((check: any) => ({
                  id: check.id,
                  outcome: behavior === "invite" && check.facts.zoneId === "common" ? "invite-now" : "none",
                  evidenceIds: check.evidence
                    .filter((line: any) => line.current && line.speakerId === "listener")
                    .map((line: any) => line.id),
                  reason: "Synthetic witnessed permission",
                })),
              }),
              finishReason: "stop",
            };
          }
          counts.scene++;
          const result: any = {
            heardPlayerBy: ["local"],
            memoryChanges: [],
            relationshipChanges: { changes: [], permissions: [], disclosures: [] },
            wishChanges: [],
            segments: [{ kind: "narration", text: "A quiet moment.", heardBy: ["local"] }],
          };
          if (system.includes("NATURAL ATTENTION") || system.includes("ACTION-BASED SOUND")) {
            const fragments = JSON.parse(
              system.includes("ACTION-BASED SOUND")
                ? system.match(/Fragments: ([^\n]+)/)![1]
                : system.match(/Fragments: ([^\n]+)\.\nReturn attentionWitnesses/)![1],
            );
            result.segments[0].text =
              behavior === "failed"
                ? "The stone falls softly into the grass, missing the window."
                : "A knock or sharp impact sounds at the boundary.";
            result.attentionWitnesses = fragments.map((fragment: any) => ({
              id: fragment.id,
              emitted: behavior !== "failed",
              heardBy: behavior === "failed" ? [] : fragment.possibleListeners,
              ...(system.includes("ACTION-BASED SOUND")
                ? {
                    understoodBy:
                      behavior === "failed" || fragment.kind === "sound" ? [] : fragment.possibleWordListeners,
                  }
                : {}),
              segment: 0,
            }));
            if (
              behavior !== "failed" &&
              fragments.some((fragment: any) => fragment.possibleListeners.includes("listener"))
            )
              result.segments.push({
                kind: "dialogue",
                speakerId: "listener",
                text:
                  behavior === "step-out"
                    ? "Nice to meet you out here."
                    : behavior === "invite"
                      ? "Come into our Common Space now."
                      : input.includes("tourism") && input.includes("adjust my sleeve")
                        ? "Tell me your tourism proposal."
                        : input.includes("Can everyone nearby hear me?")
                          ? "Yes, your voice is carrying clearly."
                          : input.includes("What\'s up fedster")
                            ? "I am doing well today."
                            : input.includes("Thank you")
                              ? "I'm listening."
                              : "What was that?",
                heardBy: ["local", "listener", "sibling"],
              });
            if (behavior === "private-memory")
              result.memoryChanges = [
                {
                  kind: "passing",
                  text: "The listener knows the PRIVATE SECRET.",
                  category: "personal-fact",
                  subjectCharacterIds: ["listener"],
                  knownByCharacterIds: ["listener"],
                  evidence: ["player"],
                },
              ];
            if (behavior === "fragment-memory")
              result.memoryChanges = [
                {
                  kind: "passing",
                  text: "LBP introduced themselves and discussed growth and tourism with the listener.",
                  category: "shared-experience",
                  subjectCharacterIds: ["listener"],
                  knownByCharacterIds: ["listener"],
                  evidence: fragments
                    .filter((fragment: any) => fragment.kind === "speech")
                    .map((fragment: any) => fragment.id),
                },
              ];
            if (behavior === "malformed-witness") result.attentionWitnesses[0].heardBy = ["faraway"];
            if (behavior === "whisper")
              result.segments.push({
                kind: "whisper",
                speakerId: "local",
                targetId: "player",
                text: "ANOTHER PRIVATE SECRET",
                heardBy: ["local", "listener"],
              });
            if (behavior === "remote-handoff") {
              result.segments.push({ kind: "narration", text: "The pebble is picked up.", heardBy: ["local"] });
              result.placeUpdate = {
                happened: true,
                segment: result.segments.length - 1,
                actorIds: [behavior === "pickup" ? "player" : "listener"],
                narration: "The pebble is picked up.",
                expectedRevision: 0,
                recent: { text: "The pebble has been picked up." },
              };
            }
            if (behavior === "step-out") {
              result.segments[0].text = "listener steps out into the Exterior, still wearing a t-shirt and sweats.";
              result.contactMoves = [
                { characterId: "listener", zoneId: "exterior", segment: 0, quote: result.segments[0].text },
              ];
            }
          }
          if (behavior === "return-inside") {
            result.heardPlayerBy = ["local", "listener"];
            result.segments = [
              {
                kind: "dialogue",
                speakerId: "listener",
                text: "I am heading back inside.",
                heardBy: ["local", "listener"],
              },
              { kind: "narration", text: "listener steps back into the Common Space.", heardBy: ["local", "listener"] },
              { kind: "narration", text: "You adjust your sleeve outside.", heardBy: ["local", "listener"] },
            ];
            result.contactMoves = [
              { characterId: "listener", zoneId: "common", segment: 1, quote: result.segments[1].text },
            ];
          }
          if (system.includes("ACTION-BASED SOUND")) {
            if (behavior === "local-end") {
              result.segments = [
                {
                  kind: "dialogue",
                  speakerId: "local",
                  text: "Goodbye, our conversation is over.",
                  heardBy: ["local"],
                },
              ];
              result.sceneEnded = { speakerId: "local", quote: result.segments[0].text };
            }
            const current =
              [...records.values()].find((row) => row.kind === "venue-visit" && row.data?.status === "active")?.data ??
              [...records.values()].find(
                (row) => row.id.startsWith("villages-venue-visit-") && row.data?.status === "active",
              )?.data;
            const position = (id: string, index: number) =>
              result.contactMoves?.find((move: any) => move.characterId === id && move.segment <= index)?.zoneId ??
              current?.accompanying?.find((entry: any) => entry.characterId === id)?.zoneId ??
              current?.sceneAttendance?.occupants.find((entry: any) => entry.characterId === id)?.zoneId;
            result.recap = "PRIVATE OFFSCREEN SECRET";
            result.acousticReplies = result.segments.flatMap((line: any, index: number) => {
              if (line.kind !== "dialogue") return [];
              const origin = position(line.speakerId, index);
              const neighbors = contactNeighborIds(house.zones, origin);
              const ids = ["local", "listener", "sibling", "faraway"].filter((id) => {
                const to = position(id, index);
                return to === origin || neighbors.includes(to);
              });
              const player = current?.zoneId === origin || neighbors.includes(current?.zoneId);
              return [
                {
                  segment: index,
                  delivery: "ordinary",
                  outward: true,
                  heardBy: ids,
                  understoodBy: ids,
                  playerHeard: player,
                  playerUnderstood: player,
                },
              ];
            });
          }
          return { content: JSON.stringify(result), finishReason: "stop" };
        },
      };
    },
  },
} as Parameters<typeof configureVillagesRuntime>[0]);

// These scenarios qualify recovery of the saved scope-5 acoustic contract.
// Current scope-6 behavior is covered by zone-events and packaged suites.
async function sendVenueTurn(input: Parameters<typeof sendCurrentVenueTurn>[0]) {
  const row = records.get("villages-venue-visit-" + input.sessionId);
  const scene = row?.data;
  if (
    scene &&
    (!scene.operation || scene.operation.status === "complete") &&
    scene.operation?.id !== input.submissionId
  ) {
    scene.operation = {
      id: input.submissionId,
      kind: "turn",
      status: "complete",
      input: {
        message: input.message,
        mode: input.mode,
        targetId: input.targetId,
        ...(input.contact ? { contact: input.contact } : {}),
        ...(input.attentionChoice ? { attentionChoice: input.attentionChoice } : {}),
        interactionScopeVersion: 5,
      },
      token: "fixture-admission",
      attemptId: "fixture-admission",
      stage: "admission",
      startedAt: new Date().toISOString(),
      sceneRevision: scene.sceneRevision,
      snapshot: null,
      checkpoints: {},
      attempts: {},
      error: "",
    };
  }
  return sendCurrentVenueTurn(input);
}

async function open() {
  const entered = await enterVenue("house", undefined, "", "outside");
  return continueVenueWithoutGreeting(entered.id);
}
async function send(
  scene: any,
  id: string,
  message: string,
  attentionChoice?: { id: string; zoneId: string },
  retryOfAttemptId?: string,
) {
  return sendVenueTurn({
    sessionId: scene.id,
    submissionId: id,
    message,
    mode: "chat",
    targetId: "",
    expectedSceneRevision: scene.sceneRevision,
    attentionChoice,
    retryOfAttemptId,
  });
}
try {
  assert.deepEqual(coerceInterpretationSettings(null), { decisionsEnabled: false });
  assert.deepEqual(
    coerceInterpretationSettings({ compareSystem: true }),
    { decisionsEnabled: false },
    "legacy comparison choices cannot dispatch requests",
  );
  const routeScene: any = {
    zoneId: "exterior",
    activeIds: ["local"],
    departedIds: [],
    participants: [{ characterId: "listener", name: "Feddy Fastbayer" }],
    sceneAttendance: { occupants: [{ characterId: "listener", zoneId: "common" }] },
    doorwayContacts: [{ characterId: "listener", playerZoneId: "exterior", characterZoneId: "common" }],
    lines: [
      { role: "user", content: "Hello" },
      { role: "assistant", kind: "dialogue", speakerId: "listener", content: "Come in!" },
    ],
  };
  assert.equal(attentionConversation(house, routeScene)?.speakerId, "listener");
  assert.equal(directAttention('"Yes."', house, routeScene, true)?.status, "attention");
  const localReply = {
    ...routeScene,
    lines: [
      ...routeScene.lines,
      { role: "assistant", kind: "dialogue", speakerId: "local", content: "What do you think?" },
    ],
  };
  assert.equal(
    directAttention('"Yes."', house, localReply, true),
    null,
    "a newer local responder prevents the quoted shortcut from sending remotely",
  );
  const twoRoutes = {
    ...routeScene,
    participants: [...routeScene.participants, { characterId: "sibling", name: "Sibling" }],
    sceneAttendance: {
      occupants: [...routeScene.sceneAttendance.occupants, { characterId: "sibling", zoneId: "workshop" }],
    },
    doorwayContacts: [
      ...routeScene.doorwayContacts,
      { characterId: "sibling", playerZoneId: "exterior", characterZoneId: "workshop" },
    ],
  };
  assert.equal(
    directAttention('"Sibling, are you there?"', house, twoRoutes, true),
    null,
    "explicitly addressing another remote speaker bypasses the conversational shortcut",
  );
  assert.equal(
    attentionConversation(house, {
      ...twoRoutes,
      lines: [...twoRoutes.lines, { role: "assistant", kind: "dialogue", speakerId: "sibling", content: "Hello too." }],
    }),
    undefined,
    "multiple responders cannot establish an arbitrary conversational default",
  );
  const oldPlan: any = {
    status: "clarify",
    question: "Which door?",
    fragments: [{ id: "attention:0", start: 0, end: 1, kind: "speech", reach: "directed", zoneIds: [] }],
  };

  assert.equal(
    attentionCheck("What's up fedster", house, routeScene, true).facts.conversationTarget,
    undefined,
    "legacy purchased scope keeps its check shape",
  );
  assert.equal(attentionClarificationChoices(house, routeScene)[0].label, "Feddy Fastbayer · Common Space");
  const remoteMessage = "What's up fedster";
  const oldCheck = attentionCheck(remoteMessage, house, routeScene, false, true, false);
  oldPlan.validation = {
    version: 2,
    fingerprint: fingerprint([
      {
        ...oldCheck,
        facts: {
          context: oldCheck.facts,
          history: routeScene.lines.slice(-2).map((line: any) => ({
            id: line.id,
            content: line.content,
            speaker: line.speakerId,
            role: line.role,
            kind: line.kind,
          })),
          localRecipients: [],
          plan: { status: oldPlan.status, fragments: oldPlan.fragments, question: oldPlan.question },
        },
      },
    ]),
  };
  assert(
    validAttentionPlan(oldPlan, remoteMessage, house, routeScene),
    "signed older scope4 clarification remains usable",
  );
  assert(!validAttentionPlan(oldPlan, remoteMessage + " changed", house, routeScene));
  assert(!validAttentionPlan(oldPlan, remoteMessage, house, { ...routeScene, zoneId: "common" }));
  const continuation: any = { source: "system", outcome: "continue-exchange", evidenceIds: ["player-input"] };
  assert.equal(readAttentionPlan(continuation, remoteMessage, house, routeScene, true).status, "attention");
  assert.equal(
    readAttentionPlan(continuation, "I think privately and wave.", house, routeScene, true).status,
    "clarify",
  );
  for (const changed of [
    { ...routeScene, departedIds: ["listener"] },
    { ...routeScene, doorwayContacts: [] },
    {
      ...routeScene,
      lines: [
        ...routeScene.lines,
        { role: "assistant", kind: "dialogue", speakerId: "local", content: "Hello locally." },
      ],
    },
    { ...routeScene, lines: routeScene.lines.map((line: any) => ({ ...line, contactHidden: true })) },
    { ...routeScene, accompanying: [{ characterId: "listener", zoneId: "office" }] },
  ]) {
    assert.equal(attentionConversation(house, changed), undefined);
    assert.equal(readAttentionPlan(continuation, remoteMessage, house, changed, true).status, "clarify");
  }
  assert.deepEqual(movedAttentionContacts(house, routeScene, { ...routeScene, zoneId: "common" }), []);
  assert.deepEqual(movedAttentionContacts(house, routeScene, { ...routeScene, zoneId: "workshop" }), []);
  const hiddenChoice = {
    ...routeScene,
    lines: routeScene.lines.map((line: any) => ({ ...line, contactReport: true })),
  };
  assert.equal(attentionClarificationChoices(house, hiddenChoice)[0].label, "Common Space");
  const oldPending: any = {
    id: "old",
    message: "I knock.",
    revision: 1,
    originZoneId: "exterior",
    plan: {
      status: "clarify",
      question: "Which door?",
      fragments: [{ id: "attention:0", start: 0, end: 8, kind: "sound", reach: "directed", zoneIds: [] }],
    },
    choices: [{ id: "common", label: "Common Space" }],
  };
  assert.equal(coercePendingAttention(oldPending)?.plan.question, "Which door?", "decode preserves signed question");
  assert.equal(
    (publicSceneResponse({ ...routeScene, sceneRevision: 1, submissions: [], pendingAttention: oldPending }) as any)
      .attentionClarification.question,
    "The system wasn’t sure which space you meant.",
  );
  let scene = await open();
  const before = { ...counts };
  const clarified = await send(scene, "knock-ambiguous", "I knock.");
  assert.deepEqual(counts, before, "ambiguous standalone knock asks without paid requests");
  assert.equal(clarified.session.submissions.length, 0);
  const visible: any = publicSceneResponse(clarified.session);
  assert.equal(visible.attentionClarification.question, "Which surface or space are you knocking on?");
  assert.deepEqual(
    visible.attentionClarification.choices.map((choice: any) => choice.id),
    ["common", "workshop"],
  );
  assert.ok(!JSON.stringify(visible).includes("faraway"));
  assert.ok(!JSON.stringify(visible).includes("pendingAttention"));
  await send(clarified.session, "clarification-replay", "I knock.");
  assert.deepEqual(counts, before, "repeated clarification reuses its plan");
  const pending = await activeVenueSession();
  const answered = await send(pending, "knock-chosen", "I knock.", { id: "clarification-replay", zoneId: "common" });
  assert.equal(counts.scene, before.scene + 1);
  assert.equal(counts.attention, before.attention);
  assert.equal(answered.session.zoneId, "exterior");
  assert.ok(answered.session.lines.some((line) => line.speakerId === "listener" && line.viaDoorway));
  assert.ok(!answered.session.activeIds.includes("listener"));
  const afterAnswer = { ...counts };
  const follow = await send(answered.session, "follow-up", '"Thank you, I wanted to speak with you."');
  assert.equal(counts.scene, afterAnswer.scene + 1);
  assert.equal(counts.attention, afterAnswer.attention);
  const audio = follow.session.lines.filter((line) => line.attentionEvidence && line.role === "user");
  assert.ok(
    audio.some(
      (line) => line.content === "Thank you, I wanted to speak with you." && line.heardBy.includes("listener"),
    ),
  );
  const plainBefore = { ...counts };
  const plain = await send(follow.session, "plain-follow-up", "What's up fedster");
  assert.equal(plain.session.pendingAttention, undefined);
  assert(!plain.session.recap?.includes("PRIVATE OFFSCREEN SECRET"), "raw model recap cannot expose offscreen speech");
  assert.equal(counts.attention, plainBefore.attention + 1);
  assert.equal(counts.scene, plainBefore.scene + 1);
  assert(
    plain.session.lines.some(
      (line) => line.attentionEvidence && line.content === "What's up fedster" && line.heardBy.includes("listener"),
    ),
  );
  const plainReplay = { ...counts };
  await send(plain.session, "plain-follow-up", "What's up fedster");
  assert.deepEqual(counts, plainReplay, "plain continuation replay spends nothing");
  // Use the latest scene revision for the subsequent existing scenarios.
  follow.session = plain.session;
  const replayBefore = { ...counts };
  await send(follow.session, "follow-up", '"Thank you, I wanted to speak with you."');
  assert.deepEqual(counts, replayBefore);
  behavior = "fragment-memory";
  const introduced = await send(
    follow.session,
    "fragment-memory",
    '"City is looking to start some new growth, or at least some interesting new ideas to ramp up tourism." I offer my hand. "Nice to meet you, I am LBP."',
  );
  assert.equal(
    introduced.session.submissions.at(-1)?.processing?.domains.memories.status,
    "rejected",
    "Narration-only memory metadata cannot bypass the current System screening contract",
  );
  const introducedEvidence = introduced.session.lines.filter((line) => line.attentionEvidence && line.role === "user");
  assert.ok(introducedEvidence.some((line) => line.content === "Nice to meet you, I am LBP."));
  assert.ok(!introducedEvidence.some((line) => line.content.includes("offer my hand")));
  behavior = "step-out";
  const joined = await send(introduced.session, "step-out", '"Nice to meet you."');
  assert.ok(joined.session.activeIds.includes("listener"));
  assert.ok(!joined.session.doorwayContacts?.some((contact) => contact.characterId === "listener"));
  const joinedLines = joined.session.lines.filter((line) =>
    joined.session.submissions.at(-1)?.replyLineIds?.includes(line.id),
  );
  assert.deepEqual(joinedLines.find((line) => line.kind === "narration" && !line.contactHidden)?.physicalIdsAfter, [
    "local",
    "listener",
  ]);
  assert.equal(joinedLines.find((line) => line.speakerId === "listener")?.viaDoorway, undefined);
  assert.ok((await activeVenueSession())?.activeIds.includes("listener"), "arrival survives repository reload");
  behavior = "return-inside";
  const returned = await send(joined.session, "return-inside", "Thanks for coming out.");
  assert.ok(
    prompts.some(
      (prompt) =>
        prompt.system.includes("Player-visible narration continuity") && prompt.system.includes("t-shirt and sweats"),
    ),
  );
  assert.ok(!returned.session.activeIds.includes("listener"));
  assert.equal(returned.session.status, "active");
  assert.deepEqual(returned.session.lines.find((line) => line.content === "You adjust your sleeve outside.")?.heardBy, [
    "local",
  ]);
  const afterMovement = { ...counts };
  await send(returned.session, "return-inside", "Thanks for coming out.");
  assert.deepEqual(counts, afterMovement, "replay never repeats resident movement or buys a new response");
  await discardVenueVisitDebug(returned.session.id);
  behavior = "answer";

  scene = await open();
  const naturalBefore = { ...counts };
  const unquoted = await send(
    scene,
    "natural-unquoted",
    "I call through the Common Space doorway: Buster, can you hear me?",
  );
  assert.equal(counts.attention - naturalBefore.attention, 1);
  assert.equal(counts.scene - naturalBefore.scene, 1);
  assert.equal(unquoted.session.operation?.input.interactionScopeVersion, 5);
  const beforeContext = { ...counts };
  const contextual = await send(
    unquoted.session,
    "natural-contextual",
    "Yes, I wanted to ask about tourism. I adjust my sleeve.",
  );
  assert.equal(counts.attention - beforeContext.attention, 1);
  assert.equal(counts.scene - beforeContext.scene, 1);
  const contextualEvidence = contextual.session.lines.filter((line) => line.attentionEvidence);
  assert(contextualEvidence.some((line) => line.content === "Yes, I wanted to ask about tourism."));
  assert(!contextualEvidence.some((line) => line.content.includes("adjust my sleeve")));
  const beforeShout = { ...counts };
  const shouted = await send(
    contextual.session,
    "natural-shout",
    "I shout toward the Common Space doorway: Can everyone nearby hear me?",
  );
  assert.equal(counts.attention - beforeShout.attention, 1);
  assert.equal(counts.scene - beforeShout.scene, 1, "multiple remote Zones do not multiply generation requests");
  assert(
    shouted.session.lines.some(
      (line) =>
        line.attentionEvidence &&
        line.content === "Can everyone nearby hear me?" &&
        line.heardBy.includes("listener") &&
        line.heardBy.includes("sibling"),
    ),
  );
  assert(
    !shouted.session.lines.some(
      (line) => line.attentionEvidence && line.kind === "dialogue" && line.heardBy.includes("faraway"),
    ),
  );
  const afterShout = { ...counts };
  await send(shouted.session, "natural-shout", "I shout toward the Common Space doorway: Can everyone nearby hear me?");
  assert.deepEqual(counts, afterShout, "replay reuses completed routing and generation");
  await discardVenueVisitDebug(shouted.session.id);

  scene = await open();
  const established = await send(scene, "move-contact", "I knock.", undefined);
  const contactPending = await activeVenueSession();
  const across = await send(contactPending, "move-door-choice", "I knock.", {
    id: established.session.pendingAttention!.id,
    zoneId: "common",
  });
  const movementBefore = { ...counts };
  const inside = await moveVenueZone(across.session.id, "common", across.session.sceneRevision);
  assert.equal(attentionConversation(house, inside), undefined, "same-space speaker is local");
  assert(!inside.doorwayContacts?.some((entry) => entry.characterId === "listener"));
  const outside = await moveVenueZone(inside.id, "exterior", inside.sceneRevision);
  assert.equal(
    attentionConversation(house, outside)?.speakerId,
    "listener",
    "walking away retains a witnessed speaker only while adjacent",
  );
  assert.deepEqual(counts, movementBefore, "navigation buys no model requests");
  const afterMove = await send(outside, "plain-after-move", "What's up fedster");
  assert.equal(afterMove.session.pendingAttention, undefined);
  assert(
    afterMove.session.lines.some(
      (line) => line.attentionEvidence && line.content === "What's up fedster" && line.heardBy.includes("listener"),
    ),
  );
  const unreachable = await moveVenueZone(afterMove.session.id, "workshop", afterMove.session.sceneRevision);
  assert.equal(attentionConversation(house, unreachable), undefined, "unreachable speaker cannot continue");
  assert(!unreachable.doorwayContacts?.some((entry) => entry.characterId === "listener"));
  await discardVenueVisitDebug(unreachable.id);

  scene = await open();
  const brokenBefore = { ...counts };
  const broken = await send(scene, "broken-extraction", "I call through the doorway: broken extraction");
  assert.equal(counts.attention - brokenBefore.attention, 1);
  assert.equal(counts.scene - brokenBefore.scene, 0);
  assert(/identify|interpreted/.test(broken.session.pendingAttention?.plan.question ?? ""));
  const beforeUnchanged = { ...counts };
  await send(broken.session, "unchanged-extraction", "I call through the doorway: broken extraction");
  assert.deepEqual(
    counts,
    beforeUnchanged,
    "same unresolved draft does not repurchase routing under a new submission ID",
  );
  await discardVenueVisitDebug(broken.session.id);

  for (const variant of ["unbound", "changed-input"] as const) {
    scene = await open();
    const message = "I throw a rock at the window.";
    const plan = {
      status: "attention" as const,
      fragments: [
        {
          id: "attention:0",
          start: 0,
          end: message.length,
          kind: "sound" as const,
          reach: "directed" as const,
          zoneIds: ["common"],
        },
      ],
    };
    const cooked = variant === "unbound" ? plan : bindAttentionPlan(plan, "A different input", house, scene);
    const row = records.get(`villages-venue-visit-${scene.id}`);
    row.data.operation = {
      ...row.data.operation,
      id: "legacy-plan",
      kind: "turn",
      status: "interrupted",
      attemptId: "legacy-plan-attempt",
      sceneRevision: scene.sceneRevision,
      input: { message, mode: "chat", targetId: "", interactionScopeVersion: 2 },
      snapshot: null,
      checkpoints: { "attention-plan": cooked },
      attempts: {},
    };
    const beforeHeld = { ...counts };
    const heldPlan = await send(scene, "legacy-plan", message, undefined, "legacy-plan-attempt");
    assert.deepEqual(counts, beforeHeld, "unverifiable cooked plans never repurchase or dispatch a Scene");
    assert.deepEqual(heldPlan.session.pendingAttention!.plan.fragments, []);
    assert.deepEqual(heldPlan.session.pendingAttention!.choices, []);
    assert.equal(heldPlan.session.submissions.length, 0);
    await discardVenueVisitDebug(scene.id);
  }
  scene = await open();
  const legacyPending = await send(scene, "old-choice", "I knock.");
  delete records.get(`villages-venue-visit-${scene.id}`).data.pendingAttention.plan.validation;
  const beforeOldChoice = { ...counts };
  const heldChoice = await send(legacyPending.session, "held-choice", "I knock.", {
    id: "old-choice",
    zoneId: "common",
  });
  assert.deepEqual(counts, beforeOldChoice, "unbound pending choices cannot create remote witnesses");
  assert.deepEqual(heldChoice.session.pendingAttention!.plan.fragments, []);
  await discardVenueVisitDebug(scene.id);

  scene = await open();
  behavior = "private-memory";
  const mixed = 'I whisper "PRIVATE SECRET" to Local. I throw a rock at the window.';
  const mixedBefore = { ...counts };
  const noise = await send(scene, "mixed-noise", mixed);
  assert.equal(counts.attention, mixedBefore.attention + 1);
  assert.equal(counts.scene, mixedBefore.scene + 1);
  const checkPrompt = prompts.findLast((prompt) => prompt.system.startsWith("Interpret nearby attention"))!;
  assert.ok(!checkPrompt.input.includes("SECRET OFFICE DETAILS"));
  assert.ok(!checkPrompt.input.includes("faraway"));
  assert.equal(checkPrompt.options.maxTokens, 1024);
  for (const line of noise.session.lines.filter((line) => line.heardBy.includes("listener")))
    assert.ok(!line.content.includes("PRIVATE SECRET"));
  assert.ok(noise.session.lines.find((line) => line.content === mixed)!.heardBy.every((id) => id === "local"));
  assert.ok(
    !fixtureVillageState(records.get("villages-village").data, records).memories.records.some((memory: any) =>
      memory.text.includes("PRIVATE SECRET"),
    ),
  );
  assert.ok(!JSON.stringify(publicSceneResponse(noise.session)).includes("An audible sound"));
  const savedNoise = await readProjectTurnEvidence(noise.session.id, "mixed-noise");
  assert.equal(savedNoise.playerMessagesByActor?.local, mixed);
  assert.equal(savedNoise.playerMessagesByActor?.listener, undefined, "noise reveals no private Project request");
  await discardVenueVisitDebug(noise.session.id);

  scene = await open();
  behavior = "failed";
  const failedBefore = { ...counts };
  const failed = await send(scene, "missed-window", "I throw a rock at the window.");
  assert.equal(counts.scene, failedBefore.scene + 1);
  assert.ok(!failed.session.lines.some((line) => line.speakerId === "listener"));
  assert.ok(!failed.session.lines.some((line) => line.attentionEvidence));
  await discardVenueVisitDebug(failed.session.id);

  scene = await open();
  behavior = "answer";
  failNextTurnSave = true;
  await assert.rejects(send(scene, "save-failure", "I throw a rock at the window."), /save|interrupted/iu);
  const interrupted = await activeVenueSession();
  const paidBeforeRetry = { ...counts };
  const recovered = await send(
    interrupted,
    "save-failure",
    "I throw a rock at the window.",
    undefined,
    interrupted!.operation!.attemptId,
  );
  assert.deepEqual(counts, paidBeforeRetry, "saved preflight and Scene response survive a failed final save");
  assert.equal(recovered.session.submissions.filter((turn) => turn.id === "save-failure").length, 1);
  await discardVenueVisitDebug(recovered.session.id);

  scene = await open();
  // Simulate an admitted scope-2 request from the earlier attention candidate.
  const legacyOperation = records.get(`villages-venue-visit-${scene.id}`).data;
  legacyOperation.operation = {
    ...legacyOperation.operation,
    id: "intermediate-system",
    kind: "turn",
    status: "interrupted",
    attemptId: "old-system-attempt",
    sceneRevision: scene.sceneRevision,
    input: { message: "I throw a rock at the window.", mode: "chat", targetId: "", interactionScopeVersion: 2 },
    snapshot: null,
    checkpoints: {},
    attempts: {},
  };
  failCheckpointStage = "attention-routing:intermediate-system-system";
  const intermediateBefore = { ...counts };
  await assert.rejects(
    send(scene, "intermediate-system", "I throw a rock at the window.", undefined, "old-system-attempt"),
    /intermediate checkpoint/,
  );
  let held = await activeVenueSession();
  assert.equal(held!.operation!.status, "interrupted");
  const intermediate = await send(
    held,
    "intermediate-system",
    "I throw a rock at the window.",
    undefined,
    held!.operation!.attemptId,
  );
  assert.equal(
    counts.attention,
    intermediateBefore.attention + 1,
    "an inner saved compact result is never purchased twice",
  );
  assert.equal(counts.scene, intermediateBefore.scene + 1);
  assert.equal(intermediate.session.operation!.input.interactionScopeVersion, 2);
  const legacyPrompt = prompts.findLast((prompt) => prompt.system.startsWith("Interpret nearby attention"))!;
  assert(!legacyPrompt.input.includes("decisionContextComplete"));
  assert(!legacyPrompt.input.includes("localRecipients"));
  await discardVenueVisitDebug(intermediate.session.id);

  scene = await open();
  failCompletedSceneResult = true;
  await assert.rejects(send(scene, "raw-scene-result", "I throw a rock at the window."), /completed Scene result/);
  held = await activeVenueSession();
  const rawBeforeRetry = { ...counts };
  const rawRecovered = await send(
    held,
    "raw-scene-result",
    "I throw a rock at the window.",
    undefined,
    held!.operation!.attemptId,
  );
  assert.deepEqual(counts, rawBeforeRetry);
  await discardVenueVisitDebug(rawRecovered.session.id);

  // Edited replacement uses current admission; coordinator/session suites cover it.
  // This fixture retains the legacy scope-5 contract to verify unchanged retries.

  scene = await open();
  behavior = "whisper";
  const whispered = await send(scene, "local-whisper", mixed);
  assert.ok(whispered.session.lines.find((line) => line.kind === "whisper")!.heardBy.every((id) => id === "local"));
  await discardVenueVisitDebug(whispered.session.id);

  scene = await open();
  behavior = "remote-handoff";
  const pickupMessage = "I pick up the pebble. I throw a rock at the window.";
  const handoffBefore = { ...counts };
  await assert.rejects(send(scene, "remote-handoff", pickupMessage));
  assert.equal(records.get("villages-village").data.venues[0].zones[0].state.recent, null);
  behavior = "pickup";
  const pickupHeld = await activeVenueSession();
  const pickup = await send(pickupHeld, "remote-handoff", pickupMessage, undefined, pickupHeld!.operation!.attemptId);
  assert.equal(
    counts.attention,
    handoffBefore.attention + 1,
    "known rejected Scene metadata reuses the compact result",
  );
  assert.equal(counts.scene, handoffBefore.scene + 2);
  assert.equal(pickup.session.submissions.at(-1)!.physicalOutcomeVersion, undefined);
  assert.equal(
    records.get("villages-village").data.venues[0].zones[0].state.recent,
    null,
    "unvalidated metadata cannot establish physical truth",
  );
  const pickupBeforeReplay = { ...counts };
  await send(pickup.session, "remote-handoff", pickupMessage);
  assert.deepEqual(counts, pickupBeforeReplay);
  await discardVenueVisitDebug(pickup.session.id);

  scene = await open();
  behavior = "answer";
  const broadcast = await send(scene, "adjacent-broadcast", "I set off an explosion.");
  assert.deepEqual(broadcast.session.submissions.at(-1)!.attention!.fragments[0]!.zoneIds, [
    "common",
    "workshop",
    "office",
  ]);
  assert.ok(
    broadcast.session.lines.some(
      (line) => line.kind === "narration" && line.attentionEvidence && line.heardBy.includes("faraway"),
    ),
  );
  assert.ok(broadcast.session.lines.some((line) => line.attentionEvidence && line.heardBy.includes("sibling")));
  assert.ok(
    !broadcast.session.lines.find((line) => line.speakerId === "listener")!.heardBy.includes("sibling"),
    "a reply cannot cross two Zone boundaries",
  );
  await discardVenueVisitDebug(broadcast.session.id);

  scene = await open();
  behavior = "malformed-witness";
  const malformedBefore = { ...counts };
  await assert.rejects(send(scene, "bad-witness", "I throw a rock at the window."));
  behavior = "answer";
  const correctedHeld = await activeVenueSession();
  const corrected = await send(
    correctedHeld,
    "bad-witness",
    "I throw a rock at the window.",
    undefined,
    correctedHeld!.operation!.attemptId,
  );
  assert.equal(counts.attention, malformedBefore.attention + 1);
  assert.equal(counts.scene, malformedBefore.scene + 2);
  await discardVenueVisitDebug(corrected.session.id);

  scene = await open();
  const oldRecord = records.get(`villages-venue-visit-${scene.id}`);
  oldRecord.data.operation = {
    ...oldRecord.data.operation,
    id: "old-v1",
    kind: "turn",
    status: "interrupted",
    attemptId: "v1-attempt",
    sceneRevision: scene.sceneRevision,
    input: { message: "Hello from the old contract", mode: "chat", targetId: "", interactionScopeVersion: 1 },
    snapshot: null,
    checkpoints: {},
    attempts: {},
  };
  const oldBefore = { ...counts };
  const oldReply = await send(scene, "old-v1", "Hello from the old contract", undefined, "v1-attempt");
  assert.equal(oldReply.session.operation!.input.interactionScopeVersion, 1);
  assert.equal(counts.attention, oldBefore.attention, "retry retains the admitted old routing contract");
  assert.equal(counts.scene, oldBefore.scene + 1);

  assert.equal(attentionCheck(mixed, house, recovered.session).decisionEligible, false);
  assert.equal(attentionCheck("Hello there", house, recovered.session).decisionEligible, true);
  assert.equal(directAttention("Yesterday I knocked on the door.", house, recovered.session), null);
  assert.equal(
    readAttentionPlan(
      {
        outcome: "attention",
        source: "system",
        evidenceIds: ["player-input"],
        reason: "",
        details: {
          fragments: [{ start: 0, end: mixed.length, kind: "sound", reach: "directed", zoneIds: ["office"] }],
        },
      },
      mixed,
      house,
      recovered.session,
    ).status,
    "clarify",
  );
  for (const outcome of ["unresolved", "clarify"])
    assert.equal(
      readAttentionPlan(
        {
          outcome,
          source: "system",
          evidenceIds: ["player-input"],
          reason: "",
          details: {
            fragments: [{ start: 0, end: mixed.length, kind: "sound", reach: "directed", zoneIds: ["common"] }],
          },
        },
        mixed,
        house,
        oldReply.session,
      ).status,
      "clarify",
    );
  for (const fragment of [
    { id: "attention:0", start: 0, end: 3, kind: "speech", reach: "broadcast", zoneIds: [] },
    { id: "attention:0", start: 0, end: 3, kind: "sound", reach: "directed", zoneIds: ["common", "workshop"] },
  ])
    assert.equal(
      coercePendingAttention({
        id: "pending",
        message: "Hello",
        revision: 1,
        originZoneId: "exterior",
        plan: { status: "clarify", fragments: [fragment] },
        choices: [{ id: "common", label: "Common Space" }],
      }),
      undefined,
    );

  let decisionCalls = 0,
    compactCalls = 0,
    decisionMode = "positive";
  const compactScene = { ...oldReply.session, lines: [], doorwayContacts: [] };
  const check = attentionCheck("Hello there", house, compactScene);
  const candidates = decisionCandidates(check)!;
  assert(
    candidates.length &&
      candidates.every(
        (candidate) =>
          candidate.question.includes('"from":"exterior"') &&
          candidate.question.includes('"open":[]') &&
          candidate.question.includes('"local":[{"id":"local","name":"local"}]') &&
          candidate.question.includes("Common Space"),
      ),
  );
  const identityVenue = {
    zones: [
      { id: "exterior", kind: "exterior", seen: true, name: "Exterior" },
      { id: "common", kind: "public", seen: true, name: "Common Space" },
    ],
  } as any;
  const identityScene = {
    zoneId: "exterior",
    participants: [{ characterId: "ada", name: "Ada" }],
    activeIds: ["ada"],
    lines: [{ id: "prior", role: "user", speakerId: "player", name: "Player", kind: "whisper", content: "Stay here." }],
    doorwayContacts: [],
  } as any;
  const legacyCheck = attentionCheck("I call Ada", identityVenue, identityScene, true);
  assert.equal(
    fingerprint([legacyCheck]),
    "aa2cbd037cd8921a8d123b00e699679e0233512e470320c25cb900ab0f6a4356",
    "scope-2 paid request identity matches the original attention implementation",
  );
  assert.equal(decisionCandidates(legacyCheck), null, "legacy System identity never becomes a fresh Decision");
  const contextualCheck = attentionCheck("I call Ada", identityVenue, identityScene);
  const contextualCandidates = decisionCandidates(contextualCheck)!;
  assert(
    contextualCandidates?.every(
      (candidate) =>
        candidate.question.includes('"kind":"whisper"') &&
        candidate.question.includes('"local":[{"id":"ada","name":"Ada"}]'),
    ),
  );
  const contextualResult = boundDecisionResult(
    contextualCheck,
    contextualCandidates.find((candidate) => candidate.outcome === "local")!,
  );
  assert.equal(readAttentionPlan(contextualResult, "I call Ada", identityVenue, identityScene).status, "local");
  identityScene.lines[0].kind = "speech";
  assert.equal(readAttentionPlan(contextualResult, "I call Ada", identityVenue, identityScene).status, "clarify");
  assert(decisionCandidates(attentionCheck("Hi", house, compactScene)));
  assert(decisionCandidates(attentionCheck("No", house, compactScene)));
  const soundCheck = attentionCheck("I tap the wall", house, compactScene);
  const sound = boundDecisionResult(
    soundCheck,
    decisionCandidates(soundCheck)!.find((candidate) => candidate.outcome === "sound:common")!,
  );
  assert.equal(readAttentionPlan(sound, "I tap the wall", house, compactScene).status, "attention");
  assert.equal(readAttentionPlan(sound, "A different input", house, compactScene).status, "clarify");
  assert.equal(readAttentionPlan({ ...sound, details: {} }, "I tap the wall", house, compactScene).status, "clarify");
  const bound = bindAttentionPlan(
    readAttentionPlan(sound, "I tap the wall", house, compactScene),
    "I tap the wall",
    house,
    compactScene,
  );
  assert(validAttentionPlan(bound, "I tap the wall", house, compactScene));
  bound.fragments[0].zoneIds = ["workshop"];
  assert.equal(
    validAttentionPlan(bound, "I tap the wall", house, compactScene),
    false,
    "cooked fragments are also bound",
  );
  const shortenedHistory = {
    ...compactScene,
    lines: [{ id: "long", role: "user", speakerId: "", name: "Player", content: "x".repeat(251) }],
  } as any;
  assert.equal(
    decisionCandidates(attentionCheck("Hello there", house, shortenedHistory)),
    null,
    "truncated history stays System-only",
  );
  const overBudget = { ...compactScene, lines: [{ ...shortenedHistory.lines[0], content: "x".repeat(249) }] };
  assert.equal(
    decisionCandidates(attentionCheck("Hello there", house, overBudget)),
    null,
    "complete oversized context stays System-only",
  );
  const staleRoute = {
    ...compactScene,
    doorwayContacts: [{ playerZoneId: "exterior", characterZoneId: "common", characterId: "listener" }],
    departedIds: ["listener"],
  } as any;
  assert.deepEqual((attentionCheck("Hello there", house, staleRoute).facts as any).openRoutes, []);
  const interpreter = createInterpretation({
    decisionAdapterStatus: async () => ({ available: decisionMode !== "unavailable", reason: "" }),
    evaluateVillagesDecisions: async ({ questions }: any) => {
      decisionCalls++;
      assert(questions.every((question: any) => question.question.length <= 500));
      return {
        model: null,
        threshold: 0.5,
        answers: Object.fromEntries(
          questions.map((question: any, index: number) => [
            question.id,
            decisionMode === "positive" && index === 0 ? 0.9 : 0,
          ]),
        ),
        choices: {},
      };
    },
    backgroundCalls: { getStore: () => undefined },
    venueInterpretationSettings: () => ({ decisionsEnabled: true }),
    venueCheckpoint: async (_stage: string, work: any) => work(),
    coordinatedOptionalCompletion: async (_key: string, work: any) => work(new AbortController().signal),
    venueOperationSignal: () => undefined,
    trackUsage: async (_meta: any, work: any) => work(),
    bindCallback: (work: any) => work,
    writeInterpretationDiagnostics: async () => {},
    systemInterpretations: async (checks: any[]) => {
      compactCalls++;
      return checks.map(() => ({
        outcome: "local",
        source: "system",
        evidenceIds: ["player-input"],
        reason: "Synthetic compact fallback",
      }));
    },
  } as any);
  const positive = await interpreter.interpretChecks([check], "attention-positive");
  assert.equal(positive.results[0]!.source, "decisions");
  assert.equal(decisionCalls, 1);
  assert.equal(compactCalls, 0);
  decisionMode = "negative";
  await interpreter.interpretChecks([check], "attention-negative");
  assert.equal(decisionCalls, 2);
  assert.equal(compactCalls, 1, "unresolved Decisions uses one compact fallback");
  decisionMode = "unavailable";
  await interpreter.interpretChecks([check], "attention-unavailable");
  assert.equal(compactCalls, 2);
  await interpreter.interpretChecks([attentionCheck(mixed, house, oldReply.session)], "attention-extraction");
  assert.equal(decisionCalls, 2, "detailed extraction skips an unnecessary Decision attempt");
  assert.equal(compactCalls, 3);
  const contactPrior = await activeVenueSession();
  if (contactPrior) await discardVenueVisitDebug(contactPrior.id);
  scene = await open();
  behavior = "answer";
  const contactBefore = { ...counts },
    contactText = "I call through the Common Space doorway: Buster, can you hear me?";
  const newContact = await sendVenueTurn({
    sessionId: scene.id,
    submissionId: "current-contact",
    message: contactText,
    mode: "contact",
    targetId: "",
    contact: { kind: "call", targetId: "", boundaryZoneId: "common", quote: contactText },
    expectedSceneRevision: scene.sceneRevision,
  });
  assert.equal(counts.attention, contactBefore.attention + 1);
  assert.equal(counts.scene, contactBefore.scene + 1);
  assert(
    newContact.session.lines.some((line) => line.attentionEvidence && line.heardBy.includes("sibling")),
    "selected Contact direction does not exclude a different connected space",
  );
  const contactReplay = { ...counts };
  await sendVenueTurn({
    sessionId: scene.id,
    submissionId: "current-contact",
    message: contactText,
    mode: "contact",
    targetId: "",
    contact: { kind: "call", targetId: "", boundaryZoneId: "common", quote: contactText },
    expectedSceneRevision: newContact.session.sceneRevision,
  });
  assert.deepEqual(counts, contactReplay);
  assert.equal(newContact.session.submissions.at(-1)?.contact?.boundaryZoneId, "common");
  const callText = '"Hello!"';
  const selectedCall = await sendVenueTurn({
    sessionId: scene.id,
    submissionId: "selected-call",
    message: callText,
    mode: "contact",
    targetId: "",
    contact: { kind: "call", targetId: "", boundaryZoneId: "workshop", quote: callText },
    expectedSceneRevision: newContact.session.sceneRevision,
  });
  assert.equal(selectedCall.session.submissions.at(-1)?.attention?.fragments[0].targetZoneId, "workshop");
  assert.equal(selectedCall.session.submissions.at(-1)?.attention?.fragments[0].delivery, "call");
  assert(
    prompts
      .findLast((prompt) => prompt.system.includes("ACTION-BASED SOUND"))!
      .system.includes("Intended physical target: workshop"),
  );

  await discardVenueVisitDebug(scene.id);
  scene = await open();
  const plainKnock = await send(scene, "cross-mode-knock", "I knock.");
  assert(plainKnock.session.pendingAttention);
  const crossBefore = { ...counts };
  const targetedKnock = await sendVenueTurn({
    sessionId: scene.id,
    submissionId: "cross-mode-target",
    message: "I knock.",
    mode: "contact",
    targetId: "",
    contact: { kind: "knock", targetId: "", boundaryZoneId: "workshop", quote: "I knock." },
    expectedSceneRevision: plainKnock.session.sceneRevision,
  });
  assert.equal(targetedKnock.session.pendingAttention, undefined);
  assert.equal(
    counts.attention,
    crossBefore.attention,
    "a selected physical surface resolves the free knock without another check",
  );
  assert.equal(counts.scene, crossBefore.scene + 1);
  await discardVenueVisitDebug(scene.id);
  const priorMigration = await activeVenueSession();
  if (priorMigration) await discardVenueVisitDebug(priorMigration.id);
  scene = await open();
  const migrationWorld = fixtureVillageState(records.get("villages-village").data, records);
  delete records.get("villages-venue-visit-" + scene.id).data.sceneAttendance.layout;
  const migrationSnapshot = structuredClone(scene);
  delete migrationSnapshot.sceneAttendance.layout;
  migrationSnapshot.operation = null;
  records.get("villages-venue-visit-" + scene.id).data.operation = {
    id: "save-failure",
    kind: "turn",
    status: "interrupted",
    attemptId: "migration-attempt",
    sceneRevision: scene.sceneRevision,
    input: { message: "I set off an explosion.", mode: "chat", targetId: "", interactionScopeVersion: 5 },
    snapshot: migrationSnapshot,
    checkpoints: {},
    attempts: {},
  };
  failNextTurnSave = true;
  await assert.rejects(
    send(scene, "save-failure", "I set off an explosion.", undefined, "migration-attempt"),
    /save|interrupted/,
  );
  const migratedPending = (await activeVenueSession())!;
  assert(
    migratedPending.operation!.checkpoints["acoustic-layout"],
    "legacy active Scene map is saved before paid work",
  );
  await mutateVillageState((world) => {
    for (const zone of world.venues[0].zones!)
      zone.connectedTo =
        zone.id === "exterior" ? ["office"] : zone.id === "office" ? ["exterior", "common", "workshop"] : ["office"];
  });
  const migratedBefore = { ...counts };
  const migratedReply = await send(
    migratedPending,
    "save-failure",
    "I set off an explosion.",
    undefined,
    migratedPending.operation!.attemptId,
  );
  assert.deepEqual(counts, migratedBefore, "migrated topology and paid results survive recovery after a live map edit");
  await discardVenueVisitDebug(migratedReply.session.id);
  await mutateVillageState((world) => Object.assign(world, migrationWorld), { memories: true });
  behavior = "local-end";
  const beforeEnd = await activeVenueSession();
  if (beforeEnd) await discardVenueVisitDebug(beforeEnd.id);
  scene = await open();
  const localEnded = await send(scene, "local-end", "Goodbye");
  assert.equal(localEnded.session.status, "closed", "local acoustic Scenes can end normally");
  behavior = "answer";
  const priorMany = await activeVenueSession();
  if (priorMany) await discardVenueVisitDebug(priorMany.id);
  const beforeManyWorld = fixtureVillageState(records.get("villages-village").data, records);
  await mutateVillageState((world) => {
    const template = world.villagers.find((person) => person.characterId === "faraway")!;
    for (let index = 0; index < 8; index++) {
      const person = structuredClone(template),
        id = "audible-" + index;
      person.characterId = id;
      person.cardSnapshot.id = id;
      person.cardSnapshot.name = id;
      person.agenda!.activeDay!.blocks[0].zoneId = "office";
      world.villagers.push(person);
      world.venues[0].workerIds!.push(id);
    }
  });
  scene = await open();
  const manyBefore = { ...counts };
  const many = await send(scene, "venue-wide-many", "I set off an explosion.");
  assert.equal(counts.attention, manyBefore.attention + 1);
  assert.equal(counts.scene, manyBefore.scene + 1);
  assert.equal(counts.other, manyBefore.other, "hearing alone schedules no provider jobs");
  assert(many.session.lines.some((line) => line.attentionEvidence && line.heardBy.includes("audible-0")));
  const manyRetry = { ...counts };
  await send(many.session, "venue-wide-many", "I set off an explosion.");
  assert.deepEqual(counts, manyRetry, "many-listener replay reuses its paid results");
  await discardVenueVisitDebug(many.session.id);
  await mutateVillageState((world) => Object.assign(world, beforeManyWorld), { memories: true });
  scene = await open();
  refuseSceneContext = true;
  const fitBefore = { ...counts };
  await assert.rejects(send(scene, "bounded-context", "Hello there"), /required context do not fit/);
  refuseSceneContext = false;
  assert.equal(counts.scene, fitBefore.scene, "required listener context cannot be silently trimmed or split");
  assert.equal(counts.attention, fitBefore.attention + 1);
  assert.equal((await activeVenueSession())!.operation!.input.message, "Hello there");
  await discardVenueVisitDebug(scene.id);
  console.log(
    "Natural attention: compact costs, clarification replay, adjacent privacy, quoted follow-ups, failed sounds and interrupted-save recovery passed",
  );
} finally {
  release();
  mock.timers.reset();
}
