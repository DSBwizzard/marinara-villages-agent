// Test cases: social-mail/one-request, social-mail/saved-recovery, social-mail/authority, social-mail/admission, social-mail/fail-before-spend, social-mail/background-recovery
import assert from "node:assert/strict";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import { runCase } from "../scripts/test-cases.mjs";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { createSocialMail } from "../packages/villages/src/server/features/residents/social-mail-service.js";
import type {
  PersonalMailInput,
  PersonalMailResult,
} from "../packages/villages/src/server/domain/models/social-mail.js";
import type {
  BackgroundInput,
  BackgroundSummary,
  Job,
} from "../packages/villages/src/server/domain/models/background-model.js";
import { villageWorldScope } from "../packages/villages/src/server/domain/rules/village-identity.js";
import { canAutomaticallyRetryBackgroundJob } from "../packages/villages/src/server/domain/rules/work-recovery.js";
import { readPersonalMailInput } from "../packages/villages/src/server/domain/decoding/mailbox-codec.js";
import { copyBackgroundWork } from "../packages/villages/src/server/domain/rules/world-context-copy.js";
import { createBackgroundContext } from "../packages/villages/src/server/adapters/operations/background-context-service.js";
import { createBackgroundWork } from "../packages/villages/src/server/jobs/background-service.js";
import { readCapturedInput } from "../packages/villages/src/server/adapters/storage/captured-admissions.js";

const at = "2026-11-09T12:00:00.000Z";
async function fixture() {
  const background = createBackgroundContext();
  const rows = new Map<string, any>(),
    queued: BackgroundInput[] = [],
    jobs: BackgroundSummary[] = [],
    retries: unknown[][] = [];
  let failPages = false,
    failAdmission = false,
    fitProblem = false,
    requests = 0;
  let beforePage: (() => void) | undefined;
  let answer = {
    content: JSON.stringify({ reply: { text: "Thank you. I enjoyed the garden too." } }),
    finishReason: "stop",
  };
  const captured: { messages: any[]; options: any }[] = [];
  const documents = {
    async getById(_pkg: string, id: string) {
      return structuredClone(rows.get(id) ?? null);
    },
    async list(_pkg: string, kind: string) {
      return [...rows.values()].filter((row) => row.kind === kind).map((row) => structuredClone(row));
    },
    async create(input: any) {
      if (failPages && input.kind === "memory-page") throw Error("injected page failure");
      if (input.kind === "memory-page") {
        const change = beforePage;
        beforePage = undefined;
        change?.();
      }
      assert(!rows.has(input.id));
      const row = { ...structuredClone(input), revision: 1 };
      rows.set(row.id, row);
      return structuredClone(row);
    },
    async update(input: any) {
      const before = rows.get(input.id);
      if (!before || before.revision !== input.expectedRevision) return null;
      const row = { ...before, ...structuredClone(input), revision: before.revision + 1 };
      rows.set(row.id, row);
      return structuredClone(row);
    },
    async remove(_pkg: string, id: string, revision: number) {
      return rows.get(id)?.revision === revision && rows.delete(id);
    },
  } as CapabilityDocumentStore;
  const repository = createVillageRepository(() => documents),
    read = () => repository.readAuthority({ memories: true });
  await repository.mutateAuthority(
    (state) => {
      Object.assign(state, { seed: "mail", setupAt: at, foundedAt: at });
      state.villagers = [
        {
          characterId: "ada",
          incarnation: "one",
          letterFontId: "caveat",
          addedAt: at,
          cardSnapshot: {
            id: "ada",
            name: "Ada",
            capturedAt: at,
            sourceStatus: "available",
            tags: [],
            revision: 1,
            systemPrompt: "Authored system sentinel",
            description: "Authored description sentinel",
            personality: "Authored personality sentinel",
            backstory: "Authored backstory sentinel",
            appearance: "Authored appearance sentinel",
            scenario: "Authored scenario sentinel",
            exampleDialogue: "Authored example sentinel",
            postHistoryInstructions: "Authored post-history sentinel",
          },
        },
      ] as typeof state.villagers;
      state.startingHistory.reviewed.ada = "one";
    },
    { memories: true },
  );
  const mutate = async (work: any, options: any = { memories: true }) => {
    await repository.mutateAuthority(work, options);
    return read();
  };
  const service = createSocialMail({
    withWork: async (work: any) => work(),
    withVillageSceneAcceptance: (work: any) => repository.withAuthorityLock(async () => work(await read())),
    readVillageSnapshot: read,
    mutateVillageState: mutate,
    queueBackgroundJob: async (work: BackgroundInput) => {
      const source = (await read()).mailbox.messages[(work.input as PersonalMailInput).incoming.id];
      assert.equal(source.status, "pending", "exact source is durable before any job admission");
      if (failAdmission) throw Error("injected admission failure");
      if (!queued.some((row) => row.revision === work.revision)) {
        const copied = copyBackgroundWork(work);
        copied.input = readCapturedInput(work.kind, copied.input, work.seed);
        queued.push(copied);
      }
    },
    retryBackgroundJob: async (...args: unknown[]) => {
      retries.push(args);
    },
    backgroundWorkSummaries: async () => structuredClone(jobs),
    villagesConnectionIdFor: async (role: string) => {
      assert.equal(role, "narration");
      return "saved-connection";
    },
    villagesLanguageModels: () => ({
      resolveForRequest: async () => ({
        connectionId: "saved-connection",
        model: "unchanged-model",
        maxOutputTokens: 4096,
        fitContext: (messages: any[], options: any) => ({
          messages,
          maxTokens: options.maxTokens,
          trimmed: fitProblem,
        }),
        chatComplete: async () => {
          requests++;
          return structuredClone(answer);
        },
      }),
    }),
    completeWithRoom: async (model: any, messages: any[], tokens: number, options: any) => {
      await options.beforeBackgroundDispatch();
      captured.push({ messages: structuredClone(messages), options });
      const complete = background.backgroundCalls.getStore();
      return complete ? complete(model, messages, tokens, options) : model.chatComplete(messages, options);
    },
  } as any);
  const scope = villageWorldScope(await read());
  const send = (requestId = "original", text = "  I appreciated your café garden. 🌼\n  ") =>
    service.send({ scope, residentId: "ada", requestId, text });
  const apply = (input: unknown, result: unknown) =>
    mutate((state: any) => {
      assert(service.handler.valid(state, input));
      service.handler.apply(state, input, result, { retrying: false });
    });
  return {
    service,
    documents,
    rows,
    background,
    repository,
    read,
    mutate,
    queued,
    jobs,
    retries,
    captured,
    scope,
    send,
    apply,
    input: () => readPersonalMailInput(queued[0].input),
    get requests() {
      return requests;
    },
    failPages(value: boolean) {
      failPages = value;
    },
    beforePage(work: () => void) {
      beforePage = work;
    },
    failAdmission(value: boolean) {
      failAdmission = value;
    },
    failFit(value: boolean) {
      fitProblem = value;
    },
    answer(value: typeof answer) {
      answer = value;
    },
  };
}

