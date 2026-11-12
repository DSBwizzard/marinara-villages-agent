import assert from "node:assert/strict";
import { runCase } from "../../scripts/test-cases.mjs";
import { createHash, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { verifyPackage } from "../../scripts/verify-package.mjs";
import { packagedSceneServer } from "./packaged-scene-server.fixture.js";
import { fixtureVillageState } from "../helpers/village-storage.fixture.js";
import { draftRenovationProject } from "../../packages/villages/src/server/features/projects/project-drafts.js";
import { initializeVenueAccess } from "../../packages/villages/src/server/domain/rules/venue-access.js";
import { defaultVenueSpace } from "../../packages/villages/src/server/domain/rules/venue-model.js";
import { continuityActor } from "../../packages/villages/src/server/domain/rules/continuity-actors.js";
import {
  continuityViews,
  continuityProtectionUnits,
  emptyContinuity,
} from "../../packages/villages/src/server/domain/rules/continuity.js";
import { retainNativeFact } from "../../packages/villages/src/server/domain/rules/native-continuity.js";
import { assertContinuityRetention } from "../../packages/villages/src/server/domain/rules/continuity-retention.js";
import { actorEpisodeView, emptyEpisodes } from "../../packages/villages/src/server/domain/rules/episodes.js";
import {
  narrationContinuityContext,
  fittedNarrationReadset,
} from "../../packages/villages/src/server/domain/rules/narration-context.js";
import { acceptNarration } from "../../packages/villages/src/server/domain/rules/narration-native.js";
import { applyAcceptedSceneDelta } from "../../packages/villages/src/server/domain/rules/scene-delta.js";
import { zoneEventScene } from "../../packages/villages/src/server/domain/rules/zone-events.js";
import { readEpisodes } from "../../packages/villages/src/server/domain/decoding/episode-codec.js";
import type { VillageState } from "../../packages/villages/src/server/domain/models/world.js";
import type { VenueScene } from "../../packages/villages/src/server/domain/models/scene-model.js";

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
const dialogue = (speakerId: string, text: string, id = "said") => ({ id, kind: "dialogue", speakerId, text });
const narration = (text: string, id = "seen") => ({ id, kind: "narration", text });
const actorFor = (id: SceneCostCase) => (id === "rich-resident" ? "aqua" : "mara");

export function configureSceneCostWorld(world: VillageState, now: string, id: SceneCostCase) {
  const actor = actorFor(id),
    ids = ["multi-resident", "movement-privacy"].includes(id) ? [actor, "bryn"] : [actor];
  world.seed = "scene-cost:" + id;
  world.villagers = ids.map((characterId) => ({
    ...structuredClone(world.villagers[0]),
    characterId,
    incarnation: "scene-cost:" + characterId,
    cardSnapshot: {
      ...world.villagers[0].cardSnapshot,
      id: characterId,
      name: characterId,
      systemPrompt: characterId + " chooses independently and can refuse.",
      description:
        characterId +
        " restores wooden objects and treasures quiet company. She speaks plainly, notices specific details, and dislikes promises made casually. AUTHORED DESCRIPTION END " +
        characterId,
      personality: "Practical, patient, particular about consent, quietly playful with trusted company.",
      backstory:
        "A patient mentor taught her to repair an old mill. She hopes to share that care without deciding other people's lives for them.",
      scenario: "She lives in a small riverside village and is talking with a visitor at the mill.",
      appearance: "A canvas coat with carefully patched cuffs.",
      exampleDialogue: characterId + ": I can help you plan it. That isn't a promise to build it.",
      postHistoryInstructions: "Preserve " + characterId + "'s dry cadence and independent priorities.",
    },
  }));
  const venue = world.venues[0];
  venue.zones!.find((zone) => zone.id === "common")!.description = "A wooden bench stands against the wall.";
  initializeVenueAccess(venue);
  venue.access!.managerIds = [actor];
  const retain = (key: string, text: string, desire = false) => {
    const candidate =
      id === "rich-resident" ? { ...world, continuity: emptyContinuity(), episodes: emptyEpisodes() } : world;
    retainNativeFact(
      candidate,
      {
        id: key,
        kind: "initialization",
        targetId: actor,
        revision: 1,
        text,
        witnesses: [actor],
      },
      now,
      desire ? { class: "desire", owner: continuityActor(world, actor)! } : { class: "experience" },
    );
    if (candidate !== world) {
      // Independent founding facts share one fresh publication, validated together before storage.
      world.continuity.revision += candidate.continuity.revision;
      world.continuity.records.push(...candidate.continuity.records);
      world.continuity.versions.push(...candidate.continuity.versions);
      Object.assign(world.continuity.receipts, candidate.continuity.receipts);
      world.episodes.revision += candidate.episodes.revision;
      world.episodes.records.push(...candidate.episodes.records);
    }
  };
  if (id.startsWith("wish-")) retain("recipe", "I want to share my complete leek-soup recipe in conversation.", true);
  if (id.startsWith("project-"))
    draftRenovationProject(
      world,
      "mill",
      { title: "Larger Common room", detail: "Residence capacity three.", capacity: 3 },
      "project:common",
    );
  if (["invitation", "refusal", "movement-privacy"].includes(id)) {
    venue.zones!.find((zone) => zone.id === "common")!.connectedTo!.push("workshop");
    venue.zones!.push({
      ...defaultVenueSpace("other"),
      id: "workshop",
      name: "Workshop",
      kind: id === "movement-privacy" ? "public" : "restricted",
      connectedTo: ["common"],
      description: "A workbench stands beside the workshop window.",
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
    for (let index = 0; index < 1000; index++)
      retain("experience:" + index, "Earlier repair " + index + ": I learned to match the grain of old wooden boards.");
    for (let index = 0; index < 40; index++) {
      retain("desire:" + index, "I want to share an afternoon discussing craft " + index + ".", true);
      for (let event = 0; event < 30; event++)
        retain(
          "craft-history:" + index + ":" + event,
          "The earlier craft conversation " + index + " included detail " + event + ".",
        );
    }
    assertContinuityRetention(world.continuity, world.episodes);
  }
}

function seedConversation(world: VillageState, scene: VenueScene) {
  for (let index = 0; index < 201; index++) {
    const message = "Earlier question " + index + ": what do you notice in the wood?",
      text = index
        ? "Earlier conversation " + index + ": " + "We discussed the grain of the wooden bench. ".repeat(12)
        : "I prefer ginger tea when it is hot.",
      operationId = "cost-history:" + index,
      venue = world.venues[0],
      context = narrationContinuityContext(
        world,
        zoneEventScene(scene, venue),
        venue,
        operationId,
        message,
        scene.startedAt,
      ),
      readset = fittedNarrationReadset(
        world,
        context,
        context.parts.map((part) => part.block.evidenceId!),
      ),
      raw = {
        segments: [dialogue("mara", text)],
        ...(index === 0
          ? {
              keep: [
                {
                  for: ["mara", "player"],
                  class: "information",
                  text: "Mara prefers hot ginger tea.",
                  source: ["said"],
                },
              ],
            }
          : {}),
      },
      accepted = acceptNarration(world, { raw, readset, responseDigest: hash(raw) }, operationId, scene.startedAt);
    assert(!accepted.held && accepted.episode, JSON.stringify(accepted.rejected));
    const episode = accepted.episode;
    applyAcceptedSceneDelta(scene, episode);
    scene.lines.push(
      {
        id: "input:" + operationId,
        inputOf: operationId,
        role: "user",
        kind: "input",
        speakerId: "player",
        name: "Player",
        content: message,
        at: scene.startedAt,
        heardBy: [],
      },
      ...episode.segments,
    );
    scene.submissions.push({
      id: operationId,
      message,
      mode: "chat",
      targetId: "",
      at: scene.startedAt,
      requestFingerprint: hash(["chat", "", null, message]),
      acceptance: { status: "applied", rejected: [] },
      episodeId: episode.id,
      progressProcessedAt: scene.startedAt,
      replyLineIds: episode.segments.map((line) => line.id),
      activeIdsAtTurn: [...scene.activeIds],
      activeIdsAfterTurn: [...scene.activeIds],
    });
    scene.sceneRevision++;
    world.episodes = readEpisodes(world.episodes, world.seed);
  }
}

function response(id: SceneCostCase, messages: any[]) {
  const actor = actorFor(id),
    said = dialogue(actor, "I like the quiet here. What caught your attention today?"),
    disclosure = {
      id: "tea",
      for: [actor, "player"],
      class: "information",
      about: [actor],
      text: actor + " says she prefers hot ginger tea.",
      source: ["said"],
    },
    stance = {
      id: "stance",
      for: [actor],
      owner: actor,
      class: "perspective",
      about: ["player"],
      current: true,
      text: "I feel more at ease with Player after being listened to.",
      source: ["self"],
    },
    cup = {
      id: "cup",
      for: "room",
      text: "A cup sits on the wooden bench.",
      knownBy: [actor, "player"],
      source: [{ segment: "seen", perceive: { kind: "seen", by: [actor, "player"] } }],
    };
  switch (id) {
    case "multi-resident":
      return {
        segments: [
          dialogue(actor, "I prefer the quieter bench."),
          dialogue("bryn", "Then I'll sit near the window.", "bryn"),
        ],
      };
    case "mixed-input":
      return { segments: [dialogue(actor, "Good morning. There's room on the bench.")] };
    case "disclosure":
      return { segments: [dialogue(actor, "I prefer ginger tea when it is hot.")], keep: [disclosure] };
    case "relationship":
      return { segments: [dialogue(actor, "Thank you for listening without promising for me.")], keep: [stance] };
    case "wish-progress":
    case "wish-fulfilled": {
      const packets = messages
        .flatMap((row) => row.content.split("\n"))
        .filter((row: string) => row.startsWith('{"privateContinuity":'))
        .map(JSON.parse);
      const desire = packets
        .flatMap((packet: any) => packet.privateContinuity)
        .find((row: any) => row.class === "desire");
      assert(desire, "the native current desire must actually be fitted before replacement");
      return {
        segments: [
          dialogue(
            actor,
            id === "wish-fulfilled"
              ? "My leek soup uses leeks, potatoes and broth, simmered until tender. That's the whole recipe."
              : "For my leek soup, start by slicing the leeks. I'll explain the rest next.",
          ),
        ],
        keep: [
          {
            id: "recipe",
            for: [actor],
            owner: actor,
            class: "desire",
            replace: desire.id,
            text:
              id === "wish-fulfilled"
                ? "I shared my complete leek-soup recipe."
                : "I still want to finish sharing my leek-soup recipe, after explaining how to slice the leeks.",
            ...(id === "wish-fulfilled" ? { retire: "fulfilled" } : { current: true }),
            source: ["said"],
          },
        ],
      };
    }
    case "project-discussion":
    case "project-commitment":
      return {
        segments: [
          dialogue(
            actor,
            id === "project-commitment"
              ? "I approve this exact Larger Common room design, and I want to lead its construction."
              : "I might lead this design, but only if Bryn agrees first. I am not committing today.",
          ),
        ],
        commands: (id === "project-commitment" ? ["approval", "builder"] : ["conditional"]).map((decision) => ({
          id: decision,
          type: "project.decide",
          by: actor,
          project: "project:common",
          decision,
          at: "said",
          source: ["said"],
        })),
      };
    case "invitation":
    case "refusal":
      return {
        segments: [
          dialogue(
            actor,
            id === "invitation"
              ? "You're welcome to visit my Workshop with me now."
              : "No, I don't want visitors in my Workshop now.",
          ),
        ],
        commands: [
          {
            id: "entry",
            type: "access.decide",
            by: actor,
            venue: "mill",
            zone: "workshop",
            decision: {
              outcome: id === "invitation" ? "invite-now" : "refuse",
              visitor: "player",
              ...(id === "invitation" ? { accompanies: true } : {}),
            },
            at: "said",
            source: ["said"],
          },
        ],
      };
    case "physical":
      return { segments: [{ ...narration("Mara sets her cup on the wooden bench."), requires: ["cup"] }], keep: [cup] };
    case "movement-privacy":
      return {
        segments: [
          dialogue("bryn", "PRIVATE WORDS BEFORE CROSSING", "before"),
          { ...narration("Bryn crosses from the Workshop into the Common room.", "cross"), requires: ["move"] },
          dialogue("bryn", "Now we can talk here.", "after"),
        ],
        commands: [
          {
            id: "move",
            type: "move",
            who: "bryn",
            to: "common",
            at: "cross",
            source: [{ segment: "cross", perceive: { kind: "seen", by: ["player"] } }],
          },
        ],
      };
    case "combined":
      return {
        segments: [
          dialogue(actor, "Thank you for listening. I prefer hot ginger tea."),
          { ...narration("Mara sets her cup on the wooden bench."), requires: ["cup"] },
        ],
        keep: [disclosure, stance, cup],
      };
    default:
      return { segments: [said] };
  }
}

export async function runSceneCostFixtures(selected: readonly SceneCostCase[] = sceneCostCases) {
  const root = resolve(import.meta.dirname, "../.."),
    build = JSON.parse(await readFile(resolve(root, ".build-tmp/package-build.json"), "utf8")),
    packageProof = await verifyPackage(root, build.retainedArchivePath);
  assert.equal(packageProof.sha256, build.sha256);
  for (const input of build.inputs)
    assert.equal(
      createHash("sha256")
        .update(await readFile(resolve(root, input.path)))
        .digest("hex"),
      input.sha256,
      "Rebuild changed input: " + input.path,
    );
  const results = [];
  for (const id of selected)
    await runCase("scene-cost/" + id, async () => {
      const actor = actorFor(id),
        message =
          id === "greeting"
            ? ""
            : id === "mixed-input"
              ? '  I privately think "hidden key", then say "Good morning." *waves*\n  '
              : id === "movement-privacy"
                ? "Bryn, could you come into the Common room?"
                : id === "physical"
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
        configureScene(scene, world) {
          const ids = world.villagers.map((resident) => resident.characterId);
          scene.activeIds = id === "multi-resident" ? ids : [actor];
          scene.participants = ids.map((characterId) => ({ characterId, name: characterId, doing: "Talking" }));
          scene.sceneAttendance!.occupants = scene.participants.map((person) => ({
            ...person,
            zoneId: id === "movement-privacy" && person.characterId === "bryn" ? "workshop" : "common",
          }));
          scene.accompanying = scene.sceneAttendance!.occupants.map(({ characterId, zoneId }) => ({
            characterId,
            zoneId,
          }));
          if (id === "greeting") scene.status = "opening";
          if (id === "long-history") seedConversation(world, scene);
        },
      });
      host.model.chatComplete = async (messages: any[]) => {
        const content = JSON.stringify(response(id, messages)),
          bytes = Buffer.byteLength(JSON.stringify(messages), "utf8");
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
        if (id === "long-history")
          assert(
            JSON.stringify(messages).includes("Mara prefers hot ginger tea."),
            "the useful retained answer survives a long conversation without resending every utterance",
          );
        if (id === "rich-resident") {
          const entries = messages
            .flatMap((row) => row.content.split("\n"))
            .filter((line: string) => line.startsWith('{"privateContinuity":'))
            .flatMap((line: string) => JSON.parse(line).privateContinuity);
          const desires = entries.filter((row: any) => row.current && row.class === "desire");
          assert(
            desires.length > 0 && desires.length < 40,
            "bounded keyword-independent initiative offers a current desire without injecting all40",
          );
          assert(desires.every((row: any) => row.text.startsWith("I want to share an afternoon discussing craft ")));
          assert(bytes < 200000, "rich continuity is selected rather than serializing its entire history");
        }
        return { content, finishReason: "stop" };
      };
      const started = performance.now();
      try {
        const active = await host.app.inject({ method: "GET", url: "/api/villages/rooms/active" });
        assert.equal(active.statusCode, 200, active.body);
        const url = id === "greeting" ? "/api/villages/rooms/greet" : "/api/villages/rooms/turn",
          payload =
            id === "greeting"
              ? { sessionId: "browser" }
              : {
                  sessionId: "browser",
                  submissionId: randomUUID(),
                  message,
                  mode: "chat",
                  targetId: "",
                  expectedSceneRevision: host.scene().sceneRevision,
                },
          accepted = await host.app.inject({ method: "POST", url, payload });
        assert.equal(
          accepted.statusCode,
          200,
          id + ": " + accepted.body + " " + JSON.stringify(host.scene().submissions.at(-1)?.acceptance),
        );
        const world = fixtureVillageState(host.records.get("villages-village").data, host.records),
          scene = host.scene(),
          turn = scene.submissions.at(-1)!,
          episode = world.episodes.records.find((row) => row.id === turn.episodeId)!,
          holder = continuityActor(world, actor)!,
          own = continuityViews(
            world.continuity,
            holder,
            new Date().toISOString(),
            continuityProtectionUnits(world.continuity, holder, new Map()),
          );
        assert.equal(turn.acceptance.status, "applied", id + ": " + JSON.stringify(turn.acceptance.rejected));
        assert(episode);
        assert.equal(turn.message, message, "the exact original is retained without classification");
        if (id === "mixed-input") {
          const input = scene.lines.find((line) => line.inputOf === turn.id)!;
          assert.equal(input.kind, "input");
          assert.equal(input.content, message);
          assert.deepEqual(input.heardBy, []);
          assert(!scene.lines.some((line) => line.role === "user" && line.kind === "dialogue"));
          assert(
            !JSON.stringify(actorEpisodeView(episode, world.continuity, holder, world.episodes)).includes("hidden key"),
          );
        }
        if (id === "disclosure" || id === "combined") {
          assert(own.some((row) => row.version.class === "information" && row.version.text.includes("ginger tea")));
          const player = continuityActor(world, "player")!;
          assert(
            continuityViews(
              world.continuity,
              player,
              turn.at,
              continuityProtectionUnits(world.continuity, player, new Map()),
            ).some((row) => row.version.text.includes("ginger tea")),
          );
        }
        if (id === "relationship" || id === "combined")
          assert(
            own.some(
              (row) => row.current && row.version.class === "perspective" && row.version.text.includes("more at ease"),
            ),
          );
        if (id.startsWith("wish-")) {
          const desire = own.find((row) => row.version.class === "desire")!;
          assert(desire);
          assert.equal(desire.version.closed?.reason, id === "wish-fulfilled" ? "fulfilled" : undefined);
          assert.equal(desire.current, id !== "wish-fulfilled");
        }
        if (id.startsWith("project-")) {
          const flow = world.projects[0].lifecycle!;
          assert.equal(world.projects[0].status, "planning");
          assert.equal(flow.approvals.length, id === "project-commitment" ? 1 : 0);
          assert.equal(flow.candidates.length, id === "project-commitment" ? 1 : 0);
          assert.equal(flow.workOrder, null);
        }
        if (id === "physical" || id === "combined")
          assert(
            continuityViews(
              world.continuity,
              { kind: "room", placeId: "mill", zoneId: "common" },
              turn.at,
              continuityProtectionUnits(
                world.continuity,
                { kind: "room", placeId: "mill", zoneId: "common" },
                new Map(),
              ),
            ).some((row) => row.version.text.includes("cup")),
          );
        if (id === "invitation" || id === "refusal") {
          assert.equal(scene.zoneId, "common", "access decisions never move Player");
          if (id === "invitation")
            assert(
              world.venues[0].access!.permissions.some(
                (row) => row.sceneId === scene.id && row.visitorId === "player" && row.accompaniedBy === actor,
              ),
            );
          else
            assert(
              world.venues[0].access!.visitDenials.some(
                (row) => row.sceneId === scene.id && row.visitorId === "player",
              ),
            );
        }
        if (id === "movement-privacy") {
          const privateLine = scene.lines.find((line) => line.content.includes("PRIVATE WORDS"))!;
          assert(!privateLine.heardBy.includes("player"));
          assert(!accepted.body.includes("PRIVATE WORDS"));
          assert.equal(scene.accompanying!.find((row) => row.characterId === "bryn")!.zoneId, "common");
          assert(scene.lines.find((line) => line.content === "Now we can talk here.")!.heardBy.includes("player"));
        }
        if (id === "long-history") {
          assert.equal(scene.submissions.length, 202, "the long history consists of accepted native turns");
          assert(scene.lines.some((line) => line.content === "I prefer ginger tea when it is hot."));
          assert(
            world.episodes.records.some(
              (row) =>
                row.privateInput.startsWith("Earlier question 0:") &&
                row.segments.some((line) => line.content === "I prefer ginger tea when it is hot."),
            ),
            "the original interaction remains retained beyond the selected prompt context",
          );
        }
        if (id === "rich-resident") {
          assert(own.length >= 2240);
          assert.equal(own.filter((row) => row.current && row.version.class === "desire").length, 40);
        }
        assert.equal(calls.length, 1, id + " purchases one GM response");
        const replay = await host.app.inject({ method: "POST", url, payload });
        assert.equal(replay.statusCode, 200, replay.body);
        assert.equal(calls.length, 1, "replay makes no replacement request");
        assert.equal(host.scene().submissions.length, scene.submissions.length);
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
          continuityRecords: world.continuity.records.length,
          continuityVersions: world.continuity.versions.length,
          nativeEpisodes: world.episodes.records.length,
        });
      } finally {
        await host.stop();
      }
    });
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
