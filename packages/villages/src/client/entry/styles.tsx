import { EXPLORATION_STYLES } from "../features/exploration/villages-exploration-styles.js";
import { VILLAGES_FORGING_STYLES } from "../features/founding/villages-forging-styles.js";
import { DOSSIER_STYLES } from "../features/residents/villages-dossier-styles.js";
import { SCENE_ASIDE_STYLES } from "../features/scenes/villages-scene-asides.js";
import { VILLAGES_SCENE_STYLES } from "../features/scenes/villages-scene-styles.js";
import { ELEMENT_TAG, STYLE_ID } from "../shared/constants.js";

// Named container queries measure the Engine tab; font sizes stay fixed.
// Avatar frames clip both current and legacy crops and must stay square.
// Map chrome passes pointer input through gaps; controls opt back in.
// Hidden composers stay mounted to preserve drafts; pins follow the fitted image.
// Short-container rules accommodate keyboards and constrained windows.
// shortcut: size containment needs a definite host height; revisit if Engine mounts into an auto-height box.
const VILLAGES_STYLES = `

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

.${ELEMENT_TAG}-avatar > img { display: block; width: 100%; height: 100%; object-fit: cover; }

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

.${ELEMENT_TAG}-chat > .${ELEMENT_TAG}-chat-stage,
.${ELEMENT_TAG}-chat > .${ELEMENT_TAG}-chat-activities,
.${ELEMENT_TAG}-chat > .${ELEMENT_TAG}-chat-vn,
.${ELEMENT_TAG}-chat > .${ELEMENT_TAG}-chat-confirm,
.${ELEMENT_TAG}-chat > .${ELEMENT_TAG}-error,
.${ELEMENT_TAG}-chat > .${ELEMENT_TAG}-room-error,
.${ELEMENT_TAG}-chat > .${ELEMENT_TAG}-composer,
.${ELEMENT_TAG}-chat > .${ELEMENT_TAG}-chat-ended { position: relative; z-index: 1; }

.${ELEMENT_TAG}-chat-head {
  position: absolute; top: .875rem; left: .875rem; right: .875rem; z-index: 3;
  display: flex; flex-wrap: wrap; align-items: flex-start; gap: .375rem;
  pointer-events: none;
}
.${ELEMENT_TAG}-chat-head > * { pointer-events: auto; }

.${ELEMENT_TAG}-chat-actions { display: flex; flex-wrap: wrap; align-items: center; gap: .375rem; margin-left: auto; }
.${ELEMENT_TAG}-chat-menu-anchor { position: relative; display: inline-flex; }

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

.${ELEMENT_TAG}-chat-menu .${ELEMENT_TAG}-button { width: 100%; justify-content: flex-start; text-align: left; }

.${ELEMENT_TAG}-chat-debug {
  display: flex; flex-direction: column; gap: .375rem;
  margin-top: .125rem; padding-top: .5625rem; border-top: 1px solid var(--border);
}

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

.${ELEMENT_TAG}-chat-confirm {
  display: flex; flex-direction: column; gap: .375rem;
  border: 1px solid color-mix(in srgb, var(--destructive, #e5484d) 45%, transparent);
  border-radius: .5rem; padding: .5rem .625rem;
  background: color-mix(in srgb, var(--destructive, #e5484d) 10%, transparent);
}
.${ELEMENT_TAG}-chat-confirm-note { margin: 0; font-size: .6875rem; line-height: 1.5; color: var(--foreground); }
.${ELEMENT_TAG}-chat-confirm-row { display: flex; flex-wrap: wrap; gap: .375rem; }
.${ELEMENT_TAG}-image-recommendation { color: #d68a18; }

.${ELEMENT_TAG}-chat[data-ended="true"] .${ELEMENT_TAG}-composer { display: none; }

.${ELEMENT_TAG}-chat[data-greeting="writing"] .${ELEMENT_TAG}-composer { display: none; }
.${ELEMENT_TAG}-chat[data-greeting="failed"] .${ELEMENT_TAG}-composer { display: none; }
.${ELEMENT_TAG}-chat-ended {
  margin: 0; padding: .5rem .625rem; border: 1px dashed var(--border); border-radius: .5rem;
  font-size: .6875rem; line-height: 1.5; color: var(--muted-foreground); text-align: center;
}

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

.${ELEMENT_TAG}-chat-vn {
  flex: 0 1 auto; min-height: 0;
  display: flex; flex-direction: column; justify-content: flex-end; gap: .375rem;
}

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

.${ELEMENT_TAG}-chat-scene-place {
  position: relative; z-index: 1; max-width: 100%;
  border-radius: 999px; padding: .1875rem .5rem;
  background: color-mix(in srgb, var(--popover) 88%, transparent);
  font-size: .6875rem; color: var(--foreground); text-align: center;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.${ELEMENT_TAG}-chat-log {
  display: flex; flex-direction: column; gap: .5rem;
  flex: 0 1 auto; min-height: 6rem; max-height: min(52cqh, 28rem); overflow-y: auto;
  border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  border-radius: .625rem; padding: .5rem;
  background: var(--marinara-chat-chrome-panel-bg, color-mix(in srgb, var(--popover) 92%, transparent));
  backdrop-filter: blur(12px);
  box-shadow: 0 .5rem 1.5rem rgba(0, 0, 0, .28);
}

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

.${ELEMENT_TAG}-chat-vn-card {
  display: flex; flex-direction: column;
  flex: 0 1 auto; min-height: 0; overflow: hidden;
  border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  border-radius: .75rem;
  background: var(--marinara-chat-chrome-panel-bg, color-mix(in srgb, var(--popover) 94%, transparent));
  backdrop-filter: blur(12px);
  box-shadow: 0 .75rem 2rem rgba(0, 0, 0, .4);
}

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

.${ELEMENT_TAG}-chat-vn-text[data-error="true"] { color: var(--destructive, #e5484d); }

.${ELEMENT_TAG}-chat-vn-label {
  margin: 0; align-self: flex-start;
  padding: .125rem .5rem; border-radius: 999px;
  background: color-mix(in srgb, var(--foreground) 12%, transparent);
  font-size: .625rem; font-weight: 600; line-height: 1.5;
  letter-spacing: .04em; text-transform: uppercase;
  color: var(--muted-foreground);
}

.${ELEMENT_TAG}-chat-vn-asides {
  display: flex; flex-direction: column; align-items: flex-end; gap: .375rem;
  flex: 0 1 auto; min-height: 0; max-height: min(12rem, 30cqh);
  overflow-y: auto; overflow-x: hidden; overscroll-behavior: contain;
  padding-right: .25rem;
}

.${ELEMENT_TAG}-chat-vn-aside {
  flex: 0 0 auto;
  display: flex; align-items: flex-start; gap: .5rem;
  max-width: 75%;
  padding: .5rem .75rem; border-radius: .75rem;
  border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  background: var(--marinara-chat-chrome-panel-bg, color-mix(in srgb, var(--popover) 92%, transparent));
  box-shadow: 0 1rem 2.375rem rgba(0, 0, 0, .45);
}

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

.${ELEMENT_TAG}-chat-pending { display: flex; justify-content: flex-start; margin: 0; }
.${ELEMENT_TAG}-chat-spinner {
  flex: 0 0 auto;
  width: .75rem; height: .75rem; border-radius: 999px;
  border: 2px solid color-mix(in srgb, var(--muted-foreground) 30%, transparent);
  border-top-color: var(--muted-foreground);
}

.${ELEMENT_TAG}-visually-hidden {
  position: absolute; width: 1px; height: 1px;
  margin: -1px; padding: 0; border: 0;
  overflow: hidden; clip-path: inset(50%); white-space: nowrap;
}

.${ELEMENT_TAG}-msg { max-width: 88%; border-radius: .625rem; padding: .4375rem .625rem; font-size: .75rem; line-height: 1.5; white-space: pre-wrap; overflow-wrap: break-word; }

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

.${ELEMENT_TAG}-ruling {
  align-self: stretch; margin: .125rem 0 0; padding: .25rem 0 .25rem .5rem;
  border-left: 2px solid var(--muted-foreground);
  font-size: .6875rem; line-height: 1.5; color: var(--muted-foreground);
}
.${ELEMENT_TAG}-ruling[data-fulfilled="true"] { border-left-color: var(--primary); color: var(--primary); }
.${ELEMENT_TAG}-ruling[data-fulfilled="false"] { border-left-color: var(--destructive, #e5484d); color: var(--destructive, #e5484d); }

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

.${ELEMENT_TAG}-chat-modes-foot {
  display: flex; flex-direction: column;
  border-top: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  padding: .25rem;
}
.${ELEMENT_TAG}-chat-modes-foot > .${ELEMENT_TAG}-button { width: 100%; justify-content: flex-start; text-align: left; }

.${ELEMENT_TAG}-claim { display: flex; flex-direction: column; gap: .375rem; }
.${ELEMENT_TAG}-composer { display: flex; flex-direction: column; gap: .375rem; }
.${ELEMENT_TAG}-textarea {
  width: 100%; box-sizing: border-box; resize: vertical; min-height: 3.25rem; max-height: 9rem;
  border: 1px solid var(--border); border-radius: .5rem;
  background: var(--background); color: var(--foreground);
  padding: .4375rem .5rem; font-size: .75rem; font-family: inherit; line-height: 1.5;
}

.${ELEMENT_TAG}-composer-row { display: flex; flex-wrap: wrap; }

.${ELEMENT_TAG}-composer-row > .${ELEMENT_TAG}-claim,
.${ELEMENT_TAG}-composer-row > .${ELEMENT_TAG}-chat-input { flex: 1 1 auto; min-width: 0; }

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

.${ELEMENT_TAG}-chat-input > .${ELEMENT_TAG}-chat-menu-anchor { position: static; flex: 0 0 auto; }

.${ELEMENT_TAG}-chat-input > .${ELEMENT_TAG}-textarea {
  flex: 1 1 auto; min-width: 0;
  border: 0; border-radius: 0; box-shadow: none; resize: none;
  background: transparent; color: inherit;
  min-height: 2.75rem; max-height: 9rem;
  padding: .3125rem 0;
}

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

.${ELEMENT_TAG}-hint[data-tone="warn"] { color: var(--destructive, #e5484d); }
.${ELEMENT_TAG}-field { display: flex; flex-direction: column; gap: .25rem; margin-top: .625rem; }
.${ELEMENT_TAG}-label { font-size: .6875rem; font-weight: 600; color: var(--muted-foreground); }

.${ELEMENT_TAG}-switch { display: flex; align-items: flex-start; gap: .4375rem; font-size: .75rem; line-height: 1.5; cursor: pointer; }
.${ELEMENT_TAG}-switch[data-disabled="true"] { cursor: default; opacity: .5; }
.${ELEMENT_TAG}-switch input { flex: none; margin: .1875rem 0 0; accent-color: var(--primary); }
.${ELEMENT_TAG}-switch-hours { font-size: .625rem; color: var(--muted-foreground); font-variant-numeric: tabular-nums; }

.${ELEMENT_TAG}-switches { display: grid; gap: .25rem; margin-top: .125rem; padding-left: 1.3125rem; }

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

.${ELEMENT_TAG}-off { opacity: .5; }

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
.${ELEMENT_TAG}-notice-input {
  flex: 1 1 auto; min-width: 0; box-sizing: border-box;
  border: 1px solid var(--border); border-radius: .5rem;
  background: var(--background); color: var(--foreground);
  padding: .375rem .5rem; font-size: .75rem; font-family: inherit;
}

.${ELEMENT_TAG}-places { margin: .5rem 0 0; padding: 0; list-style: none; display: grid; gap: .625rem; }
.${ELEMENT_TAG}-place { display: grid; grid-template-columns: 4.5rem minmax(0, 1fr); gap: .625rem; align-items: start; }
.${ELEMENT_TAG}-place-thumb {
  width: 4.5rem; height: 3rem; display: block; object-fit: cover;
  border: 1px solid var(--border); border-radius: .375rem;
  background: var(--muted, rgba(127, 127, 127, .08));
}

.${ELEMENT_TAG}-place-thumb[data-empty="true"] { border-style: dashed; }
.${ELEMENT_TAG}-place-body { display: flex; flex-direction: column; gap: .25rem; min-width: 0; }
.${ELEMENT_TAG}-place-name { font-size: .75rem; font-weight: 600; color: var(--foreground); overflow-wrap: break-word; }

.${ELEMENT_TAG}-place-body .${ELEMENT_TAG}-row { margin-top: 0; }
.${ELEMENT_TAG}-place-body .${ELEMENT_TAG}-file { font-size: .625rem; }

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

.${ELEMENT_TAG}-venue-body .${ELEMENT_TAG}-row { margin-top: 0; }

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
.${ELEMENT_TAG}-memory-correction { display: grid; gap: .6rem; min-width: 0; }
.${ELEMENT_TAG}-memory-correction > label { display: grid; gap: .35rem; }
.${ELEMENT_TAG}-memory-correction textarea { box-sizing: border-box; width: 100%; min-width: 0; resize: vertical; font: inherit; padding: .5rem; color: inherit; background: var(--background); border: 1px solid var(--border); border-radius: .4rem; }
.${ELEMENT_TAG}-memory-correction fieldset { display: flex; flex-wrap: wrap; gap: .5rem 1rem; min-width: 0; border: 0; padding: 0; margin: 0; }
.${ELEMENT_TAG}-memory-correction fieldset label { display: flex; align-items: center; gap: .35rem; }
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

.${ELEMENT_TAG}-agenda-notes { margin: 0 0 .625rem; }
.${ELEMENT_TAG}-agenda-notes > summary {
  display: inline-flex; align-items: center; gap: .3125rem;
  list-style: none; cursor: pointer;
}
.${ELEMENT_TAG}-agenda-notes > summary::-webkit-details-marker { display: none; }
.${ELEMENT_TAG}-agenda-notes > summary::marker { content: ""; }
.${ELEMENT_TAG}-agenda-notes[open] > summary { border-color: var(--primary); color: var(--primary); }
.${ELEMENT_TAG}-agenda-notes-body { display: flex; flex-direction: column; gap: .5rem; margin: .4375rem 0 0; }

.${ELEMENT_TAG}-story-blank { color: var(--muted-foreground); font-style: italic; opacity: .75; }
.${ELEMENT_TAG}-row { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; margin-top: .75rem; }

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

.${ELEMENT_TAG}-home-full {
  position: relative;
  box-sizing: border-box;
  display: flex; flex-direction: column; align-items: stretch;
  gap: .5rem;
  height: 100%; min-height: 0;
  padding: .5rem; overflow: hidden;
}

.${ELEMENT_TAG}-room {
  position: relative;
  flex: 1 1 auto; min-width: 0; min-height: 0;
  display: flex; align-items: center; justify-content: center;
  padding: 0;
}

.${ELEMENT_TAG}-home-full .${ELEMENT_TAG}-stage {
  flex: 0 0 auto;
  border: 0; border-radius: 0;
  overflow: visible;
  isolation: isolate;
}

.${ELEMENT_TAG}-home-full .${ELEMENT_TAG}-stage:not([data-shaped="true"]) { width: 100%; }
.${ELEMENT_TAG}-home-full .${ELEMENT_TAG}-canvas {
  overflow: hidden;
  z-index: 1;
}

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
.${ELEMENT_TAG}-mapbar {
  display: flex; flex-wrap: wrap; align-items: center; gap: .375rem;
  border: 1px solid var(--border); border-radius: .75rem;
  background: var(--popover); padding: .5rem .625rem;
}
.${ELEMENT_TAG}-mapbar-title { font-size: .8125rem; font-weight: 600; }

.${ELEMENT_TAG}-stage {
  position: relative;
  flex: 1 1 26rem; min-width: 0;
  border: 1px solid var(--border); border-radius: .75rem;
  overflow: hidden;
  background: color-mix(in srgb, var(--muted-foreground) 12%, var(--background));
}

.${ELEMENT_TAG}-stage:not([data-shaped="true"]) { min-height: 14rem; }

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

.${ELEMENT_TAG}-pin[data-tone="venue"] { border-color: var(--border); }

.${ELEMENT_TAG}-pin[data-kind="person"] {
  border-style: dotted; border-color: var(--muted-foreground); color: var(--muted-foreground);
}

.${ELEMENT_TAG}-pin-remove {
  border: 1px solid var(--border); border-radius: 999px;
  background: color-mix(in srgb, var(--background) 88%, transparent); color: var(--muted-foreground);
  font-size: .625rem; line-height: 1; padding: .125rem .25rem; cursor: pointer;
}
.${ELEMENT_TAG}-pin-remove:hover { border-color: var(--destructive, #e5484d); color: var(--destructive, #e5484d); }

.${ELEMENT_TAG}-pin-resume {
  position: absolute; top: calc(100% + .1875rem); left: 50%; transform: translateX(-50%);
  white-space: nowrap; cursor: pointer; font: inherit; font-size: .625rem; line-height: 1.4;
  border: 1px solid var(--destructive, #e5484d); border-radius: 999px;
  background: color-mix(in srgb, var(--background) 92%, transparent);
  color: var(--destructive, #e5484d); padding: .125rem .375rem;
}

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

.${ELEMENT_TAG}-overlay {
  display: flex; flex-direction: column; gap: .625rem;
  border: 1px solid var(--border); border-radius: .75rem;
  background: var(--popover); padding: .875rem 1rem;
}
.${ELEMENT_TAG}-overlay-head { display: flex; align-items: center; gap: .5rem; }
.${ELEMENT_TAG}-overlay-head > .${ELEMENT_TAG}-panel-title { flex: 1 1 auto; margin: 0; }

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
.villages-founding-dialog[data-headerless="true"] { width:min(26rem,calc(100vw - 2rem)); height:fit-content; min-height:0; max-height:calc(100dvh - 2rem); margin:auto; padding:1rem; gap:1rem; box-sizing:border-box; border:1px solid #596b9b; border-radius:.75rem; overflow:auto; font-size:1rem; }
.villages-founding-dialog[data-headerless="true"] > p { margin:0; line-height:1.4; }
.villages-founding-dialog[data-headerless="true"] .villages-zone-map-actions { display:flex; flex-wrap:wrap; gap:.5rem; margin:0; }
.villages-founding-dialog[data-headerless="true"] .villages-zone-map-actions button { flex:1; min-height:44px; margin:0; padding:.55rem .65rem; border:1px solid #65799c; border-radius:.5rem; background:#1f3050; color:inherit; font-size:.95rem; font-weight:normal; cursor:pointer; }
dialog.villages-founding-dialog:not([open]) { display:none; }
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

${ELEMENT_TAG} {
  display: block;
  height: 100%;
  min-height: 0;
  container-type: size;
  container-name: ${ELEMENT_TAG};
  text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
}

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
  .${ELEMENT_TAG}-chat-mode-button,
  .${ELEMENT_TAG}-chat-send { min-width: 2.25rem; }
  .${ELEMENT_TAG}-zoom-button,
  .${ELEMENT_TAG}-chat-mode-button,
  .${ELEMENT_TAG}-chat-send { justify-content: center; }
  
  .${ELEMENT_TAG}-pin-remove { min-width: 1.75rem; min-height: 1.75rem; }
  .${ELEMENT_TAG}-textarea { min-height: 4.5rem; }
}

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
  
  .${ELEMENT_TAG}-chat-figure { width: min(38cqw, calc(100cqh - .5rem)); }
  .${ELEMENT_TAG}-chat-scene-place { display: none; }
  .${ELEMENT_TAG}-chat-log { gap: .375rem; }
  .${ELEMENT_TAG}-chat-vn-portrait { display: none; }
  .${ELEMENT_TAG}-chat-vn-reading { max-height: min(34cqh, 11rem); }
}
@container ${ELEMENT_TAG} (max-width: 34rem) {
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

@container ${ELEMENT_TAG} (max-height: 22rem) {
  .${ELEMENT_TAG}-chat-stage { gap: .125rem; padding-bottom: .125rem; }
  .${ELEMENT_TAG}-chat-vn-reading { max-height: min(38cqh, 9rem); }
  .${ELEMENT_TAG}-chat-vn-name { font-size: .8125rem; }
}

@container ${ELEMENT_TAG} (max-width: 44rem) {
  .${ELEMENT_TAG}-setup-map-viewport { max-height: min(65cqh, 36rem); overscroll-behavior: contain; }
}

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

.${ELEMENT_TAG}-tracker-chip { width: auto; max-width: none; gap: .3125rem; padding-inline: .5rem; }
.${ELEMENT_TAG}-tracker-label { font-size: .6875rem; font-weight: 600; line-height: 1; letter-spacing: .01em; }

.${ELEMENT_TAG}-tracker[data-compact="true"] .${ELEMENT_TAG}-tracker-label { display: none; }
.${ELEMENT_TAG}-tracker[data-open="true"] .${ELEMENT_TAG}-tracker-label { color: var(--marinara-chat-chrome-button-text-active, currentColor); }

.${ELEMENT_TAG}-panel-view { display: flex; flex-direction: column; gap: .4375rem; }
.${ELEMENT_TAG}-panel-view-row { display: flex; flex-wrap: wrap; align-items: baseline; gap: .375rem; font-size: .75rem; line-height: 1.5; }
.${ELEMENT_TAG}-panel-view-key { color: var(--muted-foreground); }
.${ELEMENT_TAG}-panel-view-actions { display: flex; flex-wrap: wrap; gap: .375rem; margin-top: .125rem; }

.${ELEMENT_TAG}-tracker { position: relative; display: inline-flex; align-items: center; }
.${ELEMENT_TAG}-tracker svg { width: 1rem; height: 1rem; }
.${ELEMENT_TAG}-tracker[data-state="done"] { opacity: .7; }
.${ELEMENT_TAG}-spin { animation: ${ELEMENT_TAG}-spin .9s linear infinite; }
@keyframes ${ELEMENT_TAG}-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) {
  .${ELEMENT_TAG}-spin { animation: none; }
}

.${ELEMENT_TAG}-home-full[data-mobile="true"] { box-sizing: border-box; flex-direction: column; overflow: hidden; padding: .5rem; gap: .5rem; }
.${ELEMENT_TAG}-home-full[data-mobile="true"] .${ELEMENT_TAG}-room { min-height: 0; padding: 0; }
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
.${ELEMENT_TAG}-mobile-board-button, .${ELEMENT_TAG}-mobile-menu-button { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; width: 2.5rem; height: 2.5rem; min-width: 2.5rem; min-height: 2.5rem; padding: .15rem; }
.${ELEMENT_TAG}-mobile-board-button { border: 3px solid #5c381d; border-radius: .3rem; background: repeating-linear-gradient(90deg, #ad7540 0 9px, #9a6636 9px 11px); color: #f6e3b6; box-shadow: inset 0 0 0 2px #c5925a, 0 2px 4px #0007; font-size: 1.4rem; cursor: pointer; }
.${ELEMENT_TAG}-mobile-board-button:disabled { opacity: .55; }
.${ELEMENT_TAG}-mobile-menu-button { font-size: 1.5rem; line-height: 1; }
.${ELEMENT_TAG}-home-full[data-mobile="false"] .${ELEMENT_TAG}-mobile-datetime { font-size: 1rem; padding: .25rem .45rem; }
.${ELEMENT_TAG}-home-full[data-mobile="false"] .${ELEMENT_TAG}-mobile-clock { font-size: .75rem; }
.${ELEMENT_TAG}-stage[data-mobile="true"] .${ELEMENT_TAG}-pin-holder { z-index: 2; }
.${ELEMENT_TAG}-stage .${ELEMENT_TAG}-pin-holder[data-selected="true"] { z-index: 7; }
.${ELEMENT_TAG}-home-full .${ELEMENT_TAG}-pin[data-kind="place"], .${ELEMENT_TAG}-stage[data-mobile="true"] .${ELEMENT_TAG}-pin[data-kind="place"] { display: flex; align-items: center; justify-content: center; width: 3rem; height: 3rem; padding: 0; border: 0; border-radius: 0; background: transparent; color: #30261c; box-shadow: none; text-align: center; white-space: normal; line-height: 1.1; overflow: visible; }
.${ELEMENT_TAG}-home-full .${ELEMENT_TAG}-pin-photo-card, .${ELEMENT_TAG}-stage[data-mobile="true"] .${ELEMENT_TAG}-pin-photo-card { display: flex; flex: 0 0 auto; flex-direction: column; width: clamp(3.5rem, 6cqw, 5rem); gap: .1rem; padding: .18rem; box-sizing: border-box; border-radius: .1rem; background: #faf4e7; box-shadow: 0 3px 8px #0009; transform-origin: center; transition: transform 160ms ease-out; }
.${ELEMENT_TAG}-stage[data-mobile="true"] .${ELEMENT_TAG}-pin-photo-card { width: clamp(4rem, 17cqw, 5.25rem); }
.${ELEMENT_TAG}-home-full .${ELEMENT_TAG}-pin-photo, .${ELEMENT_TAG}-stage[data-mobile="true"] .${ELEMENT_TAG}-pin-photo { position: relative; display: block; width: 100%; aspect-ratio: 1 / 1; background: #201e29; overflow: visible; }
.${ELEMENT_TAG}-home-full .${ELEMENT_TAG}-pin-photo img, .${ELEMENT_TAG}-stage[data-mobile="true"] .${ELEMENT_TAG}-pin-photo img { display: block; width: 100%; height: 100%; object-fit: cover; }
.${ELEMENT_TAG}-home-full .${ELEMENT_TAG}-pin-name, .${ELEMENT_TAG}-stage[data-mobile="true"] .${ELEMENT_TAG}-pin-name { display: block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; font-size: .58rem; font-weight: 700; }
.${ELEMENT_TAG}-stage[data-mobile="true"] .${ELEMENT_TAG}-pin[data-kind="person"] { max-width: 7rem; }
.${ELEMENT_TAG}-stage[data-mobile="true"][data-mobile-gesturing="true"] .${ELEMENT_TAG}-pin-photo-card { transition: none; }
.${ELEMENT_TAG}-stage[data-mobile="true"] .${ELEMENT_TAG}-doors { z-index: 8; transform: translateX(-50%); min-width: min(10rem, 70cqw); }
.${ELEMENT_TAG}-project-head { display: flex; justify-content: space-between; align-items: start; gap: 1rem; padding: .25rem .25rem .5rem; }
.${ELEMENT_TAG}-project-head h2 { font-size: clamp(1.5rem, 3vw, 2.2rem); margin: .25rem 0; color: #f6f4ff; }
.${ELEMENT_TAG}-project-head p { margin: 0; color: #adbee8; }
.${ELEMENT_TAG}-project-slot, .${ELEMENT_TAG}-project-card { border: 1px solid #3f59ab; border-radius: 1rem; background: linear-gradient(145deg, #182b62, #101d44); box-shadow: 0 1rem 2rem #070e2b44; color: #f1f3ff; }
.${ELEMENT_TAG}-project-slot { display: grid; gap: .6rem; min-height: 11rem; text-align: left; padding: 1.3rem; cursor: pointer; }
.${ELEMENT_TAG}-project-slot:hover, .${ELEMENT_TAG}-project-slot:focus-visible { border-color: #a78bfa; box-shadow: 0 0 0 2px #8d6cf6; }
.${ELEMENT_TAG}-project-slot span { color: #aa9eff; font-size: .78rem; font-weight: 800; letter-spacing: .1em; }
.${ELEMENT_TAG}-project-slot strong { font-size: 1.3rem; }
.${ELEMENT_TAG}-project-slot small { color: #b8c6eb; }
.${ELEMENT_TAG}-project-card { display: grid; gap: .85rem; padding: 1.25rem; }
.${ELEMENT_TAG}-project-card h3, .${ELEMENT_TAG}-project-card h4 { margin: 0; }
.${ELEMENT_TAG}-project-card p { margin: .1rem 0; line-height: 1.45; color: #c7d4f6; }
.${ELEMENT_TAG}-project-card label { display: grid; gap: .4rem; font-weight: 650; }
.${ELEMENT_TAG}-project-card input:not([type="file"]), .${ELEMENT_TAG}-project-card select, .${ELEMENT_TAG}-project-card textarea { width: 100%; box-sizing: border-box; border: 1px solid #5470bf; border-radius: .55rem; background: #172b60; color: #f4f6ff; padding: .7rem; font: inherit; }
.${ELEMENT_TAG}-project-card textarea { min-height: 7rem; resize: vertical; }
.${ELEMENT_TAG}-project-card > .${ELEMENT_TAG}-button { background: linear-gradient(100deg, #3656f6, #9448ef); color: white; min-height: 2.75rem; }
.${ELEMENT_TAG}-mobile-map-preview { display: block; max-width: min(100%, 22rem); max-height: 13rem; object-fit: contain; border: 2px solid var(--border); }
.${ELEMENT_TAG}-setup-map-viewport:has(> .${ELEMENT_TAG}-stage[data-mobile="true"]) { height: min(55cqh, 30rem); overflow: hidden; }
.${ELEMENT_TAG}-setup-map-viewport > .${ELEMENT_TAG}-stage[data-mobile="true"] { width: 100% !important; height: 100% !important; aspect-ratio: auto !important; }

.${ELEMENT_TAG}-stage[data-photo-pins="true"][data-mobile="false"] .${ELEMENT_TAG}-pin[data-kind="place"] { display: flex; align-items: center; justify-content: center; min-width: 0; min-height: 0; padding: 0; border: 0; background: transparent; box-shadow: none; overflow: visible; }
.${ELEMENT_TAG}-stage[data-photo-pins="true"][data-mobile="false"] .${ELEMENT_TAG}-pin-photo-card { display: flex; flex-direction: column; gap: .1rem; width: 4rem; padding: .18rem; box-sizing: border-box; border-radius: .1rem; background: #faf4e7; color: #30261c; box-shadow: 0 3px 8px #0009; transform-origin: center; transition: transform 160ms ease-out; }
.${ELEMENT_TAG}-stage[data-photo-pins="true"][data-mobile="false"] .${ELEMENT_TAG}-pin-photo { position: relative; display: block; width: 100%; aspect-ratio: 1 / 1; background: #201e29; }
.${ELEMENT_TAG}-stage[data-photo-pins="true"][data-mobile="false"] .${ELEMENT_TAG}-pin-photo img { display: block; width: 100%; height: 100%; object-fit: cover; }
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
.${ELEMENT_TAG}-room-screen[data-mobile="true"] .${ELEMENT_TAG}-room-stars { top: 4.25rem; left: .625rem; width: min(15rem, calc(100% - 1.25rem)); max-height: 20cqh; gap: .25rem; }
.${ELEMENT_TAG}-room-screen[data-mobile="true"] .${ELEMENT_TAG}-room-star { gap: .35rem; padding: .35rem .45rem; font-size: .75rem; line-height: 1.3; }
.${ELEMENT_TAG}-room-screen[data-mobile="true"] .${ELEMENT_TAG}-room-star-dismiss { margin: -.3rem -.35rem -.3rem 0; }
.${ELEMENT_TAG}-room-screen[data-mobile="true"] .${ELEMENT_TAG}-chat-vn-asides { position: static; flex: 0 0 auto; align-self: flex-end; width: min(90%, 20rem); max-height: 9rem; margin-bottom: .125rem; z-index: 2; }
.${ELEMENT_TAG}-room-screen[data-mobile="true"] .${ELEMENT_TAG}-chat-vn-aside { max-width: 100%; padding: .4rem .55rem; gap: .375rem; }
.${ELEMENT_TAG}-room-screen[data-mobile="true"] .${ELEMENT_TAG}-chat-vn-aside-face { width: 1.5rem; height: 1.5rem; }
.${ELEMENT_TAG}-room-screen[data-mobile="true"] .${ELEMENT_TAG}-memory-backdrop { padding: .5rem; }
.${ELEMENT_TAG}-room-screen[data-mobile="true"] .${ELEMENT_TAG}-memory-dialog { width: min(20rem, 100%); max-height: 60cqh; padding: .75rem; }

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
.${ELEMENT_TAG}-menu-content .${ELEMENT_TAG}-menu-body { gap: 1rem; }
.${ELEMENT_TAG}-sectioned-menu > .${ELEMENT_TAG}-panel.${ELEMENT_TAG}-menu-content { margin: clamp(.75rem, 2cqw, 1.5rem); }

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
.${ELEMENT_TAG}-stage[data-compact-photos="true"] .${ELEMENT_TAG}-pin-photo img { object-fit: cover; }
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

.${ELEMENT_TAG}-venue-profile { box-sizing:border-box; max-width: 64rem; margin-inline: auto; width: 100%; background:var(--background); }
.${ELEMENT_TAG}-venue-profile h2 { font-size: 1.1rem; margin: 0 0 .75rem; }
.${ELEMENT_TAG}-venue-profile button, .${ELEMENT_TAG}-venue-profile input, .${ELEMENT_TAG}-venue-profile select { max-width: 100%; }
.${ELEMENT_TAG}-venue-sections { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); border-bottom: 1px solid var(--border); }
.${ELEMENT_TAG}-venue-sections button { min-height: 2.75rem; border: 0; border-bottom: 3px solid transparent; background: transparent; color: var(--muted-foreground); font: inherit; cursor: pointer; }
.${ELEMENT_TAG}-venue-sections button[aria-pressed="true"] { border-bottom-color: var(--primary); color: var(--foreground); }
.${ELEMENT_TAG}-venue-profile-body { width: 100%; max-width: 44rem; margin-inline: auto; }
.${ELEMENT_TAG}-venue-profile-image { display:block; width:100%; max-height:26rem; object-fit:contain; border-radius:.6rem; margin-bottom:1rem; }
.${ELEMENT_TAG}-venue-primary { display:block; width:100%; padding:.8rem; margin:.75rem 0; border:1px solid var(--border); border-radius:.6rem; background:var(--primary); color:var(--primary-foreground,var(--background)); font:inherit; cursor:pointer; }
.${ELEMENT_TAG}-venue-section { display:flex; flex-direction:column; align-items:flex-start; gap:.6rem; padding:1rem 0; border-bottom:1px solid var(--border); }
.${ELEMENT_TAG}-venue-section p { margin:.25rem 0; }
.${ELEMENT_TAG}-venue-section > label { display:grid; gap:.4rem; width:100%; }
.${ELEMENT_TAG}-venue-section input, .${ELEMENT_TAG}-venue-section select { width:100%; box-sizing:border-box; }
.${ELEMENT_TAG}-venue-zones-workspace { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:1rem; align-items:start; }
.${ELEMENT_TAG}-venue-zones-layout { min-width:0; }
.${ELEMENT_TAG}-venue-zones-layout .villages-zone-map { margin:0; }
.${ELEMENT_TAG}-venue-zones-layout .villages-zone-map-toolbar { margin-top:0; }
.${ELEMENT_TAG}-venue-zone-details { min-width:0; height:clamp(540px,70dvh,720px); box-sizing:border-box; overflow:auto; padding:1rem; background:var(--popover); border:1px solid var(--border); border-radius:.75rem; display:flex; flex-direction:column; gap:.75rem; }
.${ELEMENT_TAG}-venue-zone-details > * { flex-shrink:0; }
.${ELEMENT_TAG}-venue-zone-details h2 { margin:0; font-size:1.35rem; line-height:1.4; }
.${ELEMENT_TAG}-zone-title h2 > :is(button,input) { display:block; box-sizing:border-box; width:100%; margin:0; min-height:1.4em; padding:0; border:0; border-radius:0; background:transparent; color:inherit; font:inherit; text-align:left; }
.${ELEMENT_TAG}-zone-title h2 > button { cursor:text; }
.${ELEMENT_TAG}-zone-title h2 > button span { font-size:.7em; opacity:.6; }
.${ELEMENT_TAG}-zone-title h2 > input { outline-offset:3px; }
.${ELEMENT_TAG}-zone-artwork-frame { width:100%; height:clamp(200px,34dvh,340px); overflow:hidden; display:grid; place-items:center; }
.${ELEMENT_TAG}-zone-artwork-frame .${ELEMENT_TAG}-venue-profile-image { display:block; height:100%; width:100%; max-height:none; object-fit:contain; margin:0; }
.${ELEMENT_TAG}-zone-artwork-frame .${ELEMENT_TAG}-venue-image-empty { width:100%; height:100%; min-height:0; margin:0; box-sizing:border-box; }
.${ELEMENT_TAG}-zone-artwork-actions { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); min-height:calc(88px + .4rem); gap:.4rem; align-items:stretch; align-content:start; }
.${ELEMENT_TAG}-zone-artwork-actions > button { min-width:0; width:100%; min-height:44px; margin:0; padding:.5rem .2rem; font-size:.8rem; line-height:1.2; white-space:nowrap; }
.${ELEMENT_TAG}-zone-artwork-actions > .${ELEMENT_TAG}-zone-artwork-retry { grid-column:1/-1; }
.${ELEMENT_TAG}-zone-access-details small { display:block; }
@media(max-width:700px) {
 .${ELEMENT_TAG}-venue-zones-workspace { grid-template-columns:minmax(0,1fr); gap:.75rem; }
 .${ELEMENT_TAG}-venue-zone-details { padding:.75rem; }
 .${ELEMENT_TAG}-venue-zones-layout .villages-zone-map-canvas { height:300px; }
 .${ELEMENT_TAG}-venue-zones-layout .villages-zone-map-tile small { display:none; }
 .${ELEMENT_TAG}-venue-zones-layout .villages-zone-map-tile strong { font-size:.8rem; line-height:1.15; white-space:normal; overflow-wrap:anywhere; }
 .${ELEMENT_TAG}-zone-artwork-frame { height:180px; }
}
.${ELEMENT_TAG}-zone-picture-freeze { display:flex; align-items:center; gap:.5rem; min-height:44px; width:fit-content; margin-bottom:.25rem; cursor:pointer; }
.${ELEMENT_TAG}-zone-picture-freeze input { width:1.15rem; height:1.15rem; margin:0; }
.${ELEMENT_TAG}-venue-assignments { margin:0; padding:0; list-style:none; width:100%; }
.${ELEMENT_TAG}-venue-assignments li { display:flex; flex-wrap:wrap; justify-content:space-between; gap:.6rem; padding:.7rem 0; border-bottom:1px solid var(--border); }
.villages-zone-map { min-width:0; margin:1rem 0; }
.villages-zone-map-toolbar { display:flex; gap:.35rem; align-items:stretch; margin:.6rem 0; }
.villages-zone-map .villages-zone-map-toolbar button { flex:1; min-width:0; font-size:.85rem; line-height:1.15; }
.villages-zone-map-actions { display:flex; flex-wrap:wrap; gap:.5rem; align-items:center; margin:.6rem 0; }
.villages-zone-map button, .villages-zone-map-actions button { font:inherit; color:var(--foreground); border:1px solid var(--border); background:var(--popover); border-radius:.5rem; padding:.4rem .6rem; min-height:44px; cursor:pointer; }
.villages-zone-map button:disabled, .villages-zone-map-actions button:disabled { opacity:.5; cursor:default; }
.villages-zone-map-canvas { position:relative; width:100%; height:clamp(320px,48dvh,480px); border:1px solid var(--border); border-radius:.5rem; background:var(--background); overflow:hidden; box-sizing:border-box; }
.villages-zone-map-canvas > svg { position:absolute; inset:0; width:100%; height:100%; pointer-events:none; }
.villages-zone-map-canvas line { stroke:var(--primary); stroke-width:2; vector-effect:non-scaling-stroke; }
.villages-zone-map-canvas button.villages-zone-map-tile { position:absolute; box-sizing:border-box; display:flex; flex-direction:column; justify-content:center; align-items:center; gap:1px; min-width:0; min-height:0; margin:0; padding:4px; overflow:hidden; border-radius:.6rem; touch-action:none; user-select:none; cursor:grab; line-height:1.2; }
.villages-zone-map-tile strong { display:block; max-width:100%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-size:clamp(12px,.8rem,16px); }
.villages-zone-map-tile small { display:block; width:100%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-size:clamp(11px,.65rem,14px); }
.villages-zone-map-tile[aria-pressed="true"] { border-color:var(--primary); box-shadow:inset 0 0 0 1px var(--primary); }
.villages-zone-map-canvas button[data-draggable="false"] { cursor:pointer; touch-action:pan-y; }
.villages-zone-map-connections { list-style:none; padding:0; }
.villages-zone-map-connections li { display:flex; justify-content:space-between; align-items:center; gap:.5rem; border-bottom:1px solid var(--border); padding:.3rem 0; }
.villages-zone-map-connections li span { min-width:0; overflow-wrap:anywhere; }
.${ELEMENT_TAG}-venue-profile input[type="file"] { display:block; width:100%; margin-top:.4rem; }
.${ELEMENT_TAG}-venue-profile [hidden] { display:none !important; }
.${ELEMENT_TAG}-venue-profile .${ELEMENT_TAG}-sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap; }
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
