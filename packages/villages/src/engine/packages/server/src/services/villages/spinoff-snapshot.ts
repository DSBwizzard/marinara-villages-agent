import type { VillagerCard } from "./catalog.js";
import { MAX_MESSAGE_LENGTH, renderSceneContextBlock, type VillagePromptContext } from "./chat.js";
import { villageEngineJson } from "./engine-transport.js";
import { boundText, MAX_ENGINE_ID_LENGTH, MAX_SPINOFF_NAME_LENGTH } from "./prompt-preset.js";
import { villagesLogger, villagesPersistence } from "./runtime-host.js";
import type { VillageState } from "./types.js";

// Villages — the snapshot a spin-off is given, and the two places it is left.
//
// A spin-off is ONE WAY. The package takes the village, the villager and the
// drawer conversation as they stand at the instant the player presses the button,
// hands that to an ordinary Engine roleplay, and then stops caring: no per-turn
// contribution, no write-back, no lock, no record of the chat anywhere in the
// village's documents. See `spinoff.ts` for the lane; this file is the answer to
// the one question the lane cannot avoid, which is HOW a frozen block gets in
// front of a model that runs on the player's own preset.
//
// WHY A FROZEN BLOCK IS THE ANSWER AT ALL, since the obvious objection is that it
// goes stale. The alternative — the old design — was a `prompt-context`
// contributor that re-derived the villager's day on every turn and appended it to
// the system message. It never goes stale, and it is exactly what the player
// asked to be rid of: it means the villager in the chat is being updated by a
// village that is still happening off-screen, learns things the player never told
// them, and answers to somebody else's clock. A snapshot cannot do any of that.
// What it CAN do is answer the question the villager would actually be asked at
// the start of a scene — who am I with, where are we, what is going on today —
// and that question has one answer at one moment. After the first line the
// conversation is the player's, and everything the villager learns from then on
// they learn from the player. That is what taking somebody somewhere means.
//
// WHY TWO CARRIERS, and both. There is no route in the Engine that says "add this
// text to this chat's prompt forever". The two that come closest are:
//
//   1. A CONSTANT LOREBOOK ENTRY, scoped to this chat alone. `constant: true`
//      means the entry activates on every generation without needing a keyword —
//      the Engine's own scanner says so — and `position: 0` puts it in the
//      world-info-before slot, sorted constant-first, where it reads as facts
//      about the world rather than as a line the villager might say. It is
//      attached by adding the book to the CHAT's own `activeLorebookIds`, in the
//      same metadata write that switches the package on inside the chat.
//
//      This is the good carrier and it is the one that matters. Its one soft spot
//      is that it only reaches the prompt where the preset has a world-info
//      marker to put it in, and presets are the player's to write; one with the
//      marker removed would silently drop the whole snapshot.
//
//   2. ONE `system` LINE AT THE TOP OF THE TRANSCRIPT. A real message row, so it
//      reaches the model through chat history instead of through a marker, under
//      any preset the Engine can run. The Engine's history expander keeps system
//      messages unless the preset explicitly asks it not to. Its soft spots are
//      the mirror image: it can fall out of the context window as the chat grows,
//      and the player can edit or delete it because it is theirs.
//
// Neither is sufficient alone and both together are. The lorebook survives the
// chat growing and cannot be edited away; the transcript row survives a preset
// with no markers. A snapshot that fails to influence the chat is the whole
// failure mode this file exists to prevent, and paying one extra message row for
// it is the cheapest insurance on offer.
//
// NOTHING HERE THROWS, and that is a rule rather than a habit. Every call in this
// file is made AFTER the Engine has already created the player's chat. By the time
// any of it runs the player has a working roleplay in their chat list; a missing
// snapshot makes that roleplay vaguer, and an exception makes it an error dialog
// in front of something that worked. Each carrier therefore fails on its own and
// logs, and the worst outcome of a total failure is a spin-off where the villager
// knows only what the Engine's own character card tells them — which is the
// roleplay the player would have got by pressing "new chat" themselves.

/** The Engine's own ceiling on a lorebook entry's name, which is not ours to pick. */
const MAX_ENTRY_NAME_LENGTH = 200;

/**
 * How much text the whole snapshot may be.
 *
 * This is the one number in the file that is a judgement rather than a limit
 * somebody else set, and it is deliberately generous. The block is the village's
 * own prompt box rendered with this villager's live values, and that box is
 * already capped by the package — `VILLAGES_PROMPT_BOX_MAX_LENGTH` in
 * `prompt-preset.ts` — so what this actually bounds is the FOLDED result, which
 * is the box plus the venue list, the routine and the homes. Four thousand
 * characters is about a thousand tokens: real room for a village's rules, and
 * small enough that a player who wrote a wiki into their prompt box does not eat
 * a meaningful share of their context window on the first line of every single
 * reply.
 *
 * Trimmed rather than refused, like everything else on this lane. A snapshot that
 * is one block short of complete is still a snapshot; a snapshot the package
 * declined to write because it was two characters too long is a chat with nothing
 * in it.
 */
