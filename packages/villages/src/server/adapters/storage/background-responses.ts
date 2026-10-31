import { createHash } from "node:crypto";
import type { CapabilityDocumentStore, CapabilityLanguageModelCompletion } from "@marinara-engine/shared";
import type { Job, Step } from "../../domain/models/background-model.js";
import { immutableMemoryValue, memoryObject, memoryRequire } from "../../domain/rules/memory-integrity.js";
import { isRepairSimulation, withRepairWork } from "./repair-gate.js";
import { backgroundSlotId, isBackgroundInstance } from "../../domain/rules/background-revision.js";
import { capturedJobOwners } from "./captured-admissions.js";

const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const prefix = "background:";
type Row = NonNullable<Awaited<ReturnType<CapabilityDocumentStore["getById"]>>>;
type NativeJob = Omit<Job, "steps"> & { responseStorage: 4; steps: Omit<Step, "response">[] };
function identity(job: Job, index: number, claim: Pick<NonNullable<Step["responseClaim"]>, "instanceId" | "attempt">) {
  memoryRequire(isBackgroundInstance(claim.instanceId), "invalid background instance identity");
  const step = job.steps[index];
  return {
    seed: job.seed,
    jobId: job.id,
    instanceId: claim.instanceId,
    attempt: claim.attempt,
    index,
    key: step.key ?? null,
    fingerprint: step.fingerprint,
  };
}
const bodyId = (scope: ReturnType<typeof identity>) =>
  "villages-generation-response-" +
  hash([scope.seed, scope.jobId, scope.instanceId, scope.attempt, scope.index, scope.key, scope.fingerprint]);
