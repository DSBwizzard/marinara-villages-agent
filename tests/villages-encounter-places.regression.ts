import { fixtureRelationshipIdentity } from "./helpers/village-storage.fixture.js";
// Test cases: encounter-places/evidence, encounter-places/settlement, encounter-places/recovery, encounter-places/conflict, encounter-places/catchup
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { defaultRelationshipState } from "../packages/villages/src/server/domain/rules/relationship-rules.js";
import { emptyRelationshipReview } from "../packages/villages/src/server/domain/rules/relationship-review.js";
import { unwrittenVillageAgenda } from "../packages/villages/src/server/domain/rules/agenda-plan.js";
import { sceneMemoryContext } from "../packages/villages/src/server/domain/rules/scene-memories.js";
import { readEncounter, encounterPhysicalId } from "../packages/villages/src/server/domain/rules/social-encounter.js";
import { projectMemories } from "../packages/villages/src/server/domain/rules/memory-views.js";
import { villageSettings } from "../packages/villages/src/server/domain/rules/world-snapshot.js";
import { createRelationshipSocial } from "../packages/villages/src/server/features/residents/relationship-social-service.js";
import { createLiveMemory } from "../packages/villages/src/server/features/residents/live-memory-service.js";
import { createRepairGate } from "../packages/villages/src/server/adapters/storage/repair-gate.js";
import { createReturnCatchupSettlement } from "../packages/villages/src/server/features/background/return-catchup-settlement.js";
import { captureReturnContext } from "../packages/villages/src/server/domain/rules/return-catchup-capture.js";
import { planRoutineDays } from "../packages/villages/src/server/domain/rules/resident-agenda.js";
import { socialContextState } from "../packages/villages/src/server/domain/rules/social-context.js";
import { ZonedDate } from "../packages/villages/src/shared/helpers/zoned-date.js";
import { venue } from "./fixtures/villages-projects.fixture.js";