const MAX_SNAPSHOT_LENGTH = 4_000;

/** The three things a snapshot needs, gathered by the caller that already had them. */
export type SpinOffSnapshotInput = {
  /** The chat the snapshot belongs to. The lorebook is scoped to it and nothing else. */
  chatId: string;
  /** The villager being taken somewhere. Their name is the snapshot's heading. */
  card: VillagerCard;
  /** The village WITH the player's identity folded in, as `buildPromptContext` needs it. */
  village: VillageState;
  /** The village's own blocks, already rendered for this villager by the caller. */
  context: VillagePromptContext;
};

/**
 * A fresh id for a message this package writes into an Engine chat.
 *
 * `crypto.randomUUID` is a Node global in every version the Engine supports, so
 * this needs no import — which matters here because Villages imports no Node
 * builtins at all and adding one for three ids would be a dependency the package
 * does not otherwise have.
 *
 * The fallback is not decoration. An id only has to be unique, and a package that
 * threw while opening a roleplay because a global was missing would turn a
 * cosmetic problem into a broken feature. A timestamp with four billion values in
 * it is unique enough for three messages written seconds apart in one process.
 */
export function spinOffMessageId(): string {
  const source = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  const uuid = typeof source?.randomUUID === "function" ? source.randomUUID() : "";
  if (uuid.length > 0) return uuid;
  return `villages-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/**
 * The snapshot as text: the village's own blocks, wrapped in what they are.
 *
 * The MIDDLE is `renderSceneContextBlock`, which is the same renderer the drawer
 * conversation uses, and reusing it is the point: what the villager knows when
 * they walk out of the village is exactly what they knew standing in it, down to
 * the wording, rather than a second rendering that could drift from it. It brings
 * its own heading and its own two framing lines.
 *
 * The FOOTING is the addition, and it is doing the work this whole file exists
 * for. The renderer ends by telling the villager that what it just read is true
 * "at this moment" — which it was, in the drawer, where the block was rebuilt
 * every turn. Here it is not true any more and will never become true again, and
 * a villager holding a page of facts with nothing to say the page is old will
 * treat every unanswered question in it as something they know the answer to.
 * They will invent the rest of the day rather than ask the player, and the
 * invented version is what the player then has to live with. One sentence saying
 * that this is a photograph, that the village has carried on without them, and
 * that the conversation is now the only thing that is moving, is what turns the
 * frozen-ness from a hole into a feature.
 *
 * The TITLE lands between the two and is short on purpose. It is there to stop
 * the heading of the renderer — a village and a villager, stated flatly — from
 * reading as live world info in a chat whose preset the player chose, and it
 * reads as a camera rather than a narrator because "snapshot" is the one word
 * that already means "this was true when it was taken".
 *
 * All of it is in the second person, matching the renderer. The Engine may fold
 * this into the chat's system message alongside the character's own system
 * prompt, and a block that switched between "you" and "Rosa" halfway down would
 * read as two speakers.
 */
export function renderSpinOffSnapshotBlock(input: SpinOffSnapshotInput): string {
  const body = renderSceneContextBlock(input.card, input.village, input.context).trim();
  if (body.length === 0) return "";
  const villageName = input.village.name.trim() || "the village";
  const title = `### A snapshot of ${villageName}, taken once, on the day this roleplay began`;
  const frozen =
    `That snapshot is all you have of ${villageName}, and none of it has been updated since. You have had no news ` +
    "from home — whatever has happened there in the meantime is not something you know, and not something you can " +
    "answer for. Everything you and the person you are with learn from here on, you learn from each other.";
  return boundText([title, "", body, "", frozen].join("\n"), MAX_SNAPSHOT_LENGTH);
}

/**
 * Leave the snapshot in the chat, in both the places the Engine will read.
 *
 * Answers the lorebook id, or a blank string when there is no book to point the
 * chat at — which is the ordinary outcome of a partial failure and not an error.
 * The caller passes the answer straight into `activateSpinOffChat`, which is the
 * only reason it is returned rather than kept here: the chat's `activeLorebookIds`
 * belongs in the same metadata write as the rest of what the spawn puts there,
 * and two writes to that column are two chances to lose one of them.
 *
 * An empty block means there was nothing for the village to say — a village with
 * blank prompt boxes and a villager with nothing live about them — and it is
 * treated as success with nothing to do. Writing a heading and a footing around
 * no facts at all would be putting words in the villager's mouth to no purpose.
 */
export async function writeSpinOffSnapshot(input: SpinOffSnapshotInput): Promise<string> {
  const block = renderSpinOffSnapshotBlock(input);
  if (block.length === 0) return "";
  const lorebookId = await writeSnapshotLorebook(input, block);
  await writeSnapshotLine(input, block);
  return lorebookId;
}

