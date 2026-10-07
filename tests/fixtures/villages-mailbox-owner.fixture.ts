import assert from "node:assert/strict";
import { withSettingsOwners } from "./villages-settings-owner.fixture.js";
import { createActivationScope } from "../../packages/villages/src/server/adapters/engine/activation-scope.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../../packages/villages/src/server/domain/decoding/village-codec.js";
import type { VillageState } from "../../packages/villages/src/server/domain/models/world.js";
import type { Job } from "../../packages/villages/src/server/domain/models/background-model.js";
import { readVillagerCard } from "../../packages/villages/src/server/adapters/engine/catalog.js";
import { snapshotFromCard } from "../../packages/villages/src/server/domain/rules/resident-card-snapshot.js";
import { queueVillageVenueRequest } from "../../packages/villages/src/server/domain/rules/venue-request-state.js";
import {
  respondDueVenueMail,
  queueVenueCounteroffer,
  venueMailbox,
} from "../../packages/villages/src/server/features/venues/venue-mailbox.js";
import {
  backgroundRevision,
  recoverBackgroundWork,
  settleBackgroundWork,
} from "../../packages/villages/src/server/jobs/background-work.js";

const now = new Date("2026-10-07T12:00:00.000Z"),
  created = new Date("2026-10-04T12:00:00.000Z");
type Graph = Parameters<Parameters<typeof withSettingsOwners>[0]>[0];
function world(label: string) {
  const state = defaultVillageState();
  state.name = label;
  state.seed = "same-seed";
  state.setupAt = "2026-10-01T12:00:00.000Z";
  const snapshot = snapshotFromCard(
    readVillagerCard({
      id: "same-resident",
      comment: "",
      data: { name: `${label} resident`, description: `${label} resident summary` },
    }),
    1,
  );
  snapshot.capturedAt = state.setupAt;
  state.villagers.push({
    characterId: "same-resident",
    cardSnapshot: snapshot,
    addedAt: snapshot.capturedAt,
    agenda: null,
    completedWishes: [],
    remap: null,
    remapFailure: null,
  });
  queueVillageVenueRequest(
    state,
    { name: `${label} original`, classes: ["gathering"] },
    "same-resident",
    "chat",
    `${label}-request`,
    created.toISOString(),
    `${label} explicit request`,
  );
  assert.equal(state.pendingDecisions.length, 1);
  const request = state.pendingDecisions[0]!;
  request.id = "same-request";
  queueVenueCounteroffer(
    state,
    request.id,
    { name: `${label} counteroffer`, classes: ["gathering"] },
    `${label} description`,
    created,
  );
  const mail = state.venueMail[0]!;
  assert.equal(request.status, "countered");
  assert.equal(mail.status, "awaiting-villagers");
  assert(mail.id, "supplied-state queue allocates without a configured runtime");
  assert(Date.parse(mail.dueAt) > created.getTime());
  assert(Date.parse(mail.dueAt) <= created.getTime() + 24 * 60 * 60_000);
  mail.id = "same-mail";
  const saved = coerceVillageState(state);
  assert.equal(saved.venueMail[0]?.id, "same-mail");
  assert.equal(saved.villagers[0]?.characterId, "same-resident");
  return saved;
}
function seed(graph: Graph, state: VillageState) {
  graph.rows.get("villages-village")!.data = structuredClone(state);
  graph.rows.delete("same-job");
  const id = "villages-background-connection-" + backgroundRevision("same-connection");
  graph.rows.set(id, {
    ...graph.rows.get("villages-connections")!,
    id,
    kind: "background-connection",
    data: { connectionId: "same-connection" },
  });
}
function input(state: VillageState) {
  const due = structuredClone(state.venueMail[0]!);
  return {
    due,
    now: now.toISOString(),
    villageName: state.name,
    playerRole: state.playerRole,
    playerPersonaName: state.playerPersonaName,
    villagers: state.villagers
      .filter((v) => due.affectedIds.includes(v.characterId))
      .map((v) => ({
        characterId: v.characterId,
        capturedAt: v.cardSnapshot.capturedAt,
        relationship: "",
        cardSnapshot: { name: v.cardSnapshot.name, summary: v.cardSnapshot.summary },
      })),
  };
}
function jobs(graph: Graph) {
  return [...graph.rows.values()]
    .filter((row) => row.kind === "background-work")
    .map((row) => row.data as Job & { input: ReturnType<typeof input> });
}