await runCase("social-mail/one-request", async () => {
  const f = await fixture(),
    sent = await f.send(),
    input = f.input();
  assert.equal(f.requests, 0);
  assert.equal(input.incoming.text, "  I appreciated your café garden. 🌼\n  ");
  const result = (await f.service.handler.generate(input)) as PersonalMailResult;
  assert.equal(f.requests, 1);
  const prompt = JSON.stringify(f.captured[0].messages);
  for (const field of [
    "system",
    "description",
    "personality",
    "backstory",
    "appearance",
    "scenario",
    "example",
    "post-history",
  ])
    assert(prompt.includes("Authored " + field + " sentinel"), field);
  assert(!Object.hasOwn(f.captured[0].options, "reasoningEffort"), "retain the user's model settings");
  await f.apply(input, result);
  const inbox = await f.service.readMailbox({ scope: f.scope });
  assert.equal(inbox.total, 1);
  const reply = inbox.letters[0],
    token = reply.message.token;
  assert.equal(
    (await f.service.getLetter(reply.thread.id, reply.message.id, f.scope, token)).message.text,
    "",
    "unread body waits for successful reading",
  );
  await f.service.readLetter(reply.thread.id, reply.message.id, f.scope, token);
  const opened = await f.service.getLetter(reply.thread.id, reply.message.id, f.scope, token);
  assert.equal(opened.message.text, result.replyText);
  assert(opened.message.read);
  const state = await f.read();
  assert.equal(state.episodes.records.length, 4);
  assert(state.episodes.records.every((row) => !row.sceneId && !row.segments.length));
  await f.service.readLetter(reply.thread.id, reply.message.id, f.scope, token);
  await f.apply(input, result);
  assert.deepEqual(await f.read(), state, "lost acknowledgement adds no learning, source or reply");
  assert.deepEqual(await f.send(), sent);
  assert.equal(f.requests, 1);
});