const at = "2026-10-28T12:00:00.000Z";
function fixture() {
  const place = venue();
  const room = place.zones!.find((z) => z.id === "common")!;
  room.kind = "restricted";
  room.description = "White walls. Two windows. An oak table.";
  room.access!.mode = "permission-required";
  room.access!.managerIds = ["a"];
  room.access!.memberIds = ["b"];
  room.seen = true;
  let state = coerceVillageState({
    ...defaultVillageState(),
    seed: "encounter-place",
    setupAt: at,
    foundedAt: at,
    timeZone: "UTC",
    venues: [place],
    villagers: ["a", "b"].map((id) => ({
      characterId: id,
      addedAt: at,
      cardSnapshot: { id, name: id, revision: 1, sourceStatus: "available", capturedAt: at },
    })),
  });
  for (const person of state.villagers) {
    person.agenda = unwrittenVillageAgenda(state.venues, person.characterId, new Date(at));
    const block = {
      startMinute: 0,
      endMinute: 1440,
      activity: "Talking",
      venueId: "cafe",
      zoneId: "common",
      status: "online",
      flexible: true,
    };
    person.agenda.day = [block] as any;
    person.agenda.activeDay = { dateKey: "2026-10-28", weekday: "Wednesday", blocks: [block] } as any;
    person.agenda.week!.Wednesday = [block] as any;
  }
  let social = defaultRelationshipState(state.seed);
  social.reviewedActorIds = ["a", "b"];
  const entry: any = {
    id: "occasion:social",
    seed: state.seed,
    at,
    candidates: [],
    opportunity: {
      id: "occasion",
      kind: "encounter",
      actorIds: ["a", "b"],
      venueId: "cafe",
      zoneId: "common",
      startsAt: at,
      endsAt: at,
      facts: [],
    },
    admitted: structuredClone({
      villagers: state.villagers,
      venues: state.venues,
      residences: state.residences,
      projects: state.projects,
      timeZone: state.timeZone,
    }),
    relationshipSnapshot: structuredClone(social),
    proposal: {
      encounter: {
        opportunityId: "occasion",
        semanticVersion: 2,
        semanticSourceHash: "review",
        physicalConsistent: true,
        lines: [
          { speakerId: "a", text: "Please install the shelves on this wall." },
          { speakerId: "b", text: "Yes, I have the brackets here." },
          { kind: "narration", text: "B installs the agreed shelves using the supplied brackets." },
        ],
        placeUpdate: {
          happened: true,
          segment: 2,
          actorIds: ["b"],
          consent: [{ actorId: "a", segment: 0 }],
          narration: "B installs the agreed shelves.",
          expectedRevision: 0,
          append: "Shelves are installed on the wall.",
        },
        relationshipReview: emptyRelationshipReview(),
        wishChanges: [],
        memoryChanges: [],
      },
    },
  };
  const memory = sceneMemoryContext(state, ["a", "b"], "shelves");
  entry.proposal.encounter.memoryContexts = { [memory.saved.protection.fingerprint]: memory.saved };
  entry.proposal.encounter.memoryChanges = [
    {
      action: "create",
      kind: "experience",
      text: "B installed the agreed shelves.",
      subjects: ["b"],
      domainRef: { kind: "physical", id: "cafe" },
      effectId: encounterPhysicalId(entry.id),
      learners: {
        a: { basis: "validated-event", support: [{ lineId: 2, excerpt: entry.proposal.encounter.lines[2].text }] },
      },
      screening: { disposition: "clear", protectedRoots: [], fingerprint: memory.saved.protection.fingerprint },
    },
  ];
  state.socialOutbox = [structuredClone(entry)];
  let memoryFailure = false,
    memoryCalls = 0,
    socialCalls = 0;
  const snapshot = async () => ({ ...structuredClone(state), relationshipContext: structuredClone(social) });
  const mutate = async (update: any) => {
    const next = await snapshot();
    await update(next);
    delete next.relationshipContext;
    state = next;
    return snapshot();
  };
  const native = createLiveMemory({ now: () => new Date(), mutateVillageState: mutate } as any);
  const api = createRelationshipSocial({
    readVillageSnapshot: snapshot,
    mutateVillageState: mutate,
    mutateRelationships: async (_seed: string, update: any) => {
      socialCalls++;
      assert.ok(
        state.exchangeReceipts[encounterPhysicalId(entry.id)]?.physicalOutcome,
        "physical proof precedes social effects",
      );
      const next = structuredClone(social);
      await update(next);
      social = next;
      return structuredClone(social);
    },
    processLiveMemories: async (scene: any, id: string) => {
      memoryCalls++;
      assert.ok(
        state.exchangeReceipts[encounterPhysicalId(entry.id)]?.physicalOutcome,
        "physical proof precedes dependent Memories",
      );
      if (memoryFailure) throw Error("Synthetic Memory failure");
      return native.processLiveMemories(scene, id);
    },
  } as any);
  return {
    api,
    snapshot,
    entry,
    state: () => state,
    zone: () => state.venues[0].zones!.find((z) => z.id === "common")!,
    raw: () => state.socialOutbox![0].proposal.encounter as any,
    memoryFailure: (value: boolean) => {
      memoryFailure = value;
    },
    counts: () => ({ memoryCalls, socialCalls }),
  };
}
await runCase("encounter-places/evidence", async () => {
  const f = fixture();
  assert.ok(readEncounter(f.raw(), f.state().socialOutbox![0], await f.snapshot()));
  const source = structuredClone(f.raw());
  source.placeUpdate.consent = [];
  assert.throws(() => readEncounter(source, f.state().socialOutbox![0], f.state()), /consent/);
  source.placeUpdate.consent = [{ actorId: "a", segment: 0 }];
  source.placeUpdate.actorIds = ["player"];
  assert.throws(() => readEncounter(source, f.state().socialOutbox![0], f.state()), /actors/);
  source.placeUpdate.actorIds = ["b"];
  source.physicalConsistent = false;
  assert.throws(() => readEncounter(source, f.state().socialOutbox![0], f.state()), /validation/);
});
await runCase("encounter-places/settlement", async () => {
  const f = fixture();
  await f.api.processSocialOutbox(await f.snapshot());
  assert.equal(f.state().socialOutbox!.length, 0);
  assert.equal(f.zone().state.revision, 1);
  assert.match(f.zone().description, /White walls\. Two windows\. An oak table\./);
  assert.match(f.zone().description, /Shelves are installed/);
  assert.equal(
    villageSettings(await f.snapshot(), { name: "Player", missing: false } as any).venues[0].zones!.find(
      (z) => z.id === "common",
    )!.description,
    f.zone().description,
  );
  assert.equal(f.state().venueEvents.length, 0, "hidden deed narration never becomes a public room feed");
  assert.ok(
    projectMemories(f.state().memories, ["a"]).some((row) => row.text === "B installed the agreed shelves."),
    JSON.stringify(f.state().memoryReceipts),
  );
  assert.equal(projectMemories(f.state().memories, ["player"]).length, 0);
  const receipt = f.state().exchangeReceipts[encounterPhysicalId(f.entry.id)];
  assert.equal(receipt.status, "applied");
  assert.equal(receipt.physicalOutcome, undefined, "settled outbox releases full physical replay payload");
  assert.match(receipt.sourceHash!, /^[a-f0-9]{64}$/);
});
await runCase("encounter-places/recovery", async () => {
  const f = fixture();
  f.memoryFailure(true);
  await f.api.processSocialOutbox(await f.snapshot());
  assert.equal(f.zone().state.revision, 1);
  assert.ok(f.state().exchangeReceipts[encounterPhysicalId(f.entry.id)].physicalOutcome);
  assert.equal(f.state().socialOutbox!.length, 1);
  await assert.rejects(
    () => f.api.recover(f.entry.id, { requestId: "skip-partial", reinterpret: false, skip: true }),
    /uncommitted/,
  );
  const original = structuredClone(f.raw().placeUpdate);
  f.raw().placeUpdate.append = "A different physical result.";
  await f.api.recover(f.entry.id, { requestId: "changed-meaning", reinterpret: false });
  assert.equal(f.zone().state.revision, 1);
  assert.match(f.state().socialOutbox![0].error!, /meaning changed/);
  f.raw().placeUpdate = original;
  f.memoryFailure(false);
  f.zone().description += "\nLater unrelated paintwork.";
  f.zone().state.revision++;
  f.state().venues[0].access!.bans.push({
    id: "ban",
    zoneId: "common",
    visitorId: "b",
    issuerId: "a",
    active: true,
    issuedAt: at,
    sourceLineIds: [],
  });
  await f.api.recover(f.entry.id, { requestId: "saved-proof", reinterpret: false });
  assert.equal(f.state().socialOutbox!.length, 0);
  assert.equal(f.zone().state.revision, 2, "recovery never replays a completed physical action");
  assert.match(f.zone().description, /Later unrelated paintwork/);
});
await runCase("encounter-places/conflict", async () => {
  const f = fixture();
  f.zone().description += "\nLater paintwork.";
  f.zone().state.revision++;
  await f.api.processSocialOutbox(await f.snapshot());
  assert.equal(f.zone().state.revision, 1);
  assert.doesNotMatch(f.zone().description, /Shelves are installed/);
  assert.deepEqual(f.counts(), { memoryCalls: 0, socialCalls: 0 });
  assert.equal(f.state().exchangeReceipts[encounterPhysicalId(f.entry.id)], undefined);
  await f.api.recover(f.entry.id, { requestId: "skip-stale", reinterpret: false, skip: true });
  assert.equal(f.state().socialOutbox!.length, 0);
  assert.deepEqual(f.counts(), { memoryCalls: 0, socialCalls: 0 });
});

