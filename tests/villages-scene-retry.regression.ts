// Test cases: scene-retry/refusal, scene-retry/repeated, scene-retry/shorter, scene-retry/failure, scene-retry/startup, scene-retry/continue-after-interruption, scene-retry/failure-race, scene-retry/settlement-ack, scene-retry/memory, scene-retry/wish, scene-retry/relationship, scene-retry/unrelated-place, scene-retry/unrelated-mail, scene-retry/unrelated-during-generation, scene-retry/history-changed, scene-retry/history-race, scene-retry/legacy, scene-retry/stale-token, scene-retry/inactive, scene-retry/attendance, scene-retry/offstage-attendance, scene-retry/malformed, scene-retry/native-alternate, scene-retry/duplicate, scene-retry/journal-village, scene-retry/journal-scene, scene-retry/lost-ack, scene-retry/cleanup, scene-retry/wish-follow, scene-retry/fitted-knowledge, scene-retry/missing-base, scene-retry/before-journal, scene-retry/checkpoint, scene-retry/appointment
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { runCase } from "../scripts/test-cases.mjs";
import { packagedSceneServer } from "./fixtures/packaged-scene-server.fixture.js";
import { fixtureVillageState } from "./helpers/village-storage.fixture.js";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { retainNativeFact } from "../packages/villages/src/server/domain/rules/native-continuity.js";
import {
  latestRelationshipScores,
  latestRomanticInterests,
} from "../packages/villages/src/server/domain/rules/continuity.js";
import { createVenueOperationContext } from "../packages/villages/src/server/adapters/operations/operation-context-service.js";
import { configureVenueOperationContext } from "../packages/villages/src/server/adapters/operations/operation-context.js";
import { createRepairGate } from "../packages/villages/src/server/adapters/storage/repair-gate.js";
import { collectRetainedStorage } from "../packages/villages/src/server/features/repair/retained-storage-cleanup.js";
import { queueMailboxLetter } from "../packages/villages/src/server/domain/rules/social-mail.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import { establishPlace } from "./helpers/places.fixture.js";

const refusal = { segments: [{ kind: "narration", text: "I can’t continue that scene." }] };
const alternate = { segments: [{ id: "said", kind: "dialogue", speakerId: "mara", text: "Let’s sit by the window." }] };
const memory = {
  segments: [{ ...alternate.segments[0], text: "I always keep ginger tea in the mill." }],
  keep: [
    {
      id: "tea",
      for: ["mara", "player"],
      class: "information",
      about: ["mara"],
      text: "Mara says she keeps ginger tea in the mill.",
      source: ["said"],
    },
  ],
};
const wish = {
  segments: [{ ...alternate.segments[0], text: "I wish I could have a little boat to cross the river." }],
  keep: [
    {
      id: "boat",
      for: ["mara", "player"],
      owner: "mara",
      about: ["mara"],
      class: "desire",
      current: true,
      text: "Mara wants a little boat so she can cross the river.",
      source: ["said"],
    },
  ],
};
const line = "Thank you for helping me fix the bench.";
const quote = "I’ve been hoping we could go out sometime.";
const relationship = {
  segments: [{ ...alternate.segments[0], text: "I appreciate you taking the time to say that." }],
  keep: [
    {
      id: "rapport",
      class: "perspective",
      for: ["mara"],
      owner: "mara",
      about: ["player"],
      current: true,
      text: "The player's thanks made me warm to them.",
      relationship: { impact: "meaningful-positive", romance: "grows" },
      independent: true,
      source: [{ input: quote, ground: { kind: "spoken", to: ["mara"] } }, "self"],
    },
  ],
};

