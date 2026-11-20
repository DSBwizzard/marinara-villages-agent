import { STORYBOOK_DAY, STORYBOOK_NIGHT } from "../../shared/storybook-colors.js";

const tag = "marinara-capability-villages";

/** Package-owned presentation; Engine source and ordinary Home tabs stay intact. */
export const VILLAGES_SCENE_STYLES = `
[data-component="HomeBrowserHub"]:has(${tag}[data-scene-play]) [data-component="HomeBrowserHub.Content"] { overflow: hidden; }
${tag}[data-scene-play] { height: var(--villages-scene-canvas-height, 100%) !important; }
.${tag}-root.${tag}-room-screen { position: relative; }
.${tag}-room-time { display: block; overflow: hidden; text-overflow: ellipsis; font-size: .6875rem; opacity: .8; }
.${tag}-room-screen > .${tag}-room-error { position: absolute; z-index: 20; top: 3rem; left: .75rem; right: .75rem; max-height: max(3rem, calc(var(--villages-scene-visible-height, 100cqh) - 9rem)); overflow-y: auto; }
.${tag}-room-screen > .${tag}-chat { position: relative; flex: 1 0 100%; height: 100%; min-height: 0; }
.${tag}-room-screen .${tag}-chat-stage {
  position: absolute; inset: 0; width: 100%; height: 100%; padding: 3rem .75rem 0;
  flex: none; transform: translateY(var(--villages-scene-stage-offset, 0px));
}
/* Crowded slots set the centers, while full-body art can extend beyond them. */
.${tag}-room-screen:not([data-mobile="true"]) .${tag}-chat-cast-person > img:not([data-framing="half"]) { min-width: 25cqw; }
.${tag}-room-screen .${tag}-chat-scene { transform: translateY(var(--villages-scene-stage-offset, 0px)); }
.${tag}-room-screen .${tag}-chat-vn {
  position: absolute; z-index: 10; left: 50%; bottom: var(--villages-scene-dock-bottom, 0px);
  transform: translateX(-50%); width: min(58rem, 100%); margin: 0;
  padding: 0 .75rem; gap: .5rem;
  border: 0; border-radius: 0; background: transparent; backdrop-filter: none; box-shadow: none;
}
${tag}[data-scene-keyboard] .${tag}-chat-vn { padding-bottom: 0; }
.${tag}-room-screen .${tag}-chat-vn[hidden] { display: none; }
.${tag}-scene-speaker-row { display: flex; align-items: center; gap: .5rem; min-width: 0; }
.${tag}-scene-reply-actions { display: flex; flex: none; gap: .375rem; margin-inline-start: auto; }
.${tag}-scene-reply-actions button {
  display: inline-flex; align-items: center; gap: .25rem; white-space: nowrap;
  min-height: 2rem; margin-block: -.4375rem; padding-inline: .25rem; border: 0; background: transparent;
  font: inherit; font-size: .75rem; font-weight: 600; cursor: pointer;
  color: var(--marinara-chat-chrome-highlight-text, color-mix(in srgb, var(--primary) 75%, var(--foreground)));
}
.${tag}-scene-reply-actions button svg { width: .9375rem; height: .9375rem; flex: none; }
.${tag}-scene-reply-actions button:disabled { color: var(--muted-foreground); opacity: .55; cursor: default; }
.${tag}-scene-reply-actions button:focus-visible { outline: 2px solid var(--primary); outline-offset: -2px; border-radius: .25rem; }
.${tag}-room-screen .${tag}-chat-vn-card {
  border: 1px solid var(--border); border-radius: .75rem;
  background: var(--marinara-chat-chrome-panel-bg, var(--popover)); backdrop-filter: blur(12px); box-shadow: 0 .25rem .75rem #0004;
}
.${tag}-room-screen .${tag}-chat-vn-card[hidden] { display: none; }
.${tag}-room-screen .${tag}-chat-vn-row { padding: .75rem; gap: .75rem; }
.${tag}-room-screen .${tag}-chat-vn-portrait {
  width: min(5rem, 26cqw, max(2rem, calc(var(--villages-scene-visible-height, 100cqh) - 12rem)));
  height: auto; aspect-ratio: 1; flex: 0 0 auto; border-radius: .75rem; overflow: hidden;
  border: 1px solid var(--border); background: var(--secondary); display: grid; place-items: center; align-self: start;
}
.${tag}-chat-vn-portrait svg { width: 1.75rem; height: 1.75rem; color: var(--muted-foreground); }
.${tag}-room-screen img[data-npc-sprite] { object-fit: contain; opacity: .78; filter: none; background: transparent; border: 0; border-radius: 0; box-shadow: none; }
.${tag}-room-screen .${tag}-chat-vn-column { gap: .5rem; }
.${tag}-room-screen .${tag}-chat-vn-name,
.${tag}-room-screen .${tag}-chat-vn-label { font-size: .875rem; font-weight: 600; }
.${tag}-room-screen .${tag}-chat-vn-reading {
  max-height: min(30cqh, 18rem, max(1.5rem, calc(var(--villages-scene-visible-height, 100cqh) - 13rem)));
  padding-right: .25rem; min-height: 0;
}
.${tag}-room-screen .${tag}-chat-vn-text,
.${tag}-room-screen .${tag}-chat-vn-beat { font-size: .875rem; line-height: 1.5; }
.${tag}-room-panel-tools { display: flex; justify-content: space-between; padding: .375rem .75rem; min-height: 0; gap: .5rem; }
.${tag}-room-panel-tools .${tag}-chat-vn-nav { display: contents; }
.${tag}-room-panel-tools .${tag}-chat-vn-counter { order: 2; text-align: center; font-size: .6875rem; flex: 1; }
.${tag}-room-panel-tools .${tag}-chat-vn-button { min-height: 1.75rem; padding: .25rem .5rem; font-size: .75rem; }
.${tag}-room-panel-tools .${tag}-chat-vn-button:first-child { order: 1; }
.${tag}-room-panel-tools .${tag}-chat-vn-button:last-child:not(:first-child) { order: 3; }
.${tag}-room-screen .${tag}-chat-log {
  position: relative; inset: auto; max-height: min(55cqh, max(3rem, calc(var(--villages-scene-visible-height, 100cqh) - 10rem)));
}
.${tag}-scene-history-pages { position: sticky; top: 0; z-index: 1; display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; padding-bottom: .5rem; background: var(--popover); }
.${tag}-scene-history-pages .${tag}-chat-vn-button { min-height: 32px; }
.${tag}-room-screen[data-mobile="true"] .${tag}-scene-history-pages .${tag}-chat-vn-button { min-height: 44px; min-width: 44px; }
.${tag}-room-screen .${tag}-composer { border: 0; padding: 0; gap: .375rem; }
.${tag}-room-screen .${tag}-chat-input { padding: .375rem .5rem; gap: .25rem; }
.${tag}-room-screen .${tag}-chat-input > .${tag}-textarea {
  height: auto; min-height: 0; max-height: 12.5rem; padding: 0; font-size: .875rem; line-height: 1.5;
}
.${tag}-room-screen .${tag}-chat-input > .${tag}-textarea:focus,
.${tag}-room-screen .${tag}-chat-input > .${tag}-textarea:focus-visible { outline: none; box-shadow: none; border: 0; }
.${tag}-room-screen .${tag}-chat-send {
  width: 2rem; height: 2rem; min-width: 0; min-height: 0; padding: 0; border: 0; border-radius: .75rem;
  background: transparent; color: var(--foreground); font-weight: normal; touch-action: manipulation;
}
.${tag}-room-screen .${tag}-chat-send svg { width: .9375rem; height: .9375rem; }
.${tag}-room-screen .${tag}-chat-send:hover:not(:disabled) { background: color-mix(in srgb, var(--foreground) 10%, transparent); color: var(--foreground); }
.${tag}-room-screen .${tag}-room-actions-menu { max-height: max(3rem, calc(var(--villages-scene-visible-height, 100cqh) - 4rem)); overflow-y: auto; }
.villages-founding-dialog.villages-scene-move {
  ${STORYBOOK_NIGHT}; color-scheme:dark; --move-card:#514157; --move-line:#a5ac8b; --move-caution:#d9b37c;
  width:min(58rem,calc(100vw - 2rem)); height:fit-content; padding:1.25rem;
  max-height:calc(100dvh - 2rem); border:1px solid var(--border); border-radius:1rem;
  background:linear-gradient(145deg,color-mix(in srgb,var(--secondary) 42%,transparent),transparent 65%),var(--background); color:var(--foreground); font:16px/1.4 var(--menu-font); box-shadow:0 1.5rem 5rem #0005;
}
.villages-founding-dialog.villages-scene-move-day { ${STORYBOOK_DAY}; --move-card:#dae7d2; --move-line:#789483; --move-caution:#8b6035; }
.villages-scene-move::backdrop { background:#11131c70; backdrop-filter:blur(4px); }
.villages-founding-dialog.villages-scene-move > header { display:flex; align-items:center; gap:.75rem; margin:0; padding:0 0 1rem; background:transparent; }
.villages-scene-move-heading { flex:1; min-width:0; }
.villages-scene-move-heading h3 { margin:0!important; font:500 2rem/1.1 var(--menu-font)!important; }
.villages-scene-move-heading small { display:block; color:var(--muted-foreground); margin-top:.35rem; }
.villages-founding-dialog.villages-scene-move button { min-height:44px; border:1px solid var(--border); border-radius:.6rem; background:var(--secondary); color:inherit; font:inherit; padding:.45rem .8rem; }
.villages-founding-dialog.villages-scene-move > header button { flex:none; width:auto; margin:0; background:transparent; }
.villages-founding-dialog.villages-scene-move > header > button:last-child { width:44px; padding:0; font-size:1.5rem; }
.villages-founding-dialog.villages-scene-move button:focus-visible { outline:2px solid var(--menu-tab-line); outline-offset:3px; }
.villages-scene-move .villages-founding-editor-body { display:grid; gap:1rem; padding:0; }
.villages-scene-move .villages-founding-editor-body p { margin:0; }
.villages-scene-move-location { font-size:.875rem; color:var(--muted-foreground); }
.villages-scene-move .villages-zone-map { margin:0; }
.villages-scene-move .villages-zone-map-canvas { height:clamp(420px,52dvh,540px); min-height:420px; border:0; border-radius:0; background:transparent; }
.villages-scene-move .villages-zone-map-canvas polyline { stroke:var(--move-line); stroke-width:1.5; }
.villages-scene-move .villages-zone-map-canvas button.villages-zone-map-tile {
  --tile-surface:var(--move-card); width:32%; min-height:44px; text-align:left; align-items:flex-start;
  padding:.5rem .75rem; isolation:isolate; border-color:var(--move-line); background:var(--tile-surface);
}
.villages-scene-move .villages-zone-map-tile:has([data-zone-access="trespass"]) { border-color:var(--move-caution); }
.villages-scene-move .villages-zone-map-tile:has([data-zone-access="blocked"]) { border-style:dashed; }
.villages-scene-move .villages-zone-map-canvas button[aria-pressed="true"] { --tile-surface:var(--menu-selected); border-color:var(--menu-tab-line); box-shadow:inset 0 0 0 1px var(--menu-tab-line); }
.villages-scene-move .villages-zone-map-tile[aria-current="location"] small::before { content:""; display:inline-block; width:.4rem; height:.4rem; margin-right:.35rem; border-radius:50%; background:currentColor; vertical-align:middle; }
.villages-scene-move .villages-zone-map-tile strong { position:relative; white-space:normal; overflow-wrap:anywhere; font-size:clamp(12px,1rem,18px); line-height:1.15; }
.villages-scene-move .villages-zone-map-label { position:relative; max-width:100%; }
.villages-scene-move .villages-zone-map-tile small { font-size:clamp(10px,.8rem,14px); color:var(--foreground); }
.villages-scene-move .villages-zone-map-art { position:absolute; z-index:-2; inset:0; width:100%; height:100%; object-fit:cover; opacity:.65; pointer-events:none; }
.villages-scene-move .villages-zone-map-tile:has(.villages-zone-map-art)::before { content:""; position:absolute; z-index:-1; inset:0; background:linear-gradient(90deg,var(--tile-surface) 12%,color-mix(in srgb,var(--tile-surface) 94%,transparent) 48%,color-mix(in srgb,var(--tile-surface) 25%,transparent)); pointer-events:none; }
.villages-scene-move-zone { padding-top:1rem; border-top:1px solid var(--border); }
.villages-scene-move .villages-scene-move-companions p { margin:0 0 .5rem; font-size:.85rem; color:var(--muted-foreground); }
.villages-scene-move-confirm { display:flex; align-items:center; flex-wrap:wrap; gap:.5rem; }
.villages-scene-move-confirm p { flex:1; min-width:8rem; }
.villages-scene-move-confirm small { display:block; font-size:.8rem; color:var(--muted-foreground); }
.villages-scene-move-confirm button { flex:none; min-width:5rem; }
.villages-founding-dialog.villages-scene-move .villages-scene-move-primary { background:var(--primary); border-color:var(--move-line); color:var(--primary-foreground); }
@media(max-width:540px) {
 .villages-founding-dialog.villages-scene-move { padding:.85rem; width:calc(100vw - 1rem); }
 .villages-scene-move .villages-zone-map-canvas button.villages-zone-map-tile { padding:.3rem; }
 .villages-scene-move-confirm p { flex-basis:100%; }
 .villages-scene-move-confirm button { flex:1; }
}
.${tag}-room-screen .${tag}-chat-head { flex-wrap: nowrap; }
.${tag}-room-screen .${tag}-chat-head:has(:is(.${tag}-room-actions-menu, .${tag}-scene-error-panel, .${tag}-room-stars)) { z-index: 25; }
.${tag}-room-screen .${tag}-chat-actions { flex: 0 0 auto; }
.${tag}-scene-settings-backdrop { position: absolute; z-index: 30; inset: 0; height: var(--villages-scene-visible-height, 100%); display: grid; place-items: center; padding: .75rem; box-sizing: border-box; background: #0008; }
.${tag}-scene-settings { width: min(36rem, 100%); max-height: 100%; overflow-y: auto; padding: .75rem; box-sizing: border-box; border: 1px solid var(--border); border-radius: .75rem; background: var(--popover); }
.${tag}-scene-settings-head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.${tag}-scene-settings-head h2 { margin: 0 0 .75rem; font-size: 1rem; }
.${tag}-scene-settings button { cursor: pointer; font: inherit; color: inherit; border: 1px solid var(--border); border-radius: .5rem; padding: .25rem .5rem; background: var(--secondary); }
.${tag}-scene-settings .villages-decisions-control > [role="region"] { width: 100% !important; box-sizing: border-box; }

.${tag}-scene-notice-chips { display: flex; align-items: center; flex: 0 0 auto; gap: .375rem; }
.${tag}-scene-notice-chips:empty { display: none; }
.${tag}-room-screen .${tag}-scene-notice-chips .${tag}-room-notices { position: static; }
.${tag}-room-screen .${tag}-scene-notice-chips :is(.${tag}-room-stars, .${tag}-scene-error-panel) { top: calc(100% + .5rem); left: 0; max-width: 100%; }
.${tag}-room-screen .${tag}-scene-travel-card {
  position: absolute; z-index: 19; top: clamp(4.25rem, 28%, calc(100% - 4.75rem)); left: 50%; transform: translateX(-50%);
  width: min(19rem, calc(100% - 2rem)); box-sizing: border-box; align-items: center; gap: .65rem; padding: .5rem .65rem;
}
.${tag}-scene-travel-card strong { flex: 1; overflow-wrap: anywhere; font-size: .875rem; font-weight: 600; }
.${tag}-scene-travel-card button { flex: 0 0 auto; min-height: 2rem; }
.${tag}-scene-travel-card button.${tag}-scene-visit { padding: .25rem .65rem; border: 1px solid var(--border); border-radius: .5rem; background: var(--background); }
.${tag}-scene-travel-card button:disabled { cursor: default; opacity: .5; }
.${tag}-scene-travel-card button:last-child { min-width: 1.5rem; padding: 0; font-size: 1rem; color: var(--muted-foreground); }
.${tag}-room-screen[data-mobile="true"] .${tag}-scene-travel-card button { min-width: 44px; min-height: 44px; }
.${tag}-scene-error-trigger { display: flex; align-items: center; justify-content: center; gap: .4rem; min-height: 44px; min-width: 3.5rem; padding: .35rem .65rem; border: 1px solid var(--border); border-radius: 1.5rem; background: var(--popover); color: var(--foreground); font: inherit; font-size: .75rem; cursor: pointer; }
.${tag}-scene-error-trigger[aria-expanded="true"] { border-color: #ed6689; }
.${tag}-scene-error-icon { display: inline-grid; place-items: center; flex: 0 0 auto; width: 1.2rem; height: 1.2rem; border-radius: 50%; background: #ed6689; color: #2c101a; font-weight: 750; font-size: .875rem; line-height: 1; }
.${tag}-scene-error-panel { position: absolute; top: calc(100% + .5rem); left: 0; width: min(26rem, 100%); max-height: max(5rem, calc(var(--villages-scene-visible-height, 100cqh) - 12rem)); overflow-y: auto; box-sizing: border-box; border: 1px solid var(--border); border-radius: .75rem; background: var(--popover); color: var(--foreground); box-shadow: 0 .75rem 2rem #0006; font-size: .8125rem; }
.${tag}-scene-error-head { display: flex; justify-content: space-between; align-items: center; gap: .5rem; padding: .25rem .75rem; border-bottom: 1px solid var(--border); }
.${tag}-scene-error-head h2 { margin: 0; font-size: .875rem; }
.${tag}-scene-error-head button { min-width: 44px; min-height: 44px; background: transparent; color: inherit; border: 0; font: inherit; cursor: pointer; }
.${tag}-scene-error-item + .${tag}-scene-error-item { border-top: 1px solid var(--border); }
.${tag}-scene-error-message { display: flex; align-items: flex-start; gap: .5rem; padding: .75rem; min-height: 44px; box-sizing: border-box; overflow-wrap: anywhere; }
.${tag}-scene-error-detail { padding: 0 .75rem .75rem; overflow-wrap: anywhere; }
.${tag}-scene-error-detail p { margin: 0 0 .75rem; white-space: pre-wrap; }
.${tag}-scene-error-detail button { min-height: 44px; max-width: 100%; padding: .35rem .5rem; margin-top: .35rem; background: var(--secondary); border: 1px solid var(--border); border-radius: .5rem; color: inherit; font: inherit; cursor: pointer; white-space: normal; overflow-wrap: anywhere; }
.${tag}-scene-error-actions { display: flex; flex-wrap: wrap; gap: .35rem; }
.${tag}-scene-error-trigger:focus-visible, .${tag}-scene-error-panel button:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.${tag}-scene-modal-errors { position: relative; margin-bottom: .5rem; }
.${tag}-scene-modal-errors .${tag}-scene-error-panel { z-index: 40; }
@media (min-width: 768px) {
  .${tag}-room-screen .${tag}-chat-vn-row { padding: 1rem; gap: 1rem; }
  .${tag}-room-screen .${tag}-chat-input { padding: .625rem 1rem; gap: .5rem; }
}
.${tag}-room-screen[data-mobile="true"] .${tag}-chat-send { width: 44px; height: 44px; }
.${tag}-room-screen .${tag}-chat-input .${tag}-chat-send[aria-label="Resend"] { width: auto; padding-inline: .5rem; font-size: .75rem; }
.${tag}-room-screen[data-mobile="true"] .${tag}-room-actions-menu > :is(button, select) { min-height: 44px; }
.${tag}-room-screen[data-mobile="true"] .${tag}-chat-vn-row { padding: .75rem; gap: .75rem; }
.${tag}-room-screen[data-mobile="true"] .${tag}-chat-input { padding: 0 .5rem; gap: .25rem; min-height: 44px; }
/* 16px prevents mobile Safari zooming on focus; desktop uses Engine's 14px text. */
.${tag}-room-screen[data-mobile="true"] .${tag}-chat-input > .${tag}-textarea { font-size: 1rem; }

/* A Scene modal temporarily covers the floating usage badge as well as the stage. */
:is(body, :fullscreen):has(${tag}[data-scene-play] [aria-modal="true"]) > aside[aria-label="Villages AI usage"] { visibility: hidden; }

/* Measure full formatted paragraphs off screen, without adding scrollable content. */
.${tag}-room-screen .${tag}-reading-measure {
  position: fixed !important; top: 0; left: -100000px; visibility: hidden; pointer-events: none;
  height: auto !important; max-height: none !important; margin: 0; overflow: visible;
}
.${tag}-chat-keyboard-done { display: none; }
.${tag}-room-screen[data-mobile="true"] .${tag}-chat-vn { padding: 0 .375rem; gap: .25rem; }
${tag}[data-scene-keyboard] .${tag}-room-screen[data-mobile="true"] .${tag}-chat-vn:has(.${tag}-composer)
  > :is(.${tag}-chat-log, .${tag}-chat-vn-card) { display: none; }
${tag}[data-scene-keyboard] .${tag}-room-screen[data-mobile="true"] .${tag}-composer-row { flex-wrap: nowrap; gap: .375rem; }
${tag}[data-scene-keyboard] .${tag}-room-screen[data-mobile="true"] .${tag}-chat-keyboard-done {
  display: block; flex: 0 0 auto; min-height: 44px; min-width: 44px; padding: 0 .625rem;
  border: 1px solid var(--border); border-radius: .75rem; font: inherit; font-size: .8125rem;
  color: var(--foreground); background: var(--popover); cursor: pointer;
}
/* Enlarge the tap target inside the card without adding height to the speaker row. */
.${tag}-room-screen[data-mobile="true"] .${tag}-scene-reply-actions button { min-height: 44px; margin-block: -.375rem; }
.${tag}-room-screen[data-mobile="true"] .${tag}-chat-vn-row { display: grid; grid-template-columns: 2rem minmax(0, 1fr); align-items: center; padding: .5rem .625rem; gap: .375rem .5rem; }
.${tag}-room-screen[data-mobile="true"] .${tag}-chat-vn-portrait { width: 32px; height: 32px; box-sizing: border-box; border-radius: .375rem; }
.${tag}-room-screen[data-mobile="true"] .${tag}-chat-vn-column { display: contents; }
.${tag}-room-screen[data-mobile="true"] .${tag}-scene-speaker-row { grid-column: 2; }
.${tag}-room-screen[data-mobile="true"] .${tag}-chat-vn-reading { grid-column: 1 / -1; width: 100%; box-sizing: border-box; min-height: 0; max-height: min(var(--villages-reading-page-height, 3.9375rem), max(1.3125rem, calc(var(--villages-scene-visible-height, 100cqh) - 10.5rem))); }
.${tag}-room-screen[data-mobile="true"] .${tag}-room-panel-tools { padding: 0 .375rem; gap: .125rem; align-items: center; }
.${tag}-room-screen[data-mobile="true"] .${tag}-room-panel-tools .${tag}-chat-vn-button { min-height: 44px; min-width: 44px; padding: .25rem .375rem; }
.${tag}-room-screen[data-mobile="true"] .${tag}-room-place { max-width: calc(100% - 8rem); }
.${tag}-room-screen[data-mobile="true"] .${tag}-room-notices { top: .65rem; left: auto; right: 3.25rem; z-index: 7; }
.${tag}-room-screen[data-mobile="true"] .${tag}-room-stars { left: auto; right: 0; width: min(20rem, calc(100vw - 4rem)); }

/* Large artwork overlaps inside stable left/right groups, with a shared raised floor. */
.${tag}-room-screen[data-mobile="true"] .${tag}-chat-stage { padding-left: 0; padding-right: 0; }
.${tag}-room-screen[data-mobile="true"] .${tag}-chat-stage .${tag}-chat-cast > .${tag}-chat-cast-person[data-character-id] {
  --cast-image-height: min(120cqw, 68cqh);
  --cast-lift: clamp(0px, calc(var(--villages-scene-resting-dock-height, 13.25rem) - min(48cqw, 42cqh) + var(--cast-depth, 0px)), 4cqh);
  left: calc(var(--cast-center) - var(--cast-display-width) / 2);
  bottom: var(--cast-lift); height: var(--cast-image-height); opacity: .72; z-index: 1;
}
${tag}[data-scene-keyboard] .${tag}-room-screen[data-mobile="true"] .${tag}-chat-stage .${tag}-chat-cast > .${tag}-chat-cast-person[data-sprite="true"] {
  /* Keep faces in the visible strip while preserving the art and background scale. */
  bottom: max(var(--cast-lift), calc(var(--villages-scene-dock-bottom, 0px) + var(--villages-scene-stage-offset, 0px) - var(--cast-image-height) + 8rem));
}
.${tag}-room-screen[data-mobile="true"] .${tag}-chat-stage .${tag}-chat-cast > .${tag}-chat-cast-person[data-active="true"] { opacity: 1; z-index: 3; }
.${tag}-room-screen[data-mobile="true"] .${tag}-chat-cast-person[data-sprite="true"] > span:not(.${tag}-avatar) { display: none; }
.${tag}-room-screen[data-mobile="true"] .${tag}-chat-stage .${tag}-chat-cast > .${tag}-chat-cast-person[data-sprite="false"] {
  width: 80px; height: auto; bottom: auto; top: max(0px, calc(100% - var(--cast-image-height) - var(--cast-lift) + min(10.5cqw, 10cqh)));
  left: calc(var(--cast-center) - 40px); justify-content: flex-start; gap: .25rem;
}
.${tag}-room-screen[data-mobile="true"] .${tag}-chat-cast-person[data-sprite="false"] > .${tag}-avatar { width: 80px; height: 80px; box-sizing: border-box; flex: none; }
.${tag}-room-screen[data-mobile="true"] .${tag}-chat-cast-person[data-sprite="false"] > span:not(.${tag}-avatar) { position: static; max-width: 100%; white-space: normal; overflow-wrap: anywhere; text-align: center; font-size: .75rem; }
`;
