// Test cases: scene-travel/prepared-place, scene-travel/unprepared-place, scene-travel/invitation, scene-travel/revoked, scene-travel/restore, scene-travel/prose-only, scene-travel/group-visit, scene-travel/overheard, scene-travel/boundary, scene-travel/open-park-boundary, scene-travel/trespass, scene-travel/crossing-rejected, scene-travel/departure-rejected, scene-travel/resident-crossing, scene-travel/resident-departure, scene-travel/follow-after-move, scene-travel/local-permission, scene-travel/doorway-after-hours
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import {
  initializeVenueAccess,
  evaluateZoneAccess,
} from "../packages/villages/src/server/domain/rules/venue-access.js";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { packagedSceneServer } from "./fixtures/packaged-scene-server.fixture.js";
import { venueFixture } from "./helpers/venues.fixture.js";
import { fixtureSceneState } from "./helpers/village-storage.fixture.js";
import { establishPlace } from "../packages/villages/src/server/domain/rules/place-discovery.js";
import { findLocation } from "../packages/villages/src/server/domain/rules/places.js";
import { initializeRoomContinuity } from "../packages/villages/src/server/domain/rules/native-continuity.js";

const localCrossings = {
  boundary: {
    venue: "Crossing Hall",
    origin: "Hall",
    originDescription: "A wooden bench stands against a plaster wall.",
    destination: "Kitchen",
    destinationId: "kitchen",
    destinationDescription: "The Kitchen has a sink and a tea tray.",
    departure: '"Hey Ella, I\'ll be right back." I walk to the kitchen',
    activity: "In the kitchen, I prepare some tea.",
    approach: "Ella watches you approach the Kitchen doorway.",
    arrival: "You set the tea on the Kitchen counter.",
  },
  "open-park-boundary": {
    venue: "Riverside Park",
    origin: "Picnic Lawn",
    originDescription: "An open lawn slopes toward a pond. The grass runs continuously down to the water.",
    destination: "Pond",
    destinationId: "pond",
    destinationDescription: "Reeds grow at the open shoreline.",
    departure: '"I’ll be right back, Ella." I walk down to the pond.',
    activity: "At the pond, I crouch to watch the tadpoles.",
    approach: "Ella waves as you start down the grassy slope toward the pond.",
    arrival: "A cluster of tadpoles darts away from your reflection.",
  },
};