await runCase("encounter-places/catchup", async () => {
  const f = fixture(),
    world = await f.snapshot(),
    source = structuredClone(f.entry);
  const capture = captureReturnContext(world, new Date(at));
  const projected = structuredClone({ ...world, ...capture.world });
  planRoutineDays(projected, new ZonedDate(at, world.timeZone));
  source.catchupBatchId = "physical-return";
  source.relationshipSnapshot = socialContextState(projected.relationshipContext, source.opportunity.actorIds, "");
  source.admitted = {
    villagers: projected.villagers,
    venues: projected.venues,
    residences: projected.residences,
    projects: projected.projects,
    timeZone: projected.timeZone,
    opening: projected.opening,
  };
  world.socialOutbox = [source];
  world.returnCatchup = {
    capture,
    batch: {
      id: "physical-return",
      status: "running",
      from: at,
      until: at,
      opportunities: [source.opportunity],
      records: [
        { opportunityId: "occasion", status: "settling", outcome: { social: structuredClone(source.proposal) } },
      ],
    },
  } as any;
  const relationships = world.relationshipContext;
  delete world.relationshipContext;
  const rows = new Map<string, any>([
    [
      "physical-world",
      {
        id: "physical-world",
        packageId: "villages",
        kind: "test-world",
        name: "World",
        description: "",
        revision: 1,
        data: world,
      },
    ],
    [
      "physical-social",
      {
        id: "physical-social",
        packageId: "villages",
        kind: "test-social",
        name: "Social",
        description: "",
        revision: 1,
        data: relationships,
      },
    ],
  ]);
  const store: any = {
    getById: async (_package: string, id: string) => structuredClone(rows.get(id) ?? null),
    list: async (_package: string, kind: string) =>
      structuredClone([...rows.values()].filter((row) => row.kind === kind)),
    create: async (input: any) => {
      const row = { ...structuredClone(input), revision: 1 };
      rows.set(input.id, row);
      return structuredClone(row);
    },
    update: async (input: any) => {
      const old = rows.get(input.id);
      if (old?.revision !== input.expectedRevision) return null;
      const row = { ...old, ...structuredClone(input), revision: old.revision + 1 };
      rows.set(input.id, row);
      return structuredClone(row);
    },
    remove: async (_package: string, id: string, revision: number) => {
      if (rows.get(id)?.revision !== revision) return false;
      return rows.delete(id);
    },
  };
  const gate = createRepairGate(store);
  try {
    const snapshot = async () => ({
      ...structuredClone((await gate.documents.getById("villages", "physical-world"))!.data as any),
      relationshipContext: structuredClone((await gate.documents.getById("villages", "physical-social"))!.data),
    });
    const mutate = async (update: any) => {
      const row = (await gate.documents.getById("villages", "physical-world"))!,
        next = await snapshot();
      await update(next);
      delete next.relationshipContext;
      assert.ok(
        await gate.documents.update({
          ...row,
          packageId: "villages",
          expectedRevision: row.revision,
          data: next,
          updatedAt: new Date().toISOString(),
        }),
      );
      return snapshot();
    };
    const native = createLiveMemory({ now: () => new Date(), mutateVillageState: mutate } as any);
    let fail = true;
    const social = createRelationshipSocial({
      readVillageSnapshot: snapshot,
      mutateVillageState: mutate,
      mutateRelationships: async (_seed: string, update: any) => {
        const row = (await gate.documents.getById("villages", "physical-social"))!,
          next = structuredClone(row.data);
        await update(next);
        assert.ok(
          await gate.documents.update({
            ...row,
            packageId: "villages",
            expectedRevision: row.revision,
            data: next,
            updatedAt: new Date().toISOString(),
          }),
        );
        return next;
      },
      processLiveMemories: async (scene: any, id: string) => {
        if (fail) throw Error("Memory stage failed");
        return native.processLiveMemories(scene, id);
      },
    } as any);
    const settlement = createReturnCatchupSettlement({
      relationshipIdentity: fixtureRelationshipIdentity,
      gate,
      readSnapshot: snapshot,
      mutate,
      processSocialOutbox: social.processSocialOutbox,
    } as any);
    assert.equal(await settlement.settle("physical-return", "occasion"), "recovering");
    const held = await snapshot();
    assert.match(held.socialOutbox[0].error, /Memory stage failed/);
    assert.equal(
      held.venues[0].zones.find((z: any) => z.id === "common").state.revision,
      0,
      "failed catch-up discards staged physical changes",
    );
    assert.equal(held.exchangeReceipts[encounterPhysicalId(source.id)], undefined);
    assert.equal(
      held.relationshipContext.applied[source.id],
      undefined,
      "social effects roll back with physical effects",
    );
    assert.equal(projectMemories(held.memories, ["a"]).length, 0);
    fail = false;
    assert.equal(await settlement.settle("physical-return", "occasion", true), "settled");
    const settled = await snapshot();
    assert.equal(settled.venues[0].zones.find((z: any) => z.id === "common").state.revision, 1);
    assert.ok(settled.relationshipContext.applied[source.id]);
    assert.ok(projectMemories(settled.memories, ["a"]).some((row) => row.text === "B installed the agreed shelves."));
    assert.equal(settled.returnCatchup.batch.records[0].status, "settled");
    assert.equal(
      settled.returnCatchup.capture.world.venues[0].zones.find((z: any) => z.id === "common").state.revision,
      1,
      "the next chronological opportunity sees the accepted physical result",
    );
    assert.equal(settled.exchangeReceipts[encounterPhysicalId(source.id)].physicalOutcome, undefined);
  } finally {
    gate.dispose();
  }
});
