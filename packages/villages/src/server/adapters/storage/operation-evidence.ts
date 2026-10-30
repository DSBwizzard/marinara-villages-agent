import { createHash } from "node:crypto";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import type { VenueOperation } from "../../domain/models/operation-model.js";
import { immutableMemoryValue, memoryObject, memoryRequire } from "../../domain/rules/memory-integrity.js";
import { isRepairSimulation } from "./repair-gate.js";

export const OPERATION_EVIDENCE_KIND = "operation-evidence";
export type OperationEvidenceScope = { id: string; villageSeed?: string };
export type OperationEvidenceReference = { id: string; digest: string };
type BoundReference = OperationEvidenceReference & { binding: string };
export type OperationEvidenceData = {
  format: 2;
  sceneId: string;
  villageSeed: string;
  claim: string | null;
  payload: string;
  payloadDigest: string;
};
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const scopeKey = (scope: OperationEvidenceScope) => JSON.stringify([scope.id, scope.villageSeed ?? ""]);
const key = (ref: OperationEvidenceReference) => ref.id + ":" + ref.digest;
const associations = new WeakMap<object, { scope: string; ref: OperationEvidenceReference; claim: string | null }>();
const abandoned = "abandoned-request";
const TEXT_PREFIX = "operation:";
const decodedValues = new WeakMap<object, unknown>();
const operationIdentity = (raw: VenueOperation, scope: OperationEvidenceScope) => [
  scopeKey(scope),
  raw.id,
  raw.kind,
  raw.sceneRevision,
  raw.input,
];
export const operationCheckpointPrefix = (raw: VenueOperation, scope: OperationEvidenceScope, stage: string) =>
  "checkpoint:" + hash([operationIdentity(raw, scope), stage]) + ":";
export const operationResponsePrefix = (raw: VenueOperation, scope: OperationEvidenceScope, stage: string) =>
  hash(JSON.stringify([scope.id, raw.id, raw.sceneRevision, raw.input, stage])) + ":";
function bind(
  ref: OperationEvidenceReference,
  raw: VenueOperation,
  scope: OperationEvidenceScope,
  path: string[],
): BoundReference {
  return { ...ref, binding: hash([operationIdentity(raw, scope), path, ref]) };
}
function bound(value: unknown, raw: VenueOperation, scope: OperationEvidenceScope, path: string[]) {
  memoryObject(value, ["id", "digest", "binding"]);
  const ref = readOperationEvidenceReference({ id: value.id, digest: value.digest });
  memoryRequire(
    value.binding === bind(ref, raw, scope, path).binding,
    "operation evidence reference belongs to another operation or stage",
  );
  return ref;
}
export function operationEvidenceValue(data: OperationEvidenceData) {
  if (decodedValues.has(data)) return decodedValues.get(data);
  memoryRequire(
    typeof data.payload === "string" && data.payload.startsWith(TEXT_PREFIX),
    "invalid opaque operation evidence",
  );
  const envelope = JSON.parse(data.payload.slice(TEXT_PREFIX.length));
  memoryObject(envelope, ["value"]);
  const value = immutableMemoryValue(envelope.value);
  decodedValues.set(data, value);
  return value;
}
export function operationCheckpointClaims(raw: unknown, scope: OperationEvidenceScope) {
  if (!raw) return [];
  const claims = (raw as VenueOperation).checkpointClaims;
  if (claims === undefined) return [];
  memoryObject(claims);
  for (const [stage, claim] of Object.entries(claims)) {
    memoryObject(claim, ["token", "bodyId"]);
    memoryRequire(
      stage.length > 0 &&
        typeof claim.token === "string" &&
        claim.token.startsWith(operationCheckpointPrefix(raw as VenueOperation, scope, stage)) &&
        claim.bodyId === operationResponseBodyId(scope, claim.token),
      "invalid checkpoint publication claim",
    );
  }
  return Object.values(claims);
}