async function fixture() {
  const host = await packagedSceneServer();
  const repository = createVillageRepository(() => host.documents as never);
  const state = () => fixtureVillageState(host.records.get("villages-village").data, host.records);
  const responses: unknown[] = [];
  const prompts: string[] = [];
  host.model.chatComplete = async (messages: unknown[]) => {
    prompts.push(JSON.stringify(messages));
    const next = responses.shift();
    assert(next, "unexpected purchase");
    const result = await (typeof next === "function" ? next() : next);
    return {
      content: typeof result === "string" ? result : JSON.stringify(result),
      finishReason: "stop",
      usage: { inputTokens: 10, outputTokens: 10 },
    };
  };
  const get = (suffix = "/active") => host.app.inject({ method: "GET", url: "/api/villages/rooms" + suffix });
  const post = (suffix: string, payload: object) =>
    host.app.inject({ method: "POST", url: "/api/villages/rooms" + suffix, payload });
  const active = async () => {
    const response = await get();
    assert.equal(response.statusCode, 200, response.body);
    return response.json().session;
  };
  const send = async (response: unknown = refusal, message = line) => {
    const scene = await active();
    responses.push(response);
    const result = await post("/turn", {
      sessionId: "browser",
      submissionId: randomUUID(),
      mode: "chat",
      message,
      expectedSceneRevision: scene.sceneRevision,
    });
    assert.equal(result.statusCode, 200, result.body + JSON.stringify(host.scene().submissions.at(-1)?.acceptance));
    return result.json().session;
  };
  const latest = () => host.scene().submissions.at(-1)!;
  const body = (scene: any) => {
    assert(scene.retryReply, JSON.stringify({ record: host.records.get("villages-village").data.sceneRetry, scene }));
    return {
      sessionId: "browser",
      token: scene.retryReply.token,
      requestId: randomUUID(),
    };
  };
  const retry = async (scene: any, next: unknown = alternate) => {
    responses.push(next);
    const result = await post("/retry", body(scene));
    assert.equal(result.statusCode, 200, result.body);
    assert.equal(result.json().saved, true);
    return active();
  };
  const changeHistory = () =>
    repository.mutateAuthority(
      (world) => {
        retainNativeFact(
          world,
          {
            id: randomUUID(),
            kind: "initialization",
            targetId: "mara",
            revision: 1,
            text: "Mara likes pears.",
            witnesses: ["mara"],
          },
          new Date().toISOString(),
        );
      },
      { memories: true },
    );
  return {
    ...host,
    repository,
    state,
    responses,
    prompts,
    get,
    post,
    active,
    send,
    latest,
    body,
    retry,
    changeHistory,
  };
}

type Fixture = Awaited<ReturnType<typeof fixture>>;
async function interruptedRetry(f: Fixture) {
  const first = await f.send();
  const update = f.documents.update;
  f.documents.update = async (input) => {
    if (
      input.id === "villages-venue-visit-browser" &&
      input.data.operation?.kind === "retry" &&
      input.data.operation.status === "complete"
    )
      throw Error("fixture settlement unavailable");
    return update(input);
  };
  try {
    f.responses.push(() => {
      throw Error("fixture provider disconnected");
    });
    assert.equal((await f.post("/retry", f.body(first))).statusCode, 500);
  } finally {
    f.documents.update = update;
  }
  const held = await f.active();
  assert.equal(held.operation.status, "interrupted");
  return held;
}
const test = (name: string, work: (f: Fixture) => Promise<void>) =>
  runCase("scene-retry/" + name, async () => {
    const f = await fixture();
    const release = configureVenueOperationContext(createVenueOperationContext(() => ({ debug() {} }) as never));
    try {
      await work(f);
    } finally {
      release();
      await f.stop();
    }
  });

