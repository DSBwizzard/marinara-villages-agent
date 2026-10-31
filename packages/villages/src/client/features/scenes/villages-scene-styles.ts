const tag = "marinara-capability-villages";

/** Package-owned presentation; Engine source and ordinary Home tabs stay intact. */
export const VILLAGES_SCENE_STYLES = `
[data-component="HomeBrowserHub"]:has(${tag}[data-scene-play]) [data-component="HomeBrowserHub.Content"] { overflow: hidden; }
${tag}[data-scene-play] { height: var(--villages-scene-canvas-height, 100%) !important; }
.${tag}-root.${tag}-room-screen { position: relative; }
.${tag}-room-screen > .${tag}-room-error { position: absolute; z-index: 20; top: 3rem; left: .75rem; right: .75rem; max-height: max(3rem, calc(var(--villages-scene-visible-height, 100cqh) - 9rem)); overflow-y: auto; }
.${tag}-room-screen > .${tag}-chat { position: relative; flex: 1 0 100%; height: 100%; min-height: 0; }
.${tag}-room-screen .${tag}-chat-stage {
  position: absolute; inset: 0; width: 100%; height: 100%; padding: 3rem .75rem 0;
  flex: none; transform: translateY(var(--villages-scene-stage-offset, 0px));
}
.${tag}-room-screen .${tag}-chat-scene { transform: translateY(var(--villages-scene-stage-offset, 0px)); }
.${tag}-room-screen .${tag}-chat-vn {
  position: absolute; z-index: 10; left: 50%; bottom: var(--villages-scene-dock-bottom, 0px);
  transform: translateX(-50%); width: min(58rem, 100%); margin: 0;
  padding: 0 .75rem; gap: .5rem;
  border: 0; border-radius: 0; background: transparent; backdrop-filter: none; box-shadow: none;
}
${tag}[data-scene-keyboard] .${tag}-chat-vn { padding-bottom: 0; }
.${tag}-room-screen .${tag}-chat-tab { margin-bottom: -.5rem; }
.${tag}-room-screen .${tag}-chat-history-toggle {
  width: 2.5rem; height: 1.5rem; min-height: 0; padding: 0; align-self: auto;
  border: 1px solid var(--border); border-bottom: 0; border-radius: .5rem .5rem 0 0;
  background: var(--marinara-chat-chrome-panel-bg, var(--popover));
}
.${tag}-room-screen .${tag}-chat-history-toggle[aria-expanded="true"] { border-top: 0; border-bottom: 1px solid var(--border); border-radius: 0 0 .5rem .5rem; }
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
.${tag}-room-screen .${tag}-composer { border: 0; padding: 0; gap: .375rem; }
.${tag}-room-screen .${tag}-chat-input { padding: .375rem .5rem; gap: .25rem; }
.${tag}-room-screen .${tag}-chat-input:has(> .${tag}-attention-choice) { flex-wrap: wrap; }
.${tag}-attention-choice { display: flex; flex-wrap: wrap; align-items: center; gap: .375rem; flex-basis: 100%; order: -1; min-width: 0; padding: .25rem 0; }
.${tag}-attention-choice > small { flex-basis: 100%; font-size: .75rem; opacity: .8; }
.${tag}-attention-choice > span { flex-basis: 100%; font-size: .8rem; }
.${tag}-attention-choice > button { min-height: 44px; max-width: 100%; white-space: normal; overflow-wrap: anywhere; border: 1px solid var(--border); border-radius: .5rem; padding: .25rem .5rem; background: var(--secondary); color: inherit; }
.${tag}-room-screen .${tag}-chat-input > .${tag}-zone-navigation { flex: 1 1 0; min-width: 0; width: 100%; border: 0; padding: 0; background: transparent; font: inherit; color: inherit; }
.${tag}-room-screen .${tag}-chat-input > .${tag}-textarea {
  height: auto; min-height: 0; max-height: 12.5rem; padding: 0; font-size: .875rem; line-height: 1.5;
}
.${tag}-room-screen .${tag}-chat-input > .${tag}-textarea:focus,
.${tag}-room-screen .${tag}-chat-input > .${tag}-textarea:focus-visible { outline: none; box-shadow: none; border: 0; }
.${tag}-room-screen .${tag}-chat-send,
.${tag}-room-screen .${tag}-room-mode-toggle {
  width: 2rem; height: 2rem; min-width: 0; min-height: 0; padding: 0; border: 0; border-radius: .75rem;
  background: transparent; color: var(--foreground); font-weight: normal; touch-action: manipulation;
}
.${tag}-room-screen .${tag}-chat-send svg { width: .9375rem; height: .9375rem; }
.${tag}-room-screen .${tag}-room-mode-toggle svg { width: 1rem; height: 1rem; }
.${tag}-room-screen .${tag}-chat-send:hover:not(:disabled),
.${tag}-room-screen .${tag}-room-mode-toggle:hover { background: color-mix(in srgb, var(--foreground) 10%, transparent); color: var(--foreground); }
.${tag}-room-screen .${tag}-room-mode-menu { width: 10rem; max-height: max(3rem, calc(var(--villages-scene-visible-height, 100cqh) - 6rem)); overflow-y: auto; }
.${tag}-room-screen .${tag}-room-actions-menu { max-height: max(3rem, calc(var(--villages-scene-visible-height, 100cqh) - 4rem)); overflow-y: auto; }
.${tag}-room-screen .${tag}-chat-head:has(.${tag}-room-actions-menu) { z-index: 25; }
.${tag}-room-screen .${tag}-chat-vn-asides { z-index: 1; max-height: min(20cqh, max(2rem, calc(var(--villages-scene-visible-height, 100cqh) - 18rem))); }
.${tag}-scene-settings-backdrop { position: absolute; z-index: 30; inset: 0; height: var(--villages-scene-visible-height, 100%); display: grid; place-items: center; padding: .75rem; box-sizing: border-box; background: #0008; }
.${tag}-scene-settings { width: min(36rem, 100%); max-height: 100%; overflow-y: auto; padding: .75rem; box-sizing: border-box; border: 1px solid var(--border); border-radius: .75rem; background: var(--popover); }
.${tag}-scene-settings-head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.${tag}-scene-settings-head h2 { margin: 0 0 .75rem; font-size: 1rem; }
.${tag}-scene-settings button { cursor: pointer; font: inherit; color: inherit; border: 1px solid var(--border); border-radius: .5rem; padding: .25rem .5rem; background: var(--secondary); }
.${tag}-scene-settings .villages-decisions-control > [role="region"] { width: 100% !important; box-sizing: border-box; }

.${tag}-scene-notice-chips { position: absolute; top: 3.5rem; left: .75rem; right: .75rem; z-index: 20; display: flex; align-items: flex-start; gap: .5rem; pointer-events: none; }
.${tag}-scene-notice-chips > * { pointer-events: auto; }
.${tag}-room-screen .${tag}-scene-notice-chips .${tag}-room-notices { position: static; }
.${tag}-room-screen .${tag}-scene-notice-chips .${tag}-room-stars { top: calc(100% + .5rem); left: 0; right: auto; }
.${tag}-scene-error-trigger { display: flex; align-items: center; justify-content: center; gap: .4rem; min-height: 44px; min-width: 3.5rem; padding: .35rem .65rem; border: 1px solid var(--border); border-radius: 1.5rem; background: var(--popover); color: var(--foreground); font: inherit; font-size: .75rem; cursor: pointer; }
.${tag}-scene-error-trigger[aria-expanded="true"] { border-color: #ed6689; }
.${tag}-scene-errors[data-information] .${tag}-scene-error-trigger[aria-expanded="true"] { border-color: #75b7f5; }
.${tag}-scene-errors[data-information] .${tag}-scene-error-icon { background: #75b7f5; color: #102a43; }
.${tag}-scene-errors[data-information] .${tag}-scene-error-detail { padding-top: .75rem; }
.${tag}-scene-error-icon { display: inline-grid; place-items: center; flex: 0 0 auto; width: 1.2rem; height: 1.2rem; border-radius: 50%; background: #ed6689; color: #2c101a; font-weight: 750; font-size: .875rem; line-height: 1; }
.${tag}-scene-error-panel { position: absolute; top: calc(100% + .5rem); left: 0; width: min(26rem, 100%); max-height: max(5rem, calc(var(--villages-scene-visible-height, 100cqh) - 12rem)); overflow-y: auto; box-sizing: border-box; border: 1px solid var(--border); border-radius: .75rem; background: var(--popover); color: var(--foreground); box-shadow: 0 .75rem 2rem #0006; font-size: .8125rem; }
.${tag}-scene-error-head { display: flex; justify-content: space-between; align-items: center; gap: .5rem; padding: .25rem .75rem; border-bottom: 1px solid var(--border); }
.${tag}-scene-error-head h2 { margin: 0; font-size: .875rem; }
.${tag}-scene-error-head button { min-width: 44px; min-height: 44px; background: transparent; color: inherit; border: 0; font: inherit; cursor: pointer; }
.${tag}-scene-error-item + .${tag}-scene-error-item { border-top: 1px solid var(--border); }
.${tag}-scene-error-item summary { display: flex; align-items: center; gap: .5rem; padding: .75rem; min-height: 44px; box-sizing: border-box; list-style: none; cursor: pointer; }
.${tag}-scene-error-item summary::-webkit-details-marker { display: none; }
.${tag}-scene-error-item summary::after { content: "›"; margin-left: auto; }
.${tag}-scene-error-item[open] summary::after { transform: rotate(90deg); }
.${tag}-scene-error-detail { padding: 0 .75rem .75rem; overflow-wrap: anywhere; }
.${tag}-scene-error-detail p { margin: 0 0 .75rem; white-space: pre-wrap; }
.${tag}-scene-error-detail dl { margin: .75rem 0; font-size: .75rem; }
.${tag}-scene-error-detail dl > div { display: grid; grid-template-columns: 5rem minmax(0,1fr); gap: .5rem; margin: .35rem 0; }
.${tag}-scene-error-detail dt { color: var(--muted-foreground); }
.${tag}-scene-error-detail dd { margin: 0; white-space: pre-wrap; }
.${tag}-scene-error-detail button { min-height: 44px; max-width: 100%; padding: .35rem .5rem; margin-top: .35rem; background: var(--secondary); border: 1px solid var(--border); border-radius: .5rem; color: inherit; font: inherit; cursor: pointer; white-space: normal; overflow-wrap: anywhere; }
.${tag}-scene-error-actions { display: flex; flex-wrap: wrap; gap: .35rem; }
.${tag}-scene-error-trigger:focus-visible, .${tag}-scene-error-item summary:focus-visible, .${tag}-scene-error-panel button:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.${tag}-scene-modal-errors { position: relative; margin-bottom: .5rem; }
.${tag}-scene-modal-errors .${tag}-scene-error-panel { z-index: 40; }
.${tag}-spinoff-error-notice .${tag}-scene-error-panel { top: auto; bottom: calc(100% + .5rem); max-height: 50cqh; }
@media (min-width: 768px) {
  .${tag}-room-screen .${tag}-chat-vn-row { padding: 1rem; gap: 1rem; }
  .${tag}-room-screen .${tag}-chat-input { padding: .625rem 1rem; gap: .5rem; }
}
.${tag}-room-screen[data-mobile="true"] .${tag}-chat-send,
.${tag}-room-screen[data-mobile="true"] .${tag}-room-mode-toggle { width: 44px; height: 44px; }
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
.${tag}-dialogue-hide, .${tag}-dialogue-restore { display: none; }
.${tag}-room-screen[data-mobile="true"] .${tag}-chat-vn { padding: 0 .375rem; gap: .25rem; }
${tag}[data-scene-keyboard] .${tag}-room-screen[data-mobile="true"] .${tag}-chat-vn { padding-bottom: 0; }
.${tag}-room-screen[data-mobile="true"] .${tag}-chat-tab { position: absolute; bottom: 100%; left: calc(50% - 22px); margin: 0; }
.${tag}-room-screen[data-mobile="true"] .${tag}-chat-history-toggle { width: 44px; }
.${tag}-room-screen[data-mobile="true"] .${tag}-chat-vn-row { display: grid; grid-template-columns: 2rem minmax(0, 1fr); align-items: center; padding: .5rem .625rem; gap: .375rem .5rem; }
.${tag}-room-screen[data-mobile="true"] .${tag}-chat-vn-portrait { width: 32px; height: 32px; box-sizing: border-box; border-radius: .375rem; }
.${tag}-room-screen[data-mobile="true"] .${tag}-chat-vn-column { display: contents; }
.${tag}-room-screen[data-mobile="true"] .${tag}-chat-vn-name,
.${tag}-room-screen[data-mobile="true"] .${tag}-chat-vn-label { grid-column: 2; align-self: center; }
.${tag}-room-screen[data-mobile="true"] .${tag}-chat-vn-reading { grid-column: 1 / -1; width: 100%; box-sizing: border-box; min-height: 0; max-height: min(var(--villages-reading-page-height, 3.9375rem), max(1.3125rem, calc(var(--villages-scene-visible-height, 100cqh) - 10.5rem))); }
.${tag}-room-screen[data-mobile="true"] .${tag}-room-panel-tools { padding: 0 .375rem; gap: .125rem; align-items: center; }
.${tag}-room-screen[data-mobile="true"] .${tag}-room-panel-tools .${tag}-chat-vn-button { min-height: 44px; min-width: 44px; padding: .25rem .375rem; }
.${tag}-room-screen[data-mobile="true"] .${tag}-room-place { max-width: calc(100% - 8rem); }
.${tag}-room-screen[data-mobile="true"] .${tag}-room-notices { top: .65rem; left: auto; right: 3.25rem; z-index: 7; }
.${tag}-room-screen[data-mobile="true"] .${tag}-room-stars { left: auto; right: 0; width: min(20rem, calc(100vw - 4rem)); }
.${tag}-room-screen[data-mobile="true"] .${tag}-chat-vn[data-dialogue-hidden="true"] { display: none; }
.${tag}-room-screen[data-mobile="true"] .${tag}-dialogue-hide,
.${tag}-room-screen[data-mobile="true"] .${tag}-dialogue-restore {
  display: block; min-height: 44px; padding: .25rem .625rem; border: 1px solid var(--border);
  border-radius: .5rem; font: inherit; font-size: .75rem; color: var(--foreground); background: var(--popover); cursor: pointer;
}
.${tag}-room-screen[data-mobile="true"] .${tag}-dialogue-hide { position: absolute; left: .5rem; bottom: 100%; }
.${tag}-room-screen[data-mobile="true"] .${tag}-dialogue-restore { position: absolute; right: .5rem; bottom: max(.375rem, env(safe-area-inset-bottom)); z-index: 10; }

/* Large artwork overlaps inside stable left/right groups, with a shared raised floor. */
.${tag}-room-screen[data-mobile="true"] .${tag}-chat-stage { padding-left: 0; padding-right: 0; }
.${tag}-room-screen[data-mobile="true"] .${tag}-chat-stage .${tag}-chat-cast > .${tag}-chat-cast-person[data-character-id] {
  --cast-image-height: min(105cqw, 100cqh);
  --cast-lift: min(max(0px, calc(var(--villages-scene-resting-dock-height, 13.25rem) - min(26.25cqw, 25cqh) + var(--cast-depth, 0px))), max(0px, calc(100cqh - var(--cast-image-height))));
  left: calc(var(--cast-center) - var(--cast-display-width) / 2);
  bottom: var(--cast-lift); height: var(--cast-image-height); opacity: .72; z-index: 1;
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