export function backgroundResponseClaim(job: Job, index: number, attempt = job.attempt) {
  const claim = { instanceId: job.instanceId, attempt };
  return { ...claim, id: bodyId(identity(job, index, claim)) };
}
export function backgroundResponseOwners(raw: unknown) {
  memoryObject(raw);
  memoryRequire(
    raw.responseStorage === 4 && Array.isArray(raw.steps),
    "unsupported background format; start a fresh Village",
  );
  const job = raw as NativeJob;
  memoryRequire(
    typeof job.id === "string" &&
      typeof job.seed === "string" &&
      isBackgroundInstance(job.instanceId) &&
      Number.isSafeInteger(job.attempt) &&
      job.attempt > 0,
    "invalid background response owner",
  );
  return job.steps.map((step, index) => {
    memoryObject(step);
    memoryRequire(!Object.hasOwn(step, "response"), "inline background response is unsupported");
    memoryRequire(
      typeof step.fingerprint === "string" && ["running", "completed"].includes(step.status),
      "invalid background step",
    );
    memoryObject(step.responseClaim, ["id", "instanceId", "attempt"]);
    const claim = step.responseClaim;
    memoryRequire(
      Number.isSafeInteger(claim.attempt) &&
        claim.attempt > 0 &&
        (claim.instanceId === job.instanceId ? claim.attempt <= job.attempt : Object.hasOwn(step, "responseRef")) &&
        claim.id === bodyId(identity(job as Job, index, claim)),
      "background response claim changed",
    );
    if (Object.hasOwn(step, "responseRef")) {
      memoryObject(step.responseRef, ["id", "digest"]);
      memoryRequire(
        step.responseRef.id === claim.id &&
          typeof step.responseRef.digest === "string" &&
          /^[a-f0-9]{64}$/.test(step.responseRef.digest),
        "background response reference changed",
      );
    }
    memoryRequire(
      (step.status === "completed") === Object.hasOwn(step, "responseRef"),
      "background response publication is incomplete",
    );
    return { ...identity(job as Job, index, claim), claim, ref: step.responseRef };
  });
}
export function nativeBackgroundJob(job: Job): NativeJob {
  const native = {
    ...job,
    responseStorage: 4 as const,
    steps: job.steps.map(({ response: _response, ...step }) => step),
  };
  backgroundResponseOwners(native);
  return native;
}
export function backgroundHistoryId(raw: unknown): string {
  backgroundResponseOwners(raw);
  const job = raw as NativeJob;
  return "villages-background-history-" + job.id + "-" + job.attempt + "-" + hash(raw);
}
/** Exact before-images avoid losing richer evidence when a competing current-job CAS wins. */
export async function retainBackgroundJob(documents: CapabilityDocumentStore, raw: unknown): Promise<void> {
  const id = backgroundHistoryId(raw),
    stamp = new Date().toISOString();
  try {
    await documents.create({
      id,
      packageId: "villages",
      kind: "background-history",
      name: "Retained background attempt",
      description: "Private unfinished work and response ownership",
      data: raw,
      createdAt: stamp,
      updatedAt: stamp,
    });
  } catch (error) {
    const saved = await documents.getById("villages", id);
    if (!saved) throw error;
    validateBackgroundJobRecord(saved);
    memoryRequire(
      saved.packageId === "villages" && saved.revision === 1 && saved.id === id,
      "retained background attempt changed",
    );
  }
}
export function validateBackgroundJobRecord(row: Pick<Row, "id" | "kind" | "data"> & Partial<Row>) {
  memoryRequire(
    ["background-work", "background-history"].includes(row.kind) &&
      (row.packageId === undefined || row.packageId === "villages"),
    "background job record identity changed",
  );
  backgroundResponseOwners(row.data);
  capturedJobOwners(row.data);
  const job = row.data as Job;
  memoryRequire(
    typeof job.kind === "string" &&
      typeof job.subjectId === "string" &&
      row.id === (row.kind === "background-work" ? backgroundSlotId(job) : backgroundHistoryId(row.data)),
    "background job record identity changed",
  );
}
export function prepareBackgroundResponse(job: Job, index: number, response: CapabilityLanguageModelCompletion) {
  const claim = job.steps[index].responseClaim!;
  memoryRequire(claim.id === bodyId(identity(job, index, claim)), "background response claim changed");
  const payload = prefix + JSON.stringify({ response });
  const data = {
    format: 2,
    purpose: "background",
    ...identity(job, index, claim),
    payload,
    payloadDigest: hash(payload),
  };
  return { ref: { id: claim.id, digest: hash(data) }, data };
}
export function validateBackgroundResponse(
  row: Pick<Row, "id" | "kind" | "data"> & Partial<Row>,
  owner?: ReturnType<typeof backgroundResponseOwners>[number],
) {
  memoryRequire(
    row.kind === "generation-response" &&
      (row.packageId === undefined || row.packageId === "villages") &&
      (row.revision === undefined || row.revision === 1),
    "background response body changed",
  );
  memoryObject(row.data, [
    "format",
    "purpose",
    "seed",
    "jobId",
    "instanceId",
    "attempt",
    "index",
    "key",
    "fingerprint",
    "payload",
    "payloadDigest",
  ]);
  const data = row.data;
  memoryRequire(
    data.format === 2 &&
      data.purpose === "background" &&
      typeof data.seed === "string" &&
      typeof data.jobId === "string" &&
      isBackgroundInstance(data.instanceId) &&
      Number.isSafeInteger(data.attempt) &&
      data.attempt > 0 &&
      Number.isSafeInteger(data.index) &&
      data.index >= 0 &&
      (data.key === null || typeof data.key === "string") &&
      typeof data.fingerprint === "string" &&
      typeof data.payload === "string" &&
      data.payload.startsWith(prefix) &&
      typeof data.payloadDigest === "string" &&
      /^[a-f0-9]{64}$/.test(data.payloadDigest) &&
      data.payloadDigest === hash(data.payload),
    "invalid background response body",
  );
  const scope = {
    seed: data.seed,
    jobId: data.jobId,
    instanceId: data.instanceId,
    attempt: data.attempt,
    index: data.index,
    key: data.key,
    fingerprint: data.fingerprint,
  };
  const ref = { id: bodyId(scope), digest: hash(data) };
  memoryRequire(
    row.id === ref.id && (!owner || (owner.claim.id === ref.id && (!owner.ref || owner.ref.digest === ref.digest))),
    "background response belongs to another request",
  );
  const value = JSON.parse(data.payload.slice(prefix.length));
  memoryObject(value, ["response"]);
  memoryObject(value.response);
  memoryRequire(
    (typeof value.response.content === "string" || value.response.content === null) &&
      typeof value.response.finishReason === "string",
    "invalid saved background completion",
  );
  return {
    ref,
    response: immutableMemoryValue(value.response) as CapabilityLanguageModelCompletion,
    bytes: Buffer.byteLength(data.payload),
  };
}

export async function validateBackgroundResponseOwners(
  raw: unknown,
  get: (id: string) => Promise<Pick<Row, "id" | "kind" | "data"> | null>,
) {
  const retained: string[] = [];
  for (const owner of backgroundResponseOwners(raw)) {
    const body = await get(owner.claim.id);
    memoryRequire(body || !owner.ref, "saved background response is missing");
    if (body) {
      validateBackgroundResponse(body, owner);
      retained.push(body.id);
    }
  }
  return retained;
}