await test("refusal", async (f) => {
  const old = await f.send(),
    oldEpisode = f.latest().episodeId;
  assert(old.lines.some((line: { content: string }) => line.content.includes("can’t continue")));
  const next = await f.retry(old);
  assert.equal(next.latestTurn.id, old.latestTurn.id);
  assert.notEqual(next.playback.version, old.playback.version);
  assert.equal(
    next.lines.filter((row: { content: string }) => row.content === line).length,
    0,
    "original input belongs in Transcript",
  );
  const history = await f.get(`/browser/history?scope=${next.playback.scope}`);
  assert.equal(history.statusCode, 200, history.body);
  assert.equal(history.json().lines.filter((row: { content: string }) => row.content === line).length, 1);
  assert(!next.lines.some((row: { content: string }) => row.content.includes("can’t continue")));
  assert(next.lines.some((row: { content: string }) => row.content.includes("window")));
  assert(!f.state().episodes.records.some((row) => row.id === oldEpisode));
  assert.deepEqual(f.prompts, [f.prompts[0], f.prompts[0]]);
});
await test("repeated", async (f) => {
  const first = await f.send();
  const original = f.latest().episodeId;
  const id = first.latestTurn.id;
  const second = await f.retry(first);
  const replaced = f.latest().episodeId;
  assert.notEqual(replaced, original);
  f.responses.push(memory);
  const result = await f.post("/retry", { ...f.body(second), requestId: id });
  assert.equal(result.statusCode, 200, result.body);
  assert.notEqual(f.latest().episodeId, original);
  assert.notEqual(f.latest().episodeId, replaced);
  assert.equal(f.latest().id, id);
  assert.equal((await f.send()).latestTurn.published, true);
});
await test("shorter", async (f) => {
  const first = await f.send({
    segments: Array.from({ length: 12 }, (_, index) => ({
      kind: "dialogue",
      speakerId: "mara",
      text: "A long reply passage " + index + ".",
    })),
  });
  const cold = await packagedSceneServer({ records: structuredClone(f.records) });
  try {
    let purchases = 0;
    cold.model.chatComplete = async () => {
      purchases++;
      return { content: JSON.stringify(alternate), finishReason: "stop" } as any;
    };
    const result = await cold.app.inject({ method: "POST", url: "/api/villages/rooms/retry", payload: f.body(first) });
    assert.equal(result.statusCode, 200, result.body);
    assert.equal(result.json().saved, true);
    assert(cold.scene().lines.length < first.lines.length);
    assert(cold.scene().lines.some((row) => row.content.includes("window")));
    assert.equal(purchases, 1);
  } finally {
    await cold.stop();
  }
});
await test("startup", async (f) => {
  const held = await interruptedRetry(f);
  const cold = await packagedSceneServer({ records: structuredClone(f.records) });
  try {
    assert.equal(cold.calls(), 0, "startup settles the old attempt without generation");
    const response = await cold.app.inject({ method: "GET", url: "/api/villages/rooms/active" });
    assert.equal(response.statusCode, 200, response.body);
    const scene = response.json().session;
    assert.equal(scene.operation, null);
    assert.equal(scene.latestTurn.id, held.latestTurn.id);
    assert(scene.retryReply);
    assert.equal(cold.scene().abandonedOperations!.at(-1)!.kind, "retry");
    assert.equal(cold.scene().generationReceipts!.at(-1)!.outcome, "unknown");
    const send = await cold.app.inject({
      method: "POST",
      url: "/api/villages/rooms/turn",
      payload: {
        sessionId: "browser",
        submissionId: randomUUID(),
        mode: "chat",
        message: "Let's keep talking.",
        expectedSceneRevision: scene.sceneRevision,
      },
    });
    assert.equal(send.statusCode, 200, send.body);
    assert.equal(cold.calls(), 1);
  } finally {
    await cold.stop();
  }
});
await test("continue-after-interruption", async (f) => {
  const held = await interruptedRetry(f);
  const original = f.latest().episodeId;
  await f.changeHistory();
  const unavailable = await f.active();
  assert.equal(unavailable.retryReply, undefined);
  const calls = f.prompts.length;
  for (const invalid of [
    { expectedSceneRevision: unavailable.sceneRevision - 1 },
    { retryOfAttemptId: randomUUID() },
    { replaceOfOperationId: randomUUID(), retryOfAttemptId: randomUUID() },
  ]) {
    const rejected = await f.post("/turn", {
      sessionId: "browser",
      submissionId: randomUUID(),
      mode: "chat",
      message: '"Let us keep talking."',
      expectedSceneRevision: unavailable.sceneRevision,
      ...invalid,
    });
    assert.equal(rejected.statusCode, 409);
    assert.equal(f.scene().operation!.id, held.operation.id);
    assert.equal(f.scene().operation!.status, "interrupted");
    assert.equal(f.prompts.length, calls);
  }
  const next = await f.send(alternate, '"Let us keep talking."');
  assert.equal(f.prompts.length, calls + 1, "only the new message buys a completion");
  assert.equal(f.scene().submissions[0].episodeId, original);
  assert.equal(f.scene().submissions.length, 2);
  assert(f.scene().abandonedOperations?.some((operation) => operation.id === held.operation.id));
  assert.equal(next.operation, null);
});
await test("failure-race", async (f) => {
  const held = await interruptedRetry(f);
  const before = structuredClone(f.scene().operation);
  assert.equal((await f.post("/retry", { ...f.body(held), token: "0".repeat(64) })).statusCode, 409);
  assert.deepEqual(f.scene().operation, before, "a stale click preserves the held attempt");
  let complete!: (value: unknown) => void;
  let started!: () => void;
  const dispatch = new Promise<void>((resolve) => {
    started = resolve;
  });
  f.responses.push(
    () =>
      new Promise((resolve) => {
        complete = resolve;
        started();
      }),
  );
  const a = f.post("/retry", f.body(held));
  await dispatch;
  const b = f.post("/retry", f.body(held));
  complete(alternate);
  const results = await Promise.all([a, b]);
  assert.deepEqual(results.map((result) => result.statusCode).sort(), [200, 409]);
  assert.equal(f.prompts.length, 3, "competing fresh clicks buy one alternate");
  assert.equal((await f.active()).operation, null);
});
await test("settlement-ack", async (f) => {
  const request = f.body(await f.send());
  const update = f.documents.update;
  let lost = false;
  f.documents.update = async (input) => {
    const result = await update(input);
    if (
      !lost &&
      input.id === "villages-venue-visit-browser" &&
      input.data.operation?.kind === "retry" &&
      input.data.operation.status === "complete" &&
      input.data.abandonedOperations?.length
    ) {
      lost = true;
      throw Error("fixture lost settlement acknowledgement");
    }
    return result;
  };
  f.responses.push(() => {
    throw Error("fixture provider disconnected");
  });
  assert.equal((await f.post("/retry", request)).statusCode, 500);
  assert(lost);
  const failed = await f.active();
  assert.equal(failed.operation, null);
  assert.equal((await f.post("/retry", request)).json().saved, false);
  await f.retry(failed);
  assert.equal(f.prompts.length, 3);
});
for (const [name, original, kind] of [
  ["memory", memory, "information"],
  ["wish", wish, "desire"],
] as const)
  await test(name, async (f) => {
    const before = f.state().continuity.versions.length;
    const first = await f.send(original);
    assert(
      f
        .state()
        .continuity.versions.slice(before)
        .some((row) => row.class === kind),
      JSON.stringify(f.latest()),
    );
    const old = f.state().episodes.records.at(-1)!;
    const after = await f.retry(first);
    assert.equal(f.state().continuity.versions.length, before);
    assert(!f.state().continuity.versions.some((row) => old.continuityVersionIds.includes(row.id)));
    await f.retry(after, original);
    assert(
      f
        .state()
        .continuity.versions.slice(before)
        .some((row) => row.class === kind),
    );
  });
