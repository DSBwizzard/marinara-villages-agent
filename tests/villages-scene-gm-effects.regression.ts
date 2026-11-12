// Test cases: gm-effects/npc, gm-effects/project-chat, gm-effects/project-leave, gm-effects/project-greet, gm-effects/wish, gm-effects/wish-new, gm-effects/relationship, gm-effects/relationship-answer, gm-effects/capacity, gm-effects/empty-leave, gm-effects/past-appointment, gm-effects/circumstance, gm-effects/halt, gm-effects/room-appearance, gm-effects/provider-reply
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { packagedSceneServer } from "./fixtures/packaged-scene-server.fixture.js";
import { fixtureVillageState } from "./helpers/village-storage.fixture.js";
import { draftRenovationProject } from "../packages/villages/src/server/features/projects/project-drafts.js";
import { initializeVenueAccess } from "../packages/villages/src/server/domain/rules/venue-access.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import { continuityViews, continuityGuidesHolder } from "../packages/villages/src/server/domain/rules/continuity.js";
import { continuityWishes } from "../packages/villages/src/server/domain/rules/continuity-library.js";
import { retainNativeFact } from "../packages/villages/src/server/domain/rules/native-continuity.js";
import { ensureNarrative, admitNarrative } from "../packages/villages/src/server/domain/rules/narrative-development.js";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import type { VillageState } from "../packages/villages/src/server/domain/models/world.js";
import { currentRoomViews } from "../packages/villages/src/server/domain/rules/continuity-retrieval.js";
import {
  observableRoomDescription,
  zoneAppearanceContext,
} from "../packages/villages/src/server/domain/rules/zone-picture.js";
import { createLocationImages } from "../packages/villages/src/server/features/media/location-image-service.js";
import { createVenueCommands } from "../packages/villages/src/server/features/venues/venue-service.js";

const scenarios = [
  "npc",
  "project-chat",
  "project-leave",
  "project-greet",
  "wish",
  "wish-new",
  "relationship",
  "capacity",
  "empty-leave",
  "past-appointment",
  "circumstance",
  "halt",
] as const;
const said = (text: string) => ({ id: "said", kind: "dialogue", speakerId: "mara", text });
const seen = (segment: string) => ({ segment, perceive: { kind: "seen", by: ["player"] } });
const views = (world: VillageState, id: string) =>
  continuityViews(world.continuity, continuityActor(world, id)!, world.foundedAt, new Set());
const supplied = (messages: { content: string }[]) =>
  messages
    .flatMap((row) => row.content.split("\n"))
    .filter((row) => row.startsWith('{"privateContinuity":'))
    .flatMap((row) => JSON.parse(row).privateContinuity);

await runCase("gm-effects/provider-reply", async () => {
  const host = await packagedSceneServer();
  const note = "Mara likes the morning light because it reveals hairline cracks.";
  const segments = [
    { ...said("I'll tell you why I prefer this spot."), id: "intro", requires: ["light"] },
    { ...said(note), delivery: "ordinary", requires: ["light"] },
  ];
  const keep = [
    {
      id: "light",
      for: ["mara"],
      owner: "mara",
      class: "perspective",
      facet: "stance",
      text: note,
      source: [
        { segment: "intro", perceive: { kind: "private", by: ["mara"] } },
        { segment: "said", perceive: { kind: "words", by: ["mara"] } },
      ],
    },
  ];
  let calls = 0;
  host.model.chatComplete = async () => ({
    content: ++calls === 1 ? JSON.stringify({ segments }) + "\n,keep:" + JSON.stringify(keep) + "}" : " ".repeat(149),
    finishReason: "stop",
    usage: { inputTokens: 10, outputTokens: 10 },
  });
  const send = (submissionId: string) =>
    host.app.inject({
      method: "POST",
      url: "/api/villages/rooms/turn",
      payload: {
        sessionId: "browser",
        submissionId,
        message: "What do you like about the window?",
        mode: "chat",
        targetId: "",
        expectedSceneRevision: host.scene().sceneRevision,
      },
    });
  try {
    const active = await host.app.inject({ method: "GET", url: "/api/villages/rooms/active" });
    assert.equal(active.statusCode, 200, active.body);
    const response = await send("provider-reply");
    assert.equal(response.statusCode, 200, response.body);
    assert.equal(host.scene().submissions.at(-1)?.acceptance.status, "applied");
    const world = fixtureVillageState(host.records.get("villages-village").data, host.records);
    const kept = views(world, "mara").find((row) => row.version.text === note)?.version;
    assert(kept);
    assert.equal(kept.facet, undefined);
    assert.deepEqual(
      kept.sources.flatMap((source) => source.perceptions.map((row) => [row.actorId, row.channel])),
      [
        ["mara", "private"],
        ["mara", "words"],
      ],
    );
    assert(!views(world, "player").some((row) => row.version.text === note));
    assert.equal(calls, 1);

    const empty = await send("provider-empty");
    assert.equal(empty.statusCode, 502, empty.body);
    assert.match(empty.json().error, /model returned no answer/iu);
    const details = await host.app.inject({ method: "GET", url: "/api/villages/rooms/browser/error-details" });
    assert(details.json().errors.some((row: { details: string }) => JSON.parse(row.details).cause === "empty_output"));
    assert.equal(calls, 2);
  } finally {
    await host.stop();
  }
});

