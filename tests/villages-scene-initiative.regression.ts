// Test cases: scene-initiative/quiet, scene-initiative/disagreement, scene-initiative/commitment-before, scene-initiative/commitment-after, scene-initiative/development, scene-initiative/player-choice
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { runCase } from "../scripts/test-cases.mjs";
import { readVillagerCard } from "../packages/villages/src/server/adapters/engine/catalog.js";
import { configureVillageClock } from "../packages/villages/src/server/adapters/time/clock-gate.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import { ORDINARY_SCENE_DIRECTION } from "../packages/villages/src/server/domain/rules/narration-contract.js";
import { ensureNarrative } from "../packages/villages/src/server/domain/rules/narrative-development.js";
import { snapshotFromCard } from "../packages/villages/src/server/domain/rules/resident-card-snapshot.js";
import { captureSceneAttendance } from "../packages/villages/src/server/domain/rules/scene-attendance.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { prepareScenePrompt } from "./fixtures/villages-scene-writing.fixture.js";
import { agendaFixture } from "./helpers/agenda.fixture.js";
import { retainAuthoredNote } from "./helpers/continuity.fixture.js";
import { venueFixture } from "./helpers/venues.fixture.js";

const cases = [
  {
    id: "quiet",
    input: "*I set my cup on the table.*",
    review: "A quiet action or a short reply is enough. Look for space to sit together.",
  },
  {
    id: "disagreement",
    input: "*I listen while they talk about the ferry landing.*",
    review:
      "Mara and Ivo advance their own positions. Let the disagreement stand without asking the player to settle it.",
  },
  {
    id: "commitment-before",
    input: '"Thanks for helping with the packets."',
    review:
      "Ivo can acknowledge the player and begin his own departure toward his obligation. A completed crossing needs valid evidence.",
  },
  {
    id: "commitment-after",
    input: '"Thanks for helping with the packets."',
    review: "Ivo is away after the schedule change. The exchange stays with Mara and preserves Ivo’s privacy.",
  },
  {
    id: "development",
    input: "*I move my cup under the awning.*",
    review:
      "A local development can emerge from the awning and weather. A quiet reply is valid. A lasting change needs witnessed evidence and the supplied grant.",
  },
  {
    id: "player-choice",
    input: "*I pause beside the garden gate.*",
    review:
      "If Mara invites the player to the landing, the invitation can end the reply. The pause leaves her offer open.",
  },
];
const controlRevision = "064255fbcb5281a9d65f373248a7044121cd6d3e";
const controlEnding =
  "Continue from the latest beat. Avoid echoing dialogue or recapping unchanged details unless the player asks or the current beat depends on them. When a resident chooses to act, let them follow through within their abilities and the Scene's rules. End when the player has a natural chance to act or speak. A line of dialogue can end the turn. Use a closing description only when it gives the player something new to respond to.";
const controlDirection = ORDINARY_SCENE_DIRECTION.replace(/Continue from the latest beat\..*$/u, controlEnding);
const before = "2026-11-09T09:57:00.000Z";
const after = "2026-11-09T10:05:00.000Z";
const commitment = "I promised to open the boathouse at ten. I should leave the garden just before ten.";
const wish = "I want to reopen the ferry landing.";
const pairs = [];