/** One immutable body per physical request; pending claims survive a lost job acknowledgement. */
export function createBackgroundResponses(documents: CapabilityDocumentStore) {
  const cache = new Map<string, ReturnType<typeof validateBackgroundResponse>>();
  let bytes = 0;
  function remember(value: ReturnType<typeof validateBackgroundResponse>) {
    if (isRepairSimulation(documents)) return;
    bytes -= cache.get(value.ref.id)?.bytes ?? 0;
    cache.delete(value.ref.id);
    cache.set(value.ref.id, value);
    bytes += value.bytes;
    while (cache.size > 64 || bytes > 4 * 1024 * 1024) {
      const id = cache.keys().next().value!;
      bytes -= cache.get(id)!.bytes;
      cache.delete(id);
    }
  }
  async function pending(job: Job, index: number, physical = false) {
    const claim = job.steps[index].responseClaim!;
    memoryRequire(claim && claim.id === bodyId(identity(job, index, claim)), "background response claim changed");
    const owner = { ...identity(job, index, claim), claim, ref: job.steps[index].responseRef };
    const cached = !physical && !isRepairSimulation(documents) ? cache.get(owner.claim.id) : undefined;
    if (cached) {
      memoryRequire(!owner.ref || owner.ref.digest === cached.ref.digest, "cached background response changed");
      return cached;
    }
    const row = await documents.getById("villages", owner.claim.id);
    if (!row) {
      memoryRequire(!owner.ref, "saved background response is missing");
      return undefined;
    }
    memoryRequire(
      row.id === claim.id && row.packageId === "villages" && row.revision === 1,
      "background response identity changed",
    );
    const saved = validateBackgroundResponse(row, owner);
    remember(saved);
    return saved;
  }
  async function publishOwned(job: Job, index: number, response: CapabilityLanguageModelCompletion) {
    const { ref, data } = prepareBackgroundResponse(job, index, response);
    const owns = (row: Row) => {
      memoryRequire(
        row.packageId === "villages" && Number.isSafeInteger(row.revision) && row.revision > 0,
        "background job record identity changed",
      );
      validateBackgroundJobRecord(row);
      const owner = backgroundResponseOwners(row.data).find((owner) => owner.claim.id === ref.id);
      memoryRequire(!owner?.ref || owner.ref.digest === ref.digest, "physical background response changed");
      return !!owner;
    };
    const slot = backgroundSlotId(job),
      current = await documents.getById("villages", slot);
    if (current)
      memoryRequire(
        current.id === slot && current.kind === "background-work",
        "background job record identity changed",
      );
    // Supersession retains the exact claim before releasing the current slot; only late replies scan history.
    let owned = current ? owns(current) : false;
    if (!owned)
      for (const row of await documents.list("villages", "background-history")) {
        memoryRequire(row.kind === "background-history" && row.revision === 1, "retained background attempt changed");
        if (owns(row)) owned = true;
      }
    memoryRequire(owned, "background response claim is no longer retained");
    const stamp = new Date().toISOString();
    try {
      await documents.create({
        id: ref.id,
        packageId: "villages",
        kind: "generation-response",
        name: "Saved background response",
        description: "Immutable private provider evidence",
        data,
        createdAt: stamp,
        updatedAt: stamp,
      });
    } catch (error) {
      const row = await documents.getById("villages", ref.id);
      if (!row) throw error;
      memoryRequire(
        row.id === ref.id && row.packageId === "villages" && row.revision === 1,
        "background response identity changed",
      );
      memoryRequire(validateBackgroundResponse(row).ref.digest === ref.digest, "physical background response changed");
    }
    const saved = validateBackgroundResponse({ id: ref.id, kind: "generation-response", data });
    remember(saved);
    return saved;
  }
  function publish(job: Job, index: number, response: CapabilityLanguageModelCompletion) {
    return withRepairWork(() => publishOwned(job, index, response));
  }
  async function decode(raw: unknown): Promise<Job> {
    const owners = backgroundResponseOwners(raw),
      job = structuredClone(raw) as Job;
    for (const [index, owner] of owners.entries())
      if (owner.ref) job.steps[index].response = (await pending(job, index))!.response;
    return job;
  }
  return { pending, publish, decode };
}
const stores = new WeakMap<CapabilityDocumentStore, ReturnType<typeof createBackgroundResponses>>();
export function backgroundResponseStore(documents: CapabilityDocumentStore) {
  let store = stores.get(documents);
  if (!store) stores.set(documents, (store = createBackgroundResponses(documents)));
  return store;
}