export function operationResponseBodyId(scope: OperationEvidenceScope, claim: string) {
  memoryRequire(typeof claim === "string" && claim.length > 0, "invalid response publication claim");
  return "villages-operation-evidence-" + hash([scopeKey(scope), claim]);
}
export function readOperationEvidenceReference(value: unknown): OperationEvidenceReference {
  memoryObject(value, ["id", "digest"]);
  memoryRequire(
    typeof value.id === "string" &&
      /^villages-operation-evidence-[a-f0-9]{64}$/.test(value.id) &&
      typeof value.digest === "string" &&
      /^[a-f0-9]{64}$/.test(value.digest),
    "invalid operation evidence reference",
  );
  return value as OperationEvidenceReference;
}
export function prepareOperationValue(value: unknown, scope: OperationEvidenceScope, claim: string | null = null) {
  memoryRequire(typeof scope.id === "string" && !!scope.id, "invalid operation evidence owner");
  const payload = TEXT_PREFIX + JSON.stringify({ value });
  const data: OperationEvidenceData = immutableMemoryValue({
    format: 2,
    sceneId: scope.id,
    villageSeed: scope.villageSeed ?? "",
    claim,
    payload,
    payloadDigest: hash(payload),
  });
  const frozen = immutableMemoryValue(value);
  decodedValues.set(data, frozen);
  const digest = hash(data),
    id = claim === null ? "villages-operation-evidence-" + digest : operationResponseBodyId(scope, claim);
  return { ref: { id, digest }, data, value: frozen };
}
export function validateOperationEvidence(
  row: { id: string; kind: string; data: unknown; revision?: number; packageId?: string },
  scope?: OperationEvidenceScope,
  ref?: OperationEvidenceReference,
) {
  memoryRequire(
    row.kind === OPERATION_EVIDENCE_KIND &&
      (row.revision === undefined || row.revision === 1) &&
      (row.packageId === undefined || row.packageId === "villages"),
    "operation evidence identity changed",
  );
  memoryObject(row.data, ["format", "sceneId", "villageSeed", "claim", "payload", "payloadDigest"]);
  const data = row.data as OperationEvidenceData;
  memoryRequire(
    data.format === 2 &&
      typeof data.sceneId === "string" &&
      !!data.sceneId &&
      typeof data.villageSeed === "string" &&
      typeof data.payload === "string" &&
      data.payload.startsWith(TEXT_PREFIX) &&
      (data.claim === null || (typeof data.claim === "string" && !!data.claim)) &&
      (!scope || (scope.id === data.sceneId && (scope.villageSeed ?? "") === data.villageSeed)),
    "operation evidence belongs to another Scene",
  );
  memoryRequire(
    typeof data.payloadDigest === "string" &&
      /^[a-f0-9]{64}$/.test(data.payloadDigest) &&
      data.payloadDigest === hash(data.payload),
    "operation evidence changed",
  );
  const digest = hash(data),
    expected =
      data.claim === null
        ? "villages-operation-evidence-" + digest
        : operationResponseBodyId({ id: data.sceneId, villageSeed: data.villageSeed }, data.claim);
  memoryRequire(
    row.id === expected && (!ref || (row.id === ref.id && digest === ref.digest)),
    "operation evidence changed",
  );
  const frozen = immutableMemoryValue(data);
  memoryObject(JSON.parse(frozen.payload.slice(TEXT_PREFIX.length)), ["value"]);
  return { ref: { id: row.id, digest }, data: frozen };
}

