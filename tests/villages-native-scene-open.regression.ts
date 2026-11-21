// Test cases: native-scene-open/prepared, native-scene-open/unprepared, native-scene-open/returning-npc, native-scene-open/place-event, native-scene-open/local-event, native-scene-open/quiet-roll
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { fixture as projectFixture } from "./fixtures/villages-projects.fixture.js";
import { agendaFixture } from "./helpers/agenda.fixture.js";
import { sceneHistoryFixture } from "./helpers/scene-history-store.fixture.js";
import { configureVillageClock } from "../packages/villages/src/server/adapters/time/clock-gate.js";
import { createSceneCommands } from "../packages/villages/src/server/features/scenes/command-service.js";
import { publicSceneAuthority } from "../packages/villages/src/server/domain/rules/scene-public.js";

const at = "2026-11-10T12:00:00.000Z";
for (const scenario of ["prepared", "unprepared", "returning-npc", "place-event", "local-event", "quiet-roll"] as const)
  await runCase("native-scene-open/" + scenario, async () => {
    const state = projectFixture().state(),
      storage = sceneHistoryFixture();
    const releaseClock = configureVillageClock({ now: () => new Date(at), observe: async () => null });
    try {
      state.timeZone = "UTC";
      const event = scenario === "place-event" ? "place" : scenario === "local-event" ? "local" : "quiet";
      if (scenario.endsWith("-event") || scenario === "quiet-roll") state.spontaneousEvents = true;
      if (scenario !== "unprepared")
        state.startingHistory.reviewed = Object.fromEntries(
          state.villagers.map((row) => [row.characterId, row.incarnation]),
        );
      state.villagers[0].agenda = agendaFixture({
        generatedAt: at,
        day: [],
        activeDay: {
          dateKey: "2026-11-10",
          weekday: "Tuesday",
          scheduleInformed: false,
          blocks: [{ startMinute: 0, endMinute: 1440, venueId: "cafe", zoneId: "common", activity: "Talking" }],
        },
      });
      if (scenario === "returning-npc") {
        state.villagers = [];
        state.worldPlaces.npcs["npc:welder"] = {
          id: "npc:welder",
          revision: 1,
          name: "Rasha Dunmore",
          label: "Night-shift welder",
          characterization: "A night-shift welder.",
          facts: [],
          associations: [{ placeId: "cafe", role: "Encountered here" }],
          availability: "",
          disabled: false,
          source: "fixture",
          updatedAt: at,
        };
      }
      let selected = "",
        rolls = 0,
        modelCalls = 0;
      const service = createSceneCommands({
        rollVisitEvent: () => {
          rolls++;
          return event;
        },
        activationScope: () => undefined,
        sceneWork: () => ({
          serializeNavigation: (work: () => unknown) => work(),
          markMovement() {},
          clearMovement() {},
        }),
        readActive: async () => ({ sessionId: selected, placeId: selected ? "cafe" : "" }),
        activeVenueSession: async () => null,
        hasVenueOperation: () => false,
        rollActiveAgendas: async () => {},
        readVillageState: async () => state,
        mutateVillageState: async (update: (next: typeof state) => void) => {
          update(state);
          return state;
        },
        mutateDocument: storage.mutateDocument,
        selectActiveScene: async (id: string) => {
          selected = id;
        },
        refreshZoneParticipants: async (scene: unknown) => scene,
        readSession: storage.repository.readSession,
        changeSession: storage.repository.changeSession,
        requireLiveVenueSession: storage.repository.readSession,
        assertVenueOwnership() {},
        outsideVenueOperation() {},
        venueOperationId: () => "move-to-common",
        coordinateVenue: async (...args: any[]) => args[6](),
        generate: async () => {
          modelCalls++;
          throw Error("Scene admission must not dispatch a provider");
        },
      } as any);
      if (scenario === "unprepared") {
        await assert.rejects(service.enterVenue("cafe", "common"), /Starting relationship history/);
        assert.equal(selected, "");
        assert.equal([...storage.rows.values()].filter((row) => row.kind === "venue-visit").length, 0);
      } else {
        const fromEntrance = scenario === "local-event" || scenario === "place-event";
        const scene = await service.enterVenue("cafe", fromEntrance ? "exterior" : "common");
        assert.equal(scene.version, 5);
        assert.equal(scene.id, selected);
        assert.equal(scene.status, scenario === "returning-npc" || event === "place" ? "opening" : "active");
        const cold = await storage.repository.readSession(scene.id);
        assert.equal(cold.villageSeed, state.seed);
        assert.equal(cold.zoneId, fromEntrance ? "exterior" : "common");
        if (scenario === "returning-npc") {
          assert.deepEqual(cold.activeIds, []);
          assert.deepEqual(cold.participants, [], "association permits an opening but supplies no attendance");
        } else if (!fromEntrance) {
          assert(cold.participants.some((row) => row.characterId === "a"));
        }
        if (event === "place") {
          assert.deepEqual(cold.activeIds, []);
          assert.equal(publicSceneAuthority(cold).visitEventOpening, true);
        }
        if (event === "local") {
          assert.equal(cold.visitEvent, "waiting");
          assert.equal(publicSceneAuthority(cold).visitEventOpening, undefined);
          const moved = await service.moveVenueZone(scene.id, "common", scene.sceneRevision);
          assert.equal(moved.status, "opening");
          assert.equal(publicSceneAuthority(moved).visitEventOpening, true);
        }
        if (state.spontaneousEvents) {
          assert.equal(rolls, 1);
          const second = await service.enterVenue("cafe", "common");
          assert.equal(second.status, "active");
          assert.equal(second.visitEvent, undefined);
          assert.equal(rolls, 1, "returning during the cooldown must not roll again, even after a miss");
        } else assert.equal(rolls, 0);
      }
      assert.equal(modelCalls, 0);
    } finally {
      releaseClock();
      storage.release();
    }
  });
