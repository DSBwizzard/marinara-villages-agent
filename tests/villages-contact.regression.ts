import { fixtureInterpretationChecks } from "./fixtures/villages-interpretation-payload.js";
import assert from "node:assert/strict";
import {
  defaultVillageState,
  coerceVillageState,
  mutateVillageState,
} from "../packages/villages/src/engine/packages/server/src/services/villages/village-store.js";
import { defaultVenueSpace } from "../packages/villages/src/engine/packages/server/src/services/villages/venue-model.js";
import { configureVillagesRuntime } from "../packages/villages/src/engine/packages/server/src/services/villages/package-runtime.js";
import {
  enterVenue,
  continueVenueWithoutGreeting,
  sendVenueTurn,
  moveVenueZone,
  activeVenueSession,
  publicSceneResponse,
  discardVenueVisitDebug,
} from "../packages/villages/src/engine/packages/server/src/services/villages/venue-session.js";
import {
  contactNeighbors,
  contactPath,
  contactPosition,
  readContactRelay,
  readContactIntent,
  readContactDelivery,
  contactDevice,
  contactReach,
} from "../packages/villages/src/engine/packages/server/src/services/villages/venue-contact.js";
import { agendaDateKey } from "../packages/villages/src/engine/packages/server/src/services/villages/agenda-week.js";
import type {
  VillageVenue,
  VillageVillager,
} from "../packages/villages/src/engine/packages/server/src/services/villages/types.js";
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
      return {
        model: "fixture",
        maxOutputTokens: 4096,
        fitContext(messages: any[], options: any) {
          return { messages, ...options };
        },
        async chatComplete(messages: any[]) {
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
          } else if (user === "I raise my voice toward the house and ask for Alex.") {
            // Even an invalid remote speaker in preliminary prose cannot block valid contact routing.
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
  return sendVenueTurn({
    sessionId: id,
    message,
    mode: "contact",
    targetId,
    submissionId,
    retryOfAttemptId,
    contact: { kind: "call", targetId, boundaryZoneId: "common", quote: message },
  });
}
async function main() {
  try {
    assert.deepEqual(contactNeighbors(house, "exterior").sort(), ["common", "public"]);
    assert.deepEqual(
      contactPath(saved, house, "common", "public", "messenger"),
      ["common", "exterior", "public"],
      "a messenger can cross multiple permitted boundaries",
    );
    assert.equal(contactPath(saved, house, "common", "office", "messenger"), null, "staff permission is enforced");
    assert.equal(
      contactPath(saved, house, "common", "private:alex", "messenger"),
      null,
      "private ownership is enforced",
    );
    const hypothetical = "If I knock on the door, would Alex hear?";
    assert.equal(readContactIntent({ kind: "knock", quote: hypothetical }, hypothetical), null);
    assert.equal(readContactIntent({ kind: "call", quote: "invented quote" }, "I call Alex."), null);
    let scene = await open();
    const baseCalls = calls;
    const answer = await attempt(scene.id, "answer");
    assert.equal(calls - baseCalls, 1, "the explicit control needs one response call");
    assert.deepEqual(answer.session.activeIds, [], "answering does not change physical cast");
    assert.equal(answer.session.lines.at(-1)?.viaDoorway, true);
    assert.equal(answer.session.doorwayContacts?.[0]?.characterId, "messenger");
    assert.equal(answer.session.zoneId, "exterior");
    assert.doesNotMatch(prompts.at(-1)!, /SECRET OFFICE DETAILS|SECRET BEDROOM/);
    const beforeReplay = calls;
    await attempt(scene.id, "answer");
    assert.equal(calls, beforeReplay, "saved contact replays without paid work");
    const refreshed = (await activeVenueSession())!;
    assert.equal(refreshed.doorwayContacts?.[0]?.characterId, "messenger", "refresh restores the contact");
    const chatCalls = calls;
    const chat = await sendVenueTurn({
      sessionId: scene.id,
      message: "Is it too early? I thought you were an early bird.",
      mode: "chat",
      targetId: "",
      submissionId: "ordinary-followup",
    });
    assert.equal(calls - chatCalls, 1, "ordinary Chat uses the established audible audience before local validation");
    assert.deepEqual(chat.session.activeIds, []);
    assert.equal(chat.session.lines.at(-1)?.viaDoorway, true);
    assert.equal(chat.session.zoneId, "exterior");
    await sendVenueTurn({
      sessionId: scene.id,
      message: "Is it too early? I thought you were an early bird.",
      mode: "chat",
      targetId: "",
      submissionId: "ordinary-followup",
    });
    assert.equal(calls - chatCalls, 1, "ordinary Chat replay is free");
    await attempt(scene.id, "followup");
    assert.match(prompts.at(-1)!, /Yes, I'm listening/, "follow-ups receive witnessed doorway history");
    behavior = "end";
    await attempt(scene.id, "end");
    assert.deepEqual((await activeVenueSession())!.doorwayContacts, []);
    assert.equal((await activeVenueSession())!.status, "active", "a doorway goodbye leaves the Venue Scene open");
    behavior = "answer";
    await attempt(scene.id, "reopen-after-end");
    behavior = "short-end";
    const shortEnd = await sendVenueTurn({
      sessionId: scene.id,
      message: "I will leave you to it.",
      mode: "chat",
      targetId: "",
      submissionId: "short-goodbye",
    });
    assert.deepEqual(shortEnd.session.doorwayContacts, []);
    assert.equal(contactPosition(shortEnd.session, "messenger"), "common", "a remote goodbye is not a Venue departure");
    behavior = "answer";
    await attempt(scene.id, "reopen-for-player-goodbye");
    const playerGoodbye = await sendVenueTurn({
      sessionId: scene.id,
      message: "Goodbye, Messenger.",
      mode: "chat",
      targetId: "",
      submissionId: "player-goodbye",
    });
    assert.deepEqual(playerGoodbye.session.doorwayContacts, [], "the player's deliberate goodbye closes the exchange");
    behavior = "invite";
    const invited = await attempt(scene.id, "invite");
    assert.equal(invited.session.zoneId, "exterior", "inviting does not automatically enter");
    assert.equal(invited.session.entryOffers?.[0]?.zoneId, "common");
    const inside = await moveVenueZone(scene.id, "common");
    assert.equal(inside.zoneId, "common");
    assert.deepEqual(inside.doorwayContacts, []);
    await discardVenueVisitDebug(scene.id);

    behavior = "relay";
    scene = await open();
    const beforeRelay = calls;
    const relayed = await attempt(scene.id, "relay", "alex");
    assert.equal(calls - beforeRelay, 2, "a route with multiple doors uses two response stages");
    assert.doesNotMatch(prompts.slice(-2).join("\n"), /SECRET OFFICE DETAILS|SECRET BEDROOM/);
    assert.ok(
      relayed.session.lines.some(
        (line) =>
          line.contactHidden &&
          line.speakerId === "messenger" &&
          line.content === "Alex, are you there?" &&
          line.heardBy.includes("alex"),
      ),
      "the target's ledger records the request actually relayed",
    );
    const relayEvidence = relayed.session.submissions.at(-1)?.contactEvidence?.relay;
    assert.deepEqual(
      relayEvidence?.path,
      ["common", "exterior", "public"],
      "relay approaches an authorized boundary beyond one hop",
    );
    assert.equal(contactPosition(relayed.session, "messenger"), "common", "the messenger returns after the relay");
    assert.equal(relayed.session.zoneId, "exterior");
    assert.equal(relayed.session.entryOffers?.[0]?.zoneId, "office");
    const publicReply = publicSceneResponse(relayed);
    assert.doesNotMatch(
      JSON.stringify(publicReply),
      /SECRET OFFICE DETAILS|SECRET BEDROOM|sceneAttendance|contactEvidence|characterZoneId|contactHidden|checkpoints|attempts|snapshot/,
    );
    assert.ok(
      !publicReply.session.lines.some((line) => line.speakerId === "alex"),
      "offscreen speech remains server-only",
    );
    assert.match(publicReply.session.lines.at(-1)!.content, /alex says/i);
    assert.equal(relayed.session.lines.at(-1)!.contactReport, true);
    assert.equal(publicReply.session.lines.at(-1)!.contactReport, undefined);
    assert.deepEqual(publicReply.session.activeIds, []);
    const againCalls = calls;
    await attempt(scene.id, "relay", "alex");
    assert.equal(calls, againCalls);
    await discardVenueVisitDebug(scene.id);

    behavior = "relay-move";
    scene = await open();
    const movedRelay = await attempt(scene.id, "move-and-relay", "alex");
    assert.deepEqual(
      movedRelay.session.submissions.at(-1)?.contactEvidence?.relay?.path,
      ["exterior", "public"],
      "a messenger travels from their evidenced new position",
    );
    assert.deepEqual(movedRelay.session.activeIds, ["messenger"]);
    assert.equal(
      movedRelay.session.lines.at(-1)?.viaDoorway,
      undefined,
      "the returned report uses the messenger's physical position",
    );
    await discardVenueVisitDebug(scene.id);
    behavior = "relay";

    scene = await open();
    failSave = true;
    const crashCalls = calls;
    await assert.rejects(attempt(scene.id, "crash", "alex"), /save interrupted/);
    const interrupted = (await activeVenueSession())!;
    assert.equal(interrupted.operation?.status, "interrupted");
    const recovered = await attempt(scene.id, "crash", "alex", interrupted.operation!.attemptId);
    assert.equal(calls - crashCalls, 2, "saved response checkpoints survive a failed Scene save");
    assert.equal(recovered.session.submissions.filter((entry) => entry.id === "crash").length, 1);
    await discardVenueVisitDebug(scene.id);

    scene = await open();
    const naturalCalls = calls;
    const natural = await sendVenueTurn({
      sessionId: scene.id,
      message: "I raise my voice toward the house and ask for Alex.",
      mode: "chat",
      targetId: "",
      submissionId: "natural",
    });
    assert.equal(
      calls - naturalCalls,
      3,
      "natural interpretation reuses the normal reply, followed by bounded contact and relay",
    );
    assert.ok(natural.session.entryOffers?.some((offer) => offer.zoneId === "office"));
    await discardVenueVisitDebug(scene.id);

    behavior = "quiet";
    scene = await open();
    const silent = await attempt(scene.id, "quiet");
    assert.equal(silent.session.lines.at(-1)!.content, "No answer.");
    assert.deepEqual(silent.session.participants, [], "silence does not disclose who is inside");
    await discardVenueVisitDebug(scene.id);

    behavior = "silent-heard";
    scene = await open();
    const unheardPublic = await attempt(scene.id, "silent-heard");
    assert.equal(unheardPublic.session.lines.at(-1)!.content, "No answer.");
    assert.ok(unheardPublic.session.lines.some((line) => line.contactHidden && line.heardBy.includes("messenger")));
    const silentPublic = publicSceneResponse(unheardPublic);
    assert.deepEqual(silentPublic.session.participants, []);
    assert.deepEqual(silentPublic.session.heardHistory, [], "unseen silent listeners stay server-only");
    assert.doesNotMatch(JSON.stringify(silentPublic.session.lines), /messenger/);
    assert.ok(
      (await activeVenueSession())!.heardHistory.some((entry) => entry.characterId === "messenger"),
      "silent hearing survives refresh server-side",
    );
    await discardVenueVisitDebug(scene.id);

    await mutateVillageState((current) => {
      current.villagers.push(villager("trina", "house", "exterior"), villager("dozy", "house", "office", "Sleeping"));
      current.venues[0]!.workerIds = ["alex", "dozy"];
    });
    behavior = "distant";
    scene = await open();
    assert.deepEqual(scene.activeIds, ["trina"]);
    const loudMessage = "I shout loudly toward the house: Alex, can you hear me?";
    const loudCalls = calls;
    const loud = await sendVenueTurn({
      sessionId: scene.id,
      message: loudMessage,
      mode: "contact",
      targetId: "alex",
      submissionId: "loud",
      contact: { kind: "call", targetId: "alex", boundaryZoneId: "", quote: loudMessage },
    });
    assert.equal(calls - loudCalls, 1);
    assert.deepEqual(loud.session.activeIds, ["trina"], "remote speech does not teleport the speaker");
    assert.equal(loud.session.lines.at(-1)!.remoteDelivery, "loud");
    const callWitnesses = loud.session.lines.find(
      (line) => line.contactHidden && line.content === loudMessage,
    )!.heardBy;
    assert.deepEqual(callWitnesses.sort(), ["alex", "trina"], "a possible listener does not automatically hear");
    assert.ok(!callWitnesses.includes("messenger") && !callWitnesses.includes("dozy"));
    assert.doesNotMatch(
      JSON.stringify(publicSceneResponse(loud)),
      /dozy|sceneAttendance|characterZoneId|SECRET OFFICE DETAILS|SECRET BEDROOM/,
    );
    const remoteFollowup = await sendVenueTurn({
      sessionId: scene.id,
      message: "Thanks. How is your morning going?",
      mode: "chat",
      targetId: "",
      submissionId: "loud-followup",
    });
    assert.equal(remoteFollowup.session.lines.at(-1)!.speakerId, "alex");
    assert.equal(
      remoteFollowup.session.doorwayContacts!.find((entry) => entry.characterId === "alex")!.delivery,
      "loud",
    );
    behavior = "distant-silent-witness";
    const silentWitness = await sendVenueTurn({
      sessionId: scene.id,
      message: "Good morning everyone.",
      mode: "chat",
      targetId: "",
      submissionId: "silent-witness",
    });
    assert.ok(silentWitness.session.lines.some((line) => line.contactHidden && line.heardBy.includes("dozy")));
    assert.doesNotMatch(
      JSON.stringify(publicSceneResponse(silentWitness)),
      /dozy|Dozy/,
      "unseen actual witnesses and their recollections remain server-only",
    );
    behavior = "distant-local";
    const local = await sendVenueTurn({
      sessionId: scene.id,
      message: "Trina, what do you think?",
      mode: "chat",
      targetId: "",
      submissionId: "local-addressee",
    });
    assert.equal(local.session.lines.at(-1)!.speakerId, "trina");
    assert.ok(local.session.lines.at(-1)!.heardBy.includes("alex"), "addressing the local resident is not isolation");
    assert.match(prompts.at(-1)!, /Intended addressee: trina/);
    behavior = "distant-approach";
    const closer = await sendVenueTurn({
      sessionId: scene.id,
      message: "Would you like to come closer?",
      mode: "chat",
      targetId: "",
      submissionId: "approach",
    });
    assert.equal(contactPosition(closer.session, "alex"), "common");
    assert.deepEqual(closer.session.activeIds, ["trina"], "an intermediate arrival stays out of the physical cast");
    assert.equal(
      closer.session.doorwayContacts!.find((entry) => entry.characterId === "alex")!.characterZoneId,
      "common",
    );
    behavior = "distant-end";
    const ended = await sendVenueTurn({
      sessionId: scene.id,
      message: "See you later!",
      mode: "chat",
      targetId: "",
      submissionId: "distant-end",
    });
    assert.equal(ended.session.status, "active");
    assert.deepEqual(ended.session.doorwayContacts, []);
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
    behavior = "distant";
    scene = await open();
    const deviceMessage = "I use the intercom to ask Alex if he is listening.";
    const device = await sendVenueTurn({
      sessionId: scene.id,
      message: deviceMessage,
      mode: "contact",
      targetId: "alex",
      submissionId: "device",
      contact: {
        kind: "call",
        targetId: "alex",
        boundaryZoneId: "",
        quote: deviceMessage,
        delivery: "device",
        deviceFeatureId: "intercom",
      },
    });
    assert.equal(device.session.lines.at(-1)!.remoteDelivery, "device");
    assert.deepEqual(device.session.activeIds, []);
    const deviceFollowup = await sendVenueTurn({
      sessionId: scene.id,
      message: "Thanks for answering.",
      mode: "chat",
      targetId: "",
      submissionId: "device-followup",
    });
    assert.equal(deviceFollowup.session.lines.at(-1)!.remoteDelivery, "device");
    await discardVenueVisitDebug(scene.id);
    scene = await open();
    await assert.rejects(
      () =>
        sendVenueTurn({
          sessionId: scene.id,
          message: deviceMessage,
          mode: "contact",
          targetId: "alex",
          submissionId: "invented-device",
          contact: {
            kind: "call",
            targetId: "alex",
            boundaryZoneId: "",
            quote: deviceMessage,
            delivery: "device",
            deviceFeatureId: "invented",
          },
        }),
      /not an established feature/,
    );
    await discardVenueVisitDebug(scene.id);

    behavior = "move";
    scene = await open();
    const arrived = await attempt(scene.id, "arrive");
    assert.deepEqual(arrived.session.activeIds, ["messenger"]);
    assert.equal(contactPosition(arrived.session, "messenger"), "exterior");
    assert.deepEqual(arrived.session.doorwayContacts, []);
    await discardVenueVisitDebug(scene.id);

    await mutateVillageState((current) => {
      const messenger = current.villagers.find((person) => person.characterId === "messenger")!;
      messenger.agenda!.activeDay!.blocks[0]!.zoneId = "private:alex";
      current.venues[0]!.residentIds = ["alex"];
    });
    // Pure evidence rejection uses the same immutable Scene facts, without inventing a journey.
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
    await assert.rejects(
      () =>
        sendVenueTurn({
          sessionId: scene.id,
          message: "Hello there.",
          mode: "chat",
          targetId: "",
          submissionId: "invalid-parser",
        }),
      /failed validation \(invalid-segments\)/,
    );
    assert.equal(calls - invalidCalls, 1, "invalid Scene replies are not automatically retried");
    behavior = "answer";
    const beforeExplicitRetry = calls;
    await sendVenueTurn({
      sessionId: scene.id,
      message: "Hello there.",
      mode: "chat",
      targetId: "",
      submissionId: "invalid-parser",
    });
    assert.equal(
      calls - beforeExplicitRetry,
      1,
      "known invalid completions can be explicitly retried without replaying the same rejected draft",
    );
    assert.ok(debugLogs.some((line) => line.includes("scene parser rejection") && line.includes("unreadable speaker")));
    assert.ok(!debugLogs.some((line) => line.includes("scene repair")), "rejected replies have no automatic repair");
    assert.ok(
      debugLogs.some(
        (line) =>
          line.includes("submission replay") ||
          line.includes("checkpoint replay") ||
          line.includes("completion replay"),
      ),
      "replayed completions are identifiable in logs",
    );
    assert.ok(debugLogs.some((line) => line.includes("contact routing") && line.includes("possibleListeners")));
    console.log("Contact routing, witnessed speech, relay travel, explicit entry, refresh, and replay passed.");
  } finally {
    release();
  }
}
void main();