/** Only the explicitly retained abandoned operation can contain further operation references. */
export function operationEvidenceReferences(
  raw: unknown,
  scope: OperationEvidenceScope,
  nested = false,
): OperationEvidenceReference[] {
  if (raw === undefined || raw === null) return [];
  memoryObject(raw);
  memoryRequire(raw.evidenceFormat === 1, "unsupported Scene operation evidence; start a fresh Village");
  memoryObject(raw.checkpoints);
  memoryObject(raw.attempts);
  if (raw.optionalAttempts !== undefined) memoryObject(raw.optionalAttempts);
  memoryRequire(!nested || !Object.hasOwn(raw.checkpoints, abandoned), "nested abandoned operation evidence");
  const refs = Object.entries(raw.checkpoints).map(([stage, value]) =>
    bound(value, raw as VenueOperation, scope, ["checkpoint", stage]),
  );
  for (const [role, attempts] of [
    ["attempt", raw.attempts],
    ["optional", raw.optionalAttempts ?? {}],
  ] as const)
    for (const [stage, attempt] of Object.entries(attempts)) {
      memoryObject(attempt);
      if (Object.hasOwn(attempt, "result")) {
        const ref = bound(attempt.result, raw as VenueOperation, scope, [role, stage]);
        if (role === "attempt") {
          memoryObject(attempt.response, ["id", "digest", "claim"]);
          memoryRequire(
            attempt.response.id === ref.id &&
              attempt.response.digest === ref.digest &&
              typeof attempt.response.claim === "string" &&
              attempt.response.claim.startsWith(operationResponsePrefix(raw as VenueOperation, scope, stage)) &&
              ref.id === operationResponseBodyId(scope, attempt.response.claim),
            "provider response belongs to another operation or attempt",
          );
        }
        refs.push(ref);
      } else
        memoryRequire(
          !Object.hasOwn(attempt, "response") && (role !== "attempt" || attempt.status !== "complete"),
          "provider response is missing its adopted value",
        );
      if (role === "optional")
        memoryRequire(!Object.hasOwn(attempt, "response"), "optional work cannot claim a provider response identity");
    }
  return refs;
}
export async function traceOperationEvidence(
  raw: unknown,
  scope: OperationEvidenceScope,
  read: (ref: OperationEvidenceReference, resolveValue: boolean) => Promise<unknown>,
  pending?: (operation: unknown) => Promise<void>,
  nested = false,
) {
  for (const ref of operationEvidenceReferences(raw, scope, nested)) await read(ref, false);
  await pending?.(raw);
  const ref = (raw as Record<string, any> | undefined)?.checkpoints?.[abandoned];
  if (ref)
    await traceOperationEvidence(
      await read(bound(ref, raw as VenueOperation, scope, ["checkpoint", abandoned]), true),
      scope,
      read,
      pending,
      true,
    );
}

/** Pure native encoding also lets fixtures author the actual supported contract. */
export function encodeOperationEvidence(
  operation: VenueOperation | undefined,
  scope: OperationEvidenceScope,
  previous?: unknown,
) {
  const values = new Map<string, OperationEvidenceData>();
  const protectedRefs = new Set(operationEvidenceReferences(previous, scope).map(key));
  const pendingIds = new Set(operationCheckpointClaims(previous, scope).map((claim) => claim.bodyId));
  function capture(value: unknown) {
    const frozen = immutableMemoryValue(value),
      known = frozen && typeof frozen === "object" ? associations.get(frozen) : undefined;
    if (known && known.scope === scopeKey(scope) && (protectedRefs.has(key(known.ref)) || pendingIds.has(known.ref.id)))
      return known.ref;
    const prepared = prepareOperationValue(frozen, scope, known?.scope === scopeKey(scope) ? known.claim : null);
    if (known?.scope === scopeKey(scope))
      memoryRequire(key(prepared.ref) === key(known.ref), "cached operation evidence changed");
    values.set(prepared.ref.id, prepared.data);
    if (frozen && typeof frozen === "object")
      associations.set(frozen, { scope: scopeKey(scope), ref: prepared.ref, claim: prepared.data.claim });
    return prepared.ref;
  }
  function encode(value: VenueOperation | undefined, nested = false): Record<string, any> | undefined {
    if (!value) return undefined;
    memoryRequire(!nested || !Object.hasOwn(value.checkpoints, abandoned), "nested abandoned operation");
    const { checkpoints, attempts, optionalAttempts, ...header } = value;
    const saved = {
      ...header,
      evidenceFormat: 1,
      checkpoints: Object.fromEntries(
        Object.entries(checkpoints).map(([stage, body]) => {
          if (stage === abandoned) {
            memoryObject(body);
            memoryRequire(body.snapshot === null, "abandoned operation retained a Scene snapshot");
            return [stage, bind(capture(encode(body as VenueOperation, true)), value, scope, ["checkpoint", stage])];
          }
          value.checkpoints[stage] = immutableMemoryValue(body);
          return [stage, bind(capture(value.checkpoints[stage]), value, scope, ["checkpoint", stage])];
        }),
      ),
      attempts: Object.fromEntries(
        Object.entries(attempts).map(([stage, attempt]) => [stage, encodeAttempt(attempt, value, ["attempt", stage])]),
      ),
      ...(optionalAttempts
        ? {
            optionalAttempts: Object.fromEntries(
              Object.entries(optionalAttempts).map(([id, attempt]) => [
                id,
                encodeAttempt(attempt, value, ["optional", id]),
              ]),
            ),
          }
        : {}),
    };
    return saved;
  }
  function encodeAttempt<T extends { result?: unknown; response?: { id: string; digest: string; claim: string } }>(
    attempt: T,
    operation: VenueOperation,
    path: string[],
  ) {
    const { result, ...metadata } = attempt;
    if (!Object.hasOwn(attempt, "result")) return metadata;
    attempt.result = immutableMemoryValue(result);
    if (attempt.response) {
      const response = attempt.response;
      const ref = readOperationEvidenceReference({ id: response.id, digest: response.digest });
      memoryRequire(
        response.claim.startsWith(operationResponsePrefix(operation, scope, path[1])) &&
          ref.id === operationResponseBodyId(scope, response.claim),
        "provider response belongs to another operation or attempt",
      );
      const known = attempt.result && typeof attempt.result === "object" ? associations.get(attempt.result) : undefined;
      if (!known || known.scope !== scopeKey(scope) || key(known.ref) !== key(ref) || !protectedRefs.has(key(ref))) {
        const prepared = prepareOperationValue(attempt.result, scope, response.claim);
        memoryRequire(key(prepared.ref) === key(ref), "adopted provider response changed");
        values.set(ref.id, prepared.data);
        if (attempt.result && typeof attempt.result === "object")
          associations.set(attempt.result, { scope: scopeKey(scope), ref, claim: response.claim });
      }
      return { ...metadata, result: bind(ref, operation, scope, path) };
    }
    return { ...metadata, result: bind(capture(attempt.result), operation, scope, path) };
  }
  const stored = encode(operation);
  operationEvidenceReferences(stored, scope);
  return { operation: stored, values };
}

