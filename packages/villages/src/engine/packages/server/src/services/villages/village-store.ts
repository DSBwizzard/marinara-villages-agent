import { type DocumentSlot, mutateDocument } from "./document-store.js";
import { VILLAGES_PACKAGE_ID, villagesDocuments } from "./runtime-host.js";
import type { VillageScene, VillageState, VillageVenue } from "./types.js";
import { initializeVenueAccess, reconcileVenueAccess } from "./venue-access.js";
import { assertVillageVenueCapacity, villageVenueUsage } from "./venue-capacity.js";
import { synchronizeVenueZones } from "./venue-zones.js";
import { randomVillageSeed } from "./village-clock.js";
import { coerceVillageScene, coerceVillageState, defaultVillageState } from "./village-codec.js";
import { pruneWishActivities } from "./wish-policy.js";
import { worldRelationships } from "./world-relationships.js";

export { type DocumentSlot } from "./document-store.js";

export { mutateDocument } from "./document-store.js";

export {
  defaultVillageState,
  coerceRemap,
  coerceTownMapView,
  coerceVillageState,
  coerceVillageScene,
} from "./village-codec.js";

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

// ── Coercion ─────────────────────────────────────────────────────────────────
// Stored JSON is untrusted. Only the current schema is accepted; obsolete venue
// records are discarded because pre-0.5 villages are intentionally not migrated.

/**
 * The last refused translation attempt, or null when there is not enough of it to
 * be one.
 *
 * Both halves are required, for the reason a venue needs a name: a failure with no
 * time on it cannot be read as recent or as stale, and a failure with no sentence
 * on it is a badge with nothing behind it. A record that half-parses is dropped
 * rather than completed with a guess, and dropping it costs only the explanation —
 * the translation it explains was never written either way, so nothing on the
 * villager is left claiming a state it cannot support.
 *
 * Read through the same trust boundary as everything else here even though the
 * village wrote it, because the document is on disk and a player can edit it.
 */

/**
 * One thing a villager wishes for, or null when there is not enough of it to be one.
 *
 * A wish with no `wish` in it is dropped rather than kept as a blank line, which
 * is the same rule a venue follows. The tell is allowed to be empty: a wish the
 * village could not think of a surface for is still a wish, and it still colours
 * the villager's own voice.
 *
 * Neither date is repaired, and that is the one thing this reader does
 * differently from the rest of the file. Everywhere else a missing field is
 * filled with a safe default, but a wish's two dates are the only record of when
 * it was written and when it dies, and inventing either would put a date in the
 * debug tab that nobody ever chose. Both go through `asInstant`, so an empty one
 * and an unreadable one arrive downstream as the same "": an empty `expiresAt`
 * means the wish does not age, which is the right answer for everything written
 * before the field existed — such a wish can still be fulfilled or judged to
 * have lapsed, and arithmetic it never agreed to can never delete it.
 */

/**
 * What a villager wishes for, or null when they have not been written for.
 *
 * Null is returned for anything that is not a record at all, so a hand-edited
 * document, a null, a string and a missing field all land on "ask the model
 * again" rather than on a villager who stands there wishing for nothing.
 *
 * A record with a title but no wishes is kept as an empty agenda instead. That is
 * the one case where asking genuinely produced nothing, and re-asking on every
 * part of every day would be the village spending a model call to learn the same
 * nothing.
 */

/** * How this villager's week happens here, or null when there is not enough of it
 * to be a translation.
 *
 * The null rule is the agenda's rule with one more condition, and the extra
 * condition is the whole point of the record. A translation with no `weekStart`
 * cannot be compared against the Engine's week, so it can never be recognised as
 * stale — it would be a cache entry with no key, retranslated never and replaced
 * never. Such a record is dropped here rather than stored, and the villager
 * reads the Engine's own sentence until the Engine hands the village a week to
 * key on.
 *
 * A `signature` is NOT required, and it is the one field of this record that is
 * allowed to be missing. A document written before signatures existed holds the
 * week and the moves and not the digest, and there is no way to recompute it
 * here — the places and the setting that went into it are not in this function's
 * hands, and a digest invented from what IS here would either match forever or
 * never, depending on whether the guess agreed with the writer. So a missing one
 * is stored as an EMPTY string, which reads as a record that no signature can be
 * compared against, and `remapNeedsWriting` treats that as owed-a-translation
 * rather than as up to date. One wasted call, once, per villager, and then the
 * village is on the new scheme for good.
 *
 * `attempts` is bounded rather than trusted. It is the count that decides when
 * the village stops asking about a move a model will not copy back, so a
 * hand-edited document that set it to a thousand would silence a villager's week
 * forever. It is clamped to `MAX_REMAP_ATTEMPTS`, which is the highest value
 * that means anything.
 *
 * Everything else about it is total in both directions. A move with no key or no
 * sentence is dropped, a duplicate key keeps the first, and the caps are the same
 * ones the writer used — a hand-edited document is bounded exactly as a model's
 * answer is. An EMPTY move list is kept, and that is deliberate: a week the
 * village asked about and was told nothing worth saying is a week it must not ask
 * about again on every part of every day.
 *
 * Exported because it is a trust boundary rather than because the package calls
 * it from elsewhere: it is the one place a stored translation is bounded, those
 * bounds decide whether a villager is translated again at all, and a reader that
 * can only be exercised through a live document store is a reader whose clamping
 * has never been looked at.
 */