/**
 * The lorebook half: one hidden book, scoped to this chat, holding one constant
 * entry.
 *
 * Hidden from the library and scoped to a chat the player may well delete, so it
 * is machinery rather than a lorebook anybody maintains. `scope.mode: "specific"`
 * with the chat's id is what keeps it out of every OTHER chat — a constant entry
 * in a book with no scope would ride along in every roleplay the player ever
 * opens, which is the most expensive possible way to get this wrong, and the
 * Engine's own schema makes `specific` the way to say "this one and no other".
 *
 * `generatedBy` is `"import"` and not `"villages"`, and that is not a mistake.
 * The Engine's schema accepts exactly four values for that field — user, agent,
 * import and lorebook-maker — so a package that sent its own name would be
 * sending a value the Engine will not store. `"import"` is the honest one of the
 * four: this book was made from something that already existed, unattended, by
 * machinery, which is what an import is.
 *
 * `sourceAgentId` is left null: a lorebook attributed to an agent is a lorebook
 * the Engine's own UI will offer as that agent's work, and this one is not a
 * spin-off of anybody's turn — it was written by a button press.
 *
 * Two calls rather than one because the entry carries the book's id, and the book
 * has to exist before its entry can. They are not transactional and deliberately
 * so: a book with no entry in it is an empty book, which does nothing, which is
 * the same outcome as no book at all. The library write is the one that can leave
 * a harmless leftover, and the alternative — a single call that could half-apply —
 * is not a thing the Engine offers.
 */
async function writeSnapshotLorebook(input: SpinOffSnapshotInput, block: string): Promise<string> {
  const logger = villagesLogger();
  try {
    const book = await villageEngineJson<{ id?: unknown }>("/api/lorebooks", {
      body: {
        name: boundText(`${input.card.name} — ${input.village.name}`, MAX_SPINOFF_NAME_LENGTH),
        description:
          "A frozen snapshot of the village as it stood when this roleplay began. Written once by the Villages " +
          "package and never updated; safe to delete, and deleting it will not affect anything apart from how much " +
          "the character remembers about where they came from.",
        generatedBy: "import",
        sourceAgentId: null,
        enabled: true,
        // Out of the player's lorebook list, because it is not something they
        // wrote, not something they can meaningfully edit, and not a thing they
        // should have to tidy up per chat. It is still attached to the chat and
        // still injected; hidden means hidden from the library, not disabled.
        hiddenFromLibrary: true,
        scope: { mode: "specific", chatIds: [input.chatId] },
      },
    });
    const lorebookId = boundText(book?.id, MAX_ENGINE_ID_LENGTH);
    if (lorebookId.length === 0) {
      logger.warn("[villages] the Engine made a lorebook for a spin-off and did not say which one it was");
      return "";
    }
    await villageEngineJson(`/api/lorebooks/${encodeURIComponent(lorebookId)}/entries/bulk`, {
      body: {
        entries: [
          {
            name: boundText(`${input.card.name} — where this roleplay came from`, MAX_ENTRY_NAME_LENGTH),
            content: block,
            // No keys, and none needed: a constant entry activates without them.
            // Anything in this list would be dead weight the Engine's scanner
            // reads on every generation to conclude what `constant` already said.
            keys: [],
            constant: true,
            enabled: true,
            position: 0,
            role: "system",
            // Ahead of every ordinary entry at the same position, because it is
            // context for the chat rather than something the story triggered.
            order: 100,
            // The snapshot must not be able to pull OTHER lorebook entries into
            // the prompt by mentioning them, or a village that names a spellbook
            // in its voice rules would be turning the player's library inside out
            // from a hidden book they cannot see.
            preventRecursion: true,
          },
        ],
      },
    });
    return lorebookId;
  } catch (error) {
    logger.warn("[villages] could not leave a snapshot lorebook in spin-off chat %s: %s", input.chatId, String(error));
    return "";
  }
}

/**
 * The transcript half: the same text, once, as the chat's first system line.
 *
 * Written BEFORE the villager's opening line, so it reads as the setting of the
 * scene rather than as a note somebody added afterwards, and so that the opening
 * line is the last thing in the chat when the player arrives — the first thing
 * they read should be the villager, not the package.
 *
 * The villager's own character id is attached, matching the shape the opening
 * line writes with. A system row is not the villager speaking and no Engine UI is
 * obliged to show it that way, but the field is what the Engine's writer takes and
 * an unattributed row is a shape nothing in this package would otherwise produce —
 * so the one being written here is the one already known to be accepted.
 *
 * The player can edit or delete this row, and that is fine. It is their chat, the
 * lorebook still holds the snapshot whether this line survives or not, and a
 * package that hid text from its host inside a message the player owns would be
 * lying to them about their own transcript.
 */
async function writeSnapshotLine(input: SpinOffSnapshotInput, block: string): Promise<void> {
  const logger = villagesLogger();
  try {
    await villagesPersistence().createMessageWithSwipe({
      id: spinOffMessageId(),
      swipeId: spinOffMessageId(),
      chatId: input.chatId,
      role: "system",
      characterId: input.card.id,
      content: boundText(block, MAX_MESSAGE_LENGTH),
      extra: {},
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    // `chat-write` refused, or a chat that vanished between the two calls. The
    // lorebook is the carrier that matters and it has already been written.
    logger.warn("[villages] could not write the snapshot line into spin-off chat %s: %s", input.chatId, String(error));
  }
}