function* decoder(
  raw: unknown,
  scope: OperationEvidenceScope,
  nested = false,
): Generator<OperationEvidenceReference, VenueOperation | undefined, unknown> {
  if (raw === undefined || raw === null) return undefined;
  operationEvidenceReferences(raw, scope, nested);
  operationCheckpointClaims(raw, scope);
  const { evidenceFormat: _format, checkpoints, attempts, optionalAttempts, ...header } = raw as Record<string, any>;
  const result = {
    ...header,
    checkpoints: {},
    attempts: {},
    ...(optionalAttempts ? { optionalAttempts: {} } : {}),
  } as VenueOperation;
  for (const [stage, ref] of Object.entries(checkpoints)) {
    const body = yield bound(ref, raw as VenueOperation, scope, ["checkpoint", stage]);
    result.checkpoints[stage] = stage === abandoned ? yield* decoder(body, scope, true) : body;
  }
  for (const [role, source, target] of [
    ["attempt", attempts, result.attempts],
    ["optional", optionalAttempts, result.optionalAttempts],
  ] as const) {
    for (const [stage, attempt] of Object.entries(source ?? {}) as [string, Record<string, any>][]) {
      const { result: ref, ...metadata } = attempt;
      target![stage] = {
        ...metadata,
        ...(Object.hasOwn(attempt, "result")
          ? { result: yield bound(ref, raw as VenueOperation, scope, [role, stage]) }
          : {}),
      } as any;
    }
  }
  return result;
}
export function decodeOperationEvidenceSync(
  raw: unknown,
  scope: OperationEvidenceScope,
  get: (ref: OperationEvidenceReference) => unknown,
) {
  const read = decoder(raw, scope);
  let step = read.next();
  while (step.done === false) step = read.next(get(step.value));
  return step.value;
}

