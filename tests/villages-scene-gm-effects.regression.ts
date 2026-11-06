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
  "wish",
  "relationship",
  "occupancy",
  "empty-conclude",
  "draft-appointment",
] as const) {
  const host = await packagedSceneServer({
    gm: true,
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
          ...structuredClone(world.villagers[0]),
          characterId,
          cardSnapshot: { ...world.villagers[0].cardSnapshot, id: characterId, name: characterId },
        }));
      if (scenario === "project" || scenario === "project-conclude") {
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
      scenario === "empty-conclude" || scenario === "project-conclude"
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
            : scenario === "project" || scenario === "project-conclude"
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
            : "Hello.",
      mode: scenario === "empty-conclude" || scenario === "project-conclude" ? "leave" : "chat",
      targetId: "",
      expectedSceneRevision: host.scene().sceneRevision,
    };
    const url =
      scenario === "empty-conclude" || scenario === "project-conclude"
        ? "/api/villages/rooms/leave"
        : "/api/villages/rooms/turn";
    const response = await host.app.inject({ method: "POST", url, payload });
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
    if (scenario === "project" || scenario === "project-conclude") {
      const project = world.projects.find((row) => row.id === "project:common")!;
      assert.equal(project.status, "planning", "Speech never starts work");
      assert(project.lifecycle!.approvals.some((row) => row.residentId === "mara"));
      assert(project.lifecycle!.candidates.some((row) => row.residentId === "mara"));
    }
    if (scenario === "wish") assert.equal(world.villagers[0].wishes[0].status, "fulfilled");
    if (scenario === "draft-appointment")
      assert(
        !host.scene().lines.some((line) => line.content.includes("19:30")),
        "Unsupported purchased draft is replaced before display",
      );
    const replay = await host.app.inject({ method: "POST", url, payload });
    assert.equal(replay.statusCode, 200, replay.body);
    assert.equal(calls, scenario === "draft-appointment" ? 2 : 1, "Recovery reuses purchased responses");
  } finally {
    await host.stop();
  }
}
mock.timers.reset();
console.log(
  "GM NPC identity/Memory, Project consent, Wish fulfillment, empty Conclude and draft replacement use native application and replay.",
);