await runCase("gm-effects/relationship-answer", async () => {
  for (const variant of ["conclude", "native", "invalid"]) {
    const host = await packagedSceneServer();
    const native = variant !== "conclude";
    const invalid = variant === "invalid";
    const answer = invalid
      ? "I like the way your curiosity makes me notice the little things I usually walk past."
      : "I enjoy how curious you are when we talk.";
    const departure = "I leave now.";
    let calls = 0;
    host.model.chatComplete = async (messages: { content: string }[]) => {
      const ending = ++calls === 2;
      const fit = messages.map(({ content }) => content).join("\n");
      assert(fit.includes('"relationshipAnswersDue":["mara"]'));
      assert.equal(fit.includes("only if this reply uses scene.end"), !ending || native);
      assert.equal(fit.includes('{"relationships":[{"for":"mara","about":"player","score":3}]}'), ending);
      return {
        content: JSON.stringify({
          segments: [
            said(ending ? "See you around." : "It's good to talk."),
            ...(ending && native
              ? [{ id: "exit", kind: "narration", text: "You head out.", requires: ["close"] }]
              : []),
          ],
          ...(ending && native
            ? {
                commands: [
                  {
                    id: "close",
                    type: "scene.end",
                    at: "exit",
                    source: [{ input: departure, ground: { kind: "visible-action", to: ["mara"] } }],
                  },
                ],
              }
            : {}),
          keep: [
            {
              for: ["mara"],
              owner: "mara",
              about: ["player"],
              class: "perspective",
              current: true,
              text: ending ? answer : "I feel a little more at ease with the player.",
              source: ending && !invalid ? ["self"] : ["said", "self"],
              relationship: ending && !invalid ? { answer } : { impact: "small-positive", answer },
            },
          ],
        }),
        finishReason: "stop",
        usage: { inputTokens: 10, outputTokens: 10 },
      };
    };
    const send = (ending: boolean) => {
      const conclude = ending && !native;
      return host.app.inject({
        method: "POST",
        url: "/api/villages/rooms/" + (conclude ? "leave" : "turn"),
        payload: {
          sessionId: "browser",
          submissionId: ending ? "finish-meeting" : "first-meeting",
          message: conclude ? "" : ending ? departure : "I'd like to hear about your work.",
          mode: conclude ? "leave" : "chat",
          targetId: "",
          expectedSceneRevision: host.scene().sceneRevision,
        },
      });
    };
    const edge = async () => {
      const response = await host.app.inject({ method: "GET", url: "/api/villages/relationships" });
      assert.equal(response.statusCode, 200, response.body);
      return response.json().profiles.find((row: { characterId: string }) => row.characterId === "mara").scores[0];
    };
    try {
      assert.equal((await host.app.inject({ method: "GET", url: "/api/villages/rooms/active" })).statusCode, 200);
      const turn = await send(false);
      assert.equal(turn.statusCode, 200, turn.body);
      const firstEdge = await edge();
      assert.equal(firstEdge.score, 3);
      assert.equal(firstEdge.answer, undefined);
      const ending = await send(true);
      assert.equal(ending.statusCode, 200, ending.body);
      assert.equal(host.scene().status, "closed");
      const closingEdge = await edge();
      assert.equal(closingEdge.answer, invalid ? undefined : answer);
      assert.equal(closingEdge.score, invalid ? 6 : 3);
      assert.equal(calls, 2);
      assert(!host.scene().lines.some((line) => line.content.includes(answer)));
    } finally {
      await host.stop();
    }
  }
});