await test("relationship", async (f) => {
  const first = await f.send(relationship, `I say, “${quote}”`);
  const readScores = () => ({
    score: [...latestRelationshipScores(f.state().continuity).values()].at(-1),
    romance: [...latestRomanticInterests(f.state().continuity).values()].at(-1),
  });
  const earned = readScores();
  assert(earned.score?.relationshipDay?.gained, JSON.stringify(f.latest()));
  assert(earned.romance?.romanticDay?.gained);
  const cleared = await f.retry(first);
  assert.deepEqual(readScores(), { score: undefined, romance: undefined });
  await f.retry(cleared, relationship);
  const replacement = readScores();
  assert.deepEqual(replacement.score?.relationshipDay, earned.score.relationshipDay);
  assert.deepEqual(replacement.romance?.romanticDay, earned.romance.romanticDay);
});
await test("unrelated-place", async (f) => {
  const first = await f.send();
  await f.repository.mutateAuthority(
    (world) => {
      world.worldPlaces = structuredClone(world.worldPlaces);
      establishPlace(
        world,
        { name: "The Grove", description: "Oak trees cast shade over a clearing." },
        "offstage-grove",
        "village",
        "fixture",
        new Date().toISOString(),
        true,
      );
    },
    { memories: true },
  );
  const unrelated = f.state().worldPlaces;
  assert(unrelated.places["offstage-grove"]);
  await f.retry(first);
  assert.deepEqual(f.state().worldPlaces, unrelated);
});
await test("unrelated-mail", async (f) => {
  const first = await f.send();
  const id = "pending-letter";
  await f.repository.mutateAuthority(
    (world) => {
      world.mailbox = queueMailboxLetter(
        world.mailbox,
        world.seed,
        {
          id,
          from: continuityActor(world, "player")!,
          to: continuityActor(world, "mara")!,
          at: new Date().toISOString(),
        },
        id,
        "Thank you for the apples.",
      );
    },
    { memories: true },
  );
  const mailbox = f.state().mailbox;
  assert.equal(mailbox.messages[id].status, "pending");
  await f.retry(first);
  assert.deepEqual(f.state().mailbox, mailbox);
});
await test("unrelated-during-generation", async (f) => {
  const first = await f.send();
  await f.retry(first, async () => {
    await f.repository.mutateAuthority((world) => {
      world.name = "The renamed Village";
    });
    return alternate;
  });
  assert.equal(f.state().name, "The renamed Village");
});
await test("history-changed", async (f) => {
  const first = await f.send();
  await f.changeHistory();
  assert.equal((await f.active()).retryReply, undefined);
  const result = await f.post("/retry", f.body(first));
  assert.equal(result.statusCode, 409, result.body);
  assert.match(result.body, /Memories or exchanges changed/);
  assert.equal(f.prompts.length, 1);
});
await test("history-race", async (f) => {
  const first = await f.send(),
    id = f.latest().episodeId;
  f.responses.push(async () => {
    await f.changeHistory();
    return alternate;
  });
  const result = await f.post("/retry", f.body(first));
  assert.equal(result.statusCode, 409, result.body);
  assert.match(result.body, /Memories or exchanges changed/);
  assert.equal(f.latest().episodeId, id);
  assert.equal(f.prompts.length, 2);
  await f.send();
});
await test("legacy", async (f) => {
  const first = await f.send();
  delete f.records.get("villages-village").data.sceneRetry;
  assert.equal((await f.active()).retryReply, undefined);
  const result = await f.post("/retry", f.body(first));
  assert.equal(result.statusCode, 409, result.body);
  assert.match(result.body, /no Retry record/);
  assert.equal(f.prompts.length, 1);
});
await test("stale-token", async (f) => {
  const original = f.body(await f.send());
  await f.send();
  const result = await f.post("/retry", original);
  assert.equal(result.statusCode, 409, result.body);
  assert.match(result.body, /earlier reply/);
  assert.equal(f.prompts.length, 2);
});
await test("inactive", async (f) => {
  const first = await f.send();
  f.records.get("villages-active-venue").data.sessionId = "";
  const result = await f.post("/retry", f.body(first));
  assert.equal(result.statusCode, 409, result.body);
  assert.equal(f.prompts.length, 1);
});
await test("attendance", async (f) => {
  const first = await f.send(),
    id = f.latest().episodeId;
  f.responses.push(async () => {
    await f.repository.mutateAuthority((world) => {
      world.villagers[0].agenda!.activeDay!.blocks[0].zoneId = "exterior";
    });
    return alternate;
  });
  const result = await f.post("/retry", f.body(first));
  assert.equal(result.statusCode, 409, result.body);
  assert.match(result.body, /Scene changed/);
  assert.equal(f.latest().episodeId, id);
});
await test("offstage-attendance", async (f) => {
  await f.repository.mutateAuthority((world) => {
    const bryn = structuredClone(world.villagers[0]);
    bryn.characterId = bryn.cardSnapshot.id = "bryn";
    bryn.cardSnapshot.name = "Bryn";
    bryn.incarnation = "bryn:fixture";
    bryn.agenda!.activeDay!.blocks[0].zoneId = "exterior";
    world.villagers.push(bryn);
    world.startingHistory.reviewed.bryn = bryn.incarnation;
  });
  const first = await f.send();
  assert.deepEqual(first.activeIds, ["mara"]);
  const before = f.state().episodes.records.at(-1)!.actors;
  assert(before.some((actor) => actor.id === "bryn" && actor.zoneId === "exterior"));
  const next = await f.retry(first, async () => {
    await f.repository.mutateAuthority((world) => {
      world.villagers.find((actor) => actor.characterId === "bryn")!.agenda!.activeDay!.blocks[0].venueId = "away";
    });
    return alternate;
  });
  assert.deepEqual(f.state().episodes.records.at(-1)!.actors, before);
  assert(!JSON.stringify(next).includes("Bryn"));
});
for (const [name, reply] of [
  ["malformed", "{{ invalid"],
  [
    "native-alternate",
    {
      ...alternate,
      commands: [{ type: "scene.end", at: "said", source: ["said"] }],
      segments: [{ ...alternate.segments[0], requires: ["command-0"] }],
    },
  ],
] as const)
  await test(name, async (f) => {
    const first = await f.send(),
      original = f.latest().episodeId;
    const request = f.body(first);
    f.responses.push(reply);
    const result = await f.post("/retry", request);
    assert.equal(result.statusCode, 409, result.body);
    assert.equal(f.latest().episodeId, original);
    assert.equal((await f.post("/retry", request)).json().saved, false);
    assert.equal(f.prompts.length, 2);
    await f.send();
  });
