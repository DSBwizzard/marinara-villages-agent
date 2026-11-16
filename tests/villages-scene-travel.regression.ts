// Test cases: scene-travel/invitation, scene-travel/revoked, scene-travel/restore, scene-travel/prose-only, scene-travel/group-visit, scene-travel/overheard, scene-travel/boundary, scene-travel/crossing-rejected, scene-travel/departure-rejected, scene-travel/resident-crossing, scene-travel/resident-departure
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { initializeVenueAccess } from "../packages/villages/src/server/domain/rules/venue-access.js";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { packagedSceneServer } from "./fixtures/packaged-scene-server.fixture.js";
import { venueFixture } from "./helpers/venues.fixture.js";
import { fixtureSceneState } from "./helpers/village-storage.fixture.js";

for (const scenario of [
  "invitation",
  "revoked",
  "restore",
  "prose-only",
  "group-visit",
  "overheard",
  "boundary",
  "crossing-rejected",
  "departure-rejected",
  "resident-crossing",
  "resident-departure",
] as const)
  await runCase("scene-travel/" + scenario, async () => {
    const host = await packagedSceneServer({
      configure(world) {
        const speaker = world.villagers[0];
        speaker.cardSnapshot.name = "Gidget";
        world.villagers.push({
          ...structuredClone(speaker),
          characterId: "ella",
          incarnation: "ella:travel",
          cardSnapshot: { ...speaker.cardSnapshot, id: "ella", name: "Ella" },
        });
        const hotel = venueFixture({
          id: "hotel",
          name: "Willow Hotel",
          zones: [
            {
              ...defaultVenueSpace("other", "A quiet spot at Willow Hotel."),
              id: "exterior",
              name: "Entrance",
              kind: "exterior",
              connectedTo: ["room"],
            },
            {
              ...defaultVenueSpace("other", "A quiet spot at Willow Hotel."),
              id: "room",
              name: "Gidget’s Room",
              kind: "restricted",
              connectedTo: ["exterior"],
            },
          ],
        });
        initializeVenueAccess(hotel);
        hotel.access!.managerIds = ["mara"];
        world.venues.push(hotel);
      },
      configureScene(scene) {
        scene.participants[0].name = "Gidget";
        scene.sceneAttendance!.occupants[0].name = "Gidget";
        scene.activeIds.push("ella");
        const witness = { characterId: "ella", name: "Ella", doing: "Listening" };
        scene.participants.push(witness);
        scene.sceneAttendance!.occupants.push({ ...witness, zoneId: "common" });
      },
    });
    let calls = 0;
    const walk = "I walk to the Entrance.";
    const departure = "I leave now.";
    const residentCrossing = scenario === "resident-crossing";
    const residentDeparture = scenario === "resident-departure";
    host.model.chatComplete = async (messages) => {
      calls++;
      if (calls === 1) {
        const prompt = messages.map(({ content }) => content).join("\n");
        assert.match(prompt, /Remote visit invitations available.*Willow Hotel/);
        assert.match(prompt, /Write "visit" first/);
        assert.match(prompt, /A group invitation gets the same entry when it includes the player/);
        assert.match(prompt, /Send stays in the current Zone/);
        assert.match(prompt, /End before any dialogue or action that depends on the player crossing/);
      }
      if (residentCrossing || residentDeparture) {
        assert.match(messages.map(({ content }) => content).join("\n"), /"kind":"crossing".*"kind":"departure"/);
        return {
          content: JSON.stringify({
            segments: [
              { kind: "dialogue", speakerId: "mara", text: "I'll go check on something." },
              residentCrossing
                ? { kind: "crossing", who: "mara", to: "exterior", text: "Gidget slips out through the door." }
                : { kind: "departure", who: "mara", text: "Gidget waves and heads home." },
              ...(residentCrossing
                ? [{ kind: "dialogue", speakerId: "mara", text: "A remark only heard outside." }]
                : []),
              { kind: "dialogue", speakerId: "ella", text: "We can stay here a while." },
            ],
            ...(residentCrossing
              ? {
                  keep: [
                    {
                      id: "resident-move-0",
                      for: ["mara"],
                      owner: "mara",
                      class: "desire",
                      text: "I want to spend more time outdoors.",
                      independent: true,
                      source: ["self"],
                    },
                  ],
                }
              : {}),
          }),
          finishReason: "stop",
          usage: { inputTokens: 10, outputTokens: 10 },
        };
      }
      if (scenario === "boundary" || scenario === "crossing-rejected" || scenario === "departure-rejected") {
        const attempted =
          scenario === "crossing-rejected"
            ? {
                type: "move",
                id: "cross",
                who: "player",
                to: "exterior",
                at: "door",
                independent: true,
                source: [
                  { input: walk, ground: { kind: "visible-action", to: ["mara", "ella"], at: "start" } },
                  { segment: "door", perceive: { kind: "seen", by: ["player"] } },
                ],
              }
            : scenario === "departure-rejected"
              ? {
                  type: "scene.end",
                  id: "cross",
                  at: "door",
                  independent: true,
                  source: [{ input: departure, ground: { kind: "visible-action", to: ["mara", "ella"] } }],
                }
              : undefined;
        return {
          content: JSON.stringify({
            segments: attempted
              ? [{ kind: "narration", id: "door", text: "You step out of the Mill." }]
              : [
                  {
                    kind: "dialogue",
                    speakerId: "mara",
                    text: calls === 1 ? "The entrance is behind you." : "Willow Hotel is across the square.",
                  },
                ],
            ...(attempted ? { commands: [attempted] } : {}),
          }),
          finishReason: "stop",
          usage: { inputTokens: 10, outputTokens: 10 },
        };
      }
      return {
        content: JSON.stringify(
          calls === 1
            ? scenario === "group-visit" || scenario === "overheard"
              ? {
                  visit: { option: 1, segment: 1, escort: true },
                  segments: [
                    {
                      kind: "dialogue",
                      speakerId: "mara",
                      text: "Come on — both of you, come with me, it's the Willow. I'll walk you over right now to my room.",
                      ...(scenario === "overheard" ? { delivery: "whisper", targetId: "ella" } : {}),
                    },
                    ...(scenario === "group-visit"
                      ? [{ kind: "departure", who: "ella", text: "Ella waves goodbye and heads out." }]
                      : []),
                  ],
                  ...(scenario === "group-visit"
                    ? {
                        keep: [
                          {
                            id: "scene-visit",
                            for: ["mara"],
                            owner: "mara",
                            class: "desire",
                            text: "I want to share my collection.",
                            independent: true,
                            source: ["self"],
                          },
                        ],
                      }
                    : {}),
                }
              : {
                  segments: [
                    { id: "assent", kind: "dialogue", speakerId: "mara", text: "My room? Oh — yeah, sure!" },
                    {
                      id: "offer",
                      kind: "dialogue",
                      speakerId: "mara",
                      text: "Come on, then — I'll walk you over.",
                    },
                  ],
                  commands:
                    scenario === "prose-only"
                      ? undefined
                      : [
                          {
                            id: "invite",
                            type: "access.decide",
                            at: "offer",
                            source: [{ segment: "assent" }, { segment: "offer" }],
                            by: "mara",
                            venue: "hotel",
                            zone: "room",
                            decision: { outcome: "invite-later", visitor: "player", accompanies: true },
                          },
                        ],
                }
            : { segments: [{ id: "welcome", kind: "dialogue", speakerId: "mara", text: "Here we are." }] },
        ),
        finishReason: "stop",
        usage: { inputTokens: 10, outputTokens: 10 },
      };
    };
    const getActive = () => host.app.inject({ method: "GET", url: "/api/villages/rooms/active" });
    const turn = (id: string, revision: number, submissionId: string, message: string) =>
      host.app.inject({
        method: "POST",
        url: "/api/villages/rooms/turn",
        payload: {
          sessionId: id,
          submissionId,
          message,
          mode: "chat",
          targetId: "mara",
          expectedSceneRevision: revision,
        },
      });
    try {
      const before = (await getActive()).json().session;
      if (residentCrossing || residentDeparture) {
        const outcome = await turn(before.id, before.sceneRevision, "resident-leaves", "I've got some time to chat.");
        assert.equal(outcome.statusCode, 200, outcome.body);
        const after = outcome.json().session;
        assert.equal(after.id, before.id);
        assert.equal(after.zoneId, before.zoneId);
        assert.deepEqual(after.activeIds, ["ella"]);
        assert.deepEqual((await getActive()).json().session.activeIds, ["ella"]);
        assert.equal(calls, 1);
        const saved = host.scene();
        assert(saved.lines.find((line) => line.content === "I'll go check on something.")?.heardBy.includes("player"));
        const world = await createVillageRepository(() => host.documents as never).readAuthority({ memories: true });
        const receipt = world.episodes.records.at(-1)!.commandReceipts[0];
        if (residentCrossing) {
          assert.equal(receipt.movement?.zoneId, "exterior");
          assert(!outcome.body.includes("A remark only heard outside."));
          assert(
            !saved.lines.find((line) => line.content === "A remark only heard outside.")?.heardBy.includes("player"),
          );
        } else {
          assert.equal(receipt.departure?.actorId, "mara");
          assert(saved.departedIds?.includes("mara"));
        }
        return;
      }
      if (scenario === "boundary" || scenario === "crossing-rejected" || scenario === "departure-rejected") {
        const local = await turn(
          before.id,
          before.sceneRevision,
          "walk-out",
          scenario === "departure-rejected" ? departure : walk,
        );
        const shouldPublish = scenario === "boundary";
        assert.equal(local.statusCode, shouldPublish ? 200 : 500, local.body);
        const source = (await getActive()).json().session;
        assert.equal(source.id, before.id);
        assert.equal(source.zoneId, before.zoneId);
        assert.equal(source.status, "active");
        assert.equal(calls, 1);
        assert.equal(source.latestTurn.published, shouldPublish);
        if (!shouldPublish) {
          assert.equal(host.scene().submissions[0].acceptance.status, "held");
          assert(!host.scene().navigationReceipts?.length);
          const recovered = await getActive();
          assert(!recovered.body.includes("You step out of the Mill."));
          assert.equal(calls, 1);
          return;
        }
        const remote = await turn(source.id, source.sceneRevision, "walk-hotel", "I head over to Willow Hotel.");
        assert.equal(remote.statusCode, 200, remote.body);
        const atMill = remote.json().session;
        assert.equal(atMill.id, before.id);
        assert.equal(atMill.zoneId, before.zoneId);
        assert.equal(atMill.travel, undefined);
        assert.equal(calls, 2);
        const move = await host.app.inject({
          method: "POST",
          url: "/api/villages/rooms/zone",
          payload: {
            sessionId: before.id,
            zoneId: "exterior",
            operationId: "explicit-move",
            expectedSceneRevision: atMill.sceneRevision,
          },
        });
        assert.equal(move.statusCode, 200, move.body);
        assert.equal(move.json().session.id, before.id);
        assert.equal(move.json().session.zoneId, "exterior");
        const reused = await turn(before.id, move.json().session.sceneRevision, "explicit-move", walk);
        assert.equal(reused.statusCode, 409, reused.body);
        assert.equal(calls, 2, "Explicit Move and rejected ID reuse both skip generation");
        return;
      }
      const request = await turn(
        before.id,
        before.sceneRevision,
        "ask-hotel",
        "Gidget, could you take me to your room at Willow Hotel?",
      );
      assert.equal(request.statusCode, 200, request.body);
      const source = request.json().session;
      assert.equal(source.placeId, "mill");
      if (scenario === "prose-only" || scenario === "overheard") {
        assert.equal(source.travel, undefined);
        const saved = await createVillageRepository(() => host.documents as never).readAuthority();
        assert.deepEqual(saved.venues.find((row) => row.id === "hotel")?.access?.permissions, []);
        assert.equal(calls, 1);
        return;
      }
      assert.equal(source.travel?.label, "Willow Hotel");
      if (scenario === "group-visit") assert.deepEqual(source.activeIds, ["mara"]);
      assert.deepEqual(Object.keys(source.travel).sort(), ["id", "label"]);
      assert(!request.body.includes("grantId"));
      assert(host.scene().lines.some((line) => line.heardBy.includes("ella")));
      const travel = (revision = source.sceneRevision) =>
        host.app.inject({
          method: "POST",
          url: "/api/villages/rooms",
          payload: {
            travel: { sourceId: source.id, offerId: source.travel.id },
            expectedSceneRevision: revision,
          },
        });

      const stale = await travel(source.sceneRevision + 1);
      assert.equal(stale.statusCode, 409, stale.body);
      assert.equal((await getActive()).json().session.id, source.id);
      const repository = createVillageRepository(() => host.documents as never);
      if (scenario === "revoked") {
        await repository.mutateAuthority(
          (world) => {
            world.venues.find((row) => row.id === "hotel")!.access!.permissions[0].revoked = true;
          },
          { memories: true },
        );
        const refused = await travel();
        assert.equal(refused.statusCode, 409, refused.body);
        assert.equal((await getActive()).json().session.id, source.id);
        assert.equal(host.scene().status, "active");
        assert.equal(calls, 1);
        return;
      }
      if (scenario === "restore") {
        const update = host.documents.update;
        let fail = true;
        host.documents.update = async (input) => {
          if (input.id === "villages-venue-visit-browser" && input.data?.status === "closed" && fail) {
            fail = false;
            throw Error("Interrupted after the destination became active.");
          }
          return update(input);
        };
        const interrupted = await travel();
        assert.equal(interrupted.statusCode, 500, interrupted.body);
      }
      const response = await travel();
      assert.equal(response.statusCode, 200, response.body);
      const arrived = response.json().session;
      assert.notEqual(arrived.id, source.id);
      assert.equal(arrived.status, "active");
      assert.equal(arrived.placeId, "hotel");
      assert.equal(arrived.zoneId, "room");
      assert.deepEqual(arrived.activeIds, ["mara"]);
      assert.deepEqual(arrived.lines, []);
      assert.equal(host.scene().status, "closed");
      assert.equal(calls, 1, "travel itself makes no model call");
      assert.equal((await travel()).json().session.id, arrived.id);
      const world = await repository.readAuthority({ memories: true });
      assert.equal(world.venues.find((row) => row.id === "hotel")!.access!.permissions[0].sceneId, arrived.id);
      const next = await turn(arrived.id, arrived.sceneRevision, "arrived", "Thanks for bringing me up.");
      assert.equal(next.statusCode, 200, next.body);
      const saved = fixtureSceneState(host.records.get("villages-venue-visit-" + arrived.id).data, host.records);
      assert(saved.lines.some((line) => line.heardBy.includes("mara")));
      assert(saved.lines.every((line) => !line.heardBy.includes("ella")));
      assert.equal(calls, 2);
    } finally {
      await host.stop();
    }
  });
