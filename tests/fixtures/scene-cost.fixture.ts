import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { verifyPackage } from "../../scripts/verify-package.mjs";
import { packagedSceneServer } from "./packaged-scene-server.fixture.js";
import { fixtureVillageState, fixtureRelationshipState } from "../helpers/village-storage.fixture.js";
import { fixtureWish } from "../helpers/social-wishes-fixture.js";
import { realisticMemoryHistory } from "../helpers/memories-fixture.js";
import { draftRenovationProject } from "../../packages/villages/src/server/features/projects/project-drafts.js";
import { relationshipDocumentId } from "../../packages/villages/src/server/adapters/storage/relationship-payload-store.js";
import {
  defaultRelationshipState,
  relationshipKey,
} from "../../packages/villages/src/server/domain/rules/relationship-rules.js";
import { initializeVenueAccess } from "../../packages/villages/src/server/domain/rules/venue-access.js";
import { defaultVenueSpace } from "../../packages/villages/src/server/domain/rules/venue-model.js";
import type { VillageState } from "../../packages/villages/src/server/domain/models/world.js";

export const sceneCostCases = [
  "ordinary",
  "greeting",
  "multi-resident",
  "mixed-input",
  "disclosure",
  "relationship",
  "wish-progress",
  "wish-fulfilled",
  "project-discussion",
  "project-commitment",
  "invitation",
  "refusal",
  "physical",
  "movement-privacy",
  "combined",
  "long-history",
  "rich-resident",
] as const;
export type SceneCostCase = (typeof sceneCostCases)[number];
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const dialogue = (speakerId: string, text: string) => ({ kind: "dialogue", speakerId, text });
const narration = (text: string) => ({ kind: "narration", text });

export function configureSceneCostWorld(world: VillageState, now: string, id: SceneCostCase) {
  const actor = id === "rich-resident" ? "aqua" : "mara";
  const ids = id === "multi-resident" || id === "movement-privacy" ? [actor, "bryn"] : [actor];
  world.seed = "scene-cost:" + id;
  world.relationshipContext = defaultRelationshipState(world.seed);
  world.villagers = ids.map((characterId) => ({
    ...structuredClone(world.villagers[0]),
    characterId,
    cardSnapshot: {
      ...world.villagers[0].cardSnapshot,
      id: characterId,
      name: characterId,
      systemPrompt: `${characterId} chooses independently and can refuse.`,
      description: `${characterId} restores wooden objects and treasures quiet company. She speaks plainly, notices specific details, and dislikes promises made casually. AUTHORED DESCRIPTION END ${characterId}`,
      personality: "Practical, patient, particular about consent, quietly playful with trusted company.",
      backstory:
        "A patient mentor taught her to repair an old mill. She hopes to share that care without deciding other people's lives for them.",
      scenario: "She lives in a small riverside village and is talking with a visitor at the mill.",
      appearance: "A canvas coat with carefully patched cuffs.",
      exampleDialogue: `${characterId}: I can help you plan it. That isn't a promise to build it.`,
      postHistoryInstructions: `Preserve ${characterId}'s dry cadence and independent priorities.`,
    },
    wishes: [],
  }));
  world.venues[0].zones!.find((zone) => zone.id === "common")!.description = "A wooden bench stands against the wall.";
  initializeVenueAccess(world.venues[0]);
  world.venues[0].access!.managerIds = [actor];
  if (id.startsWith("wish-")) {
    const wish = fixtureWish(
      { wish: "Share my leek-soup recipe in conversation.", reason: "Enjoys sharing recipes." },
      "recipe",
      now,
    );
    wish.attention = { state: "foreground", reason: "Ready to share the recipe." };
    world.villagers[0].wishes = [wish];
  }
  if (id.startsWith("project-"))
    draftRenovationProject(
      world,
      "mill",
      { title: "Larger Common room", detail: "Residence capacity three.", capacity: 3 },
      "project:common",
    );
  if (["invitation", "refusal", "movement-privacy"].includes(id)) {
    world.venues[0].zones!.find((zone) => zone.id === "common")!.connectedTo!.push("workshop");
    world.venues[0].zones!.push({
      ...defaultVenueSpace("other"),
      id: "workshop",
      name: "Workshop",
      kind: id === "movement-privacy" ? "public" : "restricted",
      connectedTo: ["common"],
      seen: true,
      access: {
        mode: id === "movement-privacy" ? "public" : "permission-required",
        managerIds: [actor],
        memberIds: [actor],
        memberRoles: [],
        inviterIds: [actor],
        visitorHours: "always",
        accompanied: false,
      },
    });
  }
  if (id === "rich-resident") {
    world.memories = realisticMemoryHistory(1000);
    world.villagers[0].wishes = Array.from({ length: 40 }, (_, index) => {
      const wish = fixtureWish(
        { wish: `Share an afternoon discussing craft ${index}`, reason: "Values a particular shared experience." },
        "desire:" + index,
        now,
      );
      wish.history = Array.from({ length: 30 }, (_, event) => ({
        id: `${index}:${event}`,
        at: now,
        kind: "progress",
        text: `The earlier craft conversation ${index} included detail ${event}.`,
        sourceId: "earlier:" + event,
        lineIds: ["line:" + event],
      }));
      return wish;
    });
  }
}