await test("duplicate", async (f) => {
  const request = f.body(await f.send());
  let complete!: (value: unknown) => void;
  let dispatch!: () => void;
  const started = new Promise<void>((resolve) => {
    dispatch = resolve;
  });
  f.responses.push(
    () =>
      new Promise((resolve) => {
        complete = resolve;
        dispatch();
      }),
  );
  const a = f.post("/retry", request);
  await started;
  const b = f.post("/retry", request);
  complete(alternate);
  for (const result of await Promise.all([a, b])) assert.equal(result.statusCode, 200, result.body);
  assert.equal(f.prompts.length, 2);
});
await test("failure", async (f) => {
  const first = await f.send(),
    id = f.latest().episodeId;
  const request = f.body(first);
  f.responses.push(() => {
    throw Error("fixture provider disconnected");
  });
  assert.equal((await f.post("/retry", request)).statusCode, 500);
  assert.equal(f.latest().episodeId, id);
  const failed = await f.active();
  assert.equal(failed.operation, null);
  assert(failed.retryReply);
  assert.deepEqual(Object.keys(failed.retryReply), ["token"]);
  assert.equal(f.scene().abandonedOperations!.at(-1)!.kind, "retry");
  assert.equal(f.scene().generationReceipts!.at(-1)!.outcome, "unknown");
  assert.equal((await f.post("/retry", request)).json().saved, false);
  assert.equal(f.prompts.length, 2);
  await f.retry(failed);
  assert.equal(f.prompts.length, 3);
});
for (const [name, failedRow, lost] of [
  ["journal-village", "villages-village", false],
  ["journal-scene", "villages-venue-visit-browser", false],
  ["lost-ack", "villages-venue-visit-browser", true],
] as const)
  await test(name, async (f) => {
    const first = await f.send(memory);
    const request = f.body(first),
      original = f.latest().episodeId;
    const update = f.documents.update;
    let interrupted = false;
    f.documents.update = async (input) => {
      if (!interrupted && input.id === failedRow && f.records.get("villages-repair-control")?.data.pending) {
        if (lost) await update(input);
        interrupted = true;
        throw Error("simulated journal write interruption");
      }
      return update(input);
    };
    f.responses.push(alternate);
    const result = await f.post("/retry", request);
    assert.equal(result.statusCode, 200, result.body);
    assert(interrupted);
    const recovered = await f.active();
    assert.equal(recovered.latestTurn.id, first.latestTurn.id);
    assert.notEqual(f.latest().episodeId, original);
    assert.equal(f.state().episodes.records.at(-1)!.id, f.latest().episodeId);
    assert.equal((await f.post("/retry", request)).json().saved, true);
    assert.equal(f.prompts.length, 2);
  });
