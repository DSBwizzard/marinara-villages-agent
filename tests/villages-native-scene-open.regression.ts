// Test cases: native-scene-open/prepared, native-scene-open/unprepared
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { fixture as projectFixture } from "./fixtures/villages-projects.fixture.js";
import { agendaFixture } from "./helpers/agenda.fixture.js";
import { sceneHistoryFixture } from "./helpers/scene-history-store.fixture.js";
import { configureVillageClock } from "../packages/villages/src/server/adapters/time/clock-gate.js";
import { createSceneCommands } from "../packages/villages/src/server/features/scenes/command-service.js";

const at = "2026-11-10T12:00:00.000Z";
for (const prepared of [true, false])
  await runCase("native-scene-open/" + (prepared ? "prepared" : "unprepared"), async () => {
    const state = projectFixture().state(),
      storage = sceneHistoryFixture();
    const releaseClock = configureVillageClock({ now: () => new Date(at), observe: async () => null });
    try {
      state.timeZone = "UTC";
      if (prepared)
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
      let selected = "",
        modelCalls = 0;
      const service = createSceneCommands({
        activationScope: () => undefined,
        sceneWork: () => ({ serializeNavigation: (work: () => unknown) => work() }),
        readActive: async () => ({ sessionId: "", placeId: "" }),
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
        generate: async () => {
          modelCalls++;
          throw Error("Scene admission must not dispatch a provider");
        },
      } as any);
      if (!prepared) {
        await assert.rejects(service.enterVenue("cafe", "common"), /Starting relationship history/);
        assert.equal(selected, "");
        assert.equal([...storage.rows.values()].filter((row) => row.kind === "venue-visit").length, 0);
      } else {
        const scene = await service.enterVenue("cafe", "common");
        assert.equal(scene.version, 5);
        assert.equal(scene.id, selected);
        assert(scene.activeIds.includes("a"), "a prepared occupied Villager needs no deleted relationship sidecar");
        const cold = await storage.repository.readSession(scene.id);
        assert.equal(cold.villageSeed, state.seed);
        assert.equal(cold.zoneId, "common");
        assert(cold.participants.some((row) => row.characterId === "a"));
      }
      assert.equal(modelCalls, 0);
    } finally {
      releaseClock();
      storage.release();
    }
  });