function response(id: SceneCostCase, message: string) {
  const actor = id === "rich-resident" ? "aqua" : "mara";
  const common = { input: message ? [{ text: message }] : [] };
  const plain = { ...common, segments: [dialogue(actor, "I like the quiet here. What caught your attention today?")] };
  switch (id) {
    case "multi-resident":
      return {
        ...common,
        segments: [dialogue(actor, "I prefer the quieter bench."), dialogue("bryn", "Then I'll sit near the window.")],
      };
    case "mixed-input":
      return {
        input: [{ text: "Good morning." }],
        segments: [dialogue(actor, "Good morning. There's room on the bench.")],
      };
    case "disclosure":
      return {
        ...common,
        segments: [dialogue(actor, "I prefer ginger tea when it is hot.")],
        events: [
          {
            type: "memory",
            at: [0],
            value: {
              kind: "information",
              text: "mara says she prefers hot ginger tea.",
              knowers: [actor, "player"],
              basis: "report",
              domain: { kind: "relationship", id: actor },
              disclosed: { kind: "preference", toId: actor },
            },
          },
        ],
      };
    case "relationship":
      return {
        ...common,
        segments: [dialogue(actor, "Thank you for listening without promising for me.")],
        events: [
          {
            type: "relationship",
            actorId: actor,
            targetId: "player",
            at: [0],
            value: { stance: "More at ease after being listened to" },
          },
        ],
      };
    case "wish-progress":
    case "wish-fulfilled":
      return {
        ...common,
        segments: [
          dialogue(
            actor,
            id === "wish-fulfilled"
              ? "My leek soup uses leeks, potatoes and broth, simmered until tender. That's the whole recipe."
              : "For my leek soup, start by slicing the leeks. I'll explain the rest next.",
          ),
        ],
        events: [
          {
            type: "wish",
            actorId: actor,
            targetId: "recipe",
            at: [0],
            value: { intent: id === "wish-fulfilled" ? "fulfilled" : "progress" },
            reason: "Shared the described recipe details in this witnessed conversation.",
          },
        ],
      };
    case "project-discussion":
    case "project-commitment":
      return {
        ...common,
        segments: [
          dialogue(
            actor,
            id === "project-commitment"
              ? "I approve this exact Larger Common room design, and I want to lead its construction."
              : "I might lead this design, but only if Bryn agrees first. I am not committing today.",
          ),
        ],
        events: (id === "project-commitment" ? ["approval", "builder"] : ["conditional"]).map((value) => ({
          type: "project",
          targetId: "project:common",
          at: [0],
          value,
        })),
      };
    case "invitation":
    case "refusal":
      return {
        ...common,
        segments: [
          dialogue(
            actor,
            id === "invitation"
              ? "You're welcome to visit my Workshop with me now."
              : "No, I don't want visitors in my Workshop now.",
          ),
        ],
        events: [
          {
            type: "access",
            targetId: "workshop",
            at: [0],
            value: {
              outcome: id === "invitation" ? "invite-now" : "refuse",
              ...(id === "invitation" ? { accompanies: true, conditions: ["accompanied"] } : {}),
            },
          },
        ],
      };
    case "physical":
      return {
        input: [],
        segments: [narration("mara sets her cup on the wooden bench.")],
        events: [
          { type: "physical", actorId: actor, at: [0], value: { recent: { text: "A cup sits on the wooden bench." } } },
        ],
      };
    case "movement-privacy":
      return {
        input: [],
        segments: [
          dialogue("bryn", "PRIVATE WORDS BEFORE CROSSING"),
          narration("bryn crosses from the Workshop into the Common room."),
          dialogue("bryn", "Now we can talk here."),
        ],
        events: [{ type: "move", actorId: "bryn", targetId: "common", at: [1] }],
      };
    case "combined":
      return {
        ...common,
        segments: [
          dialogue(actor, "Thank you for listening. I prefer ginger tea."),
          narration("mara sets her cup on the wooden bench."),
        ],
        events: [
          {
            type: "relationship",
            actorId: actor,
            targetId: "player",
            at: [0],
            value: { stance: "Reassured by this conversation" },
          },
          {
            type: "memory",
            at: [0],
            value: {
              kind: "information",
              text: "mara says she prefers ginger tea.",
              knowers: [actor, "player"],
              basis: "report",
            },
          },
          { type: "physical", actorId: actor, at: [1], value: { recent: { text: "A cup sits on the wooden bench." } } },
        ],
      };
    default:
      return plain;
  }
}