await test("cleanup", async (f) => {
  const first = await f.send();
  const refs = f.records.get("villages-village").data.sceneRetry;
  const gate = createRepairGate(f.documents as never);
  try {
    await collectRetainedStorage(gate);
  } finally {
    gate.dispose();
  }
  assert(f.records.has(refs.before.id) && f.records.has(refs.after.id) && f.records.has(refs.request.id));
  await f.retry(first);
});
await test("wish-follow", async (f) => {
  const old = await f.send(wish);
  const root = f.state().continuity.versions.find((row) => row.class === "desire")!.rootId;
  await f.repository.mutateAuthority((world) => {
    world.wishFollowing = { ["mara:" + root]: false };
  });
  const result = await f.post("/retry", f.body(old));
  assert.equal(result.statusCode, 409, result.body);
  assert.match(result.body, /Wish.*follow-up/);
  assert.equal(f.prompts.length, 1);
});
await test("fitted-knowledge", async (f) => {
  await f.send(memory);
  const first = await f.send(refusal, "Mara, tell me about the ginger tea you keep in the mill.");
  assert.match(f.prompts[1], /keeps ginger tea/);
  await f.retry(first);
  assert.equal(f.prompts[1], f.prompts[2]);
  assert.equal(f.state().continuity.versions.filter((row) => row.text.includes("keeps ginger tea")).length, 2);
});
await test("missing-base", async (f) => {
  const first = await f.send();
  const refs = f.records.get("villages-village").data.sceneRetry;
  f.records.delete(refs.before.id);
  const result = await f.post("/retry", f.body(first));
  assert.equal(result.statusCode, 409, result.body);
  assert.match(result.body, /history is unavailable/);
  assert.equal(f.prompts.length, 1);
});
await test("before-journal", async (f) => {
  const first = await f.send(memory),
    original = f.latest().episodeId;
  const retry = f.body(first);
  let refused = false;
  const update = f.documents.update;
  f.documents.update = async (input) => {
    if (!refused && input.id === "villages-repair-control" && input.data.pending) {
      refused = true;
      throw Error("fixture could not save the journal intent");
    }
    return update(input);
  };
  const create = f.documents.create;
  f.documents.create = async (input) => {
    if (!refused && input.id === "villages-repair-control" && input.data.pending) {
      refused = true;
      throw Error("fixture could not create the journal intent");
    }
    return create(input);
  };
  f.responses.push(alternate);
  assert.equal((await f.post("/retry", retry)).statusCode, 500);
  assert(refused);
  assert.equal(f.latest().episodeId, original);
  assert.equal(f.state().episodes.records.at(-1)!.id, original);
  const failed = await f.active();
  assert.equal(failed.operation, null);
  assert.equal((await f.post("/retry", retry)).json().saved, false);
  assert.equal(f.prompts.length, 2);
  await f.send();
});
await test("checkpoint", async (f) => {
  const first = await f.send();
  const repair = async (path: string, payload: object) => {
    const reply = await f.app.inject({ method: "POST", url: "/api/villages/repair" + path, payload });
    assert.equal(reply.statusCode, 200, reply.body);
    return reply.json();
  };
  const checkpoint = await repair("/checkpoints", { title: "Before retry", operationId: randomUUID() });
  const current = await f.retry(first);
  const closed = await f.post("/end", { sessionId: "browser", expectedSceneRevision: current.sceneRevision });
  assert.equal(closed.statusCode, 200, closed.body);
  const review = await repair("/restore", { id: checkpoint.id, operationId: randomUUID() });
  await repair("/apply", { id: review.id, token: review.token });
  const restored = await f.active();
  assert.equal(restored.latestTurn.id, first.latestTurn.id);
  assert.equal(restored.retryReply, undefined);
  assert(restored.lines.some((line: { content: string }) => line.content.includes("can’t continue")));
  assert.equal(f.prompts.length, 2);
});
await test("appointment", async (f) => {
  const offer = "Let's look through maps here tomorrow from noon to one.";
  const date = new Date(Date.now() + 86400_000).toISOString().slice(0, 10);
  const reply = {
    segments: [{ ...alternate.segments[0], text: "Yes, I'll meet you here tomorrow at noon until one." }],
    keep: [
      {
        for: ["player", "mara"],
        about: ["mara"],
        class: "commitment",
        text: "Look through maps at The Mill tomorrow from noon to one.",
        offer: { proposer: "player", participants: ["player", "mara"] },
        source: [
          { input: offer, ground: { kind: "spoken", to: ["mara"] }, act: "offer" },
          { segment: "said", act: "accept" },
        ],
        agenda: {
          actorId: "mara",
          kind: "offer",
          activity: "Look through maps",
          time: { date, startMinute: 720, endMinute: 780, venueId: "mill", zoneId: "common" },
        },
      },
    ],
  };
  const first = await f.send(refusal, offer);
  f.responses.push(reply);
  const blockedAlternate = await f.post("/retry", f.body(first));
  assert.equal(blockedAlternate.statusCode, 409, blockedAlternate.body);
  assert.equal(f.state().residentPlans.appointments?.length ?? 0, 0);
  const accepted = await f.send(reply, offer);
  assert.equal(f.state().residentPlans.appointments?.length, 1, JSON.stringify(f.latest()));
  assert.equal(f.state().episodes.records.at(-1)!.commandReceipts.length, 0);
  assert.equal(accepted.retryReply, undefined);
});