/** These stage values own no media. Opaque prose keeps Host reference traversal bounded. */
export function createOperationEvidence(documents: Pick<CapabilityDocumentStore, "getById" | "create">) {
  const cached = new Map<string, { value: unknown; bytes: number }>();
  let cachedBytes = 0;
  const usable = () => !isRepairSimulation(documents as CapabilityDocumentStore);
  function remember(ref: OperationEvidenceReference, data: OperationEvidenceData, scope: OperationEvidenceScope) {
    const value = operationEvidenceValue(data);
    if (value && typeof value === "object") associations.set(value, { scope: scopeKey(scope), ref, claim: data.claim });
    if (!usable()) return;
    const id = scopeKey(scope) + key(ref);
    cachedBytes -= cached.get(id)?.bytes ?? 0;
    cached.delete(id);
    const bytes = Buffer.byteLength(data.payload);
    cached.set(id, { value, bytes });
    cachedBytes += bytes;
    while (cached.size > 64 || cachedBytes > 4 * 1024 * 1024) {
      const oldest = cached.keys().next().value!;
      cachedBytes -= cached.get(oldest)!.bytes;
      cached.delete(oldest);
    }
  }
  async function inspect(ref: OperationEvidenceReference, scope: OperationEvidenceScope) {
    readOperationEvidenceReference(ref);
    const row = await documents.getById("villages", ref.id);
    memoryRequire(
      row && row.id === ref.id && row.packageId === "villages" && row.revision === 1,
      "owned operation evidence is missing",
    );
    return validateOperationEvidence(row, scope, ref).data;
  }
  async function read(ref: OperationEvidenceReference, scope: OperationEvidenceScope, physical = false) {
    readOperationEvidenceReference(ref);
    const id = scopeKey(scope) + key(ref);
    if (!physical && usable() && cached.has(id)) return cached.get(id)!.value;
    const data = await inspect(ref, scope);
    remember(ref, data, scope);
    return operationEvidenceValue(data);
  }
  async function publish(values: Map<string, OperationEvidenceData>) {
    for (const [id, data] of values) {
      const ref = { id, digest: hash(data) },
        scope = { id: data.sceneId, villageSeed: data.villageSeed };
      const existing = await documents.getById("villages", id);
      if (existing) validateOperationEvidence(existing, scope, ref);
      else {
        const stamp = new Date().toISOString();
        try {
          await documents.create({
            id,
            packageId: "villages",
            kind: OPERATION_EVIDENCE_KIND,
            name: "Private operation evidence",
            description: "Immutable purchased response or completed checkpoint value",
            data,
            createdAt: stamp,
            updatedAt: stamp,
          });
        } catch (error) {
          const concurrent = await documents.getById("villages", id);
          if (!concurrent) throw error;
          validateOperationEvidence(concurrent, scope, ref);
        }
      }
      remember(ref, data, scope);
    }
  }
  async function pending(claim: { token: string; bodyId: string }, scope: OperationEvidenceScope) {
    memoryRequire(claim.bodyId === operationResponseBodyId(scope, claim.token), "checkpoint publication owner changed");
    const row = await documents.getById("villages", claim.bodyId);
    if (!row) return undefined;
    memoryRequire(
      row.id === claim.bodyId && row.packageId === "villages" && row.revision === 1,
      "checkpoint publication body identity changed",
    );
    const saved = validateOperationEvidence(row, scope);
    memoryRequire(saved.data.claim === claim.token, "checkpoint publication claim changed");
    remember(saved.ref, saved.data, scope);
    return { ref: saved.ref, value: operationEvidenceValue(saved.data) };
  }
  async function decode(raw: unknown, scope: OperationEvidenceScope) {
    const source = decoder(raw, scope);
    let step = source.next();
    while (step.done === false) step = source.next(await read(step.value, scope));
    return step.value;
  }
  async function encode(operation: VenueOperation | undefined, scope: OperationEvidenceScope, previous?: unknown) {
    const result = encodeOperationEvidence(operation, scope, previous);
    await publish(result.values);
    return result.operation;
  }
  return { read, inspect, publish, pending, decode, encode };
}
const stores = new WeakMap<object, ReturnType<typeof createOperationEvidence>>();
export function operationEvidenceStore(documents: CapabilityDocumentStore) {
  let store = stores.get(documents);
  if (!store) stores.set(documents, (store = createOperationEvidence(documents)));
  return store;
}