await runCase("social-mail/saved-recovery", async () => {
  const f = await fixture();
  await f.send();
  const input = f.input(),
    result = await f.service.handler.generate(input),
    before = await f.read();
  f.failPages(true);
  await assert.rejects(f.apply(input, result), /injected page failure/);
  assert.deepEqual(await f.read(), before, "failed publication exposes no source/reply/partial keeps");
  f.failPages(false);
  await f.apply(input, result);
  assert.equal(f.requests, 1, "saved-response application has no model work");
  const { messages: _messages, options } = f.captured[0];
  const recovered = f.service.handler.recoverSavedResult!(input, [
    {
      key: options.checkpointId,
      fingerprint: "exact",
      status: "completed",
      response: {
        content: JSON.stringify({ reply: { text: "Thank you. I enjoyed the garden too." } }),
        finishReason: "stop",
      },
    },
  ] as any);
  assert.deepEqual(recovered, result);
  assert.equal(
    f.service.handler.recoverSavedResult!(input, [
      { key: "unrelated", status: "completed", response: { content: "{}" } },
    ] as any),
    undefined,
  );
  const inbox = await f.service.readMailbox(),
    reply = inbox.letters[0];
  f.failPages(true);
  await assert.rejects(
    f.service.readLetter(reply.thread.id, reply.message.id, f.scope, reply.message.token),
    /injected page failure/,
  );
  assert.equal(
    (await f.service.getLetter(reply.thread.id, reply.message.id, f.scope, reply.message.token)).message.text,
    "",
  );
  f.failPages(false);
  await f.service.readLetter(reply.thread.id, reply.message.id, f.scope, reply.message.token);
  assert.equal(f.requests, 1);
});

await runCase("social-mail/authority", async () => {
  const f = await fixture(),
    sent = await f.send(),
    input = f.input(),
    result = await f.service.handler.generate(input);
  await assert.rejects(f.send("original", "different original"), /request ID/);
  await assert.rejects(
    f.service.send(
      { scope: f.scope, residentId: "ada", requestId: "original", text: input.incoming.text },
      "personal:other",
    ),
    /recipient/,
  );
  const before = await f.read();
  await assert.rejects(f.apply(input, { ...(result as object), replyText: 5 }));
  assert.deepEqual(await f.read(), before, "malformed saved result fails before mutation");
  await f.mutate((state: any) => {
    state.villagers[0].incarnation = "replacement";
    state.startingHistory.reviewed = {};
  });
  assert.throws(
    () =>
      f.service.handler.valid(
        { ...before, villagers: [{ ...before.villagers[0], incarnation: "replacement" }] },
        input,
      ),
    /correspondent changed/,
  );
  await assert.rejects(f.apply(input, result), /correspondent changed/);
  assert.equal((await f.read()).mailbox.messages[sent.messageId].status, "pending");
  const accepted = await fixture(),
    acceptedSent = await accepted.send(),
    savedInput = accepted.input();
  await accepted.apply(savedInput, await accepted.service.handler.generate(savedInput));
  await accepted.mutate((state: any) => {
    state.villagers = [];
    state.startingHistory.reviewed = {};
    state.formerLetterFonts = { ada: "caveat" };
  });
  assert.deepEqual(
    await accepted.send(),
    acceptedSent,
    "exact accepted send replay precedes current-resident/readiness gates",
  );
  await accepted.mutate((state: any) => {
    state.setupAt = "2026-11-10T00:00:00.000Z";
  });
  await assert.rejects(
    accepted.service.send({ scope: accepted.scope, residentId: "ada", requestId: "other", text: "Hello" }),
    /Village changed/,
  );
  assert.equal(f.requests, 1);
});

await runCase("social-mail/admission", async () => {
  const f = await fixture();
  f.failAdmission(true);
  await assert.rejects(f.send(), /admission failure/);
  const state = await f.read(),
    source = Object.values(state.mailbox.messages)[0];
  assert.equal(source.text, "  I appreciated your café garden. 🌼\n  ");
  assert(source.admissionFailed);
  const recovery = (await f.service.readMailbox()).recovery[0];
  f.failAdmission(false);
  await f.service.retry(recovery.threadId, source.id, "admit-again", f.scope, recovery.token);
  assert.equal(f.queued.length, 1);
  const job = {
    id: "job",
    instanceId: "00000000-0000-4000-8000-000000000000",
    kind: "personal-mail",
    subjectId: source.id,
    status: "failed",
    attempt: 3,
    updatedAt: at,
  } as BackgroundSummary;
  f.jobs.push(job);
  await f.service.retry(recovery.threadId, source.id, "saved-retry", f.scope, recovery.token);
  assert.deepEqual(f.retries, [[job.id, 3, "saved-retry", job.instanceId]]);
  job.status = "running";
  await assert.rejects(
    f.service.retry(recovery.threadId, source.id, "busy-retry", f.scope, recovery.token),
    /already being processed/,
  );
  assert.equal(f.requests, 0);
});