for (const scenario of [
  "invitation",
  "prepared-place",
  "unprepared-place",
  "revoked",
  "restore",
  "prose-only",
  "group-visit",
  "overheard",
  "boundary",
  "open-park-boundary",
  "trespass",
  "crossing-rejected",
  "departure-rejected",
  "resident-crossing",
  "resident-departure",
  "follow-after-move",
] as const)
  await runCase("scene-travel/" + scenario, async () => {
    const crossing = scenario === "boundary" || scenario === "open-park-boundary" ? localCrossings[scenario] : null;
    const follow = scenario === "follow-after-move";
    const trespass = scenario === "trespass";
    const location = trespass ? localCrossings["open-park-boundary"] : follow ? localCrossings.boundary : crossing;
    const remoteWalk = "I head over to Willow Hotel.";
    const beforeMove = crossing ? [crossing.departure, crossing.activity, remoteWalk] : [];
    const host = await packagedSceneServer({
      configure(world, now) {
        world.spontaneousEvents = true;
        if (location) {
          const venue = world.venues[0];
          venue.name = location.venue;
          const common = venue.zones.find((zone) => zone.id === "common")!;
          common.name = location.origin;
          common.description = location.originDescription;
          common.connectedTo.push(location.destinationId);
          venue.zones.push({
            ...defaultVenueSpace("other", location.destinationDescription),
            id: location.destinationId,
            name: location.destination,
            kind: "public",
            seen: true,
            connectedTo: ["common"],
          });
          world.venues[0] = venueFixture(venue);
          if (trespass) {
            const pond = world.venues[0].zones.find((zone) => zone.id === "pond")!;
            pond.access = { ...pond.access!, mode: "permission-required", managerIds: ["mara"] };
          }
        }
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
        if (scenario === "prepared-place" || scenario === "unprepared-place") {
          world.maps = [
            {
              id: "village",
              name: "Village",
              revision: 0,
              width: 100,
              height: 100,
              artwork: { id: "map-art", ref: "global-gallery:map-art", url: "/api/global-gallery/file/map-art.png" },
            },
          ];
          hotel.presentation.mapId = "village";
          for (const venue of world.venues) venue.presentation.mapId = "village";
          hotel.capabilities = [];
          hotel.category = "";
          const place = establishPlace(
            world,
            { name: hotel.name, description: "An existing hotel." },
            hotel.id,
            "village",
            "saved-place",
            now,
            scenario === "prepared-place",
          );
          place.location = hotel;
          place.knownBy.push("mara");
          for (const zone of hotel.zones!)
            initializeRoomContinuity(world, hotel.id, zone.id, zone.description, "saved-place", now);
        } else world.venues.push(hotel);
      },
      configureScene(scene) {
        if (location) scene.placeName = location.venue;
        scene.participants[0].name = "Gidget";
        scene.sceneAttendance!.occupants[0].name = "Gidget";
        scene.activeIds.push("ella");
        const witness = { characterId: "ella", name: "Ella", doing: "Listening" };
        scene.participants.push(witness);
        scene.sceneAttendance!.occupants.push({ ...witness, zoneId: "common" });
      },
    });
    let calls = 0;
    let classifications = 0;
    const walk = "I walk to the Entrance.";
    const ellaFarewell = "Sure thing, star! We'll be right here.";
    const departure = "I leave now.";
    const residentCrossing = scenario === "resident-crossing";
    const residentDeparture = scenario === "resident-departure";
    const invitation = '"Ella, would you join me in the kitchen to slice this up before Gidget eats the entire thing?"';
    const afterMoveInput = "I step into the Kitchen.";
    const waitInKitchen = "I hold out a plate.";
    const ellaArrivalLine = "Point me at the knife and I’ll slice the cake.";
    host.model.chatComplete = async (messages) => {
      if (messages[0].content.startsWith('Return only {"classes"')) {
        classifications++;
        return { content: JSON.stringify({}), finishReason: "stop" };
      }
      calls++;
      if (calls === 1) {
        const prompt = messages.map(({ content }) => content).join("\n");
        assert.match(prompt, /Visit invitations available.*Willow Hotel/);
        assert.match(prompt, /Entry needs a spoken invitation/);
        assert.match(prompt, /A group invite counts if it includes the player/);
      }
      if (follow) {
        const prompt = messages.map(({ content }) => content).join("\n");
        const speakerIds = calls < 3 ? '["ella","mara"]' : '["ella"]';
        assert(prompt.includes('"dialogueSpeakers":' + speakerIds), "The fitted cast matches the current exchange");
        assert.equal(messages.at(-2)?.content, [invitation, afterMoveInput, waitInKitchen][calls - 1]);
        const segments =
          calls === 1
            ? [
                { kind: "dialogue", speakerId: "mara", text: "I haven’t even had a slice yet!" },
                { kind: "dialogue", speakerId: "ella", text: "Of course. I’ll come help." },
              ]
            : calls === 2
              ? [
                  { kind: "crossing", who: "ella", to: "kitchen", text: "Ella comes into the Kitchen after you." },
                  { kind: "dialogue", speakerId: "ella", text: ellaArrivalLine },
                ]
              : [{ kind: "narration", text: "Ella takes the plate." }];
        return {
          content: JSON.stringify({ segments }),
          finishReason: "stop",
          usage: { inputTokens: 10, outputTokens: 10 },
        };
      }
      if (crossing) {
        const submitted = messages.at(-2)?.content;
        const reminder = messages.at(-1)?.content ?? "";
        const afterMove = calls > beforeMove.length;
        const zone = afterMove ? crossing.destination : crossing.origin;
        assert.equal(submitted, afterMove ? crossing.activity : beforeMove[calls - 1]);
        assert.match(reminder, new RegExp(`Keep the player in "${zone}" until they use Move or Visit`));
        assert.match(reminder, /End crossing attempts before entry despite prior prose/);
        const segments =
          calls === 1
            ? [
                { kind: "dialogue", speakerId: "ella", text: ellaFarewell },
                { kind: "narration", text: crossing.approach },
              ]
            : [{ kind: "narration", text: afterMove ? crossing.arrival : crossing.approach }];
        return {
          content: JSON.stringify({ segments }),
          finishReason: "stop",
          usage: { inputTokens: 10, outputTokens: 10 },
        };
      }
      if (residentCrossing || residentDeparture) {
        assert.match(messages.map(({ content }) => content).join("\n"), /"type":"move".*type:"depart"/);
        return {
          content: JSON.stringify({
            segments: [
              { kind: "dialogue", speakerId: "mara", text: "I'll go check on something." },
              ...(residentCrossing
                ? [{ kind: "dialogue", speakerId: "ella", text: "Bring us something good.", presentation: "aside" }]
                : []),
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
                    {
                      for: ["mara"],
                      owner: "mara",
                      class: "perspective",
                      current: true,
                      about: ["player"],
                      text: "Gidget is pleased the player asked.",
                      source: [{ segment: "missing-note-source" }],
                    },
                  ],
                }
              : {}),
          }),
          finishReason: "stop",
          usage: { inputTokens: 10, outputTokens: 10 },
        };
      }
      if (scenario === "crossing-rejected" || scenario === "departure-rejected") {
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
            : {
                type: "scene.end",
                id: "cross",
                at: "door",
                independent: true,
                source: [{ input: departure, ground: { kind: "visible-action", to: ["mara", "ella"] } }],
              };
        return {
          content: JSON.stringify({
            segments: [{ kind: "narration", id: "door", text: "You step out of the Mill." }],
            commands: [attempted],
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
          targetId: location ? undefined : "mara",
          expectedSceneRevision: revision,
        },
      });
    try {
      const before = (await getActive()).json().session;
      if (trespass) {
        const cross = {
          sessionId: before.id,
          zoneId: "pond",
          operationId: "cross-pond",
          expectedSceneRevision: before.sceneRevision,
          trespass: true,
        };
        const move = (payload: typeof cross | Omit<typeof cross, "trespass">) =>
          host.app.inject({ method: "POST", url: "/api/villages/rooms/zone", payload });
        const crossed = await move(cross);
        assert.equal(crossed.statusCode, 200, crossed.body);
        assert.equal(crossed.json().session.zoneId, "pond");
        assert.equal(crossed.json().session.trespassing, true);
        assert.equal((await getActive()).json().session.trespassing, true);
        assert.equal((await move(cross)).statusCode, 200);
        const { trespass: _, ...ordinary } = cross;
        assert.equal((await move(ordinary)).statusCode, 409, "A move receipt cannot be replayed in a different mode.");
        const left = await move({
          ...ordinary,
          zoneId: "common",
          operationId: "leave-pond",
          expectedSceneRevision: (await getActive()).json().session.sceneRevision,
        });
        assert.equal(left.statusCode, 200, left.body);
        assert.equal(left.json().session.zoneId, "common");
        assert.equal(left.json().session.trespassing, undefined);
        assert.equal((await move(cross)).json().session.zoneId, "common", "A late replay cannot cross again.");
        assert.equal(calls, 0, "Crossing and departure purchase no Scene reply.");
        return;
      }
      if (follow) {
        const hallReply = await turn(before.id, before.sceneRevision, "invite-ella", invitation);
        assert.equal(hallReply.statusCode, 200, hallReply.body);
        assert.equal(hallReply.json().session.zoneId, "common");
        const move = await host.app.inject({
          method: "POST",
          url: "/api/villages/rooms/zone",
          payload: {
            sessionId: before.id,
            zoneId: "kitchen",
            operationId: "move-to-kitchen",
            expectedSceneRevision: hallReply.json().session.sceneRevision,
          },
        });
        assert.equal(move.statusCode, 200, move.body);
        const moved = move.json().session;
        assert.equal(moved.zoneId, "kitchen");
        assert.deepEqual(moved.activeIds, []);
        assert.equal(calls, 1, "Player Move makes no model call and leaves resident choices open");
        const afterMove = await turn(moved.id, moved.sceneRevision, "after-move", afterMoveInput);
        assert.equal(afterMove.statusCode, 200, afterMove.body);
        const arrived = afterMove.json().session;
        assert.deepEqual(arrived.activeIds, ["ella"]);
        const kitchenSpeech = host.scene().lines.find((line) => line.content === ellaArrivalLine);
        assert.equal(kitchenSpeech?.zoneId, "kitchen");
        assert.deepEqual(kitchenSpeech.heardBy.toSorted(), ["ella", "player"]);
        assert.equal(calls, 2);
        const current = (await getActive()).json().session;
        const next = await turn(current.id, current.sceneRevision, "plate", waitInKitchen);
        assert.equal(next.statusCode, 200, next.body);
        assert.equal(calls, 3);
        return;
      }
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
          const aside = saved.lines.find((line) => line.content === "Bring us something good.");
          assert.equal(aside?.presentation, "aside");
          assert.equal(aside.asideFor, saved.lines.find((line) => line.content === "I'll go check on something.")?.id);
          assert.deepEqual(aside.heardBy.toSorted(), ["ella", "mara", "player"]);
          assert.equal(saved.submissions.at(-1)?.acceptance.rejected.length, 1);
          assert(!outcome.body.includes("A remark only heard outside."));
          assert(
            !saved.lines.find((line) => line.content === "A remark only heard outside.")?.heardBy.includes("player"),
          );
          const move = await host.app.inject({
            method: "POST",
            url: "/api/villages/rooms/zone",
            payload: {
              sessionId: after.id,
              zoneId: "exterior",
              operationId: "follow-resident",
              expectedSceneRevision: after.sceneRevision,
            },
          });
          assert.equal(move.statusCode, 200, move.body);
          const followed = move.json().session;
          assert.equal(followed.zoneId, "exterior");
          assert.deepEqual(followed.activeIds, ["mara"]);
          assert.equal(calls, 1, "The destination cast is returned before another turn");
        } else {
          assert.equal(receipt.departure?.actorId, "mara");
          assert(saved.departedIds?.includes("mara"));
        }
        return;
      }
      if (scenario === "crossing-rejected" || scenario === "departure-rejected") {
        const local = await turn(
          before.id,
          before.sceneRevision,
          "walk-out",
          scenario === "departure-rejected" ? departure : walk,
        );
        assert.equal(local.statusCode, 502, local.body);
        const recovered = await getActive();
        const source = recovered.json().session;
        assert.equal(source.id, before.id);
        assert.equal(source.zoneId, before.zoneId);
        assert.equal(source.status, "active");
        assert.equal(calls, 1);
        assert.equal(source.latestTurn.published, false);
        assert.equal(host.scene().submissions[0].acceptance.status, "abandoned");
        assert(!host.scene().navigationReceipts?.length);
        assert(!recovered.body.includes("You step out of the Mill."));
        return;
      }
      if (crossing) {
        let current = before;
        for (const [index, message] of beforeMove.entries()) {
          const result = await turn(current.id, current.sceneRevision, "before-move-" + index, message);
          assert.equal(result.statusCode, 200, result.body);
          current = result.json().session;
          assert.equal(current.id, before.id);
          assert.equal(current.zoneId, before.zoneId);
          assert.equal(current.latestTurn.published, true);
          assert.equal(current.travel, undefined);
        }
        const farewell = host.scene().lines.find((line) => line.content === ellaFarewell);
        assert.equal(farewell?.zoneId, before.zoneId);
        assert(farewell.heardBy.includes("ella"));
        assert.equal(calls, beforeMove.length);
        assert(!host.scene().lines.some((line) => line.content === crossing.arrival));
        const move = await host.app.inject({
          method: "POST",
          url: "/api/villages/rooms/zone",
          payload: {
            sessionId: before.id,
            zoneId: crossing.destinationId,
            operationId: "explicit-move",
            expectedSceneRevision: current.sceneRevision,
          },
        });
        assert.equal(move.statusCode, 200, move.body);
        const moved = move.json().session;
        assert.equal(moved.id, before.id);
        assert.equal(moved.zoneId, crossing.destinationId);
        const reused = await turn(before.id, moved.sceneRevision, "explicit-move", crossing.departure);
        assert.equal(reused.statusCode, 409, reused.body);
        assert.equal(calls, beforeMove.length, "Explicit Move and rejected ID reuse both skip generation");
        const arrived = await turn(moved.id, moved.sceneRevision, "after-move", crossing.activity);
        assert.equal(arrived.statusCode, 200, arrived.body);
        const arrival = host.scene().lines.find((line) => line.content === crossing.arrival);
        assert.equal(arrival?.zoneId, crossing.destinationId);
        assert(!arrival.heardBy.includes("ella"));
        assert.equal(calls, beforeMove.length + 1);
        return;
      }
      const request = await turn(
        before.id,
        before.sceneRevision,
        "ask-hotel",
        "Gidget, could you take me to your room at Willow Hotel?",
      );
      if (scenario === "overheard") {
        assert.equal(request.statusCode, 502, request.body);
        assert(!request.body.includes("both of you"));
        const saved = await createVillageRepository(() => host.documents as never).readAuthority();
        assert.deepEqual(saved.venues.find((row) => row.id === "hotel")?.access?.permissions, []);
        assert.equal(calls, 1);
        return;
      }
      assert.equal(request.statusCode, 200, request.body);
      const source = request.json().session;
      assert.equal(source.placeId, "mill");
      if (scenario === "prose-only") {
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
      if (scenario === "unprepared-place") {
        assert.equal(response.statusCode, 409, response.body);
        assert.equal(classifications, 0, "An unprepared invitation is refused before any preparation request");
        assert.equal(calls, 1);
        assert.equal((await getActive()).json().session.id, source.id);
        const world = await repository.readAuthority({ memories: true });
        assert.equal(findLocation(world, "hotel")!.access!.permissions.length, 1, "The invitation is retained");
        return;
      }
      assert.equal(response.statusCode, 200, response.body);
      const arrived = response.json().session;
      assert.notEqual(arrived.id, source.id);
      assert.equal(arrived.status, "active");
      assert.equal(arrived.visitEventOpening, undefined);
      assert.equal(arrived.placeId, "hotel");
      assert.equal(arrived.zoneId, "room");
      assert.deepEqual(arrived.activeIds, ["mara"]);
      assert.deepEqual(arrived.lines, []);
      assert.equal(host.scene().status, "closed");
      assert.equal(calls, 1, "travel itself makes no model call");
      assert.equal((await travel()).json().session.id, arrived.id);
      const world = await repository.readAuthority({ memories: true });
      assert.equal(findLocation(world, "hotel")!.access!.permissions[0].sceneId, arrived.id);
      assert.equal(classifications, 0, "A prepared Place needs no Class generation");
      if (scenario === "prepared-place") assert.equal(world.worldPlaces.places.hotel.prepared, true);
      assert.equal(world.recentVisitRolls?.hotel, undefined, "Invited Visit skips the spontaneous opening roll");
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

await runCase("scene-travel/local-permission", async () => {
  for (const mode of ["invite", "whisper", "conditional", "unlisted", "unrelated"]) {
    const host = await packagedSceneServer({
      configure(world) {
        world.spontaneousEvents = false;
        const venue = world.venues[0];
        venue.access!.managerIds = ["mara"];
        venue.zones!.find((zone) => zone.id === "exterior")!.connectedTo!.push("airstrip");
        venue.zones!.push({
          ...defaultVenueSpace("other"),
          id: "airstrip",
          name: "Airstrip",
          description: "An unfenced grass airstrip.",
          kind: "restricted",
          connectedTo: ["exterior"],
          seen: true,
        });
        venue.zones!.find((zone) => zone.id === "exterior")!.connectedTo!.push("unseen-room");
        venue.zones!.push({
          ...defaultVenueSpace("other"),
          id: "unseen-room",
          name: "Unseen private room",
          description: "A private room beside the entrance.",
          kind: "restricted",
          connectedTo: ["exterior"],
          seen: false,
        });
        initializeVenueAccess(venue);
        venue.zones!.find((zone) => zone.id === "airstrip")!.access!.mode = "permission-required";
        venue.zones!.find((zone) => zone.id === "unseen-room")!.access!.mode = "permission-required";
        if (mode === "whisper") {
          const resident = structuredClone(world.villagers[0]);
          resident.characterId = "leo";
          resident.incarnation = "leo:local-invite";
          resident.cardSnapshot.id = "leo";
          resident.cardSnapshot.name = "Leo";
          world.villagers.push(resident);
        }
      },
      configureScene(scene) {
        if (mode !== "whisper") return;
        const person = { characterId: "leo", name: "Leo", doing: "Listening" };
        scene.activeIds.push("leo");
        scene.participants.push(person);
        scene.sceneAttendance!.occupants.push({ ...person, zoneId: "common" });
      },
    });
    let calls = 0;
    host.model.chatComplete = async (messages) => {
      calls++;
      const prompt = messages.map((message) => message.content).join("\n");
      const choices = JSON.parse(prompt.match(/Visit invitations available in this Scene: ([^\n]+)/)![1]);
      const option = choices.find((choice: { zoneId: string }) => choice.zoneId === "airstrip")?.option;
      assert(option, "The actual fitted reply includes the host's same-Venue invitation option");
      assert.match(
        messages.at(-1)!.content,
        /each lasting change on its own tag line/,
        "The final reminder uses one proposal line per change",
      );
      if (mode === "unrelated")
        assert(
          !choices.some((choice: { zoneId: string }) => choice.zoneId === "unseen-room"),
          "Unrelated ordinary chat does not list unseen local Zones",
        );
      return {
        content:
          mode === "conditional"
            ? "[mara]: Ask me after lunch first."
            : mode === "unrelated"
              ? "[mara]: Just a quiet afternoon."
              : [
                  "Narration: A breeze stirs the grass.",
                  mode === "whisper"
                    ? "[!mara] [whisper leo]: Yes, go take a look at the Airstrip."
                    : "[!mara]: Yes, go take a look at the Airstrip.",
                  "[visit]: " + (mode === "unlisted" ? 12 : option),
                ].join("\n"),
        finishReason: "stop",
        usage: { inputTokens: 10, outputTokens: 10 },
      };
    };
    try {
      const before = (await host.app.inject({ method: "GET", url: "/api/villages/rooms/active" })).json().session;
      const input = {
        sessionId: before.id,
        message: mode === "unrelated" ? "How is your afternoon?" : "May I look around the Airstrip?",
        mode: "chat",
        submissionId: "local-invite",
        expectedSceneRevision: before.sceneRevision,
      };
      const response = await host.app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload: input });
      if (mode === "unlisted" || mode === "whisper") {
        assert.equal(response.statusCode, 200, response.body);
        assert.deepEqual(
          response.json().session.lines.map((line: { content: string }) => line.content),
          ["A breeze stirs the grass."],
        );
        const world = await createVillageRepository(() => host.documents as never).readAuthority();
        assert.equal(world.venues[0].access!.permissions.length, 0);
        continue;
      }
      assert.equal(response.statusCode, 200, response.body);
      const scene = response.json().session;
      assert.equal(scene.id, before.id);
      assert.equal(scene.travel, undefined, "A local permission uses ordinary Move in the same Scene");
      const world = await createVillageRepository(() => host.documents as never).readAuthority();
      const venue = world.venues[0],
        zone = venue.zones!.find((zone) => zone.id === "airstrip")!;
      assert.equal(venue.access!.permissions.length, mode === "invite" ? 1 : 0);
      if (mode !== "invite") continue;
      const grant = venue.access!.permissions[0];
      assert.equal(grant.sceneId, scene.id);
      assert.equal(grant.duration, "visit");
      assert.equal(grant.accompaniedBy, null);
      assert.equal(evaluateZoneAccess(venue, zone, "player", { sceneId: scene.id }).allowed, true);
      assert.equal(evaluateZoneAccess(venue, zone, "player", { sceneId: "another-scene" }).allowed, false);
      const replay = await host.app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload: input });
      assert.equal(replay.statusCode, 200, replay.body);
      assert.equal(calls, 1, "A saved invitation replay buys no reply and adds no new permission");
      const moved = await host.app.inject({
        method: "POST",
        url: "/api/villages/rooms/zone",
        payload: {
          sessionId: scene.id,
          zoneId: "airstrip",
          operationId: "use-local-permission",
          expectedSceneRevision: scene.sceneRevision,
          follow: true,
        },
      });
      assert.equal(moved.statusCode, 200, moved.body);
      assert.equal(moved.json().session.zoneId, "airstrip");
      assert.equal(moved.json().session.trespassing, undefined);
      assert.equal(calls, 1, "Walking an invited safe route makes no model call");
    } finally {
      await host.stop();
    }
  }
});

