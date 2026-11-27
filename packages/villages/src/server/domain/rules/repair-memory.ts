import type { VillageState } from "../models/world.js";
import type { ContinuityRecord, ContinuityVersion } from "../models/continuity-model.js";
import { continuityActor } from "./continuity-actors.js";
import { continuityHolderKey, CONTINUITY_TEXT_BYTES } from "./continuity.js";
import { badRequest, conflict } from "./errors.js";
import { memoryHash } from "./memory-integrity.js";

/** Explicit administration creates one account without rewriting evidence or another person's wording. */
export function addRepairMemory(
  state: VillageState,
  operationId: string,
  personId: string,
  text: string,
  at: string,
  source?: { recordId: string; personId: string; versionId: string },
) {
  const holder = continuityActor(state, personId);
  if (!holder || !text.trim() || Buffer.byteLength(text) > CONTINUITY_TEXT_BYTES)
    throw badRequest("Choose a person and enter a shorter memory.");
  const collection = structuredClone(state.continuity),
    key = continuityHolderKey(holder);
  const fingerprint = memoryHash([source ?? null, personId, text]);
  const receipt = collection.receipts[operationId];
  if (receipt) {
    if (receipt.fingerprint !== fingerprint) throw conflict("This repair ID already has another edit.");
    return;
  }
  const prior = source && collection.records.find((record) => record.id === source.recordId);
  if (source && !prior) throw conflict("This memory changed.");
  if (prior?.heads[key])
    throw conflict("This person already has an account. Open their memory to change or restore it.");
  if (source && prior) {
    const actor = continuityActor(state, source.personId),
      sourceKey = actor && continuityHolderKey(actor);
    const head = sourceKey && prior.heads[sourceKey];
    const original = collection.versions.find((version) => version.id === source.versionId);
    if (
      !head ||
      head.versionId !== source.versionId ||
      prior.protection[sourceKey!]?.forgotten ||
      original?.rootId !== prior.id ||
      original.text !== text
    )
      throw conflict("The selected saved account changed. Reopen it before adding a person.");
  }
  const record: ContinuityRecord = prior ?? {
    id: "continuity-record-" + memoryHash([state.seed, operationId]).slice(0, 32),
    revision: 0,
    heads: {},
    protection: {},
  };
  const version: ContinuityVersion = {
    id: "continuity-version-" + memoryHash([record.id, operationId, key]).slice(0, 32),
    rootId: record.id,
    createdRevision: collection.revision + 1,
    text,
    // Teaching records knowledge of the saved wording, not another person's desire or commitment.
    class: "information",
    about: [],
    sources: [],
    at,
    operationId,
    administrative: { holder, at },
  };
  record.heads[key] = { holder, versionId: version.id, revision: 1, current: true };
  record.protection[key] = { operationId, at, repair: { versionId: version.id }, sourceUnits: [] };
  record.revision++;
  if (!prior) collection.records.push(record);
  collection.versions.push(version);
  collection.revision++;
  collection.receipts[operationId] = {
    fingerprint,
    roots: [record.id],
    versions: [version.id],
  };
  state.continuity = collection;
}