await runCase("social-mail/fail-before-spend", async () => {
  const f = await fixture();
  await f.send();
  const input = f.input(),
    wrongActors = structuredClone(input),
    wrongTime = structuredClone(input);
  wrongActors.capture.actors[1] = { id: "leo", incarnation: "one" };
  wrongTime.capture.at = "2026-11-01T00:00:00.000Z";
  await assert.rejects(f.service.handler.generate(wrongActors));
  await assert.rejects(f.service.handler.generate(wrongTime));
  assert.equal(f.requests, 0, "impossible frozen correspondents/timing fail before purchase");
  f.failFit(true);
  await assert.rejects(f.service.handler.generate(f.input()), /does not fit/);
  assert.equal(f.requests, 0);
  f.failFit(false);
  f.answer({ content: "{}", finishReason: "length" });
  await assert.rejects(f.service.handler.generate(f.input()), /output limit/);
  assert.equal(f.requests, 1);
  const eligible = {
    id: "job",
    instanceId: "00000000-0000-4000-8000-000000000000",
    seed: "mail",
    kind: "agenda",
    subjectId: "ada",
    status: "failed",
    requests: 1,
    hasResult: false,
    failedStep: 0,
    failure: { cause: "invalid_json" },
    steps: [{ fingerprint: "one", status: "completed", response: { content: "{}" }, timing: { outcome: "complete" } }],
  } as Job;
  assert.equal(canAutomaticallyRetryBackgroundJob(eligible), true, "control has otherwise sufficient retry evidence");
  assert.equal(
    canAutomaticallyRetryBackgroundJob({ ...eligible, kind: "personal-mail" }),
    false,
    "mail requires deliberate retry",
  );
});

await runCase("social-mail/background-recovery", async () => {
  const f = await fixture();
  await f.send();
  let mailReads = 0;
  const worker = createBackgroundWork({
    villagesDocuments: () => f.documents,
    villagesLogger: () => ({ warn() {}, info() {}, error() {} }),
    readVillageAuthority: (options: any) => {
      if (options?.memories === true) mailReads++;
      return f.repository.readAuthority(options);
    },
    mutateVillageAuthority: (update: any, options: any) => {
      assert.equal(options.memories, true);
      return f.repository.mutateAuthority(update, options);
    },
    readVillageState: () => {
      throw Error("mail jobs require raw authority");
    },
    mutateVillageState: () => {
      throw Error("mail jobs require raw publication");
    },
    withUsagePurpose: (_purpose: string, work: any) => work(),
    measurePipeline: (_name: string, _facts: unknown, work: any) => work(),
    runtimeDebug() {},
    backgroundCalls: f.background.backgroundCalls,
    withCurrentJobWrite: (work: any) => f.repository.withAuthorityLock(work),
    handlers: [["personal-mail", f.service.handler]],
  } as any);
  f.failPages(true);
  await worker.queueBackgroundJob(f.queued[0]);
  await worker.settleBackgroundWork();
  const failed = (await worker.backgroundWorkSummaries())[0];
  assert.equal(failed.status, "failed");
  assert.equal(failed.requests, 1);
  assert.equal(f.requests, 1);
  const saved = [...f.rows.values()].find((row) => row.kind === "background-work");
  assert(saved.data.hasResult, "the real background runner retains its result before native page failure");
  assert.equal((await f.read()).mailbox.messages[f.input().incoming.id].status, "pending");
  f.failPages(false);
  const previous = structuredClone(saved.data),
    input = f.input(),
    result = await f.service.handler.recoverSavedResult!(input, [
      {
        key: f.captured[0].options.checkpointId,
        fingerprint: "original",
        status: "completed",
        response: {
          content: JSON.stringify({ reply: { text: "Thank you. I enjoyed the garden too." } }),
          finishReason: "stop",
        },
      },
    ] as any);
  saved.data.status = "queued";
  const source = {
    slot: saved.id,
    id: saved.data.id,
    instanceId: saved.data.instanceId,
    attempt: saved.data.attempt,
    owner: saved.data.owner,
  };
  f.beforePage(() => {
    saved.data.owner = "new-activation";
    saved.revision++;
  });
  await assert.rejects(
    f.repository.mutateAuthority(
      (state) => {
        f.service.handler.apply(state, input, result, { retrying: true });
      },
      { memories: true, sourceJobs: [source] },
    ),
    /source job changed before publication/,
  );
  assert.equal(
    (await f.read()).mailbox.messages[input.incoming.id].status,
    "pending",
    "a worker replaced during page writes cannot publish its candidate",
  );
  saved.data = previous;
  saved.revision++;
  await worker.retryBackgroundJob(failed.id, failed.attempt, "recover-saved", failed.instanceId);
  await worker.settleBackgroundWork();
  const done = (await worker.backgroundWorkSummaries())[0];
  assert.equal(done.status, "completed", done.error);
  assert.equal(done.requests, 1);
  assert.equal(f.requests, 1);
  assert(mailReads > 0, "the actual mail job loads common continuity and native mailbox");
  assert.equal((await f.read()).mailbox.messages[f.input().incoming.id + ":reply"].status, "delivered");
});
