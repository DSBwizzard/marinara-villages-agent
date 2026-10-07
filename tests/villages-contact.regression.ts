import { fixtureInterpretationChecks } from "./fixtures/villages-interpretation-payload.js";
import assert from "node:assert/strict";
import {
  defaultVillageState,
  coerceVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { mutateVillageState } from "../packages/villages/src/server/features/world/village-store.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";

import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import {
  enterVenue,
  continueVenueWithoutGreeting,
  sendVenueTurn as submitTurn,
  moveVenueZone,
  discardVenueVisitDebug,
} from "../packages/villages/src/server/features/scenes/venue-session.js";
import { activeVenueSession } from "../packages/villages/src/server/features/scenes/live-session.js";
import { publicSceneResponse } from "../packages/villages/src/server/domain/rules/scene-public.js";
import {
  contactNeighbors,
  contactPath,
  contactPosition,
  readContactRelay,
  readContactIntent,
  readContactDelivery,
  contactDevice,
  contactReach,
} from "../packages/villages/src/server/domain/rules/venue-contact.js";
import { agendaDateKey } from "../packages/villages/src/server/domain/rules/agenda-week.js";
import type { VillageVenue, VillageVillager } from "../packages/villages/src/server/domain/models/world.js";

const now = new Date(),
  stamp = now.toISOString(),
  dateKey = agendaDateKey(now),
  weekday = now.toLocaleDateString("en-US", { weekday: "long" });
function venue(id: string, classes: VillageVenue["classes"] = ["gathering"]): VillageVenue {
  return {
    id,
    name: id,
    classes,
    spaces: classes!.map((role) => defaultVenueSpace(role, "The " + role + " interior.")),
    description: "The outside of " + id,
    category: "",
    presentation: { image: null, x: 0.2, y: 0.3 },
    occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
    residentIds: [],
    workerIds: [],
    improvements: [null, null],
    residenceCapacity: 1,
    capabilities: [],
    state: {
      condition: "standing",
      furniture: [],
      upgrades: [],
      publicFacts: [],
      features: [],
      traces: [],
      updatedAt: stamp,
    },
  };
}
function villager(id: string, venueId: string, zoneId: string, activity = "Visiting"): VillageVillager {
  const block = {
    startMinute: 0,
    endMinute: 1440,
    venueId,
    zoneId,
    activity,
    reason: "Routine",
    status: "online" as const,
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
    completedWishes: [],
    remap: null,
    ingestSchedule: false,
    agenda: {
      wishes: [],
      routineSummary: "",
      day: [block],
      week: { [weekday]: [block] },
      activeDay: { dateKey, weekday, blocks: [block], scheduleInformed: false },
      source: "village",
      generatedAt: stamp,
    },
  } as VillageVillager;
}

const state = defaultVillageState();
state.foundedAt = state.setupAt = stamp;
state.visitMemoryBackfilled = true;
const house = venue("house", ["residence", "workplace"]);
house.residentIds = ["messenger", "alex"];
house.workerIds = ["alex"];
house.layoutVersion = 1;
house.zones = [
  { ...defaultVenueSpace("other"), id: "exterior", name: "Exterior", kind: "exterior", seen: true },
  { ...defaultVenueSpace("residence"), id: "common", name: "Common Space", kind: "shared-residence" },
  { ...defaultVenueSpace("workplace"), id: "public", name: "Workshop", kind: "public" },
  { ...defaultVenueSpace("workplace", "SECRET OFFICE DETAILS"), id: "office", name: "Office", kind: "staff" },
  {
    ...defaultVenueSpace("residence", "SECRET BEDROOM"),
    id: "private:alex",
    name: "Bedroom",
    kind: "private-residence",
    ownerId: "alex",
  },
];
state.venues = [house];
state.villagers = [villager("messenger", "house", "common"), villager("alex", "house", "office")];
const saved = coerceVillageState(state);
const records = new Map<string, any>();
records.set("villages-village", { id: "villages-village", kind: "village", data: saved, revision: 1 });
let providerCalls = 0,
  providerResolves = 0;
let calls = 0,
  behavior = "answer",
  failSave = false;
const prompts: string[] = [];
const debugLogs: string[] = [];
const release = configureVillagesRuntime({
  logger: {
    debug() {},
    info() {},
    warn() {},
    error() {},
    debugOverride(_enabled: boolean, _message: string, text: string) {
      debugLogs.push(text);
    },
  },
  isDebugAgentsEnabled: () => true,
  getAgentConfig: async () => ({ connectionId: "fixture" }),
  resources: {
    async listCharacters() {
      return [];
    },
  },
  persistence: {
    documents: {
      async getById(_p: string, id: string) {
        return records.get(id) ?? null;
      },
      async list(_p: string, kind: string) {
        return [...records.values()].filter((row) => row.kind === kind);
      },
      async create(input: any) {
        const row = { ...input, revision: 1 };
        records.set(input.id, row);
        return row;
      },
      async update(input: any) {
        if (failSave && input.data.submissions?.some((entry: any) => entry.id === "crash")) {
          failSave = false;
          throw new Error("save interrupted");
        }
        const prior = records.get(input.id);
        if (!prior || prior.revision !== input.expectedRevision) return null;
        const row = { ...prior, ...input, revision: prior.revision + 1 };
        records.set(input.id, row);
        return row;
      },
      async remove(_p: string, id: string) {
        return records.delete(id);
      },
    },
  },
  languageModels: {
    async resolveForRequest() {
      providerResolves++;
      return {
        model: "fixture",
        maxOutputTokens: 4096,
        fitContext(messages: any[], options: any) {
          return { messages, ...options };
        },
        async chatComplete(messages: any[]) {
          providerCalls++;
          if (messages[0]?.content.startsWith("Interpret the meaning of witnessed Scene evidence")) {
            const checks = fixtureInterpretationChecks(messages[1].content);
            return {
              content: JSON.stringify({
                results: checks.map((check: any) => {
                  const speech = check.evidence.filter(
                    (line: any) => line.current && line.speakerId === check.facts.actorId,
                  );
                  const text = speech.map((line: any) => line.content).join(" ");
                  const outcome =
                    (check.facts.zoneId === "office" && text === "Come into my office now.") ||
                    (check.facts.zoneId === "common" && text === "Come into our Common Space now.")
                      ? "invite-now"
                      : "none";
                  return {
                    id: check.id,
                    outcome,
                    evidenceIds: speech.map((line: any) => line.id),
                    reason: "Labeled witnessed contact response",
                  };
                }),
              }),
              finishReason: "stop",
            };
          }
          calls++;
          const system = String(messages[0]?.content),
            user = String(messages[1]?.content);
          prompts.push(system + "\n" + user);
          const audience = (system.match(/The residents currently here are: ([^.]*)\./)?.[1] ?? "")
            .split(", ")
            .filter(Boolean);
          let result: any = {
            heardPlayerBy: audience,
            segments: [{ kind: "narration", text: "A quiet moment.", heardBy: audience }],
          };
          if (system.includes("RELAY RESPONSE")) {
            const quote = "Come into my office now.";
            result = {
              heardPlayerBy: audience,
              segments: [{ kind: "dialogue", speakerId: "alex", text: quote, heardBy: audience }],
              invitation: {
                speakerId: "alex",
                venueId: "house",
                zoneId: "office",
                scope: "shared",
                timing: "now",
                quote,
              },
            };
          } else if (system.includes("CONTACT RESPONSE")) {
            const quote =
              behavior === "relay-move"
                ? "I'll come outside and fetch Alex for you."
                : behavior.startsWith("relay")
                  ? "I'll fetch Alex for you."
                  : behavior === "invite"
                    ? "Come into our Common Space now."
                    : behavior === "end"
                      ? "Goodbye, I need to go now."
                      : behavior === "move"
                        ? "I'll come outside to meet you."
                        : behavior === "short-end"
                          ? "Goodbye."
                          : "Yes, I'm listening.";
            if (behavior !== "quiet")
              result = {
                heardPlayerBy: audience,
                segments: [{ kind: "dialogue", speakerId: "messenger", text: quote, heardBy: audience }],
              };
            if (behavior.startsWith("relay")) result.contactRelay = { speakerId: "messenger", targetId: "alex", quote };
            if (behavior === "relay-move") {
              result.segments.push({ kind: "narration", text: "Messenger steps outside.", heardBy: audience });
              result.contactMoves = [{ characterId: "messenger", zoneId: "exterior", quote }];
            }
            if (behavior === "invite")
              result.invitation = {
                speakerId: "messenger",
                venueId: "house",
                zoneId: "common",
                scope: "shared",
                timing: "now",
                quote,
              };
            if (behavior === "end" || behavior === "short-end") {
              result.contactEnd = [{ speakerId: "messenger", quote }];
              result.sceneEnded = { speakerId: "messenger", quote };
            }
            if (behavior === "move") {
              result.segments.push({ kind: "narration", text: "Messenger steps outside.", heardBy: audience });
              result.contactMoves = [{ characterId: "messenger", zoneId: "exterior", quote }];
            }
          } else if (user === "I make my way into Common Space") {
            result.contactIntent = { kind: "call", targetId: "alex", boundaryZoneId: "common", quote: user };
            result.movementIntent = { zoneId: "common", quote: user };
          } else if (user === "I raise my voice toward the house and ask for Alex.") {
            // A Contact nomination cannot authorize a remote speaker in local prose.
            result.segments = [
              { kind: "dialogue", speakerId: "alex", text: "A discarded premature answer.", heardBy: ["alex"] },
            ];
            result.contactIntent = { kind: "call", targetId: "alex", boundaryZoneId: "common", quote: user };
          }
          if (system.includes("CONTACT RESPONSE") && behavior.startsWith("distant")) {
            const speakerId = behavior === "distant-local" ? "trina" : "alex";
            const quote =
              behavior === "distant-approach"
                ? "I'll come closer to the Common Space."
                : behavior === "distant-end"
                  ? "Goodbye, I need to go now."
                  : behavior === "distant-local"
                    ? "I can hear both of you from out here."
                    : "I can hear you calling from inside.";
            result = {
              heardPlayerBy: ["trina", "alex"],
              segments: [{ kind: "dialogue", speakerId, text: quote, heardBy: ["trina", "alex"] }],
            };
            if (behavior === "distant-silent-witness") {
              result.heardPlayerBy.push("dozy");
              result.recollections = [
                {
                  text: "Dozy overheard the morning greeting.",
                  subjectCharacterIds: ["dozy"],
                  knownByCharacterIds: ["dozy"],
                  evidence: ["player"],
                },
              ];
            }
            if (behavior === "distant-approach") {
              result.contactMoves = [{ characterId: "alex", zoneId: "common", quote }];
              result.segments.push({
                kind: "narration",
                text: "Alex comes closer to the Common Space.",
                heardBy: ["trina"],
              });
            }
            if (behavior === "distant-end") result.contactEnd = [{ speakerId: "alex", quote }];
          }
          if (system.includes("CONTACT RESPONSE") && behavior === "silent-heard")
            result = {
              heardPlayerBy: ["messenger"],
              segments: [{ kind: "narration", text: "No answer.", heardBy: [] }],
            };
          if (behavior === "invalid")
            result.segments = [{ kind: "dialogue", speakerId: "unlisted", text: "Unsupported speech.", heardBy: [] }];
          return { content: JSON.stringify(result), finishReason: "stop" };
        },
      };
    },
  },
} as Parameters<typeof configureVillagesRuntime>[0]);

async function open() {
  const entered = await enterVenue("house", undefined, "", "outside");
  return continueVenueWithoutGreeting(entered.id);
}
async function attempt(id: string, submissionId: string, targetId = "messenger", retryOfAttemptId?: string) {
  const message = targetId === "alex" ? "Alex, are you there?" : "I knock at the doorway.";
  return submitTurn({
    sessionId: id,
    message,
    mode: "contact",
    targetId,
    submissionId,
    retryOfAttemptId,
    contact: { kind: "call", targetId, boundaryZoneId: "common", quote: message },
  });
}
async function explicitActionChecks() {
  behavior = "answer";
  let scene = await open();
  const contact = { kind: "call" as const, targetId: "", boundaryZoneId: "common", quote: "Hello, Alex!" };
  const before = calls;
  const answered = await submitTurn({
    sessionId: scene.id,
    message: contact.quote,
    mode: "contact",
    targetId: "",
    submissionId: "scoped-contact",
    contact,
  });
  assert.equal(calls - before, 1);
  assert.equal(answered.session.zoneId, "exterior");
  assert.deepEqual(answered.session.activeIds, []);
  assert.match(prompts.at(-1)!, /Possible remote listeners: messenger/);
  assert.doesNotMatch(prompts.at(-1)!, /Possible remote listeners:.*alex/);
  const local = await submitTurn({
    sessionId: scene.id,
    message: "I shout loudly: HEY ALEX!",
    mode: "chat",
    targetId: "",
    submissionId: "scoped-local",
  });
  assert.deepEqual(local.session.lines.at(-1)!.heardBy, []);
  assert.equal(local.session.lines.at(-1)!.viaDoorway, undefined);
  assert.ok(prompts.at(-1)!.includes("Say / Do affects only the current Zone"));
  assert.doesNotMatch(prompts.at(-1)!, /CONTACT RESPONSE/);
  const movedWords = await submitTurn({
    sessionId: scene.id,
    message: "I walk to Common Space",
    mode: "chat",
    targetId: "",
    submissionId: "scoped-written-move",
  });
  assert.equal(movedWords.session.zoneId, "exterior", "only Move changes the player's Zone");
  assert.equal(movedWords.session.submissions.at(-1)!.movement, undefined);
  behavior = "relay";
  const relayBefore = calls;
  const offered = await submitTurn({
    sessionId: scene.id,
    message: contact.quote,
    mode: "contact",
    targetId: "",
    submissionId: "scoped-relay-offer",
    contact,
  });
  assert.equal(calls - relayBefore, 1, "fetch offers never launch an extra response stage");
  assert.equal(offered.session.submissions.at(-1)!.contactEvidence!.relay, null);
  assert.equal(contactPosition(offered.session, "alex"), "office");
  assert.ok(!offered.session.lines.some((line) => line.contactReport));
  behavior = "answer";
  const loud = { ...contact, quote: "I shout as loudly as I can: HEY ALEX!" };
  await submitTurn({
    sessionId: scene.id,
    message: loud.quote,
    mode: "contact",
    targetId: "",
    submissionId: "scoped-loud",
    contact: loud,
  });
  assert.match(prompts.at(-1)!, /Possible remote listeners: messenger/);
  assert.doesNotMatch(prompts.at(-1)!, /Possible remote listeners:.*alex/);
  const untouched = calls;
  const quiet = { ...contact, boundaryZoneId: "public" };
  const empty = await submitTurn({
    sessionId: scene.id,
    message: quiet.quote,
    mode: "contact",
    targetId: "",
    submissionId: "scoped-empty",
    contact: quiet,
  });
  assert.equal(calls, untouched, "no eligible listener needs no response request");
  assert.equal(empty.session.lines.at(-1)!.content, "No answer.");
  const publicReply = publicSceneResponse(offered);
  assert.doesNotMatch(
    JSON.stringify(publicReply),
    /SECRET OFFICE DETAILS|SECRET BEDROOM|sceneAttendance|contactEvidence/,
  );
  await discardVenueVisitDebug(scene.id);
  for (const boundaryZoneId of ["", "office"]) {
    scene = await open();
    await assert.rejects(
      submitTurn({
        sessionId: scene.id,
        message: contact.quote,
        mode: "contact",
        targetId: "",
        submissionId: "scoped-invalid-" + boundaryZoneId,
        contact: { ...contact, boundaryZoneId },
      }),
      /adjacent/,
    );
    await discardVenueVisitDebug(scene.id);
  }
  assert.deepEqual(contactReach(saved, house, "exterior", "loud", "common", true), ["common"]);
  assert.deepEqual(contactReach(saved, house, "exterior", "device", "common", true), ["common"]);
  scene = await open();
  failSave = true;
  const recoveryCalls = calls;
  const crashInput = {
    sessionId: scene.id,
    message: contact.quote,
    mode: "contact" as const,
    targetId: "",
    submissionId: "crash",
    contact,
  };
  await assert.rejects(submitTurn(crashInput), /save interrupted/);
  const interrupted = (await activeVenueSession())!;
  const beforeUnauthorized = [providerCalls, providerResolves];
  for (const retryOfAttemptId of [undefined, "wrong-attempt"]) {
    await assert.rejects(submitTurn({ ...crashInput, retryOfAttemptId }), /explicitly retry/);
    assert.deepEqual([providerCalls, providerResolves], beforeUnauthorized);
  }
  const recovered = await submitTurn({ ...crashInput, retryOfAttemptId: interrupted.operation!.attemptId });
  assert.equal(calls - recoveryCalls, 1, "new Contact retry reuses its saved response");
  assert.equal(recovered.session.submissions.filter((entry) => entry.id === "crash").length, 1);
  await discardVenueVisitDebug(scene.id);
}

async function main() {
  try {
    await explicitActionChecks();
    assert.deepEqual(contactNeighbors(house, "exterior").sort(), ["common", "public"]);
    assert.deepEqual(contactPath(saved, house, "common", "public", "messenger"), ["common", "exterior", "public"]);
    assert.equal(contactPath(saved, house, "common", "office", "messenger"), null, "staff permission is enforced");
    assert.equal(
      contactPath(saved, house, "common", "private:alex", "messenger"),
      null,
      "private ownership is enforced",
    );
    const hypothetical = "If I knock on the door, would Alex hear?";
    assert.equal(readContactIntent({ kind: "knock", quote: hypothetical }, hypothetical), null);
    assert.equal(readContactIntent({ kind: "call", quote: "invented quote" }, "I call Alex."), null);

    behavior = "answer";
    let scene = await open();
    const baseCalls = calls;
    const answer = await attempt(scene.id, "answer");
    assert.equal(calls - baseCalls, 1, "adjacent Contact needs one response generation");
    assert.equal(answer.session.operation?.input.interactionScopeVersion, 1);
    assert.deepEqual(answer.session.activeIds, []);
    assert.equal(answer.session.lines.at(-1)?.viaDoorway, true);
    assert.equal(answer.session.doorwayContacts?.[0]?.characterId, "messenger");
    assert.equal(answer.session.zoneId, "exterior");
    assert.doesNotMatch(prompts.at(-1)!, /SECRET OFFICE DETAILS|SECRET BEDROOM/);
    const beforeReplay = calls;
    await attempt(scene.id, "answer");
    assert.equal(calls, beforeReplay, "saved adjacent Contact does not repeat its response generation");
    assert.equal((await activeVenueSession())!.doorwayContacts?.[0]?.characterId, "messenger");
    const chatCalls = calls;
    const local = await submitTurn({
      sessionId: scene.id,
      message: "Is it too early?",
      mode: "chat",
      targetId: "",
      submissionId: "local-followup",
    });
    assert.equal(calls - chatCalls, 1, "Say / Do uses one local response generation");
    assert.equal(local.session.operation?.input.interactionScopeVersion, 1);
    assert.deepEqual(local.session.lines.at(-1)!.heardBy, []);
    assert.equal(local.session.lines.at(-1)!.viaDoorway, undefined);
    assert.deepEqual(local.session.activeIds, []);
    assert.equal(local.session.zoneId, "exterior");
    await attempt(scene.id, "followup");
    assert.match(prompts.at(-1)!, /Yes, I'm listening/, "explicit Contact receives witnessed doorway history");
    behavior = "end";
    const ended = await attempt(scene.id, "end");
    assert.deepEqual(ended.session.doorwayContacts, []);
    assert.equal(ended.session.status, "active", "a doorway goodbye leaves the Venue Scene open");
    assert.equal(contactPosition(ended.session, "messenger"), "common");
    behavior = "invite";
    const invited = await attempt(scene.id, "invite");
    assert.equal(invited.session.zoneId, "exterior", "an invitation grants permission without moving the player");
    assert.equal(invited.session.entryOffers?.[0]?.zoneId, "common");
    const inside = await moveVenueZone(scene.id, "common");
    assert.equal(inside.zoneId, "common");
    assert.deepEqual(inside.doorwayContacts, []);
    await discardVenueVisitDebug(scene.id);
    scene = await open();
    const targetCalls = [providerCalls, providerResolves];
    await assert.rejects(
      submitTurn({
        sessionId: scene.id,
        message: "Messenger, are you there?",
        mode: "chat",
        targetId: "messenger",
        submissionId: "remote-local-target",
      }),
      /no longer in this conversation/,
    );
    assert.deepEqual(
      [providerCalls, providerResolves],
      targetCalls,
      "a remote target cannot admit a local response or interpretation",
    );
    await discardVenueVisitDebug(scene.id);

    behavior = "relay-move";
    scene = await open();
    const moveCalls = calls;
    const moved = await attempt(scene.id, "move-with-fetch-offer", "alex");
    assert.equal(
      calls - moveCalls,
      1,
      "a fetch offer with evidenced resident movement still needs one adjacent response",
    );
    assert.equal(moved.session.submissions.at(-1)?.contactEvidence?.relay, null);
    assert.equal(contactPosition(moved.session, "messenger"), "exterior");
    assert.equal(contactPosition(moved.session, "alex"), "office");
    assert.deepEqual(moved.session.activeIds, ["messenger"]);
    assert.ok(!moved.session.lines.some((line) => line.contactReport));
    await discardVenueVisitDebug(scene.id);

    behavior = "answer";
    scene = await open();
    const nominationCalls = calls;
    const nominations = await submitTurn({
      sessionId: scene.id,
      message: "I make my way into Common Space",
      mode: "chat",
      targetId: "",
      submissionId: "ignored-nominations",
    });
    assert.equal(calls - nominationCalls, 1, "model nominations do not admit extra Contact or movement responses");
    assert.match(prompts.at(-1)!, /Say \/ Do affects only the current Zone/);
    assert.doesNotMatch(prompts.at(-1)!, /CONTACT RESPONSE|RELAY RESPONSE/);
    assert.equal(nominations.session.zoneId, "exterior");
    assert.deepEqual(nominations.session.activeIds, []);
    assert.deepEqual(nominations.session.doorwayContacts ?? [], []);
    assert.equal(nominations.session.submissions.at(-1)?.movement, undefined);
    assert.deepEqual(nominations.session.lines.at(-1)!.heardBy, []);
    await discardVenueVisitDebug(scene.id);

    scene = await open();
    const invalidNominationCalls = calls;
    await assert.rejects(
      submitTurn({
        sessionId: scene.id,
        message: "I raise my voice toward the house and ask for Alex.",
        mode: "chat",
        targetId: "",
        submissionId: "invalid-remote-nomination",
      }),
      /failed validation \(invalid-segments\)/,
    );
    assert.equal(
      calls - invalidNominationCalls,
      1,
      "a remote speaker in local prose cannot bypass validation by nominating Contact",
    );
    assert.equal((await activeVenueSession())!.zoneId, "exterior");
    await discardVenueVisitDebug(scene.id);

    behavior = "quiet";
    scene = await open();
    const silent = await attempt(scene.id, "quiet");
    assert.equal(silent.session.lines.at(-1)!.content, "No answer.");
    assert.deepEqual(silent.session.participants, [], "silence does not disclose who is inside");
    await discardVenueVisitDebug(scene.id);
    behavior = "silent-heard";
    scene = await open();
    const unheard = await attempt(scene.id, "silent-heard");
    assert.equal(unheard.session.lines.at(-1)!.content, "No answer.");
    assert.ok(unheard.session.lines.some((line) => line.contactHidden && line.heardBy.includes("messenger")));
    const silentPublic = publicSceneResponse(unheard);
    assert.deepEqual(silentPublic.session.participants, []);
    assert.deepEqual(silentPublic.session.heardHistory, []);
    assert.doesNotMatch(JSON.stringify(silentPublic.session.lines), /messenger/);
    assert.ok((await activeVenueSession())!.heardHistory.some((entry) => entry.characterId === "messenger"));
    await discardVenueVisitDebug(scene.id);

    await mutateVillageState((current) => {
      current.villagers.push(villager("trina", "house", "exterior"), villager("dozy", "house", "office", "Sleeping"));
      current.venues[0]!.workerIds = ["alex", "dozy"];
    });
    behavior = "answer";
    scene = await open();
    assert.deepEqual(scene.activeIds, ["trina"]);
    const loud = await submitTurn({
      sessionId: scene.id,
      message: "I shout loudly for Alex.",
      mode: "contact",
      targetId: "alex",
      submissionId: "loud-adjacent",
      contact: { kind: "call", targetId: "alex", boundaryZoneId: "common", quote: "I shout loudly for Alex." },
    });
    assert.deepEqual(loud.session.activeIds, ["trina"]);
    assert.equal(loud.session.lines.at(-1)!.remoteDelivery, "loud");
    assert.equal(contactPosition(loud.session, "alex"), "office");
    assert.match(prompts.at(-1)!, /Possible remote listeners: messenger/);
    assert.doesNotMatch(prompts.at(-1)!, /Possible remote listeners:.*alex|SECRET OFFICE DETAILS|SECRET BEDROOM/);
    assert.doesNotMatch(
      JSON.stringify(publicSceneResponse(loud)),
      /dozy|sceneAttendance|characterZoneId|SECRET OFFICE DETAILS|SECRET BEDROOM/,
    );
    const boundaryCalls = [providerCalls, providerResolves];
    await assert.rejects(
      submitTurn({
        sessionId: scene.id,
        message: "I shout loudly for Alex.",
        mode: "contact",
        targetId: "alex",
        submissionId: "loud-unselected",
        contact: { kind: "call", targetId: "alex", boundaryZoneId: "", quote: "I shout loudly for Alex." },
      }),
      /adjacent/,
    );
    assert.deepEqual(
      [providerCalls, providerResolves],
      boundaryCalls,
      "loud wording cannot admit an unselected distant response",
    );
    await discardVenueVisitDebug(scene.id);
    await mutateVillageState((current) => {
      current.villagers = current.villagers.filter((entry) => !["trina", "dozy"].includes(entry.characterId));
      current.venues[0]!.workerIds = ["alex"];
    });

    assert.equal(readContactDelivery({}, "I call out hello."), "voice");
    assert.equal(readContactDelivery({}, "I shout loudly for Alex."), "loud");
    assert.equal(readContactDelivery({}, "If I shout for Alex, would he hear?"), "voice");
    assert.ok(!contactReach(saved, house, "exterior", "voice").includes("office"));
    assert.ok(contactReach(saved, house, "exterior", "loud").includes("office"));
    assert.equal(contactDevice(house, "exterior", "invented"), false);
    await mutateVillageState((current) => {
      current.venues[0]!.zones!.find((zone) => zone.id === "exterior")!.state.features!.push({
        id: "intercom",
        text: "A working two-way intercom connects the rooms.",
        locked: true,
      });
    });
    scene = await open();
    const deviceMessage = "I use the intercom to ask Alex if he is listening.";
    const device = await submitTurn({
      sessionId: scene.id,
      message: deviceMessage,
      mode: "contact",
      targetId: "alex",
      submissionId: "device-adjacent",
      contact: {
        kind: "call",
        targetId: "alex",
        boundaryZoneId: "common",
        quote: deviceMessage,
        delivery: "device",
        deviceFeatureId: "intercom",
      },
    });
    assert.deepEqual(device.session.activeIds, []);
    assert.equal(device.session.lines.at(-1)!.remoteDelivery, "device");
    assert.equal(contactPosition(device.session, "alex"), "office");
    assert.doesNotMatch(prompts.at(-1)!, /Possible remote listeners:.*alex/);
    const inventedCalls = [providerCalls, providerResolves];
    await assert.rejects(
      submitTurn({
        sessionId: scene.id,
        message: deviceMessage,
        mode: "contact",
        targetId: "alex",
        submissionId: "invented-device",
        contact: {
          kind: "call",
          targetId: "alex",
          boundaryZoneId: "common",
          quote: deviceMessage,
          delivery: "device",
          deviceFeatureId: "invented",
        },
      }),
      /not an established feature/,
    );
    assert.deepEqual([providerCalls, providerResolves], inventedCalls);
    await discardVenueVisitDebug(scene.id);

    behavior = "move";
    scene = await open();
    const arrived = await attempt(scene.id, "arrive");
    assert.deepEqual(arrived.session.activeIds, ["messenger"]);
    assert.equal(contactPosition(arrived.session, "messenger"), "exterior");
    assert.deepEqual(arrived.session.doorwayContacts, []);
    await discardVenueVisitDebug(scene.id);

    const fake = {
      ...scene,
      sceneAttendance: {
        capturedAt: stamp,
        occupants: [
          { characterId: "messenger", name: "Messenger", doing: "", availability: "online", zoneId: "common" },
          { characterId: "alex", name: "Alex", doing: "", availability: "online", zoneId: "office" },
        ],
      },
    };
    assert.equal(
      readContactRelay(
        { speakerId: "messenger", targetId: "alex", quote: "Maybe I'll fetch Alex." },
        [{ speakerId: "messenger", content: "Maybe I'll fetch Alex.", kind: "dialogue" }],
        saved,
        house,
        fake,
        ["messenger"],
      ),
      null,
    );
    assert.equal(
      readContactRelay(
        { speakerId: "outsider", targetId: "alex", quote: "I'll fetch Alex." },
        [{ speakerId: "outsider", content: "I'll fetch Alex.", kind: "dialogue" }],
        saved,
        house,
        fake,
        ["messenger"],
      ),
      null,
    );
    behavior = "invalid";
    scene = await open();
    const invalidCalls = calls;
    const originalLines = structuredClone(scene.lines);
    await assert.rejects(
      submitTurn({
        sessionId: scene.id,
        message: "Hello there.",
        mode: "chat",
        targetId: "",
        submissionId: "invalid-parser",
      }),
      /failed validation \(invalid-segments\)/,
    );
    assert.equal(calls - invalidCalls, 1, "invalid Scene replies are not automatically retried");
    const interrupted = (await activeVenueSession())!;
    assert.deepEqual(interrupted.lines, originalLines);
    const invalidInput = {
      sessionId: scene.id,
      message: "Hello there.",
      mode: "chat" as const,
      targetId: "",
      submissionId: "invalid-parser",
    };
    behavior = "answer";
    const beforeExplicitRetry = calls;
    await submitTurn(invalidInput);
    assert.equal(
      calls - beforeExplicitRetry,
      1,
      "deliberately resending a known invalid reply does not reuse the rejected draft",
    );
    assert.ok(debugLogs.some((line) => line.includes("scene parser rejection") && line.includes("unreadable speaker")));
    assert.ok(!debugLogs.some((line) => line.includes("scene repair")));
    assert.ok(
      debugLogs.some(
        (line) =>
          line.includes("submission replay") ||
          line.includes("checkpoint replay") ||
          line.includes("completion replay"),
      ),
    );
    assert.ok(debugLogs.some((line) => line.includes("contact routing") && line.includes("possibleListeners")));
    console.log(
      "Fresh local/contact scope, adjacent witnesses, saved-response recovery, invitation and explicit movement passed.",
    );
  } finally {
    release();
  }
}
void main();
