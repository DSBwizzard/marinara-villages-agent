import { createHash, randomUUID } from "node:crypto";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import { createDocumentMutator } from "./document-store.js";
import { withRepairWork } from "./repair-gate.js";
import {
  operationEvidenceStore,
  operationResponseBodyId,
  prepareOperationValue,
  readOperationEvidenceReference,
  validateOperationEvidence,
  type OperationEvidenceReference,
  type OperationEvidenceScope,
} from "./operation-evidence.js";
import { memoryObject, memoryRequire } from "../../domain/rules/memory-integrity.js";
import { VillagesRequestError } from "../../domain/rules/errors.js";

type Claim = { token: string; bodyId: string; attemptId: string; epoch: number };
type Receipt = {
  format: 1;
  purpose: "scene";
  sceneId: string;
  villageSeed: string;
  signature: string;
  status: "pending" | "complete" | "rejected";
  epoch: number;
  attemptId: string;
  pending: Claim[];
  dispatched: number;
  settled: number;
  settledDigest: string;
  selected?: { ref: OperationEvidenceReference; token: string };
};
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
export const sceneResponseReceiptId = (signature: string) =>
  "villages-generation-response-" + createHash("sha256").update(signature).digest("hex");

export function readSceneResponseReceipt(raw: unknown, scope?: OperationEvidenceScope, signature?: string): Receipt {
  memoryObject(raw, [
    "format",
    "purpose",
    "sceneId",
    "villageSeed",
    "signature",
    "status",
    "epoch",
    "attemptId",
    "pending",
    "dispatched",
    "settled",
    "settledDigest",
    "selected",
  ]);
  const value = raw as Receipt;
  memoryRequire(
    value.format === 1 &&
      value.purpose === "scene" &&
      typeof value.sceneId === "string" &&
      !!value.sceneId &&
      typeof value.villageSeed === "string" &&
      typeof value.signature === "string" &&
      (!signature || value.signature === signature) &&
      (!scope || (value.sceneId === scope.id && value.villageSeed === (scope.villageSeed ?? ""))) &&
      ["pending", "complete", "rejected"].includes(value.status) &&
      [value.epoch, value.dispatched, value.settled].every((n) => Number.isSafeInteger(n) && n >= 0) &&
      typeof value.attemptId === "string" &&
      Array.isArray(value.pending) &&
      value.dispatched === value.settled + value.pending.length &&
      typeof value.settledDigest === "string" &&
      (value.settled === 0 ? value.settledDigest === "" : /^[a-f0-9]{64}$/.test(value.settledDigest)),
    "invalid Scene response receipt",
  );
  const parts = JSON.parse(value.signature);
  memoryRequire(
    Array.isArray(parts) && parts.length === 5 && parts[0] === value.sceneId,
    "Scene response signature changed",
  );
  const owner = { id: value.sceneId, villageSeed: value.villageSeed };
  for (const claim of value.pending) {
    memoryObject(claim, ["token", "bodyId", "attemptId", "epoch"]);
    memoryRequire(
      typeof claim.token === "string" &&
        claim.token.startsWith(hash(value.signature) + ":") &&
        typeof claim.attemptId === "string" &&
        !!claim.attemptId &&
        Number.isSafeInteger(claim.epoch) &&
        claim.epoch >= 0 &&
        claim.epoch <= value.epoch &&
        claim.bodyId === operationResponseBodyId(owner, claim.token),
      "invalid Scene response publication claim",
    );
  }
  memoryRequire(
    new Set(value.pending.map((claim) => claim.token)).size === value.pending.length,
    "duplicate Scene response publication claim",
  );
  if (Object.hasOwn(value, "selected")) {
    memoryObject(value.selected, ["ref", "token"]);
    const ref = readOperationEvidenceReference(value.selected.ref);
    memoryRequire(
      value.settled > 0 && !value.pending.some((claim) => claim.token === value.selected!.token),
      "selected Scene response has not settled",
    );
    memoryRequire(
      typeof value.selected.token === "string" &&
        value.selected.token.startsWith(hash(value.signature) + ":") &&
        ref.id === operationResponseBodyId(owner, value.selected.token),
      "Scene response selection belongs to another request",
    );
  }
  memoryRequire((value.status === "complete") === Object.hasOwn(value, "selected"), "invalid Scene response selection");
  return value;
}