/** Current Mail producers, complete runtime graphs, mocked Engine HTTP and forbidden providers. */
export async function assertMailboxOwnership() {
  const canonicalA = world("A"),
    canonicalB = world("B");
  await withSettingsOwners(async (a, b, selectB) => {
    seed(a, canonicalA);
    seed(b, canonicalB);
    await a.owner.run(() => recoverBackgroundWork());
    await b.owner.run(() => recoverBackgroundWork());
    const handlerA = a.owner.run(() => venueMailbox().mailBackgroundHandler);
    assert(handlerA.valid(canonicalA, input(canonicalA)));
    assert.equal(handlerA.valid(canonicalB, input(canonicalA)), false);
    const pause = a.pause("get", "villages-village");
    const pending = respondDueVenueMail(now);
    await pause.wait(pending);
    selectB();
    await respondDueVenueMail(now);
    pause.resume();
    await pending;
    await a.owner.run(() => settleBackgroundWork());
    await b.owner.run(() => settleBackgroundWork());
    for (const [graph, label] of [
      [a, "A"],
      [b, "B"],
    ] as const) {
      const saved = jobs(graph);
      assert.equal(saved.length, 1, "equal Mail identifiers admit independently into their own world");
      assert.equal(saved[0]!.subjectId, "same-mail");
      assert.equal(saved[0]!.input.villageName, label);
      assert.equal(saved[0]!.input.due.title, `Counteroffer: ${label} counteroffer`);
      assert.equal(saved[0]!.finite, true);
      assert.equal(saved[0]!.status, "paused", "existing connection pause prevents provider dispatch");
      assert(graph.calls.every((call) => call.owner));
    }
    const beforeReplay = structuredClone(jobs(b));
    await respondDueVenueMail(now);
    await b.owner.run(() => settleBackgroundWork());
    assert.deepEqual(
      jobs(b),
      beforeReplay,
      "repeated due admission preserves the saved ID, attempt, request count and steps",
    );
    a.owner.run(a.release);
    const beforeB = b.calls.length;
    await assert.rejects(
      a.owner.run(() => respondDueVenueMail(now)),
      /not configured/,
    );
    assert.equal(b.calls.length, beforeB, "released A does not borrow B");
    await respondDueVenueMail(now);
  });

  await withSettingsOwners(async (a, b, selectB) => {
    seed(a, canonicalA);
    seed(b, canonicalB);
    const handler = a.owner.run(() => venueMailbox().mailBackgroundHandler);
    const pause = a.pause("get", "villages-connections");
    const failure = Error("Owning resolver unavailable");
    a.failNext("resolver", "same-connection", failure);
    b.failNext("resolver", "same-connection", failure);
    const generating = handler.generate(input(canonicalA));
    await pause.wait(generating);
    selectB();
    pause.resume();
    await assert.rejects(generating, (error) => error === failure);
    assert.equal(a.calls.filter((call) => call.op === "resolver").length, 1);
    assert.equal(b.calls.length, 0, "captured nested Handler retains A across connection selection");
    const escapedFailure = Error("Captured A resolver unavailable under B");
    a.failNext("resolver", "same-connection", escapedFailure);
    const beforeEscapedB = b.calls.length;
    await assert.rejects(
      b.owner.run(() => handler.generate(input(canonicalA))),
      (error) => error === escapedFailure,
    );
    assert.equal(a.calls.filter((call) => call.op === "resolver").length, 2);
    assert.equal(b.calls.length, beforeEscapedB, "escaped nested callback invoked under B still selects A");
    const beforeA = a.calls.length;
    await assert.rejects(
      b.owner.run(() => venueMailbox().mailBackgroundHandler.generate(input(canonicalB))),
      (error) => error === failure,
    );
    assert.equal(a.calls.length, beforeA);
    assert.equal(b.calls.filter((call) => call.op === "resolver").length, 1);

    const revised = structuredClone(canonicalA);
    revised.villagers[0]!.cardSnapshot.capturedAt = now.toISOString();
    assert.equal(handler.valid(revised, input(canonicalA)), false, "resident adoption invalidates captured reply");
    const changed = structuredClone(canonicalA);
    changed.venueMail[0]!.title = "Concurrent terms";
    assert.equal(handler.valid(changed, input(canonicalA)), false, "terms revision invalidates captured reply");
    const declined = structuredClone(canonicalA);
    b.owner.run(() =>
      handler.apply(
        declined,
        input(canonicalA),
        [{ characterId: "same-resident", accepted: false, reply: "Declined" }],
        { retrying: false },
      ),
    );
    assert.equal(declined.venueMail[0]!.status, "declined");
    assert.equal(declined.pendingDecisions[0]!.status, "denied");
    assert.equal(declined.projects.length, 0);
    assert.equal(canonicalB.venueMail[0]!.status, "awaiting-villagers");
    assert(a.calls.every((call) => call.owner));
    assert(b.calls.every((call) => call.owner));
  });

  await withSettingsOwners(async (a, b, selectB) => {
    seed(a, canonicalA);
    seed(b, canonicalB);
    const failure = Error("Owning world read failed");
    const pause = a.pause("get", "villages-village");
    a.failNext("get", "villages-village", failure);
    const pending = respondDueVenueMail(now);
    await pause.wait(pending);
    selectB();
    pause.resume();
    await assert.rejects(pending, (error) => error === failure);
    assert.equal(b.calls.length, 0);
    assert.equal(jobs(a).length + jobs(b).length, 0);
    const missing = createActivationScope();
    await assert.rejects(
      missing.run(() => respondDueVenueMail(now)),
      /not configured/,
    );
    missing.dispose();
    a.owner.run(a.release);
    a.owner.dispose();
    await assert.rejects(
      a.owner.run(() => respondDueVenueMail(now)),
      /not configured/,
    );
    assert.equal(b.calls.length, 0, "missing/disposed owners cannot use another world's store");
  });
  console.log(
    "Mailbox ownership: canonical no-host queues, independent finite admissions, nested callbacks, revision invalidation, failures and cleanup passed; mocked Engine HTTP, no providers.",
  );
}