/**
 * One move, with the key the list is de-duplicated by handed back alongside it.
 *
 * The pair is returned rather than the move alone because the key is built out of
 * the day and the hour range by the lookup's own rule and building it a second
 * time at the call site is how the two get out of step. Both halves are required:
 * a key with no sentence would render as an empty "Right now you are ." and a
 * sentence with no key can never be found, so either alone is a row the village
 * would carry and never read.
 *
 * The key is `day|hour range`, NOT the activity sentence, and that is the whole
 * shape change of this release. A sentence is not a slot in a week: a villager
 * who sleeps at eleven every night has ONE sentence and SEVEN hours, and keyed by
 * sentence the seventh night could never be told from the first. Keyed by slot,
 * every hour of the week gets its own entry, which is what lets the tab print the
 * Engine's event and the village's event side by side for any hour of the day.
 *
 * An entry written under the OLD scheme therefore has no usable day or time and
 * is dropped, which makes the whole record read as incomplete and re-asks for the
 * week. That is the intended cost and it is paid once: a half-readable record
 * would be worse — the entries that happened to carry a plausible `day` field
 * would resolve, the rest would quietly render as the village's default, and the
 * result would look like a translation that had forgotten most of the week.
 *
 * The place rides along and is NOT validated against the venues here, which is
 * deliberate and is the whole reason the writer stored an id instead of a name:
 * a place that has since been renamed, or deleted, or belongs to a week written
 * before the village had any places at all is a miss at READ time, and a miss
 * draws exactly what no place draws. Filtering here would be a second opinion
 * about what a valid place is, held in the reader, disagreeing with the writer
 * the first time either changed.
 *
 * The wish rides along beside it and is not validated either, for the same reason
 * and with one extra turn of the screw: a wish is REPLACED when it is answered, so
 * an id that no longer appears anywhere in the villager's agenda is the ordinary
 * outcome of a wish having been fulfilled rather than a sign of damage. Nothing
 * looks it up — the influence it records is already inside the `here` phrase — so
 * the worst a stale id can do is read as a name the debug tab cannot resolve,
 * which is exactly what it is. A reader that pruned it would be deleting the
 * record of which wish bent which hour on nothing but the news that the wish had
 * been answered.
 */

/**
 * A place that is not a house needs a name to be a place at all, because the
 * name is the whole of what the translation list says about it; the note is what
 * a character's own verb gets translated into, so an unnamed place that is not a
 * house is dropped rather than kept as a blank row in the player's editor. A
 * HOUSE is allowed to be nameless, because the village has no name for one — it
 * knows "Bram's house", which is a sentence about Bram. An id is minted when one
 * is missing so the tab always has a stable key, even against a hand-edited
 * document.
 *
 * Everything else is optional, and each absence reads as a real state rather
 * than as damage. A place with no picture is ordinary. A place with no position
 * is one the village knows about and cannot point at — see `asFraction` for why
 * a position is not clamped, and note that the two coordinates are read together
 * and dropped together, because half a position is not a position. A place with
 * no building is a place rather than a house, which is the ordinary state for
 * most of them — only a building this village does not know falls back to the
 * one kind there is, rather than costing the player the place.
 *
 * The player's home never holds a villager (it is their house, not a
 * resident's), so any occupant recorded against it is discarded rather than
 * trusted, and a place that is not a home holds nobody at all.
 */

