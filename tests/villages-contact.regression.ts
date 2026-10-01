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
const release = configureVillagesRuntime({
  logger: { debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} },
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
            if (behavior === "end") {
              result.contactEnd = [{ speakerId: "messenger", quote }];
              result.sceneEnded = { speakerId: "messenger", quote };
            }
            if (behavior === "move") {
              result.segments.push({ kind: "narration", text: "Messenger steps outside.", heardBy: audience });
              result.contactMoves = [{ characterId: "messenger", zoneId: "exterior", quote }];
            }
          } else if (user === "I raise my voice toward the house and ask for Alex.") {
            result.contactIntent = { kind: "call", targetId: "alex", boundaryZoneId: "common", quote: user };
          }
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
    await attempt(scene.id, "followup");
    assert.match(prompts.at(-1)!, /Yes, I'm listening/, "follow-ups receive witnessed doorway history");
    behavior = "end";
    await attempt(scene.id, "end");
    assert.deepEqual((await activeVenueSession())!.doorwayContacts, []);
    assert.equal((await activeVenueSession())!.status, "active", "a doorway goodbye leaves the Venue Scene open");
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
    console.log("Contact routing, witnessed speech, relay travel, explicit entry, refresh, and replay passed.");
  } finally {
    release();
  }
}
void main();
