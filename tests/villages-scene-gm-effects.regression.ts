import assert from "node:assert/strict";
import { mock } from "node:test";
import { packagedSceneServer } from "./fixtures/packaged-scene-server.fixture.js";
import { fixtureVillageState } from "./helpers/village-storage.fixture.js";
import { draftRenovationProject } from "../packages/villages/src/server/features/projects/project-drafts.js";
import { initializeVenueAccess } from "../packages/villages/src/server/domain/rules/venue-access.js";
import { fixtureWish } from "./helpers/social-wishes-fixture.js";
import { materializeGmReply } from "../packages/villages/src/server/domain/rules/scene-gm.js";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import {
  defaultRelationshipState,
  neutralRelationship,
  relationshipKey,
} from "../packages/villages/src/server/domain/rules/relationship-rules.js";
import { fixtureRelationshipState } from "./helpers/village-storage.fixture.js";
import { relationshipDocumentId } from "../packages/villages/src/server/adapters/storage/relationship-payload-store.js";
import { ensureNarrative } from "../packages/villages/src/server/domain/rules/narrative-development.js";
import { SCENE_DEVELOPMENT_SCHEMA } from "../packages/villages/src/server/domain/rules/narrative-prompts.js";

await import(pathToFileURL(resolve("packages/villages/server.mjs")).href);
mock.timers.enable({ apis: ["Date"], now: new Date("2026-11-05T20:00:00Z") });
const nomination = materializeGmReply(
  {
    input: [{ kind: "speech", text: "Join me." }],
    segments: [{ kind: "dialogue", speakerId: "mara", text: "Perhaps." }],
    immediateResidentMoves: [{ characterIds: ["mara"], zoneId: "exterior", source: 0 }],
  },
  "Join me.",
);
assert.equal(
  (nomination.immediateResidentMoves as any[])[0].source,
  0,
  "Input indexes never shift with generated segments",
);