/**
 * The picture a place is drawn with, as it comes back out of a document.
 *
 * A reference is only worth keeping if all of it is well formed, so anything
 * less is dropped to null rather than half-kept. A ref with no url cannot be
 * drawn, and a url with no ref is a picture nothing protects from deletion —
 * and a village that stored the second would show art that could vanish the
 * moment the player tidied their gallery. Both failures read as "no picture",
 * which costs the player a gradient rather than a broken image.
 *
 * A missing id is DERIVED from the ref rather than treated as a failure: the
 * two name the same picture, which is the only thing the id is for here, so a
 * document that lost one still resolves.
 */

/**
 * Every place the village holds, with the two rules no single place can check
 * for itself: only one of them is the player's, and a character lives in one
 * place at a time.
 *
 * Both are enforced here rather than trusted, because a duplicate would
 * otherwise make every reader of `venues` disagree about where someone lives.
 * Duplicates are dropped rather than merged: which one the player meant cannot
 * be guessed from here, and keeping both would make "your home" ambiguous
 * everywhere it is read.
 *
 * The cap is `MAX_PLACES` rather than `MAX_VENUES`: this list holds the houses
 * too, and the translator's smaller budget is applied where it belongs — see
 * `remapVenues`.
 */

/**
 * One notice off the board.
 *
 * Boards written before a note carried an author are plain strings, and those
 * are READ rather than discarded: every one of them is a note the player typed
 * themselves, so dropping them on upgrade would be throwing away their writing
 * to make a schema tidy. An unsigned note is also an ordinary thing to find on
 * a real board, so the same shape serves both.
 */

/**
 * One happening.
 *
 * A part of day this village does not know is kept as an empty string rather
 * than repaired to something nearby: it still says what happened, and only the
 * filing of it is lost. The day it is filed under is what the writing key is
 * compared against, so an unfilable entry can never make the village think it
 * has already written for the part of day it is actually in.
 */

/**
 * One person a memory is about.
 *
 * A bare string is accepted as well as an object, because the actor list is
 * written by a model and by the chat path and both are untrusted; a name is
 * worth keeping even when nothing else about the entry is joinable. A name is
 * what the line renders with, so an actor without one is dropped rather than
 * kept as an anonymous entry that would render as nothing.
 */

/**
 * One memory.
 *
 * The rules here all point the same way: an entry that says something is kept,
 * and only the parts that cannot be read are lost. A scope nobody recognises
 * reads as the SHARED one, because that is the answer that tells every villager
 * something true rather than nothing at all — a private memory filed as shared
 * is a rumour, and a shared memory filed as private is a fact only one person
 * knows, which is the more expensive mistake.
 *
 * `dayIndex` mirrors `coerceHappening` exactly, including the fallback to 0:
 * an unreadable day reads as the OLDEST thing the village knows, never as
 * today. Filing a corruption as "now" would make a villager announce it as
 * current, which is the one direction that invents an event.
 *
 * `at` is read for display only and never repaired to "now" when it is
 * unreadable — a stamp nobody wrote is worse than no stamp, because it looks
 * like evidence.
 *
 * `kind` falls back to "tick" and `weight` to absent, which are both the
 * ordinary case: a memory of an afternoon is what this record is mostly made of,
 * and an entry written before weight existed trims as if it were weight 1. The
 * fallback for `kind` is deliberately not "favour" — a favour outranks every
 * ordinary memory when the chronicle is full, so an unreadable entry has to land
 * on the side that can be forgotten rather than on the side that cannot.
 */

/**
 * A stored map is only usable if it is a base64 image data URL inside the cap,
 * so anything else — a hand-edited record, a half-finished write, a picture
 * saved when the limit was larger — reads as "no map yet" instead of reaching
 * an `<img src>` as a broken image. Deliberately not truncated to fit: half a
 * base64 payload is a corrupt picture, not a smaller one.
 */

/**
 * Which parts of the day the village may be written for automatically.
 *
 * The absent case and the empty case are deliberately different answers, and
 * this is the one place that distinction is drawn. An absent list is a record
 * written before this preference existed, and reads as all four, so upgrading
 * changes nothing about a village that was already updating itself. An empty
 * list is a player who switched every part of day off, and has to survive the
 * round trip: reading it as "no preference" and refilling it would silently
 * undo the only way to say "only when I am watching".
 *
 * Unknown entries are dropped rather than repaired. A part of day this version
 * does not know is not one of these four, so keeping it would put a switch in
 * the settings panel that cannot be turned off.
 */

