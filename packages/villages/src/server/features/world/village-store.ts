import { VILLAGES_PACKAGE_ID, villagesDocuments } from "../../adapters/engine/runtime-host.js";
import { type DocumentSlot, mutateDocument } from "../../adapters/storage/document-store.js";
import { coerceVillageScene, coerceVillageState, defaultVillageState } from "../../domain/decoding/village-codec.js";
import type { VillageScene, VillageState } from "../../domain/models/world.js";
import { normalizeVillageMutation } from "../../domain/rules/world-mutation.js";
import { worldRelationships } from "./world-relationships.js";

export { type DocumentSlot } from "../../adapters/storage/document-store.js";

export { mutateDocument } from "../../adapters/storage/document-store.js";

export {
  defaultVillageState,
  coerceRemap,
  coerceTownMapView,
  coerceVillageState,
  coerceVillageScene,
} from "../../domain/decoding/village-codec.js";

// Villages — the village record and shared document store helpers.
//
// Both live in the Engine's package document store as JSON, which means a write
// is a read-modify-write against an `expectedRevision`. `mutate*` below loops
// on that: a mismatch means somebody else wrote first, so re-read and re-apply
// rather than clobbering. The updater is caller-supplied and runs once per
// attempt, so it must be pure with respect to the state it is handed.

const VILLAGE_DOC_ID = "villages-village";
const VILLAGE_DOC_KIND = "village";
const VILLAGE_DOC_NAME = "Village record";
// RETIRED 0.4.43 — the scene lane's return path. Kept, not called.
//
// 0.4.43 made a spin-off ONE WAY: the package takes a snapshot of the village as
// it stands, builds an ordinary Engine roleplay out of it, and then stops caring.
// There is no longer any fact about a spin-off for the village to hold, so nothing
// in this package reads or writes the documents below any more. They are left in
// the code — and the kind below is deliberately left with its old value — so that
// the shape is on hand if a use for it turns up, and so that a village upgrading
// from 0.4.42 does not have to have its old `villager-scene` documents migrated,
// deleted, or even acknowledged. A document nobody reads is a document nobody has
// to trust; the files stay on disk, untouched and unread, and this package no
// longer has an operation that could write one.
const SCENE_DOC_KIND = "villager-scene";

/**
 * Document ids are a global primary key shared by every package, so the
 * transcript id embeds the village's own package prefix.
 */
/** The same rule for the player's own copy of the conversation. */
export function chatLogDocumentId(characterId: string): string {
  return `villages-chatlog-${characterId}`;
}

/**
 * The same rule again for the link to a villager's Engine spin-off.
 *
 * RETIRED 0.4.43 — the scene lane's return path. Kept, not called.
 *
 * One document per villager rather than one list, because a link is a fact about
 * a villager: it has to be readable when that villager's row is drawn, and a list
 * would be a single document every spawn rewrites, which is a document two spawns
 * can lose each other's writes on for no reason.
 */
export function sceneDocumentId(characterId: string): string {
  return `villages-scene-${characterId}`;
}

const villageSlot: DocumentSlot<VillageState> = {
  kind: VILLAGE_DOC_KIND,
  name: VILLAGE_DOC_NAME,
  description: "The village's own record of itself, kept by the Villages package.",
  coerce: coerceVillageState,
  label: (state) => state.name,
};

// ── Village record ───────────────────────────────────────────────────────────

export async function readVillageAuthority(): Promise<VillageState> {
  const record = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, VILLAGE_DOC_ID);
  return coerceVillageState(record?.data);
}
/** Read-only ledger snapshot for feeds and diagnostics; never applies an outbox. */
export async function readVillageSnapshot(): Promise<VillageState> {
  const state = await readVillageAuthority();
  if (state.seed) {
    const { readRelationshipState, reconcileRelationships } = worldRelationships();
    state.relationshipContext = await readRelationshipState(state.seed);
    reconcileRelationships(state.relationshipContext, state);
  }
  return state;
}
export async function readVillageState(): Promise<VillageState> {
  const state = await readVillageSnapshot();
  if (state.seed) {
    const { readRelationshipState, reconcileRelationships } = worldRelationships();
    const { projectSocialActivities, processSocialOutbox, reconcileSocialPlans } = worldRelationships();
    if (await processSocialOutbox(state)) {
      const refreshed = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, VILLAGE_DOC_ID);
      Object.assign(state, coerceVillageState(refreshed?.data));
      state.relationshipContext = await readRelationshipState(state.seed);
      reconcileRelationships(state.relationshipContext, state);
    }
    reconcileSocialPlans(state);
    projectSocialActivities(state);
  }
  return state;
}

/**
 * Apply a change to the village and persist it, retrying on a revision conflict.
 *
 * The founding stamp is applied here rather than inside each mutation so it
 * cannot be forgotten: the village starts keeping its own time at the first
 * write that creates or touches it, and every later write leaves the stamp
 * alone. That is what makes the derived clock stable — `foundedAt` is written
 * once and never recomputed.
 */
export async function mutateVillageState(mutate: (state: VillageState) => void): Promise<VillageState> {
  let next = defaultVillageState();
  await mutateDocument(VILLAGE_DOC_ID, villageSlot, async (state) => {
    const relationshipSeed = state.seed;
    if (relationshipSeed) {
      const { readRelationshipState, reconcileRelationships } = worldRelationships();
      state.relationshipContext = await readRelationshipState(relationshipSeed);
      reconcileRelationships(state.relationshipContext, state);
    }
    normalizeVillageMutation(state, relationshipSeed, mutate);

    next = state;
  });
  const { persistRelationshipAuthority } = worldRelationships();
  await persistRelationshipAuthority(next);
  return next;
}