for (const scenario of scenarios)
  await runCase("gm-effects/" + scenario, async () => {
    const project = scenario.startsWith("project-"),
      leave = scenario.endsWith("-leave"),
      held = ["capacity", "past-appointment", "halt"].includes(scenario);
    const host = await packagedSceneServer({
      configure(world, now) {
        if (scenario === "capacity")
          world.villagers = ["mara", "bryn", "cora", "dev", "eli"].map((characterId) => ({
            ...structuredClone(world.villagers[0]),
            characterId,
            incarnation: characterId + ":packaged",
            cardSnapshot: { ...world.villagers[0].cardSnapshot, id: characterId, name: characterId },
          }));
        if (project) {
          initializeVenueAccess(world.venues[0]);
          world.venues[0].access!.managerIds = ["mara"];
          draftRenovationProject(
            world,
            "mill",
            { title: "Larger Common room", detail: "Capacity three.", capacity: 3 },
            "project:common",
          );
        }
        const retain = (id: string, text: string, kind: "desire" | "perspective") =>
          retainNativeFact(
            world,
            {
              id,
              kind: "initialization",
              targetId: "mara",
              revision: 1,
              text,
              witnesses: ["mara"],
            },
            now,
            { class: kind, owner: continuityActor(world, "mara")!, current: true },
          );
        if (scenario === "wish") retain("recipe", "I want to share my complete leek-soup recipe.", "desire");
        if (scenario === "relationship") {
          retain("connection", "I count Player as a friend.", "perspective");
          retain("stance", "I feel wary around Player.", "perspective");
          retain("concern", "I remain concerned about our earlier disagreement.", "perspective");
        }
        if (scenario === "circumstance") {
          world.backgroundPace = "balanced";
          for (const zone of world.venues[0].zones!) zone.description = "A wooden sign hangs beside the doorway.";
          ensureNarrative(world, now);
        }
      },
      configureScene(scene, world) {
        if (scenario === "project-greet") scene.status = "opening";
        if (scenario === "circumstance") {
          scene.zoneId = admitNarrative(world, world.foundedAt, "fixture-selection")!.targets[0]!.zoneId;
          scene.accompanying![0].zoneId = scene.zoneId;
          scene.sceneAttendance!.occupants[0].zoneId = scene.zoneId;
        }
        if (scenario !== "capacity") return;
        scene.accompanying = ["mara", "bryn", "cora", "dev", "eli"].map((characterId, index) => ({
          characterId,
          zoneId: index < 2 ? "common" : "exterior",
        }));
        scene.sceneAttendance!.occupants = scene.accompanying.map(({ characterId, zoneId }) => ({
          characterId,
          zoneId,
          name: characterId,
          doing: "Listening",
        }));
        scene.activeIds = ["mara", "bryn"];
        scene.participants = scene.sceneAttendance!.occupants.slice(0, 2);
      },
    });
    let calls = 0,
      raw: any;
    host.model.chatComplete = async (messages: { content: string }[]) => {
      calls++;
      if (scenario === "npc")
        raw = {
          segments: [
            {
              id: "arrival",
              kind: "narration",
              text: "A courier enters and introduces herself as Nell.",
              requires: ["arrive"],
            },
            { id: "leaves", kind: "dialogue", speakerId: "new:nell", text: "I enjoy collecting pressed leaves." },
          ],
          commands: [
            {
              id: "arrive",
              type: "npc.admit",
              at: "arrival",
              localKey: "new:nell",
              name: "Nell",
              label: "Courier",
              characterization: "A cheerful courier who collects leaves.",
              source: [seen("arrival")],
            },
          ],
          keep: [
            {
              id: "earlier",
              for: ["mara"],
              text: "Player said they were waiting for an important letter.",
              source: [
                {
                  input: "I am waiting for an important letter.",
                  ground: { kind: "spoken", to: ["mara"], at: "start" },
                },
              ],
            },
            {
              id: "hobby",
              for: ["mara", "player", "new:nell"],
              class: "information",
              about: ["new:nell"],
              text: "Nell says she enjoys collecting pressed leaves.",
              source: ["leaves"],
            },
          ],
        };
      else if (project)
        raw = {
          segments: [said("I approve the exact Larger Common room design, and I want to lead its construction.")],
          commands: ["approval", "builder"].map((decision) => ({
            id: decision,
            type: "project.decide",
            by: "mara",
            project: "project:common",
            decision,
            at: "said",
            source: ["said"],
          })),
        };
      else if (scenario === "wish" || scenario === "wish-new") {
        const desire = scenario === "wish" ? supplied(messages).find((row) => row.class === "desire") : undefined;
        if (scenario === "wish") assert(desire, "replacement must use an actually fitted desire");
        raw = {
          segments: [
            said(
              "I've wanted to share my recipe with you. My leek soup uses leeks, potatoes and broth, simmered until tender. That's the complete recipe.",
            ),
          ],
          keep: [
            {
              id: "recipe",
              for: scenario === "wish" ? ["mara"] : ["mara", "player"],
              owner: "mara",
              class: "desire",
              ...(desire ? { replace: desire.id } : {}),
              text: "I wanted to share my complete leek-soup recipe with Player and have now shared it.",
              retire: "fulfilled",
              current: false,
              source: ["said"],
            },
          ],
        };
      } else if (scenario === "relationship") {
        const stance = supplied(messages).find((row) => row.text === "I feel wary around Player.");
        assert(stance, "the changed stance is actually fitted");
        raw = {
          segments: [said("Thank you for hearing me. I feel more at ease.")],
          keep: [
            {
              id: "stance",
              for: ["mara"],
              replace: stance.id,
              text: "I feel more at ease with Player after being heard.",
              current: true,
              source: ["said"],
            },
          ],
        };
      } else if (scenario === "capacity")
        raw = {
          segments: [
            {
              id: "cross",
              kind: "narration",
              text: "Mara and Bryn leave the room for the entrance.",
              requires: ["mara-move", "bryn-move"],
            },
          ],
          commands: ["mara", "bryn"].map((who) => ({
            id: who + "-move",
            type: "move",
            who,
            to: "exterior",
            at: "cross",
            source: [seen("cross")],
          })),
        };
      else if (scenario === "halt")
        raw = {
          segments: [],
          halt: {
            reason: "time",
            message: "Village time cannot be skipped through narration.",
            source: [{ input: "I advance the Village clock by two days." }],
          },
        };
      else if (scenario === "past-appointment")
        raw = {
          segments: [{ ...said("Meet me yesterday at 19:30."), requires: ["meeting"] }],
          commands: [
            {
              id: "meeting",
              type: "appointment",
              by: "mara",
              at: "said",
              when: { dayOffset: -1 },
              minute: 1170,
              source: ["said"],
            },
          ],
        };
      else if (scenario === "circumstance")
        raw = {
          segments: [{ id: "event", kind: "narration", text: "A gust rattles the wooden sign.", requires: ["sign"] }],
          commands: [
            {
              id: "sign",
              type: "circumstance",
              at: "event",
              situation: { title: "Rattling sign", summary: "The sign rattles in the breeze." },
              conditions: [
                {
                  observation: "The wooden sign rattles in the breeze.",
                  restriction: "none",
                  remedy: "Secure the bracket.",
                  durationMinutes: 10,
                },
              ],
              source: [seen("event")],
            },
          ],
        };
      else raw = { segments: [said("Good evening. Take care.")] };
      return { content: JSON.stringify(raw), finishReason: "stop", usage: { inputTokens: 10, outputTokens: 10 } };
    };
    try {
      const before = fixtureVillageState(host.records.get("villages-village").data, host.records);
      const active = await host.app.inject({ method: "GET", url: "/api/villages/rooms/active" });
      assert.equal(active.statusCode, 200, active.body);
      const payload = {
        sessionId: "browser",
        submissionId: "b1111111-1111-4111-8111-111111111111",
        message:
          scenario === "halt"
            ? "I advance the Village clock by two days."
            : leave
              ? ""
              : scenario === "npc"
                ? "I am waiting for an important letter."
                : scenario === "capacity"
                  ? "Mara and Bryn, come outside now."
                  : "Hello.",
        mode: leave ? "leave" : "chat",
        targetId: "",
        expectedSceneRevision: host.scene().sceneRevision,
      };
      const url =
        scenario === "project-greet"
          ? "/api/villages/rooms/greet"
          : leave
            ? "/api/villages/rooms/leave"
            : "/api/villages/rooms/turn";
      const requestPayload = scenario === "project-greet" ? { sessionId: "browser" } : payload;
      const response = await host.app.inject({ method: "POST", url, payload: requestPayload });
      if (held) assert(response.statusCode >= 400, response.body);
      else assert.equal(response.statusCode, 200, scenario + ": " + response.body);
      assert.equal(calls, 1, "one GM purchase for the whole exchange");
      const world = await createVillageRepository(() => host.documents as any).readAuthority({ memories: true }),
        scene = host.scene(),
        turn = scene.submissions.at(-1)!;
      if (held) {
        assert.equal(turn.acceptance.status, "held");
        assert.deepEqual(turn.narration!.raw, raw, "the purchased response remains available for recovery");
        assert.equal(
          scene.lines.filter((line) => line.role === "assistant").length,
          0,
          "failed assertions never become displayed fiction",
        );
        assert.equal(world.episodes.records.filter((episode) => episode.sceneId === "browser").length, 0);
        if (scenario === "capacity") {
          assert(
            turn.acceptance.rejected.some((row) => /overcrowd/.test(row.reason)),
            "the actual capacity rule holds this reply",
          );
          for (const id of ["mara", "bryn"])
            assert.equal(
              scene.accompanying!.find((row) => row.characterId === id)!.zoneId,
              "common",
              "over-capacity movement applies no partial result",
            );
        } else if (scenario === "past-appointment")
          assert(turn.acceptance.rejected.some((row) => /past|nonexistent/.test(row.reason)));
        else {
          assert.equal(response.statusCode, 409);
          assert.equal(response.json().error, raw.halt.message, "a supported halt explains the boundary directly");
          assert(turn.acceptance.rejected.some((row) => row.reason.includes(raw.halt.message)));
          const status = await host.app.inject({
            method: "GET",
            url: `/api/villages/rooms/browser/operations/${payload.submissionId}`,
          });
          assert.equal(status.statusCode, 200, status.body);
          assert.equal(status.json().operation.acceptance, "held");
          assert.equal(status.json().operation.input.message, payload.message);
          assert.deepEqual(world.clock, before.clock, "a native halt changes no Village time");
        }
      } else {
        assert.equal(turn.acceptance.status, "applied");
        const episode = world.episodes.records.find((row) => row.id === turn.episodeId)!;
        assert(episode, "the public reply has its canonical accepted Episode");
        if (scenario !== "project-greet") assert.equal(episode.privateInput, payload.message);
        if (leave) {
          assert.equal(scene.status, "closed");
          const selected = await host.app.inject({ method: "GET", url: "/api/villages/rooms/active" });
          assert.equal(selected.json().session, null);
        }
        if (scenario === "npc") {
          const npc = Object.values(world.worldPlaces.npcs).find((row) => row.name === "Nell")!;
          assert(npc);
          const earlier = episode.grounding.find(
            (source) => source.kind === "speech" && source.actorId === "player" && source.excerpt === payload.message,
          );
          assert(earlier, "the original spoken excerpt has actual canonical grounding");
          assert(earlier.perceptions.some((row) => row.actorId === "mara"));
          assert(
            !earlier.perceptions.some((row) => row.actorId === npc.id),
            "a later arrival cannot hear the original speech",
          );
          assert(episode.segments.some((line) => line.speakerId === npc.id));
          for (const id of ["mara", "player", npc.id])
            assert.equal(
              views(world, id).filter((row) => row.version.text === "Nell says she enjoys collecting pressed leaves.")
                .length,
              1,
            );
          assert(!views(world, npc.id).some((row) => row.version.text.includes("important letter")));
          assert(
            !JSON.stringify(world.continuity).includes("new:nell"),
            "provisional references never enter canonical knowledge",
          );
        }
        if (project) {
          const saved = world.projects.find((row) => row.id === "project:common")!;
          assert.equal(saved.status, "planning", "speech does not start construction");
          assert(saved.lifecycle!.approvals.some((row) => row.residentId === "mara"));
          assert(saved.lifecycle!.candidates.some((row) => row.residentId === "mara"));
          assert.equal(episode.commandReceipts.filter((row) => row.kind === "project").length, 2);
          const proofs = episode.grounding.filter((source) => source.kind === "speech");
          assert(proofs.length > 0, "Project decisions retain actual spoken proof");
          assert(proofs.every((source) => episode.segments.some((line) => line.id === source.unitId)));
        }
        if (scenario === "wish" || scenario === "wish-new") {
          const wishes = continuityWishes(world, "mara", true, world.foundedAt);
          assert.equal(wishes.length, 1);
          assert.equal(wishes[0].status, "fulfilled");
          const root = world.continuity.records.find((record) => record.id === wishes[0].wishId)!;
          assert(
            !views(world, "mara").some((row) => row.id === root.id && row.current && continuityGuidesHolder(row)),
            "fulfilled desires never remain in the standing initiative lane",
          );
          if (scenario === "wish-new") {
            const versions = world.continuity.versions.filter((version) => version.rootId === root.id);
            assert.equal(versions.length, 2, "a fresh completed meaning has one final version per knower");
            assert.equal(Object.keys(root.heads).length, 2);
            for (const version of versions) {
              assert.equal(version.closed?.reason, "fulfilled");
              assert.equal(version.sources.length, 1);
              assert.equal(version.sources[0].excerpt, raw.segments[0].text);
              assert.equal(version.sources[0].unitId, episode.segments[0].id);
            }
            assert.equal(continuityWishes(world, "mara", false, world.foundedAt)[0].status, "fulfilled");
          }
        }
        if (scenario === "relationship") {
          assert(
            views(world, "mara").some(
              (row) => row.version.text === "I feel more at ease with Player after being heard.",
            ),
          );
          for (const text of ["I count Player as a friend.", "I remain concerned about our earlier disagreement."]) {
            assert.equal(
              views(world, "mara").find((row) => row.version.text === text)!.version.id,
              views(before, "mara").find((row) => row.version.text === text)!.version.id,
              "a stance change preserves unrelated complete meanings",
            );
          }
        }
        if (scenario === "circumstance") {
          assert.equal(world.narrative!.conditions.length, 1);
          assert.equal(world.narrative!.receipts.length, 1);
          assert.equal(episode.commandReceipts.filter((row) => row.kind === "circumstance").length, 1);
        }
      }
      const replay = await host.app.inject({
        method: "POST",
        url,
        payload: { ...requestPayload, ...(held ? { retryOfAttemptId: scene.operation?.attemptId } : {}) },
      });
      if (held) assert(replay.statusCode >= 400, replay.body);
      else assert.equal(replay.statusCode, 200, replay.body);
      assert.equal(calls, 1, "replay never purchases another response");
      const cold = await createVillageRepository(() => host.documents as any).readAuthority({ memories: true });
      assert.deepEqual(cold.continuity, world.continuity, "replay neither duplicates nor changes common versions");
      assert.deepEqual(cold.episodes, world.episodes);
    } finally {
      await host.stop();
    }
  });