/** Dispatch claims precede model work; immutable response bodies precede Scene adoption. */
export function createSceneResponseReceipts(documents: CapabilityDocumentStore) {
  const mutate = createDocumentMutator(() => documents),
    evidence = operationEvidenceStore(documents);
  function slot(scope: OperationEvidenceScope, signature: string) {
    return {
      kind: "generation-response",
      name: "Saved Scene response",
      description: "Private purchased response and unresolved dispatch identities",
      label: () => "Saved Scene response",
      coerce: (raw: unknown): Receipt =>
        raw === undefined
          ? {
              format: 1,
              purpose: "scene",
              sceneId: scope.id,
              villageSeed: scope.villageSeed ?? "",
              signature,
              status: "pending",
              epoch: 0,
              attemptId: "",
              pending: [],
              dispatched: 0,
              settled: 0,
              settledDigest: "",
            }
          : structuredClone(readSceneResponseReceipt(raw, scope, signature)),
    };
  }
  async function settle(
    scope: OperationEvidenceScope,
    signature: string,
    claim: Claim,
    ref: OperationEvidenceReference,
  ) {
    let selected: Receipt["selected"];
    await mutate(sceneResponseReceiptId(signature), slot(scope, signature), (receipt) => {
      selected = receipt.selected;
      const index = receipt.pending.findIndex((row) => row.token === claim.token);
      if (index < 0) return false;
      memoryRequire(
        JSON.stringify(receipt.pending[index]) === JSON.stringify(claim),
        "response publication identity changed",
      );
      receipt.pending.splice(index, 1);
      receipt.settled++;
      receipt.settledDigest = hash([receipt.settledDigest, claim.token, ref.digest]);
      if (receipt.epoch === claim.epoch && receipt.status !== "rejected" && !receipt.selected) {
        receipt.selected = { ref, token: claim.token };
        receipt.status = "complete";
      }
      selected = receipt.selected;
    });
    return selected;
  }
  async function readReceipt(scope: OperationEvidenceScope, signature: string) {
    const row = await documents.getById("villages", sceneResponseReceiptId(signature));
    if (!row) return undefined;
    memoryRequire(
      row.id === sceneResponseReceiptId(signature) &&
        row.kind === "generation-response" &&
        row.packageId === "villages",
      "Scene response owner identity changed",
    );
    return readSceneResponseReceipt(row.data, scope, signature);
  }
  async function read(scope: OperationEvidenceScope, signature: string) {
    const receipt = await readReceipt(scope, signature);
    if (!receipt) return undefined;
    for (const claim of receipt.pending) {
      const body = await documents.getById("villages", claim.bodyId);
      if (!body) continue;
      const found = validateOperationEvidence(body, scope);
      memoryRequire(found.data.claim === claim.token, "response publication claim changed");
      const selected = await settle(scope, signature, claim, found.ref);
      if (selected)
        return { ref: selected.ref, claim: selected.token, value: await evidence.read(selected.ref, scope) };
    }
    return receipt.selected
      ? {
          ref: receipt.selected.ref,
          claim: receipt.selected.token,
          value: await evidence.read(receipt.selected.ref, scope),
        }
      : undefined;
  }
  async function begin(scope: OperationEvidenceScope, signature: string, attemptId: string, retry: boolean) {
    const token = hash(signature) + ":" + randomUUID();
    let claim!: Claim, selected: Receipt["selected"];
    await mutate(sceneResponseReceiptId(signature), slot(scope, signature), (receipt) => {
      selected = receipt.selected;
      if (selected) return false;
      if (receipt.dispatched && !retry)
        throw new VillagesRequestError(
          409,
          "The previous request may have been billed. Explicitly retry the saved request.",
          "OPERATION_INTERRUPTED",
        );
      claim = { token, bodyId: operationResponseBodyId(scope, token), attemptId, epoch: receipt.epoch };
      receipt.pending.push(claim);
      receipt.dispatched++;
      receipt.status = "pending";
      receipt.attemptId = attemptId;
    });
    return selected
      ? { cached: { ref: selected.ref, claim: selected.token, value: await evidence.read(selected.ref, scope) } }
      : { claim };
  }
  async function retain(scope: OperationEvidenceScope, signature: string, claim: Claim, value: unknown) {
    return withRepairWork(async () => {
      const receipt = await readReceipt(scope, signature);
      const pending = receipt?.pending.find((pending) => pending.token === claim.token);
      // Retirement removes the dispatch owner first; an old callback cannot recreate its body.
      if (!pending)
        return receipt?.selected
          ? {
              ref: receipt.selected.ref,
              claim: receipt.selected.token,
              value: await evidence.read(receipt.selected.ref, scope),
            }
          : undefined;
      memoryRequire(JSON.stringify(pending) === JSON.stringify(claim), "response publication identity changed");
      const prepared = prepareOperationValue(value, scope, claim.token);
      await evidence.publish(new Map([[prepared.ref.id, prepared.data]]));
      const selected = await settle(scope, signature, claim, prepared.ref);
      return selected
        ? { ref: selected.ref, claim: selected.token, value: await evidence.read(selected.ref, scope) }
        : undefined;
    });
  }
  async function reject(
    scope: OperationEvidenceScope,
    signature: string,
    attemptId: string,
    expected: OperationEvidenceReference,
  ) {
    readOperationEvidenceReference(expected);
    await mutate(sceneResponseReceiptId(signature), slot(scope, signature), (receipt) => {
      if (
        !receipt.selected ||
        receipt.selected.ref.id !== expected.id ||
        receipt.selected.ref.digest !== expected.digest
      )
        return false;
      receipt.epoch++;
      receipt.attemptId = attemptId;
      receipt.status = "rejected";
      delete receipt.selected;
    });
  }
  return { read, begin, retain, reject };
}
