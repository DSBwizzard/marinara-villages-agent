import { STORYBOOK_DAY_PALETTE, STORYBOOK_NIGHT_PALETTE } from "../../shared/desk-styles.js";
const tag = "marinara-capability-villages";

/** Package-owned presentation; Engine source and ordinary Home tabs stay intact. */
export const VILLAGES_SCENE_STYLES = `
[data-component="HomeBrowserHub"]:has(${tag}) .mari-home-browser-chrome { display:none!important; }
[data-component="HomeBrowserHub"]:has(${tag}[data-scene-play]) [data-component="HomeBrowserHub.Content"] { overflow: hidden; }
${tag}[data-scene-play] { height: var(--villages-scene-canvas-height, 100%) !important; }
.${tag}-root.${tag}-room-screen { position: relative; }
.${tag}-room-time { display: block; overflow: hidden; text-overflow: ellipsis; font-size: .6875rem; opacity: .8; }
.${tag}-room-screen > .${tag}-room-error { position: absolute; z-index: 20; top: 3rem; left: .75rem; right: .75rem; max-height: max(3rem, calc(var(--villages-scene-visible-height, 100cqh) - 9rem)); overflow-y: auto; }
.${tag}-room-screen > .${tag}-chat { position: relative; flex: 1 0 100%; height: 100%; min-height: 0; }
.${tag}-room-screen > .${tag}-chat { overflow:clip; }
.${tag}-room-screen .${tag}-chat-stage {
  position: absolute; inset: 0; width: 100%; height: 100%; padding: 3rem .75rem 0;
  flex: none; transform: translateY(var(--villages-scene-stage-offset, 0px));
}
/* Crowded slots set the centers, while full-body art can extend beyond them. */
.${tag}-room-screen:not([data-mobile="true"]) .${tag}-chat-cast-person > img:not([data-framing="half"]) { min-width: 25cqw; }
.${tag}-room-screen .${tag}-chat-scene { transform: translateY(var(--villages-scene-stage-offset, 0px)); }
.${tag}-room-screen .${tag}-chat-vn {
  position: absolute; z-index: 10; left: 50%; bottom: var(--villages-scene-dock-bottom, 0px);
  transform: translateX(-50%); width: min(58rem, calc(100% - 1.25rem)); margin: 0;
  padding: .5rem; gap: .375rem;
  border: 1px solid var(--border); border-radius: 1rem; background: var(--secondary); box-shadow: 0 .25rem .75rem #0003;
}
${tag}[data-scene-keyboard] .${tag}-chat-vn { padding-bottom: 0; }
.${tag}-room-screen .${tag}-chat-vn[hidden] { display: none; }
.${tag}-room-screen img[data-npc-sprite] { object-fit:contain; opacity:.78; filter:none; background:transparent; border:0; border-radius:0; box-shadow:none; }
.${tag}-room-screen .${tag}-chat-log {
  position: absolute; z-index:2; inset: 0 0 3.5rem; overflow:hidden; background:var(--popover); border:1px solid var(--border); border-radius:1rem; padding:.375rem .5rem; max-height: min(55cqh, max(3rem, calc(var(--villages-scene-visible-height, 100cqh) - 10rem)));
}
.${tag}-scene-history { display:flex; flex-direction:column; flex:1; min-height:0; min-width:0; }
.${tag}-scene-history-pages { display:flex; flex:none; align-items:center; gap:.25rem; padding-bottom:.25rem; border-bottom:1px solid var(--border); }
.${tag}-scene-history-pages .${tag}-chat-vn-button { justify-content:center; min-height:32px; min-width:32px; padding:0; color:var(--foreground); }
.${tag}-scene-history-pages .${tag}-scene-history-close { margin-left:auto; }
.${tag}-scene-history-pages svg { width:18px; height:18px; }
.${tag}-scene-history-body { flex:1; min-height:0; overflow-y:auto; overflow-x:hidden; overscroll-behavior:contain; padding-top:.375rem; }
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
.villages-founding-dialog.villages-scene-move { width:min(24rem,calc(100vw - 2rem)); height:fit-content; padding:.5rem; }
.villages-scene-move > header { margin:0; padding:.3rem .5rem; }
.villages-scene-move .villages-founding-editor-body { display:grid; gap:.45rem; padding:.75rem; }
.villages-scene-move .villages-founding-editor-body p { margin:0 0 .2rem; }
.villages-scene-move .villages-founding-editor-body button { width:100%; text-align:left; min-height:44px; }
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
  .${tag}-room-screen .${tag}-chat-input { padding: .375rem .75rem; gap: .5rem; }
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

.${tag}-chat-keyboard-done { display: none; }
.${tag}-room-screen[data-mobile="true"] .${tag}-chat-vn { padding:.5rem; gap:.375rem; }
${tag}[data-scene-keyboard] .${tag}-room-screen[data-mobile="true"] .${tag}-chat-vn:has(.${tag}-composer)
  > :is(.${tag}-chat-log, .${tag}-chat-vn-card, .${tag}-scene-dock-tools) { display: none; }
${tag}[data-scene-keyboard] .${tag}-room-screen[data-mobile="true"] .${tag}-composer-row { flex-wrap: nowrap; gap: .375rem; }
${tag}[data-scene-keyboard] .${tag}-room-screen[data-mobile="true"] .${tag}-chat-keyboard-done {
  display: block; flex: 0 0 auto; min-height: 44px; min-width: 44px; padding: 0 .625rem;
  border: 1px solid var(--border); border-radius: .75rem; font: inherit; font-size: .8125rem;
  color: var(--foreground); background: var(--popover); cursor: pointer;
}
/* Large artwork overlaps inside stable left/right groups, with a shared raised floor. */
.${tag}-room-screen[data-mobile="true"] .${tag}-chat-stage { padding-left: 0; padding-right: 0; }
.${tag}-room-screen[data-mobile="true"] .${tag}-chat-stage .${tag}-chat-cast > .${tag}-chat-cast-person[data-character-id] {
  --cast-image-height: min(120cqw, 68cqh);
  --cast-lift: clamp(0px, calc(var(--villages-scene-resting-dock-height, 13.25rem) - min(30cqw, 17cqh) + var(--cast-depth, 0px)), 20cqh);
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


/* Scene controls share the Village palette; empty daytime stages keep their blue sky. */
.${tag}-room-screen[data-reader-theme=night] { ${STORYBOOK_NIGHT_PALETTE} }
.${tag}-room-screen[data-reader-theme=day] {
  ${STORYBOOK_DAY_PALETTE}
  --popover:#f7f8f5; --secondary:#e0e6e1; --foreground:#213e36; --muted-foreground:#526b61;
}
.${tag}-room-screen[data-reader-theme=day] .${tag}-chat-scene { background:var(--background); }
.${tag}-room-screen .${tag}-chat-head { display:grid; grid-template-columns:minmax(0,1fr) auto; grid-template-rows:auto auto; align-items:start; gap:.5rem; }
.${tag}-room-screen .${tag}-room-place { grid-column:1; max-width:min(18rem,100%); justify-self:start; }
.${tag}-room-screen .${tag}-chat-actions { grid-column:2; grid-row:1; }
.${tag}-room-screen .${tag}-scene-notice-chips { grid-column:1; grid-row:2; flex-wrap:wrap; }
.${tag}-room-screen .${tag}-room-place,
.${tag}-room-screen .${tag}-room-actions-trigger,
.${tag}-room-screen .${tag}-room-notices-trigger { background:var(--popover); }
.${tag}-room-screen .${tag}-room-actions-trigger { width:44px; height:44px; }
.${tag}-room-screen .${tag}-room-actions-menu {
  display:grid; grid-template-columns:44px; width:auto; gap:.25rem; padding:.375rem;
  background:transparent; border:0; box-shadow:none; overflow-y:auto; max-height:max(3rem,calc(var(--villages-scene-visible-height,100cqh) - 4.5rem));
}
.${tag}-room-screen .${tag}-room-actions-menu button {
  display:grid; place-items:center; width:44px; min-width:44px; box-sizing:border-box; height:44px; padding:.6rem;
  background:var(--popover); border:1px solid var(--border); border-radius:.75rem;
  box-shadow:0 .15rem .4rem #0002; animation:villages-scene-action-in .16s both;
}
.${tag}-room-screen .${tag}-room-actions-menu button:disabled { opacity:1; color:var(--muted-foreground); }
.${tag}-room-actions-menu button:nth-child(2) { animation-delay:20ms; }
.${tag}-room-actions-menu button:nth-child(3) { animation-delay:40ms; }
.${tag}-room-actions-menu button:nth-child(4) { animation-delay:60ms; }
.${tag}-room-actions-menu button:nth-child(5) { animation-delay:80ms; }
.${tag}-room-actions-menu button:nth-child(6) { animation-delay:100ms; }
.${tag}-room-actions-menu button:nth-child(7) { animation-delay:120ms; }
.${tag}-room-actions-menu button:nth-child(8) { animation-delay:140ms; }
.${tag}-room-actions-menu button:nth-child(9) { animation-delay:160ms; }
@keyframes villages-scene-action-in { from { opacity:0; transform:translateX(-12px); } to { opacity:1; transform:translateX(0); } }
@media(prefers-reduced-motion:reduce) {
  .${tag}-room-screen .${tag}-room-actions-menu button { animation:none; }
  .${tag}-room-screen .${tag}-chat-cast-person { transition:none!important; }
}
.${tag}-room-screen[data-mobile=true] .${tag}-room-actions-menu { grid-template-columns:repeat(3,44px); }
.${tag}-room-screen .${tag}-room-actions-menu svg,
.${tag}-scene-dock-tools svg { width:20px; height:20px; }
.${tag}-room-screen .villages-dialogue-reader {
  background:var(--popover); color:var(--foreground); border:0; border-radius:.75rem; box-shadow:none;
}
.${tag}-room-screen .villages-dialogue-reader[aria-hidden=true] { visibility:hidden; }
.${tag}-room-screen .villages-dialogue-reader .${tag}-chat-vn-row { display:block; padding:.625rem .75rem; height:auto; box-sizing:content-box; }
.${tag}-room-screen .villages-dialogue-reader .${tag}-chat-vn-reading {
  height:auto; min-height:0; max-height:var(--villages-reading-page-height,7.5rem);
  overflow:hidden; padding-right:.25rem; font-size:1rem; line-height:1.5;
}
.${tag}-room-screen .${tag}-chat-vn-reading :is(.${tag}-chat-vn-text,.${tag}-chat-vn-beat) { margin:0; font-size:inherit; line-height:inherit; }
.${tag}-room-screen .villages-reader-icon .${tag}-chat-vn-portrait { width:28px; height:28px; border-radius:.4rem; flex:none; }
.${tag}-scene-dock-tools { display:flex; align-items:center; gap:.375rem; }
.${tag}-scene-dock-tools button { display:inline-flex; align-items:center; justify-content:center; gap:.375rem; min-height:36px; min-width:36px; padding:.375rem .65rem; border:1px solid var(--border); border-radius:.6rem; color:var(--foreground); background:var(--popover); font:inherit; font-size:.8125rem; cursor:pointer; }
.${tag}-scene-dock-tools .${tag}-scene-move-trigger { margin-right:auto; }
.${tag}-scene-dock-tools .${tag}-chat-vn-button { background:var(--primary); color:var(--primary-foreground); font-weight:600; }
.${tag}-scene-dock-tools button:disabled { opacity:.45; cursor:default; }
.${tag}-scene-dock-tools button:focus-visible { outline:2px solid var(--primary); outline-offset:2px; }
.${tag}-room-screen .${tag}-chat-input { background:var(--popover); box-shadow:none; border:1px solid var(--border); border-radius:.75rem; }
.${tag}-room-screen .${tag}-chat-input:has(textarea:focus) { outline:2px solid var(--primary); outline-offset:1px; }
.${tag}-room-screen .${tag}-chat-input textarea:disabled { opacity:.55; }
.${tag}-room-screen[data-mobile=true] .${tag}-scene-dock-tools button { min-height:44px; min-width:44px; }
`;
