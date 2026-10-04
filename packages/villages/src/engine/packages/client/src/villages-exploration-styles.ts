const P = "marinara-capability-villages";

export const EXPLORATION_STYLES = `

/* Exploration is scoped to Villages home and Noticeboard, never the Engine shell. */
.${P}-home-full, .${P}-sectioned-menu[data-page="noticeboard"] {
  --explore-background: #29251f;
  --explore-surface: #37352b;
  --explore-panel: #29251ffb;
  --explore-text: #f2e9d8;
  --explore-muted: #c4c9aa;
  --explore-selected: #eadcc0;
  --explore-border: #71664f;
  --explore-hover: #494535;
  --explore-paper: #faf4e7;
  --explore-ink: #30261c;
  --explore-empty: #201e29;
  --explore-shadow: #17120c70;
  --explore-photo-shadow: #0009;
  --explore-radius: 8px;
  --background: var(--explore-background);
  --foreground: var(--explore-text);
  --popover: var(--explore-surface);
  --secondary: var(--explore-surface);
  --primary: var(--explore-selected);
  --muted-foreground: var(--explore-muted);
  --border: var(--explore-border);
  background: var(--explore-background); color: var(--explore-text);
}
.${P}-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }
.${P}-home-full[data-mobile="true"] { --${P}-map-wood: 4px; --${P}-map-mat: 0px; padding: 0; gap: 0; background: var(--explore-background); color: var(--explore-text); }
.${P}-explore-notices { display: inline-flex; align-items: center; gap: 4px; min-height: 44px; border: 0; border-radius: 8px; background: var(--explore-surface); color: var(--explore-text); padding: 0 8px; font-size: 12px; cursor: pointer; }
.${P}-explore-notices svg { width: 18px; height: 18px; }
.${P}-home-full[data-mobile="true"] .${P}-room { margin: 4px; }
.${P}-explore-nav { display: flex; flex: 0 0 auto; min-height: 56px; padding-bottom: env(safe-area-inset-bottom, 0px); border-top: 1px solid var(--explore-border); background: var(--explore-background); }
.${P}-explore-nav button { flex: 1; min-width: 0; min-height: 56px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; border: 0; border-top: 3px solid transparent; background: transparent; color: var(--explore-muted); font: inherit; font-size: 12px; cursor: pointer; }
.${P}-explore-nav svg { width: 23px; height: 23px; }
.${P}-explore-anchor { position: absolute; width: 0; height: 0; z-index: 2; }
.${P}-explore-anchor:has([data-selected="true"]) { z-index: 3; }
.${P}-home-full[data-mobile="true"] .${P}-stage .${P}-explore-marker.${P}-pin { position: absolute; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 64px; height: 76px; min-width: 48px; min-height: 48px; max-width: none; box-sizing: border-box; left: 0; top: 0; transform: translate(-50%, -50%); background: transparent; color: var(--explore-text); border: 0; padding: 0; box-shadow: none; gap: 2px; cursor: pointer; z-index: 2; overflow: visible; }
.${P}-explore-photo { display: grid; place-items: center; flex: 0 0 40px; width: 40px; height: 40px; border: 2px solid var(--explore-paper); box-sizing: border-box; border-radius: 5px; background: var(--explore-surface); color: var(--explore-muted); overflow: hidden; }
.${P}-explore-photo img { display: block; width: 100%; height: 100%; object-fit: contain; }
.${P}-explore-photo svg { width: 24px; height: 24px; }
.${P}-explore-face { position: relative; display: grid; place-items: center; flex: 0 0 auto; width: 36px; height: 36px; min-width: 36px; max-width: 36px; min-height: 36px; max-height: 36px; border-radius: 50%; border: 2px solid var(--explore-paper); background: var(--explore-surface); overflow: hidden; box-sizing: border-box; color: var(--explore-text); }
.${P}-explore-face img { display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-home-full[data-mobile="true"] .${P}-stage .${P}-explore-polaroid.${P}-pin-photo-card { width: 56px; flex: 0 0 auto; padding: 3px; gap: 2px; box-sizing: border-box; border: 1px solid var(--explore-border); border-radius: 2px; background: var(--explore-paper); color: var(--explore-ink); box-shadow: 0 3px 8px var(--explore-photo-shadow); transform: none; transition: none; }
.${P}-home-full[data-mobile="true"] .${P}-stage .${P}-explore-polaroid .${P}-pin-photo { position: relative; display: grid; place-items: center; width: 100%; aspect-ratio: 1 / 1; background: var(--explore-empty); overflow: visible; }
.${P}-home-full[data-mobile="true"] .${P}-stage .${P}-explore-polaroid .${P}-pin-photo img { position: absolute; inset: 0; display: block; width: 100%; height: 100%; object-fit: contain; }
.${P}-explore-polaroid .${P}-pin-photo svg { width: 24px; height: 24px; color: var(--explore-muted); }
.${P}-home-full[data-mobile="true"] .${P}-stage .${P}-explore-polaroid .${P}-pin-name { display: block; width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 10px; font-weight: 600; line-height: 12px; color: var(--explore-ink); }
.${P}-home-full[data-mobile="true"] .${P}-stage .${P}-explore-marker[data-selected="true"] .${P}-explore-polaroid.${P}-pin-photo-card { box-shadow: 0 0 0 2px var(--explore-selected), 0 3px 8px var(--explore-photo-shadow); }
.${P}-explore-initials { position: absolute; top: 100%; left: 50%; transform: translateX(-50%); display: flex; gap: 2px; pointer-events: none; }
.${P}-explore-initial { display: grid; place-items: center; width: 14px; height: 14px; flex: 0 0 auto; box-sizing: border-box; border: 1px solid var(--explore-muted); border-radius: 50%; background: var(--explore-surface); color: var(--explore-text); font-size: 9px; line-height: 1; font-weight: 600; }
.${P}-explore-sheet { position: absolute; z-index: 20; bottom: 0; left: 0; right: 0; display: flex; flex-direction: column; max-height: 82%; border: 1px solid var(--explore-border); border-radius: 16px 16px 5px 5px; background: var(--explore-panel); color: var(--explore-text); box-shadow: 0 -6px 24px var(--explore-shadow); overflow: hidden; }
.${P}-explore-sheet header { flex: 0 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 6px 8px 0 12px; }
.${P}-explore-sheet h2 { margin: 0; font-size: 18px; line-height: 1.3; overflow-wrap: anywhere; max-height: 3.9em; overflow-y: auto; }
.${P}-explore-sheet header button { flex: 0 0 48px; height: 48px; border: 0; background: transparent; color: var(--explore-text); cursor: pointer; }
.${P}-explore-sheet header svg { width: 24px; height: 24px; }
.${P}-explore-search { flex: 0 0 auto; padding: 4px 12px 8px; }
.${P}-explore-search input { width: 100%; box-sizing: border-box; min-height: 48px; border: 1px solid var(--explore-border); border-radius: var(--explore-radius); background: var(--explore-surface); color: var(--explore-text); padding: 8px; font: inherit; font-size: 16px; }
.${P}-explore-search input::placeholder { color: var(--explore-muted); }
.${P}-explore-list { min-height: 0; overflow-y: auto; overscroll-behavior: contain; touch-action: pan-y; padding: 0 12px 10px; }
.${P}-explore-row { box-sizing: border-box; min-width: 0; display: flex; align-items: center; gap: 10px; width: 100%; min-height: 60px; padding: 8px 0; border: 0; border-bottom: 1px solid var(--explore-border); background: transparent; color: var(--explore-text); text-align: left; font: inherit; cursor: pointer; }
.${P}-explore-row > span:last-child { min-width: 0; flex: 1; }
.${P}-explore-row strong, .${P}-explore-row small { display: block; overflow-wrap: anywhere; }
.${P}-explore-row strong { font-size: 14px; }
.${P}-explore-row small { color: var(--explore-muted); font-size: 12px; margin-top: 3px; }
.${P}-explore-row:disabled { cursor: default; color: var(--explore-muted); }
.${P}-explore-empty { color: var(--explore-muted); font-size: 14px; padding: 12px 0; }
.${P}-explore-preview { min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 0 12px 12px; }
.${P}-explore-preview-detail { display: flex; align-items: center; gap: 10px; margin: 4px 0 12px; font-size: 13px; color: var(--explore-muted); }
.${P}-explore-preview-detail .${P}-explore-photo { width: 56px; height: 56px; flex-basis: 56px; }
.${P}-explore-preview-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.${P}-explore-preview-actions button { flex: 1 1 100px; min-height: 48px; display: flex; align-items: center; justify-content: center; gap: 6px; border: 1px solid var(--explore-border); border-radius: var(--explore-radius); background: var(--explore-surface); color: var(--explore-text); font: inherit; font-size: 14px; cursor: pointer; }
.${P}-explore-preview-actions button[data-primary="true"] { background: var(--explore-selected); border-color: var(--explore-selected); }
.${P}-explore-preview-actions svg { width: 22px; height: 22px; }
.${P}-explore-sheet h2:focus { outline: none; }
.${P}-mobile-events-page .${P}-news-panel { position: static; width: auto; max-height: none; box-shadow: none; }
.${P}-explore-nav { position: relative; z-index: 30; transform: translateY(calc(-1 * var(--villages-exploration-inset, 0px))); }
.${P}-explore-sheet { bottom: var(--villages-exploration-inset, 0px); max-height: max(0px, calc(82% - var(--villages-exploration-inset, 0px))); }
@container (max-height: 350px) {
 .${P}-explore-sheet { max-height: max(0px, calc(100% - var(--villages-exploration-inset, 0px))); }
  .${P}-explore-preview-detail { display: none; }
}

/* Keep package icons on their control's text color above the host's animated SVG accent rule. */
.${P}-home-full .${P}-home-bar .${P}-icon-button svg, .${P}-home-full .${P}-explore-nav button svg, .${P}-home-full button.${P}-explore-notices svg, .${P}-home-full .${P}-explore-sheet button svg, .${P}-home-full .${P}-explore-sheet .${P}-explore-photo svg { color: inherit; }
/* One visual language; only placement and control density change with layout. */
.${P}-home-full .${P}-home-bar { min-height: 48px; padding: 0; gap: 8px; }
.${P}-home-full .${P}-mobile-datetime { border: 0; background: transparent; color: var(--explore-text); padding: 0; gap: 6px; }
.${P}-home-full .${P}-mobile-clock { flex-direction: row; gap: 6px; font-size: .8125rem; line-height: 1.2; }
.${P}-home-full .${P}-mobile-clock strong::before { content: "· "; font-weight: 400; }
.${P}-home-full .${P}-home-bar .${P}-button, .${P}-explore-notices { border: 1px solid var(--explore-border); border-radius: var(--explore-radius); background: var(--explore-surface); color: var(--explore-text); min-height: 40px; font: inherit; font-size: .8125rem; }
.${P}-explore-badge { display: grid; place-items: center; min-width: 20px; height: 20px; padding: 0 3px; box-sizing: border-box; border: 1px solid var(--explore-border); border-radius: 50%; font-size: .75rem; font-variant-numeric: tabular-nums; }
.${P}-home-full[data-mobile="false"] .${P}-explore-nav { min-height: 40px; padding: 0; border: 1px solid var(--explore-border); border-radius: var(--explore-radius); transform: none; }
.${P}-home-full[data-mobile="false"] .${P}-explore-nav button { flex: 0 1 auto; flex-direction: row; min-height: 40px; gap: 6px; padding: 0 12px; border: 0; border-radius: 6px; font-size: .8125rem; }
.${P}-explore-nav button[aria-pressed="true"] { background: var(--explore-selected); color: var(--explore-ink); border-top-color: var(--explore-selected); }
.${P}-home-full[data-mobile="true"] .${P}-home-bar { padding: 0 8px; min-height: 52px; }
.${P}-home-full[data-mobile="true"] .${P}-explore-notices { min-height: 48px; }
.${P}-home-full[data-mobile="true"] .${P}-mobile-clock { font-size: clamp(11px, 3.1cqw, 14px); }
.${P}-explore-sheet[data-layout="side"] { top: 8px; right: 8px; bottom: 8px; left: auto; width: min(360px, calc(100% - 16px)); max-height: none; border-radius: var(--explore-radius); box-shadow: -6px 0 24px var(--explore-shadow); }
.${P}-explore-preview-actions button[data-primary="true"] { color: var(--explore-ink); }
.${P}-home-full button:disabled, .${P}-sectioned-menu[data-page="noticeboard"] button:disabled { opacity: .55; cursor: default; }
.${P}-home-full button:focus-visible, .${P}-explore-sheet input:focus-visible, .${P}-sectioned-menu[data-page="noticeboard"] :is(button, input):focus-visible { outline: 3px solid var(--explore-selected); outline-offset: -3px; }
.${P}-home-full .${P}-pin[data-selected="true"] .${P}-pin-photo-card { box-shadow: 0 0 0 2px var(--explore-selected), 0 3px 8px var(--explore-photo-shadow); }
@media (hover: hover) {
 .${P}-explore-nav button:not(:disabled):not([aria-pressed="true"]):hover, .${P}-explore-row:not(:disabled):hover, .${P}-explore-notices:not(:disabled):hover, .${P}-explore-preview-actions button:not(:disabled):not([data-primary="true"]):hover { background: var(--explore-hover); }
}
@container (min-width: 705px) and (max-width: 1000px) {
 .${P}-home-full[data-mobile="false"] .${P}-explore-nav button { padding: 0 8px; gap: 4px; }
 .${P}-home-full[data-mobile="false"] .${P}-explore-nav svg { width: 18px; height: 18px; }
 .${P}-home-full[data-mobile="false"] .${P}-mobile-clock { flex-direction: column; font-size: .75rem; }
 .${P}-home-full[data-mobile="false"] .${P}-mobile-clock strong::before { content: ""; }
}
.${P}-sectioned-menu[data-page="noticeboard"] :is(.${P}-button, .${P}-notice-input) { background: var(--explore-surface); color: var(--explore-text); border-color: var(--explore-border); border-radius: var(--explore-radius); min-height: 48px; }
`;
