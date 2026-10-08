import { EXPLORATION_STYLES } from "../features/exploration/villages-exploration-styles.js";
import { VILLAGES_FORGING_STYLES } from "../features/founding/villages-forging-styles.js";
import { DOSSIER_STYLES } from "../features/residents/villages-dossier-styles.js";
import { SCENE_ASIDE_STYLES } from "../features/scenes/villages-scene-asides.js";
import { VILLAGES_SCENE_STYLES } from "../features/scenes/villages-scene-styles.js";
import { ELEMENT_TAG, STYLE_ID } from "../shared/constants.js";

const VILLAGES_STYLES = `
/*
  THE TAB'S OWN SIZES, DECLARED ONCE AND READ EVERYWHERE.

  Two of them: the padding a screen keeps from its own edge, and the gap between
  the things on it. Those are the two that have to answer to the room the tab was
  given, because a phone has a third of the height a monitor has and cannot afford
  the same margin twice over. Both are written so that a wide, tall tab gets
  exactly the numbers this sheet was tuned against before there was a scale at all
  — 1.25rem and 1rem — and simply gets less when there is less.

  What is deliberately NOT here is the type. Every font-size in this sheet stays
  the size it has always been, on every device. GachaForge shrinks its type with
  its frame because its game is a 16:9 stage that has to fit inside the box
  whole, and words that do not shrink with the picture do not fit the picture.
  This tab is a panel and not a stage: its prose wraps and its lists scroll, and
  a list that scrolls is not improved by being printed smaller. Twelve-pixel body
  text is as legible on a phone as it is on a monitor, and what a phone actually
  needs is its room back — which is what the fullscreen toggle on the map and the
  queries at the foot of this sheet are for.

  0.4.45 took the word "landscape" out of that sentence, and out of one more in
  this sheet, and put nothing in its place. The tab is drawn for whichever way up
  a phone is held now, so the size a phone is told to print at no longer has a
  side to it; see the PORTRAIT block at the foot of the sheet for what replaced
  the instruction to turn over.

  Both numbers are measured against the TAB rather than the window: the tab
  shares the screen with the Engine's own furniture and takes the whole screen in
  fullscreen, and a window query cannot tell those two apart.
*/
.${ELEMENT_TAG}-root {
  --${ELEMENT_TAG}-pad: clamp(.625rem, 2cqw, 1.25rem);
  --${ELEMENT_TAG}-gap: clamp(.5rem, 1.4cqw, 1rem);
  display: flex;
  flex-direction: column;
  gap: var(--${ELEMENT_TAG}-gap);
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  padding: var(--${ELEMENT_TAG}-pad);
  color: var(--foreground);
}
.${ELEMENT_TAG}-header { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: .75rem; }
.${ELEMENT_TAG}-title { margin: 0; font-size: 1.5rem; font-weight: 600; letter-spacing: -.01em; }
.${ELEMENT_TAG}-subtitle { margin: .125rem 0 0; font-size: .75rem; color: var(--muted-foreground); }
.${ELEMENT_TAG}-panel {
  border: 1px solid var(--border);
  border-radius: .75rem;
  background: var(--popover);
  padding: .875rem 1rem;
}
.${ELEMENT_TAG}-panel-title { margin: 0 0 .625rem; font-size: .6875rem; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--muted-foreground); }
.${ELEMENT_TAG}-villagers { display: grid; gap: .625rem; grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr)); }
.${ELEMENT_TAG}-villager { display: flex; gap: .625rem; align-items: flex-start; }
.${ELEMENT_TAG}-avatar {
  position: relative;
  display: flex; align-items: center; justify-content: center;
  flex: 0 0 auto; width: 2.25rem; height: 2.25rem;
  border-radius: 999px; border: 1px solid var(--border);
  background: var(--background);
  font-size: .875rem; font-weight: 600;
  overflow: hidden;
}
/* The circle is the frame, so the picture gives up its own shape to it rather
   than the frame growing around whatever the Engine happened to store. The
   card's own avatar crop is drawn on top of this by the picture's own styles —
   see avatarCropStyle — which is why the frame is what clips it: a framing is
   drawn by enlarging the picture and pushing the rest of it out of the box, and
   a box that did not clip would be a frame with the whole photograph still
   around it. A crop in the older zoom-and-offset format is a transform on this
   same picture, and one in the current format replaces this rule's geometry
   outright; both end up framed by the circle and neither needs a second rule. */
.${ELEMENT_TAG}-avatar > img { display: block; width: 100%; height: 100%; object-fit: cover; }
/*
  The Engine's own person mark, for the one face in this drawer that is nobody's
  picture.

  It is what the Engine draws for the player in its own chats, and it is here
  rather than an initial for the reason an initial is right for a villager and
  wrong for the player: a villager's name is on the map in front of the player,
  and the player's is whatever they called themselves in the wizard, in whatever
  language, possibly one word and possibly five, said in a village that may know
  them by something else entirely. A letter off the front of that is a guess about
  which word a person goes by, and the person mark guesses nothing at all. The
  AvatarFace component draws it.

  Sized in em rather than in rem so that it takes the frame's own scale: the two
  frames here set their own font-size for the initial they used to draw, and a
  mark that read against that initial is one that reads in both. It is drawn a
  little larger than the initial beside it because a line drawing with air inside
  it reads smaller than a block of type at the same measure. The stroke is
  currentColor and the path is filled nowhere, so the mark takes the frame's own
  colour the way a picture would have taken its own.
*/
.${ELEMENT_TAG}-person { width: 1.5em; height: 1.5em; }
.${ELEMENT_TAG}-villager-name { font-size: .8125rem; font-weight: 600; }
.${ELEMENT_TAG}-villager-role { font-size: .6875rem; color: var(--muted-foreground); }
.${ELEMENT_TAG}-villager-note { margin: .375rem 0 0; font-size: .75rem; line-height: 1.45; color: var(--muted-foreground); }
.${ELEMENT_TAG}-notices { margin: 0; padding-left: 1.1rem; display: grid; gap: .375rem; font-size: .75rem; line-height: 1.5; color: var(--muted-foreground); }
.${ELEMENT_TAG}-actions { display: flex; align-items: center; gap: .625rem; }
.${ELEMENT_TAG}-button {
  border: 1px solid var(--border);
  border-radius: .5rem;
  background: var(--background);
  color: var(--foreground);
  padding: .3125rem .625rem;
  font-size: .75rem;
  cursor: pointer;
}
.${ELEMENT_TAG}-button:hover { border-color: var(--primary); color: var(--primary); }
.${ELEMENT_TAG}-button:disabled { opacity: .6; cursor: default; }
.${ELEMENT_TAG}-button[data-active="true"] {
  border-color: var(--primary);
  color: var(--primary);
  box-shadow: inset 0 0 0 1px var(--primary);
}
/*
  The menu's options, gathered under headings rather than strung out in one row:
  everything that shows you the village under Village Management, and everything
  that changes how it behaves under General Settings. More groups are expected.
*/
.${ELEMENT_TAG}-menu-nav { display: flex; flex-direction: column; gap: .875rem; }
.${ELEMENT_TAG}-menu-group { display: flex; flex-direction: column; gap: .375rem; }
.${ELEMENT_TAG}-menu-group > .${ELEMENT_TAG}-panel-title { margin: 0; }
.${ELEMENT_TAG}-menu-group-buttons { display: flex; flex-wrap: wrap; gap: .5rem; }
.${ELEMENT_TAG}-menu-body { display: flex; flex-direction: column; gap: 1rem; }
.${ELEMENT_TAG}-roster { display: flex; flex-direction: column; gap: .375rem; margin-top: .75rem; }
.${ELEMENT_TAG}-roster-entry { min-width: 0; border: 1px solid var(--border); border-radius: .75rem; padding: .5rem .625rem; background: color-mix(in srgb, var(--popover) 92%, transparent); }
.${ELEMENT_TAG}-roster-row { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: .5rem; font-size: .75rem; }
.${ELEMENT_TAG}-roster-row > div:first-child { flex: 1 1 10rem; min-width: 0; }
.${ELEMENT_TAG}-roster-row > .${ELEMENT_TAG}-villager-name {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${ELEMENT_TAG}-status { font-size: .75rem; color: var(--muted-foreground); }
.${ELEMENT_TAG}-error { font-size: .75rem; color: var(--destructive, #e5484d); }
.${ELEMENT_TAG}-tile {
  display: flex; flex-direction: column; gap: .25rem;
  width: 100%; text-align: left;
  border: 1px solid var(--border); border-radius: .625rem;
  background: var(--background); color: inherit;
  padding: .625rem .75rem; cursor: pointer; font: inherit;
}
.${ELEMENT_TAG}-tile:hover { border-color: var(--primary); }
.${ELEMENT_TAG}-tile[data-selected="true"] { border-color: var(--primary); box-shadow: inset 0 0 0 1px var(--primary); }
.${ELEMENT_TAG}-tile-head { display: flex; align-items: center; gap: .5rem; }
.${ELEMENT_TAG}-tile-name { font-size: .8125rem; font-weight: 600; flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.${ELEMENT_TAG}-tile-summary { margin: 0; font-size: .75rem; line-height: 1.45; color: var(--muted-foreground); }
.${ELEMENT_TAG}-tile-meta { display: flex; flex-wrap: wrap; gap: .375rem; align-items: center; font-size: .6875rem; color: var(--muted-foreground); }
.${ELEMENT_TAG}-badge {
  border-radius: 999px; padding: .0625rem .375rem;
  border: 1px solid color-mix(in srgb, var(--destructive, #e5484d) 45%, transparent);
  color: var(--destructive, #e5484d); font-size: .625rem;
}
.${ELEMENT_TAG}-tag { border: 1px solid var(--border); border-radius: 999px; padding: .0625rem .375rem; font-size: .625rem; }
.${ELEMENT_TAG}-remove {
  flex: 0 0 auto; border: 1px solid var(--border); border-radius: .375rem;
  background: transparent; color: var(--muted-foreground);
  font-size: .6875rem; line-height: 1; padding: .25rem .375rem; cursor: pointer;
}
.${ELEMENT_TAG}-remove:hover { border-color: var(--destructive, #e5484d); color: var(--destructive, #e5484d); }
.${ELEMENT_TAG}-empty { margin: 0; font-size: .75rem; line-height: 1.55; color: var(--muted-foreground); }
.${ELEMENT_TAG}-search {
  width: 100%; box-sizing: border-box;
  border: 1px solid var(--border); border-radius: .5rem;
  background: var(--background); color: var(--foreground);
  padding: .375rem .5rem; font-size: .75rem; font-family: inherit;
}
.${ELEMENT_TAG}-picker-list { display: flex; flex-direction: column; gap: .375rem; margin-top: .625rem; max-height: 16rem; overflow-y: auto; }
.${ELEMENT_TAG}-picker-item { display: flex; align-items: center; gap: .625rem; border: 1px solid var(--border); border-radius: .5rem; padding: .5rem .625rem; }
.${ELEMENT_TAG}-picker-item[data-resident="true"] { opacity: .6; }
.${ELEMENT_TAG}-picker-text { flex: 1 1 auto; min-width: 0; }
/*
  A villager's conversation, as a Visual Novel stage over the whole map.

  IT USED TO BE A DRAWER DOWN THE RIGHT-HAND SHARE, and the shape changed because
  the Engine's own roleplay chats have a Visual Novel presentation and this is the
  village's version of it: the picture fills the tab, the villager stands in it,
  and the words are read a paragraph at a time in a card held just above the box
  the player types in. A card of that kind needs the width the whole tab has —
  the whole point of it is one paragraph set at a comfortable measure, and a
  paragraph in two fifths of a phone is a column of single words.

  It is still parked off the right edge and slides in rather than appearing, and
  the reason has not changed: the map is never resized out from under the pins
  just because the player started talking to somebody. Absolute positioning rather
  than fixed keeps it inside the tab — fixed would escape to the viewport and
  leave the Engine's own furniture behind — and the homepage's overflow: hidden
  is what clips the parked position. visibility is what takes the shut stage out
  of the tab order and the accessibility tree, since a translated box is still on
  the page.

  NO BORDER, NO RADIUS AND NO WIDTH, because it is the tab: a panel with an edge
  inside a tab that also has an edge is a picture in a frame inside a frame. The
  padding stays, and it is what the picture bleeds past — the stage layer is
  inset to this box, so the map behind the words runs to the tab's own edge
  rather than stopping a gutter short of it.

  The fill is still the theme's popover, because the layer above it — the head,
  the reader and the composer — is drawn over the picture in that colour at an
  opacity, and a picture with no fill under it would be a picture over whatever
  happened to be behind the tab.
*/
.${ELEMENT_TAG}-chat {
  position: absolute; inset: 0; z-index: 3;
  display: flex; flex-direction: column; gap: .75rem;
  min-height: 0;
  border-left: 0; border-radius: 0;
  background: var(--popover); padding: .875rem;
  transform: translateX(100%);
  visibility: hidden;
  transition: transform .28s ease, visibility 0s linear .28s;
}
.${ELEMENT_TAG}-chat[data-open="true"] {
  transform: translateX(0);
  visibility: visible;
  transition: transform .28s ease;
}
.${ELEMENT_TAG}-room-screen {
  position: relative; display: flex; height: 100%; min-height: 0; overflow: hidden;
}
.${ELEMENT_TAG}-room-screen > .${ELEMENT_TAG}-chat {
  position: relative; inset: auto; flex: 1 1 auto; min-width: 0;
  box-sizing: border-box; overflow: hidden; transform: none; visibility: visible; transition: none;
}
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-scene { pointer-events: none; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-head {
  align-items: center;
}
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-actions {
  width: 100%; justify-content: flex-end; margin-left: 0;
}
.${ELEMENT_TAG}-room-stars {
  position: absolute; z-index: 4; top: 4.25rem; left: .875rem;
  display: grid; gap: .4rem; width: min(20rem, calc(100% - 1.75rem));
  max-height: min(40vh, 18rem); overflow-y: auto; pointer-events: auto;
}
.${ELEMENT_TAG}-room-star {
  display: flex; align-items: flex-start; gap: .5rem; padding: .55rem .65rem;
  border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border)); border-radius: .65rem;
  background: var(--marinara-chat-chrome-panel-bg, var(--surface)); color: var(--text);
  box-shadow: 0 .25rem 1rem #0003; font-size: .82rem; line-height: 1.35;
}
.${ELEMENT_TAG}-room-star > span:first-child { color: #e5b13e; font-size: 1.2rem; line-height: 1; }
.${ELEMENT_TAG}-room-star > span:nth-child(2) { flex: 1; }
.${ELEMENT_TAG}-room-star button { border: 0; background: transparent; color: inherit; cursor: pointer; font: inherit; }
.${ELEMENT_TAG}-room-star-dismiss { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; width: 2.5rem; height: 2.5rem; margin: -.5rem -.55rem -.5rem 0; font-size: 1.2rem !important; line-height: 1; }
.${ELEMENT_TAG}-room-star button:focus-visible { outline: 2px solid currentColor; border-radius: .2rem; }
@media (max-width: 600px) {
  .${ELEMENT_TAG}-room-stars { top: 4.75rem; left: .625rem; width: min(19rem, calc(100% - 1.25rem)); max-height: 32vh; }
}
@media (prefers-reduced-motion: reduce) {
  .${ELEMENT_TAG}-chat, .${ELEMENT_TAG}-chat[data-open="true"] { transition: none; }
}
/*
  THE PICTURE IS THE GROUND FLOOR, and everything else is a layer drawn over it.

  The stage is taken out of the column and pinned to the whole tab, so it is not
  a flex row's child any more and it reserves no height at all: the head, the
  reading card, the way out and the composer lay themselves out as if the picture
  were not there, and the picture fills whatever space they leave. That is the
  whole difference between a stage and a column — the picture is BEHIND the words
  rather than beside them, which is what lets the words have the tab's full
  width.

  A positioned box paints over in-flow content, so every layer has to say that it
  is above the picture rather than rely on document order. The list is written
  once, here, rather than a z-index being repeated into each rule below: a layer
  added to the column later is one line in this selector list, and forgetting it
  is a layer that disappears behind the map rather than a subtle stacking bug,
  which is the kind of failure a list like this exists to make obvious.

  The child combinator rather than a descendant one, because several of these
  names — error, composer, the two panel classes — are drawn by the rest of the
  sheet as well, and a bare descendant selector would hand a stacking context to
  every one of them.

  The head is NOT in this list, and its absence is deliberate rather than an
  oversight: it is the floating top chrome and it carries its own, higher
  z-index in its own rule. Everything named here sits above the picture and below
  the chrome, which is the one ordering the whole sheet depends on.

  The way out is not in the list either, and its absence is the other deliberate
  one rather than a second oversight: it is not a row of this column any more.
  It is drawn inside the bottom stack and pinned to the top of it, so it is
  already above the picture by being above the reading — see its own rule.
*/
.${ELEMENT_TAG}-chat > .${ELEMENT_TAG}-chat-stage,
.${ELEMENT_TAG}-chat > .${ELEMENT_TAG}-chat-activities,
.${ELEMENT_TAG}-chat > .${ELEMENT_TAG}-chat-vn,
.${ELEMENT_TAG}-chat > .${ELEMENT_TAG}-chat-confirm,
.${ELEMENT_TAG}-chat > .${ELEMENT_TAG}-error,
.${ELEMENT_TAG}-chat > .${ELEMENT_TAG}-room-error,
.${ELEMENT_TAG}-chat > .${ELEMENT_TAG}-composer,
.${ELEMENT_TAG}-chat > .${ELEMENT_TAG}-chat-ended { position: relative; z-index: 1; }
/*
  THE TOP CHROME, floating over the picture.

  It used to be a row in the column with a wash of its own behind it — a header,
  in other words — and it is now a bar laid over the stage, which is what the
  Engine's own roleplay surface does with the top of its chats: the picture runs
  to all four edges of the tab and everything the tab has to say is drawn on top
  of it.

  pointer-events: none on the bar and auto on its children, because a bar that
  spanned the tab and swallowed presses would be a bar that took the room away
  from the player: the badge is a thing to read, and the only thing in here to
  press is the options button at the far end.

  The wash the row used to wear is gone with the row, and it has not been
  replaced by nothing: each thing in here carries its own surface, which is the
  statement the Engine makes in the same place — its top chrome is a row of
  individually surfaced controls rather than a plate across the tab, so that the
  picture is visible between them.

  0.4.50 took the "right now" chip out of here and with it the last of the prose.
  What is left is one badge and one button, so the row no longer needs wrapping
  room and no longer competes with the reading for the top of the tab — see the
  note on the head itself. The badge is still first in the row and the button is
  still held at the far end by the auto margin on the actions beside it.
*/
.${ELEMENT_TAG}-chat-head {
  position: absolute; top: .875rem; left: .875rem; right: .875rem; z-index: 3;
  display: flex; flex-wrap: wrap; align-items: flex-start; gap: .375rem;
  pointer-events: none;
}
.${ELEMENT_TAG}-chat-head > * { pointer-events: auto; }
/*
  THE THREE DOTS, and everything the room can do behind them.

  There used to be a bare row of buttons here — End Scene and Forget, then
  the spin-off verb, then the debug pair — and it was read as a row of five equal
  things when only one of them was the player's ordinary way out. The Engine's
  own roleplay chats keep their commands behind a "..." in the corner, and this
  is the same control doing the same job: the room is not a toolbar, and the two
  presses a player makes in an hour should not be the two loudest things on the
  screen.

  NO BACKDROP and no focus trap, deliberately: the menu hangs off a button in the
  top chrome rather than covering the tab, and the paragraph the player was
  reading stays readable behind it. Closing it is one press anywhere else, or
  Escape — see the effect on the panel.
*/
.${ELEMENT_TAG}-chat-actions { display: flex; flex-wrap: wrap; align-items: center; gap: .375rem; margin-left: auto; }
.${ELEMENT_TAG}-chat-menu-anchor { position: relative; display: inline-flex; }
/*
  The button itself, cut to the Engine's own toolbar button.

  The Engine keeps one shape for everything in the chrome — a control square, a
  rounded corner, a translucency over the picture and a blurred backdrop behind
  the translucency — and this is that shape, in the Engine's own chrome tokens.
  Those are declared on the document root, so they arrive here already resolved
  for whatever theme the Engine is wearing; the fallbacks beside them are what
  keeps the button drawn if a name is ever missing.

  The narrow-container step to a slightly larger square is an override at the end
  of the sheet, where the container queries live, because it is a change of size
  rather than a second button.
*/
.${ELEMENT_TAG}-chat-menu-button {
  display: inline-flex; align-items: center; justify-content: center;
  width: 2rem; height: 2rem; padding: .375rem; box-sizing: border-box;
  border: 1px solid var(--marinara-chat-chrome-button-border, var(--border));
  border-radius: .5rem;
  background: var(--marinara-chat-chrome-button-bg, var(--popover));
  color: var(--marinara-chat-chrome-button-text, var(--foreground));
  backdrop-filter: blur(12px);
  cursor: pointer;
  transition: border-color .15s ease, background-color .15s ease, color .15s ease;
}
.${ELEMENT_TAG}-chat-menu-button:hover {
  border-color: var(--marinara-chat-chrome-button-border-hover, var(--primary));
  background: var(--marinara-chat-chrome-button-bg-hover, var(--popover));
  color: var(--marinara-chat-chrome-button-text-hover, var(--primary));
}
.${ELEMENT_TAG}-chat-menu-button:focus-visible {
  outline: 2px solid var(--marinara-chat-chrome-focus-ring, var(--primary));
  outline-offset: 1px;
}
.${ELEMENT_TAG}-chat-menu-button svg { width: 1rem; height: 1rem; }
/*
  The same button shape, for the one press that has a word on it.

  A card that has gone from the library draws Close instead of the options menu,
  and it is drawn in the chrome rather than in the row below because there is
  nowhere else for it to be. It wears the toolbar's own surface so that the one
  control in the top chrome is the same control whether it is a glyph or a word.
*/
.${ELEMENT_TAG}-chat-tool {
  min-height: 2rem; box-sizing: border-box;
  border-color: var(--marinara-chat-chrome-button-border, var(--border));
  background: var(--marinara-chat-chrome-button-bg, var(--popover));
  color: var(--marinara-chat-chrome-button-text, var(--foreground));
  backdrop-filter: blur(12px);
}
.${ELEMENT_TAG}-chat-tool:hover {
  border-color: var(--marinara-chat-chrome-button-border-hover, var(--primary));
  background: var(--marinara-chat-chrome-button-bg-hover, var(--popover));
  color: var(--marinara-chat-chrome-button-text-hover, var(--primary));
}
/*
  The popover, modelled on the tracker menu so there is one popover in this
  package rather than two that look almost the same.

  It is bounded in both directions and scrolls inside that bound. Its height is
  the reason: this list is the longest one in the tab now — four verbs, the way
  between the two ways of reading, and a debug group — and on a phone held
  sideways an unbounded one would be taller than the tab it hangs off. cqh rather
  than vh, because the container is the tab the Engine drew and not the window:
  in fullscreen those are two different boxes, and it is the tab this menu has to
  fit in.

  The surface is the Engine's own panel, in the Engine's own tokens, so that a
  popover and the button it hangs off are cut from one cloth. It used to be the
  theme's popover colour, which was the right surface for a menu inside a header
  row and is the wrong one for a menu hanging off a translucent control over a
  photograph: the panel tokens already carry the blur-friendly opacity and the
  accent-tinted edge that keep the two reading as a pair.
*/
.${ELEMENT_TAG}-chat-menu {
  position: absolute; top: calc(100% + .5rem); right: 0; z-index: 40;
  width: 19rem; max-width: min(19rem, 82cqw);
  max-height: min(26rem, 70cqh); overflow-y: auto;
  display: flex; flex-direction: column; gap: .375rem;
  border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  border-radius: .625rem;
  background: var(--marinara-chat-chrome-panel-bg, var(--popover, var(--background)));
  color: var(--marinara-chat-chrome-panel-text, var(--foreground));
  backdrop-filter: blur(12px);
  box-shadow: 0 .875rem 2rem rgba(0, 0, 0, .35); padding: .625rem;
}
.${ELEMENT_TAG}-chat-menu-note {
  margin: 0; font-size: .6875rem; line-height: 1.5;
  color: var(--marinara-chat-chrome-panel-muted, var(--muted-foreground));
}
/*
  Ending is the ordinary way out and forgetting is the rare, total one, so the
  pair is drawn as a plain button and a red one rather than as two buttons of
  equal weight. Forget is RED because it is a debug action: nothing a player of
  this game is meant to be able to do leaves the village with no memory of a
  conversation that happened, and the colour is the part of that statement a
  player reads before they read the words.

  Both are drawn full width in the menu, because a menu is a list of things to
  press and a ragged cluster of differently sized ones is a list nobody scans.
*/
.${ELEMENT_TAG}-chat-menu .${ELEMENT_TAG}-button { width: 100%; justify-content: flex-start; text-align: left; }
/*
  DEBUG. The two fixture controls, at the foot of the menu behind a rule.

  A different promise from the pair above them, which belongs to the conversation
  and comes and goes with it: these two are a fixture of the tab while it is being
  worked on, so they are drawn whatever the phase, whatever the card, and whether
  or not anybody has said a word. Nothing about them is conditional, and that is
  the point — a control that is only sometimes there is a control that has to be
  looked for.

  The rule above them is the whole of what marks them apart. They used to be
  pushed to the far end of a header row, which is where a second claim on the
  space is made; in a menu the same statement is made by a divider, because the
  menu is already the corner and there is no further end to push anything to.
*/
.${ELEMENT_TAG}-chat-debug {
  display: flex; flex-direction: column; gap: .375rem;
  margin-top: .125rem; padding-top: .5625rem; border-top: 1px solid var(--border);
}
/*
  The last press, floating over the room just above the box.

  A room the village has already remembered wears End Scene here, and it
  is the only control of its kind on the screen: the first press — Leave this
  conversation, which 0.4.49 moved into the menu under the box — is what spends
  the goodbye and files the memory away, and this is what closes the drawer
  afterwards. A player who sees it has finished rather than being asked to
  confirm something they did a second ago.

  The rooms with no ending to give draw Close in the same slot: the one whose
  villager could not be reached at all. Neither name is a lie about what pressing
  it does — it closes the drawer and releases the map.

  It is drawn as CHROME rather than as a message, and that is one of the two
  things 0.4.49 changed about it. It used to be a plate centred between the
  reading and the box with a message's own padding on it, and the padding was the
  mistake: a button with a message's insides reads as part of what somebody said,
  and a way out is not something anybody said. So it wears the Engine's own
  toolbar surface — the translucent chip, the blurred backdrop, the pill radius,
  the shadow — and nothing is drawn behind it.

  AND IT FLOATS, which is the other thing. It is a child of the bottom stack and
  it hangs off the TOP of it, so it is over the room rather than in a row of the
  column: the reading and the box keep the position they have in every other
  room, and all this state adds is a chip over the room above them. A row of its
  own — which is what it was — pushed the card up the room for as long as it was
  drawn, and a room that moves because a button appeared is the one thing this
  drawer's reading is not allowed to do.

  It hangs off the bottom stack rather than sitting in a corner, and that is the
  Visual Novel's own arrangement rather than a preference: the reading is the
  card and the history is a pane the player opens, so there is no log to write a
  button into, and one written into the transcript would come and go with the
  history instead of sitting where the reading ends.

  WHO sees it was narrowed in the same release — see showFoot. It used to be
  drawn for anything that was not mid-answer, which included a room whose card is
  gone, where the head already carries the same press, and a room whose villager
  is still finding their first line.
*/
.${ELEMENT_TAG}-chat-end {
  position: absolute; left: 50%; bottom: calc(100% + .375rem);
  transform: translateX(-50%);
  display: flex; justify-content: center;
}
.${ELEMENT_TAG}-chat-end > .${ELEMENT_TAG}-button {
  border-color: var(--marinara-chat-chrome-button-border, var(--border));
  border-radius: 999px; padding: .3125rem .875rem;
  background: var(--marinara-chat-chrome-button-bg, var(--popover));
  color: var(--marinara-chat-chrome-button-text, var(--foreground));
  backdrop-filter: blur(12px);
  box-shadow: 0 .5rem 1.5rem rgba(0, 0, 0, .4);
}
.${ELEMENT_TAG}-chat-end > .${ELEMENT_TAG}-button:hover {
  border-color: var(--marinara-chat-chrome-button-border-hover, var(--primary));
  background: var(--marinara-chat-chrome-button-bg-hover, var(--popover));
  color: var(--marinara-chat-chrome-button-text-hover, var(--primary));
}
.${ELEMENT_TAG}-button-quiet { border-color: transparent; background: transparent; color: var(--muted-foreground); }
.${ELEMENT_TAG}-button-quiet:hover { border-color: var(--destructive, #e5484d); color: var(--destructive, #e5484d); }
/*
  The debug action's question, drawn under the button that raised it rather than
  over the whole tab. It belongs beside the control it is about — a modal would
  put the map, the drawer and the player's own words behind a sheet of grey to
  ask one question about one button — and it is drawn in the destructive colour
  so that the question and the thing it is asking about read as one action.
*/
.${ELEMENT_TAG}-chat-confirm {
  display: flex; flex-direction: column; gap: .375rem;
  border: 1px solid color-mix(in srgb, var(--destructive, #e5484d) 45%, transparent);
  border-radius: .5rem; padding: .5rem .625rem;
  background: color-mix(in srgb, var(--destructive, #e5484d) 10%, transparent);
}
.${ELEMENT_TAG}-chat-confirm-note { margin: 0; font-size: .6875rem; line-height: 1.5; color: var(--foreground); }
.${ELEMENT_TAG}-chat-confirm-row { display: flex; flex-wrap: wrap; gap: .375rem; }
.${ELEMENT_TAG}-image-recommendation { color: #d68a18; }
/*
  Where the composer was, once the conversation has been ended.

  Everything that could still say something to a villager who has been left is
  taken off the screen rather than disabled: a row of greyed-out verbs would be
  an invitation to keep talking to somebody who has already been said goodbye
  to, and the one thing left to do with a conversation that has been remembered
  is close it. The box is hidden rather than unmounted so the half-written
  sentence in it survives, which is the same promise the Fulfill verb makes.

  dashed rather than solid, because this is not a control: it is the drawer
  saying it is finished with the player.
*/
.${ELEMENT_TAG}-chat[data-ended="true"] .${ELEMENT_TAG}-composer { display: none; }
/*
  And the same hiding, for the two states of an opening that has not landed.

  The scene opens first, so while its first moment is being written there is
  nothing to answer: the box would take a sentence the player cannot send, and
  every verb above it would be a greyed-out version of itself. Hiding rather than
  unmounting keeps the half-written line in the box across a retry that succeeds,
  which is the same promise the ended state above makes, and it keeps the change
  to one property.

  failed hides it for a different reason: there is no conversation. Nothing was
  written down, the order of the room was never established, so the only control
  on offer is the one that gets the player out.

  Both rules sit BELOW the ended rule rather than beside it because the ended
  state is the one that matters when they could overlap, and they are separate
  selectors rather than one list so that each keeps its own reason.
*/
.${ELEMENT_TAG}-chat[data-greeting="writing"] .${ELEMENT_TAG}-composer { display: none; }
.${ELEMENT_TAG}-chat[data-greeting="failed"] .${ELEMENT_TAG}-composer { display: none; }
.${ELEMENT_TAG}-chat-ended {
  margin: 0; padding: .5rem .625rem; border: 1px dashed var(--border); border-radius: .5rem;
  font-size: .6875rem; line-height: 1.5; color: var(--muted-foreground); text-align: center;
}
/*
  THE ROOM, and the floor the villager stands on.

  The scene used to be a bounded column BESIDE the words, and it is the whole
  backdrop now: the picture of the place the villager is standing in runs to the
  tab's own edges and everything else in the aside is read over the top of it.
  That is the Engine's own Visual Novel shape, and it is the reason the card can
  be a card at all — a paragraph set at a comfortable measure needs the tab's
  full width, and two fifths of a phone is a column of single words.

  It keeps the muted plate the places list uses for a picture it does not have, so
  a place with no picture reads as a place with no picture rather than as a
  picture that failed: the same statement, made the same way, in both lists.
*/
.${ELEMENT_TAG}-chat-scene {
  position: absolute; inset: 0; z-index: 0;
  min-height: 0;
  background: var(--muted, rgba(127, 127, 127, .08));
  overflow: hidden;
}
.${ELEMENT_TAG}-chat-scene-backdrop {
  position: absolute; inset: 0; display: block;
  width: 100%; height: 100%; object-fit: cover;
}
.${ELEMENT_TAG}-chat-scene-placeholder {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  color: var(--muted-foreground); font-size: .85rem; text-align: center; padding: 1rem;
}
/*
  THE TWO LAYERS BETWEEN THE PICTURE AND THE WORDS.

  The Engine draws both of these over its own roleplay backdrop and this tab had
  neither, which is the whole of why its room read as a photograph with a card
  lying on it rather than as a stage:

  The scrim is a vertical wash of the theme's own background — dark in a dark
  theme, light in a light one — so it darkens the picture where the chrome sits
  and leaves it most visible in the middle. It is mixed rather than painted a
  fixed near-black, because a fixed near-black over a pale theme's map is a black
  band across a drawing rather than a photograph going into shadow, and the
  Engine's own light theme makes exactly the same substitution.

  The vignette is the other half of the same statement, around the edges instead
  of above and below: the eye is drawn to the middle of the room, and the corners
  of a photograph stop competing with the words laid over them. It is the
  Engine's own radius and the Engine's own opacity.

  Both are inside the scene rather than beside it because the scene is the layer
  that knows where the picture is, and neither is drawn for a place that has no
  picture — there is nothing to darken and nothing to frame.
*/
.${ELEMENT_TAG}-chat-scrim {
  position: absolute; inset: 0; display: block;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--background) 55%, transparent) 0%,
    color-mix(in srgb, var(--background) 40%, transparent) 42%,
    color-mix(in srgb, var(--background) 45%, transparent) 72%,
    color-mix(in srgb, var(--background) 60%, transparent) 100%
  );
}
.${ELEMENT_TAG}-chat-vignette {
  position: absolute; inset: 0; display: block;
  background: radial-gradient(ellipse at center, transparent 50%, color-mix(in srgb, #000 30%, transparent) 100%);
}
/*
  THE FLOOR, and it is a row of the tab rather than a layer on the stage.

  The villager used to stand at the head of the reading column, and the note that
  used to be here explained at length that this was the one place the tab departed
  from the Engine and that it departed for the length of a face. It was a real
  problem — the Engine's sprite is a whole body, so a card across its shins still
  leaves a head thirty centimetres above the card, and ours is a square crop
  whose chin is not far below its eyes — but standing the figure in the reading
  column answered it by putting the villager inside the words, which is the one
  thing a Visual Novel stage is for.

  So the figure is on the floor, the way the Engine's is, and the problem is
  answered by the floor being the right size rather than by moving the person. The
  floor is this row, and the figure stands on the bottom of it and grows upward. It
  cannot be walked over by the card, because the card is not in this row — and on a
  tab with almost no height left it shrinks like a sprite rather than being clipped
  like one.

  The floor CLAIMS a share of the tab and yields proportionally when the tab cannot
  pay it. A flex-basis of 34cqh is the same share the figure is allowed to ask for;
  a shrink factor of 1 is what lets a tab with a long paragraph in it take the
  shortfall off the floor and off the card together rather than off one of them
  alone. A floor that took only what was LEFT OVER — flex-basis auto, which is what
  this rule used to say — is paid last and can be paid nothing, and that is how a
  figure ends up standing above the top edge of the tab with its head cut off.

  container-type: size is what lets the figure ask the FLOOR how tall it is instead
  of asking the tab and hoping the arithmetic comes out. Every cq unit inside this
  row is the row's own square from here on, which is why the figure's height share
  is 100cqh below rather than a number tuned against the chrome around it. The
  price is stated plainly: the floor's size no longer answers to its contents, so
  neither the figure nor the plate can push the row outward. That is the point — it
  is why the figure is allowed to shrink at all — and it is also why the row needs
  a basis of its own rather than a basis of its content.

  It comes BEFORE the bottom stack in the document, and it is the bottom stack
  that is drawn last, so the order the layers paint in is the order the room reads
  in whether or not every rule's z-index survives a future edit.

  0.4.49 makes the floor GROW as well as shrink, and that is the difference
  between a stage and a block at the top of the tab. The card and the composer
  both have ceilings of their own, so on a tab taller than 34cqh the share the
  floor claimed was all it ever took and the rest of the tab sat empty under the
  card: measured at 1200x800 the row was 272 pixels and the 240 under the composer
  were nobody's. A grow factor of 1 hands that slack back to the row, which is what
  puts the room over the whole tab with the card and the box laid out at the foot
  of it.

  It is also the foundation the spritesheet is going to be drawn on. A villager is
  a framed square crop today, and a full-body sprite is the art that is coming; the
  row it will stand in is now the row the tab actually has rather than a fixed
  share of it, so the ground a sprite will need already belongs to the figure's row
  and nothing about the card, the composer or the chrome has to move again to make
  room for it.
*/
.${ELEMENT_TAG}-chat-stage {
  flex: 1 1 34cqh; min-height: 0;
  container-type: size;
  display: flex; flex-direction: column; justify-content: flex-end; align-items: center;
  gap: .375rem;
  padding-bottom: .25rem;
}
.${ELEMENT_TAG}-chat-activities {
  max-width: min(90%, 42rem); max-height: 5rem; overflow-y: auto;
  flex: 0 0 auto; align-self: center;
  display: flex; flex-wrap: wrap; justify-content: center; gap: .25rem;
  color: var(--foreground); font-size: .6875rem; line-height: 1.4;
}
.${ELEMENT_TAG}-chat-activity {
  padding: .15rem .4rem; border-radius: .4rem;
  background: color-mix(in srgb, var(--background) 80%, transparent);
}
/*
  THE BOTTOM STACK: the tab, the card, and the whole of the reading.

  One block, directly above the composer, with its contents justified to the end
  so that the card always sits on the box the player types in. That is the
  Engine's own arrangement — its visual-novel card is pinned to the bottom of the
  input chrome and the room is what is left above it — and it is what makes the
  card's position stable: a card that floated up and down the tab with the length
  of the paragraph would be a different screen every turn.

  It is the flexible row, and the stage above it is the other one, so the two
  share what the tab has left between them. The card cannot grow into the stage
  because a card has its own ceiling — see the reading box — and neither can an
  open history, which is capped where it is declared.
*/
.${ELEMENT_TAG}-chat-vn {
  flex: 0 1 auto; min-height: 0;
  display: flex; flex-direction: column; justify-content: flex-end; gap: .375rem;
}
/*  Square, and that is a requirement rather than a preference: the card's own
    framing of its picture is a square region of it, and the arithmetic that
    draws a framing — see avatarCropStyle — only lands undistorted on a frame
    of the same shape. A tall frame would show the same crop with the face
    stretched through it.

    Centred rather than stretched across the tab: it is a person standing in a
    room, and a person is not the width of a room.

    ONE width, and the square follows from it, which is what keeps the two
    dimensions from ever disagreeing. It is the smaller of a share of the tab's
    width and the room the floor actually has, because a figure that only answered
    width would eat a landscape tab's height — and the second term is measured
    against the FLOOR rather than against the tab, because the floor is a size
    container of its own. That is the whole answer to a short tab, and it is why
    the short-tab queries at the end of the sheet no longer carry a figure size of
    their own: the figure is exactly as big as the row it stands in, so it cannot
    stand above the top edge of the tab however little room the card and the
    composer have left it. The 2.5rem is the gap, the plate and the floor's own
    padding, spent so that the plate is not pushed off the bottom of the tab by a
    figure that filled the row.

    flex: 0 0 auto, because the stage is justified to its end and the plate below
    is the row that may give way. A shrinkable figure means a long place name
    squashes the face to buy the plate a line it did not need.

    0.4.49 raises the width share from 30cqw to 38cqw, and only because the floor
    now grows: the figure is capped by the row it stands in either way, and a row
    that owns the whole tab can afford a bigger person in it. What it is NOT is a
    spritesheet — a villager is still a square crop in a soft frame, at a size
    that leaves the room around them, and the extra room the floor now owns is
    what the full-body art is going to be drawn into. The radius, the border and
    the drop shadow below are the shape that art has to arrive in.
*/
.${ELEMENT_TAG}-chat-figure {
  position: relative; z-index: 1;
  flex: 0 0 auto;
  display: flex; align-items: center; justify-content: center;
  width: min(38cqw, calc(100cqh - 2.5rem)); aspect-ratio: 1 / 1;
  border-radius: .625rem; border: 1px solid var(--border);
  background: var(--popover);
  box-shadow: 0 .5rem 1.5rem rgba(0, 0, 0, .35);
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, .5));
  font-size: 1.5rem; font-weight: 600;
  overflow: hidden;
}
.${ELEMENT_TAG}-chat-figure > img { display: block; width: 100%; height: 100%; object-fit: cover; }
.${ELEMENT_TAG}-chat-figure[data-sprite="true"] { width: min(35cqw, 23rem); height: min(65cqh, 35rem); aspect-ratio: auto; border: 0; background: transparent; box-shadow: none; overflow: visible; }
.${ELEMENT_TAG}-chat-figure[data-sprite="true"] > img { width: 100%; height: 100%; object-fit: contain; object-position: center bottom; }
.${ELEMENT_TAG}-chat-figure[data-sprite="true"][data-framing="half"] { overflow: hidden; height: min(54cqh, 25rem); }
.${ELEMENT_TAG}-chat-figure[data-sprite="true"][data-framing="half"] > img { object-fit: cover; object-position: center top; }
/*
  THE ROOM'S OWN CAST, standing in the floor the villager stands in.

  A private conversation has one figure on the floor and the card repeats them a
  paragraph at a time. A room has everybody who was in it, and this is the same
  drawing made plural: the faces stand at the foot of the room as themselves
  rather than as the card's illustration of whoever happens to be talking.

  The ENGINE's own avatar frame is reused rather than a second frame at a second
  size, because the two things that frame has to do — clip a crop, and hold a
  person's initial — are done by that rule and would have to be copied to be done
  again. The row wraps, because a mill with six people in it is a mill with six
  people in it, and a row that overflowed the tab would push the plate off the
  bottom of it.
*/
.${ELEMENT_TAG}-chat-cast {
  position: relative; z-index: 1;
  display: flex; align-items: flex-end; justify-content: center;
  flex-wrap: nowrap; gap: .375rem;
  width: 100%; height: min(100%, 28rem); min-height: 0;
}
.${ELEMENT_TAG}-chat-cast-person {
  display: flex; flex: 0 1 27%; flex-direction: column; align-items: center; justify-content: flex-end;
  min-width: 0; height: 85%; color: var(--foreground); font-size: .6875rem;
  text-shadow: 0 1px 4px #000, 0 2px 8px #000;
}
.${ELEMENT_TAG}-chat-cast-person[data-active="true"] { flex-basis: 40%; height: 100%; }
.${ELEMENT_TAG}-chat-cast-person > img { display: block; width: 100%; height: calc(100% - 1.5rem); object-fit: contain; object-position: center bottom; filter: drop-shadow(0 .5rem .75rem #0009); }
.${ELEMENT_TAG}-chat-cast-person > img[data-framing="half"] { object-fit: cover; object-position: center top; }
.${ELEMENT_TAG}-chat-cast-person > img[data-facing="left"] { transform: scaleX(-1); }
.${ELEMENT_TAG}-chat-cast-person > .${ELEMENT_TAG}-avatar { width: min(7rem, 100%); height: auto; aspect-ratio: 1; }
.${ELEMENT_TAG}-chat-cast-person > span:not(.${ELEMENT_TAG}-avatar) { display: block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: .15rem .35rem; border-radius: .35rem; background: #0009; }
.${ELEMENT_TAG}-chat-cast-rest { display: flex; flex-wrap: wrap; justify-content: center; gap: .25rem; max-height: 2rem; overflow-y: auto; }
.${ELEMENT_TAG}-chat-cast-rest > span { display: inline-flex; align-items: center; gap: .2rem; padding: .1rem .35rem; border-radius: .35rem; background: #000a; color: white; font-size: .625rem; }
.${ELEMENT_TAG}-chat-cast-rest .${ELEMENT_TAG}-avatar { width: 1rem; height: 1rem; border-radius: 50%; overflow: hidden; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-activities { display: none; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-history-toggle { width: auto; height: auto; min-height: 2rem; align-self: center; padding: .2rem .65rem; border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border)); border-radius: .5rem; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn-text { font-size: .9375rem; line-height: 1.55; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn-aside-text { font-size: .8125rem; line-height: 1.45; }
/* The plate is what makes the name readable over a picture, so it is drawn
   whether or not there is one behind it: place names are short, and a name that
   changed its contrast depending on the hour would be worse than a plain chip. */
.${ELEMENT_TAG}-chat-scene-place {
  position: relative; z-index: 1; max-width: 100%;
  border-radius: 999px; padding: .1875rem .5rem;
  background: color-mix(in srgb, var(--popover) 88%, transparent);
  font-size: .6875rem; color: var(--foreground); text-align: center;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
/*
  THE HISTORY, and the little tab that opens it.

  The log is the old transcript in a pane rather than in the tab's own flow: the
  villager's answers and the player's own lines, in order, in the bubbles they
  have always been drawn in, and the only change is that it is something the
  player OPENS rather than the only thing on screen. That is what the Engine's
  Visual Novel does, and it is why the card can show one paragraph at a time
  without the player losing the thread: the whole of the conversation is one press
  away, and it scrolls inside its own frame instead of growing the tab.

  It is capped in height rather than left to fill, and the cap is cqh for the
  same reason every other measurement in this sheet is: the container is the tab
  the Engine drew. What the cap buys is the stage — a history that grew to the
  ceiling of the tab would be a history with no room behind it, and the room is
  what the player is reading the conversation IN.

  READ ONLY, deliberately: nothing here can be edited, and the history is the
  village's own record of what was said rather than a draft.
*/
.${ELEMENT_TAG}-chat-log {
  display: flex; flex-direction: column; gap: .5rem;
  flex: 0 1 auto; min-height: 6rem; max-height: min(52cqh, 28rem); overflow-y: auto;
  border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  border-radius: .625rem; padding: .5rem;
  background: var(--marinara-chat-chrome-panel-bg, color-mix(in srgb, var(--popover) 92%, transparent));
  backdrop-filter: blur(12px);
  box-shadow: 0 .5rem 1.5rem rgba(0, 0, 0, .28);
}
/*
  THE LITTLE TAB, and it is the Engine's own.

  It used to be a labelled pill — a chevron and the words "Chat history" — and
  the words are the whole of what changed. The Engine's Visual Novel hangs a bare
  chevron the width of a thumb off the top of its card, and it can, because the
  card is directly under it and the thing being opened is obviously the history of
  the thing being read: the label was doing work the position had already done.

  The words are not gone, they are out of the way: the accessible name and the
  title still say "Show chat history" and "Return to Visual Novel" in both
  directions, so anything reading the tab aloud, and anything hovering it, is told
  exactly what the pill used to say.

  The shape is the Engine's shape, and the shape is the state: a tab rounded at
  the top and open at the bottom when the card is up, rounded at the bottom and
  open at the top when the history is, so the control and the thing it opened
  read as one object. The pseudo-element is the Engine's own trick — a hit area
  taller and wider than the drawing, so a 24-pixel tab is not a 24-pixel target
  on a phone.
*/
.${ELEMENT_TAG}-chat-tab { display: flex; justify-content: center; }
.${ELEMENT_TAG}-chat-history-toggle {
  position: relative;
  display: inline-flex; align-items: center; justify-content: center;
  width: 2.5rem; height: 1.5rem; padding: 0; box-sizing: border-box;
  border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  border-bottom: 0; border-radius: .5rem .5rem 0 0;
  background: var(--marinara-chat-chrome-panel-bg, var(--popover));
  color: var(--marinara-chat-chrome-button-text, var(--foreground));
  backdrop-filter: blur(12px);
  cursor: pointer; font-family: inherit;
}
.${ELEMENT_TAG}-chat-history-toggle::before { content: ""; position: absolute; inset: -.625rem -.25rem; }
.${ELEMENT_TAG}-chat-history-toggle:hover { color: var(--marinara-chat-chrome-highlight-text, var(--primary)); }
.${ELEMENT_TAG}-chat-history-toggle svg { width: .875rem; height: .875rem; }
.${ELEMENT_TAG}-chat-history-toggle[aria-expanded="true"] {
  margin-top: -1px;
  border-top: 0; border-bottom: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  border-radius: 0 0 .5rem .5rem;
}
/*
  THE READING CARD, and it is the Engine's visual-novel bubble.

  A surface of its own holding the speaker's face, the speaker's name and one
  paragraph of what they said, with the arrows under it to walk the rest. It is
  drawn at the FOOT of the stack, directly above the composer, because that is
  where the eye already is at the end of a turn — the player looks down at the box
  they type in, and the answer arrives just above it.

  The face and the name are the two things this card did not have and the Engine's
  has. A card that shows a paragraph of somebody's speech without saying who is
  speaking is a card that only works while there is a heading above it saying the
  same thing — and the heading is gone, because the Engine has no heading: it has
  a card with a face in it, which is the same statement made where the player is
  already looking.

  It is the ENGINE'S OWN double structure that puts the face in two places at
  once, and it is worth being plain about it: the Engine stands a sprite on the
  stage floor AND draws a square portrait in the card, because those are two
  different pictures — a body and a head. A village has one picture per villager,
  so both frames show it, and the one on the floor is the one the card is read
  across. The card's is the one that is always fully visible.

  THE PADDING IS ON THE ROW, not on the card, and that is the Engine's own
  structure rather than a preference: the Engine's plate holds a padded dialogue
  block and then a rule with the arrows in it, so the rule reaches both edges of
  the surface while the face and the words are held in from them. Padding on the
  card would inset the rule as well and draw a short line across the middle of the
  plate, which is a divider between nothing and nothing.
*/
.${ELEMENT_TAG}-chat-vn-card {
  display: flex; flex-direction: column;
  flex: 0 1 auto; min-height: 0; overflow: hidden;
  border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  border-radius: .75rem;
  background: var(--marinara-chat-chrome-panel-bg, color-mix(in srgb, var(--popover) 94%, transparent));
  backdrop-filter: blur(12px);
  box-shadow: 0 .75rem 2rem rgba(0, 0, 0, .4);
}
/*
  The row and the column are the two boxes the reading shrinks inside of.

  flex-start on the row would size the column to its own content, and a box whose
  size IS its content is a box whose child cannot be made smaller than it — so the
  column stretches to the row instead and the reading is what gives way. That is
  the order the card yields in, and it is worth stating: the paragraph first, the
  arrows never. A paragraph is the one part of a card that can be scrolled, and a
  clipped arrow is a control the player cannot press at all.
*/
.${ELEMENT_TAG}-chat-vn-row {
  display: flex; gap: .75rem; min-width: 0; min-height: 0; align-items: flex-start;
  padding: .75rem;
}
.${ELEMENT_TAG}-chat-vn-portrait {
  position: relative; flex: 0 0 auto; align-self: flex-start;
  display: flex; align-items: center; justify-content: center;
  width: min(5rem, 26cqw); aspect-ratio: 1 / 1;
  border-radius: .75rem; border: 1px solid var(--border);
  background: var(--secondary);
  font-size: 1.25rem; font-weight: 600;
  overflow: hidden;
}
.${ELEMENT_TAG}-chat-vn-portrait > img { display: block; width: 100%; height: 100%; object-fit: cover; }
.${ELEMENT_TAG}-chat-vn-column { display: flex; flex-direction: column; gap: .5rem; min-width: 0; min-height: 0; align-self: stretch; flex: 1 1 auto; }
.${ELEMENT_TAG}-chat-vn-name {
  margin: 0; min-width: 0;
  font-size: .875rem; font-weight: 600; line-height: 1.3;
  color: var(--marinara-chat-chrome-highlight-text, var(--foreground));
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
/*
  The paragraph, in a box with a ceiling on it.

  This is the one place the card CANNOT be allowed to grow, and the number is the
  Engine's own: min(30dvh, 18rem) there, min(30cqh, 18rem) here, for the reason
  every other measurement in this sheet is in cqh — the container is the tab, and
  in fullscreen the tab and the window are two different boxes. Thirty percent of
  the tab is where a long answer stops pushing the card up the screen and starts
  scrolling inside it, which is what keeps the figure on the floor visible and
  the composer where the player left it.

  That ceiling keeps the card from GROWING, and flex: 0 1 auto is what lets it
  SHRINK: a short tab takes its height off the paragraph rather than off the arrows
  under it, and the reading is the one box in the card that can give that height up
  without reading as broken.
*/
.${ELEMENT_TAG}-chat-vn-reading {
  flex: 0 1 auto; min-height: 0; max-height: min(30cqh, 18rem);
  overflow-y: auto; overscroll-behavior: contain;
  display: flex; flex-direction: column; gap: .375rem;
  padding-right: .25rem;
}
.${ELEMENT_TAG}-chat-vn-reading:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; border-radius: .25rem; }
.${ELEMENT_TAG}-chat-vn-text {
  margin: 0; font-size: .8125rem; line-height: 1.6;
  white-space: pre-wrap; overflow-wrap: break-word;
}
.${ELEMENT_TAG}-chat-vn-text[data-empty="true"] { color: var(--muted-foreground); }
/*  The sentence a failed greeting is said in. The destructive colour is the one
    the rest of the sheet already uses for something that went wrong rather than
    something the player did, and the words themselves are deliberately plain:
    this is a villager who could not be reached, not a mistake anybody made. */
.${ELEMENT_TAG}-chat-vn-text[data-error="true"] { color: var(--destructive, #e5484d); }
/*
  THE TWO REGISTERS OF A BEAT, and they are the Engine's own.

  A villager's turn is two things at once: what they SAY, and the room going on
  around them. Game Mode draws those as two registers in one window, and what
  separates them is ATTRIBUTION rather than decoration:

    - somebody speaking is drawn under their own face and their own name
    - the room describing itself is drawn under the word NARRATION and a bubble
      with no face over it at all. The Engine's own comment on that branch is
      "no avatar", and the pill below is its pill, copied to the values:
      rounded-full, the muted wash, .625rem, uppercase, wide tracking.

  0.4.56 got the second one wrong, and the mistake is worth naming rather than
  only fixing. The description was drawn in a bubble INSIDE the speaking
  register — under the villager's name and under the villager's face — which
  reads as that villager having said it, quietly. The words were in the right
  place on the card and attributed to the wrong speaker.

  So the label below is the fix, and it is a register of its own rather than an
  extra: the head of the card carries the speaker's name OR the word NARRATION
  and never both, because a beat belongs to whoever spoke it or to the room, and
  to nothing in between. The bubble underneath is the room's, drawn with nobody
  standing behind it — see the chat-vn-beat rule below, which is the bubble and
  no longer the whole register.

  This is the SHAPE of a beat, and deliberately not its line TYPE. The Engine's
  stage draws three more registers beside speech — something said across a room,
  something said to one listener, and somebody's private thought — and a village
  with one villager in the room can produce none of them. data-register is
  therefore this tab saying which of the two drawings it used, and the line
  types arrive with the room that can produce one: "side" for something said
  aloud to everybody present, "whisper" for something said to one listener, and
  "thought" if a room ever wants it.

  THE LINE TYPES HAVE ARRIVED — the first two of them, and as a stored field
  rather than as a second read of the words. The package's own turn reader takes
  a side tag or a whisper tag with a listener's name off the front of a line,
  stores the register beside the prose, and writes the content with the tag taken
  off, so a message can now arrive knowing two things a paragraph shape cannot
  describe: a remark said aloud but not offered to whoever is in front of them,
  and something said to one listener alone. Both of those are ordinary sentences
  and there is no punctuation that makes them otherwise — which is exactly why
  the villager marks them and why the client must not guess.

  So data-register now carries four names rather than two, and it lives on the
  CARD rather than on the bubble. That is the whole reason for the move: the
  head of the card is the speaker's name for a spoken beat and the word NARRATION
  for a described one, the bubble is the plate for anything the villager said and
  the room's own bubble only for the room, an aside leaves the plate for a small
  floating bubble of its own — see the aside rules further down, which are the
  Engine's second surface for exactly those lines — and a card that announces
  which drawing it is in lets all three dress from one fact instead of three
  rules guessing at the same thing.

  "thought" is still not here, and the reason is not that it is hard. An inner
  monologue the player is SHOWN is a different decision from something said out
  of the side of somebody's mouth, and it is a decision about whether the player
  may see it at all. The name is free when somebody makes that decision.

  INTENDED, NOT BUILT: a sprite system, and an expression per beat.

  The Engine's stage puts a character on the floor of the visual novel and lets
  a line carry the expression that goes with it — the nine effects its
  ExpressionReaction table knows, keyed to a mood and pinned to the face in the
  portrait. Villages has no sprite layer at all yet, so there is nothing here to
  attach an expression to. When there is, this is where it goes: one expression
  per beat, read beside the register below and drawn on the portrait above, not
  as a second drawing of the same words somewhere else.
*/
.${ELEMENT_TAG}-chat-vn-label {
  margin: 0; align-self: flex-start;
  padding: .125rem .5rem; border-radius: 999px;
  background: color-mix(in srgb, var(--foreground) 12%, transparent);
  font-size: .625rem; font-weight: 600; line-height: 1.5;
  letter-spacing: .04em; text-transform: uppercase;
  color: var(--muted-foreground);
}
/*
  THE ASIDES, AND THEY ARE DRAWN IN THE BAND ABOVE THE PLATE.

  This is the box the bubbles stand in rather than a bubble itself, and it exists
  because of WHERE the Engine draws these lines rather than because of what they
  look like. A side remark is "a small floating box shown with the dialogue it
  follows", so it cannot be drawn inside the plate and it cannot be drawn inside
  the room's own portrait either. It goes in the band between them — the dead
  room the vignette leaves above the card — justified to the END of it, which is
  where the Engine puts it and which is also the side of the window that is not
  the speaker's own face.

  Four things are decided here and each of them is deliberate:

    - flex-end, so the bubbles stack against the right-hand edge and a short
      remark sits at the end of the band instead of floating in the middle of it.
      The bubbles themselves are therefore content-sized: end alignment does not
      stretch, so a bubble is as wide as its own words and no wider.

    - a CEILING, because a villager who writes six asides is not a reason for the
      plate to be pushed off the bottom of the tab. The Engine caps its own block
      at min(16rem, 38vh); this is the same idea at this surface's own number,
      and it is a cqh rather than a vh because in fullscreen the tab and the
      window are two different boxes. Past the ceiling it scrolls, exactly as the
      Engine's own block does.

    - nothing at all when it is empty. The block is not drawn at all rather than
      drawn empty, so a turn that carries no aside draws precisely what it drew
      before any of this existed — the stage does not lose a band's worth of room
      to a box with no bubbles in it.

    - a 75 percent cap on each bubble, which is the Engine's own ratio kept
      because it is what makes a bubble read as an aside rather than as another
      paragraph. It is the one measurement in here that comes off the Engine's
      window rather than off this card's own furniture.
*/
.${ELEMENT_TAG}-chat-vn-asides {
  display: flex; flex-direction: column; align-items: flex-end; gap: .375rem;
  flex: 0 1 auto; min-height: 0; max-height: min(12rem, 30cqh);
  overflow-y: auto; overflow-x: hidden; overscroll-behavior: contain;
  padding-right: .25rem;
}
/*
  ONE BUBBLE, and it is the Engine's own small floating box copied to the values
  rather than imported: a round face a seventh of the card's own portrait, the
  type's mark beside the speaker's name at eleven pixels semibold, the listener
  after an arrow, and the words under both at twelve. The arrow is the Engine's
  own and so is the italic on a whisper, and both are kept because a whisper
  whose listener is not written down is an ordinary line with a symbol in front
  of it.

  Two translations, and both are forced by the surface underneath rather than
  chosen. The Engine draws these over a picture and fills them with black at
  three quarters, with a white hairline; this band is over a vignette and a card
  and not over a picture in the Engine's sense, so the same fill on it is a bubble
  with no edge at all — the fills are therefore this tab's own panel and border
  tokens at the Engine's own measured sizes, which is what makes the bubble read
  as a bubble here rather than as a hole in the stage. And the shadow is the
  Engine's, kept, because that is the half of the drawing that makes it float: a
  second surface that is only a second colour reads as another paragraph.

  flex: 0 0 auto, so a long bubble in a capped band scrolls rather than squashes.

  It has been in two wrong places before it got here, and both are worth naming
  because the sheet is where the mistake was both times. 0.4.56 drew an aside as
  a badge in the speaker's own row, which is a fact in the right place told inside
  the plate — the one thing the Engine never does with these lines. 0.4.57 took
  the badge out and pushed the whole bubble into the plate instead, which was
  worse: the aside stopped being a badge and started being the PARAGRAPH, so the
  line it followed left the card entirely and the player had to step the arrows
  to find it. This release fixes the second mistake and does not reintroduce the
  first: the plate is the plate, whatever the turn carries, and an aside is only
  ever something floating above it.
*/
.${ELEMENT_TAG}-chat-vn-aside {
  flex: 0 0 auto;
  display: flex; align-items: flex-start; gap: .5rem;
  max-width: 75%;
  padding: .5rem .75rem; border-radius: .75rem;
  border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  background: var(--marinara-chat-chrome-panel-bg, color-mix(in srgb, var(--popover) 92%, transparent));
  box-shadow: 0 1rem 2.375rem rgba(0, 0, 0, .45);
}
/* The whisper is the one aside that changes colour as well as mark. It is the
   pair of tokens this sheet already reserves for the thing being pointed at, and
   the Engine's own whisper bubble is the same pair — a whisper is the register
   whose whole meaning is WHO it was aimed at, so it is the register that gets the
   colour that means pointed at. */
.${ELEMENT_TAG}-chat-vn-aside[data-register="whisper"] {
  border-color: var(--marinara-chat-chrome-button-border, var(--marinara-chat-chrome-panel-border, var(--border)));
}
.${ELEMENT_TAG}-chat-vn-aside-face {
  position: relative; flex: 0 0 auto; margin-top: .125rem;
  display: flex; align-items: center; justify-content: center;
  width: 1.75rem; height: 1.75rem;
  border-radius: 999px; border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  background: var(--secondary);
  font-size: .6875rem; font-weight: 600;
  overflow: hidden;
}
.${ELEMENT_TAG}-chat-vn-aside-face > img { display: block; width: 100%; height: 100%; object-fit: cover; }
.${ELEMENT_TAG}-chat-vn-aside-column { display: flex; flex-direction: column; min-width: 0; flex: 1 1 auto; }
.${ELEMENT_TAG}-chat-vn-aside-head {
  display: flex; align-items: center; gap: .375rem;
  margin: 0; min-width: 0;
}
.${ELEMENT_TAG}-chat-vn-aside-icon { flex: 0 0 auto; font-size: .5625rem; }
.${ELEMENT_TAG}-chat-vn-aside-name {
  min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font-size: .6875rem; font-weight: 600; line-height: 1.4;
  color: var(--marinara-chat-chrome-highlight-text, var(--foreground));
}
.${ELEMENT_TAG}-chat-vn-aside-target {
  flex: 0 0 auto; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font-size: .5625rem; color: var(--muted-foreground);
}
.${ELEMENT_TAG}-chat-vn-aside-text {
  margin: .125rem 0 0; min-width: 0;
  font-size: .75rem; line-height: 1.6; font-style: normal;
  white-space: pre-wrap; overflow-wrap: break-word;
  color: var(--marinara-chat-chrome-panel-text, var(--foreground));
}
.${ELEMENT_TAG}-chat-vn-aside[data-register="whisper"] .${ELEMENT_TAG}-chat-vn-aside-text { font-style: italic; }
.${ELEMENT_TAG}-chat-vn-beat {
  margin: 0; align-self: flex-start; max-width: 100%;
  padding: .5rem .625rem; border-radius: .625rem;
  border: 1px solid var(--marinara-chat-chrome-panel-divider, color-mix(in srgb, var(--border) 60%, transparent));
  background: color-mix(in srgb, var(--foreground) 6%, transparent);
  color: var(--muted-foreground);
  font-size: .8125rem; line-height: 1.6;
  white-space: pre-wrap; overflow-wrap: break-word;
}
/*
  The marks a villager's line can carry, read by villages-inline-markdown.ts and
  assembled by renderVillagesMarkdown above.

  Only three of them need a rule. Bold and italic are the browser's own strong and
  em, and underline and strikethrough are the browser's own u and del, so the sheet
  says nothing about them; a code span, a link and a highlight would otherwise be
  indistinguishable from the words on either side of them.

  The Engine draws these same three — packages/client/src/styles/globals.css, at
  mari-md-inline-code and friends — and those rules cannot be borrowed, only
  copied: every one of them is scoped to mari-message-content, which is the
  Engine's chat bubble and not this card. The colours here are deliberately the
  Engine's, so a backtick span and a highlighted phrase look the same in a village
  as they do in a roleplay, and a highlight stays a colour the reader already
  knows rather than a new one this tab invented.
*/
.${ELEMENT_TAG}-chat-md-code {
  font-family: Consolas, Monaco, "Courier New", monospace;
  font-size: .85em; padding: .1em .35em; border-radius: 4px;
  background: rgba(255, 255, 255, .06); border: 1px solid rgba(255, 255, 255, .1);
  color: #e8e6e3; direction: ltr; unicode-bidi: isolate;
}
.${ELEMENT_TAG}-chat-md-link { color: var(--primary); text-decoration: underline; text-underline-offset: .12em; }
.${ELEMENT_TAG}-chat-md-link:hover { opacity: .85; }
.${ELEMENT_TAG}-chat-md-highlight {
  background: rgba(250, 204, 21, .15); color: #facc15;
  border-radius: 2px; padding: 0 .1em;
}
/*
  The arrows, drawn as a rule-separated row under the paragraph.

  They are hidden when there is nowhere to go at all, which is the common case for
  a short answer that came in one piece: a pair of dead arrows under every line of
  a village's small talk would be two controls that say "there is nothing more"
  fifty times a session. One step in either direction is enough to draw them, and
  the step may cross from one speaker to the other — the reading is the whole
  conversation, so the arrows walk out of the villager's line into the player's own
  and back again. The turns memo above the drawer is the list they walk.

  The rule above them is the Engine's own, drawn at half the weight of the card's
  edge because it separates two things inside one surface rather than ending a
  surface: the paragraph and the controls that walk it. The row carries the
  plate's own horizontal padding, so it reaches both edges of the plate while the
  two arrows sit in from them — the Engine's own inset, at the Engine's own size.

  The words are the Engine's own two as well, and they are worth being long: the
  card is one paragraph of a longer answer, and a control called Next on a card
  that is holding somebody's speech is a control next to what? The room above the
  arrows already knows where it is; the arrows are the only thing in the plate that
  has to say what they walk.
*/
.${ELEMENT_TAG}-chat-vn-nav {
  display: flex; align-items: center; justify-content: space-between; gap: .5rem;
  padding: .375rem .75rem;
  border-top: 1px solid var(--marinara-chat-chrome-panel-divider, color-mix(in srgb, var(--border) 50%, transparent));
  color: var(--marinara-chat-chrome-accent, var(--muted-foreground));
  font-size: .75rem;
}
.${ELEMENT_TAG}-chat-vn-counter {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: .6875rem; opacity: .75;
  color: var(--marinara-chat-chrome-accent, var(--muted-foreground));
  font-variant-numeric: tabular-nums;
}
.${ELEMENT_TAG}-chat-vn-button {
  display: inline-flex; align-items: center; gap: .25rem;
  border-radius: .25rem; padding: .25rem .5rem;
  background: transparent;
  color: var(--marinara-chat-chrome-accent, var(--muted-foreground));
  font-size: .75rem; font-family: inherit; cursor: pointer;
  transition: background-color .15s ease;
}
.${ELEMENT_TAG}-chat-vn-button svg { width: .875rem; height: .875rem; }
.${ELEMENT_TAG}-chat-vn-button:hover { background: var(--marinara-chat-chrome-button-bg-hover, color-mix(in srgb, var(--foreground) 10%, transparent)); }
.${ELEMENT_TAG}-chat-vn-button:disabled {
  cursor: default; opacity: .3;
  pointer-events: none;
}
/*
  The wait: one dot going round at the end of the reading.

  It stands in for two sentences — "N is thinking..." in the card and "N is
  saying goodbye..." in the log — and that is the whole argument for it. A line
  saying that somebody is thinking is a line the player reads once and has to
  read again on every turn, and the only thing it carries that a moving dot does
  not is a name the tab already has across the top of it.

  It is drawn in the place the answer is about to arrive rather than in a corner
  of its own: at the head of the reading, directly under the last thing the
  villager said, which is where the eye already is at the end of a turn and where
  the reply will appear a moment later. The same row is drawn while the villager
  is finding their first line and while an ordinary reply is in flight, because
  both are the same fact.

  The dot is not announced. What it means for anybody who cannot see it is in a
  hidden span beside it, since a spinner on its own is nothing to read out.
*/
.${ELEMENT_TAG}-chat-pending { display: flex; justify-content: flex-start; margin: 0; }
.${ELEMENT_TAG}-chat-spinner {
  flex: 0 0 auto;
  width: .75rem; height: .75rem; border-radius: 999px;
  border: 2px solid color-mix(in srgb, var(--muted-foreground) 30%, transparent);
  border-top-color: var(--muted-foreground);
}
/*
  Words for the accessibility tree and nobody else.

  Not the display:none form, which takes them out of the tree as well, and not a
  zero-width box, which some readers skip: this is the shape that is laid out as
  a one-pixel box with a one-pixel clip, so it keeps its name without keeping any
  room on the screen. The package had none of these until the spinner needed one,
  because every other control in the tab says what it is in visible words.
*/
.${ELEMENT_TAG}-visually-hidden {
  position: absolute; width: 1px; height: 1px;
  margin: -1px; padding: 0; border: 0;
  overflow: hidden; clip-path: inset(50%); white-space: nowrap;
}
/*
  NEVER BREAK A WORD.

  overflow-wrap: anywhere is the one that looks harmless and is not. It lets the
  layout engine count a box's smallest possible width as a single character, so
  any box with no other floor shrinks until the letters stack one per line.
  GachaForge measured its narrowest rail drawing "Inven/tory/scree/n" at 33
  pixels of text width, and this keyword was the cause.

  break-word still breaks a word that cannot fit — a URL, a name with no spaces —
  but it does not tell the layout engine that every word is a thing to be broken
  up, so the box keeps a floor of its longest word instead of a floor of one
  letter.
*/
.${ELEMENT_TAG}-msg { max-width: 88%; border-radius: .625rem; padding: .4375rem .625rem; font-size: .75rem; line-height: 1.5; white-space: pre-wrap; overflow-wrap: break-word; }
/*
  Two speakers, two washes.

  Both bubbles are the same construction: one soft gradient, light at the top
  left and very slightly deeper at the bottom right, mixed over the theme's own
  background so a change of theme carries through and so the mix knows how dark
  the surface it is landing on is. The text colour is --foreground in both cases
  and is never taken from the gradient, which is what keeps both readable in
  both themes: the wash is always most of the background's own colour, and
  --foreground is the colour the theme has already promised contrasts with that.

  The villager's is the quieter of the two — the theme's own accent at a low
  mix, which is a cool grey-blue in a dark theme and a pale lilac in a light
  one — because it is the surface an answer arrives on. The player's is a soft,
  light blue, built from a fixed blue HUE rather than from --primary: what makes
  it read as blue is the hue, and what makes it light or dark is the background
  it is mixed over. A hard-coded light blue would be unreadable in a dark theme
  and invisible in a light one, and the blue is the one thing here the player
  asked for by name.

  The player's is the stronger of the two on purpose: it is the one they wrote,
  it is the one they will look for, and if the two were equally loud the log
  would read as two people shouting, which is not what either of them is doing.
*/
.${ELEMENT_TAG}-msg[data-role="assistant"] {
  align-self: flex-start;
  background: linear-gradient(160deg, color-mix(in srgb, var(--primary) 14%, var(--background)), color-mix(in srgb, var(--primary) 6%, var(--background)));
  border: 1px solid var(--border);
}
.${ELEMENT_TAG}-msg[data-role="user"] {
  align-self: flex-end;
  background: linear-gradient(160deg, color-mix(in srgb, #60a5fa 26%, var(--background)), color-mix(in srgb, #60a5fa 13%, var(--background)));
  border: 1px solid color-mix(in srgb, #60a5fa 40%, transparent);
}
.${ELEMENT_TAG}-msg-pending { align-self: flex-start; font-size: .75rem; color: var(--muted-foreground); padding: .25rem .125rem; }
/*
  The judge's sentence, under the reply it produced. It is drawn as a footnote
  rather than a bubble because it is not something anybody said — it is the
  village's account of whether the player was believed, and the one place the
  player can find out why the answer went the way it did. The rule on the left
  is the whole of it: green for believed, red for not.
*/
.${ELEMENT_TAG}-ruling {
  align-self: stretch; margin: .125rem 0 0; padding: .25rem 0 .25rem .5rem;
  border-left: 2px solid var(--muted-foreground);
  font-size: .6875rem; line-height: 1.5; color: var(--muted-foreground);
}
.${ELEMENT_TAG}-ruling[data-fulfilled="true"] { border-left-color: var(--primary); color: var(--primary); }
.${ELEMENT_TAG}-ruling[data-fulfilled="false"] { border-left-color: var(--destructive, #e5484d); color: var(--destructive, #e5484d); }
/*
  How to talk, behind one button.

  The three verbs used to be three pills in a row across the bar, and the row was
  the problem: "Chat", "Ask something" and "Fulfill something" are about thirty
  characters of the twenty a phone's bar has, so on the screen this tab shares with
  the Engine's own panels the row WAS the bar and the box the player types in was
  an afterthought under it. The Engine's own answer is the shape this copies — its
  Connections switcher — and the reason is the same: what would be a row of words
  on a phone becomes one small square with a glyph on it, and the words live in a
  menu above it where there is room to say what each one is. It is also the shape
  the composer wants at its left-hand edge, where the glyph it now sits at the end
  of a line of words rather than in a corner of the row: a control at the edge of
  a box that opens something should look like one.

  A CIRCLE rather than the toolbar's rounded square. The options button in the
  head is a square and it presses something; this one opens a menu, and two
  controls over the same photograph should not look like each other when they do
  different things. The Engine makes the same distinction — its own attach button
  is round and its toolbar squares are not — and both are drawn in the chrome's
  tokens, since the bar is a translucent surface over a picture and a control that
  was not would be a hole in it.
*/
.${ELEMENT_TAG}-chat-mode-button {
  display: inline-flex; align-items: center; justify-content: center;
  width: 2rem; height: 2rem; padding: .375rem; box-sizing: border-box;
  border: 1px solid var(--marinara-chat-chrome-button-border, var(--border));
  border-radius: 999px;
  background: var(--marinara-chat-chrome-button-bg, var(--popover));
  color: var(--marinara-chat-chrome-button-text, var(--foreground));
  backdrop-filter: blur(12px);
  cursor: pointer;
  transition: border-color .15s ease, background-color .15s ease, color .15s ease;
}
.${ELEMENT_TAG}-chat-mode-button:hover {
  border-color: var(--marinara-chat-chrome-button-border-hover, var(--primary));
  background: var(--marinara-chat-chrome-button-bg-hover, var(--popover));
  color: var(--marinara-chat-chrome-button-text-hover, var(--primary));
}
.${ELEMENT_TAG}-chat-mode-button:focus-visible {
  outline: 2px solid var(--marinara-chat-chrome-focus-ring, var(--primary));
  outline-offset: 1px;
}
.${ELEMENT_TAG}-chat-mode-button:disabled { cursor: default; opacity: .5; }
.${ELEMENT_TAG}-chat-mode-button svg { width: 1rem; height: 1rem; }
/*
  The menu the button opens, modelled on the Connections switcher: a titled head
  over a list of rows, the row in force marked with a tick, and the whole thing
  bounded in both directions so a translation of the labels cannot push it off the
  tab. It is the second popover in the drawer and it is deliberately the same
  panel as the first — same tokens, same radius, same blur, same shadow — because
  a drawer with two kinds of menu in it is a drawer the player has to read twice.

  It opens UPWARD, off the box's own top edge, which is the other thing it has in
  common with the Connections switcher and with the Engine's own popovers: the box
  is on the floor of the tab, at the foot of the screen, and a menu that opened
  downward would be a menu off the bottom of it. It measures itself from the box
  rather than from the button inside it — the box is what the anchor inside it is
  static for, which is what puts the panel flush with the frame's top edge instead
  of a button's height into it.

  z-index 40 is the popover layer the options menu also sits on: both are drawn
  over the room, neither is ever over the other, since a press closes whichever
  one is not being pressed.
*/
.${ELEMENT_TAG}-chat-modes {
  position: absolute; left: 0; bottom: calc(100% + .375rem); z-index: 40;
  width: 15rem; max-width: min(15rem, 82cqw);
  max-height: min(20rem, 70cqh); overflow-y: auto;
  display: flex; flex-direction: column;
  border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  border-radius: .625rem;
  background: var(--marinara-chat-chrome-panel-bg, var(--popover, var(--background)));
  color: var(--marinara-chat-chrome-panel-text, var(--foreground));
  backdrop-filter: blur(12px);
  box-shadow: 0 .875rem 2rem rgba(0, 0, 0, .35);
}
.${ELEMENT_TAG}-chat-modes-head {
  display: flex; align-items: center; justify-content: space-between; gap: .5rem;
  border-bottom: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  padding: .4375rem .625rem;
  font-size: .6875rem; font-weight: 600;
}
.${ELEMENT_TAG}-chat-modes-list { display: flex; flex-direction: column; gap: .125rem; padding: .25rem; }
.${ELEMENT_TAG}-chat-mode-item {
  display: flex; align-items: center; gap: .5rem; width: 100%;
  border: 0; border-radius: .5rem; padding: .4375rem .5rem;
  background: transparent; color: inherit;
  font-size: .75rem; font-family: inherit; text-align: left; cursor: pointer;
  transition: background-color .15s ease;
}
.${ELEMENT_TAG}-chat-mode-item:hover { background: color-mix(in srgb, var(--foreground) 10%, transparent); }
.${ELEMENT_TAG}-chat-mode-item[data-active="true"] { font-weight: 600; }
.${ELEMENT_TAG}-chat-mode-item:disabled { cursor: default; opacity: .5; }
.${ELEMENT_TAG}-chat-mode-item-label { flex: 1 1 auto; min-width: 0; }
.${ELEMENT_TAG}-chat-mode-item svg { width: .875rem; height: .875rem; flex: 0 0 auto; }
/*
  The one press in the menu that is not a mode.

  Leaving is a verb of the conversation rather than a way of being answered, so it
  is drawn under a rule at the foot of the list rather than beside the three that
  are: a player scanning the modes should not find walking out among them. It is
  still drawn only where there is a conversation to leave — see showLeave — and
  it is the press that spends the goodbye, which is why it is here rather than
  beside the ending that follows it.
*/
.${ELEMENT_TAG}-chat-modes-foot {
  display: flex; flex-direction: column;
  border-top: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  padding: .25rem;
}
.${ELEMENT_TAG}-chat-modes-foot > .${ELEMENT_TAG}-button { width: 100%; justify-content: flex-start; text-align: left; }
/*
  Where the player says what they did for somebody.

  This is the third verb's box rather than a panel beside the ordinary one: the
  same composer, with the label and the claim input swapped in for the textarea,
  because a claim is still something being said to this villager and only one
  sentence is on the table at a time. The verbs underneath do not move, so
  changing your mind is pressing Chat and getting your half-written message back
  exactly as you left it — the draft belongs to the drawer, not to this box.
*/
.${ELEMENT_TAG}-claim { display: flex; flex-direction: column; gap: .375rem; }
.${ELEMENT_TAG}-composer { display: flex; flex-direction: column; gap: .375rem; }
.${ELEMENT_TAG}-textarea {
  width: 100%; box-sizing: border-box; resize: vertical; min-height: 3.25rem; max-height: 9rem;
  border: 1px solid var(--border); border-radius: .5rem;
  background: var(--background); color: var(--foreground);
  padding: .4375rem .5rem; font-size: .75rem; font-family: inherit; line-height: 1.5;
}
/*
  One row under the box, and it is the Engine's own composer.

  It used to be a grid of three columns — Leave on the left, the verbs centred,
  Send on the right — and 0.4.49 takes it apart for the shape the Engine's own
  roleplay composer has. 0.4.50 finishes the job: the way to talk moved inside the
  box, at its left-hand edge, where the press that sends already was at its
  right-hand edge — so the only thing left in this row is the box itself. Nothing
  is pinned to a corner because nothing is in a corner any more: how to talk is a
  menu rather than a row of words. Conclude selects an ending in that menu, and
  Send performs it.

  It stays a row of its own rather than being folded into the composer above it,
  because the box is what the row is for and a wrapper that says so reads better
  than a column whose only child is the thing the column is named after. The one
  child still takes the row: flex 1 1 auto with min-width 0, so a long line wraps
  inside the box rather than widening the row past the tab, and the box is the
  thing that shrinks on a narrow tab — the override that used to spread Leave and
  Send across two rows went with them.
*/
.${ELEMENT_TAG}-composer-row { display: flex; }
/* Textarea scrollbar widths must not resize its sibling scope or the mode menu. */
.${ELEMENT_TAG}-scene-scope { flex: 0 0 min(7rem, 30%); min-width: 0; max-width: 30%; margin: 0 .375rem 0 0; align-self: center; font-size: .625rem; line-height: 1.3; color: var(--muted-foreground); overflow-wrap: anywhere; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
.${ELEMENT_TAG}-composer-row > .${ELEMENT_TAG}-scene-scope + .${ELEMENT_TAG}-chat-input { flex: 1 1 0; }
.${ELEMENT_TAG}-contact-controls { display: flex; flex-wrap: wrap; gap: 6px; }
.${ELEMENT_TAG}-contact-controls > select { flex: 1 1 130px; min-width: 0; max-width: 100%; }
.${ELEMENT_TAG}-composer-row > .${ELEMENT_TAG}-claim,
.${ELEMENT_TAG}-composer-row > .${ELEMENT_TAG}-chat-input { flex: 1 1 auto; min-width: 0; }
/*
  The box, and both of the glyphs that belong to it.

  The press that sends is INSIDE the box, on its right-hand edge, and so is the
  button that chooses how the line will be taken, at its left-hand edge. The
  second one is what 0.4.50 moved: the box used to be the frame around the
  player's words with the way to talk standing outside it in the row, which made
  that button the one piece of the composer that was not in the composer. Both are
  glyphs, both are inside the same frame as the words they act on, and both are
  centred on the frame's height. The words are the only thing whose height
  changes as they wrap.

  The frame is the ENGINE'S OWN input shell, in the Engine's own words: the same
  rounded-2xl radius, the same input border and input fill, the same blurred
  backdrop, and the same focus behaviour — the border lights up and a one-pixel
  ring goes round the whole box when the caret is anywhere inside it, which is why
  the ring is on :focus-within rather than on the textarea. The press used to be a
  glyph button floating over a framed textarea's right edge; two frames around one
  act were one frame too many, and the shell is the one the Engine's composer
  already wears.

  The textarea inside it is stripped of its frame rather than given a second one:
  no border, no fill, no resize grip. The grip matters — a dragged corner would
  sit exactly where the glyph now is. The room composer grows from one line to
  two and then scrolls inside the frame.

  The button that sends is a glyph rather than a word in every one of the three
  verbs. The box already says what mode the player is in, so a label saying Send,
  Tell them or anything else would be a second statement of the same thing in the
  one part of the tab where there is no room for it. What it does NOT do is move
  when it does: the disabled state is the whole difference between an empty box
  and a full one, and it is opacity, which is what the Engine uses too.
*/
.${ELEMENT_TAG}-chat-input {
  position: relative; display: flex; align-items: center; gap: .5rem;
  padding: .375rem .5rem;
  border: 1px solid var(--marinara-chat-chrome-input-border, var(--border));
  border-radius: 1rem;
  background: var(--marinara-chat-chrome-input-bg, var(--background));
  color: var(--marinara-chat-chrome-panel-text, var(--foreground));
  box-shadow: 0 .0625rem .125rem rgba(0, 0, 0, .18);
  backdrop-filter: blur(12px);
  transition: border-color .2s ease, box-shadow .2s ease;
}
.${ELEMENT_TAG}-chat-input:focus-within {
  border-color: var(--marinara-chat-chrome-input-border-focus, var(--primary));
  box-shadow: 0 0 0 1px var(--marinara-chat-chrome-focus-ring, var(--primary));
}
/*
  The way to talk, at the frame's left-hand edge.

  Static rather than relative, and that is the whole of what this rule is for:
  the anchor is the thing the menu above it measures itself from, so taking its
  own positioning away hands that job up to the box, which is the nearest
  positioned thing over it. The menu therefore opens off the box's own top edge
  rather than off a button sitting in the middle of it — flush with the frame
  instead of a button's height into it.

  It keeps its own width, because it is a glyph and not a thing that stretches:
  flex 0 0 auto, so a long line cannot squash the control that says how the line
  will be read.
*/
.${ELEMENT_TAG}-chat-input > .${ELEMENT_TAG}-chat-menu-anchor { position: static; flex: 0 0 auto; }
/*
  The words, and the only thing in the frame that is allowed to change height.

  Its own horizontal padding is gone, because the glyphs beside it hold its two
  edges apart now: the frame's padding is the inset, and a second one inside the
  frame would be two insets for one gap. What is left is the vertical inset that
  keeps the first line off the frame's top edge.
*/
.${ELEMENT_TAG}-chat-input > .${ELEMENT_TAG}-textarea {
  flex: 1 1 auto; min-width: 0;
  border: 0; border-radius: 0; box-shadow: none; resize: none;
  background: transparent; color: inherit;
  min-height: 2.75rem; max-height: 9rem;
  padding: .3125rem 0;
}
/*
  The sentence the frame says when there is nothing to put in it.

  It is drawn INSIDE the frame rather than in the frame's place, because the frame
  carries the way back to the other verbs: a claim with nothing to settle is the
  one state where the player has a box they cannot type in, and a state with no
  frame would be a state with no way out of the verb. The sentence stretches to
  fill what the glyph beside it leaves and is a wrapping item rather than a rigid
  one, so it wraps inside the box instead of widening it.
*/
.${ELEMENT_TAG}-chat-input > .${ELEMENT_TAG}-hint { flex: 1 1 auto; min-width: 0; }
.${ELEMENT_TAG}-chat-send {
  display: inline-flex; align-items: center; justify-content: center;
  flex: 0 0 auto;
  width: 1.75rem; height: 1.75rem; padding: 0; box-sizing: border-box;
  border: 1px solid transparent; border-radius: 999px;
  background: transparent; color: var(--marinara-chat-chrome-panel-muted, var(--muted-foreground));
  cursor: pointer;
  transition: border-color .15s ease, background-color .15s ease, color .15s ease;
}
.${ELEMENT_TAG}-chat-send:hover {
  border-color: var(--marinara-chat-chrome-button-border-hover, var(--primary));
  background: color-mix(in srgb, var(--primary) 12%, transparent);
  color: var(--marinara-chat-chrome-button-text-hover, var(--primary));
}
.${ELEMENT_TAG}-chat-send:focus-visible {
  outline: 2px solid var(--marinara-chat-chrome-focus-ring, var(--primary));
  outline-offset: 1px;
}
.${ELEMENT_TAG}-chat-send:disabled { cursor: default; opacity: .45; }
.${ELEMENT_TAG}-chat-send:disabled:hover {
  border-color: transparent; background: transparent;
  color: var(--marinara-chat-chrome-panel-muted, var(--muted-foreground));
}
.${ELEMENT_TAG}-chat-send svg { width: 1rem; height: 1rem; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-send {
  width: auto; min-width: 4.5rem; height: 2.75rem; padding: 0 .75rem;
  border-color: var(--primary); border-radius: .75rem;
  background: var(--primary); color: var(--primary-foreground, white);
  font-size: .75rem; font-weight: 700; touch-action: manipulation;
}
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-mode-button {
  width: auto; min-width: 4.5rem; height: 2.25rem; padding: 0 .625rem;
  border-radius: .625rem; font-size: .75rem; font-weight: 700; white-space: nowrap;
}
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-send:hover:not(:disabled) {
  background: var(--primary); color: var(--primary-foreground, white);
}
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-pending { align-items: center; gap: .5rem; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-pending-label { font-size: .75rem; }
.${ELEMENT_TAG}-room-modes { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .375rem; }
.${ELEMENT_TAG}-room-mode {
  min-width: 0; min-height: 2.5rem; padding: .375rem .25rem;
  border: 1px solid var(--border); border-radius: .625rem;
  background: var(--popover); color: var(--foreground);
  font: inherit; font-size: .75rem; font-weight: 600; cursor: pointer;
}
.${ELEMENT_TAG}-room-mode[data-active="true"] { border-color: var(--primary); background: color-mix(in srgb, var(--primary) 18%, var(--popover)); color: var(--primary); }
.${ELEMENT_TAG}-room-mode:disabled { opacity: .5; cursor: default; }
.${ELEMENT_TAG}-room-mode:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.${ELEMENT_TAG}-room-error {
  display: flex; flex-wrap: wrap; align-items: center; gap: .5rem;
  border: 1px solid color-mix(in srgb, var(--destructive, #e5484d) 45%, transparent);
  border-radius: .625rem; padding: .625rem;
  background: color-mix(in srgb, var(--destructive, #e5484d) 9%, var(--popover));
  color: var(--destructive, #e5484d); font-size: .75rem;
}
.${ELEMENT_TAG}-room-error p { margin: 0; flex: 1 1 12rem; overflow-wrap: anywhere; }
.${ELEMENT_TAG}-room-error .${ELEMENT_TAG}-button { flex: 0 0 auto; border-color: currentColor; color: inherit; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat[data-opening-error="true"] .${ELEMENT_TAG}-chat-vn { display: none; }
.${ELEMENT_TAG}-hint { font-size: .625rem; color: var(--muted-foreground); }
/* Said in the colour a warning is said in, so enlarging a small picture is not
   something the player has to notice for themselves. */
.${ELEMENT_TAG}-hint[data-tone="warn"] { color: var(--destructive, #e5484d); }
.${ELEMENT_TAG}-field { display: flex; flex-direction: column; gap: .25rem; margin-top: .625rem; }
.${ELEMENT_TAG}-label { font-size: .6875rem; font-weight: 600; color: var(--muted-foreground); }
/* A switch is the box and its words as one control. Clicking the sentence
   toggles it, which is what every settings list is expected to do. */
.${ELEMENT_TAG}-switch { display: flex; align-items: flex-start; gap: .4375rem; font-size: .75rem; line-height: 1.5; cursor: pointer; }
.${ELEMENT_TAG}-switch[data-disabled="true"] { cursor: default; opacity: .5; }
.${ELEMENT_TAG}-switch input { flex: none; margin: .1875rem 0 0; accent-color: var(--primary); }
.${ELEMENT_TAG}-switch-hours { font-size: .625rem; color: var(--muted-foreground); font-variant-numeric: tabular-nums; }
/* Indented under the master switch, because it is what the master switch is
   holding open rather than a second, unrelated question. */
.${ELEMENT_TAG}-switches { display: grid; gap: .25rem; margin-top: .125rem; padding-left: 1.3125rem; }
/*
  The three places a panel opens a scrolling list inside a panel that already
  scrolls. Each ceiling is whichever is smaller: the length it has always had, or
  a share of the tab's height. On any tab big enough for the old number the old
  number is what binds, so nothing on a monitor moves; on a short tab the inner
  box stops being taller than the screen it is on, which is what turns one scroll
  region into two nested ones.
*/
.${ELEMENT_TAG}-preset {
  width: 100%; box-sizing: border-box; resize: vertical;
  min-height: 11rem; max-height: min(24rem, 60cqh);
  border: 1px solid var(--border); border-radius: .5rem;
  background: var(--background); color: var(--foreground);
  padding: .4375rem .5rem; font-size: .6875rem; line-height: 1.55;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
.${ELEMENT_TAG}-macros { display: flex; flex-wrap: wrap; gap: .375rem; margin-top: .5rem; }
.${ELEMENT_TAG}-macro {
  border: 1px solid var(--border); border-radius: .375rem;
  background: var(--background); color: var(--foreground);
  padding: .1875rem .4375rem; cursor: pointer;
  font-size: .625rem; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
.${ELEMENT_TAG}-macro:hover { border-color: var(--primary); color: var(--primary); }
.${ELEMENT_TAG}-macro-help { margin: .5rem 0 0; font-size: .625rem; line-height: 1.55; color: var(--muted-foreground); }
/* A control that is switched off while the village setup flow which will owe it
   is still being written. The prose around it stays at full strength, because
   the reason it is off is the thing worth reading; the control itself is dimmed
   so nobody tries to type into a box that will not take the letters. */
.${ELEMENT_TAG}-off { opacity: .5; }
/*
  A translation prompt, printed verbatim. Monospaced and scrollable, because it
  is read as the thing being worked on rather than as prose: a prompt reflowed
  into a paragraph is a prompt nobody can compare against the one they meant to
  write. The cap is here rather than on the overlay so that a villager with a
  long week cannot push the whole panel off the bottom of the tab.
*/
.${ELEMENT_TAG}-prompt {
  margin: .5rem 0 0; padding: .4375rem .5rem;
  max-height: min(18rem, 55cqh); overflow: auto;
  border: 1px solid var(--border); border-radius: .5rem;
  background: var(--background); color: var(--foreground);
  font-size: .625rem; line-height: 1.55;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  white-space: pre-wrap; overflow-wrap: break-word;
}
.${ELEMENT_TAG}-notice-row { display: flex; align-items: flex-start; gap: .5rem; font-size: .75rem; line-height: 1.5; color: var(--muted-foreground); }
.${ELEMENT_TAG}-notice-row > span { flex: 1 1 auto; min-width: 0; }
.${ELEMENT_TAG}-notice-author { font-weight: 600; color: var(--foreground); }
.${ELEMENT_TAG}-notice-add { display: flex; gap: .5rem; margin-top: .625rem; }
.${ELEMENT_TAG}-notice-input {
  flex: 1 1 auto; min-width: 0; box-sizing: border-box;
  border: 1px solid var(--border); border-radius: .5rem;
  background: var(--background); color: var(--foreground);
  padding: .375rem .5rem; font-size: .75rem; font-family: inherit;
}
/*
  A place and its picture: the picture on the left, its name and the buttons
  that act on it on the right. A grid rather than a flex row so the names line
  up down the column even when one of them wraps to two lines, which is what
  makes the list read as a list instead of as a stack of unrelated things.
*/
.${ELEMENT_TAG}-places { margin: .5rem 0 0; padding: 0; list-style: none; display: grid; gap: .625rem; }
.${ELEMENT_TAG}-place { display: grid; grid-template-columns: 4.5rem minmax(0, 1fr); gap: .625rem; align-items: start; }
.${ELEMENT_TAG}-place-thumb {
  width: 4.5rem; height: 3rem; display: block; object-fit: cover;
  border: 1px solid var(--border); border-radius: .375rem;
  background: var(--muted, rgba(127, 127, 127, .08));
}
/* Empty is drawn as empty — dashed rather than solid — so "no picture yet" is
   visibly a state the village is in rather than a picture that failed. */
.${ELEMENT_TAG}-place-thumb[data-empty="true"] { border-style: dashed; }
.${ELEMENT_TAG}-place-body { display: flex; flex-direction: column; gap: .25rem; min-width: 0; }
.${ELEMENT_TAG}-place-name { font-size: .75rem; font-weight: 600; color: var(--foreground); overflow-wrap: break-word; }
/* The buttons hug the name rather than sitting a row's gap below it: the row
   margin is right for a row under a paragraph and wrong for one under a label. */
.${ELEMENT_TAG}-place-body .${ELEMENT_TAG}-row { margin-top: 0; }
.${ELEMENT_TAG}-place-body .${ELEMENT_TAG}-file { font-size: .625rem; }
/*
  THE PLACE ITSELF, as the screen that stands in it: its picture on one side and
  what the village knows on the other.

  flex-wrap rather than a media query, because the tab is not the window. In
  fullscreen the Engine hands this package a box whose width has nothing to do
  with the viewport, so a query on max-width would be answering a different
  question; two items whose bases add up to more than the row fall onto two rows
  wherever that line happens to be. The picture keeps its basis and the text grows
  into the rest, so the only two shapes are "beside" and "under".

  A place nobody has drawn is the same box with nothing in it, dashed, which is
  the statement the places list already makes for a picture that is not there yet.
*/
.${ELEMENT_TAG}-venue { display: flex; flex-wrap: wrap; gap: 1rem; margin-top: .875rem; align-items: flex-start; }
.${ELEMENT_TAG}-venue-exterior { flex: 0 1 18rem; min-width: 0; display: flex; flex-direction: column; gap: .625rem; }
.${ELEMENT_TAG}-venue-picture {
  flex: 0 1 18rem; min-width: 0; box-sizing: border-box;
  aspect-ratio: 4 / 3; border-radius: .625rem;
  background: var(--muted, rgba(127, 127, 127, .08));
}
.${ELEMENT_TAG}-venue-picture:not([data-empty="true"]) {
  display: block; width: 100%; object-fit: cover; border: 1px solid var(--border);
}
.${ELEMENT_TAG}-venue-picture[data-empty="true"] {
  display: flex; align-items: center; justify-content: center;
  border: 1px dashed var(--border); padding: .5rem; text-align: center;
  font-size: .6875rem; line-height: 1.5; color: var(--muted-foreground);
}
.${ELEMENT_TAG}-venue-body { flex: 1 1 20rem; min-width: 0; display: flex; flex-direction: column; gap: .625rem; }
/* The buttons hug the beat above them rather than sitting a row's margin below it,
   which is the same substitution the places list makes under a name. */
.${ELEMENT_TAG}-venue-body .${ELEMENT_TAG}-row { margin-top: 0; }
/* The look-around is the one paragraph on this screen, so it is set at reading
   size rather than at the sheet's label size. */
.${ELEMENT_TAG}-venue-beat { margin: 0; font-size: .875rem; line-height: 1.65; }
.${ELEMENT_TAG}-venue-page, .${ELEMENT_TAG}-venue-editor-page, .${ELEMENT_TAG}-venue-proposal-page {
  display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;
}
.${ELEMENT_TAG}-venue-hero {
  display: grid; grid-template-columns: minmax(15rem, 30rem) minmax(15rem, 38rem);
  gap: 1rem; align-items: start;
}
.${ELEMENT_TAG}-venue-hero > .${ELEMENT_TAG}-venue-picture,
.${ELEMENT_TAG}-venue-hero > .${ELEMENT_TAG}-venue-image-empty {
  width: 100%; min-height: 0; max-height: 22.5rem; aspect-ratio: 4 / 3;
}
.${ELEMENT_TAG}-venue-context, .${ELEMENT_TAG}-venue-card {
  display: flex; flex-direction: column; align-items: flex-start; gap: .625rem;
  border: 1px solid var(--border); border-radius: .75rem;
  background: var(--popover); padding: 1rem;
}
.${ELEMENT_TAG}-venue-context p, .${ELEMENT_TAG}-venue-card p { margin: 0; }
.${ELEMENT_TAG}-venue-context { align-self: center; }
.${ELEMENT_TAG}-venue-space-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr)); gap: 1rem; }
.${ELEMENT_TAG}-venue-card .${ELEMENT_TAG}-venue-space-picture {
  width: 100%; max-width: none; max-height: 16rem; aspect-ratio: 16 / 10;
}
.${ELEMENT_TAG}-venue-image-empty {
  display: grid; place-items: center; width: 100%; min-height: 10rem; max-height: 16rem;
  border: 1px dashed var(--border); border-radius: .625rem; color: var(--muted-foreground);
  background: var(--background); text-align: center; font-size: .75rem;
}
.${ELEMENT_TAG}-venue-visit-picker { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; }
.${ELEMENT_TAG}-venue-scene-details { width: 100%; border-top: 1px solid var(--border); padding-top: .5rem; }
.${ELEMENT_TAG}-venue-scene-details summary { cursor: pointer; font-weight: 600; }
.${ELEMENT_TAG}-venue-scene-details[open] { display: flex; flex-direction: column; gap: .625rem; }
@media (max-width: 700px) {
  .${ELEMENT_TAG}-venue-hero { grid-template-columns: 1fr; }
  .${ELEMENT_TAG}-venue-page .${ELEMENT_TAG}-button,
  .${ELEMENT_TAG}-venue-editor-page .${ELEMENT_TAG}-button,
  .${ELEMENT_TAG}-venue-proposal-page .${ELEMENT_TAG}-button { min-height: 2.5rem; }
}
/* Villages' current UI language: dark navy, blue glass surfaces, violet focus.
   These scoped values can become a selectable theme palette in a later release. */
.${ELEMENT_TAG}-root[data-venue-view="true"] {
  --venue-bg: #091431;
  --venue-panel: #132653;
  --venue-border: #2d4a91;
  --venue-text: #f3f4ff;
  --venue-muted: #c0c9ee;
  --venue-accent: #7545fb;
  display: grid; grid-template-columns: clamp(13rem, 18cqw, 16rem) minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr); gap: 0; padding: 0;
  background: radial-gradient(circle at 78% 25%, #172d61 0, transparent 52%), linear-gradient(120deg, #09132f, #0e1e43);
  color: var(--venue-text);
}
.${ELEMENT_TAG}-root[data-venue-view="true"] > .${ELEMENT_TAG}-header {
  grid-column: 2; grid-row: 1; align-items: center; padding: 1.25rem 1.5rem .75rem;
}
.${ELEMENT_TAG}-root[data-venue-view="true"] .${ELEMENT_TAG}-venue-header-controls { display: flex; flex-direction: column; align-items: flex-end; gap: .5rem; min-width: 0; }
.${ELEMENT_TAG}-root[data-venue-view="true"] .${ELEMENT_TAG}-actions { flex-wrap: wrap; justify-content: flex-end; }
.${ELEMENT_TAG}-venue-move-error { max-width: 27rem; margin: 0; color: #ffb7c1; font-size: .8rem; line-height: 1.4; text-align: right; }
.${ELEMENT_TAG}-root[data-venue-view="true"] .${ELEMENT_TAG}-title { font-size: clamp(1.35rem, 2.4cqw, 2rem); font-weight: 700; }
.${ELEMENT_TAG}-root[data-venue-view="true"] .${ELEMENT_TAG}-subtitle { color: var(--venue-muted); font-size: .88rem; }
.${ELEMENT_TAG}-root[data-venue-view="true"] .${ELEMENT_TAG}-header .${ELEMENT_TAG}-button,
.${ELEMENT_TAG}-venue-back {
  border: 1px solid #6478c1; border-radius: .7rem; background: #142653;
  color: var(--venue-text); padding: .65rem .9rem; font: inherit; cursor: pointer;
}
.${ELEMENT_TAG}-root[data-venue-view="true"] .${ELEMENT_TAG}-header .${ELEMENT_TAG}-button:hover,
.${ELEMENT_TAG}-venue-back:hover { border-color: #aa92ff; background: #203774; }
.${ELEMENT_TAG}-root[data-venue-view="true"] > .${ELEMENT_TAG}-venue-page { display: contents; }
.${ELEMENT_TAG}-venue-zones {
  grid-column: 1; grid-row: 1 / span 2; display: flex; flex-direction: column; gap: .65rem;
  min-height: 0; overflow-y: auto; padding: 1rem .65rem;
  border-right: 1px solid #314782;
  background: radial-gradient(circle at 30% 85%, #274588, transparent 65%), linear-gradient(#10214a, #142a5b);
}
.${ELEMENT_TAG}-venue-back { min-height: 2.7rem; margin: 0 .1rem 1rem; }
.${ELEMENT_TAG}-venue-zone-tab {
  display: flex; align-items: center; gap: .65rem; min-width: 0; width: 100%;
  border: 1px solid transparent; border-radius: .72rem; padding: .45rem;
  background: transparent; color: var(--venue-text); text-align: left; font: inherit; cursor: pointer;
}
.${ELEMENT_TAG}-venue-zone-tab:hover { background: #253b75; }
.${ELEMENT_TAG}-venue-zone-tab[data-active="true"] {
  border-color: #8060ff; background: linear-gradient(105deg, #5139b4, #253c8d);
  box-shadow: 0 0 0 2px #8756ff, 0 0 1.1rem #683cf977;
}
.${ELEMENT_TAG}-venue-zone-tab:focus-visible, .${ELEMENT_TAG}-venue-back:focus-visible,
.${ELEMENT_TAG}-venue-visit:focus-visible { outline: 3px solid #b6a2ff; outline-offset: 2px; }
.${ELEMENT_TAG}-venue-zone-thumb {
  flex: 0 0 3.4rem; display: grid; place-items: center; width: 3.4rem; height: 3.4rem;
  overflow: hidden; border: 1px solid #5570b0; border-radius: .42rem; background: #18254d;
}
.${ELEMENT_TAG}-venue-zone-thumb img { width: 100%; height: 100%; object-fit: cover; }
.${ELEMENT_TAG}-venue-zone-thumb > span { font-size: 1.5rem; color: #b5c3ec; }
.${ELEMENT_TAG}-venue-zone-copy { min-width: 0; }
.${ELEMENT_TAG}-venue-zone-copy strong, .${ELEMENT_TAG}-venue-zone-copy small { display: block; overflow-wrap: anywhere; }
.${ELEMENT_TAG}-venue-zone-copy strong { font-size: .78rem; line-height: 1.3; }
.${ELEMENT_TAG}-venue-zone-copy small { color: var(--venue-muted); font-size: .68rem; line-height: 1.35; }
.${ELEMENT_TAG}-venue-zone-content {
  grid-column: 2; grid-row: 2; display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(16rem, 1fr);
  align-items: start; gap: 1rem; min-width: 0; padding: .75rem 1.5rem 1.5rem;
}
.${ELEMENT_TAG}-venue-zone-main { display: flex; flex-direction: column; gap: 1rem; min-width: 0; }
.${ELEMENT_TAG}-venue-artwork { overflow: hidden; border: 1px solid var(--venue-border); border-radius: .85rem; background: #0c1732; }
.${ELEMENT_TAG}-venue-artwork img, .${ELEMENT_TAG}-venue-artwork-empty {
  display: block; width: 100%; aspect-ratio: 16 / 10; object-fit: cover;
}
.${ELEMENT_TAG}-venue-artwork-empty { display: grid; place-items: center; color: var(--venue-muted); text-align: center; }
.${ELEMENT_TAG}-venue-zone-context {
  min-width: 0; border: 1px solid var(--venue-border); border-radius: .8rem;
  background: linear-gradient(145deg, #142753, #101e42); padding: 1rem 1.15rem;
}
.${ELEMENT_TAG}-venue-zone-context h2 { margin: 0 0 .55rem; font-size: 1.2rem; }
.${ELEMENT_TAG}-venue-zone-context p { margin: 0; color: var(--venue-muted); line-height: 1.6; }
.${ELEMENT_TAG}-venue-more { margin-top: 1rem; border: 1px solid var(--venue-border); border-radius: .6rem; padding: .7rem .9rem; }
.${ELEMENT_TAG}-venue-more summary { cursor: pointer; }
.${ELEMENT_TAG}-venue-more p { margin-top: .65rem; }
.${ELEMENT_TAG}-venue-zone-context { display: flex; flex-direction: column; min-height: min(31rem, 63cqh); }
.${ELEMENT_TAG}-venue-kicker { color: #b9c5ff; font-size: .72rem; text-transform: uppercase; letter-spacing: .08em; }
.${ELEMENT_TAG}-venue-zone-stat { display: flex; justify-content: space-between; gap: .65rem; border-top: 1px solid #29447f; margin-top: 1.1rem; padding: 1rem 0 0; }
.${ELEMENT_TAG}-venue-zone-stat span { color: var(--venue-muted); }
.${ELEMENT_TAG}-venue-zone-stat strong { font-weight: 500; text-align: right; }
.${ELEMENT_TAG}-venue-zone-guidance { margin-top: 1rem !important; font-size: .85rem; }
.${ELEMENT_TAG}-venue-visit {
  width: 100%; min-height: 3.25rem; margin-top: auto; border: 0; border-radius: .55rem;
  background: linear-gradient(100deg, #3156e8, var(--venue-accent));
  color: white; font: inherit; font-size: 1rem; font-weight: 700; cursor: pointer;
}
.${ELEMENT_TAG}-venue-visit:disabled { opacity: .48; cursor: default; }
@container (max-width: 48rem) {
  .${ELEMENT_TAG}-root[data-venue-view="true"] { display: flex; flex-direction: column; }
  .${ELEMENT_TAG}-root[data-venue-view="true"] > .${ELEMENT_TAG}-header { order: 0; padding: 1rem; }
  .${ELEMENT_TAG}-root[data-venue-view="true"] .${ELEMENT_TAG}-venue-header-controls { align-items: flex-start; }
  .${ELEMENT_TAG}-root[data-venue-view="true"] .${ELEMENT_TAG}-actions { justify-content: flex-start; }
  .${ELEMENT_TAG}-root[data-venue-view="true"] .${ELEMENT_TAG}-venue-move-error { text-align: left; }
  .${ELEMENT_TAG}-root[data-venue-view="true"] > .${ELEMENT_TAG}-venue-page { order: 1; display: flex; flex-direction: column; margin: 0; }
  .${ELEMENT_TAG}-venue-zones { order: 0; flex-direction: row; overflow-x: auto; overflow-y: hidden; padding: .7rem; border-right: 0; border-bottom: 1px solid #314782; }
  .${ELEMENT_TAG}-venue-back { flex: 0 0 auto; margin: 0; }
  .${ELEMENT_TAG}-venue-zone-tab { flex: 0 0 11rem; }
  .${ELEMENT_TAG}-venue-zone-content { order: 2; display: flex; flex-direction: column; width: 100%; box-sizing: border-box; padding: 1rem; }
  .${ELEMENT_TAG}-venue-zone-main, .${ELEMENT_TAG}-venue-zone-context { width: 100%; box-sizing: border-box; }
  .${ELEMENT_TAG}-venue-zone-context { min-height: 0; gap: .25rem; }
  .${ELEMENT_TAG}-venue-visit { margin-top: 1rem; }
}
/*
  The village story. A flat list under a date heading, scrolled by the overlay
  it sits in, with a monospaced stamp on the memories that carry one. The max
  height is here rather than on the overlay so a very old village cannot push
  the panel taller than the tab.
*/
.${ELEMENT_TAG}-story { margin: 0 0 .75rem; padding: 0; list-style: none; display: grid; gap: .375rem; max-height: min(26rem, 60cqh); overflow-y: auto; }
.${ELEMENT_TAG}-story-day {
  position: sticky; top: 0; z-index: 1; margin: 0 0 .375rem;
  background: var(--background); padding: .125rem 0;
  font-size: .625rem; font-weight: 600; letter-spacing: .04em;
  text-transform: uppercase; color: var(--muted-foreground);
}
.${ELEMENT_TAG}-story-row { display: flex; align-items: flex-start; gap: .5rem; font-size: .75rem; line-height: 1.5; color: var(--muted-foreground); }
.${ELEMENT_TAG}-story-row > span { flex: 1 1 auto; min-width: 0; }
.${ELEMENT_TAG}-story-meta {
  display: block; margin-bottom: .0625rem;
  font-size: .625rem; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  color: var(--muted-foreground);
}
.${ELEMENT_TAG}-story-scope { color: var(--primary); }
/* Villagers → Memories: a calm library, not a diagnostic table. */
.${ELEMENT_TAG}-villager-submenu {
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5rem; margin: 0 0 1rem;
  padding: .3rem; border: 1px solid color-mix(in srgb, var(--border) 76%, transparent);
  border-radius: .85rem; background: color-mix(in srgb, var(--muted) 55%, transparent);
}
.${ELEMENT_TAG}-villager-submenu button {
  display: flex; flex-direction: column; align-items: flex-start; gap: .12rem; min-width: 0;
  border: 0; border-radius: .62rem; padding: .62rem .8rem; background: transparent; color: var(--muted-foreground);
  text-align: left; cursor: pointer; transition: background .16s ease, color .16s ease, box-shadow .16s ease;
}
.${ELEMENT_TAG}-villager-submenu button[data-active="true"] {
  background: var(--background); color: var(--foreground); box-shadow: 0 1px 8px color-mix(in srgb, #000 12%, transparent);
}
.${ELEMENT_TAG}-villager-submenu span { font-size: .8rem; font-weight: 700; }
.${ELEMENT_TAG}-villager-submenu small { overflow: hidden; max-width: 100%; font-size: .64rem; text-overflow: ellipsis; white-space: nowrap; }
.${ELEMENT_TAG}-memory-library { display: flex; flex-direction: column; gap: 1rem; }
.${ELEMENT_TAG}-memory-hero {
  display: grid; grid-template-columns: minmax(0, 1.7fr) minmax(12rem, .8fr); gap: 1rem; padding: 1.15rem;
  overflow: hidden; border: 1px solid color-mix(in srgb, var(--primary) 25%, var(--border)); border-radius: 1rem;
  background:
    radial-gradient(circle at 92% 8%, color-mix(in srgb, var(--primary) 23%, transparent), transparent 37%),
    linear-gradient(145deg, color-mix(in srgb, var(--popover) 95%, transparent), color-mix(in srgb, var(--muted) 62%, transparent));
}
.${ELEMENT_TAG}-memory-kicker { font-size: .62rem; font-weight: 800; letter-spacing: .11em; text-transform: uppercase; color: var(--primary); }
.${ELEMENT_TAG}-memory-hero h3 { margin: .28rem 0 .38rem; font-family: Georgia, 'Times New Roman', serif; font-size: clamp(1.15rem, 3vw, 1.7rem); font-weight: 500; }
.${ELEMENT_TAG}-memory-hero p { max-width: 50rem; margin: 0; color: var(--muted-foreground); font-size: .76rem; line-height: 1.55; }
.${ELEMENT_TAG}-memory-stats { display: grid; grid-template-columns: repeat(3, 1fr); align-self: stretch; gap: .4rem; }
.${ELEMENT_TAG}-memory-stats span { display: flex; flex-direction: column; justify-content: center; min-width: 0; border: 1px solid color-mix(in srgb, var(--border) 72%, transparent); border-radius: .72rem; padding: .62rem .35rem; background: color-mix(in srgb, var(--background) 78%, transparent); text-align: center; color: var(--muted-foreground); font-size: .6rem; }
.${ELEMENT_TAG}-memory-stats strong { color: var(--foreground); font-family: Georgia, 'Times New Roman', serif; font-size: 1.28rem; font-weight: 500; }
.${ELEMENT_TAG}-memory-layers { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .55rem; }
.${ELEMENT_TAG}-memory-layers article { display: grid; grid-template-columns: auto 1fr; gap: .05rem .48rem; border: 1px solid var(--border); border-radius: .72rem; padding: .65rem .72rem; background: color-mix(in srgb, var(--background) 74%, transparent); }
.${ELEMENT_TAG}-memory-layers article > span { grid-row: 1 / span 2; color: color-mix(in srgb, var(--primary) 72%, var(--muted-foreground)); font: 700 .58rem/1.35 ui-monospace, monospace; }
.${ELEMENT_TAG}-memory-layers strong { font-size: .7rem; }
.${ELEMENT_TAG}-memory-layers p { margin: 0; color: var(--muted-foreground); font-size: .62rem; line-height: 1.35; }
.${ELEMENT_TAG}-memory-health { display: flex; align-items: center; gap: .7rem; border: 1px solid color-mix(in srgb, #d59a34 50%, var(--border)); border-radius: .72rem; padding: .66rem .78rem; background: color-mix(in srgb, #d59a34 9%, var(--background)); }
.${ELEMENT_TAG}-memory-health > span { color: #d59a34; font-size: 1.2rem; }
.${ELEMENT_TAG}-memory-health > div { flex: 1; min-width: 0; }
.${ELEMENT_TAG}-memory-health strong { font-size: .72rem; }
.${ELEMENT_TAG}-memory-health p { margin: .08rem 0 0; color: var(--muted-foreground); font-size: .62rem; }
.${ELEMENT_TAG}-memory-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; }
.${ELEMENT_TAG}-memory-toolbar input { flex: 1 1 12rem; min-width: 0; }
.${ELEMENT_TAG}-memory-toolbar input, .${ELEMENT_TAG}-memory-toolbar select { min-height: 2.25rem; border: 1px solid var(--border); border-radius: .58rem; padding: .42rem .62rem; background: var(--background); color: var(--foreground); font-size: .72rem; }
.${ELEMENT_TAG}-memory-tabs { display: flex; gap: .18rem; border: 1px solid var(--border); border-radius: .6rem; padding: .2rem; background: var(--muted); }
.${ELEMENT_TAG}-memory-tabs button { border: 0; border-radius: .4rem; padding: .38rem .62rem; background: transparent; color: var(--muted-foreground); font-size: .68rem; cursor: pointer; }
.${ELEMENT_TAG}-memory-tabs button[data-active="true"] { background: var(--background); color: var(--foreground); box-shadow: 0 1px 4px color-mix(in srgb, #000 12%, transparent); }
.${ELEMENT_TAG}-memory-section { display: flex; flex-direction: column; gap: .55rem; }
.${ELEMENT_TAG}-memory-section-head { display: flex; align-items: center; justify-content: space-between; gap: .6rem; }
.${ELEMENT_TAG}-memory-section-head > div { display: flex; align-items: center; gap: .48rem; min-width: 0; }
.${ELEMENT_TAG}-memory-section-head h3 { margin: 0; font-size: .78rem; }
.${ELEMENT_TAG}-memory-section-head > span { color: var(--muted-foreground); font-size: .62rem; }
.${ELEMENT_TAG}-memory-orb { display: grid; place-items: center; width: 1.55rem; height: 1.55rem; border-radius: 50%; font-size: .72rem; }
.${ELEMENT_TAG}-memory-orb[data-kind="passing"] { background: color-mix(in srgb, #60a5fa 16%, transparent); color: #60a5fa; }
.${ELEMENT_TAG}-memory-orb[data-kind="durable"] { background: color-mix(in srgb, #e5b94b 17%, transparent); color: #dcae35; }
.${ELEMENT_TAG}-memory-orb[data-kind="archive"] { background: color-mix(in srgb, var(--primary) 15%, transparent); color: var(--primary); }
.${ELEMENT_TAG}-memory-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr)); gap: .62rem; }
.${ELEMENT_TAG}-memory-card { display: flex; flex-direction: column; gap: .58rem; min-width: 0; border: 1px solid var(--border); border-radius: .82rem; padding: .8rem; background: color-mix(in srgb, var(--popover) 94%, transparent); box-shadow: 0 5px 20px color-mix(in srgb, #000 6%, transparent); }
.${ELEMENT_TAG}-memory-card[data-kind="passing"] { border-left: 3px solid color-mix(in srgb, #60a5fa 72%, var(--border)); }
.${ELEMENT_TAG}-memory-card[data-kind="durable"] { border-left: 3px solid color-mix(in srgb, #e5b94b 78%, var(--border)); }
.${ELEMENT_TAG}-memory-card-top { display: flex; align-items: center; justify-content: space-between; gap: .5rem; color: var(--muted-foreground); font-size: .6rem; }
.${ELEMENT_TAG}-memory-pill { overflow: hidden; border-radius: 999px; padding: .2rem .42rem; background: color-mix(in srgb, var(--primary) 11%, var(--muted)); color: color-mix(in srgb, var(--primary) 82%, var(--foreground)); font-weight: 750; text-overflow: ellipsis; white-space: nowrap; }
.${ELEMENT_TAG}-memory-text { margin: 0; color: var(--foreground); font-family: Georgia, 'Times New Roman', serif; font-size: .9rem; line-height: 1.45; }
.${ELEMENT_TAG}-memory-card dl { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .38rem; margin: 0; }
.${ELEMENT_TAG}-memory-card dl > div { min-width: 0; border-top: 1px solid color-mix(in srgb, var(--border) 70%, transparent); padding-top: .38rem; }
.${ELEMENT_TAG}-memory-card dt { color: var(--muted-foreground); font-size: .55rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; }
.${ELEMENT_TAG}-memory-card dd { overflow: hidden; margin: .08rem 0 0; font-size: .66rem; text-overflow: ellipsis; }
.${ELEMENT_TAG}-memory-reinforced, .${ELEMENT_TAG}-memory-footnote, .${ELEMENT_TAG}-memory-legacy { margin: 0; color: var(--muted-foreground); font-size: .6rem; }
.${ELEMENT_TAG}-memory-card-actions { display: flex; align-items: center; justify-content: space-between; gap: .5rem; margin-top: auto; }
.${ELEMENT_TAG}-memory-card-actions button, .${ELEMENT_TAG}-memory-evidence button { border: 0; padding: .18rem 0; background: transparent; color: var(--primary); font-size: .64rem; font-weight: 700; cursor: pointer; }
.${ELEMENT_TAG}-memory-card-actions button:last-child { color: var(--muted-foreground); }
.${ELEMENT_TAG}-memory-empty { display: grid; place-items: center; min-height: 10rem; border: 1px dashed var(--border); border-radius: .82rem; padding: 1rem; text-align: center; color: var(--muted-foreground); }
.${ELEMENT_TAG}-memory-empty span { color: var(--primary); font-size: 1.35rem; }
.${ELEMENT_TAG}-memory-empty h3 { margin: .25rem 0 0; color: var(--foreground); font-size: .82rem; }
.${ELEMENT_TAG}-memory-empty p { margin: .15rem 0 0; font-size: .68rem; }
.${ELEMENT_TAG}-memory-evidence { display: flex; flex-direction: column; gap: .58rem; border: 1px solid color-mix(in srgb, var(--primary) 28%, var(--border)); border-radius: .82rem; padding: .82rem; background: color-mix(in srgb, var(--primary) 4%, var(--background)); }
.${ELEMENT_TAG}-memory-evidence > p { margin: 0; color: var(--muted-foreground); font-size: .64rem; }
.${ELEMENT_TAG}-memory-evidence ol { display: grid; gap: .42rem; margin: 0; padding: 0; list-style: none; }
.${ELEMENT_TAG}-memory-evidence li { border-left: 2px solid color-mix(in srgb, var(--primary) 46%, var(--border)); padding: .45rem .55rem; background: color-mix(in srgb, var(--popover) 88%, transparent); font-size: .72rem; line-height: 1.45; }
.${ELEMENT_TAG}-memory-evidence li > span { display: flex; align-items: baseline; justify-content: space-between; gap: .5rem; margin-bottom: .16rem; }
.${ELEMENT_TAG}-memory-evidence small { color: var(--muted-foreground); font-size: .56rem; font-weight: 400; }
@media (max-width: 700px) {
  .${ELEMENT_TAG}-memory-hero { grid-template-columns: 1fr; }
  .${ELEMENT_TAG}-memory-layers { grid-template-columns: 1fr; }
  .${ELEMENT_TAG}-memory-stats { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .${ELEMENT_TAG}-memory-toolbar > input { order: -1; flex-basis: 100%; }
  .${ELEMENT_TAG}-memory-section-head > span { display: none; }
}
.${ELEMENT_TAG}-wish-card {
  padding: .625rem .75rem; border: 1px solid var(--border); border-radius: .5rem;
  background: var(--background); font-size: .75rem; line-height: 1.4;
}
.${ELEMENT_TAG}-wish-card p { margin: 0; }
.${ELEMENT_TAG}-wish-card p + p { margin-top: .25rem; }
.${ELEMENT_TAG}-wish-text { color: var(--foreground); font-weight: 600; }
.${ELEMENT_TAG}-wish-tell { color: var(--muted-foreground); }
.${ELEMENT_TAG}-wish-meta { color: var(--muted-foreground); font-size: .6875rem; }
/*
  The schedules panel's own explanation, shut.

  The panel used to open with three paragraphs of prose, and print the whole
  translation prompt under every villager, before a reader had seen an hour of
  anybody's day: the answers sat below the documentation for them. The prose and
  the prompt are what a reader reaches for when a row reads wrong, so they are
  kept exactly as they were written and put behind a disclosure rather than cut.
  What stays open is the week itself — the name, the badges, the timetable, and
  the two labelled lines inside each block — so the panel reads as a week first
  and as an explanation second.

  The summary is a button and the marker is hidden for the same reason the news
  toggle hides its own: the browser's triangle cannot be sized, coloured or placed
  with the rest of the control, and the button already says it can be pressed. The
  body carries no frame of its own because what is inside it does — the sentences
  are prose and the prompt is a scroll box of its own.
*/
.${ELEMENT_TAG}-agenda-notes { margin: 0 0 .625rem; }
.${ELEMENT_TAG}-agenda-notes > summary {
  display: inline-flex; align-items: center; gap: .3125rem;
  list-style: none; cursor: pointer;
}
.${ELEMENT_TAG}-agenda-notes > summary::-webkit-details-marker { display: none; }
.${ELEMENT_TAG}-agenda-notes > summary::marker { content: ""; }
.${ELEMENT_TAG}-agenda-notes[open] > summary { border-color: var(--primary); color: var(--primary); }
.${ELEMENT_TAG}-agenda-notes-body { display: flex; flex-direction: column; gap: .5rem; margin: .4375rem 0 0; }
/*
  A day the Engine's week has nothing in, drawn as an absence. Muted rather than
  coloured and italic rather than plain, because it is the one row in this list
  that is not an event: the label above it is a real day and the hours under it
  really are empty, so the row that says so has to look like a note rather than
  like something a villager is doing.
*/
.${ELEMENT_TAG}-story-blank { color: var(--muted-foreground); font-style: italic; opacity: .75; }
.${ELEMENT_TAG}-row { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; margin-top: .75rem; }

/*
  The week, resident by resident, shut.

  Every resident is a disclosure and every one of them starts shut, because the
  panel is opened to CHECK one week rather than to read a village: shut, it is a
  list of names with their state beside them, which is the question a reader
  arrives with. The summary carries the heading's type rather than a button's,
  because it is a heading rather than a control, and the browser's own triangle is
  hidden for the reason the news toggle hides its own: it cannot be sized or
  placed with the rest of the control.

  The frame is the sheet's ordinary border and background, so an open resident
  reads as one card among several rather than as a run-on list.
*/
.${ELEMENT_TAG}-week {
  display: block; margin: 0 0 .5rem; padding: .5rem .625rem;
  border: 1px solid var(--border); border-radius: .5rem; background: var(--card);
}
.${ELEMENT_TAG}-week-toggle {
  display: flex; flex-wrap: wrap; align-items: center; gap: .375rem;
  list-style: none; cursor: pointer;
}
.${ELEMENT_TAG}-week-toggle::-webkit-details-marker { display: none; }
.${ELEMENT_TAG}-week-toggle::marker { content: ""; }
.${ELEMENT_TAG}-week-head {
  flex: 1 1 auto; min-width: 0; margin: 0;
  font-size: .6875rem; font-weight: 600; letter-spacing: .04em;
  text-transform: uppercase; color: var(--muted-foreground);
}
.${ELEMENT_TAG}-week-toggle:hover > .${ELEMENT_TAG}-week-head,
.${ELEMENT_TAG}-week[open] > .${ELEMENT_TAG}-week-toggle > .${ELEMENT_TAG}-week-head { color: var(--primary); }
.${ELEMENT_TAG}-week-body { display: flex; flex-direction: column; margin-top: .5rem; }

.${ELEMENT_TAG}-agenda-list { display: grid; gap: .5rem; }
.${ELEMENT_TAG}-agenda-actions { display: flex; flex-wrap: wrap; align-items: center; gap: .75rem; margin: .75rem 0 .25rem; }
.${ELEMENT_TAG}-agenda-switch { display: inline-flex; align-items: center; gap: .4rem; font-size: .75rem; cursor: pointer; }
.${ELEMENT_TAG}-agenda-switch input { accent-color: var(--primary); }
.${ELEMENT_TAG}-agenda-days { display: grid; gap: .35rem; margin-top: .5rem; }
.${ELEMENT_TAG}-agenda-day { border: 1px solid var(--border); border-radius: .375rem; padding: .35rem .5rem; }
.${ELEMENT_TAG}-agenda-day > summary { cursor: pointer; font-size: .75rem; font-weight: 600; }
.${ELEMENT_TAG}-agenda-compare { display: grid; gap: .75rem; padding-top: .5rem; }
.${ELEMENT_TAG}-agenda-compare[data-comparison="true"] { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.${ELEMENT_TAG}-agenda-compare section { min-width: 0; }
.${ELEMENT_TAG}-agenda-compare h4 { margin: 0 0 .35rem; font-size: .7rem; color: var(--muted-foreground); }
.${ELEMENT_TAG}-agenda-blocks { display: grid; gap: .3rem; margin: 0; padding: 0; list-style: none; }
.${ELEMENT_TAG}-agenda-blocks li { display: grid; grid-template-columns: 7.2rem minmax(0, 1fr); gap: .1rem .5rem; padding: .4rem .5rem; border-radius: .3rem; background: var(--muted); font-size: .7rem; line-height: 1.35; }
.${ELEMENT_TAG}-agenda-blocks time { grid-row: span 4; white-space: nowrap; font-variant-numeric: tabular-nums; color: var(--muted-foreground); }
.${ELEMENT_TAG}-agenda-blocks strong { font-weight: 600; }
@container ${ELEMENT_TAG} (max-width: 35rem) {
  .${ELEMENT_TAG}-agenda-compare[data-comparison="true"] { grid-template-columns: minmax(0, 1fr); }
  .${ELEMENT_TAG}-agenda-blocks li { grid-template-columns: minmax(0, 1fr); }
  .${ELEMENT_TAG}-agenda-blocks time { grid-row: auto; }
}

/*
  The founding wizard is two columns: the questions on the left and the map
  beside them on the right, so the player can answer and mark their own houses
  without either one being drawn over the other. The columns are measured in rem
  and allowed to wrap, which is what keeps the wizard honest when the Engine's
  own side panels open: the room the tab has shrinks with them, and past a point
  the map drops underneath the questions instead of squeezing to a sliver beside
  them. The homepage does not use them; it is the map.
*/
/* Both of these are the root's own two numbers at a smaller share of them, so a
   narrow tab tightens every screen at once rather than one screen at a time. */
.${ELEMENT_TAG}-home {
  gap: calc(var(--${ELEMENT_TAG}-gap) * .75);
  padding: calc(var(--${ELEMENT_TAG}-pad) * .8);
  overflow-y: auto;
}
.${ELEMENT_TAG}-home-body { display: flex; flex-wrap: wrap; align-items: flex-start; gap: .75rem; }
.${ELEMENT_TAG}-setup-map-shell { position: relative; flex: 1 1 26rem; min-width: 0; }
.${ELEMENT_TAG}-setup-map-viewport {
  width: 100%; overflow: auto; border: 2px solid color-mix(in srgb, var(--primary) 45%, var(--border));
  border-radius: .875rem; background: color-mix(in srgb, var(--popover) 80%, #111827);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 12%, transparent), 0 .75rem 2rem rgba(0, 0, 0, .3);
}
.${ELEMENT_TAG}-setup-map-viewport > .${ELEMENT_TAG}-stage:not(.${ELEMENT_TAG}-stage-compact) { width: 100%; flex: none; border: 0; }
.${ELEMENT_TAG}-home-map-viewport { flex: 1 1 auto; min-width: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; overflow: visible; }
.${ELEMENT_TAG}-reason-options { display: flex; flex-wrap: wrap; gap: .5rem .875rem; margin-top: .375rem; }
.${ELEMENT_TAG}-field:where(fieldset) { border: 0; padding: 0; min-width: 0; }
.${ELEMENT_TAG}-reason-option { display: inline-flex; align-items: center; gap: .35rem; font-size: .75rem; cursor: pointer; }
.${ELEMENT_TAG}-debug-label { color: #ff465f; font-weight: 800; letter-spacing: .06em; }
.${ELEMENT_TAG}-side { display: flex; flex-direction: column; gap: .75rem; flex: 1 1 18rem; min-width: 0; }
/*
  The homepage is the map, and the map is the whole tab. The map's shape is its
  own — a fixed ratio that comes from the settings, not from whatever shape this
  tab happens to be — so this row gives it the room it has left over and lets
  the space it does not fill show, rather than stretching the picture into a
  shape no map has.

  A row of two columns: the village's news down the left, the map in what is
  left. Both are children of this row, so the news is never drawn over the
  picture. The old shape was neither — the news was a window laid on top of a
  tab-wide map, which only looked right while the tab was wide enough for the
  map to be shorter than it and leave a gutter on each side. The Engine's own
  side panels narrow the tab until the map fills it edge to edge, and then the
  window landed on the picture. A row cannot do that: whatever width the tab
  has, the news takes its share and the map is fitted to the rest.

  The news is the only thing in this row besides the map. The readout and the
  notices are not in the row at all — they are drawn inside the map's own frame,
  because the frame is the only box whose corner is the picture's corner.

  There is no min-height floor. A floor taller than the visible tab is a floor
  the map is fitted against and then cropped by the overflow below — the map
  would be measured against a box bigger than the one it is seen in, and the
  bottom of the picture, and the pins on it, would be behind the tab's edge.
  A short tab is meant to give a small map, not a cut-off one.

  The two numbers next to this comment are the map's whole frame: the wood is
  the thickness of the wooden frame and the mat the margin inside it. They are
  written down once here and read everywhere they are needed, so the frame and
  the room that keeps it clear of the tab's edge cannot disagree.

  The shared bar takes its own row above the map on both phone and desktop, so
  its controls cannot cover a place pinned near the map's top edge.
*/
.${ELEMENT_TAG}-home-full {
  --${ELEMENT_TAG}-map-wood: .75rem;
  --${ELEMENT_TAG}-map-mat: .5rem;
  position: relative;
  box-sizing: border-box;
  display: flex; flex-direction: column; align-items: stretch;
  gap: .5rem;
  height: 100%; min-height: 0;
  padding: .5rem; overflow: hidden;
}
/*
  The space below the controls is the box the desktop map is fitted against.
  The frame stays centered in it; notices belong to the frame itself.

  The padding is the buffer the wooden frame is drawn into. It is the wood and
  the mat plus a pixel, which is exactly enough for the frame to exist without
  ever reaching the edge of a box that clips its overflow, and it is written as
  that sum rather than as a length so it stays true if either is retuned. The
  frame is drawn outwards from the picture, so this padding is the frame's own
  width and a pixel of clearance, and the picture itself is unchanged by it.
*/
.${ELEMENT_TAG}-room {
  position: relative;
  flex: 1 1 auto; min-width: 0; min-height: 0;
  display: flex; align-items: center; justify-content: center;
  padding: calc(var(--${ELEMENT_TAG}-map-wood) + var(--${ELEMENT_TAG}-map-mat) + 1px);
}
/*
  The frame's border and rounding belong to the wizard, where the map shares the
  tab with the questions. On the homepage the wood replaces both, so this rule
  takes them away.

  No width is stated here on purpose. The measurement gives the frame BOTH of
  its sides inline, and a width would fight it: a frame left to the room's width
  alone is a frame taller than the room, and a frame taller than the room is a
  frame the map is cropped to fill — which is how four houses on the four
  corners of the map went missing.

  The clipping this frame used to do has not gone anywhere, it moved down to the
  picture's own layer, which is the same box. Splitting it that way is what lets
  the wood be drawn outside the frame while a pin on a corner house is still cut
  off at the edge of the map rather than floating over the wood.

  isolation makes this frame a stacking context, which is what keeps the two
  wood layers behind the picture. Without it a layer at a negative depth is not
  contained by anything here and paints behind whatever it finds further up —
  the wood would still be in the file and nowhere on the screen.
*/
.${ELEMENT_TAG}-home-full .${ELEMENT_TAG}-stage {
  flex: 0 0 auto;
  border: 0; border-radius: 0;
  overflow: visible;
  isolation: isolate;
}
/*
  Until the picture has been read there is no shape to fit it to, so there is
  nothing to measure and no inline size to fall back on: the frame takes the
  column's width instead of letting the picture's own width decide it, which
  would be a frame as wide as the file and wider than the tab.
*/
.${ELEMENT_TAG}-home-full .${ELEMENT_TAG}-stage:not([data-shaped="true"]) { width: 100%; }
.${ELEMENT_TAG}-home-full .${ELEMENT_TAG}-canvas {
  overflow: hidden;
  z-index: 1;
}
/*
  The wooden frame, drawn outside the map's box rather than inside it.

  Outside, because a frame drawn inside would have to come out of the picture,
  and the picture is the map: a frame inside it would crop the map or mat it,
  and would move every pin as it did. Grown outwards, the map's box stays
  exactly the map, and nothing about where a house sits changes.

  Two layers because a picture frame has two faces — the wood itself, and the
  mat inside it that keeps the picture off the wood. The mat is painted second
  and so covers the wood's inner edge, which is what leaves the wood showing as
  a ring. A single layer would be a solid slab behind the map.

  The grain is a set of repeating gradients — plank bands down the frame crossed
  by finer, uneven ones — which is as much wood as a band this thin can hold.
  The insets are written as sums of the same two numbers the frame's thickness
  and the room's buffer are made of, so the wood always fits the space it is
  given: this is the one place the two must not drift apart.

  Scoped to the homepage's frame. The wizard and the town map editor keep the
  plain border they have always had.
*/
.${ELEMENT_TAG}-home-full .${ELEMENT_TAG}-stage::before,
.${ELEMENT_TAG}-home-full .${ELEMENT_TAG}-stage::after {
  content: "";
  position: absolute;
  z-index: -1;
  pointer-events: none;
}
.${ELEMENT_TAG}-home-full .${ELEMENT_TAG}-stage::before {
  inset: calc(-1 * (var(--${ELEMENT_TAG}-map-wood) + var(--${ELEMENT_TAG}-map-mat)));
  border-radius: .625rem;
  background:
    repeating-linear-gradient(90deg, rgba(0, 0, 0, .18) 0 1px, rgba(0, 0, 0, 0) 1px 11px),
    repeating-linear-gradient(90deg, rgba(255, 255, 255, .06) 0 1px, rgba(255, 255, 255, 0) 1px 29px),
    linear-gradient(168deg, #a97641 0%, #8a5c2c 30%, #96683a 52%, #744a20 78%, #8d5f31 100%);
  box-shadow:
    inset 0 0 0 1px rgba(0, 0, 0, .35),
    inset 0 0 0 3px rgba(255, 255, 255, .055),
    0 .5rem 1.5rem rgba(0, 0, 0, .34);
}
.${ELEMENT_TAG}-home-full .${ELEMENT_TAG}-stage::after {
  inset: calc(-1 * var(--${ELEMENT_TAG}-map-mat));
  border-radius: .375rem;
  background: color-mix(in srgb, var(--popover) 86%, #c08b4e);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .22);
}
/* A button whose whole content is a drawn glyph: square, with the glyph centred
   in it rather than sitting on a text baseline it has none of. */
.${ELEMENT_TAG}-icon-button {
  display: inline-flex; align-items: center; justify-content: center;
  padding: .3125rem; line-height: 0;
}
.${ELEMENT_TAG}-icon-button svg { display: block; width: 1rem; height: 1rem; }
/*
  Anything that went wrong, said in the corner rather than in a bar: there is no
  footer on the map, so this is the only place it can be said, and it is only
  ever there while there is something to say.

  It belongs to the picture, so it stays in the frame's lower corner while the
  clock and controls stay above the map.
*/
.${ELEMENT_TAG}-notice {
  position: absolute; bottom: .5rem; left: .5rem; z-index: 2;
  display: flex; flex-direction: column; gap: .375rem;
  max-width: min(30rem, 75%); pointer-events: none;
}
.${ELEMENT_TAG}-notice .${ELEMENT_TAG}-status,
.${ELEMENT_TAG}-notice .${ELEMENT_TAG}-error {
  border: 1px solid var(--border); border-radius: .5rem;
  background: color-mix(in srgb, var(--popover) 92%, transparent);
  padding: .3125rem .5rem;
}
/*
  The village's news, behind a button in the shared bar above the map.

  It used to be a column of the homepage: a permanent gutter down one side of
  the map, holding a list that is usually short and often empty. A column that is
  always there is a column the map always pays for, and on a phone held sideways
  there is no width to pay it with — the map would have been fitted to whatever
  the news left of the tab, which is a strange thing for reading the news to do.

  So the news is a disclosure instead. The button says the feed is there and the
  panel unrolls beneath it, over the picture: it costs the map nothing while it
  is shut and covers a corner of it while it is open. What the rail said is still
  said; it is said on request.

  A details element rather than a button and a box of state, because the
  open-and-shut flag, the keyboard behaviour and the expanded-or-collapsed
  announcement are all the element's own and none of them can drift out of step
  with the panel. What it does not do by itself is shut when the player presses
  somewhere else, which is the one thing the component adds: a panel that can
  only be dismissed by finding the button again sits over the game while the game
  is being played.

  Hung below its own button rather than centred on the map, so the panel opens
  where the button is. Both of its limits are shares of the tab rather than
  lengths, so a small tab gets a panel that fits and scrolls instead of one
  taller or wider than the screen it is on.
*/
.${ELEMENT_TAG}-news { position: relative; }
.${ELEMENT_TAG}-news-toggle { display: inline-flex; align-items: center; gap: .3125rem; list-style: none; }
.${ELEMENT_TAG}-news-toggle svg { display: block; flex: 0 0 auto; width: 1rem; height: 1rem; }
/* The browser's own disclosure triangle: a character that cannot be sized,
   coloured or placed with the rest of the button. The button is the affordance;
   a marker on top of it is a second one saying the same thing. */
.${ELEMENT_TAG}-news-toggle::-webkit-details-marker { display: none; }
.${ELEMENT_TAG}-news-toggle::marker { content: ""; }
.${ELEMENT_TAG}-news[open] > .${ELEMENT_TAG}-news-toggle { border-color: var(--primary); color: var(--primary); }
.${ELEMENT_TAG}-news-panel {
  position: absolute; top: calc(100% + .375rem); right: 0; z-index: 4;
  box-sizing: border-box; width: min(20rem, 72cqw);
  max-height: min(24rem, 60cqh);
  overflow-y: auto;
  display: flex; flex-direction: column; gap: .375rem;
  border: 1px solid var(--border); border-radius: .625rem;
  background: var(--popover);
  padding: .5rem .625rem;
  box-shadow: 0 .5rem 1.5rem rgba(0, 0, 0, .28);
}
.${ELEMENT_TAG}-news-title {
  margin: 0; font-size: .6875rem; font-weight: 600;
  text-transform: uppercase; letter-spacing: .04em;
  color: var(--muted-foreground);
}
.${ELEMENT_TAG}-news-list { margin: 0; padding: 0; list-style: none; display: grid; gap: .375rem; }
.${ELEMENT_TAG}-news-item { font-size: .75rem; line-height: 1.5; color: var(--muted-foreground); }
.${ELEMENT_TAG}-news-empty {
  margin: 0; font-size: .75rem; line-height: 1.5; color: var(--muted-foreground);
}
.${ELEMENT_TAG}-mapbar {
  display: flex; flex-wrap: wrap; align-items: center; gap: .375rem;
  border: 1px solid var(--border); border-radius: .75rem;
  background: var(--popover); padding: .5rem .625rem;
}
.${ELEMENT_TAG}-mapbar-title { font-size: .8125rem; font-weight: 600; }
/*
  The map's own frame: beside the wizard's questions, in a column of prose, or
  filling the homepage. Its shape is the map's rather than the container's — the
  ratio is set inline from the picture size the settings named — so the same
  picture is drawn at the same shape everywhere, and a picture that is not that
  shape is cropped, stretched or letterboxed inside it by choice rather than by
  accident. The frame's background is what shows wherever the picture is not:
  the part of the frame that is not the picture should not look like somewhere a
  house can go. MapStage measures the frame and the picture separately and pins
  the homes to the picture.
*/
.${ELEMENT_TAG}-stage {
  position: relative;
  flex: 1 1 26rem; min-width: 0;
  border: 1px solid var(--border); border-radius: .75rem;
  overflow: hidden;
  background: color-mix(in srgb, var(--muted-foreground) 12%, var(--background));
}
/*
  Before the settings name the map's shape there is no shape to be, so the frame
  stands at a usable height rather than at nothing. Once the settings arrive the
  ratio set inline takes over and the height follows the width, the way a
  picture's does.
*/
.${ELEMENT_TAG}-stage:not([data-shaped="true"]) { min-height: 14rem; }
/* A stand-in for the map rather than the map itself: the same picture at the same
   shape, small enough to sit beside a column of prose. */
.${ELEMENT_TAG}-stage-compact { flex: 0 1 auto; width: min(100%, 22rem); align-self: center; }
.${ELEMENT_TAG}-canvas { position: absolute; inset: 0; }
.${ELEMENT_TAG}-stage[data-empty="true"] .${ELEMENT_TAG}-canvas {
  background:
    radial-gradient(circle at 20% 28%, color-mix(in srgb, var(--primary) 12%, transparent) 0 2%, transparent 2.25%),
    radial-gradient(circle at 73% 68%, color-mix(in srgb, var(--primary) 10%, transparent) 0 3%, transparent 3.25%),
    linear-gradient(24deg, transparent 47%, color-mix(in srgb, var(--border) 65%, transparent) 48% 52%, transparent 53%),
    color-mix(in srgb, var(--muted) 55%, var(--background));
}
.${ELEMENT_TAG}-canvas-empty {
  position: absolute; right: .625rem; bottom: .5rem;
  color: var(--muted-foreground); font-size: .6875rem;
}
.${ELEMENT_TAG}-canvas[data-placing="true"] { cursor: crosshair; }
.${ELEMENT_TAG}-canvas[data-dragging="true"] { cursor: grabbing; }
.${ELEMENT_TAG}-stage[data-framing="true"] .${ELEMENT_TAG}-canvas { cursor: grab; touch-action: none; }
.${ELEMENT_TAG}-stage[data-framing="true"] .${ELEMENT_TAG}-canvas[data-dragging="true"] { cursor: grabbing; }
.${ELEMENT_TAG}-canvas-img {
  display: block; width: 100%; height: 100%;
  object-fit: contain;
  user-select: none;
}
/*
  The framing editor's controls. Sat outside the frame rather than in it so a
  press on one of them is not also the start of a drag, and drawn small at the
  foot of the frame so what they change stays visible while they change it.
*/
.${ELEMENT_TAG}-zoom {
  position: absolute; right: .5rem; bottom: .5rem; z-index: 3;
  display: flex; gap: .25rem;
}
.${ELEMENT_TAG}-zoom-button {
  border: 1px solid var(--border); border-radius: .375rem;
  background: color-mix(in srgb, var(--popover) 92%, transparent);
  color: inherit; font: inherit; font-size: .6875rem; line-height: 1;
  padding: .3125rem .4375rem; cursor: pointer;
}
.${ELEMENT_TAG}-zoom-button:disabled { opacity: .5; cursor: default; }
.${ELEMENT_TAG}-canvas-missing {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  padding: 1rem; text-align: center; font-size: .8125rem; line-height: 1.45;
  color: var(--muted-foreground);
}
.${ELEMENT_TAG}-pin-holder { position: absolute; transform: translate(-50%, -50%); display: flex; align-items: center; gap: .125rem; }
.${ELEMENT_TAG}-pin {
  display: flex; align-items: center; gap: .25rem;
  border: 1px solid var(--primary); border-radius: 999px;
  background: color-mix(in srgb, var(--background) 88%, transparent);
  color: var(--foreground);
  padding: .125rem .4375rem .125rem .25rem;
  font: inherit; font-size: .6875rem; line-height: 1.6; cursor: pointer;
  white-space: nowrap;
}
.${ELEMENT_TAG}-pin:hover { color: var(--primary); }
.${ELEMENT_TAG}-pin:disabled { cursor: default; color: var(--muted-foreground); }
.${ELEMENT_TAG}-pin[data-selected="true"] { box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary) 45%, transparent); }
.${ELEMENT_TAG}-pin[data-tone="player"] { border-color: var(--primary); }
.${ELEMENT_TAG}-pin[data-tone="empty"] {
  border-style: dashed; border-color: var(--muted-foreground); color: var(--muted-foreground);
}
/*
  A place that is not a house: a shop, a harbour, the mill pond. The plainest
  thing on the map, in the ordinary border colour, because all it has to do is be
  read — there is nothing behind it to press yet.
*/
.${ELEMENT_TAG}-pin[data-tone="venue"] { border-color: var(--border); }
/*
  Somebody standing at a place rather than the place itself.

  Dimmer than the building and drawn without the tack, because the tack is what
  says "there is a building here" and two things on one spot both claiming to be
  the building is the map lying about one of them. The building keeps its pin and
  the people hang underneath it, which is also the order the two answers arrive in:
  what is here, then who.
*/
.${ELEMENT_TAG}-pin[data-kind="person"] {
  border-style: dotted; border-color: var(--muted-foreground); color: var(--muted-foreground);
}

.${ELEMENT_TAG}-pin-remove {
  border: 1px solid var(--border); border-radius: 999px;
  background: color-mix(in srgb, var(--background) 88%, transparent); color: var(--muted-foreground);
  font-size: .625rem; line-height: 1; padding: .125rem .25rem; cursor: pointer;
}
.${ELEMENT_TAG}-pin-remove:hover { border-color: var(--destructive, #e5484d); color: var(--destructive, #e5484d); }
/*
  DEBUG. The way back into a conversation that was closed without being ended.

  Outside the pin's own box rather than in it: the pin is placed by its centre
  on a building, and a second row inside it would move the pin up the picture by
  half of the control's height, so a house would stop being marked where it is.
  Hung below the pin's box, the pin stays exactly where it was and the control
  reads as belonging to it.

  Drawn in the destructive colour for the same reason the debug verbs in the
  drawer are: a control that is not part of the game should not be mistaken for
  one, and a player of this game never has a conversation in hand whose window is
  shut. Unlike them it is never disabled — on a locked map it is the only thing
  that answers a click, and a locked map with nothing to press is a tab that has
  to be reloaded.
*/
.${ELEMENT_TAG}-pin-resume {
  position: absolute; top: calc(100% + .1875rem); left: 50%; transform: translateX(-50%);
  white-space: nowrap; cursor: pointer; font: inherit; font-size: .625rem; line-height: 1.4;
  border: 1px solid var(--destructive, #e5484d); border-radius: 999px;
  background: color-mix(in srgb, var(--background) 92%, transparent);
  color: var(--destructive, #e5484d); padding: .125rem .375rem;
}
/*
  THE TWO DOORS A PLACE WITH SOMEBODY IN IT OFFERS.

  Hung under the pin it belongs to and drawn outside the frame rather than inside
  it. The frame is the picture's box and it is also what cuts off anything that
  reaches past a corner house, so a pair of buttons under a pin near the bottom of
  the map would be half a pair of buttons. The offsets are set inline from the same
  two numbers the pin above is placed with, so the list opens exactly under its own
  pin at every size the picture is drawn at.

  The step down is a length rather than a share of the picture on purpose: what it
  has to clear is a pin, and a pin is a fixed size however large the map is.

  A list rather than one button, because the two answers are genuinely different.
  Looking at a place and walking in to talk to whoever is standing in it are two
  things a player can want, and the map used to decide between them: a pin with one
  person behind it opened their conversation and skipped the place entirely, so a
  house with somebody in it could not be looked at. A card rather than two loose
  pills, because the pair belongs to one pin and has to read as one thing.
*/
.${ELEMENT_TAG}-doors {
  position: absolute; z-index: 4;
  transform: translate(-50%, 2.75rem);
  display: flex; flex-direction: column; align-items: stretch; gap: .1875rem;
  border: 1px solid var(--border); border-radius: .5rem;
  background: color-mix(in srgb, var(--popover) 96%, transparent);
  padding: .25rem;
  box-shadow: 0 .375rem 1rem rgba(0, 0, 0, .28);
}
.${ELEMENT_TAG}-door {
  white-space: nowrap; cursor: pointer;
  font: inherit; font-size: .6875rem; line-height: 1.6;
  border: 1px solid var(--border); border-radius: 999px;
  background: color-mix(in srgb, var(--background) 88%, transparent);
  color: var(--foreground); padding: .125rem .625rem;
}
.${ELEMENT_TAG}-door:hover { border-color: var(--primary); color: var(--primary); }
/* A card, whether it is the wizard's questions or an option open in the Menu. */
.${ELEMENT_TAG}-overlay {
  display: flex; flex-direction: column; gap: .625rem;
  border: 1px solid var(--border); border-radius: .75rem;
  background: var(--popover); padding: .875rem 1rem;
}
.${ELEMENT_TAG}-overlay-head { display: flex; align-items: center; gap: .5rem; }
.${ELEMENT_TAG}-overlay-head > .${ELEMENT_TAG}-panel-title { flex: 1 1 auto; margin: 0; }

/* The founding wizard. */
.${ELEMENT_TAG}-setup-root {
  box-sizing: border-box; container-type: inline-size; overflow-x: hidden; overflow-y: auto;
  --background: #121936; --popover: #141b39; --foreground: #f3f3ff;
  --muted-foreground: #b3bee8; --border: #566ab1; --primary: #b49aff;
  background: radial-gradient(circle at 12% 95%, #263978, #111832 50%, #0e1430);
  color: #f3f3ff;
}
.${ELEMENT_TAG}-setup-body { flex-wrap: nowrap; align-items: stretch; }
.${ELEMENT_TAG}-setup-body { flex: 0 0 auto; min-height: 0; }
.${ELEMENT_TAG}-setup-body > .${ELEMENT_TAG}-side { flex: 1 1 34rem; }
.${ELEMENT_TAG}-setup-visual {
  display: flex; flex-direction: column; gap: .6rem; flex: 1 1 19rem; min-width: 0; min-height: 0;
}
.${ELEMENT_TAG}-setup-visual > .${ELEMENT_TAG}-setup-map-shell { flex: 1 1 auto; min-height: 0; }
.villages-founding-backdrop { position:fixed; inset:0; z-index:1000; display:flex; align-items:center; justify-content:center; background:#070b1bd9; }
.villages-founding-dialog { width:min(42rem,94vw); max-height:90dvh; display:flex; flex-direction:column; background:#14213c; border:1px solid #596b9b; border-radius:1rem; color:#f3f5ff; overflow:hidden; }
.villages-founding-dialog footer button:last-child {background:#7461d5;}
.villages-founding-dialog header,.villages-founding-dialog footer { flex:none; padding:1rem; background:#192c4c; }
.villages-founding-dialog footer { display:flex; gap:.5rem; flex-wrap:wrap; }
.villages-founding-dialog footer button { flex:1; min-height:44px; }
.villages-founding-editor-body { flex:1; padding:1rem; min-height:0; overflow:auto; overscroll-behavior:contain; }
.villages-founding-dialog label,.villages-scenery-fields label,.villages-private-fields label { display:flex; gap:.5rem; flex-wrap:wrap; margin:.7rem 0; }
.villages-founding-dialog input:not([type="checkbox"]),.villages-founding-dialog textarea,.villages-founding-dialog select,.villages-scenery-fields textarea,.villages-scenery-fields select { width:100%; min-height:44px; font:inherit; background:#0c1830; color:#f3f5ff; border:1px solid #65799c; border-radius:.4rem; padding:.5rem; box-sizing:border-box; }
.villages-founding-dialog textarea { min-height:6rem; }
.villages-founding-dialog button { min-height:44px; background:#493d83; color:#fff; border:1px solid #8072bf; border-radius:.5rem; padding:.5rem; font:inherit; }
.villages-founding-dialog fieldset,.villages-scenery-fields,.villages-private-fields fieldset { border:1px solid #51688c; border-radius:.5rem; margin:.75rem 0; }
@media(max-width:704px) { .villages-founding-dialog { width:100%; height:100%; max-height:100dvh; border-radius:0; border:0; } .villages-founding-dialog footer { padding-bottom:max(.75rem,env(safe-area-inset-bottom)); } }
.${ELEMENT_TAG}-setup-footer { display: flex; gap: .65rem; min-height: 2.75rem; }
.${ELEMENT_TAG}-setup-footer > .${ELEMENT_TAG}-button { flex: 1 1 0; min-width: 0; }
.${ELEMENT_TAG}-setup-footer > .${ELEMENT_TAG}-setup-forward {
  border-color: #7584ff; background: linear-gradient(135deg, #6077ff, #7365ed);
  color: #fff; font-weight: 700;
}
.${ELEMENT_TAG}-setup-rail {
  flex: 0 0 10rem; display: flex; flex-direction: column; gap: .4rem;
  padding: .75rem .25rem; color: var(--muted-foreground);
}
.${ELEMENT_TAG}-setup-rail-step {
  display: flex; align-items: center; gap: .65rem; padding: .4rem .25rem;
  font-size: .78rem; line-height: 1.35; opacity: .75;
}
.${ELEMENT_TAG}-setup-rail-step[data-active="true"] { color: var(--foreground); opacity: 1; font-weight: 700; }
.${ELEMENT_TAG}-setup-rail-step[data-done="true"] { opacity: 1; }
.${ELEMENT_TAG}-setup-rail-number {
  display: grid; place-items: center; flex: 0 0 2rem; height: 2rem;
  border: 1px solid var(--border); border-radius: 50%; font-weight: 700;
}
.${ELEMENT_TAG}-setup-rail-step[data-active="true"] .${ELEMENT_TAG}-setup-rail-number {
  border-color: #bca5ff; background: linear-gradient(135deg, #7663f6, #446ee9);
  box-shadow: 0 0 .85rem #9878f1a8; color: #fff;
}
.${ELEMENT_TAG}-setup-kicker { margin: 0; color: var(--muted-foreground); font-size: .78rem; }
.${ELEMENT_TAG}-setup-body {
  --background: #151d3b; --popover: #141b39; --foreground: #f3f3ff;
  --muted-foreground: #b3bee8; --border: #566ab1; --primary: #b49aff;
  gap: .75rem; align-items: stretch; color: var(--foreground);
}
.${ELEMENT_TAG}-setup-body > .${ELEMENT_TAG}-side { flex-basis: 35rem; min-height: 0; }
.${ELEMENT_TAG}-setup-body .${ELEMENT_TAG}-overlay {
  gap: .2rem; padding: .65rem .8rem; border-color: #5268b8; border-radius: 1rem;
  background: linear-gradient(145deg, #182044, #101831);
  box-shadow: inset 0 0 2rem #27347866;
}
.${ELEMENT_TAG}-setup-body .${ELEMENT_TAG}-panel-title {
  font-size: clamp(1.25rem, 1.8vw, 1.65rem); color: #f5f5ff;
}
.${ELEMENT_TAG}-setup-body .${ELEMENT_TAG}-field { margin-top: .15rem; }
.${ELEMENT_TAG}-setup-body .${ELEMENT_TAG}-search,
.${ELEMENT_TAG}-setup-body .${ELEMENT_TAG}-textarea,
.${ELEMENT_TAG}-setup-body .${ELEMENT_TAG}-select,
.${ELEMENT_TAG}-setup-body .${ELEMENT_TAG}-notice-input {
  background: #1c254a; border-color: #7082cf; color: #f2f4ff;
}
.${ELEMENT_TAG}-setup-beginning-textarea { min-height: 4.5rem; }
.${ELEMENT_TAG}-setup-form-field { display: grid; grid-template-columns: 4.5rem minmax(0, 1fr); gap: .35rem .6rem; align-items: start; }
.${ELEMENT_TAG}-setup-form-field > .${ELEMENT_TAG}-label { padding-top: .55rem; }
.${ELEMENT_TAG}-setup-form-field > .${ELEMENT_TAG}-hint { grid-column: 2; }
.${ELEMENT_TAG}-setup-place-spaces { display: grid; gap: .65rem; }
.${ELEMENT_TAG}-setup-place-space { display: grid; gap: .4rem; border: 1px solid #5265ac; border-radius: .85rem; background: #1c254b; padding: .7rem; }
.${ELEMENT_TAG}-setup-place-space h4 { margin: 0; color: #f5f5ff; font-size: 1rem; }
.${ELEMENT_TAG}-setup-advanced {
  border: 1px solid #5265ac; border-radius: .85rem; background: #1c254b; padding: .55rem .65rem;
}
.${ELEMENT_TAG}-setup-advanced > summary { cursor: pointer; }
.${ELEMENT_TAG}-setup-advanced .${ELEMENT_TAG}-reason-options { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .5rem; }
.${ELEMENT_TAG}-setup-advanced .${ELEMENT_TAG}-label { min-width: 0; }
.${ELEMENT_TAG}-setup-review-card {
  display: grid; gap: .3rem; border: 1px solid #5265ac; border-radius: .85rem;
  background: #1c254b; padding: .65rem;
}
.${ELEMENT_TAG}-setup-review-card h3 { margin: 0; color: #f5f5ff; font-size: .9rem; }
.${ELEMENT_TAG}-setup-review-card p { margin: 0; }
.${ELEMENT_TAG}-setup-body .${ELEMENT_TAG}-setup-venue-card {
  border-color: #5265ac; border-radius: .85rem; background: #1c254b; color: #f0f2ff;
}
.${ELEMENT_TAG}-setup-body .${ELEMENT_TAG}-setup-venue-card[data-selected="true"] {
  border-color: #dac8ff; box-shadow: 0 0 0 2px #9a78ff;
}
.${ELEMENT_TAG}-setup-body .${ELEMENT_TAG}-setup-map-shell {
  overflow: hidden; border: 1px solid #6684d4; border-radius: 1.2rem; background: #162550;
}
.${ELEMENT_TAG}-setup-body .${ELEMENT_TAG}-step[data-clickable="true"] {
  border-color: #5265ac; border-radius: .65rem; background: #1c254b; color: #d3ddfa; padding: .4rem .7rem;
}
.${ELEMENT_TAG}-setup-body .${ELEMENT_TAG}-step[data-active="true"] {
  border-color: #dac8ff; background: linear-gradient(165deg, #303d85, #202754);
  box-shadow: 0 0 0 2px #9a78ff; color: #f5f5ff;
}
.${ELEMENT_TAG}-scenario-options {
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .4rem; margin-top: .15rem;
}
.${ELEMENT_TAG}-scenario-option {
  position: relative; display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: .1rem; min-height: 3.2rem; padding: .25rem .3rem;
  border: 1px solid #5265ac; border-radius: .85rem; background: #1c254b;
  color: #f0f2ff; text-align: center; cursor: pointer;
}
.${ELEMENT_TAG}-scenario-option input {
  position: absolute; width: 1px; height: 1px; opacity: 0;
}
.${ELEMENT_TAG}-scenario-option:has(input:checked) {
  border-color: #dac8ff; background: linear-gradient(165deg, #303d85, #202754);
  box-shadow: 0 0 0 2px #9a78ff, 0 0 1rem #9a78ff9c;
}
.${ELEMENT_TAG}-scenario-option:has(input:focus-visible) { outline: 3px solid #f2d6ff; outline-offset: 3px; }
.${ELEMENT_TAG}-scenario-icon { color: #b9c8ff; font-size: max(1.1rem, 18px); line-height: 1; }
.${ELEMENT_TAG}-scenario-option strong { font-size: max(.72rem, 13px); }
.${ELEMENT_TAG}-scenario-option small { color: #bdc8ed; font-size: max(.6rem, 11px); line-height: 1.2; }
.${ELEMENT_TAG}-scenario-art-panel {
  position: relative; flex: 1 1 12rem; min-width: 0; min-height: 8rem;
  overflow: hidden; border: 1px solid #6684d4; border-radius: 1.2rem; background: #162550;
}
.${ELEMENT_TAG}-scenario-art-panel > img {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
}
.${ELEMENT_TAG}-scenario-art-placeholder {
  position: absolute; inset: 0; display: grid; place-items: center;
  color: #d3ddfa; font-size: 2rem;
}
.${ELEMENT_TAG}-scenario-art-panel::after {
  content: ""; position: absolute; inset: 36% 0 0;
  background: linear-gradient(transparent, #0e1a3ba8 48%, #101a3ef0);
}
.${ELEMENT_TAG}-scenario-art-content {
  position: absolute; z-index: 1; inset: auto 1rem 1rem;
  display: flex; flex-direction: column; align-items: center; gap: .5rem;
  color: #fff; text-align: center;
}
.${ELEMENT_TAG}-scenario-art-content p {
  margin: 0; font-family: Georgia, serif; font-style: italic; font-size: clamp(1.25rem, 2vw, 1.9rem);
}
.${ELEMENT_TAG}-scenario-art-content strong { font-weight: 500; }
/* World setup uses the same indigo panels and borders as Identity and Persona. */
.${ELEMENT_TAG}-lore-picker {
  border: 1px solid #5265ac; border-radius: .85rem; background: #1c254b; padding: .65rem;
}
.${ELEMENT_TAG}-lore-selected { display: flex; flex-wrap: wrap; gap: .35rem; max-height: 5rem; overflow-y: auto; margin: .4rem 0; }
.${ELEMENT_TAG}-lore-chip {
  display: inline-flex; align-items: center; gap: .3rem; max-width: 100%; padding: .15rem .25rem .15rem .5rem;
  border: 1px solid #6684d4; border-radius: 999px; background: #303d85; color: #f0f2ff; font-size: .72rem;
}
.${ELEMENT_TAG}-lore-chip span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.${ELEMENT_TAG}-lore-chip button { border: 0; background: transparent; color: inherit; cursor: pointer; font: inherit; }
.${ELEMENT_TAG}-lore-chip button:focus-visible { outline: 2px solid #f2d6ff; border-radius: 50%; }
.${ELEMENT_TAG}-lore-options > summary { cursor: pointer; list-style-position: inside; }
.${ELEMENT_TAG}-lore-options > .${ELEMENT_TAG}-search { width: 100%; box-sizing: border-box; margin: .5rem 0; }
.${ELEMENT_TAG}-lore-results { display: grid; gap: .15rem; max-height: 12rem; overflow-y: auto; }
/* Compact, role-neutral identity chooser used by Founding's Persona adapter. */
.${ELEMENT_TAG}-founding-persona { display: flex; flex-direction: column; gap: .3rem; min-height: 0; }
.${ELEMENT_TAG}-identity-picker-head { display: flex; align-items: center; gap: .75rem; }
.${ELEMENT_TAG}-identity-picker-head > .${ELEMENT_TAG}-label { flex: 0 0 auto; }
.${ELEMENT_TAG}-identity-picker-head > .${ELEMENT_TAG}-search { flex: 1 1 auto; width: 0; min-width: 0; }
.${ELEMENT_TAG}-identity-strip {
  display: flex; gap: .4rem; min-height: 5.5rem; overflow-x: auto; overflow-y: hidden;
  padding: .15rem .15rem .3rem; scrollbar-width: thin;
}
.${ELEMENT_TAG}-identity-card {
  display: flex; flex-direction: column; align-items: center; gap: .15rem;
  flex: 0 0 6.8rem; min-width: 0; padding: .25rem;
  border: 1px solid #5265ac; border-radius: .6rem; background: #1c254b;
  color: #f0f2ff; font: inherit; font-size: .7rem; cursor: pointer;
}
.${ELEMENT_TAG}-identity-card[aria-pressed="true"] { border-color: #dac8ff; box-shadow: 0 0 0 2px #9a78ff; }
.${ELEMENT_TAG}-identity-card:focus-visible { outline: 3px solid #f2d6ff; outline-offset: 2px; }
.${ELEMENT_TAG}-identity-card-face, .${ELEMENT_TAG}-identity-preview-face {
  position: relative; display: grid; place-items: center; overflow: hidden; flex: 0 0 auto;
  border-radius: 50%; background: #324576; color: #e9edff;
}
.${ELEMENT_TAG}-identity-card-face { width: 2.5rem; height: 2.5rem; }
.${ELEMENT_TAG}-identity-card-face > img, .${ELEMENT_TAG}-identity-preview-face > img { width: 100%; height: 100%; object-fit: cover; }
.${ELEMENT_TAG}-identity-card-face svg, .${ELEMENT_TAG}-identity-preview-face svg { width: 55%; height: 55%; }
.${ELEMENT_TAG}-identity-card strong, .${ELEMENT_TAG}-identity-card small {
  overflow: hidden; max-width: 100%; white-space: nowrap; text-overflow: ellipsis;
}
.${ELEMENT_TAG}-identity-card small { color: #b9c8e9; font-size: .55rem; }
.${ELEMENT_TAG}-identity-preview {
  display: flex; gap: .55rem; min-height: 0; max-height: 9.3rem; overflow-y: auto;
  padding: .5rem; border: 1px solid #5265ac; border-radius: .65rem; background: #1c254b;
}
.${ELEMENT_TAG}-identity-preview-face { width: 3.2rem; height: 3.2rem; }
.${ELEMENT_TAG}-identity-preview-copy { min-width: 0; font-size: .68rem; line-height: 1.35; }
.${ELEMENT_TAG}-identity-preview-copy h3 { margin: 0 0 .15rem; font-size: .9rem; }
.${ELEMENT_TAG}-identity-preview-copy p { margin: .12rem 0; }
.${ELEMENT_TAG}-identity-overview { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
.${ELEMENT_TAG}-identity-details { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .35rem; margin: .3rem 0; }
.${ELEMENT_TAG}-identity-details dt { font-weight: 700; color: #cfdaff; }
.${ELEMENT_TAG}-identity-details dd { margin: 0; }
.${ELEMENT_TAG}-identity-context { color: #bdc8ed; }
.${ELEMENT_TAG}-connections-compact { min-height: 0; }
.${ELEMENT_TAG}-connections-compact > .${ELEMENT_TAG}-hint { margin: 0; }
.${ELEMENT_TAG}-connections-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .55rem; }
.${ELEMENT_TAG}-connections-grid > .${ELEMENT_TAG}-field { min-width: 0; }
.${ELEMENT_TAG}-connections-grid .${ELEMENT_TAG}-select { width: 100%; }
.${ELEMENT_TAG}-connections-grid .${ELEMENT_TAG}-hint { line-height: 1.25; }
@container (min-width: 80rem) {
  .${ELEMENT_TAG}-scenario-options { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
@container (max-width: 70rem) {
  .${ELEMENT_TAG}-setup-body { flex-wrap: wrap; }
  .${ELEMENT_TAG}-setup-rail {
    flex: 1 1 100%; flex-direction: row; overflow-x: auto; padding: .25rem 0;
  }
  .${ELEMENT_TAG}-setup-rail-step { flex: 0 0 auto; }
}
@container (min-width: 42.01rem) and (max-width: 70rem) {
  .${ELEMENT_TAG}-setup-body > .${ELEMENT_TAG}-side { flex-basis: 25rem; }
  .${ELEMENT_TAG}-setup-visual { flex-basis: 14rem; }
}
@container (max-width: 42rem) {
  .${ELEMENT_TAG}-setup-body { flex: none; }
  .${ELEMENT_TAG}-setup-body > .${ELEMENT_TAG}-side,
  .${ELEMENT_TAG}-setup-visual { flex: 1 1 100%; }
  .${ELEMENT_TAG}-identity-preview { max-height: none; }
  .${ELEMENT_TAG}-connections-grid { grid-template-columns: 1fr; }
  .${ELEMENT_TAG}-scenario-options { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .${ELEMENT_TAG}-setup-advanced .${ELEMENT_TAG}-reason-options { grid-template-columns: 1fr; }
  .${ELEMENT_TAG}-scenario-art-panel { flex: none; height: 18rem; }
  .${ELEMENT_TAG}-setup-form-field { grid-template-columns: 1fr; }
  .${ELEMENT_TAG}-setup-form-field > .${ELEMENT_TAG}-hint { grid-column: 1; }
}
.${ELEMENT_TAG}-steps { display: flex; flex-wrap: wrap; gap: .375rem; }
/*
  A chip that says where something has got to: which step of the wizard, or
  which of the three fits a picture is drawn with. Only the ones that are
  really a control say so, by carrying the data-clickable attribute — a chip
  that answers the cursor and then does nothing when it is clicked is a promise
  the strip cannot keep. That is why the wizard's own chips are not controls.
*/
.${ELEMENT_TAG}-step {
  font: inherit; font-size: .6875rem; color: var(--muted-foreground);
  border: 1px solid var(--border); border-radius: 999px;
  background: color-mix(in srgb, var(--background) 85%, transparent);
  padding: .1875rem .5rem;
}
.${ELEMENT_TAG}-step[data-clickable="true"] { cursor: pointer; }
.${ELEMENT_TAG}-step[data-clickable="true"]:hover { border-color: var(--primary); color: var(--primary); }
.${ELEMENT_TAG}-step[data-active="true"] { border-color: var(--primary); color: var(--primary); }
.${ELEMENT_TAG}-step[data-done="true"] { border-color: color-mix(in srgb, var(--primary) 45%, transparent); }
.${ELEMENT_TAG}-home-row {
  display: flex; flex-wrap: wrap; align-items: center; gap: .5rem;
  border: 1px solid var(--border); border-radius: .5rem; padding: .4375rem .5rem;
}
.${ELEMENT_TAG}-home-row[data-selected="true"] { border-color: var(--primary); }
.${ELEMENT_TAG}-home-list { display: flex; flex-direction: column; gap: .375rem; margin-top: .625rem; }
.${ELEMENT_TAG}-home-index {
  flex: 0 0 auto; display: flex; align-items: center; justify-content: center;
  width: 1.25rem; height: 1.25rem; border-radius: 999px;
  border: 1px solid var(--border); font-size: .625rem; color: var(--muted-foreground);
}
/*
  What the house IS, straight from the village's own catalogue. Drawn as a
  fixed chip rather than a field because there is nothing here to answer — the
  question the row asks is who lives in it. The class rides along beside the
  name so "housing" is visible rather than merely stored.
*/
.${ELEMENT_TAG}-building {
  flex: 0 0 auto; display: flex; align-items: center; gap: .375rem;
  border: 1px solid var(--border); border-radius: 999px;
  background: color-mix(in srgb, var(--muted-foreground) 10%, transparent);
  padding: .125rem .5rem; font-size: .6875rem; color: var(--muted-foreground);
}
.${ELEMENT_TAG}-select {
  box-sizing: border-box; max-width: 100%;
  border: 1px solid var(--border); border-radius: .5rem;
  background: var(--background); color: var(--foreground);
  padding: .3125rem .375rem; font-size: .75rem; font-family: inherit;
}
.${ELEMENT_TAG}-who { font-size: .75rem; color: var(--muted-foreground); min-width: 5rem; }
.${ELEMENT_TAG}-danger { border-color: color-mix(in srgb, var(--destructive, #e5484d) 45%, transparent); color: var(--destructive, #e5484d); }
.${ELEMENT_TAG}-spacer { flex: 1 1 auto; }
.${ELEMENT_TAG}-file { max-width: 100%; font-size: .6875rem; color: var(--muted-foreground); }

/*
  ==============================================================================
  THE TAB ITSELF, AND WHAT IT DOES WHEN THE SCREEN IS A PHONE
  ==============================================================================
*/

/*
  THE HOST, WHICH IS THE ONE BOX EVERY SIZE IN THIS SHEET IS MEASURED AGAINST.

  The Engine makes this element and gives it the classes it was mounted with —
  block, h-full, min-h-0, w-full, from the Home hub — and nothing else: there is
  no class on it carrying this package's name. So the rules for it are written
  against the TAG, which is the only thing on the element that is ours to name.
  The old .marinara-capability-villages rule was a class the element never had:
  dead on arrival, and the tab stood up anyway only because Tailwind happened to
  say the same three things.

  container-type: size is what makes the tab answerable to the room it was
  actually given rather than to the window. This package is mounted in a tab that
  shares the screen with the Engine's own furniture, and in fullscreen it has the
  whole screen instead — no viewport query can tell those two apart. A phone held
  sideways is 844x390 and a laptop is 1400x760, so the width is not the telling
  difference and the height is, which is why this is size and not inline-size and
  why the queries at the foot of this sheet ask about both.

  Containment means this element's own size can no longer come from its children,
  which is why the height is stated here outright rather than left to whatever
  mounted it. An element one hundred percent of a definite box is itself
  definite — the hub's main is flex-1 and this element is h-full inside it — and
  an element whose percentage ever resolved to auto would now collapse to nothing
  instead of falling back to the size of its content.

  ponytail: that is the ceiling of this line. If this tab is ever mounted into a
  box with no definite height, this is the rule to look at first.

  text-size-adjust is the same argument made the other way round: a phone browser
  will otherwise inflate the text of a page it decides is too small to read, block
  by block and by its own rules, which changes a layout nobody measured and cannot
  be seen from inside this file.
*/
${ELEMENT_TAG} {
  display: block;
  height: 100%;
  min-height: 0;
  container-type: size;
  container-name: ${ELEMENT_TAG};
  text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
}

/*
  FULLSCREEN.

  The HOST goes fullscreen, and only the host. It is the one node the Engine does
  not re-make when the tab re-renders, so it is the one node that can hold the
  whole screen while everything inside it is replaced; put the screen on an inner
  box and the next render throws the fullscreen state away with the box. That is
  also why there is no state here: the browser is already keeping the answer, and
  document.fullscreenElement reads it back.

  One toggle and not two. GachaForge draws a button in its header bar and a second
  one in the corner of its stage, because its header can be pushed off screen;
  this tab's controls live on the picture and travel with it, so the one button is
  always where it was and there is nothing for a second one to cover.

  The map is not stretched to fill the screen, and that is the whole point of
  asking for it: MapStage measures the room it was given and fits the frame to its
  own ratio, so a bigger room gives a bigger map. Filling and fitting are the same
  thing on a 16:9 monitor and are not on a phone, where stretching the height
  would fatten every pin away from the house it was put on.

  The background is stated because a fullscreen element keeps a transparent
  background and the browser paints its own black backdrop behind it: without
  this, every letterboxed inch around the picture would be black rather than the
  Engine's surface.

  The safe-area insets are for the notch, which on a phone held sideways is on the
  LEFT or the RIGHT edge and upright is along the TOP — and sideways is where the
  chat drawer's own header sits while upright is where the map's controls are now
  drawn. All four sides are written for that reason: which pair matters depends on
  the way up the phone is, and on a phone that is not a phone they are zero. They
  need the Engine's own page to declare a cover viewport to be anything but zero,
  and this package cannot set that: two numbers a package cannot import are being
  written down here a second time.
*/
${ELEMENT_TAG}:fullscreen {
  background: var(--background);
  --${ELEMENT_TAG}-safe-top: env(safe-area-inset-top, 0px);
  --${ELEMENT_TAG}-safe-right: env(safe-area-inset-right, 0px);
  --${ELEMENT_TAG}-safe-bottom: env(safe-area-inset-bottom, 0px);
  --${ELEMENT_TAG}-safe-left: env(safe-area-inset-left, 0px);
}
${ELEMENT_TAG}:fullscreen .${ELEMENT_TAG}-root {
  padding:
    calc(var(--${ELEMENT_TAG}-pad) + var(--${ELEMENT_TAG}-safe-top))
    calc(var(--${ELEMENT_TAG}-pad) + var(--${ELEMENT_TAG}-safe-right))
    calc(var(--${ELEMENT_TAG}-pad) + var(--${ELEMENT_TAG}-safe-bottom))
    calc(var(--${ELEMENT_TAG}-pad) + var(--${ELEMENT_TAG}-safe-left));
}
${ELEMENT_TAG}:fullscreen .${ELEMENT_TAG}-home-full {
  padding:
    calc(var(--${ELEMENT_TAG}-pad) * .6 + var(--${ELEMENT_TAG}-safe-top))
    calc(var(--${ELEMENT_TAG}-pad) * .6 + var(--${ELEMENT_TAG}-safe-right))
    calc(var(--${ELEMENT_TAG}-pad) * .6 + var(--${ELEMENT_TAG}-safe-bottom))
    calc(var(--${ELEMENT_TAG}-pad) * .6 + var(--${ELEMENT_TAG}-safe-left));
}

/*
  ── DORMANT 0.4.45 — the notice that told a phone held upright to turn over. ──

  This is the one rule in the sheet that decided which way up a phone had to be
  held. It is SWITCHED OFF, and it is not retired: 0.4.45 draws the tab for
  portrait, so there is nothing left for this to answer and nothing left to read
  it — the four pieces of the component that drew it are dormant beside their own
  definitions, and the RotateNotice element is dormant on the homepage. Left live,
  the media query below would match every portrait phone in the world and put a
  full-bleed panel over the village; the block is commented out for that reason
  and not for tidiness.

  It is kept rather than deleted because the decision is not final. The map is
  still a wide 19:13 surface fitted WHOLE to its frame — the frame is the two
  numbers above and the reason it is fitted rather than cropped is that a house
  on a corner of the map that nobody can see is a house nobody can open — and a
  map still wants a wide box. A later lane may decide it wants the map on its side
  again and may want to say so again.

  To bring it back: uncomment this block, uncomment the four pieces of the notice
  beside hostOf, and put the RotateNotice element back on the homepage at the foot
  of the row. Nothing else changed; the rule is exactly what it was.

  What it would take to REMOVE it rather than leave it dormant: nothing. It is a
  media query and a sentence, and neither of them is load-bearing. Delete the
  block and the four pieces when the portrait layout has been lived with and
  nobody wants the sideways map back — or delete them now, if that is already
  known to be the answer. It is left here unanswered on purpose.
*/
/*
.${ELEMENT_TAG}-rotate { display: none; }
@media (orientation: portrait) and (pointer: coarse) {
  .${ELEMENT_TAG}-rotate {
    position: absolute; inset: 0; z-index: 5;
    display: grid; place-content: center; justify-items: center;
    gap: .75rem;
    padding: calc(var(--${ELEMENT_TAG}-pad) * 2) var(--${ELEMENT_TAG}-pad);
    background: color-mix(in srgb, var(--background) 96%, transparent);
    text-align: center;
  }
}
.${ELEMENT_TAG}-rotate-phone { width: 3.25rem; color: var(--primary); }
.${ELEMENT_TAG}-rotate-phone svg { display: block; width: 100%; height: auto; }
.${ELEMENT_TAG}-rotate-title { margin: 0; font-size: .875rem; font-weight: 600; color: var(--foreground); }
.${ELEMENT_TAG}-rotate-note { margin: 0; max-width: 32ch; font-size: .8125rem; line-height: 1.5; color: var(--muted-foreground); }
*/
/*
  ON A TOUCH SCREEN, EVERY CONTROL IS AT LEAST A THUMB.

  The paddings above draw most of these controls about twenty-six pixels tall:
  comfortable to click with a mouse and too small to tap reliably with a thumb,
  and a control exists to be pressed.

  Forty-four is the number the guidance asks for and it is more than a map can pay
  everywhere — a taller row is a taller row, and the rows around these are the
  picture — so the ones that stand in a row of their own take the full amount and
  the ones that sit in a cluster take less, which is still a real improvement over
  twenty-six and still leaves the map its room.

  Only where the pointer is coarse. A finger is not a mouse and a mouse is not a
  thumb: nothing moves on a desktop.

  The square ones are centred as well, because a box grown around a glyph lets the
  glyph sit at the top of it. The map's own pin controls are the exception and are
  left as small as a finger can manage, because every pixel one of them takes is a
  pixel of the picture: a pin's remove button sits on the house, not in a bar.
*/
@media (pointer: coarse) {
  .${ELEMENT_TAG}-button,
  .${ELEMENT_TAG}-select,
  .${ELEMENT_TAG}-search,
  .${ELEMENT_TAG}-notice-input,
  .${ELEMENT_TAG}-macro,
  .${ELEMENT_TAG}-chat-mode-button,
  .${ELEMENT_TAG}-chat-send,
  .${ELEMENT_TAG}-step[data-clickable="true"],
  .${ELEMENT_TAG}-zoom-button,
  .${ELEMENT_TAG}-remove { min-height: 2.25rem; }
  .${ELEMENT_TAG}-icon-button,
  .${ELEMENT_TAG}-chat-mode-button,
  .${ELEMENT_TAG}-chat-send { min-width: 2.25rem; }
  .${ELEMENT_TAG}-zoom-button,
  .${ELEMENT_TAG}-icon-button,
  .${ELEMENT_TAG}-chat-mode-button,
  .${ELEMENT_TAG}-chat-send { justify-content: center; }
  /*
    There used to be a second rule here, reserving room on the box's right-hand
    edge for the press, because the press floated over the words and grew under a
    coarse pointer. The press is a flex item at the end of the line now, so the
    box makes that room for it by itself and there is nothing left to reserve.
  */
  .${ELEMENT_TAG}-pin-remove { min-width: 1.75rem; min-height: 1.75rem; }
  .${ELEMENT_TAG}-textarea { min-height: 4.5rem; }
}

/*
  WHAT THE TAB DOES WHEN IT HAS LESS ROOM.

  Container queries, not window queries, and the container is named. This sheet is
  injected into the document rather than into a shadow root, so it is a global
  stylesheet, and an unnamed query in a global stylesheet is a query that matches
  whatever container happens to be nearest. Naming the host's container says which
  box is being asked about, and there is exactly one.

  Five states: four the tab has always answered to, in the order they take room
  away, and one for the way up a phone is held, which is the release after this
  one and has a block of its own below.

  A tab narrower than 44rem is a phone, or a tab squeezed by the Engine's own side
  panels. The stage is already the whole tab at every width, so what is left for
  this query is the paragraph: the card keeps less of its own padding, because on
  a phone the tab's edges are close enough to be their own margins and every
  pixel spent on a gutter is a pixel off a line the player is reading. The tab's
  own padding comes in with it, so the picture keeps running to the edge.

  A tab shorter than 30rem is a phone held sideways, and very little else. It
  cannot afford the villager a figure as big as the floor would like, and the
  words need the height more than the picture does. The figure shrinks rather than
  the card moving somewhere else: the card is already directly above the composer,
  and a card that moved when the phone turned over would be a different screen
  every time the player shifted their grip. Shrinks, not narrows, and the two are
  not the same edit: it is HEIGHT that this tab is short of, and a square that
  answers a height the tab does not have is a square squeezing the paragraph.

  The figure's own share of the floor is asked for in the FLOOR's units now, so the
  only thing this block still has to say about it is how much of the row to keep
  clear under it: with the plate gone, half a rem is the row's own padding and
  nothing else.

  The tab gives up a row here too, and the row it gives up is the plate. The name
  of the villager is on the card, and the plate only says where they are, so a tab
  with 390 pixels of height spends its last one on the words rather than on the
  place they are said from. The portrait in the card goes with it, and for the
  same reason: the figure is still standing on the floor, and a second copy of it
  in the card is the first thing a short tab can do without.

  These fixes are not cosmetics and the reason is worth writing down, because it
  is a property of the stack rather than of any one row: the bottom stack is
  justified to its END, so anything that does not fit does not extend past the
  composer. It cannot spill upward either — the floor above it is the flexible
  row, so the stage yields first and the chrome stays where it is. That is the
  whole reason the figure has a floor of its own rather than a place at the head
  of the reading: a row that shrinks is a row nothing can be printed on top of.

  A tab narrower than 34rem gets the Menu as a column of full-width buttons
  instead of a wrapped cluster of ragged ones, which is how a phone draws a menu
  and how a thumb presses one. The figure used to shrink again here and no longer
  has to: a narrow tab is a handset, a handset is a tall tab, and a figure that is
  a share of the floor's height is width-limited by its own rule long before this
  block is reached.

  One ordering hazard runs through all five, and it is worth stating where the
  blocks are: a container query does not raise a rule's weight, so an override
  only wins by being read later. Every rule overridden below is declared a
  thousand lines above, which is why these blocks sit here at the end of the
  sheet rather than beside the rules they belong to.

  A tab that is taller than it is wide is a phone held the way a phone is normally
  held, and it is the case these three were never written for: every one of them
  asks about room, and portrait has the room — it is the SHAPE of the map that is
  the problem, because a wide picture in a tall box leaves most of the box under
  the picture rather than beside it. That state is the portrait block below, and it
  is the one that decides where the readout and the controls are drawn.
*/
@container ${ELEMENT_TAG} (max-width: 44rem) {
  .${ELEMENT_TAG}-chat { padding: .625rem; }
  .${ELEMENT_TAG}-chat-head { top: .625rem; left: .625rem; right: .625rem; }
  .${ELEMENT_TAG}-chat-vn-row { gap: .5rem; padding: .625rem; }
  .${ELEMENT_TAG}-room-screen > .${ELEMENT_TAG}-chat { overflow-y: auto; }
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-stage {
    flex: 1 1 9.5rem; height: auto; min-height: 9.5rem; padding-top: 3.25rem;
    justify-content: flex-end;
  }
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast { height: 100%; max-height: none; }
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast-person,
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast-person[data-active="true"] {
    flex: 0 1 30%; height: auto; justify-content: center;
  }
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast-person > .${ELEMENT_TAG}-avatar { width: min(4rem, 100%); }
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast-person > img { height: 5rem; max-width: 100%; }
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn { flex: 0 0 auto; justify-content: flex-start; }
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat > .${ELEMENT_TAG}-composer { flex: 0 0 auto; }
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat > .${ELEMENT_TAG}-composer {
    position: sticky; bottom: 0; z-index: 2;
    padding-bottom: env(safe-area-inset-bottom, 0px);
    background: var(--popover);
  }
}
@container ${ELEMENT_TAG} (max-width: 55rem) and (max-height: 32rem) {
  .${ELEMENT_TAG}-setup-map-viewport { max-height: min(65cqh, 36rem); overscroll-behavior: contain; }
}
@container ${ELEMENT_TAG} (max-height: 30rem) {
  .${ELEMENT_TAG}-chat { gap: .5rem; padding: .625rem; }
  .${ELEMENT_TAG}-chat-stage { gap: .25rem; }
  /*
    The same share of the figure's width as the rule it overrides, and a TIGHTER
    reservation under it: this block is where the plate under the figure is given
    up, so the half a rem it was keeping clear goes back to the figure. That is
    the only difference between the two lines, and it is the whole reason this
    block still states a size of its own.
  */
  .${ELEMENT_TAG}-chat-figure { width: min(38cqw, calc(100cqh - .5rem)); }
  .${ELEMENT_TAG}-chat-scene-place { display: none; }
  .${ELEMENT_TAG}-chat-log { gap: .375rem; }
  .${ELEMENT_TAG}-chat-vn-portrait { display: none; }
  .${ELEMENT_TAG}-chat-vn-reading { max-height: min(34cqh, 11rem); }
}
/* A short landscape viewport gives the cast a column beside the reading stack. */
@container ${ELEMENT_TAG} (min-width: 34rem) and (max-height: 30rem) {
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-stage {
    position: absolute; top: 3rem; bottom: .5rem; left: .5rem; width: 34%;
    z-index: 1; flex: none;
  }
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast-person { font-size: .5625rem; }
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn,
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat > .${ELEMENT_TAG}-row,
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat > .${ELEMENT_TAG}-composer {
    width: 64%; align-self: flex-end; box-sizing: border-box;
  }
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn { margin-top: auto; }
}
@container ${ELEMENT_TAG} (max-width: 34rem) {
  .${ELEMENT_TAG}-menu-group-buttons { flex-direction: column; align-items: stretch; }
  .${ELEMENT_TAG}-chat-menu { max-width: 88cqw; }
  .${ELEMENT_TAG}-chat-modes { max-width: 88cqw; }
  .${ELEMENT_TAG}-chat-menu-button { width: 2.25rem; height: 2.25rem; }
  .${ELEMENT_TAG}-chat-vn-portrait { width: min(4rem, 22cqw); }
}
@container ${ELEMENT_TAG} (max-width: 34rem) and (max-height: 32rem) {
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-stage { min-height: 7.5rem; padding-top: 2.75rem; }
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast-person > .${ELEMENT_TAG}-avatar { width: min(3.25rem, 100%); }
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast-person > img { height: 3.5rem; }
}
/*
  A tab shorter than 22rem is 352 pixels of height, and at that height the top
  chrome, the card, the history tab, the composer and its own padding have already
  spent the tab: what is left for the floor is a strip, which is a villager's
  shoulders and nothing else. So this block buys the card's room from the three
  things that can most afford to give it up: the gap between the figure and its
  plate, the ceiling on the paragraph, and the size of the speaker's name.

  It used to take its share from the "right now" line as well, and 0.4.50 deleted
  that line rather than override it here — there is nothing left in the block to
  hide, so the row of chrome above the card is one badge and one button at every
  height. What the block does now is what it always did underneath: the paragraph
  is the box that shrinks, and the ceiling on it is what stops a long answer
  pushing the composer off a tab this short.

  It is last of the three on purpose: at 640x360 or 390x340 every one of these
  queries matches at once, and the floor is squeezed hardest by whichever block is
  read last. The shares are smaller here than in either block above for the same
  reason.

  ponytail: the ceiling of this block is about 19rem, and it is lower than it used
  to be because the card now carries a face, a name and a paragraph rather than a
  paragraph alone. Under 19rem the chrome, the card and the composer are the whole
  tab and the floor is a strip, so the figure is a strip too — it is a share of the
  row it stands in, and the row is whatever the card and the composer leave. What
  is accepted here is that a strip is what the player gets: a villager's shoulders
  and not their face. There is no honest alternative left to trade for — the row is
  the first thing this tab is short of, and the card is what is being read — and a
  figure that were allowed to keep its size would be a figure with its head above
  the top edge of the tab. If a tab this short ever has to work properly, the fix
  is a compact composer: the figure is already at its floor here and there is
  nothing left to take from the card.
*/
@container ${ELEMENT_TAG} (max-height: 22rem) {
  .${ELEMENT_TAG}-chat-stage { gap: .125rem; padding-bottom: .125rem; }
  .${ELEMENT_TAG}-chat-vn-reading { max-height: min(38cqh, 9rem); }
  .${ELEMENT_TAG}-chat-vn-name { font-size: .8125rem; }
}

@container ${ELEMENT_TAG} (max-width: 44rem) {
  .${ELEMENT_TAG}-setup-map-viewport { max-height: min(65cqh, 36rem); overscroll-behavior: contain; }
}

/*
  There is no rule here for the way into a roleplay, and its absence is the fix.

  A section of its own used to live at the foot of the drawer: a heading, a verb
  in a row of its own, and a paragraph explaining what the verb does. On a phone
  held sideways that is a hundred and forty pixels of a three-hundred-and-ninety
  pixel drawer, and the drawer pays for it in the only currency it has left —
  the conversation, which came out at twenty-six pixels on an 844x390 screen and
  at NOTHING at all at 844x340 and 740x360, with the villager's square portrait
  flattened to two pixels in the column beside it. The room the player opened the
  drawer for was the thing being spent.

  So the verb is drawn in the drawer's own options menu, where it costs no height
  at all: the list is drawn over the reading rather than beside it, and it is
  closed when it is not being read. The paragraph it used to carry is the button's
  title now, which costs nothing and is where a player looks for it anyway.
*/
/*
  The spawn sheet: the questions asked between pressing Create spinoff chat and
the roleplay existing.

  It is a SHEET over the whole window rather than a panel inside the tab, and
  that is the one thing about it the player has to feel rather than read. Making
a chat is the moment this tab stops being a picture of a village and starts
  being a real roleplay in the player's own library, and a control that simply
  changed a dropdown would let that happen without anybody noticing. The dim is
  gentle on purpose — the game is still visible behind it and nothing is
  destroyed — but it is there, because what is about to happen is not a setting.

  Fixed rather than absolute, because the tab scrolls: a sheet anchored to the
  document would open somewhere up the page from wherever the player was
  standing. A transform on an ancestor would make this relative to that ancestor
  instead of to the window — the one thing that could move it, and the reason
  this is stated here rather than assumed.
*/
.${ELEMENT_TAG}-backdrop {
  position: fixed; inset: 0; z-index: 60;
  display: flex; align-items: center; justify-content: center;
  padding: clamp(.75rem, 3vw, 2rem);
  background: color-mix(in srgb, #05060a 52%, transparent);
}
.${ELEMENT_TAG}-sheet {
  display: flex; flex-direction: column; gap: .75rem;
  width: min(100%, 27rem); max-height: min(100%, 34rem);
  border: 1px solid var(--border); border-radius: .875rem;
  background: var(--popover, var(--background)); color: var(--foreground);
  box-shadow: 0 1.5rem 3.5rem rgba(0, 0, 0, .45);
  padding: .9375rem;
  overflow: hidden;
}
.${ELEMENT_TAG}-sheet-head { display: flex; flex-direction: column; gap: .1875rem; }
.${ELEMENT_TAG}-sheet-title { margin: 0; font-size: .9625rem; font-weight: 600; }
.${ELEMENT_TAG}-sheet-note { margin: 0; font-size: .75rem; line-height: 1.5; color: var(--muted-foreground); }
.${ELEMENT_TAG}-sheet-body {
  display: flex; flex-direction: column; gap: .5rem;
  min-height: 0; overflow-y: auto; padding-right: .125rem;
}
.${ELEMENT_TAG}-sheet-actions { display: flex; flex-wrap: wrap; align-items: center; gap: .375rem; }
.${ELEMENT_TAG}-sheet-actions-end { margin-left: auto; display: flex; flex-wrap: wrap; gap: .375rem; }
/*  The one filled button in the package. Everywhere else the accent is a border,
    because everywhere else the control sits inside the player's village and is
    one of several. Here there is exactly one thing to do next. */
.${ELEMENT_TAG}-button-primary {
  border-color: var(--primary); background: var(--primary);
  color: var(--primary-foreground, var(--background));
}
.${ELEMENT_TAG}-button-primary:hover { border-color: var(--primary); color: var(--primary-foreground, var(--background)); opacity: .9; }
/*  A preset, as a row rather than as an option in a select. It is drawn as a
    list because a preset is a choice with consequences — it decides how the
    whole roleplay reads — and a dropdown hides the consequences behind a click. */
.${ELEMENT_TAG}-choice {
  display: flex; flex-direction: column; align-items: flex-start; gap: .125rem;
  width: 100%; text-align: left;
  border: 1px solid var(--border); border-radius: .5rem;
  background: transparent; color: var(--foreground);
  padding: .4375rem .625rem; font: inherit; font-size: .8125rem; cursor: pointer;
}
.${ELEMENT_TAG}-choice:hover { border-color: var(--primary); }
.${ELEMENT_TAG}-choice[data-active="true"] { border-color: var(--primary); box-shadow: inset 0 0 0 1px var(--primary); }
.${ELEMENT_TAG}-choice-note { font-size: .6875rem; line-height: 1.45; color: var(--muted-foreground); }
/*  One preset question, and the answers to it. The pills are the Engine's own
    button mode; the list below is its listbox mode, which it reaches for by
    itself once a question has enough answers that a wall of pills stops being
    readable. Both are drawn here because the popup has to be able to show
    whichever one the preset asked for. */
.${ELEMENT_TAG}-var { display: flex; flex-direction: column; gap: .3125rem; }
.${ELEMENT_TAG}-var-question { font-size: .75rem; font-weight: 600; line-height: 1.4; }
.${ELEMENT_TAG}-var-options { display: flex; flex-wrap: wrap; gap: .25rem; }
.${ELEMENT_TAG}-var-option {
  display: inline-flex; align-items: center; gap: .3125rem;
  border: 1px solid var(--border); border-radius: 999px;
  padding: .1875rem .5rem; font-size: .75rem; line-height: 1.4; cursor: pointer;
}
.${ELEMENT_TAG}-var-option:hover { border-color: var(--primary); }
.${ELEMENT_TAG}-var-option[data-on="true"] { border-color: var(--primary); color: var(--primary); }
.${ELEMENT_TAG}-var-option input { flex: none; margin: 0; accent-color: var(--primary); }
.${ELEMENT_TAG}-var-list {
  font: inherit; font-size: .75rem; max-width: 100%; min-height: 7rem;
  border: 1px solid var(--border); border-radius: .5rem;
  background: var(--background); color: var(--foreground); padding: .25rem;
}
/*
  RETIRED 0.4.43 — the gate: what the tab used to be while one of its villagers
  was away in a scene.

  The whole village was replaced rather than dimmed, and that was the narrative
  rule the old feature was built on — while the player was doing something with
  one character, the village was not a place to be rearranging. It said so, and
  then gave three ways out: go to the chat, bring them home, or let the link go.

  No element carries these classes any more: the component that drew them,
  SceneGate, is retired next to the place it used to be defined. They are kept for
  the same reason it is — they are the only drawing of a village standing still,
  and a later lane that wants one again will want them again. Nothing reads a
  -gate- rule, so nothing here costs anything.
*/
.${ELEMENT_TAG}-gate {
  display: flex; flex-direction: column; gap: .75rem; align-items: flex-start;
  margin: auto; width: min(100%, 32rem); padding: 1.25rem;
  border: 1px solid var(--border); border-radius: .875rem;
  background: var(--popover, var(--background));
  box-shadow: 0 1rem 2.5rem rgba(0, 0, 0, .3);
}
.${ELEMENT_TAG}-gate-title { margin: 0; font-size: 1.125rem; font-weight: 600; }
.${ELEMENT_TAG}-gate-note { margin: 0; font-size: .8125rem; line-height: 1.55; color: var(--muted-foreground); }
.${ELEMENT_TAG}-gate-actions { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; }
/*  The chip's own popover, hung off the toolbar button it belongs to. Absolute
    rather than fixed: it is a sentence about the button under the player's
    finger, and it should move with the chat chrome rather than with the page. */
.${ELEMENT_TAG}-tracker-menu {
  position: absolute; top: calc(100% + .5rem); right: 0; z-index: 40;
  width: 17rem; display: flex; flex-direction: column; gap: .5rem;
  border: 1px solid var(--border); border-radius: .625rem;
  background: var(--popover, var(--background)); color: var(--foreground);
  box-shadow: 0 .875rem 2rem rgba(0, 0, 0, .35); padding: .625rem;
}
.${ELEMENT_TAG}-tracker-menu-title { margin: 0; font-size: .8125rem; font-weight: 600; }
.${ELEMENT_TAG}-tracker-menu-note { margin: 0; font-size: .75rem; line-height: 1.5; color: var(--muted-foreground); }
.${ELEMENT_TAG}-tracker-menu-row { display: flex; flex-wrap: wrap; gap: .375rem; }
/*
  The chip's width, released from the host's square.

  The Engine hands every package toolbar control the same class, and that class
  is a fixed square because every other control in that strip is one icon and
  nothing else. This one is not: its whole job is to tell the player that the chat
  they are reading belongs to their village, and an icon cannot tell them that.
  So the width is released here, the label is worn inside the button, and the
  colour, the radius, the border and the states all stay the host's — this rule
  adds a width and a gap and paints nothing.
*/
.${ELEMENT_TAG}-tracker-chip { width: auto; max-width: none; gap: .3125rem; padding-inline: .5rem; }
.${ELEMENT_TAG}-tracker-label { font-size: .6875rem; font-weight: 600; line-height: 1; letter-spacing: .01em; }
/*  On a phone the strip is a row of squares and there is no room for a word, so
    the chip goes back to being one: the icon, the same host chrome, and the same
    menu one press away. The sentence the label was carrying is the menu's first
    line, which is where a player on a phone will read it anyway. */
.${ELEMENT_TAG}-tracker[data-compact="true"] .${ELEMENT_TAG}-tracker-label { display: none; }
.${ELEMENT_TAG}-tracker[data-open="true"] .${ELEMENT_TAG}-tracker-label { color: var(--marinara-chat-chrome-button-text-active, currentColor); }
/*
  The tracker panel's body.

  Drawn inside the Engine's own tracker section, which already supplies the
  card, the veil and the heading, so this adds no chrome of its own — only the
  small amount of layout the Engine's shell leaves to the package.
*/
.${ELEMENT_TAG}-panel-view { display: flex; flex-direction: column; gap: .4375rem; }
.${ELEMENT_TAG}-panel-view-row { display: flex; flex-wrap: wrap; align-items: baseline; gap: .375rem; font-size: .75rem; line-height: 1.5; }
.${ELEMENT_TAG}-panel-view-key { color: var(--muted-foreground); }
.${ELEMENT_TAG}-panel-view-actions { display: flex; flex-wrap: wrap; gap: .375rem; margin-top: .125rem; }
/*
  The tracker button, which is drawn inside the Engine's own chat chrome rather
  than inside this tab. Its colours and its size are the host's: the class the
  Engine hands over is worn whole, and everything here is only what the host has
  no opinion about — that the button and its icon share the host's own colour
  rather than this tab's.

  The data-state=done rule below and the spinner under it have nothing to match
  since 0.4.43 — there is one state now, because there is nothing the chip can be
  waiting for. Kept with the icons they belonged to; see the RETIRED note in the
  chrome further down.

  THE SPINNER HAS AN OWNER AGAIN as of 0.4.47, and it is not this one. It is the
  dot in the corner of a chat that is waiting on a villager — see chat-pending —
  which is the same animation doing the same job that the chip's spinner did: a
  turn going round while a model is out. The style itself was never the surprise;
  what went missing in 0.4.43 was the thing being waited for.
*/
.${ELEMENT_TAG}-tracker { position: relative; display: inline-flex; align-items: center; }
.${ELEMENT_TAG}-tracker svg { width: 1rem; height: 1rem; }
.${ELEMENT_TAG}-tracker[data-state="done"] { opacity: .7; }
.${ELEMENT_TAG}-spin { animation: ${ELEMENT_TAG}-spin .9s linear infinite; }
@keyframes ${ELEMENT_TAG}-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) {
  .${ELEMENT_TAG}-spin { animation: none; }
}

/* 0.6.10 mobile village: the wooden frame is the viewport, not the moving map. */
.${ELEMENT_TAG}-home-full[data-mobile="true"] { box-sizing: border-box; flex-direction: column; overflow: hidden; padding: .5rem; gap: .5rem; }
.${ELEMENT_TAG}-home-full[data-mobile="true"] .${ELEMENT_TAG}-room { min-height: 0; padding: calc(var(--${ELEMENT_TAG}-map-wood) + var(--${ELEMENT_TAG}-map-mat) + 1px); }
.${ELEMENT_TAG}-home-full[data-mobile="true"] .${ELEMENT_TAG}-home-map-viewport { display: block; width: 100%; height: 100%; overflow: visible; }
.${ELEMENT_TAG}-home-full[data-mobile="true"] .${ELEMENT_TAG}-stage { display: block; width: 100% !important; height: 100% !important; aspect-ratio: auto !important; touch-action: none; }
.${ELEMENT_TAG}-stage[data-mobile="true"] { touch-action: none; user-select: none; }
.${ELEMENT_TAG}-stage[data-mobile="true"] .${ELEMENT_TAG}-canvas { overflow: hidden; }
.${ELEMENT_TAG}-stage[data-mobile="true"] .${ELEMENT_TAG}-canvas-img { max-width: none; max-height: none; pointer-events: none; }
.${ELEMENT_TAG}-stage[data-mobile="true"][data-empty="true"] .${ELEMENT_TAG}-canvas { background: var(--background); }
.${ELEMENT_TAG}-mobile-logical { position: absolute; display: block; background: radial-gradient(circle at 30% 25%, color-mix(in srgb, var(--primary) 17%, transparent), transparent 30%), linear-gradient(25deg, #34304d, #20243b); pointer-events: none; }
.${ELEMENT_TAG}-home-bar { display: flex; align-items: center; flex: 0 0 auto; gap: .35rem; min-width: 0; z-index: 15; }
.${ELEMENT_TAG}-home-bar-actions { display: inline-flex; align-items: center; gap: .35rem; margin-left: auto; }
.${ELEMENT_TAG}-home-bar .${ELEMENT_TAG}-button { min-height: 2.5rem; }
.${ELEMENT_TAG}-mobile-datetime { display: inline-flex; align-items: center; gap: .2rem; min-width: 0; border: 1px solid #d6ba7c; border-radius: .65rem; background: #718eb6; color: #172238; padding: .2rem .3rem; font-size: .95rem; white-space: nowrap; }
.${ELEMENT_TAG}-mobile-clock { display: flex; flex-direction: column; line-height: 1.15; font-variant-numeric: tabular-nums; font-size: clamp(.58rem, 2.5cqw, .75rem); }
.${ELEMENT_TAG}-mobile-board-button, .${ELEMENT_TAG}-mobile-menu-button, .${ELEMENT_TAG}-home-bar .${ELEMENT_TAG}-news-toggle { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; width: 2.5rem; height: 2.5rem; min-width: 2.5rem; min-height: 2.5rem; padding: .15rem; }
.${ELEMENT_TAG}-mobile-board-button { border: 3px solid #5c381d; border-radius: .3rem; background: repeating-linear-gradient(90deg, #ad7540 0 9px, #9a6636 9px 11px); color: #f6e3b6; box-shadow: inset 0 0 0 2px #c5925a, 0 2px 4px #0007; font-size: 1.4rem; cursor: pointer; }
.${ELEMENT_TAG}-mobile-board-button:disabled { opacity: .55; }
.${ELEMENT_TAG}-mobile-menu-button { font-size: 1.5rem; line-height: 1; }
.${ELEMENT_TAG}-home-bar .${ELEMENT_TAG}-news-toggle { position: relative; }
.${ELEMENT_TAG}-home-bar .${ELEMENT_TAG}-news-toggle svg { width: 1.3rem; height: 1.3rem; }
.${ELEMENT_TAG}-news-nyi { position: absolute; right: -.15rem; bottom: -.3rem; border-radius: .2rem; background: var(--popover); color: var(--foreground); padding: 0 .1rem; font-size: .55rem; font-weight: 700; }
.${ELEMENT_TAG}-home-bar .${ELEMENT_TAG}-news-panel { width: min(19rem, 80cqw); max-height: 60cqh; }
.${ELEMENT_TAG}-home-full[data-mobile="false"] .${ELEMENT_TAG}-mobile-datetime { font-size: 1rem; padding: .25rem .45rem; }
.${ELEMENT_TAG}-home-full[data-mobile="false"] .${ELEMENT_TAG}-mobile-clock { font-size: .75rem; }
.${ELEMENT_TAG}-stage[data-mobile="true"] .${ELEMENT_TAG}-pin-holder { z-index: 2; }
.${ELEMENT_TAG}-stage .${ELEMENT_TAG}-pin-holder[data-selected="true"] { z-index: 7; }
.${ELEMENT_TAG}-home-full .${ELEMENT_TAG}-pin[data-kind="place"], .${ELEMENT_TAG}-stage[data-mobile="true"] .${ELEMENT_TAG}-pin[data-kind="place"] { display: flex; align-items: center; justify-content: center; width: 3rem; height: 3rem; padding: 0; border: 0; border-radius: 0; background: transparent; color: #30261c; box-shadow: none; text-align: center; white-space: normal; line-height: 1.1; overflow: visible; }
.${ELEMENT_TAG}-home-full .${ELEMENT_TAG}-pin-photo-card, .${ELEMENT_TAG}-stage[data-mobile="true"] .${ELEMENT_TAG}-pin-photo-card { display: flex; flex: 0 0 auto; flex-direction: column; width: clamp(3.5rem, 6cqw, 5rem); gap: .1rem; padding: .18rem; box-sizing: border-box; border-radius: .1rem; background: #faf4e7; box-shadow: 0 3px 8px #0009; transform-origin: center; transition: transform 160ms ease-out; }
.${ELEMENT_TAG}-stage[data-mobile="true"] .${ELEMENT_TAG}-pin-photo-card { width: clamp(4rem, 17cqw, 5.25rem); }
.${ELEMENT_TAG}-home-full .${ELEMENT_TAG}-pin-photo, .${ELEMENT_TAG}-stage[data-mobile="true"] .${ELEMENT_TAG}-pin-photo { position: relative; display: block; width: 100%; aspect-ratio: 1 / 1; background: #201e29; overflow: visible; }
.${ELEMENT_TAG}-home-full .${ELEMENT_TAG}-pin-photo img, .${ELEMENT_TAG}-stage[data-mobile="true"] .${ELEMENT_TAG}-pin-photo img { display: block; width: 100%; height: 100%; object-fit: contain; }
.${ELEMENT_TAG}-home-full .${ELEMENT_TAG}-pin-name, .${ELEMENT_TAG}-stage[data-mobile="true"] .${ELEMENT_TAG}-pin-name { display: block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; font-size: .58rem; font-weight: 700; }
.${ELEMENT_TAG}-stage[data-mobile="true"] .${ELEMENT_TAG}-pin[data-kind="person"] { max-width: 7rem; }
.${ELEMENT_TAG}-stage[data-mobile="true"][data-mobile-gesturing="true"] .${ELEMENT_TAG}-pin-photo-card { transition: none; }
.${ELEMENT_TAG}-stage[data-mobile="true"] .${ELEMENT_TAG}-doors { z-index: 8; transform: translateX(-50%); min-width: min(10rem, 70cqw); }
.${ELEMENT_TAG}-project-screen { display: grid; gap: 1.25rem; min-height: 0; color: #eef2ff; }
.${ELEMENT_TAG}-project-head { display: flex; justify-content: space-between; align-items: start; gap: 1rem; padding: .25rem .25rem .5rem; }
.${ELEMENT_TAG}-project-head h2 { font-size: clamp(1.5rem, 3vw, 2.2rem); margin: .25rem 0; color: #f6f4ff; }
.${ELEMENT_TAG}-project-head p { margin: 0; color: #adbee8; }
.${ELEMENT_TAG}-project-eyebrow { color: #b8adff; font-size: .72rem; font-weight: 800; letter-spacing: .12em; }
.${ELEMENT_TAG}-project-slots { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
.${ELEMENT_TAG}-project-slot, .${ELEMENT_TAG}-project-card { border: 1px solid #3f59ab; border-radius: 1rem; background: linear-gradient(145deg, #182b62, #101d44); box-shadow: 0 1rem 2rem #070e2b44; color: #f1f3ff; }
.${ELEMENT_TAG}-project-slot { display: grid; gap: .6rem; min-height: 11rem; text-align: left; padding: 1.3rem; cursor: pointer; }
.${ELEMENT_TAG}-project-slot:hover, .${ELEMENT_TAG}-project-slot:focus-visible { border-color: #a78bfa; box-shadow: 0 0 0 2px #8d6cf6; }
.${ELEMENT_TAG}-project-slot span { color: #aa9eff; font-size: .78rem; font-weight: 800; letter-spacing: .1em; }
.${ELEMENT_TAG}-project-slot strong { font-size: 1.3rem; }
.${ELEMENT_TAG}-project-slot small { color: #b8c6eb; }
.${ELEMENT_TAG}-project-create { grid-column: 1 / -1; }
.${ELEMENT_TAG}-project-layout { display: grid; grid-template-columns: minmax(10rem, 13rem) minmax(19rem, 1fr); gap: 1rem; align-items: start; min-height: 0; }
.${ELEMENT_TAG}-project-rail { display: grid; gap: .6rem; }
.${ELEMENT_TAG}-project-step { display: flex; align-items: center; gap: .7rem; color: #8da2d4; padding: .7rem; border-radius: .7rem; }
.${ELEMENT_TAG}-project-step b { display: grid; place-items: center; flex: 0 0 2.3rem; height: 2.3rem; border: 1px solid #6480cd; border-radius: 50%; }
.${ELEMENT_TAG}-project-step[data-state="active"] { color: white; background: linear-gradient(110deg, #344af1, #192c69); }
.${ELEMENT_TAG}-project-step[data-state="active"] b { background: #8b4cf4; border-color: #8b4cf4; }
.${ELEMENT_TAG}-project-step[data-state="done"] { color: #b8d6ff; }
.${ELEMENT_TAG}-project-card { display: grid; gap: .85rem; padding: 1.25rem; }
.${ELEMENT_TAG}-project-card h3, .${ELEMENT_TAG}-project-card h4 { margin: 0; }
.${ELEMENT_TAG}-project-card p { margin: .1rem 0; line-height: 1.45; color: #c7d4f6; }
.${ELEMENT_TAG}-project-card label { display: grid; gap: .4rem; font-weight: 650; }
.${ELEMENT_TAG}-project-card input:not([type="file"]), .${ELEMENT_TAG}-project-card select, .${ELEMENT_TAG}-project-card textarea { width: 100%; box-sizing: border-box; border: 1px solid #5470bf; border-radius: .55rem; background: #172b60; color: #f4f6ff; padding: .7rem; font: inherit; }
.${ELEMENT_TAG}-project-card textarea { min-height: 7rem; resize: vertical; }
.${ELEMENT_TAG}-project-card > .${ELEMENT_TAG}-button { background: linear-gradient(100deg, #3656f6, #9448ef); color: white; min-height: 2.75rem; }
.${ELEMENT_TAG}-project-material { display: grid; gap: .35rem; border: 1px solid #425ba1; border-radius: .65rem; padding: .7rem; }
.${ELEMENT_TAG}-project-material span { color: #b6c5ea; }
.${ELEMENT_TAG}-project-finish-visit { display: grid; gap: 1rem; max-width: 62rem; margin: 0 auto; padding: 1.25rem; border: 1px solid #536cc0; border-radius: 1rem; background: #142657; color: #f4f6ff; }
.${ELEMENT_TAG}-project-finish-visit header { display: grid; gap: .5rem; }
.${ELEMENT_TAG}-project-finish-visit h2, .${ELEMENT_TAG}-project-finish-visit p { margin: 0; }
.${ELEMENT_TAG}-project-finish-visit label { display: grid; gap: .4rem; }
.${ELEMENT_TAG}-project-finish-visit input:not([type="file"]), .${ELEMENT_TAG}-project-finish-visit textarea { width: 100%; box-sizing: border-box; border: 1px solid #5470bf; border-radius: .55rem; background: #172b60; color: #f4f6ff; padding: .7rem; font: inherit; }
.${ELEMENT_TAG}-project-finish-visit textarea { min-height: 7rem; }
.${ELEMENT_TAG}-project-image { display: grid; gap: .5rem; border-top: 1px solid #425ba1; padding-top: .8rem; }
.${ELEMENT_TAG}-project-image img { max-width: min(100%, 20rem); aspect-ratio: 3 / 2; object-fit: cover; border-radius: .5rem; }
.${ELEMENT_TAG}-project-footer { display: flex; justify-content: flex-start; border-top: 1px solid #425ba1; padding-top: .8rem; }
@media (max-width: 700px) { .${ELEMENT_TAG}-project-slots, .${ELEMENT_TAG}-project-layout { grid-template-columns: 1fr; } .${ELEMENT_TAG}-project-rail { display: flex; overflow-x: auto; } .${ELEMENT_TAG}-project-step { flex: 0 0 9rem; } }
.${ELEMENT_TAG}-mobile-map-preview { display: block; max-width: min(100%, 22rem); max-height: 13rem; object-fit: contain; border: 2px solid var(--border); }
.${ELEMENT_TAG}-setup-map-viewport:has(> .${ELEMENT_TAG}-stage[data-mobile="true"]) { height: min(55cqh, 30rem); overflow: hidden; }
.${ELEMENT_TAG}-setup-map-viewport > .${ELEMENT_TAG}-stage[data-mobile="true"] { width: 100% !important; height: 100% !important; aspect-ratio: auto !important; }
/* Shared place photographs, including the founding map before an image exists. */
.${ELEMENT_TAG}-stage[data-photo-pins="true"][data-mobile="false"] .${ELEMENT_TAG}-pin[data-kind="place"] { display: flex; align-items: center; justify-content: center; min-width: 0; min-height: 0; padding: 0; border: 0; background: transparent; box-shadow: none; overflow: visible; }
.${ELEMENT_TAG}-stage[data-photo-pins="true"][data-mobile="false"] .${ELEMENT_TAG}-pin-photo-card { display: flex; flex-direction: column; gap: .1rem; width: 4rem; padding: .18rem; box-sizing: border-box; border-radius: .1rem; background: #faf4e7; color: #30261c; box-shadow: 0 3px 8px #0009; transform-origin: center; transition: transform 160ms ease-out; }
.${ELEMENT_TAG}-stage[data-photo-pins="true"][data-mobile="false"] .${ELEMENT_TAG}-pin-photo { position: relative; display: block; width: 100%; aspect-ratio: 1 / 1; background: #201e29; }
.${ELEMENT_TAG}-stage[data-photo-pins="true"][data-mobile="false"] .${ELEMENT_TAG}-pin-photo img { display: block; width: 100%; height: 100%; object-fit: contain; }
.${ELEMENT_TAG}-stage[data-photo-pins="true"][data-mobile="false"] .${ELEMENT_TAG}-pin-name { display: block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: .55rem; font-weight: 700; }
.${ELEMENT_TAG}-pin-photo-empty { display: flex; width: 100%; height: 100%; align-items: center; justify-content: center; color: #e8dfc9; font-size: 1.5rem; }
.${ELEMENT_TAG}-pin-placement-error { position: absolute; z-index: 15; left: .5rem; bottom: .5rem; margin: 0; max-width: calc(100% - 1rem); padding: .4rem .6rem; border-radius: .5rem; background: #261a19e8; color: white; font-size: .75rem; pointer-events: none; }
.${ELEMENT_TAG}-setup-venue-list { display: grid; gap: .45rem; margin: .5rem 0; }
.${ELEMENT_TAG}-setup-venue-card { display: grid; grid-template-columns: 3.5rem minmax(0, 1fr); align-items: center; gap: .65rem; min-height: 4.4rem; width: 100%; box-sizing: border-box; text-align: left; border: 1px solid var(--border); border-radius: .6rem; background: var(--background); color: var(--foreground); padding: .45rem; }
.${ELEMENT_TAG}-setup-venue-card[data-selected="true"] { border-color: var(--primary); }
.${ELEMENT_TAG}-setup-venue-card img, .${ELEMENT_TAG}-setup-venue-placeholder { width: 3.5rem; height: 3.5rem; object-fit: cover; border-radius: .3rem; background: #31291f; }
.${ELEMENT_TAG}-setup-venue-placeholder { display: grid; place-items: center; color: #eee5d5; font-size: 1.3rem; }
@media (prefers-reduced-motion: reduce) { .${ELEMENT_TAG}-pin-photo-card { transition: none; } }
.${ELEMENT_TAG}-setup-venue-card strong, .${ELEMENT_TAG}-setup-venue-card small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.${ELEMENT_TAG}-setup-venue-editor { display: grid; gap: .65rem; border-top: 1px solid var(--border); padding-top: .75rem; }
.${ELEMENT_TAG}-setup-image-preview { display: block; width: min(100%, 18rem); aspect-ratio: 3 / 2; object-fit: cover; border-radius: .5rem; }
.${ELEMENT_TAG}-preparing { display: grid; place-items: center; min-height: 100%; padding: 2rem; text-align: center; background: radial-gradient(circle at 50% 65%, #584a2e, #241e24 70%); color: #fff4dd; }
.${ELEMENT_TAG}-preparing-house { font-size: clamp(4rem, 13vw, 7rem); animation: ${ELEMENT_TAG}-settle 2.5s ease-in-out infinite; }
@keyframes ${ELEMENT_TAG}-settle { 50% { transform: translateY(-.35rem) rotate(2deg); } }
@media (prefers-reduced-motion: reduce) { .${ELEMENT_TAG}-preparing-house { animation: none; } }
/* Game Mode's reading stack: asides float over a bounded bottom panel. */
.${ELEMENT_TAG}-root.${ELEMENT_TAG}-room-screen { box-sizing: border-box; padding: 0; overflow: hidden; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn { position: relative; align-self: center; width: min(58rem, 100%); margin-top: auto; padding: .6rem; box-sizing: border-box; border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border)); border-radius: 1rem; background: var(--marinara-chat-chrome-panel-bg, color-mix(in srgb, var(--popover) 88%, transparent)); backdrop-filter: blur(14px); box-shadow: 0 .75rem 2rem #0007; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn-asides { position: absolute; right: .5rem; bottom: calc(100% + .5rem); width: min(75%, 24rem); max-height: min(30cqh, 12rem); }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn-card { background: color-mix(in srgb, var(--background) 62%, transparent); box-shadow: none; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn-reading { max-height: min(30cqh, 18rem); }
.${ELEMENT_TAG}-room-panel-tools { display: flex; align-items: center; gap: .5rem; min-height: 2rem; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-history-toggle { min-height: 2rem; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-composer { min-width: 0; }
.${ELEMENT_TAG}-room-mode-anchor { position: relative; flex: 0 0 auto; }
.${ELEMENT_TAG}-room-mode-toggle { display: inline-flex; align-items: center; justify-content: center; width: 2rem; height: 2rem; border: 0; border-radius: .5rem; background: transparent; color: var(--primary); font-size: 1rem; cursor: pointer; }
.${ELEMENT_TAG}-room-mode-menu { position: absolute; z-index: 20; left: 0; bottom: calc(100% + .45rem); display: grid; width: 9rem; padding: .25rem; border: 1px solid var(--border); border-radius: .6rem; background: var(--popover); box-shadow: 0 .5rem 1rem #0008; }
.${ELEMENT_TAG}-room-mode-menu button { border: 0; border-radius: .35rem; background: transparent; color: var(--foreground); text-align: left; padding: .5rem; font: inherit; cursor: pointer; }
.${ELEMENT_TAG}-room-mode-menu button[aria-checked="true"] { background: color-mix(in srgb, var(--primary) 17%, var(--popover)); }
.${ELEMENT_TAG}-room-mode-menu button:disabled { opacity: .5; cursor: default; }
.${ELEMENT_TAG}-mailbox-backdrop { position: fixed; inset: 0; z-index: 100; display: grid; place-items: center; padding: 1rem; background: #0009; }
.${ELEMENT_TAG}-mailbox { width: min(42rem, 100%); max-height: min(80vh, 48rem); overflow: auto; padding: 1.5rem; border: 1px solid var(--border); border-radius: 1rem; background: var(--popover); box-shadow: 0 1rem 3rem #0009; }
.${ELEMENT_TAG}-mailbox-list { display: grid; gap: .75rem; margin-top: 1rem; }
.${ELEMENT_TAG}-mailbox-item { padding: .9rem; border: 1px solid var(--border); border-radius: .75rem; }
.${ELEMENT_TAG}-venue-space-picture { display: block; width: min(100%, 24rem); aspect-ratio: 4 / 3; object-fit: cover; border: 1px solid var(--border); border-radius: .625rem; }
.${ELEMENT_TAG}-room-mode-toggle:focus-visible, .${ELEMENT_TAG}-room-mode-menu button:focus-visible, .${ELEMENT_TAG}-room-star-detail:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.${ELEMENT_TAG}-room-star-detail { flex: 1; align-self: stretch; border: 0; padding: 0; background: transparent; color: inherit; font: inherit; line-height: inherit; text-align: left; cursor: pointer; }
.${ELEMENT_TAG}-memory-backdrop { position: absolute; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; padding: 1rem; background: #0009; }
.${ELEMENT_TAG}-memory-dialog { box-sizing: border-box; width: min(28rem, 100%); max-height: min(75cqh, 36rem); overflow-y: auto; padding: 1rem; border: 1px solid var(--border); border-radius: .8rem; background: var(--popover); color: var(--foreground); box-shadow: 0 1rem 2rem #0009; }
.${ELEMENT_TAG}-memory-dialog-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
.${ELEMENT_TAG}-memory-dialog-head h2 { margin: 0; font-size: 1rem; line-height: 1.4; }
.${ELEMENT_TAG}-memory-dialog-head button { border: 0; background: transparent; color: inherit; font: inherit; font-size: 1.5rem; cursor: pointer; }
.${ELEMENT_TAG}-memory-dialog p { margin: .75rem 0 0; white-space: pre-wrap; overflow-wrap: anywhere; line-height: 1.5; }
@container ${ELEMENT_TAG} (max-width: 44rem) { .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn { width: 100%; padding: .45rem; } .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn-asides { width: min(85%, 22rem); } .${ELEMENT_TAG}-room-mode-toggle { width: 2.5rem; height: 2.5rem; } }
@container ${ELEMENT_TAG} (min-width: 34rem) and (max-height: 30rem) { .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn { width: 64%; align-self: flex-end; } }
.${ELEMENT_TAG}-room-screen[data-mobile="true"] .${ELEMENT_TAG}-room-stars { top: 4.25rem; left: .625rem; width: min(15rem, calc(100% - 1.25rem)); max-height: 20cqh; gap: .25rem; }
.${ELEMENT_TAG}-room-screen[data-mobile="true"] .${ELEMENT_TAG}-room-star { gap: .35rem; padding: .35rem .45rem; font-size: .75rem; line-height: 1.3; }
.${ELEMENT_TAG}-room-screen[data-mobile="true"] .${ELEMENT_TAG}-room-star-dismiss { margin: -.3rem -.35rem -.3rem 0; }
.${ELEMENT_TAG}-room-screen[data-mobile="true"] .${ELEMENT_TAG}-chat-vn-asides { position: static; flex: 0 0 auto; align-self: flex-end; width: min(90%, 20rem); max-height: 9rem; margin-bottom: .125rem; z-index: 2; }
.${ELEMENT_TAG}-room-screen[data-mobile="true"] .${ELEMENT_TAG}-chat-vn-aside { max-width: 100%; padding: .4rem .55rem; gap: .375rem; }
.${ELEMENT_TAG}-room-screen[data-mobile="true"] .${ELEMENT_TAG}-chat-vn-aside-face { width: 1.5rem; height: 1.5rem; }
.${ELEMENT_TAG}-room-screen[data-mobile="true"] .${ELEMENT_TAG}-memory-backdrop { padding: .5rem; }
.${ELEMENT_TAG}-room-screen[data-mobile="true"] .${ELEMENT_TAG}-memory-dialog { width: min(20rem, 100%); max-height: 60cqh; padding: .75rem; }

/* Scenes use a single shallow reading dock so the stage owns the remaining height. */
.${ELEMENT_TAG}-room-screen > .${ELEMENT_TAG}-chat { gap: 0; padding: 0; overflow: hidden; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-scrim {
  background: linear-gradient(180deg, color-mix(in srgb, var(--background) 30%, transparent), transparent 25%, transparent 65%, color-mix(in srgb, var(--background) 30%, transparent));
}
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vignette { opacity: .45; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-head { top: .65rem; left: .75rem; right: .75rem; z-index: 6; align-items: center; }
.${ELEMENT_TAG}-room-place, .${ELEMENT_TAG}-room-actions-trigger, .${ELEMENT_TAG}-room-notices-trigger {
  border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border)); border-radius: .65rem;
  background: var(--marinara-chat-chrome-panel-bg, color-mix(in srgb, var(--popover) 82%, transparent));
  color: var(--foreground); backdrop-filter: blur(12px); box-shadow: 0 .25rem .75rem #0004;
}
.${ELEMENT_TAG}-room-place { display: block; max-width: min(18rem, 60%); padding: .35rem .65rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: .75rem; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-actions { position: relative; width: auto; margin-left: auto; }
.${ELEMENT_TAG}-room-actions-trigger { width: 2rem; height: 2rem; cursor: pointer; font-size: 1.25rem; line-height: 1; }
.${ELEMENT_TAG}-room-actions-menu { position: absolute; right: 0; top: calc(100% + .4rem); z-index: 15; display: grid; width: min(16rem, 80vw); padding: .25rem; border: 1px solid var(--border); border-radius: .7rem; background: var(--popover); box-shadow: 0 .6rem 1.5rem #0009; }
.${ELEMENT_TAG}-room-actions-menu button { border: 0; border-radius: .4rem; padding: .55rem .65rem; background: transparent; color: var(--foreground); text-align: left; font: inherit; font-size: .8125rem; cursor: pointer; }
.${ELEMENT_TAG}-room-actions-menu button:hover { background: color-mix(in srgb, var(--foreground) 9%, transparent); }
.${ELEMENT_TAG}-room-actions-menu button:disabled { opacity: .45; cursor: default; }
.${ELEMENT_TAG}-room-notices { position: absolute; top: 3.2rem; left: .75rem; z-index: 4; }
.${ELEMENT_TAG}-room-notices-trigger { min-width: 2.5rem; min-height: 2rem; padding: .25rem .55rem; color: #e5b13e; font-size: .75rem; cursor: pointer; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-room-stars, .${ELEMENT_TAG}-room-screen[data-mobile="true"] .${ELEMENT_TAG}-room-stars { position: absolute; top: calc(100% + .35rem); left: 0; width: min(20rem, calc(100vw - 1.5rem)); max-height: 35cqh; overflow-y: auto; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-stage { position: relative; top: auto; bottom: auto; left: auto; width: 100%; height: auto; min-height: 0; flex: 1 1 auto; padding: 3rem .75rem 0; box-sizing: border-box; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast { height: 100%; max-height: none; gap: clamp(.2rem, 1vw, 1rem); }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast-person,
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast-person[data-active="true"] { position: relative; flex: 1 1 0; max-width: 25%; height: 100%; min-width: 0; opacity: .78; transition: transform .18s ease, opacity .18s ease, filter .18s ease; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast-person[data-active="true"] { z-index: 2; opacity: 1; filter: brightness(1.08); transform: scale(1.035); transform-origin: center bottom; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast-person[data-sprite="false"] { justify-content: center; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast-person > img { width: 100%; height: 100%; max-width: none; object-fit: contain; object-position: center bottom; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast-person > .${ELEMENT_TAG}-avatar { width: min(8rem, 80%); }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast-person > span:not(.${ELEMENT_TAG}-avatar) { position: absolute; bottom: .3rem; max-width: 95%; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast[data-staging="true"] > .${ELEMENT_TAG}-chat-cast-person,
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast[data-staging="true"] > .${ELEMENT_TAG}-chat-cast-person[data-active="true"] { position: absolute; bottom: 0; left: var(--cast-left); width: var(--cast-width); flex: none; max-width: none; height: 100%; transition: left .22s ease, opacity .18s ease, filter .18s ease, transform .18s ease; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast[data-staging="true"][data-animate="false"] > .${ELEMENT_TAG}-chat-cast-person { transition: none; }
@media (prefers-reduced-motion: reduce) {
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast[data-staging="true"] > .${ELEMENT_TAG}-chat-cast-person { transition: none; }
}
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast-rest { position: absolute; right: .5rem; bottom: .25rem; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn { position: relative; z-index: 3; flex: 0 0 auto; align-self: center; width: min(72rem, calc(100% - 1.5rem)); margin: 0 auto .5rem; padding: .5rem .75rem; gap: .25rem; border-radius: .85rem; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat[data-opening-error="true"] .${ELEMENT_TAG}-chat-vn { display: flex; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn-card { border: 0; border-radius: 0; background: transparent; backdrop-filter: none; box-shadow: none; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn-row { padding: 0; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn-column { gap: .18rem; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn-reading { max-height: 5.8rem; min-height: 1.45rem; padding: 0 .25rem 0 0; overflow-y: auto; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn-text,
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn-beat { max-width: none; padding: 0; border: 0; border-radius: 0; background: transparent; color: var(--foreground); font-size: 1rem; line-height: 1.45; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn-name,
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn-label { align-self: flex-start; margin: 0; padding: 0; border-radius: 0; background: transparent; color: var(--marinara-chat-chrome-highlight-text, var(--primary)); font-size: .72rem; font-weight: 650; line-height: 1.35; letter-spacing: 0; text-transform: none; }
.${ELEMENT_TAG}-room-panel-tools { display: grid; grid-template-columns: minmax(4rem, 1fr) auto minmax(4rem, 1fr); gap: .4rem; min-height: 1.75rem; border-top: 1px solid var(--marinara-chat-chrome-panel-divider, var(--border)); padding-top: .25rem; }
.${ELEMENT_TAG}-room-panel-tools .${ELEMENT_TAG}-chat-history-toggle { justify-self: start; min-height: 1.75rem; padding: .15rem .35rem; border: 0; background: transparent; font-size: .75rem; }
.${ELEMENT_TAG}-room-panel-tools .${ELEMENT_TAG}-chat-vn-counter { justify-self: center; }
.${ELEMENT_TAG}-room-panel-tools .${ELEMENT_TAG}-chat-vn-nav { justify-self: end; gap: .25rem; padding: 0; border: 0; }
.${ELEMENT_TAG}-room-panel-tools .${ELEMENT_TAG}-chat-vn-button { min-height: 1.75rem; padding: .2rem .4rem; border: 0; color: var(--foreground); }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-log { position: absolute; z-index: 8; bottom: calc(100% + .45rem); left: 0; width: 100%; max-height: min(55cqh, 32rem); box-sizing: border-box; overflow-y: auto; padding: .75rem; border: 1px solid var(--border); border-radius: .75rem; background: var(--popover); box-shadow: 0 .75rem 2rem #0009; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn-asides { position: absolute; right: .5rem; bottom: calc(100% + .45rem); width: min(25vw, 22rem); max-height: min(20cqh, 10rem); overflow-y: auto; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn-asides[data-side="left"] { right: auto; left: .5rem; }
.${ELEMENT_TAG}-room-screen[data-mobile="true"] .${ELEMENT_TAG}-chat-vn-asides { position: absolute; right: .5rem; bottom: calc(100% + .45rem); width: min(25vw, 22rem); max-height: min(20cqh, 10rem); margin: 0; }
.${ELEMENT_TAG}-room-screen[data-mobile="true"] .${ELEMENT_TAG}-chat-vn-asides[data-side="left"] { right: auto; left: .5rem; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-composer { padding-top: .35rem; border-top: 1px solid var(--marinara-chat-chrome-panel-divider, var(--border)); }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-input > .${ELEMENT_TAG}-textarea { height: 1.75rem; min-height: 0; max-height: none; overflow-y: hidden; }
.${ELEMENT_TAG}-room-actions-trigger:focus-visible, .${ELEMENT_TAG}-room-actions-menu button:focus-visible, .${ELEMENT_TAG}-room-notices-trigger:focus-visible, .${ELEMENT_TAG}-room-panel-tools button:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
@container ${ELEMENT_TAG} (max-width: 44rem) {
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-stage { min-height: 0; padding-top: 3rem; }
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast-person, .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast-person[data-active="true"] { flex: 1 1 0; max-width: 25%; height: 100%; }
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast-person > img { height: 100%; }
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn { width: calc(100% - .75rem); margin-bottom: .35rem; padding: .45rem .55rem; }
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn-asides, .${ELEMENT_TAG}-room-screen[data-mobile="true"] .${ELEMENT_TAG}-chat-vn-asides { position: absolute; right: .25rem; bottom: calc(100% + .3rem); width: min(52vw, 13rem); max-height: 20cqh; margin: 0; }
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn-asides[data-side="left"], .${ELEMENT_TAG}-room-screen[data-mobile="true"] .${ELEMENT_TAG}-chat-vn-asides[data-side="left"] { right: auto; left: .25rem; }
}
@container ${ELEMENT_TAG} (max-height: 30rem) {
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-stage { min-height: 0; padding-top: 2.5rem; }
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn { width: min(72rem, calc(100% - .75rem)); align-self: center; }
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn-reading { max-height: 4.35rem; }
}
@container ${ELEMENT_TAG} (max-width: 44rem) and (min-height: 40rem) {
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn-asides, .${ELEMENT_TAG}-room-screen[data-mobile="true"] .${ELEMENT_TAG}-chat-vn-asides { bottom: calc(100% + 13rem); }
}
/* Mobile artwork grows independently of the staging slots. Shared zones may overlap,
   but the image boxes stay within the floor and the speaker paints above listeners. */
.${ELEMENT_TAG}-room-screen[data-mobile="true"] .${ELEMENT_TAG}-chat-stage .${ELEMENT_TAG}-chat-cast > .${ELEMENT_TAG}-chat-cast-person,
.${ELEMENT_TAG}-room-screen[data-mobile="true"] .${ELEMENT_TAG}-chat-stage .${ELEMENT_TAG}-chat-cast > .${ELEMENT_TAG}-chat-cast-person[data-active="true"] {
  --cast-display-width: var(--cast-width, 25%);
  position: absolute; bottom: 0; flex: none; max-width: none;
  width: var(--cast-display-width); height: 100%;
  left: clamp(0px, calc(var(--cast-center) - var(--cast-display-width) / 2), calc(100% - var(--cast-display-width)));
  transform: none;
}
.${ELEMENT_TAG}-room-screen[data-mobile="true"] .${ELEMENT_TAG}-chat-stage .${ELEMENT_TAG}-chat-cast > .${ELEMENT_TAG}-chat-cast-person[data-sprite="true"] {
  --cast-display-width: min(70cqw, 66.666667cqh);
}
.${ELEMENT_TAG}-room-screen[data-mobile="true"] .${ELEMENT_TAG}-chat-cast-person > img { flex: 0 0 auto; }
.${ELEMENT_TAG}-room-screen[data-mobile="true"] .${ELEMENT_TAG}-chat-cast-person > img[data-framing="half"] { object-fit: cover; object-position: center top; }
@media (prefers-reduced-motion: reduce) { .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast-person { transition: none; } }

/* The Menu shares View Venue's palette and keeps its navigation on screen. */
.${ELEMENT_TAG}-root.${ELEMENT_TAG}-sectioned-menu {
  --background: #0b1938;
  --foreground: #f3f4ff;
  --popover: #142753;
  --muted: #1d3567;
  --muted-foreground: #c0c9ee;
  --border: #38569a;
  --primary: #ac90ff;
  --primary-foreground: #fff;
  --destructive: #ffb7c1;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: clamp(13rem, 20cqw, 17rem) minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr);
  gap: 0;
  overflow: hidden;
  padding: 0;
  background: radial-gradient(circle at 82% 20%, #1b346d 0, transparent 50%), linear-gradient(120deg, #09132f, #0e1e43);
  color: var(--foreground);
}
.${ELEMENT_TAG}-sectioned-menu > .${ELEMENT_TAG}-header {
  grid-column: 1 / -1; grid-row: 1; align-items: center; min-height: 4.5rem; padding: .8rem 1.25rem;
  border-bottom: 1px solid #314782; background: #101f48e8;
}
.${ELEMENT_TAG}-sectioned-menu .${ELEMENT_TAG}-title { font-size: clamp(1.3rem, 2.4cqw, 2rem); font-weight: 700; }
.${ELEMENT_TAG}-sectioned-menu .${ELEMENT_TAG}-subtitle { color: var(--muted-foreground); font-size: .82rem; }
.${ELEMENT_TAG}-sectioned-menu > .${ELEMENT_TAG}-header > .${ELEMENT_TAG}-error { flex-basis: 100%; margin: 0; }
.${ELEMENT_TAG}-sectioned-menu .${ELEMENT_TAG}-menu-nav {
  grid-column: 1; grid-row: 2; display: flex; flex-direction: column; gap: 1rem; min-height: 0; overflow-y: auto;
  padding: 1rem .7rem; border-right: 1px solid #314782;
  background: radial-gradient(circle at 25% 85%, #274588, transparent 65%), linear-gradient(#10214a, #142a5b);
}
.${ELEMENT_TAG}-sectioned-menu .${ELEMENT_TAG}-menu-group { gap: .45rem; }
.${ELEMENT_TAG}-sectioned-menu .${ELEMENT_TAG}-menu-group > .${ELEMENT_TAG}-panel-title {
  padding: .1rem .5rem; color: #b9c5ff; font-size: .7rem;
}
.${ELEMENT_TAG}-sectioned-menu .${ELEMENT_TAG}-menu-group-buttons { flex-direction: column; align-items: stretch; gap: .25rem; }
.${ELEMENT_TAG}-sectioned-menu .${ELEMENT_TAG}-menu-nav .${ELEMENT_TAG}-button {
  min-height: 2.45rem; border-color: transparent; background: transparent;
  color: var(--foreground); text-align: left; font-size: .85rem;
}
.${ELEMENT_TAG}-sectioned-menu .${ELEMENT_TAG}-menu-nav .${ELEMENT_TAG}-button:hover { border-color: #6a7fc4; background: #253b75; color: white; }
.${ELEMENT_TAG}-sectioned-menu .${ELEMENT_TAG}-menu-nav .${ELEMENT_TAG}-button[data-active="true"] {
  border-color: #8060ff; background: linear-gradient(105deg, #5139b4, #253c8d);
  color: white; box-shadow: 0 0 0 1px #8756ff, 0 0 1rem #683cf955;
}
.${ELEMENT_TAG}-menu-content {
  grid-column: 2; grid-row: 2; box-sizing: border-box; min-width: 0; min-height: 0; overflow-x: hidden; overflow-y: auto;
  padding: clamp(.75rem, 2cqw, 1.5rem);
}
.${ELEMENT_TAG}-menu-content.${ELEMENT_TAG}-panel,
.${ELEMENT_TAG}-menu-content > .${ELEMENT_TAG}-panel,
.${ELEMENT_TAG}-menu-content .${ELEMENT_TAG}-overlay {
  border: 1px solid var(--border); border-radius: .85rem;
  background: linear-gradient(145deg, #172c5e, #101f45); color: var(--foreground);
}
.${ELEMENT_TAG}-menu-content .${ELEMENT_TAG}-panel-title { color: #c7d2ff; font-size: .74rem; }
.${ELEMENT_TAG}-menu-content .${ELEMENT_TAG}-button { min-height: 2.35rem; background: #172d60; color: var(--foreground); font-size: .85rem; }
.${ELEMENT_TAG}-menu-content .${ELEMENT_TAG}-button:hover { border-color: #aa92ff; background: #203774; color: white; }
.${ELEMENT_TAG}-menu-content .${ELEMENT_TAG}-hint,
.${ELEMENT_TAG}-menu-content .${ELEMENT_TAG}-empty,
.${ELEMENT_TAG}-menu-content .${ELEMENT_TAG}-status { font-size: .82rem; line-height: 1.5; }
.${ELEMENT_TAG}-sectioned-menu .${ELEMENT_TAG}-button:focus-visible,
.${ELEMENT_TAG}-sectioned-menu input:focus-visible,
.${ELEMENT_TAG}-sectioned-menu select:focus-visible,
.${ELEMENT_TAG}-sectioned-menu textarea:focus-visible { outline: 3px solid #b6a2ff; outline-offset: 2px; }
.${ELEMENT_TAG}-menu-content input:not([type="checkbox"]):not([type="radio"]),
.${ELEMENT_TAG}-menu-content select, .${ELEMENT_TAG}-menu-content textarea {
  border-color: #5570b0; background: #0c1c42; color: var(--foreground); font-size: .85rem;
}
.${ELEMENT_TAG}-menu-content input::placeholder, .${ELEMENT_TAG}-menu-content textarea::placeholder { color: #aebce3; }
.${ELEMENT_TAG}-menu-content .${ELEMENT_TAG}-notice-row { border-color: #526bb1; background: #1c3568; color: var(--foreground); }
.${ELEMENT_TAG}-menu-content .${ELEMENT_TAG}-notice-author { color: #d9e1ff; }
.${ELEMENT_TAG}-menu-content .${ELEMENT_TAG}-menu-body { gap: 1rem; }
.${ELEMENT_TAG}-sectioned-menu > .${ELEMENT_TAG}-panel.${ELEMENT_TAG}-menu-content { margin: clamp(.75rem, 2cqw, 1.5rem); }
.${ELEMENT_TAG}-menu-welcome { display: grid; align-self: start; gap: .9rem; max-width: 50rem; padding: 1.5rem; }
.${ELEMENT_TAG}-menu-welcome h2 { margin: 0; font-size: clamp(1.4rem, 3cqw, 2.2rem); }
.${ELEMENT_TAG}-menu-welcome p { max-width: 40rem; margin: 0; color: var(--muted-foreground); line-height: 1.6; }
.${ELEMENT_TAG}-menu-quick-links { display: flex; flex-wrap: wrap; gap: .6rem; margin-top: .4rem; }
.${ELEMENT_TAG}-menu-debug-action { display: flex; flex-wrap: wrap; align-items: center; gap: .6rem; margin-bottom: 1rem; }
.${ELEMENT_TAG}-menu-debug-action .${ELEMENT_TAG}-status { margin: 0; flex: 1 1 15rem; }
@container (max-width: 48rem) {
  .${ELEMENT_TAG}-root.${ELEMENT_TAG}-sectioned-menu { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto auto minmax(0, 1fr); }
  .${ELEMENT_TAG}-sectioned-menu .${ELEMENT_TAG}-menu-nav {
    grid-column: 1; grid-row: 2; flex-direction: row; gap: 1.25rem; max-height: 7.5rem;
    overflow-x: auto; overflow-y: hidden; padding: .6rem .75rem;
    border-right: 0; border-bottom: 1px solid #314782;
  }
  .${ELEMENT_TAG}-sectioned-menu .${ELEMENT_TAG}-menu-group { flex: 0 0 auto; }
  .${ELEMENT_TAG}-sectioned-menu .${ELEMENT_TAG}-menu-group-buttons { flex-direction: row; flex-wrap: nowrap; }
  .${ELEMENT_TAG}-sectioned-menu .${ELEMENT_TAG}-menu-nav .${ELEMENT_TAG}-button { flex: 0 0 auto; min-height: 2.5rem; white-space: nowrap; }
  .${ELEMENT_TAG}-menu-content { grid-column: 1; grid-row: 3; padding: .75rem; }
  .${ELEMENT_TAG}-sectioned-menu > .${ELEMENT_TAG}-header { padding: .75rem; }
}

/* Approved founding flow: a shared footer and compact, direct venue editing. */
.${ELEMENT_TAG}-setup-root { display: flex; flex-direction: column; gap: .65rem; padding: .75rem; height: 100%; overflow: hidden; }
.${ELEMENT_TAG}-setup-heading h1 { margin: 0; font-size: 1.5rem; }
.${ELEMENT_TAG}-setup-root > .${ELEMENT_TAG}-setup-body { display: grid; grid-template-columns: 10rem minmax(0, 1fr); flex: 1 1 auto; min-height: 0; overflow-y: auto; }
.${ELEMENT_TAG}-setup-workspace { display: flex; flex-direction: column; gap: .65rem; min-width: 0; padding: .15rem .25rem .5rem; }
.${ELEMENT_TAG}-setup-workspace > h2 { margin: 0; }
.${ELEMENT_TAG}-setup-workspace .${ELEMENT_TAG}-search, .${ELEMENT_TAG}-setup-workspace .${ELEMENT_TAG}-select { min-height: 44px; font-size: .875rem; }
.${ELEMENT_TAG}-setup-workspace .${ELEMENT_TAG}-label { font-size: .85rem; }
.${ELEMENT_TAG}-setup-workspace .${ELEMENT_TAG}-hint { font-size: .8rem; line-height: 1.4; }
.${ELEMENT_TAG}-setup-root > .${ELEMENT_TAG}-setup-footer { flex: none; background: #192c4c; padding: .5rem; border-radius: .6rem; }
.${ELEMENT_TAG}-setup-world-map { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .75rem; align-items: start; }
.${ELEMENT_TAG}-setup-spaces { display: grid; grid-template-columns: minmax(0, 1fr) minmax(18rem, 24rem); gap: .75rem; align-items: start; }
.${ELEMENT_TAG}-setup-placement, .${ELEMENT_TAG}-setup-editor-column { min-width: 0; }
.${ELEMENT_TAG}-setup-persona-summary { display: flex; gap: .65rem; align-items: center; border: 1px solid #5265ac; border-radius: .65rem; padding: .5rem; }
.${ELEMENT_TAG}-setup-persona-summary button { margin-left: auto; }
.${ELEMENT_TAG}-founding-roster { display: flex; flex-direction: column; gap: .4rem; min-width: 0; }
.${ELEMENT_TAG}-founding-roster .${ELEMENT_TAG}-identity-picker-head { justify-content: space-between; }
.${ELEMENT_TAG}-founding-roster h3, .${ELEMENT_TAG}-founding-roster p { margin: 0; }
.${ELEMENT_TAG}-founding-roster-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-auto-rows: 4.4rem; gap: .45rem; height: 14.3rem; padding: .15rem; overflow-y: scroll; scrollbar-width: thin; scrollbar-gutter: stable; border: 1px solid #51688c; border-radius: .6rem; }
.${ELEMENT_TAG}-founding-roster-card { display: flex; gap: .5rem; align-items: center; min-width: 0; padding: .4rem; background: #192c4c; border: 1px solid #51688c; border-radius: .5rem; color: #f3f5ff; font: inherit; text-align: left; cursor: pointer; }
.${ELEMENT_TAG}-founding-roster-card > span:nth-child(2) { display: flex; flex-direction: column; gap: .15rem; min-width: 0; flex: 1; }
.${ELEMENT_TAG}-founding-roster-card strong, .${ELEMENT_TAG}-founding-roster-card small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.${ELEMENT_TAG}-founding-roster-card small { font-size: .7rem; color: #b3bee8; }
.${ELEMENT_TAG}-founding-roster-card[aria-pressed="true"] { border-color: #b49aff; box-shadow: inset 0 0 0 1px #b49aff; background: #303561; }
.${ELEMENT_TAG}-founding-roster-card:disabled { opacity: .65; cursor: default; }
.${ELEMENT_TAG}-roster-check { flex: none; width: 1rem; height: 1rem; border: 1px solid #7082cf; border-radius: .2rem; text-align: center; }
.${ELEMENT_TAG}-founding-roster-card[aria-pressed="true"] .${ELEMENT_TAG}-roster-check { background: #7461d5; }
.${ELEMENT_TAG}-setup-spaces .${ELEMENT_TAG}-setup-venue-card { grid-template-columns: 2rem minmax(0, 1fr); min-height: 2.8rem; padding: .3rem .5rem; }
.${ELEMENT_TAG}-setup-spaces .${ELEMENT_TAG}-setup-venue-card img, .${ELEMENT_TAG}-setup-spaces .${ELEMENT_TAG}-setup-venue-placeholder { width: 2rem; height: 2rem; }
.villages-founding-backdrop { position: static; display: block; background: transparent; }
.villages-founding-dialog { width: 100%; max-height: min(42rem, max(14rem, calc(100cqh - 12rem))); box-sizing: border-box; }
.villages-founding-dialog header, .villages-founding-dialog footer, .villages-founding-editor-body { padding: .65rem; }
.villages-founding-dialog header h3, .villages-founding-dialog header p { margin: .2rem 0; }
.villages-founding-dialog textarea { min-height: 4rem; }
.villages-founding-tabs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .3rem; padding: .5rem .65rem; }
.villages-founding-tabs button[aria-selected="true"], .villages-layout-choice[aria-pressed="true"], .villages-layout-exterior { background: #7461d5; color: #fff; border: 1px solid #b49aff; }
.villages-layout-exterior { display: block; border-radius: .5rem; padding: .5rem; }
.villages-layout-toggles { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .35rem; }
.villages-layout-choice { font: inherit; border: 1px solid #65799c; border-radius: .5rem; padding: .5rem; color: #f3f5ff; background: #192c4c; min-height: 44px; cursor: pointer; }
.villages-layout-fields p { font-size: .75rem; }
.${ELEMENT_TAG}-stage[data-compact-photos="true"][data-photo-pins="true"] .${ELEMENT_TAG}-pin-photo-card { width: 5.5rem; }
.${ELEMENT_TAG}-stage[data-compact-photos="true"] .${ELEMENT_TAG}-pin-photo img { object-fit: contain; }
.${ELEMENT_TAG}-stage[data-compact-photos="true"] .${ELEMENT_TAG}-pin-photo { overflow: hidden; }
.${ELEMENT_TAG}-stage[data-compact-photos="true"] .${ELEMENT_TAG}-pin-holder:has(.${ELEMENT_TAG}-pin:hover), .${ELEMENT_TAG}-stage[data-compact-photos="true"] .${ELEMENT_TAG}-pin-holder:focus-within { z-index: 7; }
@media (hover: hover) { .${ELEMENT_TAG}-stage[data-compact-photos="true"] .${ELEMENT_TAG}-pin:hover .${ELEMENT_TAG}-pin-photo-card { transform: scale(1) !important; } }
.${ELEMENT_TAG}-stage[data-compact-photos="true"] .${ELEMENT_TAG}-pin:focus-visible .${ELEMENT_TAG}-pin-photo-card { transform: scale(1) !important; }
@container (max-width: 70rem) {
  .${ELEMENT_TAG}-setup-root > .${ELEMENT_TAG}-setup-body { grid-template-columns: minmax(0, 1fr); grid-template-rows: max-content max-content; align-content: start; }
  .${ELEMENT_TAG}-setup-world-map { grid-template-columns: minmax(0, 1fr); }
  .${ELEMENT_TAG}-setup-spaces { grid-template-columns: minmax(0, 1fr) minmax(17rem, 21rem); }
}
@container (max-width: 42rem) {
  .${ELEMENT_TAG}-setup-root { padding: .4rem; }
  .${ELEMENT_TAG}-setup-spaces { grid-template-columns: minmax(0, 1fr); }
  .${ELEMENT_TAG}-setup-persona-summary { flex-wrap: wrap; }
  .${ELEMENT_TAG}-founding-roster-card { gap: .25rem; font-size: .75rem; }
  .${ELEMENT_TAG}-founding-roster-card .${ELEMENT_TAG}-identity-card-face { width: 1.8rem; height: 1.8rem; }
}
@media (max-width: 704px) {
  .villages-founding-backdrop { position: fixed; inset: 0; z-index: 1000; background: #070b1bd9; }
  .villages-founding-dialog { width: 100%; height: 100%; max-height: 100dvh; border-radius: 0; }
}

.${ELEMENT_TAG}-founding-role-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .75rem; }
.${ELEMENT_TAG}-founding-role-fields label { display: flex; flex-direction: column; gap: .3rem; min-width: 0; }
.villages-founding-editor-heading { display: flex; align-items: center; justify-content: space-between; gap: .5rem; }
.villages-founding-editor-heading button { flex: none; }
@container (max-width: 42rem) {
  .${ELEMENT_TAG}-founding-role-fields { grid-template-columns: minmax(0, 1fr); }
  .${ELEMENT_TAG}-founding-role-fields textarea { min-height: 8rem; }
}
${VILLAGES_FORGING_STYLES}
`;

export function syncVillagesStyles() {
  const existing = document.getElementById(STYLE_ID);
  if (!document.querySelector(ELEMENT_TAG)) {
    existing?.remove();
    return;
  }
  if (existing) {
    if (
      existing.textContent !==
      VILLAGES_STYLES + VILLAGES_SCENE_STYLES + SCENE_ASIDE_STYLES + EXPLORATION_STYLES + DOSSIER_STYLES
    )
      existing.textContent =
        VILLAGES_STYLES + VILLAGES_SCENE_STYLES + SCENE_ASIDE_STYLES + EXPLORATION_STYLES + DOSSIER_STYLES;
    return;
  }
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent =
    VILLAGES_STYLES + VILLAGES_SCENE_STYLES + SCENE_ASIDE_STYLES + EXPLORATION_STYLES + DOSSIER_STYLES;
  document.head.appendChild(style);
}

// The Engine can replace head styles while keeping a capability tab mounted.
// Restore this package's stylesheet without requiring the player to reopen the tab.
const villagesStyleObserver = new MutationObserver(() => {
  if (document.querySelector(ELEMENT_TAG)) syncVillagesStyles();
});

villagesStyleObserver.observe(document.head, { childList: true, subtree: true });