/** A 0..100 position in the picture, or null when the value is not one. */

/** How far the picture is magnified, or null when the value is not a usable one. */

/**
 * How the stored picture is framed, from either a record or a request.
 *
 * Exported because a submitted framing means the same thing as a stored one:
 * "this is how the picture should sit in the frame". Each field falls back on
 * its own rather than the whole view being thrown away — these are four
 * independent readings of one picture, and a view with a good focus and a
 * nonsense zoom still says where the picture was pointed. Nothing is REPAIRED,
 * though: an out-of-range number takes the shipped default rather than being
 * clamped to the nearest edge, because a player who typed 500 asked for
 * nothing, and silently handing them the far edge would look like it worked.
 */

// ── Shared read/write plumbing ───────────────────────────────────────────────

/**
 * Everything the store needs to know about one document: what it is called in
 * the panel, and how to make a stored blob safe to read.
 *
 * `label` is deliberately given the coerced state rather than the raw record,
 * so a document can name itself after its own contents ("Willowbrook") instead
 * of carrying a name nobody reads.
 */

/**
 * Read-modify-write one document. `mutate` receives the coerced value and
 * returns whatever the caller wants back; returning normally means "the
 * mutation should be committed". An explicit false skips an unchanged write.
 */

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
    const previousVenues = new Map(state.venues.map((venue) => [venue.id, structuredClone(venue)]));
    const previousCapacity = villageVenueUsage(state);
    mutate(state);
    if (state.seed !== relationshipSeed) delete state.relationshipContext;
    const capacity = villageVenueUsage(state);
    if (capacity.total > previousCapacity.total || capacity.nonResidential > previousCapacity.nonResidential)
      assertVillageVenueCapacity(state);
    for (const resident of state.villagers)
      for (const entry of state.wishKnowledge[resident.characterId] ?? []) {
        if (
          (entry.status && entry.status !== "active") ||
          resident.agenda?.wishes.some((wish) => wish.id === entry.wishId)
        )
          continue;
        const outcome = resident.wishLifecycle?.pendingOutcomes.find((outcome) => outcome.wish.id === entry.wishId);
        entry.status = outcome?.kind === "fulfilled" ? "fulfilled" : "expired";
      }
    // Assign notice order in the same document write as its committed effect.
    for (const receipt of Object.values(state.exchangeReceipts))
      if (receipt.notice && !receipt.noticeSequence) {
        receipt.noticeSequence = ++state.noticeSequence;
        receipt.committedAt = new Date().toISOString();
      }
    for (const venue of state.venues) {
      synchronizeVenueZones(venue, previousVenues.get(venue.id));
      if (!previousVenues.has(venue.id) && state.venues.some((entry) => entry.access)) initializeVenueAccess(venue);
      else if (venue.access) initializeVenueAccess(venue);
      reconcileVenueAccess(venue, ["player", ...state.villagers.map((person) => person.characterId)]);
      const previous = previousVenues.get(venue.id);
      const semanticAccess = (entry: VillageVenue) =>
        JSON.stringify({
          managers: entry.access?.managerIds,
          hours: entry.access?.visitorHours,
          zones: entry.zones?.map((zone) => ({ id: zone.id, ownerId: zone.ownerId, policy: zone.access })),
          residents: entry.residentIds,
          workers: entry.workerIds,
          playerHome: entry.occupancy.playerHome,
          permissions: entry.access?.permissions.map(({ sceneId: _scene, ...permission }) => permission),
          bans: entry.access?.bans,
          exceptions: entry.access?.exceptions,
          denials: entry.access?.visitDenials,
        });
      if (
        previous?.access &&
        venue.access &&
        previous.access.revision === venue.access.revision &&
        semanticAccess(previous) !== semanticAccess(venue)
      ) {
        venue.access.revision++;
        venue.access.changes.push({
          id: randomVillageSeed(),
          revision: venue.access.revision,
          actorId: "system",
          zoneId: null,
          action: "lifecycle",
          at: new Date().toISOString(),
          sourceLineIds: [],
        });
      }
    }
    pruneWishActivities(state, new Date());
    if (state.foundedAt.length === 0) state.foundedAt = new Date().toISOString();
    if (state.seed.length === 0) state.seed = randomVillageSeed();
    // Relationship authority lives in its own seed-scoped document, never the village DTO.
    delete state.relationshipContext;
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