for (const scenario of [
  "npc",
  "project",
  "project-conclude",
  "project-greet",
  "wish",
  "relationship",
  "occupancy",
  "empty-conclude",
  "draft-appointment",
  "physical",
  "policy",
] as const) {
  const host = await packagedSceneServer({
    configure(world, now) {
      if (scenario === "physical" || scenario === "policy") {
        initializeVenueAccess(world.venues[0]);
        world.venues[0].access!.managerIds = [scenario === "physical" ? "player" : "mara"];
        world.venues[0].zones![1]!.description = "White walls. Blue paint and brushes are here.";
      }
      if (scenario === "relationship") {
        world.relationshipContext = defaultRelationshipState(world.seed);
        world.relationshipContext.edges[relationshipKey("mara", "player")] = {
          ...neutralRelationship("mara", "player"),
          revision: 3,
          connection: "Friends",
          stance: "Wary",
          expectations: ["Listen carefully"],
          concerns: ["An earlier disagreement"],
          updatedAt: now,
        };
      }
      if (scenario === "occupancy")
        world.villagers = ["mara", "bryn", "cora", "dev", "eli"].map((characterId) => ({
          letterFontId: "caveat",
          ...structuredClone(world.villagers[0]),
          characterId,
          cardSnapshot: { ...world.villagers[0].cardSnapshot, id: characterId, name: characterId },
        }));
      if (scenario === "project" || scenario === "project-conclude" || scenario === "project-greet") {
        initializeVenueAccess(world.venues[0]);
        world.venues[0].access!.managerIds = ["mara"];
        draftRenovationProject(
          world,
          "mill",
          { title: "Larger Common room", detail: "Capacity three.", capacity: 3 },
          "project:common",
        );
      }
      if (scenario === "wish")
        world.villagers[0].wishes = [
          fixtureWish(
            { wish: "Share my leek-soup recipe in conversation.", reason: "Enjoys sharing recipes." },
            "recipe",
            now,
          ),
        ];
    },
    configureScene(scene) {
      if (scenario === "project-greet") scene.status = "opening";
      if (scenario !== "occupancy") return;
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
  let calls = 0;
  host.model.chatComplete = async () => {
    calls++;
    const message =
      scenario === "empty-conclude" || scenario === "project-conclude" || scenario === "project-greet"
        ? ""
        : scenario === "occupancy"
          ? "Mara and Bryn, come outside now."
          : scenario === "physical"
            ? "I paint the white walls blue using the paint here."
            : "Hello.";
    const common = { input: message ? [{ kind: "speech", text: message }] : [] };
    const content =
      scenario === "physical"
        ? {
            input: [{ kind: "action", text: message }],
            segments: [{ kind: "narration", text: "You paint the white walls blue with the available paint." }],
            action: {
              happened: true,
              segment: 0,
              actorIds: ["player"],
              consent: [],
              appearanceChanged: true,
              edits: [{ before: "White walls.", after: "Blue walls." }],
              dayNight: true,
            },
          }
        : scenario === "policy"
          ? {
              ...common,
              segments: [
                { kind: "dialogue", speakerId: "mara", text: "You are now a co-manager of the Mill with me." },
              ],
              access: [
                {
                  actorId: "mara",
                  venueId: "mill",
                  zoneId: null,
                  outcome: "access-management",
                  evidence: [0],
                  command: { action: "venue-policy", managerIds: ["mara", "player"], visitorHours: null },
                },
              ],
            }
          : scenario === "npc"
            ? {
                ...common,
                segments: [
                  { kind: "narration", text: "A courier enters and introduces herself as Nell." },
                  { kind: "dialogue", speakerId: "new:nell", text: "I enjoy collecting pressed leaves." },
                ],
                npcIntroductions: [
                  {
                    ref: "new:nell",
                    name: "Nell",
                    label: "Courier",
                    characterization: "A cheerful courier who collects leaves.",
                    segment: 0,
                  },
                ],
                memoryChanges: [
                  {
                    action: "create",
                    kind: "experience",
                    text: "Nell told the player she enjoys collecting pressed leaves.",
                    subjects: ["new:nell", "player"],
                    learners: {
                      "new:nell": {
                        basis: "observation",
                        support: [{ lineId: 1, excerpt: "I enjoy collecting pressed leaves." }],
                      },
                      player: {
                        basis: "observation",
                        support: [{ lineId: 1, excerpt: "I enjoy collecting pressed leaves." }],
                      },
                    },
                    screening: { disposition: "clear" },
                  },
                ],
              }
            : scenario === "occupancy"
              ? {
                  ...common,
                  segments: [{ kind: "dialogue", speakerId: "mara", text: "I'll see." }],
                  immediateResidentMoves: [{ characterIds: ["mara", "bryn"], zoneId: "exterior", source: 0 }],
                }
              : scenario === "relationship"
                ? {
                    ...common,
                    segments: [
                      { kind: "dialogue", speakerId: "mara", text: "Thank you for hearing me. I feel more at ease." },
                    ],
                    relationshipChanges: {
                      changes: [
                        {
                          fromId: "mara",
                          toId: "player",
                          expectedRevision: 3,
                          patch: { stance: "More at ease" },
                          lineIds: [0],
                        },
                      ],
                    },
                  }
                : scenario === "project" || scenario === "project-conclude" || scenario === "project-greet"
                  ? {
                      ...common,
                      segments: [
                        {
                          kind: "dialogue",
                          speakerId: "mara",
                          text: "I approve the exact Larger Common room design, and I want to lead its construction.",
                        },
                      ],
                      projectSpeech: ["approval", "builder"].map((kind) => ({
                        projectId: "project:common",
                        revision: 1,
                        kind,
                        speakerId: "mara",
                        citations: [{ segment: 0 }],
                      })),
                    }
                  : scenario === "wish"
                    ? {
                        ...common,
                        segments: [
                          {
                            kind: "dialogue",
                            speakerId: "mara",
                            text: "My favorite leek soup uses sliced leeks, potatoes and broth, simmered until tender.",
                          },
                        ],
                        wishChanges: [
                          {
                            actorId: "mara",
                            wishId: "recipe",
                            intent: "fulfilled",
                            evidence: [0],
                            reason: "Shared her recipe in conversation.",
                          },
                        ],
                      }
                    : scenario === "draft-appointment" && calls === 1
                      ? {
                          ...common,
                          segments: [{ kind: "dialogue", speakerId: "mara", text: "Meet me today at 19:30." }],
                          halt: {
                            reason: "none",
                            quote: "",
                            appointments: [
                              { source: "draft", quote: "Meet me today at 19:30.", date: "2026-11-05", minute: 1170 },
                            ],
                          },
                        }
                      : { ...common, segments: [{ kind: "dialogue", speakerId: "mara", text: "Good evening." }] };
    return { content: JSON.stringify(content), finishReason: "stop", usage: { inputTokens: 10, outputTokens: 10 } };
  };
  try {
    await host.app.inject({ method: "GET", url: "/api/villages/rooms/active" });
    const payload = {
      sessionId: "browser",
      submissionId: "b1111111-1111-4111-8111-111111111111",
      message:
        scenario === "empty-conclude" || scenario === "project-conclude"
          ? ""
          : scenario === "occupancy"
            ? "Mara and Bryn, come outside now."
            : scenario === "physical"
              ? "I paint the white walls blue using the paint here."
              : "Hello.",
      mode: scenario === "empty-conclude" || scenario === "project-conclude" ? "leave" : "chat",
      targetId: "",
      expectedSceneRevision: host.scene().sceneRevision,
    };
    const url =
      scenario === "project-greet"
        ? "/api/villages/rooms/greet"
        : scenario === "empty-conclude" || scenario === "project-conclude"
          ? "/api/villages/rooms/leave"
          : "/api/villages/rooms/turn";
    const requestPayload = scenario === "project-greet" ? { sessionId: "browser" } : payload;
    const response = await host.app.inject({ method: "POST", url, payload: requestPayload });
    assert.equal(response.statusCode, 200, scenario + ": " + response.body);
    assert.equal(calls, scenario === "draft-appointment" ? 2 : 1, scenario);
    const world = fixtureVillageState(host.records.get("villages-village").data, host.records);
    if (scenario === "occupancy") {
      assert.equal(response.json().turnOutcome, "occupancy-unavailable");
      assert.equal(host.scene().lines.length, 0, "The whole request is held even without emitted moves");
    }
    if (scenario === "relationship") {
      const social = fixtureRelationshipState(host.records.get(relationshipDocumentId(world.seed)), host.records);
      const edge = social.edges[relationshipKey("mara", "player")];
      assert.equal(edge.stance, "More at ease");
      assert.equal(edge.revision, 4);
      assert.equal(edge.connection, "Friends");
      assert.deepEqual(edge.concerns, ["An earlier disagreement"]);
      assert.deepEqual(edge.expectations, ["Listen carefully"]);
    }
    if (scenario === "npc") {
      const npc = Object.values(world.worldPlaces.npcs).find((row) => row.name === "Nell")!;
      assert(npc, "New NPC has a permanent server identity");
      assert(!host.scene().lines[0].heardBy.includes(npc.id), "A later arrival cannot hear the original input");
      assert(host.scene().lines.some((line) => line.speakerId === npc.id));
      assert(JSON.stringify(world.memories).includes("pressed leaves"), "Bound NPC Memory commits");
      assert(!JSON.stringify(world.memories).includes("new:nell"));
    }
    if (scenario === "project" || scenario === "project-conclude" || scenario === "project-greet") {
      const project = world.projects.find((row) => row.id === "project:common")!;
      assert.equal(project.status, "planning", "Speech never starts work");
      assert(project.lifecycle!.approvals.some((row) => row.residentId === "mara"));
      assert(project.lifecycle!.candidates.some((row) => row.residentId === "mara"));
      const turn = host.scene().submissions.at(-1)!;
      assert(
        turn.projectSpeech!.every((proposal) =>
          proposal.citations.every((citation) => turn.replyLineIds!.includes(citation.lineId)),
        ),
        "Project citations bind to saved transcript identities",
      );
    }
    if (scenario === "wish") assert.equal(world.villagers[0].wishes[0].status, "fulfilled");
    if (scenario === "draft-appointment")
      assert(
        !host.scene().lines.some((line) => line.content.includes("19:30")),
        "Unsupported purchased draft is replaced before display",
      );
    const replay = await host.app.inject({ method: "POST", url, payload: requestPayload });
    assert.equal(replay.statusCode, 200, replay.body);
    assert.equal(calls, scenario === "draft-appointment" ? 2 : 1, "Recovery reuses purchased responses");
    if (scenario === "physical" || scenario === "policy") {
      const current = fixtureVillageState(host.records.get("villages-village").data, host.records);
      if (scenario === "policy") assert.deepEqual(current.venues[0]!.access!.managerIds, ["mara", "player"]);
      else {
        assert.match(current.venues[0]!.zones![1]!.description, /Blue walls/);
        const memories = current.memories.records.filter(
          (row) => row.committedEffect?.id === `venue-chat:browser:${payload.submissionId}`,
        );
        assert.equal(memories.length, 1, "A natural physical edit creates one committed mechanical Memory");
        assert.match(memories[0]!.text, /Blue walls/);
        assert.equal(host.scene().submissions.at(-1)!.sceneHearingVersion, 2);
      }
    }
  } finally {
    await host.stop();
  }
}
{
  const host = await packagedSceneServer({
    configure(world, now) {
      world.backgroundPace = "balanced";
      world.venues[0].zones![0].description = "";
      world.venues[0].zones![1].description = "A room with a wooden sign.";
      ensureNarrative(world, now);
    },
  });
  let calls = 0;
  host.model.chatComplete = async (messages: any[]) => {
    calls++;
    const prompt = messages.map((row) => row.content).join("\n");
    assert(prompt.includes(SCENE_DEVELOPMENT_SCHEMA), "The GM receives the complete environmental effect schema");
    assert.doesNotMatch(prompt, /Do not emit effect metadata|System independently checks your unchanged prose/);
    const grant = JSON.parse(prompt.match(/Immutable local admission: ([^\n]+)/u)![1]);
    const target = grant.targets[0];
    return {
      finishReason: "stop",
      content: JSON.stringify({
        input: [{ kind: "speech", text: "Hello." }],
        segments: [{ kind: "narration", text: "A gust rattles the wooden sign." }],
        narrativeIntroduction: {
          status: "introduced",
          segment: 0,
          quote: "A gust rattles the wooden sign.",
          development: {
            severity: "gentle",
            occurrence: "A gust rattles the wooden sign.",
            situation: {
              scope: "zone",
              id: null,
              expectedRevision: 0,
              title: "Rattling sign",
              summary: "The sign rattles in the breeze.",
              status: "active",
            },
            physical: [],
            conditions: [
              {
                id: null,
                expectedRevision: 0,
                venueId: target.venueId,
                zoneId: target.zoneId,
                observation: "The wooden sign rattles in the breeze.",
                restriction: "none",
                remedy: "",
                endsAt: "2026-11-05T20:10:00.000Z",
                clear: false,
              },
            ],
            weather: null,
          },
        },
      }),
    };
  };
  try {
    await host.app.inject({ method: "GET", url: "/api/villages/rooms/active" });
    const payload = {
      sessionId: "browser",
      submissionId: "c1111111-1111-4111-8111-111111111111",
      message: "Hello.",
      mode: "chat",
      targetId: "",
      expectedSceneRevision: host.scene().sceneRevision,
    };
    const response = await host.app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload });
    assert.equal(response.statusCode, 200, response.body);
    const world = fixtureVillageState(host.records.get("villages-village").data, host.records);
    assert.equal(world.narrative!.conditions.length, 1);
    assert.equal(world.narrative!.receipts.length, 1);
    const replay = await host.app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload });
    assert.equal(replay.statusCode, 200, replay.body);
    assert.equal(calls, 1, "Development and recovery use the one purchased GM response");
  } finally {
    await host.stop();
  }
}
mock.timers.reset();
{
  const host = await packagedSceneServer({
    configure(world) {
      const remote = structuredClone(world.villagers[0]!);
      remote.characterId = "bryn";
      remote.cardSnapshot.id = "bryn";
      remote.cardSnapshot.name = "Bryn";
      remote.cardSnapshot.description = "REMOTE DISTINCTIVE CARD";
      world.villagers.push(remote);
    },
    configureScene(scene) {
      scene.accompanying!.push({ characterId: "bryn", zoneId: "exterior" });
      scene.sceneAttendance!.occupants.push({
        characterId: "bryn",
        name: "Bryn",
        doing: "Waiting",
        zoneId: "exterior",
      });
    },
  });
  const knockAction = "*I knock on the exterior door and call for Bryn.*";
  const messages = ['"Hello." ' + knockAction, "Goodbye, Bryn.", "Let us continue locally."];
  let calls = 0;
  host.model.chatComplete = async (prompt: any[]) => {
    const index = calls++;
    if (index === 0) assert.ok(prompt.slice(1).some((row) => row.content.includes("REMOTE DISTINCTIVE CARD")));
    if (index === 2)
      assert.ok(
        !prompt.some((row) => row.content.includes("REMOTE DISTINCTIVE CARD")),
        "Ended contact stops offering the remote full profile",
      );
    return {
      finishReason: "stop",
      content: JSON.stringify({
        input:
          index === 0
            ? [
                { kind: "speech", text: "Hello." },
                { kind: "action", text: knockAction },
              ]
            : [{ kind: "speech", text: messages[index] }],
        ...(index === 0 ? { contactAttempt: { kind: "knock", inputSpan: 1, segment: 0, zoneId: "exterior" } } : {}),
        segments: [
          ...(index === 0
            ? [
                {
                  kind: "narration",
                  text: "A knock sounds at the door.",
                  sound: { sourceId: "player", text: "A knock." },
                },
              ]
            : []),
          {
            kind: "dialogue",
            speakerId: index < 2 ? "bryn" : "mara",
            text: index === 0 ? "Hello there!" : index === 1 ? "Goodbye." : "Certainly.",
            ...(index === 0 ? { delivery: "shout" } : {}),
          },
        ],
        ...(index === 1 ? { events: { contactEnd: [{ source: 0 }] } } : {}),
      }),
    };
  };
  try {
    for (let index = 0; index < messages.length; index++) {
      await host.app.inject({ method: "GET", url: "/api/villages/rooms/active" });
      const response = await host.app.inject({
        method: "POST",
        url: "/api/villages/rooms/turn",
        payload: {
          sessionId: "browser",
          submissionId: `d${index}111111-1111-4111-8111-111111111111`,
          message: messages[index],
          mode: "chat",
          targetId: "",
          expectedSceneRevision: host.scene().sceneRevision,
        },
      });
      assert.equal(response.statusCode, 200, response.body);
      if (index === 0) assert.equal(host.scene().doorwayContacts?.[0]?.characterId, "bryn");
      if (index >= 1)
        assert.equal(host.scene().doorwayContacts?.length, 0, "A goodbye cannot re-add the ended contact");
    }
    assert.equal(calls, 3);
  } finally {
    await host.stop();
  }
}
console.log(
  "GM NPC identity/Memory, Project consent, Wish fulfillment, empty Conclude and draft replacement use native application and replay.",
);
