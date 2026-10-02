const tag = "marinara-capability-villages";

/** Package-owned presentation; Engine source and ordinary Home tabs stay intact. */
export const VILLAGES_SCENE_STYLES = `
[data-component="HomeBrowserHub"]:has(${tag}[data-scene-play]) .mari-home-browser-chrome { display: none; }
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
  padding: 0 .75rem max(.75rem, env(safe-area-inset-bottom)); gap: .5rem;
  border: 0; border-radius: 0; background: transparent; backdrop-filter: none; box-shadow: none;
}
${tag}[data-scene-keyboard] .${tag}-chat-vn { padding-bottom: .5rem; }
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
.${tag}-room-screen .${tag}-composer { border: 0; padding: 0; gap: .375rem; }
.${tag}-room-screen .${tag}-chat-input { padding: .375rem .5rem; gap: .25rem; }
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
.${tag}-saved-change-status { position: absolute; z-index: 20; top: 5.5rem; left: .75rem; right: .75rem; max-width: 36rem; max-height: max(2rem, calc(var(--villages-scene-visible-height, 100cqh) - 12rem)); overflow-y: auto; padding: .5rem .75rem; box-sizing: border-box; border: 1px solid var(--border); border-radius: .5rem; background: var(--popover); font-size: .75rem; }
.${tag}-saved-change-status summary { cursor: pointer; }
.${tag}-saved-change-status button { display: block; margin-top: .5rem; max-width: 100%; cursor: pointer; font: inherit; color: inherit; border: 1px solid var(--border); border-radius: .5rem; padding: .25rem .5rem; background: var(--secondary); }
@media (min-width: 768px) {
  .${tag}-room-screen .${tag}-chat-vn-row { padding: 1rem; gap: 1rem; }
  .${tag}-room-screen .${tag}-chat-input { padding: .625rem 1rem; gap: .5rem; }
}
.${tag}-room-screen[data-mobile="true"] .${tag}-chat-send,
.${tag}-room-screen[data-mobile="true"] .${tag}-room-mode-toggle { width: 2.25rem; height: 2.25rem; }
.${tag}-room-screen[data-mobile="true"] .${tag}-chat-vn-row { padding: .75rem; gap: .75rem; }
.${tag}-room-screen[data-mobile="true"] .${tag}-chat-input { padding: .375rem .5rem; gap: .25rem; }
/* 16px prevents mobile Safari zooming on focus; desktop uses Engine's 14px text. */
.${tag}-room-screen[data-mobile="true"] .${tag}-chat-input > .${tag}-textarea { font-size: 1rem; }
`;