for (const { id, input, review } of cases) {
  await runCase("scene-initiative/" + id, async () => {
    const deadline = id.startsWith("commitment-"),
      development = id === "development",
      at = id === "commitment-after" ? after : before;
    const cards = [
      readVillagerCard({
        id: "mara",
        comment: "",
        data: { name: "Mara", description: "Mara sorts damp seed packets into dry piles. She speaks plainly." },
      }),
      ...(deadline || id === "disagreement"
        ? [
            readVillagerCard({
              id: "ivo",
              comment: "",
              data: {
                name: "Ivo",
                description: "Ivo helps sort the seed packets. He has seen the loose lower steps at the ferry landing.",
              },
            }),
          ]
        : []),
    ];
    const description = "A canvas awning shelters a small seed table and a wooden bench from the rain.";
    const garden = venueFixture({
      id: "garden",
      name: "Garden",
      description,
      zones: [{ ...defaultVenueSpace("community"), id: "exterior", name: "Entrance", kind: "exterior", description }],
    });
    const world = defaultVillageState();
    Object.assign(world, {
      seed: "scene-initiative:" + (deadline ? "commitment" : id),
      setupAt: before,
      foundedAt: before,
      timeZone: "UTC",
      backgroundPace: development ? "balanced" : "off",
    });
    world.venues = [garden];
    if (deadline)
      world.venues.push(
        venueFixture({
          spaces: [{ id: "workplace", description: "A place in the community.", image: null }],
          id: "boathouse",
          name: "Boathouse",
        }),
      );
    world.villagers = cards.map((card) => {
      const hasCommitment = deadline && card.id === "ivo";
      return {
        characterId: card.id,
        incarnation: card.id + ":one",
        letterFontId: "caveat",
        addedAt: before,
        cardSnapshot: snapshotFromCard(card, 1),
        agenda: agendaFixture({
          day: [
            {
              startMinute: 0,
              endMinute: hasCommitment ? 600 : 1440,
              venueId: garden.id,
              zoneId: "exterior",
              activity: "Sorting seed packets",
            },
            ...(hasCommitment
              ? [{ startMinute: 600, endMinute: 1440, venueId: "boathouse", activity: "Opening the boathouse" }]
              : []),
          ],
        }),
      };
    });
    if (deadline)
      retainAuthoredNote(world, "boathouse-commitment", commitment, ["ivo"], before, {
        class: "commitment",
        owner: continuityActor(world, "ivo")!,
        current: true,
      });
    if (id === "disagreement" || id === "player-choice")
      retainAuthoredNote(
        world,
        "landing-wish",
        id === "disagreement" ? wish : "I would like to invite the player to walk to the landing with me.",
        ["mara"],
        before,
        { class: "desire", owner: continuityActor(world, "mara")!, current: true },
      );
    if (development) ensureNarrative(world, before);

    const sceneAttendance = captureSceneAttendance(world, garden.id, new Date(at));
    const activeIds = sceneAttendance.occupants.map(({ characterId }) => characterId);
    assert.deepEqual(activeIds.toSorted(), id === "commitment-after" ? ["mara"] : cards.map(({ id }) => id).sort());
    const releaseClock = configureVillageClock({
      now: () => new Date(at),
      observe: async () => assert.fail("Prompt matching must not observe a live clock."),
    });
    try {
      const { fitted, readset, prompt } = await prepareScenePrompt(world, cards[0]!, "chat", input, {
        startedAt: before,
        placeId: garden.id,
        participants: sceneAttendance.occupants.map(({ characterId, name, doing }) => ({ characterId, name, doing })),
        activeIds,
        sceneAttendance,
      });
      assert.equal(readset.capturedAt, at);
      assert.deepEqual(readset.source.scene.activeIds, activeIds);
      assert.equal(readset.circumstance?.targets[0]?.zoneId, development ? "exterior" : undefined);
      assert.equal(
        prompt.includes(commitment),
        id === "commitment-before",
        "only the admitted resident gets his commitment",
      );
      assert.equal(prompt.includes(wish), id === "disagreement");
      assert.notEqual(
        controlDirection,
        ORDINARY_SCENE_DIRECTION,
        "the matched prompts must vary their ending guidance",
      );
      const candidate = fitted.messages;
      assert.equal(candidate.filter(({ content }) => content.includes(ORDINARY_SCENE_DIRECTION)).length, 1);
      const control = candidate.map((message) => ({
        ...message,
        content: message.content.replace(ORDINARY_SCENE_DIRECTION, controlDirection),
      }));
      pairs.push({ id, input, review, at, maxOutputTokens: fitted.maxTokens, control, candidate });
    } finally {
      releaseClock();
    }
  });
}

if (process.argv[3] === "--write-pairs") {
  assert.equal(pairs.length, cases.length, "export all six matches together");
  const directory = ".build-tmp/scene-initiative";
  await mkdir(directory, { recursive: true });
  await writeFile(directory + "/matched-prompts.json", JSON.stringify({ controlRevision, pairs }, null, 2) + "\n");
}