// ── Scenes ───────────────────────────────────────────────────────────────────
//
// RETIRED 0.4.43 — the scene lane's return path. Kept, not called.
//
// Everything below this line stored a LINK between a villager and an Engine chat,
// and the whole point of 0.4.43 is that the package no longer keeps one. A
// spin-off is written once into the chat's own metadata and then forgotten about,
// so no function here is reachable from any route, any service or any cell in the
// tab. They are exported and they are correct and they are unused, which is
// deliberate: the shape is worth keeping on hand, they cost a player nothing by
// existing, and deleting them would delete the only written record of how a link
// was shaped. `SCENE_DOC_KIND` above is left with its 0.4.42 value for the same
// reason, so that documents a 0.4.42 village left on disk stay readable by the
// code that could read them, and stay unread by the code that actually runs.

/**
 * Read one villager's link to their Engine scene, or the BLANK scene.
 *
 * A blank scene — every field empty — is this record's way of saying "there is
 * no link", and the reason it is expressed as an empty record rather than as
 * `null` is `mutateDocument`: the write path coerces whatever is on disk, hands
 * the result to the caller's updater and commits it, so a coercer that answered
 * `null` would give the spawn path nothing it could fill in and a scene could
 * never be created in the first place. Every other slot in this file has the
 * same shape for the same reason.
 *
 * What the blank scene means is therefore a question for the READER, and
 * `readVillageScene` is where it is answered: an empty `chatId` is not a scene,
 * and every caller that wants that distinction asks there. This is the one
 * record in the file whose emptiness is a real state rather than a corruption,
 * because `chatId` is not a property of the record — it IS the record. There is
 * no safe way to repair a missing one: inventing an id binds the villager to some
 * chat that is not theirs, and looking one up by guessed criteria is the village
 * claiming to know something it does not.
 *
 * Everything that is genuinely optional is repaired the usual way, and
 * `characterId` is taken from the DOCUMENT ID rather than from the body. The
 * document id is the one thing that cannot disagree with the villager it is
 * filed under, so reading the body's copy would be reading a second opinion on a
 * question that has already been answered.
 */

function sceneSlot(characterId: string): DocumentSlot<VillageScene> {
  return {
    kind: SCENE_DOC_KIND,
    name: "Villager scene",
    description: "A link to the Engine roleplay chat one villager's scene lives in.",
    coerce: (data) => coerceVillageScene(characterId, data),
    label: (scene) => scene.chatName,
  };
}

/**
 * Read the link for one villager, or null when they have no scene.
 *
 * The `null` here is the whole of the distinction between "this villager has a
 * scene" and "this villager does not", and it is derived rather than stored:
 * see `coerceVillageScene` for why the record cannot carry it directly.
 */
export async function readVillageScene(characterId: string): Promise<VillageScene | null> {
  const record = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, sceneDocumentId(characterId));
  const scene = coerceVillageScene(characterId, record?.data);
  return scene.chatId.length > 0 ? scene : null;
}

/**
 * Every scene in the village, keyed by character id.
 *
 * One list call rather than one read per villager, because this is what the
 * listing route opens with and a villager with no scene should cost nothing to
 * skip. The kind is filed under the package's own id, so this cannot see another
 * package's documents.
 */
export async function listVillageScenes(): Promise<Map<string, VillageScene>> {
  const records = await villagesDocuments().list(VILLAGES_PACKAGE_ID, SCENE_DOC_KIND);
  const scenes = new Map<string, VillageScene>();
  for (const record of records) {
    if (!record.id.startsWith("villages-scene-")) continue;
    const characterId = record.id.slice("villages-scene-".length);
    if (characterId.length === 0) continue;
    const scene = coerceVillageScene(characterId, record.data);
    if (scene.chatId.length > 0) scenes.set(characterId, scene);
  }
  return scenes;
}

/**
 * Apply a change to one villager's scene and persist it.
 *
 * Written through `mutateDocument` like everything else, so the retry on a
 * revision conflict is the shared one. The updater is handed the BLANK scene when
 * there is no link yet and is expected to fill it in — the same contract the
 * village record and the transcripts have, and the reason the slot is not
 * nullable. "Spawn a scene for a villager who already has one" is a real case
 * that has to be able to reuse the existing link rather than making a second
 * chat, so the updater is also allowed to see a populated scene and do nothing.
 */
export async function mutateVillageScene(characterId: string, mutate: (scene: VillageScene) => void): Promise<void> {
  await mutateDocument(sceneDocumentId(characterId), sceneSlot(characterId), mutate);
}

/**
 * Forget the link to a villager's scene. Never the Engine chat it pointed at.
 *
 * The counterpart of `removeChatLog`, and for the same reason: the package may
 * only ever delete things it owns. Dropping the link is the whole of "forget the
 * scene", and the chat stays in the Engine with every message in it, exactly as
 * it would if the player had deleted the package.
 */
export async function removeVillageScene(characterId: string): Promise<void> {
  const documents = villagesDocuments();
  const documentId = sceneDocumentId(characterId);
  const record = await documents.getById(VILLAGES_PACKAGE_ID, documentId);
  if (!record) return;
  await documents.remove(VILLAGES_PACKAGE_ID, documentId, record.revision);
}
