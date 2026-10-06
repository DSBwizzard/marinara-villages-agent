import assert from "node:assert/strict";

import { configureVillagesRuntime } from "../packages/villages/src/engine/packages/server/src/services/villages/application-runtime.js";
import { defaultVillageState } from "../packages/villages/src/engine/packages/server/src/services/villages/village-store.js";
import {
  interpretRoomReply,
  roomInterpretationChecks,
} from "../packages/villages/src/engine/packages/server/src/services/villages/room-interpretation.js";
import { selectRoomEventChecks } from "../packages/villages/src/engine/packages/server/src/services/villages/room-events.js";
import { systemInterpretations } from "../packages/villages/src/engine/packages/server/src/services/villages/interpretation.js";

async function main() {
  const records = new Map<string, any>();
  let calls = 0;
  const release = configureVillagesRuntime({
    persistence: {
      documents: {
        async getById(_p: string, id: string) {
          return records.get(id) ?? null;
        },
        async create(value: any) {
          const row = { ...value, revision: 1 };
          records.set(value.id, row);
          return row;
        },
        async update(value: any) {
          const row = { ...value, revision: (records.get(value.id)?.revision ?? 0) + 1 };
          records.set(value.id, row);
          return row;
        },
      },
    },
    languageModels: {
      async resolveForRequest() {
        return {
          model: "mock",
          connectionId: "mock",
          maxOutputTokens: 5000,
          fitContext(messages: any, options: any) {
            return { messages, ...options };
          },
          async chatComplete(messages: any, options: any) {
            calls++;
            assert.ok(options.maxTokens <= 1024);
            const payload = JSON.parse(messages[1].content);
            assert.ok(messages[1].content.length <= 6000);
            return {
              content: JSON.stringify({
                results: payload.checks.map((check: any) => ({
                  id: check.id,
                  outcome: "none",
                  evidenceIds: [],
                  reason: "No permission",
                })),
              }),
            };
          },
        };
      },
    },
  } as any);
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response("[]");
  try {
    const state = defaultVillageState();
    state.villagers = ["a", "b", "c"].map((id) => ({
      characterId: id,
      cardSnapshot: { name: id.toUpperCase() },
    })) as any;
    state.venues = state.villagers.map((resident) => ({
      id: `home-${resident.characterId}`,
      name: `Home ${resident.characterId}`,
      residentIds: [resident.characterId],
      occupancy: { playerHome: false },
      zones: [
        { id: "exterior", name: "Exterior", kind: "exterior", venueClass: "residence" },
        { id: "hall", name: "Hall", kind: "shared-residence", venueClass: "residence" },
        {
          id: `private-${resident.characterId}`,
          name: "Hidden interior",
          kind: "private-residence",
          ownerId: resident.characterId,
          venueClass: "residence",
        },
      ],
    })) as any;
    const scene: any = {
      id: "room-events",
      placeId: "mall",
      zoneId: "exterior",
      activeIds: ["a", "b", "c"],
      lines: [],
      submissions: [],
      participants: state.villagers.map((r) => ({ characterId: r.characterId, name: r.cardSnapshot.name })),
    };
    const draft = (content: string, kind = "dialogue") => [
      { speakerId: kind === "narration" ? "" : "a", content, kind, heardBy: scene.activeIds },
    ];
    for (const routing of [
      undefined,
      [],
      {},
      [{ actorId: "a", domain: "room", relevance: "potential", targetIds: [] }],
    ]) {
      assert.equal(
        await interpretRoomReply(
          scene,
          state,
          "Let's plan the mall's water supply.",
          draft("We can survey the utilities tomorrow."),
          `ordinary-${calls}`,
          scene.activeIds,
          routing,
        ),
        null,
      );
    }
    assert.equal(calls, 0, "absent/malformed routing cannot buy a room survey");
    assert.equal(
      await interpretRoomReply(
        scene,
        state,
        "What should we survey?",
        draft("The entry points need surveying tomorrow."),
        "entry-points",
      ),
      null,
      "mentioning entry points is physical planning, not permission",
    );
    const select = (text: string, message = "", events?: unknown, other = scene, kind = "dialogue") =>
      selectRoomEventChecks(
        roomInterpretationChecks(other, state, message, draft(text, kind) as any, "event"),
        other,
        undefined,
        events,
      );
    assert.equal(select("Come into my room.").selected.length, 1, "spontaneous specific invitation");
    assert.equal(
      select("Come into my room tomorrow.").selected.length,
      1,
      "future invitations retain semantic judgment",
    );
    assert.equal(
      select("Only joking: come into my room.").selected.length,
      1,
      "admission cannot grant quoted/joking permission",
    );
    assert.equal(select("Sure.", "May I enter your bedroom?").selected.length, 1);
    assert.equal(select("No.", "May I enter your bedroom?").selected.length, 1);
    assert.equal(select("Sure.", "May I enter?").selected.length, 0, "unknown room needs clarification");
    assert.ok(select("Sure.", "May I enter?").uncertain.length);
    const local = { ...scene, placeId: "home-a", zoneId: "private-a" };
    assert.equal(select("Leave.", "", undefined, local).selected.length, 1);
    const explicit = [{ actorId: "a", venueId: "home-a", zoneId: "private-a", kind: "invite-now", evidence: [0] }];
    assert.equal(select("A beckons toward the doorway.", "", explicit, scene, "narration").selected.length, 1);
    assert.equal(
      select("B beckons toward the doorway.", "", explicit, scene, "narration").selected.length,
      0,
      "gestures are bound to their named actor",
    );
    assert.equal(select("The door is open.", "", explicit, scene, "narration").selected.length, 0);
    assert.equal(
      select("Come into my room.", "", [{ ...explicit[0], actorId: "b" }]).selected[0]?.facts &&
        (select("Come into my room.", "", [{ ...explicit[0], actorId: "b" }]).selected[0].facts as any).actorId,
      "a",
      "wrong controller nomination cannot override actual speech",
    );
    await interpretRoomReply(scene, state, "May I enter your bedroom?", draft("Sure."), "permission", scene.activeIds);
    assert.equal(calls, 1, "only one bounded targeted request");
    const checks = roomInterpretationChecks(scene, state, "", draft("Come into my room.") as any, "budget");
    await systemInterpretations(Array.from({ length: 5 }, (_, i) => ({ ...checks[0], id: String(i) })));
    await systemInterpretations([{ ...checks[0], facts: { huge: "x".repeat(7000) } }]);
    assert.equal(calls, 1, "over-budget room input cannot split into paid surveys");
    console.log(
      "Room events: zero routine requests; invitations, answers, named gestures, refusals and dismissal retained; budgets enforced",
    );
  } finally {
    release();
    globalThis.fetch = originalFetch;
  }
}
void main();
