import { request } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import type { VillageSpinOffOriginView } from "../../shared/types.js";
import { useEffect, useRef, useState } from "react";

/** A house with a way back into it. The only icon in the package's chrome. */
function SpinOffHomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9.5V20h13V9.5" />
      <path d="M9.5 16.5h5" />
    </svg>
  );
}

// ── RETIRED 0.4.43 — the tick and the ring. ──────────────────────────────────
// Two of the three icons this package's chrome had, both of them about a press
// that no longer exists. `SceneDoneIcon` marked a scene that had just been read
// back, and `SceneBusyIcon` a chat being read right now; and on a one-way lane
// there is no reading, so the chip has one state and one icon.
//
// Kept rather than deleted because they are the only drawing of a state this
// package ever had in someone else's chat, and a later lane that reads anything
// back — a memory, a summary — would want them again. Reviving them means
// reviving `phase` in `useChatSpinOff` first, which is where the state machine
// and its four names were argued out.
//
// /** A tick, for a scene that has just been read back. */
// function SceneDoneIcon() {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2.5"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       aria-hidden="true"
//     >
//       <path d="M4 12.5 9.5 18 20 6.5" />
//     </svg>
//   );
// }
//
// /** A ring, for a scene being read back right now. */
// function SceneBusyIcon() {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2.5"
//       strokeLinecap="round"
//       className={`${ELEMENT_TAG}-spin`}
//       aria-hidden="true"
//     >
//       <path d="M12 3a9 9 0 0 1 9 9" />
//       <path d="M12 21a9 9 0 0 1-9-9" opacity=".35" />
//     </svg>
//   );
// }
// The stylesheet's `-spin` keyframes and its `[data-state="done"]` rule on the
// tracker are left in place with nothing to match, the same way the `-gate*`
// rules were: both are small, both are still correct if the states come back, and
// neither costs anything while they do not.

/**
 * Where the Engine keeps which of its chats this browser has open.
 *
 * The key is the Engine's, and writing it is the whole of this package's ability
 * to take the player anywhere. There is no URL router in the Engine to send them
 * to a chat with: opening a chat is a write to a store this tab has no way in
 * to, and the store's own starting value is read out of this key
 * (`stores/chat.store.ts`, `STORAGE_KEY`). One key in one browser is what a
 * package can reach.
 *
 * It is declared here, beside the one press that uses it, and deliberately not up
 * with the request helpers: those are a single unbroken run of code and
 * `tests/villages-remote-access.regression.ts` reads the run out of this file and
 * runs it, so a constant wedged between the header builder and the admin-secret
 * hint would be caught there as a broken module rather than as a stray key. A
 * fact that has to keep its distance from a proof has found its own place.
 */
const ACTIVE_CHAT_STORAGE_KEY = "marinara-active-chat-id";

/**
 * Put the player back in the village: out of the chat, and on the tab that owns
 * it.
 *
 * The mirror of `leaveForChat`, and the same one key. The Engine reads this key
 * to decide whether it is showing a chat or the home screen
 * (`components/layout/AppShell.tsx`, where the whole shell is built around
 * `activeChatId`), and its own recovery path clears the same key to get back to
 * the top. Removing it is therefore not a trick played on a store: it is the
 * Engine's own way of saying "no chat", and a load later the player is on Home
 * with their chats and their tabs in front of them.
 *
 * What it deliberately does NOT do is name the tab for them. No package can put
 * the player on the Villages tab — the tab the Engine last had open is stored in
 * the Engine's own UI persistence blob, and writing one key inside a versioned
 * blob this package does not own is the kind of thing that breaks on the next
 * upgrade. Home is one click from here and the copy says so.
 *
 * ponytail: the ceiling is the same as `leaveForChat`'s — a real page load, one
 * click short of the tab. The upgrade path is an Engine-side navigation
 * capability for packages, which does not exist
 * (`shared/src/schemas/capability-package.schema.ts`). Player-pressed only, and
 * never fired by anything but a click.
 */
function leaveForVillage(): void {
  try {
    window.localStorage.removeItem(ACTIVE_CHAT_STORAGE_KEY);
  } catch {
    //  Same as above: the load still happens, and Home is still where a browser
    //  with no remembered chat opens.
  }
  window.location.reload();
}

/**
 * Where this roleplay came from, if it came from the village.
 *
 * Two surfaces ask this question about the same chat — the chip in the chat's own
 * chrome and the body in the Engine's tracker panel — because the player asked
 * for both and said they would like to see which they prefer. They are one read
 * and one press, and sharing them here is what keeps that true: two surfaces that
 * answered differently, or that made one read each for one chat, would be one
 * feature wearing two names.
 *
 * IT CANNOT FAIL, WHICH IS WHY THERE IS NO PHASE MACHINE. It used to have one —
 * `idle`/`busy`/`done`/`failed` — because the press here read a scene back and a
 * model call can go wrong. In 0.4.43 there is nothing to call: the chat is an
 * ordinary roleplay the village has already let go of, and the only press left is
 * "Open the village", which is a page load. So the surfaces draw one card and no
 * spinner, and a read that fails is the same as a chat that did not come from the
 * village: the surfaces draw nothing.
 *
 * `known` is false until a read has actually answered, and it stays false when a
 * read fails. The surfaces draw nothing until the village has spoken, because a
 * chat that has nothing to do with the village should not wear a line saying so,
 * and a village route having a bad day is not a fact to put in the chrome of
 * somebody else's chat. The server answers `null` — not an error — for a chat
 * with no stamp, which is most roleplay chats in the player's library.
 */