export async function runSceneCostFixtures(selected: readonly SceneCostCase[] = sceneCostCases) {
  const root = resolve(import.meta.dirname, "../..");
  const build = JSON.parse(await readFile(resolve(root, ".build-tmp/package-build.json"), "utf8"));
  const packageProof = await verifyPackage(root, build.retainedArchivePath);
  assert.equal(packageProof.sha256, build.sha256);
  for (const input of build.inputs) {
    const bytes = await readFile(resolve(root, input.path));
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      input.sha256,
      "Rebuild changed input: " + input.path,
    );
  }
  const results = [];
  for (const id of selected) {
    const actor = id === "rich-resident" ? "aqua" : "mara";
    const message =
      id === "greeting"
        ? ""
        : id === "mixed-input"
          ? 'I privately think "hidden key", then say "Good morning." *waves*'
          : id === "physical" || id === "movement-privacy"
            ? "*I wait.*"
            : id === "long-history"
              ? "Which tea did you prefer?"
              : id === "rich-resident"
                ? "How is the greenhouse repair going?"
                : id.startsWith("project-")
                  ? "What do you think of the Larger Common room design?"
                  : id.startsWith("wish-")
                    ? "Would you share your recipe?"
                    : "How are you today?";
    const calls: {
      inputCharacters: number;
      inputBytes: number;
      estimatedInputTokens: number;
      cachedPrefixHash: string;
      outputCharacters: number;
    }[] = [];
    const host = await packagedSceneServer({
      configure: (world, now) => configureSceneCostWorld(world, now, id),
      configureScene(scene) {
        scene.activeIds = id === "multi-resident" ? [actor, "bryn"] : [actor];
        scene.participants = scene.activeIds.map((characterId) => ({
          characterId,
          name: characterId,
          doing: "Talking",
        }));
        scene.accompanying = scene.activeIds.map((characterId) => ({ characterId, zoneId: "common" }));
        scene.sceneAttendance!.occupants = scene.participants.map((person) => ({ ...person, zoneId: "common" }));
        if (id === "greeting") scene.status = "opening";
        if (id === "movement-privacy") {
          scene.sceneAttendance!.occupants.push({
            characterId: "bryn",
            name: "bryn",
            doing: "Talking",
            zoneId: "workshop",
          });
          scene.accompanying!.push({ characterId: "bryn", zoneId: "workshop" });
        }
        if (id === "long-history")
          scene.lines = Array.from({ length: 201 }, (_, index) => ({
            id: "history:" + index,
            role: "assistant",
            kind: "dialogue",
            speakerId: actor,
            name: actor,
            content: index
              ? `Earlier conversation ${index}: ` + "We discussed the grain of the wooden bench. ".repeat(12)
              : "I prefer ginger tea when it is hot.",
            at: scene.startedAt,
            heardBy: [actor],
          }));
      },
    });
    host.model.chatComplete = async (messages: any[]) => {
      const content = JSON.stringify(response(id, message));
      const bytes = Buffer.byteLength(JSON.stringify(messages), "utf8");
      calls.push({
        inputCharacters: messages.reduce((sum, row) => sum + row.content.length, 0),
        inputBytes: bytes,
        estimatedInputTokens: Math.ceil(bytes / 4),
        cachedPrefixHash: hash(messages.filter((row) => row.cacheBreakpoint)),
        outputCharacters: content.length,
      });
      assert(
        messages.some((row) => row.content.includes("AUTHORED DESCRIPTION END " + actor)),
        "Complete authored identity reaches the packaged writer",
      );
      if (id === "long-history") assert(JSON.stringify(messages).includes("I prefer ginger tea when it is hot."));
      if (id === "rich-resident") {
        const line = messages
          .flatMap((row) => row.content.split("\n"))
          .find((row: string) => row.startsWith('{"context":'));
        const packet = JSON.parse(line);
        assert.equal(packet.context.actors[0].wishes.length, 40);
        assert(packet.context.actors[0].wishes.some((wish: any) => typeof wish.evidence === "string"));
      }
      return { content, finishReason: "stop" };
    };
    const started = performance.now();
    try {
      await host.app.inject({ method: "GET", url: "/api/villages/rooms/active" });
      const url = id === "greeting" ? "/api/villages/rooms/greet" : "/api/villages/rooms/turn";
      const payload =
        id === "greeting"
          ? { sessionId: "browser" }
          : {
              sessionId: "browser",
              submissionId: randomUUID(),
              message,
              mode: "chat",
              targetId: "",
              expectedSceneRevision: host.scene().sceneRevision,
            };
      const accepted = await host.app.inject({ method: "POST", url, payload });
      assert.equal(accepted.statusCode, 200, id + ": " + accepted.body);
      assert.equal(accepted.json().turnOutcome, undefined, accepted.body);
      const world = fixtureVillageState(host.records.get("villages-village").data, host.records);
      const turn = host.scene().submissions.at(-1)!;
      for (const [domain, result] of Object.entries(turn.processing!.domains))
        assert(!["failed", "pending"].includes(result.status), id + ": " + domain + " " + result.reason);
      if (id === "mixed-input") {
        const speech = host.scene().lines.filter((line) => line.role === "user" && line.kind === "dialogue");
        assert.equal(speech.length, 1);
        assert.equal(speech[0].content, "Good morning.");
        assert.equal(turn.message, message, "The private original remains available to its author");
      }
      if (id === "disclosure" || id === "combined")
        assert(world.memories.records.some((row) => row.text.includes("ginger tea")));
      if (id === "relationship" || id === "combined") {
        const social = fixtureRelationshipState(host.records.get(relationshipDocumentId(world.seed)), host.records);
        assert(social.edges[relationshipKey(actor, "player")].stance);
      }
      if (id.startsWith("wish-"))
        assert.equal(world.villagers[0].wishes[0].status, id === "wish-fulfilled" ? "fulfilled" : "open");
      if (id.startsWith("project-")) {
        const flow = world.projects[0].lifecycle!;
        assert.equal(world.projects[0].status, "planning");
        assert.equal(flow.approvals.length, id === "project-commitment" ? 1 : 0);
        assert.equal(flow.candidates.length, id === "project-commitment" ? 1 : 0);
      }
      if (id === "physical" || id === "combined")
        assert(world.venues[0].zones!.find((zone) => zone.id === "common")!.state.recent?.text.includes("cup"));
      if (id === "invitation" || id === "refusal")
        assert.equal(host.scene().zoneId, "common", "An invitation is never player travel");
      if (id === "movement-privacy") {
        const privateLine = host.scene().lines.find((line) => line.content.includes("PRIVATE WORDS"))!;
        assert.equal(privateLine.contactHidden, true);
        assert(!accepted.body.includes("PRIVATE WORDS"));
      }
      assert.equal(calls.length, 1, id + " purchases one GM response");
      const replay = await host.app.inject({ method: "POST", url, payload });
      assert.equal(replay.statusCode, 200, replay.body);
      assert.equal(calls.length, 1, "Replay makes no replacement request");
      results.push({
        id,
        path: "archive-identical-package-http",
        usageSource: "provider-free-mock",
        providerRequests: 0,
        mockedCompletions: calls.length,
        calls,
        providerUsage: null,
        providerCostUsd: null,
        providerLatencyMs: null,
        pipelineLatencyMs: Math.round(performance.now() - started),
        contractFailures: 0,
        replacements: 0,
        acceptedConsequencesChecked: true,
        replayRequests: 0,
      });
    } finally {
      await host.stop();
    }
  }
  return {
    format: 1,
    package: {
      archiveSha256: build.sha256,
      sourceRevision: build.sourceRevision,
      sourceDigest: build.sourceDigest,
      serverSha256: createHash("sha256")
        .update(await readFile(resolve(root, "packages/villages/server.mjs")))
        .digest("hex"),
    },
    measurement: "provider-free",
    disclaimer:
      "Input token estimates use UTF-8 bytes / 4 at the capability boundary. They are not provider usage, cache hits or cost-parity evidence.",
    results,
  };
}
