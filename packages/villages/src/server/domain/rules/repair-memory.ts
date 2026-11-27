import type { VillageState } from "../models/world.js";
import type { ContinuityRecord, ContinuityVersion } from "../models/continuity-model.js";
import { continuityActor } from "./continuity-actors.js";
import { continuityHolderKey, CONTINUITY_TEXT_BYTES, protectContinuity } from "./continuity.js";
import { badRequest, conflict } from "./errors.js";
import { memoryHash } from "./memory-integrity.js";
import type { ContinuityClass } from "../models/continuity-model.js";
import { ownedContinuityClass } from "./continuity.js";

/** Explicit administration creates one account without rewriting evidence or another person's wording. */
export function addRepairMemory(
  state: VillageState,
  operationId: string,
  personId: string,
  text: string,
  at: string,
  source?: { recordId: string; personId: string; versionId: string },
  meaning?: {
    class: ContinuityClass;
    subjects: (string | { id: string; incarnation: string })[];
    priorVersionId?: string;
    priorHolderId?: string;
    current: boolean;
    closed?: "fulfilled" | "withdrawn" | "ended";
    parentId?: string;
    facet?: ContinuityVersion["facet"];
  },
) {
  const holder = continuityActor(state, personId);
  if (!holder || !text.trim() || Buffer.byteLength(text) > CONTINUITY_TEXT_BYTES)
    throw badRequest("Choose a person and enter a shorter memory.");
  const collection = structuredClone(state.continuity),
    key = continuityHolderKey(holder);
  const inherited =
    meaning?.priorVersionId && collection.versions.find((version) => version.id === meaning.priorVersionId);
  const priorHolder = meaning?.priorHolderId ? continuityActor(state, meaning.priorHolderId) : holder;
  const priorKey = priorHolder && continuityHolderKey(priorHolder);
  if (
    meaning?.priorVersionId &&
    (!inherited ||
      !priorKey ||
      !collection.records.find((root) => root.id === inherited.rootId)?.heads[priorKey] ||
      collection.records.find((root) => root.id === inherited.rootId)!.heads[priorKey]!.versionId !== inherited.id)
  )
    throw conflict("The original memory account changed.");
  const fingerprint = memoryHash(
    meaning ? [source ?? null, personId, text, meaning] : [source ?? null, personId, text],
  );
  const receipt = collection.receipts[operationId];
  if (receipt) {
    if (receipt.fingerprint !== fingerprint) throw conflict("This repair ID already has another edit.");
    return receipt.roots[0];
  }
  const prior = source && collection.records.find((record) => record.id === source.recordId);
  const parentId = meaning?.parentId ?? (inherited?.class === meaning?.class ? inherited?.parentId : undefined);
  const parent = parentId && collection.records.find((root) => root.id === parentId);
  if (parentId && (!parent?.owner || !parent.heads[key]))
    throw conflict("The selected person's parent account changed.");
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
    ...(parent && parent.owner
      ? { owner: structuredClone(parent.owner) }
      : meaning && ownedContinuityClass(meaning.class)
        ? { owner: holder }
        : {}),
  };
  const version: ContinuityVersion = {
    id: "continuity-version-" + memoryHash([record.id, operationId, key]).slice(0, 32),
    rootId: record.id,
    createdRevision: collection.revision + 1,
    text,
    // Teaching records knowledge of the saved wording, not another person's desire or commitment.
    class: meaning?.class ?? "information",
    about: (meaning?.subjects ?? []).map((value) => {
      const actor = continuityActor(state, typeof value === "string" ? value : value.id);
      if (
        typeof value !== "string" &&
        inherited &&
        inherited.about.some((prior) => prior.id === value.id && prior.incarnation === value.incarnation)
      )
        return { ...value };
      if (!actor || (typeof value !== "string" && value.incarnation !== actor.incarnation))
        throw badRequest("Choose a current person or an existing saved subject.");
      return { id: actor.id, incarnation: actor.incarnation };
    }),
    sources: [],
    at,
    operationId,
    administrative: { holder, at },
    ...(meaning?.parentId || (inherited?.class === meaning?.class && inherited?.parentId)
      ? { parentId: meaning?.parentId ?? inherited!.parentId, facet: meaning?.facet ?? inherited?.facet }
      : {}),
    ...(meaning?.closed ? { closed: { reason: meaning.closed } } : {}),
  };
  record.heads[key] = {
    holder,
    versionId: version.id,
    revision: 1,
    current: meaning?.closed ? false : (meaning?.current ?? true),
  };
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
  return record.id;
}

/** Keep only the selected owner's private facets attached to their corrected root. */
export function moveRepairMemoryFacets(
  state: VillageState,
  previous: ContinuityVersion,
  replacement: string,
  personId: string,
  operationId: string,
  at: string,
  newOwner = personId,
) {
  const holder = continuityActor(state, personId)!,
    key = continuityHolderKey(holder);
  const next = state.continuity.records.find((root) => root.id === replacement),
    head = next?.heads[continuityHolderKey(continuityActor(state, newOwner)!)],
    meaning = head && state.continuity.versions.find((v) => v.id === head.versionId);
  if (!meaning || meaning.class !== previous.class || !ownedContinuityClass(meaning.class)) return;
  const children = state.continuity.records.flatMap((root) => {
    const head = root.heads[key],
      version = head && state.continuity.versions.find((v) => v.id === head.versionId);
    return version?.parentId === previous.rootId && !root.protection[key]?.forgotten ? [{ root, head, version }] : [];
  });
  children.forEach(({ root, head, version }, index) => {
    addRepairMemory(state, operationId + "-facet-" + index, newOwner, version.text, at, undefined, {
      class: version.class,
      subjects: version.about,
      priorVersionId: version.id,
      priorHolderId: personId,
      current: head.current,
      ...(version.closed ? { closed: version.closed.reason } : {}),
      parentId: replacement,
      facet: version.facet,
    });
    state.continuity = protectContinuity(
      state.continuity,
      { id: root.id, recordRevision: root.revision, heads: { [key]: head.revision } },
      [holder],
      operationId + "-old-facet-" + index,
      at,
      { forget: true },
    );
  });
}
