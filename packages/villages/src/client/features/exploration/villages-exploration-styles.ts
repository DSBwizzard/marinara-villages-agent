const P = "marinara-capability-villages";

export const EXPLORATION_STYLES = `
/* The play surface owns its palette; the People journal and Engine keep theirs. */
.${P}-home-full {
  --explore-background:#111720; --explore-surface:#19212d; --explore-panel:#141b27;
  --explore-text:#edf0f5; --explore-muted:#a5afbf; --explore-selected:#a88aff;
  --explore-border:#343f51; --explore-hover:#232e40; --explore-ink:#171021;
  --explore-radius:7px; --background:var(--explore-background); --foreground:var(--explore-text);
  --popover:var(--explore-surface); --secondary:var(--explore-surface); --primary:var(--explore-selected);
  --muted-foreground:var(--explore-muted); --border:var(--explore-border);
  background:var(--explore-background); color:var(--explore-text);
  padding:0; gap:0; overflow:hidden;
}
.${P}-sectioned-menu[data-page="noticeboard"] {
  --explore-background:#29251f; --explore-surface:#37352b; --explore-text:#f2e9d8;
  --explore-muted:#c4c9aa; --explore-selected:#eadcc0; --explore-border:#71664f;
  --explore-radius:8px; background:var(--explore-background); color:var(--explore-text);
}
.${P}-sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap; border:0; }
.${P}-home-full .${P}-home-bar { min-height:48px; padding:4px 12px; gap:10px; border-bottom:1px solid var(--explore-border); background:var(--explore-background); }
.${P}-map-identity { display:flex; align-items:center; gap:12px; min-width:0; max-width:42%; }
.${P}-map-identity>strong { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:14px; }
.${P}-home-full .${P}-mobile-datetime { border:0; background:transparent; color:var(--explore-muted); padding:0; gap:5px; }
.${P}-home-full .${P}-mobile-clock { flex-direction:row; gap:5px; font-size:12px; line-height:1.2; }
.${P}-home-full .${P}-mobile-clock strong::before { content:"· "; font-weight:400; }
.${P}-home-full .${P}-home-bar .${P}-button, .${P}-explore-notices { border:1px solid var(--explore-border); border-radius:var(--explore-radius); background:var(--explore-surface); color:var(--explore-text); min-height:40px; font:inherit; font-size:13px; }
.${P}-explore-notices { display:inline-flex; align-items:center; gap:6px; padding:0 10px; cursor:pointer; }
.${P}-explore-notices svg { width:18px; height:18px; }
.${P}-explore-badge { display:grid; place-items:center; min-width:20px; height:20px; padding:0 3px; box-sizing:border-box; border:1px solid var(--explore-border); border-radius:50%; font-size:12px; }
.${P}-explore-nav { display:flex; flex:0 0 auto; min-height:56px; padding:0; border-top:1px solid var(--explore-border); background:var(--explore-background); }
.${P}-explore-nav button { flex:1; min-width:0; min-height:56px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px; border:0; border-top:3px solid transparent; background:transparent; color:var(--explore-muted); font:inherit; font-size:12px; cursor:pointer; }
.${P}-explore-nav svg { width:22px; height:22px; }
.${P}-explore-nav button[aria-pressed="true"] { color:var(--explore-selected); border-top-color:var(--explore-selected); background:#a88aff0d; }
.${P}-home-full[data-mobile="false"] .${P}-explore-nav { min-height:40px; padding:0; border:0; }
.${P}-home-full[data-mobile="false"] .${P}-explore-nav button { flex:0 1 auto; flex-direction:row; min-height:40px; gap:6px; padding:0 10px; border-top:0; border-bottom:2px solid transparent; font-size:13px; }
.${P}-home-full[data-mobile="false"] .${P}-explore-nav button[aria-pressed="true"] { border-bottom-color:var(--explore-selected); }
.${P}-home-full .${P}-room { display:flex; align-items:stretch; justify-content:flex-start; padding:0; gap:0; margin:0; overflow:hidden; }
.${P}-home-full .${P}-home-map-viewport { flex:1 1 auto; width:auto; min-width:0; height:100%; overflow:hidden; }
.${P}-home-full .${P}-stage[data-exploration="true"] { flex:1; display:block; width:100%!important; height:100%!important; aspect-ratio:auto!important; border:0; border-radius:0; touch-action:none; user-select:none; }
.${P}-stage[data-exploration="true"] .${P}-canvas { overflow:clip; cursor:grab; }
.${P}-stage[data-exploration="true"][data-mobile-gesturing="true"] .${P}-canvas { cursor:grabbing; }
.${P}-stage[data-exploration="true"] .${P}-canvas-img { max-width:none; max-height:none; pointer-events:none; }
.${P}-explore-anchor { position:absolute; z-index:2; width:0; height:0; }
.${P}-explore-anchor:has([data-selected="true"]) { z-index:3; }
.${P}-home-full .${P}-stage[data-exploration="true"] .${P}-explore-marker.${P}-pin {
  position:absolute; left:0; top:0; transform:translate(-50%,-22px); display:flex; flex-direction:column;
  align-items:center; justify-content:flex-start; gap:4px; min-width:44px; min-height:44px; width:auto; height:auto;
  max-width:none; padding:0 6px 4px; border:0; border-radius:0; background:transparent; box-shadow:none;
  color:#f5f6fa; cursor:pointer; overflow:visible; white-space:nowrap;
}
.${P}-map-point { display:block; flex:none; margin-top:17.5px; width:9px; height:9px; border-radius:50%; background:#f5f6fa; box-shadow:0 0 0 3px #151b29b3; }
.${P}-map-label { display:block; max-width:180px; overflow:hidden; text-overflow:ellipsis; padding:4px 7px; border-radius:4px; background:#101721e8; font-family:inherit; font-weight:600; font-size:12px; line-height:1.3; text-align:center; }
.${P}-explore-marker[data-selected="true"] .${P}-map-point { width:12px; height:12px; margin-top:16px; background:var(--explore-selected); box-shadow:0 0 0 4px #a88aff40; }
.${P}-explore-marker[data-selected="true"] .${P}-map-label { border:1px solid var(--explore-selected); }
.${P}-map-camera-controls { display:flex; gap:2px; position:absolute; z-index:6; right:12px; bottom:12px; padding:3px; border:1px solid var(--explore-border); border-radius:7px; background:#111720ed; }
.${P}-map-camera-controls button { min-width:44px; min-height:44px; padding:6px 10px; border:0; border-radius:4px; background:transparent; color:var(--explore-text); font:inherit; cursor:pointer; }
.${P}-map-camera-controls button:first-child,.${P}-map-camera-controls button:last-child { font-size:22px; }
.${P}-location-navigator { display:flex; flex-direction:column; flex:0 0 clamp(210px,22%,260px); min-height:0; min-width:0; overflow:hidden; border:0; border-right:1px solid var(--explore-border); border-radius:0; background:var(--explore-panel); color:var(--explore-text); }
.${P}-location-navigator header { display:flex; flex:0 0 auto; align-items:center; justify-content:space-between; gap:8px; padding:8px 10px 2px 16px; }
.${P}-location-navigator h2 { margin:0; font-size:16px; }
.${P}-location-navigator header button { display:grid; place-items:center; width:44px; height:44px; border:0; border-radius:4px; background:transparent; color:var(--explore-muted); cursor:pointer; }
.${P}-location-navigator svg, .${P}-navigator-toggle svg { width:21px; height:21px; flex:none; }
.${P}-explore-search { display:block; flex:0 0 auto; padding:4px 12px 12px; }
.${P}-explore-search input { width:100%; box-sizing:border-box; min-height:44px; border:1px solid var(--explore-border); border-radius:var(--explore-radius); background:#0e141f; color:var(--explore-text); padding:8px 10px; font:inherit; font-size:16px; }
.${P}-explore-search input::placeholder { color:var(--explore-muted); }
.${P}-explore-list { min-height:0; overflow-y:auto; overscroll-behavior:contain; touch-action:pan-y; padding:0 0 10px; }
.${P}-navigator-place { border-left:3px solid transparent; border-bottom:1px solid #343f5170; }
.${P}-navigator-place[data-selected="true"] { border-left-color:var(--explore-selected); background:#a88aff1c; }
.${P}-explore-row { box-sizing:border-box; display:flex; align-items:center; gap:12px; width:100%; min-height:64px; padding:10px 12px; border:0; background:transparent; color:var(--explore-text); text-align:left; font:inherit; cursor:pointer; }
.${P}-explore-row>span { min-width:0; flex:1; }
.${P}-explore-row strong,.${P}-explore-row small { display:block; overflow-wrap:anywhere; }
.${P}-explore-row strong { font-size:14px; line-height:1.35; }
.${P}-explore-row small { color:var(--explore-muted); font-size:12px; margin-top:3px; }
.${P}-navigator-actions { display:flex; flex-wrap:wrap; gap:6px; padding:0 12px 12px 45px; }
.${P}-navigator-actions button,.${P}-navigator-toggle { min-height:44px; padding:8px 10px; border:1px solid var(--explore-border); border-radius:var(--explore-radius); background:var(--explore-surface); color:var(--explore-text); font:inherit; font-size:13px; cursor:pointer; }
.${P}-navigator-actions button:first-child { background:var(--explore-selected); border-color:var(--explore-selected); color:var(--explore-ink); }
.${P}-navigator-toggle { position:absolute; z-index:7; left:12px; top:12px; display:flex; align-items:center; gap:6px; }
.${P}-explore-empty { color:var(--explore-muted); font-size:14px; padding:12px; }
.${P}-home-full button:disabled { opacity:.5; cursor:default; }
.${P}-home-full :is(button,input,[tabindex]):focus-visible { outline:3px solid var(--explore-selected); outline-offset:-3px; }
.${P}-home-full button:hover:not(:disabled) { filter:brightness(1.12); }

/* Engine accent animations must not recolor map-control icons. */
.${P}-home-full :is(.${P}-home-bar,.${P}-explore-nav,.${P}-location-navigator,.${P}-navigator-toggle) svg { color:inherit; }
.${P}-home-full[data-mobile="true"] { padding:0; gap:0; }
.${P}-home-full[data-mobile="true"] .${P}-home-bar { min-height:52px; padding:4px 8px; }
.${P}-home-full[data-mobile="true"] .${P}-map-identity { flex-direction:column; align-items:flex-start; gap:2px; max-width:65%; }
.${P}-home-full[data-mobile="true"] .${P}-map-identity>strong { max-width:100%; font-size:13px; }
.${P}-home-full[data-mobile="true"] .${P}-mobile-clock { font-size:11px; }
.${P}-home-full[data-mobile="true"] .${P}-room { margin:0; padding:0 0 var(--villages-exploration-inset,0px); box-sizing:border-box; flex-direction:column; }
.${P}-home-full[data-mobile="true"] .${P}-home-map-viewport { width:100%; height:auto; min-height:0; flex:1 1 0; }
.${P}-home-full[data-mobile="true"] .${P}-map-label { max-width:140px; }
.${P}-location-navigator[data-layout="navigator-sheet"] { position:relative; order:2; z-index:8; flex:0 1 auto; width:100%; max-height:min(calc(55% + var(--villages-exploration-inset,0px)),25rem); border:1px solid var(--explore-border); border-radius:12px 12px 0 0; box-shadow:0 -5px 20px #0005; }
.${P}-home-full[data-mobile="true"] .${P}-explore-nav { position:relative; z-index:9; transform:translateY(calc(-1 * var(--villages-exploration-inset,0px))); }

@container (min-width:705px) and (max-width:1000px) {
  .${P}-home-full .${P}-map-identity { flex-direction:column; align-items:flex-start; gap:2px; }
  .${P}-home-full[data-mobile="false"] .${P}-explore-nav button { padding:0 7px; font-size:12px; }
}
.${P}-sectioned-menu[data-page="noticeboard"] :is(.${P}-button,.${P}-notice-input) { background:var(--explore-surface); color:var(--explore-text); border-color:var(--explore-border); border-radius:var(--explore-radius); min-height:48px; }
.${P}-maps-toolbar { display:flex; flex:none; align-items:center; gap:8px; min-height:50px; padding:4px 12px; border-bottom:1px solid var(--explore-border); background:var(--explore-panel); }
.${P}-maps-toolbar :is(button,select),.${P}-maps-overview button { min-height:44px; border:1px solid var(--explore-border); border-radius:7px; padding:8px 12px; background:var(--explore-surface); color:var(--explore-text); font:inherit; cursor:pointer; }
.${P}-maps-toolbar select { flex:1; min-width:0; max-width:320px; }
.${P}-maps-overview { flex:1; min-width:0; overflow:auto; padding:16px; }
.${P}-maps-heading { display:flex; align-items:center; justify-content:space-between; gap:12px; }
.${P}-maps-heading h2 { margin:0 0 12px; font-size:20px; }
.${P}-maps-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(min(240px,100%),1fr)); gap:16px; margin-top:12px; }
.${P}-maps-grid button { display:flex; flex-direction:column; align-items:stretch; text-align:left; padding:0; overflow:hidden; }
.${P}-maps-grid img { width:100%; aspect-ratio:16/9; object-fit:cover; }
.${P}-maps-grid strong { padding:12px 12px 4px; }
.${P}-maps-grid small { padding:0 12px 12px; color:var(--explore-muted); }
.${P}-maps-empty { position:absolute; top:16px; left:16px; padding:10px 14px; border-radius:7px; background:#141b27eb; color:#edf0f5; }
.${P}-maps-settings { margin:16px 0; }
.${P}-maps-saved-row { display:flex; align-items:center; gap:12px; border:1px solid var(--border); border-radius:8px; padding:10px; margin:10px 0; }
.${P}-maps-saved-row img { width:100px; height:64px; object-fit:cover; border-radius:4px; }
.${P}-maps-saved-row span { flex:1; min-width:0; overflow-wrap:anywhere; }
.${P}-maps-saved-row small { display:block; color:var(--muted-foreground); margin-top:4px; }
.${P}-maps-editor { padding:14px; border:1px solid var(--border); border-radius:8px; }
.${P}-maps-editor>label { display:block; margin:12px 0; }
.${P}-maps-editor :is(input:not([type=file]),textarea,select) { display:block; box-sizing:border-box; width:100%; min-height:44px; margin-top:5px; padding:9px; border:1px solid var(--border); border-radius:6px; background:var(--background); color:var(--foreground); font:inherit; }
.${P}-maps-editor input[type=file] { display:block; max-width:100%; }
.${P}-maps-editor .${P}-stage { width:100%!important; max-height:55vh; }
@container (max-width:500px) {
  .${P}-maps-toolbar { padding:4px 8px; gap:4px; flex-wrap:wrap; }
  .${P}-maps-toolbar select { max-width:none; }
  .${P}-maps-saved-row { flex-wrap:wrap; }
  .${P}-maps-saved-row img { width:72px; height:52px; }
}

`;