function useChatSpinOff(chatId: string, enabled: boolean) {
  const [origin, setOrigin] = useState<VillageSpinOffOriginView | null>(null);
  const [known, setKnown] = useState(false);

  useEffect(() => {
    //  A second chat in the same element position is a different question, so the
    //  answer from the last one is dropped before the new one is asked for —
    //  including the answer that there was nothing to find.
    setKnown(false);
    setOrigin(null);
    if (!enabled) return;
    const controller = new AbortController();
    void (async () => {
      try {
        const answer = await request<VillageSpinOffOriginView | null>(`/spinoffs/${encodeURIComponent(chatId)}`, {
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        //  A null body is a chat the village never made, which is the same
        //  answer as a chat it has forgotten — either way there is nothing to
        //  draw, so it is normalised here rather than at each caller.
        setOrigin(answer ?? null);
        setKnown(true);
      } catch {
        //  Silent on purpose. See above: silence is an answer here, and the only
        //  alternative is a sentence about this package's problems in a chat
        //  that may have nothing to do with it.
      }
    })();
    return () => controller.abort();
  }, [chatId, enabled]);

  return { origin, known };
}

/**
 * The village's one control inside a roleplay chat the player is already in.
 *
 * THE OTHER HALF OF THE DRAWER'S SPIN-OFF SECTION, and the half that could not be
 * put anywhere else. A spin-off is an ordinary Engine chat, so the player leaves
 * this tab to be in it — and the moment they are standing in it is the moment
 * they may want to go back and look at the village it came from. Nothing in this
 * tab can see that moment: the `home-browser-tab` slot is not mounted while a
 * chat is open, and no village route is told when a chat is opened. The Engine's
 * own chat toolbar is the only surface that is there, so this is drawn in it.
 *
 * IT SAYS WHOSE CHAT THIS IS, which is the whole of what is left to say. A chat
 * made from a village looks exactly like every other chat, and a player who does
 * not connect this one to the place it came from has no reason to believe the
 * village is a place they can be. So the chip carries the word VILLAGES next to
 * its house and opens with the sentence that names the village.
 *
 * IT APPEARS ONLY IN A SPIN-OFF. Every roleplay chat in the player's library
 * mounts this element, and a chip offering "Open the village" in a chat with
 * nobody from the village in it would be a control about a place that has nothing
 * to do with what is on screen. So the first thing the chip does is ask where
 * this chat came from, and if the answer is nowhere it draws nothing at all. That
 * read is silent when it fails, deliberately: it runs once for every roleplay
 * chat the player opens, and a village route having a bad day is not a thing to
 * put in the chrome of a chat that has nothing to do with the village.
 *
 * IT OFFERS NOTHING BACK, because there is nothing here to give. Until 0.4.43 the
 * first button read the chat back into the village; that is retired, and what is
 * left is the way to the village itself. The note underneath says the one-way
 * fact out loud — the village took a picture of itself when this chat began and
 * has not looked at it since — because a player who believes the village is
 * reading their roleplay would be right to wonder who is waiting on them.
 */
export function SpinOffToolbar({ props }: { props: Record<string, unknown> }) {
  const chatId = typeof props.chatId === "string" ? props.chatId : "";
  const inRoleplayChat = props.chatMode === "roleplay";
  const compact = props.mobileCompact === true;
  const hostButtonClass = typeof props.toolbarButtonClass === "string" ? props.toolbarButtonClass : "";
  const { origin, known } = useChatSpinOff(chatId, inRoleplayChat && chatId.length > 0);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLSpanElement | null>(null);

  //  A different chat closes whatever was open about the last one.
  useEffect(() => setOpen(false), [chatId, inRoleplayChat]);

  /*
    Closing is the menu's own business, and this is the whole of it: a press
    anywhere that is not the chip or the menu itself, or Escape. No focus trap
    and no backdrop, deliberately — this hangs off a button in the chat's own
    chrome rather than covering the chat, and the paragraph the player came here
    to read stays readable behind it.
  */
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (root.current?.contains(event.target as Node)) return;
      setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!inRoleplayChat || !known || origin === null) return null;

  const name = origin.name || "your villager";
  const where = origin.villageName || "your village";
  const chipLabel = `Villages — this roleplay spun off from ${where}`;

  return (
    <span className={`${ELEMENT_TAG}-tracker`} data-compact={compact} data-open={open} ref={root}>
      <button
        type="button"
        className={
          hostButtonClass
            ? `${hostButtonClass} ${ELEMENT_TAG}-tracker-chip`
            : `${ELEMENT_TAG}-button ${ELEMENT_TAG}-tracker-chip`
        }
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        title={chipLabel}
        aria-label={chipLabel}
      >
        <SpinOffHomeIcon />
        <span className={`${ELEMENT_TAG}-tracker-label`}>Villages</span>
      </button>
      {open ? (
        <div className={`${ELEMENT_TAG}-tracker-menu`} role="menu" aria-label={`Villages — ${where}`}>
          <p className={`${ELEMENT_TAG}-tracker-menu-title`}>This roleplay spun off from {where}</p>
          {origin.resident ? (
            <p className={`${ELEMENT_TAG}-tracker-menu-note`}>
              {name} still lives there. {where} was photographed into this chat the moment it was made, and has not
              looked at it since: nothing said here is read, counted or kept by the village.
            </p>
          ) : (
            <p className={`${ELEMENT_TAG}-tracker-menu-note`}>
              {name} does not live in {where} any more. This chat is yours either way — it was let go of the moment it
              was made, and nothing in the village is waiting on it.
            </p>
          )}
          <p className={`${ELEMENT_TAG}-tracker-menu-note`}>
            It is an ordinary chat in your own list. Renaming it, keeping it or deleting it changes nothing about the
            village.
          </p>
          <div className={`${ELEMENT_TAG}-tracker-menu-row`}>
            {/* Leaving the chat is a page load — the Engine has no way for a
                package to put the player on a screen without one — so the button
                says where it lands rather than pretending to be instant. */}
            <button
              type="button"
              className={`${ELEMENT_TAG}-button`}
              onClick={leaveForVillage}
              title={`Leaves this chat and opens Marinara's home screen, where the ${where} tab is waiting.`}
            >
              Open the village
            </button>
          </div>
        </div>
      ) : null}
    </span>
  );
}

/**
 * The same answer, said at length, where the player keeps their tracker panels.
 *
 * THE SECOND OF THE TWO SURFACES, and it exists because the player asked for both
 * rather than because the first was wrong: the chip is where the eye already is,
 * and a sidebar is where a player who wants to be told something looks. What that
 * costs is duplication, and what pays for it is `useChatSpinOff` — one read, one
 * answer, drawn twice.
 *
 * It is drawn for EVERY roleplay chat once the package is enabled, because the
 * Engine mounts one element per package per open panel and this package cannot be
 * told which chats are its own. So the honest answer for a chat that did not come
 * out of a village is the line saying so, which is also the line that tells the
 * player this panel exists at all and what it is for.
 *
 * WHAT IT DRAWS IS PROVENANCE AND NOTHING ELSE. There used to be a line count and
 * a "waiting until they come home" sentence; both were about a village that was
 * holding the chat, and this one is not holding anything. The rows name the
 * villager, the village and the chat, which is everything the stamp recorded —
 * and the chat's own name is drawn because the player may have renamed it since
 * and this is the only place that says which paste-up it is.
 *
 * The Engine supplies the card, the veil and the heading; this contributes the
 * body and nothing else. See the panel-view rules in the stylesheet.
 */
export function SpinOffPanel({ props }: { props: Record<string, unknown> }) {
  const chatId = typeof props.chatId === "string" ? props.chatId : "";
  const inRoleplayChat = props.chatMode === "roleplay";
  const { origin, known } = useChatSpinOff(chatId, inRoleplayChat && chatId.length > 0);

  //  Nothing at all until the village has answered, including when the answer
  //  was a failure: see `useChatSpinOff`.
  if (!inRoleplayChat || !known) return null;

  if (origin === null) {
    return (
      <div className={`${ELEMENT_TAG}-panel-view`}>
        <p className={`${ELEMENT_TAG}-tracker-menu-note`}>
          This chat did not come out of a village. A roleplay started from Villages says so here.
        </p>
      </div>
    );
  }

  const name = origin.name || "this villager";
  const where = origin.villageName || "your village";
  return (
    <div className={`${ELEMENT_TAG}-panel-view`}>
      <p className={`${ELEMENT_TAG}-tracker-menu-note`}>
        {origin.resident
          ? `This roleplay spun off from ${where}, and ${where} has not looked at it since. Nothing said here is read, counted or kept by the village.`
          : `This roleplay spun off from ${where}, and ${name} does not live there any more. Nothing said here is read by the village either way.`}
      </p>
      <div className={`${ELEMENT_TAG}-panel-view-row`}>
        <span className={`${ELEMENT_TAG}-panel-view-key`}>Villager</span>
        <span>{name}</span>
      </div>
      <div className={`${ELEMENT_TAG}-panel-view-row`}>
        <span className={`${ELEMENT_TAG}-panel-view-key`}>Chat</span>
        <span>{origin.room}</span>
      </div>
      <div className={`${ELEMENT_TAG}-panel-view-row`}>
        <span className={`${ELEMENT_TAG}-panel-view-key`}>Came from</span>
        <span>{where}</span>
      </div>
      <div className={`${ELEMENT_TAG}-panel-view-actions`}>
        <button
          type="button"
          className={`${ELEMENT_TAG}-button`}
          onClick={leaveForVillage}
          title={`Leaves this chat and opens Marinara's home screen, where the ${where} tab is waiting.`}
        >
          Open the village
        </button>
      </div>
    </div>
  );
}