await runCase("gm-effects/room-appearance", async () => {
  const host = await packagedSceneServer({
    configure(world) {
      world.automaticZonePictures = true;
      const venue = world.venues[0];
      const zone = venue.zones!.find((zone) => zone.id === "common")!;
      zone.dayNight = false;
      zone.image = { id: "old-art", ref: "global-gallery:old-art", url: "/old-art.png" };
      zone.picture = { base: zone.image, daylight: true, context: zoneAppearanceContext(zone.description, venue.form) };
    },
  });
  try {
    const active = await host.app.inject({ method: "GET", url: "/api/villages/rooms/active" });
    assert.equal(active.statusCode, 200, active.body);
    const read = () => createVillageRepository(() => host.documents as any).readAuthority({ memories: true });
    const before = await read();
    const holder = { kind: "room" as const, placeId: "mill", zoneId: "common" };
    const prior = currentRoomViews(before.continuity, before.episodes, holder, before.foundedAt)[0];
    const visible = "The wooden bench now faces the window.";
    const temporary = "An independent bright patch from a lantern falls on the floor.";
    const secret = "A violet envelope is hidden beneath the bench.";
    let reply: unknown = {
      segments: [{ id: "change", kind: "narration", text: visible + " " + temporary }],
      keep: [
        { for: "room", replace: prior.id, text: visible, source: [seen("change")] },
        { for: "room", text: temporary, source: [seen("change")], expiresInMinutes: 60 },
      ],
    };
    host.model.chatComplete = async () => ({
      content: JSON.stringify(reply),
      finishReason: "stop",
      usage: { inputTokens: 10, outputTokens: 10 },
    });
    const send = async (submissionId: string, message: string) => {
      const result = await host.app.inject({
        method: "POST",
        url: "/api/villages/rooms/turn",
        payload: {
          sessionId: "browser",
          submissionId,
          message,
          mode: "chat",
          targetId: "",
          expectedSceneRevision: host.scene().sceneRevision,
        },
      });
      assert.equal(result.statusCode, 200, result.body);
    };
    await send("a1111111-1111-4111-8111-111111111111", "I turn the bench toward the window and light a lantern.");
    const edited = await read();
    const acceptedAt = edited.episodes.records.at(-1)!.capturedAt;
    const description = visible + "\n\n" + temporary;
    assert.equal(observableRoomDescription(edited, "mill", "common", acceptedAt), description);
    assert.equal(
      observableRoomDescription(edited, "mill", "common", new Date(Date.parse(acceptedAt) + 3600000).toISOString()),
      visible,
      "an independent temporary entry expires without restoring earlier prose",
    );
    const inspect = async () => {
      const snapshot = await host.app.inject({ method: "GET", url: "/api/villages" });
      assert.equal(snapshot.statusCode, 200, snapshot.body);
      const body = snapshot.json();
      for (const venue of [body.settings.venues[0], body.sceneVenue.venue]) {
        const zone = venue.zones.find((zone: { id: string }) => zone.id === "common");
        assert.equal(zone.description, description);
        assert.equal(zone.pictureOutdated, true, "Only known appearance makes existing artwork stale");
      }
      assert.doesNotMatch(JSON.stringify(body.settings.venues), /violet envelope|bench stands against/);
      return (await read()).venues[0].zones!.find((zone) => zone.id === "common")!.observed!.context;
    };
    const observed = await inspect();
    reply = {
      segments: [{ id: "change", kind: "narration", text: "Something slides quietly beneath the bench." }],
      keep: [{ for: "room", text: secret, visibility: "concealed", source: [seen("change")] }],
    };
    await send("a2222222-2222-4222-8222-222222222222", "I hide the envelope under the bench.");
    assert.equal(await inspect(), observed, "concealed-only changes leave observable appearance unchanged");
    const cold = await read();
    assert(
      currentRoomViews(cold.continuity, cold.episodes, holder, acceptedAt).some(
        ({ version }) => version.text === secret,
      ),
    );
    assert.equal(cold.zonePictureBudget?.used ?? 0, 0);
    assert.equal(cold.venues[0].zones!.find((zone) => zone.id === "common")!.image?.id, "old-art");

    const readVillageState = async () => structuredClone(cold);
    const mutateVillageState = async (update: (state: VillageState) => unknown) => {
      await update(cold);
      return structuredClone(cold);
    };
    const buildVillageSnapshot = async () => ({}) as never;
    const commands = createVenueCommands({
      readVillageState,
      mutateVillageState,
      buildVillageSnapshot,
      withSceneNavigation: (operation) => operation(),
      sceneQueries: () => ({ activeVenueSession: async () => null }),
    });
    const prompts: string[] = [];
    const images = createLocationImages({
      readVillageState,
      mutateVillageState,
      buildVillageSnapshot,
      canGenerateZonePicture: async () => true,
      assertVenueImageAccess: commands.assertVenueImageAccess,
      setVillageVenueImage: commands.setVillageVenueImage,
      readVillageImageLore: async () => "",
      generateVillageImage: async ({ prompt, beforeDispatch }) => {
        await beforeDispatch?.();
        prompts.push(prompt);
        return { bytes: Buffer.from("fixture"), mime: "image/png", base64: "" };
      },
      uploadVillageGalleryImage: async () => ({ id: "new-art", ref: "global-gallery:new-art", url: "/new-art.png" }),
      decodeImageDataUrl: () => {
        throw new Error("Unexpected reference upload");
      },
      villagesLogger: () => ({ warn() {} }),
    });
    await images.generateVillageLocationImage("mill", "common");
    assert.equal(prompts.length, 1);
    assert(prompts[0].includes(visible) && prompts[0].includes(temporary));
    assert.doesNotMatch(prompts[0], /violet envelope|bench stands against/);
    const pictured = cold.venues[0].zones!.find((zone) => zone.id === "common")!;
    assert.equal(pictured.picture?.context, observed);
    assert.equal(pictured.image?.id, "new-art");
  } finally {
    await host.stop();
  }
});
