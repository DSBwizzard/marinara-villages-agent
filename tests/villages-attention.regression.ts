import assert from "node:assert/strict";
import { coerceInterpretationSettings } from "../packages/villages/src/server/domain/rules/interpretation-policy.js";
import { fingerprint } from "../packages/villages/src/server/domain/rules/interpretation-rules.js";
import {
  attentionCheck,
  attentionClarificationChoices,
  attentionConversation,
  coercePendingAttention,
  directAttention,
  movedAttentionContacts,
  readAttentionPlan,
  validAttentionPlan,
} from "../packages/villages/src/server/domain/rules/scene-attention.js";
import { publicSceneResponse } from "../packages/villages/src/server/domain/rules/scene-public.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
const stamp = "2026-10-18T12:00:00.000Z";
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
assert.equal(readAttentionPlan(continuation, "I think privately and wave.", house, routeScene, true).status, "clarify");
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

console.log("Saved attention decoding, privacy and doorway-contact cleanup passed without generation.");
