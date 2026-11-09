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
  "wish-new",
  "relationship",
  "occupancy",
  "empty-conclude",
  "draft-appointment",
] as const) {
  const host = await packagedSceneServer({
    configure(world, now) {
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
      if (scenario === "wish") {
        world.villagers[0].wishes = [
          fixtureWish(
            { wish: "Share my leek-soup recipe in conversation.", reason: "Enjoys sharing recipes." },
            "recipe",
            now,
          ),
        ];
        world.villagers[0].wishes[0].attention = { state: "foreground", reason: "Ready to share the recipe." };
      }
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
          : "Hello.";
    const common = { input: message ? [{ kind: "speech", text: message }] : [] };
    const content =
      scenario === "npc"
        ? {
            ...common,
            segments: [
              { kind: "narration", text: "A courier enters and introduces herself as Nell." },
              { kind: "dialogue", speakerId: "new:nell", text: "I enjoy collecting pressed leaves." },
            ],
            events: [
              {
                type: "npc",
                actorId: "new:nell",
                at: [0],
                value: { name: "Nell", label: "Courier", characterization: "A cheerful courier who collects leaves." },
              },
              {
                type: "memory",
                at: [1],
                value: {
                  kind: "information",
                  text: "Nell said she enjoys collecting pressed leaves.",
                  subjects: ["new:nell", "player"],
                  knowers: ["new:nell", "player"],
                  basis: "report",
                },
              },
            ],
          }
        : scenario === "occupancy"
          ? {
              ...common,
              segments: [{ kind: "dialogue", speakerId: "mara", text: "I'll see." }],
              events: [
                { type: "move-request", targetId: "exterior", at: ["input:0"], value: { actors: ["mara", "bryn"] } },
              ],
            }
          : scenario === "relationship"
            ? {
                ...common,
                segments: [
                  { kind: "dialogue", speakerId: "mara", text: "Thank you for hearing me. I feel more at ease." },
                ],
                events: [
                  { type: "presentation", actorId: "mara", at: 0, value: { look: { target: "player" } } },
                  {
                    type: "relationship",
                    actorId: "mara",
                    targetId: "player",
                    at: [0],
                    value: { stance: "More at ease" },
                  },
                ],
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
                  events: ["approval", "builder"].map((value) => ({
                    type: "project",
                    targetId: "project:common",
                    at: [0],
                    value,
                  })),
                }
              : scenario === "wish" || scenario === "wish-new"
                ? {
                    ...common,
                    segments: [
                      {
                        kind: "dialogue",
                        speakerId: "mara",
                        text: "I've wanted to share my recipe with you. My leek soup uses leeks, potatoes and broth, simmered until tender.",
                      },
                    ],
                    events: [
                      ...(scenario === "wish-new"
                        ? [
                            {
                              type: "wish",
                              actorId: "mara",
                              targetId: "new:recipe",
                              at: [0],
                              value: {
                                intent: "create",
                                desire: {
                                  wish: "Share my leek-soup recipe in conversation.",
                                  reason: "Enjoys sharing recipes.",
                                },
                              },
                              reason: "The exchange expresses her desire and its actual outcome.",
                            },
                          ]
                        : []),
                      {
                        type: "wish",
                        actorId: "mara",
                        targetId: scenario === "wish-new" ? "new:recipe" : "recipe",
                        at: [0],
                        value: { intent: "fulfilled" },
                        reason: "Shared her recipe in conversation.",
                      },
                    ],
                  }
                : scenario === "draft-appointment" && calls === 1
                  ? {
                      ...common,
                      segments: [{ kind: "dialogue", speakerId: "mara", text: "Meet me today at 19:30." }],
                      events: [
                        {
                          type: "appointment",
                          value: {
                            source: "draft",
                            quote: "Meet me today at 19:30.",
                            when: { date: "2026-11-05" },
                            minute: 1170,
                          },
                        },
                      ],
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
    if (scenario === "wish" || scenario === "wish-new") assert.equal(world.villagers[0].wishes[0].status, "fulfilled");
    if (scenario === "draft-appointment")
      assert(
        !host.scene().lines.some((line) => line.content.includes("19:30")),
        "Unsupported purchased draft is replaced before display",
      );
    const replay = await host.app.inject({ method: "POST", url, payload: requestPayload });
    assert.equal(replay.statusCode, 200, replay.body);
    assert.equal(calls, scenario === "draft-appointment" ? 2 : 1, "Recovery reuses purchased responses");
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
    assert(prompt.includes('type:"circumstance"'), "The GM receives the compact admitted circumstance contract");
    assert.doesNotMatch(prompt, /Do not emit effect metadata|System independently checks your unchanged prose/);
    return {
      finishReason: "stop",
      content: JSON.stringify({
        input: [{ kind: "speech", text: "Hello." }],
        segments: [{ kind: "narration", text: "A gust rattles the wooden sign." }],
        events: [
          {
            type: "circumstance",
            at: [0],
            value: {
              severity: "gentle",
              occurrence: "A gust rattles the wooden sign.",
              situation: {
                title: "Rattling sign",
                summary: "The sign rattles in the breeze.",
                status: "active",
              },
              conditions: [
                {
                  observation: "The wooden sign rattles in the breeze.",
                  restriction: "none",
                  remedy: "",
                  durationMinutes: 10,
                  clear: false,
                },
              ],
            },
          },
        ],
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
console.log(
  "GM NPC identity/Memory, Project consent, Wish fulfillment, empty Conclude and draft replacement use native application and replay.",
);
