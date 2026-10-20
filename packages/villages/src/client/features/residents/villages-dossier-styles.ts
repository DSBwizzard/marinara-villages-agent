import handwriting from "./art/kalam.js";

const P = "marinara-capability-villages";
const paper = `repeating-linear-gradient(0deg,transparent 0 35px,#b9925420 35px 36px),radial-gradient(ellipse at 25% 20%,#fffdf480,transparent 65%),linear-gradient(110deg,#f6e6c7,#fff3db 65%,#eed9b5)`;

/** Illustrated notebook styling stays local to Villagers, never Engine chrome. */
export const DOSSIER_STYLES = `
@font-face { font-family:Villages Notebook; src:url("${handwriting}") format("truetype"); font-weight:400; font-style:normal; font-display:swap; }
.${P}-dossier-root, .${P}-directory-root {
  --background:#f8edd7; --foreground:#30281f; --border:#c8b895; --muted-foreground:#6b5a49;
  --primary:#526951; --secondary:#ede1ca; --popover:#fff3dd;
  --dossier-paper:#fcf0d8; --dossier-ink:#30281f; --dossier-line:#c9ad7b60;
  --notebook-hand:"Villages Notebook","Segoe Print",cursive;
  box-sizing:border-box; color:var(--dossier-ink); background-color:#956142;
  background-image:repeating-linear-gradient(2deg,#47281718 0 2px,transparent 2px 13px),linear-gradient(100deg,#a37450,#895536);
  padding:clamp(8px,2vw,26px); gap:0; display:block; height:100%; min-height:0; overflow:auto;
  font-family:var(--notebook-hand); font-size:17px; line-height:1.5; position:relative; isolation:isolate;
}
.${P}-dossier-root::before, .${P}-directory-root::before { content:""; position:absolute; z-index:-1; inset:0 40% 0 -10%; transform:rotate(-5deg); background-color:#37658c; background-image:repeating-linear-gradient(0deg,transparent 0 27px,#e4f0fa40 27px 28px),repeating-linear-gradient(90deg,transparent 0 27px,#e4f0fa40 27px 28px); box-shadow:2px 4px 8px #39281b50; pointer-events:none; }
.${P}-dossier-root *, .${P}-directory-root * { box-sizing:border-box; }
.${P}-dossier-root button, .${P}-directory-root button, .${P}-dossier-root summary {
  font:inherit; color:var(--dossier-ink); min-height:44px; border:1px solid #c8b895; border-radius:4px;
  background:#fff5e3; padding:8px 12px; cursor:pointer; box-shadow:0 2px 3px #372c2012; white-space:normal; overflow-wrap:anywhere;
}
.${P}-dossier-root button:hover:not(:disabled), .${P}-directory-root button:hover:not(:disabled) { filter:brightness(.96); }
.${P}-dossier-root button:disabled, .${P}-directory-root button:disabled { opacity:.55; cursor:default; }
.${P}-dossier-root :is(button,input,textarea,select,summary,a,[tabindex]):focus-visible, .${P}-directory-root :is(button,input,select,summary,a):focus-visible { outline:3px solid #395d78; outline-offset:3px; }
.${P}-dossier-root :is(p,li,small), .${P}-directory-root p { line-height:1.55; overflow-wrap:anywhere; }
.${P}-dossier-root :is(h1,h2,h3,h4), .${P}-directory-root :is(h1,h2,h3) { color:var(--dossier-ink); font-family:var(--notebook-hand); font-weight:400; overflow-wrap:anywhere; }
.${P}-dossier-root :is(input,select,textarea), .${P}-directory-root input { color:var(--dossier-ink); background:#fff7e7; border:1px solid #b7a787; border-radius:4px; padding:9px; min-height:44px; max-width:100%; font:inherit; }
.${P}-dossier-desk { height:100%; min-height:0; display:flex; flex-direction:column; gap:12px; position:relative; max-width:1600px; margin:auto; }
.${P}-dossier-toolbar { min-height:44px; position:relative; z-index:8; pointer-events:none; display:flex; align-items:center; gap:12px; flex-wrap:wrap; flex:none; padding-right:110px; }
.${P}-dossier-toolbar > * { pointer-events:auto; }
.${P}-dossier-toolbar h1 { font-size:24px; line-height:1.2; margin:0; flex:1; min-width:0; color:#fff4de; text-shadow:0 1px 2px #302019; }
.${P}-dossier-back { margin:0; }
.${P}-dossier-management { margin-left:auto; position:relative; z-index:8; }
.${P}-dossier-management > summary { list-style:none; }
.${P}-dossier-controls { position:absolute; right:0; top:100%; margin-top:6px; width:min(520px,85vw); max-height:65vh; overflow:auto; display:flex; flex-wrap:wrap; gap:10px; padding:14px; border:1px solid #bba27a; background:#fff3dd; border-radius:6px; box-shadow:0 4px 16px #30201940; }
.${P}-description-editor { width:100%; min-width:0; }
.${P}-description-editor label, .${P}-description-editor textarea { display:block; width:100%; box-sizing:border-box; }
.${P}-description-editor textarea { resize:vertical; margin:6px 0; }
.${P}-dossier-controls > .${P}-row { flex-wrap:wrap; }
.${P}-dossier-controls details > button { display:block; margin-top:6px; }
.${P}-dossier-refresh { width:100%; border-top:1px solid var(--dossier-line); padding-top:10px; }
.${P}-dossier-book { --tab-width:108px; position:relative; flex:1; min-height:0; margin-right:var(--tab-width); display:grid; grid-template-columns:1fr 1fr; border:9px solid #303331; border-radius:22px; background:${paper}; box-shadow:0 0 0 2px #533c2b,0 5px 0 #593e29,0 9px 15px #30201460,inset 0 0 25px #b5935845; perspective:1600px; }
.${P}-dossier-book::before { content:""; pointer-events:none; position:absolute; z-index:1; inset:-5px; border:1px dashed #be8147; border-radius:17px; }
.${P}-dossier-book::after { content:""; position:absolute; z-index:1; left:50%; top:0; bottom:0; width:36px; transform:translateX(-50%); pointer-events:none; background:linear-gradient(90deg,transparent,#9b784136,#543c2850,#fff4d050,transparent); }
.${P}-dossier-rings { position:absolute; z-index:5; left:50%; top:5%; bottom:5%; width:42px; transform:translateX(-50%); display:flex; flex-direction:column; justify-content:space-between; pointer-events:none; }
.${P}-dossier-rings span { height:16px; width:42px; border-radius:9px; border:2px solid #563115; background:linear-gradient(#815022,#daa55b 34%,#fff0be 45%,#bd7b37 65%,#68401c); box-shadow:0 2px 2px #37241560; }
.${P}-dossier-identity { grid-column:1; grid-row:1; min-width:0; min-height:0; padding:28px 32px; overflow:auto; scrollbar-width:thin; }
.${P}-dossier-journal { width:100%; }
.${P}-dossier-journal-content { display:flex; flex-direction:column; gap:14px; }
.${P}-dossier-journal h1 { font-size:clamp(30px,3vw,52px); line-height:1.15; margin:0; }
.${P}-dossier-portrait { width:min(82%,360px); aspect-ratio:1; margin:0 auto 6px; padding:12px 12px 22px; background:#fff9e9; box-shadow:0 3px 9px #785a3540; }
.${P}-dossier-portrait .${P}-avatar { width:100%; height:100%; min-width:0; max-width:none; max-height:none; border:0; border-radius:0; background:#e5d8c2; font-size:65px; }
.${P}-dossier-portrait .${P}-avatar img { width:100%; height:100%; object-fit:cover; }
.${P}-dossier-biography { min-width:0; max-height:180px; overflow:auto; scrollbar-width:thin; }
.${P}-dossier-biography p { margin:0; font-size:clamp(17px,1.7vw,25px); line-height:1.5; }
.${P}-dossier-tags { display:flex; flex-wrap:wrap; gap:6px; margin-top:12px; }
.${P}-dossier-tags span { padding:2px 9px; background:#d5dfb8; border-radius:3px; font-size:13px; max-width:100%; overflow-wrap:anywhere; }
.${P}-dossier-tags span:nth-child(3n+2) { background:#e0c9e7; }
.${P}-signature { margin-top:16px; max-width:100%; color:#59434c; }
.${P}-signature-art { max-width:100%; width:240px; margin:auto; }
.${P}-signature-image { display:block; width:220px; max-width:100%; height:70px; object-fit:contain; }
.${P}-signature-name { display:block; font:italic 38px/1.4 var(--notebook-hand); overflow-wrap:anywhere; padding:4px 0; }
.${P}-signature-name[data-hand="bold"] { font-weight:700; }
.${P}-dossier-root .${P}-signature-flourish { display:block; width:100%; height:20px; fill:none; stroke:currentColor; stroke-width:1.6; stroke-linecap:round; }
.${P}-signature-controls { display:flex; flex-wrap:wrap; gap:8px; margin-top:8px; }
.${P}-dossier-root .${P}-signature-controls button, .${P}-signature > p { font-size:13px; }
.${P}-dossier-workspace { min-width:0; min-height:0; grid-column:1 / -1; grid-row:1; display:flex; }
.${P}-dossier-content { width:100%; min-width:0; min-height:0; overflow:auto; scrollbar-width:thin; scrollbar-color:#a88e62 transparent; padding:28px 36px; display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); align-content:start; gap:22px 72px; }
.${P}-dossier-desk[data-overview="true"] .${P}-dossier-workspace { grid-column:2; }
.${P}-dossier-desk[data-overview="true"] .${P}-dossier-content { display:block; }
.${P}-dossier-desk:not([data-overview="true"]) .${P}-dossier-identity { display:none; }
.${P}-dossier-content > * { min-width:0; }
.${P}-dossier-sheet { min-width:0; background:transparent; border:0; border-radius:0; padding:0; box-shadow:none; }
.${P}-dossier-sheet h2, .${P}-dossier-content h2 { display:flex; align-items:center; gap:8px; margin:0 0 18px; padding-bottom:10px; border-bottom:1px solid var(--dossier-line); font:400 30px/1.3 var(--notebook-hand); }
.${P}-dossier-root svg { width:21px; height:21px; flex:0 0 21px; }
.${P}-dossier-tabs { position:absolute; z-index:6; right:calc(-1 * var(--tab-width) - 8px); top:5%; bottom:5%; width:var(--tab-width); }
.${P}-dossier-tabs > div { display:flex; flex-direction:column; justify-content:space-between; gap:8px; height:100%; }
.${P}-dossier-tabs > div button { background:#d9e6aa; border:0; border-radius:1px 4px 4px 1px; box-shadow:2px 3px 4px #39291c35; padding:8px 4px; min-height:44px; height:14%; width:96%; font:400 19px/1.15 var(--notebook-hand); overflow-wrap:normal; transform-origin:left; transform:rotate(1deg); transition:transform 120ms; }
.${P}-dossier-tabs > div button:nth-child(2) { background:#f2b4b1; transform:rotate(-1deg); }
.${P}-dossier-tabs > div button:nth-child(3) { background:#f7df9a; }
.${P}-dossier-tabs > div button:nth-child(4) { background:#d6b9e8; transform:rotate(-1deg); }
.${P}-dossier-tabs > div button:nth-child(5) { background:#efc1a1; }
.${P}-dossier-tabs > div button:nth-child(6) { background:#b9d9ef; transform:rotate(-1deg); }
.${P}-dossier-tabs > div button[aria-pressed="true"] { transform:translateX(5px); box-shadow:2px 3px 5px #39291c50,inset 4px 0 #826f4760; }
.${P}-dossier-tabs .${P}-dossier-inspect { position:absolute; right:0; top:-68px; font-size:14px; display:flex; align-items:center; gap:4px; }
.${P}-dossier-warning { padding:10px; border:1px solid #a86345; background:#f7e3d4; color:#733d2c; }
.${P}-dossier-content > [role="alert"] { grid-column:1 / -1; }
.${P}-dossier-venues, .${P}-dossier-links { display:grid; gap:16px; }
.${P}-dossier-venues article { min-width:0; display:grid; grid-template-columns:120px minmax(0,1fr); align-items:start; gap:14px; border-bottom:1px solid var(--dossier-line); padding-bottom:16px; }
.${P}-dossier-venues article > div:last-child { min-width:0; }
.${P}-dossier-venues h3 { margin:0; font-size:24px; }
.${P}-dossier-venues .${P}-dossier-polaroid { display:block; width:120px; padding:7px; background:#fff9ed; transform:none; box-shadow:0 2px 5px #785a3530; }
.${P}-dossier-polaroid .${P}-pin-photo { display:block; width:100%; height:auto; aspect-ratio:4/3; overflow:hidden; background:#e5dbc9; }
.${P}-dossier-polaroid .${P}-pin-photo-empty { height:100%; }
.${P}-dossier-polaroid .${P}-pin-photo img { width:100%; height:100%; object-fit:contain; }
.${P}-dossier-polaroid .${P}-pin-name { display:none; }
.${P}-dossier-links button { text-align:left; display:grid; grid-template-columns:minmax(0,1fr) auto; gap:4px; }
.${P}-dossier-links button small { grid-column:1; }
.${P}-dossier-links button > span { grid-column:2; grid-row:1 / 3; align-self:center; }
/* Size the portrait against the actual Engine panel, including its chrome. */
.${P}-dossier-book { container-type:size; }
.${P}-dossier-identity { padding:clamp(12px,3cqh,28px) 28px; scrollbar-color:#bda16b transparent; }
.${P}-dossier-portrait { width:min(82%,360px,32cqh); }
.${P}-dossier-journal h1 { font-size:clamp(26px,5cqh,48px); }
.${P}-dossier-biography p { font-size:clamp(16px,3cqh,24px); }
.${P}-signature-image { height:clamp(40px,9cqh,70px); }
/* Section owners supply records. Semantic groups occupy either side of the binding. */
.${P}-dossier-root .${P}-overlay { background:transparent; color:var(--dossier-ink); border:0; padding:0; box-shadow:none; min-width:0; }
.${P}-dossier-content > :is(.villages-relationships,.${P}-overlay), .${P}-dossier-content > .${P}-dossier-sheet:has(.${P}-memory-library), .${P}-dossier-root .${P}-memory-library { display:contents; }
.${P}-dossier-content .villages-relationship-grid { display:contents; }
.${P}-dossier-root .villages-relationship-card, .${P}-dossier-root .villages-relationship-setup { background:transparent; color:var(--dossier-ink); border:0; border-radius:0; padding:0; }
.${P}-dossier-content .villages-relationship-card { grid-column:2; grid-row:1 / span 4; }
.${P}-dossier-root .villages-relationships :is(details,.villages-relationship-tie) { border-color:var(--dossier-line); }
.${P}-dossier-root .villages-relationships :is(input,select) { background:#fff7e7; color:var(--dossier-ink); border-color:#b7a787; }
.${P}-dossier-root .villages-relationship-meter meter { accent-color:#78957c; }
.${P}-dossier-root .${P}-memory-library { --memory-panel:transparent; --memory-ink:#30281f; color:var(--dossier-ink); }
.${P}-dossier-root :is(.${P}-memory-hero,.${P}-memory-card,.${P}-memory-evidence,.${P}-memory-empty) { background:transparent; color:var(--dossier-ink); border:0; border-radius:0; box-shadow:none; padding:0; }
.${P}-dossier-root .${P}-memory-library :is(p,small,dd,dt,h3,strong), .${P}-dossier-root :is(.${P}-story-scope,.${P}-story-meta,.${P}-empty,.${P}-hint) { color:inherit; }
.${P}-dossier-root .${P}-memory-hero { display:block; }
.${P}-dossier-content > .${P}-dossier-sheet:has(.villages-wish-journal), .${P}-dossier-content .villages-wish-journal { display:contents; }
.${P}-dossier-content .villages-wish-journal > style { display:none; }
.${P}-dossier-root .${P}-memory-toolbar { display:flex; flex-wrap:wrap; padding:0; }
.${P}-dossier-root .${P}-memory-stats { flex-wrap:wrap; }
.${P}-dossier-root .${P}-memory-grid { grid-template-columns:minmax(0,1fr); gap:16px; }
.${P}-dossier-root .${P}-memory-card { border-bottom:1px solid var(--dossier-line); padding:12px 0; }
.${P}-dossier-root .${P}-memory-details > summary { background:transparent; border:0; box-shadow:none; padding:8px 0; }
.${P}-dossier-root .${P}-memory-section { min-width:0; }
.${P}-dossier-root .${P}-memory-text { font:400 18px/1.6 var(--notebook-hand); }
.${P}-dossier-root :is(.${P}-memory-card-top,.${P}-memory-section-head,.${P}-memory-pill) { font-size:14px; }
.${P}-dossier-root .${P}-memory-section-head h3 { font-size:23px; }
.${P}-dossier-root .${P}-memory-card-actions { flex-wrap:wrap; }
.${P}-dossier-root :is(.${P}-week,.${P}-wish-card,.${P}-agenda-day) { background:transparent; color:var(--dossier-ink); border-color:var(--dossier-line); }
.${P}-dossier-root .${P}-agenda-compare { display:block; }
.${P}-dossier-root .${P}-agenda-blocks li { grid-template-columns:1fr; background:#f4e6ce; border-color:var(--dossier-line); }
.${P}-dossier-root .${P}-week-toggle h3 { font-size:22px; }
.${P}-dossier-root .${P}-week-body { padding:12px 0; }
.${P}-dossier-root .${P}-agenda-list { display:contents; }
.${P}-dossier-content .${P}-week { grid-column:1 / -1; border:0; }
.${P}-dossier-root .${P}-week-body { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:16px 72px; }
.${P}-dossier-root .${P}-week-body > * { grid-column:1; }
.${P}-dossier-root .${P}-week-body > .${P}-agenda-days { grid-column:2; grid-row:1 / span 12; display:grid; gap:16px; align-content:start; }
.${P}-dossier-turn { pointer-events:none; position:absolute; z-index:4; left:50%; right:0; top:0; bottom:0; transform-origin:left center; border-radius:0 12px 12px 0; background:${paper}; box-shadow:-5px 0 18px #67432150; animation:${P}-page-turn 450ms ease-in-out both; backface-visibility:hidden; }
.${P}-dossier-turn[data-backwards="true"] { animation-name:${P}-page-back; }
@keyframes ${P}-page-turn { 0% { opacity:1; transform:rotateY(0); } 75% { opacity:.9; } 100% { opacity:0; transform:rotateY(-165deg); } }
@keyframes ${P}-page-back { 0% { opacity:1; transform:rotateY(-165deg); } 100% { opacity:0; transform:rotateY(0); } }
.${P}-notebook-session { position:absolute; inset:0; z-index:20; overflow:hidden; isolation:isolate; background-color:#956142; background-image:repeating-linear-gradient(2deg,#47281718 0 2px,transparent 2px 13px),linear-gradient(100deg,#a37450,#895536); }
.${P}-notebook-session::before { content:""; position:absolute; z-index:-1; inset:0 40% 0 -10%; transform:rotate(-5deg); background-color:#37658c; background-image:repeating-linear-gradient(0deg,transparent 0 27px,#e4f0fa40 27px 28px),repeating-linear-gradient(90deg,transparent 0 27px,#e4f0fa40 27px 28px); }
.${P}-notebook-session :is(.${P}-directory-root,.${P}-dossier-root) { background:transparent; }
.${P}-notebook-session :is(.${P}-directory-root,.${P}-dossier-root)::before { display:none; }
.${P}-notebook-motion { height:100%; position:relative; }
.${P}-notebook-close { margin-left:auto; }
.${P}-dossier-toolbar:has(.${P}-notebook-close) { padding-right:110px; }
.${P}-dossier-toolbar .${P}-notebook-close { position:absolute; right:120px; top:0; }
.${P}-dossier-toolbar:has(.${P}-dossier-management) { padding-right:230px; }
.${P}-notebook-session[data-phase="opening"] .${P}-notebook-motion { animation:${P}-book-slide-in 350ms ease-out both; }
.${P}-notebook-session[data-phase="closing"] .${P}-notebook-motion { animation:${P}-book-slide-in 350ms ease-in reverse both; }
@keyframes ${P}-book-slide-in { from { transform:translateX(110vw); } to { transform:translateX(0); } }
.${P}-directory-paper { grid-column:1 / -1; min-width:0; min-height:0; padding:24px 36px; display:flex; flex-direction:column; }
.${P}-directory-head h1 { font-size:38px; margin:0; }
.${P}-directory-tools { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:72px; margin:12px 0 20px; flex:none; }
.${P}-directory-tools input { width:100%; min-width:0; }
.${P}-directory-tools button { justify-self:end; }
.${P}-directory-reading { min-height:0; overflow:auto; scrollbar-width:thin; scrollbar-color:#bda16b transparent; }
.${P}-directory-grid { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:72px; }
.${P}-directory-grid[hidden] { display:none; }
.${P}-directory-page { min-width:0; display:flex; flex-direction:column; gap:12px; }
.${P}-directory-root .${P}-directory-card { width:100%; display:grid; grid-template-columns:80px minmax(0,1fr) 14px; align-items:center; text-align:left; padding:10px; gap:12px; background:#fff9e9b0; box-shadow:0 2px 4px #4b3e2915; }
.${P}-directory-card .${P}-avatar { width:80px; height:80px; max-width:none; border:0; border-radius:0; background:#e6dccb; font-size:38px; }
.${P}-directory-card .${P}-avatar img { width:100%; height:100%; object-fit:cover; }
.${P}-directory-text { min-width:0; }
.${P}-directory-card strong { display:block; font:400 24px var(--notebook-hand); overflow-wrap:anywhere; }
.${P}-directory-card small { display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:2; overflow:hidden; line-height:1.4; }
.${P}-directory-card .${P}-dossier-tags { margin-top:6px; gap:4px; }
.${P}-directory-card .${P}-dossier-tags span { padding:1px 6px; }
.${P}-directory-picker:empty { display:none; }
.${P}-directory-picker .${P}-picker-list { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:16px 72px; }
.${P}-directory-root .${P}-picker-item { background:#f9f0df; color:var(--dossier-ink); min-width:0; flex-wrap:wrap; }
.${P}-directory-picker > .${P}-field > input { width:calc(50% - 36px); margin-bottom:12px; }
@media(max-width:760px) {
  .${P}-dossier-root, .${P}-directory-root { padding:8px; font-size:16px; }
  .${P}-dossier-desk { gap:8px; }
  .${P}-dossier-toolbar { gap:6px; padding-right:78px; min-height:92px; align-content:start; }
  .${P}-dossier-toolbar > * { pointer-events:auto; }
.${P}-dossier-toolbar h1 { font-size:19px; flex-basis:100%; order:3; }
  .${P}-dossier-back { font-size:14px !important; padding:6px 8px !important; }
  .${P}-dossier-management { margin-left:0; }
  .${P}-dossier-management > summary { font-size:14px; padding:6px 8px; }
  .${P}-dossier-controls { position:fixed; right:8px; top:auto; width:min(90vw,520px); }
  .${P}-dossier-book { --tab-width:76px; grid-template-columns:minmax(0,1fr); border-width:6px; border-radius:13px; }
  .${P}-dossier-book::after { display:none; }
  .${P}-dossier-rings { left:0; width:26px; }
  .${P}-dossier-rings span { width:26px; height:12px; }
  .${P}-dossier-identity { padding:16px 14px 16px 20px; }
  .${P}-dossier-journal-content { gap:12px; }
  .${P}-dossier-journal h1 { font-size:29px; }
  .${P}-dossier-portrait { width:min(85%,230px,34cqh); padding:8px 8px 15px; }
  .${P}-dossier-biography p { font-size:17px; }
  .${P}-dossier-biography { max-height:160px; }
  .${P}-signature { margin-top:12px; }
  .${P}-signature-name { font-size:32px; }
  .${P}-signature-controls button { font-size:12px !important; }
  .${P}-dossier-desk[data-overview="true"] .${P}-dossier-workspace { grid-column:1; pointer-events:none; }
  .${P}-dossier-desk[data-overview="true"] .${P}-dossier-content:empty { display:none; }
  .${P}-dossier-desk[data-overview="true"] .${P}-dossier-content:has([role="alert"]) { pointer-events:auto; background:var(--dossier-paper); align-self:end; max-height:50%; }
  .${P}-dossier-tabs { pointer-events:auto; right:calc(-1 * var(--tab-width) - 5px); top:4%; bottom:4%; }
  .${P}-dossier-tabs > div { gap:6px; }
  .${P}-dossier-tabs > div button { font-size:14px; padding:6px 2px; }
  .${P}-dossier-tabs .${P}-dossier-inspect { top:-62px; font-size:12px; padding:6px; }
  .${P}-dossier-content { grid-template-columns:minmax(0,1fr); padding:18px 14px 18px 22px; gap:18px; }
  .${P}-dossier-content h2 { font-size:28px; }
  .${P}-dossier-venues article { grid-template-columns:minmax(0,1fr); }
  .${P}-dossier-content .villages-relationship-card { grid-column:auto; grid-row:auto; }
  .${P}-dossier-root .${P}-agenda-days { grid-template-columns:minmax(0,1fr); gap:12px; }
  .${P}-dossier-root .${P}-week-body { display:block; }
  .${P}-dossier-turn { left:0; }
  .${P}-directory-paper { padding:16px 14px 16px 20px; }
  .${P}-directory-tools { grid-template-columns:minmax(0,1fr); gap:8px; margin:8px 0 14px; }
  .${P}-directory-tools button { justify-self:start; }
  .${P}-directory-card .${P}-avatar { width:48px; height:60px; }
  .${P}-directory-root .${P}-directory-card { grid-template-columns:48px minmax(0,1fr) 10px; gap:8px; padding:8px; }
  .${P}-directory-card strong { font-size:20px; }
  .${P}-directory-card small { font-size:14px; }
  .${P}-directory-card .${P}-dossier-tags { display:none; }
  .${P}-directory-page { gap:10px; }
  .${P}-directory-picker .${P}-picker-list { grid-template-columns:minmax(0,1fr); gap:12px; }
  .${P}-directory-picker > .${P}-field > input { width:100%; }
  .${P}-dossier-toolbar .${P}-notebook-close { top:48px; right:84px; font-size:14px; padding:6px 8px; }
  .${P}-dossier-toolbar:has(.${P}-dossier-management) { padding-right:0; min-height:92px; align-content:start; }
  .${P}-dossier-toolbar:has(.${P}-dossier-management) .${P}-notebook-close { top:48px; }
  .${P}-directory-head h1 { font-size:32px; }
  .${P}-directory-grid { grid-template-columns:minmax(0,1fr); gap:16px; }
}
@media(prefers-reduced-motion:reduce) {
  .${P}-dossier-turn { display:none !important; }
  .${P}-dossier-root *, .${P}-directory-root * { transition:none !important; animation:none !important; }
  .${P}-notebook-motion, .${P}-notebook-session .${P}-dossier-book { animation:none !important; }
}
`;