await runCase("scene-travel/doorway-after-hours", async () => {
  const host = await packagedSceneServer({
    configure(world, now) {
      const venue = world.venues[0];
      venue.access!.managerIds = ["mara"];
      const weekday = new Intl.DateTimeFormat("en", { weekday: "long", timeZone: "UTC" }).format(new Date(now));
      venue.zones!.find((zone) => zone.id === "common")!.access!.visitorHours = [
        { days: [weekday === "Monday" ? "Tuesday" : "Monday"], start: "07:00", end: "16:00" },
      ];
    },
    configureScene(scene) {
      scene.zoneId = "exterior";
      scene.activeIds = [];
      scene.participants = [];
      scene.accompanying = [];
    },
  });
  let calls = 0;
  host.model.chatComplete = async (messages, options) => {
    calls++;
    assert.equal((options as { responseFormat?: unknown }).responseFormat, undefined);
    const prompt = messages.map(({ content }) => content).join("\n");
    const choices = JSON.parse(prompt.match(/Visit invitations available in this Scene: ([^\n]+)/)![1]);
    const choice = choices.find(
      (row: { actorId: string; zoneId: string }) => row.actorId === "mara" && row.zoneId === "common",
    );
    assert(choice?.afterHours);
    return {
      content: [
        "Narration: Water drips from the eaves.",
        "[!mara] [to player]: Come into the Common room.",
        "[visit]: " + (calls === 1 ? "unlisted" : choice.option),
      ].join("\n"),
      finishReason: "stop",
      usage: { inputTokens: 10, outputTokens: 10 },
    };
  };
  const world = () => createVillageRepository(() => host.documents as never).readAuthority();
  const input = () => ({
    sessionId: "browser",
    mode: "chat",
    targetId: "",
    message: 'I call, "Mara, may I come in?"',
    expectedSceneRevision: host.scene().sceneRevision,
  });
  const send = (id: string, payload = input()) =>
    host.app.inject({
      method: "POST",
      url: "/api/villages/rooms/turn",
      payload: { ...payload, submissionId: id },
    });
  try {
    const initial = await host.app.inject({ method: "GET", url: "/api/villages/rooms/active" });
    assert.equal(initial.statusCode, 200, initial.body);
    assert.deepEqual(initial.json().session.activeIds, []);
    const declined = await send("invalid-doorway-invitation");
    assert.equal(declined.statusCode, 200, declined.body);
    assert.deepEqual(
      declined.json().session.lines.map((line: { content: string }) => line.content),
      ["Water drips from the eaves."],
    );
    assert.deepEqual((await world()).venues[0].access!.permissions, []);
    const invitation = input();
    const spoken = await send("valid-doorway-invitation", invitation);
    assert.equal(spoken.statusCode, 200, spoken.body);
    assert.equal(spoken.json().session.zoneId, "exterior");
    assert(
      spoken.json().session.lines.some((line: { content: string }) => line.content === "Come into the Common room."),
    );
    assert.equal((await world()).venues[0].access!.permissions[0]?.outsideHours, true);
    assert.equal((await send("valid-doorway-invitation", invitation)).statusCode, 200);
    const moved = await host.app.inject({
      method: "POST",
      url: "/api/villages/rooms/zone",
      payload: {
        sessionId: "browser",
        zoneId: "common",
        operationId: "move-after-invitation",
        expectedSceneRevision: host.scene().sceneRevision,
      },
    });
    assert.equal(moved.statusCode, 200, moved.body);
    assert.equal(moved.json().session.zoneId, "common");
    assert.equal(calls, 2);
  } finally {
    await host.stop();
  }
});
